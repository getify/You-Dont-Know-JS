# 你不懂JS: *this* & Object Prototypes
# 第六章: 行为委托

In Chapter 5, we addressed the `[[Prototype]]` mechanism  in detail, and *why* it's confusing and inappropriate (despite countless attempts for nearly two decades) to describe it as "class" or "inheritance". We trudged through not only the fairly verbose syntax (`.prototype` littering the code), but the various gotchas (like surprising `.constructor` resolution or ugly pseudo-polymorphic syntax). We explored variations of the "mixin" approach, which many people use to attempt to smooth over such rough areas.

在第五章中，我们详细地讨论了`[[Prototype]]`机制，和 *为什么* 对于描述“类”或“继承”来说它是那么使人困惑和不合适。我们一路跋涉，不仅涉及了相当繁冗的语法（使代码凌乱的`.prototype`），还有各种陷阱（比如使人吃惊的`.constructor`解析和丑陋的假象多态语法）。我们探索了各种“mixin”方法，人们试图用它们来抹平这些粗糙的区域。

It's a common reaction at this point to wonder why it has to be so complex to do something seemingly so simple. Now that we've pulled back the curtain and seen just how dirty it all gets, it's not a surprise that most JS developers never dive this deep, and instead relegate such mess to a "class" library to handle it for them.

这时一个常见的反应是，想知道为什么这些看起来如此简单的事不得不如此复杂。现在我们已经拉开帷幕看到了它是多么麻烦，这并不奇怪：大多数JS开发者从不探究得这么深，而将这一团糟交给一个“类”包去帮他们处理。

I hope by now you're not content to just gloss over and leave such details to a "black box" library. Let's now dig into how we *could and should be* thinking about the object `[[Prototype]]` mechanism in JS, in a **much simpler and more straightforward way** than the confusion of classes.

我希望到现在你不会甘心于敷衍了事并把这样的细节丢给一个“黑盒”库。现在我们来深入讲解我们 *如何与应当如何* 考虑JS中对象的`[[Prototype]]`机制，以一种比类造成的困惑简单 **得多而且更直接的方式**。

As a brief review of our conclusions from Chapter 5, the `[[Prototype]]` mechanism is an internal link that exists on one object which references another object.

简单地复习一下第五章的结论，`[[Prototype]]`机制是一种存在于一个对象上的内部链接，它指向一个其他对象。

This linkage is exercised when a property/method reference is made against the first object, and no such property/method exists. In that case, the `[[Prototype]]` linkage tells the engine to look for the property/method on the linked-to object. In turn, if that object cannot fulfill the look-up, its `[[Prototype]]` is followed, and so on. This series of links between objects forms what is called the "prototype chain".

当一个属性/方法引用在第一个对象上发生，而这样的属性/方法又不存在时，这个链接就会被使用。在这种情况下，`[[Prototype]]`链接告诉引擎去那个被链接的对象上寻找该属性/方法。接下来，如果那个对象也不能满足查询，就沿着它的`[[Prototype]]`查询，如此继续。这种对象间一系列的链条构成了所谓的“原形链”。

In other words, the actual mechanism, the essence of what's important to the functionality we can leverage in JavaScript, is **all about objects being linked to other objects.**

换句话说，对于我们能在JavaScript中利用的功能的实际机制来说，其重要的实质 **全部在于被连接到其他对象的对象。**

That single observation is fundamental and critical to understanding the motivations and approaches for the rest of this chapter!

这个观点是理解本章其余部分的动机和方法的重要基础。

## Towards Delegation-Oriented Design
## 迈向面相委托的设计

To properly focus our thoughts on how to use `[[Prototype]]` in the most straightforward way, we must recognize that it represents a fundamentally different design pattern from classes (see Chapter 4).

为了将我们的思想恰当地集中在如何用最直截了当的方法使用`[[Prototype]]`，我们必须认识到它代表一种根本上与类不同的设计模式（见第四章）。

**Note:** *Some* principles of class-oriented design are still very valid, so don't toss out everything you know (just most of it!). For example, *encapsulation* is quite powerful, and is compatible (though not as common) with delegation.

**注意*** *某些* 面相类的设计依然是很有效的，所以不要扔掉你知道的每一件事（扔掉大多数就行了！）。比如，封装就是十分强大，而且与委托兼容的（虽然不那么常见）。

We need to try to change our thinking from the class/inheritance design pattern to the behavior delegation design pattern. If you have done most or all of your programming in your education/career thinking in classes, this may be uncomfortable or feel unnatural. You may need to try this mental exercise quite a few times to get the hang of this very different way of thinking.

我么需要试着将我们的思维从类/继承的设计模式转变为行为代理设计模式。如果你已经用在教育/工作生涯中思考类的方式做了大多数或所有的编程工作，这可能感觉不舒服或不自然。你可能需要尝试这种思维过程好几次，才能适应这种非常不同的思考方式。

I'm going to walk you through some theoretical exercises first, then we'll look side-by-side at a more concrete example to give you practical context for your own code.

我将首先带你进行一些理论练习，之后我们会一对一地看一些更实际的例子来为你自己的代码提供实践环境。

### Class Theory
### 类理论

Let's say we have several similar tasks ("XYZ", "ABC", etc) that we need to model in our software.

比方说我们有几个相似的任务（“XYZ”，“ABC”，等）需要在我们的软件中建模。

With classes, the way you design the scenario is: define a general parent (base) class like `Task`, defining shared behavior for all the "alike" tasks. Then, you define child classes `XYZ` and `ABC`, both of which inherit from `Task`, and each of which adds specialized behavior to handle their respective tasks.

使用类，你设计这个场景的方式是：定义一个泛化的父类（基类）比如`Task`，为所有的“类似”任务定义共享的行为。然后，你定义子类`XYZ`和`ABC`，它们都继承自`Task`，每个都添加了特化的行为来处理各自的任务。

**Importantly,** the class design pattern will encourage you that to get the most out of inheritance, you will want to employ method overriding (and polymorphism), where you override the definition of some general `Task` method in your `XYZ` task, perhaps even making use of `super` to call to the base version of that method while adding more behavior to it. **You'll likely find quite a few places** where you can "abstract" out general behavior to the parent class and specialize (override) it in your child classes.

**重要的是，** 类设计模式将鼓励你发挥继承的最大功效，当你在`XYZ`任务中覆盖`Task`的某些泛化方法的定义时，你将会想利用方法覆盖（和多态），也许会利用`super`来调用这个方法泛化版本，为它添加更多的行为。**你很可能会找到几个可以“抽象”到父类中，或在子类中特化（覆盖）的地方**。

Here's some loose pseudo-code for that scenario:

这是一些关于这个场景的假象代码：

```js
class Task {
	id;

	// constructor `Task()`
	Task(ID) { id = ID; }
	outputTask() { output( id ); }
}

class XYZ inherits Task {
	label;

	// constructor `XYZ()`
	XYZ(ID,Label) { super( ID ); label = Label; }
	outputTask() { super(); output( label ); }
}

class ABC inherits Task {
	// ...
}
```

Now, you can instantiate one or more **copies** of the `XYZ` child class, and use those instance(s) to perform task "XYZ". These instances have **copies both** of the general `Task` defined behavior as well as the specific `XYZ` defined behavior. Likewise, instances of the `ABC` class would have copies of the `Task` behavior and the specific `ABC` behavior. After construction, you will generally only interact with these instances (and not the classes), as the instances each have copies of all the behavior you need to do the intended task.

现在，你可以初始化一个或多个`XYZ`子类的 **拷贝**，并且使用这些实例来执行“XYZ”任务。这些实例已经 **同时拷贝** 了泛化的`Tak`定义的行为和具体的`XYZ`定义的行为。类似地，`ABC`类的实例将拷贝`Task`的行为和具体的`ABC`的行为。在构建完成之后，你一般会仅与这些实例互动（而不是类），因为每个实例都拷贝了完成计划任务的所有行为。

### Delegation Theory
### 委托理论

But now let's try to think about the same problem domain, but using *behavior delegation* instead of *classes*.

但是现在然我们试着用 *行为委托* 代替 *类* 来思考同样的问题。

