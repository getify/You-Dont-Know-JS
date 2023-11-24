# 你并不了解 JavaScript：作用域与闭包 - 第二版

# 附录 B：练习

本附录旨在为您提供一些具有挑战性的有趣练习，以测试和巩固您对本书主要内容的理解。最好能用实际的代码编辑器亲自尝试一下这些练习，而不是直接跳到最后的解答。不要作弊！

这些练习并没有特定的正确答案，你必须准确的理解它。您的方法可能与所提供的解决方案有一些（或很大！）不同，这没关系。

我们不会因为你如何编写代码而对你进行评判。我希望你能从本书中获得自信，相信自己可以在扎实的知识基础上完成这些编码任务。这就是本书的唯一目的。如果你对自己的代码感到满意，我也会！

## 弹珠桶

还记得第 2 章中的图 2 吗？

<figure>
    <img src="./images/fig2.png" width="300" alt="彩色作用域气泡" align="center">
    <figcaption><em>图 2（第 2 章）： 彩色作用域气泡</em></figcaption>
    <br><br>
</figure>

本练习要求你编写一个包含嵌套函数和块作用域的程序（任何程序！），并满足这些限制条件：

-   如果将所有作用域（包括全局作用域！）都染成不同的颜色，则至少需要六种颜色。请务必添加代码注释，为每个作用域标注其颜色。

    附加题：识别代码可能具有的任何隐式作用域。

-   每个作用域至少有一个标识符。

-   包含至少两个函数作用域和至少两个块作用域。

-   至少有一个外部作用域变量必须被嵌套作用域变量所遮蔽（见第 3 章）。

-   至少有一个变量引用必须解析到作用域链中至少高两级的变量声明。

| 贴士：                                                                                                                    |
| :------------------------------------------------------------------------------------------------------------------------ |
| 你*可以*写一些无意义的 foo/bar/baz 之类的代码来做这个练习，但我建议你试着写一些非繁琐的真实代码，至少能做一些合理的事情。 |

请自己尝试一下，然后查看本附录末尾的参考答案。

## 闭包（第 1 部分）

首先，让我们通过一些常见的计算机数学运算来练习闭包：判断一个数值是否是质数（除了 1 和它本身之外没有其他除数），以及生成给定数字的质因数（除数）列表。

例如：

```js
isPrime(11); // true
isPrime(12); // false

factorize(11); // [ 11 ]
factorize(12); // [ 3, 2, 2 ] --> 3*2*2=12
```

下面是 <ruby><code>isPrime(..)</code><rt>是否是质数</rt></ruby> 的实现，改编自 Math.js 库：[^MathJSisPrime]

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

下面是 <ruby><code>factorize(..)</code><rt>因式分解</rt></ruby> 不要与第 6 章中的 `factorial(..)`混淆）的基本实现：

```js
function factorize(v) {
    if (!isPrime(v)) {
        let i = Math.floor(Math.sqrt(v));
        while (v % i != 0) {
            i--;
        }
        return [...factorize(i), ...factorize(v / i)];
    }
    return [v];
}
```

| 注意：                                                                                                                                                                                                                                       |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 我之所以称其为「基本」，是因为它没有进行性能优化。它是二进制递归的（没有尾调优化），而且会创建大量的中间数组副本。它也没有以任何方式对发现的因子进行排序。有很多其他算法可以完成这项任务，但我想用一些简短且易于理解的算法来完成我们的练习。 |

如果你在一个程序中多次调用 `isPrime(4327)` ，你可以看到它每次都要经历几十个比较/计算步骤。如果考虑到 `factorize(..)`，它在计算因数列表时会多次调用 `isPrime(..)`。而这些调用很有可能大部分都是重复的。这就浪费了很多性能！

本练习的第一部分是使用闭包实现缓存，以记住 `isPrime(..)` 的结果，这样给定数字的基元性（`true` 或 `false`）只需计算一次。提示：在第 6 章中，我们已经用 `factorial(..)` 演示了这种缓存。

