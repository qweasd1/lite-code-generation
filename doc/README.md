# Why build a new library for Code Generation?
The current Code generation solution has the following issues:

* hard to maintain format ( e.g., indent)
* hard to encapsulate reusable logic
* hard to reuse the same framework to generate code in different programming language.
* too complex to use sometimes

From my view, there are two kinds of code generation branch:
* string template based
* internal DSL based

To help you better understand it. We can see some samples:

### string template based solution

```typescript
// see the following Template Strings which is from ES2015 specification.

let name = "Person"
let fieldNameA = "name"
let fieldNameB = "age"


`class ${name} {
  ${fieldNameA}:string
  ${fieldNameB}:number
}
`

// we just replace the varialbe and get the following:
`class Person {
  name:string
  age:number
}
`
```
As we could see in above, the template based solution is very good for
scenario which has a quite fixed code structure and you just need to replace
some placeholder inside it. However, when you want to use loop, conditional generation logic and some other cases (see below),
it will be very hard to maintain the format of the code.

```typescript
// if the following value is true, we should generate field "name", otherwise we should generate field "age"
let generateNameOtherwiseAge = false

// other string fields
let otherFields = ["firstname","lastname"]

`class ${name}{
    ${generateNameOtherwiseAge ? "name" : "age"}: ${generateNameOtherwiseAge ? "string": "number"}
    ${otherFields.map(field=>field + ":string").join("\n  ")} // to maintain the indent format, we need to calculate the indent manually here.
}
`

// when generate list, function params like structure, it's hard to use template string based solution
// we use the "implement" classes as an example

let interfacesToImplement = ["InterfaceA","InterfaceB"]
`class ${name}${interfacesToImplement.length > 0 :` implements ${interfacesToImplement.join(",")}`:""}`{

}

// as you can see above, the **implements** keyword only appear when the **interfacesToImplement** array is not empty.


// Finally, it's really really hard to encapsulate reusuable logic because of the indent format
// e.g. I want to use a function to generate begin and end of a function call like following in code.

// this is the encapsulation logic
function log(callingFunction){
  return `console.log('${callingFunction}' + " start")
${callingFunction}
console.log('${callingFunction}' + " end")
`
}

// this is where we call it
`function test(){
  let x = 1
  ${log("some(1, 2, 3)")}
  if (x > 0){
    ${log(another(4,5,6))}
  }
}

// you expect it will generate the following
`function test(){
  let x = 1
  console.log('some(1, 2, 3)' + " start")
  some(1, 2, 3)
  console.log('some(1, 2, 3)' + " end")
  if (x > 0){
    console.log('another(4,5,6)' + " start")
    another(4,5,6)
    console.log('another(4,5,6)' + " end")
  }
}
`

// but will get ( the indent is not correct!)
`function test(){
  let x = 1
  console.log('some(1, 2, 3)' + " start")
some(1, 2, 3)
console.log('some(1, 2, 3)' + " end")
  if (x > 0){
    console.log('another(4,5,6)' + " start")
another(4,5,6)
console.log('another(4,5,6)' + " end")
  }
}
`

```

In general, we could see it's easy to use template string way to generate code
in simple case, but hard to use it for complex case (conditional generation, loop and encapsulation).

### Another Solution - Internal DSL
An Interal DSL is a mini language to mimic another language inside its host. Can we write
code which generate Typescript/Javascript especially like Typescript itself?
We could. You can see one of my previous project **[create-ts-code](https://github.com/qweasd1/create-ts-code)**

let me just show some of the code samples here:
```typescript
generateCode(({$class, $annotation, $method, $from, $line, $constructor, $field, $array_, $let, $$annotation})=>{
    const isInit = true
    $from("angular/core").imports("Component").if(isInit).imports("OnInit")

    $line(2)

    $annotation("Component",{
      selector:"'some-selector'",
      html:"'template.html'"
    })
    $class("SomeComponent").loads(lifecyleImplements({OnInit:true,OnDestroy:true})).body(()=>{
      $line()
      $$annotation("Log")
      $field("subs:ISubscription[] = []")
      $field("subs:ISubscription[] = []")

      $line()
      $constructor(
        "private http:httpClient"
      ).argsMultiline().body(()=>{

      })

      $line()
      $method("ngOnInit")

      $line()
      $let("some").equals($array_("1","2").loads((array)=>{
        array.push("3","4")
      }))


    })

  }))
