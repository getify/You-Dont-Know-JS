# 你不懂JS: 异步与性能
# 第四章: Generator

在第二章中，我们发现了在使用回调表达异步流程控制时的两个关键缺陷：

* 基于回调的异步与我们的大脑规划任务的各个步骤的过程不相符。
* 由于 *控制倒转* 回调是不可靠的，也是不可组合的。

在第三章中，我们详细地讨论了Promise如何反转回调的 *控制倒转*，重建了可靠性/可组合性。

现在让我们把注意力集中到用一种顺序的，看起来同步的风格来表达异步流程控制。使这一切成为可能的“魔法”是ES6的 **generator**。

## 打破运行至完成

在第一章中，我们讲解了一个JS开发者们在他们的代码中几乎永恒依仗的一个认识：一旦函数开始执行，它将运行直至完成，没有其他的代码可以在运行期间干扰它。

这看起来可能很滑稽，ES6引入了一种新型的函数，它不按照“运行至完成”的行为进行动作。这种新型的函数称为“generator（生成器）”。

为了理解它的含义，让我们看看这个例子：

```js
var x = 1;

function foo() {
	x++;
	bar();				// <-- 这一行会发生什么？
	console.log( "x:", x );
}

function bar() {
	x++;
}

foo();					// x: 3
```

在这个例子中，我们确信`bar()`会在`x++`和`console.log(x)`之间运行。但如果`bar()`不在这里呢？很明显结果将是`2`而不是`3`。

现在让我们来燃烧你的大脑。要是`bar()`不存在，但以某种方式依然可以在`x++`和`console.log(x)`语句之间运行呢？这可能吗？

在 **抢占式（preemptive）** 多线程语言中，`bar()`去“干扰”并正好在两个语句之间那一时刻运行，实质上时可能的。但JS不是抢占式的，也（还）不是多线程的。但是，如果`foo()`本身可以用某种办法在代码的这一部分指示一个“暂停”，那么这种“干扰”（并发）的 **协作** 形式就是可能的。

**注意：** 我使用“协作”这个词，不仅是因为它与经典的并发术语有关联（见第一章），也因为正如你将在下一个代码段中看到的，ES6在代码中指示暂停点的语法是`yield`——暗示一个让出控制权的礼貌的 *协作*。

这就是实现这种协作并发的ES6代码：

```js
var x = 1;

function *foo() {
	x++;
	yield; // 暂停！
	console.log( "x:", x );
}

function bar() {
	x++;
}
```

**注意：** 你将很可能在大多数其他的JS文档/代码中看到，一个generator的声明被格式化为`function* foo() { .. }`而不是我在这里使用的`function *foo() { .. }`——唯一的区别是摆放`*`位置的风格。这两种形式在功能性/语法上是完全一样的，还有第三种`function*foo() { .. }`（没空格）形式。这两种风格存在争议，但我基本上偏好`function *foo..`，因为当我在写作中用`*foo()`引用一个generator时，这种形式可以匹配我写的东西。如果我只说`foo()`，你就不会清楚地知道我是在说一个generator还是一个一般的函数。这纯粹是一个风格偏好的问题。

现在，我们该如何运行上面的代码，使`bar()`在`yield`那一点取代`*foo()`的执行？

```js
// 构建一个迭代器`it`来控制generator
var it = foo();

// 在这里开始`foo()`！
it.next();
x;						// 2
bar();
x;						// 3
it.next();				// x: 3
```

好了，这两段代码中有不少新的，可能使人困惑的东西，所以我们得跋涉好一段了。在我们用ES6的generator来讲解不同的机制/语法之前，让我们过一遍这个行为的流程：

1. `it = foo()`操作 *不会* 执行`*foo()`generator，它只不过构建了一个用来控制它执行的 *迭代器（iterator）*。我们一会更多地讨论 *迭代器*。
2. 第一个`it.next()`启动了`*foo()`generator，并且运行`*foo()`第一行上的`x++`。
3. `*foo()`在`yield`语句处暂停，就在这时第一个`it.next()`调用结束。在这个时刻，`*foo()`依然运行而且是活动的，但是处于暂停状态。
4. 我们观察`x`的值，现在它是`2`.
5. 我们调用`bar()`，它再一次用`x++`递增`x`。
6. 我们再一次观察`x`的值，现在它是`3`。
7. 最后的`it.next()`调用使`*foo()`generator从它暂停的地方继续运行，而后运行使用`x`的当前值`3`的`console.log(..)`语句。

清楚的是，`*foo()`启动了，但 *没有* 运行到底——它停在`yield`。我们稍后继续`*foo()`，让它完成，但这甚至不是必须的。

所以，一个generator是一种函数，它可以开始和停止一次或多次，甚至没必要一定要完成。虽然为什么它很强大看起来不那么明显，但正如我们将要在本章剩下的部分将要讲到的，它是我们用于在我们的代码中构建“generator异步流程控制”模式的基础构建块儿之一。

### 输入和输出

一个generator函数是一种带有我们刚才提到的新型处理模型的函数。但它仍然是一个函数，这意味着依旧有一些不变的基本原则——即，它依然接收参数（也就是“输入”），而且它依然返回一个值（也就是“输出”）：

```js
function *foo(x,y) {
	return x * y;
}

var it = foo( 6, 7 );

var res = it.next();

res.value;		// 42
```

我们将`6`和`7`分别作为参数`x`和`y`传递给`*foo(..)`。而`*foo(..)`将值`42`返回给调用端代码。

现在我们可以看到发生器的调用和一般函数的调用的一个不同之处了。`foo(6,7)`显然看起来很熟悉。但微妙的是，`*foo(..)`generator不会像一个函数那样实际运行起来。

相反，我们只是创建了 *迭代器* 对象，将它赋值给变量`it`，来控制`*foo(..)`generator。当我们调用`it.next()`时，它指示`*foo(..)`generator从现在的位置向前推进，直到下一个`yield`或者generator的最后。

`next(..)`调用的结果是一个带有`value`属性的对象，它持有从`*foo(..)`返回的任何值（如果有的话）。换句话说，`yield`导致在generator运行期间，一个值被从中发送出来，有点儿像一个中间的`return`。

但是，为什么我们需要这个完全间接的 *迭代器* 对象来控制generator还不清楚。我们回头会讨论它的，我保证。

#### 迭代通信

generator除了接收参数和拥有返回值，它们还内建有更强大，更吸引人的输入/输出消息能力，这是通过使用`yield`和`next(..)`实现的。

考虑下面的代码：

```js
function *foo(x) {
	var y = x * (yield);
	return y;
}

var it = foo( 6 );

// 开始`foo(..)`
it.next();

var res = it.next( 7 );

res.value;		// 42
```

首先，我们将`6`作为参数`x`传入。之后我们调用`it.next()`，它启动了`*foo(..)`.

在`*foo(..)`内部，`var y = x ..`语句开始被处理，但它运行到了一个`yield`表达式。就在这时，它暂停了`*foo(..)`（就在赋值语句的中间！），而且请求调用端代码为`yield`表达式提供一个结果值。接下来，我们调用`it.next(7)`，将`7`这个值传回去作为暂停的`yield`表达式的结果。

所以，在这个时候，赋值语句实质上是`var y = 6 * 7`。现在，`return y`将值`42`作为结果返回给`it.next( 7 )`调用。

注意一个非常重要，而且即便是对于老练的JS开发者也非常容易犯糊涂的事情：根据你的角度，在`yield`和`next(..)`调用之间存在着错位。一般来说，你所拥有的`next(..)`调用的数量，会比你所拥有的`yield`语句的数量多一个——前面的代码段中有一个`yield`和两个`next(..)`调用。

为什么会有这样的错位？

因为第一个`next(..)`总是启动一个generator，然后运行至第一个`yield`。但是第二个`next(..)`调用满足了第一个暂停的`yield`表达式，而第三个`next(..)`将满足第二个`yield`，如此反复。

##### 两个疑问的故事

实际上，你主要考虑的是哪部分代码会影响你是否感知到错位。

仅考虑generator代码：

```js
var y = x * (yield);
return y;
```

这 **第一个** `yield`基本上是在 *问一个问题*：“我应该在这里插入什么值？”

谁来回答这个问题？好吧，**第一个** `next()`在这个时候已经为了启动generator而运行过了，所以很明显 *它* 不能回答这个问题。所以，**第二个** `next(..)`调用必须回答由 **第一个** `yield`提出的问题。

看到错位了吧——第二个对第一个？

但是让我们反转一下我们的角度。让我们不从generator的角度看问题，而从迭代器的角度看。

为了恰当地描述这种角度，我们还需要解释一下，消息可以双向发送——`yield ..`作为表达式可以发送消息来应答`next(..)`调用，而`next(..)`可以发送值给暂停的`yield`表达式。考虑一下这段稍稍调整过的代码：

```js
function *foo(x) {
	var y = x * (yield "Hello");	// <-- 让出一个值！
	return y;
}

var it = foo( 6 );

var res = it.next();	// 第一个`next()`，不传递任何东西
res.value;				// "Hello"

res = it.next( 7 );		// 传递`7`给等待中的`yield`
res.value;				// 42
```

`yield ..`和`next(..)`一起成对地 **在generator运行期间** 构成了一个双向消息传递系统。

那么，如果只看 *迭代器* 代码：

```js
var res = it.next();	// 第一个`next()`，不传递任何东西
res.value;				// "Hello"

res = it.next( 7 );		// 传递`7`给等待中的`yield`
res.value;				// 42
```

**注意：** 我们没有传递任何值给第一个`next()`调用，而且是故意的。只有一个暂停的`yield`才能接收这样一个被`next(..)`传递的值，但是当我们调用第一个`next()`时，在generator的最开始并 **没有任何暂停的`yield`** 可以接收这样的值。语言规范和所有兼容此语言规范的浏览器只会无声地 **丢弃** 任何传入第一个`next()`的东西。传递这样的值是一个坏主意，因为你只不过创建了一些令人困惑的无声“失败”的代码。所以，记得总是用一个无参数的`next()`来启动generator。

第一个`next()`调用（没有任何参数的）基本上是在 *问一个问题*：“`*foo(..)`generator将要给我的 *下一个* 值是什么？”，谁来回答这个问题？第一个`yield`表达式。

看到了？这里没有错位。

根据你认为是 *谁* 在问问题，在`yield`和`next(..)`之间的错位既存在又不存在。

但等一下！跟`yield`语句的数量比起来，还有一个额外的`next()`。那么，这个最后的`it.next(7)`调用又一次在询问generator *下一个* 产生的值是什么。但是没有`yield`语句剩下可以回答了，不是吗？那么谁来回答？

`return`语句回答这个问题！

而且如果在你的generator中 **没有`return`**——比起一般的函数，generator中的`return`当然不再是必须的——总会有一个假定/隐式的`return;`（也就是`return undefined;`），它默认的目的就是回答由最后的`it.next(7)`调用 *提出* 的问题。

