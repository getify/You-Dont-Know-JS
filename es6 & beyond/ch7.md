# You Don't Know JS: ES6 & Beyond
# Chapter 7: Meta Programming

Meta Programming is programming where the operation targets the behavior of the program itself. In other words, it's programming the programming of your program. Yeah, a mouthful, huh!?

For example, if you probe the relationship between one object `a` and another `b` -- are they `[[Prototype]]` linked? -- using `a.isPrototype(b)`, this is commonly referred to as introspection, a form of meta programming. Macros (which don't exist in JS, yet) --  where the code modifies itself at compile time -- are another common example of meta programming.

The goal of meta programming is to leverage the language's own intrinsic capabilities to make the rest of your code more descriptive, expressive, and/or flexible. Because of the *meta* nature of meta programming, it's somewhat difficult to put a more precise definition on it than that. The best way to understand meta programming is to see it through example.

ES6 adds a few new forms/features for meta programming which we'll briefly review here.

## Function Names

There are cases where your code may want to introspect on itself and ask what the name of some function is. If you ask what a function's name is, the answer is surprisingly somewhat ambiguous. Consider:

```js
function daz() {
	// ..
}

var obj = {
	foo: function() {
		// ..
	},
	bar: function baz() {
		// ..
	},
	bam: daz,
	zim() {
		// ..
	}
};
```

In this previous snippet, "what is the name of `obj.foo()`" is slightly nuanced. Is it `"foo"`, `""`, or `undefined`? And what about `obj.bar()` -- is it named `"bar"` or `"baz"`? Is `obj.bam()` named `"bam"` or `"daz"`? What about `obj.zim()`?

Moreover, what about functions which are passed as callbacks, like:

```js
function foo(cb) {
	// what is the name of `cb()` here?
}

foo( function(){
	// I'm anonymous!
} );
```

There are quite a few ways that functions can be expressed in programs, and it's not always clear and unambiguous what the "name" of that function should be.

More importantly, we need to distinguish whether the "name" of a function refers to its `name` property -- yes, functions have a property called `name` -- or whether it refers to the lexical binding name, such as `bar` in `function bar() { .. }`.

The lexical binding name is what you use for things like recursion:

```js
function foo(i) {
	if (i < 10) return foo( i * 2 );
	return i;
}
```

The `name` property is what you'd use for meta programming purposes, so that's what we'll focus on in this discussion.

The confusion comes because by default, the lexical name a function has (if any) is also set as its `name` property. Actually there was no official requirement for that behavior by the ES5 (and prior) specifications. The setting of the `name` property was non-standard but still fairly reliable. As of ES6, it has been standardized.

**Tip:** If a function has a `name` value assigned, that's typically the name used in stack traces in developer tools.

### Inferences

But what happens to the `name` property if a function has no lexical name?

As of ES6, there are now inference rules which can determine a sensible `name` property value to assign a function even if that function doesn't have a lexical name to use.

Consider:

```js
var abc = function() {
	// ..
};

abc.name;				// "abc"
```

Had we given the function a lexical name like `abc = function def() { .. }`, the `name` property would of course be `"def"`. But in the absence of the lexical name, intuitively the `"abc"` name seems appropriate.

Here are other forms which will infer a name (or not) in ES6:

```js
(function(){ .. });					// name:
(function*(){ .. });				// name:
window.foo = function(){ .. };		// name:

class Awesome {
	constructor() { .. }			// name: Awesome
	funny() { .. }					// name: funny
}

var c = class Awesome { .. };		// name: Awesome

var o = {
	foo() { .. },					// name: foo
	*bar() { .. },					// name: bar
	baz: () => { .. },				// name: baz
	bam: function(){ .. },			// name: bam
	get qux() { .. },				// name: get qux
	set fuz() { .. },				// name: set fuz
	["b" + "iz"]:
		function(){ .. },			// name: biz
	[Symbol( "buz" )]:
		function(){ .. }			// name: [buz]
};

var x = o.foo.bind( o );			// name: bound foo
(function(){ .. }).bind( o );		// name: bound

export default function() { .. }	// name: default

var y = new Function();				// name: anonymous
var GeneratorFunction =
	function*(){}.__proto__.constructor;
var z = new GeneratorFunction();	// name: anonymous
```

The `name` property is not writable by default, but it is configurable, meaning you can use `Object.defineProperty(..)` to manually change it if so desired.

## Meta Properties

In Chapter 3 "`new.target`", we introduced a concept new to JS in ES6: the meta property. As the name suggests, meta properties are intended to provide special meta information in the form of a property access that would otherwise not have been possible.

In the case of `new.target`, the keyword `new` serves as the context for a property access. Clearly `new` is itself not an object, which makes this capability special. However, when `new.target` is used inside a constructor call (a function/method invoked with `new`), `new` becomes a virtual context, so that `new.target` can refer to the target constructor that `new` invoked.

This is a clear example of a meta programming operation, as the intent is to determine from inside a constructor call what the original `new` target was, generally for the purposes of introspection (examining typing/structure) or static property access.

For example, you may want to have different behavior in a constructor depending on if its directly invoked or invoked via a child class:

```js
class Parent {
	constructor() {
		if (new.target === Parent) {
			console.log( "Parent instantiated" );
		}
		else {
			console.log( "A child instantiated" );
		}
	}
}

class Child extends Parent {}

var a = new Parent();
// Parent instantiated

var b = new Child();
// A child instantiated
```

There's a slight nuance here, which is that the `constructor()` inside the `Parent` class definition is actually given the lexical name of the class (`Parent`), even though the syntax implies that the class is a separate entity from the constructor.

**Warning:** As with all meta programming techniques, be careful of creating code that's too clever for your future self or others maintaining your code to understand. Use these tricks with caution.

## Built-in Object Symbols

// TODO

## `Reflect` API

// TODO

## Proxies

// TODO

## Feature Testing

// TODO

## Tail Call Optimization (TCO)

Normally, when a function call is made from inside another function, a second *stack frame* is allocated to separately manage the variables/state of that other function invocation. Not only does this allocation cost some processing time, but it also takes up some extra memory.

A call stack chain typically has at most 10-15 jumps from one function to another and another. In those scenarios, the memory usage is not likely any kind of practical problem.

However, when you consider recursive programming (a function calling itself repeatedly) -- or mutual recursion with two or more functions calling each other -- the call stack could easily be hundreds, thousands, or more levels deep. You can probably see the problems that could cause, if memory usage grows unbounded.

JavaScript engines have to set an arbitrary limit to prevent such programming techniques from crashing by running the browser and device out of memory. That's why we get the frustrating "RangeError: Maximum call stack size exceeded" thrown if the limit is hit.

**Warning:** The limit of call stack depth is not controlled by the specification. It's implementation dependent, and will vary between browsers and devices. You should never code with strong assumptions of exact observable limits, as they may very well change from release to release.

Certain patterns of function calls, called *tail calls*, can be optimized in a way to avoid the extra allocation of stack frames. If the extra allocation can be avoided, there's no reason to arbitrarily limit the call stack depth, so the engines can let them run unbounded.

A tail call is a function call in the tail position -- at the end of a function's code path -- where nothing has to happen after the call except (optionally) returning its value along to a previous function invocation.

Here's a function call that is *not* in tail position:

```js
function foo(x) {
	return x * 2;
}

function bar(x) {
	// not a tail call
	return 1 + foo( x );
}

bar( 10 );				// 21
```

`1 + ..` has to be performed after the `foo(x)` call completes, so the state of that `bar(..)` invocation needs to be preserved.

But the following snippet demonstrates calls to `foo(..)` and `bar(..)` where both *are* in tail position, since they're the last thing to happen in their code path (other than the `return`):

```js
function foo(x) {
	return x * 2;
}

function bar(x) {
	x = x + 1;
	if (x > 10) {
		return foo( x );
	}
	else {
		return bar( x + 1 );
	}
}

bar( 5 );				// 24
bar( 15 );				// 32
```

In this program, `bar(..)` is clearly recursive, but `foo(..)` is just a regular function call. In both cases, the function calls are in *proper tail position*. The `x + 1` is evaluated before the `bar(..)` call, and whenever that call finishes, all that happens is the `return`.

Proper tail calls of these forms can be optimized -- called tail call optimization (TCO) -- so that the stack frame allocation is unnecessary. Instead of creating a new stack frame for the next function call, the engine just reuses the existing stack frame. That works because a tail call doesn't need to preserve any of the current state since nothing happens with that state after the tail call.

TCO means there's practically no limit to how deep the call stack can be. That trick slightly improves regular function calls in normal programs, but more importantly opens the door to using recursion for program expression even if the call stack could be tens of thousands of calls deep.

**We're no longer restricted from theorizing about recursion** for problem solving, but can actually use it in real JavaScript programs!

As of ES6, all proper tail calls should be optimized in this way, recursion or not.

### Tail Call Rewrite

The hitch however is that only tail calls can be optimized; non-tail calls will still work of course, but will cause stack frame allocation as they always did. You'll have to be careful about structuring your functions with tail calls if you expect the optimizations to kick in.

If you have a function that's not written with proper tail calls, you may find the need to manually optimize your program by rewriting it, so that the engine will be able to apply TCO when running it.

Consider:

```js
function foo(x) {
	if (x <= 1) return 1;
	return (x / 2) + foo( x - 1 );
}

foo( 123456 );			// RangeError
```

The call to `foo(x-1)` isn't a proper tail call since its result has to be added to `(x / 2)` before `return`ing.

However, we can reorganize this code to be eligible for TCO in an ES6 engine as:

```js
var foo = (function(){
	function _foo(acc,x) {
		if (x <= 1) return acc;
		return _foo( (x / 2) + acc, x - 1 );
	}

	return function(x) {
		return _foo( 1, x );
	};
})();

foo( 123456 );			// 3810376848.5
```

If you run the previous snippet in an ES6 engine that implements TCO, you'll get the `3810376848.5` answer as shown. However, it'll still fail with a `RangeError` in non-TCO engines.

### Non-TCO Optimizations

There are other techniques to rewrite the code so that the call stack isn't growing with each call.

One such technique is called *trampolining*, which amounts to having each partial result represented as a function that either returns a another partial result function or the final result. Then you can simply loop until you stop getting a function, and you'll have the result. Consider:

```js
function trampoline( res ) {
	while (typeof res == "function") {
		res = res();
	}
	return res;
}

var foo = (function(){
	function _foo(acc,x) {
		if (x <= 1) return acc;
		return function partial(){
			return _foo( (x / 2) + acc, x - 1 );
		};
	}

	return function(x) {
		return trampoline( _foo( 1, x ) );
	};
})();

foo( 123456 );			// 3810376848.5
```

This reworking required minimal changes to factor out the recursion into the loop in `trampoline(..)`:

1. First, we wrapped the `return _foo ..` line in the `partial()` function expression.
2. Then we wrapped the `_foo(1,x)` call in the `trampoline(..)` call.

The reason this technique doesn't suffer the call stack limitiation is that each of those inner `partial(..)` functions is just returned back to the `while` loop in `trampoline(..)`, which runs it and then loop iterates again. In other words, `partial(..)` doesn't recursively call itself, it just returns another function. The stack depth remains constant, so it can run as long as it needs to.

Trampolining expressed in this way uses the closure that the inner `partial()` function has over the `x` and `acc` variables to keep the state from iteration to iteration. The advantage is that the looping logic is pulled out into a reusable `trampoline(..)` utility function, which many libraries provide versions of. You can reuse `trampoline(..)` multiple times in your program with different trampolined algorithms.

Of course, if you really wanted to deeply optimize (and the reusability wasn't a concern), you could discard the closure state and inline the state tracking of `acc` into just one function's scope along with the loop. This technique is often called *recursion unrolling*:

```js
function foo(x) {
	var acc = 1;
	while (x > 1) {
		acc = (x / 2) + acc;
		x = x - 1;
	}
	return acc;
}

foo( 123456 );			// 3810376848.5
```

This expression of the algorithm is simpler to read, and will likely perform the best (strictly speaking) of the various forms we've explored. That may seem like a clear winner, and you may wonder why you would ever try the other approaches.

There are some reasons why you might not want to always manually unroll your recursions:

* Instead of factoring out the trampolining (loop) logic for reusability, we've inlined it. This works great when there's only one example to consider, but as soon as you have a half dozen or more of these in your program, there's a good chance you'll want some reusabilty to keep things manageable.
* The example here is deliberately simple enough to illustrate the different forms. In practice, there are many more complications in recursion algorithms, such as mutual recursion (more than just one function calling itself).

   The farther you go down this rabbit hole, the more manual and intricate the *unrolling* optimizations are. You'll quickly lose all the perceived value of readability. The primary advantage of recursion, even in the *proper tail call* form, is that it preserves the algorithm readability, and offloads the performance optimization to the engine.

If you write your algorithms with proper tail calls, the ES6 engine will apply TCO to let your code run in constant stack depth (by reusing stack frames). You get the readability of recursion with most of the performance benefits and no limitations of run length.

### Meta?

So TCO is cool, right? But what does any of this have to do with meta programming? Great question. You're totally right to ask that!

Short answer: I'm stretching the definition of "meta programming" to fit the TCO topic into this chapter.

As we covered in the "Feature Testing" section earlier, you can determine at runtime what features an engine supports. This includes TCO, though determining it is quite brute force. Consider:

```js
try {
	(function foo(x){
		if (x < 5E5) foo( x + 1 );
	})( 1 );

	TCO_ENABLED = true;
}
catch (err) {
	TCO_ENABLED = false;
}
```

Yuck, right?

But how could meta programming around the TCO feature (or rather, the lack thereof) benefit our code? The simple answer is that you could use such a feature test to decide to load a version of your application's code that uses recursion, or an alternate one that's been converted/transpiled to not need recursion.

But here's another way of looking at the problem:

```js
function foo(x) {
	function _foo() {
		if (x > 1) {
			acc = acc + (x / 2);
			x = x - 1;
			_foo();
		}
	}

	var acc = 1;

	while (x > 1) {
		try {
			_foo();
		}
		catch (err) { }
	}

	return acc;
}

foo( 123456 );			// 3810376848.5
```

This algorithm works by attempting to do as much of the work with recursion as possible, but keeping track of the progress via scoped variables `x` and `acc`. If the entire problem can be solved with recursion without an error, great. If the engine kills the recursion at some point, we simply catch that with the `try..catch` and then try again, picking up where we left off.

I consider this a form of meta programming in that you are probing during runtime the ability of the engine to fully recursively finish the task, and working around any engine limitations (non-TCO) that may restrict you.

At first (or second!) glance, my bet is this code seems much uglier to you compared to some of the earlier versions. It also runs a fair bit slower (on larger runs in a non-TCO environment).

The primary advantage, other than it being able to complete any size task even in non-TCO engines, is that this "solution" to the infinite recursion limitation is much more flexible than the trampolining or manual unrolling techniques shown previously. Essentially, `_foo()` in this case is a sort of stand-in for practically any recursive task, even mutual recursion. The rest is the boilerplate that should work for just about any task.

The only "catch" is that to be able to resume in the event of a recursion limit being hit, the state of the recursion must be in scoped variables that exist outside the recursive functions. We did that by leaving `x` and `acc` outside of the `_foo()` function, instead of structuring them as arguments passed into `_foo()`.

You'll notice that I was able to write the algorithm using a proper tail call, meaning that this code will "progressively enhance" from running using the loop many times in an older browser to fully leveraging TCO'd recursion in an ES6+ environment. I think that's pretty cool!

## Review

// TODO
