# You Don't Know JS: Types & Grammar
# Chapter 2: Natives

Several times in Chapter 1, we alluded to various built-ins, often called natives, like `String` and `Number`. Let's examine those in detail now.

Here's a list of the most commonly used natives:

* `String()`
* `Number()`
* `Boolean()`
* `Array()`
* `Object()`
* `Function()`
* `RegExp()`
* `Date()`
* `Error()`
* `Symbol()` -- added in ES6!

As you can see, these natives are actually built-in functions.

If you're coming to JS from a language like Java, `String()` will look like the "String constructor" you're used to for creating string values. So, you'll quickly observe that you can do things like:

```js
var s = new String( "Hello World!" );

console.log( s ); // "Hello World"
```

It *is* true that each of these natives can be used as a native constructor. But what's being constructed may be different than you think.

```js
var a = new String( "abc" );

typeof a; // "object" ... not "String"

a instanceof String; // true

Object.prototype.toString.call( a ); // "[object String]"
```

The result of the constructor form of value creation (`new String("abc")`) is an object-wrapper around the primitive (`"abc"`) value.

Importantly, `typeof` shows that these objects are not their own special *types*, but more appropriately they are sub-types of the `object` type.

This object wrapper can further be observed with:

```js
console.log( a );
```

The output of that statement varies depending on your browser, as developer consoles are free to choose however they feel it's appropriate to serialize the object for developer inspection.

For example, at time of writing, Chrome prints this: `String {0: "a", 1: "b", 2: "c", length: 3, [[PrimitiveValue]]: "abc"}`. But Chrome used to just print this: `String {0: "a", 1: "b", 2: "c"}`. Firefox currently prints `"abc"` but it's in italics and is clickable to open the object inspector. Of course, these results are subject to change and your experience may vary.

## Internal `[[Class]]`

Values that are the `typeof` of `"object"` (such as an array) are additionally tagged with an internal `[[Class]]` property (think of this more as an internal *class*ification rather than related to classes from traditional class-oriented coding). This property cannot be accessed directly, but can generally can be revealed indirectly by borrowing the default `Object.prototype.toString(..)` method called against the value. For example:

```js
Object.prototype.toString.call( [1,2,3] );			// "[object Array]"

Object.prototype.toString.call( /regex-literal/i );	// "[object RegExp]"
```

So, for the array in this example, the internal `[[Class]]` value is `"Array"`, and for the regular expression, it's `"RegExp"`. In most cases, this internal ``[Class]]` value corresponds to the built-in native constructor (see below) that's related to the value, but that's not always the case.

What about primitive values? First, `null` and `undefined`:

```js
Object.prototype.toString.call( null );			// "[object Null]"
Object.prototype.toString.call( undefined );	// "[object Undefined]"
```

You'll note that there is no `Null()` or `Undefined()` native constructors, but nevertheless the `"Null"` and `"Undefined"` are the internal `[[Class]]` values exposed.

But for the other simple primitives like `string`, `number`, and `boolean`, another behavior actually kicks in, which is usually called "boxing" (see below).

```js
Object.prototype.toString.call( "abc" );	// "[object String]"
Object.prototype.toString.call( 42 );		// "[object Number]"
Object.prototype.toString.call( true );		// "[object Boolean]"
```

In this snippet, each of the simple primitives are automatically boxed by their respective object wrappers, which is why `"String"`, `"Number"`, and `"Boolean"` are revealed as the internal `[[Class]]` values.

## Boxing

These object wrappers serve a very important purpose. Primitive values don't have properties or methods, so to access `.length` or `.toString()` you need an object wrapper around the value. Thankfully, JS will automatically *box* (aka wrap) the primitive value to fulfill such accesses.

```js
var a = "abc";

a.length; // 3
a.toUpperCase(); // "ABC"
```

So, if you're going to be accessing these properties/methods on your string values regularly, like a `i < a.length` condition in a `for` loop for instance, it might seem to make sense to just have the object-form of the value from the start, so the JS engine doesn't need to implicitly create it for you.

