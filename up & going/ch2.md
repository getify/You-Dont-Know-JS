# You Don't Know JS: Up & Going
# Chapter 2: Into JavaScript

在前一章中，我介绍了编程的基本构建块儿，比如变量，循环，条件，和函数。当然，所有被展示的代码都是JavaScript。但是在这一章中，我们想要特别集中于那些为了作为一个JS开发者入门和进阶，你需要知道的关于JavaScript的事情。

我们将在本章中介绍好几个概念，它们将会在后续的 *YDKJS* 丛书中全面地探索。你可以将这一章看作是这个系列的其他书目中将要详细讲解的话题的一个概览。

特别是如果你刚接触JavaScript，那么你应当希望花相当一段时间来多次复习这里的概念和代码示例。任何好的基础都是一砖一瓦积累起来的，所以不要指望你会在第一遍通读后就立即理解了全部内容。

你深入学习JavaScript的旅途从这里开始。

**注意：** 正如我在第一章中说过的，在你通读这一章的同时，你绝对应该亲自尝试这里所有的代码。要注意的是，这里的有些代码假定最新版本的JavaScript（通常称为“ES6”，ECMAScript的第六个版本 —— ECMAScript是JS语言规范的官方名称）中引入的功能是存在的。如果你碰巧在使用一个老版本的，前ES6时代的浏览器，这些代码可能不好用。应当使用一个更新版本的现代浏览器（比如Chrome，Firefox，或者IE）。

## Values & Types

正如我们在第一章中宣称的，JavaScript拥有带类型的值，没有带类型的变量。下面是可用的内建类型：

* `string`
* `number`
* `boolean`
* `null` and `undefined`
* `object`
* `symbol` (new to ES6)

JavaScript提供了一个`typeof`操作符，它可以检查一个值并告诉你它的类型是什么：

```js
var a;
typeof a;				// "undefined"

a = "hello world";
typeof a;				// "string"

a = 42;
typeof a;				// "number"

a = true;
typeof a;				// "boolean"

a = null;
typeof a;				// "object" -- weird, bug

a = undefined;
typeof a;				// "undefined"

a = { b: "c" };
typeof a;				// "object"
```

来自`typeof`的返回值总是六个（ES6中是七个！）字符串值之一。也就是，`typeof "abc"`返回`"string"`，不是`string`。

注意在这个代码段中变量`a`是如何持有每种不同类型的值的，而且尽管表面上看起来像，但是`typeof a`并不是在询问“`a`的类型”，而是“当前`a`中的值的类型”。在JavaScript中只有值拥有类型；变量只是这些值的简单容器。

`typeof null`是一个有趣的例子，因为当你期望它返回`"null"`时，它错误地返回了`"object"`。

**警告：** 这是JS中一直存在的一个bug，但是这个bug看起来永远都不会被修复了。在网络上有太多的代码依存于这个bug，而修复它将会导致更多的bug！

另外，注意`a = undefined`。我们明确地将`a`设置为值`undefined`，但是在行为上这与一个还没有被设定值的变量没有区别，比如在这个代码段顶部的`var a;`。一个变量可以用好几种不同的方式得到这样的“undefined”值状态，包括没有返回值的函数和使用`void`操作符。

### Objects

`object`类型指的是一种复合值，你可以在它上面设定属性（带名称的位置），每个属性持有各自的任意类型的值。它也许是JavaScript中最有用的类型之一。

```js
var obj = {
	a: "hello world",
	b: 42,
	c: true
};

obj.a;		// "hello world"
obj.b;		// 42
obj.c;		// true

obj["a"];	// "hello world"
obj["b"];	// 42
obj["c"];	// true
```

可视化地考虑这个`obj`值可能会有所帮助：

<img src="fig4.png">

属性既可以使用 *点号标记法*（例如，`obj.a`） 访问，也可以使用 *方括号标记法*（例如，`obj["a"]`） 访问。点号标记法更短而且一般来说更易于阅读，因此在可能的情况下它都是首选。

如果你有一个名称中含有特殊字符的属性名称，方括号标记法就很有用，比如`obj["hello world!"]` —— 当通过方括号标记法访问时，这样的属性经常被称为 *键*。`[ ]`标记法要求一个变量（下一节讲解）或者一个`string` *字面量*（它需要包装进`" .. "`或`' .. '`）。

当然，如果你想访问一个属性/键，但是它的名称被存储在另一个变量中时，方括号标记法也很有用。例如：

```js
var obj = {
	a: "hello world",
	b: 42
};

var b = "a";

obj[b];			// "hello world"
obj["b"];		// 42
```

**注意：** 更多关于JavaScript的`object`的信息，请参见本系列的 *this与对象原型*，尤其是第三章。

在JavaScript程序中有另外两种你将会经常打交道的值类型：*数组* 和 *函数*。但与其说它们是内建类型，这些类型应当被认为更像是子类型 —— `object`类型的特化版本。

#### Arrays

一个数组是一个`object`，它不使用特别的带名称的属性/键持有（任意类型的）值，而是使用数字索引的位置。例如：

```js
var arr = [
	"hello world",
	42,
	true
];

arr[0];			// "hello world"
arr[1];			// 42
arr[2];			// true
arr.length;		// 3

typeof arr;		// "object"
```

**注意：** 从零开始计数的语言，比如JS，在数组中使用`0`作为第一个元素的索引。

