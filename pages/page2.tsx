import { getAuth } from 'firebase/auth';
import Head from 'next/head';
import Link from 'next/link';
import { useSetRecoilState } from 'recoil';
import { useAuthenticate } from '../hooks/authentication';

export default function Home() {
  //const { user } = useAuthenticate();
  // const setUser = useSetRecoilState(userState);

  // const signOut = () => {
  //   const auth = getAuth();
  //   auth.signOut().then(() => setUser(null));
  // };

  return (
    <div>
      <Head>
        <title>Page2</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {/* <p>{user?.uid || '未ログイン'}</p> */}
      {/* <button onClick={() => signOut()}>サインアウト</button> */}
      <Link href='/'>
        <a>Go Back</a>
      </Link>
    </div>
  );
}
