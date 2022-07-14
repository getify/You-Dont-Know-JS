# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 2: Objects as Classes

| NOTE: |
| :--- |
| Work in progress |

The class-design pattern generally entails defining a general definition for a *type of thing* (class), including data (members) and behaviors (methods), and then creating one or more concrete *instances* of this class definition as actual objects that can interact and perform tasks. Moreover, class-orientation allows declaring a relationship between two or more classes, through what's called "inheritance", to derive new and augmented "subclasses" that mix-n-match and even re-define behaviors.

Prior to ES6 (2015), JS developers mimicked aspects of class-oriented (aka "object-oriented") design using plain functions and objects, along with the `[[Prototype]]` mechanism (as explained in the previous chapter) -- so called "prototypal classes".

But to many developers joy and relief, ES6 introduced dedicated syntax, including the `class` and `extends` keywords, to express class-oriented design more declaratively.

At the time of ES6's `class` being introduced, this new dedicated syntax was almost entirely *just syntactic sugar* to make class definitions more convenient and readable. However, in the many years since ES6, `class` has matured and grown into its own first class feature mechanism, accruing a significant amount of dedicated syntax and complex behaviors that far surpass the pre-ES6 "prototypal class" capabilities.

Even though `class` now bears almost no resemblance to older "prototypal class" code style, the JS engine is still *just* wiring up objects to each other through the existing `[[Prototype]]` mechanism. In other words, `class` is not its own separate pillar of the language (as `[[Prototype]]` is), but more like the fancy, decorative *Capital* that tops the pillar/column.

That said, since `class` style code has now replaced virtually all previous "prototypal class" coding style, the main text here focuses only on `class` and its various particulars. For historical purposes, we'll briefly cover the old "prototypal class" style in Appendix A.

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
