# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 2: Value Behavior

So far, we've explored seven built-in primitive value types in JS: `null`, `undefined`, `boolean`, `string`, `number`, `bigint`, and `symbol`.

Chapter 1 was quite a lot to take in, much more involved than I bet most readers expected. If you're still catching your breath after reading all that, don't worry about taking a bit of a break before continuing on here!

Once you're clear headed and ready to move on, let's dig into certain behaviors implied by value types for all their respective values. We'll take a careful and  closer look at all of these various behaviors.

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
