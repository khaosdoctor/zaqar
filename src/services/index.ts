import { injectable } from 'tsyringe'
import { EmailService } from './EmailService'
import { RenderService } from './RenderService'

@injectable()
export class Services {
  constructor (
    public readonly emailService: EmailService,
    public readonly rendererService: RenderService
  ) { }
}
