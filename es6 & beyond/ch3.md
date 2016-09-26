# 你不懂JS：ES6与未来
# 第三章：组织

编写JS代码是一回事儿，而合理地组织它是另一回事儿。使用常见的组织和重用模式在很大程度上改善了你代码的可读性和可理解性。记住：代码在与其他开发者交流上起的作用，与在给计算机喂指令上起的作用同样重要。

ES6拥有几种重要的特性可以显著改善这些模式，包括：iterator，generator，模块，和类。

## Iterators

*迭代器（iterator）* 是一种结构化的模式，用于从一个信息源中以一次一个的方式抽取信息。这种模式在程序设计中存在很久了。而且不可否认的是，不知从什么时候起JS开发者们就已经特别地设计并实现了迭代器，所以它根本不是什么新的话题。

ES6所做的是，为迭代器引入了一个隐含的标准化接口。许多在JavaScript中内建的数据结构现在都会暴露一个实现了这个标准的迭代器。而且为了最大化互用性，你也可以构建自己的遵循同样标准的迭代器。

迭代器是一种组织有顺序的，相继的，基于抽取消费的数据的方法。

举个例子，你可能实现一个工具，它在每次被请求时产生一个新的唯一的标识符。或者你可能循环一个固定的列表以轮流的方式产生一系列无限的值。或者你可以在一个数据库查询的结果上添加一个迭代器来一次抽取一行结果。

虽然在JS中它们不经常以这样的方式被使用，但是迭代器还可以认为是每次控制行为中的一个步骤。这会在考虑generator时得到相当清楚的展示（参见本章稍后的“Generator”），虽然你当然可以不使用generator而做同样的事。

### Interfaces

在本书写作的时候，ES6的25.1.1.2部分 (https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iterator-interface) 详述了`Iterator`接口，它有如下的要求：

```
Iterator [required]
	next() {method}: retrieves next IteratorResult
```

有两个可选成员，有些迭代器用它们进行了扩展：

```
Iterator [optional]
	return() {method}: stops iterator and returns IteratorResult
	throw() {method}: signals error and returns IteratorResult
```

接口`IteratorResult`被规定为：

```
IteratorResult
	value {property}: current iteration value or final return value
		(optional if `undefined`)
	done {property}: boolean, indicates completion status
```

**注意：** 我称这些接口是隐含的，不是因为它们没有在语言规范中被明确地被说出来 —— 它们被说出来了！—— 而是因为它们没有作为可以直接访问的对象暴露给代码。在ES6中，JavaScript不支持任何“接口”的概念，所以在你自己的代码中遵循它们纯粹是惯例上的。但是，不论JS在何处需要一个迭代器 —— 例如在一个`for..of`循环中 —— 你提供的东西必须遵循这些接口，否则代码就会失败。

还有一个`Iterable`接口，它描述了一定能够产生迭代器的对象：

```
Iterable
	@@iterator() {method}: produces an Iterator
```

如果你回忆一下第二章的“内建Symbol”，`@@iterator`是一种特殊的内建symbol，表示可以为对象产生迭代器的方法。

#### IteratorResult

`IteratorResult`接口规定从任何迭代器操作的返回值都是这样形式的对象：

```js
{ value: .. , done: true / false }
```

内建迭代器将总是返回这种形式的值，当然，更多的属性也允许出现在这个返回值中，如果有必要的话。

例如，一个自定义的迭代器可能会在结果对象中加入额外的元数据（比如，数据是从哪里来的，取得它花了多久，缓存过期的时间长度，下次请求的恰当频率，等等）。

**注意：** 从技术上讲，`value`是可选的，在值为`undefined`的情况下，它将会被认为是不存在或者是没有被设置。因为不管它是表示的就是这个值还是完全不存在，访问`res.value`都将会产生`undefined`，所以这个属性的存在/不存在更大程度上是一个实现或者优化（或两者）的细节，而非一个功能上的问题。

### `next()` Iteration

让我们来看一个数组，它是一个可迭代对象，它可以生成一个迭代器来消费它的值：

```js
var arr = [1,2,3];

var it = arr[Symbol.iterator]();

it.next();		// { value: 1, done: false }
it.next();		// { value: 2, done: false }
it.next();		// { value: 3, done: false }

it.next();		// { value: undefined, done: true }
```

每一次定位在`Symbol.iterator`上的方法在值`arr`上被调用时，它都将生成一个全新的迭代器。大多数的数据结构都会这么做，包括所有内建在JS中的数据结构。

然而，像事件队列这样的结构也许只能生成一个单独的迭代器（单例模式）。或者某种结构可能在同一时间内只允许一个唯一的迭代器，要求当前的迭代器必须完成，才能创建一个新的迭代器。

前一个代码段中的`it`迭代器不会再你得到值`3`时报告`done: true`。你必须再次调用`next()`，实质上越过数组末尾的值，才能得到完成信号`done: true`。在这一节稍后会清楚地讲解这种设计方式的原因，但是它通常被认为是一种最佳实践。

基本字符串值也默认地是可迭代对象：

```js
var greeting = "hello world";

var it = greeting[Symbol.iterator]();

it.next();		// { value: "h", done: false }
it.next();		// { value: "e", done: false }
..
```

**注意：** 从技术上讲，这个基本类型值本身不是可迭代对象，但多亏了“封箱”，`"hello world"`被强制转换为它的`String`对象包装形式，*它* 才是一个可迭代对象。更多信息参见本系列的 *类型与文法*。

ES6还包括几种新的数据结构，称为集合（参见第五章）。这些集合不仅本身就是可迭代对象，而且它们还提供API方法来生成一个迭代器，例如：

```js
var m = new Map();
m.set( "foo", 42 );
m.set( { cool: true }, "hello world" );

var it1 = m[Symbol.iterator]();
var it2 = m.entries();

it1.next();		// { value: [ "foo", 42 ], done: false }
it2.next();		// { value: [ "foo", 42 ], done: false }
..
```

一个迭代器的`next(..)`方法能够可选地接受一个或多个参数。大多数内建的迭代器不会实施这种能力，虽然一个generator的迭代器绝对会这么做（参见本章稍后的“Generator”）。

根据一般的惯例，包括所有的内建迭代器，在一个已经被耗尽的迭代器上调用`next(..)`不是一个错误，而是简单地持续返回结果`{ value: undefined, done: true }`。

### Optional: `return(..)` and `throw(..)`

在迭代器接口上的可选方法 —— `return(..)`和`throw(..)` —— 在大多数内建的迭代器上都没有被实现。但是，它们在generator的上下文环境中绝对有某些含义，所以更具体的信息可以参看“Generator”。

`return(..)`被定义为向一个迭代器发送一个信号，告知它消费者代码已经完成而且不会再从它那里抽取更多的值。这个信号可以用于通知生产者（应答`next(..)`调用的迭代器）去实施一些可能的清理作业，比如释放/关闭网络，数据库，或者文件引用资源。

如果一个迭代器拥有`return(..)`，而且发生了可以自动被解释为非正常或者提前终止消费迭代器的任何条件，`return(..)`就将会被自动调用。你也可以手动调用`return(..)`。

`return(..)`将会像`next(..)`一样返回一个`IteratorResult`对象。一般来说，你向`return(..)`发送的可选值将会在这个`IteratorResult`中作为`value`发送回来，虽然在一些微妙的情况下这可能不成立。

`throw(..)`被用于向一个迭代器发送一个异常/错误信号，与`return(..)`隐含的完成信号相比，它可能会被迭代器用于不同的目的。它不一定像`return(..)`一样暗示着迭代器的一个完成停止。

例如，在generator迭代器中，`throw(..)`实际上会将一个被抛出的异常注射到generator暂停的执行环境中，这个异常可以用`try..catch`捕获。一个未捕获的`throw(..)`异常将会导致generator的迭代器异常中止。

**注意：** 根据一般的惯例，在`return(..)`或`throw(..)`被调用之后，一个迭代器就不应该在产生任何结果了。

### Iterator Loop

正如我们在第二章的“`for..of`”一节中讲解的，ES6的`for..of`循环可以直接消费一个规范的可迭代对象。

如果一个迭代器也是一个可迭代对象，那么它就可以直接与`for..of`循环一起使用。通过给予迭代器一个简单地返回它自身的`Symbol.iterator`方法，你就可以是它成为一个可迭代对象：

```js
var it = {
	// make the `it` iterator an iterable
	[Symbol.iterator]() { return this; },

	next() { .. },
	..
};

it[Symbol.iterator]() === it;		// true
```

现在我们就可以用一个`for..of`循环来消费迭代器`it`了：

```js
for (var v of it) {
	console.log( v );
}
```

为了完全理解这样的循环如何工作，回忆下第二章中的`for..of`循环的`for`等价物：

```js
for (var v, res; (res = it.next()) && !res.done; ) {
	v = res.value;
	console.log( v );
}
```

如果你仔细观察，你会发现`it.next()`是在每次迭代之前被调用的，然后`res.done`才被查询。如果`res.done`是`true`，那么这个表达式将会求值为`false`于是这次迭代不会发生。

回忆一下之前我们建议说，迭代器一般不应与最终预期的值一起返回`done: true`。现在你知道为什么了。

如果一个迭代器返回了`{ done: true, value: 42 }`，`for..of`循环将完全扔掉值`42`。因此，假定你的迭代器可能会被`for..of`循环或它的`for`等价物这样的模式消费的话，你可能应当等到你已经返回了所有相关的迭代值之后才返回`done: true`来表示完成。

**警告：** 当然，你可以有意地将你的迭代器设计为将某些相关的`value`与`done: true`同时返回。但除非你将此情况在文档中记录下来，否则不要这么做，因为这样会隐含地强制你的迭代器消费者使用一种，与我们刚才描述的`for..of`或它的手动等价物不同的模式来进行迭代。

### Custom Iterators

除了标准的内建迭代器，你还可以制造你自己的迭代器！所有使它们可以与ES6消费设施（例如，`for..of`循环和`...`操作符）进行互动的代价就是遵循恰当的接口。

让我们试着构建一个迭代器，它能够以斐波那契（Fibonacci）数列的形式产生无限多的数字序列：

