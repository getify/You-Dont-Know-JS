# 你不懂JS: 异步与性能
# 第三章: Promises

在第二章中，我们定位了在使用回调表达程序异步性和管理并发的两个主要类别的不足：缺乏顺序性和缺乏可靠性。现在我们更亲近地理解了问题，是时候将我们的注意力转向解决它们的模式了。

我们首先想要解决的是 *控制倒转* 问题，信任是如此脆弱而且是如此的容易丢失。

回想一下，我们将我们的程序的延续包装进一个回调函数中，将这个回调交给另一个团体（甚至是潜在的外部代码），并双手合十祈祷它会做正确的事情并调用这个回调。

我们这么做是因为我们想说，“这是 *稍后* 将要发生的事，在当前的步骤完成之后。”

但是如果我们能够反向倒转这种 *控制倒转* 呢？如果不是将我们程序的延续交给另一个团体，而是希望它返回给我们一个可以知道它何时完成的能力，然后我们的代码可以决定下一步做什么呢？

这种规范被称为 **Promise**。

Promise正在像风暴一样席卷JS世界，因为开发者和语言规范作者之流拼命地想要在他们的代码/设计中结束回调地狱的疯狂。事实上，大多数新被加入JS/DOM平台的异步API都是建立在Promise之上的。所以深入学习它们可能是个好主意，你不这么认为吗？

**注意：** “立即”这个词将在本章频繁使用，一般来说它指代一些Promise解析行为。然而，本质上在所有情况下，“立即”意味着就工作队列行为（参见第一章）而言，不是严格同步的 *现在* 的感觉。

## 什么是Promise？

当开发者们决定要学习一种新技术或模式的时候，他们的第一步总是“给我看代码！”。摸着石头过河对我们来讲是十分自然的。

但事实上仅仅考察API丢失了一些抽象过程。Promise是这样一种工具：它能非常明显地看出使用者是否理解了它是为什么和关于什么，还是仅仅学习和使用API。

所以在我展示Promise的代码之前，我想在概念上完整地解释一下Promise到底是什么。我希望这能更好地指引你探索如何将Promise理论整合到你自己的异步流程中。

带着这样的想法，让我们来看两种类比，来解释Promise是什么。

### 未来的值

想象这样的场景：我走到快餐店的柜台前，点了一个起士汉堡。并交了1.47美元的现金。通过点餐和付款，我为得到一个 *值*（起士汉堡）制造了一个请求。我发起了一个事务。

但是通常来说，起士汉堡不会立即到我手中。收银员交给一些东西代替我的起士汉堡：一个带有点餐排队号的收据。这个点餐号是一个“我欠你”的许诺（Promise），它保证我最终会得到我的起士汉堡。

于是我就拿着我的收据和点餐号。我知道它代表我的 *未来的起士汉堡*，所以我无需再担心它——除了挨饿！

在我等待的时候，我可以做其他的事情，比如给我的朋友发微信说，“嘿，一块儿吃午餐吗？我要吃起士汉堡”。

我已经在用我的 *未来的起士汉堡* 进行推理了，即便它还没有到我手中。我的大脑可以这么做是因为它将点餐号作为起士汉堡的占位符号。这个占位符号实质上使这个值 *与时间无关*。它是一个 **未来的值**。

最终，我听到，“113号！”。于是我愉快地拿着收据走回柜台前。我把收据递给收银员，拿回我的起士汉堡。

换句话说，一旦我的 *未来的值* 准备好，我就用我的许诺值换回值本身。

但还有另外一种可能的输出。它们叫我的号，但当我去取起士汉堡时，收银员遗憾地告诉我，“对不起，看起来我们的起士汉堡卖光了。”把这种场景下顾客有多沮丧放在一边，我们可以看到 *未来的值* 的一个重要性质：它们既可以表示成功也可以表示失败。

每次我点起士汉堡时，我都知道我要么最终得到一个起士汉堡，要么得到起士汉堡卖光的坏消息，并且不得不考虑中午吃点儿别的东西。

**注意：** 在代码中，事情没有这么简单，因为还隐含着一种点餐号永远也不会被叫到的情况，这时我们就被搁置在了一种无限等待的未解析状态。我们待会儿再回头处理这种情况。

#### 现在和稍后的值

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
		// 两者都准备好了？
		if (y != undefined) {
			cb( x + y );	// 发送加法的结果
		}
	} );
	getY( function(yVal){
		y = yVal;
		// 两者都准备好了？
		if (x != undefined) {
			cb( x + y );	// 发送加法的结果
		}
	} );
}

// `fetchX()`和`fetchY()`是同步或异步的函数
add( fetchX, fetchY, function(sum){
	console.log( sum ); // 很简单吧？
} );
```

花点儿时间来感受一下这段代码的美妙（或者丑陋），我耐心地等你。

虽然丑陋是无法否认的，但是关于这种异步模式有一些非常重要的事情需要注意。

在这段代码中，我们将`x`和`y`作为未来的值对待，我们将`add(..)`操作表达为：（从外部看来）它并不关心`x`或`y`或它们两者现在是否可用。换句话所，它泛化了 *现在* 和 *稍后*，如此我们可以信赖`add(..)`操作的一个可预测的结果。

通过使用一个临时一致的`add(..)`——它跨越 *现在* 和 *稍后* 的行为是相同的——异步代码的推理变得容易的多了。

更直白地说：为了一致地处理 *现在* 和 *稍后*，我们将它们都作为 *稍后*：所有的操作都变成异步的。

当然，这种粗略的基于回调的方法留下了许多提升的空间。为了理解在不用关心 *未来的值* 在时间上什么时候变得可用的情况下推理它而带来的好处，这仅仅是迈出的一小步。

#### Promise值

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

`fetchX()`和`fetchY()`被直接调用，它们的返回值（promise！）被传入`add(..)`。这些promise表示的值将在 *现在* 或 *稍后* 准备好，但是每个promise都将行为泛化为与时间无关。我们以一种时间无关的方式来推理`X`和`Y`的值。它们是 *未来值*。

第二层是由`add(..)`创建（通过`Promise.all([ .. ])`）并返回的promise，我们通过调用`then(..)`来等待它。当`add(..)`操作完成后，我们的`sum`*未来值* 就准备好并可以打印了。我们将等待`X`和`Y`的 *未来值* 的逻辑隐藏在`add(..)`内部。

**注意：** 在`add(..)`内部。`Promise.all([ .. ])`调用创建了一个promise（它在等待`promiseX`和`promiseY`被解析）。链式调用`.then(..)`创建了另一个promise，它的`return values[0] + values[1]`这一行会被立即解析（使用加法的结果）。这样，我们链接在`add(..)`调用末尾的`then(..)`调用——在代码段最后——实际上是在第二个被返回的promise上进行操作，而非被`Promise.all([ .. ])`创建的第一个promise。另外，虽然我们没有在这第二个`then(..)`的末尾链接任何操作，它也已经创建了另一个promise，我们可以选择监听/使用它。这类Promise链的细节将会在本章后面进行讲解。

就像点一个起士汉堡，Promise的解析可能是一个拒绝（rejection）而非完成（fulfillment）。不同的是，被完成的Promise的值总是程序化的，而一个拒绝值——通常被称为“拒绝理由”——既可以被程序逻辑设置，也可以被运行时异常隐含地设置。

使用Promise，`then(..)`调用实际上可以接受两个函数，第一个用作完成（正如刚才所示），而第二个用作拒绝：

```js
add( fetchX(), fetchY() )
.then(
	// 完成处理器
	function(sum) {
		console.log( sum );
	},
	// 拒绝处理器
	function(err) {
		console.error( err ); // 倒霉！
	}
);
```

如果在取得`X`或`Y`时出现了错误，或在加法操作时某些事情不知怎地失败了，`add(..)`返回的promise就被拒绝了，传入`then(..)`的第二个错误处理回调函数会从promise那里收到拒绝的值。

因为Promise包装了时间相关的状态——等待当前值的完成或拒绝——从外部看来，Promise本身是时间无关的，如此Promise就可以用可预测的方式组合，而不用关心时间或底层的结果。

另外，一旦Promise被解析，它就永远保持那个状态——它在那个时刻变成了一个 *不可变的值*——而且可以根据需要 *被监听* 任意多次。

**注意：** 因为Promise一旦被解析就是外部不可变的，所以现在将这个值传递给任何其他团体都是安全的，而且我们知道它不会被意外或恶意地被修改。这在许多团体监听同一个Promise的解析时特别有用。一个团体去影响另一个团体对Promise解析的监听能力是不可能的。不可变性听起来是一个学院派话题，但它实际上是Promise设计中最基础且最重要的方面之一，因此不能将它随意地跳过。

这是用于理解Promise的最强大且最重要的概念之一。通过大量的工作，你可以仅仅使用丑陋的回调组合来创建相同的效果，但这真的不是一个高效的策略，特别是你不得不一遍一遍地重复它。

Promise是一种用来包装与组合 *未来值*，并且可以很容易复用的机制。

### 完成事件

正如我们刚才看到的，一个独立的Promise作为一个 *未来值* 动作。但还有另外一种方式考虑Promise的解析：在一个异步任务的两个或以上步骤中，作为一种流程控制机制——俗称“这个然后那个”。

让我们想象调用`foo(..)`来执行某个任务。我们对它的细节一无所知，我们也不关心。它可能会立即完成任务，也可能会花一段时间完成。

我们仅仅想简单地知道`foo(..)`什么时候完成，以便于我们可以移动到下一个任务。换句话说，我们想要一种方法被告知`foo(..)`的完成，以便于我们可以 *继续*。

在典型的JavaScript风格中，如果你需要监听一个通知，你很可能会想到事件（event）。那么我们可以将我们的通知需求重新表述为，监听由`foo(..)`发出的 *完成*（或 *继续*）事件。

**注意：** 将它称为一个“完成事件”还是一个“继续事件”取决于你的角度。你是更关心`foo(..)`发生的事情，还是更关心`foo(..)`完成 *之后* 发生的事情？两种角度都对而且都有用。事件通知告诉我们`foo(..)`已经 *完成*，但是 *继续* 到下一个步骤也没问题。的确，你为了事件通知调用而传入的回调函数本身，在前面我们称它为一个 *延续*。因为 *完成事件* 更加聚焦于`foo(..)`，也就是我们当前注意的东西，所以在这篇文章的其余部分我们稍稍偏向于使用 *完成事件*。

使用回调，“通知”就是被任务（`foo(..)`）调用的我们的回调函数。但是使用Promise，我们将关系扭转过来，我们希望能够监听一个来自于`foo(..)`的事件，当我们被通知时，做相应的处理。

首先，考虑一些假想代码：

```js
foo(x) {
	// 开始做一些可能会花一段时间的事情
}

foo( 42 )

on (foo "completion") {
	// 现在我们可以做下一步了！
}

