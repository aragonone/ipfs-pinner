import { Middleware } from 'koa'
import metricsReporter from '../helpers/metrics-reporter'

export default function httpMetrics(port?: string | number): Middleware {

  // start Prometheus server
  const metricsPort = port ? Number(port) : 9091
  metricsReporter.createServer(metricsPort).then()

  // counter for every http request
  const httpMetricsMiddleware: Middleware = async (ctx, next) => {
    await next()
    metricsReporter.httpRequest({
      method: ctx.method.toLowerCase(),
      path: ctx.path.toLowerCase(),
      status_code: ctx.status
    })
  }
  return httpMetricsMiddleware
}
