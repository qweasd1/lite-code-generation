"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ContextBuilder_1 = require("./ContextBuilder");
function generate(language, code) {
    const builder = new ContextBuilder_1.ContextBuilder(language);
    code(builder.create());
    return builder.generateCode();
}
exports.generate = generate;
//# sourceMappingURL=syntax.js.map