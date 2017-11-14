# 你不懂JS: *this* 与对象原型
# 第六章: 行为委托

在第五章中，我们详细地讨论了 `[[Prototype]]` 机制，和 *为什么* 对于描述“类”或“继承”来说它是那么使人糊涂和不合适。我们一路跋涉，不仅涉及了相当繁冗的语法（使代码凌乱的 `.prototype`），还有各种陷阱（比如使人吃惊的 `.constructor` 解析和难看的假想多态语法）。我们探索了许多人试图用抹平这些粗糙的区域而使用的各种“mixin”方法。

这时一个常见的反应是，想知道为什么这些看起来如此简单的事情这么复杂。现在我们已经拉开帷幕看到了它是多么麻烦，这并不奇怪：大多数 JS 开发者从不探究得这么深，而将这一团糟交给一个“类”包去帮他们处理。

我希望到现在你不会甘心于敷衍了事并把这样的细节丢给一个“黑盒”库。现在我们来深入讲解我们 *如何与应当如何* 以一种比类造成的困惑 **简单得多而且更直接的方式** 来考虑 JS 中对象的 `[[Prototype]]` 机制。

简单地复习一下第五章的结论，`[[Prototype]]` 机制是一种存在于一个对象上的内部链接，它指向一个其他对象。

当一个属性/方法引用在一个对象上发生，而这样的属性/方法又不存在时，这个链接就会被使用。在这种情况下，`[[Prototype]]` 链接告诉引擎去那个被链接的对象上寻找该属性/方法。接下来，如果那个对象也不能满足查询，就沿着它的 `[[Prototype]]` 查询，如此继续。这种对象间的一系列链接构成了所谓的“原形链”。

换句话说，对于我们能在 JavaScript 中利用的功能的实际机制来说，其重要的实质 **全部在于被连接到其他对象的对象。**

这个观点是理解本章其余部分的动机和方法的重要基础！

## 迈向面向委托的设计

为了将我们的思想恰当地集中在如何用最直截了当的方法使用 `[[Prototype]]`，我们必须认识到它代表一种根本上与类不同的设计模式（见第四章）。

**注意** *某些* 面向类的设计依然是很有效的，所以不要扔掉你知道的每一件事（扔掉大多数就行了！）。比如，*封装* 就十分强大，而且与委托是兼容的（虽然不那么常见）。

我们需要试着将我们的思维从类/继承的设计模式转变为行为代理设计模式。如果你已经使用你在教育/工作生涯中思考类的方式做了大多数或所有的编程工作，这可能感觉不舒服或不自然。你可能需要尝试这种思维过程好几次，才能适应这种非常不同的思考方式。

我将首先带你进行一些理论练习，之后我们会一对一地看一些更实际的例子来为你自己的代码提供实践环境。

### 类理论

比方说我们有几个相似的任务（“XYZ”，“ABC”，等）需要在我们的软件中建模。

使用类，你设计这个场景的方式是：定义一个泛化的父类（基类）比如 `Task`，为所有的“同类”任务定义共享的行为。然后，你定义子类 `XYZ` 和 `ABC`，它们都继承自 `Task`，每个都分别添加了特化的行为来处理各自的任务。

**重要的是，** 类设计模式将鼓励你发挥继承的最大功效，当你在 `XYZ` 任务中覆盖 `Task` 的某些泛化方法的定义时，你将会想利用方法覆盖（和多态），也许会利用 `super` 来调用这个方法的泛化版本，为它添加更多的行为。**你很可能会找到几个这样的地方：可以“抽象”到父类中，并在子类中特化（覆盖）的一般化行为。**。

这是一些关于这个场景的假想代码：

```js
class Task {
	id;

	// `Task()` 构造器
	Task(ID) { id = ID; }
	outputTask() { output( id ); }
}

class XYZ inherits Task {
	label;

	// `XYZ()` 构造器
	XYZ(ID,Label) { super( ID ); label = Label; }
	outputTask() { super(); output( label ); }
}

class ABC inherits Task {
	// ...
}
```

现在，你可以初始化一个或多个 `XYZ` 子类的 **拷贝**，并且使用这些实例来执行“XYZ”任务。这些实例已经 **同时拷贝** 了泛化的 `Task` 定义的行为和具体的 `XYZ` 定义的行为。类似地，`ABC` 类的实例将拷贝 `Task` 的行为和具体的 `ABC` 的行为。在构建完成之后，你通常仅会与这些实例交互（而不是类），因为每个实例都拷贝了完成计划任务的所有行为。

### 委托理论

但是现在让我们试着用 *行为委托* 代替 *类* 来思考同样的问题。

你将首先定义一个称为 `Task` 的 **对象**（不是一个类，也不是一个大多数 JS 开发者想让你相信的 `function`），而且它将拥有具体的行为，这些行为包含各种任务可以使用的（读作：*委托至*！）工具方法。然后，对于每个任务（“XYZ”，“ABC”），你定义一个 **对象** 来持有这个特定任务的数据/行为。你 **链接** 你的特定任务对象到 `Task` 工具对象，允许它们在必要的时候可以委托到它。

