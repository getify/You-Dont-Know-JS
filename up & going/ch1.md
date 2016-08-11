# You Don't Know JS: Up & Going
# Chapter 1: Into Programming

欢迎来到 *你不懂JS*（*YDKJS*）系列。

*入门与进阶* 是一个对几种编程基本概念的介绍 —— 当然我们是特别倾向于JavaScript（经常略称为JS）的 —— 以及如何走近与理解本系列的其他书目。特别是如果你刚刚接触编程和/或JavaScript，这本书将简要地探索你需要什么来 *入门与进阶*。

这本书从很高的角度来解释编程的基本原则开始。它基本上假定你是在没有或很少的编程经验的情况下开始阅读 *YDKJS*，而且期待这些书可以透过JavaScript的镜头帮助你开启一条理解编程的道路。

第一章应当作为一个快速的概览来阅读，它讲述为了 *开始编程* 你将想要多加学习和实践的东西。有许多其他精彩的编程介绍资源可以帮你在这个话题上走得更远，而且我鼓励你学习它们来作为这一章的补充。

一旦你对一般的编程基础感到适应了，第二章将指引你熟悉JavaScript风格的编程。第二章介绍了JavaScript是什么，但是同样的，它不是一个全面的指引 —— 那是其他 *YDKJS* 书目的任务！

如果你已经相当熟悉JavaScript，首先看一下第三章作为 *YDKJS* 内容的简要一瞥，然后立即投入其中！

## Code

让我们从头开始。

一个程序，经常被称为 *源代码* 或者只是 *代码*，是一组告诉计算机要执行什么任务的特殊的指令。代码通常保存在文本文件中，虽然你也可以使用JavaScript在一个浏览器的开发者控制台中直接敲入代码，我们一会儿就会讲解。

合法的格式与指令的组合规则被称为一种 *计算机语言*，有时被称作它的 *语法*，这和英语教你如何拼写单词和如何使用单词与标点创建合法的句子差不多是相同的。

### Statements

在一种计算机语言中，一组单词，数字，和执行一种具体任务的操作符构成了一个 *语句*。在JavaScript中，一个语句可能看起来像下面这样：

```js
a = b * 2;
```

字符`a`和`b`被称为 *变量*（参见“变量”），它们就像简单和盒子，你可以把任何东西存储在其中。在程序中，变量持有将被程序使用的值（比如数字`42`）。可以认为它们就是值本身的标志占位符。

相比之下，`2`本身只是一个值，称为一个 *字面值*，因为它没有被存入一个变量，是独立的。

字符`=`和`*`是 *操作符*（见“操作符”） —— 它们使用值和变量实施动作，比如赋值和数学乘法。

在JavaScript中大多数语句都以末尾的分号（`;`）结束。

语句`a = b * 2;`告诉计算机，大致上，去取得当前存储在变量`b`中的值，将这个值乘以`2`，然后将结果存回到另一个变量`a`里面。

程序只是许多这样的语句的集合，它们一起描述了为执行你的程序的意图所要采取的所有步骤。

### Expressions

语句是由一个或多个 *表达式* 组成的。一个表达式是指向一个变量或值，或者一组用操作符组合的变量和值的任意引用。

例如：

```js
a = b * 2;
```

这个语句中有四个表达式：
* `2`是一个 *字面量表达式*
* `b`是一个 *变量表达式*，它意味着取出它的当前值
* `b * 2`是一个 *算数表达式*，它意味着执行乘法
* `a = b * 2`是一个 *赋值表达式*，它意味着将表达式`b * 2`的结果赋值给变量`a`（稍后有更多关于赋值的内容）

一个独立的普通表达式也被称为一个 *表达式语句*，比如下面的：

```js
b * 2;
```

这种风格的表达式语句不是很常见和有用，因为一般来说它不会对程序的运行有任何影响 —— 它将取得`b`的值并乘以`2`，但是之后不会对结果做任何事情。

一种更常见的表达式是 *调用表达式* 语句（见“函数”），因为整个语句本身是一个函数调用表达式：

```js
alert( a );
```

### Executing a Program

这些程序语句的集合如何告诉计算机要做什么？这个程序需要被 *执行*，也称为 *运行这个程序*。

在开发者们阅读与编写时，像`a = b * 2`这样的语句很有帮助，但是它实际上不是计算机可以直接理解的形式。所以一个计算机上的特殊工具（不是一个 *解释器* 就是一个 *编译器*）被用于将你编写的代码翻译为计算机可以理解的命令。

对于某些计算机语言，这种命令的翻译经常是在每次程序运行时从上向下，一行接一行完成的，这通常成为代码的 *解释*。

对于另一些语言，这种翻译是提前完成的，成为代码的 *编译*，所以当程序稍后 *运行* 时，实际上运行的东西已经是编译好，随时可以运行的计算机指令了。

