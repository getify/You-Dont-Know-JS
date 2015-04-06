# You Don't Know JS: ES6 & Beyond
# Chapter 4: Async Flow Control

It's no secret if you've written any significant amount of JavaScript that asynchronous programming is a required skill. The primary mechanism for managing asynchrony has been the function callback.

However, ES6 adds a new feature which helps address significant shortcomings in the callbacks-only approach to async: *Promises*. In addition, we can revisit generators (from the previous chapter) and see a pattern for combining the two that's a major step forward in async flow control programming in JavaScript.

**Note:** This chapter will only briefly overview Promises, as they are covered in-depth in the *Async & Performance* title of this series.

## Promises

Let's clear up some misconceptions: Promises are not about replacing callbacks. Promises provide a trustable intermediary -- that is, between your calling code and the async code that will perform the task -- to manage callbacks.

Another way of thinking about a promise is as an event listener, upon which you can register to listen for an event that lets you know when a task has completed. It's an event that will only ever fire once, but it can be thought of as an event nonetheless.

Promises can be chained together, which can sequence a series of asychronously-completing steps. Together with higher-level abstractions like the `all(..)` method -- in classic terms, a "gate" -- and the `race(..)` method -- in classic terms, a "latch" -- Promise chains provide an approximation of async flow control.

Yet another way of conceptualizing a Promise is that it's a *future value*, a time-independent container wrapped around a value. This container can be reasoned about identically whether the underlying value is final or not. Observing the resolution of a Promise extracts this value once available. In other words, a Promise is said to be the async version of a sync function's return value.

Clearly, there's several different ways to think about what a Promise is. No single perspective is fully sufficient, but rather each provides a separate aspect of the whole. The big takeaway is that they offer a significant improvement over callbacks-only async, namely that they provide order, predictability, and trustability.

### `Promise` API

// TODO

## Generators + Promises

## Review

