import env from 'sugar-env'
import { IServerConfig } from '@expresso/server'
import { IExpressoConfigOptions } from '@expresso/app'

// Your configuration keys goes here
export interface IAppConfig extends IExpressoConfigOptions {
  defaultFromAddress: string,
  sendgrid: {
    apiKey: string
  }
  server?: IServerConfig['server']
}

// And your values here
export const config: IAppConfig = {
  name: 'zaqar',
  defaultFromAddress: env.get('DEFAULT_FROM_ADDRESS', 'some@email.com'),
  server: {
    printOnListening: true
  },
  sendgrid: {
    apiKey: env.get('SENDGRID_APIKEY', '')
  }
}
