# You Don't Know JS: Types & Grammar
# Chapter 5: Grammar

我们想要解决的最后一个主要话题是JavaScript的语法如何工作（也称为它的文法）。你可能认为你懂得如何编写JS，但是语言文法的各个部分中有太多微妙的地方导致了困惑和误解，所以我们想要深入这些部分并搞清楚一些事情。

**注意：** 对于读者们来说，“文法（grammar）”一词不像“语法（syntax）”一词那么为人熟知。在许多意义上，它们是相似的词，描述语言如何工作的 *规则*。它们有一些微妙的不同，但是这对于我们在这里的讨论无关紧要。JavaScript的文法是一种结构化的方式，来描述语法（操作符，关键字，等等）如何组合在一起形成结构良好，合法的程序。换句话说，抛开文法来讨论语法将会忽略许多重要的细节。所以我们在本章中注目的内容的最准确的描述是 *文法*，尽管语言中的纯语法才是开发者们直接交互的。

## Statements & Expressions

一个很常见的现象是，开发者们假定“语句（statement）”和“表达式（expression）”是大致等价的。但是这里我们需要区分它们俩，因为在我们的JS程序中有一些非常重要的区别。

为了描述这种区别，让我们借用一下你可能更熟悉的术语：英语。

一个“句子（sentence）”是一个表达想法的词汇的完整构造。它由一个或多个“短语（phrase）”组成，它们每一个都可以用标点符号或连词（“和”，“或”等等）连接。一个短语本身可以由更小的短语组成。一些短语是不完整的，而且本身没有太多含义，而另一些短语可以自成一句。这些规则总体地称为英语的 *文法*。

JavaScript文法也类似。语句就是句子，表达式就是短语，而操作符就是连词/标点。

JS中的每一个表达式都可以被求值而成为一个单独的，具体的结果值。举例来说：

```js
var a = 3 * 6;
var b = a;
b;
```

在这个代码段中，`3 * 6`是一个表达式（求值得值`18`）。而第二行的`a`也是一个表达式，第三行的`b`也一样。对表达式`a`和`b`求值都会得到在那一时刻存储在这些变量中的值，也就偶然是`18`。

另外，这三行的每一行都是一个包含表达式的语句。`var a = 3 * 6`和`var b = a`称为“声明语句（declaration statments）”因为它们每一个都声明了一个变量（并选择性地给它赋值）。赋值`a = 3 * 6`和`b = a`（除去`var`）被称为赋值表达式（assignment expressions）。

第三行仅仅含有一个表达式`b`，但是它本身也是一个表达式。这一般称为一个“表达式语句（expression statement）”。

### Statement Completion Values

一个鲜为人知的事实是，所有语句都有完成值（即使这个值只是`undefined`）。

你要如何做才能看到一个语句的完成值呢？

最明显的答案是把语句敲进你的浏览器开发者控制台，因为当你运行它时，默认地控制台会报告最近一次执行的语句的完成值。

让我们考虑一下`var b = a`。这个语句的完成值是什么？

`b = a`赋值表达式给出的结果是被赋予的值（上面的`18`），但是`var`语句本身给出的结果是`undefined`。为什么？因为在语言规范中`var`语句就是这么定义的。入股你在你的控制台中敲入`var a = 42`，你会看到`undefined`被报告而不是`42`。

**注意：** 技术上讲，要比这复杂一些。在ES5语言规范，12.2部分的“变量语句”中，`VariableDeclaration`算法实际上返回了一个值（一个包含被声明变量的名称的`string` —— 诡异吧！？），但是这个值基本上被`VariableStatement`算法吞掉了（除了在`for..in`循环中使用），而这强制产生一个空的（也就是`undefined`）完成值。

事实上，如果你曾在你的控制台上（或者一个JavaScript环境REPL —— read/evaluate/print/loop工具）做过很多的代码实验的话，你可能看到过许多不同的语句都报告`undefined`，而且你也许从来没理解它是什么和为什么。简单地说，控制台仅仅报告语句的完成值。

但是控制台打印出的完成值并不是我们可以在程序中使用的东西。那么我们该如何捕获完成值呢？

这是个更加复杂的任务。在我们解释 *如何* 之前，让我们先探索一下 *为什么* 你想这样做。

我们需要考虑其他类新的语句的完成值。例如，任何普通的`{ .. }`块儿都有一个完成值，即它所包含的最后一个语句/表达式的完成值。

考虑如下代码：

```js
var b;

if (true) {
	b = 4 + 38;
}
```

如果你将这段代码敲入你的控制台/REPL，你可能会看到它报告`42`，因为`42`是`if`块儿的完成值，它取自`if`的最后一个复制表达式语句`b = 4 + 38`。

换句话说，一个块儿的完成值就像 *隐含地返回* 块儿中最后一个语句的值。

**注意：** 这在概念上与CoffeeScript这样的语言很类似，它们隐含地从`function`中`return`值，这些值与函数中最后一个语句的值是相同的。

但这里有一个明显的问题。这样的代码是不工作的：

```js
var a, b;

a = if (true) {
	b = 4 + 38;
};
```

我们不能以任何简单的语法/文法来捕获一个语句的完成值并将它赋值给另一个变量（至少是还不能！）。

那么，我们能做什么？

**警告：** 仅用于演示的目的 —— 不要实际地在你的真实代码中做如下内容！

我们可以使用臭名昭著的`eval(..)`（有时读成“evil”）函数来捕获这个完成值。

```js
var a, b;

a = eval( "if (true) { b = 4 + 38; }" );

a;	// 42
```

啊呀呀。这太难看了。但是这好用！而且它展示了语句的完成值是一个真实的东西，不仅仅是在控制台中，还可以在我们的程序中被捕获。

有一个称为“do表达式”的ES7提案。这是它可能工作的方式：

```js
var a, b;

a = do {
	if (true) {
		b = 4 + 38;
	}
};

a;	// 42
```

`do { .. }`表达式执行一个块儿（其中有一个或多个语句），这个块儿中的最后一个语句的完成值将成为`do`表达式的完成值，它可以像展示的那样被赋值给`a`。

这里的大意是能够将语句作为表达式对待 —— 他们可以出现在其他语句内部 —— 而不必将它们包装在一个内联的函数表达式中，并实施一个明确的`return ..`。

到目前为止，语句的完成值不过是一些琐碎的事情。不顾随着JS的进化它们的重要性可能会进一步提高，而且很有希望的是`do { .. }`表达式将会降低使用`eval(..)`这样的东西的冲动。

**警告：** 重复我刚才的训诫：避开`eval(..)`。真的。更多解释参见本系列的 *作用域与闭包* 一书。

### Expression Side Effects

大多数表达式没有副作用。例如：

```js
var a = 2;
var b = a + 3;
```

表达式`a + 3`本身并没有副作用，例如改变`a`。它有一个结果，就是`5`，而且这个结果在语句`b = a + 3`中被赋值给`b`。

一个最常见的（可能）带有副作用的表达式的例子是函数调用表达式：

```js
function foo() {
	a = a + 1;
}

var a = 1;
foo();		// result: `undefined`, side effect: changed `a`
```

还有其他的副作用表达式。例如：

```js
var a = 42;
var b = a++;
```

表达式`a++`有两个分离的行为。*首先*，它返回`a`的当前值，也就是`42`（然后它被赋值给`b`）。但 *接下来*，它改变`a`本身的值，将它增加1。

