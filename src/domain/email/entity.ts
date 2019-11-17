import pug from 'pug'
import { IEmail } from './structures/IEmail'
import { TemplateError } from './errors/TemplateError'

export class Email {
  private readonly rawTemplate: string
  private readonly templateData: any
  readonly from: string
  readonly to: string[]
  readonly cc: string[]
  readonly bcc: string[]
  readonly subject: string
  compiledTemplate: string = ''

  constructor (params: IEmail) {
    this.from = params.from
    this.to = params.to
    this.subject = params.subject
    this.rawTemplate = params.template
    this.templateData = params.data
    this.cc = params.cc || []
    this.bcc = params.bcc || []
  }

  compileTemplate () {
    try {
      this.compiledTemplate = pug.render(this.rawTemplate, this.templateData)
      return this.compiledTemplate
    } catch (error) {
      throw new TemplateError(error.message)
    }
  }

  get message () {
    return {
      to: this.to,
      from: this.from,
      subject: this.subject,
      html: this.compiledTemplate || this.compileTemplate()
    }
  }

  toObject (): Omit<IEmail, 'data'> {
    return {
      to: this.to,
      from: this.from,
      subject: this.subject,
      bcc: this.bcc,
      cc: this.cc,
      template: this.compiledTemplate
    }
  }
}
