# 你并不了解 JavaScript：作用域与闭包 - 第二版

# 附录 A：欲穷千里目，更上一层楼

现在，我们将围绕本书正文中涉及的许多主题，探讨一些细微差别和边缘问题。本附录为可选的辅修资料。

有些人认为，过于深入地研究细枝末节的案例和不同的意见只会制造噪音和分散注意力。他们认为，开发人员最好坚持走常人走过的路。有人批评我的方法不切实际、适得其反。我理解并欣赏这种观点，尽管我并不一定赞同。

我认为，了解事物是如何运作的，要比凭空臆想和缺乏好奇心来忽略细节要好得多。归根结底，你会遇到这样的情况：在你未曾探索过的地方，会冒出一些新的东西。换句话说，你不可能一直走在平坦的「幸福之路」上。难道你不愿意为越野过程中不可避免的颠簸做好准备吗？

与正文相比，这些讨论也会更多地受到我的观点的影响，因此在阅读和思考所介绍的内容时，请记住这一点。本附录有点像小型博客文章集，详细阐述了书中的各种主题。它篇幅很长，内容很深，所以请慢慢阅读，不要急于看完这里的所有内容。

## 隐式作用域

作用域有时会在不显眼的地方创建。实际上，这些隐式作用域并不总会影响程序的运行，但知道它们的存在还是很有用的。请留意以下令人惊讶的作用域：

-   参数作用域
-   函数名的作用域

### 参数作用域

第 2 章中的对话隐喻意味着函数参数基本上等同于函数作用域中本地声明的变量。但事实并非总是如此。

想想看：

```js
// 外部/全局作用域：红色 (1)

function getStudentName(studentID) {
    // 函数作用域：蓝色 (2)
    // ..
}
```

在这里，`studentID` 被视为一个「简单」的参数，因此它确实是蓝色 (2) 函数作用域的成员。但如果我们把它改为非简单参数，技术上就不再是这样了。被视为非简单参数的参数形式包括带默认值的参数、其余参数（使用 `...`）和非结构化参数。

想想看：

```js
// 外部/全局作用域：红色 (1)

function getStudentName(/*蓝色 (2)*/ studentID = 0) {
    // 函数作用域：绿色 (3)
    // ..
}
```

在这里，参数列表实质上成为了它自己的作用域，而函数的作用域则嵌套在*那个*作用域内。

为什么？有什么区别？非简单的参数形式会带来各种各样的情况，因此参数列表变成了自己的作用域，以便更有效地处理这些情况。

想想看：

```js
function getStudentName(studentID = maxID, maxID) {
    // ..
}
```

假设从左到右操作，`studentID` 参数的默认 `= maxID` 要求 `maxID` 已经存在（并且已经初始化）。这段代码会产生 TDZ 错误（第 5 章）。原因是 `maxID` 已在参数作用域中声明，但由于参数的顺序，它尚未被初始化。如果调换参数顺序，就不会发生 TDZ 错误：

```js
function getStudentName(maxID, studentID = maxID) {
    // ..
}
```

如果我们在默认参数位置引入一个函数表达式，它就可以在这个隐含参数作用域中的参数上创建自己的闭包（第 7 章），那么情况就会变得更加复杂：

```js
function whatsTheDealHere(id, defaultID = () => id) {
    id = 5;
    console.log(defaultID());
}

whatsTheDealHere(3);
// 5
```

该代码段可能是合理的，因为 `defaultID()` 箭头函数封闭了 `id` 参数/变量，然后我们将其重新赋值给 `5`。但现在让我们在函数作用域中引入 `id` 的遮蔽定义：

```js
function whatsTheDealHere(id, defaultID = () => id) {
    var id = 5;
    console.log(defaultID());
}

whatsTheDealHere(3);
// 3
```

啊哦！`var id = 5` 是对参数 `id` 的遮蔽，但函数 `defaultID()` 的闭包是在参数上，而不是在函数体中的遮蔽变量上。这证明在参数列表周围存在一个作用域气泡。

但还有比这更疯狂的！

```js
function whatsTheDealHere(id, defaultID = () => id) {
    var id;

    console.log(`local variable 'id': ${id}`);
    console.log(`parameter 'id' (closure): ${defaultID()}`);

    console.log("reassigning 'id' to 5");
    id = 5;

    console.log(`local variable 'id': ${id}`);
    console.log(`parameter 'id' (closure): ${defaultID()}`);
}

whatsTheDealHere(3);
// local variable 'id': 3   <--- Huh!? Weird!
// parameter 'id' (closure): 3
// reassigning 'id' to 5
// local variable 'id': 5
// parameter 'id' (closure): 3
```

这里最奇怪的是第一条控制台消息。此时，遮蔽的 `id` 局部变量刚刚被声明为 `var id`，而第 5 章断言该变量通常会在其作用域的顶端自动初始化为 `undefined`。为什么不打印 `undefined`？

在这种特殊情况下（出于传统兼容的原因），JS 不会将 `id` 自动初始化为 `undefined`，而是初始化为参数 `id` 的值（`3`）！

虽然此时两个 `id` 看起来像是一个变量，但实际上它们仍然是分开的（并且在不同的作用域中）。`id = 5` 赋值使分歧可观察到，其中 `id` 参数保持 `3`，而局部变量变成了 `5`。

我的建议是，避免被这些奇怪的细微差别所困扰：

-   切勿使用本地变量作为参数的遮蔽
-   避免使用封闭任何参数的默认参数函数

至少你现在已经意识到，如果有任何参数是非简单参数，那么参数列表就是它自己的作用域。

### 函数名的作用域

在第 3 章「函数名的作用域」一节中，我断言函数表达式的名称会被添加到函数自身的作用域中。请回想一下：

```js
var askQuestion = function ofTheTeacher() {
    // ..
};
```

的确，`ofTheTeacher` 并没有被添加到外层作用域（`askQuestion` 被声明的地方），但它也不是像您假设的那样*只是*被添加到函数的作用域。这是另一个奇怪的隐式作用域细节。

