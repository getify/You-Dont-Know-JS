# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 1: What is Scope?

| NOTE: |
| :--- |
| Work in progress |

One key foundation of programming languages is storing values in variables and retrieving those values later. In fact, this process is the primary way we model program *state*. A program without *state* is a pretty uninteresting program, so this topic is at the very heart of what it means to write programs.

But to understand how variables work, we should first ask: where do variables *live*? In other words, how are your program's variables organized and accessed by the JS engine?

These questions imply the need for a well-defined set of rules for managing variables, called *scope*. This chapter will illustrate *scope* by listening in on "conversations" inside the JS engine as it processes and executes our programs.

## About This Book

If you already finished *Get Started* (the first book of this series), you're in the right spot! If not, before you proceed I encourage you to *start there* for the best foundation.

Our focus in this second book is the first pillar (of three!) in the JS language: the scope system and its function closures, and how these mechanisms enable the module design pattern.

JS is typically classified as an interpreted scripting language, so it's assumed that programs are processed in a single, top-down pass. But JS is in fact parsed/compiled in a separate phase **before execution begins**. The code author's decisions on where to place variables, functions, and blocks with respect to each other are analyzed according to the rules of scope, during the initial parsing/compilation phase. The resulting scope is unaffected by run-time conditions.

JS functions are themselves values, meaning they can be assigned and passed around just like numbers or strings. But since these functions hold and access variables, they maintain their original scope no matter where in the program the functions are eventually executed. This is called closure.

Modules are a pattern for code organization characterized by a collection of public methods that have access (via closure) to variables and functions that are hidden inside the internal scope of the module.

## Brief Intro To Code Compilation

Depending on your level of experience with various languages, you may be surprised to learn that JS is compiled, even though it's typically labeled as "dynamic" or "interpreted". JS is *not* typically compiled well in advance, as are many traditionally-compiled languages, nor are the results of compilation portable among various distributed JS engines. Nevertheless, the JS engine essentially performs similar steps as other traditional language compilers.

The reason we need to talk about code compilation to understand scope is because JS's scope is entirely determined during this phase.

A program is generally processed by a compiler in three basic stages:

1. **Tokenizing/Lexing:** breaking up a string of characters into meaningful (to the language) chunks, called tokens. For instance, consider the program: `var a = 2;`. This program would likely be broken up into the following tokens: `var`, `a`, `=`, `2`, and `;`. Whitespace may or may not be persisted as a token, depending on whether it's meaningful or not.

| NOTE: |
| :--- |
| The difference between tokenizing and lexing is subtle and academic, but it centers on whether or not these tokens are identified in a *stateless* or *stateful* way. Put simply, if the tokenizer were to invoke stateful parsing rules to figure out whether `a` should be considered a distinct token or just part of another token, *that* would be **lexing**. |

2. **Parsing:** taking a stream (array) of tokens and turning it into a tree of nested elements, which collectively represent the grammatical structure of the program. This tree is called an "AST" (<b>A</b>bstract <b>S</b>yntax <b>T</b>ree).

    For example, the tree for `var a = 2;` might start with a top-level node called `VariableDeclaration`, with a child node called `Identifier` (whose value is `a`), and another child called `AssignmentExpression` which itself has a child called `NumericLiteral` (whose value is `2`).

3. **Code Generation:** taking an AST and turning it into executable code. This part varies greatly depending on the language, the platform it's targeting, etc.

    The JS engine takes our above described AST for `var a = 2;` and turns it into a set of machine instructions to actually *create* a variable called `a` (including reserving memory, etc.), and then store a value into `a`.

| NOTE: |
| :--- |
| The implementation details of a JS engine (utilizing system memory resources, etc) is much deeper than we will dig here. We'll keep our focus on the observable behavior of our programs and let the JS engine manage those system abstractions. |

The JS engine is vastly more complex than *just* those three stages. In the process of parsing and code-generation, there are steps to optimize the performance of the execution, including collapsing redundant elements, etc. In fact, code can even be re-compiled and re-optimized during the progression of execution.

So, I'm painting only with broad strokes here. But you'll see shortly why *these* details we *do* cover, even at a high level, are relevant.

