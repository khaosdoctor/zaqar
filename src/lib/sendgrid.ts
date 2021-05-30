import sg, { MailService } from '@sendgrid/mail'

export function factory (apiKey: string): MailService {
  sg.setApiKey(apiKey)
  return sg
}

export default { factory }
