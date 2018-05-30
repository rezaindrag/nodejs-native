var crypto = require('crypto')
var config = require('./config')

var helpers = {}

helpers.hash = function(str) {
    if (typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return hash
    } else {
        return false
    }
}

// Parse a JSON string to an object
helpers.parseJsonToObject = function(str) {
    try {
        var obj = JSON.parse(str)
        return obj
    } catch (e) {
        return {}
    }
}

// Create a random string
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false
    if (strLength) {
        // Possible characters for random
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'
        var str = ''
        for (i = 1; i <= strLength; i++) {
            // Get 1 character random from possibleCharacters
            /*
                Array.charAt = Return the first charcter of string, ex: abcd => a
                Math.floor = Round a number downward, ex: 2.5 => 2
                Math.random = Return a random number between 0 and 1, ex: 0.1150, 0.0748, etc
            */
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
            str += randomCharacter
        }
        return str
    } else {
        return false
    }
}

module.exports = helpers