可视化地考虑`arr`很能会有所帮助：

<img src="fig5.png">

因为数组是一种特殊的对象（正如`typeof`所暗示的），所以它们可以拥有属性，包括一个可以自动被更新的`length`属性。

理论上你可以使用你自己的命名属性将一个数组用作一个普通对象，或者你可以使用一个`object`但是给它类似于数组的数字属性（`0`，`1`，等等）。然而，这一般被认为是分别误用了这两种类型。

最好且最自然的方法是为数字定位的值使用数组，而为命名属性使用`object`。

#### Functions

另一个你将在JS程序中到处使用的`object`子类型是函数：

```js
function foo() {
	return 42;
}

foo.bar = "hello world";

typeof foo;			// "function"
typeof foo();		// "number"
typeof foo.bar;		// "string"
```

同样地，函数也是`object`的子类型 —— `typeof`返回`"function"`，这暗示着`"function"`是一种主要类型 —— 因此也可以拥有属性，但是你一般仅会在有限情况下才使用函数对象属性（比如`foo.bar`）。

**注意：** 更多关于JS的值和它们的类型的信息，参见本系列的 *类型与文法* 的前两章。

### Built-In Type Methods

我们刚刚讨论的内建类型和子类型拥有十分强大和有用的行为，它们作为属性和方法暴露出来。

例如：

```js
var a = "hello world";
var b = 3.14159;

a.length;				// 11
a.toUpperCase();		// "HELLO WORLD"
b.toFixed(4);			// "3.1416"
```

使调用`a.toUpperCase()`称为可能的原因，要比这个值上存在这个方法的说法复杂一些。

简而言之，有一个`String`（`S`大写）对象包装器形式，通常被称为“原生类型”，与`string`基本类型配成一对儿；正是这个对象包装器的原型上定义了`toUpperCase()`方法。

当你通过引用一个属性或方法（例如，前一个代码段中的`a.toUpperCase()`）将一个像`"hello world"`这样的基本类型值当做一个`object`来使用时，JS自动地将这个值“封箱为它对应的对象包装器（这个操作是隐藏在幕后的）。

一个`string`值可以被包装为一个`String`对象，一个`number`可以被包装为一个`Number`对象，而一个`boolean`可以被包装为一个`Boolean`对象。在大多数情况下，你不担心或者直接使用这些值的对象包装器形式 —— 在所有实际情况中首选基本类型值形式，而JavaScript会帮你搞定剩下的一切。

**注意：** 关于JS原生类型和“封箱”的更多信息，参见本系列的 *类型与文法* 的第三章。要更好地理解对象原型，参见本系列的 *this与对象原型* 的第五章。

### Comparing Values

在你的JS程序中你将需要进行两种主要的值的比较：*等价* 和 *不等价*。任何比较的结果都是严格的`boolean`值（`true`或`false`），无论被比较的值的类型是什么。

#### Coercion

在第一章中我们简单地谈了一下强制转换，我们在此重温它。

在JavaScript中强制转换有两种形式：*明确的* 和 *隐含的*。明确的强制转换比较简单，因为你可以在代码中明显地看到一个类型转换到另一个类型将会发生，而隐含的强制转换更像是另外一些操作的不明显的副作用引发的类型转换。

你可能听到过像“强制转换时邪恶的”这样情绪化的观点，这是因为一个清楚的事实 —— 强制转换在某些地方会产生一些令人吃惊的结果。也许没有什么能比当一个语言吓到他们时更能唤起开发者的沮丧心情了。

强制转换并不邪恶，它也不一定是令人吃惊的。事实上，你使用类型强制转换构建的绝大部分情况是十分合理和可理解的，而且它甚至可以用来 *改进* 你代码的可读性。但我们不会在这个话题上过度深入 —— 本系列的 *类型与文法* 的第四章将会进行全面讲解。

这是一个 *明确* 强制转换的例子：

```js
var a = "42";

var b = Number( a );

a;				// "42"
b;				// 42 -- the number!
```

而这是一个 *隐含* 强制转换的例子：

```js
var a = "42";

var b = a * 1;	// "42" implicitly coerced to 42 here

a;				// "42"
b;				// 42 -- the number!
```

#### Truthy & Falsy

在第一章中，我们简要地提到了值的“truthy”和“falsy”性质：当一个非`boolean`值被强制转换为一个`boolean`时，它是变成`true`还是`false`。

在JavaScript中“falsy”的明确列表如下：

* `""` (empty string)
* `0`, `-0`, `NaN` (invalid `number`)
* `null`, `undefined`
* `false`

任何不在这个“falsy”列表中的值都是“truthy”。这是其中的一些例子：

* `"hello"`
* `42`
* `true`
* `[ ]`, `[ 1, "2", 3 ]` (arrays)
* `{ }`, `{ a: 42 }` (objects)
* `function foo() { .. }` (functions)

重要的是要记住，一个非`boolean`值仅在实际上被强制转换为一个`boolean`时才遵循这个“truthy”/“falsy”强制转换。把你搞糊涂并不困难 —— 当一个场景看起来像是将一个值强制转换为`boolean`可它不是。

#### Equality

有四种等价性操作符：`==`，`===`，`!=`，和`!==`。`!`形式理所当然地是它们相对应操作符的平行的“不等”版本；*不等* 不应当与 *不对等* 相混淆。

