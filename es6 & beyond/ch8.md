# 你不懂JS：ES6与未来
# 第八章：ES6以后

在本书写作的时候，ES6（*ECMAScript 2015*）的最终草案即将为了ECMA的批准而进行最终的官方投票。但即便是在ES6已经被最终定稿的时候，TC39协会已经在为了ES7/2016和将来的特性进行努力的工作。

正如我们在第一章中讨论过的，预计JS进化的节奏将会从好几年升级一次加速到每年进行一次官方的版本升级（因此采用编年命名法）。这将会彻底改变JS开发者学习与跟上这门语言脚步的方式。

但更重要的是，协会实际上将会一个特性一个特性地进行工作。只要一种特性的规范被定义完成，而且通过在几种浏览器中的实验性实现打通了关节，那么这种特性就会被认为足够稳定并可以开始使用了。我们都被强烈鼓励一旦特性准备好就立即采用它，而不是等待什么官方标准投票。如果你还没学过ES6，现在上船的日子已经过了！

在本书写作时，一个未来特性提案的列表和它们的状态可以在这里看到(https://github.com/tc39/ecma262#current-proposals)。

在所有我们支持的浏览器实现这些新特性之前，转译器和填补是我们如何桥接它们的方法。Babel，Traceur，和其他几种主流转译器已经支持了一些最可能稳定下来的ES6之后的特性。

认识到这一点，是时候看一看它们之中的一些了。让我们开始吧！

**警告：** 这些特性都处于开发的各种阶段。虽然它们很可能确定下来，而且将与本章的内容看起来相似，但还是要抱着更多质疑的态度看待本章的内容。这一章将会在本书未来的版本中随着这些（和其他的！）特性的确定而演化。

## `async function`

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
		// `*main()` 成功地完成了
	},
	function rejected(reason){
		// 噢，什么东西搞错了
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
		// `main()` 成功地完成了
	},
	function rejected(reason){
		// 噢，什么东西搞错了
	}
);
```

取代`function *main() { ..`声明的，是我们使用`async function main() { ..`形式声明。而取代`yield`一个promise的，是我们`await`这个promise。运行`main()`函数的调用实际上返回一个我们可以直接监听的promise。这与我们从一个`run(main)`调用中拿回一个promise是等价的。

你看到对称性了吗？`async function`实质上是 generators + promises + `run(..)`模式的语法糖；它们在底层的操作是相同的！

如果你是一个C#开发者而且这种`async`/`await`看起来很熟悉，那是因为这种特性就是直接由C#的特性启发的。看到语言提供一致性是一件好事！

Babel、Traceur 以及其他转译器已经对当前的`async function`状态有了早期支持，所以你已经可以使用它们了。但是，在下一节的“警告”中，我们将看到为什么你也许还不应该上这艘船。

**注意：** 还有一个`async function*`的提案，它应当被称为“异步generator”。你可以在同一段代码中使用`yield`和`await`两者，甚至是在同一个语句中组合这两个操作：`x = await yield y`。“异步generator”提案看起来更具变化 —— 也就是说，它返回一个没有还没有完全被计算好的值。一些人觉得它应当是一个 *可监听对象（observable）*，有些像是一个迭代器和promise的组合。就目前来说，我们不会进一步探讨这个话题，但是会继续关注它的演变。

### 警告

关于`async function`的一个未解的争论点是，因为它仅返回一个promise，所以没有办法从外部 *撤销* 一个当前正在运行的`async function`实例。如果这个异步操作是资源密集型的，而且你想在自己确定不需要它的结果时能立即释放资源，这可能是一个问题。

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
		// ajax 成功
	},
	function rejected(reason){
		// 噢，什么东西搞错了
	}
);
```

我构想的`request(..)`有点儿像最近被提案要包含进web平台的`fetch(..)`工具。我们关心的是，例如，如果你想要用`pr`值以某种方法指示撤销一个长时间运行的Ajax请求会怎么样？

Promise是不可撤销的（在本书写作时）。在我和其他许多人看来，它们就不应该是可以被撤销的（参见本系列的 *异步与性能*）。而且即使一个proimse确实拥有一个`cancel()`方法，那么一定意味着调用`pr.cancel()`应当真的沿着promise链一路传播一个撤销信号到`async function`吗？

对于这个争论的几种可能的解决方案已经浮出水面：

* `async function`将根本不能被撤销（现状）
* 一个“撤销存根”可以在调用时传递给一个异步函数
* 将返回值改变为一个新增的可撤销promsie类型
* 将返回值改变为非promise的其他东西（比如，可监听对象，或带有promise和撤销能力的控制存根）

在本书写作时，`async function`返回普通的promise，所以完全改变返回值不太可能。但是现在下定论还是为时过早了。让我们持续关注这个讨论吧。

## `Object.observe(..)`

前端web开发的圣杯之一就是数据绑定 —— 监听一个数据对象的更新并同步这个数据的DOM表现形式。大多数JS框架都为这些类型的操作提供某种机制。

在ES6后期，我们似乎很有可能看到这门语言通过一个称为`Object.observe(..)`的工具，对此提供直接的支持。实质上，它的思想是你可以建立监听器来监听一个对象的变化，并在一个变化发生的任何时候调用一个回调。例如，你可相应地更新DOM。

你可以监听六种类型的变化：

* add
* update
* delete
* reconfigure
* setPrototype
* preventExtensions

默认情况下，你将会收到所有这些类型的变化的通知，但是你可以将它们过滤为你关心的那一些。

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
* `"setPrototype"`变化事件在一个对象的`[[Prototype]]`被改变时触发，不论是使用`__proto__`setter，还是使用`Object.setPrototypeOf(..)`设置它。

注意，这些变化事件在会在变化发生后立即触发。不要将它们与代理（见第七章）搞混，代理是可以在动作发生之前拦截它们的。对象监听让你在变化（或一组变化）发生之后进行应答。

### 自定义变化事件

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
		// `this` 是被监听的对象
		oldValue: this.c
	};
} );
```

在特定的环境下，这种关注点分离可能与你的使用模式匹配的更干净。

### 中止监听

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

## 指数操作符

为了使JavaScript以与`Math.pow(..)`相同的方式进行指数运算，有一个操作符被提出了。考虑如下代码：

```js
var a = 2;

