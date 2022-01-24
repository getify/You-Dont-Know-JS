# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 1: Object Foundations

| NOTE: |
| :--- |
| Work in progress |

> Everything in JS is an object.

This is one of the most pervasive, but most incorrect, "facts" that perpetually circulates about JS. Let the myth busting commence.

JS definitely has objects, but that doesn't mean that all values are objects. Nevertheless, objects are arguably the most important (and varied!) value type in the language, so mastering them is critical to your JS journey.

The object mechanism is certainly the most flexible and powerful container type -- something you put other values into; every JS program you write will use them in one way or another. But that's not why objects deserve top billing for this book. Objects are the the foundation for the second of JS's three pillars: the prototype.

Why are prototypes so core to JS as to be one of its three pillars? Among other things, prototypes are how JS's object system can express the class design pattern, one of the most widely relied on design patterns in all of programming.

So our journey here will start with objects, build up a compelete understanding of prototypes, de-mystify the `this` keyword, and explore the `class` system.

## About This Book

Welcome to book 3 in the *You Don't Know JS Yet* series! If you already finished *Get Started* (the first book) and *Scope & Closures* (the second book), you're in the right spot! If not, before you proceed I encourage you to read those two as foundations before diving into this book.

The first edition of this book is titled, "this & Object Prototypes". In that book, our focus started with the `this` keyword, as it's arguably one of the most confused topics in all of JS. The book then spent the majority of its time focused on expositing the prototype system and advocating for embrace of the lesser-known "delegation" pattern instead of class designs. At the time of that book's writing (2014), ES6 would still be almost 2 years to its completion, so I felt the early sketches of the `class` keyword only merited a brief addendum of coverage.

It's quite an understatement to say a lot has changed in the JS landscape in the almost 8 years since that book. ES6 is old news now; at the time of *this* book's writing, JS has seen 6 (soon to be 7!) yearly updates **after ES6** (ES2016 through ES2021, soon ES2022).

Now, we still need to talk about how `this` works, and how that relates to methods invoked against various objects. And `class` actually operates (mostly!) via the prototype chain deep under the covers. But JS developers in 2022 are almost never writing code to explicitly wire up prototypal inheritance anymore. And as much as I personally wish differently, class design patterns -- not "behavior delegation" -- are how the majority of data and behavior organization (data structures) in JS are expressed.

This book reflects JS's current reality: thus the new sub-title, new organization and focus of topics, and complete re-write of the previous edition's text.

## Objects As Containers

One common way of gathering up multiple values in a single container is with an object. Objects are collections of key/value pairs. There are also sub-types of object in JS with specialized behaviors, such as arrays (numerically indexed) and even functions (callable); more on these sub-types later.

| NOTE: |
| :--- |
| Keys are often referred to as "property names", with the pairing of a property name and a value often called a "property". This book will use those terms distinctly in that manner. |

Regular JS objects are typically declared with literal syntax, like this:

```js
myObj = {
    // ..
};
```

**Note:** There's an alternate way to create an object (using `myObj = new Object()`), but this is not common or preferred, and is almost never the appropriate way to go about it. Stick with object literal syntax.

It's easy to get confused what pairs of `{ .. }` mean, since JS overloads the curly brackets to mean any of the following, depending on the context used:

* delimit values, like object literals
* define object destructuring patterns (more on this later)
* delimit interpolated string expressions, like `` `some ${ getNumber() } thing` ``
* define blocks, like on `if` and `for` loops
* define function bodies

Though it can sometimes be challenging as you read code, look for whether a `{ .. }` curly brace pair is used in the program where a value/expression is valid to appear; if so, it's an object literal, otherwise it's one of the other overloaded uses.

### Defining Properties

Inside the object literal curly braces, you define properties (name and value) with `propertyName: propertyValue` pairs, like this:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};
```

The values you assign to the properties can be literals, as shown, or can be computed by expression:

```js
function twenty() { return 20; }

