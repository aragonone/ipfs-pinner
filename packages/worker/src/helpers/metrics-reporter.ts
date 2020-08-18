import { metrics } from '@aragonone/ipfs-pinner-shared'

const COUNTER_METRICS: metrics.CounterMetrics = {
  worker: [
    { name: 'runs', help: 'Total worker runs' },
    { name: 'success', help: 'Total successful worker runs' },
    { name: 'errors', help: 'Total worker run errors' },
  ],
  file: [
    { name: 'scans', help: 'Total files scanned' },
    { name: 'verified', help: 'Total verified files' },
    { name: 'expired', help: 'Total expired files' },
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
  fileScanned() {
    this.counters.file.scans.inc()
  }
  fileVerified() {
    this.counters.file.verified.inc()
  }
  fileExpired() {
    this.counters.file.expired.inc()
  }
}

export default new MetricsReporter(COUNTER_METRICS)
