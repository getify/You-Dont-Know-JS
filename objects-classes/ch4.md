# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 4: This Works

| NOTE: |
| :--- |
| Work in progress |

We've seen the `this` keyword used quite a bit so far, but haven't really dug in to understand exactly how it works in JS. It's time we do so.

But to properly understand `this` in JS, you need to set aside any preconceptions you may have, especially assumptions from how `this` works in other programming languages you may have experience in.

Here's the most important thing to understand about `this`: the determination of what value (usually, object) `this` points at is not made at author time, but rather determined at runtime. That means you cannot simply look at a `this`-aware function (even a method in a `class` definition) and know for sure what `this` will hold while that function runs.

Instead, you have to find each place the function is invoked, and look at *how* it's invoked (not even *where* matters). That's the only way to fully answer what `this` will point to.

In fact, a single `this`-aware function can be invoked at least four different ways, and any of those approaches will end up assigning a different `this` for that particular function invocation.

So the typical question we might ask when reading code -- "What does `this` point to the function?" -- is not actually a valid question. The question you really have to ask is, "When the function is invoked a certain way, what `this` will be assigned for that invocation?"

If your brain is already twisting around just reading this chapter intro... good! Settle in for a rewiring of how you think about `this` in JS.

## This Aware

I used the phrase `this`-aware just a moment ago. But what exactly do I mean by that?

Any function that has a `this` keyword in it.

If a function does not have `this` in it anywhere, then the rules of how `this` behaves don't affect that function in any way. But if it *does* have even a single `this` in it, then you absolutely cannot determine how the function will behave without figuring out, for each invocation of the function, what `this` will point to.

It's sort of like the `this` keyword is a placeholder in a template. That placeholder's value-replacement doesn't get determined when we author the code; it gets determined while the code is running.

You might think I'm just playing word games here. Of course, when you write the program, you write out all the calls to each function, so you've already determined what the `this` is going to be when you authored the code, right? Right!?

Not so fast!

First of all, you don't always write all the code that invokes your function(s). Your `this`-aware function(s) might be passed as a callback(s) to some other code, either in your code base, or in a third-party framework/utility, or even inside a native built-in mechanism of the language or environment that's hosting your program.

But even aside from passing functions as callbacks, several mechanisms in JS allow for conditional runtime behaviors to determine which value (again, usually object) will be set for the `this` of a particular function invocation. So even though you may have written all that code, you *at best* will have to mentally execute the different conditions/paths that end up affecting the function invocation.

And why does all this matter?

Because it's not just you, the author of the code, that needs to figure this stuff out. It's *every single reader* of your code, forever. If anyone (even your future self) wants to read a piece of code that defines a `this`-aware function, that inevitably means that, to fully understand and predict its behavior, that person will have to find, read, and understand every single invocation of that function.

### This Confuses Me

Now, in fairness, that's already partially true if we consider a function's parameters. To understand how a function is going to work, we need to know what is being passed into it. So any function with at least one parameter is, in a similar sense, *argument*-aware -- meaning, what argument(s) is/are passed in and assigned to the parameter(s) of the function.

But with parameters, we often have a bit more of a hint from the function itself what the parameters will do and hold.

We often see the names of the parameters declared right in the function header, which goes a long way to explaining their nature/purpose. And if there are defaults for the parameters, we often see them declared inline with `= whatever` clauses. Moreover, depending on the code style of the author, we may see in the first several lines of the function a set of logic that applies to these parameters; this could be assertions about the values (disallowed values, etc), or even modifications (type conversion, formatting, etc).

Actually, `this` is very much like a parameter to a function, but it's an implicit parameter rather than an explicit one. You don't see any signal that `this` is going to be used, in the function header anywhere. You have to read the entire function body to see if `this` appears anywhere.

The "parameter" name is always `this`, so we don't get much of a hint as to its nature/purpose from such a general name. In fact, there's historically a lot of confusion of what "this" even is supposed to mean. And we rarely see much if anything done to validate/convert/etc the `this` value applied to a function invocation. In fact, virtually all `this`-aware code I've seen just neatly assumes the `this` "parameter" is holding exactly what value is expected. Talk about **a trap for unexpected bugs!**

### So What Is This?

If `this` is an implicit parameter, what's its purpose? What's being passed in?

Hopefully you have already read the "Scope & Closures" book of this series. If not, I strongly encourage you to circle back and read that one once you've finished this one. In that book, I explained at length how scopes (and closures!) work, an especially important characteristic of functions.

