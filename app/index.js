// Import http from node
var http = require('http')
var https = require('https')
var url = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var config = require('./lib/config')
var fs = require('fs') // file system
var handlers = require('./lib/handlers')
var helpers = require('./lib/helpers')

// Instantiate the HTTP server
var httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res)
})
httpServer.listen(config.httpPort, function() {
    console.log("The server is listening on port "+config.httpPort)
})

// Instantiate the HTTPS server
var httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
}
var httpsServer = https.createServer(function (req, res) {
    unifiedServer(req, res)
})
httpsServer.listen(config.httpsPort, function() {
    console.log("The server is listening on port "+config.httpsPort)
})

// All the server logic for both the http and https server
var unifiedServer = function(req, res) {
    // Get url and parse it
    var parsedUrl = url.parse(req.url, true)
    // Get path
    var path = parsedUrl.pathname
    var trimmedPath = path.replace(/^\/+|\/+$/g, '')
    // Get query string
    var queryStringObject = parsedUrl.query
    // Get method
    var method = req.method.toLowerCase()
    // Get headers
    var headers = req.headers

    // Get the payload, if any
    // new StringDecoder [?]
    var decoder = new StringDecoder('utf-8')
    var buffer = ''
    // req.on [?]
    req.on('data', function(data) {
        buffer += decoder.write(data)
    })
    req.on('end', function() {
        buffer += decoder.end()
        // Construct the data object to send to handler
        var data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
        }
        // console.log(data)
        // Chosen handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound
        // Route the request
        chosenHandler(data, function(statusCode, payload) {
            // status code
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200
            // payload
            payload = typeof(payload) == 'object' ? payload : {}
            // convert payload to a string
            var payloadString = JSON.stringify(payload)
            // return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)

            console.log('returning the response:', statusCode, payloadString)
        })
    })
}

// request router
var router = {
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks
}
