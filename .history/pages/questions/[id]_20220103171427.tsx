import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import Layout from "../../components/Layout";
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
        isReplied: true,
      });
    });

    setIsSending(false);
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
  }

  useEffect(() => {
    loadData();
  }, [routerQuery.id]);

  return (
    <Layout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          {question && (
            <div className="card">
              <div className="card-body">{question.body}</div>
            </div>
          )}
        </div>
        {/* 回答フォームの作成 */}
        <section className="text-center mt-4">
          <h2 className="h4">回答する</h2>

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
        </section>
      </div>
    </Layout>
  );
}
