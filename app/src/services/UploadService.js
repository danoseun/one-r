import AWS from 'aws-sdk'
import axios from 'axios'
import fileType from 'file-type'

require('dotenv').config()

class UploadService {
  constructor() {
    this.uploader = new AWS.S3({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET})
    this.baseUploadParams = {Bucket: process.env.AWS_BUCKET_NAME}
    this.authorizationType = (process.env.NODE_ENV === 'production' && process.env.SERVER_HOST !== process.env.STAGING_URL) ? 'App' : 'Basic'
  }

  upload({Key, Body, ContentType}) {
    return new Promise((resolve, reject) => {
      this.uploader.upload({...this.baseUploadParams, Key, Body, ContentType}, (err, data) => {
        if (err)
          reject(err)
        else
          resolve(data)
      })
    })
  }

  fetchRawImage(url) {
    return axios.get(url, {headers: {authorization: `${this.authorizationType} ${process.env.INFOBIP_API_KEY}`}, responseType: 'arraybuffer'})
  }

  fetchAndUpload(payload) {
    return this.fetchRawImage(payload.url).then(async response => {
      const metadata = (await fileType.fromBuffer(response.data))

      return this.upload({Key: `${payload.filename}.${metadata.ext}`, Body: response.data, ContentType: metadata.mime})
    })
  }
}

export default UploadService
