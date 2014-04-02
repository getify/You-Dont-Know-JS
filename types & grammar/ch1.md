# You Don't Know JS: Types & Grammar
# Chapter 1: Wait... Types?

Most developers would tell you that a dynamic language (like JS) does not have *types*. Let's see what the authors of the ES5.1 specification have to say on the topic:

> Algorithms within this specification manipulate values each of which has an associated type. The possible value types are exactly those defined in this clause. Types are further subclassified into ECMAScript language types and specification types.
>
> An ECMAScript language type corresponds to values that are directly manipulated by an ECMAScript programmer using the ECMAScript language. The ECMAScript language types are Undefined, Null, Boolean, String, Number, and Object.

Now, if you're a fan of strongly-typed (statically-typed) languages, you probably object to this usage of the word "type". In those languages, "type" means a whole lot *more* than it does here in JS.

Some people say JS shouldn't be said to have "types", but they should instead be called "tags" or perhaps "sub types".

Bah. We're going to use this definition (the same one that seems to drive the wording of the spec!): a *type* is an intrinsic, built-in set of characteristics that uniquely identifies a particular value and distinguishes it from other values, both to the engine **and to the developer**.

In other words, if both the engine and the developer treat value `42` (the number) differently than they treat value `"42"` (the string), then those two values have different *types*, namely `number` and `string`, respectively. When you use `42`, you are *intending* to do something numeric, like math. But when you use `"42"`, you are *intending* to do something string'ish, like outputting to the page, etc. **These two values have different types.**

That's by no means a perfect definition. But it's good enough for now. And it's consistent with how JS treats itself.

## Value Types

In JavaScript, variables don't have types -- **values have types**. Variables can hold any value, at any time.

Another way to think about JS types is that JS has types but it doesn't have "type enforcement", in that the engine doesn't insist that *variable* maintains values that are all of the *same initial type*. A variable can, in one statement, hold a `string`, and in the next hold a `number`, and so on.

Also, the *value* `42` has an intrinsic type of `number`, and its *type* cannot be changed. Another value, like `"42"`, with the `string` type, can be created *from* the `number` value `42`, through a process called **coercion**, which we will cover later.



