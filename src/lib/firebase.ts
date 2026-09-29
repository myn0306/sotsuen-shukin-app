import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, Firestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

// ユーザー指定のFirebaseプロジェクト（sotsuen-shukin）のデフォルト値
const fallbackConfig = {
  apiKey: "AIzaSyBLotuDF0fTMQn6-OwuHFxzty3ImE2edTo",
  authDomain: "sotsuen-shukin.firebaseapp.com",
  projectId: "sotsuen-shukin",
  storageBucket: "sotsuen-shukin.firebasestorage.app",
  messagingSenderId: "205368527342",
  appId: "1:205368527342:web:97407552e069890fefa6ff",
  measurementId: "G-9D0X0XP8GW",
};

// 環境変数（.env）からの取得を優先し、未設定の場合は上記構成または appletConfig から取得
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId || appletConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || fallbackConfig.measurementId,
};

export const FIRESTORE_COLLECTION = 'collections';
export const FIRESTORE_DOC_ID = 'main';

const databaseId =
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  appletConfig.firestoreDatabaseId ||
  '(default)';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore =
  databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);

// エラーハンドリング用の列挙型とインターフェース
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 接続確認テスト
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently offline or connecting...');
      return false;
    }
    return true;
  }
}

