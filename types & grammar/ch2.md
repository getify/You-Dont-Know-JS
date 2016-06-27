# 你不懂JS：类型与文法
# 第二章：值

`array`，`string`，和`number`是任何程序的最基础构建块儿，但是JavaScript在这些类型上有一些要么使你惊喜要么使你惊讶的独特性质。

让我们来看几种JS内建的值类型，并探讨一下我们如何才能更加全面地理解并正确地利用它们的行为。

## Arrays

和强制类型的语言相比，JavaScript的`array`只是值的容器，而这些值可以是任何类型：`string`或者`number`或者`object`，甚至是另一个`array`（这也是你得到多维数组的方法）。

```js
var a = [ 1, "2", [3] ];

a.length;		// 3
a[0] === 1;		// true
a[2][0] === 3;	// true
```

你不需要预先指定`array`的大小，你可以仅仅声明它们并加入你觉得合适的值：

```js
var a = [ ];

a.length;	// 0

a[0] = 1;
a[1] = "2";
a[2] = [ 3 ];

a.length;	// 3
```

**警告：** 在一个`array`值上使用`delete`将会从这个`array`上移除一个值槽，但就算你移除了最后一个元素，它也 **不会** 更新`length`属性，所以多加小心！我们会在第五章讨论`delete`操作符的更多细节。

关于创建“稀散”的`array`（留下或创建空的/丢失的值槽）需要小心：

```js
var a = [ ];

a[0] = 1;
// no `a[1]` slot set here
a[2] = [ 3 ];

a[1];		// undefined

a.length;	// 3
```

虽然这可以工作，但它可能会在你留下的“空值槽”上导致一些令人困惑的行为。虽然这样的值槽看起来拥有`undefined`值，但是它不会像被明确设置（`a[1] = undefined`）的值槽那样动作。更多细节可以参见第三章的“Array”。

`array`是被数字索引的（正如你期望的那样），但微妙的是它们也是对象，可以在它们上面添加`string`键/属性（但是这些属性不会计算在`array`的`length`中）：

```js
var a = [ ];

a[0] = 1;
a["foobar"] = 2;

a.length;		// 1
a["foobar"];	// 2
a.foobar;		// 2
```

然而，一个需要小心的坑是，如果一个可以被强制转换为10进制`number`的`string`值被用作键的话，它会认为你想使用`number`索引而不是一个`string`键！

```js
var a = [ ];

a["13"] = 42;

a.length; // 14
```

一般来说，向`array`添加`string`键/属性不是一个好主意。最好使用`object`来持有键/属性形式的值，而将`array`专用于严格地数字索引的值。

### Array-Likes

偶尔你需要将一个类`array`值（一个数字索引的值的集合）转换为一个真正的`array`，通常你可以对这些值的集合调用数组的工具函数（比如`indexOf(..)`，`concat(..)`，`forEach(..)`等等）。

举个例子，各种DOM查询操作会返回一个DOM元素的列表，对于我们转换的目的来说，这些列表不是真正的`array`但是也足够类似`array`。另一个常见的例子是，函数将`arugumens`对象（类`array`，但是在ES6中被废弃了）作为列表来访问它的参数。

一个进行这种转换的很常见的方法是对这个值借用`slice(..)`工具：

```js
function foo() {
	var arr = Array.prototype.slice.call( arguments );
	arr.push( "bam" );
	console.log( arr );
}

foo( "bar", "baz" ); // ["bar","baz","bam"]
```

如果`slice()`没有用其他额外的参数调用，实际上就像上面的代码段那样，它的参数的默认值会使它复制这个`array`（或者，像这里的情况，一个类`array`）。

在ES6中，还有一种称为`Array.from(..)`的内建工具可以执行相同的任务：

```js
...
var arr = Array.from( arguments );
...
```

**注意：** `Array.from(..)`拥有几种其他强大的能力，我们将在本系列的 *ES6与未来* 中涵盖它的细节。

## Strings

一个很常见的想法是，`string`实质上只是字符的`array`。虽然内部的实现可能是也可能不是`array`，但重要的是要理解JavaScript的`string`与字符的`array`确实不一样。它们的相似性几乎只是表面上的。

举个例子，让我们考虑这两个值：

```js
var a = "foo";
var b = ["f","o","o"];
```

String确实与`array`有很肤浅的相似性 -- 也就是刚才讨论的，类`array` -- 举例来说，它们都有`length`属性，一个`indexOf(..)`方法（在ES5中仅有`array`版本），和一个`concat(..)`方法：

```js
a.length;							// 3
b.length;							// 3

a.indexOf( "o" );					// 1
b.indexOf( "o" );					// 1

var c = a.concat( "bar" );			// "foobar"
var d = b.concat( ["b","a","r"] );	// ["f","o","o","b","a","r"]

a === c;							// false
b === d;							// false

a;									// "foo"
b;									// ["f","o","o"]
```

那么，它们基本上都仅仅是“字符的数组”，对吧？ **不确切**：

```js
a[1] = "O";
b[1] = "O";

a; // "foo"
b; // ["f","O","o"]
```

JavaScript的`string`是不可变的，而`array`是极其可变的。另外，在JavaScript中用位置访问字符的`a[1]`形式不总是广发合法的。老版本的IE就不允许这种语法（但是它们现在允许了）。相反，*正确的* 方式是`a.charAt(1)`.

`string`不可变性的进一步的后果是，`string`上没有一个方法是可以原地修改它的内容的，而是创建并返回一个新的`string`。与之相对的是，许多改变`array`内容的方法实际上 *是* 原地修改的。

