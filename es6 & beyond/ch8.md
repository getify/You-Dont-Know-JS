# You Don't Know JS: ES6 & Beyond
# Chapter 8: Beyond ES6

At the time of this writing, the final draft of ES6 (*ECMAScript 2015*) is shortly headed toward its final official vote of approval by ECMA. But even as ES6 is being finalized, the TC39 committee is already hard at work at on features for ES7/2016 and beyond.

As we discussed in Chapter 1, it's expected that the cadence of progress for JS is going to accelerate from updating one every several years to having an official version update one per year (hence the year-based naming). That alone is going to radically change how JS developers learn about and keep up with the language.

But even more importantly, the committee is actually going to work feature-by-feature. As soon as a feature is spec-complete and had its kinks worked out through implementation experiments in a few browsers, that feature will be considered stable enough to start using. We're all strongly encouraged to adopt features once they're ready instead of waiting for some official standards vote. *If you haven't already learned ES6, it's past due time to get on board!*

Transpilers and polyfills are how we'll bridge to these new features even before all browsers we support have implemented them. Babel, Traceur, and several other major transpilers already have support for some of the post ES6 features that are most likely to stabilize.

With that in mind, it's already time for us to look at some of them. Let's jump in!

**Warning:** These features are all in various stages of development. While they're likely to land, and probably will look similar, take the contents of this chapter with more than a few grains of salt. This chapter will evolve in future editions of this title as these (and other!) features finalize.

## `async function`s

// TODO

## `Object.observe(..)`

// TODO

## Other Stuff

### Exponentiation Operator

An operator has been proposed for JavaScript to perform exponentiation in the same way that `Math.pow(..)` does. Consider:

```js
var a = 2;

a ** 4;			// Math.pow( a, 4 ) == 16

a **= 3;		// a = Math.pow( a, 3 )
a;				// 8
```

**Note:** `**` is essentially the same as it appears in Python, Ruby, Perl, and others.

### Objects and `...`

As we saw in the "Too Many, Too Few, Just Enough" section of Chapter 2, the `...` operator is pretty obvious in how it relates to spreading or gathering arrays. But what about objects?

Such a feature was considered for ES6, but was deferred to be considered after ES6 (aka "ES7" or "ES2016" or ...). Here's how it might work in that "beyond ES6" timeframe:

```js
var o1 = { a: 1, b: 2 },
	o2 = { c: 3 },
	o3 = { ...o1, ...o2, d: 4 };

console.log( o3.a, o3.b, o3.c, o3.d );
// 1 2 3 4
```

The `...` operator might also be used to gather an object's destructured properties back into an object:

```js
var o1 = { b: 2, c: 3, d: 4 };
var { b, ...o2 } = o1;

console.log( b, o2.c, o2.d );		// 2 3 4
```

Here, the `...o2` re-gathers the destructured `c` and `d` properties back into an `o2` object (`o2` does not have a `b` property like `o1` does).

Again, these are just proposals under consideration beyond ES6. But it'll be cool if they do land.

## Review
