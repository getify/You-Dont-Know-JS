# 你并不了解 JavaScript：对象与类 - 第二版
# 第 3 章：类风格的对象

| 注意： |
| :--- |
| 草稿 |

类设计模式通常包括定义一个*事物的类型*（类），包含数据（成员）和行为（方法），然后创建该类定义的一个或多个具体*实例*作为实际对象，这些对象可以进行交互并执行任务。此外，面向类允许通过所谓的“继承”声明两个或多个类之间的关系，从而派生出新的、增强的“子类”，这些子类可以混合搭配甚至重新定义行为。

在 ES6（2015）之前，JS 开发者使用普通函数和对象，以及 `[[Prototype]]` 机制（如上一章所述）来模仿面向类（又称“面向对象”）设计的各个方面——即所谓的“原型类”。

但令许多开发者高兴和宽慰的是，ES6 引入了专用语法，包括 `class` 和 `extends` 关键字，以便更声明式地表达面向类的设计。

在 ES6 引入 `class` 时，这种新的专用语法几乎完全*只是语法糖*，旨在使类定义更加方便和易读。然而，在 ES6 之后的许多年里，`class` 已经成熟并成长为自己的一等特性机制，积累了大量的专用语法和复杂行为，远远超过了 ES6 之前的“原型类”能力。

尽管 `class` 现在与旧的“原型类”代码风格几乎没有任何相似之处，但 JS 引擎仍然*仅仅*是通过现有的 `[[Prototype]]` 机制将对象彼此连接起来。换句话说，`class` 并不是语言中独立的一个支柱（像 `[[Prototype]]` 那样），而更像是装饰在支柱/柱子顶端的华丽*柱头*。

话虽如此，既然 `class` 风格的代码现在几乎已经取代了所有之前的“原型类”编码，这里的正文将只关注 `class` 及其各种细节。为了历史目的，我们将在附录中简要介绍旧的“原型类”风格。

## 我应该何时对代码进行类导向设计？

面向类是一种设计模式，这意味着它是你选择如何组织程序中信息和行为的一种方式。它有优点也有缺点。它并不是所有任务的通用解决方案。

那么，你怎么知道什么时候应该使用类呢？

从理论上讲，面向类是一种将程序的业务领域划分为一个或多个部分的方式，每个部分都可以由“是一个（is-a）”分类来定义：将一个事物分组到该事物与其他类似事物共享的一组（或多组）特征中。你会说“X 是一个 Y”，意思是 X 拥有（至少）Y 类事物的所有特征。

例如，考虑计算机。我们可以说计算机是电气的，因为它使用电流（电压、安培等）作为动力。它不仅是电气的，还是电子的，因为它不仅仅是简单的引导电子（电场/磁场），而是操纵电流，创建一个有意义的电路来操纵电流以执行更复杂的任务。相比之下，一个基本的台灯是电气的，但并不是真正的电子产品。

因此，我们可以定义一个 `Electrical` 类来描述电气设备需要什么以及能做什么。然后我们可以定义一个进一步的 `Electronic` 类，并定义除了是电气的之外，`Electronic` 事物还操纵电力以产生更专门的结果。

这正是面向类开始通过的地方。我们不需要在 `Electronic` 类中重新定义所有 `Electrical` 特征，而是可以定义 `Electronic`，使其从 `Electrical` “共享”或“继承”那些特征，然后增强/重新定义使设备成为电子设备的独特行为。这两个类之间的这种关系——称为“继承”——是面向类的一个关键方面。

所以面向类是一种思考程序所需实体的方式，根据它们的特征（它们持有什么信息，可以对该数据执行什么操作）将它们分类为分组，并定义不同特征分组之间的关系。

但从理论转向更务实的角度：如果你的程序需要同时持有和使用多组（实例）相似的数据/行为，你*可能*会从面向类中受益。

### 举个例子

这是一个简短的说明。

几十年前，就在我在大学即将完成计算机科学学位的几乎所有课程之后，我发现自己正处于第一份专业软件开发工作中。我的任务是独自构建一个工时表和薪资跟踪系统。我用 PHP 构建后端（使用 MySQL 作为数据库），并用 JS 构建界面（尽管当时在世纪之交并没有那么成熟）。

由于我的计算机科学学位在其课程中一直强调面向类，我渴望将这些理论付诸实践。对于我的程序设计，我将“工时表”实体的概念定义为 2-3 个“周”实体的集合，每个“周”是 5-7 个“天”实体的集合，每个“天”是“任务”实体的集合。

如果我想知道一个工时表实例中记录了多少小时，我可以调用该实例上的 `totalTime()` 操作。工时表通过循环遍历其周集合，调用每个周的 `totalTime()` 并对值求和来定义此操作。每一周对所包含的所有天做同样的事情，每一天对所包含的所有任务做同样的事情。

这里说明的概念，像面向类这样的设计模式的基础之一，称为*封装*（encapsulation）。每个实体层级封装（例如，控制、隐藏、抽象）内部细节（数据和行为），同时呈现一个有用的外部接口。

但仅靠封装并不是面向类的充分理由。其他设计模式也提供了充分的封装。

我的类设计是如何利用继承的？我有一个基类，定义了一组像 `totalTime()` 这样的操作，我的每个实体类类型都扩展/子类化了这个基类。这意味着它们每一个都继承了这个总时间求和的能力，但每一个都应用了它们自己的扩展和对*如何*做这项工作的内部细节的定义。

这里还有设计模式的另一个方面在起作用，那就是*组合*（composition）：每个实体被定义为其他实体的集合。

### 单个 vs 多个

我在上面提到，决定是否需要面向类的一个务实方法是，看你的程序是否会有单一类型/种类行为（即“类”）的多个实例。在工时表的例子中，咱们有 4 个类：Timesheet、Week、Day 和 Task。但对于每个类，我们同时有多个实例。

如果我们反而只需要一个类的一个实例，就像只有一个 `Computer` 事物是 `Electronic` 类的实例，而 `Electronic` 类是 `Electrical` 类的子类，那么面向类可能不会提供太多的好处。特别是，如果程序不需要创建 `Electrical` 类的实例，那么将 `Electrical` 与 `Electronic` 分开就没有特别的好处，所以我们并没有真正从面向类的继承方面获得任何帮助。

所以，如果你发现自己通过将业务问题领域划分为不同的实体“类”来设计程序，但在程序的实际代码中，你其实只需要一种行为定义（即“类”）的一个具体*事物*，那么你很可能实际上并不需要面向类。有其他的设计模式可能更有效地匹配你的工作。

但是，如果你发现自己想要定义类，以及继承自它们的子类，并且你要多次实例化这些类中的一个或多个，那么面向类是一个很好的候选者。要在 JS 中进行面向类编程，你需要 `class` 关键字。

## 保持 `class` 风格

`class` 定义了一个类的声明或表达式。作为声明，类定义出现在语句位置，如下所示：

```js
class Point2d {
    // ..
}
```

作为表达式，类定义出现在值位置，可以是命名的也可以是匿名的：

```js
// 命名的类表达式
const pointClass = class Point2d {
    // ..
};

// 匿名的类表达式
const anotherClass = class {
    // ..
};
```

`class` 主体的内容通常包括一个或多个方法定义：

```js
class Point2d {
    setX(x) {
        // ..
    }
    setY(y) {
        // ..
    }
}
```

在 `class` 主体内，定义方法时不使用 `function` 关键字，并且方法定义之间没有 `,` 或 `;` 分隔符。

| 注意： |
| :--- |
| 在 `class` 块内部，所有代码都运行在严格模式下，即使文件或其函数中没有 `"use strict"` 指令。特别是，这会影响函数调用的 `this` 行为，详见第 4 章。 |

### 构造函数 (The Constructor)

所有类都有的一个特殊方法叫做“构造函数”（constructor）。如果省略，定义中会假定有一个默认的空构造函数。

每当创建一个类的 `new` 实例时，构造函数就会被调用：

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
}

var point = new Point2d();
// Here's your new instance!
```

尽管语法暗示实际上存在一个名为 `constructor` 的函数，但 JS 定义了一个指定的函数，只不过名字是类的名字（上面的 `Point2d`）：

```js
typeof Point2d;       // "function"
```

但这不仅仅是一个普通函数；这种特殊的函数行为有点不同：

```js
Point2d.toString();
// class Point2d {
//   ..
// }

Point2d();
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'

Point2d.call({});
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'
```

你可以根据需要构造任意数量的类实例：

```js
var one = new Point2d();
var two = new Point2d();
var three = new Point2d();
```

这里的 `one`、`two` 和 `three` 都是对象，是 `Point2d` 类的独立实例。

| 注意： |
| :--- |
| `one`、`two` 和 `three` 对象每一个都有一个 `[[Prototype]]` 链接指向 `Point2d.prototype` 对象（见第 2 章）。在这段代码中，`Point2d` 既是 `class` 定义，也是同名的构造函数。 |

如果你向对象 `one` 添加一个属性：

```js
one.value = 42;
```

该属性现在仅存在于 `one` 上，独立的 `two` 或 `three` 对象无法以任何方式访问它：

```js
two.value;      // undefined
three.value;    // undefined
```

### 类方法 (Class Methods)

如上所示，类定义可以包含一个或多个方法定义：

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
    setX(x) {
        console.log(`Setting x to: ${x}`);
        // ..
    }
}

var point = new Point2d();

point.setX(3);
// Setting x to: 3
```

`setX` 属性（方法）*看起来*像是存在于（属于）这里的 `point` 对象上。但那是海市蜃楼。每个类方法都被添加到了 `prototype` 对象上，即构造函数的属性。

所以，`setX(..)` 仅作为 `Point2d.prototype.setX` 存在。由于 `point` 通过 `new` 关键字实例化被 `[[Prototype]]` 链接到 `Point2d.prototype`（见第 2 章），`point.setX(..)` 引用由于遍历 `[[Prototype]]` 链而找到了要执行的方法。

类方法应该仅通过实例调用；`Point2d.setX(..)` 不起作用，因为*没有*名为 `setX` 的属性。你*可以*调用 `Point2d.prototype.setX(..)`，但在标准的面向类编码中，这通常是不正确/不建议的。始终通过实例访问类方法。

## 类实例 `this`

我们将在随后的章节中更详细地介绍 `this` 关键字。但就面向类的代码而言，`this` 关键字通常指的是作为任何方法调用上下文的当前实例。

在构造函数以及任何方法中，你可以使用 `this.` 来添加或访问当前实例上的属性：

```js
class Point2d {
    constructor(x,y) {
        // add properties to the current instance
        this.x = x;
        this.y = y;
    }
    toString() {
        // access the properties from the current instance
        console.log(`(${this.x},${this.y})`);
    }
}

var point = new Point2d(3,4);

point.x;                // 3
point.y;                // 4

point.toString();       // (3,4)
```

除非持有函数值，否则添加到类实例（通常通过构造函数）的任何属性都被称为*成员*（members），这与可执行函数的术语*方法*（methods）相对。

当 `point.toString()` 方法运行时，其 `this` 引用指向 `point` 引用的同一对象。这就是为什么 `point.x` 和 `this.x` 都显示相同的 `3` 值，该值由构造函数通过 `this.x = x` 操作设置。

### 公有字段 (Public Fields)

类可以声明性地在 `class` 主体中定义*字段*，而不是在构造函数或方法中通过 `this.` 命令式地定义类实例成员，这些字段直接对应于将在每个实例上创建的成员：

