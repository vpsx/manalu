import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as Location from 'expo-location';

// someday I will maybe understand imports vs requires wtf
const axios = require('axios');

console.log("I'm going vrazy")

axios.get('http://192.168.1.8:5000/getlocation?name=tadpoles')
.then(function(response) {
  console.log("GETLOCATION response:")
  console.log(response.data);
})
.catch(function(error) {
  console.log(error);
});

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


class Beacon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: null,
    };
  }

  componentDidMount() {
    this.timer = setInterval(
      () => this.updateLocation(),
      60000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  updateLocation() {
    console.log("Is this doing stuff?")
    this.setState({
      location: null, //TODO
    });
  }

  render() {
    return (
      <>
        <Text>Write the location here</Text>
        <Text>Write something else here</Text>
      </>
    );
  }

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
      <Beacon />
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
