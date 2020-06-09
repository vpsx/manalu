import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as Location from 'expo-location';

function Cat(props) {
  return (
    <Text>Hello I am your cat, {props.name}.</Text>
  );
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('No permission to access device location');
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  });

  let locationText = 'Waiting for location...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text>{locationText}</Text>
      <Cat name="Sophocles" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffb6ce',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
