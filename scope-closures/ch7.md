# 你并不了解 JavaScript：作用域与闭包 - 第二版

# 第七章：闭包的使用

目前，我们主要介绍了词法作用域的来龙去脉，以及它如何影响程序中变量的组织和使用。

我们的注意力再次从抽象的角度转移到历史上令人生畏的「闭包」话题上。别担心！你并不需要一个高级计算机科学学位来理解它。我们在本书中的总体目标不仅仅是理解作用域，而是在我们的程序结构中更有效地使用它；闭包是这一目标的核心。

回顾第 6 章的主要结论：_最小暴露_ (POLE) 鼓励我们使用块（和函数）作用域来限制变量的作用域暴露。这有助于保持代码的可理解性和可维护性，并有助于避免许更多的作用域陷阱（如命名冲突等）。

闭包基于这种方法：对于我们需要长期使用的变量，我们可以将它们封装起来（更小的作用域），而不是将它们放在更大的外部作用域中，但仍保留函数内部的访问权限，以便更广泛地使用。函数通过闭包*记住*这些被引用的作用域变量。

我们在上一章中已经看到过这种闭包的示例（第 6 章中的 `factorial(..)`），几乎可以肯定，你已经在自己的程序中使用过它了。如果你写过一个回调函数，它可以访问自身作用域之外的变量......你猜怎么着？这就是闭包。

闭包是编程领域有史以来最重要的语言特点之一，它是包括函数式编程 (FP) 、模块甚至一些面向类的设计在内的主要编程范式的基础。要掌握 JS 并在整个代码中有效利用许多重要的设计模式，就必须熟悉闭包。

在本章中，需要讨论和编写大量代码，才能对闭包有全面的了解。请务必花点时间，确保在进入下一章节之前对每一部分都能得心应手。

## 来看看闭包

闭包原本是一个数学概念，来自 lambda 微积分。但我不会列出数学公式或使用一堆符号和术语来定义它。

相反，我将从实用的角度出发。首先，我们将从定义闭包开始，根据我们在程序的不同行为中可以观测到何如来定义闭包，而不是如果闭包在 JS 中不存在。不过，在本章的后面部分，我们将从*另一个角度*来看待闭包。

闭包是函数的一种行为，也只能是函数的一种行为。如果你处理的不是函数，闭包就不适用。对象不具有闭包性，类也不具有闭包性（尽管其函数/方法可能具有闭包性）。只有函数才有闭包。

要观测到闭包，函数必须被调用，具体地说，它必须在与最初定义它的作用域链不同的分支中被调用。在定义的同一作用域中执行的函数，无论是否可能闭包，都不会表现出任何可观测到的不同行为；根据观测的角度和定义，这不是闭包。

让我们来看一些代码，并用相关的作用域气泡颜色加以注释（见第 2 章）：

```js
// 外部/全局作用域：红色(1)

function lookupStudent(studentID) {
    // 函数作用域：蓝色(2)

    var students = [
        { id: 14, name: "Kyle" },
        { id: 73, name: "Suzy" },
        { id: 112, name: "Frank" },
        { id: 6, name: "Sarah" },
    ];

    return function greetStudent(greeting) {
        // 函数作用域：绿色(3)

        var student = students.find((student) => student.id == studentID);

        return `${greeting}, ${student.name}!`;
    };
}

var chosenStudents = [lookupStudent(6), lookupStudent(112)];

// 访问函数名：
chosenStudents[0].name;
// greetStudent

chosenStudents[0]("Hello");
// Hello, Sarah!

chosenStudents[1]("Howdy");
// Howdy, Frank!
```

这段代码首先要注意的是，`lookupStudent(..)` 外层函数创建并返回一个名为`greetStudent(..)` 的内层函数。`lookupStudent(..)` 被调用了两次，产生了两个独立的内部函数 `greetStudent(..)` 实例，这两个实例都被保存到 `chosenStudents` 数组中。

我们通过检查保存在 `chosenStudents[0]` 中的返回函数的 `.name` 属性来验证，它确实是内部 `greetStudent(..)` 的实例。

每次调用 `lookupStudent(..)` 结束后，它的所有内部变量似乎都会被丢弃和 GC（垃圾回收）。内部函数似乎是唯一被返回和保留的东西。但我们可以从这里开始观测行为的不同之处。

虽然 `greetStudent(..)` 收到一个名为 `greeting` 的参数，但它也同时引用了 `students` 和 `studentID` 这两个来自 `lookupStudent(..)` 的外层作用域的标识符。从内部函数到外层作用域变量的每一次引用都被称为*闭包 (closure)*。用学术术语来说，`greetStudent(..)` 的每个实例都*封闭了*外层变量 `students` 和 `studentID`。

那么，在具体的、可观测到的意义上，这些闭包在这里有什么作用呢？

闭包允许 `greetStudent(..)` 继续访问这些外层变量，即使在外层作用域结束后（当每次调用 `lookupStudent(..)` 完成时）。`students` 和 `studentID` 的实例没有被 GC，而是留在了内存中。以后再调用 `greetStudent(..)` 函数实例时，这些变量仍然存在，并保持其当前值。

