# You Don't Know JS: ES6 & Beyond
# Chapter 7: Meta Programming

Meta Programming is programming where the operation targets the behavior of the program itself. In other words, it's programming the programming of your program. Yeah, a mouthful, huh!?

For example, if you probe the relationship between one object `a` and another `b` -- are they `[[Prototype]]` linked? -- using `a.isPrototype(b)`, this is commonly referred to as introspection, a form of meta programming. Macros (which don't exist in JS, yet) --  where the code modifies itself at compile time -- are another common example of meta programming.

The goal of meta programming is to leverage the language's own intrinsic capabilities to make the rest of your code more descriptive, expressive, and/or flexible. Because of the *meta* nature of meta programming, it's somewhat difficult to put a more precise definition on it than that. The best way to understand meta programming is to see it through example.

ES6 adds a few new forms/features for meta programming which we'll briefly review here.

## Function Names

There are cases where your code may want to introspect on itself and ask what the name of some function is. For instance, you may need to notify some other part of the system what function to invoke at a later time, but you may not be able to just pass around a reference to the function itself.

If you ask what a function's name is, the answer you get is surprisingly somewhat ambiguous. Consider:

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

In this previous snippet, "what is the name of `obj.foo()`" is slightly nuanced. Is it `"foo"` or is undefined? And what about `obj.bar()` -- is it named `"bar"` or `"baz"`? Is `obj.bam()` named `"bam"` or `"daz"`? What about `obj.zim()`?

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

The confusion comes because by default, the lexical name a function has (if any) is also set as its `name` property. But what happens to the name property if a function has no lexical name? Prior to ES6, essentially nothing.

But as of ES6, there are a set of inference rules which can determine a reasonable `name` property value to assign a function if that function doesn't have a lexical name to provide the value.

## Meta Properties

In Chapter 3 "`new.target`", we introduced a concept new to JS in ES6: the meta property. As the name suggests, meta properties are intended to provide special meta information in the form of a property access that would otherwise not have been possible.

In the case of `new.target`, the keyword `new` serves as the context for a property access. Clearly `new` is itself not an object, which makes this capability special. However, when `new.target` is used inside a constructor call (a function/method invoked with `new`), `new` becomes a virtual context, so that `new.target` can refer to the target constructor that `new` invoked.

This is a clear example of a meta programming operation, as the intent is to determine from inside a constructor call what the original `new` target was, generally for the purposes of introspection (examining typing/structure) or static property access.

For example, you want to have different behavior in a constructor depending on if its directly invoked or invoked via a child class:

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

## Tail Call Optimization

// TODO

## Review

// TODO
