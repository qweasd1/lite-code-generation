import { CodeGenerationConfig, Context } from "./Interface";
export declare class ContextBuilder {
    config: CodeGenerationConfig;
    rootContexts: Context[];
    constructor(config: CodeGenerationConfig);
    create(): (text?: string) => Context;
    generateCode(): Promise<string>;
}
