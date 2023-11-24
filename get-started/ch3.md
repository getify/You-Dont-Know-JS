# 你并不了解 JavaScript：入门 - 第二版

# 第三章：寻根究底

如果你已经阅读了第一和第二章，并花时间消化和思考，希望你对 JS 的理解有更多的*收获*。如果你跳过/略过它们（尤其是第二章），我建议你回去花更多的时间阅读这些材料。

在第二章中，我们在高层次上解释了语法、模式和行为。在这一章中，我们的注意力转移到 JS 的一些低层次的根本特征上，这些特征几乎是我们所写的每一行代码的基础。

请注意：这一章的内容比你可能习惯于思考的编程语言要深得多。我的目标是帮助你理解 JS 工作的核心，是什么让它运转。这一章应该开始回答一些你在探索 JS 时可能出现的「为什么？」的问题。然而，这些内容仍然不是对该语言的详尽阐述；这是本系列书的其他部分的目标，我们在这里的目标仍然是*入门*，并且更加适应 JS 的*感觉*，了解它是如何起伏的。

不要这么快就读完这些资料，以至于你迷失了方向。我已经说过十几次了，**跬步千里**。即使如此，你在读完这一章后可能还会有其他问题。这没关系，因为还有一整个系列的书在等着你继续探索呢！

## 迭代

由于程序本质上是为了处理数据（并对这些数据做出决定），用于浏览数据的模式对程序的可读性有很大影响。

迭代器模式已经存在了几十年，它提出了一种「标准化」的方法，从一个源头一次*块*的消费数据。这个想法是，对数据源进行迭代 。通过处理第一部分，然后是下一部分，以此类推，逐步处理数据集合，而不是一下子处理整个数据集，这样做更常见，更有帮助。

想象一下一个数据结构，它代表了一个关系型数据库的 `SELECT` 查询，它通常将结果组织成行。如果这个查询只有一条或几条记录，你可以一次处理整个结果集，并将每条记录分配给一个局部变量，然后对这些数据进行任何适当的操作。

但如果查询有 10 或 1000（或更多！）行，你就需要迭代处理来处理这些数据（通常是一个循环）。

迭代器模式定义了一个叫做「迭代器」的数据结构，它有一个对底层数据源（如查询结果行）的引用，它暴露了一个像 `next()` 的方法。调用 `next()` 返回下一个数据（即数据库查询的「记录」或「行」）。

你并不总是知道你需要遍历多少数据，所以一旦你遍历整个集合并*超过终点*，该模式通常以一些特殊的值或异常来表示完成。

迭代器模式的重要性在于坚持以*标准*的方式来迭代处理数据，这就创造了更干净、更容易理解的代码，而不是让每个数据结构/源都定义自己处理数据的自定义方式。

经过多年来 JS 社区围绕共同商定的迭代技术所做的各种努力，ES6 在语言中直接为迭代器模式规范了一个特定的协议。该协议定义了一个 `next()` 方法，其返回值是一个被称为 _iterator result_ 的对象；该对象有 `value` 和 `done` 属性，其中 `done` 是一个布尔值，在对底层数据源的迭代完成之前为 `false`。

### 消费迭代器

有了 ES6 的迭代协议，每次消费一个数据源的值是可行的，在每次 `next()` 调用后检查 `done` 是否为 `true` 来停止迭代。但这种方法是相当手动的，所以 ES6 也包括了几个机制（语法和 API），用于标准化地消费这些迭代器。

其中一个机制是 `for..of` 循环：

```js
// 给定某个数据源的迭代器：
var it = /* .. */;

// 循环处理其结果，一次一个
for (let val of it) {
    console.log(`Iterator value: ${ val }`);
}
// Iterator value: ..
// Iterator value: ..
// ..
```

| 注意：                                                              |
| :------------------------------------------------------------------ |
| 这里我们将省略等效的手动循环，但它的可读性肯定不如 `for..of` 循环！ |

