import redis from 'redis'

require('dotenv').config()

export const redisClient = () => redis.createClient(process.env.REDIS_URL)

export const setToRedis = (key, value, expiry = 86400) => redisClient().set(key, value, 'EX', expiry)

export const getFromRedis = key => new Promise((resolve, reject) => {
  if (key) {
    redisClient().get(key, (err, reply) => {
      if (err)
        reject(err)
      else
        resolve(reply)
    })
  } else {
    reject('Key is missing')
  }
})

export const removeFromRedis = key => redisClient().del(key)
