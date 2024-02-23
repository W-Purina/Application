import {db} from './firebaseConfig';
import firestore from '@react-native-firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  setDoc,
  getDoc,
  doc,
  collection,
  getDocs,
  query,
  deleteDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
  getFirestore,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// Function to register a user - P create in frontend part / R move and update here
const registerUser = async (email, password) => {
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    await sendEmailVerification(user);

    return {
      success: true,
      userId: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    // Translate Firebase error codes to user-friendly messages
    let errorMessage;
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already in use.';
        break;
      case 'auth/network-request-failed':
        errorMessage =
          'Network request failed. Please check your internet connection.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters long.';
        break;
      default:
        errorMessage = 'Registration failed. Please try again later.';
    }
    return {success: false, error: errorMessage};
  }
};

// Function to check if email is verified - R
const isEmailVerified = () => {
  const auth = getAuth();
  return auth.currentUser?.emailVerified || false;
};

// Function to resend verification email - R
const resendVerificationEmail = async email => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && user.email === email) {
      await sendEmailVerification(user);
      return {success: true};
    } else {
      return {success: false, error: 'No matching user found.'};
    }
  } catch (error) {
    return {success: false, error: error.message};
  }
};

// Function to sign in a user - P create in frontend part / R move and update here
const signInUser = async (email, password) => {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Check is email is verified
    if (!isEmailVerified()) {
      return {
        success: false,
        error: 'Please verify your email before signing in.',
      };
    }

    // Check if user data already exists in Firestore
    const userDoc = await firestore().collection('users').doc(user.uid).get();

    let isNewUser = false;
    // If user data does not exist, create a new user record
    if (!userDoc.exists) {
      await firestore().collection('users').doc(user.uid).set({
        email: user.email,
        signInMethod: 'email',
        totalCarbonEmission: 0,
        rewardPoints: 0,
        yearlyCarbonEmissionGoal: 0,
        readHelpInfoIds: [],
      });
      isNewUser = true;
    }

    //console.log('User signed in successfully');
    return {success: true, userId: user.uid, isNewUser};
  } catch (error) {
    // Translate Firebase error codes to user-friendly messages
    let errorMessage;
    switch (error.code) {
      case 'auth/invalid-credential':
        errorMessage = 'The email or password is incorrect. Please try again.';
        break;
      default:
        errorMessage =
          'An error occurred during sign in. Please try again later.';
    }
    return {success: false, error: errorMessage};
  }
};

// Function to handle Google sign-in and create user data in Firestore if it's a new user - R
const handleGoogleSignIn = async () => {
  try {
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const auth = getAuth();
    const userCredential = await signInWithCredential(auth, googleCredential);
    const user = userCredential.user;

    // Check if user data already exists in Firestore
    const userDoc = await firestore().collection('users').doc(user.uid).get();

    let isNewUser = false;
    // If user data does not exist, create a new user record
    if (!userDoc.exists) {
      await firestore().collection('users').doc(user.uid).set({
        email: user.email,
        signInMethod: 'google',
        totalCarbonEmission: 0,
        rewardPoints: 0,
        yearlyCarbonEmissionGoal: 0,
        readHelpInfoIds: [],
      });
      isNewUser = true;
    }

    //console.log('User signed in successfully');
    return {success: true, userId: user.uid, isNewUser};
  } catch (error) {
    console.log('Google SignIn Error', error);
    return {success: false, error: error.message};
  }
};

// Function to check if the user signed in with Google - R
const isGoogleSignIn = async userId => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();
    return userDoc.exists && userDoc.data().signInMethod === 'google';
  } catch (error) {
    console.error('Error checking sign-in method: ', error);
    return false; // Or handle the error as needed
  }
};

// Function to check if email exists in the database - R
const doesEmailExist = async email => {
  const usersRef = firestore().collection('users');
  const querySnapshot = await usersRef.where('email', '==', email).get();
  return !querySnapshot.empty;
};

// Function to send a password reset email - R
const sendPasswordResetEmailFirebase = async email => {
  try {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
    return {success: true};
  } catch (error) {
    return {success: false, error: error.message};
  }
};