on (foo "error") {
	// 噢，在`foo(..)`中有某些事情搞错了
}
```

我们调用`foo(..)`然后我们设置两个事件监听器，一个给`"completion"`，一个给`"error"`——`foo(..)`调用的两种可能的最终结果。实质上，`foo(..)`甚至不知道调用它的代码监听了这些事件，这构成了一个非常美妙的 *关注分离（separation of concerns）*。

不幸的是，这样的代码将需要JS环境不具备的一些“魔法”（而且显得有些不切实际）。这里是一种用JS表达它的更自然的方式：

```js
function foo(x) {
	// 开始做一些可能会花一段时间的事情

	// 制造一个`listener`事件通知能力并返回

	return listener;
}

var evt = foo( 42 );

evt.on( "completion", function(){
	// 现在我们可以做下一步了！
} );

evt.on( "failure", function(err){
	// 噢，在`foo(..)`中有某些事情搞错了
} );
```

`foo(..)`明确地创建并返回了一个事件监听能力，调用方代码接收并在它上面注册了两个事件监听器。

很明显这反转了一般的面向回调代码，而且是有意为之。与将回调传入`foo(..)`相反，它返回一个我们称之为`evt`的事件能力，它接收回调。

但如果你回想第二章，回调本身代表着一种 *控制反转*。所以反转回调模式实际上是 *反转的反转*，或者说是一个 *控制非反转*——将控制权归还给我们希望保持它的调用方代码，

一个重要的好处是，代码的多个分离部分都可以被赋予事件监听能力，而且它们都可在`foo(..)`完成时被独立地通知，来执行后续的步骤：

```js
var evt = foo( 42 );

// 让`bar(..)`监听`foo(..)`的完成
bar( evt );

// 同时，让`baz(..)`监听`foo(..)`的完成
baz( evt );
```

*控制非反转* 导致了更好的 *关注分离*，也就是`bar(..)`和`baz(..)`不必卷入`foo(..)`是如何被调用的问题。相似地，`foo(..)`也不必知道或关心`bar(..)`和`baz(..)`的存在或它们是否在等待`foo(..)`完成的通知。

实质上，这个`evt`对象是一个中立的第三方团体，在分离的关注点之间进行交涉。

#### Promise“事件”

正如你可能已经猜到的，`evt`事件监听能力是一个Promise的类比。

在一个基于Promise的方式中，前面的代码段将会使`foo(..)`创建并返回一个`Promise`实例，而且这个promise将会被传入`bar(..)`和`baz(..)`。

**注意：** 我们监听的Promise解析“事件”并不是严格的事件（虽然它们为了某些目的表现得像事件），而且它们也不经常称为`"completion"`或`"error"`。相反，我们用`then(..)`来注册一个`"then"`事件。或者也许更准确地讲，`then(..)`注册了`"fulfillment（完成）"`和/或`"rejection（拒绝）"`事件，虽然我们在代码中不会看到这些名词被明确地使用。

考虑：

```js
function foo(x) {
	// 开始做一些可能会花一段时间的事情

	// 构建并返回一个promise
	return new Promise( function(resolve,reject){
		// 最终需要调用`resolve(..)`或`reject(..)`
		// 它们是这个promise的解析回调
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
	// 监听`foo(..)`的完成
	fooPromise.then(
		function(){
			// `foo(..)`现在完成了，那么做`bar(..)`的任务
		},
		function(){
			// 噢，在`foo(..)`中有某些事情搞错了
		}
	);
}

// `baz(..)`同上
```

Promise解析没有必要一定发送消息，就像我们将Promise作为 *未来值* 考察时那样。它可以仅仅作为一种流程控制信号，就像前面的代码中那样使用。

另一种表达方式是：

```js
function bar() {
	// `foo(..)`绝对已经完成了，那么做`bar(..)`的任务
}

function oopsBar() {
	// 噢，在`foo(..)`中有某些事情搞错了，那么`bar(..)`不会运行
}

// `baz()`和`oopsBaz()`同上

var p = foo( 42 );

p.then( bar, oopsBar );

p.then( baz, oopsBaz );
```

**注意：** 如果你以前见过基于Promise的代码，你可能会相信这段代码的最后两行应当写做`p.then( .. ).then( .. )`，使用链接，而不是`p.then(..); p.then(..)`。这将会是两种完全不同的行为，所以要小心！这种区别现在看起来可能不明显，但是它们实际上是我们目前还没有见过的异步模式：分割（splitting）/分叉（forking）。不必担心！本章后面我们会回到这个话题。

与将`p`promise传入`bar(..)`和`baz(..)`相反，我们使用promise来控制`bar(..)`和`baz(..)`何时该运行，如果有这样的时刻。主要区别在于错误处理。

在第一个代码段的方式中，无论`foo(..)`是否成功`bar(..)`都会被调用，如果被通知`foo(..)`失败了的话它提供自己的后备逻辑。显然，`baz(..)`也是这样做的。

在第二个代码段中，`bar(..)`仅在`foo(..)`成功后才被调用，否则`oopsBar(..)`会被调用。`baz(..)`也是。

两种方式本身都 *对*。但会有一些情况使一种优于另一种。

在这两种方式中，从`foo(..)`返回的promise`p`都被用于控制下一步发生什么。

另外，两个代码段都以对同一个promise`p`调用两次`then(..)`结束，这展示了先前的观点，也就是Promise（一旦被解析）会永远保持相同的解析结果（完成或拒绝），而且可以按需要后续地被监听任意多次。

无论何时`p`被解析，下一步都将总是相同的，包括 *现在* 和 *稍后*。

## Thenable鸭子类型（Duck Typing）

在Promise的世界中，一个重要的细节是如何确定一个值是否是纯粹的Promise。或者更直接地说，一个值会不会像Promise那样动作？

我们知道Promise是由`new Promise(..)`语法构建的，你可能会想`p instanceof Promise`将是一个可以接受的检查。但不幸的是，有几个理由表明它不是完全够用。

主要原因是，你可以从其他浏览器窗口中收到Promise值（iframe等），其他的浏览器窗口会拥有自己的不同于当前窗口/frame的Promise，这种检查将会在定位Promise实例时失效。

另外，一个库或框架可能会选择实现自己的Promise而不是用ES6原生的`Promise`实现。事实上，你很可能在根本没有Promise的老版本浏览器中通过一个库来使用Promise。

当我们在本章稍后讨论Promise的解析过程时，为什么识别并同化一个非纯种但相似Promise的值仍然很重要会愈发明显。但目前只需要相信我，它是拼图中很重要的一块。

如此，人们决定识别一个Promise（或像Promise一样动作的某些东西）的方法是定义一种称为“thenable”的东西，也就是任何拥有`then(..)`方法的对象或函数。这种方法假定任何这样的值都是一个符合Promise的thenable。

根据值的形状（存在什么属性）来推测它的“类型”的“类型检查”有一个一般的名称，称为“鸭子类型检查”——“如果它看起来像一只鸭子，并且叫起来像一只鸭子，那么它一定是一只鸭子”（参见本丛书的 *类型与文法*）。所以对thenable的鸭子类型检查可能大致是这样：

```js
if (
	p !== null &&
	(
		typeof p === "object" ||
		typeof p === "function"
	) &&
	typeof p.then === "function"
) {
	// 认为它是一个thenable!
}
else {
	// 不是一个thenable
}
```

晕！先把将这种逻辑在各种地方实现有点丑陋的事实放在一边不谈，这里还有更多更深层的麻烦。

如果你试着用一个偶然拥有`then(..)`函数的任意对象/函数来完成一个Promise，但你又没想把它当做一个Promise/thenable来对待，你的运气就用光了，因为它会被自动地识别为一个thenable并以特殊的规则来对待（见本章后面的部分）。

如果你不知道一个值上面拥有`then(..)`就更是这样。比如：

```js
var o = { then: function(){} };

// 使`v`用`[[Prototype]]`链接到`o`
var v = Object.create( o );

v.someStuff = "cool";
v.otherStuff = "not so cool";

v.hasOwnProperty( "then" );		// false
```

`v`看起来根本不像是一个Promise或thenable。它只是一个拥有一些属性的直白的对象。你可能只是想要把这个值像其他对象那样传递而已。

但你不知道的是，`v`还`[[Prototype]]`连接着（见本丛书的 *this与对象原型*）另一个对象`o`，在它上面偶然拥有一个`then(..)`。所以thenable鸭子类型检查将会认为并假定`v`是一个thenable。噢。

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

## Promise的信任

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

这种顾虑主要是代码是否会引入类Zalgo效应，也就是一个任务有时会同步完地成，而有时会异步地完成，这将导致竞合状态。

Promise被定义为不能受这种顾虑的影响，因为即便是立即完成的Promise（比如 `new Promise(function(resolve){ resolve(42); })`）也不可能被同步地 *监听*。

也就是说，当你在Promise上调用`then(..)`的时候，即便这个Promise已经被解析了，你给`then(..)`提供的回调也将 **总是** 被异步地调用（更多关于这里的内容，参照第一章的"Jobs"）。

不必再插入你自己的`setTimeout(..,0)`黑科技了。Promise自动地防止了Zalgo效应。

### 调的太晚

和前一点相似，在`resolve(..)`或`reject(..)`被Promise创建机制调用时，一个Promise的`then(..)`上注册的监听回调将自动地被排程。这些被排程好的回调将在下一个异步时刻被可预测地触发（参照第一章的"Jobs"）。

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

#### Promise排程的怪现象

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

// A B  <-- 不是你可能期望的 B A
```

我们稍后会更多地讲解这个问题，但如你所见，`p1`不是被一个立即值所解析的，而是由另一个promise`p3`所解析，而`p3`本身被一个值`"B"`所解析。这种指定的行为将`p3`*展开* 到`p1`，但是是异步地，所以在异步工作队列中`p1`的回调位于`p2`的回调之后（参照第一章的"Jobs"）。

为了回避这样的微妙的噩梦，你绝不应该依靠任何跨Promise的回调顺序/排程。事实上，一个好的实践方式是在代码中根本不要让多个回调的顺序成为问题。尽可能回避它。

### 根本不调回调

这是一个很常见的顾虑。Promise用几种方式解决它。

首先，没有任何东西（JS错误都不能）可以阻止一个Promise通知你它的解析（如果它被解析了的话）。如果你在一个Promise上同时注册了完成和拒绝回调，而且这个Promise被解析了，两个回调中的一个总会被调用。

当然，如果你的回调本身有JS错误，你可能不会看到你期望的结果，但是回调事实上已经被调用了。我们待会儿就会讲到如何在你的回调中收到关于一个错误的通知，因为就算是它们也不会被吞掉。

那如果Promise本身不管怎样永远没有被解析呢？即便是这种状态Promise也给出了答案，使用一个称为“竞赛（race）”的高级抽象。

```js
// 一个使Promise超时的工具
function timeoutPromise(delay) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			reject( "Timeout!" );
		}, delay );
	} );
}

// 为`foo()`设置一个超时
Promise.race( [
	foo(),					// 尝试调用`foo()`
	timeoutPromise( 3000 )	// 给它3秒钟
] )
.then(
	function(){
		// `foo(..)`及时地完成了！
	},
	function(err){
		// `foo()`不是被拒绝了，就是它没有及时完成
		// 那么可以考察`err`来知道是哪种情况
	}
);
```

这种Promise的超时模式有更多的细节需要考虑，但我们待会儿再回头讨论。

重要的是，我们可以确保一个信号作为`foo(..)`的结果，来防止它无限地挂起我们的程序。

### 调太少或太多次

根据定义，对于被调用的回调来讲 *一次* 是一个合适的次数。“太少”的情况将会是0次，和我们刚刚考察的从不调用是相同的。

“太多”的情况则很容易解释。Promise被定义为只能被解析一次。如果因为某些原因，Promise的创建代码试着调用`resolve(..)`或`reject(..)`许多次，或者试着同时调用它们俩，Promise将仅接受第一次解析，而无声地忽略后续的尝试。

因为一个Promise仅能被解析一次，所以任何`then(..)`上注册的（每个）回调将仅仅被调用一次。

当然，如果你把同一个回调注册多次（比如`p.then(f); p.then(f);`），那么它就会被调用注册的那么多次。响应函数仅被调用一次的保证并不能防止你砸自己的脚。

### 没能传入任何参数/环境

Promise可以拥有最多一个解析值（完成或拒绝）。

如果无论怎样你没有用一个值明确地解析它，它的值就是`undefined`，就像JS中常见的那样。但不管是什么值，它总是会被传入所有被注册的（并且适当地：完成或拒绝）回调中，不管是 *现在* 还是将来。

需要意识到的是：如果你使用多个参数调用`resolve(..)`或`reject(..)`，所有第一个参数之外的后续参数都会被无声地忽略。虽然这看起来违反了我们刚才描述的保证，但并不确切，因为它构成了一种Promise机制的无效使用方式。其他的API无效使用方式（比如调用`resolve(..)`许多次）也都相似地 *被保护*，所以Promise的行为在这里是一致的（除了有一点点让人沮丧）。

如果你想传递多个值，你必须将它们包装在另一个单独的值中，比如一个`array`或一个`object`。

至于环境，JS中的函数总是保持他们被定义时所在作用域的闭包（见本系列的 *作用域与闭包*），所以它们理所当然地可以继续访问你提供的环境状态。当然，这对仅使用回调的设计来讲也是对的，所以这不能算是Promise带来的增益——但尽管如此，它依然是我们可以依赖的保证。

### 吞掉所有错误/异常

在基本的感觉上，这是前一点的重述。如果你用一个 *理由*（也就是错误消息）拒绝一个Promise，这个值就会被传入拒绝回调。

但是这里有一个更重要的事情。如果在Promise的创建过程中的任意一点，或者在监听它的解析的过程中，一个JS异常错误发生的话，比如`TypeError`或`ReferenceError`，这个异常将会被捕获，并且强制当前的Promise变为拒绝。

举例来说：

```js
var p = new Promise( function(resolve,reject){
	foo.bar();	// `foo`没有定义，所以这是一个错误！
	resolve( 42 );	// 永远不会跑到这里 :(
} );

p.then(
	function fulfilled(){
		// 永远不会跑到这里 :(
	},
	function rejected(err){
		// `err`将是一个来自`foo.bar()`那一行的`TypeError`异常对象
	}
);
```

在`foo.bar()`上发生的JS异常变成了一个你可以捕获并响应的Promise拒绝。

这是一个重要的细节，因为它有效地解决了另一种潜在的Zalgo时刻，也就是错误可能会产生一个同步的反应，而没有错误的部分还是异步的。Promise甚至将JS异常都转化为异步行为，因此极大地降低了发生竞合状态的可能性。

但是如果Promise完成了，但是在监听过程中（在一个`then(..)`上注册的回调上）出现了JS异常错误会怎样呢？即便是那些也不会丢失，但你可能会发现处理它们的方式有些令人诧异，除非你深挖一些：

```js
var p = new Promise( function(resolve,reject){
	resolve( 42 );
} );

p.then(
	function fulfilled(msg){
		foo.bar();
		console.log( msg );	// 永远不会跑到这里 :(
	},
	function rejected(err){
		// 也永远不会跑到这里 :(
	}
);
```

等一下，这看起来`foo.bar()`发生的异常确实被吞掉了。不要害怕，它没有。但更深层次的东西出问题了，也就是我们没能成功地监听他。`p.then(..)`调用本身返回另一个promise，是 *那个* promise将会被`TypeError`异常拒绝。

为什么它不能调用我们在这里定义的错误处理器呢？表面上看起来是一个符合逻辑的行为。但它会违反Promise一旦被解析就 **不可变** 的基本原则。`p`已经完成为值`42`，所以它不能因为在监听`p`的解析时发生了错误，而在稍后变成一个拒绝。

除了违反原则，这样的行为还可能造成破坏，假如说有多个在promise`p`上注册的`then(..)`回调，因为有些会被调用而有些不会，而且至于为什么是很明显的。

### 可信的Promise？

为了基于Promise模式建立信任，还有最后一个细节需要考察。

无疑你已经注意到了，Promise根本没有摆脱回调。它们只是改变了回调传递的位置。与将一个回调传入`foo(..)`相反，我们从`foo(..)`那里拿回 *某些东西* （表面上是一个纯粹的Promise），然后我们将回调传入这个 *东西*。

但为什么这要比仅使用回调的方式更可靠呢？我们如何确信我们拿回来的 *某些东西* 事实上是一个可信的Promise？这难道不是说我们相信它仅仅因为我们已经相信它了吗？

一个Promise经常被忽视，但是最重要的细节之一，就是它也为这个问题给出了解决方案。包含在原生的ES6`Promise`实现中，它就是`Promise.resolve(..)`。

如果你传递一个立即的，非Promise的，非thenable的值给`Promise.resolve(..)`，你会得到一个用这个值完成的promise。换句话说，下面两个promise`p1`和`p2`的行为基本上完全相同：

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

// 这工作起来没问题，但要靠运气
p
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// 永远不会跑到这里
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
		// 噢，这里本不该运行
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
		// 永远不会跑到这里
	}
);
```

`Promise.resolve(..)`会接受任何thenable，而且将它展开直至非thenable值。但你会从`Promise.resolve(..)`那里得到一个真正的，纯粹的Promise，**一个你可以信任的东西**。如果你传入的东西已经是一个纯粹的Promise了，那么你会单纯地将它拿回来，所以通过`Promise.resolve(..)`过滤来得到信任没有任何坏处。

那么我们假定，我们在调用一个`foo(..)`工具，而且不能确定我们能相信它的返回值是一个行为规范的Promise，但我们知道它至少是一个thenable。`Promise.resolve(..)`将会给我们一个可靠的Promise包装器来进行链式调用：

```js
// 不要只是这么做：
foo( 42 )
.then( function(v){
	console.log( v );
} );