```
I use the above code to generate a Angular Component. As you can see it looks
very similar as typescript code and this library can generate the format very well.
the loads function can load encapsulate function which contain complex code generation logic (if you use d3, you should be familiar with such
kind of encapsulation logic)

The problem with such kind of code generation library is it's binding to a
specific language so much and sometimes too verbose. keyword like **constructor**
is common for typescript and javascript for constructor function, but for java,
it's the **Class name**, for python it's **__init__**. This also applies for keyword
like **let**, **const**, **var**. So, if we use such kind of code generation library
for other language, we need to write adapter for other language to match their syntax which is
not that trivial. You could check the adapter for typescript in **create-ts-code**.

### So... What's next?
The short come of **create-ts-code** drives me to think how to design
a 'lite' but 'flexible' code generation tool and the result is this library: lite-code-generation.



### A Quick Tutorial

> installation
```bash
npm i lite-code-generation
```

> generate your first code
```typescript
import {generate,typescript} from 'lite-code-generation'
async main(){
  const code = await generate(typescript,(ctx)=>{
    ctx("console.log('hello world!')")
  })

  console.log(code)
}
main()

// this will generate
`console.log('hello world!')`
```

> append text
```typescript
ctx("console('hello')").append(';') // the append just append the following string into the current context

```

> add newline
```
ctx("let t = 1").newline(2) // you can give how many extra newline you want
ctx("let t2 = 2")
// this will generate
let t = 1


let t2 = 2
```

> generate code with right indent format (we will omit the main function for the following samples)
```typescript
const code = await generate(typescript,(ctx)=>{
    ctx("function test(name,age)").body(()=>{ // every time you use body, it will add indent inside it
      ctx("console.log(name,age)")
    })
  })

// this will generate
function test(name,age) {
  console.log(name,age)
}
```

> conditional generation
```typescript
const code = await generate(typescript,(ctx)=>{
    const interfaces = {
        "OnInit":true,
        "OnDestroy:false"
    }
    ctx("class Some").ifAny(Object.values(interfaces)," implements").if(interfaces.OnInit," OnInit").if(interfaces.OnDestroy, " OnDestroy").body(()=>{ // every time you use body, it will add indent inside it

    })
  })

// this will generate
class Some extends OnInit {

}
```

> bracket structure
```
// the bracket structure appears in nearly every programming languages
// a bracket structure start with barcket, concat the inner parameters with delmieter like "," and end with the close bracket
// e.g. array in typescript is a bracket structure [1,2,3]
// e.g. object in typescript is also a bracket strucutre {a:1,b:2}
// e.g. function call in nearly every programming language is a bracket structure: someFunction(a,b,c)
// to generate bracket structure easily, we have two specific method for bracket structure

// the first one is multiline bracket structure .bracket(bracketStartChar,body)
// e.g.
const code = await generate(typescript,(ctx)=>{
    ctx("let t = ").bracket("[",()=>{
        ctx("1")
        ctx("2")
        ctx("3 + 4")
    )

    ctx()
  })

// this will generate
let t = [
  1,
  2,
  3 + 4
]

// the seoncd one is 1 line bracket structure .ibracket(bracketStartChar).append("a").append("b").ibracketEnd()
// e.g.
const code = await generate(typescript,(ctx)=>{
    ctx("test").ibracket("(").append("a").append("b").ibracketEnd()

// this will generate
test(a,b)


```

> body structure
```typescript
// body structure is generated when you call the .body(()=>{}) method
ctx("if (somethingTrue)").body(()=>{
  ctx("let t = 1")
}).newline(1)

ctx("class A").body(()=>{
  ctx("name:string")
  ctx("age:number")
})

// this will generate
if(somethingTrue) {
  let t = 1
}

class A {
  name:string
  age:number
}

```

> bracket structure + conditional generation
```typescript
// actually, you can use bracket structure wit hconditional code generation together


const dependencies = {
  "HttpClient":ture,
  "Route":false,
  "OtherService":true
}
ctx("constructor").bracket("(",()=>{
  ctx().if(dependencies.HttpClient,"private http:HttpClient")
  ctx().if(dependencies.Route,"private route:Route")
  ctx().if(dependencies.OtherService,"private other:OtherService")
}).body(()=>{
})

// this will generate
constructor(
  private http:HttpClient,
  private other:OtherService
){

}

```

> encasuplate logic
```typescript
// when you use append(text), if(condition,text),you can actually give a function to text parameter
// the function will like (context)=>{}
// the context is the return value of ctx()
// let's use an example to explain

const dependencies = {
  "HttpClient":ture,
  "Route":false,
  "OtherService":true
}

// camelize the variable name: SomeService=>someService
function camelize(){...}

function addDependencies(dependencies){

  return function(context){
    for(let key of Object.keys(dependencies)){
      context.if(dependencies[key],`private ${camelize(key)}:${key}`)
    }
  }
}

ctx("constructor").ibracket("(").append(addDependencies(dependencies)).body(()=>{

}).ibracketEnd()

// this will generate
constructor(private http:HttpClient, private other:OtherService){

}

```

__________________________

To be continue...

> Multi Language support
```
// just change the code generation config you pass to the generate() method
try python
```

> Async function call
```
// all the function you call can be an async function, so you can load meta data from remote service and then generate the code
```










