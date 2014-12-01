# You Don't Know JS: Async & Performance
# Chapter 5: Program Performance

This book so far has been all about how to leverage asynchrony patterns more effectively. But we sort of left a little unspoken/implicit why asynchrony really matters to JS. The most obvious explicit reason is **performance**.

For example, if you have two Ajax requests to make, and they're independent, but you need to wait on them both to finish before doing the next task, you have two options for modeling that interaction: serial and concurrent.

You could make the first request and wait to start the second request until the first finishes. Or, as we've seen both with promises and generators, you could make both requests "in parallel", and express the "gate" to wait on both of them before moving on.

Clearly, the latter is usually going to be more performant than the former. And better performance generally leads to better user experience.

It's even possible that asynchrony (interleaved concurrency) can improve just the perception of performance, even if the overall program still takes the same amount of time to complete. User perception of performance is every bit -- if not more! -- as important as actual measurable performance.

We want to now move beyond localized asynchrony patterns to talk about some bigger picture performance details at the program level.

**Note:** You may be wondering about micro-performance issues like if `a++` or `++a` is faster, etc. We'll look at those sorts of performance details in the next chapter on "Benchmarking & Tuning".

## Web Workers

If you have processing intensive tasks but you don't want them to run on the main thread which may slow down the browser/UI, you may wish that JavaScript had a concept of operating multithreaded.

In Chapter 1, we talked in detail about how JavaScript is single-threaded. And that's still true. But a single-thread isn't the only way to organize the execution of your program.

Imagine splitting your program into two pieces, and running one of those pieces on the main UI thread, and running the other piece on an entirely separate thread.

What kinds of concerns would such an architecture bring up?

For one, you'd want to know if running on a separate thread meant that it ran in parallel (on systems with multiple CPUs/cores) such that a long-running process on that second thread would **not** block the main program thread. Otherwise, "virtual threading" wouldn't be of much benefit over what we already have in JS with async concurrency.

And you'd want to know if these two pieces of the program have access to the same shared scope/resources. If they do, then you have all the questions that multithreaded languages (Java, C++, etc) deal with, such as needing cooperative or preemptive locking (mutexes, etc). That's a lot of extra work, and shouldn't be undertaken lightly.

Alternatively, you'd want to know how these two pieces could "communicate" if they couldn't share scope/resources.

All these are great questions to consider as we explore a feature added to the web platform circa HTML5 called "Web Workers". This is a feature of the browser (aka host environment) and actually has almost nothing to do with the JS language itself. That is, JavaScript does not currently have any features that support threaded execution.

But an environment like your browser can easily provide multiple instances of the JavaScript engine, each on its own thread, and let you run a different program in each thread. Each of those separate threaded pieces of your program is called a "(Web) Worker".

From your main JS program (or another Worker), you instantiate a Worker like so:

```js
var w1 = new Worker( "http://some.url.1/mycoolworker.js" );
```

The URL should point to the location of a JS file (not an HTML page!) which is intended to be loaded into a Worker. The browser will then spin up a separate thread and let that file run as an independent program in that thread.

**Note:** The kind of Worker created with such a URL is called a "Dedicated Worker". But instead of providing a URL to an external file, you can also create an "Inline Worker" by providing a Blob URL (another HTML5 feature); essentially it's an inline file stored in a single (binary) value. However, Blobs are beyond the scope of what we'll discuss here.

Workers do not share any scope or resources with each other or the main program -- that would bring all the nightmares of theaded programming to the forefront -- but instead have a basic event messaging mechanism connecting them.

The `w1` Worker object is an event listener and trigger, which lets you subscribe to events sent by the Worker as well as send events to the Worker.

Here's how to listen for events (actually, the fixed `"message"` event):

```js
w1.addEventListener( "message", function(evt){
	// evt.data
} );
```

And you can send events to the Worker:

```js
w1.postMessage( "something cool to say" );
```

Inside the Worker, the messaging is totally symmetrical:

```js
// "mycoolworker.js"

addEventListener( "message", function(evt){
	// evt.data
} );

postMessage( "a really cool reply" );
```

