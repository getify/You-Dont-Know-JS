# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 5: Delegation

| NOTE: |
| :--- |
| Work in progress |

We've thoroughly explored objects, prototypes, classes, and now the `this` keyword. But we're now going to revisit what we've learned so far from a bit of a different perspective.

What if you could leverage all the power of the objects, prototypes, and dynamic `this` mechanisms together, without ever using `class` or any of its descendants?

In fact, I would argue JS is inherently less class-oriented than the `class` keyword might appear. Because JS is a dynamic, prototypal language, its strong suit is actually... *delegation*.

## Preamble

Before we begin looking at delegation, I want to offer a word of caution. This perspective on JS's object `[[Prototype]]` and `this` function context mechanisms is *not* mainstream. It's *not* how framework authors and libraries utilize JS. You won't, to my knowledge, find any big apps out there using this pattern.

So why on earth would I devote a chapter to such a pattern, if it's so unpopular?

Good question. The cheeky answer is: because it's my book and I can do what I feel like!

But the deeper answer is, because I think developing *this* understanding of one of the language's core pillars helps you *even if* all you ever do is use `class`-style JS patterns.

To be clear, delegation is not my invention. It's been around as a design pattern for decades. And for a long time, developers argued that prototypal delegation was *just* the dynamic form of inheritance.[^TreatyOfOrlando] But I think that was a mistake to conflate the two.[^ClassVsPrototype]

For the purposes of this chapter, I'm going to present delegation, as implemented via JS mechanics, as an alternative design pattern, positioned somewhere between class-orientation and object-closure/module patterns.

The first step is to *de-construct* the `class` mechanism down to its individual parts. Then we'll cherry-pick and mix the parts a bit differently.

## What's A Constructor, Anyway?

In Chapter 3, we saw `constructor(..)` as the main entry point for construction of a `class` instance. But the `constructor(..)` doesn't actually do any *creation* work, it's only *initialization* work. In other words, the instance is already created by the time the `constructor(..)` runs and initializes it -- e.g., `this.whatever` types of assignments.

So where does the *creation* work actually happen? In the `new` operator. As the section "New Context Invocation" in Chapter 4 explains, there are four steps the `new` keyword performs; the first of those is the creation of a new empty object (the instance). The `constructor(..)` isn't even invoked until step 3 of `new`'s efforts.

But `new` is not the only -- or perhaps even, best -- way to *create* an object "instance". Consider:

```js
// a non-class "constructor"
function Point2d(x,y) {
    // create an object (1)
    var instance = {};

    // initialize the instance (3)
    instance.x = x;
    instance.y = y;

    // return the instance (4)
    return instance;
}

var point = Point2d(3,4);

point.x;                    // 3
point.y;                    // 4
```

There's no `class`, just a regular function definition (`Point2d(..)`). There's no `new` invocation, just a regular function call (`Point2d(3,4)`). And there's no `this` references, just regular object property assignments (`instance.x = ..`).

The term that's most often used to refer to this pattern of code is that `Point2d(..)` here is a *factory function*. Invoking it causes the construction (creation and initialization) of an object, and returns that back to us. That's an extremely common pattern, at least as common as class-oriented code.

I comment-annotated `(1)`, `(3)`, and `(4)` in that snippet, which roughly correspond to steps 1, 3, and 4 of the `new` operation. But where's step 2?

If you recall, step 2 of `new` is about linking the object (created in step 1) to another object, via its `[[Prototype]]` slot (see Chapter 2). So what object might we want to link our `instance` object to? We could link it to an object that holds functions we'd like to associate/use with our instance.

Let's amend the previous snippet:

```js
var prototypeObj = {
    toString() {
        return `(${this.x},${this.y})`;
    },
}

// a non-class "constructor"
function Point2d(x,y) {
    // create an object (1)
    var instance = {
        // link the instance's [[Prototype]] (2)
        __proto__: prototypeObj,
    };

    // initialize the instance (3)
    instance.x = x;
    instance.y = y;

    // return the instance (4)
    return instance;
}

var point = Point2d(3,4);

point.toString();           // (3,4)
```

Now you see the `__proto__` assignment that's setting up the internal `[[Prototype]]` linkage, which was the missing step 2. I used the `__proto__` here merely for illustration purposes; using `setPrototypeOf(..)` as shown in Chapter 4 would have accomplished the same task.

### *New* Factory Instance

What do you think would happen if we used `new` to invoke the `Point2d(..)` function as shown here?

