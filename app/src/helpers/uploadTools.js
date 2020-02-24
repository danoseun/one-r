export const base64ToArrayBuffer = base64 => {
  const base64Data = base64.split(',')[1]
  const binaryString = Buffer.from(base64Data, 'base64').toString('binary')
  const length = binaryString.length
  const bytes = new Uint8Array(length)

  for (var i = 0; i < length; i++)
    bytes[i] = binaryString.charCodeAt(i)

  return bytes.buffer
}
