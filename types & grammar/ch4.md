# You Don't Know JS: Types & Grammar
# Chapter 4: Coercion

现在我们更全面地了解了JavaScript的类型和值，我们将注意力转向一个极具争议的话题：强制转换。

正如我们在第一章中提到的，关于强制转换到底是一个有用的特性，还是一个语言设计上的缺陷（或位于两者之间！），早就开始就争论不休了。如果你读过关于JS的其他书籍，你就会知道世面上那种淹没一切的 *声音*：强制转换是魔法，是邪恶的，令人困惑的，或者就是彻头彻尾的坏主意。

本着这个系列丛书的总体精神，而不是因为大家都这样做，或是你曾经被一些怪东西咬到就逃避强制转换，我认为你应当直面你不理解的东西并设法更全面地 *搞懂它*。

我们的目标是全面地探索强制转换的优点和缺点（是的，它们 *有* 优点！），这样你就能在程序中对它是否合适做出明智的决定。

## Converting Values

将一个值从一个类型明确地转换到另一个类型通常称为“类型转换（type casting）”，当这个操作隐含地完成时称为“强制转换（coercion）”（根据一个值如何被使用的规则来强制它变换类型）。

**注意：** 这可能不明显，但是JavaScript强制转换总是得到基本标量值的一种，比如`string`，`number`，或`boolean`。没有强制转换可以得到像`object`和`function`这样的复杂值。第三章讲解了“封箱”，它将一个基本类型标量值包装在它们相应的`object`中，但在准确的意义上这不是真正的强制转换。

另一种区别这些词语的常见方法是：“类型转换（type casting/conversion）”发生在静态类型语言的编译时，而“类型强制转换（type coercion）”是动态类型语言的运行时转换。

然而，在JavaScript中，大多数人将所有这些类型的转换都称为 *强制转换（coercion）*，所以我偏好的区别方式是使用“隐含强制转换（implicit coercion）”与“明确强制转换（explicit coercion）”。

其中的区别应当是很明显的：在观察代码时如果一个类型转换明显是有意为之的，那么它就是“显式强制转换”，而如果这个类型转换是做为其他操作的，不那么明显的副作用发生的，那么它就是“隐式强制转换”。

例如，考虑这两种强制转换的方式：

```js
var a = 42;

var b = a + "";			// implicit coercion

var c = String( a );	// explicit coercion
```

对于`b`来说，强制转换是隐含地发生的，因为`+`操作符组合的操作数之一是一个`string`值（`""`），这将使这个操作成为一个`string`连接，而`string`连接的一个（隐藏的）副作用将`a`中的值`42`强制转换为它的`string`等价物：`"42"`。

相比之下，`String(..)`函数使一切相当明显，它明确地取得`a`中的值，并把它强制转换为一个`string`表现。

两种方式都能达到相同的效果：从`42`变成`"42"`。但它们 *如何* 达到这种效果，才是关于JavaScript强制转换的热烈争论的核心。

**注意：** 技术上讲，这里有一些在语法形式区别之上的，行为上的微妙区别。我们将在本章稍后，“隐式：Strings <--> Numbers”一节中仔细讲解。

“明确地”，“隐含地”，或“明显地”和“隐藏的副作用”这些名词，是 *相对的*。

如果你确切地知道`a + ""`是在做什么，并且你有意地这么做来强制转换一个`string`，你可能感觉这个操作已经足够“明确了”。相反，如果你从没见过`String(..)`函数被用于`string`强制转换，那么对你来说它的行为可能看起来太过隐蔽而让你感到“隐含”。

但我们是基于一个 *大众的，充分了解，但不是专家或JS规范爱好者的* 开发者的看法来讨论“明确”与“隐含”的。无论你的程度如何，或是没有在这个范畴内准确地找到自己，你都需要根据我们在这里的观察方式，相应地调整你的角度。

记住：我们自己写代码而也只有我们自己会读它，通常是很少见的。即便你是一个精通JS里里外外的专家，也要考虑一个经验没那么丰富的队友在读你的代码时感受如何。对于他们和对于你来说，“明确”或“隐含”的意义相同吗？

## Abstract Value Operations

在我们可以探究“明确”与“隐含”强制转换之前，我们需要学习一些基本规则，是它们控制着值如何 *变成* 一个`string`，`number`，或`boolean`的。ES5语言规范的第9部分用值的变形规则定义了几种“抽象操作”（“仅供内部使用的操作”的高大上说法）。我们将特别关注于：`ToString`，`ToNumber`，和`ToBoolean`，并稍稍关注一下`ToPrimitive`。

### `ToString`

当任何一个非`string`值被强制转换为一个`string`表现形式时，这个转换的过程是由语言规范的9.8部分的`ToString`抽象操作处理的。

内建的基本类型值拥有自然的字符串化形式：`null`变为`"null"`，`undefined`变为`"undefined"`，`true`变为`"true"`。`number`一般会以你期望的自然方式表达，但正如我们在第二章中讨论的，非常小或非常大的`number`将会以指数形式表达：

```js
// multiplying `1.07` by `1000`, seven times over
var a = 1.07 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;

// seven times three digits => 21 digits
a.toString(); // "1.07e21"
```

对于普通的对象，除非你指定你自己的，默认的`toString()`（可以在`Object.prototype.toString()`找到）将返回 *internal `[[Class]]`*（见第三章），例如`"[object Object]"`。

但正如早先所展示的，如果一个对象上拥有它自己的`toString()`方法，而你又以一种类似`string`的方式使用这个对象，它的`toString()`将会被自动调用，而且这个调用的`string`结果将被使用。

**注意：** 技术上讲，一个对象被强制转换为一个`string`的方法要通过`ToPrimitive`抽象操作（ES5语言规范，9.1部分），但是那其中的微妙细节将会在本章稍后的`ToNumber`中讲解，所以我们在这里先跳过它。

数组拥有一个覆盖版本的默认`toString()`，将数组字符串化为它所有的值（每个都字符串化）的（字符串）连接，并用`","`分割每个值。

```js
var a = [1,2,3];

a.toString(); // "1,2,3"
```

重申一次，`toString()`可以明确地被调用，也可以通过在一个`string`上下文环境中使用一个非`string`来自动地被调用。

#### JSON Stringification

另一种看起来与`ToString`密切相关的操作是，使用`JSON.stringify(..)`工具将一个值序列化为一个JSON兼容的`string`值。

很重要并需要注意的是，这种字符串化与强制转换并不完全是同一种东西。但是因为它与上面讲的`ToString`规则有关联，我们将在这里稍微深入地讲解一下JSON字符串化行为。

对于最简单的值，JSON字符串化行为基本上和`toString()`转换是相同的，除了序列化的结果 *总是一个`string`*：

```js
JSON.stringify( 42 );	// "42"
JSON.stringify( "42" );	// ""42"" (a string with a quoted string value in it)
JSON.stringify( null );	// "null"
JSON.stringify( true );	// "true"
```

任何 *JSON安全* 的值都可以被`JSON.stringify(..)`字符串化。但是什么是 *JSON安全的*？任何可以用JSON表现形式合法表达的值。

考虑JSON不安全的值可能更容易一些。一些例子是：`undefined`，`function`，（ES6+）`symbol`，带有循环引用的`object`（一个对象结构中的属性引用之间造成了一个永不终结的循环）。对于标准的JSON结构来说这些都是非法的值，主要是因为他们不能移植到消费JSON值的其他语言中。

`JSON.stringify(..)`工具在遇到`undefined`，`function`，和`symbol`时将会自动地忽略它们。如果在一个`array`中遇到这样的值，它会被替换为`null`（这样数组的位置信息就不会改变）。如果在一个`object`的属性中遇到这样的值，这个属性会被简单地剔除掉。

考虑：

```js
JSON.stringify( undefined );					// undefined
JSON.stringify( function(){} );					// undefined

JSON.stringify( [1,undefined,function(){},4] );	// "[1,null,null,4]"
JSON.stringify( { a:2, b:function(){} } );		// "{"a":2}"
```

但入过你试着`JSON.stringify(..)`一个带有循环引用的`object`，就会抛出一个错误。

JSON字符串化有一个特殊行为，如果一个`object`值定义了一个`toJSON()`方法，这个方法将会被首先调用，以取得序列化的值。

如果你打算JSON字符串化一个可能含有非法JSON值的对象，或者如果这个对象中正好有不适于序列化的值，那么你就应当为它定义一个`toJSON()`方法，返回这个`object`的一个 *JSON安全* 版本。

例如：

```js
var o = { };

var a = {
	b: 42,
	c: o,
	d: function(){}
};

// create a circular reference inside `a`
o.e = a;

// would throw an error on the circular reference
// JSON.stringify( a );

// define a custom JSON value serialization
a.toJSON = function() {
	// only include the `b` property for serialization
	return { b: this.b };
};

JSON.stringify( a ); // "{"b":42}"
```

一个很常见的误解是，`toJSON()`应当返回一个JSON字符串化的表现形式。这可能是不正确的，除非你事实上想要字符串化`string`本身（通常不会！）。`toJSON()`应当返回合适的实际普通值（无论什么类型），而`JSON.stringify(..)`自己会处理字符串化。

换句话说，`toJSON()`应当被翻译为：“变为一个适用于字符串化的JSON安全的值”，不是像许多开发者错误假设的那样，“变为一个JSON字符串”。

考虑：

```js
var a = {
	val: [1,2,3],

	// probably correct!
	toJSON: function(){
		return this.val.slice( 1 );
	}
};

var b = {
	val: [1,2,3],

	// probably incorrect!
	toJSON: function(){
		return "[" +
			this.val.slice( 1 ).join() +
		"]";
	}
};

JSON.stringify( a ); // "[2,3]"

JSON.stringify( b ); // ""[2,3]""
```

在第二个调用中，我们字符串化了返回的`string`而不是`array`本身，这可能不是我们想要的。

既然我们说到了`JSON.stringify(..)`，那么就让我们来讨论一些不那么广为人知，但是仍然很有用的功能吧。

`JSON.stringify(..)`的第二个参数是可选的，它成为 *替换器（replacer）*。这个参数既可以是一个`array`也可以是一个`function`。与`toJSON()`为序列化准备一个值的方式类似，它提供一种过滤机制，指出一个`object`的哪一个属性应该或不应该被包含在序列化形式中，来自定义这个`object`的递归序列化行为。

如果 *替换器* 是一个`array`，那么它应当是一个`string`的`array`，它的每一个元素指定了允许被包含在这个`object`的序列化形式中的属性名称。如果存在一个不在这个列表中的属性，那么它就会被跳过。

如果 *替换器* 是一个`function`，那么它会为`object`本身而被调用一次，并且为这个`object`中的每个属性都被调用一次，而且每次都被传入两个参数，*key* 和 *value*。要在序列化中跳过一个 *key*，可以返回`undefined`。否则，就返回被提供的 *value*。

```js
var a = {
	b: 42,
	c: "42",
	d: [1,2,3]
};

JSON.stringify( a, ["b","c"] ); // "{"b":42,"c":"42"}"

JSON.stringify( a, function(k,v){
	if (k !== "c") return v;
} );
// "{"b":42,"d":[1,2,3]}"
```

**注意：** 在`function`*替换器* 的情况下，第一次调用时key参数`k`是`undefined`（而对象`a`本身会被传入）。`if`语句会 **过滤掉** 名称为`c`的属性。字符串化是递归的，所以数组`[1,2,3]`会将它的每一个值（`1`，`2`，和`3`）都作为`v`传递给 *替换器*，并将索引值（`0`，`1`，和`2`）作为`k`。

`JSON.stringify(..)`还可以接收第三个可选参数，称为 *填充符（space）*，在对人类友好的输出中它被用做缩进。*填充符* 可以是一个正整数，用来指示每一级缩进中应当使用多少个空格字符。或者，*填充符* 可以是一个`string`，这时每一级缩进将会使用它的前十个字符。

```js
var a = {
	b: 42,
	c: "42",
	d: [1,2,3]
};

JSON.stringify( a, null, 3 );
// "{
//    "b": 42,
//    "c": "42",
//    "d": [
//       1,
//       2,
//       3
//    ]
// }"

JSON.stringify( a, null, "-----" );
// "{
// -----"b": 42,
// -----"c": "42",
// -----"d": [
// ----------1,
// ----------2,
// ----------3
// -----]
// }"
```

记住，`JSON.stringify(..)`并不直接是一种强制转换的形式。但是，我们在这里讨论它，是由于两个与`ToString`强制转换有关联的行为：

1. `string`，`number`，`boolean`，和`null`值在JSON字符串化时，与它们通过`ToString`抽象操作的规则强制转换为`string`值的方式基本上是相同的。
2. 如果传递一个`object`值给`JSON.stringify(..)`，而这个`object`上拥有一个`toJSON()`方法，那么在字符串化之前，`toJSON()`就会被自动调用来将这个值（某种意义上）“强制转换”为 *JSON安全* 的。

