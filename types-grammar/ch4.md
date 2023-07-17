# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 4: Coercing Values

| NOTE: |
| :--- |
| Work in progress |

We've thoroughly covered all of the different *types* of values in JS. And along the way, more than a few times, we mentioned the notion of converting -- actually, coercing -- from one type of value to another.

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

Douglas Crockford says to avoid the mistake of *implicit coercion*[^CrockfordCoercion], but his code uses `if (..)` statements with non-boolean values evaluated. [^CrockfordIfs] Many have dismissed my pointing that out in the past, with the claim that conversion-to-boolean isn't *really* coercion. Ummm... ok?

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
| There *are* narrow, tricky exceptions to this truthy rule. For example, the web platform has deprecated the long-standing `document.all` collection/array feature, though it cannot be removed entirely -- that would break too many sites. Even where `document.all` is still defined, it behaves as a "falsy object"[^ExoticFalsyObjects] -- `undefined` which then coerces to `false`; this means legacy conditional checks like `if (document.all) { .. }` no longer pass. |

The `ToBoolean()` coercion operation is basically a lookup table rather than an algorithm of steps to use in coercions a non-boolean to a boolean. Thus, some developers assert that this isn't *really* coercion the way other abstract coercion operations are. I think that's bogus. `ToBoolean()` converts from non-boolean value-types to a boolean, and that's clear cut type coercion (even if it's a very simple lookup instead of an algorithm).

Keep in mind: these rules of boolean coercion only apply when `ToBoolean()` is actually activated. There are constructs/idioms in the JS language that may appear to involve boolean coercion but which don't actually do so. More on these later.

### ToPrimitive

Any value that's not already a primitive can be reduced to a primitive using the `ToPrimitive()` (specifically, `OrdinaryToPrimitive()`[^OrdinaryToPrimitive]) abstract operation.  Generally, the `ToPrimitive()` is given a *hint* to tell it whether a `number` or `string` is preferred.

```
// ToPrimitive() is abstract

ToPrimitive({ a: 1 },"string");          // "[object Object]"

ToPrimitive({ a: 1 },"number");          // NaN
```

The `ToPrimitive()` operation will look on the object provided, for either a `toString()` method or a `valueOf()` method; the order it looks for those is controlled by the *hint*. `"string"` means check in `toString()` / `valueOf()` order, whereas `"number"` (or no *hint*) means check in `valueOf()` / `toString()` order.

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

What can we take from this algorithm? First, we see there is a bias toward `number` (or `bigint`) comparison; it never coerce values to `string` or `boolean` value-types.

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

If we're defining *explicit* as, "most directly and obviously performing an action", `Boolean(..)` edges out `!!`. But if we're defining *explicit* as, "most recognizably performing an action", `!!` might have the edge. Is there a definitive answer here?

While you're pondering that question, let's look at another JS mechanism that activates `ToBoolean()` under the covers:

```js
specialNumber = 42;

if (specialNumber) {
    // ..
}
```

The `if` statement requires a `boolean` for the conditional to make its control-flow decision. If you pass it a non-`boolean`, a `ToBoolean()` *coercion* is performed.

Unlike previous `ToBoolean()` coercion expressions, like `Boolean(..)` or `!!`, this `if` coercion is ephemeral, in that our JS program never sees the result of the coercion; it's just used internally by the `if`. Some may feel it's not *really* coercion if the program doesn't preserve/use the value. But I strongly disagree, because the coercion most definitely affects the program's behavior.

Many other statement types also activate the `ToBoolean()` coercion, including the `? :` ternary conditional, and `for` / `while` loops. We also have `&&` (logical-AND) and `||` (logical-OR) operators. For example:

```js
isLoggedIn = user.sessionID || req.cookie["Session-ID"];

isAdmin = isLoggedIn && ("admin" in user.permissions);
```

For both operators, the lefthand expression is first evaluated; if it's not already a `boolean`, a `ToBoolean()` coercion is activated to produce a value for the conditional decision.

| NOTE: |
| :--- |
| To briefly explain these operators: for `||`, if the lefthand expression value (post-coercion, if necessary) is `true`, the pre-coercion value is returned; otherwise the righthand expression is evaluated and returned (no coercion). For `&&`, if the lefthand expression value (post-coercion, if necessary) is `false`, the pre-coercion value is returned; otherwise, the righthand expression is evaluated and returned (no coercion). In other words, both `&&` and `||` force a `ToBoolean()` coercion of the lefthand operand for making the decision, but neither operator's final result is actually coerced to a `boolean`. |

In the previous snippet, despite the naming implications, it's unlikely that `isLoggedIn` will actually be a `boolean`; and if it's truthy, `isAdmin` also won't be a `boolean`. That kind of code is quite common, but it's definitely dangerous that the assumed resultant `boolean` types aren't actually there. We'll revisit this example, and these operators, in the next chapter.

Are these kinds of statements/expressions (e.g., `if (..)`, `||`, `&&`, etc) illustrating *explicit* coercion or *implicit* coercion in their conditional decision making?

Again, I think it depends on your perspective. The specification dictates pretty explicitly that they only make their decisions with `boolean` conditional values, requiring coercion if a non-`boolean` is received. On the other hand, a strong argument can also be made that any internal coercion is a secondary (implicit) effect to the main job of `if` / `&&` / etc.

Further, as mentioned earlier in the `ToBoolean()` discussion, some folks don't consider *any* activation of `ToBoolean()` to be a coercion.

I think that's too much of a stretch, though. My take: `Boolean(..)` is the most preferable *explicit* coercion form. I think `!!`, `if`, `for`, `while`, `&&`, and `||` are all *implicitly* coercing non-`boolean`s, but I'm OK with that.

Since most developers, including famous names like Doug Crockford, also in practice use implicit (`boolean`) coercions in their code[^CrockfordIfs], I think we can say that at least *some forms* of *implicit* coercion are widely acceptable, regardless of the ubiquitous rhetoric to the contrary.

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

| WARNING: |
| :--- |
| An extremely common misconception is that `String(x)` and `x + ""` are basically equivalent coercions, respectively just *explicit* vs *implicit* in form. But, that's not quite true! We'll revisit this in the "To Primitive" section later in this chapter. |

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

Numeric coercions are a bit more complicated than string coercions, since we can be talking about either `number` or `bigint` as the target type. There's also a much smaller set of values that can be validly represented numerically (everything else becomes `NaN`).

Let's start with the `Number(..)` and `BigInt(..)` functions (no `new` keywords):

```js
Number("42");                   // 42
Number("-3.141596");            // -3.141596
Number("-0");                   // -0

BigInt("42");                   // 42n
BigInt("-0");                   // 0n
```

`Number` coercion which fails (not recognized) results in `NaN` (see "Invalid Number" in Chapter 1), whereas `BigInt` throws an exception:

```js
Number("123px");                // NaN

BigInt("123px");
// SyntaxError: Cannot convert 123px to a BigInt
```

Moreover, even though `42n` is valid syntax as a literal `bigint`, the string `"42n"` is never a recognized string representation of a `bigint`, by either of the coercive function forms:

```js
Number("42n");                  // NaN

BigInt("42n");
// SyntaxError: Cannot convert 42n to a BigInt
```

However, we *can* coerce numeric strings with other representations of the numbers than typical base-10 decimals (see Chapter 1 for more information):

```js
Number("0b101010");             // 42

BigInt("0b101010");             // 42n
```

Typically, `Number(..)` and `BigInt(..)` receive string values, but that's not actually required. For example, `true` and `false` coerce to their typical numeric equivalents:

```js
Number(true);                   // 1
Number(false);                  // 0

BigInt(true);                   // 1n
BigInt(false);                  // 0n
```

You can also generally coerce between `number` and `bigint` types:

```js
Number(42n);                    // 42
Number(42n ** 1000n);           // Infinity

BigInt(42);                     // 42n
```

We can also use the `+` unary operator, which is commonly assumed to coerce the same as the `Number(..)` function:

```js
+"42";                          // 42
+"0b101010";                    // 42
```

Be careful though. If the coercions are unsafe/invalid in certain ways, exceptions are thrown:

```js
BigInt(3.141596);
// RangeError: The number 3.141596 cannot be converted to a BigInt

+42n;
// TypeError: Cannot convert a BigInt value to a number
```

Clearly, `3.141596` does not safely coerce to an integer, let alone a `bigint`.

But `+42n` throwing an exception is an interesting case. By contrast, `Number(42n)` works fine, so it's a bit surprising that `+42n` fails.

| WARNING: |
| :--- |
| That surprise is especially palpable since prepending a `+` in front of a number is typically assumed to just mean a "positive number", the same way `-` in front a number is assumed to mean a "negative number". As explained in Chapter 1, however, JS numeric syntax (`number` and `bigint`) recognize no syntax for "negative values". All numeric literals are parsed as "positive" by default. If a `+` or `-` is prepended, those are treated as unary operators applied against the parsed (positive) number. |

OK, so `+42n` is parsed as `+(42n)`. But still... why is `+` throwing an exception here?

You might recall earlier when we showed that JS allows *explicit* string coercion of symbol values, but disallows *implicit* string coercions? The same thing is going on here. JS language design interprets unary `+` in front of a `bigint` value as an *implicit* `ToNumber()` coercion (thus disallowed!), but `Number(..)` is interpreted as an *explicit* `ToNumber()` coercion (thus allowed!).

In other words, contrary to popular assumption/assertion, `Number(..)` and `+` are not interchangable. I think `Number(..)` is the safer/more reliable form.

#### Mathematical Operations

Mathematical operators (e.g., `+`, `-`, `*`, `/`, `%`, and `**`) expect their operands to be numeric. If you use a non-`number` with them, that value will be coerced to a `number` for the purposes of the mathematical computation.

Similar to how `x + ""` is an idiom for coercing `x` to a string, an expression like `x - 0` safely coerces `x` to a number.

| WARNING: |
| :--- |
| `x + 0` isn't quite as safe, since the `+` operator is overloaded to perform string concatenation if either operand is already a string. The `-` minus operator isn't overloaded like that, so the only coercion will be to `number`. Of course, `x * 1`, `x / 1`, and even `x ** 1` would also generally be equivalent mathematically, but those are much less common, and probably should be avoided as likely confusing to readers of your code. Even `x % 1` seems like it should be safe, but it can introduce floating-point skew (see "Floating Point Imprecision" in Chapter 2). |

Regardless of what mathematical operator is used, if the coercion fails, a `NaN` is the result, and all of these operators will propagate the `NaN` out as their result.

#### Bitwise Operations

Bitwise operators (e.g., `|`, `&`, `^`, `>>`, `<<`, and `<<<`) all expect number operands, but specifically they clamp these values to 32-bit integers.

If you're sure the numbers you're dealing with are safely within the 32-bit integer range, `x | 0` is another common expression idiom that has the effect of coercing `x` to a `number` if necessary.

Moreover, since JS engines know these values will be integers, there's potential for them to optimize for integer-only math if they see `x | 0`. This is one of several recommended "type annotations" from the ASM.js[^ASMjs] efforts from years ago.

#### Property Access

Property access of objects (and index access of arrays) is another place where implicit coercion can occur.

Consider:

```js
myObj = {};

myObj[3] = "hello";
myObj["3"] = "world";

console.log( myObj );
```

What do you expect from the contents of this object? Do you expect two different properties, numeric `3` (holding `"hello"`) and string `"3"` (holding `"world"`)? Or do you think both properties are in the same location?

If you try that code, you'll see that indeed we get an object with a single property, and it holds the `"world"` value. That means that JS is internally coercing either the `3` to `"3"`, or vice versa, when those properties accesses are made.

Interestingly, the developer console may very well represent the object sort of like this:

```js
console.log( myObj );
// {3: 'world'}
```

Does that `3` there indicate the property is a numeric `3`? Not quite. Try adding another property to `myObj`:

```js
myObj.something = 42;

console.log( myObj )
// {3: 'world', something: 42}
```

We can see that this developer console doesn't quote string property keys, so we can't infer anything from `3` versus if the console had used `"3"` for the key name.

Let's instead try consulting the specification for the object value[^ObjectValue], where we find:

> A property key value is either an ECMAScript String value or a Symbol value. All String and Symbol values, including the empty String, are valid as property keys. A property name is a property key that is a String value.

OK! So, in JS, objects only hold string (or symbol) properties. That must mean that the numeric `3` is coerced to a string `"3"`, right?

In the same section of the specification, we further read:

> An integer index is a String-valued property key that is a canonical numeric String (see 7.1.21) and whose numeric value is either +0𝔽 or a positive integral Number ≤ 𝔽(253 - 1). An array index is an integer index whose numeric value i is in the range +0𝔽 ≤ i < 𝔽(232 - 1).

If a property key (like `"3"`) *looks* like a number, it's treated as an integer index. Hmmm... that almost seems to suggest the opposite of what we just posited, right?

Nevertheless, we know from the previous quote that property keys are *only* strings (or symbols). So it must be that "integer index" here is not describing the actual location, but rather the intentional usage of `3` in JS code, as a developer-expressed "integer index"; JS must still then actually store it at the location of the "canonical numeric String".

Consider attempts to use other value-types, like `true`, `null`, `undefined`, or even non-primitives (other objects):

```js
myObj[true] = 100;
myObj[null] = 200;
myObj[undefined] = 300;
myObj[ {a:1} ] = 400;

console.log(myObj);
// {3: 'world', something: 42, true: 100, null: 200,
// undefined: 300, [object Object]: 400}
```

As you can see, all of those other value-types were coerced to strings for the purposes of object property names.

But before we convince ourselves of this interpretation that everything (even numbers) is coerced to strings, let's look at an array example:

```js
myArr = [];

myArr[3] = "hello";
myArr["3"] = "world";

console.log( myArr );
// [empty × 3, 'world']
```

The developer console will likely represent an array a bit differently than a plain object. Nevertheless, we still see that this array only has the single `"world"` value in it, at the numeric index position corresponding to `3`.

That kind of output sort of implies the opposite of our previous interpretation: that the values of an array are being stored only at numeric positions. If we add another string property-name to `myArr`:

```js
myArr.something = 42;
console.log( myArr );
// [empty × 3, 'world', something: 42]
```

Now we see that this developer console represents the numerically indexed positions in the array *without* the property names (locations), but the `something` property is named in the output.

It's also true that JS engines like v8 tend to, for performance optimization reasons, special-case object properties that are numeric-looking strings as actually being stored in numeric positions as if they were arrays. So even if the JS program acts as if the property name is `"3"`, in fact under the covers, v8 might be treating it as if coerced to `3`!

What can take from all this?

The specification clearly tells us that the behavior of object properties is for them to be treated like strings (or symbols). That means we can assume that using `3` to access a location on an object will have the internal effect of coercing that property name to `"3"`.

But with arrays, we observe a sort of opposite semantic: using `"3"` as a property name has the effect of accessing the numerically indexed `3` position, as if the string was coerced to the number. But that's mostly just an offshot of the fact that arrays always tend to behave as numerically indexed, and/or perhaps a reflection of underlying implementation/optimization details in the JS engine.

