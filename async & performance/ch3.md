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

That's one of the most powerful and important concepts to understand about promises. With a fair amount of work, you could ad hoc create the same effects with nothing but ugly callback composition, but that's not really an effective strategy, especially since you have to do it over and over again.

Promises are an easily repeatable mechanism for encapsulating and composing *future values*.

### Continuation Event

As we just saw, an individual promise behaves as a *future value*. But there's another way to think of the resolution of a promise.

Let's imagine calling a function `foo(..)` to perform some task. We don't know about any of its details, nor do we care. It may complete the task right away, or it may take awhile.

What we do care about is that we just simply need to know when `foo(..)` finishes, whether that be *now* or *later*, so that we can move on to our next task. In other words, we'd like a way to simply be notified of `foo(..)`'s completion so that we can *continue*.

In general JavaScript programming terms, if you have the need to listen for a notification, you would probably think of that in terms of events. So we could restate our desire for notification as a desire to listen for a *completion* or *continuation* event emitted by `foo(..)`.

With callbacks, the "notification" is that our callback is called by the task (`foo(..)` in this example). But with promises, we turn the relationship around, and expect that `foo(..)` will instead provide us with an event listening capability, which we can choose (or not!) to subscribe to.

Consider:

```js
function foo(x) {
	// start doing something with `x`

	// make a `listener` event notification
	// value to pass back
	return listener;
}

var evt = foo( 42 );

evt.on( "completion", function(y){
	// now we can do the next step, with `y`!
} );
```

While we're at it, let's listen for an error event (the `foo(..)` task failing):

```js
evt.on( "failure", function(err){

} );
```

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
