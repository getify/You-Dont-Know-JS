# 你不懂JS: 异步与性能
# 附录B: 高级异步模式

为了了解主要基于 Promise 与 Generator 的面向序列异步流程控制，附录A介绍了 *asynquence* 库。

现在我们将要探索其他建立在既存理解与功能之上的高级异步模式，并看看 *asynquence* 是如何在不需要许多分离的库的情况下，使得这些精巧的异步技术与我们的程序进行混合与匹配的。

## 可迭代序列

我们在前一篇附录中介绍过 *asynquence* 的可迭代序列，我们将更加详细地重温它们。

为了复习，回忆一下：

```js
var domready = ASQ.iterable();

// ..

domready.val( function(){
	// DOM 准备好了
} );

// ..

document.addEventListener( "DOMContentLoaded", domready.next );
```

现在，让我们定义将一个多步骤序列定义为一个可迭代序列：

```js
var steps = ASQ.iterable();

steps
.then( function STEP1(x){
	return x * 2;
} )
.then( function STEP2(x){
	return x + 3;
} )
.then( function STEP3(x){
	return x * 4;
} );

steps.next( 8 ).value;	// 16
steps.next( 16 ).value;	// 19
steps.next( 19 ).value;	// 76
steps.next().done;		// true
```

如你所见，一个可迭代序列是一个标准兼容的 *iterator*（见第四章）。所以，就像一个 generator（或其他任何 *可迭代对象*）那样，它是可以使用ES6`for..of`循环进行迭代的，

```js
var steps = ASQ.iterable();

steps
.then( function STEP1(){ return 2; } )
.then( function STEP2(){ return 4; } )
.then( function STEP3(){ return 6; } )
.then( function STEP4(){ return 8; } )
.then( function STEP5(){ return 10; } );

for (var v of steps) {
	console.log( v );
}
// 2 4 6 8 10
```

除了在前一篇附录中展示的事件触发的例子之外，可迭代序列的有趣之处还因为它们实质上可以被视为 generator 和 Promise 链的替代品，但具备更多灵活性。

考虑一个多Ajax请求的例子 —— 我们已经在第三章和第四章中看到过同样的场景，分别使用一个 Promise 链和一个 generator —— 表达为一个可迭代序列：

```js
// 兼容序列的 ajax
var request = ASQ.wrap( ajax );

ASQ( "http://some.url.1" )
.runner(
	ASQ.iterable()

	.then( function STEP1(token){
		var url = token.messages[0];
		return request( url );
	} )

	.then( function STEP2(resp){
		return ASQ().gate(
			request( "http://some.url.2/?v=" + resp ),
			request( "http://some.url.3/?v=" + resp )
		);
	} )

	.then( function STEP3(r1,r2){ return r1 + r2; } )
)
.val( function(msg){
	console.log( msg );
} );
```

可迭代序列表达了一系列顺序的（同步的或异步的）步骤，它看起来与一个 Promise 链极其相似 —— 换言之，它要比单纯嵌套的回调看起来干净的多，但没有 generator 的基于`yield`的顺序化语法那么好。

但我们将可迭代序列传入`ASQ#runner(..)`，它将可迭代序列像一个 generator 那样运行至完成。由于几个原因，一个可迭代序列的行为实质上与一个 generator 相同的事实是值得注意的：

首先，对于ES6 generator 的特定子集来说，可迭代对象是它的一种前ES6等价物，这意味着你既可以直接编写它们（为了在任何地方都能运行），也可以编写ES6 generator 并将它们转译/转换成可迭代序列（或者 Promise 链！）。

将一个异步运行至完成的 generator 考虑为一个 Promise 链的语法糖，是对它们之间的同构关系的一种重要认识。

在我们继续之前，我们应当注意到，前一个代码段本可以用 *asynquence* 表达为：

```js
ASQ( "http://some.url.1" )
.seq( /*STEP 1*/ request )
.seq( function STEP2(resp){
	return ASQ().gate(
		request( "http://some.url.2/?v=" + resp ),
		request( "http://some.url.3/?v=" + resp )
	);
} )
.val( function STEP3(r1,r2){ return r1 + r2; } )
.val( function(msg){
	console.log( msg );
} );
```

进一步，步骤2本可以被表达为：

```js
.gate(
	function STEP2a(done,resp) {
		request( "http://some.url.2/?v=" + resp )
		.pipe( done );
	},
	function STEP2b(done,resp) {
		request( "http://some.url.3/?v=" + resp )
		.pipe( done );
	}
)
```

