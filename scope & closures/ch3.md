# You Don't Know JS: Scope & Closures
# Chapter 3: Function vs. Block Scope

As we explored in Chapter 2, scope consists of a series of "bubbles" that each act as a container or bucket, in which identifiers (variables, functions) are declared. These bubbles nest neatly inside each other, and this nesting is defined at author-time.

But what exactly makes a new bubble? Is it only the function? Can other structures in JavaScript create bubbles of scope?

## Function Scope

The most common answer to those questions is that JavaScript *only* has function-based scope. That is, each function you declare creates a bubble for itself, but no other structures create their own scope bubbles. As we'll see in just a little bit, this is not quite true.

But first, let's explore function scope and its implications.

Consider this code:

```js
function foo(a) {
	var b = 2;

	// some code

	function bar() {
		// ...
	}

	// more code

	var c = 3;
}
```

In this snippet, the scope bubble for `foo(..)` includes identifiers `a`, `b`, `c` and `bar`. It doesn't matter *where* in the scope a declaration appears, the variable or function belongs to the containing scope bubble, regardless. We'll explore how exactly *that* works in the next chapter.

`bar(..)` has its own scope bubble. So does the global scope, which has just one identifier attached to it: `foo`.

Because `a`, `b`, `c`, and `bar` all belong to the scope bubble of `foo(..)`, they are not accessible outside of `foo(..)`. That is, the following code would all result in `ReferenceError` errors, as the identifiers are not available to the global scope:

```js
bar(); // fails

console.log(a, b, c); // all 3 fail
```

However, all these identifiers (`a`, `b`, `c`, `foo`, and `bar`) are accessible *inside* of `foo(..)`, and indeed also available inside of `bar(..)` (assuming there are no shadow identifier declarations inside `bar(..)`).

Function scope also encourages the idea that all variables belong to the function, and can be used and re-used throughout the entirety of the function (and indeed, accessible even to nested scopes). This design approach can be quite useful, and certainly can make full use of the "dynamic" nature of variables to take on values of different types.

On the other hand, if you don't take careful precautions, variables existing across the entirety of a scope can lead to all sorts of unexpected pitfalls.

## Hiding In Plain Scope

The traditional way of thinking about functions is that you declare a function, and then add code inside it. But the inverse thinking is equally powerful and useful: take any arbitrary section of code you've written, and wrap a function declaration around it.

The practical effect of this approach is to create a scope bubble around the code in question, which means that any declarations (variable or function) in that code will now be tied to the scope of the new wrapping function, rather than the previously enclosing scope. In other words, you can "hide" variables and functions by enclosing them in the scope of a function.

Why would "hiding" variables and functions be a useful technique?

There's a variety of reasons motivating this scope-based hiding. They tend to spring from the software design principle "Principle of Least Privilege" [^note-leastprivilege], also sometimes called "Least Authority" or "Least Exposure". This principle states that in the design of software, such as the API for a module/object, you should expose only what is minimally necessary, and "hide" everything else.

This principle extends to the choice of which scope to contain variables and functions. If all variables and functions were in the global scope, they would of course be accessible to any nested scope. But this would violate the "Least..." principle in that you are (likely) exposing many variables or functions which you should otherwise keep private, as proper use of the code would discourage access to those variables/functions.

For example:

```js
function doSomething(a) {
	b = a + doSomethingElse(a * 2);

	return b * 3;
}

function doSomethingElse(a) {
	return a - 1;
}

var b;

doSomething(2); // 15
```

In this snippet, the `b` variable and the `doSomethingElse(..)` function, are likely "private" details of how `doSomething(..)` does its job. Giving the enclosing scope "access" to `b` and `doSomethingEles(..)` is not only unnecessary but also possibly "dangerous", in that they may be used in unexpected ways, intentionally or not, and this may violate pre-condition assumptions of `doSomething(..)`.

A more "proper" design would hide these private details inside the scope of `doSomething(..)`, such as:

```js
function doSomething(a) {
	function doSomethingElse(a) {
		return a - 1;
	}

	var b;

	b = a + doSomethingElse(a * 2);

	return b * 3;
}

doSomething(2); // 15
```

Now, `b` and `doSomethingElse(..)` are not accessible to any outside influence, instead controlled only by `doSomething(..)`. The functionality and end-result has not been affected, but the design keeps private details private, which is usually considered better software.

### Collision Avoidance

Another benefit of "hiding" variables and functions inside a scope is to avoid unintended collision between two different identifiers with the same name but different intended usages. Collision results often in unexpected overwriting of values.

For example:

