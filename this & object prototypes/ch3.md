# 你不懂JS: *this* 与对象原型
# 第三章：对象

在第一和第二章中，我们讲解了 `this` 绑定如何根据函数调用的调用点指向不同的对象。但究竟什么是对象，为什么我们需要指向它们？这一章我们就来详细探索一下对象。

## 语法

对象来自于两种形式：声明（字面）形式，和构造形式。

一个对象的字面语法看起来像这样：

```js
var myObj = {
	key: value
	// ...
};
```

构造形式看起来像这样：

```js
var myObj = new Object();
myObj.key = value;
```

构造形式和字面形式的结果是完全同种类的对象。唯一真正的区别在于你可以向字面声明一次性添加一个或多个键/值对，而对于构造形式，你必须一个一个地添加属性。

**注意：** 像刚才展示的那样使用“构造形式”来创建对象是极其少见的。你很有可能总是想使用字面语法形式。这对大多数内建的对象也一样（后述）。

## 类型

对象是大多数 JS 程序依赖的基本构建块儿。它们是 JS 的六种主要类型（在语言规范中称为“语言类型”）中的一种：

* `string`
* `number`
* `boolean`
* `null`
* `undefined`
* `object`

注意 *简单基本类型* （`string`、`number`、`boolean`、`null`、和 `undefined`）自身 **不是** `object`。`null` 有时会被当成一个对象类型，但是这种误解源自于一个语言中的 Bug，它使得 `typeof null` 错误地（而且令人困惑地）返回字符串 `"object"`。实际上，`null` 是它自己的基本类型。

**一个常见的错误论断是“JavaScript中的一切都是对象”。这明显是不对的。**

对比来看，存在几种特殊的对象子类型，我们可以称之为 *复杂基本类型*。

`function` 是对象的一种子类型（技术上讲，叫做“可调用对象”）。函数在 JS 中被称为“头等（first class）”类型，是因为它们基本上就是普通的对象（附带有可调用的行为语义），而且它们可以像其他普通的对象那样被处理。

数组也是一种形式的对象，带有特别的行为。数组在内容的组织上要稍稍比一般的对象更加结构化。

### 内建对象

有几种其他的对象子类型，通常称为内建对象。对于其中的一些来说，它们的名称看起来暗示着它们和它们对应的基本类型有着直接的联系，但事实上，它们的关系更复杂，我们一会儿就开始探索。

* `String`
* `Number`
* `Boolean`
* `Object`
* `Function`
* `Array`
* `Date`
* `RegExp`
* `Error`

如果你依照和其他语言的相似性来看的话，比如 Java 语言的 `String` 类，这些内建类型有着实际类型的外观，甚至是类（class）的外观，

但是在 JS 中，它们实际上仅仅是内建的函数。这些内建函数的每一个都可以被用作构造器（也就是一个可以通过 `new` 操作符调用的函数 —— 参照第二章），其结果是一个新 *构建* 的相应子类型的对象。例如：

```js
var strPrimitive = "I am a string";
typeof strPrimitive;							// "string"
strPrimitive instanceof String;					// false

var strObject = new String( "I am a string" );
typeof strObject; 								// "object"
strObject instanceof String;					// true

// 考察 object 子类型
Object.prototype.toString.call( strObject );	// [object String]
```

我们会在本章稍后详细地看到 `Object.prototype.toString...` 到底是如何工作的，但简单地说，我们可以通过借用基本的默认 `toString()` 方法来考察内部子类型，而且你可以看到它揭示了 `strObject` 实际上是一个由 `String` 构造器创建的对象。

基本类型值 `"I am a string"` 不是一个对象，它是一个不可变的基本字面值。为了对它进行操作，比如检查它的长度，访问它的各个独立字符内容等等，都需要一个 `String` 对象。

幸运的是，在必要的时候语言会自动地将 `"string"` 基本类型强制转换为 `String` 对象类型，这意味着你几乎从不需要明确地创建对象。JS 社区的绝大部分人都 **强烈推荐** 尽可能地使用字面形式的值，而非使用构造的对象形式。

考虑下面的代码：

```js
var strPrimitive = "I am a string";

console.log( strPrimitive.length );			// 13

console.log( strPrimitive.charAt( 3 ) );	// "m"
```

在这两个例子中，我们在字符串的基本类型上调用属性和方法，引擎会自动地将它强制转换为 `String` 对象，所以这些属性/方法的访问可以工作。

当使用如 `42.359.toFixed(2)` 这样的方法时，同样的强制转换也发生在数字基本字面量 `42` 和包装对象 `new Number(42)` 之间。同样的还有 `Boolean` 对象和 `"boolean"` 基本类型。

`null` 和 `undefined` 没有对象包装的形式，仅有它们的基本类型值。相比之下，`Date` 的值 *仅可以* 由它们的构造对象形式创建，因为它们没有对应的字面形式。

无论使用字面还是构造形式，`Object`、`Array`、`Function`、和 `RegExp`（正则表达式）都是对象。在某些情况下，构造形式确实会比对应的字面形式提供更多的创建选项。因为对象可以被任意一种方式创建，更简单的字面形式几乎是所有人的首选。**仅仅在你需要使用额外的选项时使用构建形式**。

`Error` 对象很少在代码中明示地被创建，它们通常在抛出异常时自动地被创建。它们可以由 `new Error(..)` 构造形式创建，但通常是不必要的。

## 内容

正如刚才提到的，对象的内容由存储在特定命名的 *位置* 上的（任意类型的）值组成，我们称这些值为属性。

