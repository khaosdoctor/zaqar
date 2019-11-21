import { inject, injectable } from 'tsyringe'
import { Renderers } from '../presentation/app'
import { InvalidRendererError } from './errors/InvalidRendererError'
import { RendererNotFoundError } from './errors/RendererNotFoundError'
import { RendererError } from './errors/RendererError'

@injectable()
export class RenderService {
  constructor (@inject('Renderers') private readonly renderers: Renderers) { }

  async render (lang: string, text: string, data: any) {
    const renderer = this.renderers[lang]
    if (!renderer) throw new RendererNotFoundError(lang)
    // tslint:disable-next-line: strict-type-predicates
    if (typeof renderer !== 'function') throw new InvalidRendererError(lang)

    try {
      const templateText = await renderer(text, data)
      return templateText
    } catch (err) {
      throw new RendererError(err)
    }
  }
}