如果 JS 函数没有闭包，那么每次完成`lookupStudent(..)` 调用后都会立即缩小其作用域并 GC `students` 和 `studentID` 变量。之后，当我们调用其中一个 `greetStudent(..)` 函数时，会发生什么呢？

如果 `greetStudent(..)` 试图访问它认为是蓝色(2) 的弹珠，但该弹珠实际上并不存在（不再存在），合理的假设是我们应该得到一个 `ReferenceError` 不是吗？

但我们并没有得到错误信息。事实上，`chosenStudents[0]("Hello")` 的执行是有效的，并返回了信息 "Hello, Sarah!"，这意味着它仍然能够访问 `students` 和 `studentID` 变量。这就是对闭包的直接观测！

### 明显的闭包

事实上，我们在之前的讨论中忽略了一个小细节，我猜很多读者都没有注意到！

由于 `=>` 箭头函数的语法非常简洁，我们很容易忘记它们仍然创建了一个作用域（正如第 3 章「箭头函数」中所断言的）。`student => student.id == studentID` 箭头函数在 `greetStudent(..)` 函数作用域内创建了另一个作用域气泡。

根据第 2 章中彩色水桶和气泡的比喻，如果我们要为这段代码创建一个彩色图，在最内层的嵌套层中有第四个作用域，因此我们需要第四种颜色；也许我们会为该作用域选择橙色(4) ：

```js
var student = students.find(
    (student) =>
        // 函数作用域：橙色(4)
        student.id == studentID,
);
```

蓝色(2) `studentID` 引用实际上是在橙色(4) 作用域内，而不是在 `greetStudent(..)` 的绿色(3) 作用域内；而且，箭头函数的 `student` 参数是橙色(4)，对绿色(3) `student` 有遮蔽。

这样做的后果是，作为数组的 `find(..)` 方法的回调函数传递的箭头函数必须保持 `studentID` 的闭包，而不是 `greetStudent(..)` 保持该闭包。这并不是什么大问题，因为一切仍按预期运行。重要的是，即使是很小的箭头函数也可以参与闭包。

### 增加闭包

让我们来看看一个经常被引用的经典案例：

```js
function adder(num1) {
    return function addTo(num2) {
        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15); // 25
add42To(9); // 51
```

内部 `addTo(..)` 函数的每个实例都记住了自己的 `num1` 变量（值分别为 `10` 和 `42`），因此这些 `num1` 并不会因为 `adder(..)` 的结束而消失。当我们以后调用这些内部的 `addTo(..)` 实例之一时，例如调用 `add10To(15)` 时，其中的 `num1` 变量仍然存在，并且仍然保持原来的 `10` 值。因此，该操作能够执行 `10 + 15` 并返回答案 `25`。

在上一段中，有一个重要的细节可能很容易被忽略，所以让我们来强化一下：闭包与函数的实例相关联，而不是与函数的单个词法定义相关联。在前面的代码段中，`adder(..)` 内部只定义了一个内部`addTo(..)` 函数，因此这似乎意味着只有一个闭包。

但实际上，外层的 `adder(..)` 函数每运行一次，就会创建一个*新*的内部 `addTo(..)` 函数实例，而每个新实例都有一个新的闭包。因此，每个内部函数实例（在我们的程序中标记为 `add10To(..)` 和 `add42To(..)`）在执行 `adder(..)` 时都有自己的作用域环境实例闭包。

尽管闭包是基于编译时处理的词法作用域，但闭包却是函数实例的运行时特征。

### 实时链接，而非快照

在前面的两个例子中，我们都是从闭包中的**变量读取值**。这让人感觉闭包可能是某个特定时刻值的快照。事实上，这是一个常见的误解。

闭包实际上是一个实时链接，保留了对完整变量本身的访问。我们不仅限于读取一个值，还可以更新（重新赋值）被封闭的变量！通过封闭函数中的变量，只要程序中存在函数引用，我们就可以继续使用该变量（读取和写入），也可以在任何地方调用该函数。这就是为什么闭包是一种强大的技术，被广泛应用于编程的各个领域！

图 4 描述了函数实例和作用域链接：

<figure>
    <img src="./images/fig4.png" width="400" alt="通过闭包与作用域相连的函数实例" align="center">
    <figcaption><em>图 4：可视化闭包</em></figcaption>
    <br><br>
</figure>

如图 4 所示，对 `adder(..)` 的每次调用都会创建一个新的包含 `num1` 变量的蓝色 (2) 作用域，以及一个新的作为绿色 (3) 作用域的 `addTo(..)` 函数实例。请注意，函数实例（`addTo10(..)` 和 `addTo42(..)`）存在于红色 (1) 作用域中并被调用。

现在，我们来看看一个更新封闭变量的例子：

```js
function makeCounter() {
    var count = 0;

    return function getCurrent() {
        count = count + 1;
        return count;
    };
}

var hits = makeCounter();

// 然后

hits(); // 1

// 然后

hits(); // 2
hits(); // 3
```