基本上，你认为执行任务“XYZ”就是从两个兄弟/对等的对象（`XYZ` 和 `Task`）中请求行为来完成它。与其通过类的拷贝将它们组合在一起，我们可以将它们保持在分离的对象中，而且可以在需要的情况下允许 `XYZ` 对象 **委托到** `Task`。

这里是一些简单的代码，示意你如何实现它：

```js
var Task = {
	setID: function(ID) { this.id = ID; },
	outputID: function() { console.log( this.id ); }
};

// 使 `XYZ` 委托到 `Task`
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

在这段代码中，`Task` 和 `XYZ`不是类（也不是函数），它们 **仅仅是对象**。`XYZ` 通过 `Object.create()` 创建，来 `[[Prototype]]` 委托到 `Task` 对象（见第五章）。

作为与面向类（也就是，OO —— 面向对象）的对比，我称这种风格的代码为 **“OLOO”**（objects-linked-to-other-objects（链接到其他对象的对象））。所有我们 *真正* 关心的是，对象 `XYZ` 委托到对象 `Task`（对象 `ABC` 也一样）。

在 JavaScript 中，`[[Prototype]]` 机制将 **对象** 链接到其他 **对象**。无论你多么想说服自己这不是真的，JavaScript 没有像“类”那样的抽象机制。这就像逆水行舟：你 *可以* 做到，但你 *选择* 了逆流而上，所以很明显地，**你会更困难地达到目的地。**

**OLOO 风格的代码** 中有一些需要注意的不同：

1. 前一个类的例子中的 `id` 和 `label` 数据成员都是 `XYZ` 上的直接数据属性（它们都不在 `Task` 上）。一般来说，当 `[[Prototype]]` 委托引入时，**你想使状态保持在委托者上**（`XYZ`，`ABC`），不是在委托上（`Task`）。
2. 在类的设计模式中，我们故意在父类（`Task`）和子类（`XYZ`）上采用相同的命名 `outputTask`，以至于我们可以利用覆盖（多态）。在委托的行为中，我们反其道而行之：**我们尽一切可能避免在 `[[Prototype]]` 链的不同层级上给出相同的命名**（称为“遮蔽” —— 见第五章），因为这些命名冲突会导致尴尬/脆弱的语法来消除引用的歧义（见第四章），而我们想避免它。
	 这种设计模式不那么要求那些倾向于被覆盖的泛化的方法名，而是要求针对于每个对象的 *具体* 行为类型给出更具描述性的方法名。**这实际上会产生更易于理解/维护的代码**，因为方法名（不仅在定义的位置，而是扩散到其他代码中）变得更加明白（代码即文档）。
3. `this.setID(ID);` 位于对象 `XYZ` 的一个方法内部，它首先在 `XYZ` 上查找 `setID(..)`，但因为它不能在 `XYZ` 上找到叫这个名称的方法，`[[Prototype]]` 委托意味着它可以沿着链接到 `Task` 来寻找 `setID()`，这样当然就找到了。另外，由于调用点的隐含 `this` 绑定规则（见第二章），当 `setID()` 运行时，即便方法是在 `Task` 上找到的，这个函数调用的 `this` 绑定依然是我们期望和想要的 `XYZ`。我们在代码稍后的 `this.outputID()` 中也看到了同样的事情。
	 换句话说，我们可以使用存在于 `Task` 上的泛化工具与 `XYZ` 互动，因为 `XYZ` 可以委托至 `Task`。

**行为委托** 意味着：在某个对象（`XYZ`）的属性或方法没能在这个对象（`XYZ`）上找到时，让这个对象（`XYZ`）为属性或方法引用提供一个委托（`Task`）。

这是一个 *极其强大* 的设计模式，与父类和子类，继承，多态等有很大的不同。与其在你的思维中纵向地，从上面父类到下面子类地组织对象，你应当并列地，对等地考虑对象，而且对象间拥有方向性的委托链接。

**注意：** 委托更适于作为内部实现的细节，而不是直接暴露在 API 接口的设计中。在上面的例子中，我们的 API 设计没必要有意地让开发者调用 `XYZ.setID()`（当然我们可以！）。我们以某种隐藏的方式将委托作为我们 API 的内部细节，即 `XYZ.prepareTask(..)` 委托到 `Task.setID(..)`。详细的内容，参照第五章的“链接作为候补？”中的讨论。

#### 相互委托（不允许）

你不能在两个或多个对象间相互地委托（双向地）对方来创建一个 *循环* 。如果你使 `B` 链接到 `A`，然后试着让 `A` 链接到 `B`，那么你将得到一个错误。

这样的事情不被允许有些可惜（不是非常令人惊讶，但稍稍有些恼人）。如果你制造一个在任意一方都不存在的属性/方法引用，你就会在 `[[Prototype]]` 上得到一个无限递归的循环。但如果所有的引用都严格存在，那么 `B` 就可以委托至 `A`，或相反，而且它可以工作。这意味着你可以为了多种任务用这两个对象互相委托至对方。有一些情况这可能会有用。

但它不被允许是因为引擎的实现者发现，在设置时检查（并拒绝！）无限循环引用一次，要比每次你在一个对象上查询属性时都做相同检查的性能要高。

#### 调试

我们将简单地讨论一个可能困扰开发者的微妙的细节。一般来说，JS 语言规范不会控制浏览器开发者工具如何向开发者表示指定的值/结构，所以每种浏览器/引擎都自由地按需要解释这个事情。因此，浏览器/工具 *不总是意见统一*。特别地，我们现在要考察的行为就是当前仅在 Chrome 的开发者工具中观察到的。

考虑这段传统的“类构造器”风格的 JS 代码，正如它将在 Chrome 开发者工具 *控制台* 中出现的：

```js
function Foo() {}

