import { Prometheus } from '@promster/metrics'

interface CounterMetrics {
  [type: string]: {
    name: string
    help: string
    labelNames: string[]
  }[]
}

const COUNTER_METRICS: CounterMetrics = {
  http: [
    {
      name: 'requests_total', 
      help: 'Total http requests by method, path, status_code',
      labelNames: ['method', 'path', 'status_code']
    },
  ]
}

class MetricsReporter {

  counters: {
    [type: string]: {
      [name: string]: Prometheus.Counter<string>
    }
  }

  constructor(metrics: CounterMetrics) {
    this.counters = {}
    this._initializeCounterMetrics(metrics)
  }

  httpRequest(labels: { [name: string]: string | number }) {
    this.counters.http.requests_total.inc({
      ... labels
    })
  }

  private _initializeCounterMetrics(metrics: CounterMetrics) {
    this.counters = {}
    const { Counter } = Prometheus
    Object.keys(metrics).forEach((type: string) => {
      this.counters[type] = {}
      metrics[type].forEach(({ name, help, labelNames }) => {
        this.counters[type][name] = new Counter({ name: `${type}_${name}`, help, labelNames })
      })
    })
  }
}

export default new MetricsReporter(COUNTER_METRICS)
