import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as Location from 'expo-location';


// For now, enter the IP address+port where local/dev Paoloserver is running
//const ws = new WebSocket('ws://x.x.x.x:yyyy');
// Todo: Make this configurable
const ws = new WebSocket('ws://whereispaolo.org:8080');
const locSendIntervalMs = 500 //milliseconds

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
  const [locLastSend, setLocLastSend] = useState(null);

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

      // 2021.11.02 Very fresh new problem with location permissions--
      // basically Expo Go stopped adding ACCESS_BACKGROUND_LOCATION to
      // the AndroidManifest even when it's specified in app.json.
      // https://github.com/expo/expo/issues/14774#issuecomment-954706864
      // Issue ongoing. Will just comment out for now; only affects bg updates
      //let bgpermissions = await Location.requestBackgroundPermissionsAsync();
      //if ( bgpermissions["status"] !== 'granted') {
      //  setErrorMsg('No permission to access device location (Background)');
      //  return;
      //}

      let location = await Location.getCurrentPositionAsync(
        {
          "accuracy": Location.Accuracy.BestForNavigation
        }
      );
      setLocation(location);
    })();
  });
  let locationText = 'Waiting for location...';
  if (errorMsg) {
    locationText = errorMsg;
  } else if (location) {
    locationText = `
LAT: ${JSON.stringify(location.coords.latitude)}
LNG: ${JSON.stringify(location.coords.longitude)}
HDG: ${JSON.stringify(location.coords.heading)}
ACC: ${JSON.stringify(location.coords.accuracy)}
TME: ${new Date(location.timestamp).toLocaleString()}
`

    // Send location to Paoloserver on an interval
    now = Date.now()
    if ((ws.readyState === 1) && (locLastSend + locSendIntervalMs < now)) {
      //console.log(`Sending location to server: ${JSON.stringify(location)}`);
      ws.send(JSON.stringify(location));
      setLocLastSend(now)
    }
  }


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
