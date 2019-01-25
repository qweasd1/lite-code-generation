"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function withInitIndent(indent) {
    this.initIndent = indent;
    return this;
}
exports.typescript = {
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
    },
    withInitIndent
};
exports.javascript = exports.typescript;
exports.python = {
    indent: "  ",
    EOL: "\n",
    brackets: {
        "": {
            prefixIfNotFirst: ", ",
            rightBracket: ""
        },
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
        start: ":",
        end: ""
    },
    withInitIndent
};
//# sourceMappingURL=language.js.map