这些问题与回答——用`yield`和`next(..)`进行双向消息传递——十分强大，但还是看不出来这些机制与异步流程控制有什么联系。我们正在接近真相！

### 多迭代器

从语法使用上来看，当你用一个 *迭代器* 来控制generator时，你正在控制声明的generator函数本身。但这里有一个容易忽视的微妙细节：每当你构建一个 *迭代器*，你都隐含地构建了一个将由这个 *迭代器* 控制的generator的实例。

你可以让同一个generator的多个实例同时运行，它们甚至可以互动：

```js
function *foo() {
	var x = yield 2;
	z++;
	var y = yield (x * z);
	console.log( x, y, z );
}

var z = 1;

var it1 = foo();
var it2 = foo();

var val1 = it1.next().value;			// 2 <-- 让出2
var val2 = it2.next().value;			// 2 <-- 让出2

val1 = it1.next( val2 * 10 ).value;		// 40  <-- x:20,  z:2
val2 = it2.next( val1 * 5 ).value;		// 600 <-- x:200, z:3

it1.next( val2 / 2 );					// y:300
										// 20 300 3
it2.next( val1 / 4 );					// y:10
										// 200 10 3
```

**警告：** 同一个generator的多个并发运行实例的最常见的用法，不是这样的互动，而是generator在没有输入的情况下，从一些连接着的独立资源中产生它自己的值。我们将在下一节中更多地讨论产生值。

让我们简单地走一遍这个处理过程：

1. 两个`*foo()`在同时启动，而且两个`next()`都分别从`yield 2`语句中得到了`2`的`value`。
2. `val2 * 10`就是`2 * 10`，它被发送到第一个generator实例`it1`，所以`x`得到值`20`。`z`将`1`递增至`2`，然后`20 * 2`被`yield`出来，将`val1`设置为`40`。
3. `val1 * 5`就是`40 * 5`，它被发送到第二个generator实例`it2`中，所以`x`得到值`200`。`z`又一次递增，从`2`到`3`，然后`200 * 3`被`yield`出来，将`val2`设置为`600`。
4. `val2 / 2`就是`600 / 2`，它被发送到第一个generator实例`it1`，所以`y`得到值`300`，然后分别为它的`x y z`值打印出`20 300 3`。
5. `val1 / 4`就是`40 / 4`，它被发送到第一个generator实例`it2`，所以`y`得到值`10`，然后分别为它的`x y z`值打印出`200 10 3`。

这是在你脑海中跑过的一个“有趣”的例子。你还能保持清醒？

#### 穿插

回想第一章中“运行至完成”一节的这个场景：

```js
var a = 1;
var b = 2;

function foo() {
	a++;
	b = b * a;
	a = b + 3;
}

function bar() {
	b--;
	a = 8 + b;
	b = a * 2;
}
```

使用普通的JS函数，当然要么是`foo()`可以首先运行完成，要么是`bar()`可以首先运行至完成，但是`foo()`不可能与`bar()`穿插它的独立语句。所以，前面这段代码只有两个可能的结果。

然而，使用generator，明确地穿插（甚至是在语句中间！）是可能的：

```js
var a = 1;
var b = 2;

function *foo() {
	a++;
	yield;
	b = b * a;
	a = (yield b) + 3;
}

function *bar() {
	b--;
	yield;
	a = (yield 8) + b;
	b = a * (yield 2);
}
```

根据 *迭代器* 控制`*foo()`与`*bar()`分别以什么样的顺序被调用，前面这段代码可以产生几种不同的结果。换句话说，通过两个generator在同一个共享的变量上穿插，我们实际上可以展示（以一种模拟的方式）在第一章中讨论的，理论上的“线程的竞合状态”环境。

首先，让我们制造一个称为`step(..)`的帮助函数，让它控制 *迭代器*：

```js
function step(gen) {
	var it = gen();
	var last;

	return function() {
		// 不论`yield`出什么，只管在下一次时直接把它塞回去！
		last = it.next( last ).value;
	};
}
```

`step(..)`初始化一个generator来创建它的`it` *迭代器*，然后它返回一个函数，每次这个函数被调用时，都将 *迭代器* 向前推一步。另外，前一个被`yield`出来的值将被直接发给下一步。所以，`yield 8`将变成`8`而`yield b`将成为`b`（不管它在`yield`时是什么值）。

现在，为了好玩儿，让我们做一些实验，来看看将这些`*foo()`与`*bar()`的不同块儿穿插时的效果。我们从一个无聊的基本情况开始，保证`*foo()`在`*bar()`之前全部完成（就像我们在第一章中做的那样）：

```js
// 确保重置了`a`和`b`
a = 1;
b = 2;

var s1 = step( foo );
var s2 = step( bar );

// 首先完全运行`*foo()`
s1();
s1();
s1();

// 现在运行`*bar()`
s2();
s2();
s2();
s2();

console.log( a, b );	// 11 22
```

最终结果是`11`和`22`，就像第一章的版本那样。现在让我们把顺序混合穿插，来看看它如何改变`a`与`b`的值。

```js
// 确保重置了`a`和`b`
a = 1;
b = 2;

var s1 = step( foo );
var s2 = step( bar );

s2();		// b--;
s2();		// 让出 8
s1();		// a++;
s2();		// a = 8 + b;
			// 让出 2
s1();		// b = b * a;
			// 让出 b
s1();		// a = b + 3;
s2();		// b = a * 2;
```

在我告诉你结果之前，你能指出在前面的程序运行之后`a`和`b`的值是什么吗？不要作弊！

```js
console.log( a, b );	// 12 18
```

**注意：** 作为留给读者的练习，试试通过重新安排`s1()`和`s2()`调用的顺序，看看你能得到多少种结果组合。别忘了你总是需要三个`s1()`调用和四个`s2()`调用。至于为什么，回想一下刚才关于使用`yield`匹配`next()`的讨论。

当然，你几乎不会想有意制造 *这种* 水平的，令人糊涂的穿插，因为他创建了非常难理解的代码。但是这个练习很有趣，而且对于理解多个generator如何并发地运行在相同的共享作用域来说很有教育意义，因为会有一些地方这种能力十分有用。

我们会在本章末尾更详细地讨论generator并发。

## 生成值

在前一节中，我们提到了一个generator的有趣用法，作为一种生产值的方式。这 **不是** 我们本章主要关注的，但如果我们不在这里讲一下基本我们会想念它的，特别是因为这种用法实质上是它的名称的由来：生成器。

我们将要稍稍深入一下 *迭代器* 的话题，但我们会绕回到它们如何与generator关联，并使用generator来 *生成* 值。

### 发生器与迭代器

想象你正在生产一系列的值，它们中的每一个都与前一个值有可定义的关系。为此，你将需要一个有状态的发生器来记住上一个给出的值。

你可以用函数闭包（参加本系列的 *作用域与闭包*）来直接地实现这样的东西：

```js
var gimmeSomething = (function(){
	var nextVal;

	return function(){
		if (nextVal === undefined) {
			nextVal = 1;
		}
		else {
			nextVal = (3 * nextVal) + 6;
		}

		return nextVal;
	};
})();

gimmeSomething();		// 1
gimmeSomething();		// 9
gimmeSomething();		// 33
gimmeSomething();		// 105
```

**注意：** 这里`nextVal`的计算逻辑已经被简化了，但从概念上讲，直到 *下一次* `gimmeSomething()`调用发生之前，我们不想计算 *下一个值*（也就是`nextVal`），因为一般对于持久性更强的，或者比简单的`number`更有限的资源的发生器来说，那可能是一种资源泄漏的设计。

生成随意的数字序列不是是一个很真实的例子。但是如果你从一个数据源中生成记录呢？你可以想象很多相同的代码。

事实上，这种任务是一种非常常见的设计模式，通常用迭代器解决。一个 *迭代器* 是一个明确定义的接口，用来逐个通过一系列从发生器得到的值。迭代器的JS接口，和大多数语言一样，是在你每次想从发生器中得到下一个值时调用的`next()`。

我们可以为我们的数字序列发生器实现标准的 *迭代器*；

```js
var something = (function(){
	var nextVal;

	return {
		// `for..of`循环需要这个
		[Symbol.iterator]: function(){ return this; },

		// 标准的迭代器接口方法
		next: function(){
			if (nextVal === undefined) {
				nextVal = 1;
			}
			else {
				nextVal = (3 * nextVal) + 6;
			}

			return { done:false, value:nextVal };
		}
	};
})();

something.next().value;		// 1
something.next().value;		// 9
something.next().value;		// 33
something.next().value;		// 105
```

**注意：** 我们将在“Iterables”一节中讲解为什么我们在这个代码段中需要`[Symbol.iterator]: ..`这一部分。在语法上讲，两个ES6特性在发挥作用。首先，`[ .. ]`语法称为一个 *计算型属性名*（参见本系列的 *this与对象原型*）。它是一种字面对象定义方法，用来指定一个表达式并使用这个表达式的结果作为属性名。另一个，`Symbol.iterator`是ES6预定义的特殊`Symbol`值。

`next()`调用返回一个对象，它带有两个属性：`done`是一个`boolean`值表示 *迭代器* 的完成状态；`value`持有迭代的值。

ES6还增加了`for..of`循环，它意味着一个标准的 *迭代器* 可以使用原生的循环语法来自动地被消费：

```js
for (var v of something) {
	console.log( v );

	// 不要让循环永无休止！
	if (v > 500) {
		break;
	}
}
// 1 9 33 105 321 969
```

**注意：** 因为我们的`something`迭代器总是返回`done:false`，这个`for..of`循环将会永远运行，这就是为什么我们条件性地放进一个`break`。对于迭代器来说永不终结是完全没有问题的，但是也有一些情况 *迭代器* 将运行在有限的值的集合上，而最终返回`done:true`。

`for..of`循环为每一次迭代自动调用`next()`——他不会给`next()`传入任何值——而且他将会在收到一个`done:true`时自动终结。这对于在一个集合的数据中进行循环十分方便。

当然，你可以手动循环一个迭代器，调用`next()`并检查`done:true`条件来知道什么时候停止：

```js
for (
	var ret;
	(ret = something.next()) && !ret.done;
) {
	console.log( ret.value );

	// 不要让循环永无休止！
	if (ret.value > 500) {
		break;
	}
}
// 1 9 33 105 321 969
```

**注意：** 这种手动的`for`方式当然要比ES6的`for..of`循环语法难看，但它的好处是它提供给你一个机会，在有必要时传值给`next(..)`调用。

除了制造你自己的 *迭代器* 之外，许多JS中（就ES6来说）内建的数据结构，比如`array`，也有默认的 *迭代器*：

```js
var a = [1,3,5,7,9];

for (var v of a) {
	console.log( v );
}
// 1 3 5 7 9
```

`for..of`循环向`a`要来它的迭代器，并自动使用它迭代`a`的值。