But it turns out that's a bad idea. Browsers long ago performance-optimized the common cases like `.length`, which means your program will *actually go slower* if you try to "pre-optimize" by directly using the object-form (which isn't on the optimized path).

In general, there's basically no reason to use the object-form directly. It's better to just let the boxing happen implicitly where necessary. In other words, never do things like `new String("abc")`, `new Number(42)`, etc -- always prefer using the literal primitive values `"abc"` and `42`.

There are some gotchas with using the object wrappers directly.

```js
var a = new Boolean( false );

if (!a) {
	console.log( "Oops" ); // never runs
}
```

The problem is that you've created an object wrapper around the `false` value, but objects themselves are "truthy" (see Chapter 3), so using the object behaves oppositely to using the `false` value itself, which is quite contrary to normal expectation.

If you want to manually box a primitive value, you can use the `Object(..)` function (no `new` keyword):

```js
var a = "abc";
var b = new String( a );
var c = Object( a );

typeof a; // "string"
typeof b; // "object"
typeof c; // "object"

b instanceof String; // true
c instanceof String; // true

Object.prototype.toString.call( b ); // "[object String]"
Object.prototype.toString.call( c ); // "[object String]"
```

Again, using the boxed object wrapper directly (like `b` and `c` above) is usually discouraged, but there are some rare occassions you'll run into where they may be useful.

## Natives As Constructors

For `array`, `object`, `function`, and regular-expression primitives, it's almost universally preferred that you use the literal form for creating the values, but the literal form creates the same sort of object as the constructor form does (that is, there is no non-wrapped value).

Just as we've seen above with the other natives, these constructor forms should generally be avoided, unless you really know you need them, mostly because they introduce exceptions and gotchas that you probably don't really *want* to deal with.

### `Array(..)`

```js
var a = new Array( 1, 2, 3 );
a; // [1, 2, 3]

var b = [1, 2, 3];
b; // [1, 2, 3]
```

**Note:** The `Array(..)` constructor does not require the `new` keyword in front of it. If you omit it, it will behave as if you has used it anyway. So `Array(1,2,3)` is the same outcome as `new Array(1,2,3)`.

The `Array` constructor has a special form that if there's only one argument passed, and it's a `number`, instead of providing that value as *contents* of the array, it's taken as a length to "pre-size the array" (well, sorta).

This is a terrible idea. Firstly, you can trip over that form accidentally, as it's easy to forget.

But more importantly, there's no such thing as actually pre-sizing the array. Instead, what you're creating is an otherwise empty array, but setting the `length` property of the array to the numeric value specified.

An array which has no explicit values in its slots, but it has a `length` property that *implies* the slots exist, is a weird exotic type of data structure in JS with some very strange and confusing behavior. The capability to create such a value comes purely from old, deprecated, historical functionalities ("array-like objects" like the `arguments` object).

It doesn't help matters that this is yet another example where browser developer consoles vary on how they represent such an object, which breeds more confusion.

For example:

```js
var a = new Array( 3 );

a.length; // 3
a;
```

The serialization of `a` in Chrome is (at time of writing): `[ undefined x 3 ]`. **This is really unfortunate.** It implies that there are three `undefined` values in the slots of this array, when in fact the slots do not exist (so called "empty slots" -- also a bad name!).

To visualize the difference, try this:

```js
var a = new Array( 3 );
var b = [ undefined, undefined, undefined ];
var c = [];
c.length = 3;

a;
b;
c;
```

**Note:** As you can see with `c` in this example, empty slots in an array can happen after creation of the array. Changing the `length` of an array to go beyond its number of actually-defined slot values, you implicitly introduce empty slots. In fact, you could even call `delete b[1]` in the above snippet, and it would introduce an empty slot into the middle of `b`.

For `b` (in Chrome, currently), you'll find `[ undefined, undefined, undefined ]` as the serialization, as opposed to `[ undefined x 3 ]` for `a` and `c`. Confused? Yeah, so is everyone else.