`count` 变量被内部的 `getCurrent()` 函数封闭，该函数会保留该变量，而不是将其用于 GC。`hits()` 函数会调用访问*并*更新该变量，每次都会返回一个递增的计数。

虽然闭包的外层作用域通常来自一个函数，但实际上这并不是必需的；外层作用域中只需有一个内部函数即可：

```js
var hits;
{
    // 外层作用域（但不是函数）
    let count = 0;
    hits = function getCurrent() {
        count = count + 1;
        return count;
    };
}
hits(); // 1
hits(); // 2
hits(); // 3
```

| 注意：                                                                                                                 |
| :--------------------------------------------------------------------------------------------------------------------- |
| 我故意将 `getCurrent()` 定义为一个函数表达式，而不是一个函数声明。这与闭包无关，而是与 FiB 的危险怪癖有关（第 6 章）。 |

由于将闭包误认为是面向值而不是面向变量的做法非常普遍，开发人员有时会在试图使用闭包来快照保存某个时刻的值时被绊倒。思考一下：

```js
var studentName = "Frank";

var greeting = function hello() {
    // 我们正在封闭 `studentName`，
    // 而不是 "Frank"
    console.log(`Hello, ${studentName}!`);
};

// later

studentName = "Suzy";

// 然后

greeting();
// Hello, Suzy!
```

当 `studentName` 的值为 `"Frank"`（在重新赋值给 `"Suzy"` 之前）时，通过定义 `greeting()`（又名 `hello()`），错误的假设往往是闭包将捕获 `"Frank"`。但是，`greeting()` 是对变量 `studentName` 的闭包，而不是对其值的闭包。无论何时调用 `greeting()`，都会反映变量（本例中为 `"Suzy"`）的当前值。

这种错误的典型例子就是在循环中定义函数：

```js
var keeps = [];

for (var i = 0; i < 3; i++) {
    keeps[i] = function keepI() {
        // 封闭 `i`
        return i;
    };
}

keeps[0](); // 3 -- 为什么！？
keeps[1](); // 3
keeps[2](); // 3
```

| 注意：                                                                                                                                                                               |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 这种闭包示例通常在循环内使用 `setTimeout(..)` 或其他回调（如事件处理程序）。我简化了示例，将函数引用存储在数组中，这样我们在分析时就不需要考虑异步时序。无论如何，闭包原理是相同的。 |

你可能以为 `keeps[0]()` 的调用会返回 `0`，因为该函数是在循环的第一次迭代中创建的，当时 `i` 为 `0`。但同样，这种假设源于将闭包视为面向值而不是面向变量。

`for`循环的结构会欺骗我们，让我们以为每一次迭代都会得到一个新的 `i` 变量；事实上，这个程序只有一个 `i` ，因为它是用 `var` 声明的。

每个保存的函数都会返回 `3`，因为在循环结束时，程序中唯一的 `i` 变量已经被赋值为 `3`。在 `keeps` 数组中的三个函数都有各自的闭包，但它们都是在同一个共享的 `i` 变量上闭包的。

当然，一个变量在任何时候都只能保存一个值。因此，如果要保存多个值，就需要为每个值设置不同的变量。

如何在循环中做到这一点呢？让我们为每次迭代创建一个新变量：

```js
var keeps = [];

for (var i = 0; i < 3; i++) {
    // 每次迭代都会创建新的 `j`，
    // 获取此刻 `i` 值的副本
    let j = i;

    // 这里的 `i` 没有被封闭，
    // 所以在每个循环迭代中
    // 立即使用它的当前值就可以了
    keeps[i] = function keepEachJ() {
        // 封闭了 `j`，而不是 `i`！
        return j;
    };
}
keeps[0](); // 0
keeps[1](); // 1
keeps[2](); // 2
```

现在，每个函数在每次迭代中都封闭了一个单独的（新）变量，尽管所有变量都被命名为 `j`。每个 `j` 都会获得循环迭代中 `i` 值的副本，而 `j` 永远不会被重新赋值。因此，这三个函数现在都会返回它们的预期值： `0`、 `1` 和 `2`！

请再次记住，即使我们在此程序中使用异步，例如将每个内部 `keepEachJ()` 函数传递到 `setTimeout(..)` 或某些事件处理程序订阅中，仍然可以观测到相同的闭包行为。

回想一下第 5 章中的「循环」一节，其中说明了在一个 `for` 循环中的 `let` 声明实际上不仅为循环创建了一个变量，而且实际上为循环的*每次迭代*创建了一个新变量。这个技巧正是我们的循环闭包所需要的：

```js
var keeps = [];

for (let i = 0; i < 3; i++) {
    // `let i` 会自动为每次迭代
    // 提供一个新的 "i"！
    keeps[i] = function keepEachI() {
        return i;
    };
}
keeps[0](); // 0
keeps[1](); // 1
keeps[2](); // 2
```

