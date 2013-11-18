# You Don't Know JS: Scope & Closures
# Chapter 1: What is Scope?

One of the most fundamental paradigms of nearly all programming languages is the ability to store values in variables, and later retrieve or modify those values. In fact, the ability to store values and pull values out of variables is what gives a program *state*.

Without such a concept, a program could perform some tasks, but they would be extremely limited and not terribly interesting.

But the inclusion of variables into our program begets the most interesting questions we will now address: where do those variables *live*? In other words, where are they stored? And, most importantly, how does our program find them when it needs them?

These questions speak to the need for a well-defined set of rules for storing variables in some location, and for finding those variables at a later time. We'll call that set of rules: *Scope*.

The way we will approach learning about scope is to think of the process in terms of a conversation, a dialogue. A one-sided conversation isn't really a conversation at all, so we need to first understand *who* is having the conversation.

## Compiler Theory

It may be self-evident, or it may be surprising, depending on your level of interaction with various languages, but despite the fact that JavaScript falls under the general category of "dynamic" or "interpreted" languages, it is in fact a compiled language. It is *not* compiled well in advance, as are many traditionally-compiled languages, nor are the results of compilation portable among various distributed systems.

But, nevertheless, the JavaScript engine performs many of the same steps, albeit in more sophisticated ways than we may commonly be aware, of any traditional language-compiler.

As this is not really a book on compiler theory, I will try to keep our discussion here brief and not too overwhelming. But it is important for you to understand some of the ways the engine works, so that you can understand that *conversation* that occurs about scope.

### Compilation

In traditional compiled-language process, a chunk of source code, your program, would undergo typically three steps *before* it is executed, roughly called "compilation":

1. **Tokenizing/Lexing:** breaking up a string of characters into meaningful (to the language) chunks, called tokens. For instance, consider the program: `var a = 2;`. This program would likely be broken up into the following tokens: `var`, `a`, `=`, `2`, and `;`. Whitespace may or may not be persisted as a token, depending on whether its meaningful or not.

    **Note:** The difference between tokenizing and lexing is subtle and academic, but it centers on whether or not these tokens are identified in a *stateless* or *stateful* way. Put simply, if the tokenizer were to invoke stateful parsing rules to figure out whether `a` should be considered a distinct token or just part of another token, *that* would be **lexing**.

2. **Parsing:** taking a stream (array) of tokens and turning it into a tree of nested elements, which collectively represent the grammatical structure of the program. This tree is called an "AST" (**A**bstract **S**yntax **T**ree).

    The tree for `var a = 2;` might be a top-level node called `VariableDeclaration`, with a child node called `Identifier` (whose value is `a`), and another child called `AssignmentExpression` which itself has a child called `NumericLiteral` (whose value is `2`).

    OK, I know, that's confusing and way too deep! Sorry, I promised we'd explore only what's necessary to learn *Scope*. Stick with me!

3. **Code Generation:** the process of taking an AST and turning it into executable code. This part varies greatly depending on the language, the platform it's targeting, etc.

    So, rather than get mired in details, we'll just handwave and say that there's a way to take our above described AST for `var a = 2;` and turn it into a set of machine instructions to actually *create* a variable called `a`, and then store a value into `a`.

The JavaScript engine is vastly more complex than that, as are most other language compilers. For instance, in the process of parsing and code generation, there is almost certainly processes to optimize the performance of the execution, including collapsing redundant elements, etc.

So, I'm painting only with broad strokes here. But I think you'll see shortly why *these* details, even at a high level, are relevant.

For one thing, JavaScript engines don't get the luxury (like other language compilers) of taking their "sweet time" to optimize. JavaScript compilation doesn't happen ahead of time, in a build step.

For JavaScript, the compilation that occurs happens, in many cases, mere microseconds (or less!) before the code is executed. To ensure the fastest performance, JS engines use all kinds of tricks (like JITs, which lazy compile and even hot re-compile, etc) which are well beyond the "scope" of our discussion here.

