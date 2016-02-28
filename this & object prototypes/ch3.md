# 你不懂JS: *this* & Object Prototypes
# 第三章：对象

In Chapters 1 and 2, we explained how the `this` binding points to various objects depending on the call-site of the function invocation. But what exactly are objects, and why do we need to point to them? We will explore objects in detail in this chapter.

在第一和第二种中，我们解释了`this`绑定如何根据函数调用的call-site指向不同的对象。但究竟什么事对象，为什么我们需要指向它们？这一章我们就来详细探索一下对象。

## Syntax
## 语法

Objects come in two forms: the declarative (literal) form, and the constructed form.

对象来自于两种形式：声明（字面）形式，和构造形式。

The literal syntax for an object looks like this:

一个对象的字面语法看起来像这样：

```js
var myObj = {
	key: value
	// ...
};
```

The constructed form looks like this:

构造形式看起来像这样：

```js
var myObj = new Object();
myObj.key = value;
```

The constructed form and the literal form result in exactly the same sort of object. The only difference really is that you can add one or more key/value pairs to the literal declaration, whereas with constructed-form objects, you must add the properties one-by-one.

构造形式和字面形式都会得到完全同种类的对象。唯一真正的区别在于你可以向字面声明一次性添加一个或多个键/值对，而对于构造形式，你必须一个一个地添加属性。

**Note:** It's extremely uncommon to use the "constructed form" for creating objects as just shown. You would pretty much always want to use the literal syntax form. The same will be true of most of the built-in objects (see below).

**注意：** 像刚才展示的那样使用“构造形式”来创建对象是极其少见的。你很有可能总是想使用字面语法形式。对大多数内建的对象也一样（后述）。

## Type
## 类型

Objects are the general building block upon which much of JS is built. They are one of the 6 primary types (called "language types" in the specification) in JS:

对象是大多数JS工程依赖的基本构建块儿（TODO）。它们是JS的6中主要类型（在语言规范中称为“语言类型”）中的一种。

* `string`
* `number`
* `boolean`
* `null`
* `undefined`
* `object`

Note that the *simple primitives* (`string`, `number`, `boolean`, `null`, and `undefined`) are **not** themselves `objects`. `null` is sometimes referred to as an object type, but this misconception stems from a bug in the language which causes `typeof null` to return the string `"object"` incorrectly (and confusingly). In fact, `null` is its own primitive type.

注意 *简单原基本型* （`string`，`number`，`boolean`，`null`，和`undefined`）自身 **不是** `object`。`null`有事会被当成一个对象类型，但是这种误解源自与一个语言中的Bug，它使得`typeof null`错误地（令人困惑地）返回字符串`"object"`。实际上，`null`是它自己的基本类型

**It's a common mis-statement that "everything in JavaScript is an object". This is clearly not true.**

**一个常见的错误声明：“JavaScript中的一切都是对象”。这明显是不对的。**

By contrast, there *are* a few special object sub-types, which we can refer to as *complex primitives*.

对比来看，存在几种特殊的对象子类型，我们称之为 *复杂基本类型*。

`function` is a sub-type of object (technically, a "callable object"). Functions in JS are said to be "first class" in that they are basically just normal objects (with callable behavior semantics bolted on), and so they can be handled like any other plain object.

`function`是对象的一种子类型（技术上讲，叫做“可调用对象”）。函数在JS中被称为“头等”类型，就因为它们基本上仅仅是一般的对象（带有），而且它们可以像其他普通的对象那样被处理。

Arrays are also a form of objects, with extra behavior. The organization of contents in arrays is slightly more structured than for general objects.

数组也是一种特殊形式的对象，带有特别的行为。数组在内容的组织上要稍稍比一般的对象更加结构化。

### Built-in Objects
### 内建对象

There are several other object sub-types, usually referred to as built-in objects. For some of them, their names seem to imply they are directly related to their simple primitives counter-parts, but in fact, their relationship is more complicated, which we'll explore shortly.

有几种其他的对象子类型，通常称为内建对象。对于它们中的一些来说，它们的名称看起来暗示着它们和它们对应的基本类型有着直接的联系，但事实上，它们的关系更复杂，我们一会儿就开始探索。

* `String`
* `Number`
* `Boolean`
* `Object`
* `Function`
* `Array`
* `Date`
* `RegExp`
* `Error`

These built-ins have the appearance of being actual types, even classes, if you rely on the similarity to other languages such as Java's `String` class.

如果你依照和其他语言的相似性来看的话，比如Java语言的`String`类，这些内建类型有着实际类型的外观，甚至是class（类）的外观，

But in JS, these are actually just built-in functions. Each of these built-in functions can be used as a constructor (that is, a function call with the `new` operator -- see Chapter 2), with the result being a newly *constructed* object of the sub-type in question. For instance:

但是在JS中，它们实际上仅仅是内建的函数。这些内建函数的每一个都可以被用作构造器（也就是，一个函数可以和`new`操作符调用——参照第二章），其结果是一个新 *构建* 的相应子类型的对象。比如：

```js
var strPrimitive = "I am a string";
typeof strPrimitive;							// "string"
strPrimitive instanceof String;					// false

var strObject = new String( "I am a string" );
typeof strObject; 								// "object"
strObject instanceof String;					// true

// inspect the object sub-type
Object.prototype.toString.call( strObject );	// [object String]
```

We'll see in detail in a later chapter exactly how the `Object.prototype.toString...` bit works, but briefly, we can inspect the internal sub-type by borrowing the base default `toString()` method, and you can see it reveals that `strObject` is an object that was in fact created by the `String` constructor.

我们会在本章稍后详细地看到`Object.prototype.toString...`到底是如何工作的，但简单地说，我们可以通过借用基本的默认`toString()`方法来考察子类型的内部，而且你可以看到它揭示了`strObject`实际上是由`String`构造器创建的对象。