```js
var Fib = {
	[Symbol.iterator]() {
		var n1 = 1, n2 = 1;

		return {
			// make the iterator an iterable
			[Symbol.iterator]() { return this; },

			next() {
				var current = n2;
				n2 = n1;
				n1 = n1 + current;
				return { value: current, done: false };
			},

			return(v) {
				console.log(
					"Fibonacci sequence abandoned."
				);
				return { value: v, done: true };
			}
		};
	}
};

for (var v of Fib) {
	console.log( v );

	if (v > 50) break;
}
// 1 1 2 3 5 8 13 21 34 55
// Fibonacci sequence abandoned.
```

**警告：** 如果我们没有插入`break`条件，这个`for..of`循环将会永远运行下去，就破坏你的程序来讲这可能不是我们想要的！

方法`Fib[Symbol.iterator]()`在被调用时返回带有`next()`和`return(..)`方法的迭代器对象。它的状态通过变量`n1`和`n2`维护在闭包中。

接下来让我们考虑一个迭代器，它被设计为执行一系列（也叫队列）动作，一次一个：

```js
var tasks = {
	[Symbol.iterator]() {
		var steps = this.actions.slice();

		return {
			// make the iterator an iterable
			[Symbol.iterator]() { return this; },

			next(...args) {
				if (steps.length > 0) {
					let res = steps.shift()( ...args );
					return { value: res, done: false };
				}
				else {
					return { done: true }
				}
			},

			return(v) {
				steps.length = 0;
				return { value: v, done: true };
			}
		};
	},
	actions: []
};
```

在`tasks`上的迭代器步过在数组属性`actions`中找到的函数，并每次执行它们中的一个，并传入你传递给`next(..)`的任何参数值，并在标准的`IteratorResult`对象中向你返回任何它返回的东西。

这是我们如何使用这个`tasks`队列：

```js
tasks.actions.push(
	function step1(x){
		console.log( "step 1:", x );
		return x * 2;
	},
	function step2(x,y){
		console.log( "step 2:", x, y );
		return x + (y * 2);
	},
	function step3(x,y,z){
		console.log( "step 3:", x, y, z );
		return (x * y) + z;
	}
);

var it = tasks[Symbol.iterator]();

it.next( 10 );			// step 1: 10
						// { value:   20, done: false }

it.next( 20, 50 );		// step 2: 20 50
						// { value:  120, done: false }

it.next( 20, 50, 120 );	// step 3: 20 50 120
						// { value: 1120, done: false }

it.next();				// { done: true }
```

这种特别的用法证实了迭代器可以是一种组织功能的模式，不仅仅是数据。这也联系着我们在下一节关于generator将要看到的东西。

你甚至可以更有创意一些，在一块数据上定义一个表示元操作的迭代器。例如，我们可以为默认从0开始递增至（或递减至，对于负数来说）指定数字的一组数字定义一个迭代器。

考虑如下代码：

```js
if (!Number.prototype[Symbol.iterator]) {
	Object.defineProperty(
		Number.prototype,
		Symbol.iterator,
		{
			writable: true,
			configurable: true,
			enumerable: false,
			value: function iterator(){
				var i, inc, done = false, top = +this;

				// iterate positively or negatively?
				inc = 1 * (top < 0 ? -1 : 1);

				return {
					// make the iterator itself an iterable!
					[Symbol.iterator](){ return this; },

					next() {
						if (!done) {
							// initial iteration always 0
							if (i == null) {
								i = 0;
							}
							// iterating positively
							else if (top >= 0) {
								i = Math.min(top,i + inc);
							}
							// iterating negatively
							else {
								i = Math.max(top,i + inc);
							}

							// done after this iteration?
							if (i == top) done = true;

							return { value: i, done: false };
						}
						else {
							return { done: true };
						}
					}
				};
			}
		}
	);
}
```

现在，这种创意给了我们什么技巧？

```js
for (var i of 3) {
	console.log( i );
}
// 0 1 2 3

[...-3];				// [0,-1,-2,-3]
```

这是一些有趣的技巧，虽然其实际用途有些值得商榷。但是再一次，有人可能想知道为什么ES6没有提供如此微小但讨喜的特性呢？

如果我连这样的提醒都没给过你，那就是我的疏忽：像我在前面的代码段中做的那样扩展原生原型，是一件你需要小心并了解潜在的危害后才应该做的事情。

在这样的情况下，你于其他代码或者未来的JS特性发生冲突的可能性非常低。但是要小心微小的可能性。并在文档中为后人详细记录下你在做什么。

