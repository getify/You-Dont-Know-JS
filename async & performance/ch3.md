# 你不懂JS: 异步与性能
# 第三章: Promises

在第二章中，我们定位了在使用回调表达程序异步性和管理并发的两个主要类别的不足：缺乏顺序性和缺乏可靠性。现在我们更亲近地理解了问题，是时候将我们的注意力转向解决它们的模式了。

我们首先想要解决的是 *控制倒转* 问题，信任是如此脆弱而且是如此的容易丢失。

回想一下，我们将我们的程序的延续包装进一个回调函数中，将这个回调交给另一个团体（甚至是潜在的外部代码），并双手合十祈祷它会做正确的事情并调用这个回调。

我们这么做是因为我们想说，“这是 *稍后* 将要发生的事，在当前的步骤完成之后。”

但是如果我们能够反向倒转这种 *控制倒转* 呢？如果不是将我们程序的延续交给另一个团体，而是希望它返回给我们一个可以知道它何时完成的能力，然后我们的代码可以决定下一步做什么呢？

这种规范被称为 **Promise**。

Promise正在像风暴一样席卷JS世界，因为开发者和语言规范作者之流拼命地想要在他们的代码/设计中解决回调地狱的疯狂。事实上，大多数新被加入JS/DOM平台的异步API都是建立在Promise之上的。所以深入并学习它们可能是个好主意，你不这么认为吗！？

**注意：** “立即”这个词将在本章频繁使用，一般来说它指代一些Promise解析行为。然而，本质上在所有情况下，“立即”意味着就工作队列行为而言，不是严格同步的 *现在* 的感觉。

## 什么是一个Promise？

当开发者们决定要学习一种新技术或模式的时候，他们的第一步总是“给我看代码！”。摸着石头过河对我们来讲是十分自然的。

但事实上仅仅考察API丢失了一些抽象过程。Promise是这样一种工具：它能非常明显地看出使用者是否理解了它是为什么和关于什么，还是仅仅学习和使用API。

所以在我展示Promise的代码之前，我想在概念上完整地解释一下Promise到底是什么。我希望这能更好地指引你探索如何将Promise理论整合到你自己的异步流程中。

带着这样的想法，让我们来看两种类比，来解释Promise是什么。

### 未来的值

想象这样的场景：我走到快餐店的柜台前，点了一个起士汉堡。并交了1.47美元的现金。通过点餐和付款，我为得到一个 *值*（起士汉堡）制造了一个请求。我发起了一个事务。

但是通常来说，骑士汉堡不会立即到我手中。收银员交给一些东西代替我的起士汉堡：一个带有点餐排队号的收据。这个点餐号是一个“我欠你”的许诺，它保证我最终会得到我的起士汉堡。

于是我就拿着我的收据和点餐号。我知道它代表我的 *未来的起士汉堡*，所以我无需再担心它——除了挨饿！

在我等待的时候，我可以做其他的事情，比如给我的朋友发微信说，“嘿，一块儿吃午餐吗？我要吃起士汉堡”。

我已经在用我的 *未来的起士汉堡* 进行推理了，即便它还没有到我手中。我的大脑可以这么做是因为它将点餐号作为起士汉堡的占位符号。这个占位符号实质上使这个值 *与时间无关*。它是一个 **未来的值**。

最终，我听到，“113号！”。于是我愉快地拿着收据走回柜台前。我把收据递给收银员，拿回我的起士汉堡。

换句话说，一旦我的 *未来的值* 准备好，我就用我的许诺值换回值本身。

但还有另外一种可能的输出。它们叫我的号，但当我去取起士汉堡时，收银员遗憾地告诉我，“对不起，看起来我们的起士汉堡卖光了。”把这种场景下顾客有多沮丧放在一边，我们可以看到 *未来的值* 的一个重要性质：它们既可以表示成功也可以表示失败。

每次我点起士汉堡时，我都知道我不是最终得到一个起士汉堡，就是得到起士汉堡卖光的坏消息，并且不得不考虑中午吃点儿别的东西。

**注意：** 在代码中，事情没有这么简单，因为还隐含着一种点餐号永远也不会被叫到的情况，这时我们就被搁置在了一种无限等待的未解决状态。我们待会儿再回头处理这种情况。

#### Values Now and Later

这一切也许听起来在思维上太过抽象而不能实施在你的代码中。那么，让我们更具体一些。

然而，在我们能介绍Promise是如何以这种方式工作之前，我们先看看我们已经明白的代码——回调！——是如何处理这些 *未来值* 的。

在你写代码来推导一个值时，比如在一个`number`上进行数学操作，不论你是否理解，对于这个值你已经假设了某些非常基础的事实——这个值已经是一个实在的 *现在* 值：

```js
var x, y = 2;

console.log( x + y ); // NaN  <-- 因为`x`还没有被赋值
```

`x + y`操作假定`x`和`y`都已经被设定好了。用我们一会将要阐述的术语来讲，我们假定`x`和`y`的值已经被 *解析（resovle）* 了。

期盼`+`操作符本身能够魔法般地检测并等待`x`和`y`的值被解析（也就是准备好），然后仅在那之后才进行操作是没道理的。如果不同的语句 *现在* 完成而其他的 *稍后* 完成，这就会在程序中造成混乱，对吧？

如果两个语句中的一个（或两者同时）可能还没有完成，你如何才能推断它们的关系呢？如果语句2要依赖语句1的完成，那么这里仅有两种输出：不是语句1 *现在* 立即完成而且一切处理正常进行，就是语句1还没有完成，所以语句2将会失败。

如果这些东西听起来很像第一章的内容，很好！

回到我们的`x + y`的数学操作。想象有一种方法可以说，“将`x`和`y`相加，但如果它们中任意一个还没有被设置，就等到它们都被设置。尽快将它们相加。”

你的大脑也许刚刚跳进回调。好吧，那么...

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

花点儿时间来感受一下这段代码的美妙（或者丑陋），我耐心地等你。

虽然丑陋是无法否认的，但是关于这种异步模式有一些非常重要的事情需要注意。

在这段代码中，我们将`x`和`y`作为未来的值对待，我们将`add(..)`操作表达为：（从外部看来）它并不关心`x`或`y`或它们两者现在是否可用。换句话所，它泛化了 *现在* 和 *稍后*，如此我们可以信赖`add(..)`操作的一个可预测的输出。

通过使用一个临时一致的`add(..)`——它跨越 *现在* 和 *稍后* 的行为是相同的——异步代码的推理变得容易的多了。

更直白地说：为了一致地处理 *现在* 和 *稍后*，我们将它们都作为 *稍后*：所有的操作都变成异步的。

当然，这种粗略的基于回调的方法留下了许多提升的空间。为了理解推理 *未来的值* 且不用关心它什么时候变得可用而带来的好处，这仅仅是迈出的一小步。

#### Promise Value

我们绝对会在本章的后面深入更多关于Promise的细节——所以如果这让你犯糊涂，不要担心——但让我们先简单地看一下我们如何通过`Promise`来表达`x + y`的例子：

```js
function add(xPromise,yPromise) {
	// `Promise.all([ .. ])`接收一个Promise的数组，
	// 并返回一个等待它们全部完成的新Promise
	return Promise.all( [xPromise, yPromise] )

	// 当这个Promise被解析后，我们拿起收到的`X`和`Y`的值，并把它们相加
	.then( function(values){
		// `values`是一个从先前被解析的Promise那里收到的消息数组
		return values[0] + values[1];
	} );
}

// `fetchX()`和`fetchY()`分别为它们的值返回一个Promise，
// 这些值可能在 *现在* 或 *稍后* 准备好
add( fetchX(), fetchY() )

// 为了将两个数字相加，我们得到一个Promise。
// 现在我们链式地调用`then(..)`来等待返回的Promise被解析
.then( function(sum){
	console.log( sum ); // 这容易多了！
} );
```
在这个代码段中有两层Promise。

`fetchX()`和`fetchY()`被直接调用，它们的返回值（promise！）被传入`add(..)`。这些promise表示的值将在 *现在* 或 *稍后* 准备好，但是每个promise都将行为泛化为与时间无关。我们以一种时间无关的方式来推理`X`和`Y`的值。它们是 *未来的值*。

第二层是由`add(..)`创建（通过`Promise.all([ .. ])`）并返回的promise，我们通过调用`then(..)`来等待它。当`add(..)`操作完成后，我们的`sum`*未来值* 就准备好并可以打印了。我们将等待`X`和`Y`的 *未来值* 的逻辑隐藏在`add(..)`内部。

**注意：** 在`add(..)`内部。`Promise.all([ .. ])`调用创建了一个promise（它在等待`promiseX`和`promiseY`被解析）。链式调用`.then(..)`创建了另一个promise，它的`return values[0] + values[1]`这一行会被立即解析（使用加法的结果）。这样我们链接在`add(..)`调用末尾的`then(..)`调用——在代码段最后——实际上是在第二个被返回的promise上进行操作，而非被`Promise.all([ .. ])`创建的第一个promise。另外，虽然我们没有在这第二个`then(..)`的末尾链接任何操作，它也已经创建了另一个promise，我们可以选择监听/使用它。这类Promise链的细节将会在本章后面进行讲解。

就像点一个起士汉堡，Promise的解析可能是一个拒绝（rejection）而非完成（fulfillment）。不同的是，被完成的Promise的值总是程序化的，而一个拒绝值——通常被称为“拒绝理由”——既可以被程序逻辑设置，也可以被运行时异常隐含地设置。

使用Promise，`then(..)`调用实际上可以接受两个函数，第一个用作完成（正如刚才所示），而第二个用作拒绝：

```js
add( fetchX(), fetchY() )
.then(
	// fullfillment handler
	function(sum) {
		console.log( sum );
	},
	// rejection handler
	function(err) {
		console.error( err ); // bummer!
	}
);
```

如果在取得`X`或`Y`是出现了错误，或在加法操作时某些事情不知怎地失败了，`add(..)`返回的promise被拒绝了，传入`then(..)`的第二个错误处理回调函数会从promise那里收到拒绝值。

因为Promise包装了时间相关的状态——等待当前值的完成或拒绝——从外部看来，Promise本身是时间无关的，如此Promise就可以用可预测的方式组合，而不用关心时间或底层的输出。

另外，一旦Promise被解析，它就永远保持那个状态——它在那个时刻变成了一个 *不可变的值*——而且可以根据需要 *被监听* 任意多次。

**注意：** 因为Promise一旦被解析就是外部不可变的，所以现在将这个值传递给任何其他团体都是安全的，而且我们知道它不会被意外或恶意地被修改。这在许多团体监听同一个Promise的解析时特别有用。一个团体去影响另一个团体对Promise解析的监听能力是不可能的。不可变性听起来是一个学院派话题，但它实际上是Promise设计中最基础且最重要的方面之一，因此不能将它随意地跳过。

这是用于理解Promise的最强大且最重要的概念之一。通过大量的工作，你可以仅仅使用丑陋的回调组合来创建相同的效果，但这真的不是一个高效的策略，特别是你不得不一遍一遍地重复它。

Promise是一种用来包装与组合 *未来值*，并且可以很容易复用的机制。

### Completion Event

正如我们刚才看到的，一个独立的Promise作为一个 *未来值* 动作。但还有另外一种方式考虑Promise的解析：在一个异步任务的两个或以上步骤中，作为一种流程控制机制——俗称“这个然后那个”。

让我们想象调用`foo(..)`来执行某个任务。我们对它的细节一无所知，我们也不关心。它可能会立即完成任务，也可能会花一段时间完成。

我们仅仅想简单地知道`foo(..)`什么时候完成，以便于我们可以移动到下一个任务。换句话说，我们想要一种方法被告知`foo(..)`的完成，以便于我们可以 *继续*。

在典型的JavaScript风格中，如果你需要监听一个通知，你很可能会想到事件（event）。那么我们可以将我们的通知需求重新表述为，监听由`foo(..)`发出的 *完成*（或 *继续*）事件。

