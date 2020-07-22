import { metrics } from '@aragonone/ipfs-background-service-shared'

const COUNTER_METRICS: metrics.CounterMetrics = {
  worker: [
    { name: 'runs', help: 'Total worker runs' },
    { name: 'success', help: 'Total successful worker runs' },
    { name: 'errors', help: 'Total worker run errors' },
  ]
}

class MetricsReporter extends metrics.Reporter {
  workerRun() {
    this.counters.worker.runs.inc()
  }
  workerSuccess() {
    this.counters.worker.success.inc()
  }
  workerError() {
    this.counters.worker.errors.inc()
  }
}

export default new MetricsReporter(COUNTER_METRICS)
