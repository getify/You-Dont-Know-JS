# You Don't Know JS: Types & Grammar
# Chapter 4: Coercion

Converting a value from one type to another is often called "type casting", when done explicitly, and "coercion" when done implicitly (forced by the rules of how a value is used).

Another way these terms are often distinguished is: "type casting" (or "type conversion") occur in statically typed languages at compile time, while "type coercion" is a run-time conversion for dynamically typed languages.

However, in JavaScript, most people refer to all these types of conversions as *coercion*, so the way I prefer to distinguish is to say "implicit coercion" vs "explicit coercion".

The difference should be obvious: "explicit coercion" is when it is obvious from looking at the code that a type conversion is intentionally occurring, whereas "implicit coercion" is when the type conversion will occur as a less obvious side-effect of some other intentional operation.

For example, consider these two approaches to coercion:

```js
var a = 42;

var b = a + "";			// implicit coercion

var c = String( a );	// explicit coercion
```

For `b`, the coercion that occurs happens implicitly, because the `+` operator combined with one of the operands being a `string` value (`""`) will insist on the operation being a `string` concatenation (adding two strings together), which *as a (hidden) side-effect* will force the `42` value in `a` to be coerced to its `string` equivalent: `"42"`.

By contrast, the `String(..)` function makes it pretty obvious that it's explicitly taking the value in `a` and coercing it to a `string` representation.

Both approaches accomplish the same effect: `42` becomes `"42"`. But it's the *how* that its at the heart of the heated debates over JavaScript coercion.

The terms "explicit" and "implicit", or "obvious" and "hidden side-effect", in this discussion are *relative*.

If you know exactly what `+ ""` is doing and you're intentionally doing that to coerce to a `string`, you might feel the operation is sufficiently "explicit". On the other hand, if you've never seen the `String(..)` function used for `string` coercion, its behavior might seem hidden enough as to feel "implicit" to you.

But we're conducting this discussion of "explicit" vs "implicit" based on the likely opinions of an *average, reasonably informed, but not expert or JS specification devotee*. To whatever extent you do or do not find yourself fitting neatly in that bucket, you will need to adjust your perspective on our observations here accordingly.

Just remember: it's often rare that we write our code and we're the only ones who ever read it. Even if you're an expert on all the ins and outs of JS, consider how a less-experienced teammate of yours will *feel* when they read your code. Will it be "explicit" or "implicit" to them in the same way as it is for you?
