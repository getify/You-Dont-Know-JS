# 你并不了解 JavaScript：类型与语法 - 第 2 版
# 第 4 章：强制类型转换

| 注意： |
| :--- |
| 草稿 |

我们已经系统讲完了 JS 里各种不同的值*类型*。在这个过程中，我们也不止一次提到过：从一种值类型转换到另一种值类型——更准确地说，是发生*强制类型转换*（coercion）。

本章我们就深入这个主题，把强制类型转换里的细节彻底拆开看清楚。

## 强制类型转换：显式 vs 隐式

有些开发者主张：当你在操作中明确写出了类型变化，这不该算 *coercion*，只能叫 type-cast 或 type-conversion。换句话说，他们认为 coercion 只可能是隐式的。

我不同意这种划分。在动态类型语言里，我会把任何类型转换都称作 *coercion*，不管它在代码里是否一眼可见。原因是：*显式* 与 *隐式* 的边界并不客观清晰，它高度主观。你觉得某次类型转换是隐式（因此是 *coercion*），而我觉得它是显式（于是你说它不算 *coercion*），这种区分本身就失去意义了。

接下来我们会同时考察各种*显式*与*隐式*的强制类型转换。提前剧透一下：大多数场景都能被争论成两边之一，所以我们会尽量以平衡视角去看。

### 隐式：坏，还是……？

在 JS 开发者里有个非常常见的观点：*coercion 是坏的*，更具体地说，*隐式 coercion 是坏的*。TypeScript 这类“类型意识（type-aware）”工具的流行，也很能说明这种倾向。

但这不是新观点。14 年前，Douglas Crockford 的《The Good Parts》就把*隐式 coercion*列为 JS 的 *bad parts* 之一。甚至 JS 的创造者 Brendan Eich 也经常表示，早期语言设计里加入*隐式 coercion*是个失误[^EichCoercion]，如今他对此感到后悔。

只要你接触 JS 超过几个月，几乎一定听过这类强烈、主流的说法。如果你接触 JS 已有很多年，很可能你也早已有定见。

事实上，你很难再找出另一个知名 JS 教学来源，会像我这样强力支持 coercion（几乎所有形式）；我支持——本书也支持！——但很多时候我都像是在荒野里徒劳呐喊的孤独声音。

不过这些年我有个观察：许多公开谴责*隐式 coercion*的人，自己写代码时其实也在用*隐式 coercion*。嗯……

Douglas Crockford 说要避免*隐式 coercion*这个错误[^CrockfordCoercion]，但他的代码里也写 `if (..)`，并让非布尔值参与条件判断[^CrockfordIfs]。过去我指出这一点时，很多人会反驳说“转成布尔不算真正 coercion”。呃……好吧？

Brendan Eich 说他后悔*隐式 coercion*，但他又公开推荐[^BrendanToString] `x + ""` 这类习惯写法（还有别的！）把 `x` 强制成字符串（后面会讲）；而这显然就是*隐式 coercion*。

那我们该怎么看这种不一致？只是“嘴上这么说、手上那么做”的小矛盾？还是背后另有更深层含义？

我现在不急着下最终结论。我希望你在继续阅读本章与全书时，认真反复思考这个问题。

## 抽象操作（Abstracts）

现在我已经“逼”你用比以往更深的层次审视 coercion，我们先从 JS 规范里 coercion 的基础机制讲起。

规范定义了一组*抽象操作*（abstract operations）[^AbstractOperations]，它们描述了内部如何从一种值类型转换到另一种值类型。理解这些操作很重要，因为语言里具体 coercion 机制会以不同方式组合调用它们。

这些操作看起来像可以直接调用的真实函数，比如 `ToString(..)`、`ToNumber(..)`。但所谓 *abstract* 的意思是：这些名字只是概念层面的标识，并不是你能在程序里*直接调用*的函数。我们只能通过代码中的语句/表达式，间接触发它们。

### ToBoolean

所有决策（条件分支）最终都要求一个布尔值 `true` 或 `false`。但在实际开发里，我们又经常希望依据非布尔值做判断，比如某个字符串是空还是非空。

当非布尔值出现在需要布尔值的上下文（例如 `if` 条件、`for` 条件）时，就会触发抽象操作 `ToBoolean(..)`[^ToBoolean] 来完成 coercion。

JS 的所有值都落在两个桶之一：*truthy* 或 *falsy*。truthy 值经过 `ToBoolean()` 会变成 `true`，falsy 值会变成 `false`：

```
// ToBoolean() 是抽象操作

ToBoolean(undefined);               // false
ToBoolean(null);                    // false
ToBoolean("");                      // false
ToBoolean(0);                       // false
ToBoolean(-0);                      // false
ToBoolean(0n);                      // false
ToBoolean(NaN);                     // false
```

规则很简单：*除上面列表外的任何值*都属于 truthy，经 `ToBoolean()` 变成 `true`：

```
ToBoolean("hello");                 // true
ToBoolean(42);                      // true
ToBoolean([ 1, 2, 3 ]);             // true
ToBoolean({ a: 1 });                // true
```

就算是 `"   "`（只有空白字符的字符串）、`[]`（空数组）、`{}`（空对象）这类直觉上“更像 false”的值，也一样会 coercion 到 `true`。

| 警告： |
| :--- |
| 这个 truthy 规则确实存在极少数棘手例外。比如 Web 平台里长期存在但已废弃的 `document.all` 集合特性，虽然不能彻底移除（会破坏太多站点）。在仍定义 `document.all` 的环境里，它表现为一种“falsy object”[^ExoticFalsyObjects]——行为上像 `undefined` 并最终 coercion 到 `false`；因此老式检测 `if (document.all) { .. }` 已经不会成立。 |

`ToBoolean()` 更像一张查表，而不是“把非布尔值转布尔”的分步算法。于是有些人主张这不算“真正的 coercion”。我认为这说法不成立。`ToBoolean()` 的确在把非布尔值类型转换成布尔值，这就是清晰的类型强制转换（即便实现方式只是查表，不是复杂算法）。

要记住：这些布尔 coercion 规则只在 `ToBoolean()` 被触发时才适用。JS 里有些写法看起来“像是在做布尔 coercion”，但实际上并没有触发它。后面会讲。

### ToPrimitive

凡是不是原始值（primitive）的值，都可以借助 `ToPrimitive()`（具体是 `OrdinaryToPrimitive()`[^OrdinaryToPrimitive]）降到原始值。通常 `ToPrimitive()` 会收到一个 *hint*，告诉它更偏好 `number` 还是 `string`。

```
// ToPrimitive() 是抽象操作

ToPrimitive({ a: 1 },"string");          // "[object Object]"

ToPrimitive({ a: 1 },"number");          // NaN
```

`ToPrimitive()` 会在对象上查找 `toString()` 或 `valueOf()`；查找顺序由 *hint* 决定。`"string"` 表示先 `toString()` 再 `valueOf()`；`"number"`（或没给 *hint*）表示先 `valueOf()` 再 `toString()`。

若方法返回值匹配 *hint* 期望类型，操作就结束。若不匹配，则会再尝试另一个方法（若存在）。

如果这两个方法都没产出符合 *hint* 的值，最终返回值会再被强制走对应抽象操作：`ToString()` 或 `ToNumber()`。

### ToString

几乎所有非字符串值都可通过 `ToString()` coercion 成字符串表示[^ToString]。对原始值来说这通常很直观：

```
// ToString() 是抽象操作

ToString(42.0);                 // "42"
ToString(-3);                   // "-3"
ToString(Infinity);             // "Infinity"
ToString(NaN);                  // "NaN"
ToString(42n);                  // "42"

ToString(true);                 // "true"
ToString(false);                // "false"

ToString(null);                 // "null"
ToString(undefined);            // "undefined"
```

也有一些结果不太符合直觉。正如第 2 章提到的，非常大或非常小的数会用科学计数法表示：

```
ToString(Number.MAX_VALUE);     // "1.7976931348623157e+308"
ToString(Math.EPSILON);         // "2.220446049250313e-16"
```

另一个反直觉点是 `-0`：

```
ToString(-0);                   // "0" -- wtf?
```

这不是 bug，而是 JS 早期就故意设定的行为，假定开发者通常不希望看到负零输出。

有一种原始值类型*不允许*（至少不允许隐式）coercion 到字符串：`symbol`。

```
ToString(Symbol("ok"));         // 抛出 TypeError 异常
```

| 警告： |
| :--- |
| 调用具体函数 `String()`[^StringFunction]（不带 `new`）通常被认为“只是”在触发 `ToString()`。这大体上没错，但并不完全正确。`String(Symbol("ok"))` 可以工作，而抽象的 `ToString(Symbol(..))` 本身会抛异常。本章稍后会继续讲 `String(..)`。 |

#### 默认 `toString()`

当 `ToString()` 作用于对象类型值时，它会委托给 `ToPrimitive()`（前面解释过），并以 `"string"` 作为 *hint*：

```
ToString(new String("abc"));        // "abc"
ToString(new Number(42));           // "42"

ToString({ a: 1 });                 // "[object Object]"
ToString([ 1, 2, 3 ]);              // "1,2,3"
```

由于委托的是 `ToPrimitive(..,"string")`，这些对象都会调用其默认 `toString()` 方法（通过 `[[Prototype]]` 继承得到）。

### ToNumber

像数字字符串这类“看起来像数字”的非数字值，通常能借助 `ToNumber()` coercion 成数值表示[^ToNumber]：

```
// ToNumber() 是抽象操作

ToNumber("42");                     // 42
ToNumber("-3");                     // -3
ToNumber("1.2300");                 // 1.23
ToNumber("   8.0    ");             // 8
```

如果整个值（除空白外）不能*完整*匹配合法数字，结果是 `NaN`：

```
ToNumber("123px");                  // NaN
ToNumber("hello");                  // NaN
```

其他原始值也有指定的数值映射：

```
ToNumber(true);                     // 1
ToNumber(false);                    // 0

ToNumber(null);                     // 0
ToNumber(undefined);                // NaN
```

`ToNumber()` 里还有一些比较“意外”的映射：

```
ToNumber("");                       // 0
ToNumber("       ");                // 0
```

| 注意： |
| :--- |
| 我说“意外”，是因为我认为它们 coercion 到 `NaN`（像 `undefined` 那样）会更合理。 |