如果你看一下 `factorize(..)`，它是通过递归实现的，这意味着它会重复调用自己。这同样意味着我们可能会看到大量浪费的调用，来计算同一个数字的质因数。因此，练习的第二部分是对 `factorize(..)` 使用相同的闭包缓存技术优化。

使用单独的闭包缓存 `isPrime(..)` 和 `factorize(..)`，而不是将它们放在一个作用域中。

请自己尝试一下，然后查看本附录末尾的参考答案。

### 关于内存

我想和大家分享一下关于这种闭包缓存技术的小提示，以及它对应用程序性能的影响。

我们可以看到，通过节省重复调用，我们提高了计算速度（在某些情况下，速度会大幅提高）。但是，这种闭包的使用是一种明确的权衡，你应该非常清楚。

代价就是内存。我们的缓存（内存）基本上是无限制增长的。如果相关函数被调用了数百万次，且大部分输入都是唯一的，那么我们就会占用大量内存。这样做绝对是值得的，但前提是我们认为我们很可能会看到重复的共同输入，这样我们才能利用缓存。

如果每次调用都有一个唯一的输入，而缓存基本上从未被*使用*过，那么采用这种技术就不合适了。

此外，采用更复杂的缓存方法（如 LRU（最近最少使用）缓存）来限制缓存的大小也是一个好主意；当缓存运行到极限时，LRU 会驱逐......嗯，最近最少使用的值！[^LRU]

缺点是 LRU 本身并不简单。你需要使用高度优化的 LRU 实现，并清楚地意识到所有的权衡取舍。

## 闭包（第 2 部分）

在本练习中，我们将再次通过定义一个 `toggle(..)` 工具来练习闭包，该工具将为我们提供一个值切换器。

您将向 `toggle(..)` 传递一个或多个值（作为参数），并返回一个函数。在反复调用时，返回的函数将按顺序在所有传入的值之间交替/轮换，每次一个。

```js
function toggle(/* .. */) {
    // ..
}

var hello = toggle("hello");
var onOff = toggle("on", "off");
var speed = toggle("slow", "medium", "fast");

hello(); // "hello"
hello(); // "hello"

onOff(); // "on"
onOff(); // "off"
onOff(); // "on"

speed(); // "slow"
speed(); // "medium"
speed(); // "fast"
speed(); // "slow"
```

没有向 `toggle(..)` 传递任何值的边缘情况并不重要；这样的 toggler 实例可以总是返回 `undefined`。

请自己尝试一下，然后查看本附录末尾的参考答案。

## 闭包（第 3 部分）

在第三个也是最后一个关于闭包的练习中，我们将实现一个基本的计算器。<ruby><code>calculator(..)</code><rt>计算器</rt></ruby> 函数将生成一个计算器实例，它以函数的形式（`calc(..)`，下同）保持自己的状态：

```js
function calculator() {
    // ..
}

var calc = calculator();
```

每次调用 `calc(..)`，你都要输入一个字符，它代表按下计算器按钮的一次按键操作。为了保持简单明了，我们将限制计算器只支持输入数字 (0-9)）、算术运算 (+, -, \*, /) 和 "=" 来计算运算。运算严格按照输入的顺序进行，没有 "( )" 分组或运算符优先。

我们不支持输入小数，但除法运算可以产生小数。我们不支持输入负数，但 "-" 操作可以产生负数。因此，只要先输入一个运算来计算负数或小数，就可以得出任何负数或小数。然后，您就可以继续使用该值进行计算。

`calc(..)` 调用的返回值应模拟真实计算器上的显示，如反映刚按下的内容，或在按下 "=" 时计算总数。

例如：

```js
calc("4"); // 4
calc("+"); // +
calc("7"); // 7
calc("3"); // 3
calc("-"); // -
calc("2"); // 2
calc("="); // 75
calc("*"); // *
calc("4"); // 4
calc("="); // 300
calc("5"); // 5
calc("-"); // -
calc("5"); // 5
calc("="); // 0
```