由于我们使用了 `let`，所以创建了三个 `i`，每个循环一个，因此三个闭包都能按预期*运行*。

### 常见闭包： Ajax 和事件

闭包常见于回调：

```js
function lookupStudentRecord(studentID) {
    ajax(`https://some.api/student/${studentID}`, function onRecord(record) {
        console.log(`${record.name} (${studentID})`);
    });
}

lookupStudentRecord(114);
// Frank (114)
```

`onRecord(..)` 回调将在 Ajax 调用返回响应后的某个时间点被调用。这种调用将从 `ajax(..)` 工具的内部发生，无论它来自何处。此外，当发生这种情况时，`lookupStudentRecord(..)` 调用早已完成。

那么，为什么 `studentID` 仍然存在并可被回调访问呢？闭包。

事件处理程序是闭包的另一种常见用法：

```js
function listenForClicks(btn, label) {
    btn.addEventListener("click", function onClick() {
        console.log(`The ${label} button was clicked!`);
    });
}

var submitBtn = document.getElementById("submit-btn");

listenForClicks(submitBtn, "Checkout");
```

`onClick(..)` 事件处理回调封闭了 `label` 参数。点击按钮后，`label` 仍然存在，可以使用。这就是闭包。

### 如果我看不到怎么办？

你可能听说过这句谚语：

> 假如一棵树在森林里倒下而没有人在附近听见，它有没有发出声音？[^假如一棵树在森林里倒下]

这是一种愚蠢的哲学体操。当然，从科学的角度来看，声波是被创造出来的。但真正的问题是声音是否发生*重要吗*？

请记住，我们对闭包定义的重点是可观测性。如果闭包存在（在技术、实现或学术意义上），但在我们的程序中却无法观测到，_这有什么关系吗_？

为了强化这一点，让我们来看一些*无法*观测到的基于闭包的例子。

例如，调用一个使用词法作用域查找的函数：

```js
function say(myName) {
    var greeting = "Hello";
    output();

    function output() {
        console.log(`${greeting}, ${myName}!`);
    }
}

say("Kyle");
// Hello, Kyle!
```

内层函数 `output()` 从其外层作用域访问变量 `greeting` 和 `myName`。但是，`output()` 的调用发生在同一个作用域中，当然 `greeting` 和 `myName` 仍然可用；这只是词法作用域，而不是闭包。

任何函数不支持闭包的词法作用域语言都会有同样的行为。

事实上，全局作用域变量本质上是无法（可观测）闭包的，因为它们总是可以从任何地方访问。在作用域链的任何部分，只要不是全局作用域的后代，就不能调用任何函数。

想想看：

```js
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" },
];

function getFirstStudent() {
    return function firstStudent() {
        return students[0].name;
    };
}

var student = getFirstStudent();

student();
// Kyle
```

内部的 `firstStudent()` 函数确实引用了 `students`，这是一个在其自身作用域之外的变量。但由于 `students` 恰好来自全局作用域，因此无论在程序中的哪个位置调用该函数，它访问 `students` 的能力都不会比正常的词法作用域更特殊。

无论语言是否支持闭包，所有函数调用都可以访问全局变量。全局变量不需要闭包。

仅存在但从未被访问的变量不会导致闭包：

```js
function lookupStudent(studentID) {
    return function nobody() {
        var msg = "Nobody's here yet.";
        console.log(msg);
    };
}

var student = lookupStudent(112);

student();
// Nobody's here yet.
```

内部函数 `nobody()` 不会封闭任何外部变量，它只使用自己的变量 `msg`。即使 `studentID` 存在于外层作用域中，`nobody()` 也不会引用 `studentID`。在 `lookupStudent(..)` 运行结束后，JS 引擎不需要继续使用 `studentID`，因此 GC 希望清理该内存！

无论 JS 函数是否支持闭包，这个程序的行为都是一样的。因此，这里没有观测到闭包。

如果没有函数调用，就无法观测闭包：

```js
function greetStudent(studentName) {
    return function greeting() {
        console.log(`Hello, ${studentName}!`);
    };
}

greetStudent("Kyle");