有些原始值*不允许* coercion 到数字，这时不是 `NaN`，而是异常：

```
ToNumber(42n);                      // 抛出 TypeError 异常
ToNumber(Symbol("42"));             // 抛出 TypeError 异常
```

| 警告： |
| :--- |
| 调用具体函数 `Number()`[^NumberFunction]（不带 `new`）通常也被理解为“只是”触发 `ToNumber()` 把值转成 number。大体对，但不完全。`Number(42n)` 可以工作，而抽象 `ToNumber(42n)` 本身会抛异常。 |

#### 其他抽象数值转换

除了 `ToNumber()`，规范还定义了 `ToNumeric()`：先对值触发 `ToPrimitive()`，然后若该值还不是 `bigint` 类型，再有条件委托给 `ToNumber()`。

规范里还定义了很多把值转换到 `number` 更窄子集的抽象操作：

* `ToIntegerOrInfinity()`
* `ToInt32()`
* `ToUint32()`
* `ToInt16()`
* `ToUint16()`
* `ToInt8()`
* `ToUint8()`
* `ToUint8Clamp()`

与 `bigint` 相关的还有：

* `ToBigInt()`
* `StringToBigInt()`
* `ToBigInt64()`
* `ToBigUint64()`

这些操作从名字大概就能猜出用途，也可以去规范里直接看算法细节。大多数 JS 操作更常触发的是 `ToNumber()` 这类高层操作，而不是这些更具体的转换。

#### 默认 `valueOf()`

当 `ToNumber()` 作用于对象值类型时，它会委托到 `ToPrimitive()`（前面解释过），并以 `"number"` 作为 *hint*：

```
ToNumber(new String("abc"));        // NaN
ToNumber(new Number(42));           // 42

ToNumber({ a: 1 });                 // NaN
ToNumber([ 1, 2, 3 ]);              // NaN
ToNumber([]);                       // 0
```

由于委托的是 `ToPrimitive(..,"number")`，这些对象都会调用其默认 `valueOf()` 方法（通过 `[[Prototype]]` 继承得到）。

### 相等比较（Equality Comparison）

当 JS 要判断两个值是否为“同一个值”时，会触发 `SameValue()`[^SameValue]，它再委托给一组相关子操作。

这个操作非常窄且严格：不做 coercion，也没有额外特例。两个值*完全相同*就返回 `true`，否则 `false`：

```
// SameValue() 是抽象操作

SameValue("hello","\x68ello");          // true
SameValue("\u{1F4F1}","\uD83D\uDCF1");  // true
SameValue(42,42);                       // true
SameValue(NaN,NaN);                     // true

SameValue("\u00e9","\u0065\u0301");     // false
SameValue(0,-0);                        // false
SameValue([1,2,3],[1,2,3]);             // false
```

它还有一个变体 `SameValueZero()` 及其相关子操作。核心区别是：`0` 与 `-0` 在这里不区分。

```
// SameValueZero() 是抽象操作

SameValueZero(0,-0);                    // true
```

如果比较的是数值（`number` 或 `bigint`），`SameValue()` 与 `SameValueZero()` 会分别委托给同名的 number/bigint 专用子操作。

否则，如果双方都是非数值，则委托给 `SameValueNonNumeric()`：

```
// SameValueNonNumeric() 是抽象操作

SameValueNonNumeric("hello","hello");   // true

SameValueNonNumeric([1,2,3],[1,2,3]);   // false
```

#### 更高层抽象的相等性

除了 `SameValue()` 及其变体，规范还定义了两个更高层的抽象相等比较操作：

* `IsStrictlyEqual()`[^StrictEquality]
* `IsLooselyEqual()`[^LooseEquality]

`IsStrictlyEqual()` 在两侧值类型不同的情况下会立刻返回 `false`。

若值类型相同，`IsStrictlyEqual()` 会委托到 number/bigint 的比较子操作[^NumericAbstractOps]。你可能以为它会委托到前面提过的数值版 `SameValue()` / `SameValueZero()`；但实际上它委托的是 `Number:equal()`[^NumberEqual] 或 `BigInt:equal()`[^BigIntEqual]。

`Number:SameValue()` 与 `Number:equal()` 的区别之一在于，后者对 `0` 与 `-0` 这个边角情况的定义不同：

```
// 下面这些都是抽象操作

Number:SameValue(0,-0);             // false
Number:SameValueZero(0,-0);         // true
Number:equal(0,-0);                 // true
```

它们在 `NaN` 与 `NaN` 比较上也不同：

```
Number:SameValue(NaN,NaN);          // true
Number:equal(NaN,NaN);              // false
```

| 警告： |
| :--- |
| 换句话说，虽然叫 `IsStrictlyEqual()`，它在涉及 `-0` 或 `NaN` 时并没有 `SameValue()` 那么“严格”。 |

`IsLooselyEqual()` 同样先看两侧值类型；若类型相同，它会立刻委托到 `IsStrictlyEqual()`。

但如果两侧类型不同，`IsLooselyEqual()` 会执行一系列*强制相等*（coercive equality）步骤。关键点是：这个算法总在努力把比较降解到“双方类型一致”，而且通常偏向 `number` / `bigint`。

这个 *coercive equality* 过程可大致概括为：

1. 一侧是 `null`、另一侧是 `undefined` 时，`IsLooselyEqual()` 返回 `true`。也就是说它支持 *nullish* 相等：`null` 与 `undefined` 强制相等（且不与其他值相等）。

2. 一侧是 `number`、另一侧是 `string` 时，把 `string` 通过 `ToNumber()` coercion 成 `number`。

3. 一侧是 `bigint`、另一侧是 `string` 时，把 `string` 通过 `StringToBigInt()` coercion 成 `bigint`。

4. 一侧是 `boolean` 时，把它 coercion 成 `number`。

5. 一侧是非原始值（对象等）时，用 `ToPrimitive()` coercion 成原始值；虽然没显式给 *hint*，默认行为等价于 `"number"` *hint*。

上述步骤每执行一次 coercion，算法都会以新值*递归*重启。直到类型一致，再委托给 `IsStrictlyEqual()` 比较。

这个算法说明了什么？首先它确实偏向 `number`（或 `bigint`）比较；它不会把值 coercion 到 `string` 或 `boolean` 去比。

更重要的是，`IsLooselyEqual()` 与 `IsStrictlyEqual()` 都是类型敏感的（type-sensitive）。`IsStrictlyEqual()` 类型不匹配就直接退出；`IsLooselyEqual()` 则会多做一步，把类型不匹配的一侧（理想上转成 `number`/`bigint`）调成同类型再比。

并且，一旦类型相同，两者行为就一致——`IsLooselyEqual()` 会委托给 `IsStrictlyEqual()`。

### 关系比较（Relational Comparison）

当 JS 做关系比较（例如一个值是否“小于”另一个值）时，会触发 `IsLessThan()`[^LessThan] 这个抽象操作：

```
// IsLessThan() 是抽象操作

IsLessThan(1,2, /*LeftFirst=*/ true );            // true
```

规范里没有 `IsGreaterThan()`；“大于”比较是通过交换 `IsLessThan()` 前两个参数实现。为保持从左到右求值语义（避免副作用顺序变化），`IsLessThan()` 还有第三个参数 `LeftFirst`；若为 `false`，表示参数顺序是反转比较，需要先计算第二个参数。

```
IsLessThan(1,2, /*LeftFirst=*/ true );            // true

// 等价于一个虚构的 "IsGreaterThan()"
IsLessThan(2,1, /*LeftFirst=*/ false );           // false
```

和 `IsLooselyEqual()` 类似，`IsLessThan()` 也是*带 coercion 的*；它会先确保两边值类型匹配，且偏向数值比较。不存在一个不做 coercion 的 `IsStrictLessThan()`。

例如一侧是 `string`、另一侧是 `bigint` 时，会先把 `string` 用 `StringToBigInt()` coercion 成 `bigint`。类型一致后，`IsLessThan()` 再按下面规则继续。

#### 字符串比较

当两边都是 `string` 时，`IsLessThan()` 先看左侧是否是右侧的前缀（即前 *n* 个字符）[^StringPrefix]；若是，返回 `true`。

如果互不为前缀，就找出两字符串（按起点到终点方向）第一个不同字符位置，比较两侧该位置码元（数值）大小，并返回结果。

通常码元顺序与字典序直觉一致：

```
IsLessThan("a","b", /*LeftFirst=*/ true );        // true
```

数字字符也会按字符比较（不是按数值）：

```
IsLessThan("101","12", /*LeftFirst=*/ true );     // true
```

Unicode 码元顺序里甚至有一点“幽默”：

```
IsLessThan("🐔","🥚", /*LeftFirst=*/ true );      // true
```

至少我们终于回答了“先有鸡还是先有蛋”！

#### 数值比较

数值比较时，`IsLessThan()` 分别委托给 `Number:lessThan()` 或 `BigInt:lessThan()`[^NumericAbstractOps]：

```
IsLessThan(41,42, /*LeftFirst=*/ true );          // true

IsLessThan(-0,0, /*LeftFirst=*/ true );           // false

IsLessThan(NaN,1, /*LeftFirst=*/ true );          // false

IsLessThan(41n,42n, /*LeftFirst=*/ true );        // true
```

## 具体 coercion 形式（Concrete Coercions）

前面我们已经把 JS 为 coercion 定义的抽象操作都过了一遍。现在转向程序里可写出的具体语句/表达式，它们会触发这些操作。

### To Boolean

要把一个非 `boolean` 值 coercion 到 `boolean`，就需要 `ToBoolean()`（本章前面讲过）。

在讨论*怎么触发*之前，先说说你*为什么*要强制做 `ToBoolean()`。

从可读性看，显式标注类型 coercion 有时更好（但并非绝对）。从功能角度看，最常见原因是把数据传给外部系统——比如向 API 提交 JSON——而目标端希望拿到直接的 `true` / `false`，不再自己做 coercion。

触发 `ToBoolean()` 的方式有很多。最*显式*（最直观）的一种是 `Boolean(..)` 函数：

```js
Boolean("hello");               // true
Boolean(42);                    // true

Boolean("");                    // false
Boolean(0);                     // false
```

如第 3 章所说，注意这里 `Boolean(..)` 没有 `new`，它是在触发抽象操作 `ToBoolean()`。