**注意：** 看起来像是一个ES6的奇怪省略，普通的`object`有意地不带有像`array`那样的默认 *迭代器*。原因比我们要在这里讲的深刻得多。如果你想要的只是迭代一个对象的属性（不特别保证顺序），`Object.keys(..)`返回一个`array`，它可以像`for (var k of Object.keys(obj)) { ..`这样使用。像这样用`for..of`循环一个对象上的键，与用`for..in`循环内很相似，除了在`for..in`中会包含`[[Prototype]]`链的属性，而`Object.keys(..)`不会（参见本系列的 *this与对象原型*）。

### Iterables

在我们运行的例子中的`something`对象被称为一个 *迭代器*，因为它的接口中有`next()`方法。但一个紧密关联的术语是 *iterable*，它指 **包含有** 一个可以迭代它所有值的迭代器的对象。

在ES6中，从一个 *iterable* 中取得一个 *迭代器* 的方法是，*iterable* 上必须有一个函数，它的名称是特殊的ES6符号值`Symbol.iterator`。当这个函数被调用时，它就会返回一个 *迭代器*。虽然不是必须的，但一般来说每次调用应当返回一个全新的 *迭代器*。

前一个代码段的`a`就是一个 *iterable*。`for..of`循环自动地调用它的`Symbol.iterator`函数来构建一个 *迭代器*。我们当然可以手动地调用这个函数，然后使用它返回的 *iterator*：

```js
var a = [1,3,5,7,9];

var it = a[Symbol.iterator]();

it.next().value;	// 1
it.next().value;	// 3
it.next().value;	// 5
..
```

在前面定义`something`的代码段中，你可能已经注意到了这一行：

```js
[Symbol.iterator]: function(){ return this; }
```

这段有点让人困惑的代码制造了`something`值——`something`*迭代器* 的接口——也是一个 *iterable*；现在它既是一个 *iterable* 也是一个 *迭代器*。然后，我们把`something`传递给`for..of`循环：

```js
for (var v of something) {
	..
}
```

`for..of`循环期待`something`是一个 *iterable*，所以它会寻找并调用它的`Symbol.iterator`函数。我们将这个函数定义为简单地`return this`，所以它将自己给出，而`for..of`不会知道这些。

### Generator迭代器

带着 *迭代器* 的背景知识，让我们把注意力移回generator。一个generator可以被看做一个值的发生器，我们通过一个 *迭代器* 接口的`next()`调用每次从中抽取一个值。

所以，一个generator本身在技术上讲并不是一个 *iterable*，虽然很相似——当你执行generator时，你就得到一个 *迭代器*：

```js
function *foo(){ .. }

var it = foo();
```

我们可以用generator实现早前的`something`无限数字序列发生器，就像这样：

```js
function *something() {
	var nextVal;

	while (true) {
		if (nextVal === undefined) {
			nextVal = 1;
		}
		else {
			nextVal = (3 * nextVal) + 6;
		}

		yield nextVal;
	}
}
```

**注意：** 在一个真实的JS程序中含有一个`while..true`循环通常是一件非常不好的事情，至少如果它没有一个`break`或`return`语句，那么它就很可能永远运行，并同步地，阻塞/锁定浏览器UI。然而，在generator中，如果这样的循环含有一个`yield`，那它就是完全没有问题的，因为generator将在每次迭代后暂停，`yield`回主程序和/或事件轮询队列。说的明白点儿，“generator把`while..true`带回到JS编程中了！”

这变得相当干净和简单点儿了，对吧？因为generator会暂停在每个`yield`，`*something()`函数的状态（作用域）被保持着，这意味着没有必要用闭包的模板代码来跨调用保留变量的状态了。

不仅是更简单的代码——我们不必自己制造 *迭代器* 接口了——它实际上是更合理的代码，因为它更清晰地表达了意图。比如，`while..true`循环告诉我们这个generator将要永远运行——只要我们一直向它请求，它就一直 *产生* 值。

现在我们可以在`for..of`循环中使用新得发亮的`*something()`generator了，而且你会看到它工作起来基本一模一样：

```js
for (var v of something()) {
	console.log( v );

	// 不要让循环永无休止！
	if (v > 500) {
		break;
	}
}
// 1 9 33 105 321 969
```

不要跳过`for (var v of something()) ..`！我们不仅仅像之前的例子那样将`something`作为一个值引用了，而是调用`*something()`generator来得到它的 *迭代器*，并交给`for..of`使用。

如果你仔细观察，在这个generator和循环的互动中，你可能会有两个疑问：

* 为什么我们不能说`for (var v of something) ..`？因为这个`something`是一个generator，而不是一个 *iterable*。我们不得不调用`something()`来构建一个发生器给`for..of`，以便它可以迭代。
* `something()`调用创建一个 *迭代器*，但是`for..of`想要一个 *iterable*，对吧？对，generator的 *迭代器* 上也有一个`Symbol.iterator`函数，这个函数基本上就是`return this`，就像我们刚才定义的`something`*iterable*。换句话说generator的 *迭代器* 也是一个 *iterable*！

#### 停止Generator

在前一个例子中，看起来在循环的`break`被调用后，`*something()`generator的 *迭代器* 实例基本上被留在了一个永远挂起的状态。

但是这里有一个隐藏的行为为你处理这件事。`for..of`循环的“异常完成”（“提前终结”等等）——一般是由`break`，`return`，或未捕捉的异常导致的——会向generator的 *迭代器* 发送一个信号，以使它终结。

**注意：** 技术上讲，`for..of`循环也会在循环正常完成时向 *迭代器* 发送这个信号。对于generator来说，这实质上是一个无实际意义的操作，因为generator的 *迭代器* 要首先完成，`for..of`循环才能完成。然而，自定义的 *迭代器* 可能会希望从`for..of`循环的消费者那里得到另外的信号。

虽然一个`for..of`循环将会自动发送这种信号，你可能会希望手动发送信号给一个 *迭代器*；你可以通过调用`return(..)`来这么做。

如果你在generator内部指定一个`try..finally`从句，它将总是被执行，即便是generator从外部被完成。这在你需要进行资源清理时很有用（数据库连接等）：

```js
function *something() {
	try {
		var nextVal;

		while (true) {
			if (nextVal === undefined) {
				nextVal = 1;
			}
			else {
				nextVal = (3 * nextVal) + 6;
			}

			yield nextVal;
		}
	}
	// 清理用的从句
	finally {
		console.log( "cleaning up!" );
	}
}
```

前面那个在`for..of`中带有`break`的例子将会触发`finally`从句。但是你可以用`return(..)`从外部来手动终结generator的 *迭代器* 实例：

```js
var it = something();
for (var v of it) {
	console.log( v );

	// 不要让循环永无休止！
	if (v > 500) {
		console.log(
			// 使generator得迭代器完成
			it.return( "Hello World" ).value
		);
		// 这里不需要`break`
	}
}
// 1 9 33 105 321 969
// cleaning up!
// Hello World
```

当我们调用`it.return(..)`时，它会立即终结generator，从而运行`finally`从句。而且，它会将返回的`value`设置为你传入`return(..)`的任何东西，这就是`Hellow World`如何立即返回来的。我们现在也不必再包含一个`break`，因为generator的 *迭代器* 会被设置为`done:true`，所以`for..of`循环会在下一次迭代时终结。

generator的命名大部分源自于这种 *消费生产的值* 的用法。但要重申的是，这只是generator的用法之一，而且坦白的说，在这本书的背景下这甚至不是我们主要关注的。

但是现在我们更加全面地了解它们的机制是如何工作的，我们接下来可以将注意力转向generator如何实施于异步并发。

## 异步地迭代Generator

generator要怎样处理异步编码模式，解决回调和类似的问题？让我们开始回答这个重要的问题。

我们应当重温一下第三章的一个场景。回想一下这个回调方式：

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

如果我们想用generator表示相同的任务流控制，我们可以：

```js
function foo(x,y) {
	ajax(
		"http://some.url.1/?x=" + x + "&y=" + y,
		function(err,data){
			if (err) {
				// 向`*main()`中扔进一个错误
				it.throw( err );
			}
			else {
				// 使用收到的`data`来继续`*main()`
				it.next( data );
			}
		}
	);
}

function *main() {
	try {
		var text = yield foo( 11, 31 );
		console.log( text );
	}
	catch (err) {
		console.error( err );
	}
}

var it = main();

// 使一切开始运行！
it.next();
```

一眼看上去，这个代码段要比以前的回调代码更长，而且也许看起来更复杂。但不要让这种印象误导你。generator的代码段实际上要好 **太多** 了！但是这里有很多我们需要讲解的。

首先，让我们看看代码的这一部分，也是最重要的部分：

```js
var text = yield foo( 11, 31 );
console.log( text );
```

花一点时间考虑一下这段代码如何工作。我们调用了一个普通的函数`foo(..)`，而且我们显然可以从Ajax调用那里得到`text`，即便它是异步的。

这怎么可能？如果你回忆一下第一章的最开始，我们有一个几乎完全一样的代码：

```js
var data = ajax( "..url 1.." );
console.log( data );
```

但是这段代码不好用！你能发现不同吗？它就是在generator中使用的`yield`。

这就是魔法发生的地方！是它允许我们拥有一个看起来是阻塞的，同步的，但实际上不会阻塞整个程序的代码；它仅仅暂停/阻塞在generator本身的代码。

在`yield foo(11,31)`中，首先`foo(11,31)`调用被发起，它什么也不返回（也就是`undefined`），所以我们发起了数据请求，然后我们实际上做的是`yield undefined`。这没问题，因为这段代码现在没有依赖`yield`的值来做任何有趣的事。我们在本章稍后再重新讨论这个问题。

在这里，我们没有将`yield`作为消息传递的工具，只是作为进行暂停/阻塞的流程控制的工具。实际上，它会传递消息，但是只是单向的，在generator被继续运行之后。

那么，generator暂停在了`yield`，它实质上再问一个问题，“我该将什么值返回并赋给变量`text`？”谁来回答这个问题？

看一下`foo(..)`。如果Ajax请求成功，我们调用：

```js
it.next( data );
```

这将使generator使用应答数据继续运行，这意味着我们暂停的`yield`表达式直接收到这个值，然后因为它重新开始以运行generator代码，所以这个值被赋给本地变量`text`。

很酷吧？

退一步考虑一下它的意义。我们在generator内部的代码看起来完全是同步的（除了`yield`关键字本身），但隐藏在幕后的是，在`foo(..)`内部，操作可以完全是异步的。

**这很伟大！** 这几乎完美地解决了我们前面遇到的问题：回调不能像我们的大脑可以关联的那样，以一种顺序，同步的风格表达异步处理。

实质上，我们将异步处理作为实现细节抽象出去，以至于我们可以同步地/顺序地推理我们的流程控制：“发起Ajax请求，然后在它完成之后打印应答。” 当然，我们仅仅在这个流程控制中表达了两个步骤，但同样的能力可以无边界地延伸，让我们需要表达多少步骤，就表达多少。

**提示：** 这是一个如此重要的认识，为了充分理解，现在回过头去再把最后三段读一遍！

