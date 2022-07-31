# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 1: Primitives

| NOTE: |
| :--- |
| Work in progress |

In Chapter 1 of the "Objects & Classes" book of this series, we confronted the common misconception that "everything in JS is an object". We now circle back to that topic, and again dispell that myth.

Here, we'll look at the core value types of JS, specifically the non-object types called *primitives*.

## Built-in Values

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

Unfortunately, the `null` value-type has an unexpected `typeof` result. Instead of `"null"`, we see:

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
| The `typeof nonExistent` expression is referring to an undeclared variable `nonExistent`. Normally, accessing an undeclared variable reference would cause an exception, but the `typeof` operator is afforded the special ability to safely access even non-existent identifiers and calmly return `"undefined"` instead of throwing an exception. |

However, each respective "empty" type has exactly one value, of the same name. So `null` is the only value in the `null` value-type, and `undefined` is the only value in the `undefined` value-type.

#### Null'ish

Semantically, `null` and `undefined` types both represent general emptiness, or absence of another affirmative, meaningful value.

| NOTE: |
| :--- |
| JS operations which behave the same whether `null` or `undefined` is encountered, are referred to as "null'ish" (or "nullish"). I guess "undefined'ish" would look/sound too weird! |

For a lot of JS, especially the code developers write, these two *nullish* values are interchangeable; the decision to intentionally use/assign `null` or `undefined` in any given scenario is situation dependent and left up to the developer.

JS provides a number of capabilities for helping treat the two nullish values as indistinguishable.

For example, the `==` (coercive-equality comparision) operator specifically treats `null` and `undefined` as coercively equal to each other, but to no other values in the language. As such, a `.. == null` check is safe to perform if you want to check if a value is specifically either `null` or `undefined`:

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

There's also a somewhat strange `?.[` form of the operator, not `?[`, for when you need to use `[ .. ]` style access instead of `.` access:

```js
record?.["shipping" + "Address"]?.state;    // XY
```

Yet another variation, referred to as "optional-call", is `?.(`, and is used when conditionally calling a function if the value is non-nullish:

```js
// instead of:
//   if (someFunc) someFunc(42);
//
// or:
//   someFunc && someFunc(42);

someFunc?.(42);
```

The `?.(` operator seems like it is checking to see if `someFunc(..)` is a valid function that can be called. But it's not! It's only checking to make sure the value is non-nullish before trying to invoke it. If it's some other non-nullish but also non-function value type, the execution attempt will still fail with a `TypeError` exception.

| WARNING: |
| :--- |
| Because of that gotcha, I *strongly dislike* this operator form, and caution anyone against ever using it. I think it's a poorly conceived feature that does more harm (to JS itself, and to programs) than good. There's very few JS features I would go so far as to say, "never use it." But this is one of the truly *bad parts* of the language, in my opinion. |

#### Distinct'ish

It's important to keep in mind that `null` and `undefined` *are* actually distinct types, and thus `null` can be noticeably different from `undefined`. You can, carefully, construct programs that mostly treat them as indistinguishable. But that requires care and discipline by the developer. From JS's perspective, they're more often distinct.

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

There's no *right* or *wrong* way to use `null` or `undefined` in a program. So the takeaway is: be careful when choosing one value or the other. And if you're using them interchangeably, be extra careful.

### Boolean Values

The `boolean` type contains two values: `false` and `true`.

In the "old days", programming languages would, by convention, use `0` to mean `false` and `1` to mean `true`. So you can think of the `boolean` type, and the keywords `false` and `true`, as a semantic convenience sugar on top of the `0` and `1` values:

```js
// isLoggedIn = 1;
isLoggedIn = true;

isComplete = 0;
// isComplete = false;
```

Boolean values are how all decision making happens in a JS program:

```js
if (isLoggedIn) {
    // do something
}

while (!isComplete) {
    // keep going
}
```

The `!` operator negates/flips a boolean value to the other one: `false` becomes `true`, and `true` becomes `false`.

### String Values

The `string` type contains any value which is a collection of one or more characters, delimited (surrounding on either side) by quote characters:

```js
myName = "Kyle";
```

