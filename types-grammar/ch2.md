# 你并不了解 JavaScript：类型与语法 - 第二版
# 第 2 章：原始类型的行为

| 注意： |
| :--- |
| 草稿 |

到目前为止，我们已经考察了 JS 的七种内置原始值类型：`null`、`undefined`、`boolean`、`string`、`number`、`bigint`、`symbol`。

第 1 章信息量很大，可能比很多读者预期的更“硬核”。如果你读完还在缓神，先歇一会儿完全没问题。

准备好之后，我们来看看这些值类型在各自值上的具体行为。接下来会逐项拆开，仔细过一遍。

## 原始值的不可变性

所有原始值都是不可变的（immutable）：JS 程序无法直接“钻进”一个原始值内部并修改其内容。

```js
myAge = 42;

// 稍后：

myAge = 43;
```

`myAge = 43` 并不是修改了原来的值，而是把变量 `myAge` 重新赋值为另一个值 `43`，彻底替换了之前的 `42`。

通过各种运算也会产生新值，但同样不会改动原值：

```js
42 + 1;             // 43

"Hello" + "!";      // "Hello!"
```

这里的 `43` 和 `"Hello!"` 都是新值，分别不同于原先的 `42` 与 `"Hello"`。

就算是看起来像字符数组的字符串值（而数组内容通常可变），本身也依然不可变：

```js
greeting = "Hello.";

greeting[5] = "!";

console.log(greeting);      // Hello.
```

| 警告： |
| :--- |
| 在非严格模式下，给只读属性赋值（如 `greeting[5] = ..`）会静默失败；在严格模式下，这种非法赋值会抛出异常。 |

原始值“不可变”这一点，完全不受“持有该值的变量或对象属性如何声明”影响。比如上面的 `greeting`，无论用 `const`、`let` 还是 `var` 声明，它持有的字符串值都不可变。

`const` 不会创造“不可变值”，它只声明“不可重新赋值的变量”（即不可变赋值）。详见本系列《作用域与闭包》。

对象属性可以通过 `writable: false` 标记为只读（详见《对象与类》），但这影响的仍只是“能不能重赋值这个属性”，不改变值本身的性质。

### 原始值能有属性吗？

此外，你也不能给原始值新增属性：

```js
greeting = "Hello.";

greeting.isRendered = true;

greeting.isRendered;        // undefined
```

这段代码看起来像是给 `greeting` 中的值加了 `isRendered` 属性，但该赋值会静默失败（严格模式下同样如此）。

对于 `null` 和 `undefined` 这两个空值（nullish）原始值，任何属性访问都不允许。但其它原始值上确实可以访问属性——听起来有点反直觉。

例如，所有字符串值都有一个只读 `length` 属性：

```js
greeting = "Hello.";

greeting.length;            // 6
```

`length` 不能被设置，但可以读取，它暴露的是该值中存储的码元（code-unit）数量（参见第 1 章“JS 字符编码”），通常也就接近字符数。

| 注意： |
| :--- |
| 严格说只是“多数情况接近”。对于常见字符，1 个字符通常是 1 个码点（code-point），也对应 1 个码元；但第 1 章讲过，码点超过 `65535` 的扩展 Unicode 字符会以两个码元（代理对的一半+一半）存储，所以 `length` 会把它算作 `2`，即便视觉上是 1 个字符。 |

非 nullish 的原始值还可访问几个标准内置方法：

```js
greeting = "Hello.";

greeting.toString();    // "Hello." <-- 冗余
greeting.valueOf();     // "Hello."
```

此外，多数原始值类型还定义了各自特有的方法。稍后本章会展开。

| 注意： |
| :--- |
| 正如第 1 章简要提到的，原始值上的这类属性/方法访问，底层是由一种隐式强制行为 *自动装箱*（auto-boxing）支持的。第 3 章“自动对象”会详细说明。 |

## 原始值赋值

原始值从一个变量/容器赋到另一个变量/容器时，语义上是**值拷贝**：

```js
myAge = 42;

yourAge = myAge;        // 按值拷贝赋值

myAge;                  // 42
yourAge;                // 42
```

在这里，`myAge` 和 `yourAge` 各自都像是持有了 `42` 的一份拷贝。

| 注意： |
| :--- |
| 在 JS 引擎内部，内存里*可能*只存在一份 `42`，并让 `myAge` 与 `yourAge` 都指向它。由于原始值不可变，这么做没风险。对开发者更重要的是：在程序语义上，它们表现得像“各有各的值”，而不是共享可变状态。 |

如果之后把 `myAge` 改为 `43`（比如我过生日了），不会影响 `yourAge` 上仍是 `42`：

```js
myAge++;            // 大致等价于：myAge = myAge + 1

myAge;              // 43
yourAge;            // 42 <-- 未变化
```

## 字符串的行为

字符串值有不少值得注意的特性，每个 JS 开发者都应该熟悉。

### 字符访问

字符串并不是真的数组，但 JS 允许用 `[ .. ]` 这种数组风格通过数字下标（从 `0` 开始）访问字符：

```js
greeting = "Hello!";

greeting[4];            // "o"
```

如果 `[ .. ]` 中表达式结果不是数字，会先尝试隐式强制成整数（可行时）。

```js
greeting["4"];          // "o"
```

