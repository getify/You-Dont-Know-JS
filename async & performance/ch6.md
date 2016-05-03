# 你不懂JS: 异步与性能
# 第六章: 基准分析与调优

本书的前四章都是关于代码模式（异步与同步）的性能，而第五章是关于宏观程序结构层面的性能，本章从微观层面继续性能的话题，关注的焦点在一个表达式/语句上。

好奇心的一个最常见的领域——确实，一些开发者十分痴迷于此——是分析和测试关于如何写一行或一块儿代码的各种选项，看哪一个更快。

我们将会看到这些问题中的一些，但重要的是要理解从最开始这一章就 **不是** 为了满足对微性能调优的痴迷，比如某种给定的JS引擎运行`++a`要比运行`a++`快。这一章更重要的目标是，搞清楚哪种JS性能要紧而哪种不要紧，*和如何指出这种不同*。

但在我们达到目的之前，我们需要探索一下如何最准确和最可靠地测试JS性能，因为有太多的误解和谜题充斥着我们集体主义崇拜的知识库。我们需要将这些垃圾筛选出来以便找到清晰的答案。

## Benchmarking

好了，是时候开始消除一些误解了。我敢打赌，最广大的JS开发者们，如果被问到如何测量一个特定操作的速度（执行时间），将会一头扎进这样的东西：

```js
var start = (new Date()).getTime();	// or `Date.now()`

// do some operation

var end = (new Date()).getTime();

console.log( "Duration:", (end - start) );
```

如果这大致就是你想到的，请举手。是的，我就知道。这个方式有许多错误，但是别难过；**我们都这么干过。**

这种测量到底告诉了你什么？对于当前的操作的执行时间来说，理解它告诉了你什么和没告诉你什么是学习如何正确测量JavaScript的性能的关键。

如果持续的时间报告为`0`，你也许会试图认为它花的时间少于1毫秒。但是这不是那么准确。一些平台不能精确到毫秒，反而是在更大的时间单位上更新计时器。举个例子，老版本的windows（IE也是如此）只有15毫秒的精确度，这意味着要得到与`0`不同的报告，操作就必须至少要花这么长时间！

另外，不管被报告的持续时间是多少，你唯一真实知道的是，操作在当前这一次运行中大概花了这么长时间。你几乎没有信心说它将总是以这个速度运行。你不知道引擎或系统是否在就在那个确切的时刻进行了干扰，而在其他的时候这个操作可能会运行的快一些。

要是持续的时间报告为`4`呢？你确信它花了大概4毫秒？不，它可能没花那么长时间，而且在取得`start`或`end`时间戳时会有一些其他的延迟。

更麻烦的是，你也不知道这个操作测试所在的环境是不是过于优化了。这样的情况是有可能的：JS引擎找到了一个办法来优化你的测试用例，但是在更真实的程序中这样的优化将会被稀释或者根本不可能，如此这个操作将会比你测试时运行的慢。

那么...我们知道什么？不幸的是，在这些现实情况下，**我们几乎什么都不知道。** 可信度如此低的东西甚至不够你建立自己的判断。你的“基准分析”基本没用。更糟的是，它隐含的这种不成立的可信度很危险，不仅是对你，而且对其他人也一样：认为导致这些结果的条件不重要。

### Repetition

“好的，”你说，“在它周围放一个循环，让整个测试需要的时间长一些。”如果你重复一个操作100次，而整个循环在报告上说总共花了137ms，那么你可以除以100并得到每次操作平均持续时间1.37ms，对吧？

其实，不确切。

对于你打算在你的整个应用程序范围内推广的操作的性能，仅靠一个直白的数据上的平均做出判断绝对是不够的。在一百次迭代中，即使是几个极端值（或高或低）就可以歪曲平均值，而后当你反复实施这个结论时，你就更进一步扩大了这种歪曲。

与仅仅运行固定次数的迭代不同，你可以选择将测试的循环运行一个特定长的时间。那可能更可靠，但是你如何决定运行多长时间？你可能会猜它应该是你的操作运行一次所需时间的倍数。错。

实际上，循环持续的时间应当基于你使用的计时器的精度，具体地将不精确地可能性最小化。你的计时器精度越低，你就需要运行更长时间来确保你将错误的概率最小化了。一个15ms的计时器对于精确的基准分析来说太差劲儿了；为了把它的不确定性（也就是“错误率”）最小化到低于1%，你需要将测试的迭代循环运行750ms。一个1ms的计时器只需要一个循环运行50ms就可以得到相同的可信度。

但，这只是一个样本。为了确信你排除了歪曲结果的因素，你将会想要许多样本来求平均值。你还会想要明白最擦的样本有多慢，最佳的样本有多快，最差与最佳的情况相差多少等等。你想知道的不仅是一个数字告诉你某个东西跑的多块，而且还需要一个关于这个数字有多可信的量化表达。

另外，你可能想要组合这些不同的技术（还有其他的），以便于你可以在所有这些可能的方式中找到最佳的平衡。

这一切只不过是开始所需的最低限度的认识。如果你曾经使用比我刚才几句话带过的东西更不严谨的方式进行基准分析，那么...“你不懂：正确的基准分析”。

