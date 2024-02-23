import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';

const WelcomeScreen = ({ navigation }) => {

  // Customize the behavior of the Android hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.isFocused()) {
          return true;
        }
        return false;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress); 
    }, [navigation])
  );


  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../theme/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>EcoTrace</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.buttonText}>SIGN IN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B0D9B1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#40513B',
  },
  buttonContainer: {
    width: '90%',
    alignItems: 'center',
  },
  signInButton: {
    width: 358,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  signUpButton: {
    width: 358,
    height: 48,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#40513B',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default WelcomeScreen;
