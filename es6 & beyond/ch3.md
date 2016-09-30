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

早先，我们简要地介绍了generator是由迭代器控制的概念。现在让我们完整地深入这个话题。

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

在这种情况下，generator并没有真正暂停过，因为这里没有`yield ..`表达式。`yield *`只是通过递归调用保持当前的迭代步骤继续运行下去。所以，仅仅对迭代器的`next()`函数进行一次调用就完全地运行了generator。

现在让我们考虑一个有多个步骤并且因此有多个产生值的generator：

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}
```

我们已经知道我们可以是使用一个`for..of`循环来消费一个迭代器，即便它是一个附着在`*foo()`这样的generator上：

```js
for (var v of foo()) {
	console.log( v );
}
// 1 2 3
```

**注意：** `for..of`循环需要一个可迭代对象。一个generator函数引用（比如`foo`）本身不是一个可迭代对象；你必须使用`foo()`来执行它以得到迭代器（它还是一个可迭代对象，正如我们在本章早先讲解过的）。理论上你可以使用一个实质上仅仅执行`return this()`的`Symbol.iterator`函数来扩展`GeneratorPrototype`（所有generator函数的原型）。这将使`foo`引用本身成为一个可迭代对象，也就意味着`for (var v of foo) { .. }`（注意在`foo`上没有`()`）将可以工作。

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

如果你仔细观察，这里有三个`yield`语句和四个`next()`调用。这可能看起来像是一个奇怪的不匹配。事实上，假定所有的东西都被求值并且generator完全运行至完成的话，`next()`调用将总是比`yield`表达式多一个。

但是如果你相反的角度观察（从里向外而不是从外向里），`yield`和`next()`之间的匹配就显得更有道理。

回忆一下，`yield ..`表达式将被你用于继续generator的值完成。这意味着你传递给`next(..)`的参数值将完成任何当前暂停中等待完成的`yield ..`表达式。

让我们这样展示一下这种视角：

```js
function *foo() {
	var x = yield 1;
	var y = yield 2;
	var z = yield 3;
	console.log( x, y, z );
}
```

在这个代码段中，每个`yield ..`都送出一个值（`1`，`2`，`3`），但更直接的是，它暂停了generator来等待一个值。换句话说，它就像在问这样一个问题，“我应当在这里用什么值？我会在这里等你告诉我。”

现在，这是我们如何控制`*foo()`来启动它：

```js
var it = foo();

it.next();				// { value: 1, done: false }
```

这第一个`next()`调用从generator初始的暂停状态启动了它，并运行至第一个`yield`。在你调用第一个`next()`的那一刻，并没有`yield ..`表达式等待完成。如果你给第一个`next()`调用传递一个值，目前它会被扔掉，因为没有`yield`等着接受这样的一个值。

**注意：** 一个“ES6之后”时间表中的早期提案 *将* 允许你在generator内部通过一个分离的元属性（见第七章）来访问一个被传入初始`next(..)`调用的值。

现在，让我们回答那个未解的问题，“我应当给`x`赋什么值？” 我们将通过给 *下一个* `next(..)`调用发送一个值来回答：

```js
it.next( "foo" );		// { value: 2, done: false }
```

现在，`x`将拥有值`"foo"`，但我们也问了一个新的问题，“我应当给`y`赋什么值？”

```js
it.next( "bar" );		// { value: 3, done: false }
```

答案给出了，另一个问题被提出了。最终答案：

```js
it.next( "baz" );		// "foo" "bar" "baz"
						// { value: undefined, done: true }
