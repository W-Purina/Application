import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { sendPasswordResetEmailFirebase, doesEmailExist } from './firestore.js';
import AppContext from '../theme/AppContext'

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const { setShowOverlay } = useContext(AppContext);

    // Function to validate the email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email format');
        } else {
            setEmailError('');
        }
    };

    // Function to handle password reset process
    const handleResetPassword = async () => {
        // Ensure email is entered
        if (!email) {
            setShowOverlay(true);
            Alert.alert('Missing Information', 'Please enter your email address to reset password.', [
                { text: 'OK', onPress: () => setShowOverlay(false) }
            ]);
            return;
        }

        // Check for valid email format
        if (emailError) {
            setShowOverlay(true);
            Alert.alert('Error', 'Please enter a valid email address.', [
                {
                    text: 'OK', onPress: () => setShowOverlay(false)
                }
            ]);
            return;
        }

        // Check if email exists in the database
        const emailExists = await doesEmailExist(email);
        if (!emailExists) {
            setShowOverlay(true);
            Alert.alert('Error', 'Email address not found. Please check your email or register.', [
                {
                    text: 'OK', onPress: () => setShowOverlay(false)
                }
            ]);
            return;
        }

        // Call function to send password reset email and handle response
        const result = await sendPasswordResetEmailFirebase(email);
        if (result.success) {
            setShowOverlay(true);
            Alert.alert('Check your email', 'A password reset link has been sent to your email.', [
                {
                    text: 'OK', onPress: () => {
                        setShowOverlay(false);
                        navigation.navigate('SignIn');
                    }
                },
            ]);
        } else {
            setShowOverlay(true);
            Alert.alert('Error', result.error, [
                { text: 'OK', onPress: () => setShowOverlay(false) }
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text
                    style={[
                        styles.headerText,
                        Platform.OS === 'ios' ? styles.headerTextIOS : null,
                    ]}>
                    Enter your email !
                </Text>
            </View>
            <View style={styles.formContainer}>
                <View style={styles.inputWithIcon}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        keyboardType="email-address"
                        onChangeText={(text) => {
                            setEmail(text);
                            validateEmail(text);
                        }}
                        value={email}
                    />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                <TouchableOpacity style={styles.submitButton} onPress={handleResetPassword}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B0D9B1',
    },
    headerContainer: {
        marginTop: 30,
        marginLeft: 20,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
    },
    headerTextIOS: {
        textAlign: 'center',
    },
    formContainer: {
        marginTop: 50,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        alignItems: 'center',
        flex: 1,
        width: '100%',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#DDD',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        alignSelf: 'flex-start',
    },
    submitButton: {
        width: 342,
        height: 45,
        backgroundColor: '#B0D9B1',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;
