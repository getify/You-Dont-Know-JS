# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 2: Value Behaviors

| NOTE: |
| :--- |
| Work in progress |

So far, we've explored seven built-in primitive value types in JS: `null`, `undefined`, `boolean`, `string`, `number`, `bigint`, and `symbol`.

Chapter 1 was quite a lot to take in, much more involved than I bet most readers expected. If you're still catching your breath after reading all that, don't worry about taking a bit of a break before continuing on here!

Once you're clear headed and ready to move on, let's dig into certain behaviors implied by value types for all their respective values. We'll take a careful and  closer look at all of these various behaviors.

## Primitive Immutability

All primitive values are immutable, meaning nothing in a JS program can reach into the contents of the value and modify it in any way.

```js
myAge = 42;

// later:

myAge = 43;
```

The `myAge = 43` statement doesn't change the value. It reassigns a different value `43` to `myAge`, completely replacing the previous value of `42`.

New values are also created through various operations, but again these do not modify the original value:

```js
42 + 1;             // 43

"Hello" + "!";      // "Hello!"
```

The values `43` and `"Hello!"` are new, distinct values from the previous `42` and `"Hello"` values, respectively.

Even a string value, which looks like merely an array of characters -- and array contents are typically mutable -- is immutable:

```js
greeting = "Hello.";

greeting[5] = "!";

console.log(greeting);      // Hello.
```

| WARNING: |
| :--- |
| In non-strict mode, assigning to a read-only property (like `greeting[5] = ..`) silently fails. In strict-mode, the disallowed assignment will throw an exception. |

The nature of primitive values being immutable is not affected *in any way* by how the variable or object property holding the value is declared. For example, whether `const`, `let`, or `var` are used to declare the `greeting` variable above, the string value it holds is immutable.

`const` doesn't create immutable values, it declares variables that cannot be reassigned (aka, immutable assignments) -- see the "Scope & Closures" title of this series for more information.

A property on an object may be marked as read-only -- with the `writable: false` descriptor attribute, as discussed in the "Objects & Classes" title of this series. But that still has no affect on the nature of the value, only on preventing the reassignment of the property.

### Primitives With Properties?

Additionally, properties *cannot* be added to any primitive values:

```js
greeting = "Hello.";

greeting.isRendered = true;

greeting.isRendered;        // undefined
```

This snippet looks like it's adding a property `isRendered` to the value in `greeting`, but this assignment silently fails (even in strict-mode).

Property access is not allowed in any way on nullish primitive values `null` and `undefined`. But properties *can* be accessed on all other primitive values -- yes, that sounds counter-intuitive.

For example, all string values have a read-only `length` property:

```js
greeting = "Hello.";

greeting.length;            // 6
```

`length` can not be set, but it can be accesses, and it exposes the number of code-units stored in the value (see "JS Character Encodings" in Chapter 1), which often means the number of characters in the string.

| NOTE: |
| :--- |
| Sort of. For most standard characters, that's true; one character is one code-point, which is one code-unit. However, as explained in Chapter 1, extended Unicode characters above code-point `65535` will be stored as two code-units (surrogate halves). Thus, for each such character, `length` will include `2` in its count, even though the character visually prints as one symbol. |

Non-nullish primitive values also have a couple of standard built-in methods that can be accessed:

```js
greeting = "Hello.";

greeting.toString();    // "Hello." <-- redundant
greeting.valueOf();     // "Hello."
```

Additionally, most of the primitive value-types define their own methods with specific behaviors inherent to that type. We'll cover these later in this chapter.

| NOTE: |
| :--- |
| Technically, these sorts of property/method accesses on primitive values are facilitated by an implicit coercive behavior called *auto-boxing*, which we'll cover in the next chapter. |

## Primitive Assignments

Any assignment of a primitive value from one variable/container to another is a *value-copy*:

```js
myAge = 42;

yourAge = myAge;        // assigned by value-copy

myAge;                  // 42
yourAge;                // 42
```

Here, the `myAge` and `yourAge` variables each have their own copy of the number value `42`.

| NOTE: |
| :--- |
| Inside the JS engine, it *may* be the case that only one `42` value exists in memory, and the engine points both `myAge` and `yourAge` variables at the shared value. Since primitive values are immutable, there's no danger in a JS engine doing so. But what's important to us as JS developers is, in our programs, `myAge` and `yourAge` act as if they have their own copy of that value, rather than sharing it. |

