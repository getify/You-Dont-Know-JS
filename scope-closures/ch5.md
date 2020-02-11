# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 5: Working with Variables

| NOTE: |
| :--- |
| Work in progress |

By now, you should have a decent grasp of the mental model for the nesting of scopes, from the global scope downward -- a program's scope chain.

But just knowing which scope a variable comes from is only part of the story. If a declaration for a variable appears anywhere other than the very first statement of a scope, what can we say about any references to that identifier that occur *before* the declaration?

Though it may seem like a variable just *shouldn't exist* in a scope until the moment its declaration is encountered, we'll explore

## When Can I Use A Variable?

At what point does a variable become available to use in a certain part of a program? There may seem to be an obvious answer: *after* the variable has been declared/created. Right? Not quite.

Consider:

```js
greeting();
// Hello!

function greeting() {
    console.log("Hello!");
}
```

This code works fine. You may have seen or even written code like it before. But did you ever wonder how or why it works? Specifically, why can you access the identifier `greeting` from line 1 (to retrieve and execute a function reference), even though the `greeting()` function declaration doesn't occur until line 3?

Recall how Chapter 1 pointed out that all identifiers are registered to their respective scopes during compile time. Moreover, every identifier is *created* at the beginning of the scope it belongs to, **every time that scope is entered**.

The term most commonly used for making a variable available from the beginning of its enclosing scope, even though its declaration may appear further down in the scope, is called **hoisting**.

But hoisting alone doesn't fully answer the posed question. Sure, we can see an identifier called `greeting` from the beginning of the scope, but why can we **call** the `greeting()` function before it's been declared?

In other words, how does `greeting` have any value in it (the function reference), as soon as the scope first begins? That's a special characteristic of `function` declarations, called *function hoisting*. When a `function` declaration's name identifier is registered at the top of a scope, it is additionally initialized to that function's reference.

*Function hoisting* only applies to formal `function` declarations (specifically those which appear outside of blocks -- see "FiB" in Chapter 4), not to `function` expression assignments. Consider:

```js
greeting();
// TypeError

var greeting = function greeting() {
    console.log("Hello!");
};
```

Line one (`greeting();`) throws an error. But the *kind* of error thrown is very important to notice. A `TypeError` means we're trying to do something with a value that is not allowed. Depending on your JS environment, the error message would say something like, "'undefined' is not a function", or preferably, "'greeting' is not a function".

Notice that the error is **not** a `ReferenceError`. It's not telling us that it couldn't find `greeting` as an identifier in the scope. It's telling us that `greeting` was found but doesn't hold a function reference at that moment. Only functions can be invoked, so attempting to invoke some non-function value results in an error.

But what does `greeting` hold?

In addition to being hoisted, variables declared with `var` are also automatically initialized to `undefined` at the beginning of the scope. Once they're initialized, they're available to be used (assigned to, retrieved from, etc) throughout the whole scope.

So on that first line, `greeting` exists, but it holds only the default `undefined` value. It's not until line 3 that `greeting` gets assigned the function reference.

Pay close attention to the distinction here. A `function` declaration is hoisted **and initialized to its function value** (again, called *function hoisting*). A `var` variable is also hoisted, but it's only auto-initialized to `undefined`. Any subsequent `function` expression assignments to that variable don't happen until that statement is reached during run-time execution.

In both cases, the name of the identifier is hoisted. But the function value association doesn't get handled at initialization time unless the identifier was created in a formal `function` declaration.

Let's look at another example of *variable hoisting*:

```js
greeting = "Hello!";
console.log(greeting);
// Hello!

var greeting = "Howdy!";
```

Though `greeting` isn't declared until line 4, it's available to be assigned to as early as line 1. Why? There's two necessary parts to explain that: the identifier was hoisted, **and** it was automatically initialized to the value `undefined`.

