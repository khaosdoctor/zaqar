import { injectable } from 'tsyringe'
import { Email } from '../domain'
import { SendgridClient } from '../data/repositories/SendgridClient'
import { IEmail } from '../domain/email/structures/IEmail'

@injectable()
export class EmailService {
  private readonly client: SendgridClient

  constructor (client: SendgridClient) {
    this.client = client
  }

  async sendEmail (emailData: IEmail): Promise<Email> {
    const email = new Email(emailData)
    return this.client.send(email)
  }
}
