# Zaqar

> Microservice to send emails

## Summary

- [Zaqar](#zaqar)
  - [Summary](#summary)
  - [Considerations](#considerations)
  - [Usage](#usage)
    - [Docker](#docker)
    - [Helm Chart](#helm-chart)
    - [Heroku](#heroku)
    - [Envs](#envs)
  - [API](#api)
  - [Renderer Plugins](#renderer-plugins)
    - [Loading a renderer](#loading-a-renderer)
    - [Creating your own renderer](#creating-your-own-renderer)
    - [List of renderers](#list-of-renderers)

## Considerations

This microservice was made because we often have problems sending emails or we need a default backend that will do this for us.

This is why Zaqar was built. To become a fast approach to email handling in Node using microservices.

## Usage

**Important**: Zaqar is not meant to be used as a library, so there's no instalation instructions that eventually would led you to an `npm install`.

### Docker

Zaqar was created to be a **fully implemented microservice**, in other words, you have to run it instead of installing it as a library, that's why there's a [Docker Image](https://hub.docker.com/r/khaosdoctor/zaqar) you should pull and run within your infrastructure.

- The image exposes port 3000

### Helm Chart

Zaqar also comes with a helm chart so you can run it in a kubernetes infrastructure, this helm chart is located in this same repository so you can "run":

```sh
helm repo add zaqar https://lsantos.me/zaqar/helm
```

This is going to add Zaqar to your helm repo list. Then you can "run":

If you're running `helm < 3.0` you should pass a `--name`:

```sh
helm install zaqar/zaqar --name=zaqar-mail-server --set "environment.SENDGRID_APIKEY=key" ...
```

Otherwise, if you are on Helm version `>3.0`:

```sh
helm install zaqar-mail-server zaqar/zaqar --set "environment.SENDGRID_APIKEY=key" ...
```

> Zaqar is exposed **locally only**, this means you will **not** be able to access it externally unless you manually create an Ingress. This is due to the best practices where microservices should only communicate with each other in the local network

### Heroku

Click the button below to deploy zaqar to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Envs

You should set some environment variables:

- `SENDGRID_APIKEY`: As of now, Zaqar only accepts Sendgrid as mail sender, so this is where you put your API key
- `DEFAULT_FROM_ADDRESS`: The email to be the "from" address in case there's no from address in the email.
- `DEFAULT_FROM_NAME`: The name to be the "from" name in case there's no name specified.
- `RENDERER_LIST`: A space-separated list of renderer packages to be loaded on load (see [renderers section](#renderer-plugins) for more details)
- `AUTH_USERNAME`: If provided, will set the basic auth username
- `AUTH_PASSWORD`: If provided, will set the basic auth password

#### Basic Authentication

If both `AUTH_USERNAME` and `AUTH_PASSWORD` are provided, Zaqar will enter the auth mode. This mode only allows requests with the `Authorization Basic` header set, if the user or the password do not match, the service will return `401`.

If one of the two variables are not set, Zaqar will run in authless mode.

## API

Zaqar only has the `POST /send` endpoint which takes the following "payload":

```jsonc
{
  "to": ["to@email.com"],
  "from": "my@email.com",
  "subject": "subject",
  "template": {
    "lang": "renderer-language", // Renderer to be used
    "text": "your {{template-like}} <% structure %>" // See renderer section
  },
  "cc": ["one@email.com"],
  "bcc": ["two@email.com"],
  "replyTo": "email@email.com"
}
```

You can also send "complex" email fields with given names:

```jsonc
{
  "to": [{email: "to@email.com", name: "Someone"}],
  "from": {email: "to@email.com", name: "Someone"},
  "subject": "subject",
  "template": {
    "lang": "renderer-language", // Renderer to be used
    "text": "your {{template-like}} <% structure %>" // See renderer section
  },
  "cc": ["one@email.com"],
  "bcc": ["two@email.com"],
  "replyTo": "email@email.com"
}
```

Only `'to', 'subject', 'template'` fields are required.

Following the schema:

```js
{
  type: 'object',
  properties: {
    from: { oneOf: [{ type: 'string', format: 'email' }, { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' } } }] },
    to: {
      type: 'array',
      items: {
        anyOf: [{ type: 'string', format: 'email' }, { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' } } }]
      }
    },
    subject: {
      type: 'string'
    },
    template: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        lang: { type: 'string' }
      },
      additionalProperties: false,
      required: ['text', 'lang']
    },
    cc: {
      type: 'array',
      items: {
        anyOf: [{ type: 'string', format: 'email' }, { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' } } }]
      }
    },
    data: {
      type: 'object'
    },
    replyTo: {
      oneOf: [{ type: 'string', format: 'email' }, { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' } } }]
    },
    bcc: {
      type: 'array',
      items: {
        anyOf: [{ type: 'string', format: 'email' }, { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' } } }]
      }
    }
  },
  required: ['to', 'subject', 'template'],
  additionalProperties: false
}
```

> The `data` key is reserved to template data variables, so if you have a variable called `username` in your email, you should send a `{ data: { username: "user" } }` in the payload.

> If `from` is not filled, then the value of `DEFAULT_FROM_ADDRESS` and `DEFAULT_FROM_NAME` variables will be used

> In case there's no `replyTo` the `from` data will be used.

Which answers:

```json
{
  "to": [
    "lucas@test.com"
  ],
  "from": "from@email.com",
  "subject": "test",
  "bcc": [],
  "cc": [],
  "template": "<p>test</p>"
}
```

> The whole API is described at [the api documentation](https://oss.lsantos.dev/zaqar)

## Renderer Plugins

Zaqar is extensible, which means you can use different renderers to render your email using different templating engines. The template engine to be used for an specific email is set by the `lang` key in the `template` object within the `/send` payload.

### Loading a renderer

Renderers can be load by the environment variable called `RENDERER_LIST`, which receive a space-separated list of renderer package names. For example, if we wanted to load both the mustache and ejs template engines we could set it to: `zaqar-renderer-mustache zaqar-renderer-ejs`.

Renderers will be loaded everytime a new instance of Zaqar is spinned up. There's no cache, Zaqar uses NPM to install the packages within the strucutre.

> If this environment variable is not set, Zaqar will set it to `zaqar-renderer-mustache zaqar-renderer-ejs` by default

### Creating your own renderer

A renderer is just a simple JavaScript function which takes the following signature:

```ts
async function renderer (text: string, data: any = {}, renderer: typeof yourRenderer = yourRenderer): Promise<string>
```

> The `renderer` parameter is completely optional and is there just for testing purposes

The file should export an object with the following keys:

```js
{
  name: 'mustache', // name of the renderer, this will be the "lang" parameter in the API
  fn: renderFunction, // Function to be used as renderer
  errClass: MustacheRendererError // Any additional data you want to share with external libraries
}
```

Take a look at this example taken from [Mustache Renderer for Zaqar](https://github.com/khaosdoctor/zaqar-renderer-mustache):

```ts
import mustache from 'mustache'

export class MustacheRendererError extends Error {
  constructor (message: string) {
    super(`[Zaqar renderer error - Mustache]: ${message}`)
  }
}

async function renderFunction (text: string, data: any = {}, renderer: typeof mustache = mustache): Promise<string> {
  try {
    return renderer.render(text, data)
  } catch (error) {
    throw new MustacheRendererError(error.message)
  }
}

const rendererObj = {
  name: 'mustache',
  fn: renderFunction,
  errClass: MustacheRendererError
}

export default rendererObj
module.exports = rendererObj
```

Then publish on NPM using any name. Then add it to `RENDERER_LIST` to be loaded.

### List of renderers

These are the currently supported renderers for Zaqar:

- [zaqar-renderer-mustache](https://github.com/khaosdoctor/zaqar-renderer-mustache):
  - **Lang:** mustache
- [zaqar-renderer-ejs](https://github.com/khaosdoctor/zaqar-renderer-ejs):
  - **Lang:** ejs
- [zaqar-renderer-pug](https://github.com/khaosdoctor/zaqar-renderer-pug):
  - **Lang:** pug

> If you want to add yours, please send a PR :)
