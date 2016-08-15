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

*闭包* 是JavaScript中最重要，而又经常最少为人知的概念之一。我不会在这里涵盖更深的细节，你可以参照本系列的 *作用域与闭包*。但我想说几件关于它的事情，以便你了解它的一般概念。它将是你的JS技术结构中最重要的技术之一。

你可以认为闭包是这样一种方法：即使函数已经完成了运行，它依然可以“记住”并持续访问函数的作用域。

考虑如下代码：

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

每次调用外部的`makeAdder(..)`所返回的对内部`add(..)`函数的引用可以记住被传入`makeAdder(..)`的`x`值。现在，让我们使用`makeAdder(..)`：

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

这段代码的工作方式是：

1. 当我们调用`makeAdder(1)`时，我们得到一个指向它内部的`add(..)`的引用，它记住了`x`是`1`。我们称这个函数引用为`plusOne(..)`。
2. 当我们调用`makeAdder(10)`时，我们得到了另一个指向它内部的`add(..)`引用，它记住了`x`是`10`。我们称这个函数引用为`plusTen(..)`。
3. 当我们调用`plusOne(3)`时，它在`3`（它内部的`y`）上加`1`（被`x`记住的），于是我们得到结果`4`。
4. 当我们调用`plusTen(13)`时，它在`13`（它内部的`y`）上加`10`（被`x`记住的），于是我们得到结果`23`。

如果这看起里很奇怪和令人困惑，不要担心 —— 它确实是的！要完全理解它需要很多的练习。

但是相信我，一旦你理解了它，它就是编程中最强大最有用的技术之一。让你的大脑在闭包中煎熬一会是绝对值得的。在下一节中，我们将进一步实践闭包。

#### Modules

在JavaScript中闭包最常见的用法就是模块模式。模块让你定义对外面世界不可见的私有实现细节（变量，函数），和对外面可访问的公有API。

考虑如下代码：

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

函数`User()`作为一个外部作用域持有变量`username`和`password`，以及内部`doLogin()`函数；它们都是`User`模块内部的私有细节，是不能从外部世界访问的。

**警告：** 我们在这里没有调用`new User()`，这是有意为之的，虽然对大多数读者来说那可能更常见。`User()`只是一个函数，不是一个要被初始化的对象，所以它只是被一般地调用了。使用`new`将是不合适的，而且实际上会浪费资源。

执行`User()`创建了`User`模块的一个 *实例* —— 一个全新的作用域会被创建，而每个内部变量/函数的一个全新的拷贝也因此而被创建。我们将这个实例赋值给`fred`。如果我们再次运行`User()`，我们将会得到一个与`fred`完全分离的新的实例。

内部的`doLogin()`函数在`username`和`password`上拥有闭包，这意味着即便`User()`函数已经完成了运行，它依然持有对它们的访问权。

`publicAPI`是一个带有一个属性/方法的对象，`login`，它是一个指向内部`doLogin()`函数的引用。当我们从`User()`中返回`publicAPI`时，它就变成了我们称为`fred`的实例。

在这个时候，外部的`User()`函数已经完成了执行。一般说来，你会认为像`username`和`password`这样的内部变量将会消失。但是在这里它们不会，因为在`login()`函数里有一个闭包使它们继续存活。

这就是为什么我们可以调用`fred.login(..)` —— 和调用内部的`doLogin(..)`一样 —— 而且它依然可以访问内部变量`username`和`password`。

这样对闭包和模块模式的简单一瞥，你很有可能还是有点儿糊涂。没关系！要把它装进你的大脑确实需要花些功夫。

以此为起点，关于更多深入细节的探索可以去读本系列的 *作用域与闭包*。

## `this` Identifier

在JavaScript中另一个经常被误解的概念是`this`标识符。同样，在本系列的 *this与对象原型* 中有好几章关于它的内容，所以在这里我们只简要的介绍一下概念。

虽然`this`可能经常看起来是与“面向对象模式”有关的，但在JS中`this`是一个不同的概念。

如果一个函数在它内部拥有一个`this`引用，那么这个`this`引用通常指向一个`object`。但是指向哪一个`object`要看这个函数是如何被调用的。

重要的是要理解`this` *不是* 指函数本身，这是最常见的误解。

这是一个快速的说明：

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

关于`this`如何被设置有四个规则，它们被展示在这个代码段的最后四行中：

1. `foo()`最终在非strict模式中将`this`设置为全局对象 —— 在strict模式中，`this`将会是`undefined`而且你会在访问`bar`属性时得到一个错误 —— 所以`this.bar`的值是`global`。
2. `obj1.foo()`将`this`设置为对象`obj1`。
3. `foo.call(obj2)`将`this`设置为对象`obj2`。
4. `new foo()`将`this`设置为一个新的空对象。