`==`和`===`之间的不同通常被描述为，`==`检查值的等价性而`===`检查值和类型两者的等价性。但是，这是不准确的。描述它们的合理方式是，`==`在允许强制转换的条件下检查值的等价性，而`===`是在不允许强制转换的条件下检查值的等价性；因此`===`常被称为“严格等价”。

考虑这个在`==`宽松等价性比较中允许而`===`严格等价性比较重不允许的隐含强制转换：

```js
var a = "42";
var b = 42;

a == b;			// true
a === b;		// false
```

在`a == b`的笔记中，JS注意到类型不匹配，于是它经过一系列顺序的步骤将一个值或者它们两者强制转换为一个不同的类型，直到类型匹配为止，然后就可以检查一个简单的值等价性。

如果你仔细想一想，通过强制转换`a == b`可以有两种方式给出`true`。这个比较要么最终成为`42 == 42`，要么成为`"42" == "42"`。那么是哪一种？

答案：`"42"`变成`42`，是比较成为`42 == 42`。在一个如此简单的例子中，只要最终结果是一样的，处理的过程走哪一条路看起来并不重要。但在一些更复杂的情况下，这不仅对比较的最终结果很重要，而且对你 *如何* 得到这个结果也很重要。

`a === b`产生`false`，因为强制转换是不允许的，所以简单的值比较很明显将会失败。许多开发者感觉`===`更可靠，所以他们提倡一直使用这种形式而远离`==`。我认为这种观点是非常短视的。我相信`==`是一种可以帮助程序的强大工具，*如果你花时间去学习它的工作方式*。

我们不会详细地讲解强制转换在`==`比较重是如何工作的。它的大部分都是相当合理的，但是有一些重要的极端用例要小心。你可以阅读ES5语言规范的11.9.3部分（http://www.ecma-international.org/ecma-262/5.1/）来了解确切的规则，而且与围绕这种机制的所有负面炒作比起来，你会对这它是多么的直白而感到吃惊。

为了将这许多细节归纳为一个简单的包装，并帮助你在各种情况下判断是否使用`==`或`===`，这是我的简单规则：

* 如果一个比较的两个值之一可能是`true`或`false`值，避免`==`而使用`===`。
* 如果一个比较的两个值之一可能是这些具体的值（`0`，`""`，或`[]` —— 空数组），避免`==`而使用`===`。
* 在 *所有* 其他情况下，你使用`==`是安全的。它不急安全，而且在许多情况下它可以简化你的代码并改善可读性。

这些规则归纳出来的东西要求你严谨地考虑你的代码：什么样的值可能通过这个被比较等价性的变量。如果你可以确定这些值，那么`==`就是安全的，使用它！如果你不能确定这些值，就使用`===`。就这么简单。

`!=`不等价形式对应于`==`，而`!==`形式对应于`===`。我们刚刚讨论的所有规则和注意点对这些非等价比较都是平行适用的。

如果你在比较两个非基本类型值，比如`object`（包括`function`和`array`），那么你应当特别小心`==`和`===`的比较规则。因为这些值实际上是通过引用持有的，`==`和`===`比较都将简单地检查这个引用是否相同，而不是它们底层的值。

例如，`array`默认情况下会通过使用逗号（`,`）连接所有值来被强制转换为`string`。你可能认为两个内容相同的`array`将是`==`相等的，但它们不是：


```js
var a = [1,2,3];
var b = [1,2,3];
var c = "1,2,3";

a == c;		// true
b == c;		// true
a == b;		// false
```

**注意：** 更多关于`==`等价性比较规则的信息，参见ES5语言规范（11.9.3部分），和本系列的 *类型与文法* 的第四章；更多关于值和引用的信息，参见它的第二章。

#### Inequality

`<`，`>`，`<=`，和`>=`操作符用于不等价，在语言规范中被称为“关系比较”。一般来说它们将与`number`这样的可比较有序值一起使用。`3 < 4`是很容易理解的。

但是JavaScript`string`值也可进行不等价比较，使用典型的字母顺序规则（`"bar" < "foo"`）。

那么强制转换呢？与`==`比较相似的规则（虽然不是完全相同！）也适用于不等价操作符。要注意的是，没有像`===`严格等价操作符那样不允许强制转换的“严格不等价”操作符。

考虑如下代码：

```js
var a = 41;
var b = "42";
var c = "43";

a < b;		// true
b < c;		// true
```

这里发生了什么？在ES5语言规范的11.8.5部分中，它说如果`<`比较的两个值都是`string`，就像`b < c`，那么这个比较将会以字典顺序（也就是像字典中字母的排列顺序）进行。但如果连个值之一不是`string`，就像`a < b`，那么两个值就将被强制转换成`number`，并进行一般的数字比较。

在可能不同类型的值之间进行比较时，你可能遇到的最大的坑 —— 记住，没有“严格不等价”可用 —— 是其中一个值不能转换为合法的数字，例如：

```js
var a = 42;
var b = "foo";

a < b;		// false
a > b;		// false
a == b;		// false
```

等一下，这三个比较怎么可能都是`false`？因为在`<`和`>`的比较重，值`b`被强制转换为了“非法的数字值”，而且语言规范说`Nan`既不大于其他值，也不小于其他值。