JS engines don't have the luxury of plenty of time to optimize, because JS compilation doesn't happen in a build step ahead of time, as with other languages. It usually must happen in mere microseconds (or less!) right before the code is executed. To ensure the fastest performance under these constraints, JS engines use all kinds of tricks (like JITs, which lazy compile and even hot re-compile, etc.) which are well beyond the "scope" of our discussion here.

### Required: Two Phases

To state it as simply as possible, a JS program is processed in (at least) two phases: parsing/compilation first, then execution.

The breakdown of a parsing/compilation phase separate from the subsequent execution phase is observable fact, not theory or opinion. While the JS specification does not require "compilation" explicitly, it requires behavior which is essentially only practical in a compile-then-execute cadence.

There are three program characteristics you can use to prove this to yourself: syntax errors, "early errors", and hoisting" (covered in Chapter 4).

Consider this program:

```js
var greeting = "Hello";
console.log(greeting);
greeting = ."Hi";
// SyntaxError: unexpected token .
```

This program produces no output (`"Hello"` is not printed), but instead throws a `SyntaxError` about the unexpected `.` token right before the `"Hi"` string. Since the syntax error happens after the well-formed `console.log(..)` statement, if JS was executing top-down line by line, one would expect the `"Hello"` message being printed before the syntax error being thrown. That doesn't happen. In fact, the only way the JS engine could know about the syntax error on the third line, before executing the first and second lines, is because the JS engine first parses this entire program before any of it is executed.

Next, consider:

```js
console.log("Howdy");
saySomething("Hello","Hi");
// Uncaught SyntaxError: Duplicate parameter name not allowed in this context

function saySomething(greeting,greeting) {
    "use strict";
    console.log(greeting);
}
```

The `"Howdy"` message is not printed, despite being a well-formed statement. Instead, just like the previous snippet, the `SyntaxError` here is thrown before the program is executed. In this case, it's because strict-mode (opted in for only the `saySomething(..)` function in this program) forbids, among many other things, functions to have duplicate parameter names; this has always been allowed in non-strict mode. This is not a syntax error in the sense of being a malformed string of tokens (like `."Hi"` above), but is required by the specification to be thrown as an "early error" for strict-mode programs.

How does the JS engine know that the `greeting` parameter has been duplicated? How does it know that the `saySomething(..)` function is even in strict-mode while processing the parameter list (the `"use strict"` pragma appears only in the function body)? Again, the only reasonable answer to these questions is that the code must first be parsed before execution.

Finally, consider:

```js
function saySomething() {
    var greeting = "Hello";
    {
        greeting = "Howdy";
        let greeting = "Hi";
        console.log(greeting);
    }
}

saySomething();
// ReferenceError: Cannot access 'greeting' before initialization
```

The noted `ReferenceError` occurs on the line with the statement `greeting = "Howdy"`. What's being indicated is that the `greeting` variable for that statement is the one from the next line, `let greeting = "Hi"`, rather than from the previous statement `var greeting = "Hello"`.

The only way the JS engine could know, at the line where the error is thrown, that the *next statement* would declare a block-scoped variable of the same name (`greeting`) -- which creates the conflict of accessing the variable too early, while in its so called "TDZ", Temporal Dead Zone -- is if the JS engine had already processed this code in an earlier pass, and already set up all the scopes and their variable associations. This processing of scopes and declarations can only accurately be done by parsing the program before execution.

| WARNING: |
| :--- |
| It's often asserted that `let` and `const` declarations are not "hoisted", as an explanation of the occurence of the "TDZ" behavior just illustrated. This is not accurate. If these kinds of declarations were not hoisted, then `greeting = "Howdy"` assignment would simply be targetting the `var greeting` variable from the outer (function) scope, with no need to throw an error, because the block-scoped `greeting` wouldn't *exist* yet. The existence of the TDZ error proves that the block-scoped `greeting` was indeed "hoisted" to the top of that block scope. |

Hopefully you're now convinced that JS programs are parsed before any execution begins. But does that prove they are compiled?

This is an interesting question to ponder. Could JS parse a program, but then execute that program by *interpreting* the AST node-by-node **without** compiling the program in between? Yes, that is *possible*, but it's extremely unlikely, because it would be highly inefficient performance wise. It's hard to imagine a scenario where a production-quality JS engine would go to all the touble of parsing a program into an AST, but not then convert (aka, "compile") that AST into the most efficient (binary) representation for the engine to then execute.