那么，为什么我们要在一个简单/扁平的 *asyquence* 链看起来可以很好地工作的情况下，很麻烦地将自己的控制流在一个`ASQ#runner(..)`步骤中表达为一个可迭代序列呢？

因为可迭代序列的形式有一种重要的技巧可以给我们更多的力量。继续读。

### 扩展可迭代序列

Generator，普通的 *asynquence* 序列，和 Promise 链，都是被 **急切求值** 的 —— 控制流程最初要表达的的内容 *就是* 紧跟在后面的固定流程。

然而，可迭代序列是 **懒惰求值** 的，这意味着在可迭代序列执行期间，如果有需要的话你可以用更多的步骤扩展这个序列。

**注意：** 你只能在一个可迭代序列的末尾连接，而不是在序列的中间插入。

为了熟悉这种能力，首先让我们看一个比较简单（同步）的例子：

```js
function double(x) {
	x *= 2;

	// 我们应当继续扩展吗？
	if (x < 500) {
		isq.then( double );
	}

	return x;
}

// 建立单步可迭代序列
var isq = ASQ.iterable().then( double );

for (var v = 10, ret;
	(ret = isq.next( v )) && !ret.done;
) {
	v = ret.value;
	console.log( v );
}
```

这个可迭代序列开始时只有一个定义好的步骤（`isq.then(double)`），但是这个序列会在特定条件下（`x < 500`）持续扩展自己。*asynquence* 序列和 Promise 链在技术上都 *可以* 做相似的事情，但是我们将看到它们的这种能力不足的一些原因。

这个例子意义不大，而且本可以使用一个 generator 中的`while`循环来表达，所以我们将考虑更精巧的情况。

例如，你可以检查一个Ajax请求的应答，看它是否指示需要更多的数据，你可以条件性地向可迭代序列插入更多的步骤来发起更多的请求。或者你可以条件性地在Ajax处理器的末尾加入一个格式化步骤。

考虑如下代码：

```js
var steps = ASQ.iterable()

.then( function STEP1(token){
	var url = token.messages[0].url;

	// 有额外的格式化步骤被提供吗？
	if (token.messages[0].format) {
		steps.then( token.messages[0].format );
	}

	return request( url );
} )

.then( function STEP2(resp){
	// 要为序列增加另一个Ajax请求吗？
	if (/x1/.test( resp )) {
		steps.then( function STEP5(text){
			return request(
				"http://some.url.4/?v=" + text
			);
		} );
	}

	return ASQ().gate(
		request( "http://some.url.2/?v=" + resp ),
		request( "http://some.url.3/?v=" + resp )
	);
} )

.then( function STEP3(r1,r2){ return r1 + r2; } );
```

你可以在两个地方看到我们使用`steps.then(..)`条件性地扩展了`step`。为了运行这个`steps`可迭代序列，我们只要使用`ASQ#runner(..)`将它与一个 *asynquence* 序列（这里称为`main`）链接进我们的主程序流程中：

```js
var main = ASQ( {
	url: "http://some.url.1",
	format: function STEP4(text){
		return text.toUpperCase();
	}
} )
.runner( steps )
.val( function(msg){
	console.log( msg );
} );
```

`steps`可迭代序列的灵活性可以使用一个 generator 来表达吗？某种意义上可以，但我们不得不以一种有些尴尬的方式重新安排逻辑：

```js
function *steps(token) {
	// **步骤 1**
	var resp = yield request( token.messages[0].url );

	// **步骤 2**
	var rvals = yield ASQ().gate(
		request( "http://some.url.2/?v=" + resp ),
		request( "http://some.url.3/?v=" + resp )
	);

	// **步骤 3**
	var text = rvals[0] + rvals[1];

	// **步骤 4**
	// 有额外的格式化步骤被提供吗？
	if (token.messages[0].format) {
		text = yield token.messages[0].format( text );
	}

	// **步骤 5**
	// 要为序列增加另一个Ajax请求吗？
	if (/foobar/.test( resp )) {
		text = yield request(
			"http://some.url.4/?v=" + text
		);
	}

	return text;
}

// 注意：`*steps()`可以向先前的`step`一样被相同的`ASQ`序列运行
```

先把我们已经知道的序列的好处，以及看起来同步的 generator 语法（见第四章）放在一边，`steps`逻辑不得不在`*steps()` generator 形式中重排，来假冒可扩展的可迭代序列`steps`的动态机制。

