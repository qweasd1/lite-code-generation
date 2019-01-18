import { CodeGenerationConfig, CodeLike, Context } from "./Interface";
export declare function generate(language: CodeGenerationConfig, code: (ctx: (text?: CodeLike) => Context) => (Promise<void> | void)): string;
