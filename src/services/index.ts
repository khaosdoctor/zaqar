import { injectable } from 'tsyringe'
import { EmailService } from './EmailService'

@injectable()
export class Services {
  constructor (
    public readonly emailService: EmailService
  ) { }
}