### 同步错误处理

但是前面的generator代码会 *让* 出更多的好处给我们。让我们把注意力移到generator内部的`try..catch`上：

```js
try {
	var text = yield foo( 11, 31 );
	console.log( text );
}
catch (err) {
	console.error( err );
}
```

这是怎么工作的？`foo(..)`调用是异步完成的，`try..catch`不是无法捕捉异步错误吗？就像我们在第三章中看到的？

我们已经看到了`yield`如何让赋值语句暂停，来等待`foo(..)`去完成，以至于完成的响应可以被赋予`text`。牛X的是，`yield`暂停 *还* 允许generator来`catch`一个错误。我们在前面的例子，我们用这一部分代码将这个错误抛出到generator中：

```js
if (err) {
	// 向`*main()`中扔进一个错误
	it.throw( err );
}
```

generator的`yield`暂停特性不仅意味着我们可以从异步的函数调用那里得到看起来同步的`return`值，还意味着我们可以同步地捕获这些异步函数调用的错误！

那么我们看到了，我们可以将错误 *抛入* generator，但是将错误 *抛出* 一个generator呢？和你期望的一样：

```js
function *main() {
	var x = yield "Hello World";

	yield x.toLowerCase();	// 引发一个异常！
}

var it = main();

it.next().value;			// Hello World

try {
	it.next( 42 );
}
catch (err) {
	console.error( err );	// TypeError
}
```

当然，我们本可以用`throw ..`手动地抛出一个错误，而不是制造一个异常。

我们甚至可以`catch`我们`throw(..)`进generator的同一个错误，实质上给了generator一个机会来处理它，但如果generator没处理，那么 *迭代器* 代码必须处理它：

```js
function *main() {
	var x = yield "Hello World";

	// 永远不会跑到这里
	console.log( x );
}

var it = main();

it.next();

try {
	// `*main()`会处理这个错误吗？我们走着瞧！
	it.throw( "Oops" );
}
catch (err) {
	// 不，它没处理！
	console.error( err );			// Oops
}
```

使用异步代码的，看似同步的错误处理（通过`try..catch`）在可读性和可推理性上大获全胜。

## Generators + Promises

在我们前面的讨论中，我们展示了generator如何可以异步地迭代，这是一个用顺序的可推理性来取代混乱如面条的回调的一个巨大进步。但我们丢掉了两个非常重要的东西：Promise的可靠性和可组合性（见第三章）！

别担心——我们会把它们拿回来。在ES6的世界中最棒的就是将generator（看似同步的异步代码）与Promise（可靠性和可组合性）组合起来。

但怎么做呢？

回想一下第三章中我们基于Promise的方式运行Ajax的例子：

```js
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

foo( 11, 31 )
.then(
	function(text){
		console.log( text );
	},
	function(err){
		console.error( err );
	}
);
```

在我们早先的运行Ajax的例子的generator代码中，`foo(..)`什么也不返回（`undefined`），而且我们的 *迭代器* 控制代码也不关心`yield`的值。

但这里的Promise相关的`foo(..)`在发起Ajax调用后返回一个promise。这暗示着我们可以用`foo(..)`构建一个promise，然后从generator中`yield`出来，而后 *迭代器* 控制代码将可以收到这个promise。

那么 *迭代器* 应当对promise做什么？

它应当监听promise的解析（完成或拒绝），然后要么使用完成消息继续运行generator，要么使用拒绝理由向generator抛出错误。

让我重复一遍，因为它如此重要。发挥Promise和generator的最大功效的自然方法是 **`yield`一个Promise**，并将这个Promise连接到generator的 *迭代器* 的控制端。

让我们试一下！首先，我们将Promise相关的`foo(..)`与generator`*main()`放在一起：

```js
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

function *main() {
	try {
		var text = yield foo( 11, 31 );
		console.log( text );
	}
	catch (err) {
		console.error( err );
	}
}
```

在这个重构中最强大的启示是，`*main()`内部的代码 **更本就没变！** 在generator内部，无论什么样的值被`yield`出去都是一个不可见的实现细节，所以我们甚至不会察觉它发生了，也不用担心它。

那么我们现在如何运行`*main()`？我们还有一些管道的实现工作要做，接收并连接`yield`的promise，使它能够根据解析来继续运行generator。我们从手动这么做开始：

```js
var it = main();

var p = it.next().value;

// 等待`p` promise解析
p.then(
	function(text){
		it.next( text );
	},
	function(err){
		it.throw( err );
	}
);
```

其实，根本不费事，对吧？

这段代码应当看起来与我们早前做的很相似：手动地连接被错误优先的回调控制的generator。与`if (err) { it.throw..`不同的是，promise已经为我们分割为完成（成功）与拒绝（失败），否则 *迭代器* 控制是完全相同的。

现在，我们已经掩盖了一些重要的细节。

最重要的是，我们利用了这样一个事实：我们知道`*main()`里面只有一个Promise相关的步骤。如果我们想要能用Promise驱动一个generator而不管它有多少步骤呢？我们当然不想为每一个generator手动编写一个不同的Promise链！要是有这样一种方法该多好：可以重复（也就是“循环”）迭代的控制，而且每次一有Promise出来，就在继续之前等待它的解析。

另外，如果generator在`it.next()`调用期间抛出一个错误怎么办？我们是该退出，还是应该`catch`它并把它送回去？相似地，要是我们`it.throw(..)`一个Promise拒绝给generator，但是没有被处理，又直接回来了呢？

### 带有Promise的Generator运行器

你在这条路上探索得越远，你就越能感到，“哇，要是有一些工具能帮我做这些就好了。”而且你绝对是对的。这是一种如此重要的模式，而且你不想把它弄错（或者因为一遍又一遍地重复它而把自己累死），所以你最好的选择是把赌注压在一个工具上，而它以我们将要描述的方式使用这种特定设计的工具来 *运行* `yield`Promise的generator。

有几种Promise抽象库提供了这样的工具，包括我的 *asynquence* 库和它的`runner(..)`，我们将在本书的在附录A中讨论它。

但看在学习和讲解的份儿上，让我们定义我们自己的名为`run(..)`的独立工具：

```js
// 感谢Benjamin Gruenbaum (@benjamingr在GitHub)在此做出的巨大改进！
function run(gen) {
	var args = [].slice.call( arguments, 1), it;

	// 在当前的上下文环境中初始化generator
	it = gen.apply( this, args );

	// 为generator的完成返回一个promise
	return Promise.resolve()
		.then( function handleNext(value){
			// 运行至下一个让出的值
			var next = it.next( value );

			return (function handleResult(next){
				// generator已经完成运行了？
				if (next.done) {
					return next.value;
				}
				// 否则继续执行
				else {
					return Promise.resolve( next.value )
						.then(
							// 在成功的情况下继续异步循环，将解析的值送回generator
							handleNext,

							// 如果`value`是一个拒绝的promise，就将错误传播回generator自己的错误处理g
							function handleErr(err) {
								return Promise.resolve(
									it.throw( err )
								)
								.then( handleResult );
							}
						);
				}
			})(next);
		} );
}
```

如你所见，它可能比你想要自己编写的东西复杂得多，特别是你将不会想为每个你使用的generator重复这段代码。所以，一个帮助工具/库绝对是可行的。虽然，我鼓励你花几分钟时间研究一下这点代码，以便对如何管理generator+Promise交涉得到更好的感觉。

你如何在我们 *正在讨论* 的Ajax例子中将`run(..)`和`*main()`一起使用呢？

```js
function *main() {
	// ..
}

run( main );
```

就是这样！按照我们连接`run(..)`的方式，它将自动地，异步地推进你传入的generator，直到完成。

**注意：** 我们定义的`run(..)`返回一个promise，它被连接成一旦generator完成就立即解析，或者收到一个未捕获的异常，而generator没有处理它。我们没有在这里展示这种能力，但我们会在本章稍后回到这个话题。

#### ES7: `async` 和 `await`？

前面的模式——generator让出一个Promise，然后这个Promise控制generator的 *迭代器* 向前推进至它完成——是一个如此强大和有用的方法，如果我们能不通过乱七八糟的帮助工具库（也就是`run(..)`）来使用它就更好了。

在这方面可能有一些好消息。在写作这本书的时候，后ES6，ES7化的时间表上已经出现了草案，对这个问题提供早期但强大的附加语法支持。显然，现在还太早而不能保证其细节，但是有相当大的可能性它将蜕变为类似于下面的东西：

```js
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

async function main() {
	try {
		var text = await foo( 11, 31 );
		console.log( text );
	}
	catch (err) {
		console.error( err );
	}
}

main();
```

如你所见，这里没有`run(..)`调用（意味着不需要工具库！）来驱动和调用`main()`——它仅仅像一个普通函数那样被调用。另外，`main()`不再作为一个generator函数声明；它是一种新型的函数：`async function`。而最后，与`yield`一个Promise相反，我们`await`它解析。

如果你`await`一个Promise，`async function`会自动地知道做什么——它会暂停这个函数（就像使用generator那样）直到Promise解析。我们没有在这个代码段中展示，但是调用一个像`main()`这样的异步函数将自动地返回一个promise，它会在函数完全完成时被解析。

**提示：** `async` / `await`的语法应该对拥有C#经验的读者看起来非常熟悉，因为它们基本上是一样的。

这个草案实质上是为我们已经衍生出的模式进行代码化的支持，成为一种语法机制：用看似同步的流程控制代码与Promise组合。将两个世界的最好部分组合，来有效解决我们用回调遇到的几乎所有主要问题。

这样的ES7化草案已经存在，并且有了早期的支持和热忱的拥护。这一事实为这种异步模式在未来的重要性上信心满满地投了有力的一票。

### Generator中的Promise并发

至此，所有我们展示过的是一种使用Promise+generator的单步异步流程。但是现实世界的代码将总是有许多异步步骤。

如果你不小心，generator看似同步的风格也许会蒙蔽你，使你在如何构造你的异步并发上感到自满，导致性能次优的模式。那么我们想花一点时间来探索一下其他选项。

想象一个场景，你需要从两个不同的数据源取得数据，然后将这些应答组合来发起第三个请求，最后打印出最终的应答。我们在第三章中用Promise探索过类似的场景，但这次让我们在generator的环境下考虑它。

你的第一直觉可能是像这样的东西：

```js
function *foo() {
	var r1 = yield request( "http://some.url.1" );
	var r2 = yield request( "http://some.url.2" );

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// 使用刚才定义的`run(..)`工具
run( foo );
```

这段代码可以工作，但在我们特定的这个场景中，它不是最优的。你能发现为什么吗？

因为`r1`和`r2`请求可以——而且为了性能的原因，*应该*——并发运行，但在这段代码中它们将顺序地运行；直到`"http://some.url.1"`请求完成之前，`"http://some.url.2"`URL不会被Ajax取得。这两个请求是独立的，所以性能更好的方式可能是让它们同时运行。

