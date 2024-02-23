import React from 'react';

const AppContext = React.createContext({
  setShowOverlay: () => {},
  locationData: null,
  setLocationData: () => {},
  selectedImageUri: null, 
  setSelectedImageUri: () => {}, 
});

export default AppContext;
