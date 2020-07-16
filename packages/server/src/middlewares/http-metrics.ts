import { Middleware } from 'koa'
import { createServer } from '@promster/server'
import metricsReporter from '../helpers/metrics-reporter'

export default function httpMetrics(port?: string | number): Middleware {

  // start Prometheus server
  const metricsPort = port ? Number(port) : 9091
  createServer({ port: metricsPort }).then(() =>
    console.log(`Prometheus metrics server started on port ${metricsPort}`)
  )

  // counter for every http request
  const httpMetricsMiddleware: Middleware = async (ctx, next) => {
    metricsReporter.httpRequest({
      method: ctx.method.toLowerCase(),
      path: ctx.path.toLowerCase(),
      status_code: ctx.status
    })
    await next()
  }
  return httpMetricsMiddleware
}
