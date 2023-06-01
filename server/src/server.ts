import cors from '@fastify/cors'
import fastify from 'fastify'
import { memoriesRoutes } from './routes/memories'

const app = fastify()

app.register(cors, {
  origin: ['http://localhost:3333'],
})

app.register(memoriesRoutes)

app
  .listen({ port: 3333 })
  .then(() => console.log('🚀 HTTP Server running on http://localhost:3333'))
