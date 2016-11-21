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

除了六种内建的变化事件类型，你还可以监听并触发自定义变化事件。

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

变化的集合（`"recalc"`自定义事件）为了投递给监听器而被排队，但还没被投递，这就是为什么`obj.c`依然是`3`。

默认情况下，这些变化将在当前事件轮询（参见本系列的 *异步与性能*）的末尾被投递。如果你想要立即投递它们，使用`Object.deliverChangeRecords(observer)`。一旦这些变化投递完成，你就可以观察到`obj.c`如预期地更新为：

```js
obj.c;			// 42
```

在前面的例子中，我们使用变化完成事件的记录调用了`notifier.notify(..)`。将变化事件的记录进行排队的一种替代形式是使用`performChange(..)`，它把事件的类型与事件记录的属性（通过一个函数回调）分割开来。考虑如下代码：

```js
notifier.performChange( "recalc", function(){
	return {
		name: "c",
		// `this` is the object under observation
		oldValue: this.c
	};
} );
```

在特定的环境下，这种关注点分离可能与你的使用模式匹配的更干净。

### Ending Observation

正如普通的事件监听器一样，你可能希望停止监听一个对象的变化事件。为此，你可以使用`Object.unobserve(..)`。

举例来说：

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

在这个小例子中，我们监听变化事件直到我们看到`"setPrototype"`事件到来，那时我们就不再监听任何变化事件了。

## Exponentiation Operator

为了使JavaScript以与`Math.pow(..)`相同的方式进行指数运算，提案了一个操作符。考虑如下代码：

```js
var a = 2;

a ** 4;			// Math.pow( a, 4 ) == 16

a **= 3;		// a = Math.pow( a, 3 )
a;				// 8
```

**注意：** `**`实质上在Python、Ruby、Perl、和其他语言中都与此相同。

## Objects Properties and `...`

正如我们在第二章的“太多，太少，正合适”一节中看到的，`...`操作符在扩散或收集一个数组上的工作方式是显而易见的。但对象会怎么样？

这样的特性在ES6中被考虑过，但是被推迟到ES6之后（也就是“ES7”或者“ES2016”或者……）才会被考虑。这是它在“ES6以后”的时代中可能的工作方式：

```js
var o1 = { a: 1, b: 2 },
	o2 = { c: 3 },
	o3 = { ...o1, ...o2, d: 4 };

console.log( o3.a, o3.b, o3.c, o3.d );
// 1 2 3 4
```

`...`操作符也可能被用于将一个对象的被解构属性收集到另一个对象：

```js
var o1 = { b: 2, c: 3, d: 4 };
var { b, ...o2 } = o1;

console.log( b, o2.c, o2.d );		// 2 3 4
```

这里，`...o2`将被解构的`c`和`d`属性重新收集到一个`o2`对象中（与`o1`不同，`o2`没有`b`属性）。

重申一下，这些只是正在考虑之中的ES6之后的提案。但是如果它们能被确定下来就太酷了。

## `Array#includes(..)`

JS开发者需要执行的极其常见的一个任务就是在一个值的数组中搜索一个值。完成这项任务的方式曾经总是：

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (vals.indexOf( 42 ) >= 0) {
	// found it!
}
```

进行`>= 0`检查是因为`indexOf(..)`在找到结果时返回一个`0`或更大的数字值，或者在没找到结果时返回`-1`。换句话说，我们在一个布尔值的上下文环境中使用了一个返回索引的函数。而由于`-1`是truthy而非falsy，所以我们不得不手动进行检查。

在本系列的 *类型与文法* 中，我探索了另一种我稍稍偏好的模式：

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (~vals.indexOf( 42 )) {
	// found it!
}
```

这里的`~`操作符使`indexOf(..)`的返回值与一个值的范围相一致，这个范围可以恰当地强制转换为布尔型。也就是，`-1`产生`0`（falsy），而其余的东西产生非零值（truthy），而这正是我们判定是否找到值的依据。

虽然我觉得这是一种改进，但有另一些人强烈反对。然而，没有人会质疑`indexOf(..)`的检索逻辑是完美的。例如，在数组中查找`NaN`值会失败。

于是一个提案浮出了水面并得到了大量的支持 —— 增加一个真正的返回布尔值的数组检索方法，称为`includes(..)`：

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (vals.includes( 42 )) {
	// found it!
}
```

**注意：** `Array#includes(..)`使用了将会找到`NaN`值的匹配逻辑，但将不会区分`-0`与`0`（参加本系列的 *类型与文法*）。如果你在自己的程序中不关心`-0`值，那么它很可能正是你希望的。如果你 *确实* 关心`-0`，那么你就需要实现你自己的检索逻辑，很可能是使用`Object.is(..)`工具（见六章）。

## SIMD

我们在本系列的 *异步与性能* 中详细讲解了一个指令，多个数据（SIMD），但因为它是未来JS中下一个很可能被确定下来的特性，所以这里简要地提一下。

SIMD API 暴露了各种底层（CPU）指令，它们可以同时操作一个以上的数字值。例如，你可以指定两个拥有4个或8个数字的 *向量*，然后一次性分别相乘所有元素（数据并行机制！）。

考虑如下代码：

```js
var v1 = SIMD.float32x4( 3.14159, 21.0, 32.3, 55.55 );
var v2 = SIMD.float32x4( 2.1, 3.2, 4.3, 5.4 );

SIMD.float32x4.mul( v1, v2 );
// [ 6.597339, 67.2, 138.89, 299.97 ]
```

SIMD将会引入`mul(..)`（乘法）之外的几种其他操作，比如`sub()`、`div()`、`abs()`、`neg()`、`sqrt()`、以及其他许多。

并行数学操作对下一代的高性能JS应用程序至关重要。

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
