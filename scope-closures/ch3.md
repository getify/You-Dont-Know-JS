# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 3: Working With Scope

| NOTE: |
| :--- |
| Work in progress |

Through Chapters 1 and 2, we defined *lexical scope* as the set of rules (determined at compile time) for how the identifiers/variables in a program are organized into units of scope (functions, blocks), as well as how lookups of these identifiers works during run-time.

For conceptual understanding, lexical scope was illustrated with several metaphors: marbles & buckets (bubbles!), conversations, and a tall office building.

Now we'll dig into some of the nitty gritty details of working with lexical scope in our programs.

## Nested Scopes, Revisited

Again, recall our running example program:

```js
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getStudentName(studentID) {
    for (let student of students) {
        if (student.id == studentID) {
            return student.name;
        }
    }
}

var nextStudent = getStudentName(73);

console.log(nextStudent);
// Suzy
```

What color is the `students` variable reference in the `for`-loop?

In Chapter 2, we described the run-time access of a variable as a "lookup", where the *Engine* has to start by asking the current scope's *Scope Manager* if it knows about an identifier/variable, and proceeding upward/outward back through the chain of nested scopes (toward the global scope) until found, if ever. The lookup stops as soon as the first matching named declaration in a scope bucket is found.

The lookup process thus determines that `students` is a RED marble. And `studentID` in the `if`-statement is determined to be a BLUE marble.

### "Lookup" Is (Mostly) Conceptual

This description of the run-time lookup process works for conceptual understanding, but it's not generally how things work in practice.

The color of a marble (what bucket it comes from) -- the meta information of what scope a variable originates from -- is *usually* known during the initial compilation processing. Because of how lexical scope works, a marble's color will not change based on anything that can happen during run-time.

Since the marble's color is known from compilation, and it's immutable, this information will likely be stored with (or at least accessible from) each variable's entry in the AST; that information is then used in generating the executable instructions that constitute the program's run-time. In other words, *Engine* (from Chapter 2) doesn't need to lookup and figure out which scope bucket a variable comes from. That information is already known!

Avoiding the need for a run-time lookup is a key optimization benefit for lexical scope. Scope is fixed at author-time/compile-time, and unaffected by run-time conditions, so no run-time lookup is necessary. Run-time is operates more performantly without spending time on these lookups.

But I said "...usually known..." just now with respect to a marble's color determination during compilation. In what case would it *not* be known during compilation?

Consider a reference to a variable that isn't declared in any lexically available scopes in the current file -- see *Get Started*, Chapter 1, which asserts that each file is its own separate program from the perspective of JS compilation. If no declaration is found, that's not *necessarily* an error. Another file (program) in the run-time may indeed declare that variable in the shared global scope. So the ultimate determination of whether the variable was ever appropriately declared in some available bucket may need to be deferred to the run-time.

The take-away? Any reference to a variable in our program that's initially *undeclared* is left as an uncolored marble during that file's compilation; this color cannot be determined until other relevant file(s) have been compiled and the application run-time begins.

In that respect, some sort of run-time "lookup" for the variable would need to resolve the color of this uncolored marble. If the variable was eventually discovered in the global scope bucket, the color of the global scope thus applies. But this run-time deferred lookup would only be needed once at most, since nothing else during run-time could later change that marble's color.

| NOTE: |
| :--- |
| Chapter 2 "Lookup Failures" covers what happens if a marble remains uncolored as its reference is executed. |

### Shadowing

Our running example for these chapters uses different variable names across the scope boundaries. Since they all have unique names, in a way it wouldn't matter if all of them were just in one bucket (like RED).

Where having different lexical scope buckets starts to matter more is when you have two or more variables, each in different scopes, with the same lexical names. In such a case, it's very relevant how the different scope buckets are laid out.

Consider:

```js
var studentName = "Suzy";

function printStudent(studentName) {
    studentName = studentName.toUpperCase();
    console.log(studentName);
}

printStudent("Frank");
// FRANK

printStudent(studentName);
// SUZY

console.log(studentName);
// Suzy
```