```js
class Point2d {
    // these are public fields
    x = 0
    y = 0

    constructor(x,y) {
        // set properties (fields) on the current instance
        this.x = x;
        this.y = y;
    }
    toString() {
        // access the properties from the current instance
        console.log(`(${this.x},${this.y})`);
    }
}
```

公有字段可以有值初始化，如上所示，但这不是必需的。如果你不在类定义中初始化字段，通常应该在构造函数中初始化它。

字段也可以通过自然的 `this.` 访问语法相互引用：

```js
class Point3d {
    // these are public fields
    x
    y = 4
    z = this.y * 5

    // ..
}
```

| 提示： |
| :--- |
| 你基本上可以把公有字段声明想象成它们出现在 `constructor(..)` 的顶部，每一个都带有隐含的 `this.` 前缀，而在声明性的 `class` 主体形式中你可以省略它。但是，有一个陷阱！有关更多信息，请参阅后面的“妙极了！(That's Super!)”。 |

就像计算属性名（见第 1 章）一样，字段名也可以是计算出来的：

```js
var coordName = "x";

class Point2d {
    // computed public field
    [coordName.toUpperCase()] = 42

    // ..
}

var point = new Point2d(3,4);

point.x;        // 3
point.y;        // 4

point.X;        // 42
```

#### 避免这种做法

有一种已经出现并变得相当流行的模式，但我坚信这是 `class` 的反模式，如下所示：

```js
class Point2d {
    x = null
    y = null
    getDoubleX = () => this.x * 2

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);

point.getDoubleX();    // 6
```

看到持有 `=>` 箭头函数的字段了吗？我说这是一个禁忌。但为什么呢？让我们解开这里发生了什么。

首先，为什么要这样做？因为 JS 开发者似乎总是对动态 `this` 绑定规则感到沮丧（见第 4 章），所以他们通过 `=>` 箭头函数强制进行 `this` 绑定。这样，无论 `getDoubleX()` 如何被调用，它总是 `this` 绑定到特定实例。这是可以理解的便利需求，但是……它背叛了语言的 `this` / `[[Prototype]]` 支柱的本质。怎么背叛的？

让我们考虑与前一代码片段等效的代码：

```js
class Point2d {
    constructor(x,y) {
        this.x = null;
        this.y = null;
        this.getDoubleX = () => this.x * 2;

        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);

point.getDoubleX();    // 6
```

你能发现问题吗？仔细看。我等你。

...

到目前为止我们已经反复明确，`class` 定义将其方法放在类构造函数的 `prototype` 对象上——那是它们所属的地方！——这样每个函数只有一个，并且被所有实例继承（共享）。上面的 `toString()` 就是这样。

但在 `getDoubleX()` 怎么样？那本质上是一个类方法，但 JS 处理它的方式与 `toString()` 不同。考虑：

```js
Object.hasOwn(point,"x");               // true -- good
Object.hasOwn(point,"toString");        // false -- good
Object.hasOwn(point,"getDoubleX");      // true -- oops :(
```

现在你明白了吗？通过定义一个函数值并将其作为字段/成员属性附加，我们失去了函数的共享原型方法特性，它变得就像任何每个实例的属性一样。这意味着我们正在**为每个实例**创建一个新的函数属性，而不是在类构造函数的 `prototype` 上只创建一次。

即使只有一点点，这也是性能和内存的浪费。仅这一点就足以避免它。

但我认为更重要的是，这种模式所做的实际上是使使用 `class` 和这种可感知 `this` 的方法的理由变得毫无意义/不再强大！

如果你费尽周折定义了遍布 `this.` 引用的类方法，但随后你将大部分或所有这些方法锁定/绑定到特定的对象实例，你基本上就是绕了地球一圈却只是为了去隔壁。

如果你想要的只是一组静态固定在特定“上下文”中的函数，并且不需要任何动态性或共享，那么你想要的是……**闭包**（closure）。而且你很幸运：我在本系列中写了一整本书（《作用域与闭包》）讲述如何使用闭包以便函数记住/访问其静态定义的作用域（即“上下文”）。这是一种更合适且编码更简单的方法来获得你想要的东西。

不要滥用/误用 `class` 并把它变成一个过度炒作、美化的闭包集合。

明确一点，我*不是*说：永远不要在类里使用 `=>` 箭头函数。

我*是*说：永远不要为了盲目的习惯、偷懒少打几个字或者被误导的 `this` 绑定便利性，而将 `=>` 箭头函数作为实例属性来代替动态原型类方法。

在随后的章节中，我们将深入探讨如何理解并正确利用动态 `this` 机制的全部力量。

## 类扩展 (Class Extension)

解锁类继承能力的方法是通过 `extends` 关键字，它定义了两个类之间的关系：

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    printDoubleX() {
        console.log(`double x: ${this.getX() * 2}`);
    }
}

var point = new Point2d();

point.getX();                   // 3

var anotherPoint = new Point3d();

anotherPoint.getX();            // 21
anotherPoint.printDoubleX();    // double x: 42
```

花点时间重新阅读那段代码，确保你完全理解发生了什么。

基类 `Point2d` 定义了名为 `x` 和 `y` 的字段（成员），并分别给它们赋予初始值 `3` 和 `4`。它还定义了一个 `getX()` 方法来访问这个 `x` 实例成员并返回它。我们在 `point.getX()` 方法调用中看到了这种行为的说明。

但是 `Point3d` 类扩展了 `Point2d`，使得 `Point3d` 成为派生类、子类或（最常见的）子类（subclass）。在 `Point3d` 中，从 `Point2d` 继承的同一个 `x` 属性被重新初始化为不同的值 `21`，`y` 也从 `4` 覆盖为 `10`。

它还添加了一个新的 `z` 字段/成员方法，以及一个 `printDoubleX()` 方法，该方法本身调用 `this.getX()`。

当 `anotherPoint.printDoubleX()` 被调用时，继承的 `this.getX()` 因此被调用，该方法引用 `this.x`。由于 `this` 指向类实例（即 `anotherPoint`），它找到的值现在是 `21`（而不是来自 `point` 对象的 `x` 成员的 `3`）。

### 扩展表达式

// TODO: 涵盖 `class Foo extends ..` 其中 `..` 是一个表达式，而不是类名的情况

### 覆盖方法 (Overriding Methods)

除了在子类中覆盖字段/成员之外，你还可以覆盖（重新定义）方法：

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    getX() {
        return this.x * 2;
    }
    printX() {
        console.log(`double x: ${this.getX()}`);
    }
}

var point = new Point3d();

point.printX();       // double x: 42
```

`Point3d` 子类覆盖了继承的 `getX()` 方法以赋予其不同的行为。然而，你仍然可以实例化基类 `Point2d`，这将得到一个使用原始（`return this.x;`）定义的 `getX()` 的对象。

如果你想从子类访问继承的方法，即使它已被覆盖，你可以使用 `super` 而不是 `this`：

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    getX() {
        return this.x * 2;
    }
    printX() {
        console.log(`x: ${super.getX()}`);
    }
}

var point = new Point3d();

