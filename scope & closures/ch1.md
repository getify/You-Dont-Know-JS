# 你不懂JS：作用域与闭包
# 第一章：什么是作用域？

One of the most fundamental paradigms of nearly all programming languages is the ability to store values in variables, and later retrieve or modify those values. In fact, the ability to store values and pull values out of variables is what gives a program *state*.

几乎所有语言的最基础范例之一就是在变量中存储值的能力，并且在稍后取出或修改这些值。事实上，在变量中存储值和取出值的能力，给程序赋予了 *状态*。

Without such a concept, a program could perform some tasks, but they would be extremely limited and not terribly interesting.

如果没有这样的概念，一个程序虽然可以执行一些任务，但是它们将会受到极大的限制而且不会非常有趣。

But the inclusion of variables into our program begets the most interesting questions we will now address: where do those variables *live*? In other words, where are they stored? And, most importantly, how does our program find them when it needs them?

但是在我们的程序中包含进变量，引出了我们现在将要解决的最有趣的问题：这些变量 *存活* 在哪里？换句话说，它们被存储在哪儿？而且，最重要的是，我们的程序如何在需要它们的时候找到它们？

These questions speak to the need for a well-defined set of rules for storing variables in some location, and for finding those variables at a later time. We'll call that set of rules: *Scope*.

回答这些问题需要一组明确定义的规则，它定义了如何在某些位置存储变量，和如何在稍后找到这些变量。我们称这组规则为：*作用域*。

But, where and how do these *Scope* rules get set?

但是，这些 *作用域* 规则是在哪里，如何被设置的？

## Compiler Theory
## 编译器理论

It may be self-evident, or it may be surprising, depending on your level of interaction with various languages, but despite the fact that JavaScript falls under the general category of "dynamic" or "interpreted" languages, it is in fact a compiled language. It is *not* compiled well in advance, as are many traditionally-compiled languages, nor are the results of compilation portable among various distributed systems.

根据你与各种编程语言打交道的水平不同，这也许是不证自明的，或者这也许令人吃惊，尽管JavaScript一般被划分到“动态”或者“解释型”语言的范畴，但是其实它是一个编译型语言。它 *不是* 像许多传统意义上的编译型语言那样预先被编译好，编译的结果也不能在各种不同的分布式系统间移植。

But, nevertheless, the JavaScript engine performs many of the same steps, albeit in more sophisticated ways than we may commonly be aware, of any traditional language-compiler.

但是无论如何，JavaScript引擎在实施许多与传统的语言编译器相同的步骤，虽然是以一种我们平常不能发觉的更精巧的方式。

In traditional compiled-language process, a chunk of source code, your program, will undergo typically three steps *before* it is executed, roughly called "compilation":

在传统的编译型语言处理中，一块儿源代码，你的程序，在它被执行 *之前* 典型地将会经历三个步骤，大致被称为“编译”：

1. **Tokenizing/Lexing:** breaking up a string of characters into meaningful (to the language) chunks, called tokens. For instance, consider the program: `var a = 2;`. This program would likely be broken up into the following tokens: `var`, `a`, `=`, `2`, and `;`. Whitespace may or may not be persisted as a token, depending on whether it's meaningful or not.

1. **分词/词法分析：** 将一连串字符打断成（对于语言来说）有意义的片段，称为token（记号）。举例来说，考虑这段程序：`var a = 2;`。这段程序很可能会被打断成如下token：`var`，`a`，`=`，`2`，和`;`。空格也许会被保留为一个token，这要看它是否是有意义的。

    **Note:** The difference between tokenizing and lexing is subtle and academic, but it centers on whether or not these tokens are identified in a *stateless* or *stateful* way. Put simply, if the tokenizer were to invoke stateful parsing rules to figure out whether `a` should be considered a distinct token or just part of another token, *that* would be **lexing**.

    **注意：** 分词和词法分析之间的区别是微妙和学术上的，其中心在于这些token是否以 *无状态* 或 *有状态* 的方式识别。简而言之，如果分词器去调用有状态的解析规则来弄清`a`是否应当被考虑为一个不同的token，还是只是其他token的一部分，那么这就是 **词法分析**。

2. **Parsing:** taking a stream (array) of tokens and turning it into a tree of nested elements, which collectively represent the grammatical structure of the program. This tree is called an "AST" (<b>A</b>bstract <b>S</b>yntax <b>T</b>ree).

