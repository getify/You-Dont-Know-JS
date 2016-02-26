# You Don't Know JS: *this* & Object Prototypes
# Chapter 1: `this` Or That?

# 你不懂JS: *this* & Object Prototypes
# 第一章: `this` 还是 That？

One of the most confused mechanisms in JavaScript is the `this` keyword. It's a special identifier keyword that's automatically defined in the scope of every function, but what exactly it refers to bedevils even seasoned JavaScript developers.

Javascript中最令人困惑的机制之一就是`this`关键字。它是一个自动定义每个函数作用域的特殊识别符，但是即便是一些老练的开发者也感到困扰——它到底指向哪里。

> Any sufficiently *advanced* technology is indistinguishable from magic. -- Arthur C. Clarke
> 任何足够“先进”的技术都跟魔法没有区别。-- Arthur C. Clarke

JavaScript's `this` mechanism isn't actually *that* advanced, but developers often paraphrase that quote in their own mind by inserting "complex" or "confusing", and there's no question that without lack of clear understanding, `this` can seem downright magical in *your* confusion.

实际上Javascript的`this`机制没有“那么”先进，但是开发者们总是引用这句话来表达“复杂”和“混乱”，毫无疑问，如果没有清晰的认识，在*你的*混乱中`this`看起来就是彻头彻尾的魔法。

**Note:** The word "this" is a terribly common pronoun in general discourse. So, it can be very difficult, especially verbally, to determine whether we are using "this" as a pronoun or using it to refer to the actual keyword identifier. For clarity, I will always use `this` to refer to the special keyword, and "this" or *this* or this otherwise.

**注意：** `this`这个词是在一般的论述中极其通用的代词。所以——特别是在口头论述中——很难确定我们是在用`this`作为一个代词，还是在将它作为一个实际的关键字识别符。为了表意清晰，我会总是用`this`来代表那个特殊的关键字，而在其他情况下使用“this”或*this*。

## Why `this`?
## 为什么用 `this`？

If the `this` mechanism is so confusing, even to seasoned JavaScript developers, one may wonder why it's even useful? Is it more trouble than it's worth? Before we jump into the *how*, we should examine the *why*.

如果对于那些老练的Javascript开发者来说`this`机制都是如此的令人费解，那人们会问为什么这种机制会有用？它带来的好处会比麻烦多吗？在解释*如何*有用之前，我们应当先来看看*为什么*有用。

Let's try to illustrate the motivation and utility of `this`:

让我试着描绘一下`this`的动机和效用：

```js
function identify() {
	return this.name.toUpperCase();
}

function speak() {
	var greeting = "Hello, I'm " + identify.call( this );
	console.log( greeting );
}

var me = {
	name: "Kyle"
};

var you = {
	name: "Reader"
};

identify.call( me ); // KYLE
identify.call( you ); // READER

speak.call( me ); // Hello, I'm KYLE
speak.call( you ); // Hello, I'm READER
```

If the *how* of this snippet confuses you, don't worry! We'll get to that shortly. Just set those questions aside briefly so we can look into the *why* more clearly.

如果这个代码片段的工作方式让你困惑，不要担心！我们很快就会解释它。我只是简略地将这些问题放在旁边，以便于我们可以更清晰的研究*为什么*。

This code snippet allows the `identify()` and `speak()` functions to be re-used against multiple *context* (`me` and `you`) objects, rather than needing a separate version of the function for each object.

这个代码片段允许`identify()`和`speak()`函数对多个**环境**对象（`me`和`you`）进行复用，而不是针对每个对象定义函数的不同版本。

Instead of relying on `this`, you could have explicitly passed in a context object to both `identify()` and `speak()`.

通过使用`this`，你可以明确地将环境对象传递给`identify()`和`speak()`函数。

```js
function identify(context) {
	return context.name.toUpperCase();
}

function speak(context) {
	var greeting = "Hello, I'm " + identify( context );
	console.log( greeting );
}

identify( you ); // READER
speak( me ); // Hello, I'm KYLE
```

However, the `this` mechanism provides a more elegant way of implicitly "passing along" an object reference, leading to cleaner API design and easier re-use.

然而，`this`机制提供了更优雅的方式来隐含地“传入”一个对象引用，发展出更加干净的API设计和更容易的复用。

The more complex your usage pattern is, the more clearly you'll see that passing context around as an explicit parameter is often messier than passing around a `this` context. When we explore objects and prototypes, you will see the helpfulness of a collection of functions being able to automatically reference the proper context object.

你的使用模式越复杂，你就会越清晰地感觉到：将执行环境作为一个参数传递，通常比传递`this`执行环境要乱。当我们探索objects和prototypes时，你将会看到一组可以自动指向合适的执行环境的函数，以及它们是多么有用。

## Confusions
## 困惑

We'll soon begin to explain how `this` *actually* works, but first we must  dispel some misconceptions about how it *doesn't* actually work.

