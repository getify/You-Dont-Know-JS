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

Briefly, there is a `String` (capital `S`) `object` wrapper form, typically called a "native", that pairs with the primitive `string` value, and it's this value form that defines the `toUpperCase()` method on its prototype. When you use a primitive value like `"hello world"` as an `object` by referencing a property or method, JS automatically "boxes" the value to its `object` wrapper counterpart.

A `string` value can be wrapped by a `String`, a `number` can be wrapped by a `Number`, a `boolean` can be wrapped by a `Boolean`, etc. For the most part, you don't need to worry about or use these `object` wrapper forms of the values -- prefer their primitive forms in practically all cases.

**Note:** For more information on JS natives and "boxing", see Chapter 3 of the *"Types & Grammar"* title of this book series.

## Summary