Let's just say, for simplicity sake, that any snippet of JavaScript has to be compiled before (usually *right* before!) it's executed. So, the JS compiler will take `var a = 2;` and compile it *first*, and then be ready to execute it, usually right away.

**Wait a minute!** What's all this got to do with the *scope conversation*? Great question.

### Meet: *Engine*

For our purposes, we are going to anthropomorphize the JavaScript engine. In other words, we're going to treat it like someone we *can* actually have a conversation with.

So, Reader, meet *Engine*, *Engine*, meet our Reader. Shake hands.

For you to *fully understand* how JavaScript works, you need to begin to *think* like *Engine* thinks, ask the questions *Engine* asks, and answer those questions how *Engine* answers them.

## Scope Conversations

When you see the program `var a = 2;`, you most likely see that as one statement. But that is not how our new friend *Engine* sees it. In fact, *Engine* sees two distinct statements, one which it will handle in compilation, and one which it will handle in execution.

So, let's break down how *Engine* will approach the program `var a = 2;`.

The first thing *Engine*'s compiler will do with this program is perform lexing to break it down into tokens, then it will parse those tokens into a tree. But next, when the compiler does code generation, it will treat this program somewhat differently than you or I may have assumed.

We might tend to think that it will produce code that could be summed up by this pseudo-code'ish: "allocate space for a variable, call it `a`, then stick the value `2` into that variable."

*Engine* will instead act like this:

1. Produce code at the beginning of the program (technically at the beginning of the appropriate *Scope*), from the `var a`, that checks the scope to see if a variable `a` already exists. If so, ignore this declaration. Otherwise, declare a new variable called `a` in the current scope.

2. Produce code for the `a = 2` assignment, wherever it appears normally in code flow, which first checks to see if there is a variable called `a` in the current scope. If so, it uses it. If not, it looks *elsewhere* (see *Nested Scope* below). If it eventually finds a variable, it assigns the value `2` to it. If not, it will raise its hand and yell out an error!

Hopefully you caught the two distinct actions/statements that *Engine* performs. It first declares a variable (if not previously declared), and then, when executing, it looks up the variable and assigns to it, if found.

### Compiler Speak

OK, I have to introduce a little bit more compiler-talk. I promise, it's important.

When *Engine* executes the code that *Compiler* produced for step (2), he has to look-up the variable `a` to see if it has been declared, and this look-up is exercising *Scope*. But the type of look-up he performs affects the outcome of the look-up.

In our case, it is said that *Engine* would be performing an "LHS" look-up for the variable `a`. The other type of look-up is called "RHS".

I bet you can guess what the "L" and "R" mean. These terms stand for "Left-hand Side" and "Right-hand Side".

Side... of what? **Of an assignment operation.**

In other words, an LHS look-up is done when a variable appears on the left-hand side of an assignment operation, and an RHS look-up is done when a variable appears on the right-hand side of an assignment operation.

Actually, let's be a little more precise. An RHS look-up is indistiguishable, for our purposes, from simply a look-up of the value of some variable, whereas the LHS look-up is trying to find the variable container itself, so that it can assign. In this way, RHS doesn't *really* mean "right-hand side of an assignment" per se, it just, more accurately, means "not left-hand side".

Being slightly glib for a moment, you could say "RHS" instead means "retrieve his source (value)", implying that RHS means "go get the value of...".

Let's dig into that deeper.

When I say:

```js
console.log(a);
```

The reference to `a` is an RHS reference, because nothing is being assigned to `a` here. Instead, we're looking-up to retrieve the value of `a`, so that the value can be passed to `console.log(..)`.

By contrast:

```js
a = 2;
```

The reference to `a` here is an LHS reference, because we don't actually care what the current value is, we simply want to find the variable as a target for the `= 2` assignment operation.

**Note:** LHS and RHS meaning "left/right-hand side of an assigment" doesn't necessarily literally imply "... side of the `=` assignment operator". There are several other ways that assignments happen, and so you have to conceptually think about it as: "who's the target of the assignment (LHS)" and "who's the source of the assignment (RHS)".