// Listening for authentication state changes - R
const auth = getAuth();
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in, user information can be retrieved
    // console.log(user);
  } else {
    // No user is signed in
    console.log('No user logged in');
  }
});

// Function to re-authenticate the user - R
const reauthenticate = async currentPassword => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.error('No user currently signed in');
    return {success: false, error: 'No signed in user. Please sign in again.'};
  }

  if (!currentPassword) {
    return {
      success: false,
      error: 'Current password is missing. Please enter your current password.',
    };
  }

  try {
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credential);
    return {success: true};
  } catch (error) {
    console.error('Error re-authenticating:', error);
    let errorMessage = error.message;
    switch (error.code) {
      case 'auth/invalid-credential':
        errorMessage = 'The provided credential is invalid. Please try again.';
        break;
      case 'auth/missing-password':
        errorMessage = 'Please provide the current password.';
        break;
      default:
        errorMessage =
          'An error occurred while re-authenticating. Please try again.';
    }
    return {success: false, error: errorMessage};
  }
};

// Function to change the user's password - P create in frontend part / R move and update logic here
const changeUserPassword = async (currentPassword, newPassword) => {
  const reauthResult = await reauthenticate(currentPassword);
  if (!reauthResult.success) {
    return {success: false, error: reauthResult.error};
  }

  try {
    const user = auth.currentUser;
    await updatePassword(user, newPassword);
    //console.log('Password updated successfully');
    return {success: true};
  } catch (error) {
    console.error('Error updating password:', error);
    return {success: false, error: error.message};
  }
};

// Function to logout based on signInMethod - R
const logoutUser = async userId => {
  try {
    const auth = getAuth();

    const userDoc = await firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User data not found.');
    }

    const signInMethod = userDoc.data().signInMethod;

    if (signInMethod === 'google') {
      await GoogleSignin.signOut();
      //console.log('Google user logged out successfully');
    } else if (signInMethod === 'email') {
      await firebaseSignOut(auth);
      console.log('Email user logged out successfully');
    }

    return {success: true};
  } catch (error) {
    console.error('Error signing out: ', error);
    return {success: false, error: error.message};
  }
};

// Function to save or update username information - P
const saveOrUpdateUserName = async (userId, userName) => {
  if (!userId || !userName) {
    console.error('No user ID or username provided');
    return;
  }

  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .set({name: userName}, {merge: true});

    //console.log('User name updated successfully');
  } catch (error) {
    console.error('Error updating user name:', error);
  }
};

// Function to fetch user's name - P
const fetchUsername = async userId => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      //Return userData.name if it exists and is not empty, otherwise 'KeepReal'
      return userData.name ? userData.name : 'KeepReal';
    } else {
      console.log('No user data found');
      return 0;
    }
  } catch (error) {
    console.error('Error fetching user totalCarbonEmission:', error);
    return 0;
  }
};

// Function to upload the image to Firebase Storage - R
const uploadImage = async (userId, imageUri) => {
  const storage = getStorage();
  const imageName = `profile_${new Date().getTime()}`;
  const ref = storageRef(storage, `images/${userId}/${imageName}`);
  const response = await fetch(imageUri);
  const blob = await response.blob();

  try {
    await uploadBytes(ref, blob);
    //console.log('Image uploaded successfully');
    const url = await getDownloadURL(ref);
    return url;
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
};

// Function to save ImageUrl to firestore - R
const saveImageUrlToFirestore = async (userId, imageUrl) => {
  const db = getFirestore();
  const userRef = doc(db, 'users', userId);

  try {
    await updateDoc(userRef, {
      profileImageUrl: imageUrl,
    });
    //console.log('Image URL saved to Firestore');
  } catch (error) {
    console.error('Failed to save image URL to Firestore:', error);
  }
};

// Function to fetch the profile image URL from Firestore - R
const fetchProfileImageUrl = async userId => {
  const db = getFirestore();
  const userRef = doc(db, 'users', userId);

  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.profileImageUrl; // This is the field where you store the image URL
    } else {
      console.log('No user document found');
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch profile image URL:', error);
    return null;
  }
};

