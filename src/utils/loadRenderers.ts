const requireGlob = require('require-glob')
import { RendererExport, Renderers } from '../presentation/app'

export default function () {
  const loadedRenderers: { [index: string]: RendererExport } = requireGlob.sync('zaqar-renderer-*')

  let renderers: Renderers = {}
  for (let loadedRenderer of Object.entries(loadedRenderers)) {
    const [, { name, fn }] = loadedRenderer
    renderers[name] = fn
  }

  return renderers
}
