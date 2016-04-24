# 你不懂JS: 异步与性能
# 第五章: 程序性能

这本书至此一直是关于如何更有效地利用异步模式。但是我们还没有直接解释为什么异步对于JS如此重要。最明显明确的理由就是 **性能**。

举个例子，如果你要发起两个Ajax请求，而且他们是独立的，但你在进行下一个任务之前需要等到他们全部完成，你就有两种选择来对这种互动建模：顺序和并发。

你可以发起第一个请求并等到它完成再发起第二个请求。或者，就像我们在promise和generator中看到的那样，你可以“并列地”发起两个请求，并在继续下一步之前让一个“门”等待它们全部完成。

显然，后者要比前者性能更好。更好的性能一般都会带来更好的用户体验。

异步（并发穿插）甚至可能仅仅增强高性能的印象，就算整个程序依然要用相同的时间才成完成。用户对性能的印象就是一切——如果没有别的的话！——和实际可测量的性能一样重要。

现在，我们想超越局部的异步模式，转而在程序级别的水平上讨论一些宏观的性能细节。

**注意：** 你肯能会想知道关于微性能问题比如`a++`与`++a`哪个更快。我们会在下一章“基准分析与调优”中讨论这类性能细节。

## Web Workers

如果你有一些计算敏感的任务，但你不想让它们在主线程上运行（那样会使浏览器/UI变慢），你可能会希望JavaScript可以以多线程的方式操作。

在第一章中，我们详细地谈到了关于JavaScript如何是单线程的。那仍然是成立的。但是单线程不是组织你程序运行的唯一方法。

想象将你的程序分割成两块儿，在UI主线程上运行其中的一块儿，而在一个完全分离的线程上运行另一块儿。

这样的结构会引发什么我们需要关心的问题？

其一，你会想知道运行在一个分离的线程上是否意味着它在并行运行（在多CPU/内核的系统上），而在第二个线程上长时间运行的处理将 **不会** 阻塞主程序线程。否则，“虚拟线程”所带来的好处，不会比我们已经在异步并发的JS中得到的更多。

而且你会想知道这两块儿程序是否访问共享的作用域/资源。如果是，那么你就要对付多线程语言（Java，C++等等）的所有问题，比如协作式或抢占式锁定（mutexes等）。这是很多额外的工作，而且不应当轻易着手。

换一个角度，如果这两块儿程序不能共享作用域/资源，你会想知道它们将如何“通信”。

随着我们探索一个在近HTML5时代被加入web平台，称为“Web Worker”的特性，这些都是我们要考虑的大问题。这是一个浏览器（也就是宿主环境）特性，而且几乎和JS语言本身没有任何关系。也就是，JavaScript并没有任何平行的特性来支持线程运行。

但是一个像你的浏览器那样的环境可以很容易地提供多个JavaScript引擎实例，每个都在自己的线程上，并允许你在每个线程上运行不同的程序。你的程序中分离的线程块儿中的每一个都成为一个“（Web）Worker”。这种并行机制称为“任务并行机制”，它强调将你的程序分割成块儿来并行运行。

在你的主JS程序（或另一个Worker）中，你可以这样初始化一个Worker：

```js
var w1 = new Worker( "http://some.url.1/mycoolworker.js" );
```

这个URL应当指向JS文件的位置（不是一个HTML网页！），它将会被加载到一个Worker。然后浏览器会启动一个分离的线程，然这个文件在这个线程上作为独立的程序运行。

**注意：** 这种用这样的URL创建的Worker称为“专用（Dedicated）Wroker”。但与提供一个外部文件的URL相反，你也可以通过提供一个Blob URL（另一个HTML5特性）来创建一个“内联（Inline）Worker”；它实质上是一个存储在一个单一（二进制）值中的内联文件。但是，Blob超出了我们要在这里讨论的范围。

Worker不会相互，或者与主程序共享任何作用域或资源——那会将所有的多线程编程噩梦带到前沿——取而代之的是连接它们的基本事件消息机制。