函数表达式的名称标识符在它自己的隐式作用域中，嵌套在外层作用域和主内部函数作用域之间。

如果 `ofTheTeacher` 在函数的作用域中，我们就会在这里发现错误：

```js
var askQuestion = function ofTheTeacher() {
    // 为什么这不是重复声明错误？
    let ofTheTeacher = "Confused, yet?";
};
```

`let` 声明形式不允许重新声明（参见第 5 章）。但这是完全合法的映射，而不是重新声明，因为两个 `ofTheTeacher` 标识符处于不同的作用域中。

你很少会遇到函数名称标识符的作用域的情况。不过，了解这些机制的实际工作原理还是有好处的。为了避免踩坑，永远不要对函数名标识符进行遮蔽处理。

## 匿名函数与具名函数

正如第 3 章所述，函数可以用命名或匿名形式表达。使用匿名形式更为常见，但这是个好主意吗？

在考虑为您的函数命名时，请先脑补一下：

-   命名推断不完整
-   词法命名允许自我引用
-   命名是有用的描述
-   箭头函数没有词法命名
-   IIFE 也需要命名

### 显示命名还是推断命名？

程序中的每个函数都有其用途。如果没有目的，就把它删除，因为你只是在浪费空间。如果它*有*用途，那么它*就有*用途的名称。

到目前为止，许多读者可能都同意我的观点。但这是否意味着我们应该总是把这个名字写入代码呢？在这里，我会让很多人瞠目结舌。我明确地说，是的！

首先，堆栈跟踪中显示的「匿名 (anonymous)」对调试没有什么帮助：

```js
btn.addEventListener("click", function () {
    setTimeout(function () {
        ["a", 42].map(function (v) {
            console.log(v.toUpperCase());
        });
    }, 100);
});
// Uncaught TypeError: v.toUpperCase is not a function
//     at myProgram.js:4
//     at Array.map (<anonymous>)
//     at myProgram.js:3
```

哎呀。与我给出函数名称后的报错相比：

```js
btn.addEventListener("click", function onClick() {
    setTimeout(function waitAMoment() {
        ["a", 42].map(function allUpper(v) {
            console.log(v.toUpperCase());
        });
    }, 100);
});
// Uncaught TypeError: v.toUpperCase is not a function
//     at allUpper (myProgram.js:4)
//     at Array.map (<anonymous>)
//     at waitAMoment (myProgram.js:3)
```

`waitAMoment` and `allUpper` 名称是如何出现并为堆栈跟踪提供更多有用的调试信息/上下文的？如果我们为所有函数使用合理的命名，程序就更容易调试。

| 注意：                                                                                                                                                                     |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 不幸的是，"&lt;anonymous>" 仍然出现，这是因为 `Array.map(..)` 的实现并不存在于我们的程序中，而是内置于 JS 引擎中。这并不是因为我们的程序引入了可读性快捷方式而造成的混淆。 |

顺便说一下，让我们对什么是具名函数有一个统一的认识：

```js
function thisIsNamed() {
    // ..
}

ajax("some.url", function thisIsAlsoNamed() {
    // ..
});

var notNamed = function () {
    // ..
};

makeRequest({
    data: 42,
    cb /* 也不是命名 */: function () {
        // ..
    },
});

var stillNotNamed = function butThisIs() {
    // ..
};
```

「但等等！」你说。其中一些*是*具名的，对吧！？

```js
var notNamed = function () {
    // ..
};

var config = {
    cb: function () {
        // ..
    },
};

notNamed.name;
// notNamed

config.cb.name;
// cb
```

这些被称为*推断*名命名。推断命名很好，但它们并不能真正解决我所讨论的全部问题。

### 缺少命名？

是的，这些推断命名可能会显示在堆栈跟踪中，这肯定比显示「匿名」要好。但是...

```js
function ajax(url, cb) {
    console.log(cb.name);
}

ajax("some.url", function () {
    // ..
});
// ""
```

哎呀。作为回调传递的匿名 `function` 表达式无法接收推断命名，因此 `cb.name` 只保留空字符串 `""`。绝大多数的 `function` 表达式，尤其是匿名表达式，都被用作回调参数；这些表达式都没有命名。因此，依靠命名推断充其量只是不完整的推断。

推断的不足之处不仅仅在于回调：

```js
var config = {};

config.cb = function () {
    // ..
};

config.cb.name;
// ""

var [noName] = [function () {}];
noName.name;
// ""
```

函数表达式的任何赋值如果不是*简单赋值*，也会导致命名推断失败。因此，换句话说，除非你小心谨慎，否则程序中几乎所有的匿名函数表达式实际上都没有命名。

推断命名只是...不太够用。

即使一个函数表达式*确实*得到了一个推断命名，它仍然不能算作一个完整的具名函数。

### 我是谁？

如果没有词法名称标识符，函数就没有内部方式来引用自身。自我引用对于递归和事件处理等工作非常重要：

```js
// broken
runOperation(function (num) {
    if (num <= 1) return 1;
    return num * oopsNoNameToCall(num - 1);
});

// 同样 broken
btn.addEventListener("click", function () {
    console.log("should only respond to one click!");
    btn.removeEventListener("click", oopsNoNameHere);
});
```

如果不在回调中使用词法名称，就很难可靠地自我引用函数。您*可以*在引用函数的外层作用域中声明一个变量，但这个变量是由外层作用域*控制*的，它可能被重新赋值等。因此它不如函数有自己的内部自引用那么可靠。

### 命名即描述

最后，我认为最重要的一点是，省略函数名称会让读者更难一眼看出函数的用途。他们必须阅读更多的代码，包括函数内部的代码和函数外部的代码，才能弄明白。

想想看：

```js
[1, 2, 3, 4, 5].filter(function (v) {
    return v % 2 == 1;
});
// [ 1, 3, 5 ]

[1, 2, 3, 4, 5].filter(function keepOnlyOdds(v) {
    return v % 2 == 1;
});
// [ 1, 3, 5 ]
```

