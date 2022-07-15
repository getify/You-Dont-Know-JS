# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 3: Classy Objects

| NOTE: |
| :--- |
| Work in progress |

The class-design pattern generally entails defining a definition for a *type of thing* (class), including data (members) and behaviors (methods), and then creating one or more concrete *instances* of this class definition as actual objects that can interact and perform tasks. Moreover, class-orientation allows declaring a relationship between two or more classes, through what's called "inheritance", to derive new and augmented "subclasses" that mix-n-match and even re-define behaviors.

Prior to ES6 (2015), JS developers mimicked aspects of class-oriented (aka "object-oriented") design using plain functions and objects, along with the `[[Prototype]]` mechanism (as explained in the previous chapter) -- so called "prototypal classes".

But to many developers joy and relief, ES6 introduced dedicated syntax, including the `class` and `extends` keywords, to express class-oriented design more declaratively.

At the time of ES6's `class` being introduced, this new dedicated syntax was almost entirely *just syntactic sugar* to make class definitions more convenient and readable. However, in the many years since ES6, `class` has matured and grown into its own first class feature mechanism, accruing a significant amount of dedicated syntax and complex behaviors that far surpass the pre-ES6 "prototypal class" capabilities.

Even though `class` now bears almost no resemblance to older "prototypal class" code style, the JS engine is still *just* wiring up objects to each other through the existing `[[Prototype]]` mechanism. In other words, `class` is not its own separate pillar of the language (as `[[Prototype]]` is), but more like the fancy, decorative *Capital* that tops the pillar/column.

That said, since `class` style code has now replaced virtually all previous "prototypal class" coding, the main text here focuses only on `class` and its various particulars. For historical purposes, we'll briefly cover the old "prototypal class" style in Appendix A.

## When Should I Class-Orient My Code?

Class-orientation is a design pattern, which means it's a choice for how you organize the information and behavior in your program. It has pros and cons. It's not a universal solution for all tasks.

So how do you know when you should use classes?

In a theoretical sense, class-orientation is a way of dividing up the business domain of a program into one or more pieces that can each be defined by an "is-a" classification: grouping a thing into the set (or sets) of characteristics that thing shares with other similar things. You would say "X is a Y", meaning X has (at least) all the characteristics of a thing of kind Y.

For example, consider computers. We could say a computer is electrical, since it uses electrical current (voltage, amps, etc) as power. It's furthermore electronic, because it manipulates the electrical current beyond simply routing electrons around (electrical/magnetic fields), creating a meaningful circuit to manipulate the current into performing more complex tasks. By contrast, a basic desk lamp is electrical, but not really electronic.

We could thus define a class `Electrical` to describe what electrical devices need and can do. We could then define a further class `Electronic`, and define that in addition to being electrical, `Electronic` things manipulate electricity to create more specialized outcomes.

Here's where class-orientation starts to shine. Rather than re-define all the `Electrical` characteristics in the `Electronic` class, we can define `Electronic` in such a way that it "shares" or "inherits" those characteristics from `Electrical`, and then augments/redefines the unique behaviors that make a device electronic. This relationship between the two classes -- called "inheritance" -- is a key aspect of class-orientation.

So class-orientation is a way of thinking about the entities our program needs, and classifying them into groupings based on their characteristics (what information they hold, what operations can be performed on that data), and defining the relationships between the different grouping of characteristics.

But moving from the theoretical into in a bit more pragmatic perspective: if your program needs to hold and use multiple collections (instances) of alike data/behavior at once, you *may* benefit from class-orientation.

### Time For An Example

Here's a short illustration.

A couple of decades ago, right after I had gone through nearly all of a Computer Science degree in college, I found myself sitting in my first professional software developer job. I was tasked with building, all by myself, a timesheet and payroll tracking system. I built the backend in PHP (using MySQL for the DB) and used JS for the interface (early as it was in its maturity way back around the turn of the century).

Since my CS degree had emphasized class-orientation heavily throughout my courses, I was eager to put all that theory to work. For my program's design, I defined the concept of a "timesheet" entity as a collection of 2-3 "week" entities, and each "week" as a collection of 5-7 "day" entities, and each "day" as a collection of "task" entities.