// 别无其他
```

这个问题很棘手，因为外层函数肯定会被调用。但内部函数是*可能*具有闭包性的函数，但它从未被调用；返回的函数在这里只是被丢弃。因此，即使从技术上讲，JS 引擎在短时间内创建了闭包，在这个程序中也没有以任何有意义的方式观测到它。

一棵树可能倒下了......但我们没听到，所以我们也不关心。

### 可观测定义

现在，我们准备定义闭包：

> 当函数使用外作用域的变量时，即使是在这些变量无法访问的作用域中运行，也会出现闭包。

这一定义的关键部分是：

-   必须涉及一个函数
-   必须引用至少一个外部作用域变量
-   必须在不同于变量的作用域链分支中调用

这种以观测为导向的定义意味着，我们不应将闭包视为一些间接的学术琐事。相反，我们应该关注并计划闭包对程序行为产生的直接、具体的影响。

## 闭包生命周期和垃圾回收 (GC)

由于闭包本质上是与函数实例绑定的，因此只要仍存在对该函数的引用，它对变量的闭包就会持续。

如果十个函数都对同一个变量进行了闭包，随着时间的推移，其中九个函数的引用被丢弃，剩下的唯一一个函数引用仍然保留着该变量。一旦最后一个函数引用被丢弃，该变量的最后一次闭包也就消失了，变量本身也会被 GC。

这对构建高效、高性能的程序有着重要影响。闭包可能会意外地阻止一个变量的 GC，会导致内存使用时间过长。这就是为什么当不再需要函数引用（以及它们的闭包）时，必须将其丢弃的原因。

想想看：

```js
function manageBtnClickEvents(btn) {
    var clickHandlers = [];

    return function listener(cb) {
        if (cb) {
            let clickHandler = function onClick(evt) {
                console.log("clicked!");
                cb(evt);
            };
            clickHandlers.push(clickHandler);
            btn.addEventListener("click", clickHandler);
        } else {
            // 不传递回调将取消订阅
            // 所有点击处理程序
            for (let handler of clickHandlers) {
                btn.removeEventListener("click", handler);
            }

            clickHandlers = [];
        }
    };
}

// var mySubmitBtn = ..
var onSubmit = manageBtnClickEvents(mySubmitBtn);

onSubmit(function checkout(evt) {
    // 办理结账
});

onSubmit(function trackAction(evt) {
    // 记录日志和分析
});

// 之后，取消订阅所有处理程序：
onSubmit();
```

在此程序中，内部的 `onClick(..)` 函数对传递的 `cb`（提供的事件回调）进行闭包。这意味着只要这些事件处理程序被订阅，`checkout()` 和 `trackAction()` 函数表达式引用就会通过闭包被保留（并且不能被 GC）。

当我们在最后一行没有输入的情况下调用 `onSubmit()` 时，所有事件处理程序都会被取消订阅，而 `clickHandlers` 数组也会被清空。一旦所有点击处理程序函数的引用都被丢弃，`cb` 的闭包引用 `checkout()` 和`trackAction()` 将被丢弃。

在考虑程序的整体健康和效率时，在不再需要时取消订阅事件处理程序可能比最初的订阅更加重要！

### 按变量还是按作用域？

我们需要解决的另一个问题是：我们应该认为闭包只适用于引用的外层变量，还是闭包会保留整个作用域链及其所有变量？

换句话说，在前面的事件订阅代码段中，内部的 `onClick(..)` 函数是只对 `cb` 产生闭包，还是也对 `clickHandler`、 `clickHandlers` 和 `btn` 产生闭包？

从概念上讲，闭包是**按变量**，而不是*按作用域*。Ajax 回调、事件处理程序和所有其他形式的函数闭包通常被认为只闭包它们明确引用的内容。

但现实情况比这更复杂。

另一个值得思考的程序：

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    return addGrade;

    // ************************

    function getGrade(record) {
        return record.grade;
    }

    function sortAndTrimGradesList() {
        // 按成绩降序排序
        grades.sort(function desc(g1, g2) {
            return g2 - g1;
        });

        // 只保留前 10 名
        grades = grades.slice(0, 10);
    }

    function addGrade(newGrade) {
        grades.push(newGrade);
        sortAndTrimGradesList();
        return grades;
    }
}

var addNextGrade = manageStudentGrades([
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    // ..many more records..
    { id: 6, name: "Sarah", grade: 91 },
]);

// 然后

addNextGrade(81);
addNextGrade(68);
// [ .., .., ... ]
```

外部函数 `manageStudentGrades(..)` 接收一个学生记录列表，并返回一个 `addGrade(..)` 函数引用，我们将其外部标记为`addNextGrade(..)`。每次我们使用新成绩调用 `addNextGrade(..)` 时，都会返回当前前 10 个成绩的列表，并按数字降序排序（参见 `sortAndTrimGradesList()`）。

从最初的 `manageStudentGrades(..)` 调用结束到多个 `addNextGrade(..)` 调用之间，`grades` 变量通过闭包被保存在 `addGrade(..)` 中；这就是最高分的运行列表的保存方式。请记住，这是对变量 `grades` 本身的闭包，而不是它所包含的数组。

然而，这并不是唯一的闭包。您还能发现其他被封闭的变量吗？

你发现 `addGrade(..)` 引用了 `sortAndTrimGradesList` 吗？这意味着它也封闭了该标识符，而该标识符恰好持有对 `sortAndTrimGradesList()` 函数的引用。第二个内部函数必须继续存在，这样 `addGrade(..)` 才能继续调用它，这也意味着 _它_ 封闭的任何变量都必须继续存在，尽管在本例中，没有任何额外的变量被封闭。

还有什么被封闭了？

考虑一下 `getGrade` 变量（及其函数）；它是否被封闭？在 `manageStudentGrades(..)` 的外层作用域中的 `.map(getGrade)` 调用中引用了它。但在 `addGrade(..)` 或 `sortAndTrimGradesList()` 中没有引用。

