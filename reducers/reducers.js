import { combineReducers } from 'redux';
import userReducers from './userReducer';
import notificaitonsReducers from './notificationsReducers';
import locationReducer from './locationReducer';


export default combineReducers({
  user: userReducers,
  notifications: notificaitonsReducers,
  location: locationReducer,
})