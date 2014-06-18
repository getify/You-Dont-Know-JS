# You Don't Know JS: Types & Grammar
# Chapter 1: Wait... Types?

Most developers would tell you that a dynamic language (like JS) does not have *types*. Let's see what the authors of the ES5.1 specification have to say on the topic:

> Algorithms within this specification manipulate values each of which has an associated type. The possible value types are exactly those defined in this clause. Types are further sub classified into ECMAScript language types and specification types.
>
> An ECMAScript language type corresponds to values that are directly manipulated by an ECMAScript programmer using the ECMAScript language. The ECMAScript language types are Undefined, Null, Boolean, String, Number, and Object.

Now, if you're a fan of strongly-typed (statically-typed) languages, you probably object to this usage of the word "type". In those languages, "type" means a whole lot *more* than it does here in JS.

Some people say JS shouldn't be said to have "types", but they should instead be called "tags" or perhaps "sub types".

Bah. We're going to use this definition (the same one that seems to drive the wording of the spec!): a *type* is an intrinsic, built-in set of characteristics that uniquely identifies a particular value and distinguishes it from other values, both to the engine **and to the developer**.

In other words, if both the engine and the developer treat value `42` (the number) differently than they treat value `"42"` (the string), then those two values have different *types*, namely `number` and `string`, respectively. When you use `42`, you are *intending* to do something numeric, like math. But when you use `"42"`, you are *intending* to do something string'ish, like outputting to the page, etc. **These two values have different types.**

That's by no means a perfect definition. But it's good enough for now. And it's consistent with how JS regards itself.

## Values As Types

In JavaScript, variables don't have types -- **values have types**. Variables can hold any value, at any time.

Another way to think about JS types is that JS has types but it doesn't have "type enforcement", in that the engine doesn't insist that *variable* always holds values of the *same initial type*. A variable can, in one assignment statement, hold a `string`, and in the next hold a `number`, and so on.

Also, the *value* `42` has an intrinsic type of `number`, and its *type* cannot be changed. Another value, like `"42"` with the `string` type, can be created *from* the `number` value `42`, through a process called **coercion**, which we will cover later.

## Primitive Types

JavaScript defines 7 built-in types, which we often call "primitives". These are:

* `null`
* `undefined`
* `boolean`
* `number`
* `string`
* `object`
* `symbol`

