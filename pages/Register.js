import React, { Component } from "react";

import { Text, View, TouchableHighlight, Modal, Platform } from "react-native";
import { connect } from "react-redux";
import { userActions } from "../actions/user";
import { locationActions } from "../actions/location";
import { notificationActions } from "../actions/notifications";
import { ScrollView } from "react-native-gesture-handler";
import * as Location from "expo-location";
import Constants from "expo-constants";
import * as LocalAuthentication from "expo-local-authentication";
import moment from "moment";
import stylesheet from "../components/bootstrap";
import Places from "../components/Places";
var _ = require("lodash");
import t from "tcomb-form-native";
import styles from "../components/styles";
import {
  LOCATION_TASK_NAME,
} from "../constants/constants";

var checkUser = null;

var Form = t.form.Form;
// FORM VALIDATIONS

const Email = t.refinement(t.String, (email) => {
  const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/; //or any other regexp
  return reg.test(email) && email.length >= 10;
});

const Phone = t.refinement(t.Number, (phone) => {
  const reg = /^04[0-9]{8}$/; //or any other regexp
  const string = "0" + phone;
  return reg.test(string);
});

const options = {
  stylesheet: stylesheet,
  order: ["name", "phone", "email", "idtype", "idnum", "dob"],
  fields: {
    name: {
      label: "Full Name*",
      minLength: 10,
      maxLength: 255,
      autoCapitalize: "words",
    },
    idtype: {
      label: "Type of ID",
      nullOption: { value: "", text: "" },
    },
    idnum: {
      label: "ID number",
      minLength: 4,
      maxLength: 13,
    },
    dob: {
      error: "Enter a valid Date",
      mode: "date",
      label: "Date of Birth",
      config: {
        format: (date) => moment(date).format("DD/MM/YYYY"),
        dialogMode: "default",
        defaultValueText: " ",
        stylesheet: stylesheet,
      },
      maximumDate: moment(new Date()).toDate(),
    },
    phone: {
      label: "Mobile Number*",
      maxLength: 10,
      autoCorrect: true,
    },
    email: {
      label: "E-mail*",
      maxLength: 50,
      autoCapitalize: "none",
      keyboardType: "email-address",
    },
  },
  auto: "label",
};

// END OF FORM VALIDATIONS
// FORM STRUCTURE
var Person = t.struct({
  // all fields required
  name: t.String, //
  idtype: t.maybe(
    t.enums({
      D: "Driver License",
      P: "International Passport",
    })
  ),
  idnum: t.maybe(t.String), //
  dob: t.maybe(t.Date), //
  phone: Phone, //
  email: Email,
});
// END OF FORM STRUCTURE

// LOCATION DEFINITIONS
// CURRENT LOCATION - CHECK-IN
var currentLocation = Object({
  userID: null,
  userEmail: null,
  userDevice: null,
  currentAltitude: null,
  currentLongitude: null,
  currentLatitude: null,
  currentSpeed: null,
  currentHeading: null,
  currentTimestamp: null,
  currentMocked: null,
  currentAccuracy: null,
  distance: null,
});
var user = Object({
  name: null,
  phone: null,
  email: null,
  dob: null,
  idtype: null,
  idnum: null,
  device: null,
  pushToken: null,
});

var value;

// CLASS DEFINITION AND FUNCTIONS
class Register extends Component {
  // this.state
  state = {
    value: null,
    modalVisible: false,
    buttonVisible: false,
    locationStore: false,
    databaseSucess: false,
    validData: false,
    checkin: false,
    storage: false,
    secureStorage: false,
    deviceError: false,
    idproof: false,
    addressModalVisible: false,
    addButtonVisible: false,
    addSelected: false,
    saveButton: true,
    streetAddress: "",
    response: null,
    finished: false,
    info: "Saving...",
    fetchCheckin: true,
    fetchUser: true,
    user: null,
    userid: null,
    pushToken: null,
    location: null,
  };

  //TCOMB-FORM FUNCTIONS
  // TCOMB-FORM NATIVE INITIALIZATION