// Function to fetch user's goal - R
const fetchYearlyCarbonEmissionGoal = async userId => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    return userData.yearlyCarbonEmissionGoal || 0;
  } catch (error) {
    console.error('Error fetching yearly carbon emission goal:', error);
    throw error;
  }
};

// Function to update user's goal - R
const updateYearlyCarbonEmissionGoal = async (userId, newGoal) => {
  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .update({yearlyCarbonEmissionGoal: newGoal});

    return {success: true};
  } catch (error) {
    console.error('Error updating yearly carbon emission goal:', error);
    return {success: false, error};
  }
};

// Function to save car storage information - P create / R update
const saveVehicleInfo = async (userId, vehicleInfo) => {
  if (!userId) {
    console.error('No user ID provided');
    return;
  }

  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('vehicle')
      .doc()
      .set({
        ...vehicleInfo,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

    //console.log('Vehicle information saved successfully');
  } catch (error) {
    console.error('Error saving vehicle information:', error);
  }
};

// Function to update car storage information - P create / R update
const updateVehicleInfo = async (userId, vehicleId, vehicleInfo) => {
  if (!userId || !vehicleId) {
    console.error('User ID or Vehicle Document ID not provided');
    return;
  }

  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('vehicle')
      .doc(vehicleId)
      .set(vehicleInfo, {merge: true});
    //console.log('Vehicle information updated successfully');
  } catch (error) {
    console.error('Error updating vehicle information:', error);
  }
};

// Function to fetch user's car information and assign names - P create / R update
const fetchVehicleInfo = async userId => {
  if (!userId) {
    console.error('No user ID provided');
    return [];
  }

  try {
    const vehicleCollectionRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('vehicle')
      .orderBy('createdAt', 'asc');
    const snapshot = await vehicleCollectionRef.get();

    if (snapshot.empty) {
      console.log('No vehicle information found');
      return [];
    }

    const vehicles = [];
    snapshot.forEach(doc => {
      // Use carBrand and carYear to name each vehicle, for example: Toyota 2020
      const vehicleData = doc.data();
      const vehicleName = `${vehicleData.carBrand} ${vehicleData.carYear}`;

      const vehicleWithName = {
        name: vehicleName,
        ...vehicleData,
        id: doc.id,
      };
      vehicles.push(vehicleWithName);
    });

    return vehicles;
  } catch (error) {
    console.error('Error fetching vehicle information:', error);
    return [];
  }
};

// Function to fetch specific car information based on vehicleId - R
const fetchSpecificVehicleInfo = async (userId, vehicleId) => {
  if (!userId || !vehicleId) {
    console.error('No user ID or vehicle ID provided');
    return null;
  }

  try {
    const vehicleDocRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('vehicle')
      .doc(vehicleId);
    const doc = await vehicleDocRef.get();

    if (!doc.exists) {
      console.log('No vehicle information found for the given ID');
      return null;
    }

    const vehicleInfo = {
      ...doc.data(),
      id: doc.id,
    };

    return vehicleInfo;
  } catch (error) {
    console.error('Error fetching specific vehicle information:', error);
    return null;
  }
};

// Function to delete specific car information - R
const deleteVehicleInfo = async (userId, vehicleId) => {
  if (!userId || !vehicleId) {
    console.error('User ID or Vehicle Document ID not provided');
    return;
  }

  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('vehicle')
      .doc(vehicleId)
      .delete();

    //console.log('Vehicle information deleted successfully');
  } catch (error) {
    console.error('Error deleting vehicle information:', error);
  }
};

// Function to save user daily carbon footprint - R
const saveDailyCarbonEmission = async (
  userId,
  emissionDate,
  emissionAmount,
) => {
  if (!userId || !emissionDate || emissionAmount == null) {
    console.error('Missing required parameters');
    return;
  }

  try {
    const dailyEmissionDocRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('dailyEmissions')
      .doc(emissionDate); // Use the date as the document ID to ensure uniqueness

    await dailyEmissionDocRef.set({
      date: emissionDate,
      amount: emissionAmount,
    });

    //console.log('Daily carbon emission saved successfully');
  } catch (error) {
    console.error('Error saving daily carbon emission:', error);
  }
};

