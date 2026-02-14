# 你并不了解 JavaScript：对象与类 - 第二版
# 第 5 章：委托

| 注意: |
| :--- |
| 草稿 |

我们已经深入探讨了对象、原型、类以及现在的 `this` 关键字。但现在我们将从一个稍微不同的角度重新审视我们迄今为止学到的内容。

如果你可以结合利用对象、原型和动态 `this` 机制的所有力量，而从不使用 `class` 或其任何衍生物，那会怎么样？

事实上，我认为 JS 本质上并不仅像 `class` 关键字表现出来的那样面向类。因为 JS 是一门动态的、基于原型的语言，它的强项实际上是……**委托（delegation）**。

## 前言

在我们开始探讨委托之前，我想先提出一点警告。这种关于 JS 对象 `[[Prototype]]` 和 `this` 函数上下文机制的观点*不是*主流观点。这*不是*框架作者和库使用 JS 的方式。据我所知，你不会要在外面找到任何大型应用程序使用这种模式。

既然它如此不受欢迎，我究竟为什么要专门用一章来讨论这种模式呢？

问得好。俏皮的回答是：因为这是我的书，我想怎么写就怎么写！

但更深层的回答是，因为我认为通过这种方式来理解语言的核心支柱之一，*即使*你一直只使用 `class` 风格的 JS 模式，对你也大有裨益。

需要明确的是，委托不是我的发明。作为一种设计模式，它已经存在了几十年。很长一段时间以来，开发人员认为原型委托*仅仅*是继承的动态形式。[^TreatyOfOrlando] 但我认为将两者混为一谈是一个错误。[^ClassVsPrototype]

对于本章的目的，我将展示通过 JS 机制实现的委托，作为一个替代的设计模式，其定位介于面向类（class-orientation）和对象闭包/模块（object-closure/module）模式之间。

第一步是将 `class` 机制*解构*为其各个组成部分。然后我们将以不同的方式挑选和混合这些部分。

## 到底什么是构造函数？

在第 3 章中，我们看到 `constructor(..)` 作为构建 `class` 实例的主要入口点。但 `constructor(..)` 实际上并不做任何*创建*工作，它只做*初始化*工作。换句话说，在 `constructor(..)` 运行并初始化它是——例如 `this.whatever` 类型的赋值——实例已经被创建了。

那么*创建*工作实际上是在哪里发生的呢？在 `new` 操作符中。正如第 4 章“New 上下文调用”一节所解释的，`new` 关键字执行四个步骤；其中第一步是创建一个新的空对象（实例）。`constructor(..)` 直到 `new` 工作的第 3 步才会被调用。

但是 `new` 并不是*创建*对象“实例”的唯一——甚至可能不是最好的——方式。试想一下：

```js
// 一个非类的“构造函数”
function Point2d(x,y) {
    // 创建一个对象 (1)
    var instance = {};

    // 初始化实例 (3)
    instance.x = x;
    instance.y = y;

    // 返回实例 (4)
    return instance;
}

var point = Point2d(3,4);

point.x;                    // 3
point.y;                    // 4
```

这里没有 `class`，只有一个常规的函数定义（`Point2d(..)`）。没有 `new` 调用，只有一个常规的函数调用（`Point2d(3,4)`）。也没有 `this` 引用，只有常规的对象属性赋值（`instance.x = ..`）。

最常用来指代这种代码模式的术语是，这里的 `Point2d(..)` 是一个**工厂函数（factory function）**。调用它会导致对象的构建（创建和初始化），并将其返回给我们。这是一种极其常见的模式，至少像面向类的代码一样常见。

我在该片段中注释了 `(1)`、`(3)` 和 `(4)`，它们大致对应于 `new` 操作的第 1、3 和 4 步。但是第 2 步在哪里？

如果你还记得，`new` 的第 2 步是通过其 `[[Prototype]]` 插槽将（在第 1 步中创建的）对象链接到另一个对象（参见第 2 章）。那么我们可能想把我们的 `instance` 对象链接到什么对象呢？我们可以将其链接到一个持有我们想要关联/使用于我们实例的函数的对象。

让我们修改一下前面的片段：

