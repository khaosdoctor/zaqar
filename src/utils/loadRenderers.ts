import { Renderers } from '../presentation/app'

function loadRenderers (rendererList: string) {

  const renderersToLoad: string[] = rendererList.split(' ')
  let renderers: Renderers = {}

  for (let rendererName of renderersToLoad) {
    try {
      const { name, fn } = require(rendererName)
      renderers[name] = fn
    } catch (err) {
      console.error(`[Zaqar Renderer]: Could not require renderer ${rendererName}`)
    }
  }

  return renderers
}

export default {
  loadRenderers
}