```js
var a = 42;
var b = a++;

a;	// 43
b;	// 42
```

许多开发者错误的认为`b`和`a`一样拥有值`43`。这种困惑源自没有完全考虑`++`操作符的副作用在 *什么时候* 发生。

`++`递增操作符和`--`递减操作符都是一元操作符（见第四章），它们既可以用于后缀（“后面”）位置也可用于前缀（“前面”）位置。

```js
var a = 42;

a++;	// 42
a;		// 43

++a;	// 44
a;		// 44
```

当`++`像`++a`这样用于前缀位置时，它的副作用（递增`a`）发生在值从表达式中返回 *之前*，而不是`a++`那样发生在 *之后*。

**注意：** 你认为`++a++`是一个合法的语法吗？如果你试一下，你将会得到一个`ReferenceError`错误，但为什么？因为有副作用的操作符 **要求一个变量引用** 来作为他们副作用的目标。对于`++a++`来说，`a++`这部分会首先被求值（因为操作符优先级 —— 参见下面的讨论），它会给出`a`在递增 _之前_ 的值。担然后它试着对`++42`求值，这将（如果你试一下）会给出相同的`ReferenceError`错误，因为`++`不能直接在`42`这样的值上施加副作用。

有时它会被错误地认为，你可以通过将`a++`包近一个`( )`中来封装它的 *后* 副作用，比如：

```js
var a = 42;
var b = (a++);

a;	// 43
b;	// 42
```

不幸的是，`( )`本身不会像我们希望的那样，定义一个新的被包装的表达式，而它会在`a++`表达式的 *后副作用* 之 *后* 求值。事实上，就算它能，`a++`也会首先返回`42`，而且除非你有另一个表达式在`++`的副作用之后对`a`在次求值，你也不会从这个表达式中得到`43`，于是`b`不会被赋值为`43`。

虽然，有另一种选择：`,`语句序列逗号操作符。这个操作符允许你将多个独立的表达式语句连成一个单独的语句：

```js
var a = 42, b;
b = ( a++, a );

a;	// 43
b;	// 43
```

**注意：** `a++, a`周围的`( .. )`是必需的。其原因的操作符优先级，我们将在本章后面讨论。

表达式`a++, a`意味着第二个`a`语句表达式会在第一个`a++`语句表达式的 *后副作用* 之 *后* 进行求值，这表明它为`b`的赋值返回`43`。

另一个副作用操作符的例子是`delete`。正如我们在第二章中展示的，`delete`用于从一个`object`或一个`array`值槽中移除一个属性。但它经常作为一个独立语句被调用：

```js
var obj = {
	a: 42
};

obj.a;			// 42
delete obj.a;	// true
obj.a;			// undefined
```

如果被请求的操作是合法/可允许的，`delete`操作符的结果值为`true`，否则结果为`false`。但是这个操作符的副作用是它移除了属性（或数组值槽）。

**注意：** 我们说合法/可允许是什么意思？不存在的属性，或存在但不可配置的属性（见本系列 *this与对象原型* 的第三章）将会从`delete`操作符中返回`true`。否则，其结果将是`false`或者一个错误。

副作用操作符的最后一个例子，可能既是明显的也是不明显的，是`=`赋值操作符。

考虑如下代码：

```js
var a;

a = 42;		// 42
a;			// 42
```

对于这个表达式来说，`a = 42`中的`=`看起来似乎不是一个副作用操作符。但如果我们检视语句`a = 42`的结果值，会发现它就是刚刚被赋予的值（`42`），所以向`a`赋予的相同的值实质上是一中副作用。

**提示：** 相同的原因也适用于`+=`，`-=`这样的复合赋值操作符的副作用。例如，`a = b += 2`被处理为首先进行`b += 2`（也就是`b = b + 2`），然后这个赋值的结果被赋予`a`。

这种赋值表达式（语句）得出被赋予的值的行为，主要在链式赋值上十分有用，就像这样：

```js
var a, b, c;

a = b = c = 42;
```

这里，`c = 42`被求值得出`42`（带有将`42`赋值给`c`的副作用），然后`b = 42`被求值得出`42`（带有将`42`赋值给`b`的副作用），而最后`a = 42`被求值（带有将`42`赋值给`a`的副作用）。

**警告：** 一个开发者们常犯的错误是将链式赋值写成`var a = b = 42`这样。虽然这看起来是相同的东西，但它不是。如果这个语句发生在没有另外分离的`var b`（在作用域的某处）来正式声明它的情况下，那么`var a = b = 42`将不会直接声明`b`。依`strict`模式的状态，它要么抛出一个错误，要么无意中创建一个全局变量（参见本系列的 *作用域与闭包*）。

另一个要考虑的场景是：

```js
function vowels(str) {
	var matches;

	if (str) {
		// pull out all the vowels
		matches = str.match( /[aeiou]/g );

		if (matches) {
			return matches;
		}
	}
}

vowels( "Hello World" ); // ["e","o","o"]
```

这可以工作，而且许多开发者喜欢这么做。但是使用一个我们可以利用赋值副作用的惯用法，可以通过将两个`if`语句组合为一个来进行简化：

```js
function vowels(str) {
	var matches;

	// pull out all the vowels
	if (str && (matches = str.match( /[aeiou]/g ))) {
		return matches;
	}
}

vowels( "Hello World" ); // ["e","o","o"]
```

**注意：** `matches = str.match..`周围的`( .. )`是必需的。其原因是操作符优先级，我们将在本章稍后的“操作符优先级”一节中讨论。

我偏好这种短一些的风格，因为我认为他明白地表示了两个条件其实是有关联，而非分离的。但是与大多数JS中的风格选择一样，哪一种 *更好* 纯粹是个人意见。

### Contextual Rules

在JavaScript文法规则中有好几个地方，同样的语法根据它们被使用的地方/方式不同意味着不同的东西。这样的东西可能，孤立的看，导致相当多的困惑。

我们不会在这里详尽地罗列所有这些情况，而只是指出常见的几个。

#### `{ .. }` Curly Braces

在你的代码中一对`{ .. }`大括号将主要出现在两种地方（随着JS的进化会有更多！）。让我们来看看它们每一种。

##### Object Literals

首先，作为一个`object`字面量：

```js
// assume there's a `bar()` function defined

var a = {
	foo: bar()
};
```

我们怎么知道这是一个`object`字面量？因为`{ .. }`是一个被赋予给`a`的值。

**注意：** `a`这个引用被称为一个“l-值”（也称为左手边的值）因为它是赋值的目标。`{ .. }`是一个“r-值”（也称为右手边的值）因为它仅被作为一个值使用（在这里作为赋值的源）。

##### Labels

如果我们移除上面代码的`var a =`部分会发生什么？

```js
// assume there's a `bar()` function defined

{
	foo: bar()
}
```

许多开发者臆测`{ .. }`只是一个独立的没有被赋值给任何地方的`object`字面量。但事实上完全不同。

这里，`{ .. }`只是一个普通的代码块儿。在JavaScript中拥有一个这样的独立`{ .. }`块儿并不是一个很惯用的形式（在其他语言中要常见得多！），但它是完美合法的JS文法。当与`let`块儿作用域声明组合使用时非常有用（见本系列的 *作用域与闭包*）。

这里的`{ .. }`代码块儿在功能上差不多与附着在一些语句后面的代码块儿是相同的，比如`for`/`while`循环，`if`条件，等等。

