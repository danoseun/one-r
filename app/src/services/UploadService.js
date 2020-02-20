/* eslint-disable babel/new-cap */
import AWS from 'aws-sdk'

require('dotenv').config()

class UploadService {
  uploader = AWS.S3({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET})

  baseUploadParams = {Bucket: process.env.AWS_BUCKET_NAME}

  upload({Key, Body}) {
    return new Promise((resolve, reject) => {
      this.uploader.upload({...this.baseUploadParams, Key, Body}, (err, data) => {
        if (err)
          reject(err)
        else
          resolve(data)
      })
    })
  }
}

export default UploadService
