# You Don't Know JS: Types & Grammar
# Chapter 5: Grammar

The last major topic we want to tackle is how JavaScript's language syntax works (aka its grammar). You may think you know how to write JS, but there's an awful lot of nuance to various parts of the language grammar that lead to confusion and misconception, so we want to dive into those parts and clear some things up.

## Operator Precedence

Quick quiz to test your understanding:

```js
var a = 42;
var b = "foo";
var c = false;

var d = a && b || c ? c || b ? a : c && b : a;

d;		// ??
```

OK, evil, I admit it. No one would write a string of expressions like that, right?

The answer is `42`. But, that's not nearly as interesting as how we can figure out that answer without just plugging it into a JS program to let JavaScript sort it out.

Let's dig in.

The first question (that may not have even occurred to you to ask) is, does `a && b || c` behave like `(a && b) || c` or like `a && (b || c)`? Do you know for certain? Can you even convince yourself they are actually different?

```js
(false && true) || true;	// true
false && (true || true);	// false
```

So, there's proof they're different. But still, how does `false && true || true` behave? The answer:

```js
false && true || true;		// true
(false && true) || true;	// true
```

So there we have our answer. The `&&` operator is evaluated first, and then the `||` operator is evaluated.

But is that just a side-effect of processing left-to-right? Let's reverse the order of operators:

```js
true || false && false;		// true

(true || false) && false;	// false -- nope
true || (false && false);	// true -- winner, winner!
```

So here, we proved that `&&` is evaluated first and then `||`, and not just because of left-to-right processing. So what caused the behavior? **Operator Precedence**.

Every language defines its own *operator precedence* list. It's dismaying, though, just how uncommon it is that JS developers have ever read JS's list. If you knew it, the above examples wouldn't have tripped you up in the slightest, because you'd already know that `&&` is more precedent than `||`. But I bet a fair amount of you readers had to think about it a little bit.






