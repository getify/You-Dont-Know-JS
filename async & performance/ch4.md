# You Don't Know JS: Async & Performance
# Chapter 4: Generators

In Chapter 2, we identified two key drawbacks to expressing async flow control with callbacks:

1. Callback-based async doesn't fit how our brain plans out steps of a task.
2. Callbacks aren't trustable or composable because of *inversion of control*.

In Chapter 3, we detailed how promises uninvert the *inversion of control*, restoring trustability/composability.

Now we turn out attention to expressing async flow control in a sequential, synchronous(-looking) fashion. The "magic" to sync-looking async is ES6 **generators**.

## Breaking Run-to-completion

In Chapter 1, we explained an expectation that JS developers almost universally rely on in their code: once a function starts executing, it runs until it completes, and no other code can interrupt and run in between.

As bizarre as it may seem, ES6 introduces a new type of function which does not behave with the run-to-completion behavior. This new type of function is called a "generator".

To understand the implications, let's consider an example where run-to-completion (or not) would affect the outcome of the program.

```js
var x = 1;

function foo() {
	x++;
	bar();				// <-- what about this line?
	console.log( "x:", x );
}

function bar() {
	x++;
}

foo();					// x: 3
```

In this example, we know for sure that `bar()` runs in between `x++` and `console.log(x)`. But what if `bar()` wasn't there? Obviously the result would be `2` instead of `3`.

Now let's twist your brain. What if `bar()` wasn't present, but it could still somehow run between `x++` and `console.log(x)`? How could that be possible?

In **preemptive** multi-threaded languages, it would essentially be possible for `bar()` to "interrupt" and run at exactly the right moment between those two statements. But JS is not preemptive, nor is it (currently) multi-threaded. And yet, a **cooperative** form of this "interruption" (concurrency) is possible, if `foo()` could somehow indicate a "pause" at that part in the code.

I use the word "cooperative" not only because of the connection to classical concurrency terminology, but because the ES6 syntax for indicating the pause point inside a generator is `yield`, and thus the generator has to *cooperate* by yielding control at the pause point to allow the concurrency.

Here's the ES6 code to accomplish that cooperative concurrency:

```js
var x = 1;

function *foo() {
	x++;
	yield; // pause!
	console.log( "x:", x );
}

function bar() {
	x++;
}

// construct an iterator `it` to control the generator
var it = foo();

it.next();
x;						// 2
bar();
x;						// 3
it.next();				// x: 3
```

OK, there's quite a bit of new and potentially confusing stuff in that example, so we've got a lot to wade through. But before we explain the different syntactic differences with ES6 generators, let's just make sure we understand the behavior flow:

1. The first `it.next()` starts the `*foo()` generator, and runs the `x++` on the first line of `*foo()`.
2. `*foo()` pauses at the `yield` statement, at which point that first `it.next()` call finishes. At the moment, `*foo()` is still running and active, but it's in a paused state.
3. We inspect the value of `x`, and it's now `2`.
4. We call `bar()`, which increments `x` again with `x++`.
5. We inspect the value of `x` again, and it's now `3`.
6. The final `it.next()` call resumes the `*foo()` generator from where it was paused, and runs the `console.log(..)` statement, which uses the current value of `x` of `3`.

## Summary

Generators are a new ES6 function type which does not run-to-completion like normal functions. Instead, the generator can be paused in mid-completion (entirely preserving its state), and it can be resumed from where it left off.

This pause/resume interchange is cooperative rather than preemptive, which means that the generator has the sole capability to pause itself, using the `yield` keyword, and yet the iterator that controls the generator has the sole capability (via `next(..)`) to resume the generator.

The `yield` / `next(..)` duality is not just a control mechanism, it's actually a two-way message passing mechanism. A `yield ..` expression essentially pausing waiting for a value, and the next `next(..)` call passes a value (or implicit `undefined`) back to that paused `yield` expression.

The key benefit of generators related to async flow control is that the code inside a generator expresses a sequence of steps for the task in a naturally sync/sequential fashion. The trick is that we essentially hide potential asynchrony behind the `yield` keyword -- moving the asynchrony to the code where the generator's iterator is controlled.

In other words, generators preserve a sequential, synchronous, blocking code pattern for async code, which lets our brains reason about the code much more naturally, addressing one of the two key drawbacks of callback-based async.
