# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Appendix A: Exploring Further

| NOTE: |
| :--- |
| Work in progress |

We will now explore a number of nuances and edges around many of the topics covered in the main text of this book. This is optional, supporting material.

Some people find diving too deeply into the rare corner cases creates nothing but noise and distraction, and that developers are better served by sticking to the well-tread surfaces. My approach has been criticized as being impractical and counterproductive. I understand and appreciate that perspective, even if I don't necessarily share it.

I believe it's better to be empowered by knowledge of how things work than to just gloss over details with assumptions and lack of curiosity. Ultimately, you will encounter situations where something bubbles up from a piece you hadn't explored. In other words, you won't get to spend all your time riding on the smooth *happy path*. Wouldn't you rather be prepared for the inevitable bumps of off-roading?

These discussions will also be more heavily influenced by my opinions than the main text was, so keep that in mind as you consume and consider what is presented. This appendix is a bit like a collection of mini-blog posts that expound on the book topics.

## Implied Scopes

Scopes are sometimes created in non-obvious places. In practice, these implied scopes don't often impact your program behavior, but it's still useful to know they're happening.

### Parameter Scope

Chapter 2's conversation metaphor implies that function parameters are basically the same as locally declared variables in the function scope. But that's not always true.

Consider:

```js
// outer/global scope: RED(1)

function getStudentName(studentID) {
    // function scope: BLUE(2)

    // ..
}
```

Here, `studentID` is a considered a "simple" parameter, so it does behave essentially as if it's in the BLUE(2) function scope. But if we change it to be a non-simple parameter, that's no longer technically the case. Parameter forms considered non-simple include parameters with default values, rest parameters (using `...`), and destructured parameters.

Consider:

```js
// outer/global scope: RED(1)

function getStudentName(/* BLUE(2) */ studentID = 0) {
    // function scope: GREEN(3)

    // ..
}
```

Here, the parameter list essentially becomes its own scope, and the function's main scope is then nested inside *that* scope.

Why? And what difference does it make? The non-simple parameter forms introduce various corner cases, so the parameter list becomes its own scope to more effectively deal with them.

Consider:

```js
function getStudentName(studentID = maxID, maxID) {
    // ..
}
```

Assuming left-to-right operations, the default `= maxID` for the `studentID` parameter requires a `maxID` to already exist (and to have been initialized). This code produces a TDZ error (Chapter 5). The reason is, `maxID` is declared in the parameter scope, but it's not yet been initialized because of the order of parameters. If the parameter order is flipped, no TDZ error occurs:

```js
function getStudentName(maxID,studentID = maxID) {
    // ..
}
```

The complication gets even more *in the weeds* if we introduce a function expression into the default parameter position, which then can create its own closure (Chapter 7) over parameters in this implied parameter scope:

```js
function whatsTheDealHere(id,defaultID = () => id) {
    id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 5
```

That snippet probably makes sense, because the `defaultID()` arrow function closes over the `id` parameter/variable, which we then re-assign to `5`. But now let's introduce a shadowing definition of `id` in the function scope:

```js
function whatsTheDealHere(id,defaultID = () => id) {
    var id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 3
```

Uh oh! The `var id = 5` is shadowing the `id` parameter, and the closure of the `defaultID()` function is over the parameter, not the function variable. This proves that there's a scope bubble around the parameter list.

But it gets even crazier than that!

```js
function whatsTheDealHere(id,defaultID = () => id) {
    var id;

    console.log(`local variable 'id': ${ id }`);
    console.log(`parameter 'id' (via closure): ${ defaultID() }`);

    console.log("reassigning 'id' to 5");
    id = 5;

    console.log(`local variable 'id': ${ id }`);
    console.log(`parameter 'id' (via closure): ${ defaultID() }`);
}

whatsTheDealHere(3);
// local variable 'id': 3
// parameter 'id' (via closure): 3
// reassigning 'id' to 5
// local variable 'id': 5
// parameter 'id' (via closure): 3
```