Notice that a dedicated Worker is in a one-to-one relationship with the program that created it. That is, the `"message"` event doesn't need any disambiguation here, because we're sure that it could only have come from this one-to-one relationship -- either it came from the Worker or the main page.

Usually the main page application creates the Workers, but a Worker can instantiate its own child Worker(s) -- known as sub workers -- as necessary. Sometimes this is useful to delegate such details to a sort of "master" Worker that spawns other Workers to process parts of a task. Unfortunately, at time of writing, Chrome still does not support sub workers, while Firefox does.

To kill a worker immediately from the program which created it, call `terminate()` on the worker object (like `w1` in the above snippets). Terminating a worker thread abruptly does not give it any chance to finish up its work or clean up any resources. It's akin to you closing a browser tab to kill a page.

If you have two or more pages (or tabs with the same page!) in the browser that try to create a Worker from the same file URL, those will actually end up as completely separate Workers. Shortly, we'll discuss a way to "share" a Worker.

**Note:** It may seem like a malicious or ignorant JS program could easily perform a denial-of-service attack on a system by spawning hundreds of Workers, seemingly each with their own thread. While it's true that it's somewhat of a guarantee that a Worker will end up on a separate thread, this guarantee is not unlimited. The system is free to decide how many actual threads/CPUs/cores it really wants to create. There's no way to predict or guarantee how many you'll have access to, though many people assume it's at least as many as the number of CPUs/cores available. I think the safest assumption is that there's at least one other thread besides the main UI thread, but that's about it.

### Worker Environment

Inside the Worker, you do not have access to any of the main program's resources. That means you cannot access any of its global variables, nor can you access the page's DOM, etc. Remember: it's a totally separate thread.

You can however perform network operations (Ajax, WebSockets) and set timers. Also, the Worker has access to its own copy of several important global variables/features, including `navigator`, `location`, `JSON`, and `applicationCache`.

You can also load extra JS scripts into your worker, using `importScripts(..)`:

```js
// inside the worker
importScripts( "foo.js", "bar.js" );
```

These scripts are loaded synchronously, which means the `importScripts(..)` call will block the rest of the Worker's execution until the file(s) are finished loading and executing.

**Note:** There have also been some discussions about exposing the `<canvas>` API to Workers, which combined with having canvases be Transferables (see "Data Transfer" below), would allow workers to perform more sophisticated off-thread graphics processing, which can be useful for high performance gaming (WebGL) and other similar applications. While this doesn't exist yet in any browsers, it's likely to happen in the near future.

What are some common use-cases for Web Workers?

* Processing intensive math calculations
* Sorting large data sets
* Data operations: compression, audio analysis, image pixel manipulations, etc
* High traffic network communications

### Data Transfer

You may notice a common characteristic of most of those use-cases, which is that it requires a large amount of information to be transferred across the barrier between threads using the event mechanism, perhaps in both directions.

In the early days of Workers, serializing all data to a string value was the only option. In addition to the speed penalty of the two-way serializations, the other major negative was that the data was being copied which meant a doubling of memory usage (and the subsequent churn of garbage collection).

Thankfully, we now have a few better options.

If you pass an object, a so-called "Structured Cloning Algorithm" (https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm) is used to copy/duplicate the object on the other side. This algorithm is fairly sophisticated and can even handle duplicating objects with circular references. The to-string/from-string performance penalty is not paid, but we still have duplication of memory using this approach. Support: IE10 and above, as well as all the other major browsers.

