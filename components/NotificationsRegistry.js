import React, {Component} from "react";
import { Platform } from "react-native";
import { connect } from "react-redux";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import { View, Text } from 'react-native';
import Constants from "expo-constants";
import { notificationActions as actions} from '../actions/notifications';

class NotificationRegistry extends Component {
  state = {
  }

  registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = await Notifications.getExpoPushTokenAsync();
      this.props.setExpoPushToken(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.createChannelAndroidAsync("default", {
        name: "default",
        sound: false,
        priority: "max",
        vibrate: [0, 250, 250, 250],
      });
    }
  }


  componentDidUpdate(){
  }

  componentDidMount() {
    this.registerForPushNotificationsAsync();
  }

  render() {
    return (
      <View>
      <Text> </Text>
      </View>
    );
  }
}

const mapStateToProps = state => ({

  token: state.notifications,

});

function mapDispatchToProps(dispatch) {
  return({
      setNotification: (notification) => {dispatch(actions.setNotification(notification))},
      setExpoPushToken: (token) => {dispatch(actions.setExpoPushToken(token))},
  })
}
  

export default connect(mapStateToProps, mapDispatchToProps)(NotificationRegistry);