但如果它是一个一般代码块儿，那么那个看起来异乎寻常的`foo: bar()`语法是什么？它怎么会是合法的呢？

这是因为一个鲜为人知的（而且，坦白地说，不鼓励使用的）称为“标签语句”的JavaScript特性。`foo`是语句`bar()`（这个语句省略了末尾的`;`—— 见本章稍后的“自动分号”）的标签。但一个打了标签的语句有何意义？

如果JavaScript有一个`goto`语句，那么在理论上你就可以说`goto foo`并使程序的执行跳转到代码中的那个位置。`goto`通常被认为是一种糟糕的编码惯用形式，因为它们使代码更难于理解（也称为“面条代码”），所以JavaScript没有一般的`goto`语句是一件 *非常好的事情*。

然而，JS的确支持一种有限的，特殊形式的`goto`：标签跳转。`continue`和`break`语句都可以选择性地接受一个指定的标签，在这种情况下程序流会有些像`goto`一样“跳转”。考虑一下代码：

```js
// `foo` labeled-loop
foo: for (var i=0; i<4; i++) {
	for (var j=0; j<4; j++) {
		// whenever the loops meet, continue outer loop
		if (j == i) {
			// jump to the next iteration of
			// the `foo` labeled-loop
			continue foo;
		}

		// skip odd multiples
		if ((j * i) % 2 == 1) {
			// normal (non-labeled) `continue` of inner loop
			continue;
		}

		console.log( i, j );
	}
}
// 1 0
// 2 0
// 2 1
// 3 0
// 3 2
```

**注意：** `continue foo`不意味着“走到标记为‘foo’的位置并继续”，而是，“继续标记为‘foo’的循环，并进行下一次迭代”。所以，它不是一个 *真正的* 随意的`goto`。

如你所见，我们跳过了多个奇数的`3 1`迭代，而且被打了标签的循环跳转还跳过了`1 1`和`2 2`的迭代。

也许标签跳转的一个稍稍更有用的形式是，使用`break __`从一个内部循环里面跳出外部循环。没有带标签的`break`，同样的逻辑有时写起来非常尴尬：

```js
// `foo` labeled-loop
foo: for (var i=0; i<4; i++) {
	for (var j=0; j<4; j++) {
		if ((i * j) >= 3) {
			console.log( "stopping!", i, j );
			// break out of the `foo` labeled loop
			break foo;
		}

		console.log( i, j );
	}
}
// 0 0
// 0 1
// 0 2
// 0 3
// 1 0
// 1 1
// 1 2
// stopping! 1 3
```

**注意：** `break foo`不意味着“走到‘foo’标记的位置并继续”，而是，“跳出标记为‘foo’的循环/代码块儿，并继续它 *后面* 的部分”。不是一个传统意义上的`goto`，对吧？

对于上面的问题，使用不带标签的`break`将可能会牵连一个或多个函数，共享作用域中变量的访问，等等。它很可能要比带标签的`break`更令人糊涂，所以在这里使用带标签的`break`也许是更好的选择。

一个标签也可以用于一个非循环的块儿，但只有`break`可以引用这样的非循环标签。你可以使用带标签的`break ___`跳出任何被标记的块儿，但你不能`continue ___`一个非循环标签，也不能用一个不带标签的`break`跳出一个块儿。

```js
function foo() {
	// `bar` labeled-block
	bar: {
		console.log( "Hello" );
		break bar;
		console.log( "never runs" );
	}
	console.log( "World" );
}

foo();
// Hello
// World
```

带标签的循环/块儿极不常见，而且经常使人皱眉头。最好尽可能地避开它们；比如使用函数调用取代循环跳转。但是也许在一些有限的情况下它们会有用。如果你打算使用标签跳转，那么就确保使用大量注释在文档中记下你在做什么！

一个很常见的想法是，JSON是一个JS的恰当子集，所以一个JSON字符串（比如`{"a":42}` —— 注意属性名周围的引号是JSON必需的！）被认为是一个合法的JavaScript程序。**不是这样的！** 如果你试着把`{"a":42}`敲进你的JS控制台，你会得到一个错误。

这是因为语句标签周围不能有引号，所以`"a"`不是一个合法的标签，因此`:`不能出现在它后面。

所以，JSON确实是JS语法的子集，但是JSON本身不是合法的JS文法。

按照这个路线产生的一个极其常见的误解是，如果你将一个JS文件加载进一个`<script src=..>`标签，而它里面仅含有JSON内容的话（就像从API调用中得到那样），这些数据将作为合法的JavaScript被读取，但只是不能从程序中访问。JSON-P（将JSON数据包进一个函数调用的做法，比如`foo({"a":42})`）经常被说成是解决了这种不可访问性，通过向你程序中的一个函数发送这些值。

**不是这样的！** 实际上完全合法的JSON值`{"a":42}`本身将会抛出一个JS错误，因为它被翻译为一个带有非法标签的语句块儿。但是`foo({"a":42})`是一个合法的JS，因为在它里面，`{"a":42}`是一个被传入`foo(..)`的`object`字面量值。所以，更合适的说法是，**JSON-P使JSON成为合法的JS文法！**

##### Blocks

另一个常为人所诟病的JS坑（与强制转换有关 —— 见第四章）是：

```js
[] + {}; // "[object Object]"
{} + []; // 0
```

这看起来暗示着`+`操作符会根据第一个操作数是`[]`还是`{}`而给出不同的结果。但实际上这与它一点儿关系都没有！

在第一行中，`{}`出现在`+`操作符的表达式中，因此被翻译为一个实际的值（一个空`object`）。第四章解释过，`[]`被强制转换为`""`因此`{}`也会被强制转换为一个`string`：`"[object Object]"`。

但在第二行中，`{}`被翻译为一个独立的`{}`空代码块儿（它什么也不做）。块儿不需要分号来终结它们，所以这里缺少分号不是一个问题。最终，`+ []`是一个将`[]`*明确强制转换* 为`number`的表达式，而它的值是`0`。

##### Object Destructuring

从ES6开始，你将看到`{ .. }`出现的另一个地方是“解构赋值”（更多信息参见本系列的 *ES6与未来*），确切地说是`object`解构。考虑下面的代码：

```js
function getData() {
	// ..
	return {
		a: 42,
		b: "foo"
	};
}

var { a, b } = getData();

console.log( a, b ); // 42 "foo"
```

正如你可能看出来的，`var { a , b } = ..`是ES6解构赋值的一种形式，它大体等价于：

```js
var res = getData();
var a = res.a;
var b = res.b;
```

**注意：** `{ a, b }` 实际上是`{ a: a, b: b }`的ES6解构缩写，两者都能工作，但是人们期望短一些的`{ a, b }`能成为首先的形式。

使用一个`{ .. }`进行对象解构也可用于被命名的函数参数，这时它是同种类的隐含对象属性赋值的语法糖：

```js
function foo({ a, b, c }) {
	// no need for:
	// var a = obj.a, b = obj.b, c = obj.c
	console.log( a, b, c );
}

foo( {
	c: [1,2,3],
	a: 42,
	b: "foo"
} );	// 42 "foo" [1, 2, 3]
```

所以，我们使用`{ .. }`的上下文环境整体上决定了它们的含义，这展示了语法和文法之间的区别。理解这些微妙之处以回避JS引擎进行意外的翻译是很重要的。

#### `else if` And Optional Blocks

一个常见的误解是JavaScript拥有一个`else if`子句，因为你可以这么做：