由于这种用法有点笨拙，这里有一个 `useCalc(..)` 助手，它可以使用字符串中的字符一个一个地运行计算器，并计算每次的显示结果：

```js
function useCalc(calc, keys) {
    return [...keys].reduce(function showDisplay(display, key) {
        var ret = String(calc(key));
        return display + (ret != "" && key == "=" ? "=" : "") + ret;
    }, "");
}

useCalc(calc, "4+3="); // 4+3=7
useCalc(calc, "+9="); // +9=16
useCalc(calc, "*8="); // *5=128
useCalc(calc, "7*2*3="); // 7*2*3=42
useCalc(calc, "1/0="); // 1/0=ERR
useCalc(calc, "+3="); // +3=ERR
useCalc(calc, "51="); // 51
```

使用 `useCalc(..)` 助手的最合理方法是始终将 "=" 作为最后输入的字符。

计算器显示的总计的某些格式需要特殊处理。我提供了这个 `formatTotal(..)` 函数，只要计算器要返回当前计算的总数（在输入 `"="` 后），就应该使用这个函数：

```js
function formatTotal(display) {
    if (Number.isFinite(display)) {
        // 将显示限制为最大11个字符
        let maxDigits = 11;
        // 为 "e+" 符号保留空间?
        if (Math.abs(display) > 99999999999) {
            maxDigits -= 6;
        }
        // 为 "-" 预留位置?
        if (display < 0) {
            maxDigits--;
        }

        // 整数？
        if (Number.isInteger(display)) {
            display = display.toPrecision(maxDigits).replace(/\.0+$/, "");
        }
        // 小数
        else {
            // 为 "." 预留空间
            maxDigits--;
            // 为前导 "0" 预留空间？
            if (Math.abs(display) >= 0 && Math.abs(display) < 1) {
                maxDigits--;
            }
            display = display.toPrecision(maxDigits).replace(/0+$/, "");
        }
    } else {
        display = "ERR";
    }
    return display;
}
```

不要太在意 `formatTotal(..)` 的工作原理。它的大部分逻辑是限制计算器显示最多 11 个字符的一系列处理，即使需要使用负数、重复小数甚至科学记数法 "e+"。

再次强调，不要陷入计算器特定行为的泥潭。把重点放在闭包的*内存*上。

请亲自尝试练习，然后查看本附录末尾的参考答案。

## 模块

本练习是将闭包（第 3 部分）中的计算器转换成模块。

我们不会为计算器添加任何额外功能，只是更改其接口。我们将不再调用单个函数 `calc(..)`，而是为计算器的每次「按键」调用公共 API 中的特定方法。输出保持不变。

该模块应表示为一个名为 `calculator()` 的传统模块工厂函数，而不是一个单例 IIFE，以便根据需要创建多个计算器。

公共 API 应包括以下方法：

