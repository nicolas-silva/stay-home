import * as SecureStore from "expo-secure-store";

import {
  SET_USER,
  SET_ADDRESS,
  SET_USER_ID,
  SET_USER_ID_DB,
  SET_ERROR_STORAGE,
  SECURE_STORE_KEY,
  SET_ERROR_DATABASE,
  START_LOADING,
  END_LOADING,
  USER_UPDATE_URL,
  USER_REGISTER_URL,
  GET_USER_URL,
} from "../constants/constants.js";

// Register User
function setUser(user) {
  return {
    type: SET_USER,
    user,
  };
}
// Set address result from Places
function setAddress(address) {
  return {
    type: SET_ADDRESS,
    address,
  };
}
// Set Id result from DB insert user
function setUserIdDB(id) {
  return {
    type: SET_USER_ID_DB,
    id,
  };
}
// Set Id result from DB insert user
function setUserId(id) {
  return {
    type: SET_USER_ID,
    id,
  };
}
// Set errorStorage when storage save fails
function setErrorStorage(message) {
  return {
    type: SET_ERROR_STORAGE,
    message,
  };
}
// Set errorDatabase when database insert fails
function setErrorDatabase(message) {
  return {
    type: SET_ERROR_DATABASE,
    message,
  };
}
// Start loading on screen
function startLoading() {
  return {
    type: START_LOADING,
  };
}
// End loading on screen
function endLoading() {
  return {
    type: END_LOADING,
  };
}
// Save user data on database
function saveUser() {
  return async (dispatch, getState) => {
    dispatch(startLoading());
    await fetch(USER_REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getState().user.user),
    })
      .then((response) => response.json())
      //DATABESS INSERT SUCCES
      .then((response) => {
        dispatch(setUserId(response.insertId));
        dispatch(endLoading());
      })
      //DATABASE INSERT FAIL
      .catch((error) => {
        dispatch(setErrorDatabase(error.message));
      });
  };
}
// Save user data on database
function getUser(userkey) {
  return async (dispatch, getState) => {
    await fetch(GET_USER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userkey: userkey }),
    })
      //DATABESS INSERT SUCCES
      .then((response) => {
        console.log(response);
        dispatch(setUser(response));
      })
      //DATABASE INSERT FAIL
      .catch((error) => {
        dispatch(setErrorDatabase(error.message));
      });
    dispatch(endLoading());
  };
}
// Update user data on database
function updateUser() {
  return async (dispatch, getState) => {
    dispatch(startLoading());
    await fetch(USER_UPDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getState().user.user),
    })
      //DATABESS INSERT SUCCES
      .then((response) => {
        dispatch(setErrorDatabase());
      })
      //DATABASE INSERT FAIL
      .catch((error) => {
        dispatch(setErrorDatabase(error.message));
      });
    dispatch(endLoading());
  };
}
// Store user data on local storage
function storeUser() {
  return async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      await SecureStore.setItemAsync(
        SECURE_STORE_KEY,
        JSON.stringify(getState().user.user)
      );
      dispatch(setErrorStorage());
    } catch (error) {
      // Error saving data
      dispatch(setErrorStorage(error.message));
    }
    dispatch(endLoading());
  };
}

export const userActions = {
  setUser,
  setAddress,
  setUserIdDB,
  saveUser,
  storeUser,
  updateUser,
};
