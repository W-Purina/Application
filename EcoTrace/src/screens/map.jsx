import React, {useState, useEffect, useContext} from 'react';
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect, useNavigationState} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {useMap, updateMapForRoute} from './MapFunc';
import AppContext from '../theme/AppContext';
import {saveToUserHistory, fetchVehicleInfo} from './firestore';
import {useUser} from './userContext.js';
import {Picker} from '@react-native-picker/picker';
import Geolocation from '@react-native-community/geolocation';

const MapScreen = ({navigation}) => {
  // State declarations
  const {
    region,
    setRegion,
    calculateAndDisplayRoute,
    distanceInfo,
    polyline,
    resetPolyline,
    updateMapForRoute,
    requestLocationPermission,
    setDefaultLocation,
  } = useMap();
  const {locationData} = useContext(AppContext);
  const [startLocationName, setStartLocationName] = useState('');
  const [startLocationAddress, setStartLocationAddress] = useState('');
  const [endLocationName, setEndLocationName] = useState('');
  const [endLocationAddress, setEndLocationAddress] = useState('');
  const [carbonFootprintValue, setCarbonFootprintValue] = useState('');
  const [showBottomOverlay, setShowBottomOverlay] = useState(false);
  const [activeTravelMode, setActiveTravelMode] = useState(null);
  const [currentRouteName, setCurrentRouteName] = useState('');
  const {userId} = useUser();
  const [vehicles, setVehicles] = useState([]);
  const [personalVehicles, setPersonalVehicles] = useState([]);
  const {setShowOverlay} = useContext(AppContext);

  const [route, setRoute] = useState({
    startPoint: null,
    endPoint: null,
  });

  // Function to fetch and set vehicle information
  const loadVehicleInfo = async () => {
    const fetchedVehicles = await fetchVehicleInfo(userId);
    if (fetchedVehicles && fetchedVehicles.length > 0) {
      setVehicles(fetchedVehicles);
      const personalVehicleNames = fetchedVehicles.map(vehicle => vehicle.name);
      setPersonalVehicles(personalVehicleNames);
    } else {
      setVehicles([]);
      setPersonalVehicles([]);
    }
  };

  // Fetch vehicle info when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadVehicleInfo();
    }, [userId]),
  );

  // Process the location data returned from the LocationSearchScreen
  useEffect(() => {
    if (locationData) {
      if (locationData.type === 'start') {
        setStartLocationName(locationData.name);
        setStartLocationAddress(locationData.address);
        setRoute(prevRoute => ({
          ...prevRoute,
          startPoint: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          },
        }));
      } else if (locationData.type === 'end') {
        setEndLocationName(locationData.name);
        setEndLocationAddress(locationData.address);
        setRoute(prevRoute => ({
          ...prevRoute,
          endPoint: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          },
        }));
      }
    }
  }, [locationData]);

  // Navigate to the Location search page
  const goToSearch = type => {
    navigation.navigate('LocationSearch', {type});
  };

  // Function to calculate carbon footprint & set active style when click mode
  const handleTravelModeChange = async mode => {
    if (startLocationName && endLocationName) {
      setActiveTravelMode(mode);
      setShowBottomOverlay(true);

      try {
        let carbonFootprint;
        if (personalVehicles.includes(mode)) {
          const vehicle = vehicles.find(v => v.name === mode);
          if (vehicle) {
            carbonFootprint = await calculateAndDisplayRoute(
              startLocationAddress,
              endLocationAddress,
              mode.toLowerCase(),
              vehicle.carBrand,
              vehicle.carType,
            );
          }
        } else {
          if (startLocationAddress && endLocationAddress) {
            carbonFootprint = await calculateAndDisplayRoute(
              startLocationAddress,
              endLocationAddress,
              mode.toLowerCase(),
            );
          }
        }

        if (carbonFootprint && carbonFootprint.success === false) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: carbonFootprint.error,
            visibilityTime: 3000,
          });
        } else {
          setCarbonFootprintValue(carbonFootprint);
          const {startPoint, endPoint} = route;
          updateMapForRoute(startPoint, endPoint);
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'An unknown error occurred',
          visibilityTime: 3000,
        });
        console.log(error);
      }
    } else {
      Toast.show({
        type: 'info',
        text1: 'Missing Information',
        text2: 'Please enter start and end locations',
        visibilityTime: 3000,
      });
    }
  };

  // Function to switch overlay display
  const toggleOverlays = () => {
    if (startLocationName && endLocationName && activeTravelMode) {
      setShowBottomOverlay(!showBottomOverlay);
    }
  };

  // Storage firebase
  const addToHistory = async () => {
    const currentDate = new Date().toLocaleDateString('en-CA');
    const currentTime = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const timestamp = `${currentDate}T${currentTime}:00`;

    let adjustedMode;
    if (personalVehicles.includes(activeTravelMode)) {
      adjustedMode = 'driving';
    } else {
      adjustedMode = activeTravelMode.toLowerCase();
    }

    // Construct the history object to be stored
    const historyEntry = {
      timestamp,
      adjustedMode,
      travelMode: activeTravelMode,
      carbonFootprint: carbonFootprintValue,
      mileage: distanceInfo,
    };

    try {
      setShowOverlay(true);
      await saveToUserHistory(userId, historyEntry);
      Alert.alert(
        'Success',
        'The record has been successfully added to the history.',
        [
          {
            text: 'OK',
            onPress: () => {
              setStartLocationName('');
              setStartLocationAddress('');
              setEndLocationName('');
              setEndLocationAddress('');
              setActiveTravelMode(null);
              setCarbonFootprintValue('');
              setShowBottomOverlay(false);
              resetPolyline();
              setShowOverlay(false);
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error adding history:', error);
    }
  };


  // Extract the active route name
  const routeName = useNavigationState(
    state => state.routes[state.index]?.name,
  );

  // Update the current route name
  useEffect(() => {
    setCurrentRouteName(routeName);
  }, [routeName]);

  // Reset status
  useFocusEffect(
    React.useCallback(() => {
      if (currentRouteName !== 'LocationSearch' && currentRouteName !== 'Map') {
        return () => {
          setStartLocationName('');
          setStartLocationAddress('');
          setEndLocationName('');
          setEndLocationAddress('');
          setActiveTravelMode(null);
          setCarbonFootprintValue('');
          setShowBottomOverlay(false);
          resetPolyline();
        };
      }
    }, [currentRouteName, resetPolyline]),
  );

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
    <View style={styles.container}>
      {region && (
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          onPress={toggleOverlays}>
          {polyline && polyline.length > 0 && (
            <Polyline
              coordinates={polyline}
              strokeColor="#000"
              strokeWidth={3}
            />
          )}
        </MapView>
      )}

      <View style={styles.topOverlay}>
        {/* Start Location Input */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../theme/images/crosshair.png')}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter start location"
            value={startLocationName}
            onFocus={() => goToSearch('start')}
          />
        </View>

        {/* End Location Input */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../theme/images/google-maps.png')}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter end location"
            value={endLocationName}
            onFocus={() => goToSearch('end')}
          />
        </View>

        <ScrollView
          horizontal={true}
          contentContainerStyle={styles.buttonContainer}
          showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.button,
              activeTravelMode === 'Walking' && styles.activeButton,
            ]}
            onPress={() => handleTravelModeChange('Walking')}>
            <MaterialCommunityIcons
              name="walk"
              size={24}
              color={activeTravelMode === 'Walking' ? '#5E8C61' : 'black'}
            />
            <Text
              style={[
                styles.buttonText,
                activeTravelMode === 'Walking' && styles.activeButtonText,
              ]}>
              Walk
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              activeTravelMode === 'Bicycling' && styles.activeButton,
            ]}
            onPress={() => handleTravelModeChange('Bicycling')}>
            <MaterialCommunityIcons
              name="bike"
              size={24}
              color={activeTravelMode === 'Bicycling' ? '#5E8C61' : 'black'}
            />
            <Text
              style={[
                styles.buttonText,
                activeTravelMode === 'Bicycling' && styles.activeButtonText,
              ]}>
              Bike
            </Text>
          </TouchableOpacity>

          {personalVehicles.length <= 1 ? (
            // Button displayed when there is no vehicle or only one vehicle
            <TouchableOpacity
              style={[
                styles.button,
                (personalVehicles.includes(activeTravelMode) ||
                  activeTravelMode === 'Driving') &&
                  styles.activeButton,
              ]}
              onPress={() =>
                handleTravelModeChange(
                  personalVehicles.length === 1
                    ? personalVehicles[0]
                    : 'Driving',
                )
              }>
              <MaterialCommunityIcons
                name="car"
                size={24}
                color={
                  personalVehicles.includes(activeTravelMode) ||
                  activeTravelMode === 'Driving'
                    ? '#5E8C61'
                    : 'black'
                }
              />
              <Text
                style={[
                  styles.buttonText,
                  (personalVehicles.includes(activeTravelMode) ||
                    activeTravelMode === 'Driving') &&
                    styles.activeButtonText,
                ]}>
                Drive
              </Text>
            </TouchableOpacity>
          ) : (
            // Picker displayed when there are multiple cars
            <View
              style={[
                styles.driveContainer,
                activeTravelMode === 'Driving' ||
                personalVehicles.includes(activeTravelMode)
                  ? styles.driveContainerActive
                  : {},
              ]}>
              <MaterialCommunityIcons
                name="car"
                size={24}
                color={
                  activeTravelMode === 'Driving' ||
                  personalVehicles.includes(activeTravelMode)
                    ? '#5E8C61'
                    : 'black'
                }
              />
              <Picker
                selectedValue={activeTravelMode}
                style={styles.drivePicker}
                onValueChange={(itemValue, itemIndex) =>
                  handleTravelModeChange(itemValue)
                }>
                <Picker.Item
                  label="Select Vehicle"
                  value=""
                  style={styles.pickerLabelItem}
                />
                {personalVehicles.map((vehicle, index) => (
                  <Picker.Item
                    key={index}
                    label={vehicle}
                    value={vehicle}
                    style={
                      activeTravelMode === vehicle
                        ? styles.activePickerItem
                        : styles.pickerItem
                    }
                  />
                ))}
              </Picker>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              activeTravelMode === 'Transit' && styles.activeButton,
            ]}
            onPress={() => handleTravelModeChange('Transit')}>
            <MaterialCommunityIcons
              name="train"
              size={24}
              color={activeTravelMode === 'Transit' ? '#5E8C61' : 'black'}
            />
            <Text
              style={[
                styles.buttonText,
                activeTravelMode === 'Transit' && styles.activeButtonText,
              ]}>
              Transit
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {showBottomOverlay && (
        <View style={styles.bottomOverlay}>
          <View style={styles.carbonOutput}>
            <Text style={styles.carbonFootprintUnit}>
              Expected to generate{' '}
            </Text>
            <Text style={styles.carbonFootprint}>{carbonFootprintValue}</Text>
            <Text style={styles.carbonFootprintUnit}> kg CO2e</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addToHistory}>
            <Text style={styles.addButtonText}>Add To Book</Text>
          </TouchableOpacity>
        </View>
      )}

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dimmedBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 10,
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    backgroundColor: '#fff',
    paddingLeft: 10,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 8,
    elevation: 4,
    maxHeight: 45,
  },
  buttonText: {
    fontSize: 14,
    marginLeft: 8,
    color: 'black',
  },
  activeButton: {
    backgroundColor: '#E8F5E9',
  },
  activeButtonText: {
    color: '#5E8C61',
    fontWeight: 'bold',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomContent: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2C333D',
  },
  travelMode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#262D37',
  },
  carbonOutput: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  carbonFootprint: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF4136',
  },
  carbonFootprintReducing: {
    color: '#1B5E20',
  },
  carbonFootprintUnit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C333D',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  driveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 8,
    elevation: 4,
    maxHeight: 40,
    paddingLeft: 10,
  },
  driveContainerActive: {
    backgroundColor: '#E8F5E9',
  },
  drivePicker: {
    width: 150,
  },
  pickerItem: {
    fontSize: 14,
    color: 'black',
  },
  pickerLabelItem: {
    fontSize: 14,
    color: 'gray',
  },
  activePickerItem: {
    color: '#5E8C61',
    fontWeight: 'bold',
  },
});

export default MapScreen;
