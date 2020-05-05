import moment from "moment";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import {
  SET_LOCATION,
  CLEAR_LOCAL_LIST,
  ADD_TO_LOCAL_LIST,
  START_FETCH_LIST,
  END_FETCH_LIST,
  CHECKIN_LIST_URL,
  REMOVE_CHECKIN_URL,
  CHECKIN_REGISTER_URL,
} from "../constants/constants.js";

function setLocation(location) {
  return {
    type: SET_LOCATION,
    location,
  };
}

// Add local to list
function addtoLocalList(item) {
  return {
    type: ADD_TO_LOCAL_LIST,
    item,
  };
}
// Remove local from list
function startFetchList() {
  return {
    type: START_FETCH_LIST,
  };
}
// Remove local from list
function endFetchList() {
  return {
    type: END_FETCH_LIST,
  };
}
// Remove local from list
function clearLocalList() {
  return {
    type: CLEAR_LOCAL_LIST,
  };
}
function getLocation() {
  return async (dispatch, getState) => {
    dispatch(startFetchList());
    if (await Location.hasServicesEnabledAsync()) {
      let location = await Location.getLastKnownPositionAsync({});
      let myLocation = {
        altitude: location.coords.altitude,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        mocked: location.mocked,
        accuracy: location.coords.accuracy,
        userid: getState().user.user.userkey,
        distance: getDistance(
          {
            latitude: getState().user.user.latitude,
            longitude: getState().user.user.longitude,
          },
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
        ),
      };
      dispatch(setLocation(myLocation));
    }
  };
}
function checkinLocation() {
  return async (dispatch, getState) => {
    dispatch(startFetchList());
    await dispatch(getLocation());
    await fetch(CHECKIN_REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getState().location.location),
    })
      .then(() => {
        //prepare list data
        dispatch(getCheckins());
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
}

function getCheckins() {
  return async (dispatch, getState) => {
    dispatch(startFetchList());
    dispatch(clearLocalList());
    await fetch(CHECKIN_LIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getState().user.user),
    })
      .then((response) => response.json())
      .then((response) => {
        //prepare list data
        let id,
          title,
          description = null;
        response.map((local) => {
          id = local.idchecking.toString();
          title = moment(local.checkingtime.toString()).calendar();
          const distance = local.distance - local.accuracy;
          description =
            distance <= 0
              ? "at your home address"
              : "around " +
                distance.toFixed() +
                "mts away from your home address";
          const item = { id: id, title: title, description: description };
          dispatch(addtoLocalList(item));
        });
        dispatch(endFetchList());
      })
      .then(() => {})
      //DATABASE INSERT FAIL
      .catch((error) => {
        console.log(error.message);
      });
  };
}

function removeLocalfromList(id) {
  return async (dispatch) => {
    await fetch(REMOVE_CHECKIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkingid: id }),
    })
      .then(() => {
        dispatch(getCheckins());
      })
      //DATABASE INSERT FAIL
      .catch((error) => {
        console.log(error.message);
      });
  };
}

export const locationActions = {
  setLocation,
  getCheckins,
  removeLocalfromList,
  checkinLocation,
};
