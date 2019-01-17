import {CodeGenerationConfig, CodeLike, Context, State} from "./Interface";
import {ContextImpl} from "./ContextImpl";

export class ContextBuilder {

  rootContexts: Context[] = []

  constructor(
    public config: CodeGenerationConfig
  ) {

  }

  create(): (text?: CodeLike) => Context {
    const contextStack = []

    const state: State = {
      currentIndentCount: 0,
      currentContext: null
    }

    let result = (text: CodeLike = "") => {
      let newContext
      const context = new ContextImpl(text, this.config, state, state.currentContext)
      if (!context.parent) {
        this.rootContexts.push(context)
      }
      return context
    }

    return result
  }

  async generateCode(): Promise<string> {
    const result = []
    for (let rootContext of this.rootContexts) {
      result.push(...await rootContext.generateLines())
    }
    return result.join(this.config.EOL)
  }
}