```

现在，每一个`yield ..`的“问题”是如何被 *下一个* `next(..)`调用回答的，所以我们观察到的那个“额外的”`next()`调用总是使一切开始的那一个。

让我们把这些步骤放在一起：

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

在生成器的每次迭代都简单地为消费者生成一个值的情况下，你可认为一个generator是一个值的生成器。

但是在更一般的意义上，也许将generator认为是一个受控制的，累进的代码执行过程更恰当，与早先“自定义迭代器”一节中的`tasks`队列的例子非常相像。

**注意：** 这种视角正是我们将如何在第四章中重温generator的动力。特别是，`next(..)`没有理由一定要在前一个`next(..)`完成之后立即被调用。虽然generator的内部执行环境被暂停了，程序的其他部分仍然没有被阻塞，这包括控制generator什么时候被继续的异步动作能力。

### Early Completion

正如我们在本章早先讲过的，连接到一个generator的迭代器支持可选的`return(..)`和`throw(..)`方法。它们俩都有立即中止一个暂停的的generator的效果。

考虑如下代码：

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

`return(x)`有点像强制一个`return x`就在那个时刻被处理，这样你就立即得到这个指定的值。一旦一个generator完成，无论是正常地还是像展示的那样提前地，它就不再处理任何代码或返回任何值了。

`return(..)`除了可以手动调用，它还在迭代的最后被任何ES6中消费迭代器的结构自动调用，比如`for..of`循环和`...`扩散操作符。

这种能力的目的是，在控制端的代码不再继续迭代generator时它可以收到通知，这样它就可能做一些清理工作（释放资源，复位状态，等等）。与普通函数的清理模式完全相同，达成这个目的的主要方法是使用一个`finally`子句：

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

**警告：** 不要把`yield`语句放在`finally`子句内部！它是有效和合法的，但这确实是一个可怕的主意。它在某种意义上推迟了`return(..)`调用的完成，因为在`finally`子句中的任何`yield ..`表达式都被遵循来暂停和发送消息；你不会像期望的那样立即得到一个完成的generator。基本上没有任何好的理由去选择这种疯狂的 *坏的部分*，所以避免这么做！

前一个代码段除了展示`return(..)`如何在中止generator的同时触发`finally`子句，它还展示了一个generator在每次被调用时都产生一个全新的迭代器。事实上，你可以并发地使用连接到相同generator的多个迭代器：

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

你可以调用`throw(..)`来代替`return(..)`调用。就像`return(x)`实质上在generator当前的暂停点上注入了一个`return x`一样，调用`throw(x)`实质上就像在暂停点上注入了一个`throw x`。

除了处理异常的行为（我们在下一节讲解这对`try`子句意味着什么），`throw(..)`产生相同的提前完成 —— 在generator当前的暂停点中止它的运行。例如：

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

因为`throw(..)`基本上注入了一个`throw ..`来替换generator的`yield 1`这一行，而且没有东西处理这个异常，它立即传播回外面的调用端代码，调用端代码使用了一个`try..catch`来处理了它。

与`return(..)`不同的是，迭代器的`throw(..)`方法绝不会被自动调用。

当然，虽然没有在前面的代码段中展示，但如果当你调用`throw(..)`时有一个`try..finally`子句等在generator内部的话，这个`finally`子句将会在异常被传播回调用端代码之前有机会运行。

### Error Handling

正如我们已经得到的提示，generator中的错误处理可以使用`try..catch`表达，它在上行和下行两个方向都可以工作。

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

错误也可以通过`yield *`委托在两个方向上传播：

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

当`*foo()`调用`yield 1`时，值`1`原封不动地穿过了`*bar()`，就像我们已经看到过的那样。

但这个代码段最有趣的部分是，当`*foo()`调用`throw "foo: e2"`时，这个错误传播到了`*bar()`并立即被`*bar()`的`try..catch`块儿捕获。错误没有像值`1`那样穿过`*bar()`。

然后`*bar()`的`catch`将`err`普通地输出（`"foo: e2"`）之后`*bar()`就正常结束了，这就是为什么迭代器结果`{ value: undefined, done: true }`从`it.next()`中返回。

如果`*bar()`没有用`try..catch`环绕着`yield *..`表达式，那么错误将理所当然地一直传播出来，而且在它传播的路径上依然会完成（中止）`*bar()`。

### Transpiling a Generator

有可能在ES6之前的环境中表达generator的能力吗？事实上是可以的，而且有好几种了不起的工具在这么做，包括最著名的Facebook的Regenerator工具 (https://facebook.github.io/regenerator/)。

但为了更好地理解generator，让我们试着手动转换一下。基本上讲，我们将制造一个简单的基于闭包的状态机。

我们将使原本的generator非常简单：

```js
function *foo() {
	var x = yield 42;
	console.log( x );
}
```

开始之前，我们将需要一个我们能够执行的称为`foo()`的函数，它需要返回一个迭代器：

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

现在，我们需要一些内部变量来持续跟踪我们的“generator”的逻辑走到了哪一个步骤。我们称它为`state`。我们将有三种状态：起始状态的`0`，等待完成`yield`表达式的`1`，和generator完成的`2`。

每次`next(..)`被调用时，我们需要处理下一个步骤，然后递增`state`。为了方便，我们将每个步骤放在一个`switch`语句的`case`子句中，并且我们将它放在一个`next(..)`可以调用的称为`nextState(..)`的内部函数中。另外，因为`x`是一个横跨整个“generator”作用域的变量，所以它需要存活在`nextState(..)`函数的外部。

这是将它们放在一起（很明显，为了使概念的展示更清晰，它经过了某些简化）：

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

最后，让我们测试一下我们的前ES6“generator”：

```js
var it = foo();

