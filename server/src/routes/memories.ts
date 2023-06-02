import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => ({
      ...memory,
      excerpt: memory.content.substring(0, 115).concat('...'),
    }))
  })

  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send
    }

    return memory
  })

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string().uuid(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const data = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        ...data,
        userId: request.user.sub,
      },
    })

    return memory
  })

  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      content: z.string().uuid(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { id } = paramsSchema.parse(request.params)

    const data = bodySchema.parse(request.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        ...data,
        userId: '5b3763a8-a0c2-4279-83fd-b2dfa0747040',
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
