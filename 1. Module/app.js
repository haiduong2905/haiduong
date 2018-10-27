const http = require('http');
const config = require('./module/config.js');
const helper = require('./module/helper.js');

http.createServer(helper.onRequest).listen(config.port);