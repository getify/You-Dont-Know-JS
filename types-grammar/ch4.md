# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 4: Coercing Values

| NOTE: |
| :--- |
| Work in progress |

We've thouroughly covered all of the different *types* of values in JS. And along the way, more than a few times, we mentioned the notion of converting -- actually, coercing -- from one type of value to another.

In this chapter, we'll dive deep into coercion and uncover all its mysteries.

## Abstracts

The JS specification details a number of *abstract operations*[^AbstractOperations] that dictate internal conversion from one value-type to another. It's important to be aware of these operations, as coercive mechanics in the language mix and match them in various ways.

These operations *look* as if they're real functions that could be called, such as `ToString(..)` or `ToNumber(..)`. But by *abstract*, we mean they only exist conceptually by these names; they aren't functions we can *directly* invoke in our programs. Instead, we invoke them implicitly/indirectly depending on the statements/expressions in our programs.

### ToBoolean

Decision making (conditional branching) always requires a boolean `true` or `false` value. But it's extremely common to want to make these decisions based on non-boolean value conditions, such as whether a string is empty or has anything in it.

When non-boolean values are encountered in a context that requires a boolean -- such as the condition clause of an `if` statement or `for` loop -- the `ToBoolean(..)`[^ToBoolean] abstract operation is invoked to facilitate the coercion.

All values in JS are in one of two buckets: *truthy* or *falsy*. Truthy values coerce via the `ToBoolean()` operation to `true`, whereas falsy values coerce to `false`:

```
// ToBoolean() is abstract

ToBoolean(undefined);               // false
ToBoolean(null);                    // false
ToBoolean("");                      // false
ToBoolean(0);                       // false
ToBoolean(-0);                      // false
ToBoolean(0n);                      // false
ToBoolean(NaN);                     // false
```

Simple rule: *any other value* that's not in the above list is truthy and coerces via `ToBoolean()` to `true`:

```
ToBoolean("hello");                 // true
ToBoolean(42);                      // true
ToBoolean([ 1, 2, 3 ]);             // true
ToBoolean({ a: 1 });                // true
```

Even values like `"   "` (string with only whitespace), `[]` (empty array), and `{}` (empty object), which may seem intuitively like they're more "false" than "true", nevertheless coerce to `true`.

| WARNING: |
| :--- |
| There *are* narrow, tricky exceptions to this truthy rule. For example, the web platform has deprecated the long-standing `document.all` collection/array feature, though it cannot be removed entirely -- that would break too many sites. Even where `document.all` is still defined, it behaves as a "falsy object" that coerces to `false`; that means legacy conditional checks like `if (document.all) { .. }` no longer pass. |

The `ToBoolean()` coercion operation is basically a lookup table rather than an algorithm of steps to use in coercions a non-boolean to a boolean. Thus, some developers assert that this isn't *really* coercion the way other abstract coercion operations are. I think that's bogus. `ToBoolean()` converts from non-boolean value-types to a boolean, and that's clear cut type coercion (even if it's a very simple lookup instead of an algorithm).

Keep in mind: these rules of boolean coercion only apply when `ToBoolean()` is actually invoked. There are constructs/idioms in the JS language that may appear to involve boolean coercion but which don't actually do so.

### ToPrimitive

Any value that's not already a primitive can be reduced to a primitive using the `ToPrimitive()` (specifically, `OrdinaryToPrimitive()`[^OrdinaryToPrimitive]) abstract operation.  Generally, the `ToPrimitive()` is given a *hint* to tell it whether a `number` or `string` is preferred.

```
// ToPrimitive() is abstract

ToPrimitive({ a: 1 },"string");          // "[object Object]"

ToPrimitive({ a: 1 },"number");          // NaN
```

The `ToPrimitive()` operation will look on the object provided, for either a `toString()` method or a `valueOf()` method; the order it looks for those is controlled by the *hint*.

If the method returns a value matching the *hinted* type, the operation is finished. But if the method doesn't return a value of the *hinted* type, `ToPrimitive()` will then look for and invoke the other method (if found).

