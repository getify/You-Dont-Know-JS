# You Don't Know JS: Async & Performance
# Chapter 1: Asynchrony: Now & Later

One of the most important and yet often misunderstood parts of programming in a language like JavaScript is understanding how to express and manipulate program behavior spread out over a period of time.

This is not just about what happens from the beginning of a `for` loop to the end of a `for` loop, which of course takes *some time* (microseconds to milliseconds) to complete. It's about what happens when part of your program runs *now*, and another part of your program runs *later* -- there's a gap between *now* and *later* where your program isn't actively executing.

Practically all non-trivial programs ever written (especially in JS) have in some way or another had to manage this gap, whether that be in waiting for user input, requesting data from a database or file system, sending data across the network and waiting for a response, or performing a repeated task at a fixed interval of time (like animation). In all these various ways, your program has to manage state across the gap in time. As they famously say in London (of the subway system): "mind the gap".

In fact, the relationships between the *now* and *later* parts of your program is at the heart of asynchronous programming.

Asynchronous programming has been around since the beginning of JS, for sure. But most JS developers have never really carefully considered exactly how and why it crops up in their programs, or explored various *other* ways to handle it. The *good enough* approach has always been the humble callback function. Many to this day will insist that callbacks are more than sufficient.

But as JS continues to grow in both scope and complexity, to meet the ever widening demands of a first-class programming language that runs in browsers and servers and every conceivable device in between, the pains by which we manage asynchrony are becoming increasingly crippling, and they cry out for approaches that are both more capable and more reason-able.

While this all may seem rather abstract right now, I assure you we'll tackle it more completely and concretely as we go on through this book. We'll explore a variety of emerging techniques for async JavaScript programming over the next several chapters.

But before we can get there, we're going to have to understand much more deeply what asynchrony is and how it operates in JS.

## A Program In Chunks

You may write your JS program in one .js file, but your program is almost certainly comprised of several chunks, only one of which is going to execute *now*, and the rest of which will execute *later*. The most common unit of *chunk* is the `function`.

The problem most developers new to JS seem to have is that *later* doesn't happen strictly and immediately after *now*. In other words, tasks which cannot complete *now* are, by definition, going to complete asynchronously, and thus we will not have blocking behavior as you might intuitively expect or want.

Consider:

```js
// ajax(..) is some arbitrary Ajax function given by some library
var data = ajax( "..url 1.." );

console.log( data ); // Oops! `data` generally won't have the Ajax results
```

You're probably aware that standard Ajax requests don't complete synchronously, which means the `ajax(..)` function does not yet have any value to return back to be assigned to `data` variable. If `ajax(..)` *could* block until the response came back, then the `data = ..` assignment would work fine.

But that's not how we do Ajax. We make an asynchronous Ajax request *now*, and we won't get the results back until *later*.

The simplest (but definitely not only, or necessarily even best!) way of "waiting" from *now* until *later* is to use a function:

```js
// ajax(..) is some arbitrary Ajax function given by some library
ajax( "..url 1..", function(data){

	console.log( data ); // Yay, I gots me some `data`!

});
```

**Note:** You may have heard that it's possible to make synchronous Ajax requests. While that's technically true, you should never, ever do it, under any circumstances, because it locks the browser UI (buttons, menus, scrolling, etc) and prevents any user interaction whatsoever. This is a terrible idea, and should always be avoided. Before you disagree, **no, your desire to avoid callbacks is not justification for blocking, synchronous Ajax**.

For example, consider this code:

```js
function now() {
	return 21;
}

function later() {
	answer = answer * 2;
	console.log( "Meaning of life:", answer );
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
answer = answer * 2;
console.log( "Meaning of life:", answer );
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
	answer = answer * 2;
	console.log( "Meaning of life:", answer );
}
```

While the entire contents of `later()` would be regarded as a single event loop queue entry, when thinking about a thread this code would run on, there's actually perhaps a dozen different low level operations. For example, `answer = answer * 2` requires first loading the current value of `answer`, then putting `2` somewhere, then performing the multiplication, then taking the result and storing it back into `answer`.

In a single-threaded environment, it really doesn't matter how low level the items in the thread queue are, because nothing can interrupt the thread. But if you have a parallel system, where two different threads are operating in the same program, you could very easily see problems.

Consider:

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

With threaded programming, though, the problems are much more subtle. Consider these two lists of pseduo-code tasks as the threads that could respectively run the code in `foo()` and `bar()`, and consider what happens if they are running at exactly the same time:

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

What's the end result in `a` if the steps happen like this?

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

Because JavaScript is single-threaded, you cannot suffer from *that* level of non-determinisim. The code inside of `foo()` (and `bar()`) is atomic, which means that once `foo()` starts running, the entirety of its code will finish before any of the code in `bar()` can run, or vice versa. This is what we call "run-to-completion" behavior.

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

Asynchrony means that these three chunks are going to happen separated by gaps of time:

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

Chunk 1 will always happen first, but chunks 2 and 3 may happen in either-first order, so there are two possible outcomes for this program, as illustrated here:

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

Two outcomes from the same code means we still have non-determinism! But it's at the function (event) ordering level, rather than at the statement ordering level (or, in fact, the expression operation ordering level) as it is with threads. In other words, it's much *more deterministic* than threads would have been.