var a1 = new Foo();

a1; // Foo {}
```

让我们看一下这个代码段的最后一行：对表达式 `a1` 进行求值的输出，打印 `Foo {}`。如果你在 FireFox 中试用同样的代码，你很可能会看到 `Object {}`。为什么会有不同？这些输出意味着什么？

Chrome 实质上在说“{} 是一个由名为‘Foo’的函数创建的空对象”。Firefox 在说“{} 是一个由 Object 普通构建的空对象”。这种微妙的区别是因为 Chrome 在像一个 *内部属性* 一样，动态跟踪执行创建的实际方法的名称，而其他浏览器不会跟踪这样的附加信息。

试图用 JavaScript 机制来解释它很吸引人：

```js
function Foo() {}

var a1 = new Foo();

a1.constructor; // Foo(){}
a1.constructor.name; // "Foo"
```

那么，Chrome 就是通过简单地查看对象的 `.Constructor.name` 来输出“Foo”的？令人费解的是，答案既是“是”也是“不”。

考虑下面的代码：

```js
function Foo() {}

var a1 = new Foo();

Foo.prototype.constructor = function Gotcha(){};

a1.constructor; // Gotcha(){}
a1.constructor.name; // "Gotcha"

a1; // Foo {}
```

即便我们将 `a1.constructor.name` 合法地改变为其他的东西（“Gotcha”），Chrome 控制台依旧使用名称“Foo”。

那么，说明前面问题（它使用 `.constructor.name` 吗？）的答案是 **不**，它一定在内部追踪其他的什么东西。

但是，且慢！让我们看看这种行为如何与 OLOO 风格的代码一起工作：

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

啊哈！**Gotcha**，Chrome 的控制台 **确实** 寻找并且使用了 `.constructor.name`。实际上，就在写这本书的时候，这个行为被认定为是 Chrome 的一个 Bug，而且就在你读到这里的时候，它可能已经被修复了。所以你可能已经看到了被修改过的 `a1; // Object{}`。

这个 bug 暂且不论，Chrome 执行的（刚刚在代码段中展示的）“构造器名称”内部追踪（目前仅用于调试输出的目的），是一个仅在 Chrome 内部存在的扩张行为，它已经超出了 JS 语言规范要求的范围。

如果你不使用“构造器”来制造你的对象，就像我们在本章的 OLOO 风格代码中不鼓励的那样，那么你将会得到一个 Chrome 不会为其追踪内部“构造器名称”的对象，所以这样的对象将正确地仅仅被输出“Object {}”，意味着“从 Object() 构建生成的对象”。

**不要认为** 这代表一个 OLOO 风格代码的缺点。当你用 OLOO 编码而且用行为委托作为你的设计模式时，*谁* “创建了”（也就是，*哪个函数* 被和 `new` 一起调用了？）一些对象是一个无关的细节。Chrome 特殊的内部“构造器名称”追踪仅仅在你完全接受“类风格”编码时才有用，而在你接受 OLOO 委托时是没有意义的。

### 思维模型比较

现在你至少在理论上可以看到“类”和“委托”设计模式的不同了，让我们看看这些设计模式在我们用来推导我们代码的思维模型上的含义。

我们将查看一些更加理论上的（“Foo”，“Bar”）代码，然后比较两种方法（OO vs. OLOO）的代码实现。第一段代码使用经典的（“原型的”）OO 风格：

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

父类 `Foo`，被子类 `Bar` 继承，之后 `Bar` 被初始化两次：`b1` 和 `b2`。我们得到的是 `b1` 委托至 `Bar.prototype`，`Bar.prototype` 委托至 `Foo.prototype`。这对你来说应当看起来十分熟悉。没有太具开拓性的东西发生。

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