Lexical scope (including all the variables closed over) represents a *static* context for the function's lexical identifier references to be evaluated against. It's fixed/static because at author time, when you place functions and variable declarations in various (nested) scopes, those decisions are fixed, and unaffected by any runtime conditions.

By contrast, a different programming language might offer *dynamic* scope, where the context for a function's variable references is not determined by author-time decisions but by runtime conditions. Such a system would be undoubtedly more flexible than static context -- though with flexibility often comes complexity.

To be clear: JS scope is always and only lexical and *static* (if we ignore non-strict mode cheats like `eval(..)` and `with`). However, one of the truly powerful things about JS is that it offers another mechanism with similar flexibility and capabilities to *dynamic* scope.

The `this` mechanism is, effectively, *dynamic* context (not scope); it's how a `this`-aware function can be dynamically invoked against different contexts -- something that's impossible with closure and lexical scope identifiers!

### Why Is This So Implicit?

You might wonder why something as important as a *dynamic* context is handled as an implicit input to a function, rather than being an explicit argument passed in.

That's a very important question, but it's not one we can quite answer, yet. Hold onto that question though.

### Can We Get On With This?

So why have I belabored *this* subject for a couple of pages now? You get it, right!? You're ready to move on.

My point is, you the author of code, and all other readers of the code even years or decades in the future, need to be `this`-aware. That's the choice, the burden, you place on the reading of such code. And yes, that goes for the choice to use `class` (see Chapter 3), as most class methods will be `this`-aware out of necessity.

Be aware of *this* `this` choice in code you write. Do it intentionally, and do it in such a way as to produce more outcome benefit than burden. Make sure `this` usage in your code *carries its own weight*.

Let me put it *this* way: don't use `this`-aware code unless you really can justify it, and you've carefully weighed the costs. Just because you've seen a lot of code examples slinging around `this` in others' code, doesn't mean that `this` belongs in *this* code you're writing.

The `this` mechanism in JS, paired with `[[Prototype]]` delegation, is an extremely powerful pillar of the language. But as the cliche goes: "with great power comes great responsibility". Anecdotally, even though I really like and appreciate *this* pillar of JS, probably less than 5% of the JS code I ever write uses it. And when I do, it's with restraint. It's not my default, go-to JS capability.

## This Is It!

OK, enough of the wordy lecture. You're ready to dive into `this` code, right?

Let's revisit (and extend) `Point2d` from Chapter 3, but just as an object with data properties and functions on it, instead of using `class`:

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) {
        var rotatedX = this.x * Math.cos(angleRadians) -
            this.y * Math.sin(angleRadians);
        var rotatedY = this.x * Math.sin(angleRadians) +
            this.y * Math.cos(angleRadians);
        this.x = rotatedX;
        this.y = rotatedY;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
};
```

As you can see, the `init(..)`, `rotate(..)`, and `toString()` functions are `this`-aware. You might be in the habit of assuming that the `this` reference will obviously always hold the `point` object. But that's not guaranteed in any way.

Keep reminding yourself as you go through the rest of this chapter: the `this` value for a function is determined by *how* the function is invoked. That means you can't look at the function's definition, nor where the function is defined (not even the enclosing `class`!). In fact, it doesn't even matter where the function is called from.

We only need to look at *how* the functions are called; that's the only factor that matters.

### Implicit Context Invocation

Consider this call:

```js
point.init(3,4);
```

We're invoking the `init(..)` function, but notice the `point.` in front of it? This is an *implicit context* binding. It says to JS: invoke the `init(..)` function with `this` referencing `point`.

That is the *normal* way we'd expect a `this` to work, and that's also one of the most common ways we invoke functions. So the typical invocation gives us the intuitive outcome. That's a good thing!

### Default Context Invocation

But what happens if we do this?

```js
const init = point.init;
init(3,4);
```

You might assume that we'd get the same outcome as the previous snippet. But that's not how JS `this` assignment works.

The *call-site* for the function is `init(3,4)`, which is different than `point.init(3,4)`. When there's no *implicit context* (`point.`), nor any other kind of `this` assignment mechanism, the *default context* assignment occurs.

What will `this` reference when `init(3,4)` is invoked like that?

*It depends.*

Uh oh. Depends? That sounds confusing. Don't worry, it's not as bad as it sounds. The *default context* assignment depends on whether the code is in strict-mode or not. But thankfully, virtually all JS code these days is running in strict-mode. So most of the time, the *default assignment* context won't "depend" on anything.

In strict-mode, the *default context* is pretty straightforward: it's `undefined`. That's it!

| NOTE: |
| :--- |
| Keep in mind: `undefined` does not mean "not defined"; it means, "defined with the special empty `undefined` value". I know, I know... the name and meaning are mismatched. That's language legacy baggage, for you. (shrugging shoulders) |

That means `init(3,4)`, if run in strict-mode, would throw an exception. Why? Because the `this.x` reference in `init(..)` is a `.x` property access on `undefined` (i.e., `undefined.x`), which is not allowed:

```js
"use strict";

