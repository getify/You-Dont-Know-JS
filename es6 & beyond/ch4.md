# You Don't Know JS: ES6 & Beyond
# Chapter 4: Async Flow Control

如果你写过任何数量相当的JavaScript，这就不是什么秘密：异步编程是一种必须的技能。管理异步的主要机制曾经是函数回调。

然而，ES6增加了一种新特性来帮助你解决仅使用回调来管理异步的重大缺陷：*Promise*。另外，我们可以重温generator（前一章中提到的）来看看一种将两者组合的模式，它是JavaScript中异步流程控制编程向前迈出的重要一步。

## Promises

让我们辨明一些误解：Promise不是回调的替代品。Promise提供了一种可靠的中介机制 —— 也就是，在你的调用代码和将要执行任务的异步代码之间 —— 来管理回调。

另一种考虑Promise的方式是作为一种事件监听器，你可以在它上面注册监听一个通知你任务何时完成的事件。它是一个仅被触发一次的时间，但不管怎样可以被看作是一个事件。

Promise可以被链接在一起，它们可以是一系列顺序的、异步完成的步骤。与`all(..)`方法（用经典的术语将，叫“门”）和`race(..)`方法（用经典的术语将，叫“闩”）这样的高级抽象一起，promise链可以提供一种异步流程控制的机制。

还有另外一种概念化Promise的方式是，将它看作一个 *未来值*，一个与时间无关的值的容器。无论底层的值是否是最终值，这种容器都可以被同样地推理。观测一个Promise的解析会在这个值准备好的时候将它抽取出来。换言之，一个Promise被认为是一个同步函数返回值的异步版本。

一个Promise只可能拥有两种解析结果：完成或拒绝，并带有一个可选的信号值。如果一个Promise被完成，这个最终值成为一个完成值。如果它被拒绝，这个最终值称为理由（也就是“拒绝的理由”）。Promise只可能被解析（完成或拒绝）一次。任何其他的完成或拒绝的尝试都会被简单地忽略，一点一个Promise被解析，它就成为一个不可被改变的值（immutable）。

显然，有几种不同的方式可以来考虑一个Promise是什么。没有一个角度就它自身来说是完全充分的，但是每一个角度都提供了整体的一个方面。这其中的要点是，它们为仅使用回调的异步提供了一个重大的改进，也就是说它们提供了顺序、可预测性、以及可靠性。

### Making and Using Promises

要构建一个promise实例，可以使用`Promise(..)`构造器：

```js
var p = new Promise( function pr(resolve,reject){
	// ..
} );
```

`Promise(..)`构造器接收一个单独的函数（`pr(..)`），它被立即调用并以参数值的形式收到两个控制函数，通常被命名为`resolve(..)`和`reject(..)`。它们被这样使用：

* 如果你调用`reject(..)`，promise就会被拒绝，而且如果有任何值被传入`reject(..)`，它就会被设置为拒绝的理由。
* 如果你不使用参数值，或任何非promise值调用`resolve(..)`，promise就会被完成。
* 如果你调用`resolve(..)`并传入另一个promise，这个promise就会简单地采用 —— 要么立即要么最终地 —— 这个被传入的promise的状态（不是完成就是拒绝）。

这里是你通常如何使用一个promise来重构一个依赖于回调的函数调用。如果你始于使用一个`ajax(..)`工具，它期预期要调用一个错误优先风格的回调：

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