`==`比较失败于不同的原因。如果`a == b`被解释为`42 == NaN`或者`"42" == "foo"`都会失败 —— 正如我们前面讲过的，这里是前一种情况。

**注意：** 关于不等价比较规则的更多信息，参见ES5语言规范的11.8.5部分，和本系列的 *类型与文法* 第四章。

## Variables

在JavaScript中，变量名（包括函数名）必须是合法的 *标识符*。当你考虑非传统意义上的字符时，比如Unicode，标识符中合法字符的严格和完整的规则就有点儿复杂。如果你仅考虑典型的ASCII字母数字的字符，那么这个规则还是很简单的。

一个标识符必须以`a`-`z`，`A`-`Z`，`$`，或`_`开头。它可以包含任意这些字符外加数字`0`-`9`。

一般来说，变量标识符的规则也通用适用于属性名称。然而，有一些不能用作变量名，但是可以用作属性名的单词。这些单词被称为“保留字”，包括JS关键字（`for`，`in`，`if`，等等）和`null`，`true`和`false`。

**注意：** 更多关于保留字的信息，参见本系列的 *类型与文法* 的附录A。

### Function Scopes

你使用`var`关键字声明的变量将属于当前的函数作用域，如果声明位于任何函数外部的顶层，它就属于全局作用域。

#### Hoisting

无论`var`出现在一个作用域内部的何处，这个声明都被认为是属于整个作用域，而且在作用域的所有位置都是可以访问的。

这种行为称为 *提升*，比喻一个`var`声明在概念上 *被移动* 到了包含它的作用域的顶端。技术上讲，这个过程通过代码的编译方式进行解释更准确，但是我们县暂且跳过那些细节。

Consider:

考虑如下代码：

```js
var a = 2;

foo();					// works because `foo()`
						// declaration is "hoisted"

function foo() {
	a = 3;

	console.log( a );	// 3

	var a;				// declaration is "hoisted"
						// to the top of `foo()`
}

console.log( a );	// 2
```

**警告：** 在一个作用域中依靠变量提升来在`var`声明出现之前使用一个变量是不常见的，也不是个好主意；它可能相当使人困惑。而使用被提升的函数声明要常见得多，也更为人所接受，就像我们在`foo()`正式声明之前就调用它一样。

#### Nested Scopes

当你声明了一个变量时，它就在这个作用域内的任何地方都是可用的，包括任何下层/内部作用域。例如：

```js
function foo() {
	var a = 1;

	function bar() {
		var b = 2;

		function baz() {
			var c = 3;

			console.log( a, b, c );	// 1 2 3
		}

		baz();
		console.log( a, b );		// 1 2
	}

	bar();
	console.log( a );				// 1
}

foo();
```

注意`c`在`bar()`的内部是不可用的，因为它是仅在内部的`baz()`作用域中被声明的，并且`b`因为同样的原因在`foo()`内是不可用的。

如果你试着在一个作用域内访问一个不可用的变量的值，你就会得到一个被抛出的`ReferenceError`。如果你试着为一个还没有被声明的变量赋值，那么根据“strict模式”的状态，你会要么得到一个在顶层全局作用域中创建的变量（不好！），要么得到一个错误。让我们看一下：

```js
function foo() {
	a = 1;	// `a` not formally declared
}

foo();
a;			// 1 -- oops, auto global variable :(
```

这是一种非常差劲儿的做法。别这么干！总是给你的变量进行正式声明。

除了在函数级别为变量创建声明，ES6允许你使用`let`关键字声明属于个别块儿（一个`{ .. }`）的变量。除了一些微妙的细节，作用域规则将大致上与我们刚刚看到的函数相同：

```js
function foo() {
	var a = 1;

	if (a >= 1) {
		let b = 2;

		while (b < 5) {
			let c = b * 2;
			b++;

			console.log( a + c );
		}
	}
}

foo();
// 5 7 9
```

因为使用了`let`而非`var`，`b`将仅属于`if`语句而不是整个`foo()`函数的作用域。相似地，`c`仅属于`while`循环。对于以更加细粒度的方式管理你的变量作用域来说，块儿作用域是非常有用的，它将使你的代码随着时间的推移更加易于维护。

**注意：** 关于作用域的更多信息，参见本系列的 *作用域与闭包*。更多关于`let`块儿作用域的信息，参见本系列的 *ES6与未来*。

## Conditionals

In addition to the `if` statement we introduced briefly in Chapter 1, JavaScript provides a few other conditionals mechanisms that we should take a look at.

除了我们在第一章中简要介绍过的`if`语句，JavaScript还提供了几种其他值得我们一看的条件机制。

Sometimes you may find yourself writing a series of `if..else..if` statements like this:

有时你可能发现自己在像这样写一系列的`if..else..if`语句：

```js
if (a == 2) {
	// do something
}
else if (a == 10) {
	// do another thing
}
else if (a == 42) {
	// do yet another thing
}
else {
	// fallback to here
}
```

This structure works, but it's a little verbose because you need to specify the `a` test for each case. Here's another option, the `switch` statement:

这种结构好用，但有一点儿繁冗，因为你需要为每一种情况都指明`a`的测试。这里有另一种选项，`switch`语句：

```js
switch (a) {
	case 2:
		// do something
		break;
	case 10:
		// do another thing
		break;
	case 42:
		// do yet another thing
		break;
	default:
		// fallback to here
}
```

