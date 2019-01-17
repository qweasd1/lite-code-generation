import {CodeGenerationConfig} from "./Interface";

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
  }
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
  }
}