// Function to update user daily carbon footprint - R
const updateDailyCarbonEmission = async (
  userId,
  emissionDate,
  emissionAmount,
) => {
  if (!userId || !emissionDate || emissionAmount == null) {
    console.error('Missing required parameters');
    return;
  }

  try {
    const dailyEmissionDocRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('dailyEmissions')
      .doc(emissionDate);

    const dailyEmissionSnapshot = await dailyEmissionDocRef.get();
    if (dailyEmissionSnapshot.exists) {
      let currentEmission = dailyEmissionSnapshot.data().amount;
      let updatedEmission = Math.max(
        0,
        currentEmission + emissionAmount,
      ).toFixed(2);
      await dailyEmissionDocRef.update({amount: parseFloat(updatedEmission)});
    } else {
      let newEmission = Math.max(0, emissionAmount).toFixed(2);
      await dailyEmissionDocRef.set({
        date: emissionDate,
        amount: parseFloat(newEmission),
      });
    }

    //console.log('Daily carbon emission updated successfully');
  } catch (error) {
    console.error('Error updating daily carbon emission:', error);
  }
};

// Function to get daily carbon footprint - R
const getDailyCarbonEmission = async (userId, date) => {
  if (!userId || !date) {
    console.error('Missing required parameters');
    return;
  }

  try {
    const dailyEmissionDocRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('dailyEmissions')
      .doc(date);

    const docSnapshot = await dailyEmissionDocRef.get();
    if (docSnapshot.exists) {
      //console.log(`Daily emission for ${date}:`, docSnapshot.data().amount);
      return docSnapshot.data().amount;
    } else {
      console.log(`No emissions found for ${date}`);
      return 0;
    }
  } catch (error) {
    console.error('Error getting daily carbon emission:', error);
    return 0;
  }
};

// Function to get weekly carbon footprint - R
const getWeeklyCarbonEmission = async (userId, year, month, weekNumber) => {
  if (!userId || year == null || month == null || weekNumber == null) {
    console.error('Missing required parameters');
    return;
  }

  try {
    // Get the first day of the month
    const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1, 12));
    // Get the day of the week for the first day of the month (0 is Sunday)
    const firstWeekday = firstDayOfMonth.getUTCDay();

    // Calculate the last day of the month
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0, 12));
    const daysInMonth = lastDayOfMonth.getDate();

    // Determine if the month has an incomplete week at the end
    const daysInIncompleteWeek = daysInMonth % 28;
    let startDate, endDate;

    if (weekNumber === 1 && daysInIncompleteWeek > 0 && month !== 1) {
      // Adjust the start date to include the last few days of the previous month
      const previousMonthLastDay = new Date(Date.UTC(year, month - 1, 0, 12));
      const dayOfWeek = previousMonthLastDay.getUTCDay();
      startDate = new Date(
        Date.UTC(
          year,
          month - 1,
          previousMonthLastDay.getDate() - dayOfWeek,
          12,
        ),
      );
    } else {
      // Calculate the start date of the target week based on the first week
      startDate = new Date(
        Date.UTC(year, month - 1, (weekNumber - 1) * 7 + 2 - firstWeekday, 12),
      );
    }

    // Adjust the start date if it's before the first day of the month
    const startDateISO = startDate.toISOString().split('T')[0];

    // Calculate and adjust the end date of the target week
    endDate = new Date(
      Date.UTC(year, month - 1, (weekNumber - 1) * 7 + 8 - firstWeekday, 12),
    );
    const adjustedEndDate = endDate > lastDayOfMonth ? lastDayOfMonth : endDate;
    const endDateISO = adjustedEndDate.toISOString().split('T')[0];

    // Log the start and end dates of the week
    // console.log(
    //   `Week ${weekNumber} of ${month}/${year} starts on ${startDateISO} and ends on ${endDateISO}`,
    // );

    const emissionsRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('dailyEmissions')
      .where('date', '>=', startDateISO)
      .where('date', '<=', endDateISO);

    const querySnapshot = await emissionsRef.get();
    let totalEmission = 0;
    querySnapshot.forEach(doc => {
      totalEmission += doc.data().amount;
    });

    // console.log(
    //   `Total emission for week ${weekNumber} of ${month}/${year}:`,
    //   totalEmission,
    // );
    return totalEmission;
  } catch (error) {
    console.error('Error getting weekly carbon emission:', error);
    return 0;
  }
};