The primitive value `"I am a string"` is not an object, it's a primitive literal and immutable value. To perform operations on it, such as checking its length, accessing its individual character contents, etc, a `String` object is required.

基本类型值`"I am a string"`不是一个对象，它是一个不可变的基本字面值。为了对它进行操作，比如检查它的长度，访问它的各个独立字符内容等等，都需要一个`String`对象。

Luckily, the language automatically coerces a `"string"` primitive to a `String` object when necessary, which means you almost never need to explicitly create the Object form. It is **strongly preferred** by the majority of the JS community to use the literal form for a value, where possible, rather than the constructed object form.

幸运的是，在必要的时候，语言本身会自动将`"string"`基本类型强制转换为`String`对象类型。这意味着你几乎从不需要明确地创建对象。主流的JS社区都 **强烈推荐** 你尽可能地使用字面形式的值，而非使用构造的对象形式。

Consider:
考虑：

```js
var strPrimitive = "I am a string";

console.log( strPrimitive.length );			// 13

console.log( strPrimitive.charAt( 3 ) );	// "m"
```

In both cases, we call a property or method on a string primitive, and the engine automatically coerces it to a `String` object, so that the property/method access works.

在这两个例子中，我们在字符串的基本类型上调用属性和方法，引擎会自动地将它强制转换为`String`对象，所以这些属性/方法的访问可以工作。

The same sort of coercion happens between the number literal primitive `42` and the `new Number(42)` object wrapper, when using methods like `42.359.toFixed(2)`. Likewise for `Boolean` objects from `"boolean"` primitives.

当使用如`42.359.toFixed(2)`这样的方法时，同样的强制转换也发生在数字基本字面量`42`和包装对象`new Nubmer(42)`之间。同样的还有`Boolean`对象和`"boolean"`基本类型。

`null` and `undefined` have no object wrapper form, only their primitive values. By contrast, `Date` values can *only* be created with their constructed object form, as they have no literal form counter-part.

`null`和`undefined`没有包装对象的形式，仅有它们的基本类型值。相比之下，`Date`的值仅仅可以由它们的构造对象形式创建，因为它们没有对应的字面形式。

`Object`s, `Array`s, `Function`s, and `RegExp`s (regular expressions) are all objects regardless of whether the literal or constructed form is used. The constructed form does offer, in some cases, more options in creation than the literal form counterpart. Since objects are created either way, the simpler literal form is almost universally preferred. **Only use the constructed form if you need the extra options.**

无论使用字面还是构造形式，`Object`，`Array`，`Function`，和`RegExp`（正则表达式）都是对象。在某些情况下，构造形式确实会比对应的字面形式提供更多的创建选项。因为对象可以被任意一种方式创建，更简单的字面形式几乎是所有人的首选。**仅仅在你需要使用额外的选项时使用构建形式**。

`Error` objects are rarely created explicitly in code, but usually created automatically when exceptions are thrown. They can be created with the constructed form `new Error(..)`, but it's often unnecessary.

`Error`对象很少在代码中明示地被创建，它们通常在抛出异常时自动地被创建。它们可以由`new Error(..)`构造形式创建，但通常是不必要的。

## Contents
## 内容

As mentioned earlier, the contents of an object consist of values (any type) stored at specifically named *locations*, which we call properties.

正如刚才提到的，对象的内容由存储在特定命名的 *位置* 上的（任意类型的）值组成，我们称这些值为属性。

It's important to note that while we say "contents" which implies that these values are *actually* stored inside the object, that's merely an appearance. The engine stores values in implementation-dependent ways, and may very well not store them *in* some object container. What *is* stored in the container are these property names, which act as pointers (technically, *references*) to where the values are stored.

有一个重要的事情需要注意：当我们说“内容”时，似乎暗示这这些值 *实际上* 存储在对象内部，但那只不过是表面现象。引擎会根据自己的实现来存储这些值，而且通常都不是把它们存储在容器对象 *内容*。在容器存储的是这些属性的名称，它们像指针（技术上讲，叫 *reference*）一样指向值存储的地方。

Consider:
考虑：

```js
var myObject = {
	a: 2
};

myObject.a;		// 2

myObject["a"];	// 2
```

To access the value at the *location* `a` in `myObject`, we need to use either the `.` operator or the `[ ]` operator. The `.a` syntax is usually referred to as "property" access, whereas the `["a"]` syntax is usually referred to as "key" access. In reality, they both access the same *location*, and will pull out the same value, `2`, so the terms can be used interchangeably. We will use the most common term, "property access" from here on.

为了访问在`myObject`的位置`a`的值，我们需要使用`.`或`[ ]`操作符。`.a`语法通常称为“属性”访问，而`["a"]`语法通常称为“key（键）”访问。在现实中，它们俩都访问相同的 *位置*，而且会拿出相同的值，`2`，所以这些名词可以互换使用。从现在起，我们将使用最常见的名词——“属性访问”。

The main difference between the two syntaxes is that the `.` operator requires an `Identifier` compatible property name after it, whereas the `[".."]` syntax can take basically any UTF-8/unicode compatible string as the name for the property. To reference a property of the name "Super-Fun!", for instance, you would have to use the `["Super-Fun!"]` access syntax, as `Super-Fun!` is not a valid `Identifier` property name.

两种语法的主要区别在于，`.`操作符后面需要一个`Identifier（标识符）`兼容的属性名，而`[".."]`语法基本可以接收任何兼容UTF-8/unicode的字符串作为属性名。举个例子，为了引用一个名为“Super-Fun”的属性，你不得不使用`["Super-Fun"]`语法访问，因为`Super-Fun`不是一个合法的`Identifier`属性名。

