# 你并不了解 JavaScript：对象与类 - 第二版
# 第 4 章：this 的工作原理

| 注意: |
| :--- |
| 草稿 |

到目前为止，我们要经多次看到 `this` 关键字的使用，但还没有真正深入了解它在 JS 中究竟是如何工作的。现在是时候了。

但是，要正确理解 JS 中的 `this`，你需要抛开你可能有的任何先入为主的观念，特别是来自于你可能熟悉的其他编程语言中 `this` 工作方式的假设。

关于 `this` 最重要的一点是：`this` 指向什么值（通常是对象）不是在编写时确定的，而是在运行时确定的。这意味着你不能简单地看一个 `this`-aware（感知 `this`）的函数（即使是 `class` 定义中的方法），就能确定在函数运行时 `this` 会持有什值。

相反，你必须找到函数被调用的每一个位置，并查看它是*如何*被调用的（甚至*在哪*调用都不重要）。这是完全回答 `this` 指向何处的唯一方法。

实际上，同一个 `this`-aware 函数至少可以有四种不同的调用方式，而这些方式中的任何一种最终都将为该特定的函数调用分配不同的 `this`。

因此，我们在阅读代码时可能会问的典型问题 —— “这个函数的 `this` 指向什么？” —— 实际上不是一个有效的问题。你真正应该问的问题是：“当以某种方式调用该函数时，通过这次调用会分配什么 `this` ？”

如果仅仅阅读本章的介绍就已经让你的大脑开始打结……那很好！准备好重新构建你对 JS 中 `this` 的思考方式吧。

## 感知 This (This Aware)

刚才我使用了“`this`-aware”这个短语。但我究竟是什么意思呢？

任何包含 `this` 关键字的函数。

如果一个函数中没有任何地方包含 `this`，那么 `this` 的行为规则就不会以任何方式影响该函数。但是，如果它哪怕只包含一个 `this`，那么如果不弄清楚对于函数的每次调用 `this` 指向什么，你就绝对无法确定该函数的行为。

这有点像 `this` 关键字是模板中的一个占位符。那个占位符的值替换不是在我们编写代码时确定的；而是在代码运行时确定的。

你可能认为我只是在这里玩文字游戏。当然，当你编写程序时，你写出了对每个函数的所有调用，所以你在编写代码时就已经确定了 `this` 将是什么，对吧？对吗！？

别急！

首先，你并不总是编写所有调用你函数的代码。你的 `this`-aware 函数可能会作为回调传递给其他代码，无论是在你的代码库中，还是在第三方框架/工具中，甚至是在宿主你程序的语言或环境的原生内置机制内部。

即便不谈将函数作为回调传递，JS 中的几种机制也允许通过运行时的条件行为来决定特定的函数调用将设置哪个值（同样，通常是对象）作为 `this`。因此，即使你写了所有那些代码，你*充其量*也必须在脑海中执行最终影响函数调用的不同条件/路径。

为什么所有这一切都很重要？

因为不仅仅是你，代码的作者，需要弄清楚这些东西。是你代码的*每一个读者*，永远。如果任何人（即使是你未来的自己）想要阅读一段定义了 `this`-aware 函数的代码，那必然意味着，为了完全理解和预测其行为，那个人将不得不找到、阅读并理解该函数的每一次调用。

### This 困扰着我 (This Confuses Me)

公平地说，如果我们考虑函数的参数，这部分已经是事实了。要理解一个函数将如何工作，我们需要知道传入了什么。所以任何至少有一个参数的函数，在类似的意义上，都是*感知参数*的 —— 意思是，什么参数被传入并赋值给了函数的形参。

但是对于参数，我们通常可以从函数本身得到更多关于参数将做什么和持有什么的提示。

我们经常看到参数名称直接在函数头中声明，这很大程度上解释了它们的性质/用途。如果参数有默认值，我们经常看到它们通过 `= whatever` 子句内联声明。此外，根据作者的代码风格，我们可能会在函数的前几行看到一组应用于这些参数的逻辑；这可能是关于值的断言（不允许的值等），甚至是修改（类型转换、格式化等）。

实际上，`this` 非常像函数的参数，但它是一个隐式参数而不是显式参数。你在函数头的任何地方都看不到 `this` 将被使用的信号。你必须阅读整个函数体才能看到 `this` 是否出现在任何地方。

“参数”名称永远是 `this`，所以我们无法从这样一个通用的名称中获得太多关于其性质/用途的提示。实际上，历史上关于“this”到底应该意味着什么，存在很多困惑。而且我们很少看到对应用于函数调用的 `this` 值进行验证/转换/等的任何操作。实际上，我见过的几乎所有 `this`-aware 代码都只是想当然地假设 `this` “参数”持有的正是预期的值。这就说是**意外 bug 的陷阱！**

### 那么 This 是什么？(So What Is This?)

如果 `this` 是一个隐式参数，它的目的是什么？传入了什么？

希望你已经阅读了本系列的“作用域和闭包 (Scope & Closures)”一书。如果没有，我强烈建议你在读完本书后回过头去读那一本。在那本书中，我详细解释了作用域（以及闭包！）是如何工作的，这是函数的一个特别重要的特性。

词法作用域（Lexical scope）（包括所有闭包变量）代表了函数词法标识符引用进行求值的*静态*上下文。它是固定/静态的，因为在编写时，当你将函数和变量声明放置在各种（嵌套）作用域中时，这些决定就已固定，不受任何运行时条件的影响。

相比之下，另一种编程语言可能会提供*动态*作用域 (dynamic scope)，其中函数变量引用的上下文不是由编写时的决定确定的，而是由运行时条件确定的。这样的系统无疑会比静态上下文更灵活 —— 尽管灵活性通常伴随着复杂性。

明确一点：JS 的作用域总是且仅是词法和*静态*的（如果我们忽略像 `eval(..)` 和 `with` 这样的非严格模式作弊手段）。然而，JS 真正强大的地方之一在于它提供了另一种机制，具有与*动态*作用域类似的灵活性和能力。

`this` 机制实际上是*动态*上下文（不是作用域）；它是 `this`-aware 函数可以针对不同上下文进行动态调用的方式 —— 这对于闭包和词法作用域标识符来说是不可能的！

### 为什么 This 如此隐晦？(Why Is This So Implicit?)

你可能会想，为什么像*动态*上下文这样重要的东西会被处理为函数的隐式输入，而不是显式传递的参数。

这是一个非常重要的问题，但我们还不能完全回答。先保留这个问题。

### 我们能继续讲 This 吗？(Can We Get On With This?)

那我为什么要在这个话题上喋喋不休好几页呢？你懂的，对吧！？你准备好继续了。

我的观点是，作为代码作者的你，以及即使在几年或几十年后的所有其他代码读者，都需要是 `this`-aware 的。这就是通过编写此类代码所带来的选择和负担。是的，这也适用于使用 `class` 的选择（见第 3 章），因为大多数类方法常常都需要是 `this`-aware 的。

要在你编写的代码中意识到*这种* `this` 的选择。要有意识地做，并且要以产生比负担更多收益的方式去做。确保你代码中的 `this` 使用*物有所值*。