### `ToNumber`

如果任何非`number`值，以一种要求它是`number`的方式被使用，比如数学操作，ES5语言规范在9.3部分定义了`ToNumber`抽象操作。

例如，`true`变为`1`而`false`变为`0`。`undefined`变为`NaN`，而（奇怪的是）`null`变为`0`。

对于一个`string`值来说，`ToNumber`工作起来很大程度上与数字字面量的规则/语法很相似（见第三章）。如果它失败了，结果将是`NaN`（而非`number`字面量中会出现的语法错误）。一个不同的例子是，在这个操作中`0`前缀的八进制数不会被作为八进制数来处理（而仅作为普通的十进制小数），虽然这样的八进制数作为`number`字面量是合法的。

**注意：** `number`字面量文法与用于`string`值的`ToNumber`间的区别极其微妙，在这里就不进一步讲解了。更多的信息可以参考ES语言规范的9.3.1部分。

对象（以及数组）将会首先被转换为它们的基本类型值的等价物，而后这个结果值（如果它还不是一个`number`基本类型）会根据刚才提到的`ToNumber`规则被强制转换为一个`number`。

为了转换为基本类型值的等价物，`ToPrimitive`抽象操作（ES5语言规范，9.1部分）将会查询这个值（使用内部的`DefaultValue`操作 —— ES5语言规范，8.12.8不分），看它有没有`valueOf()`方法。如果`valueOf()`可用并且它返回一个基本类型值，那么这个值就将用于强制转换。如果不是这样，但`toString()`可用，那么就由它来提供用于强制转换的值。

如果这两种操作都没提供一个基本类型值，就会抛出一个`TypeError`。

在ES5中，你可以创建这样一个不可强制转换的对象 —— 没有`valueOf()`和`toString()` —— 如果他的`[[Prototype]]`的值为`null`，这通常是通过`Object.create(null)`来创建的。关于`[[Prototype]]`的详细信息参见本系列的 *this与对象原型*。

**注意：** 我们会在本章稍后讲解如何强制转换至`number`，但对于下面的代码段，想象`Number(..)`函数就是那样做的。

考虑：

```js
var a = {
	valueOf: function(){
		return "42";
	}
};

var b = {
	toString: function(){
		return "42";
	}
};

var c = [4,2];
c.toString = function(){
	return this.join( "" );	// "42"
};

Number( a );			// 42
Number( b );			// 42
Number( c );			// 42
Number( "" );			// 0
Number( [] );			// 0
Number( [ "abc" ] );	// NaN
```

### `ToBoolean`

下面，让我们聊一聊在JS中`boolean`如何动作。世面上关于这个话题有 **许多的困惑和误解**，所以集中注意力！

首先而且最重要的是，JS实际上拥有`true`和`false`关键字，而且它们的行为正如你所期望的`boolean`值一样。一个常见的误解是，值`1`和`0`与`true`/`false`是相同的。虽然这可能在其他语言中是成立的，但在JS中`number`就是`number`，而`boolean`就是`boolean`。你可以将`1`强制转换为`true`（或反之），或将`0`强制转换为`false`（或反之）。但它们不是相同的。

#### Falsy Values

但这还不是故事的结尾。我们需要讨论一下，除了这两个`boolean`值以外，当你把其他值强制转换为它们的`boolean`等价物时如何动作。

所有的JavaScript值都可以被划分进两个类别：

1. 如果被强制转换为`boolean`，将成为`false`的值
2. 其它的一切值（很明显将变为`true`）

我不是在出洋相。JS语言规范定义了一个规范，给那些在强制转换为`boolean`值时将会变为`false`的值划定了一个小范围的列表。

我们如何才能知道这个列表中的值是什么？在ES5语言规范中，9.2部分定义了一个`ToBoolean`抽象操作，它讲述了对所有可能的值而言，当你试着强制转换它们为boolean时究竟会发生什么。

从那个表格中，我们得到了下面所谓的“falsy”值列表：

* `undefined`
* `null`
* `false`
* `+0`, `-0`, and `NaN`
* `""`

就是这些。如果一个值在这个列表中，它就是一个“falsy”值，而且当你在它上面进行`boolean`强制转换时它会转换为`false`。

根据逻辑上的结论，如果一个值不在这个列表中，那么它一定在另一个列表中，也就是我们称为“truthy”值的列表。但是JS没有真正定义一个“truthy”列表。它给出了一些例子，比如它说所有的对象都是truthy，但是语言规范大致上暗示着：**任何没有明确地存在于falsy列表中的东西，都是truthy**。

#### Falsy Objects

等一下，这一节的标题听起来简直是矛盾的。我刚刚才说过语言规范将所有对象称为truthy，对吧？应该没有“falsy对象”这样的东西。

这会是什么意思呢？

它可能诱使你认为它意味着一个包装了falsy值（比如`""`，`0`或`false`）的对象包装器（见第三章）。但别掉到这个陷阱中。

**Note:** That's a subtle specification joke some of you may get.


考虑下面的代码：

```js
var a = new Boolean( false );
var b = new Number( 0 );
var c = new String( "" );
```

我们知道这三个值都是包装了明显是falsy值的对象。但这些对象是作为`true`还是作为`false`动作呢？这很容易回答：

```js
var d = Boolean( a && b && c );

d; // true
```

所以，三个都作为`true`动作，这是唯一能使`d`得到`true`的方法。

**提示：** 注意包在`a && b && c`表达式外面的`Boolean( .. )` —— 你可能想知道为什么它在这儿。我们会在本章稍后回到这个话题，所以先做个心理准备。为了先睹为快，你可以自己试试如果没有`Boolean( .. )`调用而只有`d = a && b && c`时`d`是什么。

那么，如果“falsy对象” **不是包装着falsy值的对象**，它们是什么鬼东西？

刁钻的地方在于，它们可以出现在你的JS程序中，但它们实际上不是JavaScript本身的一部分。

**什么！？**

有些特定的情况，在普通的JS语义之上，浏览器已经创建了它们自己的某种 *外来* 值的行为，也就是这种“falsy对象”的想法。

一个“falsy对象”看起来和动起来都像一个普通对象（属性，等等）的值，但是当你强制转换它为一个`boolean`时，它会变为一个`false`值。

**为什么！？**

最著名的例子是`document.all`：一个 *由DOM*（不是JS引擎本身） 给你的JS程序提供的类数组（对象），它向你的JS程序暴露你页面上的元素。它 *曾经* 像一个普通对象那样动作 —— 是一个truthy。但不再是了。

`document.all`本身从来就不是“标准的”，而且从很早以前就被废弃/抛弃了。

“那他们就不能删掉它吗？” 对不起，想得不错。但愿它们能。但是世面上有太多的遗产JS代码库依赖于它。

那么，为什么使它像falsy一样动作？因为从`document.all`到`boolean`的强制转换（比如在`if`语句中）几乎总是用来检测老的，非标准的IE。

IE从很早以前就开始顺应规范了，而且在许多情况下它在推动web向前发展的作用和其他浏览器一样多，甚至更多。但是所有那些老旧的`if (document.all) { /* it's IE */ }`代码依然留在世面上，而且大多数可能永远都不会消失。所有这些遗产代码依然假设它们运行在那些给IE用户带来差劲儿的浏览体验的，几十年前的老IE上，

所以，我们不能完全移除`document.all`，但是IE不再想让`if (document.all) { .. }`代码继续工作了，这样现代IE的用户就能得到新的，符合标准的代码逻辑。

“我们应当怎么做？” “我知道了！让我们黑进JS的类型系统并假装`document.all`是falsy！”

呃。这很烂。这是一个大多数JS开发者们都不理解的疯狂的坑。但是其它的替代方案（对上面两败俱伤的问题什么都不做）还要烂得 *多那么一点点*。

所以……这就是我们得到的：由浏览器给JavaScript添加的疯狂，非标准的“falsy对象”。耶！

#### Truthy Values

回到truthy列表。到底什么是truthy值？记住：**如果一个值不在falsy列表中，它就是truthy**。

考虑下面代码：

```js
var a = "false";
var b = "0";
var c = "''";

var d = Boolean( a && b && c );

d;
```

你期望这里的`d`是什么值？它要么是`true`要么是`false`。

它是`true`。为什么？因为尽管这些`string`值的内容看起来是falsy值，但是`string`值本身都是truthy，而这是因为在falsy列表中`""`是唯一的`string`值。

那么这些呢？

```js
var a = [];				// empty array -- truthy or falsy?
var b = {};				// empty object -- truthy or falsy?
var c = function(){};	// empty function -- truthy or falsy?

var d = Boolean( a && b && c );

d;
```

是的，你猜到了，这里的`d`依然是`true`。为什么？和前面的原因一样。尽管它们看起来像，但是`[]`，`{}`，和`function(){}` *不在* falsy列表中，因此它们是truthy值。

换句话说，truthy列表是无限长的。不可能制成一个这样的列表。你只能制造一个falsy列表并查询它。

花五分钟，把falsy列表写在便利贴上，然后粘在你的电脑显示器上，或者如果你愿意就记住它。不管哪种方法，你都可以在自己需要的时候通过简单地查询一个值是否在falsy列表中，来构建一个虚拟的truthy列表。

truthy和falsy的重要性在于，理解如果一个值在被强制转换为`boolean`值的话，它将如何动作。现在你的大脑中有了这两个列表，我们可以深入强制转换的例子本身了。

## Explicit Coercion

*明确的* 强制转换指的是明显且明确的类型转换。对于大多数开发者来说，有很多类型转换的用法可以清楚地归类于这种 *明确的* 强制转换。

我们在这里的目标是，在我们的代码中指明一些模式，在这些模式中我们可以清楚明白地将一个值从一种类型转换至另一种类型，以确保不给未来将读到这段代码的开发者留下任何坑。我们越明确，后来的人就越容易读懂我们的代码，也不必费太多的力气去理解我们的意图。

关于 *明确的* 强制转换可能很难找到什么主要的不同意见，因为它与被广泛接受的静态类型语言中的类型转换的工作方式非常接近。因此，我们理所当然地认为（暂且） *明确的* 强制转换可以被认同为不是邪恶的，或没有争议的。虽然我们稍后会回到这个话题。

### Explicitly: Strings <--> Numbers

我们将从最简单，也许是最常见强制转换操作开始：将值在`string`和`number`表现形式之间进行强制转换。

为了在`string`和`number`之间进行强制转换，我们使用内建的`String(..)`和`Number(..)`函数（我们在第三章中所指的“原生构造器”），但 **非常重要的是**，我们能不在它们前面使用`new`关键字。这样，我们就不是在创建对象包装器。

取而代之的是，我们实际上在两种类型之间进行 *明确强制转换*：

```js
var a = 42;
var b = String( a );

var c = "3.14";
var d = Number( c );

b; // "42"
d; // 3.14
```

`String(..)`使用早先讨论的`ToString`操作的规则，将任意其它的值强制转换为一个基本类型的`string`值。`Number(..)`使用早先讨论过的`ToNumber`操作的规则，将任意其他的值强制转换为一个基本类型的`number`值。

我称此为 *明确的* 强制转换是因为，一般对于大多数开发者来说这是十分明显的：这些操作的最终结果是适当的类型转换。

实际上，这种用法看起来与其他的静态类型语言中的用法非常相像。

举个例子，在C/C++中，你既可以说`(int)x`也可以说`int(x)`，而且它们都将`x`中的值转换为一个整数。两种形式都是合法的，但是许多人偏向于后者，它看起来有点儿像一个函数调用。在JavaScript中，当你说`Number(x)`时，它看起来极其相似。在JS中它实际上是一个函数调用这个事实重要吗？并非如此。

除了`String(..)`和`Number(..)`，还有其他的方法可以把这些值在`string`和`number`之间进行“明确地”转换：

```js
var a = 42;
var b = a.toString();

var c = "3.14";
var d = +c;

b; // "42"
d; // 3.14
```

调用`a.toString()`在表面上是明确的（“toString”意味着“变成一个字符串”是很明白的），但是这里有一些藏起来的隐含性。`toString()`不能在像`42`这样的 *基本类型* 值上调用。所以JS会自动地将`42`“封箱”在一个对象包装器中，这样`toString()`就可以针对这个对象调用。换句话讲，你可能会叫它“明确的隐含”。

这里的`+c`是`+`操作符的 *一元操作符*（操作符只有一个操作数）形式。取代进行数学加法的是，一元的`+`明确地将它的操作数强制转换为一个`number`值。

`+c`是 *明确的* 强制转换吗？这要看你的经验和角度。如果你知道（现在你知道了！）一元`+`明确地意味着`number`强制转换，那么它就是相当明确和明显的。但是，如果你以前从没见过它，那么它看起来就极其困惑，晦涩，带有副作用，等等。