```js
if (a) {
	// ..
}
else if (b) {
	// ..
}
else {
	// ..
}
```

但是这里有一个JS文法隐藏的性质：它没有`else if`。但是如果附着在`if`和`else`语句后面的代码块儿仅包含一个语句时，`if`和`else`语句允许省略这些代码块儿周围的`{ }`。毫无疑问，你以前已经见过这种现象很多次了：

```js
if (a) doSomething( a );
```

许多JS编码风格指引坚持认为，你应当总是在一个单独的语句块儿周围使用`{ }`，就像：

```js
if (a) { doSomething( a ); }
```

然而，完全相同的文法规则也适用于`else`子句，所以你经常编写的`else if`形式 *实际上* 被解析为：

```js
if (a) {
	// ..
}
else {
	if (b) {
		// ..
	}
	else {
		// ..
	}
}
```

`if (b) { .. } else { .. }`是一个紧随着`else`的单独的语句，所以你在它周围放不放一个`{ }`都可以。换句话说，当你使用`else if`的时候，从技术上讲你就打破了那个常见的编码风格指引，而且只是用一个单独的`if`语句定义了你的`else`。

当然，`else if`惯用法极其常见，而且减少了一级缩进，所以它很吸引人。无论你用哪种方式，就在你自己的编码风格指导/规则中明确地指出它，并且不要臆测`else if`是直接的文法规则。

## Operator Precedence

就像我们在第四章中讲解的，JavaScript版本的`&&`和`||`很有趣，因为它们选择并返回它们的操作数之一，而不是仅仅得出`true`或`false`的结果。如果只有两个操作数和一个操作符，这很容易推理。

```js
var a = 42;
var b = "foo";

a && b;	// "foo"
a || b;	// 42
```

但是如果牵扯到两个操作符，和三个操作数呢？

```js
var a = 42;
var b = "foo";
var c = [1,2,3];

a && b || c; // ???
a || b && c; // ???
```

要明白这些表达式产生什么结果，我们就需要理解当在一个表达式中有多于一个操作符时，什么样的规则统治着操作符被处理的方式。

这些规则称为“操作符优先级”。

我打赌大多数读者都觉得自己已经很好地理解了操作符优先级。但是和我们在本系列丛书中讲解的其他一切东西一样，我们将拨弄这种理解来看看它到底有多扎实，并希望能在这个过程中学到一些新东西。

回想上面的例子：

```js
var a = 42, b;
b = ( a++, a );

a;	// 43
b;	// 43
```

要是我们移除了`( )`会怎样？

```js
var a = 42, b;
b = a++, a;

a;	// 43
b;	// 42
```

等一下！为什么这改变了赋给`b`的值？

因为`,`操作符要比`=`操作符的优先级低。所以，`b = a++, a`被翻译为`(b = a++), a`。因为（如我们前面讲解的）`a++`拥有 *后副作用*，赋值给`b`的值就是在`++`改变`a`之前的值`42`。

这只是为了理解操作符优先级所需的一个简单事实。如果你将要把`,`作为一个语句序列操作符使用，那么知道它实际上拥有最低的优先级是很重要的。任何其他的操作符都将要比`,`结合得更紧密。

现在，回想上面的这个例子：

```js
if (str && (matches = str.match( /[aeiou]/g ))) {
	// ..
}
```

我们说过赋值语句周围的`( )`是必须的，但为什么？因为`&&`拥有的优先级比`=`更高，所以如果没有`( )`来强制结合，这个表达式将被作为`(str && matches) = str.match..`对待。但是这将是个错误，因为`(str && matches)`的结果将不是一个变量（在这里是`undefined`），而是一个值，因此它不能成为`=`赋值的左边！

好了，那么你可能认为你已经搞定操作符优先级了。

让我们移动到更复杂的例子（在本章下面几节中我们将一直使用这个例子），来真正测试一下你的理解：

```js
var a = 42;
var b = "foo";
var c = false;

var d = a && b || c ? c || b ? a : c && b : a;

d;		// ??
```

好的，邪恶，我承认。没有人会写这样的表达式串，对吧？*也许* 不会，但是我们将使用它来检视将多个操作符链接在一起时的各种问题，而链接多个操作符是一个非常常见的任务。

上面的结果是`42`。但是这根本没意思，除非我们自己能搞清楚这个答案，而不是将它插进JS程序来让JavaScript搞定它。

让我们深入挖掘。

第一个问题 —— 你可能还从来没问过 —— 是，第一个部分（`a && b || c`）是像`(a && b) || c`那样动作，还是像`a && (b || c)`那样动作？你能确定吗？你能说服你自己它们实际上是不同的吗？

```js
(false && true) || true;	// true
false && (true || true);	// false
```

所以，这就是它们不同的证据。但是`false && true || true`到底是如何动作的？答案是：

```js
false && true || true;		// true
(false && true) || true;	// true
```

那么我们有了答案。`&&`操作符首先被求值，而`||`操作符第二被求值。

但这不是因为从左到右的处理顺序吗？让我们把操作符的顺序倒过来：

```js
true || false && false;		// true

(true || false) && false;	// false -- nope
true || (false && false);	// true -- winner, winner!
```

现在我们证明了`&&`首先被求值，然后才是`||`，而且在这个例子中的顺序实际上是与一般希望的从左到右的顺序相反的。

那么什么导致了这种行为？**操作符优先级。**

每种语言都定义了自己的操作符优先级列表。虽然令人焦虑，但是JS开发者读过JS的列表是不常见的。

如果你熟知它，上面的例子一点儿都不会绊到你，因为你已经知道了`&&`要比`||`优先级高。但是我打赌有相当一部分读者不得不将它考虑一会。

**注意：** 不幸的是，JS语言规范没有将它的操作符优先级罗列在一个方便，单独的位置。你不得不通读并理解所有的文法规则。所以我们将试着以一种更方便的格式排列出更常见和更有用的部分。要得到完整的操作符优先级列表，参见MDN网站的“操作符优先级”(* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)。

### Short Circuited

In Chapter 4, we mentioned in a side note the "short circuiting" nature of operators like `&&` and `||`. Let's revisit that in more detail now.

在第四章中，我们在一个边注中提到了`&&`个`||`这样的操作符的“短接”性质。让我们更详细地重温它们。

For both `&&` and `||` operators, the right-hand operand will **not be evaluated** if the left-hand operand is sufficient to determine the outcome of the operation. Hence, the name "short circuited" (in that if possible, it will take an early shortcut out).

对于`&&`和`||`两个操作符来说，如果左手边的操作数足够确定操作的结果，那么右手边的操作数将 **不会被求值**。故而，有了“短接”（如果可能，它就会取捷径退出）这个名字。

For example, with `a && b`, `b` is not evaluated if `a` is falsy, because the result of the `&&` operand is already certain, so there's no point in bothering to check `b`. Likewise, with `a || b`, if `a` is truthy, the result of the operand is already certain, so there's no reason to check `b`.

例如，说`a && b`，如果`a`是falsy`b`就不会被求值，因为`&&`操作数的结果已经确定了，所以再去麻烦地检查`b`是没有意义的。同样的，说`a || b`，如果`a`是truthy，那么操作的结果就已经确定了，所以没有理由再去检查`b`。

This short circuiting can be very helpful and is commonly used:

这种短接非常有帮助，而且经常被使用：

```js
function doSomething(opts) {
	if (opts && opts.cool) {
		// ..
	}
}
```