如果结果数字超出 `0` 到 `length - 1` 范围（或是 `NaN`），或本质上不是 `number` 值类型，那么这次访问会退化为“按同名字符串属性访问”；若属性不存在，结果是 `undefined`。

| 注意： |
| :--- |
| 强制类型转换会在后续章节详细讨论。 |

### 字符迭代

字符串虽然不是数组，但在很多地方很像数组。比如它和数组一样是可迭代对象（iterable），因此可逐个迭代它的字符（更准确说是码元序列上的迭代结果）：

```js
myName = "Kyle";

for (let char of myName) {
    console.log(char);
}
// K
// y
// l
// e

chars = [ ...myName ];
chars;
// [ "K", "y", "l", "e" ]
```

像字符串和数组这样的值，只要在特殊符号属性 `Symbol.iterator` 上暴露了“产出迭代器的方法”，就可通过 `...`、`for..of`、`Array.from(..)` 等机制迭代（参见第 1 章“知名符号”）：

```js
myName = "Kyle";
it = myName[Symbol.iterator]();

it.next();      // { value: "K", done: false }
it.next();      // { value: "y", done: false }
it.next();      // { value: "l", done: false }
it.next();      // { value: "e", done: false }
it.next();      // { value: undefined, done: true }
```

| 注意： |
| :--- |
| 迭代器协议的细节（例如最后一个有效值对应结果里仍可能是 `done: false`）会在本系列《同步与异步》中详细讲解。 |

### 长度计算

第 1 章提到过，字符串有一个自动给出长度的 `length` 属性；它只能读，写入会被静默忽略。

`length` 看起来像“字符个数”，但实际统计的是**码元数量**；一旦涉及 Unicode 复杂字符，事情会复杂很多。

在视觉上，人们通常把一个独立显示符号当作一个字符，这个概念叫字素（grapheme）或字素簇（grapheme cluster）。所以我们口语中的“字符串长度”，一般是指数字素数。

但计算机底层并不按这个定义工作。

在 JS 中，字符串的 `length` 始终统计码元数而非码点数。一个码元可能单独构成字符，也可能是代理对的一部分，或与相邻组合字符共同渲染为一个字素簇。因此 `length` 往往不等于“肉眼字符数”。

想更接近直觉上的“字素长度”，第一步往往先做 Unicode 规范化：`normalize("NFC")`（见第 1 章“Unicode 规范化”），把可组合的分解序列变成预组字符。

例如：

```js
favoriteItem = "teléfono";
favoriteItem.length;            // 9 -- 糟糕！

favoriteItem = favoriteItem.normalize("NFC");
favoriteItem.length;            // 8 -- 好多了
```

然而，第 1 章也讲过：码点超过 `65535` 的字符必须用代理对表示，所以在 `length` 中会被记作 2：

```js
// "☎" === "\u260E"
oldTelephone = "☎";
oldTelephone.length;            // 1

// "📱" === "\u{1F4F1}" === "\uD83D\uDCF1"
cellphone = "📱";
cellphone.length;               // 2 -- 啊这！
```

怎么办？

一个改进方案是使用字符迭代（如 `...`），它会把代理对组合后再产出字符：

```js
cellphone = "📱";
cellphone.length;               // 2 -- 啊这！
[ ...cellphone ].length;        // 1 -- 可以接受
```

但字素簇还会继续“加难度”。例如把 👎（`"\u{1F44E}"`）与中深肤色修饰符（`"\u{1F3FE}"`）组合：

```js
// "👎🏾" = "\u{1F44E}\u{1F3FE}"
thumbsDown = "👎🏾";

thumbsDown.length;              // 4 -- 还是不对
[ ...thumbsDown ].length;       // 2 -- 仍然不对
```

这两段是两个独立码点（不是代理对），但由于顺序与邻接规则，渲染层会把它们显示为一个带肤色的符号。于是“计算长度”和“视觉长度”进一步错位。

若要把这类码点簇都识别成“1 个字符”，基本要复刻平台级 Unicode 渲染逻辑。市面上确实有库尝试这么做，但不保证完美，且成本不低。

| 注意： |
| :--- |
| 作为 Twitter 用户，你可能以为 280 个 👎 可以发一条推。实际上 Twitter 把 `"👎"`、`"👎🏾"`，乃至 `"👩‍👩‍👦‍👦"`（家庭 emoji 字素簇）都按 2 个字符计数；尽管从 JS 的 `length` 看，它们分别是 `2`、`4`、`7`。所以实际可容纳 emoji 数量会减半（140 而不是 280）。Twitter 在 2018 年做了这个统一策略：把 Unicode/emoji 符号都按 2 计数。[^TwitterUnicode] 这对很多用户是改进，但也仍让人好奇：为什么不是更直觉的“每个字素算 1”。 |

要让字符串“长度”贴近人的直觉，其实非常困难。很多场景可得到可接受近似，但也总有不少边界情况会让程序翻车。

### 国际化（i18n）与本地化（l10n）

为了让 JS 程序在不同语言/文化环境下都表现正确，ECMAScript 委员会还发布了 ECMAScript Internationalization API。[^INTLAPI]

JS 程序默认采用其运行环境（浏览器页面、Node 实例等）的语言环境（locale）。这个 locale 会影响排序（及比较）、格式化以及若干默认行为。字符串最明显，数字（和日期）同样受影响。