The strange bit here is the first console message. At that moment, the shadowing `id` local variable has just been `var id` declared, which Chapter 5 asserts is typically auto-initialized to `undefined` at the top of its scope. Why doesn't it print `undefined`?

In this specific corner case (for legacy compat reasons), JS doesn't auto-initialize `id` to `undefined`, but rather to the value of the `id` parameter (`3`)!

Though the two `id`s look at that moment like they're one variable, they're actually still separate (and in separate scopes). The `id = 5` assignment makes the divergence observable, where the `id` parameter stays `3` and the local variable becomes `5`.

My advice to avoid getting bitten by these weird nuances:

* Never shadow parameters with local variables

* Avoid using a default parameter function that closes over any of the parameters

At least now you're aware and can be careful about the fact that the parameter list is its own scope if any of the parameters are non-simple.

### Function Name Scope

In Chapter 3's "Function Name Scope" section, I asserted that the name of a function expression is added to the function's own scope. Recall:

```js
var askQuestion = function ofTheTeacher(){
    // ..
};
```

It's true that `ofTheTeacher` is not added to the enclosing scope (where `askQuestion` is declared), but it's also not *just* added to the scope of the function, the way you're likely assuming. It's another strange corner case of implied scope.

The name identifier of a function expression is in its own implied scope, nested between the outer enclosing scope and the main inner function scope.

If `ofTheTeacher` was in the function's scope, we'd expect an error here:

```js
var askQuestion = function ofTheTeacher(){
    // why is this not a duplicate declaration error?
    let ofTheTeacher = "Confused, yet?";
};
```

The `let` declaration form does not allow re-declaration (see Chapter 5). But this is perfectly legal shadowing, not re-declaration, because the two `ofTheTeacher` identifiers are in separate scopes.

You'll rarely run into any case where the scope of a function's name identifier matters. But again, it's good to know how these mechanisms actually work. To avoid being bitten, don't shadow function name identifiers.

## Anonymous vs. Named Functions

As discussed in Chapter 3, functions can be expressed either in named or anonymous form. It's vastly more common to use the anonymous form, but is that a good idea?

Every function in your program has a purpose. If it doesn't have a purpose, take it out, because you're just wasting space. If it *does* have a purpose, there *is* a name or descriptor of that purpose.

So far most seem to agree with me. But does that mean we should always put that name into the code? I would say, unequivocally, yes.

First of all, "anonymous" showing up in stack traces is just not all that helpful to debugging:

```js
btn.addEventListener("click",function(){
    setTimeout(function(){
        ["a",42].map(function(v){
            console.log(v.toUpperCase());
        });
    },100);
});

// Uncaught TypeError: Cannot read property 'toUpperCase' of null
//     at myProgram.js:4
//     at Array.map (<anonymous>)
//     at myProgram.js:3
```

Ugh. Compare to what is reported if I give the functions names:

```js
btn.addEventListener("click",function onClick(){
    setTimeout(function waitAMoment(){
        ["a",42].map(function allUpper(v){
            console.log(v.toUpperCase());
        });
    },100);
});

// Uncaught TypeError: v.toUpperCase is not a function
//     at allUpper (myProgram.js:4)
//     at Array.map (<anonymous>)
//     at waitAMoment (myProgram.js:3)
```

See how `waitAMoment` and `allUpper` names appear and give the stack trace more useful information/context for debugging? The program is more debuggable if we use reasonable names for all our functions.

| NOTE: |
| :--- |
| The unfortunate "anonymous" that still shows up there refers to the fact that `Array.map(..)` isn't present in our file, but is built into the JS engine. It's not from any confusion our program introduces by taking readability shortcuts. |

By the way, let's make sure we're on the same page about what a named function is:

```js
function thisIsNamed() {
    // ..
}

ajax("some.url",function thisIsAlsoNamed(){
   // ..
});

var notAName = function(){
    // ..
};

makeRequest({
    data: 42,
    cb /* also not a name */: function(){
        // ..
    }
});

var stillNotAName = function butThisIs(){
    // ..
};
```