```js
var anotherPoint = new Point2d(5,6);

anotherPoint.toString(5,6);         // (5,6)
```

Wait! What's going on here? A regular, non-`class` factory function in invoked with the `new` keyword, as if it was a `class`. Does that change anything about the outcome of the code?

No... and yes. `anotherPoint` here is exactly the same object as it would have been had I not used `new`. But! The object that `new` creates, links, and assigns as `this` context? *That* object was completely ignored and thrown away, ultimately to be garbage collected by JS. Unfortunately, the JS engine cannot predict that you're not going to use the object that you asked `new` to create, so it always still gets cteated even if it goes unused.

That's right! Using a `new` keyword against a factory function might *feel* more ergonomic or familiar, but it's quite wasteful, in that it creates **two** objects, and wastefully throws one of them away.

### Factory Initialization

In the current code example, the `Point2d(..)` function still looks an awful lot like a normal `constructor(..)` of a `class` definition. But what if we moved the initialization code to a separate function, say named `init(..)`:

```js
var prototypeObj = {
    init(x,y) {
        // initialize the instance (3)
        this.x = x;
        this.y = y;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
}

// a non-class "constructor"
function Point2d(x,y) {
    // create an object (1)
    var instance = {
        // link the instance's [[Prototype]] (2)
        __proto__: prototypeObj,
    };

    // initialize the instance (3)
    instance.init(x,y);

    // return the instance (4)
    return instance;
}

var point = Point2d(3,4);

point.toString();           // (3,4)
```

The `instance.init(..)` call makes use of the `[[Prototype]]` linkage set up via `__proto__` assignment. Thus, it *delegates* up the prototype chain to `prototypeObj.init(..)`, and invokes it with a `this` context of `instance` -- via *implicit context* assignment (see Chapter 4).

Let's continue the deconstruction. Get ready for a switcheroo!

```js
var Point2d = {
    init(x,y) {
        // initialize the instance (3)
        this.x = x;
        this.y = y;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
};
```

Whoa, what!? I discarded the `Point2d(..)` function, and instead renamed the `prototypeObj` as `Point2d`. Weird.

But let's look at the rest of the code now:

```js
// steps 1, 2, and 4
var point = { __proto__: Point2d, };

// step 3
point.init(3,4);

point.toString();           // (3,4)
```

And one last refinement: let's use a built-in utility JS provides us, called `Object.create(..)`:

```js
// steps 1, 2, and 4
var point = Object.create(Point2d);

// step 3
point.init(3,4);

point.toString();           // (3,4)
```

What operations does `Object.create(..)` perform?

1. create a brand new empty object, out of thin air.

2. link the `[[Prototype]]` of that new empty object to the function's `.prototype` object.

If those look familiar, it's because those are exactly the same first two steps of the `new` keyword (see Chapter 4).

Let's put this back together now:

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

Hmmm. Take a few moments to ponder what's been derived here. How does it compare to the `class` approach?

This pattern ditches the `class` and `new` keywords, but accomplishes the exact same outcome. The *cost*? The single `new` operation was broken up into two statements: `Object.create(Point2d)` and `point.init(3,4)`.

#### Help Me Reconstruct!

If having those two operations separate bothers you -- is it *too deconstructed*!? -- they can always be recombined in a little factory helper:

```js
function make(objType,...args) {
    var instance = Object.create(objType);
    instance.init(...args);
    return instance;
}

var point = make(Point2d,3,4);

point.toString();           // (3,4)
```

| TIP: |
| :--- |
| Such a `make(..)` factory function helper works generally for any as object-type, as long as you follow the implied convention that each `objType` you link to has a function named `init(..)` on it. |

And of course, you can still create as many instances as you'd like:

```js
var point = make(Point2d,3,4);

var anotherPoint = make(Point2d,5,6);
```

## Ditching Class Thinking

// TODO

[^TreatyOfOrlando]: "Treaty of Orlando"; Henry Lieberman, Lynn Andrea Stein, David Ungar; Oct 6, 1987; https://web.media.mit.edu/~lieber/Publications/Treaty-of-Orlando-Treaty-Text.pdf; PDF; Accessed July 2022

[^ClassVsPrototype]: "Classes vs. Prototypes, Some Philosophical and Historical Observations"; Antero Taivalsaari; Apr 22, 1996; https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.56.4713&rep=rep1&type=pdf; PDF; Accessed July 2022
