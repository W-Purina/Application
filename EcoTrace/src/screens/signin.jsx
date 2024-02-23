import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import googleIcon from '../theme/images/google-icon.png';
import { signInUser, handleGoogleSignIn, resendVerificationEmail } from './firestore.js';
import { useUser } from './userContext.js';
import AppContext from '../theme/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignInScreen = ({ navigation }) => {

  // State hooks for managing form inputs, errors, and UI behaviors
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [isSelected, setSelection] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { setUserId } = useUser();
  const { setShowOverlay } = useContext(AppContext);

  // Function to toggle the visibility of password
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Function to validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  // Update to retrieve and set the remember me status in useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      const init = async () => {
        const rememberMeStatus = await AsyncStorage.getItem('rememberMeStatus');
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');

        if (rememberMeStatus === 'true') {
          setSelection(true);
          setEmail(savedEmail || '');
          setEmailError('');
          setPassword(savedPassword || '');
        } else {
          setSelection(false);
          setEmail('');
          setEmailError('');
          setPassword('');
        }
      };

      init();
    }, [])
  );

  // Function to handle the sign-in process
  const handleSignIn = async () => {
    // Check if both email and password are filled
    if (!email || !password) {
      setShowOverlay(true);

      Alert.alert('Missing Information', 'Please enter both email and password.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);

      return;
    }

    // Attempt to sign in the user
    const result = await signInUser(email, password);
    if (result.success) {
      setUserId(result.userId);

      // Check if "Remember me" is selected
      if (isSelected) {
        await AsyncStorage.setItem('rememberMeStatus', 'true');
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.setItem('rememberMeStatus', 'false');
        setEmail('');
        setPassword('');
      }

      if (result.isNewUser) {
        navigation.navigate('Userinfo');
      } else {
        navigation.navigate('BottomTabs');
      }
    } else {
      let buttons = [{ text: 'OK', onPress: () => setShowOverlay(false) }];

      if (result.error === 'Please verify your email before signing in.') {
        buttons.push({
          text: 'Resend Email',
          onPress: () => {
            handleResendEmail();
            setShowOverlay(false);
          }
        });
      }

      setShowOverlay(true);
      Alert.alert('Login Error', result.error, buttons);
    }
  };

  // Function to resend verification email
  const handleResendEmail = async () => {
    const result = await resendVerificationEmail(email);
    if (result.success) {
      setShowOverlay(true);
      Alert.alert('Email Sent', 'Verification email has been resent. Please check your inbox.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
    } else {
      setShowOverlay(true);
      Alert.alert('Error', result.error, [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
    }
  };

  // Handle the google signin process
  const onGoogleButtonPress = async () => {
    const result = await handleGoogleSignIn();
    if (result.success) {
      setUserId(result.userId);
      if (result.isNewUser) {
        navigation.navigate('Userinfo');
      } else {
        navigation.navigate('BottomTabs');
      }
    } else {
      setShowOverlay(true);
      Alert.alert('Login failed', result.error, [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
    }
  };

  // Function to handle navigation to the "Forgot Password" screen
  const handleForgotPassword = async () => {
    navigation.navigate('Forgot Password');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.headerText,
            Platform.OS === 'ios' ? styles.headerTextIOS : null,
          ]}>
          Welcome back!
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputWithIcon}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={(text) => {
              setEmail(text);
              validateEmail(text);
            }}
            value={email}
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <View style={styles.inputWithIcon}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            onChangeText={setPassword}
            value={password}
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

        <View style={styles.forgotAndRememberContainer}>
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setSelection(!isSelected)}>
            <View
              style={[
                styles.checkbox,
                isSelected ? styles.checkboxSelected : null,
              ]}>
              {isSelected && <Icon name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>SIGN IN</Text>
        </TouchableOpacity>
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.socialIconsContainer}>
          <TouchableOpacity
            onPress={onGoogleButtonPress}
            style={styles.socialIconButton}>
            <View style={styles.socialIconCircle}>
              <Image source={googleIcon} style={styles.socialIcon} />
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.signUpContainer,
            Platform.OS === 'ios' ? styles.signUpContainerIOS : null,
          ]}>
          <Text style={styles.signUpText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B0D9B1',
  },
  headerContainer: {
    marginTop: 30,
    marginLeft: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  headerTextIOS: {
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 50,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 60,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  forgotAndRememberContainer: {
    width: '100%',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
  },
  forgotPasswordText: {
    textDecorationLine: 'underline',
    color: '#000',
    marginBottom: 15,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  checkbox: {
    height: 15,
    width: 15,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 2,
  },
  checkboxSelected: {
    backgroundColor: '#5E8C61',
    borderColor: '#5E8C61',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeText: {
    color: '#1F2937',
  },
  signInButton: {
    width: 342,
    height: 45,
    backgroundColor: '#B0D9B1',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  orText: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 8,
    marginTop: 15,
    marginBottom: 15,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 15,
  },
  socialIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#BABABA',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  socialIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  signUpContainer: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpContainerIOS: {
    marginTop: 150,
  },
  signUpText: {
    color: '#000',
  },
  signUpButtonText: {
    textDecorationLine: 'underline',
    color: '#5E8C61',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default SignInScreen;