Also, since the `[".."]` syntax uses a string's **value** to specify the location, this means the program can programmatically build up the value of the string, such as:

而且，由于`[".."]`语法使用字符串的 **值** 来指定位置，这意味着程序可以动态地组建字符串的值。比如：

```js
var wantA = true;
var myObject = {
	a: 2
};

var idx;

if (wantA) {
	idx = "a";
}

// later

console.log( myObject[idx] ); // 2
```

In objects, property names are **always** strings. If you use any other value besides a `string` (primitive) as the property, it will first be converted to a string. This even includes numbers, which are commonly used as array indexes, so be careful not to confuse the use of numbers between objects and arrays.

在对象中，属性名 **总是** 字符串。如果你使用字符串以外的（基本）类型的值，它会首先被转换为字符串。这甚至包括在数组中常用于索引的数字，所以要小心不要将对象和数组使用的数字搞混了。

```js
var myObject = { };

myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"];				// "foo"
myObject["3"];					// "bar"
myObject["[object Object]"];	// "baz"
```

### Computed Property Names
### 可计算属性名

The `myObject[..]` property access syntax we just described is useful if you need to use a computed expression value *as* the key name, like `myObject[prefix + name]`. But that's not really helpful when declaring objects using the object-literal syntax.

如果你需要将一个计算表达式 *作为* 一个键名称，那么我们刚刚描述的`myObject[..]`属性访问语法是十分有用的，比如`myObject[prefix + name]`。但是当使用字面对象语法声明对象时则没有什么帮助。

ES6 adds *computed property names*, where you can specify an expression, surrounded by a `[ ]` pair, in the key-name position of an object-literal declaration:

ES6加入了 *可计算属性名*，在一个字面对象声明的键名称位置，你可以指定一个表达式，用`[ ]`括起来：

```js
var prefix = "foo";

var myObject = {
	[prefix + "bar"]: "hello",
	[prefix + "baz"]: "world"
};

myObject["foobar"]; // hello
myObject["foobaz"]; // world
```

The most common usage of *computed property names* will probably be for ES6 `Symbol`s, which we will not be covering in detail in this book. In short, they're a new primitive data type which has an opaque unguessable value (technically a `string` value). You will be strongly discouraged from working with the *actual value* of a `Symbol` (which can theoretically be different between different JS engines), so the name of the `Symbol`, like `Symbol.Something` (just a made up name!), will be what you use:

*可计算属性名* 的最常见用法，可能是用于ES6的`Symbol`，我们将不会在本书中涵盖关于它的细节。简短解说，它们是新的基本数据类型，拥有一个不透明不可知的值（技术上讲是一个`string`值）。你将会强烈地不被鼓励使用一个`Symbol`的 *实际值* （这个值理论上会因JS引擎的不同而不同），所以`Symbol`的名称，比如`Symbol.Something`（这是个瞎编的名称！），才是你会使用的：

```js
var myObject = {
	[Symbol.Something]: "hello world"
};
```

### Property vs. Method
### Property（属性） vs. Method（方法）

Some developers like to make a distinction when talking about a property access on an object, if the value being accessed happens to be a function. Because it's tempting to think of the function as *belonging* to the object, and in other languages, functions which belong to objects (aka, "classes") are referred to as "methods", it's not uncommon to hear, "method access" as opposed to "property access".

有些开发者喜欢在讨论对一个对象的属性访问时做一个区别，如果这个被访问的值恰好是一个函数的话。因为这诱使人们认为函数 *属于* 这个对象，而且在其他语言中，属于对象（也就是“类”）的函数被称作“方法”，所以相对于“属性访问”，我们常能听到“方法访问”。

**The specification makes this same distinction**, interestingly.

有趣的是，**语言规范也做出了同样的区别**。

Technically, functions never "belong" to objects, so saying that a function that just happens to be accessed on an object reference is automatically a "method" seems a bit of a stretch of semantics.

从技术上讲，函数绝不会“属于”对象，所以说一个对象的引用上刚好被访问的函数自动是一个“方法”，看起来有些像是语义的延伸。

It *is* true that some functions have `this` references in them, and that *sometimes* these `this` references refer to the object reference at the call-site. But this usage really does not make that function any more a "method" than any other function, as `this` is dynamically bound at run-time, at the call-site, and thus its relationship to the object is indirect, at best.

有些函数确实拥有`this`引用，而且 *有时* 这些`this`引用表示call-site的对象引用。但这个用法真的没有使这个函数比其他函数更像“方法”，因为`this`是在运行时动态绑定的，在call-site，这使得它与这个对象的关系至多是间接的。

Every time you access a property on an object, that is a **property access**, regardless of the type of value you get back. If you *happen* to get a function from that property access, it's not magically a "method" at that point. There's nothing special (outside of possible implicit `this` binding as explained earlier) about a function that comes from a property access.

每次你访问一个对象的属性都是一个 **属性访问**，无论你得到什么类型的值。如果你 *恰好* 从属性访问中得到一个函数，它也没有魔法般地在那时成为一个“方法”。一个从属性访问得来的函数没有任何特殊性（隐式`this`绑定之外的可能性在刚才已经解释过了）。

For instance:

```js
function foo() {
	console.log( "foo" );
}

var someFoo = foo;	// variable reference to `foo`

var myObject = {
	someFoo: foo
};

foo;				// function foo(){..}

someFoo;			// function foo(){..}

myObject.someFoo;	// function foo(){..}
```

`someFoo` and `myObject.someFoo` are just two separate references to the same function, and neither implies anything about the function being special or "owned" by any other object. If `foo()` above was defined to have a `this` reference inside it, that `myObject.someFoo` *implicit binding* would be the **only** observable difference between the two references. Neither reference really makes sense to be called a "method".

