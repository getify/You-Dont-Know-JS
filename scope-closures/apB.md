# 你并不了解 JavaScript：作用域与闭包 - 第二版
# 附录 B：练习

本附录旨在为你提供一些具有挑战性和趣味性的练习，以测试和巩固你对此书主要主题的理解。最好的办法是自己尝试这些练习——在实际的代码编辑器中！——而不是直接跳到最后的答案。不许作弊！

这些练习没有唯一的正确答案。你的实现方法可能与给出的解决方案有所不同（甚至差异很大），这没关系。

没有人会评判你的代码写得如何。我的希望是，通过这些基于扎实知识基础构建的编码任务，你能在读完本书后感到自信。这是唯一的目的。只要你对自己的代码满意，那就足够了！

## 弹珠桶

还记得第 2 章中的图 2 吗？

<figure>
    <img src="images/fig2.png" width="300" alt="彩色作用域气泡" align="center">
    <figcaption><em>图 2（第 2 章）：彩色作用域气泡</em></figcaption>
    <br><br>
</figure>

这个练习要求你编写一个程序——任何程序都行！——其中包含嵌套函数和块作用域，并需满足以下约束条件：

* 如果你给所有作用域（包括全局作用域！）涂上不同的颜色，你需要至少六种颜色。请务必添加代码注释，标记每个作用域的颜色。

    额外挑战：识别你的代码中可能存在的任何隐式作用域。

* 每个作用域至少拥有一个标识符。

* 至少包含两个函数作用域和两个块作用域。

* 至少有一个来自外部作用域的变量被嵌套作用域的变量所遮蔽（参见第 3 章）。

* 至少有一个变量引用解析到了在作用域链中至少高两层的变量声明。

| 提示： |
| :--- |
| 你*可以*为了这个练习写一些 foo/bar/baz 类型的垃圾代码，但我建议你尝试写一些非同寻常的、稍微有点实际意义的代码，至少做点合理的事情。 |

先自己尝试这个练习，然后查看本附录末尾的建议解决方案。

## 闭包（第一部分）

首先让我们用一些常见的计算机数学运算来练习闭包：判断一个值是否为素数（除了 1 和它自身外没有其他除数），并生成给定数字的质因数（除数）列表。

例如：

```js
isPrime(11);        // true
isPrime(12);        // false

factorize(11);      // [ 11 ]
factorize(12);      // [ 3, 2, 2 ] --> 3*2*2=12
```

这是 `isPrime(..)` 的一个实现，改编自 Math.js 库：[^MathJSisPrime]

```js
function isPrime(v) {
    if (v <= 3) {
        return v > 1;
    }
    if (v % 2 == 0 || v % 3 == 0) {
        return false;
    }
    var vSqrt = Math.sqrt(v);
    for (let i = 5; i <= vSqrt; i += 6) {
        if (v % i == 0 || v % (i + 2) == 0) {
            return false;
        }
    }
    return true;
}
```

这是 `factorize(..)` 的一个基本实现（不要与第 6 章中的 `factorial(..)` 混淆）：

```js
function factorize(v) {
    if (!isPrime(v)) {
        let i = Math.floor(Math.sqrt(v));
        while (v % i != 0) {
            i--;
        }
        return [
            ...factorize(i),
            ...factorize(v / i)
        ];
    }
    return [v];
}
```

| 注意： |
| :--- |
| 我称之为基本实现，因为它没有针对性能进行优化。它是二分递归的（这无法进行尾调用优化），并且会创建大量的中间数组副本。它也没有对发现的因子进行任何排序。对于这个任务有很多很多的算法，但我只是想用一些简短且大致能理解的代码来作为我们的练习。 |

如果你在一个程序中多次调用 `isPrime(4327)`，你可以看到它每次都会经历数十次比较/计算步骤。如果你考虑 `factorize(..)`，它在计算因数列表时会多次调用 `isPrime(..)`。而且很有可能其中大部分调用是重复的。那是很多浪费的工作！

这个练习的第一部分是使用闭包来实现一个缓存，以记住 `isPrime(..)` 的结果，这样对于给定数字的素数判断（`true` 或 `false`）只需要计算一次。提示：我们在第 6 章中通过 `factorial(..)` 已经展示了这种缓存。