有一个重要的事情需要注意：当我们说“内容”时，似乎暗示着这些值 *实际上* 存储在对象内部，但那只不过是表面现象。引擎会根据自己的实现来存储这些值，而且通常都不是把它们存储在容器对象 *内部*。在容器内存储的是这些属性的名称，它们像指针（技术上讲，叫 *引用（reference）*）一样指向值存储的地方。

考虑下面的代码：

```js
var myObject = {
	a: 2
};

myObject.a;		// 2

myObject["a"];	// 2
```

为了访问 `myObject` 在 *位置* `a` 的值，我们需要使用 `.` 或 `[ ]` 操作符。`.a` 语法通常称为“属性（property）”访问，而 `["a"]` 语法通常称为“键（key）”访问。在现实中，它们俩都访问相同的 *位置*，而且会拿出相同的值，`2`，所以这些术语可以互换使用。从现在起，我们将使用最常见的术语 —— “属性访问”。

两种语法的主要区别在于，`.` 操作符后面需要一个 `标识符（Identifier）` 兼容的属性名，而 `[".."]` 语法基本可以接收任何兼容 UTF-8/unicode 的字符串作为属性名。举个例子，为了引用一个名为“Super-Fun!”的属性，你不得不使用 `["Super-Fun!"]` 语法访问，因为 `Super-Fun!` 不是一个合法的 `Identifier` 属性名。

而且，由于 `[".."]` 语法使用字符串的 **值** 来指定位置，这意味着程序可以动态地组建字符串的值。比如：

```js
var wantA = true;
var myObject = {
	a: 2
};

var idx;

if (wantA) {
	idx = "a";
}

// 稍后

console.log( myObject[idx] ); // 2
```

在对象中，属性名 **总是** 字符串。如果你使用 `string` 以外的（基本）类型值，它会首先被转换为字符串。这甚至包括在数组中常用于索引的数字，所以要小心不要将对象和数组使用的数字搞混了。

```js
var myObject = { };

myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"];				// "foo"
myObject["3"];					// "bar"
myObject["[object Object]"];	// "baz"
```

### 计算型属性名

如果你需要将一个计算表达式 *作为* 一个键名称，那么我们刚刚描述的 `myObject[..]` 属性访问语法是十分有用的，比如 `myObject[prefix + name]`。但是当使用字面对象语法声明对象时则没有什么帮助。

ES6 加入了 *计算型属性名*，在一个字面对象声明的键名称位置，你可以指定一个表达式，用 `[ ]` 括起来：

```js
var prefix = "foo";

var myObject = {
	[prefix + "bar"]: "hello",
	[prefix + "baz"]: "world"
};

myObject["foobar"]; // hello
myObject["foobaz"]; // world
```

*计算型属性名* 的最常见用法，可能是用于 ES6 的 `Symbol`，我们将不会在本书中涵盖关于它的细节。简单地说，它们是新的基本数据类型，拥有一个不透明不可知的值（技术上讲是一个 `string` 值）。你将会被强烈地不鼓励使用一个 `Symbol` 的 *实际值* （这个值理论上会因 JS 引擎的不同而不同），所以 `Symbol` 的名称，比如 `Symbol.Something`（这是个瞎编的名称！），才是你会使用的：

```js
var myObject = {
	[Symbol.Something]: "hello world"
};
```

### 属性（Property） vs. 方法（Method）

有些开发者喜欢在讨论对一个对象的属性访问时做一个区别，如果这个被访问的值恰好是一个函数的话。因为这诱使人们认为函数 *属于* 这个对象，而且在其他语言中，属于对象（也就是“类”）的函数被称作“方法”，所以相对于“属性访问”，我们常能听到“方法访问”。

有趣的是，**语言规范也做出了同样的区别**。

从技术上讲，函数绝不会“属于”对象，所以，说一个偶然在对象的引用上被访问的函数就自动地成为了一个“方法”，看起来有些像是牵强附会。

有些函数内部确实拥有 `this` 引用，而且 *有时* 这些 `this` 引用指向调用点的对象引用。但这个用法确实没有使这个函数比其他函数更像“方法”，因为 `this` 是在运行时在调用点动态绑定的，这使得它与这个对象的关系至多是间接的。

每次你访问一个对象的属性都是一个 **属性访问**，无论你得到什么类型的值。如果你 *恰好* 从属性访问中得到一个函数，它也没有魔法般地在那时成为一个“方法”。一个从属性访问得来的函数没有任何特殊性（隐含的 `this` 绑定的情况在刚才已经解释过了）。

举个例子：

```js
function foo() {
	console.log( "foo" );
}

var someFoo = foo;	// 对 `foo` 的变量引用


var myObject = {
	someFoo: foo
};

foo;				// function foo(){..}

someFoo;			// function foo(){..}

myObject.someFoo;	// function foo(){..}
```

`someFoo` 和 `myObject.someFoo` 只不过是同一个函数的两个分离的引用，它们中的任何一个都不意味着这个函数很特别或被其他对象所“拥有”。如果上面的 `foo()` 定义里面拥有一个 `this` 引用，那么 `myObject.someFoo` 的 *隐含绑定* 将会是这个两个引用间 **唯一** 可以观察到的不同。它们中的任何一个都没有称为“方法”的道理。

**也许有人会争辩**，函数 *变成了方法*，不是在定义期间，而是在调用的执行期间，根据它是如何在调用点被调用的（是否带有一个环境对象引用 —— 细节见第二章）。即便是这种解读也有些牵强。

可能最安全的结论是，在 JavaScript 中，“函数”和“方法”是可以互换使用的。

**注意：** ES6 加入了 `super` 引用，它通常是和 `class`（见附录A）一起使用的。`super` 的行为方式（静态绑定，而非像 `this` 一样延迟绑定），给了这种说法更多的权重：一个被 `super` 绑定到某处的函数比起“函数”更像一个“方法”。但是同样地，这仅仅是微妙的语义上的（和机制上的）细微区别。