实际开发中，开发者并不总是用 `Boolean(..)` 做显式 coercion。更常见的是双 `!` 习惯写法：

```js
!!"hello";                      // true
!!42;                           // true

!!"";                           // false
!!0;                            // false
```

`!!` 不是一个独立运算符。它其实是两个一元 `!`。第一个 `!` 会先把非布尔 coercion 成布尔再取反；第二个 `!` 再把结果反回来。

那么，`Boolean(..)` 与 `!!`，你觉得哪个更“显式”？

考虑到 `!` 先翻转、再用第二个 `!` 翻回去，我会说 `Boolean(..)` 在“把非布尔转布尔”这件事上更显式。但看开源代码，`!!` 的使用频率明显更高。

如果把“显式”定义为“最直接、最明显地完成某动作”，`Boolean(..)` 更胜一筹；若定义为“最容易被识别成这个动作”，`!!` 可能更有优势。这里有标准答案吗？

你先带着这个问题，再看另一个会在底层触发 `ToBoolean()` 的机制：

```js
specialNumber = 42;

if (specialNumber) {
    // ..
}
```

`if` 的控制流决策必须基于 `boolean`。若给它的是非布尔值，就会执行 `ToBoolean()` *coercion*。

和 `Boolean(..)`/`!!` 不同，`if` 里的这次 coercion 是瞬时的：程序拿不到 coercion 后的值，它仅供 `if` 内部使用。有人会据此说“程序不持有这个值就不算 coercion”。我不同意，因为它确实改变了程序行为。

很多其他语句也会触发 `ToBoolean()`，包括三元 `? :`、`for`/`while` 循环。还有逻辑运算符 `&&`（逻辑与）和 `||`（逻辑或）。例如：

```js
isLoggedIn = user.sessionID || req.cookie["Session-ID"];

isAdmin = isLoggedIn && ("admin" in user.permissions);
```

对这两个运算符，都会先求值左侧表达式；若它本身不是 `boolean`，就先触发 `ToBoolean()` 得到条件判断所需布尔值。

| 注意： |
| :--- |
| 简述这两个运算符：`||` 中，若左侧值（必要时先 coercion）为 `true`，返回左侧*coercion 前*原值；否则求值并返回右侧（不 coercion）。`&&` 中，若左侧值（必要时先 coercion）为 `false`，返回左侧*coercion 前*原值；否则求值并返回右侧（不 coercion）。也就是说，`&&` 和 `||` 都会对左侧操作数强制执行 `ToBoolean()` 以做决策，但两者最终结果都不会被强制转成 `boolean`。 |

在上例里，尽管变量名像布尔，`isLoggedIn` 很可能并不真是 `boolean`；若它是 truthy，`isAdmin` 也未必是 `boolean`。这种代码很常见，但“以为结果是布尔”其实很危险。下一章我们会回来看这组例子与这两个运算符。

这些语句/表达式（`if (..)`、`||`、`&&` 等）里的条件决策，究竟是*显式* coercion 还是*隐式* coercion？

我仍然认为取决于视角。规范非常明确地规定：它们只能用布尔条件值做决策，收到非布尔就必须 coercion。另一方面，也可以强有力地论证：这些内部 coercion 只是 `if`/`&&` 等机制的次要（隐式）效果。

而且正如前面 `ToBoolean()` 讨论提到的，有些人根本不认为触发 `ToBoolean()` 属于 coercion。

我觉得这个说法太牵强了。我的看法是：`Boolean(..)` 是最优先的*显式* coercion 形式。`!!`、`if`、`for`、`while`、`&&`、`||` 都是在*隐式* coercion 非布尔值，但我接受这种用法。

既然大多数开发者（包括 Doug Crockford 这样的知名人物）在实践中也会写隐式（布尔）coercion[^CrockfordIfs]，那至少可以说：*某些形式*的*隐式* coercion 是被广泛接受的——尽管口头上常常不是这么说。

### To String

和 `ToBoolean()` 类似，触发 `ToString()`（前文已讲）的方式也有多种。哪种更好，同样带有主观性。

和 `Boolean(..)` 一样，`String(..)`（不带 `new`）是触发*显式* `ToString()` coercion 的主要方式：

```js
String(true);                   // "true"
String(42);                     // "42"
String(-0);                     // "0"
String(Infinity);               // "Infinity"

String(null);                   // "null"
String(undefined);              // "undefined"
```

但 `String(..)` 不只是“触发 `ToString()`”这么简单。例如：

```js
String(Symbol("ok"));           // "Symbol(ok)"
```

这能工作，是因为 `symbol` 的*显式*字符串 coercion 是允许的。但在符号值发生*隐式*字符串 coercion 的场景（如 `Symbol("ok") + ""`）里，底层 `ToString()` 会抛异常。说明 `String(..)` 不等同于纯粹 `ToString()`。稍后继续讲 symbol 的*隐式*字符串 coercion。

如果你对对象值（数组等）调用 `String(..)`，会经由 `ToString()` 触发 `ToPrimitive()`，然后查找并调用该值的 `toString()`：

```js
String([1,2,3]);                // "1,2,3"

String(x => x + 1);             // "x => x + 1"
```

除了 `String(..)`，任何非 nullish（既不是 `null` 也不是 `undefined`）的原始值，都可通过自动装箱（见第 3 章）拿到对应包装对象，并调用 `toString()`：

```js
true.toString();                // "true"
42..toString();                 // "42"
-0..toString();                 // "0"
Infinity.toString();            // "Infinity"
Symbol("ok").toString();        // "Symbol(ok)"
```

| 注意： |
| :--- |
| 要注意，这些 `toString()` 方法不一定会触发抽象 `ToString()`；它们只是各自定义了“如何把该值表示成字符串”。 |

刚才 `String(..)` 的例子也展示了：各类对象子类型——数组、函数、正则、`Date` 实例、`Error` 实例等——都定义了自己的 `toString()`，可以直接调用：

```js
[1,2,3].toString();             // "1,2,3"

(x => x + 1).toString();        // "x => x + 1"
```

并且，默认通过 `[[Prototype]]` 链接到 `Object.prototype` 的普通对象，也有默认 `toString()`：

```js
({ a : 1 }).toString();         // "[object Object]"
```

那么 `toString()` 这种 coercion 算显式还是隐式？还是那句话：看角度。它自描述性很强，偏显式；但它常依赖自动装箱，而自动装箱本身又相当隐式。

再看一个很常见、且被“重量级人物”推荐过的字符串 coercion 习惯写法。回忆第 2 章“字符串拼接”：`+` 是重载运算符，只要任一操作数已是字符串，就优先做字符串拼接，并在必要时把非字符串 coercion 为字符串。

看例子：

```js
true + "";                      // "true"
42 + "";                        // "42"
null + "";                      // "null"
undefined + "";                 // "undefined"
```

`+ ""` 这个写法就是利用 `+` 的重载做字符串 coercion，同时不改变最终字符串结果。顺带一提，把操作数反过来（`"" + ..`）效果一样。

| 警告： |
| :--- |
| 有个极常见误解：`String(x)` 与 `x + ""` 基本等价，只是前者显式、后者隐式。其实并不完全对！本章后面的 “To Primitive” 会回到这个点。 |

有人认为这也算显式 coercion。但我认为它明显更隐式：它借用了 `+` 的重载行为；`""` 只是间接触发 coercion 且不改变结果。再看看对 symbol 用这个写法会怎样：

```js
Symbol("ok") + "";              // 抛出 TypeError 异常
```

| 警告： |
| :--- |
| TC39 有意允许 symbol 的*显式* coercion（`String(Symbol("ok"))`），但禁止*隐式* coercion（`Symbol("ok") + ""`）[^SymbolString]。因为 symbol 作为原始值经常出现在字符串也会出现的位置，太容易被误当成字符串。设计者希望开发者必须明确表达“我要把 symbol 转成字符串”，以减少误解。这是语言里*极少数*明确表达并执行“显式 vs 隐式”立场差异的案例。 |

为什么会这样？因为 JS 将 `+ ""` 视作*隐式* coercion，所以 symbol 触发时抛异常。我认为这几乎是铁证。

尽管如此，正如我在本章开头说的，Brendan Eich 依然推荐 `+ ""`[^BrendanToString] 作为把值转字符串的*最佳*方式。这至少说明他支持某一部分*隐式* coercion 实践。他对隐式 coercion 的看法，显然比“一刀切全都坏”更细腻。

### To Number

数值 coercion 比字符串 coercion 稍复杂，因为目标类型可能是 `number`，也可能是 `bigint`。同时，可被有效表示为数值的值集合更小（其他都会变 `NaN`）。

先看 `Number(..)` 与 `BigInt(..)`（都不带 `new`）：

```js
Number("42");                   // 42
Number("-3.141596");            // -3.141596
Number("-0");                   // -0

BigInt("42");                   // 42n
BigInt("-0");                   // 0n
```

`Number` coercion 失败（无法识别）会得到 `NaN`（见第 1 章“无效数字”），而 `BigInt` 会抛异常：

```js
Number("123px");                // NaN

BigInt("123px");
// SyntaxError: Cannot convert 123px to a BigInt
```

另外，虽然 `42n` 是合法 `bigint` 字面量语法，但字符串 `"42n"` 不是任何 coercion 形式认可的 `bigint` 表示：

```js
Number("42n");                  // NaN

BigInt("42n");
// SyntaxError: Cannot convert 42n to a BigInt
```

不过，我们可以 coercion 其他进制表示的数字字符串（第 1 章有更详细说明）：

```js
Number("0b101010");             // 42

BigInt("0b101010");             // 42n
```

`Number(..)` 与 `BigInt(..)` 常接收字符串，但并不限于字符串。比如 `true` / `false` 也会 coercion 到常见数值等价物：

```js
Number(true);                   // 1
Number(false);                  // 0

BigInt(true);                   // 1n
BigInt(false);                  // 0n
```

`number` 与 `bigint` 之间也通常可互相 coercion：

```js
Number(42n);                    // 42
Number(42n ** 1000n);           // Infinity

BigInt(42);                     // 42n
```

也可用一元 `+`，它通常被认为和 `Number(..)` coercion 一样：

```js
+"42";                          // 42
+"0b101010";                    // 42
```

但要小心：某些不安全/无效 coercion 会抛异常：