但是使用generator和`yield`，到底应该怎么做？我们知道`yield`在代码中只是一个单独的暂停点，所以你根本不能再同一时刻做两次暂停。

最自然和有效的答案是基于Promise的异步流程，特别是因为它们的时间无关的状态管理能力（参见第三章的“未来的值”）。

最简单的方式：

```js
function *foo() {
	// 使两个请求“并行”
	var p1 = request( "http://some.url.1" );
	var p2 = request( "http://some.url.2" );

	// 等待两个promise都被解析
	var r1 = yield p1;
	var r2 = yield p2;

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// 使用刚才定义的`run(..)`工具
run( foo );
```

为什么这与前一个代码段不同？看看`yield`在哪里和不在哪里。`p1`和`p2`是并发地（也就是“并行”）发起的Ajax请求promise。它们哪一个先完成都不要紧，因为promise会一直保持它们的解析状态。

然后我们使用两个连续的`yield`语句等待并从promise中取得解析值（分别取到`r1`和`r2`中）。如果`p1`首先解析，`yield p1`会首先继续执行然后等待`yield p2`继续执行。如果`p2`首先解析，它将会耐心地保持解析值知道被请求，但是`yield p1`将会首先停住，直到`p1`解析。

不管是哪一种情况，`p1`和`p2`都将并发地运行，并且在`r3 = yield request..`Ajax请求发起之前，都必须完成，无论以哪种顺序。

如果这种流程控制处理模型听起来很熟悉，那是因为它基本上和我们在第三章中介绍的，因`Promise.all([ .. ])`工具成为可能的“门”模式是相同的。所以，我们也可以像这样表达这种流程控制：

```js
function *foo() {
	// 使两个请求“并行”并等待两个promise都被解析
	var results = yield Promise.all( [
		request( "http://some.url.1" ),
		request( "http://some.url.2" )
	] );

	var r1 = results[0];
	var r2 = results[1];

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// 使用前面定义的`run(..)`工具
run( foo );
```

**注意：** 就像我们在第三章中讨论的，我们甚至可以用ES6解构赋值来把`var r1 = .. var r2 = ..`赋值简写为`var [r1,r2] = results`。

换句话说，在generator+Promise的方式中，Promise所有的并发能力都是可用的。所以在任何地方，如果你需要比“这个然后那个”要复杂的顺序异步流程步骤时，Promise都可能是最佳选择。

#### Promises，隐藏起来

作为代码风格的警告要说一句，要小心你在 **你的generator内部** 包含了多少Promise逻辑。以我们描述过的方式在异步性上使用generator的全部意义，是要创建简单，顺序，看似同步的代码，并尽可能多地将异步性细节隐藏在这些代码之外。

比如，这可能是一种更干净的方式：

```js
// 注意：这是一个普通函数，不是generator
function bar(url1,url2) {
	return Promise.all( [
		request( url1 ),
		request( url2 )
	] );
}

function *foo() {
	// 将基于Promise的并发细节隐藏在`bar(..)`内部
	var results = yield bar(
		"http://some.url.1",
		"http://some.url.2"
	);

	var r1 = results[0];
	var r2 = results[1];

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// 使用刚才定义的`run(..)`工具
run( foo );
```

在`*foo()`内部，它更干净更清晰地表达了我们要做的事情：我们要求`bar(..)`给我们一些`results`，而我们将用`yield`等待它的发生。我们不必关心在底层一个`Promise.all([ .. ])`的Promise组合将被用来完成任务。

**我们将异步性，特别是Promise，作为一种实现细节。**

如果你要做一种精巧的序列流控制，那么将你的Promise逻辑隐藏在一个仅仅从你的generator中调用的函数里特别有用。举个例子：

```js
function bar() {
	return Promise.all( [
				baz( .. )
				.then( .. ),
				Promise.race( [ .. ] )
			] )
			.then( .. )
}
```

有时候这种逻辑是必须的，而如果你直接把它扔在你的generator内部，你就违背了大多数你使用generator的初衷。我们 *应当* 有意地将这样的细节从generator代码中抽象出去，以使它们不会搞乱更高层的任务表达。

在创建功能强与性能好的代码之上，你还应当努力使代码尽可能地容易推理和维护。

**注意：** 对于编程来说，抽象不总是一种健康的东西——许多时候它可能在得到简洁的同时增加复杂性。但是在这种情况下，我相信你的generator+Promise异步代码要比其他的选择健康得多。虽然有所有这些建议，你仍然要注意你的特殊情况，并为你和你的团队做出合适的决策。

## Generator 委托

在上一节中，我们展示了从generator内部调用普通函数，和它如何作为一种有用的技术来将实现细节（比如异步Promise流程）抽象出去。但是为这样的任务使用普通函数的缺陷是，它必须按照普通函数的规则行动，也就是说它不能像generator那样用`yield`来暂停自己。

在你身上可能发生这样的事情：你可能会试着使用我们的`run(..)`帮助函数，从一个generator中调用另个一generator。比如：

```js
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );

	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );

	// 通过`run(..)`“委托”到`*foo()`
	var r3 = yield run( foo );

	console.log( r3 );
}

run( bar );
```

通过再一次使用我们的`run(..)`工具，我们在`*bar()`内部运行`*foo()`。我们利用了这样一个事实：我们早先定义的`run(..)`返回一个promise，这个promise在generator运行至完成时才解析（或发生错误），所以如果我们从一个`run(..)`调用中`yield`出一个promise给另一个`run(..)`，它就会自动暂停`*bar()`直到`*foo()`完成。

但这里有一个更好的办法将`*foo()`调用整合进`*bar()`，它称为`yield`委托。`yield`委托的特殊语法是：`yield * __`（注意额外的`*`）。让它在我们前面的例子中工作之前，让我们看一个更简单的场景：

```js
function *foo() {
	console.log( "`*foo()` starting" );
	yield 3;
	yield 4;
	console.log( "`*foo()` finished" );
}

function *bar() {
	yield 1;
	yield 2;
	yield *foo();	// `yield`-delegation!
	yield 5;
}

var it = bar();

it.next().value;	// 1
it.next().value;	// 2
it.next().value;	// `*foo()` starting
					// 3
it.next().value;	// 4
it.next().value;	// `*foo()` finished
					// 5
```

**注意：** 在本章早前的一个注意点中，我解释了为什么我偏好`function *foo() ..`而不是`function* foo() ..`，相似地，我也偏好——与关于这个话题的其他大多数文档不同——说`yield *foo()`而不是`yield* foo()`。`*`的摆放是纯粹的风格问题，而且要看你的最佳判断。但我发现保持统一风格很吸引人。

`yield *foo()`委托是如何工作的？

首先，正如我们看到过的那样，调用`foo()`创建了一个 *迭代器*。然后，`yield *`将（当前`*bar()`generator的） *迭代器* 的控制委托/传递给这另一个`*foo()`*迭代器*。

那么，前两个`it.next()`调用控制着`*bar()`，但当我们发起第三个`it.next()`调用时，`*foo()`就启动了，而且这时我们控制的是`*foo()`而非`*bar()`。这就是为什么它称为委托——`*bar()`将它的迭代控制委托给`*foo()`。

只要`it`*迭代器* 的控制耗尽了整个`*foo()`*迭代器*，它就会自动地将控制返回到`*bar()`。

那么现在回到前面的三个顺序Ajax请求的例子：

```js
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );

	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );

	// 通过`run(..)`“委托”到`*foo()`
	var r3 = yield *foo();

	console.log( r3 );
}

run( bar );
```

这个代码段和前面使用的版本的唯一区别是，使用了`yield *foo()`而不是前面的`yield run(foo)`。

**注意：** `yield *`让出了迭代控制，不是generator控制；当你调用`*foo()`generator时，你就`yield`委托给它的 *迭代器*。但你实际上可以`yield`委托给任何 *迭代器*；`yield *[1,2,3]`将会消费默认的`[1,2,3]`数组值 *迭代器*。

### 为什么委托？

`yield`委托的目的很大程度上是为了代码组织，而且这种方式是与普通函数调用对称的。

想象两个分别提供了`foo()`和`bar()`方法的模块，其中`bar()`调用`foo()`。它们俩分开的原因一般是由于为了程序将它们作为分离的程序来调用而进行的恰当组织。例如，可能会有一些情况`foo()`需要被独立调用，而其他地方`bar()`来调用`foo()`。

由于这些完全相同的原因，将generator分开可以增强程序的可读性，可维护性，与可调试性。从这个角度讲，`yield *`是一种快捷的语法，用来在`*bar()`内部手动地迭代`*foo()`的步骤。

如果`*foo()`中的步骤是异步的，这样的手动方式可能会特别复杂，这就是为什么你可能会需要那个`run(..)`工具来做它。正如我们已经展示的，`yield *foo()`消灭了使用`run(..)`工具的子实例（比如`run(foo)`）的需要。

### 委托消息

你可能想知道，这种`yield`委托在除了与 *迭代器* 控制一起工作以外，是如何与双向消息传递一起工作的。仔细查看下面这些通过`yield`委托进进出出的消息流：

```js
function *foo() {
	console.log( "inside `*foo()`:", yield "B" );

	console.log( "inside `*foo()`:", yield "C" );

	return "D";
}

function *bar() {
	console.log( "inside `*bar()`:", yield "A" );

	// `yield`-委托！
	console.log( "inside `*bar()`:", yield *foo() );

	console.log( "inside `*bar()`:", yield "E" );

	return "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// inside `*bar()`: 1
// outside: B

console.log( "outside:", it.next( 2 ).value );
// inside `*foo()`: 2
// outside: C

console.log( "outside:", it.next( 3 ).value );
// inside `*foo()`: 3
// inside `*bar()`: D
// outside: E

console.log( "outside:", it.next( 4 ).value );
// inside `*bar()`: 4
// outside: F
```

特别注意一下`it.next(3)`调用之后的处理步骤：

1. 值`3`被传入（通过`*bar`里的`yield`委托）在`*foo()`内部等待中的`yield "C"`表达式。
2. 然后`*foo()`调用`return "D"`，但是这个值不会一路返回到外面的`it.next(3)`调用。
3. 相反地，值`"D"`作为结果被发送到在`*bar()`内部等待中的`yield *foo()`表示式——这个`yield`委托表达式实质上在`*foo()`被耗尽之前一直被暂停着。所以`"D"`被送到`*bar()`内部来让它打印。
4. `yield "E"`在`*bar()`内部被调用，而且值`"E"`被让出到外部作为`it.next(3)`调用的结果。

从外部 *迭代器*（`it`）的角度来看，在初始的generator和被委托的generator之间的控制没有任何区别。

事实上，`yield`委托甚至不必指向另一个generator；它可以仅被指向一个非generator的，一般的 *iterable*。比如：

