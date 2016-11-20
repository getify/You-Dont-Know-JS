# You Don't Know JS: ES6 & Beyond
# Chapter 8: Beyond ES6

在本书写作的时候，ES6（*ECMAScript 2015*）的最终草案即将为了ECMA的批准而进行最终的官方投票。但即便是在ES6已经被最终定稿的时候，TC39协会已经在为了ES7/2016和将来的特性进行努力的工作。

正如我们在第一章中讨论过的，预计JS进步的节奏将会从好几年升级一次加速到每年进行一次官方的版本升级（因此采用编年命名法）。这将会彻底改变JS开发者如何学习与跟上这门语言的脚步。

但更重要的是，这个协会实际上将会一个特性一个特性地进行工作。只要一种特性的规范被定义完成，而且通过在几种浏览器中的实验性实现打通了关节，那么这种特性就会被认为足够稳定并可以开始使用了。我们都被强烈鼓励一旦特性准备好就立即采用它，而不是等待什么官方标准投票。如果你还没学过ES6，现在上船的日子已经过了！

在本书写作时，一个未来特性提案的列表和它们的状态可以在这里看到(https://github.com/tc39/ecma262#current-proposals)。

在所有我们支持的浏览器实现这些新特性之前，转译器和填补是我们如何桥接它们的方法。Babel，Traceur，和其他几种主流转译器已经支持了一些最可能稳定下来的ES6之后的特性。

认识到这一点，是时候看一看它们中的一些了。让我们开始吧！

**警告：** 这些特性都处于开发的各种阶段。虽然它们很可能确定下来，而且将与本章的内容看起来相似，但还是要抱着更多质疑的态度看待本章的内容。这一章将会在本书未来的版本中随着这些（和其他的！）特性的确定而演化。

## `async function`s

我们在第四章的“Generators + Promises”中提到过，generator`yield`一个promise给一个类似运行器的工具，它会在promise完成时推进generator —— 有一个提案是要为这种模式提供直接的语法支持。让我们简要看一下这个被提出的特性，它称为`async function`。

回想一下第四章中的这个generator的例子：

```js
run( function *main() {
	var ret = yield step1();

	try {
		ret = yield step2( ret );
	}
	catch (err) {
		ret = yield step2Failed( err );
	}

	ret = yield Promise.all([
		step3a( ret ),
		step3b( ret ),
		step3c( ret )
	]);

	yield step4( ret );
} )
.then(
	function fulfilled(){
		// `*main()` completed successfully
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

被提案的`async function`语法可以无需`run(..)`工具就表达相同的流程控制逻辑，因为JS将会自动地知道如何寻找promise来等待和推进。考虑如下代码：

```js
async function main() {
	var ret = await step1();

	try {
		ret = await step2( ret );
	}
	catch (err) {
		ret = await step2Failed( err );
	}

	ret = await Promise.all( [
		step3a( ret ),
		step3b( ret ),
		step3c( ret )
	] );

	await step4( ret );
}

main()
.then(
	function fulfilled(){
		// `main()` completed successfully
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

取代`function *main() { ..`声明的，是我们使用`async function main() { ..`形式声明。而取代`yield`一个promise的，是我们`await`promise。运行`main()`函数的调用实际上返回一个我们可以直接监听的promise。这与我们从一个`run(main)`调用中拿回一个promise是等价的。

你看到对称性了吗？`async function`实质上是 generators + promises + `run(..)`模式的语法糖；它在底层的操作是相同的！

如果你是一个C#开发者而且这种`async`/`await`看起来很熟悉，那是因为这种特性就是由C#的特性直接启发的。很高兴看到语言

Babel、Traceur 以及其他转译器已经对当前的`async function`状态有了早期支持，所以你已经可以使用它们了。但是，在下一节的“警告”中，我们将看到为什么你也学还不应该上这艘船。

**注意：** 还有一个`async function*`的提案，它应当被称为“异步generator”。你可以在同一段代码中使用`yield`和`await`两者，甚至是在同一个语句中组合这两个操作：`x = await yield y`。“异步generator”提案看起来更具变化 —— 也就是说，它返回一个没有还没有完全被计算好的值。一些人觉得它应当是一个 *可监听对象（observable）*，有些像是一个迭代器和promise的组合。就目前来说，我们不会进一步探讨这个话题，但是会继续关注它的演变。

### Caveats

关于`async function`的一个未解的争论点是，因为它仅返回一个promise，所以没有办法从外部 *撤销* 一个当前正在运行的`async function`实例。如果这个异步操作是资源密集型的，而且你想在自己能确定不需要它的结果时立即释放资源，这可能是一个问题。

举例来说：

```js
async function request(url) {
	var resp = await (
		new Promise( function(resolve,reject){
			var xhr = new XMLHttpRequest();
			xhr.open( "GET", url );
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						resolve( xhr );
					}
					else {
						reject( xhr.statusText );
					}
				}
			};
			xhr.send();
		} )
	);

	return resp.responseText;
}

var pr = request( "http://some.url.1" );

pr.then(
	function fulfilled(responseText){
		// ajax success
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

我构想的`request(..)`有点儿像最近被提案要包含进web平台的`fetch(..)`工具。我们关心的是，例如，如果你想要用`pr`值以某种方法指示撤销一个长时间运行的Ajax请求会怎么样？

Promise是不可撤销的（在本书写作时）。在我和其他许多人看来，它们就不应该是可以被撤销的（参见本系列的 *异步与性能*）。而且即使一个proimse确实拥有一个`cancel()`方法，那么一定意味着调用`pr.cancel()`应当真的沿着promise链一路传播一个撤销信号到`async function`吗？

对于这个争论的几种可能的解决方案已经浮出水面：

* `async function`将根本不能被撤销（现状）
* 一个“撤销存根”可以在调用时传递给一个异步函数
* 返回值改变为一个新增的可撤销promsie类型
* 返回值改变为非promise的其他东西（比如，可监听对象，或带有promise和撤销能力的控制存根）

在本书写作时，`async function`返回普通的promise，所以改变整个返回值不太可能。但是现在下定论还是为时过早了。让我们持续关注这个讨论吧。

## `Object.observe(..)`

前端web开发的圣杯之一就是数据绑定 —— 监听一个数据对象的更新并同步这个数据的DOM表现形式。大多数JS框架都为这些类型的操作提供某种机制。

在ES6后期，我们似乎很有可能看到这门语言通过一个称为`Object.observe(..)`的工具，对此提供直接的支持。实质上，它的思想是你可以建立监听器来监听一个对象的变化，并在一个变化发生的任何时候调用一个回调。例如，你可相应地更新DOM。

你可以监听六中类型的变化：

* add
* update
* delete
* reconfigure
* setPrototype
* preventExtensions

默认情况下，你将会受到所有这些类型的变化的通知，但是你可以将它们过滤为你关心的那一些。

考虑如下代码：

```js
var obj = { a: 1, b: 2 };

Object.observe(
	obj,
	function(changes){
		for (var change of changes) {
			console.log( change );
		}
	},
	[ "add", "update", "delete" ]
);

obj.c = 3;
// { name: "c", object: obj, type: "add" }

obj.a = 42;
// { name: "a", object: obj, type: "update", oldValue: 1 }

delete obj.b;
// { name: "b", object: obj, type: "delete", oldValue: 2 }
```

除了主要的`"add"`、`"update"`、和`"delete"`变化类型：

* `"reconfigure"`变化事件在对象的一个属性通过`Object.defineProperty(..)`而重新配置时触发，比如改变它的`writable`属性。更多信息参见本系列的 *this与对象原型*。
* `"preventExtensions"`变化事件在对象通过`Object.preventExtensions(..)`被设置为不可扩展时触发。

	 因为`Object.seal(..)`和`Object.freeze(..)`两者都暗示着`Object.preventExtensions(..)`，所以它们也将触发相应的变化事件。另外，`"reconfigure"`变化事件也会为对象上的每个属性被触发。
* `"setPrototype"`变化事件在一个对象的`[[Prototype]]`被改变是触发，不论是使用`__proto__`setter，还是使用`Object.setPrototypeOf(..)`设置它。


注意，这些变化事件在会在改变发生后立即触发。不要将它们与代理（见第七章）搞混，代理是可以在动作发生之前拦截它们的。对象监听让你在变化（或一组变化）发生之后进行应答。

### Custom Change Events

除了六中内建的变化事件类型，你还可以监听并触发自定义变化事件。

考虑如下代码：

```js
function observer(changes){
	for (var change of changes) {
		if (change.type == "recalc") {
			change.object.c =
				change.object.oldValue +
				change.object.a +
				change.object.b;
		}
	}
}

function changeObj(a,b) {
	var notifier = Object.getNotifier( obj );

	obj.a = a * 2;
	obj.b = b * 3;

	// queue up change events into a set
	notifier.notify( {
		type: "recalc",
		name: "c",
		oldValue: obj.c
	} );
}

var obj = { a: 1, b: 2, c: 3 };

Object.observe(
	obj,
	observer,
	["recalc"]
);

changeObj( 3, 11 );

obj.a;			// 12
obj.b;			// 30
obj.c;			// 3
```

The change set (`"recalc"` custom event) has been queued for delivery to the observer, but not delivered yet, which is why `obj.c` is still `3`.

The changes are by default delivered at the end of the current event loop (see the *Async & Performance* title of this series). If you want to deliver them immediately, use `Object.deliverChangeRecords(observer)`. Once the change events are delivered, you can observe `obj.c` updated as expected:

```js
obj.c;			// 42
```

In the previous example, we called `notifier.notify(..)` with the complete change event record. An alternative form for queuing change records is to use `performChange(..)`, which separates specifying the type of the event from the rest of event record's properties (via a function callback). Consider:

```js
notifier.performChange( "recalc", function(){
	return {
		name: "c",
		// `this` is the object under observation
		oldValue: this.c
	};
} );
```

In certain circumstances, this separation of concerns may map more cleanly to your usage pattern.

### Ending Observation

Just like with normal event listeners, you may wish to stop observing an object's change events. For that, you use `Object.unobserve(..)`.

For example:

```js
var obj = { a: 1, b: 2 };

Object.observe( obj, function observer(changes) {
	for (var change of changes) {
		if (change.type == "setPrototype") {
			Object.unobserve(
				change.object, observer
			);
			break;
		}
	}
} );
```

In this trivial example, we listen for change events until we see the `"setPrototype"` event come through, at which time we stop observing any more change events.

## Exponentiation Operator

An operator has been proposed for JavaScript to perform exponentiation in the same way that `Math.pow(..)` does. Consider:

```js
var a = 2;

a ** 4;			// Math.pow( a, 4 ) == 16

a **= 3;		// a = Math.pow( a, 3 )
a;				// 8
```

**Note:** `**` is essentially the same as it appears in Python, Ruby, Perl, and others.

## Objects Properties and `...`

As we saw in the "Too Many, Too Few, Just Enough" section of Chapter 2, the `...` operator is pretty obvious in how it relates to spreading or gathering arrays. But what about objects?

Such a feature was considered for ES6, but was deferred to be considered after ES6 (aka "ES7" or "ES2016" or ...). Here's how it might work in that "beyond ES6" timeframe:

```js
var o1 = { a: 1, b: 2 },
	o2 = { c: 3 },
	o3 = { ...o1, ...o2, d: 4 };

console.log( o3.a, o3.b, o3.c, o3.d );
// 1 2 3 4
```

The `...` operator might also be used to gather an object's destructured properties back into an object:

```js
var o1 = { b: 2, c: 3, d: 4 };
var { b, ...o2 } = o1;

console.log( b, o2.c, o2.d );		// 2 3 4
```

Here, the `...o2` re-gathers the destructured `c` and `d` properties back into an `o2` object (`o2` does not have a `b` property like `o1` does).

Again, these are just proposals under consideration beyond ES6. But it'll be cool if they do land.

## `Array#includes(..)`

One extremely common task JS developers need to perform is searching for a value inside an array of values. The way this has always been done is:

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (vals.indexOf( 42 ) >= 0) {
	// found it!
}
```

The reason for the `>= 0` check is because `indexOf(..)` returns a numeric value of `0` or greater if found, or `-1` if not found. In other words, we're using an index-returning function in a boolean context. But because `-1` is truthy instead of falsy, we have to be more manual with our checks.

In the *Types & Grammar* title of this series, I explored another pattern that I slightly prefer:

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (~vals.indexOf( 42 )) {
	// found it!
}
```

The `~` operator here conforms the return value of `indexOf(..)` to a value range that is suitably boolean coercible. That is, `-1` produces `0` (falsy), and anything else produces a non-zero (truthy) value, which is what we for deciding if we found the value or not.

While I think that's an improvement, others strongly disagree. However, no one can argue that `indexOf(..)`'s searching logic is perfect. It fails to find `NaN` values in the array, for example.

So a proposal has surfaced and gained a lot of support for adding a real boolean-returning array search method, called `includes(..)`:

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (vals.includes( 42 )) {
	// found it!
}
```

**Note:** `Array#includes(..)` uses matching logic that will find `NaN` values, but will not distinguish between `-0` and `0` (see the *Types & Grammar* title of this series). If you don't care about `-0` values in your programs, this will likely be exactly what you're hoping for. If you *do* care about `-0`, you'll need to do your own searching logic, likely using the `Object.is(..)` utility (see Chapter 6).

## SIMD

We cover Single Instruction, Multiple Data (SIMD) in more detail in the *Async & Performance* title of this series, but it bears a brief mention here, as it's one of the next likely features to land in a future JS.

The SIMD API exposes various low-level (CPU) instructions that can operate on more than a single number value at a time. For example, you'll be able to specify two *vectors* of 4 or 8 numbers each, and multiply the respective elements all at once (data parallelism!).

Consider:

```js
var v1 = SIMD.float32x4( 3.14159, 21.0, 32.3, 55.55 );
var v2 = SIMD.float32x4( 2.1, 3.2, 4.3, 5.4 );

SIMD.float32x4.mul( v1, v2 );
// [ 6.597339, 67.2, 138.89, 299.97 ]
```

SIMD will include several other operations besides `mul(..)` (multiplication), such as `sub()`, `div()`, `abs()`, `neg()`, `sqrt()`, and many more.

Parallel math operations are critical for the next generations of high performance JS applications.

## WebAssembly (WASM)

Brendan Eich made a late breaking announcement near the completion of the first edition of this title that has the potential to significantly impact the future path of JavaScript: WebAssembly (WASM). We will not be able to cover WASM in detail here, as it's extremely early at the time of this writing. But this title would be incomplete without at least a brief mention of it.

One of the strongest pressures on the recent (and near future) design changes of the JS language has been the desire that it become a more suitable target for transpilation/cross-compilation from other languages (like C/C++, ClojureScript, etc.). Obviously, performance of code running as JavaScript has been a primary concern.

As discussed in the *Async & Performance* title of this series, a few years ago a group of developers at Mozilla introduced an idea to JavaScript called ASM.js. ASM.js is a subset of valid JS that most significantly restricts certain actions that make code hard for the JS engine to optimize. The result is that ASM.js compatible code running in an ASM-aware engine can run remarkably faster, nearly on par with native optimized C equivalents. Many viewed ASM.js as the most likely backbone on which performance-hungry applications would ride in JavaScript.

In other words, all roads to running code in the browser *lead through JavaScript*.

That is, until the WASM announcement. WASM provides an alternate path for other languages to target the browser's runtime environment without having to first pass through JavaScript. Essentially, if WASM takes off, JS engines will grow an extra capability to execute a binary format of code that can be seen as somewhat similar to a bytecode (like that which runs on the JVM).

WASM proposes a format for a binary representation of a highly compressed AST (syntax tree) of code, which can then give instructions directly to the JS engine and its underpinnings, without having to be parsed by JS, or even behave by the rules of JS. Languages like C or C++ can be compiled directly to the WASM format instead of ASM.js, and gain an extra speed advantage by skipping the JS parsing.

The near term for WASM is to have parity with ASM.js and indeed JS. But eventually, it's expected that WASM would grow new capabilities that surpass anything JS could do. For example, the pressure for JS to evolve radical features like threads -- a change that would certainly send major shockwaves through the JS ecosystem -- has a more hopeful future as a future WASM extension, relieving the pressure to change JS.

In fact, this new roadmap opens up many new roads for many languages to target the web runtime. That's an exciting new future path for the web platform!

What does it mean for JS? Will JS become irrelevant or "die"? Absolutely not. ASM.js will likely not see much of a future beyond the next couple of years, but the majority of JS is quite safely anchored in the web platform story.

Proponents of WASM suggest its success will mean that the design of JS will be protected from pressures that would have eventually stretched it beyond assumed breaking points of reasonability. It is projected that WASM will become the preferred target for high-performance parts of applications, as authored in any of a myriad of different languages.

Interestingly, JavaScript is one of the lesser likely languages to target WASM in the future. There may be future changes that carve out subsets of JS that might be tenable for such targeting, but that path doesn't seem high on the priority list.

While JS likely won't be much of a WASM funnel, JS code and WASM code will be able to interoperate in the most significant ways, just as naturally as current module interactions. You can imagine calling a JS function like `foo()` and having that actually invoke a WASM function of that name with the power to run well outside the constraints of the rest of your JS.

Things which are currently written in JS will probably continue to always be written in JS, at least for the foreseeable future. Things which are transpiled to JS will probably eventually at least consider targeting WASM instead. For things which need the utmost in performance with minimal tolerance for layers of abstraction, the likely choice will be to find a suitable non-JS language to author in, then targeting WASM.

There's a good chance this shift will be slow, and will be years in the making. WASM landing in all the major browser platforms is probably a few years out at best. In the meantime, the WASM project (https://github.com/WebAssembly) has an early polyfill to demonstrate proof-of-concept for its basic tenets.

But as time goes on, and as WASM learns new non-JS tricks, it's not too much a stretch of imagination to see some currently-JS things being refactored to a WASM-targetable language. For example, the performance sensitive parts of frameworks, game engines, and other heavily used tools might very well benefit from such a shift. Developers using these tools in their web applications likely won't notice much difference in usage or integration, but will just automatically take advantage of the performance and capabilities.

What's certain is that the more real WASM becomes over time, the more it means to the trajectory and design of JavaScript. It's perhaps one of the most important "beyond ES6" topics developers should keep an eye on.

## Review

If all the other books in this series essentially propose this challenge, "you (may) not know JS (as much as you thought)," this book has instead suggested, "you don't know JS anymore." The book has covered a ton of new stuff added to the language in ES6. It's an exciting collection of new language features and paradigms that will forever improve our JS programs.

But JS is not done with ES6! Not even close. There's already quite a few features in various stages of development for the "beyond ES6" timeframe. In this chapter, we briefly looked at some of the most likely candidates to land in JS very soon.

`async function`s are powerful syntactic sugar on top of the generators + promises pattern (see Chapter 4). `Object.observe(..)` adds direct native support for observing object change events, which is critical for implementing data binding. The `**` exponentiation operator, `...` for object properties, and `Array#includes(..)` are all simple but helpful improvements to existing mechanisms. Finally, SIMD ushers in a new era in the evolution of high performance JS.

Cliché as it sounds, the future of JS is really bright! The challenge of this series, and indeed of this book, is incumbent on every reader now. What are you waiting for? It's time to get learning and exploring!
