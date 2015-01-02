# You Don't Know JS: Up & Going
# Chapter 2: Into JavaScript

In the previous chapter, I introduced the basic building blocks of programming, such as variables, loops, conditionals, and functions. Of course, all the code shown has been in JavaScript. But in this chapter, we want to focus specifically on things you need to know about JavaScript to get up and going as a JS developer.

You should be aware that we will introduce quite a few concepts in this chapter which we will not fully explore here, but rather give you just a preview of them. You can think then of this chapter as an overview for the topics covered in detail throughout the rest of this book series.

Especially if you're new to JavaScript, you should expect to spend quite a bit of time going over the concepts and code examples here multiple times. Any good foundation is laid brick by brick, so don't expect that you'll get it all at once the first pass through.

Your journey to deeply learn JavaScript starts here.

## Values & Types

As we asserted in Chapter 1, JavaScript has typed values, not typed variables. The following built-in types are available:

* `string`
* `number`
* `boolean`
* `null` and `undefined`
* `object`
* (new to ES6) `symbol`

JavaScript provides a `typeof` operator which can examine a value and tell you what type it is.

```js
var a;
typeof a;				// "undefined"

a = "hello world";
typeof a;				// "string"

a = 42;
typeof a;				// "number"

a = true;
typeof a;				// "boolean"

a = null;
typeof a;				// "object" -- weird, bug

a = undefined;
typeof a;				// "undefined"

a = { b: "c" };
typeof a;				// "object"
```

The return value from the `typeof` operator is always one of six (seven as of ES6!) string values. That is, `typeof "abc"` returns `"string"`, not `string`.

Notice how the `a` variable holds every different type of value, and that despite appearances, `typeof a` is not asking for the "type of `a`", but rather for the "type of the value currently in `a`". That's because only values have types in JavaScript; variables are just simple containers for those values.

`typeof null` is an interesting case, because it errantly returns `"object"`, when you'd expect it to return `"null"`.

Also, note `a = undefined`. There we're explicitly setting `a` to this `undefined` value, but that is behaviorally no different from a variable that has no value set yet, like with the `var a;` line. There's actually several ways that a variable can get to this "undefined" value state, including functions which return no values and usage of the `void` operator.

The `object` type refers to a compound value where you can set properties that each hold their own values of any type. This is perhaps one of the most useful value types in all of JavaScript.

```js
var obj = {
	a: "hello world",
	b: 42,
	c: true
};

obj.a;		// "hello world"
obj.b;		// 42
obj.c;		// true

obj["a"];	// "hello world"
obj["b"];	// 42
obj["c"];	// true
```

Properties can either be accessed with "dot notation" `obj.a` or "bracket notation" `obj["a"]`. Dot notation is shorter and generally easier to read, and is thus preferred. Bracket notation is useful if you have a property name that has special characters in it, like `obj["hello world!"]` -- such properties are often referred to as *keys* when accessed via bracket notation.

Of course, bracket notation is also required if you want to access a property/key but the name is stored in another variable, such as:

```js
var obj = {
	a: "hello world",
	b: 42
};

var b = "a";

obj[b];			// "hello world"
obj["b"];		// 42
```

**Note:** For more information on JavaScript `object`s, see the *"this & Object Prototypes"* title of this book series, specifically Chapter 3.

There are a couple of other values that you will commonly interact with in JavaScript programs: *array* and *function*. But rather than being proper built-in types, these should be thought of more like sub-types, specialized versions of the `object` type.

An *array* is an `object` that holds values (of any type) not just in named properties/keys, but in numerically indexed positions. For example:

```js
var arr = [
	"hello world",
	42,
	true
];

arr[0];			// "hello world"
arr[1];			// 42
arr.length;		// 3

typeof arr;		// "object"
```

Since *array*s are special objects (as `typeof` implies), they can also have properties, including the automatically updated `length` property.

You theoretically could use an *array* as a normal object with named properties, or you could use an `object` but only give it numeric properties (`0`, `1`, etc) similar to an *array*. However, such would generally be considered improper usage of the respective types.

Use *array*s for numerically positioned values and use `object`s for named properties.

The other `object` sub-type you'll use all over your JS programs is *function*:

```js
function foo() {
	return 42;
}

foo.bar = "hello world";

typeof foo;			// "function"
typeof foo();		// "number"
typeof foo.bar;		// "string"
```

Again, *function*s are `objects` -- in this case `typeof` strangely gives `"function"` implying top-level status -- and can thus have properties, but you typically will not use function object properties broadly, just in limited cases.

**Note:** For more information on JS values and their types, see the first two chapters of the *"Types & Grammar"* title of this book series.

### Built-in Type Methods

The built-in types and sub-types we've just discussed have built-in behaviors exposed as properties and methods that are quite powerful and useful.

For example:

```js
var a = "hello world";
var b = 3.14159;

a.length;				// 11
a.toUpperCase();		// "HELLO WORLD"
b.toFixed(4);			// "3.1416"
```

The "how" behind being able to call `a.toUpperCase()` is more complicated than just that method existing on the value.

Briefly, there is a `String` (capital `S`) object-wrapper form, typically called a "native", that pairs with a primitive `string` value; it's this object-wrapper that defines the `toUpperCase()` method on its prototype. When you use a primitive value like `"hello world"` as an `object` by referencing a property or method, JS automatically "boxes" the value to that object-wrapper counterpart.