**注意：** 在开源的JS社区中，一般被接受的观点是，一元`+`是一个 *明确的* 强制转换形式。

即使你真的喜欢`+c`这种形式，你绝对会在有的地方看起来非常令人困惑。考虑下面的代码：

```js
var c = "3.14";
var d = 5+ +c;

d; // 8.14
```

一元`-`操作符也像`+`一样进行强制转换，但它还会翻转数字的符号。但是你不能放两个减号`--`来使符号翻转回来，因为那将被解释为递减操作符。取代它的是，你需要这么做：`- -"3.14"`，在两个减号之间加入空格，这将会使强制转换的结果为`3.14`。

你可能会想到所有种类的可怕组合——一个二元操作符挨着另一个操作符的一元形式。这里有另一个疯狂的例子：

```js
1 + - + + + - + 1;	// 2
```

当一个一元`+`（或`-`）紧邻其他操作符时，你应当强烈地考虑避免使用它。虽然上面的代码可以工作，但几乎全世界都认为它是一个坏主意。即使是`d = +c`（或者`d =+ c`！）都太容易与`d += c`像混淆了，而后者完全是不同的东西！

**注意：** 一元`+`的另一个极端使人困惑的地方是，被用于紧挨着另一个将要作为`++`递增操作符和`--`递减操作符的操作数。例如：`a +++b`，`a + ++b`，和`a + + +b`。更多关于`++`的信息，参见第五章的“表达式副作用”。

记住，我们正努力变的明确并 **减少** 困惑，不是把事情弄得更糟！

#### `Date` To `number`

另一个一元`+`操作符的常见用法是将一个`Date`对象强制转换为一个`number`，其结果是这个日期/时间值的unix时间戳（从世界协调时间的1970年1月1日0点开始计算，经过的毫秒数）表现形式：

```js
var d = new Date( "Mon, 18 Aug 2014 08:53:06 CDT" );

+d; // 1408369986000
```

这种习惯性用法经常用于取得当前的 *现在* 时刻的时间戳，比如：

```js
var timestamp = +new Date();
```

**注意：** 一些开发者知道一个JavaScript中的特别的“技巧”，就是在构造器调用（一个带有`new`的函数调用）中如果没有参数要传递的话，`()`是 *可选的*。所以你可能遇到`var timestamp = +new Date;`形式。然而，不是所有的开发者都同意忽略`()`可以增强可读性，因为它是一种不寻常的语法特例，只能适用于`new fn()`调用形式，而不能用于普通的`fn()`调用形式。

但强制转换不是从`Date`对象中取得时间戳的唯一方法。一个不使用强制转换的方式可能更好，因为它更加明确：

```js
var timestamp = new Date().getTime();
// var timestamp = (new Date()).getTime();
// var timestamp = (new Date).getTime();
```

但是一个 *更更好* 不使用强制转换的选择是使用ES5加入的`Date.now()`静态函数：

```js
var timestamp = Date.now();
```

而且如果你想要为老版本的浏览器填补`Date.now()`的话，也十分简单：

```js
if (!Date.now) {
	Date.now = function() {
		return +new Date();
	};
}
```

我推荐跳过与日期有关的强制转换形式。使用`Date.now()`来取得当前 *现在* 的时间戳，而使用`new Date( .. ).getTime()`来取得一个需要你指定的 *非现在* 日期/时间的时间戳。

#### The Curious Case of the `~`

一个经常被忽视并通常让人糊涂的JS强制操作符是波浪线`~`操作符（也叫“按位取反”，“比特非”）。许多理解它在做什么的人也总是想要避开它。但是为了坚持我们在本书和本系列中的精神，让我们深入并找出`~`是否有一些对我们有用的东西。

在第二章的“32位（有符号）整数”一节，我们讲解了在JS中位操作符是如何仅为32位操作定义的，这意味着我们强制它们的操作数遵循32位值的表现形式。这个规则如何发生是由`ToInt32`抽象操作（ES5语言规范，9.5部分）控制的。

`ToInt32`首先进行`ToNumber`强制转换，这就是说如果值是`"123"`，它在`ToInt32`规则实施之前会首先变成`123`。

虽然它本身没有 *技术上进行* 强制转换（因为类型没有改变），但对一些特定的特殊`number`值使用位操作符（比如`|`或`~`）会产生一种强制转换效果，这种效果的结果是一个不同的`number`值。

举例来说，让我们首先考虑惯用的空操作`0 | x`（在第二种中有展示）中使用的`|`“比特或”操作符，它实质上仅仅进行`ToInt32`转换：

```js
0 | -0;			// 0
0 | NaN;		// 0
0 | Infinity;	// 0
0 | -Infinity;	// 0
```

这些特殊的数字是不可用32位表现的（因为它们源自64位的IEEE 754标准），所以`ToInt32`将这些值的结果指定位`0`。

有争议的是，`0 | __`是否是一种`ToInt32`强制转换操作的 *明确的* 形式，还是更倾向于 *隐含*。从语言规范的角度来说，毫无疑问是 *明确的*，但是如果你没有在这样的层次上理解位操作，它就可能看起来有点像 *隐含的* 魔法。不管怎样，为了与本章中其他的断言保持一致，我们称它为 *明确的*。

那么，让我们吧注意力转回`~`。`~`操作符首先将值“强制转换”为一个32位`number`值，然后实施按位取反（翻转每一个比特位）。

**注意：** 这与`!`不仅强制转换它的值为`boolean`而且还翻转它的每一位很相似（见后面关于“一元`!`”的讨论）。

但是……什么！？为什么我们要关心被翻转的比特位？这是一些相当特殊的，微妙的东西。JS开发者需要推理个别比特位是十分少见的。

另一种考虑`~`定义的方法是，`~`源自学校中的计算机科学/离散数学：`~`进行二进制取补操作。太好了，谢谢，我完全明白了！

我们再试一次：`~x`大致与`-(x+1)`相同。这很奇怪，但是稍微容易推理一些。所以：

```js
~42;	// -(42+1) ==> -43
```

你可能还在想`~`这个鬼东西到底和什么有关，或者对于强制转换的讨论它究竟有什么要紧。让我们快速进入要点。

考虑一下`-(x+1)`。通过进行这个操作，能够产生结果`0`（或者从技术上说`-0`！）的唯一的值是什么？`-1`。换句话说，`~`用于一个范围的`number`值时，将会为输入值`-1`产生一个falsy（很容易强制转换为`false`）的`0`，而为任意其他的输入产生truthy的`number`。

为什么这要紧？

`-1`通常称为一个“哨兵值”，它基本上意味着一个在同类型值（`number`）的更大的集合中被赋予了任意的语义。在C语言中许多函数使用哨兵值`-1`，它们返回`>= 0`的值表示“成功”，返回`-1`表示“失败”。

JavaScript在定义`string`操作`indexOf(..)`时采纳了这种先例，它搜索一个子字符串，如果找到就返回它从0开始计算的索引位置，没有找到的话就返回`-1`。

这样的情况很常见：不仅仅将`indexOf(..)`作为取得位置的操作，而且作为检查一个子字符串存在/不存在于另一个`string`中的`boolean`值。这就是开发者们通常如何进行这样的检查：

```js
var a = "Hello World";

if (a.indexOf( "lo" ) >= 0) {	// true
	// found it!
}
if (a.indexOf( "lo" ) != -1) {	// true
	// found it
}

if (a.indexOf( "ol" ) < 0) {	// true
	// not found!
}
if (a.indexOf( "ol" ) == -1) {	// true
	// not found!
}
```

我感觉看着`>= 0`或`== -1`有些恶心。它基本上是一种“抽象泄漏”，这里它将底层的实现行为 —— 使用哨兵值`-1`表示“失败” —— 泄漏到我的代码中。我倒是乐意隐藏这样的细节。

现在，我们终于看到为什`~`可以帮到我们了！将`~`和`indexOf()`一起使用可以将值“强制转换”（实际上只是变形）为 **可以适当地强制转换为`boolean`的值**：

```js
var a = "Hello World";

~a.indexOf( "lo" );			// -4   <-- truthy!

if (~a.indexOf( "lo" )) {	// true
	// found it!
}

~a.indexOf( "ol" );			// 0    <-- falsy!
!~a.indexOf( "ol" );		// true

if (!~a.indexOf( "ol" )) {	// true
	// not found!
}
```

`~ `拿到`indexOf(..)`的返回值并将它变形：对于“失败”的`-1`我们得到falsy的`0`，而其他的值都是truthy。

**注意：** `~`的假想算法`-(x+1)`暗示着`~-1`是`-0`，但是实际上它产生`0`，因为底层的操作其实是按位的，不是数学操作。

技术上将，`if (~a.indexOf(..))`仍然依靠 *隐含的* 强制转换将它的结果`0`变为`false`或非零变为`true`。但总的来说，对我而言`~`更像一种 *明确的* 强制转换机制，只要你知道在这种惯用法中它的意图是什么。

我感觉这样的代码要比前面凌乱的`>= 0` / `== -1`更干净。

##### Truncating Bits

在你遇到的代码中，还有一个地方可能出现`~`：一些开发者使用双波浪线`~~`来截断一个`number`的小数部分（也就是，将它“强制转换”为一个“整数”）。这通常（虽然是错误的）被说成与调用`Math.floor(..)`的结果相同。

`~ ~`的工作方式是，第一个`~`实施`ToInt32`“强制转换”并进行按位取反，然后第二个`~`进行另一次按位取反，将每一个比特位都翻转回原来的状态。于是最终的结果就是`ToInt32`“强制转换”（也叫截断）。

**注意：** `~~`的按位双翻转，与双否定`!!`的行为非常相似，它将在稍后的“Explicitly: * --> Boolean”一节中讲解。

然而，`~~`需要一些注意/澄清。首先，它仅在32位值上可以可靠地工作。但更重要的是，它在负数上工作的方式与`Math.floor(..)`不同！

```js
Math.floor( -49.6 );	// -50
~~-49.6;				// -49
```

把`Math.floor(..)`的不同放在一边，`~~x`可以将值截断为一个（32位）整数。但是`x | 0`也可以，而且看起来还（稍微）*省事儿* 一些。

那么，为什么你可能会选择`~~x`而不是`x | 0`？操作符优先权（见第五章）：

```js
~~1E20 / 10;		// 166199296

1E20 | 0 / 10;		// 1661992960
(1E20 | 0) / 10;	// 166199296
```

正如这里给出的其他建议一样，仅在读/写这样的代码的每一个人都知道这些操作符如何工作的情况下，才将`~`和`~~`作为“强制转换”和将值变形的明确机制。

### Explicitly: Parsing Numeric Strings

将一个`string`强制转换为一个`number`的类似结果，可以通过从`string`的字符内容中解析（parsing）出一个`number`得到。然而在这种解析和我们上面讲解的类型转换之间存在着区别。

考虑下面的代码：

```js
var a = "42";
var b = "42px";

Number( a );	// 42
parseInt( a );	// 42

Number( b );	// NaN
parseInt( b );	// 42
```

从一个字符串中解析出一个数字是 *容忍* 非数字字符的 —— 从左到右，如果遇到非数字字符就停止解析 —— 而强制转换是 *不容忍* 并且会失败而得出值`NaN`。

解析不应当被视为强制转换的替代品。这两种任务虽然相似，但是有着不同的目的。但你不知道/不关心右手边可能有什么其他的非数字字符时，你可以将一个`string`作为`number`解析。当只有数字才是可接受的值，而且像`"42px"`这样的东西作为数字应当被排处时，就强制转换一个`string`（变为一个`number`）。

**提示：** `parseInt(..)`有一个孪生兄弟，`parseFloat(..)`，它（听起来）从一个字符串中的出一个浮点数。

不要忘了`parseInt(..)`工作在`string`值上。像`parseInt(..)`传递一个`number`绝对没有任何意义。传递其他任何类型也都没有意义，比如`true`， `function(){..}`或`[1,2,3]`。

如果你传入一个非`string`，你所传入的值首先将自动地被强制转换为一个`string`（见早先的“`ToString`”），这很明显是一种隐藏的 *隐含* 强制转换。在你的程序中依赖这样的行为真的是一个坏主意，所以永远也不要将`parseInt(..)`与非`string`值一起使用。

在ES5之前，`parseInt(..)`还存在另外一个坑，这曾是许多JS程序的bug的根源。如果你不传递第二个参数来制定使用哪种进制（也交基数）来翻译数字的`string`内容，`parseInt(..)`将会根据开头的字符进行猜测。

如果开头的两个字符是`"0x"`或`"0X"`，那么猜测（根据惯例）将是你想要将这个`string`翻译为一个16进制`number`。否则，如果第一个字符是`"0"`，那么猜测（也是根据管理）将是你想要将这个`string`翻译成8进制`number`。

