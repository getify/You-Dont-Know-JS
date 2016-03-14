# 你不懂JS: 异步与性能
# 第一章: 异步: 现在与稍后

One of the most important and yet often misunderstood parts of programming in a language like JavaScript is how to express and manipulate program behavior spread out over a period of time.

在像JavaScript这样的语言中最重要但经常被误解的编程技术之一，就是如何表达和操作跨越一段时间的程序行为。

This is not just about what happens from the beginning of a `for` loop to the end of a `for` loop, which of course takes *some time* (microseconds to milliseconds) to complete. It's about what happens when part of your program runs *now*, and another part of your program runs *later* -- there's a gap between *now* and *later* where your program isn't actively executing.

这不仅仅是关于从`for`循环开始到`for`循环结束之间发生的事情，当然，它确实要花 *一些*（几微秒到几毫秒）时间才能完成。它是关于你的程序 *现在* 运行的部分，和你的程序 *稍后* 运行的部分之间发生的事情——*现在* 和 *稍后* 之间有一个间隙，在这个间隙中你的程序没有活动地执行。

Practically all nontrivial programs ever written (especially in JS) have in some way or another had to manage this gap, whether that be in waiting for user input, requesting data from a database or file system, sending data across the network and waiting for a response, or performing a repeated task at a fixed interval of time (like animation). In all these various ways, your program has to manage state across the gap in time. As they famously say in London (of the chasm between the subway door and the platform): "mind the gap."

实践中所有被写过的（特别是用JS）重要程序都有这样或那样的情况需要管理这个间隙，不管是等待用户输入，从数据库或文件系统请求数据，通过网络发送数据并等待应答，或在规定的时间间隔重复某些任务（比如动画）。所有这些种种情况，你的程序都不得不跨越时间间隙管理状态。就像人们在伦敦常说的（地铁门与月台间的缝隙）：“小心间隙。”

In fact, the relationship between the *now* and *later* parts of your program is at the heart of asynchronous programming.

实际上，你程序中 *现在* 与 *稍后* 的部分的联系，就是异步编程的核心。

Asynchronous programming has been around since the beginning of JS, for sure. But most JS developers have never really carefully considered exactly how and why it crops up in their programs, or explored various *other* ways to handle it. The *good enough* approach has always been the humble callback function. Many to this day will insist that callbacks are more than sufficient.

可以确定，异步编程在JS的最开始就出现了。但是大多数开发者从没认真地考虑过它是如何，为什么生长在他们的程序中，也没有探索过 *其他* 处理异步的方式。*足够好* 的方法总是老实巴交的回调函数。今天还有许多人坚持认为回调就绰绰有余了。

But as JS continues to grow in both scope and complexity, to meet the ever-widening demands of a first-class programming language that runs in browsers and servers and every conceivable device in between, the pains by which we manage asynchrony are becoming increasingly crippling, and they cry out for approaches that are both more capable and more reason-able.

但是JS在使用范围和复杂性上不停生长，为了满足运行在浏览器，服务器和每个可能的设备上的头等编程语言的日益扩大的需求，我们在管理异步上感受到的痛苦日趋严重，人们迫切地需要一种更强大更合理的处理方法。

While this all may seem rather abstract right now, I assure you we'll tackle it more completely and concretely as we go on through this book. We'll explore a variety of emerging techniques for async JavaScript programming over the next several chapters.

虽然眼前这一切看起来很抽象，但我保证随着我们通读这本书你会更完整且坚实地解决它。在接下来的几章中我们将会探索各种异步JavaScript编程的新兴技术。

But before we can get there, we're going to have to understand much more deeply what asynchrony is and how it operates in JS.

但在接触它们之前，我们将不得不更深刻地理解异步是什么，以及它在JS中如何运行。

## A Program in Chunks

You may write your JS program in one *.js* file, but your program is almost certainly comprised of several chunks, only one of which is going to execute *now*, and the rest of which will execute *later*. The most common unit of *chunk* is the `function`.

你可能将你的JS程序写在一个 *.js* 文件中，但几乎可以确定你的程序是由几个代码块儿构成的，仅有一个将会在 *现在* 执行，而其他的将会在 *稍后* 执行。最常见的 *代码块儿* 单位是`function`。

The problem most developers new to JS seem to have is that *later* doesn't happen strictly and immediately after *now*. In other words, tasks that cannot complete *now* are, by definition, going to complete asynchronously, and thus we will not have blocking behavior as you might intuitively expect or want.

大多数刚接触JS的开发者都有的问题是，*稍后* 并不严格且立即地在 *现在* 之后发生。换句话说，根据定义，*现在* 不能完成的任务将会异步地完成，而且我们因此不会有你可能在直觉上期望或想要的阻塞行为。

Consider:

考虑这段代码：

```js
// ajax(..)是某个包中任意的Ajax函数
var data = ajax( "http://some.url.1" );

console.log( data );
// 噢！`data`一般不会有Ajax的结果
```

You're probably aware that standard Ajax requests don't complete synchronously, which means the `ajax(..)` function does not yet have any value to return back to be assigned to `data` variable. If `ajax(..)` *could* block until the response came back, then the `data = ..` assignment would work fine.

你可能意识到了，Ajax请求不会同步地完成，也就是`ajax(..)`函数还没有任何返回的值可以赋值给变量`data`。如果`ajax(..)`在应答返回之前 *能够* 阻塞，那么`data = ..`赋值将会正常工作。

But that's not how we do Ajax. We make an asynchronous Ajax request *now*, and we won't get the results back until *later*.

但那不是我们使用Ajax的方式。我们 *现在* 制造一个异步的Ajax请求，*稍后* 我们将得到结果。

The simplest (but definitely not only, or necessarily even best!) way of "waiting" from *now* until *later* is to use a function, commonly called a callback function:

从 *现在* “等到” *稍后* 最简单的（但绝对不是唯一的，或最好的）方法，通常称为回调函数。

```js
// ajax(..) 是某个包中任意的Ajax函数
ajax( "http://some.url.1", function myCallbackFunction(data){

	console.log( data ); // Yay, 我得到了一些`data`!

} );
```

