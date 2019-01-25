import {CodeGenerationConfig} from "./Interface";

function withInitIndent(indent: string) {
  this.initIndent = indent
  return this
}

export let typescript:CodeGenerationConfig = {
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
}

export let javascript:CodeGenerationConfig = typescript

export let python:CodeGenerationConfig = {
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
}

