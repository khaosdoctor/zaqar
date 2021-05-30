import sinon from 'sinon'
import env from 'sugar-env'
import { expect } from 'chai'
import axiosist from 'axiosist'
import { app, Renderers } from '../src/presentation/app'
import sg, { MailService } from '@sendgrid/mail'
import { AxiosInstance, AxiosResponse } from 'axios'
import { config, IAppConfig } from '../src/app-config'
import loader from '../src/utils/loadRenderers'
import sendgridLib from '../src/lib/sendgrid'
import { Client } from '@sendgrid/client'
import { ClientResponse } from '@sendgrid/client/src/response'
import { ResponseError } from '@sendgrid/helpers/classes'

class MockMailServer implements MailService {
  setApiKey (_: string): void {
    return
  }
  setClient (_: Client): void {
    return
  }
  setTwilioEmailAuth (_: string, __: string): void {
    return
  }
  setTimeout (_: number): void {
    return
  }
  setSubstitutionWrappers (_: string, __: string): void {
    return
  }
  send (data: sg.MailDataRequired | sg.MailDataRequired[], isMultiple?: boolean, cb?: (err: Error | ResponseError, result: [ClientResponse, {}]) => void): Promise<[ClientResponse, {}]> {
    const response = {
      data,
      isMultiple,
      cb,
      statusCode: 200,
      body: {},
      headers: []
    }
    return Promise.resolve([response, {}])
  }
  sendMultiple (data: sg.MailDataRequired, cb?: (error: Error | ResponseError, result: [ClientResponse, {}]) => void): Promise<[ClientResponse, {}]> {
    return this.send(data, true, cb)
  }

}

const options: IAppConfig = {
  ...config,
  defaultFromAddress: 'mock@email.com',
  defaultFromName: 'Mock',
  sendgrid: {
    apiKey: 'mock'
  }
}

