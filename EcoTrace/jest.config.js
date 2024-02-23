module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation)|@react-native-vector-icons|firebase|@firebase/app|@firebase/firestore|@firebase/util|@react-native-firebase/firestore)"
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};