```js
BigInt(3.141596);
// RangeError: The number 3.141596 cannot be converted to a BigInt

+42n;
// TypeError: Cannot convert a BigInt value to a number
```

显然，`3.141596` 不能安全 coercion 为整数，更别说 `bigint`。

而 `+42n` 抛异常是个很有意思的点。对比之下，`Number(42n)` 却可以，因此 `+42n` 失败会让人意外。

| 警告： |
| :--- |
| 这种意外感更强是因为很多人把前置 `+` 理解成“正数标记”，就像前置 `-` 理解成“负数标记”。但第 1 章解释过：JS 数值语法（`number` 和 `bigint`）没有“负值字面量”语法。所有数字字面量默认都按“正数”解析。前置 `+` / `-` 实际上是一元运算符，作用于解析完成后的（正）数字。 |

所以 `+42n` 会被解析为 `+(42n)`。可为什么还是抛异常？

还记得前面 symbol 的例子吗？显式字符串 coercion 允许，隐式不允许。这里同理：语言设计把 `bigint` 前的一元 `+` 视为*隐式* `ToNumber()` coercion（因此禁用），而 `Number(..)` 视为*显式* `ToNumber()` coercion（因此允许）。

也就是说，和许多人的假设相反，`Number(..)` 与 `+` 不是可互换的。我认为 `Number(..)` 更安全、更可靠。

#### 数学运算

数学运算符（`+`、`-`、`*`、`/`、`%`、`**`）都期望操作数是数值。若传入非 `number`，该值会先 coercion 成 `number` 再计算。

类似 `x + ""` 用于字符串 coercion，`x - 0` 是一个安全把 `x` coercion 成 number 的习惯写法。

| 警告： |
| :--- |
| `x + 0` 不那么安全，因为 `+` 可能走字符串拼接重载（只要一侧已是字符串）。`-` 没有这种重载，所以只会做 `number` coercion。当然 `x * 1`、`x / 1`、甚至 `x ** 1` 数学上通常也等价，但更少见，容易让读者困惑；应尽量避免。`x % 1` 看似也可行，但会引入浮点偏差风险（见第 2 章“浮点精度误差”）。 |

无论使用哪种数学运算符，若 coercion 失败，结果就是 `NaN`，这些运算符都会把 `NaN` 继续传播出去。

#### 位运算

位运算符（`|`、`&`、`^`、`>>`、`<<`、`<<<`）都要求 number 操作数，并且会把值钳制到 32 位整数。

如果你确定处理的数都安全落在 32 位整数范围内，`x | 0` 也是常见表达式习惯：必要时把 `x` coercion 到 `number`。

另外，JS 引擎知道这些值是整数后，有机会做整数数学优化。`x | 0` 就是多年以前 ASM.js[^ASMjs] 推荐的一种“类型注解”手法。

#### 属性访问

对象属性访问（以及数组下标访问）也是隐式 coercion 的发生点。

看例子：

```js
myObj = {};

myObj[3] = "hello";
myObj["3"] = "world";

console.log( myObj );
```

你预期对象里有两个不同属性吗：数字 `3`（值 `"hello"`）和字符串 `"3"`（值 `"world"`）？还是觉得它们其实是同一个位置？

你跑这段代码会看到：对象只有一个属性，且值是 `"world"`。说明 JS 内部在访问属性时要么把 `3` coercion 成 `"3"`，要么反过来。

有意思的是，控制台可能这样显示对象：

```js
console.log( myObj );
// {3: 'world'}
```

这里显示的 `3` 是数字属性名吗？不一定。再加个属性看看：

```js
myObj.something = 42;

console.log( myObj )
// {3: 'world', something: 42}
```

这说明该控制台输出通常不给字符串属性名加引号，所以不能仅凭 `3`（而非 `"3"`）判断真实类型。

看规范里对象值定义[^ObjectValue]，有这样一句：

> A property key value is either an ECMAScript String value or a Symbol value. All String and Symbol values, including the empty String, are valid as property keys. A property name is a property key that is a String value.

也就是说，JS 对象属性键只有字符串（或 symbol）。那数字 `3` 应该会被 coercion 成字符串 `"3"`，对吧？

同一节规范还说：

> An integer index is a String-valued property key that is a canonical numeric String (see 7.1.21) and whose numeric value is either +0𝔽 or a positive integral Number ≤ 𝔽(253 - 1). An array index is an integer index whose numeric value i is in the range +0𝔽 ≤ i < 𝔽(232 - 1).

如果属性键（如 `"3"`）长得像数字，它会被当作 integer index。嗯……这看起来又像是在暗示和刚才相反的方向？

但根据前一个引用，属性键仍然*只能*是字符串（或 symbol）。所以这里的 “integer index” 描述的应是语义用途：开发者在代码里写了 `3` 这种“整数索引”意图；JS 实际存储仍是在“规范数字字符串”对应的位置。

再看用其他值类型做属性键的情况：`true`、`null`、`undefined`、甚至对象：

```js
myObj[true] = 100;
myObj[null] = 200;
myObj[undefined] = 300;
myObj[ {a:1} ] = 400;

console.log(myObj);
// {3: 'world', something: 42, true: 100, null: 200,
// undefined: 300, [object Object]: 400}
```

可以看到，这些值类型都被 coercion 成字符串后用作对象属性名。

但先别急着下结论“所有东西（数字也一样）都会 coercion 到字符串”。再看数组：

```js
myArr = [];

myArr[3] = "hello";
myArr["3"] = "world";

console.log( myArr );
// [empty × 3, 'world']
```

控制台显示数组通常与普通对象不同。但我们仍看到数组只有一个 `"world"`，放在与 `3` 对应的数值下标位置。

这又像是在暗示另一种语义：数组值是按数字位置存储。如果再给数组加个字符串属性名：

```js
myArr.something = 42;
console.log( myArr );
// [empty × 3, 'world', something: 42]
```

你会看到控制台对数组的数值索引位置通常不显示属性名，而 `something` 这种普通属性会显示名字。

另外，像 v8 这样的引擎出于性能优化，常会把“看起来像数字的字符串属性键”特殊处理为类似数组下标的内部存储。也就是说，程序层面你像是在访问 `"3"`，但引擎底层可能按 `3` 来存！

这些现象我们该怎么理解？

规范清楚指出：对象属性行为上应被当作字符串（或 symbol）。因此可以认为：在对象上用 `3` 访问属性，内部效果就是把属性名 coercion 成 `"3"`。

但对数组，我们观察到一种近似相反语义：用 `"3"` 访问属性会命中数值索引 `3`，仿佛字符串被 coercion 成数字。这更多是因为数组天然按数值索引工作，也可能反映了引擎实现/优化细节。

重点在于：对象不能“直接拿任意值当属性名”。只要不是字符串或数字（以及 symbol 这类规范支持键），就几乎可以预期一定会发生 coercion。

必须提前认知并设计它，而不是等它在将来变成 bug 才被动踩坑。

### To Primitive

JS 里的大多数运算符，包括前面看过的字符串与数字 coercion，都设计为作用在原始值上。当这些运算符用于对象值时，会触发抽象算法 `ToPrimitive`（前面已讲）把对象 coercion 成原始值。

先定义一个用于观察行为的对象：

```js
spyObject = {
    toString() {
        console.log("toString() invoked!");
        return "10";
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return 42;
    },
};
```

这个对象同时定义了 `toString()` 与 `valueOf()`，而且各自返回不同类型（`string` vs `number`）。

试试前面见过的 coercion 操作：

```js
String(spyObject);
// toString() invoked!
// "10"

spyObject + "";
// valueOf() invoked!
// "42"
```

是不是很多人会惊讶（我当年也很惊讶）？很多人断言 `String(..)` 与 `+ ""` 是同一类 `ToString()` 触发形式，但显然不是！

差别来自它们给 `ToPrimitive()` 的 *hint*。`String(..)` 显然给的是 `"string"`；`+ ""` 没有明确给 *hint*（效果近似 `"number"`）。但别漏掉细节：`+ ""` 虽先走 `valueOf()` 得到 `42` 这个 number 原始值，随后它又会被 `ToString()` 转成字符串，因此结果是 `"42"` 而不是 `42`。

继续看：

```js
Number(spyObject);
// valueOf() invoked!
// 42

+spyObject;
// valueOf() invoked!
// 42
```

这个例子说明 `Number(..)` 与一元 `+` 在这里走的是同一条 `ToPrimitive()` 路径（*hint* 为 `"number"`），返回 `42`。因为已经是目标类型 number，后续无需再处理。

那如果 `valueOf()` 返回的是 `bigint` 呢？

```js
spyObject2 = {
    valueOf() {
        console.log("valueOf() invoked!");
        return 42n;  // bigint!
    }
};

Number(spyObject2);
// valueOf() invoked!
// 42     <--- 看，不是 bigint！

+spyObject2;
// valueOf() invoked!
// TypeError: Cannot convert a BigInt value to a number
```

这和前面 “To Number” 里的差异一致：JS 允许把 `42n` *显式* coercion 成 `42`，但不允许它认为的*隐式* coercion 形式。

再看 `BigInt(..)`（不带 `new`）：

```js
BigInt(spyObject);
// valueOf() invoked!
// 42n    <--- 看，是 bigint！

BigInt(spyObject2);
// valueOf() invoked!
// 42n

// *******************************

spyObject3 = {
    valueOf() {
        console.log("valueOf() invoked!");
        return 42.3;
    }
};

BigInt(spyObject3);
// valueOf() invoked!
// RangeError: The number 42.3 cannot be converted to a BigInt
```

如前所述，`42` 可安全 coercion 到 `42n`；但 `42.3` 不能安全 coercion 到 `bigint`。

我们已经看到：在字符串、number/bigint coercion 过程中，`toString()` 与 `valueOf()` 会按不同路径被调用。

#### 没找到原始值？

如果 `ToPrimitive()` 最终产不出原始值，会抛异常：

```js
spyObject4 = {
    toString() {
        console.log("toString() invoked!");
        return [];
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return {};
    }
};

String(spyObject4);
// toString() invoked!
// valueOf() invoked!
// TypeError: Cannot convert object to primitive value

Number(spyObject4);
// valueOf() invoked!
// toString() invoked!
// TypeError: Cannot convert object to primitive value
```

若你要通过自定义 `toString()` / `valueOf()` 来控制转原始值，至少要保证其中一个返回原始值！