point.printX();       // x: 21
```

同名方法在不同层级的继承体系中，可以通过直接访问或用 `super` 相对访问来表现出不同行为的能力，称为*方法多态*（method polymorphism）。当使用得当时，这是面向类非常强大的一部分。

### 妙极了！(That's Super!)

除了子类方法通过 `super.` 引用访问继承的方法定义（即使在子类上被覆盖）之外，子类构造函数必须通过 `super(..)` 函数调用手动调用继承的基类构造函数：

```js
class Point2d {
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var point = new Point3d(3,4,5);

point.toString();       // (3,4,5)
```

| 警告： |
| :--- |
| 显式定义的子类构造函数*必须*调用 `super(..)` 来运行继承类的初始化，并且这必须发生在子类构造函数引用 `this` 或结束/返回之前。否则，当调用该子类构造函数（通过 `new`）时将抛出运行时异常。如果你省略子类构造函数，默认构造函数会自动——谢天谢地！——为你调用 `super()`。 |

需要注意的一个细微差别是：如果你在子类中定义了一个字段（公有或私有），并为此子类显式定义了一个 `constructor(..)`，字段初始化不会在构造函数的顶部处理，而是在 `super(..)` 调用和构造函数中任何后续代码*之间*处理。

密切注意这里控制台消息的顺序：

```js
class Point2d {
    x
    y
    constructor(x,y) {
        console.log("Running Point2d(..) constructor");
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z = console.log("Initializing field 'z'")

    constructor(x,y,z) {
        console.log("Running Point3d(..) constructor");
        super(x,y);

        console.log(`Setting instance property 'z' to ${z}`);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var point = new Point3d(3,4,5);
// Running Point3d(..) constructor
// Running Point2d(..) constructor
// Initializing field 'z'
// Setting instance property 'z' to 5
```

如控制台消息所示，`z = ..` 字段初始化发生在 `super(x,y)` 调用*之后*，在 ``console.log(`Setting instance...`)`` 执行*之前*。也许可以将其视为附加到 `super(..)` 调用末尾的字段初始化，因此它们在构造函数中的其他任何内容之前运行。

#### 哪个类？

你可能需要在构造函数中确定该类是直接被实例化，还是通过 `super()` 调用从子类被实例化。我们可以使用一个特殊的“伪属性” `new.target`：

```js
class Point2d {
    // ..

    constructor(x,y) {
        if (new.target === Point2d) {
            console.log("Constructing 'Point2d' instance");
        }
    }

    // ..
}

class Point3d extends Point2d {
    // ..

    constructor(x,y,z) {
        super(x,y);

        if (new.target === Point3d) {
            console.log("Constructing 'Point3d' instance");
        }
    }

    // ..
}

var point = new Point2d(3,4);
// Constructing 'Point2d' instance

var anotherPoint = new Point3d(3,4,5);
// Constructing 'Point3d' instance
```

### 可是哪种实例？

你可能想要内省某个对象实例，看看它是否是特定类的实例。我们使用 `instanceof` 运算符来做这件事：

```js
class Point2d { /* .. */ }
class Point3d extends Point2d { /* .. */ }

var point = new Point2d(3,4);

point instanceof Point2d;           // true
point instanceof Point3d;           // false

var anotherPoint = new Point3d(3,4,5);

anotherPoint instanceof Point2d;    // true
anotherPoint instanceof Point3d;    // true
```

看到 `anotherPoint instanceof Point2d` 结果为 `true` 可能会觉得奇怪。为了更好地理解原因，也许可视化两个 `[[Prototype]]` 链是有用的：

```
Point2d.prototype
        /       \
       /         \
      /           \
  point   Point3d.prototype
                    \
                     \
                      \
                    anotherPoint
```

`instanceof` 运算符不只是查看当前对象，而是遍历整个类继承层级（`[[Prototype]]` 链）直到找到匹配项。因此，`anotherPoint` 既是 `Point3d` 的实例，也是 `Point2d` 的实例。

为了更明显地说明这个事实，另一种（不那么符合人体工程学的）进行这种检查的方法（就像 `instanceof` 一样）是使用（从 `Object.prototype` 继承的）工具，`isPrototypeOf(..)`：

```js
Point2d.prototype.isPrototypeOf(point);             // true
Point3d.prototype.isPrototypeOf(point);             // false

Point2d.prototype.isPrototypeOf(anotherPoint);      // true
Point3d.prototype.isPrototypeOf(anotherPoint);      // true
```

这个工具让我们更清楚为什么 `Point2d.prototype.isPrototypeOf(anotherPoint)` 和 `anotherPoint instanceof Point2d` 都结果为 `true`：对象 `Point2d.prototype` *确实*在 `anotherPoint` 的 `[[Prototype]]` 链中。

如果你只想检查对象实例是否*仅且直接*由某个类创建，请检查实例的 `constructor` 属性。

```js
point.constructor === Point2d;          // true
point.constructor === Point3d;          // false

anotherPoint.constructor === Point2d;   // false
anotherPoint.constructor === Point3d;   // true
```

| 注意： |
| :--- |
| 这里显示的 `constructor` 属性实际上*不*存在于（属于）`point` 或 `anotherPoint` 实例对象上。那么它从哪来的！？它在每个对象的 `[[Prototype]]` 链接的原型对象上：`Point2d.prototype.constructor === Point2d` 和 `Point3d.prototype.constructor === Point3d`。 |

### “继承”是共享，而非复制

看起来当 `Point3d` `extends` `Point2d` 类时，本质上得到了 `Point2d` 中定义的所有行为的*副本*。此外，看起来具体的对象实例 `anotherPoint` 接收了*复制下来*到它的所有来自 `Point3d`（以及通过扩展，也来自 `Point2d`）的方法。

然而，这对于 JS 的面向类实现来说不是正确的思维模型。回想一下这个基类和子类定义，以及 `anotherPoint` 的实例化：

```js
class Point2d {
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var anotherPoint = new Point3d(3,4,5);
```

如果你检查 `anotherPoint` 对象，你会看到它上面只有 `x`、`y` 和 `z` 属性（实例成员），但没有 `toString()` 方法：

```js
Object.hasOwn(anotherPoint,"x");                       // true
Object.hasOwn(anotherPoint,"y");                       // true
Object.hasOwn(anotherPoint,"z");                       // true

Object.hasOwn(anotherPoint,"toString");                // false
```

那个 `toString()` 方法在哪里？在原型对象上：

```js
Object.hasOwn(Point3d.prototype,"toString");    // true
```

并且 `anotherPoint` 通过其 `[[Prototype]]` 链接有权访问该方法（见第 2 章）。换句话说，原型对象与子类和实例**共享对它们方法(s)的访问权限**。方法(s) 留在原地，并且没有被复制到继承链下。

尽管 `class` 语法很不错，但不要忘记语法之下真正发生了什么：JS *仅仅*是沿着 `[[Prototype]]` 链将对象彼此连接起来。

## 静态类行为 (Static Class Behavior)

到目前为止，我们强调了数据或行为（方法）驻留的两个不同位置：构造函数的原型上，或实例上。但还有第三个选项：在构造函数（函数对象）本身上。

在传统的面向类系统中，类上定义的方法并不是你可以调用或交互的具体事物。你必须实例化一个类才能有一个具体对象来调用这些方法。像 JS 这样的原型语言稍微模糊了这条界线：所有类定义的方法都是驻留在构造函数原型上的“真实”函数，因此你可以调用它们。但正如我之前断言的那样，你真的*不应该*这样做，因为这不是 JS 假设你会编写 `class` 的方式，而且你可能会遇到一些奇怪的边缘情况行为。最好留在 `class` 为你铺设的狭窄路径上。

并非所有我们定义并希望与类关联/组织的行为都*需要*感知实例。此外，有时一个类需要公开定义数据（如常量），使用该类的开发者需要访问这些数据，而与他们是否可能创建了任何实例无关。

那么，类系统如何能够在类中定义此类数据和行为，但独立于（不感知）实例对象呢？**静态属性和函数**。

| 注意： |
| :--- |
| 我将使用“静态属性”/“静态函数”，而不是“成员”/“方法”，只是为了更清楚地区分绑定实例的成员/感知实例的方法，与非实例属性和不感知实例的函数。 |

我们在 `class` 主体中使用 `static` 关键字来区分这些定义：

```js
class Point2d {
    // class statics
    static origin = new Point2d(0,0)
    static distance(point1,point2) {
        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2)
        );
    }

    // instance members and methods
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `(${this.x},${this.y})`;
    }
}

console.log(`Starting point: ${Point2d.origin}`);
// Starting point: (0,0)

var next = new Point2d(3,4);
console.log(`Next point: ${next}`);
// Next point: (3,4)

console.log(`Distance: ${
    Point2d.distance( Point2d.origin, next )
}`);
// Distance: 5
```

`Point2d.origin` 是一个静态属性，它恰好持有我们类的一个构造实例。而 `Point2d.distance(..)` 是一个静态函数，用于计算两点之间的二维笛卡尔距离。

当然，我们可以把这两个放在类定义之外的其他地方。但既然它们直接与 `Point2d` 类相关，将它们组织在那里*最有意义*。

| 注意： |
| :--- |
| 别忘了当你使用 `class` 语法时，名字 `Point2d` 实际上是 JS 定义的一个构造函数的名字。所以 `Point2d.origin` 只是那个函数对象上的一个普通属性访问。这就是我在本节开头提到存储与类相关的*事物*的第三个位置时的意思；在 JS 中，`static` 存储为构造函数上的属性。注意不要将这些与存储在构造函数 `prototype` 上的属性（方法）以及存储在实例上的属性（成员）混淆。 |

### 静态属性初始化

静态初始化中的值（`static whatever = ..`）可以包含 `this` 引用，它指的是类本身（实际上是构造函数）而不是实例：

```js
class Point2d {
    // class statics
    static originX = 0
    static originY = 0
    static origin = new this(this.originX,this.originY)

    // ..
}
```

| 警告： |
| :--- |
| 我不建议实际上做我在这里演示的 `new this(..)` 把戏。这只是为了演示目的。使用 `new Point2d(this.originX,this.originY)` 代码会更清晰，所以首选那种方法。 |

一个不可忽略的重要细节：与公有字段初始化仅在与（使用 `new`）实例化发生时才进行不同，类静态初始化总是在 `class` 定义后*立即*运行。此外，静态初始化的顺序很重要；你可以把这些语句想象成是被逐个评估的。

同样像类成员一样，静态属性不必初始化（默认：`undefined`），但这样做更为常见。声明一个没有初始值的静态属性（`static whatever`）没有多大用处；访问 `Point2d.whatever` 或 `Point2d.nonExistent` 都会导致 `undefined`。

最近（在 ES2022 中），`static` 关键字得到了扩展，现在可以在 `class` 主体内定义一个块，以便对 `static` 进行更复杂的初始化：

```js
class Point2d {
    // class statics
    static origin = new Point2d(0,0)
    static distance(point1,point2) {
        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2)
        );
    }

    // static initialization block (as of ES2022)
    static {
        let outerPoint = new Point2d(6,8);
        this.maxDistance = this.distance(
            this.origin,
            outerPoint
        );
    }

    // ..
}

Point2d.maxDistance;        // 10
```

这里的 `let outerPoint = ..` 不是特殊的 `class` 特性；它完全就像任何正常作用域块中的普通 `let` 声明（见本系列的“作用域与闭包”书）。我们仅仅是声明了一个分配给 `outerPoint` 的 `Point2d` 局部实例，然后使用该值来推导赋值给 `maxDistance` 静态属性。

静态初始化块对于像围绕表达式计算的 `try..catch` 语句之类的东西也很有用。

### 静态继承

类静态属性可以被子类继承（显然，作为静态属性！），可以被覆盖，并且 `super` 可用于基类引用（以及静态函数多态性），这与实例成员/方法的继承工作方式非常相似：

```js
class Point2d {
    static origin = /* .. */
    static distance(x,y) { /* .. */ }

    static {
        // ..
        this.maxDistance = /* .. */;
    }

    // ..
}

class Point3d extends Point2d {
    // class statics
    static origin = new Point3d(
        // here, `this.origin` references wouldn't
        // work (self-referential), so we use
        // `super.origin` references instead
        super.origin.x, super.origin.y, 0
    )
    static distance(point1,point2) {
        // here, super.distance(..) is Point2d.distance(..),
        // if we needed to invoke it

        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2) +
            ((point2.z - point1.z) ** 2)
        );
    }

    // instance members/methods
    z
    constructor(x,y,z) {
        super(x,y);     // <-- don't forget this line!
        this.z = z;
    }
    toString() {
        return `(${this.x},${this.y},${this.z})`;
    }
}

Point2d.maxDistance;        // 10
Point3d.maxDistance;        // 10
```

如你所见，我们在 `Point2d` 上定义的静态属性 `maxDistance` 在 `Point3d` 上作为静态属性被继承了。

| 提示： |
| :--- |
| 记住：任何时候你定义子类构造函数，都需要在其中调用 `super(..)`，通常作为第一条语句。我发现这也太容易忘记了。 |

不要跳过这里底层的 JS 行为。就像之前讨论的方法继承一样，静态“继承”*不是*将这些静态属性/函数从基类复制到子类；它是通过 `[[Prototype]]` 链进行共享。具体来说，构造函数 `Point3d()` 的 `[[Prototype]]` 链接被 JS 更改（从默认的 `Function.prototype`）为 `Point2d`，这正是允许 `Point3d.maxDistance` 委托给 `Point2d.maxDistance` 的原因。

这也很有趣，也许现在只是历史上的，值得注意的是静态继承——它是原始 ES6 `class` 机制特性集的一部分！——是超出“仅仅是语法糖”的一个特定特性。我们在这里说明的静态继承，在 ES6 之前的旧原型类代码风格中是*不可能*实现/模拟的。它是仅在 ES6 中引入的一种特殊新行为。

## 私有类行为 (Private Class Behavior)

到目前为止，我们作为 `class` 定义一部分讨论的所有内容都是公开可见/可访问的，无论是类上的静态属性/函数、构造函数 `prototype` 上的方法，还是实例上的成员属性。

但是，你如何存储不能从类外部看到的私有信息呢？这是最需要的功能之一，也是对 JS `class` 的最大抱怨之一，直到最终在 ES2022 中得到解决。

`class` 现在支持用于声明私有字段（实例成员）和私有方法的新语法。此外，私有静态属性/函数也是可能的。

### 动机？

在我们说明如何做 `class` 私有化之前，值得思考一下为什么这是一个有用的特性？

对于基于闭包的设计模式（再次参见本系列的“作用域与闭包”书），我们自动获得了内置的“隐私”。当你在一个作用域内声明一个变量时，它无法在该作用域之外被看到。句号。减少声明的作用域可见性有助于防止命名空间冲突（相同的变量名）。

但更重要的是确保软件的正确“防御性”设计，即所谓的“最小权限原则”（Principle of Least Privilege）[^POLP]。POLP 指出，我们需要只向必要的最小表面积暴露软件中的信息或能力。

过度暴露使我们的软件面临几个使软件安全/维护复杂化的问题，包括另一段代码恶意行为去做我们的代码没预期或不打算做的事情。此外，通过让软件的其他部分依赖（使用）我们应该保留为隐藏实现细节的部分代码，存在不那么关键但同样有问题的担忧。一旦其他代码依赖于我们代码的实现细节，我们就无法在不潜在破坏程序其他部分的情况下重构我们的代码。

所以，简而言之，如果是没必要暴露的实现细节，我们*应该*隐藏它们。从这个意义上说，JS 的 `class` 系统感觉有点过于宽容，因为一切都默认为公有。类私有特性是更合理的软件设计的受欢迎补充。

#### 太私有了？

话虽如此，我不得不给类私有派对泼点冷水。

我强烈建议，只有当你打算真正利用面向类给予你的大部分或全部东西时，才应该使用 `class`。否则，你最好使用 JS 的其他核心支柱特性来组织代码，例如使用闭包模式。

面向类最重要的方面之一是子类继承，正如我们在本章中多次看到的那样。猜猜当基类中的私有成员/方法被子类扩展时会发生什么？

私有成员/方法**仅对定义它们的类**是私有的，并且**不会**以任何方式被子类继承。哎呀。

这看起来似乎不是什么大问题，直到你开始在真实软件中使用 `class` 和私有成员/方法。你可能会很快遇到一种情况，即你需要从子类访问私有方法，或者甚至更常见的，只是访问私有成员，以便子类可以按需扩展/增强基类的行为。一旦你意识到这是不可能的，你可能会很快气得尖叫。

接下来的通常是一个尴尬的决定：你是否就退回到将其设为公有，以便子类可以访问它？唉。或者，更糟糕的是，你是否尝试重新设计基类以扭曲其成员/方法的设计，从而部分绕过访问限制。这通常涉及方法的过度参数化（使用私有作为默认参数值）和其他类似的技巧。双重唉。

老实说，这里没有特别好的答案。如果你有像 Java 或 C++ 这样更传统的类语言的面向类经验，你可能会怀疑为什么我们在*公有*和*私有*之间没有*受保护*（protected）的可见性。这正是*受保护*的作用：保持某物对类及其任何子类私有。那些语言也有*友元*（friend）特性，但这超出了我们在这里讨论的范围。

可悲的是，JS 不仅没有*受保护*的可见性，而且看起来（尽管它很有用！）不太可能成为 JS 的特性。关于它的讨论已经进行了十多年（甚至在 ES6 出现之前），并且有多个关于它的提案。

我不应该说它*永远*不会发生，因为在任何软件中这都不是牢固的立场。但这是非常不可能的，因为它实际上背叛了 `class` 构建的基础支柱。如果你好奇，或者（更有可能）确信*一定有办法*，我将在附录中介绍*受保护*可见性在 JS 机制中的不兼容性。

这里的重点是，截至目前，JS 没有*受保护*的可见性，而且短期内也不会有。而实际上，在实践中，*受保护*的可见性比*私有*可见性有用得多。

所以我们回到问题：**为什么你要关心让任何 `class` 内容私有化？**

如果我诚实地说：也许你不应该。或者也许你应该。这取决于你。只要在进入时意识到这些绊脚石即可。

### 私有成员/方法

你很高兴终于看到神奇的*私有*可见性的语法了，对吧？如果你对即将看到的内容感到愤怒或悲伤，请不要迁怒于信使。

```js
class Point2d {
    // statics
    static samePoint(point1,point2) {
        return point1.#ID === point2.#ID;
    }