就算你声明一个函数表达式作为字面对象的一部分，那个函数都不会魔法般地 *属于* 这个对象 —— 仍然仅仅是同一个函数对象的多个引用罢了。

```js
var myObject = {
	foo: function foo() {
		console.log( "foo" );
	}
};

var someFoo = myObject.foo;

someFoo;		// function foo(){..}

myObject.foo;	// function foo(){..}
```

**注意：** 在第六章中，我们会为字面对象的 `foo: function foo(){ .. }` 声明语法介绍一种ES6的简化语法。

### 数组

数组也使用 `[ ]` 访问形式，但正如上面提到的，在存储值的方式和位置上它们的组织更加结构化（虽然仍然在存储值的 *类型* 上没有限制）。数组采用 *数字索引*，这意味着值被存储的位置，通常称为 *下标*，是一个非负整数，比如 `0` 和 `42`。

```js
var myArray = [ "foo", 42, "bar" ];

myArray.length;		// 3

myArray[0];			// "foo"

myArray[2];			// "bar"
```

数组也是对象，所以虽然每个索引都是正整数，你还可以在数组上添加属性：

```js
var myArray = [ "foo", 42, "bar" ];

myArray.baz = "baz";

myArray.length;	// 3

myArray.baz;	// "baz"
```

注意，添加命名属性（不论是使用 `.` 还是 `[ ]` 操作符语法）不会改变数组的 `length` 所报告的值。

你 *可以* 把一个数组当做普通的键/值对象使用，并且从不添加任何数字下标，但这不是一个好主意，因为数组对它本来的用途有着特定的行为和优化方式，普通对象也一样。使用对象来存储键/值对，而用数组在数字下标上存储值。

**小心：** 如果你试图在一个数组上添加属性，但是属性名 *看起来* 像一个数字，那么最终它会成为一个数字索引（也就是改变了数组的内容）：

```js
var myArray = [ "foo", 42, "bar" ];

myArray["3"] = "baz";

myArray.length;	// 4

myArray[3];		// "baz"
```

### 复制对象

当开发者们初次拿起 Javascript 语言时，最常需要的特性就是如何复制一个对象。看起来应该有一个内建的 `copy()` 方法，对吧？但是事情实际上比这复杂一些，因为在默认情况下，复制的算法应当是什么，并不十分明确。

例如，考虑这个对象：

```js
function anotherFunction() { /*..*/ }

var anotherObject = {
	c: true
};

var anotherArray = [];

var myObject = {
	a: 2,
	b: anotherObject,	// 引用，不是拷贝!
	c: anotherArray,	// 又一个引用!
	d: anotherFunction
};

anotherArray.push( anotherObject, myObject );
```

一个`myObject`的 *拷贝* 究竟应该怎么表现？

首先，我们应该回答它是一个 *浅（shallow）* 还是一个 *深（deep）* 拷贝？一个 *浅拷贝（shallow copy）* 会得到一个新对象，它的 `a` 是值 `2` 的拷贝，但 `b`、`c` 和 `d` 属性仅仅是引用，它们指向被拷贝对象中引用的相同位置。一个 *深拷贝（deep copy）* 将不仅复制 `myObject`，还会复制 `anotherObject` 和 `anotherArray`。但之后我们让 `anotherArray` 拥有 `anotherObject` 和 `myObject` 的引用，所以 *那些* 也应当被复制而不是仅保留引用。现在由于循环引用，我们得到了一个无限循环复制的问题。

我们应当检测循环引用并打破循环遍历吗（不管位于深处的，没有完全复制的元素）？我们应当报错退出吗？或者介于两者之间？

另外，“复制”一个函数意味着什么，也不是很清楚。有一些技巧，比如提取一个函数源代码的 `toString()` 序列化表达（这个源代码会因实现不同而不同，而且根据被考察的函数的类型，其结果甚至在所有引擎上都不可靠）。

那么我们如何解决所有这些刁钻的问题？不同的 JS 框架都各自挑选自己的解释并且做出自己的选择。但是哪一种（如果有的话）才是 JS 应当作为标准采用的呢？长久以来，没有明确答案。

一个解决方案是，JSON 安全的对象（也就是，可以被序列化为一个 JSON 字符串，之后还可以被重新解析为拥有相同的结构和值的对象）可以简单地这样 *复制*：

```js
var newObj = JSON.parse( JSON.stringify( someObj ) );
```

当然，这要求你保证你的对象是 JSON 安全的。对于某些情况，这没什么大不了的。而对另一些情况，这还不够。

同时，浅拷贝相当易懂，而且没有那么多问题，所以 ES6 为此任务已经定义了 `Object.assign(..)`。`Object.assign(..)` 接收 *目标* 对象作为第一个参数，然后是一个或多个 *源* 对象作为后续参数。它会在 *源* 对象上迭代所有的 *可枚举（enumerable）*，*owned keys*（**直接拥有的键**），并把它们拷贝到 *目标* 对象上（仅通过 `=` 赋值）。它还会很方便地返回 *目标* 对象，正如下面你可以看到的：

```js
var newObj = Object.assign( {}, myObject );

newObj.a;						// 2
newObj.b === anotherObject;		// true
newObj.c === anotherArray;		// true
newObj.d === anotherFunction;	// true
```

**注意：** 在下一部分中，我们将讨论“属性描述符（property descriptors —— 属性的性质）”并展示 `Object.defineProperty(..)` 的使用。然而在 `Object.assign(..)` 中发生的复制是单纯的 `=` 式赋值，所以任何在源对象属性的特殊性质（比如 `writable`）在目标对象上 **都不会保留** 。

