const OpenFaas = require('OpenFaas')
const env = require('./env')

// Configure an OpenFaas client

// Setup OpenFaas client
const openfaasAuth = {}
if (env('OPENFAAS_USER')) {
  openfaasAuth.user = env('OPENFAAS_USER')
}

if (env('OPENFAAS_PASS')) {
  openfaasAuth.pass = env('OPENFAAS_PASS')
}

const openfaasOptions = {}
if (openfaasAuth.user || openfaasAuth.pass) {
  openfaasOptions.auth = openfaasAuth
}

module.exports = new OpenFaas(env('OPENFAAS_URL'), openfaasOptions)
