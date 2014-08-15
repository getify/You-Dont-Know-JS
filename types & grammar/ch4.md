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

*Explicit Coercion:* type conversions that are obvious and explicit. There's a wide range of type conversion usage that clearly falls under the *explicit coercion* category for most developers.

The goal here is to identify patterns in our code where we can make it clear and obvious that we're converting a value from one type to another, so as to not leave potholes for future developers to trip into. The more explicit we are, the more likely someone later will be able to read our code and understand without undue effort what our intent was.

It would be hard to find any salient disagreements with *explicit coercion*, as it most closely aligns with the commonly accepted practices of type conversion works in statically-typed languages. As such, we'll take for granted (for now) that *explicit coercion* can be agreed upon to not be evil or controversial. We'll revisit this later, though.

### Strings <-> Numbers

Let's start with the simplest and perhaps most common: coercing values between `string` and `number` representation.

Consider:

```js
var a = 42;
var b = String( a );

var c = "3.14";
var d = Number( c );

b; // "42"
d; // 3.14
```

We use the built-in `String(..)` and `Number(..)` functions (which referred to as "native constructors" in Chapter 3), but **very importantly**, we do not use the `new` keyword in front of them. As such, we're not creating object wrappers.

Instead, we're actually *explicitly coercing*. `String(..)` coerces from any other value to a primitive `string` value. `Number(..)` coerces from any other value to a primitive `number` value.

I call this *explicit coercion* because in general, it's pretty obvious to most developers that the end result of these operations is the applicable type conversion.

In fact, this usage actually looks a lot like it does in some other statically-typed languages.

For example, in C/C++, you can say either `(int)x` or `int(x)`, and both will convert the value in `x` to an integer. Both forms are valid, but many prefer the latter, which kinda looks like a function call. In JavaScript, when you say `Number(x)`, it looks awfully similar. Does it matter that it's *actually* a function call in JS? Not really.

Besides the above, there are other ways to "explicitly" convert these values between `string` and `number`:

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

**Note:** The generally accepted perspective in the open-source JS community is that unary `+` is usually an accepted form of *explicit coercion*.

Even if you really like the `+c` form, there are definitely places where it can look awfully confusing. Consider:

```js
var c = "3.14";
var d = 5+ +c;

d; // 8.14
```

You can probably dream up all sorts of hideous combinations of binary operators (like `+` for addition) next to the unary form of an operator. I'll leave such masochism as an exercise for the reader.

The point I'm making is, you might want to consider avoiding unary `+` coercion when it's immediately adjacent to other operators. While the above works, it would almost universally be considered a bad idea. Even `d = +c` can easily be confused for `d += c`, which is entirely different!

## Implicit Coercion

*Implicit Coercion:* type conversions that are hidden, non-obvious side-effects that implicitly occur from other actions. In other words, *implicit coercions* are any type conversions that aren't obvious (to you).

While it's clear what the goal of *explicit coercion* would be (making code explicit and more understandable), it might seem *too obvious* that *implicit coercion* would fight against that goal and make code harder to understand.

Taken at face value, that's where much of the ire towards coercion comes from. The majority of complaints about "JavaScript coercion" are actually aimed (whether they realize it or not) at *implicit coercion*.

**Note:** When Doug Crockford says that JavaScript coercion is "dangerous" and a "flaw" in the design of the language, what he really means is that *implicit coercion* is bad (in his opinion). In fact, if you read Doug's code, you'll find plenty of examples of *explicit coercion*, so it's obvious just from that observation where his true angst is directed.

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

In this example, I have some arbitrary type of value in `y` that I want to convert to the `SomeType` type. The problem is, this language can't go directly from whatever `y` currently is to `SomeType`. It has to have an intermediate step, where it first goes to `AnotherType`, and then from `AnotherType` to `SomeType`.

Why? Who knows, who cares? If you're written code in statically-typed languages before, you know this stuff happens. I'm just giving a generic concept of the issue.

Now, what if that language (or definition you could create yourself with the language) *did* just let you say:

```js
SomeType x = SomeType( y )
```

Wouldn't you generally agree that we simplified the type conversion here to remove the *obviousness* of the somewhat unnecessary "noise" of the intermediate conversion step? I mean, is it *really* all that important, right here at this point in the code, to see and deal with the fact that `y` goes to `AnotherType` first before then going to `SomeType`?

Some would argue, at least in some circumstances, yes. But I think an equal argument can be made of many other circumstances that here, the simplification **actually aids in the understanding of code** by abstracting or hiding way such details, either in the language itself or in our own abstractions. Undoubtedly, behind the scenes, somewhere, the two-step conversion is happening. But if that detail is hidden from view here, we can just reason about getting `y` to type `SomeType` as an abstract operation, and leave the details out of it at present.

While not a perfect analogy, what I'm going to argue throughout the rest of this chapter is that JS *implicit coercion* can be thought of as providing similar aid to your code.

But, **and this is very important**, that is not an unbounded, absolute statement. There are most definitely plenty of *evils* lurking around *implicit coercion*. We have to learn how to avoid them so as to not poison our code with all manner of bugs.

Many developers take the approach that if the mechanism by which we can do some useful thing **A** can also be abused or misused to do some awful thing **Z**, then we should throw out the mechanism altogether, just to be safe.

My encouragement to you is, don't settle for that. Don't "throw the baby out with the bathwater". Don't assume *implicit coercion* is all bad because all you think you've ever seen is its "bad parts". There are "good parts" here, and I want to help and inspire more of you to find and embrace them!

