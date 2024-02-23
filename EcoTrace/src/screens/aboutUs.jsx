import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, Text } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const AboutUsScreen = ({ navigation }) => {


    return (
        <View style={styles.screen} contentContainerStyle={styles.contentContainer}>
            <View style={styles.greenHeader}>

            </View>

            <View style={styles.mainContainer}>
                <View style={styles.textcon}>
                    <Text style={styles.title}>EcoTrace: Your Partner in Green Travel</Text>
                    <Text style={styles.aboutustxt}>Innovative Technology, Sustainable Future{'\n\n'}

                        Founded by the visionary team "Keep Real" at the University of Auckland, EcoTrace is not just an app; it's a movement towards a greener tomorrow. Our diverse team of IT graduates, including experts in machine learning, financial analysis, and software development, is dedicated to making sustainable living a practical reality.{'\n\n'}

                        At EcoTrace, we understand the urgency of addressing the carbon footprint crisis. Our mission is to empower individuals and organisations to make informed, eco-friendly choices. With our cutting-edge app, we bring you a personalised carbon footprint tracking experience that's both user-friendly and impactful.{'\n\n'}

                        Our innovative app provides real-time data on transportation-related carbon emissions, encouraging users to choose greener travel options. Alongside, we offer engaging features like a map interface for easy tracking and a coupon system to reward sustainable choices.
                    </Text>
                    <Text style={styles.title}>Join Us on the Journey to Sustainability</Text>
                    <Text style={styles.aboutustxt}>Your choices matter. With EcoTrace, make each step count towards a healthier planet.{'\n\n'}
                        Contact us: ecotracenz@gmail.com
                    </Text>
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
        marginTop: -screenHeight * 0.27,
        height: screenHeight * 0.85,
        marginLeft: 10,
        marginRight: 20,
        backgroundColor: 'white',
        elevation: 3,
    },
    title: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 25,
    },
    textcon: {
        marginHorizontal: 20,
        marginTop: 35,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
    },
    aboutustxt: {
        color: '#3E3838',
        fontSize: 13,
        fontWeight: '400',
        marginBottom: 15,
        //marginHorizontal: 15,
        lineHeight: 17,
    },
});

export default AboutUsScreen;