The `break` is important if you want only the statement(s) in one `case` to run. If you omit `break` from a `case`, and that `case` matches or runs, execution will continue with the next `case`'s statements regardless of that `case` matching. This so called "fall through" is sometimes useful/desired:

如果你想仅让一个`case`中的语句运行，`break`是很重要的。如果你在一个`case`中省略了`break`，并且这个`case`成立或运行，那么程序的执行将会不管下一个`case`语句是否成立而继续执行它。这种所谓的“掉落”有时是有用/期望的：

```js
switch (a) {
	case 2:
	case 10:
		// some cool stuff
		break;
	case 42:
		// other stuff
		break;
	default:
		// fallback
}
```

Here, if `a` is either `2` or `10`, it will execute the "some cool stuff" code statements.

这里，如果`a`是`2`或`10`，它就会执行“一些很酷的东西”的代码语句。

Another form of conditional in JavaScript is the "conditional operator," often called the "ternary operator." It's like a more concise form of a single `if..else` statement, such as:

在JavaScript中的另一种条件形式是“条件操作符”，经常被称为“三元操作符”。它像是一个单独的`if..else`语句的更简洁的形式，比如：

```js
var a = 42;

var b = (a > 41) ? "hello" : "world";

// similar to:

// if (a > 41) {
//    b = "hello";
// }
// else {
//    b = "world";
// }
```

If the test expression (`a > 41` here) evaluates as `true`, the first clause (`"hello"`) results, otherwise the second clause (`"world"`) results, and whatever the result is then gets assigned to `b`.

如果测试表达式（这里是`a > 41`）求值为`true`，那么就会得到第一个子句（`"hello"`），否则得到第二个子句（`"world"`），而且无论结果为何都会被赋值给`b`。

The conditional operator doesn't have to be used in an assignment, but that's definitely the most common usage.

条件操作符不一定非要用于赋值，但是这绝对是最常见的用法。

**Note:** For more information about testing conditions and other patterns for `switch` and `? :`, see the *Types & Grammar* title of this series.

**注意：** 关于测试条件和`switch`与`? :`的其他模式的更多信息，参见本系列的 *类型与文法*。

## Strict Mode

ES5在语言中加入了一个“strict模式”，它收紧了一些特定行为的规则。一般来说，这些限制被视为使代码符合一组组更安全和更合理的指导方针。另外，坚持strict模式一般会使你的代码对引擎有更强的可优化性。strict模式对代码有很大的好处，你应当在你所有的程序中使用它。

根据你摆放strict模式注解的位置，你可以为一个单独的函数，或者是整个一个文件切换到strict模式：

```js
function foo() {
	"use strict";

	// this code is strict mode

	function bar() {
		// this code is strict mode
	}
}

// this code is not strict mode
```

将它与这个相比：

```js
"use strict";

function foo() {
	// this code is strict mode

	function bar() {
		// this code is strict mode
	}
}

// this code is strict mode
```

使用strict模式的一个关键不同（改善！）是，它不允许因为省略了`var`而进行隐含的自动全局变量声明：

```js
function foo() {
	"use strict";	// turn on strict mode
	a = 1;			// `var` missing, ReferenceError
}

foo();
```

如果你在代码中打开strict模式，而且你得到错误，或者代码开始变得有bug，这可能会诱使你避免使用strict模式。但是纵容这种直觉不是一个好主意。如果strict模式在你的程序中导致了问题，那么几乎可以肯定这标志着在你的代码中有你应该修改的东西。

strict模式不仅将你的代码保持在更安全的道路上，也不仅将使你的代码可优化性更强，它还代表着这种语言未来的方向。对于你来说，现在就开始习惯于strict模式要比一直拿掉它容易得多 —— 以后再进行这种转变只会更难！

**注意：** 关于strict模式的更多信息，参见本系列的 *类型与文法* 的第五章。

## Functions As Values

至此，我们已经将函数作为JavaScript中主要的 *作用域* 机制讨论过了。你可以回想一下典型的`function`声明语法是这样的：

```js
function foo() {
	// ..
}
```

虽然从这种语法中看起来不明显，`foo`基本上是一个位于外围作用域的变量，它给了被声明的`function`一个引用。也就是说，`function`本身是一个值，就像`42`或`[1,2,3]`一样。

一眼看上去这可能听起来像是一个奇怪的概念，所以花点儿时间仔细考虑一下。你不仅可以向一个`function`传递一个值（参数值），而且 *一个函数本身可以是一个值*，它能够赋值给变量，传递给其他函数，或者从其它函数中返回。

因此，一个函数值应当被认为是一个表达式，与任何其他的值或表达式很相似。

考虑如下代码：

```js
var foo = function() {
	// ..
};

var x = function bar(){
	// ..
};
```

第一个被赋值给变量`foo`的函数表达式称为 *匿名* 函数表达式，因为它没有“名称”。

第二个函数表达式是 *命名的*（`bar`），它还被赋值给变量`x`作为它的引用。*命名函数表达式* 一般来所更理想，虽然 *匿名函数表达式* 仍然极其常见。

更多信息参见本系列的 *作用域与闭包*。

### Immediately Invoked Function Expressions (IIFEs)

在前一个代码段中，哪一个函数表达式都没有被执行 —— 如果我们使用了`foo()`或`x()`，这是可能的。

