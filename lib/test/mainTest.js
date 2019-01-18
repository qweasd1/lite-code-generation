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
const ContextImpl_1 = require("../src/ContextImpl");
const ContextBuilder_1 = require("../src/ContextBuilder");
const syntax_1 = require("../src/syntax");
const language_1 = require("../src/language");
const tsConfig = {
    indent: "  ",
    EOL: "\n",
    brackets: {
        "{": {
            prefixIfNotFirst: ", ",
            rightBracket: "}"
        },
        "(": {
            prefixIfNotFirst: ", ",
            rightBracket: ")"
        },
        "[": {
            prefixIfNotFirst: ", ",
            rightBracket: "]"
        }
    },
    body: {
        start: " {",
        end: "}"
    }
};
// const pyConfig: CodeGenerationConfig = {
//   indent: "  ",
//   EOL: "\n",
//   brackets: {
//     "": {
//       prefixIfNotFirst: ", ",
//       rightBracket: ""
//     },
//     "{": {
//       prefixIfNotFirst: ", ",
//       rightBracket: "}"
//     },
//     "(": {
//       prefixIfNotFirst: ", ",
//       rightBracket: ")"
//     },
//     "[": {
//       prefixIfNotFirst: ", ",
//       rightBracket: "]"
//     }
//   },
//   body: {
//     start: ":",
//     end: ""
//   }
// }
function attachment(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                ctx.if(true, ";");
                ctx.if(true, ";");
                ctx.if(true, ";");
                resolve();
            }, 1000);
        });
    });
}
it('should pass', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const state = {
            currentContext: null
        };
        const ctx = new ContextImpl_1.ContextImpl("class aa ", tsConfig, state, null);
        ctx.body(() => {
            const subctx = new ContextImpl_1.ContextImpl("constructor", tsConfig, state, ctx);
            subctx.bracket("(", () => {
                new ContextImpl_1.ContextImpl("private name:string", tsConfig, state, subctx);
                new ContextImpl_1.ContextImpl("private age:number", tsConfig, state, subctx);
                new ContextImpl_1.ContextImpl("private other:number", tsConfig, state, subctx);
            });
            subctx.body(() => {
                new ContextImpl_1.ContextImpl("other", tsConfig, state, subctx);
                new ContextImpl_1.ContextImpl("let t = ", tsConfig, state, subctx).bracket("[", () => {
                });
            });
        });
        let text = yield ctx.generate();
        expect(text).toEqual("aa\n\n");
    });
});
it('should pass', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const state = {
            currentContext: null
        };
        const ctx = new ContextImpl_1.ContextImpl("class aa ", tsConfig, state, null);
        ctx.body(() => {
            const subctx = new ContextImpl_1.ContextImpl("constructor", tsConfig, state, ctx);
            subctx.bracket("(", () => {
                new ContextImpl_1.ContextImpl("private name:string", tsConfig, state, subctx);
                new ContextImpl_1.ContextImpl("private age:number", tsConfig, state, subctx);
                new ContextImpl_1.ContextImpl("private other:number", tsConfig, state, subctx);
            });
            subctx.body(() => {
                new ContextImpl_1.ContextImpl("other", tsConfig, state, subctx);
                new ContextImpl_1.ContextImpl("let t = ", tsConfig, state, subctx).bracket("[", () => {
                });
            });
        });
        let text = yield ctx.generate();
        expect(text).toEqual("aa\n\n");
    });
});
function tt(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.append("some").append(":type");
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 100);
        });
    });
}
it('use typescript builder', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const builder = new ContextBuilder_1.ContextBuilder(tsConfig);
        const ctx = builder.create();
        ctx("import {A} from 'a'").append(";");
        ctx("import ").ibracket("{").if(true, "A").if(true, "B").ibracketEnd().append(" from 'some-module'");
        ctx("import {B} from 'b'").newLine(1);
        ctx("@Module").bracket("{", () => {
            ctx("providers:").bracket("[", () => {
                ctx("HttpService");
            });
            ctx("components:").bracket("[", () => {
                ctx("AComponent");
                ctx("BComponent");
            });
        });
        ctx("class SomeModule").body(() => {
            ctx();
            ctx("constructor").bracket("(", () => {
                ctx("private http:HttpClient");
                ctx("private route:Route");
            }).body(() => {
            });
            ctx("some").ibracket("(").append("a").append("c").ibracketEnd().append(": Promise<string>").body(() => {
            });
            ctx("@Input()");
            ctx("name:string").newLine(1);
            ctx("@Input()");
            ctx("another:string").newLine(1);
        });
        expect(yield builder.generateCode()).toEqual("");
    });
});
it('use python builder', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const code = yield syntax_1.generate(language_1.python, (ctx) => {
            ctx("import ").ibracket("").if(true, "a").if(true, "b").ibracketEnd().append(" from some-module").newLine(1);
            ctx("class SomeModule").body(() => {
                ctx("def __init__").ibracket("(").append("self").append("a").ibracketEnd().body(() => {
                    ctx("self.a = a");
                });
                ctx("@log");
                ctx("def test").ibracket("(").append("self").ibracketEnd().body(() => {
                    ctx("if (true)").body(() => {
                        ctx("return self.a");
                    });
                });
            });
        });
        expect(code).toEqual("");
    });
});
it('use if else', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const options = [{ name: "id", type: "int", isPrimary: true, isGenerated: true }, { name: "nam", type: "string" }];
        const code = yield syntax_1.generate(language_1.typescript, (ctx) => {
            for (let column of options) {
                ctx("@").if(column.isGenerated, "PrimaryGeneratedColumn").elseIf(column.isPrimary, "PrimaryColumn").else("Column").append("()");
                ctx(`${column.name}:${column.type}`).newLine();
            }
        });
        expect(code).toEqual("");
    });
});
it('conditional bracket object', function () {
    return __awaiter(this, void 0, void 0, function* () {
        const code = syntax_1.generate(language_1.typescript, (ctx) => {
            ctx("@callSomeMethod(").if(true, (c) => {
                c.bracket("{", () => {
                    ctx("name: 'some'");
                    ctx("other").bracket("{", () => {
                        ctx("other:").bracket("{", () => {
                            ctx("other:2");
                        });
                        ctx("other:1");
                        ctx("other:1");
                    });
                });
            }).append(")");
            ctx("field:string").newLine(1);
        });
        expect(code).toEqual("");
    });
});
//# sourceMappingURL=mainTest.js.map