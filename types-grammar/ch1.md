# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 1: Primitive Values

| NOTE: |
| :--- |
| Work in progress |

In Chapter 1 of the "Objects & Classes" book of this series, we confronted the common misconception that "everything in JS is an object". We now circle back to that topic, and again dispel that myth.

Here, we'll look at the core value types of JS, specifically the non-object types called *primitives*.

## Value Types

JS doesn't apply types to variables or properties -- what I call, "container types" -- but rather, values themselves have types -- what I call, "value types".

The language provides seven built-in, primitive (non-object) value types: [^PrimitiveValues]

* `undefined`
* `null`
* `boolean`
* `number`
* `bigint`
* `symbol`
* `string`

These value-types define collections of one or more concrete values, each with a set of shared behaviors for all values of each type.

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

### Non-objects?

What specifically makes the 7 primitive value types distinct from the object value types (and sub-types)? Why shouldn't we just consider them all as essentially *objects* under the covers?

Consider:

```js
myName = "Kyle";

myName.nickname = "getify";

console.log(myName.nickname);           // undefined
```

This snippet appears to silently fail to add a `nickname` property to a primitive string. Taken at face value, that might imply that primitives are really just objects under the covers, as many have (wrongly) asserted over the years.

| WARNING: |
| :--- |
| One might explain that silent failure as an example of *auto-boxing* (see "Automatic Objects" in Chapter 3), where the primitive is implicitly converted to a `String` instance wrapper object while attempting to assign the property, and then this internal object is thrown away after the statement completes. In fact, I said exactly that in the first edition of this book. But I was wrong; oops! |

Something deeper is at play, as we see in this version of the previous snippet:

```js
"use strict";

myName = "Kyle";

myName.nickname = "getify";
// TypeError: Cannot create property 'nickname'
// on string 'Kyle'
```

Interesting! In strict-mode, JS enforces a restriction that disallows setting a new property on a primitive value, as if implicitly promoting it to a new object.

By contrast, in non-strict mode, JS allows the violation to go unmentioned. So why? Because strict-mode was added to the language in ES5.1 (2011), more than 15 years in, and such a change would have broken existing programs had it not been defined as sensitive to the new strict-mode declaration.

So what can we conclude about the distinction between primitives and objects? Primitives are values that *are not allowed to have properties*; only objects are allowed such.

| TIP: |
| :--- |
| This particular distinction seems to be contradicted by expressions like `"hello".length`; even in strict-mode, it returns the expected value `5`. So it certainly *seems* like the string has a `length` property! But, as just previously mentioned, the correct explanation is *auto-boxing*; we'll cover the topic in "Automatic Objects" in Chapter 3. |

## Empty Values

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

### Null'ish

Semantically, `null` and `undefined` types both represent general emptiness, or absence of another affirmative, meaningful value.

| NOTE: |
| :--- |
| JS operations which behave the same whether `null` or `undefined` is encountered, are referred to as "null'ish" (or "nullish"). I guess "undefined'ish" would look/sound too weird! |

For a lot of JS, especially the code developers write, these two *nullish* values are interchangeable; the decision to intentionally use/assign `null` or `undefined` in any given scenario is situation dependent and left up to the developer.

JS provides a number of capabilities for helping treat the two nullish values as indistinguishable.

For example, the `==` (coercive-equality comparison) operator specifically treats `null` and `undefined` as coercively equal to each other, but to no other values in the language. As such, a `.. == null` check is safe to perform if you want to check if a value is specifically either `null` or `undefined`:

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

### Distinct'ish

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

## Boolean Values

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

## String Values

The `string` type contains any value which is a collection of one or more characters, delimited (surrounding on either side) by quote characters:

```js
myName = "Kyle";
```

JS does not distinguish a single character as a different type as some languages do; `"a"` is a string just like `"abc"` is.