**注意：** 如果你想知道更多细节，我在这篇文章(http://blog.getify.com/iterating-es6-numbers/) 中详细论述了这种特别的技术。而且这段评论(http://blog.getify.com/iterating-es6-numbers/comment-page-1/#comment-535294)甚至为制造一个字符串字符范围提出了一个相似的技巧。

### Iterator Consumption

我们已经看到了使用`for..of`循环来一个元素一个元素地消费一个迭代器。但是还一些其他的ES6解构可以消费迭代器。

让我们考虑一下附着这个数组上的迭代器（虽然任何我们选择的迭代器都将拥有如下的行为）：

```js
var a = [1,2,3,4,5];
```

扩散操作符`...`将完全耗尽一个迭代器。考虑如下代码：

```js
function foo(x,y,z,w,p) {
	console.log( x + y + z + w + p );
}

foo( ...a );			// 15
```

`...`还可以在一个数组内部扩散一个迭代器：

```js
var b = [ 0, ...a, 6 ];
b;						// [0,1,2,3,4,5,6]
```

数组解构（参见第二章的“解构”）可以部分地或者完全地（如果与一个`...`剩余/收集操作符一起使用）消费一个迭代器：

```js
var it = a[Symbol.iterator]();

var [x,y] = it;			// take just the first two elements from `it`
var [z, ...w] = it;		// take the third, then the rest all at once

// is `it` fully exhausted? Yep.
it.next();				// { value: undefined, done: true }

x;						// 1
y;						// 2
z;						// 3
w;						// [4,5]
```

## Generators

所有的函数都会运行至完成，对吧？换句话说，一旦一个函数开始运行，在它完成之前没有任何东西能够打断它。

至少对与到现在为止的JavaScript的整个历史来说是这样的。在ES6中，引入了一个有些异乎寻常的新形式的函数，称为generator。一个generator可以在运行期间暂停它自己，还可以立即或者稍后继续运行。所以显然它没有普通函数那样的运行至完成的保证。

另外，在运行期间的每次暂停/继续轮回都是一个双向消息传递的好机会，generator可以在这里返回一个值，而使它继续的控制端代码可以发回一个值。

就像前一节中的迭代器一样，有种方式可以考虑generator是什么，或者说它对什么最有用。对此没有一个正确的答案，但我们将试着从几个角度考虑。

**注意：** 关于generator的更多信息参见本系列的 *异步与性能*，还可以参见本书的第四章。

### Syntax

generator函数使用这种新语法声明：

```js
function *foo() {
	// ..
}
```

`*`的位置在功能上无关紧要。同样的声明还可以写做以下的任意一种：

```js
function *foo()  { .. }
function* foo()  { .. }
function * foo() { .. }
function*foo()   { .. }
..
```

这里 *唯一* 的区别就是风格的偏好。大多数其他的文献似乎喜欢`function* foo(..) { .. }`。我喜欢`function *foo(..) { .. }`，所以这就是我将在本书剩余部分中表示它们的方法。

我这样做的理由实质上纯粹是为了教学。在这本书中，当我引用一个generator函数时，我将使用`*foo(..)`，与普通函数的`foo(..)`相对。我发现`*foo(..)`与`function *foo(..) { .. }`中`*`的位置更加吻合。

另外，就像我们在第二章的简约方法中看到的，在对象字面量中有一种简约generator形式：

```js
var a = {
	*foo() { .. }
};
```

我要说在简约generator中，`*foo() { .. }`要比`* foo() { .. }`更自然。这进一步表明了为何使用`*foo()`匹配一致性。

一致性使理解与学习更轻松。

#### Executing a Generator

虽然一个generator使用`*`进行声明，但是你依然可以像一个普通函数那样执行它：

```js
foo();
```

你依然可以传给它参数值，就像：

```js
function *foo(x,y) {
	// ..
}

foo( 5, 10 );
```

主要区别在于，执行一个generator，比如`foo(5,10)`，并不实际运行generator中的代码。取而代之的是，它生成一个迭代器来控制generator执行它的代码。

我们将在稍后的“迭代器控制”中回到这个话题，但是简要地说：

```js
function *foo() {
	// ..
}

var it = foo();

// to start/advanced `*foo()`, call
// `it.next(..)`
```

#### `yield`

Generator还有一个你可以在它们内部使用的新关键字，用来表示暂停点：`yield`。考虑如下代码：

```js
function *foo() {
	var x = 10;
	var y = 20;

	yield;

	var z = x + y;
}
```

在这个`*foo()`generator中，前两行的操作将会在开始时运行，然后`yield`将会暂停这个generator。如果这个generator被继续，`*foo()`的最后一行将运行。在一个generator中`yield`可以出现任意多次（或者，在技术上讲，根本不出现！）。

你甚至可以在一个循环内部放置`yield`，它可以表示一个重复的暂停点。事实上，一个永不完成的循环就意味着一个永不完成的generator，这是完全合法的，而且有时候完全是你需要的。

`yield`不只是一个暂停点。它是在暂停generator时发送出一个值的表达式。这里是一个位于generator中的`while..true`循环，它每次迭代时`yield`出一个新的随机数：

```js
function *foo() {
	while (true) {
		yield Math.random();
	}
}
```

`yield ..`表达式不仅发送一个值 —— 不带值的`yield`与`yield undefined`相同 —— 它还接收（例如，被替换为）最终的继续值。考虑如下代码：

```js
function *foo() {
	var x = yield 10;
	console.log( x );
}
```

这个generator在暂停它自己时将首先`yield`出值`10`。当你继续这个generator时 —— 使用我们先前提到的`it.next(..)` —— 无论你使用什么值继续它，这个值都将替换/完成整个表达式`yield 10`，这意味着这个值将被赋值给变量`x`

一个`yield..`表达式可以出现在任意普通表达式可能出现的地方。例如：

```js
function *foo() {
	var arr = [ yield 1, yield 2, yield 3 ];
	console.log( arr, yield 4 );
}
```

这里的`*foo()`有四个`yield ..`表达式。其中每个`yield`都会导致generator暂停以等待一个继续值，这个继续值稍后被用于各个表达式环境中。

`yield`在技术上讲不是一个操作符，虽然像`yield 1`这样使用时看起来确实很像。因为`yield`可以像`var x = yield`这样完全通过自己被使用，所以将它认为是一个操作符有时令人困惑。

从技术上讲，`yield ..`与`a = 3`这样的赋值表达式拥有相同的“表达式优先级” —— 概念上和操作符优先级很相似。这意味着`yield ..`基本上可以出现在任何`a = 3`可以合法出现的地方。

让我们展示一下这种对称性：

```js
var a, b;

a = 3;					// valid
b = 2 + a = 3;			// invalid
b = 2 + (a = 3);		// valid

yield 3;				// valid
a = 2 + yield 3;		// invalid
a = 2 + (yield 3);		// valid
```

**注意：** 如果你好好考虑一下，认为一个`yield ..`表达式与一个赋值表达式的行为相似在概念上有些道理。当一个被暂停的generator被继续时，它就以一种与被这个继续值“赋值”区别不大的方式，被这个值完成/替换。

要点：如果你需要`yield ..`出现在`a = 3`这样的赋值本书不被允许出现的位置，那么它就需要被包在一个`( )`中。

因为`yield`关键字的优先级很低，几乎任何出现在`yield ..`之后的表达式都会在被`yield`发送之前首先被计算。只有扩散操作符`...`和逗号操作符`,`拥有更低的优先级，这意味着他们会在`yield`已经被求值之后才会被处理。

所以正如带有多个操作符的普通语句一样，存在另一个可能需要`( )`来覆盖（提升）`yield`的低优先级的情况，就像这些表达式之间的区别：

```js
yield 2 + 3;			// same as `yield (2 + 3)`

(yield 2) + 3;			// `yield 2` first, then `+ 3`
```

和`=`赋值一样，`yield`也是“右结合性”的，这意味着多个接连出现的`yield`表达式被视为从右到左被`( .. )`分组。所以，`yield yield yield 3`将被视为`yield (yield (yield 3))`。像`((yield) yield) yield 3`这样的“左结合性”解释没有意义。

和其他操作符一样，`yield`与其他操作符或`yield`组合时为了使你的意图没有歧义，使用`( .. )`分组是一个好主意，即使这不是严格要求的。

**注意：** 更多关于操作符优先级和结合性的信息，参见本系列的 *类型与文法*。

#### `yield *`

与`*`使一个`function`声明成为一个`function *`generator声明的方式一样，一个`*`使`yield`成为一个机制非常不同的`yield *`，称为 *yield委托*。从文法上讲，`yield *..`的行为与`yield ..`相同，就像在前一节讨论过的那样。

`yield * ..`需要一个可迭代对象；然后它调用这个可迭代对象的迭代器，并将它自己的宿主generator的控制权委托给那个迭代器，直到它被耗尽。考虑如下代码：

```js
function *foo() {
	yield *[1,2,3];
}
```

**注意：** 与generator声明中`*`的位置（早先讨论过）一样，在`yield *`表达式中的`*`的位置在风格上由你来决定。大多数其他文献偏好`yield* ..`，但是我喜欢`yield *..`，理由和我们已经讨论过的相同。

值`[1,2,3]`产生一个将会步过它的值的迭代器，所以generator`*foo()`将会在被消费时产生这些值。另一种说明这种行为的方式是，yield委托到了另一个generator：

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

function *bar() {
	yield *foo();
}
```

当`*bar()`调用`*foo()`产生的迭代器通过`yield *`受到委托，意味着无论`*foo()`产生什么值都会被`*bar()`产生。

在`yield ..`中表达式的完成值来自于使用`it.next(..)`继续generator，而`yield *..`表达式的完成值来自于受到委托的迭代器的返回值（如果有的话）。

内建的迭代器一般没有返回值，正如我们在本站早先的“迭代器循环”一节的末尾讲过的。但是如果你定义你自己的迭代器（或者generator），你就可以将它设计为`return`一个值，`yield *..`将会捕获它：

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
	return 4;
}

function *bar() {
	var x = yield *foo();
	console.log( "x:", x );
}

for (var v of bar()) {
	console.log( v );
}
// 1 2 3
// x: { value: 4, done: true }
```

虽然值`1`，`2`，和`3`从`*foo()`中被`yield`出来，然后从`*bar()`中被`yield`出来，但是从`*foo()`中返回的值`4`是表达式`yield *foo()`的完成值，然后它被赋值给`x`。

因为`yield *`可以调用另一个generator（通过委托到它的迭代器的方式），它还可以通过调用自己来实施某种generator递归：

```js
function *foo(x) {
	if (x < 3) {
		x = yield *foo( x + 1 );
	}
	return x * 2;
}

foo( 1 );
```

`foo(1)`并调用迭代器的`next()`来使它运行它的递归步骤，结果将是`24`。第一次`*foo()`运行时`x`拥有值`1`，它是`x < 3`。`x + 1`被递归地传递到`*foo(..)`，所以之后的`x`是`2`。再一次递归调用导致`x`为`3`。

现在，因为`x < 3`失败了，递归停止，而且`return 3 * 2`将`6`给回前一个调用的`yeild *..`表达式，它被赋值给`x`。另一个`return 6 * 2`返回`12`给前一个调用的`x`。最终`12 * 2`，即`24`，从generator`*foo(..)`的运行完成中被返回。

### Iterator Control

Earlier, we briefly introduced the concept that generators are controlled by iterators. Let's fully dig into that now.

早先，我们简要地介绍了generator是由迭代器控制的概念。现在让我们完整地深入这个话题。

Recall the recursive `*foo(..)` from the previous section. Here's how we'd run it:

回忆一下前一节的递归`*for(..)`。这是我们如何运行它：

```js
function *foo(x) {
	if (x < 3) {
		x = yield *foo( x + 1 );
	}
	return x * 2;
}

var it = foo( 1 );
it.next();				// { value: 24, done: true }
```

In this case, the generator doesn't really ever pause, as there's no `yield ..` expression. Instead, `yield *` just keeps the current iteration step going via the recursive call. So, just one call to the iterator's `next()` function fully runs the generator.

在这种情况下，generator并没有真正暂停过，因为这里没有`yield ..`表达式。`yield *`只是通过递归调用保持当前的迭代步骤继续运行下去。所以，仅仅对迭代器的`next()`函数进行一次调用就完全地运行了generator。

Now let's consider a generator that will have multiple steps and thus multiple produced values:

现在让我们考虑一个有多个步骤并且因此有多个产生值的generator：

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}
```

We already know we can consume an iterator, even one attached to a generator like `*foo()`, with a `for..of` loop:

我们已经知道我们可以是使用一个`for..of`循环来消费一个迭代器，即便它是一个附着在`*foo()`这样的generator上：

```js
for (var v of foo()) {
	console.log( v );
}
// 1 2 3
```

**Note:** The `for..of` loop requires an iterable. A generator function reference (like `foo`) by itself is not an iterable; you must execute it with `foo()` to get the iterator (which is also an iterable, as we explained earlier in this chapter). You could theoretically extend the `GeneratorPrototype` (the prototype of all generator functions) with a `Symbol.iterator` function that essentially just does `return this()`. That would make the `foo` reference itself an iterable, which means `for (var v of foo) { .. }` (notice no `()` on `foo`) will work.

**注意：** `for..of`循环需要一个可迭代对象。一个generator函数引用（比如`foo`）本身不是一个可迭代对象；你必须使用`foo()`来执行它以得到迭代器（它还是一个可迭代对象，正如我们在本章早先讲解过的）。理论上你可以使用一个实质上仅仅执行`return this()`的`Symbol.iterator`函数来扩展`GeneratorPrototype`（所有generator函数的原型）。这将使`foo`引用本身成为一个可迭代对象，也就意味着`for (var v of foo) { .. }`（注意在`foo`上没有`()`）将可以工作。

Let's instead iterate the generator manually:

让我们手动迭代这个generator：

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

var it = foo();

it.next();				// { value: 1, done: false }
it.next();				// { value: 2, done: false }
it.next();				// { value: 3, done: false }

it.next();				// { value: undefined, done: true }
```

If you look closely, there are three `yield` statements and four `next()` calls. That may seem like a strange mismatch. In fact, there will always be one more `next()` call than `yield` expression, assuming all are evaluated and the generator is fully run to completion.

如果你仔细观察，这里有三个`yield`语句和四个`next()`调用。这可能看起来像是一个奇怪的不匹配。事实上，假定所有的东西都被求值并且generator完全运行至完成的话，`next()`调用将总是比`yield`表达式多一个。

But if you look at it from the opposite perspective (inside-out instead of outside-in), the matching between `yield` and `next()` makes more sense.

Recall that the `yield ..` expression will be completed by the value you resume the generator with. That means the argument you pass to `next(..)` completes whatever `yield ..` expression is currently paused waiting for a completion.

Let's illustrate this perspective this way:

```js
function *foo() {
	var x = yield 1;
	var y = yield 2;
	var z = yield 3;
	console.log( x, y, z );
}
```

In this snippet, each `yield ..` is sending a value out (`1`, `2`, `3`), but more directly, it's pausing the generator to wait for a value. In other words, it's almost like asking the question, "What value should I use here? I'll wait to hear back."

Now, here's how we control `*foo()` to start it up:

```js
var it = foo();

it.next();				// { value: 1, done: false }
```

That first `next()` call is starting up the generator from its initial paused state, and running it to the first `yield`. At the moment you call that first `next()`, there's no `yield ..` expression waiting for a completion. If you passed a value to that first `next()` call, it would currently just be thrown away, because no `yield` is waiting to receive such a value.

**Note:** An early proposal for the "beyond ES6" timeframe *would* let you access a value passed to an initial `next(..)` call via a separate meta property (see Chapter 7) inside the generator.

Now, let's answer the currently pending question, "What value should I assign to `x`?" We'll answer it by sending a value to the *next* `next(..)` call:

```js
it.next( "foo" );		// { value: 2, done: false }
```

Now, the `x` will have the value `"foo"`, but we've also asked a new question, "What value should I assign to `y`?" And we answer:

```js
it.next( "bar" );		// { value: 3, done: false }
```

Answer given, another question asked. Final answer:

