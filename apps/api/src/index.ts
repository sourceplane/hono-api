import { Hono } from 'hono'
import { API_NAME } from './identity'

// `vars.ENVIRONMENT` in wrangler.jsonc: `local` under a bare `wrangler dev`,
// and the environment's name in each `env.<name>` section the deploy targets.
type Bindings = {
  ENVIRONMENT?: string
}

const app = new Hono<{ Bindings: Bindings }>()

const welcomeStrings = [
  "Hello Hono!",
  "To learn more about Hono on Cloudflare Workers, visit https://hono.dev/docs/getting-started/cloudflare-workers",
]

app.get('/', (c) => {
  return c.text(welcomeStrings.join('\n\n'))
})

// The operational contract: what the deploy's smoke and the bootstrap's probe
// read. It names the API and the environment whose config the Worker runs, so
// a 200 here is this API, deployed to that environment — not any page that
// happens to answer.
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    name: API_NAME,
    environment: c.env?.ENVIRONMENT ?? 'unknown',
  })
})

export default app
