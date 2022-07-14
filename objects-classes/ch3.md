# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 3: Objects as Classes

| NOTE: |
| :--- |
| Work in progress |

The class-design pattern generally entails defining a general definition for a *type of thing* (class), including data (members) and behaviors (methods), and then creating one or more concrete *instances* of this class definition as actual objects that can interact and perform tasks. Moreover, class-orientation allows declaring a relationship between two or more classes, through what's called "inheritance", to derive new and augmented "subclasses" that mix-n-match and even re-define behaviors.

Prior to ES6 (2015), JS developers mimicked aspects of class-oriented (aka "object-oriented") design using plain functions and objects, along with the `[[Prototype]]` mechanism (as explained in the previous chapter) -- so called "prototypal classes".

But to many developers joy and relief, ES6 introduced dedicated syntax, including the `class` and `extends` keywords, to express class-oriented design more declaratively.

At the time of ES6's `class` being introduced, this new dedicated syntax was almost entirely *just syntactic sugar* to make class definitions more convenient and readable. However, in the many years since ES6, `class` has matured and grown into its own first class feature mechanism, accruing a significant amount of dedicated syntax and complex behaviors that far surpass the pre-ES6 "prototypal class" capabilities.

Even though `class` now bears almost no resemblance to older "prototypal class" code style, the JS engine is still *just* wiring up objects to each other through the existing `[[Prototype]]` mechanism. In other words, `class` is not its own separate pillar of the language (as `[[Prototype]]` is), but more like the fancy, decorative *Capital* that tops the pillar/column.

That said, since `class` style code has now replaced virtually all previous "prototypal class" coding, the main text here focuses only on `class` and its various particulars. For historical purposes, we'll briefly cover the old "prototypal class" style in Appendix A.

## When Should I Class-Orient My Code?

Class-orientation is a design pattern, which means it's a choice for how you organize the information and behavior in your program. It has pros and cons. It's not a universal solution for all tasks.

So how do you know when you should use classes?

In a theoretical sense, class-orientation is a way of dividing up the business domain of a program into one or more pieces that can each be defined by an "is-a" classification; that's grouping a thing into the set (or sets) of characteristics that thing shares with other things. You would say "X is a Y", meaning X has all the characteristics of a thing of kind Y.

For example, consider computers. We could say a computer is electrical, since it uses electrical current as power. It's furthermore electronic, because it manipulates the electrical current beyond simply routing electrons around to produce heat and motion (electrical/magnetic fields). A basic desk lamp is electrical, but not particularly electronic.

We could thus define a class `Electrical` to describe what electrical devices need and can do, and that might include receiving an electrical current (voltage, amps, etc). We could then define a further class `Electronic`, and define that it also uses electrical current, but that it further more creates meaningful circuits to manipulate that current, performing more complex tasks than simple electrical devices.

Here's where class-orientation starts to shine. Rather than re-define all the `Electrical` characteristics in the `Electronic` class, we can define `Electronic` in such a way that it "shares" or "inherits" those characteristics from `Electrical`, and then augments/redefines the unique behaviors that make a device electronic. This relationship between the two classes -- called "inheritance" -- is a key aspect of class-orientation.

So class-orientation is a way of thinking about the entities our program needs, and classifying them into groupings based on their characteristics (what information they hold, what operations can be performed on that data), and defining the relationships between the different grouping of characteristics.

But moving from the theoretical into in a bit more pragmatic perspective: if your program needs to hold and use multiple collections (instances) of alike data/behavior at once, you *may* benefit from class-orientation.

### Time For An Example

Here's a short illustration.

A couple of decades ago, right after I had gone through nearly all of a Computer Science degree in college, I found myself sitting in my first professional software developer job. I was tasked with building, all by myself, a timesheet and payroll tracking system. I built the backend in PHP (using MySQL for the DB) and JS for the interface (early as it was in its maturity way back around the turn of the century).

So I defined the concept of a "timesheet" entity as a collection of 2-3 "week" entities, and each "week" as a collection of 5-7 "day" entities, and each "day" as a collection of "task" entities.

If I wanted to know how many hours were logged into a timesheet instance, I could call a `totalTime()` operation on that instance. The timesheet defined this operation by looping over its collection of weeks, correspondingly calling `totalTime()` on each of them, and summing the results. Each week did the same for all its days, and each day did the same for all its tasks.

