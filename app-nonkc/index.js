'use strict'

const express = require('express')
const Keycloak = require('keycloak-connect')
const join = require('path').join

// You can get this from the "Installation" tab of your Realm (app) in Keycloak
const keycloakConf = {
  "realm": "WebApp",
  "auth-server-url": "http://10.5.5.3:8080/auth/",
  "ssl-required": "external",
  "resource": "resource",
  "verify-token-audience": true,
  "credentials": {
    "secret": "c7222187-ffa5-4c14-8edd-7fe82126a943"
  },
  "use-resource-role-mappings": true,
  "confidential-port": 0,
  "policy-enforcer": {}
}

const kc = new Keycloak({
  // Session store etc. from keycloak samples is not necessary...
}, keycloakConf)

// Our express web application
const app = express()

// Requests that aren't matched by express.static will pass through this
// This function will perfrom some keycloak setup on the request object
app.use(kc.middleware({
  logout: '/logout',
  admin: '/'
}))

app.use((req, res, next) => {
  console.log(`[${req.originalUrl}] authorisation header ${req.headers.authorization}`)
  next()
})

// This endpoint can be accessed without a bearer token
app.get('/ping-unprotected', (req, res, next) => {
  res.end('pong-unprotected')
})

app.get('/ping-protected', kc.protect(), (req, res, next) => {
  res.end('pong-protected')
})

// Serves static assets from www directory if matches are found
app.use(express.static(join(__dirname, 'www')))

app.listen(3030, "0.0.0.0", (err) => {
  if (err) {
    console.log('failed to start server')
    throw err
  }

  console.log('test application started on http://10.5.5.2:3030')
})
