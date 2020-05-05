import {
  SET_USER,
  SET_ADDRESS,
  SET_USER_ID,
  SET_USER_ID_DB,
  SET_ERROR_DATABASE,
  SET_ERROR_STORAGE,
  START_LOADING,
  END_LOADING,
} from "../constants/constants";

const initialState = {
  user: null,
  userIdDB: null,
  isUser: false,
  address: null,
  errorStorage: null,
  succesStorage: false,
  errorDatabase: null,
  succesDatabase: false,
  loading: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return Object.assign({}, state, {
        user: action.user,
        isUser: action.user ? true : false,
      });
    case SET_ADDRESS:
      return Object.assign({}, state, {
        address: action.address,
      });
    case SET_USER_ID_DB:
      return Object.assign({}, state, {
        userIdDB: action.id,
      });
    case SET_USER_ID:
      return Object.assign({}, state, {
        user: {...state.user, userkey: action.id,}
      });
    case SET_ERROR_DATABASE:
      return Object.assign({}, state, {
        errorDatabase: action.message,
        succesDatabase: action.message? false : true,
      });
    case SET_ERROR_STORAGE:
      return Object.assign({}, state, {
        errorStorage: action.message,
        succesStorage: action.message? false : true,
      });
    case START_LOADING:
      return Object.assign({}, state, {
        loading: true,
      });
    case END_LOADING:
      return Object.assign({}, state, {
        loading: false,
      });
    default:
      return state;
  }
};
export default userReducer;