| TIP: |
| :--- |
| Before you move on, take some time to analyze this code using the various techniques/metaphors we've covered in the book. In particular, make sure to identify the marble/bubble colors in this snippet. It's good practice! |

The `studentName` variable on line 1 (the `var studentName = ..` statement) creates a RED marble. The same named variable is declared as a BLUE marble on line 3, the parameter in the `printStudent(..)` function definition.

So the question is, what color marble is being referenced in the `studentName = studentName.toUpperCase()` statement, and indeed the next statement, `console.log(studentName)`? All 3 `studentName` references here will be BLUE. Why?

With the conceptual notion of the "lookup", we asserted that it starts with the current scope and works its way outward/upward, stopping as soon as a matching variable is found. The BLUE `studentName` is found right away. The RED `studentName` is never even considered.

This is a key component of lexical scope behavior, called *shadowing*. The BLUE `studentName` variable (parameter) shadows the RED `studentName`. So, the parameter shadows (or is shadowing) the shadowed global variable. Repeat that sentence to yourself a few times to make sure you have the terminology straight!

That's why the re-assignment of `studentName` affects only the inner (parameter) variable, the BLUE `studentName`, not the global RED `studentName`.

When you choose to shadow a variable from an outer scope, one direct impact is that from that scope inward/downward (through any nested scopes), it's now impossible for any marble to be colored as the shadowed variable (RED, in this case). In other words, any `studentName` identifier reference will mean that parameter variable, never the global `studentName` variable. It's lexically impossible to reference the global `studentName` anywhere inside of the `printStudent(..)` function (or any inner scopes it may contain).

#### Global Unshadowing Trick

It is still possible to access a global variable, but not through a typical lexical identifier reference.

In the global scope (RED), `var` declarations and `function`-declarations also expose themselves as properties (of the same name as the identifier) on the *global object* -- essentially an object representation of the global scope. If you've done JS coding in a browser environment, you probably identify the global object as `window`. That's not *entirely* accurate, but it's good enough for us to use in discussion for now. In a bit, we'll explore the global scope/object topic more.

Consider this program, specifically executed as a standalone .js file in a browser environment:

```js
var studentName = "Suzy";

function printStudent(studentName) {
    console.log(studentName);
    console.log(window.studentName);
}

printStudent("Frank");
// "Frank"
// "Suzy"
```

