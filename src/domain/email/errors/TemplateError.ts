import { DomainError } from '../../domain.error'
import { format } from 'util'

export class TemplateError extends DomainError {
  static MESSAGE = 'Error parsing email template: "%s"'

  constructor (message: string) {
    super(format(TemplateError.MESSAGE, message))
  }
}
