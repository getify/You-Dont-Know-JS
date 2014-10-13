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

With that in mind, let's look at two different analogies for what a Promise *is*.

### Future Value

Imagine this scenario:

I walk up to the counter at a fast food restaurant, and place an order for a cheeseburger. I hand the cashier $1.47. By placing my order and paying for it, I've made a request for a *value* back (the cheeseburger). I've started a transaction.

But often, the chesseburger is not immediately available for me. The cashier hands me something in place of my cheeseburger: a receipt with an order number on it. This order number is an IOU ("I owe you") *promise* that ensures that eventually, I should receive my cheeseburger.

So I hold onto my receipt and order number. I know it represents my *future cheeseburger*, so I don't need to worry about it anymore -- aside from being hungry!

While I wait, I can do other things, like send a text message to a friend that says, "Hey, can you come join me for lunch? I'm going to eat a cheeseburger."

I am reasoning about my *future cheeseburger* already, even though I don't have it in my hands yet. My brain is able to do this because it's treating the order number as a placeholder for the cheeseburger. The placeholder essentially makes the value *time independent*. It's a **future value**.

Eventually, I hear, "Order 113!", and I gleefully walk back up to the counter with receipt in hand. I hand my receipt to the cashier, and I take my cheeseburger in return.

In other words, once my *future value* was ready, I exchanged my promise for the value for the value itself.

But there's another possible outcome. They call my order number, but when I go to retrieve my cheeseburger, the cashier regretfully informs me, "I'm sorry, but we appear to be all out of cheeseburgers." Setting aside the customer frustration of this scenario for a moment, we can see an important characteristic of *future values*: they can either be a success message, or a failure/error.

Every time I order a cheeseburger, I know that I'll either get a cheeseburger eventually, or I'll get the sad news of the cheeseburger shortage, and I'll have to figure out something else to eat for lunch.

**Note:** In code, things are not quite as simple, because methaphorically, the order number may never be called, in which case we're left indefinitely in an unresolved state. We'll come back to dealing with that case later.

#### Values *Now* & *Later*

This all might sound too mentally abstract to apply to your code. So, let's be more concrete.

However, before we can introduce how promises work in this fashion, we're going to derive in code we already understand -- callbacks! -- how to handle these *future values*.

When you write code to reason about a value, such as performing math on a `number`, whether you realize it or not, you've been assuming something very fundamental about that value, which is that it's a concrete *now* value already.

```js
var x, y = 2;

console.log( x + y ); // NaN  <-- because `x` isn't set (ready) yet
```

The `x + y` operation assumes both `x` and `y` are already set. In terms we'll expound on shortly, we assume the `x` and `y` values are already *resolved*.

It would be nonsense to expect that the `+` operator by itself would somehow be magically capable of detecting and waiting around until both `x` and `y` are resolved (aka ready), only then to do the operation. That would cause chaos in the program if different statements finished *now* and others finished *later*, right?

How could you possibly reason about the relationships between two statements if either one (or both) of them might not be finished yet. If statement 2 relies on statement 1 being finished, there's just two outcomes: either statement 1 finished right *now* and everything proceeds fine, or statement 1 didn't finish yet, and thus statement 2 is going to fail.

If this sort of thing sounds familiar from Chapter 1, good!

Let's go back to our `x + y` math operation. Imagine if there was a way to say, "Add `x` and `y`, but if either of them isn't ready yet, just wait until they are. Add them as soon as you can."

Your brain might have just jumped to callbacks. OK, so...

```js
function add(getX,getY,cb) {
	var x, y;
	getX( function(xVal){
		x = xVal;
		// both are ready?
		if (y != undefined) {
			cb( x + y );	// send along sum
		}
	} );
	getY( function(yVal){
		y = yVal;
		// both are ready?
		if (x != undefined) {
			cb( x + y );	// send along sum
		}
	} );
}

// `fetchX()` and `fetchY()` are sync or async
// functions
add( fetchX, fetchY, function(sum){
	console.log( sum ); // that was easy, huh?
} );
```

Take just a moment to let the beauty (or lack thereof) of that snippet sink in.

