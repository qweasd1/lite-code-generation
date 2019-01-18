import {BodyFunction, BracketConfig, CodeFunction, CodeGenerationConfig, CodeLike, Context, State} from "./Interface";

export class ContextImpl implements Context {


  public children: Context[] = []

  ifCondition: boolean = false


  isIBracket: boolean = false
  isIBracketFirst: boolean = false
  currentBracketConfig: BracketConfig

  codeFunctionCache = []

  constructor(
    segement: undefined | null | CodeLike,
    public config: CodeGenerationConfig,
    public state: State,
    public parent: Context
  ) {
    if (!segement) {
      segement = ""
    }


    if (parent) {
      parent.children.push(this)
    }

    this._add([segement])


  }


  if(condition: boolean, ...code: CodeLike[]): Context {
    if (condition) {
      this._add(code)
      this.ifCondition = true
    }
    else {
      this.ifCondition = false
    }
    return this;
  }

  elseIf(condition: boolean, ...code: CodeLike[]): Context {
    if (!this.ifCondition && condition) {
      this._add(code)
      this.ifCondition = true
    }
    else {
      this.ifCondition = false
    }
    return this;
  }

  ifAll(condition: boolean[], ...code: CodeLike[]): Context {
    let hasFalse = false
    for (let c of condition) {
      if (!c) {
        hasFalse = true
        break
      }
    }
    if (!hasFalse) {
      this._add(code)
      this.ifCondition = true
    }
    else {
      this.ifCondition = false
    }
    return this
  }

  ifAny(condition: boolean[], ...code: CodeLike[]): Context {
    if (condition.some(x => x)) {
      this._add(code)
      this.ifCondition = true
    }
    else {
      this.ifCondition = false
    }
    return this
  }


  else(...code: CodeLike[]): Context {
    if (!this.ifCondition) {
      this._add(code)
    }
    return this;
  }

  bracket(char: string, content: BodyFunction): Context {
    content["$$isIndent"] = true
    content["$$BracketPrefix"] = this.config.brackets[char].prefixIfNotFirst
    this._add([char, this.config.EOL, content, this.config.brackets[char].rightBracket])
    // this.segements.push(char)
    // this.segements.push(this.config.EOL)
    // this.segements.push(content)
    // this.segements.push(this.config.brackets[char].rightBracket)
    return this;
  }

  body(content: BodyFunction): Context {
    content["$$isIndent"] = true
    this._add([this.config.body.start, this.config.EOL, content, this.config.body.end])
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

  ibracket(char: string): Context {

    const bracketConfig = this.config.brackets[char]
    if (!bracketConfig) {
      throw new Error(`no config for bracket: ${char}`)
    }
    this._add([char])
    this.currentBracketConfig = bracketConfig
    this.isIBracket = true
    this.isIBracketFirst = true

    return this;
  }

  ibracketEnd(): Context {
    this.isIBracket = false
    this.isIBracketFirst = false

    this._add([this.currentBracketConfig.rightBracket])
    this.currentBracketConfig = null
    return this
  }

  append(...text: CodeLike[]): Context {
    this._add(text)
    return this
  }


  newLine(n: number = 1): Context {
    for (let i = 0; i < n; i++) {
      this._finishCurrentLine()
    }
    return this;
  }

  generate(): string {
    return this.generateLines().join(this.config.EOL)
  }

  public generateLines(): string[] {

    this.cache.push(this.currentLine.join(""))

    // add indent
    // const result = this.cache.map(line => this.indent + line)
    const result = this.cache

    this.codeFunctionCache = []

    return result
  }

  private cache = []
  private currentLine = []

  private _add(codes: CodeLike[]) {
    if (this.isIBracket) {
      if (this.isIBracketFirst) {
        this.isIBracketFirst = false
      }
      else {
        this._addStringSegement(this.currentBracketConfig.prefixIfNotFirst)
      }
    }

    for (let codeLike of codes) {
      this._processSegement(codeLike)
    }

  }

  private _processSegement(segment: CodeLike) {
    if (typeof segment === "string") {
      this._addStringSegement(segment)
    }
    else if (typeof segment === "function") {
      const bracketPrefix = segment["$$BracketPrefix"]

      if (segment["$$isIndent"]) {
        const indentFunction = segment as BodyFunction
        this.state.currentContext = this
        indentFunction()
        this.state.currentContext = this.parent

        if (this.children.length > 0) {
          for (let i = 0; i < this.children.length; i++) {
            const childContext = this.children[i]
            const childLines = childContext.generateLines()
            for (let j = 0; j < childLines.length - 1; j++) {
              this.cache.push(this.config.indent + childLines[j])
            }

            if (bracketPrefix && i !== this.children.length - 1) {
              this.cache.push(this.config.indent + childLines[childLines.length - 1] + bracketPrefix)
            }
            else {
              this.cache.push(this.config.indent + childLines[childLines.length - 1])
            }
          }

        }
        else {
          this._addStringSegement(this.config.EOL)
        }
        this.children = []
      }
      else {
        const codeFunction = segment as CodeFunction
        this._processCodeFunction(codeFunction)
      }

    }
  }


  private async _processCodeFunction(codeFunction: CodeFunction) {
    await codeFunction(this)
    const currentCodeFunctionCachce = this.codeFunctionCache
    for (let segment of currentCodeFunctionCachce) {
      if (typeof segment === "string") {
        this._addStringSegement(segment)
      }
      else {
        this.codeFunctionCache = []
        await this._processCodeFunction(segment)
      }
    }
  }

  private _addStringSegement(text: string) {
    if (this.config.EOL === text) {
      this._finishCurrentLine()
    }
    else {
      this.currentLine.push(text)
    }
  }

  private _finishCurrentLine() {
    this.cache.push(this.currentLine.join(""))
    this.currentLine = []
  }

}

const config: CodeGenerationConfig = {
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
}