var point = { /* .. */ };

const init = point.init;
init(3,4);
// TypeError: Cannot set properties of
// undefined (setting 'x')
```

Stop for a moment and consider: why would JS choose to default the context to `undefined`, so that any *default context* invocation of a `this`-aware function will fail with such an exception?

Because a `this`-aware function **always needs a `this`**. The invocation `init(3,4)` isn't providing a `this`, so that *is* a mistake, and *should* raise an exception so the mistake can be corrected. The lesson: never invoke a `this`-aware function without providing it a `this`!

Just for completeness sake: in non-strict mode, the *default context* is the global object -- JS defines it as `globalThis`, which in browser JS is essentially an alias to `window`, and in Node it's `global`. So, when `init(3,4)` runs in non-strict mode, the `this.x` expression is `globalThis.x` -- also known as `window.x` in the browser, or `global.x` in Node. Thus, `globalThis.x` gets set as `3` and `globalThis.y` gets set as `4`.

```js
// no strict-mode here, beware!

var point = { /* .. */ };

const init = point.init;
init(3,4);

globalThis.x;   // 3
globalThis.y;   // 4
point.x;        // null
point.y;        // null
```

That's unfortunate, because it's almost certainly *not* the intended outcome. Not only is it bad if it's a global variable, but it's also *not* changing the property on our `point` object, so program bugs are guaranteed.

| WARNING: |
| :--- |
| Ouch! Nobody wants accidental global variables implicitly created from all over the code. The lesson: always make sure your code is running in strict-mode! |

### Explicit Context Invocation

Functions can alternately be invoked with *explicit context*, using the built-in `call(..)` or `apply(..)` utilities:

```js
var point = { /* .. */ };

const init = point.init;

init.call( point, 3, 4 );
// or: init.apply( point, [ 3, 4 ] )

point.x;        // 3
point.y;        // 4
```

`init.call(point,3,4)` is effectively the same as `point.init(3,4)`, in that both of them assign `point` as the `this` context for the `init(..)` invocation.

| NOTE: |
| :--- |
| Both `call(..)` and `apply(..)` utilities take as their first argument a `this` context value; that's almost always an object, but can technically can be any value (number, string, etc). The `call(..)` utility takes subsequent arguments and passes them through to the invoked function, whereas `apply(..)` expects its second argument to be an array of values to pass as arguments. |

It might seem awkward to contemplate invoking a function with the *explicit context* assignment (`call(..)` / `apply(..)`) style in your program. But it's more useful than might be obvious at first glance.

Let's recall the original snippet:

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) { /* .. */ },
    toString() {
        return `(${this.x},${this.y})`;
    },
};

point.init(3,4);

var anotherPoint = {};
point.init.call( anotherPoint, 5, 6 );

point.x;                // 3
point.y;                // 4
anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

Are you seeing what I did there?

I wanted to define `anotherPoint`, but I didn't want to repeat the definitions of those `init(..)` / `rotate(..)` / `toString()` functions from `point`. So I "borrowed" a function reference, `point.init`, and explicitly set the empty object `anotherPoint` as the `this` context, via `call(..)`.

When `init(..)` is running at that moment, `this` inside it will reference `anotherPoint`, and that's why the `x` / `y` properties (values `5` / `6`, respectively) get set there.

Any `this`-aware functions can be borrowed like this: `point.rotate.call(anotherPoint, ..)`, `point.toString.call(anotherPoint)`.

#### Revisiting Implicit Context Invocation

Another approach to share behavior between `point` and `anotherPoint` would have been:

```js
var point = { /* .. */ };

var anotherPoint = {
    init: point.init,
    rotate: point.rotate,
    toString: point.toString,
};

