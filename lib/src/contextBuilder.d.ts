import { CodeGenerationConfig, CodeLike, Context } from "./Interface";
export declare class ContextBuilder {
    config: CodeGenerationConfig;
    rootContexts: Context[];
    constructor(config: CodeGenerationConfig);
    create(): (text?: CodeLike) => Context;
    generateCode(): Promise<string>;
}