You will first define an **object** (not a class, nor a `function` as most JS'rs would lead you to believe) called `Task`, and it will have concrete behavior on it that includes utility methods that various tasks can use (read: *delegate to*!). Then, for each task ("XYZ", "ABC"), you define an **object** to hold that task-specific data/behavior. You **link** your task-specific object(s) to the `Task` utility object, allowing them to delegate to it when they need to.

你讲首先定义一个称为`Task`的 **对象**（不是一个类，也不是一个大多数JS开发者想让你相信的`function`），而且它将拥有具体的行为，这些行为包含各种任务可以使用的（读作：*委托至*！）工具方法。然后，对于每个任务（“XYZ”，“ABC”），你定义一个 **对象** 来持有这个特定任务的数据/行为。你 **链接** 你的特定任务对象到`Task`工具对象，允许它们在必要的时候可以委托到它。

Basically, you think about performing task "XYZ" as needing behaviors from two sibling/peer objects (`XYZ` and `Task`) to accomplish it. But rather than needing to compose them together, via class copies, we can keep them in their separate objects, and we can allow `XYZ` object to **delegate to** `Task` when needed.

基本上，你认为执行任务“XYZ”就是从两个兄弟/对等的对象（`XYZ`和`Task`）中请求行为来完成它。与其通过类的拷贝将它们组合在一起，我们可以将他们保持在分离的对象中，而且可以在需要的情况下允许`XYZ`对象来 **委托到** `Task`。

Here's some simple code to suggest how you accomplish that:

这里是一些简单的代码，示意你如何实现它：

```js
var Task = {
	setID: function(ID) { this.id = ID; },
	outputID: function() { console.log( this.id ); }
};

// make `XYZ` delegate to `Task`
var XYZ = Object.create( Task );

XYZ.prepareTask = function(ID,Label) {
	this.setID( ID );
	this.label = Label;
};

XYZ.outputTaskDetails = function() {
	this.outputID();
	console.log( this.label );
};

// ABC = Object.create( Task );
// ABC ... = ...
```

In this code, `Task` and `XYZ` are not classes (or functions), they're **just objects**. `XYZ` is set up via `Object.create(..)` to `[[Prototype]]` delegate to the `Task` object (see Chapter 5).

在这段代码中，`Task`和`XYZ`不是类（也不是函数），它们 **仅仅是对象**。`XYZ`通过`Object.create()`创建，来`[[Prototype]]`代理到`Task`对象（见第五章）。

As compared to class-orientation (aka, OO -- object-oriented), I call this style of code **"OLOO"** (objects-linked-to-other-objects). All we *really* care about is that the `XYZ` object delegates to the `Task` object (as does the `ABC` object).

作为面相类（也就是，OO——面相对象）的对比，我城这种风格的代码为 **“OLOO”**（objects-linked-to-other-objects（链接到其他对象的对象））。所有我们真正关心的是，对象`XYZ`委托到对象`Task`（对象`ABC`也一样）。

In JavaScript, the `[[Prototype]]` mechanism links **objects** to other **objects**. There are no abstract mechanisms like "classes", no matter how much you try to convince yourself otherwise. It's like paddling a canoe upstream: you *can* do it, but you're *choosing* to go against the natural current, so it's obviously **going to be harder to get where you're going.**

在JavaScript中，`[[Prototype]]`机制将 **对象** 链接到其他 **对象**。无论你多么想说服自己这不是真的，JavaScript没有像“类”那样的抽象机制。这就像逆水行舟：你 *可以* 做到，但你 *选择* 了逆流而上，所以很明显地，**你会更困难地达到目的地。**

Some other differences to note with **OLOO style code**:

**OLOO风格的代码** 中有一些需要注意的不同：

1. Both `id` and `label` data members from the previous class example are data properties directly on `XYZ` (neither is on `Task`). In general, with `[[Prototype]]` delegation involved, **you want state to be on the delegators** (`XYZ`, `ABC`), not on the delegate (`Task`).
1. 前一个类的例子中的`id`和`label`数据成员都是`XYZ`上的直接数据属性（它们都不在`Task`上）。一般来说，当`[[Prototype]]`委托引入时，**你想使状态保持在委托者上**（`XYZ`，`ABC`），不是在委托上（`Task`）。
2. With the class design pattern, we intentionally named `outputTask` the same on both parent (`Task`) and child (`XYZ`), so that we could take advantage of overriding (polymorphism). In behavior delegation, we do the opposite: **we avoid if at all possible naming things the same** at different levels of the `[[Prototype]]` chain (called shadowing -- see Chapter 5), because having those name collisions creates awkward/brittle syntax to disambiguate references (see Chapter 4), and we want to avoid that if we can.
2. 在类的设计模式中，我们故意在父类（`Task`）和子类（`XYZ`）上采用相同的命名`outputTask`，以至于我们可以利用覆盖（多态）。在委托的行为中，我们反其道而行之：**我们尽一切可能避免在`[[Prototype]]`链的不同层级上给出相同的命名**（称为“遮蔽”——见第五章），因为这些命名冲突会导致尴尬/脆弱的语法来消除引用的歧义（见第四章），而我们想避免它。
   This design pattern calls for less of general method names which are prone to overriding and instead more of descriptive method names, *specific* to the type of behavior each object is doing. **This can actually create easier to understand/maintain code**, because the names of methods (not only at definition location but strewn throughout other code) are more obvious (self documenting).
	 这种设计模式不那么要求那些倾向于覆盖的泛化的方法名，而是要求针对于每个对象的行为类型给出更具描述性的方法名。**这实际上会产生更易于理解/维护的代码**，因为方法名（不仅在定义的位置，而是扩散到其他代码中）变得更加明白（代码即文档）。
3. `this.setID(ID);` inside of a method on the `XYZ` object first looks on `XYZ` for `setID(..)`, but since it doesn't find a method of that name on `XYZ`, `[[Prototype]]` *delegation* means it can follow the link to `Task` to look for `setID(..)`, which it of course finds. Moreover, because of implicit call-site `this` binding rules (see Chapter 2), when `setID(..)` runs, even though the method was found on `Task`, the `this` binding for that function call is `XYZ` exactly as we'd expect and want. We see the same thing with `this.outputID()` later in the code listing.
3. `this.setID(ID);`位于对象`XYZ`的一个方法内部，它首先在`XYZ`上查找`setID(..)`，但因为它不能在`XYZ`上找到叫这个名称的方法，`[[Prototype]]`委托意味着它可以沿着链接到`Task`来寻找`setID()`，这样当然就找到了。另外，因为隐式call-site`this`绑定规则（见第二章），当`setID()`运行时，即便方法是在`Task`上找到的，这个函数调用的`this`绑定依然是我么期望和想要的`XYZ`。我么在代码稍后的`this.outputID()`中也看到了同样的事情。
   In other words, the general utility methods that exist on `Task` are available to us while interacting with `XYZ`, because `XYZ` can delegate to `Task`.
	 换句话说，我们可以使用存在于`Task`上的泛化工具与`XYZ`互动，因为`XYZ`可以委托至`Task`。

**Behavior Delegation** means: let some object (`XYZ`) provide a delegation (to `Task`) for property or method references if not found on the object (`XYZ`).

**行为委托** 意味着：如果某个对象（`XYZ`）的属性或方法没能在这个对象（`XYZ`）上找到时，让这个对象（`XYZ`）为属性或方法引用提供一个委托（`Task`）。

This is an *extremely powerful* design pattern, very distinct from the idea of parent and child classes, inheritance, polymorphism, etc. Rather than organizing the objects in your mind vertically, with Parents flowing down to Children, think of objects side-by-side, as peers, with any direction of delegation links between the objects as necessary.

这是一个极其强大的设计模式，与父类和子类，继承，多态等有很大的不同。与其在你的思维中纵向地，从上面父类到下面子类地组织对象，你应带并列地，对等地考虑对象，而且对象间拥有方向性的委托链接。

**Note:** Delegation is more properly used as an internal implementation detail rather than exposed directly in the API interface design. In the above example, we don't necessarily *intend* with our API design for developers to call `XYZ.setID()` (though we can, of course!). We sorta *hide* the delegation as an internal detail of our API, where `XYZ.prepareTask(..)` delegates to `Task.setID(..)`. See the "Links As Fallbacks?" discussion in Chapter 5 for more detail.

**注意：** 委托更适于作为内部实现的细节，而不是直接暴露在API接口的设计中。在上面的例子中，我们的API设计没必要有意地让开发者调用`XYZ.setID()`（当然我们可以！）。我们以某种隐藏的方式将委托作为我们API的内部细节，即`XYZ.prepareTask(..)`委托到`Task.setID(..)`。详细的内容，参照第五章的“链接还是候补？”中的讨论。

#### Mutual Delegation (Disallowed)
#### 相互委托（不被允许的）

You cannot create a *cycle* where two or more objects are mutually delegated (bi-directionally) to each other. If you make `B` linked to `A`, and then try to link `A` to `B`, you will get an error.

你不能在两个或多个对象间相互地委托（双向地）对方来创建一个 *循环* 。如果你使`b`链接到`A`，然后试着让`A`链接到`B`，你将得到一个错误。

It's a shame (not terribly surprising, but shaosho annoying) that this is disallowed. If you made a reference to a property/method which didn't exist in either place, you'd have an infinite recursion on the `[[Prototype]]` loop. But if all references were strictly present, then `B` could delegate to `A`, and vice versa, and it *could* work. This would mean you could use either object to delegate to the other, for various tasks. There are a few niche use-cases where this might be helpful.

这样的事情不被允许有些可惜（不是非常令人惊讶，但稍稍有些恼人）。如果你制造一个在任意一方都不存在的属性/方法引用，你就会在`[[Prototype]]`上得到一个无限递归的循环。但如果所有的引用都严格存在，那么`B`就可以委托至`A`，或相反，而且它可以工作。这意味着你可以为了多种任务用这两个对象互相委托至对方。有一些情况这可能会有用。

But it's disallowed because engine implementors have observed that it's more performant to check for (and reject!) the infinite circular reference once at set-time rather than needing to have the performance hit of that guard check every time you look-up a property on an object.

但它不被允许是因为引擎的实现者发现，在设置时检查（并拒绝！）无限循环引用一次，要比每次你在一个对象上查询属性时都做相同检查的性能要高。

#### Debugged
#### 调试

We'll briefly cover a subtle detail that can be confusing to developers. In general, the JS specification does not control how browser developer tools should represent specific values/structures to a developer, so each browser/engine is free to interpret such things as they see fit. As such, browsers/tools *don't always agree*. Specifically, the behavior we will now examine is currently observed only in Chrome's Developer Tools.

我们将简单地讨论一个可能困扰开发者的微妙的细节。一般来说，JS语言规范不会控制浏览器开发者工具如何向开发者表示指定的值/结构，所以每种浏览器/引擎都自由地按需要解释这个事情。因此，浏览器/工具 *不总是意见统一*。特别地，我们现在要考察的行为就是当前仅在Chrome的开发者工具中观察到的。

Consider this traditional "class constructor" style JS code, as it would appear in the *console* of Chrome Developer Tools:

考虑这段传统的“类构造器”风格的JS代码，正如它将在Chrome开发者工具 *控制台* 中的：

```js
function Foo() {}

var a1 = new Foo();

a1; // Foo {}
```

Let's look at the last line of that snippet: the output of evaluating the `a1` expression, which prints `Foo {}`. If you try this same code in Firefox, you will likely see `Object {}`. Why the difference? What do these outputs mean?

然我们看这个代码段的最后一行：对表达式`a1`进行求值的输出，打印`Foo {}`。如果你在FireFox中试用同样的代码，你很可能会看到`Object {}`。为什么会有不同？这些输出意味着什么？

Chrome is essentially saying "{} is an empty object that was constructed by a function with name 'Foo'". Firefox is saying "{} is an empty object of general construction from Object". The subtle difference is that Chrome is actively tracking, as an *internal property*, the name of the actual function that did the construction, whereas other browsers don't track that additional information.

Chrome实质上在说“{}是一个由名为‘Foo’的函数创建的空对象”。Firefox在说“{}是一个由Object一般构建的空对象”.这种微妙的区别是因为Chrome在像一个 *内部属性* 一样，动态跟踪执行创建的实际方法的名称，而其他浏览器不会跟踪这样的附加信息。

It would be tempting to attempt to explain this with JavaScript mechanisms:

很容易试图用JavaScript机制来解释它：

```js
function Foo() {}

var a1 = new Foo();

a1.constructor; // Foo(){}
a1.constructor.name; // "Foo"
```

So, is that how Chrome is outputting "Foo", by simply examining the object's `.constructor.name`? Confusingly, the answer is both "yes" and "no".

那么，Chrome就是通过简单地查看对象的`.Constructor.name`来输出“Foo”的？令人费解的是，答案既是“是”也是“不”。

Consider this code:

考虑下面的代码：

```js
function Foo() {}

var a1 = new Foo();

Foo.prototype.constructor = function Gotcha(){};

a1.constructor; // Gotcha(){}
a1.constructor.name; // "Gotcha"

a1; // Foo {}
```

Even though we change `a1.constructor.name` to legitimately be something else ("Gotcha"), Chrome's console still uses the "Foo" name.

即便我们将`a1.constructor.name`合法地改变为其他的东西（“Gotcha”），Chrome控制台依旧使用名称“Foo”。

So, it would appear the answer to previous question (does it use `.constructor.name`?) is **no**, it must track it somewhere else, internally.

那么，说明前面问题（它使用`.constructor.name`吗？）的答案是 **不**，他一定在内部追踪其他的什么东西。

But, Not so fast! Let's see how this kind of behavior works with OLOO-style code:

但是，且慢！让我们看看这种行为如何与OLOO风格的代码一起工作：

```js
var Foo = {};

var a1 = Object.create( Foo );

a1; // Object {}

Object.defineProperty( Foo, "constructor", {
	enumerable: false,
	value: function Gotcha(){}
});

a1; // Gotcha {}
```

Ah-ha! **Gotcha!** Here, Chrome's console **did** find and use the `.constructor.name`. Actually, while writing this book, this exact behavior was identified as a bug in Chrome, and by the time you're reading this, it may have already been fixed. So you may instead have seen the corrected `a1; // Object {}`.

啊哈！**Gotcha**，Chrome的控制台 **确实** 寻找并且使用了`.constructor.name`。实际上，就在写这本书的时候，正是这个行为被认定为Chrome的一个Bug，而且就在你读到这里的时候，它已经被修复了。所以你可能已经看到了被修改过的`a1; // Object{}`。

Aside from that bug, the internal tracking (apparently only for debug output purposes) of the "constructor name" that Chrome does (shown in the earlier snippets) is an intentional Chrome-only extension of behavior beyond what the JS specification calls for.

这个bug暂且不论，Chrome执行的（刚刚在代码段中展示的）“构造器名称”内部追踪（目前仅用于调试输出的目的），是一个仅Chrome内部存在的扩张行为，它已经超出了JS语言规范要求的范围。

If you don't use a "constructor" to make your objects, as we've discouraged with OLOO-style code here in this chapter, then you'll get objects that Chrome does *not* track an internal "constructor name" for, and such objects will correctly only be outputted as "Object {}", meaning "object generated from Object() construction".

如果你不使用“构造器”来制造你的对象，就像我们在本章OLOO风格代码中不鼓励的那样，那么你将会得到一个Chrome不会为其追踪内部“构造器名称”的对象，所以这样的对象将正确地仅仅被输出“Object {}”，意味着“从Object()构建生成的对象”。

**Don't think** this represents a drawback of OLOO-style coding. When you code with OLOO and behavior delegation as your design pattern, *who* "constructed" (that is, *which function* was called with `new`?) some object is an irrelevant detail. Chrome's specific internal "constructor name" tracking is really only useful if you're fully embracing "class-style" coding, but is moot if you're instead embracing OLOO delegation.

**不要认为** 这代表一个OLOO风格代码的缺点。当你用OLOO编码而且用行为代理作为你的设计模式时，*谁* “创建了”（也就是，*哪个函数* 被和`new`一起调用了？）一些对象是一个无关的细节。Chrome特殊的内部“构造器名称”追踪仅仅在你完全拥抱“类风格”编码时才有用，而在你拥抱OLOO委托时是没有意义的。

### Mental Models Compared
### 思维模型比较

Now that you can see a difference between "class" and "delegation" design patterns, at least theoretically, let's see the implications these design patterns have on the mental models we use to reason about our code.

现在你可以看到“类”和“委托”设计模式的不同了，然我们看看这些设计模式在我们用来解释我们代码的思维模型上的含义。

We'll examine some more theoretical ("Foo", "Bar") code, and compare both ways (OO vs. OLOO) of implementing the code. The first snippet uses the classical ("prototypal") OO style:

我们将查看一些更加理论上的（“Foo”，“Bar”）代码，然后比较两种方法（OO vs. OLOO）的代码实现。第一段代码使用经典的（“原型的”）OO风格：

```js
function Foo(who) {
	this.me = who;
}
Foo.prototype.identify = function() {
	return "I am " + this.me;
};

function Bar(who) {
	Foo.call( this, who );
}
Bar.prototype = Object.create( Foo.prototype );

Bar.prototype.speak = function() {
	alert( "Hello, " + this.identify() + "." );
};

var b1 = new Bar( "b1" );
var b2 = new Bar( "b2" );

b1.speak();
b2.speak();
```

Parent class `Foo`, inherited by child class `Bar`, which is then instantiated twice as `b1` and `b2`. What we have is `b1` delegating to `Bar.prototype` which delegates to `Foo.prototype`. This should look fairly familiar to you, at this point. Nothing too ground-breaking going on.

父类`Foo`，被子类`Bar`继承，之后`Bar`被初始化两次：`b1`和`b2`。我们得到的是`be`委托至`Bar.prototype`，`Bar.prototype`委托至`Foo.prototype`。这对你来说应当看起来十分熟悉。没有太具开拓性的东西发生。

Now, let's implement **the exact same functionality** using *OLOO* style code:

现在，让我们使用 *OLOO* 风格的代码 **实现完全相同的功能**：

```js
var Foo = {
	init: function(who) {
		this.me = who;
	},
	identify: function() {
		return "I am " + this.me;
	}
};

var Bar = Object.create( Foo );

Bar.speak = function() {
	alert( "Hello, " + this.identify() + "." );
};

var b1 = Object.create( Bar );
b1.init( "b1" );
var b2 = Object.create( Bar );
b2.init( "b2" );

b1.speak();
b2.speak();
```

We take exactly the same advantage of `[[Prototype]]` delegation from `b1` to `Bar` to `Foo` as we did in the previous snippet between `b1`, `Bar.prototype`, and `Foo.prototype`. **We still have the same 3 objects linked together**.

我们利用了完全相同的从`Bar`到`Foo`的`[[Prototype]]`委托，正如我们在前一个代码段中`b1`，`Bar.prototype`，和`Foo.prototype`之间那样。**我们任然有3个对象链接在一起**。

But, importantly, we've greatly simplified *all the other stuff* going on, because now we just set up **objects** linked to each other, without needing all the cruft and confusion of things that look (but don't behave!) like classes, with constructors and prototypes and `new` calls.

