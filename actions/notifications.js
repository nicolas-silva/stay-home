import { 
    SET_EXPO_PUSH_TOKEN,
    SET_NOTIFICATION
} from '../constants/constants.js';

function setExpoPushToken(token) {
    return {
        type: SET_EXPO_PUSH_TOKEN,
        token
    }
}
function setNotification(notification) {
    return {
        type: SET_NOTIFICATION,
        notification: notification,
    }
}

export const notificationActions = {
    setExpoPushToken,
    setNotification,
}