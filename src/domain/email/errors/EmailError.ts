import { DomainError } from '../../domain.error'
import { format } from 'util'

export class EmailError extends DomainError {
  static MESSAGE = 'Email error: "%s"'

  constructor (message: string) {
    super(format(EmailError.MESSAGE, message))
  }
}