如果你看 `factorize(..)`，它是通过递归实现的，这意味着它会重复调用自身。这再次意味着我们可能会看到很多计算同一数字的质因数的浪费调用。所以练习的第二部分是对 `factorize(..)` 使用相同的闭包缓存技术。

为 `isPrime(..)` 和 `factorize(..)` 的缓存使用单独的闭包，而不是将它们放在同一个作用域内。

先自己尝试这个练习，然后查看本附录末尾的建议解决方案。

### 关于内存的一点说明

我想分享关于这种闭包缓存技术及其对应用程序性能影响的一点快速说明。

我们可以看到，通过节省重复调用，我们提高了计算速度（在某些情况下，提升幅度惊人）。但这种闭包的使用做出了一个明显的权衡，你应该非常清楚。

这个权衡就是内存。我们本质上是在（内存中）无限地增长我们的缓存。如果相关函数被调用了数百万次，且输入大多是唯一的，我们将消耗大量内存。这虽然绝对值得，但前提是我们认为很有可能会看到常见输入的重复，从而利用缓存。

如果几乎每次调用的输入都是唯一的，且缓存基本上从未被*利用*此获益，那么这是一种不适合采用的技术。

采用更复杂的缓存方法可能也是个好主意，例如 LRU（最近最少使用）缓存，它限制了大小；当达到限制时，LRU 会驱逐那些……嗯，最近最少使用的值！

缺点是 LRU 本身实现起来相当复杂。你会想要使用高度优化的 LRU 实现，并敏锐地意识到其中涉及的所有权衡。

## 闭包（第二部分）

在这个练习中，我们将再次练习闭包，定义一个 `toggle(..)` 工具，它给我们一个值切换器。

你将传递一个或多个值（作为参数）给 `toggle(..)`，并获得一个函数。当该返回的函数被重复调用时，它将依次在所有传入的值之间交替/轮换，一次一个。

```js
function toggle(/* .. */) {
    // ..
}

var hello = toggle("hello");
var onOff = toggle("on","off");
var speed = toggle("slow","medium","fast");

hello();      // "hello"
hello();      // "hello"

onOff();      // "on"
onOff();      // "off"
onOff();      // "on"

speed();      // "slow"
speed();      // "medium"
speed();      // "fast"
speed();      // "slow"
```

传递给 `toggle(..)` 的值为空的边界情况并不重要；这种切换器实例可以总是返回 `undefined`。

先自己尝试这个练习，然后查看本附录末尾的建议解决方案。

## 闭包（第三部分）

在关于闭包的第三个也就是最后一个练习中，我们将实现一个基本的计算器。`calculator()` 函数将生成一个计算器实例，该实例以函数（下面的 `calc(..)`）的形式维护其自身状态：

```js
function calculator() {
    // ..
}

var calc = calculator();
```

每次调用 `calc(..)` 时，你将传入一个代表计算器按键的字符。为了保持简单，我们将限制计算器只支持输入数字（0-9）、算术运算（+, -, \*, /）以及 "=" 来计算操作。运算严格按照输入的顺序处理；没有 "( )" 分组或运算符优先级。

我们不支持输入小数，但除法运算可能会产生小数。我们不支持输入负数，但 "-" 运算可能会产生负数。所以，你应该能够通过先输入一个运算来计算出任何负数或小数。然后你可以继续用该值进行计算。

`calc(..)` 调用的返回值应该模仿真实计算器上显示的内容，比如反映刚按下的键，或者按下 "=" 时计算总数。

例如：

```js
calc("4");     // 4
calc("+");     // +
calc("7");     // 7
calc("3");     // 3
calc("-");     // -
calc("2");     // 2
calc("=");     // 75
calc("*");     // *
calc("4");     // 4
calc("=");     // 300
calc("5");     // 5
calc("-");     // -
calc("5");     // 5
calc("=");     // 0
```

由于这种用法有点笨拙，这里有一个 `useCalc(..)` 辅助函数，它从字符串中逐个字符运行计算器，并每次计算显示内容：

