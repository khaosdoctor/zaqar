import 'reflect-metadata'
import routes from './routes'
import sendgrid from '../lib/sendgrid'
import { Express, Request, Response, NextFunction } from 'express'
import expresso from '@expresso/app'
import { container } from 'tsyringe'
import errors from '@expresso/errors'
import { Services } from '../services'
import { IAppConfig } from '../app-config'
import { IExpressoAppFactory } from '@expresso/server'

export const app: IExpressoAppFactory<IAppConfig> = expresso(async (app: Express, config: IAppConfig, environment: string) => {
  container.register('DefaultFromAddress', { useValue: config.defaultFromAddress })
  container.register('SendgridService', { useValue: sendgrid.factory(config.sendgrid.apiKey) })
  // Resolve services with container
  const services = container.resolve(Services)

  app.post('/send', routes.email.send.factory(services.emailService))

  app.use((err: any, _req: Request, _res: Response, next: NextFunction) => {
    if (err.response && err.response.body) {
      console.log(JSON.stringify(err.response.body, null, 4))
    }

    next(err)
  })

  app.use(errors(environment))
})
