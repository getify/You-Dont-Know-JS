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

An "array-like object" in JavaScript is an object that has a `length` property on it, specifically with an integer value of zero or higher.

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

var arrCopy = Array.from( arr );
```

`Array.from(..)` looks to see if the first argument is an iterable (see "Iterators" in Chapter 3), and if so, it uses the iterator to produce values to "copy" into the returned array. Since real arrays have an iterator for those values, that iterator is automatically used.

But if you pass an array-like object as the first argument to `Array.from(..)`, it behaves basically the same as `slice()` (no arguments!) or `apply(..)` does, which is that it simply loops over the value, accessing numerically named properties from `0` up to whatever the value of `length` is.

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

**Note:** As with other array methods that take callbacks, `Array.from(..)` takes an optional third argument that if set will specify the `this` binding for the callback passed as the second argument. Otherwise, `this` will be `undefined`.

// TODO: talk about mapping between Typed Array values, bitwise truncation, etc

### `copyWithin(..)` Prototype Method

`Array#copyWithin(..)` is a new mutator method available to all arrays (including Typed Arrays -- see Chapter 5). `copyWithin(..)` copies a portion of an array to another location in the same array, overwriting whatever was there before.

The arguments are *target* (the index to copy to), *start* (the inclusive index to start the copying from), and optionally *end* (the exclusive index to stop copying). If any of the arguments are negative, they're taken to be relative from the end of the array.

Consider:

```js
[1,2,3,4,5].copyWithin( 3, 0 );			// [1,2,3,1,2]

[1,2,3,4,5].copyWithin( 3, 0, 1 );		// [1,2,3,1,5]

[1,2,3,4,5].copyWithin( 0, -2 );		// [4,5,3,4,5]

[1,2,3,4,5].copyWithin( 0, -2, -1 );	// [4,2,3,4,5]
```

The `copyWithin(..)` method does not extend the array's length, as the first example in the previous snippet shows. Copying simply stops when the end of the array is reached.

The copying doesn't always go in left-to-right (ascending index) order as you might assume. It's possible this would result in repeatedly copying an already copied value if the from and target ranges overlap, which is presumably not desired behavior.

So internally, the algorithm avoids this case by copying in reverse order to avoid that gotcha. Consider:

```js
[1,2,3,4,5].copyWithin( 2, 1 );			// ???
```

If the algorithm was strictly moving left-to-right, then the `2` should be copied overwrite the `3`, then *that* copied `2` should be copied to overwrite `4`, then *that* copied `2` should be copied to overwrite `5`, and you'd end up with `[1,2,2,2,2]`.

Instead, the copying algorithm reverses direction and copies `4` to overwrite `5`, then copies `3` to overwrite `4`, then copies `2` to overwrite `3`, and the final result is `[1,2,2,3,4]`. That's probably more "correct" in terms of expectation, but it can be confusing if you're only thinking about the copying algorithm in a naive left-to-right fashion.

### Creating Arrays And Subtypes

In the last couple of sections, we've discussed `Array.of(..)` and `Array.from(..)`, both of which create a new array in a similar way to a constructor. But what do they do in subclasses? Do they create instances of the base `Array` or the derived subclass?

```js
class MyCoolArray extends Array {
	..
}

Array.of( 1, 2 ) instanceof Array;					// true
Array.from( [1, 2] ) instanceof Array;				// true

MyCoolArray.of( 1, 2 ) instanceof Array;			// false
MyCoolArray.from( [1, 2] ) instanceof Array;		// false

MyCoolArray.of( 1, 2 ) instanceof MyCoolArray;		// true
MyCoolArray.from( [1, 2] ) instanceof MyCoolArray;	// true
```

Both `of(..)` and `from(..)` use the constructor that they're accessed from to construct the array. So if you use the base `Array.of(..)` you'll get an `Array` instance, but if you use `MyCoolArray.of(..)`, you'll get a `MyCoolArray` instance.

In "Classes" in Chapter 3, we covered the `@@species` setting which all the built-in classes (like `Array`) have defined, which is used by any prototype methods if they create a new instance. `slice(..)` is a great example:

```js
var x = new MyCoolArray( 1, 2, 3 );

x.slice( 1 ) instanceof MyCoolArray;				// true
```

Generally, that default behavior will probably be desired, but as we discussed in Chapter 3, you *can* override if you want:

```js
class MyCoolArray extends Array {
	// force `species` to be parent constructor
	static get [Symbol.species]() { return Array; }
}

var x = new MyCoolArray( 1, 2, 3 );

x.slice( 1 ) instanceof MyCoolArray;				// false
x.slice( 1 ) instanceof Array;						// true
```

It's important to note that the `@@species` setting is only used for the prototype methods, like `slice(..)`. It's not used by `of(..)` and `from(..)`; they both just use the `this` binding (whatever constructor is used to make the reference). Consider:

```js
class MyCoolArray extends Array {
	// force `species` to be parent constructor
	static get [Symbol.species]() { return Array; }
}

var x = new MyCoolArray( 1, 2, 3 );

x.slice( 1 ) instanceof Array;						// true

MyCoolArray.from( x ) instanceof Array;				// false
MyCoolArray.of( [2, 3] ) instanceof Array;			// false

MyCoolArray.from( x ) instanceof MyCoolArray;		// true
MyCoolArray.of( [2, 3] ) instanceof MyCoolArray;	// true
```

### `fill(..)` Prototype Method