The `opts` part of the `opts && opts.cool` test acts as sort of a guard, because if `opts` is unset (or is not an `object`), the expression `opts.cool` would throw an error. The `opts` test failing plus the short circuiting means that `opts.cool` won't even be evaluated, thus no error!

`opts && opts.cool`测试的`opts`部分就像某种保护，因为如果`opts`没有被赋值（或不是一个`object`），那么表达式`opts.cool`就将抛出一个错误。`opts`测试失败加上短接意味着`opts.cool`根本不会被求值，因此没有错误！

Similarly, you can use `||` short circuiting:

相似地，你可以用`||`短接：

```js
function doSomething(opts) {
	if (opts.cache || primeCache()) {
		// ..
	}
}
```

Here, we're checking for `opts.cache` first, and if it's present, we don't call the `primeCache()` function, thus avoiding potentially unnecessary work.

这里，我们首先检查`opts.cache`，如果它存在，我们就不会调用`primeCache()`函数，如此避免了潜在的不必要的工作。

### Tighter Binding

But let's turn our attention back to that earlier complex statement example with all the chained operators, specifically the `? :` ternary operator parts. Does the `? :` operator have more or less precedence than the `&&` and `||` operators?

让我们把注意力转回前面全是链接的操作符的复杂语句的例子，特别是`? :`三元操作符的部分。`? :`操作对的优先级与`&&`和`||`操作符比起来是高还是低？

```js
a && b || c ? c || b ? a : c && b : a
```

Is that more like this:

```js
a && b || (c ? c || (b ? a : c) && b : a)
```

or this?

```js
(a && b || c) ? (c || b) ? a : (c && b) : a
```

The answer is the second one. But why?

答案是第二个。但为什么？

Because `&&` is more precedent than `||`, and `||` is more precedent than `? :`.

因为`&&`优先级比`||`高，而`||`优先级比`? :`高。

So, the expression `(a && b || c)` is evaluated *first* before the `? :` it participates in. Another way this is commonly explained is that `&&` and `||` "bind more tightly" than `? :`. If the reverse was true, then `c ? c...` would bind more tightly, and it would behave (as the first choice) like `a && b || (c ? c..)`.

所以，表达式`(a && b || c)`在`? :`参与之前被 *首先* 求值。另一种常见的解释方式是，`&&`和`||`要被`? :`“结合的更紧密”。如果倒过来成立的话，那么`c ? c..`将结合的更紧密，那么它就会如`a && b || (c ? c..)`那样动作（就像第一种选择）。

### Associativity

So, the `&&` and `||` operators bind first, then the `? :` operator. But what about multiple operators of the same precedence? Do they always process left-to-right or right-to-left?

所以，`&&`和`||`操作符首先集合，然后是`? :`操作符。但是多个同等优先级的操作符呢？它们总是从左到右或是从右到左地处理吗？

In general, operators are either left-associative or right-associative, referring to whether **grouping happens from the left or from the right**.

一般来说，操作符不是左结合的就是右结合的，这要看 **分组是从左边发生还是从右边发生。**

It's important to note that associativity is *not* the same thing as left-to-right or right-to-left processing.

很重要而需要注意的是，结合性与从左到右或从右到左的处理 *不是* 同一个东西。

But why does it matter whether processing is left-to-right or right-to-left? Because expressions can have side effects, like for instance with function calls:

但为什么处理是从左到右或从右到左那么重要？因为表达式可以有副作用，例如函数调用：

```js
var a = foo() && bar();
```

Here, `foo()` is evaluated first, and then possibly `bar()` depending on the result of the `foo()` expression. That definitely could result in different program behavior than if `bar()` was called before `foo()`.

这里，`foo()`首先被求值，然后根据表达式`foo()`的结果，`bar()`可能会求值。如果`bar()`在`foo()`之前被调用绝对会得出不同的程序行为。

But this behavior is *just* left-to-right processing (the default behavior in JavaScript!) -- it has nothing to do with the associativity of `&&`. In that example, since there's only one `&&` and thus no relevant grouping here, associativity doesn't even come into play.

但是这个行为就是从左到右的处理（JavaScript中的默认行为！）—— 它与`&&`的结合性无关。在这个例子中，因为这里只有一个`&&`因此没有相关的分组，所以根本谈不上结合性。

But with an expression like `a && b && c`, grouping *will* happen implicitly, meaning that either `a && b` or `b && c` will be evaluated first.

但是像`a && b && c`这样的表达式，分组将会隐含地发生，意味着不是`a && b`就是`b && c`会先被求值。

Technically, `a && b && c` will be handled as `(a && b) && c`, because `&&` is left-associative (so is `||`, by the way). However, the right-associative alternative `a && (b && c)` behaves observably the same way. For the same values, the same expressions are evaluated in the same order.

技术上讲，`a && b && c`将会作为`(a && b) && c`处理，因为`&&`是左结合的（顺带一提，`||`也是）。然而，

**Note:** If hypothetically `&&` was right-associative, it would be processed the same as if you manually used `( )` to create grouping like `a && (b && c)`. But that still **doesn't mean** that `c` would be processed before `b`. Right-associativity does **not** mean right-to-left evaluation, it means right-to-left **grouping**. Either way, regardless of the grouping/associativity, the strict ordering of evaluation will be `a`, then `b`, then `c` (aka left-to-right).

So it doesn't really matter that much that `&&` and `||` are left-associative, other than to be accurate in how we discuss their definitions.

But that's not always the case. Some operators would behave very differently depending on left-associativity vs. right-associativity.

Consider the `? :` ("ternary" or "conditional") operator:

```js
a ? b : c ? d : e;
```

`? :` is right-associative, so which grouping represents how it will be processed?

* `a ? b : (c ? d : e)`
* `(a ? b : c) ? d : e`

The answer is `a ? b : (c ? d : e)`. Unlike with `&&` and `||` above, the right-associativity here actually matters, as `(a ? b : c) ? d : e` *will* behave differently for some (but not all!) combinations of values.

One such example:

```js
true ? false : true ? true : true;		// false

true ? false : (true ? true : true);	// false
(true ? false : true) ? true : true;	// true
```

Even more nuanced differences lurk with other value combinations, even if the end result is the same. Consider:

```js
true ? false : true ? true : false;		// false

true ? false : (true ? true : false);	// false
(true ? false : true) ? true : false;	// false
```

From that scenario, the same end result implies that the grouping is moot. However:

```js
var a = true, b = false, c = true, d = true, e = false;

a ? b : (c ? d : e); // false, evaluates only `a` and `b`
(a ? b : c) ? d : e; // false, evaluates `a`, `b` AND `e`
```

So, we've clearly proved that `? :` is right-associative, and that it actually matters with respect to how the operator behaves if chained with itself.

Another example of right-associativity (grouping) is the `=` operator. Recall the chained assignment example from earlier in the chapter:

```js
var a, b, c;

a = b = c = 42;
```

We asserted earlier that `a = b = c = 42` is processed by first evaluating the `c = 42` assignment, then `b = ..`, and finally `a = ..`. Why? Because of the right-associativity, which actually treats the statement like this: `a = (b = (c = 42))`.

Remember our running complex assignment expression example from earlier in the chapter?

```js
var a = 42;
var b = "foo";
var c = false;

var d = a && b || c ? c || b ? a : c && b : a;

d;		// 42
```