The important part is, we need to recognize that objects cannot simply use any value as a property name. If it's anything other than a string or a number, we can expect that there *will be* a coercion of that value.

We need to expect and plan for that rather than allowing it to surprise us with bugs down the road!

### To Primitive

Most operators in JS, including those we've seen with coercions to `string` and `number`, are designed to run against primitive values. When any of these operators is used instead against an object value, the abstract `ToPrimitive` algorithm (as described earlier) is activated to coerce the object to a primitive.

Let's set up an object we can use to inspect how different operations behave:

```js
spyObject = {
    toString() {
        console.log("toString() invoked!");
        return "10";
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return 42;
    },
};
```

This object defines both the `toString()` and `valueOf()` methods, and each one returns a different type of value (`string` vs `number`).

Let's try some of the coercion operations we've already seen:

```js
String(spyObject);
// toString() invoked!
// "10"

spyObject + "";
// valueOf() invoked!
// "42"
```

Whoa! I bet that surprised a few of you readers; it certainly did me. It's so common for people to assert that `String(..)` and `+ ""` are equivalent forms of activating the `ToString()` operation. But they're clearly not!

The difference comes down to the *hint* that each operation provides to `ToPrimitive()`. `String(..)` clearly provides `"string"` as the *hint*, whereas the `+ ""` idiom provides no *hint* (similar to *hinting* `"number"`). But don't miss this detail: even though `+ ""` invokes `valueOf()`, when that returns a `number` primitive value of `42`, that value is then coerced to a string (via `ToString()`), so we get `"42"` instead of `42`.

Let's keep going:

```js
Number(spyObject);
// valueOf() invoked!
// 42

+spyObject;
// valueOf() invoked!
// 42
```

This example implies that `Number(..)` and the unary `+` operator both perform the same `ToPrimitive()` coercion (with *hint* of `"number"`), which in our case returns `42`. Since that's already a `number` as requested, the value comes out without further ado.

But what if a `valueOf()` returns a `bigint`?

```js
spyObject2 = {
    valueOf() {
        console.log("valueOf() invoked!");
        return 42n;  // bigint!
    }
};

Number(spyObject2);
// valueOf() invoked!
// 42     <--- look, not a bigint!

+spyObject2;
// valueOf() invoked!
// TypeError: Cannot convert a BigInt value to a number
```

We saw this difference earlier in the "To Number" section. JS allows an *explicit* coercion of the `42n` bigint value to the `42` number value, but it disallows what it considers to be an *implicit* coercion form.

What about the `BigInt(..)` (no `new` keyword) coercion function?

```js
BigInt(spyObject);
// valueOf() invoked!
// 42n    <--- look, a bigint!

BigInt(spyObject2);
// valueOf() invoked!
// 42n

// *******************************

spyObject3 = {
    valueOf() {
        console.log("valueOf() invoked!");
        return 42.3;
    }
};

BigInt(spyObject3);
// valueOf() invoked!
// RangeError: The number 42.3 cannot be converted to a BigInt
```

Again, as we saw in the "To Number" section, `42` can safely be coerced to `42n`. On the other hand, `42.3` cannot safely be coerced to a `bigint`.

We've seen that `toString()` and `valueOf()` are invoked, variously, as certain `string` and `number` / `bigint` coercions are performed.

#### No Primitive Found?

If `ToPrimitive()` fails to produce a primitive value, an exception will be thrown:

```js
spyObject4 = {
    toString() {
        console.log("toString() invoked!");
        return [];
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return {};
    }
};

String(spyObject4);
// toString() invoked!
// valueOf() invoked!
// TypeError: Cannot convert object to primitive value

Number(spyObject4);
// valueOf() invoked!
// toString() invoked!
// TypeError: Cannot convert object to primitive value
```

If you're going to define custom to-primitive coercions via `toString()` / `valueOf()`, make sure to return a primitive from at least one of them!

#### Object To Boolean

What about `boolean` coercions of objects?

```js
Boolean(spyObject);
// true

!spyObject;
// false

if (spyObject) {
    console.log("if!");
}
// if!

result = spyObject ? "ternary!" : "nope";
// "ternary!"

while (spyObject) {
    console.log("while!");
    break;
}
// while!
```

Each of these are activating `ToBoolean()`. But if you recall from earlier, *that* algorithm never delegates to `ToPrimitive()`; thus, we don't see "valueOf() invoked!" being logged out.

#### Unboxing: Wrapper To Primitive

A special form of objects that are often `ToPrimitive()` coerced: boxed/wrapped primitives (as seen in Chapter 3). This particular object-to-primitive coercion is often referred to as *unboxing*.

Consider:

```js
hello = new String("hello");
String(hello);                  // "hello"
hello + "";                     // "hello"

fortyOne = new Number(41);
Number(fortyOne);               // 41
fortyOne + 1;                   // 42
```

The object wrappers `hello` and `fortyOne` above have `toString()` and `valueOf()` methods configured on them, to behave similarly to the `spyObject` / etc objects from our previous examples.

A special case to be careful of with wrapped-object primitives is with `Boolean()`:

```js
nope = new Boolean(false);
Boolean(nope);                  // true   <--- oops!
!!nope;                         // true   <--- oops!
```

Remember, this is because `ToBoolean()` does *not* reduce an object to its primitive form with `ToPrimitive`; it merely looks up the value in its internal table, and since normal (non-exotic[^ExoticFalsyObjects]) objects are always truthy, `true` comes out.

| NOTE: |
| :--- |
| It's a nasty little gotcha. A case could certainly be made that `new Boolean(false)` should configure itself internally as an exotic "falsy object". [^ExoticFalsyObjects] Unfortunately, that change now, 25 years into JS's history, could easily create breakage in programs. As such, JS has left this gotcha untouched. |

#### Overriding Default `toString()`

As we've seen, you can always define a `toString()` on an object to have *it* invoked by the appropriate `ToPrimitive()` coercion. But another option is to override the `Symbol.toStringTag`:

```js
spyObject5a = {};
String(spyObject5a);
// "[object Object]"
spyObject5a.toString();
// "[object Object]"

spyObject5b = {
    [Symbol.toStringTag]: "my-spy-object"
};
String(spyObject5b);
// "[object my-spy-object]"
spyObject5b.toString();
// "[object my-spy-object]"

spyObject5c = {
    get [Symbol.toStringTag]() {
        return `myValue:${this.myValue}`;
    },
    myValue: 42
};
String(spyObject5c);
// "[object myValue:42]"
spyObject5c.toString();
// "[object myValue:42]"
```

`Symbol.toStringTag` is intended to define a custom string value to describe the object whenever its default `toString()` operation is invoked directly, or implicitly via coercion; in its absence, the value used is `"Object"` in the common `"[object Object]"` output.

The `get ..` syntax in `spyObject5c` is defining a *getter*. That means when JS tries to access this `Symbol.toStringTag` as a property (as normal), this getter code instead causes the function we specify to be invoked to compute the result. We can run any arbitrary logic inside this getter to dynamically determine a string *tag* for use by the default `toString()` method.

#### Overriding `ToPrimitive`

You can alternately override the whole default `ToPrimitive()` operation for any object, by setting the special symbol property `Symbol.toPrimitive` to hold a function:

```js
spyObject6 = {
    [Symbol.toPrimitive](hint) {
        console.log(`toPrimitive(${hint}) invoked!`);
        return 25;
    },
    toString() {
        console.log("toString() invoked!");
        return "10";
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return 42;
    },
};

String(spyObject6);
// toPrimitive(string) invoked!
// "25"   <--- not "10"

spyObject6 + "";
// toPrimitive(default) invoked!
// "25"   <--- not "42"

Number(spyObject6);
// toPrimitive(number) invoked!
// 25     <--- not 42 or "25"

+spyObject6;
// toPrimitive(number) invoked!
// 25
```

As you can see, if you define this function on an object, it's used entirely in replacement of the default `ToPrimitive()` abstract operation. Since `hint` is still provided to this invoked function (`[Symbol.toPrimitive](..)`), you could in theory implement your own version of the algorithm, invoking a `toString()`, `valueOf()`, or any other method on the object (`this` context reference).

Or you can just manually define a return value as shown above. Regardless, JS will *not* automatically invoke either `toString()` or `valueOf()` methods.

| WARNING: |
| :--- |
| As discussed prior in "No Primitive Found?", if the defined `Symbol.toPrimitive` function does not actually return a value that's a primitive, an exception will be thrown about being unable to "...convert object to primitive value". Make sure to always return an actual primitive value from such a function! |

### Equality

Thus far, the coercions we've seen have been focused on single values. We turn out attention now to equality comparisons, which inherently involve two values, either or both of which may be subject to coercion.

Earlier in this chapter, we talked about several abstract operations for value equality comparison.

For example, the `SameValue()` operation[^SameValue] is the strictest of the equality comparisons, with absolutely no coercion. The most obvious JS operation that relies on `SameValue()` is:

```js
Object.is(42,42);                   // true
Object.is(-0,-0);                   // true
Object.is(NaN,NaN);                 // true

Object.is(0,-0);                    // false
```

The `SameValueZero()` operation -- recall, it only differs from `SameValue()` by treating `-0` and `0` as indistinguishable -- is used in quite a few more places, including:

```js
[ 1, 2, NaN ].includes(NaN);        // true
```

We can see the `0` / `-0` misdirection of `SameValueZero()` here:

```js
[ 1, 2, -0 ].includes(0);           // true  <--- oops!

(new Set([ 1, 2, 0 ])).has(-0);     // true  <--- ugh

(new Map([[ 0, "ok" ]])).has(-0);   // true  <--- :(
```

In these cases, there's a *coercion* (of sorts!) that treats `-0` and `0` as indistinguishable. No, that's not technically a "coercion" in that the type is not being changed, but I'm sort of fudging the definition to *include* this case in our broader discussion of coercion here.

Contrast the `includes()` / `has()` methods here, which activate `SameValueZero()`, with the good ol' `indexOf(..)` array utility, which instead activates `IsStrictlyEqual()` instead. This algorithm is slightly more "coercive" than `SameValueZero()`, in that it prevents `NaN` values from ever being treated as equal to each other:

```js
[ 1, 2, NaN ].indexOf(NaN);         // -1  <--- not found
```

If these nuanced quirks of `includes(..)` and `indexOf(..)` bother you, when searching -- looking for an equality match within -- for a value in an array, you can avoid any "coercive" quicks and *force* the strictest `SameValue()` equality matching, via `Object.is(..)`:

```js
vals = [ 0, 1, 2, -0, NaN ];

vals.find(v => Object.is(v,-0));            // -0
vals.find(v => Object.is(v,NaN));           // NaN

vals.findIndex(v => Object.is(v,-0));       // 3
vals.findIndex(v => Object.is(v,NaN));      // 4
```

#### Equality Operators: `==` vs `===`

The most obvious place where *coercion* is involved in equality checks is with the `==` operator. Despite any pre-conceived notions you may have about `==`, it behaves extremely predictably, ensuring that both operands match types before performing its equality check.

To state something that may or may not be super obvious: the `==` (and `===`) operators always return a `boolean` (`true` or `false`), indicating the result of the equality check; they never return anything else, regardless of what coercion may happen.

Now, recall and review the steps discussed earlier in the chapter for the `IsLooselyEqual()` operation. [^LooseEquality] Its behavior, and thus how `==` acts, can be pragmatically intuited with just these two facts in mind:

1. If the types of both operands are the same, `==` has the exact same behavior as `===` -- `IsLooselyEqual()` immediately delegates to `IsStrictlyEqual()`. [^StrictEquality]

    For example, when both operands are object references:

    ```js
    myObj = { a: 1 };
    anotherObj = myObj;

    myObj == anotherObj;                // true
    myObj === anotherObj;               // true
    ```

    Here, `==` and `===` determine that both of their respective operands are of the `object` reference type, so both equality checks behave identically; they compare the object references for equality.

2. But if the operand types differ, `==` allows coercion until they match, and prefers numeric comparison; it attempts to coerce both operands to numbers, if possible:

    ```js
    42 == "42";                         // true
    ```

    Here, the `"42"` string is coerced to a `42` number (not vice versa), and thus the comparison is then `42 == 42`, and must clearly return `true`.


Armed with this knowledge, we'll now dispel the common myth that only `===` checks the type and value, while `==` checks only the value. Not true!

In fact, `==` and `===` are both type-sensitive, each checking the types of their operands. The `==` operator allows coercion of mismatched types, whereas `===` disallows any coercion.

It's a nearly universally held opinion that `==` should be avoided in favor of `===`. I may be one of the only developers who publicly advocates a clear and straight-faced case for the opposite. I think the main reason people instead prefer `===`, beyond simply conforming to the status quo, is a lack of taking the time to actually understand `==`.

I'll be revisiting this topic to make the case for preferring `==` over `===`, later in this chapter, in "Type Aware Equality". All I ask is, no matter how strongly you currently disagree with me, try to keep an open mindset.

#### Nullish Coercion

We've already seen a number of JS operations that are nullish -- treating `null` and `undefined` as coercively equal to each other, including the `?.` optional-chaining operator and the `??` nullish-coalescing operator (see "Null'ish" in Chapter 1).

But `==` is the most obvious place that JS exposes nullish coercive equality:

```js
null == undefined;              // true
```

Neither `null` nor `undefined` will ever be coercively equal to any other value in the language, other than to each other. That means `==` makes it ergonomic to treat these two values as indistinguishable.

You might take advantage of this capability as such:

```js
if (someData == null) {
    // `someData` is "unset" (either null or undefined),
    // so set it to some default value
}

// OR:

if (someData != null) {
    // `someData` is set (neither null nor undefined),
    // so use it somehow
}
```

Remember that `!=` is the negation of `==`, whereas `!==` is the negation of `===`. Don't match the count of `=`s unless you want to confuse yourself!

Compare these two approaches:

```js
if (someData == null) {
    // ..
}

// vs:

if (someData === null || someData === undefined) {
    // ..
}
```

Both `if` statements will behave exactly identically. Which one would you rather write, and which one would you rather read later?

To be fair, some of you prefer the more verbose `===` equivalent. And that's OK. I disagree, I think the `==` version of this check is *much* better. And I also maintain that the `==` version is more consistent in stylistic spirit with how the other nullish operators like `?.` and `??` act.

But another minor fact you might consider: in performance benchmarks I've run many times, JS engines can perform the single `== null` check as shown *slightly faster* than the combination of two `===` checks. In other words, there's a tiny but measurable benefit to letting JS's `==` perform the *implicit* nullish coercion than in trying to *explicitly* list out both checks yourself.

I'd observe that even many diehard `===` fans tend to concede that `== null` is at least one such case where `==` is preferable.

#### `==` Boolean Gotcha

Aside from some coercive corner cases we'll address in the next section, probably the biggest gotcha to be aware of with `==` has to do with booleans.