```js
function *bar() {
	console.log( "inside `*bar()`:", yield "A" );

	// `yield`-委托至一个非generator
	console.log( "inside `*bar()`:", yield *[ "B", "C", "D" ] );

	console.log( "inside `*bar()`:", yield "E" );

	return "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// inside `*bar()`: 1
// outside: B

console.log( "outside:", it.next( 2 ).value );
// outside: C

console.log( "outside:", it.next( 3 ).value );
// outside: D

console.log( "outside:", it.next( 4 ).value );
// inside `*bar()`: undefined
// outside: E

console.log( "outside:", it.next( 5 ).value );
// inside `*bar()`: 5
// outside: F
```

注意这个例子与前一个之间，被接收/报告的消息的不同之处。

最惊人的是，默认的`array`*迭代器* 不关心任何通过`next(..)`调用被发送的消息，所以值`2`，`3`，与`4`实质上被忽略了。另外，因为这个 *迭代器* 没有明确的`return`值（不像前面使用的`*foo()`），所以`yield *`表达式在它完成时得到一个`undefined`。

#### 异常也委托！

与`yield`委托在两个方向上透明地传递消息的方式相同，错误/异常也在双向传递：

```js
function *foo() {
	try {
		yield "B";
	}
	catch (err) {
		console.log( "error caught inside `*foo()`:", err );
	}

	yield "C";

	throw "D";
}

function *bar() {
	yield "A";

	try {
		yield *foo();
	}
	catch (err) {
		console.log( "error caught inside `*bar()`:", err );
	}

	yield "E";

	yield *baz();

	// note: can't get here!
	yield "G";
}

function *baz() {
	throw "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// outside: B

console.log( "outside:", it.throw( 2 ).value );
// error caught inside `*foo()`: 2
// outside: C

console.log( "outside:", it.next( 3 ).value );
// error caught inside `*bar()`: D
// outside: E

try {
	console.log( "outside:", it.next( 4 ).value );
}
catch (err) {
	console.log( "error caught outside:", err );
}
// error caught outside: F
```

在这段代码中有一些事情要注意：

1. 但我们调用`it.throw(2)`时，它发送一个错误消息`2`到`*bar()`，而`*bar()`将它委托至`*foo()`，然后`*foo()`来`catch`它并平静地处理。之后，`yield "C"`把`"C"`作为返回的`value`发送回`it.throw(2)`调用。
2. 接下来值`"D"`被从`*foo()`内部`throw`出来并传播到`*bar()`，`*bar()`会`catch`它并平静地处理。然后`yield "E"`把`"E"`作为返回的`value`发送回`it.next(3)`调用。
3. 接下来，一个异常从`*baz()`中`throw`出来，而没有被`*bar()`捕获——我们没在外面`catch`它——所以`*baz()`和`*bar()`都被设置为完成状态。这段代码结束后，即便有后续的`next(..)`调用，你也不会得到值`"G"`——它们的`value`将返回`undefined`。

### 异步委托

最后让我们回到早先的多个顺序Ajax请求的例子，使用`yield`委托：

```js
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );

	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );

	var r3 = yield *foo();

	console.log( r3 );
}

run( bar );
```

在`*bar()`内部，与调用`yield run(foo)`不同的是，我们调用`yield *foo()`就可以了。

在前一个版本的这个例子中，Promise机制（通过`run(..)`控制的）被用于将值从`*foo()`中的`return r3`传送到`*bar()`内部的本地变量`r3`。现在，这个值通过`yield *`机制直接返回。

除此以外，它们的行为是一样的。

### “递归”委托

当然，`yield`委托可以一直持续委托下去，你想连接多少步骤就连接多少。你甚至可以在具有异步能力的generator上“递归”使用`yield`委托——一个`yield`委托至自己的generator：

```js
function *foo(val) {
	if (val > 1) {
		// 递归委托
		val = yield *foo( val - 1 );
	}

	return yield request( "http://some.url/?v=" + val );
}

function *bar() {
	var r1 = yield *foo( 3 );
	console.log( r1 );
}

run( bar );
```

**注意：** 我们的`run(..)`工具本可以用`run( foo, 3 )`来调用，因为它支持用额外传递的参数来进行generator的初始化。然而，为了在这里高调展示`yield *`的灵活性，我们使用了无参数的`*bar()`。

这段代码之后的处理步骤是什么？坚持住，它的细节要描述起来可是十分错综复杂：

1. `run(bar)`启动了`*bar()`generator。
2. `foo(3)`为`*foo(..)`创建了 *迭代器* 并传递`3`作为它的`val`参数。
3. 因为`3 > 1`，`foo(2)`创建了另一个 *迭代器* 并传递`2`作为它的`val`参数。
4. 因为`2 > 1`，`foo(1)`又创建了另一个 *迭代器* 并传递`1`作为它的`val`参数。
5. `1 > 1`是`false`，所以我们接下来用值`1`调用`request(..)`，并得到一个代表第一个Ajax调用的promise。
6. 这个promise被`yield`出来，回到`*foo(2)`generator实例。
7. `yield *`将这个promise传出并回到`*foo(3)`生成generator。另一个`yield *`把这个promise传出到`*bar()`generator实例。而又有另一个`yield *`把这个promise传出到`run(..)`工具，而它将会等待这个promise（第一个Ajax请求）再处理。
8. 当这个promise解析时，它的完成消息会被发送以继续`*bar()`，`*bar()`通过`yield *`把消息传递进`*foo(3)`实例，`*foo(3)`实例通过`yield *`把消息传递进`*foo(2)`generator实例，`*foo(2)`实例通过`yield *`把消息传给那个在`*foo(3)`generator实例中等待的一般的`yield`。
9. 这第一个Ajax调用的应答现在立即从`*foo(3)`generator实例中被`return`，作为`*foo(2)`实例中`yield *`表达式的结果发送回来，并赋值给本地`val`变量。
10. `*foo(2)`内部，第二个Ajax请求用`request(..)`发起，它的promise被`yield`回到`*foo(1)`实例，然后一路`yield *`传播到`run(..)`（回到第7步）。当promise解析时，第二个Ajax应答一路传播回到`*foo(2)`generator实例，并赋值到他本地的`val`变量。
11. 最终，第三个Ajax请求用`request(..)`发起，它的promise走出到`run(..)`，然后它的解析值一路返回，最后被`return`到在`*bar()`中等待的`yield *`表达式。

天！许多疯狂的头脑杂技，对吧？你可能想要把它通读几遍，然后抓点儿零食放松一下大脑！

## Generator并发

正如我们在第一章和本章早先讨论过的，另个同时运行的“进程”可以协作地穿插它们的操作，而且许多时候这可以产生非常强大的异步表达式。

坦白地说，我们前面关于多个generator并发穿插的例子，展示了这真的容易让人糊涂。但我们也受到了启发，有些地方这种能力十分有用。

回想我们在第一章中看过的场景，两个不同但同时的Ajax应答处理需要互相协调，来确保数据通信不是竟合状态。我们这样把应答分别放在`res`数组的不同位置中：

```js
function response(data) {
	if (data.url == "http://some.url.1") {
		res[0] = data;
	}
	else if (data.url == "http://some.url.2") {
		res[1] = data;
	}
}
```

但是我们如何在这种场景下使用多generator呢？

```js
// `request(..)` 是一个基于Promise的Ajax工具

var res = [];

function *reqData(url) {
	res.push(
		yield request( url )
	);
}
```

**注意：** 我们将在这里使用两个`*reqData(..)`generator的实例，但是这和分别使用两个不同generator的一个实例没有区别；这两种方式在道理上完全一样的。我们过一会儿就会看到两个generator的协调操作。

与不得不将`res[0]`和`res[1]`赋值手动排序不同，我们将使用协调过的顺序，让`res.push(..)`以可预见的顺序恰当地将值放在预期的位置。如此被表达的逻辑会让人感觉更干净。

但是我们将如何实际安排这种互动呢？首先，让我们手动实现它：

```js
var it1 = reqData( "http://some.url.1" );
var it2 = reqData( "http://some.url.2" );

var p1 = it1.next().value;
var p2 = it2.next().value;

p1
.then( function(data){
	it1.next( data );
	return p2;
} )
.then( function(data){
	it2.next( data );
} );
```

`*reqData(..)`的两个实例都开始发起它们的Ajax请求，然后用`yield`暂停。之后我们再`p1`解析时继续运行第一个实例，而后来的`p2`的解析将会重启第二个实例。以这种方式，我们使用Promise的安排来确保`res[0]`将持有第一个应答，而`res[1]`持有第二个应答。

但坦白地说，这是可怕的手动，而且它没有真正让generator组织它们自己，而那才是真正的力量。让我们用不同的方法试一下：

```js
// `request(..)` 是一个基于Promise的Ajax工具

var res = [];

function *reqData(url) {
	var data = yield request( url );

	// 传递控制权
	yield;

	res.push( data );
}

var it1 = reqData( "http://some.url.1" );
var it2 = reqData( "http://some.url.2" );

var p1 = it1.next().value;
var p2 = it2.next().value;

p1.then( function(data){
	it1.next( data );
} );

p2.then( function(data){
	it2.next( data );
} );

Promise.all( [p1,p2] )
.then( function(){
	it1.next();
	it2.next();
} );
```

好的，这看起来好些了（虽然仍然是手动），因为现在两个`*reqData(..)`的实例真正地并发运行了，而且（至少是在第一部分）是独立的。

在前一个代码段中，第二个实例在第一个实例完全完成之前没有给出它的数据。但是这里，只要它们的应答一返回这两个实例就立即分别收到他们的数据，然后每个实例调用另一个`yield`来传送控制。最后我们在`Promise.all([ .. ])`的处理器中选择用什么样的顺序继续它们。

可能不太明显的是，这种方式因其对称性启发了一种可复用工具的简单形式。让我们想象使用一个称为`runAll(..)`的工具：

```js
// `request(..)` 是一个基于Promise的Ajax工具

var res = [];

runAll(
	function*(){
		var p1 = request( "http://some.url.1" );

		// 传递控制权
		yield;

		res.push( yield p1 );
	},
	function*(){
		var p2 = request( "http://some.url.2" );

		// 传递控制权
		yield;

		res.push( yield p2 );
	}
);
```

**注意：** 我们没有包含`runAll(..)`的实现代码，不仅因为它长得无法行文，也因为它是一个我们已经在先前的 `run(..)`中实现的逻辑的扩展。所以，作为留给读者的一个很好的补充性练习，请你自己动手改进`run(..)`的代码，来使它像想象中的`runAll(..)`那样工作。另外，我的 *asynquence* 库提供了一个前面提到过的`runner(..)`工具，它内建了这种能力，我们将在本书的附录A中讨论它。

这是`runAll(..)`内部的处理将如何操作：