同时，字符串字符本身也可能携带语言/locale 信息，并优先于环境默认值。若字符语言归属不明确（如 `"a"`），则回落到环境默认设置。

根据字符串内容，文本可能按从左到右（LTR）或从右到左（RTL）解释。因此，许多字符串方法会用“start/end/last”这类逻辑方位词，而不是“left/right”这类视觉方向词。

例如，希伯来语和阿拉伯语都常见于 RTL：

```js
hebrewHello = "\u{5e9}\u{5dc}\u{5d5}\u{5dd}";

console.log(hebrewHello);                       // שלום
```

注意字符串字面量里第一个字符（`"\u{5e9}"`）在渲染时反而显示在最右侧。

即便是 RTL 语言，你也不是按“反向显示顺序”去写字面量；你仍按逻辑顺序输入：位置 `0` 是第一个字符、位置 `1` 是第二个字符……RTL 的反转发生在渲染层。

这也意味着访问 `hebrewHello[0]`（或 `hebrewHello.charAt(0)`）会得到逻辑上的第一个字符 `"ש"`，而不是视觉上左边的最后一个字符 `"ם"`。下标访问遵循逻辑顺序，而不是显示顺序。

阿拉伯语同理：

```js
arabicHello = "\u{631}\u{62d}\u{628}\u{627}";

console.log(arabicHello);                       // رحبا

console.log(arabicHello[0]);                    // ر
```

JS 也允许通过 `Intl` API（如 `Intl.Collator`）强制指定语言/locale：[^INTLCollator]

```js
germanStringSorter = new Intl.Collator("de");

listOfGermanWords = [ /* .. */ ];

germanStringSorter.compare("Hallo","Welt");
// -1（或任意负数）

// 改编自 MDN 的例子：
//
germanStringSorter.compare("Z","z");
// 1（或任意正数）

caseFirstSorter = new Intl.Collator("de",{ caseFirst: "upper", });
caseFirstSorter.compare("Z","z");
// -1（或任意负数）
```

多词字符串可以用 `Intl.Segmenter` 分词：[^INTLSegmenter]

```js
arabicHelloWorld = "\u{645}\u{631}\u{62d}\u{628}\u{627} \
\u{628}\u{627}\u{644}\u{639}\u{627}\u{644}\u{645}";

console.log(arabicHelloWorld);      // مرحبا بالعالم

arabicSegmenter = new Intl.Segmenter("ar",{ granularity: "word" });

for (
    let { segment: word, isWordLike } of
    arabicSegmenter.segment(arabicHelloWorld)
) {
    if (isWordLike) {
        console.log(word);
    }
}
// مرحبا
//لعالم
```

| 注意： |
| :--- |
| `Intl.Segmenter` 实例的 `segment(..)` 返回的是标准 JS 迭代器，示例里由 `for..of` 消费。迭代协议详见《同步与异步》。 |

### 字符串比较

字符串值可通过多种运算符与其他字符串比较（包括相等和大小关系）。这类比较对实际字符串内容高度敏感，特别是非 BMP Unicode 字符的底层码点。

无论相等比较还是关系比较，对有大小写概念的字符都默认区分大小写。若要忽略大小写，应先统一双方大小写（如 `toUpperCase()` 或 `toLowerCase()`）。

#### 字符串相等比较

`===` 与 `==`（以及 `!==` 与 `!=`）是原始值最常见的相等比较方式，字符串也不例外：

```js
"my name" === "my n\x61me";               // true

"my name" !== String.raw`my n\x61me`;     // true
```

`===`[^StrictEquality]（常称“严格相等”）会先检查两侧类型是否相同；不同则立即 `false`。类型相同后再比较值；字符串比较是逐码元、从头到尾比较。

尽管叫“严格”，`===` 仍有细节（如 `-0`、`NaN`），后文会讲。

##### 强制类型转换相等

`==`[^LooseEquality]（常称“宽松相等”）执行的是**强制类型转换相等**：若两侧值类型不同，先把一侧或双方强制到同一类型，然后内部委托给 `===` 比较。

强制类型转换是 JS 类型系统中的核心机制（语言三大支柱之一），这里只先做引入，后续章节会系统展开。

| 注意： |
| :--- |
| 常见但不准确的说法是：“`==` 比较值，`===` 比较值和类型。”这不对。规范里 `isStrictlyEqual(..)` 与 `isLooselyEqual(..)` 都明确考虑类型。简言之：两侧类型相同时，`==` 与 `===` 行为完全一致；类型不同时，`==` 先强制到同类再比，`===` 直接 `false`。 |

很多开发者觉得 `==` 太容易踩坑，所以几乎一律偏好 `===`。作者观点相反：默认应该优先考虑 `==`（并尽量少用 `===`）。这个观点有争议，后面会详细论证。

先建立直觉：当类型不匹配时，`==` 往往偏好数值比较，即尽量把双方转成数字后再比较（比较环节与 `===` 相同）。

所以，对我们眼下“字符串相等”这个话题而言，只有双方本来都是字符串时，才是真正的字符串比较：

```js
// 真正的字符串相等比较（内部经由 ===）：
"42" == "42";           // true
```

`==` 本身并不会“专门做字符串比较”。若双方都是字符串，它只是委托 `===`；若不是，往往会收敛到数值比较：

```js
// 数值（不是字符串）相等比较：
42 == "42";             // true
```