Worse than that, at time of writing, Firefox reports `[ , , , ]` for `a` and `c`. Did you catch why that's so confusing? Look closely. Three commas implies four slots, not three slots like we'd expect.

**What!?** Firefox puts an extra `,` on the end of their serialization here because as of ES5, trailing commas in lists (arrays values, property lists, etc) are allowed (and thus dropped and ignored). So if you were to type in a `[ , , , ]` value into your program or the console, you'd actually get the underlying value that's like `[ , , ]` (that is, an array with three empty slots). This choice, while confusing if reading the developer console, is defended as instead making copy-n-paste behavior accurate.

If you're shaking your head or rolling your eyes about now, you're not alone! Shrugs.

Unfortunately, it gets worse. More than just confusing console output, `a` and `b` from the above code snippet actually behave the same in some cases **but differently in others**:

```js
a.join( "-" ); // "--"
b.join( "-" ); // "--"

a.map(function(v,i){ return i; }); // [ undefined x 3 ]
b.map(function(v,i){ return i; }); // [ 0, 1, 2 ]
```

**Ugh.**

The `a.map(..)` call *fails* because the slots don't actually exist, so `map(..)` has nothing to iterate over. `join(..)` works differently. Basically, we can think of it implemented sort of like this:

```js
function fakeJoin(arr,connector) {
	var str = "";
	for (var i = 0; i < arr.length; i++) {
		if (i > 0) {
			str += connector;
		}
		if (arr[i] !== undefined) {
			str += arr[i];
		}
	}
	return str;
}

var a = new Array( 3 );
fakeJoin( a, "-" ); // "--"
```

As you can see, `join(..)` works by just *assuming* the slots exist and looping up to the `length` value. Whatever `map(..)` does internally, it (apparently) doesn't make such an assumption, so the result from the strange "empty slots" array is unexpected and likely to cause failure.

So, if you wanted to *actually* create an array of actual `undefined` values (not just "empty slots"), how could you do it (besides manually)?

```js
var a = Array.apply( null, { length: 3 } );
a; // [ undefined, undefined, undefined ]
```

Confused? Yeah. Here's roughly how it works.

`apply(..)` is a utility available to all functions, which calls the function it's used with but in a special way.

The first argument is a `this` object binding (covered in the *"this & Object Prototypes"* title), which we don't care about here, so we set it to `null`. The second argument is supposed to be an array (or something *like* an array -- aka an "array-like object"). The contents of this "array" are "spread" out as arguments to the function in question.

So, `Array.apply(..)` is calling the `Array(..)` function and spreading out the values (of the `{ length: 3 }` object value) as its arguments.

Inside of `apply(..)`, we can envision there's another `for` loop (kinda like `join(..)` from above) that goes from `0` up to `length` (`3` in our case).

For each index, it retrieves that key from the object. So if the array-object parameter was named `arr` internally inside of the `apply(..)` function, the property access would effectively be `arr[0]`, `arr[1]`, and `arr[2]`. Of course, none of those properties exist on the `{ length: 3 }` object value, so all three of those property accesses would return the value `undefined`.

In other words, it ends up calling `Array(..)` basically like this: `Array(undefined,undefined,undefined)`, which is how we end up with an array filled with `undefined` values, and not just those (crazy) empty slots.

While `Array.apply( null, { length: 3 } )` is a strange and verbose way to create an array filled with `undefined` values, it's **vastly** better and more reliable than what you get with the footgun'ish `Array(3)` empty slots.

Bottom line: **never ever, under any circumstances**, should you intentionally create and use these exotic empty-slot arrays. Just don't do it. They're nuts.

### `Object(..)`, `Function(..)`, and `RegExp(..)`

The `Object(..)` / `Function(..)` / `RegExp(..)` constructors are also generally optional (and thus should usually be avoided unless specifically called for):