it.next();				// { value: 42, done: false }

it.next( 10 );			// 10
						// { value: undefined, done: true }
```

不赖吧？希望这个练习能在你的脑中巩固这个概念：generator实际上只是状态机逻辑的简单语法。这使它们可以广泛地应用。

### Generator Uses

我们现在非常深入地理解了generator如何工作，那么，它们在什么地方有用？

我们已经看过了两种主要模式：

* *生产一系列值：* 这种用法可以很简单（例如，随机字符串或者递增的数字），或者它也可以表达更加结构化的数据访问（例如，迭代一个数据库查询结果的所有行）。

	 这两种方式中，我们使用迭代器来控制generator，这样就可以为每次`next(..)`调用执行一些逻辑。在数据解构上的普通迭代器只不过生成值而没有任何控制逻辑。

* *串行执行的任务队列：* 这种用法经常用来表达一个算法中步骤的流程控制，其中每一步都要求从某些外部数据源取得数据。对每块儿数据的请求可能会立即满足，或者可能会异步延迟地满足。

	 从generator内部代码的角度来看，在`yield`的地方，同步或异步的细节是完全不透明的。另外，这些细节被有意地抽象出去，这样就不会让这样的实现细节把各个步骤间自然的，顺序的表达搞得模糊不清。抽象还意味着实现可以被替换/重构，而根本不用碰generator中的代码。

当根据这些用法观察generator时，它们的含义要比仅仅是手动状态机的一种不同或更好的语法多多了。它们是一种用于组织和控制有序地生产与消费数据的强大工具。

## Modules

我觉得这样说并不夸张：在所有的JavaScript代码组织模式中最重要的就是，而且一直是，模块。对于我自己来说，而且我认为对广大典型的技术社区来说，模块模式驱动着绝大多数代码。

### The Old Way

传统的模块模式基于一个外部函数，它带有内部变量和函数，以及一个被返回的“公有API”。这个“公有API”带有对内部变量和功能拥有闭包的方法。它经常这样表达：

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

这个`Hello(..)`模块通过被后续调用可以产生多个实例。有时，一个模块为了作为一个单例（也就是，只需要一个实例）而只被调用一次，这样的情况下常见的是一种前面代码段的变种，使用IIFE：

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

这种模式是经受过检验的。它也足够灵活，以至于在许多不同的场景下可以有大量的各种变化。

其中一种最常见的是异步模块定义（AMD），另一种是统一模块定义（UMD）。我们不会在这里涵盖这些特定的模式和技术，但是它们在网上的许多地方有大量的讲解。

### Moving Forward

在ES6中，我们不再需要依赖外围函数和闭包来为我们提供模块支持了。ES6模块拥有头等语法上和功能上的支持。

在我们接触这些具体语法之前，重要的是要理解ES6模块与你以前曾经用过的模块比较起来，在概念上的一些相当显著的不同之处：

* ES6使用基于文件的模块，这意味着一个模块一个文件。同时，没有标准的方法将多个模块组合到一个文件中。

	 这意味着如果你要直接把ES6模块加载到一个浏览器web应用中的话，你将个别地加载它们，不是像常见的那样为了性能优化而作为一个单独文件中的一个巨大的包加载。

	 人们预期同时期到来的HTTP/2将会大幅缓和这种性能上的顾虑，因为它工作在一个持续的套接字连接上，因而可以用并行的，互相交错的方式非常高效地加载许多小文件。

* 一个ES6模块的API是静态的。这就是说，你在模块的公有API上静态地定义所有被导出的顶层内容，而这些内容之后不能被修改。

	 有些用法习惯于能够提供动态API定义，它的方法可以根据运行时的条件被增加/删除/替换。这些用法要么必须改变以适应ES6静态API，要么它们就不得不将属性/方法的动态修改限制在一个内层对象中。

* ES6模块都是单例。也就是，模块只有一个维持它状态的实例。每次你将这个模块导入到另一个模块时，你得到的都是一个指向中央实例的引用。如果你想要能够产生多个模块实例，你的模块将需要提供某种工厂来这么做。

* 你在模块的公有API上暴露的属性和方法不是值和引用的普通赋值。它们是在你内部模块定义中的标识符的实际绑定（几乎就是指针）。

	 在前ES6的模块中，如果你将一个持有像数字或者字符串这样基本类型的属性放在你的共有API中，那么这个属性是通过值拷贝赋值的，任何对相应内部变量的更新都将是分离的，不会影响在API对象上的共有拷贝。

	 在ES6中，导出一个本地私有变量，即便它当前持有一个基本类型的字符串/数字/等等，导出的都是这个变量的一个绑定。如果这个模块改变了这个变量的值，外部导入的绑定就会解析为那个新的值。

* 导入一个模块和静态地请求它被加载是同一件事情（如果以前它不是的话）。如果你在浏览器中，这意味着通过网络的阻塞加载。如果你在服务器中，它是一个通过文件系统的阻塞加载。

	 但是，不要对它在性能的影响上惊慌。因为ES6模块是静态定义的，导入的请求可以被静态地扫描，并提前加载，甚至是在你使用这个模块之前。

	 ES6并没有实际规定或操纵这些加载请求如何工作的机制。有一个模块加载器的分离概念，它让每一个宿主环境（浏览器，Node.js，等等）为该环境提供合适的默认加载器。一个模块的导入使用一个字符串值来表示从哪里去取得模块（URL，文件路径，等等），但是这个值在你的程序中是不透明的，它仅对加载器自身有意义。

	 如果你想要比默认加载器提供的更细致的控制能力，你可以定义你自己的加载器 —— 默认加载器基本上不提供任何控制，它对于你的程序代码是完全隐藏的。

如你所见，ES6模块将通过封装，控制共有API，以及应用依赖导入来服务于所有的代码组织需求。但是它们用一种非常特别的方式来这样做，而这可能与你已经使用多年的模块方式十分接近，也肯能差得很远。

#### CommonJS

有一种相似，但不是完全兼容的模块语法，称为CommonJS，那些使用Node.js生态系统的人很熟悉它。

不太委婉地说，从长久看来，ES6模块实质上将要取代所有先前的模块格式与标准，即便是CommonJS，因为它们是建立在语言的语法支持上的。如果出了普遍性以外没有其他原因，迟早ES6将必可避免地作为更好的方式胜出。

但是，要达到那一天我们还有相当长的路要走。在服务器端的JavaScript世界中差不多有成百上千的CommonJS风格模块，而在浏览器的世界里各种格式标准的模块（UMD，AMD，临时性的模块方案）数量还要多十倍。这要花许多年过渡才能取得任何显著的进展。

在这个过渡期间，模块转译器/转换器将是绝对必要的。你可能刚刚适应了这种新的现实。不论你是使用正规的模块，AMD，UMD，CommonJS，或者ES6，这些工具都不得不解析并转换为适合你代码运行环境的格式。

对于Node.js，这可能意味着（目前）转换的目标是CommonJS。对于浏览器来说，可能是UMD或者AMD。除了在接下来的几年中随着这些工具的成熟和最佳实践的出现而发生的许多变化。

从现在起，我能对模块的提出的最佳建议是：不管你曾经由于强烈的爱好而虔诚地追随哪一种格式，都要培养对理解ES6模块的欣赏，虽然价值平平，并让你对其他模块模式的倾向性渐渐消失掉。它们就是JS中模块的未来，即便现实有些偏差。

### The New Way

The two main new keywords that enable ES6 modules are `import` and `export`. There's lots of nuance to the syntax, so let's take a deeper look.

使用ES6模块的两个主要的心关键字是`import`和`export`。在语法上有许多微妙的地方，那么让我们深入地看看。

**Warning:** An important detail that's easy to overlook: both `import` and `export` must always appear in the top-level scope of their respective usage. For example, you cannot put either an `import` or `export` inside an `if` conditional; they must appear outside of all blocks and functions.

**警告：** 一个容易忽视的重要细节：`import`和`export`都必须总是出现在它们分别被使用之处的顶层作用域。例如，你不能把`import`或`export`放在一个`if`条件内部；它们必须出现在所有块儿和函数的外部。

#### `export`ing API Members

The `export` keyword is either put in front of a declaration, or used as an operator (of sorts) with a special list of bindings to export. Consider:

`export`关键字要么放在一个声明的前面，要么就与一组特殊的要被导出的绑定一起，用作一个操作符。考虑如下代码：

```js
export function foo() {
	// ..
}

