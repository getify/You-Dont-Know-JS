# 你不懂JS：ES6与未来
# 第六章：新增API

从值的转换到数学计算，ES6给各种内建原生类型和对象增加了许多静态属性和方法来辅助这些常见任务。另外，一些原生类型的实例通过各种新的原型方法获得了新的能力。

**注意：** 大多数这些特性都可以被忠实地填补。我们不会在这里深入这样的细节，但是关于兼容标准的shim/填补，你可以看一下“ES6 Shim”(https://github.com/paulmillr/es6-shim/)。

## `Array`

在JS中被各种用户库扩展得最多的特性之一就是数组类型。ES6在数组上增加许多静态的和原型（实例）的帮助功能应当并不令人惊讶。

### `Array.of(..)` 静态函数

`Array(..)`的构造器有一个尽人皆知的坑：如果仅有一个参数值被传递，而且这个参数值是一个数字的话，它并不会制造一个含有一个带有该数值元素的数组，而是构建一个长度等于这个数字的空数组。这种操作造成了不幸的和怪异的“空值槽”行为，而这正是JS数组为人诟病的地方。

`Array.of(..)`作为数组首选的函数型构造器取代了`Array(..)`，因为`Array.of(..)`没有那种单数字参数值的情况。考虑如下代码：

```js
var a = Array( 3 );
a.length;						// 3
a[0];							// undefined

var b = Array.of( 3 );
b.length;						// 1
b[0];							// 3

var c = Array.of( 1, 2, 3 );
c.length;						// 3
c;								// [1,2,3]
```

在什么样的环境下，你才会想要是使用`Array.of(..)`来创建一个数组，而不是使用像`c = [1,2,3]`这样的字面语法呢？有两种可能的情况。

如果你有一个回调，传递给它的参数值本应当被包装在一个数组中时，`Array.of(..)`就完美地符合条件。这可能不是那么常见，但是它可以为你的痒处挠上一把。

另一种场景是如果你扩展`Array`构成它的子类，而且希望能够在一个你的子类的实例中创建和初始化元素，比如：

```js
class MyCoolArray extends Array {
	sum() {
		return this.reduce( function reducer(acc,curr){
			return acc + curr;
		}, 0 );
	}
}

var x = new MyCoolArray( 3 );
x.length;						// 3 -- 噢！
x.sum();						// 0 -- 噢！

var y = [3];					// Array，不是 MyCoolArray
y.length;						// 1
y.sum();						// `sum` is not a function

var z = MyCoolArray.of( 3 );
z.length;						// 1
z.sum();						// 3
```

你不能（简单地）只创建一个`MyCoolArray`的构造器，让它覆盖`Array`父构造器的行为，因为这个父构造器对于实际创建一个规范的数组值（初始化`this`）是必要的。在`MyCoolArray`子类上“被继承”的静态`of(..)`方法提供了一个不错的解决方案。

### `Array.from(..)` 静态函数

在JavaScript中一个“类数组对象”是一个拥有`length`属性的对象，这个属性明确地带有0或更高的整数值。

在JS中处理这些值出了名地让人沮丧；将它们变形为真正的数组曾经是十分常见的做法，这样各种`Array.property`方法（`map(..)`，`indexOf(..)`等等）才能与它一起使用。这种处理通常看起来像：

```js
// 类数组对象
var arrLike = {
	length: 3,
	0: "foo",
	1: "bar"
};

var arr = Array.prototype.slice.call( arrLike );
```

另一种`slice(..)`经常被使用的常见任务是，复制一个真正的数组：

```js
var arr2 = arr.slice();
```

在这两种情况下，新的ES6`Array.from(..)`方法是一种更易懂而且更优雅的方式 —— 也不那么冗长：

```js
var arr = Array.from( arrLike );

var arrCopy = Array.from( arr );
```

`Array.from(..)`会查看第一个参数值是否是一个可迭代对象（参见第三章的“迭代器”），如果是，它就使用迭代器来产生值，并将这些值“拷贝”到将要被返回的数组中。因为真正的数组拥有一个可以产生这些值的迭代器，所以这个迭代器会被自动地使用。

但是如果你传递一个类数组对象作为`Array.from(..)`的第一个参数值，它的行为基本上是和`slice()`（不带参数值的！）或`apply()`相同的，它简单地循环所有的值，访问从`0`开始到`length`值的由数字命名的属性。

考虑如下代码：

```js
var arrLike = {
	length: 4,
	2: "foo"
};

Array.from( arrLike );
// [ undefined, undefined, "foo", undefined ]
```

因为在`arrLike`上不存在位置`0`，`1`，和`3`，所以对这些值槽中的每一个，结果都是`undefined`值。

你也可以这样产生类似的结果：

```js
var emptySlotsArr = [];
emptySlotsArr.length = 4;
emptySlotsArr[2] = "foo";

Array.from( emptySlotsArr );
// [ undefined, undefined, "foo", undefined ]
```

#### 避免空值槽

前面的代码段中，在`emptySlotsArr`和`Array.from(..)`调用的结果有一个微妙但重要的不同。`Array.from(..)`从不产生空值槽。

在ES6之前，如果你想要制造一个被初始化为在每个值槽中使用实际`undefined`值（不是空值槽！）的特定长数组，你不得不做一些额外的工作：

```js
var a = Array( 4 );								// 四个空值槽！

var b = Array.apply( null, { length: 4 } );		// 四个 `undefined` 值
```

但现在`Array.from(..)`使这件事简单了些：

```js
var c = Array.from( { length: 4 } );			// 四个 `undefined` 值
```

**警告：** 使用一个像前面代码段中的`a`那样的空值槽数组可以与一些数组函数工作，但是另一些函数会忽略空值槽（比如`map(..)`等）。你永远不应该刻意地使用空值槽，因为它几乎肯定会在你的程序中导致奇怪/不可预料的行为。

#### 映射

`Array.from(..)`工具还有另外一个绝技。第二个参数值，如果被提供的话，是一个映射函数（和普通的`Array#map(..)`几乎相同），它在将每个源值映射/变形为返回的目标值时调用。考虑如下代码：

```js
var arrLike = {
	length: 4,
	2: "foo"
};

Array.from( arrLike, function mapper(val,idx){
	if (typeof val == "string") {
		return val.toUpperCase();
	}
	else {
		return idx;
	}
} );
// [ 0, 1, "FOO", 3 ]
```

**注意：** 就像其他接收回调的数组方法一样，`Array.from(..)`接收可选的第三个参数值，它将被指定为作为第二个参数传递的回调的`this`绑定。否则，`this`将是`undefined`。

一个使用`Array.from(..)`将一个8位值数组翻译为16位值数组的例子，参见第五章的“类型化数组”。

### 创建 Arrays 和子类型

在前面几节中，我们讨论了`Array.of(..)`和`Array.from(..)`，它们都用与构造器相似的方法创建一个新数组。但是在子类中它们会怎么做？它们是创建基本`Array`的实例，还是创建衍生的子类的实例？

```js
class MyCoolArray extends Array {
	..
}

MyCoolArray.from( [1, 2] ) instanceof MyCoolArray;	// true

Array.from(
	MyCoolArray.from( [1, 2] )
) instanceof MyCoolArray;							// false
```

`of(..)`和`from(..)`都使用它们被访问时的构造器来构建数组。所以如果你使用基本的`Array.of(..)`你将得到`Array`实例，但如果你使用`MyCoolArray.of(..)`，你将得到一个`MyCoolArray`实例。

在第三章的“类”中，我们讲解了在所有内建类（比如`Array`）中定义好的`@@species`设定，它被用于任何创建新实例的原型方法。`slice(..)`是一个很棒的例子：

```js
var x = new MyCoolArray( 1, 2, 3 );

x.slice( 1 ) instanceof MyCoolArray;				// true
```

一般来说，这种默认行为将可能是你想要的，但是正如我们在第三章中讨论过的，如果你想的话你 *可以* 覆盖它：

```js
class MyCoolArray extends Array {
	// 强制 `species` 为父类构造器
	static get [Symbol.species]() { return Array; }
}

var x = new MyCoolArray( 1, 2, 3 );

x.slice( 1 ) instanceof MyCoolArray;				// false
x.slice( 1 ) instanceof Array;						// true
```

要注意的是，`@@species`设定仅适用于原型方法，比如`slice(..)`。`of(..)`和`from(..)`不使用它；它们俩都只使用`this`绑定（哪个构造器被用于发起引用）。考虑如下代码：

```js
class MyCoolArray extends Array {
	// 强制 `species` 为父类构造器
	static get [Symbol.species]() { return Array; }
}

var x = new MyCoolArray( 1, 2, 3 );

MyCoolArray.from( x ) instanceof MyCoolArray;		// true
MyCoolArray.of( [2, 3] ) instanceof MyCoolArray;	// true
```

### `copyWithin(..)` 原型方法

`Array#copyWithin(..)`是一个对所有数组可用的新修改器方法（包括类型化数组；参加第五章）。`copyWithin(..)`将数组的一部分拷贝到同一个数组的其他位置，覆盖之前存在在那里的任何东西。

它的参数值是 *目标*（要被拷贝到的索引位置），*开始*（拷贝开始的索引位置（含）），和可选的 *结束*（拷贝结束的索引位置（不含））。如果这些参数值中存在任何负数，那么它们就被认为是相对于数组的末尾。

考虑如下代码：

```js
[1,2,3,4,5].copyWithin( 3, 0 );			// [1,2,3,1,2]

[1,2,3,4,5].copyWithin( 3, 0, 1 );		// [1,2,3,1,5]

[1,2,3,4,5].copyWithin( 0, -2 );		// [4,5,3,4,5]

[1,2,3,4,5].copyWithin( 0, -2, -1 );	// [4,2,3,4,5]
```

`copyWithin(..)`方法不会扩张数组的长度，就像前面代码段中的第一个例子展示的。当到达数组的末尾时拷贝就会停止。

与你可能想象的不同，拷贝的顺序并不总是从左到右的。如果起始位置与目标为重叠的话，它有可能造成已经被拷贝过的值被重复拷贝，这大概不是你期望的行为。

所以在这种情况下，算法内部通过相反的拷贝顺序来避免这个坑。考虑如下代码：

```js
[1,2,3,4,5].copyWithin( 2, 1 );		// ???
```

如果算法是严格的从左到右，那么`2`应当被拷贝来覆盖`3`，然后这个被拷贝的`2`应当被拷贝来覆盖`4`，然后这个被拷贝的`2`应当被拷贝来覆盖`5`，而你最终会得到`[1,2,2,2,2]`。

与此不同的是，拷贝算法把方向反转过来，拷贝`4`来覆盖`5`，然后拷贝`3`来覆盖`4`，然后拷贝`2`来覆盖`3`，而最后的结果是`[1,2,2,3,4]`。就期待的结果而言这可能更“正确”，但是如果你仅以单纯的从左到右的方式考虑拷贝算法的话，它就可能让人糊涂。

### `fill(..)` 原型方法

ES6中的`Array#fill(..)`方法原生地支持使用一个指定的值来完全地（或部分地）填充一个既存的数组：

```js
var a = Array( 4 ).fill( undefined );
a;
// [undefined,undefined,undefined,undefined]
```

`fill(..)`可选地接收 *开始* 与 *结束* 参数，它们指示要被填充的数组的一部分，比如：

```js
var a = [ null, null, null, null ].fill( 42, 1, 3 );

a;									// [null,42,42,null]
```

### `find(..)` 原型方法

一般来说，在一个数组中搜索一个值的最常见方法曾经是`indexOf(..)`方法，如果值被找到的话它返回值的位置索引，没有找到的话返回`-1`：

```js
var a = [1,2,3,4,5];

(a.indexOf( 3 ) != -1);				// true
(a.indexOf( 7 ) != -1);				// false

(a.indexOf( "2" ) != -1);			// false
```

`indexOf(..)`比较要求一个严格`===`匹配，所以搜索`"2"`找不到值`2`，反之亦然。没有办法覆盖`indexOf(..)`的匹配算法。不得不手动与值`-1`进行比较也很不幸/不优雅。

**提示：** 一个使用`~`操作符来绕过难看的`-1`的有趣（而且争议性地令人糊涂）技术，参见本系列的 *类型与文法*。

从ES5开始，控制匹配逻辑的最常见的迂回方法是`some(..)`。它的工作方式是为每一个元素调用一个回调函数，直到这些调用中的一个返回`true`/truthy值，然后它就会停止。因为是由你来定义这个回调函数，所以你就拥有了如何做出匹配的完全控制权：

```js
var a = [1,2,3,4,5];

a.some( function matcher(v){
	return v == "2";
} );								// true

a.some( function matcher(v){
	return v == 7;
} );								// false
```

但这种方式的缺陷是你只能使用`true`/`false`来指示是否找到了合适的匹配值，而不是实际被匹配的值。

ES6的`find(..)`解决了这个问题。它的工作方式基本上与`some(..)`相同，除了一旦回调返回一个`true`/truthy值，实际的数组值就会被返回：

```js
var a = [1,2,3,4,5];

a.find( function matcher(v){
	return v == "2";
} );								// 2

a.find( function matcher(v){
	return v == 7;					// undefined
});
```

使用一个自定义的`matcher(..)`函数还允许你与对象这样的复杂值进行匹配：

```js
var points = [
	{ x: 10, y: 20 },
	{ x: 20, y: 30 },
	{ x: 30, y: 40 },
	{ x: 40, y: 50 },
	{ x: 50, y: 60 }
];

points.find( function matcher(point) {
	return (
		point.x % 3 == 0 &&
		point.y % 4 == 0
	);
} );								// { x: 30, y: 40 }
```

**注意：** 和其他接收回调的数组方法一样，`find(..)`接收一个可选的第二参数。如果它被设置了的话，就将被指定为作为第一个参数传递的回调的`this`绑定。否则，`this`将是`undefined`。

### `findIndex(..)` 原型方法

虽然前一节展示了`some(..)`如何在一个数组检索给出一个Boolean结果，和`find(..)`如何从数组检索中给出匹配的值，但是还有一种需求是寻找匹配的值的位置索引。

`indexOf(..)`可以完成这个任务，但是没有办法控制它的匹配逻辑；它总是使用`===`严格等价。所以ES6的`findIndex(..)`才是答案：

```js
var points = [
	{ x: 10, y: 20 },
	{ x: 20, y: 30 },
	{ x: 30, y: 40 },
	{ x: 40, y: 50 },
	{ x: 50, y: 60 }
];

points.findIndex( function matcher(point) {
	return (
		point.x % 3 == 0 &&
		point.y % 4 == 0
	);
} );								// 2

points.findIndex( function matcher(point) {
	return (
		point.x % 6 == 0 &&
		point.y % 7 == 0
	);
} );								// -1
```

不要使用`findIndex(..) != -1`（在`indexOf(..)`中经常这么干）来从检索中取得一个boolean，因为`some(..)`已经给出了你想要的`true`/`false`了。而且也不要用`a[ a.findIndex(..) ]`来取得一个匹配的值，因为这是`find(..)`完成的任务。最后，如果你需要严格匹配的索引，就使用`indexOf(..)`，如果你需要一个更加定制化的匹配，就使用`findIndex(..)`。

**注意：** 和其他接收回调的数组方法一样，`findIndex(..)`接收一个可选的第二参数。如果它被设置了的话，就将被指定为作为第一个参数传递的回调的`this`绑定。否则，`this`将是`undefined`。

### `entries()`, `values()`, `keys()` 原型方法

在第三章中，我们展示了数据结构如何通过一个迭代器来提供一种模拟逐个值的迭代。然后我们在第五章探索新的ES6集合（Map，Set，等）如何为了产生不同种类的迭代器而提供几种方法时阐述了这种方式。

因为`Array`并不是ES6的新东西，所以它可能不被认为是一个传统意义上的“集合”，但是在它提供了相同的迭代器方法：`entries()`，`values()`，和`keys()`的意义上，它是的。考虑如下代码：

```js
var a = [1,2,3];

[...a.values()];					// [1,2,3]
[...a.keys()];						// [0,1,2]
[...a.entries()];					// [ [0,1], [1,2], [2,3] ]

[...a[Symbol.iterator]()];			// [1,2,3]
```

就像`Set`一样，默认的`Array`迭代器与`values()`放回的东西相同。

在本章早先的“避免空值槽”一节中，我们展示了`Array.from(..)`如何将一个数组中的空值槽看作带有`undefined`的存在值槽。其实际的原因是，在底层数组迭代器就是以这种方式动作的：

```js
var a = [];
a.length = 3;
a[1] = 2;

[...a.values()];		// [undefined,2,undefined]
[...a.keys()];			// [0,1,2]
[...a.entries()];		// [ [0,undefined], [1,2], [2,undefined] ]
```

## `Object`

几个额外的静态帮助方法已经被加入`Object`。从传统意义上讲，这种种类的函数是关注于对象值的行为/能力的。

但是，从ES6开始，`Object`静态函数还用于任意种类的通用全局API —— 那些还没有更自然地存在于其他的某些位置的API（例如，`Array.from(..)`）。

### `Object.is(..)` 静态函数

`Object.is(..)`静态函数进行值的比较，它的风格甚至要比`===`比较还要严格。

`Object(..)`调用底层的`SameValue`算法（ES6语言规范，第7.2.9节）。`SameValue`算法基本上与`===`严格等价比较算法相同（ES6语言规范，第7.2.13节），但是带有两个重要的例外。

考虑如下代码：

```js
var x = NaN, y = 0, z = -0;

x === x;							// false
y === z;							// true

Object.is( x, x );					// true
Object.is( y, z );					// false
```

你应当为严格等价性比较继续使用`===`；`Object.is(..)`不应当被认为是这个操作符的替代品。但是，在你想要严格地识别`NaN`或`-0`值的情况下，`Object.is(..)`是现在的首选方式。

**注意：** ES6还增加了一个`Number.isNaN(..)`工具（在本章稍后讨论），它可能是一个稍稍方便一些的测试；比起`Object.is(x, NaN)`你可能更偏好`Number.isNaN(x)`。你 *可以* 使用笨拙的`x == 0 && 1 / x === -Infinity`来准确地测试`-0`，但在这种情况下`Object.is(x,-0)`要好得多。

### `Object.getOwnPropertySymbols(..)` 静态函数

第二章中的“Symbol”一节讨论了ES6中的新Symbol基本值类型。

Symbol可能将是在对象上最经常被使用的特殊（元）属性。所以引入了`Object.getOwnPropertySymbols(..)`，它仅取回直接存在于对象上的symbol属性：

```js
var o = {
	foo: 42,
	[ Symbol( "bar" ) ]: "hello world",
	baz: true
};

Object.getOwnPropertySymbols( o );	// [ Symbol(bar) ]
```

### `Object.setPrototypeOf(..)` 静态函数

还是在第二章中，我们提到了`Object.setPrototypeOf(..)`工具，它为了 *行为委托* 的目的（意料之中地）设置一个对象的`[[Prototype]]`（参见本系列的 *this与对象原型*）。考虑如下代码：

```js
var o1 = {
	foo() { console.log( "foo" ); }
};
var o2 = {
	// .. o2 的定义 ..
};

Object.setPrototypeOf( o2, o1 );

// 委托至 `o1.foo()`
o2.foo();							// foo
```

另一种方式：

```js
var o1 = {
	foo() { console.log( "foo" ); }
};

var o2 = Object.setPrototypeOf( {
	// .. o2 的定义 ..
}, o1 );

// 委托至 `o1.foo()`
o2.foo();							// foo
```

在前面两个代码段中，`o2`和`o1`之间的关系都出现在`o2`定义的末尾。更常见的是，`o2`和`o1`之间的关系在`o2`定义的上面被指定，就像在类中，而且在对象字面量的`__proto__`中也是这样（参见第二章的“设置`[[Prototype]]`”）。

**警告：** 正如展示的那样，在对象创建之后立即设置`[[Prototype]]`是合理的。但是在很久之后才改变它一般不是一个好主意，而且经常会导致困惑而非清晰。

### `Object.assign(..)` 静态函数

许多JavaScript库/框架都提供将一个对象的属性拷贝/混合到另一个对象中的工具（例如，jQuery的`extend(..)`）。在这些不同的工具中存在着各种微妙的区别，比如一个拥有`undefined`值的属性是否被忽略。

ES6增加了`Object.assign(..)`，它是这些算法的一个简化版本。第一个参数是 *目标对象* 而所有其他的参数是 *源对象*，它们会按照罗列的顺序被处理。对每一个源对象，它自己的（也就是，不是“继承的”）可枚举键，包括symbol，将会好像通过普通`=`赋值那样拷贝。`Object.assign(..)`返回目标对象。

考虑这种对象构成：

```js
var target = {},
	o1 = { a: 1 }, o2 = { b: 2 },
	o3 = { c: 3 }, o4 = { d: 4 };

// 设置只读属性
Object.defineProperty( o3, "e", {
	value: 5,
	enumerable: true,
	writable: false,
	configurable: false
} );

// 设置不可枚举属性
Object.defineProperty( o3, "f", {
	value: 6,
	enumerable: false
} );

o3[ Symbol( "g" ) ] = 7;

// 设置不可枚举 symbol
Object.defineProperty( o3, Symbol( "h" ), {
	value: 8,
	enumerable: false
} );

Object.setPrototypeOf( o3, o4 );
```

仅有属性`a`，`b`，`c`，`e`，和`Symbol("g")`将被拷贝到`target`：

```js
Object.assign( target, o1, o2, o3 );

target.a;							// 1
target.b;							// 2
target.c;							// 3

Object.getOwnPropertyDescriptor( target, "e" );
// { value: 5, writable: true, enumerable: true,
//   configurable: true }

Object.getOwnPropertySymbols( target );
// [Symbol("g")]
```

属性`d`，`f`，和`Symbol("h")`在拷贝中被忽略了；非枚举属性和非自身属性将会被排除在赋值之外。另外，`e`作为一个普通属性赋值被拷贝，而不是作为一个只读属性被复制。

在早先一节中，我们展示了使用`setPrototypeOf(..)`来在对象`o2`和`o1`之间建立一个`[[Prototype]]`关系。这是利用`Object.assign(..)`的另外一种形式：

```js
var o1 = {
	foo() { console.log( "foo" ); }
};

var o2 = Object.assign(
	Object.create( o1 ),
	{
		// .. o2 的定义 ..
	}
);

// 委托至 `o1.foo()`
o2.foo();							// foo
```

**注意：** `Object.create(..)`是一个ES5标准工具，它创建一个`[[Prototype]]`链接好的空对象。更多信息参见本系列的 *this与对象原型*。

## `Math`

ES6增加了几种新的数学工具，它们协助或填补了常见操作的空白。所有这些操作都可以被手动计算，但是它们中的大多数现在都被原生地定义，这样JS引擎就可以优化计算的性能，或者进行与手动计算比起来小数精度更高的计算。

与直接的开发者相比，asm.js/转译的JS代码（参见本系列的 *异步与性能*）更可能是这些工具的使用者。

三角函数：

* `cosh(..)` - 双曲余弦
* `acosh(..)` - 双曲反余弦
* `sinh(..)` - 双曲正弦
* `asinh(..)` - 双曲反正弦
* `tanh(..)` - 双曲正切
* `atanh(..)` - 双曲反正切
* `hypot(..)` - 平方和的平方根（也就是，广义勾股定理）

算数函数：

* `cbrt(..)` - 立方根
* `clz32(..)` - 计数32位二进制表达中前缀的零
* `expm1(..)` - 与`exp(x) - 1`相同
* `log2(..)` - 二进制对数（以2为底的对数）
* `log10(..)` - 以10为底的对数
* `log1p(..)` - 与`log(x + 1)`相同
* `imul(..)` - 两个数字的32为整数乘法

元函数：

* `sign(..)` - 返回数字的符号
* `trunc(..)` - 仅返回一个数字的整数部分
* `fround(..)` - 舍入到最接近的32位（单精度）浮点数值

## `Number`

重要的是，为了你的程序能够正常工作，它必须准确地处理数字。ES6增加了一些额外的属性和函数来辅助常见的数字操作。

两个在`Number`上新增的功能只是既存全局函数的引用：`Number.parseInt(..)`和`Number.parseFloat(..)`。

### 静态属性

ES6以静态属性的形式增加了一些有用的数字常数：

* `Number.EPSILON` - 在任意两个数字之间的最小值：`2^-52`（关于为了应对浮点算数运算不精确的问题而将这个值用做容差的讲解，参见本系列的 *类型与文法* 的第二章）
* `Number.MAX_SAFE_INTEGER` - 可以用一个JS数字值明确且“安全地”表示的最大整数：`2^53 - 1`
* `Number.MIN_SAFE_INTEGER` - 可以用一个JS数字值明确且“安全地”表示的最小整数：`-(2^53 - 1)`或`(-2)^53 + 1`.

**注意：** 关于“安全”整数的更多信息，参见本系列的 *类型与文法* 的第二章。

### `Number.isNaN(..)` 静态函数

标准的全局`isNaN(..)`工具从一开始就坏掉了，因为不仅对实际的`NaN`值返回`true`，而且对不是数字的东西也返回`true`。其原因是它会将参数值强制转换为数字类型（这可能失败而导致一个NaN）。ES6增加了一个修复过的工具`Number.isNaN(..)`，它可以正确工作：

```js
var a = NaN, b = "NaN", c = 42;

isNaN( a );							// true
isNaN( b );							// true —— 噢！
isNaN( c );							// false

Number.isNaN( a );					// true
Number.isNaN( b );					// false —— 修好了！
Number.isNaN( c );					// false
```

### `Number.isFinite(..)` 静态函数

看到像`isFinite(..)`这样的函数名会诱使人们认为它单纯地意味着“不是无限”。但这不十分正确。这个新的ES6工具有更多的微妙之处。考虑如下代码：

```js
var a = NaN, b = Infinity, c = 42;

Number.isFinite( a );				// false
Number.isFinite( b );				// false

Number.isFinite( c );				// true
```

标准的全局`isFinite(..)`会强制转换它收到的参数值，但是`Number.isFinite(..)`会省略强制转换的行为：

```js
var a = "42";

isFinite( a );						// true
Number.isFinite( a );				// false
```

你可能依然偏好强制转换，这时使用全局`isFinite(..)`是一个合法的选择。或者，并且可能是更明智的选择，你可以使用`Number.isFinite(+x)`，它在将`x`传递前明确地将它强制转换为数字（参见本系列的 *类型与文法* 的第四章）。

### 整数相关的静态函数

JavaScript数字值总是浮点数（IEEE-754）。所以判定一个数字是否是“整数”的概念与检查它的类型无关，因为JS没有这样的区分。

取而代之的是，你需要检查这个值是否拥有非零的小数部分。这样做的最简单的方法通常是：

```js
x === Math.floor( x );
```

ES6增加了一个`Number.isInteger(..)`帮助工具，它可以潜在地判定这种性质，而且效率稍微高一些：

```js
Number.isInteger( 4 );				// true
Number.isInteger( 4.2 );			// false
```

**注意：** 在JavaScript中，`4`，`4.`，`4.0`，或`4.0000`之间没有区别。它们都将被认为是一个“整数”，因此都会从`Number.isInteger(..)`中给出`true`。

另外，`Number.isInteger(..)`过滤了一些明显的非整数值，它们在`x === Math.floor(x)`中可能会被混淆：

```js
Number.isInteger( NaN );			// false
Number.isInteger( Infinity );		// false
```

有时候处理“整数”是信息的重点，它可以简化特定的算法。由于为了仅留下整数而进行过滤，JS代码本身不会运行得更快，但是当仅有整数被使用时引擎可以采取几种优化技术（例如，asm.js）。

因为`Number.isInteger(..)`对`Nan`和`Infinity`值的处理，定义一个`isFloat(..)`工具并不像`!Number.isInteger(..)`一样简单。你需要这么做：

```js
function isFloat(x) {
	return Number.isFinite( x ) && !Number.isInteger( x );
}

isFloat( 4.2 );						// true
isFloat( 4 );						// false

isFloat( NaN );						// false
isFloat( Infinity );				// false
```

**注意：** 这看起来可能很奇怪，但是无穷即不应当被认为是整数也不应当被认为是浮点数。

ES6还定义了一个`Number.isSafeInteger(..)`工具，它检查一个值以确保它是一个整数并且在`Number.MIN_SAFE_INTEGER`-`Number.MAX_SAFE_INTEGER`的范围内（包含两端）。

```js
var x = Math.pow( 2, 53 ),
	y = Math.pow( -2, 53 );

Number.isSafeInteger( x - 1 );		// true
Number.isSafeInteger( y + 1 );		// true

Number.isSafeInteger( x );			// false
Number.isSafeInteger( y );			// false
```

## `String`

在ES6之前字符串就已经拥有好几种帮助函数了，但是有更多的内容被加入了进来。

### Unicode 函数

在第二章的“Unicode敏感的字符串操作”中详细讨论了`String.fromCodePoint(..)`，`String#codePointAt(..)`，`String#normalize(..)`。它们被用来改进JS字符串值对Unicode的支持。

```js
String.fromCodePoint( 0x1d49e );			// "𝒞"

"ab𝒞d".codePointAt( 2 ).toString( 16 );		// "1d49e"
```

`normalize(..)`字符串原型方法用来进行Unicode规范化，它将字符与相邻的“组合标志”进行组合，或者将组合好的字符拆开。

一般来说，规范化不会对字符串的内容产生视觉上的影响，但是会改变字符串的内容，这可能会影响`length`属性报告的结果，以及用位置访问字符的行为：

```js
var s1 = "e\u0301";
s1.length;							// 2

var s2 = s1.normalize();
s2.length;							// 1
s2 === "\xE9";						// true
```

`normalize(..)`接受一个可选参数值，它用于指定使用的规范化形式。这个参数值必须是下面四个值中的一个：`"NFC"`（默认），`"NFD"`，`"NFKC"`，或者`"NFKD"`。

**注意：** 规范化形式和它们在字符串上的效果超出了我们要在这里讨论的范围。更多细节参见“Unicode规范化形式”(http://www.unicode.org/reports/tr15/)。

### `String.raw(..)` 静态函数

`String.raw(..)`工具被作为一个内建的标签函数来与字符串字面模板（参见第二章）一起使用，取得不带有任何转译序列处理的未加工的字符串值。

这个函数几乎永远不会被手动调用，但是将与被标记的模板字面量一起使用：

```js
var str = "bc";

String.raw`\ta${str}d\xE9`;
// "\tabcd\xE9", not "	abcdé"
```

在结果字符串中，`\`和`t`是分离的未被加工过的字符，而不是一个转译字符序列`\t`。这对Unicode转译序列也是一样。

### `repeat(..)` 原型函数

在Python和Ruby那样的语言中，你可以这样重复一个字符串：

```js
"foo" * 3;							// "foofoofoo"
```

在JS中这不能工作，因为`*`乘法是仅对数字定义的，因此`"foo"`会被强制转换为`NaN`数字。

但是，ES6定义了一个字符串原型方法`repeat(..)`来完成这个任务：

```js
"foo".repeat( 3 );					// "foofoofoo"
```

### 字符串检验函数

作为对ES6以前的`String#indexOf(..)`和`String#lastIndexOf(..)`的补充，增加了三个新的搜索/检验函数：`startsWith(..)`，`endsWith(..)`，和`includes(..)`。

```js
var palindrome = "step on no pets";

palindrome.startsWith( "step on" );	// true
palindrome.startsWith( "on", 5 );	// true

palindrome.endsWith( "no pets" );	// true
palindrome.endsWith( "no", 10 );	// true

palindrome.includes( "on" );		// true
palindrome.includes( "on", 6 );		// false
```

对于所有这些字符串搜索/检验方法，如果你查询一个空字符串`""`，那么它将要么在字符串的开头被找到，要么就在字符串的末尾被找到。

**警告：** 这些方法默认不接受正则表达式作为检索字符串。关于关闭实施在第一个参数值上的`isRegExp`检查的信息，参见第七章的“正则表达式Symbol”。

## 复习

ES6在各种内建原生对象上增加了许多额外的API帮助函数：

* `Array`增加了`of(..)`和`from(..)`之类的静态函数，以及`copyWithin(..)`和`fill(..)`之类的原型函数。
* `Object`增加了`is(..)`和`assign(..)`之类的静态函数。
* `Math`增加了`acosh(..)`和`clz32(..)`之类的静态函数。
* `Number`增加了`Number.EPSILON`之类的静态属性，以及`Number.isFinite(..)`之类的静态函数。
* `String`增加了`String.fromCodePoint(..)`和`String.raw(..)`之类的静态函数，以及`repeat(..)`和`includes(..)`之类的原型函数。

这些新增函数中的绝大多数都可以被填补（参见ES6 Shim），它们都是受常见的JS库/框架中的工具启发的。