```js
var c = new Object();
c.foo = "bar";
c; // { foo: "bar" }

var d = { foo: "bar" };
d; // { foo: "bar" }

var e = new Function( "a", "return a * 2;" );
function f(a) { return a * 2; }

var g = new RegExp( "^a*b+", "g" );
var h = /^a*b+/g;
```

There's practically no reason to ever use the `new Object()` constructor form, especially since it forces you to add properties one-by-one instead of many at once in the object literal form.

The `Function` constructor is helpful only in the rarest of cases, where you need to dynamically define a function's parameters and/or its function body. **Do not just treat `Function(..)` as an alternate form of `eval(..)`.** You will almost never need to dynamically define a function in this way.

Regular expressions defined in the literal form (`/^a*b+/g`) are strongly preferred, not just for ease of syntax but for performance reasons -- the JS engine pre-compiles and caches them before code execution. Unlike the other constructor forms we've seen so far, `RegExp(..)` has some reasonable utility: to dynamically define the pattern for a regular expression.

```js
var name = "Kyle";
var namePattern = new RegExp( "\\b(?:" + name + ")+\\b", "ig" );

var matches = someText.match( namePattern );
```

This kind of scenario legitimately occurs in JS programs from time to time, so you'd need to use the `new RegExp("pattern","flags")` form.

### `Date(..)` and `Error(..)`

The `Date(..)` and `Error(..)` native constructors are much more commonly useful than the other natives, because there is no primitive literal form for either.

To create a date object value, you must use `new Date()`. The `Date(..)` constructor accepts optional arguments to specify the date/time to use, but if omitted, the current date/time is assumed.

By far the most common reason you construct a date object is to get the current unix timestamp value (an integer number of seconds since Jan 1, 1970). You can do this by calling `getTime()` on a date object instance.

An even easier way though is to just call the static helper function defined as of ES5: `Date.now()`. And to polyfill that for pre-ES5 is pretty easy:

```js
if (!Date.now) {
	Date.now = function(){
		return (new Date()).getTime();
	};
}
```

**Note:** If you call `Date()` without `new`, you'll get back a string representation of the date/time at that moment. The exact form of this representation is not specified in the language spec, though browsers tend to agree on something close to: `"Fri Jul 18 2014 00:31:02 GMT-0500 (CDT)"`.

The `Error(..)` constructor (much like `Array()` above) behaves the same with the `new` keyword present or omitted.

The main reason you'd want to create an error object is that it captures the current execution stack context into the object (in most JS engines, revealed as a read-only `.stack` property once constructed). This stack context includes the function call-stack and the line-number where the error object was created, which makes debugging that error much easier.

You would typically use such an error object with the `throw` operator:

```js
function foo(x) {
	if (!x) {
		throw new Error( "x wasn't provided" );
	}
	// ..
}
```

Error object instances generally have at least a `message` property, and sometimes other properties (which you should treat as read-only), like `type`. However, other than inspecting the above-mentioned `stack` property, it's usually best to just call `toString()` on the error object (either explicitly, or implicitly through coercion -- see Chapter 3), to get a friendly-formatted error message.

**Note:** Technically, in addition to the general `Error(..)` native, there are several other specific-error-type natives: `EvalError(..)`, `RangeError(..)`, `ReferenceError(..)`, `SyntaxError(..)`, `TypeError(..)`, and `URIError(..)`. It's very rare to manually use these specific error natives, however. They are automatically used if your program actually suffers from a real exception (such as referencing an undeclared variable and getting a `ReferenceError` error).

### `Symbol(..)`

New as of ES6, an additional primitive value type has been added, called "Symbols". Symbols are special "unique" (not guaranteed!) values that can be used as properties on objects with little fear of any collision. They're primarily designed for special built-in behaviors of ES6 constructs, but you can also define your own symbols.

Symbols can be used as property names, but you cannot see or access the actual value of a Symbol from your program, nor from the developer console. You cannot convert it to a string (doing so results in a `TypeError` being thrown), and if you output it to the developer console, what's shown is only a fake pseudo-serialization, like `Symbol(Symbol.create)`.