2. **解析：** 将一个token的流（数组）转换为一个嵌套元素的树，它总体上表示了程序的语法结构。这棵树称为“AST”（<b>A</b>bstract <b>S</b>yntax <b>T</b>ree —— 抽象语法树）。

    The tree for `var a = 2;` might start with a top-level node called `VariableDeclaration`, with a child node called `Identifier` (whose value is `a`), and another child called `AssignmentExpression` which itself has a child called `NumericLiteral` (whose value is `2`).

    `var a = 2;`的树也许开始于称为`VariableDeclaration`顶层节点，带有一个称为`Identifier`的子节点（它的值为`a`），和另一个称为`AssignmentExpression`的子节点，而这个子节点本身带有一个称为`NumericLiteral`的子节点（它的值为`2`）。

3. **Code-Generation:** the process of taking an AST and turning it into executable code. This part varies greatly depending on the language, the platform it's targeting, etc.

3. **代码生成：** 这个处理将AST转换为可执行的代码。这一部分将根据语言，它的目标平台等因素有很大的不同。

    So, rather than get mired in details, we'll just handwave and say that there's a way to take our above described AST for `var a = 2;` and turn it into a set of machine instructions to actually *create* a variable called `a` (including reserving memory, etc.), and then store a value into `a`.

    所以，与其深陷细节，我们不如笼统地说，有一种方法将我们上面描述的`var a = 2;`的AST转换为机器指令，来实际上 *创建* 一个称为`a`的变量（包括分配内存等等），让后再`a`中存入一个值。

    **Note:** The details of how the engine manages system resources are deeper than we will dig, so we'll just take it for granted that the engine is able to create and store variables as needed.

    **注意：** 引擎如何管理系统资源的细节远比我们要挖掘的东西深刻，所以我们将理所当然地认为引擎有能力按其需要创建和存储变量。

The JavaScript engine is vastly more complex than *just* those three steps, as are most other language compilers. For instance, in the process of parsing and code-generation, there are certainly steps to optimize the performance of the execution, including collapsing redundant elements, etc.

和大多数其他语言一样，JavaScript引擎要比区区三步复杂太多了。例如，在解析和代码生成的处理中，一定会存在优化执行效率的步骤，包括压缩冗余元素，等等。

So, I'm painting only with broad strokes here. But I think you'll see shortly why *these* details we *do* cover, even at a high level, are relevant.

所以，我在此描绘的只是大框架。但是我想你很快就会明白为什么我们涵盖的这些细节，虽然是在很高的层次上，是有关系的。

For one thing, JavaScript engines don't get the luxury (like other language compilers) of having plenty of time to optimize, because JavaScript compilation doesn't happen in a build step ahead of time, as with other languages.

其一，JavaScript引擎没有（像其他语言的编译器那样）大把的时间去优化，因为JavaScript的编译和其他语言不同，不是提前发生在一个编译的步骤中。

For JavaScript, the compilation that occurs happens, in many cases, mere microseconds (or less!) before the code is executed. To ensure the fastest performance, JS engines use all kinds of tricks (like JITs, which lazy compile and even hot re-compile, etc.) which are well beyond the "scope" of our discussion here.

对JavaScript来说，在许多情况下，编译发生在代码被执行前的仅仅几微妙之内（或更少！）。为了确保最快的性能，JS引擎将使用所有的招数（比如JIT，它可以懒编译甚至是热编译，等等），而这远超出了我们的关于“作用域”的讨论。

Let's just say, for simplicity's sake, that any snippet of JavaScript has to be compiled before (usually *right* before!) it's executed. So, the JS compiler will take the program `var a = 2;` and compile it *first*, and then be ready to execute it, usually right away.

为了简单起见，我们可以说，任何JavaScript代码段在它执行之前（通常是 *刚好* 在它执行之前！）都必须被编译。所以，JS编译器将把程序`var a = 2;`拿过来，并首先编译它，然后准备运行它，通常是立即的。

## Understanding Scope
## 理解作用域

The way we will approach learning about scope is to think of the process in terms of a conversation. But, *who* is having the conversation?

我们将采用的学习作用域的方法，是将这个处理过程想象为一场对话。但是，*谁* 在进行这场对话呢？

### The Cast
### 演员

Let's meet the cast of characters that interact to process the program `var a = 2;`, so we understand their conversations that we'll listen in on shortly:

让我们见一见处理程序`var a = 2;`时进行互动的演员吧，这样我们就能理解稍后将要听到的它们的对话：

1. *Engine*: responsible for start-to-finish compilation and execution of our JavaScript program.

1. *引擎*：负责从始至终的编译，和执行我们的JavaScript程序。