Pay very close attention here, as it's one of the biggest reasons people get bitten by, and then come to despise, `==`. If you take my simple advice (at the end of this section), you'll never be a victim!

Consider the following snippet, and let's assume for a minute that `isLoggedIn` is *not* holding a `boolean` value (`true` or `false`):

```js
if (isLoggedIn) {
    // ..
}

// vs:

if (isLoggedIn == true) {
    // ..
}
```

We've already covered the first `if` statement form. We know `if` expects a `boolean`, so in this case `isLoggedIn` will be coerced to a `boolean` using the lookup table in the `ToBoolean()` abstract operation. Pretty straightforward to predict, right?

But take a look at the `isLoggedIn == true` expression. Do you think it's going to behave the same way?

If your instinct was *yes*, you've just fallen into a tricky little trap. Recall early in this chapter when I warned that the rules of `ToBoolean()` coercion only apply if the JS operation is actually activating that algorithm. Here, it seems like JS must be doing so, because `== true` seems so clearly a "boolean related" type of comparison.

But nope. Go re-read the `IsLooselyEqual()` algorithm (for `==`) earlier in the chapter. Go on, I'll wait. If you don't like my summary, go read the specification algorithm[^LooseEquality] itself.

OK, do you see anything in there that mentions invoking `ToBoolean()` under any circumstance?

Nope!

Remember: when the types of the two `==` operands are not the same, it prefers to coerce them both to numbers.

What might be in `isLoggedIn`, if it's not a `boolean`? Well, it could be a string value like `"yes"`, for example. In that form, `if ("yes") { .. }` would clearly pass the conditional check and execute the block.

But what's going to happen with the `==` form of the `if` conditional? It's going to act like this:

```js
// (1)
"yes" == true

// (2)
"yes" == 1

// (3)
NaN == 1

// (4)
NaN === 1           // false
```

So in other words, if `isLoggedIn` holds a value like `"yes"`, the `if (isLoggedIn) { .. }` block will pass the conditional check, but the `if (isLoggedIn == true)` check will not. Ugh!

What if `isLoggedIn` held the string `"true"`?

```js
// (1)
"true" == true

// (2)
"true" == 1

// (3)
NaN == 1

// (4)
NaN === 1           // false
```

Facepalm.

Here's a pop quiz: what value would `isLoggedIn` need to hold for both forms of the `if` statement conditional to pass?

...

...

...

...

What if `isLoggedIn` was holding the number `1`? `1` is truthy, so the `if (isLoggedIn)` form passes. And the other `==` form that involves coercion:

```js
// (1)
1 == true

// (2)
1 == 1

// (3)
1 === 1             // true
```

But if `isLoggedIn` was instead holding the string `"1"`? Again, `"1"` is truthy, but what about the `==` coercion?

```js
// (1)
"1" == true

// (2)
"1" == 1

// (3)
1 == 1

// (4)
1 === 1             // true
```

OK, so `1` and `"1"` are two values that `isLoggedIn` can hold that are safe to coerce along with `true` in a `==` equality check. But basically almost no other values are safe for `isLoggedIn` to hold.

We have a similar gotcha if the check is `== false`. What values are safe in such a comparison? `""` and `0` work. But:

```js
if ([] == false) {
    // this will run!
}
```

`[]` is a truthy value, but it's also coercively equal to `false`?! Ouch.

What are we to make of these gotchas with `== true` and `== false` checks? I have a plain and simple answer.

Never, ever, under any circumstances, perform a `==` check if either side of the comparison is a `true` or `false` value. It looks like it's going to behave as a nice `ToBoolean()` coercion, but it slyly won't, and will instead be ensnared in a variety of coercion corner cases (addressed in the next section). And avoid the `===` forms, too.

When you're dealing with booleans, stick to the implicitly coercive forms that are genuinely activating `ToBoolean()`, such as `if (isLoggedIn)`, and stay away from the `==` / `===` forms.

## Coercion Corner Cases

I've been clear in expressing my pro-coercion opinion thus far. And it *is* just an opinion, though it's based on interpreting facts gleaned from studying the language specification and observable JS behaviors.

That's not to say that coercion is perfect. There's several frustrating corner cases we need to be aware of, so we avoid tripping into those potholes. In case it's not clear, my following characterizations of these corner cases are just more of my opinions. Your mileage may vary.

### Strings

We already saw that the string coercion of an array looks like this:

```js
String([ 1, 2, 3 ]);                // "1,2,3"
```

I personally find that super annoying, that it doesn't include the surrounding `[ ]`. In particular, that leads to this absurdity:

```js
String([]);                         // ""
```

So we can't tell that it's even an array, because all we get is an empty string? Great, JS. That's just stupid. Sorry, but it is. And it gets worse:

```js
String([ null, undefined ]);        // ","
```

WAT!? We know that `null` coerces to the string `"null"`, and `undefined` coerces to the string `"undefined"`. But if those values are in an array, they magically just *disappear* as empty strings in the array-to-string coercion. Only the `","` remains to even hint to us there was anything at all in the array! That's just silly town, right there.

What about objects? Almost as aggravating, though in the opposite direction:

```js
String({});                         // "[object Object]"

String({ a: 1 });                   // "[object Object]"
```

Umm... OK. Sure, thanks JS for no help at all in understanding what the object value is.

### Numbers

I'm about to reveal what I think is *the* worst root of all coercion corner case evil. Are you ready for it?!?

```js
Number("");                         // 0
Number("       ");                  // 0
```

I'm still shaking my head at this one, and I've known about it for nearly 20 years. I still don't get what Brendan was thinking with this one.

The empty string is devoid of any contents; it has nothing in it with which to determine a numeric representation. `0` is absolutely ***NOT*** the numeric equivalent of missing/invalid numeric value. You know what number value we have that is well-suited to communicate that? `NaN`. Don't even get me started on how whitespace is stripped from strings when coercing to a number, so the very-much-not-empty `"       "` string is still treated the same as `""` for numeric coercion purposes.

Even worse, recall how `[]` coerces to the string `""`? By extension:

```js
Number([]);                         // 0
```

Doh! If `""` didn't coerce to `0` -- remember, this is the root of all coercion evil! --, then `[]` wouldn't coerce to `0` either.

This is just absurd, upside-down universe territory.

Much more tame, but still mildly annoying:

```js
Number("NaN");                      // NaN  <--- accidental!

Number("Infinity");                 // Infinity
Number("infinity");                 // NaN  <--- oops, watch case!
```

The string `"NaN"` is not parsed as a recognizable numeric value, so the coercion fails, producing (accidentally!) the `NaN` value. `"Infinity"` is explicitly parseable for the coercion, but any other casing, including `"infinity"`, will fail, again producing `NaN`.

This next example, you may not think is a corner case at all:

```js
Number(false);                      // 0
Number(true);                       // 1
```

It's merely programmer convention, legacy from languages that didn't originally have boolean `true` and `false` values, that we treat `0` as `false`, and `1` as `true`. But does it *really* make sense to go the other direction?

Think about it this way:

```js
false + true + false + false + true;        // 2
```

Really? I don't think there's any case where treating a `boolean` as its `number` equivalent makes any rational sense in a program. I can understand the reverse, for historical reasons: `Boolean(0)` and `Boolean(1)`.

But I genuniely feel that `Number(false)` and `Number(true)` (as well as any implicit coercion forms) should produce `NaN`, not `0` / `1`.

### Coercion Absurdity

To prove my point, let's take the absurdity up to level 11:

```js
[] == ![];                          // true
```

How!? That seems beyond credibility that a value could be coercively equal to its negation, right!?

But follow down the coercion rabbit hole:

1. `[] == ![]`
2. `[] == false`
3. `"" == false`
4. `0 == false`
5. `0 == 0`
6. `0 === 0`  ->  `true`

We've got three different absurdities conspiring against us: `String([])`, `Number("")`, and `Number(false)`; if any of these weren't true, this nonsense corner case outcome wouldn't occur.

Let me make something absolutely clear, though: none of this is `==`'s fault. It gets the blame here, of course. But the real culprits are the underlying `string` and `number` corner cases.

## Type Awareness

We've now sliced and diced and examined coercion from every conceivable angle, starting from the abstract internals of the specification, then moving to the concrete expressions and statements that actually trigger the coercions.

But what's the point of all this? Is the detail in this chapter, and indeed this whole book up to this point, mostly just trivia? Eh, I don't think so.

Let's return to the observations/questions I posed way back at the beginning of this long chapter.

There's no shortage of opinions (especially negative) about coercion. The nearly universally held position is that coercion is mostly/entirely a *bad part* of JS's language design. But inspite of that reality, most every developer, in most every JS program ever written, faces the reality that coercion cannot be avoided.

In other words, no matter what you do, you won't be able to get away from the need to be aware of, understand, and manage JS's value-types and the conversions them. Contrary to common assumptions, embracing a dynamically-typed (or even a weakly-typed) language, does *not* mean being careless or unaware of types.

Type-aware programming is always, always better than type ignorant/agnostic programming.

### Uhh... TypeScript?

Surely you're thinking at this moment: "Why can't I just use TypeScript and declare all my types statically, avoiding all the confusion of dynamic typing and coercion?"

| NOTE: |
| :--- |
| I have many more detailed thoughts on TypeScript and the larger role it plays in our ecosystem; I'll save those opinions for the appendix ("Thoughts on TypeScript"). |

Let's start by addressing head on the ways TypeScript does, and does not, aid in type-aware programming, as I'm advocating.

TypeScript is both **statically-typed** (meaning types are declared at author time and checked at compile-time) and **strongly-typed** (meaning variables/containers are typed, and these associations are enforced; strongly-typed systems also disallow *implicit* coercion). The greatest strength of TypeScript is that it typically forces both the author of the code, and the reader of the code, to confront the types comprising most (ideally, all!) of a program. That's definitely a good thing.