"But wait!", you say. Some of those *are* named, right!?

```js
var notAName = function(){
    // ..
};

var config = {
    cb: function(){
        // ..
    }
};

notAName.name;
// notAName

config.cb.name;
// cb
```

These are referred to as *inferred* names. Inferred names are fine, but they don't really address the full concerns I have.

### So... What Else?

Yes, these inferred names might show up in stack traces, which is definitely better than "anonymous" showing up. But...

```js
function ajax(url,cb) {
    console.log(cb.name);
}

ajax("some.url",function(){
    // ..
});
// ""
```

Oops. Anonymous `function` expressions passed as callbacks are incapable of receiving an inferred name. The vast majority of all `function` expressions, especially anonymous ones, are used as callback arguments. None of these get a name.

That's not all:

```js
var config = {};

config.cb = function(){
    // ..
};

config.cb.name;
// ""

var [ noName ] = [ function(){} ];
noName.name
// ""
```

Any assignment of a `function` expression that's not a *simple assignment* will also skip name inferencing. So, in other words, unless you're careful and intentional about it, essentially almost all anonymous `function` expressions in your program will in fact have no name at all.

And even if a `function` expression *does* get an inferred name, that still doesn't count as being a full named function.

Without a lexical name identifier, the function has no internal way to refer to itself. Self-reference is important for things like recursion, event handling, etc. For example:

```js
// broken
runOperation(function(num){
    if (num <= 1) return 1;
    return num * oopsNoNameToCall(num - 1);
});

// also broken
btn.addEventListener("click",function(){
   console.log("should only respond to one click!");
   btn.removeEventListener("click",oopsNoNameHere);
});
```

Leaving off the lexical name from your callback makes it harder to reliably self-reference the function. You *could* declare a variable in an enclosing scope that references the function, but this variable is *controlled* by that enclosing scope -- it could be re-assigned, etc -- so it's not as reliable as the function having its own internal self-reference.

Lastly, and I think most importantly of all, leaving off a name from a function makes it harder for the reader to tell what the function's purpose is, at a quick glance. They have to read more of the code, including the code inside the function, and the surrounding code outside the function, to figure it out.

Consider:

```js
[ 1, 2, 3, 4, 5 ].filter(function(v){
    return v % 2 == 1;
});
// [ 1, 3, 5 ]

[ 1, 2, 3, 4, 5 ].filter(function keepOnlyOdds(v){
    return v % 2 == 1;
});
// [ 1, 3, 5 ]
```

There's just no reasonable argument to be made that **omitting** the name `keepOnlyOdds` from the first callback more effectively communicates to the reader the purpose of this callback. You saved 13 characters. But we lost important information. The name `keepOnlyOdds` very clearly tells the reader, at a quick first glance, what's happening.

The JS engine doesn't care about the name. But human readers of your code absolutely do.

Can the reader look at `v % 2 == 1` and figure out what it's doing? Sure. But they have to infer the purpose (and name) by mentally executing the code. Even a brief pause to do so slows down reading of the code. A good descriptive name makes this process almost effortless and instant.

Think of it this way: how many times does the author of this code need to figure out the purpose of a function before adding the name to the code? About once. Maybe two or three times if they need to adjust the name. But how many times will readers of this code have to figure out the name/purpose? Every single time this line is ever read. Hundreds of times. Thousands. More?

No matter the length or complexity of the function, my assertion is, the author should figure out a good descriptive name and add it to the code. Even the one-liner functions in `map(..)` and `then(..)` statements should be named:

```js
lookupTheRecords(someData)
.then(function extractSalesRecords(resp){
   return resp.allSales;
})
.then(storeRecords);
```

The name `extractSalesRecords` tells the reader the purpose of this `then(..)` handler *better* than just inferring that purpose from mentally executing `return resp.allSales`.

