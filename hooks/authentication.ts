import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { User } from '../models/User';

const userState = atom<User | null>({
  key: 'currentUser',
  default: null,
});

const createUserIfNotFound = async (user: User) => {
  const db = getFirestore();
  //コレクションへの参照
  const usersCollection = collection(db, 'users');
  //ドキュメントへの参照
  const userRef = doc(usersCollection, user.uid);
  //単一ドキュメントデータを取得
  const document = await getDoc(userRef);
  //nullチェック
  if (document.exists()) {
    return;
  }
  //ドキュメントIDを指定してデータを追加
  await setDoc(userRef, {
    name: 'taro' + new Date().getTime(),
    uid: user.uid,
  });
};

export function useAuthenticate() {
  const [user, setUser] = useRecoilState(userState);
  useEffect(() => {
    if (user !== null) return;
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const loginUser: User = {
          uid: user.uid,
          name: '',
          isAnonymous: user.isAnonymous,
        };
        setUser(loginUser);
        createUserIfNotFound(loginUser);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error(error);
        });
      }
    });
  }, [setUser, user]);

  return { user };
}
