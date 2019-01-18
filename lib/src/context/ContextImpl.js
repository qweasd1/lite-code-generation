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
        this.segements = [];
        this.children = [];
        this.ifCondition = false;
        this.isGenerating = false;
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
        this.segements.push(segement);
        this.indent = this.config.indent.repeat(this.state.currentIndentCount);
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
    ifAll(condition, ...code) {
        if (condition.find(x => !x) === undefined) {
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
        this.segements.push(char);
        this.segements.push(this.config.EOL);
        this.segements.push(content);
        this.segements.push(this.config.brackets[char].rightBracket);
        return this;
    }
    body(content) {
        content["$$isIndent"] = true;
        this.segements.push(this.config.body.start);
        this.segements.push(this.config.EOL);
        this.segements.push(content);
        this.segements.push(this.config.body.end);
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
    newLine(n) {
        for (let i = 0; i < n; i++) {
            this.segements.push(this.config.EOL);
        }
        return this;
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.generateLines()).join(this.config.EOL);
        });
    }
    _add(code) {
        if (this.isIBracket) {
            if (this.isIBracketFirst) {
                this.isIBracketFirst = false;
            }
            else {
                code.unshift(this.currentBracketConfig.prefixIfNotFirst);
            }
        }
        if (this.isGenerating) {
            this.codeFunctionCache.push(...code);
        }
        else {
            this.segements.push(...code);
        }
    }
    generateLines() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache = [];
            this.currentLine = [];
            this.isGenerating = true;
            for (let segment of this.segements) {
                if (typeof segment === "string") {
                    this._addStringSegement(segment);
                }
                else if (typeof segment === "function") {
                    const bracketPrefix = segment["$$BracketPrefix"];
                    if (segment["$$isIndent"]) {
                        const indentFunction = segment;
                        this.state.currentIndentCount += 1;
                        this.state.currentContext = this;
                        yield indentFunction();
                        this.state.currentIndentCount -= 1;
                        this.state.currentContext = this.parent;
                        if (this.children.length > 0) {
                            for (let i = 0; i < this.children.length; i++) {
                                const childContext = this.children[i];
                                const childLines = yield childContext.generateLines();
                                for (let j = 0; j < childLines.length - 1; j++) {
                                    this.cache.push(childLines[j]);
                                }
                                if (bracketPrefix && i !== this.children.length - 1) {
                                    this.cache.push(childLines[childLines.length - 1] + bracketPrefix);
                                }
                                else {
                                    this.cache.push(childLines[childLines.length - 1]);
                                }
                            }
                        }
                        else {
                            this._addStringSegement(this.config.EOL);
                        }
                        this.children = [];
                    }
                    else {
                        const indentFunction = segment;
                        yield indentFunction(this);
                        for (let segment of this.codeFunctionCache) {
                            this._addStringSegement(segment);
                        }
                        this.codeFunctionCache = [];
                    }
                }
            }
            this.cache.push(this.currentLine.join(""));
            // add indent
            const result = this.cache.map(line => this.indent + line);
            this.isGenerating = false;
            return Promise.resolve(result);
        });
    }
    _addStringSegement(text) {
        if (this.config.EOL === text) {
            this.cache.push(this.currentLine.join(""));
            this.currentLine = [];
        }
        else {
            this.currentLine.push(text);
        }
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
// async function test(){
//   const state: State = {
//     currentIndentCount: 0
//   }
//   const ctx = new ContextImpl("aa ", config, state, null, null)
//   ctx.body(() => {
//     const subctx = new ContextImpl("function test() ", config, state, ctx, null)
//     subctx.bracket("(",()=>{
//       new ContextImpl("name", config, state, subctx, null)
//       new ContextImpl("age", config, state, subctx, null)
//     })
//     subctx.body(() => {
//       new ContextImpl("other", config, state, subctx, null)
//     })
//
//   })
//   let text = await ctx.generate()
// let t= 1
//
// }
// test()
//# sourceMappingURL=ContextImpl.js.map