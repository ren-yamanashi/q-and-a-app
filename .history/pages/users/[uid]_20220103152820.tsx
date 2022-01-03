//URL にパラメータを動的に含めてそれを利用する
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "../../models/User";
import Layout from "../../components/Layout"; //共通コンポーネントをインポート

import { collection, doc, getDoc, getFirestore } from "firebase/firestore";

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
          <form>
            <textarea
              className="form-control"
              placeholder="おげんきですか？"
              rows={6}
              required
            ></textarea>
            <div className="m-3">
              <button type="submit" className="btn btn-primary">
                質問を送信する
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
