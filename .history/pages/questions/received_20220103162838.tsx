import { useEffect, useState } from "react";
import { Question } from "../../models/Question";
import Layout from "../../components/Layout";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { useAuthentication } from "../../hooks/authentication";

export default function QuestionsReceived() {
  const { user } = useAuthentication();
  //取得した質問一覧を保持しておくためのステートを準備   ステートは Question[] という Question の配列データとして指定
  const [questions, setQuestions] = useState<Question[]>([]);

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
        where("receiverUid", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
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
      <div>{questions.length}</div>
    </Layout>
  );
}