数值相等稍后再说。

##### *真的*严格相等

除了 `==` 与 `===`，JS 还提供了 `Object.is(..)`，它在“完全同一”时返回 `true`，否则 `false`（没有那两个历史例外）：

```js
Object.is("42",42);             // false

Object.is("42","\x34\x32");     // true
```

有个半开玩笑的说法：`===` 是比 `==` 多一个 `=`，那 `Object.is(..)` 就像“`====`”，用于最“毫不妥协”的相等检查。

不过，对于“双方本来就是字符串”的比较，`===`（以及委托给它的 `==`）其实非常可预测。作者建议这类场景优先 `==`（或 `===`），把 `Object.is(..)` 留给数值边界场景。

#### 字符串关系比较

除了相等比较，JS 还支持字符串的关系比较：`<`、`<=`、`>`、`>=`。

`<`（小于）和 `>`（大于）对字符串执行字典序比较，直觉上类似词典排序：

```js
"hello" < "world";          // true
```

| 注意： |
| :--- |
| 如前所述，程序有当前 locale，关系运算符会按该 locale 规则比较。 |

和 `==` 类似，`<` 与 `>` 也带强制性。若操作数不是同为字符串，可能会被转成数字。要做纯字符串关系比较，就要保证两侧本来就是字符串。

有点反直觉的是：`<` 与 `>` 没有“严格版”对应物，不像 `===` 之于 `==`。类型不匹配时它们总会发生强制比较，语言层面无法关闭。

那两个“看起来像数字”的字符串比较会怎样？

```js
"100" < "11";               // true
```

按数值当然 `100` 不小于 `11`。

但字符串之间是字典序：比较到第二位时，`"100"` 的 `"0"` 小于 `"11"` 的 `"1"`，所以会排在前面。只有当两侧不是同为字符串时，关系运算才会转去数值比较。

`<=` 与 `>=` 可视为复合判断的简写：

```js
"hello" <= "hello";                             // true
("hello" < "hello") || ("hello" == "hello");    // true

"hello" >= "hello";                             // true
("hello" > "hello") || ("hello" == "hello");    // true
```

| 注意： |
| :--- |
| 一个有趣的规范细节：JS 并不直接定义“底层的大于/大于等于”算法，而是通过参数调换来复用“小于”相关逻辑。也就是 `x > y` 近似按 `y < x` 处理，`x >= y` 近似按 `y <= x` 处理。于是规范只需重点定义 `<` 和 `==`，`>` 与 `>=` 就“顺带得出”。 |

##### 区分 locale 的关系比较

前面说过，关系运算符依赖当前 locale。有时你需要强制某个 locale（例如排序某语言词表）。

这时可用字符串方法 `localeCompare(..)`：

```js
"hello".localeCompare("world");
// -1（或任意负数）

"world".localeCompare("hello","en");
// 1（或任意正数）

"hello".localeCompare("hello","en",{ ignorePunctuation: true });
// 0

// MDN 示例：
//
// 在德语里，ä 排在 z 前
"ä".localeCompare("z","de");
// -1（或任意负数）

// 在瑞典语里，ä 排在 z 后
"ä".localeCompare("z","sv");
// 1（或任意正数）
```

`localeCompare(..)` 的第 2、3 个可选参数可通过 `Intl.Collator` API[^INTLCollatorApi] 指定 locale 与选项。

排序字符串数组时很常用：

```js
studentNames = [
    "Lisa",
    "Kyle",
    "Jason"
];

// Array::sort() 会原地修改数组
studentNames.sort(function alphabetizeNames(name1,name2){
    return name1.localeCompare(name2);
});

studentNames;
// [ "Jason", "Kyle", "Lisa" ]
```

但如前所述，更直接（且大量排序时通常更高效）的方式是直接使用 `Intl.Collator`：

```js
studentNames = [
    "Lisa",
    "Kyle",
    "Jason"
];

nameSorter = new Intl.Collator("en");

// Array::sort() 会原地修改数组
studentNames.sort(nameSorter.compare);

studentNames;
// [ "Jason", "Kyle", "Lisa" ]
```

### 字符串拼接

两个或多个字符串可通过 `+` 拼接成新字符串：

```js
greeting = "Hello, " + "Kyle!";

greeting;               // Hello, Kyle!
```

`+` 只要有一侧已是字符串（哪怕空串 `""`），就会走字符串拼接语义。

若一侧是字符串、另一侧不是，则非字符串一侧会先被强制成字符串再拼接：

```js
userCount = 7;

status = "There are " + userCount + " users online";

status;         // There are 7 users online
```

这种拼接本质上就是把数据插值进字符串，这正是模板字面量的主要用途。所以下面通常更推荐：

```js
userCount = 7;

status = `There are ${userCount} users online`;

status;         // There are 7 users online
```

当然也可用 `"one".concat("two","three")` 或 `[ "one", "two", "three" ].join("")`。但这类方式更适用于拼接片段数量依赖运行时计算的场景；若内容结构固定，模板字面量更清晰。

### 字符串值方法

字符串值提供了大量字符串专属方法（以属性方式暴露）：

* `charAt(..)`：按数字下标返回新字符串，类似 `[ .. ]`；区别是 `charAt(..)` 总返回字符串（越界/无效时返回空串 `""`）

* `at(..)`：与 `charAt(..)` 类似，但支持负下标（从尾部反向计数）