```js
c = a.toUpperCase();
a === c;	// false
a;			// "foo"
c;			// "FOO"

b.push( "!" );
b;			// ["f","O","o","!"]
```

另外，许多`array`方法在处理`string`时非常有用，虽然这些方法不属于`string`，但我们可以对我们的`string`“借用”非变化的`array`方法：

```js
a.join;			// undefined
a.map;			// undefined

var c = Array.prototype.join.call( a, "-" );
var d = Array.prototype.map.call( a, function(v){
	return v.toUpperCase() + ".";
} ).join( "" );

c;				// "f-o-o"
d;				// "F.O.O."
```

让我们来看另一个例子：翻转一个`string`（顺带一提，这是一个JavaScript面试中常见的细小问题！）。`array`拥有一个原地的`reverse()`修改器方法，但是`string`没有：

```js
a.reverse;		// undefined

b.reverse();	// ["!","o","O","f"]
b;				// ["!","o","O","f"]
```

不幸的是，这种“借用”对`array`修改器不起作用，因为`string`是不可变的，因此它不能被原地修改：

```js
Array.prototype.reverse.call( a );
// 仍然返回一个“foo”的String对象包装器（见第三章） :(
```

另一种迂回的做法（也就是黑科技）是，将`string`转换为一个`array`，实施我们想做的操作，然后将它转回`string`。

```js
var c = a
	// 将`a`切分成一个字符的数组
	.split( "" )
	// 翻转字符的数组
	.reverse()
	// join the array of characters back to a string
	// 将字符的数组连接回一个字符串
	.join( "" );

c; // "oof"
```

如果你觉得这很难看，没错。不管怎样，对于简单的`string`它 *好用*，所以如果你需要某些快速但是“脏”的东西，像这样的方式经常能满足你。

**警告：** 小心！这种方法对含有复杂（unicode）字符（星号，多字节字符等）的`string` **不好用**。你需要支持unicode的更精巧的工具库来准确地处理这种操作。在这个问题上可以咨询Mathias Bynens的作品：*Esrever*（https://github.com/mathiasbynens/esrever）。

另外一种考虑这个问题的方式是：如果你更经常地将你的“string”基本上作为 *字符的数组* 来执行一些任务的话，也许就将它们作为`array`而不是作为`string`存储更好。你可能会因此省去很多每次都将`string`装换为`array`的麻烦。无论何时你确实需要`string`的表现形式时，你总是可以调用 *字符的* `array`的`join("")`方法。

## Numbers

JavaScript只用一种数字类型：`number`。这种类型包含“整数”值和小数值。我说“整数”时加了引号，因为JS的一个长久以来为人诟病的原因是，和其他语言不同，JS没有真正的整数。这可能在未来某个时候会改变，但是目前，我们只有`number`可用。

所以，在JS中，一个“整数”只是一个没有小数部分的小数值。也就是说，`42.0`和`42`一样是“整数”。

像大多数现代计算机语言一样，包括几乎所有的脚本语言，JavaScript的`number`的实现基于“IEEE 754”标准，通常被称为“浮点”。JavaScript明确地使用了这个标准的“双精度”（也就是“64未二进制”）格式。

在网络上有许多了不起的文章介绍了二进制浮点数如何在内存中存储的技术细节，以及这些选择的意义。因为对于理解如何在JS中正确使用`number`来说，理解内存中的位模式不是必须的，所以我们将这个话题作为练习留给那些想要进一步挖掘IEEE 754的细节的读者。

### Numeric Syntax

在JavaScript中字面数字一般用字面上的10进制小数表达：

```js
var a = 42;
var b = 42.3;
```

小数的整数部分，如果是`0`，是可选的：

```js
var a = 0.42;
var b = .42;
```

相似地，一个小数在`.`之后的小数部分，如果是`0`，是可选的：

```js
var a = 42.0;
var b = 42.;
```

**警告：** `42.`是极不常见的，如果你正在努力避免别人阅读你的代码时感到困惑，它可能不是一个好主意。但不管怎样，它是合法的。

默认情况下，大多数`number`将会以10进制小数的形式输出，并去掉末尾小数部分的`0`。所以：

```js
var a = 42.300;
var b = 42.0;

a; // 42.3
b; // 42
```

非常大或非常小的`number`将默认以指数形式输出，与`toExponential()`方法的输出一样，比如：

```js
var a = 5E10;
a;					// 50000000000
a.toExponential();	// "5e+10"

var b = a * a;
b;					// 2.5e+21

var c = 1 / a;
c;					// 2e-11
```

因为`number`值可以用`Number`对象包装器封装（见第三章），`number`值可以访问内建在`Number.prototype`上的方法（见第三章）。举个例子，`toFixed(..)`方法允许你指定一个值在表现时，带有多少位小数：

```js
var a = 42.59;

a.toFixed( 0 ); // "43"
a.toFixed( 1 ); // "42.6"
a.toFixed( 2 ); // "42.59"
a.toFixed( 3 ); // "42.590"
a.toFixed( 4 ); // "42.5900"
```

要注意的是，它的输出实际上是一个`number`的`string`表现形式，而且如果你指定的位数多于值持有的小数位数时，会在右侧补`0`。

`toPrecision(..)`很相似，但它指定的是有多少 *有效数字* 用来表现这个值：

```js
var a = 42.59;

a.toPrecision( 1 ); // "4e+1"
a.toPrecision( 2 ); // "43"
a.toPrecision( 3 ); // "42.6"
a.toPrecision( 4 ); // "42.59"
a.toPrecision( 5 ); // "42.590"
a.toPrecision( 6 ); // "42.5900"
```

