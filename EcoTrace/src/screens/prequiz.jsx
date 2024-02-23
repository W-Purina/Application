import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Dimensions, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useUser } from './userContext.js';
import { useFocusEffect } from '@react-navigation/native';
import {
    fetchUserQuizData,
    createAndStoreUserQuiz,
} from './firestore.js';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const PrequizScreen = ({ navigation }) => {


    const { userId } = useUser();
    const [quizstatus, setquizstatus] = useState(false);
    const [initialStyle, setInitialStyle] = useState(true);


    useFocusEffect(
        React.useCallback(() => {
            const timerId = setTimeout(() => {
                setInitialStyle(false);
            }, 1000);

            const SetAllQuiz = async () => {
                try {
                    const Quiz = await fetchUserQuizData(userId);
                    if (Quiz.length === 0) {
                        await createAndStoreUserQuiz(userId);
                    } else {
                        if (Quiz[0].status) {
                            setquizstatus(true)
                        } else {
                            setquizstatus(false)
                        }
                    }
                } catch (error) {
                    console.error('loading error on prepage:', error);
                }
            };

            SetAllQuiz();

            return () => clearTimeout(timerId);

        }, [userId]),
    );


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}></View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                {initialStyle ? (
                    <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />
                ) : (
                    quizstatus ? (
                        <View style={styles.btocon}>
                            <Image source={require('../../src/theme/images/good-job.png')} style={styles.image} />
                            <Text style={styles.txt}>Well done!</Text>
                            <Text style={styles.txt}>You've already finished the quiz.</Text>
                            <Text style={styles.txt1}>Please patiently wait for the next update.</Text>
                        </View>
                    ) : (
                        <View style={styles.btocon}>
                            <Image source={require('../../src/theme/images/choose.png')} style={styles.image} />
                            <Text style={styles.txt}>Are you ready to start?</Text>
                            <Text style={styles.txt1}>You can only take this quiz once. This may take 5-6 minutes of your time, and please note that you cannot exit during the answering period~</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Quiz')}>
                                <View style={styles.bto}>
                                    <Text style={styles.txt2}>Start</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: screenWidth,
        height: screenHeight,
    },
    header: {
        width: screenWidth,
        height: screenHeight * 0.28,
        top: 0,
        backgroundColor: '#B0D9B1',
    },
    mainContent: {
        borderRadius: 20,
        width: screenWidth * 0.95,
        marginTop: -screenHeight * 0.27,
        height: screenHeight * 0.85,
        marginLeft: 10,
        marginRight: 20,
        backgroundColor: 'white',
        elevation: 3,
        alignItems: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    txt: {
        fontSize: 20,
        marginVertical: 5,
    },
    txt1: {
        marginHorizontal: 30,
        marginTop: 40,
        color: '#696969',
        fontWeight: '300',
    },
    btocon: {
        marginTop: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bto: {
        marginTop: 50,
        width: 120,
        height: 40,
        borderRadius: 50,
        backgroundColor: '#D3F3BF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    txt2: {
        fontSize: 16,
        color: '#008905'
    },
    image: {
        height: 80,
        width: 80,
        marginBottom: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PrequizScreen;