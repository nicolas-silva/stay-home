import React from "react";
import { connect } from 'react-redux';
// import * as SecureStore from "expo-secure-store";
import { userActions } from '../actions/user';
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { View, StyleSheet } from "react-native";
import {
  API_KEY
} from '../constants/constants'

class Places extends React.Component {
  state = {
    address: false,
  };

  componentDidUpdate() {
    if (this.state.address) {
      this.setState({address: false});
    }
  }
  
  componentDidMount(){
    
  }

  saveAddress(data, details) {
    // 'details' is provided when fetchDetails = true
    // address.description = details.formatted_address;
    // address.latitude = details.geometry.location.lat;
    // address.longitude = details.geometry.location.lng;
    let address;
    this.props.setAddress(address = {address: details.formatted_address,
                                      latitude: details.geometry.location.lat,
                                      longitude: details.geometry.location.lng})
    this.setState({ address: true });
    
  }

  async _storeAddress() {
    this.setState({ address: false });
  }

  render() {
    return (
      <View style={styles.container}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          minLength={5} // minimum length of text to search
          autoFocus={true}
          autoCapitalize={"words"}
          returnKeyType={"search"} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
          keyboardAppearance={"light"} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
          listViewDisplayed="true" // true/false/undefined
          fetchDetails={true}
          renderDescription={(row) => row.description || row.formatted_address} // custom description render
          // renderDescription={(row) => row.description} // custom description render
          onPress={(data, details = null) => this.saveAddress(data, details)}
          getDefaultValue={() => ""}
          query={{
            // available options: https://developers.google.com/places/web-service/autocomplete
            key: API_KEY,
            language: "en", // language of the results
            components: "country:au",
          }}
          styles={{
            container: {
              borderColor: "#FFFFFF",
            },
            textInputContainer: {
              backgroundColor: "#050505",
              borderColor: "#050505",
              height: 55,
              alignItens: 'center',
              textDecorationColor: "#050505",
              borderRadius: 4,
              padding: 0,
            },
            textInput: {
              height: 40,
              textDecorationColor: "#e3e3e3",
              fontSize: 17,
              width: "100%",
              borderColor: "#ffffff",
              borderWidth: 1,
              borderRadius: 4,
              marginBottom: 5,
              alignSelf: "stretch",
              justifyContent: "center",
            },
            description: {
              textDecorationColor: "#CCCCCC",
            },
            listView:{
                borderWidth: 1,
                borderColor: "#CCCCCC",
                borderRadius: 4,
            },
            poweredContainer:{
                borderWidth: 1,
                borderColor: "#e3e3e3",
                backgroundColor: "#e3e3e3",
            },
            powered:{
                borderWidth: 1,
                backgroundColor: "#e3e3e3",
            },
            separator:{
                borderWidth: 0.5,
                borderColor: "#CCCCCC",
            },
          }}
          // currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
          nearbyPlacesAPI="'GoogleReverseGeocoding'" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
          GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: "distance",
          }}
          GooglePlacesDetailsQuery={{
            // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
            fields: ["formatted_address", "geometry"],
          }}
          filterReverseGeocodingByTypes={["locality"]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
          debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
        />
      </View>
    );
  }
}


// DEFINE STYLES
const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      padding: 20,
      height: '50%',
    }
});

const mapStateToProps = state => ({

  user: state.user,

});
function mapDispatchToProps(dispatch){
  return {
    setAddress: (address) => {dispatch(userActions.setAddress(address))},
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Places)