* `charCodeAt(..)`：返回指定位置的码元值（见第 1 章“JS 字符编码”）

* `codePointAt(..)`：返回指定位置起始的完整码点；若遇到代理对，会返回完整字符码点

* `substr(..)` / `substring(..)` / `slice(..)`：返回原字符串某个范围的新字符串；三者在起止位置规则上不同

* `toUpperCase()`：返回全大写新字符串

* `toLowerCase()`：返回全小写新字符串

* `toLocaleUpperCase()` / `toLocaleLowerCase()`：按 locale 规则进行大小写映射

* `concat(..)`：将原字符串与参数字符串拼接，返回新字符串

* `indexOf(..)`：在原字符串中查找目标字符串，可传起始搜索位置；找到返回 `0` 基下标，找不到 `-1`

* `lastIndexOf(..)`：类似 `indexOf(..)`，但从末尾方向搜索（LTR 为右向左，RTL 为左向右）

* `includes(..)`：类似 `indexOf(..)`，但返回布尔值

* `search(..)`：类似 `indexOf(..)`，但按正则规则匹配

* `trimStart()` / `trimEnd()` / `trim()`：返回去除首尾空白的新字符串

* `repeat(..)`：返回重复若干次后的新字符串

* `split(..)`：按指定字符串或正则边界切分，返回字符串数组

* `padStart(..)` / `padEnd(..)`：按需在开头/结尾补齐，直到达到指定长度

* `startsWith(..)` / `endsWith(..)`：判断是否以指定字符串开头/结尾，返回布尔值

* `match(..)` / `matchAll(..)`：返回基于正则匹配的结果（数组或类数组迭代结果）

* `replace(..)`：按指定匹配规则替换一个或多个片段，返回新字符串

* `normalize(..)`：执行 Unicode 规范化（见第 1 章“Unicode 规范化”）后返回新字符串

* `localeCompare(..)`：按当前 locale 比较两个字符串（常用于排序）；返回负数/正数/`0`

* `anchor()`、`big()`、`blink()`、`bold()`、`fixed()`、`fontcolor()`、`fontsize()`、`italics()`、`link()`、`small()`、`strike()`、`sub()`、`sup()`：历史上用于生成 HTML 片段，现已废弃，应避免使用

| 警告： |
| :--- |
| 上述许多方法依赖位置下标。正如“长度计算”一节所述，下标取决于字符串内部码元结构：扩展 Unicode 字符可能占两格码元。若忽略分解码元、代理对与字素簇，字符串处理很容易出现边界 bug。 |

这些字符串方法既可直接作用于字面量，也可作用于持有字符串的变量/属性。且在可变更语义上，它们通常返回新字符串而不改原字符串（因为字符串不可变）：

```js
"all these letters".toUpperCase();      // ALL THESE LETTERS

greeting = "Hello!";
greeting.repeat(2);                     // Hello!Hello!
greeting;                               // Hello!
```

### `String` 的静态辅助方法

下面这些工具挂在 `String` 对象本身上，而不是字符串实例上：

* `String.fromCharCode(..)` / `String.fromCodePoint(..)`：根据一个或多个码元/码点参数创建字符串

* `String.raw(..)`：模板标签函数，可做插值但保留转义序列的原始字面形式

此外，大多数值（特别是原始值）都可通过 `String(..)`（不带 `new`）显式强制成字符串：

```js
String(true);           // "true"
String(42);             // "42"
String(Infinity);       // "Infinity"
String(undefined);      // "undefined"
```

更完整的强制类型转换规则会在后续章节展开。

## 数字的行为

数字在程序里用途很多，但最主要仍是数学计算。理解 JS 数字的行为细节，才能避免结果偏离预期。

### 浮点精度误差

这里需要回到第 1 章对 IEEE-754 的讨论。

任何基于 IEEE-754 的语言（并非 JS 独有）都有经典陷阱：并非所有值/运算都能被该表示法精确承载。

最典型的例子：

```js
point3a = 0.1 + 0.2;
point3b = 0.3;

point3a;                        // 0.30000000000000004
point3b;                        // 0.3

point3a === point3b;            // false <-- 翻车
```

`0.1 + 0.2` 产生了浮点误差（drift），真实存储值是 `0.30000000000000004`。

对应位模式：

```
// 0.30000000000000004
00111111110100110011001100110011
00110011001100110011001100110100

// 0.3
00111111110100110011001100110011
00110011001100110011001100110011
```

仔细看会发现只差最后两位（`00` vs `11`），但这已经足以让二者不相等。

再次强调：这**绝不是** JS 特有问题。任何遵循 IEEE-754 的语言在同场景都会如此。前面说过，多数主流语言都用 IEEE-754，所以都会遇到这个问题。

拿 `0.1 + 0.2 !== 0.3` 嘲笑 JS 很常见，但在这个点上并不成立。

| 注意： |
| :--- |
| 几乎所有程序员都应该理解 IEEE-754 的这些坑，并有意识规避。遗憾的是，真正搞清楚它的人不多。如果你认真读到这里，你已经在少数“知道自己数字系统在做什么”的开发者里了。 |

#### Epsilon 阈值

一种常见建议是用 JS 定义的这个“非常小”的 `number` 值来对抗浮点误差：

```js
Number.EPSILON;                 // 2.220446049250313e-16
```

