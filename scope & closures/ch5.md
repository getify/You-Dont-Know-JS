# You Don't Know JS: Scope & Closures
# Chapter 5: Scope Closure

希望我们是带着对作用域的工作方式的健全，牢固的理解来到这里的。

我们将我们的注意力转向这个语言中一个重要到不可思议，但是一直难以捉摸的，*几乎是神话班的* 部分：**闭包**。如果你至此一直跟随着我们关于词法作用域的讨论，那么你的报偿就是闭包将在很大程度上是自然而然的，几乎是显而易见的。*有一个人坐在魔法师的幕后，现在我们即将见到他*。不，他的名字不是Crockford！

如果你还对词法作用域有令人不安的问题，现在就是在继续之前回过头去再复习一下第二章的好时机。

## Enlightenment

对于那些对JavaScript有些经验，但是也许从没全面掌握闭包概念的人来说，*理解闭包* 看起来就像是必须努力并作出牺牲才能到达的涅槃状态。

回想几年前我对JavaScript有了牢固的掌握，但是不知道闭包是什么。它暗示着这种语言有着另外的一面，它许诺了甚至比我已经拥有的还多的力量，它取笑并嘲弄我。我记得我通读早期框架的源代码试图搞懂它到底是如何工作的。我记得第一次“模块模式”的某些东西融入我的大脑。我记得那依然栩栩如生的 *啊哈！* 的一刻。

那时我不明白的东西，那个花了我好几年时间才搞懂的东西，那个我即将传授给你的东西，是这个秘密：**在JavaScript中闭包无所不在，你只是不得不认出它并接纳它**。闭包不是你必须学习新的语法和模式才能使用的特殊的可选的工具。不，闭包甚至不是你必须像卢克在原力中受训那样，一定要学会使用并掌握的武器。

闭包是依赖于词法作用域编写代码而发生的结果。它们就这么发生了。你甚至不需要有意地创建闭包来利用它们。闭包在你的代码中一直在被创建和使用。你 *缺少* 的是恰当的思维环境，来识别，接纳，并以自己的意志利用闭包。

启蒙的时刻应该是：**哦，闭包已经在我的代码中到处发生了，现在我终于 *看到* 它们了**。理解闭包就像是尼欧第一次见到母体。

## Nitty Gritty

好了，夸张和对电影的无耻引用够多了。

为了理解和识别闭包，这里有一个你需要知道的简单粗暴的定义：

> 闭包就是函数能够记住并访问它的词法作用域，即使当这个函数在它的词法作用域之外执行时。

让我们跳进代码来说明这个定义：

```js
function foo() {
	var a = 2;

	function bar() {
		console.log( a ); // 2
	}

	bar();
}

foo();
```

根据我们对嵌套作用域的讨论，这段代码应当看起来很熟悉。由于词法作用域查询规则（在这个例子中，是一个RHS引用查询），函数`bar()`可以 *访问* 外围作用域的变量`a`。

这是“闭包”吗？

好吧，技术上……*也许是*。但是根据我们上面的“你需要知道”的定义……*不确切*。我认为解释`bar()`引用`a`的最准确的方式是根据词法作用域查询规则，但是那些规则 *仅仅* 是闭包的（一个很重要的！）**一部分**。

从纯粹的学院派角度讲，上面的代码段被认为是函数`bar()`在函数`foo()`的作用域上有一个 *闭包*（而且实际上，它甚至对其他的作用域也可以访问，比如这个例子中的全局作用域）。换一种略有不同的说法是，`bar()`闭住了`foo()`的作用域。为什么？因为`bar()`嵌套地出现在`foo()`内部。简单直白。

但是，这样一来闭包的定义就是不能直接 *观察到* 的了，我们也不能看到闭包在这个代码段中 *被行使*。我们清楚地看到词法作用域，但是闭包仍然像代码后面谜一般的模糊阴影。

让我们考虑这段将闭包完全照亮的代码：

```js
function foo() {
	var a = 2;

	function bar() {
		console.log( a );
	}

	return bar;
}

var baz = foo();

baz(); // 2 -- Whoa, closure was just observed, man.
```

函数`bar()`对于`foo()`内的作用域拥有词法作用域访问权。但是之后，我们拿起`bar()`，这个函数本身，将它像 *值* 一样传递。在这个例子中，我们`return``bar`引用的函数对象本身。