1. 第一个generator得到一个代表从`"http://some.url.1"`来的Ajax应答，然后将控制权`yield`回到`runAll(..)`工具。
2. 第二个generator运行，并对`"http://some.url.2"`做相同的事，将控制权`yield`回到`runAll(..)`工具。
3. 第一个generator继续，然后`yield`出他的promise`p1`。在这种情况下`runAll(..)`工具和我们前面的`run(..)`做同样的事，它等待promise解析，然后继续这同一个generator（没有控制传递！）。当`p1`解析时，`runAll(..)`使用解析值再一次继续第一个generator，而后`res[0]`得到它的值。在第一个generator完成之后，有一个隐式的控制权传递。
4. 第二个generator继续，`yield`出它的promise`p2`，并等待它的解析。一旦`p2`解析，`runAll(..)`使用这个解析值继续第二个generator，于是`res[1]`被设置。

在这个例子中，我们使用了一个称为`res`的外部变量来保存两个不同的Ajax应答的结果——这是我们的并发协调。

但是这样做可能十分有帮助：进一步扩展`runAll(..)`使它为多个generator实例提供 *分享的* 内部的变量作用域，比如一个我们将在下面称为`data`的空对象。另外，它可以接收被`yield`的非Promise值，并把它们交给下一个generator。

考虑这段代码：

```js
// `request(..)` 是一个基于Promise的Ajax工具

runAll(
	function*(data){
		data.res = [];

		// 传递控制权（并传递消息）
		var url1 = yield "http://some.url.2";

		var p1 = request( url1 ); // "http://some.url.1"

		// 传递控制权
		yield;

		data.res.push( yield p1 );
	},
	function*(data){
		// 传递控制权（并传递消息）
		var url2 = yield "http://some.url.1";

		var p2 = request( url2 ); // "http://some.url.2"

		// 传递控制权
		yield;

		data.res.push( yield p2 );
	}
);
```

在这个公式中，两个generator不仅协调控制传递，实际上还互相通信：通过`data.res`，和交换`url1`与`url2`的值的`yield`消息。这强大到不可思议！

这样的认识也是一种更为精巧的称为CSP（Communicating Sequential Processes——通信顺序处理）的异步技术的概念基础，我们将在本书的附录B中讨论它。

## Thunks

至此，我们都假定从一个generator中`yield`一个Promise——让这个Promise使用像`run(..)`这样的帮助工具来推进generator——是管理使用generator的异步处理的最佳方法。明白地说，它是的。

但是我们跳过了一个被轻度广泛使用的模式，为了完整性我们将简单地看一看它。

在一般的计算机科学中，有一种老旧的前JS时代的概念，称为“thunk”。我们不在这里赘述它的历史，一个狭隘的表达是，thunk是一个JS函数——没有任何参数——它连接并调用另一个函数。

换句话讲，你用一个函数定义包装函数调用——带着它需要的所有参数——来 *推迟* 这个调用的执行，而这个包装用的函数就是thunk。当你稍后执行thunk时，你最终会调用那个原始的函数。

举个例子：

```js
function foo(x,y) {
	return x + y;
}

function fooThunk() {
	return foo( 3, 4 );
}

// 稍后

console.log( fooThunk() );	// 7
```

所以，一个同步的thunk是十分直白的。但是一个异步的thunk呢？我们实质上可以扩展这个狭隘的thunk定义，让它接收一个回调。

考虑这段代码：

```js
function foo(x,y,cb) {
	setTimeout( function(){
		cb( x + y );
	}, 1000 );
}

function fooThunk(cb) {
	foo( 3, 4, cb );
}

// 稍后

fooThunk( function(sum){
	console.log( sum );		// 7
} );
```

如你所见，`fooThunk(..)`仅需要一个`cb(..)`参数，因为它已经预先制定了值`3`和`4`（分别为`x`和`y`）并准备传递给`foo(..)`。一个thunk只是在外面耐心地等待着它开始工作所需的最后一部分信息：回调。

但是你不会想要手动制造thunk。那么，让我们发明一个工具来为我们进行这种包装。

考虑这段代码：

```js
function thunkify(fn) {
	var args = [].slice.call( arguments, 1 );
	return function(cb) {
		args.push( cb );
		return fn.apply( null, args );
	};
}

var fooThunk = thunkify( foo, 3, 4 );

// 稍后

fooThunk( function(sum) {
	console.log( sum );		// 7
} );
```

**提示：** 这里我们假定原始的（`foo(..)`）函数签名希望它的回调的位置在最后，而其它的参数在这之前。这是一个异步JS函数的相当普遍的“标准”。你可以称它为“回调后置风格”。如果因为某些原因你需要处理“回调优先风格”的签名，你只需要制造一个使用`args.unshift(..)`而非`args.push(..)`的工具。

前面的`thunkify(..)`公式接收`foo(..)`函数的引用，和任何它所需的参数，并返回thunk本身（`fooThunk(..)`）。然而，这并不是你将在JS中发现的thunk的典型表达方式。

与`thunkify(..)`制造thunk本身相反，典型的——可能有点儿让人困惑的——`thunkify(..)`工具将产生一个制造thunk的函数。

额...是的。

考虑这段代码：

```js
function thunkify(fn) {
	return function() {
		var args = [].slice.call( arguments );
		return function(cb) {
			args.push( cb );
			return fn.apply( null, args );
		};
	};
}
```

这里主要的不同之处是有一个额外的`return function() { .. }`。这是它在用法上的不同：

```js
var whatIsThis = thunkify( foo );

var fooThunk = whatIsThis( 3, 4 );

// 稍后

fooThunk( function(sum) {
	console.log( sum );		// 7
} );
```

明显地，这段代码隐含的最大的问题是，`whatIsThis`叫什么合适？它不是thunk，它是一个从`foo(..)`调用生产thunk的东西。它是一种“thunk”的“工厂”。而且看起来没有任何标准的意见来命名这种东西。

所以，我的提议是“thunkory”（"thunk" + "factory"）。于是，`thunkify(..)`制造了一个thunkory，而一个thunkory制造thunks。这个道理与第三章中我的“promisory”提议是对称的：

```js
var fooThunkory = thunkify( foo );

var fooThunk1 = fooThunkory( 3, 4 );
var fooThunk2 = fooThunkory( 5, 6 );

// 稍后

fooThunk1( function(sum) {
	console.log( sum );		// 7
} );

fooThunk2( function(sum) {
	console.log( sum );		// 11
} );
```

**注意：** 这个例子中的`foo(..)`期望的回调不是“错误优先风格”。当然，“错误优先风格”更常见。如果`foo(..)`有某种合理的错误发生机制，我们可以改变而使它期望并使用一个错误优先的回调。后续的`thunkify(..)`不会关心回调被预想成什么样。用法的唯一区别是`fooThunk1(function(err,sum){..`。

暴露出thunkory方法——而不是像早先的`thunkify(..)`那样将中间步骤隐藏起来——可能看起来像是没必要的混乱。但是一般来讲，在你的程序一开始就制造一些thunkory来包装既存API的方法是十分有用的，然后你就可以在你需要thunk的时候传递并调用这些thunkory。这两个区别开的步骤保证了功能上更干净的分离。

来展示一下的话：

```js
// 更干净：
var fooThunkory = thunkify( foo );

var fooThunk1 = fooThunkory( 3, 4 );
var fooThunk2 = fooThunkory( 5, 6 );

// 而这个不干净：
var fooThunk1 = thunkify( foo, 3, 4 );
var fooThunk2 = thunkify( foo, 5, 6 );
```

不管你是否愿意明确对付thunkory，thunk（`fooThunk1(..)`和`fooThunk2(..)`）的用法还是一样的。

### s/promise/thunk/

那么所有这些thunk的东西与generator有什么关系？

一般性地比较一下thunk和promise：它们是不能直接互换的，因为它们在行为上不是等价的。比起单纯的thunk，Promise可用性更广泛，而且更可靠。

但从另一种意义上讲，它们都可以被看作是对一个值的请求，这个请求可能被异步地应答。

回忆第三章，我们定义了一个工具来promise化一个函数，我们称之为`Promise.wrap(..)`——我们本来也可以叫它`promisify(..)`的！这个Promise化包装工具不会生产Promise；它生产那些继而生产Promise的promisories。这和我们当前讨论的thunkory和thunk是完全对称的。

为了描绘这种对称性，让我们首先将`foo(..)`的例子改为假定一个“错误优先风格”回调的形式：

```js
function foo(x,y,cb) {
	setTimeout( function(){
		// 假定 `cb(..)` 是“错误优先风格”
		cb( null, x + y );
	}, 1000 );
}
```

现在，我们将比较`thunkify(..)`和`promisify(..)`（也就是第三章的`Promise.wrap(..)`）：

```js
// 对称的：构建问题的回答者
var fooThunkory = thunkify( foo );
var fooPromisory = promisify( foo );

// 对称的：提出问题
var fooThunk = fooThunkory( 3, 4 );
var fooPromise = fooPromisory( 3, 4 );

// 取得 thunk 的回答
fooThunk( function(err,sum){
	if (err) {
		console.error( err );
	}
	else {
		console.log( sum );		// 7
	}
} );

// 取得 promise 的回答
fooPromise
.then(
	function(sum){
		console.log( sum );		// 7
	},
	function(err){
		console.error( err );
	}
);
```

thunkory和promisory实质上都是在问一个问题（一个值），thunk的`fooThunk`和promise的`fooPromise`分别代表这个问题的未来的答案。这样看来，对称性就清楚了。

带着这个视角，我们可以看到为了异步而`yield`Promise的generator，也可以为异步而`yield`thunk。我们需要的只是一个更聪明的`run(..)`工具（就像以前一样），它不仅可以寻找并连接一个被`yield`的Promise，而且可以给一个被`yield`的thunk提供回调。

考虑这段代码：

```js
function *foo() {
	var val = yield request( "http://some.url.1" );
	console.log( val );
}

run( foo );
```

在这个例子中，`request(..)`既可以是一个返回一个promise的promisory，也可以是一个返回一个thunk的thunkory。从generator的内部代码逻辑的角度看，我们不关心这个实现细节，这就它强大的地方！

所以，`request(..)`可以使以下任何一种形式：

```js
// promisory `request(..)` （见第三章）
var request = Promise.wrap( ajax );

// vs.

// thunkory `request(..)`
var request = thunkify( ajax );
```

最后，作为一个让我们早先的`run(..)`工具支持thunk的补丁，我们可能会需要这样的逻辑：

```js
// ..
// 我们收到了一个回调吗？
else if (typeof next.value == "function") {
	return new Promise( function(resolve,reject){
		// 使用一个错误优先回调调用thunk
		next.value( function(err,msg) {
			if (err) {
				reject( err );
			}
			else {
				resolve( msg );
			}
		} );
	} )
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
```

现在，我们generator既可以调用promisory来`yield`Promise，也可以调用thunkory来`yield`thunk，而不论那种情况，`run(..)`都将处理这个值并等待它的完成，以继续generator。

在对称性上，这两个方式是看起来相同的。然而，我们应当指出这仅仅从Promise或thunk表示延续generator的未来值的角度讲是成立的。

从更高的角度讲，与Promise被设计成的那样不同，thunk没有提供，它们本身也几乎没有任何可靠性和可组合性的保证。在这种特定的generator异步模式下使用一个thunk作为Promise的替代品是可以工作的，但与Promise提供的所有好处相比，这应当被看做是一种次理想的方法。