16进制的`string`（以`0x`或`0X`开头）没那么容易搞混。但是事实证明8进制数字的猜测过于常见了。比如：

```js
var hour = parseInt( selectedHour.value );
var minute = parseInt( selectedMinute.value );

console.log( "The time you selected was: " + hour + ":" + minute);
```

看起来无害，对吧？试着在小时上选择`08`在分钟上选择`09`。你会得到`0:0`。为什么？因为`8`和`9`都不是合法的8进制数。

ES5之前的修改很简单，但是很容易忘：**总是在第二个参数上传递`10`**。这完全是安全的：

```js
var hour = parseInt( selectedHour.value, 10 );
var minute = parseInt( selectedMiniute.value, 10 );
```

在ES5中，`parseInt(..)`不再猜测八进制数了。除非你指定，否则它会假定为10进制（或者在为`"0x"`前缀猜测16进制数）。这好多了。只是要小心，如果你的代码不得不运行在前ES5环境中，你仍然需要为基数传递`10`。

#### Parsing Non-Strings

几年以前有一个挖苦JS的玩笑，使一个关于`parseInt(..)`行为的一个臭名昭著的例子备受关注，它取笑JS的这个行为：

```js
parseInt( 1/0, 19 ); // 18
```

这里面设想（但完全不合法）的断言是，“如果我传入一个无限大，并从中解析出一个整数的话，我应该得到一个无限大，不是18”。没错，JS一定是疯了才得出这个结果，对吧？

虽然这是个明显故意造成的，不真实的例子，但是让我们放纵这种疯狂一小会儿，来检视一下JS是否真的那么疯狂。

首先，这其中最明显的原罪是将一个非`string`传入了`parseInt(..)`。这是不对的。这么做是自找麻烦。但就算你这么做了，JS也会礼貌地将你传入的东西强制转换为它可以解析的`string`。

有些人可能会争论说这是一种不合理的行为，`parseInt(..)`应当拒绝在一个非`string`值上操作。它应该抛出一个错误吗？坦白地说，像Java那样。但是一想到JS应当开始在满世界抛出错误，以至于几乎每一行代码都需要用`try..catch`围起来，我就不寒而栗。

它应当返回`NaN`吗？也许。但是……要是这样呢：

```js
parseInt( new String( "42") );
```

这也应当失败吗？它是一个非`string`值啊。如果你想让`String`对象包装器被开箱成`"42"`，那么`42`先变成`"42"`，以使`42`可以被解析回来就那么不寻常吗？

我会争论说，这种可能发生的半 *明确* 半 *隐含* 的强制转换经常可以成为非常有用的东西。比如：

```js
var a = {
	num: 21,
	toString: function() { return String( this.num * 2 ); }
};

parseInt( a ); // 42
```

事实上`parseInt(..)`将它的值强制转换为`string`来实施解析是十分合理的。如果你传垃圾进去，那么你就会得到垃圾，不要责备垃圾桶 —— 它只是忠实地尽自己的责任。

那么，如果你传入像`Infinity`（很明显是`1 / 0`的结果）这样的值，对于它的强制转换来说哪种`string`表现形式最有道理呢？我脑中只有两种合理的选择：`"Infinity"`和`"∞"`。JS选择了`"Infinity"`。我很高兴它这么选。

我认为在JS中 **所有的值** 都有某种默认的`string`表现形式是一件好事，这样它们就不是我们不能调试和推理的神秘黑箱了。

现在，关于19进制呢？很明显，这完全是伪命题和造作。没有真实的JS程序使用19进制。那太荒谬了。但是，让我们再一次放任这种荒谬。在19进制中，合法的数字字符是`0` - `9`和`a` - `i`（大小写无关）。

那么，回到我们的`parseInt( 1/0, 19 )`例子。它实质上是`parseInt( "Infinity", 19 )`。它如何解析？第一个字符是`"I"`，在愚蠢的19进制中是值`18`。第二个字符`"n"`不再合法的数字字符集内，所以这样的解析就礼貌地停止了，就像它在`"42px"`中遇到`"p"`那样。

结果呢？`18`。正如它应该的那样。对JS来说，并非一个错误或者`Infinity`本身，而是将我们带到这里的一系列的行为才是 **非常重要** 的，不应当那么简单地被丢弃。

其他关于`parseInt(..)`行为的，令人吃惊但又十分合理的例子还包括：

```js
parseInt( 0.000008 );		// 0   ("0" from "0.000008")
parseInt( 0.0000008 );		// 8   ("8" from "8e-7")
parseInt( false, 16 );		// 250 ("fa" from "false")
parseInt( parseInt, 16 );	// 15  ("f" from "function..")

parseInt( "0x10" );			// 16
parseInt( "103", 2 );		// 2
```

其实`parseInt(..)`在它的行为上是相当可预见和一致的。如果你正确地使用它，你就能得到合理的结果。如果你不正确地使用它，那么你得到的疯狂结果并不是JavaScript的错。

### Explicitly: * --> Boolean

现在，我们来检视从任意的非`boolean`值到一个`boolean`值的强制转换。

正如上面的`String(..)`和`Number(..)`，`Boolean(..)`（当然，不带`new`！）是强制进行`ToBoolean`转换的明确方法：

```js
var a = "0";
var b = [];
var c = {};

var d = "";
var e = 0;
var f = null;
var g;

Boolean( a ); // true
Boolean( b ); // true
Boolean( c ); // true

Boolean( d ); // false
Boolean( e ); // false
Boolean( f ); // false
Boolean( g ); // false
```

虽然`Boolean(..)`是非常明确的，但是它并不常见也不为人所惯用。

正如一元`+`操作符将一个值强制转换为一个`number`（参见上面的讨论），一元的`!`否定操作符可以将一个值明确地强制转换为一个`boolean`。问题是它还将值从truthy翻转为falsy，或反之。所以，大多数JS开发者使用`!!`双否定操作符进行`boolean`强制转换，因为第二个`!`将会把它翻转回原本的true或false：

```js
var a = "0";
var b = [];
var c = {};

var d = "";
var e = 0;
var f = null;
var g;

!!a;	// true
!!b;	// true
!!c;	// true

!!d;	// false
!!e;	// false
!!f;	// false
!!g;	// false
```

没有`Boolean(..)`或`!!`的话，任何这些`ToBoolean`强制转换都将 *隐含地* 发生，比如在一个`if (..) ..`语句这样使用`boolean`的上下文中。但这里的目标是，明确地强制一个值成为`boolean`来使`ToBoolean`强制转换的意图显得明明白白。

另一个`ToBoolean`强制转换的用例是，如果你想在数据结构的JSON序列化中强制转换一个`true`/`false`：

```js
var a = [
	1,
	function(){ /*..*/ },
	2,
	function(){ /*..*/ }
];

JSON.stringify( a ); // "[1,null,2,null]"

JSON.stringify( a, function(key,val){
	if (typeof val == "function") {
		// force `ToBoolean` coercion of the function
		return !!val;
	}
	else {
		return val;
	}
} );
// "[1,true,2,true]"
```

如果你是从Java来到JavaScript的话，你可能会认得这个惯用法：

```js
var a = 42;

var b = a ? true : false;
```

`? :`三元操作符将会测试`a`的真假，然后根据这个测试的结果相应地将`true`或`false`赋值给`b`。

表面上，这个惯用法看起来是一种 *明确的* `ToBoolean`类型强制转换形式，因为很明显它操作的结果要么是`true`要么是`false`。

然而，这里有一个隐藏的 *隐含* 强制转换，就是表达式`a`不得不首先被强制转换为`boolean`来进行真假测试。我称这种惯用法为“明确地隐含”。另外，我建议你在JavaScript **完全避免这种惯用法**。它不会提供真正的好处，而且会让事情变得更糟。

对于 *明确的* 强制转换`Boolean(a)`和`!!a`是好得多的选项。

## Implicit Coercion

*隐含的* 强制转换是指这样的类型转换：它们是隐藏的，没有明显的由于其他的动作隐含地发生的副作用。换句话话说，任何（对你）不明显的类型转换都是 *隐含的强制转换*。

虽然 *明确的* 强制转换的目的很明白，但是这可能 *太过* 明显 —— *隐含的* 强制转换拥有相反的目的：使代码更难理解。

从表面上来看，我相信这就是许多关于强制转换的愤怒的源头。绝大多数关于“JavaScript强制转换”的抱怨实际上都指向了（不管他们是否理解它） *隐含的* 强制转换。

**注意：** Douglas Crockford，*"JavaScript: The Good Parts"* 的作者，在许多会议和他的作品中声称应当避免JavaScript强制转换。但看起来他的意思是 *隐含的* 强制转换是不好的（以他的意见）。然而，如果你读他自己的代码的话，你会发现相当多的强制转换的例子，*明确* 和 *隐含* 都有！事实上，他的担忧主要在于`==`操作，但正如你将在本章中看到的，那只是强制转换机制的一部分。

那么，**隐含强制转换** 是邪恶的吗？它很危险吗？它是JavaScript设计上的缺陷吗？我们应该尽一切力量避免它吗？

我打赌大多数读者都倾向于踊跃地欢呼，“是的！”

**别那么着急**。听我把话说完。

让我们在 *隐含的* 强制转换是什么，和可以是什么这个问题上采取一个不同的角度，而不是仅仅说它是“好的明确强制转换的反面”。这太过狭隘，而且忽视了一个重要的微妙细节。

让我们将 *隐含的* 强制转换的目的定义为：为了减少搞乱我们代码的繁冗，模板代码，和/或不必要的实现细节，不使它们的噪音掩盖更重要的意图，

### Simplifying Implicitly

在我们进入JavaScript以前，我建议使用某个理论上是强类型的语言的假想代码来展示一下：

```js
SomeType x = SomeType( AnotherType( y ) )
```

在这个例子中，我在`y`中有一些任意类型的值，想把它转换为`SomeType`类型。问题是，这种语言不能直接从当前`y`的类型走到`SomeType`。它需要一个中间步骤，它首先转换为`AnotherType`，然后从`AnotherType`转换到`SomeType`。

现在，要是这种语言（或者你可用这种语言创建自己的定义）确实允许你这么说呢：

```js
SomeType x = SomeType( y )
```

难道一般来说你不会同意我们简化了这里的类型转换，降低了中间转换步骤的无谓的“噪音”吗？我的意思是，在这段代码的这一点上，能看到并处理`y`先变为`AnotherType`然后在变为`SomeType`的事实，*真的* 是很重要的一件事吗？

有些人可能会争辩，至少在某些环境下，是的。但我想我可以做出相同的争辩说，在许多其他的环境下，不管是语言本身的还是我们自己的抽象，这样的简化通过抽象或隐藏这些细节 **确实增强了代码的可读性**。

毫无疑问，在幕后的某些地方，那个中间的步骤依然是发生的。但如果这样的细节在视野中隐藏起来，我们就可以将使`y`变为类型`SomeType`作为一个泛化操作来推理，并隐藏混乱的细节。

虽然不是一个完美的类比，我要在本章剩余部分争论的是，JS的 *隐含的* 强制转换可以被认为是给你的代码提供了一个类似的辅助。

但是，**很重要的是**，这不是一个无边界的，绝对的宣言。就对有许多 *邪恶的东西* 潜伏在 *隐含* 强制转换周围，它们对你的代码造成的损害要比任何潜在的可读性改善厉害的多。很清楚，我们不得不学习如何避免这样的结构，是我们不会用各种bug来毒害我们的代码。

许多开发者相信，如果一个机制可以做某些有用的事儿 **A**，但也可以被滥用或误用来做某些可怕的事儿 **Z**，那么我们就应当将这种机制整个儿扔掉，仅仅是为了安全。

我对你的鼓励是：不要安心于此。不要“把孩子跟洗澡水一起泼出去”。不要因为你只见到过它的“坏的一面”就假设 *隐含* 强制转换都是坏的。我认为这里有“好的一面”，而我想要帮助和启发你们更多的人找到并接纳它们！

### Implicitly: Strings <--> Numbers

在本章的早先，我们探索了`string`和`number`值之间的 *明确* 强制转换。现在，让我们使用 *隐含* 强制转换的方式探索相同的任务。但在我们开始之前，我们不得不检视一些将会 *隐含地* 发生强制转换的操作的微妙之处。

为了服务于`number`的相加和`string`的连接两个目的，`+`操作符被重载了。那么JS如何知道你想用的是哪一种操作呢？考虑下面的代码：

```js
var a = "42";
var b = "0";

var c = 42;
var d = 0;

a + b; // "420"
c + d; // 42
```

是什么不同导致了`"420"`和`42`？一个常见的误解是，这个不同之处在于操作数之一或两者是否是一个`string`，这意味着`+`将假设`string`连接。虽然这有一部分是对的，但实际上要比这更复杂。

考虑：

