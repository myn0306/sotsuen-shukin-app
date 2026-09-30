import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
  FIRESTORE_COLLECTION,
  FIRESTORE_DOC_ID,
} from '../lib/firebase';
import { Teacher, Participant } from '../types';
import { INITIAL_TEACHERS, INITIAL_PARTICIPANTS } from '../data/sampleData';

export type SyncStatus = 'loading' | 'syncing' | 'saved' | 'offline' | 'error';

interface WarikanDocumentData {
  teachers: Teacher[];
  participants: Participant[];
  updatedAt?: string;
}

const DOC_PATH = `${FIRESTORE_COLLECTION}/${FIRESTORE_DOC_ID}`;

// 入力が止まってからFirestoreへ書き込むまでの待機時間（0.8秒）
const DEBOUNCE_DELAY_MS = 800;

function serializeData(teachers: Teacher[], participants: Participant[]): string {
  return JSON.stringify({ teachers, participants });
}

export function useWarikanSync() {
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);

  // 最新のローカル状態を保持するRef（クロージャ内の古い値参照を防止）
  const latestTeachersRef = useRef<Teacher[]>(INITIAL_TEACHERS);
  const latestParticipantsRef = useRef<Participant[]>(INITIAL_PARTICIPANTS);

  // デバウンス用のタイマーRef
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 最後にFirestoreに正常保存した（または初期化した）データのシグネチャ
  const lastWrittenDataRef = useRef<string>('');

  // Firestoreへの書き込み中フラグ（通信中）
  const isWritingRef = useRef<boolean>(false);

  // オンライン/オフラインの検知
  useEffect(() => {
    const handleOnline = () => {
      testFirestoreConnection().then((ok) => {
        if (ok) setSyncStatus('saved');
        else setSyncStatus('offline');
      });
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Firestore への保存関数（実際に通信を行う）
  const saveToFirestore = useCallback(
    async (nextTeachers: Teacher[], nextParticipants: Participant[]) => {
      const signature = serializeData(nextTeachers, nextParticipants);
      if (signature === lastWrittenDataRef.current) {
        // 直前に保存したデータと完全に同じであれば不要な通信をスキップ
        return;
      }

      if (!navigator.onLine) {
        setSyncStatus('offline');
        return;
      }

      // 【要件4】実際にFirestoreへの書き込みが行われるタイミングでステータスを「同期中」に切り替え
      setSyncStatus('syncing');
      isWritingRef.current = true;

      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
        await setDoc(docRef, {
          teachers: nextTeachers,
          participants: nextParticipants,
          updatedAt: new Date().toISOString(),
        });

        lastWrittenDataRef.current = signature;
        setSyncStatus('saved');
        setErrorMessage(null);
      } catch (err) {
        console.error('Save to firestore error:', err);
        if (!navigator.onLine || (err instanceof Error && err.message.includes('offline'))) {
          setSyncStatus('offline');
        } else {
          setSyncStatus('error');
          setErrorMessage('保存に失敗しました');
        }
        handleFirestoreError(err, OperationType.WRITE, DOC_PATH);
      } finally {
        // ローカルイベントループが落ち着くまで少し待機してから解除
        setTimeout(() => {
          isWritingRef.current = false;
        }, 300);
      }
    },
    []
  );

  // 未保存のデバウンスキューを即時フラッシュ
  const flushPendingSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
      await saveToFirestore(latestTeachersRef.current, latestParticipantsRef.current);
    }
  }, [saveToFirestore]);

  // ページ離脱・リロード時の安全なフラッシュ
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        saveToFirestore(latestTeachersRef.current, latestParticipantsRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveToFirestore]);

  // Firestore のリアルタイム購読（onSnapshot）
  useEffect(() => {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);

    // 接続テストも並行実行
    testFirestoreConnection();

    const unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          // ドキュメントがまだ無ければ初期データを作成
          try {
            setSyncStatus('syncing');
            const initialSignature = serializeData(INITIAL_TEACHERS, INITIAL_PARTICIPANTS);
            await setDoc(docRef, {
              teachers: INITIAL_TEACHERS,
              participants: INITIAL_PARTICIPANTS,
              updatedAt: new Date().toISOString(),
            });
            lastWrittenDataRef.current = initialSignature;
            latestTeachersRef.current = INITIAL_TEACHERS;
            latestParticipantsRef.current = INITIAL_PARTICIPANTS;
            setTeachers(INITIAL_TEACHERS);
            setParticipants(INITIAL_PARTICIPANTS);
            setSyncStatus('saved');
            setIsInitialLoaded(true);
          } catch (err) {
            setSyncStatus('error');
            setErrorMessage('初期データの作成に失敗しました');
            handleFirestoreError(err, OperationType.WRITE, DOC_PATH);
          }
          return;
        }

        // 【要件5 最適化】
        // 1. 自分自身のローカルキャッシュ先行書き込みイベント（pendingWrites）はスキップ
        if (snapshot.metadata.hasPendingWrites) {
          return;
        }

        // 2. 自クライアントが現在書き込み通信中の場合はスキップ
        if (isWritingRef.current) {
          return;
        }

        // 3. ユーザーが現在デバウンス待機中でテキスト入力している最中の場合は上書きしない
        if (saveTimeoutRef.current !== null) {
          return;
        }

        const data = snapshot.data() as WarikanDocumentData;
        const incomingTeachers = Array.isArray(data.teachers) ? data.teachers : [];
        const incomingParticipants = Array.isArray(data.participants) ? data.participants : [];
        const incomingSignature = serializeData(incomingTeachers, incomingParticipants);

        // 4. 現在のローカル状態、または直前に保存した内容と完全一致している場合は再描画を完全にスキップ
        const currentLocalSignature = serializeData(
          latestTeachersRef.current,
          latestParticipantsRef.current
        );

        if (
          incomingSignature === currentLocalSignature ||
          incomingSignature === lastWrittenDataRef.current
        ) {
          // 内容が変わっていないため、setTeachers / setParticipants を呼ばず不要な再描画を防止
          setIsInitialLoaded(true);
          setSyncStatus('saved');
          setErrorMessage(null);
          return;
        }

        // 5. 他ユーザーまたは他端末からの新規更新のみ反映
        latestTeachersRef.current = incomingTeachers;
        latestParticipantsRef.current = incomingParticipants;
        lastWrittenDataRef.current = incomingSignature;

        setTeachers(incomingTeachers);
        setParticipants(incomingParticipants);
        setIsInitialLoaded(true);
        setSyncStatus('saved');
        setErrorMessage(null);
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error);
        if (!navigator.onLine || error.message?.includes('offline')) {
          setSyncStatus('offline');
        } else {
          setSyncStatus('error');
          setErrorMessage('データの取得に失敗しました');
        }
        handleFirestoreError(error, OperationType.GET, DOC_PATH);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 先生・備品データの更新（即時 or デバウンス）
  const updateTeachers = useCallback(
    (newTeachers: Teacher[] | ((prev: Teacher[]) => Teacher[]), immediate = false) => {
      const resolvedTeachers =
        typeof newTeachers === 'function' ? newTeachers(latestTeachersRef.current) : newTeachers;

      // 【要件1】まずローカルの画面表示（React State）を即座に更新（遅延ゼロで軽快に入力）
      latestTeachersRef.current = resolvedTeachers;
      setTeachers(resolvedTeachers);

      // 既存のデバウンスタイマーをクリア
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      if (immediate) {
        // 【要件3】ワンタップ操作等は即座に反映・保存
        saveToFirestore(resolvedTeachers, latestParticipantsRef.current);
      } else {
        // 【要件2】0.8秒（0.6〜1秒）入力が止まったタイミングで1回だけ書き込み
        // 【要件4】タイマー待機中は syncStatus を変更せず、書き込み開始時に「同期中」へ切り替え
        saveTimeoutRef.current = setTimeout(() => {
          saveTimeoutRef.current = null;
          saveToFirestore(latestTeachersRef.current, latestParticipantsRef.current);
        }, DEBOUNCE_DELAY_MS);
      }
    },
    [saveToFirestore]
  );

  // 保護者データの更新（即時 or デバウンス）
  const updateParticipants = useCallback(
    (newParticipants: Participant[] | ((prev: Participant[]) => Participant[]), immediate = true) => {
      const resolvedParticipants =
        typeof newParticipants === 'function'
          ? newParticipants(latestParticipantsRef.current)
          : newParticipants;

      // 【要件1】まずローカルの画面表示（React State）を即座に更新
      latestParticipantsRef.current = resolvedParticipants;
      setParticipants(resolvedParticipants);

      // 既存のデバウンスタイマーをクリア
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      if (immediate) {
        // 【要件3】ワンタップ操作等は即座に反映・保存
        saveToFirestore(latestTeachersRef.current, resolvedParticipants);
      } else {
        // 【要件2】デバウンス書き込み
        saveTimeoutRef.current = setTimeout(() => {
          saveTimeoutRef.current = null;
          saveToFirestore(latestTeachersRef.current, latestParticipantsRef.current);
        }, DEBOUNCE_DELAY_MS);
      }
    },
    [saveToFirestore]
  );

  // サンプルデータへリセット
  const resetToSample = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    latestTeachersRef.current = INITIAL_TEACHERS;
    latestParticipantsRef.current = INITIAL_PARTICIPANTS;
    setTeachers(INITIAL_TEACHERS);
    setParticipants(INITIAL_PARTICIPANTS);
    await saveToFirestore(INITIAL_TEACHERS, INITIAL_PARTICIPANTS);
  }, [saveToFirestore]);

  // 全てクリアして新規作成
  const clearAll = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const emptyTeacher: Teacher = {
      id: `t-${Date.now()}`,
      name: '担任の先生',
      role: '担任',
      color: '#FFDFE7',
      items: [],
    };
    const emptyTeachers = [emptyTeacher];
    const emptyParticipants: Participant[] = [];

    latestTeachersRef.current = emptyTeachers;
    latestParticipantsRef.current = emptyParticipants;
    setTeachers(emptyTeachers);
    setParticipants(emptyParticipants);
    await saveToFirestore(emptyTeachers, emptyParticipants);
  }, [saveToFirestore]);

  return {
    teachers,
    participants,
    updateTeachers,
    updateParticipants,
    syncStatus,
    errorMessage,
    isInitialLoaded,
    resetToSample,
    clearAll,
    flushPendingSave,
  };
}
