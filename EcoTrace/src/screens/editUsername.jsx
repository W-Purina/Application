import React, { useState, useContext } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { useUser } from './userContext.js';
import { saveOrUpdateUserName } from './firestore.js';
import AppContext from '../theme/AppContext';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const SetUserNameScreen = ({ navigation, route }) => {
    const { userId } = useUser();
    const [newUserName, setNewUserName] = useState(route.params?.currentUserName || '');
    const currentUserName = route.params?.currentUserName;
    const { setShowOverlay } = useContext(AppContext);

    const handleStore = async () => {
        if (newUserName === currentUserName) {
            setShowOverlay(true);
            Alert.alert('Error', 'New username cannot be the same as the current username', [
                { text: 'OK', onPress: () => setShowOverlay(false) }
            ]);
            return;
        }

        if (!newUserName.trim()) {
            setShowOverlay(true);
            Alert.alert('Error', 'Username cannot be empty', [
                { text: 'OK', onPress: () => setShowOverlay(false) }
            ]);
            return;
        }

        setShowOverlay(true);
        try {
            await saveOrUpdateUserName(userId, newUserName);
            Alert.alert('Success', 'Username updated successfully', [
                {
                    text: 'OK', onPress: () => {
                        setShowOverlay(false);
                        navigation.goBack();
                    }
                },
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update username");
        }
    };


    return (
        <View style={styles.screen} contentContainerStyle={styles.contentContainer}>
            <View style={styles.greenHeader}></View>
            <View style={styles.mainContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={newUserName}
                        onChangeText={setNewUserName}
                        placeholder="Enter new username"
                    />
                </View>

                <View style={styles.con3}>
                    <TouchableOpacity onPress={handleStore} style={styles.bto1}>
                        <Text style={styles.buttonText2}>Confirm</Text>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 41,
        width: '90%',
        height: 50,
        borderColor: '#D1D5DB',
        borderWidth: 1.5,
        paddingHorizontal: 18,
        alignSelf: 'center',
        borderRadius: 5,
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

export default SetUserNameScreen;