**注意：** 将它称为一个“完成事件”还是一个“继续事件”取决于你的角度。你是更关心`foo(..)`发生的事情，还是更关心`foo(..)`完成 *之后* 发生的事情？两种角度都对而且都有用。事件通知告诉我们`foo(..)`已经 *完成*，但是 *继续* 到下一个步骤也没问题。的确，你为了事件通知调用而传入的回调函数本身，在前面我们称它为一个 *延续*。因为 *完成事件* 更加聚焦于`foo(..)`，也就是我们当前注意的东西，所以在这篇文章的其余部分我们稍稍偏向于使用 *完成事件*。

使用回调，“通知”将是被任务（`foo(..)`）调用的我们的回调函数。但是用Promise，我们将关系扭转过来，我们希望能够监听一个来自于`foo(..)`的事件，当我们被通知时，做相应的处理。

首先，考虑一些假想代码：

```js
foo(x) {
	// start doing something that could take a while
}

foo( 42 )

on (foo "completion") {
	// now we can do the next step!
}

on (foo "error") {
	// oops, something went wrong in `foo(..)`
}
```

我们调用`foo(..)`然后我们设置两个事件监听器，一个给`"completion"`，一个给`"error"`——`foo(..)`调用的两种可能的最终结果。实质上，`foo(..)`甚至不知道调用它的代码监听了这些事件，这构成了一个非常美妙的 *关注分离（separation of concerns）*。

不幸的是，这样的代码将需要JS环境不具备的一些“魔法”（而且显得有些不切实际）。这里是一种用JS表达它的更自然的方式：

```js
function foo(x) {
	// start doing something that could take a while

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

`foo(..)`明确地创建并返回了一个事件监听能力，调用方代码接收并在它上面注册了两个事件监听器。

从一般的面向回调代码的反转应当是明显的，而且是有意为之。与将回调传入`foo(..)`相反，它返回一个我们称之为`ent`的事件能力，它接收回调。

但如果你回想第二章，回调本身代表着一种 *控制反转*。所以反转回调模式实际上是 *反转的反转*，或者说是一个 *控制非反转*——将控制权归还给我们希望保持它的调用方代码，

一个重要的好处是，代码的多个分离部分都可以被赋予事件监听能力，而且它们都可在`foo(..)`完成时被独立地通知，来执行后续的步骤：

```js
var evt = foo( 42 );

// let `bar(..)` listen to `foo(..)`'s completion
bar( evt );

// also, let `baz(..)` listen to `foo(..)`'s completion
baz( evt );
```

*控制非反转* 导致了更好的 *关注分离*，也就是`bar(..)`和`baz(..)`不必卷入`foo(..)`是如何被调用的问题。相似地，`foo(..)`也不必知道或关心`bar(..)`和`baz(..)`的存在或它们是否在等待`foo(..)`完成的通知。

实质上，这个`evt`对象是一个中立的第三方团体，在分离的关注点之间进行交涉。

#### Promise "Events"

正如你可能已经猜到的，`evt`事件监听能力是一个Promise的类比。

在一个基于Promise的方式中，前面的代码段将会使`foo(..)`创建并返回一个`Promise`实例，而且这个promise将会被传入`bar(..)`和`baz(..)`。

**注意：** 我们监听的Promise解析“事件”并不是严格的事件（虽然它们为了某些目的表现得像事件），而且它们也不被典型地称为`"completion"`或`"error"`。相反，我们用`then(..)`来注册一个`"then"`事件。或者也许更准确地讲，`then(..)`注册了`"fulfillment"`和/或`"rejection"`事件，虽然我们在代码中不会看到这些名词被明确地使用。

考虑：

```js
function foo(x) {
	// start doing something that could take a while

	// construct and return a promise
	return new Promise( function(resolve,reject){
		// eventually, call `resolve(..)` or `reject(..)`,
		// which are the resolution callbacks for
		// the promise.
	} );
}

var p = foo( 42 );

bar( p );

baz( p );
```

**注意：** 在`new Promise( function(..){ .. } )`中展示的模式通常被称为[“揭示构造器（revealing constructor）”](http://domenic.me/2014/02/13/the-revealing-constructor-pattern/)。被传入的函数被立即执行（不会被异步推迟，像`then(..)`的回调那样），而且它被提供了两个参数，我们叫它们`resolve`和`reject`。这些是Promise的解析函数。`resolve(..)`一般表示完成，而`reject(..)`表示拒绝。

你可能猜到了`bar(..)`和`baz(..)`的内部看起来是什么样子：

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

Promise解析没有必要一定发送消息，就像我们将Promise作为 *未来值* 考察时那样。它可以仅仅作为一种流程控制信号，就像前面的代码中那样使用。

另一种表达方式是：

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

**注意：** 如果你以前见过基于Promise的代码，你可能会相信这段代码的最后两行应当写做`p.then( .. ).then( .. )`，使用链接，而不是`p.then(..); p.then(..)`。这将会是两种完全不同的行为，所以要小心！这种区别现在看起来可能不明显，但是它们实际上是我们目前还没有见过的异步模式：分割（splitting）/分叉（forking）。不必担心！本章后面我们会回到这个话题。

与将`p`promise传入`bar(..)`和`baz(..)`相反，我们使用promise来控制`bar(..)`和`baz(..)`何时该运行，如果有这样的时刻。主要区别在于错误处理。

在第一个代码段的方式中，无论`foo(..)`是否成功`bar(..)`都会被调用，它提供自己的后备逻辑，如果被通知`foo(..)`失败了的话。显然，`baz(..)`也是这样做的。

在第二个代码段中，`bar(..)`仅在`foo(..)`成功后才被调用，否则`oopsBar(..)`会被调用。`baz(..)`也是。

两种方式本身都 *对*。但会有一些情况使一种优于另一种。

在这两种方式中，从`foo(..)`返回的promise`p`都被用于控制下一步发生什么。

另外，两个代码段都以对同一个promise`p`调用两次`then(..)`结束，这展示了先前的观点，也就是Promise（一旦被解析）会永远保持相同的解析结果（完成或拒绝），而且可以按需要后续地被监听任意多次。

无论何时`p`被解析，下一步都将总是相同的，包括 *现在* 和 *稍后*。

## Thenable Duck Typing

在Promise的世界中，一个重要的细节是如何确定一个值是否是纯种的Promise。或者更直接地说，一个值会不会像Promise那样动作？

我们知道Promise是由`new Promise(..)`语法构建的，你可能会想`p instanceof Promise`将是一个可以接受的检查。但不幸的是，有几个理由表明它不是完全够用。

主要原因是，你可以从其他浏览器窗口中收到Promise值（iframe等），其他的浏览器窗口会拥有自己的不同于当前窗口/frame的Promise，这种检查将会在定位Promise实例时失效。

另外，一个库或框架可能会选择实现自己的Promise而不是用ES6原生的`Promise`实现。事实上，你很可能在根本没有Promise的老版本浏览器中通过一个库来使用Promise。

当我们在本章稍后讨论Promise的解析过程时，一件事情会愈发明显：为什么识别并同化一个非纯种但相似Promise的值仍然很重要。但目前只需要相信我，它是拼图中很重要的一块。

如此，人们决定识别一个Promise（或像Promise一样动作的某些东西）的方法是定义一种称为“thenable”的东西，也就是任何拥有`then(..)`方法的对象或函数。这种方法假定任何这样的值都是一个符合Promise的thenable。

根据值的形状（存在什么属性）来推测它的“类型”的“类型检查”有一个一般的名称，称为“鸭子类型检查”——“如果它看起来像一只鸭子，并且叫起来相一致鸭子，那么它一定是一只鸭子”（参见本丛书的 *类型与文法*）。所以对thenable的鸭子类型检查可能大致是这样：

```js
if (
	p !== null &&
	(
		typeof p === "object" ||
		typeof p === "function"
	) &&
	typeof p.then === "function"
) {
	// assume it's a thenable!
}
else {
	// not a thenable
}
```

晕！先把将这种逻辑在各种地方实现有点丑陋的事实放在一边不谈，这里还有更多更深层的麻烦。

如果你试着用一个偶然拥有`then(..)`函数的任意对象/函数来完成一个Promise，但你又没想把它当做一个Promise/thenable来对待，你的运气就用光了，因为它会被自动地识别为一个thenable并以特殊的规则来对待（见本章后面的部分）。

如果你不知道一个值上面拥有`then(..)`就更是这样。比如：

```js
var o = { then: function(){} };

// make `v` be `[[Prototype]]`-linked to `o`
var v = Object.create( o );

v.someStuff = "cool";
v.otherStuff = "not so cool";

v.hasOwnProperty( "then" );		// false
```

`v`看起来根本不像是一个Promise或thanable。它只是一个拥有一些属性的直白的对象。你可能只是想要把这个值像其他对象那样传递而已。

但你不知道的是，`v`还`[[Prototype]]`连接着（见本丛书的 *this与对象原型*）另一个对象`o`，在它上面偶然拥有一个`then(..)`。所以thenable鸭子类型检查将会认为并假定`v`是一个thenable。哦。

它甚至不需要直接故意那么做：

```js
Object.prototype.then = function(){};
Array.prototype.then = function(){};

var v1 = { hello: "world" };
var v2 = [ "Hello", "World" ];
```

`v1`和`v2`都将被假定为是thenalbe的。你不能控制或预测是否有其他代码偶然或恶意地将`then(..)`加到`Object.prototype`，`Array.prototype`，或其他任何原生原型上。而且如果这个指定的函数并不将它的任何参数作为回调调用，那么任何用这样的值被解析的Promise都将无声地永远挂起！疯狂。

听起来难以置信或不太可能？也许。

要知道，在ES6之前就有几种广为人知的非Promise库在社区中存在了，而且它们已经偶然拥有了称为`then(..)`的方法。这些库中的一些选择了重命名它们自己的方法来回避冲突（这很烂！）。另一些则因为它们无法改变来回避冲突，简单地降级为“不兼容基于Promise的代码”的不幸状态。

用来劫持原先非保留的——而且听起来完全是通用的——`then`属性名称的标准决议是，没有值（或它的任何委托），无论是过去，现在，还是将来，可以拥有`then(..)`函数，不管是有意的还是偶然的，否则这个值将在Promise系统中被混淆为一个thenable，从而可能产生非常难以追踪的Bug。

**警告：** 我不喜欢我们用thenable的鸭子类型来结束对Promise认知的方式。还有其他的选项，比如“branding”或者甚至是“anti-branding”；我们得到的似乎是一个最差劲儿的妥协。但它并不全是悲观与失望。thenable鸭子类型可以很有用，就像我们马上要看到的。只是要小心，如果thenable鸭子类型将不是Promise的东西误认为是Promise，它就可能成为灾难。

## Promise Trust

我们已经看过了两个强烈的类比，它们解释了Promise可以为我们的异步代码所做的事的不同方面。但如果我们停在这里，我们就可能会错过一个Promise模式建立的最重要的性质：信任。

随着 *未来值* 和 *完成事件* 的类别在我们探索的代码模式中的明确展开，有一个问题依然没有完全明确：Promise是为什么，以及如何被设计为来解决所有我们在第二章“信任问题”一节中提出的 *控制倒转* 的信任问题的。但是只要深挖一点儿，我们就可以发现一些重要的保证，来重建第二章中毁掉的对异步代码的信心！

让我们从复习仅使用回调的代码中的信任问题开始。当你传递一个回调给一个工具`foo(..)`的时候，它可能：

* 调用回调太早
* 调用回调太晚（或根本不调）
* 调用回调太少或太多次
* 没能传递必要的环境/参数
* 吞掉了任何可能发生的错误/异常

Promise的性质被有意地设计为给这些顾虑提供有用的，可复用的答案。

### 调的太早

这种顾虑主要是代码是否会引入Zalgo效应，也就是任务有时会同步完地成，而有时会异步地完成，这将导致竟合状态。

Promise被定义为不能受这种顾虑的影响，因为即便是立即完成的Promise（比如 `new Promise(function(resolve){ resolve(42); })`）也不可能被同步地 *监听*。

也就是说，但你在Promise上调用`then(..)`的时候，即便这个Promise已经被解析了，你给`then(..)`提供的回调也将 *总是* 被异步地调用（更多关于这里的内容，参照第一章的"Jobs"）。

不必再插入你自己的`setTimeout(..,0)`绝招了。Promise自动地防止了Zalgo效应。

### 调的太晚

和前面一点相似，在`resolve(..)`或`reject(..)`被Promise创建能力调用时，一个Promise的`then(..)`上注册的监听回调将自动地被排程。这些被排程好的回调将在下一个异步时刻被可预测地触发（参照第一章的"Jobs"）。

同步监听是不可能的，所以不可能有一个同步的任务链的运行来“推迟”另一个回调的发生。也就是说，当一个Promise被解析时，所有在`then(..)`上注册的回调都将被立即，按顺序地，在下一个异步机会时被调用（再一次，参照第一章的"Jobs"），而且没有任何在这些回调中发生的事情可以影响/推迟其他回调的调用。

举例来说：

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

这里，有赖于Promise如何定义操作，`"C"`不可能干扰并优先于`"B"`。

#### Promise Scheduling Quirks

重要并需要注意的是，排程有许多微妙的地方：链接在两个分离的Promise上的回调之间的相对顺序，是不能可靠预测的。

如果两个promise`p1`和`p2`都准备好被解析了，那么`p1.then(..); p2.then(..)`应当归结为首先调用`p1`的回调，然后调用`p2`的。但有一些微妙的情形可能会使这不成立，比如下面这样：

```js
var p3 = new Promise( function(resolve,reject){
	resolve( "B" );
} );

