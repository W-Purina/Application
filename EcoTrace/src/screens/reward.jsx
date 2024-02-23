import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useUser } from './userContext.js';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchUserRewardPoints,
  saveSelectedProductToUserCoupon,
  fetchAllCoupon,
  updateRewardPoints,
} from './firestore.js';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const RewardScreen = ({ navigation }) => {
  const couponDetails = `Thank you for choosing KFC! We have prepared an exclusive coupon for you to make your delicious fried chicken journey more affordable. Here are the instructions for using the coupon:
1. Coupon Details: Purchase the specified combo and enjoy a discount of the specified amount.
2. Applicability: This coupon can be used at all KFC stores nationwide, covering a variety of our delicious combos.
3. How to Use:
   - When placing your order, add the selected combo to your cart.
   - At the checkout page, enter the coupon code.
   - The system will automatically calculate the discount amount, ensuring you get a great price.
4. Coupon Validity Period: Please note that this coupon is valid until [Expiration Date]. Please use it before the expiration date to ensure you enjoy the discount.
   
Don't forget to come with your family and friends to savor the exclusive deliciousness! We look forward to seeing you at KFC, offering you both deliciousness and discounts.
`;

  const { userId } = useUser();
  const [myleaves, setMyLeaves] = useState(0);
  const [totalcoupon, settotalcoupon] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {

      // Load coupon data
      let isActive = true;
      const loadCouponData = async () => {
        try {
          const rewardPoints = await fetchUserRewardPoints(userId);
          const coupon = await fetchAllCoupon();
          if (isActive) {
            setMyLeaves(rewardPoints);
            settotalcoupon(coupon);
          }
        } catch (error) {
          console.log('Error loading data:', error);
        } finally {
          setIsLoading(false);
        }
      }
      loadCouponData();

      return () => {
        isActive = false;
      };

    }, [userId]),
  );

  const [selectedProduct, setSelectedProduct] = useState({
    id: '1',
    name: 'Count Down Coupon',
    price: 60,
    image: require('../../src/theme/images/coupon1.png'),
    intro: couponDetails,
  });

  const handleProductPress = productId => {
    // Obtain product information through product ID, which can be obtained from the data source
    const selectedProduct = totalcoupon.find(product => product.id === productId);
    setSelectedProduct(selectedProduct);
  };

  const [isModalVisible, setModalVisible] = useState(false);

  const [isModalVisible_info, setModalVisible_info] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleModal_info = () => {
    setModalVisible_info(!isModalVisible_info);
  };

  const handlebuy = async (proid) => {
    try {
      const buyProduct = totalcoupon.find(product => product.id === proid);
      const newLeaves = myleaves - buyProduct.price;

      if (newLeaves >= 0) {
        await saveSelectedProductToUserCoupon(userId, buyProduct);
        setMyLeaves(newLeaves)
        await updateRewardPoints(userId, newLeaves);
      } else {
        Alert.alert(
          'Insufficient Leaves',
          'Sorry,You do not have enough leaves to make this purchase.',
        );
      }
      toggleModal();
    } catch (error) {
      console.error('An error occurred while processing purchase and updating credits', error);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.greenHeader}></View>

      <View style={styles.mainContainer}>
        {isLoading ? (
          <ActivityIndicator style={styles.activityIndicator} size="large" color="#B0D9B1" />
        ) : (
          <>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                paddingBottom: 22,
                borderBottomWidth: 1,
                borderBottomColor: '#CACACA',
              }}>
              <View
                style={{
                  width: 47,
                  height: 47,
                  marginTop: 22,
                  marginLeft: 20,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                }}>
                <Image
                  source={require('../../src/theme/images/wallet.png')}
                  style={styles.image}
                />
              </View>
              <View
                style={{
                  marginTop: 32,
                  marginLeft: 20,
                }}>
                <TouchableOpacity onPress={() => navigation.navigate('My Coupon')}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 20,
                      fontWeight: '500',
                      marginTop: 2,
                    }}>
                    MyCoupon
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.con3}>
                <Image
                  source={require('../../src/theme/images/leaf_point.png')}
                  style={styles.image1}
                />
                <Text style={styles.txt1}>{myleaves}</Text>
              </View>
            </View>
            <View style={styles.con2}>
              <Text style={styles.txt2}>Get Your Reward</Text>
              <TouchableOpacity
                onPress={() => {
                  toggleModal_info();
                }}>
                <Image
                  source={require('../../src/theme/images/seal-question.png')}
                  style={styles.iconStyle}
                />
              </TouchableOpacity>
            </View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisible_info}
              onRequestClose={toggleModal_info}>
              <View style={styles.modalBackground}>
                <ScrollView style={styles.modalhitinfo}>
                  <View>
                    <Text style={styles.titlecon}>How To Get Rewards</Text>
                    <View>
                      <View style={styles.coninfo}>
                        <Image
                          source={require('../../src/theme/images/earth.png')}
                          style={styles.productpriceicon}
                        />
                        <Text style={styles.infodetailtitle}>
                          Daily Carbon Emission Reduction Challenge
                        </Text>
                      </View>
                      <Text style={styles.detailtxt}>
                        Join our carbon footprint reduction challenge and contribute
                        to the Earth while earning points! Based on your daily
                        carbon emissions, achieving the following goals will earn
                        you point rewards:{'\n\n'}
                        Basic Goal: Maintain a daily carbon emission below 8.20
                        kilograms of carbon dioxide equivalent. Completing this
                        challenge will earn you 10 leaves.{'\n\n'}
                        Advanced Goal: Maintain a daily carbon emission below 6.90
                        kilograms of carbon dioxide equivalent. Completing this
                        challenge will earn you 20 leaves.{'\n\n'}
                        Expert Goal: Maintain a daily carbon emission below 5.18
                        kilograms of carbon dioxide equivalent. Completing this
                        challenge will earn you 30 leaves.
                      </Text>
                    </View>

                    <View>
                      <View style={styles.coninfo}>
                        <Image
                          source={require('../../src/theme/images/brain.png')}
                          style={styles.productpriceicon}
                        />
                        <Text style={styles.infodetailtitle}>
                          Weekly Environmental Quiz
                        </Text>
                      </View>
                      <Text style={styles.detailtxt}>
                        Participate in our environmental knowledge quiz, test
                        and enhance your environmental knowledge! For each correct answer,
                        you can earn 1 leaf. Learn while answering questions, and
                        easily accumulate points!
                      </Text>
                    </View>

                    <View>
                      <View style={styles.coninfo}>
                        <Image
                          source={require('../../src/theme/images/book.png')}
                          style={styles.productpriceicon}
                        />
                        <Text style={styles.infodetailtitle}>Knowledge Bonus</Text>
                      </View>
                      <Text style={styles.detailtxt}>
                        Reading the valuable information we provide not only helps
                        you gain knowledge but also allows you to earn points! For
                        every piece of information you read, you will receive 1
                        leaf. Each piece of information is eligible for a one-time
                        reward, so feel free to read on!"
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleModal_info()}
                      style={styles.btodetail}>
                      <Text style={styles.buttonText2}>Got it</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </Modal>
            <View>
              {totalcoupon.map(product => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => {
                    toggleModal();
                    handleProductPress(product.id);
                  }}>
                  <View style={styles.productcon}>
                    <View style={styles.productimage}>
                      <Image source={{ uri: product.imageUrl }} style={styles.imageproduct} />
                    </View>
                    <View style={styles.producttxtcon}>
                      <Text style={styles.producttxt}>{product.name}</Text>
                      <View style={styles.productprice}>
                        <Image
                          source={require('../../src/theme/images/leaf_point.png')}
                          style={styles.productpriceicon}
                        />
                        <Text style={styles.productpricetxt}>{product.price}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={toggleModal}>
              <View style={styles.modalBackground}>
                <ScrollView style={styles.modalContainer}>
                  <View style={styles.detailedproductimage}>
                    <Image
                      source={{ uri: selectedProduct.imageUrl }}
                      style={styles.image2}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.contentcon}>
                    <Text style={styles.titletxt}>{selectedProduct.name}</Text>
                    <Text style={styles.productdetail}>
                      {selectedProduct.intro}
                    </Text>
                  </View>
                  <View style={styles.bottombutton}>
                    <TouchableOpacity
                      onPress={() => handlebuy(selectedProduct.id)}
                      style={styles.bto1}>
                      <Text style={styles.buttonText1}>BUY</Text>
                      <Image
                        source={require('../../src/theme/images/leaf_point.png')}
                        style={styles.productpriceicon}
                      />
                      <Text style={styles.buyprice}>{selectedProduct.price}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => toggleModal()}
                      style={styles.bto2}>
                      <Text style={styles.buttonText2}>BACK</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </Modal>
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
    marginLeft: 10,
    marginRight: 20,
    backgroundColor: 'white',
    elevation: 3,
    minHeight: 800,
  },
  imageproduct: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  image1: {
    width: 45,
    height: 45,
    marginRight: 8,
  },
  txt1: {
    color: 'black',
    fontSize: 28,
    fontWeight: '800',
  },
  txt2: {
    color: 'black',
    fontSize: 22,
    fontWeight: '800',
  },
  con3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 50,
    marginLeft: 'auto',
    marginTop: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  iconStyle: {
    width: 17,
    height: 17,
    marginTop: 3,
    marginLeft: 8,
  },
  con2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  productimage: {
    height: 80,
    width: 80,
  },
  productcon: {
    flexDirection: 'row',
    marginHorizontal: 15,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  producttxtcon: {
    marginLeft: 40,
    fontSize: 15,
    fontWeight: '800',
  },
  producttxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  productprice: {
    marginTop: 'auto',
    flexDirection: 'row',
  },
  productpriceicon: {
    width: 30,
    height: 30,
  },
  productpricetxt: {
    marginLeft: 5,
    marginTop: 'auto',
    color: '#32A037',
    fontSize: 15,
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
  },
  modalhitinfo: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    alignSelf: 'center',
    marginVertical: 60,
  },
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedproductimage: {
    marginTop: 10,
    height: 200,
    width: '100%',
    alignSelf: 'center',
  },
  image2: {
    flex: 1, 
    width: null, 
    height: null, 
    borderRadius: 10,
  },
  titletxt: {
    color: 'black',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
  },
  contentcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  productdetail: {
    color: '#3E3838',
    fontSize: 12,
    fontWeight: '400',
  },
  bottombutton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  bto1: {
    flexDirection: 'row',
    height: 45,
    width: 145,
    backgroundColor: '#D3F3BF',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  buttonText1: {
    fontWeight: '300',
    fontSize: 20,
    color: '#5E8C61',
    marginRight: 5,
  },
  buttonText2: {
    fontWeight: '300',
    fontSize: 20,
    color: '#898989',
  },
  bto2: {
    flexDirection: 'row',
    height: 45,
    width: 145,
    backgroundColor: '#DADADA',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  buyprice: {
    color: '#008905',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 10,
  },
  infodetailtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    color: '#3E3838',
  },
  coninfo: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 20,
    marginBottom: 10,
  },
  titlecon: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 15,
  },
  detailtxt: {
    marginLeft: 20,
    color: '#707070',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 20,
  },
  btodetail: {
    height: 45,
    width: 145,
    backgroundColor: '#EDF1D6',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginBottom: 35,
  },
});

export default RewardScreen;