没有任何合理的理由可以证明，**省略**第一个回调的名称 `keepOnlyOdds` 可以更有效地向读者传达这个回调的目的。你节省了 13 个字符，却失去了重要的可读性信息。`keepOnlyOdds` 这个名称可以非常清楚地告诉读者，第一眼看到它的时候，发生了什么。

JS 引擎并不关心命名。但阅读代码的人类读者绝对会关心。

读者能否通过观察 `v % 2 == 1` 来知道它在做什么？当然可以，但他们必须通过在头脑中执行代码来推断其目的（和名称）。即使是短暂的停顿，也会减慢代码的阅读速度。一个好的描述性命名可以让这一过程几乎毫不费力，而且立竿见影。

试想一下：代码的作者在将函数名称添加到代码中之前，需要弄清楚函数的用途多少次？大约一次。如果需要调整命名，可能需要两三次。但这段代码的读者需要多少次弄清命名/目的呢？每一次阅读这行代码。成百上千次？还是更多？

无论函数的长度或复杂程度如何，我的主张是，作者都应该想出一个好的描述性命名，并将其添加到代码中。即使是 `map(..)` 和 `then(..)`语句中的单行函数也应该命名：

```js
lookupTheRecords(someData)
    .then(function extractSalesRecords(resp) {
        return resp.allSales;
    })
    .then(storeRecords);
```

`extractSalesRecords` （提取销售记录）这个名称告诉读者这个 `then(..)` 处理程序的目的，比仅仅从精神上执行 `return resp.allSales` 来推断要好。

不为函数命名的唯一借口要么是懒惰（不想多输入几个字符），要么是没有创意（想不出好名字）。如果你想不出一个好名字，很可能是你还不了解这个函数及其用途。这个功能可能设计得不好，或者做了太多事情，应该重新设计。一旦你有了一个设计良好、用途单一的函数，它的正确名称就应该显而易见了。

我有一个小窍门：在第一次编写一个函数时，如果我不完全理解它的目的，也想不出一个好名字，我就用 `TODO` 作为它的名字。这样，在以后审查我的代码时，我就有可能发现这些名称占位符，我就更愿意（也更有准备！）回头去想一个更好的名称，而不是仅仅把它作为 `TODO`。

所有函数都需要名称。每一个都是。没有例外。省略任何命名都会使程序更难阅读、更难调试、更难扩展和维护。

### 箭头函数

箭头函数**始终是**匿名的，即使（很少）在使用时赋予了它一个推断命名。我刚刚花了好几页纸解释为什么匿名函数是个坏主意，所以你大概能猜到我对箭头函数的看法。

不要用它们来替代常规函数。它们的确更简洁，但这种简洁是以省略关键的视觉分隔符为代价的，而视觉分隔符可以帮助我们的大脑快速分辨出我们正在阅读的内容。而且，就本次讨论的重点而言，它们是匿名的，从这个角度来看，可读性也更差。

箭头函数有其目的，但不是为了节省击键次数。箭头函数具有*lexical this*[^箭头函数]行为，这在某种程度上超出了我们在本书中讨论的范围。

简而言之：箭头函数根本没有定义 `this` 标识符关键字。如果在箭头函数中使用 `this`，它的行为与其他变量引用完全相同，即通过查询作用域链来找到它*被*定义的函数作用域（非箭头函数），并使用该函数作用域。

换句话说，箭头函数对待 `this` 就像对待其他词法变量一样。

如果你习惯于使用 `var self = this` 这样的 hack 手段，或者如果你喜欢在内部函数表达式上调用 `.bind(this)`，只是为了迫使它们像词法变量一样从外部函数继承一个 `this`，那么 `=>` 箭头函数绝对是更好的选择。它们就是专门为解决这个问题而设计的。

因此，在极少数情况下，如果您需要*lexical this*，请使用箭头函数。它是最合适的工具。但需要注意的是，这样做的同时，你也接受了匿名函数的缺点。你应该花更多的精力来减轻可读性的*代价*，比如使用更多描述性的变量名和代码注释。

### IIFE 变体

所有函数都应该有名称。我说过好几次了，对吧？包括 IIFE。

```js
(function () {
    // 不要这么做！
})();

(function doThisInstead() {
    // ..
})();
```

如何为 IIFE 取名？确定 IIFE 的用途。为什么需要在该处设置作用域？您是否隐藏了一个「学生记录 (studentRecords)」的缓存变量？

```js
var getStudents = (function StoreStudentRecords() {
    var studentRecords = [];

    return function getStudents() {
        // ..
    };
})();
```

我将 IIFE 命名为 `StoreStudentRecords`（存储学生记录），因为这就是它的工作：存储学生记录。每个 IIFE 都应该有一个名字。没有例外。

IIFE 通常是通过在 `function` 表达式周围放置 `( .. )` 来定义的，如前面的代码段所示。但这并不是定义 IIFE 的唯一方法。从技术上讲，我们使用第一组周围的 `( .. )` 的唯一原因是，这样 `function` 关键字在 JS 解析器中就不会被视为 `function` 声明。但还有其他语法方式可以避免被解析为声明：

```js
!(function thisIsAnIIFE() {
    // ..
})();

+(function soIsThisOne() {
    // ..
})();

~(function andThisOneToo() {
    // ..
})();
```

`!`, `+`, `~` 和其他一些一元运算符（只有一个操作数的运算符）都可以放在 `function` 前面，将它变成一个表达式。然后，最后的 `()` 调用是有效的，这使它成为一个 IIFE。

实际上，我挺喜欢在定义独立的 IIFE 时使用 `void` 一元操作符：

```js
void (function yepItsAnIIFE() {
    // ..
})();
```

`void` 的好处是，它在函数的开头清楚地表明，这个 IIFE 不会返回任何值。

无论如何定义 IIFE，都要给它们起个名字，以示关爱。

## 提升：函数和变量

第 5 章阐述了*函数提升*和*变量提升*。由于提升经常被认为是 JS 设计中的失误，我想简要探讨一下为什么这两种形式的提升都*是*有益的，而且仍应加以考虑。

