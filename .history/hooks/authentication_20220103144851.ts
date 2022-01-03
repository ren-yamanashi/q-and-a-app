import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { User } from '../models/User'
import { atom,useRecoilState } from 'recoil'
import { useEffect } from 'react'

//データを入れる箱を定義
//userState を利用して認証情報を取り扱える
const userState = atom<User>({//atom で定義したデータを扱う際に、ジェネリクス<> で定義した型として利用
	key: 'user',  // key で名前をつける
	default: null, //未ログインの状態を null として保存
  })


export function useAuthentication() {
	//user は、Recoil のステートに保持されているユーザーデータ
	const [user, setUser] = useRecoilState(userState)

	//認証処理は最初の１回だけ呼んでおけば良いため、下記のように useEffect で囲む
	useEffect(() => {
		if (user !== null) {
		  return
		}
	const auth = getAuth()
  
	signInAnonymously(auth).catch(function (error) {
	  // Handle Errors here.
	  //エラーがあった時の処理
	  console.error(error);
	  // ...
	})

	onAuthStateChanged(auth, function (firebaseUser) {
		//ユーザー情報をセットするところでログを出す
		console.log('Set user')
		if (firebaseUser) {
		  setUser({
			  uid:firebaseUser.uid,
			  isAnonymous:firebaseUser.isAnonymous,
		  })
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