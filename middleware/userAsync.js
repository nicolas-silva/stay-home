import moment from "moment";
import userActions from "../actions/user";

import {
  CHECKIN_LIST_URL,
  REMOVE_CHECKIN_URL,
} from "../constants/constants.js";

function getCheckins() {
  return async (dispatch, getState) => {
    console.log("------- USER ASYNC ACTIONS");
    console.log(getState());
    dispatch(userActions.startFetchList());
    dispatch(userActions.clearLocalList());
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
          console.log(id, title, description);
          const item = { id: id, title: title, description: description };
          console.log(item);
          dispatch(userActions.addtoLocalList(item));
        });
        dispatch(userActions.endFetchList());
      })
      .then(() => {})
      //DATABASE INSERT FAIL
      .catch((error) => {
        console.log(error.message);
      });
  };
}

function removeLocalfromList(id) {
  return async (dispatch, getState) => {
    console.log("remove item: " + id);
    await fetch(REMOVE_CHECKIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkingid: id }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("removed");
        dispatch(getCheckins());
      })
      //DATABASE INSERT FAIL
      .catch((error) => {
        console.log(error.message);
      });
  };
}

export const userAsyncActions = {
  // saveUser,
  // updateUser,
  // login,
  getCheckins,
  removeLocalfromList,
};