### Benchmark.js

任何有用而且可靠的基准分析应当基于统计学上的实践。我不是要在这里写一章统计学，所以我会带过一些名词：标准差，方差，误差边际。如果你不知道这些名词意味着什么——我在大学上过统计学课程，而我依然对他们有点儿晕——那么实际上你没有资格去写你自己的基准分析逻辑。

幸运的是，一些像John-David Dalton和Mathias Bynens这样的聪明家伙明白这些概念，并且写了一个统计学上的基准分析工具，称为Benchmark.js（http://benchmarkjs.com/）。所以我可以简单地说：“用这个工具就行了。”来终结这个悬念。

我不会重复他们的整个文档来讲解Benchmark.js如何工作；他们有很棒的API文档（http://benchmarkjs.com/docs）你可以阅读。另外这里还有一些了不起的文章（http://calendar.perfplanet.com/2010/bulletproof-javascript-benchmarks/）（http://monsur.hossa.in/2012/12/11/benchmarkjs.html）讲解细节与方法学。

但是为了快速演示一下，这是你如何用Benchmark.js来运行一个快速的性能测试：

```js
function foo() {
	// operation(s) to test
}

var bench = new Benchmark(
	"foo test",				// test name
	foo,					// function to test (just contents)
	{
		// ..				// optional extra options (see docs)
	}
);

bench.hz;					// number of operations per second
bench.stats.moe;			// margin of error
bench.stats.variance;		// variance across samples
// ..
```

比起我在这里的窥豹一斑，关于使用Benchmark.js还有 *许多* 需要学习的东西。不过重点是，为了给一段给定的JavaScript代码建立一个公平，可靠，并且合法的性能基准分析，Benchmark.js包揽了所有的复杂性。如果你想要试着对你的代码进行测试和基准分析，这个库应当是你第一个想到的地方。

我们在这里展示的是测试一个单独操作X的用法，但是相当常见的情况是你想要用X和Y进行比较。这可以通过简单地在一个“Suite”（一个Benchmark.js的组织特性）中建立两个测试来很容易做到。然后，你对照地运行它们，然后比较统计结果来对为什么X或Y更快做出论断。

Benchmark.js理所当然地可以被用于在浏览器中测试JavaScript（参见本章稍后的“jsPerf.com”一节），但它也可以运行在非浏览器环境中（Node.js等等）。

一个很大程度上没有触及的Benchmark.js的潜在用例是，在你的Dev或QA环境中针对你的应用程序的JavaScript的关键路径运行自动化的性能回归测试。与在部署之前你可能运行单元测试的方式相似，你也可以将性能与前一次基准分析进行比较，来观测你是否改进或恶化了应用程序性能。

#### Setup/Teardown

在前一个代码段中，我们略过了“额外选项（extra options）”`{ .. }`对象。但是这里有两个我们应当讨论的选项`setup`和`teardown`。

这两个选项让你定义在你的测试用例开始运行前和运行后被调用的函数。

一个需要理解的极其重要的事情是，你的`setup`和`teardown`代码 **不会为每一次测试迭代而运行**。考虑它的最佳方式是，存在一个外部循环（重复的轮回），和一个内部循环（重复的测试迭代）。`setup`和`teardown`会在每个 *外部* 循环（也就是轮回）迭代的开始和末尾运行，但不是在内部循环。

为什么这很重要？让我们想象你有一个看起来像这样的测试用例：

```js
a = a + "w";
b = a.charAt( 1 );
```

然后，你这样建立你的测试`setup`：

```js
var a = "x";
```

你的意图可能是相信对每一次测试迭代`a`都以值`"x"`开始。

但它不是！它使`a`在每一次测试轮回中以`"x"`开始，而后你的反复的`+ "w"`连接将使`a`的值越来越大，即便你永远唯一访问的是位于位置`1`的字符`"w"`。

当你想利用副作用来改变某些东西比如DOM，向它追加一个子元素时，这种意外经常会咬到你。你可能认为的父元素每次都被设置为空，但他实际上被追加了许多元素，而这可能会显著地扭曲你的测试结果。

## Context Is King

不要忘了检查一个指定的性能基准分析的上下文环境，特别是在X与Y之间进行比较时。仅仅因为你的测试揭示了X比Y速度快，并不意味着“X比Y快”这个结论是实际上有意义的。

举个例子，让我们假定一个性能测试揭示出X每秒可以运行1千万次操作，而Y每秒运行8百万次。你可以声称Y比X慢20%，而且在数学上你是对的，但是你的断言并不向像你认为的那么有用。

让我们更加苛刻地考虑这个测试结果：每秒1千万次操作就是每毫秒1万次操作，就是每微秒10次操作。换句话说，一次操作要花0.1毫秒，或者100纳秒。很难体会100纳秒到底有多小，但是作为比较，通常认为人类的眼睛一般不能分辨小于100毫秒的变化，而这要比X操作的100纳秒的速度慢100万倍。

即便最近的科学研究显示，大脑可能的最快处理速度是13毫秒（比先前的论断快大约8倍），这意味着X的运行速度依然要比人类大脑可以感知事情的发生要快12万5千倍。**X运行的非常，非常快。**

