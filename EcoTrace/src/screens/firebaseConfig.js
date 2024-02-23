import {initializeApp} from 'firebase/app';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAgUjfeNnRjpjQKDJFctVi3EugEiNjb-3Y',
  authDomain: 'ecotrace-77266.firebaseapp.com',
  projectId: 'ecotrace-77266',
  storageBucket: 'ecotrace-77266.appspot.com',
  messagingSenderId: '29346998579',
  appId: '1:29346998579:android:49fa2f8f487dd617367646',
  measurementId: 'G-WX2DQB3S1V',
};

GoogleSignin.configure({
  webClientId:
    '29346998579-41tdslmc4h2mc6o0jlrio3cjf5de5ffi.apps.googleusercontent.com',
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth_async = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export {app, auth, db};