If we later reassign `myAge` to `43` (when I have a birthday), it doesn't affect the `42` that's still assigned to `yourAge`:

```js
myAge++;            // sort of like: myAge = myAge + 1

myAge;              // 43
yourAge;            // 42 <-- unchanged
```

## String Behaviors

String values have a number of specific behaviors that every JS developer should be aware of.

### String Character Access

Though strings are not actually arrays, JS allows `[ .. ]` array-style access of a character at a numeric (`0`-based) index:

```js
greeting = "Hello!";

greeting[4];            // "o"
```

If the value/expression between the `[ .. ]` doesn't resolve to a number, the value will be implicitly coerced to its whole/integer numeric representation (if possible).

```js
greeting["4"];          // "o"
```

If the value/expression resolves to a number outside the integer range of `0` - `length - 1` (or `NaN`), or if it's not a `number` value-type, the access will instead be treated as a property access with the string equivalent property name. If the property access thus fails, the result is `undefined`.

| NOTE: |
| :--- |
|  We'll cover coercion in-depth later in the book. |

### Character Iteration

Strings are not arrays, but they certainly mimick arrays closely in many ways. One such behavior is that, like arrays, strings are iterables. This means that the characters (code-units) of a string can be iterated individually:

```js
myName = "Kyle";

for (let char of myName) {
    console.log(char);
}
// K
// y
// l
// e

chars = [ ...myName ];
chars;
// [ "K", "y", "l", "e" ]
```

Values, such as strings and arrays, are iterables (via `...`, `for..of`, and `Array.from(..)`), if they expose an iterator-producing method at the special symbol property location `Symbol.iterator` (see "Well-Known Symbols" in Chapter 1):

```js
myName = "Kyle";
it = myName[Symbol.iterator]();

it.next();      // { value: "K", done: false }
it.next();      // { value: "y", done: false }
it.next();      // { value: "l", done: false }
it.next();      // { value: "e", done: false }
it.next();      // { value: undefined, done: true }
```

| NOTE: |
| :--- |
| The specifics of the iterator protocol, including the fact that the `{ value: "e" .. }` result still shows `done: false`, are covered in detail in the "Sync & Async" title of this series. |

### Length Computation

As mentioned in Chapter 1, string values have a `length` property that automatically exposes the length of the string; this property can only be accessed; attempts to set it are silently ignored.

The reported `length` value somewhat corresponds to the number of characters in the string (actually, code-units), but as we saw in Chapter 1, it's more complex when Unicode characters are involved.

Most people visually distinguish symbols as separate characters; this notion of an independent visual symbol is referred to as a *grapheme*, or a *grapheme cluster*. So when counting the "length" of a string, we typically mean that we're counting the number of graphemes.

But that's not how the computer deals with characters.

In JS, each *character* is a code-unit (16 bits), with a code-point value at or below `65535`. The `length` property of a string always counts the number of code-units in the string value, not code-points. A code-unit might represent a single character by itself, or it may be part of a surrogate pair, or it may be combined with an adjacent *combining* symbol, or part of a grapheme cluster. As such, `length` doesn't match the typical notion of counting visual characters/graphemes.

To get closer to an expected/intuitive *grapheme length* for a string, the string value first needs to be normalized with `normalize("NFC")` (see "Normalizing Unicode" in Chapter 1) to produce any *composed* code-units (where possible), in case any characters were originally stored *decomposed* as separate code-units.

For example:

```js
favoriteItem = "teléfono";
favoriteItem.length;            // 9 -- uh oh!

favoriteItem = favoriteItem.normalize("NFC");
favoriteItem.length;            // 8 -- phew!
```

Unfortunately, as we saw in Chapter 1, we'll still have the possibility of characters of code-point greater the `65535`, and thus needing a surrogate pair to be represented. Such characters will count double in the `length`:

```js
// "☎" === "\u260E"
oldTelephone = "☎";
oldTelephone.length;            // 1

// "📱" === "\u{1F4F1}" === "\uD83D\uDCF1"
cellphone = "📱";
cellphone.length;               // 2 -- oops!
```

So what do we do?

One fix is to use character iteration (via `...` operator) as we saw in the previous section, since it automatically returns each combined character from a surrogate pair:

```js
cellphone = "📱";
cellphone.length;               // 2 -- oops!
[ ...cellphone ].length;        // 1 -- phew!
```