export var awesome = 42;

var bar = [1,2,3];
export { bar };
```

Another way of expressing the same exports:

表达相同导出的另一种方法：

```js
function foo() {
	// ..
}

var awesome = 42;
var bar = [1,2,3];

export { foo, awesome, bar };
```

These are all called *named exports*, as you are in effect exporting the name bindings of the variables/functions/etc.

这些都称为 *命名导出*，因为你实际上导出的是变量/函数/等的名称绑定。

Anything you don't *label* with `export` stays private inside the scope of the module. That is, although something like `var bar = ..` looks like it's declaring at the top-level global scope, the top-level scope is actually the module itself; there is no global scope in modules.

任何你没有使用`export`*标记* 的东西将在模块作用域的内部保持私有。也就是说，虽然有些像`var bar = ..`的东西看起来像是在顶层全局作用域中声明的，但是这个顶层作用域实际上是模块本身；在模块中没有全局作用域。

**Note:** Modules *do* still have access to `window` and all the "globals" that hang off it, just not as lexical top-level scope. However, you really should stay away from the globals in your modules if at all possible.

**注意：** 模块确实依然可以访问挂在它外面的`window`和所有的“全局”，只是不作为顶层此法作用域而已。但是，你真的应该在你的模块中尽可能地远离全局。

You can also "rename" (aka alias) a module member during named export:

你还可以在命名导出期间“重命名”（也叫别名）一个模块成员：

```js
function foo() { .. }

