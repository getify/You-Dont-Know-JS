# You Don't Know JS: ES6 & Beyond
# Chapter 6: API Additions

从值的转换到数学计算，ES6给各种内建原生类型和对象增加了许多静态属性和方法来辅助这些常见任务。另外，一些原生类型的实例通过各种新的原型方法获得了新的能力。

**注意：** 大多数这些特性都可以被忠实地填补。我们不会在这里深入这样的细节，但是关于兼容标准的shim/填补，你可以看一下“ES6 Shim”(https://github.com/paulmillr/es6-shim/)。

## `Array`

在JS中被各种用户库扩展得最多的特性之一就是数组类型。ES6在数组上增加许多静态的和原型（实例）的帮助功能并不令人惊讶。

### `Array.of(..)` Static Function

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
x.length;						// 3 -- oops!
x.sum();						// 0 -- oops!

var y = [3];					// Array, not MyCoolArray
y.length;						// 1
y.sum();						// `sum` is not a function

var z = MyCoolArray.of( 3 );
z.length;						// 1
z.sum();						// 3
```

你不能（简单地）只创建一个`MyCoolArray`的构造器，让它覆盖`Array`父构造器的行为，因为这个父构造器对于实际创建一个规范的数组值（初始化`this`）是必要的。在`MyCoolArray`子类上“被继承”的静态`of(..)`方法提供了一个不错的解决方案。

### `Array.from(..)` Static Function

在JavaScript中一个“类数组对象”是一个拥有`length`属性的对象，这个属性明确地带有0或跟高的整数值。

在JS中处理这些值出了名地让人沮丧；将它们变形为真正的数组曾经是十分常见的做法，有各种`Array.property`方法（`map(..)`，`indexOf(..)`等等）可以用于这个目的。这种处理通常看起来像：

```js
// array-like object
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

#### Avoiding Empty Slots

前面的代码段中，在`emptySlotsArr`和`Array.from(..)`调用的结果有一个微妙但重要的不同。`Array.from(..)`从不产生空值槽。

在ES6之前，如果你想要制造一个被初始化为在每个值槽中使用实际`undefined`值（不是空值槽！）的特定长数组，你不得不做一些额外的工作：

```js
var a = Array( 4 );								// four empty slots!

var b = Array.apply( null, { length: 4 } );		// four `undefined` values
```

但现在`Array.from(..)`是这件事简单了些：

```js
var c = Array.from( { length: 4 } );			// four `undefined` values
```

**警告：** 使用一个像前面代码段中的`a`那样的空值槽数组可以与一些数组函数工作，但是其他的函数会忽略空值槽（比如`map(..)`等）。你永远不应该刻意地使用空值槽，因为它几乎可能会在你的程序中导致奇怪/不可预料的行为。

#### Mapping

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

### Creating Arrays and Subtypes

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

一般来说，这种默认行为将可能是你想要的，但是正如我们在第三站中讨论过的，如果你想的话你 *可以* 覆盖它：

```js
class MyCoolArray extends Array {
	// force `species` to be parent constructor
	static get [Symbol.species]() { return Array; }
}

var x = new MyCoolArray( 1, 2, 3 );

x.slice( 1 ) instanceof MyCoolArray;				// false
x.slice( 1 ) instanceof Array;						// true
```

要注意的是，`@@species`设定仅用于原型方法，比如`slice(..)`。`of(..)`和`from(..)`不使用它；它们俩都只使用`this`绑定（哪个构造器被用于发起引用）。考虑如下代码：

```js
class MyCoolArray extends Array {
	// force `species` to be parent constructor
	static get [Symbol.species]() { return Array; }
}

var x = new MyCoolArray( 1, 2, 3 );

MyCoolArray.from( x ) instanceof MyCoolArray;		// true
MyCoolArray.of( [2, 3] ) instanceof MyCoolArray;	// true
```

### `copyWithin(..)` Prototype Method

`Array#copyWithin(..)`是一个对所有数组可用的新修改器方法（包括类型化数组；参加第五章）。`copyWithin(..)`将数组的一部分拷贝到同一个数组的其他位置，覆盖之前存在在哪里的任何东西。

它的参数值是 *目标*（要被拷贝到的索引位置），*开始*（拷贝开始的索引位置（含）），和可选的*结束*（拷贝结束的索引位置（不含））。如果这些参数值中存在任何负数，那么它们就被认为是相对于数组的末尾。

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

于此不同的是，拷贝算法把方向反转过来，拷贝`4`来覆盖`5`，然后拷贝`3`来覆盖`4`，然后拷贝`2`来覆盖`3`，而最后的记过是`[1,2,2,3,4]`。就期待的结果而言这可能更“正确”，但是如果你仅以单纯的从左到右的方式考虑拷贝算法的话，它就可能让人糊涂。

### `fill(..)` Prototype Method

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

### `find(..)` Prototype Method

一般来说，在一个数组中搜索一个值的最常见方法曾经是`indexOf(..)`方法，如果值被找到的话它返回值的位置索引，没有找到的话返回`-1`：

```js
var a = [1,2,3,4,5];

(a.indexOf( 3 ) != -1);				// true
(a.indexOf( 7 ) != -1);				// false

(a.indexOf( "2" ) != -1);			// false
```

The `indexOf(..)` comparison requires a strict `===` match, so a search for `"2"` fails to find a value of `2`, and vice versa. There's no way to override the matching algorithm for `indexOf(..)`. It's also unfortunate/ungraceful to have to make the manual comparison to the `-1` value.

`indexOf(..)`比较要求一个严格`===`匹配，所以搜索`"2"`找不到值`2`，反之亦然。没有办法覆盖`indexOf(..)`的匹配算法。不得不手动与值`-1`进行比较也很不幸/不优雅。

**Tip:** See the *Types & Grammar* title of this series for an interesting (and controversially confusing) technique to work around the `-1` ugliness with the `~` operator.

**提示：** 一个使用`~`操作符来绕过难看的`-1`的有趣（而且争议性地令人糊涂）技术，参见本系列的 *类型与文法*。

Since ES5, the most common workaround to have control over the matching logic has been the `some(..)` method. It works by calling a function callback for each element, until one of those calls returns a `true`/truthy value, and then it stops. Because you get to define the callback function, you have full control over how a match is made:

从ES5开始，一个可以

```js
var a = [1,2,3,4,5];

a.some( function matcher(v){
	return v == "2";
} );								// true

a.some( function matcher(v){
	return v == 7;
} );								// false
```

But the downside to this approach is that you only get the `true`/`false` indicating if a suitably matched value was found, but not what the actual matched value was.

ES6's `find(..)` addresses this. It works basically the same as `some(..)`, except that once the callback returns a `true`/truthy value, the actual array value is returned:

```js
var a = [1,2,3,4,5];

a.find( function matcher(v){
	return v == "2";
} );								// 2

a.find( function matcher(v){
	return v == 7;					// undefined
});
```

Using a custom `matcher(..)` function also lets you match against complex values like objects:

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

**Note:** As with other array methods that take callbacks, `find(..)` takes an optional second argument that if set will specify the `this` binding for the callback passed as the first argument. Otherwise, `this` will be `undefined`.

### `findIndex(..)` Prototype Method

While the previous section illustrates how `some(..)` yields a boolean result for a search of an array, and `find(..)` yields the matched value itself from the array search, there's also a need for finding the positional index of the matched value.

`indexOf(..)` does that, but there's no control over its matching logic; it always uses `===` strict equality. So ES6's `findIndex(..)` is the answer:

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

Don't use `findIndex(..) != -1` (the way it's always been done with `indexOf(..)`) to get a boolean from the search, because `some(..)` already yields the `true`/`false` you want. And don't do `a[ a.findIndex(..) ]` to get the matched value, because that's what `find(..)` accomplishes. And finally, use `indexOf(..)` if you need the index of a strict match, or `findIndex(..)` if you need the index of a more customized match.