你可以将它转换为：

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
		// handle ajax error reason
	}
);
```

Promise拥有一个接收一个或两个回调函数的方法`then(..)`。第一个函数（如果存在的话）被看作是promise被成功地完成时要调用的处理器。第二个函数（如果存在的话）被看作是promise被明确拒绝时，或者任何错误/异常在解析的过程中被捕捉到时要调用的处理器。

如果这两个参数值之一被省略或者不是一个合法的函数 —— 通常你会用`null`来代替 —— 那么一个占位用的默认等价物就会被使用。默认的成功回调将传递它的完成值，而默认的错误回调将传播它的拒绝理由。

调用`then(null,handleRejection)`的缩写是`catch(handleRejection)`。

`then(..)`和`catch(..)`两者都自动地构建并返回另一个promise实例，它被链接在原本的promise上，接收原本的promise的解析结果 —— （实际被调用的）完成或拒绝处理器返回的任何值。考虑如下代码：

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

在这个代码段中，我们要么从`fulfilled(..)`返回一个立即值，要么从`rejected(..)`返回一个立即值，然后在下一个事件周期中这个立即值被第二个`then(..)`的`fulfilled(..)`接收。如果我们返回一个新的promise，那么这个新promise就会作为解析结果被纳入与采用：

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

要注意的是，在第一个`fulfilled(..)`中的一个exception将 *不会* 导致第一个`rejected(..)`被调用，因为这个处理仅会应答第一个原始的promise的解析。取代它的是，第二个`then(..)`调用所针对的第二个promise，将会收到这个拒绝。

在上面的代码段中，我们没有监听这个拒绝，这意味着它会为了未来的观察而被静静地保持下来。如果你永远不通过调用`then(..)`或`catch(..)`来观察它，那么它将会称为未处理的。有些浏览器的开发者控制台可能会探测到这些未处理的拒绝并报告它们，但是这不是有可靠保证的；你应当总是观察promise拒绝。

**注意：** 这只是Promise理论和行为的简要概览。要进行深入得多的探索，参见本系列的 *异步与性能* 的第三章。

### Thenables

Promise是`Promise(..)`构造器的纯粹实例。然而，还存在称为 *thenable* 的类promise对象，它通常可以与Promise机制协作。

任何带有`then(..)`函数的对象（或函数）都被认为是一个thenable。任何Promise机制可以接受与采用一个纯粹的promise的状态的地方，都可以处理一个thenable。

Thenable基本上是一个一般化的标签，标识着任何由除了`Promise(..)`构造器之外的其他系统创建的类promise值。从这个角度上讲，一个thenable没有一个纯粹的Promise那么可信。例如，考虑这个行为异常的thenable：

```js
var th = {
	then: function thener( fulfilled ) {
		// call `fulfilled(..)` once every 100ms forever
		setInterval( fulfilled, 100 );
	}
};
```

如果你收到这个thenable并使用`th.then(..)`将它链接，你可能会惊讶地发现你的完成处理器被反复地调用，而普通的Promise本应该仅仅被解析一次。

一般来说，如果你从某些其他系统收到一个声称是promise或thenable的东西，你不应当盲目地相信它。在下一节中，我们将会看到一个ES6 Promise的工具，它可以帮助解决信任的问题。

但是为了进一步理解这个问题的危险，让我们考虑一下，在 *任何* 一段代码中的 *任何* 对象，只要曾经被定义为拥有一个称为`then(..)`的方法就都潜在地会被误认为是一个thenable —— 当然，如果和Promise一起使用的话 —— 无论这个东西是否有意与Promise风格的异步编码有一丝关联。

在ES6之前，对于称为`then(..)`的方法从来没有任何特别的保留措施，正如你能想象的那样，在Promise出现在雷达屏幕上之前就至少有那么几种情况，它已经被选择为方法的名称了。最有可能用错thenable的情况就是使用`then(..)`的异步库不是严格兼容Promise的 —— 在市面上有好几种。

这份重担将由你来肩负：防止那些将被误认为一个thenable的值被直接用于Promise机制。

### `Promise` API

`Promise`API还为处理Promise提供了一些静态方法。

`Promise.resolve(..)`创建一个被解析为传入的值的promise。让我们将它的工作方式与更手动的方法比较一下：

```js
var p1 = Promise.resolve( 42 );

var p2 = new Promise( function pr(resolve){
	resolve( 42 );
} );
```

`p1`和`p2`将拥有完全相同的行为。使用一个promise进行解析也一样：

```js
var theP = ajax( .. );

var p1 = Promise.resolve( theP );

var p2 = new Promise( function pr(resolve){
	resolve( theP );
} );
```

**提示：** `Promise.resolve(..)`就是前一节提出的thenable信任问题的解决方案。任何你还不确定是一个可信的promise的值 —— 它甚至可能是一个立即值 —— 都可以通过传入`Promise.resolve(..)`来进行规范化。如果这个值已经是一个可识别的promise或thenable，它的状态/解析结果将简单地被采用，将错误行为与你隔绝开。如果相反它是一个立即值，那么它将会被“包装”进一个纯粹的promise，以此将它的行为规范化为异步的。

`Promise.reject(..)`创建一个立即被拒绝的promise，与它的`Promise(..)`构造器对等品一样：

```js
var p1 = Promise.reject( "Oops" );

