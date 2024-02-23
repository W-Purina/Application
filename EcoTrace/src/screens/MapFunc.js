import {useState, useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {calculateCarbonFootprint} from './calculate.js';
import Geolocation from '@react-native-community/geolocation';

export const useMap = () => {
  //Parameters required for initialization
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [travelMode, setTravelMode] = useState('');
  const [polyline, setPolyline] = useState([]);
  const [distanceInfo, setDistanceInfo] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);

  //Ask user if they have access - android only
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  //Initialize the map based on the user's real-time location
  useEffect(() => {
    const getLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            setRegion({
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            setCurrentPosition({latitude, longitude});
          },
          error => {
            console.error(error);
            setDefaultLocation();
          },
          {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
        );
      } else {
        setDefaultLocation();
      }
    };

    getLocation();
  }, []);

  //If user disagrees, use default location
  const setDefaultLocation = () => {
    const defaultPosition = {
      latitude: -36.8484,
      longitude: 174.7622,
    };
    setRegion({
      ...defaultPosition,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    setCurrentPosition(defaultPosition);
  };

  //Calculate distance display path function + carbon emission calculation return
  const calculateAndDisplayRoute = async (
    start,
    end,
    mode,
    make = null,
    type = null,
  ) => {
    try {
      setTravelMode(mode);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${end}&mode=${mode}&key=AIzaSyA67f3cVdxxrECpPMHIOrjQqjc8i0ogO8s`,
      );
      const json = await response.json();

      if (json.status === 'OK') {
        const points = json.routes[0].overview_polyline.points;
        setPolyline(decodePolyline(points)); //Decode polyline and set the state 

        //Processing distance and time calculations
        const legs = json.routes[0].legs;
        let distances = {};
        let times = {};
        let info = '';
        let totalDistance = 0;

        if (mode === 'transit') {
          legs.forEach(leg => {
            leg.steps.forEach(step => {
              const stepmode = step.travel_mode;
              const distance = step.distance.value;
              const time = step.duration.value;
              totalDistance += distance;

              if (stepmode === 'TRANSIT') {
                const instruction = step.html_instructions;
                let transitType = 'Other Public Transport';

                if (instruction.includes('Bus')) {
                  transitType = 'Bus';
                } else if (instruction.includes('train')) {
                  transitType = 'tail';
                } else if (instruction.includes('ferry')) {
                  transitType = 'Ferry';
                }
                distances[transitType] =
                  (distances[transitType] || 0) + distance;
                times[transitType] = (times[transitType] || 0) + time;
              } else {
                distances[stepmode] = (distances[stepmode] || 0) + distance;
                times[stepmode] = (times[stepmode] || 0) + time;
              }
            });
          });

          let totalCarbonFootprint = 0;
          for (const mode in distances) {
            const carbonFootprintForMode = await calculateCarbonFootprint(
              distances[mode],
              mode,
            );
            totalCarbonFootprint += parseFloat(carbonFootprintForMode);
          }
          setDistanceInfo(totalDistance);
          return totalCarbonFootprint.toFixed(2);
        } else {
          const totalDistance = legs.reduce(
            (acc, leg) => acc + leg.distance.value,
            0,
          );
          setDistanceInfo(totalDistance);
          if (make && type) {
            return await calculateCarbonFootprint(
              totalDistance,
              mode,
              make,
              type,
            );
          } else {
            return await calculateCarbonFootprint(totalDistance, mode);
          }
        }
      } else {
        //console.error('Directions request failed:', json.status);
        return {
          success: false,
          error: `Directions request returned with status: ${json.status}`,
        };
      }
    } catch (error) {
      //console.error('Error fetching directions:', error);
      return {success: false, error: error.message};
    }
  };

  //Parse Polyline
  const decodePolyline = encoded => {
    let points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({latitude: lat / 1e5, longitude: lng / 1e5});
    }
    return points;
  };
  const resetPolyline = () => {
    setPolyline([]);
  };

  // Update the map area to show the route from start to end point
  const updateMapForRoute = (startCoords, endCoords) => {
    // Calculate midpoint
    const midLatitude = (startCoords.latitude + endCoords.latitude) / 2;
    const midLongitude = (startCoords.longitude + endCoords.longitude) / 2;

    // Calculate the increment of latitude and longitude
    const latitudeDelta =
      Math.abs(startCoords.latitude - endCoords.latitude) * 2;
    const longitudeDelta =
      Math.abs(startCoords.longitude - endCoords.longitude) * 2;

    setRegion({
      latitude: midLatitude,
      longitude: midLongitude,
      latitudeDelta,
      longitudeDelta,
    });
  };

  return {
    region,
    setRegion,
    currentPosition,
    requestLocationPermission,
    polyline,
    calculateAndDisplayRoute,
    distanceInfo,
    setTravelMode,
    resetPolyline,
    updateMapForRoute,
    setDefaultLocation,
  };
};

//Get the parameters of the starting point and end point
export const getPlaceDetails = async placeId => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=AIzaSyA67f3cVdxxrECpPMHIOrjQqjc8i0ogO8s`;
  try {
    const response = await fetch(url);
    const json = await response.json();
    if (json.status === 'OK') {
      const details = json.result;
      return {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
    } else {
      console.error('Failed to fetch place details:', json.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};