Notice the `window.studentName` reference? This expression is accessing the global variable `studentName` as a property on `window` (which we're pretending for now is synonomous with the global object). That's the only way to access a shadowed variable from inside the scope where the shadowing variable is present.

| WARNING: |
| :--- |
| Leveraging this technique is not very good practice, as it's limited in utility, confusing for readers of your code, and likely to invite bugs to your program. Don't shadow a global variable that you need to access, and conversely, don't access a global variable that you've shadowed. |

The `window.studentName` is a mirror of the global `studentName` variable, not a snapshot copy. Changes to one are reflected in the other, in either direction. Think of `window.studentName` as a getter/setter that accesses the actual `studentName` variable. As a matter of fact, you can even *add* a variable to the global scope by creating/setting a property on the global object (`window`).

This little "trick" only works for accessing a global scope variable (that was declared with `var` or `function`). Other forms of global scope variable declarations do not create mirrored global object properties:

```js
var one = 1;
let notOne = 2;
const notTwo = 3;
class notThree {}

console.log(window.one);       // 1
console.log(window.notOne);    // undefined
console.log(window.notTwo);    // undefined
console.log(window.notThree);  // undefined
```

Variables (no matter how they're declared!) that exist in any other scope than the global scope are completely inaccessible from an inner scope where they've been shadowed.

```js
var special = 42;

function lookingFor(special) {
    // `special` in this scope is inaccessible from
    // inside keepLooking()

    function keepLooking() {
        var special = 3.141592;
        console.log(special);
        console.log(window.special);
    }

    keepLooking();
}

lookingFor(112358132134);
// 3.141592
// 42
```

The global RED `special` is shadowed by the BLUE `special` (parameter), and the BLUE `special` is itself shadowed by the GREEN `special` inside `keepLooking()`. We can still access RED `special` indirectly as `window.special`.

##### Copying Is Not Accessing

I've been asked the following "But what about...?" question dozens of times, so I'm just going to address it before you even ask!

```js
var special = 42;

function lookingFor(special) {
    var another = {
        special: special
    };

    function keepLooking() {
        var special = 3.141592;
        console.log(special);
        console.log(another.special);  // Ooo, tricky!
        console.log(window.special);
    }

    keepLooking();
}

lookingFor(112358132134);
// 3.141592
// 112358132134
// 42
```

Oh! So does this `another` technique prove me wrong in my above claim of the `special` parameter being "completely inaccessible" from inside `keepLooking()`? No, it does not.

`special: special` is copying the value of the `special` parameter variable into another container (a property of the same name). Of course if you put a value in another container, shadowing no longer applies (unless `another` was shadowed, too!). But that doesn't mean we're accessing the parameter `special`, it means we're accessing the value it had at that moment, but by way of another container (object property). We cannot, for example, reassign that BLUE `special` to another value from inside `keepLooking()`.

Another "But...!?" you may be about to raise: what if I'd used objects or arrays as the values instead of the numbers (`112358132134`, etc)? Would us having references to objects instead of copies of primitive values "fix" the inaccessibility? No. Mutating the contents of the object value via such a reference copy is **not** the same thing as lexically accessing the variable itself. We still couldn't reassign the BLUE `special`.

#### Illegal Shadowing

// TODO: var crossing let, etc

## The Global Scope?

We've referenced the "global scope" a number of times already, but we should dig into that topic in more detail. We'll start by exploring whether the global scope is (still) useful and relevant to writing JS programs, and then look at differences in how the global scope is *found* in different JS environments.

It's likely no surprise to readers that most applications are composed of multiple (sometimes many!) individual JS files. So how exactly do all those separate files get stitched together in a single run-time context by the JS engine?

With respect to browser-executed applications, there are 3 main ways:

1. If you're exclusively using ES6+ modules (not transpiling those away into some other bundle format), then these files are loaded individually by the JS environment. Each module then `import`s references to whichever other modules it needs to access. The separate module files cooperate with each other exclusively through these shared imports, without needing any scopes.

2. If you're using a bundler in your build process, all the files are typically concatenated together before delivery to the browser and JS engine, which then only processes one big file. Even with all the pieces of the application being co-located in a single file, some mechanism is necessary for each piece to register a *name* to be referred to by other pieces, as well as some facility for that access to be made.

    In some approaches, the entire contents of the file are wrapped in a single enclosing scope (such as a wrapper function/IIFE, UMD-like module, etc), so each piece can register itself for access by other pieces by way of local variables in that shared scope.

    For example:

    ```js
    (function outerScope(){
        var moduleOne = (function one(){
            // ..
        })();

        var moduleTwo = (function two(){
            // ..

            function callModuleOne() {
                moduleOne.someMethod();
            }

            // ..
        })();
    })();
    ```

    As shown, the `moduleOne` and `moduleTwo` local variables inside the `outerScope()` function scope are declared so that these modules can access each other for their cooperation.

    While the scope of `outerScope()` is a function and not the full environment global scope, it does act as a sort of "application-wide scope", a bucket where all the top-level identifiers can be stored, even if not in the real global scope. So it's kind of like a stand-in for the global scope in that respect.

3. Whether a bundler is used for an application, or whether the (non-ES6 module) files are simply loaded in the browser individually (via `<script>` tags or other dynamic JS loading), if there is no single surrounding scope encompassing all these pieces, the **global scope** is the only way for them to cooperate with each other.

    A bundled file of this sort often looks something like this:

    ```js
    var moduleOne = (function one(){
        // ..
    })();
    var moduleTwo = (function two(){
        // ..

        function callModuleOne() {
            moduleOne.someMethod();
        }

        // ..
    })();
    ```

    Here, since there is no surrounding function scope, these `moduleOne` and `moduleTwo` declarations are simply processed in the global scope. This is effectively the same as if the file hadn't been concatenated:

    module1.js:

    ```js
    var moduleOne = (function one(){
        // ..
    })();
    ```

    module2.js:

    ```js
    var moduleTwo = (function two(){
        // ..

        function callModuleOne() {
            moduleOne.someMethod();
        }

        // ..
    })();
    ```

    Again, if these files are loaded as normal standalone .js files in a browser environment, each top-level variable declaration will end up as a global variable, since the global scope is the only shared resource between these two separate files (programs, from the perspective of the JS engine).

In addition to (potentially) accounting for where an application's code resides during run-time, and how each piece is able to access the other pieces to cooperate, the global scope is also where:

* JS exposes its built-ins:

    - primitives: `undefined`, `null`, `Infinity`, `NaN`
    - natives: `Date()`, `Object()`, `String()`, etc
    - global functions: `eval()`, `parseInt()`, etc
    - namespaces: `Math`, `Atomics`, `JSON`
    - friends of JS: `Intl`, `WebAssembly`

* The environment that is hosting JS exposes its built-ins:

    - `console` (and its methods)
    - the DOM (`window`, `document`, etc)
    - timers (`setTimeout(..)`, etc)
    - web platform APIs: `navigator`, `history`, geolocation, WebRTC, etc<br><br>

    | NOTE: |
    | :--- |
    | Node also exposes several elements "globally", but they're technically not in its `global` scope: `require()`, `__dirname`, `module`, `URL`, etc. |

Most developers agree that the global scope shouldn't just be a dumping ground for every variable in your application. That's a mess of bugs just waiting to happen. But it's also undeniable that the global scope is an important *glue* for virtually every JS application.

### Where's The Global Scope?

It might seem obvious that the global scope is located in the outermost portion of a file; that is, not inside any function or other block. But it's not quite as simple as that.

Different JS environments handle the scopes of your programs, in particular the global scope, differently. It's extremely common for JS developers to have misconceptions in this regard.

#### Browser "Window"

With resepct to treatment of the global scope, the most *pure* (not completely!) environment JS can be run in is as a standalone .js file loaded in a web page environment in a browser. I don't mean "pure" as in nothing automatically added -- lots may be added! -- but rather in terms of minimal intrusion on the code or interference with its behavior.

Consider this simple .js file:

```js
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!
```

This code may be loaded in a webpage environment using an inline `<script>` tag, a `<script src=..>` script tag in the markup, or even a dynamically created `<script>` DOM element. In all three cases, the `studentName` and `hello` identifiers are declared in the global scope.

That means if you access the global object (commonly, `window` in the browser), you'll find properties of those same names there:

```js
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ window.studentName }!`);
}

