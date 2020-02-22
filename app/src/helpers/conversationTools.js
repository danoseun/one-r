export const formatIncomingMessage = message => ({...message.results[0]})

export const constructNewConversation = message => ({customer: {phone: message.from, name: message.contact.name}})

export const constructNewMessage = (message, support = false) => ({
  sender: {name: message.contact.name, authUser: support, lastActivity: message.receivedAt},
  content: message.message.text || message.message.caption,
  contentType: message.message.type,
  imageUrl: message.message.type === 'IMAGE' ? message.message.url : null,
  videoUrl: message.message.type === 'VIDEO' ? message.message.url : null
})

export const constructTemplatePayload = ({phoneNumber, locale, name, namespace, values}) => ({
  scenarioKey: process.env.INFOBIP_SCENARIO_KEY,
  destinations: [
    {
      to: {
        phoneNumber: phoneNumber
      }
    }
  ],
  whatsApp: {
    templateName: name,
    templateNamespace: namespace,
    templateData: values,
    language: locale
  }
})

export const mediaObject = ({imageUrl, videoUrl}) => {
  if (imageUrl)
    return {imageUrl}
  else if (videoUrl)
    return {videoUrl}

  return {}
}

export const constructFreeFormPayload = ({phoneNumber, content, imageUrl, videoUrl}) => ({
  ...constructTemplatePayload({phoneNumber}),
  whatsApp: {...mediaObject({imageUrl, videoUrl}), text: content}
})

export const addMediaUrls = (message, upload) => {
  switch (message.contentType) {
    case 'DOCUMENT':
      return {documentUrl: upload.Location}
    case 'IMAGE':
      return {imageUrl: upload.Location}
    case 'VIDEO':
      return {videoUrl: upload.Location}
    default:
      return {}
  }
}