There are several pre-defined symbols in ES6, accessed as static properties of the `Symbol` function object, like `Symbol.create`, `Symbol.iterator`, etc. To use them, do something like:

```js
obj[Symbol.iterator] = function(){ /*..*/ };
```

To define your own custom symbols, use the `Symbol(..)` native. The `Symbol(..)` native "constructor" is unique in that you're not allowed to use `new` with it, as doing so will throw an error.

```js
var mysym = Symbol( "my own symbol" );
mysym; // Symbol(my own symbol)
mysym.toString(); // Symbol(my own symbol)
typeof mysym; // "symbol"

var a = { };
a[mysym] = "foobar";

Object.getOwnPropertySymbols( a ); // [ Symbol(my own symbol) ]
```

While symbols are not private (`Object.getOwnPropertySymbols(..)` reflects on the object and reveals the symbols), using them for private or special properties is their primary use-case. For most developers, they will probably take the place of property names with `__` prefixes, which are almost always by convention signals to say, "hey, this is a private property, leave it alone!"

### Native Prototypes

Each of the built-in native constructors has its own `.prototype` object -- `Array.prototype`, `String.prototype`, etc.

These objects contain behavior unique to their particular object sub-type.

For example, all string objects, and by extension (via boxing) `string` primitives, have access to default behavior as methods defined on the `String.prototype` object.

**Note:** By documentation convention, `String.prototype.XYZ` is shortened to `String#XYZ`, and likewise for all the other `.prototype`s.

* `String#indexOf(..)`: find the position in the string of another substring
* `String#charAt(..)`: access the character at a position in the string
* `String#substr(..)`, `String#substring(..)`, and `String#slice(..)`: extract a portion of the string as a new string
* `String#toUpperCase()` and `String#toLowerCase()`: create a new string that's converted to either uppercase or lowercase
* `String#trim()`: create a new string that's stripped of any trailing or leading whitespace

None of the methods modify the string *in place*. Modifications (like case coversion or trimming) create a new value from the existing value.

By virtue of prototype delegation (see the *"this & Object Prototypes" title in this series), any string value can access these methods:

```js
var a = " abc ";

a.indexOf( "C" ); // 3
a.toUpperCase(); // " ABC "
a.trim(); // "abc"
```

The other constructor prototypes contain behaviors appropriate to their types, such as `Number#toFixed(..)` (stringifying a number with a fixed number of decimal digits) and `Array#concat(..)` (merging arrays). All functions have access to `apply(..)`, `call(..)`, and `bind(..)` because `Function.prototype` defines them.

But, some of the native prototypes aren't *just* plain objects:

```js
typeof Function.prototype;			// "function"
Function.prototype();				// no error, it's a no-op function!

Array.isArray( Array.prototype );	// true
Array.prototype.push( 1, 2, 3 );	// 3
Array.prototype;					// [1,2,3]

"abc".match( RegExp.prototype );	// [""] -- no error, it's a regular expression!
```

`Function.prototype` is a function, `Array.prototype` is an array, and `RegExp.prototype` is a regular expression.

Interesting and cool, huh?

There have definitely been times when I've needed a placeholder no-op function like `function(){}`, but `Function.prototype` is already there for use!

## Value vs. Reference

In many other languages, values can either be assigned/passed by value or by reference depending on the syntax you use.

For example, in C++ if you want to pass a number variable into a function and have that variable's value updated, you can declare the function parameter like `int& myNum`, and when you pass in a variable like `x`, `myNum` will be a **reference to `x`**; references are like a special form of pointers, where you obtain a pointer to another variable (like an *alias*). If you don't declare a reference parameter, the value passed in will *always* be copied, even if it's a complex object.

In JavaScript, there are no pointers, and references work fairly differently. You cannot have a reference from one JS variable to another variable. That's just not possible.

