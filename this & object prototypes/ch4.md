# 你不懂JS: *this* & Object Prototypes
# 第四章: Mixing (Up) "Class" Objects

Following our exploration of objects from the previous chapter, it's natural that we now turn our attention to "object oriented (OO) programming", with "classes". We'll first look at "class orientation" as a design pattern, before examining the mechanics of "classes": "instantiation", "inheritance" and "(relative) polymorphism".

接着我们上一章对对象的探索，我们很自然的将注意力转移到“面向对象编程”，与“classes（类）”。我们先来看看“面向类”的设计模式，之后我们再考察“类”的机制：“instantiation（初始化）”, “inheritance（继承）”与“(relative) polymorphism（相对多态）”。

We'll see that these concepts don't really map very naturally to the object mechanism in JS, and the lengths (mixins, etc.) many JavaScript developers go to overcome such challenges.

我们将会看到，这些概念并不是非常自然地映射到JS的对象机制上，（TODO）

**Note:** This chapter spends quite a bit of time (the first half!) on heavy "objected oriented programming" theory. We eventually relate these ideas to real concrete JavaScript code in the second half, when we talk about "Mixins". But there's a lot of concept and pseudo-code to wade through first, so don't get lost -- just stick with it!

**注意：** 这一章花了相当一部分时间（前一半！）在着重解释“面向对象编程”理论上。在后半部分讨论“Mixins（混合）”时，我们最终会将这些内容与真实且实际的JavaScript代码联系起来。但是这里首先要蹚过许多概念和假想代码，所以可别迷路了——坚持下去！

## Class Theory
## Class（类）理论

"Class/Inheritance" describes a certain form of code organization and architecture -- a way of modeling real world problem domains in our software.

“类/继承”描述了一种特定的代码组织和结构形式——一种在我们的软件中对真实世界的建模方法。

OO or class oriented programming stresses that data intrinsically has associated behavior (of course, different depending on the type and nature of the data!) that operates on it, so proper design is to package up (aka, encapsulate) the data and the behavior together. This is sometimes called "data structures" in formal computer science.

OO或者面向类的编程强调数据和操作它的行为有固有的联系（当然，依数据的类型和性质不同而不同！），所以合理的设计师将数据和行为打包在一起（也称为封装）。这有时在正式的计算机科学中称为“数据结构”。

For example, a series of characters that represents a word or phrase is usually called a "string". The characters are the data. But you almost never just care about the data, you usually want to *do things* with the data, so the behaviors that can apply *to* that data (calculating its length, appending data, searching, etc.) are all designed as methods of a `String` class.

比如，表示一个单词或短语的一系列字符通常称为“string（字符串）”。这些字符就是数据。但你几乎从来不关心数据，你总是相对数据 *做事情*， 所以可以 *向* 数据实施的行为（计算它的长度，在末尾添加数据，检索，等等）都被设计成为`String`类的方法。

Any given string is just an instance of this class, which means that it's a neatly collected packaging of both the character data and the functionality we can perform on it.

任何给定的字符串都是这个类的一个实例，这个类是一个整齐的集合包装：字符数据和我们可以对它进行的操作功能。

Classes also imply a way of *classifying* a certain data structure. The way we do this is to think about any given structure as a specific variation of a more general base definition.

类还隐含着对一个特定数据结构的一种 *分类* 方法。我们这么做的方法是，将一个给定的结构考虑为一个更加泛化的基础定义的具体种类。

Let's explore this classification process by looking at a commonly cited example. A *car* can be described as a specific implementation of a more general "class" of thing, called a *vehicle*.

让我们通过一个最常被引用的例子来探索这种分类处理。一辆 *车* 可以被描述为一“类”更泛化的东西——*载具*——的具体实现。

We model this relationship in software with classes by defining a `Vehicle` class and a `Car` class.

我们在软件中通过定义`Vehicle`类和`Car`类来模型化这种关系。

The definition of `Vehicle` might include things like propulsion (engines, etc.), the ability to carry people, etc., which would all be the behaviors. What we define in `Vehicle` is all the stuff that is common to all (or most of) the different types of vehicles (the "planes, trains, and automobiles").

`Vehicle`的定义可能会包含像动力（引擎等），载人能力等等，这些都是行为。我们在`Vehicle`中定义的东西，都是所有（或大多数）不同类型的载具（飞机，火车，机动车）都共同拥有的东西。

It might not make sense in our software to re-define the basic essence of "ability to carry people" over and over again for each different type of vehicle. Instead, we define that capability once in `Vehicle`, and then when we define `Car`, we simply indicate that it "inherits" (or "extends") the base definition from `Vehicle`. The definition of `Car` is said to specialize the general `Vehicle` definition.

在我们的软件中为每一种不同类型的载具一次又一次地重定义“载人能力”这个基本性质可能没有道理。取代这种做法的是，我们在`Vehicle`中把这个能力定义一次，之后当我们定义`Car`时，我们简单地指出它从基本的`Vehicle`定义中“继承”（或”“扩展”）。

While `Vehicle` and `Car` collectively define the behavior by way of methods, the data in an instance would be things like the unique VIN of a specific car, etc.

虽然`Vehicle`和`Car`用方法的形式集约地定义了行为，但一个实例中的数据就像一个唯一的车牌号一样属于一辆具体的车。

**And thus, classes, inheritance, and instantiation emerge.**

**这样，类，继承，和实例化就诞生了。**

Another key concept with classes is "polymorphism", which describes the idea that a general behavior from a parent class can be overridden in a child class to give it more specifics. In fact, relative polymorphism lets us reference the base behavior from the overridden behavior.

另一个关于累的关键概念是“polymorphism（多态）”，它描述这样的想法：一个来自于父类的泛化行为可以被子类覆盖，从而使它更加具体。实际上，相对多态让我们在覆盖行为中访问引用基础行为。

Class theory strongly suggests that a parent class and a child class share the same method name for a certain behavior, so that the child overrides the parent (differentially). As we'll see later, doing so in your JavaScript code is opting into frustration and code brittleness.

类理论强烈建议父类和子类对相同的行为共享同样的方法名，所以子类（差异化地）覆盖父类。我们即将看到，在你的JavaScript代码中这么做会导致种种困难和代码脆弱。

### "Class" Design Pattern
### "Class（类）"设计模式

