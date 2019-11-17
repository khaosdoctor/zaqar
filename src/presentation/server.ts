import server from '@expresso/server'

import { app } from './app'
import { config } from '../app-config'

export function start () {
  server.start(app, config)
    .catch(console.error.bind(console))
}