`someFoo`和`myObject.someFoo`只不过是同一个函数的两个分离的引用，它们中的任何一个都不意味着这个函数很特别或被其他对象所“拥有”。如果上面的`foo()`定义里面拥有一个`this`引用，那么`myObject.someFoo`的 *implicit binding* 将会是这个两个引用间 **唯一** 可以观察到的不同。它们中的任何一个都没有称为“方法”的道理。

**Perhaps one could argue** that a function *becomes a method*, not at definition time, but during run-time just for that invocation, depending on how it's called at its call-site (with an object reference context or not -- see Chapter 2 for more details). Even this interpretation is a bit of a stretch.

**也许有人会争辩**，函数 *变成了方法*，不是在定义期间，而是在调用的执行期间，根据它是如何在call-site被调用的。甚至这种解读也有些牵强。

The safest conclusion is probably that "function" and "method" are interchangeable in JavaScript.

可能最安全的结论是，在JavaScript中，“函数”和“方法”是可以互换使用的。

**Note:** ES6 adds a `super` reference, which is typically going to be used with `class` (see Appendix A). The way `super` behaves (static binding rather than late binding as `this`) gives further weight to the idea that a function which is `super` bound somewhere is more a "method" than "function". But again, these are just subtle semantic (and mechanical) nuances.

**注意：** ES6加入了`super`引用，它很典型地是和`class`（见附录A）一起使用的。`super`的行为方式，给了这种说法更多的权重——一个`super`绑定到某处的函数比起“函数”更像一个“方法”。但是再一次地，这仅仅是微妙的语义上的（和机制上的）细微区别。

Even when you declare a function expression as part of the object-literal, that function doesn't magically *belong* more to the object -- still just multiple references to the same function object:

就算你声明一个函数表达式作为字面对象的一部分，那个函数都不会魔法般地 *属于* 这个对象——仍然仅仅是同一个函数对象的多个引用罢了。

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

**Note:** In Chapter 6, we will cover an ES6 short-hand for that `foo: function foo(){ .. }` declaration syntax in our object-literal.

**注意：** 在第六张中，我们会为字面对象的`foo: function foo(){ .. }`声明语法介绍一种ES6的简化语法。

### Arrays

Arrays also use the `[ ]` access form, but as mentioned above, they have slightly more structured organization for how and where values are stored (though still no restriction on what *type* of values are stored). Arrays assume *numeric indexing*, which means that values are stored in locations, usually called *indices*, at non-negative integers, such as `0` and `42`.

```js
var myArray = [ "foo", 42, "bar" ];

myArray.length;		// 3

myArray[0];			// "foo"

myArray[2];			// "bar"
```

Arrays *are* objects, so even though each index is a positive integer, you can *also* add properties onto the array:

```js
var myArray = [ "foo", 42, "bar" ];

myArray.baz = "baz";

myArray.length;	// 3

myArray.baz;	// "baz"
```

Notice that adding named properties (regardless of `.` or `[ ]` operator syntax) does not change the reported `length` of the array.

You *could* use an array as a plain key/value object, and never add any numeric indices, but this is a bad idea because arrays have behavior and optimizations specific to their intended use, and likewise with plain objects. Use objects to store key/value pairs, and arrays to store values at numeric indices.

**Be careful:** If you try to add a property to an array, but the property name *looks* like a number, it will end up instead as a numeric index (thus modifying the array contents):

```js
var myArray = [ "foo", 42, "bar" ];

myArray["3"] = "baz";

myArray.length;	// 4

myArray[3];		// "baz"
```

### Duplicating Objects

One of the most commonly requested features when developers newly take up the JavaScript language is how to duplicate an object. It would seem like there should just be a built-in `copy()` method, right? It turns out that it's a little more complicated than that, because it's not fully clear what, by default, should be the algorithm for the duplication.

For example, consider this object:

```js
function anotherFunction() { /*..*/ }

var anotherObject = {
	c: true
};

var anotherArray = [];

var myObject = {
	a: 2,
	b: anotherObject,	// reference, not a copy!
	c: anotherArray,	// another reference!
	d: anotherFunction
};

anotherArray.push( anotherObject, myObject );
```

What exactly should be the representation of a *copy* of `myObject`?

Firstly, we should answer if it should be a *shallow* or *deep* copy? A *shallow copy* would end up with `a` on the new object as a copy of the value `2`, but `b`, `c`, and `d` properties as just references to the same places as the references in the original object. A *deep copy* would duplicate not only `myObject`, but `anotherObject` and `anotherArray`. But then we have issues that `anotherArray` has references to `anotherObject` and `myObject` in it, so *those* should also be duplicated rather than reference-preserved. Now we have an infinite circular duplication problem because of the circular reference.

Should we detect a circular reference and just break the circular traversal (leaving the deep element not fully duplicated)? Should we error out completely? Something in between?

Moreover, it's not really clear what "duplicating" a function would mean? There are some hacks like pulling out the `toString()` serialization of a function's source code (which varies across implementations and is not even reliable in all engines depending on the type of function being inspected).

So how do we resolve all these tricky questions? Various JS frameworks have each picked their own interpretations and made their own decisions. But which of these (if any) should JS adopt as *the* standard? For a long time, there was no clear answer.

One subset solution is that objects which are JSON-safe (that is, can be serialized to a JSON string and then re-parsed to an object with the same structure and values) can easily be *duplicated* with:

```js
var newObj = JSON.parse( JSON.stringify( someObj ) );
```

Of course, that requires you to ensure your object is JSON safe. For some situations, that's trivial. For others, it's insufficient.

