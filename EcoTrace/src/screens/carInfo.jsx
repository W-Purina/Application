import React, { useState, useEffect, useContext } from 'react';
import { Text, View, FlatList, StyleSheet, Modal, Image, TextInput, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useUser } from './userContext.js';
import { updateVehicleInfo, saveVehicleInfo, fetchSpecificVehicleInfo, deleteVehicleInfo } from './firestore.js';
import AppContext from '../theme/AppContext';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const CarInfoScreen = ({ navigation, route }) => {

    const [selectedItem, setSelectedItem] = React.useState(null);
    const [query, setQuery] = React.useState('');
    const [filteredData, setFilteredData] = React.useState(null);
    const [currentDataSet, setCurrentDataSet] = useState(null);
    const [ds, setds] = React.useState(null);
    const { userId } = useUser();
    const [vehicleInfo, setVehicleInfo] = useState({});
    const [originalVehicleInfo, setOriginalVehicleInfo] = useState({});
    const vehicleId = route.params?.vehicleId;
    const { setShowOverlay } = useContext(AppContext);
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

    useEffect(() => {
        const loadVehicleData = async () => {
            if (vehicleId) {
                try {
                    const vehicleData = await fetchSpecificVehicleInfo(userId, vehicleId);
                    if (vehicleData) {
                        setVehicleInfo(vehicleData);
                        setOriginalVehicleInfo(vehicleData);
                    } else {
                        console.log('No vehicle data found for ID:', vehicleId);
                    }
                } catch (error) {
                    console.error('Error fetching vehicle info:', error);
                }
            }
        };

        loadVehicleData();
    }, [userId, vehicleId]);


    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

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
        if (!selectedItem) {
            Alert.alert("Error", "Please select an option", [
                { text: 'OK' }
            ]);
            return;
        }

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

    const handleStore = async () => {
        setShowOverlay(true);
        try {
            if (vehicleId && JSON.stringify(vehicleInfo) === JSON.stringify(originalVehicleInfo)) {
                Alert.alert("Notice", "No changes were made to the vehicle information", [
                    {
                        text: 'OK', onPress: () => {
                            setShowOverlay(false);
                            navigation.goBack();
                        }
                    },
                ]);
                return;
            }

            if (vehicleId) {
                await updateVehicleInfo(userId, vehicleId, vehicleInfo);
                Alert.alert('Success', 'Vehicle information updated successfully', [
                    {
                        text: 'OK', onPress: () => {
                            setShowOverlay(false);
                            navigation.goBack();
                        }
                    },
                ]);
            } else {
                if (!vehicleId && (!vehicleInfo.carBrand || !vehicleInfo.carYear || !vehicleInfo.fuelType || !vehicleInfo.carType)) {
                    Alert.alert("Error", "Please complete all fields before submitting", [
                        {
                            text: 'OK', onPress: () => {
                                setShowOverlay(false);
                            }
                        },
                    ]);
                    return;
                }
                await saveVehicleInfo(userId, vehicleInfo);
                Alert.alert('Success', 'Vehicle information saved successfully', [
                    {
                        text: 'OK', onPress: () => {
                            setShowOverlay(false);
                            navigation.goBack();
                        }
                    },
                ]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update or add vehicle information");
        }

    };

    const handleDelete = async () => {
        Alert.alert(
            "Delete Vehicle",
            "Are you sure you want to delete this vehicle?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        setShowOverlay(true);
                        try {
                            await deleteVehicleInfo(userId, vehicleId);
                            Alert.alert('Success', 'Vehicle information deleted successfully', [
                                {
                                    text: 'OK', onPress: () => {
                                        setShowOverlay(false);
                                        navigation.goBack();
                                    }
                                },
                            ]);
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete vehicle information");
                        }
                    }
                }
            ]
        );
    };


    return (
        <View style={styles.screen} contentContainerStyle={styles.contentContainer}>
            <View style={styles.greenHeader}></View>
            <View style={styles.mainContainer}>

                <View>
                    <View style={styles.pickerContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                toggleModal();
                                setFilteredData(data1);
                                setCurrentDataSet(data1);
                                setds(1);
                            }}>
                            <Text style={styles.buttonText}>
                                {vehicleInfo.carBrand ? `Your Car Brand is:  ${vehicleInfo.carBrand}` : 'Click to Select Car Brands'}
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
                                    ? `The Year is :  ${vehicleInfo.carYear}`
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
                                    ? `The Fuel type is :  ${vehicleInfo.fuelType}`
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
                                    ? `The Car type is :  ${vehicleInfo.carType}`
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

                            {/* Close modal button */}
                        </View>
                    </View>
                </Modal>
                <View style={styles.con3}>
                    <TouchableOpacity onPress={handleStore} style={styles.bto1}>
                        <Text style={styles.buttonText2}>Confirm</Text>
                    </TouchableOpacity>
                    {vehicleId && (
                        <TouchableOpacity onPress={handleDelete} style={styles.bto1}>
                            <Text style={styles.buttonText2}>Delete</Text>
                        </TouchableOpacity>
                    )}
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
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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

export default CarInfoScreen;