有另一种执行函数表达式的方法，它通常被称为一个 *立即被调用的函数表达式* （IIFE）：

```js
(function IIFE(){
	console.log( "Hello!" );
})();
// "Hello!"
```

围绕在函数表达式`(function IIFE(){ .. })`外部的`( .. )`只是一个微妙的JS文法，我们需要它来防止函数表达式被看作一个普通的函数声明。

在表达式末尾的最后的`()` —— `})();`这一行 —— 才是实际立即执行它前面的函数表达式的东西。

这看起来可能很奇怪，但它不想第一眼看上去那么陌生。考虑这里的`foo`和`IIFE`之间的相似性：

```js
function foo() { .. }

// `foo` function reference expression,
// then `()` executes it
foo();

// `IIFE` function expression,
// then `()` executes it
(function IIFE(){ .. })();
```

如你所见，在执行它的`()`之前列出`(function IIFE(){ .. })`，与在执行它的`()`之前定义`foo`，实质上是相同的；在这两种情况下，函数引用都使用立即在它后面的`()`执行。

因为IIFE只是一个函数，而函数可以创建变量 *作用域*，以这样的风格使用一个IIFE经常被用于定义变量，而这些变量将不会影响围绕在IIFE外面的代码：

```js
var a = 42;

(function IIFE(){
	var a = 10;
	console.log( a );	// 10
})();

console.log( a );		// 42
```

IIFE还可以有返回值：

```js
var x = (function IIFE(){
	return 42;
})();

x;	// 42
```

值`42`从被执行的命名为`IIFE`的函数中`return`，然后被赋值给`x`。

### Closure

*Closure* is one of the most important, and often least understood, concepts in JavaScript. I won't cover it in deep detail here, and instead refer you to the *Scope & Closures* title of this series. But I want to say a few things about it so you understand the general concept. It will be one of the most important techniques in your JS skillset.

*闭包* 是JavaScript中最重要，而又经常最少为人知的概念之一。我不会在这里涵盖更深的细节，你可以参照本系列的 *作用域与闭包*。但我想说几件关于它的事情，以便你了解它的一般概念。它将是你的JS技术结构中最重要的技术之一。

You can think of closure as a way to "remember" and continue to access a function's scope (its variables) even once the function has finished running.



Consider:

```js
function makeAdder(x) {
	// parameter `x` is an inner variable

	// inner function `add()` uses `x`, so
	// it has a "closure" over it
	function add(y) {
		return y + x;
	};

	return add;
}
```

The reference to the inner `add(..)` function that gets returned with each call to the outer `makeAdder(..)` is able to remember whatever `x` value was passed in to `makeAdder(..)`. Now, let's use `makeAdder(..)`:

```js
// `plusOne` gets a reference to the inner `add(..)`
// function with closure over the `x` parameter of
// the outer `makeAdder(..)`
var plusOne = makeAdder( 1 );

// `plusTen` gets a reference to the inner `add(..)`
// function with closure over the `x` parameter of
// the outer `makeAdder(..)`
var plusTen = makeAdder( 10 );

plusOne( 3 );		// 4  <-- 1 + 3
plusOne( 41 );		// 42 <-- 1 + 41

plusTen( 13 );		// 23 <-- 10 + 13
```

More on how this code works:

1. When we call `makeAdder(1)`, we get back a reference to its inner `add(..)` that remembers `x` as `1`. We call this function reference `plusOne(..)`.
2. When we call `makeAdder(10)`, we get back another reference to its inner `add(..)` that remembers `x` as `10`. We call this function reference `plusTen(..)`.
3. When we call `plusOne(3)`, it adds `3` (its inner `y`) to the `1` (remembered by `x`), and we get `4` as the result.
4. When we call `plusTen(13)`, it adds `13` (its inner `y`) to the `10` (remembered by `x`), and we get `23` as the result.

Don't worry if this seems strange and confusing at first -- it can be! It'll take lots of practice to understand it fully.

But trust me, once you do, it's one of the most powerful and useful techniques in all of programming. It's definitely worth the effort to let your brain simmer on closures for a bit. In the next section, we'll get a little more practice with closure.

#### Modules

The most common usage of closure in JavaScript is the module pattern. Modules let you define private implementation details (variables, functions) that are hidden from the outside world, as well as a public API that *is* accessible from the outside.

Consider:

```js
function User(){
	var username, password;

	function doLogin(user,pw) {
		username = user;
		password = pw;

		// do the rest of the login work
	}

	var publicAPI = {
		login: doLogin
	};

	return publicAPI;
}

// create a `User` module instance
var fred = User();

fred.login( "fred", "12Battery34!" );
```

The `User()` function serves as an outer scope that holds the variables `username` and `password`, as well as the inner `doLogin()` function; these are all private inner details of this `User` module that cannot be accessed from the outside world.

**Warning:** We are not calling `new User()` here, on purpose, despite the fact that probably seems more common to most readers. `User()` is just a function, not a class to be instantiated, so it's just called normally. Using `new` would be inappropriate and actually waste resources.

Executing `User()` creates an *instance* of the `User` module -- a whole new scope is created, and thus a whole new copy of each of these inner variables/functions. We assign this instance to `fred`. If we run `User()` again, we'd get a new instance entirely separate from `fred`.