我们利用了完全相同的从 `Bar` 到 `Foo` 的 `[[Prototype]]` 委托，正如我们在前一个代码段中 `b1`，`Bar.prototype`，和 `Foo.prototype` 之间那样。**我们仍然有三个对象链接在一起**。

但重要的是，我们极大地简化了发生的 *所有其他事项*，因为我们现在仅仅建立了相互链接的 **对象**，而不需要所有其他讨厌且困惑的看起来像类（但动起来不像）的东西，还有构造器，原型和 `new` 调用。

问问你自己：如果我能用 OLOO 风格代码得到我用“类”风格代码得到的一样的东西，但 OLOO 更简单而且需要考虑的事情更少，**OLOO 不是更好吗**？

让我们讲解一下这两个代码段间涉及的思维模型。

首先，类风格的代码段意味着这样的实体与它们的关系的思维模型：

<img src="fig4.png">

实际上，这有点儿不公平/误导，因为它展示了许多额外的，你在 *技术上* 一直不需要知道（虽然你 *需要* 理解它）的细节。一个关键是，它是一系列十分复杂的关系。但另一个关键是：如果你花时间来沿着这些关系的箭头走，在 JS 的机制中 **有数量惊人的内部统一性**。

例如，JS 函数可以访问 `call(..)`，`apply(..)` 和 `bind(..)`（见第二章）的能力是因为函数本身是对象，而函数对象还拥有一个 `[[Prototype]]` 链接，链到 `Function.prototype` 对象，它定义了那些任何函数对象都可以委托到的默认方法。JS 可以做这些事情，*你也能！*

好了，现在让我们看一个这张图的 *稍稍* 简化的版本，用它来进行比较稍微“公平”一点 —— 它仅展示了 *相关* 的实体与关系。

<img src="fig5.png">

仍然非常复杂，对吧？虚线描绘了当你在 `Foo.prototype` 和 `Bar.prototype` 间建立“继承”时的隐含关系，而且还没有 *修复* **丢失的** `.constructor` 属性引用（见第五章“复活构造器”）。即便将虚线去掉，每次你与对象链接打交道时，这个思维模型依然要变很多可怕的戏法。

现在，让我们看看 OLOO 风格代码的思维模型：

<img src="fig6.png">

正如你比较它们所得到的，十分明显，OLOO 风格的代码 *需要关心的东西少太多了*，因为 OLOO 风格代码接受了 **事实**：我们唯一需要真正关心的事情是 **链接到其他对象的对象**。

所有其他“类”的烂设计用一种令人费解而且复杂的方式得到相同的结果。去掉那些东西，事情就变得简单得多（还不会失去任何功能）。

## Classes vs. Objects

我们已经看到了各种理论的探索和“类”与“行为委托”的思维模型的比较。现在让我们来看看更具体的代码场景，来展示你如何实际应用这些想法。

我们将首先讲解一种在前端网页开发中的典型场景：建造 UI 部件（按钮，下拉列表等等）。

### Widget “类”

因为你可能还是如此地习惯于 OO 设计模式，你很可能会立即这样考虑这个问题：一个父类（也许称为 `Widget`）拥有所有共通的基本部件行为，然后衍生的子类拥有具体的部件类型（比如 `Button`）。

**注意：** 为了 DOM 和 CSS 的操作，我们将在这里使用 JQuery，这仅仅是因为对于我们现在的讨论，它不是一个我们真正关心的细节。这些代码中不关心你用哪个 JS 框架（JQuery，Dojo，YUI 等等）来解决如此无趣的问题。

让我们来看看，在没有任何“类”帮助库或语法的情况下，我们如何用经典风格的纯 JS 来实现“类”设计：