但重要的是，我们极大地简化了发生的 *所有其他事项*，因为我们现在仅仅建立了相互链接的 **对象**，而不需要所有其他讨厌且困惑的看起来像类（但动起来不像）的东西，还有构造器，原型和`new`调用。

Ask yourself: if I can get the same functionality with OLOO style code as I do with "class" style code, but OLOO is simpler and has less things to think about, **isn't OLOO better**?

问你自己：如果我能用OLOO风格代码得到我用“类”风格代码得到的一样的东西，但OLOO更简单而且需要考虑的事情更少，**OLOO不是更好吗**？

Let's examine the mental models involved between these two snippets.

然我们查看这两个代码段间涉及的思维模型。

First, the class-style code snippet implies this mental model of entities and their relationships:

首先，类风给的代码段意味着这样的实体与它们的关系的思维模型：

<img src="fig4.png">

Actually, that's a little unfair/misleading, because it's showing a lot of extra detail that you don't *technically* need to know at all times (though you *do* need to understand it!). One take-away is that it's quite a complex series of relationships. But another take-away: if you spend the time to follow those relationship arrows around, **there's an amazing amount of internal consistency** in JS's mechanisms.

实际上，这有点儿不公平/误导，因为它展示了许多额外的，你在技术上一直不需要知道（虽然你 *需要* 理解它）的细节。一个关键是，它是一系列十分复杂的关系。但另一个关键是：如果你花时间来沿着这些关系的箭头走，在JS的机制中 **有数量惊人的内部统一性**。

