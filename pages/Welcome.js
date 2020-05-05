import React, { Component } from "react";
import { Text, View, Image, TouchableOpacity, StatusBar } from "react-native";
import { connect } from "react-redux";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import { locationActions } from "../actions/location";
import { userActions } from "../actions/user";
import * as SecureStore from "expo-secure-store";
import Checkin from "../components/Checkin";
import Singin from "../components/Signin";
import { SECURE_STORE_KEY } from "../constants/constants";

import styles from "../components/styles";
import NotificationsRegistry from "../components/NotificationsRegistry";

let myLocation = Object({
  altitude: null,
  longitude: null,
  latitude: null,
  speed: null,
  heading: null,
  timestamp: null,
  mocked: null,
  accuracy: null,
  distance: null,
});

class Welcome extends Component {
  state = {};

  _getCurrentLocation = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        locationError: true,
      });
      alert("Permission to access location was denied");
    }
    //POPULATE LOCATION OBJECT
    else {
      if (! await Location.hasServicesEnabledAsync()) {
        alert("You need to activate your location");
        setTimeout(
          function () {
            //Start the timer
            this._getCurrentLocation(); //After 1 second, set render to true
          }.bind(this),
          1000
        );
      }
    }
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this._isUser();
    this._getCurrentLocation();
    console.log(this.props.location)
  }

  async _isUser() {
    let user = await SecureStore.getItemAsync(SECURE_STORE_KEY);
    if (user !== null) {
      this.props.setUser(JSON.parse(user));
    }
  }

  componentDidUpdate() {}

  render() {
    // if (this.prop.user.user !== null) {
    if (this.props.user.isUser) {
      return <Checkin navigation={this.props.navigation}/>;
    } else {
      return (
        <View style={styles.container}>
        <StatusBar backgroundColor="black" barStyle="dark-content" />
          <NotificationsRegistry />
            <Image
              style={styles.image}
              source={require('../assets/logo.png')}
              resizeMode='contain'
            />
          <View style={styles.content}>
            <Text style={styles.text}>v.1.0.3</Text>
          </View>
          <Singin />
          <Text style={styles.text}>Not a member?</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Register", {activeUser: false})}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  location: state.location,
});

function mapDispatchToProps(dispatch) {
  return {
    setUser: (user) => {
      dispatch(userActions.setUser(user));
    },
    setLocation: (location) => {
      dispatch(locationActions.setLocation(location));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
