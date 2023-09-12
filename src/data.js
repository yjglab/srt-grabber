const {
  DEPARTURE,
  DESTINATION,
  BOARDING_DATE,
  HUMANS,
  USER_NAME,
  USER_PHONE,
  USER_PASSWORD,
  USER_EMAIL,
} = require("../env");

const route = {
  departure: DEPARTURE,
  destination: DESTINATION,
  date: BOARDING_DATE,
  number: HUMANS,
};
const userInfo = {
  name: USER_NAME,
  phone: USER_PHONE,
  password: USER_PASSWORD,
  passwordConfirm: USER_PASSWORD,
  email: USER_EMAIL,
};

module.exports = { route, userInfo };
