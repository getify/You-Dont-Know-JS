# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 2: How Objects Work

| NOTE: |
| :--- |
| Work in progress |

Objects are not just containers for multiple values, though that's the context for most interactions with objects.

To fully understand the object mechanism in JS, and get the most out of using objects in our programs, we need to look more closely at a number of characteristics of objects (and their properties) which can affect the behavior when interacting with them.

These characteristics that define the underlying behavior of objects are collectively referred to in formal terms as the "meta-object protocol" (MOP)[^mop]. The MOP is useful not only for predicting how objects will behave, but also for overriding the default behaviors of objects to bend the language to fit our program's needs more fully.

## Property Descriptors

Each property on an object is internally described by what's known as a "property descriptor". This is, itself, an object (a "metaobject") with several properties (aka "attributes") on it, dictating how the target property behaves.

We can retrieve a property descriptor for any existing property using `Object.getOwnPropertyDescriptor(..)` (ES5):

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

Object.getOwnPropertyDescriptor(myObj,"favoriteNumber");
// {
//     value: 42,
//     enumerable: true,
//     writable: true,
//     configurable: true
// }
```

We can even use such a descriptor to define a new property on an object, using `Object.defineProperty(..)` (ES5):

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    value: 42,
    enumerable: true,     // default if omitted
    writable: true,       // default if omitted
    configurable: true    // default if omitted
});

anotherObj.fave;          // 42
```

If an existing property has not already been marked as non-configurable (with `configurable: false` in its descriptor), it can always be re-defined/overwritten using `Object.defineProperty(..)`.

| WARNING: |
| :--- |
| A number of earlier sections in this chapter refer to "copying" or "duplicating" properties. One might assume such copying/duplication would be at the property descriptor level. However, none of those operations actually work that way; they all do simple `=` style access and assignment, which has the effect of ignoring any nuances in how the underlying descriptor for a property is defined. |

### Accessor Properties

A property descriptor usually defines a `value` property, as shown above. However, a special kind of property, known as an "accessor property" (aka, a getter/setter), can be defined. For these a property like this, its descriptor does not define a fixed `value` property, but would instead look something like this:

```js
{
    get() { .. },    // function to invoke when retrieving the value
    set(v) { .. },   // function to invoke when assigning the value
    // .. enumerable, etc
}
```

A getter looks like a property access (`obj.prop`), but under the covers it invokes the `get()` method as defined; it's sort of like if you had done `obj.prop()`. A setter looks like a property assignment (`obj.prop = value`), but it invokes the `set(..)` method as defined; it's sort of like if you had done `obj.prop(value)`.

Let's illustrate a getter/setter accessor property:

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    get() { console.log("Getting 'fave' value!"); return 123; },
    set(v) { console.log(`Ignoring ${v} assignment.`); }
});

anotherObj.fave;
// Getting 'fave' value!
// 123

anotherObj.fave = 42;
// Ignoring 42 assignment.

anotherObj.fave;
// Getting 'fave' value!
// 123
```

### Enumerable, Writable, Configurable

Besides `value` or `get()` / `set(..)`, the other 3 attributes of a property are, as shown above:

* `enumerable`
* `writable`
* `configurable`

The `enumerable` attribute controls whether the property will appear in various enumerations of object properties, such as `Object.keys(..)`, `Object.entries(..)`, `for..in` loops, and the copying that occurs with the `...` object spread and `Object.assign(..)`. Most properties should be left enumerable, but you can mark certain special properties on an object as non-enumerable if they shouldn't be iterated/copied.

The `writable` attribute controls whether a `value` assignment (via `=`) is allowed. To make a property "read only", define it with `writable: false`. However, as long as the property is still configurable, `Object.defineProperty(..)` can still change the value by setting `value` differently.

The `configurable` attribute controls whether a property's **descriptor** can be re-defined/overwritten. A property that's `configurable: false` is locked to its definition, and any further attempts to change it with `Object.defineProperty(..)` will fail. A non-configurable property can still be assigned new values (via `=`), as long as `writable: true` is still set on the property's descriptor.

## `[[Prototype]]` Chain

One of the most important, but least obvious, characteristics of an object is referred to as the "prototype chain".

// TODO

## Object Sub-Types

There are a variety of specialized sub-types of objects. But by far, the two most common ones you'll interact with are arrays and `function`s.

| NOTE: |
| :--- |
| By "sub-type", we mean the notion of a derived type that has inherited the behaviors from a parent type but then specialized or extended those behaviors. In other words, values of these sub-types are fully objects, but are also *more than just* objects. |

### Arrays

Arrays are objects that are specifically intended to be **numerically indexed**, rather than using string named property locations. They are still objects, so a named property like `favoriteNumber` is legal. But it's greatly frowned upon to mix named properties into numerically indexed arrays.

Arrays are preferably defined with literal syntax (similar to objects), but with the `[ .. ]` square brackets rather than `{ .. }` curly brackets:

```js
myList = [ 23, 42, 109 ];
```

JS allows any mixture of value types in arrays, including objects, other arrays, functions, etc. As you're likely already aware, arrays are "zero-indexed", meaning the first element in the array is at the index `0`, not `1`:

```js
myList = [ 23, 42, 109 ];

