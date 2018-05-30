var _data = require('./data')
var helpers = require('./helpers')

// Handlers
var handlers = {}

/*
    User handler
*/ 
handlers.users = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete']

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback)
    } else {
        callback(405)
    }
}
handlers._users = {}
handlers._users.post = function(data, callback) {
    // Check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false 
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false 

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesnt already exist
        _data.read('users', phone, function(err, data) {
            if (err) {
                // Hash the password
                var hashedPassword = helpers.hash(password)
                // Create the user object
                if (hashedPassword) {
                    var userObject = {
                        firstName,
                        lastName,
                        phone,
                        hashedPassword,
                        tosAgreement
                    }
                    // Store the user object
                    _data.create('users', phone, userObject, function(err) {
                        if (!err) {
                            callback(200)
                        } else {
                            callback(500, { Error: 'Could not create the new user' })
                        }
                    })
                } else {
                    callback(500, { Error: 'Could not hash the user\'s password' })
                }
            } else {
                callback(400, { Error: 'A user with that phone number already exists' })
            }
        })
    } else {
        callback(400, { Error: 'Missing required fields' })
    }
}
handlers._users.get = function(data, callback) {
    // Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false
    if (phone) {
        // get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false
        // verify if the token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                // lookup the user to get
                _data.read('users', phone, function(err, data) {
                    if (!err && data) {
                        // Remove the hashed password
                        delete data.hashedPassword
                        callback(200, data)
                    } else {
                        callback(404)
                    }
                })
            } else {
                callback(403, { Error: 'Missing required token in header or token is invalid' })
            }
        })
    } else {
        callback(400, { Error: 'Missing required field' })
    }
}
handlers._users.put = function(data, callback) {
    // Check required field
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 12 ? data.payload.phone.trim() : false

    // Check optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false 
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

    // If phone is valid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password) {
            // get the token from the headers
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false
            // verify if the token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
                if (tokenIsValid) {
                    // lookup the user to edit
                    _data.read('users', phone, function(err, userData) {
                        if (!err && userData) {
                            // Update the fields necessary
                            if (firstName) {
                                userData.firstName = firstName
                            }
                            if (lastName) {
                                userData.lastName = lastName
                            }
                            if (password) {
                                userData.hashedPassword = helpers.hash(password)
                            }

                            // Store the new update
                            _data.update('users', phone, userData, function(err) {
                                if (!err) {
                                    callback(200)
                                } else {
                                    console.log(err)
                                    callback(500, { Error: 'Could not update the user' })
                                }
                            })
                        } else {
                            callback(400, { Error: 'The specified user does not exist' })
                        }
                    })
                } else {
                    callback(403, { Error: 'Missing required token in header or token is invalid' })
                }
            })
        } else {
            callback(400, { Error: 'Missing fields to update' })
        }
    } else {
        callback(400, { Error: 'Missing required field' })
    }
}
handlers._users.delete = function(data, callback) {
    // Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 12 ? data.queryStringObject.phone.trim() : false
    
    if (phone) {
        // get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false
        // verify if the token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                // lookup the user to delete
                _data.read('users', phone, function(err, data) {
                    if (!err && data) {
                        // Delete file
                        _data.delete('users', phone, function(err) {
                            if (!err) {
                                callback(200)
                            } else {
                                callback(500, { Error: 'Could not delete the specified user' })
                            }
                        });
                    } else {
                        callback(400, { Error: 'Could not find the specified user' })
                    }
                })
            } else {
                callback(403, { Error: 'Missing required token in header or token is invalid' })
            }
        })
    } else {
        callback(400, { Error: 'Missing required field' })
    }
}