Many have endeavored to split hairs with this terminology, as there's plenty of nuance to fuel "well, actually..." interjections. But in spirit and in practice, what the JS engine is doing in processing JS programs is **much more alike compilation** than different.

Classifying JS as a compiled language is not about a distribution model for its binary (or byte-code) executable representations, but about keeping a clear distinction in our minds about the phase where JS code is processed and analyzed, which indisputedly happens observably *before* the code starts to be executed. We need proper mental models for how the JS engine treats our code if we want to understand JS effectively.

## Understanding Scope

In the next chapter, we'll dive into the nuts and bolts of scope and how it plays out in code. But first, I want us to take the time to understand scope from a conceptual perspective.

### Buckets of Marbles

One metaphor I've found effective in understanding scope is sorting colored marbles into buckets of their matching color.

Imagine you come across a pile of marbles, and notice that all the marbles are colored red, blue, or green. To sort all the marbles, let's drop the red ones into a red bucket, green into a green bucket, and blue into a blue bucket. After sorting, when you later need a green marble, you already know the green bucket is where to go to get it.

In this metaphor, the marbles are the variables in our program. The buckets are scopes (functions and blocks), which we just conceptually assign individual colors for our discussion purposes. The color of each marble is thus determined by which *color* scope we find the marble originally created in.

Consider:

```js
// outer/global scope: RED

var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getStudentName(studentID) {
    // function scope: BLUE

    for (let student of students) {
        // loop scope: GREEN

        if (student.id == studentID) {
            return student.name;
        }
    }
}

var nextStudent = getStudentName(73);
console.log(nextStudent);
// "Suzy"
```

As labeled by the comments above, we designate 3 scope colors: RED (outermost global scope), BLUE (scope of function `getStudentName(..)`), and GREEN (scope of/inside the `for` loop).

The RED marbles are variables/identifiers originally declared in the RED scope:

* `students`

* `getStudentName`

* `nextStudent`

The only BLUE marble, the function parameter declared in the BLUE scope:

* `studentID`

The only GREEN marble, the loop iterator declared in the GREEN scope:

* `student`

As the JS engine processes a program (during compilation), and finds a declaration for a variable/identifier, it essentially asks, "which *color* scope am I currently in?" The variable/identifier is designated as that same *color*, meaning it belongs to that bucket.

The GREEN bucket is wholly nested inside of the BLUE bucket, and similarly the BLUE bucket is wholly nested inside the RED bucket. Scopes can nest inside each other as shown, to any depth of nesting as your program needs. But scopes can never cross boundaries, meaning no scope is ever partially in two parent scopes.

References (non-declarations) to variables/identifiers can be made from either the current scope, or any scope above/outside the current scope, but never to lower/nested scopes. So an expression in the RED bucket only has access to RED marbles, not BLUE or GREEN. An expression in the BLUE bucket can reference either BLUE or RED marbles, not GREEN. And an expression in the GREEN bucket has access to RED, BLUE, and GREEN marbles.

We can conceptualize the process of determining these marble colors during runtime as a lookup. At first, the `students` variable reference in the `for` loop-statement has no color, so we ask the current scope if it has a marble matching that name. Since it doesn't, the lookup continues with the next outer/containing scope, and so on. When the RED bucket is reached, a marble of the name `students` is found, so the loop-statement's `students` variable is determined to be a red marble.

The `if (student.id == studentID)` is similarly determined to reference a GREEN marble named `student` and a BLUE marble `studentID`.

| NOTE: |
| :--- |
| The JS engine doesn't generally determine these marble colors during run-time; the "lookup" here is a rhetorical device to help you understand the concepts. During compilation, most or all variable references will be from already-known scope buckets, so their color is determined at that, and stored with each marble reference to avoid unnecessary lookups as the program runs. |

The key take-aways from the marbles & buckets metaphor:

* Variables are declared in certain scopes, which can be thought of as colored marbles in matching-color buckets.

* Any reference to a variable of that same name in that scope, or any deeper nested scope, will be a marble of that same color.

* The determination of buckets, colors, and marbles is all done during compilation. This information is used during code execution.

### A Conversation Among Friends

Another useful metaphor for the process of analyzing variables and the scopes they come from is to imagine various conversations that go on inside the engine as code is processed and then executed. We can "listen in" on these conversations to get a better conceptual foundation for how scopes work.

