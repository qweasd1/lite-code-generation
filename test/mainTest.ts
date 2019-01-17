import {ContextImpl} from "../src/ContextImpl";
import {CodeGenerationConfig, Context, State} from "../src/Interface";
import {ContextBuilder} from "../src/ContextBuilder";
import {generate} from "../src/syntax";
import {python, typescript} from "../src/language";

const tsConfig: CodeGenerationConfig = {
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


async function attachment(ctx: Context) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      ctx.if(true, ";")
      ctx.if(true, ";")
      ctx.if(true, ";")

      resolve()
    }, 1000)
  })

}

it('should pass', async function () {
  const state: State = {
    currentIndentCount: 0,
    currentContext: null
  }

  const ctx = new ContextImpl("class aa ", tsConfig, state, null)
  ctx.body(() => {
    const subctx = new ContextImpl("constructor", tsConfig, state, ctx)
    subctx.bracket("(", () => {
      new ContextImpl("private name:string", tsConfig, state, subctx)
      new ContextImpl("private age:number", tsConfig, state, subctx)
      new ContextImpl("private other:number", tsConfig, state, subctx)
    })
    subctx.body(() => {
      new ContextImpl("other", tsConfig, state, subctx)
      new ContextImpl("let t = ", tsConfig, state, subctx).bracket("[", () => {

      })
    })

  })
  let text = await ctx.generate()


  expect(text).toEqual("aa\n\n")
});

it('should pass', async function () {
  const state: State = {
    currentIndentCount: 0,
    currentContext: null
  }

  const ctx = new ContextImpl("class aa ", tsConfig, state, null)
  ctx.body(() => {
    const subctx = new ContextImpl("constructor", tsConfig, state, ctx)
    subctx.bracket("(", () => {
      new ContextImpl("private name:string", tsConfig, state, subctx)
      new ContextImpl("private age:number", tsConfig, state, subctx)
      new ContextImpl("private other:number", tsConfig, state, subctx)
    })
    subctx.body(() => {
      new ContextImpl("other", tsConfig, state, subctx)
      new ContextImpl("let t = ", tsConfig, state, subctx).bracket("[", () => {

      })
    })

  })
  let text = await ctx.generate()


  expect(text).toEqual("aa\n\n")
});

async function tt(ctx: Context) {
  ctx.append("some").append(":type")
  return new Promise((resolve, reject) => {
    setTimeout(() => {

      resolve()
    }, 100)
  })
}

it('use typescript builder', async function () {
  const builder = new ContextBuilder(tsConfig)
  const ctx = builder.create()

  ctx("import {A} from 'a'").append(";")
  ctx("import ").ibracket("{").if(true, "A").if(true, "B").ibracketEnd().append(" from 'some-module'")
  ctx("import {B} from 'b'").newLine(1)

  ctx("@Module").bracket("{", () => {
    ctx("providers:").bracket("[", () => {
      ctx("HttpService")
    })
    ctx("components:").bracket("[", () => {
      ctx("AComponent")
      ctx("BComponent")
    })
  })
  ctx("class SomeModule").body(() => {
    ctx()

    ctx("constructor").bracket("(", () => {
      ctx("private http:HttpClient")
      ctx("private route:Route")
    }).body(() => {

    })

    ctx("some").ibracket("(").append("a").append("c").ibracketEnd().append(": Promise<string>").body(() => {

    })

    ctx("@Input()")
    ctx("name:string").newLine(1)

    ctx("@Input()")
    ctx("another:string").newLine(1)

  })

  expect(await builder.generateCode()).toEqual("")
});

it('use python builder', async function () {

  const code = await generate(python,(ctx)=>{
    ctx("import ").ibracket("").if(true, "a").if(true, "b").ibracketEnd().append(" from some-module").newLine(1)

    ctx("class SomeModule").body(() => {

      ctx("def __init__").ibracket("(").append("self").append("a").ibracketEnd().body(()=>{
        ctx("self.a = a")
      })

      ctx("@log")
      ctx("def test").ibracket("(").append("self").ibracketEnd().body(()=>{
        ctx("if (true)").body(()=>{
          ctx("return self.a")
        })

      })

    })

  })

  expect(code).toEqual("")
});

it('use if else', async function () {

  const options = [{name: "id", type: "int", isPrimary: true, isGenerated: true}, {name: "nam", type: "string"}]
  const code = await generate(typescript,(ctx)=>{
    for(let column of options){
      ctx("@").if(column.isGenerated,"PrimaryGeneratedColumn").elseIf(column.isPrimary,"PrimaryColumn").else("Column").append("()")
      ctx(`${column.name}:${column.type}`).newLine()
    }
  })

  expect(code).toEqual("")
});