Filling an existing array entirely (or partially) with a specified value is natively supported as of ES6 with the `Array#fill(..)` method:

```js
var a = Array( 4 ).fill( undefined );
a;
// [undefined,undefined,undefined,undefined]
```

`fill(..)` optionally takes *start* and *end* parameters which indicate a subset portion of the array to fill, such as:

```js
var a = [ null, null, null, null ].fill( 42, 1, 3 );
a;
// [null,42,42,null]
```

### `find(..)` Prototype Method

The most common way to search for a value in an array has generally been the `indexOf(..)` method, which returns the index the value is found at or `-1` if not found:

```js
var a = [1,2,3,4,5];

(a.indexOf( 3 ) != -1);				// true
(a.indexOf( 7 ) != -1);				// false

(a.indexOf( "2" ) != -1);			// false
```

The `indexOf(..)` comparison requires a strict `===` match, so a search for `"2"` fails to find a value of `2`, and vice versa. There's no way to override the matching algorithm for `indexOf(..)`. It's also unfortunate/ungraceful to have to make the manual comparison to the `-1` value.

**Tip:** See the *Types & Grammar* title of this series for an interesting (and controversially confusing) technique to work around the `-1` ugliness with the `~` operator.

Since ES5, the most common workaround to have control over the matching logic  has been the `some(..)` method. It works by calling a function callback for each element, until one of those calls returns a `true`/truthy value, and then it stops. Since you get to define the callback function, you have full control over how a match is made:

```js
var a = [1,2,3,4,5];

a.some( function matcher(v){
	return v == "2";
} );								// true

a.some( function matcher(v){
	return v == 7;
} );								// false
```

But the downside to this approach is that you only get the `true`/`false` indicating if a suitably matched value was found, but not what the actual matched value was.

ES6's `find(..)` addresses this. It works basically the same as `some(..)`, except that once the callback returns a `true`/truthy value, the actual array value is returned:

```js
var a = [1,2,3,4,5];

a.find( function matcher(v){
	return v == "2";
} );								// 2

a.find( function matcher(v){
	return v == 7;					// undefined
});
```

Using a custom `matcher(..)` function also lets you match against complex values like objects:

```js
var points = [
	{ x: 10, y: 20 },
	{ x: 20, y: 30 },
	{ x: 30, y: 40 },
	{ x: 40, y: 50 },
	{ x: 50, y: 60 }
];

points.find( function matcher(point) {
	return (
		point.x % 3 == 0 &&
		point.y % 4 == 0
	);
} );								// { x: 30, y: 40 }
```

**Note:** As with other array methods that take callbacks, `find(..)` takes an optional second argument that if set will specify the `this` binding for the callback passed as the first argument. Otherwise, `this` will be `undefined`.

### `findIndex(..)` Prototype Method

While the previous section illustrates how `some(..)` yields a boolean result for a search of an array, and `find(..)` yields the matched value itself from the array search, there's also a need for finding the positional index of the matched value.

`indexOf(..)` does that, but there's no control over its matching logic; it always uses `===` strict equality. So ES6's `findIndex(..)` is the answer:

```js
var points = [
	{ x: 10, y: 20 },
	{ x: 20, y: 30 },
	{ x: 30, y: 40 },
	{ x: 40, y: 50 },
	{ x: 50, y: 60 }
];

points.findIndex( function matcher(point) {
	return (
		point.x % 3 == 0 &&
		point.y % 4 == 0
	);
} );								// 2

points.findIndex( function matcher(point) {
	return (
		point.x % 6 == 0 &&
		point.y % 7 == 0
	);
} );								// -1
```

Don't use `findIndex(..) != -1` (the way it's always been done with `indexOf(..)`) to get a boolean from the search, because `some(..)` already yields the `true`/`false` you want. And don't do `a[ a.findIndex(..) ]` to get the matched value, because that's what `find(..)` accomplishes. And finally, use `indexOf(..)` if you need the index of a strict match, or `findIndex(..)` if you need the index of a more customized match.

**Note:** As with other array methods that take callbacks, `find(..)` takes an optional second argument that if set will specify the `this` binding for the callback passed as the first argument. Otherwise, `this` will be `undefined`.

### `entries()`, `values()`, `keys()` Prototype Methods

In Chapter 3, we illustrated how data structures can provide a patterned item-by-item enumeration of their values, via an iterator. We then expounded on this approach in Chapter 5, as we explored how the new ES6 collections (Map, Set, etc.) provide several methods for producing different kinds of iterations.

While `Array` might not be thought of traditionally as a "collection" since it's not new to ES6, it is one in the sense that it provides these same iterator methods: `entries()`, `values()`, and `keys()`. Consider:

```js
var a = [1,2,3];

[ ...a.values() ];				// [1,2,3]
[ ...a.keys() ];				// [0,1,2]
[ ...a.entries() ];				// [ [0,1], [1,2], [2,3] ]

[ ...a[Symbol.iterator]() ];	// [1,2,3]
```

Just like with `Set`, the default `Array` iterator is the same as what `values()` returns.

In "Avoiding Empty Slots" earlier in this chapter, we illustrated how `Array.from(..)` treats empty slots in an array as just being present slots with `undefined` in them. That's actually because under the covers, the array iterators behave that way:

```js
var a = [];
a.length = 3;
a[1] = 2;

[ ...a.values() ];		// [undefined,2,undefined]
[ ...a.keys() ];		// [0,1,2]
[ ...a.entries() ];		// [ [0,undefined], [1,2], [2,undefined] ]
```

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
