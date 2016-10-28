# You Don't Know JS: ES6 & Beyond
# Chapter 7: Meta Programming

元编程是针对程序本身的行为进行操作的编程。换句话说，它是为你程序的编程而进行的编程。是的，很拗口，对吧？

例如，如果你为了调查对象`a`和另一个对象`b`之间的关系 —— 它们是被`[[Prototype]]`链接的吗？ —— 而使用`a.isPrototypeOf(b)`，这通常称为自省，一种形式的元编程。宏（JS中还没有） —— 代码在编译时修改自己 —— 是元编程的另一个明显的例子。使用`for..in`循环枚举一个对象的键，或者检查一个对象是否是一个“类构造器”的 *实例*，是另一些常见的元编程任务。

元编程关注一下的一点或几点：代码检视自己，代码修改自己，或者代码修改默认的语言行为而使其他代码受影响。

元编程的目标是利用语言自身的内在能力使你其他部分的代码更具描述性，表现力，和/或灵活性。由于元编程的 *元* 的性质，要给它一个更精确的定义有些困难。理解元编程的最佳方法是通过代码来观察它。

ES6在JS已经拥有的东西上，增加了几种新的元编程形式/特性。

## Function Names

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
	// what is the name of `cb()` here?
}

foo( function(){
	// I'm anonymous!
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

### Inferences

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

## Meta Properties

在第三章的“`new.target`”一节中，我们引入了一个ES6的新概念：元属性。正如这个名称所暗示的，元属性意在以一种属性访问的形式提供特殊的元信息，而这在以前是不可能的。

在`new.target`的情况下，关键字`new`作为一个属性访问的上下文环境。显然`new`本身不是一个对象，这使得这种能力很特殊。然而，当`new.target`被用于一个构造器调用（一个使用`new`调用的函数/方法）内部时，`new`变成了一个虚拟上下文环境，如此`new.target`就可以指代这个`new`调用的目标构造器。

这是一个元编程操作的典型例子，因为它的意图是从一个构造器调用内部判定原来的`new`的目标是什么，这一般是为了自省（检查类型/解构）或者静态属性访问。

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

## Well Known Symbols

在第二章中的“Symbol”一节中，我们讲解了新的ES6基本类型`symbol`。除了你可以在你自己的程序中定义的symbol以外，JS预定义了几种内建symbol，被称为 *Well Known Symbols*。

定义这些symbol值主要是为了向你的JS程序暴露特殊的元属性来给你更多JS行为的控制权。

我们将简要介绍每一个symbol并讨论它们的目的。

### `Symbol.iterator`

在第二和第三章中，我们介绍并使用了`@@iterator`symbol，它被自动地用于`...`扩散和`for..of`循环。我们还在第五章中看到了在新的ES6集合中定义的`@@iterator`。

`Symbol.iterator`表示在任意一个对象上的特殊位置（属性），语言机制自动地在这里寻找一个方法，这个方法将构建一个用于消费对象值的迭代器对象。许多对象都带有一个默认的`Symbol.iterator`。

然而，我们可以通过设置`Symbol.iterator`属性来为任意对象定义我们自己的迭代器逻辑，即便它是覆盖默认迭代器的。这里的元编程观点是，我们在定义JS的其他部分在处理对象值时所使用的行为。

考虑如下代码：

```js
var arr = [4,5,6,7,8,9];

for (var v of arr) {
	console.log( v );
}
// 4 5 6 7 8 9

// define iterator that only produces values
// from odd indexes
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

### `Symbol.toStringTag` and `Symbol.hasInstance`

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
	// defer `@@species` to derived constructor
	static get [Symbol.species]() { return this; }

	again() {
		return new this.constructor[Symbol.species]();
	}
}

class Fun extends Cool {}

class Awesome extends Cool {
	// force `@@species` to be parent constructor
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
		// sum all numbers
		return this.reduce( function(acc,curr){
			return acc + curr;
		}, 0 );
	}
};

arr + 10;				// 25
```

`Symbol.toPrimitive`方法将根据调用`ToPrimitive`的操作期望何种类型，而被提供一个值为`"string"`，`"number"`，或`"default"`（这应当被解释为`"number"`）的 *提示（hint）*。在前一个代码段中，`+`加法操作没有提示（`"default"`将被传递）。一个`*`乘法操作将提示`"number"`，而一个`String(arr)`将提示`"string"`。

**警告：** `==`操作符将在一个对象上不使用任何提来示调用`ToPrimitive`操作 —— 如果存在`@@toPrimitive`方法的话，将使用`"default"`被调用 —— 如果另一个被比较的值不是一个对象。但是，如果两个被比较的值都是对象，`==`的行为与`===`是完全相同的，也就是引用本身将被直接比较。这种情况下，`@@toPrimitive`根本不会被调用。关于强制转换和抽象操作的更多信息，参见本系列的 *类型与文法*。

### Regular Expression Symbols

对于正则表达式对象，有四种well known symbols 可以被覆盖，它们控制着这些正则表达式在四个相应的同名`String.prototype`函数中如何被使用：

* `@@match`：一个正则表达式的`Symbol.match`值是使用被给定的正则表达式来匹配一个字符串值的全部或部分的方法。如果你为`String.prototype.match(..)`传递一个正则表达式做范例匹配，它就会被使用。

	 匹配的默认算法写在ES6语言规范的第21.2.5.6部分(https://people.mozilla.org/~jorendorff/es6-draft.html#sec-regexp.prototype-@@match)。你可以覆盖这个默认算法并提供额外的正则表达式特性，比如后顾断言。

	 `Symbol.match`还被用于`isRegExp`抽象操作（参见第六章的“字符串检测函数”中的注意部分）来判定一个对象是否意在被用作正则表达式。为了是一个要被用作正则表达式的对象不被看作是正则表达式，可以将`Symbol.match`的值设置为`false`（或falsy的东西）强制这个检查失败。

* `@@replace`：一个正则表达式的`Symbol.replace`值是被`String.prototype.replace(..)`使用的方法，来替换一个字符串里面出现的一个或所有字符序列，这些字符序列匹配给出的正则表达式范例。

	 替换的默认算法写在ES6语言规范的第21.2.5.8部分(https://people.mozilla.org/~jorendorff/es6-draft.html#sec-regexp.prototype-@@replace)。

	 一个覆盖默认算法的很酷的用法是提供额外的`replacer`可选参数子，比如通过用连续的替换值消费可迭代对象来支持`"abaca".replace(/a/g,[1,2,3])`产生`"1b2c3"`。

* `@@search`：一个正则表达式的`Symbol.search`值是被`String.prototype.search(..)`使用的方法，来在一个字符串中检索一个匹配给定正则表达式的子字符串。

	 检索的默认算法写在ES6语言规范的第21.2.5.9部分(https://people.mozilla.org/~jorendorff/es6-draft.html#sec-regexp.prototype-@@search)。

* `@@split`：一个正则表达式的`Symbol.split`值是被`String.prototype.split(..)`使用的方法，来将一个字符串在分隔符匹配给定正则表达式的位置分割为子字符串。

	 分割的默认算法写在ES6语言规范的第21.2.5.11部分(https://people.mozilla.org/~jorendorff/es6-draft.html#sec-regexp.prototype-@@split)。

覆盖内建的正则表达式算法不是为心脏脆弱的人准备的！JS带有高度优化的正则表达式引擎，所以你自己的用户代码将很可能慢得多。这各种类的元编程很精巧和强大，但是应当仅用于确实必要或有好处的情况下。

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

## Proxies

在ES6中被加入的最明显的元编程特性之一就是`proxy`特性。

一个代理是一种由你创建的特殊的对象，它“包”着另一个普通的对象 —— 或者说挡在这个普通对象的前面。你可以在代理对象上注册特殊的处理器（也叫 *机关（traps）*），当对这个代理实施各种操作时被调用。这些处理器除了将操作 *传送* 到原本的目标/被包装的对象上之外，还有机会运行额外的逻辑。

一个这样的 *机关* 处理器的例子是，你可以在一个代理上定义一个拦截`[[Get]]`操作的`get` —— 它在当你试图访问一个对象上的属性时运行。考虑如下代码：

```js
var obj = { a: 1 },
	handlers = {
		get(target,key,context) {
			// note: target === obj,
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

* `preventExtensions(..)`：通过`[[PreventExtensions]]`使代理称为不可扩展的（`Object.preventExtensions(..)`或`Reflect.preventExtensions(..)`）

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

### Proxy Limitations

These meta programming handlers trap a wide array of fundamental operations you can perform against an object. However, there are some operations which are not (yet, at least) available to intercept.

这些元编程处理器拦截了你可以对一个对象进行的很广泛的一组基础操作。但是，有一些操作不能（至少是还不能）被用于拦截。

For example, none of these operations are trapped and forwarded from `pobj` proxy to `obj` target:

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

Perhaps in the future, more of these underlying fundamental operations in the language will be interceptable, giving us even more power to extend JavaScript from within itself.

也许在未来，更多这些语言中的底层基础操作都将是可拦截的，以给我们更多力量来从JavaScript自身扩展它。

**Warning:** There are certain *invariants* -- behaviors which cannot be overridden -- that apply to the use of proxy handlers. For example, the result from the `isExtensible(..)` handler is always coerced to a `boolean`. These invariants restrict some of your ability to customize behaviors with proxies, but they do so only to prevent you from creating strange and unusual (or inconsistent) behavior. The conditions for these invariants are complicated so we won't fully go into them here, but this post (http://www.2ality.com/2014/12/es6-proxies.html#invariants) does a great job of covering them.

**警告：** 对于代理处理器的使用来说存在某些 *不变量* —— 它们的行为不能被覆盖。例如，`isExtensible(..)`处理器的结果总是被强制转换为一个`boolean`。这些不变量限制了一些你可以使用代理来自定义行为的能力，但是它们这样做只是为了防止你创建奇怪和不寻常（或不合逻辑）的行为。这些不变量的条件十分复杂，所以我们就不再这里全面阐述了，但是这篇博文(http://www.2ality.com/2014/12/es6-proxies.html#invariants)很好地讲解了它们。

### Revocable Proxies

A regular proxy always traps for the target object, and cannot be modified after creation -- as long as a reference is kept to the proxy, proxying remains possible. However, there may be cases where you want to create a proxy that can be disabled when you want to stop allowing it to proxy. The solution is to create a *revocable proxy*:

一个一般的代理总是包装着目标对象，而且在创建之后就不能修改了 —— 只要保持着一个指向这个代理的引用，代理的机制就将维持下去。但是，可能会有一些情况你想要创建一个这样的代理：在你想要停止它作为代理时可以被停用。解决方案就是创建一个 *可撤销代理*：

```js
var obj = { a: 1 },
	handlers = {
		get(target,key,context) {
			// note: target === obj,
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

// later:
prevoke();

pobj.a;
// TypeError
```

A revocable proxy is created with `Proxy.revocable(..)`, which is a regular function, not a constructor like `Proxy(..)`. Otherwise, it takes the same two arguments: *target* and *handlers*.

The return value of `Proxy.revocable(..)` is not the proxy itself as with `new Proxy(..)`. Instead, it's an object with two properties: *proxy* and *revoke* -- we used object destructuring (see "Destructuring" in Chapter 2) to assign these properties to `pobj` and `prevoke()` variables, respectively.

Once a revocable proxy is revoked, any attempts to access it (trigger any of its traps) will throw a `TypeError`.

An example of using a revocable proxy might be handing out a proxy to another party in your application that manages data in your model, instead of giving them a reference to the real model object itself. If your model object changes or is replaced, you want to invalidate the proxy you handed out so the other party knows (via the errors!) to request an updated reference to the model.

### Using Proxies

The meta programming benefits of these Proxy handlers should be obvious. We can almost fully intercept (and thus override) the behavior of objects, meaning we can extend object behavior beyond core JS in some very powerful ways. We'll look at a few example patterns to explore the possibilities.

#### Proxy First, Proxy Last

As we mentioned earlier, you typically think of a proxy as "wrapping" the target object. In that sense, the proxy becomes the primary object that the code interfaces with, and the actual target object remains hidden/protected.

You might do this because you want to pass the object somewhere that can't be fully "trusted," and so you need to enforce special rules around its access rather than passing the object itself.

Consider:

```js
var messages = [],
	handlers = {
		get(target,key) {
			// string value?
			if (typeof target[key] == "string") {
				// filter out punctuation
				return target[key]
					.replace( /[^\w]/g, "" );
			}

			// pass everything else through
			return target[key];
		},
		set(target,key,val) {
			// only set unique strings, lowercased
			if (typeof val == "string") {
				val = val.toLowerCase();
				if (target.indexOf( val ) == -1) {
					target.push(
						val.toLowerCase()
					);
				}
			}
			return true;
		}
	},
	messages_proxy =
		new Proxy( messages, handlers );

// elsewhere:
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

I call this *proxy first* design, as we interact first (primarily, entirely) with the proxy.

We enforce some special rules on interacting with `messages_proxy` that aren't enforced for `messages` itself. We only add elements if the value is a string and is also unique; we also lowercase the value. When retrieving values from `messages_proxy`, we filter out any punctuation in the strings.

Alternatively, we can completely invert this pattern, where the target interacts with the proxy instead of the proxy interacting with the target. Thus, code really only interacts with the main object. The easiest way to accomplish this fallback is to have the proxy object in the `[[Prototype]]` chain of the main object.

Consider:

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

// setup `greeter` to fall back to `catchall`
Object.setPrototypeOf( greeter, catchall );

greeter.speak();				// hello someone
greeter.speak( "world" );		// hello world

greeter.everyone();				// hello everyone!
```

We interact directly with `greeter` instead of `catchall`. When we call `speak(..)`, it's found on `greeter` and used directly. But when we try to access a method like `everyone()`, that function doesn't exist on `greeter`.

The default object property behavior is to check up the `[[Prototype]]` chain (see the *this & Object Prototypes* title of this series), so `catchall` is consulted for an `everyone` property. The proxy `get()` handler then kicks in and returns a function that calls `speak(..)` with the name of the property being accessed (`"everyone"`).

I call this pattern *proxy last*, as the proxy is used only as a last resort.

#### "No Such Property/Method"

A common complaint about JS is that objects aren't by default very defensive in the situation where you try to access or set a property that doesn't already exist. You may wish to predefine all the properties/methods for an object, and have an error thrown if a nonexistent property name is subsequently used.

We can accomplish this with a proxy, either in *proxy first* or *proxy last* design. Let's consider both.

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

For both `get(..)` and `set(..)`, we only forward the operation if the target object's property already exists; error thrown otherwise. The proxy object (`pobj`) is the main object code should interact with, as it intercepts these actions to provide the protections.

Now, let's consider inverting with *proxy last* design:

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

// setup `obj` to fall back to `pobj`
Object.setPrototypeOf( obj, pobj );

obj.a = 3;
obj.foo();			// a: 3

obj.b = 4;			// Error: No such property/method!
obj.bar();			// Error: No such property/method!
```

The *proxy last* design here is a fair bit simpler with respect to how the handlers are defined. Instead of needing to intercept the `[[Get]]` and `[[Set]]` operations and only forward them if the target property exists, we instead rely on the fact that if either `[[Get]]` or `[[Set]]` get to our `pobj` fallback, the action has already traversed the whole `[[Prototype]]` chain and not found a matching property. We are free at that point to unconditionally throw the error. Cool, huh?

#### Proxy Hacking the `[[Prototype]]` Chain

The `[[Get]]` operation is the primary channel by which the `[[Prototype]]` mechanism is invoked. When a property is not found on the immediate object, `[[Get]]` automatically hands off the operation to the `[[Prototype]]` object.

That means you can use the `get(..)` trap of a proxy to emulate or extend the notion of this `[[Prototype]]` mechanism.

The first hack we'll consider is creating two objects which are circularly linked via `[[Prototype]]` (or, at least it appears that way!). You cannot actually create a real circular `[[Prototype]]` chain, as the engine will throw an error. But a proxy can fake it!

Consider:

```js
var handlers = {
		get(target,key,context) {
			if (Reflect.has( target, key )) {
				return Reflect.get(
					target, key, context
				);
			}
			// fake circular `[[Prototype]]`
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

// fake circular `[[Prototype]]` link
obj1[ Symbol.for( "[[Prototype]]" ) ] = obj2;

obj1.bar();
// bar: obj-1 <-- through proxy faking [[Prototype]]
// foo: obj-1 <-- `this` context still preserved

obj2.foo();
// foo: obj-2 <-- through [[Prototype]]
```

**Note:** We didn't need to proxy/forward `[[Set]]` in this example, so we kept things simpler. To be fully `[[Prototype]]` emulation compliant, you'd want to implement a `set(..)` handler that searches the `[[Prototype]]` chain for a matching property and respects its descriptor behavior (e.g., set, writable). See the *this & Object Prototypes* title of this series.

In the previous snippet, `obj2` is `[[Prototype]]` linked to `obj1` by virtue of the `Object.create(..)` statement. But to create the reverse (circular) linkage, we create property on `obj1` at the symbol location `Symbol.for("[[Prototype]]")` (see "Symbols" in Chapter 2). This symbol may look sort of special/magical, but it isn't. It just allows me a conveniently named hook that semantically appears related to the task I'm performing.

Then, the proxy's `get(..)` handler looks first to see if a requested `key` is on the proxy. If not, the operation is manually handed off to the object reference stored in the `Symbol.for("[[Prototype]]")` location of `target`.

One important advantage of this pattern is that the definitions of `obj1` and `obj2` are mostly not intruded by the setting up of this circular relationship between them. Although the previous snippet has all the steps intertwined for brevity's sake, if you look closely, the proxy handler logic is entirely generic (doesn't know about `obj1` or `obj2` specifically). So, that logic could be pulled out into a simple helper that wires them up, like a `setCircularPrototypeOf(..)` for example. We'll leave that as an exercise for the reader.

Now that we've seen how we can use `get(..)` to emulate a `[[Prototype]]` link, let's push the hackery a bit further. Instead of a circular `[[Prototype]]`, what about multiple `[[Prototype]]` linkages (aka "multiple inheritance")? This turns out to be fairly straightforward:

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
			// fake multiple `[[Prototype]]`
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

// fake multiple `[[Prototype]]` links
obj3[ Symbol.for( "[[Prototype]]" ) ] = [
	obj1, obj2
];

obj3.baz();
// obj1.foo: obj-3
// obj2.bar: obj-3
```

**Note:** As mentioned in the note after the earlier circular `[[Prototype]]` example, we didn't implement the `set(..)` handler, but it would be necessary for a complete solution that emulates `[[Set]]` actions as normal `[[Prototype]]`s behave.

`obj3` is set up to multiple-delegate to both `obj1` and `obj2`. In `obj3.baz()`, the `this.foo()` call ends up pulling `foo()` from `obj1` (first-come, first-served, even though there's also a `foo()` on `obj2`). If we reordered the linkage as `obj2, obj1`, the `obj2.foo()` would have been found and used.

But as is, the `this.bar()` call doesn't find a `bar()` on `obj1`, so it falls over to check `obj2`, where it finds a match.

`obj1` and `obj2` represent two parallel `[[Prototype]]` chains of `obj3`. `obj1` and/or `obj2` could themselves have normal `[[Prototype]]` delegation to other objects, or either could themself be a proxy (like `obj3` is) that can multiple-delegate.

Just as with the circular `[[Prototype]]` example earlier, the definitions of `obj1`, `obj2`, and `obj3` are almost entirely separate from the generic proxy logic that handles the multiple-delegation. It would be trivial to define a utility like `setPrototypesOf(..)` (notice the "s"!) that takes a main object and a list of objects to fake the multiple `[[Prototype]]` linkage to. Again, we'll leave that as an exercise for the reader.

Hopefully the power of proxies is now becoming clearer after these various examples. There are many other powerful meta programming tasks that proxies enable.

## `Reflect` API

The `Reflect` object is a plain object (like `Math`), not a function/constructor like the other built-in natives.

It holds static functions which correspond to various meta programming tasks that you can control. These functions correspond one-to-one with the handler methods (*traps*) that Proxies can define.

Some of the functions will look familiar as functions of the same names on `Object`:

* `Reflect.getOwnPropertyDescriptor(..)`
* `Reflect.defineProperty(..)`
* `Reflect.getPrototypeOf(..)`
* `Reflect.setPrototypeOf(..)`
* `Reflect.preventExtensions(..)`
* `Reflect.isExtensible(..)`

These utilities in general behave the same as their `Object.*` counterparts. However, one difference is that the `Object.*` counterparts attempt to coerce their first argument (the target object) to an object if it's not already one. The `Reflect.*` methods simply throw an error in that case.

An object's keys can be accessed/inspected using these utilities:

* `Reflect.ownKeys(..)`: Returns the list of all owned keys (not "inherited"), as returned by both `Object.getOwnPropertyNames(..)` and `Object.getOwnPropertySymbols(..)`. See the "Property Enumeration Order" section for information about the order of keys.
* `Reflect.enumerate(..)`: Returns an iterator that produces the set of all non-symbol keys (owned and "inherited") that are *enumerable* (see the *this & Object Prototypes* title of this series). Essentially, this set of keys is the same as those processed by a `for..in` loop. See the "Property Enumeration Order" section for information about the order of keys.
* `Reflect.has(..)`: Essentially the same as the `in` operator for checking if a property is on an object or its `[[Prototype]]` chain. For example, `Reflect.has(o,"foo")` essentially performs `"foo" in o`.

Function calls and constructor invocations can be performed manually, separate of the normal syntax (e.g., `(..)` and `new`) using these utilities:

* `Reflect.apply(..)`: For example, `Reflect.apply(foo,thisObj,[42,"bar"])` calls the `foo(..)` function with `thisObj` as its `this`, and passes in the `42` and `"bar"` arguments.
* `Reflect.construct(..)`: For example, `Reflect.construct(foo,[42,"bar"])` essentially calls `new foo(42,"bar")`.

Object property access, setting, and deletion can be performed manually using these utilities:

* `Reflect.get(..)`: For example, `Reflect.get(o,"foo")` retrieves `o.foo`.
* `Reflect.set(..)`: For example, `Reflect.set(o,"foo",42)` essentially performs `o.foo = 42`.
* `Reflect.deleteProperty(..)`: For example, `Reflect.deleteProperty(o,"foo")` essentially performs `delete o.foo`.

The meta programming capabilities of `Reflect` give you programmatic equivalents to emulate various syntactic features, exposing previously hidden-only abstract operations. For example, you can use these capabilities to extend features and APIs for *domain specific languages* (DSLs).

### Property Ordering

Prior to ES6, the order used to list an object's keys/properties was implementation dependent and undefined by the specification. Generally, most engines have enumerated them in creation order, though developers have been strongly encouraged not to ever rely on this ordering.

As of ES6, the order for listing owned properties is now defined (ES6 specification, section 9.1.12) by the `[[OwnPropertyKeys]]` algorithm, which produces all owned properties (strings or symbols), regardless of enumerability. This ordering is only guaranteed for `Reflect.ownKeys(..)` (and by extension, `Object.getOwnPropertyNames(..)` and `Object.getOwnPropertySymbols(..)`).

The ordering is:

1. First, enumerate any owned properties that are integer indexes, in ascending numeric order.
2. Next, enumerate the rest of the owned string property names in creation order.
3. Finally, enumerate owned symbol properties in creation order.

Consider:

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

On the other hand, the `[[Enumerate]]` algorithm (ES6 specification, section 9.1.11) produces only enumerable properties, from the target object as well as its `[[Prototype]]` chain. It is used by both `Reflect.enumerate(..)` and `for..in`. The observable ordering is implementation dependent and not controlled by the specification.

By contrast, `Object.keys(..)` invokes the `[[OwnPropertyKeys]]` algorithm to get a list of all owned keys. However, it filters out non-enumerable properties and then reorders the list to match legacy implementation-dependent behavior, specifically with `JSON.stringify(..)` and `for..in`. So, by extension the ordering *also* matches that of `Reflect.enumerate(..)`.

In other words, all four mechanisms (`Reflect.enumerate(..)`, `Object.keys(..)`, `for..in`, and `JSON.stringify(..)`) will  match with the same implementation-dependent ordering, though they technically get there in different ways.

Implementations are allowed to match these four to the ordering of `[[OwnPropertyKeys]]`, but are not required to. Nevertheless, you will likely observe the following ordering behavior from them:

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

Boiling this all down: as of ES6, `Reflect.ownKeys(..)`, `Object.getOwnPropertyNames(..)`, and `Object.getOwnPropertySymbols(..)` all have predictable and reliable ordering guaranteed by the specification. So it's safe to build code that relies on this ordering.

`Reflect.enumerate(..)`, `Object.keys(..)`, and `for..in` (as well as `JSON.stringification(..)` by extension) continue to share an observable ordering with each other, as they always have. But that ordering will not necessarily be the same as that of `Reflect.ownKeys(..)`. Care should still be taken in relying on their implementation-dependent ordering.

## Feature Testing

What is a feature test? It's a test that you run to determine if a feature is available or not. Sometimes, the test is not just for existence, but for conformance to specified behavior -- features can exist but be buggy.

This is a meta programming technique, to test the environment your program runs in to then determine how your program should behave.

The most common use of feature tests in JS is checking for the existence of an API and if it's not present, defining a polyfill (see Chapter 1). For example:

```js
if (!Number.isNaN) {
	Number.isNaN = function(x) {
		return x !== x;
	};
}
```

The `if` statement in this snippet is meta programming: we're probing our program and its runtime environment to determine if and how we should proceed.

But what about testing for features that involve new syntax?

You might try something like:

```js
try {
	a = () => {};
	ARROW_FUNCS_ENABLED = true;
}
catch (err) {
	ARROW_FUNCS_ENABLED = false;
}
```

Unfortunately, this doesn't work, because our JS programs are compiled. Thus, the engine will choke on the `() => {}` syntax if it is not already supporting ES6 arrow functions. Having a syntax error in your program prevents it from running, which prevents your program from subsequently responding differently if the feature is supported or not.

To meta program with feature tests around syntax-related features, we need a way to insulate the test from the initial compile step our program runs through. For instance, if we could store the code for the test in a string, then the JS engine wouldn't by default try to compile the contents of that string, until we asked it to.

Did your mind just jump to using `eval(..)`?

Not so fast. See the *Scope & Closures* title of this series for why `eval(..)` is a bad idea. But there's another option with less downsides: the `Function(..)` constructor.

Consider:

```js
try {
	new Function( "( () => {} )" );
	ARROW_FUNCS_ENABLED = true;
}
catch (err) {
	ARROW_FUNCS_ENABLED = false;
}
```

OK, so now we're meta programming by determining if a feature like arrow functions *can* compile in the current engine or not. You might then wonder, what would we do with this information?

With existence checks for APIs, and defining fallback API polyfills, there's a clear path for what to do with either test success or failure. But what can we do with the information that we get from `ARROW_FUNCS_ENABLED` being `true` or `false`?

Because the syntax can't appear in a file if the engine doesn't support that feature, you can't just have different functions defined in the file with and without the syntax in question.

What you can do is use the test to determine which of a set of JS files you should load. For example, if you had a set of these feature tests in a bootstrapper for your JS application, it could then test the environment to determine if your ES6 code can be loaded and run directly, or if you need to load a transpiled version of your code (see Chapter 1).

This technique is called *split delivery*.

It recognizes the reality that your ES6 authored JS programs will sometimes be able to entirely run "natively" in ES6+ browsers, but other times need transpilation to run in pre-ES6 browsers. If you always load and use the transpiled code, even in the new ES6-compliant environments, you're running suboptimal code at least some of the time. This is not ideal.

Split delivery is more complicated and sophisticated, but it represents a more mature and robust approach to bridging the gap between the code you write and the feature support in browsers your programs must run in.

### FeatureTests.io

Defining feature tests for all of the ES6+ syntax, as well as the semantic behaviors, is a daunting task you probably don't want to tackle yourself. Because these tests require dynamic compilation (`new Function(..)`), there's some unfortunate performance cost.

Moreover, running these tests every single time your app runs is probably wasteful, as on average a user's browser only updates once in a several week period at most, and even then, new features aren't necessarily showing up with every update.

Finally, managing the list of feature tests that apply to your specific code base -- rarely will your programs use the entirety of ES6 -- is unruly and error-prone.

The "https://featuretests.io" feature-tests-as-a-service offers solutions to these frustrations.

You can load the service's library into your page, and it loads the latest test definitions and runs all the feature tests. It does so using background processing with Web Workers, if possible, to reduce the performance overhead. It also uses LocalStorage persistence to cache the results in a way that can be shared across all sites you visit which use the service, which drastically reduces how often the tests need to run on each browser instance.

You get runtime feature tests in each of your users' browsers, and you can use those tests results dynamically to serve users the most appropriate code (no more, no less) for their environments.

Moreover, the service provides tools and APIs to scan your files to determine what features you need, so you can fully automate your split delivery build processes.

FeatureTests.io makes it practical to use feature tests for all parts of ES6 and beyond to make sure that only the best code is ever loaded and run for any given environment.

## Tail Call Optimization (TCO)

Normally, when a function call is made from inside another function, a second *stack frame* is allocated to separately manage the variables/state of that other function invocation. Not only does this allocation cost some processing time, but it also takes up some extra memory.

A call stack chain typically has at most 10-15 jumps from one function to another and another. In those scenarios, the memory usage is not likely any kind of practical problem.

However, when you consider recursive programming (a function calling itself repeatedly) -- or mutual recursion with two or more functions calling each other -- the call stack could easily be hundreds, thousands, or more levels deep. You can probably see the problems that could cause, if memory usage grows unbounded.

JavaScript engines have to set an arbitrary limit to prevent such programming techniques from crashing by running the browser and device out of memory. That's why we get the frustrating "RangeError: Maximum call stack size exceeded" thrown if the limit is hit.

**Warning:** The limit of call stack depth is not controlled by the specification. It's implementation dependent, and will vary between browsers and devices. You should never code with strong assumptions of exact observable limits, as they may very well change from release to release.

Certain patterns of function calls, called *tail calls*, can be optimized in a way to avoid the extra allocation of stack frames. If the extra allocation can be avoided, there's no reason to arbitrarily limit the call stack depth, so the engines can let them run unbounded.

A tail call is a `return` statement with a function call, where nothing has to happen after the call except returning its value.

This optimization can only be applied in `strict` mode. Yet another reason to always be writing all your code as `strict`!

Here's a function call that is *not* in tail position:

```js
"use strict";

function foo(x) {
	return x * 2;
}

function bar(x) {
	// not a tail call
	return 1 + foo( x );
}

bar( 10 );				// 21
```

`1 + ..` has to be performed after the `foo(x)` call completes, so the state of that `bar(..)` invocation needs to be preserved.

But the following snippet demonstrates calls to `foo(..)` and `bar(..)` where both *are* in tail position, as they're the last thing to happen in their code path (other than the `return`):

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

In this program, `bar(..)` is clearly recursive, but `foo(..)` is just a regular function call. In both cases, the function calls are in *proper tail position*. The `x + 1` is evaluated before the `bar(..)` call, and whenever that call finishes, all that happens is the `return`.

Proper Tail Calls (PTC) of these forms can be optimized -- called tail call optimization (TCO) -- so that the extra stack frame allocation is unnecessary. Instead of creating a new stack frame for the next function call, the engine just reuses the existing stack frame. That works because a function doesn't need to preserve any of the current state, as nothing happens with that state after the PTC.

TCO means there's practically no limit to how deep the call stack can be. That trick slightly improves regular function calls in normal programs, but more importantly opens the door to using recursion for program expression even if the call stack could be tens of thousands of calls deep.

We're no longer relegated to simply theorizing about recursion for problem solving, but can actually use it in real JavaScript programs!

As of ES6, all PTC should be optimizable in this way, recursion or not.

### Tail Call Rewrite

The hitch, however, is that only PTC can be optimized; non-PTC will still work of course, but will cause stack frame allocation as they always did. You'll have to be careful about structuring your functions with PTC if you expect the optimizations to kick in.

If you have a function that's not written with PTC, you may find the need to manually rearrange your code to be eligible for TCO.

Consider:

```js
"use strict";

function foo(x) {
	if (x <= 1) return 1;
	return (x / 2) + foo( x - 1 );
}

foo( 123456 );			// RangeError
```

The call to `foo(x-1)` isn't a PTC because its result has to be added to `(x / 2)` before `return`ing.

However, to make this code eligible for TCO in an ES6 engine, we can rewrite it as follows:

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

If you run the previous snippet in an ES6 engine that implements TCO, you'll get the `3810376848.5` answer as shown. However, it'll still fail with a `RangeError` in non-TCO engines.

### Non-TCO Optimizations

There are other techniques to rewrite the code so that the call stack isn't growing with each call.

One such technique is called *trampolining*, which amounts to having each partial result represented as a function that either returns another partial result function or the final result. Then you can simply loop until you stop getting a function, and you'll have the result. Consider:

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

This reworking required minimal changes to factor out the recursion into the loop in `trampoline(..)`:

1. First, we wrapped the `return _foo ..` line in the `return partial() { ..` function expression.
2. Then we wrapped the `_foo(1,x)` call in the `trampoline(..)` call.

The reason this technique doesn't suffer the call stack limitation is that each of those inner `partial(..)` functions is just returned back to the `while` loop in `trampoline(..)`, which runs it and then loop iterates again. In other words, `partial(..)` doesn't recursively call itself, it just returns another function. The stack depth remains constant, so it can run as long as it needs to.

Trampolining expressed in this way uses the closure that the inner `partial()` function has over the `x` and `acc` variables to keep the state from iteration to iteration. The advantage is that the looping logic is pulled out into a reusable `trampoline(..)` utility function, which many libraries provide versions of. You can reuse `trampoline(..)` multiple times in your program with different trampolined algorithms.

Of course, if you really wanted to deeply optimize (and the reusability wasn't a concern), you could discard the closure state and inline the state tracking of `acc` into just one function's scope along with a loop. This technique is generally called *recursion unrolling*:

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

This expression of the algorithm is simpler to read, and will likely perform the best (strictly speaking) of the various forms we've explored. That may seem like a clear winner, and you may wonder why you would ever try the other approaches.

There are some reasons why you might not want to always manually unroll your recursions:

* Instead of factoring out the trampolining (loop) logic for reusability, we've inlined it. This works great when there's only one example to consider, but as soon as you have a half dozen or more of these in your program, there's a good chance you'll want some reusability to keep things shorter and more manageable.
* The example here is deliberately simple enough to illustrate the different forms. In practice, there are many more complications in recursion algorithms, such as mutual recursion (more than just one function calling itself).

   The farther you go down this rabbit hole, the more manual and intricate the *unrolling* optimizations are. You'll quickly lose all the perceived value of readability. The primary advantage of recursion, even in the PTC form, is that it preserves the algorithm readability, and offloads the performance optimization to the engine.

If you write your algorithms with PTC, the ES6 engine will apply TCO to let your code run in constant stack depth (by reusing stack frames). You get the readability of recursion with most of the performance benefits and no limitations of run length.

### Meta?

What does TCO have to do with meta programming?

As we covered in the "Feature Testing" section earlier, you can determine at runtime what features an engine supports. This includes TCO, though determining it is quite brute force. Consider:

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

In a non-TCO engine, the recursive loop will fail out eventually, throwing an exception caught by the `try..catch`. Otherwise, the loop completes easily thanks to TCO.

Yuck, right?

But how could meta programming around the TCO feature (or rather, the lack thereof) benefit our code? The simple answer is that you could use such a feature test to decide to load a version of your application's code that uses recursion, or an alternative one that's been converted/transpiled to not need recursion.

#### Self-Adjusting Code

But here's another way of looking at the problem:

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

This algorithm works by attempting to do as much of the work with recursion as possible, but keeping track of the progress via scoped variables `x` and `acc`. If the entire problem can be solved with recursion without an error, great. If the engine kills the recursion at some point, we simply catch that with the `try..catch` and then try again, picking up where we left off.

I consider this a form of meta programming in that you are probing during runtime the ability of the engine to fully (recursively) finish the task, and working around any (non-TCO) engine limitations that may restrict you.

At first (or even second!) glance, my bet is this code seems much uglier to you compared to some of the earlier versions. It also runs a fair bit slower (on larger runs in a non-TCO environment).

The primary advantage, other than it being able to complete any size task even in non-TCO engines, is that this "solution" to the recursion stack limitation is much more flexible than the trampolining or manual unrolling techniques shown previously.

Essentially, `_foo()` in this case is a sort of stand-in for practically any recursive task, even mutual recursion. The rest is the boilerplate that should work for just about any algorithm.

The only "catch" is that to be able to resume in the event of a recursion limit being hit, the state of the recursion must be in scoped variables that exist outside the recursive function(s). We did that by leaving `x` and `acc` outside of the `_foo()` function, instead of passing them as arguments to `_foo()` as earlier.

Almost any recursive algorithm can be adapted to work this way. That means it's the most widely applicable way of leveraging TCO with recursion in your programs, with minimal rewriting.

This approach still uses a PTC, meaning that this code will *progressively enhance* from running using the loop many times (recursion batches) in an older browser to fully leveraging TCO'd recursion in an ES6+ environment. I think that's pretty cool!

## Review

Meta programming is when you turn the logic of your program to focus on itself (or its runtime environment), either to inspect its own structure or to modify it. The primary value of meta programming is to extend the normal mechanisms of the language to provide additional capabilities.

Prior to ES6, JavaScript already had quite a bit of meta programming capability, but ES6 significantly ramps that up with several new features.

From function name inferences for anonymous functions to meta properties that give you information about things like how a constructor was invoked, you can inspect the program structure while it runs more than ever before. Well Known Symbols let you override intrinsic behaviors, such as coercion of an object to a primitive value. Proxies can intercept and customize various low-level operations on objects, and `Reflect` provides utilities to emulate them.

Feature testing, even for subtle semantic behaviors like Tail Call Optimization, shifts the meta programming focus from your program to the JS engine capabilities itself. By knowing more about what the environment can do, your programs can adjust themselves to the best fit as they run.

Should you meta program? My advice is: first focus on learning how the core mechanics of the language really work. But once you fully know what JS itself can do, it's time to start leveraging these powerful meta programming capabilities to push the language further!