    // privates
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // publics
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(3,4);
var two = new Point2d(3,4);

Point2d.samePoint(one,two);         // false
Point2d.samePoint(one,one);         // true
```

不，JS 没有做明智的事情并引入像 `static` 那样的 `private` 关键字。相反，他们引入了 `#`。（插入关于社交媒体千禧一代喜欢话题标签之类的烂笑话）

| 提示： |
| :--- |
| 是的，关于为什么不这样做有一百万零一个讨论。我可以花几章来复述整个历史，但老实说我只是不想费心。我认为这种语法很丑陋，许多其他人也这么认为。但也有些人喜欢它！如果你属于后者，虽然我很少这样做，但我只想说：**接受它吧**。现在进行更多的辩论或请求都太晚了。 |

`#whatever` 语法（包括 `this.#whatever` 形式）仅在 `class` 主体内部有效。如果在 `class` 外部使用，它将抛出语法错误。

与公有字段/实例成员不同，私有字段/实例成员*必须*在 `class` 主体中声明。你不能在构造函数方法中动态地向类声明添加私有成员；`this.#whatever = ..` 类型的赋值仅在 `#whatever` 私有字段在类主体中声明时有效。此外，虽然私有字段可以重新赋值，但它们不能像公有字段/类成员那样从实例中被 `delete`。

#### 子类化 + 私有

我早先警告过，使用具有私有成员/方法的类进行子类化可能是一个限制性的陷阱。但这并不意味着它们不能一起使用。

因为 JS 中的“继承”是共享（通过 `[[Prototype]]` 链），如果你在子类中调用一个继承的方法，而该继承的方法反过来访问/调用其宿主（基）类中的私有成员，这工作正常：

```js
class Point2d { /* .. */ }

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
}

var one = new Point3d(3,4,5);
```

这个构造函数中的 `super(x,y)` 调用调用了继承的基类构造函数（`Point2d(..)`），该构造函数本身访问 `Point2d` 的私有方法 `#assignID()`（见前面的代码片段）。即使 `Point3d` 不能直接看到或访问确实存储在实例（此处名为 `one`）上的 `#ID` / `#assignID()` 私有成员，也不会抛出异常。

事实上，即使是继承的 `static samePoint(..)` 函数也将在 `Point3d` 或 `Point2d` 中工作：

```js
Point2d.samePoint(one,one);         // true
Point3d.samePoint(one,one);         // true
```

实际上，这不应该那么令人惊讶，因为：

```js
Point2d.samePoint === Point3d.samePoint;
```

继承的函数引用是*完全相同的函数*引用；它不是函数的某个副本。因为所讨论的函数中没有 `this` 引用，所以无论从哪里调用它，都应该产生相同的结果。

尽管如此，令人遗憾的是 `Point3d` 没有办法访问/影响，甚至不知道来自 `Point2d` 的 `#ID` / `#assignID()` 私有成员：

```js
class Point2d { /* .. */ }

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;

        console.log(this.#ID);      // will throw!
    }
}
```

| 警告： |
| :--- |
| 注意，这个代码片段在定义 `Point3d` 类时抛出了一个早期的静态语法错误，甚至还没来得及创建该类的实例。如果引用是 `super.#ID` 而不是 `this.#ID`，也会抛出相同的异常。 |

#### 存在性检查

请记住，只有 `class` 本身知道，因此可以检查这种私有字段/方法。

你可能想检查对象实例上是否存在私有字段/方法。例如（如下所示），你可能在类中有一个静态函数或方法，它接收传入的外部对象引用。为了检查传入的对象引用是否属于同一类（因此其中具有相同的私有成员/方法），你基本上需要针对对象进行“品牌检查”（brand check）。

这样的检查可能相当复杂，因为如果你访问对象上不存在的私有字段，你会得到一个抛出的 JS 异常，需要丑陋的 `try..catch` 逻辑。

但有一种更清晰的方法，即所谓的“人体工程学品牌检查”，使用 `in` 关键字：The user wants to translate the file `objects-classes/ch3.md` into Chinese. I have read the file content. I will now perform the translation and return the full content.

```markdown
# 你并不了解 JavaScript：对象与类 - 第二版
# 第 3 章：类风格的对象 (Classy Objects)

| 注意： |
| :--- |
| 本书正在撰写中 |

类设计模式通常包括定义一种*事物的类型*（类），其中包括数据（成员）和行为（方法），然后创建该类定义的一个或多个具体*实例*作为实际对象，以便进行交互和执行任务。此外，面向类（class-orientation）允许通过所谓的“继承”声明两个或多个类之间的关系，从而派生出新的和增强的“子类”，这些子类可以混合搭配甚至重新定义行为。

在 ES6（2015）之前，JS 开发者使用普通函数和对象，配合 `[[Prototype]]` 机制（如前一章所述）来模拟面向类（即“面向对象”）设计的各个方面——即所谓的“原型类”。

但在许多开发者的喜悦和解脱中，ES6 引入了专用语法，包括 `class` 和 `extends` 关键字，以便更声明式地表达面向类的设计。

在 ES6 引入 `class` 时，这种新的专用语法几乎完全*就是语法糖*，旨在使类定义更加方便和易读。然而，在 ES6 之后的许多年中，`class` 已成熟并成长为自己的一等特性机制，积累了大量专用语法和复杂行为，这些功能远远超过了 ES6 之前的“原型类”能力。

尽管现在的 `class` 与旧的“原型类”代码风格几乎没有相似之处，但 JS 引擎仍然*只是*通过现有的 `[[Prototype]]` 机制将对象彼此连接起来。换句话说，`class` 并不是语言中独立的一个支柱（像 `[[Prototype]]` 那样），而更像是支柱/柱子顶端那个花哨、具装饰性的*大写字母（Capital，双关语，也指柱头）*。

也就是说，由于 `class` 风格的代码现在几乎已经取代了所有之前的“原型类”编码方式，本文主要关注 `class` 及其各种细节。出于历史目的，我们将会在附录中简要介绍旧的“原型类”风格。

## 我应该何时对代码进行面向类设计？

面向类是一种设计模式，这意味着它是你组织程序中信息和行为的一种选择。它有利有弊。它不是解决所有任务的通用方案。

那么，你怎么知道什么时候应该使用类呢？

从理论意义上讲，面向类是一种将程序的业务领域划分为一个或多个部分的方法，每个部分都可以通过“是一个（is-a）”的分类来定义：将一个事物归类到该事物与其他类似事物共享的特征集（或多个集合）中。你会说“X 是一个 Y”，意思是 X 具有（至少）Y 类事物的所有特征。

例如，考虑计算机。我们可以说计算机是电气的（electrical），因为它使用电流（电压、安培等）作为动力。此外，它是电子的（electronic），因为它不仅仅是路由电子（电场/磁场），而且还操纵电流，创建一个有意义的电路来操纵电流以执行更复杂的任务。相比之下，基本的台灯是电气的，但并不是真正的电子产品。

因此，我们可以定义一个类 `Electrical` 来描述电气设备需要什么以及能做什么。然后我们可以定义进一步的类 `Electronic`，并定义除了是电气的之外，`Electronic` 事物还操纵电力以产生更专门的结果。

这正是面向类开始大放异彩的地方。与其在 `Electronic` 类中重新定义所有 `Electrical` 特征，我们可以定义 `Electronic`，使其从 `Electrical` “共享”或“继承”这些特征，然后增强/重新定义使设备成为电子设备的独特行为。这种两个类之间的关系——称为“继承”——是面向类的一个关键方面。

所以面向类是一种思考程序所需实体的方法，根据它们的特征（它们持有哪些信息，可以对该数据执行哪些操作）将它们分类为分组，并定义不同特征分组之间的关系。

但从理论转向更务实的角度：如果你的程序需要同时持有和使用多组（实例）相似的数据/行为，你*可能*会从面向类中受益。

### 举个例子

这是一个简短的说明。

几十年前，就在我在大学完成了几乎所有的计算机科学学位课程之后，我发现自己正处于第一份专业软件开发工作的岗位上。我的任务是独自构建一个工时单和薪资跟踪系统。我用 PHP 构建了后端（使用 MySQL 作为数据库），并使用 JS 作为界面（尽管早在世纪之交它还很不成熟）。

由于我的 CS 学位在整个课程中都非常强调面向类，我渴望将所有这些理论付诸实践。对于我的程序设计，我将“工时单”实体的概念定义为 2-3 个“周”实体的集合，每个“周”是 5-7 个“日”实体的集合，每个“日”是“任务”实体的集合。

如果我想知道一个工时单实例中记录了多少小时，我可以调用该实例上的 `totalTime()` 操作。工时单通过循环遍历其周集合，在每个周上调用 `totalTime()` 并汇总这些值来定义此操作。每一周对它的所有日子做同样的事情，每一天对它的所有任务做同样的事情。

这里说明的概念，即像面向类这样的设计模式的基础之一，称为*封装（encapsulation）*。每个实体层封装（例如，控制、隐藏、抽象）内部细节（数据和行为），同时呈现有用的外部接口。

但仅凭封装并不是面向类的充分理由。其他设计模式也提供了足够的封装。

我的类设计是如何利用继承的呢？我有一个基类，定义了一组像 `totalTime()` 这样的操作，我的每个实体类类型都扩展/子类化了这个基类。这意味着它们每一个都继承了这个总时间求和的能力，但是它们每一个都应用了自己的扩展和定义，以此来处理*如何*完成这项工作的内部细节。

这里还有另一个设计模式在起作用，那就是*组合（composition）*：每个实体都被定义为其他实体的集合。

### 单个与多个

我在上面提到，决定是否需要面向类的一个务实方法是，你的程序是否会有单一类型行为的多个实例（即“类”）。在工时单示例中，我们有 4 个类：工时单、周、日和任务。但是对于每个类，我们要同时拥有每个类的多个实例。

如果我们只需要一个类的单个实例，比如只有一个 `Computer` 事物，它是 `Electronic` 类的实例，而 `Electronic` 类是 `Electrical` 类的子类，那么面向类可能不会提供那么多的好处。特别是，如果程序不需要创建 `Electrical` 类的实例，那么将 `Electrical` 与 `Electronic` 分开就没有什么特别的好处，所以我们并没有真正从面向类的继承方面得到任何帮助。

所以，如果你发现自己通过将业务问题领域划分为不同的实体“类”来设计程序，但在程序的实际代码中，你只需要一种特定行为定义（即“类”）的一个具体*事物*，那么你很可能实际上并不需要面向类。还有其他设计模式可能更匹配你的工作效率。

但是，如果你发现自己想要定义类，以及从中继承的子类，并且你要多次实例化其中一个或多个类，那么面向类是一个不错的选择。要在 JS 中进行面向类编程，你需要 `class` 关键字。

## 保持 `class` 风格

`class` 定义了一个类的声明或表达式。作为声明，类定义出现在语句位置，如下所示：

```js
class Point2d {
    // ..
}
```

作为表达式，类定义出现在值位置，既可以有名称也可以是匿名的：

```js
// 具名类表达式
const pointClass = class Point2d {
    // ..
};

// 匿名类表达式
const anotherClass = class {
    // ..
};
```

`class` 主体的内容通常包括一个或多个方法定义：

```js
class Point2d {
    setX(x) {
        // ..
    }
    setY(y) {
        // ..
    }
}
```

在 `class` 主体内部，定义方法时不使用 `function` 关键字，方法定义之间也没有 `,` 或 `;` 分隔符。

| 注意： |
| :--- |
| 在 `class` 块内部，所有的代码都以严格模式运行，即使文件或其函数中没有 `"use strict"` 指令。特别地，这会影响函数调用中的 `this` 行为，如第 4 章所述。 |

### 构造函数

所有类都有的一个特殊方法称为“构造函数（constructor）”。如果省略，定义中会假定有一个默认的空构造函数。

每当创建类的 `new` 实例时，都会调用构造函数：

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
}

var point = new Point2d();
// Here's your new instance!
```

虽然语法暗示确实存在一个名为 `constructor` 的函数，但 JS 定义的是一个如规定那样的函数，但使用的是类的名称（上面的 `Point2d`）：

```js
typeof Point2d;       // "function"
```

不过，它不*仅仅*是一个普通函数；这种特殊的函数行为有点不同：

```js
Point2d.toString();
// class Point2d {
//   ..
// }

Point2d();
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'

Point2d.call({});
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'
```

你可以根据需要构建任意数量的类实例：

```js
var one = new Point2d();
var two = new Point2d();
var three = new Point2d();
```

这里的 `one`、`two` 和 `three` 每一个都是独立于 `Point2d` 类的实例对象。

| 注意： |
| :--- |
| `one`、`two` 和 `three` 对象每一个都有到 `Point2d.prototype` 对象的 `[[Prototype]]` 链接（参见第 2 章）。在这段代码中，`Point2d` 既是 `class` 定义，也是同名的构造函数。 |

如果你向对象 `one` 添加一个属性：

```js
one.value = 42;
```

该属性现在仅存在于 `one` 上，独立的 `two` 或 `three` 对象无法以任何方式访问它：

```js
two.value;      // undefined
three.value;    // undefined
```

### 类方法

如上所示，类定义可以包括一个或多个方法定义：

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
    setX(x) {
        console.log(`Setting x to: ${x}`);
        // ..
    }
}