#### 对象到布尔

对象的 `boolean` coercion 呢？

```js
Boolean(spyObject);
// true

!spyObject;
// false

if (spyObject) {
    console.log("if!");
}
// if!

result = spyObject ? "ternary!" : "nope";
// "ternary!"

while (spyObject) {
    console.log("while!");
    break;
}
// while!
```

这些都在触发 `ToBoolean()`。但如前文所说，`ToBoolean()` 不会委托给 `ToPrimitive()`；因此你看不到 `"valueOf() invoked!"` 输出。

#### 拆箱（Unboxing）：包装对象到原始值

有一种常见且经常会走 `ToPrimitive()` 的对象：装箱/包装原始值（第 3 章讲过）。这种对象到原始值 coercion 常被称为 *unboxing*。

例如：

```js
hello = new String("hello");
String(hello);                  // "hello"
hello + "";                     // "hello"

fortyOne = new Number(41);
Number(fortyOne);               // 41
fortyOne + 1;                   // 42
```

上面的包装对象 `hello`、`fortyOne` 都带有配置好的 `toString()` 与 `valueOf()`，行为与前面的 `spyObject` 等示例类似。

包装对象原始值有个特别要小心的坑在 `Boolean()`：

```js
nope = new Boolean(false);

Boolean(nope);                  // true   <--- oops!
!!nope;                         // true   <--- oops!
```

记住，这是因为 `ToBoolean()` *不会*先通过 `ToPrimitive` 把对象还原成原始值；它只查内部表，而普通（非 exotic[^ExoticFalsyObjects]）对象总是 truthy，所以结果总是 `true`。

| 注意： |
| :--- |
| 这是个很阴险的小坑。你完全可以主张 `new Boolean(false)` 本应被内部标记成 exotic “falsy object”[^ExoticFalsyObjects]。但 JS 历史已经 25 年了，此时改动很容易破坏既有程序，所以这个坑一直被保留。 |

#### 覆盖默认 `toString()`

前面看过：你可以在对象上自定义 `toString()`，让相关 `ToPrimitive()` 路径调用它。另一个选项是覆盖 `Symbol.toStringTag`：

```js
spyObject5a = {};
String(spyObject5a);
// "[object Object]"
spyObject5a.toString();
// "[object Object]"

spyObject5b = {
    [Symbol.toStringTag]: "my-spy-object"
};
String(spyObject5b);
// "[object my-spy-object]"
spyObject5b.toString();
// "[object my-spy-object]"

spyObject5c = {
    get [Symbol.toStringTag]() {
        return `myValue:${this.myValue}`;
    },
    myValue: 42
};
String(spyObject5c);
// "[object myValue:42]"
spyObject5c.toString();
// "[object myValue:42]"
```

`Symbol.toStringTag` 的设计目的，是在对象默认 `toString()`（直接调用或 coercion 间接调用）时提供自定义描述字符串；若未定义，就使用常见输出 `"[object Object]"` 里的 `"Object"`。

`spyObject5c` 里的 `get ..` 语法定义了一个 *getter*。即 JS 正常读取 `Symbol.toStringTag` 属性时，会改为调用这个函数计算结果。你可以在 getter 里写任意逻辑，动态决定默认 `toString()` 使用的字符串 *tag*。

#### 覆盖 `ToPrimitive`

你也可以更进一步：通过设置特殊符号属性 `Symbol.toPrimitive` 为函数，直接覆盖对象默认 `ToPrimitive()` 行为：

```js
spyObject6 = {
    [Symbol.toPrimitive](hint) {
        console.log(`toPrimitive(${hint}) invoked!`);
        return 25;
    },
    toString() {
        console.log("toString() invoked!");
        return "10";
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return 42;
    },
};

String(spyObject6);
// toPrimitive(string) invoked!
// "25"   <--- 不是 "10"

spyObject6 + "";
// toPrimitive(default) invoked!
// "25"   <--- 不是 "42"

Number(spyObject6);
// toPrimitive(number) invoked!
// 25     <--- 不是 42 或 "25"

+spyObject6;
// toPrimitive(number) invoked!
// 25
```

可以看到，一旦对象定义了这个函数，它会完全替代默认 `ToPrimitive()` 抽象操作。由于调用时仍会传入 `hint`（即 `[Symbol.toPrimitive](..)` 的参数），理论上你可以自己实现一套算法，去手动调用 `toString()`、`valueOf()` 或对象上的任何方法（`this` 指向当前对象）。

也可以像上面那样直接返回固定值。不管怎样，JS 都不会再自动调用 `toString()` 或 `valueOf()`。

| 警告： |
| :--- |
| 正如前面 “没找到原始值？” 所述，如果你定义的 `Symbol.toPrimitive` 函数没有返回真正的原始值，仍会抛出 “...convert object to primitive value” 之类异常。务必返回真实原始值！ |

### Equality

到目前为止，我们看的 coercion 主要作用于单个值。现在转到相等比较，它天然涉及两个值，且任一侧都可能发生 coercion。

本章前面我们已讲过若干用于相等比较的抽象操作。

例如，`SameValue()`[^SameValue] 是最严格的那一个，完全无 coercion。最直接依赖它的 JS 操作就是：

```js
Object.is(42,42);                   // true
Object.is(-0,-0);                   // true
Object.is(NaN,NaN);                 // true

Object.is(0,-0);                    // false
```

`SameValueZero()`（回忆下：它仅在 `-0` 与 `0` 上与 `SameValue()` 不同）被用在更多地方，包括：

```js
[ 1, 2, NaN ].includes(NaN);        // true
```

`SameValueZero()` 对 `0` / `-0` 的“模糊处理”也可在这看到：

```js
[ 1, 2, -0 ].includes(0);           // true  <--- oops!

(new Set([ 1, 2, 0 ])).has(-0);     // true  <--- ugh

(new Map([[ 0, "ok" ]])).has(-0);   // true  <--- :(
```

这些场景里存在一种“某种意义上的 coercion”：它把 `-0` 与 `0` 视作不可区分。严格说这不叫类型 coercion（类型没变），但我在本章更广义讨论里把它也纳入“coercive”范畴。

对比一下：这里 `includes()` / `has()` 触发 `SameValueZero()`；而老牌数组工具 `indexOf(..)` 触发的是 `IsStrictlyEqual()`。这个算法在某些点反而比 `SameValueZero()` 更“coercive”：它会让 `NaN` 永远不能和 `NaN` 相等：

```js
[ 1, 2, NaN ].indexOf(NaN);         // -1  <--- 未找到
```

如果你不喜欢 `includes(..)` 与 `indexOf(..)` 这些细微怪癖，在数组里做“找相等项”时，可以用 `Object.is(..)` 强制最严格的 `SameValue()` 匹配，绕开这类“coercive”怪异：

```js
vals = [ 0, 1, 2, -0, NaN ];

vals.find(v => Object.is(v,-0));            // -0
vals.find(v => Object.is(v,NaN));           // NaN

vals.findIndex(v => Object.is(v,-0));       // 3
vals.findIndex(v => Object.is(v,NaN));      // 4
```

#### 相等运算符：`==` vs `===`

相等检查里最显眼的 coercion 位置就是 `==`。不管你对 `==` 有什么先入为主印象，它的行为其实非常可预测：先确保双方类型一致，再执行相等判断。

先强调一个也许显而易见但很重要的事实：`==`（以及 `===`）总是返回 `boolean`（`true` 或 `false`），从不会返回其他类型，无论过程中发生什么 coercion。

现在回忆本章前面 `IsLooselyEqual()`[^LooseEquality] 的步骤。它也就是 `==` 的底层逻辑。你可以用两条规则快速把握它：

1. 若两侧类型相同，`==` 与 `===` 行为完全一致——`IsLooselyEqual()` 会立刻委托给 `IsStrictlyEqual()`[^StrictEquality]。

    例如两侧都是对象引用：

    ```js
    myObj = { a: 1 };
    anotherObj = myObj;

    myObj == anotherObj;                // true
    myObj === anotherObj;               // true
    ```

    这里 `==` 与 `===` 都看到两侧是 `object` 引用类型，所以行为一致：比较的是对象引用相等性。

2. 若两侧类型不同，`==` 会允许 coercion 直到类型匹配，并偏向数值比较；只要可行，它会尝试把双方都往数字方向 coercion：

    ```js
    42 == "42";                         // true
    ```

    这里 `"42"` 会被 coercion 成 `42`（不是反过来），于是比较变成 `42 == 42`，结果自然是 `true`。

掌握这两点后，我们就能澄清一个常见神话：只有 `===` 比“类型+值”，`==` 只比值。错。

实际上，`==` 与 `===` 都是类型敏感的，都会先关注操作数类型。区别只在：`==` 允许类型不匹配时做 coercion；`===` 禁止 coercion。

“应避免 `==`、一律用 `===`”几乎是业内共识。我可能是少数公开、认真且明确主张相反的人：很多人偏好 `===`，除了“从众”，还有一个原因是没花时间真正理解 `==`。

我会在本章后面的“类型意识相等”继续论证：在很多情形下应优先 `==` 而不是 `===`。只请求你一件事：就算你现在强烈不同意，也先保持开放心态。

#### Nullish coercion

我们已经见过不少 nullish 语义的 JS 操作——即把 `null` 与 `undefined` 视为强制相等——比如 `?.` 可选链、`??` 空值合并（见第 1 章 “Null'ish”）。

而 `==` 是 JS 暴露 nullish 强制相等最直观的地方：

```js
null == undefined;              // true
```

`null` 与 `undefined` 不会与语言里任何其他值强制相等，只会彼此相等。这让 `==` 在“把两者视为不可区分”时非常顺手。

你可以这样利用：

```js
if (someData == null) {
    // `someData` 未设置（null 或 undefined），
    // 给它设默认值
}

// 或者：

if (someData != null) {
    // `someData` 已设置（既非 null 也非 undefined），
    // 使用它
}
```

记住：`!=` 是 `==` 的否定，`!==` 是 `===` 的否定。别只看 `=` 个数机械对应，否则很容易把自己绕晕。

比较这两种写法：

```js
if (someData == null) {
    // ..
}

// 对比：

if (someData === null || someData === undefined) {
    // ..
}
```

两个 `if` 行为完全一致。你更愿意写哪个？以后更愿意读哪个？

