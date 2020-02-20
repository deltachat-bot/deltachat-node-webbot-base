const { log } = require('deltachat-node-bot-base')
const path = require('path')

/**
 * Middleware that responds with the login page (which will show the QR code)
 * if the user isn't known yet. If the user is known (aka the group-join has
 * happened), the next middleware in the stack is called ("next()").
 */
const ensureAuthenticated = (req, res, next) => {
  log(`Request to ${req.path}`)
  log("session contactId: ", req.session.contactId)
  if (!req.session.contactId) {
    log("Unauthenticated request, sending login page")
    res.sendFile(path.join(__dirname, '../web/login.html'))
  } else {
    log("Authenticated request, calling next()")
    next()
  }
}

module.exports = ensureAuthenticated