在执行`foo()`之后，我们将它返回的值（我们里面的`bar()`函数）赋予一个称为`baz`的变量，然后我们实际地调用`baz()`，这将理所当然地调用我们内部的函数`bar()`，只不过是通过一个不同的标识符引用。

`bar()`被执行了，必然的。但是在这个例子中，它是在它被声明的词法作用域 *外部* 被执行的。

`foo()`被执行之后，一般说来我们会期望`foo()`的整个内部作用域都将消失，因为我们知道 *引擎* 启用了 *垃圾回收器* 在内存不再被使用时来回收它们。因为很显然`foo()`的内容不再被使用了，所以看起来它们很自然地应该被认为是 *消失了*。

但是闭包的“魔法”不会让这发生。内部的作用域实际上 *依然* “在使用”，因此将不会消失。谁在使用它？**函数`bar()`本身。**

有赖于它被声明的位置，`bar()`拥有一个词法作用域闭包覆盖着`foo()`的内部作用域，闭包为了能使`bar()`在以后任意的时刻可以引用这个作用域而保持它的存在。

**`bar()`依然拥有对那个作用域的引用，而这个引用称为闭包。**

所以，在几微秒之后，当变量`baz`被调用时（调用我们最开始标记为`bar`的内部函数），它理所应当地对编写时的词法作用域拥有 *访问* 权，所以它可以如我们所愿地访问变量`a`。

这个函数在它被编写时的词法作用域之外被调用。**闭包** 使这个函数可以继续访问它在编写时被定义的词法作用域。

当然，任何函数可以被作为值传递，而且实际上在其他位置被调用的各种方式，都是观察/行使闭包的例子。

```js
function foo() {
	var a = 2;

	function baz() {
		console.log( a ); // 2
	}

	bar( baz );
}

function bar(fn) {
	fn(); // look ma, I saw closure!
}
```

我们将内部函数`baz`传递给`bar`，并调用这个内部函数（现在被标记为`fn`），当我们这么做时，它覆盖在`foo()`内部作用域的闭包就可以通过`a`的访问观察到。

这样的函数传递也可以是间接的。

```js
var fn;

function foo() {
	var a = 2;

	function baz() {
		console.log( a );
	}

	fn = baz; // assign `baz` to global variable
}

function bar() {
	fn(); // look ma, I saw closure!
}

foo();

bar(); // 2
```

无论我们使用什么方法将内部函数 *传送* 到它的词法作用域之外，它都将维护一个指向它最开始被声明时的作用域的引用，而且无论我们什么时候执行它，这个闭包就会被行使。

## Now I Can See

前面的代码段有些学术化，而且是人工构建来说明 *闭包的使用* 的。但我保证过给你的东西不止是一个新的酷玩具。我保证过闭包是在你的现存代码中无处不在的东西。现在让我们 *看看* 真相。

```js
function wait(message) {

	setTimeout( function timer(){
		console.log( message );
	}, 1000 );

}

wait( "Hello, closure!" );
```

我们拿来一个内部函数（名为`timer`）将它传递给`setTimeout(..)`。但是`timer`拥有覆盖`wait(..)`的作用域的闭包，实际上保持并使用着对变量`message`的引用。

在我们执行`wait(..)`一千毫秒之后，要不是内部函数`timer`依然拥有覆盖着`wait()`内部作用域的闭包，它早就会消失了。

在 *引擎* 的内脏深处，内建的工具`setTimeout(..)`拥有一些参数的引用，可能称为`fn`或者`func`或者其他诸如此类的东西。*引擎* 去调用这个函数，它调用我们的内部`timer`函数，而词法作用域依然完好无损。

**闭包。**

或者，如果你信仰jQuery（或者就此而言，其他的任何JS框架）：

```js
function setupBot(name,selector) {
	$( selector ).click( function activator(){
		console.log( "Activating: " + name );
	} );
}

setupBot( "Closure Bot 1", "#bot_1" );
setupBot( "Closure Bot 2", "#bot_2" );
```

我不确定你写的是什么代码，但我通常写一些代码来负责控制全球的闭包无人机军团，所以这完全是真实的！