But, unfortunately, grapheme clusters (as explained in Chapter 1) throw yet another wrench into a string's length computation. For example, if we take the thumbs down emoji (`"\u{1F44E}"` and add to it the skin-tone modifier for medium-dark skin (`"\u{1F3FE}"`), we get:

```js
// "👎🏾" = "\u{1F44E}\u{1F3FE}"
thumbsDown = "👎🏾";

thumbsDown.length;              // 4 -- oops!
[ ...thumbsDown ].length;       // 2 -- oops!
```

As you can see, these are two distinct code-points (not a surrogate pair) that, by virtue of their ordering and adjacency, cause the computer's Unicode rendering to draw the thumbs-down symbol but with a darker skin tone than its default. The computed string length is thus `2`.

It would take replicating most of a platform's complex Unicode rendering logic to be able to recognize such clusters of code-points as a single "character" for length-counting sake. There are libraries that purport to do so, but they're not necessarily perfect, and they come at a hefty cost in terms of extra code.

| NOTE: |
| :--- |
| As a Twitter user, you might expect to be able to put 280 thumbs-down emoji into a single tweet, since it looks like a single character. Twitter counts the `"👎"` (default thumbs-down), the `"👎🏾"` (medium-dark-skintone thumbs-down), and even the `"👩‍👩‍👦‍👦"` (family emoji grapheme cluster) all as 2 characters each, even though their respective string lengths (from JS's perspective) are `2`, `4`, and `7`; thus, you can only fit half the number of emojis (140 instead of 280) in a tweet. In fact, Twitter implemented this change in 2018 to specifically level the counting of all Unicode characters, at 2 characters per symbol. [^TwitterUnicode] That was a welcomed change for Twitter users, especially those who want to use emoji characters that are most representative of intended gender, skintone, etc. Still, it *is* curious that the choice was made to count the symbols as 2 characters each, instead of the more intuitive 1 character each. |

Counting the *length* of a string to match our human intuitions is a remarkably challenging task, perhaps more of an art than a science. We can get acceptable approximations in many cases, but there's plenty of other cases that may confound our programs.

### Locale Ordering

Depending on the language/locale in effect for the JS program, the contents of a string may be interpreted as being ordered from left-to-right (LTR) or right-to-left (RTL). As such, many of the string methods we'll cover later use logical descriptors in their names, like "start", "end", "begin", "end", and "last", rather than terms like "left" and "right".

// TODO: index positions in [..] vs methods, `Intl` API, etc

### String Comparison

String values can be compared (for both equality and relational ordering) to other string values, using various built-in operators. It's important to keep in mind that such comparisons are sensitive to the actual string contents, including especially the underlying code-points from non-BPM Unicode characters.

// TODO

### String Concatenation

Two or more string values can be concatenated (combined) into a new string value, using the `+` operator:

```js
greeting = "Hello, " + "Kyle!";

greeting;               // Hello, Kyle!
```

The `+` operator will act as a string concatenation if either of the two operands (values on left or right sides of the operator) are already a string (even an empty string `""`).

If one operand is a string and the other is not, the one that's not a string will be coerced to its string representation for the purposes of the concatenation:

```js
userCount = 7;

status = "There are " + userCount + " users online";

status;         // There are 7 users online
```

String concatenation of this sort is essentially interpolation of data into the string, which is the main purpose of template literals (see Chapter 1). So the following code will have the same outcome but is generally considered to be the more preferred approach:

```js
userCount = 7;

status = `There are ${userCount} users online`;

status;         // There are 7 users online
```

Other options for string concatenation include `"one".concat("two","three")` and `[ "one", "two", "three" ].join("")`, but these kinds of approaches are only preferable when the number of strings to concatenate is dependent on runtime conditions/computation. If the string has a fixed/known set of content, as above, template literals are the better option.

### String Value Methods

String values provide a whole slew of additional string-specific methods (as properties):

* `charAt(..)`: produces a new string value at the numeric index, similar to `[ .. ]`; unlike `[ .. ]`, the result is always a string, either the character at position `0` (if a valid number outside the indices range), or the empty string `""` (if missing/invalid index)

* `at(..)` is similar to `charAt(..)`, but negative indices count backwards from the end of the string

* `charCodeAt(..)`: returns the numeric code-unit (see "JS Character Encodings" in Chapter 1) at the specified index

* `codePointAt(..)`: returns the whole code-point starting at the specified index; if a surrogate pair is found there, the whole character (code-point) s returned

* `substr(..)` / `substring(..)` / `slice(..)`: produces a new string value that represents a range of characters from the original string; these differ in how the range's start/end indices are specified or determined

* `toUpperCase()`: produces a new string value that's all uppercase characters

* `toLowerCase()`: produces a new string value that's all lowercase characters

* `toLocaleUpperCase()` / `toLocaleLowerCase()`: uses locale mappings for uppercase or lowercase operations

* `concat(..)`: produces a new string value that's the concatenation of the original string and all of the string value arguments passed in

* `indexOf(..)`: searches for a string value argument in the original string, optionally starting from the position specified in the second argument; returns the `0`-based index position if found, or `-1` if not found

* `lastIndexOf(..)`: like `indexOf(..)` but, from the end of the string (right in LTR locales, left in RTL locales)

* `includes(..)`: similar to `indexOf(..)` but returns a boolean result

* `search(..)`: similar to `indexOf(..)` but with a regular-expression matching as specified

* `trimStart()` / `trimEnd()` / `trim()`: produces a new string value with whitespace trimmed from the start of the string (left in LTR locales, right in RTL locales), or the end of the string (right in LTR locales, left in RTL locales), or both

* `repeat(..)`: produces a new string with the original string value repeated the specified number of times

* `split(..)`: produces an array of string values as split at the specified string or regular-expression boundaries

* `padStart(..)` / `padEnd(..)`: produces a new string value with padding (default " " whitespace, but can be overriden) applied to either the start (left in LTR locales, right in RTL locales) or the end (right in LTR locales), left in RTL locales), so that the final string result is at least of a specified length

