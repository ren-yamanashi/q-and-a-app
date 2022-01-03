//URL にパラメータを動的に含めてそれを利用する
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "../../models/User";

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
  return <div>{user ? user.name : "ロード中..."}</div>;
}