### 属性描述符（Property Descriptors）

在 ES5 之前，JavaScript 语言没有给出直接的方法，让你的代码可以考察或描述属性性质间的区别，比如属性是否为只读。

在 ES5 中，所有的属性都用 **属性描述符（Property Descriptors）** 来描述。

考虑这段代码：

```js
var myObject = {
	a: 2
};

Object.getOwnPropertyDescriptor( myObject, "a" );
// {
//    value: 2,
//    writable: true,
//    enumerable: true,
//    configurable: true
// }
```

正如你所见，我们普通的对象属性 `a` 的属性描述符（称为“数据描述符”，因为它仅持有一个数据值）的内容要比 `value` 为 `2` 多得多。它还包含另外三个性质：`writable`、`enumerable`、和 `configurable`。

当我们创建一个普通属性时，可以看到属性描述符的各种性质的默认值，同时我们可以用 `Object.defineProperty(..)` 来添加新属性，或使用期望的性质来修改既存的属性（如果它是 `configurable` 的！）。

举例来说：

```js
var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: true,
	configurable: true,
	enumerable: true
} );

myObject.a; // 2
```

使用 `defineProperty(..)`，我们手动、明确地在 `myObject` 上添加了一个直白的，普通的 `a` 属性。然而，你通常不会使用这种手动方法，除非你想要把描述符的某个性质修改为不同的值。

#### 可写性（Writable）

`writable` 控制着你改变属性值的能力。

考虑这段代码：

```js
var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: false, // 不可写！
	configurable: true,
	enumerable: true
} );

myObject.a = 3;

myObject.a; // 2
```

如你所见，我们对 `value` 的修改悄无声息地失败了。如果我们在 `strict mode` 下进行尝试，会得到一个错误：

```js
"use strict";

var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: false, // 不可写！
	configurable: true,
	enumerable: true
} );

myObject.a = 3; // TypeError
```

这个 `TypeError` 告诉我们，我们不能改变一个不可写属性。

**注意：** 我们一会儿就会讨论 getters/setters，但是简单地说，你可以观察到 `writable:false` 意味着值不可改变，和你定义一个空的 setter 是有些等价的。实际上，你的空 setter 在被调用时需要扔出一个 `TypeError`，来和 `writable:false` 保持一致。

#### 可配置性（Configurable）

只要属性当前是可配置的，我们就可以使用相同的 `defineProperty(..)` 工具，修改它的描述符定义。

```js
var myObject = {
	a: 2
};

myObject.a = 3;
myObject.a;					// 3

Object.defineProperty( myObject, "a", {
	value: 4,
	writable: true,
	configurable: false,	// 不可配置！
	enumerable: true
} );

myObject.a;					// 4
myObject.a = 5;
myObject.a;					// 5

Object.defineProperty( myObject, "a", {
	value: 6,
	writable: true,
	configurable: true,
	enumerable: true
} ); // TypeError
```

最后的 `defineProperty(..)` 调用导致了一个 TypeError，这与 `strict mode` 无关，如果你试图改变一个不可配置属性的描述符定义，就会发生 TypeError。要小心：如你所看到的，将 `configurable` 设置为 `false` 是 **一个单向操作，不可撤销！**

**注意：** 这里有一个需要注意的微小例外：即便属性已经是 `configurable:false`，`writable` 总是可以没有错误地从 `true` 改变为 `false`，但如果已经是 `false` 的话不能变回 `true`。

`configurable:false` 阻止的另外一个事情是使用 `delete` 操作符移除既存属性的能力。

```js
var myObject = {
	a: 2
};

myObject.a;				// 2
delete myObject.a;
myObject.a;				// undefined

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: true,
	configurable: false,
	enumerable: true
} );

myObject.a;				// 2
delete myObject.a;
myObject.a;				// 2
```

如你所见，最后的 `delete` 调用（无声地）失败了，因为我们将 `a` 属性设置成了不可配置。

`delete` 仅用于直接从目标对象移除该对象的（可以被移除的）属性。如果一个对象的属性是某个其他对象/函数的最后一个现存的引用，而你 `delete` 了它，那么这就移除了这个引用，于是现在那个没有被任何地方所引用的对象/函数就可以被作为垃圾回收。但是，将 `delete` 当做一个像其他语言（如 C/C++）中那样的释放内存工具是 **不** 恰当的。`delete` 仅仅是一个对象属性移除操作 —— 没有更多别的含义。

#### 可枚举性（Enumerable）

我们将要在这里提到的最后一个描述符性质是 `enumerable`（还有另外两个，我们将在一会儿讨论 getter/setters 时谈到）。

它的名称可能已经使它的功能很明显了，这个性质控制着一个属性是否能在特定的对象-属性枚举操作中出现，比如 `for..in` 循环。设置为 `false` 将会阻止它出现在这样的枚举中，即使它依然完全是可以访问的。设置为 `true` 会使它出现。

所有普通的用户定义属性都默认是可 `enumerable` 的，正如你通常希望的那样。但如果你有一个特殊的属性，你想让它对枚举隐藏，就将它设置为 `enumerable:false`。

我们一会儿就更加详细地演示可枚举性，所以在大脑中给这个话题上打一个书签。

### 不可变性（Immutability）

有时我们希望将属性或对象（有意或无意地）设置为不可改变的。ES5 用几种不同的微妙方式，加入了对此功能的支持。

一个重要的注意点是：**所有** 这些方法创建的都是浅不可变性。也就是，它们仅影响对象和它的直属属性的性质。如果对象拥有对其他对象（数组、对象、函数等）的引用，那个对象的 *内容* 不会受影响，任然保持可变。