但更重要的是，让我们来谈谈X与Y之间的不同，每秒2百万次的差。如果X花100纳秒，而Y花80纳秒，差就是20纳秒，也就是人类大脑可以感知的间隔的65万分之一。

我要说什么？**这种性能上的差别根本就一点儿都不重要！**

但是等一下，如果这种操作将要一个接一个地发生许多次呢？那么差异就会累加起来，对吧？

好的，那么我们就要问，操作X有多大可能性将要一次又一次，一个接一个地运行，而且为了人类大脑能够感知的一线希望而不得不发生65万次。更有可能的是，它不得不在一个紧凑的循环中发生5百万到1千万次。（TODO）

虽然你们之中的计算机科学家会反对说这是可能的，但是你们之中的现实主义者们应当对这究竟有多大可能或不可能进行合理性检查。即使在极其稀少的偶然中这有实际意义，但是在绝大多数情况下它没有。

你们大量的针对微小操作的基准分析结果——比如`++x`对`x++`的神话——**完全是伪命题**，只不过是用来支持在性能的基准上X应当取代Y的结论。

### Engine Optimizations

你根本无法可靠地这样推断：如果在你的独立测试中X要比Y快10微秒，这意味着X总是比Y快所以应当总是被使用。这不是性能的工作方式。它要复杂太多了。

举个例子，让我们想象（纯粹地假想）你在测试某些行为的微观性能，比如比较：

```js
var twelve = "12";
var foo = "foo";

// test 1
var X1 = parseInt( twelve );
var X2 = parseInt( foo );

// test 2
var Y1 = Number( twelve );
var Y2 = Number( foo );
```

如果你理解与`Number(..)`比起来`parseInt(..)`做了什么，你可能会在直觉上认为`parseInt(..)`潜在地有“更多工作”要做，特别是在`foo`的测试用例下。或者你可能在直觉上认为在`foo`的测试用例下它们应当有同样多的工作要做，因为它们俩应当能够在第一个字符`"f"`处停下。

哪一种直觉正确？老实说我不知道。但是我会制造一个与你的直觉无关的测试用例。当你测试它的时候结果会是什么？再一次，我在这里制造了一个纯粹的假想，我们没实际上尝试过，我也不关心。

让我们假装`X`与`Y`的测试结果在统计上是相同的。那么你关于`"f"`字符上发生的事情的直觉得到确认了吗？没有。

It's possible in our hypothetical that the engine might recognize that the variables `twelve` and `foo` are only being used in one place in each test, and so it might decide to inline those values. Then it may realize that `Number( "12" )` can just be replaced by `12`. And maybe it comes to the same conclusion with `parseInt(..)`, or maybe not.

在我们的假想中可能发生这样的事情：引擎可能会识别出变量`twelve`和`foo`在每个测试中仅被使用了一次，因此它可能会决定要内联这些值。然后它可能发现`Number("12")`可以替换为`12`。而且也许会得到与`parseInt(..)`相同的结论，也许不会。

Or an engine's dead-code removal heuristic could kick in, and it could realize that variables `X` and `Y` aren't being used, so declaring them is irrelevant, so it doesn't end up doing anything at all in either test.

或者一个引擎的死代码移除启发式算法会搅和进来，而且它发现变量`X`和`Y`都没有被使用，所以声明它们是没有意义的，所以最终在任一个测试中都不做任何事情。

And all that's just made with the mindset of assumptions about a single test run. Modern engines are fantastically more complicated than what we're intuiting here. They do all sorts of tricks, like tracing and tracking how a piece of code behaves over a short period of time, or with a particularly constrained set of inputs.

而且所有这些都只是关于一个单独测试运行的假设心态而言的。比我们在这里用直觉想象的，现代的引擎更加难以置信地复杂。它们会使用所有的招数，比如追踪并记录一段代码在一段很短的时间内的行为，或者使用一组特别限定的输入。

What if the engine optimizes a certain way because of the fixed input, but in your real program you give more varied input and the optimization decisions shake out differently (or not at all!)? Or what if the engine kicks in optimizations because it sees the code being run tens of thousands of times by the benchmarking utility, but in your real program it will only run a hundred times in near proximity, and under those conditions the engine determines the optimizations are not worth it?

如果引擎由于固定的输入而用特定的方法进行了优化，但是在你的真实的程序中你给出了更多种类的输入，以至于优化机制决定使用不同的方式呢（或者根本不优化！）？或者如果因为引擎看到代码被基准分析工具运行了成千上万次而进行了优化，但在你的真实程序中它将仅会运行大约100次，而在这些条件下引擎认定优化不值得呢？

And all those optimizations we just hypothesized about might happen in our constrained test but maybe the engine wouldn't do them in a more complex program (for various reasons). Or it could be reversed -- the engine might not optimize such trivial code but may be more inclined to optimize it more aggressively when the system is already more taxed by a more sophisticated program.

所有这些我们刚刚假想的优化措施可能会发生在我们的被限定的测试中，但在更复杂的程序中引擎可能不会那么做（由于种种原因）。或者正相反——引擎可能不会优化这样不起眼的代码，但是可能会更倾向于在系统已经被一个更精巧的程序消耗后更加积极地优化。