```js
var prototypeObj = {
    toString() {
        return `(${this.x},${this.y})`;
    },
}

// 一个非类的“构造函数”
function Point2d(x,y) {
    // 创建一个对象 (1)
    var instance = {
        // 链接实例的 [[Prototype]] (2)
        __proto__: prototypeObj,
    };

    // 初始化实例 (3)
    instance.x = x;
    instance.y = y;

    // 返回实例 (4)
    return instance;
}

var point = Point2d(3,4);

point.toString();           // (3,4)
```

现在你看到了 `__proto__` 赋值，它设置了内部的 `[[Prototype]]` 链接，这就是缺失的第 2 步。我在这里使用 `__proto__` 仅用于说明目的；使用第 4 章中展示的 `setPrototypeOf(..)` 也能完成同样的任务。

### *New* 工厂实例

你认为如果我们使用 `new` 来调用 `Point2d(..)` 函数会发生什么，如下所示？

```js
var anotherPoint = new Point2d(5,6);

anotherPoint.toString(5,6);         // (5,6)
```

等等！这是怎么回事？一个常规的、非 `class` 的工厂函数用 `new` 关键字调用，就像它是一个 `class` 一样。这会改变代码的结果吗？

不……也是。这里的 `anotherPoint` 与我不使用 `new` 时完全是同一个对象。但是！`new` 创建、链接并作为 `this` 上下文分配的那个对象？*那个*对象被完全忽略并抛弃了，最终会被 JS 垃圾回收。不幸的是，JS 引擎无法预测你不会使用你要求 `new` 创建的那个对象，所以它总是会被创建，即使它没有被使用。

没错！对工厂函数使用 `new` 关键字可能*感觉*更符合人体工程学或更熟悉，但这是相当浪费的，因为它创建了**两个**对象，并浪费地抛弃了其中一个。

### 工厂初始化

在当前的代码示例中，`Point2d(..)` 函数看起来仍然非常像一个 `class` 定义的普通 `constructor(..)`。但是如果我们把初始化代码移到一个单独的函数中，比如说命名为 `init(..)`：

```js
var prototypeObj = {
    init(x,y) {
        // 初始化实例 (3)
        this.x = x;
        this.y = y;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
}

// 一个非类的“构造函数”
function Point2d(x,y) {
    // 创建一个对象 (1)
    var instance = {
        // 链接实例的 [[Prototype]] (2)
        __proto__: prototypeObj,
    };

    // 初始化实例 (3)
    instance.init(x,y);

    // 返回实例 (4)
    return instance;
}

var point = Point2d(3,4);

point.toString();           // (3,4)
```

`instance.init(..)` 调用利用了通过 `__proto__` 赋值建立的 `[[Prototype]]` 链接。因此，它沿着原型链*委托*给 `prototypeObj.init(..)`，并通过**隐式上下文**赋值（参见第 4 章）以 `instance` 作为 `this` 上下文来调用它。

让我们继续解构。准备好大变身吧！

```js
var Point2d = {
    init(x,y) {
        // 初始化实例 (3)
        this.x = x;
        this.y = y;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
};
```

哇，什么！？我丢弃了 `Point2d(..)` 函数，而是将 `prototypeObj` 重命名为 `Point2d`。奇怪。

但现在让我们看看其余的代码：

```js
// 第 1、2 和 4 步
var point = { __proto__: Point2d, };

// 第 3 步
point.init(3,4);

point.toString();           // (3,4)
```

还有一个最后的改进：让我们使用 JS 提供的一个内置工具，叫做 `Object.create(..)`：

```js
// 第 1、2 和 4 步
var point = Object.create(Point2d);

// 第 3 步
point.init(3,4);

point.toString();           // (3,4)
```

`Object.create(..)` 执行了什么操作？

1. 凭空创建一个全新的空对象。

2. 将那个新空对象的 `[[Prototype]]` 链接到函数的 `.prototype` 对象。

如果这些看起来很熟悉，那是因为它们正是 `new` 关键字的前两个步骤（参见第 4 章）。

现在让我们把这些放在一起：

```js
var Point2d = {
    init(x,y) {
        this.x = x;
        this.y = y;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
};

var point = Object.create(Point2d);

point.init(3,4);

point.toString();           // (3,4)
```

