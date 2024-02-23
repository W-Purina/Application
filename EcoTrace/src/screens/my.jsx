import React, { useState, useContext } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, Switch, BackHandler, Alert, ActivityIndicator } from 'react-native';
import Header from '../../src/components/header';
import { useUser } from './userContext.js';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchUsername,
  isGoogleSignIn,
  logoutUser,
  fetchProfileImageUrl,
} from './firestore.js';
import AppContext from '../theme/AppContext';


const MenuItem = ({ title, icon, onPress, isSwitch, switchValue, onToggleSwitch }) => {

  return (
    <TouchableOpacity style={styles.menuItem} onPress={isSwitch ? null : onPress}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      {isSwitch ? (
        <Switch
          trackColor={{ false: "#767577", true: "rgb(160, 191, 124)" }}
          thumbColor={switchValue ? "rgb(101, 147, 74)" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onToggleSwitch}
          value={switchValue}
          style={styles.switch}
        />
      ) : (
        <Image source={require('../../src/theme/images/arrow.png')} style={styles.arrow} />
      )}
    </TouchableOpacity>
  );
};


const MyScreen = ({ navigation }) => {
  const { userId } = useUser();
  const [username, setUsername] = useState();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [hasFetchedProfileImageUrl, setHasFetchedProfileImageUrl] = useState(false);
  const { setShowOverlay } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {

      let isActive = true;
      const loadUserData = async () => {
        try {
          const username = await fetchUsername(userId);
          const imageUrl = await fetchProfileImageUrl(userId);
          if (isActive) {
            setUsername(username);
            setProfileImageUrl(imageUrl);
          }
        } catch (error) {
          console.log('Error loading data:', error);
        } finally {
          setIsLoading(false);
        }
      }
      loadUserData();

      // Customize the behavior of the Android hardware back button
      const onBackPress = () => {
        if (navigation.isFocused()) {
          return true;
        }
        return false;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        isActive = false;
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };

    }, [userId, navigation]),
  );


  const toggleNotifications = () => {
    setIsNotificationsEnabled(previousState => !previousState);
  };


  const handlePasswordChangePress = async () => {
    if (await isGoogleSignIn(userId)) {
      setShowOverlay(true);
      Alert.alert('Cannot Change Password', 'Password change is not available for Google sign-in.', [
        { text: 'OK', onPress: () => setShowOverlay(false) }
      ]);
    } else {
      navigation.navigate('Change Password');
    }
  };

  const handleSignOut = async () => {
    const result = await logoutUser(userId);
    if (result.success) {
      navigation.navigate('Welcome');
    }
  };

  const imageSource = profileImageUrl ? { uri: profileImageUrl } : require('../../src/theme/images/profile_pic.png');

  if (isLoading) {
    return <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />;
  }

  return (
    <View >
      <Header />
      <View style={{
        width: '100%',
        position: 'absolute',
        flexDirection: 'row',
      }}>
        <View style={{
          width: 72,
          height: 72,
          marginTop: 22,
          marginLeft: 20,
          borderRadius: 72 / 2,
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0)',

        }}>
          <Image
            source={imageSource}
            style={styles.image}
          />
        </View>
        <View style={{
          marginTop: 45,
          marginLeft: 20,
        }}>
          <Text style={{
            color: 'black',
            fontSize: 18,
            fontWeight: '700',
            fontFamily: 'serif',
            fontSize: 19,
          }}>{username}</Text>

        </View>
      </View>

      <View style={{ width: '100%', marginTop: 20 }}>
        <MenuItem
          title="Profile"
          icon={require('../../src/theme/images/icon_edit_profile.png')}
          onPress={() => navigation.navigate('Edit Profile')}
        />
        <MenuItem
          title="Password"
          icon={require('../../src/theme/images/icon_change_password.png')}
          onPress={handlePasswordChangePress}
        />
        <MenuItem
          title="Push Notifications"
          icon={require('../../src/theme/images/icon_notifications.png')}
          isSwitch={true}
          switchValue={isNotificationsEnabled}
          onToggleSwitch={toggleNotifications}
        />
      </View>

      <View style={{
        width: '100%',
        marginTop: 20,
      }}>
        <MenuItem
          title="Quiz"
          icon={require('../../src/theme/images/icon_quiz.png')}
          onPress={() => navigation.navigate('Prequiz')}
        />
        <MenuItem
          title="Reward"
          icon={require('../../src/theme/images/icon_reward.png')}
          onPress={() => navigation.navigate('Reward')}
        />
        <MenuItem title="About Us" icon={require('../../src/theme/images/icon_info.png')} onPress={() => navigation.navigate('About Us')} />
      </View>

      <View style={{
        width: '100%',
        marginTop: 20,
      }}>
        <MenuItem
          title="Log Out"
          icon={require('../../src/theme/images/icon_logout.png')}
          onPress={handleSignOut}
        />
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
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  arrow: {
    marginLeft: 'auto',
    marginRight: 20,
    width: 18,
    height: 18,
  },
  switch: {
    marginLeft: 'auto',
    marginRight: 20,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  icon: {
    width: 22,
    height: 22,
    marginLeft: 20,
    marginRight: 10,
  },
  menuItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555555',
    fontWeight: '400',
  },


});

export default MyScreen;