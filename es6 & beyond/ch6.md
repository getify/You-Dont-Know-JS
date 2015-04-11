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

Under what circumstances would you want to use `Array.of(..)` instead of just creating an array with literal syntax, like `c = [1,2,3]`? // TODO

### `Array.from(..)` Static Function

// TODO

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