var p1 = new Promise( function(resolve,reject){
	resolve( p3 );
} );

var p2 = new Promise( function(resolve,reject){
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

我们稍后会更多地讲解这个问题，但如你所见，`p1`不是被一个立即值所解析的，而是由另一个promise`p3`所解析，而`p3`本身被一个值`"B"`所解析。这种指定的行为将`p3`*展开* 到`p1`，但是是异步地，所以在异步工作队列中`p1`的回调位于`p2`的回调之后（参照第一章的"Jobs"）。

为了回避这样的微妙的噩梦，你绝不应该依靠任何跨Promise的回调顺序/排程。事实上，一个好的实践方式是在代码中根本不要让多个回调的顺序成为问题。尽可能回避它。

### 根本不调回调

这是一个很常见的顾虑。Promise用几种方式解决它。

首先，没有任何东西（JS错误都不能）可以阻止一个Promise通知你它的解析（如果它被解析了的话）。如果你在一个Promise上同时注册了完成和拒绝回调，而且这个Promise被解析了，两个回调中的一个总会被调用。

当然，如果你的回调本身有JS错误，你可能不会看到你期望的输出，但是回调事实上已经被调用了。我们待会儿就会讲到如何在你的回调中收到关于一个错误的通知，因为就算是那些也不会被吞掉。

那如果Promise本身不管怎样永远没有被解析呢？即便是这种状态Promise也给出了答案，使用一个称为“竞赛（race）”的高级抽象。

```js
// a utility for timing out a Promise
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
	timeoutPromise( 3000 )	// give it 3 seconds
] )
.then(
	function(){
		// `foo(..)` fulfilled in time!
	},
	function(err){
		// either `foo()` rejected, or it just
		// didn't finish in time, so inspect
		// `err` to know which
	}
);
```

这种Promise的超时模式有更多的细节需要考虑，但我们待会儿再回头讨论。

重要的是，我们可以确保一个信号作为`foo(..)`的结果，来防止它无限地挂起我们的程序。

### 调太少或太多次

根据定义，对于被调用的回调来讲 *一次* 是一个合适的次数。“太少”的情况将会是0次，和我们刚刚考察的从不调用是相同的。

“太多”的情况则很容易解释。Promise被定义为只能被解析一次。如果因为某些原因，Promise的创建代码试着调用`resolve(..)`或`reject(..)`许多次，或者试着同时调用它们俩，Promise将仅接受第一次解析，而无声地忽略后续的尝试。

因为一个Promise仅能被解析一次，所以任何`then(..)`上注册的回调将仅仅被调用一次（每个）。

当然，如果你把同一个回调注册多次（比如`p.then(f); p.then(f);`），那么它就会被调用注册的那么多次。响应函数仅被调用一次的保证并不能防止你搬起石头砸自己的脚。

### 没能传入任何参数/环境

Promise可以拥有最多一个解析值（完成或拒绝）。

如果无论怎样你没有用一个值明确地解析它，它的值就是`undefined`，就像JS中典型的那样。但不管是什么值，它总是会被传入所有被注册的（并且适当地：完成或拒绝）回调中，不管是 *现在* 还是将来。

需要意识到的是：如果你使用多个参数调用`resolve(..)`或`reject(..)`，所有第一个参数之外的后续参数都会被无声地忽略。虽然这看起来违反了我们刚才描述的保证，但并不确切，因为它构成了一种Promise机制的无效使用方式。其他的API无效使用方式（比如调用`resolve(..)`许多次）也都相似地 *被保护*，所以Promise的行为在这里是一致的（除了有一点点让人沮丧）。

如果你想传递多个值，你必须将它们包装在另一个单独的值中，比如一个`array`或一个`object`。

至于环境，JS中的函数总是保持他们被定义时所在作用域的闭包（见本系列的 *作用域与闭包*），所以它们当然地可以继续访问你提供的环境状态。当然，这对仅使用回调的设计来讲也是对的，所以这不能算是Promise带来的增益——但尽管如此，它依然是我们可以依赖的保证。

### 吞掉所有错误/异常

在基本的感觉上，这是前一点的重述。如果你用一个 *理由*（也就是错误消息）拒绝一个Promise，这个值就会被传入拒绝的回调。

但是这里有一个更重大的事情。如果在Promise的创建过程中的任意一点，或者在监听它的解析的过程中，一个JS异常错误发生的话，比如`TypeError`或`ReferenceError`，这个异常将会被捕获，并且强制当前的Promise变为拒绝。

举例来说：

```js
var p = new Promise( function(resolve,reject){
	foo.bar();	// `foo` is not defined, so error!
	resolve( 42 );	// never gets here :(
} );

p.then(
	function fulfilled(){
		// never gets here :(
	},
	function rejected(err){
		// `err` will be a `TypeError` exception object
		// from the `foo.bar()` line.
	}
);
```

在`foo.bar()`上发生的JS异常变成了一个你可以捕获并响应的Promise拒绝。

这是一个重要的细节，因为它有效地解决了另一种潜在的Zalgo时刻，也就是错误可能会产生一个同步的反应，而没有错误的部分还是异步的。Promise甚至将JS异常都转化为异步行为，因此极大地降低了发生竟合状态的可能性。

但是如果Promise完成了，但是在监听过程中（在一个`then(..)`上注册的回调上）出现了JS异常错误会怎样呢？即便是那些也不会丢失，但你可能会发现处理它们的方式有些令人诧异，除非你深挖一些：

```js
var p = new Promise( function(resolve,reject){
	resolve( 42 );
} );

p.then(
	function fulfilled(msg){
		foo.bar();
		console.log( msg );	// never gets here :(
	},
	function rejected(err){
		// never gets here either :(
	}
);
```

等一下，这看起来`foo.bar()`发生的异常确实被吞掉了。不要害怕，它没有。但更深层次的东西出问题了，也就是我们没能成功地监听他。`p.then(..)`调用本身返回另一个promise，而且是 *这个* promise将会被`TypeError`异常拒绝。

为什么它不能调用我们在这里定义的错误处理器呢？表面上看起来是一个逻辑行为。但它会违反Promise一旦被解析就 **不可变** 的基本原则。`p`已经完成为值`42`，所以它不能因为在监听`p`的解析时发生了错误，而在稍后变成一个拒绝。

除了违反原则，这样的行为还可能造成破坏，假如说有多个在promise`p`上注册的`then(..)`回调，因为有些会被调用而有些不会，而且至于为什么是很明显的。

### Trustable Promise?

为了基于Promise模式建立信任，还有最后一个细节需要考察。

无疑你已经注意到了，Promise根本没有摆脱回调。它们只是改变了回调传递的位置。与将一个回调传入`foo(..)`相反，我们从`foo(..)`那里拿回 *某些东西* （表面上是一个纯粹的Promise），然后我们将回调传入这个 *东西*。

但为什么这要比仅使用回调的方式更可靠呢？我们如何确信我们拿回来的 *某些东西* 事实上是一个可靠的Promise？这难道不是说我们相信它仅仅因为我们已经相信它了吗？

一个Promise经常被忽视，但是最重要的细节之一，就是它也为这个问题给出了解决方案。包含在原生的ES6`Promise`实现中，它就是`Promise.resolve(..)`。

如果你传递一个立即的，非Promise得，非thenable的值给`Promise.resolve(..)`，你会得到一个用这个值完成的promise。换句话说，下面两个promise`p1`和`p2`的行为基本上会完全相同：

```js
var p1 = new Promise( function(resolve,reject){
	resolve( 42 );
} );

var p2 = Promise.resolve( 42 );
```

但如果你传递一个纯粹的Promise给`Promise.resolve(..)`，你会得到这个完全相同的promise：

```js
var p1 = Promise.resolve( 42 );

var p2 = Promise.resolve( p1 );

p1 === p2; // true
```

更重要的是，如果你传递一个非Promise的thenable值给`Promise.resolve(..)`，它会试着将这个值展开，而且直到抽出一个最终具体的非Promise值之前，展开操作将会一直继续下去。

还记得我们先前讨论的thenable吗？

考虑这段代码：

```js
var p = {
	then: function(cb) {
		cb( 42 );
	}
};

// this works OK, but only by good fortune
p
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// never gets here
	}
);
```

这个`p`是一个thenable，但它不是一个纯粹的Promise。很走运，它是合理的，正如大多数情况那样。但是如果你得到的是看起来像这样的东西：

```js
var p = {
	then: function(cb,errcb) {
		cb( 42 );
		errcb( "evil laugh" );
	}
};

p
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// oops, shouldn't have run
		console.log( err ); // evil laugh
	}
);
```

这个`p`是一个thenable，但它不是表现良好的promise。它是恶意的吗？或者它只是不知道Promise应当如何工作？老实说，这不重要。不管哪种情况，它都不那么可靠。

尽管如此，我们可以将这两个版本的`p`传入`Promise.resolve(..)`，而且我们将会得到一个我们期望的泛化，安全的结果：

```js
Promise.resolve( p )
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// never gets here
	}
);
```

`Promise.resolve(..)`会接受任何thenable，而且将它展开至非thenable值。但你会从`Promise.resolve(..)`那里得到一个真正的，纯粹的Promise，**一个你可以信任的东西**。如果你传入的东西已经是一个纯粹的Promise了，那么你会单纯地将它拿回来，所以通过`Promise.resolve(..)`过滤来得到信任没有任何坏处。

那么我们假定，我们在调用一个`foo(..)`工具，而且不能确定我们能相信它的返回值是一个行为规范的Promise，但我们知道它至少是一个thenable。`Promise.resolve(..)`将会给我们一个可靠的Promise包装器来进行链式调用：

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

**注意：** 将任意函数的返回值（thenable或不是thenable）包装在`Promise.resolve(..)`中的另一个好的副作用是，它可以很容易地将函数调用泛化为一个行为规范的异步任务。如果`foo(42)`有时返回一个立即值，而其他时候返回一个Promise，`Promise.resolve(foo(42))`，将确保它总是返回Promise。并且使代码成为回避Zalgo效应的更好的代码。

### Trust Built

希望前面的讨论现在是你完全理解了Promise是可靠的，而且更重要的，为什么信任对于建造强壮，可维护的软件来说是如此关键。

没有信任，你能用JS编写异步代码吗？你当然能。我们JS开发者在除了回调以外没有任何东西的情况下，写了将近20年的异步代码了。

但是一旦你开始质疑你到底能够以多大的程度相信你的底层机制，它实际上多么可预见，多么可靠，你就会开始理解回调有一个多么摇摇欲坠的信任基础。

Promise是一个用可靠语义来增强回调的模式，所以它的行为更合理更可靠。通过将回调的 *控制倒转* 反置过来，我们将控制交给一个可靠的系统（Promise），它是为了将你的异步处理进行清晰的表达而特意设计的。

## Chain Flow

我们已经被暗示过几次，但Promise不仅是是一个单步的 *这个然后那个* 操作机制。当然，那是构建块儿，但事实证明我们可以将多个Promise串联在一起来表达一系列的异步步骤。

使这一切能够工作的关键，是Promise的两个固有行为：

* 每次你在一个Promise上调用`then(..)`的时候，它都创建并返回一个新的Promise，我们可以在它上面进行链接。
* 无论你从`then(..)`调用的完成回调中（第一个参数）返回什么值，它都做为被链接的Promise的完成。

我们首先来描绘一下这是什么意思，然后我们将会衍生出它是如何帮助我们创建异步顺序的控制流程的。考虑下面的代码：

```js
var p = Promise.resolve( 21 );

var p2 = p.then( function(v){
	console.log( v );	// 21

	// fulfill `p2` with value `42`
	return v * 2;
} );

// chain off `p2`
p2.then( function(v){
	console.log( v );	// 42
} );
```

通过返回`v * 2`（也就是`42`），我们完成了由第一个`then(..)`调用创建并返回的`p2`promise。当`p2`的`then(..)`调用运行时，它从`return v * 2`语句那里收到完成信号。当然，`p2.then(..)`还会创建另一个promise，我们将它存储在变量`p3`中。

但是不得不创建临时变量`p2`（或`p3`等）有点儿恼人。谢天谢地，我们可以简单地将这些链接在一起：

```js
var p = Promise.resolve( 21 );

p
.then( function(v){
	console.log( v );	// 21

	// fulfill the chained promise with value `42`
	return v * 2;
} )
// here's the chained promise
.then( function(v){
	console.log( v );	// 42
} );
```

那么现在以第一个`then(..)`是异步序列的第一步，而第二个`then(..)`就是第二部。它可以根据你的需要延伸至任意远。只要持续不断地用每个自动创建的Promise在前一个`then(..)`末尾进行连接即可。

但是这里错过了某些东西。要是我们想让第2步等待第1步去做一些异步的事情呢？我们使用的是一个立即的`return`语句，它立即完成了链接中的promise。

使Promise序列在每一步上都是真正异步的关键，需要回忆一下当你向`Promise.resolve(..)`传递一个Promise或thenable而非一个最终值时，它如何操作。`Promise.resolve(..)`会直接返回收到的纯粹Promise，或者它会展开收到的thenable的值——并且它会递归地持续展开thenable。

如果你从完成（或拒绝）处理器中返回一个thenable或Promise，同样的展开操作也会发生。考虑：

```js
var p = Promise.resolve( 21 );

p.then( function(v){
	console.log( v );	// 21

	// create a promise and return it
	return new Promise( function(resolve,reject){
		// fulfill with value `42`
		resolve( v * 2 );
	} );
} )
.then( function(v){
	console.log( v );	// 42
} );
```

即便我们把`42`包装在一个我们返回的promise中，它依然会被展开并作为promise链的解析，如此第二个`then(..)`仍然收到`42`。如果我们在这个包装promise中引入异步，一切还是会同样正常的工作：

```js
var p = Promise.resolve( 21 );

p.then( function(v){
	console.log( v );	// 21

	// create a promise to return
	return new Promise( function(resolve,reject){
		// introduce asynchrony!
		setTimeout( function(){
			// fulfill with value `42`
			resolve( v * 2 );
		}, 100 );
	} );
} )
.then( function(v){
	// runs after the 100ms delay in the previous step
	console.log( v );	// 42
} );
```

这真是强大到不可思议！现在我们可以构建一个序列，它可以有我们想要的任意多的步骤，而且每一步都可以按照需要来推迟下一步（或者不推迟）。

当然，在这些例子中一步一步向下传递的值是可选的。如果你没有返回一个明确的值，那么它假定一个隐式的`undefined`，而且promise依然会以同样的方式链接在一起。如此，每个Promise的解析只不过是进行至下一步的信号。

为了演示更长的链接，让我们把推迟Promise的创建泛化为一个我们可以在多个步骤中复用的工具：

```js
function delay(time) {
	return new Promise( function(resolve,reject){
		setTimeout( resolve, time );
	} );
}

delay( 100 ) // step 1
.then( function STEP2(){
	console.log( "step 2 (after 100ms)" );
	return delay( 200 );
} )
.then( function STEP3(){
	console.log( "step 3 (after another 200ms)" );
} )
.then( function STEP4(){
	console.log( "step 4 (next Job)" );
	return delay( 50 );
} )
.then( function STEP5(){
	console.log( "step 5 (after another 50ms)" );
} )
...
```

调用`delay(200)`创建了一个将在200ms内完成的promise，然后我们在第一个`then(..)`的完成回调中返回它，这将使第二个`then(..)`的promise等待这个200ms的promise。

**注意：** 正如刚才描述的，技术上讲在这个交替中有两个promise：一个200ms延迟的promise，和一个被第二个`then(..)`链接的promise。但你可能会发现将这两个promise组合在一起更容易思考，因为Promise机制帮你把它们的状态自动地混合到了一起。从这个角度讲，你可以认为`return delay(200)`创建了一个promise来取代早前一个返回的被链接的promise。

老实说，没有任何消息进行传递的一系列延迟作为Promise流程控制的例子不是很有用。让我们来看一个更加实在的场景：

与计时器不同，让我们考虑发起Ajax请求：

```js
// assume an `ajax( {url}, {callback} )` utility

// Promise-aware ajax
function request(url) {
	return new Promise( function(resolve,reject){
		// the `ajax(..)` callback should be our
		// promise's `resolve(..)` function
		ajax( url, resolve );
	} );
}
```

我们首先定义一个`request(..)`工具，它构建一个promise表示`ajax(..)`调用的完成：

```js
request( "http://some.url.1/" )
.then( function(response1){
	return request( "http://some.url.2/?v=" + response1 );
} )
.then( function(response2){
	console.log( response2 );
} );
```

**注意：** 开发者们通常遭遇的一种情况是，它们想用本身不支持Promise的工具（就像这里的`ajax(..)`，它期待一个回调）进行Promise式的异步流程控制。虽然ES6原生的`Promise`机制不会自动帮我们解决这种模式，但是实践中所有的Promise库会帮我们这么做。它们通常称这种处理为“提升”或“promise化”或其他的什么名词。我们稍后再回到这种技术。

使用返回Promise的`request(..)`，通过用第一个URL调用它，我们在链条中隐式地创建了第一步，然后我们用第一个`then(..)`在返回的promise末尾进行连接。

一旦`response1`返回，我们用它的值来构建第二个URL，并且发起第二个`request(..)`调用。这第二个`promise`是`return`的，所以我们的异步流程控制的第三步将会等待这个Ajax调用完成。最终，一旦`response2`返回，我们就打印它。

我们构建的Promise链不仅是一个表达多步骤异步序列的流程控制，它还扮演者将消息从一步传递到下一步的消息管道。

要是Promise链中的某一步出错了会怎样呢？一个错误/异常是基于每个Promise的，意味着在链条的任意一点捕获这些错误是可能的，而且这些捕获操作在那一点上将链条“重置”，使它回到正常的操作上来：

```js
// step 1:
request( "http://some.url.1/" )

// step 2:
.then( function(response1){
	foo.bar(); // undefined, error!

	// never gets here
	return request( "http://some.url.2/?v=" + response1 );
} )

// step 3:
.then(
	function fulfilled(response2){
		// never gets here
	},
	// rejection handler to catch the error
	function rejected(err){
		console.log( err );	// `TypeError` from `foo.bar()` error
		return 42;
	}
)

// step 4:
.then( function(msg){
	console.log( msg );		// 42
} );
```

当错误在第2步中发生时，第3步的拒绝处理器将它捕获。拒绝处理器的返回值（在这个代码段里是`42`），如果有的话，将会完成下一步（第4步）的promise，如此整个链条又回到完成的状态。

**注意：** 就像我们刚才讨论过的，当我们从一个完成处理器中返回一个promise时，它会被展开并有可能推迟下一步。这对从拒绝处理器中返回的promise也是成立的，这样如果我们在第3步返回一个promise而不是`return 42`，那么这个promise就可能会推迟第4步。不管是在`then(..)`的完成还是拒绝处理器中，一个被抛出的异常都将导致下一个（链接着的）promise立即用这个异常拒绝。

如果你在一个promise上调用`then(..)`，而且你只向他传递了一个完成处理器，一个假定的拒绝处理器会取而代之：

```js
var p = new Promise( function(resolve,reject){
	reject( "Oops" );
} );

var p2 = p.then(
	function fulfilled(){
		// never gets here
	}
	// assumed rejection handler, if omitted or
	// any other non-function value passed
	// function(err) {
	//     throw err;
	// }
);
```

如你所见，这个假定的拒绝处理器仅仅简单地重新抛出错误，它最终强制`p2`（链接着的promise）用同样的错误进行拒绝。实质上，它允许错误持续地在Promise链上传播，知道遇到一个明确定义的拒绝处理器。

**注意：** 稍后我们会讲到更多关于使用Promise进行错误处理的细节，因为会有更多微妙的细节需要关心。

如果没有一个恰当合法的函数作为`then(..)`的完成处理器参数，也会有一个默认的处理器取而代之：

```js
var p = Promise.resolve( 42 );

p.then(
	// assumed fulfillment handler, if omitted or
	// any other non-function value passed
	// function(v) {
	//     return v;
	// }
	null,
	function rejected(err){
		// never gets here
	}
);
```

如你所见，默认的完成处理器简单地将它收到的任何值传递给下一步（Promise）。

**注意：** `then(null,function(err){ .. })`这种模式——仅处理拒绝（如果发生的话）但让成功通过——有一个缩写的API：`catch(function(err){ .. })`。我们会在下一节中更全面地涵盖`catch(..)`。

然我们简要地复习一下使链式流程控制成为可能的Promise固有行为：

* 在一个Promise上的`then(..)`调用会自动生成一个新的Promise并返回。
* 在完成/拒绝处理器内部，如果你返回一个值或抛出一个异常，新返回的Promise（可以被链接的）将会相应地被解析。
* 如果完成或拒绝处理器返回一个Promise，它会被展开，所以无论它被解析为什么值，这个值都将变成从当前的`then(..)`返
回的被链接的Promise的解析。

虽然链式流程控制很有用，但是将它认为是Promise的组合方式的副作用可能最准确，而不是它的主要意图。正如我们已经详细讨论过许多次的，Promise泛化了异步处理并且包装了与时间相关的值和状态，这才是让我们以这种有用的方式将它们链接在一起的原因。

当然，相对于我们在第二章中看到的一堆混乱的回调，这种链条的顺序表达是一个巨大的改进。但是仍然要蹚过相当多的模板代码（`then(..)` and `function(){ .. }`）。在下一章中，我们将看到一种极大美化顺序流程控制的表达模式，生成器（generators）。

### Terminology: Resolve, Fulfill, and Reject

在你更多深入地学习Promise之前，在“解析（resolve）”，“完成（fulfill）”，和“拒绝（reject）”这些名词之间还有一些我们需要辨明的小困惑。首先让我们考虑一下`Promise(..)`构造器：

```js
var p = new Promise( function(X,Y){
	// X() for fulfillment
	// Y() for rejection
} );
```

如你所见，有两个回调（标识为`X`和`Y`）被提供了。第一个 *通常* 用于表示Promise完成了，而第二个 *总是* 表示Promise拒绝了。但 *通常* 是什么意思，它对这些参数的正确命名暗示着什么呢？

最终，这只是你的用户代码和将被引擎翻译为没有任何含义的东西的标识符，所以在 *技术上* 它无紧要；`foo(..)`和`bar(..)`在功能性上是相等的。但是你用的词不仅会影响你如何考虑这段代码，还会影响你所在团队的其他开发者如何考虑它。将精心策划的异步代码错误地考虑，几乎可以说要比面条一般的回调还要差劲儿。

所以，某种意义上你如何称呼它们很关键。

第二个参数很容易决定。几乎所有的文献都使用`reject(..)`做为它的名称，应为这正是它（唯一！）要做的，对于命名来说这是一个很好的选择。我也强烈推荐你一直使用`reject(..)`。

但是关于第一个参数还是有些带有歧义，它在许多Promise的文献中常被标识为`resolve(..)`。这个词明显地是与“resolution（解析）”有关，它在所有的文献中（包括本书）广泛用于描述给Promise设定一个最终的值/状态。我们已经使用“解析Promise（resolve the Promise）”许多次来意味Promise的完成（fulfilling）或拒绝（rejecting）。

但是如果这个参数看起来被用于特指Promise的完成，为什么我们不更准确地叫它`fulfill(..)`，而是用`resolve(..)`呢？要回答这个问题，让我们看一下`Promise`的两个API方法：

```js
var fulfilledPr = Promise.resolve( 42 );

var rejectedPr = Promise.reject( "Oops" );
```

`Promise.resolve(..)`创建了一个Promise，它被解析为它被给予的值。在这个例子中，`42`是一个一般的，非Promise，非thenable的值，所以完成的promise`fulfilledPr`是为值`42`创建的。`Promise.reject("Oops")`为了原因`"Oops"`创建拒绝的promise`rejectedPr`。

现在让我们来解释为什么如果“resolve”这个词（正如`Promise.resolve(..)`里的）被明确用于一个既可能完成也可能拒绝的环境时，它没有歧义，反而更加准确：

```js
var rejectedTh = {
	then: function(resolved,rejected) {
		rejected( "Oops" );
	}
};

var rejectedPr = Promise.resolve( rejectedTh );
```

就像我们在本章前面讨论的，`Promise.resolve(..)`将会直接返回收到的纯粹的Promise，或者将收到的thenable展开。如果展开这个thenable之后是一个拒绝状态，那么从`Promise.resolve(..)`返回的Promise事实上是相同的拒绝状态。

所以对于这个API方法来说，`Promise.resolve(..)`是一个好的，准确的名称，因为它实际上既可以得到完成的结果，也可以得到拒绝的结果。

`Promise(..)`构造器的第一个参数既可以展开一个thenable（与`Promise.resolve(..)`相同），也可以展开一个Promise：

```js
var rejectedPr = new Promise( function(resolve,reject){
	// resolve this promise with a rejected promise
	resolve( Promise.reject( "Oops" ) );
} );

rejectedPr.then(
	function fulfilled(){
		// never gets here
	},
	function rejected(err){
		console.log( err );	// "Oops"
	}
);
```

现在应当清楚了，对于`Promise(..)`构造器的第一个参数来说`resolve(..)`是一个合适的名称。

**警告：** 前面提到的`reject(..)` **不会** 像`resolve(..)`那样进行展开。如果你向`reject(..)`传递一个Promise/thenable值，这个没有被碰过的值将作为拒绝的理由。一个后续的拒绝处理器将会受到你传递给`reject(..)`的实际的Promise/thenable，而不是它的底层立即值。

现在让我们将注意力转向提供给`then(..)`的回调。它们应当叫什么（在文献和代码中）？我的建议是`fulfilled(..)`和`rejected(..)`：

```js
function fulfilled(msg) {
	console.log( msg );
}

function rejected(err) {
	console.error( err );
}

p.then(
	fulfilled,
	rejected
);
```

对于`then(..)`的第一个参数的情况，它没有歧义地总是完成状态，所以没有必要使用带有双重意义的“resolve”术语。另一方面，ES6语言规范中使用`onFulfilled(..)`和`onRejected(..)` 来标识这两个回调，所以它们是准确的术语。

## Error Handling

我们已经看过几个例子，Promise拒绝——既可以通过有意调用`reject(..)`，也可以通过以外的JS异常——是如何在异步编程中允许清晰的错误处理的。让我们兜个圈子回去，将我们敷衍过的一些细节弄清楚。

对大多数开发者来说，最自然的错误处理形式是同步的`try..catch`结构。不幸的是，它仅能用于同步状态，所以在异步代码模式中它帮不上什么忙：

```js
function foo() {
	setTimeout( function(){
		baz.bar();
	}, 100 );
}

try {
	foo();
	// later throws global error from `baz.bar()`
}
catch (err) {
	// never gets here
}
```

能有`try..catch`当然很好，但除非有某些附加的环境支持，它无法与异步操作一起工作。我们将会在第四章中讨论生成器是回到这个话题。

在回调中，对于错误处理的模式已经有了一些新兴的标准，最有名的就是“错误优先回到”风格：

```js
function foo(cb) {
	setTimeout( function(){
		try {
			var x = baz.bar();
			cb( null, x ); // success!
		}
		catch (err) {
			cb( err );
		}
	}, 100 );
}

foo( function(err,val){
	if (err) {
		console.error( err ); // bummer :(
	}
	else {
		console.log( val );
	}
} );
```

**注意：** 这里的`try..catch`仅在`baz.bar()`调用立即地，同步地成功或失败时才能工作。如果`baz.bar()`本身是一个异步完成的函数，它内部的任何异步错误都不能被捕获。

我们传递给`foo(..)`的回调期望通过保留的`err`参数收到一个表示错误的信号。如果存在，就假定出错。如果不存在，就假定成功。

这类错误处理在技术上是 *异步兼容的*，但它根本组织的不好。用无处不在的`if`语句检查将多层错误优先回调编织在一起，将不可避免地将你置于回调地狱的危险之中。

那么我们回到Promise的错误处理，使用传递给`then(..)`的拒绝处理器。Promise不使用流行的“错误优先回调”设计风格，反而使用“分割回调”的风格；一个回调给完成，一个回调给拒绝：

```js
var p = Promise.reject( "Oops" );

p.then(
	function fulfilled(){
		// never gets here
	},
	function rejected(err){
		console.log( err ); // "Oops"
	}
);
```

虽然这种模式表面上看起来十分有道理，但是Promise错误处理的微妙之处经常使它有点儿相当难以全面把握。

考虑下面的代码：

```js
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// numbers don't have string functions,
		// so will throw an error
		console.log( msg.toLowerCase() );
	},
	function rejected(err){
		// never gets here
	}
);
```

如果`msg.toLowerCase()`合法地抛出一个错误（它会的！），为什么我们的错误处理器没有得到通知？正如我们早先解释的，这是因为 *这个* 错误处理器是为`p`promise准备的，也就是已经被值`42`完成的那个promise。`p`promise是不可变的，所以唯一可以得到错误通知的promise是由`p.then(..)`返回的那个，而在这里我们没有捕获它。

这应当描绘了一幅清晰的画面：为什么Promise的错误处理是易错的。错误太容易被吞掉了，而这很少是你有意做的。

**警告：** 如果你以一种不合法的方式使用Promise API，而且有错误阻止正常的Promise构建，其结果将是一个立即被抛出的异常，**而不是一个拒绝Promise**。这是一些导致Promise构建失败的错误用法：`new Promise(null)`，`Promise.all()`，`Promise.race(42)`等等。如果你没有足够合法地使用Promise API来首先实际构建一个Promise，你就不能得到一个拒绝Promise！

### Pit of Despair

Jeff Atwood noted years ago: programming languages are often set up in such a way that by default, developers fall into the "pit of despair" (http://blog.codinghorror.com/falling-into-the-pit-of-success/) -- where accidents are punished -- and that you have to try harder to get it right. He implored us to instead create a "pit of success," where by default you fall into expected (successful) action, and thus would have to try hard to fail.

几年前Jeff Atwood曾经写到：编程语言总是默认地以这样的方式建立，开发者们会掉入“绝望的深渊”（http://blog.codinghorror.com/falling-into-the-pit-of-success/）——在这里意外会被惩罚——而你不得不更努力地使它正确。他恳求我们相反地创建“成功的深渊”，就是你会默认地掉入期望的（成功的）行为，而如此你不得不更努力地去失败。

Promise error handling is unquestionably "pit of despair" design. By default, it assumes that you want any error to be swallowed by the Promise state, and if you forget to observe that state, the error silently languishes/dies in obscurity -- usually despair.

毫无疑问，Promise的错误处理是一种“绝望的深渊”的设计。默认情况下，它假定你想让所有的错误都被Promise的状态吞掉，而且如果你忘记监听这个状态，错误就会默默地凋零/死去——通常是绝望的。

To avoid losing an error to the silence of a forgotten/discarded Promise, some developers have claimed that a "best practice" for Promise chains is to always end your chain with a final `catch(..)`, like:

```js
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// numbers don't have string functions,
		// so will throw an error
		console.log( msg.toLowerCase() );
	}
)
.catch( handleErrors );
```

Because we didn't pass a rejection handler to the `then(..)`, the default handler was substituted, which simply propagates the error to the next promise in the chain. As such, both errors that come into `p`, and errors that come *after* `p` in its resolution (like the `msg.toLowerCase()` one) will filter down to the final `handleErrors(..)`.

Problem solved, right? Not so fast!

What happens if `handleErrors(..)` itself also has an error in it? Who catches that? There's still yet another unattended promise: the one `catch(..)` returns, which we don't capture and don't register a rejection handler for.

You can't just stick another `catch(..)` on the end of that chain, because it too could fail. The last step in any Promise chain, whatever it is, always has the possibility, even decreasingly so, of dangling with an uncaught error stuck inside an unobserved Promise.

Sound like an impossible conundrum yet?

### Uncaught Handling

It's not exactly an easy problem to solve completely. There are other ways to approach it which many would say are *better*.

Some Promise libraries have added methods for registering something like a "global unhandled rejection" handler, which would be called instead of a globally thrown error. But their solution for how to identify an error as "uncaught" is to have an arbitrary-length timer, say 3 seconds, running from time of rejection. If a Promise is rejected but no error handler is registered before the timer fires, then it's assumed that you won't ever be registering a handler, so it's "uncaught."

In practice, this has worked well for many libraries, as most usage patterns don't typically call for significant delay between Promise rejection and observation of that rejection. But this pattern is troublesome because 3 seconds is so arbitrary (even if empirical), and also because there are indeed some cases where you want a Promise to hold on to its rejectedness for some indefinite period of time, and you don't really want to have your "uncaught" handler called for all those false positives (not-yet-handled "uncaught errors").

Another more common suggestion is that Promises should have a `done(..)` added to them, which essentially marks the Promise chain as "done." `done(..)` doesn't create and return a Promise, so the callbacks passed to `done(..)` are obviously not wired up to report problems to a chained Promise that doesn't exist.

So what happens instead? It's treated as you might usually expect in uncaught error conditions: any exception inside a `done(..)` rejection handler would be thrown as a global uncaught error (in the developer console, basically):

```js
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// numbers don't have string functions,
		// so will throw an error
		console.log( msg.toLowerCase() );
	}
)
.done( null, handleErrors );

// if `handleErrors(..)` caused its own exception, it would
// be thrown globally here
```

This might sound more attractive than the never-ending chain or the arbitrary timeouts. But the biggest problem is that it's not part of the ES6 standard, so no matter how good it sounds, at best it's a lot longer way off from being a reliable and ubiquitous solution.

Are we just stuck, then? Not entirely.

Browsers have a unique capability that our code does not have: they can track and know for sure when any object gets thrown away and garbage collected. So, browsers can track Promise objects, and whenever they get garbage collected, if they have a rejection in them, the browser knows for sure this was a legitimate "uncaught error," and can thus confidently know it should report it to the developer console.

**Note:** At the time of this writing, both Chrome and Firefox have early attempts at that sort of "uncaught rejection" capability, though support is incomplete at best.

However, if a Promise doesn't get garbage collected -- it's exceedingly easy for that to accidentally happen through lots of different coding patterns -- the browser's garbage collection sniffing won't help you know and diagnose that you have a silently rejected Promise laying around.

Is there any other alternative? Yes.

### Pit of Success

The following is just theoretical, how Promises *could* be someday changed to behave. I believe it would be far superior to what we currently have. And I think this change would be possible even post-ES6 because I don't think it would break web compatibility with ES6 Promises. Moreover, it can be polyfilled/prollyfilled in, if you're careful. Let's take a look:

* Promises could default to reporting (to the developer console) any rejection, on the next Job or event loop tick, if at that exact moment no error handler has been registered for the Promise.
* For the cases where you want a rejected Promise to hold onto its rejected state for an indefinite amount of time before observing, you could call `defer()`, which suppresses automatic error reporting on that Promise.

If a Promise is rejected, it defaults to noisily reporting that fact to the developer console (instead of defaulting to silence). You can opt out of that reporting either implicitly (by registering an error handler before rejection), or explicitly (with `defer()`). In either case, *you* control the false positives.

Consider:

```js
var p = Promise.reject( "Oops" ).defer();

// `foo(..)` is Promise-aware
foo( 42 )
.then(
	function fulfilled(){
		return p;
	},
	function rejected(err){
		// handle `foo(..)` error
	}
);
...
```

When we create `p`, we know we're going to wait a while to use/observe its rejection, so we call `defer()` -- thus no global reporting. `defer()` simply returns the same promise, for chaining purposes.

The promise returned from `foo(..)` gets an error handler attached *right away*, so it's implicitly opted out and no global reporting for it occurs either.

But the promise returned from the `then(..)` call has no `defer()` or error handler attached, so if it rejects (from inside either resolution handler), then *it* will be reported to the developer console as an uncaught error.

**This design is a pit of success.** By default, all errors are either handled or reported -- what almost all developers in almost all cases would expect. You either have to register a handler or you have to intentionally opt out, and indicate you intend to defer error handling until *later*; you're opting for the extra responsibility in just that specific case.

The only real danger in this approach is if you `defer()` a Promise but then fail to actually ever observe/handle its rejection.

But you had to intentionally call `defer()` to opt into that pit of despair -- the default was the pit of success -- so there's not much else we could do to save you from your own mistakes.

I think there's still hope for Promise error handling (post-ES6). I hope the powers that be will rethink the situation and consider this alternative. In the meantime, you can implement this yourself (a challenging exercise for the reader!), or use a *smarter* Promise library that does so for you!

**Note:** This exact model for error handling/reporting is implemented in my *asynquence* Promise abstraction library, which will be discussed in Appendix A of this book.

## Promise Patterns

We've already implicitly seen the sequence pattern with Promise chains (this-then-this-then-that flow control) but there are lots of variations on asynchronous patterns that we can build as abstractions on top of Promises. These patterns serve to simplify the expression of async flow control -- which helps make our code more reason-able and more maintainable -- even in the most complex parts of our programs.

Two such patterns are codified directly into the native ES6 `Promise` implementation, so we get them for free, to use as building blocks for other patterns.

### Promise.all([ .. ])

In an async sequence (Promise chain), only one async task is being coordinated at any given moment -- step 2 strictly follows step 1, and step 3 strictly follows step 2. But what about doing two or more steps concurrently (aka "in parallel")?

In classic programming terminology, a "gate" is a mechanism that waits on two or more parallel/concurrent tasks to complete before continuing. It doesn't matter what order they finish in, just that all of them have to complete for the gate to open and let the flow control through.

In the Promise API, we call this pattern `all([ .. ])`.

Say you wanted to make two Ajax requests at the same time, and wait for both to finish, regardless of their order, before making a third Ajax request. Consider:

```js
// `request(..)` is a Promise-aware Ajax utility,
// like we defined earlier in the chapter

var p1 = request( "http://some.url.1/" );
var p2 = request( "http://some.url.2/" );

Promise.all( [p1,p2] )
.then( function(msgs){
	// both `p1` and `p2` fulfill and pass in
	// their messages here
	return request(
		"http://some.url.3/?v=" + msgs.join(",")
	);
} )
.then( function(msg){
	console.log( msg );
} );
```

`Promise.all([ .. ])` expects a single argument, an `array`, consisting generally of Promise instances. The promise returned from the `Promise.all([ .. ])` call will receive a fulfillment message (`msgs` in this snippet) that is an `array` of all the fulfillment messages from the passed in promises, in the same order as specified (regardless of fulfillment order).

**Note:** Technically, the `array` of values passed into `Promise.all([ .. ])` can include Promises, thenables, or even immediate values. Each value in the list is essentially passed through `Promise.resolve(..)` to make sure it's a genuine Promise to be waited on, so an immediate value will just be normalized into a Promise for that value. If the `array` is empty, the main Promise is immediately fulfilled.

The main promise returned from `Promise.all([ .. ])` will only be fulfilled if and when all its constituent promises are fulfilled. If any one of those promises instead is rejected, the main `Promise.all([ .. ])` promise is immediately rejected, discarding all results from any other promises.

Remember to always attach a rejection/error handler to every promise, even and especially the one that comes back from `Promise.all([ .. ])`.

### Promise.race([ .. ])

While `Promise.all([ .. ])` coordinates multiple Promises concurrently and assumes all are needed for fulfillment, sometimes you only want to respond to the "first Promise to cross the finish line," letting the other Promises fall away.

This pattern is classically called a "latch," but in Promises it's called a "race."

**Warning:** While the metaphor of "only the first across the finish line wins" fits the behavior well, unfortunately "race" is kind of a loaded term, because "race conditions" are generally taken as bugs in programs (see Chapter 1). Don't confuse `Promise.race([ .. ])` with "race condition."

`Promise.race([ .. ])` also expects a single `array` argument, containing one or more Promises, thenables, or immediate values. It doesn't make much practical sense to have a race with immediate values, because the first one listed will obviously win -- like a foot race where one runner starts at the finish line!

Similar to `Promise.all([ .. ])`, `Promise.race([ .. ])` will fulfill if and when any Promise resolution is a fulfillment, and it will reject if and when any Promise resolution is a rejection.

**Warning:** A "race" requires at least one "runner," so if you pass an empty `array`, instead of immediately resolving, the main `race([..])` Promise will never resolve. This is a footgun! ES6 should have specified that it either fulfills, rejects, or just throws some sort of synchronous error. Unfortunately, because of precedence in Promise libraries predating ES6 `Promise`, they had to leave this gotcha in there, so be careful never to send in an empty `array`.

Let's revisit our previous concurrent Ajax example, but in the context of a race between `p1` and `p2`:

```js
// `request(..)` is a Promise-aware Ajax utility,
// like we defined earlier in the chapter

var p1 = request( "http://some.url.1/" );
var p2 = request( "http://some.url.2/" );

Promise.race( [p1,p2] )
.then( function(msg){
	// either `p1` or `p2` will win the race
	return request(
		"http://some.url.3/?v=" + msg
	);
} )
.then( function(msg){
	console.log( msg );
} );
```

Because only one promise wins, the fulfillment value is a single message, not an `array` as it was for `Promise.all([ .. ])`.

#### Timeout Race

We saw this example earlier, illustrating how `Promise.race([ .. ])` can be used to express the "promise timeout" pattern:

```js
// `foo()` is a Promise-aware function

// `timeoutPromise(..)`, defined ealier, returns
// a Promise that rejects after a specified delay

// setup a timeout for `foo()`
Promise.race( [
	foo(),					// attempt `foo()`
	timeoutPromise( 3000 )	// give it 3 seconds
] )
.then(
	function(){
		// `foo(..)` fulfilled in time!
	},
	function(err){
		// either `foo()` rejected, or it just
		// didn't finish in time, so inspect
		// `err` to know which
	}
);
```

This timeout pattern works well in most cases. But there are some nuances to consider, and frankly they apply to both `Promise.race([ .. ])` and `Promise.all([ .. ])` equally.

#### "Finally"

The key question to ask is, "What happens to the promises that get discarded/ignored?" We're not asking that question from the performance perspective -- they would typically end up garbage collection eligible -- but from the behavioral perspective (side effects, etc.). Promises cannot be canceled -- and shouldn't be as that would destroy the external immutability trust discussed in the "Promise Uncancelable" section later in this chapter -- so they can only be silently ignored.

But what if `foo()` in the previous example is reserving some sort of resource for usage, but the timeout fires first and causes that promise to be ignored? Is there anything in this pattern that proactively frees the reserved resource after the timeout, or otherwise cancels any side effects it may have had? What if all you wanted was to log the fact that `foo()` timed out?

Some developers have proposed that Promises need a `finally(..)` callback registration, which is always called when a Promise resolves, and allows you to specify any cleanup that may be necessary. This doesn't exist in the specification at the moment, but it may come in ES7+. We'll have to wait and see.

It might look like:

```js
var p = Promise.resolve( 42 );

p.then( something )
.finally( cleanup )
.then( another )
.finally( cleanup );
```

**Note:** In various Promise libraries, `finally(..)` still creates and returns a new Promise (to keep the chain going). If the `cleanup(..)` function were to return a Promise, it would be linked into the chain, which means you could still have the unhandled rejection issues we discussed earlier.

In the meantime, we could make a static helper utility that lets us observe (without interfering) the resolution of a Promise:

```js
// polyfill-safe guard check
if (!Promise.observe) {
	Promise.observe = function(pr,cb) {
		// side-observe `pr`'s resolution
		pr.then(
			function fulfilled(msg){
				// schedule callback async (as Job)
				Promise.resolve( msg ).then( cb );
			},
			function rejected(err){
				// schedule callback async (as Job)
				Promise.resolve( err ).then( cb );
			}
		);

		// return original promise
		return pr;
	};
}
```

Here's how we'd use it in the timeout example from before:

```js
Promise.race( [
	Promise.observe(
		foo(),					// attempt `foo()`
		function cleanup(msg){
			// clean up after `foo()`, even if it
			// didn't finish before the timeout
		}
	),
	timeoutPromise( 3000 )	// give it 3 seconds
] )
```

This `Promise.observe(..)` helper is just an illustration of how you could observe the completions of Promises without interfering with them. Other Promise libraries have their own solutions. Regardless of how you do it, you'll likely have places where you want to make sure your Promises aren't *just* silently ignored by accident.

### Variations on all([ .. ]) and race([ .. ])

While native ES6 Promises come with built-in `Promise.all([ .. ])` and `Promise.race([ .. ])`, there are several other commonly used patterns with variations on those semantics:

* `none([ .. ])` is like `all([ .. ])`, but fulfillments and rejections are transposed. All Promises need to be rejected -- rejections become the fulfillment values and vice versa.
* `any([ .. ])` is like `all([ .. ])`, but it ignores any rejections, so only one needs to fulfill instead of *all* of them.
* `first([ .. ])` is a like a race with `any([ .. ])`, which is that it ignores any rejections and fulfills as soon as the first Promise fulfills.
* `last([ .. ])` is like `first([ .. ])`, but only the latest fulfillment wins.

Some Promise abstraction libraries provide these, but you could also define them yourself using the mechanics of Promises, `race([ .. ])` and `all([ .. ])`.

For example, here's how we could define `first([ .. ])`:

```js
// polyfill-safe guard check
if (!Promise.first) {
	Promise.first = function(prs) {
		return new Promise( function(resolve,reject){
			// loop through all promises
			prs.forEach( function(pr){
				// normalize the value
				Promise.resolve( pr )
				// whichever one fulfills first wins, and
				// gets to resolve the main promise
				.then( resolve );
			} );
		} );
	};
}
```

**Note:** This implementation of `first(..)` does not reject if all its promises reject; it simply hangs, much like a `Promise.race([])` does. If desired, you could add additional logic to track each promise rejection and if all reject, call `reject()` on the main promise. We'll leave that as an exercise for the reader.

### Concurrent Iterations

Sometimes you want to iterate over a list of Promises and perform some task against all of them, much like you can do with synchronous `array`s (e.g., `forEach(..)`, `map(..)`, `some(..)`, and `every(..)`). If the task to perform against each Promise is fundamentally synchronous, these work fine, just as we used `forEach(..)` in the previous snippet.

But if the tasks are fundamentally asynchronous, or can/should otherwise be performed concurrently, you can use async versions of these utilities as provided by many libraries.

For example, let's consider an asynchronous `map(..)` utility that takes an `array` of values (could be Promises or anything else), plus a function (task) to perform against each. `map(..)` itself returns a promise whose fulfillment value is an `array` that holds (in the same mapping order) the async fulfillment value from each task:

```js
if (!Promise.map) {
	Promise.map = function(vals,cb) {
		// new promise that waits for all mapped promises
		return Promise.all(
			// note: regular array `map(..)`, turns
			// the array of values into an array of
			// promises
			vals.map( function(val){
				// replace `val` with a new promise that
				// resolves after `val` is async mapped
				return new Promise( function(resolve){
					cb( val, resolve );
				} );
			} )
		);
	};
}
```

**Note:** In this implementation of `map(..)`, you can't signal async rejection, but if a synchronous exception/error occurs inside of the mapping callback (`cb(..)`), the main `Promise.map(..)` returned promise would reject.

Let's illustrate using `map(..)` with a list of Promises (instead of simple values):

```js
var p1 = Promise.resolve( 21 );
var p2 = Promise.resolve( 42 );
var p3 = Promise.reject( "Oops" );

// double values in list even if they're in
// Promises
Promise.map( [p1,p2,p3], function(pr,done){
	// make sure the item itself is a Promise
	Promise.resolve( pr )
	.then(
		// extract value as `v`
		function(v){
			// map fulfillment `v` to new value
			done( v * 2 );
		},
		// or, map to promise rejection message
		done
	);
} )
.then( function(vals){
	console.log( vals );	// [42,84,"Oops"]
} );
```

## Promise API Recap

Let's review the ES6 `Promise` API that we've already seen unfold in bits and pieces throughout this chapter.

**Note:** The following API is native only as of ES6, but there are specification-compliant polyfills (not just extended Promise libraries) which can define `Promise` and all its associated behavior so that you can use native Promises even in pre-ES6 browsers. One such polyfill is "Native Promise Only" (http://github.com/getify/native-promise-only), which I wrote!

### new Promise(..) Constructor

The *revealing constructor* `Promise(..)` must be used with `new`, and must be provided a function callback that is synchronously/immediately called. This function is passed two function callbacks that act as resolution capabilities for the promise. We commonly label these `resolve(..)` and `reject(..)`:

```js
var p = new Promise( function(resolve,reject){
	// `resolve(..)` to resolve/fulfill the promise
	// `reject(..)` to reject the promise
} );
```

`reject(..)` simply rejects the promise, but `resolve(..)` can either fulfill the promise or reject it, depending on what it's passed. If `resolve(..)` is passed an immediate, non-Promise, non-thenable value, then the promise is fulfilled with that value.

But if `resolve(..)` is passed a genuine Promise or thenable value, that value is unwrapped recursively, and whatever its final resolution/state is will be adopted by the promise.

### Promise.resolve(..) and Promise.reject(..)

A shortcut for creating an already-rejected Promise is `Promise.reject(..)`, so these two promises are equivalent:

```js
var p1 = new Promise( function(resolve,reject){
	reject( "Oops" );
} );

var p2 = Promise.reject( "Oops" );
```

`Promise.resolve(..)` is usually used to create an already-fulfilled Promise in a similar way to `Promise.reject(..)`. However, `Promise.resolve(..)` also unwraps thenable values (as discussed several times already). In that case, the Promise returned adopts the final resolution of the thenable you passed in, which could either be fulfillment or rejection:

```js
var fulfilledTh = {
	then: function(cb) { cb( 42 ); }
};
var rejectedTh = {
	then: function(cb,errCb) {
		errCb( "Oops" );
	}
};

var p1 = Promise.resolve( fulfilledTh );
var p2 = Promise.resolve( rejectedTh );

// `p1` will be a fulfilled promise
// `p2` will be a rejected promise
```

And remember, `Promise.resolve(..)` doesn't do anything if what you pass is already a genuine Promise; it just returns the value directly. So there's no overhead to calling `Promise.resolve(..)` on values that you don't know the nature of, if one happens to already be a genuine Promise.

### then(..) and catch(..)

Each Promise instance (**not** the `Promise` API namespace) has `then(..)` and `catch(..)` methods, which allow registering of fulfillment and rejection handlers for the Promise. Once the Promise is resolved, one or the other of these handlers will be called, but not both, and it will always be called asynchronously (see "Jobs" in Chapter 1).

`then(..)` takes one or two parameters, the first for the fulfillment callback, and the second for the rejection callback. If either is omitted or is otherwise passed as a non-function value, a default callback is substituted respectively. The default fulfillment callback simply passes the message along, while the default rejection callback simply rethrows (propagates) the error reason it receives.

`catch(..)` takes only the rejection callback as a parameter, and automatically substitutes the default fulfillment callback, as just discussed. In other words, it's equivalent to `then(null,..)`:

```js
p.then( fulfilled );

p.then( fulfilled, rejected );

p.catch( rejected ); // or `p.then( null, rejected )`
```

`then(..)` and `catch(..)` also create and return a new promise, which can be used to express Promise chain flow control. If the fulfillment or rejection callbacks have an exception thrown, the returned promise is rejected. If either callback returns an immediate, non-Promise, non-thenable value, that value is set as the fulfillment for the returned promise. If the fulfillment handler specifically returns a promise or thenable value, that value is unwrapped and becomes the resolution of the returned promise.

### Promise.all([ .. ]) and Promise.race([ .. ])

The static helpers `Promise.all([ .. ])` and `Promise.race([ .. ])` on the ES6 `Promise` API both create a Promise as their return value. The resolution of that promise is controlled entirely by the array of promises that you pass in.

For `Promise.all([ .. ])`, all the promises you pass in must fulfill for the returned promise to fulfill. If any promise is rejected, the main returned promise is immediately rejected, too (discarding the results of any of the other promises). For fulfillment, you receive an `array` of all the passed in promises' fulfillment values. For rejection, you receive just the first promise rejection reason value. This pattern is classically called a "gate": all must arrive before the gate opens.

For `Promise.race([ .. ])`, only the first promise to resolve (fulfillment or rejection) "wins," and whatever that resolution is becomes the resolution of the returned promise. This pattern is classically called a "latch": first one to open the latch gets through. Consider:

```js
var p1 = Promise.resolve( 42 );
var p2 = Promise.resolve( "Hello World" );
var p3 = Promise.reject( "Oops" );

Promise.race( [p1,p2,p3] )
.then( function(msg){
	console.log( msg );		// 42
} );

Promise.all( [p1,p2,p3] )
.catch( function(err){
	console.error( err );	// "Oops"
} );

Promise.all( [p1,p2] )
.then( function(msgs){
	console.log( msgs );	// [42,"Hello World"]
} );
```

**Warning:** Be careful! If an empty `array` is passed to `Promise.all([ .. ])`, it will fulfill immediately, but `Promise.race([ .. ])` will hang forever and never resolve.

The ES6 `Promise` API is pretty simple and straightforward. It's at least good enough to serve the most basic of async cases, and is a good place to start when rearranging your code from callback hell to something better.

But there's a whole lot of async sophistication that apps often demand which Promises themselves will be limited in addressing. In the next section, we'll dive into those limitations as motivations for the benefit of Promise libraries.

## Promise Limitations

Many of the details we'll discuss in this section have already been alluded to in this chapter, but we'll just make sure to review these limitations specifically.

### Sequence Error Handling

We covered Promise-flavored error handling in detail earlier in this chapter. The limitations of how Promises are designed -- how they chain, specifically -- creates a very easy pitfall where an error in a Promise chain can be silently ignored accidentally.

But there's something else to consider with Promise errors. Because a Promise chain is nothing more than its constituent Promises wired together, there's no entity to refer to the entire chain as a single *thing*, which means there's no external way to observe any errors that may occur.

If you construct a Promise chain that has no error handling in it, any error anywhere in the chain will propagate indefinitely down the chain, until observed (by registering a rejection handler at some step). So, in that specific case, having a reference to the *last* promise in the chain is enough (`p` in the following snippet), because you can register a rejection handler there, and it will be notified of any propagated errors:

```js
// `foo(..)`, `STEP2(..)` and `STEP3(..)` are
// all promise-aware utilities

var p = foo( 42 )
.then( STEP2 )
.then( STEP3 );
```

Although it may seem sneakily confusing, `p` here doesn't point to the first promise in the chain (the one from the `foo(42)` call), but instead from the last promise, the one that comes from the `then(STEP3)` call.

Also, no step in the promise chain is observably doing its own error handling. That means that you could then register a rejection error handler on `p`, and it would be notified if any errors occur anywhere in the chain:

```
p.catch( handleErrors );
```

But if any step of the chain in fact does its own error handling (perhaps hidden/abstracted away from what you can see), your `handleErrors(..)` won't be notified. This may be what you want -- it was, after all, a "handled rejection" -- but it also may *not* be what you want. The complete lack of ability to be notified (of "already handled" rejection errors) is a limitation that restricts capabilities in some use cases.

It's basically the same limitation that exists with a `try..catch` that can catch an exception and simply swallow it. So this isn't a limitation **unique to Promises**, but it *is* something we might wish to have a workaround for.

Unfortunately, many times there is no reference kept for the intermediate steps in a Promise-chain sequence, so without such references, you cannot attach error handlers to reliably observe the errors.

### Single Value

Promises by definition only have a single fulfillment value or a single rejection reason. In simple examples, this isn't that big of a deal, but in more sophisticated scenarios, you may find this limiting.

The typical advice is to construct a values wrapper (such as an `object` or `array`) to contain these multiple messages. This solution works, but it can be quite awkward and tedious to wrap and unwrap your messages with every single step of your Promise chain.

#### Splitting Values

Sometimes you can take this as a signal that you could/should decompose the problem into two or more Promises.

Imagine you have a utility `foo(..)` that produces two values (`x` and `y`) asynchronously:

```js
function getY(x) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			resolve( (3 * x) - 1 );
		}, 100 );
	} );
}

function foo(bar,baz) {
	var x = bar * baz;

	return getY( x )
	.then( function(y){
		// wrap both values into container
		return [x,y];
	} );
}

foo( 10, 20 )
.then( function(msgs){
	var x = msgs[0];
	var y = msgs[1];

	console.log( x, y );	// 200 599
} );
```

First, let's rearrange what `foo(..)` returns so that we don't have to wrap `x` and `y` into a single `array` value to transport through one Promise. Instead, we can wrap each value into its own promise:

```js
function foo(bar,baz) {
	var x = bar * baz;

	// return both promises
	return [
		Promise.resolve( x ),
		getY( x )
	];
}

Promise.all(
	foo( 10, 20 )
)
.then( function(msgs){
	var x = msgs[0];
	var y = msgs[1];

	console.log( x, y );
} );
```

Is an `array` of promises really better than an `array` of values passed through a single promise? Syntactically, it's not much of an improvement.

But this approach more closely embraces the Promise design theory. It's now easier in the future to refactor to split the calculation of `x` and `y` into separate functions. It's cleaner and more flexible to let the calling code decide how to orchestrate the two promises -- using `Promise.all([ .. ])` here, but certainly not the only option -- rather than to abstract such details away inside of `foo(..)`.

#### Unwrap/Spread Arguments

The `var x = ..` and `var y = ..` assignments are still awkward overhead. We can employ some functional trickery (hat tip to Reginald Braithwaite, @raganwald on Twitter) in a helper utility:

```js
function spread(fn) {
	return Function.apply.bind( fn, null );
}

Promise.all(
	foo( 10, 20 )
)
.then(
	spread( function(x,y){
		console.log( x, y );	// 200 599
	} )
)
```

That's a bit nicer! Of course, you could inline the functional magic to avoid the extra helper:

```js
Promise.all(
	foo( 10, 20 )
)
.then( Function.apply.bind(
	function(x,y){
		console.log( x, y );	// 200 599
	},
	null
) );
```

These tricks may be neat, but ES6 has an even better answer for us: destructuring. The array destructuring assignment form looks like this:

```js
Promise.all(
	foo( 10, 20 )
)
.then( function(msgs){
	var [x,y] = msgs;

	console.log( x, y );	// 200 599
} );
```

But best of all, ES6 offers the array parameter destructuring form:

```js
Promise.all(
	foo( 10, 20 )
)
.then( function([x,y]){
	console.log( x, y );	// 200 599
} );
```

We've now embraced the one-value-per-Promise mantra, but kept our supporting boilerplate to a minimum!

**Note:** For more information on ES6 destructuring forms, see the *ES6 & Beyond* title of this series.

### Single Resolution

One of the most intrinsic behaviors of Promises is that a Promise can only be resolved once (fulfillment or rejection). For many async use cases, you're only retrieving a value once, so this works fine.

But there's also a lot of async cases that fit into a different model -- one that's more akin to events and/or streams of data. It's not clear on the surface how well Promises can fit into such use cases, if at all. Without a significant abstraction on top of Promises, they will completely fall short for handling multiple value resolution.

Imagine a scenario where you might want to fire off a sequence of async steps in response to a stimulus (like an event) that can in fact happen multiple times, like a button click.

This probably won't work the way you want:

```js
// `click(..)` binds the `"click"` event to a DOM element
// `request(..)` is the previously defined Promise-aware Ajax

var p = new Promise( function(resolve,reject){
	click( "#mybtn", resolve );
} );

p.then( function(evt){
	var btnID = evt.currentTarget.id;
	return request( "http://some.url.1/?id=" + btnID );
} )
.then( function(text){
	console.log( text );
} );
```

The behavior here only works if your application calls for the button to be clicked just once. If the button is clicked a second time, the `p` promise has already been resolved, so the second `resolve(..)` call would be ignored.

Instead, you'd probably need to invert the paradigm, creating a whole new Promise chain for each event firing:

```js
click( "#mybtn", function(evt){
	var btnID = evt.currentTarget.id;

	request( "http://some.url.1/?id=" + btnID )
	.then( function(text){
		console.log( text );
	} );
} );
```

This approach will *work* in that a whole new Promise sequence will be fired off for each `"click"` event on the button.

But beyond just the ugliness of having to define the entire Promise chain inside the event handler, this design in some respects violates the idea of separation of concerns/capabilities (SoC). You might very well want to define your event handler in a different place in your code from where you define the *response* to the event (the Promise chain). That's pretty awkward to do in this pattern, without helper mechanisms.

**Note:** Another way of articulating this limitation is that it'd be nice if we could construct some sort of "observable" that we can subscribe a Promise chain to. There are libraries that have created these abstractions (such as RxJS -- http://rxjs.codeplex.com/), but the abstractions can seem so heavy that you can't even see the nature of Promises anymore. Such heavy abstraction brings important questions to mind such as whether (sans Promises) these mechanisms are as *trustable* as Promises themselves have been designed to be. We'll revisit the "Observable" pattern in Appendix B.

### Inertia

One concrete barrier to starting to use Promises in your own code is all the code that currently exists which is not already Promise-aware. If you have lots of callback-based code, it's far easier to just keep coding in that same style.

"A code base in motion (with callbacks) will remain in motion (with callbacks) unless acted upon by a smart, Promises-aware developer."

Promises offer a different paradigm, and as such, the approach to the code can be anywhere from just a little different to, in some cases, radically different. You have to be intentional about it, because Promises will not just naturally shake out from the same ol' ways of doing code that have served you well thus far.

Consider a callback-based scenario like the following:

```js
function foo(x,y,cb) {
	ajax(
		"http://some.url.1/?x=" + x + "&y=" + y,
		cb
	);
}

foo( 11, 31, function(err,text) {
	if (err) {
		console.error( err );
	}
	else {
		console.log( text );
	}
} );
```

Is it immediately obvious what the first steps are to convert this callback-based code to Promise-aware code? Depends on your experience. The more practice you have with it, the more natural it will feel. But certainly, Promises don't just advertise on the label exactly how to do it -- there's no one-size-fits-all answer -- so the responsibility is up to you.

As we've covered before, we definitely need an Ajax utility that is Promise-aware instead of callback-based, which we could call `request(..)`. You can make your own, as we have already. But the overhead of having to manually define Promise-aware wrappers for every callback-based utility makes it less likely you'll choose to refactor to Promise-aware coding at all.

Promises offer no direct answer to that limitation. Most Promise libraries do offer a helper, however. But even without a library, imagine a helper like this:

```js
// polyfill-safe guard check
if (!Promise.wrap) {
	Promise.wrap = function(fn) {
		return function() {
			var args = [].slice.call( arguments );

			return new Promise( function(resolve,reject){
				fn.apply(
					null,
					args.concat( function(err,v){
						if (err) {
							reject( err );
						}
						else {
							resolve( v );
						}
					} )
				);
			} );
		};
	};
}
```

OK, that's more than just a tiny trivial utility. However, although it may look a bit intimidating, it's not as bad as you'd think. It takes a function that expects an error-first style callback as its last parameter, and returns a new one that automatically creates a Promise to return, and substitutes the callback for you, wired up to the Promise fulfillment/rejection.

Rather than waste too much time talking about *how* this `Promise.wrap(..)` helper works, let's just look at how we use it:

```js
var request = Promise.wrap( ajax );

request( "http://some.url.1/" )
.then( .. )
..
```

Wow, that was pretty easy!

`Promise.wrap(..)` does **not** produce a Promise. It produces a function that will produce Promises. In a sense, a Promise-producing function could be seen as a "Promise factory." I propose "promisory" as the name for such a thing ("Promise" + "factory").

The act of wrapping a callback-expecting function to be a Promise-aware function is sometimes referred to as "lifting" or "promisifying". But there doesn't seem to be a standard term for what to call the resultant function other than a "lifted function", so I like "promisory" better as I think it's more descriptive.

**Note:** Promisory isn't a made-up term. It's a real word, and its definition means to contain or convey a promise. That's exactly what these functions are doing, so it turns out to be a pretty perfect terminology match!

So, `Promise.wrap(ajax)` produces an `ajax(..)` promisory we call `request(..)`, and that promisory produces Promises for Ajax responses.

If all functions were already promisories, we wouldn't need to make them ourselves, so the extra step is a tad bit of a shame. But at least the wrapping pattern is (usually) repeatable so we can put it into a `Promise.wrap(..)` helper as shown to aid our promise coding.

So back to our earlier example, we need a promisory for both `ajax(..)` and `foo(..)`:

```js
// make a promisory for `ajax(..)`
var request = Promise.wrap( ajax );

// refactor `foo(..)`, but keep it externally
// callback-based for compatibility with other
// parts of the code for now -- only use
// `request(..)`'s promise internally.
function foo(x,y,cb) {
	request(
		"http://some.url.1/?x=" + x + "&y=" + y
	)
	.then(
		function fulfilled(text){
			cb( null, text );
		},
		cb
	);
}

// now, for this code's purposes, make a
// promisory for `foo(..)`
var betterFoo = Promise.wrap( foo );

// and use the promisory
betterFoo( 11, 31 )
.then(
	function fulfilled(text){
		console.log( text );
	},
	function rejected(err){
		console.error( err );
	}
);
```

Of course, while we're refactoring `foo(..)` to use our new `request(..)` promisory, we could just make `foo(..)` a promisory itself, instead of remaining callback-based and needing to make and use the subsequent `betterFoo(..)` promisory. This decision just depends on whether `foo(..)` needs to stay callback-based compatible with other parts of the code base or not.

Consider:

```js
// `foo(..)` is now also a promisory because it
// delegates to the `request(..)` promisory
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

foo( 11, 31 )
.then( .. )
..
```

While ES6 Promises don't natively ship with helpers for such promisory wrapping, most libraries provide them, or you can make your own. Either way, this particular limitation of Promises is addressable without too much pain (certainly compared to the pain of callback hell!).

### Promise Uncancelable

Once you create a Promise and register a fulfillment and/or rejection handler for it, there's nothing external you can do to stop that progression if something else happens to make that task moot.

**Note:** Many Promise abstraction libraries provide facilities to cancel Promises, but this is a terrible idea! Many developers wish Promises had natively been designed with external cancelation capability, but the problem is that it would let one consumer/observer of a Promise affect some other consumer's ability to observe that same Promise. This violates the future-value's trustability (external immutability), but morever is the embodiment of the "action at a distance" anti-pattern (http://en.wikipedia.org/wiki/Action_at_a_distance_%28computer_programming%29). Regardless of how useful it seems, it will actually lead you straight back into the same nightmares as callbacks.

Consider our Promise timeout scenario from earlier:

```js
var p = foo( 42 );

Promise.race( [
	p,
	timeoutPromise( 3000 )
] )
.then(
	doSomething,
	handleError
);

p.then( function(){
	// still happens even in the timeout case :(
} );
```

The "timeout" was external to the promise `p`, so `p` itself keeps going, which we probably don't want.

One option is to invasively define your resolution callbacks:

```js
var OK = true;

var p = foo( 42 );

Promise.race( [
	p,
	timeoutPromise( 3000 )
	.catch( function(err){
		OK = false;
		throw err;
	} )
] )
.then(
	doSomething,
	handleError
);

p.then( function(){
	if (OK) {
		// only happens if no timeout! :)
	}
} );
```

This is ugly. It works, but it's far from ideal. Generally, you should try to avoid such scenarios.

But if you can't, the ugliness of this solution should be a clue that *cancelation* is a functionality that belongs at a higher level of abstraction on top of Promises. I'd recommend you look to Promise abstraction libraries for assistance rather than hacking it yourself.

**Note:** My *asynquence* Promise abstraction library provides just such an abstraction and an `abort()` capability for the sequence, all of which will be discussed in Appendix A.

A single Promise is not really a flow-control mechanism (at least not in a very meaningful sense), which is exactly what *cancelation* refers to; that's why Promise cancelation would feel awkward.

By contrast, a chain of Promises taken collectively together -- what I like to call a "sequence" -- *is* a flow control expression, and thus it's appropriate for cancelation to be defined at that level of abstraction.

No individual Promise should be cancelable, but it's sensible for a *sequence* to be cancelable, because you don't pass around a sequence as a single immutable value like you do with a Promise.

### Promise Performance

This particular limitation is both simple and complex.

Comparing how many pieces are moving with a basic callback-based async task chain versus a Promise chain, it's clear Promises have a fair bit more going on, which means they are naturally at least a tiny bit slower. Think back to just the simple list of trust guarantees that Promises offer, as compared to the ad hoc solution code you'd have to layer on top of callbacks to achieve the same protections.

More work to do, more guards to protect, means that Promises *are* slower as compared to naked, untrustable callbacks. That much is obvious, and probably simple to wrap your brain around.

But how much slower? Well... that's actually proving to be an incredibly difficult question to answer absolutely, across the board.

Frankly, it's kind of an apples-to-oranges comparison, so it's probably the wrong question to ask. You should actually compare whether an ad-hoc callback system with all the same protections manually layered in is faster than a Promise implementation.

If Promises have a legitimate performance limitation, it's more that they don't really offer a line-item choice as to which trustability protections you want/need or not -- you get them all, always.

Nevertheless, if we grant that a Promise is generally a *little bit slower* than its non-Promise, non-trustable callback equivalent -- assuming there are places where you feel you can justify the lack of trustability -- does that mean that Promises should be avoided across the board, as if your entire application is driven by nothing but must-be-utterly-the-fastest code possible?

Sanity check: if your code is legitimately like that, **is JavaScript even the right language for such tasks?** JavaScript can be optimized to run applications very performantly (see Chapter 5 and Chapter 6). But is obsessing over tiny performance tradeoffs with Promises, in light of all the benefits they offer, *really* appropriate?

Another subtle issue is that Promises make *everything* async, which means that some immediately (synchronously) complete steps still defer advancement of the next step to a Job (see Chapter 1). That means that it's possible that a sequence of Promise tasks could complete ever-so-slightly slower than the same sequence wired up with callbacks.

Of course, the question here is this: are these potential slips in tiny fractions of performance *worth* all the other articulated benefits of Promises we've laid out across this chapter?

My take is that in virtually all cases where you might think Promise performance is slow enough to be concerned, it's actually an anti-pattern to optimize away the benefits of Promise trustability and composability by avoiding them altogether.

Instead, you should default to using them across the code base, and then profile and analyze your application's hot (critical) paths. Are Promises *really* a bottleneck, or are they just a theoretical slowdown? Only *then*, armed with actual valid benchmarks (see Chapter 6) is it responsible and prudent to factor out the Promises in just those identified critical areas.

Promises are a little slower, but in exchange you're getting a lot of trustability, non-Zalgo predictability, and composability built in. Maybe the limitation is not actually their performance, but your lack of perception of their benefits?

## Review

Promises are awesome. Use them. They solve the *inversion of control* issues that plague us with callbacks-only code.

They don't get rid of callbacks, they just redirect the orchestration of those callbacks to a trustable intermediary mechanism that sits between us and another utility.

Promise chains also begin to address (though certainly not perfectly) a better way of expressing async flow in sequential fashion, which helps our brains plan and maintain async JS code better. We'll see an even better solution to *that* problem in the next chapter!
