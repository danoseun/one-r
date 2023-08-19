export const formatIncomingMessage = message => ({...message.results[0]})

export const constructNewConversation = message => ({customer: {phone: message.from, name: message.contact.name}})

export const constructNewMessage = (message, support = false) => ({
  sender: {name: message.contact.name, authUser: support, lastActivity: message.receivedAt},
  content: message.message.text || message.message.caption,
  contentType: message.message.type,
  imageUrl: message.message.type === 'IMAGE' ? message.message.url : null,
  videoUrl: message.message.type === 'VIDEO' ? message.message.url : null,
  documentUrl: message.message.type === 'DOCUMENT' ? message.message.url : null
})

export const constructTemplatePayload = ({phoneNumber, locale, name, values}) => ({
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
    templateData: values,
    language: locale
  }
})

export const mediaObject = ({imageUrl, videoUrl, documentUrl}) => {
  if (imageUrl)
    return {imageUrl}
  else if (videoUrl)
    return {videoUrl}
  else if (documentUrl)
    return {fileUrl: documentUrl}

  return {}
}

export const constructFreeFormPayload = ({phoneNumber, content, imageUrl, videoUrl, documentUrl}) => ({
  ...constructTemplatePayload({phoneNumber}),
  whatsApp: {...mediaObject({imageUrl, videoUrl, documentUrl}), text: content}
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