**Note:** Whistles patiently.

While the ugliness is undeniable, there's something very important to notice about this async pattern.

In that snippet, we treated `x` and `y` as future values, and we express an operation `add(..)` which (from the outside) does not care whether `x` or `y` or both are available right away or not. In otherwise, it normalizes the *now* and *later*, such that we can rely on a predictable outcome of the `add(..)` operation.

By using an `add(..)` that is temporally consistent -- behaving the same across *now* and *later* -- the async code is much easier to reason about.

To put it more plainly: to normalize both *now* and *later*, we make both of them *later*, such that all operations are async.

Of course, this rough callbacks-based approach leaves much to be desired. It's just a first tiny step toward realizing the benefits of reasoning about *future values* without worrying about the time aspect of when it's available or not.

#### Promise Value

We'll definitely explain a lot more details about promises later in the chapter -- so don't worry if some of this is confusing -- but let's just briefly glimpse at how we can express the above `x + y` example via `Promise`s:

```js
function add(xPromise,yPromise) {
	// `Promise.all(..)` takes an array of promises,
	// and returns a new promise that waits on them
	// all to finish
	return Promise.all( [xPromise, yPromise] )

	// when that promise is resolved, let's take the
	// received `X` and `Y` values and add them together.
	.then( function(values){
		// `values` is an array of the messages from the
		// previously resolved promises
		return values[0] + values[1];
	} );
}

// `fetchX()` and `fetchY()` return promises for
// their respective values, which may be ready
// *now* or *later*.
add( fetchX(), fetchY() )

// we get a promise back for the sum of those
// two numbers.
// now we chain-call `then(..)` to wait for the
// resolution of that returned promise.
.then( function(sum){
	console.log( sum ); // that was easier!
} );
```

There are two layers of promises in this snippet.

`fetchX()` and `fetchY()` are called directly, and the values they return (promises!) are passed into `add(..)`. The underlying values those promises represent may be ready *now* or *later*, but each promise normalizes the behavior to be the same regardless. We reason about `X` and `Y` values in a time independent way. They are *future values*.

The second layer is the promise that `add(..)` creates (via `Promise.all(..)`) and returns, which we wait on by calling `then(..)`. When the `add(..)` operation completes, our `sum` *future value* is ready and we can print it out. We hide inside of `add(..)` the logic for waiting on the `X` and `Y` *future values*.

**Note:** Inside `add(..)`, the `Promise.all(..)` call creates a promise (which is waiting on `promiseX` and `promiseY` to resolve). The chained call to `.then(..)` creates another promise, which the `return values[0] + values[1]` line immediately resolves (with the result of the addition). Thus, the `then(..)` call we chain off the end of the `add(..)` call -- at the end of the snippet -- is actually operating on that second promise returned, rather than the first one created by `Promise.all(..)`. Also, though we are not chaining off the end of that second `then(..)`, it too has created another promise, had we chosen to observe/use it. This promise chaining stuff will be explained in much greater detail later in this chapter.

Just like with cheeseburger orders, it's possible that the resolution of a promise is not fulfillment, but instead failure (aka rejection). Unlike a successfully filled promise, where the resolution value is always programmatic, rejection values can either be set directly by the program logic, or they can result automatically from a JS runtime error.

With promises, the `then(..)` call can actually take two functions, the first for success (as shown above), and the second for failure:

```js
add( fetchX(), fetchY() )
.then(
	function(sum) {
		console.log( sum );
	},
	function(err) {
		console.error( err ); // bummer!
	}
);
```

If something went wrong getting `X` or `Y`, or something somehow failed during the addition, the promise `add(..)` returns is rejected, and the second callback error handler passed to `then(..)` would receive the rejection value from the promise.

Because promises encapsulate the time-dependent state -- waiting on the resolution/rejection of the underlying value -- from the outside, the promise itself is time-independent, and thus promises can be composed (combined) in predictable ways regardless of the timing or outcome underneath.

Moreover, once a promise is resolved or rejected, it stays that way forever -- it becomes an *immutable value* at that point -- and can be *observed* as many times as necessary.

