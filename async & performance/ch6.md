# You Don't Know JS: Async & Performance
# Chapter 6: Benchmarking & Tuning

If the first four chapters of this book were all about performance as a coding pattern (asynchrony and concurrency), and chapter 5 was about performance at the macro program architecture level, this chapter goes after the topic of performance in the small, at the single expression/statement level.

One of the most common areas of curiosity -- indeed, some developers can get quite obsessed about it -- is in analyzing and testing various options for how to write a line or chunk of code, and which one is faster.

We're going to look at some of these issues, but it's important to understand from the outset that this chapter is **not** about the obsession of micro-performance issues, like whether some given browser can run `++a` faster than `a++`. The more important goal of this chapter is to figure out what kinds of JS performance matter and which ones don't.

But even before we get there, we need to explore how to most accurately and reliably test JS performance, because there's tons of misconceptions and myths that have flooded our collective cult knowledge base. We've got to sift through all that junk to find some clarity.

## Benchmarking

OK, time to start disspelling some misconceptions. I'd wager the vast majority of JS devs, if asked to benchmark the speed (execution time) of a certain operation, would go about it something like this:

```js
var start = (new Date()).getTime();	// or `Date.now()`

// do some operation

var end = (new Date()).getTime();

console.log( "Duration:", (end - start) );
```

Raise your hand if that's roughly what came to your mind. Yep, I thought so. There's a lot wrong with this approach, but don't feel bad; we've all been there.

What did that measurement tell you, exactly? Understanding what it does and doesn't say about the execution time of the operation in question is key to learning how to appropriately benchmark performance in JavaScript.

## Microperformance

## Summary