a ** 4;			// Math.pow( a, 4 ) == 16

a **= 3;		// a = Math.pow( a, 3 )
a;				// 8
```

**注意：** `**`实质上在Python、Ruby、Perl、和其他语言中都与此相同。

## 对象属性与 `...`

正如我们在第二章的“太多，太少，正合适”一节中看到的，`...`操作符在扩散或收集一个数组上的工作方式是显而易见的。但对象会怎么样？

这样的特性在ES6中被考虑过，但是被推迟到ES6之后（也就是“ES7”或者“ES2016”或者……）了。这是它在“ES6以后”的时代中可能的工作方式：

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
	// 找到了！
}
```

进行`>= 0`检查是因为`indexOf(..)`在找到结果时返回一个`0`或更大的数字值，或者在没找到结果时返回`-1`。换句话说，我们在一个布尔值的上下文环境中使用了一个返回索引的函数。而由于`-1`是truthy而非falsy，所以我们不得不手动进行检查。

在本系列的 *类型与文法* 中，我探索了另一种我稍稍偏好的模式：

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (~vals.indexOf( 42 )) {
	// 找到了！
}
```

这里的`~`操作符使`indexOf(..)`的返回值与一个值的范围相一致，这个范围可以恰当地强制转换为布尔型。也就是，`-1`产生`0`（falsy），而其余的东西产生非零值（truthy），而这正是我们判定是否找到值的依据。

虽然我觉得这是一种改进，但有另一些人强烈反对。然而，没有人会质疑`indexOf(..)`的检索逻辑是完美的。例如，在数组中查找`NaN`值会失败。

于是一个提案浮出了水面并得到了大量的支持 —— 增加一个真正的返回布尔值的数组检索方法，称为`includes(..)`：

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (vals.includes( 42 )) {
	// 找到了！
}
```

**注意：** `Array#includes(..)`使用了将会找到`NaN`值的匹配逻辑，但将不会区分`-0`与`0`（参见本系列的 *类型与文法*）。如果你在自己的程序中不关心`-0`值，那么它很可能正是你希望的。如果你 *确实* 关心`-0`，那么你就需要实现你自己的检索逻辑，很可能是使用`Object.is(..)`工具（见六章）。

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

在本书的第一版将近完成的时候，Brendan Eich 突然宣布了一个有可能对JavaScript未来的道路产生重大冲击的公告：WebAssembly（WASM）。我们不能在这里详细地探讨WASM，因为在本书写作时这个话题为时过早了。但如果不简要地提上一句，这本书就不够完整。

JS语言在近期（和近未来的）设计的改变上所承受的最大压力之一，就是渴望它能够成为从其他语言（比如 C/C++，ClojureScript，等等）转译/交叉编译来的、合适的目标语言。显然，作为JavaScript运行的代码性能是一个主要问题。

正如在本系列的 *异步与性能* 中讨论过的，几年前一组在Mozilla的开发者给JavaScript引入了一个称为ASM.js的想法。AMS.js是一个合法JS的子集，它大幅地制约了使代码难于被JS引擎优化的特定行为。其结果就是兼容AMS.js的代码在一个支持ASM的引擎上可以显著地快速运行，几乎可以与优化过的原生C语言的等价物相媲美。许多观点认为，对于那些将要由JavaScript编写的渴求性能的应用程序来说，ASM.js很可能将是它们的基干。

