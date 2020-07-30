import { sleep, times } from '@aragonone/ipfs-background-service-shared'
import scan from './helpers/scanner'
import metrics from './helpers/metrics-reporter'

const RUN_PERIOD = 10 * times.MINUTES

async function main() {
  const port = process.env.WORKER_METRICS_PORT
  await metrics.createServer(port ? Number(port) : 9081)
  for (let run = 1;; run++) {
    metrics.workerRun()
    console.log(`Starting worker run #${run}`)
    try {
      await scan()
      metrics.workerSuccess()
      console.log(`Worker run #${run} completed successfully`)
    } catch (error) {
      metrics.workerError()
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