The inner `doLogin()` function has a closure over `username` and `password`, meaning it will retain its access to them even after the `User()` function finishes running.

`publicAPI` is an object with one property/method on it, `login`, which is a reference to the inner `doLogin()` function. When we return `publicAPI` from `User()`, it becomes the instance we call `fred`.

At this point, the outer `User()` function has finished executing. Normally, you'd think the inner variables like `username` and `password` have gone away. But here they have not, because there's a closure in the `login()` function keeping them alive.

That's why we can call `fred.login(..)` -- the same as calling the inner `doLogin(..)` -- and it can still access `username` and `password` inner variables.

There's a good chance that with just this brief glimpse at closure and the module pattern, some of it is still a bit confusing. That's OK! It takes some work to wrap your brain around it.

From here, go read the *Scope & Closures* title of this series for a much more in-depth exploration.

## `this` Identifier

Another very commonly misunderstood concept in JavaScript is the `this` identifier. Again, there's a couple of chapters on it in the *this & Object Prototypes* title of this series, so here we'll just briefly introduce the concept.

While it may often seem that `this` is related to "object-oriented patterns," in JS `this` is a different mechanism.

If a function has a `this` reference inside it, that `this` reference usually points to an `object`. But which `object` it points to depends on how the function was called.

It's important to realize that `this` *does not* refer to the function itself, as is the most common misconception.

Here's a quick illustration:

```js
function foo() {
	console.log( this.bar );
}

var bar = "global";

var obj1 = {
	bar: "obj1",
	foo: foo
};

var obj2 = {
	bar: "obj2"
};

// --------

foo();				// "global"
obj1.foo();			// "obj1"
foo.call( obj2 );	// "obj2"
new foo();			// undefined
```

There are four rules for how `this` gets set, and they're shown in those last four lines of that snippet.

1. `foo()` ends up setting `this` to the global object in non-strict mode -- in strict mode, `this` would be `undefined` and you'd get an error in accessing the `bar` property -- so `"global"` is the value found for `this.bar`.
2. `obj1.foo()` sets `this` to the `obj1` object.
3. `foo.call(obj2)` sets `this` to the `obj2` object.
4. `new foo()` sets `this` to a brand new empty object.

Bottom line: to understand what `this` points to, you have to examine how the function in question was called. It will be one of those four ways just shown, and that will then answer what `this` is.

**Note:** For more information about `this`, see Chapters 1 and 2 of the *this & Object Prototypes* title of this series.

## Prototypes

The prototype mechanism in JavaScript is quite complicated. We will only glance at it here. You will want to spend plenty of time reviewing Chapters 4-6 of the *this & Object Prototypes* title of this series for all the details.

When you reference a property on an object, if that property doesn't exist, JavaScript will automatically use that object's internal prototype reference to find another object to look for the property on. You could think of this almost as a fallback if the property is missing.

The internal prototype reference linkage from one object to its fallback happens at the time the object is created. The simplest way to illustrate it is with a built-in utility called `Object.create(..)`.

Consider:

```js
var foo = {
	a: 42
};

// create `bar` and link it to `foo`
var bar = Object.create( foo );

bar.b = "hello world";

bar.b;		// "hello world"
bar.a;		// 42 <-- delegated to `foo`
```

It may help to visualize the `foo` and `bar` objects and their relationship:

<img src="fig6.png">

The `a` property doesn't actually exist on the `bar` object, but because `bar` is prototype-linked to `foo`, JavaScript automatically falls back to looking for `a` on the `foo` object, where it's found.

This linkage may seem like a strange feature of the language. The most common way this feature is used -- and I would argue, abused -- is to try to emulate/fake a "class" mechanism with "inheritance."

But a more natural way of applying prototypes is a pattern called "behavior delegation," where you intentionally design your linked objects to be able to *delegate* from one to the other for parts of the needed behavior.

**Note:** For more information about prototypes and behavior delegation, see Chapters 4-6 of the *this & Object Prototypes* title of this series.

## Old & New

Some of the JS features we've already covered, and certainly many of the features covered in the rest of this series, are newer additions and will not necessarily be available in older browsers. In fact, some of the newest features in the specification aren't even implemented in any stable browsers yet.

So, what do you do with the new stuff? Do you just have to wait around for years or decades for all the old browsers to fade into obscurity?

That's how many people think about the situation, but it's really not a healthy approach to JS.

There are two main techniques you can use to "bring" the newer JavaScript stuff to the older browsers: polyfilling and transpiling.

### Polyfilling

