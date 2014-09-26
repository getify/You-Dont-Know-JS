# You Don't Know JS: Async & Performance
# Chapter 1: Asynchrony: Now & Later

One of the most important and yet often misunderstood parts of programming in a language like JavaScript is understanding how to express and manipulate program behavior spread out over a period of time.

This is not just about what happens from the beginning of a `for` loop to the end of a `for` loop, which of course takes *some time* (microseconds to milliseconds) to complete. It's about what happens when part of your program runs *now*, and another part of your program runs *later* -- there's a gap between *now* and *later* where your program isn't actively executing.

Practically all non-trivial programs ever written (especially in JS) have had in some way or another had to manage this gap, whether that be in waiting for user input, requesting data from a database or file system, sending data across the network and waiting for a response, or performing a repeated task at a fixed interval of time (like animation). In all these various ways, your program has to manage state across the gap in time. As they famously say in London (of the subway system): "mind the gap".

In fact, the relationships between the *now* and *later* parts of your program is at the heart of asynchronous programming.

Asynchronous programming has been around since the beginning of JS, for sure. But most JS developers have never really carefully considered exactly how and why it crops up in their programs, or explored various *other* ways to handle it. The *good enough* approach has always been the humble callback function. Many to this day will insist that callbacks are more than sufficient.

But as JS continues to grow in both scope and complexity, to meet the ever widening demands of a first-class programming language that runs in browsers and servers and every conceivable device in between, the pains by which we manage asynchrony are becoming increasingly crippling, and they cry out for approaches that are both more capable and more reason-able.

While this all may seem rather abstract right now, I assure you we're tackle it more completely and concretely as we go on through this book. We'll explore a variety of emerging techniques for async JavaScript programming over the next several chapters.

But before we can get there, we're going to have to understand much more deeply what asynchrony is and how it operates in JS.

## A Program In Chunks

You may write your JS program in one .js file, but your program is almost certainly comprised of several chunks, only one of which is going to execute *now*, and the rest of which will execute *later*. The most common unit of *chunk* is the `function`.

For example, consider this code:

```js
function now() {
	return 21;
}

function later() {
	a = a * 2;
	console.log( "Meaning of life:", a );
}

var answer = now();

setTimeout( later, 1000 ); // Meaning of life: 42
```

There are two chunks to this program: the stuff that will run *now*, and the stuff that will run *later*. It should be fairly obvious what those two chunks are, but let's be super explicit:

Now:
```js
function now() {
	return 21;
}

function later() { .. }

var answer = now();

setTimeout( later, 1000 );
```

Later:
```js
a = a * 2;
console.log( "Meaning of life:", a );
```

The *now* chunk runs right away, as soon as you execute your program. But `setTimeout(..)` also sets up an event (a timeout) to happen *later*, so the contents of the `later()` function will be executed at a later time (1000 milliseconds from now).

Any time you wrap a portion of code into a `function` and specify that it should be executed in response to some event (timer, mouse click, Ajax response, etc), you are creating a *later* chunk of your code, and thus introducing asynchrony to your program.

## Event Loop

Let's make a (perhaps shocking) claim: despite you clearly being able to write asynchronous JS code (like the timeout above), up until recently (ES6), JavaScript itself has actually never had any direct notion of asynchrony built into it.

**What!?** That seems like a crazy claim, right? In fact, it's quite true. The JS engine itself has never done anything more than execute a single chunk of your program at any given moment, when asked to.

"Asked to." By whom? That's the important part!

The JS engine doesn't run in isolation. It runs inside a *hosting environment*, which is for most developers the typical web browser. Over the last several years (but by no means exlusively), JS has expanded beyond the browser into other environments, such as servers, via things like node.js. In fact, JavaScript gets embedded into all kinds of devices these days, from robots to lightbulbs.

