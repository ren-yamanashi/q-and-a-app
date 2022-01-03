//URL にパラメータを動的に含めてそれを利用する
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { User } from "../../models/User";
import Layout from "../../components/Layout"; //共通コンポーネントをインポート
import { useAuthentication } from "../../hooks/authentication";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

//query の型も準備
type Query = {
  uid: string;
};

export default function UserShow() {
  //取得したユーザーを保持するステートを準備
  //ユーザーログインの様に共通ではないため、Recoil ではなく React 自体の useState を使います
  const [user, setUser] = useState<User>(null);
  const router = useRouter();
  const query = router.query as Query;
  //textarea の入力をステートに保存 また、ログイン中のユーザーも取得
  const { user: currentUser } = useAuthentication();
  const [body, setBody] = useState("");
  //送信中かどうかのフラグを追加
  const [isSending, setIsSending] = useState(false);

  /*=======================================
  送信用関数を作成
  =======================================*/
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); //イベント用の型をインポート
    setIsSending(true); //ボタンを押した直後に呼び出してフラグを切り替える

    const db = getFirestore();
    //Firestore 保存用のメソッドもインポート
    await addDoc(collection(db, "questions"), {
      senderUid: currentUser.uid,
      receiverUid: user.uid,
      body,
      isReplied: false, //回答したかどうかのフラグ
      createdAt: serverTimestamp(),
    });
    setIsSending(false); //登録が終わったタイミングで呼び出してフラグを切り替える
    setBody(""); //投稿が完了したら body を空にしてメッセージを表示
    alert("質問を送信しました。");
  }

  /*==========================================
  ユーザー情報を作成する関数を作成
  ========================================== */
  useEffect(() => {
    //初回レンダリングを考慮するために query に値がある場合だけ処理するように調整
    if (query.uid === undefined) {
      return;
    }
    async function loadUser() {
      const db = getFirestore();
      const ref = doc(collection(db, "users"), query.uid);
      const userDoc = await getDoc(ref);

      if (!userDoc.exists()) {
        return;
      }
      const gotUser = userDoc.data() as User;
      gotUser.uid = userDoc.id;
      setUser(gotUser);
    }
    loadUser();
    //ブラウザ表示時に何もしてくれないためユーザーの読み込みが行われるように useEffect の第二引数も変える
  }, [query.uid]);
  return (
    <Layout>
      {user && (
        <div className="text-center">
          <h1 className="h4">{user.name}さんのページ</h1>
          <div className="m-5">{user.name}さんに質問しよう！</div>
        </div>
      )}
      {/* // 投稿のためのフォームを作成 */}
      <div className="row justify-content-center mb-3">
        <div className="col-12 col-md-6">
          <form onSubmit={onSubmit}>
            {/* value と onChange で連動 */}
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
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <button type="submit" className="btn btn-primary">
                  質問を送信する
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