The word "polyfill" is an invented term (by Remy Sharp) (https://remysharp.com/2010/10/08/what-is-a-polyfill) used to refer to taking the definition of a newer feature and producing a piece of code that's equivalent to the behavior, but is able to run in older JS environments.

For example, ES6 defines a utility called `Number.isNaN(..)` to provide an accurate non-buggy check for `NaN` values, deprecating the original `isNaN(..)` utility. But it's easy to polyfill that utility so that you can start using it in your code regardless of whether the end user is in an ES6 browser or not.

Consider:

```js
if (!Number.isNaN) {
	Number.isNaN = function isNaN(x) {
		return x !== x;
	};
}
```

The `if` statement guards against applying the polyfill definition in ES6 browsers where it will already exist. If it's not already present, we define `Number.isNaN(..)`.

**Note:** The check we do here takes advantage of a quirk with `NaN` values, which is that they're the only value in the whole language that is not equal to itself. So the `NaN` value is the only one that would make `x !== x` be `true`.

Not all new features are fully polyfillable. Sometimes most of the behavior can be polyfilled, but there are still small deviations. You should be really, really careful in implementing a polyfill yourself, to make sure you are adhering to the specification as strictly as possible.

Or better yet, use an already vetted set of polyfills that you can trust, such as those provided by ES5-Shim (https://github.com/es-shims/es5-shim) and ES6-Shim (https://github.com/es-shims/es6-shim).

### Transpiling

There's no way to polyfill new syntax that has been added to the language. The new syntax would throw an error in the old JS engine as unrecognized/invalid.

So the better option is to use a tool that converts your newer code into older code equivalents. This process is commonly called "transpiling," a term for transforming + compiling.

Essentially, your source code is authored in the new syntax form, but what you deploy to the browser is the transpiled code in old syntax form. You typically insert the transpiler into your build process, similar to your code linter or your minifier.

You might wonder why you'd go to the trouble to write new syntax only to have it transpiled away to older code -- why not just write the older code directly?

There are several important reasons you should care about transpiling:

* The new syntax added to the language is designed to make your code more readable and maintainable. The older equivalents are often much more convoluted. You should prefer writing newer and cleaner syntax, not only for yourself but for all other members of the development team.
* If you transpile only for older browsers, but serve the new syntax to the newest browsers, you get to take advantage of browser performance optimizations with the new syntax. This also lets browser makers have more real-world code to test their implementations and optimizations on.
* Using the new syntax earlier allows it to be tested more robustly in the real world, which provides earlier feedback to the JavaScript committee (TC39). If issues are found early enough, they can be changed/fixed before those language design mistakes become permanent.

Here's a quick example of transpiling. ES6 adds a feature called "default parameter values." It looks like this:

```js
function foo(a = 2) {
	console.log( a );
}

foo();		// 2
foo( 42 );	// 42
```

Simple, right? Helpful, too! But it's new syntax that's invalid in pre-ES6 engines. So what will a transpiler do with that code to make it run in older environments?

```js
function foo() {
	var a = arguments[0] !== (void 0) ? arguments[0] : 2;
	console.log( a );
}
```

As you can see, it checks to see if the `arguments[0]` value is `void 0` (aka `undefined`), and if so provides the `2` default value; otherwise, it assigns whatever was passed.

In addition to being able to now use the nicer syntax even in older browsers, looking at the transpiled code actually explains the intended behavior more clearly.

You may not have realized just from looking at the ES6 version that `undefined` is the only value that can't get explicitly passed in for a default-value parameter, but the transpiled code makes that much more clear.

The last important detail to emphasize about transpilers is that they should now be thought of as a standard part of the JS development ecosystem and process. JS is going to continue to evolve, much more quickly than before, so every few months new syntax and new features will be added.

If you use a transpiler by default, you'll always be able to make that switch to newer syntax whenever you find it useful, rather than always waiting for years for today's browsers to phase out.

There are quite a few great transpilers for you to choose from. Here are some good options at the time of this writing:

* Babel (https://babeljs.io) (formerly 6to5): Transpiles ES6+ into ES5
* Traceur (https://github.com/google/traceur-compiler): Transpiles ES6, ES7, and beyond into ES5

## Non-JavaScript

So far, the only things we've covered are in the JS language itself. The reality is that most JS is written to run in and interact with environments like browsers. A good chunk of the stuff that you write in your code is, strictly speaking, not directly controlled by JavaScript. That probably sounds a little strange.

The most common non-JavaScript JavaScript you'll encounter is the DOM API. For example:

```js
var el = document.getElementById( "foo" );
```

The `document` variable exists as a global variable when your code is running in a browser. It's not provided by the JS engine, nor is it particularly controlled by the JavaScript specification. It takes the form of something that looks an awful lot like a normal JS `object`, but it's not really exactly that. It's a special `object,` often called a "host object."

Moreover, the `getElementById(..)` method on `document` looks like a normal JS function, but it's just a thinly exposed interface to a built-in method provided by the DOM from your browser. In some (newer-generation) browsers, this layer may also be in JS, but traditionally the DOM and its behavior is implemented in something more like C/C++.

Another example is with input/output (I/O).

Everyone's favorite `alert(..)` pops up a message box in the user's browser window. `alert(..)` is provided to your JS program by the browser, not by the JS engine itself. The call you make sends the message to the browser internals and it handles drawing and displaying the message box.

The same goes with `console.log(..)`; your browser provides such mechanisms and hooks them up to the developer tools.

This book, and this whole series, focuses on JavaScript the language. That's why you don't see any substantial coverage of these non-JavaScript JavaScript mechanisms. Nevertheless, you need to be aware of them, as they'll be in every JS program you write!

## Review

The first step to learning JavaScript's flavor of programming is to get a basic understanding of its core mechanisms like values, types, function closures, `this`, and prototypes.

Of course, each of these topics deserves much greater coverage than you've seen here, but that's why they have chapters and books dedicated to them throughout the rest of this series. After you feel pretty comfortable with the concepts and code samples in this chapter, the rest of the series awaits you to really dig in and get to know the language deeply.

The final chapter of this book will briefly summarize each of the other titles in the series and the other concepts they cover besides what we've already explored.
