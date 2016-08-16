# You Don't Know JS: Up & Going
# Chapter 3: Into YDKJS

这个系列丛书到底是为了什么？简单地说，它的目的是认真地学习 *JavaScript的所有部分*，不仅是这门语言的某些人称之为“好的部分”的子集，也不仅是让你在工作中搞定任务所需的最小部分的知识。

其他语言中的认真的开发者总是希望努力学习他们主要使用的语言的大部分或全部，但是JS开发者由于通常不太学习这门语言而在人群中显得很扎眼。这不是一件好事，而且我们也不应当继续将之视为常态。

*你不懂JS*（*YDKJS*）系列的立场是与学习JS的通常方式形成鲜明的对比，而且与你将会读到的其他JS书籍不同。它挑战你超越自己的舒适区，对每一个你遇到的行为问一个更深入的“为什么”。你准备好接受挑战了吗？

我将用这最后一章的篇幅来简要地总结一下这个系列其他书目的内容，和如何在 *YDKJS* 的基础上最有效地建立学习JS的基础。

## Scope & Closures

也许你需要快速接受的基础之一，就是在JavaScript中变量的作用域是如何工作的。关于作用域仅有传闻中的模糊 *观念* 是不够的。

*作用域与闭包* 从揭穿常见的误解开始：JS是“解释型语言”因此是不被编译的。不对。

JS引擎在你的代码执行的前一刻（有时是在执行期间！）编译它。所以我们首先深入了解编译器处理我们代码的方式，以此来理解它如何找到并处理变量和函数的声明。沿着这条道路，我们将见到JS变量作用域管理的特有隐喻，“提升”。

这种对“词法作用域”的极其重要的理解，是我们在这本书最后一章探索闭包的基石。闭包也许是JS所有的概念中最重要的一个，但如果你没有首先牢牢把握住作用域的工作方式，那么闭包将很可能依然不在你的掌握之中。

闭包的一个重要应用是模块模式，正如我们在本书第二章中简要介绍过的那样。模块模式也许是JavaScript的所有代码组织模式中最流行的一种；深刻理解它应当是你的首要任务之一。

## this & Object Prototypes

也许关于JavaScript的最广泛和持久的谬误之一是认为`this`关键字指代它所出现的函数。可怕的错误。

`this`关键字是根据函数如何被执行而动态绑定的，而事实上有四种简单的规则可以用来理解和完全决定`this`绑定。

和`this`密切相关的是对象原型属性，它是一种属性的查询链，与查询词法作用域变量的方式相似。但是原型中包含的是另一个关于JS的巨大谬误：模拟（山寨）类和继承（所谓的“原型继承”）的想法。

不幸的是，渴望将类和继承的设计模式思想带入JavaScript只是你能做的最差劲儿的事情，因为虽然语法可能欺骗你，是你认为有类这样的东西存在，但实际上原型机制在行为上是根本相反的。

目前的问题是，是忽略这种错位并假装你实现的是“继承”更好，还是学习并接纳对象原型系统实际的工作方式更恰当。后者更恰当地被称为“行为委托”。

这不光是语法上的偏好问题。委托是一种完全不同的，更强大的设计模式，其中的原因之一就是它取代了使用类和继承进行设计的需要。但是对于以谈论JavaScript的一生为主题的几乎所有的其他博客，书籍，和论坛来说，这些断言绝对是打脸的。

我对委托和继承做出的宣言不是源于对语言和其语法的厌恶，而是来自于渴望看到这门语言的真实力量被正确地利用，渴望看到无尽的困惑与沮丧被一扫而光。

但是我举出的关于原型和委托的例子可要比我在这里乱说的东西复杂得多。如果你准备好重新思考你认为你所了解的关于JavaScript“类”和“继承”的一切，我给你一个机会来“服用红色的药丸”，并且看一看本系列的 *this与对象原型* 的第四到六章。

## Types & Grammar

这个系列的第三本书主要集中于解决另一个极具争议的话题：类型强制转换。也许没有什么话题能比你谈论隐含的强制转换造成的困惑更能使JS开发者感到沮丧了。