// 相反，这样做：
Promise.resolve( foo( 42 ) )
.then( function(v){
	console.log( v );
} );
```

**注意：** 将任意函数的返回值（thenable或不是thenable）包装在`Promise.resolve(..)`中的另一个好的副作用是，它可以很容易地将函数调用泛化为一个行为规范的异步任务。如果`foo(42)`有时返回一个立即值，而其他时候返回一个Promise，`Promise.resolve(foo(42))`，将确保它总是返回Promise。并且使代码成为回避Zalgo效应的更好的代码。

### 信任建立了

希望前面的讨论使你现在完全理解了Promise是可靠的，而且更为重要的是，为什么信任对于建造强壮，可维护的软件来说是如此关键。

没有信任，你能用JS编写异步代码吗？你当然能。我们JS开发者在除了回调以外没有任何东西的情况下，写了将近20年的异步代码了。

但是一旦你开始质疑你到底能够以多大的程度相信你的底层机制，它实际上多么可预见，多么可靠，你就会开始理解回调的信任基础多么的摇摇欲坠。

Promise是一个用可靠语义来增强回调的模式，所以它的行为更合理更可靠。通过将回调的 *控制倒转* 反置过来，我们将控制交给一个可靠的系统（Promise），它是为了将你的异步处理进行清晰的表达而特意设计的。

## 链式流程

我们已经被暗示过几次，但Promise不仅仅是一个单步的 *这个然后那个* 操作机制。当然，那是构建块儿，但事实证明我们可以将多个Promise串联在一起来表达一系列的异步步骤。

使这一切能够工作的关键，是Promise的两个固有行为：

* 每次你在一个Promise上调用`then(..)`的时候，它都创建并返回一个新的Promise，我们可以在它上面进行 *链接*。
* 无论你从`then(..)`调用的完成回调中（第一个参数）返回什么值，它都做为被链接的Promise的完成。

我们首先来说明一下这是什么意思，然后我们将会延伸出它是如何帮助我们创建异步顺序的控制流程的。考虑下面的代码：

```js
var p = Promise.resolve( 21 );

var p2 = p.then( function(v){
	console.log( v );	// 21

	// 使用值`42`完成`p2`
	return v * 2;
} );

// 在`p2`后链接
p2.then( function(v){
	console.log( v );	// 42
} );
```

通过返回`v * 2`（也就是`42`），我们完成了由第一个`then(..)`调用创建并返回的`p2`promise。当`p2`的`then(..)`调用运行时，它从`return v * 2`语句那里收到完成信号。当然，`p2.then(..)`还会创建另一个promise，我们将它存储在变量`p3`中。

但是不得不创建临时变量`p2`（或`p3`等）有点儿恼人。幸运的是，我们可以简单地将这些链接在一起：

```js
var p = Promise.resolve( 21 );

p
.then( function(v){
	console.log( v );	// 21

	// 使用值`42`完成被链接的promise
	return v * 2;
} )
// 这里是被链接的promise
.then( function(v){
	console.log( v );	// 42
} );
```

那么现在第一个`then(..)`是异步序列的第一步，而第二个`then(..)`就是第二步。它可以根据你的需要延伸至任意长。只要持续不断地用每个自动创建的Promise在前一个`then(..)`末尾进行连接即可。

但是这里错过了某些东西。要是我们想让第2步等待第1步去做一些异步的事情呢？我们使用的是一个立即的`return`语句，它立即完成了链接中的promise。

使Promise序列在每一步上都是真正异步的关键，需要回忆一下当你向`Promise.resolve(..)`传递一个Promise或thenable而非一个最终值时它如何执行。`Promise.resolve(..)`会直接返回收到的纯粹Promise，或者它会展开收到的thenable的值——并且它会递归地持续展开thenable。

如果你从完成（或拒绝）处理器中返回一个thenable或Promise，同样的展开操作也会发生。考虑这段代码：

```js
var p = Promise.resolve( 21 );

p.then( function(v){
	console.log( v );	// 21

	// 创建一个promise并返回它
	return new Promise( function(resolve,reject){
		// 使用值`42`完成
		resolve( v * 2 );
	} );
} )
.then( function(v){
	console.log( v );	// 42
} );
```

即便我们把`42`包装在一个我们返回的promise中，它依然会被展开并作为下一个被链接的promise的解析，如此第二个`then(..)`仍然收到`42`。如果我们在这个包装promise中引入异步，一切还是会同样正常的工作：

```js
var p = Promise.resolve( 21 );