嗯。花点时间思考一下这里推导出了什么。它与 `class` 方法相比如何？

这种模式抛弃了 `class` 和 `new` 关键字，但完成了完全相同的结果。*代价*是什么？单个 `new` 操作被拆分成了两个语句：`Object.create(Point2d)` 和 `point.init(3,4)`。

#### 帮我重构！

如果将这两个操作分开让你感到困扰——是不是*解构太过了*！？——它们总是可以在一个小工厂助手函数中重新组合：

```js
function make(objType,...args) {
    var instance = Object.create(objType);
    instance.init(...args);
    return instance;
}

var point = make(Point2d,3,4);

point.toString();           // (3,4)
```

| 提示: |
| :--- |
| 这样一个 `make(..)` 工厂函数助手通常适用于任何对象类型，只要你遵循隐含的约定，即你链接到的每个 `objType` 上都有一个名为 `init(..)` 的函数。 |

当然，你仍然可以想创建多少实例就创建多少：

```js
var point = make(Point2d,3,4);

var anotherPoint = make(Point2d,5,6);
```

## 抛弃类思维

坦率地说，我们刚刚经历的*解构*仅仅导致了与 `class` 风格相比略有不同，也许稍微好一点或稍微差一点的代码。如果这就是委托的全部内容，它可能甚至不足以作为一个注脚，更不用说这一整章了。

但这就是我们将真正开始将面向类的思维本身，而不仅仅是语法，推到一边的起点。

面向类的设计本质上创建了一个**分类（classification）**的层次结构，这意味着我们如何划分和分组特征，然后在继承链中垂直堆叠它们。此外，定义子类是广义基类的特化。实例化是广义类的特化。

传统类层次结构中的行为是通过继承链的层级进行垂直组合的。几十年来，人们一直在尝试使继承的深层层次结构扁平化，甚至一度相当流行，并倾向于通过**混入（mixins）**和相关思想进行更水平的组合。

我并不是断言这些处理代码的方式有什么问题。但我要说的是，它们并非 JS *天生*的工作方式，因此在 JS 中采用它们是一条漫长、曲折、复杂的道路，并且为了在 JS 核心的 `[[Prototype]]` 和 `this` 支柱之上进行翻新，已经积累了许多微妙的语法。

在本章的其余部分，我打算同时抛弃 `class` 的语法*和* *类*的思维。

## 委托图解

那么委托是关于什么的呢？在其核心，它是关于两个或多个*事物*分担完成任务的努力。

与其定义一个 `Point2d` 通用父级*事物*来代表一组一个或多个子级 `point` / `anotherPoint` *事物*继承的共享行为，委托将我们转移到用相互协作的离散对等（peer）*事物*来构建我们的程序。

我将用一些代码来勾勒这一点：

```js
var Coordinates = {
    setX(x) {
        this.x = x;
    },
    setY(y) {
        this.y = y;
    },
    setXY(x,y) {
        this.setX(x);
        this.setY(y);
    },
};

var Inspect = {
    toString() {
        return `(${this.x},${this.y})`;
    },
};

var point = {};

Coordinates.setXY.call(point,3,4);
Inspect.toString.call(point);         // (3,4)

var anotherPoint = Object.create(Coordinates);

anotherPoint.setXY(5,6);
Inspect.toString.call(anotherPoint);  // (5,6)
```

让我们分解一下这里发生了什么。

我已经将 `Coordinates` 定义为一个具体对象，它持有我与设置点坐标（`x` 和 `y`）相关联的一些行为。我还将 `Inspect` 定义为一个具体对象，它持有以些调试检查逻辑，例如 `toString()`。

然后我又创建了两个具体对象，`point` 和 `anotherPoint`。

`point` 没有特定的 `[[Prototype]]`（默认：`Object.prototype`）。使用**显式上下文**赋值（参见第 4 章），我在 `point` 的上下文中调用 `Coordinates.setXY(..)` 和 `Inspect.toString()` 工具。这就是我所说的**显式委托（explicit delegation）**。

