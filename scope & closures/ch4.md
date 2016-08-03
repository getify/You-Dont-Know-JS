# You Don't Know JS: Scope & Closures
# Chapter 4: Hoisting

By now, you should be fairly comfortable with the idea of scope, and how variables are attached to different levels of scope depending on where and how they are declared. Both function scope and block scope behave by the same rules in this regard: any variable declared within a scope is attached to that scope.

至此，你应当对作用域的想法，以及变量根据它们被声明的方式和位置如何被附着在不同的作用域层级上感到相当适应了。函数作用域和块儿作用域的行为都是依赖于这个相同规则的：在一个作用域中声明的任何变量都附着在这个作用域上。

But there's a subtle detail of how scope attachment works with declarations that appear in various locations within a scope, and that detail is what we will examine here.

但关于出现在一个作用域内各种位置的声明如何附着在作用域上，有一个微妙的细节，而这个细节正式我们要在这里检视的。

## Chicken Or The Egg?

There's a temptation to think that all of the code you see in a JavaScript program is interpreted line-by-line, top-down in order, as the program executes. While that is substantially true, there's one part of that assumption which can lead to incorrect thinking about your program.

有一种倾向认为你在JavaScript程序中看到的所有代码在程序执行过程中，都是从上到下一行一行地被翻译的。虽然这大致上是对的，但是这种猜测中的一个部分可能会导致你错误地考虑你的程序。

Consider this code:

考虑这段代码：

```js
a = 2;

var a;

console.log( a );
```

What do you expect to be printed in the `console.log(..)` statement?

你希望在`console.log(..)`语句中打印出什么？

Many developers would expect `undefined`, since the `var a` statement comes after the `a = 2`, and it would seem natural to assume that the variable is re-defined, and thus assigned the default `undefined`. However, the output will be `2`.

许多开发者会期望`undefined`，因为语句`var a`出现在`a = 2`之后，这很自然地看起来像是这个变量被重定义了，并因此被赋予了默认的`undefined`。然而，输出将是`2`。

Consider another piece of code:

考虑另一个代码段：

```js
console.log( a );

var a = 2;
```

You might be tempted to assume that, since the previous snippet exhibited some less-than-top-down looking behavior, perhaps in this snippet, `2` will also be printed. Others may think that since the `a` variable is used before it is declared, this must result in a `ReferenceError` being thrown.

你可能会被诱使地这样认为，因为上一个代码段展示了一种看起来不是从上到下的行为，也许在这个代码段中，也会打印`2`。另一些人认为，因为变量`a`在它被声明之前就被使用了，所以这一定会导致一个`ReferenceError`被抛出。

Unfortunately, both guesses are incorrect. `undefined` is the output.

不幸的是，两种猜测都不正确。输出是`undefined`。

**So, what's going on here?** It would appear we have a chicken-and-the-egg question. Which comes first, the declaration ("egg"), or the assignment ("chicken")?

**那么。这里发生了什么？** 看起来我们遇到了一个先有鸡还是先有蛋的问题。哪一个现有？声明（“蛋”），还是赋值（“鸡”）？

## The Compiler Strikes Again

To answer this question, we need to refer back to Chapter 1, and our discussion of compilers. Recall that the *Engine* actually will compile your JavaScript code before it interprets it. Part of the compilation phase was to find and associate all declarations with their appropriate scopes. Chapter 2 showed us that this is the heart of Lexical Scope.

要回答这个问题，我们需要回头引用第一章关于编译器的讨论。回忆一下，*引擎* 实际上将会在它翻译你的JavaScript代码之前编译它。编译过程的一部分就是找到所有的声明，并将它们关联在合适的作用域上。第二章向我们展示了这是词法作用域的核心。

So, the best way to think about things is that all declarations, both variables and functions, are processed first, before any part of your code is executed.

所以，考虑这件事情的最佳方式是，所有的声明，变量和函数，都会首先被处理，在你的代码的任何部分被执行之前。

When you see `var a = 2;`, you probably think of that as one statement. But JavaScript actually thinks of it as two statements: `var a;` and `a = 2;`. The first statement, the declaration, is processed during the compilation phase. The second statement, the assignment, is left **in place** for the execution phase.

当你看到`var a = 2;`时，你可能认为这是一个语句。但是JavaScript实际上认为这是两个语句：`var a;`和`a = 2;`。第一个语句，声明，是在编译阶段被处理的。第二个语句，赋值，为了执行阶段而留在 **原处**。

Our first snippet then should be thought of as being handled like this:

于是我们的第一个代码段应当被认为是这样被处理的：

```js
var a;
```
```js
a = 2;

console.log( a );
```

...where the first part is the compilation and the second part is the execution.

...这里的第一部分是编译，而第二部分是执行。

Similarly, our second snippet is actually processed as:

相似地，我们的第二个代码段实际上被处理为：

```js
var a;
```
```js
console.log( a );

a = 2;
```

So, one way of thinking, sort of metaphorically, about this process, is that variable and function declarations are "moved" from where they appear in the flow of the code to the top of the code. This gives rise to the name "Hoisting".

所以，关于这种处理的一个有些隐喻的考虑方式是，变量和函数声明被从它们在代码流中出现的位置“移动”到代码的顶端。这就产生了“提升”这个名字。

In other words, **the egg (declaration) comes before the chicken (assignment)**.

换句话说，**先有蛋（声明），后有鸡（赋值）**。

