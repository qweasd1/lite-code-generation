import {CodeGenerationConfig, CodeLike, Context} from "./Interface";
import {ContextBuilder} from "./ContextBuilder";


export function generate(language: CodeGenerationConfig, code: (ctx: (text?: CodeLike) => Context) => (Promise<void> | void)): string {
  const builder = new ContextBuilder(language)

  code(builder.create())
  return builder.generateCode()
}