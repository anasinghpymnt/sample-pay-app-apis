/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Account inquiry by various params
* 
*
* tla String String that points to test TLA
* authorization String jwt access token  - this access token must include a special scope
* accountNumber String 
* paymentTypeCode String 
* authToken1 String  (optional)
* authToken2 String  (optional)
* authToken3 String  (optional)
* accountToken String  (optional)
* includeSchedules Boolean  (optional)
* returns AccountInfoResponse
* */
const accountInquiry = ({ tla, authorization, accountNumber, paymentTypeCode, authToken1, authToken2, authToken3, accountToken, includeSchedules }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        tla,
        authorization,
        accountNumber,
        paymentTypeCode,
        authToken1,
        authToken2,
        authToken3,
        accountToken,
        includeSchedules,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  accountInquiry,
};
