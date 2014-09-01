# You Don't Know JS: Types & Grammar
# Chapter 5: Grammar

The last major topic we want to tackle is how JavaScript's language syntax works (aka its grammar). You may think you know how to write JS, but there's an awful lot of nuance to various parts of the language grammar that lead to confusion and misconception, so we want to dive into those parts and clear some things up.

**Note:** The term "grammar" may be a little less familiar to readers than the term "syntax". In many ways, they are similar terms, describing the *rules* for how the language works. There are nuanced differences, but they mostly don't matter for our discussion here. In rough terms, the grammar for JavaScript is a structured way to describe how the syntax (operators, keywords, etc) fits together into well-formed, valid programs. In other words, discussing syntax without grammar would leave out a lot of the important details, so our focus here in this chapter is more accurately described as *grammar*, even though the raw syntax of the language is what you developers directly interact with.

## Statements & Expressions

It's fairly common for developers to assume that the term "statement" and "expression" are roughly equivalent. But here we need to distinguish between the two, because there are some very important differences in our JS programs.

To draw the distinction, let's borrow from terminology you may be more familiar with: the English language.

A "sentence" is one complete formation of words that express a thought. It's comprised of one or more "phrases", each of which can be connected with punctuation marks or conjunction words ("and", "or", etc). A phrase can itself be made up of smaller phrases. Some phrases are incomplete and don't accomplish much of validity by themselves, while other phrases can stand on their own. These rules are collectively called the *grammar* for the English language.

And so it goes with JavaScript grammar. Statements are sentences, expressions are phrases, and operators are conjunctions/punctuation.

Every expression in JS can be evaluated down to a single, specific value result. For example:

```js
var a = 3 * 6;
var b = a;
b;
```

In this snippet, `3 * 6` is obviously an expression (which  evaluates to `18`). But `a` on the second line is also an expression, as is `b` on the third line. The `a` and `b` expressions both evaluate to the value stored in those variables at that moment, which also happens to be `18`.

Moreover, each of the three lines are statements containing those expressions. `var a = 3 * 6` and `var b = a` are called "declaration statements" because, obviously, they each declare a variable (and optionally, as here, assign a value to it).

The third line contains just the expression `b`, but it's also a statment all by itself (though not a terribly interesting one!). As such, this is generally referred to as an "expression statement".

### Statement Completion Values

It's a fairly little known fact that statements all have completion values (even if that value is just `undefined`).

How would you even go about seeing the completion value of a statement?

The most obvious answer that may occur to you is to type the statement into your browser's developer console, because when you execute it, the console by default reports the completion value of the most recent statement it executed.

Let's consider `var b = a`. What's the completion value of that statement?

It's `undefined`. Why? Because `var` statements are simply defined that way in the spec. Indeed, if you but `var a = 42;` into your console, it'll report back `undefined`.

**Note:** Technically, it's a little more complex than that. In the ES5 spec, section 12.2 "Variable Statement", the `VariableDeclaration` algorithm actually *does* return a value (a `string` containing the name of the variable declared -- weird, huh!?), but that value is basically swallowed up (except for use by the `for..in` loop) by the `VariableStatement` algorithm, which forces an empty (aka `undefined`) result value.

In fact, if you've done much code experimenting in your console (or in a JavaScript environment REPL -- read/evaluate/print/loop tool), you've probably seen `undefined` reported after many different statments, and perhaps never realized why or what that was. But, simply, the console is reporting the statement's completion value.

But, what the console prints out doesn't mean anything in terms of what we could exercise inside our program. How could we capture it inside a JS program?

That's a much more complicated task. Before we explain *how*, let's ask *why* would you want to do that?

To answer that, we need to consider other types of statments' completion values. For example, any regular `{ .. }` block has a completion value of the completion value of its last contained statement/expression.

Consider:

```js
if (true) {
	4 + 38;
}
```

If you typed that into your console/REPL, you'd probably see `42` reported, since `42` is the completion value of the `if` block, which took on the completion value of its last expression statement `4 + 38`.

In other words, the completion value of a block is like an *implicit return* of the last statement-value in the block.

**Note:** This is pretty conceptually familiar to languages like CoffeeScript, which have implicit `return` values from `function`s that are the same as the last statement-value in the function.

But, there's an obvious problem. This kind of code doesn't work:

```js
var a = if (true) {
	4 + 38;
};
```

In other words, we can't take the completion value of a statement and capture it into another value in any easy syntactic/grammatical way (at least not yet!).

So, what can we do?

// TODO: answer this question!