通过思考以下方面的优点，对提升进行更深层次的理解：

-   可执行代码在前，函数声明在后
-   变量声明的语义位置

### 函数提升

回顾一下，这个程序的工作原理是*函数提升*：

```js
getStudents();

// ..

function getStudents() {
    // ..
}
```

函数声明在编译过程中被提升，这意味着 `getStudents` 是为整个作用域声明的标识符。此外，`getStudents` 标识符会通过函数引用自动初始化，同样是在作用域的开头。

这有什么用？我更喜欢使用*函数提升*的原因是，它将任何作用域中的*可执行的*代码放在最上面，而任何进一步的声明（函数）则放在下面。这就意味着可以更容易地找到将在任何给定区域中运行的代码，而不必不停地滚动，希望在某个地方找到标记作用域/函数结束的尾部 `}`。

我在各级作用域内都利用了这种反向定位的优势：

```js
getStudents();

// *************

function getStudents() {
    var whatever = doSomething();

    // 其他内容

    return whatever;

    // *************

    function doSomething() {
        // ..
    }
}
```

当我第一次打开这样的文件时，第一行就是启动其行为的可执行代码。这很容易发现！然后，如果我需要找到并检查 `getStudents()`，我喜欢它的第一行也是可执行代码。只有当我需要查看 `doSomething()` 的细节时，我才会去下面查找它的定义。

换句话说，我认为*函数提升*通过从上到下的流畅、渐进的阅读顺序，使代码更具可读性。

### 变量提升

那么*变量提升*呢？

即使是 `let` 和 `const` 变量，也不能在它们的 TDZ 中使用（参见第 5 章）。因此，下面的讨论只适用于 `var` 声明。在继续之前，我得承认：几乎在所有情况下，我都完全同意*变量提升*是个坏主意：

```js
pleaseDontDoThis = "bad idea";

// 很久以后
var pleaseDontDoThis;
```

虽然这种颠倒的排序对*函数提升*很有帮助，但在这里，我认为它通常会使代码更难推理。

不过，在我自己的代码编写过程中，我发现了一个例外情况，而且是很少见的例外情况。这与我在 CommonJS 模块定义中放置 `var` 声明的位置有关。

以下是我在 Node 中通常使用的模块定义结构：

```js
// 依赖
var aModuleINeed = require("very-helpful");
var anotherModule = require("kinda-helpful");

// 公共 API
var publicAPI = Object.assign(module.exports, {
    getStudents,
    addStudents,
    // ..
});

// ********************************
// 私有实现

var cache = {};
var otherData = [];

function getStudents() {
    // ..
}

function addStudents() {
    // ..
}
```

注意到 `cache` 和 `otherData` 变量位于模块布局的「私有」部分了吗？这是因为我不打算公开它们。因此，我在组织模块时，将它们与模块的其他隐藏实现细节放在了一起。

但在一些罕见的情况下，我需要在声明模块的导出公共 API 之前，在上面对这些值进行赋值。例如：

```js
// 公共 API
var publicAPI = Object.assign(module.exports, {
    getStudents,
    addStudents,
    refreshData: refreshData.bind(null, cache),
});
```

我需要为 `cache` 变量赋值，因为该值将用于公共 API（`.bind(..)` 部分应用程序）的初始化。

我是否应该将 `var cache = { .. }` 移到顶部，在公共 API 初始化的上方？也许吧。但现在就不那么明显了，`var cache` 是一个*私有*实现细节。以下是我曾经（很少）使用过的折中方案：

```js
cache = {}; // 此处使用，但在下面声明

// 公共 API
var publicAPI = Object.assign(module.exports, {
    getStudents,
    addStudents,
    refreshData: refreshData.bind(null, cache),
});

// ********************************
// 私有实现

var cache /* = {}*/;
```

看到*变量提升*了吗？从逻辑上讲，我已经在下面声明了 `cache`，但在这种罕见的情况下，我在上面需要初始化的地方提前使用了它。我甚至还在代码注释中提示了分配给 `cache` 的值。

这是我发现的唯一一种利用*变量提升*来在作用域中比变量声明更早地赋值的情况。但我认为这是一个合理的例外，应谨慎使用。

## 使用 `var` 的理由

说到*变量提升*，让我们来谈谈 `var`。开发人员最喜欢将 JS 开发中的许多问题归咎于它的「连环套」。在第 5 章中，我们探讨了 `let`/`const` 的问题，并承诺将重新审视 `var` 在整个组合中的位置。

当我陈述案例时，千万不要错过：

-   `var` 从未被弃用
-   `let` 你的朋友
-   `const` 效用有限
-   两全其美：`var` _和_ `let`

### 不要扔掉 `var`

`var` 很好，运行的也很好。它已经存在了 25 年，在未来的 25 年甚至更长的时间里，它都将是有用的、功能强大的。声称 `var` 被破坏、被弃用、过时、危险或设计不合理，都是虚假的哗众取宠。

这是否意味着 `var` 是程序中每个声明的正确声明符？当然不是。但它在你的程序中仍有一席之地。因为团队中有人选择了激进的 linter[^lint] 观点而拒绝使用 `var` 就等于是掩耳盗铃。

好吧，既然我已经把你激怒了，那就让我来解释一下我的立场吧。

声明一下，我是块作用域声明的 `let` 的粉丝。我非常不喜欢 TDZ，我认为那是个错误。但 `let` 本身很棒。我经常使用它。事实上，我使用它的次数可能和使用 `var` 的次数一样多，甚至更多。

### 感到迷茫的 `const`

另一方面，我并不经常使用 `const`。我不想深究其中的原因，但归根结底，还是因为 `const` 无法承担其自身的重量。也就是说，虽然 `const` 在某些情况下有一点点好处，但在 JS 中出现之前，它就已经在各种语言中造成了长期的混乱。

`const` 假装创建了不能被修改的值。在许多语言的开发者社区中这是一个非常普遍的误解。而它真正的作用是防止重新赋值。

