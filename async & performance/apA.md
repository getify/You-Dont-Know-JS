# 你不懂JS: 异步与性能
# 附录A: *asynquence* 库

第一章和第二章相当详细地探讨了常见的异步编程模式，以及如何通过回调解决它们。但我们也看到了为什么回调在处理能力上有着致命的缺陷，这将我们带到了第三章和第四章，Promise 与 Generator 为你的异步流程构建提供了一个更加坚实，可信，以及可推理的基础。

我在这本书中好几次提到我自己的异步库 *asynquence* (http://github.com/getify/asynquence) —— “async” + “sequence” = “asynquence”，现在我想简要讲解一下它的工作原理，以及它的独特设计为什么很重要和很有用。

在下一篇附录中，我们将要探索一些高级的异步模式，但为了它们的可用性能够使人接受你可能需要一个库。我们将使用 *asynquence* 来表达这些模式，所以你会想首先在这里花一点时间来了解这个库。

*asynquence* 绝对不是优秀异步编码的唯一选择；在这方面当然有许多了不起的库。但是 *asynquence* 提供了一种独特的视角 —— 通过将这些模式中最好的部分组合进一个单独的库，另外它基于一个基本的抽象：（异步）序列。

我的前提是，精巧的JS程序经常或多或少地需要将各种不同的异步模式交织在一起，而且这通常是完全依靠每个开发者自己去搞清楚的。与其引入关注于异步流程的不同方面的两个或更多的库，*asynquence* 将它们统一为各种序列步骤，成为单独一个需要学习和部署的核心库。

我相信 *asynquence* 有足够高的价值可以使 Promise 风格的异步流程控制编程变得超级容易完成，这就是我们为什么会在这里单单关注这个库。

开始之前，我将讲解 *asynquence* 背后的设计原则，然后我们将使用代码示例来展示它的API如何工作。

## 序列，抽象设计

对 *asynquence* 的理解开始于对一个基础抽象的理解：对于一个任务的任何一系列步骤来说，无论它们是同步的还是异步的，都可以被综合地考虑为一个“序列（sequence）”。换句话说，一个序列是一个容器，它代表一个任务，并由一个个完成这个任务的独立的（可能是异步的）步骤组成。

在这个序列中的每一个步骤都处于一个 Promise（见第三章） 的控制之下。也就是你向一个序列添加的每一个步骤都隐含地创建了一个 Promise，它被链接到这个序列的末尾。由于 Promise 的语义，在一个序列中的每一个步骤的推进都是异步的，即使你同步地完成这个步骤。

另外，一个序列将总是一步一步线性地进行，也就是步骤2总是发生在步骤1完成之后，如此类推。

当然，一个新的序列可以从既存的序列中分支出来，也就是分支仅在主序列在流程中到达那一点时发生。序列还可以用各种方式组合，包括使一个序列在流程中的一个特定的位置汇合另一个序列。

一个序列与 Promise 链有些相像。但是，在 Promise 链中，不存在一个可以引用整个链条的“把手”可以抓住。不管你持有哪一个 Promise 的引用，它都表示链条中当前的步骤外加挂载在它后面的其他步骤。实质上，你无法持有一个 Promise 链条的引用，除非你持有链条中第一个 Promise 的引用。

许多情况表明，持有一个综合地指向整个序列的引用是十分有用的。这些情况中最重要的一种就是序列的退出/取消。正如我们在第三章中展开谈过的那样，Promise 本身绝不应当是可以取消的，因为这违反了一个基本设计规则：外部不可变性。

但是序列没有这样的不可变性设计原则，这主要是由于序列不会作为需要不可变语义的未来值的容器被传递。所以序列是一个处理退出/取消行为的恰当的抽象层面。*asynquence* 序列可以在任何时候`abort()`，而且这个序列将会停止在那一点而不会因为任何原因继续下去。

为了流程控制，还有许多理由首选序列的抽象而非 Promise 链。

首先，Promise 链是一个更加手动的处理 —— 一旦你开始在你的程序中大面积地创建和链接 Promise ，这种处理可能会变得相当烦冗 —— 在那些使用 Promise 相当恰当的地方，这种烦冗会降低效率而使得开发者不愿使用Promise。

抽象意味着减少模板代码和烦冗，所以序列抽象是这个问题的一个好的解决方案。使用 Promise，你关注的是个别的步骤，而且不太会假定你将延续这个链条。而序列采用相反的方式，它假定序列将会无限地持续添加更多步骤。

当你开始考虑更高阶的 Promise 模式时（除了`race([..])`和`all([..])`以外），这种抽象复杂性的降低特别强大。

例如，在一个序列的中间，你可能想表达一个在概念上类似于`try..catch`的步骤，它的结果将总是成功，不管是意料之中的主线上的成功解析，还是为被捕获的错误提供一个正面的非错误信号。或者，你可能想表达一个类似于 retry/until 循环的步骤，它不停地尝试相同的步骤直到成功为止。

仅仅使用基本的 Promise，这类抽象不是很容易表达，而且在一个既存的 Promise 链的中间这样做不好看。但如果你将你的想法抽象为一个序列，并将一个步骤考虑为一个 Promise 的包装，这个包装可以隐藏这样的细节，它就可以使你以最合理的方式考虑流程控制，而不必关心细节。

第二，也许是更重要的，将异步流程控制考虑为一个序列中的步骤，允许你将这样的细节抽象出去 —— 每一个步骤中引入了哪一种异步性。在这种抽象之下，一个 Promise 将总是控制着步骤，但在抽象之上，这个步骤可以看起来像一个延续回调（简单的默认值），或者一个真正的 Promise，或者一个运行至完成的 Generator，或者... 希望你明白我的意思。

第三，序列可以通容易地被调整来适应于不同的思考模式，比如基于事件的，基于流的，或者基于相应式的编码。*asynquence* 提供了一种我称为“响应式序列”的模式（我们稍后讲解），它是 RxJS（“Reactive Extensions”） 中“响应式可监听”思想的变种，允许重复的事件每次触发一个新的序列实例。Promise 是一次性的，所以单独使用 Promise 来表达重复的异步性十分尴尬。

在一种我称为“可迭代序列”的模式中，另一种思考模式反转了解析/控制能力。与每一个步骤在内部控制它自己的完成（并因此推进这个序列）不同，序列被反转为通过一个外部迭代器来进行推进控制，而且在这个 *可迭代序列* 中的每一步仅仅应答`next(..)`*迭代器* 控制。

在本附录的剩余部分，我们将探索所有这些不同的种类，所以如果我们刚才的步伐太快也不要担心。

要点是，对于复杂的异步处理来说，序列是一个要比单纯的 Promise（Promise链）或单纯的 Generator 更加强大与合理的抽象，而 *asynquence* 被设计为使用恰当层面的语法糖来表达这种抽象，使得异步编程变得更加易于理解和更加令人愉快。

## *asynquence* API

首先，你创建一个序列（一个 *asynquence* 实例）的方法是使用`ASQ(..)`函数。一个不带参数的`ASQ()`调用会创建一个空的初始序列，而向`ASQ(..)`传递一个或多个值或函数的话，它会使用每个参数值代表序列的初始步骤来创建序列。

**注意：** 为了这里所有的代码示例，我将使用 *asynquence* 在浏览器全局作用域中的顶层标识符：`ASQ`。如果你通过一个模块系统（在浏览器或服务器中）引入并使用 *asynquence*，你当然可以定义自己喜欢的符号，*asynquence* 不会关心这些！

许多在这里讨论的API方法都内建于 *asynquence* 的核心部分，而其他的API是通过引入可选的“contrib”插件包提供的。要知道一个方法是内建的还是通过插件定义的，可以参见 *asynquence* 的文档：http://github.com/getify/asynquence

### 步骤

如果一个函数代表序列中的一个普通步骤，那么这个函数会被这样调用：第一个参数是延续回调，而任何后续参数都是从前一个步骤中传递下来的消息。在延续回调被调用之前，这个步骤将不会完成。一旦延续回调被调用，你传递给它的任何参数值都会作为序列下一个步骤中的消息被发送。

要向一个序列添加额外的普通步骤，调用`then(..)`（它实质上与`ASQ(..)`调用的语义完全相同）：

```js
ASQ(
	// 步骤 1
	function(done){
		setTimeout( function(){
			done( "Hello" );
		}, 100 );
	},
	// 步骤 2
	function(done,greeting) {
		setTimeout( function(){
			done( greeting + " World" );
		}, 100 );
	}
)
// 步骤 3
.then( function(done,msg){
	setTimeout( function(){
		done( msg.toUpperCase() );
	}, 100 );
} )
// 步骤 4
.then( function(done,msg){
	console.log( msg );			// HELLO WORLD
} );
```

**注意：** 虽然`then(..)`这个名称与原生的 Promise API 完全一样，但是这个`then(..)`的含义是不同的。你可以传递任意多或者任意少的函数或值给`then(..)`，而它们中的每一个都被看作是一个分离的步骤。这里与完成/拒绝语义的双回调毫不相干。

在 Promise 中，可以把一个 Promise 与下一个你在`then(..)`的完成处理器中创建并`return`的 Promise 链接。与此不同的是，在 *asynquence* 中，你所需要做的一切就是调用延续回调 —— 我总是称之为`done()`，但你可以起任何适合你的名字 —— 并将完成的消息作为参数值选择性地传递给它。

通过`then(..)`定义的每一个步骤都被认为是异步的。如果你有一个同步的步骤，你可以立即调用`done(..)`，或者使用更简单的`val(..)`步骤帮助函数：

```js
// 步骤 1（同步）
ASQ( function(done){
	done( "Hello" );	// 手动同步
} )
// 步骤 2（同步）
.val( function(greeting){
	return greeting + " World";
} )
// 步骤 3（异步）
.then( function(done,msg){
	setTimeout( function(){
		done( msg.toUpperCase() );
	}, 100 );
} )
// 步骤 4（同步）
.val( function(msg){
	console.log( msg );
} );
```

如你所见，`val(..)`调用的步骤不会收到一个延续回调，因为这部分已经为你做好了 —— 而且参数列表作为一个结果显得不那么凌乱了！要向下一个步骤发送消息，你简单地使用`return`。

将`val(..)`考虑为表示一个同步的“仅含有值”的步骤，它对同步的值操作，比如 logging 之类，非常有用。

### 错误

与 Promise 相比 *asynquence* 的一个重要的不同之处是错误处理。

在 Promise 链条中，每个 Promise（步骤）都可以拥有自己独立的错误，而每个后续的步骤都有能力处理或不处理这个错误。这种语义（再一次）主要来自于对每个单独的 Promise 的关注，而非对整个链条（序列）的关注。

我相信，在大多数情况下，一个位于序列中某一部分的错误通常是不可恢复的，所以序列中后续的步骤毫无意义而应当被跳过。所以，默认情况下，在一个序列的任意一个步骤中的错误会将整个序列置于错误模式，而剩下的普通步骤将会被忽略。

如果你 *确实* 需要一个错误可以被恢复的步骤，有几个不同的API可以适应这种情况，比如`try(..)` —— 先前提到过的，有些像`try..catch`的步骤 —— 或者`until(..)` —— 一个重试循环，它持续地尝试一个步骤直到它成功或你手动地`break()`这个循环。*asynquence* 甚至拥有`pThen(..)`和`pCatch(..)`方法，它们的工作方式与普通的 Promise 的`then(..)`和`catch(..)`（见第三章）完全相同，所以如果你选择这么做，你就可以进行本地化的序列中错误处理。

重点是，你同时拥有两个选项，但是在我的经验中更常见的是默认情况。使用 Promise，要使一个步骤的链条在错误发生时一次性忽略所有步骤，你不得不小心不要在任何步骤中注册拒绝处理器；否则，这个错误会被视为处理过而被吞掉，而序列可能仍会继续下去（也许不是意料之中的）。要恰当且可靠地处理这种期待的行为有点儿尴尬。

要注册一个序列错误通知处理器，*asynquence* 提供了一个`or(..)`序列方法，它还有一个别名叫做`onerror(..)`。你可以在序列的任何位置调用这个方法，而且你可以注册任意多的处理器。这使得让多个不同的消费者监听一个序列是否失败变得很容易；从这个角度讲，它有点儿像一个错误事件处理器。

正如使用 Promise 那样，所有JS异常都会变为序列错误，或者你可以通过编程来发生一个序列错误：

```js
var sq = ASQ( function(done){
	setTimeout( function(){
		// 为序列发出一个错误
		done.fail( "Oops" );
	}, 100 );
} )
.then( function(done){
	// 永远不会到达这里
} )
.or( function(err){
	console.log( err );			// Oops
} )
.then( function(done){
	// 也不会到达这里
} );

// 稍后

sq.or( function(err){
	console.log( err );			// Oops
} );
```

*asynquence* 与原生的 Promise 相比，在错误处理上另一个重要的不同就是“未处理异常”的默认行为。正如我们在第三章中以相当的篇幅讨论过的，一个没有被注册拒绝处理器的 Promise 如果被拒绝的话，将会无声地保持（也就是吞掉）那个错误；你不得不总是想着要用一个最后的`catch(..)`来终结一个链条。

在 *asynquence* 中，这种假设被颠倒过来了。

如果一个错误在序列上发生，而且 **在那个时刻** 它没有被注册错误处理器，那么这个错误会被报告至`console`。换言之，未处理的的拒绝将总是默认地被报告，因此不会被吞掉或丢掉。

为了防止重复的噪音，只要你向一个序列注册一个错误处理器，它就会使这个序列从这样的报告中退出。

事实上有许多情况你想要创建这样一个序列，它可能会在你有机会注册处理器之前就进入错误状态。这不常见，但可能时不时地发生。

在这样的情况下，你也可以通过在序列上调用`defer()`来使一个序列实例 **从错误报告中退出**。你应当仅在自己确信不会最终处理这样的错误时，才决定从报告中退出：

```js
var sq1 = ASQ( function(done){
	doesnt.Exist();			// 将会向控制台抛出异常
} );

var sq2 = ASQ( function(done){
	doesnt.Exist();			// 仅仅会抛出一个序列错误
} )
// 错误报告中的退出
.defer();

setTimeout( function(){
	sq1.or( function(err){
		console.log( err );	// ReferenceError
	} );

	sq2.or( function(err){
		console.log( err );	// ReferenceError
	} );
}, 100 );

// ReferenceError （来自sq1）
```

这是一种比 Promise 本身拥有的更好的错误处理行为，因为它是一个成功的深渊，而不是一个失败的深渊（参见第三章）。

**注意：** 如果一个序列被导入（也就是被汇合入）另一个序列 —— 完整的描述参见“组合序列” —— 之后源序列从错误报告中退出，那么就必须考虑目标序列是否进行错误报告。

### 并行步骤

在你的序列中不是所有的步骤都将只拥有一个（异步）任务去执行；有些将会需要“并行”（并发地）执行多个步骤。在一个序列中，一个并发地处理多个子步骤的步骤称为一个`gate(..)` —— 如果你喜欢的话它还有一个别名`all(..)` —— 而且它与原生的`Promise.all([..])`是对称的。

如果在`gate(..)`中的所有步骤都成功地完成了，那么所有成功的消息都将被传递到下一个序列步骤中。如果它们中的任何一个产生了一个错误，那么整个序列会立即进入错误状态。

考虑如下代码：

```js
ASQ( function(done){
	setTimeout( done, 100 );
} )
.gate(
	function(done){
		setTimeout( function(){
			done( "Hello" );
		}, 100 );
	},
	function(done){
		setTimeout( function(){
			done( "World", "!" );
		}, 100 );
	}
)
.val( function(msg1,msg2){
	console.log( msg1 );	// Hello
	console.log( msg2 );	// [ "World", "!" ]
} );
```

为了展示差异，让我们把这个例子与原生 Promise 比较一下：

```js
new Promise( function(resolve,reject){
	setTimeout( resolve, 100 );
} )
.then( function(){
	return Promise.all( [
		new Promise( function(resolve,reject){
			setTimeout( function(){
				resolve( "Hello" );
			}, 100 );
		} ),
		new Promise( function(resolve,reject){
			setTimeout( function(){
				// 注意：这里我们需要一个 [ ]
				resolve( [ "World", "!" ] );
			}, 100 );
		} )
	] );
} )
.then( function(msgs){
	console.log( msgs[0] );	// Hello
	console.log( msgs[1] );	// [ "World", "!" ]
} );
```

讨厌。Promise 需要多得多的模板代码来表达相同的异步流程控制。这个例子很好地说明了为什么 *asynquence* API 和抽象使得对付 Promise 步骤容易多了。你的异步流程越复杂，它的改进程度就越高。

#### 各种步骤

关于 *asynquence* 的`gate(..)`步骤类型，有好几种不同的 contrib 插件可能十分有用：

* `any(..)`很像`gate(..)`，除了为了继续主序列，只需要有一个环节最终必须成功。
* `first(..)`很像`any(..)`，除了只要有任何一个环节成功，主序列就会继续（忽略任何其余环节产生的后续结果）。
* `race(..)`（与`Promise.race([..])`对称）很像`first(..)`，除了主序列会在任何环节完成时（不管成功还是失败）立即继续。
* `last(..)`很像`any(..)`，除了只有最后一个环节成功完成时才会把它的消息发送给主序列。
* `none(..)`是`gate(..)`的反义：主序列仅在所有环节失败时才会继续（将所有环节的错误消息作为成功消息传送，或者反之）。

让我们首先定义一些帮助函数来使示例清晰一些：

```js
function success1(done) {
	setTimeout( function(){
		done( 1 );
	}, 100 );
}

function success2(done) {
	setTimeout( function(){
		done( 2 );
	}, 100 );
}

function failure3(done) {
	setTimeout( function(){
		done.fail( 3 );
	}, 100 );
}

function output(msg) {
	console.log( msg );
}
```

现在，让我们展示一些这些`gate(..)`步骤的变种：

```js
ASQ().race(
	failure3,
	success1
)
.or( output );		// 3


ASQ().any(
	success1,
	failure3,
	success2
)
.val( function(){
	var args = [].slice.call( arguments );
	console.log(
		args		// [ 1, undefined, 2 ]
	);
} );


ASQ().first(
	failure3,
	success1,
	success2
)
.val( output );		// 1


ASQ().last(
	failure3,
	success1,
	success2
)
.val( output );		// 2

ASQ().none(
	failure3
)
.val( output )		// 3
.none(
	failure3
	success1
)
.or( output );		// 1
```

另一个步骤种类是`map(..)`，它让你将一个数组的元素异步地映射为不同的值，而且在所有映射完成之前步骤不会前进。`map(..)`与`gate(..)`十分相似，除了它从一个数组，而非从一个指定的分离函数那里得到初始值，而且你定义一个函数回调来操作每一个值：

```js
function double(x,done) {
	setTimeout( function(){
		done( x * 2 );
	}, 100 );
}

ASQ().map( [1,2,3], double )
.val( output );					// [2,4,6]
```

另外，`map(..)`可以从前一步骤传递来的消息中收到它的两个参数（数组或者回调）：

```js
function plusOne(x,done) {
	setTimeout( function(){
		done( x + 1 );
	}, 100 );
}

ASQ( [1,2,3] )
.map( double )			// 收到消息`[1,2,3]`
.map( plusOne )			// 收到消息`[2,4,6]`
.val( output );			// [3,5,7]
```

另一个种类是`waterfall(..)`，它有些像混合了`gate(..)`的消息收集行为与`then(..)`的序列化处理。

步骤1首先被执行，然后来自步骤1的成功消息被传递给步骤2，然后两个成功消息走到步骤3，然后所有三个成功消息走到步骤4，如此继续，这样消息被某种程度上收集并从“瀑布”上倾泻而下。

考虑如下代码：

```js
function double(done) {
	var args = [].slice.call( arguments, 1 );
	console.log( args );

	setTimeout( function(){
		done( args[args.length - 1] * 2 );
	}, 100 );
}

ASQ( 3 )
.waterfall(
	double,					// [ 3 ]
	double,					// [ 6 ]
	double,					// [ 6, 12 ]
	double					// [ 6, 12, 24 ]
)
.val( function(){
	var args = [].slice.call( arguments );
	console.log( args );	// [ 6, 12, 24, 48 ]
} );
```

如果在“瀑布”的任何一点发生错误，那么整个序列就会立即进入错误状态。

#### 容错

有时你想在步骤一级管理错误，而不一定让它们使整个序列成为错误状态。*asynquence* 为此提供了两种步骤类型。

`try(..)`尝试一个步骤，如果它成功，序列就会正常继续，但如果这个步骤失败了，失败的状态会转换成格式为`{ catch: .. }`的成功消息，它的值由错误消息填充：

```js
ASQ()
.try( success1 )
.val( output )			// 1
.try( failure3 )
.val( output )			// { catch: 3 }
.or( function(err){
	// 永远不会到达这里
} );
```

你还可以使用`until(..)`构建一个重试循环，它尝试一个步骤，如果失败，就会在下一个事件轮询的 tick 中重试这个步骤，如此继续。

这种重试循环可以无限延续下去，但如果你想要从循环中跳出来，你可以在完成触发器上调用`break()`标志方法，它将主序列置为错误状态：

```js
var count = 0;

ASQ( 3 )
.until( double )
.val( output )					// 6
.until( function(done){
	count++;

	setTimeout( function(){
		if (count < 5) {
			done.fail();
		}
		else {
			// 跳出 `until(..)` 重试循环
			done.break( "Oops" );
		}
	}, 100 );
} )
.or( output );					// Oops
```

#### Promise 式的步骤

如果你喜欢在你的序列中内联 Promise 风格的语义，比如 Promise 的`then(..)`和`catch(..)`（见第三章），你可以使用`pThen`和`pCatch`插件：

```js
ASQ( 21 )
.pThen( function(msg){
	return msg * 2;
} )
.pThen( output )				// 42
.pThen( function(){
	// 抛出一个异常
	doesnt.Exist();
} )
.pCatch( function(err){
	// 捕获这个异常（拒绝）
	console.log( err );			// ReferenceError
} )
.val( function(){
	// 主旋律回归到正常状态，
	// 因为前一个异常已经被
	// `pCatch(..)`捕获了
} );
```

`pThen(..)`和`pCatch(..)`被设计为运行在序列中，但好像在普通的 Promise 链中动作。这样，你就可以在传递给`pThen(..)`的“完成”处理器中解析纯粹的 Promise 或者 *asynquence* 序列。

### 序列分支

一个有关 Promise 的可能十分有用的特性是，你可以在同一个 Promise 上添附多个`then(..)`处理器，这实质上在这个 Promise 的流程上创建了“分支”：

```js
var p = Promise.resolve( 21 );

// （从`p`开始的）分支 1
p.then( function(msg){
	return msg * 2;
} )
.then( function(msg){
	console.log( msg );		// 42
} )

// （从`p`开始的）分支 2
p.then( function(msg){
	console.log( msg );		// 21
} );
```

使用 *asynquence* 的`fork()`可以很容易地进行同样的“分支”：

```js
var sq = ASQ(..).then(..).then(..);

var sq2 = sq.fork();

// 分支 1
sq.then(..)..;

// 分支 2
sq2.then(..)..;
```

### 组合序列

与`fork()`相反的是，你可以通过将一个序列汇合进另一个来组合两个序列，使用`seq(..)`实例方法：

```js
var sq = ASQ( function(done){
	setTimeout( function(){
		done( "Hello World" );
	}, 200 );
} );

ASQ( function(done){
	setTimeout( done, 100 );
} )
// 将序列 `sq` 汇合进这个系列
.seq( sq )
.val( function(msg){
	console.log( msg );		// Hello World
} )
```

`seq(..)`可以像这里展示的那样接收一个序列本身，或者接收一个函数。如果是一个函数，那么它会期待这个函数被调用时返回一个序列，所以前面的代码可以这样写：

```js
// ..
.seq( function(){
	return sq;
} )
// ..
```

另外，这个步骤还可以使用`pipe(..)`来完成：

```js
// ..
.then( function(done){
	// 将 `sq` 导入延续回调 `done`
	sq.pipe( done );
} )
// ..
```

当一个序列被汇合时，它的成功消息流和错误消息流都会被导入。

**注意：** 正如早先的注意事项中提到过的，导入会使源序列从错误报告中退出，但不会影响目标序列的错误报告状态。

## 值与错误序列

如果一个序列的任意一个步骤只是一个普通值，那么这个值就会被映射到这个步骤的完成消息中：

```js
var sq = ASQ( 42 );

sq.val( function(msg){
	console.log( msg );		// 42
} );
```

如果你想制造一个自动出错的序列：

```js
var sq = ASQ.failed( "Oops" );

ASQ()
.seq( sq )
.val( function(msg){
	// 不会到达这里
} )
.or( function(err){
	console.log( err );		// Oops
} );
```

你还可能想要自动地创建一个延迟的值或者延迟的错误序列。使用`after`和`failAfter` contrib 插件，这很容易：

```js
var sq1 = ASQ.after( 100, "Hello", "World" );
var sq2 = ASQ.failAfter( 100, "Oops" );

sq1.val( function(msg1,msg2){
	console.log( msg1, msg2 );		// Hello World
} );

sq2.or( function(err){
	console.log( err );				// Oops
} );
```

你还可以使用`after'(..)`在一个序列的中间插入一个延迟：

```js
ASQ( 42 )
// 在这个序列中插入一个延迟
.after( 100 )
.val( function(msg){
	console.log( msg );		// 42
} );
```

## Promises 与回调

我认为 *asynquence* 序列在原生的 Promise 之上提供了许多价值，而且你会发现在很大程度上它在抽象层面上使用起来更舒适更强大。然而，将 *asynquence* 与其他非 *asynquence* 代码进行整合将是不可避免的现实。

使用`promise(..)`实例方法，你可以很容易地将一个 Promise（也就是 thenable —— 见第三章）汇合进一个序列：

```js
var p = Promise.resolve( 42 );

ASQ()
.promise( p )			// 本可以写做：`function(){ return p; }`
.val( function(msg){
	console.log( msg );	// 42
} );
```

要向相反的方向走，从一个序列的特定步骤中分支/出让一个 Promise，使用`toPromise` contrib 插件：

```js
var sq = ASQ.after( 100, "Hello World" );

sq.toPromise()
// 现在这是一个标准的 promise 链了
.then( function(msg){
	return msg.toUpperCase();
} )
.then( function(msg){
	console.log( msg );		// HELLO WORLD
} );
```

有好几种帮助设施可以在使用回调的系统中适配 *asynquence*。要从你的序列中自动地生成一个“错误优先风格”回调，来接入一个面向回调的工具，使用`errfcb`：

```js
var sq = ASQ( function(done){
	// 注意：这里期待“错误优先风格”的回调
	someAsyncFuncWithCB( 1, 2, done.errfcb )
} )
.val( function(msg){
	// ..
} )
.or( function(err){
	// ..
} );

// 注意：这里期待“错误优先风格”的回调
anotherAsyncFuncWithCB( 1, 2, sq.errfcb() );
```

你还可能想要创建一个工具的序列包装版本 —— 与第三章的“promisory”和第四章的“thunkory”相比较 —— *asynquence* 为此提供了`ASQ.wrap(..)`：

```js
var coolUtility = ASQ.wrap( someAsyncFuncWithCB );

coolUtility( 1, 2 )
.val( function(msg){
	// ..
} )
.or( function(err){
	// ..
} );
```

**注意：** 为了清晰（和有趣！），让我们为来自`ASQ.wrap(..)`的产生序列的函数杜撰另一个名词，就像这里的`coolUtility`。我提议“sequory”（“sequence” + “factory”）。

## 可迭代序列

一个序列普通的范例是，每一个步骤都负责完成它自己，进而推进这个序列。Promise 就是这样工作的。

不幸的是，有时你需要从外部控制一个 Promise/步骤，而这会导致尴尬的“能力抽取”。

考虑这个 Promise 的例子：

```js
var domready = new Promise( function(resolve,reject){
	// 不想把这个放在这里，因为在逻辑上
	// 它属于代码的另一部分
	document.addEventListener( "DOMContentLoaded", resolve );
} );

// ..

domready.then( function(){
	// DOM 准备好了！
} );
```

关于 Promise 的“能力抽取”范模式看起来像这样：

```js
var ready;

var domready = new Promise( function(resolve,reject){
	// 抽取 `resolve()` 能力
	ready = resolve;
} );

// ..

domready.then( function(){
	// DOM 准备好了！
} );

// ..

document.addEventListener( "DOMContentLoaded", ready );
```

**注意：** 在我看来，这种反模式是一种尴尬的代码风格，但有些开发者喜欢，我不能理解其中的原因。

*asynquence* 提供一种我称为“可迭代序列”的反转序列类型，它将控制能力外部化（它在`domready`这样的情况下十分有用）：

```js
// 注意：这里`domready`是一个控制序列的 *迭代器*
var domready = ASQ.iterable();

// ..

domready.val( function(){
	// DOM 准备好了！
} );

// ..

document.addEventListener( "DOMContentLoaded", domready.next );
```

与我们在这个场景中看到的东西比起来，可迭代序列还有很多内容。我们将在附录B中回过头来讨论它们。

## 运行 Generator

在第四章中，我们衍生了一种称为`run(..)`的工具，它可以将 generator 运行至完成，监听被`yield`的 Promise 并使用它们来异步推进 generator。*asynquence* 正好有一个这样的内建工具，称为`runner(..)`。

为了展示，让我们首先建立一些帮助函数：

```js
function doublePr(x) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			resolve( x * 2 );
		}, 100 );
	} );
}

function doubleSeq(x) {
	return ASQ( function(done){
		setTimeout( function(){
			done( x * 2)
		}, 100 );
	} );
}
```

现在，我们可以在一个序列的中间使用`runner(..)`作为一个步骤：

```js
ASQ( 10, 11 )
.runner( function*(token){
	var x = token.messages[0] + token.messages[1];

	// yield 一个真正的 promise
	x = yield doublePr( x );

	// yield 一个序列
	x = yield doubleSeq( x );

	return x;
} )
.val( function(msg){
	console.log( msg );			// 84
} );
```

### 包装过的 Generator

你还可以创建自包装的 generator —— 也就是一个普通函数，运行你指定的 generator 并为它的完成返回一个序列 —— 通过`ASQ.wrap(..)`包装它：

```js
var foo = ASQ.wrap( function*(token){
	var x = token.messages[0] + token.messages[1];

	// yield 一个真正的 promise
	x = yield doublePr( x );

	// yield 一个序列
	x = yield doubleSeq( x );

	return x;
}, { gen: true } );

// ..

foo( 8, 9 )
.val( function(msg){
	console.log( msg );			// 68
} );
```

`runner(..)`还能做很多很牛的事情，我们会在附录B中回过头来讨论它。

## 复习

*asynquence* 是一个在 Promise 之上的简单抽象 —— 一个序列是一系列（异步）步骤，它的目标是使各种异步模式更加容易使用，而在功能上没有任何妥协。

在 *asynquence* 的核心API与它的 contrib 插件中，除了我们在这篇附录中看到的内容以外还有其他的好东西，我们把对这些剩余功能的探索作为练习留给读者。

现在你看到了 *asynquence* 的实质与精神。关键点是，一个序列由许多步骤组成，而这些步骤可以使许多不同种类的 Promise，或者它们可以是一个 generator 运行器，或者... 选择由你来决定，你有完全的自由为你的任务采用恰当的任何异步流程控制逻辑。

如果你能理解这些 *asynquence* 代码段，那么你现在就可以相当快地学会这个库；它实际上没有那么难学！

如果你依然对它如何（或为什么！）工作感到模糊，那么在进入下一篇附录之前，你将会想要多花一点时间去查看前面的例子，并亲自把玩一下 *asynquence*。附录B将会在几种更高级更强大的异步模式中使用 *asynquence*。