当然，有些人就偏好更冗长的 `===` 版本，这没问题。我不同意：我认为 `==` 版明显更好。而且从风格一致性上，`== null` 也更接近 `?.` / `??` 这些 nullish 运算符精神。

另一个小事实：我多次跑过性能基准，JS 引擎执行单个 `== null` 检查通常会比“两次 `===` 再 `||` 拼起来”略快一些。也就是让 `==` 做*隐式* nullish coercion，通常有一点点可测优势。

我观察到，连很多坚决 `===` 派也会承认：`== null` 至少是 `==` 更合适的一个例外场景。

#### `==` 与布尔值的坑

除了下一节会讲的其他 coercion 边角情况，`==` 最大的坑大概和布尔值有关。

这里请务必仔细看，这是许多人被 `==`“咬”过并开始厌恶它的主要原因之一。只要遵循我最后给的简单建议，你就不会中招。

看下面代码，先假设 `isLoggedIn` *不是*布尔值（`true` 或 `false`）：

```js
if (isLoggedIn) {
    // ..
}

// 对比：

if (isLoggedIn == true) {
    // ..
}
```

第一个 `if` 我们已讲过：`if` 需要布尔值，所以 `isLoggedIn` 会按 `ToBoolean()` 查表规则 coercion，行为很好预测。

但 `isLoggedIn == true` 呢？你觉得会一样吗？

如果你的第一反应是“会”，你已经掉进一个很隐蔽的陷阱。回忆本章早些时候我强调过：`ToBoolean()` 规则只有在 JS 操作*真的触发该算法*时才适用。这里看起来像“布尔相关比较”，所以很多人以为会触发它。

但并不会。回去再看一遍前文 `IsLooselyEqual()`（`==`）算法，或直接读规范[^LooseEquality]。

你会发现其中任何地方都没有说在某种情况下调用 `ToBoolean()`。

记住：`==` 两侧类型不一致时，优先往数字方向 coercion。

如果 `isLoggedIn` 不是布尔，会是什么？比如字符串 `"yes"`。在 `if ("yes") { .. }` 里它显然是 truthy，会进分支。

但 `==` 形式会这样走：

```js
// (1)
"yes" == true

// (2)
"yes" == 1

// (3)
NaN == 1

// (4)
NaN === 1           // false
```

也就是说，若 `isLoggedIn` 是 `"yes"`，`if (isLoggedIn) { .. }` 会通过，`if (isLoggedIn == true)` 却不会。很糟。

如果 `isLoggedIn` 是 `"true"` 呢？

```js
// (1)
"true" == true

// (2)
"true" == 1

// (3)
NaN == 1

// (4)
NaN === 1           // false
```

再次捂脸。

来个小测验：要让两种 `if` 条件都通过，`isLoggedIn` 该是什么值？

……

……

……

……

如果 `isLoggedIn` 是数字 `1`：`1` 是 truthy，`if (isLoggedIn)` 会过。`==` 这边则是：

```js
// (1)
1 == true

// (2)
1 == 1

// (3)
1 === 1             // true
```

若 `isLoggedIn` 是字符串 `"1"` 呢？`"1"` 同样 truthy，`==` 过程：

```js
// (1)
"1" == true

// (2)
"1" == 1

// (3)
1 == 1

// (4)
1 === 1             // true
```

所以 `1` 和 `"1"` 是两类相对“安全”能和 `true` 做 `==` 的值。但除这类外，几乎没什么值对 `isLoggedIn` 是安全的。

`== false` 同样有坑。哪些值“安全”？`""` 和 `0` 可以。但：

```js
if ([] == false) {
    // 这段会执行！
}
```

`[]` 是 truthy，却又和 `false` 强制相等？！离谱。

面对 `== true` / `== false` 这些坑，该怎么办？我的建议非常简单。

无论任何情况，只要比较两侧有一边是 `true` 或 `false`，就不要用 `==`。它看起来像会做你想要的 `ToBoolean()` coercion，实际上不会，反而会卷入一堆 coercion 边角陷阱（下一节会讲）。`===` 的这类写法也尽量避免。

当你处理布尔语义时，优先使用那些*确实会触发* `ToBoolean()` 的隐式形式，比如 `if (isLoggedIn)`，远离 `==` / `===` 的布尔比较写法。

## coercion 的边角坑（Coercion Corner Cases）

到目前为止我一直很明确地表达了“支持 coercion”的立场。它当然是观点，但这个观点基于对规范与 JS 实际行为的研究。

这不代表 coercion 完美无缺。确实有若干让人抓狂的边角情况需要认识并规避，避免踩坑。下面这些“坑点评价”同样是我的主观看法，你可以有不同意见。

### Strings

我们已看到数组做字符串 coercion：

```js
String([ 1, 2, 3 ]);                // "1,2,3"
```

我个人非常不爽它不带外围 `[ ]`。这会导致这种荒诞情况：

```js
String([]);                         // ""
```

结果连“这是数组”都看不出来，只剩空字符串。很好，JS。确实很蠢。抱歉，但就是这样。更离谱的是：

```js
String([ null, undefined ]);        // ","
```

啥！？`null` 明明可 coercion 到 `"null"`，`undefined` 也可 coercion 到 `"undefined"`。可一旦它们在数组里，做数组转字符串时却“神秘消失”为两个空串，只留下一个 `","` 暗示“这里曾经有东西”。这太离谱了。

对象呢？也很恼人，只是方向相反：

```js
String({});                         // "[object Object]"

String({ a: 1 });                   // "[object Object]"
```

嗯……好的。谢谢 JS，完全看不出对象内部信息。

### Numbers

接下来我要揭示我认为是“几乎所有 coercion 邪恶边角”的根源。准备好了吗？

```js
Number("");                         // 0
Number("       ");                  // 0
```

我知道这个点快 20 年了，至今仍想摇头。真的不理解 Brendan 当时怎么会这么设计。

空字符串没有任何内容，根本不足以决定数值表示。`0` 绝对***不是***“缺失/无效数值”的等价物。我们明明有一个非常适合表达这种含义的值：`NaN`。更别提字符串转数字时会先去掉空白，于是明明非空的 `"       "` 仍会按 `""` 一样处理。

更糟的是，回忆一下 `[]` 会 coercion 到 `""`，于是自然有：

```js
Number([]);                         // 0
```

唉！如果 `""` 不会 coercion 成 `0`——记住，这就是“万恶之源”——那 `[]` 也不会变成 `0`。

这简直是反常识宇宙。

再看一些温和点但也烦人的例子：

```js
Number("NaN");                      // NaN  <--- 意外得到！

Number("Infinity");                 // Infinity
Number("infinity");                 // NaN  <--- 注意大小写！
```

字符串 `"NaN"` 并不是合法可识别数值，所以 coercion 失败，结果“意外地”得到 `NaN`。`"Infinity"` 可被显式解析，但其他大小写（包括 `"infinity"`）都失败，结果同样 `NaN`。

下面这个你可能觉得不算坑：

```js
Number(false);                      // 0
Number(true);                       // 1
```

把 `0` 当 `false`、`1` 当 `true`，更多是编程历史惯例（来自早期没布尔类型的语言）。但反向真的合理吗？

看这个：

```js
false + true + false + false + true;        // 2
```

真的合理吗？我认为几乎没有程序场景里，把 `boolean` 当等价 `number` 是理性的。反向（`Boolean(0)`、`Boolean(1)`）我能理解，历史原因摆在那里。

但我真心觉得 `Number(false)`、`Number(true)`（以及对应隐式形式）都应该得到 `NaN`，而不是 `0`/`1`。

### coercion 荒诞案例

为了证明这一点，我们把荒诞指数拉满：

```js
[] == ![];                          // true
```

怎么可能！？一个值居然和它的否定强制相等？

沿着 coercion 兔子洞走一遍：

1. `[] == ![]`
2. `[] == false`
3. `"" == false`
4. `0 == false`
5. `0 == 0`
6. `0 === 0`  ->  `true`

这里有三种荒诞行为串联：`String([])`、`Number("")`、`Number(false)`。只要其中任意一个不成立，这个离谱结果就不会出现。

但我要非常明确：这并不是 `==` 的锅。表面上它会背锅，但真正问题源头是底层 `string` 与 `number` coercion 的边角规则。

## 类型意识（Type Awareness）

到这里，我们已经从几乎所有角度拆解过 coercion：先看规范抽象内部，再看触发 coercion 的具体语句与表达式。

那这一切意义何在？本章这些细节，乃至本书目前内容，难道只是冷知识吗？我不这么看。

回到本章一开始我抛出的观察与问题。

关于 coercion 的意见（尤其负面意见）从不缺。几乎普遍的立场是：coercion 基本/完全属于 JS 设计里的“坏部分”。但现实是：几乎每个开发者、几乎每个 JS 程序都绕不开 coercion。

换句话说，不管你怎么写，你都躲不开“理解并管理 JS 值类型及其转换”。与常见误解相反，选择动态类型（甚至弱类型）语言，并不等于可以忽略类型、无视类型。

有类型意识（type-aware）的编程，永远、永远优于无类型意识（type ignorant/agnostic）的编程。

### 呃……那 TypeScript 呢？

你现在大概在想：“为什么不直接用 TypeScript，把类型都静态声明掉，避开动态类型和 coercion 的复杂性？”

| 注意： |
| :--- |
| 我对 TypeScript 及其在生态中的角色还有更多细节观点；这里先不展开，放到附录（“Thoughts on TypeScript”）再说。 |

先正面回答：TypeScript 在“类型意识编程”上到底帮了什么、又没帮什么。

TypeScript 既是 **静态类型**（类型在编写时声明、在编译时检查），也是 **强类型**（变量/容器带类型关联并强制执行；强类型系统也禁止*隐式* coercion）。TypeScript 最大优势在于：它通常迫使代码作者和代码读者都去面对程序里大部分（理想是全部）类型信息。这确实是好事。

相比之下，JS 是 **动态类型**（类型只在运行时被发现与管理）且 **弱类型**（变量/容器本身不带类型关联，无法强制，因此变量可持有任意值类型；弱类型系统允许各种 coercion）。

| 注意： |
| :--- |
| 这里我是在较高层做概念说明，故意不深挖静态/动态、强/弱类型光谱里的细分争议。若你现在很想“严格说其实……”，先稍等，听我把论证讲完。 |

