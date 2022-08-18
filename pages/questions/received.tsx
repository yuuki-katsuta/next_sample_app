import dayjs from 'dayjs';
import {
  collection,
  DocumentData,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QuerySnapshot,
  startAfter,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import { useAuthenticate } from '../../hooks/authentication';
import { Question } from '../../models/Question';
import InfiniteScroll from 'react-infinite-scroller';
import Link from 'next/link';

export default function QuestionsReceived() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuthenticate();
  const scrollContainerRef = useRef(null);

  const loadMore = useCallback(async () => {
    const createBaseQuery = () => {
      const db = getFirestore();

      return query(
        collection(db, 'questions'),
        where('receiverUid', '==', user?.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
    };

    function appendQuestions(snapshot: QuerySnapshot<DocumentData>) {
      const gotQuestions = snapshot.docs.map((doc) => {
        const question = doc.data() as Question;
        question.id = doc.id;
        return question;
      });
      setQuestions(questions.concat(gotQuestions));
    }

    const lastQuestion = questions[questions.length - 1];
    const data = !questions.length
      ? await getDocs(query(createBaseQuery()))
      : await getDocs(
          query(createBaseQuery(), startAfter(lastQuestion.createdAt))
        );
    //データ件数が0件の場合、処理終了
    if (data.empty) {
      setHasMore(false);
      return;
    }
    //取得データをリストに追加
    appendQuestions(data);
  }, [questions, user]);

  const loader = (
    <p className='loader text-center mt-5' key={0}>
      Loading ...
    </p>
  );

  return (
    <Layout>
      <h1 className='h4'>受け取った質問一覧</h1>
      <div className='row justify-content-center'>
        <div className='col-12 col-md-6' ref={scrollContainerRef}>
          {user && (
            <InfiniteScroll
              loadMore={loadMore}
              hasMore={hasMore}
              loader={loader}
            >
              {questions.map((question) => (
                <Link href={`${question.id}`} key={question.id}>
                  <a>
                    <div className='card my-3'>
                      <div className='card-body'>
                        <div className='text-truncate'>{question.body}</div>
                      </div>
                      <div className='text-muted text-end pe-2'>
                        <small>
                          {dayjs(question.createdAt.toDate()).format(
                            'YYYY/MM/DD HH:mm'
                          )}
                        </small>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </Layout>
  );
}
