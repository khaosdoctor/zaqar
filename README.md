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

### Envs

You should set two environment variables:

- `SENDGRID_APIKEY`: As of now, Zaqar only accepts Sendgrid as mail sender, so this is where you put your API ket
- `DEFAULT_FROM_ADDRESS`: The email to be the "from" address


## API

Zaqar only has the `POST /send` endpoint which takes the following "payload":

```json
{
  "to": ["to@email.com"],
  "from": "my@email.com",
  "subject": "subject",
  "template": "p Pug Template",
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
      "items": {
        "type": "string",
        "format": "email"
      }
    },
    "subject": {
      "type": "string"
    },
    "template": {
      "type": "string"
    },
    "cc": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "email"
      }
    },
    "bcc": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "email"
      }
    }
  },
  "required": ["from", "to", "subject", "template"],
  "additionalProperties": false
}
```

> The `data` key is reserved to template data variables, so if you have a variable called `username` in your email, you should send a `{ data: { username: "user" } }` in the payload.

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
