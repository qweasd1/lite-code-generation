import { BodyFunction, BracketConfig, CodeGenerationConfig, CodeLike, Context, State } from "./Interface";
export declare class ContextImpl implements Context {
    config: CodeGenerationConfig;
    state: State;
    parent: Context;
    segements: CodeLike[];
    children: Context[];
    indent: string;
    ifCondition: boolean;
    isGenerating: boolean;
    isIBracket: boolean;
    isIBracketFirst: boolean;
    currentBracketConfig: BracketConfig;
    generatingCache: any[];
    constructor(segement: undefined | null | string, config: CodeGenerationConfig, state: State, parent: Context);
    if(condition: boolean, ...code: CodeLike[]): Context;
    ifAll(condition: boolean[], ...code: CodeLike[]): Context;
    ifAny(condition: boolean[], ...code: CodeLike[]): Context;
    else(...code: CodeLike[]): Context;
    bracket(char: string, content: BodyFunction): Context;
    body(content: BodyFunction): Context;
    ibracket(char: string): Context;
    ibracketEnd(): Context;
    append(...text: CodeLike[]): Context;
    newLine(n?: number): Context;
    generate(): Promise<string>;
    private _add;
    private cache;
    private currentLine;
    generateLines(): Promise<string[]>;
    private _addStringSegement;
}