*Epsilon* 表示 `1` 与“比 `1` 大的下一个可表示数”之间的最小差值。技术上它与实现/平台有关，但通常约为 `2.2E-16`（即 `2^-52`）。

很多人（包括作者过去的自己）以为：单次运算引入的浮点偏差不会超过 `Number.EPSILON`。于是理论上可把它当“极小容差”做安全相等比较：

```js
function safeNumberEquals(a,b) {
    return Math.abs(a - b) < Number.EPSILON;
}

point3a = 0.1 + 0.2;
point3b = 0.3;

// 它们“安全相等”吗？
safeNumberEquals(point3a,point3b);      // true
```

| 警告： |
| :--- |
| 本系列第一版《类型与语法》中，作者确实推荐过这个方法。后来发现这是错误建议。 |

实际并不安全：

```js
point3a = 10.1 + 0.2;
point3b = 10.3;

safeNumberEquals(point3a,point3b);      // false :(
```

很遗憾，`Number.EPSILON` 只在某些小量级数值/运算里勉强可用；在其它场景它太小，会出现“本应相等却判不等”（假阴性）。

你可以手工放大 `Number.EPSILON` 得到更大阈值，减少假阴性并过滤掉误差；但放大倍数完全依赖业务量级与运算路径，没有统一自动答案。

除非你非常明确自己在做什么，否则不建议把 `Number.EPSILON` 阈值法当通用方案。

| 提示： |
| :--- |
| 若想深入这个话题，建议读这篇文章。[^EpsilonBad] 若不能靠 `Number.EPSILON` 解决浮点误差，该怎么办？优先方案是把数值整体缩放为整数（或 bigint）后再运算，只在最终输出阶段还原小数。若做不到，考虑使用任意精度小数库，尽量避免原生 `number` 浮点计算；或把关键计算放到非 IEEE-754 的外部计算环境。 |

### 数值比较

和字符串一样，数字也可用同一组运算符做相等/关系比较。

无论数字字面量写成十进制、八进制、十六进制、科学计数法等哪种形式，比较时看的是底层存储值。也别忘了前一节的浮点误差：比较对底层二进制位非常敏感。

#### 数值相等比较

数值相等同样使用 `==` / `===` 或 `Object.is(..)`。也请记住：两侧类型相同时时，`==` 与 `===` 行为一致。

```js
42 == 42;                   // true
42 === 42;                  // true

42 == 43;                   // false
42 === 43;                  // false

Object.is(42,42);           // true
Object.is(42,43);           // false
```

当 `==` 需要做强制相等（类型不匹配）时，只要不是“双方同为字符串”，它就倾向数值比较（双方转数字）：

```js
// 数值（不是字符串）比较
42 == "42";                 // true
```

这里是把 `"42"` 强制成 `42`，而不是反过来。类型统一为 `number` 后，再做与 `===` 同等的精确值比较。

JS 不区分 `42`、`42.0`、`42.000000` 这些写法，它们底层是同一个数值；`==`/`===` 也据此给出结果：

```js
42 == 42.0;                 // true
42.0 == 42.00000;           // true
42.00 === 42.000;           // true
```

直觉上“同一个数字应相等”没问题，JS 也这么做。但 `0.3` 与 `0.1 + 0.2` 并非同一个底层值；后者只是非常接近。

有趣的是，这两个值差距小到小于 `Number.EPSILON`，以至于 JS 不能“精确处理这个差值的后续运算”；但 JS 仍能表示“确实有差”，所以你会看到 `0.30000000000000004` 尾部的 `4`。而且这个差值你甚至能写成字面量：`0.00000000000000004`（`4e-17`）。

JS 在 IEEE-754 下做不到的，是把这么小的数以足够精度参与更多计算并稳定得到符合直觉的结果。

因此 `0.1 + 0.2 == 0.3` 是 `false`：因为两者确实不同，即便这个差异很小、并且难以被稳定处理。

和字符串一样，`!=`（宽松不等）与 `!==`（严格不等）也可用于数字：`x != y` 近似 `!(x == y)`，`x !== y` 近似 `!(x === y)`。

数值相等里有两个让人烦的例外（无论 `==` 还是 `===`）：

```js
NaN === NaN;                // false -- 啊？
-0 === 0;                   // true -- 啊？？
```

`NaN` 永远不等于自身；`-0` 永远等于 `0`。很多人会意外：即便 `===` 也有这两条例外。

`Object.is(..)` 不受这两条例外影响，所以涉及 `NaN` 或 `-0` 时，优先用 `Object.is(..)`；只判断 `NaN` 也可用 `Number.isNaN(..)`。

#### 数值关系比较

和字符串一样，关系运算符（`<`、`<=`、`>`、`>=`）也用于数字。`<` 与 `>` 的语义很直观：

```js
41 < 42;                    // true

0.1 + 0.2 > 0.3;            // true（唉，IEEE-754）
```

别忘了：`<` 与 `>` 也会强制类型转换（除双方本来就是字符串的特殊路径外）。它们没有“严格关系比较”版本。

如果你要比较数值大小，避免强制的唯一办法是确保比较双方本来就是数字。

### 数学运算符

前面说过，数字最主要用途是做数学运算。下面看具体运算符。

基础算术运算符有：`+`（加）、`-`（减）、`*`（乘）、`/`（除）。还有 `**`（幂）与 `%`（取模/余数）。