把玩笑放在一边，实质上 *无论何时何地* 只要你将函数作为头等的值看待并将它们传来传去的话，你就可能看到这些函数行使闭包。计时器，事件处理器，Ajax请求，跨窗口消息，web worker，或者任何其他的异步（或同步！）任务，当你传入一个 *回调函数*，你就在它周围悬挂了一些闭包！

**注意：** 第三章介绍了IIFE模式。虽然人们常说IIFE（独自）是一个可以观察到闭包的例子，但是根据我们上面的定义，我有些不同意。

```js
var a = 2;

(function IIFE(){
	console.log( a );
})();
```

这段代码“好用”，但严格来说它不是在观察闭包。为什么？因为这个函数（就是我们这里命名为“IIFE”的那个）没有在它的词法作用域之外执行。它仍然在它被声明的相同作用域中（那个同时持有`a`的外围/全局作用域）被调用。`a`是通过普通的词法作用域查询找到的，不是真正的闭包。

虽说技术上闭包可能发生在声明时，但它 *不是* 严格地可以观察到的，因此，就像人们说的，*它是一颗在森林中倒掉，但没人听到的树*。

虽然IIFE *本身* 不是一个闭包的例子，但是它绝对创建了作用域，而且它是我们用来创建可以被覆盖的闭包的最常见的工具之一。所以IIFE确实与闭包有强烈的关联，即便它们本身不形式闭包。

亲爱的读者，现在把这本书放下。我有一个任务给你。去打开一些你最近的JavaScript代码。寻找那些被你作为值的函数，并识别你已经在那里使用了闭包，而你以前甚至可能不知道它。

我会等你。

现在……你看到了！

## Loops + Closure

The most common canonical example used to illustrate closure involves the humble for-loop.

用来展示闭包最常见最权威的例子是谦卑的for循环。

```js
for (var i=1; i<=5; i++) {
	setTimeout( function timer(){
		console.log( i );
	}, i*1000 );
}
```

**Note:** Linters often complain when you put functions inside of loops, because the mistakes of not understanding closure are **so common among developers**. We explain how to do so properly here, leveraging the full power of closure. But that subtlety is often lost on linters and they will complain regardless, assuming you don't *actually* know what you're doing.

**注意：** 当你将函数放在循环内部时Linter经常会抱怨，因为不理解闭包的错误 **在开发者中太常见了**。我们在这里讲解如何正确地利用闭包的全部力量。但是Linter通常不具有这样的微妙之处，所以它们不管怎样都将抱怨，认为你 *实际上* 不知道你在做什么。

The spirit of this code snippet is that we would normally *expect* for the behavior to be that the numbers "1", "2", .. "5" would be printed out, one at a time, one per second, respectively.

这段代码的精神是，我们一般将期待它的行为是分别打印数字“1”，“2”，……“5”，一次一个，一秒一个。

In fact, if you run this code, you get "6" printed out 5 times, at the one-second intervals.

实际上，如果你运行这段代码，你会得到“6”被打印5次，在一秒的间隔内。

**Huh?**

**啊？**

Firstly, let's explain where `6` comes from. The terminating condition of the loop is when `i` is *not* `<=5`. The first time that's the case is when `i` is 6. So, the output is reflecting the final value of the `i` after the loop terminates.

首先，让我们解释一下“6”是从哪儿来的。循环的终结条件是`i` *不* `<=5`。以一次满足这个条件时`i`是6。所以，输出的结果反映的是`i`在循环终结后的最终值。

This actually seems obvious on second glance. The timeout function callbacks are all running well after the completion of the loop. In fact, as timers go, even if it was `setTimeout(.., 0)` on each iteration, all those function callbacks would still run strictly after the completion of the loop, and thus print `6` each time.

如果多看两眼的话这其实很明显。超时的回调函数都将在循环的完成之后立即运行。实际上，就计时器而言，即便在每次迭代中它是`setTimeout(.., 0)`，所有这些回调函数也都仍然是严格地在循环之后运行的，因此每次都打印`6`。

But there's a deeper question at play here. What's *missing* from our code to actually have it behave as we semantically have implied?

但是这里有个更深刻的问题。要是想让它实际上如我们语言上暗示的那样动作，我们的代码缺少了什么？