* `startsWith(..)` / `endsWith(..)`: checks either the start (left in LTR locales, right in RTL locales) or the end (right in LTR locales) of the original string for the string value argument; returns a boolean result

* `match(..)` / `matchAll(..)`: returns an array-like regular-expression matching result against the original string

* `replace(..)`: returns a new string with a replacement from the original string, of one or more matching occurrences of the specified regular-expression match

* `normalize(..)`: produces a new string with Unicode normalization (see "Unicode Normalization" in Chapter 1) having been performed on the contents

* `localCompare(..)`: function that compares two strings according to the current locale (useful for sorting); returns `-1` if the original string value is comes before the argument string value lexicographically, `1` if the original string value comes after the argument string value lexicographically, and `0` if the two strings are identical

* `anchor()`, `big()`, `blink()`, `bold()`, `fixed()`, `fontcolor()`, `fontsize()`, `italics()`, `link()`, `small()`, `strike()`, `sub()`, and `sup()`: historically, these were useful in generating HTML string snippets; they're now deprecated and should be avoided

| WARNING: |
| :--- |
| Many of the methods described above rely on position indices. As mentioned earlier in the "Length Computation" section, these positions are dependent on the internal contents of the string value, which means that if an extended Unicode character is present and takes up two code-unit slots, that will count as two index positions instead of one. Failing to account for *decomposed* code-units, surrogate pairs, and grapheme cluseters is a common source of bugs in JS string handling. |

These string methods can all be called directly on a literal value, or on a variable/property that's holding a string value. When applicable, they produce a new string value rather than modifying the existing string value (since strings are immutable):

```js
"all these letters".toUpperCase();      // ALL THESE LETTERS

greeting = "Hello!";
greeting.repeat(2);                     // Hello!Hello!
greeting;                               // Hello!
```

### Static `String` Helpers

The following string utility functions are proviced directly on the `String` object, rather than as methods on individual string values:

* `String.fromCharCode(..)` / `String.fromCodePoint(..)`: produce a string from one or more arguments representing the code-units (`fromCharCode(..)`) or whole code-points (`fromCodePoint(..)`)

* `String.raw(..)`: a default template-tag function that allows interpolation on a template literal but prevents character escape sequences from being parsed, so they remain in their *raw* individual input characters from the literal

Moreover, most values (especially primitives) can be explicitly coerced to their string equivalent by passing them to the `String(..)` function (no `new` keyword). For example:

```js
String(true);           // "true"
String(42);             // "42"
String(Infinity);       // "Infinity"
String(undefined);      // "undefined"
```

We'll cover much more detail about such type coercions in a later chapter.

## Number Behaviors

Numbers are used for a variety of tasks in our programs, usually for mathematical computations. Pay close attention to how JS numbers behave, to ensure the outcomes are as expected.

### Floating Point Imprecision