**Warning:** You may have heard that it's possible to make synchronous Ajax requests. While that's technically true, you should never, ever do it, under any circumstances, because it locks the browser UI (buttons, menus, scrolling, etc.) and prevents any user interaction whatsoever. This is a terrible idea, and should always be avoided.

**警告：** 你可能听说过制造同步的Ajax请求是可能的。虽然在技术上是这样的，但你永远不应该在任何情况下这样做，因为它将锁定浏览器的UI（按钮，菜单，滚动条，等等）而且组织用户与任何东西互动。这是一个坏主意，你应当永远回避它。

Before you protest in disagreement, no, your desire to avoid the mess of callbacks is *not* justification for blocking, synchronous Ajax.

在你提出抗议之前，不，你想避免混乱的回调的渴望，不是使用阻塞的同步Ajax的正当理由。

For example, consider this code:

举个例子，考虑下面的代码：

```js
function now() {
	return 21;
}

function later() {
	answer = answer * 2;
	console.log( "Meaning of life:", answer );
}

var answer = now();

setTimeout( later, 1000 ); // Meaning of life: 42
```

There are two chunks to this program: the stuff that will run *now*, and the stuff that will run *later*. It should be fairly obvious what those two chunks are, but let's be super explicit:

这个程序中有两个代码块儿：*现在* 将会运行的东西，和 *稍后* 将会运行的东西。这两个代码块分贝是什么应当十分明显，让我们以最明确的方式指出来：

现在：
```js
function now() {
	return 21;
}

function later() { .. }

var answer = now();

setTimeout( later, 1000 );
```

稍后：
```js
answer = answer * 2;
console.log( "Meaning of life:", answer );
```

The *now* chunk runs right away, as soon as you execute your program. But `setTimeout(..)` also sets up an event (a timeout) to happen *later*, so the contents of the `later()` function will be executed at a later time (1,000 milliseconds from now).

你的程序一执行，*现在* 代码块儿就会立即运行。但`setTimeout(..)`还设置了一个 *稍后* 会发生的事件（一个超时事件），所以`later()`函数的内容将会在一段时间（从现在开始1000毫秒）后被执行。

Any time you wrap a portion of code into a `function` and specify that it should be executed in response to some event (timer, mouse click, Ajax response, etc.), you are creating a *later* chunk of your code, and thus introducing asynchrony to your program.

无论何时，你将一部分代码包进`function`并且规定它应当为了响应某些事件而执行，你就创建了一个 *稍后* 代码块儿，也因此在你的程序中引入了异步。

### Async Console
### 异步控制台

There is no specification or set of requirements around how the `console.*` methods work -- they are not officially part of JavaScript, but are instead added to JS by the *hosting environment* (see the *Types & Grammar* title of this book series).

关于`console.*`方法如何工作，没有相应的语言规范或一组需求——它们不是JavaScript官方的一部分，而是由 *宿主环境* 添加到JS上的（见本丛书的 *类型与文法*）。

So, different browsers and JS environments do as they please, which can sometimes lead to confusing behavior.

所以，不同的浏览器和JS环境各自为战，这有事会导致令人困惑的行为。

In particular, there are some browsers and some conditions that `console.log(..)` does not actually immediately output what it's given. The main reason this may happen is because I/O is a very slow and blocking part of many programs (not just JS). So, it may perform better (from the page/UI perspective) for a browser to handle `console` I/O asynchronously in the background, without you perhaps even knowing that occurred.

特别地，有些浏览器在某些条件下，`console.log(..)`实际上不会立即输出它得到的东西。这个现象的主要原因可能是因为I/O很慢和许多程序的阻塞部分（不仅是JS）。所以，可能性能更好的方式是，浏览器在后台异步地处理`console`I/O，而你也许根本不知道它发生了。

A not terribly common, but possible, scenario where this could be *observable* (not from code itself but from the outside):

虽然不是很常见，但是可能被观察到（不是从代码本身，而是从外部）的场景是：

```js
var a = {
	index: 1
};

// 稍后
console.log( a ); // ??

// 再稍后
a.index++;
```

We'd normally expect to see the `a` object be snapshotted at the exact moment of the `console.log(..)` statement, printing something like `{ index: 1 }`, such that in the next statement when `a.index++` happens, it's modifying something different than, or just strictly after, the output of `a`.

我们一般希望看到，就在`console.log(..)`语句被执行的那一刻，对象`a`被取得一个快照，打印出如`{ index: 1 }`的内容，如此在下一个语句`a.index++`执行时，它将被修改为与`a`的输出不同的东西。（TODO）

Most of the time, the preceding code will probably produce an object representation in your developer tools' console that's what you'd expect. But it's possible this same code could run in a situation where the browser felt it needed to defer the console I/O to the background, in which case it's *possible* that by the time the object is represented in the browser console, the `a.index++` has already happened, and it shows `{ index: 2 }`.

大多数时候，上面的代码将会在你的开发者工具控制台中产生你期望的对象表现形式。但是同样的代码可能运行在这样的情况下：浏览器告诉后台它需要推迟控制台I/O，这样，在对象在控制台中被表示的那个时间点，`a.index++`已经执行了，所以它将显示`{ index: 2 }`。

It's a moving target under what conditions exactly `console` I/O will be deferred, or even whether it will be observable. Just be aware of this possible asynchronicity in I/O in case you ever run into issues in debugging where objects have been modified *after* a `console.log(..)` statement and yet you see the unexpected modifications show up.

到底在什么情况下`console`I/O将被推迟是不确定的，甚至是观察不到的。只能当你在调试过程中陷入问题时——对象在`console.log(..)`语句之后被修改，但你意外地看到了修改后的内容——意识到I/O的这种可能的异步性。

**Note:** If you run into this rare scenario, the best option is to use breakpoints in your JS debugger instead of relying on `console` output. The next best option would be to force a "snapshot" of the object in question by serializing it to a `string`, like with `JSON.stringify(..)`.

**注意：** 如果你遇到了这种罕见的场景，最好的选择是使用JS调试器的断点，而不是依赖`console`的输出。第二好的选项是通过将目标对象序列化为一个`string`强制取得一个它的快照，比如用`JSON.stringify(..)`。

## Event Loop（事件轮询）

Let's make a (perhaps shocking) claim: despite clearly allowing asynchronous JS code (like the timeout we just looked at), up until recently (ES6), JavaScript itself has actually never had any direct notion of asynchrony built into it.

