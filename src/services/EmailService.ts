import { injectable } from 'tsyringe'
import { Email } from '../domain'
import { SendgridClient } from '../data/repositories/SendgridClient'
import { IEmail } from '../domain/email/structures/IEmail'
import { RenderService } from './RenderService'

@injectable()
export class EmailService {
  constructor (private readonly client: SendgridClient, private readonly renderService: RenderService) {
    //
  }

  async sendEmail (emailData: IEmail): Promise<Email> {
    const email = new Email(emailData, this.renderService)
    return this.client.send(email)
  }
}