`w1`Worker对象是一个事件监听器和触发器，它允许你监听Worker发出的事件也允许向Worker发送事件。

这是如何监听事件（实际上，是固定的`"message"`事件）：

```js
w1.addEventListener( "message", function(evt){
	// evt.data
} );
```

而且你可以发送`"message"`事件给Worker：

```js
w1.postMessage( "something cool to say" );
```

在Worker内部，消息是完全对称的：

```js
// "mycoolworker.js"

addEventListener( "message", function(evt){
	// evt.data
} );

postMessage( "a really cool reply" );
```

要注意的是，一个专用Worker与它创建的程序是一对一的关系。也就是，`"message"`事件不需要消除任何歧义，因为我们可以确定他来自于这种一对一关系——不是从Wroker来的，就是从主页面来的。

通常主页面的程序会创建Worker，但是一个Worker可以根据需要初始化它自己的子Worker——称为subworker。有时将这样的细节委托给一种可以生成其他Worker来处理任务的一部分的“主”Worker十分有用。不幸的是，在本书写作的时候，Chrome还没有支持subworker，然而Firefox支持。

要从创建一个Worker的程序中立即杀死它，在Worker对象（就像前一个代码段中的`w1`）上调用`terminate()`。突然终结一个Worker线程不会给它任何机会结束它的工作，或清理任何资源。这和你关闭浏览器的标签页来杀死一个页面相似。

如果你在浏览器中有两个或多个页面（或者同一个页面有多个标签页！），它们试着从同一个文件URL中创建Worker，实际上最终结果是完全分离的Worker。待一会儿我们就会讨论“共享”Worker的方法。

**注意：** 看起来一个恶意的或者是无知的JS程序可以很容易地通过在系统上生成数百个Worker来发起拒绝服务攻击（Dos攻击），看起来每个都在自己的线程上。虽然一个Worker将会在一个分离的线程上终结是有某种保证的，但这种保证不是无限的。系统可以自由决定有多少实际的线程/CPU/内核要去创建。没有办法预测或保证你能访问多少，虽然很多人假定它至少和可用的CPU/内核数一样多。我认为最安全的臆测是，除了主UI线程外至少有一个线程，仅此而已。

### Worker Environment

在Worker内部，你不能访问主程序的任何资源。这意味着你不能访问它的任何全局变量，你也不能访问页面的DOM或其他资源。记住：它是一个完全分离的线程。

然而，你可以实施网络操作（Ajax，WebSocket）和设置定时器。另外，Worker可以访问它自己的几个重要全局变量/特性的拷贝，包括`navigator`，`location`，`JSON`，和`applicationCache`。

你也可以加载额外的JS脚本到你的Worker中，使用`importScripts(..)`：

```js
// inside the Worker
importScripts( "foo.js", "bar.js" );
```

这些脚本会被同步地加载，这意味着在文件完成加载和运行之前，`importScripts(..)`调用会阻塞Worker其他的执行。

**注意：** 还有一些关于暴露`<canvas>`API给Worker的讨论，包含着使canvas成为Transferable（见“数据传送”一节），这将允许Worker来实施一些精细的脱线程绘图处理，在高性能的游戏（WebGL）和其他类似应用中可能很有用。虽然这在任何浏览器中都还不存在，但是很有可能在近未来发生。

Web Worker的常见用法是什么？

* 处理敏感的数学计算
* 大数据集合的排序
* 数据操作（压缩，音频分析，图像像素操作等等）
* 高流量网络通信

### Data Transfer

你可能注意到了这些用法中的大多数的一个共同性质，就是它们要求使用事件机制穿越线程间的壁垒来传递大量的信息，也许是双向的。

在Worker的早期，将所有数据序列化为字符串是唯一的选择。除了在两个方向上进行序列化时速度上受到的惩罚，另外一个主要缺点是，数据是被拷贝的，这意味着内存用量的翻倍（以及在后续垃圾回收上的流失）。

谢天谢地，现在我们有了几个更好的选择。

