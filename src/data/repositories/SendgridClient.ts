import { MailService } from '@sendgrid/mail'
import { injectable, inject } from 'tsyringe'
import { Email } from '../../domain/email/entity'

@injectable()
export class SendgridClient {
  private readonly defaultFromAddress: string
  private readonly mailClient: typeof MailService

  constructor (@inject('DefaultFromAddress') defaultFromAddress: string, @inject('SendgridService') mailService: typeof MailService) {
    this.defaultFromAddress = defaultFromAddress
    this.mailClient = mailService
  }

  async send (email: Email): Promise<Email> {
    await this.mailClient.send({ ...email.message, from: { email: email.from || this.defaultFromAddress }, cc: email.cc, bcc: email.bcc }, true)
    return email
  }
}