p.then( function(v){
	console.log( v );	// 21

	// 创建一个promise并返回
	return new Promise( function(resolve,reject){
		// 引入异步！
		setTimeout( function(){
			// 使用值`42`完成
			resolve( v * 2 );
		}, 100 );
	} );
} )
.then( function(v){
	// 在上一步中的100毫秒延迟之后运行
	console.log( v );	// 42
} );
```

这真是不可思议的强大！现在我们可以构建一个序列，它可以有我们想要的任意多的步骤，而且每一步都可以按照需要来推迟下一步（或者不推迟）。

当然，在这些例子中一步一步向下传递的值是可选的。如果你没有返回一个明确的值，那么它假定一个隐含的`undefined`，而且promise依然会以同样的方式链接在一起。如此，每个Promise的解析只不过是进行至下一步的信号。

为了演示更长的链接，让我们把推迟Promise的创建（没有解析信息）泛化为一个我们可以在多个步骤中复用的工具：

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

调用`delay(200)`创建了一个将在200毫秒内完成的promise，然后我们在第一个`then(..)`的完成回调中返回它，这将使第二个`then(..)`的promise等待这个200毫秒的promise。

**注意：** 正如刚才描述的，技术上讲在这个交替中有两个promise：一个200毫秒延迟的promise，和一个被第二个`then(..)`链接的promise。但你可能会发现将这两个promise组合在一起更容易思考，因为Promise机制帮你把它们的状态自动地混合到了一起。从这个角度讲，你可以认为`return delay(200)`创建了一个promise来取代早前一个返回的被链接的promise。

老实说，没有任何消息进行传递的一系列延迟作为Promise流程控制的例子不是很有用。让我们来看一个更加实在的场景：

与计时器不同，让我们考虑发起Ajax请求：

```js
// 假定一个`ajax( {url}, {callback} )`工具