var point = new Point2d();

point.setX(3);
// Setting x to: 3
```

这里的 `setX` 属性（方法）*看起来*像是存在于（被拥有于）`point` 对象上。但这是一种幻觉。每个类方法都被添加到了 `prototype` 对象上，该对象是构造函数的一个属性。

所以，`setX(..)` 仅作为 `Point2d.prototype.setX` 存在。由于 `point` 通过 `new` 关键字实例化而被 `[[Prototype]]` 链接到 `Point2d.prototype`（参见第 2 章），所以 `point.setX(..)` 引用遍历了 `[[Prototype]]` 链并找到了要执行的方法。

类方法应该仅通过实例调用；`Point2d.setX(..)` 不起作用，因为*没有*这样的属性。你*可以*调用 `Point2d.prototype.setX(..)`，但在标准的面向类编码中，这通常是不正确/不建议的。始终通过实例访问类方法。

## 类实例 `this`

我们将在随后的章节中更详细地介绍 `this` 关键字。但就面向类的代码而言，`this` 关键字通常指的是作为任何方法调用上下文的当前实例。

在构造函数以及任何方法中，你可以使用 `this.` 来添加或访问当前实例上的属性：

```js
class Point2d {
    constructor(x,y) {
        // 向当前实例添加属性
        this.x = x;
        this.y = y;
    }
    toString() {
        // 访问当前实例的属性
        console.log(`(${this.x},${this.y})`);
    }
}

var point = new Point2d(3,4);

point.x;                // 3
point.y;                // 4

point.toString();       // (3,4)
```

添加到类实例（通常通过构造函数）的不持有函数值的任何属性都被称为*成员（members）*，以此区别于可执行函数的术语*方法（methods）*。

当 `point.toString()` 方法运行时，其 `this` 引用指向 `point` 引用的同一对象。这就是为什么 `point.x` 和 `this.x` 都显示了构造函数通过其 `this.x = x` 操作设置的相同的 `3` 值。

### 公有字段

类不需要在构造函数或方法中通过 `this.` 命令式地定义类实例成员，而是可以在 `class` 主体中声明式地定义*字段（fields）*，这些字段直接对应于将在每个实例上创建的成员：

```js
class Point2d {
    // 这些是公有字段
    x = 0
    y = 0

    constructor(x,y) {
        // 在当前实例上设置属性（字段）
        this.x = x;
        this.y = y;
    }
    toString() {
        // 从当前实例访问属性
        console.log(`(${this.x},${this.y})`);
    }
}
```

公有字段可以有值初始化，如上所示，但这不是必需的。如果你不在类定义中初始化字段，那你几乎总是应该在构造函数中初始化它。

字段也可以通过自然的 `this.` 访问语法相互引用：

```js
class Point3d {
    // 这些是公有字段
    x
    y = 4
    z = this.y * 5

    // ..
}
```

| 提示： |
| :--- |
| 你可以主要将公有字段声明看作是出现在 `constructor(..)` 顶部的代码，每个都前缀了一个隐含的 `this.`，而在声明式 `class` 主体形式中你可以省略它。但是，这里有个陷阱！请参阅后面的“那是 Super！”以获取更多相关信息。 |

就像计算属性名（参见第 1 章）一样，字段名也可以是计算出来的：

```js
var coordName = "x";

class Point2d {
    // 计算公有字段
    [coordName.toUpperCase()] = 42

    // ..
}

var point = new Point2d(3,4);

point.x;        // 3
point.y;        // 4

point.X;        // 42
```

#### 避免这种情况

有一种已经出现并变得相当流行的模式，但我坚信这是 `class` 的反模式，如下所示：

```js
class Point2d {
    x = null
    y = null
    getDoubleX = () => this.x * 2

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);

point.getDoubleX();    // 6
```

看到持有 `=>` 箭头函数的字段了吗？我说这是不可取的。通过为什么呢？让我们拆解一下发生了什么。

首先，为什么要这样做？因为 JS 开发者似乎总是对动态的 `this` 绑定规则感到沮丧（参见第 4 章），所以他们通过 `=>` 箭头函数强制进行 `this` 绑定。这样，无论如何调用 `getDoubleX()`，它总是 `this` 绑定到特定实例。这是一种可以理解的便利，但是……它背叛了语言的 `this` / `[[Prototype]]` 支柱的本质。怎么会呢？

让我们考虑与前面片段等效的代码：

```js
class Point2d {
    constructor(x,y) {
        this.x = null;
        this.y = null;
        this.getDoubleX = () => this.x * 2;

        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);

point.getDoubleX();    // 6
```

你能发现问题吗？仔细看。我会等的。

...

到目前为止，我们已经反复明确表示，`class` 定义将其方法放在类构造函数的 `prototype` 对象上——那是它们所属的地方！——这样就只有一个函数，并且由所有实例继承（共享）。这将是上述片段中 `toString()` 的情况。

但 `getDoubleX()` 呢？那本质上是一个类方法，但 JS 不会像处理 `toString()` 那样处理它。考虑一下：

```js
Object.hasOwn(point,"x");               // true -- 很好
Object.hasOwn(point,"toString");        // false -- 很好
Object.hasOwn(point,"getDoubleX");      // true -- 哎呀 :(
```

现在你明白了吗？通过定义一个函数值并将其作为字段/成员属性附加，我们正在失去该函数的共享原型方法特性，它变成了就像任何每实例属性一样。这意味着我们正在为**每个实例**创建一个新的函数属性，而不是在类构造函数的 `prototype` 上只创建一次。

这在性能和内存上是浪费的，即使只有一点点。仅此一点就足以避免它。

但我会争辩说，更关键的是，你用这种模式所做的是使 `class` 和 `this` 感知方法有用的/强大的根本原因失效！

如果你费尽周折地定义带有 `this.` 引用的类方法，但随后你将大多数或所有这些方法锁定/绑定到特定对象实例，那你基本上就是为了去隔壁而绕了地球一圈。

如果你想要的只是静态固定到特定“上下文”的函数，而不需要任何动态性或共享，那么你想要的是……**闭包（closure）**。而且你很幸运：在本系列的另一本书（“作用域与闭包”）中，我写了一整本关于如何使用闭包使函数记住/访问其静态定义的作用域（即“上下文”）的书。那是获得你所追求的东西的一种更合适且更容易编码的方法。

不要滥用/误用 `class`，把它变成一个过度炒作的、美化的闭包集合。

明确一点，我*不是*说：永远不要在类内部使用 `=>` 箭头函数。

我*是*说：永远不要为了省去按键的懒惰，或为了被误导的 `this` 绑定便利，而机械地将 `=>` 箭头函数作为实例属性来代替动态原型类方法。

在随后的章节中，我们将深入探讨如何理解并正确利用动态 `this` 机制的全部力量。

## 类扩展

解锁类继承力量的方法是通过 `extends` 关键字，它定义了两个类之间的关系：

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    printDoubleX() {
        console.log(`double x: ${this.getX() * 2}`);
    }
}

var point = new Point2d();

point.getX();                   // 3

var anotherPoint = new Point3d();

anotherPoint.getX();            // 21
anotherPoint.printDoubleX();    // double x: 42
```

花点时间重新阅读该代码片段，确保你完全理解正在发生的事情。

基类 `Point2d` 定义了名为 `x` 和 `y` 的字段（成员），并分别给出了初始值 `3` 和 `4`。它还定义了一个 `getX()` 方法，该方法访问此 `x` 实例成员并返回它。我们在 `point.getX()` 方法调用中看到了这种行为。

但是 `Point3d` 类扩展了 `Point2d`，使得 `Point3d` 成为派生类、子类或（最常见的）subclass。在 `Point3d` 中，从 `Point2d` 继承的同一个 `x` 属性被重新初始化为不同的 `21` 值，`y` 也从 `4` 被覆盖为 `10`。

它还添加了一个新的 `z` 字段/成员方法，以及一个 `printDoubleX()` 方法，该方法本身调用 `this.getX()`。

当 `anotherPoint.printDoubleX()` 被调用时，继承的 `this.getX()` 随即被调用，该方法引用了 `this.x`。由于 `this` 指向类实例（即 `anotherPoint`），它找到的值现在是 `21`（而不是来自 `point` 对象的 `x` 成员的 `3`）。

### 扩展示达式

// TODO: 涵盖 `class Foo extends ..`，其中 `..` 是一个表达式，而不是一个类名

### 覆盖方法

除了覆盖子类中的字段/成员外，你还可以覆盖（重新定义）方法：

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    getX() {
        return this.x * 2;
    }
    printX() {
        console.log(`double x: ${this.getX()}`);
    }
}

