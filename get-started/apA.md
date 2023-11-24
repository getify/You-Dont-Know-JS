# 你并不了解 JavaScript：入门 - 第二版

# 附录 A：欲穷千里目，更上一层楼

在本附录中，我们将对主要章节文本中的一些主题进行更详细的探讨。把这些内容看作是本系列书籍其余部分所涉及的一些更细微的细节的可选预览。

## 值 vs 引用

在第二章中，我们介绍了两种主要的值类型：基本类型和对象。但我们还没有讨论这两者之间的一个关键区别：这些值是如何被分配和传递的。

在许多语言中，开发者可以选择将一个值作为值本身进行赋值/传递，或者作为值的引用。然而，在 JS 中，这个决定完全由值的类型决定。这让很多来自其他语言的开发者在开始使用 JS 时感到惊讶。

如果你分配/传递一个值本身，这个值就被复制了。比如说：

```js
var myName = "Kyle";

var yourName = myName;
```

在这里，`yourName` 变量有一个单独的 `"Kyle"` 字符串的副本，与存储在 `myName` 中的值不同。这是因为该值是一个基本类型，而基本类型值总是作为**值副本**被分配/传递。

下面是你如何证明有两个独立的值的参考：

```js
var myName = "Kyle";

var yourName = myName;

myName = "Frank";

console.log(myName);
// Frank

console.log(yourName);
// Kyle
```

看到了吗？ `yourName` 没有受到 `myName` 重新分配到 `"Frank"` 的影响。这是因为每个变量都有自己的值的副本。

相比之下，引用是指两个或更多的变量指向同一个值，这样修改这个共享的值就会通过任何一个引用的访问反映出来。在 JS 中，只有对象值（数组、对象、函数等）被视为引用。

假设以下代码：

```js
var myAddress = {
    street: "123 JS Blvd",
    city: "Austin",
    state: "TX",
};

var yourAddress = myAddress;

// 我要搬到新房子里去!
myAddress.street = "456 TS Ave";

console.log(yourAddress.street);
// 456 TS Ave
```

因为分配给 `myAddress` 的值是一个对象，它是通过引用持有/分配的，因此分配给 `yourAddress` 变量的是一个引用的拷贝，而不是对象值本身。这就是为什么当我们访问 `yourAddress.street` 时，分配给 `myAddress.street` 的更新值被反映出来。`myAddress` 和 `yourAddress` 都有对单一共享对象的引用副本，所以对其中一个的更新就是对两个的更新。

同样，JS 根据值的类型来选择值复制和引用复制的行为。基本类型是通过值持有的，对象是通过引用持有的。在 JS 中没有办法重写这一点，无论哪种。

## 千变万化的函数

回顾一下第二章中的这个片段：

```js
var awesomeFunction = function (coolThings) {
    // ..
    return amazingStuff;
};
```

这里的函数表达式被称为*匿名函数表达式*，因为它在 `function` 关键字和 `(..)` 参数列表之间没有名称标识。这一点让很多 JS 开发者感到困惑，因为从 ES6 开始，JS 对匿名函数进行了「名称推断」：

```js
awesomeFunction.name;
// "awesomeFunction"
```

一个函数的 `name` 属性将显示其直接给出的名称（在声明的情况下）或在匿名函数表达式的情况下推断出的名称。开发者工具在检查函数值或报告错误堆栈跟踪时通常使用该值。

因此，即使是一个匿名的函数表达式也可能得到一个名字。然而，名字推理只发生在有限的情况下，例如当函数表达式被赋值时（用 `=`）。如果你将一个函数表达式作为参数传递给一个函数调用，就不会发生名称推理；`name` 属性将是一个空字符串，开发者控制台通常会报告为「（匿名函数/ anonymous function）」。

即使推断出了一个名字，**它仍然是一个匿名函数**。为什么？因为推断出来的名字是一个元数据字符串值，而不是一个可用来引用函数的标识符。一个匿名函数没有一个标识符可以用来从自身内部引用它，用于递归、事件解除绑定等。