var p2 = new Promise( function pr(resolve,reject){
	reject( "Oops" );
} );
```

虽然`resolve(..)`和`Promise.resolve(..)`可以接收一个promise并采用它的状态/解析结果，但是`reject(..)`和`Promise.reject(..)`不会区分它们收到什么样的值。所以，如果你使用一个promise或thenable进行拒绝，这个promise/thenable本身将会被设置为拒绝的理由，而不是它底层的值。

`Promise.all([ .. ])`接收一个或多个值（例如，立即值，promise，thenable）的数组。它返回一个promise，这个promise会在所有的值完成时完成，或者在这些值中第一个被拒绝的值出现时被立即拒绝。

使用这些值/promises：

```js
var p1 = Promise.resolve( 42 );
var p2 = new Promise( function pr(resolve){
	setTimeout( function(){
		resolve( 43 );
	}, 100 );
} );
var v3 = 44;
var p4 = new Promise( function pr(resolve,reject){
	setTimeout( function(){
		reject( "Oops" );
	}, 10 );
} );
```

让我们考虑一下使用这些值的组合，`Promise.all([ .. ])`如何工作：

```js
Promise.all( [p1,p2,v3] )
.then( function fulfilled(vals){
	console.log( vals );			// [42,43,44]
} );

Promise.all( [p1,p2,v3,p4] )
.then(
	function fulfilled(vals){
		// never gets here
	},
	function rejected(reason){
		console.log( reason );		// Oops
	}
);
```

`Promise.all([ .. ])`等待所有的值完成（或第一个拒绝），而`Promise.race([ .. ])`仅会等待第一个完成或拒绝。考虑如下代码：

```js
// NOTE: re-setup all test values to
// avoid timing issues misleading you!

Promise.race( [p2,p1,v3] )
.then( function fulfilled(val){
	console.log( val );				// 42
} );

