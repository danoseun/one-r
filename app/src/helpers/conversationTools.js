export const formatIncomingMessage = message => ({...message.results[0]})

export const constructNewConversation = message => ({customer: {phone: message.from, name: message.contact.name}})

export const constructNewMessage = (message, support = false) => ({
  sender: {name: message.contact.name, authUser: support, lastActivity: message.receivedAt},
  content: message.message.text,
  contentType: message.message.type
})