That's one of the most powerful and important concepts to understand about promises. With a fair amount of work, you could ad hoc create the same effects with nothing but ugly callback composition, but that's not really an effective strategy, especially since you have to do it over and over again.

Promises are an easily repeatable mechanism for encapsulating and composing *future values*.

### Completion Event

As we just saw, an individual promise behaves as a *future value*. But there's another way to think of the resolution of a promise: as a flow-control mechanism -- a temporal this-then-that -- for two or more steps in an asynchronous task.

Let's imagine calling a function `foo(..)` to perform some task. We don't know about any of its details, nor do we care. It may complete the task right away, or it may take awhile.

We just simply need to know when `foo(..)` finishes so that we can move on to our next task. In other words, we'd like a way to be notified of `foo(..)`'s completion so that we can *continue*.

In typical JavaScript fashion, if you need to listen for a notification, you'd likely think of that in terms of events. So we could reframe our need for notification as a need to listen for a *completion* (or *continuation*) event emitted by `foo(..)`.

**Note:** Whether you call it a "completion event" or a "continuation event" depends on your perspective. Is the focus more on what happens with `foo(..)`, or what happens *after* `foo(..)` finishes. Both perspectives are accurate and useful. The event notification tells us that `foo(..)` has *completed*, but also that it's OK to *continue* with the next step. Indeed, the callback you pass to be called for the event notification is itself what we've previously called a *continuation*. Since *completion event* is a bit more focused on the `foo()`, which more has our attention at present, we slightly favor *completion event* for the rest of this text.

With callbacks, the "notification" would be our callback invoked by the task (`foo(..)`). But with promises, we turn the relationship around, and expect that we can listen for an event from `foo(..)`, and when notified, proceed accordingly.

First, consider some pseudo-code:

```js
foo(x) {
	// start doing something that could take awhile
}

foo( 42 )

on (foo "completion") {
	// now we can do the next step!
}

on (foo "error") {
	// oops, something went wrong in `foo(..)`
}
```

We call `foo(..)` and then we set up two event listeners, one for `"completion"` and one for `"error"` -- the two possible *final* outcomes of the `foo(..)` call. In essence, `foo(..)` doesn't even appear to be aware that the calling code has subscribed to these events, which makes for a very nice *separation of concerns*.

Unfortunately, such code would require some "magic" of the JS environment that doesn't exist (and would likely be a bit impratical). Here's the more natural way we could express that in JS:

```js
function foo(x) {
	// start doing something that could take awhile

	// make a `listener` event notification
	// capability to return

	return listener;
}

var evt = foo( 42 );

evt.on( "completion", function(){
	// now we can do the next step!
} );

evt.on( "failure", function(err){
	// oops, something went wrong in `foo(..)`
} );
```

`foo(..)` expressly creates an event subscription capability to return back, and the calling code receives and registers the two event handlers against it.

The inversion from normal callback-oriented code should be obvious, and it's intentional. Instead of passing the callbacks to `foo(..)`, it returns an event capability we call `evt`, which receives the callbacks.

But if you recall from Chapter 2, callbacks themselves represent an *inversion of control*. So inverting the callback pattern is actually an *inversion of inversion*, or an *uninversion of control* -- restoring control back to the calling code where we wanted it to be in the first place.

One important benefit is that multiple separate parts of the code can be given the event listening capability, and they can all independently be notified of when `foo(..)` completes to perform subsequent steps after its completion.

```js
var evt = foo( 42 );

// let `bar(..)` listen to `foo(..)`'s completion
bar( evt );

// also, let `baz(..)` listen to `foo(..)`'s completion
baz( evt );
```

*Uninversion of control* enables a nicer *separation of concerns*, where `bar(..)` and `baz(..)` don't need to be involved in how `foo(..)` is called. Similarly, `foo(..)` doesn't need to know or care that `bar(..)` and `baz(..)` exist or are waiting to be notified when `foo(..)` completes.

Essentially, this `evt` object is a neutral third-party negotiation between the separate concerns.

#### Promise "Events"

As you may have guessed by now, the `evt` event listening capability is an analogy for a promise.