它们对应的“计算并赋回”形式为：`+=`、`-=`、`*=`、`/=`、`**=`、`%=`，左侧必须是可赋值目标（变量或属性）。

| 注意： |
| :--- |
| 如前所示，`+` 在 JS 中是重载的：只要有一侧是字符串就做拼接（必要时把另一侧转字符串）；只有双方都不是字符串时才做数值加法。 |

这些算术运算符都是二元运算符（左右各一个操作数），且期望操作数是数字。若任一侧不是数字，会先强制成数字再算。强制规则后续章节详讲。

例如：

```js
40 + 2;                 // 42
44 - 2;                 // 42
21 * 2;                 // 42
84 / 2;                 // 42
7 ** 2;                 // 49
49 % 2;                 // 1

40 + "2";               // "402"（字符串拼接）
44 - "2";               // 42（"2" 被转成 2）
21 * "2";               // 42（同上）
84 / "2";               // 42（同上）
"7" ** "2";             // 49（双方都转数字）
"49" % "2";             // 1（同上）
```

`+` 和 `-` 还可作一元运算符（只接收一个操作数），同样期望数字，不是数字就先转：

```js
+42;                    // 42
-42;                    // -42

+"42";                  // 42
-"42";                  // -42
```

你可能觉得 `-42` 是“负四十二字面量”。语法上其实不是。JS 并不把负数视为独立字面量，而是“正数字面量 `42` + 前置一元 `-` 取反运算”。

于是会出现看似奇怪但合法的形式：

```js
-42;                    // -42
- 42;                   // -42
-
    42;                 // -42
```

也就是说，运算符与操作数之间允许空白，甚至换行；这对多数运算符都成立。

#### 自增与自减

还有两个一元数值运算符：`++`（自增）和 `--`（自减）。它们会计算后把结果赋回操作数（操作数必须可赋值）。

你可以把 `++` 理解成接近 `+= 1`，`--` 理解成接近 `-= 1`：

```js
myAge = 42;

myAge++;
myAge;                  // 43

numberOfHeadHairs--;
```

这两个运算符既可后置（如上），也可前置：

```js
myAge = 42;

++myAge;
myAge;                  // 43

--numberOfHeadHairs;
```

看起来前置/后置都“加一或减一”，结果似乎一样。区别是更细微的求值时机问题，不在“最终赋回值”本身。后续章节会再深入。

### 位运算符

JS 提供了若干位运算符用于对数字做位级操作。

但这些位操作并不是直接作用于 IEEE-754 的浮点位模式。流程是：先把操作数转成 32 位有符号整数，执行位运算，再把结果转回 IEEE-754 `number`。

同样要记住：这些运算都是“算出新值”，不会就地改写某个值本身。

* `&`（按位与）：逐位 AND；`42 & 36 === 32`

* `|`（按位或）：逐位 OR；`42 | 36 === 46`

* `^`（按位异或）：逐位 XOR；`42 ^ 36 === 14`

* `~`（按位非）：单操作数逐位取反；`~42 === -43`；按十进制等价关系可记作 `~x === -(x + 1)`

* `<<`（左移）：左操作数位模式左移右操作数指定的位数；`42 << 3 == 336`

* `>>`（右移）：算术右移（符号扩展）；右移丢弃右侧位，左侧补最高位（保持符号）；`42 >> 3 === 5`

* `>>>`（无符号右移/零填充右移）：与 `>>` 同样右移，但左侧固定补 `0`；`42 >>> 3 === 5`，而 `-43 >>> 3 === 536870906`

* `&=`、`|=`、`<<=`、`>>=`、`>>>=`：对应位运算后赋值回左侧（左侧必须可赋值）；注意不存在 `~=`

说实话，位运算在 JS 里并不算高频。但你可能偶尔见到：

```js
myGPA = 3.54;

myGPA | 0;              // 3
```

由于位运算只对 32 位整数生效，`| 0` 会把小数部分截掉（即 `Math.trunc(..)` 效果）。

| 警告： |
| :--- |
| 常见误解是把 `| 0` 当作向下取整（`Math.floor(..)`）。在正数上二者结果一致，但负数不同：`Math.floor(..)` 是朝 `-Infinity` 方向舍入，而 `| 0` 只是简单截断小数位。 |

### 数字值方法

数字值提供以下数字专属方法（以属性形式）：

* `toExponential(..)`：返回科学计数法字符串（如 `"4.2e+1"`）

* `toFixed(..)`：返回非科学计数法字符串，按指定小数位四舍五入或补零

* `toPrecision(..)`：与 `toFixed(..)` 类似，但参数是“有效数字位数”（含整数和小数部分）

* `toLocaleString(..)`：按当前 locale 生成数字字符串

```js
myAge = 42;

myAge.toExponential(3);         // "4.200e+1"
```

JS 语法里有个细节：处理数字字面量与属性访问时，`.` 可能有歧义。

如果 `.` 紧跟数字字面量且该数字还没有小数点，解析器会先把它当“小数点”；只有在明确不是字面量的一部分时，才会当属性访问。

```js
42 .toExponential(3);           // "4.200e+1"
```

这里空格消除了歧义，告诉解析器 `.` 是属性/方法访问。更常见的是加括号：

```js
(42).toExponential(3);          // "4.200e+1"
```

