export class RendererNotFoundError extends Error {
  constructor (rendererName: string) {
    super(`Could not find renderer "${rendererName}"`)
  }
}