// Function to get monthly carbon footprint - R
const getMonthlyCarbonEmission = async (userId, year, month) => {
  if (!userId || year == null || month == null) {
    console.error('Missing required parameters');
    return;
  }

  try {
    const startOfMonthNZ = new Date(Date.UTC(year, month - 1, 1, 12))
      .toISOString()
      .split('T')[0];
    const endOfMonthNZ = new Date(Date.UTC(year, month, 0, 12))
      .toISOString()
      .split('T')[0];

    const emissionsRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('dailyEmissions')
      .where('date', '>=', startOfMonthNZ)
      .where('date', '<=', endOfMonthNZ);

    const querySnapshot = await emissionsRef.get();
    let totalEmission = 0;
    querySnapshot.forEach(doc => {
      totalEmission += doc.data().amount;
    });

    //console.log(`Total monthly emission for ${year}-${month}:`, totalEmission);
    return totalEmission;
  } catch (error) {
    console.error('Error getting monthly carbon emission:', error);
    return 0;
  }
};

// Function to get yearly carbon footprint - R
const getYearlyCarbonEmission = async (userId, year) => {
  if (!userId || year == null) {
    console.error('Missing required parameters');
    return;
  }

  try {
    const startOfYearNZ = new Date(Date.UTC(year, 0, 1, 12))
      .toISOString()
      .split('T')[0];
    const endOfYearNZ = new Date(Date.UTC(year, 11, 31, 12))
      .toISOString()
      .split('T')[0];

    const emissionsRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('dailyEmissions')
      .where('date', '>=', startOfYearNZ)
      .where('date', '<=', endOfYearNZ);

    const querySnapshot = await emissionsRef.get();
    let totalEmission = 0;
    querySnapshot.forEach(doc => {
      totalEmission += doc.data().amount;
    });

    //console.log(`Total yearly emission for ${year}:`, totalEmission);
    return totalEmission;
  } catch (error) {
    console.error('Error getting yearly carbon emission:', error);
    return 0;
  }
};

// Function to fetch user's totalCarbonEmission - P
const fetchUsertotalCarbonEmission = async userId => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.totalCarbonEmission || 0; 
    } else {
      console.log('No user data found');
      return 0;
    }
  } catch (error) {
    console.error('Error fetching user totalCarbonEmission:', error);
    return 0;
  }
};

// Function to update user's totalCarbonEmission - R
const updateUserTotalCarbonEmission = async (userId, emissionChange) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      console.error('User data not found');
      return;
    }

    const userData = userDocSnap.data();
    const currentTotalEmission = userData.totalCarbonEmission || 0;
    const newTotalEmission = Math.max(
      0,
      currentTotalEmission + emissionChange,
    ).toFixed(2);

    await updateDoc(userDocRef, {
      totalCarbonEmission: parseFloat(newTotalEmission),
    });

    //console.log('User total carbon emission updated successfully');
  } catch (error) {
    console.error('Error updating user total carbon emission:', error);
  }
};

// Function to save user history - P create / R update
const saveToUserHistory = async (userId, historyEntry) => {
  if (!userId) {
    console.error('No user ID provided');
    return;
  }

  try {
    // (1) Update total carbon footprint:
    const emissionChange = parseFloat(historyEntry.carbonFootprint);

    // (2) Extract the date part from the timestamp before updating daily carbon footprint
    const datePart = historyEntry.timestamp.split('T')[0];

    // (3) Update total and daily carbon footprints
    await updateUserTotalCarbonEmission(userId, emissionChange);
    await updateDailyCarbonEmission(userId, datePart, emissionChange);

    // (4) Save new history record
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('history')
      .add(historyEntry);
    //console.log('History saved successfully');
  } catch (error) {
    console.error('Error saving History:', error);
  }
};

