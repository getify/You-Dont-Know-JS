# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 2: Value Behavior

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
