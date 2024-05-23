/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* Get JWT token
* 
*
* returns getToken_200_response
* */
const getToken = (req, res) => new Promise(
  async (resolve, reject) => {
    try {

      
      resolve(Service.successResponse({
        token: 'eyJhbGci'
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
  getToken,
};