```js
function foo() {
	function bar(a) {
		i = 3;
		console.log(a + i);
	}

	for (var i=0; i<10; i++) {
		bar(i * 2); // oops, inifinite loop ahead!
	}
}

foo();
```

The `i = 3` assignment inside of `bar(..)` overwrites, unexpectedly, the `var i` that was declared in `foo(..)` at the for-loop. In this case, it will result in an infinite loop, because `i` is set to a fixed value of `3` and that will forever remain `< 10`.

The assignment inside `bar(..)` needs to declare a local variable to use, regardless of what identifier name is chosen. `var i = 3;` would fix the problem (and would create the previously mentioned "shadowed variable" declaration for `i`). An *additional*, not alternate, option is to pick another identifier name entirely, such as `var j = 3;`. But your software design may naturally call for the same identifier name, so utilizing scope to "hide" your inner declaration is your best/only option.

A particularly strong example of (likely) variable collision occurs in the global scope. Multiple libraries loaded into your program can quite easily collide with each other if they don't properly hide their internal/private functions and variables.

Such libraries typically will create a single variable declaration, often an object, with a sufficiently unique name, in the global scope. This object is then used as a "namespace" for that library, where all specific exposures of functionality are done as properties off that namespace, rather than as top-level lexically scoped identifiers.

For example:

```js
var MyReallyCoolLibrary = {
	awesome: "stuff",
	doSomething: function() {
		// ...
	},
	doAnotherThing: function() {
		// ...
	}
}
```

#### Module Management

Another option for collision avoidance is the more modern "module" approach, using any of various dependency managers. Using these tools, no libraries ever add any identifiers to the global scope, but are instead required to have their identifier(s) be explicitly imported into another specific scope through usage of the dependency manager's various mechanisms.

It should be observed that these tools do not possess "magic" functionality that is exempt from lexical scoping rules. They simply use the rules of scoping as explained here to enforce that no identifiers are injected into any shared scope, and are instead kept in private, non-collision-susceptible scopes, which prevents any accidental scope collisions.

As such, you can code defensively and achieve the same results as the dependency managers do without actually needing to use them, if you so choose. See the later chapter on Closure for more information about the module pattern.

## IIFE

We've seen that we can take any snippet of code and wrap a function around it, and that effectively "hides" any enclosed variable or function declarations from the current scope inside that function's inner scope.

For example:

```js
var a = 2;

function foo() { // <-- insert this

	var a = 3;
	console.log(a); // 3

} // <-- and this
foo(); // <-- and this

console.log(a); // 2
```

While this technique "works", it is not necessarily very ideal. There are a few problems it introduces. The first is that we have to declare a named-function `foo()`, which means that the identifier name `foo` itself "pollutes" the enclosing scope (global, in this case). We also have to explicitly call the function by name (`foo()`) so that the wrapped code actually executes.

It would be more ideal if the function didn't need a name (or, rather, the name didn't pollute the enclosing scope), and if the function could automatically be executed.

Fortunately, JavaScript offers us just such a solution to both problems.

```js
var a = 2;

(function foo(){ // <-- insert this

	var a = 3;
	console.log(a); // 3

})(); // <-- and this

console.log(a); // 2
```

Let's break down what's happening here.

First, notice that the wrapping function statement starts with `(function...` as opposed to just `function`. While this may seem like a minor detail, it's actually a major change. Instead of treating the function as a standard declaration, the function is treated as a function-expression.

The easiest way to distinguish is if the word "function" is the very first thing in a statement (not just a line, but a statement), then it's a declaration. Otherwise, it's an expression. You are probably most familiar with function expressions as they are used in callback parameters, such as when you do:

```js
setTimeout(function(){
	console.log("I waited 1 second!");
},1000);
```

We see what is called an "anonymous function expression", because `function()...` has no name identifier on it. Anonymous functions can be expressions, but you cannot have an anonymous function declaration -- that's illegal JS grammar.

**Note:** Anonymous function expressions are easy to type, and many libraries and tools tend to encourage this style of code. However, they are less desirable in that they create harder to debug code. Also, naming your function expressions removes any need to ever use the deprecated `arguments.callee` to refer to the current function from within itself, for instance to re-invoke a function for recursion, etc.

Notice back in the previous snippet that we kept the name `foo` on our function expression. This is, not surprisingly, called a "named function expression". Named function expressions are, generally, a more preferred form of function expressions. Other than typing fatigue, there's pratically no benefit to the anonymous function expression form.