`anotherPoint` 被 `[[Prototype]]` 链接到 `Coordinates`，主要是为了方便一点。这让我可以在 `anotherPoint.setXY(..)` 中使用**隐式上下文**赋值。但我仍然可以将 `anotherPoint` 作为 `Inspect.toString()` 调用的上下文来*显式*共享。这就是我所说的**隐式委托（implicit delegation）**。

**不要错过*这一点*：** 我们仍然完成了组合：我们在运行时函数调用中通过 `this` 上下文共享组合了来自 `Coordinates` 和 `Inspect` 的行为。我们不必将这些行为编写组合成单个 `class`（或基类-子类 `class` 层次结构）供 `point` / `anotherPoint` 继承。我喜欢将这种运行时组合称为**虚拟组合（virtual composition）**。

这里的*重点*是：这四个对象中没有一个是父级或子级。它们都是彼此的对等体，它们都有不同的目的。我们可以将我们的行为组织成逻辑块（在各个相应的对象上），并通过 `this`（以及可选的 `[[Prototype]]` 链接）共享上下文，这最终会产生与我们在本书中迄今为止检查的其他模式相同的组合结果。

*那*就是**委托**模式的核心，正如 JS 所体现的那样。

| 提示: |
| :--- |
| 在本系列书的第一版中，这本书（“this & Object Prototypes”）创造了一个术语，“OLOO”，代表“Objects Linked to Other Objects”（对象关联对象）——以与“OO”（“Object Oriented”，面向对象）形成对比。在前面的例子中，你可以看到 OLOO 的本质：我们所拥有的只是对象，链接到并与其它对象协作。我觉得这种简单性很美。 |

## 组合对等对象

让我们把*这种委托*推得更远。

在前面的代码片段中，`point` 和 `anotherPoint` 仅仅持有数据，它们委托的行为是在其他对象上（`Coordinates` 和 `Inspect`）。但我们可以直接向委托链中的任何对象添加行为，这些行为甚至可以相互交互，所有这些都通过**虚拟组合**（`this` 上下文共享）的魔力来实现。

为了说明这一点，我们将相当大地演变我们当前的 *point* 示例。作为奖励，我们实际上将在 DOM 中的 `<canvas>` 元素上绘制我们的点。让我们来看看：

```js
var Canvas = {
    setOrigin(x,y) {
        this.ctx.translate(x,y);

        // 垂直翻转 canvas 上下文，
        // 这样坐标就像在普通的
        // 2d (x,y) 图形上一样工作
        this.ctx.scale(1,-1);
    },
    pixel(x,y) {
        this.ctx.fillRect(x,y,1,1);
    },
    renderScene() {
        // 清除 canvas
        var matrix = this.ctx.getTransform();
        this.ctx.resetTransform();
        this.ctx.clearRect(
            0, 0,
            this.ctx.canvas.width,
            this.ctx.canvas.height
        );
        this.ctx.setTransform(matrix);

        this.draw();  // <-- draw() 在哪里？
    },
};

var Coordinates = {
    setX(x) {
        this.x = Math.round(x);
    },
    setY(y) {
        this.y = Math.round(y);
    },
    setXY(x,y) {
        this.setX(x);
        this.setY(y);
        this.render();   // <-- render() 在哪里？
    },
};

var ControlPoint = {
    // 委托给 Coordinates
    __proto__: Coordinates,

    // 注意: DOM 中必须有一个 <canvas id="my-canvas">
    // 元素
    ctx: document.getElementById("my-canvas")
        .getContext("2d"),

    rotate(angleRadians) {
        var rotatedX = this.x * Math.cos(angleRadians) -
            this.y * Math.sin(angleRadians);
        var rotatedY = this.x * Math.sin(angleRadians) +
            this.y * Math.cos(angleRadians);
        this.setXY(rotatedX,rotatedY);
    },
    draw() {
        // 绘制点
        Canvas.pixel.call(this,this.x,this.y);
    },
    render() {
        // 清除 canvas，并重新渲染
        // 我们的控制点
        Canvas.renderScene.call(this);
    },
};

// 在 canvas 上的这个物理位置
// 设置逻辑 (0,0) 原点
Canvas.setOrigin.call(ControlPoint,100,100);

ControlPoint.setXY(30,40);
// [在 canvas 上绘制点 (30,40)]

// ..
// 稍后:

// 围绕 (0,0) 原点逆时针旋转该点
// 90 度
ControlPoint.rotate(Math.PI / 2);
// [在 canvas 上绘制点 (-40,30)]
```