window.hello();
// Hello, Kyle!
```

That's the default behavior one would expect from a reading of the JS specification. That's what I mean by *pure*. That won't always be true of other JS environments, and that's often surprising to JS developers.

Things are not entirely *pure*, however. For example:

```js
var name = 42;

console.log(typeof name, name);
// string 42
```

`window.name` is a pre-defined "global" in a browser context, a special variable that behaves as a getter/setter and insists on a string value. An unusual consequence of it being pre-defined on `window` is that it can be "shadowed" directly in the global scope:

```js
let name = 42;

console.log(typeof name, name);
// number 42
```

With the exception of a few rare corner cases like this, JS running as a standalone file in a browser page has the most *pure* global scope behavior we're likely to encounter.

#### Web Workers

Web Workers are a web platform extension for typical browser-JS behavior, which allows a JS file to run in a completely separate thread (operating system wise) from the thread that's running the main browser-hosted JS.

Since these web worker programs run on a separate thread, they're restricted in their communications with the main application thread, to avoid/control race conditions and other complications. Web worker code does not have access to the DOM, for example. Some web APIs are however made available to the worker, such as `navigator`.

Since a web worker is treated as a wholly separate program, it does not share the global scope with the main JS program. However, the browser's JS engine is still running the code, so we can expect similar *purity* of its global scope behavior. But there is no DOM access, so the `window` alias for the global scope doesn't exist.

In a web worker, a global object reference is typically made with `self`:

```js
var studentName = "Kyle";
let studentID = 42;

function hello() {
    console.log(`Hello, ${ self.studentName }!`);
}

self.hello();
// Hello, Kyle!