那么，使用 Promise 或者序列如何表达这种功能呢？你 *可以* 这么做：

```js
var steps = something( .. )
.then( .. )
.then( function(..){
	// ..

	// 扩展这个链条，对吧？
	steps = steps.then( .. );

	// ..
})
.then( .. );
```

这里要抓住的问题很微妙但很重要。那么，考虑试着将我们的`stpes` Promise 链连接到我们的主程序流程中 —— 这次使用 Promise 代替 *asynquence* 来表达：

```js
var main = Promise.resolve( {
	url: "http://some.url.1",
	format: function STEP4(text){
		return text.toUpperCase();
	}
} )
.then( function(..){
	return steps;			// 提示！
} )
.val( function(msg){
	console.log( msg );
} );
```

现在你能发现问题吗？仔细观察！

对于序列步骤的顺序来说，这里有一个竞合状态。当你`return steps`时，`steps`在那个时刻 *可能* 是原本定义好的 promise 链了，或者它现在可能通过`steps = steps.then(..)`调用正指向扩张的 promise 链，这要看事情以什么顺序发生。

这里有两种可能的结果：

* 如果`steps`仍然是原来的 Promise 链，一旦它稍后通过`steps = steps.then(..)`“扩展”，这个位于链条末尾的扩展过的 promise 是 **不会** 被`main`流程考虑的，因为它已经通过这个`steps`链了。这就是不幸的 **急切求值** 限制。
* 如果`steps`已经是扩展过的 promise 链了，那么由于这个扩展过的 promise 正是`main`要通过的东西，所以它会如我们期望的那样工作。

第一种情况除了展示竞合状态不可容忍的明显事实，它还展示了 promise 链的 **急切求值**。相比之下，我们可以很容易地扩展可迭代序列而没有这样的问题，因为可迭代序列是 **懒惰求值** 的。

你越需要自己的流程控制动态，可迭代序列就越显得强大。

