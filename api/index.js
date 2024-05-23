const config = require('./src/config');
const logger = require('./src/logger');
const ExpressServer = require('./src/expressServer');

const launchServer = async () => {
  try {
    // randomize port here 
    const port = Math.floor(Math.random() * (65535 - 49152 + 1) + 49152);
    this.expressServer = new ExpressServer(port, config.OPENAPI_YAML);
    await this.expressServer.launch();
    logger.info('Express server running');
    console.log(this.expressServer.getApp())
    return this.expressServer.getApp();
  } catch (error) {
    console.log(error);
    logger.error('Express Server failure', error.message);
  }
};
launchServer();
module.exports = this.expressServer.getApp();