换言之，在浏览器中条条大路通过JavaScript通向运行的代码。

直到WASM公告之前，是这样的。WASM提供了另一条路线，让其他语言不必非得首先通过JavaScript就能将浏览器的运行时环境作为运行的目标。实质上，如果WASM启用，JS引擎将会生长出额外的能力 —— 执行可以被视为有些与字节码相似的二进制代码（就像在JVM上运行的那些东西）。

WASM提出了一种高度压缩的代码AST（语法树）的二进制表示格式，它可以继而像JS引擎以及它的基础结构直接发出指令，无需被JS解析，甚至无需按照JS的规则动作。像C或C++这样的语言可以直接被编译为WASM格式而非ASM.js，并且由于跳过JS解析而得到额外的速度优势。

短期内，WASM与AMS.js、JS不相上下。但是最终，人们预期WASM将会生长出新的能力，那将超过JS能做的任何事情。例如，让JS演化出像线程这样的根本特性 —— 一个肯定会对JS生态系统造成重大冲击的改变 —— 作为一个WASM未来的扩展更有希望，也会缓解改变JS的压力。

事实上，这张新的路线图为许多语言服务于web运行时开启了新的道路。对于web平台来说，这真是一个激动人心的新路线！

它对JS意味着什么？JS将会变得无关紧要或者“死去”吗？绝对不是。ASM.js在接下来的几年中很可能看不到太多未来，但JS在数量上的绝对优势将它安全地锚定在web平台中。

WASM的拥护者们说，它的成功意味着JS的设计将会被保护起来，远离那些最终会迫使它超过自己合理性的临界点的压力。人们估计WASM将会成为应用程序中高性能部分的首选目标语言，这些部分曾用各种各样不同的语言编写过。

有趣的是，JavaScript是未来不太可能以WASM为目标的语言之一。可能有一些未来的改变会切出JS的一部分，而使这一部分更适于以WASM作为目标，但是这件事情看起来优先级不高。

虽然JS很可能与WASM没什么关联，但JS代码和WASM代码将能够以最重要的方式进行交互，就像当下的模块互动一样自然。你可以想象，调用一个`foo()`之类的JS函数而使它实际上调用一个同名WASM函数，它具备远离你其余JS的制约而运行的能力。

至少是在可预见的未来，当下以JS编写的东西可能将继续总是由JS编写。转译为JS的东西将可能最终至少考虑以WASM为目标。对于那些需要极致性能，而且在抽象的层面上没有余地的东西，最有可能的选择是找一种合适的非JS语言编写，然后以WASM为目标语言。

这个转变很有可能将会很慢，会花上许多年成形。WASM在所有的主流浏览器上固定下来可能最快也要花几年。同时，WASM项目(https://github.com/WebAssembly)有一个早期填补，来为它的基本原则展示概念证明。

但随着时间的推移，也随着WASM学到新的非JS技巧，不难想象一些当前是JS的东西被重构为以WASM作为目标的语言。例如，框架中性能敏感的部分，游戏引擎，和其他被深度使用的工具都很可能从这样的转变中获益。在web应用程序中使用这些工具的开发者们并不会在使用或整合上注意到太多不同，但确实会自动地利用这些性能和能力。

可以确定的是，随着WASM变得越来越真实，它对JavaScript设计路线的影响就越来越多。这可能是开发者们应当关注的最重要的“ES6以后”的话题。

## 复习

如果这个系列的其他书目实质上提出了这个挑战，“你（可能）不懂JS（不像自己想象的那么懂）”，那么这本书就是在说，“你不再懂JS了”。这本书讲解了在ES6中加入到语言里的一大堆新东西。它是一个新语言特性的精彩集合，也是将永远改进我们JS程序的范例。

但JS不是到ES6就完了！还早得很呢。已经有好几个“ES6之后”的特性处于开发的各个阶段。在这一章中，我们简要地看了一些最有可能很快会被固定在JS中的候选特性。

`async function`是建立在 generators + promises 模式（见第四章）上的强大语法糖。`Object.observe(..)`为监听对象变化事件增加了直接原生的支持，它对实现数据绑定至关重要。`**`指数作符，针对对象属性的`...`，以及`Array#includes(..)`都是对现存机制的简单而有用的改进。最后，SIMD将高性能JS的演化带入一个新纪元。

听起来很俗套，但JS的未来是非常光明的！这个系列，以及这本书的挑战，现在是各位读者的职责了。你还在等什么？是时候开始学习和探索了！
