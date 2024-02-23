import React, { useEffect } from 'react';
import { Text, View, ImageBackground, StyleSheet, Dimensions, Image } from 'react-native';

const Onboarding = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Welcome');
    }, 2000); 

    // Clean up the timer to ensure that the callback is not triggered when the component is uninstalled 
    return () => clearTimeout(timer);

  }, [navigation]);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <ImageBackground
      source={require('../../src/theme/images/background1.jpg')}
      style={styles.back_ground}
    >
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: screenHeight * 0.14,
        left: screenWidth * 0.26,
        flexDirection: 'row',
      }}>
        <Image
          source={require('../../src/theme/images/logo.png')}
          style={{
            width: 49,
            height: 49,
            marginTop: -33,
            marginRight: 4,
          }}
        />
        <Text style={styles.title}>EcoTrace</Text>
      </View>

      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: screenHeight * 0.3,
        left: screenWidth * 0.11,
        width: screenWidth * 0.8,
        height: screenHeight * 0.4,
      }}>
        <Text style={styles.text1}>Low Carbon Living, Starting from Every Step</Text>
      </View>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  back_ground: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
  text1: {
    textAlign: 'center',
    color: 'white',
    fontSize: 30,
    fontWeight: '400',
    fontFamily: 'serif',
  },


});
export default Onboarding;