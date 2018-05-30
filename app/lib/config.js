process.env.NODE_ENV = 'staging'

// Container for all environments
var environments = {}

// Staging environments
environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    hashingSecret: 'thisIsASecret',
    maxChecks: 5
}

// Production environments
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    hashingSecret: 'thisIsAlsoASecret',
    maxChecks: 5
}

// Determine which env will be ran in the command-line
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? 
                            process.env.NODE_ENV.toLocaleLowerCase() : ''

// Check is env included in the list of environments
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? 
                            environments[currentEnvironment] : environments.staging

// Export the module
module.exports = environmentToExport