The only excuse for not including a name on a function is either laziness (don't want to type a few extra characters) or uncreativity (can't come up with a good name). If you can't figure out a good name, you don't understand the function and its purpose yet. The function is probably poorly designed, or it does too many things, and should be re-worked. Once you have a well-designed, single-purpose function, its proper name should become evident.

Here's a trick I use: while first writing a function, if I don't fully understand its purpose and can't think of a good name to use, I just use `TODO` as the name. That way, later when reviewing my code, I'm likely to find those name placeholders, and I'm more inclined (and more prepared!) to go back and figure out a better name, rather than just leave it as `TODO`.

All functions need names. Every single one. No exceptions. Any name you omit is making the program harder to read, harder to debug, harder to extend and maintain later.

### Arrow Functions

Arrow functions are **always** anonymous, even if (rarely) they're used in a way that gives them an inferred name. I just spent several pages explaining why anonymous functions are a bad idea. So you can probably guess what I think about arrow functions.

Don't use them as a general replacement for regular functions. They're more concise, yes, but that brevity comes at the cost of omitting key visual delimiters that help our brains quickly parse out what we're reading. And, to the point of this discussion, they're anonymous, which makes them worse for readability from that angle as well.

Arrow functions have a purpose, but that purpose is not to save keystrokes. Arrow functions have *lexical this* behavior, which is somewhat beyond the bounds of our discussion in this book.

Briefly: arrow functions don't define a `this` identifier keyword at all. If you use a `this` inside an arrow function, it behaves exactly as any other variable reference, which is that the scope chain is consulted to find a function scope (non-arrow function) where it is defined, and to use that one.

In other words, arrow functions treat `this` like any lexical variable.

If you are in the habit of using hacks like `var self = this`, or if you like to call `.bind(this)` on inner `function` expressions, just to force them to inherit a `this` from an outer function like it was a lexical variable, then `=>` arrow functions are the better option. They're designed specifically to fix that problem.

So, in the rare cases you need *lexical this*, use an arrow function. It's the best tool for that job. But just be aware that in doing so, you're accepting the downsides of an anonymous function. You should spend other efforts to mitigate the readability *cost*, such as descriptive variable names and code comments.

### IIFE Variations

All functions should have names. I said that a few times, right!? That includes IIFEs.

```js
(function(){
    // don't do this!
})();

(function doThisInstead(){
    // ..
})();
```

How do we come up with a name for an IIFE? Identify what the IIFE is there for. Why do you need a scope there? Are you hiding a cache variable for student records?

```js
var getStudents = (function StoreStudentRecords(){
    var studentRecords = [];

    return function getStudents() {
        // ..
    }
})();
```

I named the IIFE `StoreStudentRecords` because that's what it's doing: storing student records. Every IIFE should have a name. No exceptions.

IIFEs are typically defined by placing `( .. )` around the `function` expression, as shown in those previous snippets. But that's not the only way to define an IIFE. Technically, the only reason we're using that first surrounding set of `( .. )` is just so the `function` keyword isn't in a position to be a `function` declaration. But there are other syntactic ways to do so:

```js
!function thisIsAnIIFE(){
    // ..
}();

+function soIsThisOne(){
    // ..
}();
```

The `!`, `+`, and several other unary operators (operators with one operand) can all be placed in front of `function` to turn it into an expression. Then the final `()` call is valid, which makes it an IIFE.

I actually kind of like using the `void` unary operator when defining a standalone IIFE:

```js
void function yepItsAnIIFE() {
    // ..
}();
```

The reason I like `void` is, it communicates at the beginning of the function that this IIFE won't be returning any value.

However you define your IIFEs, give them some love by giving them names.

## Hoisting: Functions and Variables

Chapter 5 identified both *function hoisting* and *variable hoisting*. Since hoisting is often cited as mistake in the design of JS, I wanted to briefly explore why both these forms of hoisting *can* be beneficial and should still be considered.

