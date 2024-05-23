const fs = require('fs');
const path = require('path');
const camelCase = require('camelcase');
const config = require('../config');
const logger = require('../logger');
const httpProxy = require('http-proxy');
const jwtSimple = require('jwt-simple');
const moment = require('moment');
const {default: axios, default: Axios} = require('axios');
// Create a proxy server
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
});


proxy.on('proxyReq', (proxyReq, req, res, options) => {
  if (req.body) {
    // let bodyData = JSON.stringify(req.body);
    let bodyData = req.rawBody;
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

    proxyReq.write(bodyData);
  }
});

class Controller {
  static sendResponse(response, payload) {
    /**
    * The default response-code is 200. We want to allow to change that. in That case,
    * payload will be an object consisting of a code and a payload. If not customized
    * send 200 and the payload as received in this method.
    */
    response.status(payload.code || 200);
    const responsePayload = payload.payload !== undefined ? payload.payload : payload;
    if (responsePayload instanceof Object) {
      response.json(responsePayload);
    } else {
      response.end(responsePayload);
    }
  }

  static sendError(response, error) {
    response.status(error.code || 500);
    if (error.error instanceof Object) {
      response.json(error.error);
    } else {
      response.end(error.error || error.message);
    }
  }

  /**
  * Files have been uploaded to the directory defined by config.js as upload directory
  * Files have a temporary name, that was saved as 'filename' of the file object that is
  * referenced in request.files array.
  * This method finds the file and changes it to the file name that was originally called
  * when it was uploaded. To prevent files from being overwritten, a timestamp is added between
  * the filename and its extension
  * @param request
  * @param fieldName
  * @returns {string}
  */
  static collectFile(request, fieldName) {
    let uploadedFileName = '';
    if (request.files && request.files.length > 0) {
      const fileObject = request.files.find(file => file.fieldname === fieldName);
      if (fileObject) {
        const fileArray = fileObject.originalname.split('.');
        const extension = fileArray.pop();
        fileArray.push(`_${Date.now()}`);
        uploadedFileName = `${fileArray.join('')}.${extension}`;
        fs.renameSync(path.join(config.FILE_UPLOAD_PATH, fileObject.filename),
          path.join(config.FILE_UPLOAD_PATH, uploadedFileName));
      }
    }
    return uploadedFileName;
  }

  static getRequestBodyName(request) {
    const codeGenDefinedBodyName = request.openapi.schema['x-codegen-request-body-name'];
    if (codeGenDefinedBodyName !== undefined) {
      return codeGenDefinedBodyName;
    }
    const refObjectPath = request.openapi.schema.requestBody.content['application/json'].schema.$ref;
    if (refObjectPath !== undefined && refObjectPath.length > 0) {
      return (refObjectPath.substr(refObjectPath.lastIndexOf('/') + 1));
    }
    return 'body';
  }

  static collectRequestParams(request) {
    const requestParams = {};
    if (request.openapi && request.openapi.schema.requestBody !== undefined) {
      const { content } = request.openapi.schema.requestBody;
      if (content['application/json'] !== undefined) {
        const requestBodyName = camelCase(this.getRequestBodyName(request));
        requestParams[requestBodyName] = request.body;
      } else if (content['multipart/form-data'] !== undefined) {
        Object.keys(content['multipart/form-data'].schema.properties).forEach(
          (property) => {
            const propertyObject = content['multipart/form-data'].schema.properties[property];
            if (propertyObject.format !== undefined && propertyObject.format === 'binary') {
              requestParams[property] = this.collectFile(request, property);
            } else {
              requestParams[property] = request.body[property];
            }
          },
        );
      }
    }

    request?.openapi?.schema?.parameters?.forEach((param) => {
      if (param.in === 'path') {
        requestParams[param.name] = request.openapi.pathParams[param.name];
      } else if (param.in === 'query') {
        requestParams[param.name] = request.query[param.name];
      } else if (param.in === 'header') {
        requestParams[param.name] = request.headers[param.name];
      }
    });
    return requestParams;
  }

  static async handleRequest(request, response, serviceOperation) {
    try {
      const serviceResponse = await serviceOperation(this.collectRequestParams(request));
      Controller.sendResponse(response, serviceResponse);
    } catch (error) {
      Controller.sendError(response, error);
    }
  }

  static async generateAccessToken(scopes = ['xotp']) {
    const PAYMENTUS_ALG = "HS256";
    const PAYMENTUS_KID = "001";
    const now = moment();
    const timeout = process.env.JWT_EXPIRY || 300; // add 30 days 30*24*60*60 
    const jwtKey = process.env.JWT_KEY || 'D78E3BCC8CCE4A4B0E1A05C00F2B304C91689943DD2778D9AD1F2E92B0BA0DAC';

    const accessToken = jwtSimple.encode({
        "iss": process.env.BILLER_TLA || 'ggfi',
        "iat": now.unix() - 100,
        "requestedScope": scopes,
        "requestedTTL": timeout
    }, jwtKey,
        PAYMENTUS_ALG,
        {
            'header': {
                "alg": PAYMENTUS_ALG,
                "typ": "JWT",
                "kid": PAYMENTUS_KID,
            }
        }
    );
    return this.makeRequest(accessToken);
  }

  static async  makeRequest(accessToken) {

    const options = {
      method: 'post',
      url: `${process.env.XOTP_SERVER_URL || 'http://localhost:5001'}/api/token/${process.env.BILLER_TLA || 'abc'}`,
      data: {
        jwt: accessToken
      },
    };
  
    const response = await axios(options);
    return response.data;
  }
  
  
static async handleRequestToXOTPServer(request, response, serviceOperation) {
  try {
    // first fetch a token from the paymentus server
    const {token} = await this.generateAccessToken();
    // make an axios call with request body and url
    const res = await axios({
      method: request.method,
      url: `${process.env.XOTP_SERVER_URL || 'http://localhost:5001'}${request.url}`,
      data: request.body,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      
    })
    return Controller.sendResponse(response, res.data);
  } catch (error) {
    Controller.sendError(response, error);
  }
}

static async handleGenerateAccessToken(request, response) {
  try {
    // first fetch a token from the paymentus server with limited scope profile
    const res = await this.generateAccessToken();
    // Forward the request to another server
    Controller.sendResponse(response, res);
  } catch (error) {
    Controller.sendError(response, error);
  }
}
}


module.exports = Controller;
