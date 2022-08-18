import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import Layout from '../../components/Layout';
import { Question } from '../../models/Question';
import { useAuthenticate } from '../../hooks/authentication';
import { Answer } from '../../models/Answer';

type Query = {
  id: string;
};
const getCollections = () => {
  const db = getFirestore();
  return {
    db,
    questionsCollection: collection(db, 'questions'),
    answersCollection: collection(db, 'answers'),
  };
};

export default function QuestionsShow() {
  const [body, setBody] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const routerQuery = router.query as Query;
  const { user } = useAuthenticate();
  const answer = useRef<Answer | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !question) return;
    setIsSending(true);

    const { db, questionsCollection, answersCollection } = getCollections();
    const answerRef = doc(answersCollection);

    const answerSnapshot = await getDocs(
      query(
        answersCollection,
        where('questionId', '==', routerQuery.id),
        where('uid', '==', user.uid)
      )
    );
    if (!answerSnapshot.empty) {
      alert('回答済みだよ！');
      setIsSending(false);
      setBody('');
      return;
    }

    await runTransaction(db, async (t) => {
      t.set(answerRef, {
        uid: user.uid,
        questionId: question.id,
        body,
        createdAt: serverTimestamp(),
      });
      t.update(doc(questionsCollection, question.id), {
        isReplied: true,
      });
    });
    setBody('');
    setIsSending(false);
    alert('回答しました！画面を更新すると回答が表示されます！');
  };

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      if (routerQuery.id === undefined) return;
      const { questionsCollection, answersCollection } = getCollections();
      const questionDoc = await getDoc(
        doc(questionsCollection, routerQuery.id)
      );
      if (!questionDoc.exists()) return;
      const gotQuestion = questionDoc.data() as Question;
      gotQuestion.id = questionDoc.id;

      if (gotQuestion.isReplied) {
        const answerSnapshot = await getDocs(
          query(
            answersCollection,
            where('questionId', '==', gotQuestion.id),
            limit(1)
          )
        );
        if (!answerSnapshot.empty) {
          const gotAnswer = answerSnapshot.docs[0].data() as Answer;
          gotAnswer.id = answerSnapshot.docs[0].id;
          answer.current = gotAnswer;
        }
      }
      setQuestion(gotQuestion);
    };

    loadData();
  }, [routerQuery.id, user]);

  return (
    <Layout>
      <div className='row justify-content-center'>
        <div className='col-12 col-md-6'>
          {question && (
            <>
              <div className='card'>
                <div className='card-body'>{question.body}</div>
              </div>
              <section className='text-center mt-4'>
                <h2 className='h4'>回答</h2>
                {answer.current === null ? (
                  <form onSubmit={onSubmit}>
                    <textarea
                      className='form-control'
                      placeholder='おげんきですか？'
                      rows={6}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                    ></textarea>
                    <div className='m-3'>
                      {isSending ? (
                        <div
                          className='spinner-border text-secondary'
                          role='status'
                        ></div>
                      ) : (
                        <button type='submit' className='btn btn-primary'>
                          回答する
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className='card'>
                    <div className='card-body text-left'>
                      {answer.current.body}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