At the same time, a shallow copy is fairly understandable and has far less issues, so ES6 has now defined `Object.assign(..)` for this task. `Object.assign(..)` takes a *target* object as its first parameter, and one or more *source* objects as its subsequent parameters. It iterates over all the *enumerable* (see below), *owned keys* (**immediately present**) on the *source* object(s) and copies them (via `=` assignment only) to *target*. It also, helpfully, returns *target*, as you can see below:

```js
var newObj = Object.assign( {}, myObject );

newObj.a;						// 2
newObj.b === anotherObject;		// true
newObj.c === anotherArray;		// true
newObj.d === anotherFunction;	// true
```

**Note:** In the next section, we describe "property descriptors" (property characteristics) and show the use of `Object.defineProperty(..)`. The duplication that occurs for `Object.assign(..)` however is purely `=` style assignment, so any special characteristics of a property (like `writable`) on a source object **are not preserved** on the target object.

### Property Descriptors

Prior to ES5, the JavaScript language gave no direct way for your code to inspect or draw any distinction between the characteristics of properties, such as whether the property was read-only or not.

But as of ES5, all properties are described in terms of a **property descriptor**.

Consider this code:

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

As you can see, the property descriptor (called a "data descriptor" since it's only for holding a data value) for our normal object property `a` is much more than just its `value` of `2`. It includes 3 other characteristics: `writable`, `enumerable`, and `configurable`.

While we can see what the default values for the property descriptor characteristics are when we create a normal property, we can use `Object.defineProperty(..)` to add a new property, or modify an existing one (if it's `configurable`!), with the desired characteristics.

For example:

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

Using `defineProperty(..)`, we added the plain, normal `a` property to `myObject` in a manually explicit way. However, you generally wouldn't use this manual approach unless you wanted to modify one of the descriptor characteristics from its normal behavior.

#### Writable

The ability for you to change the value of a property is controlled by `writable`.

Consider:

```js
var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: false, // not writable!
	configurable: true,
	enumerable: true
} );

myObject.a = 3;

myObject.a; // 2
```

As you can see, our modification of the `value` silently failed. If we try in `strict mode`, we get an error:

```js
"use strict";

var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: false, // not writable!
	configurable: true,
	enumerable: true
} );

myObject.a = 3; // TypeError
```

The `TypeError` tells us we cannot change a non-writable property.

**Note:** We will discuss getters/setters shortly, but briefly, you can observe that `writable:false` means a value cannot be changed, which is somewhat equivalent to if you defined a no-op setter. Actually, your no-op setter would need to throw a `TypeError` when called, to be truly conformant to `writable:false`.

#### Configurable

As long as a property is currently configurable, we can modify its descriptor definition, using the same `defineProperty(..)` utility.

```js
var myObject = {
	a: 2
};

myObject.a = 3;
myObject.a;					// 3

Object.defineProperty( myObject, "a", {
	value: 4,
	writable: true,
	configurable: false,	// not configurable!
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

The final `defineProperty(..)` call results in a TypeError, regardless of `strict mode`, if you attempt to change the descriptor definition of a non-configurable property. Be careful: as you can see, changing `configurable` to `false` is a **one-way action, and cannot be undone!**

**Note:** There's a nuanced exception to be aware of: even if the property is already `configurable:false`, `writable` can always be changed from `true` to `false` without error, but not back to `true` if already `false`.

Another thing `configurable:false` prevents is the ability to use the `delete` operator to remove an existing property.

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

As you can see, the last `delete` call failed (silently) because we made the `a` property non-configurable.

`delete` is only used to remove object properties (which can be removed) directly from the object in question. If an object property is the last remaining *reference* to some object/function, and you `delete` it, that removes the reference and now that unreferenced object/function can be garbage collected. But, it is **not** proper to think of `delete` as a tool to free up allocated memory as it does in other languages (like C/C++). `delete` is just an object property removal operation -- nothing more.

#### Enumerable

The final descriptor characteristic we will mention here (there are two others, which we deal with shortly when we discuss getter/setters) is `enumerable`.

The name probably makes it obvious, but this characteristic controls if a property will show up in certain object-property enumerations, such as the `for..in` loop. Set to `false` to keep it from showing up in such enumerations, even though it's still completely accessible. Set to `true` to keep it present.

All normal user-defined properties are defaulted to `enumerable`, as this is most commonly what you want. But if you have a special property you want to hide from enumeration, set it to `enumerable:false`.

We'll demonstrate enumerability in much more detail shortly, so keep a mental bookmark on this topic.

### Immutability

It is sometimes desired to make properties or objects that cannot be changed (either by accident or intentionally). ES5 adds support for handling that in a variety of different nuanced ways.

It's important to note that **all** of these approaches create shallow immutability. That is, they affect only the object and its direct property characteristics. If an object has a reference to another object (array, object, function, etc), the *contents* of that object are not affected, and remain mutable.

```js
myImmutableObject.foo; // [1,2,3]
myImmutableObject.foo.push( 4 );
myImmutableObject.foo; // [1,2,3,4]
```

We assume in this snippet that `myImmutableObject` is already created and protected as immutable. But, to also protect the contents of `myImmutableObject.foo` (which is its own object -- array), you would also need to make `foo` immutable, using one or more of the following functionalities.

**Note:** It is not terribly common to create deeply entrenched immutable objects in JS programs. Special cases can certainly call for it, but as a general design pattern, if you find yourself wanting to *seal* or *freeze* all your objects, you may want to take a step back and reconsider your program design to be more robust to potential changes in objects' values.

#### Object Constant

By combining `writable:false` and `configurable:false`, you can essentially create a *constant* (cannot be changed, redefined or deleted) as an object property, like:

```js
var myObject = {};

Object.defineProperty( myObject, "FAVORITE_NUMBER", {
	value: 42,
	writable: false,
	configurable: false
} );
```

#### Prevent Extensions

If you want to prevent an object from having new properties added to it, but otherwise leave the rest of the object's properties alone, call `Object.preventExtensions(..)`:

```js
var myObject = {
	a: 2
};

Object.preventExtensions( myObject );

myObject.b = 3;
myObject.b; // undefined
```

In `non-strict mode`, the creation of `b` fails silently. In `strict mode`, it throws a `TypeError`.

#### Seal

`Object.seal(..)` creates a "sealed" object, which means it takes an existing object and essentially calls `Object.preventExtensions(..)` on it, but also marks all its existing properties as `configurable:false`.

So, not only can you not add any more properties, but you also cannot reconfigure or delete any existing properties (though you *can* still modify their values).

#### Freeze

`Object.freeze(..)` creates a frozen object, which means it takes an existing object and essentially calls `Object.seal(..)` on it, but it also marks all "data accessor" properties as `writable:false`, so that their values cannot be changed.

This approach is the highest level of immutability that you can attain for an object itself, as it prevents any changes to the object or to any of its direct properties (though, as mentioned above, the contents of any referenced other objects are unaffected).

You could "deep freeze" an object by calling `Object.freeze(..)` on the object, and then recursively iterating over all objects it references (which would have been unaffected thus far), and calling `Object.freeze(..)` on them as well. Be careful, though, as that could affect other (shared) objects you're not intending to affect.


### `[[Get]]`

There's a subtle, but important, detail about how property accesses are performed.

Consider:

```js
var myObject = {
	a: 2
};

myObject.a; // 2
```

The `myObject.a` is a property access, but it doesn't *just* look in `myObject` for a property of the name `a`, as it might seem.

According to the spec, the code above actually performs a `[[Get]]` operation (kinda like a function call: `[[Get]]()`) on the `myObject`. The default built-in `[[Get]]` operation for an object *first* inspects the object for a property of the requested name, and if it finds it, it will return the value accordingly.

However, the `[[Get]]` algorithm defines other important behavior if it does *not* find a property of the requested name. We will examine in Chapter 5 what happens *next* (traversal of the `[[Prototype]]` chain, if any).

But one important result of this `[[Get]]` operation is that if it cannot through any means come up with a value for the requested property, it instead returns the value `undefined`.

```js
var myObject = {
	a: 2
};

myObject.b; // undefined
```

This behavior is different from when you reference *variables* by their identifier names. If you reference a variable that cannot be resolved within the applicable lexical scope look-up, the result is not `undefined` as it is for object properties, but instead a `ReferenceError` is thrown.

```js
var myObject = {
	a: undefined
};

myObject.a; // undefined

myObject.b; // undefined
```

From a *value* perspective, there is no difference between these two references -- they both result in `undefined`. However, the `[[Get]]` operation underneath, though subtle at a glance, potentially performed a bit more "work" for the reference `myObject.b` than for the reference `myObject.a`.

Inspecting only the value results, you cannot distinguish whether a property exists and holds the explicit value `undefined`, or whether the property does *not* exist and `undefined` was the default return value after `[[Get]]` failed to return something explicitly. However, we will see shortly how you *can* distinguish these two scenarios.

### `[[Put]]`

Since there's an internally defined `[[Get]]` operation for getting a value from a property, it should be obvious there's also a default `[[Put]]` operation.

It may be tempting to think that an assignment to a property on an object would just invoke `[[Put]]` to set or create that property on the object in question. But the situation is more nuanced than that.

When invoking `[[Put]]`, how it behaves differs based on a number of factors, including (most impactfully) whether the property is already present on the object or not.

If the property is present, the `[[Put]]` algorithm will roughly check:

1. Is the property an accessor descriptor (see "Getters & Setters" section below)? **If so, call the setter, if any.**
2. Is the property a data descriptor with `writable` of `false`? **If so, silently fail in `non-strict mode`, or throw `TypeError` in `strict mode`.**
3. Otherwise, set the value to the existing property as normal.

If the property is not yet present on the object in question, the `[[Put]]` operation is even more nuanced and complex. We will revisit this scenario in Chapter 5 when we discuss `[[Prototype]]` to give it more clarity.

### Getters & Setters

The default `[[Put]]` and `[[Get]]` operations for objects completely control how values are set to existing or new properties, or retrieved from existing properties, respectively.

**Note:** Using future/advanced capabilities of the language, it may be possible to override the default `[[Get]]` or `[[Put]]` operations for an entire object (not just per property). This is beyond the scope of our discussion in this book, but will be covered later in the "You Don't Know JS" series.

ES5 introduced a way to override part of these default operations, not on an object level but a per-property level, through the use of getters and setters. Getters are properties which actually call a hidden function to retrieve a value. Setters are properties which actually call a hidden function to set a value.

When you define a property to have either a getter or a setter or both, its definition becomes an "accessor descriptor" (as opposed to a "data descriptor"). For accessor-descriptors, the `value` and `writable` characteristics of the descriptor are moot and ignored, and instead JS considers the `set` and `get` characteristics of the property (as well as `configurable` and `enumerable`).

Consider:

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return 2;
	}
};

Object.defineProperty(
	myObject,	// target
	"b",		// property name
	{			// descriptor
		// define a getter for `b`
		get: function(){ return this.a * 2 },

		// make sure `b` shows up as an object property
		enumerable: true
	}
);

myObject.a; // 2

myObject.b; // 4
```

Either through object-literal syntax with `get a() { .. }` or through explicit definition with `defineProperty(..)`, in both cases we created a property on the object that actually doesn't hold a value, but whose access automatically results in a hidden function call to the getter function, with whatever value it returns being the result of the property access.

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return 2;
	}
};

