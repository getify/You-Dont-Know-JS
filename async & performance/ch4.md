# You Don't Know JS: Async & Performance
# Chapter 4: Generators

In Chapter 2, we identified two key drawbacks to expressing async flow control with callbacks:

1. Callback-based async doesn't fit how our brain plans out steps of a task.
2. Callbacks aren't trustable or composable because of *inversion of control*.

In Chapter 3, we detailed how promises uninvert the *inversion of control*, restoring trustability/composability.

Now we turn out attention to expressing async flow control in a sequential, synchronous(-looking) fashion. The "magic" to sync-looking async is ES6 **generators**.

## Breaking Run-to-completion

In Chapter 1, we explained an expectation that JS developers almost universally rely on in their code: once a function starts executing, it runs until it completes, and no other code can interrupt and run in between.