By contrast, JS is **dynamically-typed** (meaning types are discovered and managed purely at runtime) and **weakly-typed** (meaning variables/containers are not typed, so there's no associations to enforce, and variables can thus hold any value-types; weakly-typed systems allow any form of coercion).

| NOTE: |
| :--- |
| I'm hand-waving at a pretty high level here, and intentionally not diving deeply into lots of nuance on the static/dynamic and strong/weak typing spectrums. If you're feeling the urge to "Well, actually..." me at this moment, please just hold on a bit and let me lay out my arguments. |

### Type-Awareness *Without* TypeScript

Does a dynamically-typed system automatically mean you're programming with less type-awareness? Many would argue that, but I disagree.

I do not at all think that declaring static types (annotations, as in TypeScript) is the only way to accomplish effective type-awareness. Clearly, though, proponents of static-typing believe that is the *best* way.

Let me illustrate type-awareness without TypeScript's static typing. Consider this variable declaration:

```js
let API_BASE_URL = "https://some.tld/api/2";
```

Is that statement in any way *type-aware*? Sure, there's no `: string` annotation after `API_BASE_URL`. But I definitely think it *is* still type-aware! We clearly see the value-type (`string`) of the value being assigned to `API_BASE_URL`.

| WARNING: |
| :--- |
| Don't get distracted by the `let` declaration being re-assignable (as opposed to a `const`). JS's `const` is *not* a first-class feature of its type system. We don't really gain additional type-awareness simply because we know that reassignment of a `const` variable is disallowed by the JS engine. If the code is structured well -- ahem, structured with type-awareness as a priority -- we can just read the code and see clearly that `API_BASE_URL` is *not* reassigned and is thus still the value-type it was previously assigned. From a type-awareness perspective, that's effectively the same thing as if it *couldn't* be reassigned. |

If I later want to do something like:

```js
// are we using the secure API URL?
isSecureAPI = /^https/.test(API_BASE_URL);
```

I know the regular-expression `test(..)` method expects a string, and since I know `API_BASE_URL` is holding a string, I know that operation is type-safe.

Similarly, since I know the simple rules of `ToBoolean()` coercion as it relates to string values, I know this kind of statement is also type-safe:

```js
// do we have an API URL determined yet?
if (API_BASE_URL) {
    // ..
}
```

But if later, I start to type something like this:

```js
APIVersion = Number(API_BASE_URL);
```

A warning siren triggers in my head. Since I know there's some very specific rules about how string values coerce to numbers, I recognize that this operation is **not** type-safe. So I instead approach it differently:

```js
// pull out the version number from API URL
versionDigit = API_BASE_URL.match(/\/api\/(\d+)$/)[1];

// make sure the version is actually a number
APIVersion = Number(versionDigit);
```

I know that `API_BASE_URL` is a string, and I further know the format of its contents includes `".../api/{digits}"` at the end. That lets me know that the regular expression match will succeed, so the `[1]` array access is type-safe.

I also know that `versionDigit` will hold a string, because that's what regular-expression matches return. Now, I know it's safe to coerce that numeric-digit string into a number with `Number(..)`.

By my definition, that kind of thinking, and that style of coding, is type-aware. Type-awareness in coding means thinking carefully about whether or not such things will be *clear* and *obvious* to the reader of the code.

### Type-Awareness *With* TypeScript

TypeScript fans will point out that TypeScript can, via type inference, do static typing (enforcement) without ever needing a single type annotation in the program. So all the code examples I shared in the previous section, TypeScript can also handle, and provide its flavor of compile-time static type enforcement.

In other words, TypeScript will give us the same kind of benefit in type checking, whichever of these two we write:

```ts
let API_BASE_URL: string = "https://some.tld/api/2";

// vs:

let API_BASE_URL = "https://some.tld/api/2";
```

But there's no free-lunch. We have some issues we need to confront. First of all, TypeScript does *not* trigger an error here:

```js
API_BASE_URL = "https://some.tld/api/2";

APIVersion = Number(API_BASE_URL);
// NaN
```

Intuitively, *I* want a type-aware system to understand why that's unsafe. But maybe that's just too much to ask. Or perhaps if we actually define a more narrow/specific type for that `API_BASE_URL` variable, than simply `string`, it might help? We can use a TypeScript trick called "Template Literal Types": [^TSLiteralTypes]

```ts
type VersionedURL = `https://some.tld/api/${number}`;

API_BASE_URL: VersionedURL = "https://some.tld/api/2";

APIVersion = Number(API_BASE_URL);
// NaN
```

Nope, TypeScript still doesn't see any problem with that. Yes, I know there's an explanation for why (how `Number(..)` itself is typed).

| NOTE: |
| :--- |
| I imagine the really smart folks who *know* TypeScript well have creative ideas on how we can contort ourselves into raising an error there. Maybe there's even a dozen different ways to force TypeScript to trigger on that code. But that's not really the point. |

My point is, we cannot fully rely on TypeScript types to solve all our problems, letting us check out and remain blissfully unaware of the nuances of types and, in this case, coercion behaviors.

But! You're surely objecting to this line of argument, desperate to assert that even if TypeScript can't understand some specific situation, surely using TypeScript doesn't make it *worse*! Right!?

Let's look at what TypeScript has to say[^TSExample1] about this line:

```ts
type VersionedURL = `https://some.tld/api/${number}`;

let API_BASE_URL: VersionedURL = "https://some.tld/api/2";

let versionDigit = API_BASE_URL.match(/\/api\/(\d+)$/)[1];
// Object is possibly 'null'.
```

The error indicates that the `[1]` access isn't type-safe, because if the regular expression fails to find any match on the string, `match(..)` returns `null`.

You see, even though *I* can reason about the contents of the string compared to how the regular expression is written, and even if *I* went to the trouble to make it super clear to TypeScript exactly what those specific string contents are, it's not quite smart enough to line those two up to see that it's actually fully type-safe to assume the match happens.

| TIP: |
| :--- |
| Is it really the job of, and best use of, a type-aware tool to be contorted to express every single possible nuance of type-safety? We don't need perfect and universal tools to derive immense amounts of benefit from the stuff they *can* do. |

Moreover, comparing the code style in the previous section to the code in this section (with or without the annotations), is TypeScript actually making our coding more type-aware?

Like, does that `type VersionedURL = ..` and `API_BASE_URL: VersionedURL` stuff *actually* make our code more clearly type-aware? I don't necessarily think so.

### TypeScript Intelligence

Yes, I hear you screaming at me through the computer screen. Yes, I know that TypeScript provides what type information it discovers (or infers) to your code editor, which comes through in the form of intelligent autocompletes, helpful inline warning markers, etc.

But I'm arguing that even *those* don't, in and of themselves, make you more type-aware as a developer

Why? Because type-awareness is *not* just about the authoring experience. It's also about the reading experience, maybe even more so. And not all places/mechanisms where code is read, have access to benefit from all the extra intelligence.

Look, the magic of a language-server pumping intelligence into your code editor is unquestionably amazing. It's cool and super helpful.

And I don't begrudge TypeScript as a tool inferring things about my **JS code** and giving me hints and suggestions through delightful code editor integrations. I just don't necessarily want to *have* to annotate type information in some extremely specific way just to silence the tool's complaints.

### The Bar Above TypeScript

But even if I did/had all that, it's still not ***sufficient*** for me to be fully type-aware, both as a code-author and as a code-reader.

These tools don't catch every type error that can happen, no matter how much we want to tell ourselves they can, and no matter how many hoops and contortions we endure to wish it so. All the efforts to coax and *coerce* a tool into catching those nuanced errors, through endlessly increasing complexity of type syntax tricks, is... at best, misplaced effort.

Moreover, no such tool is immune to false positives, complaining about things which aren't actually errors; these tools will never be as smart as we are as humans. You're really wasting your time in chasing down some quirky syntax trick to quite down the tool's complaints.

There's just no substitute, if you want to truly be a type-aware code-author and code-reader, from learning how the language's built-in type systems work. And yes, that means every single developer on your team needs to spend the efforts to learn it. You can't water this stuff down just to be more attainable for less experienced developers on the project/team.

Even if we granted that you could avoid 100% of all *implicit* coercions -- you can't -- you are absolutely going to face the need to *explicit* coercions -- all programs do!

And if your response to that fact is to suggest that you'll just offload the mental burden of understanding them to a tool like TypeScript... then I'm sorry to tell you, but you're plainly and painfully falling short of the *type-aware* bar that I'm challenging all developers to strive towards.

I'm not advocating, here, for you to ditch TypeScript. If you like it, fine. But I am very explicitly and passionately challenging you: stop using TypeScript as a crutch. Stop prostrating yourself to appease the TypeScript engine overlords. Stop foolishly chasing every type rabbit down every syntactic hole.

From my observation, there's a tragic, inverse relationship between usage of type-aware tooling (like TypeScript) and the desire/effort to pursue actual type-awareness as a code-author and code-reader. The more you rely on TypeScript, the more it seems you're tempted and encouraged to shift your attention away from JS's type system (and especially, from coercion) to the alternate TypeScript type system.

Unfortunately, TypeScript can never fully escape JS's type system, because TypeScript's types are *erased* by the compiler, and what's left is just JS that the JS engine has to contend with.

| TIP: |
| :--- |
| Imagine if someone handed you a cup of filtered water to drink. And just before you took a sip, they said, "We extracted that water from the ground near a waste dump. But don't worry, we used a perfectly great filter, and that water is totally safe!" How much do you trust that filter? More to my overall point, wouldn't you feel more comfortable drinking that water if you understood everything about the source of the water, all the processes of filtration, and everything that was *in* the water of the glass in your hand!? Or is trusting that filter good enough? |

### Type Aware Equality

I'll close this long, winding chapter with one final illustration, modeling how I think developers should -- armed with more critical thinking than bandwagon conformism -- approach type-aware coding, whether you use a tool like TypeScript or not.

We'll yet again revisit equality comparisons (`==` vs `===`), from the perspective of type-awareness. Earlier in this chapter, I promised that I would make the case for `==` over `===`, so here it goes.

Let's restate/summarize what we know about `==` and `===` so far:

1. If the types of the operands for `==` match, it behaves *exactly the same* as `===`.

2. If the types of the operands for `===` do not match, it will always return `false`.

3. If the types of the operands for `==` do not match, it will allow coercion of either operand (generally preferring numeric type-values), until the types finally match; once they match, see (1).

OK, so let's take those facts and analyze how they might interact in our program.

If you are making an equality comparison of `x` and `y` like this:

```js
if ( /* are x and y equal */ ) {
    // ..
}
```

What are the possible conditions we may be in, with respect to the types of `x` and `y`?

1. We might know exactly what type(s) `x` and `y` could be, because we know how those variables are getting assigned.

2. Or we might not be able to tell what those types could be. It could be that `x` or `y` could be any type, or at least any of several different types, such that the possible combinations of types in the comparison are too complex to understand/predict.

Can we agree that (1) is far preferable to (2)? Can we further agree that (1) represents having written our code in a type-aware fashion, whereas (2) represents code that is decidedly type-*unaware*?

If you're using TypeScript, you're very likely to be aware of the types of `x` and `y`, right? Even if you're not using TypeScript, we've already shown that you can take intentional steps to write your code in such a way that the types of `x` and `y` are known and obvious.

#### (2) Unknown Types

If you're in scenario (2), I'm going to assert that your code is in a problem state. Your code is less-than-ideal. Your code needs to be refactored. The best thing to do, if you find code in this state, is... fix it!

Change the code so it's type-aware. If that means using TypeScript, and even inserting some type annotations, do so. Or if you feel you can get to the type-aware state with *just JS*, do that. Either way, do whatever you can to get to scenario (1).

If you cannot ensure the code doing this equality comparison between `x` and `y` is type-aware, and you have no other options, then you absolutely *must* use the `===` strict-equality operator. Not doing so would be supremely irresponsible.

```js
if (x === y) {
    // ..
}
```

If you don't know anything about the types, how could you (or any other future reader of your code) have any idea how the coercive steps in `==` are going to behave!? You can't.

The only responsible thing to do is, avoid coercion and use `===`.

But don't lose sight of this fact: you're only picking `===` as a last resort, when your code is so type-unaware -- ahem, type-broken! -- as to have no other choice.

#### (1) Known Types

OK, let's instead assume you're in scenario (1). You know the types of `x` and `y`. It's very clear in the code what this narrow set of types participating in the equality check can be.

Great!

But there's still two possible sub-conditions you may be in:

* (1a): `x` and `y` might already be of the same type, whether that be both are `string`s, `number`s, etc.

* (1b): `x` and `y` might be of different types.

Let's consider each of these cases individually.

##### (1a) Known Matching Types

If the types in the equality comparison match (whatever they are), we already know for certain that `==` and `===` do exactly the same thing. There's absolutely no difference.

Except, `==` *is* shorter by one character. Most developers feel instinctively that the most terse but equivalent version of something is often most preferable. That's not universal, of course, but it's a general preference at least.

```js
// this is best
if (x == y) {
    // ..
}
```

In this particular case, an extra `=` would do nothing for us to make the code more clear. In fact, it actually would make the comparison worse!

```js
// this is strictly worse here!
if (x === y) {
    // ..
}
```

Why is it worse?

Because in scenario (2), we already established that `===` is used for the last-resort when we don't know enough/anything about the types to be able to predict the outcome. We use `===` when we want to make sure we're avoiding coercion when we know coercion could occur.

But that doesn't apply here! We already know that no coercion would occur. There's no reason to confuse the reader with a `===` here. If you use `===` in a place where you already *know* the types -- and moreover, they're matched! -- that actually might send a mixed signal to the reader. They might have assumed they knew what would happen in the equality check, but then they see the `===` and they second guess themselves!

Again, to state it plainly, if you know the types of an equality comparison, and you know they match, there's only one right choice: `==`.

```js
// stick to this option
if (x == y) {
    // ..
}
```

##### (1b) Known Mismatched Types

OK, we're in our final scenario. We need to compare `x` and `y`, and we know their types, but we also know their types are **NOT** the same.

Which operator should we use here?

If you pick `===`, you've made a huge mistake. Why!? Because `===` used with known-mismatched types will never, ever, ever return `true`. It will always fail.

```js
// `x` and `y` have different types?
if (x === y) {
    // congratulations, this code in here will NEVER run
}
```

OK. So, `===` is out when the types are known and mismatched. What's our only other choice?

Well, actually, we again have two options. We *could* decide:

* (1b-1): Let's change the code so we're not trying to do an equality check with known mismatched types; that could involve explicitly coercing one or both values so they types now match, in which case pop back up to scenario (1a).

* (1b-2): If we're going to compare known mismatched types for equality, and we want any hope of that check ever passing, we *must* used `==`, because it's the only one of the equality operators which can coerce one or both operands until the types match.

```js
// `x` and `y` have different types,
// so let's allow JS to coerce them
// for equality comparison
if (x == y) {
    // .. (so, you're saying there's a chance?)
}
```

That's it. We're done. We've looked at every possible type-sensitive equality comparison condition (between `x` and `y`).

#### Summarizing Type-Sensitive Equality Comparison

The case for always preferring `==` over `===` is as follows:

1. Whether you use TypeScript or not -- but especially if you *do* use TypeScript -- the goal should be to have every single part of the code, including all equality comparisons, be *type-aware*.

2. If you know the types, you should always prefer `==`.

    - In the case where the types match, `==` is both shorter and more proper for the check.

    - In the case where the types are not matched, `==` is the only operator that can coerce operand(s) until the types match, so it's the only way such a check could ever hope to pass

3. Finally, only if you *can't* know/predict the types, for some frustrating reason, and you have no other option, fall back to using `===` as a last resort. And probably add a code comment there admitting why `===` is being used, and maybe prompting some future developer to later change the code to fix that deficiency and remove the crutch of `===`.

#### TypeScript's Inconsistency Problem

Let me be super clear: if you're using TypeScript properly, and you know the types of an equality comparison, using `===` for that comparison is just plain *wrong*! Period.

The problem is, TypeScript strangely and frustratingly still requires you to use `===`, unless it already knows that the types are matched.

That's because TypeScript either doesn't fully understand type-awareness and coercion, or -- and this is even more infuriating! -- it fully understands but it still despises JS's type system so much as to eschew even the most basic of type-aware reasoning.

Don't believe me? Think I'm being too harsh? Try this in TypeScript: [^TSExample2]

```js
let result = (42 == "42");
// This condition will always return 'false' since
// the types 'number' and 'string' have no overlap.
```

I am at a loss for words to describe how aggravating that is to me. If you've paid attention to this long, heavy chapter, you know that TypeScript is basically telling a lie here. Of course `42 == "42"` will produce `true` in JS.

Well, it's not a lie, but it's exposing a fundamental truth that so many still don't fully appreciate: TypeScript completely tosses out the normal rules of JS's type system, because TypeScript's position is that JS's type system -- and especially, implicit coercion -- are bad, and need to be replaced.

In TypeScript's world, `42` and `"42"` can never be equal to each other. Hence the error message. But in JS land, `42` and `"42"` are absolutely coercively equal to each other. And I believe I've made a strong case here that they *should be* assumed to be safely coercively equivalent.

What bothers me even more is, TypeScript has a variety of inconsistencies in this respect. TypeScript is perfectly fine with the *implicit* coercion in this code:

```js
irony = `The value '42' and ${42} are coercively equal.`;
```

The `42` gets implicitly coerced to a string when interpolating it into the sentence. Why is TypeScript ok with this implicit coercion, but not the `42 == "42"` implicit coercion?

TypeScript has no complaints about this code, either:

```js
API_BASE_URL = "https://some.tld/api/2";
if (API_BASE_URL) {
    // ..
}
```

Why is `ToBoolean()` an OK implicit coercion, but `ToNumber()` in the `==` algorithm is not?

I will leave you to ponder this: do you really think it's a good idea to write code that will ultimately run in a JS engine, but use a tool and style of code that has intentionally ejected most of an entire pillar of the JS language? Moreover, is it fine that it's also flip-flopped with a variety of inconsistent exceptions, simply to cater to the old habits of JS developers?

## What's Left?

I hope by now you're feeling a lot more informed about how JS's type system works, from primitive value types to the object types, to how type coercions are performed by the engine.

More importantly, you also now have a much more complete picture of the pros/cons of the choices we make using JS's type system, such as choosing *implicit* or *explicit* coercions at different points.

But we haven't fully covered the context in which the type system operates. For the remainder of this book, we'll turn our attention to the syntax/grammar rules of JS that govern how operators and statements behave.

[^EichCoercion]: "The State of JavaScript - Brendan Eich", comment thread, Hacker News; Oct 9 2012; https://news.ycombinator.com/item?id=4632704 ; Accessed August 2022

[^CrockfordCoercion]: "JavaScript: The World's Most Misunderstood Programming Language"; 2001; https://www.crockford.com/javascript/javascript.html ; Accessed August 2022

[^CrockfordIfs]: "json2.js", Github; Apr 21 2018; https://github.com/douglascrockford/JSON-js/blob/8e8b0407e475e35942f7e9461dab81929fcc7321/json2.js#L336 ; Accessed August 2022

[^BrendanToString]: ESDiscuss mailing list; Aug 26 2014; https://esdiscuss.org/topic/string-symbol#content-15 ; Accessed August 2022

[^AbstractOperations]: "7.1 Type Conversion", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-type-conversion ; Accessed August 2022

[^ToBoolean]: "7.1.2 ToBoolean(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-toboolean ; Accessed August 2022

[^ExoticFalsyObjects]: "B.3.6 The [[IsHTMLDDA]] Internal Slot", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-IsHTMLDDA-internal-slot ; Accessed August 2022

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

[^ASMjs]: "ASM.js - Working Draft"; Aug 18 2014; http://asmjs.org/spec/latest/ ; Accessed August 2022

[^TSExample1]: "TypeScript Playground"; https://tinyurl.com/ydkjs-ts-example-1 ; Accessed August 2022

[^TSExample2]: "TypeScript Playground"; https://tinyurl.com/ydkjs-ts-example-2 ; Accessed August 2022

[^TSLiteralTypes]: "TypeScript 4.1, Template Literal Types"; https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types ; Accessed August 2022