将匿名函数的表达形式比作如下代码：

```js
// let awesomeFunction = ..
// const awesomeFunction = ..
var awesomeFunction = function someName(coolThings) {
    // ..
    return amazingStuff;
};

awesomeFunction.name;
// "someName"
```

这个函数表达式是一个*命名的函数表达式*，因为标识符 `someName` 在编译时直接与函数表达式相关联；与标识符 `awesomeFunction` 的关联直到运行时才发生在该语句中。这两个标识符不一定要匹配；有时让它们不同是有意义的，更多时候让它们相同是最佳的。

还要注意的是，在为 `name` 属性指定 _name_ 时，显式函数名，即标识符 `someName`，具有优先权。

函数表达式应该是命名的还是匿名的？在这个问题上，人们的看法大相径庭。大多数开发者倾向于不关心并使用匿名函数。它们更短，而且在广泛的 JS 代码领域无疑更常见。

在我看来，如果一个函数存在于你的程序中，它就有一个目的；否则，就把它去掉！如果它有一个目的，它就有一个自然的名字来描述这个目的！

如果一个函数有一个名字，你这个代码作者应该在代码中包含这个名字，这样读者就不必通过阅读和心理执行该函数的源代码来推断这个名字。即使是像 `x * 2` 这样的微不足道的函数，也必须通过阅读来推断出一个像 "double" 或 "multBy2" 这样的名字；当你只需花一秒钟来命名该函数为 "double" 或 "multBy2" *一次*时，这种短暂的额外的脑力劳动是不必要的，这样可以节省读者今后每次阅读时的重复脑力劳动。

遗憾的是，在某些方面，截至 2020 年初，JS 中还有许多其他的函数定义形式（也许将来会有更多！）。

下面是一些更多的声明形式：

```js
// 声明 generator 函数
function *two() { .. }

// 声明 async 函数
async function three() { .. }

// 声明 async generator 函数
async function *four() { .. }

// 声明导出的命名函数 (ES6 模块化)
export function five() { .. }
```

这里还有一些（更多！）表达形式：

```js
// IIFE（立即调用函数表达式）
(function(){ .. })();
(function namedIIFE(){ .. })();

// 异步 IIFE
(async function(){ .. })();
(async function namedAIIFE(){ .. })();

// 箭头函数表达式
var f;
f = () => 42;
f = x => x * 2;
f = (x) => x * 2;
f = (x,y) => x * y;
f = x => ({ x: x * 2 });
f = x => { return x * 2; };
f = async x => {
    var y = await doSomethingAsync(x);
    return y * 2;
};
someOperation( x => x * 2 );
// ..
```

请记住，箭头函数表达式是**语法匿名**的，这意味着该语法不提供为函数提供直接名称标识的方法。函数表达式可以得到一个推断的名字，但只有当它是赋值形式之一时，而不是作为函数调用参数传递的（更常见！）形式（如片段的最后一行）。

由于我认为在你的程序中频繁使用匿名函数不是一个好主意，所以我不喜欢使用 `=>` 箭头函数。这种函数实际上有一个特定的用途（即以词法处理 `this` 关键字），但这并不意味着我们应该将它用于我们编写的每一个函数。应当为每项工作使用最合适的工具。

函数也可以在类定义和对象字面定义中指定。在这些形式中，它们通常被称为「方法」，尽管在 JS 中，这个术语与「函数」没有什么明显的区别：

```js
class SomethingKindaGreat {
    // 类的方法
    coolMethod() { .. }   // 不加逗号！
    boringMethod() { .. }
}

var EntirelyDifferent = {
    // object methods
    coolMethod() { .. },   // 需要逗号！
    boringMethod() { .. },

    // (匿名) 函数表达式属性
    oldSchool: function() { .. }
};
```

看！这么多种定义函数的方式。

这里没有简单的捷径；你只需要熟悉所有的函数形式，这样你就可以在现有的代码中识别它们，并在你写的代码中适当地使用它们。仔细研究它们，并加以练习!

