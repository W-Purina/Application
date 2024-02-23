import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useUser } from './userContext.js';
import { fetchUsername, fetchVehicleInfo, fetchProfileImageUrl } from './firestore.js';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const EditProfileScreen = ({ navigation }) => {
  const { userId } = useUser();
  const [userName, setUserName] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState({});
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reload user data
  useFocusEffect(
    React.useCallback(() => {

      // Load user data
      let isActive = true;
      const loadUserData = async () => {
        try {
          const name = await fetchUsername(userId);
          const vehicles = await fetchVehicleInfo(userId);
          const imageUrl = await fetchProfileImageUrl(userId);
          if (isActive) {
            setUserName(name);
            setVehicleInfo(vehicles);
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
    }, [userId])
  );

  const navigateToSetUserAvatarScreen = () => {
    navigation.navigate('Set User Avatar', { imageUrl: profileImageUrl });
  };

  const navigateToSetUserNameScreen = () => {
    navigation.navigate('Set Username', { currentUserName: userName });
  };

  const navigateToCarInfoScreen = (vehicleId) => {
    navigation.navigate('Personal Vehicle', { vehicleId: vehicleId });
  };

  // Decide to display user's profile image or a default image based on the presence of profileImageUrl
  const imageSource = profileImageUrl ? { uri: profileImageUrl } : require('../../src/theme/images/profile_pic.png');

  return (
    <View style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <View style={styles.greenHeader}></View>

      <View style={styles.mainContainer}>
        {isLoading ? (
          <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />
        ) : (
          <>
            {/* User Avatar */}
            <View style={styles.inputContainer1}>
              <Text>User Avatar: </Text>
              <View style={styles.textContainer}>
                <Image
                  source={imageSource}
                  style={styles.image}
                />
              </View>
              <TouchableOpacity onPress={navigateToSetUserAvatarScreen}>
                <Icon name="right" size={20} color="#555" />
              </TouchableOpacity>
            </View>

            {/* User Name Input Field */}
            <View style={styles.inputContainer}>
              <Text>User Name: </Text>
              <View style={styles.textContainer}>
                <TextInput
                  style={styles.input}
                  editable={false}
                  value={userName}
                  onChangeText={setUserName}
                />
                <Icon name="right" size={20} color="#555" onPress={navigateToSetUserNameScreen} />
              </View>

            </View>

            {/* Vehicle Information Display */}
            {vehicleInfo.length > 0 ? (
              vehicleInfo.map((vehicle, index) => (
                <View key={index} style={styles.inputContainer}>
                  <Text>Personal Vehicle: </Text>
                  <View style={styles.textContainer}>
                    <Text style={styles.input}>{vehicle.name}</Text>
                    <Icon name="right" size={20} color="#555" onPress={() => navigateToCarInfoScreen(vehicle.id)} />
                  </View>

                </View>
              ))
            ) : (
              <View />
            )}
            <TouchableOpacity onPress={() => navigation.navigate('Personal Vehicle')} style={styles.updateButton}>
              <Text style={styles.updateButtonText}>Add Personal Vehicle</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

    </View >
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

  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    width: '90%',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingHorizontal: 18,
    alignSelf: 'center',
  },
  inputContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    width: '90%',
    height: 75,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingHorizontal: 18,
    alignSelf: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingRight: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    color: 'black',
  },
  updateButton: {
    marginTop: 40,
    width: '90%',
    backgroundColor: '#609966',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

});

export default EditProfileScreen;
