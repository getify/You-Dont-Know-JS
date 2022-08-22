# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 4: Coercing Values

| NOTE: |
| :--- |
| Work in progress |

We've thouroughly covered all of the different *types* of values in JS. And along the way, more than a few times, we mentioned the notion of converting -- actually, coercing -- from one type of value to another.

In this chapter, we'll dive deep into coercion and uncover all its mysteries.

## Coercion: Explicit vs Implicit

Some developers assert that when you explicitly indicate a type change in an operation, this doesn't qualify as a *coercion* but just a type-cast or type-conversion. In other words, the claim is that coercion is only implicit.

I disagree with this characterization. I use *coercion* to label any type conversion in a dynamically-typed language, whether it's plainly obvious in the code or not. Here's why: the line between *explicit* and *implicit* is not clear and objective, it's fairly subjective. If you think a type conversion is implicit (and thus *coercion*), but I think it's explicit (and thus not a *coercion*), the distinction becomes irrelevant.

Keep that subjectivity in mind as we explore various *explicit* and *implicit* forms of coercion. In fact, here's a spoiler: most of the coercions could be argued as either, so we'll be looking at them with such balanced perspective.

### Implicit: Bad or ...?

An extremely common opinion among JS developers is that *coercion is bad*, specifically, that *implicit coercion is bad*; the rise in popularity of type-aware tooling like TypeScript speaks loudly to this sentiment.

But that feeling is not new. 14+ years ago, Douglas Crockford's book "The Good Parts" also famously decried *implicit coercion* as one of the *bad parts*. Even Brendan Eich, creator of JS, regularly claims that *implicit coercion* was a mistake[^EichCoercion] in the early design of the language that he now regrets.

If you've been around JS for more than a few months, you've almost certainly heard these opinions voiced strongly and predominantly. And if you've been around JS for years or more, you probably have your mind already made up.

In fact, I think you'd be hard pressed to name hardly any other well-known source of JS teaching that strongly endorses coercion (in virtually all its forms); I do -- and this book definitely does! -- but I feel mostly like a lone voice shouting futilely in the wilderness.

However, here's an observation I've made over the years: most of the folks who publicly condemn *implicit coercion*, actually use *implicit coercion* in their own code. Hmmmm...

Douglas Crockford says to avoid the mistake of *implicit coercion*[^CrockfordCoercion], but his code uses `if (..)` statements with non-boolean values evaluated. [^CrockfordIfs] Many have dismissed my pointing that out in the past, with the claim that `ToBoolean()` isn't *really* coercion. Ummm... ok?