你不必非得使用持有这个值的变量来访问这些方法；你可以直接在`number`的字面上访问这些方法。但你不得不小心`.`操作符。因为`.`是一个合法数字字符，如果可能的话，它会首先被翻译为`number`字面的一部分，而不是被翻译为属性访问操作符。

```js
// 不合法的语法：
42.toFixed( 3 );	// SyntaxError

// 这些都是合法的：
(42).toFixed( 3 );	// "42.000"
0.42.toFixed( 3 );	// "0.420"
42..toFixed( 3 );	// "42.000"
```

`42.toFixed(3)`是不合法的语法，因为`.`作为`42.`字面（这是合法的 -- 参见上面的讨论！）的一部分被吞掉了，因此没有`.`属性操作符来表示`.toFixed`访问。

`42..toFixed(3)`可以工作，因为第一个`.`是`number`的一部分，而第二个`.`是属性操作符。但它可能看起来很古怪，而且确实在实际的JavaScript代码中很少会看到这样的东西。实际上，在任何基本类型上直接访问方法是十分不常见的。但是不常见不意味着 *坏* 或者 *错*。

**注意：** 有一些库扩展了内建的`Number.prototype`（见第三章），使用`number`或在`number`上提供了额外的操作，所以在这些情况下，像使用`10..makeItRain()`来设定一个10秒钟的下钱雨的动画，或者其他诸如此类的傻事是完全合法的。

在技术上讲，这也是合法的（注意那个空格）：

```js
42 .toFixed(3); // "42.000"
```

但是，尤其是对`number`字面量来说，**这是特别使人糊涂的代码风格**，而且除了使其他开发者（和未来的你）糊涂意外，没有任何用处。避免它。

`number`还可以使用科学计数法的形式指定，这在表示很大的`number`时很常见，比如：

```js
var onethousand = 1E3;						// means 1 * 10^3
var onemilliononehundredthousand = 1.1E6;	// means 1.1 * 10^6
```

`number`字面量还可以使用其他进制表达，比如二进制，八进制，和十六进制。

这些格式是可以在当前版本的JavaScript中使用的：

```js
0xf3; // 十六进制的: 243
0Xf3; // 同上

0363; // 八进制的: 243
```

**注意：** 从ES6 + `strict`模式开始，不在允许`0363`这样的的八进制形式（新的形式参见后面的讨论）。`0363`在非`strict`模式下依然是允许的，但是无论如何你应当停止使用它，来拥抱未来（而且因为你现在应当在使用`strict`模式了！）。

至于ES6，下面的新形式也是合法的：

```js
0o363;		// 八进制的: 243
0O363;		// 同上

0b11110011;	// 二进制的: 243
0B11110011; // 同上
```

情为你的开发者同胞们做件好事：绝不要使用`0O363`形式。把`0`放在大写的`O`旁边就是在制造困惑。保持使用小写的谓词`0x`，`0b`，和`0o`。

### 小数值

使用二进制浮点数的最出名（臭名昭著）的副作用是（记住，这是对 **所有** 使用IEEE 754的语言都成立的——不是许多人认为/假装 *仅* 在JavaScript中存在的问题）：

```js
0.1 + 0.2 === 0.3; // false
```

从数学的意义上，我们知道这个语句应当为`true`。为什么它是`false`？

简单地说，`0.1`和`0.2`的二进制表示形式是不精确的，所以它们相加时，结果不是精确地`0.3`。而是 **非常** 接近的值：`0.30000000000000004`，但是如果你的比较失败了，“接近”是无关紧要的。

**注意：** JavaScript应当切换到可以精确表达所有值的一个不同的`number`实现吗？有些人认为应该。多年以来有许多选项出现过。但是没有一个被采纳，而且也许永远也不会。它看起来就像挥挥手然后说“已经改好那个bug了!”那么简单，但根本不是那么回事儿。如果真有这么简单，它绝对就在很久以前被改掉了。

现在的问题是，如果一些`number`不能被 *信任* 为精确的，这不是意味着我们根本不能使用`number`吗？ **当然不是。**

在一些应用程序中你需要多加小心，特别是在对付小数的时候。还有许多（也许是大多数？）应用程序只处理整数，而且，只最大只处理到几百万到几万亿。对于在JS中使用数字操作这些应用程序是，而且将总是，**非常安全** 的。

要是我们 *确实* 需要比较两个`number`，就像`0.1 + 0.2`与`0.3`，而且知道这个简单的相等测试将会失败呢？

可以接受的最常见的做法是使用一个很小的“错误舍入”值作为比较的 *容差*。这个很小的值经常被称为“机械极小值（machine epsilon）”，对于JavaScript中的那种`number`通常为`2^-52`（`2.220446049250313e-16`）。

在ES6中，使用这个容差值预定义了`Number.EPSILON`，所以你将会想要使用它，你也可以在前ES6中安全地填补这个定义：

```js
if (!Number.EPSILON) {
	Number.EPSILON = Math.pow(2,-52);
}
```

我们可以使用这个`Number.EPSILON`来比较两个`number`的相等（带有错误舍入的容差）：

```js
function numbersCloseEnoughToEqual(n1,n2) {
	return Math.abs( n1 - n2 ) < Number.EPSILON;
}

var a = 0.1 + 0.2;
var b = 0.3;

numbersCloseEnoughToEqual( a, b );					// true
numbersCloseEnoughToEqual( 0.0000001, 0.0000002 );	// false
```

