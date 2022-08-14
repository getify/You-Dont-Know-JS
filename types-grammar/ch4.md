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

[^AbstractOperations]: "7.1 Type Conversion", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-type-conversion ; Accessed August 2022

[^OrdinaryToPrimitive]: "7.1.1.1 OrdinaryToPrimitive(O,hint)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-ordinarytoprimitive ; Accessed August 2022

[^ToString]: "7.1.17 ToString(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tostring ; Accessed August 2022

[^StringConstructor]: "22.1.1 The String Constructor", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-string-constructor ; Accessed August 2022

[^StringFunction]: "22.1.1.1 String(value)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-string-constructor-string-value ; Accessed August 2022

[^ToNumber]: "7.1.4 ToNumber(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tonumber ; Accessed August 2022

[^NumberConstructor]: "21.1.1 The Number Constructor", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-number-constructor ; Accessed August 2022

[^NumberFunction]: "21.1.1.1 Number(value)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-number-constructor-number-value ; Accessed August 2022
