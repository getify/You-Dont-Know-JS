# 你不懂JS：ES6与未来
# 第七章：元编程

元编程是针对程序本身的行为进行操作的编程。换句话说，它是为你程序的编程而进行的编程。是的，很拗口，对吧？

例如，如果你为了调查对象`a`和另一个对象`b`之间的关系 —— 它们是被`[[Prototype]]`链接的吗？ —— 而使用`a.isPrototypeOf(b)`，这通常称为自省，就是一种形式的元编程。宏（JS中还没有） —— 代码在编译时修改自己 —— 是元编程的另一个明显的例子。使用`for..in`循环枚举一个对象的键，或者检查一个对象是否是一个“类构造器”的 *实例*，是另一些常见的元编程任务。

元编程关注以下的一点或几点：代码检视自己，代码修改自己，或者代码修改默认的语言行为而使其他代码受影响。

元编程的目标是利用语言自身的内在能力使你其他部分的代码更具描述性，表现力，和/或灵活性。由于元编程的 *元* 的性质，要给它一个更精确的定义有些困难。理解元编程的最佳方法是通过代码来观察它。

ES6在JS已经拥有的东西上，增加了几种新的元编程形式/特性。

## 函数名

有一些情况，你的代码想要检视自己并询问某个函数的名称是什么。如果你询问一个函数的名称，答案会有些令人诧异地模糊。考虑如下代码：

```js
function daz() {
	// ..
}

var obj = {
	foo: function() {
		// ..
	},
	bar: function baz() {
		// ..
	},
	bam: daz,
	zim() {
		// ..
	}
};
```

在这前一个代码段中，“`obj.foo()`的名字是什么？”有些微妙。是`"foo"`，`""`，还是`undefined`？那么`obj.bar()`呢 —— 是`"bar"`还是`"baz"`？`obj.bam()`称为`"bam"`还是`"daz"`？`obj.zim()`呢？

另外，作为回调被传递的函数呢？就像：

```js
function foo(cb) {
	// 这里的 `cb()` 的名字是什么？
}

foo( function(){
	// 我是匿名的！
} );
```

在程序中函数可以被好几种方法所表达，而函数的“名字”应当是什么并不总是那么清晰和明确。

更重要的是，我们需要区别函数的“名字”是指它的`name`属性 —— 是的，函数有一个叫做`name`的属性 —— 还是指它词法绑定的名称，比如在`function bar() { .. }`中的`bar`。

词法绑定名称是你将在递归之类的东西中所使用的：

```js
function foo(i) {
	if (i < 10) return foo( i * 2 );
	return i;
}
```

`name`属性是你为了元编程而使用的，所以它才是我们在这里的讨论中所关注的。

产生这种用困惑是因为，在默认情况下一个函数的词法名称（如果有的话）也会被设置为它的`name`属性。实际上，ES5（和以前的）语言规范中并没有官方要求这种行为。`name`属性的设置是一种非标准，但依然相当可靠的行为。在ES6中，它已经被标准化。

**提示：** 如果一个函数的`name`被赋值，它通常是在开发者工具的栈轨迹中使用的名称。

### 推断

但如果函数没有词法名称，`name`属性会怎么样呢？

现在在ES6中，有一个推断规则可以判定一个合理的`name`属性值来赋予一个函数，即使它没有词法名称可用。

考虑如下代码：

```js
var abc = function() {
	// ..
};

abc.name;				// "abc"
```

如果我们给了这个函数一个词法名称，比如`abc = function def() { .. }`，那么`name`属性将理所当然地是`"def"`。但是由于缺少词法名称，直观上名称`"abc"`看起来很合适。

这里是在ES6中将会（或不会）进行名称推断的其他形式：

```js
(function(){ .. });					// name:
(function*(){ .. });				// name:
window.foo = function(){ .. };		// name:

class Awesome {
	constructor() { .. }			// name: Awesome
	funny() { .. }					// name: funny
}

var c = class Awesome { .. };		// name: Awesome

var o = {
	foo() { .. },					// name: foo
	*bar() { .. },					// name: bar
	baz: () => { .. },				// name: baz
	bam: function(){ .. },			// name: bam
	get qux() { .. },				// name: get qux
	set fuz() { .. },				// name: set fuz
	["b" + "iz"]:
		function(){ .. },			// name: biz
	[Symbol( "buz" )]:
		function(){ .. }			// name: [buz]
};

var x = o.foo.bind( o );			// name: bound foo
(function(){ .. }).bind( o );		// name: bound

export default function() { .. }	// name: default

var y = new Function();				// name: anonymous
var GeneratorFunction =
	function*(){}.__proto__.constructor;
var z = new GeneratorFunction();	// name: anonymous
```

`name`属性默认是不可写的，但它是可配置的，这意味着如果有需要，你可以使用`Object.defineProperty(..)`来手动改变它。

## 元属性

在第三章的“`new.target`”一节中，我们引入了一个ES6的新概念：元属性。正如这个名称所暗示的，元属性意在以一种属性访问的形式提供特殊的元信息，而这在以前是不可能的。

在`new.target`的情况下，关键字`new`作为一个属性访问的上下文环境。显然`new`本身不是一个对象，这使得这种能力很特殊。然而，当`new.target`被用于一个构造器调用（一个使用`new`调用的函数/方法）内部时，`new`变成了一个虚拟上下文环境，如此`new.target`就可以指代这个`new`调用的目标构造器。

这是一个元编程操作的典型例子，因为它的意图是从一个构造器调用内部判定原来的`new`的目标是什么，这一般是为了自省（检查类型/结构）或者静态属性访问。

举例来说，你可能想根据一个构造器是被直接调用，还是通过一个子类进行调用，来使它有不同的行为：

```js
class Parent {
	constructor() {
		if (new.target === Parent) {
			console.log( "Parent instantiated" );
		}
		else {
			console.log( "A child instantiated" );
		}
	}
}

class Child extends Parent {}

var a = new Parent();
// Parent instantiated

var b = new Child();
// A child instantiated
```

这里有一个微妙的地方，在`Parent`类定义内部的`constructor()`实际上被给予了这个类的词法名称（`Parent`），即便语法暗示着这个类是一个与构造器分离的不同实体。

**警告：** 与所有的元编程技术一样，要小心不要创建太过聪明的代码，而使未来的你或其他维护你代码的人很难理解。小心使用这些技巧。

## 通用 Symbol

在第二章中的“Symbol”一节中，我们讲解了新的ES6基本类型`symbol`。除了你可以在你自己的程序中定义的symbol以外，JS预定义了几种内建symbol，被称为 *通用（Well Known） Symbols*（WKS）。

定义这些symbol值主要是为了向你的JS程序暴露特殊的元属性来给你更多JS行为的控制权。

我们将简要介绍每一个symbol并讨论它们的目的。

### `Symbol.iterator`

在第二和第三章中，我们介绍并使用了`@@iterator`symbol，它被自动地用于`...`扩散和`for..of`循环。我们还在第五章中看到了在新的ES6集合中定义的`@@iterator`。

`Symbol.iterator`表示在任意一个对象上的特殊位置（属性），语言机制自动地在这里寻找一个方法，这个方法将构建一个用于消费对象值的迭代器对象。许多对象都带有一个默认的`Symbol.iterator`。

然而，我们可以通过设置`Symbol.iterator`属性来为任意对象定义我们自己的迭代器逻辑，即便它是覆盖默认迭代器的。这里的元编程观点是，我们在定义JS的其他部分（明确地说，是操作符和循环结构）在处理我们所定义的对象值时所使用的行为。

考虑如下代码：