如果你传递一个对象，在另一端一个所谓的“结构化克隆算法（Structured Cloning Algorithm）”（https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm）会用于拷贝/复制这个对象。这个算法相当精巧，甚至可以处理循环引用的对象复制。to-string/from-string的性能低下没有了，但用这种方式我们依然面对这内存用量的翻倍。IE10以上版本，和其他主流浏览器都对此有支持。

一个更好的选择，特别是对大的数据集合而言，是“Transferable对象”（http://updates.html5rocks.com/2011/12/Transferable-Objects-Lightning-Fast）。它发生的是对象的“所有权”被传送了，而对象本身没动。一旦你传送一个对象给Worker，它在原来的位置就空了出来或者不可访问——这消除了共享作用域的多线程编程中的灾难。当然，所有权的传送可以双向进行。

选择使用Transferable对象不需要你做太多；任何实现了Transferable接口（https://developer.mozilla.org/en-US/docs/Web/API/Transferable）的数据结构都将自动地以这种方式传递（Firefox和Chrome支持此特性）。

举个例子，有类型的数组如`Uint8Array`（见本系列的 *ES6与未来*）是一个“Transferables”。这是你如何用`postMessage(..)`来传送一个Transferable对象：

```js
// `foo` is a `Uint8Array` for instance

postMessage( foo.buffer, [ foo.buffer ] );
```

第一个参数是未经加工的缓冲，而第二个参数是要传送的内容的列表。

不支持Transferable对象的浏览器简单地降级到结构化克隆，这意味着性能上的降低，而不是彻底的特性断裂。

### Shared Workers

如果你的网站或应用允许同一个网页加载多个标签页（一个很常见的特性），你也许非常想通过防止复制专用Worker来降低系统资源的使用量；这方面最常见的资源限制是网络套接字链接，因为浏览器限制同时连接到一个服务器的连接数量。当然，限制从客户端来的链接数也缓和了你的服务器资源需求。

在这种情况下，创建一个单独的中心化Worker，让你的网站或应用的所有网页实例可以 *共享* 它是十分有用的。

这称为`SharedWorker`，你肯这样创建它（仅有Firefox与Chrome支持此特性）：

```js
var w1 = new SharedWorker( "http://some.url.1/mycoolworker.js" );
```

因为一个共享Worker可以被连接到，或者从多于一个你网站上的程序实例或网页连接，Worker需要一个方法来知道消息来自哪个程序。这种唯一的标识称为“端口（port）”——想想网络套接字端口。所以调用端程序必须使用Worker的`port`对象来通信：

```js
w1.port.addEventListener( "message", handleMessages );

// ..

w1.port.postMessage( "something cool" );
```

另外，端口连接必须被初始化，就像：

```js
w1.port.start();
```

在共享Worker内部，一个额外的事件必须被处理：`"connect"`。这个事件为这个特定的连接提供了端口`object`。保持多个分离的连接最简单的方法是在`port`上使用闭包，就像下面展示的那样，同时在`"connect"`事件的处理器内部定义这个连接的事件监听与传送：

```js
// inside the shared Worker
addEventListener( "connect", function(evt){
	// the assigned port for this connection
	var port = evt.ports[0];

	port.addEventListener( "message", function(evt){
		// ..

		port.postMessage( .. );

		// ..
	} );

	// initialize the port connection
	port.start();
} );
```

除了这点不同，共享与专用Worker的功能和语义是一样的。

**注意：** 如果在一个端口的连接终结时还有其他端口的连接存活着的话，共享Worker也会存活下来，而专用Worker会在与初始化它的程序间接终结时终结。

### Polyfilling Web Workers

Web Worker对于并行运行JS程序在性能考量上十分吸引人。然而，你的代码可能运行在对此缺乏支持的老版本浏览器上。因为Worker是一个API而不是语法，它们可以被填补，在某种程度上。