Armed with our knowledge of precedence and associativity, we should now be able to break down the code into its grouping behavior like this:

```js
((a && b) || c) ? ((c || b) ? a : (c && b)) : a
```

Or, to present it indented if that's easier to understand:

```js
(
  (a && b)
    ||
  c
)
  ?
(
  (c || b)
    ?
  a
    :
  (c && b)
)
  :
a
```

Let's solve it now:

1. `(a && b)` is `"foo"`.
2. `"foo" || c` is `"foo"`.
3. For the first `?` test, `"foo"` is truthy.
4. `(c || b)` is `"foo"`.
5. For the second `?` test, `"foo"` is truthy.
6. `a` is `42`.

That's it, we're done! The answer is `42`, just as we saw earlier. That actually wasn't so hard, was it?

### Disambiguation

You should now have a much better grasp on operator precedence (and associativity) and feel much more comfortable understanding how code with multiple chained operators will behave.

But an important question remains: should we all write code understanding and perfectly relying on all the rules of operator precedence/associativity? Should we only use `( )` manual grouping when it's necessary to force a different processing binding/order?

Or, on the other hand, should we recognize that even though such rules *are in fact* learnable, there's enough gotchas to warrant ignoring automatic precedence/associativity? If so, should we thus always use `( )` manual grouping and remove all reliance on these automatic behaviors?

This debate is highly subjective, and heavily symmetrical to the debate in Chapter 4 over *implicit* coercion. Most developers feel the same way about both debates: either they accept both behaviors and code expecting them, or they discard both behaviors and stick to manual/explicit idioms.

Of course, I cannot answer this question definitively for the reader here anymore than I could in Chapter 4. But I've presented you the pros and cons, and hopefully encouraged enough deeper understanding that you can make informed rather than hype-driven decisions.

In my opinion, there's an important middle ground. We should mix both operator precedence/associativity *and* `( )` manual grouping into our programs -- I argue the same way in Chapter 4 for healthy/safe usage of *implicit* coercion, but certainly don't endorse it exclusively without bounds.

For example, `if (a && b && c) ..` is perfectly OK to me, and I wouldn't do `if ((a && b) && c) ..` just to explicitly call out the associativity, because I think it's overly verbose.

On the other hand, if I needed to chain two `? :` conditional operators together, I'd certainly use `( )` manual grouping to make it absolutely clear what my intended logic is.

Thus, my advice here is similar to that of Chapter 4: **use operator precedence/associativity where it leads to shorter and cleaner code, but use `( )` manual grouping in places where it helps create clarity and reduce confusion.**

## Automatic Semicolons

ASI (Automatic Semicolon Insertion) is when JavaScript assumes a `;` in certain places in your JS program even if you didn't put one there.

Why would it do that? Because if you omit even a single required `;` your program would fail. Not very forgiving. ASI allows JS to be tolerant of certain places where `;` aren't commonly thought  to be necessary.

It's important to note that ASI will only take effect in the presence of a newline (aka line break). Semicolons are not inserted in the middle of a line.

Basically, if the JS parser parses a line where a parser error would occur (a missing expected `;`), and it can reasonably insert one, it does so. What's reasonable for insertion? Only if there's nothing but whitespace and/or comments between the end of some statement and that line's newline/line break.

Consider:

```js
var a = 42, b
c;
```

Should JS treat the `c` on the next line as part of the `var` statement? It certainly would if a `,` had come anywhere (even another line) between `b` and `c`. But since there isn't one, JS assumes instead that there's an implied `;` (at the newline) after `b`. Thus, `c;` is left as a standalone expression statement.

Similarly:

```js
var a = 42, b = "foo";

a
b	// "foo"
```

That's still a valid program without error, because expression statements also accept ASI.

There's certain places where ASI is helpful, like for instance:

```js
var a = 42;

do {
	// ..
} while (a)	// <-- ; expected here!
a;
```

The grammar requires a `;` after a `do..while` loop, but not after `while` or `for` loops. But most developers don't remember that! So, ASI helpfully steps in and inserts one.

As we said earlier in the chapter, statement blocks do not require `;` termination, so ASI isn't necessary:

```js
var a = 42;

while (a) {
	// ..
} // <-- no ; expected here
a;
```

The other major case where ASI kicks in is with the `break`, `continue`, `return`, and (ES6) `yield` keywords:

```js
function foo(a) {
	if (!a) return
	a *= 2;
	// ..
}
```

The `return` statement doesn't carry across the newline to the `a *= 2` expression, as ASI assumes the `;` terminating the `return` statement. Of course, `return` statements *can* easily break across multiple lines, just not when there's nothing after `return` but the newline/line break.

```js
function foo(a) {
	return (
		a * 2 + 3 / 12
	);
}
```

Identical reasoning applies to `break`, `continue`, and `yield`.

### Error Correction

One of the most hotly contested *religious wars* in the JS community (besides tabs vs. spaces) is whether to rely heavily/exclusively on ASI or not.

Most, but not all, semicolons are optional, but the two `;`s in the `for ( .. ) ..` loop header are required.

On the pro side of this debate, many developers believe that ASI is a useful mechanism that allows them to write more terse (and more "beautiful") code by omitting all but the strictly required `;`s (which are very few). It is often asserted that ASI makes many `;`s optional, so a correctly written program *without them* is no different than a correctly written program *with them*.

On the con side of the debate, many other developers will assert that there are *too many* places that can be accidental gotchas, especially for newer, less experienced developers, where unintended `;`s being magically inserted change the meaning. Similarly, some developers will argue that if they omit a semicolon, it's a flat-out mistake, and they want their tools (linters, etc.) to catch it before the JS engine *corrects* the mistake under the covers.

Let me just share my perspective. A strict reading of the spec implies that ASI is an "error correction" routine. What kind of error, you may ask? Specifically, a **parser error**. In other words, in an attempt to have the parser fail less, ASI lets it be more tolerant.

But tolerant of what? In my view, the only way a **parser error** occurs is if it's given an incorrect/errored program to parse. So, while ASI is strictly correcting parser errors, the only way it can get such errors is if there were first program authoring errors -- omitting semicolons where the grammar rules require them.

So, to put it more bluntly, when I hear someone claim that they want to omit "optional semicolons," my brain translates that claim to "I want to write the most parser-broken program I can that will still work."

I find that to be a ludicrous position to take and the arguments of saving keystrokes and having more "beautiful code" to be weak at best.

Furthermore, I don't agree that this is the same thing as the spaces vs tabs debate -- that it's purely cosmetic -- but rather I believe it's a fundamental question of writing code that adheres to grammar requirements vs. code that relies on grammar exceptions to just barely skate through.

Another way of looking at it is that relying on ASI is essentially considering newlines to be significant "whitespace." Other languages like Python have true significant whitespace. But is it really appropriate to think of JavaScript as having significant newlines as it stands today?

My take: **use semicolons wherever you know they are "required," and limit your assumptions about ASI to a minimum.**

But don't just take my word for it. Back in 2012, creator of JavaScript Brendan Eich said (http://brendaneich.com/2012/04/the-infernal-semicolon/) the following:

> The moral of this story: ASI is (formally speaking) a syntactic error correction procedure. If you start to code as if it were a universal significant-newline rule, you will get into trouble.
> ..
> I wish I had made newlines more significant in JS back in those ten days in May, 1995.
> ..
> Be careful not to use ASI as if it gave JS significant newlines.

## Errors

