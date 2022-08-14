import { getApps, initializeApp } from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

//nextがサーバー側で実行しないように/何度も初期化されないようにするため
if (typeof window !== 'undefined' && getApps().length === 0) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STOREGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
  };

  initializeApp(firebaseConfig);
}
