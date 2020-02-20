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
deltachat.on('DC_EVENT_SECUREJOIN_MEMBER_ADDED', (chatId, contactId) => {
  log(`Group ${chatId} was successfully created and joined by contact ${contactId}`)
  log(`Sending you-may-leave-message to chat ${chatId}`)
  deltachat.sendMessage(chatId, "You may leave and remove this chat now.")
  log(`Leaving chat ${chatId}`)
  deltachat.removeContactFromChat(chatId, DC_CONTACT_ID_SELF)
  log(`Deleting chat ${chatId}`)
  deltachat.deleteChat(chatId)
})

module.exports = deltachat