Consider this program. There are both LHS and RHS references going on here.

```js
function foo(a) {
	console.log(a); // 2
}

foo(2);
```

Firstly, `foo(..)` is an RHS reference to `foo`, meaning, "go look-up the value of `foo`, and give it to me." Moreover, `(..)` means I want to execute it, so it'd better actually be a function!

There's a subtle but important assignment here. Did you spot it?

You may have missed the implied `a = 2` in this code snippet. It happens when the value `2` is passed as an argument to the `foo(..)` function, in which case that value is **assigned** to the parameter `a`. The `LHS` reference look-up here is the parameter `a`.

There's another RHS reference, for the value of `a`, and that value is passed to `console.log(..)`. But then, `console.log(..)` needs a reference. It's an RHS, first for the `console` object, then a property-resolution occurs to see if it has a method called `log`.

Finally, we can conceptualize that there's an LHS/RHS exchange of passing the value `2` (by way of variable `a`'s RHS look-up) into `log(..)`. Inside of the native implementation of `log(..)`, we can assume it has parameters, the first of which (perhaps called `arg1`) is has an LHS reference look-up, before assigning `2` to it.

### Conversation?

So, what's this whole deal about the conversation?

Let's imagine the above exchange as a conversation. To process that above code snippet, the conversation would go a little something like this:

> ***Engine***: Hey *Scope*, I have an RHS reference for `foo`. Ever heard of him?

> ***Scope***: Why yes, I have. *Compiler* declared him just a second ago. He's a function. Here you go.

> ***Engine***: Great, thanks! OK, I'm executing `foo`.

> ***Engine***: Hey, *Scope*, I've got an LHS reference for `a`, ever heard of him?

> ***Scope***: Why yes, I have. *Compiler* declared him as a formal parameter to `foo` just recently. Here you go.

> ***Engine***: Helpful as always, *Scope*. Thanks again. Now, time to assign `2` to `a`.

> ***Engine***: Hey, *Scope*, sorry to bother you again. I need an RHS look-up for `console`. Ever heard of him?

> ***Scope***: No problem, *Engine*, this is what I do all day. Yes, I've got `console`. He's built-in. Here ya go.

> ***Engine***: Perfect. Looking up `log(..)`. OK, great, it's a function.

> ***Engine***: Yo, *Scope*. Can you help me out with an RHS reference to `a`. I think I remember him, but just want to double-check.

> ***Scope***: You're right, *Engine*. Same guy, hasn't changed. Here ya go.

> ***Engine***: Cool. Passing the value of `a`, which is `2`, into `log(..)`.

> ***Engine***: I need to LHS reference `arg1`. You dig?

> ***Scope***: As always, here you go.

> ...

## Quiz
Check your understanding so far. Make sure to play the part of *Engine* and have a "conversation" with the *Scope*:

```js
function foo(a) {
	var b = a;
	return a + b;
}

var c = foo(2);
```

1. Identify all the LHS look-ups (there are 3!).

2. Identify all the RHS look-ups (there are 4!).

## Nested Scope

We said that *Scope* is a set of rules for looking up variables by their identifier name. Sometimes, you will look up a variable, and it won't exist in the most immediate *Scope* you are currently executing in.

But, never fear. *Nested Scope* is *Scope*'s friendly cousin, and he rescues us.

Consider:

```js
function foo(a) {
	console.log(a + b);
}

var b = 2;

foo(2); // 4
```

The RHS reference for `b` cannot be resolved inside the function `foo`, but it can be resolved in the *Scope* surrounding it (in this case, the global, but could just be another *Nested Scope* cousin!).

So, the conversation between *Engine* and *Scope* is:

> ***Engine***: "Hey, *Scope* of `foo`, ever heard of `b`? Got an RHS reference for him."

> ***Scope***: "Nope, never heard of him. Go fish."