But the one common "thread" (that's a not-so-subtle asynchronous joke, btw) of all these environments is that they have a mechanism in them that handles executing multiple chunks of your program *over time*, at each moment invoking the JS engine, called the "event loop".

In other words, the JS engine has had no inate sense of *time*, but has instead been an on-demand execution environment for any arbitrary snippet of JS. It's the surrouding environment which has always *scheduled* "events" (JS code executions).

So, for example, when your JS program makes an Ajax request to fetch some data from a server, you set up the "response" code in a function (commonly called a "callback"), and the JS engine tells the hosting environment basically, "hey, I'm going to suspend execution for now, but whenever you finish with that network request, and you have some data, please *call-back* to this function."

The browser then is set up to listen for the response from the network, and when it has something to give you, it schedules the callback function to be executed by inserting it into the *event loop*.

So what is the *event loop*?

Let's conceptualize it first through some fake'ish code:

```js
// `eventLoop` is an array that acts as a queue (first-in, first-out)
var eventLoop = [ ];
var event;

// keep going "forever"
while (true) {
	// perform a "tick"
	if (eventLoop.length > 0) {
		// get the next event in the queue
		event = eventLoop.shift();

		// now, execute the next event
		try {
			event();
		}
		catch (err) {
			reportError(err);
		}
	}
}
```

This is of course vastly simplified pseduo-code to illustrate the concepts. But it should be enough to help get a better understanding.

As you can see, there's a continuously running loop represented by the `while` loop, and each iteration of this loop is called a "tick". For each tick, if an event is waiting on the queue, it's taken off and executed. These events are your function callbacks.

It's important to note that `setTimeout(..)` doesn't put your callback on the event loop queue. What it does is set up a timer that once that fires, will insert your callback into the event loop, such that some future tick will pick it up and execute it.

What if there's already 20 items in the event loop at that moment? Your callback waits. It gets in line behind the others -- there's not normally a path to pre-empting the queue and skipping ahead in line. So, it should be obvious how timers for example don't actually with much temporal accuracy. Basically, you're guaranteed (roughly speaking) that your callback won't fire *before* the time interval you specify, but it can happen at or after that totally dependent on the state of the event queue at the time.

So, in other words, your program is generally broken up into lots of small chunks, which happen one after the other in the event loop queue. And technically, other events not related directly to your program can be interspersed into the queue, as well.

## Parallel Threading

It's very common to conflate the terms "async" and "parallel", but they are actually quite different. Remember, async is about the gap between *now* and *later*. But parallel is about things being able to occur simultaneously.

The most common programming expression for parallel processing is threads. A thread is essentially a queue of operations, not totally dissimilar from the event loop queue we saw previously. But, there are some important differences.

Primarily, a thread handles much lower level tasks than you would traditionally think about as existing in the event loop queue.

For example:

```js
function later() {
	a = a * 2;
	console.log( "Meaning of life:", a );
}
```

While the contents of that function would be regarded as a single event loop queue entry, when thinking about the thread this code would run on, there's actually perhaps a dozen different low level operations. For example, `a = a * 2` requires first loading the current value of `a`, then putting `2` somewhere, then performing the multiplication, then taking the result and storing it back into `a`.

In a single-threaded environment, it really doesn't matter how low level the items in the thread queue are, because nothing can interrupt the thread. But if you have a parallel system, where two different threads were operating in the same program, you could very easily see problems.

Consider, for example:

```js
var a = 20;

function foo() {
	a = a + 1;
}

function bar() {
	a = a * 2;
}

// ajax(..) is some arbitrary Ajax function given by some library
ajax( "..url 1..", foo );
ajax( "..url 2..", bar );
```

At a high level, it's easy to see that if `foo()` runs before `bar()`, the result will be that `a` has `42`, but if `bar()` runs before `foo()` the result in `a` will be `41`.

With threaded programming, though, the problems are much more subtle. Consider these two lists of pseduo-code tasks as the threads that could respectively run `foo()` and `bar()`, and consider what happens if they are running at exactly the same time:

Thread 1:
```
foo():
  a. load value of `a` into X
  b. store 1 into Y
  c. add X and Y and store that into X
  d. store the value of X in `a`
```

Thread 2:
```
bar():
  a. load value of `a` into X
  b. store 2 into Y
  c. multiply X and Y and store that into X
  d. store the value of X in `a`
```

Now, let's say that the two threads are running truly in parallel. You can probably spot the problem, right? They use shared memory locations `X` and `Y` for their temporary steps.

What's the end result in `a` if things happen like this?

```
1a
2a
1b
2b
1c
1d
2c
2d
```

The result in `a` will be `484`. But what about this ordering?

```
1a
2a
2b
1b
2c
1c
1d
2d
```

The result will now be `40`.

So, this may have already been obvious to you, but threaded programming can be very dangerous, because if you don't take special steps to prevent this kind of interruption/interleaving from happening, you can get very surprising, non-deterministic behavior, and that usually leads to headaches for developers.

### Run-to-completion

Because JavaScript is single-threaded, you cannot suffer from that level of non-determinisim. The code inside of `foo()` (and `bar()`) is atomic, which means that once `foo()` starts running, the entirety of its code will finish before any of the code in `bar()` can run, or vice versa. This is what we call "run-to-completion" behavior.

In fact, the run-to-completion semantic is more obvious when `foo()` and `bar()` have more code in them, such as:

```js
var a = 1;
var b = 2;

function foo() {
	a++;
	b = b * a;
	a = b + 3;
}

function bar() {
	b--;
	a = 8 + b;
	b = a * 2;
}

// ajax(..) is some arbitrary Ajax function given by some library
ajax( "..url 1..", foo );
ajax( "..url 2..", bar );
```

Since `foo()` can't be interrupted by `bar()`, nor can `bar()` be interruptd by `foo()`, this program only has two possible outcomes depending only on which starts running first.

Asynchrony means that these three chunks are going to happen separated by gaps of time. Furthermore, chunk 1 will always happen first, but chunks 2 and 3 may happen in either-first order:

Chunk 1:
```js
var a = 1;
var b = 2;
```

Chunk 2 (`foo()`):
```js
a++;
b = b * a;
a = b + 3;
```

Chunk 3 (`bar()`):
```js
b--;
a = 8 + b;
b = a * 2;
```

So, there are two possible outcomes for this program, as illustrated here:

Outcome 1:
```js
var a = 1;
var b = 2;

// foo()
a++;
b = b * a;
a = b + 3;

// bar()
b--;
a = 8 + b;
b = a * 2;

a; // 11
b; // 22
```

Outcome 2:
```js
var a = 1;
var b = 2;

// bar()
b--;
a = 8 + b;
b = a * 2;

// foo()
a++;
b = b * a;
a = b + 3;

a; // 183
b; // 180
```

Two outcomes from the same code means we still have non-determinism! But it's at the function ordering level, rather than at the statement ordering level (or, in fact, the expression operation ordering level) as it is with threads.

If there was a function in JS which did not have the run-to-completion behavior, all such bets would be off, right? It turns out ES6 introduces just such a thing (see Chapter ? for Generators), but don't worry right now, we'll come back to that!

## Summary

A JavaScript program is always broken up into two or more chunks, where the first chunk runs *now* and the next chunk runs *later*, in response to an event. Even though the program is executed chunk-by-chunk, all of them share the same access to the program scope and state, so each modification to state is made on top of the previous state.

The *event loop* spins continuously, with each iteration ("tick") handling whatever the next waiting event on the queue is, if any.

At any given moment, only one event can be processed from the queue at a time. While an event is executing, it can cause one or more subsequent events to be scheduled (added onto the event queue).