myObject.a = 3;

myObject.a; // 2
```

Since we only defined a getter for `a`, if we try to set the value of `a` later, the set operation won't throw an error but will just silently throw the assignment away. Even if there was a valid setter, our custom getter is hard-coded to return only `2`, so the set operation would be moot.

To make this scenario more sensible, properties should also be defined with setters, which override the default `[[Put]]` operation (aka, assignment), per-property, just as you'd expect. You will almost certainly want to always declare both getter and setter (having only one or the other often leads to unexpected/surprising behavior):

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return this._a_;
	},

	// define a setter for `a`
	set a(val) {
		this._a_ = val * 2;
	}
};

myObject.a = 2;

myObject.a; // 4
```

**Note:** In this example, we actually store the specified value `2` of the assignment (`[[Put]]` operation) into another variable `_a_`. The `_a_` name is purely by convention for this example and implies nothing special about its behavior -- it's a normal property like any other.

### Existence

We showed earlier that a property access like `myObject.a` may result in an `undefined` value if either the explicit `undefined` is stored there or the `a` property doesn't exist at all. So, if the value is the same in both cases, how else do we distinguish them?

We can ask an object if it has a certain property *without* asking to get that property's value:

```js
var myObject = {
	a: 2
};

("a" in myObject);				// true
("b" in myObject);				// false

myObject.hasOwnProperty( "a" );	// true
myObject.hasOwnProperty( "b" );	// false
```

