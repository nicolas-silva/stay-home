import "react-native-gesture-handler";
import React, {Component} from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { createStore , applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import Geocoder from "react-native-geocoding";
import Welcome from "./pages/Welcome";
import moment from "moment";
import Register from "./pages/Register";
import LocationsView from "./pages/LocationsView";
import reducer from "./reducers/reducers";
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import {
  API_KEY,
  LOCATION_TASK_NAME,
} from './constants/constants'
import { locationActions } from "./actions/location";



const Stack = createStackNavigator();
const store = createStore(reducer, applyMiddleware(thunk));

Geocoder.init(API_KEY, {language : "en"});

export default class App extends Component{
  
  constructor(props){
    super(props);
    
  }

  componentDidMount(){
    
  }

  componentDidUpdate(){
  }


  render(){
    return (
      <Provider store = { store }>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home" 
            screenOptions={{
              headerStyle: {
                backgroundColor: '#000000',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}>
            <Stack.Screen 
            name="Home" 
            component={Welcome}
            options={{
              title: 'Home',
            }}
            />
            <Stack.Screen 
            name="Locations" 
            component={LocationsView}
            options={{
              title: 'My Locations',
            }}
            />
            <Stack.Screen name="Register" component={Register} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
}


TaskManager.defineTask(LOCATION_TASK_NAME, async () => {
  console.log('Send Location: ' + moment(new Date()).format());
  if (await Location.hasServicesEnabledAsync() && store.getState().user !== null) 
  {
    store.dispatch(locationActions.checkinLocation())
  }
});

BackgroundFetch.registerTaskAsync(LOCATION_TASK_NAME, {
  minimumInterval: 600,
  stopOnTerminate: false,
  startOnBoot: true,
})