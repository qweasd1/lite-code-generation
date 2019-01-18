export declare type CodeFunction = (context: Context) => void;
export declare type BodyFunction = () => void;
export declare type CodeLike = string | CodeFunction | BodyFunction;
export interface Context {
    append(...text: CodeLike[]): Context;
    if(condition: boolean, ...code: CodeLike[]): Context;
    ifAll(condition: boolean[], ...code: CodeLike[]): Context;
    ifAny(condition: boolean[], ...code: CodeLike[]): Context;
    else(...code: CodeLike[]): Context;
    elseIf(condition: boolean, ...code: CodeLike[]): Context;
    body(content: BodyFunction): Context;
    bracket(char: string, content: BodyFunction): Context;
    ibracket(char: string): Context;
    ibracketEnd(): Context;
    newLine(n?: number): Context;
    generate(): string;
    generateLines(): string[];
    children: Context[];
}
export interface CodeGenerationConfig {
    indent: string;
    EOL: string;
    brackets: {
        [key: string]: BracketConfig;
    };
    body: {
        start: string;
        end: string;
    };
}
export interface BracketConfig {
    rightBracket: string;
    prefixIfNotFirst: string;
}
export interface State {
    currentContext: Context;
}
