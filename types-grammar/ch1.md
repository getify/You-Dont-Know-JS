# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 1: Primitives

| NOTE: |
| :--- |
| Work in progress |

In Chapter 1 of the "Objects & Classes" book of this series, we confronted the common misconception that "everything in JS is an object". We now circle back to that topic, and again dispell that myth.

Here, we'll look at the core value types of JS, specifically the non-object types called *primitives*.

## Core Values

The JS language defines seven built-in, primitive (non-object) value types:

* `null`
* `undefined`
* `boolean`
* `string`
* `number`
* `bigint`
* `symbol`

It's important to note: JS doesn't apply types to variables or properties -- what I call, "container types" -- but rather values themselves have types -- what I call, "value types".

These value-types define collections of one or more concrete values. Each value-type has a shared set of expected behaviors for all values of that type.

### Type-Of

Any value's value-type can be inspected via the `typeof` operator, which always returns a `string` value representing the underlying JS value-type:

```js
typeof 42;              // "number"

greeting = "Hello";
typeof greeting;        // "string"
```

Notice that the `typeof` operator, when used against a variable, is reporting the value-type of the value in the variable. Again, JS variables themselves don't have types. They hold any arbitrary value, which itself has a value-type.

### Empty Values

The `null` and `undefined` types both typically represent an emptiness or absence of value.

However, each respective type has exactly one value, of the same name. So `null` is the only value in the `null` value-type, and `undefined` is the only value in the `undefined` value-type.

// TODO

### Boolean Values

The `boolean` type contains two values: `true` and `false`.

// TODO

### String Values

The `string` type contains any value which is a collection of one or more characters:

```js
myName = "Kyle";
```

// TODO

### Number Values

The `number` type contains any numeric value, such as `-42` or `3.1415926`.

// TODO

### BigInteger Values

The `bigint` type contains any integer. To distinguish a `bigint` from a `number` value, which could otherwise both look the same (`42`), JS requires an `n` suffix on `bigint` values:

```js
myAge = 42n;        // this is a bigint, not a number

myKidsAge = 11;     // this is a number, not a bigint
```

// TODO

### Symbol Values

The `symbol` type contains special opaque values called "symbols". These values can only be created by the `Symbol(..)` function:

```js
secret = Symbol("my secret");
```

The `"my secret"` string passed into the `Symbol` is *not* the symbol value itself, even though it seems that way. It's an optional descriptive label, used only for debugging purposes for the benefit of the developer.

The underlying value returned from `Symbol(..)` is a special kind of value that resists the program/developer inspecting anything about its underlying representation. That's what I mean by "opaque".

Symbols are guaranteed by the JS engine to be unique (only within the program itself), and are unguessable. In other words, a duplicate symbol value can never be created in a program.

// TODO

## Value Immutability

All primitive values are immutable, meaning nothing in a JS program can reach into the inside of the value and modify it in any way.

New values are created through operations, but these do not modify the original value.

```js
42 + 1;             // 43

"Hello" + "!";      // "Hello!"
```

The values `43` and `"Hello!"` are new, distinct values from the `42` and `"Hello"` values, respectively.

// TODO

## Assignments Are Value Copies

Any assignment of a value from one variable/container to another is a *value-copy*.

```js
myAge = 42;

yourAge = myAge;        // assigned by value-copy
```

Here, the `myAge` and `yourAge` variables each have their own copy of the number value `42`. That means if we later re-assign `myAge` to `43` when I have a birthday, it doesn't affect the `42` that's still assigned to `yourAge`.

// TODO
