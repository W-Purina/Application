import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useUser } from './userContext.js';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUsername, fetchUserCoupon, saveOrUpdateUserCoupon, fetchProfileImageUrl } from './firestore.js';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const MyCouponScreen = ({ navigation }) => {
  const { userId } = useUser();
  const [username, setUsername] = useState();
  const [coupon, setCoupon] = useState([]);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {

      // Load user data
      let isActive = true;
      const loadUserData = async () => {
        try {
          const username = await fetchUsername(userId);
          const coupon = await fetchUserCoupon(userId);
          const imageUrl = await fetchProfileImageUrl(userId);
          if (isActive) {
            setUsername(username);
            setCoupon(coupon);
            setProfileImageUrl(imageUrl);
          }
        } catch (error) {
          console.log('Error loading data:', error);
        } finally {
          setIsLoading(false);
        }
      }
      loadUserData();

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
    intro: '',
  });
  const handleProductPress = productId => {
    const selectedProduct = coupon.find(product => product.id === productId);
    setSelectedProduct(selectedProduct);
  };

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleuse = async (proid) => {
    try {
      const updatedProducts = coupon.filter(product => product.id !== proid);
      setCoupon(updatedProducts);
      await saveOrUpdateUserCoupon(userId, updatedProducts);
      toggleModal();
    } catch (error) {
      console.error('An error occurred while processing using and updating Coupons', error);
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
                  borderRadius: 72 / 2,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                }}>
                <Image
                  source={profileImageUrl ? { uri: profileImageUrl } : require('../../src/theme/images/profile_pic.png')}
                  style={styles.image}
                />
              </View>
              <View
                style={{
                  marginTop: 32,
                  marginLeft: 20,
                }}>
                <Text
                  style={{
                    color: 'black',
                    fontSize: 18,
                    fontWeight: '400',
                  }}>
                  {username}
                </Text>
              </View>
            </View>
            <View>
              {coupon.length === 0 ? (
                <View style={styles.emptyproductscon}>
                  <View style={styles.emptyimage}>
                    <Image
                      source={require('../../src/theme/images/inbox.png')}
                      style={styles.image3}
                    />
                  </View>
                  <Text style={styles.emptyProductsText}>
                    Oops! It looks a bit empty here
                  </Text>
                </View>
              ) : (
                coupon.map(product => (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => {
                      toggleModal();
                      handleProductPress(product.id);
                    }}>
                    <View style={styles.productcon}>
                      <View style={styles.productimage}>
                        <Image source={{ uri: product.imageUrl }} style={styles.image} />
                      </View>
                      <View style={styles.producttxtcon}>
                        <Text style={styles.producttxt}>{product.name}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
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
                      onPress={() => handleuse(selectedProduct.id)}
                      style={styles.bto1}>
                      <Text style={styles.buttonText1}>USE NOW</Text>
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
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
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
    width: 12,
    height: 12,
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
    alignItems: 'center',
    justifyContent: 'center',
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
  modalBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
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
  emptyproductscon: {
    marginTop: 120,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyimage: {
    height: 120,
    width: 120,
  },
  image3: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyProductsText: {
    marginTop: 20,
    fontSize: 20,
    color: '#9b9b9b',
    fontWeight: '300',
  },
});

export default MyCouponScreen;
