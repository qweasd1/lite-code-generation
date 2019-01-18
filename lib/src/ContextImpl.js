"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class ContextImpl {
    constructor(segement, config, state, parent) {
        this.config = config;
        this.state = state;
        this.parent = parent;
        this.children = [];
        this.ifCondition = false;
        this.isIBracket = false;
        this.isIBracketFirst = false;
        this.codeFunctionCache = [];
        this.cache = [];
        this.currentLine = [];
        if (!segement) {
            segement = "";
        }
        if (parent) {
            parent.children.push(this);
        }
        this._add([segement]);
    }
    if(condition, ...code) {
        if (condition) {
            this._add(code);
            this.ifCondition = true;
        }
        else {
            this.ifCondition = false;
        }
        return this;
    }
    elseIf(condition, ...code) {
        if (!this.ifCondition && condition) {
            this._add(code);
            this.ifCondition = true;
        }
        else {
            this.ifCondition = false;
        }
        return this;
    }
    ifAll(condition, ...code) {
        let hasFalse = false;
        for (let c of condition) {
            if (!c) {
                hasFalse = true;
                break;
            }
        }
        if (!hasFalse) {
            this._add(code);
            this.ifCondition = true;
        }
        else {
            this.ifCondition = false;
        }
        return this;
    }
    ifAny(condition, ...code) {
        if (condition.some(x => x)) {
            this._add(code);
            this.ifCondition = true;
        }
        else {
            this.ifCondition = false;
        }
        return this;
    }
    else(...code) {
        if (!this.ifCondition) {
            this._add(code);
        }
        return this;
    }
    bracket(char, content) {
        content["$$isIndent"] = true;
        content["$$BracketPrefix"] = this.config.brackets[char].prefixIfNotFirst;
        this._add([char, this.config.EOL, content, this.config.brackets[char].rightBracket]);
        // this.segements.push(char)
        // this.segements.push(this.config.EOL)
        // this.segements.push(content)
        // this.segements.push(this.config.brackets[char].rightBracket)
        return this;
    }
    body(content) {
        content["$$isIndent"] = true;
        this._add([this.config.body.start, this.config.EOL, content, this.config.body.end]);
        // this.segements.push(this.config.body.start)
        // this.segements.push(this.config.EOL)
        // this.segements.push(content)
        // this.segements.push(this.config.body.end)
        return this;
    }
    //
    // ibody(content: BodyFunction): Context {
    //   return this;
    // }
    ibracket(char) {
        const bracketConfig = this.config.brackets[char];
        if (!bracketConfig) {
            throw new Error(`no config for bracket: ${char}`);
        }
        this._add([char]);
        this.currentBracketConfig = bracketConfig;
        this.isIBracket = true;
        this.isIBracketFirst = true;
        return this;
    }
    ibracketEnd() {
        this.isIBracket = false;
        this.isIBracketFirst = false;
        this._add([this.currentBracketConfig.rightBracket]);
        this.currentBracketConfig = null;
        return this;
    }
    append(...text) {
        this._add(text);
        return this;
    }
    newLine(n = 1) {
        for (let i = 0; i < n; i++) {
            this._finishCurrentLine();
        }
        return this;
    }
    generate() {
        return this.generateLines().join(this.config.EOL);
    }
    generateLines() {
        this.cache.push(this.currentLine.join(""));
        // add indent
        // const result = this.cache.map(line => this.indent + line)
        const result = this.cache;
        this.codeFunctionCache = [];
        return result;
    }
    _add(codes) {
        if (this.isIBracket) {
            if (this.isIBracketFirst) {
                this.isIBracketFirst = false;
            }
            else {
                this._addStringSegement(this.currentBracketConfig.prefixIfNotFirst);
            }
        }
        for (let codeLike of codes) {
            this._processSegement(codeLike);
        }
    }
    _processSegement(segment) {
        if (typeof segment === "string") {
            this._addStringSegement(segment);
        }
        else if (typeof segment === "function") {
            const bracketPrefix = segment["$$BracketPrefix"];
            if (segment["$$isIndent"]) {
                const indentFunction = segment;
                this.state.currentContext = this;
                indentFunction();
                this.state.currentContext = this.parent;
                if (this.children.length > 0) {
                    for (let i = 0; i < this.children.length; i++) {
                        const childContext = this.children[i];
                        const childLines = childContext.generateLines();
                        for (let j = 0; j < childLines.length - 1; j++) {
                            this.cache.push(this.config.indent + childLines[j]);
                        }
                        if (bracketPrefix && i !== this.children.length - 1) {
                            this.cache.push(this.config.indent + childLines[childLines.length - 1] + bracketPrefix);
                        }
                        else {
                            this.cache.push(this.config.indent + childLines[childLines.length - 1]);
                        }
                    }
                }
                else {
                    this._addStringSegement(this.config.EOL);
                }
                this.children = [];
            }
            else {
                const codeFunction = segment;
                this._processCodeFunction(codeFunction);
            }
        }
    }
    _processCodeFunction(codeFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield codeFunction(this);
            const currentCodeFunctionCachce = this.codeFunctionCache;
            for (let segment of currentCodeFunctionCachce) {
                if (typeof segment === "string") {
                    this._addStringSegement(segment);
                }
                else {
                    this.codeFunctionCache = [];
                    yield this._processCodeFunction(segment);
                }
            }
        });
    }
    _addStringSegement(text) {
        if (this.config.EOL === text) {
            this._finishCurrentLine();
        }
        else {
            this.currentLine.push(text);
        }
    }
    _finishCurrentLine() {
        this.cache.push(this.currentLine.join(""));
        this.currentLine = [];
    }
}
exports.ContextImpl = ContextImpl;
const config = {
    indent: "  ",
    EOL: "\n",
    brackets: {
        "{": {
            prefixIfNotFirst: ",",
            rightBracket: "}"
        },
        "(": {
            prefixIfNotFirst: ",",
            rightBracket: ")"
        }
    },
    body: {
        start: " {",
        end: "}"
    }
};
//# sourceMappingURL=ContextImpl.js.map