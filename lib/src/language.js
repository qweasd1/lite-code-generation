"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    }
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
    }
};
//# sourceMappingURL=language.js.map