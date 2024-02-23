import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';

// Authentication Pages
import OnboardingScreen from './src/screens/onboarding.jsx';
import WelcomeScreen from './src/screens/welcome.jsx';
import SignInScreen from './src/screens/signin.jsx';
import SignUpScreen from './src/screens/signup.jsx';
import UserinfoScreen from './src/screens/userinfo.jsx';
import SetUserAvatarScreen from './src/screens/setAvatar.jsx';
import ForgotPasswordScreen from './src/screens/forgotPassword.jsx';

// Main Pages
import BottomTabs from './src/components/bottomTab.jsx';
import BookScreen from './src/screens/book.jsx';
import MapScreen from './src/screens/map.jsx';

// Other Functionality Pages
import HelpInfoScreen from './src/screens/helpInfo.jsx';
import LocationSearchScreen from './src/screens/location.jsx';
import EditProfileScreen from './src/screens/editprofile.jsx';
import SetUserImageScreen from './src/screens/setImage.jsx';
import SetUserNameScreen from './src/screens/editUsername.jsx';
import CarInfoScreen from './src/screens/carInfo.jsx';
import ChangePasswordScreen from './src/screens/changepassword.jsx';
import QuizScreen from './src/screens/quiz.jsx';
import PrequizScreen from './src/screens/prequiz.jsx';
import RewardScreen from './src/screens/reward.jsx';
import MyCouponScreen from './src/screens/myCoupon.jsx';
import AboutUsScreen from './src/screens/aboutUs.jsx';
// import HistoryScreen from './src/screens/history.jsx';
// import SettingScreen from './src/screens/setting.jsx';

// Firebase
import './src/screens/firebaseConfig.js';

// React Context
import { UserProvider } from './src/screens/userContext.js';
import AppContext from './src/theme/AppContext.js';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: '#B0D9B1',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerShadowVisible: false,
  headerTintColor: '#000',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerBackTitleVisible: false,
};

const App = () => {
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [locationData, setLocationData] = React.useState(null);
  const [selectedImageUri, setSelectedImageUri] = React.useState(null);

  return (
    <UserProvider>
      <AppContext.Provider
        value={{ setShowOverlay, locationData, setLocationData, selectedImageUri, setSelectedImageUri, }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={screenOptions} >
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Userinfo" component={UserinfoScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="BottomTabs"
              component={BottomTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LocationSearch"
              component={LocationSearchScreen}
              options={{ headerShown: false }}
            />
            {/* <Stack.Screen name="History" component={HistoryScreen} /> */}
            {/* <Stack.Screen name="Settings" component={SettingScreen} /> */}
            <Stack.Screen
              name="Change Password"
              component={ChangePasswordScreen}
            />
            <Stack.Screen name="Prequiz" component={PrequizScreen} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Edit Profile" component={EditProfileScreen} />
            <Stack.Screen name="Book" component={BookScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen
              name="Helpful Information"
              component={HelpInfoScreen}
            />
            <Stack.Screen name="Reward" component={RewardScreen} />
            <Stack.Screen name="About Us" component={AboutUsScreen} />
            <Stack.Screen name="My Coupon" component={MyCouponScreen} />
            <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} />
            <Stack.Screen name="Personal Vehicle" component={CarInfoScreen} />
            <Stack.Screen name="Set Username" component={SetUserNameScreen} />
            <Stack.Screen name="Set User Avatar" component={SetUserImageScreen} />
            <Stack.Screen name="Set Avatar" component={SetUserAvatarScreen} />

          </Stack.Navigator>
        </NavigationContainer>

        {showOverlay && <View style={styles.overlayStyle} />}
      </AppContext.Provider>
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  overlayStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
});

export default App;