```js
// 父类
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

// 子类
function Button(width,height,label) {
	// "super"构造器调用
	Widget.call( this, width, height );
	this.label = label || "Default";

	this.$elem = $( "<button>" ).text( this.label );
}

// 使 `Button` “继承” `Widget`
Button.prototype = Object.create( Widget.prototype );

// 覆盖“继承来的” `render(..)`
Button.prototype.render = function($where) {
	// "super"调用
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

OO 设计模式告诉我们要在父类中声明一个基础 `render(..)`，之后在我们的子类中覆盖它，但不是完全替代它，而是用按钮特定的行为增强这个基础功能。

注意 *显式假想多态* 的丑态，`Widget.call` 和 `Widget.prototype.render.call` 引用是为了伪装从子“类”方法得到“父类”基础方法支持的“super”调用。呃。

#### ES6 `class` 语法糖

我们会在附录A中讲解 ES6 的 `class` 语法糖，但是让我们演示一下我们如何用 `class` 来实现相同的代码。

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

毋庸置疑，通过使用 ES6 的 `class`，许多前面经典方法中难看的语法被改善了。`super(..)` 的存在看起来非常适宜（但当你深入挖掘它时，不全是好事！）。

除了语法上的改进，**这些都不是 *真正的* 类**，因为它们仍然工作在 `[[Prototype]]` 机制之上。它们依然会受到思维模型不匹配的拖累，就像我们在第四，五章中，和直到现在探索的那样。附录A将会详细讲解 ES6 `class` 语法和它的含义。我们将会看到为什么解决语法上的小问题不会实质上解决我们在 JS 中的类的困惑，虽然它做出了勇敢的努力假装解决了问题！

无论你是使用经典的原型语法还是新的 ES6 语法糖，你依然选择了使用“类”来对问题（UI 部件）进行建模。正如我们前面几章试着展示的，在 JavaScript 中做这个选择会带给你额外的头疼和思维上的弯路。

### 委托部件对象

这是我们更简单的 `Widget`/`Button` 例子，使用了 **OLOO 风格委托**：

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

使用这种 OLOO 风格的方法，我们不认为 `Widget` 是一个父类而 `Button` 是一个子类，`Widget` **只是一个对象** 和某种具体类型的部件也许想要代理到的工具的集合，而且 `Button` **也只是一个独立的对象**（当然，带有委托至 `Widget` 的链接！）。

从设计模式的角度来看，我们 **没有** 像类的方法建议的那样，在两个对象中共享相同的 `render(..)` 方法名称，而是选择了更能描述每个特定任务的不同的名称。同样的原因，*初始化* 方法被分别称为 `init(..)` 和 `setup(..)`。

不仅委托设计模式建议使用不同而且更具描述性的名称，而且在 OLOO 中这样做会避免难看的显式假想多态调用，正如你可以通过简单，相对的 `this.init(..)` 和 `this.insert(..)` 委托调用看到的。

语法上，我们也没有任何构造器，`.prototype` 或者 `new` 出现，它们事实上是不必要的设计。

现在，如果你再细心考察一下，你可能会注意到之前仅有一个调用（`var btn1 = new Button(..)`），而现在有了两个（`var btn1 = Object.create(Button)` 和 `btn1.setup(..)`）。这猛地看起来像是一个缺点（代码变多了）。

然而，即便是这样的事情，和经典原型风格比起来也是 **OLOO 风格代码的优点**。为什么？

用类的构造器，你“强制”（不完全是这样，但是被强烈建议）构建和初始化在同一个步骤中进行。然而，有许多种情况，能够将这两步分开做（就像你在 OLOO 中做的）更灵活。

举个例子，我们假定你在程序的最开始，在一个池中创建所有的实例，但你等到在它们被从池中找出并使用之前再用指定的设置初始化它们。我们的例子中，这两个调用紧挨在一起，当然它们也可以按需要发生在非常不同的时间和代码中非常不同的部分。

**OLOO** 对关注点分离原则有 *更好* 的支持，也就是创建和初始化没有必要合并在同一个操作中。

## 更简单的设计

OLOO 除了提供表面上更简单（而且更灵活！）的代码之外，行为委托作为一个模式实际上会带来更简单的代码架构。让我们讲解最后一个例子来说明 OLOO 是如何简化你的整体设计的。

这个场景中我们将讲解两个控制器对象，一个用来处理网页的登录 form（表单），另一个实际处理服务器的认证（通信）。

我们需要帮助工具来进行与服务器的 Ajax 通信。我们将使用 JQuery（虽然其他的框架都可以），因为它不仅为我们处理 Ajax，而且还返回一个类似 Promise 的应答，这样我们就可以在代码中使用 `.then(..)` 来监听这个应答。

**注意：** 我们不会再这里讲到 Promise，但我们会在以后的 *你不懂 JS* 系列中讲到。

根据典型的类的设计模式，我们在一个叫做 `Controller` 的类中将任务分解为基本功能，之后我们会衍生出两个子类，`LoginController` 和 `AuthController`，它们都继承自 `Controller` 而且特化某些基本行为。

```js
// 父类
function Controller() {
	this.errors = [];
}
Controller.prototype.showDialog = function(title,msg) {
	// 在对话框中给用户显示标题和消息
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
// 子类
function LoginController() {
	Controller.call( this );
}
// 将子类链接到父类
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

	// 到这里了？输入合法！
	return true;
};
// 覆盖来扩展基本的 `failure()`
LoginController.prototype.failure = function(err) {
	// "super"调用
	Controller.prototype.failure.call( this, "Login invalid: " + err );
};
```

```js
// 子类
function AuthController(login) {
	Controller.call( this );
	// 除了继承外，我们还需要合成
	this.login = login;
}
// 将子类链接到父类
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
// 覆盖以扩展基本的 `success()`
AuthController.prototype.success = function() {
	// "super"调用
	Controller.prototype.success.call( this, "Authenticated!" );
};
// 覆盖以扩展基本的 `failure()`
AuthController.prototype.failure = function(err) {
	// "super"调用
	Controller.prototype.failure.call( this, "Auth Failed: " + err );
};
```

```js
var auth = new AuthController(
	// 除了继承，我们还需要合成
	new LoginController()
);
auth.checkAuth();
```

我们有所有控制器分享的基本行为，它们是 `success(..)`，`failure(..)` 和 `showDialog(..)`。我们的子类 `LoginController` 和 `AuthController` 覆盖了 `failure(..)` 和 `success(..)` 来增强基本类的行为。还要注意的是，`AuthController` 需要一个 `LoginController` 实例来与登录 form 互动，所以它变成了一个数据属性成员。

另外一件要提的事情是，我们选择一些 *合成* 散布在继承的顶端。`AuthController` 需要知道 `LoginController`，所以我们初始化它（`new LoginController()`），并用一个称为 `this.login` 的类属性成员来引用它，这样 `AuthController` 才可以调用 `LoginController` 上的行为。

**注意：** 这里可能会存在一丝冲动，就是使 `AuthController` 继承 `LoginController`，或者反过来，这样的话我们就会通过继承链得到 *虚拟合成*。但是这是一个非常清晰的例子，表明对这个问题来讲，将类继承作为模型有什么问题，因为 `AuthController` 和 `LoginController` 都不特化对方的行为，所以它们之间的继承没有太大的意义，除非类是你唯一的设计模式。与此相反的是，我们在一些简单的合成中分层，然后它们就可以合作了，同时它俩都享有继承自父类 `Controller` 的好处。

如果你熟悉面向类（OO）的设计，这都应该看起来十分熟悉和自然。

### 去类化

但是，我们真的需要用一个父类，两个子类，和一些合成来对这个问题建立模型吗？有办法利用 OLOO 风格的行为委托得到 *简单得多* 的设计吗？**有的！**

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

		// 到这里了？输入合法！
		return true;
	},
	showDialog: function(title,msg) {
		// 在对话框中向用于展示成功消息
	},
	failure: function(err) {
		this.errors.push( err );
		this.showDialog( "Error", "Login invalid: " + err );
	}
};
```

