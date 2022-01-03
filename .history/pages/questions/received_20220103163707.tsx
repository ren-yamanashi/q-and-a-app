import { useEffect, useState } from "react";
import { Question } from "../../models/Question";
import Layout from "../../components/Layout";
import dayjs from "dayjs";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { useAuthentication } from "../../hooks/authentication";

export default function QuestionsReceived() {
  const { user } = useAuthentication(); //useAuthentication から取得したログインユーザーの値を使う → エラーを出さずに処理できる
  //取得した質問一覧を保持しておくためのステートを準備   ステートは Question[] という Question の配列データとして指定
  const [questions, setQuestions] = useState<Question[]>([]);
  /*======================================
質問を取得する関数を作成
======================================*/
  //ログイン状態になっていない場合は useEffect を実行しない
  useEffect(() => {
    if (!process.browser) {
      return;
    }
    if (user === null) {
      return;
    }

    async function loadQuestions() {
      const db = getFirestore();
      const q = query(
        collection(db, "questions"),
        where("receiverUid", "==", user.uid) //自分が受信したデータのみを取得するように where で条件を指定
      );
      const snapshot = await getDocs(q); //複数データを取得するため doc を取得するのではなく、snapshot を取得

      if (snapshot.empty) {
        //empty プロパティで空かどうかを判断
        return;
      }

      const gotQuestions = snapshot.docs.map((doc) => {
        const question = doc.data() as Question;
        question.id = doc.id;
        return question;
      });
      setQuestions(gotQuestions);
    }

    loadQuestions();
  }, [process.browser, user]);

  return (
    <Layout>
      <h1 className="h4">受け取った質問一覧</h1>

      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          {questions.map((question) => (
            <div className="card my-3" key={question.id}>
              <div className="card-body">
                {/* text-truncate は文字が長すぎる場合に行末で省略 */}
                <div className="text-truncate">{question.body}</div>
              </div>
              <div className="text-muted text-end">
                <small>
                  {dayjs(question.createdAt.toDate()).format(
                    "YYYY/MM/DD HH:mm"
                  )}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