让我们来做一个（也许是令人震惊的）声明：尽管JavaScript明确地允许异步JS代码（就像我们刚看到的timeout），但是实际上，直到最近（ES6）为止，JavaScript本身从来没有任何内建的异步概念。

**What!?** That seems like a crazy claim, right? In fact, it's quite true. The JS engine itself has never done anything more than execute a single chunk of your program at any given moment, when asked to.

**什么！？** 这看起来像是个疯狂的声明，对吧？事实上，它是真的。JS引擎本身除了在某个在被要求的时刻执行你程序的一个单独的代码块外，没有做过任何其他的事情。

"Asked to." By whom? That's the important part!

“被要求” 被谁？这才是重要的部分！

The JS engine doesn't run in isolation. It runs inside a *hosting environment*, which is for most developers the typical web browser. Over the last several years (but by no means exclusively), JS has expanded beyond the browser into other environments, such as servers, via things like Node.js. In fact, JavaScript gets embedded into all kinds of devices these days, from robots to lightbulbs.

JS引擎没有独立地运行。它运行在一个宿主环境中，这个宿主环境对大多数开发者来说就是浏览器。在过去的几年中（但不特指这几年），JS超越了浏览器的界限进入到了其他环境中，比如服务器，通过Node.js。事实上，如今JavaScript已经被嵌入到所有种类的设备中，从机器人到电灯泡儿。

But the one common "thread" (that's a not-so-subtle asynchronous joke, for what it's worth) of all these environments is that they have a mechanism in them that handles executing multiple chunks of your program *over time*, at each moment invoking the JS engine, called the "event loop."

所有这些环境的一个共通的“线程”是，他们都有一种机制：在每次调用JS引擎时，可以随着时间的推移执行你的程序的多个代码块儿，这称为“事件轮询”。

In other words, the JS engine has had no innate sense of *time*, but has instead been an on-demand execution environment for any arbitrary snippet of JS. It's the surrounding environment that has always *scheduled* "events" (JS code executions).

换句话说，JS引擎对 *时间* 没有天生的感觉，反而是一个任意JS代码段的按需执行环境。是它周围的环境在不停地安排“事件”（JS代码的执行）。

So, for example, when your JS program makes an Ajax request to fetch some data from a server, you set up the "response" code in a function (commonly called a "callback"), and the JS engine tells the hosting environment, "Hey, I'm going to suspend execution for now, but whenever you finish with that network request, and you have some data, please *call* this function *back*."

那么，举例来说，当你的JS程序发起一个从服务器取得数据的请求时，你在一个函数（通常称为回调）中建立好“应答”代码，然后JS引擎就会告诉宿主环境，“嘿，我就要暂时停止执行了，但不管你什么时候完成了这个网络请求，而且你还得到一些数据的话，请 *回来调* 这个函数。”

The browser is then set up to listen for the response from the network, and when it has something to give you, it schedules the callback function to be executed by inserting it into the *event loop*.

然后浏览器就会为网络的应答设置一个监听器，当它有东西要交给你的时候，它会通过插入 *事件轮询* 来安排回调函数将被执行。

So what is the *event loop*?

那么什么是 *事件轮询*？

Let's conceptualize it first through some fake-ish code:

让我们先通过一些假想代码来对它形成一个概念：

```js
// `eventLoop`是一个像队列一样的数组（先进，先出）
var eventLoop = [ ];
var event;

// “永远”执行
while (true) {
	// 执行一个"tick"
	if (eventLoop.length > 0) {
		// 在队列中取得下一个事件
		event = eventLoop.shift();

		// 现在执行下一个事件
		try {
			event();
		}
		catch (err) {
			reportError(err);
		}
	}
}
```

This is, of course, vastly simplified pseudocode to illustrate the concepts. But it should be enough to help get a better understanding.

当让，这只是一个用来描绘概念的大幅简化的假想代码。但是对于建立更好的理解来说应该够了。

As you can see, there's a continuously running loop represented by the `while` loop, and each iteration of this loop is called a "tick." For each tick, if an event is waiting on the queue, it's taken off and executed. These events are your function callbacks.

如你所见，有一个通过`while`循环来表现的持续不断的循环，这个循环的每一次迭代称为一个“tick”。对于每一个“tick”，如果队列中有一个事件在等待，它就会被取出执行。这些事件就是你的函数回调。

It's important to note that `setTimeout(..)` doesn't put your callback on the event loop queue. What it does is set up a timer; when the timer expires, the environment places your callback into the event loop, such that some future tick will pick it up and execute it.

者的注意的是，`setTimeout(..)`不会将你的回调放在事件轮询队列上。它设置一个定时器；当这个定时器超时的时候，环境才会把你的回调放进事件轮询，这样在某个未来的tick中它将会被取出执行。

What if there are already 20 items in the event loop at that moment? Your callback waits. It gets in line behind the others -- there's not normally a path for preempting the queue and skipping ahead in line. This explains why `setTimeout(..)` timers may not fire with perfect temporal accuracy. You're guaranteed (roughly speaking) that your callback won't fire *before* the time interval you specify, but it can happen at or after that time, depending on the state of the event queue.

如果在那时队列中已经有20个事件了会怎么样？你的回调要等待。它会排到队列最后——没有一般的方法可以插队和跳到队列的最前方。这就解释了为什么`setTimeout(..)`计时器可能不会完美地按照预计时间执行，因为这要看事件队列的状态。

So, in other words, your program is generally broken up into lots of small chunks, which happen one after the other in the event loop queue. And technically, other events not related directly to your program can be interleaved within the queue as well.

换句话说，你的程序通常被打断成许多小的代码块儿，它们一个接一个地在事件轮询队列中执行。而且从技术上说，其他与你的程序没有直接关系的事件也可以穿插在队列中。

**Note:** We mentioned "up until recently" in relation to ES6 changing the nature of where the event loop queue is managed. It's mostly a formal technicality, but ES6 now specifies how the event loop works, which means technically it's within the purview of the JS engine, rather than just the *hosting environment*. One main reason for this change is the introduction of ES6 Promises, which we'll discuss in Chapter 3, because they require the ability to have direct, fine-grained control over scheduling operations on the event loop queue (see the discussion of `setTimeout(..0)` in the "Cooperation" section).

