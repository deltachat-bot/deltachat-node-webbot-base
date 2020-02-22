# deltachat-node-webbot-base

A simple library for building web-integrated Delta Chat bots.

This is a thin layer on top of [deltachat-node-bot-base](https://github.com/deltachat-bot/deltachat-node-bot-base), that helps to write web-interacting bots that might require authentication using Delta Chat.

It provides a basic web-app using the "express"-framework, that you can hook your own code into.
This way you have a bridge between Delta Chat and the web, which means that you e.g. could make content from a chat publicly visible on the web, or you could send data posted to the web-app into a Delta Chat chat.

Optionally, if you use the `ensureAuthenticated` middleware (see below for an example), the basic web-app will respond to a web request with a page that shows a QR-code.
Users must scan this QR-code using their Delta Chat app in order to authenticate with their email address used in the app.
Only if this succeeds they get to see the protected content in their browser. 

(Technical background: The authentication works through Delta Chat without further manual interaction, as the the user's app follows the invitation into a verified group created by the bot, and through this proceedure proves that the used email address is actually under their control.)

For further information on DeltaChat bots see <https://bots.delta.chat/>.

### Prerequisites

To build a bot with this library you need to have NodeJS >= 7.6 and NPM installed. Get those from your system's package manager. E.g. on Debian/Ubuntu-based systems: `apt install npm`.

To run, the bot needs an email-account that it can reach via IMAP and SMTP.

Public access to the webinterface should be reverse-proxied with an HTTP daemon (e.g. nginx).


### Installation

Install via npm from the repository:

```bash
npm install --save git://github.com/deltachat-bot/deltachat-node-webbot-base
```

### Usage

Here's some example code that could give you an idea.
It renders all received text messages on a website that is accessible for everyone who authenticated using their Delta Chat app.

To run it, first install the dependencies using NPM in a fresh directory:
```bash
npm install git://github.com/deltachat-bot/deltachat-node-webbot-base
npm install express
```

Then configure the bot by writing its email-address and password into `config/local.json` like this:

```json
{
  "email_address": "bot@example.net",
  "email_password": "secretandsecure"
}
```


Now put the following code into a file (e.g. called `web-bot.js`) and run it with `node web-bot.js`.

```javascript

var web_content = []

const { deltachat, log, webApp, ensureAuthenticated } = require('deltachat-node-webbot-base')

// Start the deltachat core engine and handle incoming messages.
// This might take some seconds, thus we save the returned promise and wait for
// it below.
const dc_started = deltachat.start((chat, message) => {
  // Save text messages to be viewable on the web.
  let messageText = message.getText()
  if (messageText != '') {
    web_content.push(messageText)
  }
})


// Build a custom web-app that shows the saved messages to anyone who authenticated with Delta Chat.
const express = require('express')
const router = express.Router()                                                                                                                                                                

router.get('/', ensureAuthenticated, (request, response) => {
  let html = '<html><body><h1>Content from the Delta Chat world</h1><ul>'
  web_content.forEach((text) => {
    html += `<li>${text}</li>`
  })
  html += '</ul></body></html>'
  response.send(html)
})

// Hook our web-app into the base web-app. We could specify a sub-path here.
webApp.use('/', router)

// Setup the web-app.
const server = require('http').createServer(webApp)
const port = 3000

// When the deltachat setup is done, run the web-app.
// If we would start the web-app earlier, deltachat e.g. might not be ready yet to generate QR-codes.
dc_started.then(() => {
  server.listen(port, '127.0.0.1', () => {
    log(`Listening on http://127.0.0.1:${port}`)
  })
}).catch(console.error)
```
