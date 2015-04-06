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

A Promise can only have one of two possible resolution outcomes: fulfilled or rejected, with an optional single value. If a Promise is fulfilled, the final value is called a fulfillment. If it's rejected, the final value is called a reason (as in, a "reason for rejection").

Clearly, there's several different ways to think about what a Promise is. No single perspective is fully sufficient, but rather each provides a separate aspect of the whole. The big takeaway is that they offer a significant improvement over callbacks-only async, namely that they provide order, predictability, and trustability.

### Making And Using Promises

To construct a Promise instance, use the `Promise(..)` constructor:

```js
var p = new Promise( function(resolve,reject){
	// ..
} );
```

The two parameters provided to the `Promise(..)` constructor are functions, and are generally named `resolve(..)` and `reject(..)`, respectively. They are used as:

* If you call `reject(..)`, the promise is rejected, and if any value is passed to `reject(..)`, it is set as the reason for rejection.
* If you call `resolve(..)` with no value, or any non-Promise value, the promise is fulfilled.
* If you call `resolve(..)` and pass another promise, this promise simply adopts the state -- whether immediate or eventual -- of the passed promise (either fulfillment or rejection).

Here's how you'd typically use a Promise to refactor a callback-reliant function call. If you start out with an `ajax(..)` utility that expects to be able to call an error-first style callback:

```js
function ajax(url,cb) {
	// make request, eventually call `cb(..)`
}

// ..

ajax( "http://some.url.1", function handler(err,contents){
	if (err) {
		// handle ajax error
	}
	else {
		// handle `contents` success
	}
} );
```

You can convert it to:

```js
function ajax(url) {
	return new Promise( function pr(resolve,reject){
		// make request, eventually call
		// either `resolve(..)` or `reject(..)`
	} );
}

// ..

ajax( "http://some.url.1" )
.then(
	function fulfilled(contents){
		// handle `contents` success
	},
	function rejected(reason){
		// handle ajax error
	}
);
```

Promises have a `then(..)` method which accepts one or two callback functions. The first function (if present) is treated as the handler to call if the promise is fulfilled successfully. The second function (if present) is treated as the handler to call if the promise is rejected explicitly, or if any error/exception is caught during resolution.

If one of the arguments is omitted or otherwise not a valid function -- typically you'll use `null` instead -- a default placeholder equivalent is used. The default success callback passes its fulfillment value along and the default error callback propagates its rejection reason along.

There's a shorthand for calling `then(null,handleRejection)` which is `catch(handleRejection)`.

Both `then(..)` and `catch(..)` automatically construct and return another promise instance, which is wired to receive the resolution from whatever the return value is from the original promise's fulfillment or rejection handler (whichever is actually called). Consider:

```js
ajax( "http://some.url.1" )
.then(
	function fulfilled(contents){
		return contents.toUpperCase();
	},
	function rejected(reason){
		return "DEFAULT VALUE";
	}
)
.then( function fulfilled(data){
	// handle data from original promise's
	// handlers
} );
```

In this snippet, we're returning an immediate value from either `fulfilled(..)` or `rejected(..)`, which then is received on the next event turn in the second `then(..)`'s `fulfilled(..)`. If we instead return a new promise, that new promise is subsumed and adopted as the resolution:

```js
ajax( "http://some.url.1" )
.then(
	function fulfilled(contents){
		return ajax(
			"http://some.url.2?v=" + contents
		);
	},
	function rejected(reason){
		return ajax(
			"http://backup.url.3?err=" + reason
		);
	}
)
.then( function fulfilled(contents){
	// `contents` comes from the subsequent
	// `ajax(..)` call, whichever it was
} );
```

It's important to note that an exception (or rejected promise) in the first `fulfilled(..)` will *not* result in the first `rejected(..)` being called, as that handler only responds to the resolution of the first original promise. Instead, the second promise, which the second `then(..)` is called against, receives that rejection.

In this previous snippet, we are not listening for that rejection, which means it will be silently held onto for future observation. If you never observe it by calling a `then(..)` or `catch(..)`, then it will go unhandled. Some browser developer consoles may detect these unhandled rejections and report them, but this is not reliably guaranteed; you should always observe promise rejections.

### `Promise` API

// TODO

## Generators + Promises

## Review

