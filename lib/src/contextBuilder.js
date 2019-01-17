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
const ContextImpl_1 = require("./ContextImpl");
class ContextBuilder {
    constructor(config) {
        this.config = config;
        this.rootContexts = [];
    }
    create() {
        const contextStack = [];
        const state = {
            currentIndentCount: 0,
            currentContext: null
        };
        let result = (text = "") => {
            let newContext;
            const context = new ContextImpl_1.ContextImpl(text, this.config, state, state.currentContext);
            if (!context.parent) {
                this.rootContexts.push(context);
            }
            return context;
        };
        return result;
    }
    generateCode() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            for (let rootContext of this.rootContexts) {
                result.push(...yield rootContext.generateLines());
            }
            return result.join(this.config.EOL);
        });
    }
}
exports.ContextBuilder = ContextBuilder;
expor;
//# sourceMappingURL=contextBuilder.js.map