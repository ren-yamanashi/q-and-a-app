import { useEffect, useRef, useState } from "react";
import { Question } from "../../models/Question";
import Layout from "../../components/Layout";
import dayjs from "dayjs";
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
} from "firebase/firestore";
import { useAuthentication } from "../../hooks/authentication";

export default function QuestionsReceived() {
  const { user } = useAuthentication(); //useAuthentication から取得したログインユーザーの値を使う → エラーを出さずに処理できる
  //取得した質問一覧を保持しておくためのステートを準備   ステートは Question[] という Question の配列データとして指定
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPaginationFinished, setIsPaginationFinished] = useState(false); //全ての読み込みが完了したかどうかのフラグを作成
  const scrollContainerRef = useRef(null); //スクロールの計算のために質問一覧を囲んでいるコンテナを参照  DOM の参照を行うためには useRef を利用
  /*======================================質問を取得する関数を作成======================================*/
  /*============================================
  クエリを作っている部分を createBaseQuery として共通化
  ==============================================*/
  function createBaseQuery() {
    const db = getFirestore();
    return query(
      collection(db, "questions"),
      where("receiverUid", "==", user.uid), //自分が受信したデータのみを取得するように where で条件を指定
      orderBy("createdAt", "desc"), //作成日時である createdAt の降順でデータを取得
      limit(10) //一旦 10件まで取得　（スクロールされたら追加分を取得する）
    );
  }

  function appendQuestions(snapshot: QuerySnapshot<DocumentData>) {
    const gotQuestions = snapshot.docs.map((doc) => {
      const question = doc.data() as Question;
      question.id = doc.id;
      return question;
    });
    setQuestions(questions.concat(gotQuestions));
  }
  /*==========================================
  最初の10件を取得する関数を作成
  =============================================*/
  async function loadQuestions() {
    const snapshot = await getDocs(createBaseQuery()); //複数データを取得するため doc を取得するのではなく、snapshot を取得
    if (snapshot.empty) {
      //empty プロパティで空かどうかを判断
      return;
    }
    appendQuestions(snapshot);
  }
  /*==========================================
  追加分を取得する関数を作成
  =============================================*/
  async function loadNextQuestions() {
    if (questions.length === 0) {
      return;
    }
    const lastQuestion = questions[questions.length - 1];
    const snapshot = await getDocs(
      query(createBaseQuery(), startAfter(lastQuestion.createdAt)) //startAfter を追加することで現在取得済みの値移行のデータを取得
    );
    if (snapshot.empty) {
      return;
    }

    appendQuestions(snapshot);
  }
  useEffect(() => {
    if (!process.browser) {
      return;
    }
    if (user === null) {
      return;
    }

    //   const gotQuestions = snapshot.docs.map((doc) => {
    //     const question = doc.data() as Question;
    //     question.id = doc.id;
    //     return question;
    //   });
    //   setQuestions(gotQuestions);
    // }

    loadQuestions();
  }, [process.browser, user]);

  return (
    <Layout>
      <h1 className="h4">受け取った質問一覧</h1>

      <div className="row justify-content-center">
        <div className="col-12 col-md-6" ref={scrollContainerRef}>
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