If the attempts at method invocation fail to produce a value of the *hinted* type, the final return value is forcibly coerced via the corresponding abstract operation: `ToString()` or `ToNumber()`.

### ToString

Pretty much any value that's not already a string can be coerced to a string representation, via `ToString()`. [^ToString] This is usually quite intuitive, especially with primitive values:

```
// ToString() is abstract

ToString(42.0);                 // "42"
ToString(-3);                   // "-3"
ToString(Infinity);             // "Infinity"
ToString(NaN);                  // "NaN"
ToString(42n);                  // "42"

ToString(true);                 // "true"
ToString(false);                // "false"

ToString(null);                 // "null"
ToString(undefined);            // "undefined"
```

There are *some* results that may vary from common intuition. As mentioned in Chapter 2, very large or very small numbers will be represented using scientific notation:

```
ToString(Number.MAX_VALUE);     // "1.7976931348623157e+308"
ToString(Math.EPSILON);         // "2.220446049250313e-16"
```

Another counter-intuitive result comes from `-0`:

```
ToString(-0);                   // "0" -- wtf?
```

This isn't a bug, it's just an intentional behavior from the earliest days of JS, based on the assumption that developers generally wouldn't want to ever see a negative-zero output.

One primitive value-type that is *not allowed* to be coerced (implicitly, at least) to string is `symbol`:

```
ToString(Symbol("ok"));         // TypeError exception thrown
```

| WARNING: |
| :--- |
| Calling the `String()`[^StringFunction] concrete function (without `new` operator) is generally thought of as *merely* invoking the `ToString()` abstract operation. While that's mostly true, it's not entirely so. `String(Symbol("ok"))` works, whereas the abstract `ToString(Symbol(..))` itself throws an exception. |

#### Default `toString()`

When `ToString()` is performed on object value-types, it instead invokes the `ToPrimitive()` operation (as explained earlier), with `"string"` as its *hinted* type:

```
ToString(new String("abc"));        // "abc"
ToString(new Number(42));           // "42"

ToString({ a: 1 });                 // "[object Object]"
ToString([ 1, 2, 3 ]);              // "1,2,3"
```

By virtue of `ToPrimitive(..,"string")` delegation, these objects all have their default `toString()` method (inherited via `[[Prototype]]`) invoked.

### ToNumber

Non-number values *that resemble* numbers, such as numeric strings, can generally be coerced to a numeric representation, using `ToNumber()`: [^ToNumber]

```
// ToNumber() is abstract

ToNumber("42");                     // 42
ToNumber("-3");                     // -3
ToNumber("1.2300");                 // 1.23
ToNumber("   8.0    ");             // 8
```

If the full value doesn't *completely* (other than whitespace) resemble a valid number, the result will be `NaN`:

```
ToNumber("123px");                  // NaN
ToNumber("hello");                  // NaN
```

Other primitive values have certain designated numeric equivalents:

```
ToNumber(true);                     // 1
ToNumber(false);                    // 0

ToNumber(null);                     // 0
ToNumber(undefined);                // NaN
```

There are some rather surprising designations for `ToNumber()`:

```
ToNumber("");                       // 0
ToNumber("       ");                // 0
```

| NOTE: |
| :--- |
| I call these "surprising" because I think it would have made much more sense for them to coerce to `NaN`, the way `undefined` does. |

Some primitive values are *not allowed* to be coerced to numbers, and result in exceptions rather than `NaN`:

```
ToNumber(42n);                      // TypeError exception thrown
ToNumber(Symbol("42"));             // TypeError exception thrown
```

| WARNING: |
| :--- |
| Calling the `Number()`[^NumberFunction] concrete function (without `new` operator) is generally thought of as *merely* invoking the `ToNumber()` abstract operation to coerce a value to a number. While that's mostly true, it's not entirely so. `Number(42n)` works, whereas the abstract `ToNumber(42n)` itself throws an exception. |

