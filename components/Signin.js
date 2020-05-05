import React, { Component } from "react";
import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
import { connect } from "react-redux";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import t from "tcomb-form-native";
import styles from "./styles";
import stylesheet from "./bootstrap";
import { userActions } from "../actions/user";
import Constants from "expo-constants";
import * as Location from "expo-location";
import {
  SECURE_STORE_KEY,
  USER_SIGNIN_URL,
  LOCATION_TASK_NAME
} from '../constants/constants'

var Form = t.form.Form;
// FORM VALIDATIONS

const Email = t.refinement(t.String, (email) => {
  const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/; //or any other regexp
  return reg.test(email) && email.length >= 10;
});

const options = {
  stylesheet: stylesheet,
  fields: {
    email: {
      placeholder: "Type your email here",
      maxLength: 50,
      autoCapitalize: 'none',
      keyboardType: 'email-address'
    },
  },
  auto: "placeholder",
};

// FORM STRUCTURE
var Fields = t.struct({
  email: Email,
});

class Signin extends Component {
  state = {
    value: null,
    validEmail: false,
    email: null,
    modalVisible: false,
    fetchLogin: true
  };

  //TCOMB-FORM FUNCTIONS
  // TCOMB-FORM NATIVE INITIALIZATION
  getInitialState() {
    return this.state.value;
  }
  // TCOMB-FORM manage values
  onChange(value) {
    this.setState({ value: value });
  }

  //ASYNC VALIDATE FINGERPRINT / FACEID
  async _validateAuth() {
    if (await LocalAuthentication.hasHardwareAsync()) {
      if (await LocalAuthentication.isEnrolledAsync()) {
        let idproof = await LocalAuthentication.authenticateAsync({
          promptMessage: "Confirm your identity",
          fallbackLabel: "",
          disableDeviceFallback: false,
          cancelLabel: "",
        });
        this._onPress();
        if (idproof.message) {
          alert(idproof.message);
        }
        console.log(" ID LOCAL " + JSON.stringify(idproof));
      } else {
        alert(
          "You need to configure fingerprints or facial authentication on your phone settings"
        );
      }
    } else {
      alert(
        "This application requires face or fingerprint scanner available on the device"
      );
    }
  }

  // SEND.ONPRESS()
  async _onPress() {
    var value = this.refs.form.getValue();
    if (value) {
      //DEFINE USER OBJECT - for database
      try {
        this.setState({ validEmail: true, email: value.email });
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Invalid e-mail address");
    }
  }

  async _signin() {
    if (this.state.fetchLogin){
        let user = Object({
            email: this.state.email,
            device: Constants.deviceId
        })
        await fetch(USER_SIGNIN_URL, {   
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
        })
        .then((response) => response.json())
        .then((response) => {
            if (response){
                this._storeUser(response);
                this.setState({fetchLogin: false})
            }
            else{
                alert('User not found. Try again.');
            }
        })
        .catch((error) => {
            alert("User not found. Try again."); //alert
            this.setState({fetchLogin: false})
        });
    }
  }

   async _storeUser(user) {
    try {
      await SecureStore.setItemAsync(
        SECURE_STORE_KEY,
        JSON.stringify(user)
      );
      this.props.setUserId(user.userkey);
      this.props.setUser(user);
      let { status } = await Location.requestPermissionsAsync();
      if (status === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 600000,
          showsBackgroundLocationIndicator: true,
          foregroundService :{
            notificationTitle: 'Stay Home is now accessing your location',
            notificationBody: 'If you want to stop sharing your location, close the app.',
            notificationColor: '#000000'  
          },
          pausesUpdatesAutomatically: false
        });
      }
    } catch (error) {
      // Error saving data
      alert("Error retrieving your info, please try again.");
    }
  }

  componentDidUpdate() {
    if (this.state.validEmail) {
      this._signin();
    }
  }

  render() {
    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({ modalVisible: false });
          }}
        >
          <View style={styles.modal}>
            <View>
              <Text style={styles.modalText}>
                Sign in
              </Text>
              <Text style={styles.helpText}>
                Inform the email you used last time you signed in using this device.
              </Text>
              <Form ref="form" type={Fields} options={options} />
              <TouchableHighlight
                onPress={() => {
                    this._validateAuth();
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Sign in</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        <TouchableOpacity onPress={() => this.setState({ modalVisible: true })} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
});

function mapDispatchToProps(dispatch) {
  return {
    setUser: (user) => {
      dispatch(userActions.setUser(user));
    },
    setUserId: (id) => {
        dispatch(userActions.setUserIdDB(id))
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Signin);
