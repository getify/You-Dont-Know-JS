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
typeof a;				// undefined

a = "hello world";
typeof a;				// string

a = 42;
typeof a;				// number

a = true;
typeof a;				// boolean

a = null;
typeof a;				// object -- weird, bug

a = undefined;
typeof a;				// undefined

a = { b: "c" };
typeof a;				// object
```

The return value from the `typeof` operator is always one of six (seven as of ES6!) string values. That is, `typeof "abc"` returns `"string"`, not `string`.

Notice how the `a` variable holds every different type of value, and that despite appearances, `typeof a` is not asking for the "type of `a`", but rather for the "type of the value currently in `a`". That's because only values have types in JavaScript; variables are just simple containers for those values.

`typeof null` is an interesting case, because it errantly returns `"object"`, when you'd expect it to return `"null"`.

Also, note `a = undefined`. There we're explicitly setting `a` to this `undefined` value, but that is behaviorally no different from a variable that has no value set yet, like with the `var a;` line. There's actually several ways that a variable can get to this "undefined" value state, including functions which return no values and usage of the `void` operator.

## Summary