If I wanted to know how many hours were logged into a timesheet instance, I could call a `totalTime()` operation on that instance. The timesheet defined this operation by looping over its collection of weeks, calling `totalTime()` on each of them and summing the values. Each week did the same for all its days, and each day did the same for all its tasks.

The notion being illustrated here, one of the fundamentals of design patterns like class-orientation, is called *encapsulation*. Each entity level encapsulated (e.g., controlled, hid, abstracted) internal details (data and behavior) while presenting a useful external interface.

But encapsulation alone isn't a sufficient justification for class-orientation. Other design patterns offer sufficient encapsulation.

How did my class design take advantage of inheritance? I had a base class that defined a set of operations like `totalTime()`, and each of my entity class types extended/subclassed this base class. That meant that each of them inherited this summation-of-total-time capability, but where each of them applied their own extensions and definitions for the internal details of *how* to do that work.

There's yet another aspect of the design pattern at play, which is *composition*: each entity was defined as a collection of other entities.

### Single vs Multiple

I mentioned above that a pragmatic way of deciding if you need class-orientation is if your program is going to have multiple instances of a single kind/type of behavior (aka, "class"). In the timesheet example, we had 4 classes: Timesheet, Week, Day, and Task. But for each class, we had multiple instances of each at once.

Had we instead only needed a single instance of a class, like just one `Computer` thing that was an instance of the `Electronic` class, which was a subclass of the `Electrical` class, then class-orientation may not offer quite as much benefit. In particular, if the program doesn't need to create an instance of the `Electrical` class, then there's no particular benefit to separating `Electrical` from `Electronic`, so we aren't really getting any help from the inheritance aspect of class-orientation.

So, if you find yourself designing a program by dividing up a business problem domain into different "classes" of entities, but in the actual code of the program you are only ever need one concrete *thing* of one kind/definition of behavior (aka, "class"), you might very well not actually need class-orientation. There are other design patterns which may be a more efficient match to your effort.

But if you find yourself wanting to define classes, and subclasses which inherit from them, and if you're going to be instantiating one or more of those classes multiple times, then class-orientation is a good candidate. And to do class-orientation in JS, you're going to need the `class` keyword.

## Keep It `class`y

`class` defines either a declaration or expression for a class. As a declaration, a class definition appears in a statement position and looks like this:

```js
class SomethingCool {
    // ..
}
```

As an expression, a class definition appears in a value position and can either have a name or be anonymous:

```js
// named class expression
const something = class SomethingCool {
    // ..
};

// anonymous class expression
const another = class {
    // ..
};
```

The contents of a `class` body typically include one or more method definitions:

```js
class SomethingCool {
    greeting() {
        console.log("Hello!");
    }
    appreciate() {
        console.log("Thanks!");
    }
}
```

Inside a `class` body, methods are defined without the `function` keyword, and there's no `,` or `;` separators between the method definitions.

### The Constructor

One special method that all classes have is called a "constructor". If omitted, there's a default empty constructor assumed in the definition.

The constructor is invoked any time a `new` instance of the class is created:

```js
class SomethingCool {
    constructor() {
        console.log("Here's your new instance!");
    }
}

var thing = new SomethingCool();
// Here's your new instance!
```

Even though the syntax implies a function actually named `constructor` exists, JS defines a function as specified, but with the name of the class (`SomethingCool` above):

```js
typeof SomethingCool;       // "function"
```

It's not *just* a regular function, though; this special kind of function behaves a bit differently:

```js
SomethingCool.toString();
// class SomethingCool {
//   ..
// }

SomethingCool();
// TypeError: Class constructor SomethingCool cannot
// be invoked without 'new'

SomethingCool.call({});
// TypeError: Class constructor SomethingCool cannot
// be invoked without 'new'
```

You can construct as many different instances of a class as you need:

```js
var one = new SomethingCool();
var two = new SomethingCool();
var three = new SomethingCool();
```

Each of `one`, `two`, and `three` here are objects that are independent instances of the `SomethingCool` class.

| NOTE: |
| :--- |
| Each of the `one`, `two`, and `three` objects have a `[[Prototype]]` linkage to the `SomethingCool.prototype` object (see Chapter 2). In this code, `SomethingCool` is both a `class` definition and the constructor function of the same name. |

If you add a property to the object `one`:

```js
one.value = 42;
```