The `typeof` operator inspects the type of the given value, and always returns one of 7 string values (though, strangely, there's not an exact 1-to-1 match with the 7 primitive types we just listed -- see below!).

```js
typeof undefined     === "undefined"; // true
typeof true          === "boolean";   // true
typeof 42            === "number";    // true
typeof "42"          === "string";    // true
typeof { life: 42 }  === "object";    // true

// added in ES6!
typeof Symbol()      === "symbol";    // true
```

These 6 listed types have values of the corresponding type and return a string of the same name, as shown. `Symbol` is a new data type as of ES6, and will be covered later.

As you may have noticed, I excluded `null` from this listing. It's *special*. Special in the sense that it's buggy.

```js
typeof null === "object"; // true
```

It would have been nice (and correct!) if it returned `"null"`, but this original bug in JS has persisted for nearly 2 decades, and will likely never be fixed because there's too much existing web content that relies on its buggy behavior that "fixing" the bug would *create* "more bugs" and break a lot of web software.

So what's the seventh string value that `typeof` can return? And why is it not actually a real primitive type?

```js
typeof function a(){ /* .. */ } === "function"; // true
```

It's easy to think that `function` would be a primitive type in JS, especially given this behavior of the `typeof` operator. However, if you read the spec, you'll see it's actually somewhat of a "sub-type" of object. Specifically, a function is referred to as a "callable object" -- an object that has an internal `[[Call]]` property that allows it to be invoked.

What about arrays? They're pretty native to JS, so are they a special type?

```js
typeof [1,2,3] === "object"; // true
```

Nope, just objects. It's most appropriate to think of them also as a "sub-type" of object, in this case with the additional characteristics of being numerically indexed (as opposed to just being string-keyed like plain objects) and maintaining an automatically updated `.length` property.

## Special Values

There are several special values spread across the various types which the *alert* JS developer needs to be aware of, and use properly.

### The Non-Value Values

For the `undefined` type, there is one and only one value: `undefined`. For the `null` type, there is one and only one value: `null`. So for both of them, the label is both its type and its value.

Both `undefined` and `null` are often taken to be interchangeable as either "empty" values or "non" values. Other developers prefer to distinguish between them with nuance, like for instance:

* `null` is an empty value
* `undefined` is a missing value

Regardless of how you choose to "define" and use these two values, `null` is a special keyword, not an identifier, and thus it's not allowed to use it as a variable to assign to. However, `undefined` *is* an identifier.

### Undefined

In non-`strict mode`, it's actually possible (though terribly ill-advised!) to assign a value to the globally provided `undefined` identifier:

```js
function foo() {
	undefined = 2; // really bad idea!
}

foo();
```

```js
function foo() {
	"use strict";
	undefined = 2; // TypeError!
}

foo();
```

In both non-`strict mode` and `strict mode`, however, you can create a local variable of the name `undefined`, though again, this is a terrible idea!

```js
function foo() {
	"use strict";
	var undefined = 2;
	console.log( undefined ); // 2
}

foo();
```

Friends don't let friends override `undefined`. Ever.

// TODO cover:
// void 0
// typeof foo === "undefined"
// undefined vs. undeclared

### Special Numbers

The `number` type has several special values. We'll take a look at each in detail.

#### The Not Number, Number

Any mathematic operation you perform without both operands being numbers (or values that can be interpreted as regular numbers in base 10 or base 16) will result in the operation failing to produce a valid number, in which case you will get the `NaN` value.

`NaN` literally stands for "not a number", though this label/description is very poor and misleading, as we'll see shortly. It would be much more accurate to think of `NaN` as being "invalid number", "failed number", or even "bad number" than to think of it as "not a number".

For example:

```js
var a = 2 / "foo"; NaN

typeof a === "number"; // true
```

In other words, "the type of not-a-number is 'number'!" Hooray for confusing names and semantics.

`NaN` is a special "sentinel value" that represents a special kind of error condition within the number set. The error condition is in essence: "tried to perform a mathematic operation but failed, so here's the failed number result instead".

So, if you have a value in some variable and want to test to see if it's this special failed-number `NaN`, you might think you could compare to `NaN` itself, as you can with other values like `null` and `undefined`. Nope.

```js
var a = 2 / "foo";

a == NaN; // false
a === NaN; // false
```

`NaN` is a very special number in that it's never equal to another `NaN` value. It's the only number in fact without the Identity operation `x === x`.

So how *do* we test for it?

```js
var a = 2 / "foo";

window.isNaN( a ); // true
```

Easy enough, right? Seems like windowWe use a built-in utility called `isNaN(..)` and it tells us if the value is `NaN` or not. Problem solved!

Not so fast.

The built-in `window.isNaN(..)` utility has a fatal flaw. It tried to take the name of `NaN` way too literally. It interpreted its job as, basically: "return the negation of an 'is it a number?' test."

```js
var a = 2 / "foo";
var b = "foo";

a; // NaN
b; "foo"

window.isNaN( a ); // true
window.isNaN( b ); // true -- ouch!
```

Clearly, `"foo"` is *not a number*, but it's definitely not the `NaN` value either.

As of ES6, a replacement utility has been provided, with `Number.isNaN(..)`. A simple polyfill for it so that you can safely check `NaN` values in ES5 and below browsers is:

```js
if (!Number.isNaN) {
	Number.isNaN = function(n) {
		return (
			typeof n === "number" &&
			window.isNaN( n )
		);
	};
}

var a = 2 / "foo";
var b = "foo";

Number.isNaN( a ); // true
Number.isNaN( b ); // false -- phew!
```

`NaN`s will probably a reality in a lot of real-world JS programs, either on purpose or by accident. It's a good idea to use a reliable test, like `Number.isNaN(..)` as provided, to recognize them properly.

#### Infinities

Developers from traditional compiled languages like C are probably used to seeing either a compiler error or run-time exception, like "Divide by zero", for an operation like:

```js
var a = 1 / 0;
```

However, in JS, this operation is well-defined and results in the value `Infinity`. Unsurprisingly:

```js
var a = 1 / 0; // Infinity
var b = -1 / 0; // -Infinity
```

As you can see, `-Infinity` results from a divide-by-zero where either (but not both!) of the divide operands is negative.

Contrary to mathematics, because JS uses finite number representations (IEEE-754 foating point, which will be covered later), it *is* possible to overflow (or underflow) even with an operation like addition or subtraction, in which case you'd respectively get `Infinity` or `-Infinity`.

For example:

```js
var a = Number.MAX_VALUE; // 1.7976931348623157e+308
a + a; // Infinity
a + 1E292; // Infinity
a + 1E291; // 1.7976931348623157e+308
```

If you think too much about that, it's going to make your head hurt. So don't. We'll cover more of the specifics of IEEE-754 numbers and how they work later.

Once you overflow or underflow to either one of the *infinities*, however, there's no going back. In other words, in an almost poetic sense, you can go from finite to infinite but not from infinite back to finite.

It's almost philosophical to ask: "What is Infinity divided by Infinity". Our naive brains would likely say "1" or maybe "Infinity". Turns out neither is true. Both mathematically and in JavaScript, `Infinity / Infinity` is not a defined operation. In JS, this results in `NaN` as explained above.

But what about any positive non-infinite (that is, finite) number divided by infinity? That's easy! `0`. And what about a negative finite number divided by infinity? Keep reading!

#### Zeros

While it may confuse the mathematician-minded reader, JavaScript has both a normal zero `0` (otherwise known as a positive zero `+0`) *and* a negative zero `-0`. Before we explain why the `-0` exists, we should examine how JS handles it, because it can be quite confusing.

Besides being specified directly, negative zero results from certain mathematic operations. For example:

```js
var a = 0 / -3; // -0
var b = 0 * -3; // -0
```

Addition and subtraction cannot result in a negative zero.

A negative zero when examined in the developer console will usually reveal `-0`, though that was not the common case until fairly recently, so some older browsers may still report it as `0`.

However, if you try to stringify a negative zero value, it will always be reported as `"0"`, according to the spec.

```js
var a = 0 / -3;

// consoles at least get it right
a; // -0

// but the spec insists on lying to you!
a.toString(); // "0"
a + ""; // "0"
String( a ); // "0"

// strangely, even JSON gets in on the deception
JSON.stringify( 0 / -3 ); // "0"
```

**Note:** The `JSON.stringify( -0 )` behavior is particularly strange when you consider the reverse: `JSON.parse( "-0" )`, which indeed reports `-0` as you'd correctly expect, despite the inconsistency with its inverse `JSON.stringify(..)`.

In addition to stringification of negative zero being deceptive to hide its true value, the comparison operators are also (intentionally) configured to *lie*.

```js
var a = 0;
var b = 0 / -3;

a == b; // true
-0 == 0; // true

a === b; // true
-0 === 0; // true

0 > -0; // false
a > b; // false
```

Clearly, if you want to distinguish a `-0` from a `0` in your code, you can't just rely on what the developer console outputs, so you're going to have to be a bit more clever:

```js
function isNegZero(n) {
	n = Number( n );
	return (n === 0) && (1 / n === -Infinity);
}

isNegZero( -0 ); // true
isNegZero( 0 / -3 ); // true
isNegZero( 0 ); // false
```

Now, why do we need a negative zero, besides academic trivia?

There are certain applications where developers use the magnitude of a value to represent one piece of information (like speed of movement per animation frame) and the sign of that number to represent another piece of information (like the direction of that movement).

In those applications, as one example, if a variable arrives at zero and it loses its sign, then you would lose the information of what direction it was moving in before it arrived at zero. Preserving the sign of the zero prevents potentially unwanted information loss.