// Function to delete a record from user history - R
const deleteRecordFromHistory = async (userId, recordId) => {
  if (!userId || !recordId) {
    console.error('User ID or Record ID not provided');
    return;
  }

  try {
    // Retrieve the information of the record to be deleted
    const recordDoc = await firestore()
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(recordId)
      .get();

    if (!recordDoc.exists) {
      console.error('Record not found');
      return;
    }

    const recordData = recordDoc.data();
    const carbonFootprintToRemove = parseFloat(recordData.carbonFootprint);

    // (1) Update the total carbon emission
    const emissionChange = -carbonFootprintToRemove;
    await updateUserTotalCarbonEmission(userId, emissionChange);

    // (2) Update the daily carbon emission
    const datePart = recordData.timestamp.split('T')[0];
    // Ensure we don't set a negative emission for the day
    const dailyEmissionDocRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('dailyEmissions')
      .doc(datePart);

    const dailyEmissionSnapshot = await dailyEmissionDocRef.get();
    if (dailyEmissionSnapshot.exists) {
      const currentDailyEmission = dailyEmissionSnapshot.data().amount;
      const newDailyEmission = Math.max(
        0,
        currentDailyEmission + emissionChange,
      );
      await dailyEmissionDocRef.update({amount: newDailyEmission});
    }

    // (3) Delete the record
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(recordId)
      .delete();

    //console.log('Record deleted successfully');
  } catch (error) {
    console.error('Error deleting record:', error);
  }
};

// Function to update a record in user history - R
const updateRecordInHistory = async (userId, recordId, newHistoryEntry) => {
  if (!userId || !recordId) {
    console.error('User ID or Record ID not provided');
    return;
  }

  try {
    // Retrieve the information of the old record
    const oldRecordDoc = await firestore()
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(recordId)
      .get();

    if (!oldRecordDoc.exists) {
      console.error('Old record not found');
      return;
    }

    const oldRecordData = oldRecordDoc.data();
    const oldCarbonFootprint = parseFloat(oldRecordData.carbonFootprint);

    // Calculate the emission change
    const emissionChange =
      parseFloat(newHistoryEntry.carbonFootprint) - oldCarbonFootprint;
    //console.log(`Emission Change: ${emissionChange}`);

    // Extract the date parts from the new and old history entries
    const newDatePart = newHistoryEntry.timestamp.split('T')[0];
    const oldDatePart = oldRecordData.timestamp.split('T')[0];
    //console.log(`New Date Part: ${newDatePart}, Old Date Part: ${oldDatePart}`);

    // (1) Update the total carbon emission
    await updateUserTotalCarbonEmission(userId, emissionChange);

    // (2) Update the daily carbon emission
    if (newDatePart !== oldDatePart) {
      //console.log('Dates have changed, updating old and new daily emissions.');
      await updateDailyCarbonEmission(userId, oldDatePart, -oldCarbonFootprint);
      await updateDailyCarbonEmission(
        userId,
        newDatePart,
        parseFloat(newHistoryEntry.carbonFootprint),
      );
    } else {
      // console.log(
      //   'Dates have not changed, only updating the daily emissions for the new entry.',
      // );

      // Update the daily carbon emission for the new date with the emission change
      await updateDailyCarbonEmission(userId, newDatePart, emissionChange);
    }

    // (3) Update the history record
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(recordId)
      .set(newHistoryEntry, {merge: true});
    //console.log('Record updated successfully');
  } catch (error) {
    console.error('Error updating record:', error);
  }
};

// Function to fetch user history - P
const fetchHistory = async userId => {
  const historyRef = collection(db, 'users', userId, 'history');
  const q = query(historyRef);

  try {
    const querySnapshot = await getDocs(q);
    const historyData = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData,
        // Check timestamp and convert to string format
        timestamp:
          docData.timestamp instanceof Timestamp
            ? docData.timestamp.toDate().toISOString()
            : docData.timestamp,
      };
    });
    //console.log('Fetched History:', historyData);
    return historyData;
  } catch (error) {
    console.error('Error fetching user history:', error);
    return [];
  }
  r;
};

// Function to fetch user's rewardpoint - P
const fetchUserRewardPoints = async userId => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.rewardPoints || 0; 
    } else {
      console.log('No user data found');
      return 0;
    }
  } catch (error) {
    console.error('Error fetching user reward points:', error);
    return 0;
  }
};

