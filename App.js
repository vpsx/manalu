import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as Location from 'expo-location';

// someday I will maybe understand imports vs requires wtf
const axios = require('axios');

console.log("Sanity check check check check");


function useLocation() {
  // custom Hook to keep track of own location using expo Location
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

  // TODO don't actually want to return a string
  return <Text>{locationText}</Text>;
}



export default function App() {
  // TODO better names needed esp when have both beacon and uh.. radar
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    function updateLocation() {
      // Since this fn is needed by my effect, I should declare it inside the effect:
      // https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies
      console.log("Do the Axios thing! POST location.");

      axios.post('http://192.168.1.8:5000/givelocation', {
        Name: "manalu-test",
        Timestamp: new Date(),
        Latitude: 1,
        Longitude: 1,
      })
      .then(function(response) {
        console.log("GIVELOCATION response:")
        console.log(response.data);
      })
      .catch(function(error) {
        console.log(error);
      });
    }

    setTimer(setInterval(
      () => updateLocation(),
      //1000,
      60000,
    ));
    return () => {
      clearInterval(timer);
    };
  },
  // The React docs discuss conditional effect firing only in terms of optimization.
  // https://reactjs.org/docs/hooks-reference.html#conditionally-firing-an-effect
  // But since this is an Interval, it can only make sense to not reset it on
  // each render, right? It is not a matter of optimization.
  // And I am quite sure it is not the case that you aren't supposed to setInterval
  // in an Effect hook--Hooks purport to cover all the use cases for classes,
  // which includes the lifecycle methods, and setInterval is definitely done in those.
  // https://reactjs.org/docs/hooks-faq.html#do-hooks-cover-all-use-cases-for-classes
  // For this reason I am suspicious about this.
  // Anyway, whatever, this empty array basically says run effect only on mount, not upd.
  // Oh also TODO: When you actually use the beacon location instead of dummy coords,
  // will this need to change......
  [],
  );

  return (
    <View style={styles.container}>
      {useLocation()}
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