```js
// 链接`AuthController`委托到`LoginController`
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

因为 `AuthController` 只是一个对象（`LoginController` 也是），我们不需要初始化（比如 `new AuthController()`）就能执行我们的任务。所有我们要做的是：

```js
AuthController.checkAuth();
```

当然，通过 OLOO，如果你确实需要在委托链上创建一个或多个附加的对象时也很容易，而且仍然不需要任何像类实例化那样的东西：

```js
var controller1 = Object.create( AuthController );
var controller2 = Object.create( AuthController );
```

使用行为委托，`AuthController` 和 `LoginController` **仅仅是对象**，互相是 *水平* 对等的，而且没有被安排或关联成面向类中的父与子。我们有些随意地选择让 `AuthController` 委托至 `LoginController` —— 相反方向的委托也同样是有效的。

第二个代码段的主要要点是，我们只拥有两个实体（`LoginController` and `AuthController`），而 **不是之前的三个**。

我们不需要一个基本的 `Controller` 类来在两个子类间“分享”行为，因为委托是一种可以给我们所需功能的，足够强大的机制。同时，就像之前注意的，我们也不需要实例化我们的对象来使它们工作，因为这里没有类，**只有对象自身。** 另外，这里不需要 *合成* 作为委托来给两个对象 *差异化* 地合作的能力。

最后，由于没有让名称 `success(..)` 和 `failure(..)` 在两个对象上相同，我们避开了面向类的设计的多态陷阱：它将会需要难看的显式假想多态。相反，我们在 `AuthController` 上称它们为 `accepted()` 和 `rejected(..)` —— 对于它们的具体任务来说，稍稍更具描述性的名称。

**底线：** 我们最终得到了相同的结果，但是用了（显著的）更简单的设计。这就是 OLOO 风格代码和 *行为委托* 设计模式的力量。

## 更好的语法

一个使 ES6 `class` 看似如此诱人的更好的东西是（见附录A来了解为什么要避免它！），声明类方法的速记语法：

```js
class Foo {
	methodName() { /* .. */ }
}
```

我们从声明中扔掉了单词 `function`，这使所有的 JS 开发者欢呼！

你可能已经注意到，而且为此感到沮丧：上面推荐的 OLOO 语法出现了许多 `function`，这看起来像是对 OLOO 简化目标的诋毁。**但它不必是！**

在 ES6 中，我们可以在任何字面对象中使用 *简约方法声明*，所以一个 OLOO 风格的对象可以用这种方式声明（与 `class` 语法中相同的语法糖）：

```js
var LoginController = {
	errors: [],
	getUser() { // 看，没有 `function`！
		// ...
	},
	getPassword() {
		// ...
	}
	// ...
};
```

唯一的区别是字面对象的元素间依然需要 `,` 逗号分隔符，而 `class` 语法不必如此。这是在整件事情上很小的让步。

还有，在 ES6 中，一个你使用的更笨重的语法（比如 `AuthController` 的定义中）：你一个一个地给属性赋值而不使用字面对象，可以改写为使用字面对象（于是你可以使用简约方法），而且你可以使用 `Object.setPrototypeOf(..)` 来修改对象的 `[[Prototype]]`，像这样：

```js
// 使用更好的字面对象语法 w/ 简约方法！
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