> ***Engine***: "Hey, *Scope* outside of `foo`, oh you're the global *Scope*, ok cool. Ever heard of `b`? Got an RHS reference for him."

> ***Scope***: "Yep, sure have. Here ya go."

*Nested Scope*'s rules simply are that you start at the inner-most *Scope* you are currently executing, look for a variable there, then if you don't find it, keep going up one level, and looking there, and on up. Once you get to the global *Scope*, nowhere else to go, either you find it, or stop.

### Building on Metaphors

To visualize the process of *Nested Scope* resolution, I want you to think of this tall building.

<img src="fig1.png">

The building represents our program's *Nested Scope* rule set. The first floor of the building represents your currently executing *Scope*, wherever you are. The top level of the building is the global *Scope*.

You resolve LHS and RHS references by looking on your current floor, and if you don't find it, taking the elevator to the next floor, looking there, then the next, and so on. Once you get to the top floor, you either find what you're looking for, or you don't. But you have to stop regardless.

## Errors

Why does it matter whether we call it LHS or RHS?

Because these two types of look-ups behave differently in the circumstance where the variable has not yet been declared.

Consider:

```js
function foo(a) {
	console.log(a + b);
	b = a;
}

foo(2);
```

When the RHS look-up occurs for `b` the first time, it will not be found. This is said to be an "undeclared" variable, because it is not found in the scope.

If an RHS look-up fails to ever find a variable, anyhwere in the *Nested Scope*, this results in a `ReferenceError` being thrown by the *Engine*. It's important to note that the error is of the type `ReferenceError`, as distinct from another error type we'll talk about in a moment.

By contrast, if you are performing an LHS look-up, and you arrive at the top floor (global *Scope*) without finding it, if you are not running your program in "Strict Mode" [^note-strictmode], then the global *Scope* will create a new variable of that name **in the global scope**, and hand it back to you. "No, there wasn't one before, but I was helpful and created one for you."

"Strict Mode" [^note-strictmode], which was added as a feature in ES5, has a number of different behaviors from normal/relaxed/lazy mode. One such behavior is that it disallows the automatic/implicit global variable creation. In that case, there would be no global *Scope*'d variable to hand back from an LHS look-up, and you'd get a `ReferenceError` similarly to the RHS case.

Now, if a variable is found for an RHS look-up, but you try to do something with its value that is impossible, such as trying to execute-as-function a non-function value, or reference a property on a `null` or `undefined` value, then you get a different kind of error, called a `TypeError`.

`ReferenceError` is *Scope* resolution-failure related, whereas `TypeError` implies that *Scope* resolution was successful, but that there was an illegal/impossible action attempted against the result.

## Review (TL;DR)

So, what is scope?

Scope is the set of rules that determines where and how a variable (identifier) can be looked-up. This look-up may be for the purposes of assigning to the variable, which is an LHS (left-hand-side) reference, or it may be for the purposes of retrieving its value, which is an RHS (right-hand-side) reference.

LHS references result from assignment operations. *Scope*-related assignments can occur either with the `=` operator or by passing arguments to (assign to) function parameters.

The JavaScript *Engine* first compiles code before it executes, and in so doing, it splits up statements like `var a = 2;` into two separate steps:

1. First, `var a` to declare it in that *Scope*. This is performed at the beginning, before code execution.

2. Later, `a = 2` to look up the variable (LHS reference) and assign to it if found.

Both LHS and RHS reference look-ups start at the currently executing *Scope*, and if need be (that is, they don't find what they're looking for there), they work their way up the *Nested Scope*, one scope (floor) at a time, looking for the identifier, until they get to the global (top floor) and stop, and either find it, or don't.

Unfulfilled RHS references result in `ReferenceError`s being thrown. Unfulfilled LHS references result in an automatic, implicitly-created global of that name (if not in "Strict Mode" [^note-strictmode]), or a `ReferenceError` (if in "Strict Mode" [^note-strictmode]).

[^note-strictmode]: MDN: [Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode)