## 强制条件比较

是的，这一节的名字很拗口。但我们在谈论什么呢？我们在谈论条件表达式需要进行面向强制的比较来做出决定。

`if` 和 `?:` 三元运算，以及 `while` 和 `for` 循环中的测试语句，都执行隐式转换。但是是哪一种呢？是「严格的」还是「强制的」？实际上，两者都有。

假设以下代码：

```js
var x = 1;

if (x) {
    // 会运行！
}

while (x) {
    // 只会运行一次！
    x = false;
}
```

你可以这样思考以下这些 `(x)` 的条件表达式：

```js
var x = 1;

if (x == true) {
    // 会运行！
}

while (x == true) {
    // 只会运行一次！
    x = false;
}
```

在这个特定的案例中，`x` 的值是 `1`，这种值是有效的，但它在更广泛的作用域内并不准确。思考一下：

```js
var x = "hello";

if (x) {
    // 会运行！
}

if (x == true) {
    // 不会运行 :(
}
```

那么， `if` 语句实际上在做什么？这是更准确的表达：

```js
var x = "hello";

if (Boolean(x) == true) {
    // 会运行！
}

// 这与以下情况相同：

if (Boolean(x) === true) {
    // 会运行！
}
```

由于 `Boolean(..)` 函数总是返回一个布尔类型的值，所以这个片段中的 `==` 与 `===` 并不相关；它们都会做同样的事情。但重要的是，在比较之前，发生了一个强制类型转换，从当前的 `x` 类型到布尔类型。

在 JS 的比较中，你就是无法摆脱类型转换。仔细钻研，学习它们。

## 「类」的原型

在第三章中，我们介绍了原型，并展示了我们如何通过原型链连接对象。

另一种建立这种原型连接的方式是 ES6 的 `class`（见第二章，「类」）的优雅的前身（说实话，很丑），被称为原型类 (prototypal classes)。

| 贴士：                                                                                                    |
| :-------------------------------------------------------------------------------------------------------- |
| 提示:虽然这种风格的代码在现在的 JS 中很不常见，但在求职面试中还是相当普遍，被问到这种问题还是令人费解的！ |

让我们首先回顾一下 `Object.create(..)` 的编码风格：

```js
var Classroom = {
    welcome() {
        console.log("Welcome, students!");
    },
};

var mathClass = Object.create(Classroom);

mathClass.welcome();
// Welcome, students!
```

在这里，一个 `mathClass` 对象通过其原型与 `Classroom` 对象链接。通过这种联系，函数调用 `mathClass.welcome()` 被委托给 `Classroom` 上定义的方法。

原型类模式会将这种委托行为称为「继承」，或者将其（具有相同的行为）定义为：

```js
function Classroom() {
    // ..
}

Classroom.prototype.welcome = function hello() {
    console.log("Welcome, students!");
};

var mathClass = new Classroom();

mathClass.welcome();
// Welcome, students!
```

所有的函数都默认在一个名为 `prototype` 的属性处引用一个空对象。尽管命名很混乱，但这并**不是**函数的*原型*（函数的原型被链接到这里），而是通过调用函数的 `new` 来构建其他对象时要链接的原型对象。

我们在那个空对象（称为 `Classroom.prototype`）上添加一个 `welcome` 属性，指向 `hello()` 函数。

然后 `new Classroom()` 创建一个新的对象（分配给 `mathClass`），并将其原型链接到现有的 `Classroom.prototype` 对象。

尽管 `mathClass` 没有 `welcome()` 属性/函数，但它成功地委托给了`Classroom.prototype.welcome()` 函数。

这种「原型类」模式现在被强烈抵制，而倾向于使用 ES6 的 `class` 机制：

```js
class Classroom {
    constructor() {
        // ..
    }

    welcome() {
        console.log("Welcome, students!");
    }
}

var mathClass = new Classroom();

mathClass.welcome();
// Welcome, students!
```

同样的原型链接被连接起来，但这种「类」的语法比「原型类」更符合面向类的设计模式。
