/**
 * The DefaultController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/DefaultService');
const getToken = async (request, response) => {
  // to-do add somesort of a model
  // if (!request.headers.authorization) {
  //   return response.set('WWW-Authenticate', 'Basic').status(401).send();
  // }
  //   // Get the Base64 encoded string that follows "Basic " in the Authorization header
  //   const base64Credentials = request.headers.authorization.split(' ')[1];

  //   // Decode the Base64 encoded string
  //   const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  
  //   // Split the decoded string into username and password
  //   const [username, password] = credentials.split(':');
  
  //   // Check the username and password against process.env.GLOBAL_USER and process.env.GLOBAL_PASS
  //   if (username !== process.env.GLOBAL_USER || password !== process.env.GLOBAL_PASS) {
  //     return response.set('WWW-Authenticate', 'Basic').status(401).send();
  //   }
  return Controller.handleGenerateAccessToken(request, response);
};


module.exports = {
  getToken,
};