让我*这样*说：除非你真的能证明其合理性，并且你已经仔细权衡了成本，否则不要使用 `this`-aware 的代码。仅仅因为你看到很多示例代码在别人的代码中随意使用 `this`，并不意味着 `this` 属于你正在编写的*这段*代码。

JS 中的 `this` 机制，配合 `[[Prototype]]` 委托，是该语言极其强大的支柱。但正如那句老话所说：“能力越大，责任越大”。有趣的是，尽管我真的喜欢并赞赏 JS 的*这个*支柱，但我编写的 JS 代码中可能只有不到 5% 使用了它。当我使用它时，我是有节制的。它不是我默认的、首选的 JS 能力。

## 就这就是它！(This Is It!)

好了，啰嗦的说教够了。你已经准备好深入研究 `this` 代码了，对吧？

让我们回顾（并扩展）第 3 章中的 `Point2d`，但只是作为一个具有数据属性和函数的对象，而不是使用 `class`：

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) {
        var rotatedX = this.x * Math.cos(angleRadians) -
            this.y * Math.sin(angleRadians);
        var rotatedY = this.x * Math.sin(angleRadians) +
            this.y * Math.cos(angleRadians);
        this.x = rotatedX;
        this.y = rotatedY;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
};
```

如你所见，`init(..)`、`rotate(..)` 和 `toString()` 函数都是 `this`-aware 的。你可能习惯于假设 `this` 引用显然总是持有 `point` 对象。但这没有任何保证。

在阅读本章其余部分时，请不断提醒自己：函数的 `this` 值是由函数*如何*被调用决定的。这意味着你不能看函数的定义，也不能看函数定义在哪里（甚至包括外层的 `class`！）。实际上，函数从哪里被调用甚至都不重要。

我们需要看的仅仅是函数是*如何*被调用的；那是唯一重要的因素。

### 隐式上下文调用 (Implicit Context Invocation)

考虑这个调用：

```js
point.init(3,4);
```

我们正在调用 `init(..)` 函数，但注意前面的 `point.`？这是一个*隐式上下文* (implicit context) 绑定。它告诉 JS：调用 `init(..)` 函数，并将 `this` 引用指向 `point`。

这是我们期望 `this` 工作的*正常*方式，这也是我们调用函数最常见的方式之一。所以典型的调用给了我们直观的结果。这是一件好事！

### 默认上下文调用 (Default Context Invocation)

但是如果我们这样做会发生什么？

```js
const init = point.init;
init(3,4);
```

你可能假设我们会得到与前一个片段相同的结果。但这不是 JS `this` 赋值的工作方式。

函数的*调用位置* (call-site) 是 `init(3,4)`，这与 `point.init(3,4)` 不同。当没有*隐式上下文* (`point.`)，也没有任何其他 `this` 赋值机制时，就会发生*默认上下文* (default context) 赋值。

当像那样调用 `init(3,4)` 时，`this` 会引用什么？

*视情况而定。*

哦，糟糕。视情况而定？听起来很混乱。

别担心，没听起来那么糟糕。*默认上下文*赋值取决于代码是否处于严格模式 (strict-mode)。但值得庆幸的是，如今几乎所有的 JS 代码都在严格模式下运行；例如，ESM (ES Modules) 总是运行在严格模式下，`class` 块内的代码也是如此。而且几乎所有转译后的 JS 代码（通过 Babel、TypeScript 等）都被编写为声明严格模式。

所以绝大多数时候，现代 JS 代码将在严格模式下运行，因此*默认赋值*上下文不会“取决于”任何东西；它非常直接：`undefined`。就是这样！

| 注意: |
| :--- |
| 请记住：`undefined` 并不意味着“未定义”；它的意思是，“定义为特殊的空 `undefined` 值”。我知道，我知道……名称和含义不匹配。那就是语言遗留的包袱。（耸肩） |

这意味着如果在严格模式下运行，`init(3,4)` 会抛出一个异常。为什么？因为 `init(..)` 中的 `this.x` 引用是对 `undefined` 的 `.x` 属性访问（即 `undefined.x`），这是不允许的：

```js
"use strict";

var point = { /* .. */ };

const init = point.init;
init(3,4);
// TypeError: Cannot set properties of
// undefined (setting 'x')
```

停下来思考一下：为什么 JS 会选择将上下文默认为 `undefined`，以便任何 `this`-aware 函数的*默认上下文*调用都会因这样的异常而失败？

因为一个 `this`-aware 函数**总是需要一个 `this`**。`init(3,4)` 的调用没有提供 `this`，所以那*是*一个错误，并且*应该*引发异常以便可以纠正错误。教训是：永远不要在没有提供 `this` 的情况下调用一个 `this`-aware 函数！

仅为了完整性起见：在不太常见的非严格模式下，*默认上下文*是全局对象 —— JS将其定义为 `globalThis`，在浏览器 JS 中它本质上是 `window` 的别名，在 Node 中它是 `global`。所以，当 `init(3,4)` 在非严格模式下运行时，`this.x` 表达式就是 `globalThis.x` —— 在浏览器中也就是 `window.x`，或者在 Node 中的 `global.x`。因此，`globalThis.x` 被设置为 `3`，`globalThis.y` 被设置为 `4`。

```js
// 这里没有严格模式，当心！

var point = { /* .. */ };

const init = point.init;
init(3,4);

globalThis.x;   // 3
globalThis.y;   // 4
point.x;        // null
point.y;        // null
```

这很不幸，因为这几乎肯定*不是*预期的结果。这不仅如果是全局变量就很糟糕，而且它也*没有*改变我们要的 `point` 对象上的属性，所以程序 bug 是肯定会有的。

| 警告: |
| :--- |
| 哎哟！没人想要在代码各处意外隐式创建全局变量。教训：始终确保你的代码在严格模式下运行！|

### 显式上下文调用 (Explicit Context Invocation)

函数也可以使用内置的 `call(..)` 或 `apply(..)` 工具以*显式上下文* (explicit context) 进行调用：

```js
var point = { /* .. */ };

const init = point.init;

init.call( point, 3, 4 );
// 或: init.apply( point, [ 3, 4 ] )

point.x;        // 3
point.y;        // 4
```

`init.call(point,3,4)` 实际上与 `point.init(3,4)` 相同，因为它们都将 `point` 作为 `this` 上下文分配给 `init(..)` 调用。

| 注意: |
| :--- |
| `call(..)` 和 `apply(..)` 工具都接受一个 `this` 上下文值作为它们的第一个参数；这几乎总是一个对象，但技术上可以是任何值（数字、字符串等）。`call(..)` 工具接受后续参数并将它们传递给被调用的函数，而 `apply(..)` 期望它的第二个参数是一个要作为参数传递的值数组。 |

在你的程序中考虑使用*显式上下文*赋值（`call(..)` / `apply(..)`) 风格来调用函数可能看起来很笨拙。但它比乍看之下更有用。

让我们回顾一下最初的片段：

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) { /* .. */ },
    toString() {
        return `(${this.x},${this.y})`;
    },
};

point.init(3,4);

var anotherPoint = {};
point.init.call( anotherPoint, 5, 6 );

point.x;                // 3
point.y;                // 4
anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

你看懂我做了什么吗？

我想定义 `anotherPoint`，但我不想重复 `point` 中那些 `init(..)` / `rotate(..)` / `toString()` 函数的定义。所以我“借用”了一个函数引用，`point.init`，并通过 `call(..)` 显式地将空对象 `anotherPoint` 设置为 `this` 上下文。

当 `init(..)` 在那一刻运行时，其中的 `this` 将引用 `anotherPoint`，这就是为什么 `x` / `y` 属性（值分别为 `5` / `6`）在那里被设置的原因。

任何 `this`-aware 函数都可以像这样被借用：`point.rotate.call(anotherPoint, ..)`，`point.toString.call(anotherPoint)`。

#### 重访隐式上下文调用 (Revisiting Implicit Context Invocation)

另一种在 `point` 和 `anotherPoint` 之间共享行为的方法是：

```js
var point = { /* .. */ };