我们作为 `studentRecords` 传入的（可能是）大量学生记录列表怎么办？该变量是否被封闭？如果是，那么学生记录数组就永远不会被 GC，这导致程序占用的内存比我们想象的要大。但如果我们再仔细观察一下，没有一个内部函数引用了 `studentRecords`。

根据闭包的*按变量*的定义，由于 `getGrade` 和 `studentRecords` 没有被内部函数引用，所以它们没有被封闭。在 `manageStudentGrades(..)` 调用完成后，它们应该可以自由地用于 GC。

事实上，请尝试在最新的 JS 引擎（如 Chrome 浏览器中的 v8）中调试此代码，在 `addGrade(..)` 函数中设置断点。您可能会注意到，检查器**并没有**列出 `studentRecords` 变量。这就证明，无论如何，从调试的角度来看，引擎并没有通过闭包来维护 `studentRecords` 变量。呼！

但是，这种观察作为证据的可靠性如何呢？请看这个程序（相当别扭！）：

```js
function storeStudentInfo(id, name, grade) {
    return function getInfo(whichValue) {
        // 警告：
        //   使用 `eval(..)` 是个坏主意！
        var val = eval(whichValue);
        return val;
    };
}

var info = storeStudentInfo(73, "Suzy", 87);

info("name");
// Suzy

info("grade");
// 87
```

请注意，内部函数 `getInfo(..)` 并没有显式地封闭任何 `id`、`name` 或 `grade` 变量。然而，对 `info(..)` 的调用似乎仍然能够访问这些变量，尽管是通过使用 `eval(..)` 词法作用域欺骗（参见第 1 章）。

因此，尽管内部函数没有明确引用，但所有变量都通过闭包得到了保留。那么，这是否推翻了*按变量*的断言，转而支持*按作用域*的断言呢？这要看情况。

许多现代 JS 引擎都会应用一种*优化*方法，从闭包作用域中移除任何未明确引用的变量。然而，正如我们在使用 `eval(..)` 时所看到的，在某些情况下无法应用这种优化，闭包作用域仍然包含其所有原始变量。换句话说，从实现上来说，闭包必须是按作用域闭包的，然后可选的优化会将作用域缩减到只有被闭包的变量（与按变量闭包的结果类似）。

即使在几年前，许多 JS 引擎也没有应用这种优化；您的网站有可能仍在此类浏览器中运行，尤其是在较旧或较低端的设备上。这意味着事件处理程序等长寿命闭包占用内存的时间可能比我们想象的要长很多。

而事实上，它首先是一个可选的优化，而不是规范的要求，这意味着我们不应该随意地过度假设它的适用性。

在变量持有较大值（如对象或数组）且该变量存在于闭包作用域中的情况下，如果不再需要该值，也不希望内存被占用，那么手动丢弃该值比依赖闭包优化/GC 更安全（内存占用）。

让我们对先前的 `manageStudentGrades(..)` 示例进行*修复*，以确保在 `studentRecords` 中保存的潜在大数组不会不必要地陷入闭包作用域：

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    // 取消设置 `studentRecords` 以防止
    // 在闭包中保留不必要的内存
    studentRecords = null;

    return addGrade;
    // ..
}
```

我们并没有将 `studentRecords` 从闭包作用域中移除；这是我们无法控制的。我们要确保即使 `studentRecords` 仍在闭包作用域中，该变量也不再引用可能很大的数据数组；该数组可以被 GC。

同样，在许多情况下，JS 可能会自动优化程序，以达到同样的效果。但我们还是要养成小心谨慎的好习惯，明确确保不会在不必要的情况下占用大量设备内存。

事实上，在 `.map(getGrade)` 调用完成后，我们在技术上也不再需要函数 `getGrade()`。如果对我们的应用程序进行剖析后发现这是内存使用过多的关键区域，我们可以通过释放该引用来释放更多内存，这样它的值也不会被占用。在这个玩具示例中，这可能是不必要的，但如果要优化应用程序的内存占用，这是一个需要牢记的通用技术。

启示：了解闭包在程序中出现的位置和包含的变量非常重要。我们应该仔细管理这些闭包，以便只保留最不需要的部分，避免浪费内存。

## 一种替代观点

回顾我们对闭包的工作定义，我们可以断言函数是「头等值」[^头等函数]，可以像其他值一样在程序中传递。闭包是将函数与函数本身之外的作用域/变量连接起来的链接关联，无论函数走到哪里。

让我们回顾一下本章前面的一个代码示例，同样标注了相关的作用域气泡颜色：

```js
// 外部/全局作用域：红色 (1)