What's missing is that we are trying to *imply* that each iteration of the loop "captures" its own copy of `i`, at the time of the iteration. But, the way scope works, all 5 of those functions, though they are defined separately in each loop iteration, all **are closed over the same shared global scope**, which has, in fact, only one `i` in it.

缺少的东西是，我们试图 *暗示* 在迭代期间，循环的每次迭代都“捕捉”一份对`i`的拷贝。但是，虽然所有这5个函数在每个循环迭代中分离地定义，由于作用域的工作方式，它们 **都覆盖在同一个共享的全局作用域上**，而它事实上只有一个`i`。

Put that way, *of course* all functions share a reference to the same `i`. Something about the loop structure tends to confuse us into thinking there's something else more sophisticated at work. There is not. There's no difference than if each of the 5 timeout callbacks were just declared one right after the other, with no loop at all.

这么说来，所有函数共享一个指向相同的`i`的引用是理所当然的。循环结构的某些东西往往迷惑我们，使我们认为这里有其他更精巧的东西在工作。但是这里没有。这与根本没有循环，5个超时回调仅仅一个接一个地被声明没有区别。

OK, so, back to our burning question. What's missing? We need more ~~cowbell~~ closured scope. Specifically, we need a new closured scope for each iteration of the loop.

好了，那么，回到我们火烧眉毛的问题。缺少了什么？我们需要更多 ~~铃声~~ 被闭包的作用域。明确地说，我们需要为循环的每次迭代都准备一个新的被闭包的作用域。

We learned in Chapter 3 that the IIFE creates scope by declaring a function and immediately executing it.

我们在第三章中学到，IIFE通过声明并立即执行一个函数来创建作用域。

Let's try:

让我们试试：

```js
for (var i=1; i<=5; i++) {
	(function(){
		setTimeout( function timer(){
			console.log( i );
		}, i*1000 );
	})();
}
```

Does that work? Try it. Again, I'll wait.

这好用吗？试试。我还会等你。

I'll end the suspense for you. **Nope.** But why? We now obviously have more lexical scope. Each timeout function callback is indeed closing over its own per-iteration scope created respectively by each IIFE.

我来为你终结悬念。**不好用。** 但是为什么？很明显我们现在有了更多的词法作用域。每个超时回调函数确实覆盖在

It's not enough to have a scope to close over **if that scope is empty**. Look closely. Our IIFE is just an empty do-nothing scope. It needs *something* in it to be useful to us.

It needs its own variable, with a copy of the `i` value at each iteration.

```js
for (var i=1; i<=5; i++) {
	(function(){
		var j = i;
		setTimeout( function timer(){
			console.log( j );
		}, j*1000 );
	})();
}
```

**Eureka! It works!**

A slight variation some prefer is:

```js
for (var i=1; i<=5; i++) {
	(function(j){
		setTimeout( function timer(){
			console.log( j );
		}, j*1000 );
	})( i );
}
```

Of course, since these IIFEs are just functions, we can pass in `i`, and we can call it `j` if we prefer, or we can even call it `i` again. Either way, the code works now.

The use of an IIFE inside each iteration created a new scope for each iteration, which gave our timeout function callbacks the opportunity to close over a new scope for each iteration, one which had a variable with the right per-iteration value in it for us to access.

Problem solved!

### Block Scoping Revisited

Look carefully at our analysis of the previous solution. We used an IIFE to create new scope per-iteration. In other words, we actually *needed* a per-iteration **block scope**. Chapter 3 showed us the `let` declaration, which hijacks a block and declares a variable right there in the block.

**It essentially turns a block into a scope that we can close over.** So, the following awesome code "just works":

```js
for (var i=1; i<=5; i++) {
	let j = i; // yay, block-scope for closure!
	setTimeout( function timer(){
		console.log( j );
	}, j*1000 );
}
```

*But, that's not all!* (in my best Bob Barker voice). There's a special behavior defined for `let` declarations used in the head of a for-loop. This behavior says that the variable will be declared not just once for the loop, **but each iteration**. And, it will, helpfully, be initialized at each subsequent iteration with the value from the end of the previous iteration.

```js
for (let i=1; i<=5; i++) {
	setTimeout( function timer(){
		console.log( i );
	}, i*1000 );
}
```

How cool is that? Block scoping and closure working hand-in-hand, solving all the world's problems. I don't know about you, but that makes me a happy JavaScripter.