export { foo as bar };
```

When this module is imported, only the `bar` member name is available to import; `foo` stays hidden inside the module.

当这个模块被导入时，只有成员名称`bar`可以用于导入；`foo`在模块内部保持隐藏。

Module exports are not just normal assignments of values or references, as you're accustomed to with the `=` assignment operator. Actually, when you export something, you're exporting a binding (kinda like a pointer) to that thing (variable, etc.).

模块导出不像你习以为常的`=`赋值操作符那样，仅仅是值或引用的普通赋值。实际上，当你导出某些东西时，你导出了一个对那个东西（变量等）的一个绑定（有些像指针）。

Within your module, if you change the value of a variable you already exported a binding to, even if it's already been imported (see the next section), the imported binding will resolve to the current (updated) value.

在你的模块内部，如果你改变一个你已经被导出绑定的变量的值，即使它已经被导入了（见下一节），这个被导入的绑定也将解析为当前的（更新后的）值。

Consider:

考虑如下代码：

```js
var awesome = 42;
export { awesome };

// later
awesome = 100;
```

When this module is imported, regardless of whether that's before or after the `awesome = 100` setting, once that assignment has happened, the imported binding resolves to the `100` value, not `42`.

当这个模块被导入时，无论它是在`awesome = 100`设定的之前还是之后，一旦这个赋值发生，被导入的绑定都将被解析为值`100`，不是`42`。

That's because the binding is, in essence, a reference to, or a pointer to, the `awesome` variable itself, rather than a copy of its value. This is a mostly unprecedented concept for JS introduced with ES6 module bindings.

这是因为，这个绑定实质上是一个指向变量`awesome`本身的一个引用，或指针，而不是它的值的一个拷贝。ES6模块绑定引入了一个对于JS来说几乎是史无前例的概念。

Though you can clearly use `export` multiple times inside a module's definition, ES6 definitely prefers the approach that a module has a single export, which is known as a *default export*. In the words of some members of the TC39 committee, you're "rewarded with simpler `import` syntax" if you follow that pattern, and conversely "penalized" with more verbose syntax if you don't.

虽然你显然可以在一个模块定义的内部多次使用`export`，但是ES6绝对偏向于一个模块只有一个单独导出的方式，这称为 *默认导出*。用TC39协会的一些成员的话说，如果你遵循这个模式你就可以“获得更简单的`import`语法作为奖励”，如果你不遵循你就会反过来得到更繁冗的语法作为“惩罚”。

A default export sets a particular exported binding to be the default when importing the module. The name of the binding is literally `default`. As you'll see later, when importing module bindings you can also rename them, as you commonly will with a default export.

一个默认导出将一个特定的导出绑定设置为在这个模块被导入时的默认绑定。这个绑定的名称是字面上的`default`。正如你即将看到的，在导入模块绑定时你还可以重命名它们，你经常会对默认导出这么做。

There can only be one `default` per module definition. We'll cover `import` in the next section, and you'll see how the `import` syntax is more concise if the module has a default export.

每个模块定义只能有一个`default`。我们将在下一节中讲解`import`，你将看到如果模块拥有默认导入时`import`语法如何变得更简洁。

There's a subtle nuance to default export syntax that you should pay close attention to. Compare these two snippets:

默认导出语法有一个微妙的细节你应当多加注意。比较这两个代码段：

```js
function foo(..) {
	// ..
}

