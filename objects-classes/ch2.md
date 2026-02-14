# 你并不了解 JavaScript：对象与类 - 第二版
# 第 2 章：对象是如何工作的

| 注意： |
| :--- |
| 草稿 |

对象不仅仅是多个值的容器，尽管这显然是大多数对象交互的场景。

为了完全理解 JS 中的对象机制，并最大限度地利用对象，我们需要更仔细地研究对象（及其属性）的一系列特性，这些特性会影响我们在与对象交互时的行为。

这些定义对象底层行为的特性，在形式上统称为“元对象协议”（Metaobject Protocol，简称 MOP）[^mop]。MOP 不仅对于理解对象将如何表现很有用，而且还可以用于覆盖对象的默认行为，从而使语言更充分地适应我们程序的需求。

## 属性描述符（Property Descriptors）

对象上的每个属性在内部都由所谓的“属性描述符”来描述。它本身也是一个对象（即“元对象”），具有若干属性（即“特性”），决定了目标属性的行为方式。

我们可以使用 `Object.getOwnPropertyDescriptor(..)` (ES5) 来获取任何现有属性的属性描述符：

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

Object.getOwnPropertyDescriptor(myObj,"favoriteNumber");
// {
//     value: 42,
//     enumerable: true,
//     writable: true,
//     configurable: true
// }
```

我们甚至可以使用这样的描述符，通过 `Object.defineProperty(..)` (ES5) 在对象上定义一个新属性：

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    value: 42,
    enumerable: true,     // 如果省略，默认为 false
    writable: true,       // 如果省略，默认为 false
    configurable: true    // 如果省略，默认为 false
});

anotherObj.fave;          // 42
```

如果一个现有属性尚未被标记为不可配置（即在其描述符中 `configurable: false`），则始终可以使用 `Object.defineProperty(..)` 重新定义或覆盖它。

| 警告： |
| :--- |
| 本章前面的许多章节都提到了“复制”或“重复”属性。人们可能会认为这种复制/重复是在属性描述符级别进行的。然而，这些操作实际上都不是那样工作的；它们都执行简单的 `=` 风格的访问和赋值，其效果是忽略了属性底层描述符定义的任何细微差别。 |

尽管在实际开发中似乎不太常见，但我们甚至可以一次定义多个属性，每个属性都有自己的描述符：

```js
anotherObj = {};

Object.defineProperties(anotherObj,{
    "fave": {
        // 属性描述符
    },
    "superFave": {
        // 另一个属性描述符
    }
});
```

这种用法不是很常见，因为你需要专门控制多个属性定义的场景比较少见。但在某些情况下它可能会很有用。

### 访问器属性（Accessor Properties）

通常，属性描述符定义了一个 `value` 属性，如上所示。然而，还可以定义一种特殊的属性，称为“访问器属性”（即 getter/setter）。对于这种属性，其描述符不定义固定的 `value` 属性，而是像这样：

```js
{
    get() { .. },    // 获取值时调用的函数
    set(v) { .. },   // 赋值时调用的函数
    // .. enumerable 等
}
```

Getter 看起来像属性访问（`obj.prop`），但在底层它调用了定义的 `get()` 方法；这有点像你调用了 `obj.prop()`。Setter 看起来像属性赋值（`obj.prop = value`），但它调用了定义的 `set(..)` 方法；这有点像你调用了 `obj.prop(value)`。

让我们演示一下 getter/setter 访问器属性：

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    get() { console.log("Getting 'fave' value!"); return 123; },
    set(v) { console.log(`Ignoring ${v} assignment.`); }
});

anotherObj.fave;
// Getting 'fave' value!
// 123

anotherObj.fave = 42;
// Ignoring 42 assignment.