var point = new Point3d();

point.printX();       // double x: 42
```

`Point3d` 子类覆盖了继承的 `getX()` 方法以赋予其不同的行为。但是，你仍然可以实例化基类 `Point2d`，它将提供一个使用 `getX()` 的原始（`return this.x;`）定义的对象。

如果你想从子类访问继承的方法，即使它已被覆盖，你也可以使用 `super` 代替 `this`：

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    getX() {
        return this.x * 2;
    }
    printX() {
        console.log(`x: ${super.getX()}`);
    }
}

var point = new Point3d();

point.printX();       // x: 21
```

在继承层次结构的不同级别上具有相同名称的方法，在直接访问或通过 `super` 相对访问时表现出不同行为的能力，称为*方法多态（method polymorphism）*。如果使用得当，它是面向类的一个非常强大的部分。

### 那是 Super！

除了子类方法通过 `super.` 引用访问继承的方法定义（即使在子类上被覆盖）之外，子类构造函数必须通过 `super(..)` 函数调用手动调用继承的基类构造函数：

```js
class Point2d {
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var point = new Point3d(3,4,5);

point.toString();       // (3,4,5)
```

| 警告： |
| :--- |
| 显式定义的子类构造函数*必须*调用 `super(..)` 来运行继承类的初始化，并且这必须发生在子类构造函数对 `this` 进行任何引用或完成/返回之前。否则，当调用该子类构造函数（通过 `new`）时，将抛出运行时异常。如果你省略子类构造函数，默认构造函数会自动——谢天谢地！——为你调用 `super()`。 |

需要注意的一个细微差别是：如果你在子类内部定义了一个字段（公有或私有），并为此子类显式定义了一个 `constructor(..)`，那么字段初始化不会在构造函数的顶部处理，而是在 `super(..)` 调用和构造函数中的任何后续代码*之间*处理。

请密切注意这里的控制台消息顺序：

```js
class Point2d {
    x
    y
    constructor(x,y) {
        console.log("Running Point2d(..) constructor");
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z = console.log("Initializing field 'z'")

    constructor(x,y,z) {
        console.log("Running Point3d(..) constructor");
        super(x,y);

        console.log(`Setting instance property 'z' to ${z}`);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var point = new Point3d(3,4,5);
// Running Point3d(..) constructor
// Running Point2d(..) constructor
// Initializing field 'z'
// Setting instance property 'z' to 5
```

正如控制台消息所示，`z = ..` 字段初始化发生在 `super(x,y)` 调用*之后*，在 ``console.log(`Setting instance...`)`` 执行*之前*。也许可以将其视为附加到 `super(..)` 调用末尾的字段初始化，因此它们在构造函数中的其他任何内容之前运行。

#### 哪个类？

你可能需要在构造函数中确定该类是直接实例化的，还是通过 `super()` 调用从子类实例化的。我们可以使用一个特殊的“伪属性” `new.target`：

```js
class Point2d {
    // ..

    constructor(x,y) {
        if (new.target === Point2d) {
            console.log("Constructing 'Point2d' instance");
        }
    }

    // ..
}

class Point3d extends Point2d {
    // ..

    constructor(x,y,z) {
        super(x,y);

        if (new.target === Point3d) {
            console.log("Constructing 'Point3d' instance");
        }
    }

    // ..
}

var point = new Point2d(3,4);
// Constructing 'Point2d' instance

var anotherPoint = new Point3d(3,4,5);
// Constructing 'Point3d' instance
```

### 但哪种实例？

你可能想要自省某个对象实例，看看它是否是特定类的实例。我们使用 `instanceof` 运算符来做到这一点：

```js
class Point2d { /* .. */ }
class Point3d extends Point2d { /* .. */ }

var point = new Point2d(3,4);

point instanceof Point2d;           // true
point instanceof Point3d;           // false

var anotherPoint = new Point3d(3,4,5);

anotherPoint instanceof Point2d;    // true
anotherPoint instanceof Point3d;    // true
```

看到 `anotherPoint instanceof Point2d` 结果为 `true` 可能会觉得奇怪。为了更好地理解原因，也许可视化这两个 `[[Prototype]]` 链会有所帮助：

```
Point2d.prototype
        /       \
       /         \
      /           \
  point   Point3d.prototype
                    \
                     \
                      \
                    anotherPoint
```

`instanceof` 运算符不只是查看当前对象，而是遍历整个类继承层次结构（`[[Prototype]]` 链），直到找到匹配项。因此，`anotherPoint` 既是 `Point3d` 的实例，也是 `Point2d` 的实例。

为了更明显地说明这个事实，另一种（不太符合人体工程学）进行类似 `instanceof` 类检查的方法是使用（从 `Object.prototype` 继承的）工具，`isPrototypeOf(..)`：

```js
Point2d.prototype.isPrototypeOf(point);             // true
Point3d.prototype.isPrototypeOf(point);             // false

Point2d.prototype.isPrototypeOf(anotherPoint);      // true
Point3d.prototype.isPrototypeOf(anotherPoint);      // true
```

这个工具让 `Point2d.prototype.isPrototypeOf(anotherPoint)` 和 `anotherPoint instanceof Point2d` 结果都为 `true` 的原因变得更清楚了：对象 `Point2d.prototype` *确实*在 `anotherPoint` 的 `[[Prototype]]` 链中。

如果你想检查对象实例是否*仅且直接*由某个类创建，请检查实例的 `constructor` 属性。

```js
point.constructor === Point2d;          // true
point.constructor === Point3d;          // false

anotherPoint.constructor === Point2d;   // false
anotherPoint.constructor === Point3d;   // true
```

| 注意： |
| :--- |
| 这里显示的 `constructor` 属性实际上并不存在于（被拥有于）`point` 或 `anotherPoint` 实例对象上。那么它从哪里来的呢！？它在每个对象的 `[[Prototype]]` 链接的原型对象上：`Point2d.prototype.constructor === Point2d` 和 `Point3d.prototype.constructor === Point3d`。 |

### “继承”是共享，而非复制

看起来 `Point3d` 在 `extends` `Point2d` 类时，本质上得到了 `Point2d` 中定义的所有行为的*副本*。此外，看起来具体的对象实例 `anotherPoint` 接收了*复制下来*的来自 `Point3d`（并推而广之，也来自 `Point2d`）的所有方法。

然而，这并不是用于 JS 面向类实现的正确心智模型。回顾这个基类和子类的定义，以及 `anotherPoint` 的实例化：

```js
class Point2d {
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var anotherPoint = new Point3d(3,4,5);
```

如果你检查 `anotherPoint` 对象，你会看到它只有 `x`、`y` 和 `z` 属性（实例成员），但没有 `toString()` 方法：

```js
Object.hasOwn(anotherPoint,"x");                       // true
Object.hasOwn(anotherPoint,"y");                       // true
Object.hasOwn(anotherPoint,"z");                       // true

Object.hasOwn(anotherPoint,"toString");                // false
```

那个 `toString()` 方法在哪里？在原型对象上：

```js
Object.hasOwn(Point3d.prototype,"toString");    // true
```

且 `anotherPoint` 通过其 `[[Prototype]]` 链接（参见第 2 章）可以访问该方法。换句话说，原型对象与子类和实例**共享对它们方法（s）的访问**。方法（s）保留在原位，不会复制到继承链中。

尽管 `class` 语法很棒，但不要忘记语法之下真正发生的事情：JS *只是*沿着 `[[Prototype]]` 链将对象彼此连接起来。

## 静态类行为

到目前为止，我们强调了数据或行为（方法）驻留的两个不同位置：构造函数的原型上，或实例上。但还有第三个选项：在构造函数（函数对象）本身上。

在传统的面向类系统中，定义在类上的方法不是你能够调用或交互的具体事物。你必须实例化一个类才能拥有一个具体的对象来调用这些方法。像 JS 这样的原型语言稍微模糊了这条界线：所有类定义的方法都是驻留在构造函数原型上的“真实”函数，因此你可以调用它们。但正如我之前断言的那样，你真的*不应该*这样做，因为这不是 JS 假设你会如何编写你的 `class` 的方式，你可能会遇到一些奇怪的边缘情况行为。最好停留在 `class` 为你铺设的狭窄路径上。

并非我们定义并希望与类关联/组织的所有行为都*需要*感知实例。此外，有时类需要公开定义使用该类的开发人员需要访问的数据（如常量），而与他们可能已经或可能尚未创建的任何实例无关。

那么，类系统如何启用定义此类数据和行为，这些数据和行为应该与类一起可用，但独立于（不知晓）实例化对象？**静态属性和函数**。

| 注意： |
| :--- |
| 我将使用“静态属性”/“静态函数”，而不是“成员”/“方法”，这样可以更清楚地区分实例绑定成员/实例感知方法，以及非实例属性和实例不感知函数。 |

我们在 `class` 主体中使用 `static` 关键字来区分这些定义：

```js
class Point2d {
    // 类静态属性
    static origin = new Point2d(0,0)
    static distance(point1,point2) {
        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2)
        );
    }

    // 实例成员和方法
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `(${this.x},${this.y})`;
    }
}

console.log(`Starting point: ${Point2d.origin}`);
// Starting point: (0,0)

var next = new Point2d(3,4);
console.log(`Next point: ${next}`);
// Next point: (3,4)

console.log(`Distance: ${
    Point2d.distance( Point2d.origin, next )
}`);
// Distance: 5
```

`Point2d.origin` 是一个静态属性，它恰好持有我们类的一个构造实例。`Point2d.distance(..)` 是一个静态函数，用于计算两点之间的二维笛卡尔距离。

当然，我们可以将这两者放在除类定义的 `static` 之外的其他地方。但是由于它们与 `Point2d` 类直接相关，因此将它们组织在那里*最有意义*。

| 注意： |
| :--- |
| 不要忘记，当你使用 `class` 语法时，名称 `Point2d` 实际上是 JS 定义的构造函数的名称。所以 `Point2d.origin` 只是该函数对象上的一个常规属性访问。这就是我在本节开头提到存储与类相关的*事物*的第三个位置时的意思；在 JS 中，`static` 存储为构造函数上的属性。请注意不要将它们与存储在构造函数 `prototype` 上的属性（方法）及存储在实例上的属性（成员）混淆。 |