**Note:** As with other array methods that take callbacks, `find(..)` takes an optional second argument that if set will specify the `this` binding for the callback passed as the first argument. Otherwise, `this` will be `undefined`.

### `entries()`, `values()`, `keys()` Prototype Methods

In Chapter 3, we illustrated how data structures can provide a patterned item-by-item enumeration of their values, via an iterator. We then expounded on this approach in Chapter 5, as we explored how the new ES6 collections (Map, Set, etc.) provide several methods for producing different kinds of iterations.

Because it's not new to ES6, `Array` might not be thought of traditionally as a "collection," but it is one in the sense that it provides these same iterator methods: `entries()`, `values()`, and `keys()`. Consider:

```js
var a = [1,2,3];

[...a.values()];					// [1,2,3]
[...a.keys()];						// [0,1,2]
[...a.entries()];					// [ [0,1], [1,2], [2,3] ]

[...a[Symbol.iterator]()];			// [1,2,3]
```

Just like with `Set`, the default `Array` iterator is the same as what `values()` returns.

In "Avoiding Empty Slots" earlier in this chapter, we illustrated how `Array.from(..)` treats empty slots in an array as just being present slots with `undefined` in them. That's actually because under the covers, the array iterators behave that way:

```js
var a = [];
a.length = 3;
a[1] = 2;

[...a.values()];		// [undefined,2,undefined]
[...a.keys()];			// [0,1,2]
[...a.entries()];		// [ [0,undefined], [1,2], [2,undefined] ]
```