### Expression Side-Effects

Most expressions don't have side-effects. For example:

```js
var a = 2;
var b = a + 3;
```

The expression `a + 3` did not *itself* have a side-effect, like for instance changing `a`. It had a result, which is `5`, and that result was assigned to `b` in the statement `b = a + 3`.

The most common example of an expression with (possible) side-effects is the function call expression:

```js
function foo() {
	a = a + 1;
}

var a = 1;
foo();		// result: `undefined`, side effect: changed `a`
```

There are other side-effecting expressions, though. For example:

```js
var a = 42;
var b = a++;
```

The expression `a++` has two separate behaviors. *First*, it returns the current value of `a`, which is `42` (which then gets assigned to `b`). But *next*, it changes the value of `a` itself, incrementing it by one.

```js
var a = 42;
var b = a++;

a;	// 43
b;	// 42
```

Many developers would mistakingly believe that `b` has value `43` just like `a` does. But the confusion comes from not fully considering the *when* of the side-effects of the `++` operator.

The `++` operator (increment) and the `--` operator (decrement)  are both unary operators (see Chapter 4), which can be used in either a postfix (aka "after") position or prefix (aka "before") position.

```js
var a = 42;

a++;	// 42
a;		// 43

++a;	// 44
a;		// 44
```

When `++` is used in the prefix position as `++a`, it's side-effect (incrementing `a`) happens *before* the value is returned from the expression, rather than *after* as with `a++`.

**Note:** Is `++a++` is legal? If you try it, you'll get a `ReferenceError` error. Why? Because side-effecting operators **require a variable reference** to target their side-effects to. In the case of `++a++`, the `a++` part is evaluated first (because of operator precedence -- see below), which gives back the value of `a` before the increment. But then it tries to evaluate `++42`, which (if you try it) gives the same `ReferenceError` error, since `++` can't have a side-effect directly on a value like `42`.

It is sometimes mistakingly thought that you can encapsulate the *after* side-effect of `a++` by wrapping it in a `( )` pair, like:

```js
var a = 42;
var b = (a++);

a;	// 43
b;	// 42
```

Unfortunately, `( )` itself doesn't define a new wrapped expression that would be evaluated *after* the *after* side-effect of the `a++` expression, as we might have hoped. In fact, even if it did, `a++` returns `42` first, and unless you have another expression that re-evaluates `a` after the side-effect of `++`, you're not going to get `43` into that expression, so `b` will not be assigned `43`.

There's an option, though -- the `,` statement comma operator. This operator allows you to string together multiple standalone expressions into a single statement:

```js
var a = 42;
var b = ( a++, a );

a;	// 43
b;	// 43
```

As we suggested above, `a++, a` means that the second `a` expression gets evaluated *after* the *after* side-effects of the `a++` expression, which means it captures the `43` value.

**Note:** The `( .. )` around `a++, a` is required here. The reason is operator precedence, which we'll cover later in this chapter.

Another example of a side-effecting operator is `delete`. As we showed in Chapter 2, `delete` is used to remove a property from an `object` or a slot from an `array`. But it's usually just called as a standalone statement:

```js
var obj = {
	a: 42
};

obj.a;			// 42
delete obj.a;	// true
obj.a;			// undefined
```

The result value of the `delete` operator is `true` if the requested operation is valid/allowable, or `false` otherwise. But the side-effect of the operator is that it removes the property

**Note:** What do we mean by valid/allowable? Non-existent properties, or properties which exist but are non-configurable (see the "this & Object Prototypes" title, Chapter 3) will return `true` from the `delete` operator. `false` (or an error!) will be the result otherwise.

One last example of a side-effecting operator, which may at once be both obvious and not-obvious, is the `=` assignment operator.

Consider:

```js
var a;

a = 42;		// 42
a;			// 42
```

It may not seem like `=` in `a = 42` is a side-effecting operator for the expression. But if we examine the result value of the `a = 42` statement, it's the value that was just assigned (`42`), so the assignment of that same value into `a` is technically a side-effect.

**Note:** The same reasoning about side-effects goes for the the compound-assignment operators like `+=`, `-=`, etc. `a = b += 2` is processed first as `b += 2` (which is `b = b + 2`), and then that result is assigned to `a`.

This behavior that an assignment expression (or statement) results in the assigned value is primarily useful for chained assignments, such as:

```js
var a, b, c;

a = b = c = 42;
```

