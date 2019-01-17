import {BodyFunction, BracketConfig, CodeFunction, CodeGenerationConfig, CodeLike, Context, State} from "./Interface";

export class ContextImpl implements Context {

  segements: CodeLike[] = []
  public children: Context[] = []
  public indent: string

  ifCondition: boolean = false

  isGenerating: boolean = false
  isIBracket:boolean = false
  isIBracketFirst:boolean = false
  currentBracketConfig:BracketConfig

  generatingCache = []

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
    this.indent = this.config.indent.repeat(this.state.currentIndentCount)
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

  elseIf(condition: boolean,...code: CodeLike[]):Context {
    if(!this.ifCondition && condition){
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
    for(let c of condition){
      if(!c){
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
    this.segements.push(char)
    this.segements.push(this.config.EOL)
    this.segements.push(content)
    this.segements.push(this.config.brackets[char].rightBracket)
    return this;
  }

  body(content: BodyFunction): Context {
    content["$$isIndent"] = true
    this.segements.push(this.config.body.start)
    this.segements.push(this.config.EOL)
    this.segements.push(content)
    this.segements.push(this.config.body.end)
    return this;
  }

  //
  // ibody(content: BodyFunction): Context {
  //   return this;
  // }

  ibracket(char: string): Context {

    const bracketConfig = this.config.brackets[char]
    if(!bracketConfig){
      throw new Error(`no config for bracket: ${char}`)
    }
    this._add([char])
    this.currentBracketConfig = bracketConfig
    this.isIBracket = true
    this.isIBracketFirst = true

    return this;
  }

  ibracketEnd():Context {
    this.isIBracket = false
    this.isIBracketFirst = false

    this._add([this.currentBracketConfig.rightBracket])
    this.currentBracketConfig = null
    return this
  }

  append(...text:CodeLike[]):Context{
    this._add(text)
    return this
  }


  newLine(n: number = 1): Context {
    for (let i = 0; i < n; i++) {
      this.segements.push(this.config.EOL)
    }
    return this;
  }

  async generate(): Promise<string> {

    return (await this.generateLines()).join(this.config.EOL)
  }

  private _add(code: CodeLike[]) {
    if(this.isIBracket){
      if(this.isIBracketFirst){
        this.isIBracketFirst = false
      }
      else {
        code.unshift(this.currentBracketConfig.prefixIfNotFirst)
      }
    }
    if (this.isGenerating) {
      this.generatingCache.push(...code)
    }
    else {
      this.segements.push(...code)
    }
  }

  private cache = []
  private currentLine = []

  public async generateLines(): Promise<string[]> {
    this.cache = []
    this.currentLine = []
    this.isGenerating = true

    for (let segment of this.segements) {
      if (typeof segment === "string") {
        this._addStringSegement(segment)
      }
      else if (typeof segment === "function") {
        const bracketPrefix = segment["$$BracketPrefix"]

        if (segment["$$isIndent"]) {
          const indentFunction = segment as BodyFunction
          this.state.currentIndentCount += 1
          this.state.currentContext = this
          await indentFunction()
          this.state.currentIndentCount -= 1
          this.state.currentContext = this.parent

          if (this.children.length > 0) {
            for (let i = 0; i < this.children.length; i++) {
              const childContext = this.children[i]
              const childLines = await childContext.generateLines()
              for (let j = 0; j < childLines.length - 1; j++) {
                this.cache.push(childLines[j])
              }

              if (bracketPrefix && i !== this.children.length - 1) {
                this.cache.push(childLines[childLines.length - 1] + bracketPrefix)
              }
              else {
                this.cache.push(childLines[childLines.length - 1])
              }
            }

          }
          else {
            this._addStringSegement(this.config.EOL)
          }
          this.children = []
        }
        else {
          const indentFunction = segment as CodeFunction
          await indentFunction(this)
          for (let segment of this.generatingCache) {
            this._addStringSegement(segment)
          }
          this.generatingCache = []
        }

      }
    }

    this.cache.push(this.currentLine.join(""))

    // add indent

    const result = this.cache.map(line => this.indent + line)

    this.isGenerating = false

    return Promise.resolve(result)
  }

  private _addStringSegement(text: string) {
    if (this.config.EOL === text) {
      this.cache.push(this.currentLine.join(""))
      this.currentLine = []
    }
    else {
      this.currentLine.push(text)
    }
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
  body:{
    start:" {",
    end:"}"
  }
}

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