```js
it.next( "baz" );		// "foo" "bar" "baz"
						// { value: undefined, done: true }
```

Now it should be clearer how each `yield ..` "question" is answered by the *next* `next(..)` call, and so the "extra" `next()` call we observed is always just the initial one that starts everything going.

Let's put all those steps together:

```js
var it = foo();

// start up the generator
it.next();				// { value: 1, done: false }

// answer first question
it.next( "foo" );		// { value: 2, done: false }

// answer second question
it.next( "bar" );		// { value: 3, done: false }

// answer third question
it.next( "baz" );		// "foo" "bar" "baz"
						// { value: undefined, done: true }
```

You can think of a generator as a producer of values, in which case each iteration is simply producing a value to be consumed.

But in a more general sense, perhaps it's appropriate to think of generators as controlled, progressive code execution, much like the `tasks` queue example from the earlier "Custom Iterators" section.

**Note:** That perspective is exactly the motivation for how we'll revisit generators in Chapter 4. Specifically, there's no reason that `next(..)` has to be called right away after the previous `next(..)` finishes. While the generator's inner execution context is paused, the rest of the program continues unblocked, including the ability for asynchronous actions to control when the generator is resumed.

### Early Completion

As we covered earlier in this chapter, the iterator attached to a generator supports the optional `return(..)` and `throw(..)` methods. Both of them have the effect of aborting a paused generator immediately.

Consider:

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

var it = foo();

it.next();				// { value: 1, done: false }

it.return( 42 );		// { value: 42, done: true }

it.next();				// { value: undefined, done: true }
```

`return(x)` is kind of like forcing a `return x` to be processed at exactly that moment, such that you get the specified value right back. Once a generator is completed, either normally or early as shown, it no longer processes any code or returns any values.

In addition to `return(..)` being callable manually, it's also called automatically at the end of iteration by any of the ES6 constructs that consume iterators, such as the `for..of` loop and the `...` spread operator.

The purpose for this capability is so the generator can be notified if the controlling code is no longer going to iterate over it anymore, so that it can perhaps do any cleanup tasks (freeing up resources, resetting status, etc.). Identical to a normal function cleanup pattern, the main way to accomplish this is to use a `finally` clause:

```js
function *foo() {
	try {
		yield 1;
		yield 2;
		yield 3;
	}
	finally {
		console.log( "cleanup!" );
	}
}

for (var v of foo()) {
	console.log( v );
}
// 1 2 3
// cleanup!

var it = foo();

it.next();				// { value: 1, done: false }
it.return( 42 );		// cleanup!
						// { value: 42, done: true }
```

**Warning:** Do not put a `yield` statement inside the `finally` clause! It's valid and legal, but it's a really terrible idea. It acts in a sense as deferring the completion of the `return(..)` call you made, as any `yield ..` expressions in the `finally` clause are respected to pause and send messages; you don't immediately get a completed generator as expected. There's basically no good reason to opt in to that crazy *bad part*, so avoid doing so!

In addition to the previous snippet showing how `return(..)` aborts the generator while still triggering the `finally` clause, it also demonstrates that a generator produces a whole new iterator each time it's called. In fact, you can use multiple iterators attached to the same generator concurrently:

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

var it1 = foo();
it1.next();				// { value: 1, done: false }
it1.next();				// { value: 2, done: false }

var it2 = foo();
it2.next();				// { value: 1, done: false }

it1.next();				// { value: 3, done: false }

it2.next();				// { value: 2, done: false }
it2.next();				// { value: 3, done: false }

it2.next();				// { value: undefined, done: true }
it1.next();				// { value: undefined, done: true }
```

#### Early Abort

Instead of calling `return(..)`, you can call `throw(..)`. Just like `return(x)` is essentially injecting a `return x` into the generator at its current pause point, calling `throw(x)` is essentially like injecting a `throw x` at the pause point.

Other than the exception behavior (we cover what that means to `try` clauses in the next section), `throw(..)` produces the same sort of early completion that aborts the generator's run at its current pause point. For example:

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

var it = foo();

it.next();				// { value: 1, done: false }

try {
	it.throw( "Oops!" );
}
catch (err) {
	console.log( err );	// Exception: Oops!
}

it.next();				// { value: undefined, done: true }
```

Because `throw(..)` basically injects a `throw ..` in replacement of the `yield 1` line of the generator, and nothing handles this exception, it immediately propagates back out to the calling code, which handles it with a `try..catch`.

Unlike `return(..)`, the iterator's `throw(..)` method is never called automatically.

Of course, though not shown in the previous snippet, if a `try..finally` clause was waiting inside the generator when you call `throw(..)`, the `finally` clause would be given a chance to complete before the exception is propagated back to the calling code.

### Error Handling

As we've already hinted, error handling with generators can be expressed with `try..catch`, which works in both inbound and outbound directions:

```js
function *foo() {
	try {
		yield 1;
	}
	catch (err) {
		console.log( err );
	}

	yield 2;

	throw "Hello!";
}

var it = foo();

it.next();				// { value: 1, done: false }

try {
	it.throw( "Hi!" );	// Hi!
						// { value: 2, done: false }
	it.next();

	console.log( "never gets here" );
}
catch (err) {
	console.log( err );	// Hello!
}
```

Errors can also propagate in both directions through `yield *` delegation:

```js
function *foo() {
	try {
		yield 1;
	}
	catch (err) {
		console.log( err );
	}

	yield 2;

	throw "foo: e2";
}

function *bar() {
	try {
		yield *foo();

		console.log( "never gets here" );
	}
	catch (err) {
		console.log( err );
	}
}

var it = bar();

try {
	it.next();			// { value: 1, done: false }

	it.throw( "e1" );	// e1
						// { value: 2, done: false }

	it.next();			// foo: e2
						// { value: undefined, done: true }
}
catch (err) {
	console.log( "never gets here" );
}

it.next();				// { value: undefined, done: true }
```

When `*foo()` calls `yield 1`, the `1` value passes through `*bar()` untouched, as we've already seen.

But what's most interesting about this snippet is that when `*foo()` calls `throw "foo: e2"`, this error propagates to `*bar()` and is immediately caught by `*bar()`'s `try..catch` block. The error doesn't pass through `*bar()` like the `1` value did.

`*bar()`'s `catch` then does a normal output of `err` (`"foo: e2"`) and then `*bar()` finishes normally, which is why the `{ value: undefined, done: true }` iterator result comes back from `it.next()`.

If `*bar()` didn't have a `try..catch` around the `yield *..` expression, the error would of course propagate all the way out, and on the way through it still would complete (abort) `*bar()`.

### Transpiling a Generator

Is it possible to represent a generator's capabilities prior to ES6? It turns out it is, and there are several great tools that do so, including most notably Facebook's Regenerator tool (https://facebook.github.io/regenerator/).

But just to better understand generators, let's try our hand at manually converting. Basically, we're going to create a simple closure-based state machine.

We'll keep our source generator really simple:

```js
function *foo() {
	var x = yield 42;
	console.log( x );
}
```

To start, we'll need a function called `foo()` that we can execute, which needs to return an iterator:

```js
function foo() {
	// ..

	return {
		next: function(v) {
			// ..
		}

		// we'll skip `return(..)` and `throw(..)`
	};
}
```

Now, we need some inner variable to keep track of where we are in the steps of our "generator"'s logic. We'll call it `state`. There will be three states: `0` initially, `1` while waiting to fulfill the `yield` expression, and `2` once the generator is complete.

Each time `next(..)` is called, we need to process the next step, and then increment `state`. For convenience, we'll put each step into a `case` clause of a `switch` statement, and we'll hold that in an inner function called `nextState(..)` that `next(..)` can call. Also, because `x` is a variable across the overall scope of the "generator," it needs to live outside the `nextState(..)` function.

Here it is all together (obviously somewhat simplified, to keep the conceptual illustration clearer):

```js
function foo() {
	function nextState(v) {
		switch (state) {
			case 0:
				state++;

				// the `yield` expression
				return 42;
			case 1:
				state++;

				// `yield` expression fulfilled
				x = v;
				console.log( x );

				// the implicit `return`
				return undefined;

			// no need to handle state `2`
		}
	}

	var state = 0, x;

	return {
		next: function(v) {
			var ret = nextState( v );

			return { value: ret, done: (state == 2) };
		}

		// we'll skip `return(..)` and `throw(..)`
	};
}
```

And finally, let's test our pre-ES6 "generator":

```js
var it = foo();

it.next();				// { value: 42, done: false }

it.next( 10 );			// 10
						// { value: undefined, done: true }
```

Not bad, huh? Hopefully this exercise solidifies in your mind that generators are actually just simple syntax for state machine logic. That makes them widely applicable.

### Generator Uses

So, now that we much more deeply understand how generators work, what are they useful for?

We've seen two major patterns:

* *Producing a series of values:* This usage can be simple (e.g., random strings or incremented numbers), or it can represent more structured data access (e.g., iterating over rows returned from a database query).

   Either way, we use the iterator to control a generator so that some logic can be invoked for each call to `next(..)`. Normal iterators on data structures merely pull values without any controlling logic.
* *Queue of tasks to perform serially:* This usage often represents flow control for the steps in an algorithm, where each step requires retrieval of data from some external source. The fulfillment of each piece of data may be immediate, or may be asynchronously delayed.

   From the perspective of the code inside the generator, the details of sync or async at a `yield` point are entirely opaque. Moreover, these details are intentionally abstracted away, such as not to obscure the natural sequential expression of steps with such implementation complications. Abstraction also means the implementations can be swapped/refactored often without touching the code in the generator at all.

When generators are viewed in light of these uses, they become a lot more than just a different or nicer syntax for a manual state machine. They are a powerful abstraction tool for organizing and controlling orderly production and consumption of data.

## Modules

I don't think it's an exaggeration to suggest that the single most important code organization pattern in all of JavaScript is, and always has been, the module. For myself, and I think for a large cross-section of the community, the module pattern drives the vast majority of code.

### The Old Way

The traditional module pattern is based on an outer function with inner variables and functions, and a returned "public API" with methods that have closure over the inner data and capabilities. It's often expressed like this:

```js
function Hello(name) {
	function greeting() {
		console.log( "Hello " + name + "!" );
	}

	// public API
	return {
		greeting: greeting
	};
}