## `Object`

A few additional static helpers have been added to `Object`. Traditionally, functions of this sort have been seen as focused on the behaviors/capabilities of object values.

However, starting with ES6, `Object` static functions will also be for general-purpose global APIs of any sort that don't already belong more naturally in some other location (i.e., `Array.from(..)`).

### `Object.is(..)` Static Function

The `Object.is(..)` static function makes value comparisons in an even more strict fashion than the `===` comparison.

`Object.is(..)` invokes the underlying `SameValue` algorithm (ES6 spec, section 7.2.9). The `SameValue` algorithm is basically the same as the `===` Strict Equality Comparison Algorithm (ES6 spec, section 7.2.13), with two important exceptions.

Consider:

```js
var x = NaN, y = 0, z = -0;

x === x;							// false
y === z;							// true

Object.is( x, x );					// true
Object.is( y, z );					// false
```

You should continue to use `===` for strict equality comparisons; `Object.is(..)` shouldn't be thought of as a replacement for the operator. However, in cases where you're trying to strictly identify a `NaN` or `-0` value, `Object.is(..)` is now the preferred option.

**Note:** ES6 also adds a `Number.isNaN(..)` utility (discussed later in this chapter) which may be a slightly more convenient test; you may prefer `Number.isNaN(x)` over `Object.is(x,NaN)`. You *can* accurately test for `-0` with a clumsy `x == 0 && 1 / x === -Infinity`, but in this case `Object.is(x,-0)` is much better.

### `Object.getOwnPropertySymbols(..)` Static Function

The "Symbols" section in Chapter 2 discusses the new Symbol primitive value type in ES6.

Symbols are likely going to be mostly used as special (meta) properties on objects. So the `Object.getOwnPropertySymbols(..)` utility was introduced, which retrieves only the symbol properties directly on an object:

```js
var o = {
	foo: 42,
	[ Symbol( "bar" ) ]: "hello world",
	baz: true
};

Object.getOwnPropertySymbols( o );	// [ Symbol(bar) ]
```

### `Object.setPrototypeOf(..)` Static Function

Also in Chapter 2, we mentioned the `Object.setPrototypeOf(..)` utility, which (unsurprisingly) sets the `[[Prototype]]` of an object for the purposes of *behavior delegation* (see the *this & Object Prototypes* title of this series). Consider:

```js
var o1 = {
	foo() { console.log( "foo" ); }
};
var o2 = {
	// .. o2's definition ..
};

Object.setPrototypeOf( o2, o1 );

// delegates to `o1.foo()`
o2.foo();							// foo
```

Alternatively:

```js
var o1 = {
	foo() { console.log( "foo" ); }
};

var o2 = Object.setPrototypeOf( {
	// .. o2's definition ..
}, o1 );

// delegates to `o1.foo()`
o2.foo();							// foo
```

In both previous snippets, the relationship between `o2` and `o1` appears at the end of the `o2` definition. More commonly, the relationship between an `o2` and `o1` is specified at the top of the `o2` definition, as it is with classes, and also with `__proto__` in object literals (see "Setting `[[Prototype]]`" in Chapter 2).