Not only does JavaScript have different *subtypes* of errors (`TypeError`, `ReferenceError`, `SyntaxError`, etc.), but also the grammar defines certain errors to be enforced at compile time, as compared to all other errors that happen during runtime.

In particular, there have long been a number of specific conditions that should be caught and reported as "early errors" (during compilation). Any straight-up syntax error is an early error (e.g., `a = ,`), but also the grammar defines things that are syntactically valid but disallowed nonetheless.

Since execution of your code has not begun yet, these errors are not catchable with `try..catch`; they will just fail the parsing/compilation of your program.

**Tip:** There's no requirement in the spec about exactly how browsers (and developer tools) should report errors. So you may see variations across browsers in the following error examples, in what specific subtype of error is reported or what the included error message text will be.

One simple example is with syntax inside a regular expression literal. There's nothing wrong with the JS syntax here, but the invalid regex will throw an early error:

```js
var a = /+foo/;		// Error!
```

The target of an assignment must be an identifier (or an ES6 destructuring expression that produces one or more identifiers), so a value like `42` in that position is illegal and can be reported right away:

```js
var a;
42 = a;		// Error!
```

ES5's `strict` mode defines even more early errors. For example, in `strict` mode, function parameter names cannot be duplicated:

```js
function foo(a,b,a) { }					// just fine

function bar(a,b,a) { "use strict"; }	// Error!
```

Another `strict` mode early error is an object literal having more than one property of the same name:

```js
(function(){
	"use strict";

	var a = {
		b: 42,
		b: 43
	};			// Error!
})();
```

**Note:** Semantically speaking, such errors aren't technically *syntax* errors but more *grammar* errors -- the above snippets are syntactically valid. But since there is no `GrammarError` type, some browsers use `SyntaxError` instead.

### Using Variables Too Early

ES6 defines a (frankly confusingly named) new concept called the TDZ ("Temporal Dead Zone").

The TDZ refers to places in code where a variable reference cannot yet be made, because it hasn't reached its required initialization.

The most clear example of this is with ES6 `let` block-scoping:

```js
{
	a = 2;		// ReferenceError!
	let a;
}
```

The assignment `a = 2` is accessing the `a` variable (which is indeed block-scoped to the `{ .. }` block) before it's been initialized by the `let a` declaration, so it's in the TDZ for `a` and throws an error.

Interestingly, while `typeof` has an exception to be safe for undeclared variables (see Chapter 1), no such safety exception is made for TDZ references:

```js
{
	typeof a;	// undefined
	typeof b;	// ReferenceError! (TDZ)
	let b;
}
```

## Function Arguments

Another example of a TDZ violation can be seen with ES6 default parameter values (see the *ES6 & Beyond* title of this series):

```js
var b = 3;

function foo( a = 42, b = a + b + 5 ) {
	// ..
}
```

The `b` reference in the assignment would happen in the TDZ for the parameter `b` (not pull in the outer `b` reference), so it will throw an error. However, the `a` in the assignment is fine since by that time it's past the TDZ for parameter `a`.

When using ES6's default parameter values, the default value is applied to the parameter if you either omit an argument, or you pass an `undefined` value in its place:

```js
function foo( a = 42, b = a + 1 ) {
	console.log( a, b );
}

foo();					// 42 43
foo( undefined );		// 42 43
foo( 5 );				// 5 6
foo( void 0, 7 );		// 42 7
foo( null );			// null 1
```

**Note:** `null` is coerced to a `0` value in the `a + 1` expression. See Chapter 4 for more info.

From the ES6 default parameter values perspective, there's no difference between omitting an argument and passing an `undefined` value. However, there is a way to detect the difference in some cases:

```js
function foo( a = 42, b = a + 1 ) {
	console.log(
		arguments.length, a, b,
		arguments[0], arguments[1]
	);
}

foo();					// 0 42 43 undefined undefined
foo( 10 );				// 1 10 11 10 undefined
foo( 10, undefined );	// 2 10 11 10 undefined
foo( 10, null );		// 2 10 null 10 null
```

Even though the default parameter values are applied to the `a` and `b` parameters, if no arguments were passed in those slots, the `arguments` array will not have entries.

Conversely, if you pass an `undefined` argument explicitly, an entry will exist in the `arguments` array for that argument, but it will be `undefined` and not (necessarily) the same as the default value that was applied to the named parameter for that same slot.

While ES6 default parameter values can create divergence between the `arguments` array slot and the corresponding named parameter variable, this same disjointedness can also occur in tricky ways in ES5:

```js
function foo(a) {
	a = 42;
	console.log( arguments[0] );
}

foo( 2 );	// 42 (linked)
foo();		// undefined (not linked)
```

If you pass an argument, the `arguments` slot and the named parameter are linked to always have the same value. If you omit the argument, no such linkage occurs.

But in `strict` mode, the linkage doesn't exist regardless:

```js
function foo(a) {
	"use strict";
	a = 42;
	console.log( arguments[0] );
}

foo( 2 );	// 2 (not linked)
foo();		// undefined (not linked)
```

It's almost certainly a bad idea to ever rely on any such linkage, and in fact the linkage itself is a leaky abstraction that's exposing an underlying implementation detail of the engine, rather than a properly designed feature.

Use of the `arguments` array has been deprecated (especially in favor of ES6 `...` rest parameters -- see the *ES6 & Beyond* title of this series), but that doesn't mean that it's all bad.

Prior to ES6, `arguments` is the only way to get an array of all passed arguments to pass along to other functions, which turns out to be quite useful. You can also mix named parameters with the `arguments` array and be safe, as long as you follow one simple rule: **never refer to a named parameter *and* its corresponding `arguments` slot at the same time.** If you avoid that bad practice, you'll never expose the leaky linkage behavior.

```js
function foo(a) {
	console.log( a + arguments[1] ); // safe!
}

foo( 10, 32 );	// 42
```

## `try..finally`

You're probably familiar with how the `try..catch` block works. But have you ever stopped to consider the `finally` clause that can be paired with it? In fact, were you aware that `try` only requires either `catch` or `finally`, though both can be present if needed.

The code in the `finally` clause *always* runs (no matter what), and it always runs right after the `try` (and `catch` if present) finish, before any other code runs. In one sense, you can kind of think of the code in a `finally` clause as being in a callback function that will always be called regardless of how the rest of the block behaves.

So what happens if there's a `return` statement inside a `try` clause? It obviously will return a value, right? But does the calling code that receives that value run before or after the `finally`?

```js
function foo() {
	try {
		return 42;
	}
	finally {
		console.log( "Hello" );
	}

	console.log( "never runs" );
}

console.log( foo() );
// Hello
// 42
```

The `return 42` runs right away, which sets up the completion value from the `foo()` call. This action completes the `try` clause and the `finally` clause immediately runs next. Only then is the `foo()` function complete, so that its completion value is returned back for the `console.log(..)` statement to use.

The exact same behavior is true of a `throw` inside `try`:

```js
 function foo() {
	try {
		throw 42;
	}
	finally {
		console.log( "Hello" );
	}

	console.log( "never runs" );
}

console.log( foo() );
// Hello
// Uncaught Exception: 42
```

Now, if an exception is thrown (accidentally or intentionally) inside a `finally` clause, it will override as the primary completion of that function. If a previous `return` in the `try` block had set a completion value for the function, that value will be abandoned.

```js
function foo() {
	try {
		return 42;
	}
	finally {
		throw "Oops!";
	}

	console.log( "never runs" );
}

console.log( foo() );
// Uncaught Exception: Oops!
```