self.studentID;
// undefined
```

Just as with main JS programs, `var` and `function` declarations create mirrored properties on the global object, where other declarations (`let`, etc) do not.

#### Developer Tools Console/REPL

Using the console/REPL (Read-Evaluate-Print-Loop) in your browser's Developer Tools feels like a pretty straightforward JS environment at first glance. But it's not, really.

Developer Tools are... tools for developers. Their primary purpose is to make life easier for developers. They prioritize DX (Developer Experience). It is *not* a goal of such tools to accurately and purely reflect all nuances of strict-spec JS behavior. As such, there's many quirks that may act as "gotchas" if you're treating the console as a *pure* JS environment.

This convenience is a good thing, by the way! I'm glad developer tools make developers' lives easier! I'm glad we have nice UX charms like auto-complete of variables/properties, etc. I'm just pointing out that we can't and shouldn't expect such tools to *always* adhere strictly to the way JS programs are handled, because that's not the purpose of these tools.

Since such tools vary in behavior from browser to browser, and since they change (sometimes rather frequently), I'm not going to "hardcode" any of the specific details into this text, thereby ensuring this book text is outdated quickly.

But I'll just hint at some examples of quirks that have been true at various points in different browser console environments, to reinforce my point about not assuming native JS behavior:

* Whether a `var` or `function` declaration in the top-level "global scope" of the console actually creates a real global variable (and mirrored `window` property, and vice versa!).

* What happens with multiple `let` and `const` declarations in the top-level "global scope".

* Whether `"use strict";` on one line-entry (pressing `<enter>` after) enables strict mode for the rest of that console session, the way it would on the first line of a .js file, as well as whether you can use `"use strict";` beyond the "first line" and still get strict mode turned on for that session.

* How non-strict mode `this` default-binding works for function calls, and whether the "global object" used will contain expected global variables.

* How "hoisting" (see Chapter 5) works across multiple line entries.

* ...several others

The developer console is not trying to pretend to be a JS compiler that handles your entered code the same way the JS engine handles a .js file. It's trying to make it easy for you to quickly enter a few lines of code and quickly see the results. These are entirely different use-cases, and as such, it's unreasonable to expect one tool handle both equally.

Don't trust what behavior you see in a developer console as representing *exact* to-the-letter JS semantics. Think of it as a "JS friendly" environment. That's useful in its own right.

#### ES6+ Modules

ES6 introduced first-class support for the module pattern (which we'll cover more in Chapter 6). One of the most obvious impacts of this mechanism is how it changes the behavior of observably top-level scope in a file.

Recall this code snippet from earlier:

```js
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!

export hello;
```

If that code were in a file that was loaded as an ES6+ module, it would still run exactly the same. However, the observable effects, from the overall application perspective, would be different.

Despite being declared at the top-level of the (module) file, the outermost obvious scope, `studentName` and `hello` are not global variables. Instead, they are module-wide, or if you prefer, "module-global". They are not added to any global scope object, nor are they added to any accessible "module-global" object.

This is not to say that global variables cannot exist in such programs. It's just that global variables don't get created by declaring variables in the top-level scope of a module.

The module's top-level scope is descended from the global scope, almost as if the entire contents of the module were wrapped in a function. Thus, all variables that exist in the global scope (whether they're on the global object or not!) are available as lexical identifiers from inside the module's scope.

ES6+ modules encourage a minimization of reliance on the global scope, where you import whatever modules you may need for the current module to operate. As such, you less often see usage of the global scope or its global object. However, as noted earlier, there are still plenty of JS and web globals that you will continue to access from the global scope, whether you realize it or not!

#### Node

As of time of this writing, Node recently added support for ES6+ modules. But additionally, Node has from the beginning supported a module format referred to as "Common JS", which looks like this:

```js
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!

