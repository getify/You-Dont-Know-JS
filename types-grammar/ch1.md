# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 1: Primitives

| NOTE: |
| :--- |
| Work in progress |

In Chapter 1 of the "Objects & Classes" book of this series, we confronted the common misconception that "everything in JS is an object". We now circle back to that topic, and again dispell that myth.

Here, we'll look at the core value types of JS, specifically the non-object types called *primitives*.

## Core Values

JS provides seven built-in, primitive (non-object) value types:

* `null`
* `undefined`
* `boolean`
* `string`
* `number`
* `bigint`
* `symbol`

JS doesn't apply types to variables or properties -- what I call, "container types" -- but rather, values themselves have types -- what I call, "value types".

These value-types define collections of one or more concrete values. Each value-type has a shared set of expected behaviors for all values of that type.

### Type-Of

Any value's value-type can be inspected via the `typeof` operator, which always returns a `string` value representing the underlying JS value-type:

```js
typeof true;            // "boolean"

typeof 42;              // "number"

typeof 42n;             // "bigint"

typeof Symbol("42");    // "symbol"
```

The `typeof` operator, when used against a variable instead of a value, is reporting the value-type of *the value in the variable*:

```js
greeting = "Hello";
typeof greeting;        // "string"
```

JS variables themselves don't have types. They hold any arbitrary value, which itself has a value-type.

### Empty Values

The `null` and `undefined` types both typically represent an emptiness or absence of value.

The `null` value-type has an unexpected `typeof` result. Instead of `"null"`, we see:

```js
typeof null;            // "object"
```

No, that doesn't mean that `null` is somehow a special kind of object. It's just a legacy of early days of JS, which cannot be changed because of how much code out in the wild it would break.

The `undefined` type is reported both for explicit `undefined` values and any place where a seemingly missing value is encountered:

```js
typeof undefined;               // "undefined"

var whatever;

typeof whatever;                // "undefined"
typeof nonExistent;             // "undefined"

whatever = {};
typeof whatever.missingProp;    // "undefined"

whatever = [];
typeof whatever[10];            // "undefined"
```

| NOTE: |
| :--- |
| The `typeof nonExistent` expression is referring to an undeclared variable `nonExisttent`. Normally, accessing an undeclared variable reference would cause an exception, but the `typeof` operator is afforded the special ability to safely access even non-existent identifiers and calmly return `"undefined"` instead of throwing an exception. |

However, each respective "empty" type has exactly one value, of the same name. So `null` is the only value in the `null` value-type, and `undefined` is the only value in the `undefined` value-type.

#### Null'ish

Semantically, `null` and `undefined` types both represent emptiness, or absence of another affirmative, meaningful value.

| NOTE: |
| :--- |
| JS operations which behave the same whether `null` or `undefined` is encountered, are referred to as "null'ish" (or "nullish"). I guess "undefined'ish" would look/sound too weird! |

For a lot of JS, especially the code developers write, these two *nullish* values are interchangeable; the decision to intentionally use/assign `null` or `undefined` in any given scenario is situation dependent and left up to the developer.

JS provides a number of capabilities for helping treat the two nullish values as indistinguishable.

For example, the `==` (coercive-equality comparision) operator specifically treats `null` and `undefined` as coercively equal to each other, but to no other values in the language. As such, as `.. == null` check is safe to perform if you want to check if a value is specifically either `null` or `undefined`:

```js
if (greeting == null) {
    // greeting is nullish/empty
}
```

Another (recent) addition to JS is the `??` (nullish-coalescing) operator:

```js
who = myName ?? "User";

// equivalent to:
who = (myName != null) ? myName : "User";
```

As the ternary equivalent illustrates, `??` checks to see if `myName` is non-nullish, and if so, returns its value. Otherwise, it returns the other operand (here, `"User"`).

Along with `??`, JS also added the `?.` (nullish conditional-chaining) operator:

```js
record = {
    shippingAddress: {
        street: "123 JS Lane",
        city: "Browserville",
        state: "XY"
    }
};

console.log( record?.shippingAddress?.street );
// 123 JS Lane

console.log( record?.billingAddress?.street );
// undefined
```

The `?.` operator checks the value immediately preceding (to the left) value, and if it's nullish, the operator stops and returns an `undefined` value. Otherwise, it performs the `.` property access against that value and continues with the expression.

Just to be clear: `record?.` is saying, "check `record` for nullish before `.` property access". Additionally, `billingAddress?.` is saying, "check `billingAddress` for nullish before `.` property access".