An even better option, especially for larger data sets, is "Transferable Objects" (http://updates.html5rocks.com/2011/12/Transferable-Objects-Lightning-Fast). What happens is that the object's "ownership" is transferred, but the data itself is not moved. Once you transfer away an object to a Worker, it's empty or inaccessible in the the originating location -- that eliminates the hazards of threaded programming over a shared scope. Of course, transfer of ownership can go in both directions.

You don't really have to do much special to opt-in to a Transferable Object; any data structure which implements the Transferable interface (https://developer.mozilla.org/en-US/docs/Web/API/Transferable) will automatically be transferred this way (support Firefox & Chrome).

For example, typed arrays like `Uint8Array` (see the *"ES6 & Beyond"* title of this series) are "Transferables". This is how you'd send a Transferable Object using `postMessage(..)`:

```js
// `foo` is a `Uint8Array` for instance

postMessage( foo.buffer, [ foo.buffer ] );
```

The first parameter is the raw buffer and the second parameter is a list of what to transfer.

Browsers which don't support Transferable Objects simply degrade to structured cloning, which means performance reduction rather than outright feature breakage.

### Shared Workers

If your site/app has the common use-case that someone may load multiple tabs of the same page, you may very well want to reduce the resource usage of your system by preventing duplicate dedicated workers; the most common limited resource in this respect is a socket network connection, as browsers limit the number of simulataneous connections to a single host.

In this case, creating a single centralized Worker that all the page instances of your site/app can *share* is quite useful.

That's called a `SharedWorker`, which you create like so (support: Firefox & Chrome):

```js
var w1 = new SharedWorker( "http://some.url.1/mycoolworker.js" );
```

Since a shared Worker can be connected to from more than one program instance or page on your site, the Worker needs a way to know which program a message comes from. This unique identification is called a "port" -- think network socket ports. So the calling program must use the `port` object of the Worker for communication:

```js
w1.port.addEventListener( "message", handleMessages );

// ..

w1.port.postMessage( "something cool" );
```

Also, the port connection must be initialized, as:

```js
w1.port.start();
```

Inside the shared Worker, an extra event must be handled: `"connect"`. This event provides the port `object` for that particular connection. The most convenient way to keep multiple connections separate is to use closure (see *"Scope & Closures"* title of this series) over the `port` as shown below, with the event listening and transmitting for that connection defined inside the handler for the `"connect"` event:

```js
// inside the shared Worker
addEventListener( "connect", function(evt){
	// the assigned port for this connection
	var port = evt.ports[0];

	port.addEventListener( "message", function(evt){
		// ..

		port.postMessage( .. );

		// ..
	} );

	// initialize the port connection
	port.start();
} );
```

Other than that difference, shared and dedicated Workers have the same capabilities and semantics.

**Note:** Shared Workers survive the termination of a port connection if other port connections are still alive, whereas dedicated Workers are terminated whenever the connection to their initiating program is terminated.

### Polyfilling Web Workers

Web Workers are very attractive performance-wise for running JS programs in parallel. However, you may be in a position where your code needs to run in older browsers which lack support. Since Workers are an API and not a syntax, they can be polyfilled, to an extent.

If a browser doesn't support Workers, there's simply no way to fake multi-threading from the performance perspective. Iframes are commonly thought of to provide a parallel environment, but in all modern browsers they actually run on the same thread as the main page, so they're not sufficient for faking parallelism.

As we detailed in Chapter 1, JS's asynchronicity (not parallelism) comes from the event loop queue, so you can force faked Workers to be asynchronous using timers (`setTimeout(..)`, etc). Then you just need to provide a polyfill for the Worker API. There are some listed here (https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#web-workers), but frankly none of them look great.

I've written a sketch of a polyfill for `Worker` here (https://gist.github.com/getify/1b26accb1a09aa53ad25). It's basic, but it should get the job done for simple `Worker` support, given that the 2-way messaging works correctly as well as `"onerror"` handling. You could probably also extend it with more features, such as `terminate()` or faked Shared Workers, as you see fit.

**Note:** Since you can't fake synchronous blocking, this polyfill just disallows use of `importScripts(..)`. Another option might have been to parse and transform the worker's code (once Ajax loaded) to handle rewriting to some asynchronous form of an `importScripts(..)` polyfill, perhaps with a promise-aware interface.

## Parallel JS

## SIMD

## asm.js

"asm.js" (http://asmjs.org/) is a highly optimizable subset of the JavaScript language. By carefully avoiding certain mechanisms and patterns and sticking to this subset, asm.js styled code can be recognized by the JS engine and given special attention in terms of performing aggressive low-level optimizations.

## Summary

