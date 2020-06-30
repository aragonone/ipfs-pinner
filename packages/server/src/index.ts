import Koa from 'koa'
import logger from 'koa-logger'
import helmet from 'koa-helmet'
import bodyParser from 'koa-bodyparser'
import dotenv from 'dotenv'

import { cors, errorHandler, httpMetrics, routes } from './middlewares'

// Load env variables
dotenv.config()

// Load middlewares
const app = new Koa()
app.use(httpMetrics(process.env.SERVER_METRICS_PORT))
app.use(errorHandler)
app.use(logger())
app.use(helmet())
app.use(cors)
app.use(bodyParser())
app.use(routes)

// Start main server
const serverPort = process.env.SERVER_PORT || 8000
app.listen(serverPort)
console.log(`Server started on port ${serverPort}`)
