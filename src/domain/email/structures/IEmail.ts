import { EmailData } from '@sendgrid/helpers/classes/email-address'
export interface IEmail {
  from: EmailData
  to: EmailData[]
  subject: string
  template: {
    text: string
    lang: string
  }
  data: any
  replyTo?: EmailData
  cc?: EmailData[]
  bcc?: EmailData[]
}