**Warning:** Setting a `[[Prototype]]` right after object creation is reasonable, as shown. But changing it much later is generally not a good idea and will usually lead to more confusion than clarity.

### `Object.assign(..)` Static Function

Many JavaScript libraries/frameworks provide utilities for copying/mixing one object's properties into another (e.g., jQuery's `extend(..)`). There are various nuanced differences between these different utilities, such as whether a property with value `undefined` is ignored or not.

ES6 adds `Object.assign(..)`, which is a simplified version of these algorithms. The first argument is the *target*, and any other arguments passed are the *sources*, which will be processed in listed order. For each source, its enumerable and own (e.g., not "inherited") keys, including symbols, are copied as if by plain `=` assignment. `Object.assign(..)` returns the target object.

Consider this object setup:

```js
var target = {},
	o1 = { a: 1 }, o2 = { b: 2 },
	o3 = { c: 3 }, o4 = { d: 4 };

// setup read-only property
Object.defineProperty( o3, "e", {
	value: 5,
	enumerable: true,
	writable: false,
	configurable: false
} );

// setup non-enumerable property
Object.defineProperty( o3, "f", {
	value: 6,
	enumerable: false
} );

o3[ Symbol( "g" ) ] = 7;

// setup non-enumerable symbol
Object.defineProperty( o3, Symbol( "h" ), {
	value: 8,
	enumerable: false
} );

Object.setPrototypeOf( o3, o4 );
```

Only the properties `a`, `b`, `c`, `e`, and `Symbol("g")` will be copied to `target`:

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

The `d`, `f`, and `Symbol("h")` properties are omitted from copying; non-enumerable properties and non-owned properties are all excluded from the assignment. Also, `e` is copied as a normal property assignment, not duplicated as a read-only property.

In an earlier section, we showed using `setPrototypeOf(..)` to set up a `[[Prototype]]` relationship between an `o2` and `o1` object. There's another form that leverages `Object.assign(..)`:

```js
var o1 = {
	foo() { console.log( "foo" ); }
};

var o2 = Object.assign(
	Object.create( o1 ),
	{
		// .. o2's definition ..
	}
);

// delegates to `o1.foo()`
o2.foo();							// foo
```

**Note:** `Object.create(..)` is the ES5 standard utility that creates an empty object that is `[[Prototype]]`-linked. See the *this & Object Prototypes* title of this series for more information.

## `Math`

ES6 adds several new mathematic utilities that fill in holes or aid with common operations. All of these can be manually calculated, but most of them are now defined natively so that in some cases the JS engine can either more optimally perform the calculations, or perform them with better decimal precision than their manual counterparts.

It's likely that asm.js/transpiled JS code (see the *Async & Performance* title of this series) is the more likely consumer of many of these utilities rather than direct developers.

Trigonometry:

* `cosh(..)` - Hyperbolic cosine
* `acosh(..)` - Hyperbolic arccosine
* `sinh(..)` - Hyperbolic sine
* `asinh(..)` - Hyperbolic arcsine
* `tanh(..)` - Hyperbolic tangent
* `atanh(..)` - Hyperbolic arctangent
* `hypot(..)` - The squareroot of the sum of the squares (i.e., the generalized Pythagorean theorem)

Arithmetic:

* `cbrt(..)` - Cube root
* `clz32(..)` - Count leading zeros in 32-bit binary representation
* `expm1(..)` - The same as `exp(x) - 1`
* `log2(..)` - Binary logarithm (log base 2)
* `log10(..)` - Log base 10
* `log1p(..)` - The same as `log(x + 1)`
* `imul(..)` - 32-bit integer multiplication of two numbers

Meta:

* `sign(..)` - Returns the sign of the number
* `trunc(..)` - Returns only the integer part of a number
* `fround(..)` - Rounds to nearest 32-bit (single precision) floating-point value

## `Number`

Importantly, for your program to properly work, it must accurately handle numbers. ES6 adds some additional properties and functions to assist with common numeric operations.

Two additions to `Number` are just references to the preexisting globals: `Number.parseInt(..)` and `Number.parseFloat(..)`.