var me = Hello( "Kyle" );
me.greeting();			// Hello Kyle!
```

This `Hello(..)` module can produce multiple instances by being called subsequent times. Sometimes, a module is only called for as a singleton (i.e., it just needs one instance), in which case a slight variation on the previous snippet, using an IIFE, is common:

```js
var me = (function Hello(name){
	function greeting() {
		console.log( "Hello " + name + "!" );
	}

	// public API
	return {
		greeting: greeting
	};
})( "Kyle" );

me.greeting();			// Hello Kyle!
```

This pattern is tried and tested. It's also flexible enough to have a wide assortment of variations for a number of different scenarios.

One of the most common is the Asynchronous Module Definition (AMD), and another is the Universal Module Definition (UMD). We won't cover the particulars of these patterns and techniques here, but they're explained extensively in many places online.

### Moving Forward

As of ES6, we no longer need to rely on the enclosing function and closure to provide us with module support. ES6 modules have first class syntactic and functional support.

Before we get into the specific syntax, it's important to understand some fairly significant conceptual differences with ES6 modules compared to how you may have dealt with modules in the past:

* ES6 uses file-based modules, meaning one module per file. At this time, there is no standardized way of combining multiple modules into a single file.

   That means that if you are going to load ES6 modules directly into a browser web application, you will be loading them individually, not as a large bundle in a single file as has been common in performance optimization efforts.

   It's expected that the contemporaneous advent of HTTP/2 will significantly mitigate any such performance concerns, as it operates on a persistent socket connection and thus can very efficiently load many smaller files in parallel and interleaved with one another.
* The API of an ES6 module is static. That is, you define statically what all the top-level exports are on your module's public API, and those cannot be amended later.

   Some uses are accustomed to being able to provide dynamic API definitions, where methods can be added/removed/replaced in response to runtime conditions. Either these uses will have to change to fit with ES6 static APIs, or they will have to restrain the dynamic changes to properties/methods of a second-level object.
* ES6 modules are singletons. That is, there's only one instance of the module, which maintains its state. Every time you import that module into another module, you get a reference to the one centralized instance. If you want to be able to produce multiple module instances, your module will need to provide some sort of factory to do it.
* The properties and methods you expose on a module's public API are not just normal assignments of values or references. They are actual bindings (almost like pointers) to the identifiers in your inner module definition.

   In pre-ES6 modules, if you put a property on your public API that holds a primitive value like a number or string, that property assignment was by value-copy, and any internal update of a corresponding variable would be separate and not affect the public copy on the API object.

   With ES6, exporting a local private variable, even if it currently holds a primitive string/number/etc, exports a binding to the variable. If the module changes the  variable's value, the external import binding now resolves to that new value.
* Importing a module is the same thing as statically requesting it to load (if it hasn't already). If you're in a browser, that implies a blocking load over the network. If you're on a server (i.e., Node.js), it's a blocking load from the filesystem.

   However, don't panic about the performance implications. Because ES6 modules have static definitions, the import requirements can be statically scanned, and loads will happen preemptively, even before you've used the module.

   ES6 doesn't actually specify or handle the mechanics of how these load requests work. There's a separate notion of a Module Loader, where each hosting environment (browser, Node.js, etc.) provides a default Loader appropriate to the environment. The importing of a module uses a string value to represent where to get the module (URL, file path, etc.), but this value is opaque in your program and only meaningful to the Loader itself.

   You can define your own custom Loader if you want more fine-grained control than the default Loader affords -- which is basically none, as it's totally hidden from your program's code.

As you can see, ES6 modules will serve the overall use case of organizing code with encapsulation, controlling public APIs, and referencing dependency imports. But they have a very particular way of doing so, and that may or may not fit very closely with how you've already been doing modules for years.

#### CommonJS

There's a similar, but not fully compatible, module syntax called CommonJS, which is familiar to those in the Node.js ecosystem.

For lack of a more tactful way to say this, in the long run, ES6 modules essentially are bound to supercede all previous formats and standards for modules, even CommonJS, as they are built on syntactic support in the language. This will, in time, inevitably win out as the superior approach, if for no other reason than ubiquity.

We face a fairly long road to get to that point, though. There are literally hundreds of thousands of CommonJS style modules in the server-side JavaScript world, and 10 times that many modules of varying format standards (UMD, AMD, ad hoc) in the browser world. It will take many years for the transitions to make any significant progress.

In the interim, module transpilers/converters will be an absolute necessity. You might as well just get used to that new reality. Whether you author in regular modules, AMD, UMD, CommonJS, or ES6, these tools will have to parse and convert to a format that is suitable for whatever environment your code will run in.

For Node.js, that probably means (for now) that the target is CommonJS. For the browser, it's probably UMD or AMD. Expect lots of flux on this over the next few years as these tools mature and best practices emerge.

From here on out, my best advice on modules is this: whatever format you've been religiously attached to with strong affinity, also develop an appreciation for and understanding of ES6 modules, such as they are, and let your other module tendencies fade. They *are* the future of modules in JS, even if that reality is a bit of a ways off.

### The New Way

The two main new keywords that enable ES6 modules are `import` and `export`. There's lots of nuance to the syntax, so let's take a deeper look.

**Warning:** An important detail that's easy to overlook: both `import` and `export` must always appear in the top-level scope of their respective usage. For example, you cannot put either an `import` or `export` inside an `if` conditional; they must appear outside of all blocks and functions.

#### `export`ing API Members

The `export` keyword is either put in front of a declaration, or used as an operator (of sorts) with a special list of bindings to export. Consider:

```js
export function foo() {
	// ..
}

export var awesome = 42;

var bar = [1,2,3];
export { bar };
```

Another way of expressing the same exports:

```js
function foo() {
	// ..
}

var awesome = 42;
var bar = [1,2,3];

export { foo, awesome, bar };
```

These are all called *named exports*, as you are in effect exporting the name bindings of the variables/functions/etc.

Anything you don't *label* with `export` stays private inside the scope of the module. That is, although something like `var bar = ..` looks like it's declaring at the top-level global scope, the top-level scope is actually the module itself; there is no global scope in modules.

**Note:** Modules *do* still have access to `window` and all the "globals" that hang off it, just not as lexical top-level scope. However, you really should stay away from the globals in your modules if at all possible.

You can also "rename" (aka alias) a module member during named export:

```js
function foo() { .. }

export { foo as bar };
```

When this module is imported, only the `bar` member name is available to import; `foo` stays hidden inside the module.

Module exports are not just normal assignments of values or references, as you're accustomed to with the `=` assignment operator. Actually, when you export something, you're exporting a binding (kinda like a pointer) to that thing (variable, etc.).

Within your module, if you change the value of a variable you already exported a binding to, even if it's already been imported (see the next section), the imported binding will resolve to the current (updated) value.

Consider:

```js
var awesome = 42;
export { awesome };

// later
awesome = 100;
```

When this module is imported, regardless of whether that's before or after the `awesome = 100` setting, once that assignment has happened, the imported binding resolves to the `100` value, not `42`.

That's because the binding is, in essence, a reference to, or a pointer to, the `awesome` variable itself, rather than a copy of its value. This is a mostly unprecedented concept for JS introduced with ES6 module bindings.

Though you can clearly use `export` multiple times inside a module's definition, ES6 definitely prefers the approach that a module has a single export, which is known as a *default export*. In the words of some members of the TC39 committee, you're "rewarded with simpler `import` syntax" if you follow that pattern, and conversely "penalized" with more verbose syntax if you don't.

A default export sets a particular exported binding to be the default when importing the module. The name of the binding is literally `default`. As you'll see later, when importing module bindings you can also rename them, as you commonly will with a default export.

There can only be one `default` per module definition. We'll cover `import` in the next section, and you'll see how the `import` syntax is more concise if the module has a default export.

There's a subtle nuance to default export syntax that you should pay close attention to. Compare these two snippets:

```js
function foo(..) {
	// ..
}

export default foo;
```

And this one:

```js
function foo(..) {
	// ..
}

export { foo as default };
```

In the first snippet, you are exporting a binding to the function expression value at that moment, *not* to the identifier `foo`. In other words, `export default ..` takes an expression. If you later assign `foo` to a different value inside your module, the module import still reveals the function originally exported, not the new value.

By the way, the first snippet could also have been written as:

```js
export default function foo(..) {
	// ..
}
```

**Warning:** Although the `function foo..` part here is technically a function expression, for the purposes of the internal scope of the module, it's treated like a function declaration, in that the `foo` name is bound in the module's top-level scope (often called "hoisting"). The same is true for `export default class Foo..`. However, while you *can* do `export var foo = ..`, you currently cannot do `export default var foo = ..` (or `let` or `const`), in a frustrating case of inconsistency. At the time of this writing, there's already discussion of adding that capability in soon, post-ES6, for consistency sake.

Recall the second snippet again:

```js
function foo(..) {
	// ..
}

export { foo as default };
```

In this version of the module export, the default export binding is actually to the `foo` identifier rather than its value, so you get the previously described binding behavior (i.e., if you later change `foo`'s value, the value seen on the import side will also be updated).

Be very careful of this subtle gotcha in default export syntax, especially if your logic calls for export values to be updated. If you never plan to update a default export's value, `export default ..` is fine. If you do plan to update the value, you must use `export { .. as default }`. Either way, make sure to comment your code to explain your intent!

Because there can only be one `default` per module, you may be tempted to design your module with one default export of an object with all your API methods on it, such as:

```js
export default {
	foo() { .. },
	bar() { .. },
	..
};
```

That pattern seems to map closely to how a lot of developers have already structured their pre-ES6 modules, so it seems like a natural approach. Unfortunately, it has some downsides and is officially discouraged.

In particular, the JS engine cannot statically analyze the contents of a plain object, which means it cannot do some optimizations for static `import` performance. The advantage of having each member individually and explicitly exported is that the engine *can* do the static analysis and optimization.

If your API has more than one member already, it seems like these principles -- one default export per module, and all API members as named exports -- are in conflict, doesn't it? But you *can* have a single default export as well as other named exports; they are not mutually exclusive.

So, instead of this (discouraged) pattern:

```js
export default function foo() { .. }

foo.bar = function() { .. };
foo.baz = function() { .. };
```

You can do:

```js
export default function foo() { .. }