如果浏览器不支持Worker，那就没有办法从性能的角度来模拟多线程。Iframe通常被认为可以提供并行环境，但在所有的现代浏览器中它们实际上和主页运行在同一个线程上，所以用它们来模拟并行机制是不够的。

正如我们在第一章中详细讨论的，JS的异步能力（不是并行机制）来自于事件轮询队列，所以你可以用计时器（`setTimeout(..)`等等）来强制模拟的Worker是异步的。然后你只需要提供Worker API的填补就行了。这里有一份列表（https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#web-workers），但坦白地说它们看起来都不怎么样。

我在这里（https://gist.github.com/getify/1b26accb1a09aa53ad25）写了一个填补`Worker`的轮廓。它很基本，但应该满足了简单的`Worker`支持，它的双向信息传递可以争取工作，还有`"onerror"`处理。你可能会扩展它来支持更多特性，比如`terminate()`或模拟共享Worker，只要你觉得合适。

**注意：** 你不能模拟同步阻塞，所以这个填补不允许使用`importScripts(..)`。另一个选择可能是转换并传递Worker的代码（一旦Ajax加载后），来重写一个`importScripts(..)`填补的一些异步形式，也许使用一个promise相关的接口。

## SIMD

一个指令，多个数据（SIMD）是一种形式的“数据并行机制”，与Web Worker的“任务并行机制”相对照，因为他强调的不是程序逻辑的块儿被并行化，而是多个字节的数据被并行地处理。

使用SIMD，线程不提供并行机制。相反，现代CPU用数字的“向量”提供SIMD能力——想想：指定类型的数组——还有可以在所有这些数字上并行操作的指令；这些是利用底层操作的指令级别的并行机制。

使SIMD能力包含在JavaScript中的努力主要是由Intel带头的（https://01.org/node/1495），名义上是Mohammad Haghighat（在本书写作的时候），与Firefox和Chrome团队合作。SIMD处于早期标准化阶段，而且很有可能被加入未来版本的JavaScript中，很可能在ES7的时间框架内。

SIMD JavaScript提议向JS代码暴露短向量类型与API，它们在SIMD可用的系统中将操作直接映射为CPU的等价物，同时在非SIMD系统中退回到非并行化操作的“shim”。

对于数据敏感的应用程序（信号分析，对图形的矩阵操作等等）来说，这种并行数学处理在性能上的优势是十分明显的！

在本书写作时，SIMD API的早期提案形式看起来像这样：

```js
var v1 = SIMD.float32x4( 3.14159, 21.0, 32.3, 55.55 );
var v2 = SIMD.float32x4( 2.1, 3.2, 4.3, 5.4 );

var v3 = SIMD.int32x4( 10, 101, 1001, 10001 );
var v4 = SIMD.int32x4( 10, 20, 30, 40 );

SIMD.float32x4.mul( v1, v2 );	// [ 6.597339, 67.2, 138.89, 299.97 ]
SIMD.int32x4.add( v3, v4 );		// [ 20, 121, 1031, 10041 ]
```

这里展示了两种不同的向量数据类型，32位浮点数和32位整数。你可以看到这些向量正好被设置为4个32位元素，这与大多数CPU中可用的SIMD向量的大小（128位）相匹配。在未来我们看到一个`x8`（或更大！）版本的这些API也是可能的。

除了`mul()`和`add()`，许多其他操作也很可能被加入，比如`sub()`，`div()`，`abs()`，`neg()`，`sqrt()`，`reciprocal()`，`reciprocalSqrt()` （算数运算），`shuffle()`（重拍向量元素），`and()`，`or()`，`xor()`，`not()`（逻辑运算），`equal()`，`greaterThan()`，`lessThan()` （比较运算），`shiftLeft()`，`shiftRightLogical()`，`shiftRightArithmetic()`（轮换），`fromFloat32x4()`，和`fromInt32x4()`（变换）。

**注意：** 这里有一个SIMD功能的官方“填补”（很有希望，预期的，着眼未来的填补）（https://github.com/johnmccutchan/ecmascript_simd），它描述了许多比我们在这一节中没有讲到的许多计划中的SIMD功能。

