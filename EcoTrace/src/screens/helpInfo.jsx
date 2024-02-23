import React, { useState, useEffect, useRef } from 'react';
import { useUser } from './userContext.js';
import { ScrollView, View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import {
    fetchHelpInfoById,
    fetchReadHelpInfoIds,
    addHelpInfoIdToReadIds,
    fetchUserRewardPoints,
    updateRewardPoints,
} from './firestore.js';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;


const HelpInfoScreen = ({ navigation, route }) => {

    const { infoId } = route.params;
    const { userId } = useUser();
    const [card, setCard] = useState(null);
    const [timer, setTimer] = useState(0);
    const [canClick, setCanClick] = useState(false);
    const [buttontxt, setbuttontxt] = useState('Already Obtained');
    const intervalRef = useRef(null);

    const handleinfobutton = async () => {
        try {

            const userpoint = await fetchUserRewardPoints(userId);
            const totalpoints = userpoint + 1;
            await updateRewardPoints(userId, totalpoints);
            await addHelpInfoIdToReadIds(userId, infoId);
            navigation.navigate('BottomTabs');
        } catch (error) {
            console.error('An error occurred while updating user points', error);
        }
    };

    const startTimer = () => {
        setTimer(15);
        setbuttontxt('Get 1 Leaf');
        intervalRef.current = setInterval(() => {
            setTimer(prevTimer => {
                if (prevTimer === 1) {
                    clearInterval(intervalRef.current);
                    setCanClick(true);
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        //Fetch information by its ID
        const fetchInfo = async () => {
            const fetchedInfo = await fetchHelpInfoById(infoId);
            if (fetchedInfo) {
                const contentParts = fetchedInfo.content.map(part => ({
                    subheading: part.subheading,
                    text: part.text
                }));
                setCard({
                    image: fetchedInfo.contentImage,
                    title: fetchedInfo.title,
                    subtitle: fetchedInfo.subtitle,
                    contentParts: contentParts,
                })
            }
        };


        const fetchuserinfoid = async () => {
            try {
                const Allinfoidinuser = await fetchReadHelpInfoIds(userId);
                const isHelpInfoIdExists = Allinfoidinuser.includes(infoId);
                if (!isHelpInfoIdExists) {
                    startTimer();
                } else {

                }
            } catch (error) {
                console.error('Error fetching user quiz data:', error);
            }
        };

        fetchInfo();
        fetchuserinfoid();


        // Clean up the timer when the component unmounts
        return () => {
            clearInterval(intervalRef.current);
        };
    }, [infoId, userId]);

    const handleButtonClick = () => {
        if (canClick) {
            handleinfobutton();
            setbuttontxt('Already Obtained');
            setCanClick(false);
        } else {
            Alert.alert('Wait', `Please wait for ${timer} seconds before clicking the button.`);
        }
    };

    return (
        <ScrollView style={styles.screen}>
            <View style={styles.greenHeader} />
            <View style={styles.mainContainer}>

                {!card ? (
                    <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />
                ) : (
                    <>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: card.image }} style={styles.image} />
                        </View>

                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{card.title}</Text>
                            <Text style={styles.subtitle}>{card.subtitle}</Text>
                        </View>

                        <View style={styles.contentContainer}>
                            {card.contentParts.map((part, index) => (
                                <View key={index}>
                                    <Text style={styles.subheading}>{part.subheading}</Text>
                                    <Text style={styles.content}>{part.text}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.timecountercon}>
                            {/* Displays the remaining time on the timer */}
                            <TouchableOpacity
                                style={canClick ? styles.buttonEnabled : styles.buttonDisabled}
                                onPress={handleButtonClick}
                                disabled={!canClick}
                            >
                                {timer === 0 ? (
                                    <Text style={styles.buttonText}>{buttontxt}</Text>

                                ) : (
                                    <Text style={styles.buttonText}>{timer} seconds</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
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
        flex: 1,
        backgroundColor: '#B0D9B1',
    },
    greenHeader: {
        width: screenWidth,
        height: screenHeight * 0.18,
        backgroundColor: '#B0D9B1',
    },
    mainContainer: {
        borderRadius: 20,
        width: screenWidth * 0.95,
        marginTop: -screenHeight * 0.13,
        marginLeft: 10,
        marginRight: 20,
        backgroundColor: 'white',
        elevation: 2,
        minHeight: 800,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '90%',
        height: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -10,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 5,
    },
    contentContainer: {
        paddingHorizontal: 40,
        marginTop: 10,
        marginBottom: 20,
    },
    content: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 26,
    },
    subheading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    timecountercon: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    buttonEnabled: {
        marginBottom: 5,
        width: 160,
        height: 40,
        borderRadius: 30,
        backgroundColor: '#7CAC81',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        marginBottom: 5,
        width: 160,
        height: 40,
        borderRadius: 30,
        backgroundColor: '#c3c3c3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 15,
    },
});

export default HelpInfoScreen;
