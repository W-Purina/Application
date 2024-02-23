import React, { useState, useContext, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MonthPicker from 'react-native-month-year-picker';
import Toast from 'react-native-toast-message';
import AppContext from '../theme/AppContext';
import { useUser } from './userContext.js';
import {
  saveToUserHistory,
  fetchHistory,
  deleteRecordFromHistory,
  updateRecordInHistory,
  fetchVehicleInfo,
} from './firestore.js';
import { calculateCarbonFootprint } from './calculate.js';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const BookScreen = ({ navigation }) => {
  // State declarations for handling user inputs and data
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [distance, setdistance] = useState('');
  const [mode, setMode] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [personalVehicles, setPersonalVehicles] = useState([]);
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { setShowOverlay } = useContext(AppContext);
  const { userId } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [currentOpenSwipeable, setCurrentOpenSwipeable] = useState(null);

  // Part One: Data Input and Processing

  // Reset all input fields
  const resetInputFields = () => {
    setDate('');
    setTime('');
    setdistance('');
    setMode('');
    setEditingRecordId(null);
  };

  // Combine date and time into a complete datetime string in ISO format
  const createDateTimeString = (dateString, timeString) => {
    const fullDateTimeString = `${dateString}T${timeString}:00`;
    return fullDateTimeString;
  };

  // Get the mode for calculating the carbon footprint
  const getFootprintMode = mode => {
    const modeMapping = {
      Walking: 'walking',
      Bicycling: 'bicycling',
      Bus: 'bus',
      'Electric Bus': 'electric',
      Rail: 'rail',
      'Taxi Service': 'taxi',
      Driving: 'driving',
    };
    return modeMapping[mode] || mode;
  };

  // Logic to add a new record / edit the record
  const addRecord = async () => {
    // Check if all required fields are filled
    if (!date || !time || !distance || !mode) {
      Toast.show({
        type: 'info',
        text1: 'Missing Information',
        text2: 'Please enter all the details to track.',
        visibilityTime: 3000,
      });
      return;
    }

    // Get the mode for calculating the carbon footprint
    const footprintMode = getFootprintMode(mode).toLowerCase();

    // Calculate the carbon footprint
    let carbonFootprint;
    if (personalVehicles.includes(footprintMode)) {
      const vehicle = vehicles.find(v => v.name === mode);
      if (vehicle) {
        carbonFootprint = await calculateCarbonFootprint(
          distance,
          footprintMode,
          vehicle.carBrand,
          vehicle.carType,
        );
      }
    } else {
      carbonFootprint = await calculateCarbonFootprint(distance, footprintMode);
    }

    // Combine date and time into a complete datetime string
    const timestamp = createDateTimeString(date, time);

    // Adjust the travelMode name based on specific rules：used for data screen display
    if (personalVehicles.includes(mode.toLowerCase())) {
      adjustedMode = 'driving';
    } else {
      switch (mode) {
        case 'Bus':
        case 'Electric Bus':
        case 'Rail':
          adjustedMode = 'transit';
          break;
        case 'Taxi Service':
          adjustedMode = 'driving';
          break;
        default:
          adjustedMode = mode.toLowerCase();
      }
    }

    // Create a new record object
    const newRecord = {
      timestamp,
      mileage: distance,
      travelMode: mode,
      carbonFootprint: carbonFootprint,
      adjustedMode: adjustedMode,
    };

    // Add the new record or edit the record to the user history
    try {
      if (editingRecordId) {
        await updateRecordInHistory(userId, editingRecordId, newRecord);
      } else {
        await saveToUserHistory(userId, newRecord);
      }
      // Immediately fetch the latest records
      const updatedRecords = await fetchHistory(userId);
      setAllRecords(updatedRecords);
      setRecords(filterRecordsByMonth(updatedRecords, selectedMonth));
      resetInputFields();
      Toast.show({
        type: 'success',
        text1: editingRecordId ? 'Record Updated' : 'Record Added',
        text2: editingRecordId
          ? 'The record has been successfully updated.'
          : 'The new record has been successfully added.',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Failed to save record:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save the record.',
        visibilityTime: 3000,
      });
    }
  };

  // Functions for showing/hiding date pickers
  const showDatePicker = () => {
    setDatePickerVisible(true);
    setShowOverlay(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisible(false);
    setShowOverlay(false);
  };
  const handleConfirm = selectedDate => {
    const currentDate = new Date();
    const selectedDateWithoutTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    if (selectedDateWithoutTime > currentDate) {
      // If the selected date is later than the current date
      setShowOverlay(true);
      Alert.alert(
        'Invalid Date',
        'Please select a date that is not in the future.',
        [{ text: 'OK', onPress: () => setShowOverlay(false) }],
      );
      setDatePickerVisible(false);
    } else {
      // If the selected date is today or earlier
      setDatePickerVisible(prevVisible => false);
      const formattedDate = selectedDate.toLocaleDateString('en-CA');
      setDate(formattedDate);
      setShowOverlay(false);
    }
  };

  // Functions for showing/hiding time pickers
  const showTimePicker = () => {
    setTimePickerVisible(true);
    setShowOverlay(true);
  };
  const hideTimePicker = () => {
    setTimePickerVisible(false);
    setShowOverlay(false);
  };
  const handleTimeConfirm = selectedTime => {
    setTimePickerVisible(prevVisible => false);
    const formattedTime = selectedTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    setTime(formattedTime);
    setShowOverlay(false);
  };

  // Function to handle distance input changes
  const handleDistanceChange = text => {
    // Check if the input text is a number with up to two decimal places
    if (/^\d*\.?\d{0,2}$/.test(text)) {
      setdistance(text);
    }
  };

  // Part Two: Data Retrieval and Display

  // Fetching records when the screen is focused
  useFocusEffect(
    React.useCallback(() => {

      // Load data
      let isActive = true;
      const loadData = async () => {
        try {
          // Fetch user's vehicle information
          const fetchedVehicles = await fetchVehicleInfo(userId);
          // Set selected month to the current date
          const currentMoment = moment().toDate();
          setSelectedMonth(currentMoment);
          // Fetch user's records
          const fetchedRecords = await fetchHistory(userId);
          // Filter user's records
          const currentMonthRecords = filterRecordsByMonth(
            fetchedRecords,
            selectedMonth,
          );

          if (isActive) {
            if (fetchedVehicles && fetchedVehicles.length > 0) {
              setVehicles(fetchedVehicles);
              const personalVehicleNames = fetchedVehicles.map(vehicle =>
                vehicle.name.toLowerCase(),
              );
              setPersonalVehicles(personalVehicleNames);
            } else {
              setVehicles([]);
              setPersonalVehicles([]);
            }
            setAllRecords(fetchedRecords);
            setRecords(currentMonthRecords);
          }

        } catch (error) {
          console.log('Error loading data:', error);
        } finally {
          setIsLoading(false);
        }
      }
      loadData();

      return () => {
        isActive = false;
        resetInputFields();
      };
    }, [userId]),
  );

  // Functions for showing/hiding month picker
  const showMonthPicker = () => {
    setMonthPickerVisible(true);
    setShowOverlay(true);
  };
  const hideMonthPicker = () => {
    setMonthPickerVisible(false);
    setShowOverlay(false);
  };
  const handleMonthConfirm = (event, newDate) => {
    hideMonthPicker();
    if (newDate) {
      const newSelectedMonth = moment(newDate).startOf('month').toDate();
      setSelectedMonth(newSelectedMonth);

      let filteredRecords = filterRecordsByMonth(allRecords, newSelectedMonth);
      filteredRecords = sortRecordsByDateAndTime(filteredRecords);
      setRecords(filteredRecords);
    }
  };
  const formatDate = date => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Function to filter records based on a selected month.
  const filterRecordsByMonth = (records, selectedMonth) => {
    return records.filter(record => {
      const recordDate = new Date(record.timestamp);
      return (
        recordDate.getFullYear() === selectedMonth.getFullYear() &&
        recordDate.getMonth() === selectedMonth.getMonth()
      );
    });
  };

  // Function to sort: from newest to oldest
  const sortRecordsByDateAndTime = records => {
    return records.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA; // Sort in descending order
    });
  };

  // Automatically filter records whenever the selectedMonth or allRecords change
  React.useEffect(() => {
    let filteredRecords = filterRecordsByMonth(allRecords, selectedMonth);
    filteredRecords = sortRecordsByDateAndTime(filteredRecords);
    setRecords(filteredRecords);
  }, [selectedMonth, allRecords]);

  // Function to render right actions
  const renderRightActions = (progress, dragX, record) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        onPress={() => deleteRecord(record.id)}
        style={styles.deleteButton}>
        <Animated.View style={[styles.deleteAction, { transform: [{ scale }] }]}>

          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const onSwipeableOpen = (swipeableRef) => {
    currentOpenSwipeable?.close();
    setCurrentOpenSwipeable(swipeableRef);
  };

  // Function to delete record
  const deleteRecord = async (recordId) => {
    setShowOverlay(true);
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            if (currentOpenSwipeable) {
              currentOpenSwipeable.close();
              setCurrentOpenSwipeable(null);
            }

            setShowOverlay(false);
          },
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              if (currentOpenSwipeable) {
                currentOpenSwipeable.close();
                setCurrentOpenSwipeable(null);
              }

              await deleteRecordFromHistory(userId, recordId);

              setTimeout(async () => {
                const updatedRecords = await fetchHistory(userId);
                setAllRecords(updatedRecords);
                setRecords(filterRecordsByMonth(updatedRecords, selectedMonth));
                resetInputFields();
              }, 1000);

              Toast.show({
                type: 'success',
                text1: 'Record Deleted',
                text2: 'The record has been successfully deleted.',
                visibilityTime: 3000,
              });

            } catch (error) {
              console.error('Failed to delete record:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete the record.',
                visibilityTime: 3000,
              });
            } finally {
              setShowOverlay(false);
            }
          },
        },
      ],
      { onDismiss: () => setShowOverlay(false) },
    );
  };

  // Function to edit record.
  const editRecord = record => {
    setDate(new Date(record.timestamp).toLocaleDateString('en-CA'));
    setTime(
      new Date(record.timestamp).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    );
    setdistance(record.mileage.toString());
    setMode(record.travelMode);
    setEditingRecordId(record.id);
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


  // When lose focus, close any potentially open Swipeable component, if it exists
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentOpenSwipeable) {
        currentOpenSwipeable.close();
        setCurrentOpenSwipeable(null)
      }
    });

    return unsubscribe;
  }, [navigation, currentOpenSwipeable]);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.greenHeader}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../theme/images/logo.png')}
                style={styles.logo}
              />
            </View>
          </View>

          <View style={styles.mainContainer}>
            {/* Title */}
            <View style={styles.con1}>
              <Text style={styles.txt1}>Tracking Transportation Progress</Text>
            </View>

            {/* Date Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date:</Text>
              <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                <Text style={styles.dateText}>{date || 'Select Date'}</Text>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={datePickerVisible}
              mode="date"
              date={new Date()}
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />

            {/* Time Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Time:</Text>
              <TouchableOpacity style={styles.input} onPress={showTimePicker}>
                <Text style={styles.dateText}>{time || 'Select Time'}</Text>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={timePickerVisible}
              mode="time"
              date={new Date()}
              onConfirm={handleTimeConfirm}
              onCancel={hideTimePicker}
            />

            {/* Mileage Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mileage(meters):</Text>
              <TextInput
                style={styles.input}
                onChangeText={handleDistanceChange}
                value={distance}
                placeholder="Enter mileage in meters"
                keyboardType="numeric"
              />
            </View>

            {/* Mode Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mode:</Text>
              <Picker
                selectedValue={mode}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) => setMode(itemValue)}>
                <Picker.Item
                  label="Select Mode"
                  value=""
                  style={styles.pickerItem}
                />
                <Picker.Item label="Walking" value="Walking" />
                <Picker.Item label="Bicycling" value="Bicycling" />
                <Picker.Item label="Bus" value="Bus" />
                <Picker.Item label="Electric Bus" value="Electric Bus" />
                <Picker.Item label="Rail" value="Rail" />
                <Picker.Item label="Taxi Service" value="Taxi Service" />
                <Picker.Item label="Driving (Average)" value="Driving" />
                {vehicles.map((vehicle, index) => (
                  <Picker.Item
                    key={index}
                    label={vehicle.name}
                    value={vehicle.name}
                  />
                ))}
                {/* ... other modes ... */}
              </Picker>
            </View>

            {/* Track Button */}
            <TouchableOpacity style={[styles.trackButton]} onPress={addRecord}>
              <Text style={styles.trackButtonText}>TRACK</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subsequentContainer}>
            <View style={styles.recordHeader}>
              <TouchableOpacity
                style={styles.monthPickerButton}
                onPress={showMonthPicker}>
                <Text style={styles.headerText}>{formatDate(selectedMonth)}</Text>
                <MaterialIcons name="arrow-drop-down" size={20} color="black" />
              </TouchableOpacity>
              {monthPickerVisible && (
                <MonthPicker
                  value={selectedMonth}
                  onChange={handleMonthConfirm}
                  locale="en"
                />
              )}
              <Text style={styles.headerText}>Time</Text>
              <Text style={styles.headerText}>Mode</Text>
              <Text style={styles.headerText}>CO2</Text>
            </View>

            {isLoading ? (
              <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />
            ) : (
              <>
                {/* Map through the records and display each record */}
                {records.map((record, index) => (
                  <Swipeable
                    key={record.id}
                    ref={(ref) => {
                      record.swipeableRef = ref;
                    }}
                    renderRightActions={(progress, dragX) =>
                      renderRightActions(progress, dragX, record)
                    }
                    onSwipeableOpen={() => onSwipeableOpen(record.swipeableRef)}
                  >
                    <View key={index} style={styles.recordItem}>
                      {/* Display the formatted date */}
                      <Text style={styles.recordText}>
                        {new Date(record.timestamp).toLocaleDateString()}
                      </Text>
                      {/* Display the time in 24-hour format */}
                      <Text style={styles.recordText}>
                        {new Date(record.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </Text>
                      {/* Display travelMode */}
                      <Text style={styles.recordText}>{record.travelMode}</Text>
                      {/* Display carbonFootprint */}
                      <Text style={styles.recordText}>{record.carbonFootprint}</Text>
                      {/* Edit and Delete buttons */}
                      <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={() => editRecord(record)}>
                          <MaterialIcons name="edit" size={17} color="gray" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Swipeable>
                ))}
              </>
            )}

          </View>
        </ScrollView>

        <Toast />
      </View>
    </GestureHandlerRootView>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  mainContainer: {
    borderRadius: 20,
    width: screenWidth * 0.95,
    marginTop: -screenHeight * 0.13,
    marginLeft: 10,
    marginRight: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  subsequentContainer: {
    marginTop: 20,
    borderRadius: 20,
    width: screenWidth * 0.95,
    marginLeft: 10,
    marginRight: 20,
    backgroundColor: 'white',
    elevation: 2,
    paddingBottom: 20,
    minHeight: 100,
  },
  con1: {
    borderBottomColor: 'rgba(44,40,51,0.3)',
    borderBottomWidth: 1,
    alignSelf: 'stretch',
    paddingVertical: 20,
    marginBottom: 10,
  },
  txt1: {
    fontSize: 17,
    color: 'black',
    fontWeight: '700',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  inputLabel: {
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    padding: 8,
    flexGrow: 1,
    marginLeft: 10,
  },
  dateText: {
    color: 'grey',
  },
  picker: {
    flexGrow: 1,
    marginLeft: 10,
  },
  pickerItem: {
    color: 'grey',
  },
  trackButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  trackButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  recordHeader: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    alignItems: 'center',
  },
  monthPickerButton: {
    width: screenWidth * 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    width: screenWidth * 0.2,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  recordText: {
    width: screenWidth * 0.2,
    textAlign: 'center',
  },
  iconContainer: {
    width: screenWidth * 0.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    width: 80,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BookScreen;
