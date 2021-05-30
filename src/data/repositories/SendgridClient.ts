import { MailService } from '@sendgrid/mail'
import { injectable, inject } from 'tsyringe'
import { Email } from '../../domain/email/entity'

@injectable()
export class SendgridClient {
  private readonly mailClient: MailService

  constructor (@inject('SendgridService') mailService: MailService) {
    this.mailClient = mailService
  }

  async send (email: Email): Promise<Email> {

    await this.mailClient.sendMultiple({ ...email.message })
    return email
  }
}
