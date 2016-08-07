# You Don't Know JS: Scope & Closures
# Appendix B: Polyfilling Block Scope

In Chapter 3, we explored Block Scope. We saw that `with` and the `catch` clause are both tiny examples of block scope that have existed in JavaScript since at least the introduction of ES3.

在第三章中，我们探索了块儿作用域。我们看到最早在ES3中引入的`with`和`catch`子句都是存在于JavaScript中的块儿作用域的小例子。

But it's ES6's introduction of `let` that finally gives full, unfettered block-scoping capability to our code. There are many exciting things, both functionally and code-stylistically, that block scope will enable.

但是ES6引入的`let`最终使我们的代码有了完整的，不受约束的块作用域能力。不论是在功能上还是在代码风格上，块作用域都开启了许多激动人心的事情。

But what if we wanted to use block scope in pre-ES6 environments?

但要是我们想在前ES6环境中使用块儿作用域呢？

Consider this code:

考虑这段代码：

```js
{
	let a = 2;
	console.log( a ); // 2
}

console.log( a ); // ReferenceError
```

This will work great in ES6 environments. But can we do so pre-ES6? `catch` is the answer.

它在ES6环境下工作的非常好。但是我们能在前ES6中这么做吗？`catch`就是答案。

```js
try{throw 2}catch(a){
	console.log( a ); // 2
}

console.log( a ); // ReferenceError
```

Whoa! That's some ugly, weird looking code. We see a `try/catch` that appears to forcibly throw an error, but the "error" it throws is just a value `2`, and then the variable declaration that receives it is in the `catch(a)` clause. Mind: blown.

哇！这真是看起来丑陋和奇怪的代码。我们看到一个`try/catch`似乎强制抛出一个错误，但是这个它抛出的“错误”只是一个值`2`。然后接收它的变量声明是在`catch(a)`子句中。三观：毁尽。

That's right, the `catch` clause has block-scoping to it, which means it can be used as a polyfill for block scope in pre-ES6 environments.

没错，`catch`子句拥有块儿作用域，这意味着它可以被用于在前ES6环境中填补块儿作用域。

"But...", you say. "...no one wants to write ugly code like that!" That's true. No one writes (some of) the code output by the CoffeeScript compiler, either. That's not the point.

“但是...”，你说。“...没人愿意写这么丑的代码！”你是对的。也没人编写由CoffeeScript编译器输出的（某些）代码。这不是重点。

The point is that tools can transpile ES6 code to work in pre-ES6 environments. You can write code using block-scoping, and benefit from such functionality, and let a build-step tool take care of producing code that will actually *work* when deployed.

重点是工具可以将ES6代码转译为能够在前ES6环境中工作的代码。你可以使用块儿作用域编写代码，并从这样的功能中获益，然后让一个编译工具来掌管生成将在部署之后实际 *工作* 的代码。

This is actually the preferred migration path for all (ahem, most) of ES6: to use a code transpiler to take ES6 code and produce ES5-compatible code during the transition from pre-ES6 to ES6.

这实际上是所有（嗯哼，大多数）ES6特性首选的迁移路径：在从前ES6到ES6的转变过程中，使用一个代码转译器将ES6代码转换为ES5兼容的代码。

## Traceur

Google maintains a project called "Traceur" [^note-traceur], which is exactly tasked with transpiling ES6 features into pre-ES6 (mostly ES5, but not all!) for general usage. The TC39 committee relies on this tool (and others) to test out the semantics of the features they specify.

Google维护着一个称为“Traceur”的项目，它的任务正是为了广泛使用而将ES6特性转译为前ES6（大多数是ES5，但不是全部！）代码。TC39协会依赖这个工具（和其他的工具）来测试他们所规定的特性的语义。

What does Traceur produce from our snippet? You guessed it!

Traceur将从我们的代码段中产生出什么？你猜对了！

```js
{
	try {
		throw undefined;
	} catch (a) {
		a = 2;
		console.log( a );
	}
}

console.log( a );
```

So, with the use of such tools, we can start taking advantage of block scope regardless of if we are targeting ES6 or not, because `try/catch` has been around (and worked this way) from ES3 days.

所以，使用这种工具，我们可以开始利用块儿作用域，无论我们是否面向ES6，因为`try/catch`从ES3那时就开始存在了（并且这样工作）。

