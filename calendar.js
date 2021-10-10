var options = {
    rejectUnauthorized: false,
    hostname          : host,
    port              : port,
    path              : path,
    method            : 'PUT',
    headers           : {
      "Content-type"  : "text/calendar",
      "Content-Length": body.length,
      "User-Agent"    : "calDavClient",
      "Connection"    : "close",
      "Depth"         : "1"
    }
};

var userpass = new Buffer(user + ":" + pass).toString('base64');
options.headers["Authorization"] = "Basic " + userpass;

const event = {
    start: [2018, 5, 30, 6, 30],
    duration: { hours: 6, minutes: 30 },
    title: 'Bolder Boulder',
    description: 'Annual 10-kilometer run in Boulder, Colorado',
    location: 'Folsom Field, University of Colorado (finish line)',
    url: 'http://www.bolderboulder.com/',
    geo: { lat: 40.0095, lon: 105.2669 },
    categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
    organizer: { name: 'Admin', email: 'Race@BolderBOULDER.com' },
}

var responseString = ""
var req = https.request(options, res => {
    res.on('data', function (chunk) {
        responseString += chunk;
    });

    req.on('close', function () {
        console.log(req)
    });
});

req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});


req.write(body);
req.end()

function addEvent(){

}

function deleteEvent(){

}

function eventsInRange(start, end){

}

function deleteEventByUID(eventUID){

}
