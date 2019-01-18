import {generate} from "../src/syntax";
import {typescript} from "../src/language";

async function test(){
  const code = await generate(typescript,(ctx)=> {
    ctx("@callSomeMethod(").if(true, (c) => {
      c.bracket("{", () => {
        ctx("name: 'some'")
      })
    }).append(")")
    ctx("field:string").newLine(1)
  })
  console.log(code);
}

test()