  // TCOMB-FORM manage values
  onChange(value) {
    this.setState({ value: value });
  }

  // SEND.ONPRESS()
  async _onPress() {
    var value = this.refs.form.getValue();
    if (value) {
      //DEFINE USER OBJECT - for database
      user.name = value.name;
      user.phone = value.phone;
      user.email = value.email;
      user.idnum = value.idnum ? value.idnum : "";
      user.idtype = value.idtype ? value.idtype : "";
      user.dob = value.dob ? value.dob : "";
      user.device = Constants.deviceId;
      user.pushToken = this.props.notification.expoPushToken;
      if (this.props.route.params.activeUser) {
        user.userkey = this.props.user.user.userkey;
        user.address = this.props.user.user.address;
        user.latitude = this.props.user.user.latitude;
        user.longitude = this.props.user.user.longitude;
      }
      if (this.state.addSelected) {
        user = Object.assign(user, this.state.address);
      }
      try {
        await this.props.setUser(user);
        this.setState({ validData: true,  buttonVisible: true, modalVisible: true, });
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Please, check all required fields");
    }
  }

  // STAY-HOME FUNCTIONS

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
        this.setState({ idproof: !idproof.success });
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

  // BACK TO WELCOME PAGE IF LOCALAUTH FAIL [call from componentDidUpdate()]
  redirect() {
    this.props.navigation.navigate("Home");
  }

  // SAVE USER - param user - Object User [call from SEND.ONPRESS()]
  async _saveUser() {
    //async function - save on database
    try {
      if (this.props.route.params.activeUser) {
        console.log("Updating user");
        this.setState({validData: false,});
        await this.props.updateUser()
        this.setState({
          databaseSucess: true,
        });
      } else {
        console.log("Saving user");
        this.setState({validData: false})
        await this.props.saveUser();
        this.setState({
          databaseSucess: true,
        });
      }
    } catch (error) {
      console.log(error);
      this.setState({
        databaseSucess: false,
        validData: false,
        buttonVisible: false,
        modalVisible: false,
      });
    }
  }

  async _storeUser() {
    console.log("Saving user localy");
    this.setState({ checkin: false });      //checkin instead of databaseSuccess
    try{
      await this.props.storeUser();
      this.setState({ secureStorage: true });
    }
    catch{(error) => {
      console.log(error);
    }};
  }

  //DO FIRST CHECK-IN BEFORE LEAVE
  _checkin = async () => {
    this.setState({ databaseSucess: false });
    try{
      await this.props.checkinLocation();
      this.setState({ checkin: true });

    }
    catch{(error) => {
      console.log(error);
    }}
    let { status } = await Location.requestPermissionsAsync();
    if (status === "granted") {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000,
        // timeInterval: 3600000,
        distanceInterval: 600,
      });
    }
  };

  //MODAL.CLOSE()
  onCloseRequest() {
    //hide modal and modal button
    if (this.state.finished) this.redirect();
  }

  // DEFAULT CONSTRUCTOR
  constructor(props) {
    super(props);
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        deviceError: true,
      });
      alert(
        "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      );
    }
    if (this.props.route.params.activeUser) {
      let birthDate = null;
      if (this.props.user.user.dob.length === 24) {
        console.log(this.props.user.user.dob.toString());
        birthDate = new Date(this.props.user.user.dob.toString());
      }
      value = {
        name: this.props.user.user.name,
        phone: "0" + this.props.user.user.phone,
        email: this.props.user.user.email,
        dob: birthDate,
        idtype: this.props.user.user.idtype,
        idnum: this.props.user.user.idnum,
      };
    } else {
      value = null;
    }
  }

  componentDidMount() {
    this._validateAuth();
    this.setState({ location: this.props.location.location });
    if (this.props.route.params.activeUser) {
      this.setState({ saveButton: false });
    }
    console.log(this.props);
    if (this.props.route.params.activeUser) {
      let string;
      if (this.props.user.user.address.length > 35) {
        string = this.props.user.user.address.substring(0, 32) + "...";
      } else {
        string = this.props.user.user.address;
      }
      this.setState({
        address: {
          description: this.props.user.user.address,
          latitude: this.props.user.user.latitude,
          longitude: this.props.user.user.longitude,
        },
        streetAddress: string,
      });
    }
  }

  componentWillUnmount() {}

  componentDidUpdate() {
    if (this.state.idproof) {
      this.redirect();
    }
    if (this.state.validData) {
      console.log("Cadastro valido");
      this._saveUser();
    }
    if (this.state.databaseSucess) {
      console.log("Cadastro salvo");
      this._checkin();
    }
    if (this.state.checkin) {
      console.log("usuario Cadastro Salvo");
      this._storeUser();
    }
    if (this.state.secureStorage) {
      this._updateData();
      console.log("Cadastro finalizado");
    }
  }

  _updateData() {
    this.setState({  secureStorage: false, finished: true, info: "Done", });
  }

  openAddress() {
    this.setState({ addressModalVisible: true, addButtonVisible: true });
  }

  async _addressSelected() {
    console.log("Address selected");
    let add = this.props.user.address;
    console.log(add);
    if (add !== null) {
      let string;
      if (add.address.length > 35) {
        string = add.address.substring(0, 32) + "...";
      } else {
        string = add.address;
      }
      this.setState({
        addressModalVisible: false,
        addButtonVisible: false,
        addSelected: true,
        saveButton: false,
        streetAddress: string,
        address: add,
      });
      console.log(this.state);
    }
  }

  // FORM RENDER
  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.onCloseRequest();
          }}
        >
          <View style={styles.modal}>
            <View>
              <Text style={styles.modalText}>We are now saving you info</Text>

              <TouchableHighlight
                onPress={() => this.onCloseRequest()}
                visible={this.state.buttonVisible}
                style={[
                  this.state.finished ? styles.button : styles.buttonDisabled,
                ]}
                disable={!this.state.finished}
              >
                <Text style={styles.buttonText}>{this.state.info}</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        <ScrollView style={styles.scroll}>
          <Text style={styles.label}>Address*</Text>
          <TouchableHighlight
            style={styles.addressField}
            onPress={() => this.openAddress()}
            underlayColor="#99d9f4"
          >
            <Text style={styles.addressText}>{this.state.streetAddress}</Text>
          </TouchableHighlight>
          <Form ref="form" type={Person} options={options} value={value} />
        </ScrollView>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.addressModalVisible}
          onRequestClose={() => {
            this._addressSelected();
          }}
        >
          <View style={styles.modal}>
            <Text style={styles.modalText}>Address</Text>
            <View style={styles.modalInfo}>
              <Text style={styles.helpText}>
                Inform the address where you chose to stay during the
                quarantine.
              </Text>
            </View>
            <Places style={{ height: 100 }} />
            <TouchableHighlight
              onPress={() => this._addressSelected()}
              visible={this.state.addbuttonVisible}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableHighlight>
          </View>
        </Modal>

        <TouchableHighlight
          style={[
            this.state.saveButton ? styles.buttonDisabled : styles.button,
          ]}
          onPress={() => this._onPress()}
          disabled={this.state.saveButton}
          underlayColor="#99d9f4"
        >
          <Text style={styles.buttonText}>
            {this.props.route.params.activeUser ? "Update" : "Save"}
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  location: state.location,
  notification: state.notifications,
});
function mapDispatchToProps(dispatch) {
  return {
    setUser: (user) => {
      dispatch(userActions.setUser(user));
    },
    saveUser: () => {
      dispatch(userActions.saveUser());
    },
    updateUser: () => {
      dispatch(userActions.updateUser());
    },
    storeUser: () => {
      dispatch(userActions.storeUser());
    },
    checkinLocation: () => {
      dispatch(locationActions.checkinLocation());
    },
    setNotification: (notification) => {
      dispatch(notificationActions.setNotification(notification));
    },
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Register);
