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

| WARNING: |
| :--- |
| As a Twitter user, you might expect to be able to put 280 thumbs-down emoji into a single tweet, since it looks like a single character. But Twitter counts each such emoji as two characters, so you only get 140. Surprisingly, twitter counts the `"👎"` (default thumbs-down), `"👎🏾"` (dark-skin tone thumbs-down), and even the `"👩‍👩‍👦‍👦"` (family emoji grapheme cluster) all as two characters each, even though their string lengths (from JS's perspective) are `2`, `4`, and `7`, respectively. Twitter must have some sort of custom Unicode handling implemented in the tools. |

It would take replicating most of a platform's complex Unicode rendering logic to be able to recognize such clusters of code-points as a single "character" for length-counting sake. There are libraries that purport to do so, but they're not necessarily perfect, and they come at a hefty cost in terms of extra code.

Counting the "length" of a string to match our human intuitions is a remarkably challenging task. We can get acceptable approximations in many cases, but there's plenty of other cases that confound our programs.

### String Concatenation

Two or more string values can be concatenated (combined) into a new string value, using the `+` operator:

```js
greeting = "Hello, " + "Kyle!";

greeting;               // Hello, Kyle!
```

The `+` operator will act as a string concatenation if either of the two operands (values on left or right sides of the operator) are already a string.

If one operand is a string and the other is not, the one that's not a string will be coerced to its string representation for the purposes of the concatenation.

### String Methods

Strings provide a whole slew of additional string-specific methods (as properties):

* `charAt(..)`: produces a new string value at the numeric index, similar to `[ .. ]`; unlike `[ .. ]`, the result is always a string, either the character at position `0` (if a valid number outside the indices range), or the empty string `""` (if missing/invalid index)

* `at(..)` is similar to `charAt(..)`, but negative indices count backwards from the end of the string

* `charCodeAt(..)`: returns the numeric code-unit (see "JS Character Encodings" in Chapter 1) at the specified index

* `codePointAt(..)`: returns the whole code-point starting at the specified index; if a surrogate pair is found there, the whole character (code-point) s returned

* `substr(..)` / `substring(..)` / `slice(..)`: produces a new string value that represents a range of characters from the original string; these differ in how the range's start/end indices are specified or determined

* `toUpperCase()`: produces a new string value that's all uppercase characters

* `toLowerCase()`: produces a new string value that's all lowercase characters

* `concat(..)`: produces a new string value that's the concatenation of the original string and all of the string value arguments passed in

* `indexOf(..)`: searches for a string value argument in the original string, optionally starting from the position specified in the second argument; returns the `0`-based index position if found, or `-1` if not found

* `lastIndexOf(..)`: like `indexOf(..)` but, from the end of the string (right in LTR locales, left in RTL locales)

* `includes(..)`: similar to `indexOf(..)` but returns a boolean result

* `search(..)`: similar to `indexOf(..)` but with a regular-expression matching as specified

* `trimStart()` / `trimEnd()` / `trim()`: produces a new string value with whitespace trimmed from the start of the string (left in LTR locales, right in RTL locales), or the end of the string (right in LTR locales, left in RTL locales), or both

* `repeat(..)`: produces a new string with the string argument value repeated the specified number of times

* `split(..)`: produces an array of string values as split at the specified string or regular-expression boundaries

* `padStart(..)` / `padEnd(..)`: produces a new string value with padding (default " " whitespace, but can be overriden) applied to either the start (left in LTR locales, right in RTL locales) or the end (right in LTR locales), left in RTL locales), so that the final string result is at least of a specified length

* `startsWith(..)` / `endsWith(..)`: checks either the start (left in LTR locales, right in RTL locales) or the end (right in LTR locales) of the original string for the string value argument; returns a boolean result

* `match(..)` / `matchAll(..)`: returns an array-like regular-expression matching result against the original string

* `replace(..)`: returns a new string with a replacement from the original string, of one or more matching occurrences of the specified regular-expression match

* `normalize(..)`: produces a new string with Unicode normalization (see "Unicode Normalization" in Chapter 1) having been performed on the contents

* `big()`, `blink()`, `bold()`, `fixed()`, `fontcolor()`, `fontsize()`, `italics()`, `link()`, `small()`, `strike()`, `sub()`, and `sup()`: historically, these were useful in generating HTML string snippets; they're now deprecated and should be avoided

| WARNING: |
| :--- |
| Many of the methods described above rely on position indices. As mentioned earlier in the "Length Computations" section, these positions are dependent on the internal contents of the string value, which means that if an extended Unicode character is present and takes up two code-unit slots, that will count as two index positions instead of one. Failing to account for Unicode surrogate pairs is a common source of bugs in JS string handling, especially when dealing with non-English internationalized language characters. |

### Static String Helpers

The following string utility functions are proviced directly on the `String` object, rather than as methods on individual string values:

* `String.fromCharCode(..)` / `String.fromCodePoint(..)`: produce a string from one or more arguments representing the code-units (`fromCharCode(..)`) or whole code-points (`fromCodePoint(..)`)

* `String.raw(..)`: a default template-tag function that allows interpolation on a template literal but prevents character escape sequences from being parsed, so they remain in their *raw* individual input characters from the literal

## Number Behaviors

// TODO
