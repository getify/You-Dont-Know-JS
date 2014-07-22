# You Don't Know JS: Types & Grammar
# Chapter 2: Values

In this chapter, we'll cover working with JavaScript values.

## Numbers

JavaScript has just one numeric type: `number`. This type includes values we often call "integers" (whole numbers with no decimal fraction part), as well as values we often "floating point numbers" (numbers with decimal fractions).

## Special Values

There are several special values spread across the various types which the *alert* JS developer needs to be aware of, and use properly.

### The Non-Value Values

For the `undefined` type, there is one and only one value: `undefined`. For the `null` type, there is one and only one value: `null`. So for both of them, the label is both its type and its value.

Both `undefined` and `null` are often taken to be interchangeable as either "empty" values or "non" values. Other developers prefer to distinguish between them with nuance, like for instance:

* `null` is an empty value
* `undefined` is a missing value

Or:

* `undefined` hasn't had a value yet
* `null` had a value and doesn't anymore

Regardless of how you choose to "define" and use these two values, `null` is a special keyword, not an identifier, and thus you cannot treat it as a variable to assign to (why would you!?). However, `undefined` *is* (unfortunately) an identifier. Uh oh.

### Undefined

In non-`strict mode`, it's actually possible (though incredibly ill-advised!) to assign a value to the globally provided `undefined` identifier:

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

In both non-`strict mode` and `strict mode`, however, you can create a local variable of the name `undefined`. But again, this is a terrible idea!

```js
function foo() {
	"use strict";
	var undefined = 2;
	console.log( undefined ); // 2
}

foo();
```

**Friends don't let friends override `undefined`.** Ever.

While `undefined` is a built-in identifier that holds (unless modified -- see above!) the built-in `undefined` value, another way to get this value is the `void` operator.

The expression `void ___` "voids" out any value, so that the result of that `void`-expression is always the `undefined` value. It doesn't modify the existing value; it just ensures that no value comes back from the operator expression.

```js
var a = 42;

console.log(void a, a); // undefined 42
```

By convention (mostly from C-language programming), to represent the `undefined` value stand-alone by using `void`, you'd use `void 0` (though clearly even `void true` or any other `void`-expression does the same thing). There's no practical difference between `void 0` and `void 1` and `undefined`.

But the `void` operator can be useful in a few other circumstances, if you need to ensure that an expression has no result value (even if it has side effects).

For example:

```js
function doSomething() {
	// note: `APP.ready` is provided by our application
	if (!APP.ready) {
		// try again later
		return void setTimeout(doSomething,100);
	}

	var result;

	// do some other stuff
	return result;
}

// were we able to do it right away?
if (doSomething()) {
	// handle next tasks right away
}
```

Here, the `setTimeout(..)` function returns a numeric value (the id of the timer interval, if you wanted to cancel the timer), but we want to `void` that out so that the return value of our function doesn't give a false-positive with the `if` statement.

Many devs prefer to just do these actions separately, which works the same but doesn't use the `void` operator:

```js
if (!APP.ready) {
	// try again later
	setTimeout(doSomething,100);
	return;
}
```

In general, if there's ever a place where a value exists (from some expression) and you'd find it useful for the value to be `undefined` instead, use the `void` operator. That probably won't be terribly common in your programs, but in the rare cases you do need it, it can be quite helpful.

### Special Numbers

The `number` type includes several special values. We'll take a look at each in detail.

#### The Not Number, Number

Any mathematic operation you perform without both operands being numbers (or values that can be interpreted as regular numbers in base 10 or base 16) will result in the operation failing to produce a valid number, in which case you will get the `NaN` value.

`NaN` literally stands for "not a number", though this label/description is very poor and misleading, as we'll see shortly. It would be much more accurate to think of `NaN` as being "invalid number", "failed number", or even "bad number", than to think of it as "not a number".

For example:

```js
var a = 2 / "foo"; // NaN

typeof a === "number"; // true
```

In other words: "the type of not-a-number is 'number'!" Hooray for confusing names and semantics.

`NaN` is a kind of "sentinel value" (an otherwise normal value that's assigned a special meaning) that represents a special kind of error condition within the number set. The error condition is, in essence: "I tried to perform a mathematic operation but failed, so here's the failed number result instead."

So, if you have a value in some variable and want to test to see if it's this special failed-number `NaN`, you might think you could directly compare to `NaN` itself, as you can with any other value, like `null` or `undefined`. Nope.

```js
var a = 2 / "foo";

a == NaN; // false
a === NaN; // false
```

`NaN` is a very special value in that it's never equal to another `NaN` value (aka, it's not equal to itself). It's the only number in fact without the Identity characteristic `x === x`. So, `NaN !== NaN`. A bit strange, huh?

So how *do* we test for it, if we can't compare to `NaN` (since that comparison would always fail)?

```js
var a = 2 / "foo";

isNaN( a ); // true
```

Easy enough, right? We use a built-in utility called `isNaN(..)` and it tells us if the value is `NaN` or not. Problem solved!