Strings can be delimited by double-quotes (`"`), single-quotes (`'`), or back-ticks (`` ` ``). The ending delimiter must always match the starting delimiter.

Strings have an intrinsic length which corresponds to how many code-points -- actually, code-units, more on that in a bit -- they contain.

```js
myName = "Kyle";

myName.length;      // 4
```

This does not necessarily correspond to the number of visible characters present between the start and end delimiters (aka, the string literal). It can sometimes be a little confusing to keep straight the difference between a string literal and the underlying string value, so pay close attention.

| NOTE: |
| :--- |
| We'll cover length computation of strings in detail, in Chapter 2. |

### JS Character Encodings

What type of character encoding does JS use for string characters?

You've probably heard of "Unicode" and perhaps even "UTF-8" (8-bit) or "UTF-16" (16-bit). If you're like me (before doing the research it took to write this text), you might have just hand-waved and decided that's all you need to know about character encodings in JS strings.

But... it's not. Not even close.

It turns out, you need to understand how a variety of aspects of Unicode work, and even to consider concepts from UCS-2 (2-byte Universal Character Set), which is similar to UTF-16, but not quite the same. [^UTFUCS]

Unicode defines all the "characters" we can represent universally in computer programs, by assigning a specific number to each, called code-points. These numbers range from `0` all the way up to a maximum of `1114111` (`10FFFF` in hexadecimal).

The standard notation for Unicode characters is `U+` followed by 4-6 hexadecimal characters. For example, the `❤` (heart symbol) is code-point `10084` (`2764` in hexadecimal), and is thus notated with `U+2764`.

The first group of 65,535 code points in Unicode is called the BMP (Basic Multilingual Plane). These can all be represented with 16 bits (2 bytes). When representing Unicode characters from the BMP, it's fairly straightforward, as they can *fit* neatly into single UTF-16 JS characters.

All the rest of the code points are grouped into 16 so called "supplemental planes" or "astral planes". These code-points require more than 16 bits to represent -- 21 bits to be exact -- so when representing extended/supplemental characters above the BMP, JS actually stores these code-points as a pairing of two adjacent 16-bit code units, called *surrogate halves* (or *surrogate pairs*).

For example, the Unicode code point `127878` (hexadecimal `1F386`) is `🎆` (fireworks symbol). JS stores this in a string value as two surrogate-halve code units: `U+D83C` and `U+DF86`. Keep in mind that these two parts of the whole character do *not* standalone; they're only valid/meaningful when paired immediately adjacent to each other.

This has implications on the length of strings, because a single visible character like the `🎆` fireworks symbol, when in a JS string, is a counted as 2 characters for the purposes of the string length!

We'll revisit Unicode characters in a bit, and then cover the challenges of computing string length in Chapter 2.

### Escape Sequences

If `"` or `'` are used to delimit a string literal, the contents are only parsed for *character-escape sequences*: `\` followed by one or more characters that JS recognizes and parses with special meaning. Any other characters in a string that don't parse as escape-sequences (single-character or multi-character), are inserted as-is into the string value.

For single-character escape sequences, the following characters are recognized after a `\`: `b`, `f`, `n`, `r`, `t`, `v`, `0`, `'`, `"`, and `\`. For example,  `\n` means new-line, `\t` means tab, etc.

If a `\` is followed by any other character (except `x` and `u` -- explained below), like for example `\k`, that sequence is interpreted as the `\` being an unnecessary escape, which is thus dropped, leaving just the literal character itself (`k`).

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

#### Line Continuation

The `\` character followed by an actual new-line character (not just literal `n`) is a special case, and it creates what's called a line-continuation:

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
| This line-continuation feature is often referred to as "multi-line strings", but I think that's a confusing label. As you can see, the string value itself doesn't have multiple lines, it only was defined across multiple lines via the line continuations. A multi-line string would actually have multiple lines in the underlying value. We'll revisit this topic later in this chapter when we cover Template Literals. |

### Multi-Character Escapes

Multi-character escape sequences may be hexadecimal or Unicode sequences.

Hexadecimal escape sequences are used to encode any of the base ASCII characters (codes 0-255), and look like `\x` followed by exactly two hexadecimal characters (`0-9` and `a-f` / `A-F` -- case insensitive). For example, `A9` or `a9` are decimal value `169`, which corresponds to:

```js
copyright = "\xA9";  // or "\xa9"

console.log(copyright);     // ©
```

For any normal character that can be typed on a keyboard, such as `"a"`, it's usually most readable to just specify the literal character, as opposed to a more obfuscated hexadecimal representation:

```js
"a" === "\x61";             // true
```

#### Unicode In Strings

Unicode escape sequences alone can encode any of the characters from the Unicode BMP. They look like `\u` followed by exactly four hexadecimal characters.

For example, the escape-sequence `\u00A9` (or `\u00a9`) corresponds to that same `©` symbol, while `\u263A` (or `\u263a`) corresponds to the Unicode character with code-point `9786`: `☺` (smiley face symbol).

When any character-escape sequence (regardless of length) is recognized, the single character it represents is inserted into the string, rather than the original separate characters. So, in the string `"\u263A"`, there's only one (smiley) character, not six individual characters.

But as explained earlier, many Unicode code-points are well above `65535`. For example, `1F4A9` (or `1f4a9`) is decimal code-point `128169`, which corresponds to the funny `💩` (pile-of-poo) symbol.

But `\u1F4A9` wouldn't work to include this character in a string, since it would be parsed as the Unicode escape sequence `\u1F4A`, followed by a literal `9` character. To address this limitation, a variation of Unicode escape sequences was introduced to allow an arbitrary number of hexadecimal characters after the `\u`, by surrounding them with `{ .. }` curly braces:

```js
myReaction = "\u{1F4A9}";

console.log(myReaction);
// 💩
```

Recall the earlier discussion of extended (non-BMP) Unicode characters and *surrogate halves*? The same `💩` could also be defined with two explicit code-units, that form a surrogate pair:

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

| NOTE: |
| :--- |
| Even though `💩` looks like a single character, its internal representation affects things like the length computation of a string with that character in it. We'll cover length computation of strings in Chapter 2. |

##### Unicode Normalization

Another wrinkle in Unicode string handling is that even certain single BMP characters can be represented in different ways.

For example, the `"é"` character can either be represented as itself (code-point `233`, aka `\xe9` or `\u00e9` or `\u{e9}`), or as the combination of two code-points: the `"e"` character (code-point `101`, aka `\x65`, `\u0065`, `\u{65}`) and the *combining tilde* (code-point `769`, aka `\u0301`, `\u{301}`).

Consider:

```js
eTilde1 = "é";
eTilde2 = "\u00e9";
eTilde3 = "\u0065\u0301";

console.log(eTilde1);       // é
console.log(eTilde2);       // é
console.log(eTilde3);       // é
```

The string literal assigned to `eTilde3` in this snippet stores the accent mark as a separate *combining mark* symbol. Like surrogate pairs, a combining mark only makes sense in connection with the symbol it's adjacent to (usually after).

The rendering of the Unicode symbol should be the same regardless, but how the `"é"` character is internally stored affects things like `length` computation of the containing string, as well as equality and relational comparison (more on these in Chapter 2):

```js
eTilde1.length;             // 2
eTilde2.length;             // 1
eTilde3.length;             // 2

eTilde1 === eTilde2;        // false
eTilde1 === eTilde3;        // true
```

One particular challenge is that you may copy-paste a string with an `"é"` character visible in it, and that character you copied may have been in the *composed* or *decomposed* form. But there's no visual way to tell, and yet the underlying string value in the literal will be different:

```js
"é" === "é";           // false!!
```

This internal representation difference can be quite challenging if not carefully planned for. Fortunately, JS provides a `normalize(..)` utility method on strings to help:

```js
eTilde1 = "é";
eTilde2 = "\u{e9}";
eTilde3 = "\u{65}\u{301}";

eTilde1.normalize("NFC") === eTilde2;
eTilde2.normalize("NFD") === eTilde3;
```

The `"NFC"` normalization mode combines adjacent code-points into the *composed* code-point (if possible), whereas the `"NFD"` normalization mode splits a single code-point into its *decomposed* code-points (if possible).

And there can actually be more than two individual *decomposed* code-points that make up a single *composed* code-point -- for example, a single character could have several diacritical marks applied to it.

When dealing with Unicode strings that will be compared, sorted, or length analyzed, it's very important to keep Unicode normalization in mind, and use it where necessary.

##### Unicode Grapheme Clusters

A final complication of Unicode string handling is the support for clustering of multiple adjacent code-points into a single visually distinct symbol, referred to as a *grapheme* (or a *grapheme cluster*).

An example would be a family emoji such as `"👩‍👩‍👦‍👦"`, which is actually made up of 7 code-points that all cluster/group together into a single visual symbol.

Consider:

```js
familyEmoji = "\u{1f469}\u{200d}\u{1f469}\u{200d}\u{1f466}\u{200d}\u{1f466}";

familyEmoji;            // 👩‍👩‍👦‍👦
```

This emoji is *not* a single registered Unicode code-point, and as such, there's no *normalization* that can be performed to compose these 7 separate code-points into a single entity. The visual rendering logic for such composite symbols is quite complex, well beyond what most of JS developers want to embed into our programs. Libraries do exist for handling some of this logic, but they're often large and still don't necessarily cover all of the nuances/variations.

Unlike surrogate pairs and combining marks, the symbols in grapheme clusters can in fact act as standalone characters, but have the special combining behavior when placed adjacent to each other.

This kind of complexity significantly affects length computations, comparison, sorting, and many other common string-oriented operations.

### Template Literals

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

Everything between the `{ .. }` in such a template literal is an arbitrary JS expression. It can be simple variables like `myName`, or complex JS programs, or anything in between (even another template literal expression!).

| TIP: |
| :--- |
| This feature is commonly called "template literals" or "template strings", but I think that's confusing. "Template" usually means, in programming contexts, a reusable set of text that can be re-evaluated with different data. For example, *template engines* for pages, email templates for newsletter campaigns, etc. This JS feature is not re-usable. It's a literal, and it produces a single, immediate value (usually a string). You can put such a value in a function, and call the function multiple times. But then the function is acting as the template, not the the literal itself. I prefer instead to refer to this feature as *interpolated literals*, or the funny, short-hand: *interpoliterals*. I just think that name is more accurately descriptive. |

Template literals also have an interesting different behavior with respect to new-lines, compared to classic `"` or `'` delimited strings. Recall that for those strings, a line-continuation required a `\` at the end of each line, right before a new-line. Not so, with template literals!

```js
myPoem = `
Roses are red
Violets are blue
C3PO's a funny robot
and so R2.`;

console.log(myPoem);
//
// Roses are red
// Violets are blue
// C3PO's a funny robot
// and so R2.
```

Line-continuations with template literals do *not require* escaping. However, that means the new-line is part of the string, even the first new-line above. In other words, `myPoem` above holds a truly *multi-line string*, as shown. However, if you `\` escape the end of any line in a template literal, the new-line will be omitted, just like with non-template literal strings.

Template literals usually result in a string value, but not always. A form of template literal that may look kind of strange is called a *tagged template literal*:

```js
price = formatCurrency`The cost is: ${totalCost}`;
```

Here, `formatCurrency` is a tag applied to the template literal value, which actually invokes `formatCurrency(..)` as a function, passing it the string literals and interpolated expressions parsed from the value. This function can then assemble those in any way it sees fit -- such as formatting a `number` value as currency in the current locale -- and return whatever value, string or otherwise, that it wants.

So tagged template literals are not always strings; they can be any value. But untagged template literals *will always be* strings.

Some JS developers believe that untagged template literal strings are best to use for *all* strings, even if not using any expression interpolation or multiple lines. I disagree. I think they should only be used when interpolating (or multi-line'ing).

| TIP: |
| :--- |
| The principle I always apply in making such determinations: use the closest-matched, and least capable, feature/tool, for any task. |

Moreover, there are a few places where `` `..` `` style strings are disallowed. For example, the `"use strict"` pragma cannot use back-ticks, or the pragma will be silently ignored (and thus the program accidentally runs in non-strict mode). Also, this style of strings cannot be used in quoted property names of object literals, destruturing patterns, or in the ES Module `import .. from ..` module-specifier clause.

My take: use `` `..` `` delimited strings where allowed, but only when interpolation/multi-line is needed; and keep using `".."` or `'..'` delimited strings for everything else.

## Number Values

The `number` type contains any numeric value (whole number or decimal), such as `-42` or `3.1415926`. These values are represented by the JS engine as 64-bit, IEEE-754 double-precision binary floating-point values. [^IEEE754]

JS `number`s are always decimals; whole numbers (aka "integers") are not stored in a different/special way. An "integer" stored as a `number` value merely has nothing non-zero as its fraction portion; `42` is thus indistinguishable in JS from `42.0` and `42.000000`.

We can use `Number.isInteger(..)` to determine if a `number` value has any non-zero fraction or not:

```js
Number.isInteger(42);           // true
Number.isInteger(42.0);         // true
Number.isInteger(42.000000);    // true

Number.isInteger(42.0000001);   // false
```

### Parsing vs Coercion

If a string value holds numeric-looking contents, you may need to convert from that string value to a `number`, for mathematical operation purposes.

However, it's very important to distinguish between parsing-conversion and coercive-conversion.

We can parse-convert with JS's built-in `parseInt(..)` or `parseFloat(..)` utilities:

```js
someNumericText = "123.456";

parseInt(someNumericText,10);               // 123
parseFloat(someNumericText);                // 123.456

parseInt("42",10) === parseFloat("42");     // true

parseInt("512px");                          // 512
```

| NOTE: |
| :--- |
| Parsing is only relevant for string values, as it's a character-by-character (left-to-right) operation. It doesn't make sense to parse the contents of a `boolean`, nor to parse the contents of a `number` or a `null`; there's nothing to parse. If you pass anything other than a string value to `parseInt(..)` / `parseFloat(..)`, those utilities first convert that value to a string and then try to parse it. That's almost certainly problematic (leading to bugs) or wasteful -- `parseInt(42)` is silly, and `parseInt(42.3)` is an abuse of `parseInt(..)` to do the job of `Math.floor(..)`. |

Parsing pulls out numeric-looking characters from the string value, and puts them into a `number` value, stopping once it encounters a character that's non-numeric (e.g., not `-`, `.` or `0`-`9`). If parsing fails on the first character, both utilities return the special `NaN` value (see "Invalid Number" below), indicating the operation was invalid and failed.

When `parseInt(..)` encounters the `.` in `"123.456"`, it stops, using just the `123` in the resulting `number` value. `parseFloat(..)` by contrast accepts this `.` character, and keeps right on parsing a float with any decimal digits after the `.`.

The `parseInt(..)` utility specifically, takes as an optional -- but *actually*, rather necessary -- second argument, `radix`: the numeric base to assume for interpreting the string characters for the `number` (range `2` - `36`). `10` is for standard base-10 numbers, `2` is for binary, `8` is for octal, and `16` is for hexadecimal. Any other unusual `radix`, like `23`, assumes digits in order, `0` - `9` followed by the `a` - `z` (case insensitive) character ordination. If the specified radix is outside the `2` - `36` range, `parseInt(..)` fails as invalid and returns the `NaN` value.

If `radix` is omitted, the behavior of `parseInt(..)` is rather nuanced and confusing, in that it attempts to make a best-guess for a radix, based on what it sees in the first character. This historically has lead to lots of subtle bugs, so never rely on the default auto-guessing; always specify an explicit radix (like `10` in the calls above).

`parseFloat(..)` always parses with a radix of `10`, so no second argument is accepted.

| WARNING: |
| :--- |
| One surprising difference between `parseInt(..)` and `parseFloat(..)` is that `parseInt(..)` will not fully parse scientific notation (e.g., `"1.23e+5"`), instead stopping at the `.` as it's not valid for integers; in fact, even `"1e+5"` stops at the `"e"`. `parseFloat(..)` on the other hand fully parses scientific notation as expected. |

In contrast to parsing-conversion, coercive-conversion is an all-or-nothing sort of operation. Either the entire contents of the string are recognized as numeric (integer or floating-point), or the whole conversion fails (resulting in `NaN` -- again, see "Invalid Number" later in this chapter).

Coercive-conversion can be done explicitly with the `Number(..)` function (no `new` keyword) or with the unary `+` operator in front of the value:

```js
someNumericText = "123.456";

Number(someNumericText);        // 123.456
+someNumericText;               // 123.456

Number("512px");                // NaN
+"512px";                       // NaN
```

### Other Numeric Representations

In addition to defining numbers using traditional base-10 numerals (`0`-`9`), JS supports defining whole-number-only number literals in three other bases: binary (base-2), octal (base-8), and hexadecimal (base-16).

```js
// binary
myAge = 0b101010;
myAge;              // 42

// octal
myAge = 0o52;
myAge;              // 42

// hexadecimal
myAge = 0x2a;
myAge;              // 42
```

As you can see, the prefixes `0b` (binary), `0o` (octal), and `0x` (hexadecimal) signal defining numbers in the different bases, but decimals are not allowed on these numeric literals.

| NOTE: |
| :--- |
| JS syntax allows `0B`, `0O`, and `0X` prefixes as well. However, please don't ever use those uppercase prefix forms. I think any sensible person would agree: `0O` is much easier to confuse at a glance than `0o` (which is, itself, a bit visually ambiguous at a glance). Always stick to the lowercase prefix forms! |

It's important to realize that you're not defining a *different number*, just using a different form to produce the same underlying numeric value.

By default, JS represents the underlying numeric value in output/string fashion with standard base-10 form. However, `number` values have a built-in `toString(..)` method that produces a string representation in any specified base/radix (as with `parseInt(..)`, in the range `2` - `36`):

```js
myAge = 42;

myAge.toString(2);          // "101010"
myAge.toString(8);          // "52"
myAge.toString(16);         // "2a"
myAge.toString(23);         // "1j"
myAge.toString(36);         // "16"
```

You can round-trip any arbitrary-radix string representation back into a `number` using `parseInt(..)`, with the appropriate radix:

```js
myAge = 42;

parseInt(myAge.toString("23"),23);      // 42
```

Another allowed form for specifying number literals is using scientific notation:

```js
myAge = 4.2E1;      // or 4.2e1 or 4.2e+1

myAge;              // 42
```

`4.2E1` (or `4.2e1`) means, `4.2 * (10 ** 1)` (`10` to the `1` power). The exponent can optionally have a sign `+` or `-`. If the sign is omitted, it's assumed to be `+`. A negative exponent makes the number smaller (moves the decimal leftward) rather than larger (moving the decimal rightward):

```js
4.2E-3;             // 0.0042
```

This scientific notation form is especially useful for readability when specifying larger powers of `10`:

```js
someBigPowerOf10 = 1000000000;

// vs:

someBigPowerOf10 = 1e9;
```

By default, JS will represent (e.g., as string values, etc) either very large or very small numbers -- specifically, if the values require more than 21 digits of precision -- using this same scientific notation:

```js
ratherBigNumber = 123 ** 11;
ratherBigNumber.toString();     // "9.748913698143826e+22"

prettySmallNumber = 123 ** -11;
prettySmallNumber.toString();   // "1.0257553107587752e-23"
```

Numbers with smaller absolute values (closer to `0`) than these thresholds can still be forced into scientific notation form (as strings):

```js
plainBoringNumber = 42;

plainBoringNumber.toExponential();      // "4.2e+1"
plainBoringNumber.toExponential(0);     // "4e+1"
plainBoringNumber.toExponential(4);     // "4.2000e+1"
```

The optional argument to `toExponential(..)` specifies the number of decimal digits to include in the string representation.

Another readability affordance for specifying numeric literals in code is the ability to insert `_` as a digit separator wherever its convenient/meaningful to do so. For example:

```js
someBigPowerOf10 = 1_000_000_000;

totalCostInPennies = 123_45;  // vs 12_345
```

The decision to use `12345` (no separator), `12_345` (like "12,345"), or `123_45` (like "123.45") is entirely up to the author of the code; JS ignores the separators. But depending on the context, `123_45` could be more semantically meaningful (readability wise) than the more traditional three-digit-grouping-from-the-right-separated-with-commas style mimicked with `12_345`.

### IEEE-754 Bitwise Binary Representations

IEEE-754[^IEEE754] is a technical standard for binary representation of decimal numbers. It's widely used by most computer programming languages, including JS, Python, Ruby, etc.

I'm not going to cover it exhaustively, but I think a brief primer on how numbers work in languages like JS is more than warranted, given how few programmers have *any* familiarity with it.

In 64-bit IEEE-754 -- so called "double-precision", because originally IEEE-754 used to be 32-bit, and now it's double that! -- the 64 bits are divided into three sections: 52 bits for the number's base value (aka, "fraction", "mantissa", or "significand"), 11 bits for the exponent to raise `2` to before multiplying, and 1 bit for the sign of the ultimate value.

| NOTE: |
| :--- |
| Since only 52 of the 64 bits are actually used to represent the base value, `number` doesn't actually have `2^64` values in it. According to the specification for the `number` type[^NumberType], the number of values is precisely `2^64 - 2^53 + 3`, or about 18 quintillion, split about evenly between positive and negative numbers. |

These bits are arranged left-to-right, as so (S = Sign Bit, E = Exponent Bit, M = Mantissa Bit):

```js
SEEEEEEEEEEEMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
```

So, the number `42` (or `42.000000`) would be represented by these bits:

```
// 42:
01000000010001010000000000000000
00000000000000000000000000000000
```

The sign bit is `0`, meaning the number is positive (`1` means negative).

The 11-bit exponent is binary `10000000100`, which in base-10 is `1028`. But in IEEE-754, this value is interpreted as being stored unsigned with an "exponent bias" of `1023`, meaning that we're shifting up the exponent range from `-1022:1023` to `1:2046` (where `0` and `2047` are reserved for special representations). So, take `1028` and subtract the bias `1023`, which gives an effective exponent of `5`. We raise `2` to that value (`2^5`), giving `32`.

| NOTE: |
| :--- |
| If the subtracting `1023` from the exponent value gives a negative (e.g., `-3`), that's still interpreted as `2`'s exponent; raising `2` to negative numbers just produces smaller and smaller values. |

The remaining 52 bits give us the base value `01010000...`, interpreted as binary decimal `1.0101000...` (with all trailing zeros). Converting *that* to base-10, we get `1.3125000...`. Finally, then multiply that by `32` already computed from the exponent. The result: `42`.

As you might be able to tell now, this IEEE-754 number representation standard is called "floating point" because the decimal point "floats" back-and-forth along the bits, depending on the specified exponent value.

The number `42.0000001`, which is only different from `42.000000` by just `0.0000001`, would be represented by these bits:

```
// 42.0000001:
01000000010001010000000000000000
00000000110101101011111110010101
```

Notice how the previous bit pattern and this one differ by quite a few bits in the trailing positions! The binary decimal fraction containing all those extra `1` bits (`1.010100000000...01011111110010101`) converts to base-10 as `1.31250000312500003652`, which multiplied by `32` gives us exactly `42.0000001`.

We'll revisit more details about floating-point (im)precision in Chapter 2. But now you understand a *bit more* about how IEEE-754 works!

### Number Limits

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

### Safe Integer Limits

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

And JS provides a utility to determine if a value is an integer in this safe range (`-2^53 + 1` - `2^53 - 1`):

```js
Number.isSafeInteger(2 ** 53);      // false
Number.isSafeInteger(2 ** 53 - 1);  // true
```

### Double Zeros

It may surprise you to learn that JS has two zeros: `0`, and `-0` (negative zero). But what on earth is a "negative zero"? [^SignedZero] A mathematician would surely balk at such a notion.

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

| NOTE: |
| :--- |
| While JS defines a signed zero in the `number` type, there is no corresponding signed zero in the `bigint` number type. As such, `-0n` is just interpreted as `0n`, and the two are indistinguishable. |

### Invalid Number

Mathematical operations can sometimes produce an invalid result. For example:

```js
42 / "Kyle";            // NaN
```

It's probably obvious, but if you try to divide a number by a string, that's an invalid mathematical operation.

Another type of invalid numeric operation is trying to coercively-convert a non-numeric resembling value to a `number`. As discussed earlier, we can do so with either the `Number(..)` function or the unary `+` operator:

```js
myAge = Number("just a number");

myAge;                  // NaN

+undefined;             // NaN
```

All such invalid operations (mathematical or coercive/numeric) produce the special `number` value called `NaN`.

The historical root of "NaN" (from the IEEE-754[^IEEE754] specification) is as an acronym for "Not a Number". Technically, there are about 9 quadrillion values in the 64-bit IEEE-754 number space designated as "NaN", but JS treats all of them indistinguishably as the single `NaN` value.

Unfortunately, that *not a number* meaning produces confusion, since `NaN` is *absolutely* a `number`.

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

## BigInteger Values

As the maximum safe integer in JS `number`s is `9007199254740991` (see above), such a relatively low limit can present a problem if a JS program needs to perform larger integer math, or even just hold values like 64-bit integer IDs (e.g., Twitter Tweet IDs).

For that reason, JS provides the alternate `bigint` type (BigInteger), which can store arbitrarily large (theoretically not limited, except by finite machine memory and/or JS implementation) integers.

To distinguish a `bigint` from a whole (integer) `number` value, which would otherwise both look the same (`42`), JS requires an `n` suffix on `bigint` values:

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

myBigInt ** 2n;                 // 81129638414606663681390495662081n
```

As you can see, the `bigint` value-type is able to do precise arithmetic above the integer limit of the `number` value-type.

| WARNING: |
| :--- |
| Notice that the `+` operator required `.. + 2n` instead of just `.. + 2`? You cannot mix `number` and `bigint` value-types in the same expression. This restriction is annoying, but it protects your program from invalid mathematical operations that would give non-obvious unexpected results. |

A `bigint` value can also be created with the `BigInt(..)` function; for example, to convert a whole (integer) `number` value to a `bigint`:

```js
myAge = 42n;

inc = 1;

myAge += BigInt(inc);

myAge;              // 43n
```

| WARNING: |
| :--- |
| Though it may seem counter-intuitive to some readers, `BigInt(..)` is *always* called without the `new` keyword. If `new` is used, an exception will be thrown. |

That's definitely one of the most common usages of the `BigInt(..)` function: to convert `number`s to `bigint`s, for mathematical operation purposes.

But it's not that uncommon to represent large integer values as strings, especially if those values are coming to the JS environment from other language environments, or via certain exchange formats, which themselves do not support `bigint`-style values.

As such, `BigInt(..)` is useful to coerce those string values to `bigint`s:

```js
myBigInt = BigInt("12345678901234567890");

myBigInt;                       // 12345678901234567890n
```

Unlike `parseInt(..)`, if any character in the string is non-numeric (`0-9` digits or `-`), including `.` or even a trailing `n` suffix character, an exception will be thrown. In other words, `BigInt(..)` is an all-or-nothing coercion-conversion, not a parsing-conversion.

| NOTE: |
| :--- |
| I think it's absurd that `BigInt(..)` won't accept the trailing `n` character while string coercing (and thus effectively ignore it). I lobbied vehemently for that behavior, in the TC39 process, but was ultimately denied. In my opinion, it's now a tiny little gotcha wart on JS, but a wart nonetheless. |

## Symbol Values

The `symbol` type contains special opaque values called "symbols". These values can only be created by the `Symbol(..)` function:

```js
secret = Symbol("my secret");
```

| WARNING: |
| :--- |
| Just as with `BigInt(..)`, the `Symbol(..)` function must be called without the `new` keyword. |

The `"my secret"` string passed into the `Symbol(..)` function call is *not* the symbol value itself, even though it seems that way. It's merely an optional descriptive label, used only for debugging purposes for the benefit of the developer.

The underlying value returned from `Symbol(..)` is a special kind of value that resists the program/developer inspecting anything about its underlying representation. That's what I mean by "opaque".

| NOTE: |
| :--- |
| You could think of symbols as if they are monotonically incrementing integer numbers -- indeed, that's similar to how at least some JS engines implement them. But the JS engine will never expose any representation of a symbol's underlying value in any way that you or the program can see. |

Symbols are guaranteed by the JS engine to be unique (only within the program itself), and are unguessable. In other words, a duplicate symbol value can never be created in a program.

You might be wondering at this point what symbols are used for?

One typical usage is as "special" values that the developer distinguishes from any other values that could accidentally collide. For example:

```js
EMPTY = Symbol("not set yet");
myNickname = EMPTY;

// later:

if (myNickname == EMPTY) {
    // ..
}
```

Here, I've defined a special `EMPTY` value and initialized `myNickname` to it. Later, I check to see if it's still that special value, and then perform some action if so. I might not want to have used `null` or `undefined` for such purposes, as another developer might be able to pass in one of those common built-in values. `EMPTY` by contrast here is a unique, unguessable value that only I've defined and have control over and access to.

Perhaps even more commonly, symbols are often used as special (meta-) properties on objects:

```js
myInfo = {
    name: "Kyle Simpson",
    nickname: "getify",
    age: 42
};

// later:
PRIVATE_ID = Symbol("private unique ID, don't touch!");

myInfo[PRIVATE_ID] = generateID();
```

It's important to note that symbol properties are still publicly visible on any object; they're not *actually* private. But they're treated as special and set-apart from the normal collection of object properties. It's similar to if I had done instead:

```js
Object.defineProperty(myInfo,"__private_id_dont_touch",{
    value: generateID(),
    enumerable: false,
});
```

By convention only, most developers know that if a property name is prefixed with `_` (or even more so, `__`!), that means it's "pseudo-private" and to leave it alone unless they're really supposed to access it.

Symbols basically serve the same use-case, but a bit more ergonomically than the prefixing approach.

### Well-Known Symbols (WKS)

JS pre-defines a set of symbols, referred to as *well-known symbols* (WKS), that represent certain special meta-programming hooks on objects. These symbols are stored as static properties on the `Symbol` function object. For example:

```js
myInfo = {
    // ..
};

String(myInfo);         // [object Object]

myInfo[Symbol.toStringTag] = "my-info";
String(myInfo);         // [object my-info]
```

`Symbol.toStringTag` is a well-known symbol for accessing and overriding the default string representation of a plain object (`"[object Object]"`), replacing the `"Object"` part with a different value (e.g., `"my-info"`).

See the "Objects & Classes" book of this series for more information about Well-Known Symbols and metaprogramming.

### Global Symbol Registry

Often, you want to keep symbol values private, such as inside a module scope. But occasionally, you want to expose them so they're accessible globally throughout all the files in a JS program.

Instead of just attaching them as global variables (i.e., properties on the `globalThis` object), JS provides an alternate *global namespace* to register symbols in:

```js
// retrieve if already registered,
// otherwise register
PRIVATE_ID = Symbol.for("private-id");

// elsewhere:

privateIDKey = Symbol.keyFor(PRIVATE_ID);
privateIDKey;           // "private-id"

// elsewhere:

// retrieve symbol from registry undeer
// specified key
privateIDSymbol = Symbol.for(privateIDKey);
```

The value passed to `Symbol.for(..)` is *not* the same as passed to `Symbol(..)`. `Symbol.for(..)` expects a unique *key* for the symbol to be registered under in the global registry, whereas `Symbol(..)` optionally accepts a descriptive label (not necessarily unique).

If the registry doesn't have a symbol under that specified *key*, a new symbol (with no descriptive label) is created and automatically registered there. Otherwise, `Symbol.for(..)` returns whatever previously registered symbol is under that *key*.

Going in the opposite direction, if you have the symbol value itself, and want to retrieve the *key* it's registered under, `Symbol.keyFor(..)` takes the symbol itself as input, and returns the *key* (if any). That's useful in case it's more convenient to pass around the *key* string value than the symbol itself.

### Object or Primitive?

Unlike other primitives like `42`, where you can create multiple copies of the same value, symbols *do* act more like specific object references in that they're always completely unique (for purposes of value assignment and equality comparison). The specification also categorizes the `Symbol()` function under the "Fundamental Objects" section, calling the function a "constructor", and even defining its `prototype` property.

However, as mentioned earlier, `new` cannot be used with `Symbol(..)`; this is similar to the `BigInt()` "constructor". We clearly know `bigint` values are primitives, so `symbol` values seem to be of the same *kind*.

And in the specification's "Terms and Definitions", it lists symbol as a primitive value. [^PrimitiveValues] Moreover, the values themselves are used in JS programs as primitives rather than objects. For example, symbols are primarily used as keys in objects -- we know objects cannot use other object values as keys! -- along with strings, which are also primitives.

As mentioned earlier, some JS engines even internally implement symbols as unique, monotonically incrementing integers (primitives!).

Finally, as explained at the top of this chapter, we know primitive values are *not allowed* to have properties set on them, but are *auto-boxed* (see "Automatic Objects" in Chapter 3) internally to the corresponding object-wrapper type to facilitate property/method access. Symbols follow all these exact behaviors, the same as all the other primitives.

All this considered, I think symbols are *much more* like primitives than objects, so that's how I present them in this book.

## Primitives Are Built-In Types

We've now dug deeply into the seven primitive (non-object) value types that JS provides automatically built-in.

Before we move on to discussing JS's built-in object value type, we want to take a closer look at the kinds of behaviors we can expect from JS values. We'll do so in-depth, in the next chapter.

[^PrimitiveValues]: "4.4.5 primitive value", ECMAScript 2022 Language Specification; https://tc39.es/ecma262/#sec-primitive-value ; Accessed August 2022

[^UTFUCS]: "JavaScript’s internal character encoding: UCS-2 or UTF-16?"; Mathias Bynens; January 20 2012; https://mathiasbynens.be/notes/javascript-encoding ; Accessed July 2022

[^IEEE754]: "IEEE-754"; https://en.wikipedia.org/wiki/IEEE_754 ; Accessed July 2022

[^NumberType]: "6.1.6.1 The Number Type", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-ecmascript-language-types-number-type ; Accessed August 2022

[^SignedZero]: "Signed Zero", Wikipedia; https://en.wikipedia.org/wiki/Signed_zero ; Accessed August 2022
