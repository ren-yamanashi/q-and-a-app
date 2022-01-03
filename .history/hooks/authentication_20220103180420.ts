import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { User } from '../models/User'
import { atom,useRecoilState } from 'recoil'
import { useEffect } from 'react'
//FireStoreからのインポート
import {
	getFirestore,
	collection,
	doc,
	getDoc,
	setDoc,
  } from 'firebase/firestore'

//データを入れる箱を定義
//userState を利用して認証情報を取り扱える
const userState = atom<User>({//atom で定義したデータを扱う際に、ジェネリクス<> で定義した型として利用
	key: 'user',  // key で名前をつける
	default: null, //未ログインの状態を null として保存
  })
/*==================ユーザーデータが存在しなければユーザーデータを登録する処理を追加===============*/
  async function createUserIfNotFound(user: User) {
	const db = getFirestore()
	const usersCollection = collection(db, 'users')
	const userRef = doc(usersCollection, user.uid)
	const document = await getDoc(userRef)
	if (document.exists()) {
	  // 書き込みの方が高いので！
	  return
	}
  
	await setDoc(userRef, {
	  name: 'taro' + new Date().getTime(),
	})
  }

export function useAuthentication() {
	//user は、Recoil のステートに保持されているユーザーデータ
	const [user, setUser] = useRecoilState(userState)

	//認証処理は最初の１回だけ呼んでおけば良いため、下記のように useEffect で囲む
	useEffect(() => {
		if (user !== null) {
		  return
		}
	const auth = getAuth()
	  //認証メソッドを呼ぶ前にログを出す
	  console.log('Start useEffect')
  
	signInAnonymously(auth).catch(function (error) {
	  // Handle Errors here.
	  //エラーがあった時の処理
	  console.error(error);
	  // ...
	})

	onAuthStateChanged(auth, function (firebaseUser) {
		if (firebaseUser) {
			//ユーザー情報をセットするところでログを出す
			console.log('Set user')
			//ページアクセス時に１回だけ行うため、useEffect 内で読み込み
		  const loginUser: User= {
			  uid:firebaseUser.uid,
			  isAnonymous:firebaseUser.isAnonymous,
			  name:'',
		  }
		  setUser(loginUser)
		  createUserIfNotFound(loginUser)
		} else {
		  // User is signed out.
		  // User is signed out.
         // user 情報がない場合はログアウトとのことですので null を setUser にする  
		  setUser(null)
		  // ...
		}
		// ...
	  })
	},[])//useEffectの第２引数に空の配列を渡す　→ 最初の１回だけ呼び出される
	//取得したuser データは return で渡せるようにする
	  return { user }
	}