| WARNING: |
| :--- |
| Some JS developers believe that the newer `?.` is superior to `.`, and should thus almost always be used instead of `.`. I believe that's an unwise perspective. First of all, it's adding extra visual clutter, which should only be done if you're getting benefit from it. Secondly, you should be aware of, and planning for, the emptiness of some value, to justify using `?.`. If you always expect a non-nullish value to be present in some expression, using `?.` to access a property on it is not only unnecessary/wasteful, but also could potentially hide future bugs where your assumption of value-presence had failed but `?.` covered it up. As with most features in JS, use `.` where it's most appropriate, and use `?.` where it's most appropriate. Never substitute one when the other is more appropriate. |

#### Distint'ish

It's important to keep in mind that `null` and `undefined` *are* actually distinct types, and thus `null` is quite noticeably distinct from `undefined`. You can, carefully, construct programs that mostly treat them as indistinguishable. But that requires care and discipline by the developer. From JS's perspective, they're often distinct.

There are cases where `null` and `undefined` will trigger different behavior by the language, which is important to keep in mind. We won't cover all the cases exhaustively here, but here's on example:

```js
function greet(msg = "Hello") {
    console.log(msg);
}

greet();            // Hello
greet(undefined);   // Hello
greet("Hi");        // Hi

greet(null);        // null
```

The `= ..` clause on a parameter is referred to as the "parameter default". It only kicks in and assigns its default value to the parameter if the argument in that position is missing, or is exactly the `undefined` value. If you pass `null`, that clause doesn't trigger, and `null` is thus assigned to the parameter.

### Boolean Values

The `boolean` type contains two values: `false` and `true`.

// TODO

### String Values

The `string` type contains any value which is a collection of one or more characters:

```js
myName = "Kyle";
```

// TODO

### Number Values

The `number` type contains any numeric value (whole number or decimal), such as `-42` or `3.1415926`. These values are represented by the JS engine as 64-bit, IEEE-754 double-precision binary floating-point values. [^IEEE754]

JS `number`s are always decimals; whole numbers (aka "integers") are not stored in a different/special way. An "integer" stored as a `number` value merely has nothing non-zero as its fraction portion; `42` is thus indistinguishable in JS from `42.0` and `42.000000`.

We can use `Number.isInteger(..)` to determine if a `number` value has any non-zero fraction or not:

```js
Number.isInteger(42);           // true
Number.isInteger(42.0);         // true
Number.isInteger(42.000000);    // true

Number.isInteger(42.0000001);   // false
```

#### IEEE-754 Bitwise Binary Representations

IEEE-754[^IEEE754] is a technical standard for binary representation of decimal numbers. It's widely used by most computer programming languages, including JS, Python, Ruby, etc.

In 64-bit IEEE-754 -- so called "double-precision" because originally IEEE-754 used to be 32-bit, and now it's double that! -- the 64 bits are divided into 52 bits for the number's base value (aka, "fraction", "mantissa", or "significand"), 11 bits for the exponent to raise that value to, and 1 bit for the sign of the ultimate value.

These bits are arranged left-to-right, as so (S = Sign Bit, E = Exponent Bit, M = Mantissa Bit):

```js
SEEEEEEEEEEEMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
```

So, the number `42` (or `42.000000`) would be represented by these bits:

```js
01000000010001010000000000000000
00000000000000000000000000000000
```

The sign bit is `0`, meaning the number is positive (`1` means negative).

The 11-bit exponent is binary `10000000100`, which in base-10 is `1028`. But in IEEE-754, this value is interpreted as being stored unsigned with an "exponent bias" of `1023`, meaning that we're shifting up the exponent range from `-1022:1023` to `1:2046` (where `0` and `2047` are reserved for special representations). So, take `1028` and subtract the bias `1023`, which gives an effective exponent of `5`. We raise `2` to that value (`2^5`), giving `32`.

| NOTE: |
| :--- |
| If the subtracting `1023` from the exponent value gives a negative (e.g., `-3`), that's still interpreted as `2`'s exponent. Raising `2` to negative numbers just produces smaller and smaller values. |

The remaining 52 bits give us the base value `01010000...`, interpreted as binary decimal `1.0101000...` (with all trailing zeros). Converting *that* to base-10, we get `1.3125000...`. Finally, then multiply that by `32` already computed from the exponent. The result: `42`.

As you might be able to tell now, this IEEE-754 number representation standard is called "floating point" because the decimal point "floats" back-and-forth along the bits, depending on the specified exponent value.

The number `42.0000001`, which is only different from `42.000000` by just `0.0000001`, would be represented by these bits:

```js
01000000010001010000000000000000
00000000110101101011111110010101
```

Notice how the previous bit pattern and this one differ by quite a few bits in the trailing positions! The binary decimal fraction containing all those extra `1` bits (`1.010100000000..01011111110010101`) converts to base-10 as `1.31250000312500003652`, which multipled by `32` gives us `42.0000001`.

Now you understand a *bit more* about how IEEE-754 works!

##### Floating Point Imprecision

One of the classic gotchas of any IEEE-754 number system in any programming language -- NOT UNIQUELY JS! -- is that not all operations and values can fit neatly into the IEEE-754 representations.

The most common illustration is:

```js
point3a = 0.1 + 0.2;
point3b = 0.3;

point3a;                        // 0.30000000000000004
point3b;                        // 0.3

point3a === point3b;            // false <-- oops!
```

The operation `0.1 + 0.2` ends up creating floating-point error (drift), where the value stored is actually `0.30000000000000004`.

The respective bit representations are:

```
// 0.30000000000000004
00111111110100110011001100110011
00110011001100110011001100110100

// 0.3
00111111110100110011001100110011
00110011001100110011001100110011
```

If you look closely at those bit patterns, only the last 2 bits differ, from `00` to `11`. But that's enough for those two numbers to be unequal!

Again, just to reinforce: this behavior is **NOT IN ANY WAY** unique to JS. This is exactly how any IEEE-754 conforming programming language will work in the same scenario. As I asserted above, the majority of all programming languages use IEEE-754, and thus they will all suffer this same fate.

The temptation to make fun of JS for `0.1 + 0.2 !== 0.3` is strong. But it's completely bogus.

Pretty much all programmers need to be aware of IEEE-754 and make sure they are careful about these kinds of gotchas. It's somewhat amazing, in a disappointing way, how few of them have any idea how IEEE-754 works. If you've taken your time reading and understanding the last several sections of this chapter, you're now in that rare tiny percentage who actually put in the effort to understand the numbers in their programs!

| TIP: |
| :--- |
| Shortly, we'll cover `Number.EPSILON`, which offers an approach to working around this floating point error situation when comparing numbers. |

#### Number Limits

As might be evident now that you've seen how IEEE-754 works, the 52 bits of the number's base must be shared, representing both the whole number portion (if any) as well as the decimal portion (if any), of the intended `number` value. Essentially, the larger the whole number portion to be represented, the less bits are available for the decimal portion, and vice versa.

The largest value that can accurately be stored in the `number` type is exposed as `Number.MAX_VALUE`:

```js
Number.MAX_VALUE;           // 1.7976931348623157e+308
```

You might expect that value to be a decimal value, given the representation. But on closer inspection, `1.79E308` is (approximately) `2^1024 - 1`. That seems much more like it should be an integer, right? We can verify:

```js
Number.isInteger(Number.MAX_VALUE);         // true
```

But what happens if you go above the max value?

```js
Number.MAX_VALUE === (Number.MAX_VALUE + 1);
// true -- oops!

Number.MAX_VALUE === (Number.MAX_VALUE + 10000000);
// true
```

So, is `Number.MAX_VALUE` actually the largest value representable in JS? It's certainly the largest *finite* `number` value.

IEEE-754 defines a special infinite value, which JS exposes as `Infinity`; there's also a `-Infinity` at the far other end of the number line. Values can be tested to see if they are finite or infinite:

```js
Number.isFinite(Number.MAX_VALUE);  // true

Number.isFinite(Infinity);          // false
Number.isFinite(-Infinity);         // false
```

You can't ever count upwards (with `+ 1`) from `Number.MAX_VALUE` to `Infinity`, no matter how long you let the program run, because the `+ 1` operation isn't actually incrementing beyond the top `Number.MAX_VALUE` value.

However, JS arithmetic operations (`+`, `*`, and even `/`) can definitely overflow the `number` type on the top-end, in which case `Infinity` is the result:

```js
Number.MAX_VALUE + 1E291;           // 1.7976931348623157e+308
Number.MAX_VALUE + 1E292;           // Infinity

Number.MAX_VALUE * 1.0000000001;    // Infinity

1 / 1E-308;                         // 1e+308
1 / 1E-309;                         // Infinity
```

| TIP: |
| :--- |
| The reverse is not true: an arithmetic operation on an infinite value *will never* produce a finite value. |