| NOTE: |
| :--- |
| *Variable hoisting* of this sort probably feels unnatural, and many readers might rightly want to avoid it in their programs. But should *function hoisting* also be avoided? We'll explore this in more detail in Appendix A. |

## Hoisting: Yet Another Metaphor

Chapter 2 was full of metaphors (to illustrate scope), but here we are faced with yet another: hoisting itself. Rather than asserting hoisting as a concrete execution step the JS engine performs, it's more useful as a visualization of various actions JS takes in setting up the program **before execution**.

The typical assertion of what hoisting means is: *lifting* -- like lifting a heavy weight upward -- any identifiers all the way to the top of a scope. The explanation often given is that the JS engine will *rewrite* that program before execution, so that it looks more like this:

```js
var greeting;           // hoisted declaration moved to the top

greeting = "Hello!";    // the original line 1
console.log(greeting);
// Hello!

greeting = "Howdy!";    // `var` is gone!
```

The hoisting (metaphor) proposes that JS pre-processes the original program and re-arranges it slightly, so that all the declarations have been moved to the top of their respective scopes, before execution. Moreover, the hoisting metaphor asserts that `function` declarations are, in their entirety, hoisted to the top of each scope, as well.

Consider:

```js
studentName = "Suzy"
greeting();
// Hello Suzy!

function greeting() {
    console.log(`Hello ${ studentName }!`);
}

var studentName;
```

The "rule" of the hoisting metaphor is that function declarations get hoisted first, then variables immediately after all the functions. Thus, hoisting suggests that program is *re-written* by the JS engine to look like this:

```js
function greeting() {
    console.log(`Hello ${ studentName }!`);
}
var studentName;

studentName = "Suzy";
greeting();
// Hello Suzy!
```

The hoisting metaphor is convenient. Its benefit is allowing us to hand wave over the magical look-ahead pre-processing necessary to find all these declarations buried deep in scopes and somehow move (hoist) them to the top; we can thus think about the program as if it's executed by the JS engine in a **single pass**, top-down.

Single-pass seems more straightforward than Chapter 1's assertion of a 2-phase processing.

Hoisting as re-ordering code may be an attractive simplification, but it's not accurate. The JS engine doesn't actually rewrite the code. It can't magically look-ahead and find declarations. The only way to accurately find them, as well as all the scope boundaries in the program, would be to fully parse the code. Guess what parsing is? The first phase of the 2-phase processing! There's no magical mental gymnastics that gets around that fact.

So if the hoisting metaphor is (at best) inaccurate, what should we do with the term? It's still useful -- indeed, even members of TC39 regularly use it! -- but we shouldn't think of it as actual re-ordering of code.

| WARNING: |
| :--- |
| Incorrect or incomplete mental models may seem sufficient because they can occasionally lead to accidental right answers. But in the long run it's harder to accurately analyze and predict outcomes if your thinking isn't particularly aligned with how the JS engine works. |

I assert that hoisting *should* refer to the **compile-time operation** of generating run-time instructions for the automatic registration of a variable at the beginning of its scope, each time that scope is entered.

## Re-declaration?

What do you think happens when variable is declared more than once in the same scope?

Consider:

```js
var studentName = "Frank";

console.log(studentName);
// Frank

var studentName;

console.log(studentName);
// ???
```

What do you expect to be printed as that second message? Many believe the second `var studentName` has re-declared the variable (and thus "reset" it), so they expect `undefined` to be printed.

But is there such a thing as a variable being "re-declared" in the same scope? No.

If you consider this program from the perspective of the hoisting metaphor, the code would be re-ordered like this for execution purposes:

```js
var studentName;
var studentName;    // this is clearly a pointless no-op!

studentName = "Frank";
console.log(studentName);
// Frank

console.log(studentName);
// Frank
```

Since hoisting is actually about registering a variable at the beginning of a scope, there's nothing to be done in the middle of the scope where the original program actually had the second `var studentName` statement. It's just a no-op(eration), a dead pointless statement.

