const config = require('./src/config');
const logger = require('./src/logger');
const ExpressServer = require('./src/expressServer');

const launchServer = async () => {
  try {
    // randomize port here 
    const port = 8081;
    this.expressServer = new ExpressServer(port, config.OPENAPI_YAML);
    await this.expressServer.launch();
    logger.info('Express server running');
    return this.expressServer.getApp();
  } catch (error) {
    console.log(error);
    logger.error('Express Server failure', error.message);
  }
};
launchServer();
// wait for 2 sec

module.exports = this.expressServer.getApp();