```js
const studentIDs = [14, 73, 112];

// 然后

studentIDs.push(6); // 哇偶,等等……什么! ?
```

在可变值（如数组或对象）中使用 `const`，会让未来的开发人员（或您代码的读者）掉入您设置的陷阱，即他们要么不知道，要么有点忘了，*值不变性*与*赋值不变性*完全不是一回事。

我只是觉得我们不应该设置这些陷阱。我唯一一次使用 `const` 是在给一个已经不可更改的值（比如 `42` 或 `"Hello, friends!"`）赋值的时候，而且从语义上来说，它显然是一个「常量」，是一个字面值的命名占位符。这就是 `const` 的最佳用途。不过这在我的代码中很少见。

如果变量重赋值是个大问题，那么 `const` 就会更有用。但就导致错误而言，变量重赋值并不是什么大问题。导致程序错误的原因有一长串，但「意外的重新赋值」在那一长串中排得很靠后。

再加上 `const`（和 `let`）应该在代码块中使用，而代码块应该是很短的，所以在代码中 `const` 声明适用的区域非常小。十行代码块中第一行的 `const` 声明只能告诉你后面九行的内容。而它告诉你的东西，只要往下看这九行就已经很明显了：变量永远不会在 `=` 的左侧；它不会被重新赋值。

仅此而已，这就是 `const` 的真正作用。除此之外，它就没什么用了。在值与赋值不变性的重大混淆中，`const`失去了很多光彩。

从不重新赋值的 `let` （或 `var`！）在行为上已经是一个「常量」，尽管它没有编译器的保证。这在大多数情况下已经足够了。

### `var` _和_ `let`

在我看来，`const` 很少有用，所以这只是 `let` 和 `var` 之间的两匹赛马竞争。但这也不是一场真正的比赛，因为不一定只有一个赢家。它们可以同时赢得......不同的比赛。

事实上，您应该在程序中同时使用 `var` 和 `let` 。它们不能互换：在需要使用 `let` 的地方不应使用 `var`，但在最适合使用 `var` 的地方也不应使用 `let`。

那么，在什么情况下我们仍然应该使用 `var`？在什么情况下它比 `let` 更合适？

首先，我总是在任何函数的顶层作用域中使用 `var`，不管它是在函数的开头、中间还是结尾。我也会在全局作用域中使用 `var`，不过我会尽量减少全局作用域的使用。

为什么在函数作用域内使用 `var`？因为这正是 `var` 的作用。25 年来，没有任何工具能比一个声明器更好地完成对声明进行函数作用域界定的工作了。

您*可以*在这个顶层作用域中使用 `let`，但它并不是最好的工具。我还发现，如果在所有地方都使用 `let` ，那么哪些声明是为了本地化而设计的，哪些声明是为了在整个函数中使用的，就不那么明显了。

相比之下，我很少在代码块中使用 `var` 。这就是 `let` 的作用。使用最合适的工具。如果你看到 `let`，它告诉你正在处理一个本地化声明。如果你看到 `var`，它告诉你你正在处理的是一个函数作用域的声明。就这么简单。

```js
function getStudents(data) {
    var studentRecords = [];

    for (let record of data.records) {
        let id = `student-${ record.id }`;
        studentRecords.push({
            id,
            record.name
        });
    }

    return studentRecords;
}
```

`studentRecords` 变量用于整个函数。`var` 是告诉读者这一点的最佳声明符。相比之下，`record` 和 `id` 仅用于循环迭代的较小作用域，因此 `let` 是最好的工具。

除了这个*最佳工具*语义论证外，`var`还有一些其他特性，在某些有限的情况下，这些特性使它变得更加强大。

其中一个例子是，当一个循环专门使用一个变量时，其条件子句却无法看到迭代内部的块作用域声明：

```js
function commitAction() {
    do {
        let result = commit();
        var done = result && result.code == 1;
    } while (!done);
}
```

在这里，`result` 显然只能在代码块内部使用，所以我们使用 `let`。但 `done` 有点不同。它只对循环有用，但 `while` 子句无法看到出现在循环内部的 `let` 声明。所以我们折中使用 `var`，这样 `done` 就会被提升到可以看到它的外层作用域。

另一种方法：在循环外声明 `done`，将它与首次使用它的地方分开，要么必须选择一个默认值来赋值，要么更糟，让它不被赋值，从而让读者看起来模棱两可。我认为在循环内使用 `var` 更合适。

`var` 的另一个有用特性体现在非预期块内的声明上。非预期块是由于语法需要块而创建的块，但开发者的意图并不是创建一个本地化的作用域。非预期作用域的最佳示例是 `try..catch` 语句：

```js
function getStudents() {
    try {
        // 不是块作用域
        var records = fromCache("students");
    } catch (err) {
        // 哎呀，退回到默认值
        var records = [];
    }
    // ..
}
```

是的，还有其他结构化代码的方法。但考虑到各种权衡，我认为这是*最好*的方法。

我不想在 `try`代码块之外声明 `records`（使用 `var`或 `let`），然后在一个或两个代码块中对其赋值。我更希望初始声明总是尽可能靠近变量的第一次使用（理想情况下是同一行）。在这个简单的例子中，这只是几行的距离，但在实际代码中，这可能会增加到更多行。距离越大，就越难弄清楚你要赋值给哪个作用域中的哪个变量。在实际赋值时使用 `var` 就不会那么模糊。

另外，请注意我在 `try` 和 `catch` 块中都使用了 `var`。这是因为我想向读者表明，无论采用哪种路径，`records` 都会被声明。从技术上讲，这样做是可行的，因为 `var` 被提升到函数作用域一次。但这仍然是一个很好的语义信号，提醒读者 `var` 确保了什么。如果 `var` 只在其中一个代码块中使用，而你只阅读另一个代码块，你就不会那么容易发现 `records` 来自何处。