var anotherPoint = {
    init: point.init,
    rotate: point.rotate,
    toString: point.toString,
};

anotherPoint.init(5,6);

anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

这是另一种“借用”函数的方式，通过在任何目标对象（例如 `anotherPoint`）上添加共享的函数引用。调用位置的调用 `anotherPoint.init(5,6)` 是一种更自然/符合人体工程学的风格，它依赖于*隐式上下文*赋值。

比较 `anotherPoint.init(5,6)` 和 `point.init.call(anotherPoint,5,6)`，这种方法似乎稍微简洁一些。

但主要的缺点是必须修改任何目标对象以包含此类共享函数引用，这可能很繁琐、手动且容易出错。有时这种方法是可以接受的，但在许多其他情况下，使用 `call(..)` / `apply(..)` 的*显式上下文*赋值更可取。

### New 上下文调用 (New Context Invocation)

到目前为止，我们已经看到了函数调用位置处上下文赋值的三种不同方式：*默认*、*隐式*和*显式*。

第四种调用函数并为该调用分配 `this` 的方式是使用 `new` 关键字：

```js
var point = {
    // ..

    init: function() { /* .. */ }

    // ..
};

var anotherPoint = new point.init(3,4);

anotherPoint.x;     // 3
anotherPoint.y;     // 4
```

| 提示: |
| :--- |
| 这个例子有一些需要解释的细微差别。这里显示的 `init: function() { .. }` 形式 —— 具体来说，是分配给属性的函数表达式 —— 是使用 `new` 关键字有效调用该函数所必需的。从之前的片段来看，`init() { .. }` 的简写方法形式定义了一个*不能*用 `new` 调用的函数。 |

你通常看到 `new` 与 `class` 一起用于创建实例。但作为 JS 语言的底层机制，`new` 本质上不是一个 `class` 操作。

在某种意义上，`new` 关键字劫持了一个函数，并强制其行为进入一种与普通调用不同的模式。以下是当使用 `new` 调用函数时 JS 执行的 4 个特殊步骤：

1. 凭空创建一个全新的空对象。

2. 将该新空对象的 `[[Prototype]]` 链接到函数的 `.prototype` 对象（见第 2 章）。

3. 以该新空对象作为 `this` 上下文调用函数。

4. 如果函数没有显式返回它自己的对象值（使用 `return ..` 语句），则假设函数调用应该返回新对象（来自步骤 1-3）。

| 警告: |
| :--- |
| 步骤 4 意味着如果你使用 `new` 调用一个*确实*返回其自身对象的函数 —— 比如 `return { .. }` 等 —— 那么来自步骤 1-3 的新对象*不会*被返回。这是一个需要注意的棘手陷阱，因为它在程序有机会接收并存储对它的引用之前实际上丢弃了那个新对象。本质上，`new` 永远不应该用于调用其中包含显式 `return ..` 语句的函数。 |

为了更具体地理解这 4 个 `new` 步骤，我将用代码来说明它们，作为使用 `new` 关键字的替代方案：

```js
// 替代:
//   var anotherPoint = new point.init(3,4)

var anotherPoint;
// 这是一个用来隐藏局部 `let` 声明的裸块
{
    // (步骤 1)
    let tmpObj = {};

    // (步骤 2)
    Object.setPrototypeOf(
        tmpObj, point.init.prototype
    );
    // 或者: tmpObj.__proto__ = point.init.prototype

    // (步骤 3)
    let res = point.init.call(tmpObj,3,4);

    // (步骤 4)
    anotherPoint = (
        typeof res !== "object" ? tmpObj : res
    );
}
```

显然，`new` 调用简化了那一组手动步骤！

| 提示: |
| :--- |
| 步骤 2 中的 `Object.setPrototypeOf(..)` 也可以通过 `__proto__` 属性完成，例如 `tmpObj.__proto__ = point.init.prototype`，甚至作为对象字面量（步骤 1）的一部分，如 `tmpObj = { __proto__: point.init.prototype }`。 |

略过这些步骤的一些形式，让我们回顾一个较早的片段，看看 `new` 如何近似类似的结果：

```js
var point = { /* .. */ };

// 这种方法:
var anotherPoint = {};
point.init.call(anotherPoint,5,6);

// 可以替代近似为:
var yetAnotherPoint = new point.init(5,6);
```

这好多了！但这里有一个注意事项。

对 `anotherPoint` / `yetAnotherPoint` 使用 `point` 持有的其他函数时，我们不想使用 `new`。为什么？因为 `new` 正在创建一个*新*对象，但如果我们打算针对现有对象调用函数，那不是我们想要的。

相反，我们可能会使用*显式上下文*赋值：

```js
point.rotate.call( anotherPoint, /*angleRadians=*/Math.PI );

point.toString.call( yetAnotherPoint );
// (5,6)
```

### 复习 This (Review This)

我们已经看到了函数调用中 `this` 上下文赋值的四条规则。让我们按优先级顺序排列它们：

1. 函数是否是用 `new` 调用的，创建并设置一个新的 `this`？

2. 函数是否是用 `call(..)` 或 `apply(..)` 调用的，*显式*地设置 `this`？

3. 函数在其调用位置是否是通过对象引用调用的（例如，`point.init(..)`），*隐式*地设置 `this`？

4. 如果以上都不是……我们是否处于非严格模式？如果是，将 `this` *默认*为 `globalThis`。但如果在严格模式下，将 `this` *默认*为 `undefined`。

这些规则，*按照这个顺序*，是 JS 确定函数调用的 `this` 的方式。如果多个规则匹配一个调用位置（例如，`new point.init.call(..)`），列表中的第一个匹配规则获胜。

就是这样，你现在是 `this` 关键字的主人了。嗯，不完全是。还有很多细微差别要涵盖。但你已经上路了！

## 箭头指向某处 (An Arrow Points Somewhere)

到目前为止，我关于函数中的 `this` 以及它是如何根据调用位置确定的一切断言，都做了一个巨大的假设：你正在处理一个*常规*函数（或方法）。

那么什么是*非常规*函数呢？它看起来像这样：

```js
const x = x => x <= x;
```

| 注意: |
| :--- |
| 是的，我把箭头函数称为“非常规”并使用这样一个做作的例子有点讽刺和不公平。这是个玩笑，好吗？ |

这是一个 `=>` 箭头函数的真实示例：

```js
const clickHandler = evt =>
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
```

