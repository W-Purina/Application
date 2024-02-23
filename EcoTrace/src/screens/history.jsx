import React, { useState, useEffect } from 'react';
import { Text, View, ImageBackground, StyleSheet, Dimensions, Button, Image, Modal, TouchableOpacity, TextInput} from 'react-native';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { ProgressBar } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const carbonFootprintValue = 2;
const numberOfDaysValue = 300;

const HistoryScreen = ({ navigation }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  });
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: () => 'rgb(0, 100, 0)',
  };

  useEffect(() => {
    handleChartTypeChange('daily');
  }, []); 
  
  const handleChartTypeChange = (chartType) => {
    const data = {
      labels: ['Category 1', 'Category 2', 'Category 3'],
      datasets: [
        {
          data: [Math.random() * 100, Math.random() * 100, Math.random() * 100],
        },
      ],
    };

    setChartData(data);
  };


  //
  const [goalValue, setGoalValue] = useState(600);
  const [inputValue, setInputValue] = useState(goalValue);
  
  const progress = numberOfDaysValue / goalValue
  const leftvalue = goalValue - numberOfDaysValue;
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setInputValue(goalValue)
    setModalVisible(!isModalVisible);
  };

  const handleConfirm = () => {
    setGoalValue(inputValue);
    console.log('User input:', goalValue);
    toggleModal();
  };



  return (
    <View style={{
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
        elevation: 5,
      }}>
        <View style={styles.con1}>
          <Text style={styles.txt1}>My Carbon Footprint</Text>
          <Text style={styles.txt2}>
            {carbonFootprintValue} tons | {numberOfDaysValue} days
          </Text>
        </View>
        <View style={{
          borderRadius: 10,
          width: screenWidth * 0.8,
          marginLeft: screenWidth * 0.07,
          marginTop: 30,
          height: screenHeight * 0.16,
          backgroundColor: 'white',
          elevation: 5,
        }}>
          <View style={styles.con2}>
            <View style={styles.con3}>
              <View style={styles.goalicon}></View>
              <Text style={styles.txt3}>Goal</Text>
            </View>
            <View style={styles.con3}>
              <Text style={styles.txt4}>{goalValue} Tons</Text>
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
                  <View style={styles.con2}>
                  <Text style={styles.txt2}>Please Input Your Goal</Text>
                  <TouchableOpacity onPress={toggleModal}>
                    <Image
                      source={require('../../src/theme/images/icon_close.png')} 
                      style={{ width: 20, height: 20,marginTop:-15,marginRight:-50,}}
                    />
                  </TouchableOpacity>
                  </View>
                    <TextInput
                    style={styles.input}
                    placeholder="Enter Your Goal..."
                    keyboardType="numeric"
                    onChangeText={(text) => setInputValue(text)}
                  />

                  <View style={{
                     justifyContent: 'center', 
                     alignItems: 'center', 
                     marginTop:8,
                     }}>
                  <TouchableOpacity onPress={handleConfirm}
                  style={{
                    backgroundColor: '#9DE471',
                    padding: 10,
                    borderRadius: 5,
                    width:'50%',
                    alignItems: 'center',
                    color:'black',
                  }}>
                    <Text>Confirm</Text>
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
            <Text style={styles.txt5}>{numberOfDaysValue} Tons Spent</Text>
            <Text style={styles.txt5}>{leftvalue} Tons Left</Text>
          </View>
        </View>
        <View>
        <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleChartTypeChange('daily')}
        >
          <Text>Daily</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleChartTypeChange('weekly')}
        >
          <Text>Weekly</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleChartTypeChange('monthly')}
        >
          <Text>Monthly</Text>
        </TouchableOpacity>
      </View>

      {chartData.labels.length > 0 && (
        <BarChart
          data={chartData}
          width={300}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      )}
    </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  con1: {
    borderBottomColor: 'rgba(44,40,51,0.3)',
    borderBottomWidth: 1,
    marginRight: 20,
    marginLeft: 20,
    marginTop: 20,
  },
  con2: {
    marginTop: 18,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txt1: {
    fontSize: 17,
    color: 'black',
    fontWeight: '700',
    fontFamily: 'serif',
  },
  txt2: {
    marginTop: 5,
    marginBottom: 8,
    fontSize: 14,
    color: 'rgba(38, 45, 55,1)',
    fontWeight: '600',
    fontFamily: 'serif',
  },
  txt3: {
    color: '#293230',
    fontSize: 18,
    fontWeight: '400',
  },
  txt4: {
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
    marginRight:10,
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
  iconStyle: {
    width: 18,
    height: 18,
    marginTop:2,
  },
  con3:{
    flexDirection: 'row',
  },
  modalContainer: {
    height:'35%',
    width:'80%',
    top:'15%',
    left:'9%',
    backgroundColor: 'white', 
    borderRadius:20,
    padding:15,
  },
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width:'100%',
    height:'100%',
  },
  goalicon:{
    backgroundColor:"#A5D190",
    borderRadius:50,
    height:20,
    width:20,
    marginTop:2,
    marginRight:6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 40,
    marginTop:5,
    marginBottom: 10,
  },
  container: {
    marginTop:10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width:80,
    height:40,
    padding: 6,
    margin:10,
    borderRadius: 5,
    backgroundColor: '#E7EAEE',
  },
  chart: {
    marginTop: 20,
  },
});

export default HistoryScreen;