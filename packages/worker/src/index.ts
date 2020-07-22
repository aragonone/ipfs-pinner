import { sleep, times, ipfs } from '@aragonone/ipfs-background-service-shared'
import scan from './helpers/scanner'
import metricsReporter from './helpers/metrics-reporter'

const RUN_PERIOD = 10 * times.MINUTES

async function main() {
  const port = process.env.WORKER_METRICS_PORT
  await metricsReporter.createServer(port ? Number(port) : 9081)
  for (let run = 1;; run++) {
    metricsReporter.workerRun()
    console.log(`Starting worker run #${run}`)
    try {
      await scan()
      await ipfs.gc()
      metricsReporter.workerSuccess()
      console.log(`Worker run #${run} completed successfully`)
    } catch (error) {
      metricsReporter.workerError()
      console.error(`Worker run #${run} failed with an error:`)
      console.error(error)
    }
    await sleep(RUN_PERIOD)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