```js
function useCalc(calc,keys) {
    return [...keys].reduce(
        function showDisplay(display,key){
            var ret = String( calc(key) );
            return (
                display +
                (
                  (ret != "" && key == "=") ?
                      "=" :
                      ""
                ) +
                ret
            );
        },
        ""
    );
}

useCalc(calc,"4+3=");           // 4+3=7
useCalc(calc,"+9=");            // +9=16
useCalc(calc,"*8=");            // *5=128
useCalc(calc,"7*2*3=");         // 7*2*3=42
useCalc(calc,"1/0=");           // 1/0=ERR
useCalc(calc,"+3=");            // +3=ERR
useCalc(calc,"51=");            // 51
```

`useCalc(..)` 辅助函数最合理的用法是让 "=" 总是作为最后一个输入的字符。

计算器显示的合计格式有些特殊处理。我提供了这个 `formatTotal(..)` 函数，这会在你的计算器需要返回当前计算的总数（在输入 `"="` 之后）时用到：

```js
function formatTotal(display) {
    if (Number.isFinite(display)) {
        // 限制显示最多 11 个字符
        let maxDigits = 11;
        // 为 "e+" 标记预留空间？
        if (Math.abs(display) > 99999999999) {
            maxDigits -= 6;
        }
        // 为 "-" 预留空间？
        if (display < 0) {
            maxDigits--;
        }

        // 整数？
        if (Number.isInteger(display)) {
            display = display
                .toPrecision(maxDigits)
                .replace(/\.0+$/,"");
        }
        // 小数
        else {
            // 为 "." 预留空间
            maxDigits--;
            // 为前导 "0" 预留空间？
            if (
                Math.abs(display) >= 0 &&
                Math.abs(display) < 1
            ) {
                maxDigits--;
            }
            display = display
                .toPrecision(maxDigits)
                .replace(/0+$/,"");
        }
    }
    else {
        display = "ERR";
    }
    return display;
}
```

不必太担心 `formatTotal(..)` 是如何工作的。它的大部分逻辑只是一堆处理，以将计算器显示限制在最多 11 个字符，即使需要负数、循环小数甚至是 "e+" 指数符号。

同样，不要陷入计算器特定行为的泥潭。专注于闭包的*记忆*。

先自己尝试这个练习，然后查看本附录末尾的建议解决方案。

## 模块

这个练习是将闭包（第三部分）中的计算器转换为一个模块。

我们不给计算器添加任何额外的功能，只是改变它的接口。此时不再调用单个函数 `calc(..)`，我们将针对计算器的每次“按键”调用公共 API 上的特定方法。输出保持不变。

该模块应表现为一个名为 `calculator()` 的经典模块工厂函数，而不是单例 IIFE，以便在需要时可以创建多个计算器。

公共 API 应包括以下方法：

* `number(..)` （输入：按下的字符/数字）
* `plus()`
* `minus()`
* `mult()`
* `div()`
* `eq()`

用法如下：

```js
var calc = calculator();

calc.number("4");     // 4
calc.plus();          // +
calc.number("7");     // 7
calc.number("3");     // 3
calc.minus();         // -
calc.number("2");     // 2
calc.eq();            // 75
```

`formatTotal(..)` 与之前的练习保持一致。但 `useCalc(..)` 辅助函数需要调整以适应模块 API：

```js
function useCalc(calc,keys) {
    var keyMappings = {
        "+": "plus",
        "-": "minus",
        "*": "mult",
        "/": "div",
        "=": "eq"
    };

    return [...keys].reduce(
        function showDisplay(display,key){
            var fn = keyMappings[key] || "number";
            var ret = String( calc[fn](key) );
            return (
                display +
                (
                  (ret != "" && key == "=") ?
                      "=" :
                      ""
                ) +
                ret
            );
        },
        ""
    );
}

useCalc(calc,"4+3=");           // 4+3=7
useCalc(calc,"+9=");            // +9=16
useCalc(calc,"*8=");            // *5=128
useCalc(calc,"7*2*3=");         // 7*2*3=42
useCalc(calc,"1/0=");           // 1/0=ERR
useCalc(calc,"+3=");            // +3=ERR
useCalc(calc,"51=");            // 51
```

先自己尝试这个练习，然后查看本附录末尾的建议解决方案。

在你做这个练习时，也花点时间考虑一下将计算器表示为模块与之前练习中的闭包函数方法相比的优缺点。

额外挑战：写几句话解释你的想法。

额外挑战 #2：尝试将你的模块转换为其他模块格式，包括：UMD、CommonJS 和 ESM（ES Modules）。