### Static Properties

ES6 adds some helpful numeric constants as static properties:

* `Number.EPSILON` - The minimum value between any two numbers: `2^-52` (see Chapter 2 of the *Types & Grammar* title of this series regarding using this value as a tolerance for imprecision in floating-point arithmetic)
* `Number.MAX_SAFE_INTEGER` - The highest integer that can "safely" be represented unambiguously in a JS number value: `2^53 - 1`
* `Number.MIN_SAFE_INTEGER` - The lowest integer that can "safely" be represented unambiguously in a JS number value: `-(2^53 - 1)` or `(-2)^53 + 1`.

**Note:** See Chapter 2 of the *Types & Grammar* title of this series for more information about "safe" integers.

### `Number.isNaN(..)` Static Function

The standard global `isNaN(..)` utility has been broken since its inception, in that it returns `true` for things that are not numbers, not just for the actual `NaN` value, because it coerces the argument to a number type (which can falsely result in a NaN). ES6 adds a fixed utility `Number.isNaN(..)` that works as it should:

```js
var a = NaN, b = "NaN", c = 42;

isNaN( a );							// true
isNaN( b );							// true -- oops!
isNaN( c );							// false

Number.isNaN( a );					// true
Number.isNaN( b );					// false -- fixed!
Number.isNaN( c );					// false
```

### `Number.isFinite(..)` Static Function

There's a temptation to look at a function name like `isFinite(..)` and assume it's simply "not infinite". That's not quite correct, though. There's more nuance to this new ES6 utility. Consider:

```js
var a = NaN, b = Infinity, c = 42;

Number.isFinite( a );				// false
Number.isFinite( b );				// false

Number.isFinite( c );				// true
```

The standard global `isFinite(..)` coerces its argument, but `Number.isFinite(..)` omits the coercive behavior:

```js
var a = "42";

isFinite( a );						// true
Number.isFinite( a );				// false
```

You may still prefer the coercion, in which case using the global `isFinite(..)` is a valid choice. Alternatively, and perhaps more sensibly, you can use `Number.isFinite(+x)`, which explicitly coerces `x` to a number before passing it in (see Chapter 4 of the *Types & Grammar* title of this series).

### Integer-Related Static Functions

JavaScript number values are always floating point (IEEE-754). So the notion of determining if a number is an "integer" is not about checking its type, because JS makes no such distinction.

Instead, you need to check if there's any non-zero decimal portion of the value. The easiest way to do that has commonly been:

```js
x === Math.floor( x );
```

ES6 adds a `Number.isInteger(..)` helper utility that potentially can determine this quality slightly more efficiently:

```js
Number.isInteger( 4 );				// true
Number.isInteger( 4.2 );			// false
```

**Note:** In JavaScript, there's no difference between `4`, `4.`, `4.0`, or `4.0000`. All of these would be considered an "integer", and would thus yield `true` from `Number.isInteger(..)`.

In addition, `Number.isInteger(..)` filters out some clearly not-integer values that `x === Math.floor(x)` could potentially mix up:

```js
Number.isInteger( NaN );			// false
Number.isInteger( Infinity );		// false
```

Working with "integers" is sometimes an important bit of information, as it can simplify certain kinds of algorithms. JS code by itself will not run faster just from filtering for only integers, but there are optimization techniques the engine can take (e.g., asm.js) when only integers are being used.

Because of `Number.isInteger(..)`'s handling of `NaN` and `Infinity` values, defining a `isFloat(..)` utility would not be just as simple as `!Number.isInteger(..)`. You'd need to do something like:

```js
function isFloat(x) {
	return Number.isFinite( x ) && !Number.isInteger( x );
}

isFloat( 4.2 );						// true
isFloat( 4 );						// false

isFloat( NaN );						// false
isFloat( Infinity );				// false
```

**Note:** It may seem strange, but Infinity should neither be considered an integer nor a float.

ES6 also defines a `Number.isSafeInteger(..)` utility, which checks to make sure the value is both an integer and within the range of `Number.MIN_SAFE_INTEGER`-`Number.MAX_SAFE_INTEGER` (inclusive).