The `in` operator will check to see if the property is *in* the object, or if it exists at any higher level of the `[[Prototype]]` chain object traversal (see Chapter 5). By contrast, `hasOwnProperty(..)` checks to see if *only* `myObject` has the property or not, and will *not* consult the `[[Prototype]]` chain. We'll come back to the important differences between these two operations in Chapter 5 when we explore `[[Prototype]]`s in detail.

`hasOwnProperty(..)` is accessible for all normal objects via delegation to `Object.prototype` (see Chapter 5). But it's possible to create an object that does not link to `Object.prototype` (via `Object.create(null)` -- see Chapter 5). In this case, a method call like `myObject.hasOwnProperty(..)` would fail.

In that scenario, a more robust way of performing such a check is `Object.prototype.hasOwnProperty.call(myObject,"a")`, which borrows the base `hasOwnProperty(..)` method and uses *explicit `this` binding* (see Chapter 2) to apply it against our `myObject`.

**Note:** The `in` operator has the appearance that it will check for the existence of a *value* inside a container, but it actually checks for the existence of a property name. This difference is important to note with respect to arrays, as the temptation to try a check like `4 in [2, 4, 6]` is strong, but this will not behave as expected.

#### Enumeration

Previously, we explained briefly the idea of "enumerability" when we looked at the `enumerable` property descriptor characteristic. Let's revisit that and examine it in more close detail.

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// make `a` enumerable, as normal
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// make `b` NON-enumerable
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

You'll notice that `myObject.b` in fact **exists** and has an accessible value, but it doesn't show up in a `for..in` loop (though, surprisingly, it **is** revealed by the `in` operator existence check). That's because "enumerable" basically means "will be included if the object's properties are iterated through".

**Note:** `for..in` loops applied to arrays can give somewhat unexpected results, in that the enumeration of an array will include not only all the numeric indices, but also any enumerable properties. It's a good idea to use `for..in` loops *only* on objects, and traditional `for` loops with numeric index iteration for the values stored in arrays.

Another way that enumerable and non-enumerable properties can be distinguished:

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// make `a` enumerable, as normal
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// make `b` non-enumerable
	{ enumerable: false, value: 3 }
);

myObject.propertyIsEnumerable( "a" ); // true
myObject.propertyIsEnumerable( "b" ); // false

Object.keys( myObject ); // ["a"]
Object.getOwnPropertyNames( myObject ); // ["a", "b"]
```

`propertyIsEnumerable(..)` tests whether the given property name exists *directly* on the object and is also `enumerable:true`.

`Object.keys(..)` returns an array of all enumerable properties, whereas `Object.getOwnPropertyNames(..)` returns an array of *all* properties, enumerable or not.

Whereas `in` vs. `hasOwnProperty(..)` differ in whether they consult the `[[Prototype]]` chain or not, `Object.keys(..)` and `Object.getOwnPropertyNames(..)` both inspect *only* the direct object specified.

There's (currently) no built-in way to get a list of **all properties** which is equivalent to what the `in` operator test would consult (traversing all properties on the entire `[[Prototype]]` chain, as explained in Chapter 5). You could approximate such a utility by recursively traversing the `[[Prototype]]` chain of an object, and for each level, capturing the list from `Object.keys(..)` -- only enumerable properties.

## Iteration

The `for..in` loop iterates over the list of enumerable properties on an object (including its `[[Prototype]]` chain). But what if you instead want to iterate over the values?

With numerically-indexed arrays, iterating over the values is typically done with a standard `for` loop, like:

```js
var myArray = [1, 2, 3];

for (var i = 0; i < myArray.length; i++) {
	console.log( myArray[i] );
}
// 1 2 3
```

This isn't iterating over the values, though, but iterating over the indices, where you then use the index to reference the value, as `myArray[i]`.

ES5 also added several iteration helpers for arrays, including `forEach(..)`, `every(..)`, and `some(..)`. Each of these helpers accepts a function callback to apply to each element in the array, differing only in they respectively respond to a return value from the callback.

`forEach(..)` will iterate over all values in the array, and ignores any callback return values. `every(..)` keeps going until the end *or* the callback returns a `false` (or "falsy") value, whereas `some(..)` keeps going until the end *or* the callback returns a `true` (or "truthy") value.

These special return values inside `every(..)` and `some(..)` act somewhat like a `break` statement inside a normal `for` loop, in that they stop the iteration early before it reaches the end.

If you iterate on an object with a `for..in` loop, you're also only getting at the values indirectly, because it's actually iterating only over the enumerable properties of the object, leaving you to access the properties manually to get the values.

**Note:** As contrasted with iterating over an array's indices in a numerically ordered way (`for` loop or other iterators), the order of iteration over an object's properties is **not guaranteed** and may vary between different JS engines. **Do not rely** on any observed ordering for anything that requires consistency among environments, as any observed agreement is unreliable.

But what if you want to iterate over the values directly instead of the array indices (or object properties)? Helpfully, ES6 adds a `for..of` loop syntax for iterating over arrays (and objects, if the object defines its own custom iterator):

```js
var myArray = [ 1, 2, 3 ];

