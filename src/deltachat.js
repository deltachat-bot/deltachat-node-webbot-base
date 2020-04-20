/**
 * This is a thin layer that uses the deltachat-node bindings, and sets up
 * listeners to react on events we need to handle in our application.
 */
const { deltachat, log } = require('deltachat-node-bot-base')

// We avoid require'ing deltachat-node by defining this one constant ourselves.
const DC_CONTACT_ID_SELF = 1

/**
 * Return the IDs of all other (than the bot) contacts in the chat.
 */
deltachat.getOtherContactsInChat = (chatId) => {
  const contacts = deltachat.getChatContacts(chatId)
  return contacts.filter(contact_id => contact_id !== DC_CONTACT_ID_SELF)
}

/**
 * Leave and delete group-chat and tell user to do the same once the group-join has happened.
 * We don't need the group anymore, because through the connection setup we
 * have a verified connection to the user now. The group is actually just a
 * vehicle.
 */
const sayByeAndLeave = (chatId, messageId) => {
  const message = deltachat.getMessage(messageId)
  if (! message.isInfo()) {
    // We only care for informational messages here.
    return true
  }
  const messageText = message.getText()
  const match = messageText.match(/\(?(\S+@\S+?)\)? added by me\.$/)
  if (! match || ! match[1]) {
    return true
  }

  const contact_address = match[1]
  log(`Group ${chatId} was successfully created and joined by ${contact_address}`)
  log(`Sending you-may-leave-message to chat ${chatId}`)
  deltachat.sendMessage(chatId, "Hello! :)\n\nThis chat is only a vehicle to connect you with me (the login bot). You may leave and remove this chat now.\n\nGood bye!")
  // Delay leaving and deleting chat because the browser<->web_app process
  // might be slower than this (the browser checks every 5s) and still need this chat.
  setTimeout(() => {
    log(`Delayed: Leaving chat ${chatId}`)
    deltachat.removeContactFromChat(chatId, DC_CONTACT_ID_SELF)
    log(`Delayed: Deleting chat ${chatId}`)
    deltachat.deleteChat(chatId)
  }, 6000)
}

deltachat.on('DC_EVENT_MSG_DELIVERED', sayByeAndLeave)

module.exports = deltachat
