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

### This Is A Lot!

So why have I belabored *this* subject for more than a page now? You get it, right? You're ready to move on.

My point is, you the author of code, and all other readers of the code even years or decades in the future, need to be `this`-aware. That's the choice, the burden, you place on the reading of such code. And yes, that goes for the choice to use `class` (see Chapter 3), as most class methods will be `this`-aware out of necessity.

Be aware of *this* `this` choice in code you write. Do it intentionally, and do it in such a way as to produce more outcome benefit than burden. Make sure `this` usage in your code *carries its own weight*.

Let me put it *this* way: don't use `this`-aware code unless you really can justify it, and you've carefully weighed the costs. Just because you've seen a lot of code examples slinging around `this` in others' code, doesn't mean that `this` belongs in *this* code you're writing.

The `this` mechanism in JS, paired with `[[Prototype]]` delegation, is an extremely powerful pillar of the language. But as the cliche goes: "with great power comes great responsibility". Anecdotally, even though I really like and appreciate *this* pillar of JS, probably less than 5% of the JS code I ever write uses it. And when I do, it's with restraint. It's not my default, go-to JS capability.

## Can We Get On With This?

OK, enough of the lecture. You're ready to see `this` code, right?

// TODO