可以被表示的最大的浮点值大概是`1.798e+308`（它真的非常，非常，非常大！），为你预定义为`Number.MAX_VALUE`。在小的另一端，`Number.MIN_VALUE`大概是`5e-324`，他不是负数但是非常接近于0！

### 安全整数范围

由于`number`的表示方式，对`number`的全体“整数”而言有一个“安全”的值的范围，而且它要比`Number.MAX_VALUE`小得多。

可以“安全地”被表示的最大整数（也就是说，可以保证被表示的值是实际可以明确地表示的）是`2^53 - 1`，也就是`9007199254740991`，如果你插入一些数字分隔符，可以看到它刚好超过9万亿。所以对于`number`的上限来说它确实是够TM大的。

在ES6中这个值实际上是自动预定义的，它是`Number.MAX_SAFE_INTEGER`。意料之中的是，还有一个最小值，`-9007199254740991`，它在ES6中定义为`Number.MIN_SAFE_INTEGER`。

JS程序面临对付这样大的数字的主要情况是，处理数据库中的64位ID等等。64位数字不能使用`number`类型准确表达，所以在JavaScript中必须使用`string`表现形式存储（和传递）。

谢天谢地，在这样的大ID`number`值上的数字操作（除了比较，它使用`string`也没问题）并不很常见。但是如果你 *确实* 需要在这些非常大的值上实施数学操作，目前来讲你需要使用一个 *大数字* 工具。在未来版本的JavaScript中，大数字也许会得到官方支持。

### 测试整数

测试一个值是否是整数，你可以使用ES6定义的`Number.isInteger(..)`：

```js
Number.isInteger( 42 );		// true
Number.isInteger( 42.000 );	// true
Number.isInteger( 42.3 );	// false
```

可以为前ES6填补`Number.isInteger(..)`：

```js
if (!Number.isInteger) {
	Number.isInteger = function(num) {
		return typeof num == "number" && num % 1 == 0;
	};
}
```

要测试一个值是否是 *安全整数*，使用ES6定义的`Number.isSafeInteger(..)`：

```js
Number.isSafeInteger( Number.MAX_SAFE_INTEGER );	// true
Number.isSafeInteger( Math.pow( 2, 53 ) );			// false
Number.isSafeInteger( Math.pow( 2, 53 ) - 1 );		// true
```

可以为前ES6浏览器填补`Number.isSafeInteger(..)`：

```js
if (!Number.isSafeInteger) {
	Number.isSafeInteger = function(num) {
		return Number.isInteger( num ) &&
			Math.abs( num ) <= Number.MAX_SAFE_INTEGER;
	};
}
```

### 32-bit (Signed) Integers
### 32位（有符号）整数

While integers can range up to roughly 9 quadrillion safely (53 bits), there are some numeric operations (like the bitwise operators) that are only defined for 32-bit `number`s, so the "safe range" for `number`s used in that way must be much smaller.

虽然整数可以安全地最大达到约9万亿，但有一些数字操作（比如位操作符）是仅仅为32位`number`定义的，所以对于那样使用的`number`来说，“安全范围”必须要小得多。

The range then is `Math.pow(-2,31)` (`-2147483648`, about -2.1 billion) up to `Math.pow(2,31)-1` (`2147483647`, about +2.1 billion).

这个范围是从`Math.pow(-2,31)`（`-2147483648`，大约-2.1亿）到`Math.pow(2,31)-1`（`2147483647`，大约+2.1亿）。

To force a `number` value in `a` to a 32-bit signed integer value, use `a | 0`. This works because the `|` bitwise operator only works for 32-bit integer values (meaning it can only pay attention to 32 bits and any other bits will be lost). Then, "or'ing" with zero is essentially a no-op bitwise speaking.

要强制`a`中的`number`值是32位有符号整数，使用`a | 0`。这可以工作是因为`|`位操作符仅仅对32位值起作用（意味着它可以只关注32位，而其他的位将被丢掉）。而且，和0进行“或”的位操作实质上是什么也不做。

**Note:** Certain special values (which we will cover in the next section) such as `NaN` and `Infinity` are not "32-bit safe," in that those values when passed to a bitwise operator will pass through the abstract operation `ToInt32` (see Chapter 4) and become simply the `+0` value for the purpose of that bitwise operation.

**注意：** 特定的特殊值（我们将在下一节讨论），比如`NaN`和`Infinity`不是“32位安全”的，当这些值被传入位操作符时将会通过一个抽象操作`ToInt32`（见第四章）并为了位操作而简单地变成`+0`值。

## Special Values
## 特殊值

There are several special values spread across the various types that the *alert* JS developer needs to be aware of, and use properly.

在各种类型中散布着一些特殊值，需要 *警惕* 的JS开发者小心，并正确使用。

### The Non-value Values

For the `undefined` type, there is one and only one value: `undefined`. For the `null` type, there is one and only one value: `null`. So for both of them, the label is both its type and its value.

对于`undefined`类型来说，有且仅有一个值：`undefined`。对于`null`类型来说，有且仅有一个值：`null`。所以对它们而言，这些文字既是它们的类型也是它们的值。

Both `undefined` and `null` are often taken to be interchangeable as either "empty" values or "non" values. Other developers prefer to distinguish between them with nuance. For example:

`undefined`和`null`作为“空”值或者“没有”值，经常被认为是可以互换的。另一些开发者偏好于使用微妙的区别将它们区分开。举例来讲：

* `null` is an empty value
* `null`是一个空值
* `undefined` is a missing value
* `undefined`是一个丢失的值

Or:
或者：

* `undefined` hasn't had a value yet
* `undefined`还没有值
* `null` had a value and doesn't anymore
* `null`曾经有过值但现在没有