That property now exists only on `one`, and does not exist in any way that the independent `two` or `three` objects can access:

```js
two.value;      // undefined
three.value;    // undefined
```

### Class Methods

As shown above, a class definition can include one or more method definitions:

```js
class SomethingCool {
    constructor() {
        console.log("Here's your new instance!");
    }
    greeting() {
        console.log("Hello!");
    }
}

var thing = new SomethingCool();

thing.greeting();        // Hello!
```

The `greeting` property (method) *looks like* it exists on (is owned by) the `thing` object here. But that's a mirage. Each class method is added to the `prototype` object of the constructor.

So, `greeting(..)` only exists as `SomethingCool.prototype.greeting`. Since `thing` is `[[Prototype]]` linked to `SomethingCool.prototype` (see Chapter 2) via the `new` keyword instantiation, the `thing.greeting()` reference traverses the `[[Prototype]]` chain and finds the method to execute.

Class methods should only be invoked via an instance; `SomethingCool.greeting()` doesn't work because there *is no* such property. You *could* invoke `SomethingCool.prototype.greeting()`, but that's not generally proper/advised in standard class-oriented coding. Always access class methods via the instances.

## Class Instance `this`

We will cover the `this` keyword in much more detail in a subsequent chapter. But as it relates to class-oriented code, the `this` keyword generally refers to the current instance that is the context of any method invocation.

In the constructor, as well as any methods, you can use `this.` to either add or access properties on the current instance:

```js
class SomethingCool {
    constructor() {
        // add a property to the current instance
        this.number = 42;
    }
    speak() {
        // access the property from the current instance
        console.log(`My favorite number is ${ this.number }!`);
    }
}

var thing = new SomethingCool();

thing.number;       // 42

thing.speak();      // My favorite number is 42!
```

Any properties not holding function values, which are added to a class instance (usually via the constructor), are referred to as *members*, as opposed to the term *methods* for executable functions.

While the `thing.speak()` method is running, its `this` reference is pointing at the same object that `thing` references. That's why both `thing.number` and `this.number` reveal the same `42` value that the constructor set with its `this.number = 42` operation.

### Public Fields

Instead of defining a class instance member imperatively via `this.` in the constructor or a method, classes can declaratively define *fields* in the `class` body, which correspond directly to members that will be created on each instance:

```js
class SomethingCool {
    // this is a public field
    number = 42

    constructor() {
        // no need for the constructor here
    }
    speak() {
        // access the property from the current instance
        console.log(`My favorite number is ${ this.number }!`);
    }
}

var thing = new SomethingCool();

thing.number;       // 42

thing.speak();      // My favorite number is 42!
```

Public fields can have a value initialization, as shown above, but that's not required. If you don't initialize a field in the class definition, you almost always should initialize it in the constructor.

Fields can also reference each other, via natural `this.` access syntax:

```js
class SomethingCool {
    // these are public fields
    myName
    number = 21
    myAge = this.number * 2

    // ..
}
```

| TIP: |
| :--- |
| You can think of public field declarations as if they appear at the top of the constructor, each prefixed with an implied `this.` that you get to omit in the declarative `class` body form. |

Just like computed property names (see Chapter 1), field names can be computed:

```js
var greetingProp = "default_greeting";

class SomethingCool {
    // computed public field
    [greetingProp.toUpperCase()] = "Hello!"

    // ..
}

var thing = new SomethingCool();

thing.DEFAULT_GREETING;     // Hello!
```

#### Avoid This

One pattern that has emerged and grown quite popular, but which I firmly believe is an anti-pattern for `class`, looks like the following:

```js
class SomethingCool {
    number = 21
    getNumber = () => this.number * 2

    speak() { /* .. */ }
}

var another = new SomethingCool();

another.getNumber();    // 42
```

See the field holding an `=>` arrow function? I say this is a no-no. But why? Let's unwind what's going on.

First, why do this? Because JS developers seem to be perpetually frustrated by the dynamic `this` binding rules (see a subsequent chapter), so they force a `this` binding via the `=>` arrow function. That way, no matter how `getNumber()` is invoked, it's always `this`-locked to the particular instance. That's an understandable convenience to desire, but... it betrays the very nature of the `this` / `[[Prototype]]` pillar of the language. How?