In a promise-based approach, the previous snippet would have `foo(..)` creating and returning a `Promise` instance, and that promise would then be passed to `bar(..)` and `baz(..)`.

**Note:** The promise resolution "events" we listen for aren't strictly events (though they certainly behave like events for these purposes), and they're not typically called `"completion"` or `"error"`. Instead, we use `then(..)` to register a `"then"` event. Or perhaps more precisely, `then(..)` registers `"fulfillment"` and/or `"rejection"` event(s), though we don't see those terms used explicitly in the code.

Consider:

```js
function foo(x) {
	// start doing something that could take awhile

	return new Promise( function(resolve,reject){
		// eventually, call `resolve(..)` or `reject(..)`
	} );
}

var p = foo( 42 );

bar( p );

baz( p );
```

You can probably guess what the internals of `bar(..)` and `baz(..)` might look like:

```js
function bar(fooPromise) {
	// listen for `foo(..)` to complete
	fooPromise.then(
		function(){
			// `foo(..)` has now finished, so
			// do `bar(..)`'s task
		},
		function(){
			// oops, something went wrong in `foo(..)`
		}
	);
}

// ditto for `baz(..)`
```

**Note:** Promise resolution doesn't necessarily need to involve sending along a message, as it did when we were examining promises as *future values*. It can just be a flow control signal, as above.

Another way to approach this is:

```js
function bar() {
	// `foo(..)` has definitely finished, so
	// do `bar(..)`'s task
}

function oopsBar() {
	// oops, something went wrong in `foo(..)`,
	// so `bar(..)` didn't run
}

// ditto for `baz()` and `oopsBaz()`

var p = foo( 42 );

p.then( bar, oopsBar );

p.then( baz, oopsBaz );
```

**Note:** If you've seen promise-based coding before, you might be tempted to believe that the last two lines of that code could be written as `p.then( .. ).then( .. )`, using chaining, rather than `p.then(..); p.then(..)`. That would have an entirely different behavior, so be careful! It won't be clear right now why the difference, but it's actually a different async pattern than we've seen thus far: splitting/forking. Don't worry! We'll come back to this point later in this chapter.

Instead of passing the `p` promise to `bar(..)` and `baz(..)`, we use the promise to control when `bar(..)` and `baz(..)` will get executed, if ever. The primary difference is in the error handling.

In the first snippet's approach, `bar(..)` is called regardless of whether `foo(..)` succeeds or fails, and it handles its own fallback logic if it's notified that `foo(..)` failed. The same is true for `baz(..)`, obviously.

In the second snippet, `bar(..)` only gets called if `foo(..)` succeeds, and otherwise `oopsBar(..)` gets called. Ditto for `baz(..)`.

Neither approach is *correct* per se. There will be cases where one is more preferable than the other.

In either case, the promise `p` that comes back from `foo(..)` is used to control, via "event notifications", what happens next.

Moreover, the fact that both snippets end up calling `then(..)` twice against the same promise `p` illustrates the point made earlier, which is that promises (once resolved) retain their same resolution (fulfillment or rejection) forever, and can subsequently be observed as many times as necessary.

Whenever `p` is resolved, the next step will always be the same, both *now* and *later*.

## Promise Trust

So, now we've seen two strong analogies that explain different aspects of what promises can do for our async code. But if we stop there, we've missed perhaps the single most important characteristic that the promise pattern establishes: trust.

Whereas the *future values* and *completion events* analogies play out explicitly in the code patterns we've explored, it won't be entirely obvious why/how promises are designed to solve all of the *inversion of control* trust issues we laid out in Chapter 2 "Trust Issues". But with a little digging, we can uncover some important guarantees that restore the confidence in async coding that Chapter 2 tore down!

Let's start by reviewing the trust issues with callbacks-only coding. When you pass a callback to a utility `foo(..)`, it might:

* call the callback too early
* call the callback too late (or never)
* call the callback too few or too many times
* fail to pass along any necessary environment/parameters
* swallow any errors/exceptions that may happen

The characteristics of promises are intentionally designed to provide useful, repeatable answers to all these concerns.

### Calling too early

