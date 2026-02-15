# 你并不了解 JavaScript：类型与语法 - 第二版
# 第 3 章：对象值

| 注意： |
| :--- |
| 草稿 |

在我们已经熟悉了内置原始类型之后，现在把焦点转向 JS 里的 `object` 类型。

如果要深入讲对象，我完全可以再写一本书；事实上我已经写过了！本系列的《对象与类》已经系统覆盖了对象相关内容，建议你在继续本章前先读过那本。

因此这里不会重复那本书的全部内容，而是聚焦在 `object` 这个值类型在 JS 中如何表现、以及它与其他值如何交互。

## 对象的类型

`object` 这个值类型包含多个子类型，每个子类型都有各自的专门行为，包括：

* 普通对象（plain objects）
* 基础对象（fundamental objects，也就是装箱原始类型）
* 内置对象（built-in objects）
* 数组（arrays）
* 正则表达式（regular expressions）
* 函数（functions，也叫“可调用对象”）

尽管行为各异，但它们有一个共同点：所有对象都可以充当“值的集合（属性集合）”，用于保存值（包括函数/方法）。

## 普通对象

最通用的对象值类型有时会被称为 *plain ol' javascript objects*（POJOs）。

普通对象有字面量写法：

```js
address = {
    street: "12345 Market St",
    city: "San Francisco",
    state: "CA",
    zip: "94114"
};
```

这个用 `{ .. }` 定义出来的普通对象（POJO），本质上是一个“具名属性集合”（`street`、`city`、`state`、`zip`）。属性里可以保存任意值：原始值或其他对象（包括数组、函数等）。

同一个对象也可以用命令式方式，通过 `new Object()` 构造器来创建：

```js
address = new Object();
address.street = "12345 Market St";
address.city = "San Francisco";
address.state = "CA";
address.zip = "94114";
```

普通对象默认通过 `[[Prototype]]` 关联到 `Object.prototype`，因此可委托访问一组通用对象方法，例如：

* `toString()` / `toLocaleString()`
* `valueOf()`
* `isPrototypeOf(..)`
* `hasOwnProperty(..)`（近期已标记为不推荐使用；替代：静态工具 `Object.hasOwn(..)`）
* `propertyIsEnumerable(..)`
* `__proto__`（getter）

```js
address.isPrototypeOf(Object.prototype);    // true
address.isPrototypeOf({});                  // false
```

## 基础对象

JS 定义了若干“基础对象”类型，它们是各内置构造器实例化得到的对象，包括：

* `new String()`
* `new Number()`
* `new Boolean()`

注意：这些构造器必须配合 `new` 才是“构造实例”。如果不写 `new`，这些函数实际上执行的是强制类型转换（见第 4 章）。

这些基础对象构造器产出的是对象值类型，而不是原始值：

```js
myName = "Kyle";
typeof myName;                      // "string"

myNickname = new String("getify");
typeof myNickname;                  // "object"
```

换句话说，基础对象构造器的实例可以看作对其对应原始值的一层包装。

| 警告： |
| :--- |
| 直接实例化这些基础对象，几乎被普遍视为一种*坏实践*。对应的原始值通常更可预测、性能更好，而且在需要访问属性/方法时，语言已经提供了*自动装箱*（见下文“自动对象”）。 |

规范里也把 `Symbol(..)` 与 `BigInt(..)` 称为“构造器（constructors）”，但它们不与 `new` 一起使用，而且在 JS 程序中产生的确实是原始值。

不过，这两种类型在内部也存在对应的“基础对象”，用于原型委托与*自动装箱*。

相对地，`null` 与 `undefined` 这两个原始值既没有 `Null()` / `Undefined()` 这类“构造器”，也没有对应的基础对象或原型。

### 原型

基础对象构造器的实例，会通过 `[[Prototype]]` 关联到其构造器的 `prototype` 对象：

* `String.prototype`：定义了 `length` 属性，以及 `toUpperCase()` 等字符串专用方法。

* `Number.prototype`：定义了 `toPrecision(..)`、`toFixed(..)` 等数字专用方法。

* `Boolean.prototype`：定义了默认的 `toString()` 与 `valueOf()` 方法。

* `Symbol.prototype`：定义了 `description`（getter），以及默认的 `toString()` 与 `valueOf()` 方法。

* `BigInt.prototype`：定义了默认的 `toString()`、`toLocaleString()` 与 `valueOf()` 方法。

由这些内置构造器直接创建的实例，都可通过 `[[Prototype]]` 委托访问各自 `prototype` 上的属性/方法。此外，相应的原始值也可通过*自动装箱*获得同样的委托访问能力。

### 自动对象

前面（包括第 1 章、第 2 章，以及本章前文）已经多次提到*自动装箱*（auto-boxing），现在是时候把它说清楚了。

对一个值做属性/方法访问，前提是该值是对象。我们在第 1 章已看到：原始值*不是*对象，所以 JS 必须临时把原始值转换/包装成对应的基础对象[^AutoBoxing]，才能完成访问。