myObj = {
    favoriteNumber: (twenty() + 1) * 2,
};
```

The expression `(twenty() + 1) * 2` is evaluated immediately, with the result (`42`) assigned as the property value.

Developers sometimes wonder if there's a way to define an expression for a property value where the expression is "lazy", meaning it's not computed at the time of assignment, but defined later. JS does not have lazy expressions, so the only way to do so is for the expression to be wrapped in a function:

```js
function twenty() { return 20; }
function myNumber() { return (twenty() + 1) * 2; }

myObj = {
    favoriteNumber: myNumber   // notice, NOT `myNumber()` as a function call
};
```

In this case, `favoriteNumber` is not holding a numeric value, but rather a function reference. To compute the result, that function reference must be explicitly executed.

#### Looks Like JSON?

You may notice that this object-literal syntax resembles "JSON" (JavaScript Object Notation):

```json
{
    "favoriteNumber": 42,
    "isDeveloper": true,
    "firstName": "Kyle"
}
```

The biggest differences between object literals and JSON are:

1. property names must be quoted with `"` double-quote characters

2. property values must be literals (either primitives, objects, or arrays), not arbitrary JS expressions

In JS programs, an object literal does not require quoted property names -- you *can* quote them (`'` or `"` allowed), but it's usually optional. There are however characters that are valid in a property name, but which cannot be included without surrounding quotes; for example, leading numbers or whitespace:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle",
    "2 nicknames": [ "getify", "ydkjs" ]
};
```

#### Property Names

Property names in object literals are almost always treated/coeced as string values. One exception to this is for numeric (or "numeric looking") property "names":

```js
anotherObj = {
    42: "<-- this property name will remain a number",
    "41": "<-- this property name will be coerced to a number",
    true: "<-- this property name will be converted to a string",
    myObj: "<-- ...and so will this one"
};
```

The `42` property name will remain a number, and the `"41"` string value will be coerced to a numeric property name since it *looks like* a number. By contrast, the `true` value will become the string property name `"true"`, and the `myObj` identifier reference will coerce the object's value to a string (generally the default `"[object Object]"`).

| WARNING: |
| :--- |
| If you need to actually use an object as a key/property name, never rely on this string coercion; its behavior is surprising and almost certainly not what's expected, so program bugs are likely to occur. Instead, use a more specialized data structure, called a `Map` (added in ES6), where objects used as property "names" are left as-is instead of being coerced to a string value. |

You can also *compute* the **property name** (distinct from computing the property value) at the time of object literal definition:

```js
anotherObj = {
    ["x" + (21 * 2)]: true
};
```

The expression `"x" + (21 * 2)`, which must appear inside of `[ .. ]` brackets, is computed immediately, and the result (`"x42"`) is used as the property name.

#### Symbols As Property Names

ES6 added a new primitive value type of `Symbol`, which is often used as a special property name for storing and retieving property values. They're created via the `Symbol(..)` function call (**without** the `new` keyword), which accepts an optional description string used only for friendlier debugging purposes; if specified, the description is inaccessible to the JS program and thus not used for any other purpose than debug output.

```js
myPropSymbol = Symbol("optional, developer-friendly description");
```

| NOTE: |
| :--- |
| Symbols are sort of like numbers or strings, except that their value is *opaque* to, and globally unique within, the JS program. In other words, you can create and use symbols, but JS doesn't let you know anything about, or do anything with, the underlying value; that's kept as a hidden implementation detail by the JS engine. |

Computed property names, as previously described, are how to define a symbol property name on an object literal:

```js
myPropSymbol = Symbol("optional, developer-friendly description");

anotherObj = {
    [myPropSymbol]: "Hello, symbol!"
};
```

The computed property name used to define the property on `anotherObj` will be the actual primitive symbol value (whatever it is), not the optional description string (`"optional, developer-friendly description"`).

Because symbols are globally unique in your program, there's **no** chance of accidental collision where one part of the program might accidentally define a property name the same as another part of the program tried defined/assigned.

#### Concise Properties

When defining an object literal, it's common to use a property name that's the same as an existing in-scope identifier that holds the value you want to assign.

```js
coolFact = "The first person convicted of speeding was going 8 mph";

