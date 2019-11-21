import { Renderers } from '../presentation/app'

export default function (rendererList: string) {

  const renderersToLoad: string[] = rendererList.split(',')
  let renderers: Renderers = {}

  for (let rendererName of renderersToLoad) {
    const { name, fn } = require(rendererName)
    renderers[name] = fn
  }

  return renderers
}