2. *Compiler*: one of *Engine*'s friends; handles all the dirty work of parsing and code-generation (see previous section).

2. *编译器*：*引擎* 的朋友；处理所有的解析和代码生成的重活儿（见前一节）。

3. *Scope*: another friend of *Engine*; collects and maintains a look-up list of all the declared identifiers (variables), and enforces a strict set of rules as to how these are accessible to currently executing code.

3. *作用域*：*引擎* 的另一个朋友；收集并维护一张所有被声明的标识符（变量）的列表，并对当前执行中的代码如何访问这些变量强制实施一组严格的规则。

For you to *fully understand* how JavaScript works, you need to begin to *think* like *Engine* (and friends) think, ask the questions they ask, and answer those questions the same.

为了 *全面理解* JavaScript是如何工作的，你需要开始像 *引擎*（和它的朋友们）那样 *思考*，问它们问的问题，并像它们一样回答。

### Back & Forth

### 反复

When you see the program `var a = 2;`, you most likely think of that as one statement. But that's not how our new friend *Engine* sees it. In fact, *Engine* sees two distinct statements, one which *Compiler* will handle during compilation, and one which *Engine* will handle during execution.

当你看到程序`var a = 2;`时，你很可能认为它是一个语句。但这不是我们的新朋友 *引擎* 所看到的。事实上，*引擎* 看到两个不同的语句，一个是 *编译器* 将在编译期间处理的，一个是 *引擎* 将在执行期间处理的。

So, let's break down how *Engine* and friends will approach the program `var a = 2;`.

那么，然我们来分解 *引擎* 和它的朋友们将如何处理程序`var a = 2;`。

The first thing *Compiler* will do with this program is perform lexing to break it down into tokens, which it will then parse into a tree. But when *Compiler* gets to code-generation, it will treat this program somewhat differently than perhaps assumed.

*编译器* 将对这个程序做的第一件事情，是进行词法分析来将它分解为一系列token，然后这些token被解析为一棵树。但是当 *编译器* 到了代码生成阶段时，它会以一种与我们可能想象的不同的方式来对待这段程序。

A reasonable assumption would be that *Compiler* will produce code that could be summed up by this pseudo-code: "Allocate memory for a variable, label it `a`, then stick the value `2` into that variable." Unfortunately, that's not quite accurate.

一个合理的假设是，*编译器* 将会产生可以用这种假想代码概括的代码：“为一个变量分配内存，将它标记为`a`，然后将值`2`贴在这个变量里”。不幸的是，这不是十分准确。

*Compiler* will instead proceed as:

*编译器* 将会这样处理：

1. Encountering `var a`, *Compiler* asks *Scope* to see if a variable `a` already exists for that particular scope collection. If so, *Compiler* ignores this declaration and moves on. Otherwise, *Compiler* asks *Scope* to declare a new variable called `a` for that scope collection.

1. 遇到`var a`，*编译器* 让 *作用域* 去查看对于这个特定的作用域集合，变量`a`是否已经存在了。如果是，*编译器* 就忽略这个生命并继续前进。否则，*编译器* 就让 *作用域* 去为这个作用域集合声明一个称为`a`的新变量。

2. *Compiler* then produces code for *Engine* to later execute, to handle the `a = 2` assignment. The code *Engine* runs will first ask *Scope* if there is a variable called `a` accessible in the current scope collection. If so, *Engine* uses that variable. If not, *Engine* looks *elsewhere* (see nested *Scope* section below).

2. 然后 *编译器* 为 *引擎* 生成稍后要执行的代码，来处理赋值`a = 2`。*引擎* 运行的代码首先让 *作用域* 去查看在当前的作用域集合中是否有一个称为`a`的变量可以访问。如果有，*引擎* 就使用这个变量。如果没有，*引擎* 就查看 *其他地方*（参加下面的嵌套 *作用域* 一节）。

If *Engine* eventually finds a variable, it assigns the value `2` to it. If not, *Engine* will raise its hand and yell out an error!

如果 *引擎* 最终找到一个变量，它就将值`2`赋予它。如果没有，*引擎* 将会举起它的手并喊出一个错误！

To summarize: two distinct actions are taken for a variable assignment: First, *Compiler* declares a variable (if not previously declared in the current scope), and second, when executing, *Engine* looks up the variable in *Scope* and assigns to it, if found.

总结来说：对于一个变量赋值，发生了两个不同的动作：第一，*编译器* 声明一个变量（如果先前没有在当前作用域中声明过），第二，当执行时，*引擎* 在 *作用域* 中查询这个变量并给它赋值，如果找到的话。