-   `number(..)`(输入：「按下」的字符/数字）
-   `plus()`
-   `minus()`
-   `mult()`
-   `div()`
-   `eq()`

使用方法如下：

```js
var calc = calculator();

calc.number("4"); // 4
calc.plus(); // +
calc.number("7"); // 7
calc.number("3"); // 3
calc.minus(); // -
calc.number("2"); // 2
calc.eq(); // 75
```

`formatTotal(..)` 与之前的练习保持一致。但需要调整 `useCalc(..)` 助手，以便与模块 API 配合使用：

```js
function useCalc(calc, keys) {
    var keyMappings = {
        "+": "plus",
        "-": "minus",
        "*": "mult",
        "/": "div",
        "=": "eq",
    };

    return [...keys].reduce(function showDisplay(display, key) {
        var fn = keyMappings[key] || "number";
        var ret = String(calc[fn](key));
        return display + (ret != "" && key == "=" ? "=" : "") + ret;
    }, "");
}

useCalc(calc, "4+3="); // 4+3=7
useCalc(calc, "+9="); // +9=16
useCalc(calc, "*8="); // *5=128
useCalc(calc, "7*2*3="); // 7*2*3=42
useCalc(calc, "1/0="); // 1/0=ERR
useCalc(calc, "+3="); // +3=ERR
useCalc(calc, "51="); // 51
```

请自己尝试一下，然后查看本附录末尾的参考答案。

在做这个练习时，还需要花一些时间考虑将计算器表示为模块而不是前面练习中的闭包函数方法的优缺点。

附加题：写一些注释解释你的想法。

附加题 #2：尝试将模块转换为其他模块格式，包括：UMD、CommonJS 和 ESM（ES 模块）。

## 参考答案

希望您在阅读到这里之前，已经尝试过这些练习。不要作弊！

请记住，每个参考答案只是处理问题的多种不同方法之一。它们并不是「正确答案」，但确实说明了处理每个练习的合理方法。

阅读这些参考答案的最大益处在于将它们与您的代码进行比较，并分析我们各自做出相似或不同选择的原因。不要过多地纠缠于「帕金森琐碎定律[^帕金森琐碎定律]」；尽量将注意力集中在主题上，而不是小细节上。

### 建议：弹珠桶

*弹珠桶练习*可以这样解决[^埃拉托斯特尼筛法]：

```js
// 红色(1)
const howMany = 100;

// 埃拉托斯特尼筛法
function findPrimes(howMany) {
    // 蓝色(2)
    var sieve = Array(howMany).fill(true);
    var max = Math.sqrt(howMany);

    for (let i = 2; i < max; i++) {
        // 绿色(3)
        if (sieve[i]) {
            // 橙色(4)
            let j = Math.pow(i, 2);
            for (let k = j; k < howMany; k += i) {
                // 紫色(5)
                sieve[k] = false;
            }
        }
    }

    return sieve
        .map(function getPrime(flag, prime) {
            // 粉色(6)
            if (flag) return prime;
            return flag;
        })
        .filter(function onlyPrimes(v) {
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

### 建议：闭包（第 1 部分）

_闭包练习（第 3 部分）_ 的 `isPrime(..)` 和`factorize(..)`可以这样解决：

```js
var isPrime = (function isPrime(v) {
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

var factorize = (function factorize(v) {
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
            return (factors[v] = [...findFactors(i), ...findFactors(v / i)]);
        }
        return (factors[v] = [v]);
    };
})();
```

我使用每种实用工具的一般步骤：

1. 包裹一个 IIFE，以定义缓存变量所在的作用域。
2. 在底层调用中，首先检查缓存，如果已经知道结果，则返回。
3. 在每一个原本 `return` 的地方，将赋值操作赋给缓存，然后返回赋值操作的结果，这是一个节省空间的技巧，主要是为了在书中简洁明了。

我还将内部函数从 `factorize(..)` 重命名为 `findFactors(..)`。这在技术上并无必要，但它有助于更清楚地说明递归调用调用的是哪个函数。

### 建议：闭包（第 2 部分）

_闭包练习（第 2 部分）_ 的 `toggle(..)` 可以这样解：

```js
function toggle(...vals) {
    var unset = {};
    var cur = unset;

    return function next() {
        // 将前一个值保存回
        // 列表末尾
        if (cur != unset) {
            vals.push(cur);
        }
        cur = vals.shift();
        return cur;
    };
}

var hello = toggle("hello");
var onOff = toggle("on", "off");
var speed = toggle("slow", "medium", "fast");

hello(); // "hello"
hello(); // "hello"

onOff(); // "on"
onOff(); // "off"
onOff(); // "on"

speed(); // "slow"
speed(); // "medium"
speed(); // "fast"
speed(); // "slow"
```

### 建议：闭包（第 3 部分）

_闭包练习（第 3 部分）_ 的 `calculator(..)` 可以这样解：

```js
// 前置代码：
//
// function useCalc(..) { .. }
// function formatTotal(..) { .. }

function calculator() {
    var currentTotal = 0;
    var currentVal = "";
    var currentOper = "=";

    return pressKey;

    // ********************

    function pressKey(key) {
        //  数字键？
        if (/\d/.test(key)) {
            currentVal += key;
            return key;
        }
        // 操作键？
        else if (/[+*/-]/.test(key)) {
            // 在一个系列中进行多个操作？
            if (currentOper != "=" && currentVal != "") {
                // 隐含 '=' 键
                pressKey("=");
            } else if (currentVal != "") {
                currentTotal = Number(currentVal);
            }
            currentOper = key;
            currentVal = "";
            return key;
        }
        // = 键？
        else if (key == "=" && currentOper != "=") {
            currentTotal = op(currentTotal, currentOper, Number(currentVal));
            currentOper = "=";
            currentVal = "";
            return formatTotal(currentTotal);
        }
        return "";
    }

    function op(val1, oper, val2) {
        var ops = {
            // 注意：书中使用箭头功能
            // 只是为了简洁明了
            "+": (v1, v2) => v1 + v2,
            "-": (v1, v2) => v1 - v2,
            "*": (v1, v2) => v1 * v2,
            "/": (v1, v2) => v1 / v2,
        };
        return ops[oper](val1, val2);
    }
}

var calc = calculator();

useCalc(calc, "4+3="); // 4+3=7
useCalc(calc, "+9="); // +9=16
useCalc(calc, "*8="); // *5=128
useCalc(calc, "7*2*3="); // 7*2*3=42
useCalc(calc, "1/0="); // 1/0=ERR
useCalc(calc, "+3="); // +3=ERR
useCalc(calc, "51="); // 51
```

| 注意：                                                                                                       |
| :----------------------------------------------------------------------------------------------------------- |
| 记住：本练习是关于闭包的。不要过于关注计算器的实际机制，而要关注在调用函数时是否正确地*记住*了计算器的状态。 |

### 建议：模块

*模块练习*中的 `calculator()` 可以这样解决：

```js
// 前置代码：
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
        plus() {
            return operator("+");
        },
        minus() {
            return operator("-");
        },
        mult() {
            return operator("*");
        },
        div() {
            return operator("/");
        },
    };

    return publicAPI;

    // ********************

    function number(key) {
        // number key?
        if (/\d/.test(key)) {
            currentVal += key;
            return key;
        }
    }

    function eq() {
        // = 键？
        if (currentOper != "=") {
            currentTotal = op(currentTotal, currentOper, Number(currentVal));
            currentOper = "=";
            currentVal = "";
            return formatTotal(currentTotal);
        }
        return "";
    }

    function operator(key) {
        // 在一个系列中进行多个操作？
        if (currentOper != "=" && currentVal != "") {
            // 隐含 '=' 键
            eq();
        } else if (currentVal != "") {
            currentTotal = Number(currentVal);
        }
        currentOper = key;
        currentVal = "";
        return key;
    }

    function op(val1, oper, val2) {
        var ops = {
            // 注意：书中使用箭头功能
            // 只是为了简洁明了
            "+": (v1, v2) => v1 + v2,
            "-": (v1, v2) => v1 - v2,
            "*": (v1, v2) => v1 * v2,
            "/": (v1, v2) => v1 / v2,
        };
        return ops[oper](val1, val2);
    }
}

var calc = calculator();

useCalc(calc, "4+3="); // 4+3=7
useCalc(calc, "+9="); // +9=16
useCalc(calc, "*8="); // *5=128
useCalc(calc, "7*2*3="); // 7*2*3=42
useCalc(calc, "1/0="); // 1/0=ERR
useCalc(calc, "+3="); // +3=ERR
useCalc(calc, "51="); // 51
```

本书到此结束，祝贺你取得的成绩！准备好后，请继续阅读第 3 册*对象与类*。

[^MathJSisPrime]: _Math.js: isPrime(..)_, https://github.com/josdejong/mathjs/blob/develop/src/function/utils/isPrime.js, 2020年3月3日。
[^LRU]: Cache replacement policies, https://en.wikipedia.org/wiki/Cache_replacement_policies, 2023年11月2日。
[^埃拉托斯特尼筛法]: 埃拉托斯特尼筛法, https://zh.wikipedia.org/wiki/, 2023年9月27日。
