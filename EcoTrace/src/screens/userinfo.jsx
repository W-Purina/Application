import React, { useState, useContext, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  BackHandler,
} from 'react-native';
import { useUser } from './userContext.js';
import { saveVehicleInfo, saveOrUpdateUserName, uploadImage, saveImageUrlToFirestore, } from './firestore.js';
import AppContext from '../theme/AppContext';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const UserinfoScreen = ({ navigation }) => {
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const [filteredData, setFilteredData] = React.useState(null);
  const [currentDataSet, setCurrentDataSet] = useState(null);
  const [ds, setds] = React.useState(null);
  const { userId } = useUser();
  const [userName, setUserName] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState({});
  const { setShowOverlay,selectedImageUri } = useContext(AppContext);

  // Function to navigate to SetUserImageScreen
  const navigateToSetUserImageScreen = () => {
    navigation.navigate('Set Avatar');
  };

  // Push back to all boxes
  const handleSearch = text => {
    setQuery(text);
    if (text === '') {
      setFilteredData(currentDataSet.sort());
    } else {
      const filtered = currentDataSet.filter(item =>
        item.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredData(filtered.sort());
    }
  };

  const handleItemPress = item => {
    setSelectedItem(item);
    setQuery(item);
  };

  const handleConfirm = () => {
    const updatedVehicleInfo = { ...vehicleInfo };
    switch (ds) {
      case 1:
        updatedVehicleInfo.carBrand = selectedItem;
        break;
      case 2:
        updatedVehicleInfo.carYear = selectedItem;
        break;
      case 3:
        updatedVehicleInfo.fuelType = selectedItem;
        break;
      case 4:
        updatedVehicleInfo.carType = selectedItem;
        break;
    }

    setQuery('');
    toggleModal();
    setVehicleInfo(updatedVehicleInfo);
  };

  const handleNoCar = async () => {
    // Check if username is entered
    if (!userName.trim()) {
      setShowOverlay(true);
      Alert.alert(
        'Missing Information',
        'Please enter your name before proceeding.',
        [{ text: 'OK', onPress: () => setShowOverlay(false) }],
      );
      return;
    }

    // If username is entered, proceed with setting vehicle info and saving username
    const vehicleInfo = {
      carBrand: null,
      carYear: null,
      fuelType: null,
      carType: null,
    };
    setVehicleInfo(vehicleInfo);

    if (selectedImageUri ) {
      try {
        const uploadedImageUrl = await uploadImage(userId, selectedImageUri );
        if (uploadedImageUrl) {
          await saveImageUrlToFirestore(userId, uploadedImageUrl);
          await saveOrUpdateUserName(userId, userName);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    } else {
      await saveOrUpdateUserName(userId, userName);
    }

    navigation.navigate('BottomTabs');
  };

  const handleStore = async () => {
    // Check if all required inputs are filled out
    if (
      !userName.trim() ||
      !vehicleInfo.carBrand ||
      !vehicleInfo.carYear ||
      !vehicleInfo.fuelType ||
      !vehicleInfo.carType
    ) {
      setShowOverlay(true);
      Alert.alert(
        'Missing Information',
        "Please fill out all fields. If you don't have a car, enter your name and select 'No Car? Use Average'.",
        [{ text: 'OK', onPress: () => setShowOverlay(false) }],
      );
      return;
    }

    // If all necessary information is filled out, save the information and navigate
    if (selectedImageUri ) {
      try {
        const uploadedImageUrl = await uploadImage(userId, selectedImageUri );
        if (uploadedImageUrl) {
          await saveImageUrlToFirestore(userId, uploadedImageUrl);
          await saveOrUpdateUserName(userId, userName);
          await saveVehicleInfo(userId, vehicleInfo);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    } else {
      await saveOrUpdateUserName(userId, userName);
      await saveVehicleInfo(userId, vehicleInfo);
    }

    navigation.navigate('BottomTabs');
  };

  const data1 = [
    'Mercedes_Benz',
    'Porsche',
    'Toyota',
    'Audi',
    'Nissan',
    'Jeep',
    'Kia',
    'Honda',
    'Hyundai',
    'Volkswagen',
    'Mazda',
    'Lexus',
    'Subaru',
    'Volvo',
    'Mitsubishi',
    'Fiat',
    'Others',
  ];
  const data2 = [
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020',
    '2021',
    '2022',
    '2023',
    'others',
  ];
  const data3 = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const data4 = ['Suv', 'Hatchback', 'Sedan'];

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

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
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  return (
    <View style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <View style={styles.greenHeader}></View>
      <View style={styles.mainContainer}>

        <View style={styles.imageHeader}>
          <TouchableOpacity onPress={navigateToSetUserImageScreen}>
            <Image
              source={selectedImageUri  ? { uri: selectedImageUri  } : require('../../src/theme/images/profile_pic.png')}
              style={{ width: 80, height: 80 }}
            />
          </TouchableOpacity>
        </View>


        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Name"
            placeholderTextColor="#555555"
            value={userName}
            onChangeText={setUserName}
          />
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              onPress={() => {
                toggleModal();
                setFilteredData(data1);
                setCurrentDataSet(data1);
                setds(1);
              }}>
              <Text style={styles.buttonText}>
                {vehicleInfo.carBrand
                  ? 'Your Car Brand is :  ' + vehicleInfo.carBrand
                  : 'Click to Select Car Brands'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <TouchableOpacity
              onPress={() => {
                toggleModal();
                setFilteredData(data2);
                setCurrentDataSet(data2);
                setds(2);
              }}>
              <Text style={styles.buttonText}>
                {vehicleInfo.carYear
                  ? 'The Year is :  ' + vehicleInfo.carYear
                  : 'Click to Select Car Year'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <TouchableOpacity
              onPress={() => {
                toggleModal();
                setFilteredData(data3);
                setCurrentDataSet(data3);
                setds(3);
              }}>
              <Text style={styles.buttonText}>
                {vehicleInfo.fuelType
                  ? 'The Fuel type is :  ' + vehicleInfo.fuelType
                  : 'Click to Select Fuel type'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <TouchableOpacity
              onPress={() => {
                toggleModal();
                setFilteredData(data4);
                setCurrentDataSet(data4);
                setds(4);
              }}>
              <Text style={styles.buttonText}>
                {vehicleInfo.carType
                  ? 'The Car type is :  ' + vehicleInfo.carType
                  : 'Click to Select Car type'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TextInput
                style={styles.input2}
                placeholder="Search here ..."
                value={query}
                onChangeText={handleSearch}
              />
              <FlatList
                data={filteredData}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleItemPress(item)}>
                    <Text
                      style={[
                        styles.item,
                        {
                          backgroundColor:
                            selectedItem === item ? 'lightgray' : 'white',
                        },
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={handleConfirm} style={styles.bto}>
                <Text style={styles.buttonText2}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.con3}>
          <TouchableOpacity onPress={handleStore} style={styles.bto1}>
            <Text style={styles.buttonText2}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNoCar} style={styles.bto1}>
            <Text style={styles.buttonText2}>No Car? Use Average</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  screen: {
    width: screenWidth,
    height: screenHeight,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  greenHeader: {
    width: screenWidth,
    height: screenHeight * 0.35,
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
  input: {
    marginTop: 41,
    width: '90%',
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1.5,
    paddingHorizontal: 18,
    alignSelf: 'center',
    borderRadius: 5,
    fontSize: 14,
    color: '#555555',
  },
  pickerContainer: {
    marginTop: 30,
    height: 50,
    width: '90%',
    borderColor: '#D1D5DB',
    borderWidth: 1.5,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    paddingHorizontal: 18,
    color: '#555555',
    fontSize: 14,
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
  },
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
  },
  input2: {
    fontSize: 16,
    height: 55,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  item: {
    marginLeft: 10,
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  bto: {
    height: 50,
    width: '90%',
    backgroundColor: '#609966',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  bto1: {
    height: 45,
    width: '90%',
    backgroundColor: '#609966',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    margin: 8,
  },
  buttonText2: {
    fontWeight: '700',
    fontSize: 16,
    color: 'white',
  },
  con3: {
    marginTop: 40,
  },
});

export default UserinfoScreen;