**注意：** 我们提到了“直到最近”，暗示着ES6改变了事件轮询队列在何处被管理的性质。这主要是一个正式的技术规范，ES6现在明确地指出了事件轮询应当如何工作，这意味着它属于JS引擎应当关心的范围内，而不仅仅是 *宿主环境*。这么做的一个主要原因是为了引入ES6的Promises（我们将在第三章讨论），因为人们需要有能力对事件轮询队列的排队操作进行直接，细粒度的控制（参见“协作”一节中关于`setTimeout(..0)`的讨论）。

## Parallel Threading
## 并行线程

It's very common to conflate the terms "async" and "parallel," but they are actually quite different. Remember, async is about the gap between *now* and *later*. But parallel is about things being able to occur simultaneously.

将“异步”与“并行”两个词经常被混为一谈，但它们实际上是十分不同的。记住，异步是关于 *现在* 与 *稍后* 之间的间隙。但并行是关于事情可以同时发生。

The most common tools for parallel computing are processes and threads. Processes and threads execute independently and may execute simultaneously: on separate processors, or even separate computers, but multiple threads can share the memory of a single process.

关于并行计算最常见的工具就是进程与线程。进程和线程独立地，可能同时地执行：在不同的处理器上，甚至在不同的计算机上，但是多线程可以共享一个进程的内存资源。

An event loop, by contrast, breaks its work into tasks and executes them in serial, disallowing parallel access and changes to shared memory. Parallelism and "serialism" can coexist in the form of cooperating event loops in separate threads.

相比之下，一个事件轮询将它的工作打碎成一系列任务并串行地执行它们，不允许并行访问和更改共享的内存。并行与“串行”可能共存——以在不同线程上的事件轮询协作的形式。

The interleaving of parallel threads of execution and the interleaving of asynchronous events occur at very different levels of granularity.

并行线程执行的穿插，与异步事件的穿插发生在完全不同的粒度等级上：

For example:
比如：

```js
function later() {
	answer = answer * 2;
	console.log( "Meaning of life:", answer );
}
```

While the entire contents of `later()` would be regarded as a single event loop queue entry, when thinking about a thread this code would run on, there's actually perhaps a dozen different low-level operations. For example, `answer = answer * 2` requires first loading the current value of `answer`, then putting `2` somewhere, then performing the multiplication, then taking the result and storing it back into `answer`.

虽然`later()`的整个内容将被当做一个事件轮询队列的实体，但当考虑到将要执行这段代码的线程时，实际上也许会有许多不同的底层操作。比如，`answer = answer * 2`首先需要读取当前`answer`的值，再把`2`放在某个地方，然后进行乘法计算，最后把结果存回到`answer`。

In a single-threaded environment, it really doesn't matter that the items in the thread queue are low-level operations, because nothing can interrupt the thread. But if you have a parallel system, where two different threads are operating in the same program, you could very likely have unpredictable behavior.

在一个单线程环境中，线程队列中的内容都是底层操作真的无关紧要，因为没有什么可以打断线程。但如果你有一个并行系统，在同一个程序中有两个不同的线程，你很可能会得到无法预测的行为：

Consider:

考虑这段代码：

```js
var a = 20;

function foo() {
	a = a + 1;
}

function bar() {
	a = a * 2;
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

In JavaScript's single-threaded behavior, if `foo()` runs before `bar()`, the result is that `a` has `42`, but if `bar()` runs before `foo()` the result in `a` will be `41`.

在JavaScript的单线程行为下，如果`foo()`在`bar()`之前执行，结果`a`是`42`，但如果`bar()`在`foo()`之前执行，结果`a`将是`41`。

If JS events sharing the same data executed in parallel, though, the problems would be much more subtle. Consider these two lists of pseudocode tasks as the threads that could respectively run the code in `foo()` and `bar()`, and consider what happens if they are running at exactly the same time:

如果JS事件共享相同的数据并列执行，问题将会变得微妙得多。考虑这两个假想代码列表，它们分别描述了运行`foo()`和`bar()`中代码的线程将要执行的任务，并考虑如果它们在完全相同的时刻运行会发生什么：

Thread 1 (`X` and `Y` are temporary memory locations):
线程1（`X`和`Y`是临时的内存位置）：
```
foo():
  a. load value of `a` in `X`
	a. 将`a`的值读取到`X`
  b. store `1` in `Y`
	b. 将`1`存入`Y`
  c. add `X` and `Y`, store result in `X`
	c. 把`X`和`Y`相加，将结果存入`X`
  d. store value of `X` in `a`
  d. 将`X`的值存入`a`
```

Thread 2 (`X` and `Y` are temporary memory locations):
线程2（`X`和`Y`是临时的内存位置）：
```
bar():
  a. load value of `a` in `X`
  a. 将`a`的值读取到`X`
  b. store `2` in `Y`
	b. 将`2`存入`Y`
  c. multiply `X` and `Y`, store result in `X`
	c. 把`X`和`Y`相乘，将结果存入`X`
  d. store value of `X` in `a`
	d. 将`X`的值存入`a`
