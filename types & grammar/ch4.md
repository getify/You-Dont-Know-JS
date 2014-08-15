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

## Falsy & Truthy

Before we explore *explicit* and *implicit* coercion, we need to have a little chat about how `boolean`s behave in JS.

First and foremost, JS has actual keywords `true` and `false`, and they behave exactly as you'd expect of `boolean` values. It's a common misconception that the values `1` and `0` are identical to `true` / `false`. While that may be true in other languages, in JS the `number`s are `number`s and the `boolean`s are `boolean`s. You can coerce `1` to `true` (and vice versa) or `0` to `false` (and vice versa). But they're not the same.

### Falsy Values

But that's not the end of the story. We need to discuss how values other than the two `boolean`s behave whenever you coerce *to* their `boolean` equivalent.

All of JavaScript's values can be divided into two categories:

1. values that will become `false` if coerced to `boolean`
2. everything else (which will obviously become `true`)

I'm not just being facetious. It's quite literally that the JS spec defines a specific, narrow list of values that will coerce to `false` when coerced to a `boolean` value.

How do we know what the list of values is? In the ES5 spec, as of time of writing, section 9.2 defines a `ToBoolean` "abstract operation" (fancy spec-speak for "internal-only operation"), which says exactly what happens for all the possible values when you try to coerce them "to-boolean".

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

### Truthy Values

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

*Explicit Coercion:* type conversions that are obvious and explicit. There's a wide range of type conversion usage that clearly falls under the *explicit coercion* category.

## Implicit Coercion

*Implicit Coercion:* type conversions that are hidden, non-obvious side-effects that implicitly occur from other actions. In other words, *implicit coercions* are any type conversions that aren't obvious (to you).