好吧，这有很多代码需要消化。慢慢来，多读几遍这个片段。我在之前的 `Coordinates` 对象旁边添加了两个新的具体对象（`Canvas` 和 `ControlPoint`）。

确保你看到并理解了这三个具体对象之间的交互。

`ControlPoint` 被链接（通过 `__proto__`）以*隐式委托*（`[[Prototype]]` 链）给 `Coordinates`。

这是一个*显式委托*：`Canvas.setOrigin.call(ControlPoint,100,100);`；我在 `ControlPoint` 的上下文中调用 `Canvas.setOrigin(..)` 调用。这具有通过 `this` 与 `setOrigin(..)` 共享 `ctx` 的效果。

`ControlPoint.setXY(..)` *隐式*委托给 `Coordinates.setXY(..)`，但仍然是在 `ControlPoint` 的上下文中。这里有一个很容易被忽略的关键细节：看到 `Coordinates.setXY(..)` 内部的 `this.render()` 了吗？那是从哪里来的？由于 `this` 上下文是 `ControlPoint`（不是 `Coordinates`），它正在调用 `ControlPoint.render()`。

`ControlPoint.render()` *显式委托*给 `Canvas.renderScene()`，也是仍然在 `ControlPoint` 上下文中。`renderScene()` 调用 `this.draw()`，但那是从哪里来的？是的，仍然来自 `ControlPoint`（通过 `this` 上下文）。

那么 `ControlPoint.draw()` 呢？它*显式委托*给 `Canvas.pixel(..)`，再一次仍然是在 `ControlPoint` 上下文中。

所有三个对象的方法最终都会相互调用。但这些调用并不是特别硬连线的。`Canvas.renderScene()` 不会调用 `ControlPoint.draw()`，它调用 `this.draw()`。这很重要，因为这意味着 `Canvas.renderScene()` 在不同的 `this` 上下文中更灵活地使用——例如，针对除了 `ControlPoint` 之外的另一种*点*对象。

正是通过 `this` 上下文和 `[[Prototype]]` 链，这三个对象基本上被虚拟地混合（组合）在一起，根据每一步的需要，以便它们一起工作，**就好像它们是一个对象而不是三个独立的对象**。

这就是 JS 中的委托模式所实现的**虚拟组合**之美。

### 灵活的上下文

我在上面提到，我们可以很容易地将其他具体对象加入混合中。这是一个例子：

```js
var Coordinates = { /* .. */ };

var Canvas = {
    /* .. */
    line(start,end) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x,start.y);
        this.ctx.lineTo(end.x,end.y);
        this.ctx.stroke();
    },
};

function lineAnchor(x,y) {
    var anchor = {
        __proto__: Coordinates,
        render() {},
    };
    anchor.setXY(x,y);
    return anchor;
}

var GuideLine = {
    // 注意: DOM 中必须有一个 <canvas id="my-canvas">
    // 元素
    ctx: document.getElementById("my-canvas")
        .getContext("2d"),

    setAnchors(sx,sy,ex,ey) {
        this.start = lineAnchor(sx,sy);
        this.end = lineAnchor(ex,ey);
        this.render();
    },
    draw() {
        // 绘制点
        Canvas.line.call(this,this.start,this.end);
    },
    render() {
        // 清除 canvas，并重新渲染
        // 我们的线
        Canvas.renderScene.call(this);
    },
};

// 在 canvas 上的这个物理位置
// 设置逻辑 (0,0) 原点
Canvas.setOrigin.call(GuideLine,100,100);

GuideLine.setAnchors(-30,65,45,-17);
// [在 canvas 上绘制从 (-30,65) 到 (45,-17) 的线]
```

我觉得这很棒！

但我认为另一个不太明显的以好处是，让对象通过 `this` 上下文动态链接往往会使独立测试程序的不同部分稍微容易一些。

例如，`Object.setPrototypeOf(..)`可以用来动态改变对象的 `[[Prototype]]` 链接，将其委托给不同的对象，比如一个模拟对象（mock object）。或者你可以动态重新定义 `GuideLine.draw()` 和 `GuideLine.render()` 以*显式委托*给 `MockCanvas` 而不是 `Canvas`。