export function bar() { .. }
export function baz() { .. }
```

**Note:** In this previous snippet, I used the name `foo` for the function that `default` labels. That `foo` name, however, is ignored for the purposes of export -- `default` is actually the exported name. When you import this default binding, you can give it whatever name you want, as you'll see in the next section.

Alternatively, some will prefer:

```js
function foo() { .. }
function bar() { .. }
function baz() { .. }

export { foo as default, bar, baz, .. };
```

The effects of mixing default and named exports will be more clear when we cover `import` shortly. But essentially it means that the most concise default import form would only retrieve the `foo()` function. The user could additionally manually list `bar` and `baz` as named imports, if they want them.

You can probably imagine how tedious that's going to be for consumers of your module if you have lots of named export bindings. There is a wildcard import form where you import all of a module's exports within a single namespace object, but there's no way to wildcard import to top-level bindings.

Again, the ES6 module mechanism is intentionally designed to discourage modules with lots of exports; relatively speaking, it's desired that such approaches be a little more difficult, as a sort of social engineering to encourage simple module design in favor of large/complex module design.

I would probably recommend you not mix default export with named exports, especially if you have a large API and refactoring to separate modules isn't practical or desired. In that case, just use all named exports, and document that consumers of your module should probably use the `import * as ..` (namespace import, discussed in the next section) approach to bring the whole API in at once on a single namespace.

We mentioned this earlier, but let's come back to it in more detail. Other than the `export default ...` form that exports an expression value binding, all other export forms are exporting bindings to local identifiers. For those bindings, if you change the value of a variable inside a module after exporting, the external imported binding will access the updated value:

```js
var foo = 42;
export { foo as default };

export var bar = "hello world";

foo = 10;
bar = "cool";
```

When you import this module, the `default` and `bar` exports will be bound to the local variables `foo` and `bar`, meaning they will reveal the updated `10` and `"cool"` values. The values at time of export are irrelevant. The values at time of import are irrelevant. The bindings are live links, so all that matters is what the current value is when you access the binding.

**Warning:** Two-way bindings are not allowed. If you import a `foo` from a module, and try to change the value of your imported `foo` variable, an error will be thrown! We'll revisit that in the next section.

You can also re-export another module's exports, such as:

```js
export { foo, bar } from "baz";
export { foo as FOO, bar as BAR } from "baz";
export * from "baz";
```

Those forms are similar to just first importing from the `"baz"` module then listing its members explicitly for export from your module. However, in these forms, the members of the `"baz"` module are never imported to your module's local scope; they sort of pass through untouched.

#### `import`ing API Members

To import a module, unsurprisingly you use the `import` statement. Just as `export` has several nuanced variations, so does `import`, so spend plenty of time considering the following issues and experimenting with your options.

If you want to import certain specific named members of a module's API into your top-level scope, you use this syntax:

```js
import { foo, bar, baz } from "foo";
```

**Warning:** The `{ .. }` syntax here may look like an object literal, or even an object destructuring syntax. However, its form is special just for modules, so be careful not to confuse it with other `{ .. }` patterns elsewhere.

The `"foo"` string is called a *module specifier*. Because the whole goal is statically analyzable syntax, the module specifier must be a string literal; it cannot be a variable holding the string value.

From the perspective of your ES6 code and the JS engine itself, the contents of this string literal are completely opaque and meaningless. The module loader will interpret this string as an instruction of where to find the desired module, either as a URL path or a local filesystem path.

The `foo`, `bar`, and `baz` identifiers listed must match named exports on the module's API (static analysis and error assertion apply). They are bound as top-level identifiers in your current scope:

```js
import { foo } from "foo";

foo();
```

You can rename the bound identifiers imported, as:

```js
import { foo as theFooFunc } from "foo";

theFooFunc();
```

If the module has just a default export that you want to import and bind to an identifier, you can opt to skip the `{ .. }` surrounding syntax for that binding. The `import` in this preferred case gets the nicest and most concise of the `import` syntax forms:

```js
import foo from "foo";

// or:
import { default as foo } from "foo";
```

**Note:** As explained in the previous section, the `default` keyword in a module's `export` specifies a named export where the name is actually `default`, as is illustrated by the second more verbose syntax option. The renaming from `default` to, in this case, `foo`, is explicit in the latter syntax and is identical yet implicit in the former syntax.

You can also import a default export along with other named exports, if the module has such a definition. Recall this module definition from earlier:

```js
export default function foo() { .. }

export function bar() { .. }
export function baz() { .. }
```

To import that module's default export and its two named exports:

```js
import FOOFN, { bar, baz as BAZ } from "foo";

FOOFN();
bar();
BAZ();
```

The strongly suggested approach from ES6's module philosophy is that you only import the specific bindings from a module that you need. If a module provides 10 API methods, but you only need two of them, some believe it wasteful to bring in the entire set of API bindings.

One benefit, besides code being more explicit, is that narrow imports make static analysis and error detection (accidentally using the wrong binding name, for instance) more robust.

Of course, that's just the standard position influenced by ES6 design philosophy; there's nothing that requires adherence to that approach.

Many developers would be quick to point out that such approaches can be more tedious, requiring you to regularly revisit and update your `import` statement(s) each time you realize you need something else from a module. The trade-off is in exchange for convenience.

In that light, the preference might be to import everything from the module into a single namespace, rather than importing individual members, each directly into the scope. Fortunately, the `import` statement has a syntax variation that can support this style of module consumption, called *namespace import*.

Consider a `"foo"` module exported as:

```js
export function bar() { .. }
export var x = 42;
export function baz() { .. }
```

You can import that entire API to a single module namespace binding:

```js
import * as foo from "foo";

foo.bar();
foo.x;			// 42
foo.baz();
```

**Note:** The `* as ..` clause requires the `*` wildcard. In other words, you cannot do something like `import { bar, x } as foo from "foo"` to bring in only part of the API but still bind to the `foo` namespace. I would have liked something like that, but for ES6 it's all or nothing with the namespace import.

If the module you're importing with `* as ..` has a default export, it is named `default` in the namespace specified. You can additionally name the default import outside of the namespace binding, as a top-level identifier. Consider a `"world"` module exported as:

```js
export default function foo() { .. }
export function bar() { .. }
export function baz() { .. }
```

And this `import`:

```js
import foofn, * as hello from "world";

foofn();
hello.default();
hello.bar();
hello.baz();
```

While this syntax is valid, it can be rather confusing that one method of the module (the default export) is bound at the top-level of your scope, whereas the rest of the named exports (and one called `default`) are bound as properties on a differently named (`hello`) identifier namespace.

As I mentioned earlier, my suggestion would be to avoid designing your module exports in this way, to reduce the chances that your module's users will suffer these strange quirks.

All imported bindings are immutable and/or read-only. Consider the previous import; all of these subsequent assignment attempts will throw `TypeError`s:

```js
import foofn, * as hello from "world";

foofn = 42;			// (runtime) TypeError!
hello.default = 42;	// (runtime) TypeError!
hello.bar = 42;		// (runtime) TypeError!
hello.baz = 42;		// (runtime) TypeError!
```

Recall earlier in the "`export`ing API Members" section that we talked about how the `bar` and `baz` bindings are bound to the actual identifiers inside the `"world"` module. That means if the module changes those values, `hello.bar` and `hello.baz` now reference the updated values.

But the immutable/read-only nature of your local imported bindings enforces that you cannot change them from the imported bindings, hence the `TypeError`s. That's pretty important, because without those protections, your changes would end up affecting all other consumers of the module (remember: singleton), which could create some very surprising side effects!

Moreover, though a module *can* change its API members from the inside, you should be very cautious of intentionally designing your modules in that fashion. ES6 modules are *intended* to be static, so deviations from that principle should be rare and should be carefully and verbosely documented.

**Warning:** There are module design philosophies where you actually intend to let a consumer change the value of a property on your API, or module APIs are designed to be "extended" by having other "plug-ins" add to the API namespace. As we just asserted, ES6 module APIs should be thought of and designed as static and unchangeable, which strongly restricts and discourages these alternative module design patterns. You can get around these limitations by exporting a plain object, which of course can then be changed at will. But be careful and think twice before going down that road.

Declarations that occur as a result of an `import` are "hoisted" (see the *Scope & Closures* title of this series). Consider:

```js
foo();

import { foo } from "foo";
```

`foo()` can run because not only did the static resolution of the `import ..` statement figure out what `foo` is during compilation, but it also "hoisted" the declaration to the top of the module's scope, thus making it available throughout the module.

Finally, the most basic form of the `import` looks like this:

```js
import "foo";
```

This form does not actually import any of the module's bindings into your scope. It loads (if not already loaded), compiles (if not already compiled), and evaluates (if not already run) the `"foo"` module.

In general, that sort of import is probably not going to be terribly useful. There may be niche cases where a module's definition has side effects (such as assigning things to the `window`/global object). You could also envision using `import "foo"` as a sort of preload for a module that may be needed later.

### Circular Module Dependency

A imports B. B imports A. How does this actually work?

I'll state off the bat that designing systems with intentional circular dependency is generally something I try to avoid. That having been said, I recognize there are reasons people do this and it can solve some sticky design situations.

Let's consider how ES6 handles this. First, module `"A"`:

```js
import bar from "B";

export default function foo(x) {
	if (x > 10) return bar( x - 1 );
	return x * 2;
}
```

Now, module `"B"`:

```js
import foo from "A";

export default function bar(y) {
	if (y > 5) return foo( y / 2 );
	return y * 3;
}
```

These two functions, `foo(..)` and `bar(..)`, would work as standard function declarations if they were in the same scope, because the declarations are "hoisted" to the whole scope and thus available to each other regardless of authoring order.

With modules, you have declarations in entirely different scopes, so ES6 has to do extra work to help make these circular references work.

In a rough conceptual sense, this is how circular `import` dependencies are validated and resolved:

* If the `"A"` module is loaded first, the first step is to scan the file and analyze all the exports, so it can register all those bindings available for import. Then it processes the `import .. from "B"`, which signals that it needs to go fetch `"B"`.
* Once the engine loads `"B"`, it does the same analysis of its export bindings. When it sees the `import .. from "A"`, it knows the API of `"A"` already, so it can verify the `import` is valid. Now that it knows the `"B"` API, it can also validate the `import .. from "B"` in the waiting `"A"` module.

In essence, the mutual imports, along with the static verification that's done to validate both `import` statements, virtually composes the two separate module scopes (via the bindings), such that `foo(..)` can call `bar(..)` and vice versa. This is symmetric to if they had originally been declared in the same scope.

Now let's try using the two modules together. First, we'll try `foo(..)`:

```js
import foo from "foo";
foo( 25 );				// 11
```

Or we can try `bar(..)`:

```js
import bar from "bar";
bar( 25 );				// 11.5
```

By the time either the `foo(25)` or `bar(25)` calls are executed, all the analysis/compilation of all modules has completed. That means `foo(..)` internally knows directly about `bar(..)` and `bar(..)` internally knows directly about `foo(..)`.

If all we need is to interact with `foo(..)`, then we only need to import the `"foo"` module. Likewise with `bar(..)` and the `"bar"` module.

Of course, we *can* import and use both of them if we want to:

```js
import foo from "foo";
import bar from "bar";

