import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Image, TouchableOpacity, TextInput, BackHandler, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/AntDesign';
import { useUser } from './userContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserRewardPoints, fetchUsername, updateRewardPoints, getDailyCarbonEmission, fetchAllHelpInfo } from './firestore.js';
import moment from 'moment-timezone';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const HomeScreen = ({ navigation }) => {

  const { userId } = useUser();
  const [dailyValue, setDailyValue] = useState(0);
  const [username, setUsername] = useState();
  const [userpoint, setuserpoint] = useState(0);
  const [infoCardsData, setInfoCardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const goalExpert = 5.18;
  const goalAdvanced = 6.9;
  const goalBasic = 8.2;
  const totalGoal = goalBasic;

  // Function to get today's date in ISO format for New Zealand
  const getCurrentDate = () => {
    const today = moment().tz('Pacific/Auckland').format('YYYY-MM-DD');
    return today;
  };

  // Function to get yesterday's date in ISO format for New Zealand
  const getYesterdayDate = () => {
    const yesterday = moment().tz('Pacific/Auckland').subtract(1, 'days').format('YYYY-MM-DD');
    return yesterday;
  };

  useFocusEffect(
    React.useCallback(() => {

      // Load database data
      let isActive = true;
      const loadData = async () => {
        try {
          const username = await fetchUsername(userId);
          const points = await fetchUserRewardPoints(userId);
          const dailyEmission = await getDailyCarbonEmission(userId, getCurrentDate());
          const infoData = await fetchAllHelpInfo();

          if (isActive) {
            setUsername(username);
            setuserpoint(points);
            setDailyValue(dailyEmission);
            setInfoCardsData(infoData.map(info => ({
              id: info.docId,
              title: info.title,
              subtitle: info.subtitle,
              image: info.titleImage,
            })));
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

  // Function to get the last updated date
  const getLastUpdateDate = async (userId) => {
    try {
      const lastUpdateDate = await AsyncStorage.getItem(`lastUpdateDate_${userId}`);
      return lastUpdateDate;
    } catch (error) {
      console.error('Error getting last update date:', error);
    }
  };

  // Function to set the last update date
  const setLastUpdateDate = async (userId, date) => {
    try {
      await AsyncStorage.setItem(`lastUpdateDate_${userId}`, date);
    } catch (error) {
      console.error('Error setting last update date:', error);
    }
  };

  useEffect(() => {
    // Update point
    const updatePoints = async () => {
      const todayDate = getCurrentDate();
      const lastUpdateDate = await getLastUpdateDate(userId);

      if (!lastUpdateDate) {
        // Set today as the last update date for new users
        await setLastUpdateDate(userId, todayDate);
      } else if (lastUpdateDate !== todayDate) {
        const emission = await getDailyCarbonEmission(userId, getYesterdayDate());
        let points = await fetchUserRewardPoints(userId);
        if (emission <= goalExpert) points += 30;
        else if (emission <= goalAdvanced) points += 20;
        else if (emission <= goalBasic) points += 10;

        if (points > 0) {
          await updateRewardPoints(userId, points);
          // Store today's date as the last updated date
          await setLastUpdateDate(userId, todayDate);
        }
      }
    };
    updatePoints();

  }, [userId]);

  if (isLoading) {
    return <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />;
  }

  return (
    <ScrollView style={styles.screen}>

      {/* Header */}
      <View style={styles.headerContainer}>
        {/* Points Card */}
        <View style={styles.userPointsCard}>
          <View style={styles.logoImage}>
            <Image
              source={require('../theme/images/logo.png')}
              style={styles.bigLogo}
            />
          </View>

          <View style={styles.userDetails}>
            <Text style={styles.username}>Hello, {username} !</Text>
            <View style={styles.pointsContainer}>
              <Image
                source={require('../theme/images/leaf_point.png')}
                style={styles.leafIcon}
              />
              <Text style={styles.points}>{userpoint} pts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reward')}>
                <Icon
                  name="gift"
                  size={20}
                  color="#666"
                  style={styles.rewardIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Image
            source={require('../theme/images/search.png')}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for routes and compare CO2 emissions"
            placeholderTextColor="gray"
            keyboardType="default"
            onFocus={() => navigation.navigate('Map')}
          />
        </View>
      </View>

      {/* Dynamic Progress Bar Card */}
      <View style={styles.progressBarCard}>
        <Text style={styles.goalText}>Daily Carbon Footprint Progress</Text>
        <View style={styles.progressBarBackground}>
          {/* Segmented progress bar with gradients */}
          <LinearGradient
            colors={['#76b852', '#8DC26F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBarSegment,
              { width: `${(goalExpert / totalGoal) * 100}%` },
            ]}
          />
          <View style={styles.progressBarSeparator} />
          <LinearGradient
            colors={['#76b852', '#8DC26F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBarSegment,
              { width: `${((goalAdvanced - goalExpert) / totalGoal) * 100}%` },
            ]}
          />
          <View style={styles.progressBarSeparator} />
          <LinearGradient
            colors={['#76b852', '#8DC26F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBarSegment,
              { width: `${((goalBasic - goalAdvanced) / totalGoal) * 100}%` },
            ]}
          />
          {/* Progress indicator (dot) */}
          <View
            style={[
              styles.progressIndicator,
              { left: `${(dailyValue / totalGoal) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.progressBarLabels}>
          <Text style={styles.labelText}>{`${dailyValue.toFixed(2)} kg CO2e`}</Text>
          <Text style={styles.labelText}>{`${Math.max((totalGoal - dailyValue).toFixed(2), 0)} kg CO2e Left`}</Text>
        </View>
      </View>

      {/* Record Button */}
      <TouchableOpacity
        style={styles.trackButton}
        onPress={() => navigation.navigate('Book')}>
        <Text style={styles.trackButtonText}>
          Record your carbon footprint
        </Text>
      </TouchableOpacity>

      {/* Helpful Information Section */}
      <View style={styles.helpfulInfoContainer}>
        <View style={styles.titleBar} />
        <Text style={styles.infoTitle}>Helpful Information</Text>

        {infoCardsData.map((card, index) => (
          <View key={index} style={styles.infoCard}>
            <Image source={{ uri: card.image }} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoCardTitle}>{card.title}</Text>
              <Text style={styles.infoCardDescription}>{card.subtitle}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Helpful Information', { infoId: card.id })}>
              <Text style={styles.viewNow}>View now →</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  },
  headerContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B0D9B1',
    width: screenWidth,
    height: screenHeight * 0.28,
    overflow: 'hidden',
  },
  userPointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  avatarIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',

    marginTop: 30,
    marginLeft: 20,
  },
  username: {
    fontWeight: 'bold',
    color: '#4A4A4A',
    fontSize: 30,
    marginBottom: 5,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leafIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  rewardIcon: {
    marginLeft: 10,
  },
  bigLogo: {
    width: 90,
    height: 90,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    marginTop: 30,
    height: 45,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  progressBarCard: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
    marginHorizontal: 20,
    marginTop: 20,
  },
  goalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  progressBarSegment: {
    height: '100%',
    justifyContent: 'center',
  },
  progressBarSeparator: {
    width: 2,
    backgroundColor: '#fff',
  },
  progressIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.2)',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 2,
    shadowOpacity: 0.3,
    transform: [{ translateX: -10 }],
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  labelText: {
    fontSize: 13,
  },
  trackButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpfulInfoContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: 'white',
  },
  titleBar: {
    alignSelf: 'center',
    width: 60,
    height: 3,
    backgroundColor: 'grey',
    borderRadius: 2,
    marginVertical: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    marginBottom: -15,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoIcon: {
    width: 35,
    height: 35,
    marginRight: 20,
  },
  infoTextContainer: {
    flex: 1,
    marginRight: 5,
  },
  infoCardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  infoCardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  viewNow: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#4CAF50',
  },
});

export default HomeScreen;