## 建议解决方案

希望你在读到这里之前已经尝试过这些练习。不许作弊！

记住，每个建议的解决方案只是解决问题的众多不同方法之一。它们不是“标准答案”，但它们确实说明了解决每个练习的一种合理方式。

阅读这些建议解决方案的最大好处是将它们与你的代码进行比较，分析为什么我们做出了相似或不同的选择。不要陷入太多的细节争论；尽量专注于主要话题，而不是细枝末节。

### 建议：弹珠桶

*弹珠桶练习*可以这样解决：

```js
// 红色(1)
const howMany = 100;

// 埃拉托斯特尼筛法（Sieve of Eratosthenes）
function findPrimes(howMany) {
    // 蓝色(2)
    var sieve = Array(howMany).fill(true);
    var max = Math.sqrt(howMany);

    for (let i = 2; i < max; i++) {
        // 绿色(3)
        if (sieve[i]) {
            // 橙色(4)
            let j = Math.pow(i,2);
            for (let k = j; k < howMany; k += i) {
                // 紫色(5)
                sieve[k] = false;
            }
        }
    }

    return sieve
        .map(function getPrime(flag,prime){
            // 粉色(6)
            if (flag) return prime;
            return flag;
        })
        .filter(function onlyPrimes(v){
            // 黄色(7)
            return !!v;
        })
        .slice(1);
}

findPrimes(howMany);
// [
//    2, 3, 5, 7, 11, 13, 17,
//    19, 23, 29, 31, 37, 41,
//    43, 47, 53, 59, 61, 67,
//    71, 73, 79, 83, 89, 97
// ]
```

### 建议：闭包（第一部分）

关于 `isPrime(..)` 和 `factorize(..)` 的*闭包练习（第一部分）*，可以这样解决：

```js
var isPrime = (function isPrime(v){
    var primes = {};

    return function isPrime(v) {
        if (v in primes) {
            return primes[v];
        }
        if (v <= 3) {
            return (primes[v] = v > 1);
        }
        if (v % 2 == 0 || v % 3 == 0) {
            return (primes[v] = false);
        }
        let vSqrt = Math.sqrt(v);
        for (let i = 5; i <= vSqrt; i += 6) {
            if (v % i == 0 || v % (i + 2) == 0) {
                return (primes[v] = false);
            }
        }
        return (primes[v] = true);
    };
})();

var factorize = (function factorize(v){
    var factors = {};

    return function findFactors(v) {
        if (v in factors) {
            return factors[v];
        }
        if (!isPrime(v)) {
            let i = Math.floor(Math.sqrt(v));
            while (v % i != 0) {
                i--;
            }
            return (factors[v] = [
                ...findFactors(i),
                ...findFactors(v / i)
            ]);
        }
        return (factors[v] = [v]);
    };
})();
```

我对每个工具使用的一般步骤：

1. 包装一个 IIFE 来定义缓存变量所在的作用域。

2. 在底层调用中，首先检查缓存，如果结果已知，则返回。

3. 在最初发生 `return` 的每个地方，赋值给缓存并仅返回该赋值操作的结果——这在书中主要是为了简洁而使用的节省空间的技巧。

我还将内部函数从 `factorize(..)` 重命名为 `findFactors(..)`。这在技术上不是必需的，但这有助于更清楚地表明递归调用调用的是哪个函数。

### 建议：闭包（第二部分）

*闭包练习（第二部分）* `toggle(..)` 可以这样解决：

```js
function toggle(...vals) {
    var unset = {};
    var cur = unset;

    return function next(){
        // 将之前的值保存回
        // 列表末尾
        if (cur != unset) {
            vals.push(cur);
        }
        cur = vals.shift();
        return cur;
    };
}

var hello = toggle("hello");
var onOff = toggle("on","off");
var speed = toggle("slow","medium","fast");

hello();      // "hello"
hello();      // "hello"

onOff();      // "on"
onOff();      // "off"
onOff();      // "on"

speed();      // "slow"
speed();      // "medium"
speed();      // "fast"
speed();      // "slow"
```

### 建议：闭包（第三部分）

*闭包练习（第三部分）* `calculator()` 可以这样解决：