It shouldn't be surprising that other nonlinear control statements like `continue` and `break` exhibit similar behavior to `return` and `throw`:

```js
for (var i=0; i<10; i++) {
	try {
		continue;
	}
	finally {
		console.log( i );
	}
}
// 0 1 2 3 4 5 6 7 8 9
```

The `console.log(i)` statement runs at the end of the loop iteration, which is caused by the `continue` statement. However, it still runs before the `i++` iteration update statement, which is why the values printed are `0..9` instead of `1..10`.

**Note:** ES6 adds a `yield` statement, in generators (see the *Async & Performance* title of this series) which in some ways can be seen as an intermediate `return` statement. However, unlike a `return`, a `yield` isn't complete until the generator is resumed, which means a `try { .. yield .. }` has not completed. So an attached `finally` clause will not run right after the `yield` like it does with `return`.

A `return` inside a `finally` has the special ability to override a previous `return` from the `try` or `catch` clause, but only if `return` is explicitly called:

```js
function foo() {
	try {
		return 42;
	}
	finally {
		// no `return ..` here, so no override
	}
}

function bar() {
	try {
		return 42;
	}
	finally {
		// override previous `return 42`
		return;
	}
}

function baz() {
	try {
		return 42;
	}
	finally {
		// override previous `return 42`
		return "Hello";
	}
}

foo();	// 42
bar();	// undefined
baz();	// "Hello"
```

Normally, the omission of `return` in a function is the same as `return;` or even `return undefined;`, but inside a `finally` block the omission of `return` does not act like an overriding `return undefined`; it just lets the previous `return` stand.

In fact, we can really up the craziness if we combine `finally` with labeled `break` (discussed earlier in the chapter):

```js
function foo() {
	bar: {
		try {
			return 42;
		}
		finally {
			// break out of `bar` labeled block
			break bar;
		}
	}

	console.log( "Crazy" );

	return "Hello";
}

console.log( foo() );
// Crazy
// Hello
```

But... don't do this. Seriously. Using a `finally` + labeled `break` to effectively cancel a `return` is doing your best to create the most confusing code possible. I'd wager no amount of comments will redeem this code.

## `switch`

Let's briefly explore the `switch` statement, a sort-of syntactic shorthand for an `if..else if..else..` statement chain.

```js
switch (a) {
	case 2:
		// do something
		break;
	case 42:
		// do another thing
		break;
	default:
		// fallback to here
}
```

As you can see, it evaluates `a` once, then matches the resulting value to each `case` expression (just simple value expressions here). If a match is found, execution will begin in that matched `case`, and will either go until a `break` is encountered or until the end of the `switch` block is found.

That much may not surprise you, but there are several quirks about `switch` you may not have noticed before.

First, the matching that occurs between the `a` expression and each `case` expression is identical to the `===` algorithm (see Chapter 4). Often times `switch`es are used with absolute values in `case` statements, as shown above, so strict matching is appropriate.

However, you may wish to allow coercive equality (aka `==`, see Chapter 4), and to do so you'll need to sort of "hack" the `switch` statement a bit:

```js
var a = "42";

switch (true) {
	case a == 10:
		console.log( "10 or '10'" );
		break;
	case a == 42:
		console.log( "42 or '42'" );
		break;
	default:
		// never gets here
}
// 42 or '42'
```

This works because the `case` clause can have any expression (not just simple values), which means it will strictly match that expression's result to the test expression (`true`). Since `a == 42` results in `true` here, the match is made.

Despite `==`, the `switch` matching itself is still strict, between `true` and `true` here. If the `case` expression resulted in something that was truthy but not strictly `true` (see Chapter 4), it wouldn't work. This can bite you if you're for instance using a "logical operator" like `||` or `&&` in your expression:

```js
var a = "hello world";
var b = 10;

switch (true) {
	case (a || b == 10):
		// never gets here
		break;
	default:
		console.log( "Oops" );
}
// Oops
```

Since the result of `(a || b == 10)` is `"hello world"` and not `true`, the strict match fails. In this case, the fix is to force the expression explicitly to be a `true` or `false`, such as `case !!(a || b == 10):` (see Chapter 4).

Lastly, the `default` clause is optional, and it doesn't necessarily have to come at the end (although that's the strong convention). Even in the `default` clause, the same rules apply about encountering a `break` or not:

```js
var a = 10;

switch (a) {
	case 1:
	case 2:
		// never gets here
	default:
		console.log( "default" );
	case 3:
		console.log( "3" );
		break;
	case 4:
		console.log( "4" );
}
// default
// 3
```

**Note:** As discussed previously about labeled `break`s, the `break` inside a `case` clause can also be labeled.

The way this snippet processes is that it passes through all the `case` clause matching first, finds no match, then goes back up to the `default` clause and starts executing. Since there's no `break` there, it continues executing in the already skipped over `case 3` block, before stopping once it hits that `break`.

While this sort of round-about logic is clearly possible in JavaScript, there's almost no chance that it's going to make for reasonable or understandable code. Be very skeptical if you find yourself wanting to create such circular logic flow, and if you really do, make sure you include plenty of code comments to explain what you're up to!

## Review

JavaScript grammar has plenty of nuance that we as developers should spend a little more time paying closer attention to than we typically do. A little bit of effort goes a long way to solidifying your deeper knowledge of the language.

Statements and expressions have analogs in English language -- statements are like sentences and expressions are like phrases. Expressions can be pure/self-contained, or they can have side effects.

The JavaScript grammar layers semantic usage rules (aka context) on top of the pure syntax. For example, `{ }` pairs used in various places in your program can mean statement blocks, `object` literals, (ES6) destructuring assignments, or (ES6) named function arguments.

JavaScript operators all have well-defined rules for precedence (which ones bind first before others) and associativity (how multiple operator expressions are implicitly grouped). Once you learn these rules, it's up to you to decide if precedence/associativity are *too implicit* for their own good, or if they will aid in writing shorter, clearer code.

ASI (Automatic Semicolon Insertion) is a parser-error-correction mechanism built into the JS engine, which allows it under certain circumstances to insert an assumed `;` in places where it is required, was omitted, *and* where insertion fixes the parser error. The debate rages over whether this behavior implies that most `;` are optional (and can/should be omitted for cleaner code) or whether it means that omitting them is making mistakes that the JS engine merely cleans up for you.

JavaScript has several types of errors, but it's less known that it has two classifications for errors: "early" (compiler thrown, uncatchable) and "runtime" (`try..catch`able). All syntax errors are obviously early errors that stop the program before it runs, but there are others, too.

Function arguments have an interesting relationship to their formal declared named parameters. Specifically, the `arguments` array has a number of gotchas of leaky abstraction behavior if you're not careful. Avoid `arguments` if you can, but if you must use it, by all means avoid using the positional slot in `arguments` at the same time as using a named parameter for that same argument.

The `finally` clause attached to a `try` (or `try..catch`) offers some very interesting quirks in terms of execution processing order. Some of these quirks can be helpful, but it's possible to create lots of confusion, especially if combined with labeled blocks. As always, use `finally` to make code better and clearer, not more clever or confusing.

The `switch` offers some nice shorthand for `if..else if..` statements, but beware of many common simplifying assumptions about its behavior. There are several quirks that can trip you up if you're not careful, but there's also some neat hidden tricks that `switch` has up its sleeve!