Recall this program from earlier, which we'll use as the subject of our conversations:

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
// "Suzy"
```

Let's now meet the members of the JS engine that will have conversations as they process that program:

1. *Engine*: responsible for start-to-finish compilation and execution of our JavaScript program.

2. *Compiler*: one of *Engine*'s friends; handles all the dirty work of parsing and code-generation (see previous section).

3. *Scope Manager*: another friend of *Engine*; collects and maintains a look-up list of all the declared variables/identifiers, and enforces a set of rules as to how these are accessible to currently executing code.

For you to *fully understand* how JavaScript works, you need to begin to *think* like *Engine* (and friends) think, ask the questions they ask, and answer their questions likewise.

Let's examine how JS is going to process that program, specifically starting with the first statement. The array and its contents are just basic JS value literals (and thus unaffected by any scoping concerns), so our focus here will be on the `var students = [ .. ]` declaration and initialization-assignment parts.

We typically think of that as a single statement, but that's not how our friend *Engine* sees it. In fact, *Engine* sees two distinct operations, one which *Compiler* will handle during compilation, and the other which *Engine* will handle during execution.

The first thing *Compiler* will do with this program is perform lexing to break it down into tokens, which it will then parse into a tree (AST).

But when *Compiler* gets to code-generation, there's more detail to consider than may be obvious. A reasonable assumption would be that *Compiler* will produce code such as: "Allocate memory for a variable, label it `students`, then stick a reference to the array into that variable." Unfortunately, that's not quite complete.

Here's how *Compiler* will proceed:

1. Encountering `var students`, *Compiler* asks *Scope Manager* to see if a variable named `students` already exists for that particular scope bucket. If so, *Compiler* ignores this declaration and moves on. Otherwise, *Compiler* prepares code that, at execution time, asks *Scope Manager* to declare a new variable called `students` in that scope bucket.

2. *Compiler* then produces code for *Engine* to later execute, to handle the `students = []` assignment. The code *Engine* runs will first ask *Scope Manager* if there is a variable called `students` accessible in the current scope bucket. If not, *Engine* looks elsewhere (see "Nested Scope" below).

If *Engine* (eventually) finds a variable, it assigns the reference of the `[ .. ]` array to it. If not, *Engine* will raise its hand and yell out an error!

To summarize: two distinct actions are taken for a variable assignment: First, *Compiler* sets up the declaration of a scope variable (if not previously declared in the current scope), and second, while executing, *Engine* asks *Scope Manager* to look up the variable, and assigns to it, if found.

### Compiler Speak

When *Engine* executes the code that *Compiler* produced for step (2), it has to look-up the variable `students` to see if it has been declared, by consulting *Scope Manager*. But the nature of the look-up *Engine* performs affects the outcome of the look-up.

Other than declarations, all occurrences of variables/identifiers in a program serve in one of two "roles": either they're the *target* of an assignment or they're the *source* of a value.

| NOTE: |
| :--- |
| When I first learned compiler theory in my Computer Science degree, we were taught the terms "LHS" (aka, *target*) and "RHS" (aka, *source*) for these roles. As you might guess from the "L" and the "R", the acronyms mean "Left-Hand Side" and "Right-Hand Side", respectively, as in left and right sides of an `=` assignment operator. However, assignment targets and sources don't always literally appear on the left or right of an `=`, so it's probably less confusing to think in terms of *target* / *source* instead of *left* / *right*. |

How do you know if a variable is a *target*? Check if there is a value anywhere that is being assigned to it; if so, it's a *target*. If not, then the variable is serving a *source* role instead.

#### Targets

Let's look at our program example with respect to these roles. Consider:

```js
students = [
    /* .. */
];
```

This statement is clearly an assignment operation; remember, the `var students` part is handled entirely as a declaration at compile time, and is thus irrelevant during execution. Same with the `nextStudent = getStudentName(73)` statement.

There are three other *target* assignment operations in the code that are perhaps less obvious.

```js
for (let student of students) {
```

That statement assigns a value to `student` for each iteration of the loop. Another *target* reference:

```js
getStudentName(73)
```

But how is that an assignment to a *target*? Look closely: the argument `73` is assigned to the parameter `studentID`.

And there's one last (subtle) *target* reference in our program. Can you spot it?

..

..

..

Did you identify this one?

```js
function getStudentName(studentID) {
```

A function declaration is a special case of a *target* reference. You could think of it like `var getStudentName = function(studentID)`, but that's not exactly accurate. An identifier `getStudentName` is declared (at compile-time), but the `= function(studentID)` part is also handled at compilation; the association between `getStudentName` and the function is automatically set up at the beginning of the scope rather than waiting for an `=` assignment statement to be executed.

| NOTE: |
| :--- |
| This immediate automatic function assignment from function declarations is referred to as "function hoisting", and will be covered more in Chapter 4. |

#### Sources

So we've identified all five *target* references in the program. The other variable references must then be *source* references (because that's the only other option!).

In `for (let student of students)`, we said that `student` is a *target*, but `students` is the *source* reference. In the statement `if (student.id == studentID)`, both `student` and `studentID` are *source* references. `student` is also a *source* reference in `return student.name`.

In `getStudentName(73)`, `getStudentName` is a *source* reference (which we hope resolves to a function reference value). In `console.log(nextStudent)`, `console` is a *source* reference, as is `nextStudent`.

| NOTE: |
| :--- |
| In case you were wondering, `id`, `name`, and `log` are all properties, not variable references. |

#### Lookup Failures

Why does *target* vs. *source* matter? The role a variable/identifier serves will affect the nature of the lookup that *Scope Manager* will perform, specifically how failures in the lookup will be handled.

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

### Engine/Scope Conversation

```js
function foo(a) {
	console.log( a ); // 2
}

foo( 2 );
```

Let's imagine the above exchange (which processes this code snippet) as a conversation. The conversation would go a little something like this:

> ***Engine***: Hey *Scope*, I have an RHS reference for `foo`. Ever heard of it?

> ***Scope***: Why yes, I have. *Compiler* declared it just a second ago. He's a function. Here you go.

> ***Engine***: Great, thanks! OK, I'm executing `foo`.

> ***Engine***: Hey, *Scope*, I've got an LHS reference for `a`, ever heard of it?

> ***Scope***: Why yes, I have. *Compiler* declared it as a formal parameter to `foo` just recently. Here you go.

> ***Engine***: Helpful as always, *Scope*. Thanks again. Now, time to assign `2` to `a`.

> ***Engine***: Hey, *Scope*, sorry to bother you again. I need an RHS look-up for `console`. Ever heard of it?

> ***Scope***: No problem, *Engine*, this is what I do all day. Yes, I've got `console`. He's built-in. Here ya go.

> ***Engine***: Perfect. Looking up `log(..)`. OK, great, it's a function.

> ***Engine***: Yo, *Scope*. Can you help me out with an RHS reference to `a`. I think I remember it, but just want to double-check.

> ***Scope***: You're right, *Engine*. Same guy, hasn't changed. Here ya go.

> ***Engine***: Cool. Passing the value of `a`, which is `2`, into `log(..)`.

> ...

### Quiz

Check your understanding so far. Make sure to play the part of *Engine* and have a "conversation" with the *Scope*:

```js
function foo(a) {
	var b = a;
	return a + b;
}

var c = foo( 2 );
```

1. Identify all the LHS look-ups (there are 3!).

2. Identify all the RHS look-ups (there are 4!).

**Note:** See the chapter review for the quiz answers!

## Nested Scope

We said that *Scope* is a set of rules for looking up variables by their identifier name. There's usually more than one *Scope* to consider, however.

Just as a block or function is nested inside another block or function, scopes are nested inside other scopes. So, if a variable cannot be found in the immediate scope, *Engine* consults the next outer containing scope, continuing until found or until the outermost (aka, global) scope has been reached.

Consider:

```js
function foo(a) {
	console.log( a + b );
}

var b = 2;

foo( 2 ); // 4
```

The RHS reference for `b` cannot be resolved inside the function `foo`, but it can be resolved in the *Scope* surrounding it (in this case, the global).

So, revisiting the conversations between *Engine* and *Scope*, we'd overhear:

> ***Engine***: "Hey, *Scope* of `foo`, ever heard of `b`? Got an RHS reference for it."

> ***Scope***: "Nope, never heard of it. Go fish."

> ***Engine***: "Hey, *Scope* outside of `foo`, oh you're the global *Scope*, ok cool. Ever heard of `b`? Got an RHS reference for it."

> ***Scope***: "Yep, sure have. Here ya go."

The simple rules for traversing nested *Scope*: *Engine* starts at the currently executing *Scope*, looks for the variable there, then if not found, keeps going up one level, and so on. If the outermost global scope is reached, the search stops, whether it finds the variable or not.

### Building on Metaphors

To visualize the process of nested *Scope* resolution, I want you to think of this tall building.

<img src="fig1.png" width="250">

The building represents our program's nested *Scope* rule set. The first floor of the building represents your currently executing *Scope*, wherever you are. The top level of the building is the global *Scope*.

You resolve LHS and RHS references by looking on your current floor, and if you don't find it, taking the elevator to the next floor, looking there, then the next, and so on. Once you get to the top floor (the global *Scope*), you either find what you're looking for, or you don't. But you have to stop regardless.

## Errors

Why does it matter whether we call it LHS or RHS?

Because these two types of look-ups behave differently in the circumstance where the variable has not yet been declared (is not found in any consulted *Scope*).

Consider:

```js
function foo(a) {
	console.log( a + b );
	b = a;
}

foo( 2 );
```

When the RHS look-up occurs for `b` the first time, it will not be found. This is said to be an "undeclared" variable, because it is not found in the scope.

If an RHS look-up fails to ever find a variable, anywhere in the nested *Scope*s, this results in a `ReferenceError` being thrown by the *Engine*. It's important to note that the error is of the type `ReferenceError`.

By contrast, if the *Engine* is performing an LHS look-up and arrives at the top floor (global *Scope*) without finding it, and if the program is not running in "Strict Mode" [^note-strictmode], then the global *Scope* will create a new variable of that name **in the global scope**, and hand it back to *Engine*.

*"No, there wasn't one before, but I was helpful and created one for you."*

"Strict Mode" [^note-strictmode], which was added in ES5, has a number of different behaviors from normal/relaxed/lazy mode. One such behavior is that it disallows the automatic/implicit global variable creation. In that case, there would be no global *Scope*'d variable to hand back from an LHS look-up, and *Engine* would throw a `ReferenceError` similarly to the RHS case.

Now, if a variable is found for an RHS look-up, but you try to do something with its value that is impossible, such as trying to execute-as-function a non-function value, or reference a property on a `null` or `undefined` value, then *Engine* throws a different kind of error, called a `TypeError`.

`ReferenceError` is *Scope* resolution-failure related, whereas `TypeError` implies that *Scope* resolution was successful, but that there was an illegal/impossible action attempted against the result.

## Review (TL;DR)

Scope is the set of rules that determines where and how a variable (identifier) can be looked-up. This look-up may be for the purposes of assigning to the variable, which is an LHS (left-hand-side) reference, or it may be for the purposes of retrieving its value, which is an RHS (right-hand-side) reference.

LHS references result from assignment operations. *Scope*-related assignments can occur either with the `=` operator or by passing arguments to (assign to) function parameters.

The JavaScript *Engine* first compiles code before it executes, and in so doing, it splits up statements like `var a = 2;` into two separate steps:

1. First, `var a` to declare it in that *Scope*. This is performed at the beginning, before code execution.

2. Later, `a = 2` to look up the variable (LHS reference) and assign to it if found.

Both LHS and RHS reference look-ups start at the currently executing *Scope*, and if need be (that is, they don't find what they're looking for there), they work their way up the nested *Scope*, one scope (floor) at a time, looking for the identifier, until they get to the global (top floor) and stop, and either find it, or don't.

Unfulfilled RHS references result in `ReferenceError`s being thrown. Unfulfilled LHS references result in an automatic, implicitly-created global of that name (if not in "Strict Mode" [^note-strictmode]), or a `ReferenceError` (if in "Strict Mode" [^note-strictmode]).

### Quiz Answers

```js
function foo(a) {
	var b = a;
	return a + b;
}

var c = foo( 2 );
```

1. Identify all the LHS look-ups (there are 3!).

	**`c = ..`, `a = 2` (implicit param assignment) and `b = ..`**

2. Identify all the RHS look-ups (there are 4!).

    **`foo(2..`, `= a;`, `a + ..` and `.. + b`**


[^note-strictmode]: MDN: [Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode)
