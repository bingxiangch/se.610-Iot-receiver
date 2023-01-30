var fs = require('fs')
const mq = require('./mockQueries')
const test_data_file = "tests/test_data.json"

function connect(connectionUrl, options) {
    // console.log("Url: ", connectionUrl)
    // console.log("Options: ", options)

    return new client();
}

class client {
    on(event, handler) {
        //console.log("Event: ", event, "Handler: ", handler)

        if (event == 'connect') {
            handler();
        }
        else if (event == 'message') {
            try {
                // Reading file.
                const jsonFile = fs.readFileSync(test_data_file);
                handler("Test_topic", jsonFile);
            }
            catch(err) {
                console.log(err);
            }
        }
        else if (event == 'error') {
            try {
                // Creating the file if it does not exist.
                const error_path = "tests/error.log";
                mq.createFileIfNotExists(error_path);
                fs.writeFileSync(error_path, '{"level":"error","message":"Test error"}\n');

                handler("Test error");
            }
            catch (err) {
                console.log(err)
            }
        }
    };

    subscribe([process]) {
        console.log("Subscribe: ", process)
    }
}

module.exports = {
    connect,
    client
}