A `string` value can be wrapped by a `String`, a `number` can be wrapped by a `Number`, a `boolean` can be wrapped by a `Boolean`, etc. For the most part, you don't need to worry about or directly use these object-wrapper forms of the values -- prefer the primitive value forms in practically all cases and JavaScript will take care of the rest for you.

**Note:** For more information on JS natives and "boxing", see Chapter 3 of the *"Types & Grammar"* title of this book series. To better understand the prototype of an object, see Chapter 5 of the *"this & Object Prototypes"* title of this book series.

### Comparing Values

There two main types of value comparison that you will need to make in your JS programs: *equality* and *inequality*. The end result of any comparison is a strictly `boolean` value (`true` or `false`), regardless of what value types are compared.

#### Equality

There are four *equality* operators: `==`, `===`, `!=`, and `!==`. The `!` forms are of course the symmetric "not equal" versions of their counterparts; non-*equality* should not be confused with *inequality*.

The difference between `==` and `===` is usually characterized that `==` checks for value equality and `===` checks for both value and type equality. However, this is inaccurate. The proper way to characterize them is that `==` checks for value equality with *coercion* allowed, and `===` checks for value equality without allowing *coercion*.

We talked briefly about *coercion* in Chapter 1, but let's revisit it here.

Coercion comes in two forms in JavaScript: *explicit* and *implicit*. Explicit coercion is simply that you can see obviously from the code that a conversion from one type to another will occur, whereas implicit coercion is when the type conversion can happen as more of a non-obvious side effect of some other operation.

You've probably heard sentiments like "coercion is evil" drawn from the fact that there are clearly places where coercion can produce some surprising results. Perhaps nothing evokes ire from developers more than when the language surprises them.

Coercion is not evil, nor does it have to be surprising. In fact, the majority of cases you can construct around type coercion are quite sensible and understandable, and can even be used to **improve** the readability of your code. But we won't go much further into that debate -- Chapter 4 of the *"Types & Grammar"* title of this book series covers all sides.

Explicit coercion:

```js
var a = "42";

var b = Number( a );

a;				// "42"
b;				// 42 -- the number!
```

Implicit coercion:

```js
var a = "42";

var b = a + 0;	// "42" implicitly coerced to 42 here

a;				// "42"
b;				// 42 -- the number!
```

It's the implicit flavor of coercion that best describes what happens with the coercion-enabled `==` equality. For example:

```js
var a = "42";
var b = 42;

a == b;			// true
a === b;		// false
```

In the `a == b` comparison, JS notices that the types do not match, so it goes through an ordered series of steps to coerce one or both values to a different type until the types match, where then a simple value equality can be checked.

If you think about it, there's two possible ways `a == b` could give `true` via coercion. Either the comparison could end up as `42 == 42` or it could be `"42" == "42"`. So which is it?

The answer: `"42"` becomes `42`, to make the comparison `42 == 42`. In such a simple example, it doesn't really seem to matter which way that process goes, as the end result is the same. There are more complex cases where it matters not just what the end result of the comparison is, but *how* you get there.

The `a === b` produces `false`, because the coercion is not allowed, so the simple value comparison obviously fails. Many developers feel that `===` is more predictable, so they advocate always using that form and staying away from `==`. I think this view is very short-sighted. I believe `==` is a powerful tool that helps your program, **if you take the time to learn how it works.**

We're not going to cover all the nitty gritty details of how the coercion in `==` comparisons works here. Much of it is pretty sensible, but there are some important corner cases to be careful of. You can read the specification (section 11.9.3) (http://www.ecma-international.org/ecma-262/5.1/) to see the exact rules, and you'll be surprised at just how straightforward this mechanism is, compared to all the negative hype surrounding it.

To boil down a whole lot of details to a few simple take-aways, and help you know whether to use `==` or `===` in various situations, here's my simple rules:

1. If either value (aka side) in a comparison could be the literal `true` or `false` value, avoid `==` and use `===`.
2. If either value in a comparison could be of these specific values (`0`, `""`, or `[]` -- empty array), avoid `==` and use `===`.
3. In *all* other cases, you're safe to use `==`. Not only is it safe, but in many cases it simplifies your code in a way that improves readability.

What these rules boil down to is requiring you to think critically about your code and about what kinds of values can come through variables that get compared for equality. If you can be certain about the values, and `==` is safe, use it! If you can't be certain about the values, use `===`. It's that simple.

The `!=` non-equality form pairs with `==`, and the `!==` form pairs with `===`. All the rules and observations we just discussed hold symmetrically for these non-equality comparisons.

You should take special note of the `==` and `===` comparison rules if you're comparing with non-primitive values like `object`s (including `function` and `array`). Since those values are actually held by reference,

**Note:** For more information about the `==` equality comparison rules, see the specification (section 11.9.3) and also consult Chapter 4 of the *"Types & Grammar"* title of this book series.

#### Inequality

The `<`, `>`, `<=`, and `>=` operators are used for inequality, referred to in the specification as "relational comparison". Typically they will be used with ordinally comparable values like `number`s. It's easy to understand that `3 < 4`.

But JavaScript `string` values can also be compared for inequality, using typical alphabetic rules (`"bar" < "foo"`).

**Note:** For more information about the inequality comparison rules, see the specification (section 11.8.5) and also consult Chapter 4 of the *"Types & Grammar"* title of this book series.

## Summary