// 现在, 链接 `AuthController` 委托至 `LoginController`
Object.setPrototypeOf( AuthController, LoginController );
```

ES6 中的 OLOO 风格，与简明方法一起，变得比它以前 **友好得多**（即使在以前，它也比经典的原型风格代码简单好看的多）。 **你不必非得选用类**（复杂性）来得到干净漂亮的对象语法！

### 没有词法

简约方法确实有一个缺点，一个重要的细节。考虑这段代码：

```js
var Foo = {
	bar() { /*..*/ },
	baz: function baz() { /*..*/ }
};
```

这是去掉语法糖后，这段代码将如何工作：

```js
var Foo = {
	bar: function() { /*..*/ },
	baz: function baz() { /*..*/ }
};
```

看到区别了？`bar()` 的速记法变成了一个附着在 `bar` 属性上的 *匿名函数表达式*（`function()..`），因为函数对象本身没有名称标识符。和拥有词法名称标识符 `baz`，附着在 `.baz` 属性上的手动指定的 *命名函数表达式*（`function baz()..`）做个比较。

那又怎么样？在 *“你不懂 JS”* 系列的 *“作用域与闭包”* 这本书中，我们详细讲解了 *匿名函数表达式* 的三个主要缺点。我们简单地重复一下它们，以便于我们和简明方法相比较。

一个匿名函数缺少 `name` 标识符：

1. 使调试时的栈追踪变得困难
2. 使自引用（递归，事件绑定等）变得困难
3. 使代码（稍稍）变得难于理解

第一和第三条不适用于简明方法。

虽然去掉语法糖使用 *匿名函数表达式* 一般会使栈追踪中没有 `name`。简明方法在语言规范中被要求去设置相应的函数对象内部的 `name` 属性，所以栈追踪应当可以使用它（这是依赖于具体实现的，所以不能保证）。

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

在这个例子中上面的手动 `Foo.bar(x*2)` 引用就足够了，但是在许多情况下，一个函数不一定能够这样做，比如使用 `this` 绑定，函数在委托中被分享到不同的对象，等等。你将会想要使用一个真正的自引用，而函数对象的 `name` 标识符是实现的最佳方式。

只要小心简明方法的这个注意点，而且如果当你陷入缺少自引用的问题时，**仅仅为这个声明** 放弃简明方法语法，取代以手动的 *命名函数表达式* 声明形式：`baz: function baz(){..}`。

## 自省

如果你花了很长时间在面向类的编程方式（不管是 JS 还是其他的语言）上，你可能会对 *类型自省* 很熟悉：自省一个实例来找出它是什么 *种类* 的对象。在类的实例上进行 *类型自省* 的主要目的是根据 *对象是如何创建的* 来推断它的结构/能力。

考虑这段代码，它使用 `instanceof`（见第五章）来自省一个对象 `a1` 来推断它的能力：

```js
function Foo() {
	// ...
}
Foo.prototype.something = function(){
	// ...
}

var a1 = new Foo();

// 稍后

if (a1 instanceof Foo) {
	a1.something();
}
```

因为 `Foo.prototype`（不是 `Foo`!）在 `a1` 的 `[[Prototype]]` 链上（见第五章），`instanceof` 操作符（使人困惑地）假装告诉我们 `a1` 是一个 `Foo` “类”的实例。有了这个知识，我们假定 `a1` 有 `Foo` “类”中描述的能力。

当然，这里没有 `Foo` 类，只有一个普通的函数 `Foo`，它恰好拥有一个引用指向一个随意的对象（`Foo.prototype`），而 `a1` 恰好委托链接至这个对象。通过它的语法，`instanceof` 假装检查了 `a1` 和 `Foo` 之间的关系，但它实际上告诉我们的是 `a1` 和 `Foo.prototype`（这个随意被引用的对象）是否有关联。

`instanceof` 在语义上的混乱（和间接）意味着，要使用以 `instanceof` 为基础的自省来查询对象 `a1` 是否与讨论中的对象有关联，你 *不得不* 拥有一个持有对这个对象引用的函数 —— 你不能直接查询这两个对象是否有关联。

回想本章前面的抽象 `Foo` / `Bar` / `b1` 例子，我们在这里缩写一下：

```js
function Foo() { /* .. */ }
Foo.prototype...

function Bar() { /* .. */ }
Bar.prototype = Object.create( Foo.prototype );

var b1 = new Bar( "b1" );
```

为了在这个例子中的实体上进行 *类型自省*， 使用 `instanceof` 和 `.prototype` 语义，这里有各种你可能需要实施的检查：

```js
// `Foo` 和 `Bar` 互相的联系
Bar.prototype instanceof Foo; // true
Object.getPrototypeOf( Bar.prototype ) === Foo.prototype; // true
Foo.prototype.isPrototypeOf( Bar.prototype ); // true