在我看来，这是 `var` 的一个小小的超能力。它不仅可以躲避无意的 `try..catch` 块，还可以在函数的作用域中多次出现。而 `let` 就做不到这一点。这并不坏，它实际上是一个小小的有用功能。把 `var` 想象成一个声明式注释，每次使用时都会提醒你变量的来源。「啊哈，对了，它属于整个函数」。

这种重复标注的超能力在其他情况下也很有用：

```js
function getStudents() {
    var data = [];

    // 用数据做点什么
    // .. 50 多行代码 ..

    // 纯粹是一个注释来提醒我们
    var data;

    // 再次使用数据
    // ..
}
```

第二个 `var data` 并不是重新声明 `data`，只是为了读者的利益，注释 `data` 是一个函数作用域的声明。这样，读者就不需要滚动 50 多行代码来查找初始声明了。

我完全同意在整个函数作用域中为多种目的重复使用变量。我也完全不介意一个变量的两次使用之间相隔几行代码。在这两种情况下，使用 `var` 安全地「重新声明」（注释）的能力有助于确保无论我在函数的哪个位置，都能知道我的 `data` 来自何处。

遗憾的是，`let` 不能做到这一点。

还有其他一些细微差别和情况，`var` 可以提供一些帮助，但我不想再赘述了。我想说的是，在我们的程序中，`var` 可以与 `let` （以及偶尔使用的 `const`）一起发挥作用。你是否愿意创造性地使用 JS 语言提供的工具，向读者讲述一个更丰富的故事？

不要因为有人羞辱你，让你觉得 `var` 不再酷，就丢弃像 `var` 这样有用的工具。不要因为多年前的一次困惑而回避 `var`。学习这些工具，各尽其用。

## TDZ 是怎么回事？

第 5 章解释了 TDZ（暂时性死区）。我们说明了它是如何发生的，但对于*为什么*首先要引入它的原因却一笔带过。让我们简单了解一下 TDZ 的动机。

TDZ 起源故事中的一些线索：

-   `const` 不应改变
-   一切都与时间有关
-   `let` 的行为应该更像 `const` 还是 `var`？

### 一切从何开始

实际上，TDZ 源自 `const`。

在早期的 ES6 开发工作中，TC39 不得不决定 `const`（和 `let`）是否要提升到代码块的顶部。他们决定将这些声明提升到与 `var` 类似的位置。如果不是这样的话，我想有些人的担心是对作用域中间遮蔽的混淆，例如：

```js
let greeting = "Hi!";

{
    // 这里应该打印什么?
    console.log(greeting);

    // .. 几行代码 ..

    // 现在对 `greeting` 变量进行遮蔽处理
    let greeting = "Hello, friends!";

    // ..
}
```

我们应该如何处理 `console.log(..)` 语句？让它打印 "Hi!" 对 JS 开发人员来说有意义吗？这似乎是个问题，因为遮蔽只在代码块的后半部分起作用，而在前半部分则不起作用。这并不是非常直观、类似 JS 的行为。因此，`let` 和 `const` 必须提升到代码块的顶部，在整个代码块中可见。

但是，如果 `let` 和 `const` 提升到代码块的顶部（就像 `var` 提升到函数的顶部一样），为什么 `let` 和 `const` 不像 `var` 那样自动初始化（到 `undefined`）呢？这就是主要的问题所在：

```js
{
    // 这里应该打印什么?
    console.log(studentName);

    // 然后

    const studentName = "Frank";

    // ..
}
```

让我们设想一下，`studentName` 不仅被提升到了代码块的顶部，而且还被自动初始化为 `undefined`。在程序块的前半部分，可以观察到 `studentName` 具有 `undefined` 值，例如我们的 `console.log(..)` 语句。一旦进入 `const studentName = ...` 语句，`studentName`就会被赋值为 `"Frank"`。自此以后，`studentName` 就不能再被重新赋值了。

但是，一个常量有两个不同的观测值，先是 `undefined`，然后是 `"Frank"`，这奇怪对吗？这似乎有悖于我们对 「常量」的理解：「常量」只能有一个值。

所以......现在我们遇到了一个问题。我们不能将 `studentName` 自动初始化为 `undefined`（或任何其他值）。但变量必须在整个作用域中存在。我们该如何处理从变量首次存在（作用域开始）到变量赋值的这段时间呢？

我们称这段时间为「死区」，如「暂时性死区」(TDZ)。为了防止混淆，我们规定，在 TDZ 期间对变量的任何访问都是非法的，都会导致 TDZ 错误。

好吧，我必须承认，这种推理确实有些道理。

### 是谁「允许 (`let`)」TDZ 的？

但这只是 `const`。那么`let`呢？

TC39 做出了这样的决定：既然 `const` 需要一个 TDZ，那么 `let` 也需要一个 TDZ。事实上，如果我们让`let` 也有一个 TDZ，那么我们就能阻止人们做的那些丑陋的变量提升行为。

我的反驳是：如果你倾向于一致性，那就用 `var` 而不是 `const`；`let` 绝对比 `const` 更像 `var`。这一点尤其正确，因为他们已经选择了与 `var` 保持一致，因为他们已经把 `var` 提升到了作用域的顶端。让 `const` 成为它自己与 TDZ 的独特处理方式，让 TDZ 的答案纯粹是：通过始终在作用域的顶层声明常量来避免 TDZ。我认为这样会更合理。

但可惜，事情并非如此。`let` 有一个 TDZ，因为 `const` 需要一个 TDZ，因为 `let` 和 `const` 模仿 `var` 提升到（块）作用域的顶部。就是这样。太绕了？再读几遍。

## 同步回调还是闭包吗？

第 7 章介绍了两种不同的闭包模式：

-   闭包是一个函数实例，它会记住其外部变量，即使该函数在其他作用域中被传递和**调用**。
-   闭包是一个函数实例，它的作用域环境被就地保留，而对它的任何引用都会被传递并从其他作用域中**调用**。

这些模式并没有天壤之别，但它们确实从不同的角度切入。而这种不同的视角改变了我们对闭包的认定。

不要在闭包和回调中迷失方向：