Let's consider the equivalent code to the previous snippet:

```js
class SomethingCool {
    constructor() {
        this.number = 21;
        this.getNumber = () => this.number * 2;
    }
    speak() { /* .. */ }
}

var another = new SomethingCool();

another.getNumber();    // 42
```

Can you spot the problem? Look closely. I'll wait.

...

We've made it clear repeatedly so far that `class` definitions put their methods on the class constructor's `prototype` object -- that's where they belong! -- such that there's just one of each function and it's inherited (shared) by all instances. That's what will happen with `speak()` in the above snippet.

But what about `getNumber()`? That's essentially a class method, but it won't be handled by JS quite the same as `speak()` will. Consider:

```js
Object.hasOwn(another,"number");            // true -- good
Object.hasOwn(another,"speak");             // false -- good
Object.hasOwn(another,"getNumber");         // true -- oops :(
```

You see? By defining a function value and attaching it as a field/member property, we're losing the shared prototypal method'ness of the function, and it's becoming just like any per-instance property. That means we're creating a new function property **for each instance**, rather than it being created just once on the class constructor's `prototype`.

That's wasteful in performance and memory, even if by a tiny bit. That alone should be enough to avoid it.

But I would argue that way more importantly, what you've done with this pattern is invalidate the very reason why using `class` and `this`-aware methods is even remotely useful/powerful!

If you go to all the trouble to define class methods with `this.` references throughout them, but then you lock/bind most or all of those methods to a specific object instance, you've basically travelled all the way around the world just to go next door.

If all you want are function(s) that are statically fixed to a particular "context", and don't need any dynamicism or sharing, what you want is... **closure**. And you're in luck: I wrote a whole book in this series ("Scope & Closures") on how to use closure so functions remember/access their statically defined scope (aka "context"). That's a way more appropriate, and simpler to code, approach to get what you're after.

Don't abuse/misuse `class` and turn it into a over-hyped, glorified collection of closure.

To be clear, I'm *not* saying: never use `=>` arrow functions inside classes.

I *am* saying: never attach an `=>` arrow function as an instance property in place of a dynamic prototypal class method, either out of mindless habit, or laziness in typing fewer characters, or misguided `this`-binding convenience.

In a subsequent chapter, we'll dive deep into how to understand and properly leverage the full power of the dynamic `this` mechanism.

## Class Extension

The way to unlock the power of class inheritance is through the `extends` keyword, which defines a relationship between two classes:

```js
class Something {
    what = "something"

    greeting() {
        return `That's ${this.what}!`;
    }
}

class SomethingCool extends Something {
    what = "something cool"

    speak() {
        console.log( this.greeting().toUpperCase() );
    }
}

var thing = new Something();

thing.greeting();
// That's something!

var another = new SomethingCool();

another.speak();
// THAT'S SOMETHING COOL!
```

Take a few moments to re-read that code snippet and make sure you fully understand what's happening.

The base class `Something` defines a field (member) called `what`, and gives it the initial value `"something"`. It also defines a `greeting()` method that accesses this instance member and returns a string value. We see that behavior illustrated in the `thing.greeting()` method call.

But the `SomethingCool` class extends `Something`, making `SomethingCool` a derived-class, child-class, or (most commonly) subclass. In `SomethingCool`, the same `what` property that's inherited from `Something` is re-initialized with a different `"something cool"` value. It also adds a new method, `speak()`, which itself calls `this.greeting()`.

When `another.speak()` is invoked, the inherited `this.greeting()` is thus invoked, and that method makes reference to `this.what`. Since `this` is pointing at the class instance (aka, `another`), the value it finds is now `"something cool"` (instead of `"something"` from the `thing` object's `what` member).

### Overriding Methods

In addition to overriding a field/member in a subclass, you can also override (redefine) a method:

```js
class Something {
    what = "something"

    greeting() {
        return `That's ${this.what}!`;
    }
}

class SomethingCool extends Something {
    what = "something cool"

    greeting() {
        return `Here's ${this.what}!`;
    }
    speak() {
        console.log( this.greeting().toUpperCase() );
    }
}

var another = new SomethingCool();