// `b1` 与 `Foo` 和 `Bar` 的联系
b1 instanceof Foo; // true
b1 instanceof Bar; // true
Object.getPrototypeOf( b1 ) === Bar.prototype; // true
Foo.prototype.isPrototypeOf( b1 ); // true
Bar.prototype.isPrototypeOf( b1 ); // true
```

可以说，其中有些烂透了。举个例子，直觉上（用类）你可能想说这样的东西 `Bar instanceof Foo`（因为很容易混淆“实例”的意义认为它包含“继承”），但在 JS 中这不是一个合理的比较。你不得不说 `Bar.prototype instanceof Foo`。

另一个常见，但也许健壮性更差的 *类型自省* 模式叫“duck typing（鸭子类型）”，比起 `instanceof` 来许多开发者都倾向于它。这个术语源自一则谚语，“如果它看起来像鸭子，叫起来像鸭子，那么它一定是一只鸭子”。

例如：

```js
if (a1.something) {
	a1.something();
}
```

与其检查 `a1` 和一个持有可委托的 `something()` 函数的对象的关系，我们假设 `a1.something` 测试通过意味着 `a1` 有能力调用 `.something()`（不管是直接在 `a1` 上直接找到方法，还是委托至其他对象）。就其本身而言，这种假设没什么风险。

但是“鸭子类型”常常被扩展用于 **除了被测试关于对象能力以外的其他假设**，这当然会在测试中引入更多风险（比如脆弱的设计）。

“鸭子类型”的一个值得注意的例子来自于 ES6 的 Promises（就是我们前面解释过，将不再本书内涵盖的内容）。

由于种种原因，需要判定任意一个对象引用是否 *是一个 Promise*，但测试是通过检查对象是否恰好有 `then()` 函数出现在它上面来完成的。换句话说，**如果任何对象** 恰好有一个 `then()` 方法，ES6 的 Promises 将会无条件地假设这个对象 **是“thenable”** 的，而且因此会期望它按照所有的 Promises 标准行为那样一致地动作。

如果你有任何非 Promise 对象，而却不管因为什么它恰好拥有 `then()` 方法，你会被强烈建议使它远离 ES6 的 Promise 机制，来避免破坏这种假设。

这个例子清楚地展现了“鸭子类型”的风险。你应当仅在可控的条件下，保守地使用这种方式。

再次将我们的注意力转向本章中出现的 OLOO 风格的代码，*类型自省* 变得清晰多了。让我们回想（并缩写）本章的 `Foo` / `Bar` / `b1` 的 OLOO 示例：

```js
var Foo = { /* .. */ };

var Bar = Object.create( Foo );
Bar...

var b1 = Object.create( Bar );
```

使用这种 OLOO 方式，我们所拥有的一切都是通过 `[[Prototype]]` 委托关联起来的普通对象，这是我们可能会用到的大幅简化后的 *类型自省*：

```js
// `Foo` 和 `Bar` 互相的联系
Foo.isPrototypeOf( Bar ); // true
Object.getPrototypeOf( Bar ) === Foo; // true

// `b1` 与 `Foo` 和 `Bar` 的联系
Foo.isPrototypeOf( b1 ); // true
Bar.isPrototypeOf( b1 ); // true
Object.getPrototypeOf( b1 ) === Bar; // true
```

我们不再使用 `instanceof`，因为它令人迷惑地假装与类有关系。现在，我们只需要（非正式地）问这个问题，“你是我的 *一个* 原型吗？”。不再需要用 `Foo.prototype` 或者痛苦冗长的 `Foo.prototype.isPrototypeOf(..)` 来间接地查询了。

我想可以说这些检查比起前面一组自省检查，极大地减少了复杂性/混乱。**又一次，我们看到了在 JavaScript 中 OLOO 要比类风格的编码简单（但有着相同的力量）。**

## 复习

在你的软件体系结构中，类和继承是你可以 *选用* 或 *不选用* 的设计模式。多数开发者理所当然地认为类是组织代码的唯一（正确的）方法，但我们在这里看到了另一种不太常被提到的，但实际上十分强大的设计模式：**行为委托**。

行为委托意味着对象彼此是对等的，在它们自己当中相互委托，而不是父类与子类的关系。JavaScript 的 `[[Prototype]]` 机制的设计本质，就是行为委托机制。这意味着我们可以选择挣扎着在 JS 上实现类机制，也可以欣然接受 `[[Prototype]]` 作为委托机制的本性。

当你仅用对象设计代码时，它不仅能简化你使用的语法，而且它还能实际上引领更简单的代码结构设计。

**OLOO**（链接到其他对象的对像）是一种没有类的抽象，而直接创建和关联对象的代码风格。OLOO 十分自然地实现了基于 `[[Prototype]]` 的行为委托。