另一个经常用于消费迭代器的机制是 `...` 操作符。这个操作符实际上有两种对称的形式： *扩展*和*剩余*。*扩展*形式是一个迭代器消费器。

要*扩展*一个迭代器，你必须要有*东西*来传递它。在 JS 中有两种可能性：一个数组或一个函数调用的参数列表。

一个数组的传递：

```js
// 将一个迭代器分散到一个数组中，
// 每个迭代的值都占据一个数组元素的位置。
var vals = [...it];
```

一个函数调用传递：

```js
// 将一个迭代器分散到一个函数中，
// 每个迭代的值占据一个参数位置。
doSomethingUseful(...it);
```

在这两种情况下，扩展运算符形式的 `...` 遵循 [iterator-consumption](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_generators#迭代器) 协议（与 `for..of` 循环相同），从迭代中获取所有可用的值，并将它们放入（又称，扩展）接收上下文中（数组，参数列表）。

### 迭代器

迭代器消费 (iterator-consumption) 协议在技术上是为消费*迭代器 (iterables)* 而定义的；迭代器是一个可以被迭代的值。

该协议自动从一个可迭代的程序中创建一个迭代器实例，并且只消费*该迭代器实例*，直到其完成。这意味着一个迭代器可以被消费一次以上；每次都会创建并使用一个新的迭代器实例。

那么，我们在哪里可以找到可迭代项？

ES6 将 JS 中的基本数据结构/集合类型定义为 iterables。这包括字符串、数组、maps、sets 等。

假设以下代码：

```js
// 数组是一个可迭代的对象
var arr = [10, 20, 30];

for (let val of arr) {
    console.log(`Array value: ${val}`);
}
// Array value: 10
// Array value: 20
// Array value: 30
```

由于数组是可迭代的，我们可以通过 `...` 扩展运算符，使用迭代器消费浅层复制一个数组：

```js
var arrCopy = [...arr];
```

我们也可以在一个字符串中一个一个地遍历字符：

```js
var greeting = "Hello world!";
var chars = [...greeting];

chars;
// [ "H", "e", "l", "l", "o", " ",
//   "w", "o", "r", "l", "d", "!" ]
```

一个 `Map` 数据结构使用对象作为键，将一个值（任何类型）与该对象相关联。Map 有一个不同于这里的默认迭代，因为迭代不仅仅是在 map 的值上，而是在它的 _entries_ 上。一个 _entry_ 是一个元组（两个元素数组），包括一个键和一个值。

假设以下代码：

```js
// 给定两个DOM元素，`btn1`和`btn2`。

var buttonNames = new Map();
buttonNames.set(btn1, "Button 1");
buttonNames.set(btn2, "Button 2");

for (let [btn, btnName] of buttonNames) {
    btn.addEventListener("click", function onClick() {
        console.log(`Clicked ${btnName}`);
    });
}
```

map 默认在 `for..of` 循环迭代的中，我们使用 `[btn,btnName]` 语法（称为「解构赋值」）将每个元组分解为各自的键/值对（`btn1`/`"Button 1"`和`btn2`/`"Button 2"`）。

JS 中每个内置的迭代器都暴露了一个默认的迭代，这可能与你的直觉相符。但如果有必要，你也可以选择一个更具体的迭代。例如，如果我们想只消费上述 `buttonNames` 映射的值，我们可以调用 `values()` 来获得一个只用值的迭代器：

```js
for (let btnName of buttonNames.values()) {
    console.log(btnName);
}
// Button 1
// Button 2
```

或者如果我们想在数组迭代中获得索引*和*值，我们可以用 `entries()` 方法：

```js
var arr = [10, 20, 30];

for (let [idx, val] of arr.entries()) {
    console.log(`[${idx}]: ${val}`);
}
// [0]: 10
// [1]: 20
// [2]: 30
```

在大多数情况下，JS 中所有内置的迭代器都有三种迭代器形式可用：只需要键 (`keys()`)、只需要值 (`values()`)和键值对数组 (`entries()`)。

除了使用内置的迭代器，你还可以确保你自己的数据结构遵守迭代协议；这样做意味着你选择了用 `for..of` 循环和 `...` 扩展运算符消费你的数据的能力。该协议的「标准化」意味着代码在整体上更容易被识别和阅读。

| 注意：                                                                                                                                                                                                                                                                                           |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 你可能已经注意到在这次讨论中发生了一个细微的变化。我们一开始讨论的是消费**迭代器**，但后来转而讨论在迭代器上进行迭代。迭代消费协议期望一个**可迭代项**，但是我们可以提供一个直接的*可迭代项*的原因是，一个迭代器只是它本身的一个迭代当从一个现有的迭代器创建一个迭代器实例时，被返回迭代器本身。 |

## 闭包

也许在不知不觉中，几乎每个 JS 开发者都使用了闭包。事实上，闭包是大多数语言中最普遍的能力之一。可能它甚至和变量或循环一样重要，这就是它的根本所在。

然而，它给人的感觉是隐蔽的，几乎是神奇的。而且它经常以非常抽象或非常非正式的术语被谈论，这几乎不能帮助我们确定它到底是什么。

我们需要能够识别程序中使用闭包的地方，因为闭包的存在或缺乏有时是导致错误的原因（甚至是性能问题的原因）。

因此，让我们以白话而具体的方式来定义闭包：

> 闭包是指一个函数记住并继续访问其作用域外的变量，即使该函数在不同的作用域中执行。

我们在这里看到两个定义上的特点。首先，闭包是函数性质的一部分。对象不会存在闭包，函数才会。第二，要观察一个闭包，你必须在一个与该函数最初定义的地方不同的作用域内执行一个函数。

假设以下代码：

```js
function greeting(msg) {
    return function who(name) {
        console.log(`${msg}, ${name}!`);
    };
}

var hello = greeting("Hello");
var howdy = greeting("Howdy");

hello("Kyle");
// Hello, Kyle!

hello("Sarah");
// Hello, Sarah!

howdy("Grant");
// Howdy, Grant!
```

首先， `greeting(..)` 外部函数被执行，创建一个内部函数 `who(..)` 的实例；该函数存在变量 `msg`，它是来自 `greeting(..)` 外部作用域的参数。当这个内部函数被返回时，它的引用被分配给外部作用域中的 `hello` 变量。然后我们第二次调用 `greeting(..)`，创建一个新的内部函数实例，在一个新的 `msg` 上有一个新的闭包，并返回该引用以分配给`howdy`。

当 `greeting(..)` 函数运行结束后，通常我们会期望它的所有变量都被垃圾回收（从内存中删除）。我们希望每个 `msg` 都能消失，但它们没有。原因就是闭包。由于内部函数实例仍然活着（分别分配给 `hello` 和 `howdy` ），所以它们的仍然保留着 `msg` 变量。

这些闭包不是 `msg` 变量值的快照；它们是变量本身的直接链接和保存。这意味着随着时间的推移，闭包可以实际监听（或让！）这些变量更新。

```js
function counter(step = 1) {
    var count = 0;
    return function increaseCount() {
        count = count + step;
        return count;
    };
}

var incBy1 = counter(1);
var incBy3 = counter(3);

incBy1(); // 1
incBy1(); // 2

incBy3(); // 3
incBy3(); // 6
incBy3(); // 9
```

内部 `increaseCount()` 函数的每个实例在其外部 `counter(..)` 函数都存在 `count` 和 `step` 变量闭包。`step` 一直保持不变，但 `count` 在每次调用该内部函数时被更新。由于闭包是针对变量的，而不仅仅是数值的快照，这些更新被保留下来。

在处理异步代码时，闭包是最常见的，比如回调。

假设以下代码：

```js
function getSomeData(url) {
    ajax(url, function onResponse(resp) {
        console.log(`Response (from ${url}): ${resp}`);
    });
}

getSomeData("https://some.url/wherever");
// Response (from https://some.url/wherever): ...
```

`url` 在函数 `onResponse(..)` 内部的，因此保留并记住了它，直到 Ajax 调用返回并执行 `onResponse(..)`。即使 `getSomeData(..)` 马上就结束了，`url` 参数变量在闭包中仍旧保持活力，只要需要就可以使用。

外层作用域不一定是一个函数当然它通常是，但不一定是，只要是在外层作用域中至少有一个变量从内部函数中访问：

```js
for (let [idx, btn] of buttons.entries()) {
    btn.addEventListener("click", function onClick() {
        console.log(`Clicked on button (${idx})!`);
    });
}
```

因为这个循环使用了`let` 声明，所以每次迭代都会得到新的块作用域（也就是局部）的 `idx` 和 `btn` 变量；这个循环每次都会创建一个新的内部 `onClick(..)` 函数。这个内部函数保存了 `idx`，只要 `btn` 上的点击处理程序被触发，它就一直保留着。所以当每个按钮被点击时，它的处理程序可以打印其相关的索引值，因为处理程序记住了其各自的 `idx` 变量。

切记：这个闭包不是针对数值（像 `1` 或 `3` ），而是针对 `idx` 变量本身。

闭包是任何语言中最普遍和最重要的编程模式之一。在 JS 中尤其如此；如果不以这种或那种方式利用闭包，就很难想象做任何有用的事情。

如果你仍然对闭包感到困惑，第二章*作用域与闭包*的大部分内容都集中在这个主题上。

## `this` 关键字

JS 最强大的机制之一也是最被误解的机制之一：`this` 关键字。一个常见的误解是，一个函数的 `this` 指的是函数本身。由于 `this` 在其他语言中的工作方式，另一个误解是 `this` 指向一个方法所属的实例。这两种看法都是不正确的。

正如前面所讨论的，当一个函数被定义时，它通过闭包被*吸附*在它的作用域内。作用域是控制如何解决对变量的引用的一组规则。

但是，除了它们的作用域之外，函数还有另一个特性，影响着它们可以访问的内容。这个特性被称为*执行上下文*，它通过函数的 `this` 关键字暴露给函数。

作用域是静态的，在你定义一个函数的时刻和地点，它包含了一组固定的可用变量，但一个函数的执行*上下文*是动态的，完全取决于**它是如何被调用的**（不管它是在哪里定义的，甚至是从哪里调用的）。

`this` 不是一个基于函数定义的固定特性，而是一个动态特性，在每次函数被调用时都会确定。

思考*执行上下文*的一种方式是，它是一个有形的对象，其属性在函数执行时是可用的。与作用域相比，它也可以被认为是一个*对象*；不同的是，*作用域对象*隐藏在 JS 引擎中，它对该函数来说始终是相同的，它的*属性 (properties)* 在函数中采取可用标识符变量形式。

```js
function classroom(teacher) {
    return function study() {
        console.log(`${teacher} says to study ${this.topic}`);
    };
}
var assignment = classroom("Kyle");
```

外部的 `classroom(..)` 函数没有引用 `this` 关键字，所以它就像我们到目前为止看到的其他函数一样。但是内部的 `study()` 函数确实引用了 `this`，这使得它成为一个 `this` 感知的函数。换句话说，它是一个依赖于其*执行环境*的函数。

| 注意：                                                    |
| :-------------------------------------------------------- |
| `study()` 也是从它的外部作用域对 `teacher` 变量进行闭包。 |

由 `classroom("Kyle")` 返回的内部 `study()` 函数被分配给一个叫做 `assignment` 的变量。那么如何调用`assignment()`（又名 `study()`）的呢？

```js
assignment();
// Kyle says to study undefined  -- Oops :(
```

在这个片段中，我们把 `assignment()` 作为一个普通的、正常的函数来调用，没有给它提供任何*执行环境*。

由于这个程序不是在严格模式下（见第一章，「严格模式的讨论」），在**没有指定任何上下文**的情况下调用的上下文感知函数默认上下文为全局对象（浏览器中的 `window`）。由于没有名为 `topic` 的全局变量（因此全局对象上也没有这样的属性），`this.topic` 被解析为 `undefined`。

现在假设以下代码：

```js
var homework = {
    topic: "JS",
    assignment: assignment,
};

homework.assignment();
// Kyle says to study JS
```

`assignment` 函数引用的副本被设置在 `homework` 对象的属性上，然后以 `homework.assignment()` 的形式调用。这意味着该函数调用的 `this` 将是 `homework` 对象。因此，`this.topic` 被解析为 `"JS"`。

最后：

```js
var otherHomework = {
    topic: "Math",
};

assignment.call(otherHomework);
// Kyle says to study Math
```

第三种调用函数的方式是使用 `call(..)` 方法，它需要一个对象（这里是 `otherHomework`），用于设置函数调用的 `this` 引用。属性引用 `this.topic` 解析为 `"Math"`。

同样的上下文感知函数以三种不同的方式调用，每次都会给出不同的答案，即 `this` 将引用什么对象。

`this` 函数及其动态上下文的好处是能够更灵活地用来自不同对象的数据重新使用单个函数。一个在同一个作用域上的闭包函数永远无法引用不同的作用域或变量集。但是一个具有动态 `this` 上下文的函数对于某些任务来说是很有帮助的。

## 原型

`this` 是函数执行的特性，原型是对象的特性，特别是对属性访问的解析。

把原型看作是两个对象之间的联系；这种联系隐藏在幕后，尽管有一些方法可以暴露和观察它。原型链接发生在一个对象被创建的时候；它被链接到另一个已经存在的对象。

一系列通过原型连接起来的对象被称为「原型链」。

原型链（即从一个对象 B 到另一个对象 A）的目的是为了使针对 B 的属性/方法的访问被*委托*给 A 来处理。属性/方法访问的委托允许两个（或更多！）对象来相互合作来完成一项任务。

思考一下，定义一个普通的对象：

```js
var homework = {
    topic: "JS",
};
```

`homework` 对象上只有一个属性： `topic`。然而，它的默认原型链是 `Object.prototype` 对象，该对象上有常见的内置方法，如 `toString()` 和 `valueOf()`，等等。

我们可以观察到这种原型链从 `homework` *委托*到 `Object.prototype`：

```js
homework.toString(); // [object Object]
```

即使 `homework` 没有定义 `toString()` 方法，`homework.toString()` 也能工作；代理会调用`Object.prototype.toString()` 进行代替。

### 对象的链接

你可以使用 `Object.create(..)` 创建一个对象来定义一个对象的原型链接：

```js
var homework = {
    topic: "JS",
};

var otherHomework = Object.create(homework);

otherHomework.topic; // "JS"
```

`Object.create(..)` 的第一个参数指定一个对象来链接新创建的对象，然后返回新创建（和链接！）的对象。

图 4 展示了三个对象（`otherHomework`、 `homework` 和 `Object.prototype`）是如何在一个原型链中被连接起来：

<figure>
    <img src="./images/fig4.png" width="200" alt="Prototype chain with 3 objects" align="center">
    <figcaption><em>图 4：原型链中的对象</em></figcaption>
    <br><br>
</figure>

通过原型链的委托只适用于访问 [lookup 属性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)中的值。如果你赋值给一个对象某个属性，这将直接应用于该对象，无论该对象的原型链接在哪里。

| 贴士：                                                                                                           |
| :--------------------------------------------------------------------------------------------------------------- |
| `Object.create(null)` 创建一个没有原型链接的对象，所以它纯粹只是一个独立的对象；在某些情况下，这可能是最佳选择。 |

假设以下代码：

```js
homework.topic;
// "JS"

otherHomework.topic;
// "JS"

otherHomework.topic = "Math";
otherHomework.topic;
// "Math"

homework.topic;
// 结果是 "JS" 并非 "Math"
```

直接在 `otherHomework` 上创建了一个 `topic` 的属性并对其赋值；这个操作对 `homework` 的 `topic` 属性没有影响。接下来的语句访问了 `otherHomework.topic`。而 `homework` 的 `topic` 并非是 `"Math"`。

图 5 展示了创建 `otherHomework.topic` 属性的赋值之后的对象/属性：

<figure>
    <img src="./images/fig5.png" width="200" alt="3 objects linked, with shadowed property" align="center">
    <figcaption><em>图 5: 'topic' 的属性遮蔽</em></figcaption>
    <br><br>
</figure>
`homework` 对象上的 `topic` [「遮蔽」](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)了 `otherHomework` 链上的同名属性，这被称为属性遮蔽（Property Shadowing）。

| 注意：                                                                                                                                                                                                              |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 在 `class` 在 ES6 中被添加之前（见第二章，「类」）,坦率地说另一种更复杂但也许仍然更常见的创建具有原型关联的对象的方法是使用「原型类 (prototypal class)」模式。我们将在附录 A *「类」的原型*中更详细地介绍这个话题。 |

### 重新审视一下 `this`

我们在前面介绍了 `this` 关键字，但是当了解到它是如何为原型委托的函数调用提供能力时，它的真正重要性就显现出来了。事实上，`this` 支持基于函数调用方式的动态上下文的主要原因之一是通过原型链委托的对象上的方法调用仍然保持预期的 `this`。

假设以下代码：

```js
var homework = {
    study() {
        console.log(`Please study ${this.topic}`);
    },
};

var jsHomework = Object.create(homework);
jsHomework.topic = "JS";
jsHomework.study();
// Please study JS

var mathHomework = Object.create(homework);
mathHomework.topic = "Math";
mathHomework.study();
// Please study Math
```

两个对象 `jsHomework` 和 `mathHomework` 各自的原型链接到单一的 `homework` 对象上，然后共有了 `study()` 函数。 `jsHomework` 和 `mathHomework` 各自被赋予自己的 `topic` 属性（见图 6）。

<figure>
    <img src="./images/fig6.png" width="495" alt="4 objects prototype linked" align="center">
    <figcaption><em>图 6：两个对象链接到一个共同的父对象上</em></figcaption>
    <br><br>
</figure>

`jsHomework.study()` 委托给 `homework.study()`，但其执行的 `this`（`this.topic`）由于函数的调用方式而解析为 `jsHomework`，所以 `this.topic` 是 `"JS"`。同样，`mathHomework.study()` 委托给 `homework.study()`，但仍然将 `this` 解析为 `mathHomework`，因此 `this.topic` 为`"Math"`。

如果 `this` 被解析为 `homework`，上面的代码片断就不那么有用了。然而，在许多其他语言中，`this` 有可能会是 `homework`，因为 `study()` 方法确实是在 `homework` 上定义的。

与许多其他语言不同，JS 的 `this` 是动态的，是允许原型委托的，而且 `class` 也会按预期运行！

## 常问 「为什么？」

本章的预期收获是，在 JS 的引擎中有很多东西比从表面上看出来的要多。

当你开始*入门*学习和了解 JS 时，你可以练习和加强的最重要的技能之一是好奇心，以及当你遇到语言中的某些东西时问「为什么？」的艺术。

尽管本章对一些主题进行了深入探讨，但许多细节还是被完全略过了。这里还有很多东西需要学习，而通往这些的道路是从你对你的代码提出\_正确的问题开始的。提出正确的问题是成为一个更好的开发者的关键技能。

在本书的最后一章中，我们将简要介绍如何将 JS 化整为零，这在《你并不了解 JavaScript》系列图书的其他部分都有涉及。另外，不要跳过本书的附录 B，它有一些用于练习的代码来复习本书涉及的一些主要内容。