我们很快就要开始解释`this`是如何**实际**工作的，但我们首先要抛弃一些错误概念——它实际上**不是**如何工作的。

The name "this" creates confusion when developers try to think about it too literally. There are two meanings often assumed, but both are incorrect.

在开发者们用太过于字面的方式考虑`this`这个名字时，困惑就产生了。这通常会产生两种臆测，但都是不对的。

### Itself
### 它自己

The first common temptation is to assume `this` refers to the function itself. That's a reasonable grammatical inference, at least.

第一种通常的倾向是，臆测`this`指向函数自己。这至少是一种语法上的合理推测。

Why would you want to refer to a function from inside itself? The most common reasons would be things like recursion (calling a function from inside itself) or having an event handler that can unbind itself when it's first called.

为什么你想要在函数内部引用它自己？最通常的理由是递归（在函数内部调用它自己），或者是有一个在第一次别调用时会解除自己绑定的事件处理器。（TODO）

Developers new to JS's mechanisms often think that referencing the function as an object (all functions in JavaScript are objects!) lets you store *state* (values in properties) between function calls. While this is certainly possible and has some limited uses, the rest of the book will expound on many other patterns for *better* places to store state besides the function object.

初次接触JS机制的开发者们通常认为，将函数作为一个对象引用，可以让你在方法调用之间储存一些**状态**（值和属性）。这当然是可能的，而且有一些有限的用处，但这本书的其余部分将会阐述许多其他的模式，来找到比函数对象**更好**的地方来存储状态。

But for just a moment, we'll explore that pattern, to illustrate how `this` doesn't let a function get a reference to itself like we might have assumed.

我们来看看一个模式，来展示`this`是如何不让一个函数向我们想象的那样，得到它自身的引用的。

Consider the following code, where we attempt to track how many times a function (`foo`) was called:

考虑下面的代码，我们试图追踪函数(`foo`)被调用的多少次：

```js
function foo(num) {
	console.log( "foo: " + num );

	// keep track of how many times `foo` is called
	this.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		foo( i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
// `foo`别调用了多少次？
console.log( foo.count ); // 0 -- 这他妈怎么回事……？
```

`foo.count` is *still* `0`, even though the four `console.log` statements clearly indicate `foo(..)` was in fact called four times. The frustration stems from a *too literal* interpretation of what `this` (in `this.count++`) means.

`foo.count`**依然**是`0`, 即便四个`console.log`语句明明告诉我们`foo(..)`实际上被调用了四次。这种尝试的失败来源于对于`this` (在`this.count++`中)的含义的过于字面化的理解。

When the code executes `foo.count = 0`, indeed it's adding a property `count` to the function object `foo`. But for the `this.count` reference inside of the function, `this` is not in fact pointing *at all* to that function object, and so even though the property names are the same, the root objects are different, and confusion ensues.

当执行代码`foo.count = 0`时，确实在函数对象`foo`中加入了一个`count`属性。但是对于函数内部的`this.count`引用，`this`其实**根本就不**指向那个函数对象，即便属性名称一样，但根对象也不同，困惑应运而生。

**Note:** A responsible developer *should* ask at this point, "If I was incrementing a `count` property but it wasn't the one I expected, which `count` *was* I incrementing?" In fact, were she to dig deeper, she would find that she had accidentally created a global variable `count` (see Chapter 2 for *how* that happened!), and it currently has the value `NaN`. Of course, once she identifies this peculiar outcome, she then has a whole other set of questions: "How was it global, and why did it end up `NaN` instead of some proper count value?" (see Chapter 2).

**注意：** 一个负责任的开发者应当在这里提出一个问题：“如果我递增的`count`属性不是我以为的那个，那是哪个`count`被我递增了？”。实际上——如果他再挖的深一些——他会发现自己不小心创建了一个全局变量`count`（第二章解释了这是如何发生的），而且它当前的值是`NaN`。当然，一旦他发现这个不寻常的结果后，他会有一堆其他的问题：“它怎么是全局的？为什么它是`NaN`而不是某个合适的值？”。

Instead of stopping at this point and digging into why the `this` reference doesn't seem to be behaving as *expected*, and answering those tough but important questions, many developers simply avoid the issue altogether, and hack toward some other solution, such as creating another object to hold the `count` property:

```js
function foo(num) {
	console.log( "foo: " + num );

	// keep track of how many times `foo` is called
	data.count++;
}

var data = {
	count: 0
};

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		foo( i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( data.count ); // 4
```

While it is true that this approach "solves" the problem, unfortunately it simply ignores the real problem -- lack of understanding what `this` means and how it works -- and instead falls back to the comfort zone of a more familiar mechanism: lexical scope.

**Note:** Lexical scope is a perfectly fine and useful mechanism; I am not belittling the use of it, by any means (see *"Scope & Closures"* title of this book series). But constantly *guessing* at how to use `this`, and usually being *wrong*, is not a good reason to retreat back to lexical scope and never learn *why* `this` eludes you.