```js
myImmutableObject.foo; // [1,2,3]
myImmutableObject.foo.push( 4 );
myImmutableObject.foo; // [1,2,3,4]
```

在这段代码中，我们假设 `myImmutableObject` 已经被创建，而且被保护为不可变。但是，为了保护 `myImmutableObject.foo` 的内容（也是一个对象 —— 数组），你将需要使用下面的一个或多个方法将 `foo` 设置为不可变。

**注意：** 在 JS 程序中创建完全不可动摇的对象是不那么常见的。有些特殊情况当然需要，但作为一个普通的设计模式，如果你发现自己想要 *封印（seal）* 或 *冻结（freeze）* 你所有的对象，那么你可能想要退一步来重新考虑你的程序设计，让它对对象值的潜在变化更加健壮。

#### 对象常量（Object Constant）

通过将 `writable:false` 与 `configurable:false` 组合，你可以实质上创建了一个作为对象属性的 *常量*（不能被改变，重定义或删除），比如：

```js
var myObject = {};

Object.defineProperty( myObject, "FAVORITE_NUMBER", {
	value: 42,
	writable: false,
	configurable: false
} );
```

#### 防止扩展（Prevent Extensions）

如果你想防止一个对象被添加新的属性，但另一方面保留其他既存的对象属性，可以调用 `Object.preventExtensions(..)`：

```js
var myObject = {
	a: 2
};

Object.preventExtensions( myObject );

myObject.b = 3;
myObject.b; // undefined
```

在非 `strict mode` 模式下，`b` 的创建会无声地失败。在 `strict mode` 下，它会抛出 `TypeError`。

#### 封印（Seal）

`Object.seal(..)` 创建一个“封印”的对象，这意味着它实质上在当前的对象上调用 `Object.preventExtensions(..)`，同时也将它所有的既存属性标记为 `configurable:false`。

所以，你既不能添加更多的属性，也不能重新配置或删除既存属性（虽然你依然 *可以* 修改它们的值）。

#### 冻结（Freeze）

`Object.freeze(..)` 创建一个冻结的对象，这意味着它实质上在当前的对象上调用 `Object.seal(..)`，同时也将它所有的“数据访问”属性设置为 `writable:false`，所以它们的值不可改变。

这种方法是你可以从对象自身获得的最高级别的不可变性，因为它阻止任何对对象或对象直属属性的改变（虽然，就像上面提到的，任何被引用的对象的内容不受影响）。

你可以“深度冻结”一个对象：在这个对象上调用 `Object.freeze(..)`，然后递归地迭代所有它引用的（目前还没有受过影响的）对象，然后也在它们上面调用 `Object.freeze(..)`。但是要小心，这可能会影响其他你并不打算影响的（共享的）对象。

### `[[Get]]`

关于属性访问如何工作有一个重要的细节。

考虑下面的代码：

```js
var myObject = {
	a: 2
};

myObject.a; // 2
```

`myObject.a` 是一个属性访问，但是它并不是看起来那样，仅仅在 `myObject` 中寻找一个名为 `a` 的属性。

根据语言规范，上面的代码实际上在 `myObject` 上执行了一个 `[[Get]]` 操作（有些像 `[[Get]]()` 函数调用）。对一个对象进行默认的内建 `[[Get]]` 操作，会 *首先* 检查对象，寻找一个拥有被请求的名称的属性，如果找到，就返回相应的值。

然而，如果按照被请求的名称 *没能* 找到属性，`[[Get]]` 的算法定义了另一个重要的行为。我们会在第五章来解释 *接下来* 会发生什么（遍历 `[[Prototype]]` 链，如果有的话）。

但 `[[Get]]` 操作的一个重要结果是，如果它通过任何方法都不能找到被请求的属性的值，那么它会返回 `undefined`。

```js
var myObject = {
	a: 2
};

myObject.b; // undefined
```

这个行为和你通过标识符名称来引用 *变量* 不同。如果你引用了一个在可用的词法作用域内无法解析的变量，其结果不是像对象属性那样返回 `undefined`，而是抛出一个 `ReferenceError`。

```js
var myObject = {
	a: undefined
};

myObject.a; // undefined

myObject.b; // undefined
```

从 *值* 的角度来说，这两个引用没有区别 —— 它们的结果都是 `undefined`。然而，在 `[[Get]]` 操作的底层，虽然不明显，但是比起处理引用 `myObject.a`，处理 `myObject.b` 的操作要多做一些潜在的“工作”。

如果仅仅考察结果的值，你无法分辨一个属性是存在并持有一个 `undefined` 值，还是因为属性根本 *不* 存在所以 `[[Get]]` 无法返回某个具体值而返回默认的 `undefined`。但是，你很快就能看到你其实 *可以* 分辨这两种场景。

### `[[Put]]`

既然为了从一个属性中取得值而存在一个内部定义的 `[[Get]]` 操作，那么很明显应该也存在一个默认的 `[[Put]]` 操作。

这很容易让人认为，给一个对象的属性赋值，将会在这个对象上调用 `[[Put]]` 来设置或创建这个属性。但是实际情况却有一些微妙的不同。

调用 `[[Put]]` 时，它根据几个因素表现不同的行为，包括（影响最大的）属性是否已经在对象中存在了。

如果属性存在，`[[Put]]` 算法将会大致检查：

1. 这个属性是访问器描述符吗（见下一节"Getters 与 Setters"）？**如果是，而且是 setter，就调用 setter。**
2. 这个属性是 `writable` 为 `false` 数据描述符吗？**如果是，在非 `strict mode` 下无声地失败，或者在 `strict mode` 下抛出 `TypeError`。**
3. 否则，像平常一样设置既存属性的值。