Strings can be delimited by double-quotes (`"`), single-quotes (`'`), or back-ticks (`` ` ``). The ending delimiter must always match the starting delimiter.

Strings have an intrinsic length which corresponds to how many code-points -- actually, code-units, more on that in a moment -- they contain.

```js
myName = "Kyle";

myName.length;      // 4
```

This does not necessarily correspond to the number of visible characters present between the start and end delimiters (aka, the string literal). It can sometimes be a little confusing to keep straight the difference between a string literal and the underlying string value, so pay close attention.

#### JS Character Encodings

What type of character encoding does JS use for string characters?

One might assume UTF-8 (8-bit) or UTF-16 (16-bit). It's actually more complicated, because you also need to consider UCS-2 (2-byte Universal Character Set), which is similar to UTF-16, but not quite the same. [^UTFUCS]

The first group of 65,535 code points in Unicode is called the BMP (Basic Multilingual Plane). All the rest of the code points are grouped into 16 so called "supplemental planes" or "astral planes". When representing Unicode characters from the BMP, it's pretty straightforward, as they can *fit* neatly into single JS characters.

But when representing extended characters outside the BMP, JS actually represents these characters code-points as a pairing of two separate code units, called *surrogate halves*.

For example, the Unicode code point `127878` (hexadecimal `1F386`) is `🎆` (fireworks symbol). JS stores this in the string value as two surrogate-halve code units: `U+D83C` and `U+DF86`.

This has implications on the length of strings, because a single visible character like the `🎆` fireworks symbol, when in a JS string, is a counted as 2 characters for the purposes of the string length!

We'll revisit Unicode characters shortly.

#### Escape Sequences

If `"` or `'` are used to delimit a string literal, the contents are only parsed for *character-escape sequences*: `\` followed by one or more characters that JS recognizes and parses with special meaning. Any other characters in a string that don't parse as escape-sequences (single-character or multi-character), are inserted as-is into the string value.

For single-character escape sequences, the following characters are recognized after a `\`: `b`, `f`, `n`, `r`, `t`, `v`, `0`, `'`, `"`, and `\`. For example,  `\n` means new-line, `\t` means tab, etc.

If a `\` is followed by any other character (except `x` and `u` -- explained below), like for example `\k`, that sequence is interpted as the `\` being an unnecessary escape, which is thus dropped, leaving just the literal character itself (`k`).

To include a `"` in the middle of a `"`-delimited string literal, use the `\"` escape sequence. Similarly, if you're including a `'` character in the middle of a `'`-delimited string literal, use the `\'` escape sequence. By contrast, a `'` does *not* need to be escaped inside a `"`-delimited string, nor vice versa.

```js
myTitle = "Kyle Simpson (aka, \"getify\"), former O'Reilly author";

console.log(myTitle);
// Kyle Simpson (aka, "getify"), former O'Reilly author
```

In text, forward slash `/` is most common. But occasionally, you need a backward slash `\`. To include a literal `\` backslash character without it performing as the start of a character-escape sequence, use the `\\` (double backslashes).

So, then... what would `\\\` (three backslashes) in a string parse as? The first two `\`'s would be a `\\` escape sequence, thereby inserting just a single `\` character in the string value, and the remaining `\` would just escape whatever character comes immediately after it.

One place backslashes show up commonly is in Windows file paths, which use the `\` separator instead of the `/` separator used in linux/unix style paths:

```js
windowsFontsPath =
    "C:\\Windows\\Fonts\\";

console.log(windowsFontsPath);
// C:\Windows\Fonts\"
```

| TIP: |
| :--- |
| What about four backslashes `\\\\` in a string literal? Well, that's just two `\\` escape sequences next to each other, so it results in two adjacent backslashes (`\\`) in the underlying string value. You might recognize there's an odd/even rule pattern at play. You should thus be able to deciper any odd (`\\\\\`, `\\\\\\\\\`, etc) or even (`\\\\\\`, `\\\\\\\\\\`, etc) number of backslashes in a string literal. |

#### Multi-Character Escapes

Multi-character escape sequences may be hexadecimal or Unicode sequences.

Hexidecimal escape sequences are used to encode any of the base ASCII characters (codes 0-255), and look like `\x` followed by exactly two hexadecimal characters (`0-9` and `a-f` / `A-F` -- case insensitive). For example, `A9` or `a9` are decimal value `169`, which corresponds to:

```js
copyright = "\xA9";  // or "\xa9"

console.log(copyright);     // ©
```

For any normal character that can be typed on a keyboard, such as `"a"`, it's usually most readable to just specify the literal character, as opposed to a more obfuscated hexadecimal representation:

```js
"a" === "\x61";             // true
```

##### Unicode

Unicode escape sequences encode any of the characters in the Unicode set whose code-point values range from 0-65535. They look like `\u` followed by exactly four hexadecimal characters. For example, the escape-sequence `\u00A9` (or `\u00a9`) corresponds to that same `©` symbol, while `\u263A` (or `\u263a`) corresponds to the Unicode character with code-point `9786`: `☺` (smiley face symbol).

When any character-escape sequence (regardless of length) is recognized, the single character it represents is inserted into the string, rather than the original separate characters. So, in the string `"\u263A"`, there's only one (smiley) character, not six individual characters.

Unicode code-points can go well above `65535` (`FFFF` in hexadecimal), up to a maximum of `1114111` (`10FFFF` in hexadecimal). For example, `1F4A9` (or `1f4a9`)is decimal code-point `128169`, which corresponds to the funny `💩` (pile of poo) symbol.

But `\u1F4A9` wouldn't work to include this character in a string, since it would be parsed as the Unicode escape sequence `\u1F4A`, followed by a literal `9` character. To address this limitation, a variation of Unicode escape sequences was introduced to allow an arbitrary number of hexadecimal characters after the `\u`, by surrounding them with `{ .. }` curly braces:

```js
myReaction = "\u{1F4A9}";

console.log(myReaction);
// 💩
```

Recall the earlier discussion of extended (non-BMP) Unicode characters and *surrogate halves*? The same `💩` could also be defined with the two explicit code-units:

```js
myReaction = "\uD83D\uDCA9";

console.log(myReaction);
// 💩
```

All three representations of this same character are stored internally by JS identically, and are indistinguishable:

```js
"💩" === "\u{1F4A9}";                // true
"\u{1F4A9}" === "\uD83D\uDCA9";     // true
```

Even though JS doesn't care which way such a character is represented in your program, consider the readability differences carefully when authoring your code.

#### Line Continuation

The `\` followed by an actual new-line character (not just literal `n`) is a special case, and it creates what's called a line-continuation:

```js
greeting = "Hello \
Friends!";

console.log(greeting);
// Hello Friends!
```

As you can see, the new-line at the end of the `greeting = ` line is immediately preceded by a `\`, which allows this string literal to continue onto the subsequent line. Without the escaping `\` before it, a new-line -- the actual new-line, not the `\n` character escape sequence -- appearing in a `"` or `'` delimited string literal would actually produce a JS syntax parsing error.

Because the end-of-line `\` turns the new-line character into a line continuation, the new-line character is omitted from the string, as shown by the `console.log(..)` output.

| NOTE: |
| :--- |
| This line-continuation feature is often referred to as "multi-line strings", but I think that's a confusing label. As you can see, the string value itself doesn't have multiple lines, it only was defined across multiple lines via the line continuations. A multi-line string would actually have multiple lines in the underlying value. |

#### Template Literals

I mentioned earlier that strings can alternately be delimited with `` `..` `` back-ticks:

```js
myName = `Kyle`;
```

All the same rules for character encodings, character escape sequences, and lengths apply to these types of strings.

However, the contents of these template (string) literals are additionally parsed for a special delimiter sequence `${ .. }`, which marks an expression to evaluate and interpolate into the string value at that location:

```js
myName = `Kyle`;

greeting = `Hello, ${myName}!`;

console.log(greeting);      // Hello, Kyle!
```

Everything between the `{ .. }` in such a template literal is an arbitrary JS expression. It can be simple variables, or complex JS programs, or anything in between.

| TIP: |
| :--- |
| This feature is commonly called "template literals" or "template strings", but I think that's confusing. "Template" is usually referred to in programming contexts as a reusable definition that can be re-evaluated with different data. For example, *template engines* for pages, email templates for newsletter campaigns, etc. This JS feature is not re-usable. It's a literal, and it produces a single, immediate value (usually a string). You can put such a value in a function, and call the function multiple times. But then the function is acting as the template, not the the literal itself. I prefer instead to refer to this feature as *interpolated literals*, or the funny, shortened *interpoliterals*, as I think this name is more accurately descriptive. |

Template literals usually result in a string value, but not always. A form of template literal that may look kind of strange is called a *tagged template literal*:

```js
price = formatCurrency`The cost is: ${totalCost}`;
```

Here, `formatCurrency` is a tag applied to the template literal value, which actually invokes `formatCurrency(..)` as a function, passing it the string literals and interpolated expressions parsed from the value. This function can then assemble those in any way it sees fit -- such as formatting a `number` value as currency in the current locale -- and return whatever value, string or otherwise, that it wants. So tagged template literals are not always strings. But untagged template literals will always be strings.

Some JS developers believe that untagged template literal strings are preferable to use for *all* strings, even if not doing any expression interpolation. I disagree. I think it should only be used when interpolating, and classic `".."` or `'..'` delimited strings should be used for non-interpolated string definitions.

Moreover, there are a few places where `` `..` `` style strings are disallowed. For example, the `"use strict"` pragma cannot use back-ticks, or the pragma will be silently ignored (and thus the program accidentally runs in non-strict mode). Also, this style of strings cannot be used in quoted property names of object literals, or in the ES Module `import .. from ..` module-specifier clause.

My advice: use `` `..` `` delimited strings where allowed, but only when interpolation is needed, and keep using `".."` or `'..'` delimited strings for all other strings.

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

#### Double Zeros

It may surprise you to learn that JS has two zeros: `0`, and `-0` (negative zero). But what on earth is a "negative zero"? A mathematician would surely balk at such a notion.

This isn't just a funny JS quirk; it's mandated by the IEEE-754[^IEEE754] specification. All floating point numbers are signed, including zero. And though JS does kind of hide the existence of `-0`, it's entirely possible to produce it and to detect it:

```js
function isNegZero(v) {
    return v == 0 && (1 / v) == -Infinity;
}

regZero = 0 / 1;
negZero = 0 / -1;

regZero === negZero;        // true -- oops!
Object.is(-0,regZero);      // false -- phew!
Object.is(-0,negZero);      // true

isNegZero(regZero);         // false
isNegZero(negZero);         // true
```

You may wonder why we'd ever need such a thing as `-0`. It can be useful when using numbers to represent both the magnitude of movement (speed) of some item (like a game character or an animation) and also its direction (e.g., negative = left, positive = right).

Without having a signed zero value, you couldn't tell which direction such an item was pointing at the moment it came to rest.

#### Invalid Number

Mathematical operations can sometimes produce an invalid result. For example, if you try to divide a number by a string (`42 / "Kyle"`), that's an invalid mathematical operation.

Another type of invalid numeric operation is trying to convert/coerce a non-numeric type of value to a `number`. We can do so with either the `Number(..)` function (no `new` keyword) or with the unary `+` operator in front of the value:

```js
myAge = Number("just a number");

myAge;                  // NaN

+undefined;             // NaN
```

All such invalid operations (mathematical or numeric) produce the special `number` value called `NaN`.

The historical root of "NaN" (including from the IEEE-754[^IEEE754] specification) is as an acronym for "Not a Number". Unfortunately, that meaning produces confusion, since `NaN` is *absolutely* a `number`.

| TIP: |
| :--- |
| Why is `NaN` a `number`?!? Think of the opposite: what if a mathematical/numeric operation, like `+` or `/`, produced a non-`number` value (like `null`, `undefined`, etc)? Wouldn't that be really strange and unexpected? What if they threw exceptions, so that you had to `try..catch` all your math? The only sensible behavior is, numeric/mathematical operations should *always* produce a `number`, even if that value is invalid because it came from an invalid operation. |

To avoid such confusion, I strongly prefer to define "NaN" as any of the following instead:

* "iNvalid Number"
* "Not actual Number"
* "Not available Number"
* "Not applicable Number"

`NaN` is a special value in JS, in that it's the only value in the language that lacks the *identity property* -- it's never equal to itself.

```js
NaN === NaN;            // false
```

So unfortunately, the `===` operator cannot check a value to see if it's `NaN`. But there are some ways to do so:

```js
politicianIQ = "nothing" / Infinity;

Number.isNaN(politicianIQ);         // true

Object.is(NaN,politicianIQ);        // true
[ NaN ].includes(politicianIQ);     // true
```

Here's a fact of virtually all JS programs, whether you realize it or not: `NaN` happens. Seriously, almost all programs that do any math or numeric conversions are subject to `NaN` showing up.

If you're not properly checking for `NaN` in your programs where you do math or numeric conversions, I can say with some degree of certainty: you probably have a number bug in your program somewhere, and it just hasn't bitten you yet (that you know of!).

| WARNING: |
| :--- |
| JS originally provided a global function called `isNaN(..)` for `NaN` checking, but it unfortunately has a long-standing coercion bug. `isNaN("Kyle")` returns `true`, even though the string value `"Kyle"` is most definitely *not* the `NaN` value. This is because the global `isNaN(..)` function forces any non-`number` argument to coerce to a `number` first, before checking for `NaN`. Coercing `"Kyle"` to a `number` produces `NaN`, so now the function sees a `NaN` and returns `true`! This buggy global `isNaN(..)` still exists in JS, but should never be used. When `NaN` checking, always use `Number.isNaN(..)`, `Object.is(..)`, etc. |

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

[^UTFUCS]: "JavaScript’s internal character encoding: UCS-2 or UTF-16?"; Mathias Bynens; January 20 2012; https://mathiasbynens.be/notes/javascript-encoding ; Accessed July 2022

[^IEEE754]: "IEEE-754"; https://en.wikipedia.org/wiki/IEEE_754 ; Accessed July 2022