## asm.js

"asm.js" (http://asmjs.org/) is a label for a highly optimizable subset of the JavaScript language. By carefully avoiding certain mechanisms and patterns that are *hard* to optimize (garbage collection, coercion, etc.), asm.js-styled code can be recognized by the JS engine and given special attention with aggressive low-level optimizations.

Distinct from other program performance mechanisms discussed in this chapter, asm.js isn't necessarily something that needs to be adopted into the JS language specification. There *is* an asm.js specification (http://asmjs.org/spec/latest/), but it's mostly for tracking an agreed upon set of candidate inferences for optimization rather than a set of requirements of JS engines.

There's not currently any new syntax being proposed. Instead, asm.js suggests ways to recognize existing standard JS syntax that conforms to the rules of asm.js and let engines implement their own optimizations accordingly.

There's been some disagreement between browser vendors over exactly how asm.js should be activated in a program. Early versions of the asm.js experiment required a `"use asm";` pragma (similar to strict mode's `"use strict";`) to help clue the JS engine to be looking for asm.js optimization opportunities and hints. Others have asserted that asm.js should just be a set of heuristics that engines automatically recognize without the author having to do anything extra, meaning that existing programs could theoretically benefit from asm.js-style optimizations without doing anything special.

### How to Optimize with asm.js

The first thing to understand about asm.js optimizations is around types and coercion (see the *Types & Grammar* title of this series). If the JS engine has to track multiple different types of values in a variable through various operations, so that it can handle coercions between types as necessary, that's a lot of extra work that keeps the program optimization suboptimal.

**Note:** We're going to use asm.js-style code here for illustration purposes, but be aware that it's not commonly expected that you'll author such code by hand. asm.js is more intended to a compilation target from other tools, such as Emscripten (https://github.com/kripken/emscripten/wiki). It's of course possible to write your own asm.js code, but that's usually a bad idea because the code is very low level and managing it can be very time consuming and error prone. Nevertheless, there may be cases where you'd want to hand tweak your code for asm.js optimization purposes.

There are some "tricks" you can use to hint to an asm.js-aware JS engine what the intended type is for variables/operations, so that it can skip these coercion tracking steps.

For example:

```js
var a = 42;

// ..

var b = a;
```

In that program, the `b = a` assignment leaves the door open for type divergence in variables. However, it could instead be written as:

```js
var a = 42;

// ..

var b = a | 0;
```

Here, we've used the `|` ("binary OR") with value `0`, which has no effect on the value other than to make sure it's a 32-bit integer. That code run in a normal JS engine works just fine, but when run in an asm.js-aware JS engine it *can* signal that `b` should always be treated as a 32-bit integer, so the coercion tracking can be skipped.

Similarly, the addition operation between two variables can be restricted to a more performant integer addition (instead of floating point):

```js
(a + b) | 0
```

Again, the asm.js-aware JS engine can see that hint and infer that the `+` operation should be 32-bit integer addition because the end result of the whole expression would automatically be 32-bit integer conformed anyway.

### asm.js Modules

One of the biggest detractors to performance in JS is around memory allocation, garbage collection, and scope access. asm.js suggests one of the ways around these issues is to declare a more formalized asm.js "module" -- do not confuse these with ES6 modules; see the *ES6 & Beyond* title of this series.

For an asm.js module, you need to explicitly pass in a tightly conformed namespace -- this is referred to in the spec as `stdlib`, as it should represent standard libraries needed -- to import necessary symbols, rather than just using globals via lexical scope. In the base case, the `window` object is an acceptable `stdlib` object for asm.js module purposes, but you could and perhaps should construct an even more restricted one.

You also must declare a "heap" -- which is just a fancy term for a reserved spot in memory where variables can already be used without asking for more memory or releasing previously used memory -- and pass that in, so that the asm.js module won't need to do anything that would cause memory churn; it can just use the pre-reserved space.

A "heap" is likely a typed `ArrayBuffer`, such as:

```js
var heap = new ArrayBuffer( 0x10000 );	// 64k heap
```

Using that pre-reserved 64k of binary space, an asm.js module can store and retrieve values in that buffer without any memory allocation or garbage collection penalties. For example, the `heap` buffer could be used inside the module to back an array of 64-bit float values like this:

```js
var arr = new Float64Array( heap );
```

OK, so let's make a quick, silly example of an asm.js-styled module to illustrate how these pieces fit together. We'll define a `foo(..)` that takes a start (`x`) and end (`y`) integer for a range, and calculates all the inner adjacent multiplications of the values in the range, and then finally averages those values together:

```js
function fooASM(stdlib,foreign,heap) {
	"use asm";

	var arr = new stdlib.Int32Array( heap );

	function foo(x,y) {
		x = x | 0;
		y = y | 0;

		var i = 0;
		var p = 0;
		var sum = 0;
		var count = ((y|0) - (x|0)) | 0;

		// calculate all the inner adjacent multiplications
		for (i = x | 0;
			(i | 0) < (y | 0);
			p = (p + 8) | 0, i = (i + 1) | 0
		) {
			// store result
			arr[ p >> 3 ] = (i * (i + 1)) | 0;
		}

		// calculate average of all intermediate values
		for (i = 0, p = 0;
			(i | 0) < (count | 0);
			p = (p + 8) | 0, i = (i + 1) | 0
		) {
			sum = (sum + arr[ p >> 3 ]) | 0;
		}

		return +(sum / count);
	}

	return {
		foo: foo
	};
}

var heap = new ArrayBuffer( 0x1000 );
var foo = fooASM( window, null, heap ).foo;

foo( 10, 20 );		// 233
```

**Note:** This asm.js example is hand authored for illustration purposes, so it doesn't represent the same code that would be produced from a compilation tool targeting asm.js. But it does show the typical nature of asm.js code, especially the type hinting and use of the `heap` buffer for temporary variable storage.

The first call to `fooASM(..)` is what sets up our asm.js module with its `heap` allocation. The result is a `foo(..)` function we can call as many times as necessary. Those `foo(..)` calls should be specially optimized by an asm.js-aware JS engine. Importantly, the preceding code is completely standard JS and would run just fine (without special optimization) in a non-asm.js engine.

Obviously, the nature of restrictions that make asm.js code so optimizable reduces the possible uses for such code significantly. asm.js won't necessarily be a general optimization set for any given JS program. Instead, it's intended to provide an optimized way of handling specialized tasks such as intensive math operations (e.g., those used in graphics processing for games).

## Review

The first four chapters of this book are based on the premise that async coding patterns give you the ability to write more performant code, which is generally a very important improvement. But async behavior only gets you so far, because it's still fundamentally bound to a single event loop thread.

So in this chapter we've covered several program-level mechanisms for improving performance even further.

Web Workers let you run a JS file (aka program) in a separate thread using async events to message between the threads. They're wonderful for offloading long-running or resource-intensive tasks to a different thread, leaving the main UI thread more responsive.

SIMD proposes to map CPU-level parallel math operations to JavaScript APIs for high-performance data-parallel operations, like number processing on large data sets.

Finally, asm.js describes a small subset of JavaScript that avoids the hard-to-optimize parts of JS (like garbage collection and coercion) and lets the JS engine recognize and run such code through aggressive optimizations. asm.js could be hand authored, but that's extremely tedious and error prone, akin to hand authoring assembly language (hence the name). Instead, the main intent is that asm.js would be a good target for cross-compilation from other highly optimized program languages -- for example, Emscripten (https://github.com/kripken/emscripten/wiki) transpiling C/C++ to JavaScript.

While not covered explicitly in this chapter, there are even more radical ideas under very early discussion for JavaScript, including approximations of direct threaded functionality (not just hidden behind data structure APIs). Whether that happens explicitly, or we just see more parallelism creep into JS behind the scenes, the future of more optimized program-level performance in JS looks really *promising*.