| TIP: |
| :--- |
| In our conversation-style from Chapter 2, *Compiler* would find the second `var` declaration statement and ask the *Scope Manager* if it had already seen a `studentName` identifier; since it had, there wouldn't be anything else to do. |

It's also important to point out that `var studentName;` doesn't mean `var studentName = undefined;`, as most people assume. Let's prove they're different by considering this variation of the program:

```js
var studentName = "Frank";

console.log(studentName);
// Frank

var studentName = undefined;   // let's add the initialization explicitly

console.log(studentName);
// undefined
```

See how the explicit `= undefined` initialization produces a different outcome than assuming it still happens implicitly even if omitted? In the next section, we'll revisit this topic of initialization of variables from their declarations.

So a repeated `var` declaration of the same identifier name in a scope is effectively a do-nothing statement. What about repeating a declaration within a scope using `let` or `const`?

```js
let studentName = "Frank";

console.log(studentName);

let studentName = "Suzy";
```

This program will not execute, but instead immediately throw a Syntax Error. Depending on your JS environment, the error message will indicate something like: "Identifier 'studentName' has already been declared." In other words, this is a case where attempted "re-declaration" is explicitly not allowed!

It's not just that two declarations involving `let` will throw this error. If either declaration uses `let`, the other can be either `let` or `var`, and an error will still occur, as illustrated with these two variations:

```js
var studentName = "Frank";
let studentName = "Suzy";
```

```js
let studentName = "Frank";
var studentName = "Suzy";
```

In both cases, a Syntax Error is thrown on the *second* declaration. In other words, the only way to "re-declare" a variable is to use `var` for all (two or more) of its declarations.

But why disallow it? The reason for the error is not technical per se, as `var` "re-declaration" has always been allowed; clearly, the same allowance could have been made for `let`. But it's really more of a "social engineering" issue. "Re-declaration" of variables is seen by some, including many on the TC39 body, as a bad habit that can lead to program bugs.

So when ES6 introduced `let`, they decided to prevent "re-declaration" with an error. When *Compiler* asks *Scope Manager* about a declaration, if that identifier has already been declared, and if either/both declarations were made with `let`, an error is thrown. The intended signal to the developer is, "Stop relying on sloppy re-declaration!".

| NOTE: |
| :--- |
| This is of course a stylistic opinion, not really a technical argument. Many developers agree with it, and that's probably in part why TC39 included the error (as well as conforming to `const`). But a reasonable case could have been made that staying consistent with `var`'s precedent was more prudent, and that such opinion-enforcement was best left to opt-in tooling like linters. We'll explore whether `var` (and its associated behavior) can still be useful in Appendix A. |

### Constants?

The `const` keyword is a little more constrained than `let`. Like `let`, `const` cannot be repeated with the same identifier in the same scope. But there's actually an overriding technical reason why that sort of "re-declaration" is disallowed, unlike `let` which disallows "re-declaration" mostly for stylistic reasons.

The `const` keyword requires a variable to be initialized:

```js
const empty;   // SyntaxError
```

`const` declarations create variables that cannot be re-assigned:

```js
const studentName = "Frank";
console.log(studentName);
// Frank

studentName = "Suzy";   // TypeError
```

The `studentName` variable cannot be re-assigned because it's declared with a `const`.

| WARNING: |
| :--- |
| The error thrown when re-assigning to `studentName` is a Type Error, not a Syntax Error. The subtle distinction here is actually pretty important, but unfortunately far too easy to miss. Syntax Errors represent faults in the program that stop it from even starting execution. Type Errors represent faults that arise during program execution. In the above snippet, `"Frank"` is printed out before we process the re-assignment of `studentName`, which then throws the error. |

So if `const` declarations cannot be re-assigned, and `const` declarations always require assignments, then we have a clear technical reason why `const` must disallow any "re-declarations":

```js
const studentName = "Frank";
const studentName = "Suzy";   // obviously this must be an error
```

