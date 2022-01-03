import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'

function authenticate() {
	const auth = getAuth()
  
	signInAnonymously(auth).catch(function (error) {
	  // Handle Errors here.
	  var errorCode = error.code
	  var errorMessage = error.message
	  // ...
	})

	onAuthStateChanged(auth, function (user) {
		if (user) {
		  console.log(user.uid)
		  console.log(user.isAnonymous)
		} else {
		  // User is signed out.
		  // ...
		}
		// ...
	  })
	}
	
	if (process.browser) {
	  authenticate()
	}