如果你有选择，那就偏向`yield pr`而非`yield th`。但是使`run(..)`工具可以处理两种类型的值本身没有什么问题。

**注意：** 在我们将要在附录A中讨论的，我的 *asynquence* 库中的`runner(..)`工具，可以处理`yield`的Promise，thunk和 *asynquence* 序列。

## 前ES6时代的Generator

我希望你已经被说服了，generator是一个异步编程工具箱里的非常重要的增强工具。但它是ES6中的新语法，这意味着你不能像填补Promise（它只是新的API）那样填补generator。那么如果我们不能奢望忽略前ES6时代的浏览器，我们该如何将generator带到浏览器中呢？

对所有ES6中的新语法的扩展，有一些工具——称呼他们最常见的名词是转译器（transpilers），也就是转换编译器（trans-compilers）——它们会拿起你的ES6语法，并转换为前ES6时代的等价代码（但是明显地变难看了！）。所以，generator可以被转译为具有相同行为但可以在ES5或以下版本进行工作的代码。

但是怎么做到的？`yield`的“魔法”听起来不像是那么容易转译的。在我们早先的基于闭包的 *迭代器* 例子中，实际上提示了一种解决方法。

### 手动变形

在我们讨论转译器之前，让我们延伸一下，在generator的情况下如何手动转译。这不仅是一个学院派的练习，因为这样做实际上可以帮助我们进一步理解它们如何工作。

考虑这段代码：

```js
// `request(..)` 是一个支持Promise的Ajax工具

function *foo(url) {
	try {
		console.log( "requesting:", url );
		var val = yield request( url );
		console.log( val );
	}
	catch (err) {
		console.log( "Oops:", err );
		return false;
	}
}

var it = foo( "http://some.url.1" );
```

第一个要注意的事情是，我们仍然需要一个可以被调用的普通的`foo()`函数，而且它仍然需要返回一个 *迭代器*。那么让我们来画出非generator的变形草图：

```js
function foo(url) {

	// ..

	// 制造并返回 iterator
	return {
		next: function(v) {
			// ..
		},
		throw: function(e) {
			// ..
		}
	};
}

var it = foo( "http://some.url.1" );
```

下一个需要注意的地方是，generator通过挂起它的作用域/状态来施展它的“魔法”，但我们可以用函数闭包来模拟。为了理解如何写出这样的代码，我们将先用状态值注释generator不同的部分：

```js
// `request(..)` 是一个支持Promise的Ajax工具

function *foo(url) {
	// 状态 *1*

	try {
		console.log( "requesting:", url );
		var TMP1 = request( url );

		// 状态 *2*
		var val = yield TMP1;
		console.log( val );
	}
	catch (err) {
		// 状态 *3*
		console.log( "Oops:", err );
		return false;
	}
}
```

**注意：** 为了更准去地讲解，我们使用`TMP1`变量将`val = yield request..`语句分割为两部分。`request(..)`发生在状态`*1*`，而将完成值赋给`val`发生在状态`*2*`。在我们将代码转换为非generator的等价物后，我们就可以摆脱中间的`TMP1`。

换句话所，`*1*`是初始状态，`*2*`是`request(..)`成功的状态，`*3*`是`request(..)`失败的状态。你可能会想象额外的`yield`步骤将如何编码为额外的状态。

回到我们被转译的generator，让我们在这个闭包中定义一个变量`state`，用它来追踪状态：

```js
function foo(url) {
	// 管理 generator 状态
	var state;

	// ..
}
```

现在，让我们在闭包内部定义一个称为`process(..)`的内部函数，它用`switch`语句来处理各种状态。

```js
// `request(..)` 是一个支持Promise的Ajax工具

function foo(url) {
	// 管理 generator 状态
	var state;

	// generator-范围的变量声明
	var val;

	function process(v) {
		switch (state) {
			case 1:
				console.log( "requesting:", url );
				return request( url );
			case 2:
				val = v;
				console.log( val );
				return;
			case 3:
				var err = v;
				console.log( "Oops:", err );
				return false;
		}
	}

	// ..
}
```

在我们的generator中每种状态都在`switch`语句中有它自己的`case`。每当我们需要处理一个新状态时，`process(..)`就会被调用。我们一会就回来讨论它如何工作。

对任何generator范围的变量声明（`val`），我们将它们移动到`process(..)`外面的`var`声明中，这样它们就可以在`process(..)`的多次调用中存活下来。但是“块儿作用域”的`err`变量仅在`*3*`状态下需要，所以我们将它留在原处。

在状态`*1*`，与`yield request(..)`相反，我们`return request(..)`。在终结状态`*2*`，没有明确的`return`，所以我们仅仅`return;`也就是`return undefined`。在终结状态`*3*`，有一个`return false`，我们保留它。

现在我们需要定义 *迭代器* 函数的代码，以便人们恰当地调用`process(..)`：

```js
function foo(url) {
	// 管理 generator 状态
	var state;

	// generator-范围的变量声明
	var val;

	function process(v) {
		switch (state) {
			case 1:
				console.log( "requesting:", url );
				return request( url );
			case 2:
				val = v;
				console.log( val );
				return;
			case 3:
				var err = v;
				console.log( "Oops:", err );
				return false;
		}
	}

	// 制造并返回 iterator
	return {
		next: function(v) {
			// 初始状态
			if (!state) {
				state = 1;
				return {
					done: false,
					value: process()
				};
			}
			// 成功地让出继续值
			else if (state == 1) {
				state = 2;
				return {
					done: true,
					value: process( v )
				};
			}
			// generator 已经完成了
			else {
				return {
					done: true,
					value: undefined
				};
			}
		},
		"throw": function(e) {
			// 在状态 *1* 中，有唯一明确的错误处理
			if (state == 1) {
				state = 3;
				return {
					done: true,
					value: process( e )
				};
			}
			// 否则，是一个不会被处理的错误，所以我们仅仅把它扔回去
			else {
				throw e;
			}
		}
	};
}
```

这段代码如何工作？

1. 第一个对 *迭代器* 的`next()`调用将把gtenerator从未初始化的状态移动到状态`1`，然后调用`process()`来处理这个状态。`request(..)`的返回值是一个代表Ajax应答的promise，它作为`value`属性从`next()`调用被返回。
2. 如果Ajax请求成功，第二个`next(..)`调用应当送进Ajax的应答值，它将我们的状态移动到`2`。`process(..)`再次被调用（这次它被传入Ajax应答的值），而从`next(..)`返回的`value`属性将是`undefined`。
3. 然而，如果Ajax请求失败，应当用错误调用`throw(..)`，它将状态从`1`移动到`3`（而不是`2`）。`process(..)`再一次被调用，这词被传入了错误的值。这个`case`返回`false`，所以`false`作为`throw(..)`调用返回的`value`属性。

从外面看——也就是仅仅与 *迭代器* 互动——这个普通的`foo(..)`函数与`*foo(..)`generator的工作方式是一样的。所以我们有效地将ES6 generator“转译”为前ES6可兼容的！

然后我们就可以手动初始化我们的generator并控制它的迭代器——调用`var it = foo("..")`和`it.next(..)`等等——或更好地，我们可以将它传递给我们先前定义的`run(..)`工具，比如`run(foo,"..")`。

### 自动转译

前面的练习——手动编写从ES6 generator到前ES6的等价物的变形过程——教会了我们generator在概念上是如何工作的。但是这种变形真的是错综复杂，而且不能很好地移植到我们代码中的其他generator上。手动做这些工作是不切实际的，而且将会把generator的好处完全抵消掉。

但走运的是，已经存在几种工具可以自动地将ES6 generator转换为我们在前一节延伸出的东西。它们不仅帮我们做力气活儿，还可以处理几种我们敷衍而过的情况。

一个这样的工具是regenerator（https://facebook.github.io/regenerator/），由Facebook的聪明伙计们开发的。

如果我们用regenerator来转译我们前面的generator，这就是产生的代码（在编写本文时）：

```js
// `request(..)` 是一个支持Promise的Ajax工具

var foo = regeneratorRuntime.mark(function foo(url) {
    var val;

    return regeneratorRuntime.wrap(function foo$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
            context$1$0.prev = 0;
            console.log( "requesting:", url );
            context$1$0.next = 4;
            return request( url );
        case 4:
            val = context$1$0.sent;
            console.log( val );
            context$1$0.next = 12;
            break;
        case 8:
            context$1$0.prev = 8;
            context$1$0.t0 = context$1$0.catch(0);
            console.log("Oops:", context$1$0.t0);
            return context$1$0.abrupt("return", false);
        case 12:
        case "end":
            return context$1$0.stop();
        }
    }, foo, this, [[0, 8]]);
});
```

这和我们的手动推导有明显的相似性，比如`switch`/`case`语句，而且我们甚至可以看到，`val`被拉到了闭包外面，正如我们做的那样。

当然，一个代价是这个generator的转译需要一个帮助工具库`regeneratorRuntime`，它持有全部管理一个普通generator/*迭代器* 所需的可复用逻辑。它的许多模板代码看起来和我们的版本不同，但即便如此，概念还是可以看到的，比如使用`context$1$0.next = 4`追踪generator的下一个状态。

主要的结论是，generator不仅限于ES6+的环境中才有用。一旦你理解了它的概念，你可以在你的所有代码中利用他们，并使用工具将代码变形为旧环境兼容的。

这比使用`Promise`API的填补来实现前ES6的Promise要做更多的工作，但是努力完全是值得的，因为对于以一种可推理的，合理的，看似同步的顺序风格来表达异步流程控制来说，generator实在是好太多了。

一旦你适应了generator，你将永远不会回到面条般的回调地狱了！

## 复习

generator是一种ES6的新函数类型，它不像普通函数那样运行至完成。相反，generator可以暂停在一种中间完成状态（完整地保留它的状态），而且它可以从暂停的地方重新开始。

这种暂停/继续的互换是一种协作而非抢占，这意味着generator拥有的唯一能力是使用`yield`关键字暂停它自己，而且控制这个generator的 *迭代器* 拥有的唯一能力是继续这个generator（通过`next(..)`）。

`yield`/`next(..)`的对偶不仅是一种控制机制，它实际上是一种双向消息传递机制。一个`yield ..`表达式实质上为了等待一个值而暂停，而下一个`next(..)`调用将把值（或隐含的`undefined`）传递回这个暂停的`yield`表达式。

与异步流程控制关联的generator的主要好处是，在一个generator内部的代码以一种自然的同步/顺序风格表达一个任务的各个步骤的序列。这其中的技巧是我们实质上将潜在的异步处理隐藏在`yield`关键字的后面——将异步处理移动到控制generator的 *迭代器* 代码中。

换句话说，generator为异步代码保留了顺序的，同步的，阻塞的代码模式，这允许我们的大脑更自然地推理代码，解决了基于回调的异步产生的两个关键问题中的一个。