如果属性在当前的对象中还不存在，`[[Put]]` 操作会变得更微妙和复杂。我们将在第五章讨论 `[[Prototype]]` 时再次回到这个场景，更清楚地解释它。

### Getters 与 Setters

对象默认的 `[[Put]]` 和 `[[Get]]` 操作分别完全控制着如何设置既存或新属性的值，和如何取得既存属性。

**注意：** 使用较先进的语言特性，覆盖整个对象（不仅是每个属性）的默认 `[[Put]]` 和 `[[Get]]` 操作是可能的。这超出了我们要在这本书中讨论的范围，但我们会在后面的“你不懂 JS”系列中涵盖此内容。

ES5 引入了一个方法来覆盖这些默认操作的一部分，但不是在对象级别而是针对每个属性，就是通过 getters 和 setters。Getter 是实际上调用一个隐藏函数来取得值的属性。Setter 是实际上调用一个隐藏函数来设置值的属性。

当你将一个属性定义为拥有 getter 或 setter 或两者兼备，那么它的定义就成为了“访问器描述符”（与“数据描述符”相对）。对于访问器描述符，它的 `value` 和 `writable` 性质因没有意义而被忽略，取而代之的是 JS 将会考虑属性的 `set` 和 `get` 性质（还有 `configurable` 和 `enumerable`）。

考虑下面的代码：

```js
var myObject = {
	// 为 `a` 定义一个 getter
	get a() {
		return 2;
	}
};

Object.defineProperty(
	myObject,	// 目标对象
	"b",		// 属性名
	{			// 描述符
		// 为 `b` 定义 getter
		get: function(){ return this.a * 2 },

		// 确保 `b` 作为对象属性出现
		enumerable: true
	}
);

myObject.a; // 2

myObject.b; // 4
```

不管是通过在字面对象语法中使用 `get a() { .. }`，还是通过使用 `defineProperty(..)` 明确定义，我们都在对象上创建了一个没有实际持有值的属性，访问它们将会自动地对 getter 函数进行隐藏的函数调用，其返回的任何值就是属性访问的结果。

```js
var myObject = {
	// 为 `a` 定义 getter
	get a() {
		return 2;
	}
};

myObject.a = 3;

myObject.a; // 2
```

因为我们仅为 `a` 定义了一个 getter，如果之后我们试着设置 `a` 的值，赋值操作并不会抛出错误而是无声地将赋值废弃。就算这里有一个合法的 setter，我们的自定义 getter 将返回值硬编码为仅返回 `2`，所以赋值操作是没有意义的。

为了使这个场景更合理，正如你可能期望的那样，每个属性还应当被定义一个覆盖默认 `[[Put]]` 操作（也就是赋值）的 setter。几乎可确定，你将总是想要同时声明 getter 和 setter（仅有它们中的一个经常会导致意外的行为）：

```js
var myObject = {
	// 为 `a` 定义 getter
	get a() {
		return this._a_;
	},

	// 为 `a` 定义 setter
	set a(val) {
		this._a_ = val * 2;
	}
};

myObject.a = 2;

myObject.a; // 4
```

**注意：** 在这个例子中，我们实际上将赋值操作（`[[Put]]` 操作）指定的值 `2` 存储到了另一个变量 `_a_` 中。`_a_` 这个名称只是用在这个例子中的单纯惯例，并不意味着它的行为有什么特别之处 —— 它和其他普通属性没有区别。

### 存在性（Existence）

我们早先看到，像 `myObject.a` 这样的属性访问可能会得到一个 `undefined` 值，无论是它明确存储着 `undefined` 还是属性 `a` 根本就不存在。那么，如果这两种情况的值相同，我们还怎么区别它们呢？

我们可以查询一个对象是否拥有特定的属性，而 *不必* 取得那个属性的值：

```js
var myObject = {
	a: 2
};

("a" in myObject);				// true
("b" in myObject);				// false

myObject.hasOwnProperty( "a" );	// true
myObject.hasOwnProperty( "b" );	// false
```

`in` 操作符会检查属性是否存在于对象 *中*，或者是否存在于 `[[Prototype]]` 链对象遍历的更高层中（详见第五章）。相比之下，`hasOwnProperty(..)` *仅仅* 检查 `myObject` 是否拥有属性，但 *不会* 查询 `[[Prototype]]` 链。我们会在第五章详细讲解 `[[Prototype]]` 时，回来讨论这个两个操作重要的不同。

通过委托到 `Object.prototype`，所有的普通对象都可以访问 `hasOwnProperty(..)`（详见第五章）。但是创建一个不链接到 `Object.prototype` 的对象也是可能的（通过 `Object.create(null)` —— 详见第五章）。这种情况下，像 `myObject.hasOwnProperty(..)` 这样的方法调用将会失败。

在这种场景下，一个进行这种检查的更健壮的方式是 `Object.prototype.hasOwnProperty.call(myObject,"a")`，它借用基本的 `hasOwnProperty(..)` 方法而且使用 *明确的 `this` 绑定*（详见第二章）来对我们的 `myObject` 实施这个方法。

**注意：** `in` 操作符看起来像是要检查一个值在容器中的存在性，但是它实际上检查的是属性名的存在性。在使用数组时注意这个区别十分重要，因为我们会有很强的冲动来进行 `4 in [2, 4, 6]` 这样的检查，但是这总是不像我们想象的那样工作。

#### 枚举（Enumeration）

先前，在学习 `enumerable` 属性描述符性质时，我们简单地解释了"可枚举性（enumerability）"的含义。现在，让我们来更加详细地重新讲解它。

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// 使 `a` 可枚举，如一般情况
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// 使 `b` 不可枚举
	{ enumerable: false, value: 3 }
);