## Modules

There are other code patterns which leverage the power of closure but which do not on the surface appear to be about callbacks. Let's examine the most powerful of them: *the module*.

```js
function foo() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}
}
```

As this code stands right now, there's no observable closure going on. We simply have some private data variables `something` and `another`, and a couple of inner functions `doSomething()` and `doAnother()`, which both have lexical scope (and thus closure!) over the inner scope of `foo()`.

But now consider:

```js
function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
}

var foo = CoolModule();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

This is the pattern in JavaScript we call *module*. The most common way of implementing the module pattern is often called "Revealing Module", and it's the variation we present here.

Let's examine some things about this code.

Firstly, `CoolModule()` is just a function, but it *has to be invoked* for there to be a module instance created. Without the execution of the outer function, the creation of the inner scope and the closures would not occur.

Secondly, the `CoolModule()` function returns an object, denoted by the object-literal syntax `{ key: value, ... }`. The object we return has references on it to our inner functions, but *not* to our inner data variables. We keep those hidden and private. It's appropriate to think of this object return value as essentially a **public API for our module**.

This object return value is ultimately assigned to the outer variable `foo`, and then we can access those property methods on the API, like `foo.doSomething()`.

**Note:** It is not required that we return an actual object (literal) from our module. We could just return back an inner function directly. jQuery is actually a good example of this. The `jQuery` and `$` identifiers are the public API for the jQuery "module", but they are, themselves, just a function (which can itself have properties, since all functions are objects).

The `doSomething()` and `doAnother()` functions have closure over the inner scope of the module "instance" (arrived at by actually invoking `CoolModule()`). When we transport those functions outside of the lexical scope, by way of property references on the object we return, we have now set up a condition by which closure can be observed and exercised.

To state it more simply, there are two "requirements" for the module pattern to be exercised:

1. There must be an outer enclosing function, and it must be invoked at least once (each time creates a new module instance).

2. The enclosing function must return back at least one inner function, so that this inner function has closure over the private scope, and can access and/or modify that private state.

An object with a function property on it alone is not *really* a module. An object which is returned from a function invocation which only has data properties on it and no closured functions is not *really* a module, in the observable sense.

The code snippet above shows a standalone module creator called `CoolModule()` which can be invoked any number of times, each time creating a new module instance. A slight variation on this pattern is when you only care to have one instance, a "singleton" of sorts:

```js
var foo = (function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
})();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

Here, we turned our module function into an IIFE (see Chapter 3), and we *immediately* invoked it and assigned its return value directly to our single module instance identifier `foo`.

Modules are just functions, so they can receive parameters:

```js
function CoolModule(id) {
	function identify() {
		console.log( id );
	}

	return {
		identify: identify
	};
}

var foo1 = CoolModule( "foo 1" );
var foo2 = CoolModule( "foo 2" );

foo1.identify(); // "foo 1"
foo2.identify(); // "foo 2"
```

Another slight but powerful variation on the module pattern is to name the object you are returning as your public API:

```js
var foo = (function CoolModule(id) {
	function change() {
		// modifying the public API
		publicAPI.identify = identify2;
	}

	function identify1() {
		console.log( id );
	}

	function identify2() {
		console.log( id.toUpperCase() );
	}

	var publicAPI = {
		change: change,
		identify: identify1
	};

	return publicAPI;
})( "foo module" );

foo.identify(); // foo module
foo.change();
foo.identify(); // FOO MODULE
```

By retaining an inner reference to the public API object inside your module instance, you can modify that module instance **from the inside**, including adding and removing methods, properties, *and* changing their values.

### Modern Modules

Various module dependency loaders/managers essentially wrap up this pattern of module definition into a friendly API. Rather than examine any one particular library, let me present a *very simple* proof of concept **for illustration purposes (only)**:

```js
var MyModules = (function Manager() {
	var modules = {};

	function define(name, deps, impl) {
		for (var i=0; i<deps.length; i++) {
			deps[i] = modules[deps[i]];
		}
		modules[name] = impl.apply( impl, deps );
	}

	function get(name) {
		return modules[name];
	}

	return {
		define: define,
		get: get
	};
})();
```

