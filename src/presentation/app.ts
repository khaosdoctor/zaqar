import 'reflect-metadata'
import routes from './routes'
import expresso from '@expresso/app'
import { container } from 'tsyringe'
import errors from '@expresso/errors'
import sendgrid from '../lib/sendgrid'
import { Services } from '../services'
import { IAppConfig } from '../app-config'
import loader from '../utils/loadRenderers'
import { IExpressoAppFactory } from '@expresso/server'
import { Express, Request, Response, NextFunction } from 'express'
import basicAuth from 'express-basic-auth'

export type RendererFn = (text: string, data: any) => Promise<string>
export type RendererExport = { name: string, fn: RendererFn }
export type Renderers = {
  [rendererName: string]: RendererFn
}

export const app: IExpressoAppFactory<IAppConfig> = expresso(async (app: Express, config: IAppConfig, environment: string) => {
  if (!config.sendgrid.apiKey) throw new Error('Sendgrid key not set!')

  container.register('SenderConfig', { useValue: { fromAddress: config.defaultFromAddress, fromName: config.defaultFromName } })
  container.register('SendgridService', { useValue: sendgrid.factory(config.sendgrid.apiKey) })
  container.register('Renderers', { useValue: loader.loadRenderers(config.rendererList) })
  // Resolve services with container
  const services = container.resolve(Services)

  if (config.auth.user && config.auth.pass) {

    console.log('Using Basic Authentication')
    app.use(basicAuth({
      challenge: true,
      realm: 'zaqar',
      users: { [config.auth.user]: config.auth.pass }
    }))
  }

  app.post('/send', routes.email.send(services.emailService))

  app.use((err: any, _req: Request, _res: Response, next: NextFunction) => {
    if (err.response && err.response.body) {
      console.log(JSON.stringify(err.response.body, null, 4))
    }

    next(err)
  })

  app.use(errors(environment))
})