As applied to JavaScript's behavior, this function-ordering non-determinism is the common term "race condition", as `foo()` and `bar()` are racing against each other to see which runs first.

If there was a function in JS which did not have run-to-completion behavior, all such bets would be off, right? It turns out ES6 introduces just such a thing (see Chapter ? for Generators), but don't worry right now, we'll come back to that!

## Concurrency

Let's imagine a site that displays a list of status updates (like a social network news feed) that progressively loads as the user scrolls down the list. To make such a feature work correctly, (at least) two separate "processes" will need to be executing *simultaneously* (i.e., during the same window of time, but not necessarily at the same instant).

**Note:** We're using "process" in quotes here because they aren't true operating system level processes in the computer science sense. They are virtual processes, or tasks, that represent a logically connected, sequential series of operations. We'll simply prefer "process" over "task" since terminology-wise, it will match the definitions of the concepts we're exploring.

The first "process" will be responding to `onscroll` events as they fire when the user has scrolled the page further down. The second "process" will be making an Ajax request to fetch new data, and receiving the response back to render onto the page.

Obviously, if a user scrolls fast enough, you may see two or more `onscroll` events fired during the time it takes to get the first response back and processes, and thus you're going to have `onscroll` events and Ajax response events firing rapidly, interleaved with each other.

Concurrency is when two or more "processes" are executing simultaneously over the same period, regardless of whether their individual constituent operations happen *in parallel* (at the same instant on separate processors or cores) or not. You can think of concurrency then as "process"-level (or task-level) parallelism, as opposed to operation-level parallelism (separate-processor threads).

**Note:** Concurrency also introduces an optional notion of these "processes" interacting with each other. We will come back to that later.

For a given window of time (a few seconds worth of a user scrolling), let's visualize each independent "process" as a series of events/operations:

"Process" 1 (`onscroll` events):
```
onscroll, request 1
onscroll, request 2
onscroll, request 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
onscroll, request 7
```

"Process" 2 (Ajax response events):
```
response 1
response 2
response 3
response 4
response 5
response 6
response 7
```

It's quite possible that an `onscroll` event and an Ajax response event could be ready to be processed at exactly the same moment. For example let's visualize the above events in a timeline (each line is a subsequent "time slice"):

```
onscroll, request 1
onscroll, request 2          response 1
onscroll, request 3          response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6          response 4
onscroll, request 7
response 5
response 6
response 7
```

But, going back to our notion of the event loop from eariler in the chapter, JS is only going to be able to handle one event at a time, so either `onscroll, request 2` is going to happen first or `response 1` is going to happen first, but they cannot happen at literally the same moment. Just like kids in the school cafeteria, no matter what crowd they make outside the doors, they will have to merge into a single line to get their food!

So, let's visualize the interleaving of all these events onto the single event loop queue, such as:

Event Loop Queue:
```
onscroll, request 1   <--- Process 1 starts
onscroll, request 2
response 1            <--- Process 2 starts
onscroll, request 3
response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
response 4
onscroll, request 7   <--- Process 1 finishes
response 5
response 6
response 7            <--- Process 2 finishes
```

"Process 1" and "Process 2" run concurrently (task-level parallel), but their individual events run sequentially on the event loop queue.

Another way of looking at this is that the single-threaded event loop is one expression of concurrency (there are certainly others, which we'll come back to later!).

### Interaction

As two or more "processes" are interleaving their steps/events concurrently within the same program, they don't necessarily need to interact with each other if the tasks are unrelated.

But, often they will interact, indirectly through scope and/or the DOM. When such interaction is going to occur, you will need to orchestrate these interactions to prevent "race conditions" (see above).

For example:

```js
var res;

function foo(results) {
	if (!res) {
		res = {};
	}

	res.foo = results;
}

function bar(results) {
	if (!res) {
		res = {};
	}

	res.bar = results;
}

// ajax(..) is some arbitrary Ajax function given by some library
ajax( "..url 1..", foo );
ajax( "..url 2..", bar );
```

`foo()` and `bar()` are assuming the presence of a single variable `res` that's in scope to both of them. But it's indeterminate whether `foo()` or `bar()` will run first, so they both have to be careful to check for `res` and if it's not yet set, create the initial empty object to add their `results` data onto.

**Note:** While `res` in this example is a global variable, there's nothing about this scenario which requires it. As long as `res` is in a scope that's accessible to both `foo()` and `bar()`, they will have a closure over `res` (see the *"Scope & Closures"* title of this book series) and thus be able to access/modify it.

The same reasoning from this scenario would apply if `foo()` and `bar()` were interacting with each other through the shared DOM, like `foo()` updating the contents of a `<div>` and `bar()` updating the style or attributes of the `<div>` (e.g., to make it the DOM element visible once it has content).

### Cooperation

## Summary

A JavaScript program is (practically) always broken up into two or more chunks, where the first chunk runs *now* and the next chunk runs *later*, in response to an event. Even though the program is executed chunk-by-chunk, all of them share the same access to the program scope and state, so each modification to state is made on top of the previous state.

The *event loop* spins continuously, with each iteration ("tick") handling whatever the next waiting event on the queue is, if any.

At any given moment, only one event can be processed from the queue at a time. While an event is executing, it can cause one or more subsequent events to be scheduled (added onto the event queue).
