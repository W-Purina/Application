import React, { useState } from 'react';
import { Text, View, StyleSheet, Dimensions, Image, Switch, TouchableOpacity, ScrollView } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const MenuItem = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Image source={require('../../src/theme/images/arrow.png')} style={styles.arrow} />
    </TouchableOpacity>
  );
};

const SettingScreen = ({ navigation }) => {

  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
    if (!isEnabled) {
    } else {
    }
  };

  return (
    <ScrollView style={{
      width: screenWidth,
      height: screenHeight,
    }}>
      <View style={{
        width: screenWidth,
        height: screenHeight * 0.28,
        top: 0,
        backgroundColor: '#B0D9B1',
      }}>
      </View>
      <View style={{
        borderRadius: 20,
        width: screenWidth * 0.95,
        marginTop: -screenHeight * 0.27,
        height: screenHeight * 0.9,
        marginLeft: 10,
        marginRight: 20,
        backgroundColor: 'white',
        elevation: 3,
      }}>
        <View style={{
          width: '100%',
          flexDirection: 'row',
          paddingBottom: 22,
          borderBottomWidth: 1,
          borderBottomColor: '#CACACA',
        }}>
          <View style={{
            width: 47,
            height: 47,
            marginTop: 22,
            marginLeft: 20,
            borderRadius: 72 / 2,
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0)',

          }}>
            <Image
              source={require('../../src/theme/images/profile_pic.png')}
              style={styles.image}
            />
          </View>
          <View style={{
            marginTop: 32,
            marginLeft: 20,
          }}>
            <Text style={{
              color: 'black',
              fontSize: 18,
              fontWeight: '400',
              fontSize: 19,
            }}>KeepReal</Text>

          </View>
        </View>

        <View style={styles.con1}>
          <Text style={styles.txt1}>Account Settings</Text>
          <MenuItem title="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
          <MenuItem title="Change password" onPress={() => navigation.navigate('ChangePassword')} />
          <View style={styles.con2}>
            <Text style={styles.title}>Push notifications</Text>
            <Switch
              trackColor={{ false: "#767577", true: "rgb(160, 191, 124)" }}
              thumbColor={isEnabled ? "rgb(101, 147, 74)" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              style={styles.switch}
              value={isEnabled}
            />
          </View>
        </View>
        <View style={styles.con3}>
          <Text style={styles.txt1}>More</Text>
          <MenuItem title="Privacy policy" onPress={() => {}} />
          <MenuItem title="Terms and conditions" onPress={() => {}} />
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({

  txt1: {
    marginVertical: 10,
    fontSize: 17,
    color: 'black',
    fontWeight: '700',
  },
  con1: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CACACA',
  },
  con2: {
    marginTop: 15,
    marginBottom: 20,
    flexDirection: 'row',
  },
  con3: {
    paddingHorizontal: 30,
    paddingVertical: 10,
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
  icon: {
    width: 25,
    height: 25,
    marginLeft: 20,
    marginRight: 10,
  },
  menuItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  title: {
    fontWeight: '400',
    fontSize: 15,
    color: '#555555',
  },
  switch: {
    marginLeft: 'auto',
    marginRight: 10,
    transform: [{ scaleX: 1.3 }, { scaleY: 1.2 }],
  }
});

export default SettingScreen;