例如：

```js
myName = "Kyle";

myName.length;              // 4

myName.toUpperCase();       // "KYLE"
```

之所以能在原始 `string` 上访问 `length` 或 `toUpperCase()`，是因为 JS 会把该原始值*自动装箱*为包装基础对象（可视作 `new String(..)` 的内部对应形式）。否则这类访问都应当失败，因为原始值本身并不拥有属性。

更关键的是，当原始值被*自动装箱*后，内部创建出的对象会通过 `[[Prototype]]` 关联到相应基础对象的原型，因此可以访问预定义属性/方法（如 `length`、`toUpperCase()`）。

所以，一个被*自动装箱*的 `string` 可视作 `new String()` 的实例，并因此关联到 `String.prototype`。同理，`number`（包装为 `new Number()` 的对应形式）和 `boolean`（包装为 `new Boolean()` 的对应形式）也是如此。

即便 `Symbol(..)` 与 `BigInt(..)` 这些“不带 `new` 的构造器”产生的是原始值，这些原始值在需要属性/方法委托访问时，也会被*自动装箱*为内部的基础对象包装形式。

| 注意： |
| :--- |
| 关于 `[[Prototype]]` 链接与委托/继承访问基础对象原型的更多细节，请参阅本系列《对象与类》。 |

由于 `null` 与 `undefined` 没有对应的基础对象，因此它们不存在*自动装箱*。

这里有个主观问题：*自动装箱*算不算强制类型转换（coercion）？我认为算，尽管有人不同意。内部确实发生了从原始值到对象的转换，也就是值类型变化。没错，它是临时的，但很多强制类型转换本来也只是临时的。再者，它明显是*隐式*发生的（由属性/方法访问触发，但只在内部发生）。第 4 章我们会再次讨论强制类型转换的本质。

## 其他内置对象

除了基础对象构造器，JS 还定义了一批其他内置构造器，用于创建更专门的对象子类型：

* `new Date(..)`
* `new Error(..)`
* `new Map(..)`、`new Set(..)`、`new WeakMap(..)`、`new WeakSet(..)` —— 键控集合（keyed collections）
* `new Int8Array(..)`、`new Uint32Array(..)` 等 —— 索引化的类型化数组集合（indexed, typed-array collections）
* `new ArrayBuffer(..)`、`new SharedArrayBuffer(..)` 等 —— 结构化数据集合（structured data collections）

## 数组

数组是对象的一种特化形态：它更擅长表现为“按数字索引组织的值集合”，而不是像普通对象那样按具名属性保存值。

数组有字面量写法：

```js
favoriteNumbers = [ 3, 12, 42 ];

favoriteNumbers[2];                 // 42
```

同一个数组也可以通过 `new Array()` 构造器命令式创建：

```js
favoriteNumbers = new Array();
favoriteNumbers[0] = 3;
favoriteNumbers[1] = 12;
favoriteNumbers[2] = 42;
```

数组通过 `[[Prototype]]` 关联到 `Array.prototype`，因此可委托访问大量面向数组的方法，比如 `map(..)`、`includes(..)`：

```js
favoriteNumbers.map(v => v * 2);
// [ 6, 24, 84 ]

favoriteNumbers.includes(42);       // true
```

`Array.prototype` 上的方法大致有三类：

* 原地修改数组的方法，比如 `push(..)`、`pop(..)`、`sort(..)`。
* 返回新数组且不改原数组的方法，比如 `concat(..)`、`map(..)`、`slice(..)`。
* 只计算并返回非数组结果的方法，比如 `indexOf(..)`、`includes(..)`。

## 正则表达式

// TODO

## 函数

// TODO

## 提案：Records / Tuples

截至本文写作时，有一个（stage-2）提案[^RecordsTuplesProposal] 计划为 JS 增加一组新特性，它们与普通对象和数组非常接近，但又有一些关键区别。

Record 类似普通对象，但它是不可变的（sealed、只读）；并且（不同于对象）在值赋值与相等性比较语义上，它被视为原始值。语法差异是：在 `{ }` 前面加上 `#`。Record 只能包含原始值（包括 record 与 tuple）。

Tuple 与数组的关系完全对应：也是在 `[ ]` 前加 `#`，并具备同类语义差异。

需要特别强调：它们看起来很像对象/数组，但语义上确实是原始值（非对象值）。

[^FundamentalObjects]: "20 Fundamental Objects", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-fundamental-objects ; Accessed August 2022

[^AutoBoxing]: "6.2.4.6 PutValue(V,W)", Step 5.a, ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-putvalue ; Accessed August 2022

[^RecordsTuplesProposal]: "JavaScript Records & Tuples Proposal"; Robin Ricard, Rick Button, Nicolò Ribaudo;
https://github.com/tc39/proposal-record-tuple ; Accessed August 2022