myList[0];      // 23
myList[1];      // 42
```

Recall that any string property name on an object that "looks like" a number -- is able to be validly coerced to a string -- will actually be treated like a number. The same goes for arrays. You should always use `42` as a numeric index (aka, property name), but if you use the string `"42"`, JS will coerce that to a number for you.

```js
// "2" works as an index here, but it's not advised
myList["2"];    // 109
```

One exception to the "no named properties on arrays" rule is that all arrays automatically expose a `length` property, which is automatically kept updated with the "length" of the array.

```js
myList = [ 23, 42, 109 ];

myList.length;   // 3

// "push" another value onto the end of the list
myList.push("Hello");

myList.length;   // 4
```

| WARNING: |
| :--- |
| Many JS developers incorrectly believe that array `length` is basically a *getter* (see "Accessor Properties" earlier in this chapter), but it's not. The offshoot is that these developers feel like it's "expensive" to access this property -- as if JS has to on-the-fly recompute the length -- and will thus do things like capture/store the length of an array before doing a non-mutating loop over it. This used to be "best practice" from a performance perspective. But for at least 10 years now, that's actually been an anti-pattern, because the JS engine is more efficient at managing the `length` property than our JS code is at trying to "outsmart" the engine to avoid invoking something we think is a *getter*. It's more efficient to let the JS engine do its job, and just access the property whenever and however often it's needed. |

#### Empty Slots

JS arrays also have a really unfortunate "flaw" in their design, referred to as "empty slots". If you assign an index of an array more than one position beyond the current end of the array, JS will leave the in between slots "empty" rather than auto-assigning them to `undefined` as you might expect:

```js
myList = [ 23, 42, 109 ];
myList.length;              // 3

myList[14] = "Hello";
myList.length;              // 15

myList;                     // [ 23, 42, 109, empty x 11, "Hello" ]

// looks like a real slot with a
// real `undefined` value in it,
// but beware, it's a trick!
myList[9];                  // undefined
```

You might wonder why empty slots are so bad? One reason: there are APIs in JS, like array's `map(..)`, where empty slots are suprisingly skipped over! Never, ever intentionally create empty slots in your arrays. This in undebateably one of JS's "bad parts".

### Functions

I don't have much specifically to say about functions here, other than to point out that they are also sub-object-types. This means that in addition to being executable, they can also have named properties added to or accessed from them.

Functions have two pre-defined properties you may find yourself interacting with, specifially for meta-programming purposes:

```js
function help(opt1,opt2,...remainingOpts) {
    // ..
}

help.name;          // "help"
help.length;        // 2
```

The `length` of a function is the count of its explicitly defined parameters, up to but not including a parameter that either has a default value defined (e.g., `param = 42`) or a "rest parameter" (e.g., `...remainingOpts`).

#### Avoid Setting Function-Object Properties

You should avoid assigning properties on function objects. If you're looking to store extra information associated with a function, use a separate `Map(..)` (or `WeakMap(..)`) with the function object as the key, and the extra information as the value.

```js
extraInfo = new Map();

extraInfo.set(help,"this is some important information");

// later:
extraInfo.get(help);   // "this is some important information"
```

## Behavior Overview

Prototypes are internal linkages between objects that allow property or method access against one object -- if the property/method requested is absent -- to be handled by "delegating" that access to another object. When the delegation involves a method, the context for the method to run in is shared from the initial object to the target object via the `this` keyword.

Prior to ES6, the prototype system was how developers expressed (i.e., emulated) the class design pattern in JS -- so-called "prototypal inheritance". ES6 introduced the `class` keyword as a syntactic affordance to embrace and centralize the prevalence of varied class design approaches. Ostensibly, `class` was introduced as "sugar" built on top of manual/explicit prototypal classes.

[^mop]: "Metaobject", Wikipedia, https://en.wikipedia.org/wiki/Metaobject