describe('POST /send', () => {
  before(() => {
    sinon.stub(sendgridLib, 'factory')
      .callsFake((_: string) => {
        return new MockMailServer()
      })
  })

  describe('when required parameters are missing', () => {
    let response: AxiosResponse<any>
    let api: AxiosInstance

    before(async () => {
      const loaderStub = sinon.stub(loader, 'loadRenderers')
        .returns({ nunjucks: sinon.stub().callsFake((text: string, _data: any) => text) })
      api = axiosist(await app(options, env.TEST))
      response = await api.post('/send')
      loaderStub.restore()
    })

    it('should return HTTP 422', () => {
      expect(response.status).to.be.equals(422)
    })

    it('should return an error object', () => {
      expect(response.data).to.be.an('object')
      expect(response.data).to.have.property('error')
    })

    it('should have an `unprocessable_entity` error code', () => {
      expect(response.data.error.code).to.equals('unprocessable_entity')
    })
  })

  describe('when required parameters are given', () => {
    let api: AxiosInstance
    let response: AxiosResponse<any>
    let loaderStub: any
    const emailData = { from: 'mock@email.com', to: ['test@mock.com'], subject: 'mock', template: { lang: 'nunjucks', text: 'my template' }, data: { name: 'test' } }

    before(async () => {
      loaderStub = sinon.stub(loader, 'loadRenderers')
        .returns({ nunjucks: sinon.stub().callsFake((text: string, _data: any) => text) })
      api = axiosist(await app(options, env.TEST))
      response = await api.post('/send', emailData)
      loaderStub.restore()
    })

    it('should return HTTP 202', () => {
      expect(response.status).to.be.equal(202)
    })

    it('should return an object', () => {
      expect(response.data).to.be.an('object')
    })

    describe('the renderer', () => {
      it('should have been called once with all email data', () => {
        expect(loaderStub.called).to.equal(true)
        expect(loaderStub.calledOnce).to.equal(true)
        expect(loaderStub.calledWith(emailData.template.text, emailData.data))
      })
    })

    describe('the object', () => {
      it('should be an email', () => {
        describe('when `from` property is given', () => {
          it('should not replace property `from` when it is given', () => {
            expect(response.data).to.have.property('from')
            expect(response.data.from).to.equal(emailData.from)
          })
        })

        describe('when `replyTo` property is missing', () => {
          it('should add a `replyTo` property when it is missing with the data from the `from` property', () => {
            expect(response.data).to.have.property('replyTo')
            expect(response.data.replyTo).to.equal(emailData.from)
          })
        })

        expect(response.data).to.have.property('to')
        expect(response.data.to.length).to.equal(1)
        expect(response.data).to.have.property('subject')
        expect(response.data.subject).to.equal(emailData.subject)
        expect(response.data).to.have.property('bcc')
        expect(response.data.bcc.length).to.equal(0)
        expect(response.data).to.have.property('cc')
        expect(response.data.cc.length).to.equal(0)
        expect(response.data).to.have.property('template')
        expect(response.data.template).to.have.property('text')
        expect(response.data.template).to.have.property('lang')
        expect(response.data.template.lang).to.equal(emailData.template.lang)
        expect(response.data.template.text).to.equal(emailData.template.text)
      })
    })
  })

  describe('when required parameters are given using basic auth', () => {
    let api: AxiosInstance
    let response: AxiosResponse<any>
    let loaderStub: any
    const emailData = { from: 'mock@email.com', to: ['test@mock.com'], subject: 'mock', template: { lang: 'nunjucks', text: 'my template' }, data: { name: 'test' } }

    before(async () => {
      loaderStub = sinon.stub(loader, 'loadRenderers')
        .returns({ nunjucks: sinon.stub().callsFake((text: string, _data: any) => text) })
      const basicOptions = Object.assign({}, options)
      basicOptions.auth = {
        pass: 'somepass',
        user: 'someuser'
      }
      api = axiosist(await app(basicOptions, env.TEST))
      response = await api.post('/send', emailData, { auth: { username: basicOptions.auth.user, password: basicOptions.auth.pass } })
      loaderStub.restore()
    })

    it('should return HTTP 202', () => {
      expect(response.status).to.be.equal(202)
    })

    it('should return an object', () => {
      expect(response.data).to.be.an('object')
    })

    describe('the renderer', () => {
      it('should have been called once with all email data', () => {
        expect(loaderStub.called).to.equal(true)
        expect(loaderStub.calledOnce).to.equal(true)
        expect(loaderStub.calledWith(emailData.template.text, emailData.data))
      })
    })

    describe('the object', () => {
      it('should be an email', () => {
        describe('when `from` property is given', () => {
          it('should not replace property `from` when it is given', () => {
            expect(response.data).to.have.property('from')
            expect(response.data.from).to.equal(emailData.from)
          })
        })

        describe('when `replyTo` property is missing', () => {
          it('should add a `replyTo` property when it is missing with the data from the `from` property', () => {
            expect(response.data).to.have.property('replyTo')
            expect(response.data.replyTo).to.equal(emailData.from)
          })
        })

        expect(response.data).to.have.property('to')
        expect(response.data.to.length).to.equal(1)
        expect(response.data).to.have.property('subject')
        expect(response.data.subject).to.equal(emailData.subject)
        expect(response.data).to.have.property('bcc')
        expect(response.data.bcc.length).to.equal(0)
        expect(response.data).to.have.property('cc')
        expect(response.data.cc.length).to.equal(0)
        expect(response.data).to.have.property('template')
        expect(response.data.template).to.have.property('text')
        expect(response.data.template).to.have.property('lang')
        expect(response.data.template.lang).to.equal(emailData.template.lang)
        expect(response.data.template.text).to.equal(emailData.template.text)
      })
    })
  })

  describe('when required parameters are given using basic auth but wrong username', () => {
    let api: AxiosInstance
    let response: AxiosResponse<any>
    let loaderStub: any
    const emailData = { from: 'mock@email.com', to: ['test@mock.com'], subject: 'mock', template: { lang: 'nunjucks', text: 'my template' }, data: { name: 'test' } }

    before(async () => {
      loaderStub = sinon.stub(loader, 'loadRenderers')
        .returns({ nunjucks: sinon.stub().callsFake((text: string, _data: any) => text) })
      const basicOptions = Object.assign({}, options)
      basicOptions.auth = {
        pass: 'somepass',
        user: 'someuser'
      }
      api = axiosist(await app(basicOptions, env.TEST))
      response = await api.post('/send', emailData, { auth: { username: basicOptions.auth.user, password: '' } })
      loaderStub.restore()
    })

    it('should return HTTP 401', () => {
      expect(response.status).to.be.equal(401)
    })

    it('should not return an object', () => {
      expect(response.data).not.to.be.an('object')
    })
  })

  describe('when required parameters are given in different format', () => {
    let api: AxiosInstance
    let response: AxiosResponse<any>
    let loaderStub: any
    const emailData = { to: ['test@mock.com'], replyTo: 'replyEmail@email.com', subject: 'mock', template: { lang: 'nunjucks', text: 'my template' }, data: { name: 'test' }, bcc: [{ name: 'BCC', email: 'bcc@bcc.com' }] }

    before(async () => {
      loaderStub = sinon.stub(loader, 'loadRenderers')
        .returns({ nunjucks: sinon.stub().callsFake((text: string, _data: any) => text) })
      api = axiosist(await app(options, env.TEST))
      response = await api.post('/send', emailData)
      loaderStub.restore()
    })

    it('should return HTTP 202', () => {
      expect(response.status).to.be.equal(202)
    })

    it('should return an object', () => {
      expect(response.data).to.be.an('object')
    })

    describe('the renderer', () => {
      it('should have been called once with all email data', () => {
        expect(loaderStub.called).to.equal(true)
        expect(loaderStub.calledOnce).to.equal(true)
        expect(loaderStub.calledWith(emailData.template.text, emailData.data))
      })
    })

    describe('the object', () => {
      it('should be an email', () => {
        describe('when `replyTo` is given', () => {
          it('should use the given value', () => {
            expect(response.data).to.have.property('replyTo')
            expect(response.data.replyTo).to.equal(emailData.replyTo)
          })
        })

        describe('when `from` is not present', () => {
          it('should automatically add a `from` field with default values from env', () => {
            expect(response.data).to.have.property('from')
            expect(response.data.from).to.deep.equal({ name: options.defaultFromName, email: options.defaultFromAddress })
          })
        })

        expect(response.data).to.have.property('to')
        expect(response.data.to.length).to.equal(1)
        expect(response.data).to.have.property('subject')
        expect(response.data.subject).to.equal(emailData.subject)
        expect(response.data).to.have.property('bcc')
        expect(response.data.bcc.length).to.equal(1)
        expect(response.data.bcc).to.deep.equal(emailData.bcc)
        expect(response.data).to.have.property('cc')
        expect(response.data.cc.length).to.equal(0)
        expect(response.data).to.have.property('template')
        expect(response.data.template).to.have.property('text')
        expect(response.data.template).to.have.property('lang')
        expect(response.data.template.lang).to.equal(emailData.template.lang)
        expect(response.data.template.text).to.equal(emailData.template.text)
      })
    })
  })

  describe('when the renderer is not found', () => {
    let api: AxiosInstance
    let response: AxiosResponse<any>
    let loaderStub: any
    const emailData = { from: 'mock@email.com', to: ['test@mock.com'], subject: 'mock', template: { lang: 'nunjucks', text: 'my template' }, data: { name: 'test' } }

    before(async () => {
      loaderStub = sinon.stub(loader, 'loadRenderers')
        .returns({})
      api = axiosist(await app(options, env.TEST))
      response = await api.post('/send', emailData)
      loaderStub.restore()
    })

    describe('the renderer', () => {
      it('should have been called once with all email data', () => {
        expect(loaderStub.called).to.equal(true)
        expect(loaderStub.calledOnce).to.equal(true)
        expect(loaderStub.calledWith(emailData.template.text, emailData.data))
      })
    })

    it('should return HTTP 404', () => {
      expect(response.status).to.be.equals(404)
    })

    it('should return an error object', () => {
      expect(response.data).to.be.an('object')
      expect(response.data).to.have.property('error')
    })

    it('should have an `renderer_not_found` error code', () => {
      expect(response.data.error.code).to.equals('renderer_not_found')
    })
  })

  describe('when the renderer is invalid', () => {
    let api: AxiosInstance
    let response: AxiosResponse<any>
    let loaderStub: any
    const emailData = { from: 'mock@email.com', to: ['test@mock.com'], subject: 'mock', template: { lang: 'nunjucks', text: 'my template' }, data: { name: 'test' } }

    before(async () => {
      loaderStub = sinon.stub(loader, 'loadRenderers')
        .returns(({ nunjucks: 'not a function' }) as unknown as Renderers)
      api = axiosist(await app(options, env.TEST))
      response = await api.post('/send', emailData)
      loaderStub.restore()
    })

    describe('the renderer', () => {
      it('should have been called once with all email data', () => {
        expect(loaderStub.called).to.equal(true)
        expect(loaderStub.calledOnce).to.equal(true)
        expect(loaderStub.calledWith(emailData.template.text, emailData.data))
      })
    })

    it('should return HTTP 500', () => {
      expect(response.status).to.be.equals(500)
    })

    it('should return an error object', () => {
      expect(response.data).to.be.an('object')
      expect(response.data).to.have.property('error')
    })

    it('should have an `invalid_render` error code', () => {
      expect(response.data.error.code).to.equals('invalid_render')
    })
  })

  describe('when the renderer throws an error', () => {
    let api: AxiosInstance
    let response: AxiosResponse<any>
    let loaderStub: any
    const emailData = { from: 'mock@email.com', to: ['test@mock.com'], subject: 'mock', template: { lang: 'nunjucks', text: 'my template' }, data: { name: 'test' } }

    before(async () => {
      loaderStub = sinon.stub(loader, 'loadRenderers')
        .returns({ nunjucks: sinon.stub().throws(SyntaxError) })
      api = axiosist(await app(options, env.TEST))
      response = await api.post('/send', emailData)
      loaderStub.restore()
    })

    describe('the renderer', () => {
      it('should have been called once with all email data', () => {
        expect(loaderStub.called).to.equal(true)
        expect(loaderStub.calledOnce).to.equal(true)
        expect(loaderStub.calledWith(emailData.template.text, emailData.data))
      })
    })

    it('should return HTTP 500', () => {
      expect(response.status).to.be.equals(500)
    })

    it('should return an error object', () => {
      expect(response.data).to.be.an('object')
      expect(response.data).to.have.property('error')
    })

    it('should have an `failed_to_parse_template` error code', () => {
      expect(response.data.error.code).to.equals('failed_to_parse_template')
    })
  })
})