```js
var arr = [4,5,6,7,8,9];

for (var v of arr) {
	console.log( v );
}
// 4 5 6 7 8 9

// 定义一个仅在奇数索引处产生值的迭代器
arr[Symbol.iterator] = function*() {
	var idx = 1;
	do {
		yield this[idx];
	} while ((idx += 2) < this.length);
};

for (var v of arr) {
	console.log( v );
}
// 5 7 9
```

### `Symbol.toStringTag` 和 `Symbol.hasInstance`

最常见的元编程任务之一，就是在一个值上进行自省来找出它是什么 *种类* 的，者经常用来决定它们上面适于实施什么操作。对于对象，最常见的两个自省技术是`toString()`和`instanceof`。

考虑如下代码：

```js
function Foo() {}

var a = new Foo();

a.toString();				// [object Object]
a instanceof Foo;			// true
```

在ES6中，你可以控制这些操作的行为：

```js
function Foo(greeting) {
	this.greeting = greeting;
}

Foo.prototype[Symbol.toStringTag] = "Foo";

Object.defineProperty( Foo, Symbol.hasInstance, {
	value: function(inst) {
		return inst.greeting == "hello";
	}
} );

var a = new Foo( "hello" ),
	b = new Foo( "world" );

b[Symbol.toStringTag] = "cool";

a.toString();				// [object Foo]
String( b );				// [object cool]

a instanceof Foo;			// true
b instanceof Foo;			// false
```

在原型（或实例本身）上的`@@toStringTag`symbol指定一个用于`[object ___]`字符串化的字符串值。

`@@hasInstance`symbol是一个在构造器函数上的方法，它接收一个实例对象值并让你通过放回`true`或`false`来决定这个值是否应当被认为是一个实例。

**注意：** 要在一个函数上设置`@@hasInstance`，你必须使用`Object.defineProperty(..)`，因为在`Function.prototype`上默认的那一个是`writable: false`。更多信息参见本系列的 *this与对象原型*。

### `Symbol.species`

在第三章的“类”中，我们介绍了`@@species`symbol，它控制一个类内建的生成新实例的方法使用哪一个构造器。

最常见的例子是，在子类化`Array`并且想要定义`slice(..)`之类被继承的方法应当使用哪一个构造器时。默认地，在一个`Array`的子类实例上调用的`slice(..)`将产生这个子类的实例，坦白地说这正是你经常希望的。

但是，你可以通过覆盖一个类的默认`@@species`定义来进行元编程：

```js
class Cool {
	// 将 `@@species` 倒推至被衍生的构造器
	static get [Symbol.species]() { return this; }

	again() {
		return new this.constructor[Symbol.species]();
	}
}

class Fun extends Cool {}

class Awesome extends Cool {
	// 将 `@@species` 强制为父类构造器
	static get [Symbol.species]() { return Cool; }
}

var a = new Fun(),
	b = new Awesome(),
	c = a.again(),
	d = b.again();

c instanceof Fun;			// true
d instanceof Awesome;		// false
d instanceof Cool;			// true
```

就像在前面的代码段中的`Cool`的定义展示的那样，在内建的原生构造器上的`Symbol.species`设定默认为`return this`。它在用户自己的类上没有默认值，但也像展示的那样，这种行为很容易模拟。

如果你需要定义生成新实例的方法，使用`new this.constructor[Symbol.species](..)`的元编程模式，而不要用手写的`new this.constructor(..)`或者`new XYZ(..)`。如此衍生的类就能够自定义`Symbol.species`来控制哪一个构造器来制造这些实例。

### `Symbol.toPrimitive`

在本系列的 *类型与文法* 一书中，我们讨论了`ToPrimitive`抽象强制转换操作，它在对象为了某些操作（例如`==`比较或者`+`加法）而必须被强制转换为一个基本类型值时被使用。在ES6以前，没有办法控制这个行为。

在ES6中，在任意对象值上作为属性的`@@toPrimitive`symbol都可以通过指定一个方法来自定义这个`ToPrimitive`强制转换。

考虑如下代码：

```js
var arr = [1,2,3,4,5];

arr + 10;				// 1,2,3,4,510

arr[Symbol.toPrimitive] = function(hint) {
	if (hint == "default" || hint == "number") {
		// 所有数字的和
		return this.reduce( function(acc,curr){
			return acc + curr;
		}, 0 );
	}
};

arr + 10;				// 25
```

`Symbol.toPrimitive`方法将根据调用`ToPrimitive`的操作期望何种类型，而被提供一个值为`"string"`，`"number"`，或`"default"`（这应当被解释为`"number"`）的 *提示（hint）*。在前一个代码段中，`+`加法操作没有提示（`"default"`将被传递）。一个`*`乘法操作将提示`"number"`，而一个`String(arr)`将提示`"string"`。

**警告：** `==`操作符将在一个对象上不使用任何提来示调用`ToPrimitive`操作 —— 如果存在`@@toPrimitive`方法的话，将使用`"default"`被调用 —— 如果另一个被比较的值不是一个对象。但是，如果两个被比较的值都是对象，`==`的行为与`===`是完全相同的，也就是引用本身将被直接比较。这种情况下，`@@toPrimitive`根本不会被调用。关于强制转换和抽象操作的更多信息，参见本系列的 *类型与文法*。

### 正则表达式 Symbols

对于正则表达式对象，有四种通用 symbols 可以被覆盖，它们控制着这些正则表达式在四个相应的同名`String.prototype`函数中如何被使用：

