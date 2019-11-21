import { injectable } from 'tsyringe'
import { IEmail } from './structures/IEmail'
import { RenderService } from '../../services/RenderService'

@injectable()
export class Email {
  private readonly rawTemplate: string
  private readonly templateData: any
  private readonly templateLang: string
  readonly from: string
  readonly to: string[]
  readonly cc: string[]
  readonly bcc: string[]
  readonly subject: string
  compiledTemplate: string = ''

  constructor (params: IEmail, private readonly renderService: RenderService) {
    this.from = params.from
    this.to = params.to
    this.subject = params.subject
    this.rawTemplate = params.template.text
    this.templateLang = params.template.lang
    this.templateData = params.data
    this.cc = params.cc || []
    this.bcc = params.bcc || []
  }

  async compileTemplate () {
    this.compiledTemplate = await this.renderService.render(this.templateLang, this.rawTemplate, this.templateData)
    return this.compiledTemplate
  }

  get message () {
    return {
      to: this.to,
      from: this.from,
      subject: this.subject,
      html: this.compiledTemplate
    }
  }

  toObject (): Omit<IEmail, 'data'> {
    return {
      to: this.to,
      from: this.from,
      subject: this.subject,
      bcc: this.bcc,
      cc: this.cc,
      template: {
        text: this.rawTemplate,
        lang: this.templateLang
      }
    }
  }
}
