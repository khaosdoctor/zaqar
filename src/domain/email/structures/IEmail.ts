export interface IEmail {
  from: string
  to: string[]
  subject: string
  template: string
  data: any
  cc?: string[]
  bcc?: string[]
}