```

Now, let's say that the two threads are running truly in parallel. You can probably spot the problem, right? They use shared memory locations `X` and `Y` for their temporary steps.

现在，让我们假定这两个线程在并行执行。你可能发现了问题，对吧？它们在临时的步骤中使用共享的内存位置`X`和`Y`。

What's the end result in `a` if the steps happen like this?

如果步骤像这样发生，`a`的最终结果什么？

```
1a  (load value of `a` in `X`   ==> `20`)
2a  (load value of `a` in `X`   ==> `20`)
1b  (store `1` in `Y`   ==> `1`)
2b  (store `2` in `Y`   ==> `2`)
1c  (add `X` and `Y`, store result in `X`   ==> `22`)
1d  (store value of `X` in `a`   ==> `22`)
2c  (multiply `X` and `Y`, store result in `X`   ==> `44`)
2d  (store value of `X` in `a`   ==> `44`)
```

The result in `a` will be `44`. But what about this ordering?

`a`中的结果将是`44`。那么这种顺序呢？

```
1a  (load value of `a` in `X`   ==> `20`)
2a  (load value of `a` in `X`   ==> `20`)
2b  (store `2` in `Y`   ==> `2`)
1b  (store `1` in `Y`   ==> `1`)
2c  (multiply `X` and `Y`, store result in `X`   ==> `20`)
1c  (add `X` and `Y`, store result in `X`   ==> `21`)
1d  (store value of `X` in `a`   ==> `21`)
2d  (store value of `X` in `a`   ==> `21`)
```

The result in `a` will be `21`.

`a`中的结果将是`21`。

So, threaded programming is very tricky, because if you don't take special steps to prevent this kind of interruption/interleaving from happening, you can get very surprising, nondeterministic behavior that frequently leads to headaches.

所以，关于线程的编程十分刁钻，因为如果你不采取特殊的步骤来防止这样的干扰/穿插，你会得到令人非常诧异的，不确定的行为。这通常让人头疼。

JavaScript never shares data across threads, which means *that* level of nondeterminism isn't a concern. But that doesn't mean JS is always deterministic. Remember earlier, where the relative ordering of `foo()` and `bar()` produces two different results (`41` or `42`)?

JavaScript从不跨线程共享数据，这意味着不必关心这一层的不确定性。但这并不意味着JS总是确定性的。记得前面`foo()`和`bar()`的相对顺序产生两个不同的结果吗（`41`或`42`）？

**Note:** It may not be obvious yet, but not all nondeterminism is bad. Sometimes it's irrelevant, and sometimes it's intentional. We'll see more examples of that throughout this and the next few chapters.

**注意：** 可能还不明显，但不是所有的不确定性都是坏的。有时候他无关紧要，有时候它是故意的。我们会在本章和后续几章中看到更多的例子。

### Run-to-Completion

Because of JavaScript's single-threading, the code inside of `foo()` (and `bar()`) is atomic, which means that once `foo()` starts running, the entirety of its code will finish before any of the code in `bar()` can run, or vice versa. This is called "run-to-completion" behavior.

因为JavaScript是单线程的，`foo()`（和`bar()`）中的代码是原子性的，这意味着一旦`foo()`开始运行，它的全部代码都会在`bar()`中的任何代码可以运行之前执行完成，反之亦然。这称为“运行至完成”行为。

In fact, the run-to-completion semantics are more obvious when `foo()` and `bar()` have more code in them, such as:

事实上，运行至完成的语义会在`foo()`与`bar()`中有更多的代码时更明显，比如：

```js
var a = 1;
var b = 2;

function foo() {
	a++;
	b = b * a;
	a = b + 3;
}