为了比较起见，让我同时也展示非箭头的等价物：

```js
const clickHandler = function(evt) {
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
};
```

或者如果我们稍微老派一点 —— 这是我的菜！ —— 我们可以尝试独立的函数声明形式：

```js
function clickHandler(evt) {
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
}
```

或者如果函数作为方法出现在 `class` 定义中，或者作为对象字面量中的简写方法，它会看起来像这样：

```js
// ..
clickHandler(evt) {
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
}
```

我真正想关注的是这些函数形式中的每一种在 `this` 引用方面会有什么表现，以及第一种 `=>` 形式是否与其他形式不同（提示：确实不同！）。但让我们从一个小测验开始，看看你是否一直在专心听讲。

对于刚刚展示的那些函数形式，我们如何知道每个 `this` 将引用什么？

### 调用位置在哪里？(Where's The Call-site?)

希望你回答了类似这样的话：“首先，我们需要看看函数是如何被调用的。”

很公平。

假设我们的程序看起来像这样：

```js
var infoForm = {
    theFormElem: null,
    theSubmitBtn: null,

    init() {
        this.theFormElem =
            document.getElementById("the-info-form");
        this.theSubmitBtn =
            theFormElem.querySelector("button[type=submit]");

        // *这*是调用位置吗？
        this.theSubmitBtn.addEventListener(
            "click",
            this.clickHandler,
            false
        );
    },

    // ..
}
```

啊，有趣。你们读者中有一半人以前从未见过实际的 DOM API 代码，如 `getElementById(..)`、`querySelector(..)` 和 `addEventListener(..)`。我刚刚听到了困惑的哨声！

| 注意: |
| :--- |
| 抱歉，我暴露年龄了。我做这些东西已经很久了，记得在我们有像 jQuery 这样的工具用 `$` 搞乱代码之前，我们就是那样写代码的。经过多年的前端演变，我们似乎停在这个更“现代”的地方 —— 至少，那是普遍的假设。 |

我猜想目前的你们很多人习惯于看到组件框架代码（React 等），有点像这样：

```jsx
// ..

infoForm(props) {
    return (
        <form ref={this.theFormElem}>
            <button type=submit onClick=this.clickHandler>
                Click Me
            </button>
        </form>
    );
}

// ..
```

当然，代码的形状还有很多其他方式，取决于你使用的是哪种框架等。

或者也许你已经不再使用 `class` / `this` 风格的组件了，因为你已经把所有东西都移到了 Hooks 和闭包上。无论如何，为了我们讨论的目的，*本*章全是关于 `this` 的，所以我们需要坚持使用像上面那样的编码风格，以便代码与讨论相关。

前面的那两个代码片段都没有显示 `clickHandler` 函数的定义。但我已经反复说过，那不重要；唯一重要的是……什么？跟我一起说……唯一重要的是函数是*如何*被调用的。

那么 `clickHandler` 是如何被调用的？调用位置是什么，它匹配哪条上下文赋值规则？

### 视线之外 (Hidden From Sight)

如果你卡住了，别担心。我故意让它变得困难，为了指出非常重要的一点。

当 `"click"` 或 `onClick=` 事件处理程序绑定发生时，在两种情况下，我们都指定了 `this.clickHandler`，这意味存在一个 `this` 上下文对象，上面有一个名为 `clickHandler` 的属性，该属性持有我们的函数定义。