But importantly, we now see the first major difference in our wrapping-function technique: the name `foo` when used in a declaration is, obviously, bound (scoped) as an identifier in the enclosing scope (so that we can call it like `foo()`), but the name `foo` when used in a function expression is scoped only to the function itself, and *not* to the enclosing scope.

In other words, `(function foo(){ .. })` as an expression means the identifier `foo` is found *only* in the scope where the `..` indicates, not in the containing scope.

Now that we have a function as an expression by virtue of wrapping it in a `( )` pair, we can execute that function by adding another `()` on the end, like `(function foo(){ .. })()`. The first enclosing `( )` pair makes the function an expression, and the second `()` executes the function.

This pattern is so common, a few years ago the community agreed on a term for it: IIFE, which stands for **I**mmediately **I**nvoked **F**unction **E**xpression.

Of course, IIFE's don't need names, necessarily, so we could have used `(function(){ .. })()`, which is the traditional IIFE form. On the other hand, anonymous function expressions are less desirable because they are harder to understand in a debug stack trace, so giving your IIFE a name is perhaps a good idea.

```js
var a = 2;

(function IIFE(){

	var a = 3;
	console.log(a); // 3

})();

console.log(a); // 2
```

There's a slight variation on the traditional IIFE form (`(function(){ .. })()`), which some prefer: `(function(){ .. }())`. Look closely to see the difference. In the first form, the function expression is wrapped in `( )`, and then the invoking `()` pair is on the outside. In the second form, the invoking `()` pair is moved to the inside of the `( )` wrapping pair.

These two forms are identical in functionality. It's purely a stylistic choice which you prefer.

Another variation on IIFE's which is quite common is to use the fact that they are, in fact, just function calls, and pass in parameter(s), even renaming them.

For instance:

```js
var a = 2;

(function IIFE( global ){

	var a = 3;
	console.log(a); // 3
	console.log(global.a); // 2

})( window );

console.log(a); // 2
```

We pass in the `window` object reference, but we name the parameter `global`, so that we have a clear stylistic delineation for global vs. non-global references. Of course, you can pass in anything from an enclosing scope you want, and you can name the parameter(s) anything that suits you. This is mostly just stylistic choice.

Still another variation of the IIFE inverts the order of things, where the function to execute is given second, after the invocation and parameters to pass to it. This pattern is used in the UMD (Universal Module Definition) project. Some people find it a little cleaner to understand, though it is slightly more verbose.

```js
var a = 2;

(function IIFE( def ){
	def( window );
})(function def( global ){

	var a = 3;
	console.log(a); // 3
	console.log(global.a); // 2

});

console.log(a); // 2
```

## Block Scope

While functions are the most common unit of scope, and certainly the most wide-spread of the design approaches in the majority of JS in circulation, other units of scope are possible, and the usage of these other scope units can lead to even better, cleaner to maintain code.

Many languages other than JavaScript support Block Scope, and so developers from those languages are accustomed to the mindset, whereas those who've primarily only worked in JavaScript may find the concept slightly foreign.

But even if you've never written a single line of code in block-scoped fashion, you are still probably familiar with this extremely common idiom in JavaScript:

```js
for (var i=0; i<10; i++) {
	console.log(i);
}
```

We declare the variable `i` directly inside the for-loop head, most likely because our *intent* as developers is to use `i` only within the context of that for-loop, and essentially ignore the fact that the variable actually scopes itself to the enclosing scope (function or global).

That's what block-scoping is all about. Declaring variables as close as possible, as local as possible, to where they will be used. Another example:

```js
// some code

if (foo) {
	var bar = foo * 2;
	bar = something(bar);
	console.log(bar);
}

// more code
```

We are using a `bar` variable only in the context of the if-statement, so it makes a kind of sense that we would declare it inside the if-block. However, where we declare variables is not relevant when using `var`, because they will always belong to the enclosing scope. This snippet is essentially "fake" block-scoping, for stylistic reasons, and relying on self-enforcement not to accidentally use `bar` in another place in that scope.

Block scope is a tool to extend the earlier "Principle of Least ~~Privilege~~ Exposure" [^note-leastprivilege] from hiding information in functions to hiding information in blocks of our code. Why pollute the entire scope of a function with the `i` variable that is only going to be (or only *should be*, at least) used for the for-loop?

But, the sad reality is that, on the surface, JavaScript has no facility for block scope.

That is, until you dig a little further.

### `with`

We learned about `with` in Chapter 2. While it is a frowned upon construct, it *is* an example of (a form of) block scope, in that the scope that is created from the object only exists for that `with` statement, and not anywhere else in the enclosing scope.

### `try/catch`