myObject.b; // 3
("b" in myObject); // true
myObject.hasOwnProperty( "b" ); // true

// .......

for (var k in myObject) {
	console.log( k, myObject[k] );
}
// "a" 2
```

你会注意到，`myObject.b` 实际上 **存在**，而且拥有可以访问的值，但是它不出现在 `for..in` 循环中（然而令人诧异的是，它的 `in` 操作符的存在性检查通过了）。这是因为 “enumerable” 基本上意味着“如果对象的属性被迭代时会被包含在内”。

**注意：** 将 `for..in` 循环实施在数组上可能会给出意外的结果，因为枚举一个数组将不仅包含所有的数字下标，还包含所有的可枚举属性。所以一个好主意是：将 `for..in` 循环 *仅* 用于对象，而为存储在数组中的值使用传统的 `for` 循环并用数字索引迭代。

另一个可以区分可枚举和不可枚举属性的方法是：

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// 使 `a` 可枚举，如一般情况
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// 使 `b` 不可枚举
	{ enumerable: false, value: 3 }
);

myObject.propertyIsEnumerable( "a" ); // true
myObject.propertyIsEnumerable( "b" ); // false

Object.keys( myObject ); // ["a"]
Object.getOwnPropertyNames( myObject ); // ["a", "b"]
```

`propertyIsEnumerable(..)` 测试一个给定的属性名是否直 *接存* 在于对象上，并且是 `enumerable:true`。

`Object.keys(..)` 返回一个所有可枚举属性的数组，而 `Object.getOwnPropertyNames(..)` 返回一个 *所有* 属性的数组，不论能不能枚举。

`in` 和 `hasOwnProperty(..)` 区别于它们是否查询 `[[Prototype]]` 链，而 `Object.keys(..)` 和 `Object.getOwnPropertyNames(..)` 都 *只* 考察直接给定的对象。

（当下）没有与 `in` 操作符的查询方式（在整个 `[[Prototype]]` 链上遍历所有的属性，如我们在第五章解释的）等价的、内建的方法可以得到一个 **所有属性** 的列表。你可以近似地模拟一个这样的工具：递归地遍历一个对象的 `[[Prototype]]` 链，在每一层都从 `Object.keys(..)` 中取得一个列表——仅包含可枚举属性。

## 迭代（Iteration）

`for..in` 循环迭代一个对象上（包括它的 `[[Prototype]]` 链）所有的可迭代属性。但如果你想要迭代值呢？

在数字索引的数组中，典型的迭代所有的值的办法是使用标准的 `for` 循环，比如：

```js
var myArray = [1, 2, 3];

for (var i = 0; i < myArray.length; i++) {
	console.log( myArray[i] );
}
// 1 2 3
```

但是这并没有迭代所有的值，而是迭代了所有的下标，然后由你使用索引来引用值，比如 `myArray[i]`。

ES5 还为数组加入了几个迭代帮助方法，包括 `forEach(..)`、`every(..)`、和 `some(..)`。这些帮助方法的每一个都接收一个回调函数，这个函数将施用于数组中的每一个元素，仅在如何响应回调的返回值上有所不同。

`forEach(..)` 将会迭代数组中所有的值，并且忽略回调的返回值。`every(..)` 会一直迭代到最后，*或者* 当回调返回一个 `false`（或“falsy”）值，而 `some(..)` 会一直迭代到最后，*或者* 当回调返回一个 `true`（或“truthy”）值。

这些在 `every(..)` 和 `some(..)` 内部的特殊返回值有些像普通 `for` 循环中的 `break` 语句，它们可以在迭代执行到末尾之前将它结束掉。

如果你使用 `for..in` 循环在一个对象上进行迭代，你也只能间接地得到值，因为它实际上仅仅迭代对象的所有可枚举属性，让你自己手动地去访问属性来得到值。

**注意：** 与以有序数字的方式（`for` 循环或其他迭代器）迭代数组的下标比较起来，迭代对象属性的顺序是 **不确定** 的，而且可能会因 JS 引擎的不同而不同。对于需要跨平台环境保持一致的问题，**不要依赖** 观察到的顺序，因为这个顺序是不可靠的。

但是如果你想直接迭代值，而不是数组下标（或对象属性）呢？ES6 加入了一个有用的 `for..of` 循环语法，用来迭代数组（和对象，如果这个对象有定义的迭代器）：

```js
var myArray = [ 1, 2, 3 ];

for (var v of myArray) {
	console.log( v );
}
// 1
// 2
// 3
```

`for..of` 循环要求被迭代的 *东西* 提供一个迭代器对象（从一个在语言规范中叫做 `@@iterator` 的默认内部函数那里得到），每次循环都调用一次这个迭代器对象的 `next()` 方法，循环迭代的内容就是这些连续的返回值。

数组拥有内建的 `@@iterator`，所以正如展示的那样，`for..of` 对于它们很容易使用。但是让我们使用内建的 `@@iterator` 来手动迭代一个数组，来看看它是怎么工作的：

```js
var myArray = [ 1, 2, 3 ];
var it = myArray[Symbol.iterator]();

it.next(); // { value:1, done:false }
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { done:true }
```

**注意：** 我们使用一个 ES6 的 `Symbol`：`Symbol.iterator` 来取得一个对象的 `@@iterator` *内部属性*。我们在本章中简单地提到过 `Symbol` 的语义（见“计算型属性名”），同样的原理也适用于这里。你总是希望通过 `Symbol` 名称，而不是它可能持有的特殊的值，来引用这样特殊的属性。另外，尽管这个名称有这样的暗示，但 `@@iterator` 本身 **不是迭代器对象**， 而是一个返回迭代器对象的 **方法** —— 一个重要的细节！