For instance, the ability of a JS function to access `call(..)`, `apply(..)`, and `bind(..)` (see Chapter 2) is because functions themselves are objects, and function-objects also have a `[[Prototype]]` linkage, to the `Function.prototype` object, which defines those default methods that any function-object can delegate to. JS can do those things, *and you can too!*.

例如，JS函数可以访问`call(..)`，`apply(..)`和`bind(..)`（见第二章）的能力是因为函数本身是对象，而函数对象也拥有一个`[[Prototype]]`链接，链到`Function.prototype`对象，它定义了那些任何函数对象都可以委托到的默认方法。JS可以做这些事情，*你也能！*

OK, let's now look at a *slightly* simplified version of that diagram which is a little more "fair" for comparison -- it shows only the *relevant* entities and relationships.

好了，现在让我们看一个这张图的 *稍稍* 简化的版本，用它来进行比较稍微“公平”一点——它仅展示了 *相关* 的实体与关系。

<img src="fig5.png">

Still pretty complex, eh? The dotted lines are depicting the implied relationships when you setup the "inheritance" between `Foo.prototype` and `Bar.prototype` and haven't yet *fixed* the **missing** `.constructor` property reference (see "Constructor Redux" in Chapter 5). Even with those dotted lines removed, the mental model is still an awful lot to juggle every time you work with object linkages.

任然非常复杂，对吧？虚线描绘了当你在`Foo.prototype`和`Bar.prototype`间建立“继承”时的隐含关系，而且还没有 *修复* **丢失的** `.constructor`属性引用（见第五章“终极构造器”）。即便将虚线去掉，每次你与对象链接打交道时，这个思维模型依然要变很多可怕的戏法。

Now, let's look at the mental model for OLOO-style code:

现在，然我们看看OLOO风格代码的思维模型：

<img src="fig6.png">

As you can see comparing them, it's quite obvious that OLOO-style code has *vastly less stuff* to worry about, because OLOO-style code embraces the **fact** that the only thing we ever really cared about was the **objects linked to other objects**.

正如你所比较它们得到的，十分明显，OLOO风格的代码 *需要关心的东西少太多了*，因为OLOO风格代码拥抱了 **事实**：我们唯一需要真正关心的事情是 **链接到其他对象的对象**。

All the other "class" cruft was a confusing and complex way of getting the same end result. Remove that stuff, and things get much simpler (without losing any capability).

所有其他“类”的烂设计用一种令人费解而且复杂的方式得到相同的结果。去掉那些东西，事情就变得简单得多（还不会失去任何功能）。

## Classes vs. Objects

We've just seen various theoretical explorations and mental models of "classes" vs. "behavior delegation". But, let's now look at more concrete code scenarios to show how'd you actually use these ideas.

我们已经看到了各种理论的探索和“类”与“行为委托”的思维模型的比较。但是，现在让我们来看看更具体的代码场景，来展示你如何在实际应用这些想法。

We'll first examine a typical scenario in front-end web dev: creating UI widgets (buttons, drop-downs, etc).

我们将首相考察一种在前端网页开发中的典型场景：建造UI部件（按钮，下拉列表等等）。

### Widget "Classes"

Because you're probably still so used to the OO design pattern, you'll likely immediately think of this problem domain in terms of a parent class (perhaps called `Widget`) with all the common base widget behavior, and then child derived classes for specific widget types (like `Button`).

应为你可能还是如此地习惯于OO设计模式，你很可能会立即这样考虑这个问题：一个父类（也许称为`Wedget`）拥有所有共通的基本部件行为，然后衍生的子类拥有具体的部件类型（比如`Button`）。

**Note:** We're going to use jQuery here for DOM and CSS manipulation, only because it's a detail we don't really care about for the purposes of our current discussion. None of this code cares which JS framework (jQuery, Dojo, YUI, etc), if any, you might solve such mundane tasks with.

**注意：** 为了DOM和CSS的操作，我们将在这里使用JQuery，这仅仅是因为对于我们现在的讨论，它不是一个我们真正关心的细节。这些代码中不关心你用哪个JS框架（JQuery，Dojo，YUI等等）来解决如此无趣的问题。

Let's examine how we'd implement the "class" design in classic-style pure JS without any "class" helper library or syntax:

让我们来看看，在没有任何“类”帮助库或语法的情况下，我们如何用经典风格的纯JS来实现“类”设计：

```js
// Parent class
function Widget(width,height) {
	this.width = width || 50;
	this.height = height || 50;
	this.$elem = null;
}

Widget.prototype.render = function($where){
	if (this.$elem) {
		this.$elem.css( {
			width: this.width + "px",
			height: this.height + "px"
		} ).appendTo( $where );
	}
};

// Child class
function Button(width,height,label) {
	// "super" constructor call
	Widget.call( this, width, height );
	this.label = label || "Default";

	this.$elem = $( "<button>" ).text( this.label );
}

// make `Button` "inherit" from `Widget`
Button.prototype = Object.create( Widget.prototype );

// override base "inherited" `render(..)`
Button.prototype.render = function($where) {
	// "super" call
	Widget.prototype.render.call( this, $where );
	this.$elem.click( this.onClick.bind( this ) );
};

Button.prototype.onClick = function(evt) {
	console.log( "Button '" + this.label + "' clicked!" );
};

$( document ).ready( function(){
	var $body = $( document.body );
	var btn1 = new Button( 125, 30, "Hello" );
	var btn2 = new Button( 150, 40, "World" );

	btn1.render( $body );
	btn2.render( $body );
} );
```

OO design patterns tell us to declare a base `render(..)` in the parent class, then override it in our child class, but not to replace it per se, rather to augment the base functionality with button-specific behavior.

OO设计模式告诉我们要在父类中声明一个基础`render(..)`，之后再我们的子类中覆盖它，但不是完全替代它，而是用按钮特定的行为增强这个基础功能。

Notice the ugliness of *explicit pseudo-polymorphism* (see Chapter 4) with `Widget.call` and `Widget.prototype.render.call` references for faking "super" calls from the child "class" methods back up to the "parent" class base methods. Yuck.

注意 *显示假想多态* 的丑陋，`Widget.call`和`Widget.prototype.render.call`引用是为了伪装从子“类”方法得到“父类”基础方法支持的“super”调用。呸。

#### ES6 `class` sugar

We cover ES6 `class` syntax sugar in detail in Appendix A, but let's briefly demonstrate how we'd implement the same code using `class`:

我们会在附录A中讲解ES6的`class`语法糖，但是让我们演示一下我们如何用`class`来实现相同的代码。

```js
class Widget {
	constructor(width,height) {
		this.width = width || 50;
		this.height = height || 50;
		this.$elem = null;
	}
	render($where){
		if (this.$elem) {
			this.$elem.css( {
				width: this.width + "px",
				height: this.height + "px"
			} ).appendTo( $where );
		}
	}
}

class Button extends Widget {
	constructor(width,height,label) {
		super( width, height );
		this.label = label || "Default";
		this.$elem = $( "<button>" ).text( this.label );
	}
	render($where) {
		super.render( $where );
		this.$elem.click( this.onClick.bind( this ) );
	}
	onClick(evt) {
		console.log( "Button '" + this.label + "' clicked!" );
	}
}

$( document ).ready( function(){
	var $body = $( document.body );
	var btn1 = new Button( 125, 30, "Hello" );
	var btn2 = new Button( 150, 40, "World" );

	btn1.render( $body );
	btn2.render( $body );
} );
```

Undoubtedly, a number of the syntax uglies of the previous classical approach have been smoothed over with ES6's `class`. The presence of a `super(..)` in particular seems quite nice (though when you dig into it, it's not all roses!).

毋庸置疑，通过使用ES6的`class`，许多前面经典方法中语法的丑态被改善了。`super(..)`的存在看起来非常适宜（但当你深入挖掘它是，不全是好事！）。

