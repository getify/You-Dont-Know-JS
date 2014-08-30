# You Don't Know JS: Types & Grammar
# Chapter 5: Grammar

The last major topic we want to tackle is how JavaScript's language syntax works (aka its grammar). You may think you know how to write JS, but there's an awful lot of nuance to various parts of the language grammar that lead to confusion and misconception, so we want to dive into those parts and clear some things up.

**Note:** The term "grammar" may be a little less familiar to readers than the term "syntax". In many ways, they are similar terms, describing the *rules* for how the language works. There are nuanced differences, but they mostly don't matter for our discussion here. In rough terms, the grammar for JavaScript is a structured way to describe how the syntax (operators, keywords, etc) fit together into well-formed, valid programs. In other words, discussing syntax without grammar would leave out a lot of the important details, so our focus here in this chapter is more accurately described as *grammar*, even though the raw syntax of the language is what you the developer actually interact with.

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

The result is `42`. But, that's not nearly as interesting as how we can figure out that answer without just plugging it into a JS program to let JavaScript sort it out.

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

Every language defines its own *operator precedence* list. It's dismaying, though, just how uncommon it is that JS developers have ever read JS's list. If you knew it well, the above examples wouldn't have tripped you up in the slightest, because you'd already know that `&&` is more precedent than `||`. But I bet a fair amount of you readers had to think about it a little bit.

**Note:** Unfortunately, the JS spec doesn't really have its operator precedence list in a convenient, single location. You have to parse through and understand all the grammar rules. So we'll try to lay it out here in a more convenient and usable fashion.

### Short-Circuited

In Chapter 4, we mentioned in a side-note the "short-circuiting" nature of operators like `&&` and `||`. Let's revisit that in more detail now.

For both `&&` and `||` operators, the right-hand operand will **not be evaluated** if the left-hand operand is sufficient to determine the outcome of the operation. Hence the name "short-circuited" (in that if possible, it will take an early shortcut out).

For example, with `a && b`, `b` is not evaluated if `a` is falsy, because the result of the `&&` operand is already certain, so there's no point in bothering to check `b`. Likewise, with `a || b`, if `a` is truthy, the result of the operand is already certain, so there's no reason to check `b`.

This short-circuiting can be very helpful, and is extremely commonly used:

```js
function doSomething(opts) {
	if (opts && opts.cool) {
		// ..
	}
}
```

The `opts` part of the `opts && opts.cool` test acts as sort of a guard, because if `opts` is unset (or is otherwise falsy), the expression `opts.cool` would throw an error, but the `opts` test failing plus the short-circuiting means that `opts.cool` won't even be evaluated, thus no error!

Similarly, you can use `||` short-circuiting:

```js
function doSomething(opts) {
	if (opts.cache || primeCache()) {
		// ..
	}
}
```

Here, we're checking for `opts.cache` first, and if it's present, we don't call the `primeCache()` function, thus avoiding potentially unnecessary work.

### Tighter Binding

But let's turn our attention back to the original quiz question, specifically the `? :` ternary operator parts. Does the `? :` operator have more or less precedence than the `&&` and `||` operators?

```js
a && b || c ? c || b ? a : c && b : a
```

Is that more like:

* `a && b || (c ? c || (b ? a : c) && b : a)`, or
* `(a && b || c) ? (c || b) ? a : (c && b) : a`

The answer is the second one. Why? Because `&&` is more precedent than `||`, and `||` is more precedent than `? :`.

So, the expression `(a && b || c)` is evaluated *first* before the `? :` it participates in. Another way this is commonly explained is that `&&` and `||` "bind more tightly" than `? :`. If the reverse was true, then `c ? c...` would bind more tightly, and it would behave (as the first choice) like `a && b || (c ? c..)`.

### Associativity

So, the `&&` and `||` operators bind first, then the `? :` operator. But what about multiple operators of the same precedence? Do they always go left-to-right or right-to-left?

Let's try this: does `a && b && c` behave more like `(a && b) && c` or `a && (b && c)`?

Simply, you could observe that `(true && false) && true` gives the same result as `true && (false && true)`, so it would seem like both are correct and the grouping doesn't matter.

But technically, the correct answer is `(a && b) && c`. The `&&` and `||` operators are *left associative* (or left-to-right associative), such that grouping happens from the left.

Why is this important?

With `a && b && c`, since it behaves as `(a && b) && c`, it will first evaluate `a`, then if truthy, evaluate `b`, and then only if both were truthy will `c` be consulted, otherwise `c` is ignored.

But what about the `? :` operator? How does something like this behave?

```js
a ? c : b ? a : c;
```

Is it one or the other or both?

* `a ? c : (b ? a : c)`
* `(a ? c : b) ? a : c`