A reference in JS is a reference to a (shared) value, so if you have 10 different references, they are all always references to a single shared value; none of them are references to each other.

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
c; // [1,2,3]
d; // [1,2,3,4]
```

Simple values (aka scalar primitives) are *always* assigned/passed by value-copy: `null`, `undefined`, `string`, `number`, and `boolean`.

Complex values (aka compound primitives) are *always* assigned/passed by reference: `object` (including arrays, and all boxed object wrappers), `function`, and `symbol` (ES6+).

In the above snippet, because `2` is scalar primitive, `a` holds one initial copy of that value, and `b` is assigned another *copy* of the value. When changing `b`, you are in no way changing the value in `a`.

But **both `c` and `d`** are references to the same shared value `[1,2,3]`, which is a compound primitive. It's important to note that neither `c` nor `d` more "owns" the `[1,2,3]` array value -- both are just equal peer references to the value. So, when using either reference to modify (`.push(4)`) the actual shared array value itself, it's affecting just the one shared value, and both reference variables will still reference the newly modified value `[1,2,3,4]`.

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

When me make the assignment `b = [4,5,6]`, we are doing absolutely nothing to affect where `a` is still referencing (`[1,2,3]`). To do that, `b` would have to be a pointer to `a` rather than a reference to the array value -- but no such capability exists in JS!

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

When we pass in the argument `a`, it assigns `x` **by reference** to point at the `[1,2,3]` value. Now, inside the function, we can use that reference to mutate the value itself (`push(4)`). But, when we make the assignment `x = [4,5,6]`, this is in no way is affecting where the initial reference `a` is pointing -- still points at the (now modified) `[1,2,3,4]` value.

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

Here, `obj` acts as a passed-by-reference wrapper for the scalar primitive property `a`, so that the property's value can be updated in a persistent way that survives the end of the function call.

It may occur to you that if you wanted to pass *by reference* a scalar primitive value like `2`, you could box the value in its `Number` object wrapper. It *is* true that such an object value would instead be passed by reference. But it's not going to give you the ability to use the reference to modify the shared value, like you may hope:

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

The problem is that the underlying scalar primitive values inside boxed object wrappers like `String`, `Number`, and `Boolean` are *not mutable*. When `x` is used in `x + 1`, the underlying scalar primitive `2` is unboxed automatically, so the line `x = x + 1` very subtly changed `x` from being a shared reference to the passed in `Number` object to just holding the scalar primitive value `3` as a result of the addition operation. Therefore, `b` still references the unmodified/immutable `Number` object holding the value `2`.

Boxed object wrappers *are* normal objects, so you *could* add properties to the object (just not change its enclosed primitive value), and so you could exchange information indirectly via those additional properties.

This is not all that common, however; it probably would not be considered a great practice by most developers. Instead of using the boxed wrapper object `Number` in this way, it's probably much better to use the manual object wrapper (`obj`) approach in the earlier snippet. That's not to say that there's no clever uses for the object wrappers, just that your default should usually be the scalar primitive value form if possible.

References are quite powerful, but sometimes they get in your way, and sometimes you need them but don't have them, so you have to fake them. The only control over reference vs. value-copy is the type of the value itself, so you must indirectly influence the assignment/passing behavior by which value types you choose to use.

## Summary

JavaScript provides object wrappers around primitive values, known as natives (`String`, `Number`, `Boolean`, etc). These object wrappers give the values access to behaviors appropriate for each object sub-type (`String#trim()` and `Array#concat(..)`).

If you have a simple scalar primitive value like `"abc"` and you access its `length` property or some `String.prototype` method, JS automatically "boxes" the value (wraps it in its respective object wrapper) so that the property/method accesses can be fulfilled.

Simple scalar primitives (`string`s, `number`s, etc) are assigned/passed by value-copy, but compound primitives (`object`s, etc) are assigned/passed by reference. References are **not** like references/pointers in other languages -- they're never pointed at other variables/references, only at the underlying values.