Primarily, this is a concern of whether code can introduce Zalgo-like effects (see Chapter 2), where sometimes a task finishes synchronously and sometimes asynchronously, which can lead to race conditions.

Promises by definition cannot be susceptible to this concern, because even an immediately-fulfilled promise (like `new Promise(function(resolve){ resolve(42); })`) cannot be *observed* synchronously.

That is, when you call `then(..)` on a promise, even if that promise was already resolved, the callback you provide to `then(..)` will **always** be called asynchronously (on the next event loop tick).

No more need to insert your own `setTimeout(..,0)` hacks. Promises prevent Zalgo automatically.

### Calling too late

Similar to point the previous point, promise observation callbacks are automatically scheduled when either `resolve(..)` or `reject(..)` are called by the promise creation capability. Those `then(..)` callbacks will predictably be fired on the next event loop tick.

It's not possible for synchronous observation, so it's not possible for a synchronous chain of tasks to run in such a way to in effect "delay" another callback from happening as expected. That is, when a promise is resolved, all `then(..)` registered callbacks on it will be called, in order, immediately at the next event loop opportunity, and nothing that happens inside of one of those callbacks can affect/delay the calling of the other callbacks.

For example:

```js
p.then( function(){
	p.then( function(){
		console.log( "C" );
	} );
	console.log( "A" );
} );
p.then( function(){
	console.log( "B" );
} );
// A B C
```

Here, `"C"` cannot interrupt and precede `"B"`, by virtue of how promises are defined to operate.

-----
**It's important to note**, though, that there are lots of nuances of scheduling where the relative ordering between callbacks chained off two separate promises is not reliably predictable.

If two promises `p1` and `p2` are both already resolved, it should be true that `p1.then(..); p2.then(..)` would end up calling the callback(s) for `p1` before the ones for `p2`. But there are subtle cases where that might not be true, such as:

```js
var p3 = new Promise( function(resolve){
	resolve( "B" );
} );

var p1 = new Promise( function(resolve){
	resolve( p3 );
} );

p2 = new Promise( function(resolve){
	resolve( "A" );
} );

p1.then( function(v){
	console.log( v );
} );

p2.then( function(v){
	console.log( v );
} );

// A B  <-- not  B A  as you might expect
```

We'll cover this more later, but as you can see, `p1` is resolved not with an immediate value, but with another promise `p3` which is itself resolved with the value `"B"`. The specified behavior is to *unwrap* `p3` into `p1`, but asynchronously, so `p1`'s callback(s) aren't ready to be called on the same event loop tick as `p2`'s.

To avoid such nuanced nightmares, you should never rely on anything about the the ordering/scheduling of callbacks across promises. In fact, a good practice is not to code in such a way where the ordering of multiple callbacks matters at all. Avoid that if you can.
-----

### Never calling the callback

This is a very common concern. It's addressable in several ways with promises.

