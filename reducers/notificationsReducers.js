import { SET_EXPO_PUSH_TOKEN, SET_NOTIFICATION } from "../constants/constants";
const initialState = {
  expoPushToken:    null,
  notification:   null,
};


const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_EXPO_PUSH_TOKEN:
      return Object.assign({}, state, {
        expoPushToken: token
      })
    case SET_NOTIFICATION:
      return Object.assign({}, state, {
        notification: action.notification
      })
    default:
      return state;
  }
};
export default notificationsReducer;