We need to revisit our discussion of IEEE-754 from Chapter 1.

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

The temptation to make fun of JS for `0.1 + 0.2 !== 0.3` is strong, I know. But here it's completely bogus.

| NOTE: |
| :--- |
| Pretty much all programmers need to be aware of IEEE-754 and make sure they are careful about these kinds of gotchas. It's somewhat amazing, in a disappointing way, how few of them have any idea how IEEE-754 works. If you've taken your time reading and understanding these concepts so far, you're now in that rare tiny percentage who actually put in the effort to understand the numbers in their programs! |

One way to work around such floating-point imprecision is this *very small* `number` value:

```js
Number.EPSILON;                 // 2.220446049250313e-16
```

*Epsilon* is defined as the smallest difference JS can represent between `1` and the next value greater than `1`. While this value is implementation/platform dependent, it's typically about `2.2E16`, or `2^-52`. This value is the maximum amount of floating-point representation error (as discussed earlier), so it represents the threshold above which two values are *actually* different rather just skewed by floating-point error.

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
| If your program needs to deal with smaller values than `2^-52`, or more specifically, smaller differences between values, you should absolutely *not use* the JS `number` value-type. There are decimal-emulation libraries that can offer arbitrary (small or large) precision. Or pick a different language than JS. |

### Numeric Comparison

Like strings, number values can be compared (for both equality and relational ordering) using the same operators.

Remember that no matter what form the number value took when being specified (base-10, octal, hexadecimal, exponential, etc), the underlying value is what will be compared. Also keep in mind the floating point imprecision issues discussed in the previous section, as the comparisons will be sensitive to the exact binary contents, even if the difference between two numbers is much smaller than the `Number.EPSILON` threshold.

// TODO

### Mathematical Operators

As I asserted earlier, the main reason to have numbers in a programming language is to perform mathematical operations with them. So let's talk about how we do so.

The basic arithmetic operators are `+` (addition), `-` (subtraction), `*` (multiplication), and `/` (division). Also available are the operators `**` (exponentiation) and `%` (modulo, aka *division remainder*).

| NOTE: |
| :--- |
| As we've already seen, the `+` operator is overloaded to work with both numbers and strings. When one or both operands is a string, the result is a string concatenation (including coercing either operand to a string if necessary). But if neither operand is a string, the result is a numeric addition, as expected. |

All these mathematical operators are *binary*, meaning they expect two value operands, one on either side of the operator; they all expect the operands to be number values. If either or both operands are non-numbers, the non-number operand(s) is/are coerced to numbers to perform the operation. We'll cover coercion in detail in a later chapter.

Consider:

```js
40 + 2;                 // 42
44 - 2;                 // 42
21 * 2;                 // 42
84 / 2;                 // 42
7 ** 2;                 // 49
49 % 2;                 // 1

40 + "2";               // "402" (string concatenation)
44 - "2";               // 42 (because "2" is coerced to 2)
21 * "2";               // 42 (..ditto..)
84 / "2";               // 42 (..ditto..)
"7" ** "2";             // 49 (both operands are coerced to numbers)
"49" % "2";             // 1 (..ditto..)
```

The `+` and `-` operators also come in a *unary* form, meaning they only have one operand; again, the operand is expected to be a number, and coerced to a number if not:

```js
+42;                    // 42
-42;                    // -42

+"42";                  // 42
-"42";                  // -42
```

You might have noticed that `-42` looks like it's just a "negative forty-two" numeric literal. That's not quite right. A nuance of JS syntax is that it doesn't recognize negative numeric literals. Instead, JS treats this as a positive numeric literal `42` that's preceded, and negated, by the unary `-` operator in front of it.

Somewhat surprisingly, then:

```js
-42;                    // -42
- 42;                   // -42
-
    42;                 // -42
```

As you can see, whitespace (and even new lines) are allowed between the `-` unary operator and its operand; actually, this is true of all operators and operands.

### Bitwise Operators

Since `number` values have a specific binary representation (IEEE-754), there are several bitwise operators to perform bit-level operations.

// TODO

### Number Value Methods

Number values provide the following methods (as properties) for number-specific operations:

* `toExponential(..)`: produces a string representation of the number using scientific notation (e.g., `"4.2e+1"`)

* `toFixed(..)`: produces a non-scientific-notation string representation of the number with the specified number of decimal places (rounding or zero-padding as necessary)

