const calculateCarbonFootprint = async (distance, mode, make = null, type = null,) => {
  // Define carbon emission factors for different travel patterns
  const footprintPerMode = {
    walking: 0,
    bicycling: 0,
    bus: 0.153,
    electric: 0.012,
    rail: 0.019,
    taxi: 0.159,
    driving: 0.159,
  };

  // Get the carbon emission factor for the current model
  let coefficient;
  if (make && type) {
    coefficient = await fetchPredictionFromServer(make, type);
  } else {
    coefficient = footprintPerMode[mode.toLowerCase()] || 0;
  }


  // Calculate the carbon footprint
  const carbonFootprint = ((distance / 1000) * coefficient).toFixed(2);




  return parseFloat(carbonFootprint);
};


const fetchPredictionFromServer = async (make, vehicleType) => {
  try {
    const response = await fetch(
      //This 10.0.2.2 is the default ip address of the emulator on this computer. 
      //If it is a physical computer, this IP address should be changed
      `http://10.0.2.2:3000/predict?make=${encodeURIComponent(
        make,
      )}&vehicleType=${encodeURIComponent(vehicleType)}`,
      {
        method: 'POST',
      },
    );
    const text = await response.text();
    

    const data = JSON.parse(text);
    

    //Process and return the predicted value 
    const predictionRaw = data.prediction.trim();
    const predictionValue = parseFloat(predictionRaw);
    return predictionValue;
  } catch (error) {
    console.error('Error fetching prediction:', error);
  }
};


export { calculateCarbonFootprint, fetchPredictionFromServer };