那么，`this.clickHandler` 是调用位置吗？如果是，应用什么赋值规则？*隐式上下文*规则 (#3)？

不幸的是，不。

问题是，**我们实际上无法在这个程序中看到调用位置**。哦，糟糕。

如果我们看不到调用位置，我们怎么知道函数实际上将*如何*被调用？

*这*正是我要表达的观点。

我们传入了 `this.clickHandler` 并不重要。那仅仅是对一个函数对象值的引用。它不是一个调用位置。

在幕后，在框架、库甚至是 JS 环境本身的某个地方，当用户点击按钮时，对 `clickHandler(..)` 函数的引用将被调用。正如我们暗示的那样，那个调用位置甚至会将 DOM 事件对象作为 `evt` 参数传入。

既然我们看不到调用位置，我们必须*想象*它。它可能看起来像……？

```js
// ..
eventCallback( domEventObj );
// ..
```

如果是这样，哪条 `this` 规则适用？*默认上下文*规则 (#4)？

或者，如果调用位置看起来像这样……？

```js
// ..
eventCallback.call( domElement, domEventObj );
```

现在哪条 `this` 规则适用？*显式上下文*规则 (#2)？

除非你打开并查看框架/库的源代码，或者阅读文档/规范，否则你不会*知道*那个调用位置会是什么样。这意味着，最终预测你编写的 `clickHandler` 函数中的 `this` 指向什么，是……委婉地说……有点复杂的。

### *This* 是错的 (*This* Is Wrong)

为了让你不再痛苦，我将直奔主题。

几乎所有点击处理程序的实现都会做类似 `.call(..)` 的事情，并且它们会将事件监听器绑定的 DOM 元素（例如，按钮）设置为调用的*显式上下文*。

嗯……这没问题吗，还是会是个问题？

回想一下，我们的 `clickHandler(..)` 函数是 `this`-aware 的，并且它的 `this.theFormElem` 引用意味着引用一个具有 `theFormElem` 属性的对象，该属性反过来指向父 `<form>` 元素。DOM 按钮默认情况下并没有 `theFormElem` 属性。

换句话说，我们的事件处理程序将设置的 `this` 引用几乎肯定是错误的。哎呀。

除非我们想重写 `clickHandler` 函数，否则我们需要通过解决那个问题。

### 修复 `this` (Fixing `this`)

让我们考虑一些解决这种错误赋值的选项。为了保持专注，我在讨论中将坚持使用这种事件绑定风格：

```js
this.submitBtnaddEventListener(
    "click",
    this.clickHandler,
    false
);
```

这是一种解决方法：

```js
// 存储当前 `this` 上下文的固定引用
var context = this;

this.submitBtn.addEventListener(
    "click",
    function handler(evt){
        return context.clickHandler(evt);
    },
    false
);
```

| 提示: |
| :--- |
| 大多数使用这种方法的旧 JS 代码会说类似 `var self = this` 的话，而不是我这里给出的 `context` 名称。“Self”是一个更短的词，听起来更酷。但它的语义也完全错误。`this` 关键字不是对函数的“自身 (self)”引用，而是当前函数调用的上下文。乍一看它们可能看起来是一回事，但它们是完全不同的概念，就像苹果和披头士的歌一样不同。所以……借用他们的话，“嘿开发者，don't make it bad。把悲伤的 `self` 变成更好的 `context`。” |

这里发生了什么？我意识到外层代码，即 `addEventListener` 调用将运行的地方，有一个正确的当前 `this` 上下文，我们需要确保当 `clickHandler(..)` 被调用时应用相同的 `this` 上下文。

我定义了一个外围函数（`handler(..)`），然后强制调用位置看起来像：

```js
context.clickHandler(evt);
```

| 提示: |
| :--- |
| 这里应用了哪条 `this` 上下文赋值规则？没错，是*隐式上下文*规则 (#3)。 |

现在，库/框架/环境的内部调用位置是什么样子并不重要。但是，为什么？

因为我们现在*实际上*控制了调用位置。`handler(..)` 如何被调用，或者它的 `this` 被分配了什么都不重要。重要的是当 `clickHandler(..)` 被调用时，`this` 上下文被设置为我们想要的。

我实现那个技巧不仅通过定义一个外围函数（`handler(..)`）以便我可以控制调用位置，而且……这很重要，所以别错过了……我将 `handler(..)` 定义为一个**非**-`this`-aware 函数！`handler(..)` 内部没有 `this` 关键字，所以无论库/框架/环境设置（或不设置）什么 `this`，都完全无关紧要。

`var context = this` 这一行对这个技巧至关重要。它定义了一个词法变量 `context`，它不是什么特殊的关键字，持有外部 `this` 值的快照。然后在 `clickHandler` 内部，我们仅仅引用一个词法变量（`context`），而不是相对的/魔法的 `this` 关键字。

### 词法 This (Lexical This)

顺便说一句，这种模式的名称是“词法 this (lexical this)”，意思是 `this` 的行为像一个词法作用域变量，而不是像一个动态上下文绑定。

但事实证明，JS 有一种更简单的方法来执行“词法 this”魔术。你准备好揭秘了吗！？

...

`=>` 箭头函数！哒哒！

没错，与所有其他函数形式不同，`=>` 函数是特殊的，特殊在于它一点也不特殊。或者更确切地说，它根本没有为 `this` 行为定义任何特殊的东西。

在 `=>` 函数中，`this` 关键字……**不是一个关键字**。它与任何其他变量绝对没有区别，就像 `context` 或 `happyFace` 或 `foobarbaz` 一样。

让我更直接地说明*这*一点：

```js
function outer() {
    console.log(this.value);

    // 定义并返回一个“内部”
    // 函数
    var inner = () => {
        console.log(this.value);
    };

    return inner;
}

var one = {
    value: 42,
};
var two = {
    value: "sad face",
};

var innerFn = outer.call(one);
// 42

innerFn.call(two);
// 42   <-- 不是 "sad face"
```

对于任何*常规*函数定义，`innerFn.call(two)` 本应该导致 `"sad face"`。但由于我们定义并返回（并赋值给 `innerFn`）的 `inner` 函数是一个*非常规* `=>` 箭头函数，它没有特殊的 `this` 行为，而是具有“词法 this”行为。

当 `innerFn(..)`（也就是 `inner(..)`) 函数被调用时，即使通过 `.call(..)` 进行了*显式上下文*赋值，该赋值也会被忽略。

| 注意: |
| :--- |
| 我不确定为什么 `=>` 箭头函数甚至有 `call(..)` / `apply(..)`，因为它们是静默的空操作函数。我猜这是为了与普通函数保持一致。但正如我们稍后将看到的，*常规*函数和*非常规* `=>` 箭头函数之间还有其他不一致之处。 |

当在 `=>` 箭头函数内部遇到 `this` (`this.value`) 时，`this` 被视为普通词法变量，而不是特殊关键字。由于该函数本身没有 `this` 变量，JS 会做它对词法变量一贯做的事情：它向上查找一级词法作用域 —— 在这种情况下，是外围的 `outer(..)` 函数，并检查该作用域中是否有任何已注册的 `this`。

幸运的是，`outer(..)` 是一个*常规*函数，这意味着它有一个正常的 `this` 关键字。而 `outer.call(one)` 调用将 `one` 分配给了它的 `this`。

所以，`innerFn.call(two)` 正在调用 `inner()`，但当 `inner()` 查找 `this` 的值时，它得到的是…… `one`，而不是 `two`。

#### 回到……按钮 (Back To The... Button)

你以为如果你我要在那里讲个双关笑话然后说“未来 (future)”吗，是不是！？

解决我们之前问题的更直接和合适的方法，即我们之前用 `var context = this` 来获得某种伪造的“词法 this”行为，现在是使用 `=>` 箭头函数，因为它的主要设计特性就是……“词法 this”。

```js
this.submitBtn.addEventListener(
    "click",
    evt => this.clickHandler(evt),
    false
);
```

Boom！问题解决了！扔麦克风！

听我说：`=>` 箭头函数*不是* —— 我重复一遍，*不是* —— 为了少打几个字。将 `=>` 函数添加到 JS 的主要目的是给我们“词法 this”行为，而无需诉诸 `var context = this`（或更糟糕的 `var self = this`）风格的黑客手段。

| 提示: |
| :--- |
| 如果你需要“词法 this”，总是首选 `=>` 箭头函数。如果你不需要“词法 this”，那么…… `=>` 箭头函数可能不是这份工作的最佳工具。|

#### 坦白时间 (Confession Time)

我在本章中一直说，你如何编写一个函数，以及你在哪里编写该函数，与其 `this` 将被分配成什么*毫无关系*。

对于常规函数，那是真的。但是当我们考虑非常规 `=>` 箭头函数时，这就不完全准确了。

还记得本章早些时候 `clickHandler` 的原始 `=>` 形式吗？

```js
const clickHandler = evt =>
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
```

如果我们使用这种形式，在该事件绑定的相同上下文中，它可能看起来像这样：

```js
const clickHandler = evt =>
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();

this.submitBtn.addEventListener("click",clickHandler,false);
```

许多开发者甚至更喜欢进一步简化它，变成内联 `=>` 箭头函数：

```js
this.submitBtn.addEventListener(
    "click",
    evt => evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation(),
    false
);
```

当我们编写一个 `=>` 箭头函数时，我们确切地知道它的 `this` 绑定将完全是任何正在运行的外围函数的当前 `this` 绑定，而不管 `=>` 箭头函数的调用位置是什么样子的。换句话说，我们*如何*编写 `=>` 箭头函数，以及我们在*哪里*编写它，确实很重要。

但这并没有完全回答 `this` 的问题。它只是将问题转移到了*外围函数是如何被调用的*。实际上，关注调用位置仍然是唯一重要的事情。

但我直到*现在*才坦白的细微差别是：重要的是我们考虑*哪个*调用位置，而不仅仅是当前调用栈中的*任何*调用位置。重要的调用位置是，当前调用栈中最近的***实际分配 `this` 上下文***的函数调用。

由于 `=>` 箭头函数永远没有 `this` 分配调用位置（无论如何），该调用位置与问题无关。我们必须继续向上查找调用栈，直到找到一个*是* `this` 分配的函数调用 —— 即使该被调用的函数本身不是 `this`-aware 的。

**那**才是唯一重要的调用位置。

#### 找到正确的调用位置 (Find The Right Call-Site)

让我用一堆嵌套函数/调用的复杂混乱来举例说明：

```js
globalThis.value = { result: "Sad face" };

function one() {
    function two() {
        var three = {
            value: { result: "Hmmm" },

            fn: () => {
                const four = () => this.value;
                return four.call({
                    value: { result: "OK", },
                });
            },
        };
        return three.fn();
    };
    return two();
}

new one();          // ???
```

你能通过脑内模拟运行那个（噩梦）并确定 `new one()` 调用将返回什么吗？

它可能是以下任何一个：

```js
// 来自 `four.call(..)`:
{ result: "OK" }

// 或者, 来自 `three` 对象:
{ result: "Hmmm" }

// 或者, 来自 `globalThis.value`:
{ result: "Sad face" }

// 或者, 来自 `new` 调用的空对象:
{}
```

那个 `new one()` 调用的调用栈是：

```
four         |
three.fn     |
two          | (this = globalThis)
one          | (this = {})
[ global ]   | (this = globalThis)
```

由于 `four()` 和 `fn()` 都是 `=>` 箭头函数，`three.fn()` 和 `four.call(..)` 调用位置不是 `this` 分配的；因此，它们与我们的查询无关。调用栈中下一个要考虑的调用是什么？`two()`。那是一个常规函数（它可以接受 `this` 分配），并且调用位置匹配*默认上下文*赋值规则 (#4)。由于我们不在严格模式下，`this` 被分配为 `globalThis`。

当 `four()` 运行时，`this` 只是一个普通变量。然后它查找其包含函数 (`three.fn()`)，但再次发现一个没有 `this` 的函数。所以它再上一层，找到一个定义了 `this` 的 `two()` *常规*函数。那个 `this` 是 `globalThis`。所以 `this.value` 表达式解析为 `globalThis.value`，它返回给我们…… `{ result: "Sad face" }`。

...

深呼吸。我知道这需要很多脑力来处理。公平地说，那是一个超级做作的例子。你几乎永远不会看到所有这些复杂性混合在一个调用栈中。

但你绝对会在实际程序中发现混合的调用栈。你需要适应我刚刚展示的分析，能够解开调用栈，直到找到最近的 `this` 分配调用位置。

记住我早些时候引用的格言：“能力越大，责任越大”。选择面向 `this` 的代码（即使是 `class`）意味着既选择了它提供给我们的灵活性，也需要能够自如地浏览调用栈以了解它将如何行为。

那是有效编写（以及后来阅读！）`this`-aware 代码的唯一方法。

### 必然会发生 (This Is Bound To Come Up)

稍微倒回去一点，如果你不想使用 `=>` 箭头函数的“词法 this”行为来解决按钮事件处理程序功能，还有另一个选项。

除了 `call(..)` / `apply(..)` —— 记住，这些会调用函数！ —— JS 函数还有内置的第三个工具，称为 `bind(..)` —— 明确地说，它*不*调用函数。

`bind(..)` 工具定义了一个*新的*包装/绑定版本的函数，其中 `this` 被预设且固定，不能被 `call(..)` 或 `apply(..)`，甚至调用位置的*隐式上下文*对象覆盖：

```js
this.submitBtn.addEventListener(
    "click",
    this.clickHandler.bind(this),
    false
);
```

由于我传入了一个 `this` 绑定函数作为事件处理程序，同样地，该工具试图如何设置 `this` 并不重要，因为我已经强制 `this` 为我想要的：来自外围函数调用上下文的 `this` 值。

#### 并不新鲜 (Hardly New)

这种模式通常被称为“硬绑定 (hard binding)”，因为我们创建了一个强绑定到特定 `this` 的函数引用。很多 JS 文章声称 `=>` 箭头函数本质上只是 `bind(this)` 硬绑定的语法。其实不是。让我们深入了解一下。

如果你要创建一个 `bind(..)` 工具，它可能看起来有点像*这样*：

```js
function bind(fn,context) {
    return function bound(...args){
        return fn.apply(context,args);
    };
}
```

| 注意: |
| :--- |
| 这实际上不是 `bind(..)` 的实现方式。其行为更复杂且细微。我在这里只是说明其行为的一部分。 |

那看起来眼熟吗？它使用的是老套的伪造“词法 this”黑客手段。在幕后，这是一个*显式上下文*赋值，在本例中通过 `apply(..)`。

等一下……这不就是意味着我们可以用 `=>` 箭头函数来做吗？

```js
function bind(fn,context) {
    return (...args) => fn.apply(context,args);
}
```

呃……不完全是。正如 JS 中的大多数事物一样，有一点细微差别。让我说明一下：

```js
// 候选实现，用于比较
function fakeBind(fn,context) {
    return (...args) => fn.apply(context,args);
}

// 测试对象
function thisAwareFn() {
    console.log(`Value: ${this.value}`);
}

// 控制数据
var obj = {
    value: 42,
};

// 实验
var f = thisAwareFn.bind(obj);
var g = fakeBind(thisAwareFn,obj);

f();            // Value: 42
g();            // Value: 42

new f();        // Value: undefined
new g();        // <--- ???
```

首先，看 `new f()` 调用。诚然，在硬绑定函数上调用 `new` 是一种奇怪的用法。你可能很少会这样做。但这展示了一些有点有趣的东西。即使 `f()` 被硬绑定到 `obj` 的 `this` 上下文，`new` 操作符也能够劫持硬绑定函数的 `this` 并将其重新绑定到新创建的空对象。该对象没有 `value` 属性，这就是为什么我们看到打印出 `"Value: undefined"` 的原因。

如果那感觉很奇怪，我同意。这是一个奇怪的角落细节。这可能不是你会利用的东西。但我指出这一点不仅仅是为了琐事。回顾本章前面提出的四条规则。还记得我如何断言它们的优先顺序吗？`new` 在顶部 (#1)，先于*显式* `call(..)` / `apply(..)` 赋值规则 (#2)？

既然我们可以某种程度上把 `bind(..)` 视为那条规则的变体，我们现在看到了优先顺序得到了证实。`new` 比硬绑定函数更优先，并且可以覆盖它。是不是有点让你觉得硬绑定函数也许没那么“硬”绑定，嗯？！

但是……`new g()` 调用会发生什么，它是在返回的 `=>` 箭头函数上调用 `new`？你预测结果和 `new f()` 一样吗？

抱歉让你失望了。

那一行实际上会抛出一个异常，因为 `=>` 函数不能与 `new` 关键字一起使用。

但为什么？我最好的回答，毕竟我不是 TC39 权威，是概念上和实际上，`=>` 箭头函数不是具有硬绑定 `this` 的函数，它是一个根本没有 `this` 的函数。因此，针对这种函数使用 `new` 毫无意义，所以 JS 只是不允许它。

| 注意: |
| :--- |
| 回想一下之前，当时我指出 `=>` 箭头函数有 `call(..)`、`apply(..)`，甚至实际上有 `bind(..)`。但我们已经看到这些工具基本上作为无操作 (no-ops) 被忽略了。在我看来，这有点奇怪，`=>` 箭头函数拥有所有这些作为透传无操作的工具，但对于 `new` 关键字，那不仅仅是，再次，一个无操作透传，而是被异常禁止了。 |

但要点是：`=>` 箭头函数*不是* `bind(this)` 的语法形式。

### 输掉这场战斗 (Losing This Battle)

再次回到我们的按钮事件处理程序示例：

```js
this.submitBtnaddEventListener(
    "click",
    this.clickHandler,
    false
);
```

我们还有一个尚未解决的更深层次的担忧。

我们已经看到了几种构建不同回调函数引用的不同方法，以代替 `this.clickHandler` 传入。

但无论我们选择哪种方式，它们实际上都在产生一个不同的函数，而不仅仅是我们现有 `clickHandler` 函数的原地修改。

为什么这很重要？

嗯，首先，我们创建（及重新创建）的函数越多，我们消耗的处理时间（非常少）和内存（通常很小）就越多。当我们重新创建函数引用并丢弃旧引用时，这也会留下未回收的内存，这将给垃圾回收器 (GC) 施加压力，要求其更频繁地暂时暂停我们程序的世界，同时清理和回收该内存。

如果挂钩这个事件监听是一次性操作，那没什么大不了的。但如果这种情况一遍又一遍地发生，系统级性能影响*确实*会开始累加。有没有遇到过原本流畅的动画抖动？那可能是 GC 介入，清理一堆可回收内存。

但另一个担忧是，对于像事件处理程序这样的事情，如果我们以后要移除事件监听器，我们需要保留对最初附加的完全相同的函数的引用。如果我们使用的是库/框架，通常（但不总是！）它们会为你处理那个小的脏活细节。但在其他情况下，我们有责任确保无论我们要附加什么函数，我们都要保留引用以防以后需要它。

所以我要表达的观点是：预设 `this` 赋值，无论你如何做，以使其可预测，都是有代价的。系统级代价和程序维护/复杂性代价。它*绝不是*免费的。

一种应对事实的方法是决定，好吧，我们只是要提前一次性制造所有那些 `this` 赋值的函数引用。这样，我们肯定能将系统压力和代码压力都降到最低。

听起来很合理，对吧？别急。

#### 预绑定函数上下文 (Pre-Binding Function Contexts)

如果你有一个一次性的需要 `this` 绑定的函数引用，并且你使用 `=>` 箭头或 `bind(this)` 调用，我觉得那没什么问题。

但是，如果你的代码片段中的大多数或所有 `this`-aware 函数以 `this` 不是你预期的可预测上下文的方式被调用，因此你决定你需要对其全部进行硬绑定……我认为这是一个很大的警告信号，表明你的做法是错误的。

请回想第 3 章“避免 This (Avoid This)”部分中的讨论，该部分以这段代码开始：

```js
class Point2d {
    x = null
    getDoubleX = () => this.x * 2

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);
```

现在想象我们对那段代码这样做了：

```js
const getX = point.getDoubleX;

// 稍后，在其他地方

getX();         // 6
```

如你所见，我们要解决的问题与我们在本章中一直处理的问题相同。那就是我们希望能够调用像 `getX()` 这样的函数引用，并让它*意味着*和*表现得像* `point.getDoubleX()`。但*常规*函数上的 `this` 规则不是那样工作的。

所以我们使用了 `=>` 箭头函数。没什么大不了的，对吧！？

错。

真正的根本问题是我们想从代码中得到两件相互冲突的东西，而我们试图用同一把*锤子*来敲这两颗*钉子*。

我们希望在 `class` 原型上存储一个 `this`-aware 方法，这样函数的定义就只有一个，并且我们所有的子类和实例都很好地共享同一个函数。它们共享的方式是通过动态 `this` 绑定的力量。

但与此同时，我们*也*希望当我们将这些函数引用传递给负责调用位置的其他代码时，这些函数引用能神奇地保持 `this` 赋值给我们的实例。

换句话说，有时我们希望像 `point.getDoubleX` 这样的东西意味着，“给我一个 `this` 赋值给 `point` 的引用”，而其他时候我们希望相同的表达式 `point.getDoubleX` 意味着，给我一个动态 `this` 可赋值的函数引用，以便它可以在此刻正确地获得我需要的上下文。

也许 JS 可以提供一个除了 `.` 之外的不同的操作符，比如 `::` 或 `->` 或类似的东西，它可以让你区分你想要什么样的函数引用。实际上，有一个长期存在的 `this` 绑定操作符 (`::`) 的提案，它时不时会引起关注，然后似乎又停滞不前。谁知道呢，也许有一天这样的操作符终于落地，我们将有更好的选择。

但我强烈怀疑，即使有一天它落地了，它也会提供一个全新的函数引用，就像我们已经谈论过的 `=>` 或 `bind(this)` 方法一样。它不会作为一个免费且完美的解决方案出现。在希望同一个函数有时 `this` 灵活，有时 `this` 可预测之间总是会存在张力。

面向 `class` 代码的 JS 作者迟早会经常遇到这种确切的张力。你知道他们做什么吗？

他们不考虑简单地将类的所有 `this`-aware 方法预绑定为成员属性中的 `=>` 箭头函数的*成本*。他们没有意识到这完全挫败了 `[[Prototype]]` 链的整个目的。他们也没有意识到如果固定上下文是他们*真正需要*的，JS 中有一种完全不同的机制更适合该目的。

#### 采取更批判的眼光 (Take A More Critical Look)

所以当你做这种事情时：

```js
class Point2d {
    x = null
    y = null
    getDoubleX = () => this.x * 2
    toString = () => `(${this.x},${this.y})`

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

var point = new Point2d(3,4);
var anotherPoint = new Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();            // 6
g();            // (5,6)
```

我说，“呸！(ick!)”，对于那里硬绑定的 `this`-aware 方法 `getDoubleX()` 和 `toString()`。对我来说，那是一种代码异味 (code smell)。但这还有一种过去被许多开发者青睐的更*糟糕*的方法：

```js
class Point2d {
    x = null
    y = null

    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.getDoubleX = this.getDoubleX.bind(this);
        this.toString = this.toString.bind(this);
    }
    getDoubleX() { return this.x * 2; }
    toString() { return `(${this.x},${this.y})`; }
}

var point = new Point2d(3,4);
var anotherPoint = new Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();            // 6
g();            // (5,6)
```

双倍的呸。

在这两种情况下，你都在使用 `this` 机制，但通过剥夺 `this` 所有的强大动态性，完全背叛/阉割了它。

你真的应该至少考虑这另一种方法，它完全跳过了整个 `this` 机制：

```js
function Point2d(px,py) {
    var x = px;
    var y = py;

    return {
        getDoubleX() { return x * 2; },
        toString() { return `(${x},${y})`; }
    };
}

var point = Point2d(3,4);
var anotherPoint = Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();            // 6
g();            // (5,6)
```

你看到了吗？没有丑陋或复杂的 `this` 来搞乱代码或担心边缘情况。词法作用域超级直观和容易理解。

当我们想要的只是让我们的大多数/所有函数行为具有固定和可预测的上下文时，最合适的解决方案，最直接甚至性能最好的解决方案，是词法变量和作用域闭包。

当你费尽心思将 `this` 引用撒满一段代码，然后用 `=>` “词法 this”或 `bind(this)` 在膝盖处切断整个机制时，你选择使代码更冗长、更复杂、更矫揉造作。除了跟随 `this`（和 `class`）的潮流之外，你没有从中得到任何更有益的东西。

...

深呼吸。让自己冷静下来。

我在对自己说话，不是对你。但如果我刚才说的话让你感到不安，那我也是在对你说话！

好的，听着。那只是我的意见。如果你不同意，那很好。但在你决定想要得出什么结论时，请像我一样，运用同样严谨的程度去思考这些机制是如何工作的。

## 变体 (Variations)

在我们结束对 `this` 的冗长讨论之前，我们需要讨论关于函数调用的几个非常规变体。

### 间接函数调用 (Indirect Function Calls)

还记得本章前面的这个例子吗？

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) { /* .. */ },
    toString() { /* .. */ },
};

var init = point.init;
init(3,4);                  // 坏了!
```

这是坏的，因为 `init(3,4)` 调用位置没有提供必要的 `this` 赋值信号。但还有其他方法可以观察到类似的破坏。例如：

```js
(1,point.init)(3,4);        // 坏了!
```

这种看起来奇怪的语法首先计算表达式 `(1,point.init)`，这是一个逗号序列表达式。此类表达式的结果是最终的计算值，在本例中是函数引用（由 `point.init` 持有）。

所以结果将该函数值放在表达式栈上，然后用 `(3,4)` 调用该值。那是对函数的间接调用。结果是什么？它实际上匹配了我们之前在本章中看到的*默认上下文*赋值规则 (#4)。

因此，在非严格模式下，`point.init(..)` 调用的 `this` 将是 `globalThis`。如果我们处于严格模式下，它将是 `undefined`，并且 `this.x = x` 操作随后会抛出异常，因为非法访问了 `undefined` 值上的 `x` 属性。

有几种不同的方法可以进行间接函数调用。例如：

```js
(()=>point.init)()(3,4);    // 坏了!
```

间接函数调用的另一个例子是立即调用函数表达式 (IIFE) 模式：

```js
(function(){
    // `this` 通过"默认"规则分配
})();
```

如你所见，函数表达式值被放在表达式栈上，然后在末尾用 `()` 调用。

但是这段代码呢：

```js
(point.init)(3,4);
```

那段代码的结果会是什么？

根据我们在前面的例子中看到的相同推理，`point.init` 表达式将函数值放在表达式栈上，然后用 `(3,4)` 间接调用，这似乎是合理的。

但不完全是！JS 语法有一条特殊规则来处理调用形式 `(someIdentifier)(..)`，就像它是 `someIdentifier(..)` 一样（标识符名称周围没有 `(..)`）。

想知道为什么你会想要通过间接函数调用强制 `this` 赋值为*默认上下文*吗？

### 访问 `globalThis` (Accessing `globalThis`)

在我们回答这个问题之前，让我们介绍另一种执行间接函数 `this` 赋值的方法。到目前为止，显示的间接函数调用模式对严格模式很敏感。但是如果我们想要一种不遵守严格模式的间接函数 `this` 赋值呢。

`Function(..)` 构造函数接受一串代码并动态定义等效函数。然而，它总是像在全局作用域中声明该函数一样执行。此外，它确保此类函数*不*在严格模式下运行，无论程序的严格模式状态如何。这与运行间接调用结果相同。

这种严格模式无关的间接函数 `this` 赋值的一个小众用法是在 JS 规范实际定义 `globalThis` 标识符之前（例如，在它的 polyfill 中）获得对真实全局对象的可靠引用：

```js
"use strict";

var gt = new Function("return this")();
gt === globalThis;                      // true
```

实际上，使用逗号操作符技巧（见上一节）和 `eval(..)` 也可以得到类似的结果：

```js
"use strict";

function getGlobalThis() {
    return (1,eval)("this");
}

getGlobalThis() === globalThis;      // true
```

| 注意: |
| :--- |
| `eval("this")` 会对严格模式敏感，但 `(1,eval)("this")` 不会，因此在任何程序中都能可靠地给我们 `globalThis`。 |

不幸的是，`new Function(..)` 和 `(1,eval)(..)` 方法都有一个重要的限制：如果应用程序是在某些内容安全策略 (CSP) 限制下服务的，禁止动态代码评估（出于安全原因），那么在基于浏览器的 JS 代码中，该代码将被阻止。

我们可以绕过这个吗？是的，基本上可以。[^globalThisPolyfill]

JS 规范说，定义在全局对象或任何继承自它的对象（如 `Object.prototype`）上的 getter 函数，在运行 getter 函数时会将 `this` 上下文分配给 `globalThis`，无论程序的严格模式如何。

```js
// 改编自: https://mathiasbynens.be/notes/globalthis#robust-polyfill
function getGlobalThis() {
    Object.defineProperty(Object.prototype,"__get_globalthis__",{
        get() { return this; },
        configurable: true
    });
    var gt = __get_globalthis__;
    delete Object.prototype.__get_globalthis__;
    return gt;
}

getGlobalThis() === globalThis;      // true
```

是的，那真是太粗糙了。但这就是给你的 JS `this`！

### 模板标签函数 (Template Tag Functions)

还有一种我们需要涵盖的函数调用的不寻常变体：带标签的模板函数。

模板字符串 —— 我更喜欢称之为插值字面量 —— 可以用前缀函数“标记”，该函数会用模板字面量的解析内容进行调用：

```js
function tagFn(/* .. */) {
    // ..
}

tagFn`actually a function invocation!`;
```

如你所见，没有 `(..)` 调用语法，只是标签函数 (`tagFn`) 出现在 `` `template literal` `` 之前；它们之间允许有空格，但这很不常见。

尽管外观奇怪，函数 `tagFn(..)` 将被调用。它被传递了从模板字面量解析出的一个或多个字符串字面量列表，以及遇到的任何插值表达式值。

我们不打算涵盖带标签的模板函数的所有细节 —— 它们确实是 JS 添加的最强大和有趣的功能之一 —— 但既然我们在讨论函数调用中的 `this` 赋值，为了完整性起见，我们需要谈谈 `this` 将如何被赋值。

你可能遇到的标签函数的另一种形式是：

```js
var someObj = {
    tagFn() { /* .. */ }
};

someObj.tagFn`also a function invocation!`;
```

这是一个简单的解释：`` tagFn`..` `` 和 `` someObj.tagFn`..` `` 将分别具有对应于调用位置如 `tagFn(..)` 和 `someObj.tagFn(..)` 的 `this` 赋值行为。换句话说，`` tagFn`..` `` 遵循*默认上下文*赋值规则 (#4)，而 `` someObj.tagFn`..` `` 遵循*隐式上下文*赋值规则 (#3)。

通过我们很幸运，我们不需要担心 `new` 或 `call(..)` / `apply(..)` 赋值规则，因为这些形式对于标签函数是不可能的。

应该指出的是，将带标签的模板函数定义为 `this`-aware 是非常罕见的，所以你不太可能需要应用这些规则。但以防万一，现在你*知道*了。

## 保持感知 (Stay Aware)

所以，那是 `this`。我敢打赌，对于你们中的许多人来说，这比你们预期的要……我们可以说，更复杂一些……

好消息，也许，是在实践中你通常不会被所有这些不同的复杂性绊倒。但你使用 `this` 越多，就越需要你以及你的代码读者了解它实际上是如何工作的。

这里的教训是，在你把 `this` 撒遍代码之前，你应该有意识地了解 `this` 的所有方面。确保你最有效地使用它，并充分利用 JS 的这一重要支柱。

[^globalThisPolyfill]: "A horrifying globalThis polyfill in universal JavaScript"; Mathias Bynens; April 18 2019; https://mathiasbynens.be/notes/globalthis#robust-polyfill ; Accessed July 2022