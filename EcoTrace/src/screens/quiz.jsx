import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Dimensions, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-swiper';
import { useUser } from './userContext.js';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchUserRewardPoints,
  updateRewardPoints,
  fetchUsername,
  updateQuizStatus,
  fetchUserQuizData,
  fetchProfileImageUrl
} from './firestore.js';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const QuizScreen = ({ navigation }) => {

  const [points, setPoints] = useState(0);
  const { userId } = useUser();
  const [username, setUsername] = useState();
  const [quiz, setquiz] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAndSetsetUsername = async () => {
        const username = await fetchUsername(userId);
        setUsername(username);
      };
      fetchAndSetsetUsername();
      const fetchuserAllQuiz = async () => {
        try {
          const Quiz = await fetchUserQuizData(userId);
          if (Quiz.length > 0) {
            const QuizId = Quiz[0].id;
            await updateQuizStatus(userId, QuizId, true);
            const allQuizzes = Quiz.map(userQuiz => userQuiz.quizzes);
            const flattenedQuizzes = allQuizzes.flat();
            setquiz(flattenedQuizzes);
          } else {
            console.log('User quiz data is empty.');
          }
        } catch (error) {
          console.log('Error fetching user quiz data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchuserAllQuiz();
      const fetchAndSetProfileImageUrl = async () => {
        const imageUrl = await fetchProfileImageUrl(userId);
        setProfileImageUrl(imageUrl);
      };
      fetchAndSetProfileImageUrl();

    }, [userId]),
  );

  // Function to increment points
  const updateuserpoints = async () => {
    try {
      const userpoint = await fetchUserRewardPoints(userId);
      const totalpoints = userpoint + 1;
      await updateRewardPoints(userId, totalpoints);
    } catch (error) {
      console.log('An error occurred while updating user credits', error);
    }
  };

  // Function to check if the answer is correct
  const handleAnswer = (questionId, selectedOption) => {
    setquiz((prevQuiz) =>
      prevQuiz.map((question) => {
        if (question.id === questionId) {
          if (selectedOption === question.answer && question.userAnswer === null) {
            updateuserpoints();
            setPoints((prevPoints) => prevPoints + 1);

          }
          return { ...question, userAnswer: selectedOption };
        } else {
          return question;
        }
      })
    );
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}></View>

      {/* Main Content */}
      <View style={styles.mainContent}>

        {isLoading ? (
          <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />
        ) : (
          <>
            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={profileImageUrl ? { uri: profileImageUrl } : require('../../src/theme/images/profile_pic.png')}
                  style={styles.image}
                />
              </View>
              <View style={styles.usernameContainer}>
                <Text style={styles.username}>
                  {username}
                </Text>
              </View>
              <View style={styles.con3}>
                <View style={styles.pointsContainer}>
                  <Text style={{ color: 'black', fontSize: 22, fontWeight: '800' }}>
                    {points}
                  </Text>
                  <Image
                    source={require('../theme/images/leaf_point.png')}
                    style={styles.pointsIcon}
                  />
                </View>
                <Text>Points Earned</Text>
              </View>
            </View>

            {/* Questions */}
            <View style={styles.con2}>
              <Swiper
                loop={false}
                showsPagination={true}
                dotStyle={styles.paginationDot}
                activeDotStyle={styles.activeDot}
                paginationStyle={styles.swiperPagination}
                onIndexChanged={(index) => {}}
              >
                {quiz.map((question, index) => (
                  <View key={question.id} style={styles.slide}>

                    <Text style={styles.questionText}>
                      {question.question} ({index + 1}/{quiz.length})
                    </Text>

                    {question.options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.option,
                          {
                            backgroundColor:
                              question.userAnswer === option
                                ? question.answer === option
                                  ? '#B0D9B1'
                                  : '#FFE6E9'
                                : '#EDF1D6',
                          },
                        ]}
                        onPress={() => handleAnswer(question.id, option)}
                        disabled={question.userAnswer !== null}
                      >
                        <Text>{option}</Text>
                      </TouchableOpacity>
                    ))}

                    {question.userAnswer !== null &&
                      question.userAnswer !== question.answer && (
                        <Text style={styles.correctAnswerText}>
                          Correct Answer: {question.answer}
                        </Text>
                      )}
                  </View>
                ))}
              </Swiper>
            </View>

            <View style={styles.txt1con}>
              <Text style={styles.txt1}>Correctly answering one question rewards you with 1 points.</Text>
            </View>

            <View style={styles.backbtocon}>
              <TouchableOpacity onPress={() => navigation.navigate('BottomTabs')}>
                <View style={styles.bto}>
                  <Text style={styles.txt2}>Finish</Text>
                </View>
              </TouchableOpacity>
            </View>

          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
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
    marginTop: -screenHeight * 0.2,
    height: screenHeight * 0.85,
    marginLeft: 10,
    marginRight: 20,
    backgroundColor: 'white',
    elevation: 3,
  },
  userInfo: {
    width: '100%',
    flexDirection: 'row',
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#CACACA',
  },
  profileImageContainer: {
    width: 47,
    height: 47,
    marginTop: 22,
    marginLeft: 20,
    borderRadius: 72 / 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  usernameContainer: {
    marginTop: 32,
    marginLeft: 20,
  },
  username: {
    color: 'black',
    fontSize: 18,
    fontWeight: '400',
  },
  con3: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F8FF',
    width: 130,
    height: 60,
    marginLeft: 'auto',
    marginTop: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  con2: {
    marginTop: 20,
    flex: 1,
    marginBottom: '30%',
  },
  slide: {
    marginHorizontal: 30,
    marginTop: 10,
    flex: 1,
  },
  questionContainer: {
    flex: 1,
    marginBottom: 5,
  },
  questionText: {
    color: 'black',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 10,
  },
  option: {
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
  },
  correctAnswerText: {
    marginTop: 10,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  con1: {
    marginTop: 40,
    marginHorizontal: 40,
  },
  bar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    color: '#305220',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  txt1con: {
    position: 'absolute',
    bottom: 120,
    left: 30,
    right: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt1: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A4A4A4',
  },
  paginationDot: {
    marginBottom: -40,
  },
  activeDot: {
    backgroundColor: '#609966',
    marginBottom: -40,
  },
  swiperPagination: {
    bottom: 15,
  },
  backbtocon: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 50,
  },
  bto: {
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
});

export default QuizScreen;