```js
var x = Math.pow( 2, 53 ),
	y = Math.pow( -2, 53 );

Number.isSafeInteger( x - 1 );		// true
Number.isSafeInteger( y + 1 );		// true

Number.isSafeInteger( x );			// false
Number.isSafeInteger( y );			// false
```

## `String`

Strings already have quite a few helpers prior to ES6, but even more have been added to the mix.

### Unicode Functions

"Unicode-Aware String Operations" in Chapter 2 discusses `String.fromCodePoint(..)`, `String#codePointAt(..)`, and `String#normalize(..)` in detail. They have been added to improve Unicode support in JS string values.

```js
String.fromCodePoint( 0x1d49e );			// "𝒞"

"ab𝒞d".codePointAt( 2 ).toString( 16 );		// "1d49e"
```

The `normalize(..)` string prototype method is used to perform Unicode normalizations that either combine characters with adjacent "combining marks" or decompose combined characters.

Generally, the normalization won't create a visible effect on the contents of the string, but will change the contents of the string, which can affect how things like the `length` property are reported, as well as how character access by position behave:

```js
var s1 = "e\u0301";
s1.length;							// 2

var s2 = s1.normalize();
s2.length;							// 1
s2 === "\xE9";						// true
```

`normalize(..)` takes an optional argument that specifies the normalization form to use. This argument must be one of the following four values: `"NFC"` (default), `"NFD"`, `"NFKC"`, or `"NFKD"`.

**Note:** Normalization forms and their effects on strings is well beyond the scope of what we'll discuss here. See "Unicode Normalization Forms" (http://www.unicode.org/reports/tr15/) for more information.

### `String.raw(..)` Static Function

The `String.raw(..)` utility is provided as a built-in tag function to use with template string literals (see Chapter 2) for obtaining the raw string value without any processing of escape sequences.

This function will almost never be called manually, but will be used with tagged template literals:

```js
var str = "bc";

String.raw`\ta${str}d\xE9`;
// "\tabcd\xE9", not "	abcdé"
```

In the resultant string, `\` and `t` are separate raw characters, not the one escape sequence character `\t`. The same is true with the Unicode escape sequence.

### `repeat(..)` Prototype Function

In languages like Python and Ruby, you can repeat a string as:

```js
"foo" * 3;							// "foofoofoo"
```

That doesn't work in JS, because `*` multiplication is only defined for numbers, and thus `"foo"` coerces to the `NaN` number.

However, ES6 defines a string prototype method `repeat(..)` to accomplish the task:

```js
"foo".repeat( 3 );					// "foofoofoo"
```

### String Inspection Functions

In addition to `String#indexOf(..)` and `String#lastIndexOf(..)` from prior to ES6, three new methods for searching/inspection have been added: `startsWith(..)`, `endsWidth(..)`, and `includes(..)`.

```js
var palindrome = "step on no pets";

palindrome.startsWith( "step on" );	// true
palindrome.startsWith( "on", 5 );	// true

palindrome.endsWith( "no pets" );	// true
palindrome.endsWith( "no", 10 );	// true

palindrome.includes( "on" );		// true
palindrome.includes( "on", 6 );		// false
```

For all the string search/inspection methods, if you look for an empty string `""`, it will either be found at the beginning or the end of the string.

**Warning:** These methods will not by default accept a regular expression for the search string. See "Regular Expression Symbols" in Chapter 7 for information about disabling the `isRegExp` check that is performed on this first argument.

## Review

ES6 adds many extra API helpers on the various built-in native objects:

* `Array` adds `of(..)` and `from(..)` static functions, as well as prototype functions like `copyWithin(..)` and `fill(..)`.
* `Object` adds static functions like `is(..)` and `assign(..)`.
* `Math` adds static functions like `acosh(..)` and `clz32(..)`.
* `Number` adds static properties like `Number.EPSILON`, as well as static functions like `Number.isFinite(..)`.
* `String` adds static functions like `String.fromCodePoint(..)` and `String.raw(..)`, as well as prototype functions like `repeat(..)` and `includes(..)`.

Most of these additions can be polyfilled (see ES6 Shim), and were inspired by utilities in common JS libraries/frameworks.