-   回调到什么（或哪里）？
-   也许「同步回调」不是最好的标签
-   如果 **_IIF_** 函数不能移动，为什么需要闭包？
-   随着时间的推移而推迟是闭包的关键

### 什么是回调？

在重新讨论闭包之前，请允许我花一点时间来谈谈「回调 (callback)」这个词。人们普遍认为，「回调 (callback)」是*异步回调 (asynchronous callbacks)* 和*同步回调 (synchronous callbacks)* 的同义词。我不认为这是个好主意，所以我想解释一下原因，并建议我们不要使用这个词，而改用另一个词。

让我们先来理解一下*异步回调*，一个将在未来*稍后*调用的函数引用。在这种情况下，「回调」是什么意思？

这意味着当前代码已经完成或暂停，自身也已暂停，当稍后调用相关函数时，执行将重新进入暂停的程序，恢复执行。具体来说，重新进入的点就是被函数引用包裹的代码：

```js
setTimeout(function waitForASecond() {
    // 当计时器计时结束时
    // JS 应调用
}, 1000);

// 这是当前程序结束
// 或暂停的位置
```

在这种情况下，「回调」就很有意义了。JS 引擎通过在特定位置*回调*来恢复我们暂停的程序。好吧，回调是异步的。

### 同步回调？

那么*同步回调*呢？想想看：

```js
function getLabels(studentIDs) {
    return studentIDs.map(function formatIDLabel(id) {
        return `Student ID: ${String(id).padStart(6)}`;
    });
}

getLabels([14, 73, 112, 6]);
// [
//    "Student ID: 000014",
//    "Student ID: 000073",
//    "Student ID: 000112",
//    "Student ID: 000006"
// ]
```

我们应该把 `formatIDLabel(..)` 称作回调吗？通过调用我们提供的函数，`map(..)` 工具函数是否真的回调到我们的程序中？

因为程序没有暂停或退出，所以本身没有什么可调用的。我们只是将一个函数（引用）从程序的一部分传递到另一部分，然后立即调用它。

还有其他既定术语可能与我们正在做的事情相匹配：传递一个函数（引用），以便程序的另一部分可以代表我们调用它。你可能会认为这是*依赖注入* (DI[^DI]) 或*控制反转* (IoC[^IoC])。

DI 可以概括为将必要的功能部分传递给程序的另一部分，以便其调用这些功能完成工作。对于上面的 `map(..)` 调用来说，这样的描述很恰当，不是吗？`map(..)` 知道要遍历列表的值，但不知道如何处理这些值。这就是我们将 `formatIDLabel(..)` 函数传递给它的原因。我们传递依赖关系。

IoC 是一个非常相似的相关概念。控制反转的意思是，不要让程序的当前区域控制正在发生的事情，而是将控制权交给程序的另一部分。我们将计算字符串标签的逻辑封装在函数 `formatIDLabel(..)` 中，然后将调用控制权交给 `map(..)`。

值得注意的是，Martin Fowler 认为 IoC 是框架与库的区别：对于库，你调用它的函数；而对于框架，它调用你的函数。 [^fowlerIOC]

在我们的讨论中，DI 或 IoC 都可以作为*同步回调*的替代标签。

但我有一个不同的建议。让我们把（以前称为）*同步回调*的函数称为*内部调用函数* (IIF)。是的，没错，我就是在模仿 IIFE。这类函数是*inter-invoked*（内部调用）的，意思是：另一个实体调用它们，而不是 IIFE，后者会立即调用自己。

*异步回调*与 IIF 之间有什么关系？_异步回调 (asynchronous callback)_ 是异步而非同步调用的 IIF。

### 同步作用域？

既然我们已经把*同步回调*重新标记为 IIF，我们就可以回到我们的主要问题：IIF 是一个闭包吗？显然，IIF 必须引用外层作用域中的变量才有可能成为闭包。前面的 `formatIDLabel(..)` IIF 并没有引用它自身作用域之外的任何变量，所以它肯定不是闭包。

如果 IIF 中确实有外部引用，是否是闭包？

```js
function printLabels(labels) {
    var list = document.getElementById("labelsList");

    labels.forEach(function renderLabel(label) {
        var li = document.createElement("li");
        li.innerText = label;
        list.appendChild(li);
    });
}
```

内部的 `renderLabel(..)` IIF 引用了外层作用域中的 `list`，因此它是一个*可以*有闭包的 IIF。但这里我们为闭包选择的定义/模型很重要：

-   如果`renderLabel(..)` 是一个**函数，它被传递到其他地方**，然后调用该函数，那么是的，`renderLabel(..)` 确实是闭包，因为闭包保留了对其原始作用域链的访问。
-   但是，如果像第 7 章中的另一种概念模型那样，`renderLabel(..)` 保留在原处，只把对它的引用传递给`forEach(..)`，那么当`renderLabel(..)` 在自己的作用域内同步执行时，还需要闭包来保留`renderLabel(..)` 的作用域链吗？

不，这只是正常的词法作用域。

要了解原因，请看 `printLabels(..)` 的另一种形式：

```js
function printLabels(labels) {
    var list = document.getElementById("labelsList");

    for (let label of labels) {
        // 只是在它自己的作用域中的一个普通函数调用，对吗？
        // 这并不是真正的闭包！
        renderLabel(label);
    }

    // **************

    function renderLabel(label) {
        var li = document.createElement("li");
        li.innerText = label;
        list.appendChild(li);
    }
}
```

这两个版本的 `printLabels(..)` 基本上是一样的。

后一个绝对不是闭包的例子，至少在任何有用或可观察的意义上都不是。这只是词法作用域。前一个版本中，`forEach(..)` 调用我们的函数引用，本质上是一样的。它也不是闭包，而只是一个普通的词法作用域函数调用。

### 推迟闭包

顺便提一下，第 7 章简要提到了偏函数和柯里化（它们*依赖*于闭包！）。这是一个可以使用手动柯里化的有趣场景：