当你充分理解并利用好它们时，`this` 关键字和 `[[Prototype]]` 链接是一个极其灵活的机制。

## 为什么是 *This*？

好了，希望已经讲清楚了，委托模式严重依赖于隐式输入，通过 `this` 共享上下文，而不是通过显式参数。

你可能会正确地问，为什么不直接总是显式传递那个上下文呢？我们当然可以这样做，但是……为了手动传递必要的上下文，我们将不得不更改几乎每一个函数签名以及任何相应的调用点。

让我们重温早期的 `ControlPoint` 委托示例，并在没有任何面向委托的 `this` 上下文共享的情况下实现它。请仔细注意差异：

```js
var Canvas = {
    setOrigin(ctx,x,y) {
        ctx.translate(x,y);
        ctx.scale(1,-1);
    },
    pixel(ctx,x,y) {
        ctx.fillRect(x,y,1,1);
    },
    renderScene(ctx,entity) {
        // 清除 canvas
        var matrix = ctx.getTransform();
        ctx.resetTransform();
        ctx.clearRect(
            0, 0,
            ctx.canvas.width,
            ctx.canvas.height
        );
        ctx.setTransform(matrix);

        entity.draw();
    },
};

var Coordinates = {
    setX(entity,x) {
        entity.x = Math.round(x);
    },
    setY(entity,y) {
        entity.y = Math.round(y);
    },
    setXY(entity,x,y) {
        this.setX(entity,x);
        this.setY(entity,y);
        entity.render();
    },
};

var ControlPoint = {
    // 注意: DOM 中必须有一个 <canvas id="my-canvas">
    // 元素
    ctx: document.getElementById("my-canvas")
        .getContext("2d"),

    setXY(x,y) {
        Coordinates.setXY(this,x,y);
    },
    rotate(angleRadians) {
        var rotatedX = this.x * Math.cos(angleRadians) -
            this.y * Math.sin(angleRadians);
        var rotatedY = this.x * Math.sin(angleRadians) +
            this.y * Math.cos(angleRadians);
        this.setXY(rotatedX,rotatedY);
    },
    draw() {
        // 绘制点
        Canvas.pixel(this.ctx,this.x,this.y);
    },
    render() {
        // 清除 canvas，并重新渲染
        // 我们的控制点
        Canvas.renderScene(this.ctx,this);
    },
};

// 在 canvas 上的这个物理位置
// 设置逻辑 (0,0) 原点
Canvas.setOrigin(ControlPoint.ctx,100,100);

// ..
```

老实说，你们中的一些人可能更喜欢那种代码风格。如果你属于那个阵营，那也没关系。这个片段完全避免了 `[[Prototype]]`，只依赖于少得多的基本 `this.` 风格的属性和方法引用。

相比之下，我本章提倡的委托风格是陌生的，并且以你可能不熟悉的方式使用了 `[[Prototype]]` 和 `this` 共享。要有效地使用这种风格，你必须投入时间和练习来建立更深的熟悉度。

但在我看来，避免通过委托进行虚拟组合的“代价”可以在所有函数签名和调用点上感受到；我发现它们更加杂乱。这种显式上下文传递是一种相当大的负担。

事实上，我绝不会提倡那种代码风格。如果你想避免委托，最好还是坚持使用 `class` 风格的代码，如第 3 章所示。作为留给读者的练习，尝试将前面的 `ControlPoint` / `GuideLine` 代码片段转换为使用 `class`。

[^TreatyOfOrlando]: "Treaty of Orlando"（奥兰多条约）; Henry Lieberman, Lynn Andrea Stein, David Ungar; Oct 6, 1987; https://web.media.mit.edu/~lieber/Publications/Treaty-of-Orlando-Treaty-Text.pdf ; PDF; Accessed July 2022

[^ClassVsPrototype]: "Classes vs. Prototypes, Some Philosophical and Historical Observations"（类与原型，一些哲学和历史观察）; Antero Taivalsaari; Apr 22, 1996; https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.56.4713&rep=rep1&type=pdf ; PDF; Accessed July 2022