到目前为止，惯例的智慧说隐含强制转换是这门语言的“坏的部分”，并且应当不计一切避免它。事实上，有些人已经到了将它称为语言设计的“缺陷”的地步了。确实这么一些工具，它们的全部工作就是扫描你的代码，并在你进行任何强制转换，甚至是做有些像强制转换的事情时报警。

但是强制转换真的如此令人困惑，如此的坏，如此的不可信，以至于只要你使用它，你的代码从一开始就灭亡了吗？

I say no. After having built up an understanding of how types and values really work in Chapters 1-3, Chapter 4 takes on this debate and fully explains how coercion works, in all its nooks and crevices. We see just what parts of coercion really are surprising and what parts actually make complete sense if given the time to learn.

我说不。在第一到三章中建立了对类型和值真正的工作方式的理解后，第四章参与了这个辩论，并从强制转换的角落和缝隙全面地讲解它的工作方式。我们将看到强制转换的哪一部分真的令人惊讶，而且如果花时间去学习，哪一部分实际上完全是合理的。

But I'm not merely suggesting that coercion is sensible and learnable, I'm asserting that coercion is an incredibly useful and totally underestimated tool that *you should be using in your code.* I'm saying that coercion, when used properly, not only works, but makes your code better. All the naysayers and doubters will surely scoff at such a position, but I believe it's one of the main keys to upping your JS game.

但我不仅仅要说强制转换是合理的和可以学习的，我断言强制转换是一种 *你应当在代码中使用的* 极其有用而且完全被低估的工具。我要说在合理使用的情况下，强制转换不仅好用，而且会使你的代码更好。所有唱反调的和怀疑的人当然会嘲笑这样的立场，但我相信它是让你玩儿好JS游戏的主要按键之一。

Do you want to just keep following what the crowd says, or are you willing to set all the assumptions aside and look at coercion with a fresh perspective? The *Types & Grammar* title of this series will coerce your thinking.

你是想继续人云亦云，还是想将所有的臆测放在一边，用一个全新的视角观察强制转换？这个系列的 *类型与文法* 将会强制转换你的想法。

## Async & Performance

The first three titles of this series focus on the core mechanics of the language, but the fourth title branches out slightly to cover patterns on top of the language mechanics for managing asynchronous programming. Asynchrony is not only critical to the performance of our applications, it's increasingly becoming *the* critical factor in writability and maintainability.

这个系列的前三本书聚焦于这门语言的核心技术，但是第四本书稍稍开出一个分支来探讨在这门语言技术之上的管理异步编程的模式。异步不仅对于性能和我们的应用程序很关键，而且它日渐成为可写性和可维护性的关键因素。

The book starts first by clearing up a lot of terminology and concept confusion around things like "async," "parallel," and "concurrent," and explains in depth how such things do and do not apply to JS.

这本书从搞清楚许多令人困惑的术语和概念开始，比如“异步”，“并行”和“并发”。而且深入讲解了这些东西如何适用和不适用于JS。

Then we move into examining callbacks as the primary method of enabling asynchrony. But it's here that we quickly see that the callback alone is hopelessly insufficient for the modern demands of asynchronous programming. We identify two major deficiencies of callbacks-only coding: *Inversion of Control* (IoC) trust loss and lack of linear reason-ability.

然后我们继续检视作为开启异步的主要方法：回调。但我们很快就会看到，对于现代异步编程的需求来说，单靠回调自身是远远不够的。我们将找出仅使用回调编码的两种主要的不足之处：*控制反转*（IoC）信任丢失和缺乏线性的可推理性。

To address these two major deficiencies, ES6 introduces two new mechanisms (and indeed, patterns): promises and generators.

为了解决这两种主要的不足，ES6引入了两种新的机制（实际上也是模式）：promise 和 generator。

Promises are a time-independent wrapper around a "future value," which lets you reason about and compose them regardless of if the value is ready or not yet. Moreover, they effectively solve the IoC trust issues by routing callbacks through a trustable and composable promise mechanism.