Despite syntactic improvements, **these are not *real* classes**, as they still operate on top of the `[[Prototype]]` mechanism. They suffer from all the same mental-model mismatches we explored in Chapters 4, 5 and thus far in this chapter. Appendix A will expound on the ES6 `class` syntax and its implications in detail. We'll see why solving syntax hiccups doesn't substantially solve our class confusions in JS, though it makes a valiant effort masquerading as a solution!

除了语法上的改进，**这些都不是 *真的* 类**，因为他们仍然工作在`[[Prototype]]`机制之上。它们依然会受到思维模型不匹配的拖累，就像我们在第四，五章中，和直到现在探索的那样。附录A将会详细讲解ES6`class`语法和他的含义。我们将会看到为什么解决语法上的小问题不会实质上解决我们在JS中的类的困惑，虽然它做出了勇敢的努力假装解决了问题！

Whether you use the classic prototypal syntax or the new ES6 sugar, you've still made a *choice* to model the problem domain (UI widgets) with "classes". And as the previous few chapters try to demonstrate, this *choice* in JavaScript is opting you into extra headaches and mental tax.

无论你是使用经典的原型语法还是新的ES6语法糖，你依然选择了使用“类”来对问题（UI部件）进行建模。正如我们前面几章试着展示的，在JavaScript中做这个选择会带给你额外的头疼和思维上的弯路。

### Delegating Widget Objects
### 委托部件对象

Here's our simpler `Widget` / `Button` example, using **OLOO style delegation**:

这是我们更简单的`Widget`/`Button`例子，使用了 **OLOO风格委托**：

```js
var Widget = {
	init: function(width,height){
		this.width = width || 50;
		this.height = height || 50;
		this.$elem = null;
	},
	insert: function($where){
		if (this.$elem) {
			this.$elem.css( {
				width: this.width + "px",
				height: this.height + "px"
			} ).appendTo( $where );
		}
	}
};

var Button = Object.create( Widget );

Button.setup = function(width,height,label){
	// delegated call
	this.init( width, height );
	this.label = label || "Default";

	this.$elem = $( "<button>" ).text( this.label );
};
Button.build = function($where) {
	// delegated call
	this.insert( $where );
	this.$elem.click( this.onClick.bind( this ) );
};
Button.onClick = function(evt) {
	console.log( "Button '" + this.label + "' clicked!" );
};

$( document ).ready( function(){
	var $body = $( document.body );

	var btn1 = Object.create( Button );
	btn1.setup( 125, 30, "Hello" );

	var btn2 = Object.create( Button );
	btn2.setup( 150, 40, "World" );

	btn1.build( $body );
	btn2.build( $body );
} );
```

With this OLOO-style approach, we don't think of `Widget` as a parent and `Button` as a child. Rather, `Widget` **is just an object** and is sort of a utility collection that any specific type of widget might want to delegate to, and `Button` **is also just a stand-alone object** (with a delegation link to `Widget`, of course!).

使用这种OLOO风格的方法，我们不认为`Widget`是一个父类而`Button`是一个子类，`Wedget`**只是一个对象** 和某种具体类型的部件也许想要代理到的工具的集合，而且`Button`**也只是一个独立的对象**（当然，带有委托至`Wedget`的链接！）。

From a design pattern perspective, we **didn't** share the same method name `render(..)` in both objects, the way classes suggest, but instead we chose different names (`insert(..)` and `build(..)`) that were more descriptive of what task each does specifically. The *initialization* methods are called `init(..)` and `setup(..)`, respectively, for the same reasons.

从设计模式的角度来看，我们 **没有** 像类的方法建议的那样，在两个对象中共享相同的`render(..)`方法名称，而是选择了更能描述每个特定任务的不同的名称。同样的原因，*初始化* 方法被分别称为`init(..)`和`setup(..)`。

Not only does this delegation design pattern suggest different and more descriptive names (rather than shared and more generic names), but doing so with OLOO happens to avoid the ugliness of the explicit pseudo-polymorphic calls (`Widget.call` and `Widget.prototype.render.call`), as you can see by the simple, relative, delegated calls to `this.init(..)` and `this.insert(..)`.

不仅委托设计模式建议使用不同而且更具描述性的名称，而且在OLOO中这样做会避免丑陋的显式假想多态调用，正如你可以通过简单，相对的`this.init(..)`和`this.insert(..)`委托调用看到的。

Syntactically, we also don't have any constructors, `.prototype` or `new` present, as they are, in fact, just unnecessary cruft.

语法上，我们也没有任何构造器，`.prototype`或者`new`出现，它们事实上是不必要的设计。

Now, if you're paying close attention, you may notice that what was previously just one call (`var btn1 = new Button(..)`) is now two calls (`var btn1 = Object.create(Button)` and `btn1.setup(..)`). Initially this may seem like a drawback (more code).

现在，如果你再细心考察一下，你可能会注意到之前仅有一个调用（`var btn1 = new Button(..)`），而现在有了两个（`var btn1 = Object.create(Button)`和`btn1.setup(..)`）。这猛地看起来像是一个缺点（代码变多了）。

However, even this is something that's **a pro of OLOO style code** as compared to classical prototype style code. How?

然而，即便是这样的事情，和经典原型风格比起来也是 **OLOO风格代码的优点**。为什么？

With class constructors, you are "forced" (not really, but strongly suggested) to do both construction and initialization in the same step. However, there are many cases where being able to do these two steps separately (as you do with OLOO!) is more flexible.

用类的构造器，你“强制”构建和初始化在同一个步骤中进行。然而，有许多中情况，能够将这两步分开做（就像你在OLOO中做的）更灵活。

For example, let's say you create all your instances in a pool at the beginning of your program, but you wait to initialize them with specific setup until they are pulled from the pool and used. We showed the two calls happening right next to each other, but of course they can happen at very different times and in very different parts of our code, as needed.

举个例子，我们假定你在程序的最开始，在一个池中创建所有的实例，但你等到在它们被从池中找出并使用之前再用指定的设置初始化它们。我们的例子中，这两个调用紧挨在一起，当然它们也可以按需要在非常不同的时间和代码中非常不同的部分发生。

**OLOO** supports *better* the principle of separation of concerns, where creation and initialization are not necessarily conflated into the same operation.

**OLOO** 对关注点分离原则有 *更好* 的支持，也就是创建和初始化没有必要合并在同一个操作中。

## Simpler Design
## 更简单的设计

In addition to OLOO providing ostensibly simpler (and more flexible!) code, behavior delegation as a pattern can actually lead to simpler code architecture. Let's examine one last example that illustrates how OLOO simplifies your overall design.

OLOO除了提供表面上更简单（而且更灵活！）的代码之外，行为委托作为一个模式实际上会带来更简单的代码架构。然我们考察最后一个例子来说明OLOO是
如何简化你的整体设计的。

The scenario we'll examine is two controller objects, one for handling the login form of a web page, and another for actually handling the authentication (communication) with the server.

这个场景中我们将考察两个控制器对象，一个用来处理网页的登录form（表单），另一个实际处理服务器的认证（通信）。

We'll need a utility helper for making the Ajax communication to the server. We'll use jQuery (though any framework would do fine), since it handles not only the Ajax for us, but it returns a promise-like answer so that we can listen for the response in our calling code with `.then(..)`.

我们需要帮助工具来进行与服务器的Ajax通信。我们将使用JQuery（虽然其他的框架都可以），因为它不仅为我们处理Ajax，而且还返回一个类似Promis的答案，这样我们就可以在代码中使用`.then(..)`来监听应答。

**Note:** We don't cover Promises here, but we will cover them in a future title of the *"You Don't Know JS"* series.

**注意：** 我们不会再这里讲到Promises，但我们会在未来的 *你不懂JS* 系列中讲到。

Following the typical class design pattern, we'll break up the task into base functionality in a class called `Controller`, and then we'll derive two child classes, `LoginController` and `AuthController`, which both inherit from `Controller` and specialize some of those base behaviors.

根据典型的类的设计模式，我们在一个叫做`Controller`的类中将任务分解为基本功能，之后我们会衍生出两个子类，`LoginController`和`AuthController`，它们都继承自`Controller`而且特化某些基本行为。

```js
// Parent class
function Controller() {
	this.errors = [];
}
Controller.prototype.showDialog = function(title,msg) {
	// display title & message to user in dialog
};
Controller.prototype.success = function(msg) {
	this.showDialog( "Success", msg );
};
Controller.prototype.failure = function(err) {
	this.errors.push( err );
	this.showDialog( "Error", err );
};
```

```js
// Child class
function LoginController() {
	Controller.call( this );
}
// Link child class to parent
LoginController.prototype = Object.create( Controller.prototype );
LoginController.prototype.getUser = function() {
	return document.getElementById( "login_username" ).value;
};
LoginController.prototype.getPassword = function() {
	return document.getElementById( "login_password" ).value;
};
LoginController.prototype.validateEntry = function(user,pw) {
	user = user || this.getUser();
	pw = pw || this.getPassword();

	if (!(user && pw)) {
		return this.failure( "Please enter a username & password!" );
	}
	else if (pw.length < 5) {
		return this.failure( "Password must be 5+ characters!" );
	}

	// got here? validated!
	return true;
};
// Override to extend base `failure()`
LoginController.prototype.failure = function(err) {
	// "super" call
	Controller.prototype.failure.call( this, "Login invalid: " + err );
};
```

