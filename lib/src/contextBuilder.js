"use strict";
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
        const result = [];
        for (let rootContext of this.rootContexts) {
            result.push(...rootContext.generateLines());
        }
        return result.join(this.config.EOL);
    }
}
exports.ContextBuilder = ContextBuilder;
//# sourceMappingURL=ContextBuilder.js.map