* `@@match`：一个正则表达式的`Symbol.match`值是使用被给定的正则表达式来匹配一个字符串值的全部或部分的方法。如果你为`String.prototype.match(..)`传递一个正则表达式做范例匹配，它就会被使用。

	 匹配的默认算法写在ES6语言规范的第21.2.5.6部分(https://people.mozilla.org/~jorendorff/es6-draft.html#sec-regexp.prototype-@@match)。你可以覆盖这个默认算法并提供额外的正则表达式特性，比如后顾断言。

	 `Symbol.match`还被用于`isRegExp`抽象操作（参见第六章的“字符串检测函数”中的注意部分）来判定一个对象是否意在被用作正则表达式。为了使一个这样的对象不被看作是正则表达式，可以将`Symbol.match`的值设置为`false`（或falsy的东西）强制这个检查失败。

* `@@replace`：一个正则表达式的`Symbol.replace`值是被`String.prototype.replace(..)`使用的方法，来替换一个字符串里面出现的一个或所有字符序列，这些字符序列匹配给出的正则表达式范例。

	 替换的默认算法写在ES6语言规范的第21.2.5.8部分(https://people.mozilla.org/~jorendorff/es6-draft.html#sec-regexp.prototype-@@replace)。

	 一个覆盖默认算法的很酷的用法是提供额外的`replacer`可选参数值，比如通过用连续的替换值消费可迭代对象来支持`"abaca".replace(/a/g,[1,2,3])`产生`"1b2c3"`。

* `@@search`：一个正则表达式的`Symbol.search`值是被`String.prototype.search(..)`使用的方法，来在一个字符串中检索一个匹配给定正则表达式的子字符串。

	 检索的默认算法写在ES6语言规范的第21.2.5.9部分(https://people.mozilla.org/~jorendorff/es6-draft.html#sec-regexp.prototype-@@search)。

* `@@split`：一个正则表达式的`Symbol.split`值是被`String.prototype.split(..)`使用的方法，来将一个字符串在分隔符匹配给定正则表达式的位置分割为子字符串。

	 分割的默认算法写在ES6语言规范的第21.2.5.11部分(https://people.mozilla.org/~jorendorff/es6-draft.html#sec-regexp.prototype-@@split)。

覆盖内建的正则表达式算法不是为心脏脆弱的人准备的！JS带有高度优化的正则表达式引擎，所以你自己的用户代码将很可能慢得多。这种类型的元编程很精巧和强大，但是应当仅用于确实必要或有好处的情况下。

### `Symbol.isConcatSpreadable`

`@@isConcatSpreadable`symbol可以作为一个布尔属性（`Symbol.isConcatSpreadable`）在任意对象上（比如一个数组或其他的可迭代对象）定义，来指示当它被传递给一个数组`concat(..)`时是否应当被 *扩散*。

考虑如下代码：

```js
var a = [1,2,3],
	b = [4,5,6];

b[Symbol.isConcatSpreadable] = false;

[].concat( a, b );		// [1,2,3,[4,5,6]]
```

### `Symbol.unscopables`

`@@unscopables`symbol可以作为一个对象属性（`Symbol.unscopables`）在任意对象上定义，来指示在一个`with`语句中哪一个属性可以和不可以作为此法变量被暴露。

考虑如下代码：

```js
var o = { a:1, b:2, c:3 },
	a = 10, b = 20, c = 30;

o[Symbol.unscopables] = {
	a: false,
	b: true,
	c: false
};

with (o) {
	console.log( a, b, c );		// 1 20 3
}
```

一个在`@@unscopables`对象中的`true`指示这个属性应当是 *非作用域（unscopable）* 的，因此会从此法作用域变量中被过滤掉。`false`意味着它可以被包含在此法作用域变量中。

**警告：** `with`语句在`strict`模式下是完全禁用的，而且因此应当被认为是在语言中被废弃的。不要使用它。更多信息参见本系列的 *作用域与闭包*。因为应当避免`with`，所以这个`@@unscopables`symbol也是无意义的。

## 代理

在ES6中被加入的最明显的元编程特性之一就是`proxy`特性。

一个代理是一种由你创建的特殊的对象，它“包”着另一个普通的对象 —— 或者说挡在这个普通对象的前面。你可以在代理对象上注册特殊的处理器（也叫 *机关（traps）*），当对这个代理实施各种操作时被调用。这些处理器除了将操作 *传送* 到原本的目标/被包装的对象上之外，还有机会运行额外的逻辑。

一个这样的 *机关* 处理器的例子是，你可以在一个代理上定义一个拦截`[[Get]]`操作的`get` —— 它在当你试图访问一个对象上的属性时运行。考虑如下代码：

```js
var obj = { a: 1 },
	handlers = {
		get(target,key,context) {
			// 注意：target === obj,
			// context === pobj
			console.log( "accessing: ", key );
			return Reflect.get(
				target, key, context
			);
		}
	},
	pobj = new Proxy( obj, handlers );

obj.a;
// 1

pobj.a;
// accessing: a
// 1
```

我们将一个`get(..)`处理器作为 *处理器* 对象的命名方法声明（`Proxy(..)`的第二个参数值），它接收一个指向 *目标* 对象的引用（`obj`），属性的 *键* 名称（`"a"`），和`self`/接受者/代理本身（`pobj`）。

在追踪语句`console.log(..)`之后，我们通过`Reflect.get(..)`将操作“转送”到`obj`。我们将在下一节详细讲解`Reflect`API，但要注意的是每个可用的代理机关都有一个相应的同名`Reflect`函数。

这些映射是故意对称的。每个代理处理器在各自的元编程任务实施时进行拦截，而每个`Reflect`工具将各自的元编程任务在一个对象上实施。每个代理处理器都有一个自动调用相应`Reflect`工具的默认定义。几乎可以肯定你将总是一前一后地使用`Proxy`和`Reflect`。

这里的列表是你可以在一个代理上为一个 *目标* 对象/函数定义的处理器，以及它们如何/何时被触发：

* `get(..)`：通过`[[Get]]`，在代理上访问一个属性（`Reflect.get(..)`，`.`属性操作符或`[ .. ]`属性操作符）
* `set(..)`：通过`[[Set]]`，在代理对象上设置一个属性（`Reflect.set(..)`，`=`赋值操作符，或者解构赋值 —— 如果目标是一个对象属性的话)
* `deleteProperty(..)`：通过`[[Delete]]`，在代理对象上删除一个属性 (`Reflect.deleteProperty(..)`或`delete`)
* `apply(..)`（如果 *目标* 是一个函数）：通过`[[Call]]`，代理作为一个普通函数/方法被调用（`Reflect.apply(..)`，`call(..)`，`apply(..)`，或者`(..)`调用操作符）
* `construct(..)`（如果 *目标* 是一个构造函数）：通过`[[Construct]]`代理作为一个构造器函数被调用（`Reflect.construct(..)`或`new`）
* `getOwnPropertyDescriptor(..)`：通过`[[GetOwnProperty]]`，从代理取得一个属性的描述符（`Object.getOwnPropertyDescriptor(..)`或`Reflect.getOwnPropertyDescriptor(..)`）
* `defineProperty(..)`：通过`[[DefineOwnProperty]]`，在代理上设置一个属性描述符（`Object.defineProperty(..)`或`Reflect.defineProperty(..)`）
* `getPrototypeOf(..)`：通过`[[GetPrototypeOf]]`，取得代理的`[[Prototype]]`（`Object.getPrototypeOf(..)`，`Reflect.getPrototypeOf(..)`，`__proto__`, `Object#isPrototypeOf(..)`，或`instanceof`）
* `setPrototypeOf(..)`：通过`[[SetPrototypeOf]]`，设置代理的`[[Prototype]]`（`Object.setPrototypeOf(..)`，`Reflect.setPrototypeOf(..)`，或`__proto__`）
* `preventExtensions(..)`：通过`[[PreventExtensions]]`使代理成为不可扩展的（`Object.preventExtensions(..)`或`Reflect.preventExtensions(..)`）
* `isExtensible(..)`：通过`[[IsExtensible]]`，检测代理的可扩展性（`Object.isExtensible(..)`或`Reflect.isExtensible(..)`）
* `ownKeys(..)`：通过`[[OwnPropertyKeys]]`，取得一组代理的直属属性和/或直属symbol属性（`Object.keys(..)`，`Object.getOwnPropertyNames(..)`，`Object.getOwnSymbolProperties(..)`，`Reflect.ownKeys(..)`，或`JSON.stringify(..)`）
* `enumerate(..)`：通过`[[Enumerate]]`，为代理的可枚举直属属性及“继承”属性请求一个迭代器（`Reflect.enumerate(..)`或`for..in`）
* `has(..)`：通过`[[HasProperty]]`，检测代理是否拥有一个直属属性或“继承”属性（`Reflect.has(..)`，`Object#hasOwnProperty(..)`，或`"prop" in obj`）

**提示：** 关于每个这些元编程任务的更多信息，参见本章稍后的“`Reflect` API”一节。

关于将会触发各种机关的动作，除了在前面列表中记载的以外，一些机关还会由另一个机关的默认动作间接地触发。举例来说：

```js
var handlers = {
		getOwnPropertyDescriptor(target,prop) {
			console.log(
				"getOwnPropertyDescriptor"
			);
			return Object.getOwnPropertyDescriptor(
				target, prop
			);
		},
		defineProperty(target,prop,desc){
			console.log( "defineProperty" );
			return Object.defineProperty(
				target, prop, desc
			);
		}
	},
	proxy = new Proxy( {}, handlers );

proxy.a = 2;
// getOwnPropertyDescriptor
// defineProperty
```

在设置一个属性值时（不管是新添加还是更新），`getOwnPropertyDescriptor(..)`和`defineProperty(..)`处理器被默认的`set(..)`处理器触发。如果你还定义了你自己的`set(..)`处理器，你或许对`context`（不是`target`！）进行了将会触发这些代理机关的相应调用。

### 代理的限制

这些元编程处理器拦截了你可以对一个对象进行的范围很广泛的一组基础操作。但是，有一些操作不能（至少是还不能）被用于拦截。

例如，从`pobj`代理到`obj`目标，这些操作全都没有被拦截和转送：

```js
var obj = { a:1, b:2 },
	handlers = { .. },
	pobj = new Proxy( obj, handlers );

typeof obj;
String( obj );
obj + "";
obj == pobj;
obj === pobj
```

也许在未来，更多这些语言中的底层基础操作都将是可拦截的，那将给我们更多力量来从JavaScript自身扩展它。

**警告：** 对于代理处理器的使用来说存在某些 *不变量* —— 它们的行为不能被覆盖。例如，`isExtensible(..)`处理器的结果总是被强制转换为一个`boolean`。这些不变量限制了一些你可以使用代理来自定义行为的能力，但是它们这样做只是为了防止你创建奇怪和不寻常（或不合逻辑）的行为。这些不变量的条件十分复杂，所以我们就不再这里全面阐述了，但是这篇博文(http://www.2ality.com/2014/12/es6-proxies.html#invariants)很好地讲解了它们。

### 可撤销的代理

一个一般的代理总是包装着目标对象，而且在创建之后就不能修改了 —— 只要保持着一个指向这个代理的引用，代理的机制就将维持下去。但是，可能会有一些情况你想要创建一个这样的代理：在你想要停止它作为代理时可以被停用。解决方案就是创建一个 *可撤销代理*：

```js
var obj = { a: 1 },
	handlers = {
		get(target,key,context) {
			// 注意：target === obj,
			// context === pobj
			console.log( "accessing: ", key );
			return target[key];
		}
	},
	{ proxy: pobj, revoke: prevoke } =
		Proxy.revocable( obj, handlers );

pobj.a;
// accessing: a
// 1

// 稍后：
prevoke();

pobj.a;
// TypeError
```

一个可撤销代理是由`Proxy.revocable(..)`创建的，它是一个普通的函数，不是一个像`Proxy(..)`那样的构造器。此外，它接收同样的两个参数值：*目标* 和 *处理器*。

与`new Proxy(..)`不同的是，`Proxy.revocable(..)`的返回值不是代理本身。取而代之的是，它返回一个带有 *proxy* 和 *revoke* 两个属性的对象 —— 我们使用了对象解构（参见第二章的“解构”）来将这些属性分别赋值给变量`pobj`和`prevoke`。

一旦可撤销代理被撤销，任何访问它的企图（触发它的任何机关）都将抛出`TypeError`。

一个使用可撤销代理的例子可能是，将一个代理交给另一个存在于你应用中、并管理你模型中的数据的团体，而不是给它们一个指向正式模型对象本身的引用。如果你的模型对象改变了或者被替换掉了，你希望废除这个你交出去的代理，以便于其他的团体能够（通过错误！）知道要请求一个更新过的模型引用。

### 使用代理

这些代理处理器带来的元编程的好处应当是显而易见的。我们可以全面地拦截（而因此覆盖）对象的行为，这意味着我们可以用一些非常强大的方式将对象行为扩展至JS核心之外。我们将看几个模式的例子来探索这些可能性。

#### 代理前置，代理后置

正如我们早先提到过的，你通常将一个代理考虑为一个目标对象的“包装”。在这种意义上，代理就变成了代码接口所针对的主要对象，而实际的目标对象则保持被隐藏/被保护的状态。

你可能这么做是因为你希望将对象传递到某个你不能完全“信任”的地方去，如此你需要在它的访问权上强制实施一些特殊的规则，而不是传递这个对象本身。

考虑如下代码：

```js
var messages = [],
	handlers = {
		get(target,key) {
			// 是字符串值吗？
			if (typeof target[key] == "string") {
				// 过滤掉标点符号
				return target[key]
					.replace( /[^\w]/g, "" );
			}

			// 让其余的东西通过
			return target[key];
		},
		set(target,key,val) {
			// 仅设置唯一的小写字符串
			if (typeof val == "string") {
				val = val.toLowerCase();
				if (target.indexOf( val ) == -1) {
					target.push(val);
				}
			}
			return true;
		}
	},
	messages_proxy =
		new Proxy( messages, handlers );

// 在别处：
messages_proxy.push(
	"heLLo...", 42, "wOrlD!!", "WoRld!!"
);

messages_proxy.forEach( function(val){
	console.log(val);
} );
// hello world

messages.forEach( function(val){
	console.log(val);
} );
// hello... world!!
```

我称此为 *代理前置* 设计，因为我们首先（主要、完全地）与代理进行互动。

我们在与`messages_proxy`的互动上强制实施了一些特殊规则，这些规则不会强制实施在`messages`本身上。我们仅在值是一个不重复的字符串时才将它添加为元素；我们还将这个值变为小写。当从`messages_proxy`取得值时，我们过滤掉字符串中所有的标点符号。

另一种方式是，我们可以完全反转这个模式，让目标与代理交互而不是让代理与目标交互。这样，代码其实只与主对象交互。达成这种后备方案的最简单的方法是，让代理对象存在于主对象的`[[Prototype]]`链中。

考虑如下代码：

```js
var handlers = {
		get(target,key,context) {
			return function() {
				context.speak(key + "!");
			};
		}
	},
	catchall = new Proxy( {}, handlers ),
	greeter = {
		speak(who = "someone") {
			console.log( "hello", who );
		}
	};

// 让 `catchall` 成为 `greeter` 的后备方法
Object.setPrototypeOf( greeter, catchall );

greeter.speak();				// hello someone
greeter.speak( "world" );		// hello world

greeter.everyone();				// hello everyone!
```

我们直接与`greeter`而非`catchall`进行交互。当我们调用`speak(..)`时，它在`greeter`上被找到并直接使用。但当我们试图访问`everyone()`这样的方法时，这个函数并不存在于`greeter`。

默认的对象属性行为是向上检查`[[Prototype]]`链（参见本系列的 *this与对象原型*），所以`catchall`被询问有没有一个`everyone`属性。然后代理的`get()`处理器被调用并返回一个函数，这个函数使用被访问的属性名（`"everyone"`）调用`speak(..)`。

我称这种模式为 *代理后置*，因为代理仅被用作最后一道防线。

#### "No Such Property/Method"

一个关于JS的常见的抱怨是，在你试着访问或设置一个对象上还不存在的属性时，默认情况下对象不是非常具有防御性。你可能希望为一个对象预定义所有这些属性/方法，而且在后续使用不存在的属性名时抛出一个错误。

我们可以使用一个代理来达成这种想法，既可以使用 *代理前置* 也可以 *代理后置* 设计。我们将两者都考虑一下。

```js
var obj = {
		a: 1,
		foo() {
			console.log( "a:", this.a );
		}
	},
	handlers = {
		get(target,key,context) {
			if (Reflect.has( target, key )) {
				return Reflect.get(
					target, key, context
				);
			}
			else {
				throw "No such property/method!";
			}
		},
		set(target,key,val,context) {
			if (Reflect.has( target, key )) {
				return Reflect.set(
					target, key, val, context
				);
			}
			else {
				throw "No such property/method!";
			}
		}
	},
	pobj = new Proxy( obj, handlers );

pobj.a = 3;
pobj.foo();			// a: 3

pobj.b = 4;			// Error: No such property/method!
pobj.bar();			// Error: No such property/method!
```

对于`get(..)`和`set(..)`两者，我们仅在目标对象的属性已经存在时才转送操作；否则抛出错误。代理对象应当是进行交互的主对象，因为它拦截这些操作来提供保护。

现在，让我们考虑一下反过来的 *代理后置* 设计：

```js
var handlers = {
		get() {
			throw "No such property/method!";
		},
		set() {
			throw "No such property/method!";
		}
	},
	pobj = new Proxy( {}, handlers ),
	obj = {
		a: 1,
		foo() {
			console.log( "a:", this.a );
		}
	};

// 让 `pobj` 称为 `obj` 的后备
Object.setPrototypeOf( obj, pobj );

obj.a = 3;
obj.foo();			// a: 3

obj.b = 4;			// Error: No such property/method!
obj.bar();			// Error: No such property/method!
```

在处理器如何定义的角度上，这里的 *代理后置* 设计相当简单。与拦截`[[Get]]`和`[[Set]]`操作并仅在目标属性存在时转送它们不同，我们依赖于这样一个事实：不管`[[Get]]`还是`[[Set]]`到达了我们的`pobj`后备对象，这个动作已经遍历了整个`[[Prototype]]`链并且没有找到匹配的属性。在这时我们可以自由地、无条件地抛出错误。很酷，对吧？

#### 代理黑入 `[[Prototype]]` 链

`[[Get]]`操作是`[[Prototype]]`机制被调用的主要渠道。当一个属性不能在直接对象上找到时，`[[Get]]`会自动将操作交给`[[Prototype]]`对象。

这意味着你可以使用一个代理的`get(..)`机关来模拟或扩展这个`[[Prototype]]`机制的概念。

我们将考虑的第一种黑科技是创建两个通过`[[Prototype]]`循环链接的对象（或者说，至少看起来是这样！）。你不能实际创建一个真正循环的`[[Prototype]]`链，因为引擎将会抛出一个错误。但是代理可以假冒它！

考虑如下代码：

```js
var handlers = {
		get(target,key,context) {
			if (Reflect.has( target, key )) {
				return Reflect.get(
					target, key, context
				);
			}
			// 假冒循环的 `[[Prototype]]`
			else {
				return Reflect.get(
					target[
						Symbol.for( "[[Prototype]]" )
					],
					key,
					context
				);
			}
		}
	},
	obj1 = new Proxy(
		{
			name: "obj-1",
			foo() {
				console.log( "foo:", this.name );
			}
		},
		handlers
	),
	obj2 = Object.assign(
		Object.create( obj1 ),
		{
			name: "obj-2",
			bar() {
				console.log( "bar:", this.name );
				this.foo();
			}
		}
	);

// 假冒循环的 `[[Prototype]]` 链
obj1[ Symbol.for( "[[Prototype]]" ) ] = obj2;

obj1.bar();
// bar: obj-1 <-- 通过代理假冒 [[Prototype]]
// foo: obj-1 <-- `this` 上下文环境依然被保留

obj2.foo();
// foo: obj-2 <-- 通过 [[Prototype]]
```

**注意：** 为了让事情简单一些，在这个例子中我们没有代理/转送`[[Set]]`。要完整地模拟`[[Prototype]]`兼容，你会想要实现一个`set(..)`处理器，它在`[[Prototype]]`链上检索一个匹配得属性并遵循它的描述符的行为（例如，set，可写性）。参见本系列的 *this与对象原型*。

在前面的代码段中，`obj2`凭借`Object.create(..)`语句`[[Prototype]]`链接到`obj1`。但是要创建反向（循环）的链接，我们在`obj1`的symbol位置`Symbol.for("[[Prototype]]")`（参见第二章的“Symbol”）上创建了一个属性。这个symbol可能看起来有些特别/魔幻，但它不是的。它只是允许我使用一个被方便地命名的属性，这个属性在语义上看来是与我进行的任务有关联的。

然后，代理的`get(..)`处理器首先检查一个被请求的`key`是否存在于代理上。如果每个有，操作就被手动地交给存储在`target`的`Symbol.for("[[Prototype]]")`位置中的对象引用。

这种模式的一个重要优点是，在`obj1`和`obj2`之间建立循环关系几乎没有入侵它们的定义。虽然前面的代码段为了简短而将所有的步骤交织在一起，但是如果你仔细观察，代理处理器的逻辑完全是范用的（不具体地知道`obj1`或`obj2`）。所以，这段逻辑可以抽出到一个简单的将它们连在一起的帮助函数中，例如`setCircularPrototypeOf(..)`。我们将此作为一个练习留给读者。

现在我们看到了如何使用`get(..)`来模拟一个`[[Prototype]]`链接，但让我们将这种黑科技推动的远一些。与其制造一个循环`[[Prototype]]`，搞一个多重`[[Prototype]]`链接（也就是“多重继承”）怎么样？这看起来相当直白：

```js
var obj1 = {
		name: "obj-1",
		foo() {
			console.log( "obj1.foo:", this.name );
		},
	},
	obj2 = {
		name: "obj-2",
		foo() {
			console.log( "obj2.foo:", this.name );
		},
		bar() {
			console.log( "obj2.bar:", this.name );
		}
	},
	handlers = {
		get(target,key,context) {
			if (Reflect.has( target, key )) {
				return Reflect.get(
					target, key, context
				);
			}
			// 假冒多重 `[[Prototype]]`
			else {
				for (var P of target[
					Symbol.for( "[[Prototype]]" )
				]) {
					if (Reflect.has( P, key )) {
						return Reflect.get(
							P, key, context
						);
					}
				}
			}
		}
	},
	obj3 = new Proxy(
		{
			name: "obj-3",
			baz() {
				this.foo();
				this.bar();
			}
		},
		handlers
	);

// 假冒多重 `[[Prototype]]` 链接
obj3[ Symbol.for( "[[Prototype]]" ) ] = [
	obj1, obj2
];

obj3.baz();
// obj1.foo: obj-3
// obj2.bar: obj-3
```

**注意：** 正如在前面的循环`[[Prototype]]`例子后的注意中提到的，我们没有实现`set(..)`处理器，但对于一个将`[[Set]]`模拟为普通`[[Prototype]]`行为的解决方案来说，它将是必要的。

`obj3`被设置为多重委托到`obj1`和`obj2`。在`obj2.baz()`中，`this.foo()`调用最终成为从`obj1`中抽出`foo()`（先到先得，虽然还有一个在`obj2`上的`foo()`）。如果我们将连接重新排列为`obj2, obj1`，那么`obj2.foo()`将被找到并使用。

同理，`this.bar()`调用没有在`obj1`上找到`bar()`，所以它退而检查`obj2`，这里找到了一个匹配。

`obj1`和`obj2`代表`obj3`的两个平行的`[[Prototype]]`链。`obj1`和/或`obj2`自身可以拥有委托至其他对象的普通`[[Prototype]]`，或者自身也可以是多重委托的代理（就像`obj3`一样）。

正如先前的循环`[[Prototype]]`的例子一样，`obj1`，`obj2`和`obj3`的定义几乎完全与处理多重委托的范用代理逻辑相分离。定义一个`setPrototypesOf(..)`（注意那个“s”！）这样的工具将是小菜一碟，它接收一个主对象和一组模拟多重`[[Prototype]]`链接用的对象。同样，我们将此作为练习留给读者。

希望在这种种例子之后代理的力量现在变得明朗了。代理使得许多强大的元编程任务成为可能。

## `Reflect` API

`Reflect`对象是一个普通对象（就像`Math`），不是其他内建原生类型那样的函数/构造器。

它持有对应于你可以控制的各种元编程任务的静态函数。这些函数与代理可以定义的处理器方法（*机关*）一一对应。

这些函数中的一些看起来与在`Object`上的同名函数很相似：

* `Reflect.getOwnPropertyDescriptor(..)`
* `Reflect.defineProperty(..)`
* `Reflect.getPrototypeOf(..)`
* `Reflect.setPrototypeOf(..)`
* `Reflect.preventExtensions(..)`
* `Reflect.isExtensible(..)`

这些工具一般与它们的`Object.*`对等物的行为相同。但一个区别是，`Object.*`对等物在它们的第一个参数值（目标对象）还不是对象的情况下，试图将它强制转换为一个对象。`Reflect.*`方法在同样的情况下仅简单地抛出一个错误。

一个对象的键可以使用这些工具访问/检测：

* `Reflect.ownKeys(..)`：返回一个所有直属（不是“继承的”）键的列表，正如被 `Object.getOwnPropertyNames(..)`和`Object.getOwnPropertySymbols(..)`返回的那样。关于键的顺序问题，参见“属性枚举顺序”一节。
* `Reflect.enumerate(..)`：返回一个产生所有（直属和“继承的”）非symbol、可枚举的键的迭代器（参见本系列的 *this与对象原型*）。 实质上，这组键与在`for..in`循环中被处理的那一组键是相同的。关于键的顺序问题，参见“属性枚举顺序”一节。
* `Reflect.has(..)`：实质上与用于检查一个属性是否存在于一个对象或它的`[[Prototype]]`链上的`in`操作符相同。例如，`Reflect.has(o,"foo")`实质上实施`"foo" in o`。

函数调用和构造器调用可以使用这些工具手动地实施，与普通的语法（例如，`(..)`和`new`）分开：

* `Reflect.apply(..)`：例如，`Reflect.apply(foo,thisObj,[42,"bar"])`使用`thisObj`作为`foo(..)`函数的`this`来调用它，并传入参数值`42`和`"bar"`。
* `Reflect.construct(..)`：例如，`Reflect.construct(foo,[42,"bar"])`实质上调用`new foo(42,"bar")`。

对象属性访问，设置，和删除可以使用这些工具手动实施：

* `Reflect.get(..)`：例如，`Reflect.get(o,"foo")`会取得`o.foo`。
* `Reflect.set(..)`：例如，`Reflect.set(o,"foo",42)`实质上实施`o.foo = 42`。
* `Reflect.deleteProperty(..)`：例如，`Reflect.deleteProperty(o,"foo")`实质上实施`delete o.foo`。

`Reflect`的元编程能力给了你可以模拟各种语法特性的程序化等价物，暴露以前隐藏着的抽象操作。例如，你可以使用这些能力来扩展 *领域特定语言*（DSL）的特性和API。

### 属性顺序

在ES6之前，罗列一个对象的键/属性的顺序没有在语言规范中定义，而是依赖于具体实现的。一般来说，大多数引擎会以创建的顺序来罗列它们，虽然开发者们已经被强烈建议永远不要依仗这种顺序。

在ES6中，罗列直属属性的属性是由`[[OwnPropertyKeys]]`算法定义的（ES6语言规范，9.1.12部分），它产生所有直属属性（字符串或symbol），不论其可枚举性。这种顺序仅对`Reflect.ownKeys(..)`有保证（）。

这个顺序是：

1. 首先，以数字上升的顺序，枚举所有数字索引的直属属性。
2. 然后，以创建顺序枚举剩下的直属字符串属性名。
3. 最后，以创建顺序枚举直属symbol属性。

考虑如下代码：

```js
var o = {};

o[Symbol("c")] = "yay";
o[2] = true;
o[1] = true;
o.b = "awesome";
o.a = "cool";

Reflect.ownKeys( o );				// [1,2,"b","a",Symbol(c)]
Object.getOwnPropertyNames( o );	// [1,2,"b","a"]
Object.getOwnPropertySymbols( o );	// [Symbol(c)]
```

另一方面，`[[Enumeration]]`算法（ES6语言规范，9.1.11部分）从目标对象和它的`[[Prototype]]`链中仅产生可枚举属性。它被用于`Reflect.enumerate(..)`和`for..in`。可观察到的顺序是依赖于具体实现的，语言规范没有控制它。

相比之下，`Object.keys(..)`调用`[[OwnPropertyKeys]]`算法来得到一个所有直属属性的列表。但是，它过滤掉了不可枚举属性，然后特别为了`JSON.stringify(..)`和`for..in`而将这个列表重排，以匹配遗留的、依赖于具体实现的行为。所以通过扩展，这个顺序 *也* 与`Reflect.enumerate(..)`的顺序像吻合。

换言之，所有四种机制（`Reflect.enumerate(..)`，`Object.keys(..)`，`for..in`，和`JSON.stringify(..)`）都同样将与依赖于具体实现的顺序像吻合，虽然技术上它们是以不同的方式达到的同样的效果。

具体实现可以将这四种机制与`[[OwnPropertyKeys]]`的顺序相吻合，但不是必须的。无论如何，你将很可能从它们的行为中观察到以下的排序：

```js
var o = { a: 1, b: 2 };
var p = Object.create( o );
p.c = 3;
p.d = 4;

for (var prop of Reflect.enumerate( p )) {
	console.log( prop );
}
// c d a b

for (var prop in p) {
	console.log( prop );
}
// c d a b

JSON.stringify( p );
// {"c":3,"d":4}

Object.keys( p );
// ["c","d"]
```

这一切可以归纳为：在ES6中，根据语言规范`Reflect.ownKeys(..)`，`Object.getOwnPropertyNames(..)`，和`Object.getOwnPropertySymbols(..)`保证都有可预见和可靠的顺序。所以依赖于这种顺序来建造代码是安全的。

`Reflect.enumerate(..)`，`Object.keys(..)`，和`for..in` （扩展一下的话还有`JSON.stringify(..)`）继续互相共享一个可观察的顺序，就像它们往常一样。但这个顺序不一定与`Reflect.ownKeys(..)`的相同。在使用它们依赖于具体实现的顺序时依然应当小心。

## 特性测试

什么是特性测试？它是一种由你运行来判定一个特性是否可用的测试。有些时候，这种测试不仅是为了判定存在性，还是为判定对特定行为的适应性 —— 特性可能存在但有bug。

这是一种元编程技术 —— 测试你程序将要运行的环境然后判定你的程序应当如何动作。

在JS中特性测试最常见的用法是检测一个API的存在性，而且如果它不存在，就定义一个填补（见第一章）。例如：

```js
if (!Number.isNaN) {
	Number.isNaN = function(x) {
		return x !== x;
	};
}
```

在这个代码段中的`if`语句就是一个元编程：我们探测我们的程序和它的运行时环境，来判定我们是否和如何进行后续处理。

但是如何测试一个涉及新语法的特性呢？

你可能会尝试这样的东西：

```js
try {
	a = () => {};
	ARROW_FUNCS_ENABLED = true;
}
catch (err) {
	ARROW_FUNCS_ENABLED = false;
}
```

不幸的是，这不能工作，因为我们的JS程序是要被编译的。因此，如果引擎还没有支持ES6箭头函数的话，它就会在`() => {}`语法的地方熄火。你程序中的语法错误会阻止它的运行，进而阻止你程序根据特性是否被支持而进行后续的不同相应。

为了围绕语法相关的特性进行特性测试的元编程，我们需要一个方法将测试与我们程序将要通过的初始编译步骤隔离开。举例来说，如果我们能够将进行测试的代码存储在一个字符串中，之后JS引擎默认地将不会尝试编译这个字符串中的内容，直到我们要求它这么做。

你的思路是不是跳到了使用`eval(..)`？

别这么着急。看看本系列的 *作用域与闭包* 来了解一下为什么`eval(..)`是一个坏主意。但是有另外一个缺陷较少的选项：`Function(..)`构造器。

考虑如下代码：

```js
try {
	new Function( "( () => {} )" );
	ARROW_FUNCS_ENABLED = true;
}
catch (err) {
	ARROW_FUNCS_ENABLED = false;
}
```

好了，现在我们判定一个像箭头函数这样的特性是否 *能* 被当前的引擎所编译来进行元编程。你可能会想知道，我们要用这种信息做什么？

检查API的存在性，并定义后备的API填补，对于特性检测成功或失败来说都是一条明确的道路。但是对于从`ARROW_FUNCS_ENABLED`是`true`还是`false`中得到的信息来说，我们能对它做什么呢？

因为如果引擎不支持一种特性，它的语法就不能出现在一个文件中，所以你不能在这个文件中定义使用这种语法的函数。

你所能做的是，使用测试来判定你应当加载哪一组JS文件。例如，如果在你的JS应用程序中的启动装置中有一组这样的特性测试，那么它就可以测试环境来判定你的ES6代码是否可以直接加载运行，或者你是否需要加载一个代码的转译版本（参见第一章）。

这种技术称为 *分割投递*。

事实表明，你使用ES6编写的JS程序有时可以在ES6+浏览器中完全“原生地”运行，但是另一些时候需要在前ES6浏览器中运行转译版本。如果你总是加载并使用转译代码，即便是在新的ES6兼容环境中，至少是有些情况下你运行的也是次优的代码。这并不理想。

分割投递更加复杂和精巧，但对于你编写的代码和你的程序所必须在其中运行的浏览器支持的特性之间，它代表一种更加成熟和健壮的桥接方式。

### FeatureTests.io

为所有的ES6+语法以及语义行为定义特性测试，是一项你可能不想自己解决的艰巨任务。因为这些测试要求动态编译（`new Function(..)`），这会产生不幸的性能损耗。

另外，在每次你的应用运行时都执行这些测试可能是一种浪费，因为平均来说一个用户的浏览器在几周之内至多只会更新一次，而即使是这样，新特性也不一定会在每次更新中都出现。

最终，管理一个对你特定代码库进行的特性测试列表 —— 你的程序将很少用到ES6的全部 —— 是很容易失控而且易错的。

“https://featuretests.io”的“特性测试服务”为这种挫折提供了解决方案。

你可以将这个服务的库加载到你的页面中，而它会加载最新的测试定义并运行所有的特性测试。在可能的情况下，它将使用Web Worker的后台处理中这样做，以降低性能上的开销。它还会使用LocalStorage持久化来缓存测试的结果 —— 以一种可以被所有你访问的使用这个服务的站点所共享的方式，这将及大地降低测试需要在每个浏览器实例上运行的频度。

你可以在每一个用户的浏览器上进行运行时特性测试，而且你可以使用这些测试结果动态地向用户传递最适合他们环境的代码（不多也不少）。

另外，这个服务还提供工具和API来扫描你的文件以判定你需要什么特性，这样你就能够完全自动化你的分割投递构建过程。

对ES6的所有以及未来的部分进行特性测试，以确保对于任何给定的环境都只有最佳的代码会被加载和运行 —— FeatureTests.io使这成为可能。

## 尾部调用优化（TCO）

通常来说，当从一个函数内部发起对另一个函数的调用时，就会分配一个 *栈帧* 来分离地管理这另一个函数调用的变量/状态。这种分配不仅花费一些处理时间，还会消耗一些额外的内存。

一个调用栈链从一个函数到另一个再到另一个，通常至多拥有10-15跳。在这些场景下，内存使用不太可能是某种实际问题。

然而，当你考虑递归编程（一个函数频繁地调用自己） —— 或者使用两个或更多的函数相互调用而构成相互递归 —— 调用栈就可能轻易地到达上百，上千，或更多层的深度。如果内存的使用无限制地增长下去，你可能看到了它将导致的问题。

JavaScript引擎不得不设置一个随意的限度来防止这样的编程技术耗尽浏览器或设备的内存。这就是为什么我们会在到达这个限度时得到令人沮丧的“RangeError: Maximum call stack size exceeded”。

**警告：** 调用栈深度的限制是不由语言规范控制的。它是依赖于具体实现的，而且将会根据浏览器和设备不同而不同。你绝不应该带着可精确观察到的限度的强烈臆想进行编码，因为它们还很可能在每个版本中变化。

一种称为 *尾部调用* 的特定函数调用模式，可以以一种避免额外的栈帧分配的方法进行优化。如果额外的分配可以被避免，那么就没有理由随意地限制调用栈的深度，这样引擎就可以让它们没有边界地运行下去。

一个尾部调用是一个带有函数调用的`return`语句，除了返回它的值，函数调用之后没有任何事情需要发生。

这种优化只能在`strict`模式下进行。又一个你总是应该用`strict`编写所有代码的理由！

这个函数调用 *不是* 在尾部：

```js
"use strict";

function foo(x) {
	return x * 2;
}

function bar(x) {
	// 不是一个尾部调用
	return 1 + foo( x );
}

bar( 10 );				// 21
```

在`foo(x)`调用完成后必须进行`1 + ..`，所以那个`bar(..)`调用的状态需要被保留。

但是下面的代码段中展示的`foo(..)`和`bar(..)`都是位于尾部，因为它们都是在自身代码路径上（除了`return`以外）发生的最后一件事：

```js
"use strict";

function foo(x) {
	return x * 2;
}

function bar(x) {
	x = x + 1;
	if (x > 10) {
		return foo( x );
	}
	else {
		return bar( x + 1 );
	}
}

bar( 5 );				// 24
bar( 15 );				// 32
```

在这个程序中，`bar(..)`明显是递归，但`foo(..)`只是一个普通的函数调用。这两个函数调用都位于 *恰当的尾部位置*。`x + 1`在`bar(..)`调用之前被求值，而且不论这个调用何时完成，所有将要放生的只有`return`。

这些形式的恰当尾部调用（Proper Tail Calls —— PTC）是可以被优化的 —— 称为尾部调用优化（TCO）—— 于是额外的栈帧分配是不必要的。与为下一个函数调用创建新的栈帧不同，引擎会重用既存的栈帧。这能够工作是因为一个函数不需要保留任何当前状态 —— 在PTC之后的状态下不会发生任何事情。

TCO意味着调用栈可以有多深实际上是没有限度的。这种技巧稍稍改进了一般程序中的普通函数调用，但更重要的是它打开了一扇大门：可以使用递归表达程序，即使它的调用栈深度有成千上万层。

我们不再局限于单纯地在理论上考虑用递归解决问题了，而是可以在真实的JavaScript程序中使用它！

作为ES6，所有的PTC都应该是可以以这种方式优化的，不论递归与否。

### 重写尾部调用

然而，障碍是只有PTC是可以被优化的；非PTC理所当然地依然可以工作，但是将造成往常那样的栈帧分配。如果你希望优化机制启动，就必须小心地使用PTC构造你的函数。

如果你有一个没有用PTC编写的函数，你可能会发现你需要手动地重新安排你的代码，使它成为合法的TCO。

考虑如下代码：

```js
"use strict";

function foo(x) {
	if (x <= 1) return 1;
	return (x / 2) + foo( x - 1 );
}

foo( 123456 );			// RangeError
```

对`foo(x-1)`的调用不是一个PTC，因为在`return`之前它的结果必须被加上`(x / 2)`。

但是，要使这段代码在一个ES6引擎中是合法的TCO，我们可以像下面这样重写它：

```js
"use strict";

var foo = (function(){
	function _foo(acc,x) {
		if (x <= 1) return acc;
		return _foo( (x / 2) + acc, x - 1 );
	}

	return function(x) {
		return _foo( 1, x );
	};
})();

foo( 123456 );			// 3810376848.5
```

如果你在一个实现了TCO的ES6引擎中运行前面这个代码段，你将会如展示的那样得到答案`3810376848.5`。然而，它仍然会在非TCO引擎中因为`RangeError`而失败。

### 非TCO优化

有另一种技术可以重写代码，让调用栈不随每次调用增长。

一个这样的技术称为 *蹦床*，它相当于让每一部分结果表示为一个函数，这个函数要么返回另一个部分结果函数，要么返回最终结果。然后你就可以简单地循环直到你不再收到一个函数，这时你就得到了结果。考虑如下代码：

```js
"use strict";

function trampoline( res ) {
	while (typeof res == "function") {
		res = res();
	}
	return res;
}

var foo = (function(){
	function _foo(acc,x) {
		if (x <= 1) return acc;
		return function partial(){
			return _foo( (x / 2) + acc, x - 1 );
		};
	}

	return function(x) {
		return trampoline( _foo( 1, x ) );
	};
})();

foo( 123456 );			// 3810376848.5
```

这种返工需要一些最低限度的改变来将递归抽出到`trampoline(..)`中的循环中：

1. 首先，我们将`return _foo ..`这一行包装进函数表达式`return partial() {..`。
2. 然后我们将`_foo(1,x)`包装进`trampoline(..)`调用。

这种技术之所以不受调用栈限制的影响，是因为每个内部的`partial(..)`函数都只是返回到`trampoline(..)`的`while`循环中，这个循环运行它然后再一次循环迭代。换言之，`partial(..)`并不递归地调用它自己，它只是返回另一个函数。栈的深度维持不变，所以它需要运行多久就可以运行多久。

蹦床表达的是，内部的`partial()`函数使用在变量`x`和`acc`上的闭包来保持迭代与迭代之间的状态。它的优势是循环的逻辑可以被抽出到一个可重用的`trampoline(..)`工具函数中，许多库都提供这个工具的各种版本。你可以使用不同的蹦床算法在你的程序中重用`trampoline(..)`多次。

当然，如果你真的想要深度优化（于是可复用性不予考虑），你可以摒弃闭包状态，并将对`acc`的状态追踪，与一个循环一起内联到一个函数的作用域内。这种技术通常称为 *递归展开*：

```js
"use strict";

function foo(x) {
	var acc = 1;
	while (x > 1) {
		acc = (x / 2) + acc;
		x = x - 1;
	}
	return acc;
}

foo( 123456 );			// 3810376848.5
```

算法的这种表达形式很容易阅读，而且很可能是在我们探索过的各种形式中性能最好的（严格地说）一个。很明显它看起来是一个胜利者，而且你可能会想知道为什么你曾尝试其他的方式。

这些是为什么你可能不想总是手动地展开递归的原因：

* 与为了复用而将弹簧（循环）逻辑抽出去相比，我们内联了它。这在仅有一个这样的例子需要考虑时工作的很好，但只要你在程序中有五六个或更多这样的东西时，你将很可能想要一些可复用性来将让事情更简短、更易管理一些。
* 这里的例子为了展示不同的形式而被故意地搞得很简单。在现实中，递归算法有着更多的复杂性，比如相互递归（有多于一个的函数调用它自己）。

	 你在这条路上走得越远，*展开* 优化就变得越复杂和越依靠手动。你很快就会失去所有可读性的认知价值。递归，甚至是PTC形式的递归的主要优点是，它保留了算法的可读性，并将性能优化的任务交给引擎。

如果你使用PTC编写你的算法，ES6引擎将会实施TCO来使你的代码运行在一个定长深度的栈中（通过重用栈帧）。你将在得到递归的可读性的同时，也得到性能上的大部分好处与无限的运行长度。

### 元？

TCO与元编程有什么关系？

正如我们在早先的“特性测试”一节中讲过的，你可以在运行时判定一个引擎支持什么特性。这也包括TCO，虽然判定的过程相当粗暴。考虑如下代码：

```js
"use strict";

try {
	(function foo(x){
		if (x < 5E5) return foo( x + 1 );
	})( 1 );

	TCO_ENABLED = true;
}
catch (err) {
	TCO_ENABLED = false;
}
```

在一个非TCO引擎中，递归循环最终将会失败，抛出一个被`try..catch`捕获的异常。否则循环将由TCO轻易地完成。

讨厌，对吧？

但是围绕着TCO特性进行的元编程（或者，没有它）如何给我们的代码带来好处？简单的答案是你可以使用这样的特性测试来决定加载一个你的应用程序的使用递归的版本，还是一个被转换/转译为不需要递归的版本。

#### 自我调整的代码

但这里有另外一种看待这个问题的方式：

```js
"use strict";

function foo(x) {
	function _foo() {
		if (x > 1) {
			acc = acc + (x / 2);
			x = x - 1;
			return _foo();
		}
	}

	var acc = 1;

	while (x > 1) {
		try {
			_foo();
		}
		catch (err) { }
	}

	return acc;
}

foo( 123456 );			// 3810376848.5
```

这个算法试图尽可能多地使用递归来工作，但是通过作用域中的变量`x`和`acc`来跟踪这个进程。如果整个问题可以通过递归没有错误地解决，很好。如果引擎在某一点终止了递归，我们简单地使用`try..catch`捕捉它，然后从我们离开的地方再试一次。

我认为这是一种形式的元编程，因为你在运行时期间探测着引擎是否能（递归地）完成任务的能力，并绕过了任何可能制约你的（非TCO的）引擎的限制。

一眼（或者是两眼！）看上去，我打赌这段代码要比以前的版本难看许多。它运行起来还相当地慢一些（在一个非TCO环境中长时间运行的情况下）。

它主要的优势是，除了在非TCO引擎中也能完成任意栈大小的任务外，这种对递归栈限制的“解法”要比前面展示的蹦床和手动展开技术灵活得多。

实质上，这种情况下的`_foo()`实际上是任意递归任务，甚至是相互递归的某种替身。剩下的内容是应当对任何算法都可以工作的模板代码。

唯一的“技巧”是为了能够在达到递归限制的事件发生时继续运行，递归的状态必须保存在递归函数外部的作用域变量中。我们是通过将`x`和`acc`留在`_foo()`函数外面这样做的，而不是像早先那样将它们作为参数值传递给`_foo()`。

几乎所有的递归算法都可以采用这种方法工作。这意味着它是在你的程序中，进行最小的重写就能利用TCO递归的最广泛的可行方法。

这种方式仍然使用一个PTC，意味着这段代码将会 *渐进增强*：从在一个老版浏览器中使用许多次循环（递归批处理）来运行，到在一个ES6+环境中完全利用TCO递归。我觉得这相当酷！

## 复习

元编程是当你将程序的逻辑转向关注它自身（或者它的运行时环境）时进行的编程，要么为了调查它自己的结构，要么为了修改它。元编程的主要价值是扩展语言的普通机制来提供额外的能力。

在ES6以前，JavaScript已经有了相当的元编程能力，但是ES6使用了几个新特性及大地提高了它的地位。

从对匿名函数的函数名推断，到告诉你一个构造器是如何被调用的元属性，你可以前所未有地在程序运行期间来调查它的结构。通用Symbols允许你覆盖固有的行为，比如将一个对象转换为一个基本类型值的强制转换。代理可以拦截并自定义各种在对象上的底层操作，而且`Reflect`提供了模拟它们的工具。

特性测试，即便是对尾部调用优化这样微妙的语法行为，将元编程的焦点从你的程序提升到JS引擎的能力本身。通过更多地了解环境可以做什么，你的程序可以在运行时将它们自己调整到最佳状态。

你应该进行元编程吗？我的建议是：先集中学习这门语言的核心机制是如何工作的。一旦你完全懂得了JS本身可以做什么，就是开始利用这些强大的元编程能力将这门语言向前推进的时候了！