```js
// 来自前面：
//
// function useCalc(..) { .. }
// function formatTotal(..) { .. }

function calculator() {
    var currentTotal = 0;
    var currentVal = "";
    var currentOper = "=";

    return pressKey;

    // ********************

    function pressKey(key){
        // 数字键？
        if (/\d/.test(key)) {
            currentVal += key;
            return key;
        }
        // 运算符键？
        else if (/[+*/-]/.test(key)) {
            // 一系列中的多个操作？
            if (
                currentOper != "=" &&
                currentVal != ""
            ) {
                // 隐含的 '=' 按键
                pressKey("=");
            }
            else if (currentVal != "") {
                currentTotal = Number(currentVal);
            }
            currentOper = key;
            currentVal = "";
            return key;
        }
        // = 键？
        else if (
            key == "=" &&
            currentOper != "="
        ) {
            currentTotal = op(
                currentTotal,
                currentOper,
                Number(currentVal)
            );
            currentOper = "=";
            currentVal = "";
            return formatTotal(currentTotal);
        }
        return "";
    };

    function op(val1,oper,val2) {
        var ops = {
            // 注意：使用箭头函数
            // 仅为了书中简洁
            "+": (v1,v2) => v1 + v2,
            "-": (v1,v2) => v1 - v2,
            "*": (v1,v2) => v1 * v2,
            "/": (v1,v2) => v1 / v2
        };
        return ops[oper](val1,val2);
    }
}

var calc = calculator();

useCalc(calc,"4+3=");           // 4+3=7
useCalc(calc,"+9=");            // +9=16
useCalc(calc,"*8=");            // *5=128
useCalc(calc,"7*2*3=");         // 7*2*3=42
useCalc(calc,"1/0=");           // 1/0=ERR
useCalc(calc,"+3=");            // +3=ERR
useCalc(calc,"51=");            // 51
```

| 注意： |
| :--- |
| 记住：这个练习是关于闭包的。不要太关注计算器的实际机制，而应关注你是否在跨函数调用中正确地*记住*了计算器状态。 |

### 建议：模块

*模块练习* `calculator()` 可以这样解决：

```js
// 来自前面：
//
// function useCalc(..) { .. }
// function formatTotal(..) { .. }

function calculator() {
    var currentTotal = 0;
    var currentVal = "";
    var currentOper = "=";

    var publicAPI = {
        number,
        eq,
        plus() { return operator("+"); },
        minus() { return operator("-"); },
        mult() { return operator("*"); },
        div() { return operator("/"); }
    };

    return publicAPI;

    // ********************

    function number(key) {
        // 数字键？
        if (/\d/.test(key)) {
            currentVal += key;
            return key;
        }
    }

    function eq() {
        // = 键？
        if (currentOper != "=") {
            currentTotal = op(
                currentTotal,
                currentOper,
                Number(currentVal)
            );
            currentOper = "=";
            currentVal = "";
            return formatTotal(currentTotal);
        }
        return "";
    }

    function operator(key) {
        // 一系列中的多个操作？
        if (
            currentOper != "=" &&
            currentVal != ""
        ) {
            // 隐含的 '=' 按键
            eq();
        }
        else if (currentVal != "") {
            currentTotal = Number(currentVal);
        }
        currentOper = key;
        currentVal = "";
        return key;
    }

    function op(val1,oper,val2) {
        var ops = {
            // 注意：使用箭头函数
            // 仅为了书中简洁
            "+": (v1,v2) => v1 + v2,
            "-": (v1,v2) => v1 - v2,
            "*": (v1,v2) => v1 * v2,
            "/": (v1,v2) => v1 / v2
        };
        return ops[oper](val1,val2);
    }
}

var calc = calculator();

useCalc(calc,"4+3=");           // 4+3=7
useCalc(calc,"+9=");            // +9=16
useCalc(calc,"*8=");            // *5=128
useCalc(calc,"7*2*3=");         // 7*2*3=42
useCalc(calc,"1/0=");           // 1/0=ERR
useCalc(calc,"+3=");            // +3=ERR
useCalc(calc,"51=");            // 51
```

这本书就到此为止了，祝贺你取得的成就！准备好后，请继续阅读第 3 册《对象与类》。

[^MathJSisPrime]: *Math.js: isPrime(..)*, https://github.com/josdejong/mathjs/blob/develop/src/function/utils/isPrime.js, 3 March 2020.