First, *function hoisting*. To review, this program works because of *function hoisting*:

```js
getStudents();

// ..

function getStudents() {
    // ..
}
```

The `function` declaration is hoisted during compilation, which means that `getStudents` is an identifier declared for the entire scope. Additionally, the `getStudents` identifier is auto-initialized with the function reference, again at the beginning of the scope.

Why is this useful? The reason I prefer to take advantage of *function hoisting* is that it puts the *executable* code in any scope at the top, and any further declarations (functions) below. This means it's easier to find the code that will run in any given area, rather than having to scroll and scroll, hoping to find the end of a scope/function somewhere.

I take advantage of this positioning in all levels of scope:

```js
getStudents();

// *************

function getStudents() {
    var whatever = doSomething();

    // other stuff

    return whatever;

    // *************

    function doSomething() {
        // ..
    }
}
```

When I first open a file like that, the very first line is executable code that kicks off its behavior. That's very easy to spot! Then, if I ever need to go find and inspect `getStudents()`, I like that its first line is also executable code. Only if I need to see the details of `doSomething()` do I go and find its definition down below.

In other words, I think *function hoisting* makes code more readable by making the reading of code more flowing and progressive, from top to bottom.

What about *variable hoisting*? Remember, this only applies to `var` declarations, not `let` or `const`.

Before I continue, I'll just admit: in almost all cases, I completely agree that *variable hoisting* is a bad idea:

```js
pleaseDontDoThis = "bad idea";

// much later

var pleaseDontDoThis;
```

While that kind of inverted ordering was helpful for *function hoisting*, here I think it's usualy going to make code harder to understand.

But there's one exception that I've found, somewhat rarely, in my own coding. It has to do with where I place my `var` declarations inside a module definition.

Here's how I typically structure my CommonJS module definitions in Node:

```js
// dependencies
var aModuleINeed = require("very-helpful");
var anotherModule = require("kinda-helpful");

// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    // ..
});

// ********************************
// private implementation

var cache = { };
var otherData = [ ];

function getStudents() {
    // ..
}

function addStudents() {
    // ..
}

function otherPrivateStuff() {
    // ..
}
```

Notice how the `cache` and `otherData` variables are in the "private" section of the module layout? That's because I don't plan to expose them publicly. So I organize the module so they're located along side the other implementation details of the module.

But I've had a few rare cases where I needed the assignments of those values to happen *above*, before I declare the exported public API of the module. For instance:

```js
// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    // ..

    refreshData: refreshData.bind(cache)
});
```

I need the `cache` variable to have already been assigned a value, because that value is used in the initialization of the public API.

Should I just move the `var cache = { .. }` up to the top, above this public API initialization? Well, perhaps. But now it's less obvious that `var cache` really is a *private* implementation detail.

Here's the compromise I've used, again somewhat rarely:

```js
cache = {};

// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    // ..

    refreshData: refreshData.bind(cache)
});

// ********************************
// private implementation

var cache /* = {}*/;
```

See the *variable hoisting*? I've declared the `cache` down where it belongs, logically, but in this rare case I've used it up above, in the area where its initialization is needed earlier. I even left a hint at the value that's assigned to `cache` in a code comment.

That's literally the only case I've ever found for leveraging *variable hoisting* -- specifically, for assigning to a variable earlier in a scope than its declaration. But, I think it's a reasonable exception to employ with caution.

## The Case for `var`

Speaking of *variable hoisting*, let's have some real talk for a bit about `var`, a favorite villain devs like to blame for many of the woes of JS development. In Chapter 5, we explored `let` / `const` and promised we'd revisit where `var` falls in the whole mix.

`var` is fine, and works just fine. It's been around for 25 years, and it'll be around and useful and functional for another 25 years or more. Claims that `var` is broken, deprecated, outdated, dangerous, or ill-designed are bogus bandwagoning.