```js
// Child class
function AuthController(login) {
	Controller.call( this );
	// in addition to inheritance, we also need composition
	this.login = login;
}
// Link child class to parent
AuthController.prototype = Object.create( Controller.prototype );
AuthController.prototype.server = function(url,data) {
	return $.ajax( {
		url: url,
		data: data
	} );
};
AuthController.prototype.checkAuth = function() {
	var user = this.login.getUser();
	var pw = this.login.getPassword();

	if (this.login.validateEntry( user, pw )) {
		this.server( "/check-auth",{
			user: user,
			pw: pw
		} )
		.then( this.success.bind( this ) )
		.fail( this.failure.bind( this ) );
	}
};
// Override to extend base `success()`
AuthController.prototype.success = function() {
	// "super" call
	Controller.prototype.success.call( this, "Authenticated!" );
};
// Override to extend base `failure()`
AuthController.prototype.failure = function(err) {
	// "super" call
	Controller.prototype.failure.call( this, "Auth Failed: " + err );
};
```

```js
var auth = new AuthController(
	// in addition to inheritance, we also need composition
	new LoginController()
);
auth.checkAuth();
```

We have base behaviors that all controllers share, which are `success(..)`, `failure(..)` and `showDialog(..)`. Our child classes `LoginController` and `AuthController` override `failure(..)` and `success(..)` to augment the default base class behavior. Also note that `AuthController` needs an instance of `LoginController` to interact with the login form, so that becomes a member data property.

我们有所有控制器分享的基本行为，它们是`success(..)`，`failure(..)`和`showDialog(..)`。我们的子类`LoginController`和`AuthController`覆盖了`failure(..)`和`success(..)`来增强基本类的行为。还要注意的是，`AuthController`需要一个`LoginController`实例来与登录form互动，所以它变成了一个数据属性成员。

The other thing to mention is that we chose some *composition* to sprinkle in on top of the inheritance. `AuthController` needs to know about `LoginController`, so we instantiate it (`new LoginController()`) and keep a class member property called `this.login` to reference it, so that `AuthController` can invoke behavior on `LoginController`.

另外一件要提的事情是，我们选择一些 *合成* 洒在在继承的顶端。`AuthController`需要知道`LoginController`，所以我们初始化它（`new LoginController()`），使一个成为`this.login`的类属性成员引用它，这样`AuthController`可以调用`LoginController`上的行为。

**Note:** There *might* have been a slight temptation to make `AuthController` inherit from `LoginController`, or vice versa, such that we had *virtual composition* through the inheritance chain. But this is a strongly clear example of what's wrong with class inheritance as *the* model for the problem domain, because neither `AuthController` nor `LoginController` are specializing base behavior of the other, so inheritance between them makes little sense except if classes are your only design pattern. Instead, we layered in some simple *composition* and now they can cooperate, while still both benefiting from the inheritance from the parent base `Controller`.

**注意：** 这里可能会存在一丝冲动，就是使`AuthController`继承`LoginController`，或者反过来，这样的话我们就会通过继承链得到 *虚拟合成*。但是这是一个非常清晰地例子，表明对这个问题来讲，将类继承作为模型有什么问题，因为`AuthController`和`LoginController`都不特化对方的行为，所以它们之间的继承没有太大的意义，除非类是你唯一的设计模式。与此相反的是，我们在一些简单的合成中分层，然后它们就可以合作了，同时他俩都享有继承自父类`Controller`的好处。

If you're familiar with class-oriented (OO) design, this should all look pretty familiar and natural.

如果你熟悉面向类（OO）的设计，这都听该看起来十分熟悉和自然。

### De-class-ified

But, **do we really need to model this problem** with a parent `Controller` class, two child classes, **and some composition**? Is there a way to take advantage of OLOO-style behavior delegation and have a *much* simpler design? **Yes!**

但是，我们真的需要用一个父类，两个子类，和一些合成来模型化个问题吗？有办法利用OLOO风格的行为委托得到简单得多的设计吗？**有的！**

```js
var LoginController = {
	errors: [],
	getUser: function() {
		return document.getElementById( "login_username" ).value;
	},
	getPassword: function() {
		return document.getElementById( "login_password" ).value;
	},
	validateEntry: function(user,pw) {
		user = user || this.getUser();
		pw = pw || this.getPassword();

		if (!(user && pw)) {
			return this.failure( "Please enter a username & password!" );
		}
		else if (pw.length < 5) {
			return this.failure( "Password must be 5+ characters!" );
		}

		// got here? validated!
		return true;
	},
	showDialog: function(title,msg) {
		// display success message to user in dialog
	},
	failure: function(err) {
		this.errors.push( err );
		this.showDialog( "Error", "Login invalid: " + err );
	}
};
```

```js
// Link `AuthController` to delegate to `LoginController`
var AuthController = Object.create( LoginController );

AuthController.errors = [];
AuthController.checkAuth = function() {
	var user = this.getUser();
	var pw = this.getPassword();

	if (this.validateEntry( user, pw )) {
		this.server( "/check-auth",{
			user: user,
			pw: pw
		} )
		.then( this.accepted.bind( this ) )
		.fail( this.rejected.bind( this ) );
	}
};
AuthController.server = function(url,data) {
	return $.ajax( {
		url: url,
		data: data
	} );
};
AuthController.accepted = function() {
	this.showDialog( "Success", "Authenticated!" )
};
AuthController.rejected = function(err) {
	this.failure( "Auth Failed: " + err );
};
```

Since `AuthController` is just an object (so is `LoginController`), we don't need to instantiate (like `new AuthController()`) to perform our task. All we need to do is:

因为`AuthController`只是一个对象（`LoginController`也是），我们不需要初始化（比如`new AuthController()`）就能执行我们的任务。所有我们要做的是：

```js
AuthController.checkAuth();
```

Of course, with OLOO, if you do need to create one or more additional objects in the delegation chain, that's easy, and still doesn't require anything like class instantiation:

当然，通过OLOO，如果你确实需要在委托链上创建一个或多个附加的对象时也很容易，而且任然不需要任何像类实例化那样的东西：

```js
var controller1 = Object.create( AuthController );
var controller2 = Object.create( AuthController );
```

With behavior delegation, `AuthController` and `LoginController` are **just objects**, *horizontal* peers of each other, and are not arranged or related as parents and children in class-orientation. We somewhat arbitrarily chose to have `AuthController` delegate to `LoginController` -- it would have been just as valid for the delegation to go the reverse direction.

使用行为委托，`AuthController`和`LoginController`**仅仅是对象**，互相是 *水平* 对等的，而且没有被安排或关联成面向类中的父与子。我们有些随意地选择让`AuthController`委托至`LoginController` —— 相反方向的委托也同样是有效的。

The main takeaway from this second code listing is that we only have two entities (`LoginController` and `AuthController`), **not three** as before.

第二个代码段的主要要点是，我们只拥有两个实体（`LoginController` and `AuthController`），而 **不是之前的三个**。

We didn't need a base `Controller` class to "share" behavior between the two, because delegation is a powerful enough mechanism to give us the functionality we need. We also, as noted before, don't need to instantiate our classes to work with them, because there are no classes, **just the objects themselves.** Furthermore, there's no need for *composition* as delegation gives the two objects the ability to cooperate *differentially* as needed.

我们不需要一个基本的`Controller`类来在两个子类间“分享”行为，因为委托是一种可以给我们所需功能的，足够强大的机制。同时，就像之前注意的，我们不需要实例化我们的对象来使它们工作，因为这里没有类，**只有对象自身。** 另外，这里不需要 *合成* 作为委托来给两个对象差 *异化地* 合作的能力。

Lastly, we avoided the polymorphism pitfalls of class-oriented design by not having the names `success(..)` and `failure(..)` be the same on both objects, which would have required ugly explicit pseudopolymorphism. Instead, we called them `accepted()` and `rejected(..)` on `AuthController` -- slightly more descriptive names for their specific tasks.

最后，由于没有让名称`success(..)`和`failure(..)`在两个对象上相同，我们避开了面向类的设计的多态陷阱：它将会需要难看的显式假想多态。相反，我们在`AuthController`上称它们为`accepted()`和`rejected(..)` —— 对于他们的任务来说，稍稍更具描述性的名称。

**Bottom line**: we end up with the same capability, but a (significantly) simpler design. That's the power of OLOO-style code and the power of the *behavior delegation* design pattern.

**底线：** 我们最终得到了相同的结果，但是用了（显著的）更简单的设计。这就是OLOO风格代码和 *行为委托* 设计模式的力量。

## Nicer Syntax
## 更好的语法

One of the nicer things that makes ES6's `class` so deceptively attractive (see Appendix A on why to avoid it!) is the short-hand syntax for declaring class methods:

一个使ES6`class`看似如此诱人的更好的东西是（见附录A来了解为什么要避免它！），声明类方法的速记语法：

```js
class Foo {
	methodName() { /* .. */ }
}
```

