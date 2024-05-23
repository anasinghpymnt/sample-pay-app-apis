/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Request Convenience Fee
* 
*
* tla String String that points to test TLA
* authorization String jwt access token  - this access token must include a special scope
* convenienceFeeCalculate ConvenienceFeeCalculate 
* returns ConvenienceFeeCalculateResponse
* */
const cnvCalculation = ({ tla, authorization, convenienceFeeCalculate }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        tla,
        authorization,
        convenienceFeeCalculate,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Make payment
* 
*
* tla String String that points to test TLA
* authorization String jwt access token  - this access token must include a special scope
* makePaymentRequest MakePaymentRequest 
* returns makePayment_200_response
* */
const makePayment = ({ tla, authorization, makePaymentRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        tla,
        authorization,
        makePaymentRequest,
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
  cnvCalculation,
  makePayment,
};
