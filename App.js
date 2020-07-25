import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as Location from 'expo-location';

// someday I will maybe understand imports vs requires wtf
const axios = require('axios');

console.log("Sanity check check check check");


export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // TODO better names needed esp when have both beacon and uh.. radar
  const [timer, setTimer] = useState(null);
  const [beaconStatusMsg, setBeaconStatusMsg] = useState(null);

  // Effect for getting device location
  useEffect(() => {
    // I think this async code, when run inside an Effect on a custom Hook
    // that returns a non-component, causes a warning "Can't perform a React
    // state update on an unmounted component". I guess the component(?!?!)
    // gets mounted THEN this code is run (or starts to run) THEN component is
    // unmounted THEN it tries to setLocation on the component and dies?
    // I can't just make it not async;
    // I can hack it by returning a <Text> (so, keep it mounted.. right?);
    // Or I can just move this effect higher up into the App component...
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


  // Effect for sending device location to Paoloserver on an Interval
  useEffect(() => {
    function updateLocation() {
      // Since this fn is needed by my effect, I should declare it inside the effect:
      // https://reactjs.org/docs/hooks-faq.html#is-it-safe-to-omit-functions-from-the-list-of-dependencies
      console.log("Running updateLocation hook:");
      if (location) {
        console.log("Location is: ")
        console.log(location)
        let date = new Date()

        axios.post('http://192.168.1.8:5000/givelocation', {
          Name: "manalu-test",
          Timestamp: date, //TODO: Or use location timestamp? But format
          Latitude: location.coords.latitude,
          Longitude: location.coords.longitude,
        })
        .then(function(response) {
          console.log("GIVELOCATION response:")
          console.log(response.data);
          setBeaconStatusMsg("Last posted to Paoloserver at " + date)
        })
        .catch(function(error) {
          console.log(error);
          setBeaconStatusMsg("Something went wrong when posting to Paoloserver: " + error)
        });

      } else {
        let noLocationMsg = "Location was null. Problemos. Didn't POST to Paoloserver."
        setBeaconStatusMsg(noLocationMsg)
        console.log(noLocationMsg)
      }
    }

    setTimer(setInterval(
      () => updateLocation(),
      10000,
      //60000,
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
      <Text>{locationText}</Text>
      <Text>{beaconStatusMsg}</Text>
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
