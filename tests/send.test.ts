import sinon from 'sinon'
import env from 'sugar-env'
import { expect } from 'chai'
import axiosist from 'axiosist'
import { app } from '../src/presentation/app'
import sg from '@sendgrid/mail'
import { AxiosInstance, AxiosResponse } from 'axios'
import { config, IAppConfig } from '../src/app-config'

const options: IAppConfig = {
  ...config,
  sendgrid: {
    apiKey: 'mock'
  }
}

describe('POST /send', () => {
  let api: AxiosInstance

  before(async () => {
    api = axiosist(await app(options, env.TEST))
  })

  describe('when required parameters are missing', () => {
    let response: AxiosResponse<any>

    before(async () => {
      response = await api.post('/send')
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
    let response: AxiosResponse<any>
    const emailData = { from: 'mock@email.com', to: ['test@mock.com'], subject: 'mock', template: 'template' }

    before(async () => {
      sinon.stub(sg, 'send')
        .callsFake((message: any, isMultiple?: boolean, cb?: any): Promise<[any, {}]> => {
          const response = {
            message,
            isMultiple,
            cb
          }
          return Promise.resolve([response, {}])
        })
      response = await api.post('/send', emailData)
    })

    it('should return HTTP 202', () => {
      expect(response.status).to.be.equal(202)
    })

    it('should return an object', () => {
      expect(response.data).to.be.an('object')
    })

    describe('the object', () => {
      it('should be an email', () => {
        expect(response.data).to.have.property('from')
        expect(response.data.from).to.equal(emailData.from)
        expect(response.data).to.have.property('to')
        expect(response.data.to.length).to.equal(1)
        expect(response.data).to.have.property('subject')
        expect(response.data.subject).to.equal(emailData.subject)
        expect(response.data).to.have.property('bcc')
        expect(response.data.bcc.length).to.equal(0)
        expect(response.data).to.have.property('cc')
        expect(response.data.cc.length).to.equal(0)
        expect(response.data).to.have.property('template')
        expect(response.data.template).to.equal('<template></template>')
      })
    })
  })
})