Since `const` "re-declaration" must be disallowed (on technical grounds), TC39 essentially felt that `let` "re-declaration" should be disallowed as well.

### Loops

So it's clear from our previous discussion that JS doesn't really want us to "re-declare" our variables within the same scope. That probably seems like a straightforward admonition, until you consider what it means repeated execution of declaration statements in loops.

Consider:

```js
var keepGoing = true;

while (keepGoing) {
    let value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

Is `value` being "re-declared" repeatedly in this program? Will we get errors thrown?

No.

All the rules of scope (including "re-declaration" of `let`-created variables) are applied *per scope instance*. In other words, each time a scope is entered during execution, everything resets.

Each loop iteration is its own new scope instance, and within each scope instance, `value` is only being declared once. So there's no attempted "re-declaration", and thus no error.

Before we consider other loop forms, what if the `value` declaration in the previous snippet were changed to a `var`?

```js
var keepGoing = true;

while (keepGoing) {
    var value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

Is `value` being "re-declared" here, especially since we know `var` allows it? No. Because `var` is not treated as a block-scoping declaration (see Chapter 4), it attaches itself to the global scope. So there's just one `value`, in the same (global, in this case) scope as `keepGoing`. No "re-declaration"!

One way to keep this all straight is to remember that `var`, `let`, and `const` do not exist in the code by the time it starts to execute. They're handled entirely by the compiler.

What about "re-declaration" with other loop forms, like `for`-loops?

```js
for (let i = 0; i < 3; i++) {
    let value = i * 10;
    console.log(`${ i }: ${ value }`);
}
// 0: 0
// 1: 10
// 2: 20
```

It should be clear that there's only one `value` declared per scope instance. But what about `i`? Is it being "re-declared"?

To answer that, consider what scope `i` is in? It might seem like it would be in the outer (in this case, global) scope, but it's not. It's in the scope of `for`-loop body, just like `value` is. In fact, you could sorta think about that loop in this more verbose equivalent form:

```js
{
    let $$i = 0;  // a fictional variable for illustration

    for ( ; $$i < 3; $$i++) {
        let i = $$i;   // here's our actual loop `i`!
        let value = i * 10;
        console.log(`${ i }: ${ value }`);
    }
    // 0: 0
    // 1: 10
    // 2: 20
}
```

Now it should be clear: the illustrative `$$i`, as well as `i` and `value` variables, are all declared exactly once per scope instance. No "re-declaration" here.

What about other `for`-loop forms?

```js
for (let index in students) {
    // this is fine
}

for (let student of students) {
    // so is this
}
```

Same thing with `for..in` and `for..of` loops: the declared variable is treated as *inside* the loop body, and thus is handled per iteration (aka, per scope instance). No "re-declaration".

OK, I know you're thinking that I sound like a broken record at this point. But let's explore how `const` impacts these looping constructs.

Consider:

```js
var keepGoing = true;

while (keepGoing) {
    const value = Math.random();   // ooo, a shiny constant!
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

Just like the `let` variant of this program we saw earlier, `const` is being run exactly once within each loop iteration, so it's safe from "re-declaration" troubles. But things get more complicated when we talk about `for`-loops.

`for..in` and `for..of` are fine to use with `const`:

```js
for (const index in students) {
    // this is fine
}

for (const student of students) {
    // this is also fine
}
```

But not the general `for`-loop:

```js
for (const i = 0; i < 3; i++) {
    // oops, this is going to fail
    // after the first iteration
}
```

What's wrong here? We could use `let` just fine in this construct, and we asserted that it creates a new `i` for each loop iteration scope, so it doesn't even seem to be a "re-declaration".

Let's mentally "expand" that loop like we did earlier:

```js
{
    const $$i = 0;  // a fictional variable for illustration

    for ( ; $$i < 3; $$i++) {
        const i = $$i;   // here's our actual loop `i`!
        // ..
    }
}
```

Do you spot the problem? Our `i` is indeed just created once inside the loop. That's not the problem. The problem is the conceptual `$$i` that must be incremented each time with the `$$i++` expression. That's re-assignment, which isn't allowed for constants.

Remember, this "expanded" form is only a conceptual model to help you intuit the source of the problem. You might wonder if JS could have made the `const $$i = 0` instead into `let $ii = 0`, which would then allow `const` to work with our classic `for`-loop? It's possible, but then it would have been creating potentially surprising exceptions to `for`-loop semantics.

In other words, it's a rather arbitrary (and likely confusing) nuanced exception to allow `i++` in the `for`-loop header to skirt strictness the `const` assignment, but not allow other re-assignments of `i` inside the loop iteration, as is sometimes done. As such, the more straightforward answer is: `const` can't be used with the classic `for`-loop form because of the re-assignment.

Interestingly, if you don't do re-assignment, then it's valid:

```js
var keepGoing = true;

for (const i = 0; keepGoing; ) {
    keepGoing = (Math.random() > 0.5);
    // ..
}
```

This is silly. There's no reason to declare `i` in that position with a `const`, since the whole point of such a variable in that position is **to be used for counting iterations**. Just use a different loop form, like a `while` loop.

## Uninitialized Variables (aka, TDZ)

With `var` declarations, the variable is "hoisted" to the top of its scope. But it's also automatically initialized to the `undefined` value, so that the variable can be used throughout the entire scope.

However, `let` and `const` declarations are not quite the same in this respect.

Consider:

```js
console.log(studentName);
// ReferenceError

let studentName = "Suzy";
```

The result of this program is that a `ReferenceError` is thrown on the first line. Depending on your JS environment, the error message may say something like: "Cannot access 'studentName' before initialization."

| NOTE: |
| :--- |
| The error message as seen here used to be much more vague or misleading. Thankfully, I and others were successfully able to lobby for JS engines to improve this error message so it tells you what's wrong. |

That error message is very instructive as to what's wrong. `studentName` exists on line 1, but it's not been initialized, so it cannot be used yet. Let's try this:

```js
studentName = "Suzy";   // let's try to initialize it!
// ReferenceError

console.log(studentName);

let studentName;
```

Oops. We still get the Reference Error, but now on the first line where we're trying to assign to (aka, initialize!) this so-called "uninitialized" variable `studentName`. What's the deal!?

The real question is, how do we initialize an uninitialized variable? For `let` / `const`, the **only way** to do so is with the assignment attached to a declaration statement. An assignment by itself is insufficient!

Consider:

```js
// some other code

let studentName = "Suzy";

console.log(studentName);
// Suzy
```

Here, we are initializing the `studentName`, in this case to `"Suzy"` instead of `undefined`, by way of the `let` declaration statement form that's coupled with an assignment.

Alternately:

```js
// ..

let studentName;
// or:
// let studentName = undefined;

// ..

studentName = "Suzy";

console.log(studentName);
// Suzy
```

| NOTE: |
| :--- |
| That's interesting! Recall from earlier, we said that `var studentName;` is *not* the same as `var studentName = undefined;`, but here with `let`, they behave the same. The difference comes down to the fact that `var studentName` automatically initializes at the top of the scope, where `let studentName` does not. |

Recall that we asserted a few times so far that *Compiler* ends up removing any `var` / `let` / `const` declaration statements, replacing them with the instructions at the top of each scope to register the appropriate identifiers.

So if we analyze what's going on here, we see that an additional nuance is that *Compiler* is also adding an instruction in the middle of the program, at the point where the variable `studentName` was declared, to do the auto-initialization. We cannot use the variable at any point prior to that initialization occuring. The same goes for `const` as it does for `let`.

The term coined by TC39 to refer to this *period of time* from the entering of a scope to where the auto-initialization of the variable occurs, is: Temporal Dead Zone (TDZ). The TDZ is the time window where a variable exists but is still uninitialized, and therefore cannot be accessed in any way. Only the execution of the instructions left by *Compiler* at the point of the original declaration can do that initialization. After that moment, the TDZ is over, and the variable is free to be used for the rest of the scope.

By the way, "temporal" in TDZ does indeed refer to *time* not *position-in-code*. Consider:

```js
askQuestion();
// ReferenceError

let studentName = "Suzy";

function askQuestion() {
    console.log(`${ studentName }, what do you think?`);
}
```

Even though positionally the `console.log(..)` referencing `studentName` comes *after* the `let studentName` declaration, timing wise the `askQuestion()` function is invoked *before*, while `studentName` is still in its TDZ!

There's a common misconception that TDZ means `let` and `const` do not hoist. I think this is an inaccurate, or at least misleading, claim.

The actual difference is that `let` / `const` declarations do not automatically initialize, the way `var` does. The *debate* then is if the auto-initialization is *part of* hoisting, or not? I think auto-registration of a variable at the top of the scope (i.e., what I call "hoisting") and auto-initialization (to `undefined`) are distinct operations and shouldn't be lumped together under the single term "hoisting".

We've already seen `let` and `const` don't auto-initialize at the top of the scope. But let's prove that `let` and `const` *do* hoist (auto-register at the top of the scope), courtesy of our friend shadowing (see "Shadowing" in Chapter 3):

```js
var studentName = "Kyle";

{
    console.log(studentName);
    // ???

    // ..

    let studentName = "Suzy";

    console.log(studentName);
    // Suzy
}
```

What's going to happen with the first `console.log(..)` statement? If `let studentName` didn't hoist to the top of the scope, then it *should* print `"Kyle"`, right? At that moment, it seems, only the outer `studentName` would exist, so that's which variable the `console.log(..)` should access and print.

But instead, we're going to get a TDZ error at that first `console.log(..)`, because in fact, the inner scope's `studentName` **was** hoisted (auto-registered at the top of the scope). But what **didn't** happen (yet!) was the auto-initialization of that inner `studentName`; it's still unintialized at that moment, hence the TDZ violation!

So to summarize, TDZ errors occur because `let` / `const` declarations *do* hoist their declarations to the top of their scopes, but unlike `var`, they defer the auto-initialization of their variables until the moment in the code's sequencing where the original declaration appeared. This window of time (hint: temporal), whatever its length, is the TDZ.

How can you avoid TDZ errors?

My advice: always put your `let` and `const` declarations at the top of any scope. Shrink the TDZ window to zero (or near zero) time, and then it'll be moot.

But why is TDZ even a thing? Why didn't TC39 dictate that `let` / `const` auto-initialize the way `var` does? Just be patient, we'll come back to explore the *why* of TDZ in Appendix A.

## Finally Initialized

Working with variables has much more nuance than it seems at first glance. *Hoisting*, *(re)declaration*, and the *TDZ* are common sources of confusion for developers, especially those who have worked in other languages before coming to JS. Before moving on, make sure your mental model is more grounded with these aspects of JS scope and variables.

Hoisting is generally cited as an explicit mechanism of the JS engine, but it's really more a metaphor to describe the various ways JS handles variable declarations during compilation. But even as a metaphor, hoisting offers useful structure for thinking about the life-cycle of a variable -- when it's created, when it's available to use, when it goes away.

Declaration and re-declaration of variables tend to cause confusion when thought of as run-time operations. But if you shift to compile-time thinking for these operations, the quirks and *shadows* begin to shrink away.

The TDZ (temporal dead zone) error is strange and frustrating when encountered. Fortunately, TDZ is relatively straightforward to avoid if you're careful to place `let` / `const` declarations at the top of any scope.

After overcoming these stumbling blocks of variable scope, the next chapter examines what factors impact our decisions to locate variable declarations in specific scopes, especially nested blocks.