To reference a function object from inside itself, `this` by itself will typically be insufficient. You generally need a reference to the function object via a lexical identifier (variable) that points at it.

Consider these two functions:

```js
function foo() {
	foo.count = 4; // `foo` refers to itself
}

setTimeout( function(){
	// anonymous function (no name), cannot
	// refer to itself
}, 10 );
```

In the first function, called a "named function", `foo` is a reference that can be used to refer to the function from inside itself.

But in the second example, the function callback passed to `setTimeout(..)` has no name identifier (so called an "anonymous function"), so there's no proper way to refer to the function object itself.

**Note:** The old-school but now deprecated and frowned-upon `arguments.callee` reference inside a function *also* points to the function object of the currently executing function. This reference is typically the only way to access an anonymous function's object from inside itself. The best approach, however, is to avoid the use of anonymous functions altogether, at least for those which require a self-reference, and instead use a named function (expression). `arguments.callee` is deprecated and should not be used.

So another solution to our running example would have been to use the `foo` identifier as a function object reference in each place, and not use `this` at all, which *works*:

```js
function foo(num) {
	console.log( "foo: " + num );

	// keep track of how many times `foo` is called
	foo.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		foo( i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( foo.count ); // 4
```

However, that approach similarly side-steps *actual* understanding of `this` and relies entirely on the lexical scoping of variable `foo`.

Yet another way of approaching the issue is to force `this` to actually point at the `foo` function object:

```js
function foo(num) {
	console.log( "foo: " + num );

	// keep track of how many times `foo` is called
	// Note: `this` IS actually `foo` now, based on
	// how `foo` is called (see below)
	this.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		// using `call(..)`, we ensure the `this`
		// points at the function object (`foo`) itself
		foo.call( foo, i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// how many times was `foo` called?
console.log( foo.count ); // 4
```

**Instead of avoiding `this`, we embrace it.** We'll explain in a little bit *how* such techniques work much more completely, so don't worry if you're still a bit confused!

### Its Scope

The next most common misconception about the meaning of `this` is that it somehow refers to the function's scope. It's a tricky question, because in one sense there is some truth, but in the other sense, it's quite misguided.

To be clear, `this` does not, in any way, refer to a function's **lexical scope**. It is true that internally, scope is kind of like an object with properties for each of the available identifiers. But the scope "object" is not accessible to JavaScript code. It's an inner part of the *Engine*'s implementation.

Consider code which attempts (and fails!) to cross over the boundary and use `this` to implicitly refer to a function's lexical scope:

```js
function foo() {
	var a = 2;
	this.bar();
}

function bar() {
	console.log( this.a );
}

foo(); //undefined
```

There's more than one mistake in this snippet. While it may seem contrived, the code you see is a distillation of actual real-world code that has been exchanged in public community help forums. It's a wonderful (if not sad) illustration of just how misguided `this` assumptions can be.

Firstly, an attempt is made to reference the `bar()` function via `this.bar()`. It is almost certainly an *accident* that it works, but we'll explain the *how* of that shortly. The most natural way to have invoked `bar()` would have been to omit the leading `this.` and just make a lexical reference to the identifier.

However, the developer who writes such code is attempting to use `this` to create a bridge between the lexical scopes of `foo()` and `bar()`, so that `bar()` has access to the variable `a` in the inner scope of `foo()`. **No such bridge is possible.** You cannot use a `this` reference to look something up in a lexical scope. It is not possible.

Every time you feel yourself trying to mix lexical scope look-ups with `this`, remind yourself: *there is no bridge*.

## What's `this`?

Having set aside various incorrect assumptions, let us now turn our attention to how the `this` mechanism really works.

We said earlier that `this` is not an author-time binding but a runtime binding. It is contextual based on the conditions of the function's invocation. `this` binding has nothing to do with where a function is declared, but has instead everything to do with the manner in which the function is called.

When a function is invoked, an activation record, otherwise known as an execution context, is created. This record contains information about where the function was called from (the call-stack), *how* the function was invoked, what parameters were passed, etc. One of the properties of this record is the `this` reference which will be used for the duration of that function's execution.

In the next chapter, we will learn to find a function's **call-site** to determine how its execution will bind `this`.

## Review (TL;DR)

`this` binding is a constant source of confusion for the JavaScript developer who does not take the time to learn how the mechanism actually works. Guesses, trial-and-error, and blind copy-n-paste from Stack Overflow answers is not an effective or proper way to leverage *this* important `this` mechanism.

To learn `this`, you first have to learn what `this` is *not*, despite any assumptions or misconceptions that may lead you down those paths. `this` is neither a reference to the function itself, nor is it a reference to the function's *lexical* scope.

`this` is actually a binding that is made when a function is invoked, and *what* it references is determined entirely by the call-site where the function is called.