Brendan Eich says he regrets *implicit coercion*, but yet he openly endorses[^BrendanToString] idioms like `x + ""` (and others!) to coerce the value in `x` to a string (we'll cover this later); and that's most definitely an *implicit coercion*.

So what do we make of this dissonance? Is it merely a, "do as I say, not as I do" minor self-contradiction? Or is there more to it?

I am not going to pass a final judgement here yet, but I want you the reader to deeply ponder that question, as you continue throughout this chapter and book.

## Abstracts

Now that I've challenged you to examine coercion in more depth than you may have ever previously indulged, let's first look at the foundations of how coercion occurs, according to the JS specification.

The specification details a number of *abstract operations*[^AbstractOperations] that dictate internal conversion from one value-type to another. It's important to be aware of these operations, as coercive mechanics in the language mix and match them in various ways.

These operations *look* as if they're real functions that could be called, such as `ToString(..)` or `ToNumber(..)`. But by *abstract*, we mean they only exist conceptually by these names; they aren't functions we can *directly* invoke in our programs. Instead, we activate them implicitly/indirectly depending on the statements/expressions in our programs.

### ToBoolean

Decision making (conditional branching) always requires a boolean `true` or `false` value. But it's extremely common to want to make these decisions based on non-boolean value conditions, such as whether a string is empty or has anything in it.

When non-boolean values are encountered in a context that requires a boolean -- such as the condition clause of an `if` statement or `for` loop -- the `ToBoolean(..)`[^ToBoolean] abstract operation is activated to facilitate the coercion.

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

Keep in mind: these rules of boolean coercion only apply when `ToBoolean()` is actually activated. There are constructs/idioms in the JS language that may appear to involve boolean coercion but which don't actually do so.

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
| Calling the `String()`[^StringFunction] concrete function (without `new` operator) is generally thought of as *merely* invoking the `ToString()` abstract operation. While that's mostly true, it's not entirely so. `String(Symbol("ok"))` works, whereas the abstract `ToString(Symbol(..))` itself throws an exception. More on `String(..)` later in this chapter. |

#### Default `toString()`

When `ToString()` is activated with an object value-type, it delegates to the `ToPrimitive()` operation (as explained earlier), with `"string"` as its *hinted* type:

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

In addition to `ToNumber()`, the specification defines `ToNumeric()`, which activates `ToPrimitive()` on a value, then conditionally delegates to `ToNumber()` if the value is *not* already a `bigint` value-type.

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

You can probably infer the purpose of these operations from their names, and/or from consulting their algorithms in the specification. For most JS operations, it's more likely that a higher-level operation like `ToNumber()` is activated, rather than these specific ones.

#### Default `valueOf()`

When `ToNumber()` is activated on an object value-type, it instead delegates to the `ToPrimitive()` operation (as explained earlier), with `"number"` as its *hinted* type:

```
ToNumber(new String("abc"));        // NaN
ToNumber(new Number(42));           // 42

ToNumber({ a: 1 });                 // NaN
ToNumber([ 1, 2, 3 ]);              // NaN
ToNumber([]);                       // 0
```

By virtue of `ToPrimitive(..,"number")` delegation, these objects all have their default `valueOf()` method (inherited via `[[Prototype]]`) invoked.

### Equality Comparison

When JS needs to determine if two values are the *same value*, it activates the `SameValue()`[^SameValue] operation, which delegates to a variety of related sub-operations.

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

If the value-types are the same, `IsStrictlyEqual()` delegates to sub-operations for comparing `number` or `bigint` values. [^NumericAbstractOps] You might logically expect these delegated sub-operations to be the aforementioned numeric-specialized `SameValue()` / `SameValueZero()` operations. However, `IsStrictlyEqual()` instead delegates to `Number:equal()`[^NumberEqual] or `BigInt:equal()`[^BigIntEqual].

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

Each time a coercion is performed in the above steps, the algorithm is *recursively* reactivated with the new value(s). That process continues until the types are the same, and then the comparison is delegated to the `IsStrictlyEqual()` operation.

What can we take from this algorithm? First, we see there is a bias toward `number` (or `bigint`) comparison; it nevers coerce values to `string` or `boolean` value-types.

Importantly, we see that both `IsLooselyEqual()` and `IsStrictlyEqual()` are type-sensitive. `IsStrictlyEqual()` immediately bails if the types mismatch, whereas `IsLooselyEqual()` performs the extra work to coerce mismatching value-types to be the same value-types (again, ideally, `number` or `bigint`).

Moreover, if/once the types are the same, both operations are identical -- `IsLooselyEqual()` delegates to `IsStrictlyEqual()`.

### Relational Comparison

When values are compared relationally -- that is, is one value "less than" another? -- there's one specific abstract operation that is activated: `IsLessThan()`. [^LessThan]

```
// IsLessThan() is abstract

IsLessThan(1,2, /*LeftFirst=*/ true );            // true
```

There is no `IsGreaterThan()` operation; instead, the first two arguments to `IsLessThan()` can be reversed to accomplish a "greater than" comparison. To preserve left-to-right evaluation semantics (in the case of nuanced side-effects), `isLessThan()` also takes a third argument (`LeftFirst`); if `false`, this indicates a comparison was reversed and the second parameter should be evaluated before the first.

```
IsLessThan(1,2, /*LeftFirst=*/ true );            // true

// equivalent of a fictional "IsGreaterThan()"
IsLessThan(2,1, /*LeftFirst=*/ false );          // false
```

Similar to `IsLooselyEqual()`, the `IsLessThan()` operation is *coercive*, meaning that it first ensures that the value-types of its two values match, and prefers numeric comparisons. There is no `IsStrictLessThan()` for non-coercive relational comparison.

As an example of coercive relational comparison, if the type of one value is `string` and the type of the other is `bigint`, the `string` is coerced to a `bigint` with the aforementioned `StringToBigInt()` operation. Once the types are the same, `IsLessThan()` proceeds as described in the following sections.

#### String Comparison

When both value are type `string`, `IsLessThan()` checks to see if the lefthand value is a prefix (the first *n* characters[^StringPrefix]) of the righthand; if so, `true` is returned.

If neither string is a prefix of the other, the first character position (start-to-end direction, not left-to-right) that's different between the two strings, is compared for their respective code-unit (numeric) values; the result is then returned.

Generally, code-units follow intuitive lexicographic (aka, dictionary) order:

```
IsLessThan("a","b", /*LeftFirst=*/ true );        // true
```

Even digits are treated as characters (not numbers):

```
IsLessThan("101","12", /*LeftFirst=*/ true );     // true
```

There's even a bit of embedded *humor* in the unicode code-unit ordering:

```
IsLessThan("🐔","🥚", /*LeftFirst=*/ true );      // true
```

At least now we've answered the age old question of *which comes first*?!

#### Numeric Comparison

For numeric comparisons, `IsLessThan()` defers to either the `Number:lessThan()` or `BigInt.lessThan()` operation[^NumericAbstractOps], respectively:

```
IsLessThan(41,42, /*LeftFirst=*/ true );         // true

IsLessThan(-0,0, /*LeftFirst=*/ true );          // false

IsLessThan(NaN,1 /*LeftFirst=*/ true );          // false

IsLessThan(41n,42n, /*LeftFirst=*/ true );       // true
```

## Concrete Coercions

Now that we've covered all the abstract operations JS defines for handling various coercions, it's time to turn our attention to the concrete statements/expressions we can use in our programs that activate these operations.

### To Boolean

To coerce a value that's not of type `boolean` into that type, we need the abstract `ToBoolean()` operation, as described earlier in this chapter.

Before we explore *how* to activate it, let's discuss *why* you would want to force a `ToBoolean()` coercion.

From a code readability perspective, being *explicit* about type coercions can be preferable (though not universally). But functionally, the most common reason to force a `boolean` is when you're passing data to an external source -- for example, submitting data as JSON to an API endpoint -- and that location expects `true` / `false` without needing to do coercions.

There's several ways that `ToBoolean()` can be activated. Perhaps the most *explicit* (obvious) is the `Boolean(..)` function:

```js
Boolean("hello");               // true
Boolean(42);                    // true

Boolean("");                    // false
Boolean(0);                     // false
```

As mentioned in Chapter 3, keep in mind that `Boolean(..)` is being called without the `new` keyword, to activate the `ToBoolean()` abstract operation.

It's not terribly common to see JS developers use the `Boolean(..)` function for such explicit coercions. More often, developers will use the double-`!` idiom:

```js
!!"hello";                      // true
!!42;                           // true

!!"";                           // false
!!0;                            // false
```

The `!!` is not its own operator, even though it seems that way. It's actually two usages of the unary `!` operator. This operator first coerces any non-`boolean`, then negates it. To undo the negation, the second `!` flips it back.

So... which of the two, `Boolean(..)` or `!!`, do you consider to be more of an explicit coercion?

Given the flipping that `!` does, which must then be undone with another `!`, I'd say `Boolean(..)` is *more* explicit -- at the job of coercing a non-`boolean` to a `boolean` -- than `!!` is. But surveying open-source JS code, the `!!` is used far more often.

If we're defining *explicit* as, "most directly and obviously perfoming an action", `Boolean(..)` edges out `!!`. But if we're defining *explicit* as, "most recognizably performing an action", `!!` might have the edge. Is there a definitive answer here?

While you're pondering that question, let's look at another JS mechanism that activates `ToBoolean()` under the covers:

```js
specialNumber = 42;

if (specialNumber) {
    // ..
}
```

The `if` statement requires a `boolean` for the conditional to make its control-flow decision. If you pass it a non-`boolean`, a `ToBoolean()` *coercion* is performed.

| NOTE: |
| :--- |
| Many other statement types also activate the `ToBoolean()` coercion, including the `? :` ternary, and `for` / `while` loops. |

Is `if (..)` here illustrating an *explicit* coercion or an *implicit* coercion? Again, I think it depends on your perspective. The specification dictates pretty explicitly that `if` only works with `boolean` conditional values. But a strong argument can be made that any coercion is a secondary effect to the main job of `if`, which is to make a control-flow decision.

In fact, as mentioned earlier in the `ToBoolean()` discussion, some developers don't consider *any* invocation of `ToBoolean()` to be a coercion. But I think that's too much of a stretch.

My take: `Boolean(..)` is the most preferable *explicit* coercion form. Further, I think `if` / `for` / `while` statements are *implicitly* coercing non-`boolean`s, but I'm OK with that.

Since most developers, including famous names like Doug Crockford, also in practice use implicit (`boolean`) coercions in their `if`[^CrockfordIfs] and loop statements, I think we can say that at least *some forms* of *implicit* coercion are widely acceptable, regardless of the rhetoric to the contrary.

### To Primitive

// TODO

### To String

As with `ToBoolean()`, there are a number of ways to activate the `ToString()` coercion (as discussed earlier in the chapter). The decision of which approach is similarly subjective.

Like the `Boolean(..)` function, the `String(..)` function (no `new` keyword) is a primary way of activating *explicit* `ToString()` coercion:

```js
String(true);                   // "true"
String(42);                     // "42"
String(-0);                     // "0"
String(Infinity);               // "Infinity"

String(null);                   // "null"
String(undefined);              // "undefined"
```

However, `String(..)` is more than *just* an activation of `ToString()`. For example:

```js
String(Symbol("ok"));           // "Symbol(ok)"
```

This works, because *explicit* coercion of `symbol` values is allowed. But in cases where a symbol is *implicitly* coerced to a string (e.g., `Symbol("ok") + ""`), the underlying `ToString()` operation throws an exception. That proves that `String(..)` is more than just an activation of `ToString()`. More on *implicit* string coercion of symbols in a bit.

If you call `String(..)` with an object value (e.g., array, etc), it activates the `ToPrimitive()` operation (via the `ToString()` operation), which then looks for an invokes that value's `toString()` method:

```js
String([1,2,3]);                // "1,2,3"

String(x => x + 1);             // "x => x + 1"
```

Aside from `String(..)`, any primitive, non-nullish value (neither `null` nor `undefined`) can be auto-boxed (see Chapter 3) in its respective object wrapper, providing a callable `toString()` method.

```js
true.toString();                // "true"
42..toString();                 // "42"
-0..toString();                 // "0"
Infinity.toString();            // "Infinity"
Symbol("ok").toString();        // "Symbol(ok)"
```

| NOTE: |
| :--- |
| Do keep in mind, these `toString()` methods do *not* necessarily activate the `ToString()` operation, they just define their own rules for how to represent the value as a string. |

As shown with `String(..)` just a moment ago, the various object sub-types -- such as arrays, functions, regular expressions, `Date` and `Error` instances, etc -- all define their own specific `toString()` methods, which can be invoked directly:

```js
[1,2,3].toString();             // "1,2,3"

(x => x + 1).toString();        // "x => x + 1"
```

Moreover, any plain object that's (by default) `[[Prototype]]` linked to `Object.prototype` has a default `toString()` method available:

```js
({ a : 1 }).toString();         // "[object Object]"
```

Is the `toString()` approach to coercion *explicit* or *implicit*? Again, it depends. It's certainly a self-descriptive mechanism, which leans *explicit*. But it often relies on auto-boxing, which is itself a fairly *implicit* coercion.

Let's take a look at another common -- and famously endorsed! -- idiom for coercing a value to a string. Recall from "String Concatenation" in Chapter 2, the `+` operator is overloaded to prefer string concatenation if either operand is already a string, and thus coerces non-string operand to a string if necessary.

Consider:

```js
true + "";                      // "true"
42 + "";                        // "42"
null + "";                      // "null"
undefined + "";                 // "undefined"
```

The `+ ""` idiom for string coercion takes advantage of the `+` overloading, without altering the final coerced string value. By the way, all of these work the same with the operands reversed (i.e., `"" + ..`).

Some feel this is an *explicit* coercion, but I think it's clearly more *implicit*, in that it's taking advantage of the `+` overloading; further, the `""` is indirectly used to activate the coercion without modifying it. Moreover, consider what happens when this idiom is applied with a symbol value:

```js
Symbol("ok") + "";              // TypeError exception thrown
```

| WARNING: |
| :--- |
| Allowing *explicit* coercion of symbols (`String(Symbol("ok"))`, but disallowing *implicit* coercion (`Symbol("ok") + ""`), is quite intentional by TC39. [^SymbolString] It was felt that symbols, as primitives often used in places where strings are otherwise used, could too easily be mistaken as strings. As such, they wanted to make sure developers expressed intent to coerce a symbol to a string, hopefully avoiding many of those anticipated confusions. This is one of the *extremely rare* cases where the language design asserts an opinion on, and actually discriminates between, *explicit* vs. *implicit* coercions. |

Why the exception? JS treats `+ ""` as an *implicit* coercion, which is why when activated with a symbol, an exception is thrown. I think that's a pretty ironclad proof.

Nevertheless, as I mentioned at the start of this chapter, Brendan Eich endorses `+ ""`[^BrendanToString] as the *best* way to coerce values to strings. I think that carries a lot of weight, in terms of him supporting at least a subset of *implicit* coercion practices. His views on *implicit* coercion must be a bit more nuanced than, "it's all bad."

### To Number

// TODO

### Nullish

// TODO

[^EichCoercion]: "The State of JavaScript - Brendan Eich", comment thread, Hacker News; Oct 9 2012; https://news.ycombinator.com/item?id=4632704 ; Accessed August 2022

[^CrockfordCoercion]: "JavaScript: The World's Most Misunderstood Programming Language"; 2001; https://www.crockford.com/javascript/javascript.html ; Accessed August 2022

[^CrockfordIfs]: "json2.js", Github; Apr 21 2018; https://github.com/douglascrockford/JSON-js/blob/8e8b0407e475e35942f7e9461dab81929fcc7321/json2.js#L336 ; Accessed August 2022

[^BrendanToString]: ESDiscuss mailing list; Aug 26 2014; https://esdiscuss.org/topic/string-symbol#content-15 ; Accessed August 2022

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

[^NumericAbstractOps]: "6.1.6 Numeric Types", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types ; Accessed August 2022

[^NumberEqual]: "6.1.6.1.13 Number:equal(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types-number-equal ; Accessed August 2022

[^BigIntEqual]: "6.1.6.2.13 BigInt:equal(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types-bigint-equal ; Accessed August 2022

[^LessThan]: "7.2.14 IsLessThan(x,y,LeftFirst)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-islessthan ; Accessed August 2022

[^StringPrefix]: "7.2.9 IsStringPrefix(p,q)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-isstringprefix ; Accessed August 2022

[^SymbolString]: "String(symbol)", ESDiscuss mailing list; Aug 12 2014; https://esdiscuss.org/topic/string-symbol ; Accessed August 2022
