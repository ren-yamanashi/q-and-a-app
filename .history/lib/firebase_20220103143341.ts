import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

import 'firebase/analytics'
import 'firebase/auth'
import 'firebase/firestore'

//サーバーでの不要な読み込みを避けるために window オブジェクトがあるかどうかで判断
// 『firebase.apps.length』→ 既に初期化されている場合は何もしない

if (typeof window !== 'undefined' && getApps().length === 0) {
	const firebaseConfig = {//環境変数で設定した　firebase の設定を読み込む
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_DOMAIN,
		databaseURL:process.env.NEXT_PUBLIC_FIREBASE_DATABASE,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
		measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
	}
	initializeApp(firebaseConfig)
	getAnalytics()
	}