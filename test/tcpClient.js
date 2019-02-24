const fileHelper = require('../src/helper/fileHelper');
const COMMIST = require('../src/_comminst/COMMIST');
const client = fileHelper.initClient();
client.send({
    m: COMMIST.READY_TO_RECIEVE_FILE
});