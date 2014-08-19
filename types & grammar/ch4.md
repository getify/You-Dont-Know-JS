# You Don't Know JS: Types & Grammar
# Chapter 4: Coercion

Now that we much more fully understand JavaScript's types and values, we turn our attention to a very controversial topic: coercion.

As we mentioned in Chapter 1, the debates over whether coercion is a useful feature or a flaw in the design of the language (or somewhere in between!) have raged since day one. If you've read other popular books on JS, you know that the overwhelmingly prevalent *message* out there is that coercion is magical, evil, confusing, and just downright a bad idea.

In the same overall spirit of this book series, rather than running away from coercion because everyone else does, or because you get bitten by some quirk, I think you should run toward that which you don't understand and seek to *get it* more fully.

Our goal is to fully explore the pros and cons (yes, there *are* pros!) of coercion, so that you can make an informed decision on its appropriateness in your program.

## Converting Values

Converting a value from one type to another is often called "type casting", when done explicitly, and "coercion" when done implicitly (forced by the rules of how a value is used).

Another way these terms are often distinguished is: "type casting" (or "type conversion") occur in statically typed languages at compile time, while "type coercion" is a run-time conversion for dynamically typed languages.

However, in JavaScript, most people refer to all these types of conversions as *coercion*, so the way I prefer to distinguish is to say "implicit coercion" vs "explicit coercion".

The difference should be obvious: "explicit coercion" is when it is obvious from looking at the code that a type conversion is intentionally occurring, whereas "implicit coercion" is when the type conversion will occur as a less obvious side-effect of some other intentional operation.

For example, consider these two approaches to coercion:

```js
var a = 42;

var b = a + "";			// implicit coercion

var c = String( a );	// explicit coercion
```

For `b`, the coercion that occurs happens implicitly, because the `+` operator combined with one of the operands being a `string` value (`""`) will insist on the operation being a `string` concatenation (adding two strings together), which *as a (hidden) side-effect* will force the `42` value in `a` to be coerced to its `string` equivalent: `"42"`.

By contrast, the `String(..)` function makes it pretty obvious that it's explicitly taking the value in `a` and coercing it to a `string` representation.

Both approaches accomplish the same effect: `"42"` comes from `42`. But it's the *how* that is at the heart of the heated debates over JavaScript coercion.

The terms "explicit" and "implicit", or "obvious" and "hidden side-effect", are *relative*.

If you know exactly what `+ ""` is doing and you're intentionally doing that to coerce to a `string`, you might feel the operation is sufficiently "explicit". Conversely, if you've never seen the `String(..)` function used for `string` coercion, its behavior might seem hidden enough as to feel "implicit" to you.

But we're conducting this discussion of "explicit" vs "implicit" based on the likely opinions of an *average, reasonably informed, but not expert or JS specification devotee* developer. To whatever extent you do or do not find yourself fitting neatly in that bucket, you will need to adjust your perspective on our observations here accordingly.

Just remember: it's often rare that we write our code and are the only ones who ever read it. Even if you're an expert on all the ins and outs of JS, consider how a less-experienced teammate of yours will *feel* when they read your code. Will it be "explicit" or "implicit" to them in the same way it is for you?

## Abstract Value Operations

Before we can explore *explicit* vs *implicit* coercion, we need to learn the basic rules that govern how values *become* either a `string`, `number`, or `boolean`. The ES5 spec defines three "abstract operations" (fancy spec-speak for "internal-only operation") with the rules of value conversion: `ToString`, `ToNumber`, and `ToBoolean`.

### `ToString`

When any value that's not already a `string` is forced to represent itself as a `string` (either *explicitly* or *implicitly*), the ES5 spec defines the `ToString` abstract operation in section 9.8.

Built-in primitive values like `null` are stringified to `"null"`. `undefined` becomes `"undefined"` and `true` becomes `"true"`. `number`s are generally represented in `string` form in the natural way you'd expect. But as we discussed in Chapter 2, very small or very large `numbers` are stringified in exponent form:

```js
// multiplying `1.07` by `1000`, seven times over
var a = 1.07 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;

// seven times three digits => 21 digits
a.toString(); // "1.07e21"
```

For regular objects, unless you specify your own, the default `toString()` (located in `Object.prototype.toString()`) will return the *internal `[[Class]]`* (see Chapter 3), like for instance `"[object Object]"`.

But as shown earlier, if an object has its own `toString()` method on it, and you use that object in a `string`-like way, its `toString()` will automatically called, and the `string` result of that call will be used instead.

Arrays have an overridden default `toString()` that stringifies as the (string) concatenation of all its values (each stringified themselves), with `","` in between each value:

```js
var a = [1,2,3];

a.toString(); // "1,2,3"
```