Here, `c = 42` is evaluated to `42` (with the side-effect of assigning `42` to `c`), then `b = 42` is evaluated to `42` (with the side effect of assigning `42` to `b`), and finally `a = 42` is evaluated (with the side-effect of assigning `42` to `a`).

**Note:** A common mistake developers make with chained assignments is like `var a = b = 42`. While this looks like the same thing, it's not. If that statement were to happen without there also being a separate `var b` (somewhere in the scope) to formally declare `b`, then `var a = b = 42` would not create the `b`. Depending on `strict` mode, that'd either be an error or creating an accidental global (see the "Scope & Closures" title in this series).

## Operator Precedence

As we covered in Chapter 4, JavaScript's version of `&&` and `||` are interesting in that they select and return one of their operands, rather than just resulting in `true` or `false`. That's easy to reason about if there are only two operands and one operator.

```js
var a = 42;
var b = "foo";

a && b;	// "foo"
a || b;	// 42
```

But what about when there's two operators involved, and three operands?

```js
var a = 42;
var b = "foo";
var c = [1,2,3];

a && b || c; // ???
a || b && c; // ???
```

To understand what those expressions result in, we're going to need to understand what rules govern how the operators are processed when there's more than one present in an expression.

These rules are called "operator precedence".

I bet many readers feel they have a decent grasp on operator precedence. But as with everything else we've covered in this book series, we're going to poke and prod at that understanding to see just how solid it really is, and hopefully learn a few new things along the way.

Let's start with a quick quiz (which we'll carry throughout the next several sections of this chapter) to *really* test your understanding:

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

So, the `&&` and `||` operators bind first, then the `? :` operator. But what about multiple operators of the same precedence? Do they always process left-to-right or right-to-left?

In general, operators are either left-associative or right-associative, referring to whether **grouping happens from the left or from the right**.

It's important to note that associativity is *not* the same thing as left-to-right or right-to-left processing.

But, why does it matter which side of the operator is evaluated first? Because expressions can have side effects, like for instance with function calls:

```js
var a = foo() && bar();
```

Here, `foo()` is evaluated first, and then possibly `bar()` depending on the result of the `foo()` expression. That definitely could result in different program behavior than if `bar()` was called before `foo()`.

But this behavior is *just* left-to-right processing, it has nothing to do with the associativity of `&&`. In that example, since there's only one `&&` and thus no relevant grouping here, associativity doesn't even come into play.

But with an expression like `a && b && c`, grouping *will* happen implicitly, meaning that either `a && b` or `b && c` will be evaluated first.

Technically, `a && b && c` will be handled as `(a && b) && c`, because `&&` is left-associative (so is `||`, by the way). However, the right-associative alternative `a && (b && c)` behaves observably the same way. For the same values, the same expressions are evaluated in the same order.

**Note:** If hypothetically `&&` was right-associative, it would be processed the same as if you manually used `( )` to create grouping like `a && (b && c)`. But that still **doesn't mean** that `c` would be processed before `b`. Right-associativity does **not** mean right-to-left evaluation, it means right-to-left **grouping**. Either way, regardless of the grouping/associativity, the strict ordering of evaluation will be `a`, then `b`, then `c` (aka left-to-right).

So it doesn't really matter that much that `&&` and `||` are left-associative, other than to be accurate in how we discuss their definitions.

But that's not always the case. Some operators would behave very differently depending on left-associativity versus right-associativity.

Consider the `? :` ("ternary" or "conditional") operator:

```js
a ? b : c ? d : e;
```

`? :` is right-associative, so which grouping represents how it will be processed?

* `a ? b : (c ? d : e)`
* `(a ? b : c) ? d : e`

The answer is `a ? b : (c ? d : e)`. Unlike with `&&` and `||` above, the right-associativity here actually matters, as `(a ? b : c) ? d : e` *will* behave differently for some (but not all!) combinations of values.

One such example:

```js
true ? false : true ? true : true;		// false

true ? false : (true ? true : true);	// false
(true ? false : true) ? true : true;	// true
```

Even more nuanced differences lurk with other value combinations, even if the end result is the same. Consider:

```js
true ? false : true ? true : false;		// false

true ? false : (true ? true : false);	// false
(true ? false : true) ? true : false;	// false
```

From that scenario, the same end result implies that the grouping is moot. However:

```js
var a = true, b = false, c = true, d = true, e = false;

a ? b : (c ? d : e); // false, evaluates only `a` and `b`
(a ? b : c) ? d : e; // false, evaluates `a`, `b` AND `e`
```

So, we've clearly proved that `? :` is right-associative, and that it actually matters with respect to how the operator behaves if chained with itself.