The point I'm trying to make is that you really don't know for sure exactly what's going on under the covers. All the guesses and hypothesis you can muster don't amount to hardly anything concrete for really making such decisions.

我想要说的是，你不能确切地知道这背后究竟发生了什么。你能搜罗的所有猜测和假想几乎不会聚集成任何坚实的依据。（TODO）

Does that mean you can't really do any useful testing? **Definitely not!**

难道这意味着你不能真正地做有用的测试了吗？**绝对不是！**

What this boils down to is that testing *not real* code gives you *not real* results. In so much as is possible and practical, you should test actual real, non-trivial snippets of your code, and under as best of real conditions as you can actually hope to. Only then will the results you get have a chance to approximate reality.

这可以归结为测试 *不真实* 的代码会给你 *不真实* 的结果。在如此多的可能性和实践中，你应当测试真实的，

Microbenchmarks like `++x` vs `x++` are so incredibly likely to be bogus, we might as well just flatly assume them as such.

## jsPerf.com

While Benchmark.js is useful for testing the performance of your code in whatever JS environment you're running, it cannot be stressed enough that you need to compile test results from lots of different environments (desktop browsers, mobile devices, etc.) if you want to have any hope of reliable test conclusions.

For example, Chrome on a high-end desktop machine is not likely to perform anywhere near the same as Chrome mobile on a smartphone. And a smartphone with a full battery charge is not likely to perform anywhere near the same as a smartphone with 2% battery life left, when the device is starting to power down the radio and processor.

If you want to make assertions like "X is faster than Y" in any reasonable sense across more than just a single environment, you're going to need to actually test as many of those real world environments as possible. Just because Chrome executes some X operation faster than Y doesn't mean that all browsers do. And of course you also probably will want to cross-reference the results of multiple browser test runs with the demographics of your users.

There's an awesome website for this purpose called jsPerf (http://jsperf.com). It uses the Benchmark.js library we talked about earlier to run statistically accurate and reliable tests, and makes the test on an openly available URL that you can pass around to others.

Each time a test is run, the results are collected and persisted with the test, and the cumulative test results are graphed on the page for anyone to see.

When creating a test on the site, you start out with two test cases to fill in, but you can add as many as you need. You also have the ability to set up `setup` code that is run at the beginning of each test cycle and `teardown` code run at the end of each cycle.

