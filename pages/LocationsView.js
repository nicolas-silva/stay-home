import React, { Component } from 'react';
import { SafeAreaView, FlatList, StyleSheet, Text, TouchableHighlight, ActivityIndicator } from 'react-native';
import { locationActions } from "../actions/location";
import { userActions } from "../actions/user";
import { connect } from "react-redux";
import styles from "../components/styles";
import LocationItem from '../components/LocationItem';


class LocationsView extends Component {
  constructor(props){
    super(props);
    this.props.getCheckins();
  }
  componentDidMount(){
    console.log(this.props);
    
  }
  render(){
    return (
      this.props.location.fetchList?
        <ActivityIndicator size="large" color="#000000" style={{padding: 10,}} />
      :
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.props.location.localList}
          renderItem={({ item }) => <LocationItem id={item.id} title={item.title} description={item.description} />}
          keyExtractor={item => item.id}
        />
        <TouchableHighlight
          style={styles.button}
          onPress={() => this.props.checkinLocation()}
          disabled={false}
          underlayColor="#99d9f4"
        >
          <Text style={styles.buttonText}>Share current location</Text>
        </TouchableHighlight>
      </SafeAreaView>
    );
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
    getCheckins: () => {
      dispatch(locationActions.getCheckins());
    },
    removeLocalfromList: (id) => {
      dispatch(locationActions.removeLocalfromList(id));
    },
    checkinLocation: () => {
      dispatch(locationActions.checkinLocation());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationsView);