# 你并不了解 JavaScript：对象与类 - 第二版
# 第 1 章：对象基础

| 注意： |
| :--- |
| 草稿 |

> JavaScript 中的一切皆为对象。

这是关于 JS 流传最广、但也是最错误的“事实”之一。让我们开始打破这个神话吧。

JS 确实有对象，但这并不意味着所有的值都是对象。尽管如此，对象可以说是语言中最重要（也是最多样化！）的值类型，因此掌握它们对于你的 JS 之旅至关重要。

对象机制无疑是最灵活和强大的容器类型——你可以将其他值放入其中；你编写的每个 JS 程序都会以某种方式使用它们。但这并不是对象在本书中占据首位的原因。对象是 JS 三大支柱中第二支柱的基础：原型（Prototype）。

为什么原型（以及稍后在本书中介绍的 `this` 关键字）对 JS 如此核心，以至于成为其三大支柱之一？除此之外，原型是 JS 对象系统表达类（Class）设计模式的方式，而类是所有编程中最广泛依赖的设计模式之一。

因此，我们的旅程将从对象开始，建立对原型的完整理解，揭开 `this` 关键字的神秘面纱，并探索 `class` 系统。

## 关于本书

欢迎阅读《你并不了解 JavaScript》系列的第 3 本书！如果你已经完成了《开始》（第一本）和《作用域与闭包》（第二本），那你来对地方了！如果没有，在继续之前，我鼓励你先阅读这两本书作为基础，然后再深入阅读本书。

本书的第一版名为《this & Object Prototypes》。在那本书中，我们的重点从 `this` 关键字开始，因为它可能是 JS 中最令人困惑的话题之一。然后，那本书的大部分时间都集中在阐述原型系统上，并提倡采用鲜为人知的“委托”模式，而不是类设计。在撰写那本书时（2014 年），ES6 距离完成还有将近 2 年的时间，所以我当时觉得 `class` 关键字的早期草案只值得在附录中简要介绍。

自从那本书出版以来的近 8 年里，JS 领域发生了很多变化，这还是极其保守的说法。ES6 现在已经是旧闻了；在撰写*这*本书时，JS 在 **ES6 之后**已经经历了 7 次年度更新（从 ES2016 到 ES2022）。

现在，我们仍然需要讨论 `this` 是如何工作的，以及它是如何与在各种对象上调用的方法相关联的。而且 `class` 实际上（在很大程度上！）在底层是通过原型链运作的。但是 2022 年的 JS 开发者几乎不再编写代码来显式地连接原型继承了。尽管我个人希望情况有所不同，但类设计模式——而不是“行为委托”——是 JS 中大多数数据和行为组织（数据结构）的表达方式。

本书反映了 JS 的当前现实：因此有了新的副标题、新的组织结构和主题重点，以及对上一版内容的完全重写。

## 作为容器的对象

将多个值收集到单个容器中的一种常见方法是使用对象。对象是键/值对（key/value pairs）的集合。JS 中也有具有特殊行为的对象子类型，例如数组（数字索引）甚至函数（可调用）；稍后将详细介绍这些子类型。

| 注意： |
| :--- |
| 键（Key）通常被称为“属性名（property names）”，属性名和值的配对通常称为“属性（property）”。本书将以这种方式区分使用这些术语。 |

常规的 JS 对象通常使用字面量语法声明，如下所示：

```js
myObj = {
    // ..
};
```

**注意：** 还有一种创建对象的替代方法（使用 `myObj = new Object()`），但这并不常见或受推荐，几乎不建议这样使用。请坚持使用对象字面量语法。

很容易混淆 `{ .. }` 对的含义，因为 JS 重载了花括号，根据使用的上下文，它可能表示以下任何一种：

*   界定值，如对象字面量
*   定义对象解构模式（稍后详细介绍）
*   界定插值字符串表达式，如 `` `some ${ getNumber() } thing` ``
*   定义块，如在 `if` 和 `for` 循环中
*   定义函数体

虽然这有时可能会在阅读代码时造成挑战，但请查看 `{ .. }` 花括号对是否用在程序中允许出现值/表达式的地方；如果是，它就是一个对象字面量，否则它就是其他重载用途之一。

## 定义属性

在对象字面量花括号内，你使用 `propertyName: propertyValue` 对来定义属性（名称和值），如下所示：

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};
```

你分配给属性的值可以是字面量（如上所示），也可以通过表达式计算得出：

```js
function twenty() { return 20; }

myObj = {
    favoriteNumber: (twenty() + 1) * 2,
};
```

表达式 `(twenty() + 1) * 2` 会立即求值，结果（`42`）被分配为属性值。

开发者有时想知道是否有一种方法可以为属性值定义一个“惰性”表达式，即不在赋值时计算，而是稍后定义。JS 没有惰性表达式，所以唯一的方法是将表达式包装在一个函数中：

```js
function twenty() { return 20; }
function myNumber() { return (twenty() + 1) * 2; }

myObj = {
    favoriteNumber: myNumber   // 注意，不是 `myNumber()` 函数调用
};
```

在这种情况下，`favoriteNumber` 不持有数值，而是持有函数引用。要计算结果，必须显式执行该函数引用。

### 看起来像 JSON？

你可能注意到我们目前看到的这种对象字面量语法类似于一种相关的语法，“JSON”（JavaScript Object Notation，JavaScript 对象表示法）：

```json
{
    "favoriteNumber": 42,
    "isDeveloper": true,
    "firstName": "Kyle"
}
```

JS 对象字面量和 JSON 之间的最大区别在于，对于定义为 JSON 的对象：

1.  属性名必须用 `"` 双引号字符引起来

2.  属性值必须是字面量（基本类型、对象或数组），不能是任意的 JS 表达式

在 JS 程序中，对象字面量不需要引用的属性名——你*可以*引用它们（允许 `'` 或 `"`），但这通常是可选的。然而，有些字符在属性名中是有效的，但如果不加引号则不能包含，例如开头是数字或包含空格：

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle",
    "2 nicknames": [ "getify", "ydkjs" ]
};
```

另一个细微的区别是，JSON 语法——即作为 JSON *解析*的文本，例如来自 `.json` 文件——比通用 JS 更严格。例如，JS 允许注释（`// ..` 和 `/* .. */`），以及对象和数组表达式中的尾随逗号 `,`；JSON 不允许这些。值得庆幸的是，JSON 仍然允许任意的空白符。

### 属性名

对象字面量中的属性名几乎总是被视为/强制转换为字符串值。唯一的例外是整数（或“看起来像整数”）的属性“名”：

```js
anotherObj = {
    42:       "<-- 这个属性名将被视为整数",
    "41":     "<-- ...这个也是",

    true:     "<-- 这个属性名将被视为字符串",
    [myObj]:  "<-- ...这个也是"
};
```

`42` 属性名将被视为整数属性名（即索引）；`"41"` 字符串值也将被视为整数属性名，因为它*看起来像*一个整数。相比之下，`true` 值将变为字符串属性名 `"true"`，而 `myObj` 标识符引用（通过周围的 `[ .. ]` *计算*得出）将把对象的值强制转换为字符串（通常默认为 `"[object Object]"`）。

| 警告： |
| :--- |
| 如果你确实需要使用对象作为键/属性名，切勿依赖这种计算字符串强制转换；它的行为令人惊讶，而且几乎肯定不是预期的，因此很可能会出现程序 bug。相反，请使用一种更专门的数据结构，称为 `Map`（在 ES6 中添加），其中用作属性“名”的对象将保持原样，而不是被强制转换为字符串值。 |

如上面的 `[myObj]` 所示，你可以在对象字面量定义时*计算*任何**属性名**（不同于计算属性值）：

```js
anotherObj = {
    ["x" + (21 * 2)]: true
};
```

必须出现在 `[ .. ]` 括号内的表达式 `"x" + (21 * 2)` 会立即计算，结果（`"x42"`）用作属性名。

### Symbols 作为属性名

ES6 添加了一种新的基本值类型 `Symbol`，通常用作存储和检索属性值的特殊属性名。它们通过 `Symbol(..)` 函数调用创建（**不使用** `new` 关键字），该函数接受一个可选的描述字符串，仅用于更友好的调试目的；如果指定，该描述对 JS 程序是不可访问的，因此除调试输出外不用于任何其他目的。

```js
myPropSymbol = Symbol("optional, developer-friendly description");
```

| 注意： |
| :--- |
| Symbol 有点像数字或字符串，不同之处在于它们的值对 JS 程序是*不透明*的，并且在程序内是全局唯一的。换句话说，你可以创建和使用 Symbol，但 JS 不会让你知道有关底层值的任何信息，也不能对其执行任何操作；这是 JS 引擎保留的隐藏实现细节。 |

如前所述，计算属性名是在对象字面量上定义 Symbol 属性名的方法：

```js
myPropSymbol = Symbol("optional, developer-friendly description");

anotherObj = {
    [myPropSymbol]: "Hello, symbol!"
};
```

用于在 `anotherObj` 上定义属性的计算属性名将是实际的基本类型 Symbol 值（无论它是什么），而不是可选的描述字符串（`"optional, developer-friendly description"`）。

因为 Symbol 在你的程序中是全局唯一的，所以**没有**意外冲突的风险，比如程序的这一部分意外定义了一个与程序另一部分试图定义/赋值的属性名相同的属性。

Symbol 也常用于挂钩对象的特殊默认行为，我们将在下一章的“扩展 MOP”中更详细地介绍这部分内容。

### 简写属性（Concise Properties）

定义对象字面量时，通常使用与持有你想赋值的现有作用域内标识符相同的属性名。

```js
coolFact = "the first person convicted of speeding was going 8 mph";

anotherObj = {
    coolFact: coolFact
};
```

| 注意： |
| :--- |
| 这与带引号的属性名定义 `"coolFact": coolFact`是一样的，但 JS 开发人员很少引用属性名，除非绝对必要。实际上，除非必须，否则避免使用引号是惯用的做法，因不建议不必要地包含它们。 |

在这种情况下，当属性名和值表达式标识符相同时，你可以省略属性定义的属性名部分，即所谓的“简写属性”定义：

```js
coolFact = "the first person convicted of speeding was going 8 mph";

anotherObj = {
    coolFact   // <-- 简写属性
};
```

属性名是 `"coolFact"`（字符串），分配给该属性的值是当时 `coolFact` 变量中的内容：`"the first person convicted of speeding was going 8 mph"`。

起初，这种简写便利可能会让人感到困惑。但是，随着你越来越熟悉这种非常普遍和流行的特性，你可能会喜欢上它，因为它可以少打字（也少阅读！）。

### 简写方法（Concise Methods）

另一个类似的简写是使用更简洁的形式在对象字面量中定义函数/方法：

```js
anotherObj = {
    // 标准函数属性
    greet: function() { console.log("Hello!"); },

    // 简写函数/方法属性
    greet2() { console.log("Hello, friend!"); }
};
```

既然我们在讨论简写方法属性，我们也可以定义生成器函数（另一个 ES6 特性）：

```js
anotherObj = {
    // 替代:
    //   greet3: function*() { yield "Hello, everyone!"; }

    // 简写生成器方法
    *greet3() { yield "Hello, everyone!"; }
};
```

虽然不是很常见，但简写方法/生成器甚至可以使用带引号或计算的名称：

```js
anotherObj = {
    "greet-4"() { console.log("Hello, audience!"); },

    // 简写计算名称
    [ "gr" + "eet 5" ]() { console.log("Hello, audience!"); },

    // 简写计算生成器名称
    *[ "ok, greet 6".toUpperCase() ]() { yield "Hello, audience!"; }
};
```

### 对象扩展（Object Spread）

在对象字面量创建时定义属性的另一种方法是使用 `...` 语法的一种形式——它在技术上不是一个运算符，但看起来肯定像一个——通常被称为“对象扩展（Object Spread）”。

当在对象字面量内部使用 `...` 时，它会将另一个对象值的内容（属性，即键/值对）“展开（Spread）”到正在定义的对象中：

```js
anotherObj = {
    favoriteNumber: 12,

    ...myObj,   // 对象扩展，浅拷贝 `myObj`

    greeting: "Hello!"
}
```

`myObj` 属性的展开是浅层的，因为它只从 `myObj` 复制顶层属性；这些属性持有的任何值都只是简单地赋值过来。如果这些值中有任何是对其他对象的引用，则引用本身被赋值（通过复制），但底层对象值*不被*复制——所以你最终会得到指向同一个对象的多个共享引用。

你可以将对象扩展想象成一个 `for` 循环，它一次遍历一个属性，并执行从源对象（`myObj`）到目标对象（`anotherObj`）的 `=` 风格赋值。

此外，请将这些属性定义操作视为“按顺序”发生，从对象字面量的顶部到底部。在上面的代码片段中，由于 `myObj` 有一个 `favoriteNumber` 属性，对象扩展最终覆盖了上一行的 `favoriteNumber: 12` 属性赋值。此外，如果 `myObj` 包含一个被复制过来的 `greeting` 属性，下一行（`greeting: "Hello!"`）将覆盖该属性定义。

| 注意： |
| :--- |
| 对象扩展也只复制*自有（owned）*属性（直接在对象上的属性），并且是*可枚举（enumerable）*的（允许被枚举/列出）。它不复制属性本身——即实际上模仿属性的确切特征——而是进行简单的赋值式复制。我们将在下一章的“属性描述符”部分介绍更多此类细节。 |

`...` 对象扩展的一种常见用法是执行*浅层*对象复制：

```js
myObjShallowCopy = { ...myObj };
```

请记住，你不能将 `...` 扩展到现有的对象值中；`...` 对象扩展语法只能出现在 `{ .. }` 对象字面量内，这会创建一个新的对象值。要使用 API 而不是语法执行类似的浅层对象复制，请参阅本章后面的“对象条目”部分（涵盖 `Object.entries(..)` 和 `Object.fromEntries(..)`）。

但是，如果你想将对象属性（浅层）复制到*现有*对象中，请参阅本章后面的“分配属性”部分（涵盖 `Object.assign(..)`）。

### 深层对象复制（Deep Object Copy）

此外，由于 `...` 不执行完整的深层对象复制，对象扩展通常只适用于复制仅包含简单基本类型值的对象，而不适用于包含对其他对象引用的对象。

深层对象复制是一个极其复杂和微妙的操作。复制像 `42` 这样的值是显而易见的，但是复制一个函数（它是一种特殊类型的对象，也是通过引用持有的），或者复制一个外部（不完全在 JS 中）对象引用，比如 DOM 元素，意味着什么？如果一个对象有循环引用（比如嵌套的后代对象持有指回外部祖先对象的引用）会发生什么？关于应该如何处理所有这些极端情况，外界有各种各样的意见，因此不存在单一的深层对象复制标准。

对于深层对象复制，标准方法一直是：

1.  使用声明了关于应该如何处理复制行为/细微差别的特定观点的库实用程序。

2.  使用 `JSON.parse(JSON.stringify(..))` 往返技巧——这只有在没有循环引用，并且对象中没有无法用 JSON 正确序列化的值（如函数）时才“正确”工作。

不过最近，第三种选择出现了。这不是 JS 特性，而是由 Web 平台等环境提供给 JS 的配套 API。现在可以使用 `structuredClone(..)` 进行深层对象复制 [^structuredClone]。

```js
myObjCopy = structuredClone(myObj);
```

这个内置实用程序背后的底层算法支持复制循环引用，以及比 `JSON` 往返技巧**更多**类型的值。然而，不管怎样，这个算法仍然有其局限性，包括不支持克隆函数或 DOM 元素。

## 访问属性

现有对象的属性访问最好使用 `.` 运算符完成：

```js
myObj.favoriteNumber;    // 42
myObj.isDeveloper;       // true
```

如果可以通过这种方式访问属性，强烈建议这样做。

如果属性名包含不能出现在标识符中的字符，例如开头的数字或空格，则可以使用 `[ .. ]` 括号代替 `.`：

```js
myObj["2 nicknames"];    // [ "getify", "ydkjs" ]
```

```js
anotherObj[42];          // "<-- 这个属性名将..."
anotherObj["41"];        // "<-- 这个属性名将..."
```

即使数字属性“名”仍然是数字，通过 `[ .. ]` 括号访问属性也会将字符串表示形式强制转换为数字（例如，`"42"` 转换为 `42` 数字等效值），然后相应地访问关联的数字属性。

与对象字面量类似，要访问的属性名可以通过 `[ .. ]` 括号计算。表达式可以是简单的标识符：

```js
propName = "41";
anotherObj[propName];
```

实际上，放在 `[ .. ]` 括号之间的可以是任何任意的 JS 表达式，不仅仅是标识符或像 `42` 或 `"isDeveloper"` 这样的字面量值。JS 将首先计算表达式，结果值随后将用作在对象上查找的属性名：

```js
function howMany(x) {
    return x + 1;
}

myObj[`${ howMany(1) } nicknames`];   // [ "getify", "ydkjs" ]
```

在这个片段中，表达式是一个反引号分隔的 `` `模板字符串字面量` ``，带有一个函数调用 `howMany(1)` 的插值表达式。该表达式的总体结果是字符串值 `"2 nicknames"`，然后将其用作要访问的属性名。

### 对象条目（Object Entries）

你可以获取对象中属性的列表，作为持有属性名和值的元组（两个元素的子数组）的数组：

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

Object.entries(myObj);
// [ ["favoriteNumber",42], ["isDeveloper",true], ["firstName","Kyle"] ]
```

ES6 中添加的 `Object.entries(..)` 从源对象中检索此条目列表——仅包含自有和可枚举的属性；请参阅下一章中的“属性描述符”部分。

这样的列表可以被循环/迭代，可能会将属性赋值给另一个现有对象。但是，也可以使用 `Object.fromEntries(..)`（在 ES2019 中添加）从条目列表创建一个新对象：

```js
myObjShallowCopy = Object.fromEntries( Object.entries(myObj) );

// 前面讨论的替代方法：
// myObjShallowCopy = { ...myObj };
```

### 解构（Destructuring）

另一种访问属性的方法是通过对象解构（在 ES6 中添加）。将解构视为定义一个“模式”，该模式描述对象值应该“看起来像”什么（结构上），然后要求 JS 遵循该“模式”系统地访问对象值的内容。

对象解构的最终结果不是另一个对象，而是将源对象中的值赋值给其他目标（变量等）。

想象一下这种 ES6 之前的代码：

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

const favoriteNumber = (
    myObj.favoriteNumber !== undefined ? myObj.favoriteNumber : 42
);
const isDev = myObj.isDeveloper;
const firstName = myObj.firstName;
const lname = (
    myObj.lastName !== undefined ? myObj.lastName : "--missing--"
);
```

这些对属性值的访问以及对其他标识符的赋值通常被称为“手动解构”。要使用声明性对象解构语法，它可能看起来像这样：

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

const { favoriteNumber = 12 } = myObj;
const {
    isDeveloper: isDev,
    firstName: firstName,
    lastName: lname = "--missing--"
} = myObj;

favoriteNumber;   // 42
isDev;            // true
firstName;        // "Kyle"
lname;            // "--missing--"
```

如图所示，`{ .. }` 对象解构类似于对象字面量值的定义，但它出现在 `=` 运算符的左侧，而不是出现对象值表达式的右侧。这使得左侧的 `{ .. }` 成为解构模式，而不是另一个对象定义。

`{ favoriteNumber } = myObj` 解构告诉 JS 在对象上找到一个名为 `favoriteNumber` 的属性，并将其值赋给同名的标识符。模式中 `favoriteNumber` 标识符的单个实例类似于本章前面讨论的“简写属性”：如果源（属性名）和目标（标识符）相同，你可以省略其中一个，只列出一次。

`= 12` 部分告诉 JS，如果源对象没有 `favoriteNumber` 属性，或者如果该属性持有 `undefined` 值，则为 `favoriteNumber` 的赋值提供 `12` 作为默认值。

在第二个解构模式中，`isDeveloper: isDev` 模式指示 JS 在源对象上找到名为 `isDeveloper` 的属性，并将其值赋给名为 `isDev` 的标识符。这有点像将源“重命名”为目标。相比之下，`firstName: firstName` 提供了赋值的源和目标，但是是多余的，因为它们是相同的；这里用一个 `firstName` 就足够了，而且通常更受推荐。

`lastName: lname = "--missing--"` 结合了源-目标重命名和默认值（如果 `lastName` 源属性缺失或为 `undefined`）。

上面的片段将对象解构与变量声明结合在一起——在这个例子中，使用了 `const`，但 `var`和 `let` 也可以工作——但这本质上不是一种声明机制。解构是关于访问和赋值（源到目标），所以它可以针对现有的目标操作，而不是声明新的目标：

```js
let fave;

// 当不使用声明符时，
// 这里的周围 ( ) 是必需的语法
({ favoriteNumber: fave } = myObj);

fave;  // 42
```

通常首选对象解构语法，因为它具有声明性和更易读的风格，而不是严重的命令式 ES6 之前的等价物。但不要过度使用解构。有时只做 `x = someObj.x` 也是完全可以的！

### 条件属性访问（Conditional Property Access）

最近（在 ES2020 中），一个被称为“可选链（optional chaining）”的特性被添加到了 JS 中，它增强了属性访问能力（特别是嵌套属性访问）。主要形式是双字符复合运算符 `?.`，如 `A?.B`。

此运算符将检查左侧引用（`A`）以查看它是否为 null'ish（`null` 或 `undefined`）。如果是，则属性访问表达式的其余部分将被短路（跳过），并返回 `undefined` 作为结果（即使实际遇到的是 `null`！）。否则，`?.` 将像普通的 `.` 运算符一样访问属性。

例如：

```js
myObj?.favoriteNumber
```

在这里，null'ish 检查是针对 `myObj` 执行的，这意味着只有在 `myObj` 中的值非 null'ish 时才执行 `favoriteNumber` 属性访问。请注意，它不验证 `myObj` 是否实际上持有一个真正的对象，只验证它是非 null'ish。然而，所有非 null'ish 值都可以通过 `.` 运算符“安全地”（无 JS 异常）进行“访问”，即使没有匹配的属性可检索。

很容易混淆，认为 null'ish 检查是针对 `favoriteNumber` 属性的。但是一种理清它的方法是记住 `?` 位于执行安全检查的一侧，而 `.` 位于仅在非 null'ish 检查通过时才有条件地进行评估的一侧。

通常，`?.` 运算符用于可能深达 3 层或更多层的嵌套属性访问，例如：

```js
myObj?.address?.city
```

使用 `?.` 运算符的等效操作如下所示：

```js
(myObj != null && myObj.address != null) ? myObj.address.city : undefined
```

再次记住，这里没有针对最右边的属性（`city`）执行检查。

此外，`?.` 不应普遍用于代替程序中的每一个 `.` 运算符。你应该尽可能要在进行访问之前知道 `.` 属性访问是否会成功。仅当被访问值的性质受制于无法预测/控制的条件时，才使用 `?.`。

例如，在前面的片段中，`myObj?.` 的用法可能是被误导的，因为这不应该是这种情况：你针对一个甚至可能不持有顶层对象的变量开始属性访问链（除了其内容可能在某些条件下缺少某些属性）。

相反，我建议更像这样的用法：

```js
myObj.address?.city
```

并且该表达式仅应用于你确定 `myObj` 至少持有一个有效对象（无论它是否有包含子对象的 `address` 属性）的程序部分。

“可选链”运算符的另一种形式是 `?.[`，当你要进行条件/安全访问的属性需要 `[ .. ]` 括号时使用。

```js
myObj["2 nicknames"]?.[0];   // "getify"
```

关于 `?.` 行为的所有断言同样适用于 `?.[`。

| 警告： |
| :--- |
| 这个特性还有第三种形式，名为“可选调用（optional call）”，它使用 `?.(` 作为运算符。它用于在执行属性中的函数值之前对属性执行非 null'ish 检查。例如，你可以做 `myObj.someFunc?.(42)` 而不是 `myObj.someFunc(42)`。`?.(`在调用它（带有 `(42)` 部分）之前检查以确保 `myObj.someFunc` 是非 null'ish。虽然这听起来像是一个有用的特性，但我认为这足够危险，以至于需要完全避免这种形式/构造。<br><br>我的担忧是 `?.(` 让人觉得我们在调用函数之前确保它是“可调用的”，而实际上我们只是检查它是否为非 null'ish。这与 `?.` 不同，`?.` 允许针对非 null'ish 值（也是非对象）进行“安全”的 `.` 访问，而 `?.(` 非 null'ish 检查并非同样“安全”。如果相关属性中有任何非 null'ish、非函数值，如 `true` 或 `"Hello"`，则 `(42)` 调用部分将被调用，从而抛出 JS 异常。换句话说，这种形式不幸地伪装成比实际更“安全”，因此应该在基本上所有情况下避免使用。如果属性值可能*不是*函数，请在尝试调用它之前对其函数性进行更全面的检查。不要假装 `?.(` 正在为你做这件事，否则你的代码的未来读者/维护者（包括未来的你！）可能会后悔。 |

### 访问非对象上的属性

这听起来可能违反直觉，但你通常可以从本身不是对象的值访问属性/方法：

```js
fave = 42;

fave;              // 42
fave.toString();   // "42"
```

在这里，`fave` 持有基本的 `42` 数字值。那么我们怎么能对其进行 `.toString` 来访问属性，然后用 `()` 来调用该属性中持有的函数呢？

这比我们在本书中讨论的内容要深入得多；更多信息请参阅本系列的第 4 本书“类型与语法”。然而，快速浏览一下：如果你针对非对象、非 null'ish 值执行属性访问（`.` 或 `[ .. ]`），JS 默认（暂时！）将值强制转换为对象包装表示形式，允许针对该隐式实例化的对象进行属性访问。

这个过程通常被称为“装箱（boxing）”，就像将值放入“盒子”（对象容器）中一样。

所以在上面的片段中，就在访问 `42` 值上的 `.toString` 的瞬间，JS 将此值装箱为 `Number` 对象，然后执行属性访问。

请注意，`null` 和 `undefined` 可以被对象化，通过调用 `Object(null)` / `Object(undefined)`。但是，JS 不会自动装箱这些 null'ish 值，因此针对它们的属性访问将失败（如前面在“条件属性访问”部分中所述）。

| 注意： |
| :--- |
| 装箱有一个对应的操作：拆箱（unboxing）。例如，每当数学运算（如 `*` 或 `-`）遇到这样一个对象时，JS 引擎将获取一个对象包装器——比如用 `Number(42)` 或 `Object(42)` 创建的包装了 `42` 的 `Number` 对象——并将其解包以检索底层基本类型 `42`。拆箱行为超出了我们的讨论范围，但在前面提到的“类型与语法”标题中有完整介绍。 |

## 分配属性

无论属性是在对象字面量定义时定义的，还是稍后添加的，属性值的分配都是使用 `=` 运算符完成的，就像任何其他普通赋值一样：

```js
myObj.favoriteNumber = 123;
```

如果 `favoriteNumber` 属性尚不存在，该语句将创建一个同名的新属性并分配其值。但是如果它已经存在，该语句将重新分配其值。

| 警告： |
| :--- |
| 对属性的 `=` 赋值可能会失败（静默或抛出异常），或者它可能不直接分配值，而是调用执行某些操作的*setter*函数。有关这些行为的更多详细信息，请参阅下一章。 |

也可以一次分配一个或多个属性——假设源属性（名称和值对）在另一个对象中——使用 `Object.assign(..)`（在 ES6 中添加）方法：

```js
// 浅拷贝所有（自有和可枚举）属性
// 从 `myObj` 到 `anotherObj`
Object.assign(anotherObj,myObj);

Object.assign(
    /*target=*/anotherObj,
    /*source1=*/{
        someProp: "some value",
        anotherProp: 1001,
    },
    /*source2=*/{
        yetAnotherProp: false
    }
);
```

`Object.assign(..)` 将第一个对象作为目标，第二个（以及可选的后续）对象作为源。复制以与前面在“对象扩展”部分中描述的相同方式完成。

## 删除属性

一旦在对象上定义了属性，删除它的唯一方法是使用 `delete` 运算符：

```js
anotherObj = {
    counter: 123
};

anotherObj.counter;   // 123

delete anotherObj.counter;

anotherObj.counter;   // undefined
```

与常见的误解相反，JS `delete` 运算符**不**直接执行任何内存释放/释放操作，即垃圾回收（GC）。它所做的唯一事情是从对象中删除属性。如果属性中的值是引用（指向另一个对象/等），并且一旦删除了属性，该值就没有其他幸存的引用，那么该值很可能有资格在未来的 GC 扫描中被删除。

对对象属性以外的任何东西调用 `delete` 都是对 `delete` 运算符的滥用，并且要么静默失败（在非严格模式下），要么抛出异常（在严格模式下）。

从对象中删除属性不同于为其分配 `undefined` 或 `null` 值。分配了 `undefined` 的属性，无论是最初还是后来，仍然存在于对象上，并且在枚举内容时仍可能显示出来。

## 确定容器内容

你可以通过多种方式确定对象的内容。要询问对象是否具有特定属性：

```js
myObj = {
    favoriteNumber: 42,
    coolFact: "the first person convicted of speeding was going 8 mph",
    beardLength: undefined,
    nicknames: [ "getify", "ydkjs" ]
};

"favoriteNumber" in myObj;            // true

myObj.hasOwnProperty("coolFact");     // true
myObj.hasOwnProperty("beardLength");  // true

myObj.nicknames = undefined;
myObj.hasOwnProperty("nicknames");    // true

delete myObj.nicknames;
myObj.hasOwnProperty("nicknames");    // false
```

`in` 运算符和 `hasOwnProperty(..)` 方法的行为之间*确实*存在重要差异。`in` 运算符不仅会检查指定的目标对象，而且如果没有在那里找到，它还会咨询对象的 `[[Prototype]]` 链（在下一章中介绍）。相比之下，`hasOwnProperty(..)` 仅咨询目标对象。

如果你密切关注，你可能已经注意到 `myObj` 似乎有一个名为 `hasOwnProperty(..)` 的方法属性，即使我们没有定义这样的属性。这是因为 `hasOwnProperty(..)` 被定义为 `Object.prototype` 上的内置函数，默认情况下所有普通对象都“继承”它。不过，访问这种“继承”方法存在固有风险。同样，关于原型的更多信息在下一章。

### 更好的存在性检查

ES2022（在撰写本文时几乎是官方的）已经确定了一个新特性，`Object.hasOwn(..)`。它所做的事情本质上与 `hasOwnProperty(..)` 相同，但它是作为对象值外部的静态辅助函数调用的，而不是通过对象的 `[[Prototype]]` 调用的，这使得它在使用中更安全、更一致：

```js
// 替代:
myObj.hasOwnProperty("favoriteNumber")

// 我们现在应该首选:
Object.hasOwn(myObj,"favoriteNumber")
```

即使（在撰写本文时）此特性刚刚在 JS 中出现，也有 Polyfill 使此 API 在你的程序中可用，即使在尚未定义该特性的旧 JS 环境中运行时也是如此。例如，一个快速的临时 Polyfill 草图：

```js
// `Object.hasOwn(..)` 的简单 Polyfill 草图
if (!Object.hasOwn) {
    Object.hasOwn = function hasOwn(obj,propName) {
        return Object.prototype.hasOwnProperty.call(obj,propName);
    };
}
```

在你的程序中包含这样的 Polyfill 补丁意味着你可以安全地开始使用 `Object.hasOwn(..)` 进行属性存在性检查，无论 JS 环境是否已内置 `Object.hasOwn(..)`。

### 列出所有容器内容

我们之前已经讨论过 `Object.entries(..)` API，它告诉我们对象具有哪些属性（只要它们是可枚举的——下一章将详细介绍）。

还有各种其他机制可用。`Object.keys(..)` 给我们对象中可枚举属性名（即键）的列表——只有名称，没有值；`Object.values(..)` 相反，给我们可枚举属性中持有的所有值的列表。

但是，如果我们想要获取对象中的*所有*键（无论是否可枚举）怎么办？`Object.getOwnPropertyNames(..)` 似乎做了我们想要的，因为它像 `Object.keys(..)` 一样，但也返回不可枚举的属性名。但是，此列表**不会**包含任何 Symbol 属性名，因为这些被视为对象上的特殊位置。`Object.getOwnPropertySymbols(..)` 返回对象的所有 Symbol 属性。因此，如果你将这两个列表连接在一起，你将拥有对象的所有直接（*自有*）内容。

然而，正如我们已经多次暗示的那样，并且将在下一章中详细介绍，对象也可以从其 `[[Prototype]]` 链“继承”内容。这些不被视为*自有*内容，因此它们不会出现在任何这些列表中。

回想一下，`in` 运算符可能会遍历整个链以查找属性的存在。类似地，`for..in` 循环将遍历链并列出任何可枚举（自有或继承）属性。但是没有内置 API 会遍历整个链并返回组合的*自有*和*继承*内容集的列表。

## 临时容器

使用容器来保存多个值有时只是一种临时的传输机制，例如当你希望通过单个参数将多个值传递给函数时，或者当你希望函数返回多个值时：

```js
function formatValues({ one, two, three }) {
    // 传入的实际对象作为
    // 参数是不可访问的，因为
    // 我们将其解构为三个
    // 独立的变量

    one = one.toUpperCase();
    two = `--${two}--`;
    three = three.substring(0,5);

    // 这个对象只是为了在一个
    // return 语句中传输
    // 所有三个值
    return { one, two, three };
}

// 解构函数的返回值，
// 因为返回的对象
// 只是一个传输该多个值的
// 临时容器
const { one, two, three } =

    // 这个对象参数是一个临时的
    // 多输入值传输
    formatValues({
       one: "Kyle",
       two: "Simpson",
       three: "getify"
    });

one;     // "KYLE"
two;     // "--Simpson--"
three;   // "getif"
```

传入 `formatValues(..)` 的对象字面量立即被参数解构，所以在函数内部我们只处理三个独立的变量（`one`, `two`, 和 `three`）。从函数 `return` 的对象字面量也立即被解构，所以这里我们也只处理三个独立的变量（`one`, `two`, `three`）。

这个片段说明了一种惯用语/模式，即对象有时只是一个临时的传输容器，而不是本身有意义的值。

## 容器是属性的集合

对象最常见的用法是作为多个值的容器。我们要创建和管理属性容器对象，通过：

*   定义属性（命名位置），在对象创建时或稍后
*   分配值，在对象创建时或稍后
*   稍后访问值，使用位置名称（属性名）
*   通过 `delete` 删除属性
*   使用 `in`、`hasOwnProperty(..)` / `hasOwn(..)`、`Object.entries(..)` / `Object.keys(..)` 等确定容器内容

但是，对象不仅仅是属性名和值的静态集合。在下一章中，我们将深入了解它们实际是如何工作的。

[^structuredClone]: "Structured Clone Algorithm", HTML Specification; https://html.spec.whatwg.org/multipage/structured-data.html#structured-cloning ; Accessed July 2022