### 不依赖 TypeScript 也能有类型意识

动态类型系统是否天然意味着“类型意识更弱”？很多人会这么说，但我不同意。

我完全不认为“声明静态类型注解（TypeScript 那种）”是实现类型意识的唯一方式。静态类型支持者当然会认为那是*最好*的方式。

举个不靠 TypeScript 静态类型也体现类型意识的例子：

```js
let API_BASE_URL = "https://some.tld/api/2";
```

这句声明有类型意识吗？确实没有 `: string` 注解。但我认为它*仍然*有类型意识：我们清楚看到赋给 `API_BASE_URL` 的值类型是 `string`。

| 警告： |
| :--- |
| 别被这里用的是可重赋值的 `let`（而非 `const`）分散注意力。JS 的 `const` 并不是其类型系统的一等特性。仅仅“引擎禁止重赋值”并不会让你获得额外类型意识。若代码结构良好——咳，尤其是以类型意识为优先——你读代码本身就能看出 `API_BASE_URL` 没被重新赋值，因此它仍保持原先值类型。从类型意识角度，这和“语法上不能重赋值”基本等价。 |

如果后面我要写：

```js
// 我们用的是 https 安全 API 地址吗？
isSecureAPI = /^https/.test(API_BASE_URL);
```

我知道正则 `test(..)` 期望字符串，也知道 `API_BASE_URL` 是字符串，所以这次操作类型安全。

同理，因为我理解字符串相关 `ToBoolean()` 规则，下面这种语句也类型安全：

```js
// 我们已经拿到 API URL 了吗？
if (API_BASE_URL) {
    // ..
}
```

但若后面开始写：

```js
APIVersion = Number(API_BASE_URL);
```

我脑子里会拉响警报。因为我知道字符串转数字有一套具体规则，这个操作并**不**类型安全。所以我会换做：

```js
// 从 API URL 中提取版本号
versionDigit = API_BASE_URL.match(/\/api\/(\d+)$/)[1];

// 确保版本号确实是数字
APIVersion = Number(versionDigit);
```

我知道 `API_BASE_URL` 是字符串，也知道它末尾格式是 `".../api/{digits}"`。因此我知道这个正则匹配会成功，`[1]` 数组访问是类型安全的。

我也知道正则匹配结果返回的是字符串，所以 `versionDigit` 是字符串。此时再用 `Number(..)` 把这个“数字字符字符串”转成数值，就是安全的。

按我的定义，这种思考方式与编码方式就是有类型意识。所谓类型意识，不只是“能跑”，而是你会考虑这些语义对读者是否*清楚*、是否*显然*。

### 借助 TypeScript 的类型意识

TypeScript 支持者会指出：靠类型推断，TypeScript 即便没有任何注解，也能做静态类型检查。上一节那些代码，TypeScript 也能处理并提供它的编译期类型约束。

也就是不管你写：

```ts
let API_BASE_URL: string = "https://some.tld/api/2";

// 或：

let API_BASE_URL = "https://some.tld/api/2";
```

TypeScript 都能给出类似的类型收益。

但没有免费午餐。我们得面对一些问题。首先，TypeScript 在这里并不会报错：

```js
API_BASE_URL = "https://some.tld/api/2";

APIVersion = Number(API_BASE_URL);
// NaN
```

直觉上，*我*希望一个有类型意识的系统能识别这不安全。但也许这要求太高？或者我们给 `API_BASE_URL` 定义更窄、更具体的类型（而不是泛泛 `string`）会不会有帮助？可以试试 TypeScript 的 “Template Literal Types”[^TSLiteralTypes]：

```ts
type VersionedURL = `https://some.tld/api/${number}`;

API_BASE_URL: VersionedURL = "https://some.tld/api/2";

APIVersion = Number(API_BASE_URL);
// NaN
```

还是不行，TypeScript 仍看不出问题。是的，我知道这背后有类型系统层面的解释（比如 `Number(..)` 本身的类型定义）。

| 注意： |
| :--- |
| 我也相信真正精通 TypeScript 的高手，也许能想出很多“技巧”把这里拧成报错。甚至可能有十几种写法能逼出错误提示。但那不是重点。 |

重点是：我们不能把所有问题都寄托给 TypeScript 类型，让自己退出思考，保持对类型细节（尤其 coercion）“幸福无知”。

但你现在一定会反驳：就算 TypeScript 理解不了某些特例，也不至于让事情变*更糟*吧！？

看看 TypeScript[^TSExample1] 对这行代码怎么说：

```ts
type VersionedURL = `https://some.tld/api/${number}`;

let API_BASE_URL: VersionedURL = "https://some.tld/api/2";