还有个“看起来怪怪的”写法：

```js
42..toExponential(3);           // "4.200e+1"
```

所谓“双点（double-dot）”写法中，第一个 `.` 被当作小数点，因此第二个 `.` 就只能是属性访问。

另外，第一个点后面即使没有小数位数字也合法：

```js
myAge = 41. + 1.;

myAge;                          // 42
```

`bigint` 字面量不允许小数，所以其后出现 `.` 一定是属性访问：

```js
42n.toString();                 // 42
```

### `Number` 的静态属性

* `Number.EPSILON`：`1` 与下一个更大可表示数之间的最小差值

* `Number.NaN`：与全局 `NaN` 等价，表示特殊无效数字

* `Number.MIN_SAFE_INTEGER` / `Number.MAX_SAFE_INTEGER`：绝对值最大的安全整数边界

* `Number.MIN_VALUE` / `Number.MAX_VALUE`：`number` 可表示的最小正值（最接近 `0`）与最大正值

* `Number.NEGATIVE_INFINITY` / `Number.POSITIVE_INFINITY`：与全局 `-Infinity` / `Infinity` 等价

### `Number` 的静态辅助方法

* `Number.isFinite(..)`：判断是否为有限数（是 `number` 且不是 `NaN`/`±Infinity`）

* `Number.isInteger(..)` / `Number.isSafeInteger(..)`：判断是否整数、是否落在安全整数范围（`-2^53 + 1` 到 `2^53 - 1`）

* `Number.isNaN(..)`：修复版全局 `isNaN(..)`，判断参数是否是 `NaN`

* `Number.parseFloat(..)` / `Number.parseInt(..)`：从左到右解析字符串中的数字，直到字符串结束或遇到非法字符

### 静态 `Math` 命名空间

由于 `number` 的主要用途是数学运算，JS 在 `Math` 命名空间上提供了大量数学常量与工具函数。

种类很多，这里只列几个示例：

```js
Math.PI;                        // 3.141592653589793

// 绝对值
Math.abs(-32.6);                // 32.6

// 舍入
Math.round(-32.6);              // -33

// 取最小/最大
Math.min(100,Math.max(0,42));   // 42
```

与同时也是 `Number(..)` 转换函数的 `Number` 不同，`Math` 只是装这些静态属性/方法的对象，不能像函数那样调用。

| 警告： |
| :--- |
| `Math` 里一个颇特殊成员是 `Math.random()`，它返回 `[0, 1)` 区间随机浮点数。随机数生成本质上是有状态副作用任务，放在“数学工具”里有点违和；更关键是安全层面长期存在误用：JS 的这个 PRNG 并不适合密码学场景（可预测）。Web 平台后来提供了更安全的 `crypto.getRandomValues(..)`（基于更可靠 PRNG），可向 typed-array 填充随机位，再解释为整数。如今普遍不建议在安全敏感场景使用 `Math.random()`。 |

### BigInt 与 Number 不能混算

第 1 章讲过：`number` 与 `bigint` 不能直接混用在同一运算里。即便是看似简单的自增逻辑也会踩坑：

```js
myAge = 42n;

myAge + 1;                  // 抛 TypeError！
myAge += 1;                 // 抛 TypeError！

myAge + 1n;                 // 43n
myAge += 1n;                // 43n

myAge++;
myAge;                      // 44n
```

因此，只要程序里同时出现 `number` 与 `bigint`，你就需要经常手工把一种类型转成另一种。

`BigInt(..)`（不带 `new`）可把 `number` 转成 `bigint`；反向则用 `Number(..)`（同样不带 `new`）：

```js
BigInt(42);                 // 42n

Number(42n);                // 42
```

但请注意，互转存在风险：

```js
BigInt(4.2);                // 抛 RangeError！
BigInt(NaN);                // 抛 RangeError！
BigInt(Infinity);           // 抛 RangeError！

Number(2n ** 1024n);        // Infinity
```

## 原始类型是基础

前两章我们深挖了 JS 原始值的行为。很多读者（包括作者自己）一开始可能都想跳过这些“基础”。但现在你应该能看到：这些概念其实非常关键。

当然，故事还远没结束。下一章我们会转向 JS 的对象类型（对象、数组等）。

[^TwitterUnicode]: "New update to the Twitter-Text library: Emoji character count"; Andy Piper; Oct 2018; https://twittercommunity.com/t/new-update-to-the-twitter-text-library-emoji-character-count/114607 ; Accessed July 2022

[^INTLAPI]: ECMAScript 2022 Internationalization API Specification; https://402.ecma-international.org/9.0/ ; Accessed August 2022

[^INTLCollator]: "Intl.Collator", MDN; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator ; Accessed August 2022

[^INTLSegmenter]: "Intl.Segmenter", MDN; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter ; Accessed August 2022

[^StrictEquality]: "7.2.16 IsStrictlyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-isstrictlyequal ; Accessed August 2022

[^LooseEquality]: "7.2.15 IsLooselyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-islooselyequal ; Accessed August 2022

[^INTLCollatorApi]: "Intl.Collator", MDN; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator ; Accessed August 2022

[^EpsilonBad]: "PLEASE don't follow the code recipe in the accepted answer", Stack Overflow; Daniel Scott; July 2019; https://stackoverflow.com/a/56967003/228852 ; Accessed August 2022
