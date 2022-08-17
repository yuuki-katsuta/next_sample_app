import { collection, doc, getDoc, getFirestore } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { User } from '../../models/User';
import Layout from '../../components/Layout';

type Query = {
  uid: string;
};
export default function UserShow() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const query = router.query as Query;

  useEffect(() => {
    let isMounted = false;
    const loadUser = async () => {
      if (query.uid === undefined) return;
      const db = getFirestore();
      const ref = doc(collection(db, 'users'), query.uid);
      const userDoc = await getDoc(ref);
      if (!userDoc.exists()) return;
      const getUser = userDoc.data() as User;
      isMounted || setUser(getUser);
    };
    loadUser();
    return () => {
      isMounted = true;
    };
  }, [query.uid]);

  return (
    <Layout>
      {user && (
        <div className='text-center'>
          <h1>{user.name}さんのページ</h1>
          <div className='m-5'>{user.name}さんに質問しよう！</div>
        </div>
      )}
    </Layout>
  );
}