* `toPrecision(..)`: like `toFixed(..)`, except it applies the numeric argument as the number of significant digits (i.e., precision) including both the whole number and decimal places if any

* `toLocaleString(..)`: produces a string representation of the number according to the current locale

```js
myAge = 42;

myAge.toExponential(3);         // "4.200e+1"
```

One particular nuance of JS syntax is that `.` can be ambiguous when dealing with number literals and property/method access.

If a `.` comes immediately (no whitespace) after a numeric literal digit, and there's not already a `.` decimal in the number value, the `.` is assumed to be a starting the decimal portion of the number. But if the position of the `.` is unambiguously *not* part of the numeric literal, then it's always treated as a property access.

```js
42 .toExponential(3);           // "4.200e+1"
```

Here, the whitespace disambiguates the `.`, designating it as a property/method access. It's perhaps more common/preferred to use `(..)` instead of whitespace for such disambiguation:

```js
(42).toExponential(3);          // "4.200e+1"
```

An unusual-looking effect of this JS parsing grammar rule:

```js
42..toExponential(3);           // "4.200e+1"
```

So called the "double-dot" idiom, the first `.` in this expression is a decimal, and thus the second `.` is unambiguously *not* a decimal, but rather a property/method access.

Also, notice there's no digits after the first `.`; it's perfectly legal syntax to leave a trailing `.` on a numeric literal:

```js
myAge = 41. + 1.;

myAge;                          // 42
```

### Static `Number` Properties

* `Number.EPSILON`: The smallest value possible between `1` and the next highest number

* `Number.NaN`: The same as the global `NaN` symbol, the special invalid number

* `Number.MIN_SAFE_INTEGER` / `Number.MAX_SAFE_INTEGER`: The positive and negative integers with the largest absolute value (furthest from `0`)

* `Number.MIN_VALUE` / `Number.MAX_VALUE`: The minimum (positive value closest to `0`) and the maximum (positive value furthest from `0`) representable by the `number` type

* `Number.NEGATIVE_INFINITY` / `Number.POSITIVE_INFINITY`: Same as global `-Infinity` and `Infinity`, the values that represent the largest (non-finite) values furthest from `0`

### Static `Number` Helpers

* `Number.isFinite(..)`: returns a boolean indicating if the value is finite -- a `number` that's not `NaN`, nor one of the two infinities

* `Number.isInteger(..)` / `Number.isSafeInteger(..)`: both return booleans indicating if the value is a whole `number` with no decimal places, and if it's within the *safe* range for integers (`-2^53 + 1` - `2^53 - 1`)

* `Number.isNaN(..)`: The bug-fixed version of the global `isNaN(..)` utility, which identifies if the argument provided is the special `NaN` value

* `Number.parseFloat(..)` / `Number.parseInt(..)`: utilties to parse string values for numeric digits, left-to-right, until the end of the string or the first non-float (or non-integer) character is encountered

### Static `Math` Namespace

Since the main usage of `number` values is for performing mathematical operations, JS includes many standard mathematical constants and operation utilities on the `Math` namespace.

There's a bunch of these, so I'll omit listing every single one. But here's a few for illustration purposes:

```js
Math.PI;                        // 3.141592653589793

// absolute value
Math.abs(-32.6);                // 32.6

// rounding
Math.round(-32.6);              // -33

// min/max selection
Math.min(100,Math.max(0,42));   // 42
```

Unlike `Number`, which is also the `Number(..)` function (for number coercion), `Math` is just an object that holds these properties and static function utilities; it cannot be called as a function.

| WARNING: |
| :--- |
| One peculiar member of the `Math` namespace is `Math.random()`, for producing a random floating point value between `0` and `1.0`. It's unusual to consider random number generation -- a task that's inherently stateful/side-effect'ing -- as a mathematical operation. It's also long been a footgun security-wise, as the pseudo-random number generator (PRNG) that JS uses is *not* secure (can be predicted) from a cryptography perspective. The web platform stepped in several years ago with the safer `crypto.getRandomValues(..)` API (based on a better PRNG), which fills a typed-array with random bits that can be interpreted as one or more integers (of type-specified maximum magnitude). Using `Math.random()` is universally discouraged now. |

[^TwitterUnicode]: "New update to the Twitter-Text library: Emoji character count"; Andy Piper; Oct 2018; https://twittercommunity.com/t/new-update-to-the-twitter-text-library-emoji-character-count/114607 ; Accessed July 2022