Does that mean `var` is the right declarator for every single declaration in your program? Certainly not. But it still has its place in your programs. Refusing to use it because someone on the team chose an aggressive linter opinion that chokes on `var` is cutting off your nose to spite your face.

OK, now that I've got you really riled up, let me try to explain my assertions.

First of all, I'm a fan of `let`, for block-scoped declarations. I really dislike TDZ and I think that was a mistake. But `let` is great. I use it often. In fact, I probably use it as much or more than I use `var`.

### `const`antly Confused

`const` on the other hand, I don't use as often. I'm not going to dig into all the reasons why, but it comes down to `const` not *carrying its own weight*. That is, while there's a tiny bit of benefit of `const` in some cases, that benefit is outweighed by the long history of troubles around `const` confusion in a variety of languages, long before it ever showed up in JS.

`const` pretends to create values that can't be mutated -- a misconception that's extremely common in developer communities across many languages -- whereas what it really does is prevent re-assignment.

```js
const studentIDs = [ 14, 73, 112 ];

// later

studentIDs.push(6);   // whoa, wait... what!?
```

Using a `const` with a mutable value (like an array or object) is asking for a future developer (or reader of your code) to fall into the trap you set, which was that they either didn't know, or sorta forgot, that *value immutability* isn't at all the same thing as *assignment immutability*.

I just don't think we should set those traps. The only time I ever use `const` is when I'm assigning an already-immutable value (like `42` or `"Hello, friends!"`), and when it's clearly a "constant" in the sense of being a named placeholder for a literal value, for semantic purposes. That's what `const` is best used for. That's pretty rare in my code, though.

If variable re-assignment were a big deal, then `const` would be more useful. But variable re-assignment just isn't that big of a deal. There's a long list of things that lead to bugs in programs, and "accidental re-assignment" is way, way down that list.

Combine that with the fact that `const` (and `let`) are supposed to be used in blocks, and blocks are supposed to be short, and you have a really small window of your code where a `const` declaration is legitimately helping you. A `const` on line 1 of your 10 line block only tells you something about the next 9 lines. And the thing it tells you is already obvious by glancing down those 9 lines: the variable is never on the left-hand side of an `=`; it's not re-assigned.

That's it, that's all `const` really does. Other than that, it's not very useful. Compared to the confusion of value vs assignment immutability, `const` loses a lost of its luster.

A `let` (or `var`!) that's never re-assigned is behaviorally a "constant", even though it doesn't have the compiler guarantee.

### `var` *and* `let`

In my mind, `const` is pretty rarely useful, so this is only two-horse race between `let` and `var`. But it's not really a race either, because there doesn't have to be just one winner. They both win... different races.

The fact is, you should be using both `var` and `let` in your programs. They are not interchangable. You shouldn't use `var` where a `let` is called for, but you also shouldn't use `let` where a `var` is most appropriate.

So where should we still use `var`? Under what circumstances is it a better choice than `let`?

For one, I always use `var` in the top-level scope of any function, regardless of whether that's at the beginning, middle, or end of the function. I also `var` in the global scope, though I try to minimize usage of the global scope.

Why use `var` for function scoping? Because that's exactly what `var` does. There literally is no better tool for the job of function scoping a declaration than a declarator who has, for 25 years, done exactly that.

You *could* use `let` in this top-level scope, but it's not the best tool for that job. I also find that if you use `let` everywhere, then you lose clarity on which declarations are designed to be localized and which ones are to be used throughout the function.

By contrast, I rarely ever use a `var` inside a block. That's what `let` is for. Use the best tool for the job. If you see a `let`, it tells you that you're dealing with a localized declaration. If you see `var`, it tells you that you're dealing with a function-wide declaration. Simple as that.

```js
function getStudents(data) {
    var studentRecords = [];

    for (let record of data.records) {
        let id = `student-${ record.id }`;
        studentRecords.push({
            id,
            record.name
        });
    }

    return studentRecords;
}
```