底线：要搞清楚`this`指向什么，你必须检视当前的函数是如何被调用的。它将是我们刚刚看到的四种中的一种，而这将会回答`this`是什么。

**注意：** 关于`this`的更多信息，参见本系列的 *this与对象原型* 的第一和第二章。

## Prototypes

JavaScript中的原型机制十分复杂。我们在这里近仅仅扫它一眼。要了解关于它的所有细节，你需要花相当的时间来学习本系列的 *this与对象原型* 的第四到六章。

当你引用一个对象上的属性时，如果这个属性不存在，JavaScript将会自动地使用这个对象的内部原型引用来寻找另外一个对象，在它上面查询你想要的属性。你可以认为它几乎是在属性缺失时的备用对象。

从一个对象到它备用对象的内部原型引用链接发生在这个对象被创建的时候。说明它的最简单的方法是使用称为`Object.create(..)`的内建工具。

考虑如下代码：

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

将对象`foo`和`bar`以及它们的关系可视化也许会有所帮助：

<img src="fig6.png">

属性`a`实际上不存在于对象`bar`上，但是因为`bar`被原型链接到`foo`，JavaScript自动地退到对象`foo`上去寻找`a`，而且在这里找到了它。

这种链接看起来是语言的一种奇怪的特性。这种特性最常被使用的方式 —— 我会争辩说这是一种滥用 —— 是用来模拟/模仿“类”机制的“继承”。

使用原型的更自然的方式是一种称为“行为委托”的模式，在这种模式中你有意地将你的被链接的对象设计为可以从一个委托到另一个的部分所需的行为中。

**注意：** 更多关于原型和行为委托的信息，参见本系列的 *this与对象原型* 的第四到六章。

## Old & New

以我们已经介绍过的JS特性，和将在这个系列的其他部分中讲解的相当一部分特性都是新近增加的，不一定在老版本的浏览器中可用。事实上，语言规范中的一些最新特性甚至在任何稳定的浏览中都没有被实现。

那么，你拿这些新东西怎么办？你只能等上几年或者十几年直到老版本浏览器归于尘土？

这确实是许多人认为的情况，但是它不是JS健康的进步方式。

有两种主要的技术可以将新的JavaScript特性“带到”老版本的浏览器中：填补和转译。

### Polyfilling

“填补”是一个认为发明的词（由Remy Sharp创造）（https://remysharp.com/2010/10/08/what-is-a-polyfill）。它是指拿来一个新特性的定义并制造一段行为等价的代码，但是这段代码可以运行在老版本的JS环境中。

例如，ES6定义了一个称为`Number.isNaN(..)`的工具，来为检查`NaN`值提供一种准确无误的方法，同时废弃原来的`isNaN(..)`工具。这个工具可以很容易填补，因此你可开始在你的代码中使用它，而不管最终用户是否在一个ES6浏览器中。

考虑如下代码：

```js
if (!Number.isNaN) {
	Number.isNaN = function isNaN(x) {
		return x !== x;
	};
}
```

`if`语句决定着在这个工具已经存在的ES6环境中不再进行填补。如果它还不存在，我们就定义`Number.isNaN(..)`。

**注意：** 我们在这里做的检查利用了`NaN`值的怪异之处，即它们是整个语言中唯一与自己不相等的值。所以`NaN`是唯一可能使`x !== x`为`true`的值。

 并不是所有的新特性都可以完全填补。有时一种特性的大部分行为可以被填补，但是仍然存在一些小的偏差。在实现你自己的添补时你应当非常非常小心，来确保你尽可能严格地遵循语言规范。

或者更好地，使用一组你信任的，经受过检验的添补，比如那些由ES5-Shim（）和ES6-Shim（）提供的。

### Transpiling

没有任何办法可以添补语言中新增加的语法。在老版本的JS引擎中新的语法将因为不可识别/不合法而抛出一个错误。

所以更好的选择是使用一个工具将你的新版本代码转换为等价的老版本代码。这个处理通常被称为“转译”，表示转换 + 编译。

实质上，你的源代码是使用新的语法形式编写的，但是你向浏览器部署的是转移过的旧语法形式。你一般会将转译器插入到你的构建过程中，与你的代码linter和代码压缩器类似。

你可能想知道为什么要麻烦地使用新语法编写程序又将它转译为老版本代码 —— 为什么不直接编写老版本代码呢？

关于转译你应当注意几个重要的原因：

* 在语言中新加入的语法是为了是你的代码更具可读性和维护性而设计的。老版本的等价物经常会绕多得多的圈子。你应当首选编写新的和干净的语法，不仅为你自己，也为了开发团队的其他的成员。
* 如果你仅为老版本浏览器转译，而给最新的浏览器提供新语法，那么你就可以利用浏览器对新语法进行的性能优化。这也让浏览器制造商有更多真实世界的代码来测试它们的实现和优化方法。
* 提早使用新语法可以允许它在真实世界中被测试的更加健壮，这给JavaScript协会（TC39）提供了更早的反馈。如果问题被发现的足够早，他们就可以在那些语言设计错误变得无法挽回之前改变/修改它。

