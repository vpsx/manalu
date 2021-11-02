import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as Location from 'expo-location';


// For now, enter the IP address+port where local/dev Paoloserver is running
// Todo: Make this configurable, and also point it to Paoloserver proper
const ws = new WebSocket('');

ws.addEventListener('open', function (event) {
    console.log("WebSockets client sending a sanity check from Manalu");
    ws.send('WebSockets client sending a sanity check from Manalu');
});
ws.addEventListener('message', function (event) {
    console.log('WebSockets Manalu client received: %s', event.data);
});



export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
      // App needs foreground permissions before it can request background permissions.
      // * If you are having problems where the app is not asking for permissions,
      //   you may need to reinstall Expo Go entirely; it's an OS level restriction on apps
      //   (in particular how many times it is allowed to prompt for permissions).
      // * NB: Expo docs use "Destructuring Assignment".
      let fgpermissions = await Location.requestForegroundPermissionsAsync();
      if ( fgpermissions["status"] !== 'granted') {
        setErrorMsg('No permission to access device location (Foreground)');
        return;
      }

      let bgpermissions = await Location.requestBackgroundPermissionsAsync();
      if ( bgpermissions["status"] !== 'granted') {
        setErrorMsg('No permission to access device location (Background)');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  });
  let locationText = 'Waiting for location...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    //locationText = JSON.stringify(location);
    locationText = "LAT: " + JSON.stringify(location.coords.latitude) + "\nLNG: " + JSON.stringify(location.coords.longitude) + "\nHDG: " + JSON.stringify(location.coords.heading);

    //ws.send("LAT = " + JSON.stringify(location.coords.latitude));
    //ws.send("LNG = " + JSON.stringify(location.coords.longitude));
    //ws.send("HDG = " + JSON.stringify(location.coords.heading));
    ws.send(JSON.stringify(location));
  }


  // Once upon a time, there was code to send the location to the Paoloserver
  // on an interval, using setInterval inside an Effect.
  // This Effect was written with an empty list of dependencies
  //   useEffect(() => { blah, [] });
  // so that it only ran once, on component mount, and not after every render.
  // This prevented the Interval from being reset every render.
  // However, the Effect was not _actually_ dependency-free: Obviously it
  // needed the location! If 'location' is not declared in the dependencies,
  // then the value of 'location' inside the Effect is always null.
  // Compare and see:
  //   1. Pass [] as dependencies and print location inside the Effect;
  //      the Effect runs once and the location is null. (Note: The EFFECT
  //      runs once; the interval function runs on an interval as expected,
  //      though with the location null.
  //   2. Pass [location] as dependencies and print location inside the Effect;
  //      the Effect runs many times (on render) and the location is available.
  //      Set interval to (say) 5000ms; then the interval function does not run.
  //      Set interval to (say) 100ms, "overtaking" the render rate;
  //      then you can see the interval function run too, and it has access to
  //      the location; however, the interval is not actually 100ms because
  //      it keeps getting reset when the Effect runs and returns.
  // See related docs here:
  // https://reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often
  // and
  // https://reactjs.org/docs/hooks-reference.html#conditionally-firing-an-effect
  // So what to do?
  // With the old approach (Axios and HTTP) I would probably have to figure out
  // some way to set up a timer once and only once, maybe without using an Effect,
  // in some way as to make the location actually available when this happens.
  // However since I am now also trying to switch to WebSockets,
  // which I hope will eliminate the need for the interval entirely,
  // I am going to defer this problem until it actually proves to be a problem.


  return (
    <View style={styles.container}>
      <Text>{locationText}</Text>
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