let versionDigit = API_BASE_URL.match(/\/api\/(\d+)$/)[1];
// Object is possibly 'null'.
```

这条错误提示说 `[1]` 访问不类型安全，因为如果正则匹配失败，`match(..)` 会返回 `null`。

你看，即便*我*能基于字符串内容与正则表达式推导出“这里必定匹配成功”，即便*我*已经尽量把字符串形状描述得非常清楚，TypeScript 仍不够“聪明”把这两者对齐，进而得出“这里实际上是类型安全的”。

| 提示： |
| :--- |
| 一个类型工具真的应该、也真的值得，被我们扭成“表达每一种细枝末节类型安全”的形态吗？工具不必完美/全能，也能提供巨大价值。 |

再进一步比较上一节代码风格与本节代码风格（有无注解都算），TypeScript 真的让我们的编码“更有类型意识”了吗？

比如 `type VersionedURL = ..` 与 `API_BASE_URL: VersionedURL` 这些写法，真的会让代码在“类型意识”上更清晰吗？我不认为必然如此。

### TypeScript 的“智能”

是的，我听到你在屏幕那头大喊。是的，我知道 TypeScript 会把它发现（或推断）的类型信息输送给编辑器，于是你获得智能补全、行内告警等体验。

但我想说：这些东西本身并不会自动让你成为更有类型意识的开发者。

为什么？因为类型意识*不只*是编写体验，也同样是阅读体验，甚至后者更重要。而代码阅读场景/媒介并不总能拿到这些智能增强。

我承认，语言服务把智能灌进编辑器，这很厉害，也非常有帮助。

而且我并不排斥 TypeScript 作为工具去分析我的 **JS 代码** 并提供提示建议。我只是未必愿意为了“让工具不报错”，就被迫按某种极度具体的类型注解方式写代码。

### 高于 TypeScript 的门槛

但即便我都做了，也仍然对“成为完整的类型意识作者与读者”来说***不够***。

这些工具抓不住所有可能的类型错误——无论我们多么希望它们能，无论我们为了“让它能”愿意做多少语法体操。把大量精力投入到“哄工具抓住那些细微错误”的类型技巧上，往往是错位投入。

而且工具也会有误报，抱怨并非错误的代码；它永远不可能和人类理解力完全一样。你花很多时间去追某种奇技淫巧，只为了安抚工具报错，通常并不划算。

如果你想真正成为有类型意识的代码作者与读者，没有任何替代品能代替你亲自学会语言内建类型系统如何工作。是的，这意味着团队里每个开发者都得投入学习。不能为了“照顾经验较少的同学”就把这块稀释掉。

即便你声称能规避 100% 的*隐式* coercion——其实做不到——你也绝对绕不开*显式* coercion——所有程序都绕不开。

如果你对这个事实的回应是：那我把理解负担都外包给 TypeScript……很遗憾，这就明显、痛苦地低于我希望开发者达到的“类型意识”标准。

我并不是在劝你放弃 TypeScript。你喜欢用，当然可以。但我非常明确且强烈地挑战你：不要把 TypeScript 当拐杖。不要为了取悦 TypeScript 引擎而过度屈从。不要盲目地把每个类型兔子都追进每个语法洞里。

按我的观察，使用类型工具（如 TypeScript）与追求真实类型意识（作为作者/读者）之间，常呈现一种令人遗憾的反向关系：你越依赖 TypeScript，越容易被诱导把注意力从 JS 类型系统（尤其 coercion）转移到 TypeScript 的另一套类型系统上。

但 TypeScript 永远无法彻底脱离 JS 类型系统，因为它的类型会在编译时被*擦除*，最终留下的仍是 JS，仍要由 JS 引擎来执行。

| 提示： |
| :--- |
| 想象有人递给你一杯过滤水，正要喝时他说：“这水来自垃圾场附近地下水，不过放心，过滤器很好，绝对安全！”你会多信任这个过滤器？更重要的是：如果你真正理解了水源、过滤流程，以及你手里这杯水里到底有什么，你是不是会更安心？还是说，“相信过滤器”就足够了？ |

### 类型意识相等（Type Aware Equality）

本章最后，我再给一个示例，说明我认为开发者应如何在“批判性思考”而非“从众习惯”下做类型意识编码——不论你是否使用 TypeScript。

我们再次回到相等比较（`==` vs `===`），这次从类型意识角度审视。前面我承诺过会论证“应优先 `==`”，现在来兑现。

先复述目前已知事实：

1. `==` 两侧类型相同，则行为*完全等同* `===`。
2. `===` 两侧类型不同，则总是 `false`。
3. `==` 两侧类型不同，则会允许对任一侧 coercion（通常偏向数值类型），直到类型一致；一致后回到（1）。

好，基于这些事实看程序中的比较：

```js
if ( /* x 与 y 是否相等 */ ) {
    // ..
}
```

从 `x`、`y` 的类型认知角度，只有两种总体状态：

1. 我们清楚知道 `x`、`y` 可能是什么类型（因为我们知道它们如何赋值）。
2. 我们无法判断它们可能是什么类型；可能是任意类型，或多个类型组合复杂到无法预测。

能否同意：状态（1）明显优于（2）？进一步同意：（1）代表类型意识编码，而（2）代表类型*无意识*编码？

如果你用 TypeScript，通常你会较清楚 `x`、`y` 类型。即便不用 TypeScript，我们也已经展示过：只用 JS 也能通过有意识设计让 `x`、`y` 类型清楚可见。

#### （2）未知类型

如果你处在（2），我会断言：代码已处于问题状态，不理想，需要重构。最佳做法就是修它！

把代码改成有类型意识。如果这意味着引入 TypeScript、加一些类型注解，就做；若你觉得只用 JS 也能达成，就那么做。总之尽量把它拉回（1）。

如果你实在无法保证 `x` 与 `y` 的比较是类型可知、且别无他法，那你就*必须*使用 `===`。不用 `===` 就是不负责任。

```js
if (x === y) {
    // ..
}
```

你连类型都不知道，怎么可能（让未来读代码的人也）预测 `==` 的 coercion 会怎么走？做不到。

唯一负责任的选择就是：避免 coercion，用 `===`。

但别忽视这个事实：你只是在“最后手段”才选 `===`——因为你的代码类型意识差到（说白了）近乎类型损坏，只剩这个选项。

#### （1）已知类型

现在假设你在（1）：你知道 `x`、`y` 类型，比较参与类型范围在代码里很清楚。

很好！

但还有两个子状态：

* （1a）`x` 与 `y` 可能已是同类型（同为 `string`、同为 `number` 等）。
* （1b）`x` 与 `y` 可能是不同类型。

分别讨论。

##### （1a）已知且同类型

若比较双方类型一致（无论具体是什么），我们已确定 `==` 与 `===` 做的事情完全一样，没有任何差别。

唯一差别是：`==` 少一个字符。多数开发者直觉上会偏好“更短但等价”的写法（不是绝对，但很常见）。

```js
// 这里最佳
if (x == y) {
    // ..
}
```

在这种场景，多一个 `=` 对清晰度毫无增益。甚至会更糟：

```js
// 在这里反而更差！
if (x === y) {
    // ..
}
```

为什么更差？

因为在（2）里我们已经定义：`===` 是“当你不知道类型细节、只能兜底避免 coercion”的最后手段。你用 `===` 是在防止潜在 coercion 发生。

但这里根本不适用！我们已知道不会发生 coercion。此处写 `===` 反而会给读者混合信号：他本来知道比较会怎样，一看 `===` 又开始怀疑“是不是有我没看到的类型风险”。

再说一遍：若你知道比较双方类型，且知道它们匹配，唯一正确选择是 `==`。

```js
// 坚持这个选项
if (x == y) {
    // ..
}
```

##### （1b）已知但类型不匹配

来到最后场景：我们要比较 `x` 与 `y`，知道各自类型，而且确定它们**不相同**。

这时该选哪个运算符？

如果你选 `===`，那是大错。为什么？因为 `===` 面对“已知类型不匹配”永远不可能返回 `true`，只会失败。

```js
// `x` 和 `y` 类型不同？
if (x === y) {
    // 恭喜，这里的代码永远不会执行
}
```

所以 `===` 在“已知不匹配”时出局。那只剩什么？

其实有两条路：

* （1b-1）改代码，避免做“已知类型不匹配”的直接相等比较；可显式 coercion 一侧或两侧，让类型先对齐，再回到（1a）。
* （1b-2）若你就是要比较“已知不匹配类型”并希望有机会为真，那*必须*用 `==`，因为只有它会对操作数做 coercion 直到类型匹配。

```js
// `x` 与 `y` 类型不同，
// 那就允许 JS 对其做 coercion
// 再比较相等
if (x == y) {
    // ..（也就是说，还是有机会的？）
}
```

到此为止，我们已经覆盖了 `x` 与 `y` 类型敏感相等比较的所有可能状态。

#### 类型敏感相等比较总结

“应始终优先 `==` 而不是 `===`”的论证如下：

1. 不论是否使用 TypeScript——尤其若你*在用* TypeScript——目标都应是让代码每一处（包括相等比较）都具备*类型意识*。

2. 只要你知道类型，就应优先 `==`。

    - 若类型匹配，`==` 更短且更符合语义。
    - 若类型不匹配，只有 `==` 能 coercion 到匹配，比较才有可能成立。

3. 最后，只有在你*无法*知道/预测类型、又无其他办法时，才把 `===` 当兜底。最好还加注释说明为何使用 `===`，并提示未来应重构去掉这个“拐杖”。

#### TypeScript 的不一致问题

我说得更直白些：如果你正确使用 TypeScript，并且知道某个相等比较的类型信息，那在该处坚持 `===` 本身就是*错误*的。句号。

问题在于，TypeScript 很奇怪也很令人沮丧：除非它已确定两侧类型一致，否则它仍要求你用 `===`。

这是因为 TypeScript 要么并未真正理解“类型意识 + coercion”，要么——更让人恼火——它其实懂，但它如此不认同 JS 类型系统（尤其隐式 coercion），以至于连最基本的类型意识推理都不愿采用。

不信？觉得我太苛刻？试试这段 TypeScript[^TSExample2]：

```js
let result = (42 == "42");
// This condition will always return 'false' since
// the types 'number' and 'string' have no overlap.
```

我很难形容这有多让我抓狂。你若认真读完本章，就知道这条提示在 JS 语义下几乎是错误引导。`42 == "42"` 在 JS 里当然是 `true`。

这不算“谎言”，但它暴露了一个许多人仍未正视的事实：TypeScript 基本丢弃了 JS 类型系统（特别是隐式 coercion）的一整套规则，因为它的立场是这些东西“不好”，应被替换。

在 TypeScript 的世界里，`42` 与 `"42"` 不可能相等，因此给出该错误信息。而在 JS 世界里，它们就是强制相等。并且我认为本章已经充分论证：这种 coercive equivalence 在很多场景下是安全且可取的。

更让我不适的是，TypeScript 在这方面又有许多不一致。比如它完全接受这段代码里的*隐式* coercion：

```js
irony = `The value '42' and ${42} are coercively equal.`;
```

这里 `42` 在插值中被隐式转成字符串。为什么这种隐式 coercion 可以，而 `42 == "42"` 的隐式 coercion 不可以？

TypeScript 对下面代码也不报错：

```js
API_BASE_URL = "https://some.tld/api/2";
if (API_BASE_URL) {
    // ..
}
```

为什么 `ToBoolean()` 的隐式 coercion 可以，`==` 算法里 `ToNumber()` 的隐式 coercion 就不可以？

留给你思考：当你的代码最终要在 JS 引擎执行时，使用一种刻意剔除了 JS 语言一整根支柱（coercion）的工具与风格，真的是好主意吗？再者，它还带着一堆不一致例外，仅仅是为了迎合 JS 开发者既有习惯——这真的没问题吗？

## 还剩什么？

希望到这里，你已经更清楚地理解 JS 类型系统是如何工作的：从原始值类型到对象类型，再到引擎如何执行类型 coercion。

更重要的是，你现在也更完整地看到了：我们在 JS 类型系统里做的选择（例如某处用隐式还是显式 coercion）各自有什么利弊。

不过我们还没把“类型系统运行的上下文”讲完。接下来本书剩余部分，我们会把注意力转向 JS 的语法/文法规则：它们如何支配运算符与语句的行为。

[^EichCoercion]: "The State of JavaScript - Brendan Eich", comment thread, Hacker News; Oct 9 2012; https://news.ycombinator.com/item?id=4632704 ; Accessed August 2022

[^CrockfordCoercion]: "JavaScript: The World's Most Misunderstood Programming Language"; 2001; https://www.crockford.com/javascript/javascript.html ; Accessed August 2022

[^CrockfordIfs]: "json2.js", Github; Apr 21 2018; https://github.com/douglascrockford/JSON-js/blob/8e8b0407e475e35942f7e9461dab81929fcc7321/json2.js#L336 ; Accessed August 2022

[^BrendanToString]: ESDiscuss mailing list; Aug 26 2014; https://esdiscuss.org/topic/string-symbol#content-15 ; Accessed August 2022

[^AbstractOperations]: "7.1 Type Conversion", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-type-conversion ; Accessed August 2022

[^ToBoolean]: "7.1.2 ToBoolean(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-toboolean ; Accessed August 2022

[^ExoticFalsyObjects]: "B.3.6 The [[IsHTMLDDA]] Internal Slot", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-IsHTMLDDA-internal-slot ; Accessed August 2022

[^OrdinaryToPrimitive]: "7.1.1.1 OrdinaryToPrimitive(O,hint)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-ordinarytoprimitive ; Accessed August 2022

[^ToString]: "7.1.17 ToString(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tostring ; Accessed August 2022

[^StringConstructor]: "22.1.1 The String Constructor", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-string-constructor ; Accessed August 2022

[^StringFunction]: "22.1.1.1 String(value)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-string-constructor-string-value ; Accessed August 2022

[^ToNumber]: "7.1.4 ToNumber(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tonumber ; Accessed August 2022

[^ToNumeric]: "7.1.3 ToNumeric(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tonumeric ; Accessed August 2022

[^NumberConstructor]: "21.1.1 The Number Constructor", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-number-constructor ; Accessed August 2022

[^NumberFunction]: "21.1.1.1 Number(value)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-number-constructor-number-value ; Accessed August 2022

[^SameValue]: "7.2.11 SameValue(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-samevalue ; Accessed August 2022

[^StrictEquality]: "7.2.16 IsStrictlyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-isstrictlyequal ; Accessed August 2022

[^LooseEquality]: "7.2.15 IsLooselyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-islooselyequal ; Accessed August 2022

[^NumericAbstractOps]: "6.1.6 Numeric Types", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types ; Accessed August 2022

[^NumberEqual]: "6.1.6.1.13 Number:equal(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types-number-equal ; Accessed August 2022

[^BigIntEqual]: "6.1.6.2.13 BigInt:equal(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types-bigint-equal ; Accessed August 2022

[^LessThan]: "7.2.14 IsLessThan(x,y,LeftFirst)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-islessthan ; Accessed August 2022

[^StringPrefix]: "7.2.9 IsStringPrefix(p,q)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-isstringprefix ; Accessed August 2022

[^SymbolString]: "String(symbol)", ESDiscuss mailing list; Aug 12 2014; https://esdiscuss.org/topic/string-symbol ; Accessed August 2022

[^ASMjs]: "ASM.js - Working Draft"; Aug 18 2014; http://asmjs.org/spec/latest/ ; Accessed August 2022

[^TSExample1]: "TypeScript Playground"; https://tinyurl.com/ydkjs-ts-example-1 ; Accessed August 2022

[^TSExample2]: "TypeScript Playground"; https://tinyurl.com/ydkjs-ts-example-2 ; Accessed August 2022

[^TSLiteralTypes]: "TypeScript 4.1, Template Literal Types"; https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types ; Accessed August 2022
