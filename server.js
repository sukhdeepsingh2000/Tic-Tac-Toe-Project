var fs = require('fs');


//Method top handle the request for server

function onRequestMethod(request, response) {
    if (request.url != '/') {
        fs.readFile('./front/' + request.url, function(err, data) {
            //Handling the error condition
            if (err) {
                response.writeHead(404);
                response.end();
            } else {
                response.end(data);
            }
        });
    } else {
        fs.readFile('front/index.html', function(err, data) {
            if (err) {
                response.writeHead(404);
                response.end();
            } else {
                response.writeHead({ 'Content-Type': 'text/html' });
                response.write(data);
                response.end();
            }

        });
    }
}

//Exporting the modul
exports.onRequest = onRequestMethod;