// Function to update user's rewardpoint - P
const updateRewardPoints = async (userId, rewardPoints) => {
  if (!userId) {
    console.error('No user ID provided');
    return;
  }

  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .set({rewardPoints: rewardPoints}, {merge: true});

    //console.log('rewardPoints updated successfully');
  } catch (error) {
    console.error('Error updating rewardPoints:', error);
  }
};

// Function to fetch helpinfo and include document ID - P create / R update
const fetchAllHelpInfo = async () => {
  try {
    const helpInfoCollectionRef = collection(db, 'helpInfo');
    const querySnapshot = await getDocs(helpInfoCollectionRef);
    const helpInfoList = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      docId: doc.id, // add document ID
    }));
    return helpInfoList;
  } catch (error) {
    console.error('Error fetching help information:', error);
    return [];
  }
};

// Function to fetch a specific help information by ID - R
const fetchHelpInfoById = async infoId => {
  try {
    const helpInfoDocRef = doc(db, 'helpInfo', infoId);
    const helpInfoDocSnap = await getDoc(helpInfoDocRef);
    if (helpInfoDocSnap.exists()) {
      return helpInfoDocSnap.data();
    } else {
      console.log('No help information found with ID:', infoId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching help information by ID:', error);
    return null;
  }
};

// Function to fetch All Quiz - P create / H update
const fetchAllQuiz = async () => {
  try {
    const QuizCollectionRef = collection(db, 'Quiz');
    const querySnapshot = await getDocs(QuizCollectionRef);
    const Quizlist = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    //console.log(Quizlist);
    return Quizlist; // This will return an array containing all document data and IDs
  } catch (error) {
    console.error('Error fetching Quizlist:', error);
    return [];
  }
};

// Function to create and store user quiz - H
const createAndStoreUserQuiz = async userId => {
  try {
    // Retrieve quiz data
    const quizList = await fetchAllQuiz();

    // Get a reference to the user's userquiz collection
    const userQuizCollectionRef = collection(db, 'users', userId, 'userquiz');

    // Iterate over quizList, create a new object for each quiz and add a userAnswer property
    const userQuizList = quizList.map(quiz => ({
      ...quiz,
      userAnswer: null, // Set a default value here or update it after user answers
    }));

    // Create a new document and store the userQuizList in it
    const userQuizDocRef = doc(userQuizCollectionRef);
    await setDoc(userQuizDocRef, {quizzes: userQuizList, status: false});

    //console.log('User quiz created and stored successfully.');
  } catch (error) {
    console.error('Error creating and storing user quiz:', error);
    throw error;
  }
};

// Function to fetch user quiz - H
const fetchUserQuizData = async userId => {
  try {
    // Get a reference to the user's userquiz collection
    const userQuizCollectionRef = collection(db, 'users', userId, 'userquiz');

    // Retrieve a snapshot of the collection using getDocs
    const querySnapshot = await getDocs(userQuizCollectionRef);

    // Iterate over the documents in the snapshot
    const userQuizData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Return an array containing data of all userquiz documents with their IDs
    return userQuizData;
  } catch (error) {
    console.error('Error fetching user quiz data:', error);
    throw error;
  }
};

// Function to update user quiz status - H
const updateQuizStatus = async (userId, quizId, newStatus) => {
  try {
    // Get a reference to the userquiz document
    const userQuizDocRef = doc(db, 'users', userId, 'userquiz', quizId);

    //Update the status field of the document
    await updateDoc(userQuizDocRef, {status: newStatus});

    //console.log('User quiz status updated successfully.');
  } catch (error) {
    console.error('Error updating user quiz status:', error);
    throw error;
  }
};

// Function to fetch Coupon - P create / H update
const fetchAllCoupon = async () => {
  try {
    const CouponCollectionRef = collection(db, 'Coupon');
    const querySnapshot = await getDocs(CouponCollectionRef);
    const Couponlist = querySnapshot.docs.map(doc => ({
      id: doc.id, //Add the ID of the current document as a field
      ...doc.data(),
    }));
    return Couponlist;
  } catch (error) {
    console.error('Error fetching Coupon list:', error);
    return [];
  }
};

// Function to save coupon selected by the user - P create / H update
const saveSelectedProductToUserCoupon = async (userId, selectedProduct) => {
  try {

    const couponRef = doc(collection(db, 'users', userId, 'coupons'));
    const { id, ...productData } = selectedProduct;
    productData.id = couponRef.id;

    await setDoc(couponRef, productData);
    //console.log('Product saved successfully to user coupons.');
  } catch (error) {
    console.error('Error saving product to user coupons:', error);
  }
};

// Function to fetch user's coupon - P Create / H update
const fetchUserCoupon = async userId => {
  try {
    const couponCollectionRef = collection(db, 'users', userId, 'coupons');
    const querySnapshot = await getDocs(couponCollectionRef);
    const couponList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return couponList;
  } catch (error) {
    console.error('Error fetching user coupons:', error);
    return [];
  }
};

// Function to save or update selected product to user's coupon - H
const saveOrUpdateUserCoupon = async (userId, selectedProducts) => {
  try {
    // Create a reference to the user's 'coupons' collection
    const couponCollectionRef = collection(db, 'users', userId, 'coupons');

    const querySnapshot = await getDocs(couponCollectionRef);

    // Iterate through the documents in the snapshot
    querySnapshot.forEach(async doc => {
      // Get a reference to the document
      const docRef = doc.ref;

      // Get the data of the document
      const existingProduct = doc.data();

      // Check if the document exists in selectedProducts
      const isProductSelected = selectedProducts.some(
        product => product.id === existingProduct.id,
      );

      // If the document exists in selectedProducts, update it
      if (isProductSelected) {
        await setDoc(docRef, existingProduct, {merge: true});
      } else {
        // If the document does not exist in selectedProducts, delete it
        await deleteDoc(docRef);
      }
    });

    //console.log('Products saved or updated successfully in user coupons.');
  } catch (error) {
    console.error('Error saving or updating products in user coupons:', error);
    throw error;
  }
};

// H
const fetchReadHelpInfoIds = async userId => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    if (userData) {
      return userData.readHelpInfoIds || [];
    } else {
      console.error('User not found.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching readHelpInfoIds:', error);
    throw error;
  }
};

// H
const addHelpInfoIdToReadIds = async (userId, helpInfoId) => {
  try {
    const userDocRef = doc(db, 'users', userId);

    //Use the updateDoc method to update the document and add helpInfoId to the readHelpInfoIds array
    await updateDoc(userDocRef, {
      readHelpInfoIds: arrayUnion(helpInfoId),
    });

    //console.log('Added helpInfoId to readHelpInfoIds successfully.');
  } catch (error) {
    console.error('Error adding helpInfoId to readHelpInfoIds:', error);
    throw error;
  }
};

export {
  registerUser,
  isEmailVerified,
  resendVerificationEmail,
  signInUser,
  handleGoogleSignIn,
  isGoogleSignIn,
  doesEmailExist,
  sendPasswordResetEmailFirebase,
  changeUserPassword,
  logoutUser,
  saveOrUpdateUserName,
  uploadImage,
  saveImageUrlToFirestore,
  fetchProfileImageUrl,
  fetchUsername,
  fetchYearlyCarbonEmissionGoal,
  updateYearlyCarbonEmissionGoal,
  saveVehicleInfo,
  updateVehicleInfo,
  fetchVehicleInfo,
  fetchSpecificVehicleInfo,
  deleteVehicleInfo,
  saveDailyCarbonEmission,
  updateDailyCarbonEmission,
  getDailyCarbonEmission,
  getWeeklyCarbonEmission,
  getMonthlyCarbonEmission,
  getYearlyCarbonEmission,
  fetchUsertotalCarbonEmission,
  updateUserTotalCarbonEmission,
  saveToUserHistory,
  deleteRecordFromHistory,
  updateRecordInHistory,
  fetchHistory,
  fetchUserRewardPoints,
  updateRewardPoints,
  fetchAllHelpInfo,
  fetchHelpInfoById,
  fetchAllQuiz,
  createAndStoreUserQuiz,
  fetchUserQuizData,
  updateQuizStatus,
  fetchAllCoupon,
  saveSelectedProductToUserCoupon,
  fetchUserCoupon,
  saveOrUpdateUserCoupon,
  fetchReadHelpInfoIds,
  addHelpInfoIdToReadIds,
};