/*
    Tokens handler
*/ 
handlers.tokens = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete']

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback)
    } else {
        callback(405)
    }
}
handlers._tokens = {}
handlers._tokens.post = function(data, callback) {
    // Required fields
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
    if (phone && password) {
        // looking for the user who matches that phone number
        _data.read('users', phone, function(err, userData) {
            if (!err && userData) {
                 // hash the password
                var hashedPassword = helpers.hash(password)
                if (hashedPassword == userData.hashedPassword) {
                    // Create a new token with a random name
                    var tokenId = helpers.createRandomString(20)
                    // set expiration date
                    var expires = Date.now() + 1000 * 60 * 60 // an hour
                    // set token object
                    var tokenObject = {
                        phone,
                        id: tokenId,
                        expires
                    }
                    // store the token
                    _data.create('tokens', tokenId, tokenObject, function(err) {
                        if (!err) {
                            callback(200, tokenObject)
                        } else {
                            callback(500, { Error: 'Could not create the new token' })
                        }
                    })
                } else {
                    callback(400, { Error: 'Password did not match the specified user\'s' })
                }
            } else {
                callback(400, { 'Error': 'Could not find the specified user' })
            }
        })
    } else {
        callback(400, { Error: 'Missing required field(s)' })
    }
}
handlers._tokens.get = function(data, callback) {
    // Check that the id is valid
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
    if (id) {
        _data.read('tokens', id, function(err, data) {
            if (!err && data) {
                callback(200, data)
            } else {
                callback(404)
            }
        })
    } else {
        callback(400, { Error: 'Missing required field' })
    }
}
handlers._tokens.put = function(data, callback) {
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false
    if (id && extend) {
        // lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                // check to make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // extend expiration token an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60
                    // store the new update
                    _data.update('tokens', id, tokenData, function(err) {
                        if (!err) {
                            callback(200)
                        } else {
                            callback(500, { Error: 'Could not update the token\'s expiration' })
                        }
                    })
                } else {
                    callback(400, { Error: 'The token has already expired' })
                }
            } else {
                callback(400, { Error: 'Specified token does not exist' })
            }
        })
    } else {
        callback(400, { Error: 'Missing required field(s) or field(s) are invalid' })
    }
}
handlers._tokens.delete = function(data, callback) {
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
    if (id) {
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                // Delete file
                _data.delete('tokens', id, function(err) {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, { Error: 'Could not delete the specified token' })
                    }
                });
            } else {
                callback(400, { Error: 'Could not find the specified token' })
            }
        })
    } else {
        callback(400, { Error: 'Missing required field' })
    }
}
// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback) {
    // find the token by id
    _data.read('tokens', id, function(err, tokenData) {
        if (!err && tokenData) {
            // check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true)
            } else {
                callback(false)
            }
        } else {
            callback(false)
        }
    })
}

/*
    Checks handler
*/ 
handlers.checks = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete']

    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback)
    } else {
        callback(405)
    }
}
handlers._checks = {}
handlers._checks.post = function(data, callback) {
    // protocol
    var protocol = typeof(data.payload.protocol) == 'string' 
                    && ['https', 'http'].indexOf(data.payload.protocol) > -1 
                    ? data.payload.protocol : false 
    // url
    var url = typeof(data.payload.url) == 'string' 
                && data.payload.url.trim().length > 0 
                ? data.payload.url.trim() : false
    // method
    var method = typeof(data.payload.method) == 'string' 
                    && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 
                    ? data.payload.method : false 
    // success codes
    var successCodes = typeof(data.payload.successCodes) == 'object' 
                        && data.payload.successCodes instanceof Array 
                        && data.payload.successCodes.length > 0 
                        ? data.payload.successCodes : false
    // timeout in seconds
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' 
                            && data.payload.timeoutSeconds % 1 === 0 
                            && data.payload.timeoutSeconds >= 1 
                            && data.payload.timeoutSeconds <= 5 
                            ? data.payload.timeoutSeconds : false
    
    
}
handlers._checks.get = function() {
    
}
handlers._checks.put = function() {
    
}
handlers._checks.delete = function() {
    
}

// Ping handler
handlers.ping = function(data, callback) {
    callback(200)
}

// Not found handler
handlers.notFound = function(data, callback) {
    callback(404)
}

module.exports = handlers