It is a very little known fact that JavaScript specified the variable declaration in the `catch` clause of a `try/catch` to be block-scoped to the `catch` block.

For instance:

```js
try {
	undefined(); // illegal operation!
}
catch (err) {
	console.log(err); // works!
}

console.log(err); // ReferenceError: `err` not found
```

As you can see, `err` exists only in the `catch` clause, and throws an error when you try to reference it elsewhere.

**Note:** While this behavior has been specified and true of practically all standard JS environments (except perhaps old-n-busted IE), many linters seem to still complain if you have two or more `catch` clauses in the same scope which each declare their error variable with the same identifier name. This is not actually a re-definition, since the variables are safely block-scoped, but the linters still seem to, annoyingly, complain about this fact.

The block-scoping nature of `catch` may seem like a useless academic fact, but see Appendix B for more information on just how useful it might be.

### `let`

Thus far, we've seen that JavaScript only has some strange niche behaviors which expose block scope functionality. If that were all we had, and *it was* for many, many years, then block scoping would never be useful to the JavaScript developer.

Fortunately, ES6 changes that, and introduces a new keyword, `let`, which sits alongside `var` as another way to declare a variable.

The `let` keyword attaches the variable declaration to the scope of whatever block (commonly a `{ .. }` pair) it's contained in. In other words, `let` hijacks any block's scope for its variable declaration.

```js
// some code

if (foo) {
	let bar = foo * 2;
	bar = something(bar);
	console.log(bar);
}

console.log(bar); // ReferenceError

// more code
```

A particular case where `let` shines is in the for-loop case as we discussed previously.

```js
for (let i=0; i<10; i++) {
	console.log(i);
}

console.log(i); // ReferenceError
```

Not only does `let` in the for-loop head bind the `i` to the for-loop body, but in fact, it re-binds it to each *iteration* of the loop, making sure to re-assign it the value that it had at the end of the previous loop iteration.

Here's another way of illustrating more clearly the per-iteration binding behavior that occurs:

```js
{
	let j;
	for (j=0; j<10; j++) {
		let i = j; // re-bound for each iteration!
		console.log(i);
	}
}
```

The reason why this per-iteration binding is interesting will become clear in Chapter 5.

**Note:** Because `let` declarations attach to arbitrary blocks rather than to the enclosing function's scope (or global), there can be gotchas where existing code has a hidden reliance on function-scoped `var`, and replacing the `var` with `let` may require additional care when refactoring code.

Consider:

```js
if (foo) {
	var bar = 3;

	if (baz > bar) {
		console.log(baz);
	}

	// ...
}
```

This code is fairly easily re-factored as:

```js
if (foo) {
	var bar = 3;

	// ...
}

if (baz > bar) {
	console.log(baz);
}
```

But, be careful of such changes when using block-scoped variables:

```js
if (foo) {
	let bar = 3;

	if (baz > bar) { // <-- don't forget `bar`!
		console.log(baz);
	}

	// ...
}
```

See Appendix B for an alternate style of block-scoping which may provide easier to maintain/refactor code in these scenarios.

### `const`

In addition to `let`, ES6 also introduces `const`, which creates a block-scoped variable whose value is fixed. Any attempt to change that value at a later time results in an error.

```js
if (foo) {
	var a = 2;
	const b = 3;

	a = 3; // just fine!
	b = 4; // error!
}

console.log(a); // 3
console.log(b); // ReferenceError!
```

## Review (TL;DR)

Functions are the most common unit of scope in JavaScript. Variables and functions that are declared inside another function are essentially "hidden" from any of the enclosing "scopes", which is an intentional design principle of good software.

But functions are by no means the only unit of scope. Block-scope refers to the idea that variables and functions can belong to an arbitrary block (generally, any `{ .. }` pair) of code, rather than only to the enclosing function.

Starting with ES3, the `try/catch` structure has block-scope in the `catch` clause. Also, though frowned-upon for its negative performance (and other) side-effects, the `with` block is also a form of block-scoping.

In ES6, the `let` keyword (a cousin to the `var` keyword) is introduced to allow declarations of variables in any arbitrary block of code. `if (..) { let a = 2; }` will declare a variable `a` that essentially hijacks the scope of the `if`'s `{ .. }` block and attaches itself there, instead of to the enclosing scope (function or global).

Though some seem to believe such, block scope should not be taken as an outright replacement of function scope. Both functionalities co-exist, and developers can and should use both function-scope and block-scope techniques to produce better, more readable/maintainable code.

[^note-leastprivilege]: [Principle of Least Privilege](http://en.wikipedia.org/wiki/Principle_of_least_privilege)