JavaScript通常被断言为 *解释型* 的，因为你的JavaScript源代码在它每次运行时都被处理。但这不是完全准确的。JavaScript引擎实际上在即时地 *编译* 程序然后立即运行编译好的代码。

**注意：** 更多关于JavaScript编译的信息，参见本系列的 *作用域与闭包* 的前两章。

## Try It Yourself

这一章将用简单的代码段来介绍每一个编程概念，它们都是用JavaScript写的（显而易见！）。

有一件事情怎么强调都不过分：在你通读本章时 —— 而且你可能需要花时间读好几遍 —— 你应当通过自己编写代码来实践这些概念中的每一个。最简单的方法就是打开你手边的浏览器（Firefox，Chrome，IE，等等）的开发者工具控制台。

**提示：** 一般来说，你可以使用快捷键或者菜单选项来启动开发者控制台。更多关于启动和使用你最喜欢的浏览器的控制台的细节，参见“精通开发者工具控制台”(http://blog.teamtreehouse.com/mastering-developer-tools-console)。要在控制台中一次键入多行，可以使用`<shift> + <enter>`来移动到下一行。一旦你敲击`<enter>`，控制台将运行任何你刚刚键入的东西。

让我们熟悉一下在控制台中运行代码的过程。首先，我建议你在浏览器中打开一个新的标签页。我偏好在地址栏中键入`about:blank`来这么做。然后，确认你的开发者控制台是打开的，就像我们刚刚提到的那样。

现在，键入如下代码看看它是怎么运行的：

```js
a = 21;

b = a * 2;

console.log( b );
```

在Chrome的控制台中键入前面的代码应该会产生如下的东西：

<img src="fig1.png" width="500">

继续，试试吧。学习编程的最佳方式就是开始编码！

### Output

在前一个代码段中，我们使用了`console.log(..)`。让我们简单地看看这一行代码在做什么。

你也许已经猜到了，它正是我们如何在开发者控制台中打印文本（也就是向用户 *输出*）的方法。这个语句有两个性质，我们应当解释一下。

首先，`log( b )`部分被称为一个函数调用（见“函数”）。这里发生的事情是，我们将变量`b`交给这个函数，它向变量`b`要来它的值，并在控制台中打印。

第二，`console.`部分是一个对象引用，这个对象就是找到`log(..)`函数的地方。我们会在第二章中详细讲解对象和它们的属性。

另一种创建你可以看到的输出的方式是`alert(..)`语句。例如：

```js
alert( b );
```

如果你运行它，你会注意到它不会打印输出到控制台，而是显示一个内容为变量`b`的“OK”弹出框。但是，一般来说与使用`alert(..)`相比，使用`console.log(..)`会使学习编码和在控制台运行你的程序更简单一些，因为你可以一次输出许多值，而不必干扰浏览器的界面。

在这本书中，我们将使用`console.log(..)`来输出。

### Input

虽然我们在讨论输出，你也许还想知道 *输入*（例如，从用户那里获得信息）。

对于HTML网页来说，输入发生的最常见的方式是向用户显示一个他们可以键入的form元素，然后使用JS将这些值读入你程序的变量中。

但是为了单纯的学习和展示的目的 —— 比如你将在这本书中通篇要做的 —— 有一个获取输入的更简单的方法。使用`prompt(..)`函数：

```js
age = prompt( "Please tell me your age:" );

console.log( age );
```

正如你可能已经猜到的，你传递给`prompt(..)`的消息 —— 在这个例子中，`"Please tell me your age:"` —— 被打印在弹出框中。

它应当和下面的东西很相似：

<img src="fig2.png" width="500">

一旦你点击“OK”提交输入的文本，你将会看到你输入的值被存储在变量`age`中，然后我们使用`console.log(..)`把它 *输出*：

<img src="fig3.png" width="500">

为了让我们在学习基本编程概念时使事情保持简单，本书中的例子不要求输入。但是现在你已经看到了如何使用`prompt(..)`，如果你想挑战一下自己，你可以试着在探索这些例子时使用输入。

## Operators

操作符是我们如何在变量和值上实施操作的方式。我们已经见到了两种JavaScript操作符，`=`和`*`。

`*`操作符实施数学乘法。够简单的，对吧？

`=`操作符用于 *赋值* —— 我们首先计算`=` *右手边* 的值（源值）然后将它放进我们在 *左手边* 指定的变量中（目标变量）。

**警告：** 对于指定赋值，这看起来像是一种奇怪的倒置。与`a = 42`不同，一些人喜欢把顺序反转过来，于是源值在左而目标变量在右，就像`42 -> a`（这不是合法的JavaScript！）。不幸的是，`a = 42`顺序的形式，和与其相似的变种，在现代编程语言中是十分流行的。如果它让你觉得不自然，那么就花些时间在脑中演练这个顺序并习惯它。

考虑如下代码：

```js
a = 2;
b = a + 1;
```

这里，我们将值`2`赋值给变量`a`。然后，我们取得变量`a`的值（还是`2`），把它加`1`得到值`3`，然后将这个值存储到变量`b`中。

虽然在技术上说`var`不是一个操作符，但是你将在每一个程序中都需要这个关键字，因为它是你 *声明*（也就是 *创建*）变量（见“变量”）的主要方式。

你应当总是在使用变量前用名称声明它。但是对于每个 *作用域*（见“作用域”）你只需要声明变量一次；它可以根据需要使用任意多次。例如：

```js
var a = 20;

a = a + 1;
a = a * 2;

console.log( a );	// 42
```

这里是一些在JavaScript中最常见的操作符：

* 赋值：比如`a = 2`中的`=`。
* 数学：`+`（加法），`-`（减法），`*`（乘法），和`/`（除法），比如`a * 3`。
* 复合赋值：`+=`，`-=`，`*=`，和`/=`都是复合操作符，它们组合了数学操作和赋值，比如`a += 2`（与`a = a + 2`相同）。
* 递增/递减：`++`（递增），`--`（递减），比如`a++`（和`a = a + 1`很相似）。
* 对象属性访问：比如`console.log()`的`.`。

   对象是一种值，它可以在被称为属性的，被具体命名的位置上持有其他的值。`obj.a`意味着一堆称为`obj`的对象值有一个名为`a`的属性。属性可以用`obj["a"]`这种替代的方式访问。参见第二章。
* 等价性：`==`（宽松等价），`===`（严格等价），`!=`（宽松不等价），`!==`（严格不等价），比如`a == b`。

   参见“值与类型”和第二章。
* 比较：`<`（小于），`>`（大于），`<=`（小于或宽松等价），`>=`（大于或宽松等价），比如`a <= b`。

   参见“值与类型”和第二章。
* 逻辑：`&&`（与），`||`（或），比如`a || b`它选择`a`*或*`b`中的一个。

   这些操作符用于表达复合的条件（见“条件”），比如如果`a`*或者*`b`成立。

**注意：** 更多细节，以及在此没有提到的其他操作符，可以参见Mozilla开发者网络（MDN）的“表达式与操作符”(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators)。

## Values & Types

如果你问一个手机店的店员一种特定手机的价格，而他们说“九十九块九毛九”（即，$99.99），他们给了你一个实际的美元数字来表示你需要花多少钱才能买到它。如果你想两部这种手机，你可以很容易地心算这个值的两倍来得到你需要花费的$199.98。

如果同一个店员拿起另一部相似的手机说它是“免费的”（也许在用手比划引号），那么他们就不是在给你一个数字，而是你的花费（$0.00）的另一种表达形式 —— “免费”这个词。

当你稍后问到这个手机是否带充电器时，回答可能仅仅是“是”或者“不”。

以同样的方式，当你在程序中表达一个值时，你根据你打算对这些值做什么来选择不同的表达形式。

在编程术语中值的这些不同的表达形式称为 *类型*。JavaScript中对这些所谓的 *基本类型* 值都有内建的类型：

* 但你需要做数学计算时，你需要一个`number`。
* 当你需要在屏幕上打印一个值时，你需要一个`string`（一个或多个字符，单词，句子）。
* 当你需要在你的程序中做决定时，你需要一个`boolean`（`true`或`false`）。

在源代码中直接包含的值称为 *字面量*。`string`字面量被双引号`"..."`或单引号（`'...'`）包围 —— 唯一的区别是风格上的偏好。`number`和`boolean`字面量用它们本身来表示（即，`42`，`true`，等等）。

考虑如下代码：

```js
"I am a string";
'I am also a string';

42;

true;
false;
```

在`string`/`number`/`boolean`值的类型以外，编程语言通常会提供 *数组*，*对象*，*函数* 等更多的类型。我们会在本章和下一章中讲解更多关于值和类型的事情。

### Converting Between Types

如果你有一个`number`但需要将它打印在屏幕上，那么你就需要将这个值转换为一个`string`，在JavaScript中这种转换称为“强制转换”。类似地，如果某些人在一个电商网页的form中输入一系列数字，那么它是一个`string`，但是如果你需要使用这个值去做数学运算，那么你就需要将它 *强制转换* 为一个`number`。

为了在 *类型* 之间强制转换，JavaScript提供了几种不同的工具。例如：

```js
var a = "42";
var b = Number( a );

console.log( a );	// "42"
console.log( b );	// 42
```

使用上面展示的`Number(..)`（一个内建函数）是一种从任意其他类型到`number`类型的 *明确的* 强制转换。这应当是相当直白的。

但是一个具有争议的话题是，当你试着比较两个还不是相同类型的值时发生的事情，它需要 *隐含的* 强制转换。

当比较字符串`"99.99"`和数字`99.99`时，大多数人同意它们是等价的。但是他们不完全相同，不是吗？它们是相同的值的两种不同表现形式，两个不同的 *类型*。你可以说它们是“宽松地等价”的，不是吗？

为了在这些常见情况下帮助你，JavaScript有时会启动 *隐含的* 强制转换来把值转换为匹配的类型。

所以如果你使用`==`宽松等价操作符来进行`"99.99" == 99.99`比较，JavaScript会将左手边的`"99.99"`转换为它的`number`等价物`99.99`。所以比较就变成了`99.99 == 99.99`，这当然是成立的。

虽然隐含强制转换被设计为要帮助你，但是它也可能把你搞糊涂，如果你没有花时间去学习控制它行为的规则。大多数开发者从没有这么做，所以常见的感觉是隐含的强制转换是令人困惑的，并且会产生意外的bug危害程序，因此应当避免使用。有时它甚至被称为这种语言中的设计缺陷。

然而，隐含强制转换是一种 *可以被学习* 的机制，而且是一种 *应当* 被所有想要严肃对待JavaScript编程的人学习的机制。一旦你学习了这些规则，它不仅是消除了困惑，而且它实际上是你的程序变得更好！这种努力是值得的。

**注意：** 关于强制转换的更多信息，参见本书第二章和本系列 *类型与文法* 的第四章。

## Code Comments

手机店店员可能会写下一些笔记，记下新出的手机的特性或者他们公司推出的新套餐。这些笔记仅仅是为店员使用的 —— 他们不是给顾客读的。不管怎样，通过记录下为什么和如何告诉顾客他应当说的东西，这些笔记帮助店员更好的工作。

关于编写代码你要学的最重要的一课之一，就是它不仅仅是写给计算机的。代码的每一个字节都和写给编译器一样，也是写给开发者的。

你的计算机只关心机器码，一系列源自 *编译* 的0和1。你几乎可以写出无限多种可以产生相同0和1序列的代码。所以你对如何编写程序作出的决定很重要 —— 不仅是对你，也对你的团队中的其他成员，甚至是你未来的自己。

你不仅应当努力去编写可以正确工作的程序，而且应当努力编写检视起来有道理的程序。你可以通过给变量（见“变量”）和函数（见“函数”）起一个好名字在这条路上走很远。

但另外一个重要的部分是代码注释。它们纯粹是为了向人类解释一些事情而在你的程序中插入的一点儿文本。解释器/编译器将总是忽略这些注释。

关于什么是良好注释的代码有许多意见；我们不能真正地定义绝对统一的规则。但是一些意见和指导是十分有用的：

* 没有注释的代码是次优的。
* 过多的注释（比如，每行都有注释）可能是代码编写的很烂的标志。
* 注释应当解释 *为什么*，而不是 *是什么*。它们可以选择性地解释 *如何做*，如果代码特别令人困惑的话。

在JavaScript中，有两种可能的注释类型：单行注释和多行注释

考虑如下代码：

```js
// This is a single-line comment

/* But this is
       a multiline
             comment.
                      */
```

如果你想在一个语句的正上方，或者甚至是在行的末尾加一个注释，`//`单行注释是很合适的。这一行上`//`之后的所有东西都将被视为注释（因此被编译器忽略），一直到行的末尾。在单行注释内部可以出现的内容没有限制。

考虑：

```js
var a = 42;		// 42 is the meaning of life
```

如果你想在注释中用好几行来解释一些事情，`/* .. */`多行注释就很合适。

这是多行注释的一个常见用法：

```js
/* The following value is used because
   it has been shown that it answers
   every question in the universe. */
var a = 42;
```

它还可以出现在一行中的任意位置，甚至是一行的中间，因为`*/`终结了它。例如：

```js
var a = /* arbitrary value */ 42;

console.log( a );	// 42
```

在多行注释中唯一不能出现的就是`*/`，因为这将干扰注释的结尾。

你将绝对希望通过养成注释代码的习惯来开始学习编程。在本书剩余的部分中，你将看到我使用注释来解释事情，请也在你自己的实践中这么做。相信我，所有阅读你的代码的人都会感谢你！

## Variables

Most useful programs need to track a value as it changes over the course of the program, undergoing different operations as called for by your program's intended tasks.

大多数有用的程序都需要追踪值的变化，在程序运行，底层不同的操作由于你的程序所意图的任务被调用的整个过程中。

The easiest way to go about that in your program is to assign a value to a symbolic container, called a *variable* -- so called because the value in this container can *vary* over time as needed.

要这样做的最简单的方法是将一个值赋予一个符号容器，称为一个 *变量* —— 因为在这个容器中的值可以根据需要不时 *变化* 而得名。

In some programming languages, you declare a variable (container) to hold a specific type of value, such as `number` or `string`. *Static typing*, otherwise known as *type enforcement*, is typically cited as a benefit for program correctness by preventing unintended value conversions.

在某些编程语言中，你可以声明一个变量（容器）来持有特定类型的值，比如`number`或`string`。因为防止了意外的类型转换，*静态类型*，也被称为 *类型强制*，通常被认为是对程序正确性有好处的。

Other languages emphasize types for values instead of variables. *Weak typing*, otherwise known as *dynamic typing*, allows a variable to hold any type of value at any time. It's typically cited as a benefit for program flexibility by allowing a single variable to represent a value no matter what type form that value may take at any given moment in the program's logic flow.

另一些语言在值上强调类型而非在变量上。*弱类型*，也被称为 *动态类型*，允许变量在任意时刻持有任意类型的值。因为它允许一个变量在程序逻辑流程中代表一个值，而不论这个值在任意给定的时刻是什么类型，所以它被认为是对程序灵活性有好处的。

JavaScript uses the latter approach, *dynamic typing*, meaning variables can hold values of any *type* without any *type* enforcement.

JavaScript使用的是后者，*动态类型*，这意味着变量可以持有任意 *类型* 的值而没有任何 *类型* 强制约束。

As mentioned earlier, we declare a variable using the `var` statement -- notice there's no other *type* information in the declaration. Consider this simple program:

正如我们刚才提到的，我们使用`var`语句来声明一个变量 —— 注意在这种声明中没有其他的 *类型* 信息。考虑这段简单的代码：

```js
var amount = 99.99;

amount = amount * 2;

console.log( amount );		// 199.98

// convert `amount` to a string, and
// add "$" on the beginning
amount = "$" + String( amount );

console.log( amount );		// "$199.98"
```

The `amount` variable starts out holding the number `99.99`, and then holds the `number` result of `amount * 2`, which is `199.98`.

变量`amount`开始时持有数字`99.99`，然后持有`amount * 2`的`number`结果，也就是`199.98`。

The first `console.log(..)` command has to *implicitly* coerce that `number` value to a `string` to print it out.

第一个`console.log(..)`命令不得不 *隐含地* 将这个`number`值强制转换为一个`string`才能够打印出来。

Then the statement `amount = "$" + String(amount)` *explicitly* coerces the `199.98` value to a `string` and adds a `"$"` character to the beginning. At this point, `amount` now holds the `string` value `"$199.98"`, so the second `console.log(..)` statement doesn't need to do any coercion to print it out.

然后语句`amount = "$" + String(amount)` *明确地* 将值`199.98`强制转换为一个`string`并且在开头加入一个`"$"`字符。这时，`amount`现在就持有这个`string`值`$199.98`，所以第二个`console.log(..)`语句无需强制转换就可以把它打印出来。

JavaScript developers will note the flexibility of using the `amount` variable for each of the `99.99`, `199.98`, and the `"$199.98"` values. Static-typing enthusiasts would prefer a separate variable like `amountStr` to hold the final `"$199.98"` representation of the value, because it's a different type.

Either way, you'll note that `amount` holds a running value that changes over the course of the program, illustrating the primary purpose of variables: managing program *state*.

In other words, *state* is tracking the changes to values as your program runs.

Another common usage of variables is for centralizing value setting. This is more typically called *constants*, when you declare a variable with a value and intend for that value to *not change* throughout the program.

You declare these *constants*, often at the top of a program, so that it's convenient for you to have one place to go to alter a value if you need to. By convention, JavaScript variables as constants are usually capitalized, with underscores `_` between multiple words.

Here's a silly example:

```js
var TAX_RATE = 0.08;	// 8% sales tax

var amount = 99.99;

amount = amount * 2;

amount = amount + (amount * TAX_RATE);

console.log( amount );				// 215.9784
console.log( amount.toFixed( 2 ) );	// "215.98"
```

**Note:** Similar to how `console.log(..)` is a function `log(..)` accessed as an object property on the `console` value, `toFixed(..)` here is a function that can be accessed on `number` values. JavaScript `number`s aren't automatically formatted for dollars -- the engine doesn't know what your intent is and there's no type for currency. `toFixed(..)` lets us specify how many decimal places we'd like the `number` rounded to, and it produces the `string` as necessary.

The `TAX_RATE` variable is only *constant* by convention -- there's nothing special in this program that prevents it from being changed. But if the city raises the sales tax rate to 9%, we can still easily update our program by setting the `TAX_RATE` assigned value to `0.09` in one place, instead of finding many occurrences of the value `0.08` strewn throughout the program and updating all of them.

The newest version of JavaScript at the time of this writing (commonly called "ES6") includes a new way to declare *constants*, by using `const` instead of `var`:

```js
// as of ES6:
const TAX_RATE = 0.08;

var amount = 99.99;

// ..
```

Constants are useful just like variables with unchanged values, except that constants also prevent accidentally changing value somewhere else after the initial setting. If you tried to assign any different value to `TAX_RATE` after that first declaration, your program would reject the change (and in strict mode, fail with an error -- see "Strict Mode" in Chapter 2).

By the way, that kind of "protection" against mistakes is similar to the static-typing type enforcement, so you can see why static types in other languages can be attractive!

**Note:** For more information about how different values in variables can be used in your programs, see the *Types & Grammar* title of this series.

## Blocks

The phone store employee must go through a series of steps to complete the checkout as you buy your new phone.

Similarly, in code we often need to group a series of statements together, which we often call a *block*. In JavaScript, a block is defined by wrapping one or more statements inside a curly-brace pair `{ .. }`. Consider:

```js
var amount = 99.99;

// a general block
{
	amount = amount * 2;
	console.log( amount );	// 199.98
}
```

This kind of standalone `{ .. }` general block is valid, but isn't as commonly seen in JS programs. Typically, blocks are attached to some other control statement, such as an `if` statement (see "Conditionals") or a loop (see "Loops"). For example:

```js
var amount = 99.99;

// is amount big enough?
if (amount > 10) {			// <-- block attached to `if`
	amount = amount * 2;
	console.log( amount );	// 199.98
}
```

We'll explain `if` statements in the next section, but as you can see, the `{ .. }` block with its two statements is attached to `if (amount > 10)`; the statements inside the block will only be processed if the conditional passes.

**Note:** Unlike most other statements like `console.log(amount);`, a block statement does not need a semicolon (`;`) to conclude it.

## Conditionals

"Do you want to add on the extra screen protectors to your purchase, for $9.99?" The helpful phone store employee has asked you to make a decision. And you may need to first consult the current *state* of your wallet or bank account to answer that question. But obviously, this is just a simple "yes or no" question.

There are quite a few ways we can express *conditionals* (aka decisions) in our programs.

The most common one is the `if` statement. Essentially, you're saying, "*If* this condition is true, do the following...". For example:

```js
var bank_balance = 302.13;
var amount = 99.99;

if (amount < bank_balance) {
	console.log( "I want to buy this phone!" );
}
```

The `if` statement requires an expression in between the parentheses `( )` that can be treated as either `true` or `false`. In this program, we provided the expression `amount < bank_balance`, which indeed will either evaluate to `true` or `false` depending on the amount in the `bank_balance` variable.

You can even provide an alternative if the condition isn't true, called an `else` clause. Consider:

```js
const ACCESSORY_PRICE = 9.99;

var bank_balance = 302.13;
var amount = 99.99;

amount = amount * 2;

// can we afford the extra purchase?
if ( amount < bank_balance ) {
	console.log( "I'll take the accessory!" );
	amount = amount + ACCESSORY_PRICE;
}
// otherwise:
else {
	console.log( "No, thanks." );
}
```

Here, if `amount < bank_balance` is `true`, we'll print out `"I'll take the accessory!"` and add the `9.99` to our `amount` variable. Otherwise, the `else` clause says we'll just politely respond with `"No, thanks."` and leave `amount` unchanged.

As we discussed in "Values & Types" earlier, values that aren't already of an expected type are often coerced to that type. The `if` statement expects a `boolean`, but if you pass it something that's not already `boolean`, coercion will occur.

JavaScript defines a list of specific values that are considered "falsy" because when coerced to a `boolean`, they become `false` -- these include values like `0` and `""`. Any other value not on the "falsy" list is automatically "truthy" -- when coerced to a `boolean` they become `true`. Truthy values include things like `99.99` and `"free"`. See "Truthy & Falsy" in Chapter 2 for more information.

*Conditionals* exist in other forms besides the `if`. For example, the `switch` statement can be used as a shorthand for a series of `if..else` statements (see Chapter 2). Loops (see "Loops") use a *conditional* to determine if the loop should keep going or stop.

**Note:** For deeper information about the coercions that can occur implicitly in the test expressions of *conditionals*, see Chapter 4 of the *Types & Grammar* title of this series.

## Loops

During busy times, there's a waiting list for customers who need to speak to the phone store employee. While there's still people on that list, she just needs to keep serving the next customer.

Repeating a set of actions until a certain condition fails -- in other words, repeating only while the condition holds -- is the job of programming loops; loops can take different forms, but they all satisfy this basic behavior.

A loop includes the test condition as well as a block (typically as `{ .. }`). Each time the loop block executes, that's called an *iteration*.

For example, the `while` loop and the `do..while` loop forms illustrate the concept of repeating a block of statements until a condition no longer evaluates to `true`:

```js
while (numOfCustomers > 0) {
	console.log( "How may I help you?" );

	// help the customer...

	numOfCustomers = numOfCustomers - 1;
}

// versus:

do {
	console.log( "How may I help you?" );

	// help the customer...

	numOfCustomers = numOfCustomers - 1;
} while (numOfCustomers > 0);
```

The only practical difference between these loops is whether the conditional is tested before the first iteration (`while`) or after the first iteration (`do..while`).

In either form, if the conditional tests as `false`, the next iteration will not run. That means if the condition is initially `false`, a `while` loop will never run, but a `do..while` loop will run just the first time.

Sometimes you are looping for the intended purpose of counting a certain set of numbers, like from `0` to `9` (ten numbers). You can do that by setting a loop iteration variable like `i` at value `0` and incrementing it by `1` each iteration.

**Warning:** For a variety of historical reasons, programming languages almost always count things in a zero-based fashion, meaning starting with `0` instead of `1`. If you're not familiar with that mode of thinking, it can be quite confusing at first. Take some time to practice counting starting with `0` to become more comfortable with it!

The conditional is tested on each iteration, much as if there is an implied `if` statement inside the loop.

We can use JavaScript's `break` statement to stop a loop. Also, we can observe that it's awfully easy to create a loop that would otherwise run forever without a `break`ing mechanism.

Let's illustrate:

```js
var i = 0;

// a `while..true` loop would run forever, right?
while (true) {
	// stop the loop?
	if ((i <= 9) === false) {
		break;
	}

	console.log( i );
	i = i + 1;
}
// 0 1 2 3 4 5 6 7 8 9
```

**Warning:** This is not necessarily a practical form you'd want to use for your loops. It's presented here for illustration purposes only.

While a `while` (or `do..while`) can accomplish the task manually, there's another syntactic form called a `for` loop for just that purpose:

```js
for (var i = 0; i <= 9; i = i + 1) {
	console.log( i );
}
// 0 1 2 3 4 5 6 7 8 9
```

As you can see, in both cases the conditional `i <= 9` is `true` for the first 10 iterations (`i` of values `0` through `9`) of either loop form, but becomes `false` once `i` is value `10`.

The `for` loop has three clauses: the initialization clause (`var i=0`), the conditional test clause (`i <= 9`), and the update clause (`i = i + 1`). So if you're going to do counting with your loop iterations, `for` is a more compact and often easier form to understand and write.

There are other specialized loop forms that are intended to iterate over specific values, such as the properties of an object (see Chapter 2) where the implied conditional test is just whether all the properties have been processed. The "loop until a condition fails" concept holds no matter what the form of the loop.

## Functions

The phone store employee probably doesn't carry around a calculator to figure out the taxes and final purchase amount. That's a task she needs to define once and reuse over and over again. Odds are, the company has a checkout register (computer, tablet, etc.) with those "functions" built in.

Similarly, your program will almost certainly want to break up the code's tasks into reusable pieces, instead of repeatedly repeating yourself repetitiously (pun intended!). The way to do this is to define a `function`.

A function is generally a named section of code that can be "called" by name, and the code inside it will be run each time. Consider:

```js
function printAmount() {
	console.log( amount.toFixed( 2 ) );
}

var amount = 99.99;

printAmount(); // "99.99"

amount = amount * 2;

printAmount(); // "199.98"
```

Functions can optionally take arguments (aka parameters) -- values you pass in. And they can also optionally return a value back.

```js
function printAmount(amt) {
	console.log( amt.toFixed( 2 ) );
}

function formatAmount() {
	return "$" + amount.toFixed( 2 );
}

var amount = 99.99;

printAmount( amount * 2 );		// "199.98"

amount = formatAmount();
console.log( amount );			// "$99.99"
```

The function `printAmount(..)` takes a parameter that we call `amt`. The function `formatAmount()` returns a value. Of course, you can also combine those two techniques in the same function.

Functions are often used for code that you plan to call multiple times, but they can also be useful just to organize related bits of code into named collections, even if you only plan to call them once.

Consider:

```js
const TAX_RATE = 0.08;

function calculateFinalPurchaseAmount(amt) {
	// calculate the new amount with the tax
	amt = amt + (amt * TAX_RATE);

	// return the new amount
	return amt;
}

var amount = 99.99;

amount = calculateFinalPurchaseAmount( amount );

console.log( amount.toFixed( 2 ) );		// "107.99"
```

Although `calculateFinalPurchaseAmount(..)` is only called once, organizing its behavior into a separate named function makes the code that uses its logic (the `amount = calculateFinal...` statement) cleaner. If the function had more statements in it, the benefits would be even more pronounced.

### Scope

If you ask the phone store employee for a phone model that her store doesn't carry, she will not be able to sell you the phone you want. She only has access to the phones in her store's inventory. You'll have to try another store to see if you can find the phone you're looking for.

Programming has a term for this concept: *scope* (technically called *lexical scope*). In JavaScript, each function gets its own scope. Scope is basically a collection of variables as well as the rules for how those variables are accessed by name. Only code inside that function can access that function's *scoped* variables.

A variable name has to be unique within the same scope -- there can't be two different `a` variables sitting right next to each other. But the same variable name `a` could appear in different scopes.

```js
function one() {
	// this `a` only belongs to the `one()` function
	var a = 1;
	console.log( a );
}

function two() {
	// this `a` only belongs to the `two()` function
	var a = 2;
	console.log( a );
}

one();		// 1
two();		// 2
```

Also, a scope can be nested inside another scope, just like if a clown at a birthday party blows up one balloon inside another balloon. If one scope is nested inside another, code inside the innermost scope can access variables from either scope.

Consider:

```js
function outer() {
	var a = 1;

	function inner() {
		var b = 2;

		// we can access both `a` and `b` here
		console.log( a + b );	// 3
	}

	inner();

	// we can only access `a` here
	console.log( a );			// 1
}

outer();
```

Lexical scope rules say that code in one scope can access variables of either that scope or any scope outside of it.

So, code inside the `inner()` function has access to both variables `a` and `b`, but code only in `outer()` has access only to `a` -- it cannot access `b` because that variable is only inside `inner()`.

Recall this code snippet from earlier:

```js
const TAX_RATE = 0.08;

function calculateFinalPurchaseAmount(amt) {
	// calculate the new amount with the tax
	amt = amt + (amt * TAX_RATE);

	// return the new amount
	return amt;
}
```

The `TAX_RATE` constant (variable) is accessible from inside the `calculateFinalPurchaseAmount(..)` function, even though we didn't pass it in, because of lexical scope.

**Note:** For more information about lexical scope, see the first three chapters of the *Scope & Closures* title of this series.

## Practice

There is absolutely no substitute for practice in learning programming. No amount of articulate writing on my part is alone going to make you a programmer.

With that in mind, let's try practicing some of the concepts we learned here in this chapter. I'll give the "requirements," and you try it first. Then consult the code listing below to see how I approached it.

* Write a program to calculate the total price of your phone purchase. You will keep purchasing phones (hint: loop!) until you run out of money in your bank account. You'll also buy accessories for each phone as long as your purchase amount is below your mental spending threshold.
* After you've calculated your purchase amount, add in the tax, then print out the calculated purchase amount, properly formatted.
* Finally, check the amount against your bank account balance to see if you can afford it or not.
* You should set up some constants for the "tax rate," "phone price," "accessory price," and "spending threshold," as well as a variable for your "bank account balance.""
* You should define functions for calculating the tax and for formatting the price with a "$" and rounding to two decimal places.
* **Bonus Challenge:** Try to incorporate input into this program, perhaps with the `prompt(..)` covered in "Input" earlier. You may prompt the user for their bank account balance, for example. Have fun and be creative!

OK, go ahead. Try it. Don't peek at my code listing until you've given it a shot yourself!

**Note:** Because this is a JavaScript book, I'm obviously going to solve the practice exercise in JavaScript. But you can do it in another language for now if you feel more comfortable.

Here's my JavaScript solution for this exercise:

```js
const SPENDING_THRESHOLD = 200;
const TAX_RATE = 0.08;
const PHONE_PRICE = 99.99;
const ACCESSORY_PRICE = 9.99;

var bank_balance = 303.91;
var amount = 0;

function calculateTax(amount) {
	return amount * TAX_RATE;
}

function formatAmount(amount) {
	return "$" + amount.toFixed( 2 );
}

// keep buying phones while you still have money
while (amount < bank_balance) {
	// buy a new phone!
	amount = amount + PHONE_PRICE;

	// can we afford the accessory?
	if (amount < SPENDING_THRESHOLD) {
		amount = amount + ACCESSORY_PRICE;
	}
}

// don't forget to pay the government, too
amount = amount + calculateTax( amount );

console.log(
	"Your purchase: " + formatAmount( amount )
);
// Your purchase: $334.76

// can you actually afford this purchase?
if (amount > bank_balance) {
	console.log(
		"You can't afford this purchase. :("
	);
}
// You can't afford this purchase. :(
```

**Note:** The simplest way to run this JavaScript program is to type it into the developer console of your nearest browser.

How did you do? It wouldn't hurt to try it again now that you've seen my code. And play around with changing some of the constants to see how the program runs with different values.

## Review

Learning programming doesn't have to be a complex and overwhelming process. There are just a few basic concepts you need to wrap your head around.

These act like building blocks. To build a tall tower, you start first by putting block on top of block on top of block. The same goes with programming. Here are some of the essential programming building blocks:

* You need *operators* to perform actions on values.
* You need values and *types* to perform different kinds of actions like math on `number`s or output with `string`s.
* You need *variables* to store data (aka *state*) during your program's execution.
* You need *conditionals* like `if` statements to make decisions.
* You need *loops* to repeat tasks until a condition stops being true.
* You need *functions* to organize your code into logical and reusable chunks.

Code comments are one effective way to write more readable code, which makes your program easier to understand, maintain, and fix later if there are problems.

Finally, don't neglect the power of practice. The best way to learn how to write code is to write code.

I'm excited you're well on your way to learning how to code, now! Keep it up. Don't forget to check out other beginner programming resources (books, blogs, online training, etc.). This chapter and this book are a great start, but they're just a brief introduction.

The next chapter will review many of the concepts from this chapter, but from a more JavaScript-specific perspective, which will highlight most of the major topics that are addressed in deeper detail throughout the rest of the series.
