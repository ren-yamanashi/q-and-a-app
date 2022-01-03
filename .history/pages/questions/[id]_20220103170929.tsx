import { useEffect, useState } from "react";
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
  const { user } = useAuthentication();
  const [question, setQuestion] = useState<Question>(null);

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
      </div>
    </Layout>
  );
}