Regardless of how you choose to "define" and use these two values, `null` is a special keyword, not an identifier, and thus you cannot treat it as a variable to assign to (why would you!?). However, `undefined` *is* (unfortunately) an identifier. Uh oh.

不管你选择如何“定义”和使用这两个值，`null`是一个特殊的关键字，不是一个标识符，因此你不能将它作为一个变量对待来给它赋值（为什么你要给它赋值呢？！）。然而，`undefined`（不幸地）是一个标识符。噢。

### Undefined

In non-`strict` mode, it's actually possible (though incredibly ill-advised!) to assign a value to the globally provided `undefined` identifier:

在非`strict`模式下，给在全局上提供的`undefined`标识符赋一个值实际上是可能的（虽然这是一个非常不好的做法！）：

```js
function foo() {
	undefined = 2; // really bad idea!
}

foo();
```

```js
function foo() {
	"use strict";
	undefined = 2; // TypeError!
}

foo();
```

In both non-`strict` mode and `strict` mode, however, you can create a local variable of the name `undefined`. But again, this is a terrible idea!

但是，在非`strict`模式和`strict`模式下，你可以创建一个名叫`undefined`局部变量。但这又是一个很差劲儿的主意！

```js
function foo() {
	"use strict";
	var undefined = 2;
	console.log( undefined ); // 2
}

foo();
```

**Friends don't let friends override `undefined`.** Ever.

**朋友永远不让朋友覆盖`undefined`。**

#### `void` Operator

While `undefined` is a built-in identifier that holds (unless modified -- see above!) the built-in `undefined` value, another way to get this value is the `void` operator.

虽然`undefined`是一个持有内建的`undefined`值的内建标识符（除非被修改——见上面的讨论！），另一个得到这个值的方法是`void`操作符。

The expression `void ___` "voids" out any value, so that the result of the expression is always the `undefined` value. It doesn't modify the existing value; it just ensures that no value comes back from the operator expression.

表达式`void __`会“躲开”任何值，所以这个表达式的结果总是`undefined`值。它不会修改任何已经存在的值；只是确保不会有值从操作符表达式中回来。

```js
var a = 42;

console.log( void a, a ); // undefined 42
```

By convention (mostly from C-language programming), to represent the `undefined` value stand-alone by using `void`, you'd use `void 0` (though clearly even `void true` or any other `void` expression does the same thing). There's no practical difference between `void 0`, `void 1`, and `undefined`.

从惯例上讲（大约是从C语言编程中发展而来），通过使用`void`来独立表现`undefined`值，你可以使用`void 0`（虽然，很明显，`void true`或者任何其他的`void`表达式都做同样的事情）。在`void 0`，`void 1`和`undefined`之间没有实际上的区别。

But the `void` operator can be useful in a few other circumstances, if you need to ensure that an expression has no result value (even if it has side effects).

但是在几种其他的环境下`void`操作符可以十分有用：如果你需要确保一个表达式没有结果值（即便它有副作用）。

For example:

举个例子：

```js
function doSomething() {
	// note: `APP.ready` is provided by our application
	if (!APP.ready) {
		// try again later
		return void setTimeout( doSomething, 100 );
	}

	var result;

	// do some other stuff
	return result;
}

// were we able to do it right away?
if (doSomething()) {
	// handle next tasks right away
}
```

Here, the `setTimeout(..)` function returns a numeric value (the unique identifier of the timer interval, if you wanted to cancel it), but we want to `void` that out so that the return value of our function doesn't give a false-positive with the `if` statement.

这里，`setTimeout(..)`函数返回一个数字值（时间间隔的唯一标识符，用于取消它自己），但是我们想`void`它，这样我们函数的返回值不会在`if`语句上给出一个错误的成立。

Many devs prefer to just do these actions separately, which works the same but doesn't use the `void` operator:

许多开发者宁愿将这些动作分开，这样的效用相同但不使用`void`操作符：

```js
if (!APP.ready) {
	// try again later
	setTimeout( doSomething, 100 );
	return;
}
```

In general, if there's ever a place where a value exists (from some expression) and you'd find it useful for the value to be `undefined` instead, use the `void` operator. That probably won't be terribly common in your programs, but in the rare cases you do need it, it can be quite helpful.

一般来说，如果有那么一个地方，有一个值存在而你发现这个值如果是`undefined`才有用，就使用`void`操作符。这可能在你的程序中不是非常常见，但如果在一些稀有的情况下你需要它，它就十分有用。

### Special Numbers

The `number` type includes several special values. We'll take a look at each in detail.

#### The Not Number, Number

Any mathematic operation you perform without both operands being `number`s (or values that can be interpreted as regular `number`s in base 10 or base 16) will result in the operation failing to produce a valid `number`, in which case you will get the `NaN` value.

`NaN` literally stands for "not a `number`", though this label/description is very poor and misleading, as we'll see shortly. It would be much more accurate to think of `NaN` as being "invalid number," "failed number," or even "bad number," than to think of it as "not a number."

For example:

```js
var a = 2 / "foo";		// NaN

typeof a === "number";	// true
```

In other words: "the type of not-a-number is 'number'!" Hooray for confusing names and semantics.

