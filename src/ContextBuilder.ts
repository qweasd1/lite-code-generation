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

  generateCode(): string {
    const result = []
    for (let rootContext of this.rootContexts) {
      result.push(...rootContext.generateLines())
    }
    return result.join(this.config.EOL)
  }
}