foo( 25 );				// 11
bar( 25 );				// 11.5
```

The static loading semantics of the `import` statement mean that a `"foo"` and `"bar"` that mutually depend on each other via `import` will ensure that both are loaded, parsed, and compiled before either of them runs. So their circular dependency is statically resolved and this works as you'd expect.

### Module Loading

We asserted at the beginning of this "Modules" section that the `import` statement uses a separate mechanism, provided by the hosting environment (browser, Node.js, etc.), to actually resolve the module specifier string into some useful instruction for finding and loading the desired module. That mechanism is the system *Module Loader*.

The default module loader provided by the environment will interpret a module specifier as a URL if in the browser, and (generally) as a local filesystem path if on a server such as Node.js. The default behavior is to assume the loaded file is authored in the ES6 standard module format.

Moreover, you will be able to load a module into the browser via an HTML tag, similar to how current script programs are loaded. At the time of this writing, it's not fully clear if this tag will be `<script type="module">` or `<module>`. ES6 doesn't control that decision, but discussions in the appropriate standards bodies are already well along in parallel of ES6.

Whatever the tag looks like, you can be sure that under the covers it will use the default loader (or a customized one you've pre-specified, as we'll discuss in the next section).

Just like the tag you'll use in markup, the module loader itself is not specified by ES6. It is a separate, parallel standard (http://whatwg.github.io/loader/) controlled currently by the WHATWG browser standards group.

At the time of this writing, the following discussions reflect an early pass at the API design, and things are likely to change.

#### Loading Modules Outside of Modules

One use for interacting directly with the module loader is if a non-module needs to load a module. Consider:

```js
// normal script loaded in browser via `<script>`,
// `import` is illegal here

Reflect.Loader.import( "foo" ) // returns a promise for `"foo"`
.then( function(foo){
	foo.bar();
} );
```

The `Reflect.Loader.import(..)` utility imports the entire module onto the named parameter (as a namespace), just like the `import * as foo ..` namespace import we discussed earlier.

**Note:** The `Reflect.Loader.import(..)` utility returns a promise that is fulfilled once the module is ready. To import multiple modules, you can compose promises from multiple `Reflect.Loader.import(..)` calls using `Promise.all([ .. ])`. For more information about Promises, see "Promises" in Chapter 4.

You can also use `Reflect.Loader.import(..)` in a real module to dynamically/conditionally load a module, where `import` itself would not work. You might, for instance, choose to load a module containing a polyfill for some ES7+ feature if a feature test reveals it's not defined by the current engine.

For performance reasons, you'll want to avoid dynamic loading whenever possible, as it hampers the ability of the JS engine to fire off early fetches from its static analysis.

#### Customized Loading

Another use for directly interacting with the module loader is if you want to customize its behavior through configuration or even redefinition.

At the time of this writing, there's a polyfill for the module loader API being developed (https://github.com/ModuleLoader/es6-module-loader). While details are scarce and highly subject to change, we can explore what possibilities may eventually land.

The `Reflect.Loader.import(..)` call may support a second argument for specifying various options to customize the import/load task. For example:

```js
Reflect.Loader.import( "foo", { address: "/path/to/foo.js" } )
.then( function(foo){
	// ..
} )
```

It's also expected that a customization will be provided (through some means) for hooking into the process of loading a module, where a translation/transpilation could occur after load but before the engine compiles the module.

For example, you could load something that's not already an ES6-compliant module format (e.g., CoffeeScript, TypeScript, CommonJS, AMD). Your translation step could then convert it to an ES6-compliant module for the engine to then process.

## Classes

From nearly the beginning of JavaScript, syntax and development patterns have all strived (read: struggled) to put on a facade of supporting class-oriented development. With things like `new` and `instanceof` and a `.constructor` property, who couldn't help but be teased that JS had classes hidden somewhere inside its prototype system?

Of course, JS "classes" aren't nearly the same as classical classes. The differences are well documented, so I won't belabor that point any further here.

**Note:** To learn more about the patterns used in JS to fake "classes," and an alternative view of prototypes called "delegation," see the second half of the *this & Object Prototypes* title of this series.

### `class`

Although JS's prototype mechanism doesn't work like traditional classes, that doesn't stop the strong tide of demand on the language to extend the syntactic sugar so that expressing "classes" looks more like real classes. Enter the ES6 `class` keyword and its associated mechanism.

This feature is the result of a highly contentious and drawn-out debate, and represents a smaller subset compromise from several strongly opposed views on how to approach JS classes. Most developers who want full classes in JS will find parts of the new syntax quite inviting, but will find important bits still missing. Don't worry, though. TC39 is already working on additional features to augment classes in the post-ES6 timeframe.

At the heart of the new ES6 class mechanism is the `class` keyword, which identifies a *block* where the contents define the members of a function's prototype. Consider:

```js
class Foo {
	constructor(a,b) {
		this.x = a;
		this.y = b;
	}

	gimmeXY() {
		return this.x * this.y;
	}
}
```

Some things to note:

* `class Foo` implies creating a (special) function of the name `Foo`, much like you did pre-ES6.
* `constructor(..)` identifies the signature of that `Foo(..)` function, as well as its body contents.
* Class methods use the same "concise method" syntax available to object literals, as discussed in Chapter 2. This also includes the concise generator form as discussed earlier in this chapter, as well as the ES5 getter/setter syntax. However, class methods are non-enumerable whereas object methods are by default enumerable.
* Unlike object literals, there are no commas separating members in a `class` body! In fact, they're not even allowed.

The `class` syntax definition in the previous snippet can be roughly thought of as this pre-ES6 equivalent, which probably will look fairly familiar to those who've done prototype-style coding before:

```js
function Foo(a,b) {
	this.x = a;
	this.y = b;
}

Foo.prototype.gimmeXY = function() {
	return this.x * this.y;
}
```

In either the pre-ES6 form or the new ES6 `class` form, this "class" can now be instantiated and used just as you'd expect:

```js
var f = new Foo( 5, 15 );

f.x;						// 5
f.y;						// 15
f.gimmeXY();				// 75
```

Caution! Though `class Foo` seems much like `function Foo()`, there are important differences:

* A `Foo(..)` call of `class Foo` *must* be made with `new`, as the pre-ES6 option of `Foo.call( obj )` will *not* work.
* While `function Foo` is "hoisted" (see the *Scope & Closures* title of this series), `class Foo` is not; the `extends ..` clause specifies an expression that cannot be "hoisted." So, you must declare a `class` before you can instantiate it.
* `class Foo` in the top global scope creates a lexical `Foo` identifier in that scope, but unlike `function Foo` does not create a global object property of that name.

The established `instanceof` operator still works with ES6 classes, because `class` just creates a constructor function of the same name. However, ES6 introduces a way to customize how `instanceof` works, using `Symbol.hasInstance` (see "Well-Known Symbols" in Chapter 7).

Another way of thinking about `class`, which I find more convenient, is as a *macro* that is used to automatically populate a `prototype` object. Optionally, it also wires up the `[[Prototype]]` relationship if using `extends` (see the next section).

An ES6 `class` isn't really an entity itself, but a meta concept that wraps around other concrete entities, such as functions and properties, and ties them together.

**Tip:** In addition to the declaration form, a `class` can also be an expression, as in: `var x = class Y { .. }`. This is primarily useful for passing a class definition (technically, the constructor itself) as a function argument or assigning it to an object property.

### `extends` and `super`

ES6 classes also have syntactic sugar for establishing the `[[Prototype]]` delegation link between two function prototypes -- commonly mislabeled "inheritance" or confusingly labeled "prototype inheritance" -- using the class-oriented familiar terminology `extends`:

```js
class Bar extends Foo {
	constructor(a,b,c) {
		super( a, b );
		this.z = c;
	}

	gimmeXYZ() {
		return super.gimmeXY() * this.z;
	}
}

var b = new Bar( 5, 15, 25 );

b.x;						// 5
b.y;						// 15
b.z;						// 25
b.gimmeXYZ();				// 1875
```

A significant new addition is `super`, which is actually something not directly possible pre-ES6 (without some unfortunate hack trade-offs). In the constructor, `super` automatically refers to the "parent constructor," which in the previous example is `Foo(..)`. In a method, it refers to the "parent object," such that you can then make a property/method access off it, such as `super.gimmeXY()`.

`Bar extends Foo` of course means to link the `[[Prototype]]` of `Bar.prototype` to `Foo.prototype`. So, `super` in a method like `gimmeXYZ()` specifically means `Foo.prototype`, whereas `super` means `Foo` when used in the `Bar` constructor.

**Note:** `super` is not limited to `class` declarations. It also works in object literals, in much the same way we're discussing here. See "Object `super`" in Chapter 2 for more information.

#### There Be `super` Dragons

It is not insignificant to note that `super` behaves differently depending on where it appears. In fairness, most of the time, that won't be a problem. But surprises await if you deviate from a narrow norm.

There may be cases where in the constructor you would want to reference the `Foo.prototype`, such as to directly access one of its properties/methods. However, `super` in the constructor cannot be used in that way; `super.prototype` will not work. `super(..)` means roughly to call `new Foo(..)`, but isn't actually a usable reference to `Foo` itself.

Symmetrically, you may want to reference the `Foo(..)` function from inside a non-constructor method. `super.constructor` will point at `Foo(..)` the function, but beware that this function can *only* be invoked with `new`. `new super.constructor(..)` would be valid, but it wouldn't be terribly useful in most cases, because you can't make that call use or reference the current `this` object context, which is likely what you'd want.

Also, `super` looks like it might be driven by a function's context just like `this` -- that is, that they'd both be dynamically bound. However, `super` is not dynamic like `this` is. When a constructor or method makes a `super` reference inside it at declaration time (in the `class` body), that `super` is statically bound to that specific class hierarchy, and cannot be overridden (at least in ES6).

What does that mean? It means that if you're in the habit of taking a method from one "class" and "borrowing" it for another class by overriding its `this`, say with `call(..)` or `apply(..)`, that may very well create surprises if the method you're borrowing has a `super` in it. Consider this class hierarchy:

```js
class ParentA {
	constructor() { this.id = "a"; }
	foo() { console.log( "ParentA:", this.id ); }
}