```js
function printLabels(labels) {
    var list = document.getElementById("labelsList");
    var renderLabel = renderTo(list);

    // 这次绝对是闭包!
    labels.forEach(renderLabel);

    // **************

    function renderTo(list) {
        return function createLabel(label) {
            var li = document.createElement("li");
            li.innerText = label;
            list.appendChild(li);
        };
    }
}
```

我们赋值给 `renderLabel` 的内部函数 `createLabel(..)` 是在 `list` 上闭包的，因此闭包肯定被使用了。

闭包允许我们稍后再记住 `list`，而将实际标签创建逻辑的执行从 `renderTo(..)` 调用推迟到随后的 `forEach(..)` 调用 `createLabel(..)` IIF。在这里，这可能只是一个短暂的瞬间，但随着闭包从一个调用桥接到另一个调用，任何时间都可能过去。

## 类模块的变体

第 8 章介绍了经典的模块模式，它看起来像这样：

```js
var StudentList = (function defineModule(Student) {
    var elems = [];

    var publicAPI = {
        renderList() {
            // ..
        },
    };

    return publicAPI;
})(Student);
```

请注意，我们将 `Student`（另一个模块实例）作为依赖关系传入。但是，你可能会遇到这种模块形式的许多有用的变化。以下是一些识别这些变化的提示：

-   模块知道自己的 API 吗？
-   即使我们使用花哨的模块加载器，它也只是一个传统的模块
-   有些模块需要通用

### 我的 API 在哪里？

首先，大多数传统模块不会像我在代码中展示的那样定义和使用 `publicAPI` 。相反，它们通常看起来像：

```js
var StudentList = (function defineModule(Student) {
    var elems = [];

    return {
        renderList() {
            // ..
        },
    };
})(Student);
```

这里唯一的区别是直接返回作为模块公共 API 的对象，而不是先将其保存到内部的 `publicAPI` 变量中。到目前为止，大多数传统模块都是这样定义的。

但我非常喜欢并一直使用前一种 `publicAPI` 形式。理由有两个：

-   `publicAPI` 是一个语义描述符，通过使对象的目的更加明显来提高可读性。

-   如果需要在模块生命周期内访问或修改 API，存储一个内部的 `publicAPI` 变量，引用返回的相同外部公共 API 对象，会非常有用。

    例如，您可能想从模块内部调用一个公开暴露的函数。或者，您可能想根据某些条件添加或删除方法，或者更新公开属性的值。

    无论如何，在我看来，*不*维护一个引用来访问我们自己的应用程序接口是非常愚蠢的。对吗？

### 异步模块定义 (AMD)

传统模块形式的另一种变体是 AMD 风格模块（几年前很流行），例如 RequireJS 工具支持的模块：

```js
define(["./Student"], function StudentList(Student) {
    var elems = [];

    return {
        renderList() {
            // ..
        },
    };
});
```

如果仔细观察 `StudentList(..)`，就会发现这是一个典型的模块工厂函数。在 `define(..)`（由 RequireJS 提供）的机制内，`StudentList(..)` 函数被执行，并传递给它作为依赖关系声明的任何其他模块实例。返回值是一个代表模块公共 API 的对象。

其原理（包括闭包的工作原理！）与我们在传统模块中探索的完全相同。

### 通用模块 (UMD)

我们要了解的最后一种变体是 UMD，它并不是一种特定的精确格式，而更像是一种非常相似的格式集合。它的设计目的是为可能在浏览器、AMD 风格加载器或 Node 中加载的模块创建更好的互操作性（无需任何构建工具转换）。我个人仍在使用 UMD 发布我的许多实用程序库。

以下是 UMD 的典型结构：

```js
(function UMD(name, context, definition) {
    // 由 AMD 风格的加载器 (loader) 加载?
    if (typeof define === "function" && define.amd) {
        define(definition);
    }
    // 在 Node 里？
    else if (typeof module !== "undefined" && module.exports) {
        module.exports = definition(name, context);
    }
    // 假设浏览器的独立脚本
    else {
        context[name] = definition(name, context);
    }
})("StudentList", this, function DEF(name, context) {
    var elems = [];

    return {
        renderList() {
            // ..
        },
    };
});
```

虽然 UMD 看起来有点不寻常，但它实际上只是一个 IIFE。

不同的是，IIFE 的主要函数表达式部分（位于顶部）包含一系列 `if..else if` 语句，用于检测模块加载时所处的三种支持环境。

通常调用 IIFE 的最后一个 `()` 被传递了三个参数： `"StudentsList"` 、`this` 和另一个 `function` 表达式。如果将这些参数与其参数相匹配，就会发现它们分别是名称(`name`)、上下文 (`context`) 和定义 (`definition`)。`"StudentList"`（`name`）是模块的名称标签，主要用于模块被定义为全局变量的情况。`this` (`context`) 通常是 `window`（又称全局对象；参见第 4 章），用于通过模块名称定义模块。

调用 `definition(..)` 实际是为了获取模块的定义，你会注意到，当然，这只是一个传统的模块形式！

毫无疑问，ESM（ES 模块）正在迅速流行和普及。但是，在过去 20 年里，有数百万个模块被编写出来，所有这些模块都使用了经典模块的 ESM 前变体，因此，当你遇到这些模块时，能够阅读和理解它们仍然非常重要。

[^fowlerIOC]: _Inversion of Control_, Martin Fowler,<https://martinfowler.com/bliki/InversionOfControl.html>, 2005年6月26日。
[^箭头函数]: _箭头函数_，<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions>，2023年9月14日。
[^lint]: _lint_，<https://zh.wikipedia.org/zh-cn/Lint>，2021年10月07日。
[^DI]: _依赖注入_，<https://zh.wikipedia.org/wiki/%E4%BE%9D%E8%B5%96%E6%B3%A8%E5%85%A5>，2023年1月7日。
[^IoC]: _控制反转_，<https://zh.wikipedia.org/zh-hans/%E6%8E%A7%E5%88%B6%E5%8F%8D%E8%BD%AC>，2022年9月1日。