another.speak();
// HERE'S SOMETHING COOL!
```

The `SomethingCool` subclass overrides the inherited `greeting()` method to give it different behavior. However, you can still instantiate the base `Something` class, which would then give an object that uses the original (`"That's ..."`) definition for `greeting()`.

If you want to access an inherited method from a subclass even if it's been overriden, you can use `super` instead of `this`:

```js
class Something {
    what = "something"

    greeting() {
        return `That's ${this.what}!`;
    }
}

class SomethingCool extends Something {
    what = "something cool"

    greeting() {
        return `Wow! ${ super.greeting() }!`;
    }
    speak() {
        console.log( this.greeting().toUpperCase() );
    }
}

var another = new SomethingCool();

another.speak();
// WOW! THAT'S SOMETHING COOL!
```

The ability for methods of the same name, at different levels of the inheritance hierarchy, to exhibit different behavior when either accessed directly, or relatively with `super`, is called *polymorphism*. It's a very powerful part of class-orientation, when used appropriately.

### That's Super!

In addition to a subclass method accessing an inherited method definition (even if overriden on the subclass) via `super.` reference, a subclass constructor can manually invoke the inherited base class constructor via `super(..)` function invocation:

```js
class Something {
    constructor(what = "something") {
        this.what = what;
    }
    greeting() {
        return `That's ${this.what}!`;
    }
}

class SomethingCool extends Something {
    constructor() {
        super("something cooler");
    }
    speak() {
        console.log( this.greeting().toUpperCase() );
    }
}

var another = new SomethingCool();

another.speak();
// THAT'S SOMETHING COOLER!
```

| WARNING: |
| :--- |
| An explicitly defined subclass constructor *must* call `super(..)` to run the inherited class's initialization, and that must occur before the subclass constructor makes any references to `this` or finishes/returns. Otherwise, a runtime exception will be thrown when that subclass constructor is invoked (via `new`). If you omit the subclass constructor, the default constructor automatically invokes `super()` for you. |

### "Inheritance" Is Sharing, Not Copying

It may seem as if `SomethingCool`, when it `extends` the `Something` class, is essence getting a *copy* of all the behavior defined in `Something`. Moreover, it may seem as if the concrete object instance `another` is has *copied down* to it all the methods from `SomethingCool` (and by extension, also from `Something`).

However, that's not the correct mental model to use for JS's implementation of class-orientation.

Recall this base class and subclass definition, as well as instantiation of `another`:

```js
class Something {
    what = "something"

    greeting() {
        return `That's ${this.what}!`;
    }
}

class SomethingCool extends Something {
    what = "something cool"

    greeting() {
        return `Here's ${this.what}!`;
    }
    speak() {
        console.log( this.greeting().toUpperCase() );
    }
}

var another = new SomethingCool();
```

If you inspect the `another` object, you'll see it only has the `what` property (instance member) on it, but not the `greeting()` or `speak()` methods:

```js
Object.hasOwn(another,"what");                       // true

Object.hasOwn(another,"greeting");                   // false
Object.hasOwn(another,"speak");                      // false
```

Where are those methods located? On the prototype object(s):

```js
Object.hasOwn(SomethingCool.prototype,"greeting");   // true
Object.hasOwn(SomethingCool.prototype,"speak");      // true