### 静态属性初始化

静态初始化中的值（`static whatever = ..`）可以包括 `this` 引用，它指的是类本身（实际上是构造函数），而不是实例：

```js
class Point2d {
    // 类静态属性
    static originX = 0
    static originY = 0
    static origin = new this(this.originX,this.originY)

    // ..
}
```

| 警告： |
| :--- |
| 我不建议实际上做我在这里演示的 `new this(..)` 技巧。那只是为了说明目的。使用 `new Point2d(this.originX,this.originY)` 代码会更清晰，所以首选那种方法。 |

不要忽略一个重要的细节：与仅在实例化（使用 `new`）发生时才分别进行的公有字段初始化不同，类静态初始化总是在 `class` 被定义后*立即*运行。此外，静态初始化的顺序很重要；你可以把这些语句看作是被逐个评估的。

也像类成员一样，静态属性不必初始化（默认：`undefined`），但这样做更为常见。声明一个没有初始化值的静态属性没有什么用处（`static whatever`）；访问 `Point2d.whatever` 或 `Point2d.nonExistent` 都会导致 `undefined`。

最近（在 ES2022 中），`static` 关键字得到了扩展，现在可以在 `class` 主体内定义一个块，以便对 `static` 进行更复杂的初始化：

```js
class Point2d {
    // 类静态属性
    static origin = new Point2d(0,0)
    static distance(point1,point2) {
        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2)
        );
    }

    // 静态初始化块（截至 ES2022）
    static {
        let outerPoint = new Point2d(6,8);
        this.maxDistance = this.distance(
            this.origin,
            outerPoint
        );
    }

    // ..
}

Point2d.maxDistance;        // 10
```

这里的 `let outerPoint = ..` 不是一个特殊的 `class` 特性；它完全就像任何普通作用域块中的普通 `let` 声明（参见本系列的“作用域与闭包”一书）。我们只是声明了一个分配给 `outerPoint` 的 `Point2d` 局部实例，然后使用该值来推导对 `maxDistance` 静态属性的赋值。

静态初始化块对于诸如围绕表达式计算的 `try..catch` 语句之类的事情也很有用。

### 静态继承

类静态属性由子类继承（显然，作为静态属性！），可以被覆盖，并且 `super` 可以用于基类引用（和静态函数多态性），所有这些都与实例成员/方法的继承工作方式非常相似：

```js
class Point2d {
    static origin = /* .. */
    static distance(x,y) { /* .. */ }

    static {
        // ..
        this.maxDistance = /* .. */;
    }

    // ..
}

class Point3d extends Point2d {
    // 类静态属性
    static origin = new Point3d(
        // 这里，`this.origin` 引用将不起作用
        // （自引用），所以我们使用
        // `super.origin` 引用代替
        super.origin.x, super.origin.y, 0
    )
    static distance(point1,point2) {
        // 这里，super.distance(..) 是 Point2d.distance(..)，
        // 如果我们需要调用它

        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2) +
            ((point2.z - point1.z) ** 2)
        );
    }

    // 实例成员/方法
    z
    constructor(x,y,z) {
        super(x,y);     // <-- 别忘了这一行！
        this.z = z;
    }
    toString() {
        return `(${this.x},${this.y},${this.z})`;
    }
}

Point2d.maxDistance;        // 10
Point3d.maxDistance;        // 10
```

如你所见，我们在 `Point2d` 上定义的静态属性 `maxDistance` 在 `Point3d` 上被继承为静态属性。

| 提示： |
| :--- |
| 记住：任何时候你定义子类构造函数，都需要在其中调用 `super(..)`，通常作为第一条语句。我发现那太容易忘记了。 |

不要跳过这里的底层 JS 行为。就像前面讨论的方法继承一样，静态“继承”*不是*将这些静态属性/函数从基类复制到子类；它是通过 `[[Prototype]]` 链进行的共享。具体来说，构造函数 `Point3d()` 的 `[[Prototype]]` 链接被 JS 更改（从默认的 `Function.prototype`）为 `Point2d`，这就是允许 `Point3d.maxDistance` 委托给 `Point2d.maxDistance` 的原因。

同样有趣的是，也许现在只是历史上的，注意到静态继承——它是原始 ES6 `class` 机制特性集的一部分！——是一个超越“仅仅是语法糖”的具体特性。正如我们这里所说明的那样，静态继承在 ES6 之前的旧原型类风格代码中是*不*可能实现/模拟的。这是仅在 ES6 中引入的一种特殊的形变行为。

## 私有类行为

到目前为止，我们作为 `class` 定义一部分讨论的所有内容都是公开可见/可访问的，无论是类上的静态属性/函数，构造函数 `prototype` 上的方法，还是实例上的成员属性。

但是你如何存储不能从类外部看到的私有信息呢？这是最需要的功能之一，也是对 JS `class` 的最大抱怨之一，直到它最终在 ES2022 中得到解决。

`class` 现在支持用于声明私有字段（实例成员）和私有方法的新语法。此外，私有静态属性/函数也是可能的。

### 动机？

在我们说明如何做 `class` 私有之前，有必要思考一下为什么这是一个有用的功能？

使用面向闭包的设计模式（再次参见本系列的“作用域与闭包”一书），我们可以自动获得内置的“隐私”。当你在作用域内声明一个变量时，它在作用域之外是看不见的。句号。减少声明的作用域可见性有助于防止命名空间冲突（相同的变量名）。

但更重要的是确保软件的正确“防御性”设计，即所谓的“最小权限原则（Principle of Least Privilege）”[^POLP]。POLP 指出，我们应该只向必要的最小表面区域公开软件中的信息或功能。

过度暴露使我们的软件面临几个使软件安全/维护复杂化的问题，包括另一段代码恶意地做一些我们的代码没有预期或意图的事情。此外，还有不太关键但同样令人苦恼的问题，即我们要软件的其他部分依赖（使用）我们应该保留为隐藏实现细节的部分代码。一旦其他代码依赖于我们代码的实现细节，我们就无法在不潜在破坏程序其他部分的情况下重构我们的代码。

所以，简而言之，如果是没有必要公开的，我们*应该*隐藏实现细节。从这个意义上说，JS 的 `class` 系统感觉有点太宽容了，因为所有内容都默认为公开。类私有特性是对更正确的软件设计的受欢迎补充。

#### 太私有了？

话虽如此，我不得不给类私有派对泼点冷水。

我已经强烈建议，除非你真的要利用面向类给你带来得大部分或全部东西，否则你应该只使用 `class`。否则，你最好使用其他的 JS 核心支柱特性来组织代码，例如使用闭包模式。

面向类最重要的方面之一是子类继承，正如我们在本章中多次看到的那样。猜猜当基类中的私有成员/方法被子类扩展时会发生什么？

私有成员/方法**仅对定义它们的类**是私有的，并且**不会**以任何方式被子类继承。哎呀。

这看起来可能不算太大的问题，直到你开始在实际软件中使用 `class` 和私有成员/方法。你可能会很快遇到这样一种情况：你需要从子类访问私有方法，甚至更经常地，只是访问私有成员，以便子类可以按需扩展/增强基类的行为。一旦你意识到这是不可能的，你可能会很快因沮丧而尖叫。

接下来不可避免的是一个尴尬的决定：你是否只是回退到使其公开，以便子类可以访问它？唉。或者，更糟糕的是，你是否尝试重新设计基类来扭曲其成员/方法的设计，以便部分解决缺乏访问权限的问题。这通常涉及对方法的过度参数化（使用私有作为默认参数值），以及其他类似的技巧。双倍的唉。

老实说，这里并没有特别好的答案。如果你有 Java 或 C++ 等更传统类语言的面向类经验，你可能会怀疑为什么我们在*公有*和*私有*之间没有*受保护（protected）*可见性。这正是*受保护*的用途：保持某些东西对类及其任何子类私有。那些语言也有*友元（friend）*特性，但这超出了我们这里的讨论范围。

遗憾的是，JS 不仅没有*受保护*可见性，看起来（尽管它很有用！）它也不太可能成为 JS 的一项特性。它已经被详细讨论了十多年（甚至在 ES6 出现之前），并且有多个关于它的提案。

我不应该说它*永远*不会发生，因为在任何软件中这都不是可靠的立场。但它不太可能，因为它实际上背叛了 `class` 建立的支柱。如果你好奇，或者（更可能）确定一定*有办法*，我不妨在一个附录中介绍 JS 机制内*受保护*可见性的不兼容性。

这里的重点是，截至目前，JS 没有*受保护*可见性，而且短期内也不会有。而在实践中，*受保护*可见性实际上比*私有*可见性有用得多。

所以我们回到这个问题：**为什么你要关心使任何 `class` 内容私有？**

如果我要诚实地说：也许你不应该。或许你应该。这取决于你。只是要意识到其中的绊脚石。

### 私有成员/方法

你很高兴终于看到神奇的*私有*可见性的语法，对吧？如果你对即将看到的内容感到愤怒或悲伤，请不要迁怒于信使。

```js
class Point2d {
    // 静态
    static samePoint(point1,point2) {
        return point1.#ID === point2.#ID;
    }

    // 私有
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // 公有
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(3,4);
var two = new Point2d(3,4);

Point2d.samePoint(one,two);         // false
Point2d.samePoint(one,one);         // true
```

不，JS 没有做理智的事情，像他们对 `static` 所做的那样引入 `private` 关键字。相反，他们引入了 `#`。（插入关于社交媒体千禧一代喜欢话题标签或其他什么的蹩脚笑话）

| 提示： |
| :--- |
| 是的，关于为什么不这样做有一百万零一个讨论。我可以花几章来叙述整个历史，但老实说，我只是不在乎。我觉得这种语法很丑陋，许多其他人也这么认为。但也有些人喜欢它！如果你属于后一阵营，尽管我很少做这样的事情，但我只是要说：**就接受它吧**。现在进行更多的辩论或恳求已经太晚了。 |

`#whatever` 语法（包括 `this.#whatever` 形式）仅在 `class` 主体内有效。如果在 `class` 外部使用，它将抛出语法错误。

与公有字段/实例成员不同，私有字段/实例成员*必须*在 `class` 主体内声明。你不能在构造函数方法中动态地向类声明添加私有成员；只有在类主体中声明了 `#whatever` 私有字段，`this.#whatever = ..` 类型的赋值才有效。此外，虽然私有字段可以重新赋值，但不能像公有字段/类成员那样从实例中 `delete`。

#### 子类化 + 私有

我早些时候警告过，使用具有私有成员/方法的类进行子类化可能是一个限制性的陷阱。但这并不意味着它们不能一起使用。

因为 JS 中的“继承”是共享（通过 `[[Prototype]]` 链），如果你在子类中调用继承的方法，并且该继承的方法反过来访问/调用其宿主（基）类中的私有成员，这是可以正常工作的：

```js
class Point2d { /* .. */ }

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
}

var one = new Point3d(3,4,5);
```

这个构造函数中的 `super(x,y)` 调用调用了继承的基类构造函数（`Point2d(..)`），该构造函数本身访问了 `Point2d` 的私有方法 `#assignID()`（见前面的片段）。即使 `Point3d` 无法直接看到或访问确实存储在实例（此处名为 `one`）上的 `#ID` / `#assignID()` 私有成员，也不会抛出异常。

