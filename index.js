require('bluebird')
require('dotenv').config()

const Core = require('Core')
const RainCache = require('raincache')

const log = new Core.Logger()

const amqp = new RainCache.Connectors.AmqpConnector({
  amqpUrl: process.env.AMQP_URL || 'amqp://localhost',
  amqpQueue: 'weather-pre-cache',
  sendQueue: 'weather-events'
})
const redis = new RainCache.Engines.RedisStorageEngine({ host: process.env.REDIS_URL, password: process.env.REDIS_PASS })

const cache = new RainCache({ storage: { default: redis }, debug: false }, amqp, amqp)

async function run () {
  log.info('STARTUP', 'Starting Cache')
  await cache.initialize()
  cache.on('error', error => log.error('GWError', error))
  log.info('STARTUP', 'Cache worker running')
}

run().catch(error => log.error('STARTUP\n', error))
