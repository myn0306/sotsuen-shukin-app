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

export function useWarikanSync() {
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);

  // 最後の書き込み中フラグ（Firestoreからの自分自身の変更のバウンスバック防止）
  const isWritingRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // オンライン/オフラインの検知
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('syncing');
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
            await setDoc(docRef, {
              teachers: INITIAL_TEACHERS,
              participants: INITIAL_PARTICIPANTS,
              updatedAt: new Date().toISOString(),
            });
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

        const data = snapshot.data() as WarikanDocumentData;

        // 書き込み中でない場合、もしくは他ユーザーからの更新の場合は反映
        if (!isWritingRef.current) {
          if (Array.isArray(data.teachers)) {
            setTeachers(data.teachers);
          }
          if (Array.isArray(data.participants)) {
            setParticipants(data.participants);
          }
        }

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

  // Firestore への保存関数
  const saveToFirestore = useCallback(
    async (nextTeachers: Teacher[], nextParticipants: Participant[]) => {
      if (!navigator.onLine) {
        setSyncStatus('offline');
      } else {
        setSyncStatus('syncing');
      }

      isWritingRef.current = true;
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
        await setDoc(docRef, {
          teachers: nextTeachers,
          participants: nextParticipants,
          updatedAt: new Date().toISOString(),
        });

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
        setTimeout(() => {
          isWritingRef.current = false;
        }, 150);
      }
    },
    []
  );

  // 先生・備品データの更新（即時 or デバウンス）
  const updateTeachers = useCallback(
    (newTeachers: Teacher[] | ((prev: Teacher[]) => Teacher[]), immediate = false) => {
      setTeachers((prev) => {
        const resolvedTeachers = typeof newTeachers === 'function' ? newTeachers(prev) : newTeachers;

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        if (immediate) {
          saveToFirestore(resolvedTeachers, participants);
        } else {
          setSyncStatus('syncing');
          saveTimeoutRef.current = setTimeout(() => {
            saveToFirestore(resolvedTeachers, participants);
          }, 350);
        }

        return resolvedTeachers;
      });
    },
    [participants, saveToFirestore]
  );

  // 保護者データの更新（即時 or デバウンス）
  const updateParticipants = useCallback(
    (newParticipants: Participant[] | ((prev: Participant[]) => Participant[]), immediate = true) => {
      setParticipants((prev) => {
        const resolvedParticipants =
          typeof newParticipants === 'function' ? newParticipants(prev) : newParticipants;

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        if (immediate) {
          saveToFirestore(teachers, resolvedParticipants);
        } else {
          setSyncStatus('syncing');
          saveTimeoutRef.current = setTimeout(() => {
            saveToFirestore(teachers, resolvedParticipants);
          }, 350);
        }

        return resolvedParticipants;
      });
    },
    [teachers, saveToFirestore]
  );

  // サンプルデータへリセット
  const resetToSample = useCallback(async () => {
    setTeachers(INITIAL_TEACHERS);
    setParticipants(INITIAL_PARTICIPANTS);
    await saveToFirestore(INITIAL_TEACHERS, INITIAL_PARTICIPANTS);
  }, [saveToFirestore]);

  // 全てクリアして新規作成
  const clearAll = useCallback(async () => {
    const emptyTeacher: Teacher = {
      id: `t-${Date.now()}`,
      name: '担任の先生',
      role: '担任',
      color: '#FFDFE7',
      items: [],
    };
    const emptyTeachers = [emptyTeacher];
    const emptyParticipants: Participant[] = [];

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
  };
}