**Note:** A trick for doing just one test case (if you're benchmarking a single approach instead of a head-to-head) is to fill in the second test input boxes with placeholder text on first creation, then edit the test and leave the second test blank, which will delete it. You can always add more test cases later.

You can define the initial page setup (importing libraries, defining utility helper functions, declaring variables, etc.). There are also options for defining setup and teardown behavior if needed -- consult the "Setup/Teardown" section in the Benchmark.js discussion earlier.

### Sanity Check

jsPerf is a fantastic resource, but there's an awful lot of tests published that when you analyze them are quite flawed or bogus, for any of a variety of reasons as outlined so far in this chapter.

Consider:

```js
// Case 1
var x = [];
for (var i=0; i<10; i++) {
	x[i] = "x";
}

// Case 2
var x = [];
for (var i=0; i<10; i++) {
	x[x.length] = "x";
}

// Case 3
var x = [];
for (var i=0; i<10; i++) {
	x.push( "x" );
}
```

Some observations to ponder about this test scenario:

* It's extremely common for devs to put their own loops into test cases, and they forget that Benchmark.js already does all the repetition you need. There's a really strong chance that the `for` loops in these cases are totally unnecessary noise.
* The declaring and initializing of `x` is included in each test case, possibly unnecessarily. Recall from earlier that if `x = []` were in the `setup` code, it wouldn't actually be run before each test iteration, but instead once at the beginning of each cycle. That means `x` would continue growing quite large, not just the size `10` implied by the `for` loops.

   So is the intent to make sure the tests are constrained only to how the JS engine behaves with very small arrays (size `10`)? That *could* be the intent, but if it is, you have to consider if that's not focusing far too much on nuanced internal implementation details.

   On the other hand, does the intent of the test embrace the context that the arrays will actually be growing quite large? Is the JS engines' behavior with larger arrays relevant and accurate when compared with the intended real world usage?

* Is the intent to find out how much `x.length` or `x.push(..)` add to the performance of the operation to append to the `x` array? OK, that might be a valid thing to test. But then again, `push(..)` is a function call, so of course it's going to be slower than `[..]` access. Arguably, cases 1 and 2 are fairer than case 3.


Here's another example that illustrates a common apples-to-oranges flaw:

```js
// Case 1
var x = ["John","Albert","Sue","Frank","Bob"];
x.sort();

// Case 2
var x = ["John","Albert","Sue","Frank","Bob"];
x.sort( function mySort(a,b){
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
} );
```

Here, the obvious intent is to find out how much slower the custom `mySort(..)` comparator is than the built-in default comparator. But by specifying the function `mySort(..)` as inline function expression, you've created an unfair/bogus test. Here, the second case is not only testing a custom user JS function, **but it's also testing creating a new function expression for each iteration.**

Would it surprise you to find out that if you run a similar test but update it to isolate only for creating an inline function expression versus using a pre-declared function, the inline function expression creation can be from 2% to 20% slower!?

Unless your intent with this test *is* to consider the inline function expression creation "cost," a better/fairer test would put `mySort(..)`'s declaration in the page setup -- don't put it in the test `setup` as that's unnecessary redeclaration for each cycle -- and simply reference it by name in the test case: `x.sort(mySort)`.

Building on the previous example, another pitfall is in opaquely avoiding or adding "extra work" to one test case that creates an apples-to-oranges scenario:

```js
// Case 1
var x = [12,-14,0,3,18,0,2.9];
x.sort();

// Case 2
var x = [12,-14,0,3,18,0,2.9];
x.sort( function mySort(a,b){
	return a - b;
} );
```

Setting aside the previously mentioned inline function expression pitfall, the second case's `mySort(..)` works in this case because you have provided it numbers, but would have of course failed with strings. The first case doesn't throw an error, but it actually behaves differently and has a different outcome! It should be obvious, but: **a different outcome between two test cases almost certainly invalidates the entire test!**

But beyond the different outcomes, in this case, the built in `sort(..)`'s comparator is actually doing "extra work" that `mySort()` does not, in that the built-in one coerces the compared values to strings and does lexicographic comparison. The first snippet results in `[-14, 0, 0, 12, 18, 2.9, 3]` while the second snippet results (likely more accurately based on intent) in `[-14, 0, 0, 2.9, 3, 12, 18]`.

So that test is unfair because it's not actually doing the same task between the cases. Any results you get are bogus.

These same pitfalls can even be much more subtle:

```js
// Case 1
var x = false;
var y = x ? 1 : 2;

// Case 2
var x;
var y = x ? 1 : 2;
```

Here, the intent might be to test the performance impact of the coercion to a Boolean that the `? :` operator will do if the `x` expression is not already a Boolean (see the *Types & Grammar* title of this book series). So, you're apparently OK with the fact that there is extra work to do the coercion in the second case.

The subtle problem? You're setting `x`'s value in the first case and not setting it in the other, so you're actually doing work in the first case that you're not doing in the second. To eliminate any potential (albeit minor) skew, try:

```js
// Case 1
var x = false;
var y = x ? 1 : 2;

// Case 2
var x = undefined;
var y = x ? 1 : 2;
```

Now there's an assignment in both cases, so the thing you want to test -- the coercion of `x` or not -- has likely been more accurately isolated and tested.

## Writing Good Tests

Let me see if I can articulate the bigger point I'm trying to make here.

Good test authoring requires careful analytical thinking about what differences exist between two test cases and whether the differences between them are *intentional* or *unintentional*.

Intentional differences are of course normal and OK, but it's too easy to create unintentional differences that skew your results. You have to be really, really careful to avoid that skew. Moreover, you may intend a difference but it may not be obvious to other readers of your test what your intent was, so they may doubt (or trust!) your test incorrectly. How do you fix that?

**Write better, clearer tests.** But also, take the time to document (using the jsPerf.com "Description" field and/or code comments) exactly what the intent of your test is, even to the nuanced detail. Call out the intentional differences, which will help others and your future self to better identify unintentional differences that could be skewing the test results.

Isolate things which aren't relevant to your test by pre-declaring them in the page or test setup settings so they're outside the timed parts of the test.

Instead of trying to narrow in on a tiny snippet of your real code and benchmarking just that piece out of context, tests and benchmarks are better when they include a larger (while still relevant) context. Those tests also tend to run slower, which means any differences you spot are more relevant in context.

## Microperformance

OK, until now we've been dancing around various microperformance issues and generally looking disfavorably upon obsessing about them. I want to take just a moment to address them directly.

The first thing you need to get more comfortable with when thinking about performance benchmarking your code is that the code you write is not always the code the engine actually runs. We briefly looked at that topic back in Chapter 1 when we discussed statement reordering by the compiler, but here we're going to suggest the compiler can sometimes decide to run different code than you wrote, not just in different orders but different in substance.

Let's consider this piece of code:

```js
var foo = 41;

(function(){
	(function(){
		(function(baz){
			var bar = foo + baz;
			// ..
		})(1);
	})();
})();
```

You may think about the `foo` reference in the innermost function as needing to do a three-level scope lookup. We covered in the *Scope & Closures* title of this book series how lexical scope works, and the fact that the compiler generally caches such lookups so that referencing `foo` from different scopes doesn't really practically "cost" anything extra.

But there's something deeper to consider. What if the compiler realizes that `foo` isn't referenced anywhere else but that one location, and it further notices that the value never is anything except the `41` as shown?

Isn't it quite possible and acceptable that the JS compiler could decide to just remove the `foo` variable entirely, and *inline* the value, such as this:

```js
(function(){
	(function(){
		(function(baz){
			var bar = 41 + baz;
			// ..
		})(1);
	})();
})();
```

**Note:** Of course, the compiler could probably also do a similar analysis and rewrite with the `baz` variable here, too.

When you begin to think about your JS code as being a hint or suggestion to the engine of what to do, rather than a literal requirement, you realize that a lot of the obsession over discrete syntactic minutia is most likely unfounded.

Another example:

```js
function factorial(n) {
	if (n < 2) return 1;
	return n * factorial( n - 1 );
}

factorial( 5 );		// 120
```

Ah, the good ol' fashioned "factorial" algorithm! You might assume that the JS engine will run that code mostly as is. And to be honest, it might -- I'm not really sure.

But as an anecdote, the same code expressed in C and compiled with advanced optimizations would result in the compiler realizing that the call `factorial(5)` can just be replaced with the constant value `120`, eliminating the function and call entirely!

Moreover, some engines have a practice called "unrolling recursion," where it can realize that the recursion you've expressed can actually be done "easier" (i.e., more optimally) with a loop. It's possible the preceding code could be *rewritten* by a JS engine to run as:

```js
function factorial(n) {
	if (n < 2) return 1;

	var res = 1;
	for (var i=n; i>1; i--) {
		res *= i;
	}
	return res;
}

factorial( 5 );		// 120
```

Now, let's imagine that in the earlier snippet you had been worried about whether `n * factorial(n-1)` or `n *= factorial(--n)` runs faster. Maybe you even did a performance benchmark to try to figure out which was better. But you miss the fact that in the bigger context, the engine may not run either line of code because it may unroll the recursion!

Speaking of `--`, `--n` versus `n--` is often cited as one of those places where you can optimize by choosing the `--n` version, because theoretically it requires less effort down at the assembly level of processing.

That sort of obsession is basically nonsense in modern JavaScript. That's the kind of thing you should be letting the engine take care of. You should write the code that makes the most sense. Compare these three `for` loops:

```js
// Option 1
for (var i=0; i<10; i++) {
	console.log( i );
}

// Option 2
for (var i=0; i<10; ++i) {
	console.log( i );
}

// Option 3
for (var i=-1; ++i<10; ) {
	console.log( i );
}
```

Even if you have some theory where the second or third option is more performant than the first option by a tiny bit, which is dubious at best, the third loop is more confusing because you have to start with `-1` for `i` to account for the fact that `++i` pre-increment is used. And the difference between the first and second options is really quite irrelevant.

It's entirely possible that a JS engine may see a place where `i++` is used and realize that it can safely replace it with the `++i` equivalent, which means your time spent deciding which one to pick was completely wasted and the outcome moot.

Here's another common example of silly microperformance obsession:

```js
var x = [ .. ];

// Option 1
for (var i=0; i < x.length; i++) {
	// ..
}

// Option 2
for (var i=0, len = x.length; i < len; i++) {
	// ..
}
```

The theory here goes that you should cache the length of the `x` array in the variable `len`, because ostensibly it doesn't change, to avoid paying the price of `x.length` being consulted for each iteration of the loop.

If you run performance benchmarks around `x.length` usage compared to caching it in a `len` variable, you'll find that while the theory sounds nice, in practice any measured differences are statistically completely irrelevant.

In fact, in some engines like v8, it can be shown (http://mrale.ph/blog/2014/12/24/array-length-caching.html) that you could make things slightly worse by pre-caching the length instead of letting the engine figure it out for you. Don't try to outsmart your JavaScript engine, you'll probably lose when it comes to performance optimizations.

### Not All Engines Are Alike

The different JS engines in various browsers can all be "spec compliant" while having radically different ways of handling code. The JS specification doesn't require anything performance related -- well, except ES6's "Tail Call Optimization" covered later in this chapter.

The engines are free to decide that one operation will receive its attention to optimize, perhaps trading off for lesser performance on another operation. It can be very tenuous to find an approach for an operation that always runs faster in all browsers.

There's a movement among some in the JS dev community, especially those who work with Node.js, to analyze the specific internal implementation details of the v8 JavaScript engine and make decisions about writing JS code that is tailored to take best advantage of how v8 works. You can actually achieve a surprisingly high degree of performance optimization with such endeavors, so the payoff for the effort can be quite high.

Some commonly cited examples (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers) for v8:

* Don't pass the `arguments` variable from one function to any other function, as such "leakage" slows down the function implementation.
* Isolate a `try..catch` in its own function. Browsers struggle with optimizing any function with a `try..catch` in it, so moving that construct to its own function means you contain the de-optimization harm while letting the surrounding code be optimizable.

But rather than focus on those tips specifically, let's sanity check the v8-only optimization approach in a general sense.

Are you genuinely writing code that only needs to run in one JS engine? Even if your code is entirely intended for Node.js *right now*, is the assumption that v8 will *always* be the used JS engine reliable? Is it possible that someday a few years from now, there's another server-side JS platform besides Node.js that you choose to run your code on? What if what you optimized for before is now a much slower way of doing that operation on the new engine?

Or what if your code always stays running on v8 from here on out, but v8 decides at some point to change the way some set of operations works such that what used to be fast is now slow, and vice versa?

These scenarios aren't just theoretical, either. It used to be that it was faster to put multiple string values into an array and then call `join("")` on the array to concatenate the values than to just use `+` concatenation directly with the values. The historical reason for this is nuanced, but it has to do with internal implementation details about how string values were stored and managed in memory.

As a result, "best practice" advice at the time disseminated across the industry suggesting developers always use the array `join(..)` approach. And many followed.

Except, somewhere along the way, the JS engines changed approaches for internally managing strings, and specifically put in optimizations for `+` concatenation. They didn't slow down `join(..)` per se, but they put more effort into helping `+` usage, as it was still quite a bit more widespread.

**Note:** The practice of standardizing or optimizing some particular approach based mostly on its existing widespread usage is often called (metaphorically) "paving the cowpath."

Once that new approach to handling strings and concatenation took hold, unfortunately all the code out in the wild that was using array `join(..)` to concatenate strings was then sub-optimal.

Another example: at one time, the Opera browser differed from other browsers in how it handled the boxing/unboxing of primitive wrapper objects (see the *Types & Grammar* title of this book series). As such, their advice to developers was to use a `String` object instead of the primitive `string` value if properties like `length` or methods like `charAt(..)` needed to be accessed. This advice may have been correct for Opera at the time, but it was literally completely opposite for other major contemporary browsers, as they had optimizations specifically for the `string` primitives and not their object wrapper counterparts.

I think these various gotchas are at least possible, if not likely, for code even today. So I'm very cautious about making wide ranging performance optimizations in my JS code based purely on engine implementation details, **especially if those details are only true of a single engine**.

The reverse is also something to be wary of: you shouldn't necessarily change a piece of code to work around one engine's difficulty with running a piece of code in an acceptably performant way.

Historically, IE has been the brunt of many such frustrations, given that there have been plenty of scenarios in older IE versions where it struggled with some performance aspect that other major browsers of the time seemed not to have much trouble with. The string concatenation discussion we just had was actually a real concern back in the IE6 and IE7 days, where it was possible to get better performance out of `join(..)` than `+`.

But it's troublesome to suggest that just one browser's trouble with performance is justification for using a code approach that quite possibly could be sub-optimal in all other browsers. Even if the browser in question has a large market share for your site's audience, it may be more practical to write the proper code and rely on the browser to update itself with better optimizations eventually.

"There is nothing more permanent than a temporary hack." Chances are, the code you write now to work around some performance bug will probably outlive the performance bug in the browser itself.

In the days when a browser only updated once every five years, that was a tougher call to make. But as it stands now, browsers across the board are updating at a much more rapid interval (though obviously the mobile world still lags), and they're all competing to optimize web features better and better.

If you run across a case where a browser *does* have a performance wart that others don't suffer from, make sure to report it to them through whatever means you have available. Most browsers have open public bug trackers suitable for this purpose.

**Tip:** I'd only suggest working around a performance issue in a browser if it was a really drastic show-stopper, not just an annoyance or frustration. And I'd be very careful to check that the performance hack didn't have noticeable negative side effects in another browser.

### Big Picture

Instead of worrying about all these microperformance nuances, we should instead be looking at big-picture types of optimizations.

How do you know what's big picture or not? You have to first understand if your code is running on a critical path or not. If it's not on the critical path, chances are your optimizations are not worth much.

Ever heard the admonition, "that's premature optimization!"? It comes from a famous quote from Donald Knuth: "premature optimization is the root of all evil.". Many developers cite this quote to suggest that most optimizations are "premature" and are thus a waste of effort. The truth is, as usual, more nuanced.

Here is Knuth's quote, in context:

> Programmers waste enormous amounts of time thinking about, or worrying about, the speed of **noncritical** parts of their programs, and these attempts at efficiency actually have a strong negative impact when debugging and maintenance are considered. We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that **critical** 3%. [emphasis added]

(http://web.archive.org/web/20130731202547/http://pplab.snu.ac.kr/courses/adv_pl05/papers/p261-knuth.pdf, Computing Surveys, Vol 6, No 4, December 1974)

I believe it's a fair paraphrasing to say that Knuth *meant*: "non-critical path optimization is the root of all evil." So the key is to figure out if your code is on the critical path -- you should optimize it! -- or not.

I'd even go so far as to say this: no amount of time spent optimizing critical paths is wasted, no matter how little is saved; but no amount of optimization on noncritical paths is justified, no matter how much is saved.

If your code is on the critical path, such as a "hot" piece of code that's going to be run over and over again, or in UX critical places where users will notice, like an animation loop or CSS style updates, then you should spare no effort in trying to employ relevant, measurably significant optimizations.

For example, consider a critical path animation loop that needs to coerce a string value to a number. There are of course multiple ways to do that (see the *Types & Grammar* title of this book series), but which one if any is the fastest?

```js
var x = "42";	// need number `42`

// Option 1: let implicit coercion automatically happen
var y = x / 2;

// Option 2: use `parseInt(..)`
var y = parseInt( x, 0 ) / 2;

// Option 3: use `Number(..)`
var y = Number( x ) / 2;

// Option 4: use `+` unary operator
var y = +x / 2;

// Option 5: use `|` unary operator
var y = (x | 0) / 2;
```

**Note:** I will leave it as an exercise to the reader to set up a test if you're interested in examining the minute differences in performance among these options.

When considering these different options, as they say, "One of these things is not like the others." `parseInt(..)` does the job, but it also does a lot more -- it parses the string rather than just coercing. You can probably guess, correctly, that `parseInt(..)` is a slower option, and you should probably avoid it.

Of course, if `x` can ever be a value that **needs parsing**, such as `"42px"` (like from a CSS style lookup), then `parseInt(..)` really is the only suitable option!

`Number(..)` is also a function call. From a behavioral perspective, it's identical to the `+` unary operator option, but it may in fact be a little slower, requiring more machinery to execute the function. Of course, it's also possible that the JS engine recognizes this behavioral symmetry and just handles the inlining of `Number(..)`'s behavior (aka `+x`) for you!

But remember, obsessing about `+x` versus `x | 0` is in most cases likely a waste of effort. This is a microperformance issue, and one that you shouldn't let dictate/degrade the readability of your program.

While performance is very important in critical paths of your program, it's not the only factor. Among several options that are roughly similar in performance, readability should be another important concern.

## Tail Call Optimization (TCO)

As we briefly mentioned earlier, ES6 includes a specific requirement that ventures into the world of performance. It's related to a specific form of optimization that can occur with function calls: *tail call optimization*.

Briefly, a "tail call" is a function call that appears at the "tail" of another function, such that after the call finishes, there's nothing left to do (except perhaps return its result value).

For example, here's a non-recursive setup with tail calls:

```js
function foo(x) {
	return x;
}

function bar(y) {
	return foo( y + 1 );	// tail call
}

function baz() {
	return 1 + bar( 40 );	// not tail call
}

baz();						// 42
```

`foo(y+1)` is a tail call in `bar(..)` because after `foo(..)` finishes, `bar(..)` is also finished except in this case returning the result of the `foo(..)` call. However, `bar(40)` is *not* a tail call because after it completes, its result value must be added to `1` before `baz()` can return it.

Without getting into too much nitty-gritty detail, calling a new function requires an extra amount of reserved memory to manage the call stack, called a "stack frame." So the preceding snippet would generally require a stack frame for each of `baz()`, `bar(..)`, and `foo(..)` all at the same time.

However, if a TCO-capable engine can realize that the `foo(y+1)` call is in *tail position* meaning `bar(..)` is basically complete, then when calling `foo(..)`, it doesn't need to create a new stack frame, but can instead reuse the existing stack frame from `bar(..)`. That's not only faster, but it also uses less memory.

That sort of optimization isn't a big deal in a simple snippet, but it becomes a *much bigger deal* when dealing with recursion, especially if the recursion could have resulted in hundreds or thousands of stack frames. With TCO the engine can perform all those calls with a single stack frame!

Recursion is a hairy topic in JS because without TCO, engines have had to implement arbitrary (and different!) limits to how deep they will let the recursion stack get before they stop it, to prevent running out of memory. With TCO, recursive functions with *tail position* calls can essentially run unbounded, because there's never any extra usage of memory!

Consider that recursive `factorial(..)` from before, but rewritten to make it TCO friendly:

```js
function factorial(n) {
	function fact(n,res) {
		if (n < 2) return res;

		return fact( n - 1, n * res );
	}

	return fact( n, 1 );
}

factorial( 5 );		// 120
```

This version of `factorial(..)` is still recursive, but it's also optimizable with TCO, because both inner `fact(..)` calls are in *tail position*.

**Note:** It's important to note that TCO only applies if there's actually a tail call. If you write recursive functions without tail calls, the performance will still fall back to normal stack frame allocation, and the engines' limits on such recursive call stacks will still apply. Many recursive functions can be rewritten as we just showed with `factorial(..)`, but it takes careful attention to detail.

One reason that ES6 requires engines to implement TCO rather than leaving it up to their discretion is because the *lack of TCO* actually tends to reduce the chances that certain algorithms will be implemented in JS using recursion, for fear of the call stack limits.

If the lack of TCO in the engine would just gracefully degrade to slower performance in all cases, it wouldn't probably have been something that ES6 needed to *require*. But because the lack of TCO can actually make certain programs impractical, it's more an important feature of the language than just a hidden implementation detail.

ES6 guarantees that from now on, JS developers will be able to rely on this optimization across all ES6+ compliant browsers. That's a win for JS performance!

## Review

Effectively benchmarking performance of a piece of code, especially to compare it to another option for that same code to see which approach is faster, requires careful attention to detail.

Rather than rolling your own statistically valid benchmarking logic, just use the Benchmark.js library, which does that for you. But be careful about how you author tests, because it's far too easy to construct a test that seems valid but that's actually flawed -- even tiny differences can skew the results to be completely unreliable.

It's important to get as many test results from as many different environments as possible to eliminate hardware/device bias. jsPerf.com is a fantastic website for crowdsourcing performance benchmark test runs.

Many common performance tests unfortunately obsess about irrelevant microperformance details like `x++` versus `++x`. Writing good tests means understanding how to focus on big picture concerns, like optimizing on the critical path, and avoiding falling into traps like different JS engines' implementation details.

Tail call optimization (TCO) is a required optimization as of ES6 that will make some recursive patterns practical in JS where they would have been impossible otherwise. TCO allows a function call in the *tail position* of another function to execute without needing any extra resources, which means the engine no longer needs to place arbitrary restrictions on call stack depth for recursive algorithms.