anotherObj.fave;
// Getting 'fave' value!
// 123
```

### 可枚举（Enumerable）、可写（Writable）、可配置（Configurable）

除了 `value` 或 `get()` / `set(..)` 之外，属性描述符的其他 3 个特性是（如上所示）：

* `enumerable`
* `writable`
* `configurable`

`enumerable` 特性控制属性是否出现在对象的各种属性枚举中，例如 `Object.keys(..)`、`Object.entries(..)`、`for..in` 循环，以及使用 `...` 对象展开和 `Object.assign(..)` 进行的复制。大多数属性应保持可枚举，但如果某些特殊属性不应被迭代/复制，你可以将其标记为不可枚举。

`writable` 特性控制是否允许 `value` 赋值（通过 `=`）。要使属性“只读”，请将其定义为 `writable: false`。但是，只要该属性仍然是可配置的，`Object.defineProperty(..)` 仍然可以通过设置不同的 `value` 来更改值。

`configurable` 特性控制是否可以重新定义/覆盖属性的 **描述符**。`configurable: false` 的属性被锁定在其定义中，任何使用 `Object.defineProperty(..)` 更改它的尝试都会失败。只要属性描述符上仍设置了 `writable: true`，不可配置的属性仍然可以被分配新值（通过 `=`）。

## 对象子类型（Object Sub-Types）

JS 中有各种专门的对象子类型。但目前为止，你最常接触的两个是数组（Arrays）和函数（Functions）。

| 注意： |
| :--- |
| 我们所说的“子类型”，是指一种派生类型的概念，它继承了父类型的行为，但随后专门化或扩展了这些行为。换句话说，这些子类型的值完全是对象，但也 *不仅仅是* 对象。 |

### 数组（Arrays）

数组是专门设计为 **数字索引** 的对象，而不是使用字符串命名的属性位置。它们仍然是对象，因此像 `favoriteNumber` 这样的命名属性是合法的。但是，强烈不建议将命名属性混合到数字索引的数组中。

数组最好使用字面量语法（类似于对象）定义，但使用 `[ .. ]` 方括号而不是 `{ .. }` 花括号：

```js
myList = [ 23, 42, 109 ];
```

JS 允许数组中混合任何值类型，包括对象、其他数组、函数等。正如你可能已经知道的那样，数组是“零索引”的，这意味着数组中的第一个元素位于索引 `0`，而不是 `1`：

```js
myList = [ 23, 42, 109 ];

myList[0];      // 23
myList[1];      // 42
```

回想一下，对象上任何“看起来像”整数的字符串属性名——即能够有效地强制转换为数字整数——实际上都会被视为整数属性（即整数索引）。数组也是如此。你应该始终使用 `42` 作为整数索引（即属性名），但如果你使用字符串 `"42"`，JS 会假设你的意思是整数并为你进行处理。

```js
// "2" 在这里作为整数索引工作，但不建议这样做
myList["2"];    // 109
```

“不在数组上使用命名属性” *规则* 的一个例外是，所有数组都会自动暴露一个 `length` 属性，该属性会自动保持更新为数组的“长度”。

```js
myList = [ 23, 42, 109 ];

myList.length;   // 3

// 将另一个值 "push" 到列表末尾
myList.push("Hello");

myList.length;   // 4
```

| 警告： |
| :--- |
| 许多 JS 开发人员错误地认为数组的 `length` 基本上是一个 *getter*（参见本章前面的“访问器属性”），但它不是。其后果是，这些开发人员觉得访问此属性很“昂贵”——好像 JS 必须即时重新计算长度——因此会做一些事情，比如在对数组进行非变异循环之前捕获/存储数组的长度。从性能角度来看，这曾经是“最佳实践”。但至少在过去 10 年里，这实际上一直是一种反模式，因为 JS 引擎在管理 `length` 属性方面比我们的 JS 代码试图“智胜”引擎以避免调用我们认为的 *getter* 更有效率。让 JS 引擎做它的工作，并在需要时随时随地访问该属性，效率更高。 |

#### 空槽（Empty Slots）

JS 数组在其设计中也有一个非常不幸的“缺陷”，被称为“空槽”（empty slots）。如果你为数组分配的索引超出了数组当前末尾一个位置以上，JS 会让中间的槽保持“空”，而不是像你预期的那样自动将它们赋值为 `undefined`：

```js
myList = [ 23, 42, 109 ];
myList.length;              // 3

myList[14] = "Hello";
myList.length;              // 15

myList;                     // [ 23, 42, 109, empty x 11, "Hello" ]

// 看起来像一个真正的槽，
// 里面有一个真正的 `undefined` 值，
// 但是要小心，这是一个陷阱！
myList[9];                  // undefined
```

你可能会想，为什么空槽这么糟糕？一个原因是：在 JS 的某些 API 中，比如数组的 `map(..)`，空槽会被出人意料地跳过！永远不要有意在你的数组中创建空槽。这无可争议地是 JS 的“糟粕”之一。

### 函数（Functions）

关于函数，我这里没有什么特别要说的，只是指出它们也是对象子类型。这意味着除了可执行之外，它们还可以拥有被添加或访问的命名属性。

函数有两个预定义的属性，你可能会发现自己会为了元编程目的而与其交互：

```js
function help(opt1,opt2,...remainingOpts) {
    // ..
}

help.name;          // "help"
help.length;        // 2
```

函数的 `length` 是其显式定义的参数的计数，直到（但不包括）定义了默认值的参数（例如 `param = 42`）或“剩余参数”（例如 `...remainingOpts`）。

#### 避免设置函数对象属性

你应该避免在函数对象上分配属性。如果你想存储与函数关联的额外信息，请使用单独的 `Map(..)`（或 `WeakMap(..)`），以函数对象作为键，额外信息作为值。

```js
extraInfo = new Map();

extraInfo.set(help,"this is some important information");

// later:
extraInfo.get(help);   // "this is some important information"
```

## 对象特性（Object Characteristics）

除了为特定属性定义行为外，某些行为在整个对象范围内也是可配置的：

* 可扩展（extensible）
* 密封（sealed）
* 冻结（frozen）

### 可扩展（Extensible）

可扩展性是指是否可以在对象上定义/添加新属性。默认情况下，所有对象都是可扩展的，但你可以关闭对象的可扩展性：

```js
myObj = {
    favoriteNumber: 42
};

myObj.firstName = "Kyle";                  // 正常工作

Object.preventExtensions(myObj);

myObj.nicknames = [ "getify", "ydkjs" ];   // 失败
myObj.favoriteNumber = 123;                // 正常工作
```

在非严格模式下，创建新属性的赋值将静默失败，而在严格模式下会抛出异常。

### 密封（Sealed）

// TODO

### 冻结（Frozen）

// TODO

## 扩展 MOP

正如本章开头提到的，JS 中的对象行为遵循一套称为元对象协议（MOP）[^mop] 的规则。既然我们已经更充分地了解了对象默认是如何工作的，我们想把注意力转向我们要如何钩入（hook into）这些默认行为中的一部分并覆盖/自定义它们。

// TODO

## `[[Prototype]]` 链

对象最重要的但最不明显的特征之一（MOP 的一部分）被称为其“原型链”；官方 JS 规范符号是 `[[Prototype]]`。确切注意不要将此 `[[Prototype]]` 与名为 `prototype` 的公共属性混淆。尽管命名相似，但它们是不同的概念。

`[[Prototype]]` 是对象在创建时默认获得的内部链接，指向另一个对象。这种链接是对象的一个隐藏的、通常很微妙的特征，但它对与对象的交互方式有着深远的影响。它被称为“链”，因为一个对象链接到另一个对象，后者又链接到另一个对象，……依此类推。这个链有一个 *终点* 或 *顶端*，链接在那里停止，没有更远的地方可去。稍后会详细介绍。

我们在第 1 章中已经看到了 `[[Prototype]]` 链接的几个含意。例如，默认情况下，所有对象都 `[[Prototype]]` 链接到名为 `Object.prototype` 的内置对象。

| 警告： |
| :--- |
| `Object.prototype` 这个名字本身可能会令人困惑，因为它使用了一个名为 `prototype` 的属性。`[[Prototype]]` 和 `prototype` 是如何关联的！？先把这些问题/困惑放一放，稍后我们将在本章中回来解释 `[[Prototype]]` 和 `prototype` 之间的区别。目前，只需假设存在这个重要但命名奇怪的内置对象 `Object.prototype`。 |

让我们看一些代码：

```js
myObj = {
    favoriteNumber: 42
};
```

这看起来应该很像第 1 章的内容。但你在代码中 *看不到* 的是，该对象被自动链接（通过其内部 `[[Prototype]]`）到了那个自动内置的、但命名奇怪的 `Object.prototype` 对象。

当我们做这样的事情时：

```js
myObj.toString();                             // "[object Object]"