function adder(num1) {
    // 函数作用域：蓝色 (2)

    return function addTo(num2) {
        // 函数作用域：绿色 (3)

        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15); // 25
add42To(9); // 51
```

我们目前的观点认为，无论函数在哪里被传递和调用，闭包都会保留一个回到原始作用域的隐藏链接，以方便访问被闭包的变量。为方便起见，我们在此重复图 4，以说明这一概念：

<figure>
    <img src="./images/fig4.png" width="400" alt="通过闭包与作用域相连的函数实例" align="center">
    <figcaption><em>图 4（重复）：可视化闭包</em></figcaption>
    <br><br>
</figure>

不过，还有另一种思考闭包的方法，更确切地说，是思考被*传递*的函数的性质，这可能有助于深化心智模型。

这种替代模型不再强调「函数是头等值」，而是接受函数（像所有非原始值一样）在 JS 中通过引用持有，并通过引用拷贝分配/传递的方式。更多信息请参见*入门*一书的附录 A。

我们不用考虑内部函数实例 `addTo(..)` 通过 `return` 和赋值移动到外部红色 (1) 作用域，我们可以设想函数实例实际上只是停留在它们自己的作用域环境中，当然，它们的作用域链也是完好无损的。

*发送*到红色 (1) 作用域的只是对本地函数实例的**引用**，而不是函数实例本身。图 5 描述了分别由红色 (1) `addTo10` 和 `addTo42` 引用指向的保持原位的内部函数实例：

<figure>
    <img src="./images/fig5.png" width="400" alt="通过闭包在作用域内引用链接的函数实例" align="center">
    <figcaption><em>图 5：闭包可视化（备选方案）</em></figcaption>
    <br><br>
</figure>

如图 5 所示，每次调用 `adder(..)` 都会创建一个包含 `num1` 变量的新蓝色 (2) 作用域，以及一个绿色 (3) `addTo(..)` 作用域实例。但与图 4 不同的是，现在这些绿色 (3) 实例保持不变，自然地嵌套在它们的蓝色 (2) 作用域实例中。`addTo10` 和 `addTo42` 引用被移到了红色 (1) 外层作用域，而不是函数实例本身。

当调用 `adTo10(15)` 时，会调用函数实例 `addTo(..)`（仍在其原来的蓝色 (2) 作用域环境中）。由于函数实例本身从未移动过，它当然仍然可以自然地访问其作用域链。同样，调用 `adTo42(9)` 也是如此。除了词法作用域之外，没有什么特别之处。

那么，如果闭包不是一种让函数在其他作用域中移动时仍能保持与其原始作用域链链接的魔法，那它又*是*什么呢？在这一替代模型中，函数保持原位，并能像以前一样访问其原始作用域链。

闭包描述的是一种**保持函数实例**及其整个作用域环境和链的活力的魔法，只要程序的任何其他部分中还存在至少一个对该函数实例的引用。

与传统的学术观点相比，闭包的这一定义不那么注重观察，听起来也不那么耳熟能详。但它仍然有用，因为它的好处是，我们将闭包的解释简化为引用和本地函数实例的直接组合。

前面的模型（图 4）在描述 JS 中的封闭性方面并没有错。它只是在概念上更有启发，是从学术角度来看待闭包的。相比之下，另一个模型（图 5）可以说是更注重实现，即 JS 实际是如何工作的。

这两种观点/模式都有助于理解闭包，但读者可能会觉得其中一种比另一种更容易接受。无论你选择哪一种，我们计划中的可观察结果都是一样的。

| 注意：                                                                                         |
| :--------------------------------------------------------------------------------------------- |
| 这种闭包的替代模型确实会影响我们是否将同步回调归类为闭包的例子。关于这一细微差别，详见附录 A。 |

## 为什么是闭包？

既然我们已经全面了解了什么是闭包及其工作原理，那么就让我们来探讨一下闭包改善代码结构和程序组织的一些方法。

想象一下，页面上有一个按钮，当点击它时，应该通过 Ajax 请求获取并发送一些数据。在不使用闭包的情况下：

```js
var APIendpoints = {
    studentIDs: "https://some.api/register-students",
    // ..
};

var data = {
    studentIDs: [14, 73, 112, 6],
    // ..
};

function makeRequest(evt) {
    var btn = evt.target;
    var recordKind = btn.dataset.kind;
    ajax(APIendpoints[recordKind], data[recordKind]);
}

// <button data-kind="studentIDs">
//    Register Students
// </button>
btn.addEventListener("click", makeRequest);
```

`makeRequest(..)` 方法只会从点击事件中接收一个 `evt` 对象。然后，它必须从目标按钮元素中获取 `data-kind` 属性，并使用该值查找 API 端点的 URL 以及 Ajax 请求中应包含的数据。

这样做效果还可以，但令人遗憾的是（效率不高，更容易引起混淆），每次触发事件时，事件处理程序都必须读取 DOM 属性。为什么事件处理程序不能*记住*这个值呢？让我们尝试使用闭包来改进代码：

```js
var APIendpoints = {
    studentIDs: "https://some.api/register-students",
    // ..
};

var data = {
    studentIDs: [14, 73, 112, 6],
    // ..
};

function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;

    btn.addEventListener("click", function makeRequest(evt) {
        ajax(APIendpoints[recordKind], data[recordKind]);
    });
}