**提示：** 在 *asynquence* 的网站(https://github.com/getify/asynquence/blob/master/README.md#iterable-sequences)上可以看到更多关于可迭代序列的信息与示例。

## 事件响应式

（至少！）从第三章看来这应当很明显：Promise 是你异步工具箱中的一种非常强大的工具。但它们明显缺乏处理事件流的能力，因为一个 Promise 只能被解析一次。而且坦白地讲，对于 *asynquence* 序列来说这也正是它的一个弱点。

考虑这样一个场景：你想要在一个特定事件每次被触发时触发一系列步骤。一个单独的 Promise 或序列不能表示这个事件全部的发生状况。所以，你不得不为每一个事件的发生创建一个全新的 Promise 链（或序列），比如：

```js
listener.on( "foobar", function(data){

	// 创建一个新的事件处理 Promise 链
	new Promise( function(resolve,reject){
		// ..
	} )
	.then( .. )
	.then( .. );

} );
```

在这种方式拥有我们需要的基本功能，但是对于表达我们意图中的逻辑来说远不能使人满意。两种分离的能力混杂在这个范例中：事件监听，与事件应答；而关注点分离原则恳求我们将这些能力分开。

细心的读者会发现，这个问题与我们在第二章中详细讲解过的问题是有些对称的；它是一种控制反转问题。

想象一下非反转这个范例，就像这样：

```js
var observable = listener.on( "foobar" );

// 稍后
observable
.then( .. )
.then( .. );

// 在其他的地方
observable
.then( .. )
.then( .. );
```

值`observable`不是一个真正的 Promise，但你可以像监听一个 Promise 那样 *监听* 它，所以它们是有密切关联的。事实上，它可以被监听很多次，而且它会在每次事件（`"foobar"`）发生时都发送通知。

**提示：** 我刚刚展示过的这个模式，是响应式编程（reactive programming，也称为 RP）背后的概念和动机的 **大幅度简化**，响应式编程已经由好几种了不起的项目和语言实现/详细论述过了。RP 的一个变种是函数响应式编程（functional reactive programming，FRP），它指的是在数据流之上实施函数式编程技术（不可变性，参照完整性，等等）。“响应式”指的是随着事件的推移散布这种功能，以对事件进行应答。对此感兴趣的读者应当考虑学习“响应式可监听对象”，它源于由微软开发的神奇的“响应式扩展”库(对于 JavaScript 来说是 “RxJS”，http://rxjs.codeplex.com/)；它可要比我刚刚展示过的东西精巧和强大太多了。另外，Andre Staltz 写过一篇出色的文章(https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)，用具体的例子高效地讲解了 RP。

### ES7 可监听对象

在本书写作时，有一个早期ES7提案，一种称为“Observable（可监听对象）”的新数据类型(https://github.com/jhusain/asyncgenerator#introducing-observable)，它在精神上与我们在这里讲解过的相似，但是绝对更精巧。

这种可监听对象的概念是，你在一个流上“监听”事件的方法是传入一个 generator —— 其实 *迭代器* 才是有趣的部分 —— 它的`next(..)`方法会为每一个事件而调用。

你可以想象它是这样一种东西：

```js
// `someEventStream` 是一个事件流，来自于鼠标点击之类

var observer = new Observer( someEventStream, function*(){
	while (var evt = yield) {
		console.log( evt );
	}
} );
```

你传入的 generator 将会`yield`而暂停`while`循环，来等待下一个事件。添附在 generator 实例上的 *迭代器* 的`next(..)`将会在每次`someEventStream`发布一个新事件时被调用，因此这个事件将会使用`evt`数据推进你的 generator/*迭代器*。

在这里的监听事件功能中，重要的是 *迭代器* 的部分，而不是 generator。所以从概念上讲，你实质上可以传入任何可迭代对象，包括`ASQ.iterable()`可迭代序列。

有趣的是，还存在一些被提案的适配方案，使得从特定类型的流中构建可监听对象变得容易，例如为DOM事件提案的`fromEvent(..)`。如果你去看看`fromEvent(..)`在早期ES7提案中推荐的实现方式，你会发现它与我们将要在下一节中看到的`ASQ.react(..)`极其相似。

当然，这些都是早期提案，所以最终脱颖而出的东西可能会在外观/行为上与这里展示的有很大的不同。但是看到在不同的库与语言提案在概念上的早期统一还是很激动人心的！

### 响应式序列

将这种可监听对象（和F/RP）的超级简要的概览作为我们的启发与动机，我们现在将展示一种“响应式可监听对象”的很小的子集的适配方案，我称之为“响应式序列”。

首先，让我们从如何创建一个可监听对象开始，使用一个称为`react(..)`的 *asynquence* 插件工具：

```js
var observable = ASQ.react( function setup(next){
	listener.on( "foobar", next );
} );
```

现在，让我们看看如何为这个`observable`定义一个“响应的”序列 —— 在F/RP中，这通常称为“监听”：

```js
observable
.seq( .. )
.then( .. )
.val( .. );
```

所以，你只需要通过在这个可监听对象后面进行链接就可以了。很容易，是吧？

在F/RP中，事件流经常会通过一组函数式的变形，比如`scan(..)`，`map(..)`，`reduce(..)`，等等。使用响应式序列，每个事件会通过一个序列的新的实例。让我们看一个更具体的例子：

```js
ASQ.react( function setup(next){
	document.getElementById( "mybtn" )
	.addEventListener( "click", next, false );
} )
.seq( function(evt){
	var btnID = evt.target.id;
	return request(
		"http://some.url.1/?id=" + btnID
	);
} )
.val( function(text){
	console.log( text );
} );
```

响应式序列的“响应式”部分来源于分配一个或多个事件处理器来调用事件触发器（调用`next(..)`）。

响应式序列的“序列”部分正是我们已经探索过的：每一个步骤都可以是任何合理的异步技术 —— 延续回调，Promise 或者 generator。

一旦拟建立了一个响应式序列，只要事件被持续地触发，它就会一直初始化序列的实例。如果你想停止一个响应式序列，你可以调用`stop()`。

如果一个响应式序列被`stop()`了，你可能还想注销事件处理器；为此你可以注册一个拆卸处理器：

```js
var sq = ASQ.react( function setup(next,registerTeardown){
	var btn = document.getElementById( "mybtn" );

	btn.addEventListener( "click", next, false );

	// 只要`sq.stop()`被调用，它就会被调用
	registerTeardown( function(){
		btn.removeEventListener( "click", next, false );
	} );
} )
.seq( .. )
.then( .. )
.val( .. );

// 稍后
sq.stop();
```

**注意：** 在`setup(..)`处理器内部的`this`绑定引用是`sq`响应式序列，所以你可以在响应式序列的定义中使用`this`引用，比如调用`stop()`之类的方法，等等。

这是一个来自 Node.js 世界的例子，使用响应式序列处理到来的HTTP请求：

```js
var server = http.createServer();
server.listen(8000);

// 响应式监听
var request = ASQ.react( function setup(next,registerTeardown){
	server.addListener( "request", next );
	server.addListener( "close", this.stop );

	registerTeardown( function(){
		server.removeListener( "request", next );
		server.removeListener( "close", request.stop );
	} );
});

// 应答请求
request
.seq( pullFromDatabase )
.val( function(data,res){
	res.end( data );
} );

// 关闭 node
process.on( "SIGINT", request.stop );
```

`next(..)`触发器还可以很容易地适配 node 流，使用`onStream(..)`和`unStream(..)`：

```js
ASQ.react( function setup(next){
	var fstream = fs.createReadStream( "/some/file" );

	// 将流的 "data" 事件导向 `next(..)`
	next.onStream( fstream );

	// 监听流的结束
	fstream.on( "end", function(){
		next.unStream( fstream );
	} );
} )
.seq( .. )
.then( .. )
.val( .. );
```

你还可以使用序列组合来构成多个响应式序列流：

```js
var sq1 = ASQ.react( .. ).seq( .. ).then( .. );
var sq2 = ASQ.react( .. ).seq( .. ).then( .. );

var sq3 = ASQ.react(..)
.gate(
	sq1,
	sq2
)
.then( .. );
```

这里的要点是，`ASQ.react(..)`是一个F/RP概念的轻量级适配，使得将一个事件流与一个序列的连接成为可能，因此得名“响应式序列”。对于基本的响应式用法，响应式序列的能力通常是足够的。

**注意：** 这里有一个使用`ASQ.react(..)`来管理UI状态的例子(http://jsbin.com/rozipaki/6/edit?js,output)，和另一个使用`ASQ.react(..)`来处理HTTP请求/应答流的例子(https://gist.github.com/getify/bba5ec0de9d6047b720e)。

## Generator 协程

希望第四章帮助你很好地熟悉了ES6 generator。特别地，我们将重温并更加深入“Generator 并发性”的讨论。

我们想象了一个`runAll(..)`工具，它可以接收两个或更多的 generator 并且并发地运行它们，让它们协作地将控制权从一个`yield`到下一个，并带有可选的消息传递。

除了能够将一个 generator 运行至完成之外，我们在附录A中谈论过的`AQS#runner(..)`是一个`runAll(..)`概念的近似实现，它可以将多个 generator 并发地运行至完成。

那么让我们看看如何实现第四章的并发Ajax场景：

```js
ASQ(
	"http://some.url.2"
)
.runner(
	function*(token){
		// 转移控制权
		yield token;

		var url1 = token.messages[0]; // "http://some.url.1"

		// 清空消息重新开始
		token.messages = [];

		var p1 = request( url1 );

		// 转移控制权
		yield token;

		token.messages.push( yield p1 );
	},
	function*(token){
		var url2 = token.messages[0]; // "http://some.url.2"

		// 传递消息并转移控制权
		token.messages[0] = "http://some.url.1";
		yield token;

		var p2 = request( url2 );

		// 移控制权
		yield token;

		token.messages.push( yield p2 );

		// 讲结果传递给下一个序列步骤
		return token.messages;
	}
)
.val( function(res){
	// `res[0]` comes from "http://some.url.1"
	// `res[1]` comes from "http://some.url.2"
} );
```

以下是`ASQ#runner(..)`和`runAll(..)`之间的主要不同：

* 每个 generator（协程）都被提供了一个称为`token`的参数值，它是一个当你想要明确地将控制权传递给下一个协程时`yield`用的特殊值。
* `token.messages`是一个数组，持有从前一个序列步骤中传入的任何消息。它也是一种数据结构，你可以用来在协程之间分享消息。
* `yield`一个 Promise（或序列）值不会传递控制权，但会暂停这个协程处理直到这个值准备好。
* 这个协程处理运行到最后`return`或`yield`的值将会传递给序列中的下一个步骤。

为了适应不同的用法，在`ASQ#runner(..)`功能的基础上包装一层帮助函数也很容易。

### 状态机

许多程序员可能很熟悉的一个例子是状态机。在一个简单包装工具的帮助下，你可以创一个易于表达的状态机处理器。

让我们想象一个这样的工具。我们称之为`state(..)`，我们将传递给它两个参数值：一个状态值和一个处理这个状态的 generator。`state(..)`将担负起创建并返回一个适配器 generator 的脏活，并把它传递给`ASQ#runner(..)`。

考虑如下代码：

```js
function state(val,handler) {
	// 为这个状态制造一个协程处理器
	return function*(token) {
		// 状态转换处理器
		function transition(to) {
			token.messages[0] = to;
		}

		// 设置初始状态（如果还没有设置的话）
		if (token.messages.length < 1) {
			token.messages[0] = val;
		}

		// 持续运行直到最终状态（false）
		while (token.messages[0] !== false) {
			// 当前的状态匹配这个处理器吗？
			if (token.messages[0] === val) {
				// 委托到状态处理器
				yield *handler( transition );
			}

			// 要把控制权转移给另一个状态处理器吗？
			if (token.messages[0] !== false) {
				yield token;
			}
		}
	};
}
```

如果你仔细观察，你会发现`state(..)`返回了一个接收`token`的 generator，然后它建立一个`while`循环，这个循环会运行到状态机直到到达它的最终状态（我们随意地将它选定为`false`值）为止；这正是我们想要传递给`ASQ#runner(..)`的那种 generator！

我们还随意地保留了`token.messages[0]`值槽，放置我们的状态机将要追踪的当前状态，这意味着我们甚至可以指定初始状态，作为序列中前一个步骤传递来的值。

我们如何将`state(..)`帮助函数与`ASQ#runner(..)`一起使用呢？

```js
var prevState;

ASQ(
	/* 可选的：初始状态值 */
	2
)
// 运行我们的状态机
// 转换是：2 -> 3 -> 1 -> 3 -> false
.runner(
	// 状态 `1` 处理器
	state( 1, function *stateOne(transition){
		console.log( "in state 1" );

		prevState = 1;
		yield transition( 3 );	// 前往状态 `3`
	} ),

	// 状态 `2` 处理器
	state( 2, function *stateTwo(transition){
		console.log( "in state 2" );

		prevState = 2;
		yield transition( 3 );	// 前往状态 `3`
	} ),

	// 状态 `3` 处理器
	state( 3, function *stateThree(transition){
		console.log( "in state 3" );

		if (prevState === 2) {
			prevState = 3;
			yield transition( 1 ); // 前往状态 `1`
		}
		// 完成了！
		else {
			yield "That's all folks!";

			prevState = 3;
			yield transition( false ); // 终止状态
		}
	} )
)
// 状态机运行完成，所以继续
.val( function(msg){
	console.log( msg );	// That's all folks!
} );
```

重要的是，`*stateOne(..)`，`*stateTwo(..)`，和`*stateThree(..)` generator 本身会在每次进入那种状态时被调用，它们会在你`transition(..)`到另一个值时完成。虽然没有在这里展示，但是这些状态 generator 处理器理所当然地可以通过`yield` Promise/序列/thunk 来异步地暂停。

隐藏在底层的 generator 是由`state(..)`帮助函数产生的，实际上被传递给`ASQ#runner(..)`的 generator 是持续并发运行至状态机长度的那一个，它们的每一个都协作地将控制权`yield`给下一个，如此类推。

**注意：** 看看这个“乒乓”的例子(http://jsbin.com/qutabu/1/edit?js,output)，它展示了由`ASQ#runner(..)`驱动的 generator 的协作并发的用法。

## 通信序列化处理（CSP）

“通信序列化处理（Communicating Sequential Processes —— CSP）”是由 C. A. R. Hoare 在1978年的一篇学术论文(http://dl.acm.org/citation.cfm?doid=359576.359585)中首先被提出的，后来在1985年的一本同名书籍中被描述过。CSP描述了一种并发“进程”在处理期间进行互动（也就是“通信”）的形式方法。

你可能会回忆起我们在第一章检视过的并发“进程”，所以我们对CSP的探索将会建立在那种理解之上。

就像大多数计算机科学中的伟大概念一样，CSP深深地沉浸在学术形式主意中，被表达为一种代数处理。然而，我怀疑满是符号的代数定理不会给读者带来太多实际意义，所以我们将找其他的方法将CSP带进我们的大脑。

我会将很多CSP的形式描述和证明留给 Hoare 的文章，与其他许多美妙的相关作品。取而代之的是，我们将尽可能以一种非学院派的、但愿是可以直接理解的方法，来试着简要地讲解CSP的思想。

### 消息传递

CSP的核心原则是，在独立进程之间的通信/互动都必须通过正式的消息传递。也许与你的期望背道而驰，CSP的消息传递是作为同步行为进行描述的，发送进程与接收进程都不得不为消息的传递做好准备。

这样的同步消息怎么会与 JavaScript 中的异步编程有联系？

这种联系具体来自于 ES6 generator 的性质 —— generator 被用于生产看似同步的行为，而这些行为的内部既可以是同步的也可以（更可能）是异步的。

换言之，两个或更多并发运行的 generator 可能看起来像是在互相同步地传递消息，而同时保留了系统的异步性基础，因为每个 generator 的代码都会被暂停（也就是“阻塞”）来等待一个异步动作的运行。

这是如何工作的？

想象一个称为“A”的 generator，它想要给 generator “B” 发送一个消息。首先，“A” `yield`出要发送给“B”的消息（因此暂停了“A”）。当“B”准备好并拿走这个消息时，“A”才会继续（解除阻塞）。

与此对称的，想象一个 generator “A”想要 **从** “B”接收一个消息。“A” `yield`出一个从“B”取得消息的请求（因此暂停了“A”），一旦“B”发送了一个消息，“A”就拿来这个消息并继续。

对于这种CSP消息传递理论来说，一个更广为人知的表达形式是 ClojureScript 的 core.async 库，以及 *go* 语言。它们将CSP中描述的通信语义实现为一种在进程之间打开的管道，称为“频道（channel）”。

**注意：** *频道* 这个术语描述了问题的一部分，因为存在一种模式，会有多于一个的值被一次性发送到这个频道的“缓冲”中；这与你对流的认识相似。我们不会在这里深入这个问题，但是对于数据流的管理来说它可能是一个非常强大的技术。

在CSP最简单的概念中，一个我们在“A”和“B”之间建立的频道会有一个称为`take(..)`的阻塞方法来接收一个值，以及一个称为`put(..)`的阻塞方法来发送一个值。

它看起来可能像这样：

```js
var ch = channel();

function *foo() {
	var msg = yield take( ch );

	console.log( msg );
}

function *bar() {
	yield put( ch, "Hello World" );

	console.log( "message sent" );
}

run( foo );
run( bar );
// Hello World
// "message sent"
```

将这种结构化的、（看似）同步的消息传递互动，与`ASQ#runner(..)`通过`token.messages`数组与协作的`yield`提供的、非形式化与非结构化的消息共享相比较。实质上，`yield put(..)`是一种可以同时发送值并为了传递控制权而暂停执行的单一操作，而前一个例子中我们将这两个步骤分开实施。

另外CSP强调，你不会真正明确地“传递控制权”，而是这样设计你的并发过程：要么为了从频道中接收值而阻塞，要么为了试着向这个频道中发送值而阻塞。这种围绕着消息的发送或接收的阻塞，就是你如何在协程之间协调行为序列的方法。

**注意：** 预先奉告：这种模式非常强大，但要习惯它有些烧脑。你可能会需要实践它一下，来习惯这种协调并发性的新的思考方式。

有好几个了不起的库已经用 JavaScript 实现了这种风格的CSP，最引人注目的是“js-csp”(https://github.com/ubolonton/js-csp)，由 James Long (http://twitter.com/jlongster)开出的分支(https://github.com/jlongster/js-csp)，以及他特意撰写的作品(http://jlongster.com/Taming-the-Asynchronous-Beast-with-CSP-in-JavaScript)。另外，关于将 ClojureScript 中 go 风格的 core.async CSP 适配到 JS generator 的话题，无论怎么夸赞 David Nolen (http://twitter.com/swannodette) 的许多作品很精彩都不为过 (http://swannodette.github.io/2013/08/24/es6-generators-and-csp)。

### asynquence 的 CSP 模拟

因为我们是在我的 *asynquence* 库的上下文环境中讨论异步模式的，你可能会对这个话题很感兴趣：我们可以很容易地在`ASQ#runner(..)` generator 处理上增加一个模拟层，来近乎完美地移植CSP的API和行为。这个模拟层放在与 *asynquence* 一起发放的 “asynquence-contrib”包的可选部分。

与早先的`state(..)`帮助函数非常类似，`ASQ.csp.go(..)`接收一个 generator —— 用 go/core.async 的术语来讲，它称为一个 goroutine —— 并将它适配为一个可以与`ASQ#runner(..)`一起使用的新 generator。

与被传入一个`token`不同，你的 goroutine 接收一个创建好的频道（下面的`ch`），这个频道会被本次运行的所有 goroutine 共享。你可以使用`ASQ.csp.chan(..)`创建更多频道（这通常十分有用）。

在CSP中，我们使用频道消息传递上的阻塞作为所有异步性的模型，而不是为了等待 Promise/序列/thunk 的完成而发生的阻塞。

所以，与`yield`从`request(..)`中返回的 Promise 不同的是，`request(..)`应当返回一个频道，你从它那里`take(..)`一个值。换句话说，一个单值频道在这种上下文环境/用法上大致上与一个 Promise/序列是等价的。

让我们先制造一个兼容频道版本的`request(..)`：

```js
function request(url) {
	var ch = ASQ.csp.channel();
	ajax( url ).then( function(content){
		// `putAsync(..)` 是 `put(..)` 的另一个版本，
		// 它可以在一个 generator 的外部使用。它为操作
		// 的完成返回一个 promise。我们不在这里使用这个
		// promise，但如果有需要的话我们可以在值被
		// `taken(..)` 之后收到通知。
		ASQ.csp.putAsync( ch, content );
	} );
	return ch;
}
```

在第三章中，“promisory”是一个生产 Promise 的工具，第四章中“thunkory”是一个生产thunk的工具，最后，在附录A中我们发明了“sequory”表示一个生产序列的工具。

很自然地，我们需要为一个生产频道的工具杜撰一个对称的术语。所以就让我们不出意料地称它为“chanory”（“channel” + “factory”）吧。作为一个留给读者的练习，请试着亲手定义一个`channelify(..)`的工具，就像 `Promise.wrap(..)`/`promisify(..)`（第三章），`thunkify(..)`（第四章），和`ASQ.wrap(..)`（附录A）一样。

先考虑这个使用 *asyquence* 风格CSP的并发Ajax的例子：

```js
ASQ()
.runner(
	ASQ.csp.go( function*(ch){
		yield ASQ.csp.put( ch, "http://some.url.2" );

		var url1 = yield ASQ.csp.take( ch );
		// "http://some.url.1"

		var res1 = yield ASQ.csp.take( request( url1 ) );

		yield ASQ.csp.put( ch, res1 );
	} ),
	ASQ.csp.go( function*(ch){
		var url2 = yield ASQ.csp.take( ch );
		// "http://some.url.2"

		yield ASQ.csp.put( ch, "http://some.url.1" );

		var res2 = yield ASQ.csp.take( request( url2 ) );
		var res1 = yield ASQ.csp.take( ch );

		// 讲结果传递给序列的下一个步骤
		ch.buffer_size = 2;
		ASQ.csp.put( ch, res1 );
		ASQ.csp.put( ch, res2 );
	} )
)
.val( function(res1,res2){
	// `res1` comes from "http://some.url.1"
	// `res2` comes from "http://some.url.2"
} );
```

消息传递在两个 goroutines 之间进行的 URL 字符串交换是非常直接的。第一个 goroutine 向第一个URL发起一个Ajax请求，它的应答被放进`ch`频道。第二个 goroutine 想第二个URL发起一个Ajax请求，然后从`ch`频道取下第一个应答`res1`。在这个时刻，应答`res1`和`res2`都被完成且准备好了。

如果在 goroutine 运行的末尾`ch`频道还有什么剩余价值的话，它们将被传递进序列的下一个步骤中。所以，为了从最后的 goroutine 中传出消息，把它们`put(..)`进`ch`。就像展示的那样，为了避免最后的那些`put(..)`阻塞，我们通过把`ch`的`buffer_size`设置为`2`（默认是`0`）来将它切换到缓冲模式。

**注意：** 更多使用 *asynquence* 风格CSP的例子可以参见这里(https://gist.github.com/getify/e0d04f1f5aa24b1947ae)。

## 复习

Promise 和 generator 为我们能够创建更加精巧和强大的异步性提供了基础构建块。

*asynquence* 拥有许多工具，用于实现 *的迭代序列*，*响应式序列*（也就是“可监听对象”），*并发协程*，甚至 *CSP goroutines*。

将这些模式，与延续回调和 Promise 能力相组合，使得 *asynquence* 拥有了混合不同异步处理的强大功能，一切都整合进一个干净的异步流程控制抽象：序列。
