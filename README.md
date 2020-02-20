# deltachat-node-webbot-base

A simple library for building web-integrated Delta Chat bots.

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

### Configuration

Configure the bot by writing its email-address and password into `config/local.json`. E.g.:

```bash
echo '{
"email_address": "bot@example.net",
"email_password": "secretandsecure"
}' > config/local.json
```

### Usage

Here's some example code that could give you an idea.

To run it you have to install the 'express' package first: `npm install --save express`

```javascript

var web_content = []

const { deltachat, log, webApp, ensureAuthenticated } = require('deltachat-node-webbot-base')

// Start the deltachat core engine and handle incoming messages.
deltachat.start((chat, message) => {
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

// Run the web-app.
const server = require('http').createServer(webApp)
const port = 3000
server.listen(port, '127.0.0.1', () => {
  log(`Listening on http://127.0.0.1:${port}`)
})
```