module.exports.hello = hello;
```

Node essentially wraps such code in a function, so that the `var` and `function` declarations are contained in that module's scope, **not** added as global variables.

Think of the above code when processed by Node sorta like this (illustrative, not actual):

```js
function Module(module,require,__dirname,...) {
    var studentName = "Kyle";

    function hello() {
        console.log(`Hello, ${ studentName }!`);
    }

    hello();
    // Hello, Kyle!

    module.exports.hello = hello;
}
```

Node then (again, essentially) invokes the `Module(..)` function to run your module. You can clearly see here why `studentName` and `hello` identifiers are thus not global, but rather declared in the module scope.

As noted earlier, Node defines a number of "globals" like `require()`, but they're not actually identifiers in the global scope. They're provided in the available scope to every module, essentially a bit like the parameters listed to this `Module(..)` function above.

| WARNING: |
| :--- |
| The part that often catches JS developers off-guard is that Node treats every single .js file that it loads, including the main one you start the Node process with, as a *module*, so this wrapping always occurs! That means that your main Node program file does **not** act (with respect to scope) like a .js file otherwise loaded as the main program in a browser environment! |

So how do you define actual global variables in Node? The only way to do so is to add properties to another of Node's automatically provided "globals", which is called `global`. `global` is ostensibly (if not actually) a reference to the real global scope object.

Consider:

```js
global.studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!

module.exports.hello = hello;
```

Here we add `studentName` as a property on the `global` object, and then in the `console.log(..)` statement we're able to access `studentName` as a normal global variable.

Remember, `global` is not defined by JS, it's defined by Node.

#### Global This

Reviewing where we've been so far, depending on which JS environment our code is running in, a program may or may not be able to:

* declare a global variable in the top-level scope with `var` or `function` declarations -- or `let`, `const`, and `class`.

* also add global variables declarations as properties of the global scope object if `var` or `function` were used for the declaration.

* refer to the global scope object (for adding or retrieving global variables, as properties) with `window`, `self`, or `global`.

I think it's fair to say that global scope access and behavior is more complicated than most developers assume, as the preceding sections have illustrated. But the complexity is never more obvious than in trying to articulate a broadly applicable reference to the global scope object.

Another "trick" for getting a reliable reference to this global scope object might look like:

```js
const theGlobalScopeObject = (new Function("return this"))();
```

| NOTE: |
| :--- |
| A function that is dynamically constructed with the `Function()` constructor will automatically be run in non-strict mode (for legacy reasons) when invoked as shown (the normal `()` function invocation); thus, its `this` will be the global object. See Book 3 *Objects & Classes* for more information. |

So, we have `window`, `self`, `global`, and this `new Function(..)` trick. That's a lot of different ways to try to get at this global object.

Why not introduce yet another!?!?

At the time of this writing, JS recently introduced a standardized reference to the global scope object, called `globalThis`. So, depending on the recency of the JS engines your code runs in, you can then use `globalThis` in place of any of those other approaches.

You might even attempt a cross-environment approach that's safer across older JS environments pre-`globalThis`, something like:

```js
const theGlobalScopeObject =
    (typeof globalThis !== "undefined") ? globalThis :
    (typeof global !== "undefined") ? global :
    (typeof window !== "undefined") ? window :
    (typeof self !== "undefined") ? self :
    (new Function("return this"))();
```

Phew! At least now you're more aware of the breadth of topic on the global scope and global scope object.

## Temporal Dead Zone (TDZ)

// TODO: TDZ, redeclarations, loop declarations

.

.

.

.

.

.

.

----

| NOTE: |
| :--- |
| Everything below here is previous text from 1st edition, and is only here for reference while 2nd edition work is underway. **Please ignore this stuff.** |

## Review (TL;DR)

Lexical scope means that scope is defined by author-time decisions of where functions are declared. The lexing phase of compilation is essentially able to know where and how all identifiers are declared, and thus predict how they will be looked-up during execution.

Two mechanisms in JavaScript can "cheat" lexical scope: `eval(..)` and `with`. The former can modify existing lexical scope (at runtime) by evaluating a string of "code" which has one or more declarations in it. The latter essentially creates a whole new lexical scope (again, at runtime) by treating an object reference *as* a "scope" and that object's properties as scoped identifiers.

The downside to these mechanisms is that it defeats the *Engine*'s ability to perform compile-time optimizations regarding scope look-up, because the *Engine* has to assume pessimistically that such optimizations will be invalid. Code *will* run slower as a result of using either feature. **Don't use them.**