`NaN` is a kind of "sentinel value" (an otherwise normal value that's assigned a special meaning) that represents a special kind of error condition within the `number` set. The error condition is, in essence: "I tried to perform a mathematic operation but failed, so here's the failed `number` result instead."

So, if you have a value in some variable and want to test to see if it's this special failed-number `NaN`, you might think you could directly compare to `NaN` itself, as you can with any other value, like `null` or `undefined`. Nope.

```js
var a = 2 / "foo";

a == NaN;	// false
a === NaN;	// false
```

`NaN` is a very special value in that it's never equal to another `NaN` value (i.e., it's never equal to itself). It's the only value, in fact, that is not reflexive (without the Identity characteristic `x === x`). So, `NaN !== NaN`. A bit strange, huh?

So how *do* we test for it, if we can't compare to `NaN` (since that comparison would always fail)?

```js
var a = 2 / "foo";

isNaN( a ); // true
```

Easy enough, right? We use the built-in global utility called `isNaN(..)` and it tells us if the value is `NaN` or not. Problem solved!

Not so fast.

The `isNaN(..)` utility has a fatal flaw. It appears it tried to take the meaning of `NaN` ("Not a Number") too literally -- that its job is basically: "test if the thing passed in is either not a `number` or is a `number`." But that's not quite accurate.

```js
var a = 2 / "foo";
var b = "foo";

a; // NaN
b; // "foo"

window.isNaN( a ); // true
window.isNaN( b ); // true -- ouch!
```

Clearly, `"foo"` is literally *not a `number`*, but it's definitely not the `NaN` value either! This bug has been in JS since the very beginning (over 19 years of *ouch*).

As of ES6, finally a replacement utility has been provided: `Number.isNaN(..)`. A simple polyfill for it so that you can safely check `NaN` values *now* even in pre-ES6 browsers is:

```js
if (!Number.isNaN) {
	Number.isNaN = function(n) {
		return (
			typeof n === "number" &&
			window.isNaN( n )
		);
	};
}

var a = 2 / "foo";
var b = "foo";

Number.isNaN( a ); // true
Number.isNaN( b ); // false -- phew!
```

Actually, we can implement a `Number.isNaN(..)` polyfill even easier, by taking advantage of that peculiar fact that `NaN` isn't equal to itself. `NaN` is the *only* value in the whole language where that's true; every other value is always **equal to itself**.

So:

```js
if (!Number.isNaN) {
	Number.isNaN = function(n) {
		return n !== n;
	};
}
```

Weird, huh? But it works!

`NaN`s are probably a reality in a lot of real-world JS programs, either on purpose or by accident. It's a really good idea to use a reliable test, like `Number.isNaN(..)` as provided (or polyfilled), to recognize them properly.

If you're currently using just `isNaN(..)` in a program, the sad reality is your program *has a bug*, even if you haven't been bitten by it yet!

#### Infinities

Developers from traditional compiled languages like C are probably used to seeing either a compiler error or runtime exception, like "Divide by zero," for an operation like:

```js
var a = 1 / 0;
```

However, in JS, this operation is well-defined and results in the value `Infinity` (aka `Number.POSITIVE_INFINITY`). Unsurprisingly:

```js
var a = 1 / 0;	// Infinity
var b = -1 / 0;	// -Infinity
```

As you can see, `-Infinity` (aka `Number.NEGATIVE_INFINITY`) results from a divide-by-zero where either (but not both!) of the divide operands is negative.

JS uses finite numeric representations (IEEE 754 floating-point, which we covered earlier), so contrary to pure mathematics, it seems it *is* possible to overflow even with an operation like addition or subtraction, in which case you'd get `Infinity` or `-Infinity`.

For example:

```js
var a = Number.MAX_VALUE;	// 1.7976931348623157e+308
a + a;						// Infinity
a + Math.pow( 2, 970 );		// Infinity
a + Math.pow( 2, 969 );		// 1.7976931348623157e+308
```

According to the specification, if an operation like addition results in a value that's too big to represent, the IEEE 754 "round-to-nearest" mode specifies what the result should be. So, in a crude sense, `Number.MAX_VALUE + Math.pow( 2, 969 )` is closer to `Number.MAX_VALUE` than to `Infinity`, so it "rounds down," whereas `Number.MAX_VALUE + Math.pow( 2, 970 )` is closer to `Infinity` so it "rounds up".

If you think too much about that, it's going to make your head hurt. So don't. Seriously, stop!

Once you overflow to either one of the *infinities*, however, there's no going back. In other words, in an almost poetic sense, you can go from finite to infinite but not from infinite back to finite.

It's almost philosophical to ask: "What is infinity divided by infinity". Our naive brains would likely say "1" or maybe "infinity." Turns out neither is true. Both mathematically and in JavaScript, `Infinity / Infinity` is not a defined operation. In JS, this results in `NaN`.

But what about any positive finite `number` divided by `Infinity`? That's easy! `0`. And what about a negative finite `number` divided by `Infinity`? Keep reading!

#### Zeros

While it may confuse the mathematics-minded reader, JavaScript has both a normal zero `0` (otherwise known as a positive zero `+0`) *and* a negative zero `-0`. Before we explain why the `-0` exists, we should examine how JS handles it, because it can be quite confusing.

Besides being specified literally as `-0`, negative zero also results from certain mathematic operations. For example:

```js
var a = 0 / -3; // -0
var b = 0 * -3; // -0
```

Addition and subtraction cannot result in a negative zero.

A negative zero when examined in the developer console will usually reveal `-0`, though that was not the common case until fairly recently, so some older browsers you encounter may still report it as `0`.

However, if you try to stringify a negative zero value, it will always be reported as `"0"`, according to the spec.

```js
var a = 0 / -3;

// (some browser) consoles at least get it right
a;							// -0

// but the spec insists on lying to you!
a.toString();				// "0"
a + "";						// "0"
String( a );				// "0"

// strangely, even JSON gets in on the deception
JSON.stringify( a );		// "0"
```

