import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Dimensions} from 'react-native';


const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const Header = () => {
  return (
    <View style={{
        width:screenWidth,
        height:screenHeight*0.15,
        top:0,
        backgroundColor: '#B0D9B1',
      }}>
    </View>
  );
};


export default Header;