### Compiler Speak

We need a little bit more compiler terminology to proceed further with understanding.

为了继续更深地理解，我们需要一点儿更多的编译器术语。

When *Engine* executes the code that *Compiler* produced for step (2), it has to look-up the variable `a` to see if it has been declared, and this look-up is consulting *Scope*. But the type of look-up *Engine* performs affects the outcome of the look-up.

当 *引擎* 执行 *编译器* 为第二步产生的代码时，它必须查询变量`a`来看它是否已经被声明过了，而且这个查询是咨询 *作用域* 的。但是 *引擎* 实施的查询的类型会影响查询的结果。

In our case, it is said that *Engine* would be performing an "LHS" look-up for the variable `a`. The other type of look-up is called "RHS".

在我们这个例子中，*引擎* 将会对变量`a`实施一个“LHS”查询。另一种查询的类型称为“RHS”。

I bet you can guess what the "L" and "R" mean. These terms stand for "Left-hand Side" and "Right-hand Side".

我打赌你能猜出“L”和“R”是什么意思。这两个术语表示“Left-hand Side（左手边）”和“Right-hand Side（右手边）”

Side... of what? **Of an assignment operation.**

什么的...边？**赋值操作的。**

In other words, an LHS look-up is done when a variable appears on the left-hand side of an assignment operation, and an RHS look-up is done when a variable appears on the right-hand side of an assignment operation.

换言之，当一个变量出现在赋值操作的左手边时，会进行LHS查询，当一个变量出现在赋值操作的右手边时，会进行RHS查询。

Actually, let's be a little more precise. An RHS look-up is indistinguishable, for our purposes, from simply a look-up of the value of some variable, whereas the LHS look-up is trying to find the variable container itself, so that it can assign. In this way, RHS doesn't *really* mean "right-hand side of an assignment" per se, it just, more accurately, means "not left-hand side".

实际上，让我们更准确一点儿的话，对于我们的目的来说，一个RHS是不可分辨的，因为它简单地查询某个变量的值，而LHS查询是试着找到变量容器本身，以便它可以赋值。从这种意义上说，RHS的含义实质上不是 *真正的* “一个赋值的右手边”，更准确地说，它只是意味着“不是左手边”。

Being slightly glib for a moment, you could also think "RHS" instead means "retrieve his/her source (value)", implying that RHS means "go get the value of...".

在这一番油腔滑调之后，你也可以认为“RHS”意味着“取得他/她的源（值）”，暗示着RHS的意思是“去取...的值”。

Let's dig into that deeper.

让我们挖掘得更深一些。

When I say:

当我说：

```js
console.log( a );
```

The reference to `a` is an RHS reference, because nothing is being assigned to `a` here. Instead, we're looking-up to retrieve the value of `a`, so that the value can be passed to `console.log(..)`.

这个指向`a`的引用是一个RHS医用，因为这里没有东西被赋值给`a`。而是我们在查询`a`并取得它的值，这样这个值可以被传递进`console.log(..)`。

By contrast:

作为对比：

```js
a = 2;
```

The reference to `a` here is an LHS reference, because we don't actually care what the current value is, we simply want to find the variable as a target for the `= 2` assignment operation.

这里指向`a`的引用是一个LHS引用，因为我们实际上不关心当前的值是什么，我们只是想找到这个变量，将它作为`= 2`赋值操作的目标。

**Note:** LHS and RHS meaning "left/right-hand side of an assignment" doesn't necessarily literally mean "left/right side of the `=` assignment operator". There are several other ways that assignments happen, and so it's better to conceptually think about it as: "who's the target of the assignment (LHS)" and "who's the source of the assignment (RHS)".

**注意：** LHS和RHS意味着“赋值的左/右手边”未必像字面上那样意味着“`=`赋值操作符的左/右边”。赋值有几种其他的发生形式，所以最好在概念上将它考虑为：“复制的目标（LHS）”和“复制的源（RHS）”。

Consider this program, which has both LHS and RHS references:

考虑这段程序，它既有LHS引用又有RHS引用：

```js
function foo(a) {
	console.log( a ); // 2
}

foo( 2 );
```

The last line that invokes `foo(..)` as a function call requires an RHS reference to `foo`, meaning, "go look-up the value of `foo`, and give it to me." Moreover, `(..)` means the value of `foo` should be executed, so it'd better actually be a function!

