import { metrics } from '@aragonone/ipfs-pinner-shared'

const COUNTER_METRICS: metrics.CounterMetrics = {
  http: [
    {
      name: 'requests_total', 
      help: 'Total http requests by method, path, status_code',
      labelNames: ['method', 'path', 'status_code']
    },
  ]
}

class MetricsReporter extends metrics.Reporter {
  httpRequest(labels: { [name: string]: string | number }) {
    this.counters.http.requests_total.inc({
      ... labels
    })
  }
}

export default new MetricsReporter(COUNTER_METRICS)
