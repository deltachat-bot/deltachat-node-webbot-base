/**
 * This is the basic application that sets up the framework and the
 * pre-requisites to authenticate users.
 * The actual activity happens in the plugin apps as listed in the config.
 */
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const qrcode_generator = require('qrcode')
const path = require('path')
const uuid = require('uuid/v4')
const { log } = require('deltachat-node-bot-base')
const deltachat = require('./deltachat')

/**
 * Set up the app.
 */
const webApp = express()

/**
 * Set up the session middleware.
 */
webApp.use(session({
  secret: uuid(), // Use a new secret on every startup of the app.
  saveUninitialized: true, // Also save the session object if it hasn't any values yet.
  resave: false,
  name: 'delta-chat-web-session',
  path: '/',
  cookie: {
    httpOnly: false, // Allow to use the cookie for JavaScript-requests, too.
    sameSite: true,
  }
}))

/**
 * Tell the app to parse the request body.
 */
webApp.use(bodyParser.json());
webApp.use(bodyParser.urlencoded({ extended: false }));

/**
 * Log all requests.
 */
webApp.use((req, res, next) => {
  log(`Request to ${req.path}`)
  next()
})

/**
 * Send the QR-code to the browser.
 */
webApp.get('/requestQR', (req, res) => {
  const group_name = `LoginBot group (${uuid().slice(0, 4)})`
  log("new group name:", group_name)
  const group_id = deltachat.createUnverifiedGroupChat(group_name)
  log("new group_id:", group_id)
  const qr_data = deltachat.getSecurejoinQrCode(group_id)
  qrcode_generator.toDataURL(qr_data)
    .then(qr_code_data_url => {
      req.session.groupId = group_id
      res.json({ qr_code_data_url, qr_data })
    })
})

/**
 * Let the browser know if the user is known already (aka group-join has happend).
 */
webApp.get('/checkStatus', (req, res) => {
  if (!req.session.groupId) {
    return res.sendStatus(401)
  }
  log("Looking for new contact in group", req.session.groupId)
  let otherContacts = deltachat.getOtherContactsInChat(req.session.groupId)
  log("otherContacts in group:", otherContacts)
  switch (otherContacts.length) {
    case 0:
      res.send('Not yet...')
      break;
    case 1:
      log("Storing contact ID in session")
      req.session.contactId = otherContacts[0]
      res.send("OK")
      break;
    default:
      console.error("More than one other contact in login-bot-group! This should not happen! Found contacts: ", otherContacts)
  }
})

/**
 * Serve a few static files.
 */
webApp.get('/styles.css', (_req, res) => { res.sendFile(path.join(__dirname, '../web/styles.css')) })
webApp.get('/favicon.ico', (_req, res) => { res.sendFile(path.join(__dirname, '../web/favicon.ico')) })
webApp.get('/delta-chat-logo.svg', (_req, res) => { res.sendFile(path.join(__dirname, '../web/delta-chat-logo.svg')) })

module.exports = webApp
