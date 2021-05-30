import env from 'sugar-env'
import { IServerConfig } from '@expresso/server'
import { IExpressoConfigOptions } from '@expresso/app'

// Your configuration keys goes here
export interface IAppConfig extends IExpressoConfigOptions {
  defaultFromAddress: string,
  defaultFromName: string,
  rendererList: string,
  sendgrid: {
    apiKey: string
  },
  auth: {
    user: string
    pass: string
  }
  server?: IServerConfig['server']
}

// And your values here
export const config: IAppConfig = {
  name: 'zaqar',
  defaultFromAddress: env.get('DEFAULT_FROM_ADDRESS', 'some@email.com'),
  defaultFromName: env.get('DEFAULT_FROM_NAME', 'Some Name'),
  rendererList: env.get('RENDERER_LIST', 'zaqar-renderer-ejs zaqar-renderer-mustache'),
  server: {
    printOnListening: true
  },
  sendgrid: {
    apiKey: env.get('SENDGRID_APIKEY', '')
  },
  auth: {
    user: env.get('AUTH_USERNAME', ''),
    pass: env.get('AUTH_PASSWORD', '')
  }
}