**Note:** Only the declarations themselves are hoisted, while any assignments or other executable logic are left *in place*. If hoisting were to re-arrange the executable logic of our code, that could wreak havoc.

**注意：** 只有声明本身被提升了，而任何赋值或者其他的执行逻辑都被留在 *原处*。如果提升会重新安排我们代码的可执行逻辑，那就会是一场灾难了。

```js
foo();

function foo() {
	console.log( a ); // undefined

	var a = 2;
}
```

The function `foo`'s declaration (which in this case *includes* the implied value of it as an actual function) is hoisted, such that the call on the first line is able to execute.

函数`foo`的声明（在这个例子中它还 *包含* 一个隐含的，实际为函数的值）被提升了，因此第一行的调用时可以执行的。

It's also important to note that hoisting is **per-scope**. So while our previous snippets were simplified in that they only included global scope, the `foo(..)` function we are now examining itself exhibits that `var a` is hoisted to the top of `foo(..)` (not, obviously, to the top of the program). So the program can perhaps be more accurately interpreted like this:

还需要注意的是，提示是 **以作用域为单位的**。所以虽然我们的前一个代码段被简化为仅含有全局作用域，但是我们现在检视的函数`foo(..)`本身展示了，`var a`被提升至`foo(..)`的顶端（很明显，不是程序的顶端）。所以这个程序也许可以更准确地翻译为：

```js
function foo() {
	var a;

	console.log( a ); // undefined

	a = 2;
}

foo();
```

Function declarations are hoisted, as we just saw. But function expressions are not.

函数声明会被提升，正如我们看到的。但是函数表达式不会。

```js
foo(); // not ReferenceError, but TypeError!

var foo = function bar() {
	// ...
};
```

The variable identifier `foo` is hoisted and attached to the enclosing scope (global) of this program, so `foo()` doesn't fail as a `ReferenceError`. But `foo` has no value yet (as it would if it had been a true function declaration instead of expression). So, `foo()` is attempting to invoke the `undefined` value, which is a `TypeError` illegal operation.

变量标识符`foo`被提升并被附着在这个程序的外围作用域（全局），所以`foo()`不会作为一个`ReferenceError`而失败。但`foo`还没有值（如果它不是函数表达式，而是一个函数声明，那么它就会有值）。所以，`foo()`就是试图调用一个`undefined`值，这是一个`TypeError`非法操作。

Also recall that even though it's a named function expression, the name identifier is not available in the enclosing scope:

同时回想一下，即使它是一个命名的函数表达式，这个名称标识符在外围作用域中也是不可用的：

```js
foo(); // TypeError
bar(); // ReferenceError

var foo = function bar() {
	// ...
};
```

This snippet is more accurately interpreted (with hoisting) as:

这个代码段可以跟准确地（使用提升）翻译为：

```js
var foo;

foo(); // TypeError
bar(); // ReferenceError

foo = function() {
	var bar = ...self...
	// ...
}
```

## Functions First

Both function declarations and variable declarations are hoisted. But a subtle detail (that *can* show up in code with multiple "duplicate" declarations) is that functions are hoisted first, and then variables.

函数声明和变量声明都会被提升。但一个微妙的细节（*可以* 在拥有多个“重复的”声明的代码中出现）是，函数会首先被提升，然后才是变量。

Consider:

考虑：

```js
foo(); // 1

var foo;

function foo() {
	console.log( 1 );
}

foo = function() {
	console.log( 2 );
};
```

`1` is printed instead of `2`! This snippet is interpreted by the *Engine* as:

`1`被打印了，而不是`2`！这个代码段被 *引擎* 翻译为：

```js
function foo() {
	console.log( 1 );
}

foo(); // 1

foo = function() {
	console.log( 2 );
};
```

Notice that `var foo` was the duplicate (and thus ignored) declaration, even though it came before the `function foo()...` declaration, because function declarations are hoisted before normal variables.

While multiple/duplicate `var` declarations are effectively ignored, subsequent function declarations *do* override previous ones.

```js
foo(); // 3

function foo() {
	console.log( 1 );
}

var foo = function() {
	console.log( 2 );
};

function foo() {
	console.log( 3 );
}
```

While this all may sound like nothing more than interesting academic trivia, it highlights the fact that duplicate definitions in the same scope are a really bad idea and will often lead to confusing results.

Function declarations that appear inside of normal blocks typically hoist to the enclosing scope, rather than being conditional as this code implies:

```js
foo(); // "b"

var a = true;
if (a) {
   function foo() { console.log( "a" ); }
}
else {
   function foo() { console.log( "b" ); }
}
```

However, it's important to note that this behavior is not reliable and is subject to change in future versions of JavaScript, so it's probably best to avoid declaring functions in blocks.

## Review (TL;DR)

We can be tempted to look at `var a = 2;` as one statement, but the JavaScript *Engine* does not see it that way. It sees `var a` and `a = 2` as two separate statements, the first one a compiler-phase task, and the second one an execution-phase task.

What this leads to is that all declarations in a scope, regardless of where they appear, are processed *first* before the code itself is executed. You can visualize this as declarations (variables and functions) being "moved" to the top of their respective scopes, which we call "hoisting".

Declarations themselves are hoisted, but assignments, even assignments of function expressions, are *not* hoisted.

Be careful about duplicate declarations, especially mixed between normal var declarations and function declarations -- peril awaits if you do!
