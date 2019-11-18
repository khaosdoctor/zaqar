export class InvalidRendererError extends Error {
  constructor (rendererName: string) {
    super(`Renderer "${rendererName}" is not a function`)
  }
}
