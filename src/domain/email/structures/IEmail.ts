export interface IEmail {
  from: string
  to: string[]
  subject: string
  template: {
    text: string
    lang: string
  }
  data: any
  cc?: string[]
  bcc?: string[]
}