anotherObj = {
    coolFact: coolFact
};
```

| NOTE: |
| :--- |
| That would have been the same thing as the quoted property name definition `"coolFact": coolFact`, but JS developers rarely quote property names unless strictly necessary. Indeed, it's idiomatic to avoid the quotes unless required, so it's discouraged to include them unneccessarily. |

In this situation, where the property name and value expression identifier are identical, you can omit the property-name portion of the property definition, as a so-called "concise property" definition:

```js
coolFact = "the first person convicted of speeding was going 8 mph";

anotherObj = {
    coolFact
};
```

The property name is `"coolFact"` (string), and the value assigned to the property is what's in the `coolFact` variable at that moment: `"the first person convicted of speeding was going 8 mph"`.

At first, this shorthand convenience may seem confusing. But as you get more familiar with seeing this very common and popular feature being used, you'll likely favor it for typing (and reading!) less.

#### Concise Methods

Another similar shorthand is defining functions/methods in an object literal using a more concise form:

```js
anotherObj = {
    // standard function property
    greet: function() { console.log("Hello!"); },

    // concise function/method property
    greet2() { console.log("Hello, friend!"); }
};
```

While we're on the topic of concise method properties, we can also define generator functions (another ES6 feature):

```js
anotherObj = {
    // instead of:
    //   greet3: function*() { yield "Hello, everyone!"; }

    // concise generator method
    *greet3() { yield "Hello, everyone!"; }
};
```

And though it's not particularly common, concise methods/generators can even have quoted or computed names:

```js
anotherObj = {
    "greet-4"() { console.log("Hello, audience!"); },

    // concise computed name
    [ "gr" + "eet 5" ]() { console.log("Hello, audience!"); },

    // concise computed generator name
    *[ "ok, greet 6".toUpperCase() ]() { yield "Hello, audience!"; }
};
```

### Accessing Properties

Property access is preferably done with the `.` operator:

```js
myObj.favoriteNumber;    // 42
myObj.isDeveloper;       // true
```

If it's possible to access a property this way, it's strongly suggested to do so.

If the property name contains characters that cannot appear in identifiers, such as leading numbers or whitespace, `[ .. ]` brackets can be used instead of the `.`:

```js
myObj["2 nicknames"];    // [ "getify", "ydkjs" ]
```

```js
anotherObj[42];          // "<-- this property name will..."
anotherObj["41"];        // "<-- this property name will..."
```

Even though numeric property "names" remain as numbers, property access via the `[ .. ]` brackets will coerce a string representation to a number (e.g., `"42"` as the `42` numeric equivalent), and then access the associated numeric property accordingly.

Similar to the object literal, the property name to access can be computed via the `[ .. ]` brackets. The expression can be a simple identifier:

```js
propName = "41";
anotherObj[propName];
```

Actually, what you put between the `[ .. ]` brackets can be any arbitrary JS expression, not just identifiers or literal values like `42` or `"isDeveloper"`. JS will first evaluate the expression, and the resulting value will then be used as the property name to look up on the object:

```js
function howMany(x) {
    return x + 1;
}