Going from the very large to the very, very small -- actually, closest to zero, which is not the same thing as going very, very negative! -- the smallest absolute decimal value you could theoretically store in the `number` type would be `2^-1022` (remember the IEEE-754 exponent range?), or around `2E-308`. However, JS engines are allowed by the specification to vary in their internal representations for this lower limit. Whatever the engine's effective lower limit is, it'll be exposed as `Number.MIN_VALUE`:

```js
Number.MIN_VALUE;               // 5e-324 <-- usually!
```

Most JS engines seem to have a minimum representable value around `5E-324` (about `2^-1074`). Depending on the engine and/or platform, a different value may be exposed. Be careful about any program logic that relies on such implementation-dependent values.

#### Safely Small

There's another *very small* `number` value you may want to use:

```js
Number.EPSILON;                 // 2.220446049250313e-16
```

*Epsilon* is defined as the smallest difference JS can represent between `1` and the next value greater than `1`. While this value is implementation/platform dependent, it's typically about `2.2E16`, or `2^-52`. This value is the maximum amount of floating-point representation error (as discussed earlier), so it represents the threshold above which two values are *actually* different rather just skewed by error.

Thus, `Number.EPSILON` can used as a *very small* tolerance value to ensure number comparisons are *safe*:

```js
function safeNumberEquals(a,b) {
    return Math.abs(a - b) < Number.EPSILON;
}

point3a = 0.1 + 0.2;
point3b = 0.3;

// are these safely "equal"?
safeNumberEquals(point3a,point3b);      // true
```

Since JS cannot represent a difference between two values smaller than this `Number.EPSILON`, it should be safe to treat any two number values as "equal" (indistinguishable in JS, anyway) if their difference is less than `Number.EPSILON`.

| WARNING: |
| :--- |
| If your program needs to deal with smaller values, or more specifically, smaller differences between values, than `2^-52`, you should absolutely *not use* the `number` value-type. There are decimal-emulation libraries that can offer arbitrary (small or large) precision. Or pick a different language than JS. |

#### Safe Integer Limits

Since `Number.MAX_VALUE` is an integer, you might assume that it's the largest integer in the language. But that's not really accurate.

The largest integer you can accurately store in the `number` type is `2^53 - 1`, or `9007199254740991`, which is *way smaller* than `Number.MAX_VALUE` (about `2^1024 - 1`). This special safer value is exposed as `Number.MAX_SAFE_INTEGER`:

```js
maxInt = Number.MAX_SAFE_INTEGER;

maxInt;             // 9007199254740991

maxInt + 1;         // 9007199254740992

maxInt + 2;         // 9007199254740992
```

We've seen that integers larger than `9007199254740991` can show up. However, those larger integers are not "safe", in that the precision/accuracy start to break down when you do operations with them. As shown above, the `maxInt + 1` and `maxInt + 2` expressions both errantly give the same result, illustrating the hazard when exceeding the `Number.MAX_SAFE_INTEGER` limit.

But what's the smallest safe integer?

Depending on how you interpret "smallest", you could either answer `0` or... `Number.MIN_SAFE_INTEGER`:

```js
Number.MIN_SAFE_INTEGER;    // -9007199254740991
```

### BigInteger Values

As the maximum safe integer in JS `number`s is `9007199254740991`, such a relatively low limit can present a problem if a JS program needs to do larger integer math, or even just hold values like 64-bit integer IDs (e.g., Twitter Tweet IDs).

For that reason, JS provides the alternate `bigint` type (BigInteger), which can store arbitrarily large (theoretically not limited, except by finite machine memory and/or JS implementation) integers.

To distinguish a `bigint` from a `number` value, which could otherwise both look the same (`42`), JS requires an `n` suffix on `bigint` values:

```js
myAge = 42n;        // this is a bigint, not a number

myKidsAge = 11;     // this is a number, not a bigint
```

Let's illustrate the upper un-boundedness of `bigint`:

```js
Number.MAX_SAFE_INTEGER;        // 9007199254740991

Number.MAX_SAFE_INTEGER + 2;    // 9007199254740992 -- oops!

myBigInt = 9007199254740991n;

myBigInt + 2n;                  // 9007199254740993n -- phew!
```

| WARNING: |
| :--- |
| Notice that the `+` operator required `.. + 2n` instead of just `.. + 2`? You cannot mix `number` and `bigint` value-types in the same expression. This restriction is annoying, but it protects your program from invalid mathematical operations that would give non-obvious unexpected results. |

As shown, the `bigint` value-type is able to do precise arithmetic above the integer limit of the `number` value-type.

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

[^IEEE754]: IEEE-754; https://en.wikipedia.org/wiki/IEEE_754; Accessed July 2022