We get to drop the word `function` from the declaration, which makes JS developers everywhere cheer!

我们从声明中扔掉了单词`function`，这使所有的JS开发者欢呼！

And you may have noticed and been frustrated that the suggested OLOO syntax above has lots of `function` appearances, which seems like a bit of a detractor to the goal of OLOO simplification. **But it doesn't have to be that way!**

你可能已经注意到，而且为此感到沮丧：上面推荐的OLOO语法出现了许多`function`，这看起来像对OLOO简化目标的诋毁。**但它不必是！**

As of ES6, we can use *concise method declarations* in any object literal, so an object in OLOO style can be declared this way (same short-hand sugar as with `class` body syntax):

在ES6中，我们可以在任何字面对象中使用 *精简方法声明*，所以一个OLOO风格的对象可以用这种方式声明（与`class`语法中相同的语法糖）：

```js
var LoginController = {
	errors: [],
	getUser() { // Look ma, no `function`!
		// ...
	},
	getPassword() {
		// ...
	}
	// ...
};
```

About the only difference is that object literals will still require `,` comma separators between elements whereas `class` syntax doesn't. Pretty minor concession in the whole scheme of things.

唯一的区别是字面对象的元素间依然需要`,`逗号分隔符，而`class`语法不必如此。在整件事情上很小的让步。

Moreover, as of ES6, the clunkier syntax you use (like for the `AuthController` definition), where you're assigning properties individually and not using an object literal, can be re-written using an object literal (so that you can use concise methods), and you can just modify that object's `[[Prototype]]` with `Object.setPrototypeOf(..)`, like this:

还有，在ES6中，一个你使用的更笨重的语法（比如`AuthController`的定义中）：你一个一个地给属性赋值而不使用字面对象，可以改写为使用字面对象（于是你可以使用简明方法），而且你可以使用`Object.setPrototypeOf(..)`来修改对象的`[[Prototype]]`，像这样：

```js
// use nicer object literal syntax w/ concise methods!
var AuthController = {
	errors: [],
	checkAuth() {
		// ...
	},
	server(url,data) {
		// ...
	}
	// ...
};

// NOW, link `AuthController` to delegate to `LoginController`
Object.setPrototypeOf( AuthController, LoginController );
```

OLOO-style as of ES6, with concise methods, **is a lot friendlier** than it was before (and even then, it was much simpler and nicer than classical prototype-style code). **You don't have to opt for class** (complexity) to get nice clean object syntax!

ES6中的OLOO风格，与简明方法一起，变得比它以前 **友好得多**（即使在以前，它也比经典的原型风格代码简单好看的多）。 **你不必非得选用类**（复杂性）来得到干净漂亮的对象语法！

### Unlexical

There *is* one drawback to concise methods that's subtle but important to note. Consider this code:

简明方法确实有一个缺点，一个重要的细节。考虑这段代码：

```js
var Foo = {
	bar() { /*..*/ },
	baz: function baz() { /*..*/ }
};
```

Here's the syntactic de-sugaring that expresses how that code will operate:

这是去掉语法糖后，这段代码将如何工作：

```js
var Foo = {
	bar: function() { /*..*/ },
	baz: function baz() { /*..*/ }
};
```

See the difference? The `bar()` short-hand became an *anonymous function expression* (`function()..`) attached to the `bar` property, because the function object itself has no name identifier. Compare that to the manually specified *named function expression* (`function baz()..`) which has a lexical name identifier `baz` in addition to being attached to a `.baz` property.

看到区别了？`bar()`的速记法变成了一个附着在`bar`属性上的 *匿名函数表达式*（`function()..`），因为函数对象本身没有名称标识符。和拥有词法名称标识符`baz`，附着在`.baz`属性上的手动指定的 *命名函数表达式*（`function baz()..`）做个比较。

So what? In the *"Scope & Closures"* title of this *"You Don't Know JS"* book series, we cover the three main downsides of *anonymous function expressions* in detail. We'll just briefly repeat them so we can compare to the concise method short-hand.

那又怎么样？在 *“你不懂JS”* 系列的 *“作用域与闭包”* 这本书中，我们详细讲解了 *匿名函数表达式* 的三个主要缺点。我们简单地重复一下它们，以便于我们和简明方法相比较。

Lack of a `name` identifier on an anonymous function:

一个匿名函数缺少`name`标识符：

1. makes debugging stack traces harder
1. 使调试时的栈追踪变得困难
2. makes self-referencing (recursion, event (un)binding, etc) harder
2. 是自引用（递归，事件绑定等）变得困难
3. makes code (a little bit) harder to understand
3. 使代码（稍稍）变得难于理解

Items 1 and 3 don't apply to concise methods.

第一和第三条不适用于简明方法。

Even though the de-sugaring uses an *anonymous function expression* which normally would have no `name` in stack traces, concise methods are specified to set the internal `name` property of the function object accordingly, so stack traces should be able to use it (though that's implementation dependent so not guaranteed).

虽然去掉语法糖使用 *匿名函数表达式* 一般会使栈追踪中没有`name`。简明方法被指定要去设置相应的函数对象内部的`name`属性，所以栈追踪应当可以使用它（这是依赖于具体实现的，所以不能保证）。

Item 2 is, unfortunately, **still a drawback to concise methods**. They will not have a lexical identifier to use as a self-reference. Consider:

不幸的是，第二条 **仍然是简明方法的一个缺陷**。 它们不会有词法标识符用来自引用。考虑：

```js
var Foo = {
	bar: function(x) {
		if (x < 10) {
			return Foo.bar( x * 2 );
		}
		return x;
	},
	baz: function baz(x) {
		if (x < 10) {
			return baz( x * 2 );
		}
		return x;
	}
};
```

The manual `Foo.bar(x*2)` reference above kind of suffices in this example, but there are many cases where a function wouldn't necessarily be able to do that, such as cases where the function is being shared in delegation across different objects, using `this` binding, etc. You would want to use a real self-reference, and the function object's `name` identifier is the best way to accomplish that.

在这个例子中上面的手动`Foo.bar(x*2)`引用就足够了，但是在许多情况下，一个函数没必要能偶这样做，比如使用`this`绑定，函数在委托中被分享到不同的对象，等等。你将会想要使用一个真正的自引用，而函数对象的`name`标识符是实现的最佳方式。

Just be aware of this caveat for concise methods, and if you run into such issues with lack of self-reference, make sure to forgo the concise method syntax **just for that declaration** in favor of the manual *named function expression* declaration form: `baz: function baz(){..}`.

只要小心简明方法的这个注意点，而且如果当你陷入缺少自引用的问题时，**仅仅为这个声明** 放弃简明方法语法，取代以手动的 *命名函数表达式* 声明形式：`baz: function baz(){..}`。

## Introspection

If you've spent much time with class oriented programming (either in JS or other languages), you're probably familiar with *type introspection*: inspecting an instance to find out what *kind* of object it is. The primary goal of *type introspection* with class instances is to reason about the structure/capabilities of the object based on *how it was created*.

如果你花了很长时间在面向类的编程方式（不管是JS还是其他的语言），你可能会对 *类型自省* 很熟悉：自省一个实例来找出它是什么 *种类* 的对象。在类的实例上进行 *类型自省* 的主要目的是根据 *对象是如何创建的* 来推断它的结构/能力。

Consider this code which uses `instanceof` (see Chapter 5) for introspecting on an object `a1` to infer its capability:

考虑这段代码，它使用`instanceof`（见第五章）来自省一个对象`a1`来推断它的能力：

```js
function Foo() {
	// ...
}
Foo.prototype.something = function(){
	// ...
}

var a1 = new Foo();

// later

if (a1 instanceof Foo) {
	a1.something();
}
```

Because `Foo.prototype` (not `Foo`!) is in the `[[Prototype]]` chain (see Chapter 5) of `a1`, the `instanceof` operator (confusingly) pretends to tell us that `a1` is an instance of the `Foo` "class". With this knowledge, we then assume that `a1` has the capabilities described by the `Foo` "class".

因为`Foo.prototype`（不是`Foo`!）在`a1`的`[[Prototype]]`链上（见第五章），`instanceof`操作符（使人困惑地）假装告诉我们`a1`是一个`Foo`“类”的实例。有了这个知识，我们假定`a1`有`Foo`“类”中描述的能力。

Of course, there is no `Foo` class, only a plain old normal function `Foo`, which happens to have a reference to an arbitrary object (`Foo.prototype`) that `a1` happens to be delegation-linked to. By its syntax, `instanceof` pretends to be inspecting the relationship between `a1` and `Foo`, but it's actually telling us whether `a1` and (the arbitrary object referenced by) `Foo.prototype` are related.

当然，这里没有`Foo`类，只有一个普通的函数`Foo`，它恰好拥有一个引用指向一个随意的对象（`Foo.prototype`），而`a1`恰好委托链接至这个对象。通过它的语法，`instanceof`假装检查了`a1`和`Foo`之间的关系，但它实际上告诉我们的是`a1`和（这个随意被引用的对象）`Foo.prototype`是否有关联。

The semantic confusion (and indirection) of `instanceof` syntax  means that to use `instanceof`-based introspection to ask if object `a1` is related to the capabilities object in question, you *have to* have a function that holds a reference to that object -- you can't just directly ask if the two objects are related.

`instanceof`在语义上的混乱（和间接）意味着，要使用`instanceof`为基础的自省来查询对象`a1`是否与讨论中的对象有关联，你 *不得不* 拥有一个函数持有对这个对象引用 —— 你不能直接查询这两个对象是否有关联。

Recall the abstract `Foo` / `Bar` / `b1` example from earlier in this chapter, which we'll abbreviate here:

回想本章前面的抽象`Foo` / `Bar` / `b1`例子，我们在这里缩写一下：

```js
function Foo() { /* .. */ }
Foo.prototype...

function Bar() { /* .. */ }
Bar.prototype = Object.create( Foo.prototype );

var b1 = new Bar( "b1" );
```

For *type introspection* purposes on the entities in that example, using `instanceof` and `.prototype` semantics, here are the various checks you might need to perform:

为了在这个例子中的实体上进行 *类型自省*， 使用`instanceof`和`.prototype`语义，这里有各种你可能需要实施的检查：

```js
// relating `Foo` and `Bar` to each other
Bar.prototype instanceof Foo; // true
Object.getPrototypeOf( Bar.prototype ) === Foo.prototype; // true
Foo.prototype.isPrototypeOf( Bar.prototype ); // true

// relating `b1` to both `Foo` and `Bar`
b1 instanceof Foo; // true
b1 instanceof Bar; // true
Object.getPrototypeOf( b1 ) === Bar.prototype; // true
Foo.prototype.isPrototypeOf( b1 ); // true
Bar.prototype.isPrototypeOf( b1 ); // true
```

It's fair to say that some of that kinda sucks. For instance, intuitively (with classes) you might want to be able to say something like `Bar instanceof Foo` (because it's easy to mix up what "instance" means to think it includes "inheritance"), but that's not a sensible comparison in JS. You have to do `Bar.prototype instanceof Foo` instead.

