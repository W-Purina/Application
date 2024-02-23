import React, { useState, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View, Alert, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { changeUserPassword, fetchProfileImageUrl } from './firestore.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppContext from '../theme/AppContext';
import { useUser } from './userContext.js';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const ChangePasswordScreen = ({ navigation }) => {

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setShowOverlay } = useContext(AppContext);
  const { userId } = useUser();

  useFocusEffect(
    React.useCallback(() => {

      
      let isActive = true;
      const loadUserData = async () => {
        try {
          const imageUrl = await fetchProfileImageUrl(userId);
          if (isActive) {
            setProfileImageUrl(imageUrl);
          }
        } catch (error) {
          console.log('Error loading data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadUserData();

      return () => {
        isActive = false;
      };

    }, [userId]),
  );

  const togglePasswordVisibility = type => {
    if (type === 'password') {
      setPasswordVisible(prev => !prev);
    } else if (type === 'confirmPassword') {
      setConfirmPasswordVisible(prev => !prev);
    } else if (type === 'currentPassword') {
      setCurrentPasswordVisible(prev => !prev);
    }
  };

  // Function to clear saved credentials in AsyncStorage
  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem('savedEmail');
      await AsyncStorage.removeItem('savedPassword');
      await AsyncStorage.setItem('rememberMeStatus', 'false');
    } catch (error) {
      console.error('Error clearing saved credentials:', error);
    }
  };

  const handleConfirm = async () => {
    setShowOverlay(true);

    // Check if the new password is the same as the current password
    if (password === currentPassword) {
      Alert.alert('Notice', 'New password cannot be the same as the current password.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
      return;
    }

    // Check if the new password length is greater than 6 characters
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be longer than 6 characters.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
      return;
    }

    // Check if the new password and confirm password match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match. Please try again.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
      return;
    }

    // Attempt to change the password
    const result = await changeUserPassword(currentPassword, password);
    if (result.success) {
      // Clear saved credentials
      clearSavedCredentials();
      // Display success message, reset overlay, and navigate back
      Alert.alert('Success', 'Password updated successfully!', [
        {
          text: 'OK', onPress: () => {
            setShowOverlay(false);
            navigation.goBack();
          }
        },
      ]);
    } else {
      // Display error message, and reset overlay on closing alert
      Alert.alert('Error', result.error, [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
    }

  };


  return (
    <View style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <View style={styles.greenHeader}></View>
      <View style={styles.mainContainer}>
        {isLoading ? (
          <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />
        ) : (
          <>
            <View style={styles.imageHeader}>
              <Image
                source={profileImageUrl ? { uri: profileImageUrl } : require('../../src/theme/images/profile_pic.png')}
                style={styles.image}
              />
            </View>
            <View style={styles.con1}>
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                value={currentPassword}
                secureTextEntry={!currentPasswordVisible}
                onChangeText={text => setCurrentPassword(text)}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => togglePasswordVisibility('currentPassword')}>
                <MaterialCommunityIcons
                  name={currentPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="grey"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.con2}>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={password}
                secureTextEntry={!passwordVisible}
                onChangeText={text => setPassword(text)}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => togglePasswordVisibility('password')}>
                <MaterialCommunityIcons
                  name={passwordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="grey"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.con3}>
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                secureTextEntry={!confirmPasswordVisible}
                onChangeText={text => setConfirmPassword(text)}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => togglePasswordVisibility('confirmPassword')}>
                <MaterialCommunityIcons
                  name={confirmPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="grey"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.con1}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  screen: {
    width: screenWidth,
    height: screenHeight,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  greenHeader: {
    width: screenWidth,
    height: screenHeight * 0.28,
    backgroundColor: '#B0D9B1',
  },
  mainContainer: {
    borderRadius: 20,
    width: screenWidth * 0.95,
    height: screenHeight * 0.85,
    marginTop: -screenHeight * 0.27,
    marginLeft: 10,
    marginRight: 20,
    backgroundColor: 'white',
    elevation: 3,
  },
  imageHeader: {
    width: 72,
    height: 72,
    marginTop: 20,
    marginBottom: -10,
    borderRadius: 72 / 2,
    overflow: 'hidden',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  con1: {
    marginHorizontal: 20,
    marginTop: 50,
  },
  con2: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  con3: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  input: {
    color: '#555555',
    borderWidth: 1.5,
    borderColor: '#DDD',
    padding: 10,
    width: '100%',
    borderRadius: 5,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 15,
  },
  eyeImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  confirmButton: {
    backgroundColor: '#609966',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ChangePasswordScreen;