正如上面的代码段揭示的，迭代器的 `next()` 调用的返回值是一个 `{ value: .. , done: .. }` 形式的对象，其中 `value` 是当前迭代的值，而 `done` 是一个 `boolean`，表示是否还有更多内容可以迭代。

注意值 `3` 和 `done:false` 一起返回，猛地一看会有些奇怪。你不得不第四次调用 `next()`（在前一个代码段的 `for..of` 循环会自动这样做）来得到 `done:true`，以使自己知道迭代已经完成。这个怪异之处的原因超出了我们要在这里讨论的范围，但是它源自于 ES6 生成器（generator）函数的语义。

虽然数组可以在 `for..of` 循环中自动迭代，但普通的对象 **没有内建的 `@@iterator`**。这种故意省略的原因要比我们将在这里解释的更复杂，但一般来说，为了未来的对象类型，最好不要加入那些可能最终被证明是麻烦的实现。

但是 *可以* 为你想要迭代的对象定义你自己的默认 `@@iterator`。比如：

```js
var myObject = {
	a: 2,
	b: 3
};

Object.defineProperty( myObject, Symbol.iterator, {
	enumerable: false,
	writable: false,
	configurable: true,
	value: function() {
		var o = this;
		var idx = 0;
		var ks = Object.keys( o );
		return {
			next: function() {
				return {
					value: o[ks[idx++]],
					done: (idx > ks.length)
				};
			}
		};
	}
} );

// 手动迭代 `myObject`
var it = myObject[Symbol.iterator]();
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { value:undefined, done:true }

// 用 `for..of` 迭代 `myObject`
for (var v of myObject) {
	console.log( v );
}
// 2
// 3
```

**注意：** 我们使用了 `Object.defineProperty(..)` 来自定义我们的 `@@iterator`（很大程度上是因为我们可以将它指定为不可枚举的），但是通过将 `Symbol` 作为一个 *计算型属性名*（在本章前面的部分讨论过），我们也可以直接声明它，比如 `var myObject = { a:2, b:3, [Symbol.iterator]: function(){ /* .. */ } }`。

每次 `for..of` 循环在 `myObject` 的迭代器对象上调用 `next()` 时，迭代器内部的指针将会向前移动并返回对象属性列表的下一个值（关于对象属性/值迭代顺序，参照前面的注意事项）。

我们刚刚演示的迭代，是一个简单的一个值一个值的迭代，当然你可以为你的自定义数据结构定义任意复杂的迭代方法，只要你觉得合适。对于操作用户自定义对象来说，自定义迭代器与 ES6 的 `for..of` 循环相组合，是一个新的强大的语法工具。

举个例子，一个 `Pixel（像素）` 对象列表（拥有 `x` 和 `y` 的坐标值）可以根据距离原点 `(0,0)` 的直线距离决定它的迭代顺序，或者过滤掉那些“太远”的点，等等。只要你的迭代器从 `next()` 调用返回期望的 `{ value: .. }` 返回值，并在迭代结束后返回一个 `{ done: true }` 值，ES6 的 `for..of` 循环就可以迭代它。

其实，你甚至可以生成一个永远不会“结束”，并且总会返回一个新值（比如随机数，递增值，唯一的识别符等等）的“无穷”迭代器，虽然你可能不会将这样的迭代器用于一个没有边界的 `for..of` 循环，因为它永远不会结束，而且会阻塞你的程序。

```js
var randoms = {
	[Symbol.iterator]: function() {
		return {
			next: function() {
				return { value: Math.random() };
			}
		};
	}
};

var randoms_pool = [];
for (var n of randoms) {
	randoms_pool.push( n );

	// 不要超过边界！
	if (randoms_pool.length === 100) break;
}
```

这个迭代器会“永远”生成随机数，所以我们小心地仅从中取出 100 个值，以使我们的程序不被阻塞。

## 复习

JS 中的对象拥有字面形式（比如 `var a = { .. }`）和构造形式（比如 `var a = new Array(..)`）。字面形式几乎总是首选，但在某些情况下，构造形式提供更多的构建选项。

许多人声称“Javascript 中的一切都是对象”，这是不对的。对象是六种（或七中，看你从哪个方面说）基本类型之一。对象有子类型，包括 `function`，还可以被行为特化，比如 `[object Array]` 作为内部的标签表示子类型数组。

对象是键/值对的集合。通过 `.propName` 或 `["propName"]` 语法，值可以作为属性访问。不管属性什么时候被访问，引擎实际上会调用内部默认的 `[[Get]]` 操作（在设置值时调用 `[[Put]]` 操作），它不仅直接在对象上查找属性，在没有找到时还会遍历 `[[Prototype]]` 链（见第五章）。

属性有一些可以通过属性描述符控制的特定性质，比如 `writable` 和 `configurable`。另外，对象拥有它的不可变性（它们的属性也有），可以通过使用 `Object.preventExtensions(..)`、`Object.seal(..)`、和 `Object.freeze(..)` 来控制几种不同等级的不可变性。

属性不必非要包含值 —— 它们也可以是带有 getter/setter 的“访问器属性”。它们也可以是可枚举或不可枚举的，这控制它们是否会在 `for..in` 这样的循环迭代中出现。

你也可以使用 ES6 的 `for..of` 语法，在数据结构（数组，对象等）中迭代 **值**，它寻找一个内建或自定义的 `@@iterator` 对象，这个对象由一个 `next()` 方法组成，通过这个 `next()` 方法每次迭代一个数据。
