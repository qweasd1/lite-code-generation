import { CodeGenerationConfig, Context } from "./Interface";
export declare function generate(language: CodeGenerationConfig, code: (ctx: (text?: string) => Context) => (Promise<void> | void)): Promise<string>;