function bar() {
	b--;
	a = 8 + b;
	b = a * 2;
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

Because `foo()` can't be interrupted by `bar()`, and `bar()` can't be interrupted by `foo()`, this program only has two possible outcomes depending on which starts running first -- if threading were present, and the individual statements in `foo()` and `bar()` could be interleaved, the number of possible outcomes would be greatly increased!

因为`foo()`不能被`bar()`打断，而且`bar()`不能被`foo()`打断，所以这个程序根据哪一个先执行只有两种可能的输出——如果线程存在，`foo()`和`bar()`中的每一个语句都可能被穿插，可能的输出的数量将会极大地增长。

Chunk 1 is synchronous (happens *now*), but chunks 2 and 3 are asynchronous (happen *later*), which means their execution will be separated by a gap of time.

代码块儿1是同步的（*现在* 发生），但代码块儿2和3是异步的（*稍后* 发生），这意味着它们的执行将会被时间的间隙分开。

代码块儿1:
```js
var a = 1;
var b = 2;
```

代码块儿2 (`foo()`):
```js
a++;
b = b * a;
a = b + 3;
```

代码块儿3 (`bar()`):
```js
b--;
a = 8 + b;
b = a * 2;
```

Chunks 2 and 3 may happen in either-first order, so there are two possible outcomes for this program, as illustrated here:

代码块儿2和3哪一个都有可能先执行，所以这个程序有两个可能的输出，正如这里展示的：

输出1:
```js
var a = 1;
var b = 2;

// foo()
a++;
b = b * a;
a = b + 3;

// bar()
b--;
a = 8 + b;
b = a * 2;

a; // 11
b; // 22
```

输出2:
```js
var a = 1;
var b = 2;

// bar()
b--;
a = 8 + b;
b = a * 2;

// foo()
a++;
b = b * a;
a = b + 3;

a; // 183
b; // 180
```

Two outcomes from the same code means we still have nondeterminism! But it's at the function (event) ordering level, rather than at the statement ordering level (or, in fact, the expression operation ordering level) as it is with threads. In other words, it's *more deterministic* than threads would have been.

同一段代码有两种输出仍然意味着不确定性！但是这是在函数（事件）顺序的水平上，而不是在使用线程时语句顺序的水平上（或者说，实际上是表达式操作的顺序上）。换句话说，他比线程更具有 *确定性*。

As applied to JavaScript's behavior, this function-ordering nondeterminism is the common term "race condition," as `foo()` and `bar()` are racing against each other to see which runs first. Specifically, it's a "race condition" because you cannot predict reliably how `a` and `b` will turn out.

当套用到JavaScript行为时，这种函数顺序的不确定性通常称为“条件竞合”，因为`foo()`和`bar()`在互相竞争看谁会先运行。特别地，它是一个“条件竞合”因为你不能可靠地预测`a`与`b`将如何产生。

**Note:** If there was a function in JS that somehow did not have run-to-completion behavior, we could have many more possible outcomes, right? It turns out ES6 introduces just such a thing (see Chapter 4 "Generators"), but don't worry right now, we'll come back to that!

**注意：** 如果在JS中不知怎的有一个函数没有运行至完成的行为，我们会有更多可能的结果，对吧？ES6中引入一个这样的东西（见第四章“生成器”），但现在不要担心，我们会回头讨论它。

## Concurrency

Let's imagine a site that displays a list of status updates (like a social network news feed) that progressively loads as the user scrolls down the list. To make such a feature work correctly, (at least) two separate "processes" will need to be executing *simultaneously* (i.e., during the same window of time, but not necessarily at the same instant).

让我们想象一个网站，它显示一个随着用户向下滚动而逐步加载的状态更新列表（就像社交网络的新消息）。这（至少）需要两个分离的“进程” *同时* 执行（在同一个窗口中，但没必要是同一个时间点）。

**Note:** We're using "process" in quotes here because they aren't true operating system–level processes in the computer science sense. They're virtual processes, or tasks, that represent a logically connected, sequential series of operations. We'll simply prefer "process" over "task" because terminology-wise, it will match the definitions of the concepts we're exploring.

**注意：** 我们在这里使用带引号的“进程”，因为它们不是计算机科学中的真正的操作系统级别的进程。它们是虚拟进程，或者说任务，表示一组逻辑上关联，串行顺序的操作。我们将简单地使用“进程”而非“任务”，因为在术语层面它与我们讨论的概念的定义相匹配。

The first "process" will respond to `onscroll` events (making Ajax requests for new content) as they fire when the user has scrolled the page further down. The second "process" will receive Ajax responses back (to render content onto the page).

第一个“进程”将响应当用户向下滚动页面时触发的`onscroll`事件（发起取得新内容的Ajax请求）。第二个“进程”将接收返回的Ajax应答（将内容绘制在页面上）。

Obviously, if a user scrolls fast enough, you may see two or more `onscroll` events fired during the time it takes to get the first response back and process, and thus you're going to have `onscroll` events and Ajax response events firing rapidly, interleaved with each other.

显然，如果用户向下滚动的足够快，你也许会看到在第一个应答返回并处理期间，有两个或更多的`onscroll`事件被触发，因此你将使`onscroll`事件和Ajax应答事件迅速触发，互相穿插在一起。

Concurrency is when two or more "processes" are executing simultaneously over the same period, regardless of whether their individual constituent operations happen *in parallel* (at the same instant on separate processors or cores) or not. You can think of concurrency then as "process"-level (or task-level) parallelism, as opposed to operation-level parallelism (separate-processor threads).

并发是当两个或多个“进程”在同一时间段内同时执行，无论构成它们的各个操作是否 *并行地*（在同一时刻不同的处理器或内核）发生。你可以认为并发

**Note:** Concurrency also introduces an optional notion of these "processes" interacting with each other. We'll come back to that later.

For a given window of time (a few seconds worth of a user scrolling), let's visualize each independent "process" as a series of events/operations:

"Process" 1 (`onscroll` events):
```
onscroll, request 1
onscroll, request 2
onscroll, request 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
onscroll, request 7
```

"Process" 2 (Ajax response events):
```
response 1
response 2
response 3
response 4
response 5
response 6
response 7
```

It's quite possible that an `onscroll` event and an Ajax response event could be ready to be processed at exactly the same *moment*. For example let's visualize these events in a timeline:

```
onscroll, request 1
onscroll, request 2          response 1
onscroll, request 3          response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6          response 4
onscroll, request 7
response 6
response 5
response 7
```

But, going back to our notion of the event loop from earlier in the chapter, JS is only going to be able to handle one event at a time, so either `onscroll, request 2` is going to happen first or `response 1` is going to happen first, but they cannot happen at literally the same moment. Just like kids at a school cafeteria, no matter what crowd they form outside the doors, they'll have to merge into a single line to get their lunch!

Let's visualize the interleaving of all these events onto the event loop queue.

Event Loop Queue:
```
onscroll, request 1   <--- Process 1 starts
onscroll, request 2
response 1            <--- Process 2 starts
onscroll, request 3
response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
response 4
onscroll, request 7   <--- Process 1 finishes
response 6
response 5
response 7            <--- Process 2 finishes
```

"Process 1" and "Process 2" run concurrently (task-level parallel), but their individual events run sequentially on the event loop queue.

By the way, notice how `response 6` and `response 5` came back out of expected order?

The single-threaded event loop is one expression of concurrency (there are certainly others, which we'll come back to later).

### Noninteracting

As two or more "processes" are interleaving their steps/events concurrently within the same program, they don't necessarily need to interact with each other if the tasks are unrelated. **If they don't interact, nondeterminism is perfectly acceptable.**

For example:

```js
var res = {};

function foo(results) {
	res.foo = results;
}

function bar(results) {
	res.bar = results;
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

`foo()` and `bar()` are two concurrent "processes," and it's nondeterminate which order they will be fired in. But we've constructed the program so it doesn't matter what order they fire in, because they act independently and as such don't need to interact.

This is not a "race condition" bug, as the code will always work correctly, regardless of the ordering.

### Interaction

More commonly, concurrent "processes" will by necessity interact, indirectly through scope and/or the DOM. When such interaction will occur, you need to coordinate these interactions to prevent "race conditions," as described earlier.

Here's a simple example of two concurrent "processes" that interact because of implied ordering, which is only *sometimes broken*:

```js
var res = [];

function response(data) {
	res.push( data );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

The concurrent "processes" are the two `response()` calls that will be made to handle the Ajax responses. They can happen in either-first order.

Let's assume the expected behavior is that `res[0]` has the results of the `"http://some.url.1"` call, and `res[1]` has the results of the `"http://some.url.2"` call. Sometimes that will be the case, but sometimes they'll be flipped, depending on which call finishes first. There's a pretty good likelihood that this nondeterminism is a "race condition" bug.

**Note:** Be extremely wary of assumptions you might tend to make in these situations. For example, it's not uncommon for a developer to observe that `"http://some.url.2"` is "always" much slower to respond than `"http://some.url.1"`, perhaps by virtue of what tasks they're doing (e.g., one performing a database task and the other just fetching a static file), so the observed ordering seems to always be as expected. Even if both requests go to the same server, and *it* intentionally responds in a certain order, there's no *real* guarantee of what order the responses will arrive back in the browser.

So, to address such a race condition, you can coordinate ordering interaction:

```js
var res = [];

function response(data) {
	if (data.url == "http://some.url.1") {
		res[0] = data;
	}
	else if (data.url == "http://some.url.2") {
		res[1] = data;
	}
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

Regardless of which Ajax response comes back first, we inspect the `data.url` (assuming one is returned from the server, of course!) to figure out which position the response data should occupy in the `res` array. `res[0]` will always hold the `"http://some.url.1"` results and `res[1]` will always hold the `"http://some.url.2"` results. Through simple coordination, we eliminated the "race condition" nondeterminism.

The same reasoning from this scenario would apply if multiple concurrent function calls were interacting with each other through the shared DOM, like one updating the contents of a `<div>` and the other updating the style or attributes of the `<div>` (e.g., to make the DOM element visible once it has content). You probably wouldn't want to show the DOM element before it had content, so the coordination must ensure proper ordering interaction.

Some concurrency scenarios are *always broken* (not just *sometimes*) without coordinated interaction. Consider:

```js
var a, b;

function foo(x) {
	a = x * 2;
	baz();
}

function bar(y) {
	b = y * 2;
	baz();
}

function baz() {
	console.log(a + b);
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

In this example, whether `foo()` or `bar()` fires first, it will always cause `baz()` to run too early (either `a` or `b` will still be `undefined`), but the second invocation of `baz()` will work, as both `a` and `b` will be available.

There are different ways to address such a condition. Here's one simple way:

```js
var a, b;

function foo(x) {
	a = x * 2;
	if (a && b) {
		baz();
	}
}

function bar(y) {
	b = y * 2;
	if (a && b) {
		baz();
	}
}

function baz() {
	console.log( a + b );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

The `if (a && b)` conditional around the `baz()` call is traditionally called a "gate," because we're not sure what order `a` and `b` will arrive, but we wait for both of them to get there before we proceed to open the gate (call `baz()`).

Another concurrency interaction condition you may run into is sometimes called a "race," but more correctly called a "latch." It's characterized by "only the first one wins" behavior. Here, nondeterminism is acceptable, in that you are explicitly saying it's OK for the "race" to the finish line to have only one winner.

Consider this broken code:

```js
var a;

function foo(x) {
	a = x * 2;
	baz();
}

function bar(x) {
	a = x / 2;
	baz();
}

function baz() {
	console.log( a );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

Whichever one (`foo()` or `bar()`) fires last will not only overwrite the assigned `a` value from the other, but it will also duplicate the call to `baz()` (likely undesired).

So, we can coordinate the interaction with a simple latch, to let only the first one through:

```js
var a;

function foo(x) {
	if (a == undefined) {
		a = x * 2;
		baz();
	}
}

function bar(x) {
	if (a == undefined) {
		a = x / 2;
		baz();
	}
}

function baz() {
	console.log( a );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

The `if (a == undefined)` conditional allows only the first of `foo()` or `bar()` through, and the second (and indeed any subsequent) calls would just be ignored. There's just no virtue in coming in second place!

**Note:** In all these scenarios, we've been using global variables for simplistic illustration purposes, but there's nothing about our reasoning here that requires it. As long as the functions in question can access the variables (via scope), they'll work as intended. Relying on lexically scoped variables (see the *Scope & Closures* title of this book series), and in fact global variables as in these examples, is one obvious downside to these forms of concurrency coordination. As we go through the next few chapters, we'll see other ways of coordination that are much cleaner in that respect.

### Cooperation

Another expression of concurrency coordination is called "cooperative concurrency." Here, the focus isn't so much on interacting via value sharing in scopes (though that's obviously still allowed!). The goal is to take a long-running "process" and break it up into steps or batches so that other concurrent "processes" have a chance to interleave their operations into the event loop queue.

For example, consider an Ajax response handler that needs to run through a long list of results to transform the values. We'll use `Array#map(..)` to keep the code shorter:

```js
var res = [];

// `response(..)` receives array of results from the Ajax call
function response(data) {
	// add onto existing `res` array
	res = res.concat(
		// make a new transformed array with all `data` values doubled
		data.map( function(val){
			return val * 2;
		} )
	);
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

If `"http://some.url.1"` gets its results back first, the entire list will be mapped into `res` all at once. If it's a few thousand or less records, this is not generally a big deal. But if it's say 10 million records, that can take a while to run (several seconds on a powerful laptop, much longer on a mobile device, etc.).

While such a "process" is running, nothing else in the page can happen, including no other `response(..)` calls, no UI updates, not even user events like scrolling, typing, button clicking, and the like. That's pretty painful.

So, to make a more cooperatively concurrent system, one that's friendlier and doesn't hog the event loop queue, you can process these results in asynchronous batches, after each one "yielding" back to the event loop to let other waiting events happen.

Here's a very simple approach:

```js
var res = [];

// `response(..)` receives array of results from the Ajax call
function response(data) {
	// let's just do 1000 at a time
	var chunk = data.splice( 0, 1000 );

	// add onto existing `res` array
	res = res.concat(
		// make a new transformed array with all `chunk` values doubled
		chunk.map( function(val){
			return val * 2;
		} )
	);

	// anything left to process?
	if (data.length > 0) {
		// async schedule next batch
		setTimeout( function(){
			response( data );
		}, 0 );
	}
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

We process the data set in maximum-sized chunks of 1,000 items. By doing so, we ensure a short-running "process," even if that means many more subsequent "processes," as the interleaving onto the event loop queue will give us a much more responsive (performant) site/app.

Of course, we're not interaction-coordinating the ordering of any of these "processes," so the order of results in `res` won't be predictable. If ordering was required, you'd need to use interaction techniques like those we discussed earlier, or ones we will cover in later chapters of this book.

We use the `setTimeout(..0)` (hack) for async scheduling, which basically just means "stick this function at the end of the current event loop queue."

**Note:** `setTimeout(..0)` is not technically inserting an item directly onto the event loop queue. The timer will insert the event at its next opportunity. For example, two subsequent `setTimeout(..0)` calls would not be strictly guaranteed to be processed in call order, so it *is* possible to see various conditions like timer drift where the ordering of such events isn't predictable. In Node.js, a similar approach is `process.nextTick(..)`. Despite how convenient (and usually more performant) it would be, there's not a single direct way (at least yet) across all environments to ensure async event ordering. We cover this topic in more detail in the next section.

## Jobs

As of ES6, there's a new concept layered on top of the event loop queue, called the "Job queue." The most likely exposure you'll have to it is with the asynchronous behavior of Promises (see Chapter 3).

Unfortunately, at the moment it's a mechanism without an exposed API, and thus demonstrating it is a bit more convoluted. So we're going to have to just describe it conceptually, such that when we discuss async behavior with Promises in Chapter 3, you'll understand how those actions are being scheduled and processed.

So, the best way to think about this that I've found is that the "Job queue" is a queue hanging off the end of every tick in the event loop queue. Certain async-implied actions that may occur during a tick of the event loop will not cause a whole new event to be added to the event loop queue, but will instead add an item (aka Job) to the end of the current tick's Job queue.

It's kinda like saying, "oh, here's this other thing I need to do *later*, but make sure it happens right away before anything else can happen."

Or, to use a metaphor: the event loop queue is like an amusement park ride, where once you finish the ride, you have to go to the back of the line to ride again. But the Job queue is like finishing the ride, but then cutting in line and getting right back on.

A Job can also cause more Jobs to be added to the end of the same queue. So, it's theoretically possible that a Job "loop" (a Job that keeps adding another Job, etc.) could spin indefinitely, thus starving the program of the ability to move on to the next event loop tick. This would conceptually be almost the same as just expressing a long-running or infinite loop (like `while (true) ..`) in your code.

Jobs are kind of like the spirit of the `setTimeout(..0)` hack, but implemented in such a way as to have a much more well-defined and guaranteed ordering: **later, but as soon as possible**.

Let's imagine an API for scheduling Jobs (directly, without hacks), and call it `schedule(..)`. Consider:

```js
console.log( "A" );

setTimeout( function(){
	console.log( "B" );
}, 0 );

// theoretical "Job API"
schedule( function(){
	console.log( "C" );

	schedule( function(){
		console.log( "D" );
	} );
} );
```

You might expect this to print out `A B C D`, but instead it would print out `A C D B`, because the Jobs happen at the end of the current event loop tick, and the timer fires to schedule for the *next* event loop tick (if available!).

In Chapter 3, we'll see that the asynchronous behavior of Promises is based on Jobs, so it's important to keep clear how that relates to event loop behavior.

## Statement Ordering

The order in which we express statements in our code is not necessarily the same order as the JS engine will execute them. That may seem like quite a strange assertion to make, so we'll just briefly explore it.

But before we do, we should be crystal clear on something: the rules/grammar of the language (see the *Types & Grammar* title of this book series) dictate a very predictable and reliable behavior for statement ordering from the program point of view. So what we're about to discuss are **not things you should ever be able to observe** in your JS program.

**Warning:** If you are ever able to *observe* compiler statement reordering like we're about to illustrate, that'd be a clear violation of the specification, and it would unquestionably be due to a bug in the JS engine in question -- one which should promptly be reported and fixed! But it's vastly more common that you *suspect* something crazy is happening in the JS engine, when in fact it's just a bug (probably a "race condition"!) in your own code -- so look there first, and again and again. The JS debugger, using breakpoints and stepping through code line by line, will be your most powerful tool for sniffing out such bugs in *your code*.

Consider:

```js
var a, b;

a = 10;
b = 30;

a = a + 1;
b = b + 1;

console.log( a + b ); // 42
```

This code has no expressed asynchrony to it (other than the rare `console` async I/O discussed earlier!), so the most likely assumption is that it would process line by line in top-down fashion.

But it's *possible* that the JS engine, after compiling this code (yes, JS is compiled -- see the *Scope & Closures* title of this book series!) might find opportunities to run your code faster by rearranging (safely) the order of these statements. Essentially, as long as you can't observe the reordering, anything's fair game.

For example, the engine might find it's faster to actually execute the code like this:

```js
var a, b;

a = 10;
a++;

b = 30;
b++;

console.log( a + b ); // 42
```

Or this:

```js
var a, b;

a = 11;
b = 31;

console.log( a + b ); // 42
```

Or even:

```js
// because `a` and `b` aren't used anymore, we can
// inline and don't even need them!
console.log( 42 ); // 42
```

In all these cases, the JS engine is performing safe optimizations during its compilation, as the end *observable* result will be the same.

But here's a scenario where these specific optimizations would be unsafe and thus couldn't be allowed (of course, not to say that it's not optimized at all):

```js
var a, b;

a = 10;
b = 30;

// we need `a` and `b` in their preincremented state!
console.log( a * b ); // 300

a = a + 1;
b = b + 1;

console.log( a + b ); // 42
```

Other examples where the compiler reordering could create observable side effects (and thus must be disallowed) would include things like any function call with side effects (even and especially getter functions), or ES6 Proxy objects (see the *ES6 & Beyond* title of this book series).

Consider:

```js
function foo() {
	console.log( b );
	return 1;
}

var a, b, c;

// ES5.1 getter literal syntax
c = {
	get bar() {
		console.log( a );
		return 1;
	}
};

a = 10;
b = 30;

a += foo();				// 30
b += c.bar;				// 11

console.log( a + b );	// 42
```

If it weren't for the `console.log(..)` statements in this snippet (just used as a convenient form of observable side effect for the illustration), the JS engine would likely have been free, if it wanted to (who knows if it would!?), to reorder the code to:

```js
// ...

a = 10 + foo();
b = 30 + c.bar;

// ...
```

While JS semantics thankfully protect us from the *observable* nightmares that compiler statement reordering would seem to be in danger of, it's still important to understand just how tenuous a link there is between the way source code is authored (in top-down fashion) and the way it runs after compilation.

Compiler statement reordering is almost a micro-metaphor for concurrency and interaction. As a general concept, such awareness can help you understand async JS code flow issues better.

## Review

A JavaScript program is (practically) always broken up into two or more chunks, where the first chunk runs *now* and the next chunk runs *later*, in response to an event. Even though the program is executed chunk-by-chunk, all of them share the same access to the program scope and state, so each modification to state is made on top of the previous state.

Whenever there are events to run, the *event loop* runs until the queue is empty. Each iteration of the event loop is a "tick." User interaction, IO, and timers enqueue events on the event queue.

At any given moment, only one event can be processed from the queue at a time. While an event is executing, it can directly or indirectly cause one or more subsequent events.

Concurrency is when two or more chains of events interleave over time, such that from a high-level perspective, they appear to be running *simultaneously* (even though at any given moment only one event is being processed).

It's often necessary to do some form of interaction coordination between these concurrent "processes" (as distinct from operating system processes), for instance to ensure ordering or to prevent "race conditions." These "processes" can also *cooperate* by breaking themselves into smaller chunks and to allow other "process" interleaving.