## Implicit vs. Explicit Blocks

In Chapter 3, we identified some potential pitfalls to code maintainability/refactorability when we introduce block-scoping. Is there another way to take advantage of block scope but to reduce this downside?

在第三章中，在我们介绍块儿作用域时，我们识别了一些关于代码可维护性/可重构性的潜在陷阱。有什么其他的方法可以利用块儿作用域同时减少这些负面影响吗？

Consider this alternate form of `let`, called the "let block" or "let statement" (contrasted with "let declarations" from before).

考虑一下`let`的这种形式，它被称为“let块儿”或“let语句”（和以前的“let声明”对比来说）。

```js
let (a = 2) {
	console.log( a ); // 2
}

console.log( a ); // ReferenceError
```

Instead of implicitly hijacking an existing block, the let-statement creates an explicit block for its scope binding. Not only does the explicit block stand out more, and perhaps fare more robustly in code refactoring, it produces somewhat cleaner code by, grammatically, forcing all the declarations to the top of the block. This makes it easier to look at any block and know what's scoped to it and not.

与隐含地劫持一个既存的块儿不同，let语句为它的作用域绑定明确地创建了一个块儿。这个明确的块儿不仅更显眼，而且在代码重构方面健壮得多，从文法上讲，它通过强制所有的声明都位于块儿的顶部而产生了某种程度上更干净的代码。这使任何块儿都更易于观察，更易于知道什么属于这个作用域和什么不属于这个作用域。

As a pattern, it mirrors the approach many people take in function-scoping when they manually move/hoist all their `var` declarations to the top of the function. The let-statement puts them there at the top of the block by intent, and if you don't use `let` declarations strewn throughout, your block-scoping declarations are somewhat easier to identify and maintain.

作为一种模式，它是与这种方式向对照的：许多人

But, there's a problem. The let-statement form is not included in ES6. Neither does the official Traceur compiler accept that form of code.

We have two options. We can format using ES6-valid syntax and a little sprinkle of code discipline:

```js
/*let*/ { let a = 2;
	console.log( a );
}

console.log( a ); // ReferenceError
```

But, tools are meant to solve our problems. So the other option is to write explicit let statement blocks, and let a tool convert them to valid, working code.

So, I built a tool called "let-er" [^note-let_er] to address just this issue. *let-er* is a build-step code transpiler, but its only task is to find let-statement forms and transpile them. It will leave alone any of the rest of your code, including any let-declarations. You can safely use *let-er* as the first ES6 transpiler step, and then pass your code through something like Traceur if necessary.

Moreover, *let-er* has a configuration flag `--es6`, which when turned on (off by default), changes the kind of code produced. Instead of the `try/catch` ES3 polyfill hack, *let-er* would take our snippet and produce the fully ES6-compliant, non-hacky:

```js
{
	let a = 2;
	console.log( a );
}

console.log( a ); // ReferenceError
```

So, you can start using *let-er* right away, and target all pre-ES6 environments, and when you only care about ES6, you can add the flag and instantly target only ES6.

And most importantly, **you can use the more preferable and more explicit let-statement form** even though it is not an official part of any ES version (yet).

## Performance

Let me add one last quick note on the performance of `try/catch`, and/or to address the question, "why not just use an IIFE to create the scope?"

Firstly, the performance of `try/catch` *is* slower, but there's no reasonable assumption that it *has* to be that way, or even that it *always will be* that way. Since the official TC39-approved ES6 transpiler uses `try/catch`, the Traceur team has asked Chrome to improve the performance of `try/catch`, and they are obviously motivated to do so.

Secondly, IIFE is not a fair apples-to-apples comparison with `try/catch`, because a function wrapped around any arbitrary code changes the meaning, inside of that code, of `this`, `return`, `break`, and `continue`. IIFE is not a suitable general substitute. It could only be used manually in certain cases.

The question really becomes: do you want block-scoping, or not. If you do, these tools provide you that option. If not, keep using `var` and go on about your coding!

[^note-traceur]: [Google Traceur](http://traceur-compiler.googlecode.com/git/demo/repl.html)

[^note-let_er]: [let-er](https://github.com/getify/let-er)