myObj.hasOwnProperty("favoriteNumber");   // true
```

我们利用了这个内部 `[[Prototype]]` 链接，却没有真正意识到这一点。由于 `myObj` 上没有定义 `toString` 或 `hasOwnProperty` 属性，这些属性访问实际上最终 **委托（DELEGATING）** 了访问权，以便沿着 `[[Prototype]]` 链继续查找。

由于 `myObj` 是 `[[Prototype]]` 链接到名为 `Object.prototype` 的对象的，因此 `toString` 和 `hasOwnProperty` 属性的查找会在该对象上继续；实际上，这些方法就是在那里找到的！

`myObj.toString` 能够访问 `toString` 属性，即使它实际上并没有该属性，这种能力通常被称为“继承”，或者更具体地说，“原型继承”。`toString` 和 `hasOwnProperty` 属性以及许多其他属性被称为 `myObj` 上的“继承属性”。

| 注意： |
| :--- |
| 我对这里使用“继承”这个词有很多不满——它应该被称为“委托”！——但这却是大多数人对它的称呼，所以我们将勉强遵守并暂时使用相同的术语（尽管是在抗议下，加上 " 引号）。我将把我的反对意见留到本书的附录中。 |

`Object.prototype` 有几个内置的属性和方法，所有 `[[Prototype]]` 链接（直接或通过另一个对象的链接间接）到 `Object.prototype` 的对象都会“继承”这些属性和方法。

来自 `Object.prototype` 的一些常见的“继承”属性包括：

* `constructor`
* `__proto__`
* `toString()`
* `valueOf()`
* `hasOwnProperty(..)`
* `isPrototypeOf(..)`

回想一下 `hasOwnProperty(..)`，即使我们之前看到它为咱们提供了一个布尔检查，用于检查某个属性（通过字符串名称）是否为对象所拥有：

```js
myObj = {
    favoriteNumber: 42
};

myObj.hasOwnProperty("favoriteNumber");   // true
```

一直以来，像 `hasOwnProperty(..)` 这样重要的实用程序被包含在 Object `[[Prototype]]` 链上作为实例方法，而不是被定义为静态实用程序，这被认为有些不幸（语义组织、命名冲突等）。

从 ES2022 开始，JS 终于添加了这个实用程序的静态版本：`Object.hasOwn(..)`。

```js
myObj = {
    favoriteNumber: 42
};

Object.hasOwn(myObj,"favoriteNumber");   // true
```

这种形式现在被认为是更可取和更稳健的选择，现在通常应避免使用实例方法 (`hasOwnProperty(..)`) 形式。

有些遗憾和不一致的是，（截至撰写本文时）还没有对应的静态实用程序，比如 `Object.isPrototype(..)`（代替实例方法 `isPrototypeOf(..)`）。但至少 `Object.hasOwn(..)` 存在了，这是一种进步。

### 创建具有不同 `[[Prototype]]` 的对象

默认情况下，你在程序中创建的任何对象都将 `[[Prototype]]` 链接到该 `Object.prototype` 对象。但是，你可以像这样创建一个具有不同链接的对象：

```js
myObj = Object.create(differentObj);
```

`Object.create(..)` 方法接受其第一个参数作为要在新创建对象的 `[[Prototype]]` 上设置的值。

这种方法的一个缺点是你没有使用 `{ .. }` 字面量语法，因此你最初没有为 `myObj` 定义任何内容。通常你必须随后使用 `=` 逐个定义属性。

| 注意： |
| :--- |
| `Object.create(..)` 的第二个可选参数是——就像前面讨论的 `Object.defineProperties(..)` 的第二个参数一样——一个带有持有描述符的属性的对象，用于初始定义新对象。在实际环境中，这种形式很少使用，可能是因为指定完整的描述符而不是仅仅指定名/值对比较笨拙。但在某些有限的情况下，它可能会派上用场。 |

或者，虽然不太推荐，你可以使用 `{ .. }` 字面量语法以及一个特殊的（且看起来很奇怪的！）属性：

```js
myObj = {
    __proto__: differentObj,

    // .. 对象定义的其余部分
};
```

| 警告： |
| :--- |
| 看起来很奇怪的 `__proto__` 属性在某些 JS 引擎中已经存在了 20 多年，但直到 ES6 (2015) 才在 JS 中标准化。即使如此，它也被添加在规范的附录 B 中[^specApB]，其中列出了 TC39 勉强包含的功能，因为它们在各种基于浏览器的 JS 引擎中广泛存在，因此即使它们并非起源于 TC39，也是事实上的现实。因此，规范“保证”此功能存在于所有符合标准的基于浏览器的 JS 引擎中，但不一定保证在其他独立的 JS 引擎中工作。Node.js 使用来自 Chrome 浏览器的 JS 引擎 (v8)，因此 Node.js 默认/意外地获得了 `__proto__`。在使用 `__proto__` 时要小心，了解你的代码将运行的所有 JS 引擎环境。 |

无论你使用 `Object.create(..)` 还是 `__proto__`，所讨论的创建对象通常都会 `[[Prototype]]` 链接到与默认 `Object.prototype` 不同的对象。

#### 空 `[[Prototype]]` 链接

我们上面提到，`[[Prototype]]` 链必须在某处停止，以便查找不会永远继续下去。`Object.prototype` 通常是每个 `[[Prototype]]` 链的顶端/终点，因为它自己的 `[[Prototype]]` 是 `null`，因此没有其他地方可以继续查找。

但是，你也可以定义具有自己的 `null` 值的 `[[Prototype]]` 的对象，例如：

```js
emptyObj = Object.create(null);
// 或者: emptyObj = { __proto__: null }