#### Other Abstract Numeric Conversions

In addition to `ToNumber()`, the specification defines `ToNumeric()`, which is essentially invokes `ToPrimitive()` on a value, then conditionally invokes `ToNumber()` if the value is *not* already a `bigint` value-type.

There are also a wide variety of abstract operations related to converting values to very specific subsets of the general `number` type:

* `ToIntegerOrInfinity()`
* `ToInt32()`
* `ToUint32()`
* `ToInt16()`
* `ToUint16()`
* `ToInt8()`
* `ToUint8()`
* `ToUint8Clamp()`

Other operations related to `bigint`:

* `ToBigInt()`
* `StringToBigInt()`
* `ToBigInt64()`
* `ToBigUint64()`

You can probably infer the purpose of these operations from their names, and/or from consulting their algorithms in the specification. For most JS operations, it's more likely that a higher-level operation like `ToNumber()` is invoked, rather than these specific ones.

#### Default `valueOf()`

When `ToNumber()` is performed on object value-types, it instead invokes the `ToPrimitive()` operation (as explained earlier), with `"number"` as its *hinted* type:

```
ToNumber(new String("abc"));        // NaN
ToNumber(new Number(42));           // 42

ToNumber({ a: 1 });                 // NaN
ToNumber([ 1, 2, 3 ]);              // NaN
ToNumber([]);                       // 0
```

By virtue of `ToPrimitive(..,"number")` delegation, these objects all have their default `valueOf()` method (inherited via `[[Prototype]]`) invoked.

### Equality Comparison

When JS needs to determine if two values are the *same value*, it invokes the `SameValue()`[^SameValue] operation, which delegates to a variety of related sub-operations.

This operation is very narrow and strict, and performs no coercion or any other special case exceptions. If two values are *exactly* the same, the result is `true`, otherwise it's `false`:

```
// SameValue() is abstract

SameValue("hello","\x68ello");          // true
SameValue("\u{1F4F1}","\uD83D\uDCF1");  // true
SameValue(42,42);                       // true
SameValue(NaN,NaN);                     // true

SameValue("\u00e9","\u0065\u0301");     // false
SameValue(0,-0);                        // false
SameValue([1,2,3],[1,2,3]);             // false
```

A variation of these operations is `SameValueZero()` and its associated sub-operations. The main difference is that these operations treat `0` and `-0` as indistinguishable.

```
// SameValueZero() is abstract

SameValueZero(0,-0);                    // true
```

If the values are numeric (`number` or `bigint`), `SameValue()` and `SameValueZero()` both delegate to sub-operations of the same names, specialized for each `number` and `bigint` type, respectively.

Otherwise, `SameValueNonNumeric()` is the sub-operation delegated to if the values being compared are both non-numeric:

```
// SameValueNonNumeric() is abstract

SameValueNonNumeric("hello","hello");   // true

SameValueNonNumeric([1,2,3],[1,2,3]);   // false
```

#### Higher-Abstracted Equality

Different from `SameValue()` and its variations, the specification also defines two important higher-abstraction abstract equality comparison operations:

* `IsStrictlyEqual()`[^StrictEquality]
* `IsLooselyEqual()`[^LooseEquality]

The `IsStrictlyEqual()` operation immediately returns `false` if the value-types being compared are different.

If the value-types are the same, `IsStrictlyEqual()` delegates to sub-operations for comparing `number` or `bigint` values. You might logically expect these delegated sub-operations to be the aforementioned numeric-specialized `SameValue()` / `SameValueZero()` operations. However, `IsStrictlyEqual()` instead delegates to `Number:equal()`[^NumberEqual] or `BigInt:equal()`[^BigIntEqual].

The difference between `Number:SameValue()` and `Number:equal()` is that the latter defines corner cases for `0` vs `-0` comparison:

```
// all of these are abstract operations

Number:SameValue(0,-0);             // false
Number:SameValueZero(0,-0);         // true
Number:equal(0,-0);                 // true
```

These operations also differ in `NaN` vs `NaN` comparison:

```
Number:SameValue(NaN,NaN);          // true
Number:equal(NaN,NaN);              // false
```

| WARNING: |
| :--- |
| So in other words, despite its name, `IsStrictlyEqual()` is not quite as "strict" as `SameValue()`, in that it *lies* when comparisons of `-0` or `NaN` are involved. |

The `IsLooselyEqual()` operation also inspects the value-types being compared; if they're the same, it immediately delegates to `IsStrictlyEqual()`.

But if the value-types being compared are different, `IsLooselyEqual()` performs a variety of *coercive equality* steps. It's important to note that this algorithm is always trying to reduce the comparison down to where both value-types are the same (and it tends to prefer `number` / `bigint`).

The steps of the *coercive equality* portion of the algorithm can roughly be summarized as follows:

1. If either value is `null` and the other is `undefined`, `IsLooselyEqual()` returns `true`. In other words, this algorithm applies *nullish* equality, in that `null` and `undefined` are coercively equal to each other (and to no other values).

2. If either value is a `number` and the other is a `string`, the `string` value is coerced to a `number` via `ToNumber()`.

3. If either value is a `bigint` and the other is a `string`, the `string` value is coerced to a `bigint` via `StringToBigInt()`.

4. If either value is a `boolean`, it's coerced to a `number`.

5. If either value is a non-primitive (object, etc), it's coerced to a primitive with `ToPrimitive()`; though a *hint* is not explicitly provided, the default behavior will be as if `"number"` was the hint.

Each time a coercion is performed in the above steps, the algorithm is *recursively* reinvoked with the new value(s). That process continues until the types are the same, and then the comparison is delegated to the `IsStrictlyEqual()` operation.

What can we take from this algorithm? First, we see there is a bias toward `number` (or `bigint`) comparison; it nevers coerce values to `string` or `boolean` value-types.

Importantly, we see that both `IsLooselyEqual()` and `IsStrictlyEqual()` are type-sensitive. `IsStrictlyEqual()` immediately bails if the types mismatch, whereas `IsLooselyEqual()` performs the extra work to coerce mismatching value-types to be the same value-types (again, ideally, `number` or `bigint`).

Moreover, if/once the types are the same, both operations are identical -- `IsLooselyEqual()` delegates to `IsStrictlyEqual()`.

### Relational Comparison

// TODO

[^AbstractOperations]: "7.1 Type Conversion", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-type-conversion ; Accessed August 2022

[^ToBoolean]: "7.1.2 ToBoolean(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-toboolean ; Accessed August 2022

[^OrdinaryToPrimitive]: "7.1.1.1 OrdinaryToPrimitive(O,hint)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-ordinarytoprimitive ; Accessed August 2022

[^ToString]: "7.1.17 ToString(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tostring ; Accessed August 2022

[^StringConstructor]: "22.1.1 The String Constructor", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-string-constructor ; Accessed August 2022

[^StringFunction]: "22.1.1.1 String(value)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-string-constructor-string-value ; Accessed August 2022

[^ToNumber]: "7.1.4 ToNumber(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tonumber ; Accessed August 2022

[^ToNumeric]: "7.1.3 ToNumeric(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tonumeric ; Accessed August 2022

[^NumberConstructor]: "21.1.1 The Number Constructor", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-number-constructor ; Accessed August 2022

[^NumberFunction]: "21.1.1.1 Number(value)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-number-constructor-number-value ; Accessed August 2022

[^SameValue]: "7.2.11 SameValue(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-samevalue ; Accessed August 2022

[^StrictEquality]: "7.2.16 IsStrictlyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-isstrictlyequal ; Accessed August 2022

[^LooseEquality]: "7.2.15 IsLooselyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-islooselyequal ; Accessed August 2022

[^NumberEqual]: "6.1.6.1.13 Number:equal(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types-number-equal ; Accessed August 2022

[^BigIntEqual]: "6.1.6.2.13 BigInt:equal(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types-bigint-equal ; Accessed August 2022