事实上，即使是继承的 `static samePoint(..)` 函数也可以从 `Point3d` 或 `Point2d` 工作：

```js
Point2d.samePoint(one,one);         // true
Point3d.samePoint(one,one);         // true
```

实际上，这不应该那么令人惊讶，因为：

```js
Point2d.samePoint === Point3d.samePoint;
```

继承的函数引用与基函数引用是*完全相同的函数*；它不是函数的某个副本。因为所讨论的函数中没有 `this` 引用，所以无论从哪里调用它，都应该产生相同的结果。

不过仍然令人遗憾的是，`Point3d` 没有办法访问/影响，甚至实际上不知道 `Point2d` 中的 `#ID` / `#assignID()` 私有成员：

```js
class Point2d { /* .. */ }

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;

        console.log(this.#ID);      // 将抛出异常！
    }
}
```

| 警告： |
| :--- |
| 请注意，此代码段在定义 `Point3d` 类时抛出了早期静态语法错误，甚至还没来得及创建该类的实例。如果引用是 `super.#ID` 而不是 `this.#ID`，也会抛出相同的异常。 |

#### 存在性检查

请记住，只有 `class` 自身知道，因此可以检查此类私有字段/方法。

你可能想要检查对象实例上是否存在私有字段/方法。例如（如下所示），你可能在类中有一个静态函数或方法，它接收传入的外部对象引用。要检查传入的对象引用是否属于同一个类（因此其中具有相同的私有成员/方法），你基本上需要针对该对象进行“品牌检查（brand check）”。

这样的检查可能会相当复杂，因为如果你访问对象上尚不存在的私有字段，你会得到一个抛出的 JS 异常，这就需要丑陋的 `try..catch` 逻辑。

但也有一种更简洁的方法，即所谓的“符合人体工程学的品牌检查（ergonomic brand check）”，使用 `in` 关键字：

```js
class Point2d {
    // 静态
    static samePoint(point1,point2) {
        // "符合人体工程学的品牌检查"
        if (#ID in point1 && #ID in point2) {
            return point1.#ID === point2.#ID;
        }
        return false;
    }

    // 私有
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // 公有
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(3,4);
var two = new Point2d(3,4);

Point2d.samePoint(one,two);         // false
Point2d.samePoint(one,one);         // true
```

如果未找到字段，`#privateField in someObject` 检查不会抛出异常，因此可以在不使用 `try..catch` 的情况下安全地使用它并使用其简单的布尔结果。

#### 泄露

即使成员/方法可能声明为*私有*可见性，它仍然可以从类实例中泄露（提取）：

```js
var id, func;

class Point2d {
    // 私有
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // 公有
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;

        // 泄露
        id = this.#ID;
        func = this.#assignID;
    }
}

var point = new Point2d(3,4);

id;                     // 7392851012 (...例如)

func;                   // function #assignID() { .. }
func.call(point,42);

func.call({},100);
// TypeError: Cannot write private member #ID to an
// object whose class did not declare it
```

这里主要的担忧是，将私有方法作为回调传递（或以任何方式向程序的其他部分公开私有成员）时要小心。没有什么能阻止你这样做，这可能会造成一点非预期的隐私泄露。

### 私有静态

静态属性和函数也可以使用 `#` 标记为私有：

```js
class Point2d {
    static #errorMsg = "Out of bounds."
    static #printError() {
        console.log(`Error: ${this.#errorMsg}`);
    }

    // 公有
    x
    y
    constructor(x,y) {
        if (x > 100 || y > 100) {
            Point2d.#printError();
        }
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(30,400);
// Error: Out of bounds.
```

这里的 `#printError()` 静态私有函数有一个 `this`，但它是指 `Point2d` 类，而不是一个实例。因此，`#errorMsg` 和 `#printError()` 独立于实例，因此最好是静态的。此外，没有理由让它们在类之外可访问，所以被标记为私有。

记住：私有静态同样不被子类继承，就像私有成员/方法亦不被继承一样。

#### 陷阱：带静态私有和 `this` 的子类化

回想一下，继承的方法从子类调用时，可以毫无困难地访问（通过 `this.#whatever` 风格引用）来自其自己的基类的任何私有成员：

```js
class Point2d {
    // ..

    getID() {
        return this.#ID;
    }

    // ..
}

class Point3d extends Point2d {
    // ..

    printID() {
        console.log(`ID: ${this.getID()}`);
    }
}

var point = new Point3d(3,4,5);
point.printID();
// ID: ..
```

这工作得很好。

不幸的是，（对我来说）相当出乎意料/不一致的是，从继承的公共静态函数访问私有静态却并非如此：

```js
class Point2d {
    static #errorMsg = "Out of bounds."
    static printError() {
        console.log(`Error: ${this.#errorMsg}`);
    }

    // ..
}

class Point3d extends Point2d {
    // ..
}

Point2d.printError();
// Error: Out of bounds.

Point3d.printError === Point2d.printError;
// true

Point3d.printError();
// TypeError: Cannot read private member #errorMsg
// from an object whose class did not declare it
```

`printError()` 静态方法通过 `[[Prototype]]` 从 `Point2d` 继承（共享）到 `Point3d` 没问题，这就是为什么函数引用是相同的。就像上面的非静态片段一样，你可能期望 `Point3d.printError()` 静态调用通过 `[[Prototype]]` 链解析到其原始基类（`Point2d`）位置，从而让它可以访问基类的 `#errorMsg` 静态私有成员。

但它失败了，如该片段中的最后一条语句所示。它在这里失败但在前面的片段中没有失败的原因是一个令人费解的脑筋急转弯。我就不在这里深入探讨*为什么*的解释了，坦率地说，这让我很火大。

不过有一个*修复方法*。在静态函数中，将 `this.#errorMsg` 替换为 `Point2d.#errorMsg`，现在它就可以工作了：

```js
class Point2d {
    static #errorMsg = "Out of bounds."
    static printError() {
        // 修复后的引用 vvvvvv
        console.log(`Error: ${Point2d.#errorMsg}`);
    }

    // ..
}

class Point3d extends Point2d {
    // ..
}

Point2d.printError();
// Error: Out of bounds.

Point3d.printError();
// Error: Out of bounds.  <-- 唷，现在它工作了！
```

如果正在继承公共静态函数，请使用类名来访问任何私有静态，而不是使用 `this.` 引用。小心那个陷阱！

## 类示例

好了，我们已经列出了一堆不同的类特性。我想通过尝试在一个稍微不那么基本/做作的单个示例中说明这些功能的采样来结束本章。

```js
class CalendarItem {
    static #UNSET = Symbol("unset")
    static #isUnset(v) {
        return v === this.#UNSET;
    }
    static #error(num) {
        return this[`ERROR_${num}`];
    }
    static {
        for (let [idx,msg] of [
            "ID is already set.",
            "ID is unset.",
            "Don't instantiate 'CalendarItem' directly.",
        ].entries()) {
            this[`ERROR_${(idx+1)*100}`] = msg;
        }
    }
    static isSameItem(item1,item2) {
        if (#ID in item1 && #ID in item2) {
            return item1.#ID === item2.#ID;
        }
        else {
            return false;
        }
    }

    #ID = CalendarItem.#UNSET
    #setID(id) {
        if (CalendarItem.#isUnset(this.#ID)) {
            this.#ID = id;
        }
        else {
            throw new Error(CalendarItem.#error(100));
        }
    }

    description = null
    startDateTime = null

    constructor() {
        if (new.target !== CalendarItem) {
            let id = Math.round(Math.random() * 1e9);
            this.#setID(id);
        }
        else {
            throw new Error(CalendarItem.#error(300));
        }
    }
    getID() {
        if (!CalendarItem.#isUnset(this.#ID)) {
            return this.#ID;
        }
        else {
            throw new Error(CalendarItem.#error(200));
        }
    }
    getDateTimeStr() {
        if (this.startDateTime instanceof Date) {
            return this.startDateTime.toUTCString();
        }
    }
    summary() {
        console.log(`(${
            this.getID()
        }) ${
            this.description
        } at ${
            this.getDateTimeStr()
        }`);
    }
}

class Reminder extends CalendarItem {
    #complete = false;  // <-- 无 ASI，需要分号

    [Symbol.toStringTag] = "Reminder"
    constructor(description,startDateTime) {
        super();

        this.description = description;
        this.startDateTime = startDateTime;
    }
    isComplete() {
        return !!this.#complete;
    }
    markComplete() {
        this.#complete = true;
    }
    summary() {
        if (this.isComplete()) {
            console.log(`(${this.getID()}) Complete.`);
        }
        else {
            super.summary();
        }
    }
}

class Meeting extends CalendarItem {
    #getEndDateTimeStr() {
        if (this.endDateTime instanceof Date) {
            return this.endDateTime.toUTCString();
        }
    }

    endDateTime = null;  // <-- 无 ASI，需要分号

    [Symbol.toStringTag] = "Meeting"
    constructor(description,startDateTime,endDateTime) {
        super();

        this.description = description;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }
    getDateTimeStr() {
        return `${
            super.getDateTimeStr()
        } - ${
            this.#getEndDateTimeStr()
        }`;
    }
}
```

花点时间阅读并消化这些 `class` 定义。你发现我们在本章中讨论的大部分 `class` 特性了吗？

| 注意： |
| :--- |
| 你可能有一个问题：为什么我不将 `description` 和 `startDateTime` 从两个子类构造函数中重复的逻辑移动到单个基本构造函数中？这是一个微妙的点，但我的意图不是直接实例化 `CalendarItem`；这就是在面向类术语中我们所说的“抽象类”。这就是为什么我使用 `new.target` 在 `CalendarItem` 类被直接实例化时抛出错误的原因！所以我不想通过签名暗示 `CalendarItem(..)` 构造函数应该被直接使用。 |

现在让我们看看这三个类的使用：

```js
var callMyParents = new Reminder(
    "Call my parents to say hi",
    new Date("July 7, 2022 11:00:00 UTC")
);
callMyParents.toString();
// [object Reminder]
callMyParents.summary();
// (586380912) Call my parents to say hi at
// Thu, 07 Jul 2022 11:00:00 GMT
callMyParents.markComplete();
callMyParents.summary();
// (586380912) Complete.
callMyParents instanceof Reminder;
// true
callMyParents instanceof CalendarItem;
// true
callMyParents instanceof Meeting;
// false


var interview = new Meeting(
    "Job Interview: ABC Tech",
    new Date("June 23, 2022 08:30:00 UTC"),
    new Date("June 23, 2022 09:15:00 UTC")
);
interview.toString();
// [object Meeting]
interview.summary();
// (994337604) Job Interview: ABC Tech at Thu,
// 23 Jun 2022 08:30:00 GMT - Thu, 23 Jun 2022
// 09:15:00 GMT
interview instanceof Meeting;
// true
interview instanceof CalendarItem;
// true
interview instanceof Reminder;
// false


Reminder.isSameItem(callMyParents,callMyParents);
// true
Meeting.isSameItem(callMyParents,interview);
// false
```

诚然，这个例子的一些部分有点做作。但老实说，我认为这几乎所有内容都是对各种 `class` 特性的合理和看似可信的使用。

顺便说一下，可能有无数种不同的方式来构建上述代码逻辑。我绝不是在声称这是这样做的*正确*或*最佳*方式。作为读者的练习，尝试自己动手编写它，并记下你与我的方法不同的地方。

[^POLP]: "Principle of Least Privilege", Wikipedia; https://en.wikipedia.org/wiki/Principle_of_least_privilege ; Accessed July 2022
`````````