You may never have thought about classes as a "design pattern", since it's most common to see discussion of popular "OO Design Patterns", like "Iterator", "Observer", "Factory", "Singleton", etc. As presented this way, it's almost an assumption that OO classes are the lower-level mechanics by which we implement all (higher level) design patterns, as if OO is a given foundation for *all* (proper) code.

你可能从没把类当做一种“设计模式”考虑过，因为最常见的是关于流行的“面向对象设计模式”的讨论，比如“Iterator（迭代器）”，“Observer（观察者）”，“Factory（工厂）”，“Singleton（单例）”等等。当以这种方式表现时，几乎可以假定OO的类是我们实现所有（高级）设计模式的底层机制，好像对所有代码来说OO是一个给定的基础。（TODO）

Depending on your level of formal education in programming, you may have heard of "procedural programming" as a way of describing code which only consists of procedures (aka, functions) calling other functions, without any higher abstractions. You may have been taught that classes were the *proper* way to transform procedural-style "spaghetti code" into well-formed, well-organized code.

取决于你在编程方面接受过的正规教育的水平，你可能听说过“procedural programming（过程式编程）”：一种不用任何高级抽象，仅仅由过程（也就是函数）调用其他函数来构成的描述代码的方式。你可能被告知过，类是一个将过程式风格的“面条代码”转换为结构良好，组织良好代码的 *恰当* 的方法。

Of course, if you have experience with "functional programming" (Monads, etc.), you know very well that classes are just one of several common design patterns. But for others, this may be the first time you've asked yourself if classes really are a fundamental foundation for code, or if they are an optional abstraction on top of code.

当然，如果你有“functional programming（函数式编程）”的经验，你可能知道类只是几种常见设计模式中的一种。但是对于其他人来说，这可能是第一次你问自己，类是否真的是代码的根本基础，或者它们是在代码顶层上的选择性抽象。

Some languages (like Java) don't give you the choice, so it's not very *optional* at all -- everything's a class. Other languages like C/C++ or PHP give you both procedural and class-oriented syntaxes, and it's left more to the developer's choice which style or mixture of styles is appropriate.

有些语言（比如Java）不给你选择，所以这根本没有 *选择性*——一切都是类。其他语言如C/C++或PHP同时给你过程式和面向类的语法，在使用哪种风格合适或混合风格上，留给开发者更多选择。

### JavaScript "Classes"

Where does JavaScript fall in this regard? JS has had *some* class-like syntactic elements (like `new` and `instanceof`) for quite awhile, and more recently in ES6, some additions, like the `class` keyword (see Appendix A).

在这个问题上JavaScript属于哪一边？JS拥有 *一些* 像类的语法元素（比如`new`和`instanceof`）有一阵子了，而且在最近的ES6中，有一些追加的，比如`class`关键字（见附录A）。

But does that mean JavaScript actually *has* classes? Plain and simple: **No.**

但这意味着JavaScript实际上 *拥有* 类吗？直白且简单：**没有。**

