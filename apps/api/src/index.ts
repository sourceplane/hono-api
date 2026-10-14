import { Hono } from 'hono'

const app = new Hono()

const welcomeStrings = [
  "Hello Hono!",
  "To learn more about Hono on Cloudflare Workers, visit https://hono.dev/docs/getting-started/cloudflare-workers",
]

app.get('/', (c) => {
  return c.text(welcomeStrings.join('\n\n'))
})

export default app