The notion being illustrated here, one of the fundamentals of design patterns like class-orientation, is called *encapsulation*. Each entity level encapsulated (e.g., controlled, hid) internal details (data and behavior) while presenting a useful external interface.

But encapsulation alone isn't a sufficient justification for class-orientation. Other design patterns can give you nice encapsulation.

How did my class design take advantage of inheritance? I had a base class that defined a set of operations like `totalTime()`, and each of my entity class types extended/subclassed this base class. That meant that each of them inherited this summation-of-total-time capability, but where each of them applied their own extensions and definitions for the internal details of *how* to do that work.

There's another aspect of the design pattern at play, which is *composition*: each entity was defined as a collection of other entities.

### Single vs Multiple

I mentioned above that a pragmatic way of deciding if you need class-orientation is if your program is going to have multiple instances of a single kind/type of behavior (aka, "class"). In the timesheet example, we had 4 classes: Timesheet, Week, Day, and Task. But for each class, we had multiple instances of each at once.

Had we instead only needed a single instance of a class, like just one `Computer` that was an instance of the `Electronic` class, class-orientation may not offer quite as much benefit. In particular, if the program didn't need to create an instance of the `Electrical` class, then there's no particular benefit to separating `Electrical` from `Electronic`, so we aren't really getting any help from the inheritance aspect of class-orientation.

So, if you find yourself dividing up a business problem domain into different "classes" of entities, but in the program you are only ever going to have one concrete *thing* of one kind/definition of behavior (aka, "class"), you might not actually need class-orientation. There are other design patterns which may be a more efficient match to your effort.

But if you find yourself wanting to define classes and subclasses which inherit from them, and if you're going to be instantiating one or more of those classes multiple times, class-orientation is a good candidate. And to do class-orientation in JS, you're going to pull out the `class` keyword.

## The `class` Keyword

The `class` keyword defines either a declaration or expression for a class. As a declaration, a class definition appears in a statement position and looks like this:

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

If defined, this constructor gets invoked any time a `new` instance of the class is created:

```js
class SomethingCool {
    constructor() {
        console.log("Here's your new instance!");
    }
}

var thing = new SomethingCool();
// Here's your new instance!
```

Even though the syntax implies a function actually named `constructor` exists, JS will not create such a function; instead it defines a function as specified, but with the name of the class (`SomethingCool` above):

```js
typeof SomethingCool;       // "function"
```

It's not *just* a function, though; this special kind of function behaves a bit differently:

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

You can construct as many different instances of a class as you want:

```js
var one = new SomethingCool();
var two = new SomethingCool();
var three = new SomethingCool();
```

Each of `one`, `two`, and `three` here are objects that are independent instances of the `SomethingCool` class.

| NOTE: |
| :--- |
| Each of the `one`, `two`, and `three` objects have a `[[Prototype]]` linkage to the `SomethingCool.prototype` object. In this code, `SomethingCool` is both a `class` definition and the constructor function of the same name. See Chapter 2 for more details. |

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

As shown above, a class definition can include one or more method definitions. Each method definition is added to the `prototype` object of the constructor:

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

Just to be clear: the `greeting` property (method) *looks like* it's on (owned by) the `thing` object here. But that's a mirage.

Actually, `greeting` only exists at `SomethingCool.prototype.greeting`. But since `thing` is `[[Prototype]]` linked to `SomethingCool.prototype` (see Chapter 2), the `thing.greeting()` reference traverses the `[[Prototype]]` chain and finds the method to execute.

Class methods should only be invoked via an instance; `SomethingCool.greeting()` doesn't work because there *is no* such property `SomethingCool.greeting`. You *could* invoke `SomethingCool.prototype.greeting()`, but that's not generally proper/advised in standard class-oriented coding. Always access methods via the instances.

## Class Instance `this`

We will cover the `this` keyword in much more detail in a subsequent chapter. But as it relates to class-oriented code, the `this` keyword generally refers to the current instance that's the context of any method invocation.

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

While the `thing.speak()` method is running, the `this` reference inside that method is pointing at the same object that `thing` references. That's why both `thing.number` and `this.number` reveal the same `42` value that the constructor set with its `this.number = 42` operation.

// TODO
