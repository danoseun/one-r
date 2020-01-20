import redis from 'redis'

require('dotenv').config()

export const redisClient = () => redis.createClient(process.env.REDIS_URL)

export const setToRedis = (key, value, expiry = 86400) => redisClient().set(key, value, 'EX', expiry)

export const getFromRedis = key => redisClient().get(key, redis.print)
