jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
}));


jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
  },
}));


jest.mock('@react-native-firebase/auth', () => {
  return {
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
  };
});


jest.mock('firebase/auth', () => {
  const actualAuth = jest.requireActual('firebase/auth');
  return {
    ...actualAuth,
    getAuth: jest.fn(() => ({
      onAuthStateChanged: jest.fn(),
    })),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updatePassword: jest.fn(),
    signOut: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn()
  };
});



jest.mock('@react-native-firebase/firestore', () => ({
  firestore: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue({
          exists: jest.fn().mockReturnValue(true),
          data: jest.fn().mockReturnValue({}),
        }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      }),
    }),
  }),
}));


jest.mock('firebase/firestore', () => {
  return {
    getFirestore: jest.fn(),
    setDoc: jest.fn(),
    getDoc: jest.fn(), 
    doc: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(), 
    query: jest.fn(),
    deleteDoc: jest.fn(),
    updateDoc: jest.fn(),
    arrayUnion: jest.fn(),
    Timestamp: jest.fn(),
  };
});








