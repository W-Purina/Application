import React, {useContext} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/Feather';
import AppContext from '../theme/AppContext';
import {getPlaceDetails} from './MapFunc';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const LocationSearchScreen = ({navigation, route}) => {
  // Setting global location data
  const {setLocationData} = useContext(AppContext);
  // Get the type from the route parameter
  const {type} = route.params;

  // Processing location selection
  const handleLocationSelect = async data => {
    try {
      const coords = await getPlaceDetails(data.place_id);
      if (coords) {
        setLocationData({
          type,
          name: data.structured_formatting.main_text,
          address: data.description,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        navigation.goBack();
      } else {
        console.error('Failed to fetch place details');
      }
    } catch (error) {
      console.error('Error in handleLocationSelect:', error);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="chevron-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search for a place</Text>
      </View>
      <View style={styles.contentContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search for a place"
          onPress={data => {
            handleLocationSelect(data);
          }}
          query={{
            key: 'AIzaSyA67f3cVdxxrECpPMHIOrjQqjc8i0ogO8s',
            language: 'en',
          }}
          styles={{
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            listView: styles.listView,
            separator: styles.separator,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    width: screenWidth,
    height: screenHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'left',
    width: screenWidth,
    height: screenHeight * 0.28,
    backgroundColor: '#B0D9B1',
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  backButton: {
    marginLeft: 10,
    marginTop: 10,
  },
  headerTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: 10,
  },
  contentContainer: {
    borderRadius: 20,
    width: screenWidth * 0.95,
    marginTop: -screenHeight * 0.12,
    marginLeft: screenWidth * 0.025,
    backgroundColor: 'white',
    elevation: 5,
    flex: 1,
    paddingTop: 20,
  },
  textInputContainer: {
    backgroundColor: 'rgba(255,255,255,0)',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
  },
  textInput: {
    height: 38,
    color: '#5d5d5d',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  listView: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
});

export default LocationSearchScreen;