The key part of this code is `modules[name] = impl.apply(impl, deps)`. This is invoking the definition wrapper function for a module (passing in any dependencies), and storing the return value, the module's API, into an internal list of modules tracked by name.

And here's how I might use it to define some modules:

```js
MyModules.define( "bar", [], function(){
	function hello(who) {
		return "Let me introduce: " + who;
	}

	return {
		hello: hello
	};
} );

MyModules.define( "foo", ["bar"], function(bar){
	var hungry = "hippo";

	function awesome() {
		console.log( bar.hello( hungry ).toUpperCase() );
	}

	return {
		awesome: awesome
	};
} );

var bar = MyModules.get( "bar" );
var foo = MyModules.get( "foo" );

console.log(
	bar.hello( "hippo" )
); // Let me introduce: hippo

foo.awesome(); // LET ME INTRODUCE: HIPPO
```

Both the "foo" and "bar" modules are defined with a function that returns a public API. "foo" even receives the instance of "bar" as a dependency parameter, and can use it accordingly.

Spend some time examining these code snippets to fully understand the power of closures put to use for our own good purposes. The key take-away is that there's not really any particular "magic" to module managers. They fulfill both characteristics of the module pattern I listed above: invoking a function definition wrapper, and keeping its return value as the API for that module.

In other words, modules are just modules, even if you put a friendly wrapper tool on top of them.

### Future Modules

ES6 adds first-class syntax support for the concept of modules. When loaded via the module system, ES6 treats a file as a separate module. Each module can both import other modules or specific API members, as well export their own public API members.

**Note:** Function-based modules aren't a statically recognized pattern (something the compiler knows about), so their API semantics aren't considered until run-time. That is, you can actually modify a module's API during the run-time (see earlier `publicAPI` discussion).

By contrast, ES6 Module APIs are static (the APIs don't change at run-time). Since the compiler knows *that*, it can (and does!) check during (file loading and) compilation that a reference to a member of an imported module's API *actually exists*. If the API reference doesn't exist, the compiler throws an "early" error at compile-time, rather than waiting for traditional dynamic run-time resolution (and errors, if any).

ES6 modules **do not** have an "inline" format, they must be defined in separate files (one per module). The browsers/engines have a default "module loader" (which is overridable, but that's well-beyond our discussion here) which synchronously loads a module file when it's imported.

Consider:

**bar.js**
```js
function hello(who) {
	return "Let me introduce: " + who;
}

export hello;
```

**foo.js**
```js
// import only `hello()` from the "bar" module
import hello from "bar";

var hungry = "hippo";

function awesome() {
	console.log(
		hello( hungry ).toUpperCase()
	);
}

export awesome;
```

```js
// import the entire "foo" and "bar" modules
module foo from "foo";
module bar from "bar";

console.log(
	bar.hello( "rhino" )
); // Let me introduce: rhino

foo.awesome(); // LET ME INTRODUCE: HIPPO
```

**Note:** Separate files **"foo.js"** and **"bar.js"** would need to be created, with the contents as shown in the first two snippets, respectively. Then, your program would load/import those modules to use them, as shown in the third snippet.

`import` imports one or more members from a module's API into the current scope, each to a bound variable (`hello` in our case). `module` imports an entire module API to a bound variable (`foo`, `bar` in our case). `export` exports an identifier (variable, function) to the public API for the current module. These operators can be used as many times in a module's definition as is necessary.

The contents inside the *module file* are treated as if enclosed in a scope closure, just like with the function-closure modules seen earlier.

## Review (TL;DR)

Closure seems to the un-enlightened like a mystical world set apart inside of JavaScript which only the few bravest souls can reach. But it's actually just a standard and almost obvious fact of how we write code in a lexically scoped environment, where functions are values and can be passed around at will.

**Closure is when a function can remember and access its lexical scope even when it's invoked outside its lexical scope.**

Closures can trip us up, for instance with loops, if we're not careful to recognize them and how they work. But they are also an immensely powerful tool, enabling patterns like *modules* in their various forms.

Modules require two key characteristics: 1) an outer wrapping function being invoked, to create the enclosing scope 2) the return value of the wrapping function must include reference to at least one inner function that then has closure over the private inner scope of the wrapper.

Now we can see closures all around our existing code, and we have the ability to recognize and leverage them to our own benefit!