这是一个转译的简单例子。ES6增加了新的“默认参数值”特性。它看起来像是这样：

```js
function foo(a = 2) {
	console.log( a );
}

foo();		// 2
foo( 42 );	// 42
```

简单，对吧？也很有用！但是这种新语法在前ES6引擎中是不合法的。那么转译器将会对这段代码做什么才能使它在老版本环境中运行呢？

```js
function foo() {
	var a = arguments[0] !== (void 0) ? arguments[0] : 2;
	console.log( a );
}
```

如你所见，它检查`arguments[0]`值是否是`void 0`（也就是`undefined`），而且如果是，就提供默认值`2`；否则，它就赋值被传递的任何东西。

除了可以现在就在老版本浏览器中使用更好的语法以外，观察转以后的代码实际上更清晰地解释了意图中的行为。

仅从ES6版本的代码看来，你可能还不理解`undefined`是唯一不能作为参数默认值的明确传递的值，但是转译后的代码使这一点清楚的多。

关于转译要强调的最后一个细节是，现在它们应当被认为是JS开发的生态系统和过程中的标准部分。JS将继续以比以前快得多的速度进化，所以每几个月就会有新语法和新特性被加入进来。

如果你默认地使用一个转译器，那么你将总是可以在你发现新语法有用时，立即开始使用它，而不必为了让今天的浏览器被淘汰而等上好几年。

有好几个了不起的转译器供你选择。这是一些在本书写作时存在的好选择：

* Babel (https://babeljs.io) (formerly 6to5): Transpiles ES6+ into ES5
* Traceur (https://github.com/google/traceur-compiler): Transpiles ES6, ES7, and beyond into ES5

## Non-JavaScript

So far, the only things we've covered are in the JS language itself. The reality is that most JS is written to run in and interact with environments like browsers. A good chunk of the stuff that you write in your code is, strictly speaking, not directly controlled by JavaScript. That probably sounds a little strange.

至此，我们讨论过的所有东西都限于JS语言本身。现实是大多数JS程序都是在浏览器这样的环境中运行并与之互动的。你在你的代码中编写的很大一部分东西，严格地说，不是直接由JavaScript控制的。这听起来可能有点奇怪。

The most common non-JavaScript JavaScript you'll encounter is the DOM API. For example:

你将会遇到的最常见的非JavaScript程序是DOM API。例如：

```js
var el = document.getElementById( "foo" );
```

The `document` variable exists as a global variable when your code is running in a browser. It's not provided by the JS engine, nor is it particularly controlled by the JavaScript specification. It takes the form of something that looks an awful lot like a normal JS `object`, but it's not really exactly that. It's a special `object,` often called a "host object."

当你的代码运行在一个浏览器中时，变量`document`作为一个全局变量存在。它不是由JS引擎提供的，也不为JavaScript语言规范所控制。它采取了某种与普通JS`object`极其相似的形式，但它不是真正的`object`。它是一种特殊的`object`，经常被称为“宿主对象”。

Moreover, the `getElementById(..)` method on `document` looks like a normal JS function, but it's just a thinly exposed interface to a built-in method provided by the DOM from your browser. In some (newer-generation) browsers, this layer may also be in JS, but traditionally the DOM and its behavior is implemented in something more like C/C++.

另外，`document`上的`getElementById(..)`方法看起来像一个普通的JS函数，但它只是一个由浏览器DOM提供的内建方法的

Another example is with input/output (I/O).

Everyone's favorite `alert(..)` pops up a message box in the user's browser window. `alert(..)` is provided to your JS program by the browser, not by the JS engine itself. The call you make sends the message to the browser internals and it handles drawing and displaying the message box.

The same goes with `console.log(..)`; your browser provides such mechanisms and hooks them up to the developer tools.

This book, and this whole series, focuses on JavaScript the language. That's why you don't see any substantial coverage of these non-JavaScript JavaScript mechanisms. Nevertheless, you need to be aware of them, as they'll be in every JS program you write!

## Review

The first step to learning JavaScript's flavor of programming is to get a basic understanding of its core mechanisms like values, types, function closures, `this`, and prototypes.

Of course, each of these topics deserves much greater coverage than you've seen here, but that's why they have chapters and books dedicated to them throughout the rest of this series. After you feel pretty comfortable with the concepts and code samples in this chapter, the rest of the series awaits you to really dig in and get to know the language deeply.

The final chapter of this book will briefly summarize each of the other titles in the series and the other concepts they cover besides what we've already explored.