Interestingly, the reverse operations (going from `string` to `number`) don't lie:

```js
+"-0";				// -0
Number( "-0" );		// -0
JSON.parse( "-0" );	// -0
```

**Warning:** The `JSON.stringify( -0 )` behavior of `"0"` is particularly strange when you observe that it's inconsistent with the reverse: `JSON.parse( "-0" )` reports `-0` as you'd correctly expect.

In addition to stringification of negative zero being deceptive to hide its true value, the comparison operators are also (intentionally) configured to *lie*.

```js
var a = 0;
var b = 0 / -3;

a == b;		// true
-0 == 0;	// true

a === b;	// true
-0 === 0;	// true

0 > -0;		// false
a > b;		// false
```

Clearly, if you want to distinguish a `-0` from a `0` in your code, you can't just rely on what the developer console outputs, so you're going to have to be a bit more clever:

```js
function isNegZero(n) {
	n = Number( n );
	return (n === 0) && (1 / n === -Infinity);
}

isNegZero( -0 );		// true
isNegZero( 0 / -3 );	// true
isNegZero( 0 );			// false
```

Now, why do we need a negative zero, besides academic trivia?

There are certain applications where developers use the magnitude of a value to represent one piece of information (like speed of movement per animation frame) and the sign of that `number` to represent another piece of information (like the direction of that movement).

In those applications, as one example, if a variable arrives at zero and it loses its sign, then you would lose the information of what direction it was moving in before it arrived at zero. Preserving the sign of the zero prevents potentially unwanted information loss.

### Special Equality

As we saw above, the `NaN` value and the `-0` value have special behavior when it comes to equality comparison. `NaN` is never equal to itself, so you have to use ES6's `Number.isNaN(..)` (or a polyfill). Simlarly, `-0` lies and pretends that it's equal (even `===` strict equal -- see Chapter 4) to regular positive `0`, so you have to use the somewhat hackish `isNegZero(..)` utility we suggested above.

As of ES6, there's a new utility that can be used to test two values for absolute equality, without any of these exceptions. It's called `Object.is(..)`:

```js
var a = 2 / "foo";
var b = -3 * 0;

Object.is( a, NaN );	// true
Object.is( b, -0 );		// true

Object.is( b, 0 );		// false
```

There's a pretty simple polyfill for `Object.is(..)` for pre-ES6 environments:

```js
if (!Object.is) {
	Object.is = function(v1, v2) {
		// test for `-0`
		if (v1 === 0 && v2 === 0) {
			return 1 / v1 === 1 / v2;
		}
		// test for `NaN`
		if (v1 !== v1) {
			return v2 !== v2;
		}
		// everything else
		return v1 === v2;
	};
}
```

`Object.is(..)` probably shouldn't be used in cases where `==` or `===` are known to be *safe* (see Chapter 4 "Coercion"), as the operators are likely much more efficient and certainly are more idiomatic/common. `Object.is(..)` is mostly for these special cases of equality.

## Value vs. Reference

In many other languages, values can either be assigned/passed by value-copy or by reference-copy depending on the syntax you use.

For example, in C++ if you want to pass a `number` variable into a function and have that variable's value updated, you can declare the function parameter like `int& myNum`, and when you pass in a variable like `x`, `myNum` will be a **reference to `x`**; references are like a special form of pointers, where you obtain a pointer to another variable (like an *alias*). If you don't declare a reference parameter, the value passed in will *always* be copied, even if it's a complex object.

In JavaScript, there are no pointers, and references work a bit differently. You cannot have a reference from one JS variable to another variable. That's just not possible.

A reference in JS points at a (shared) **value**, so if you have 10 different references, they are all always distinct references to a single shared value; **none of them are references/pointers to each other.**

Moreover, in JavaScript, there are no syntactic hints that control value vs. reference assignment/passing. Instead, the *type* of the value *solely* controls whether that value will be assigned by value-copy or by reference-copy.

Let's illustrate:

```js
var a = 2;
var b = a; // `b` is always a copy of the value in `a`
b++;
a; // 2
b; // 3

var c = [1,2,3];
var d = c; // `d` is a reference to the shared `[1,2,3]` value
d.push( 4 );
c; // [1,2,3,4]
d; // [1,2,3,4]
```

Simple values (aka scalar primitives) are *always* assigned/passed by value-copy: `null`, `undefined`, `string`, `number`, `boolean`, and ES6's `symbol`.

Compound values -- `object`s (including `array`s, and all boxed object wrappers -- see Chapter 3) and `function`s -- *always* create a copy of the reference on assignment or passing.

In the above snippet, because `2` is a scalar primitive, `a` holds one initial copy of that value, and `b` is assigned another *copy* of the value. When changing `b`, you are in no way changing the value in `a`.

But **both `c` and `d`** are seperate references to the same shared value `[1,2,3]`, which is a compound value. It's important to note that neither `c` nor `d` more "owns" the `[1,2,3]` value -- both are just equal peer references to the value. So, when using either reference to modify (`.push(4)`) the actual shared `array` value itself, it's affecting just the one shared value, and both references will reference the newly modified value `[1,2,3,4]`.

Since references point to the values themselves and not to the variables, you cannot use one reference to change where another reference is pointed:

```js
var a = [1,2,3];
var b = a;
a; // [1,2,3]
b; // [1,2,3]

// later
b = [4,5,6];
a; // [1,2,3]
b; // [4,5,6]
```