Again, `toString()` can either be called explicitly, or it will automatically be called if a non-`string` is used in a `string` context.

#### JSON Stringification

Another task that seems awfully related to `ToString` is when you use the `JSON.stringify(..)` utility to serialize a value to a JSON-compatible `string` value.

It's important to note that this stringification is not exactly the same thing as coercion. But since it's related to the `ToString` rules above, we'll take a slight diversion to cover JSON stringification behaviors here.

For most simple values, JSON stringification behaves bascially the same as `toString()` conversions, except that the serialization result is *always a `string`*:

```js
JSON.stringify( 42 );	// "42"
JSON.stringify( "42" );	// ""42"" (a string with a quoted string value in it)
JSON.stringify( null );	// "null"
JSON.stringify( true );	// "true"
```

Any *JSON-safe* value can be stringified by `JSON.stringify(..)`. But, what is *JSON-safe*? Any value that can be represented validly in a JSON representation.

It may be easier to consider values which are **not** JSON-safe. Some examples: `undefined`s, `function`s, (ES6+) `symbol`s, and `object`s with circular references (where a property references in an object structure create a never-ending cycle through each other). These are all illegal values for a standard JSON structure, mostly because they aren't portable to other languages which consume JSON values.

The `JSON.stringify(..)` utility will automatically omit `undefined`, `function`, and `symbol` values when it comes across them. If such a value is found in an `array`, that value is replaced by `null` (so that the array position information isn't altered). If found as a property of an `object`, that property will simply be excluded.

Consider:

```js
JSON.stringify( undefined );					// undefined
JSON.stringify( function(){} );					// undefined

JSON.stringify( [1,undefined,function(){},4] );	// "[1,null,null,4]"
JSON.stringify( { a:2, b:function(){} } );		// "{"a":2}"
```

But if you try to `JSON.stringify(..)` an `object` with circular reference(s) in it, an error will be thrown.

JSON stringification has the special behavior that if an `object` value has a `toJSON()` method defined, this method will be called first to get a value to use for serialization.

If you intend to JSON stringify an object which may contain illegal JSON value(s), or if you just have values in the `object` that aren't appropriate for the serialization, you should define a `toJSON()` method for it that returns a *JSON-safe* version of the `object`.

For example:

```js
var o = { };

var a = {
	b: 42,
	c: o,
	d: function(){}
};

// create a circular reference inside `a`
o.e = a;

// would throw an error on the circular reference
// JSON.stringify( a );

// define a custom JSON value serialization
a.toJSON = function() {
	// only include the `b` property for serialization
	return { b: this.b };
};

JSON.stringify( a ); // "{"b":42}"
```

It's a very common misconception that `toJSON()` should return a the JSON stringification representation. That's probably incorrect, unless you're wanting to actually stringify the `string` itself (usually not!). `toJSON()` should return the actual regular value (of whatever type) that's appropriate, and `JSON.stringify(..)` itself will handle the stringification.

In other words, `toJSON()` should be interpreted as "to a JSON-safe value suitable for stringification", not "to a JSON string" as many developers mistakingly assume.

Consider:

```js
var a = {
	val: [1,2,3],

	// probably correct!
	toJSON: function(){
		return this.val.slice( 1 );
	}
};

var b = {
	val: [1,2,3],

	// probably incorrect!
	toJSON: function(){
		return "[" +
			this.val.slice( 1 ).join() +
		"]";
	}
};

JSON.stringify( a ); // "[2,3]"

JSON.stringify( b ); // ""[2,3]""
```

In the second call, we stringified the returned `string` rather than the `array` itself, which was probably not what we wanted to do.

While we're talking about `JSON.stringify(..)`, let's discuss some lesser-known functionalities which can still be very useful.

An optional second argument can be passed to `JSON.stringify(..)` which is called *replacer*. This argument can either be an `array` or a `function`. It's used to customize the recursive serialization of an `object` by providing a filtering mechanism for which properties should and should not be included, in a similar way to how `toJSON()` can prepare a value for serialization.

If *replacer* is an `array`, it should be an `array` of `string`s, each of which will specify a property name that is allowed to be included in the serialization of the `object`. If a property exists which isn't in this list, it will be skipped.

If *replacer* is a `function`, it will be called once for the `object` itself, and then once for each property in the `object`, and each time is passed two arguments, *key* and *value*. To skip a *key* in the serialization, return `undefined`. Otherwise, return the *value* provided.

```js
var a = {
	b: 42,
	c: "42",
	d: [1,2,3]
};

JSON.stringify( a, ["b","c"] ); // "{"b":42,"c":"42"}"

JSON.stringify( a, function(k,v){
	if (k !== "c") return v;
} );
// "{"b":42,"d":[1,2,3]}"
```

**Note:** In the `function` *replacer* case, the key argument `k` is `undefined` for the first call (where the `a` object itself is being passed in), then we **disallow** only properties of the name `"c"`. Stringification is recursive, so the `[1,2,3]` array has its values (`1`, `2`, and `3`) passed to *replacer* in `v` as well, with keys (`0`, `1`, and `2`) passed in `k`.

A third optional argument can also be passed to `JSON.stringify(..)`, called *space*, which is used as indentation for prettier human-friendly output. *space* can be a positive integer to indicate how many space characters should be used at each indentation level. Or, *space* can be a `string`, in which case up to the first ten characters of its value will be used for each indentation level.

```js
var a = {
	b: 42,
	c: "42",
	d: [1,2,3]
};

JSON.stringify( a, null, 3 );
// "{
//    "b": 42,
//    "c": "42",
//    "d": [
//       1,
//       2,
//       3
//    ]
// }"

JSON.stringify( a, null, "-----" );
// "{
// -----"b": 42,
// -----"c": "42",
// -----"d": [
// ----------1,
// ----------2,
// ----------3
// -----]
// }"
```

Remember, `JSON.stringify(..)` is not directly a form of coercion. We covered it here, however, because of two reasons, which  relate its behavior to `ToString` coercion:

1. `string`, `number`, `boolean`, and `null` values all stringify for JSON basically the same as how they coerce to `string` values via the rules of the `ToString` abstract operation.
2. If you pass an `object` value to `JSON.stringify(..)`, and that `object` has a `toJSON()` method on it, `toJSON()` is automatically called to (sort of) "coerce" the value to be *JSON-safe* before stringification.

### `ToNumber`

If any non-`number` value is used in a way that requires it to be a `number`, such as a mathematical operation, the ES5 spec defines the `ToNumber` abstract operation in section 9.3.

For example, `true` becomes `1` and `false` becomes `0`. `undefined` becomes `NaN`, but (curiously) `null` becomes `0`.

`ToNumber` for a `string` value essentially works for the most part like the rules/syntax for numeric literals (see Chapter 3). If it fails, the result is `NaN` (instead of a syntax error with `number` literals). One example difference is that `0`-prefixed octal numbers are not handled as octals (just as normal base-10 decimals) in this operation, though such octals are valid as `number` literals (see Chapter 2).

**Note:** The differences between `number` literal grammar and `ToNumber` on a `string` value are subtle and highly nuanced, and thus will not be covered further here. Consult section 9.3.1 of the ES5 spec for more information, if desired.

Objects (and arrays) will first be converted to their primitive value equivalent, if possible, and then this value (if a primitive but not already a `number`) is coerced to a `number` according to the `ToNumber` rules just mentioned.

To convert to this primitive value equivalent, the value in question will be consulted to see if it has a `valueOf()` method, and if so, what it returns (if a primitive value) will be used for the coercion. If no `valueOf()` is present, `toString()` is consulted, if present. If what it returns is a primitive, that will be used for the coercion.

**Note:** We cover how to coerce to `number`s later in this chapter in detail, but for this present discussion just assume the `Number(..)` function does so.

Consider:

```js
var a = {
	valueOf: function(){
		return "42";
	}
};

var b = {
	toString: function(){
		return "42";
	}
};

var c = [4,2];
c.toString = function(){
	return this.join( "" );	// "42"
};

Number( a );	// 42
Number( b );	// 42
Number( c );	// 42
Number( "" );	// 0
Number( [] );	// 0
```

If a primitive cannot be obtained, `NaN` will be the result.

### `ToBoolean`

Next, let's have a little chat about how `boolean`s behave in JS. There's **lots of confusion and misconception** floating out there around this topic, so pay close attention!

First and foremost, JS has actual keywords `true` and `false`, and they behave exactly as you'd expect of `boolean` values. It's a common misconception that the values `1` and `0` are identical to `true` / `false`. While that may be true in other languages, in JS the `number`s are `number`s and the `boolean`s are `boolean`s. You can coerce `1` to `true` (and vice versa) or `0` to `false` (and vice versa). But they're not the same.

#### Falsy Values

But that's not the end of the story. We need to discuss how values other than the two `boolean`s behave whenever you coerce *to* their `boolean` equivalent.

All of JavaScript's values can be divided into two categories:

1. values that will become `false` if coerced to `boolean`
2. everything else (which will obviously become `true`)

I'm not just being facetious. It's quite literally that the JS spec defines a specific, narrow list of values that will coerce to `false` when coerced to a `boolean` value.

How do we know what the list of values is? In the ES5 spec, section 9.2 defines a `ToBoolean` abstract operation, which says exactly what happens for all the possible values when you try to coerce them "to-boolean".

From that table, we get the following as the so-called "falsy" values list:

* `undefined`
* `null`
* `false`
* `+0`, `-0`, and `NaN`
* `""`

That's it. If a value is on that list, it's a "falsy" value, and it will coerce to `false` if you force a `boolean` coercion on it.

By logical conclusion, if a value is *not* on that list, it must be on *another list*, which we call the "truthy" values list. But JS doesn't really define a "truthy" list per se. It gives some examples, such as saying explicitly that all objects are truthy, but mostly the spec just implies: **anything not explicitly on the falsy list is therefore truthy.**

#### Falsy Objects

Wait a minute, that section title even sounds contradictory. We literally *just said* the spec calls all objects truthy, right? There should be no such thing as a "falsy object".

What could that possibly even mean?

You might be tempted to think it means an object-wrapper (see Chapter 3) around a falsy value (such as `""`, `0` or `false`). But don't fall into that *trap*.

**Note:** I had a smirk on my face when I wrote that last sentence, because it's a subtle joke only some of you will get. Chuckle along with me if you do! Ignore it otherwise.

Consider:

```js
var a = new Boolean( false );
var b = new Number( 0 );
var c = new String( "" );
```

We know all three values here are objects (see Chapter 3) wrapped around obviously falsy values. But do these objects behave as `true` or as `false`? That's easy to answer:

```js
var d = Boolean(a && b && c);

d; // true
```

So, all three behave as `true`, as that's the only way `d` could end up as `true`.

**Note:** Notice by the way the `Boolean( .. )` wrapped around the `a && b && c` set. You might wonder why that's there. We'll come back to that later in this chapter, so make a mental note of it. For a sneak-peek (trivia-wise), see try for yourself what `d` is if you just do `d = a && b && c` without the `Boolean( .. )` call!

So, if "falsy objects" are **not just objects wrapped around falsy values**, what the heck are they?

The tricky part is: they can show up in your JS program, but they're not actually part of JavaScript itself.

**What!?**

There are certain cases where browsers (you know: what provides the environment that wraps around the JS engine and gives your program *context*) have created their own sort of *exotic* values-behavior, namely this idea of "falsy objects", on top of regular JS semantics.

A "falsy object" is a value that looks and acts like a normal object (properties, etc), but when you coerce it to a `boolean`, it coerces to a `false` value.

**Why!?**

The most well-known case is `document.all`: an array (object) provided to your JS program *by the DOM* (not the JS engine itself) which exposes elements in your page to your JS program. It *used* to behave like normal objects, in that it would act truthy. But not anymore.

`document.all` itself was never really "standard" and has long since been deprecated/abandoned.

"Can't they just remove it, then?" Sorry, nice try. Wish they could. But there's far too many legacy JS code bases out there which rely on using it.

So, why make it act falsy? Because coercions of `document.all` to `boolean` (like in `if` statements) were almost always used as a means of detecting old, non-standard IE. IE has long-since come up to standards compliance, and in many cases is pushing the web forward as much or more than any other browser.

But all that old `if (document.all) { /* it's IE. :( */ }` code is still out there, and is probably never going away. Which means all this legacy code is still assuming it's running in decade-old IE. That just leads to bad browsing experience for IE users.

So, we can't remove `document.all` completely, but IE doesn't want `if (document.all) { .. }` code to work anymore, so that users in modern IE get new, standards-compliant code logic.

"What should we do?" **"I've got it! Let's bastardize the JS type system and pretend that `document.all` is falsy!"

Ugh. That sucks. It's a crazy gotcha that most JS developers don't understand. But the alternative (doing nothing about the above no-win problems) sucks *just a little bit more*.

So... that's what we've got: crazy, non-standard "falsy objects" added to JavaScript by the browsers. Yay!

#### Truthy Values

Back to the truthy list. What exactly are the truthy values? Remember: **a value is truthy if it's not on the falsy list.**

Consider:

```js
var a = "false";
var b = "0";
var c = "''";

var d = Boolean( a && b && c );

d;
```

What value do you expect `d` to have here? It's gotta be either `true` or `false`.

It's `true`. Why? Because despite the contents of those `string` values looking like falsy values, the `string` values themselves are all truthy, because `""` is the only `string` value on the falsy list.

What about these?

```js
var a = [];				// empty array -- truthy or falsy?
var b = {};				// empty object -- truthy or falsy?
var c = function(){};	// empty function -- truthy or falsy?

var d = Boolean( a && b && c );

d;
```

Yep, you guessed it, `d` is still `true` here. Why? Same reason as before. Despite what it may seem like, `[]`, `{}`, and `function(){}` are *not* on the falsy list, and thus are truthy values.

In other words, the truthy list is infinitely long. It's impossible to make such a list. You can only make a finite falsy list and consult *it*.

Take five minutes, write the falsy list on a post-it note for your computer monitor, or memorize it if you prefer. Either way, you'll easily be able to construct a virtual truthy list whenever you need it by simply asking if it's on the falsy list or not.

The importance of truthy and falsy is in understanding how a value will behave if you coerce it (either explicitly or implicitly) to a `boolean` value. Now that you have those two lists in mind, we can dive into coercion examples themselves.

## Explicit Coercion

*Explicit Coercion:* type conversions that are obvious and explicit. There's a wide range of type conversion usage that clearly falls under the *explicit coercion* category for most developers.

The goal here is to identify patterns in our code where we can make it clear and obvious that we're converting a value from one type to another, so as to not leave potholes for future developers to trip into. The more explicit we are, the more likely someone later will be able to read our code and understand without undue effort what our intent was.

It would be hard to find any salient disagreements with *explicit coercion*, as it most closely aligns with the commonly accepted practices of type conversion works in statically-typed languages. As such, we'll take for granted (for now) that *explicit coercion* can be agreed upon to not be evil or controversial. We'll revisit this later, though.

### Strings <--> Numbers

We'll start with the simplest and perhaps most common coercion operation: coercing values between `string` and `number` representation.

To coerce between `string`s and `number`s, we use the built-in `String(..)` and `Number(..)` functions (which we referred to as "native constructors" in Chapter 3), but **very importantly**, we do not use the `new` keyword in front of them. As such, we're not creating object wrappers.

Instead, we're actually *explicitly coercing* between the two types:

```js
var a = 42;
var b = String( a );

var c = "3.14";
var d = Number( c );

b; // "42"
d; // 3.14
```

`String(..)` coerces from any other value to a primitive `string` value, using the rules of the earlier discussed `ToString` operation. `Number(..)` coerces from any other value to a primitive `number` value, using the rules of the earlier discussed `ToNumber` operation.

I call this *explicit coercion* because in general, it's pretty obvious to most developers that the end result of these operations is the applicable type conversion.

In fact, this usage actually looks a lot like it does in some other statically-typed languages.

For example, in C/C++, you can say either `(int)x` or `int(x)`, and both will convert the value in `x` to an integer. Both forms are valid, but many prefer the latter, which kinda looks like a function call. In JavaScript, when you say `Number(x)`, it looks awfully similar. Does it matter that it's *actually* a function call in JS? Not really.

Besides `String(..)` and `Number(..)`, there are other ways to "explicitly" convert these values between `string` and `number`:

```js
var a = 42;
var b = a.toString();

var c = "3.14";
var d = +c;

b; // "42"
d; // 3.14
```

Calling `a.toString()` is ostensibly explicit (pretty clear that "toString" means "to a string"), but there's some hidden implicitness here. `toString()` cannot be called on a *primitive* value like `42`. So JS automatically "boxes" (see Chapter 3) `42` in an object wrapper, so that `toString()` can be called against the object. In other words, you might call it "explicitly implicit".

`+c` here is showing the *unary operator* form (operator with only one operand) of the `+` operator. Instead of performing mathematic addition (or string concatenation -- see below), the unary `+` explicitly coerces its operand (`c`) to a `number` value.

Is `+c` *explicit coercion*? Depends on your experience and perspective. If you know (which you do, now!) that unary `+` is explicitly intended for `number` coercion, then it's pretty explicit and obvious. However, if you've never seen it before, it can seem awfully confusing, implicit, hidden side-effect, etc.

**Note:** The generally accepted perspective in the open-source JS community is that unary `+` is an accepted form of *explicit coercion*.

Even if you really like the `+c` form, there are definitely places where it can look awfully confusing. Consider:

```js
var c = "3.14";
var d = 5+ +c;

d; // 8.14
```

You can probably dream up all sorts of hideous combinations of binary operators (like `+` for addition) next to the unary form of an operator. I'll leave such masochism as an exercise for the reader.

You might want to consider avoiding unary `+` coercion when it's immediately adjacent to other operators. While the above works, it would almost universally be considered a bad idea. Even `d = +c` (or `d =+ c` for that matter!) can far too easily be confused for `d += c`, which is entirely different!

Remember, we're trying to be explicit and **reduce** confusion, not make it much worse!

#### `Date` To `number`

Another common usage of the unary `+` operator is to coerce a `Date` object into a `number`, because the result is the unix timestamp (milliseconds elapsed since 1 January 1970 00:00:00 UTC) representation of the date/time value:

```js
var d = new Date( "Mon, 18 Aug 2014 08:53:06 CDT" );

+d; // 1408369986000
```

The most common usage of this idiom is to get the current *now* moment as a timestamp, such as:

```js
var timestamp = +new Date();
```

**Note:** Some developers are aware of a peculiar syntactic "trick" in JavaScript, which is that the `()` set on a constructor call (a function called with `new`) is *optional* if any only if there are no arguments to pass. So you may run across the `var timestamp = +new Date;` form. However, most developers don't agree that omitting the `()` improves readability, as it's a strange and uncommon syntax exception that only applies to the `new fn()` call form and not the regular `fn()` call form.

But coercion is not the only way to get the timestamp out of a `Date` object. A non-coercion approach is perhaps even preferable, as it's even more explicit:

```js
var timestamp = new Date().getTime();
// var timestamp = (new Date()).getTime();
// var timestamp = (new Date).getTime();
```

But an *even more* preferable non-coercion option is to use the ES5 added `Date.now()` static function:

```js
var timestamp = Date.now();
```

And if you want polyfill `Date.now()` into older browsers, it's pretty simple:

```js
if (!Date.now) {
	Date.now = function() {
		return +new Date();
	};
}
```

I'd recommend skipping the coercion forms related to dates. Use `Date.now()` for current *now* timestamps, and `new Date( .. ).getTime()` for getting a timestamp of a specific *non-now* date/time that you need to specify.

### Parsing Numeric Strings

A similar outcome to coercing a `string` to a `number` can be achieved by parsing a `number` out of a `string`'s character contents. There are, however, distinct differences between this parsing and the type conversion we examined above.

Consider:

```js
var a = "42";
var b = "42px";

Number( a );	// 42
parseInt( a );	// 42

Number( b );	// NaN
parseInt( b );	// 42
```

Parsing a numeric value out a string is *tolerant* of non-numeric characters (just stops going left-to-right when encountered), whereas coercion is *not tolerant* and fails resulting in the `NaN` value.

Parsing should not be seen as a substitute for coercion. These two tasks, while similar, have different purposes. Parse a `string` as a `number` when you don't know/care what other non-numeric characters there may be on the right-hand side. Coerce a `string` (to a `number`) when the only acceptable values are numeric and something like `"42px"` should be rejected as a `number`.

**Note:** `parseInt(..)` has a a twin, `parseFloat(..)`, which (as it sounds) pulls out a floating point number from a string.

Don't forget that `parseInt(..)` operates on `string` values. It makes absolutely no sense to pass a `number` value to `parseInt(..)`. Nor would it make sense to pass any other type of value, like `true`, `function(){..}` or `[1,2,3]`.

If you pass a non-`string`, the value you pass will automatically be coerced to a `string` first (see "`ToString`" earlier), which would clearly be a kind of hidden *implicit coercion*. It's a really bad idea to rely upon such a behavior in your program, so never use `parseInt(..)` with a non-`string` value.

Prior to ES5, another gotcha existed with `parseInt(..)`, which was the source of many JS programs' bugs. If you didn't pass a second argument to indicate which numeric base (aka radix) to use for interpreting the numeric `string` contents, `parseInt(..)` would look at the first character to make a *guess*.

If the first character was `x` or `X`, the guess (by convention) was that you wanted to interpret the `string` as a hexadecimal (base-16) `number`. If the first character was `0`, the guess (again, by convention) was that you wanted to interpret the `string` as an octal (base-8) `number`.

Hexadecimal `string`s (with the leading `x` or `X`) aren't terribly easy to get mixed up. But the octal number guessing proved devilishly common. For example:

```js
var hour = parseInt( selectedHour.value );
var minute = parseInt( selectedMiniute.value );

console.log( "The time you selected was: " + hour + ":" + minute);
```

Seems harmless, right? Try selecting `08` for the hour and `09` for the minute. You'll get `0:0`. Why? because neither `8` nor `9` are valid characters in octal base-8.

The pre-ES5 fix was simple, but so easy to forget: **always pass `10` as the second argument**. This was totally safe:

```js
var hour = parseInt( selectedHour.value, 10 );
var minute = parseInt( selectedMiniute.value, 10 );
```

As of ES5, `parseInt(..)` no longer guesses. Unless you say otherwise, it assumes base-10. That's much nicer. Just be careful if your code has to run in pre-ES5 environments, in which case you still need to pass `10` for the radix.

#### Parsing Non-Strings

One somewhat infamous example of `parseInt(..)`'s behavior is highlighted in a sarcastic joke post a few years ago, poking fun at this JS behavior:

```js
parseInt( 1/0, 19 ); // 18
```

The assumptive (but totally invalid) assertion was, "If I pass in Infinity, and parse an integer out of that, I should get Infinity back, not 18." Surely, JS must be crazy for this outcome, right?

Though this example is obviously contrived and unreal, let's indulge the madness for a moment and examine whether JS really is that crazy.

First off, the most obvious sin committed here is to pass a non-`string` to `parseInt(..)`. That's a no-no. Do it and you're asking for trouble. But even if you do, JS politely coerces what you pass in to a `string` that it can try to parse.

Some would argue that this is unreasonable behavior, and that `parseInt(..)` should refuse to operate on a non-`string` value. Should it perhaps throw an error? That would be very Java-like, frankly. I shudder at thinking JS should start throwing errors all over the place so that `try..catch` is needed around almost every line.

Should it return `NaN`? Maybe. But... what about:

```js
parseInt( new String( "42") );
```

Should that fail, too? It's a non-`string` value. If you would want that `String` object wrapper to be unboxed to `"42"`, then is it really so unusual for `42` to first become `"42"` so that `42` can be parsed back out?

I would argue that this *half-explicit, half-implicit coercion* that can occur (we'll get into more detail on such things later) can often be a very helpful thing. For example:

```js
var a = {
	num: 21,
	toString: function() { return String( this.num * 2 ); }
};

parseInt( a ); // 42
```

The fact that `parseInt(..)` forcibly coerces its value to a `string` to perform the parse on is quite sensible. If you pass in garbage, and you get garbage back out, don't blame the trash can -- it just did its job faithfully.

So, if you pass in a value like `Infinity` (the result of `1 / 0` obviously), what sort `string` representation would make most sense for its coercion? Only two reasonable choices come to mind: `"Infinity"` and `"∞"`. JS chose `"Infinity"`. I'm glad it did.

I think it's a good thing that **all values** in JS have some sort of default `string` representation, so that they aren't mysterious black boxes that we can't debug and reason about.

Now, what about base-19? Obviously completely bogus and contrived. No real JS programs use base-19. It's absurd. But again, let's indulge the ridiulousness. In base-19, the valid numeric characters are `0` - `9` and `a` - `i` (case insensitive).

So, back to our `parseInt( 1/0, 19 )` example. It's essentially `parseInt( "Infinity", 19 )`. How does it parse? The first character is `"I"`, which is value `18` in the silly base-19. The second character `"n"` is not in the valid set of numeric characters, and as such the parsing simply politely stops, just like when it ran across `"p"` in `"42px"`.

The result? `18`. Exactly like it sensibly should. The behaviors involved to get us there, and not to an error or to `Infinity` itself, are **very important** to JS, and should not be so easily discarded.

Other examples of this behavior with `parseInt(..)` which may be surprising (but should be quite expected!):

```js
parseInt( 0.000008 );		// 0 ("0" from "0.0...")
parseInt( 0.0000008 );		// 8 ("8e-7")
parseInt( false, 16 );		// 250 ("fa" from "false")
parseInt( parseInt, 16 );	// 15 ("f" from "function..")

parseInt( "0x10" );			// 16
parseInt( "10", 2 );		// 2
```

`parseInt(..)` is actually pretty predictable and consistent in its behavior. If you use it correctly, you'll get sensible results. If you use it incorrectly, the crazy results you get are not the fault of JavaScript.

### * --> Boolean

Now, let's examine coercing from any non-`boolean` value to a `boolean`.

Just like with `String(..)` and `Number(..)` above, `Boolean(..)` (without the `new`, of course!) is an explicit way of forcing the `ToBoolean` coercion:

```js
var a = "0";
var b = [];
var c = {};

var d = "";
var e = 0;
var f = null;
var g;

Boolean( a ); // true
Boolean( b ); // true
Boolean( c ); // true

Boolean( d ); // false
Boolean( e ); // false
Boolean( f ); // false
Boolean( g ); // false
```

While `Boolean(..)` is clearly explicit, it's not at all common or idiomatic.

Just like the unary `+` operator coerces a value to a `number` (see above),

The unary `!` operator (aka "negate") explicitly coerces a value to a `boolean` (just like the unary `+` operator for `number`s). The *problem* is that it also flips the value from truthy to falsy or vice versa. So, the most common way developers explicitly coerce to `boolean` is to use the `!!` ("double negate"):

```js
var a = "0";
var b = [];
var c = {};

var d = "";
var e = 0;
var f = null;
var g;

!!a; // true
!!b; // true
!!c; // true

!!d; // false
!!e; // false
!!f; // false
!!g; // false
```

Any of these `ToBoolean` coercions would happen *implicitly* without the `Boolean(..)` or `!!`, if used in a `boolean` context such as an `if (..) ..` statement. But the goal here is to explicitly force the value to a `boolean` to make it clearer that the `ToBoolean` coercion is intended.

Another example use-case for explicit `ToBoolean` coercion is if you want to force a `true` / `false` value coercion in the JSON serialization (see above) of a data structure:

```js
var a = [
	1,
	function(){ /*..*/ },
	2,
	function(){ /*..*/ }
];

JSON.stringify( a ); // "[1,null,2,null]"

JSON.stringify( a, function(key,val){
	if (typeof val == "function") {
		// force `ToBoolean` coercion of the function
		return !!val;
	}
	else {
		return val;
	}
} );
// "[1,true,2,true]"
```

If you come to JavaScript from Java, you may recognize this idiom:

```js
var a = 42;

var b = a ? true : false;
```

The `? :` ternary operator will test `a` for truthiness, and based on that test will either assign `true` or `false` to `b`, accordingly.

On its surface, this idiom looks like a form of *explicit* `ToBoolean`-type coercion, since it's obvious that either `true` or `false` come out of the operation.

However, there's a hidden *implicit coercion*, in that the `a` expression has to first be coerced to `boolean` to perform the truthiness test. I'd call this idiom "explicitly implicit". **You should avoid this idiom completely** in JavaScript. It offers no real benefit, and worse, masquerades as something it's not.

## Implicit Coercion

*Implicit Coercion:* type conversions that are hidden, non-obvious side-effects that implicitly occur from other actions. In other words, *implicit coercions* are any type conversions that aren't obvious (to you).

While it's clear what the goal of *explicit coercion* would be (making code explicit and more understandable), it might seem *too obvious* that *implicit coercion* would fight against that goal and make code harder to understand.

Taken at face value, that's where much of the ire towards coercion comes from. The majority of complaints about "JavaScript coercion" are actually aimed (whether they realize it or not) at *implicit coercion*.

**Note:** Doug Crockford, author of *"JavaScript: The Good Parts"*, has claimed in many conference talks and writings that JavaScript coercion should be avoided. But what he really means is that *implicit coercion* is bad (in his opinion). In fact, if you read Doug's code, you'll find plenty of examples of *explicit coercion*, so it's clear just from that observation where his true angst is directed.

So, **is implicit coercion** evil? Is it dangerous? Should we avoid it at all costs?

I bet most of you readers are inclined to enthusiastically cheer, "Yes!"

**Not so fast.** Hear me out throughout the rest of the chapter.

Let's take a different perspective on what *implicit coercion* is, and can be, than just that it's "the opposite of the good explicit kind of coercion". That's far too narrow, and misses important nuance.

Let's define the goal of *implicit coercion* as: to reduce verbosity, boilerplate, and/or unnecessary implementation detail which clutters up our code with noise that distracts from the more important intent.

### Implicitly Simplifying

Before we even get to JavaScript, let me suggest something pseudo-code'ish from some theoretical strongly-typed language to illustrate:

```js
SomeType x = SomeType( AnotherType( y ) )
```

In this example, I have some arbitrary type of value in `y` that I want to convert to the `SomeType` type. The problem is, this language can't go directly from whatever `y` currently is to `SomeType`. It needs an intermediate step, where it first converts to `AnotherType`, and then from `AnotherType` to `SomeType`.

Now, what if that language (or definition you could create yourself with the language) *did* just let you say:

```js
SomeType x = SomeType( y )
```

Wouldn't you generally agree that we simplified the type conversion here to reduce the visibility of the somewhat unnecessary "noise" of the intermediate conversion step? I mean, is it *really* all that important, right here at this point in the code, to see and deal with the fact that `y` goes to `AnotherType` first before then going to `SomeType`?

Some would argue, at least in some circumstances, yes. But I think an equal argument can be made of many other circumstances that here, the simplification **actually aids in the understanding of code** by abstracting or hiding way such details, either in the language itself or in our own abstractions.

Undoubtedly, behind the scenes, somewhere, the intermediate conversion step is happening. But if that detail is hidden from view here, we can just reason about getting `y` to type `SomeType` as an generic operation, and omit the details.

While not a perfect analogy, what I'm going to argue throughout the rest of this chapter is that JS *implicit coercion* can be thought of as providing similar aid to your code.

But, **and this is very important**, that is not an unbounded, absolute statement. There are most definitely plenty of *evils* lurking around *implicit coercion*. We have to learn how to avoid them so as to not poison our code with all manner of bugs.

Many developers take the approach that if the mechanism by which we can do some useful thing **A** can also be abused or misused to do some awful thing **Z**, then we should throw out the mechanism altogether, just to be safe.

My encouragement to you is, don't settle for that. Don't "throw the baby out with the bathwater". Don't assume *implicit coercion* is all bad because all you think you've ever seen is its "bad parts". There are "good parts" here, and I want to help and inspire more of you to find and embrace them!