The `studentRecords` variable is intended for use across the whole function. `var` is the best declarator to tell the reader that. By contrast, `record` and `id` are intended for use only in the narrower scope of the loop iteration, so `let` is the best tool for that job.

In addition to this *best tool* stylistic argument, `var` has a few other characteristics that, in certain circumstances, make it more preferable.

One example is when a loop is exclusively using a variable, but its conditional clause cannot see block-scoped declarations inside the iteration:

```js
function commitAction() {
    do {
        let result = commit();
        var done = result && result.code == 1;
    } while (!done);
}
```

Here, `result` is clearly only used inside the block, so we use `let`. But `done` is a bit different. It's only useful for the loop, but the `while` clause cannot see `let` declarations that appear inside the loop. So we compromise and use `var`, so that `done` is hoisted to the outer scope where it can be seen.

The alternative -- declaring `done` outside the loop -- separates it from where it's first used, and either neccesitates picking a default value to assign, or worse, leaving it unassigned and thus looking ambiguous to the reader. I think `var` inside the loop is slightly preferable here.

Another helpful characteristic of `var` is declarations inside unintended blocks. Unintended blocks are blocks that are created because the syntax requires a block, but where the intent of the developer is not really to create a localized scope block. The best illustration of unintended scope is the `try..catch` statement:

```js
function getStudents() {
    try {
        // not really a block

        var records = fromCache("students");
    }
    catch (err) {
        // oops, fall back to a default
        var records = [];
    }

    // ..
}
```

There are other ways to structure this code, yes. But I think this is the *best* way, given various tradeoffs.

I don't want to declare `records` (with `var` or `let`) outside of the `try` block, and then assign to it in one or both blocks. I prefer initial declarations to always be as close as possible (ideally, same line) to the first usage of the variable. In this simple example, that would only be a couple of lines distance, but in real code it can grow to many more lines. The bigger the gap, the harder it is to figure out what variable from what scope you're assigning to. `var` makes it less ambiguous.

Also notice I used `var` in both the `try` and `catch` blocks. That's because I want to signal to the reader that no matter which path occurs, `records` always gets declared. Technically, that's because `var` is hoisted once to the function scope. But it's still a nice stylistic signal to remind the reader of what either `var` will ensure. If `var` were only used in one of the blocks, and you were only reading the other block, you couldn't easily tell where `records` was coming from.

This is, in my opinion, a little super power of `var`. Not only can it escape the unintentional `try..catch` blocks, but it's allowed to appear multiple times in a function's scope. You can't do that with `let`, but you can do it with `var`. It's not bad, it's actually a helpful feature. Think of `var` more like a declarative annotation that's reminding you, each usage, where the variable comes from. "Ah ha, right, it belongs to the function."

This repeated-annotation super power is useful in other cases, too. For example:

```js
function getStudents() {
    var data = [];

    // do something with data

    // .. 50 more lines of code ..

    // purely an annotation to remind us
    var data;

    // use data again

    // ..
}
```

The second `var data` is not re-declaring `data`, it's just annotating for the readers' benefit that `data` is a function-wide declaration. That way, the reader doesn't need to scroll up 50+ lines of code to find the initial declaration.

I'm perfectly fine with re-using variables for multiple purposes throughout a function scope. I'm also perfectly fine with having two usages of a variable be separated by quite a few lines of code. In both cases, the ability to safely "re-declare" (annotate) with `var` helps make sure I can tell where my `data` is coming from, no matter where I am in the function.

Again, sadly, `let` cannot do this.

There are other nuances and scenarios when `var` turns out to offer some assistance, but I'm not going to belabor the point any further. The takeaway is, `var` can be useful in our programs alongside `let` (and the occassional `const`).

Don't just throw away a useful tool like `var` because someone shamed you into thinking it wasn't cool anymore. Don't avoid `var` because one years ago you got confused. Learn these tools and use them each for what they're best at.

## What's the Deal with TDZ?

// TODO

## Are Synchronous Callbacks Still Closures?

// TODO

## Classic Module Variations

// TODO
