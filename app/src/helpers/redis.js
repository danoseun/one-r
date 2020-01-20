import redis from 'redis'

export const redisClient = () => redis.createClient()

export const setToRedis = (key, value, expiry = 86400) => redisClient().set(key, value, 'EX', expiry)