When we make the assignment `b = [4,5,6]`, we are doing absolutely nothing to affect *where* `a` is still referencing (`[1,2,3]`). To do that, `b` would have to be a pointer to `a` rather than a reference to the `array` -- but no such capability exists in JS!

The most common way such confusion happens is with function parameters:

```js
function foo(x) {
	x.push( 4 );
	x; // [1,2,3,4]

	// later
	x = [4,5,6];
	x.push( 7 );
	x; // [4,5,6,7]
}

var a = [1,2,3];

foo( a );

a; // [1,2,3,4]  not  [4,5,6,7]
```

When we pass in the argument `a`, it assigns a copy of the `a` reference to `x`. `x` and `a` are separate references pointing at the same `[1,2,3]` value. Now, inside the function, we can use that reference to mutate the value itself (`push(4)`). But when we make the assignment `x = [4,5,6]`, this is in no way affecting where the initial reference `a` is pointing -- still points at the (now modified) `[1,2,3,4]` value.

There is no way to use the `x` reference to change where `a` is pointing. We could only modify the contents of the shared value that both `a` and `x` are pointing to.

To accomplish changing `a` to have the `[4,5,6,7]` value contents, you can't create a new `array` and assign -- you must modify the existing `array` value:

```js
function foo(x) {
	x.push( 4 );
	x; // [1,2,3,4]

	// later
	x.length = 0; // empty existing array in-place
	x.push( 4, 5, 6, 7 );
	x; // [4,5,6,7]
}

var a = [1,2,3];

foo( a );

a; // [4,5,6,7]  not  [1,2,3,4]
```

As you can see, `x.length = 0` and `x.push(4,5,6,7)` were not creating a new `array`, but modifying the existing shared `array`. So of course, `a` references the new `[4,5,6,7]` contents.

Remember: you cannot directly control/override value-copy vs. reference -- those semantics are controlled entirely by the type of the underlying value.

To effectively pass a compound value (like an `array`) by value-copy, you need to manually make a copy of it, so that the reference passed doesn't still point to the original. For example:

```js
foo( a.slice() );
```

`slice(..)` with no parameters by default makes an entirely new (shallow) copy of the `array`. So, we pass in a reference only to the copied `array`, and thus `foo(..)` cannot affect the contents of `a`.

To do the reverse -- pass a scalar primitive value in a way where its value updates can be seen, kinda like a reference -- you have to wrap the value in another compound value (`object`, `array`, etc) that *can* be passed by reference-copy:

```js
function foo(wrapper) {
	wrapper.a = 42;
}

var obj = {
	a: 2
};

foo( obj );

obj.a; // 42
```

Here, `obj` acts as a wrapper for the scalar primitive property `a`. When passed to `foo(..)`, a copy of the `obj` reference is passed in and set to the `wrapper` parameter. We now can use the `wrapper` reference to access the shared object, and update its property. After the function finishes, `obj.a` will see the updated value `42`.

It may occur to you that if you wanted to pass in a reference to a scalar primitive value like `2`, you could just box the value in its `Number` object wrapper (see Chapter 3).

It *is* true a copy of the reference to this `Number` object *will* be passed to the function, but unfortunately, having a reference to the shared object is not going to give you the ability to modify the shared primitive value, like you may expect:

```js
function foo(x) {
	x = x + 1;
	x; // 3
}

var a = 2;
var b = new Number( a ); // or equivalently `Object(a)`

foo( b );
console.log( b ); // 2, not 3
```

The problem is that the underlying scalar primitive value is *not mutable* (same goes for `String` and `Boolean`). If a `Number` object holds the scalar primitive value `2`, that exact `Number` object can never be changed to hold another value; you can only create a whole new `Number` object with a different value.

When `x` is used in the expression `x + 1`, the underlying scalar primitive value `2` is unboxed (extracted) from the `Number` object automatically, so the line `x = x + 1` very subtly changes `x` from being a shared reference to the `Number` object, to just holding the scalar primitive value `3` as a result of the addition operation `2 + 1`. Therefore, `b` on the outside still references the original unmodified/immutable `Number` object holding the value `2`.

You *can* add properties on top of the `Number` object (just not change its inner primitive value), so you could exchange information indirectly via those additional properties.

This is not all that common, however; it probably would not be considered a good practice by most developers.

Instead of using the wrapper object `Number` in this way, it's probably much better to use the manual object wrapper (`obj`) approach in the earlier snippet. That's not to say that there's no clever uses for the boxed object wrappers like `Number` -- just that you should probably prefer the scalar primitive value form in most cases.

References are quite powerful, but sometimes they get in your way, and sometimes you need them where they don't exist. The only control you have over reference vs. value-copy behavior is the type of the value itself, so you must indirectly influence the assignment/passing behavior by which value types you choose to use.

## Review

In JavaScript, `array`s are simply numerically indexed collections of any value-type. `string`s are somewhat "`array`-like", but they have distinct behaviors and care must be taken if you want to treat them as `array`s. Numbers in JavaScript include both "integers" and floating-point values.

Several special values are defined within the primitive types.

The `null` type has just one value: `null`, and likewise the `undefined` type has just the `undefined` value. `undefined` is basically the default value in any variable or property if no other value is present. The `void` operator lets you create the `undefined` value from any other value.

`number`s include several special values, like `NaN` (supposedly "Not a Number", but really more appropriately "invalid number"); `+Infinity` and `-Infinity`; and `-0`.

Simple scalar primitives (`string`s, `number`s, etc.) are assigned/passed by value-copy, but compound values (`object`s, etc.) are assigned/passed by reference-copy. References are not like references/pointers in other languages -- they're never pointed at other variables/references, only at the underlying values.
