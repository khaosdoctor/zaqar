# Zaqar

> Microservice to send emails

## Summary

- [Zaqar](#zaqar)
  - [Summary](#summary)
  - [Considerations](#considerations)
  - [Usage](#usage)
    - [Docker](#docker)
    - [Helm Chart](#helm-chart)
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
helm repo add zaqar https://lsantos.dev/zaqar/helm
```

This is going to add Zaqar to your helm repo list. Then you can "run":

```sh
helm install zaqar/zaqar --name=zaqar-mail-server
```

> Zaqar is exposed **locally only**, this means you will **not** be able to access it externally unless you manually create an Ingress. This is due to the best practices where microservices should only communicate with each other in the local network

### Heroku

Click the button below to deploy zaqar to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Envs

You should set two environment variables:

- `SENDGRID_APIKEY`: As of now, Zaqar only accepts Sendgrid as mail sender, so this is where you put your API ket
- `DEFAULT_FROM_ADDRESS`: The email to be the "from" address in case there's no from address in the email.
- `RENDERER_LIST`: A space-separated list of renderer packages to be loaded on load (see [renderers section](#renderer-plugins) for more details)


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
  "bcc": ["two@email.com"]
}
```

Following the schema:

```json
{
  "type": "object",
  "properties": {
    "from": { "type": "string", "format": "email" },
    "to": {
      "type": "array",
      "items": { "type": "string", "format": "email" }
    },
    "subject": {
      "type": "string"
    },
    "template": {
      "type": "object",
      "properties": {
        "text": { "type": "string" },
        "lang": { "type": "string" }
      },
      "additionalProperties": false,
      "required": ["text", "lang"]
    },
    "cc": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "email"
      }
    },
    "data": {
      "type": "object"
    },
    "bcc": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "email"
      }
    }
  },
  "required": ["to", "subject", "template"],
  "additionalProperties": false
}
```

> The `data` key is reserved to template data variables, so if you have a variable called `username` in your email, you should send a `{ data: { username: "user" } }` in the payload.

> If `from` is not filled, then the value of `DEFAULT_FROM_ADDRESS` env variable will be used

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

> The whole API is described at [the api documentation](https://lsantos.dev/zaqar)

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

> If you want to add yours, please send a PR :)
