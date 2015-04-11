# You Don't Know JS: ES6 & Beyond
# Chapter 6: New APIs

From conversions of values to mathematic calculations, ES6 adds many static methods to various built-in natives and objects to help with common tasks. In addition, instances of the natives have new capabilities from various new prototype methods.

## `Array`

One of the most commonly extended features in JS by various user libraries is the Array type. It should be no surprise that ES6 adds a number of helpers to Array, both static and prototype (instance).

### `Array.of(..)` Static Function

There's a well known gotcha with the `Array(..)` constructor, which is that if there's only one argument passed, and that argument is a number, instead of making an array of one element with that number value in it, it constructs an empty array with a `length` property equal to the number. This action produces the unfortunate and quirky "empty slots" behavior that's reviled about JS arrays.

`Array.of(..)` replaces `Array(..)` as the preferred function-form constructor for arrays, because `Array.of(..)` does not have that special single-number-argument case. Consider:

```js
var a = Array( 3 );
a.length;						// 3
a[0];							// undefined

var b = Array.of( 3 );
b.length;						// 1
b[0];							// 3

var c = Array.of( 1, 2, 3 );
c.length;						// 3
c;								// [1,2,3]
```

Under what circumstances would you want to use `Array.of(..)` instead of just creating an array with literal syntax, like `c = [1,2,3]`? There's two possible cases.

If you have a callback that's supposed to wrap argument(s) passed to it in an array, `Array.of(..)` fits the bill perfectly. That's probably not terribly common, but it may scratch an itch for you.

The other scenario is if you subclass `Array` (see "Classes" in Chapter 3) and want to be able to create and initialize elements in an instance of your subclass, such as:

```js
class MyCoolArray extends Array {
	sum() {
		return this.reduce( function reducer(acc,curr){
			return acc + curr;
		}, 0 );
	}
}

var x = new MyCoolArray( 3 );
x.length;						// 3 -- oops!
x.sum();						// 0 -- oops!

var y = [3];					// Array, not MyCoolArray
y.length;						// 1
y.sum();						// `sum` is not a function

var z = MyCoolArray.of( 3 );
z.length;						// 1
z.sum();						// 3
```

You can't just (easily) create a constructor for `MyCoolArray` that overrides the behavior of the `Array` parent constructor, since that constructor is necessary to actually create a well-behaving array value (initializing the `this`). The "inherited" static `of(..)` method on the `MyCoolArray` subclass provides a nice solution.

### `Array.from(..)` Static Function

An "array-like object" in JavaScript is any object that has a `length` property on it, specifically with a value of zero or higher.

These values have been notoriously frustrating to work with in JS; it's been quite common to need to transform them into an actual array, so that the various `Array.prototype` methods (`map(..)`, `indexOf(..)` etc.) are available to use with it. That process usually looks like:

```js
// array-like object
var arrLike = {
	length: 3,
	0: "foo",
	1: "bar"
};

var arr = Array.prototype.slice.call( arrLike );
```

Another common task where `slice(..)` is often used is in duplicating a real array:

```js
var arr2 = arr.slice();
```

In both cases, the new ES6 `Array.from(..)` method can be a more understandable and graceful -- if also less verbose -- approach:

```js
var arr = Array.from( arrLike );

var arr2 = Array.from( arr );
```

`Array.from(..)` looks to see if the first argument is an iterable (see "Iterators" in Chapter 3), and if so, it uses the iterator to produce values to "copy" into the returned array. Since real arrays have an iterator for those values, that iterator is automatically used.

But if you pass an array-like object as the first argument to `Array.from(..)`, it behaves basically the same as `slice()` (no arguments!) or `apply(..)` does, which is that it simply loops over the value and accesses numerically named properties from `0` up to whatever the value of `length` is.

Consider:

```js
var arrLike = {
	length: 4,
	2: "foo"
};

Array.from( arrLike );
// [ undefined, undefined, "foo", undefined ]
```

Since positions `0`, `1`, and `3` didn't exist on `arrLike`, the result was the `undefined` value for each of those slots.

You could produce a similar outcome like this:

```js
var emptySlotsArr = [];
emptySlotsArr.length = 4;
emptySlotsArr[2] = "foo";

Array.from( emptySlotsArr );
// [ undefined, undefined, "foo", undefined ]
```

#### Avoiding Empty Slots

There's a subtle but important difference in the previous snippet between the `emptySlotsArr` and the result of the `Array.from(..)` call. `Array.from(..)` never produces empty slots.

Prior to ES6, if you wanted to produce an array initialized to a certain length with actual `undefined` values in each slot (no empty slots!), you had to do extra work:

```js
var a = Array( 4 );								// four empty slots!

var b = Array.apply( null, { length: 4 } );		// four `undefined` values
```

But `Array.from(..)` now makes this easier:

```js
var c = Array.from( { length: 4 } );			// four `undefined` values
```

**Warning:** Using an empty slot array like `a` in the previous snippets would work with some array functions, but others ignore empty slots (like `map(..)`, etc.). You should never intentionally work with empty slots, as it will almost certainly lead to strange/unpredictable behavior in your programs.

#### Mapping

The `Array.from(..)` utility has another helpful trick up its sleeve. The second argument, if provided, is a mapping callback (almost the same as the regular `Array#map(..)` expects) which is called to map/transform each value from the source to the returned target. Consider:

```js
var arrLike = {
	length: 4,
	2: "foo"
};

Array.from( arrLike, function mapper(val,idx){
	if (typeof val == "string") {
		return val.toUpperCase();
	}
	else {
		return idx;
	}
} );
// [ 0, 1, "FOO", 3 ]
```

### `copyWithin(..)` Prototype Method

// TODO

### `entries()`, `values()`, `keys()` Prototype Methods

// TODO

### `fill(..)` Prototype Method

// TODO

### `find(..)` Prototype Method

// TODO

### `findIndex(..)` Prototype Method

// TODO

## `Object`

// TODO

## `Math`

// TODO

## `Number`

// TODO

## `String`

// TODO

## Review

// TODO