Since classes are a design pattern, you *can*, with quite a bit of effort (as we'll see throughout the rest of this chapter), implement approximations for much of classical class functionality. JS tries to satisfy the extremely pervasive *desire* to design with classes by providing seemingly class-like syntax.

由于类是一种设计模式，你 *可以*，用相当的努力（我们将在本章剩下的部分看到），近似实现很多经典类的功能。JS在通过提供看起来像类的语法，来努力满足用类进行设计的极其广泛的渴望，

While we may have a syntax that looks like classes, it's as if JavaScript mechanics are fighting against you using the *class design pattern*, because behind the curtain, the mechanisms that you build on are operating quite differently. Syntactic sugar and (extremely widely used) JS "Class" libraries go a long way toward hiding this reality from you, but sooner or later you will face the fact that the *classes* you have in other languages are not like the "classes" you're faking in JS.

虽然我们好像有了看起来像类的语法，但是好像JavaScript机制在抵抗你使用 *类设计模式*，因为在底层，这些你正在上面工作的机制运行的十分不同。语法糖和（极其广泛被使用的）JS“Class”包废了很大力气来把这些真实情况对你隐藏起来，但你迟早会面对现实：你在其他语言中遇到的 *类* 和你在JS中模拟的“类”不同。

What this boils down to is that classes are an optional pattern in software design, and you have the choice to use them in JavaScript or not. Since many developers have a strong affinity to class oriented software design, we'll spend the rest of this chapter exploring what it takes to maintain the illusion of classes with what JS provides, and the pain points we experience.

这些归结为，类是软件设计中的一种可选模式，你可以选在在JavaScript中使用或不使用它。因为许多开发者都对面向类的软件设计情有独钟，我们将在本章剩下的部分中探索一下，为了使用JS提供的东西维护类的幻觉要付出什么代价，和我们经历的痛点。

## Class Mechanics

In many class-oriented languages, the "standard library" provides a "stack" data structure (push, pop, etc.) as a `Stack` class. This class would have an internal set of variables that stores the data, and it would have a set of publicly accessible behaviors ("methods") provided by the class, which gives your code the ability to interact with the (hidden) data (adding & removing data, etc.).

在许多面向类语言中，“标准库”都提供一个叫“栈”（压栈，弹出等）的数据结构，用一个`Stack`类表示。这个类拥有一组变量来存储数据，还拥有一组可公开访问的行为（“方法”），这些行为使你的代码有能力与（隐藏的）数据互动（添加或移除数据等等）。

But in such languages, you don't really operate directly on `Stack` (unless making a **Static** class member reference, which is outside the scope of our discussion). The `Stack` class is merely an abstract explanation of what *any* "stack" should do, but it's not itself *a* "stack". You must **instantiate** the `Stack` class before you have a concrete data structure *thing* to operate against.

但是在这样的语言中，你不是直接在`Stack`上操作（除非制造一个 **静态的** 类成员引用，但这超出了我们要讨论的范围）。`Stack`类仅仅是 *有所* 的“栈”都会做的事情的一个抽象解释，但它本身不是一个“栈”。为了得到一个可以对之进行操作的实在的数据结构，你必须 **实例化** 这个`Stack`类。

### Building

The traditional metaphor for "class" and "instance" based thinking comes from a building construction.

传统的"class（类）"和"instance（实例）"的比拟源自于建筑物的建造。

An architect plans out all the characteristics of a building: how wide, how tall, how many windows and in what locations, even what type of material to use for the walls and roof. She doesn't necessarily care, at this point, *where* the building will be built, nor does she care *how many* copies of that building will be built.

一个建筑师会规划出一栋建筑的所有性质：多宽，多高，在哪里有多少窗户，甚至墙壁和天花板用什么材料。在这个时候，她并不关心建筑物将会被建造在 *哪里*，她也不关心有 *多少* 这栋建筑的拷贝将被建造。

She also doesn't care very much about the contents of the building -- the furniture, wall paper, ceiling fans, etc. -- only what type of structure they will be contained by.

同时她也不关心这栋建筑的内容——家具，墙纸，吊扇等等——她仅关心建筑物所含有何种结构。

The architectural blue-prints she produces are only *plans* for a building. They don't actually constitute a building we can walk into and sit down. We need a builder for that task. A builder will take those plans and follow them, exactly, as he *builds* the building. In a very real sense, he is *copying* the intended characteristics from the plans to the physical building.

她生产的建筑学上的蓝图仅仅是建筑物的“方案”。它们不实际构成我们可以实在其中行走或坐下的建筑物。为了这个任务我们需要一个建筑工。建筑工会拿走方案并精确地依照它们 *建造* 这栋建筑物。在真正的意义上，他是在将方案中意图的性质 *拷贝* 到物理建筑物中。

Once complete, the building is a physical instantiation of the blue-print plans, hopefully an essentially perfect *copy*. And then the builder can move to the open lot next door and do it all over again, creating yet another *copy*.

一旦完成，这栋建筑就是蓝图方案的一个物理实例，一个希望是实质完美的 *拷贝*。然后建筑工就可以移动到隔壁将它再重做一遍，建造另一个 *拷贝*。

The relationship between building and blue-print is indirect. You can examine a blue-print to understand how the building was structured, for any parts where direct inspection of the building itself was insufficient. But if you want to open a door, you have to go to the building itself -- the blue-print merely has lines drawn on a page that *represent* where the door should be.

建筑物与蓝图间的关系是间接的。你可以检视蓝图来了解建筑物是如何构造的，但对于直接考照建筑物的每一部分，仅有蓝图是不够的。如果你想打开一扇门，你不得不走进建筑物自身——蓝图仅仅是为了用来表示门的位置而在纸上画的线条。

A class is a blue-print. To actually *get* an object we can interact with, we must build (aka, "instantiate") something from the class. The end result of such "construction" is an object, typically called an "instance", which we can directly call methods on and access any public data properties from, as necessary.

一个类就是一个蓝图。为了实际得到一个对象并与之互动，我们必须从类中建造（也就是实例化）些东西。这种“构建”的最终结果是一个对象，典型地称为一个“实例”，我们可以按需要直接调用它的方法，访问它的公共数据属性。

**This object is a *copy*** of all the characteristics described by the class.

**这个对象是所有在类中被描述的特性的拷贝。**

You likely wouldn't expect to walk into a building and find, framed and hanging on the wall, a copy of the blue-prints used to plan the building, though the blue-prints are probably on file with a public records office. Similarly, you don't generally use an object instance to directly access and manipulate its class, but it is usually possible to at least determine *which class* an object instance comes from.

你不太指望走进一栋建筑之后发现，一份用于规划这栋建筑物的蓝图被裱起来挂在墙上，虽然蓝图可能在办公室的公共记录的文件中。相似地，你一般不会使用对象实例来直接访问和操作类，但是这至少对于判定对象实例来自于 *哪个类* 是可能的。

It's more useful to consider the direct relationship of a class to an object instance, rather than any indirect relationship between an object instance and the class it came from. **A class is instantiated into object form by a copy operation.**

与考虑对象实例与它源自的类的任何间接关系相比，考虑类和对象实例的直接关系更有用。**一个类通过拷贝操作被实例化为对象的形式。**

<img src="fig1.png">

As you can see, the arrows move from left to right, and from top to bottom, which indicates the copy operations that occur, both conceptually and physically.

如你所见，箭头由左向右，从上至下，这表示着概念上和物理上发生的拷贝操作。

### Constructor
### Constructor（构造器）

Instances of classes are constructed by a special method of the class, usually of the same name as the class, called a *constructor*. This method's explicit job is to initialize any information (state) the instance will need.

类的实例由类的一种特殊方法构建，这个方法的名称通常与类名相同，称为 *“constructor（构造器）”*。这个方法的明确的任务，就是初始化实例所需的所有信息（状态）。

For example, consider this loose pseudo-code (invented syntax) for classes:

比如，考虑下面这个累的假想代码（语法是自创的）：

```js
class CoolGuy {
	specialTrick = nothing

	CoolGuy( trick ) {
		specialTrick = trick
	}

	showOff() {
		output( "Here's my trick: ", specialTrick )
	}
}
```

To *make* a `CoolGuy` instance, we would call the class constructor:

为了制造一个`CoolGuy`实例，我们需要调用类的构造器:

```js
Joe = new CoolGuy( "jumping rope" )

Joe.showOff() // Here's my trick: jumping rope
```

Notice that the `CoolGuy` class has a constructor `CoolGuy()`, which is actually what we call when we say `new CoolGuy(..)`. We get an object back (an instance of our class) from the constructor, and we can call the method `showOff()`, which prints out that particular `CoolGuy`s special trick.

注意，`CoolGuy`类有一个构造器`CoolGuy()`，它实际上就是在我们说`new CoolGuy(..)`时调用的。我们从这个构造器拿回一个对象（类的一个实例），我们可以调用`showOff()`方法，来打印这个特定的`CoolGuy`的特殊才艺。

*Obviously, jumping rope makes Joe a pretty cool guy.*

*很明显，跳绳使Joe看起来很酷。*

The constructor of a class *belongs* to the class, almost universally with the same name as the class. Also, constructors pretty much always need to be called with `new` to let the language engine know you want to construct a *new* class instance.

类的构造器 *属于* 那个类，几乎总是和类同名。同时，构造器大多数情况下总是需要用`new`来调用，以便使语言的引擎知道你想要构建一个 *新的* 类的实例。

## Class Inheritance
## Class Inheritance（类继承）

In class-oriented languages, not only can you define a class which can be instantiated itself, but you can define another class that **inherits** from the first class.

在面向类的语言中，你不仅可以定义一个可以初始化它自己的类，你也可以定义另外一个类 **继承** 自第一个类。

The second class is often said to be a "child class" whereas the first is the "parent class". These terms obviously come from the metaphor of parents and children, though the metaphors here are a bit stretched, as you'll see shortly.

这第二个类通常被称为“子类”，而第一个类被称为“父类”。这些名词明显地来自于亲子关系的比拟，虽然这种比拟有些变形，就像你马上要看到的。

When a parent has a biological child, the genetic characteristics of the parent are copied into the child. Obviously, in most biological reproduction systems, there are two parents who co-equally contribute genes to the mix. But for the purposes of the metaphor, we'll assume just one parent.

当一个家长拥有一个和他有血缘关系的孩子时，家长的遗传性质会被拷贝到孩子身上。明显地，在大多数生物繁殖系统中，双亲都平等地贡献基因进行混合。但是为了这个比拟的意图，我们假设只有一个亲人。

Once the child exists, he or she is separate from the parent. The child was heavily influenced by the inheritance from his or her parent, but is unique and distinct. If a child ends up with red hair, that doesn't mean the parent's hair *was* or automatically *becomes* red.

一旦孩子出现，他或她就从亲人那里分离出来。这个孩子受其亲人的继承因素的严重影响，但是独一无二。如果这个孩子拥有红色的头发，这并不意味这他的亲人的头发 *曾经* 是红色，或者会自动 *变成* 红色。

In a similar way, once a child class is defined, it's separate and distinct from the parent class. The child class contains an initial copy of the behavior from the parent, but can then override any inherited behavior and even define new behavior.

以相似的方式，一旦一个子类被定义，它就分离且区别于父类。子类含有一份从父类那里得来的行为的初始拷贝，但它可以覆盖这些继承的行为，甚至是定义新行为。

It's important to remember that we're talking about parent and child **classes**, which aren't physical things. This is where the metaphor of parent and child gets a little confusing, because we actually should say that a parent class is like a parent's DNA and a child class is like a child's DNA. We have to make (aka "instantiate") a person out of each set of DNA to actually have a physical person to have a conversation with.

重要的是，要记住我们在讨论父 **类** 和子 **类**，而不是物理上的东西。这就是这个亲子比拟让人糊涂的地方，因为我们实际上应当说父类就是亲人的DNA，而子类就是孩子的DNA。我们不得不从两套DNA制造出（也就是初始化）人，用得到的物理上存在的人来进行我们的谈话。

Let's set aside biological parents and children, and look at inheritance through a slightly different lens: different types of vehicles. That's one of the most canonical (and often groan-worthy) metaphors to understand inheritance.

让我们把生物学上的亲子放在一边，透过一个不同的镜片来看看继承：不同种类型的载具。这是用来理解集成的最经典（且经常有争议TODO）的比拟。

Let's revisit the `Vehicle` and `Car` discussion from earlier in this chapter. Consider this loose pseudo-code (invented syntax) for inherited classes:

然我们重新审视本章前面的`Vehicle`和`Car`的讨论。考虑下面表达继承的类的假想代码：

```js
class Vehicle {
	engines = 1

	ignition() {
		output( "Turning on my engine." )
	}

	drive() {
		ignition()
		output( "Steering and moving forward!" )
	}
}

class Car inherits Vehicle {
	wheels = 4

	drive() {
		inherited:drive()
		output( "Rolling on all ", wheels, " wheels!" )
	}
}

class SpeedBoat inherits Vehicle {
	engines = 2

	ignition() {
		output( "Turning on my ", engines, " engines." )
	}

	pilot() {
		inherited:drive()
		output( "Speeding through the water with ease!" )
	}
}
```

**Note:** For clarity and brevity, constructors for these classes have been omitted.

**注意：** 为了简洁明了，这些类的构造器被省略了。

We define the `Vehicle` class to assume an engine, a way to turn on the ignition, and a way to drive around. But you wouldn't ever manufacture just a generic "vehicle", so it's really just an abstract concept at this point.

我们定义`Vehicle`类，假定它有一个引擎，有一个打开打火器的方法，和一个行驶的方法。但你永远也不会制造一个泛化的“载具”，所以在这里它只是一个概念的抽象。

So then we define two specific kinds of vehicle: `Car` and `SpeedBoat`. They each inherit the general characteristics of `Vehicle`, but then they specialize the characteristics appropriately for each kind. A car needs 4 wheels, and a speed boat needs 2 engines, which means it needs extra attention to turn on the ignition of both engines.

所以后来我们定义了两种具体的载具：`Car`和`SpeedBoat`。它们都继承`Vehicle`的泛化性质，但之后它们都对这些性质进行了合适的特化。一辆车有4个轮子，一艘快艇有两个引擎，意味着他需要在打火时需要特别注意要启动两个引擎。

### Polymorphism
### Polymorphism（多态）

`Car` defines its own `drive()` method, which overrides the method of the same name it inherited from `Vehicle`. But then, `Car`s `drive()` method calls `inherited:drive()`, which indicates that `Car` can reference the original pre-overridden `drive()` it inherited. `SpeedBoat`s `pilot()` method also makes a reference to its inherited copy of `drive()`.

`Car`定义了自己的`drive()`方法，它覆盖了从`Vehicle`继承来的同名方法。但是，`Car`的`drive()`方法调用了`inherited:drive()`，这表示`Car`可以引用它继承的，覆盖之前的原版`drive()`。`SpeedBoat`的`pilot()`方法也引用了它继承的`drive()`拷贝。

This technique is called "polymorphism", or "virtual polymorphism". More specifically to our current point, we'll call it "relative polymorphism".

这种技术称为“polymorphism（多态）”，或“virtual polymorphism（虚拟多态）”。对我们当前的情况更具体一些，我们称之为“relative polymorphism（相对多态）”。

Polymorphism is a much broader topic than we will exhaust here, but our current "relative" semantics refers to one particular aspect: the idea that any method can reference another method (of the same or different name) at a higher level of the inheritance hierarchy. We say "relative" because we don't absolutely define which inheritance level (aka, class) we want to access, but rather relatively reference it by essentially saying "look one level up".

多态这个话题比我们可以在这里谈到的内容要宽泛的多，但我们当前的“相对”意味着一个特殊层面：任何方法都可以引用位于继承链更高一层的其他方法（同名或不同名）。我们说“相对”，因为我们不绝对定义我们想访问继承的那一层（也就是类），而是通过本质上说“看上一层”来相对的引用。

In many languages, the keyword `super` is used, in place of this example's `inherited:`, which leans on the idea that a "super class" is the parent/ancestor of the current class.

在许多语言中，在这个例子中使用`inherited:`的地方，使用了`super`关键字，它的基于这样的想法：一个“super class（超类）”是当前类的父亲/祖先。

Another aspect of polymorphism is that a method name can have multiple definitions at different levels of the inheritance chain, and these definitions are automatically selected as appropriate when resolving which methods are being called.

多态的另一个方面是，一个方法名可以在继承链的不同层面上有多种定义，而且在解析哪个方法应该被调用时，这些定义可以适当地被自动选择。

We see two occurrences of that behavior in our example above: `drive()` is defined in both `Vehicle` and `Car`, and `ignition()` is defined in both `Vehicle` and `SpeedBoat`.

在我们上面的例子中，我们看到这种行为发生了两次：`drive()`在`Vehicle`和`Car`中定义, 而`ignition()`在`Vehicle`和`SpeedBoat`中定义。

**Note:** Another thing that traditional class-oriented languages give you via `super` is a direct way for the constructor of a child class to reference the constructor of its parent class. This is largely true because with real classes, the constructor belongs to the class. However, in JS, it's the reverse -- it's actually more appropriate to think of the "class" belonging to the constructor (the `Foo.prototype...` type references). Since in JS the relationship between child and parent exists only between the two `.prototype` objects of the respective constructors, the constructors themselves are not directly related, and thus there's no simple way to relatively reference one from the other (see Appendix A for ES6 `class` which "solves" this with `super`).

**注意：** 另一个传统面向类语言通过`super`给你的，是从子类的构造器中直接访问父类构造器的方法。这很大程度上是对的，因为对真正的类来说，构造器属于这个类。然而在JS中，这是相反的——实际上认为“类”属于构造器（`Foo.prototype...`类型引用）更恰当。因为在JS中，父子关系仅存在于它们各自的构造器的两个`.prototype`对象间，构造器本身不直接关联，而且没有简单的方法从一个中相对引用另一个（参见附录A，看看ES6中用`super`“解决”此问题的`class`）。

An interesting implication of polymorphism can be seen specifically with `ignition()`. Inside `pilot()`, a relative-polymorphic reference is made to (the inherited) `Vehicle`s version of `drive()`. But that `drive()` references an `ignition()` method just by name (no relative reference).

可以从`ignition()`中具体看出多态的一个有趣的含义。在`pilot()`内部，一个相对多态引用指向了（继承的）`Vehicle`版本的`drive()`。但是这个`drive()`仅仅通过名称（不是相对引用）来引用`ignition()`方法。

Which version of `ignition()` will the language engine use, the one from `Vehicle` or the one from `SpeedBoat`? **It uses the `SpeedBoat` version of `ignition()`.** If you *were* to instantiate `Vehicle` class itself, and then call its `drive()`, the language engine would instead just use `Vehicle`s `ignition()` method definition.

语言的引擎会使用哪一个版本的`ignition()`，是`Vehicle`的还是`SpeedBoat`的？**它会使用`SpeedBoat`版本的`ignition()`。** 如果你 *能* 初始化`Vehicle`类自身，并且调用它的`drive()`，那么语言引擎将会使用`Vehicle`的`ignition()`定义。

Put another way, the definition for the method `ignition()` *polymorphs* (changes) depending on which class (level of inheritance) you are referencing an instance of.

从另一个方面说，`ignition()`方法的定义，根据你引用的实例是哪个类（继承层级）而 *多态*（改变）。

This may seem like overly deep academic detail. But understanding these details is necessary to properly contrast similar (but distinct) behaviors in JavaScript's `[[Prototype]]` mechanism.

这看起来过于深入学术细节了。不过为了好好地与Javascript的`[[Prototype]]`机制的类似行为进行对比，理解这些细节还是很重要的。

When classes are inherited, there is a way **for the classes themselves** (not the object instances created from them!) to *relatively* reference the class inherited from, and this relative reference is usually called `super`.

如果类是继承而来的，**对这些类本身**（不是由它们创建的对象）有一个方法可以相对地引用它们继承自的对象，这个相对引用通常称为`super`。

Remember this figure from earlier:

记得刚才这幅图：

<img src="fig1.png">

Notice how for both instantiation (`a1`, `a2`, `b1`, and `b2`) *and* inheritance (`Bar`), the arrows indicate a copy operation.

注意对于实例化(`a1`，`a2`，`b1`，和`b2`) *和* 继承(`Bar`)，箭头如何表示拷贝操作。

Conceptually, it would seem a child class `Bar` can access  behavior in its parent class `Foo` using a relative polymorphic reference (aka, `super`). However, in reality, the child class is merely given a copy of the inherited behavior from its parent class. If the child "overrides" a method it inherits, both the original and overridden versions of the method are actually maintained, so that they are both accessible.

从概念上讲，看起来子类`Bar`可以使用相对多态引用（也就是`super`）来访问它的父类`Foo`的行为。然而在现实中，子类不过是被给与了一份它从父类继承来的行为的拷贝而已。如果子类“覆盖”一个它继承的方法，原版的方法和覆盖版的方法实际上都是存在的，所以它们可以互相访问对方。

Don't let polymorphism confuse you into thinking a child class is linked to its parent class. A child class instead gets a copy of what it needs from the parent class. **Class inheritance implies copies.**

不要让多态把你搞糊涂，使你认为子类是链接到父类上的。而是子类得到一份他需要从父类继承的东西的拷贝。**类继承意味着拷贝。**

### Multiple Inheritance
### Multiple Inheritance（多重继承）

Recall our earlier discussion of parent(s) and children and DNA? We said that the metaphor was a bit weird because biologically most offspring come from two parents. If a class could inherit from two other classes, it would more closely fit the parent/child metaphor.

能回想起我们早先提到的亲子和DNA吗？我们说过这个比拟有些奇怪，应为生物学上大多数后代来自于双亲。如果类可以继承自其他两个类，那么这个亲子比拟会更合适一些。

Some class-oriented languages allow you to specify more than one "parent" class to "inherit" from. Multiple-inheritance means that each parent class definition is copied into the child class.

有些面向类的语言允许你指定一个以上的“父类”来进行“继承”。多重继承意味着每个父类的定义都被拷贝到子类中。

On the surface, this seems like a powerful addition to class-orientation, giving us the ability to compose more functionality together. However, there are certainly some complicating questions that arise. If both parent classes provide a method called `drive()`, which version would a `drive()` reference in the child resolve to? Would you always have to manually specify which parent's `drive()` you meant, thus losing some of the gracefulness of polymorphic inheritance?

表面上看来，这是对面向类的一个强大的加成，给我们能力去将更多功能组合在一起。然而，这无疑会产生一些复杂的问题。如果两个父类都提供了名为`drive()`的方法，在子类中的`drive()`引用将会解析为哪个版本？你会总是不得不手动指明哪个父类的`drive()`是你想要的，从而失去一些多态继承的优雅之处吗？

There's another variation, the so called "Diamond Problem", which refers to the scenario where a child class "D" inherits from two parent classes ("B" and "C"), and each of those in turn inherits from a common "A" parent. If "A" provides a method `drive()`, and both "B" and "C" override (polymorph) that method, when `D` references `drive()`, which version should it use (`B:drive()` or `C:drive()`)?

还有另外一种，所谓的“钻石问题”，是说一个场景：子类“D”继承自两个父类（“B”和“C”），它们两个又继承自共通的父类“A”。如果“A”提供了方法`drive()`，而“B”和“C”都覆盖（多态地）了这个方法，那么当“D”引用`drive()`时，它应当使用那个版本呢（`B:drive()`还是`C:drive()`）？

<img src="fig2.png">

These complications go even much deeper than this quick glance. We address them here only so we can contrast to how JavaScript's mechanisms work.

事情会比我们这样快速一窥能看到的复杂得多。我们在这里把它们记下来，以便于我们可以将它和Javascript机制的工作方式比较。

JavaScript is simpler: it does not provide a native mechanism for "multiple inheritance". Many see this is a good thing, because the complexity savings more than make up for the "reduced" functionality. But this doesn't stop developers from trying to fake it in various ways, as we'll see next.

Javascript更简单：它不为“多重继承”提供原生机制。许多人认为这是好事，因为省去的复杂性要比“减少”的功能多得多。但是这并不能阻挡开发者们用各种方法来模拟它，我们接下来就看看。

## Mixins
## Mixins（混合）

JavaScript's object mechanism does not *automatically* perform copy behavior when you "inherit" or "instantiate". Plainly, there are no "classes" in JavaScript to instantiate, only objects. And objects don't get copied to other objects, they get *linked together* (more on that in Chapter 5).

当你“继承”或是“实例化”时，Javascript的对象机制不会 *自动地* 执行拷贝行为。很简单，在Javascript中没有“类”可以拿来实例化，只有对象。而且对象也不会被拷贝到另一个对象中，而是它们被 *链接在一起*（详见第五章）。

Since observed class behaviors in other languages imply copies, let's examine how JS developers **fake** the *missing* copy behavior of classes in JavaScript: mixins. We'll look at two types of "mixin": **explicit** and **implicit**.

因为在其他语言中观察到的类的行为意味着拷贝，让我们来看看JS开发者如何在Javascript中 **模拟** 这种 *丢失* 的类的拷贝行为：mixins（混合）。我们会看到两种“mixin”：**explicit（显式）** 和 **implicit（隐式）**。

### Explicit Mixins
### Explicit Mixins（显式Mixins）

Let's again revisit our `Vehicle` and `Car` example from before. Since JavaScript will not automatically copy behavior from `Vehicle` to `Car`, we can instead create a utility that manually copies. Such a utility is often called `extend(..)` by many libraries/frameworks, but we will call it `mixin(..)` here for illustrative purposes.

让我们再次重温前面的`Vehicle`和`Car`的例子。因为Javascript将不会自动地将行为从`Vehicle`拷贝到`Car`，我们可以建造一个工具来手动拷贝。这样的工具经常被许多包/框架称为`extend(..)`，但为了说明的目的，我们在这里叫它`mixin(..)`。

```js
// 大幅简化的`mixin(..)`示例：
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		// 仅拷贝非既存内容
		if (!(key in targetObj)) {
			targetObj[key] = sourceObj[key];
		}
	}

	return targetObj;
}

var Vehicle = {
	engines: 1,

	ignition: function() {
		console.log( "Turning on my engine." );
	},

	drive: function() {
		this.ignition();
		console.log( "Steering and moving forward!" );
	}
};

var Car = mixin( Vehicle, {
	wheels: 4,

	drive: function() {
		Vehicle.drive.call( this );
		console.log( "Rolling on all " + this.wheels + " wheels!" );
	}
} );
```

**Note:** Subtly but importantly, we're not dealing with classes anymore, because there are no classes in JavaScript. `Vehicle` and `Car` are just objects that we make copies from and to, respectively.

**注意：** 重要的细节：我们谈论的不再是类，因为在Javascript中没有类。`Vehicle`和`Car`分别只是我们实施拷贝的源和目标对象。

`Car` now has a copy of the properties and functions from `Vehicle`. Technically, functions are not actually duplicated, but rather *references* to the functions are copied. So, `Car` now has a property called `ignition`, which is a copied reference to the `ignition()` function, as well as a property called `engines` with the copied value of `1` from `Vehicle`.

`Car`现在拥有了一份从`Vehicle`得到的属性和函数的拷贝。技术上讲，函数实际上没有被复制，而是指向函数的 *引用* 被复制了。所以，`Car`现在有一个称为`ignition`的属性，一个`ignition()`函数引用的拷贝；而且它还有一个称为`engines`的属性，持带有从`Vehicle`拷贝来的值`1`。

`Car` *already* had a `drive` property (function), so that property reference was not overridden (see the `if` statement in `mixin(..)` above).

`Car`*已经* 有了`drive`属性（函数），所以这个属性引用没有被覆盖（参见上面`mixin(..)`的`if`语句）。

#### "Polymorphism" Revisited
#### 重温"Polymorphism（多态）"

Let's examine this statement: `Vehicle.drive.call( this )`. This is what I call "explicit pseudo-polymorphism". Recall in our previous pseudo-code this line was `inherited:drive()`, which we called "relative polymorphism".

我们来考察一下这个语句：`Vehicle.drive.call( this )`。我将之称为“explicit pseudo-polymorphism（显式假想多态）”。回想我们前一段假想代码的这一行是我们称之为“relative polymorphism（相对多态）”的`inherited:drive()`。

JavaScript does not have (prior to ES6; see Appendix A) a facility for relative polymorphism. So, **because both `Car` and `Vehicle` had a function of the same name: `drive()`**, to distinguish a call to one or the other, we must make an absolute (not relative) reference. We explicitly specify the `Vehicle` object by name, and call the `drive()` function on it.

JavaScript没有能力实现相对多态（ES6之前，见附录A）。所以，**因为`Car`和`Vehicle`都有一个名为`drive()`的函数**，为了在它们之间区别调用，我们必须使用绝对（不是相对）引用。我们明确地用名称指出`Vehicle`对象，然后在它上面调用`drive()`函数。

But if we said `Vehicle.drive()`, the `this` binding for that function call would be the `Vehicle` object instead of the `Car` object (see Chapter 2), which is not what we want. So, instead we use `.call( this )` (Chapter 2) to ensure that `drive()` is executed in the context of the `Car` object.

但如果我们说`Vehicle.drive()`，这个函数调用的`this`绑定将会是`Vehicle`对象，而不是`Car`对象（见第二章），那不是我们想要的。所以，我们使用`.call( this )`来保证`drive()`在`Car`对象的环境中被执行。

**Note:** If the function name identifier for `Car.drive()` hadn't overlapped with (aka, "shadowed"; see Chapter 5) `Vehicle.drive()`, we wouldn't have been exercising "method polymorphism". So, a reference to `Vehicle.drive()` would have been copied over by the `mixin(..)` call, and we could have accessed directly with `this.drive()`. The chosen identifier overlap **shadowing** is *why* we have to use the more complex *explicit pseudo-polymorphism* approach.

**注意：** 如果`Car.drive()`的函数名称标识符没有与`Vehicle.drive()`的重叠（也就是“遮蔽”；见第五章），我们就不会有机会演示“method polymorphism（方法多态）”。因为那样的话，一个指向`Vehicle.drive()`的引用会被`mixin(..)`调用拷贝，而我们可以使用`this.drive()`直接访问它。被选用的标识符重叠 **遮蔽** 就是为什么我们不得不使用更复杂的 *explicit pseudo-polymorphism（显式假想多态）* 的原因。

In class-oriented languages, which have relative polymorphism, the linkage between `Car` and `Vehicle` is established once, at the top of the class definition, which makes for only one place to maintain such relationships.

在拥有相对多态的面向类的语言中，`Car`和`Vehicle`间的连接被建立一次，就在类定义的顶端，这里是维护这种关系的唯一场所。

But because of JavaScript's peculiarities, explicit pseudo-polymorphism (because of shadowing!) creates brittle manual/explicit linkage **in every single function where you need such a (pseudo-)polymorphic reference**. This can significantly increase the maintenance cost. Moreover, while explicit pseudo-polymorphism can emulate the behavior of "multiple inheritance", it only increases the complexity and brittleness.

但是由于JavaScript的特殊性，显式假想多态（因为遮蔽！） **在每一个你需要这种（假想）多态引用的函数中** 建立了一种脆弱的手动/显式链接。这可能会显著地增加维护成本。而且，虽然显式假想多态可以模拟“多重继承”的行为，但这只会增加复杂性和脆弱性。

The result of such approaches is usually more complex, harder-to-read, *and* harder-to-maintain code. **Explicit pseudo-polymorphism should be avoided wherever possible**, because the cost outweighs the benefit in most respects.

这种方法的结果通常是一个更加复杂，难读懂，*而且* 难维护的代码。**应当尽可能地避免使用显式假想多态**，因为在大部分层面上它的代价要高于利益。

#### Mixing Copies
#### Mixing Copies（混合拷贝）

Recall the `mixin(..)` utility from above:
回忆上面的`mixin(..)`工具：

```js
// vastly simplified `mixin()` example:
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		// only copy if not already present
		if (!(key in targetObj)) {
			targetObj[key] = sourceObj[key];
		}
	}

	return targetObj;
}
```

Now, let's examine how `mixin(..)` works. It iterates over the properties of `sourceObj` (`Vehicle` in our example) and if there's no matching property of that name in `targetObj` (`Car` in our example), it makes a copy. Since we're making the copy after the initial object exists, we are careful to not copy over a target property.

现在，我们考察一下`mixin(..)`如何工作。它迭代`sourceObj`（在我们的例子中是`Vehicle`）的所有属性，如果在`targetObj` (在我们的例子中是`Car`)中没有名称与之匹配的属性，它就进行拷贝。因为我们是在初始对象存在的情况下进行拷贝，所以我们要小心不要将目标属性覆盖掉。

If we made the copies first, before specifying the `Car` specific contents, we could omit this check against `targetObj`, but that's a little more clunky and less efficient, so it's generally less preferred:

如果在指明`Car`的具体内容之前，我们先进行拷贝，那么我们就可以省略对`targetObj`检查，但是这样做有些笨重且低效，所以通常不优先选用：

```js
// alternate mixin, less "safe" to overwrites
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		targetObj[key] = sourceObj[key];
	}

	return targetObj;
}

var Vehicle = {
	// ...
};

// first, create an empty object with
// Vehicle's stuff copied in
var Car = mixin( Vehicle, { } );

// now copy the intended contents into Car
mixin( {
	wheels: 4,

	drive: function() {
		// ...
	}
}, Car );
```

Either approach, we have explicitly copied the non-overlapping contents of `Vehicle` into `Car`. The name "mixin" comes from an alternate way of explaining the task: `Car` has `Vehicle`s contents **mixed-in**, just like you mix in chocolate chips into your favorite cookie dough.

不论哪种方法，我们都显式地将`Vehicle`中的非重叠内容拷贝到`Car`中。“mixin”这个名称来自于解释这个任务的另一种方法：`Car`**混入**`Vehicle`的内容，就像你吧巧克力碎片混入你最喜欢的曲奇饼面团。

As a result of the copy operation, `Car` will operate somewhat separately from `Vehicle`. If you add a property onto `Car`, it will not affect `Vehicle`, and vice versa.

这个拷贝操作的结果，是`Car`将会独立于`Vehicle`运行。如果你在`Car`上添加属性，它不会影响到`Vehicle`，反之亦然。

**Note:** A few minor details have been skimmed over here. There are still some subtle ways the two objects can "affect" each other even after copying, such as if they both share a reference to a common object (such as an array).

**注意：** 这里有几个小细节被忽略了。仍然有一些微妙的方法使两个对象在拷贝完成后还能互相“影响”对方，就好像他们共享一个共通对象（比如数组）的引用一样。

Since the two objects also share references to their common functions, that means that **even manual copying of functions (aka, mixins) from one object to another doesn't *actually emulate* the real duplication from class to instance that occurs in class-oriented languages**.

由于两个对象还共享它们的共通函数的引用，这意味着 **即便手动将函数从一个对象拷贝（也就是混入）到另一个对象中，也不能 *实际上模拟* 发生在面向类的语言中的从类到实例的真正的复制 **。

JavaScript functions can't really be duplicated (in a standard, reliable way), so what you end up with instead is a **duplicated reference** to the same shared function object (functions are objects; see Chapter 3). If you modified one of the shared **function objects** (like `ignition()`) by adding properties on top of it, for instance, both `Vehicle` and `Car` would be "affected" via the shared reference.



Explicit mixins are a fine mechanism in JavaScript. But they appear more powerful than they really are. Not much benefit is *actually* derived from copying a property from one object to another, **as opposed to just defining the properties twice**, once on each object. And that's especially true given the function-object reference nuance we just mentioned.

If you explicitly mix-in two or more objects into your target object, you can **partially emulate** the behavior of "multiple inheritance", but there's no direct way to handle collisions if the same method or property is being copied from more than one source. Some developers/libraries have come up with "late binding" techniques and other exotic work-arounds, but fundamentally these "tricks" are *usually* more effort (and lesser performance!) than the pay-off.

Take care only to use explicit mixins where it actually helps make more readable code, and avoid the pattern if you find it making code that's harder to trace, or if you find it creates unnecessary or unwieldy dependencies between objects.

**If it starts to get *harder* to properly use mixins than before you used them**, you should probably stop using mixins. In fact, if you have to use a complex library/utility to work out all these details, it might be a sign that you're going about it the harder way, perhaps unnecessarily. In Chapter 6, we'll try to distill a simpler way that accomplishes the desired outcomes without all the fuss.

#### Parasitic Inheritance

A variation on this explicit mixin pattern, which is both in some ways explicit and in other ways implicit, is called "parasitic inheritance", popularized mainly by Douglas Crockford.

Here's how it can work:

```js
// "Traditional JS Class" `Vehicle`
function Vehicle() {
	this.engines = 1;
}
Vehicle.prototype.ignition = function() {
	console.log( "Turning on my engine." );
};
Vehicle.prototype.drive = function() {
	this.ignition();
	console.log( "Steering and moving forward!" );
};

// "Parasitic Class" `Car`
function Car() {
	// first, `car` is a `Vehicle`
	var car = new Vehicle();

	// now, let's modify our `car` to specialize it
	car.wheels = 4;

	// save a privileged reference to `Vehicle::drive()`
	var vehDrive = car.drive;

	// override `Vehicle::drive()`
	car.drive = function() {
		vehDrive.call( this );
		console.log( "Rolling on all " + this.wheels + " wheels!" );
	};

	return car;
}

var myCar = new Car();

myCar.drive();
// Turning on my engine.
// Steering and moving forward!
// Rolling on all 4 wheels!
```

As you can see, we initially make a copy of the definition from the `Vehicle` "parent class" (object), then mixin our "child class" (object) definition (preserving privileged parent-class references as needed), and pass off this composed object `car` as our child instance.

**Note:** when we call `new Car()`, a new object is created and referenced by `Car`s `this` reference (see Chapter 2). But since we don't use that object, and instead return our own `car` object, the initially created object is just discarded. So, `Car()` could be called without the `new` keyword, and the functionality above would be identical, but without the wasted object creation/garbage-collection.

### Implicit Mixins

Implicit mixins are closely related to *explicit pseudo-polymorphism* as explained previously. As such, they come with the same caveats and warnings.

Consider this code:

```js
var Something = {
	cool: function() {
		this.greeting = "Hello World";
		this.count = this.count ? this.count + 1 : 1;
	}
};

Something.cool();
Something.greeting; // "Hello World"
Something.count; // 1

var Another = {
	cool: function() {
		// implicit mixin of `Something` to `Another`
		Something.cool.call( this );
	}
};

Another.cool();
Another.greeting; // "Hello World"
Another.count; // 1 (not shared state with `Something`)
```

With `Something.cool.call( this )`, which can happen either in a "constructor" call (most common) or in a method call (shown here), we essentially "borrow" the function `Something.cool()` and call it in the context of `Another` (via its `this` binding; see Chapter 2) instead of `Something`. The end result is that the assignments that `Something.cool()` makes are applied against the `Another` object rather than the `Something` object.

So, it is said that we "mixed in" `Something`s behavior with (or into) `Another`.

While this sort of technique seems to take useful advantage of `this` rebinding functionality, it is the brittle `Something.cool.call( this )` call, which cannot be made into a relative (and thus more flexible) reference, that you should **heed with caution**. Generally, **avoid such constructs where possible** to keep cleaner and more maintainable code.

## Review (TL;DR)

Classes are a design pattern. Many languages provide syntax which enables natural class-oriented software design. JS also has a similar syntax, but it behaves **very differently** from what you're used to with classes in those other languages.

**Classes mean copies.**

When traditional classes are instantiated, a copy of behavior from class to instance occurs. When classes are inherited, a copy of behavior from parent to child also occurs.

Polymorphism (having different functions at multiple levels of an inheritance chain with the same name) may seem like it implies a referential relative link from child back to parent, but it's still just a result of copy behavior.

JavaScript **does not automatically** create copies (as classes imply) between objects.

The mixin pattern (both explicit and implicit) is often used to *sort of* emulate class copy behavior, but this usually leads to ugly and brittle syntax like explicit pseudo-polymorphism (`OtherObj.methodName.call(this, ...)`), which often results in harder to understand and maintain code.

Explicit mixins are also not exactly the same as class *copy*, since objects (and functions!) only have shared references duplicated, not the objects/functions duplicated themselves. Not paying attention to such nuance is the source of a variety of gotchas.

In general, faking classes in JS often sets more landmines for future coding than solving present *real* problems.