调用`foo(..)`的最后一行作为一个函数调用要求一个指向`foo`的RHS引用，意味着，“去查询`foo`的值，并把它交给我”。另外，`(..)`意味着`foo`的值应当被执行，所以它最好实际上是一个函数！

There's a subtle but important assignment here. **Did you spot it?**

这里有一个微妙但重要的赋值。**你发现了吗？**

You may have missed the implied `a = 2` in this code snippet. It happens when the value `2` is passed as an argument to the `foo(..)` function, in which case the `2` value is **assigned** to the parameter `a`. To (implicitly) assign to parameter `a`, an LHS look-up is performed.

你可能错过了这个代码段隐含的`a = 2`。它发生在当值`2`作为参数传递给`foo(..)`函数时，这时值`2` **被赋值** 给参数`a`。为了（隐含地）给参数`a`赋值，进行了一个LHS查询。

There's also an RHS reference for the value of `a`, and that resulting value is passed to `console.log(..)`. `console.log(..)` needs a reference to execute. It's an RHS look-up for the `console` object, then a property-resolution occurs to see if it has a method called `log`.

Finally, we can conceptualize that there's an LHS/RHS exchange of passing the value `2` (by way of variable `a`'s RHS look-up) into `log(..)`. Inside of the native implementation of `log(..)`, we can assume it has parameters, the first of which (perhaps called `arg1`) has an LHS reference look-up, before assigning `2` to it.

**Note:** You might be tempted to conceptualize the function declaration `function foo(a) {...` as a normal variable declaration and assignment, such as `var foo` and `foo = function(a){...`. In so doing, it would be tempting to think of this function declaration as involving an LHS look-up.

However, the subtle but important difference is that *Compiler* handles both the declaration and the value definition during code-generation, such that when *Engine* is executing code, there's no processing necessary to "assign" a function value to `foo`. Thus, it's not really appropriate to think of a function declaration as an LHS look-up assignment in the way we're discussing them here.

### Engine/Scope Conversation

```js
function foo(a) {
	console.log( a ); // 2
}

foo( 2 );
```

Let's imagine the above exchange (which processes this code snippet) as a conversation. The conversation would go a little something like this:

> ***Engine***: Hey *Scope*, I have an RHS reference for `foo`. Ever heard of it?

> ***Scope***: Why yes, I have. *Compiler* declared it just a second ago. He's a function. Here you go.

> ***Engine***: Great, thanks! OK, I'm executing `foo`.

> ***Engine***: Hey, *Scope*, I've got an LHS reference for `a`, ever heard of it?

> ***Scope***: Why yes, I have. *Compiler* declared it as a formal parameter to `foo` just recently. Here you go.

> ***Engine***: Helpful as always, *Scope*. Thanks again. Now, time to assign `2` to `a`.

> ***Engine***: Hey, *Scope*, sorry to bother you again. I need an RHS look-up for `console`. Ever heard of it?

> ***Scope***: No problem, *Engine*, this is what I do all day. Yes, I've got `console`. He's built-in. Here ya go.

> ***Engine***: Perfect. Looking up `log(..)`. OK, great, it's a function.

> ***Engine***: Yo, *Scope*. Can you help me out with an RHS reference to `a`. I think I remember it, but just want to double-check.

> ***Scope***: You're right, *Engine*. Same guy, hasn't changed. Here ya go.

> ***Engine***: Cool. Passing the value of `a`, which is `2`, into `log(..)`.

> ...

### Quiz

Check your understanding so far. Make sure to play the part of *Engine* and have a "conversation" with the *Scope*:

```js
function foo(a) {
	var b = a;
	return a + b;
}

var c = foo( 2 );
```

1. Identify all the LHS look-ups (there are 3!).

2. Identify all the RHS look-ups (there are 4!).

**Note:** See the chapter review for the quiz answers!

## Nested Scope

We said that *Scope* is a set of rules for looking up variables by their identifier name. There's usually more than one *Scope* to consider, however.

Just as a block or function is nested inside another block or function, scopes are nested inside other scopes. So, if a variable cannot be found in the immediate scope, *Engine* consults the next outer containing scope, continuing until found or until the outermost (aka, global) scope has been reached.

Consider:

```js
function foo(a) {
	console.log( a + b );
}

var b = 2;

foo( 2 ); // 4
```

The RHS reference for `b` cannot be resolved inside the function `foo`, but it can be resolved in the *Scope* surrounding it (in this case, the global).

So, revisiting the conversations between *Engine* and *Scope*, we'd overhear:

