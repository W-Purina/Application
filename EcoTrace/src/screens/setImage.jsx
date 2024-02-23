import React, { useState, useContext } from 'react';
import { Text, View, TouchableOpacity, Alert, StyleSheet, Dimensions, Image } from 'react-native';
import { useUser } from './userContext.js';
import { uploadImage, saveImageUrlToFirestore } from './firestore.js';
import AppContext from '../theme/AppContext';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const SetUserImageScreen = ({ navigation, route }) => {
    const { userId } = useUser();
    const { imageUrl } = route.params;
    const { setShowOverlay } = useContext(AppContext);

    const takePhoto = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
        };

        launchCamera(options, response => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.error) {
                console.log('Camera Error: ', response.error);
            } else {
                const imageUri = response.uri || response.assets?.[0]?.uri;
                handleImageUpload(imageUri);
            }
        });
    };

    const selectFromLibrary = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
        };

        launchImageLibrary(options, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const imageUri = response.uri || response.assets?.[0]?.uri;
                handleImageUpload(imageUri);
            }
        });
    };

    const handleImageUpload = async (imageUri) => {
        setShowOverlay(true);
        try {
            const uploadedImageUrl = await uploadImage(userId, imageUri);
            if (uploadedImageUrl) {
                await saveImageUrlToFirestore(userId, uploadedImageUrl);
                Alert.alert('Success', 'Image uploaded successfully', [
                    {
                        text: 'OK', onPress: () => {
                            setShowOverlay(false);
                            navigation.goBack();
                        }
                    },
                ]);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert("Error", "Failed to upload image", [
                {
                    text: 'OK', onPress: () => {
                        setShowOverlay(false);
                    }
                },
            ]);
        }
    };


    return (
        <View style={styles.screen} contentContainerStyle={styles.contentContainer}>
            <View style={styles.greenHeader}></View>
            <View style={styles.mainContainer}>
                <Image
                    source={imageUrl ? { uri: imageUrl } : require('../../src/theme/images/profile_pic.png')}
                    style={styles.avatar}
                />

                <View style={styles.con3}>
                    <TouchableOpacity onPress={takePhoto} style={styles.bto1}>
                        <Text style={styles.buttonText2}>Take a Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={selectFromLibrary} style={styles.bto1}>
                        <Text style={styles.buttonText2}>Select from Device</Text>
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
    avatar: {
        width: screenWidth - 50,
        height: screenWidth - 50,
        resizeMode: 'contain',
        resizeMode: 'cover',
        alignSelf: 'center',
        marginTop: 20,
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

export default SetUserImageScreen;