Object.hasOwn(Something.prototype,"greeting");       // true
```

And `another` has access to those methods via its `[[Prototype]]` linkage (see Chapter 2). In other words, the prototype objects **share access** to those methods with the subclass(es) and instance(s). The methods stay in place, and are not copied down the inheritance chain.

As nice as the `class` syntax is, don't forget what's really happening under the syntax: JS is *just* wiring up objects on the `[[Prototype]]` chain.

## Static Class Behavior

We've so far emphasized two different locations for data or behavior (methods) to reside: on the constructor's prototype, or on the instance. But there's a third option: on the constructor (function object) itself.

In a traditional class-oriented system, methods defined on a class are not concrete things you could ever invoke or interact with. You have to instantiate a class to have a concrete object to invoke those methods with. Prototypal languages like JS blur this line a bit: all class-defined methods are "real" functions residing on the constructor's prototype, and you could therefore invoke them. But as I asserted earlier, you really *should not* do so, as this is not how JS assumes you will write your `class`es, and there are some weird corner-case behaviors you may run into. Best to stay on the narrow path that `class` lays out for you.

Not all behavior that we define and want to associate/organize with a class *needs* to be aware of an instance. Moreover, sometimes a class needs to publicly define data (like constants) that developers using that class need to access, independent of any instance they may or may not have created.

So, how does a class system enable defining such data and behavior that should be available with a class but independent of (unaware of) instantiated objects? **Static properties and functions**.

| NOTE: |
| :--- |
| I'll use "static property" / "static function", rather than "member" / "method", just so it's clearer that there's a distinction between instance-bound members / instance-aware methods, and non-instance properties and instance-unaware functions. |

We use the `static` keyword in our `class` bodies to distinguish these definitions:

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

The `Point2d.origin` is a static property, which just so happens to hold a constructed instance of our class. And `Point2d.distance(..)` is a static function that computes the 2-dimensional cartesian distance between two points.

Of course, we could have put these two somewhere other than as `static`s on the class definition. But since they're directly related to the `Point2d` class, it makes *most sense* to organize them there.

| NOTE: |
| :--- |
| Don't forget that when you use the `class` syntax, the name `Point2d` is actually the name of a constructor function that JS defines. So `Point2d.origin` is just a regular property access on that function object. That's what I meant at the top of this section when I referred to a third location for storing *things* related to classes; in JS, `static`s are stored as properties on the constructor function. Take care not to confuse those with properties stored on the constructor's `prototype` (methods) and properties stored on the instance (members). |

### Static Property Initializations

The value in a static initialization (`static whatever = ..`) can include `this` references, which refers to the class itself (actually, the constructor) rather than to an instance:

```js
class Point2d {
    // class statics
    static originX = 0
    static originY = 0
    static origin = new this(this.originX,this.originY)

    // ..
}
```

| WARNING: |
| :--- |
| I don't recommend actually doing the `new this(..)` trick I've illustrated here. That's just for illustration purposes. The code would read more cleanly with `new Point2d(this.originX,this.originY)`, so prefer that approach. |

An important detail not to gloss over: unlike public field initializations, which only happen once an instantiation (with `new`) occurs, class static initializations always run *immediately* after the `class` has been defined. Moreover, the order of static initializations matters; you can think of the statements as if they're being evaluated one at a time.

Also like class members, static properties do not have to be initialized (default: `undefined`), but it's much more common to do so. There's not much utility in declaring a static property with no initialized value (`static whatever`); Accessing either `Point2d.whatever` or `Point2d.nonExistent` would both result in `undefined`.

Recently (in ES2022), the `static` keyword was extended so it can now define a block inside the `class` body for more sophisticated initialization of `static`s:

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

The `let outerPoint = ..` here is not a special `class` feature; it's exactly like a normal `let` declaration in any normal block of scope (see the "Scope & Closures" book of this series). We're merely declaring a localized instance of `Point2d` assigned to `outerPoint`, then using that value to derive the assignment to the `maxDistance` static property.

Static initialization blocks are also useful for things like `try..catch` statements around expression computations.

### Static Inheritance

Class statics are inherited by subclasses (obviously, as statics!), can be overriden, and `super` can be used for base class references (and static function polymorphism), all in much the same way as inheritance works with instance members/methods:

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

As you can see, the static property `maxDistance` we defined on `Point2d` was inherited as a static property on `Point3d`.

| TIP: |
| :--- |
| Remember: any time you define a subclass constructor, you'll need to call `super(..)` in it, usually as the first statement. I find that all too easy to forget. |

Don't skip over the underlying JS behavior here. Just like method inheritance discussed earlier, the static "inheritance" is *not* a copying of these static properties/functions from base class to subclass; it's sharing via the `[[Prototype]]` chain. Specifically, the constructor function `Point3d()` has its `[[Prototype]]` linkage changed by JS (from the default of `Function.prototype`) to `Point2d`, which is what allows `Point3d.maxDistance` to delegate to `Point2d.maxDistance`.

It's also interesting, perhaps only historically now, to note that static inheritance -- which was part of the original ES6 `class` mechanism feature set! -- was one specific feature that went beyond "just syntax sugar". Static inheritance, as we see it illustrated here, was *not* possible to achieve/emulate in JS prior to ES6, in the old prototypal-class style of code. It's a special new behavior introduced only as of ES6.

## Private Class Behavior

// TODO
