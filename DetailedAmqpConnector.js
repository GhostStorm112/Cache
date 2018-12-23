const AmqpConnector = require('raincache').Connectors.AmqpConnector

class DetailedAmqpConnector extends AmqpConnector {
  constructor (options, statsClient) {
    super(options)
    if (statsClient) {
      this.statsClient = statsClient
      this.on('event', (event) => {
        console.log(event)
        event.receive = Date.now()
        this.recordEvent('incoming', event)
      })
    }
  }

  recordEvent (type, event) {
    this.statsClient.increment(`discordevent-${type}`, 1, 1, [`shard:${event.shard_id}`, `event:${event.t}`], (err) => {
      if (err) {
        console.log(err)
      }
    })
  }

  recordEventTime (time, event) {
    this.statsClient.timing(`discordevent-process-time`, time, 1, [`shard:${event.shard_id}`, `event:${event.t}`], (err) => {
      if (err) {
        console.log(err)
      }
    })
  }

  async send (event) {
    console.log(event)
    if (this.statsClient) {
      this.recordEvent('outgoing', event)
      this.recordEventTime(Date.now() - event.receive, event)
    }
    return super.send(event)
  }
}

module.exports = DetailedAmqpConnector