> ***Engine***: "Hey, *Scope* of `foo`, ever heard of `b`? Got an RHS reference for it."

> ***Scope***: "Nope, never heard of it. Go fish."

> ***Engine***: "Hey, *Scope* outside of `foo`, oh you're the global *Scope*, ok cool. Ever heard of `b`? Got an RHS reference for it."

> ***Scope***: "Yep, sure have. Here ya go."

The simple rules for traversing nested *Scope*: *Engine* starts at the currently executing *Scope*, looks for the variable there, then if not found, keeps going up one level, and so on. If the outermost global scope is reached, the search stops, whether it finds the variable or not.

### Building on Metaphors

To visualize the process of nested *Scope* resolution, I want you to think of this tall building.

<img src="fig1.png" width="250">

The building represents our program's nested *Scope* rule set. The first floor of the building represents your currently executing *Scope*, wherever you are. The top level of the building is the global *Scope*.

You resolve LHS and RHS references by looking on your current floor, and if you don't find it, taking the elevator to the next floor, looking there, then the next, and so on. Once you get to the top floor (the global *Scope*), you either find what you're looking for, or you don't. But you have to stop regardless.

## Errors

Why does it matter whether we call it LHS or RHS?

Because these two types of look-ups behave differently in the circumstance where the variable has not yet been declared (is not found in any consulted *Scope*).

Consider:

```js
function foo(a) {
	console.log( a + b );
	b = a;
}

foo( 2 );
```

When the RHS look-up occurs for `b` the first time, it will not be found. This is said to be an "undeclared" variable, because it is not found in the scope.

If an RHS look-up fails to ever find a variable, anywhere in the nested *Scope*s, this results in a `ReferenceError` being thrown by the *Engine*. It's important to note that the error is of the type `ReferenceError`.

By contrast, if the *Engine* is performing an LHS look-up and arrives at the top floor (global *Scope*) without finding it, and if the program is not running in "Strict Mode" [^note-strictmode], then the global *Scope* will create a new variable of that name **in the global scope**, and hand it back to *Engine*.

*"No, there wasn't one before, but I was helpful and created one for you."*

"Strict Mode" [^note-strictmode], which was added in ES5, has a number of different behaviors from normal/relaxed/lazy mode. One such behavior is that it disallows the automatic/implicit global variable creation. In that case, there would be no global *Scope*'d variable to hand back from an LHS look-up, and *Engine* would throw a `ReferenceError` similarly to the RHS case.

Now, if a variable is found for an RHS look-up, but you try to do something with its value that is impossible, such as trying to execute-as-function a non-function value, or reference a property on a `null` or `undefined` value, then *Engine* throws a different kind of error, called a `TypeError`.

`ReferenceError` is *Scope* resolution-failure related, whereas `TypeError` implies that *Scope* resolution was successful, but that there was an illegal/impossible action attempted against the result.

## Review (TL;DR)

Scope is the set of rules that determines where and how a variable (identifier) can be looked-up. This look-up may be for the purposes of assigning to the variable, which is an LHS (left-hand-side) reference, or it may be for the purposes of retrieving its value, which is an RHS (right-hand-side) reference.

LHS references result from assignment operations. *Scope*-related assignments can occur either with the `=` operator or by passing arguments to (assign to) function parameters.

The JavaScript *Engine* first compiles code before it executes, and in so doing, it splits up statements like `var a = 2;` into two separate steps:

1. First, `var a` to declare it in that *Scope*. This is performed at the beginning, before code execution.

2. Later, `a = 2` to look up the variable (LHS reference) and assign to it if found.

Both LHS and RHS reference look-ups start at the currently executing *Scope*, and if need be (that is, they don't find what they're looking for there), they work their way up the nested *Scope*, one scope (floor) at a time, looking for the identifier, until they get to the global (top floor) and stop, and either find it, or don't.

Unfulfilled RHS references result in `ReferenceError`s being thrown. Unfulfilled LHS references result in an automatic, implicitly-created global of that name (if not in "Strict Mode" [^note-strictmode]), or a `ReferenceError` (if in "Strict Mode" [^note-strictmode]).

### Quiz Answers

```js
function foo(a) {
	var b = a;
	return a + b;
}

var c = foo( 2 );
```

1. Identify all the LHS look-ups (there are 3!).

	**`c = ..`, `a = 2` (implicit param assignment) and `b = ..`**

2. Identify all the RHS look-ups (there are 4!).

    **`foo(2..`, `= a;`, `a + ..` and `.. + b`**


[^note-strictmode]: MDN: [Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode)
