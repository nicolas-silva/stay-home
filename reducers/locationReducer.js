import {
  SET_LOCATION,
  ADD_TO_LOCAL_LIST,
  START_FETCH_LIST,
  END_FETCH_LIST,
  CLEAR_LOCAL_LIST,
} from "../constants/constants";
const initialState = {
  location: null,
  hasLocation: false,
  fetchList: false,
  localList: [],
};

const locationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCATION:
      return Object.assign({}, state, {
        location: action.location,
        hasLocation: true,
      })
    case CLEAR_LOCAL_LIST:
      return Object.assign({}, state, {
        localList: [],
      });
    case ADD_TO_LOCAL_LIST:
      return Object.assign({}, state, {
        localList: state.localList.concat(action.item),
      });
    case START_FETCH_LIST:
      return Object.assign({}, state, {
        fetchList: true,
      });
    case END_FETCH_LIST:
      return Object.assign({}, state, {
        fetchList: false,
      });
    default:
      return state;
  }
};
export default locationReducer;