```js
var a = [1,2];
var b = [3,4];

a + b; // "1,23,4"
```

两个操作数都不是`string`，但很明显它们都被强制转换为`string`然后启动了`string`连接。那么到底发生了什么？

（**警告：** 语言规范式的深度细节就要来了，如果这会吓到你就跳过下面两段！）

-----

根据ES5语言规范的11.6.1部分，`+`的算法是（当一个操作数是`object`值时），如果两个操作数之一已经是一个`string`，或者下列步骤产生一个`string`表达形式，`+`将会进行连接。所以，当`+`的两个操作数之一收到一个`object`（包括`array`）时，它首先在这个值上调用`ToPrimitive`抽象操作（9.1部分），而它会带着`number`的上下文环境提示来调用`[[DefaultValue]]`算法（8.12.8部分）。

如果你仔细观察，你会发现这个操作现在和`ToNumber`抽象操作处理`object`的过程是一样的（参见早先的“`ToNumber`”一节）。在`array`上的`valueOf()`操作将会在产生一个简单基本类型时失败，于是它掉入一个`toString()`表现形式。两个`array`因此分别变成了`"1,2"`和`"3,4"`。现在，`+`就如你通常期望的那样连接这两个`string`：`"1,23,4"`。

-----

让我们把这些乱七八糟的细节放在一边，回到一个早前的，简化的解释：如果`+`的两个操作数之一是一个`string`（或在上面的步骤中成为一个`string`），那么操作就会是`string`连接。否则，它总是数字加法。

**注意：** 关于强制转换，一个经常被引用的坑是`[] + {}`和`{} + []`，这两个表达式的结果分别是`"[object Object]"`和`0`。虽然对此有更多的东西要讲，但是我们将在第五章的“Block”中讲解这些细节。

这对 *隐含* 强制转换意味着什么？

你可以简单地通过把`number`和空`string``""`“相加”来把一个`number`强制转换为一个`string`：

```js
var a = 42;
var b = a + "";

b; // "42"
```

**提示：** 使用`+`操作符的数字加法是可交换的，这意味着`2 + 3`与`3 + 2`是相同的。使用`+`的字符串连接很明显通常不是可交换的，**但是** 对于`""`的特定情况，它实质上是可交换的，因为`a + ""`会`"" + a`产生相同的结果。

使用一个`+ ""`操作将`number`（*隐含地*）强制转换为`string`是极其常见/惯用的。事实上，有趣的是，一些在口头上批评 *隐含* 强制转换得最严厉的人仍然在他们自己的代码中使用这种方式，而不是使用它的 *明确的* 替代形式。

在 *隐含* 强制转换的有用形式中，**我认为这是一个很棒的例子**，尽管这种机制那么频繁地被人诟病！

将`a + ""`这种 *隐含的* 强制转换与我们早先的`String(a)`*明确的* 强制转换的例子相比较，有一个另外的需要小心的奇怪之处。由于`ToPrimitive`抽象操作的工作方式，`a + ""`在值`a`上调用`valueOf()`，它的返回值再最终通过内部的`ToString`抽象操作转换为一个`string`。但是`String(a)`只直接调用`toString()`。

两种方式的最终结果都是一个`string`，但如果你使用一个`object`而不是一个普通的基本类型`number`的值，你可能不一定得到 *相同的* `string`值！

考虑：

```js
var a = {
	valueOf: function() { return 42; },
	toString: function() { return 4; }
};

a + "";			// "42"

String( a );	// "4"
```

一般来说这样的坑不会咬到你，除非你真的试着创建令人困惑的数据结构和操作，但如果你为某些`object`同时定义了你自己的`valueOf()`和`toString()`方法，你就应当小心，因为你强制转换这些值的方式将影响到结果。

那么另外一个方向呢？我们如何将一个`string` *隐含强制转换* 为一个`number`？

```
var a = "3.14";
var b = a - 0;

b; // 3.14
```

`-`操作符是仅为数字减法定义的，所以`a - 0`强制`a`的值被转换为一个`number`。虽然少见得多，`a * 1`或`a / 1`也会得到相同的结果，因为这些操作符也是仅为数字操作定义的。

那么对`-`操作符使用`object`值会怎样呢？和上面的`+`的故事相似：

```js
var a = [3];
var b = [1];

a - b; // 2
```

两个`array`值都不得不变为`number`，但它们首先会被强制转换为`string`（使用意料之中的`toString()`序列化），然后再强制转换为`number`，以便`-`减法操作可以实施。

那么，`string`和`number`值之间的 *隐含* 强制转换还是你总是在恐怖故事当中听到的丑陋怪物吗？我个人不这么认为。

比较`b = String(a)`（*明确的*）和`b = a + ""`（*隐含的*）。我认为在你的代码中会出现两种方式都有用的情况。当然`b = a + ""`在JS程序中更常见一些，不管一般意义上 *隐含* 强制转换的好处或害处的 *感觉* 如何，他都提供了自己的用途。

### Implicitly: Booleans --> Numbers

I think a case where *implicit* coercion can really shine is in simplifying certain types of complicated `boolean` logic into simple numeric addition. Of course, this is not a general-purpose technique, but a specific solution for specific cases.

我认为 *隐含* 强制转换可以真正闪光的一个情况是，将特定类型的负载`boolean`逻辑简化为简单的数字加法。当然，这不是一个通用的技术，而是一个特定情况的特定解决方法。

Consider:

考虑：

```js
function onlyOne(a,b,c) {
	return !!((a && !b && !c) ||
		(!a && b && !c) || (!a && !b && c));
}

var a = true;
var b = false;

onlyOne( a, b, b );	// true
onlyOne( b, a, b );	// true

onlyOne( a, b, a );	// false
```

This `onlyOne(..)` utility should only return `true` if exactly one of the arguments is `true` / truthy. It's using *implicit* coercion on the truthy checks and *explicit* coercion on the others, including the final return value.

这个`onlyOne(..)`工具应当仅在正好有一个参数是`true`/truthy时返回`true`。它在truthy的检查上使用 *隐含的* 强制转换，而在其他的地方使用 *明确的* 强制转换，包括最后的返回值。

But what if we needed that utility to be able to handle four, five, or twenty flags in the same way? It's pretty difficult to imagine implementing code that would handle all those permutations of comparisons.

但如果我们需要这个工具能够以相同的方式处理四个，五个，或者二十个标志值呢？很难想象处理所有那些比较的排列组合的实现代码。

But here's where coercing the `boolean` values to `number`s (`0` or `1`, obviously) can greatly help:

但这里是`boolean`值到`number`（很明显，`0`或`1`）的强制转换可以提供巨大帮助的地方：

```js
function onlyOne() {
	var sum = 0;
	for (var i=0; i < arguments.length; i++) {
		// skip falsy values. same as treating
		// them as 0's, but avoids NaN's.
		if (arguments[i]) {
			sum += arguments[i];
		}
	}
	return sum == 1;
}

var a = true;
var b = false;

onlyOne( b, a );				// true
onlyOne( b, a, b, b, b );		// true

onlyOne( b, b );				// false
onlyOne( b, a, b, b, b, a );	// false
```

**Note:** Of course, instead of the `for` loop in `onlyOne(..)`, you could more tersely use the ES5 `reduce(..)` utility, but I didn't want to obscure the concepts.

**注意：** 当让，除了在`onlyOne(..)`中的`for`循环，你可以更简洁地使用ES5的`reduce(..)`工具，但我不想因此而模糊概念。

What we're doing here is relying on the `1` for `true`/truthy coercions, and numerically adding them all up. `sum += arguments[i]` uses *implicit* coercion to make that happen. If one and only one value in the `arguments` list is `true`, then the numeric sum will be `1`, otherwise the sum will not be `1` and thus the desired condition is not met.

我们在这里做的事情有赖于`true`/truthy的强制转换结果为`1`，并将它们作为数字加起来。`sum += arguments[i]`通过 *隐含的* 强制转换使这发生。如果在`arguments`列表中有且仅有一个值为`true`，那么这个数字的和将是`1`，否则和就不是`1`而不能使期望的条件成立。

We could of course do this with *explicit* coercion instead:

我们当然本可以使用 *明确的* 强制转换：

```js
function onlyOne() {
	var sum = 0;
	for (var i=0; i < arguments.length; i++) {
		sum += Number( !!arguments[i] );
	}
	return sum === 1;
}
```

We first use `!!arguments[i]` to force the coercion of the value to `true` or `false`. That's so you could pass non-`boolean` values in, like `onlyOne( "42", 0 )`, and it would still work as expected (otherwise you'd end up with `string` concatenation and the logic would be incorrect).

我们首先使用`!!arguments[i]`来将这个值强制转换为`true`或`false`。这样你就可以传入非`boolean`值了，而且它依然可以如意料的那样工作（要不然，你将会得到`string`连接，而且逻辑也不正确）。

Once we're sure it's a `boolean`, we do another *explicit* coercion with `Number(..)` to make sure the value is `0` or `1`.

一旦我们确认它是一个`boolean`，我们就使用`Number(..)`进行另一个 *明确的* 强制转换来确保值是`0`或`1`。