// 带有Promise的ajax
function request(url) {
	return new Promise( function(resolve,reject){
		// `ajax(..)`的回调应当是我们的promise的`resolve(..)`函数
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

**注意：** 开发者们通常遭遇的一种情况是，他们想用本身不支持Promise的工具（就像这里的`ajax(..)`，它期待一个回调）进行Promise式的异步流程控制。虽然ES6原生的`Promise`机制不会自动帮我们解决这种模式，但是在实践中所有的Promise库会帮我们这么做。它们通常称这种处理为“提升（lifting）”或“promise化”或其他的什么名词。我们稍后再回头讨论这种技术。

使用返回Promise的`request(..)`，通过用第一个URL调用它我们在链条中隐式地创建了第一步，然后我们用第一个`then(..)`在返回的promise末尾进行连接。

一旦`response1`返回，我们用它的值来构建第二个URL，并且发起第二个`request(..)`调用。这第二个`promise`是`return`的，所以我们的异步流程控制的第三步将会等待这个Ajax调用完成。最终，一旦`response2`返回，我们就打印它。

我们构建的Promise链不仅是一个表达多步骤异步序列的流程控制，它还扮演者将消息从一步传递到下一步的消息管道。

要是Promise链中的某一步出错了会怎样呢？一个错误/异常是基于每个Promise的，意味着在链条的任意一点捕获这些错误是可能的，而且这些捕获操作在那一点上将链条“重置”，使它回到正常的操作上来：

```js
// 步骤 1:
request( "http://some.url.1/" )

// 步骤 2:
.then( function(response1){
	foo.bar(); // 没有定义，错误！

	// 永远不会跑到这里
	return request( "http://some.url.2/?v=" + response1 );
} )

// 步骤 3:
.then(
	function fulfilled(response2){
		// 永远不会跑到这里
	},
	// 拒绝处理器捕捉错误
	function rejected(err){
		console.log( err );	// 来自 `foo.bar()` 的 `TypeError` 错误
		return 42;
	}
)

// 步骤 4:
.then( function(msg){
	console.log( msg );		// 42
} );
```

当错误在第2步中发生时，第3步的拒绝处理器将它捕获。拒绝处理器的返回值（在这个代码段里是`42`），如果有的话，将会完成下一步（第4步）的promise，如此整个链条又回到完成的状态。

**注意：** 就像我们刚才讨论过的，当我们从一个完成处理器中返回一个promise时，它会被展开并有可能推迟下一步。这对从拒绝处理器中返回的promise也是成立的，这样如果我们在第3步返回一个promise而不是`return 42`，那么这个promise就可能会推迟第4步。不管是在`then(..)`的完成还是拒绝处理器中，一个被抛出的异常都将导致下一个（链接着的）promise立即用这个异常拒绝。

如果你在一个promise上调用`then(..)`，而且你只向它传递了一个完成处理器，一个假定的拒绝处理器会取而代之：

```js
var p = new Promise( function(resolve,reject){
	reject( "Oops" );
} );

var p2 = p.then(
	function fulfilled(){
		// 永远不会跑到这里
	}
	// 如果忽略或者传入任何非函数的值，
	// 会有假定有一个这样的拒绝处理器
	// function(err) {
	//     throw err;
	// }
);
```

如你所见，这个假定的拒绝处理器仅仅简单地重新抛出错误，它最终强制`p2`（链接着的promise）用同样的错误进行拒绝。实质上，它允许错误持续地在Promise链上传播，直到遇到一个明确定义的拒绝处理器。

**注意：** 稍后我们会讲到更多关于使用Promise进行错误处理的细节，因为会有更多微妙的细节需要关心。

如果没有一个恰当的合法的函数作为`then(..)`的完成处理器参数，也会有一个默认的处理器取而代之：

```js
var p = Promise.resolve( 42 );

p.then(
	// 如果忽略或者传入任何非函数的值，
	// 会有假定有一个这样的完成处理器
	// function(v) {
	//     return v;
	// }
	null,
	function rejected(err){
		// 永远不会跑到这里
	}
);
```

如你所见，默认的完成处理器简单地将它收到的任何值传递给下一步（Promise）。

**注意：** `then(null,function(err){ .. })`这种模式——仅处理拒绝（如果发生的话）但让成功通过——有一个缩写的API：`catch(function(err){ .. })`。我们会在下一节中更全面地涵盖`catch(..)`。

让我们简要地复习一下使链式流程控制成为可能的Promise固有行为：

* 在一个Promise上的`then(..)`调用会自动生成一个新的Promise并返回。
* 在完成/拒绝处理器内部，如果你返回一个值或抛出一个异常，新返回的Promise（可以被链接的）将会相应地被解析。
* 如果完成或拒绝处理器返回一个Promise，它会被展开，所以无论它被解析为什么值，这个值都将变成从当前的`then(..)`返回的被链接的Promise的解析。

虽然链式流程控制很有用，但是将它认为是Promise的组合方式的副作用可能最准确，而不是它的主要意图。正如我们已经详细讨论过许多次的，Promise泛化了异步处理并且包装了与时间相关的值和状态，这才是让我们以这种有用的方式将它们链接在一起的原因。

当然，相对于我们在第二章中看到的一堆混乱的回调，这种链条的顺序表达是一个巨大的改进。但是仍然要蹚过相当多的模板代码（`then(..)` and `function(){ .. }`）。在下一章中，我们将看到一种极大美化顺序流程控制的表达模式，生成器（generators）。

### 术语: Resolve（解析），Fulfill（完成），和Reject（拒绝）

在你更多深入地学习Promise之前，在“解析（resolve）”，“完成（fulfill）”，和“拒绝（reject）”这些名词之间还有一些我们需要辨明的小困惑。首先让我们考虑一下`Promise(..)`构造器：

```js
var p = new Promise( function(X,Y){
	// X() 给 fulfillment（完成）
	// Y() 给 rejection（拒绝）
} );
```

如你所见，有两个回调（标识为`X`和`Y`）被提供了。第一个 *通常* 用于表示Promise完成了，而第二个 *总是* 表示Promise拒绝了。但“通常”是什么意思？它对这些参数的正确命名暗示着什么呢？

最终，这只是你的用户代码，和将被引擎翻译为没有任何含义的东西的标识符，所以在 *技术上* 它无紧要；`foo(..)`和`bar(..)`在功能性上是相等的。但是你用的词不仅会影响你如何考虑这段代码，还会影响你所在团队的其他开发者如何考虑它。将精心策划的异步代码错误地考虑，几乎可以说要比面条一般的回调还要差劲儿。

所以，某种意义上你如何称呼它们很关键。

第二个参数很容易决定。几乎所有的文献都使用`reject(..)`做为它的名称，因为这正是它（唯一！）要做的，对于命名来说这是一个很好的选择。我也强烈推荐你一直使用`reject(..)`。

但是关于第一个参数还是有些带有歧义，它在许多关于Promise的文献中常被标识为`resolve(..)`。这个词明显地是与“resolution（解析）”有关，它在所有的文献中（包括本书）广泛用于描述给Promise设定一个最终的值/状态。我们已经使用“解析Promise（resolve the Promise）”许多次来意味Promise的完成（fulfilling）或拒绝（rejecting）。

但是如果这个参数看起来被用于特指Promise的完成，为什么我们不更准确地叫它`fulfill(..)`，而是用`resolve(..)`呢？要回答这个问题，让我们看一下`Promise`的两个API方法：

```js
var fulfilledPr = Promise.resolve( 42 );

var rejectedPr = Promise.reject( "Oops" );
```

`Promise.resolve(..)`创建了一个Promise，它被解析为它被给予的值。在这个例子中，`42`是一个一般的，非Promise，非thenable的值，所以完成的promise`fulfilledPr`是为值`42`创建的。`Promise.reject("Oops")`为了原因`"Oops"`创建的拒绝的promise`rejectedPr`。

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

`Promise(..)`构造器的第一个回调参数既可以展开一个thenable（与`Promise.resolve(..)`相同），也可以展开一个Promise：

```js
var rejectedPr = new Promise( function(resolve,reject){
	// 用一个被拒绝的promise来解析这个promise
	resolve( Promise.reject( "Oops" ) );
} );

rejectedPr.then(
	function fulfilled(){
		// 永远不会跑到这里
	},
	function rejected(err){
		console.log( err );	// "Oops"
	}
);
```

现在应当清楚了，对于`Promise(..)`构造器的第一个参数来说`resolve(..)`是一个合适的名称。

**警告：** 前面提到的`reject(..)` **不会** 像`resolve(..)`那样进行展开。如果你向`reject(..)`传递一个Promise/thenable值，这个没有被碰过的值将作为拒绝的理由。一个后续的拒绝处理器将会受到你传递给`reject(..)`的实际的Promise/thenable，而不是它底层的立即值。

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

## 错误处理

我们已经看过几个例子，Promise拒绝——既可以通过有意调用`reject(..)`，也可以通过意外的JS异常——是如何在异步编程中允许清晰的错误处理的。让我们兜个圈子回去，将我们一带而过的一些细节弄清楚。

对大多数开发者来说，最自然的错误处理形式是同步的`try..catch`结构。不幸的是，它仅能用于同步状态，所以在异步代码模式中它帮不上什么忙：

```js
function foo() {
	setTimeout( function(){
		baz.bar();
	}, 100 );
}

try {
	foo();
	// 稍后会从`baz.bar()`抛出全局错误
}
catch (err) {
	// 永远不会到这里
}
```

能有`try..catch`当然很好，但除非有某些附加的环境支持，它无法与异步操作一起工作。我们将会在第四章中讨论generator时回到这个话题。

在回调中，对于错误处理的模式已经有了一些新兴的模式，最有名的就是“错误优先回调”风格：

```js
function foo(cb) {
	setTimeout( function(){
		try {
			var x = baz.bar();
			cb( null, x ); // 成功！
		}
		catch (err) {
			cb( err );
		}
	}, 100 );
}

foo( function(err,val){
	if (err) {
		console.error( err ); // 倒霉 :(
	}
	else {
		console.log( val );
	}
} );
```

**注意：** 这里的`try..catch`仅在`baz.bar()`调用立即地，同步地成功或失败时才能工作。如果`baz.bar()`本身是一个异步完成的函数，它内部的任何异步错误都不能被捕获。

我们传递给`foo(..)`的回调期望通过预留的`err`参数收到一个表示错误的信号。如果存在，就假定出错。如果不存在，就假定成功。

这类错误处理在技术上是 *异步兼容的*，但它根本组织的不好。用无处不在的`if`语句检查将多层错误优先回调编织在一起，将不可避免地将你置于回调地狱的危险之中（见第二章）。

那么我们回到Promise的错误处理，使用传递给`then(..)`的拒绝处理器。Promise不使用流行的“错误优先回调”设计风格，反而使用“分割回调”的风格；一个回调给完成，一个回调给拒绝：

```js
var p = Promise.reject( "Oops" );

p.then(
	function fulfilled(){
		// 永远不会到这里
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
		// 数字没有字符串方法,
		// 所以这里抛出一个错误
		console.log( msg.toLowerCase() );
	},
	function rejected(err){
		// 永远不会到这里
	}
);
```

如果`msg.toLowerCase()`合法地抛出一个错误（它会的！），为什么我们的错误处理器没有得到通知？正如我们早先解释的，这是因为 *这个* 错误处理器是为`p`promise准备的，也就是已经被值`42`完成的那个promise。`p`promise是不可变的，所以唯一可以得到错误通知的promise是由`p.then(..)`返回的那个，而在这里我们没有捕获它。

这应当解释了：为什么Promise的错误处理是易错的。错误太容易被吞掉了，而这很少是你有意这么做的。

**警告：** 如果你以一种不合法的方式使用Promise API，而且有错误阻止正常的Promise构建，其结果将是一个立即被抛出的异常，**而不是一个拒绝Promise**。这是一些导致Promise构建失败的错误用法：`new Promise(null)`，`Promise.all()`，`Promise.race(42)`等等。如果你没有足够合法地使用Promise API来首先实际构建一个Promise，你就不能得到一个拒绝Promise！

### 绝望的深渊

几年前Jeff Atwood曾经写到：编程语言总是默认地以这样的方式建立，开发者们会掉入“绝望的深渊”（http://blog.codinghorror.com/falling-into-the-pit-of-success/ ）——在这里意外会被惩罚——而你不得不更努力地使它正确。他恳求我们相反地创建“成功的深渊”，就是你会默认地掉入期望的（成功的）行为，而如此你不得不更努力地去失败。

毫无疑问，Promise的错误处理是一种“绝望的深渊”的设计。默认情况下，它假定你想让所有的错误都被Promise的状态吞掉，而且如果你忘记监听这个状态，错误就会默默地凋零/死去——通常是绝望的。

为了回避把一个被遗忘/抛弃的Promise的错误无声地丢失，一些开发者宣称Promise链的“最佳实践”是，总是将你的链条以`catch(..)`终结，就像这样：

```js
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// 数字没有字符串方法,
		// 所以这里抛出一个错误
		console.log( msg.toLowerCase() );
	}
)
.catch( handleErrors );
```

因为我们没有给`then(..)`传递拒绝处理器，默认的处理器会顶替上来，它仅仅简单地将错误传播到链条的下一个promise中。如此，在`p`中发生的错误，与在`p`之后的解析中（比如`msg.toLowerCase()`）发生的错误都将会过滤到最后的`handleErrors(..)`中。

问题解决了，对吧？没那么容易！

要是`handleErrors(..)`本身也有错误呢？谁来捕获它？这里还有一个没人注意的promise：`catch(..)`返回的promise，我们没有对它进行捕获，也没注册拒绝处理器。

你不能仅仅将另一个`catch(..)`贴在链条末尾，因为它也可能失败。Promise链的最后一步，无论它是什么，总有可能，即便这种可能性逐渐减少，悬挂着一个困在未被监听的Promise中的，未被捕获的错误。

听起来像一个不可解的迷吧？

### 处理未被捕获的错误

这不是一个很容易就能完全解决的问题。但是有些接近于解决的方法，或者说 *更好的方法*。

一些Promise库有一些附加的方法，可以注册某些类似于“全局的未处理拒绝”的处理器，全局上不会抛出错误，而是调用它。但是他们识别一个错误是“未被捕获的错误”的方案是，使用一个任意长的计时器，比如说3秒，从拒绝的那一刻开始计时。如果一个Promise被拒绝但没有错误处理在计时器被触发前注册，那么它就假定你不会注册监听器了，所以它是“未被捕获的”。

实践中，这个方法在许多库中工作的很好，因为大多数用法不会在Promise拒绝和监听这个拒绝之间有很明显的延迟。但是这个模式有点儿麻烦，因为3秒实在太随意了（即便它是实证过的），还因为确实有些情况你想让一个Promise在一段不确定的时间内持有它的拒绝状态，而且你不希望你的“未捕获错误”处理器因为这些误报（还没处理的“未捕获错误”）而被调用。

另一种常见的建议是，Promise应当增加一个`done(..)`方法，它实质上标志着Promise链的“终结”。`done(..)`不会创建并返回一个Promise，所以传递给`done(..)`的回调很明显地不会链接上一个不存在的Promise链，并向它报告问题。

那么接下来会发什么？正如你通常在未处理错误状态下希望的那样，在`done(..)`的拒绝处理器内部的任何异常都作为全局的未捕获错误抛出（基本上扔到开发者控制台）：

```js
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// 数字没有字符串方法,
		// 所以这里抛出一个错误
		console.log( msg.toLowerCase() );
	}
)
.done( null, handleErrors );

// 如果`handleErrors(..)`自身发生异常，它会在这里被抛出到全局
```

这听起来要比永不终结的链条或随意的超时要吸引人。但最大的问题是，它不是ES6标准，所以不管听起来多么好，它成为一个可靠而普遍的解决方案还有很长的距离。

那我们就卡在这里了？不完全是。

浏览器有一个我们的代码没有的能力：它们可以追踪并确定一个对象什么时候被废弃并可以作为垃圾回收。所以，浏览器可以追踪Promise对象，当它们被当做垃圾回收时，如果在它们内部存在一个拒绝状态，浏览器就可以确信这是一个合法的“未捕获错误”，它可以信心十足地知道应当在开发者控制台上报告这一情况。

**注意：** 在写作本书的时候，Chrome和Firefox都早已试图实现这种“未捕获拒绝”的能力，虽然至多也就是支持的不完整。

然而，如果一个Promise不被垃圾回收——通过许多不同的代码模式，这极其容易不经意地发生——浏览器的垃圾回收检测不会帮你知道或诊断你有一个拒绝的Promise静静地躺在附近。

还有其他选项吗？有。

### 成功的深渊

以下讲的仅仅是理论上，Promise *可能* 在某一天变成什么样的行为。我相信那会比我们现在拥有的优越许多。而且我想这种改变可能会发生在后ES6时代，因为我不认为它会破坏Web的兼容性。另外，如果你小心行事，它是可以被填补（polyfilled）/预填补（prollyfilled）的。让我们来看一下：

* Promise可以默认为是报告(向开发者控制台)一切拒绝的，就在下一个Job或事件轮询tick，如果就在这时Promise上没有注册任何错误处理器。
* 如果你希望拒绝的Promise在被监听前，将其拒绝状态保持一段不确定的时间。你可以调用`defer()`，它会压制这个Promise自动报告错误。

如果一个Promise被拒绝，默认地它会吵吵闹闹地向开发者控制台报告这个情况（而不是默认不出声）。你既可以选择隐式地处理这个报告（通过在拒绝之前注册错误处理器），也可以选择明确地处理这个报告（使用`defer()`）。无论哪种情况，*你* 都控制着这种误报。

考虑下面的代码：

```js
var p = Promise.reject( "Oops" ).defer();

// `foo(..)`返回Promise
foo( 42 )
.then(
	function fulfilled(){
		return p;
	},
	function rejected(err){
		// 处理`foo(..)`的错误
	}
);
...
```

我们创建了`p`，我们知道我们会为了使用/监听它的拒绝而等待一会儿，所以我们调用`defer()`——如此就不会有全局的报告。`defer()`单纯地返回同一个promise，为了链接的目的。

从`foo(..)`返回的promise *当即* 就添附了一个错误处理器，所以这隐含地跳出了默认行为，而且不会有全局的关于错误的报告。

但是从`then(..)`调用返回的promise没有`defer()`或添附错误处理器，所以如果它被拒绝（从它内部的任意一个解析处理器中），那么它就会向开发者控制台报告一个未捕获错误。

**这种设计称为成功的深渊**。默认情况下，所有的错误不是被处理就是被报告——这几乎是所有开发者在几乎所有情况下所期望的。你要么不得不注册一个监听器，要么不得不有意什么都不做，并指示你要将错误处理推迟到 *稍后*；你仅为这种特定情况选择承担额外的责任。

这种方式唯一真正的危险是，你`defer()`了一个Promise但是实际上没有监听/处理它的拒绝。

但你不得不有意地调用`defer()`来选择进入绝望深渊——默认是成功深渊——所以对于从你自己的错误中拯救你这件事来说，我们能做的不多。

我觉得对于Promise的错误处理还有希望（在后ES6时代）。我希望上层人物将会重新思考这种情况并考虑选用这种方式。同时，你可以自己实现这种方式（给读者们的挑战练习！），或使用一个 *聪明* 的Promise库来为你这么做。

**注意：** 这种错误处理/报告的确切的模型已经在我的 *asynquence* Promise抽象库中实现，我们会在本书的附录A中讨论它。

## Promise模式

我们已经隐含地看到了使用Promise链的顺序模式（这个-然后-这个-然后-那个的流程控制），但是我们还可以在Promise的基础上抽象出许多其他种类的异步模式。这些模式用于简化异步流程控制的的表达——它可以使我们的代码更易于推理并且更易于维护——即便是我们程序中最复杂的部分。

有两个这样的模式被直接编码在ES6原生的`Promise`实现中，所以我们免费的得到了它们，来作为我们其他模式的构建块儿。

### Promise.all([ .. ])

在一个异步序列（Promise链）中，在任何给定的时刻都只有一个异步任务在被协调——第2步严格地接着第1步，而第3步严格地接着第2步。但要是并发（也叫“并行地”）地去做两个或以上的步骤呢？

用经典的编程术语，一个“门（gate）”是一种等待两个或更多并行/并发任务都执行完再继续的机制。它们完成的顺序无关紧要，只是它们不得不都完成才能让门打开，继而让流程控制通过。

在Promise API中，我们称这种模式为`all([ .. ])`。

比方说你想同时发起两个Ajax请求，在发起第三个Ajax请求发起之前，等待它们都完成，而不管它们的顺序。考虑这段代码：

```js
// `request(..)`是一个兼容Promise的Ajax工具
// 就像我们在本章早前定义的

var p1 = request( "http://some.url.1/" );
var p2 = request( "http://some.url.2/" );

Promise.all( [p1,p2] )
.then( function(msgs){
	// `p1`和`p2`都已完成，这里将它们的消息传入
	return request(
		"http://some.url.3/?v=" + msgs.join(",")
	);
} )
.then( function(msg){
	console.log( msg );
} );
```

`Promise.all([ .. ])`期待一个单独的参数，一个`array`，一般由Promise的实例组成。从`Promise.all([ .. ])`返回的promise将会收到完成的消息（在这段代码中是`msgs`），它是一个由所有被传入的promise的完成消息按照被传入的顺序构成的`array`（与完成的顺序无关）。

**注意：** 技术上讲，被传入`Promise.all([ .. ])`的`array`的值可以包括Promise，thenable，甚至是立即值。这个列表中的每一个值都实质上通过`Promise.resolve(..)`来确保它是一个可以被等待的纯粹的Promise，所以一个立即值将被范化为这个值的一个Promise。如果这个`array`是空的，主Promise将会立即完成。

从`Promise.resolve(..)`返回的主Promise将会在所有组成它的promise完成之后才会被完成。如果其中任意一个promise被拒绝，`Promise.all([ .. ])`的主Promise将立即被拒绝，并放弃所有其他promise的结果。

要记得总是给每个promise添加拒绝/错误处理器，即使和特别是那个从`Promise.all([ .. ])`返回的promise。

### Promise.race([ .. ])

虽然`Promise.all([ .. ])`并发地协调多个Promise并假定它们都需要被完成，但是有时候你只想应答“冲过终点的第一个Promise”，而让其他的Promise被丢弃。

这种模式经典地被称为“闩”，但在Promise中它被称为一个“竞合（race）”。

**警告：** 虽然“只有第一个冲过终点的算赢”是一个非常合适被比喻，但不幸的是“竞合（race）”是一个被占用的词，因为“竞合状态（race conditions）”通常被认为是程序中的Bug（见第一章）。不要把`Promise.race([ .. ])`与“竞合状态（race conditions）”搞混了。

“竞合状态（race conditions）”也期待一个单独的`array`参数，含有一个或多个Promise，thenable，或立即值。与立即值进行竞合并没有多大实际意义，因为很明显列表中的第一个会胜出——就像赛跑时有一个选手在终点线上起跑！

和`Promise.all([ .. ])`相似，`Promise.race([ .. ])`将会在任意一个Promise解析为完成时完成，而且它会在任意一个Promise解析为拒绝时拒绝。

**注意：** 一个“竞合（race）”需要至少一个“选手”，所以如果你传入一个空的`array`，`race([..])`的主Promise将不会立即解析，反而是永远不会被解析。这是砸自己的脚！ES6应当将它规范为要么完成，要么拒绝，或者要么抛出某种同步错误。不幸的是，因为在ES6的`Promise`之前的Promise库的优先权高，他们不得不把这个坑留在这儿，所以要小心绝不要传入一个空`array`。

让我们重温刚才的并发Ajax的例子，但是在`p1`和`p2`竞合的环境下：

```js
// `request(..)`是一个兼容Promise的Ajax工具
// 就像我们在本章早前定义的

var p1 = request( "http://some.url.1/" );
var p2 = request( "http://some.url.2/" );

Promise.race( [p1,p2] )
.then( function(msg){
	// `p1`或`p2`会赢得竞合
	return request(
		"http://some.url.3/?v=" + msg
	);
} )
.then( function(msg){
	console.log( msg );
} );
```

因为只有一个Promise会胜出，所以完成的值是一个单独的消息，而不是一个像`Promise.all([ .. ])`中那样的`array`。

#### 超时竞合

我们早先看过这个例子，描述`Promise.race([ .. ])`如何能够用于表达“promise超时”模式：

```js
// `foo()`是一个兼容Promise

// `timeoutPromise(..)`在早前定义过，
// 返回一个在指定延迟之后会被拒绝的Promise

// 为`foo()`设置一个超时
Promise.race( [
	foo(),					// 尝试`foo()`
	timeoutPromise( 3000 )	// 给它3秒钟
] )
.then(
	function(){
		// `foo(..)`及时地完成了！
	},
	function(err){
		// `foo()`要么是被拒绝了，要么就是没有及时完成
		// 可以考察`err`来知道是哪一个原因
	}
);
```

这种超时模式在绝大多数情况下工作的很好。但这里有一些微妙的细节要考虑，而且坦率的说它们对于`Promise.race([ .. ])`和`Promise.all([ .. ])`都同样需要考虑。

#### "Finally"

要问的关键问题是，“那些被丢弃/忽略的promise发生了什么？”我们不是从性能的角度在问这个问题——它们通常最终会变成垃圾回收的合法对象——而是从行为的角度（副作用等等）。Promise不能被取消——而且不应当被取消，因为那会摧毁本章稍后的“Promise不可取消”一节中要讨论的外部不可变性——所以它们只能被无声地忽略。

但如果前面例子中的`foo()`占用了某些资源，但超时首先触发而且导致这个promise被忽略了呢？这种模式中存在某种东西可以在超时后主动释放被占用的资源，或者取消任何它可能带来的副作用吗？要是你想做的全部只是记录下`foo()`超时的事实呢？

一些开发者提议，Promise需要一个`finally(..)`回调注册机制，它总是在Promise解析时被调用，而且允许你制定任何可能的清理操作。在当前的语言规范中它还不存在，但它可能会在ES7+中加入。我们不得不边走边看了。

它看起来可能是这样：

```js
var p = Promise.resolve( 42 );

p.then( something )
.finally( cleanup )
.then( another )
.finally( cleanup );
```

**注意：** 在各种Promise库中，`finally(..)`依然会创建并返回一个新的Promise（为了使链条延续下去）。如果`cleanup(..)`函数返回一个Promise，它将会链入链条，这意味着你可能还有我们刚才讨论的未处理拒绝的问题。

同时，我们可以制造一个静态的帮助工具来让我们观察（但不干涉）Promise的解析：

```js
// 填补的安全检查
if (!Promise.observe) {
	Promise.observe = function(pr,cb) {
		// 从侧面观察`pr`的解析
		pr.then(
			function fulfilled(msg){
				// 异步安排回调（作为Job）
				Promise.resolve( msg ).then( cb );
			},
			function rejected(err){
				// 异步安排回调（作为Job）
				Promise.resolve( err ).then( cb );
			}
		);

		// 返回原本的promise
		return pr;
	};
}
```
这是我们在前面的超时例子中如何使用它：

```js
Promise.race( [
	Promise.observe(
		foo(),					// 尝试`foo()`
		function cleanup(msg){
			// 在`foo()`之后进行清理，即便它没有及时完成
		}
	),
	timeoutPromise( 3000 )	// 给它3秒钟
] )
```

这个`Promise.observe(..)`帮助工具只是描述你如何在不干扰Promise的情况下观测它的完成。其他的Promise库有他们自己的解决方案。不论你怎么做，你都将很可能有个地方想用来确认你的Promise没有意外地被无声地忽略掉。

### all([ .. ]) 与 race([ .. ]) 的变种

原生的ES6Promise带有内建的`Promise.all([ .. ])`和`Promise.race([ .. ])`，这里还有几个关于这些语义的其他常用的变种模式：

* `none([ .. ])`很像`all([ .. ])`，但是完成和拒绝被转置了。所有的Promise都需要被拒绝——拒绝变成了完成值，反之亦然。
* `any([ .. ])`很像`all([ .. ])`，但它忽略任何拒绝，所以只有一个需要完成即可，而不是它们所有的。
* `first([ .. ])`像是一个带有`any([ .. ])`的竞合，它忽略任何拒绝，而且一旦有一个Promise完成时，它就立即完成。
* `last([ .. ])`很像`first([ .. ])`，但是只有最后一个完成胜出。

某些Promise抽象工具库提供这些方法，但你也可以用Promise机制的`race([ .. ])`和`all([ .. ])`，自己定义他们。

比如，这是我们如何定义`first([..])`:

```js
// 填补的安全检查
if (!Promise.first) {
	Promise.first = function(prs) {
		return new Promise( function(resolve,reject){
			// 迭代所有的promise
			prs.forEach( function(pr){
				// 泛化它的值
				Promise.resolve( pr )
				// 无论哪一个首先成功完成，都由它来解析主promise
				.then( resolve );
			} );
		} );
	};
}
```

**注意：** 这个`first(..)`的实现不会在它所有的promise都被拒绝时拒绝；它会简单地挂起，很像`Promise.race([])`。如果需要，你可以添加一些附加逻辑来追踪每个promise的拒绝，而且如果所有的都被拒绝，就在主promise上调用`reject()`。我们将此作为练习留给读者。

### 并发迭代

有时候你想迭代一个Promise的列表，并对它们所有都实施一些任务，就像你可以对同步的`array`做的那样（比如，`forEach(..)`，`map(..)`，`some(..)`，和`every(..)`）。如果对每个Promise实施的操作根本上是同步的，它们工作的很好，正如我们在前面的代码段中用过的`forEach(..)`。

但如果任务在根本上是异步的，或者可以/应当并发地实施，你可以使用许多库提供的异步版本的这些工具方法。

比如，让我们考虑一个异步的`map(..)`工具，它接收一个`array`值（可以是Promise或任何东西），外加一个对数组中每一个值实施的函数（任务）。`map(..)`本身返回一个promise，它的完成值是一个持有每个任务的异步完成值的`array`（以与映射（mapping）相同的顺序）：

```js
if (!Promise.map) {
	Promise.map = function(vals,cb) {
		// 一个等待所有被映射的promise的新promise
		return Promise.all(
			// 注意：普通的数组`map(..)`，
			// 将值的数组变为promise的数组
			vals.map( function(val){
				// 将`val`替换为一个在`val`
				// 异步映射完成后才解析的新promise
				return new Promise( function(resolve){
					cb( val, resolve );
				} );
			} )
		);
	};
}
```

**注意：** 在这种`map(..)`的实现中，你无法表示异步拒绝，但如果一个在映射的回调内部发生一个同步的异常/错误，那么`Promise.map(..)`返回的主Promise就会拒绝。

让我们描绘一下对一组Promise（不是简单的值）使用`map(..)`：

```js
var p1 = Promise.resolve( 21 );
var p2 = Promise.resolve( 42 );
var p3 = Promise.reject( "Oops" );

// 将列表中的值翻倍，即便它们在Promise中
Promise.map( [p1,p2,p3], function(pr,done){
	// 确保列表中每一个值都是Promise
	Promise.resolve( pr )
	.then(
		// 将值作为`v`抽取出来
		function(v){
			// 将完成的`v`映射到新的值
			done( v * 2 );
		},
		// 或者，映射到promise的拒绝消息上
		done
	);
} )
.then( function(vals){
	console.log( vals );	// [42,84,"Oops"]
} );
```

## Promise API概览

让我们复习一下我们已经在本章中零散地展开的ES6`Promise`API。

**注意：** 下面的API尽管在ES6中是原生的，但也存在一些语言规范兼容的填补（不光是扩展Promise库），它们定义了`Promise`和与之相关的所有行为，所以即使是在前ES6时代的浏览器中你也以使用原生的Promise。这类填补的其中之一是“Native Promise Only”(http://github.com/getify/native-promise-only)，我写的！

### new Promise(..)构造器

*揭示构造器（revealing constructor）* `Promise(..)`必须与`new`一起使用，而且必须提供一个被同步/立即调用的回调函数。这个函数被传入两个回调函数，它们作为promise的解析能力。我们通常将它们标识为`resolve(..)`和`reject(..)`：

```js
var p = new Promise( function(resolve,reject){
	// `resolve(..)`给解析/完成的promise
	// `reject(..)`给拒绝的promise
} );
```

`reject(..)`简单地拒绝promise，但是`resolve(..)`既可以完成promise，也可以拒绝promise，这要看它被传入什么值。如果`resolve(..)`被传入一个立即的，非Promise，非thenable的值，那么这个promise将用这个值完成。

但如果`resolve(..)`被传入一个Promise或者thenable的值，那么这个值将被递归地展开，而且无论它最终解析结果/状态是什么，都将被promise采用。

### Promise.resolve(..) 和 Promise.reject(..)

一个用于创建已被拒绝的Promise的简便方法是`Promise.reject(..)`，所以这两个promise是等价的：

```js
var p1 = new Promise( function(resolve,reject){
	reject( "Oops" );
} );

var p2 = Promise.reject( "Oops" );
```

与`Promise.reject(..)`相似，`Promise.resolve(..)`通常用来创建一个已完成的Promise。然而，`Promise.resolve(..)`还会展开thenale值（就像我们已经几次讨论过的）。在这种情况下，返回的Promise将会采用你传入的thenable的解析，它既可能是完成，也可能是拒绝：

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

// `p1`将是一个完成的promise
// `p2`将是一个拒绝的promise
```

而且要记住，如果你传入一个纯粹的Promise，`Promise.resolve(..)`不会做任何事情；它仅仅会直接返回这个值。所以在你不知道其本性的值上调用`Promise.resolve(..)`不会有额外的开销，如果它偶然已经是一个纯粹的Promise。

### then(..) 和 catch(..)

每个Promise实例（**不是** `Promise` API 名称空间）都有`then(..)`和`catch(..)`方法，它们允许你为Promise注册成功或拒绝处理器。一旦Promise被解析，它们中的一个就会被调用，但不是都会被调用，而且它们总是会被异步地调用（参见第一章的“Jobs”）。

`then(..)`接收两个参数，第一个用于完成回调，第二个用户拒绝回调。如果它们其中之一被省略，或者被传入一个非函数的值，那么一个默认的回调就会分别顶替上来。默认的完成回调简单地将值向下传递，而默认的拒绝回调简单地重新抛出（传播）收到的拒绝理由。

`catch(..)`仅仅接收一个拒绝回调作为参数，而且会自动的顶替一个默认的成功回调，就像我们讨论过的。换句话说，它等价于`then(null,..)`：

```js
p.then( fulfilled );

p.then( fulfilled, rejected );

p.catch( rejected ); // 或者`p.then( null, rejected )`
```

`then(..)`和`catch(..)`也会创建并返回一个新的promise，它可以用来表达Promise链式流程控制。如果完成或拒绝回调有异常被抛出，这个返回的promise就会被拒绝。如果这两个回调之一返回一个立即，非Promise，非thenable值，那么这个值就会作为被返回的promise的完成。如果完成处理器指定地返回一个promise或thenable值这个值就会被展开而且变成被返回的promise的解析。

### Promise.all([ .. ]) 和 Promise.race([ .. ])

在ES6的`Promise`API的静态帮助方法`Promise.all([ .. ])`和`Promise.race([ .. ])`都创建一个Promise作为它们的返回值。这个promise的解析完全由你传入的promise数组控制。

对于`Promise.all([ .. ])`，为了被返回的promise完成，所有你传入的promise都必须完成。如果其中任意一个被拒绝，返回的主promise也会立即被拒绝（丢弃其他所有promise的结果）。至于完成状态，你会收到一个含有所有被传入的promise的完成值的`array`。至于拒绝状态，你仅会收到第一个promise拒绝的理由值。这种模式通常称为“门”：在门打开前所有人都必须到达。

对于`Promise.race([ .. ])`，只有第一个解析（成功或拒绝）的promise会“胜出”，而且不论解析的结果是什么，都会成为被返回的promise的解析结果。这种模式通常成为“闩”：第一个打开门闩的人才能进来。考虑这段代码：

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

**警告：** 要小心！如果一个空的`array`被传入`Promise.all([ .. ])`，它会立即完成，但`Promise.race([ .. ])`却会永远挂起，永远不会解析。

ES6的`Promise`API十分简单和直接。对服务于大多数基本的异步情况来说它足够好了，而且当你要把你的代码从回调地狱变为某些更好的东西时，它是一个开始的好地方。

但是依然还有许多应用程序所要求的精巧的异步处理，由于Promise本身所受的限制而不能解决。在下一节中，为了有效利用Promise库，我们将深入检视这些限制。

## Promise的限制

本节中我们将要讨论的许多细节已经在这一章中被提及了，但我们将明确地复习这些限制。

### 顺序的错误处理

我们在本章前面的部分详细讲解了Promise风格的错误处理。Promise的设计方式——特别是他们如何链接——所产生的限制，创建了一个非常容易掉进去的陷阱，Promise链中的错误会被意外地无声地忽略掉。

但关于Promise的错误还有一些其他事情要考虑。因为Promise链只不过是将组成它的Promise连在一起，没有一个实体可以用来将整个链条表达为一个单独的 *东西*，这意味着没有外部的方法能够监听可能发生的任何错误。

如果你构建一个不包含错误处理器的Promise链，这个链条的任意位置发生的任何错误都将沿着链条向下无限传播，直到被监听为止（通过在某一步上注册拒绝处理器）。所以，在这种特定情况下，拥有链条的最后一个promise的引用就够了（下面代码段中的`p`），因为你可以在这里注册拒绝处理器，而且它会被所有传播的错误通知：

```js
// `foo(..)`, `STEP2(..)` 和 `STEP3(..)`
// 都是promise兼容的工具

var p = foo( 42 )
.then( STEP2 )
.then( STEP3 );
```

虽然这看起来有点儿小糊涂，但是这里的`p`没有指向链条中的第一个promise（`foo(42)`调用中来的那一个），而是指向了最后一个promise，来自于`then(STEP3)`调用的那一个。

另外，这个promise链条上看不到一个步骤做了自己的错误处理。这意味着你可以在`p`上注册一个拒绝处理器，如果在链条的任意位置发生了错误，它就会被通知。

```js
p.catch( handleErrors );
```

但如果这个链条中的某一步事实上做了自己的错误处理（也许是隐藏/抽象出去了，所以你看不到），那么你的`handleErrors(..)`就不会被通知。这可能是你想要的——它毕竟是一个“被处理过的拒绝”——但它也可能 *不* 是你想要的。完全缺乏被通知的能力（被“已处理过的”拒绝错误通知）是一个在某些用法中约束功能的一种限制。

它基本上和`try..catch`中存在的限制是相同的，它可以捕获一个异常并简单地吞掉。所以这不是一个 **Promise特有** 的问题，但它确实是一个我们希望绕过的限制。

不幸的是，许多时候Promise链序列的中间步骤不会被留下引用，所以没有这些引用，你就不能添加错误处理器来可靠地监听错误。

### 单独的值

根据定义，Promise只能有一个单独的完成值或一个单独的拒绝理由。在简单的例子中，这没什么大不了的，但在更精巧的场景下，你可能发现这个限制。

通常的建议是构建一个包装值（比如`object`或`array`）来包含这些多个消息。这个方法好用，但是在你的Promise链的每一步上把消息包装再拆开显得十分尴尬和烦人。

#### 分割值

有时你可以将这种情况当做一个信号，表示你可以/应当将问题拆分为两个或更多的Promise。

想象你有一个工具`foo(..)`，它异步地产生两个值（`x`和`y`）：

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
		// 将两个值包装近一个容器
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

首先，让我们重新安排一下`foo(..)`返回的东西，以便于我们不必再将`x`和`y`包装进一个单独的`array`值中来传送给一个Promise。相反，我们将每一个值包装进它自己的promise：

```js
function foo(bar,baz) {
	var x = bar * baz;

	// 将两个promise返回
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

一个promise的`array`真的要比传递给一个单独的Promise的值的`array`要好吗？语法上，它没有太多改进。

但是这种方式更加接近于Promise的设计原理。现在它更易于在未来将`x`与`y`的计算分开，重构进两个分离的函数中。它更清晰，也允许调用端代码更灵活地安排这两个promise——这里使用了`Promise.all([ .. ])`，但它当然不是唯一的选择——而不是将这样的细节在`foo(..)`内部进行抽象。

#### 展开/散开参数

`var x = ..`和`var y = ..`的赋值依然是一个尴尬的负担。我们可以在一个帮助工具中利用一些函数式技巧（向Reginald Braithwaite致敬，在推特上 @raganwald ）：

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

看起来好些了！当然，你可以内联这个函数式魔法来避免额外的帮助函数：

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

这个技巧可能很整洁，但是ES6给了我们一个更好的答案：解构（destructuring）。数组的解构赋值形式看起来像这样：

```js
Promise.all(
	foo( 10, 20 )
)
.then( function(msgs){
	var [x,y] = msgs;

	console.log( x, y );	// 200 599
} );
```

最棒的是，ES6提供了数组参数解构形式：

```js
Promise.all(
	foo( 10, 20 )
)
.then( function([x,y]){
	console.log( x, y );	// 200 599
} );
```

我们现在已经接受了“每个Promise一个值”的准则，继续让我们把模板代码最小化！

**注意：** 更多关于ES6解构形式的信息，参阅本系列的 *ES6与未来*。

### 单次解析

Promise的一个最固有的行为之一就是，一个Promise只能被解析一次（成功或拒绝）。对于多数异步用例来说，你仅仅取用这个值一次，所以这工作的很好。

但也有许多异步情况适用于一个不同的模型——更类似于事件和/或数据流。表面上看不清Promise能对这种用例适应的多好，如果能的话。没有基于Promise的重大抽象过程，它们完全缺乏对多个值解析的处理。

想象这样一个场景，你可能想要为响应一个刺激（比如事件）触发一系列异步处理步骤，而这实际上将会发生多次，比如按钮点击。

这可能不会像你想的那样工作：

```js
// `click(..)` 绑定了一个DOM元素的 `"click"` 事件
// `request(..)` 是先前定义的支持Promise的Ajax

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

这里的行为仅能在你的应用程序只让按钮被点击一次的情况下工作。如果按钮被点击第二次，promise`p`已经被解析了，所以第二个`resolve(..)`将被忽略。

相反的，你可能需要将模式反过来，在每次事件触发时创建一个全新的Promise链：

```js
click( "#mybtn", function(evt){
	var btnID = evt.currentTarget.id;

	request( "http://some.url.1/?id=" + btnID )
	.then( function(text){
		console.log( text );
	} );
} );
```

这种方式会 *好用*，为每个按钮上的`"click"`事件发起一个全新的Promise序列。

但是除了在事件处理器内部定义一整套Promise链看起来很丑以外，这样的设计在某种意义上违背了关注/能力分离原则（SoC）。你可能非常想在一个你的代码不同的地方定义事件处理器：你定义对事件的 *响应*（Promise链）的地方。如果没有帮助机制，在这种模式下这么做很尴尬。

**注意：** 这种限制的另一种表述方法是，如果我们能够构建某种能在它上面进行Promise链监听的“可监听对象（observable）”就好了。有一些库已经建立这些抽象（比如RxJS——http://rxjs.codeplex.com/ ），但是这种抽象看起来是如此的重，以至于你甚至再也看不到Promise的性质。这样的重抽象带来一个重要的问题：这些机制是否像Promise本身被设计的一样 *可靠*。我们将会在附录B中重新讨论“观察者（Observable）”模式。

### 惰性

对于在你的代码中使用Promise而言一个实在的壁垒是，现存的所有代码都没有支持Promise。如果你有许多基于回调的代码，让代码保持相同的风格容易多了。

“一段基于动作（用回调）的代码将仍然基于动作（用回调），除非一个更聪明，具有Promise意识的开发者对它采取行动。”

Promise提供了一种不同的模式规范，如此，代码的表达方式可能会变得有一点儿不同，某些情况下，则根本不同。你不得不有意这么做，因为Promise不仅只是把那些为你服务至今的老式编码方法自然地抖落掉。

考虑一个像这样的基于回调的场景：

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

将这个基于回调的代码转换为支持Promise的代码的第一步该怎么做，是立即明确的吗？这要看你的经验。你练习的越多，它就感觉越自然。但当然，Promise没有明确告知到底怎么做——没有一个放之四海而皆准的答案——所以这要靠你的责任心。

就像我们以前讲过的，我们绝对需要一种支持Promise的Ajax工具来取代基于回调的工具，我们可以称它为`request(..)`。你可以制造自己的，正如我们已经做过的。但是不得不为每个基于回调的工具手动定义Promise相关的包装器的负担，使得你根本就不太可能选择将代码重构为Promise相关的。

Promise没有为这种限制提供直接的答案。但是大多数Promise库确实提供了帮助函数。想象一个这样的帮助函数：

```js
// 填补的安全检查
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

好吧，这可不是一个微不足道的工具。然而，虽然他可能看起来有点儿令人生畏，但也没有你想的那么糟。它接收一个函数，这个函数期望一个错误优先风格的回调作为第一个参数，然后返回一个可以自动创建Promise并返回的新函数，然后为你替换掉回调，与Promise的完成/拒绝连接在一起。

与其浪费太多时间谈论这个`Promise.wrap(..)`帮助函数 *如何* 工作，还不如让我们来看看如何使用它：

```js
var request = Promise.wrap( ajax );

request( "http://some.url.1/" )
.then( .. )
..
```

哇哦，真简单！

`Promise.wrap(..)` **不会** 生产Promise。它生产一个将会生产Promise的函数。某种意义上，一个Promise生产函数可以被看做一个“Promise工厂”。我提议将这样的东西命名为“promisory”（"Promise" + "factory"）。

这种将期望回调的函数包装为一个Promise相关的函数的行为，有时被称为“提升（lifting）”或“promise化（promisifying）”。但是除了“提升过的函数”以外，看起来没有一个标准的名词来称呼这个结果函数，所以我更喜欢“promisory”，因为我认为他更具描述性。

**注意：** Promisory不是一个瞎编的词。它是一个真实存在的词汇，而且它的定义是含有或载有一个promise。这正是这些函数所做的，所以这个术语匹配得简直完美！

那么，`Promise.wrap(ajax)`生产了一个我们称为`request(..)`的`ajax(..)`promisory，而这个promisory为Ajax应答生产Promise。

如果所有的函数已经都是promisory，我们就不需要自己制造它们，所以额外的步骤就有点儿多余。但是至少包装模式是（通常都是）可重复的，所以我们可以把它放进`Promise.wrap(..)`帮助函数中来支援我们的promise编码。

那么回到刚才的例子，我们需要为`ajax(..)`和`foo(..)`都做一个promisory。

```js
// 为`ajax(..)`制造一个promisory
var request = Promise.wrap( ajax );

// 重构`foo(..)`，但是为了代码其他部分
// 的兼容性暂且保持它对外是基于回调的
// ——仅在内部使用`request(..)`'的promise
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

// 现在，为了这段代码本来的目的，为`foo(..)`制造一个promisory
var betterFoo = Promise.wrap( foo );

// 并使用这个promisory
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

当然，虽然我们将`foo(..)`重构为使用我们的新`request(..)`promisory，我们可以将`foo(..)`本身制成promisory，而不是保留基于会掉的实现并需要制造和使用后续的`betterFoo(..)`promisory。这个决定只是要看`foo(..)`是否需要保持基于回调的形式以便于代码的其他部分兼容。

考虑这段代码：

```js
// 现在，`foo(..)`也是一个promisory
// 因为它委托到`request(..)` promisory
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

foo( 11, 31 )
.then( .. )
..
```

虽然ES6的Promise没有为这样的promisory包装提供原生的帮助函数，但是大多数库提供它们，或者你可以制造自己的。不管哪种方法，这种Promise特定的限制是可以不费太多劲儿就可以解决的（当然是和回调地狱的痛苦相比！）。

### Promise不可撤销

一旦你创建了一个Promise并给它注册了一个完成和/或拒绝处理器，就没有什么你可以从外部做的事情能停止这个进程，即使是某些其他的事情使这个任务变得毫无意义。

**注意：** 许多Promise抽象库都提供取消Promise的功能，但这是一个非常坏的主意！许多开发者都希望Promise被原生地设计为具有外部取消能力，但问题是这将允许Promise的一个消费者/监听器影响某些其他消费者监听同一个Promise的能力。这违反了未来值得可靠性原则（外部不可变），另外就是嵌入了“远距离行为（action at a distance）”的反模式（http://en.wikipedia.org/wiki/Action_at_a_distance_%28computer_programming%29 ）。不管它看起来多么有用，它实际上会直接将你引回与回调地狱相同的噩梦。

考虑我们早先的Promise超时场景：

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
	// 即使是在超时的情况下也会发生 :(
} );
```

“超时”对于promise`p`来说是外部的，所以`p`本身继续运行，这可能不是我们想要的。

一个选项是侵入性地定义你的解析回调：

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
		// 仅在没有超时的情况下发生！ :)
	}
} );
```

很难看。这可以工作，但是远不理想。一般来说，你应当避免这样的场景。

但是如果你不能，这种解决方案的丑陋应当是一个线索，说明 *取消* 是一种属于在Promise之上的更高层抽象的功能。我推荐你找一个Promise抽象库来辅助你，而不是自己使用黑科技。

**注意：** 我的 *asynquence* Promise抽象库提供了这样的抽象，还为序列提供了一个`abort()`能力，这一切将在附录A中讨论。

一个单独的Promise不是真正的流程控制机制（至少没有多大实际意义），而流程控制机制正是 *取消* 要表达的；这就是为什么Promise取消显得尴尬。

相比之下，一个链条的Promise集合在一起——我称之为“序列”—— *是* 一个流程控制的表达，如此在这一层面的抽象上它就适于定义取消。

没有一个单独的Promise应该是可以取消的，但是一个 *序列* 可以取消是有道理的，因为你不会将一个序列作为一个不可变值传来传去，就像Promise那样。

### Promise性能

这种限制既简单又复杂。

比较一下在基于回调的异步任务链和Promise链上有多少东西在动，很明显Promise有多得多的事情发生，这意味着它们自然地会更慢一点点。回想一下Promise提供的保证信任的简单列表，将它和你为了达到相同保护效果而在回调上面添加的特殊代码比较一下。

更多工作要做，更多的安全要保护，意味着Promise与赤裸裸的，不可靠的回调相比 *确实* 更慢。这些都很明显，可能很容易萦绕在你脑海中。

但是慢多少？好吧……这实际上是一个难到不可思议的问题，无法绝对，全面地回答。

坦白地说，这是一个比较苹果和橘子的问题，所以可能是问错了。你实际上应当比较的是，带有所有手动保护层的经过特殊处理的回调系统，是否比一个Promise实现要快。

如果说Promise有一种合理的性能限制，那就是它并不将可靠性保护的选项罗列出来让你选择——你总是一下得到全部。

如果我们承认Promise一般来说要比它的非Promise，不可靠的回调等价物 *慢一点儿*——假定在有些地方你觉得你可以自己调整可靠性的缺失——难道这意味着Promise应当被全面地避免，就好像你的整个应用程序仅仅由一些可能的“必须绝对最快”的代码驱动着？

扪心自问：如果你的代码有那么合理，那么 **对于这样的任务，JavaScript是正确的选择吗？** 为了运行应用程序JavaScript可以被优化得十分高效（参见第五章和第六章）。但是在Promise提供的所有好处的光辉之下，过于沉迷它微小的性能权衡，*真的* 合适吗？

另一个微妙的问题是Promise使 *所有事情* 都成为异步的，这意味着有些应当立即完成的（同步的）步骤也要推迟到下一个Job步骤中（参见第一章）。也就是说一个Promise任务序列要比使用回调连接的相同序列要完成的稍微慢一些是可能的。

当然，这里的问题是：这些关于性能的微小零头的潜在疏忽，和我们在本章通篇阐述的Promise带来的益处相比，*还值得考虑吗？*

我的观点是，在几乎所有你可能认为Promise的性能慢到了需要被考虑的情况下，完全回避Promise并将它的可靠性和组合性优化掉，实际上是一种反模式。

相反地，你应当默认地在代码中广泛使用它们，然后再记录并分析你的应用程序的热（关键）路径。Promise *真的* 是瓶颈？还是它们只是理论上慢了下来？只有在那 *之后*，拿着实际合法的基准分析观测数据（参见第六章），再将Promise从这些关键区域中重构移除才称得上是合理与谨慎。

Promise是有一点儿慢，但作为交换你得到了很多内建的可靠性，无Zalgo的可预测性，与组合性。也许真正的限制不是它们的性能，而是你对它们的益处缺乏认识？

## 复习

Promise很牛。用它们。它们解决了肆虐在回调代码中的 *控制倒转* 问题。

它们没有摆脱回调，而是重新定向了这些回调的组织安排方式，是它成为一种坐落于我们和其他工具之间的可靠的中间机制。

Promise链还开始以顺序的风格定义了一种更好的（当然，还不完美）表达异步流程的方式，它帮我们的大脑更好的规划和维护异步JS代码。我们会在下一章中看到一个更好的解决 *这个* 问题的方法！