myObj[`${ howMany(1) } nicknames`];   // [ "getify", "ydkjs" ]
```

In this snippet, the expression is a back-tick delimited `` `template string literal` `` with an interpolated expression of the function call `howMany(1)`. The overall result of that expression is the string value `"2 nicknames"`, which is then used as the property name to access.

#### Conditional Property Access

Recently (ES2020), a feature known as "optional chaining" was added to JS, which augments property access capabilities (especially nested property access). The primary form is the two-character compound operator `?.`, like `A?.B`.

This operator will check the left-hand side reference (`A`) to see if it's null'ish (`null` or `undefined`). If so, the rest of the property access expression is short-circuited (skipped), and `undefined` is returned as the result (even if it was `null` that was actually encountered!). Otherwise, `?.` will access the property just as a normal `.` operator would.

For example:

```js
myObj?.favoriteNumber
```

Here, the null'ish check is performed against the `myObj`, meaning that the `favoriteNumber` property access is only performed if the value in `myObj` is non-null'ish. Note that it doesn't verify that `myObj` is actually holding a real object, only that it's non-nullish. However, all non-nullish values can "safely" (no JS exception) be "accessed" via the `.` operator, even if there's no matching property to retrieve.

It's easy to get confused into thinking that the null'ish check is against the `favoriteNumber` property. But one way to keep it straight is to remember that the `?` is on the side where the safety check is performed, while the `.` is on the side that is only conditionally evaluated if the non-null'ish check passes.

Typically, the `?.` operator is used in nested property accesses that may be 3 or more levels deep, such as:

```js
myObj?.address?.city
```

The equivalent operation with the `?.` operator would look like this:

```js
(myObj != null && myObj.address != null) ? myObj.address.city : undefined
```

Again, remember that no check has been performed against the right-most property (`city`) here.

Also, the `?.` should not universally be used in place of every single `.` operator in your programs. You should endeavor to know if a `.` property access will succeed or not before making the access, whenever possible. Use `?.` only when the nature of the values being accessed is subject to conditions that cannot be predicted/controlled.

For example, in the previous snippet, the `myObj?.` usage is probably mis-guided, because it really shouldn't be the case that you start a chain of property access against a variable that might not even hold a top-level object (aside from its contents potentially missing certain properties in certain conditions).

Instead, I would recommend usage more like this:

```js
myObj.address?.city
```

And that expression should only be used in part of your program where you're sure that `myObj` is at least holding a valid object (whether or not it has an `address` property with a sub-object in it).

Another form of the "optional chaining" operator is `?.[`, which is used when the property access you want to make conditional/safe requires a `[ .. ]` bracket.

```js
myObj["2 nicknames"]?.[0];   // "getify"
```

Everything asserted about how `?.` behaves goes the same for `?.[`.

| WARNING: |
| :--- |
| There's a third form of this feature, named "optional call", which uses `?.(` as the operator. It's used for performing a non-null'ish check on a property before executing the function value in the property. For example, instead of `myObj.someFunc(42)`, you can do `myObj.someFunc?.(42)`. The `?.(` checks to make sure `myObj.someFunc` is non-null'ish before invoking it (with the `(42)` part). While that may sound like a useful feature, I think this is dangerous enough to warrant complete avoidance of this form/construct.<br><br>My concern is that `?.(` makes it seem as if we're ensuring that the function is "callable" before calling it, when in fact we're only checking if it's non-null'ish. Unlike `?.` which can allow a "safe" `.` access against a non-null'ish value that's also not an object, the `?.(` non-null'ish check isn't similarly "safe". If the property in question has any non-null'ish, non-function value in it, like `true` or `"Hello"`, the `(42)` call part will be invoked and yet throw a JS exception. So in other words, this form is unfortunately masquerading as more "safe" than it actually is, and should thus be avoided in essentially all circumstances. If a property value can ever *not be* a function, do a more fullsome check for its function'ness before trying to invoke it. Don't pretend that `?.(` is doing that for you, or future readers/maintainers of your code (including your future self!) will likely regret it. |

// TODO

## Objects Overview

Objects are not just containers for multiple values

Prototypes are internal linkages between objects that allow property or method access against one object -- if the property/method requested is absent -- to be handled by "delegating" that access to another object. When the delegation involves a method, the context for the method to run in is shared from the initial object to the target object via the `this` keyword.

Prior to ES6, the prototype system was how developers expressed (i.e., emulated) the class design pattern in JS -- so-called "prototypal inheritance". ES6 introduced the `class` keyword as a syntactic affordance to embrace and centralize the prevalence of varied class design approaches. Ostensibly, `class` was introduced as "sugar" built on top of manual/explicit prototypal classes.