Is the *explicit* coercion form of this utility "better"? It does avoid the `NaN` trap as explained in the code comments. But, ultimately, it depends on your needs. I personally think the former version, relying on *implicit* coercion is more elegant (if you won't be passing `undefined` or `NaN`), and the *explicit* version is needlessly more verbose.

这个工具的 *明确* 强制转换形式“更好”吗？它确实像代码注释中解释的那样避开了`NaN`的陷阱。但是，这最终要看你的需要。我个人认为前一个版本，依赖于 *隐含的* 强制转换更优雅（如果你不传入`undefined`或`NaN`），而 *明确的* 版本是一种不必要的繁冗。

But as with almost everything we're discussing here, it's a judgment call.

但与我们在这里讨论的几乎所有东西一样，这是一个主观判断。

**Note:** Regardless of *implicit* or *explicit* approaches, you could easily make `onlyTwo(..)` or `onlyFive(..)` variations by simply changing the final comparison from `1`, to `2` or `5`, respectively. That's drastically easier than adding a bunch of `&&` and `||` expressions. So, generally, coercion is very helpful in this case.

**注意：** 不管是 *隐含的* 还是 *明确的* 方式，你可以通过将最后的比较从`1`改为`2`或`5`，来分别很容易地制造`onlyTwo(..)`或`onlyFive(..)`。这要比添加一大堆`&&`和`||`表达式要简单太多了。所以，一般来说，在这种情况下强制转换非常有用。

### Implicitly: * --> Boolean

Now, let's turn our attention to *implicit* coercion to `boolean` values, as it's by far the most common and also by far the most potentially troublesome.

现在，让我们将注意力转向目标为`boolean`值的 *隐含* 强制转换上，这是目前最常见，并且还是目前潜在的最麻烦的一种。

Remember, *implicit* coercion is what kicks in when you use a value in such a way that it forces the value to be converted. For numeric and `string` operations, it's fairly easy to see how the coercions can occur.

记住，*隐含的* 强制转换是当你以强制一个值被转换的方式使用这个值时才启动的。对于数字和`string`操作，很容易就能看出这种强制转换是如何发生的。

But, what sort of expression operations require/force (*implicitly*) a `boolean` coercion?

但是，哪个种类的表达式操作要求/强制一个（*隐含的*）`boolean`转换呢？

1. The test expression in an `if (..)` statement.
1. 在一个`if (..)`语句中的测试表达式。
2. The test expression (second clause) in a `for ( .. ; .. ; .. )` header.
2. 在一个`for ( .. ; .. ; .. )`头部的测试表达式（第二个子句）。
3. The test expression in `while (..)` and `do..while(..)` loops.
3. 在`while (..)`和`do..while(..)`循环中的测试表达式。
4. The test expression (first clause) in `? :` ternary expressions.
4. 在`? :`三元表达式中的测试表达式（第一个子句）。
5. The left-hand operand (which serves as a test expression -- see below!) to the `||` ("logical or") and `&&` ("logical and") operators.
5. `||`（“逻辑或”）和`&&`（“逻辑与”）操作符左手边的操作数（它用做测试表达式——见下面的讨论！）。

Any value used in these contexts that is not already a `boolean` will be *implicitly* coerced to a `boolean` using the rules of the `ToBoolean` abstract operation covered earlier in this chapter.

在这些上下文环境中使用的，任何还不是`boolean`的值，将通过本章早先讲解的`ToBoolean`抽象操作的规则，被 *隐含地* 强制转换为一个`boolean`

Let's look at some examples:

我们来看一些例子：

```js
var a = 42;
var b = "abc";
var c;
var d = null;

if (a) {
	console.log( "yep" );		// yep
}

while (c) {
	console.log( "nope, never runs" );
}

c = d ? a : b;
c;								// "abc"

if ((a && d) || c) {
	console.log( "yep" );		// yep
}
```

In all these contexts, the non-`boolean` values are *implicitly coerced* to their `boolean` equivalents to make the test decisions.

在所有这些上下文环境中，非`boolean`值被 *隐含地强制转换* 为它们的`boolean`等价物，来决定测试的结果。

### Operators `||` and `&&`

It's quite likely that you have seen the `||` ("logical or") and `&&` ("logical and") operators in most or all other languages you've used. So it'd be natural to assume that they work basically the same in JavaScript as in other similar languages.

很可能你已经在你用过的大多数或所有其他语言中见到过`||`（“逻辑或”）和`&&`（“逻辑与”）操作符了。所以假设他们在JavaScript中的工作方式和其他类似的语言基本上相同是很自然的。

There's some very little known, but very important, nuance here.

这里有一个少为人知的，但很重要的，微妙细节。

In fact, I would argue these operators shouldn't even be called "logical ___ operators", as that name is incomplete in describing what they do. If I were to give them a more accurate (if more clumsy) name, I'd call them "selector operators," or more completely, "operand selector operators."

其实，我会争辩这些操作符甚至不应当被称为“逻辑__操作符”，因为这样的名称没有完整地描述它们在做什么。如果让我给它们一个更准确的（更蹩脚的）名称，我会叫它们“选择器操作符”或更完整的，“操作数选择器操作符”。

Why? Because they don't actually result in a *logic* value (aka `boolean`) in JavaScript, as they do in some other languages.

为什么？因为在JavaScript中它们实际上不会得出一个 *逻辑* 值（也就是`boolean`），这与它们在其他的语言中的表现不同。

So what *do* they result in? They result in the value of one (and only one) of their two operands. In other words, **they select one of the two operand's values**.

那么它们到底得出什么？他们得出两个操作数中的一个（而且仅有一个）。换句话说，**它们在两个操作数的值中选择一个**。

Quoting the ES5 spec from section 11.11:

引用ES5语言规范的11.11部分：

> The value produced by a && or || operator is not necessarily of type Boolean. The value produced will always be the value of one of the two operand expressions.

> 一个&&或||操作符产生的值不见得是Boolean类型。这个产生的值将总是两个操作数表达式其中之一的值。

Let's illustrate:

让我们展示一下：

```js
var a = 42;
var b = "abc";
var c = null;

a || b;		// 42
a && b;		// "abc"

c || b;		// "abc"
c && b;		// null
```

**Wait, what!?** Think about that. In languages like C and PHP, those expressions result in `true` or `false`, but in JS (and Python and Ruby, for that matter!), the result comes from the values themselves.

**等一下，什么！？** 想一想。在像C和PHP这样的语言中，这些表达式结果为`true`或`false`，而在JS中（就此而言还有Python和Ruby！），结果来自于值本身。

Both `||` and `&&` operators perform a `boolean` test on the **first operand** (`a` or `c`). If the operand is not already `boolean` (as it's not, here), a normal `ToBoolean` coercion occurs, so that the test can be performed.

`||`和`&&`操作符都在 **第一个操作数**（`a`或`c`） 上进行`boolean`测试。如果这个操作数还不是`boolean`（就像在这里一样），就会发生一次正常的`ToBoolean`强制转换，这样测试就可以进行了。

For the `||` operator, if the test is `true`, the `||` expression results in the value of the *first operand* (`a` or `c`). If the test is `false`, the `||` expression results in the value of the *second operand* (`b`).

对于`||`操作符，如果测试结果为`true`，`||`表达式就将 *第一个操作数* 的值（`a`或`c`）作为结果。如果测试结果为`false`，`||`表达式就将 *第二个操作数* 的值（`b`）作为结果。

Inversely, for the `&&` operator, if the test is `true`, the `&&` expression results in the value of the *second operand* (`b`). If the test is `false`, the `&&` expression results in the value of the *first operand* (`a` or `c`).

相反地，对于`&&`操作符，如果测试结果为`true`，`&&`表达式将 *第二个操作数* 的值（`b`）作为结果。如果测试结果为`false`，那么`&&`表达式就将 *第一个操作数* 的值（`a`或`c`）作为结果。

The result of a `||` or `&&` expression is always the underlying value of one of the operands, **not** the (possibly coerced) result of the test. In `c && b`, `c` is `null`, and thus falsy. But the `&&` expression itself results in `null` (the value in `c`), not in the coerced `false` used in the test.

`||`或`&&`表达式的结果总是两个操作数之一的底层值，**不是**（可能是被强制转换来的）测试的结果。在`c && b`中，`c`是`null`，因此是falsy。但是`&&`表达式本身的结果为`null`（`c`中的值），不是用于测试的强制转换来的`false`。

Do you see how these operators act as "operand selectors", now?

现在你明白这些操作符如何像“操作数选择器”一样工作了吗？

Another way of thinking about these operators:

另一种考虑这些操作数的方式是：

```js
a || b;
// roughly equivalent to:
a ? a : b;

a && b;
// roughly equivalent to:
a ? b : a;
```

**Note:** I call `a || b` "roughly equivalent" to `a ? a : b` because the outcome is identical, but there's a nuanced difference. In `a ? a : b`, if `a` was a more complex expression (like for instance one that might have side effects like calling a `function`, etc.), then the `a` expression would possibly be evaluated twice (if the first evaluation was truthy). By contrast, for `a || b`, the `a` expression is evaluated only once, and that value is used both for the coercive test as well as the result value (if appropriate). The same nuance applies to the `a && b` and `a ? b : a` expressions.

**注意：** 我说`a || b`“大体上等价”于`a ? a : b`，是因为虽然结果相同，但是这里有一个微妙的不同。在`a ? a : b`中，如果`a`是一个更复杂的表达式（例如像调用`function`那样可能带有副作用），那么这个表达式`a`将有可能被求值两次（如果第一次求值的结果为truthy）。相比之下，对于`a || b`，表达式`a`仅被求值一次，而且这个值将被同时用于强制转换测试和结果值（如果适合的话）。同样的区别也适用于`a && b`和`a ? b : a`表达式。

An extremely common and helpful usage of this behavior, which there's a good chance you may have used before and not fully understood, is:

```js
function foo(a,b) {
	a = a || "hello";
	b = b || "world";

	console.log( a + " " + b );
}

foo();					// "hello world"
foo( "yeah", "yeah!" );	// "yeah yeah!"
```

The `a = a || "hello"` idiom (sometimes said to be JavaScript's version of the C# "null coalescing operator") acts to test `a` and if it has no value (or only an undesired falsy value), provides a backup default value (`"hello"`).

**Be careful**, though!

```js
foo( "That's it!", "" ); // "That's it! world" <-- Oops!
```

See the problem? `""` as the second argument is a falsy value (see `ToBoolean` earlier in this chapter), so the `b = b || "world"` test fails, and the `"world"` default value is substituted, even though the intent probably was to have the explicitly passed `""` be the value assigned to `b`.

This `||` idiom is extremely common, and quite helpful, but you have to use it only in cases where *all falsy values* should be skipped. Otherwise, you'll need to be more explicit in your test, and probably use a `? :` ternary instead.

This *default value assignment* idiom is so common (and useful!) that even those who publicly and vehemently decry JavaScript coercion often use it in their own code!

What about `&&`?

There's another idiom that is quite a bit less commonly authored manually, but which is used by JS minifiers frequently. The `&&` operator "selects" the second operand if and only if the first operand tests as truthy, and this usage is sometimes called the "guard operator" (also see "Short Circuited" in Chapter 5) -- the first expression test "guards" the second expression:

```js
function foo() {
	console.log( a );
}

var a = 42;

a && foo(); // 42
```

`foo()` gets called only because `a` tests as truthy. If that test failed, this `a && foo()` expression statement would just silently stop -- this is known as "short circuiting" -- and never call `foo()`.

Again, it's not nearly as common for people to author such things. Usually, they'd do `if (a) { foo(); }` instead. But JS minifiers choose `a && foo()` because it's much shorter. So, now, if you ever have to decipher such code, you'll know what it's doing and why.

OK, so `||` and `&&` have some neat tricks up their sleeve, as long as you're willing to allow the *implicit* coercion into the mix.

**Note:** Both the `a = b || "something"` and `a && b()` idioms rely on short circuiting behavior, which we cover in more detail in Chapter 5.

The fact that these operators don't actually result in `true` and `false` is possibly messing with your head a little bit by now. You're probably wondering how all your `if` statements and `for` loops have been working, if they've included compound logical expressions like `a && (b || c)`.

Don't worry! The sky is not falling. Your code is (probably) just fine. It's just that you probably never realized before that there was an *implicit* coercion to `boolean` going on **after** the compound expression was evaluated.

Consider:

```js
var a = 42;
var b = null;
var c = "foo";

if (a && (b || c)) {
	console.log( "yep" );
}
```

This code still works the way you always thought it did, except for one subtle extra detail. The `a && (b || c)` expression *actually* results in `"foo"`, not `true`. So, the `if` statement *then* forces the `"foo"` value to coerce to a `boolean`, which of course will be `true`.

See? No reason to panic. Your code is probably still safe. But now you know more about how it does what it does.

And now you also realize that such code is using *implicit* coercion. If you're in the "avoid (implicit) coercion camp" still, you're going to need to go back and make all of those tests *explicit*:

```js
if (!!a && (!!b || !!c)) {
	console.log( "yep" );
}
```

Good luck with that! ... Sorry, just teasing.

### Symbol Coercion

Up to this point, there's been almost no observable outcome difference between *explicit* and *implicit* coercion -- only the readability of code has been at stake.

But ES6 Symbols introduce a gotcha into the coercion system that we need to discuss briefly. For reasons that go well beyond the scope of what we'll discuss in this book, *explicit* coercion of a `symbol` to a `string` is allowed, but *implicit* coercion of the same is disallowed and throws an error.

Consider:

```js
var s1 = Symbol( "cool" );
String( s1 );					// "Symbol(cool)"

var s2 = Symbol( "not cool" );
s2 + "";						// TypeError
```

`symbol` values cannot coerce to `number` at all (throws an error either way), but strangely they can both *explicitly* and *implicitly* coerce to `boolean` (always `true`).

Consistency is always easier to learn, and exceptions are never fun to deal with, but we just need to be careful around the new ES6 `symbol` values and how we coerce them.

The good news: it's probably going to be exceedingly rare for you to need to coerce a `symbol` value. The way they're typically used (see Chapter 3) will probably not call for coercion on a normal basis.

## Loose Equals vs. Strict Equals

Loose equals is the `==` operator, and strict equals is the `===` operator. Both operators are used for comparing two values for "equality," but the "loose" vs. "strict" indicates a **very important** difference in behavior between the two, specifically in how they decide "equality."

A very common misconception about these two operators is: "`==` checks values for equality and `===` checks both values and types for equality." While that sounds nice and reasonable, it's inaccurate. Countless well-respected JavaScript books and blogs have said exactly that, but unfortunately they're all *wrong*.

The correct description is: "`==` allows coercion in the equality comparison and `===` disallows coercion."

### Equality Performance

Stop and think about the difference between the first (inaccurate) explanation and this second (accurate) one.

In the first explanation, it seems obvious that `===` is *doing more work* than `==`, because it has to *also* check the type. In the second explanation, `==` is the one *doing more work* because it has to follow through the steps of coercion if the types are different.

Don't fall into the trap, as many have, of thinking this has anything to do with performance, though, as if `==` is going to be slower than `===` in any relevant way. While it's measurable that coercion does take *a little bit* of processing time, it's mere microseconds (yes, that's millionths of a second!).

If you're comparing two values of the same types, `==` and `===` use the identical algorithm, and so other than minor differences in engine implementation, they should do the same work.

If you're comparing two values of different types, the performance isn't the important factor. What you should be asking yourself is: when comparing these two values, do I want coercion or not?

If you want coercion, use `==` loose equality, but if you don't want coercion, use `===` strict equality.

**Note:** The implication here then is that both `==` and `===` check the types of their operands. The difference is in how they respond if the types don't match.

### Abstract Equality

The `==` operator's behavior is defined as "The Abstract Equality Comparison Algorithm" in section 11.9.3 of the ES5 spec. What's listed there is a comprehensive but simple algorithm that explicitly states every possible combination of types, and how the coercions (if necessary) should happen for each combination.

**Warning:** When (*implicit*) coercion is maligned as being too complicated and too flawed to be a *useful good part*, it is these rules of "abstract equality" that are being condemned. Generally, they are said to be too complex and too unintuitive for developers to practically learn and use, and that they are prone more to causing bugs in JS programs than to enabling greater code readability. I believe this is a flawed premise -- that you readers are competent developers who write (and read and understand!) algorithms (aka code) all day long. So, what follows is a plain exposition of the "abstract equality" in simple terms. But I implore you to also read the ES5 spec section 11.9.3. I think you'll be surprised at just how reasonable it is.

Basically, the first clause (11.9.3.1) says, if the two values being compared are of the same type, they are simply and naturally compared via Identity as you'd expect. For example, `42` is only equal to `42`, and `"abc"` is only equal to `"abc"`.

Some minor exceptions to normal expectation to be aware of:

* `NaN` is never equal to itself (see Chapter 2)
* `+0` and `-0` are equal to each other (see Chapter 2)

The final provision in clause 11.9.3.1 is for `==` loose equality comparison with `object`s (including `function`s and `array`s). Two such values are only *equal* if they are both references to *the exact same value*. No coercion occurs here.

**Note:** The `===` strict equality comparison is defined identically to 11.9.3.1, including the provision about two `object` values. It's a very little known fact that **`==` and `===` behave identically** in the case where two `object`s are being compared!

The rest of the algorithm in 11.9.3 specifies that if you use `==` loose equality to compare two values of different types, one or both of the values will need to be *implicitly* coerced. This coercion happens so that both values eventually end up as the same type, which can then directly be compared for equality using simple value Identity.

**Note:** The `!=` loose not-equality operation is defined exactly as you'd expect, in that it's literally the `==` operation comparison performed in its entirety, then the negation of the result. The same goes for the `!==` strict not-equality operation.

#### Comparing: `string`s to `number`s

To illustrate `==` coercion, let's first build off the `string` and `number` examples earlier in this chapter:

```js
var a = 42;
var b = "42";

a === b;	// false
a == b;		// true
```

As we'd expect, `a === b` fails, because no coercion is allowed, and indeed the `42` and `"42"` values are different.

However, the second comparison `a == b` uses loose equality, which means that if the types happen to be different, the comparison algorithm will perform *implicit* coercion on one or both values.

But exactly what kind of coercion happens here? Does the `a` value of `42` become a `string`, or does the `b` value of `"42"` become a `number`?

In the ES5 spec, clauses 11.9.3.4-5 say:

> 4. If Type(x) is Number and Type(y) is String,
>    return the result of the comparison x == ToNumber(y).
> 5. If Type(x) is String and Type(y) is Number,
>    return the result of the comparison ToNumber(x) == y.

**Warning:** The spec uses `Number` and `String` as the formal names for the types, while this book prefers `number` and `string` for the primitive types. Do not let the capitalization of `Number` in the spec confuse you for the `Number()` native function. For our purposes, the capitalization of the type name is irrelevant -- they have basically the same meaning.

Clearly, the spec says the `"42"` value is coerced to a `number` for the comparison. The *how* of that coercion has already been covered earlier, specifically with the `ToNumber` abstract operation. In this case, it's quite obvious then that the resulting two `42` values are equal.

#### Comparing: anything to `boolean`

One of the biggest gotchas with the *implicit* coercion of `==` loose equality pops up when you try to compare a value directly to `true` or `false`.

Consider:

```js
var a = "42";
var b = true;

a == b;	// false
```

Wait, what happened here!? We know that `"42"` is a truthy value (see earlier in this chapter). So, how come it's not `==` loose equal to `true`?

The reason is both simple and deceptively tricky. It's so easy to misunderstand, many JS developers never pay close enough attention to fully grasp it.

Let's again quote the spec, clauses 11.9.3.6-7:

> 6. If Type(x) is Boolean,
>    return the result of the comparison ToNumber(x) == y.
> 7. If Type(y) is Boolean,
>    return the result of the comparison x == ToNumber(y).

Let's break that down. First:

```js
var x = true;
var y = "42";

x == y; // false
```

The `Type(x)` is indeed `Boolean`, so it performs `ToNumber(x)`, which coerces `true` to `1`. Now, `1 == "42"` is evaluated. The types are still different, so (essentially recursively) we reconsult the algorithm, which just as above will coerce `"42"` to `42`, and `1 == 42` is clearly `false`.

Reverse it, and we still get the same outcome:

```js
var x = "42";
var y = false;

x == y; // false
```

The `Type(y)` is `Boolean` this time, so `ToNumber(y)` yields `0`. `"42" == 0` recursively becomes `42 == 0`, which is of course `false`.

In other words, **the value `"42"` is neither `== true` nor `== false`.** At first, that statement might seem crazy. How can a value be neither truthy nor falsy?

But that's the problem! You're asking the wrong question, entirely. It's not your fault, really. Your brain is tricking you.

`"42"` is indeed truthy, but `"42" == true` **is not performing a boolean test/coercion** at all, no matter what your brain says. `"42"` *is not* being coerced to a `boolean` (`true`), but instead `true` is being coerced to a `1`, and then `"42"` is being coerced to `42`.

Whether we like it or not, `ToBoolean` is not even involved here, so the truthiness or falsiness of `"42"` is irrelevant to the `==` operation!

What *is* relevant is to understand how the `==` comparison algorithm behaves with all the different type combinations. As it regards a `boolean` value on either side of the `==`, a `boolean` always coerces to a `number` *first*.

If that seems strange to you, you're not alone. I personally would recommend to never, ever, under any circumstances, use `== true` or `== false`. Ever.

But remember, I'm only talking about `==` here. `=== true` and `=== false` wouldn't allow the coercion, so they're safe from this hidden `ToNumber` coercion.

Consider:

```js
var a = "42";

// bad (will fail!):
if (a == true) {
	// ..
}

// also bad (will fail!):
if (a === true) {
	// ..
}

// good enough (works implicitly):
if (a) {
	// ..
}

// better (works explicitly):
if (!!a) {
	// ..
}

// also great (works explicitly):
if (Boolean( a )) {
	// ..
}
```

If you avoid ever using `== true` or `== false` (aka loose equality with `boolean`s) in your code, you'll never have to worry about this truthiness/falsiness mental gotcha.

#### Comparing: `null`s to `undefined`s

Another example of *implicit* coercion can be seen with `==` loose equality between `null` and `undefined` values. Yet again quoting the ES5 spec, clauses 11.9.3.2-3:

> 2. If x is null and y is undefined, return true.
> 3. If x is undefined and y is null, return true.

`null` and `undefined`, when compared with `==` loose equality, equate to (aka coerce to) each other (as well as themselves, obviously), and no other values in the entire language.

What this means is that `null` and `undefined` can be treated as indistinguishable for comparison purposes, if you use the `==` loose equality operator to allow their mutual *implicit* coercion.

```js
var a = null;
var b;

a == b;		// true
a == null;	// true
b == null;	// true

a == false;	// false
b == false;	// false
a == "";	// false
b == "";	// false
a == 0;		// false
b == 0;		// false
```

The coercion between `null` and `undefined` is safe and predictable, and no other values can give false positives in such a check. I recommend using this coercion to allow `null` and `undefined` to be indistinguishable and thus treated as the same value.

For example:

```js
var a = doSomething();

if (a == null) {
	// ..
}
```

The `a == null` check will pass only if `doSomething()` returns either `null` or `undefined`, and will fail with any other value, even other falsy values like `0`, `false`, and `""`.

The *explicit* form of the check, which disallows any such coercion, is (I think) unnecessarily much uglier (and perhaps a tiny bit less performant!):

```js
var a = doSomething();

if (a === undefined || a === null) {
	// ..
}
```

In my opinion, the form `a == null` is yet another example where *implicit* coercion improves code readability, but does so in a reliably safe way.

#### Comparing: `object`s to non-`object`s

If an `object`/`function`/`array` is compared to a simple scalar primitive (`string`, `number`, or `boolean`), the ES5 spec says in clauses 11.9.3.8-9:

> 8. If Type(x) is either String or Number and Type(y) is Object,
>    return the result of the comparison x == ToPrimitive(y).
> 9. If Type(x) is Object and Type(y) is either String or Number,
>    return the result of the comparison ToPrimitive(x) == y.

**Note:** You may notice that these clauses only mention `String` and `Number`, but not `Boolean`. That's because, as quoted earlier, clauses 11.9.3.6-7 take care of coercing any `Boolean` operand presented to a `Number` first.

Consider:

```js
var a = 42;
var b = [ 42 ];

a == b;	// true
```

The `[ 42 ]` value has its `ToPrimitive` abstract operation called (see the "Abstract Value Operations" section earlier), which results in the `"42"` value. From there, it's just `42 == "42"`, which as we've already covered becomes `42 == 42`, so `a` and `b` are found to be coercively equal.

**Tip:** All the quirks of the `ToPrimitive` abstract operation that we discussed earlier in this chapter (`toString()`, `valueOf()`) apply here as you'd expect. This can be quite useful if you have a complex data structure that you want to define a custom `valueOf()` method on, to provide a simple value for equality comparison purposes.

In Chapter 3, we covered "unboxing," where an `object` wrapper around a primitive value (like from `new String("abc")`, for instance) is unwrapped, and the underlying primitive value (`"abc"`) is returned. This behavior is related to the `ToPrimitive` coercion in the `==` algorithm:

```js
var a = "abc";
var b = Object( a );	// same as `new String( a )`

a === b;				// false
a == b;					// true
```

`a == b` is `true` because `b` is coerced (aka "unboxed," unwrapped) via `ToPrimitive` to its underlying `"abc"` simple scalar primitive value, which is the same as the value in `a`.

There are some values where this is not the case, though, because of other overriding rules in the `==` algorithm. Consider:

```js
var a = null;
var b = Object( a );	// same as `Object()`
a == b;					// false

var c = undefined;
var d = Object( c );	// same as `Object()`
c == d;					// false

var e = NaN;
var f = Object( e );	// same as `new Number( e )`
e == f;					// false
```

The `null` and `undefined` values cannot be boxed -- they have no object wrapper equivalent -- so `Object(null)` is just like `Object()` in that both just produce a normal object.

`NaN` can be boxed to its `Number` object wrapper equivalent, but when `==` causes an unboxing, the `NaN == NaN` comparison fails because `NaN` is never equal to itself (see Chapter 2).

### Edge Cases

Now that we've thoroughly examined how the *implicit* coercion of `==` loose equality works (in both sensible and surprising ways), let's try to call out the worst, craziest corner cases so we can see what we need to avoid to not get bitten with coercion bugs.

First, let's examine how modifying the built-in native prototypes can produce crazy results:

#### A Number By Any Other Value Would...

```js
Number.prototype.valueOf = function() {
	return 3;
};

new Number( 2 ) == 3;	// true
```

**Warning:** `2 == 3` would not have fallen into this trap, because neither `2` nor `3` would have invoked the built-in `Number.prototype.valueOf()` method because both are already primitive `number` values and can be compared directly. However, `new Number(2)` must go through the `ToPrimitive` coercion, and thus invoke `valueOf()`.

Evil, huh? Of course it is. No one should ever do such a thing. The fact that you *can* do this is sometimes used as a criticism of coercion and `==`. But that's misdirected frustration. JavaScript is not *bad* because you can do such things, a developer is *bad* **if they do such things**. Don't fall into the "my programming language should protect me from myself" fallacy.

Next, let's consider another tricky example, which takes the evil from the previous example to another level:

```js
if (a == 2 && a == 3) {
	// ..
}
```

You might think this would be impossible, because `a` could never be equal to both `2` and `3` *at the same time*. But "at the same time" is inaccurate, since the first expression `a == 2` happens strictly *before* `a == 3`.

So, what if we make `a.valueOf()` have side effects each time it's called, such that the first time it returns `2` and the second time it's called it returns `3`? Pretty easy:

```js
var i = 2;

Number.prototype.valueOf = function() {
	return i++;
};

var a = new Number( 42 );

if (a == 2 && a == 3) {
	console.log( "Yep, this happened." );
}
```

Again, these are evil tricks. Don't do them. But also don't use them as complaints against coercion. Potential abuses of a mechanism are not sufficient evidence to condemn the mechanism. Just avoid these crazy tricks, and stick only with valid and proper usage of coercion.

#### False-y Comparisons

The most common complaint against *implicit* coercion in `==` comparisons comes from how falsy values behave surprisingly when compared to each other.

To illustrate, let's look at a list of the corner-cases around falsy value comparisons, to see which ones are reasonable and which are troublesome:

```js
"0" == null;			// false
"0" == undefined;		// false
"0" == false;			// true -- UH OH!
"0" == NaN;				// false
"0" == 0;				// true
"0" == "";				// false

false == null;			// false
false == undefined;		// false
false == NaN;			// false
false == 0;				// true -- UH OH!
false == "";			// true -- UH OH!
false == [];			// true -- UH OH!
false == {};			// false

"" == null;				// false
"" == undefined;		// false
"" == NaN;				// false
"" == 0;				// true -- UH OH!
"" == [];				// true -- UH OH!
"" == {};				// false

0 == null;				// false
0 == undefined;			// false
0 == NaN;				// false
0 == [];				// true -- UH OH!
0 == {};				// false
```

In this list of 24 comparisons, 17 of them are quite reasonable and predictable. For example, we know that `""` and `NaN` are not at all equatable values, and indeed they don't coerce to be loose equals, whereas `"0"` and `0` are reasonably equatable and *do* coerce as loose equals.

However, seven of the comparisons are marked with "UH OH!" because as false positives, they are much more likely gotchas that could trip you up. `""` and `0` are definitely distinctly different values, and it's rare you'd want to treat them as equatable, so their mutual coercion is troublesome. Note that there aren't any false negatives here.

#### The Crazy Ones

We don't have to stop there, though. We can keep looking for even more troublesome coercions:

```js
[] == ![];		// true
```

Oooo, that seems at a higher level of crazy, right!? Your brain may likely trick you that you're comparing a truthy to a falsy value, so the `true` result is surprising, as we *know* a value can never be truthy and falsy at the same time!

But that's not what's actually happening. Let's break it down. What do we know about the `!` unary operator? It explicitly coerces to a `boolean` using the `ToBoolean` rules (and it also flips the parity). So before `[] == ![]` is even processed, it's actually already translated to `[] == false`. We already saw that form in our above list (`false == []`), so its surprise result is *not new* to us.

How about other corner cases?

```js
2 == [2];		// true
"" == [null];	// true
```

As we said earlier in our `ToNumber` discussion, the right-hand side `[2]` and `[null]` values will go through a `ToPrimitive` coercion so they can be more readily compared to the simple primitives (`2` and `""`, respectively) on the left-hand side. Since the `valueOf()` for `array` values just returns the `array` itself, coercion falls to stringifying the `array`.

`[2]` will become `"2"`, which then is `ToNumber` coerced to `2` for the right-hand side value in the first comparison. `[null]` just straight becomes `""`.

So, `2 == 2` and `"" == ""` are completely understandable.

If your instinct is to still dislike these results, your frustration is not actually with coercion like you probably think it is. It's actually a complaint against the default `array` values' `ToPrimitive` behavior of coercing to a `string` value. More likely, you'd just wish that `[2].toString()` didn't return `"2"`, or that `[null].toString()` didn't return `""`.

But what exactly *should* these `string` coercions result in? I can't really think of any other appropriate `string` coercion of `[2]` than `"2"`, except perhaps `"[2]"` -- but that could be very strange in other contexts!

You could rightly make the case that since `String(null)` becomes `"null"`, then `String([null])` should also become `"null"`. That's a reasonable assertion. So, that's the real culprit.

*Implicit* coercion itself isn't the evil here. Even an *explicit* coercion of `[null]` to a `string` results in `""`. What's at odds is whether it's sensible at all for `array` values to stringify to the equivalent of their contents, and exactly how that happens. So, direct your frustration at the rules for `String( [..] )`, because that's where the craziness stems from. Perhaps there should be no stringification coercion of `array`s at all? But that would have lots of other downsides in other parts of the language.

Another famously cited gotcha:

```js
0 == "\n";		// true
```

As we discussed earlier with empty `""`, `"\n"` (or `" "` or any other whitespace combination) is coerced via `ToNumber`, and the result is `0`. What other `number` value would you expect whitespace to coerce to? Does it bother you that *explicit* `Number(" ")` yields `0`?

Really the only other reasonable `number` value that empty strings or whitespace strings could coerce to is the `NaN`. But would that *really* be better? The comparison `" " == NaN` would of course fail, but it's unclear that we'd have really *fixed* any of the underlying concerns.

The chances that a real-world JS program fails because `0 == "\n"` are awfully rare, and such corner cases are easy to avoid.

Type conversions **always** have corner cases, in any language -- nothing specific to coercion. The issues here are about second-guessing a certain set of corner cases (and perhaps rightly so!?), but that's not a salient argument against the overall coercion mechanism.

Bottom line: almost any crazy coercion between *normal values* that you're likely to run into (aside from intentionally tricky `valueOf()` or `toString()` hacks as earlier) will boil down to the short seven-item list of gotcha coercions we've identified above.

To contrast against these 24 likely suspects for coercion gotchas, consider another list like this:

```js
42 == "43";							// false
"foo" == 42;						// false
"true" == true;						// false

42 == "42";							// true
"foo" == [ "foo" ];					// true
```

In these nonfalsy, noncorner cases (and there are literally an infinite number of comparisons we could put on this list), the coercion results are totally safe, reasonable, and explainable.

#### Sanity Check

OK, we've definitely found some crazy stuff when we've looked deeply into *implicit* coercion. No wonder that most developers claim coercion is evil and should be avoided, right!?

But let's take a step back and do a sanity check.

By way of magnitude comparison, we have *a list* of seven troublesome gotcha coercions, but we have *another list* of (at least 17, but actually infinite) coercions that are totally sane and explainable.

If you're looking for a textbook example of "throwing the baby out with the bathwater," this is it: discarding the entirety of coercion (the infinitely large list of safe and useful behaviors) because of a list of literally just seven gotchas.

The more prudent reaction would be to ask, "how can I use the countless *good parts* of coercion, but avoid the few *bad parts*?"

Let's look again at the *bad* list:

```js
"0" == false;			// true -- UH OH!
false == 0;				// true -- UH OH!
false == "";			// true -- UH OH!
false == [];			// true -- UH OH!
"" == 0;				// true -- UH OH!
"" == [];				// true -- UH OH!
0 == [];				// true -- UH OH!
```

Four of the seven items on this list involve `== false` comparison, which we said earlier you should **always, always** avoid. That's a pretty easy rule to remember.

Now the list is down to three.

```js
"" == 0;				// true -- UH OH!
"" == [];				// true -- UH OH!
0 == [];				// true -- UH OH!
```

Are these reasonable coercions you'd do in a normal JavaScript program? Under what conditions would they really happen?

I don't think it's terribly likely that you'd literally use `== []` in a `boolean` test in your program, at least not if you know what you're doing. You'd probably instead be doing `== ""` or `== 0`, like:

```js
function doSomething(a) {
	if (a == "") {
		// ..
	}
}
```

You'd have an oops if you accidentally called `doSomething(0)` or `doSomething([])`. Another scenario:

```js
function doSomething(a,b) {
	if (a == b) {
		// ..
	}
}
```

Again, this could break if you did something like `doSomething("",0)` or `doSomething([],"")`.

So, while the situations *can* exist where these coercions will bite you, and you'll want to be careful around them, they're probably not super common on the whole of your code base.

#### Safely Using Implicit Coercion

The most important advice I can give you: examine your program and reason about what values can show up on either side of an `==` comparison. To effectively avoid issues with such comparisons, here's some heuristic rules to follow:

1. If either side of the comparison can have `true` or `false` values, don't ever, EVER use `==`.
2. If either side of the comparison can have `[]`, `""`, or `0` values, seriously consider not using `==`.

In these scenarios, it's almost certainly better to use `===` instead of `==`, to avoid unwanted coercion. Follow those two simple rules and pretty much all the coercion gotchas that could reasonably hurt you will effectively be avoided.

**Being more explicit/verbose in these cases will save you from a lot of headaches.**

The question of `==` vs. `===` is really appropriately framed as: should you allow coercion for a comparison or not?

There's lots of cases where such coercion can be helpful, allowing you to more tersely express some comparison logic (like with `null` and `undefined`, for example).

In the overall scheme of things, there's relatively few cases where *implicit* coercion is truly dangerous. But in those places, for safety sake, definitely use `===`.

**Tip:** Another place where coercion is guaranteed *not* to bite you is with the `typeof` operator. `typeof` is always going to return you one of seven strings (see Chapter 1), and none of them are the empty `""` string. As such, there's no case where checking the type of some value is going to run afoul of *implicit* coercion. `typeof x == "function"` is 100% as safe and reliable as `typeof x === "function"`. Literally, the spec says the algorithm will be identical in this situation. So, don't just blindly use `===` everywhere simply because that's what your code tools tell you to do, or (worst of all) because you've been told in some book to **not think about it**. You own the quality of your code.

Is *implicit* coercion evil and dangerous? In a few cases, yes, but overwhelmingly, no.

Be a responsible and mature developer. Learn how to use the power of coercion (both *explicit* and *implicit*) effectively and safely. And teach those around you to do the same.

Here's a handy table made by Alex Dorey (@dorey on GitHub) to visualize a variety of comparisons:

<img src="fig1.png" width="600">

Source: https://github.com/dorey/JavaScript-Equality-Table

## Abstract Relational Comparison

While this part of *implicit* coercion often gets a lot less attention, it's important nonetheless to think about what happens with `a < b` comparisons (similar to how we just examined `a == b` in depth).

The "Abstract Relational Comparison" algorithm in ES5 section 11.8.5 essentially divides itself into two parts: what to do if the comparison involves both `string` values (second half), or anything else (first half).

**Note:** The algorithm is only defined for `a < b`. So, `a > b` is handled as `b < a`.

The algorithm first calls `ToPrimitive` coercion on both values, and if the return result of either call is not a `string`, then both values are coerced to `number` values using the `ToNumber` operation rules, and compared numerically.

For example:

```js
var a = [ 42 ];
var b = [ "43" ];

a < b;	// true
b < a;	// false
```

**Note:** Similar caveats for `-0` and `NaN` apply here as they did in the `==` algorithm discussed earlier.

However, if both values are `string`s for the `<` comparison, simple lexicographic (natural alphabetic) comparison on the characters is performed:

```js
var a = [ "42" ];
var b = [ "043" ];

a < b;	// false
```

`a` and `b` are *not* coerced to `number`s, because both of them end up as `string`s after the `ToPrimitive` coercion on the two `array`s. So, `"42"` is compared character by character to `"043"`, starting with the first characters `"4"` and `"0"`, respectively. Since `"0"` is lexicographically *less than* than `"4"`, the comparison returns `false`.

The exact same behavior and reasoning goes for:

```js
var a = [ 4, 2 ];
var b = [ 0, 4, 3 ];

a < b;	// false
```

Here, `a` becomes `"4,2"` and `b` becomes `"0,4,3"`, and those lexicographically compare identically to the previous snippet.

What about:

```js
var a = { b: 42 };
var b = { b: 43 };

a < b;	// ??
```

`a < b` is also `false`, because `a` becomes `[object Object]` and `b` becomes `[object Object]`, and so clearly `a` is not lexicographically less than `b`.

But strangely:

```js
var a = { b: 42 };
var b = { b: 43 };

a < b;	// false
a == b;	// false
a > b;	// false

a <= b;	// true
a >= b;	// true
```

Why is `a == b` not `true`? They're the same `string` value (`"[object Object]"`), so it seems they should be equal, right? Nope. Recall the previous discussion about how `==` works with `object` references.

But then how are `a <= b` and `a >= b` resulting in `true`, if `a < b` **and** `a == b` **and** `a > b` are all `false`?

Because the spec says for `a <= b`, it will actually evaluate `b < a` first, and then negate that result. Since `b < a` is *also* `false`, the result of `a <= b` is `true`.

That's probably awfully contrary to how you might have explained what `<=` does up to now, which would likely have been the literal: "less than *or* equal to." JS more accurately considers `<=` as "not greater than" (`!(a > b)`, which JS treats as `!(b < a)`). Moreover, `a >= b` is explained by first considering it as `b <= a`, and then applying the same reasoning.

Unfortunately, there is no "strict relational comparison" as there is for equality. In other words, there's no way to prevent *implicit* coercion from occurring with relational comparisons like `a < b`, other than to ensure that `a` and `b` are of the same type explicitly before making the comparison.

Use the same reasoning from our earlier `==` vs. `===` sanity check discussion. If coercion is helpful and reasonably safe, like in a `42 < "43"` comparison, **use it**. On the other hand, if you need to be safe about a relational comparison, *explicitly coerce* the values first, before using `<` (or its counterparts).

```js
var a = [ 42 ];
var b = "043";

a < b;						// false -- string comparison!
Number( a ) < Number( b );	// true -- number comparison!
```

## Review

In this chapter, we turned our attention to how JavaScript type conversions happen, called **coercion**, which can be characterized as either *explicit* or *implicit*.

Coercion gets a bad rap, but it's actually quite useful in many cases. An important task for the responsible JS developer is to take the time to learn all the ins and outs of coercion to decide which parts will help improve their code, and which parts they really should avoid.

*Explicit* coercion is code which is obvious that the intent is to convert a value from one type to another. The benefit is improvement in readability and maintainability of code by reducing confusion.

*Implicit* coercion is coercion that is "hidden" as a side-effect of some other operation, where it's not as obvious that the type conversion will occur. While it may seem that *implicit* coercion is the opposite of *explicit* and is thus bad (and indeed, many think so!), actually *implicit* coercion is also about improving the readability of code.

Especially for *implicit*, coercion must be used responsibly and consciously. Know why you're writing the code you're writing, and how it works. Strive to write code that others will easily be able to learn from and understand as well.