anotherPoint.init(5,6);

anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

This is another way of "borrowing" the functions, by adding shared references to the functions on any target object (e.g., `anotherPoint`). The call-site invocation `anotherPoint.init(5,6)` is the more natural/ergonomic style that relies on *implicit context* assignment.

It may seem this approach is a little cleaner, comparing `anotherPoint.init(5,6)` to `point.init.call(anotherPoint,5,6)`.

But the main downside is having to modify any target object with such shared function references, which can be verbose, manual, and error-prone. Sometimes such an approach is acceptable, but many other times, *explicit context* assignment with `call(..)` / `apply(..)` is more preferable.

### New Context Invocation

We've so far seen three different ways of context assignment at the function call-site: *default*, *implicit*, and *explicit*.

A fourth way to call a function, and assign the `this` for that invocation, is with the `new` keyword:

```js
var point = { /* .. */ };

var anotherPoint = new point.init(3,4);

anotherPoint.x;     // 3
anotherPoint.y;     // 4
```

You've typically seen `new` used with `class` for creating instances. But as an underlying mechanism of the JS language, `new` is not inherently a `class` operation.

In a sense, the `new` keyword hijacks a function and forces its behavior into a different mode than a normal invocation. Here are the 4 special steps that JS performs when a function is invoked with `new`:

1. create a brand new empty object, out of thin air.

2. link the `[[Prototype]]` of that new empty object to the function's `.prototype` object (see Chapter 2).

3. invoke the function with the `this` context set to that new empty object.

4. if the function doesn't return its own object value explicitly (with a `return ..` statement), assume the function call should instead return the new object (from steps 1-3).

| WARNING: |
| :--- |
| Step 4 implies that if you `new` invoke a function that *does* return its own object -- like `return { .. }`, etc -- then the new object from steps 1-3 is *not* returned. That's a tricky gotcha to be aware of, in that it effectively discards that new object before the program has a chance to receive and store a reference to it. Essentially, `new` should never be used to invoke a function that has explicit `return ..` statement(s) in it. |

To understand these 4 `new` steps more concretely, I'm going to illustrate them in code, as an alternate to using the `new` keyword:

```js
// alternative to:
//   var anotherPoint = new point.init(3,4)

var anotherPoint;
// this is a bare block to hide local
// `let` declarations
{
    // (Step 1)
    let tmpObj = {};

    // (Step 2)
    Object.setPrototypeOf(
        tmpObj, point.init.prototype
    );
    // or: tmpObj.__proto__ = point.init.prototype

    // (Step 3)
    let res = point.init.call(tmpObj,3,4);

    // (Step 4)
    anotherPoint = (
        typeof res !== "object" ? tmpObj : res
    );
}
```

Clearly, the `new` invocation streamlines that set of manual steps!

Skipping some of the formality of these steps, let's recall an earlier snippet and see how `new` approximates a similar outcome:

```js
var point = { /* .. */ };

// this approach:
var anotherPoint = {};
point.init.call(anotherPoint,5,6);

// can instead be approximated as:
var yetAnotherPoint = new point.init(5,6);
```

That's a bit nicer! But there's a caveat here.

Using the other functions that `point` holds against `anotherPoint` / `yetAnotherPoint`, we won't want to do with `new`. Why? Because `new` is creating a *new* object, but that's not what we want if we intend to invoke a function against an existing object.

Instead, we'll likely use *explicit context* assignment:

```js
point.rotate.call( anotherPoint, /*angleRadians=*/Math.PI );

point.toString.call( yetAnotherPoint );
// (5,6)
```

### Review This

We've seen four rules for `this` context assignment in function calls. Let's put them in order of precedence:

1. Is the function invoked with `new`, creating and setting a *new* `this`?

2. Is the function invoked with `call(..)` or `apply(..)`, *explicitly* setting `this`?

3. Is the function invoked with an object reference at the call-site (e.g., `point.init(..)`), *implicitly* setting `this`?

4. If none of the above... are we in non-strict mode? If so, *default* the `this` to the `globalThis`. If in strict-mode, *default* the `this` to `undefined`.

These rules, *in this order*, are how JS determines the `this` for a function invocation. If multiple rules match a call-site (e.g., `new point.init.call(..)`), the first rule from the list to match wins.

That's it, you're now master over the `this` keyword. Well, not quite. There's a bunch more nuance to cover. But you're well on your way!
