# You Don't Know JS: Async & Performance
# Chapter 3: Promises

In Chapter 2, we identified two major categories of deficiencies with using callbacks to express program asynchrony and manage concurrency. But now that we understand the problems more intimately, it's time we turn our attention to patterns that can address them.

The issue we want to address first is the *inversion of control*, the trust that is so fragilely held and so easily lost.

Recall that we wrap up the *continuation* of our program in a callback function, and hand that callback over to another party (potentially even external code) and just cross our fingers that it will do the right thing with the invocation of the callback.

We do this because we want to say, "here's what happens *later*, after the current step finishes."

But what if we could uninvert that *inversion of control*? What if instead of handing the continuation of our program to the the other party utility, we could expect that utility to return us the capability to know when the step finishes, and then our code would decide what to do next?

We can do just that, and it's called **Promises**.

## What is a Promise?

When developers decide to learn a new technology or pattern, usually their first step is, "Show me the code!" It's quite natural for us to just jump in feet first and learn as we go.

But it turns out that some abstractions get lost on the APIs alone. Promises are one of those tools where it can be painfully obvious from how someone uses it whether they understand what it's for and about versus just learning and using the API.

So, before I show the Promise code, I want to explain what really is a Promise, conceptually. I hope this will then guide you better as you explore integrating promise theory into your own async flow.

With that in mind, let's look at two different metaphors for what a Promise *is*.

### Future Value

A promise is a future value. // TODO

### Continuation Event

A promise is a continuation event. // TODO

## Promise Trust

Promises are trustworthy. // TODO

## Chain Flow

Promise chains for async flow control. // TODO

## Error Handling

Promise errors must be handled in an intentional way. // TODO

## Promise Patterns

Promises have lots of various patterns for solving async tasks. // TODO

## Summary

Promises are awesome. Use them. They solve all the *inversion of control* issues that plague us with callbacks-only code.

They don't get rid of callbacks, they just redirect the orchestration of those callbacks to a trustable intermediary mechanism that sits between us and the other party utility -- namely, the Promise mechanism.

Promise chains also begin to address (though certainly not perfectly) a better way of expressing async flow in sequential fashion, which helps our brains plan and maintain async JS code better.