emptyObj.toString;   // undefined
```

创建一个没有 `[[Prototype]]` 链接到 `Object.prototype` 的对象非常有用。例如，正如在第 1 章中提到的，`in` 和 `for..in` 结构将查询 `[[Prototype]]` 链以获取继承的属性。但这可能是不受欢迎的，因为你可能不希望像 `"toString" in myObj` 这样的东西成功解析。

此外，具有空 `[[Prototype]]` 的对象可以免受其自身属性名称与其他地方“继承”的属性名称之间任何意外的“继承”冲突的影响。这些类型的（有用的！）对象有时在流行说法中被称为“字典对象”。

### `[[Prototype]]` vs `prototype`

注意到了这个特殊对象 `Object.prototype` 的名称/位置中的公共属性名 `prototype` 了吗？这是怎么回事？

`Object` 是 `Object(..)` 函数；默认情况下，所有函数（它们本身也是对象！）都在其上有一个 `prototype` 属性，指向一个对象。

这就是 `[[Prototype]]` 和 `prototype` 之间名称冲突真正刺痛我们的地方。函数上的 `prototype` 属性并不定义函数本身所经历的任何链接。实际上，函数（作为对象）在其他地方有自己的内部 `[[Prototype]]` 链接——稍后会详细介绍。

相反，函数上的 `prototype` 属性指的是一个对象，当使用 `new` 关键字调用该函数创建任何其他对象时，这些对象应该 **链接到** 该对象：

```js
myObj = {};

// 基本上等同于：
myObj = new Object();
```

由于 `{ .. }` 对象字面量语法本质上与 `new Object()` 调用相同，因此位于 `Object.prototype` 的内置对象被用作我们创建并命名为 `myObj` 的新对象的内部 `[[Prototype]]` 值。

呼！仅仅因为 `[[Prototype]]` 和 `prototype` 之间的名称重叠，这就成了一个令人更加困惑的话题！

----

但是函数本身（作为对象！）在 `[[Prototype]]` 方面链接到哪里呢？它们链接到 `Function.prototype`，这是另一个内置对象，位于 `Function(..)` 函数的 `prototype` 属性上。

换句话说，你可以将函数本身视为是通过 `new Function(..)` 调用“创建”的，然后 `[[Prototype]]` 链接到 `Function.prototype` 对象。该对象包含所有函数默认“继承”的属性/方法，例如 `toString()`（用于字符串序列化函数的源代码）和 `call(..)` / `apply(..)` / `bind(..)`（我们将在本书后面解释这些）。

## 对象行为

对象上的属性由“描述符”元对象内部定义和控制，其中包括诸如 `value`（属性的当前值）和 `enumerable`（控制属性是否包含在仅限可枚举的属性/属性名称列表中的布尔值）等特性。

JS 中对象及其属性的工作方式被称为“元对象协议”（MOP）[^mop]。我们可以通过 `Object.defineProperty(..)` 控制属性的精确行为，以及通过 `Object.freeze(..)` 控制对象范围的行为。但更强大的是，我们可以使用特殊的预定义 Symbol 钩入并覆盖对象上的某些默认行为。

原型是对象之间的内部链接，允许针对一个对象的属性或方法访问——如果请求的属性/方法不存在——通过将该访问查找“委托”给另一个对象来处理。当委托涉及方法时，方法的运行上下文通过 `this` 关键字从初始对象共享到目标对象。

[^mop]: "Metaobject", Wikipedia; https://en.wikipedia.org/wiki/Metaobject ; Accessed July 2022.

[^specApB]: "Appendix B: Additional ECMAScript Features for Web Browsers", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-additional-ecmascript-features-for-web-browsers ; Accessed July 2022
```