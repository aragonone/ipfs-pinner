import { Prometheus } from '@promster/metrics'
import { createServer } from '@promster/server'

export interface CounterMetrics {
  [type: string]: {
    name: string
    help: string
    labelNames?: string[]
  }[]
}

export class Reporter {

  counters: {
    [type: string]: {
      [name: string]: Prometheus.Counter<string>
    }
  }

  constructor(metrics: CounterMetrics) {
    this.counters = {}
    this._initializeCounterMetrics(metrics)
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

  async createServer(port: number): Promise<void> {
    await createServer({port})
    console.log(`Prometheus metrics server started on port ${port}`)
  }
}