Promise.race( [p2,p4] )
.then(
	function fulfilled(val){
		// never gets here
	},
	function rejected(reason){
		console.log( reason );		// Oops
	}
);
```

**警告：** 虽然 `Promise.all([])`将会立即完成（没有任何值），但是 `Promise.race([])`将会被永远挂起。这是一个奇怪的不一致，我建议你应当永远不要使用空数组调用这些方法。

## Generators + Promises

It *is* possible to express a series of promises in a chain to represent the async flow control of your program. Consider:

将一系列promise在一个链条中表达来代表你程序的异步流程控制是 *可能* 的。考虑如如下代码：

```js
step1()
.then(
	step2,
	step1Failed
)
.then(
	function step3(msg) {
		return Promise.all( [
			step3a( msg ),
			step3b( msg ),
			step3c( msg )
		] )
	}
)
.then(step4);
```

However, there's a much better option for expressing async flow control, and it will probably be much more preferable in terms of coding style than long promise chains. We can use what we learned in Chapter 3 about generators to express our async flow control.

但是，对于表达异步流程控制来说有更好的选项，而且在代码风格上可能比长长的promise链更理想。我们可以使用在第三章中学到的generator来表达我们的异步流程控制。

The important pattern to recognize: a generator can yield a promise, and that promise can then be wired to resume the generator with its fulfillment value.

要识别一个重要的模式：一个generator可以yield出一个promise，然后这个promise可以使用它的完成值来推进generator。

Consider the previous snippet's async flow control expressed with a generator:

考虑前一个代码段，使用generator来表达：

```js
function *main() {

	try {
		var ret = yield step1();
	}
	catch (err) {
		ret = yield step1Failed( err );
	}

	ret = yield step2( ret );

	// step 3
	ret = yield Promise.all( [
		step3a( ret ),
		step3b( ret ),
		step3c( ret )
	] );

	yield step4( ret );
}
```

On the surface, this snippet may seem more verbose than the promise chain equivalent in the earlier snippet. However, it offers a much more attractive -- and more importantly, a more understandable and reason-able -- synchronous-looking coding style (with `=` assignment of "return" values, etc.) That's especially true in that `try..catch` error handling can be used across those hidden async boundaries.

从表面上看，这个代码段要比前一个promise链等价物要更繁冗。但是它提供了更加吸引人的 —— 而且重要的是，更加容易理解和阅读 —— 看起来同步的代码风格（“return”值的`=`赋值操作，等等），对于`try..catch`错误处理可以跨越那些隐藏的异步边界使用来说就更是这样。

Why are we using Promises with the generator? It's certainly possible to do async generator coding without Promises.

为什么我们要与generator一起使用Promise？不用Promise进行异步generator编码当然是可能的。

Promises are a trustable system that uninverts the inversion of control of normal callbacks or thunks (see the *Async & Performance* title of this series). So, combining the trustability of Promises and the synchronicity of code in generators effectively addresses all the major deficiencies of callbacks. Also, utilities like `Promise.all([ .. ])` are a nice, clean way to express concurrency at a generator's single `yield` step.

Promise是一个可信的系统，它将普通的回调和thunk中发生的控制倒转（参见本系列的 *异步与性能*）反转回来。所以组合Promise的可信性与generator中代码的同步性有效地解决了回调的主要缺陷。另外，像`Promise.all([ .. ])`这样的工具是一个非常美好、干净的方式 —— 在一个generator的一个`yield`步骤中表达并发。

So how does this magic work? We're going to need a *runner* that can run our generator, receive a `yield`ed promise, and wire it up to resume the generator with either the fulfillment success value, or throw an error into the generator with the rejection reason.

那么这种魔法是如何工作的？我们需要一个可以运行我们generator的 *运行器（runner）*，接收一个被`yield`出来的promise并连接它，让它要么使用成功的完成推进generator，要么使用拒绝的理由向generator抛出异常。

Many async-capable utilities/libraries have such a "runner"; for example, `Q.spawn(..)` and my asynquence's `runner(..)` plug-in. But here's a stand-alone runner to illustrate how the process works:

许多具备异步能力的工具/库都有这样的“运行器”；例如，`Q.spawn(..)`和我的asynquence中的`runner(..)`插件。这里有一个独立的运行期来展示这种处理如何工作：

```js
function run(gen) {
	var args = [].slice.call( arguments, 1), it;

	it = gen.apply( this, args );

	return Promise.resolve()
		.then( function handleNext(value){
			var next = it.next( value );

			return (function handleResult(next){
				if (next.done) {
					return next.value;
				}
				else {
					return Promise.resolve( next.value )
						.then(
							handleNext,
							function handleErr(err) {
								return Promise.resolve(
									it.throw( err )
								)
								.then( handleResult );
							}
						);
				}
			})( next );
		} );
}
```

**Note:** For a more prolifically commented version of this utility, see the *Async & Performance* title of this series. Also, the run utilities provided with various async libraries are often more powerful/capable than what we've shown here. For example, asynquence's `runner(..)` can handle `yield`ed promises, sequences, thunks, and immediate (non-promise) values, giving you ultimate flexibility.

So now running `*main()` as listed in the earlier snippet is as easy as:

```js
run( main )
.then(
	function fulfilled(){
		// `*main()` completed successfully
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

Essentially, anywhere that you have more than two asynchronous steps of flow control logic in your program, you can *and should* use a promise-yielding generator driven by a run utility to express the flow control in a synchronous fashion. This will make for much easier to understand and maintain code.

This yield-a-promise-resume-the-generator pattern is going to be so common and so powerful, the next version of JavaScript after ES6 is almost certainly going to introduce a new function type that will do it automatically without needing the run utility. We'll cover `async function`s (as they're expected to be called) in Chapter 8.

## Review

As JavaScript continues to mature and grow in its widespread adoption, asynchronous programming is more and more of a central concern. Callbacks are not fully sufficient for these tasks, and totally fall down the more sophisticated the need.

Thankfully, ES6 adds Promises to address one of the major shortcomings of callbacks: lack of trust in predictable behavior. Promises represent the future completion value from a potentially async task, normalizing behavior across sync and async boundaries.

But it's the combination of Promises with generators that fully realizes the benefits of rearranging our async flow control code to de-emphasize and abstract away that ugly callback soup (aka "hell").

Right now, we can manage these interactions with the aide of various async libraries' runners, but JavaScript is eventually going to support this interaction pattern with dedicated syntax alone!
