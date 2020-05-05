import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  Modal,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
import { connect } from "react-redux";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Notifications } from "expo";
import NotificationsRegistry from "../components/NotificationsRegistry";
import { getDistance } from "geolib";
import styles from "./styles";
import { notificationActions } from "../actions/notifications";
import { userActions } from "../actions/user";
import {
  CHECKIN_REGISTER_URL,
  SECURE_STORE_KEY
} from '../constants/constants'

var checkUser;

class Checkin extends Component {
  state = {
    modalVisible: false,
    idproof: false,
    welcomeText: '',
    checkin: false,
    fetchCheckin: false,
    prepared: false,
  };

  setWelcomeText(){
    if (this.props.notification.checkin){
      this.setState({ welcomeText: "Please tap on Check-in to inform your current location" });
    }
    else{
      this.setState({ welcomeText: "No actions required at the moment" });
    }
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.setWelcomeText();
    // this._verifyNotification();
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = (notification) => {
    try {
      this.props.setNotification(notification);
      this.setState({checkin: true, fetchCheckin: true});
      this.setWelcomeText();
    }
    catch (error) {
      console.log(error);
    }
  }

  componentDidUpdate() {
    if (this.state.idproof) {
      this.prepareCheckin();
    }
  }

  async logout(){
    this.props.setUser(null);
    await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
  }
  
  checkin() {
    this._checkID();
  }
  checkLocations() {
    this.props.navigation.navigate("Locations");;
  }
  updateInfo() {
    this.props.navigation.navigate("Register", {activeUser: true});
  }

  async _checkID() {
    if (await LocalAuthentication.hasHardwareAsync()) {
      if (await LocalAuthentication.isEnrolledAsync()) {
        let idproof = await LocalAuthentication.authenticateAsync({
          promptMessage: "Confirm your identity",
          fallbackLabel: "",
          disableDeviceFallback: true,
          cancelLabel: "",
        });
        idproof.success
          ? this.setState({ idproof: idproof.success, modalVisible: true })
          : false;
        if (idproof.message) {
          alert(idproof.message);
        }
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

  prepareCheckin(){
    if (this.props.notification.notification !== null){
      let notificationData = this.props.notification.notification.data;
      checkUser = Object.assign({}, this.props.location.location, {
        userId: notificationData.userId,
        distance: getDistance(
          {
            latitude: notificationData.lat,
            longitude: notificationData.lng,
          },
          {
            latitude: this.props.location.location.latitude,
            longitude: this.props.location.location.longitude,
          }
        )
      });
    }
    this._checkin();
  }

  //ASYNC GETCURRENTLOCATION [call on tryAgain()] TODO
  _checkin = async () => {
    alert("checkin");
      if (this.state.fetchCheckin)
      await fetch(CHECKIN_REGISTER_URL, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkUser),
      })
        .then((response) => response.json())
        .then((response) => {
          this.setState({fetchCheckin: false})
          this.setState({ idproof: false, checkin: false });
          console.log("success");
          this.props.setNotification(null);
        })
        .catch((error) => {
          this.setState({fetchCheckin: false});
          this.setState({ idproof: false, checkin: false});
          alert("Sorry, we could not check your location."); //alert
          this.props.setNotification(null);
        });
  }

  render() {
      return (
        <View style={styles.container}>
        <NotificationsRegistry />
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this.setState({ modalVisible: false });
            }}
          >
            <View style={styles.modal}>
              <View>
                <Text style={styles.modalText}>Thanks for checking-in</Text>

                <TouchableHighlight
                  onPress={() => {
                    this.setState({ modalVisible: false });
                  }}
                  style={[
                      !this.state.checkin
                        ? styles.button
                        : styles.buttonDisabled,
                    ]}
                    disabled={this.state.checkin}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
            <Image
              style={styles.image}
              source={require('../assets/logo.png')}
              resizeMode='contain'
            />
          <View style={styles.content}>
            <Text style={styles.text}>v.1.0.3</Text>
          </View>
          <TouchableOpacity
            onPress={() => this.checkLocations()}
            style={styles.button}
            disabled={false}
          >
            <Text style={styles.buttonText}>See my Locations</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => this.updateInfo()} 
            style={styles.button}
            disabled={false}
          >
            <Text style={styles.buttonText}>Update my Info</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.logout()} style={styles.button}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      );
  }
}

const mapStateToProps = (state) => ({
  notification: state.notifications,
  user: state.user,
  location: state.location
});

function mapDispatchToProps(dispatch){
  return {
    setNotification: (notification) => {dispatch(notificationActions.setNotification(notification))},
    setUser: (user) => {dispatch(userActions.setUser(user))}
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Checkin);