// <button data-kind="studentIDs">
//    Register Students
// </button>

setupButtonHandler(btn);
```

使用 `setupButtonHandler(..)` 方法时，会在初始设置时检索一次 `data-kind` 属性并将其分配给 `recordKind` 变量。然后，内部的 `makeRequest(..)` 点击处理程序会封闭 `recordKind` 变量，并在每次事件触发时使用其值来查找应发送的 URL 和数据。

| 注意：                                                                                                       |
| :----------------------------------------------------------------------------------------------------------- |
| `evt` 仍会传递给 `makeRequest(..)`，但在本例中我们不再使用它。为了与前面的代码段保持一致，我们仍然列出了它。 |

通过将 `recordKind` 放在 `setupButtonHandler(..)` 中，我们将该变量的作用域限制在了程序的一个更合适的子集中；如果将它存储在全局中，代码的组织性和可读性都会变差。闭包可以让内部的 `makeRequest()` 函数实例记住这个变量，并在需要时访问它。

根据这种模式，我们可以在设置时一次性查询 URL 和数据：

```js
function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;
    var requestURL = APIendpoints[recordKind];
    var requestData = data[recordKind];

    btn.addEventListener("click", function makeRequest(evt) {
        ajax(requestURL, requestData);
    });
}
```

现在， `makeRequest(..)` 封闭了 `requestURL` 和 `requestData`，这样理解起来更简洁，性能也略有提高。

函数式编程 (FP) 范式中有两种依赖于闭包的类似技术，它们是偏函数[^偏函数] (partial application) 和柯里化[^柯里化] (currying)。简而言之，利用这些技术，我们可以改变需要多个输入的函数的*形态*，这样就可以先提供一些输入，然后再提供其他输入；通过闭包记住初始输入。一旦提供了所有输入，就会执行底层操作。

通过创建一个封装了某些信息的函数实例（通过闭包），以后就可以直接使用存储了信息的函数，而无需重新提供输入。这使得代码的这一部分更加简洁，同时也为使用语义更好的名称标记部分应用的函数提供了机会。

通过调整应用的部分内容，我们可以进一步改进前面的代码：

```js
function defineHandler(requestURL, requestData) {
    return function makeRequest(evt) {
        ajax(requestURL, requestData);
    };
}

function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;
    var handler = defineHandler(APIendpoints[recordKind], data[recordKind]);
    btn.addEventListener("click", handler);
}
```

`requestURL` 和 `requestData` 输入会提前提供，从而产生 `makeRequest(..)` 部分应用函数，我们在本地将其标记为 `handler`。当事件最终触发时，最后的输入（`evt`，尽管它被忽略了）会传递给 `handler()`，完成其输入并触发底层的 Ajax 请求。

从行为上看，这个程序与前一个程序非常相似，使用了相同类型的闭包。但通过将 `makeRequest(..)` 的创建分离到一个单独的实用程序（`defineHandler(..)`）中，我们使得该定义在整个程序中的重用性更高。我们还明确地将闭包的范围限制为只需要两个变量。

## 完美谢幕

在我们结束密集的一章时，请做一些深呼吸，让一切都沉淀下来。说真的，对于任何人来说，这都是大量的信息！

我们探讨了从思想上解决闭包问题的两种模式：

-   观测：闭包是一个函数实例，即使该函数被传递到其他作用域并在其他作用域中**被调用**，它也会记住其外部变量。
-   实现：闭包是一个函数实例，它的作用域环境就地保留，而对它的任何引用都被传递并**从**其他作用域**调用**。

总结一下我们程序的优势：

-   闭包可以让函数实例记住先前确定的信息，而不必每次都进行计算，从而提高效率。
-   闭包可以提高代码的可读性，通过将变量封装在函数实例中来限制作用域的暴露，同时还能确保这些变量中的信息可供将来使用。由此产生的更小、更专业的函数实例，由于无需在每次调用时都传递所保留的信息，因此交互起来更简洁。

在继续学习之前，请花一些时间*用自己的话*重述一下这个总结，解释一下什么是闭包，为什么它对你的程序有帮助。本书正文的最后一章将在闭包的基础上使用模块模式。

[^假如一棵树在森林里倒下]: _假如一棵树在森林里倒下_， <https://zh.wikipedia.org/wiki/%E5%81%87%E5%A6%82%E4%B8%80%E6%A3%B5%E6%A8%B9%E5%9C%A8%E6%A3%AE%E6%9E%97%E8%A3%A1%E5%80%92%E4%B8%8B>， 2022年10月29日。
[^头等函数]: _头等函数_，<https://zh.wikipedia.org/wiki/%E5%A4%B4%E7%AD%89%E5%87%BD%E6%95%B0>，2023年8月21日。
[^偏函数]: _Partial application_，<https://en.wikipedia.org/wiki/Partial_application>， 2023年6月28日。
[^柯里化]: _柯里化_，<https://zh.wikipedia.org/zh-hans/%E6%9F%AF%E9%87%8C%E5%8C%96>， 2021年9月1日。