export default foo;
```

And this one:

和这一个：

```js
function foo(..) {
	// ..
}

export { foo as default };
```

In the first snippet, you are exporting a binding to the function expression value at that moment, *not* to the identifier `foo`. In other words, `export default ..` takes an expression. If you later assign `foo` to a different value inside your module, the module import still reveals the function originally exported, not the new value.

在第一个代码段中，你导出的是那一个函数表达式在那一刻的值的绑定，*不是* 标识符`foo`的绑定。换句话说，`export default ..`接收一个表达式。如果你稍后在你的模块内部赋给`foo`一个不同的值，这个模块导入将依然表示原本被导出的函数，而不是那个新的值。

By the way, the first snippet could also have been written as:

顺带一提，第一个代码段还可以写做：

```js
export default function foo(..) {
	// ..
}
```

**Warning:** Although the `function foo..` part here is technically a function expression, for the purposes of the internal scope of the module, it's treated like a function declaration, in that the `foo` name is bound in the module's top-level scope (often called "hoisting"). The same is true for `export default class Foo..`. However, while you *can* do `export var foo = ..`, you currently cannot do `export default var foo = ..` (or `let` or `const`), in a frustrating case of inconsistency. At the time of this writing, there's already discussion of adding that capability in soon, post-ES6, for consistency sake.

**警告：** 虽然技术上讲这里的`function foo..`部分是一个函数表达式，但是对于模块内部作用域来说，它被视为一个函数声明，

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
