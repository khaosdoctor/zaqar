import { Renderers } from '../presentation/app'

function loadRenderers (rendererList: string) {
  const renderersToLoad: string[] = rendererList.split(' ')
  if (renderersToLoad.length <= 0) throw new Error('Zaqar must load at least one renderer')
  let renderers: Renderers = {}

  for (let rendererName of renderersToLoad) {
    try {
      console.log(`Loading renderer: ${rendererName}`)
      const { name, fn } = require(rendererName)
      if (!name) console.error(`Could not find renderer "${rendererName}"`)
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