class ParentB {
	constructor() { this.id = "b"; }
	foo() { console.log( "ParentB:", this.id ); }
}

class ChildA extends ParentA {
	foo() {
		super.foo();
		console.log( "ChildA:", this.id );
	}
}

class ChildB extends ParentB {
	foo() {
		super.foo();
		console.log( "ChildB:", this.id );
	}
}

var a = new ChildA();
a.foo();					// ParentA: a
							// ChildA: a
var b = new ChildB();		// ParentB: b
b.foo();					// ChildB: b
```

All seems fairly natural and expected in this previous snippet. However, if you try to borrow `b.foo()` and use it in the context of `a` -- by virtue of dynamic `this` binding, such borrowing is quite common and used in many different ways, including mixins most notably -- you may find this result an ugly surprise:

```js
// borrow `b.foo()` to use in `a` context
b.foo.call( a );			// ParentB: a
							// ChildB: a
```

As you can see, the `this.id` reference was dynamically rebound so that `: a` is reported in both cases instead of `: b`. But `b.foo()`'s `super.foo()` reference wasn't dynamically rebound, so it still reported `ParentB` instead of the expected `ParentA`.

Because `b.foo()` references `super`, it is statically bound to the `ChildB`/`ParentB` hierarchy and cannot be used against the `ChildA`/`ParentA` hierarchy. There is no ES6 solution to this limitation.

`super` seems to work intuitively if you have a static class hierarchy with no cross-pollination. But in all fairness, one of the main benefits of doing `this`-aware coding is exactly that sort of flexibility. Simply, `class` + `super` requires you to avoid such techniques.

The choice boils down to narrowing your object design to these static hierarchies -- `class`, `extends`, and `super` will be quite nice -- or dropping all attempts to "fake" classes and instead embrace dynamic and flexible, classless objects and `[[Prototype]]` delegation (see the *this & Object Prototypes* title of this series).

#### Subclass Constructor

Constructors are not required for classes or subclasses; a default constructor is substituted in both cases if omitted. However, the default substituted constructor is different for a direct class versus an extended class.

Specifically, the default subclass constructor automatically calls the parent constructor, and passes along any arguments. In other words, you could think of the default subclass constructor sort of like this:

```js
constructor(...args) {
	super(...args);
}
```

This is an important detail to note. Not all class languages have the subclass constructor automatically call the parent constructor. C++ does, but Java does not. But more importantly, in pre-ES6 classes, such automatic "parent constructor" calling does not happen. Be careful when converting to ES6 `class` if you've been relying on such calls *not* happening.

Another perhaps surprising deviation/limitation of ES6 subclass constructors: in a constructor of a subclass, you cannot access `this` until `super(..)` has been called. The reason is nuanced and complicated, but it boils down to the fact that the parent constructor is actually the one creating/initializing your instance's `this`. Pre-ES6, it works oppositely; the `this` object is created by the "subclass constructor," and then you  call a "parent constructor" with the context of the "subclass" `this`.

Let's illustrate. This works pre-ES6:

```js
function Foo() {
	this.a = 1;
}

function Bar() {
	this.b = 2;
	Foo.call( this );
}

// `Bar` "extends" `Foo`
Bar.prototype = Object.create( Foo.prototype );
```

But this ES6 equivalent is not allowed:

```js
class Foo {
	constructor() { this.a = 1; }
}

class Bar extends Foo {
	constructor() {
		this.b = 2;			// not allowed before `super()`
		super();			// to fix swap these two statements
	}
}
```

In this case, the fix is simple. Just swap the two statements in the subclass `Bar` constructor. However, if you've been relying pre-ES6 on being able to skip calling the "parent constructor," beware because that won't be allowed anymore.

#### `extend`ing Natives

One of the most heralded benefits to the new `class` and `extend` design is the ability to (finally!) subclass the built-in natives, like `Array`. Consider:

```js
class MyCoolArray extends Array {
	first() { return this[0]; }
	last() { return this[this.length - 1]; }
}

var a = new MyCoolArray( 1, 2, 3 );

a.length;					// 3
a;							// [1,2,3]

a.first();					// 1
a.last();					// 3
```

Prior to ES6, a fake "subclass" of `Array` using manual object creation and linking to `Array.prototype` only partially worked. It missed out on the special behaviors of a real array, such as the automatically updating `length` property. ES6 subclasses should fully work with "inherited" and augmented behaviors as expected!

Another common pre-ES6 "subclass" limitation is with the `Error` object, in creating custom error "subclasses." When genuine `Error` objects are created, they automatically capture special `stack` information, including the line number and file where the error is created. Pre-ES6 custom error "subclasses" have no such special behavior, which severely limits their usefulness.

ES6 to the rescue:

```js
class Oops extends Error {
	constructor(reason) {
		super(reason);
		this.oops = reason;
	}
}

// later:
var ouch = new Oops( "I messed up!" );
throw ouch;
```

The `ouch` custom error object in this previous snippet will behave like any other genuine error object, including capturing `stack`. That's a big improvement!

### `new.target`

ES6 introduces a new concept called a *meta property* (see Chapter 7), in the form of `new.target`.

If that looks strange, it is; pairing a keyword with a `.` and a property name is definitely an out-of-the-ordinary pattern for JS.

`new.target` is a new "magical" value available in all functions, though in normal functions it will always be `undefined`. In any constructor, `new.target` always points at the constructor that `new` actually directly invoked, even if the constructor is in a parent class and was delegated to by a `super(..)` call from a child constructor. Consider:

```js
class Foo {
	constructor() {
		console.log( "Foo: ", new.target.name );
	}
}

class Bar extends Foo {
	constructor() {
		super();
		console.log( "Bar: ", new.target.name );
	}
	baz() {
		console.log( "baz: ", new.target );
	}
}

var a = new Foo();
// Foo: Foo

var b = new Bar();
// Foo: Bar   <-- respects the `new` call-site
// Bar: Bar

b.baz();
// baz: undefined
```

The `new.target` meta property doesn't have much purpose in class constructors, except accessing a static property/method (see the next section).

If `new.target` is `undefined`, you know the function was not called with `new`. You can then force a `new` invocation if that's necessary.

### `static`

When a subclass `Bar` extends a parent class `Foo`, we already observed that `Bar.prototype` is `[[Prototype]]`-linked to `Foo.prototype`. But additionally, `Bar()` is `[[Prototype]]`-linked to `Foo()`. That part may not have such an obvious reasoning.

However, it's quite useful in the case where you declare `static` methods (not just properties) for a class, as these are added directly to that class's function object, not to the function object's `prototype` object. Consider:

```js
class Foo {
	static cool() { console.log( "cool" ); }
	wow() { console.log( "wow" ); }
}

class Bar extends Foo {
	static awesome() {
		super.cool();
		console.log( "awesome" );
	}
	neat() {
		super.wow();
		console.log( "neat" );
	}
}

Foo.cool();					// "cool"
Bar.cool();					// "cool"
Bar.awesome();				// "cool"
							// "awesome"

var b = new Bar();
b.neat();					// "wow"
							// "neat"

b.awesome;					// undefined
b.cool;						// undefined
```

Be careful not to get confused that `static` members are on the class's prototype chain. They're actually on the dual/parallel chain between the function constructors.

#### `Symbol.species` Constructor Getter

One place where `static` can be useful is in setting the `Symbol.species` getter (known internally in the specification as `@@species`) for a derived (child) class. This capability allows a child class to signal to a parent class what constructor should be used -- when not intending the child class's constructor itself -- if any parent class method needs to vend a new instance.

For example, many methods on `Array` create and return a new `Array` instance. If you define a derived class from `Array`, but you want those methods to continue to vend actual `Array` instances instead of from your derived class, this works:

```js
class MyCoolArray extends Array {
	// force `species` to be parent constructor
	static get [Symbol.species]() { return Array; }
}

var a = new MyCoolArray( 1, 2, 3 ),
	b = a.map( function(v){ return v * 2; } );

b instanceof MyCoolArray;	// false
b instanceof Array;			// true
```

To illustrate how a parent class method can use a child's species declaration somewhat like `Array#map(..)` is doing, consider:

```js
class Foo {
	// defer `species` to derived constructor
	static get [Symbol.species]() { return this; }
	spawn() {
		return new this.constructor[Symbol.species]();
	}
}

class Bar extends Foo {
	// force `species` to be parent constructor
	static get [Symbol.species]() { return Foo; }
}

var a = new Foo();
var b = a.spawn();
b instanceof Foo;					// true

var x = new Bar();
var y = x.spawn();
y instanceof Bar;					// false
y instanceof Foo;					// true
```

The parent class `Symbol.species` does `return this` to defer to any derived class, as you'd normally expect. `Bar` then overrides to manually declare `Foo` to be used for such instance creation. Of course, a derived class can still vend instances of itself using `new this.constructor(..)`.

## Review

ES6 introduces several new features that aid in code organization:

* Iterators provide sequential access to data or operations. They can be consumed by new language features like `for..of` and `...`.
* Generators are locally pause/resume capable functions controlled by an iterator. They can be used to programmatically (and interactively, through `yield`/`next(..)` message passing) *generate* values to be consumed via iteration.
* Modules allow private encapsulation of implementation details with a publicly exported API. Module definitions are file-based, singleton instances, and statically resolved at compile time.
* Classes provide cleaner syntax around prototype-based coding. The addition of `super` also solves tricky issues with relative references in the `[[Prototype]]` chain.

These new tools should be your first stop when trying to improve the architecture of your JS projects by embracing ES6.