Prmise是一个“未来值”的一种与时间无关的包装，它让你推理并组合这些未来值而不必关心它们是否已经准备好。另外，它们通过将回调沿着一个可信赖和可组装的promise机制传递，有效地解决了IoC信任问题。

Generators introduce a new mode of execution for JS functions, whereby the generator can be paused at `yield` points and be resumed asynchronously later. The pause-and-resume capability enables synchronous, sequential looking code in the generator to be processed asynchronously behind the scenes. By doing so, we address the non-linear, non-local-jump confusions of callbacks and thereby make our asynchronous code sync-looking so as to be more reason-able.

Generator给JS函数引入了一种新的执行模式，generator可以在`yield`点被暂停而稍后异步地被继续。这种“暂停-继续”的能力使看起来同步，顺序执行的代码称为可能。

But it's the combination of promises and generators that "yields" our most effective asynchronous coding pattern to date in JavaScript. In fact, much of the future sophistication of asynchrony coming in ES7 and later will certainly be built on this foundation. To be serious about programming effectively in an async world, you're going to need to get really comfortable with combining promises and generators.

If promises and generators are about expressing patterns that let our programs run more concurrently and thus get more processing accomplished in a shorter period, JS has many other facets of performance optimization worth exploring.

Chapter 5 delves into topics like program parallelism with Web Workers and data parallelism with SIMD, as well as low-level optimization techniques like ASM.js. Chapter 6 takes a look at performance optimization from the perspective of proper benchmarking techniques, including what kinds of performance to worry about and what to ignore.

Writing JavaScript effectively means writing code that can break the constraint barriers of being run dynamically in a wide range of browsers and other environments. It requires a lot of intricate and detailed planning and effort on our parts to take a program from "it works" to "it works well."

The *Async & Performance* title is designed to give you all the tools and skills you need to write reasonable and performant JavaScript code.

## ES6 & Beyond

No matter how much you feel you've mastered JavaScript to this point, the truth is that JavaScript is never going to stop evolving, and moreover, the rate of evolution is increasing rapidly. This fact is almost a metaphor for the spirit of this series, to embrace that we'll never fully *know* every part of JS, because as soon as you master it all, there's going to be new stuff coming down the line that you'll need to learn.

This title is dedicated to both the short- and mid-term visions of where the language is headed, not just the *known* stuff like ES6 but the *likely* stuff beyond.

While all the titles of this series embrace the state of JavaScript at the time of this writing, which is mid-way through ES6 adoption, the primary focus in the series has been more on ES5. Now, we want to turn our attention to ES6, ES7, and ...

Since ES6 is nearly complete at the time of this writing, *ES6 & Beyond* starts by dividing up the concrete stuff from the ES6 landscape into several key categories, including new syntax, new data structures (collections), and new processing capabilities and APIs. We cover each of these new ES6 features, in varying levels of detail, including reviewing details that are touched on in other books of this series.

Some exciting ES6 things to look forward to reading about: destructuring, default parameter values, symbols, concise methods, computed properties, arrow functions, block scoping, promises, generators, iterators, modules, proxies, weakmaps, and much, much more! Phew, ES6 packs quite a punch!

The first part of the book is a roadmap for all the stuff you need to learn to get ready for the new and improved JavaScript you'll be writing and exploring over the next couple of years.

The latter part of the book turns attention to briefly glance at things that we can likely expect to see in the near future of JavaScript. The most important realization here is that post-ES6, JS is likely going to evolve feature by feature rather than version by version, which means we can expect to see these near-future things coming much sooner than you might imagine.

The future for JavaScript is bright. Isn't it time we start learning it!?

## Review

The *YDKJS* series is dedicated to the proposition that all JS developers can and should learn all of the parts of this great language. No person's opinion, no framework's assumptions, and no project's deadline should be the excuse for why you never learn and deeply understand JavaScript.

We take each important area of focus in the language and dedicate a short but very dense book to fully explore all the parts of it that you perhaps thought you knew but probably didn't fully.

"You Don't Know JS" isn't a criticism or an insult. It's a realization that all of us, myself included, must come to terms with. Learning JavaScript isn't an end goal but a process. We don't know JavaScript, yet. But we will!