Not so fast.

The built-in `isNaN(..)` utility (which is technically `window.isNaN(..)`) has a fatal flaw. It appears it tried to take the name of `NaN` ("not a number") too literally -- that its job is, basically: "test if the thing passed in is either not a number or is a number."

```js
var a = 2 / "foo";
var b = "foo";

a; // NaN
b; "foo"

window.isNaN( a ); // true
window.isNaN( b ); // true -- ouch!
```

Clearly, `"foo"` is *not a number*, but it's definitely not the `NaN` value either. This bug has been in JS since the very beginning (so, over 19 years of *ouch*).

As of ES6, finally a replacement utility has been provided, with `Number.isNaN(..)`. A simple polyfill for it so that you can safely check `NaN` values *now* in pre-ES6 browsers is:

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

Actually, we can implement a `Number.isNaN(..)` polyfill even easier, by taking advantage of that peculiar fact that `NaN` isn't equal to itself. `NaN` is the *only* value in the whole language where that's true; every other value is always **equal to itself**.

So:

```js
if (!Number.isNaN) {
	Number.isNaN = function(n) {
		return n !== n;
	};
}
```

Weird, huh? But it works!

`NaN`s are probably a reality in a lot of real-world JS programs, either on purpose or by accident. It's a really good idea to use a reliable test, like `Number.isNaN(..)` as provided (or polyfilled), to recognize them properly.

If you're currently using just `isNaN(..)` in a program, the sad reality is your program *has a bug*, even if you haven't been bitten by it yet!

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

JS uses finite number representations (IEEE-754 foating point, which will be covered later), so contrary to pure mathematics, it seems it *is* possible to overflow (or underflow) even with an operation like addition or subtraction, in which case you'd respectively get `Infinity` or `-Infinity`.

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

// (some browser) consoles at least get it right
a; // -0

// but the spec insists on lying to you!
a.toString(); // "0"
a + ""; // "0"
String( a ); // "0"

// strangely, even JSON gets in on the deception
JSON.stringify( 0 / -3 ); // "0"
```

Interestingly, the reverse operations (going from string to number) don't lie:

```js
+"-0"; // -0
Number( "-0" ); // -0
JSON.parse( "-0" ); // -0
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

## Value vs Reference

In many other languages, values can either be assigned/passed by value or by reference depending on the syntax you use.

For example, in C++ if you want to pass a number variable into a function and have that variable's value updated, you can declare the function parameter like `int& myNum`, and when you pass in a variable like `x`, `myNum` will be a **reference to `x`**; references are like a special form of pointers, where you obtain a pointer to another variable (like an *alias*). If you don't declare a reference parameter, the value passed in will *always* be copied, even if it's a complex object.

In JavaScript, there are no pointers, and references work fairly differently. You cannot have a reference from one JS variable to another variable. That's just not possible.

A reference in JS is a reference to a (shared) value, so if you have 10 different references, they are all always distinct references to a single shared value; **none of them are references to each other.**

Moreover, in JavaScript, there are no syntactic hints that control value vs reference assignment/passing. Instead, the *type* of the value *solely* controls whether that value will be assigned through value-copy or by reference.

Let's illustrate:

```js
var a = 2;
var b = a; // `b` is always a copy of the value in `a`
b++;
a; // 2
b; // 3

var c = [1,2,3];
var d = c; // `d` is always a reference to the shared `[1,2,3]` array value
d.push( 4 );
c; // [1,2,3,4]
d; // [1,2,3,4]
```

Simple values (aka scalar primitives) are *always* assigned/passed by value-copy: `null`, `undefined`, `string`, `number`, and `boolean`.

Complex values (aka compound primitives) *always* create a new reference on assignment and a copy of the reference on passing: `object` (including arrays, and all boxed object wrappers -- see Chapter 3), `function`, and `symbol` (ES6+).

In the above snippet, because `2` is a scalar primitive, `a` holds one initial copy of that value, and `b` is assigned another *copy* of the value. When changing `b`, you are in no way changing the value in `a`.

But **both `c` and `d`** are seperate references to the same shared value `[1,2,3]`, which is a compound primitive. It's important to note that neither `c` nor `d` more "owns" the `[1,2,3]` array value -- both are just equal peer references to the value. So, when using either reference to modify (`.push(4)`) the actual shared array value itself, it's affecting just the one shared value, and both references will  reference the newly modified value `[1,2,3,4]`.

Since references are to the values themselves and not to the variables, you cannot use one reference to change where another reference is pointed:

```js
var a = [1,2,3];
var b = a;
a; // [1,2,3]
b; // [1,2,3]

// later
b = [4,5,6];
a; // [1,2,3]
b; // [4,5,6]
```

When me make the assignment `b = [4,5,6]`, we are doing absolutely nothing to affect *where* `a` is still referencing (`[1,2,3]`). To do that, `b` would have to be a pointer to `a` rather than a reference to the array value -- but no such capability exists in JS!

The most common way such confusion happens is with function parameters:

```js
function foo(x) {
	x.push( 4 );
	x; // [1,2,3,4]

	// later
	x = [4,5,6];
	x.push( 7 );
	x; // [4,5,6,7]
}

var a = [1,2,3];

foo( a );

a; // [1,2,3,4]  not  [4,5,6,7]
```

When we pass in the argument `a`, it assigns a copy of the `a` reference to `x`. `x` and `a` are separate references pointing at the same `[1,2,3]` value. Now, inside the function, we can use that reference to mutate the value itself (`push(4)`). But, when we make the assignment `x = [4,5,6]`, this is in no way is affecting where the initial reference `a` is pointing -- still points at the (now modified) `[1,2,3,4]` value.

There is no way using the `x` reference to change where `a` is pointing. We could only modify the contents of the shared value that both `a` and `x` are pointing to.

To accomplish changing `a` to have the `[4,5,6,7]` value contents, you can't create a new array and assign -- you must modify the existing array value:

```js
function foo(x) {
	x.push( 4 );
	x; // [1,2,3,4]

	// later
	x.length = 0; // empty existing array in-place
	x.push( 4, 5, 6, 7 );
	x; // [4,5,6,7]
}

var a = [1,2,3];

foo( a );

a; // [4,5,6,7]
```

As you can see, `x.length = 0` and `x.push(4,5,6,7)` were not creating a new array, but modifying the existing shared array value. So of course, `a` now sees the new `[4,5,6,7]` contents.

Remember: you cannot directly control/override value-copy vs. reference -- those semantics are controlled entirely by the type of the underlying value.

To pass a compound primitive (like an array) by value, you need to manually make a copy of it. For example:

```js
foo( a.slice() );
```

`Array#slice(..)` with no parameters by default makes an entire (shallow) copy of the array. So, we pass in a reference only to the copied array, and thus `foo(..)` cannot affect the contents of `a`.

To do the reverse -- pass a scalar primitive value in a way where its value updates can be seen, kinda like a reference -- you have to wrap the value in another compound primitive (object, array, etc) which *can* be passed by reference:

```js
function foo(wrapper) {
	wrapper.a = 42;
}

var obj = {
	a: 2
};

foo( obj );

obj.a; // 42
```

Here, `obj` acts as a wrapper for the scalar primitive property `a`. When passed to `foo(..)`, a copy of the `obj` reference is passed in and set to the `wrapper` parameter. We now can use the `wrapper` reference to access the shared object, and update its property. After the function finishes, `obj.a` will see the updated value `42`.

It may occur to you that if you wanted to pass in a reference to a scalar primitive value like `2`, you could just box the value in its `Number` object wrapper (see Chapter 3).

It *is* true a copy of the reference to this `Number` object *will* be passed to the function, but unfortunately, having a reference to the shared object is not going to give you the ability to modify the shared value, like you may expect:

```js
function foo(x) {
	x = x + 1;
	x; // 3
}

var a = 2;
var b = new Number( a ); // or equivalently `Object(a)`

foo( b );
console.log( b ); // 2  -- not 3
```

The problem is that the underlying scalar primitive value is *not mutable* (same goes for `string` and `boolean`). If a `Number` object holds the value `2`, that exact `Number` object can never be changed to hold another value; you can only create a whole new `Number` object with a different value.

When `x` is used in the expression `x + 1`, the underlying scalar primitive `2` is unboxed from the `Number` object automatically, so the line `x = x + 1` very subtly changed `x` from being a shared reference to the `Number` object, to just holding the scalar primitive value `3` as a result of the addition operation. Therefore, `b` still references the unmodified/immutable `Number` object holding the value `2`.

You *can* add properties on top of the `Number` object (just not change its inner primitive value), so you could exchange information indirectly via those additional properties.

This is not all that common, however; it probably would *not* be considered a good practice by most developers.

Instead of using the wrapper object `Number` in this way, it's probably much better to use the manual object wrapper (`obj`) approach in the earlier snippet. That's not to say that there's *no* clever uses for the boxed object wrappers like `Number` -- just that you should probably prefer the scalar primitive value form in most cases.

References are quite powerful, but sometimes they get in your way, and sometimes you need them where they don't exist. The only control you have over reference vs. value-copy behavior is the type of the value itself, so you must indirectly influence the assignment/passing behavior by which value types you choose to use.

## Summary

Numbers in JavaScript include both "integers" and "floating point" values.

Several special values are defined within the primitive types.

The `null` type has just one value: `null`, and likewise the `undefined` type has just the `undefined` value. `undefined` is basically the default value in any variable or property if no other value is present. The `void` operator lets you create the `undefined` value from any other value.

Numbers include several special values, like `NaN` (supposedly "Not-a-Number", but really more appropriately "invalid number"), `+Infinity` and `-Infinity`, and `-0`.

Simple scalar primitives (`string`s, `number`s, etc) are assigned/passed by value-copy, but compound primitives (`object`s, etc) are assigned/passed by reference. References are **not** like references/pointers in other languages -- they're never pointed at other variables/references, only at the underlying values.

