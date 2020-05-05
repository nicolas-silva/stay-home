import React, { Component } from "react";
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet
} from "react-native";
import { locationActions } from "../actions/location";
import { userActions } from "../actions/user";
import { connect } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";

class LocationItem extends Component {
  render() {
    return (
      <View style={styles.item}>
        <View style={styles.data}>
          <Text style={styles.title}>{this.props.title}</Text>
          <Text style={styles.description}>{this.props.description}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableHighlight onPress={() => this.props.removeLocalfromList(this.props.id)}>
            <FontAwesome name="trash-o" size={32} color="black" />
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff'
    },
    item: {
      backgroundColor: '#e8eff1',
      borderColor: '#000000',
      borderRadius: 5,
      borderWidth: 0,
      padding: 20,
      marginVertical: 5,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    data:{
      maxWidth: '90%',
    },
    title: {
      fontSize: 15,
      fontWeight: 'bold'
    },
    description: {
      fontSize: 12,
    },
    button: {
      height: 30,
      width: 30,
      backgroundColor: "#000000",
      borderColor: "#000000",
      borderWidth: 0,
      borderRadius: 8,
      marginBottom: 10,
      alignSelf: "flex-end",
      alignItems: 'center',
      justifyContent: "center",
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: 'bold'
    },
  });


const mapStateToProps = (state) => ({
    user: state.user,
  });
  
  function mapDispatchToProps(dispatch) {
    return {
      removeLocalfromList: (id) => {
        dispatch(locationActions.removeLocalfromList(id));
      }
    };
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(LocationItem);