可以说，其中有些烂透了。举个例子，直觉上（用类）你可能想说这样的东西`Bar instanceof Foo`（因为很容易混淆“实例”的意义认为它包含“继承”），但在JS中这不是一个合理的比较。你不得不说`Bar.prototype instanceof Foo`。

Another common, but perhaps less robust, pattern for *type introspection*, which many devs seem to prefer over `instanceof`, is called "duck typing". This term comes from the adage, "if it looks like a duck, and it quacks like a duck, it must be a duck".

另一个常见，但也许健壮性更差的 *类型自省* 模式叫“duck typing（鸭子类型）”，比起`instanceof`来许多开发者都倾向于它。这个术语源自一则谚语，“如果它看起来像鸭子，叫起来像鸭子，那么它一定是一只鸭子”。

Example:

例如：

```js
if (a1.something) {
	a1.something();
}
```

Rather than inspecting for a relationship between `a1` and an object that holds the delegatable `something()` function, we assume that the test for `a1.something` passing means `a1` has the capability to call `.something()` (regardless of if it found the method directly on `a1` or delegated to some other object). In and of itself, that assumption isn't so risky.

与其检查`a1`和一个持有可委托的`something()`函数的对象的关系，我们假设`a1.something`测试通过意味着`a1`有能力调用`.something()`（不管是直接在`a1`上直接找到方法，还是委托至其他对象）。就其本身而言，这种假设没什么风险。

But "duck typing" is often extended to make **other assumptions about the object's capabilities** besides what's being tested, which of course introduces more risk (aka, brittle design) into the test.

但是“鸭子类型”常常被扩展用于 **关于对象能力的，除了被测试的东西以外的其他假设**，这当然会在测试中引入更多风险（比如脆弱的设计）。

One notable example of "duck typing" comes with ES6 Promises (which as an earlier note explained are not being covered in this book).

“鸭子类型”的一个值得注意的例子来自于ES6的Promises（就是我们前面解释过，将不再本书内涵盖的内容）。

For various reasons, there's a need to determine if any arbitrary object reference *is a Promise*, but the way that test is done is to check if the object happens to have a `then()` function present on it. In other words, **if any object** happens to have a `then()` method, ES6 Promises will assume unconditionally that the object **is a "thenable"** and therefore will expect it to behave conformantly to all standard behaviors of Promises.

由于种种原因，需要判定任意一个对象引用是否 *是一个Promise*，但测试是通过检查对象是否恰好有`then()`函数出现在它上面来完成的。换句话说，**如果任何对象** 恰好有一个`then()`方法，ES6的Promises将会无条件地假设这个对象 **是“thenable”** 的，而且因此会期望它按照所有的Promises标准行为那样一致地动作。

If you have any non-Promise object that happens for whatever reason to have a `then()` method on it, you are strongly advised to keep it far away from the ES6 Promise mechanism to avoid broken assumptions.

如果你有任何非Promise对象上不管因为是什么恰好拥有`then()`方法，你会被强烈建议使它远离ES6的Promises机制，来避免破会这种假设。

That example clearly illustrates the perils of "duck typing". You should only use such approaches sparingly and in controlled conditions.

这个例子清楚地展现了“鸭子类型”的风险。你应当仅在可控的条件下，保守地使用这种方式。

Turning our attention once again back to OLOO-style code as presented here in this chapter, *type introspection* turns out to be much cleaner. Let's recall (and abbreviate) the `Foo` / `Bar` / `b1` OLOO example from earlier in the chapter:

再次将我们的注意力转向本章中出现的OLOO风格的代码，*类型自省* 变得清晰多了。让我们回想（并缩写）本章的`Foo` / `Bar` / `b1`的OLOO示例：

```js
var Foo = { /* .. */ };

var Bar = Object.create( Foo );
Bar...

var b1 = Object.create( Bar );
```

Using this OLOO approach, where all we have are plain objects that are related via `[[Prototype]]` delegation, here's the quite simplified *type introspection* we might use:

使用这种OLOO方式，我们所拥有的一切都是通过`[[Prototype]]`委托关联起来的普通对象，这是我们可能会用到的大幅简化后的 *类型自省*：

```js
// relating `Foo` and `Bar` to each other
Foo.isPrototypeOf( Bar ); // true
Object.getPrototypeOf( Bar ) === Foo; // true

// relating `b1` to both `Foo` and `Bar`
Foo.isPrototypeOf( b1 ); // true
Bar.isPrototypeOf( b1 ); // true
Object.getPrototypeOf( b1 ) === Bar; // true
```

We're not using `instanceof` anymore, because it's confusingly pretending to have something to do with classes. Now, we just ask the (informally stated) question, "are you *a* prototype of me?" There's no more indirection necessary with stuff like `Foo.prototype` or the painfully verbose `Foo.prototype.isPrototypeOf(..)`.

我们不再使用`instanceof`，因为它它令人迷惑地假装与类有关系。现在，我们只需要问（非正式地）这个问题，“你是我的 *一个* 原型吗？”。不再需要用`Foo.prototype`或者痛苦冗长的`Foo.prototype.isPrototypeOf(..)`来间接地查询了。

I think it's fair to say these checks are significantly less complicated/confusing than the previous set of introspection checks. **Yet again, we see that OLOO is simpler than (but with all the same power of) class-style coding in JavaScript.**

我想可以说这些检查比起前面一组自省检查，极大地减少了复杂性/混乱。**又一次，我们看到了在JavaScript中OLOO要比类风格的编码简单（但有着相同的力量）。**

## Review (TL;DR)
## 复习 (TL;DR)

Classes and inheritance are a design pattern you can *choose*, or *not choose*, in your software architecture. Most developers take for granted that classes are the only (proper) way to organize code, but here we've seen there's another less-commonly talked about pattern that's actually quite powerful: **behavior delegation**.

在你的软件体系结构中，类和继承是你可以 *选用* 或 *不选用* 的设计模式。多数开发者理所当然地认为类是组织代码的唯一（正确的）方法，但我们在这里看到了另一种不太常被提到的，但实际上十分强大的设计模式：**行为委托**。

Behavior delegation suggests objects as peers of each other, which delegate amongst themselves, rather than parent and child class relationships. JavaScript's `[[Prototype]]` mechanism is, by its very designed nature, a behavior delegation mechanism. That means we can either choose to struggle to implement class mechanics on top of JS (see Chapters 4 and 5), or we can just embrace the natural state of `[[Prototype]]` as a delegation mechanism.

行为委托意味着对象彼此是对等的，在它们自己当中相互委托，而不是父类与子类的关系。JavaScript的`[[Prototype]]`机制的设计本质，就是行为委托机制。这意味着我们可以选择挣扎着在JS上实现类机制，也可以欣然接受`[[Prototype]]`作为委托机制的本性。

When you design code with objects only, not only does it simplify the syntax you use, but it can actually lead to simpler code architecture design.

当你仅用对象设计代码时，它不仅能简化你使用的语法，而且它还能实际上引领更简单的代码结构设计。

**OLOO** (objects-linked-to-other-objects) is a code style which creates and relates objects directly without the abstraction of classes. OLOO quite naturally implements `[[Prototype]]`-based behavior delegation.

**OLOO**（链接到其他对象的对像）是一种没有类的抽象，而直接创建和关联对象的代码风格。OLOO十分自然地实现了基于`[[Prototype]]`的行为委托。
