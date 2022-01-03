//[uid].tsx を元に作成
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { FormEvent, useEffect, useState } from "react";
import Layout from "../../components/Layout";
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
  Timestamp,
  where,
} from "firebase/firestore";

import { Answer } from "../../models/Answer";
import { Question } from "../../models/Question";
import { useAuthentication } from "../../hooks/authentication";

type Query = {
  id: string;
};

export default function QuestionsShow() {
  const router = useRouter();
  const routerQuery = router.query as Query;
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuthentication();
  const [question, setQuestion] = useState<Question>(null);
  const [answer, setAnswer] = useState<Answer>(null);
  //textarea の入力をステートに保存 また、ログイン中のユーザーも取得
  const { user: currentUser } = useAuthentication();
  const [body, setBody] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSending(true);

    const { db, questionsCollection, answersCollection } = getCollections();
    const answerRef = doc(answersCollection);

    await runTransaction(db, async (t) => {
      t.set(answerRef, {
        uid: user.uid,
        questionId: question.id,
        body,
        createdAt: serverTimestamp(),
      });
      t.update(doc(questionsCollection, question.id), {
        isReplied: true, //質問データの isReplied も true に更新
      });
    });

    setIsSending(false);
    //回答時の表示更新
    const now = new Date().getTime();
    setAnswer({
      id: "",
      uid: user.uid,
      questionId: question.id,
      body,
      createdAt: new Timestamp(now / 1000, now % 1000),
    });
  }

  function getCollections() {
    const db = getFirestore();
    return {
      db,
      questionsCollection: collection(db, "questions"),
      answersCollection: collection(db, "answers"),
    };
  }

  async function loadData() {
    if (routerQuery.id === undefined) {
      return;
    }

    const { questionsCollection, answersCollection } = getCollections();
    const questionDoc = await getDoc(doc(questionsCollection, routerQuery.id));
    if (!questionDoc.exists()) {
      return;
    }

    const gotQuestion = questionDoc.data() as Question;
    gotQuestion.id = questionDoc.id;
    setQuestion(gotQuestion);

    //回答データがある場合はフォームの代わりに回答を表示
    if (!gotQuestion.isReplied) {
      return;
    }

    const answerSnapshot = await getDocs(
      query(
        answersCollection,
        where("questionId", "==", gotQuestion.id),
        limit(1)
      )
    );
    if (answerSnapshot.empty) {
      return;
    }

    const gotAnswer = answerSnapshot.docs[0].data() as Answer;
    gotAnswer.id = answerSnapshot.docs[0].id;
    setAnswer(gotAnswer);
  }

  useEffect(() => {
    loadData();
  }, [routerQuery.id]);

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          {question && (
            <>
              <div className="card">
                <div className="card-body">{question.body}</div>
              </div>

              {/* 回答フォームの作成 */}
              <section className="text-center mt-4">
                <h2 className="h4">回答</h2>

                {answer === null ? (
                  <form onSubmit={onSubmit}>
                    <textarea
                      className="form-control"
                      placeholder="おげんきですか？"
                      rows={6}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                    ></textarea>
                    <div className="m-3">
                      {isSending ? (
                        <div
                          className="spinner-border text-secondary"
                          role="status"
                        ></div>
                      ) : (
                        <button type="submit" className="btn btn-primary">
                          回答する
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="card">
                    <div className="card-body text-left">{answer.body}</div>
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