First, nothing (not even a JS error) can prevent a promise from notifying you of its resolution (if it's resolved). If you register both fulfillment and rejection callbacks for a promise, and the promise gets resolved, one of the two callbacks will always be called.

Of course, if your callbacks themselves have JS errors, you may not see the outcome you expect, but the callback will in fact have been called. We'll cover later how to be notified of an error in your callback, because even those don't get swallowed.

But what if the promise itself never gets resolved either way? Even that is a condition that promises provide an answer for, using a higher-level abstraction called a "race":

```js
// a utility for timing out a promise
function timeoutPromise(delay) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			reject( "Timeout!" );
		}, delay );
	} );
}

// setup a timeout for `foo()`
Promise.race( [
	foo(),					// attempt `foo()`
	timeoutPromise( 3000 )	// give it three seconds
] )
.then(
	function(){
		// `foo(..)` succeeded in time!
	},
	function(err){
		// either `foo()` failed, or it just
		// didn't finish in time, so inspect
		// `err` to know which
	}
);
```

There's more details to consider with this promise timeout pattern, but we'll come back to it later.

Importantly, we can ensure *a* signal as to the outcome of `foo()`, to prevent it from hanging our program indefinitely.

### Calling too few or too many times

By definition, one is the appropriate number of times for the callback to be called. The "too few" case would be zero calls, which is the same as the "never" case we just examined.

The "too many" case is easy to explain. Promises are defined so that they can only be resolved once. If for some reason the promise creation code tries to call `resolve(..)` or `reject(..)` multiple times, or tries to call both in either-first order, the promise will accept only the first resolution, and will silently ignore any subsequent attempts.

Since a promise can only be resolved once, any `then(..)` registered callbacks will only ever be called once (each).

Of course, if you register the same callback more than once, it'll be called as many times as you requested, though you probably wouldn't want to do that if it was possible to avoid.

### Failing to pass along any parameters/environment

Promises can have, at most, one resolution value (success or failure).

If you don't explicitly resolve with a value either way, the value is `undefined`, as is typical in JS. But whatever the value, it will always be passed to all registered (and appropriate -- fulfillment or rejection)callbacks, either *now* or in the future.

**Something to be aware of:** If you call `resolve(..)` or `reject(..)` with multiple parameters, all subsequent parameters beyond the first will be silently ignored. While that might seem a violation of the guarantee we just described, it's not exactly, because it constitutes an invalid usage of the Promise mechanism. Other invalid usages of the API (such as calling `resolve(..)` multiple times) are similarly *protected*, so the Promise behavior here is consistent (if not a tiny bit frustrating).

If you want to pass along multiple values, you must wrap them in another single value that you pass, such as an `array` or an `object`.

As for environment, functions in JS always retain their closure of the scope in which they're defined (see the *"Scope & Closures"* title of this series), so they of course would continue have access to whatever surrounding state you provide. Of course, the same is true of callbacks-only design, so this isn't a specific augmentation of benefit from promises -- but it's a guarantee we can rely on nonetheless.

### Swallowing any errors/exceptions

In the base sense, this is a restatement of the previous point. If you reject a promise with a *reason* (aka error message), that value is passed to the rejection callback(s).

But there's something much bigger at play here. If at any point in the creation of a promise, or in the observation of its resolution, a JS exception error occurs, such as a `TypeError` or `ReferenceError`, that exception will be caught, and it will force the promise in question to become rejected.

For example:

```js
var p = new Promise( function(resolve,reject){
	foo.bar();		// `foo` is not defined, so error!
	resolve( 42 );	// never gets here :(
} );

p.then(
	function(){
		// never gets here :(
	},
	function(err){
		// `err` will be a `TypeError` exception object
		// from the `foo.bar()` line.
	}
);
```

The JS exception that occurs from `foo.bar()` becomes a promise rejection that you can catch and respond to.

**This is an important detail**, because it effectively solves another potential Zalgo moment, which is that errors could create a synchronous reaction whereas non-errors would be asynchronous. Promises turn even JS exceptions into asynchronous behavior, thereby reducing the race condition chances greatly.

But what happens if a promise is fulfilled successfully, but there's a JS exception error during the observation (in a `then(..)` registered callback)? Even those aren't lost, but you may find how they're handled a bit surprising, until you dig in a little deeper.

```js
var p = new Promise( function(resolve,reject){
	resolve( 42 );
} );

p.then(
	function(msg){
		foo.bar();
		console.log( msg );	// never gets here :(
	},
	function(err){
		// never gets here either :(
	}
);
```

Wait, that makes it seem like the exception from `foo.bar()` really did get swallowed. Never fear, it didn't. But something deeper is wrong, which is that we've failed to listen for it. The `p.then(..)` call itself returns another promise, and it's *that* promise that will be rejected with the `TypeError` exception.

Why couldn't it just call the error handler we have defined there? Seems like a logical behavior on the surface. But it would violate the fundamental principle that promises are **immutable** once resolved. `p` was already resolved to the value `42`, so it can't later be changed to a rejection just because there's an error in observing `p`'s resolution.

Besides the principle violation, such behavior could wreak havoc, if say there were multiple `then(..)` registered callbacks on the promise `p`, because some would get called and others wouldn't, and it would be very opaque as to why.

### Trustable Promise?

There's one last detail to examine to establish trust based on the promise pattern.

You've no doubt noticed that promises don't get rid of callbacks at all. They just change where the callback is passed to. Instead of passing a callback to `foo(..)`, we get *something* (ostensibly a genuine promise) back from `foo(..)`, and we pass the callback to that *something* instead.

But why would this be any more trustable than just callbacks alone? How can we be sure the *something* we get back is in fact a trustable promise? Isn't it basically all just a house of cards where we can trust only because we already trusted?

One of the most important, but often overlooked, details of promises is that they have a solution to this issue as well. Included with the native ES6 `Promise` implementation is `Promise.resolve(..)`.

If you pass an immediate, non-promise-like value to `Promise.resolve(..)`, you get a promise that's fulfilled with that value. In other words, these two promises `p1` and `p2` will behave basically identically:

```js
var p1 = new Promise( function(resolve,reject){
	resolve( 42 );
} );

var p2 = Promise.resolve( 42 );
```

But, if you pass a promise-like value to `Promise.resolve(..)`, it will attempt to unwrap that value, and the unwrapping will keep going until a concrete final non-promise-like value is extracted.

What do we mean by "promise-like" and "non-promise-like"? To be honest, this is a fuzzy and somewhat weak point in the promises system.

In promise theory and standard terminology, any `object` (or `function`) that has a `then(..)` function on it is called a "thenable", which is another way of saying "promise-like" value. All promises are of course thenables, but not all thenables are genuine promises.

Consider:

```js
var p = {
	then: function(cb) {
		cb( 42 );
	}
};

// this works OK, but only by good fortune
p
.then(
	function(val){
		console.log( val ); // 42
	},
	function(err){
		// never gets here
	}
);
```

This `p` is a thenable, but it's not a genuine promise. Luckily, it's reasonable, as most will be. But what if you got back instead something that looked like:

```js
var p = {
	then: function(cb,errcb) {
		cb( 42 );
		errcb( "evil laugh" );
	}
};

p
.then(
	function(val){
		console.log( val ); // 42
	},
	function(err){
		// oops, shouldn't have run
		console.log( err ); // evil laugh
	}
);
```

This one is not so well-behaved of a promise. Is it malicious? Or is it just ignorant of how promises should work? It doesn't really matter, to be honest. In either case, it's not trustable as-is.

Nonetheless, we can pass either of these versions of `p` to `Promise.resolve(..)`, and we'll get the normalized, safe result we'd expect:

```js
Promise.resolve( p )
.then(
	function(val){
		console.log( val ); // 42
	},
	function(err){
		// never gets here
	}
);
```

`Promise.resolve(..)` will accept any standard promise or any promise-like thenable, and will unwrap it to its non-thenable value. But you get back from `Promise.resolve(..)` a real, genuine promise in its place, **one that you can trust**.

So, let's say we're calling a `foo(..)` utility and we're not sure we can trust its return value to be a well-behaving promise, but we know it's at least a thenable. `Promise.resolve(..)` will give us a trustable promise wrapper to chain off of:

```js
// don't just do this:
foo( 42 )
.then( function(v){
	console.log( v );
} );

// instead, do this:
Promise.resolve( foo( 42 ) )
.then( function(v){
	console.log( v );
} );
```

**Note:** Wrapping `Promise.resolve(..)` around any function's return value (thenable or not) is an easy way to normalize that function call into a well-behaving async promise resolution. If `foo(42)` returns an immediate value sometimes, or a promise other times, `Promise.resolve( foo(42) )` makes sure it's always a promise result. Avoiding Zalgo makes for much better code.

### Trust built

Hopefully the previous discussion now fully "resolves" (pun intended) in your mind why the promise is trustable, and more importantly, why that trust is so critical in building robust, maintainable software.

Can you async code in JS without trust? Of course you can. We developers have been coding async with nothing but callbacks for nearly two decades.

But once you start questioning just how much you can trust the mechanisms you build upon to actually be predictable and reliable, you start to realize it's a pretty shaky foundation when it comes to callbacks.

Promises are a pattern that augments callbacks with trustable semantics, so that the behavior is more reason-able and more reliable. By uninverting the *inversion of control* of callbacks, we place the control with a trustable system (promises) that was designed specifically to bring sanity to our async.

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
