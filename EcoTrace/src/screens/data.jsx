import React, { useState } from 'react';
import { Text, View, StyleSheet, Dimensions, Image, Modal, TouchableOpacity, TextInput, ScrollView, BackHandler, Alert, ActivityIndicator } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { VictoryPie, VictoryLegend, VictoryLabel } from 'victory-native';
import { fetchUsertotalCarbonEmission, fetchYearlyCarbonEmissionGoal, updateYearlyCarbonEmissionGoal, getWeeklyCarbonEmission, getMonthlyCarbonEmission, getYearlyCarbonEmission, fetchHistory } from './firestore.js';
import { useUser } from './userContext.js';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const DataScreen = ({ navigation }) => {
  const { userId } = useUser();
  const [totalCarbonEmission, setTotalCarbonEmission] = useState(0);
  const [yearlyCarbonEmission, setYearlyCarbonEmission] = useState(0);
  const [goalValue, setGoalValue] = useState(0);
  const [inputValue, setInputValue] = useState(goalValue);
  const maxProgress = 1;
  const progress = goalValue > 0 ? Math.min(yearlyCarbonEmission / goalValue, maxProgress) : 0;
  const leftvalue = Math.max(goalValue - yearlyCarbonEmission, 0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [monthlyEmissions, setMonthlyEmissions] = useState(new Array(12).fill(null));
  const [weeklyEmissions, setWeeklyEmissions] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);

  // (1) Update the goal value
  const toggleModal = () => {
    setInputValue(goalValue)
    setModalVisible(!isModalVisible);
  };

  // Function to handle distance input changes
  const handleGoalChange = (text) => {
    // Check if the input text is a number with up to two decimal places
    if (/^\d*\.?\d{0,2}$/.test(text)) {
      setInputValue(text);
    }
  };
  const handleConfirm = async () => {
    const newGoal = inputValue;
    if (isNaN(newGoal) || newGoal <= 0) {
      Alert.alert('Please enter a valid numerical value.');
      return;
    }

    const result = await updateYearlyCarbonEmissionGoal(userId, newGoal);
    if (result.success) {
      setGoalValue(newGoal);
    }

    toggleModal();
  };


  // (2) My carbon footprint trend - retrieve monthly carbon footprint data
  const handleChartTypeChange = (timeRange) => {
    setSelectedTimeRange(timeRange)
  }

  // Set month line chart data
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let monthLineChartData = {
    labels: monthLabels,
    datasets: [
      {
        data: monthlyEmissions.map(emission => emission ?? 0),
        color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  // Set week line chart data
  let currentMonthWeekLabels = [];
  for (let week = 1; week <= 4; week++) {
    currentMonthWeekLabels.push(`Week ${week}`);
  }
  let weekLineChartData = {
    labels: currentMonthWeekLabels,
    datasets: [
      {
        data: weeklyEmissions.map(emission => emission ?? 0),
        color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };


  // (3) My Transport methods - retrieve 'adjustedMode' 
  const [pieChartData, setPieChartData] = useState([
    { x: "Walk", y: 0 },
    { x: "Bike", y: 0 },
    { x: "Drive", y: 0 },
    { x: "Transit", y: 0 },
  ]);

  const processHistoryData = (historyData) => {
    const modeSums = historyData.reduce((sums, entry) => {
      const mode = entry.adjustedMode.toLowerCase();
      if (!sums[mode]) {
        sums[mode] = 0;
      }
      sums[mode]++;
      return sums;
    }, {});

    const totalModes = Object.values(modeSums).reduce((sum, value) => sum + value, 0);

    const modeColors = {
      walking: "rgba(46, 204, 113, 0.6)", // Green for Walk
      bicycling: "rgba(52, 152, 219, 0.6)", // Blue for Bike
      driving: "rgba(231, 76, 60, 0.6)", // Red for Drive
      transit: "rgba(241, 196, 15, 0.6)" // Yellow for Transit
    };

    const processedData = Object.keys(modeSums).map(mode => ({
      x: mode.charAt(0).toUpperCase() + mode.slice(1),
      y: modeSums[mode],
      label: `${(modeSums[mode] / totalModes * 100).toFixed(1)}%`,
      fill: modeColors[mode]
    }));

    return processedData.filter(data => data.y > 0);
  };


  // (4) Gets data from the database when the component is loaded
  useFocusEffect(
    React.useCallback(() => {

      // Load data
      let isActive = true;
      const loadData = async () => {
        try {
          // 1)
          const yearlyGoal = await fetchYearlyCarbonEmissionGoal(userId);
          // 2)
          const currentYear = new Date().getFullYear();
          const yearlyEmission = await getYearlyCarbonEmission(userId, currentYear);
          // 3)
          const monthlyEmissionsData = [];
          for (let month = 1; month <= 12; month++) {
            const emissionForMonth = await getMonthlyCarbonEmission(userId, currentYear, month);
            monthlyEmissionsData.push(emissionForMonth || null);
          }
          // 4)
          const currentMonth = new Date().getMonth() + 1;
          const weeklyEmissionsData = [];
          for (let week = 1; week <= 4; week++) {
            const emissionForWeek = await getWeeklyCarbonEmission(userId, currentYear, currentMonth, week);
            weeklyEmissionsData.push(emissionForWeek || null);
          }
          // 5)
          const historyData = await fetchHistory(userId);

          if (isActive) {
            setGoalValue(yearlyGoal);
            setYearlyCarbonEmission(yearlyEmission);
            setMonthlyEmissions(monthlyEmissionsData);
            setWeeklyEmissions(weeklyEmissionsData);
            const pieData = processHistoryData(historyData);
            setPieChartData(pieData);
          }

        } catch (error) {
          console.log('Error loading data:', error);
        } finally {
          setIsLoading(false);
        }
      }
      loadData();

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

    }, [userId, navigation])
  );

  if (isLoading) {
    return <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      <View style={styles.greenHeader}>
        <View style={styles.logoContainer}>
          <Image source={require('../theme/images/logo.png')} style={styles.logo} />
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* title */}
        <View style={styles.titleContainer}>
          <Text style={styles.txt1}>My Carbon Footprint in Transport</Text>

        </View>

        {/* goal */}
        <View style={styles.goalContainer}>
          <View style={styles.con2}>
            <View style={styles.con3}>
              <View style={styles.goalicon}></View>
              <Text style={styles.txt3}>Yearly Goal</Text>
            </View>
            <View style={styles.con3}>
              <Text style={styles.txt4}>{goalValue} kg</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Image
                  source={require('../../src/theme/images/icon_edit.png')}
                  style={styles.iconStyle}
                />
              </TouchableOpacity>
            </View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={toggleModal}
            >
              <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                  {/* Modal content goes here */}
                  <View style={styles.modalCon}>
                    <Text style={styles.txt2}>Please Input Your Goal</Text>
                    <TouchableOpacity onPress={toggleModal}>
                      <Image
                        source={require('../../src/theme/images/icon_close.png')}
                        style={{ width: 20, height: 20, marginTop: -15, marginRight: -50, }}
                      />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter Your Goal..."
                    keyboardType="numeric"
                    value={String(inputValue)}
                    onChangeText={handleGoalChange}
                  />
                  <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 8,
                  }}>
                    <TouchableOpacity onPress={handleConfirm}
                      style={{
                        backgroundColor: '#4CAF50',
                        padding: 10,
                        borderRadius: 5,
                        width: '50%',
                        alignItems: 'center',
                        color: 'black',
                      }}>
                      <Text style={{ color: 'white', fontWeight: '700', }}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
          <ProgressBar
            progress={progress}
            color="#A5D190"
            style={styles.probar}
          />
          <View style={styles.con2}>
            <Text style={styles.txt5}>{yearlyCarbonEmission.toFixed(2)} kg Spent</Text>
            <Text style={styles.txt5}>{leftvalue.toFixed(2)} kg Left</Text>
          </View>
        </View>
      </View>


      {/* user carbon footprint trend */}
      <View style={styles.subsequentContainer}>
        <Text style={styles.sectionTitle}>My Carbon Footprint Trend</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, selectedTimeRange === 'weekly' ? styles.activeButton : null]}
            onPress={() => handleChartTypeChange('weekly')}
          >
            <Text style={selectedTimeRange === 'weekly' ? styles.activeButtonText : null}>Weekly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, selectedTimeRange === 'monthly' ? styles.activeButton : null]}
            onPress={() => handleChartTypeChange('monthly')}
          >
            <Text style={selectedTimeRange === 'monthly' ? styles.activeButtonText : null}>Monthly</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lineContainer}>
          <LineChart
            data={selectedTimeRange === 'monthly' ? monthLineChartData
              : selectedTimeRange === 'weekly' ? weekLineChartData
                : null}
            width={Dimensions.get("window").width - 40}
            height={250}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 2,
              color: (opacity = 1) => `#fff`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "3",
                strokeWidth: "2",
                stroke: "#2ecc71"
              },
              propsForBackgroundLines: {
                stroke: "none"
              },
              withShadow: false,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </View>


      {/* user tranport methods */}
      <View style={styles.subsequentContainer2}>
        <Text style={styles.sectionTitle}>My Transport Methods</Text>
        <View style={styles.pieLegendContainer}>
          <View style={styles.pieContainer}>
            <VictoryPie
              data={pieChartData}
              width={Dimensions.get("window").width - 40}
              height={300}
              innerRadius={40}
              labelRadius={({ innerRadius }) => innerRadius + 20}
              style={{
                labels: { fill: "#505050", fontSize: 14, fontWeight: 'bold' },
                data: { fill: ({ datum }) => datum.fill },
              }}
              labels={({ datum }) => `${datum.y > 0 ? datum.label : ''}`}
            />
          </View>
          <View style={styles.legendContainer}>
            <VictoryLegend
              orientation="vertical"
              gutter={20}
              data={[
                { name: "Walk", symbol: { fill: "rgba(46, 204, 113, 0.6)" } },
                { name: "Bike", symbol: { fill: "rgba(52, 152, 219, 0.6)" } },
                { name: "Drive", symbol: { fill: "rgba(231, 76, 60, 0.6)" } },
                { name: "Transit", symbol: { fill: "rgba(241, 196, 15, 0.6)" } },
              ]}
            />
          </View>
        </View>
      </View>


    </ScrollView >
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
  titleContainer: {
    borderBottomColor: 'rgba(44,40,51,0.3)',
    borderBottomWidth: 1,
    marginRight: 20, marginTop: -screenHeight * 0.20,
    marginLeft: 20,
    marginTop: 20,
    paddingBottom: 20,
    alignSelf: 'center',
  },
  txt1: {
    fontSize: 20,
    color: 'black',
    fontWeight: '700',
  },
  goalContainer: {
    borderRadius: 10,
    width: screenWidth * 0.8,
    marginLeft: screenWidth * 0.07,
    marginTop: 30,
    marginBottom: 30,
    height: screenHeight * 0.16,
    backgroundColor: 'white',
    elevation: 5,
  },
  con2: {
    marginTop: 18,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  con3: {
    marginTop: 18,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  con3: {
    flexDirection: 'row',
  },
  goalicon: {
    backgroundColor: "#A5D190",
    borderRadius: 50,
    height: 20,
    width: 20,
    marginTop: 2,
    marginRight: 6,
  },
  txt3: {
    color: '#293230',
    fontSize: 17,
    fontWeight: '600',
  },
  txt4: {
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  iconStyle: {
    width: 18,
    height: 18,
    marginTop: 2,
  },
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    width: '80%',
    top: '15%',
    left: '9%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
  },
  modalCon: {
    marginTop: 18,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txt2: {
    marginTop: -10,
    marginBottom: 8,
    fontSize: 18,
    color: 'rgba(38, 45, 55,1)',
    fontWeight: '600',
  },
  probar: {
    marginTop: 10,
    marginBottom: -8,
    marginHorizontal: 20,
    height: 25,
    borderRadius: 50,
  },
  txt5: {
    color: '#5A6D69',
    fontSize: 12,
    fontWeight: '400',
  },
  subsequentContainer: {
    marginTop: 20,
    borderRadius: 20,
    width: screenWidth * 0.95,
    marginLeft: 10,
    marginRight: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  subsequentContainer2: {
    marginTop: 20,
    borderRadius: 20,
    width: screenWidth * 0.95,
    height: 300,
    marginLeft: 10,
    marginRight: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 40,
    marginTop: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 40,
    padding: 6,
    margin: 10,
    borderRadius: 5,
    backgroundColor: '#E7EAEE',
  },
  lineContainer: {
    marginHorizontal: 10,
  },
  pieLegendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  pieContainer: {
    marginTop: -150,
    marginBottom: -50,
  },
  legendContainer: {
    width: Dimensions.get("window").width - 250,
    marginTop: 80,
    alignItems: 'flex-start',
  },
  activeButton: {
    backgroundColor: '#E8F5E9',
  },
  activeButtonText: {
    color: '#5E8C61',
    fontWeight: 'bold',
  },

});

export default DataScreen;