for (var v of myArray) {
	console.log( v );
}
// 1
// 2
// 3
```

The `for..of` loop asks for an iterator object (from a default internal function known as `@@iterator` in spec-speak) of the *thing* to be iterated, and the loop then iterates over the successive return values from calling that iterator object's `next()` method, once for each loop iteration.

Arrays have a built-in `@@iterator`, so `for..of` works easily on them, as shown. But let's manually iterate the array, using the built-in `@@iterator`, to see how it works:

```js
var myArray = [ 1, 2, 3 ];
var it = myArray[Symbol.iterator]();

it.next(); // { value:1, done:false }
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { done:true }
```

**Note:** We get at the `@@iterator` *internal property* of an object using an ES6 `Symbol`: `Symbol.iterator`. We briefly mentioned `Symbol` semantics earlier in the chapter (see "Computed Property Names"), so the same reasoning applies here. You'll always want to reference such special properties by `Symbol` name reference instead of by the special value it may hold. Also, despite the name's implications, `@@iterator` is **not the iterator object** itself, but a **function that returns** the iterator object -- a subtle but important detail!

As the above snippet reveals, the return value from an iterator's `next()` call is an object of the form `{ value: .. , done: .. }`, where `value` is the current iteration value, and `done` is a `boolean` that indicates if there's more to iterate.

Notice the value `3` was returned with a `done:false`, which seems strange at first glance. You have to call the `next()` a fourth time (which the `for..of` loop in the previous snippet automatically does) to get `done:true` and know you're truly done iterating. The reason for this quirk is beyond the scope of what we'll discuss here, but it comes from the semantics of ES6 generator functions.

While arrays do automatically iterate in `for..of` loops, regular objects **do not have a built-in `@@iterator`**. The reasons for this intentional omission are more complex than we will examine here, but in general it was better to not include some implementation that could prove troublesome for future types of objects.

It *is* possible to define your own default `@@iterator` for any object that you care to iterate over. For example:

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

// iterate `myObject` manually
var it = myObject[Symbol.iterator]();
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { value:undefined, done:true }

// iterate `myObject` with `for..of`
for (var v of myObject) {
	console.log( v );
}
// 2
// 3
```

**Note:** We used `Object.defineProperty(..)` to define our custom `@@iterator` (mostly so we could make it non-enumerable), but using the `Symbol` as a *computed property name* (covered earlier in this chapter), we could have declared it directly, like `var myObject = { a:2, b:3, [Symbol.iterator]: function(){ /* .. */ } }`.

Each time the `for..of` loop calls `next()` on `myObject`'s iterator object, the internal pointer will advance and return back the next value from the object's properties list (see a previous note about iteration ordering on object properties/values).

The iteration we just demonstrated is a simple value-by-value iteration, but you can of course define arbitrarily complex iterations for your custom data structures, as you see fit. Custom iterators combined with ES6's `for..of` loop are a powerful new syntactic tool for manipulating user-defined objects.

For example, a list of `Pixel` objects (with `x` and `y` coordinate values) could decide to order its iteration based on the linear distance from the `(0,0)` origin, or filter out points that are "too far away", etc. As long as your iterator returns the expected `{ value: .. }` return values from `next()` calls, and a `{ done: true }` after the iteration is complete, ES6's `for..of` can iterate over it.

In fact, you can even generate "infinite" iterators which never "finish" and always return a new value (such as a random number, an incremented value, a unique identifier, etc), though you probably will not use such iterators with an unbounded `for..of` loop, as it would never end and would hang your program.

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

	// don't proceed unbounded!
	if (randoms_pool.length === 100) break;
}
```

This iterator will generate random numbers "forever", so we're careful to only pull out 100 values so our program doesn't hang.

## Review (TL;DR)

Objects in JS have both a literal form (such as `var a = { .. }`) and a constructed form (such as `var a = new Array(..)`). The literal form is almost always preferred, but the constructed form offers, in some cases, more creation options.

Many people mistakingly claim "everything in JavaScript is an object", but this is incorrect. Objects are one of the 6 (or 7, depending on your perspective) primitive types. Objects have sub-types, including `function`, and also can be behavior-specialized, like `[object Array]` as the internal label representing the array object sub-type.

Objects are collections of key/value pairs. The values can be accessed as properties, via `.propName` or `["propName"]` syntax. Whenever a property is accessed, the engine actually invokes the internal default `[[Get]]` operation (and `[[Put]]` for setting values), which not only looks for the property directly on the object, but which will traverse the `[[Prototype]]` chain (see Chapter 5) if not found.

Properties have certain characteristics that can be controlled through property descriptors, such as `writable` and `configurable`. In addition, objects can have their mutability (and that of their properties) controlled to various levels of immutability using `Object.preventExtensions(..)`, `Object.seal(..)`, and `Object.freeze(..)`.

Properties don't have to contain values -- they can be "accessor properties" as well, with getters/setters. They can also be either *enumerable* or not, which controls if they show up in `for..in` loop iterations, for instance.

You can also iterate over **the values** in data structures (arrays, objects, etc) using the ES6 `for..of` syntax, which looks for either a built-in or custom `@@iterator` object consisting of a `next()` method to advance through the data values one at a time.
