# You Don't Know JS: Up & Going
# Chapter 1: Into Programming

Welcome to the *"You Don't Know JS"* (YDKJS) book series. This book serves as an introduction to important concepts in general programming, JavaScript specifically, and finally how to approach and understand the rest of the books in the series.

This chapter will explain the basic principles of programming in modern languages, specifically JavaScript, but at a very high level. It's mostly intended if you are reading this with little to no prior programming experience, and are looking to the YDKJS books to help you along your path to understanding programming through the lens of JS.

If you have more than 1-2 months experience with programming in any modern language, you can probably safely skip over this chapter and jump straight into Chapter 2 *"Into JavaScript"*.

## Code

Let's start from the very beginning.

What does it mean to "write a program"? That's when you open up a text file and type a specific series of letters, numbers, and special characters (called operators). The rules for valid combinations of those typed characters is called a "computer language".

What about "executing a program"? A special program on your computer is responsible for reading your "program" from the text file and turning it into commands that your computer can recognize. Some computer languages are designed to be "compiled" ahead of time, which means the special program (aka compiler) reads your file and outputs another file, called an "executable", that can later run all by itself. Other languages are designed to be "compiled" while being run, or interpreted, which means there's no intermediate file created -- each execution is effectively re-compiling the program.

JavaScript is of the latter type: it is compiled (not interpreted!) during its execution by the JavaScript engine (inside the browser, typically).

**Note:** For more information on how JavaScript is "compiled", see the first two chapters of the *"Scope & Closures"* title of this book series.

## Value Types

If you ask an employee at a phone store how much a certain phone costs, and they tell you "99.99", they're giving you an actual dollar figure that (plus taxes and fees) represents what you'll need to pay. If you wanted to buy two of those phones, you could easily do the mental math to double that value to get "199.98" for your base cost.

If that same employee picks up another similar phone but says it's "free" (and perhaps uses air quotes), they're not giving you a number, but instead they're giving you another kind of representation of your expected cost -- the word "free". And if you later ask if the phone includes a charger, and the employee says "yes", they've provided an answer to a question that can only have one of two values, "yes" or "no" (in computer terms "true" and "false", respectively).

In very similar ways, when you express values in a programs, you choose different representations for those values based on what you plan to do with the values. If you need to do math, you represent a value as a `number`. If you need to print a value to read on the screen, you need a `string` (one or more characters, words, sentences). And if you need to decide if something is a fact or not, you need a `boolean` (`true` or `false`).

These different representations for values are called "types" in programming terminology. JavaScript has built-in types for each of these so called "primitive" values.

**Note:** For more information on "types" in JavaScript, see the first three chapters of the *"Types & Grammar"* title of this book series.

### Converting Between Types

If you have a `number` but need to print it on the screen, you need to convert the value to a `string`, and in JavaScript this conversion is called "coercion". Similarly, if someone enters a series of numeric characters into a form on a ecommerce page, that's a `string`, but if you need to then use that value to do math operations, you need to *coerce* it to a `number`.

In JavaScript, a controversial topic is what happens when you try to compare two values to see if they're "equal", and those values are not already of the same type. For example, if you try to compare the string `"99.99"` to the number `99.99`, they *seem* to be equivalent, if not equal.

To help you out in these common situations (like comparison), JavaScript will sometimes kick in and automatically (aka implicitly) coerce a value to a matching type. So if you make the comparison `"99.99" == 99.99`, JavaScript will convert the left-hand side, the `"99.99"` to its `number` equivalent `99.99`, so the comparison then becomes `99.99 == 99.99`, which is of course `true`.

While designed to help, *implicit coercion* can create lots of confusion if you haven't taken the time to learn the rules that govern its behavior. Most JS developers never have, so the common feeling is that *implicit coercion* is confusing and makes programs have unexpected bugs, and should thus be avoided. It's even sometimes called a "flaw" in the design of the language.

However, *implicit coercion* is something that **can be learned**, and moreover **should be learned** by anyone wishing to take JavaScript programming seriously. Not only is it not confusing once you learn the rules, it can actually make your programs better! The effort is well worth it.

**Note:** For more information on coercion, see Chapter 4 of the *"Types & Grammar"* title of this book series.

## Variables

Most useful programs need to track a value as it changes over the course of the program, undergoing different operations as called for by your program's intended tasks.

The easiest way to go about that in your program is to assign a value to a symbolic container, called a "variable" -- so called because the value in this container can *vary* over time as needed.

In some programming languages, you declare a variable (container) to hold a specific *type* of value, such as `number` or `string`. This type of functionality is often called "static typing", and is typically cited as a benefit for program veracity by allowing the compiler/engine to verify that a variable only ever has one *type* representation of the value and doesn't accidentally get converted in a way that can produce unexpected outcomes. Another way of explaining this behavior is "type enforcement".

Other languages don't emphasize *types* for variables, but rather for the values themselves. That behavior allows a variable to hold any *type* of value, and in fact for that *type* to change from operation to operation. This type of functionality is often called "dynamic typing" (aka "weak typing"), and is typically cited as a benefit for program flexibility by allowing a single container to represent a value no matter what *type* form that value may take at any given moment in the program's logic flow. Another way of explaining this behavior is "no type enforcement".

Neither of these approaches is *right* or *wrong* -- they both have strong advantages. Experienced developers often make language choices based on their preferences about such issues.

JavaScript is dynamically typed, meaning variables can hold any value of any *type* as you see fit.

For example, consider this simple program:

```js
var amount = 99.99;

amount = amount * 2;

// print the number
console.log( amount );		// 199.98

amount = "$" + amount;

// print the string
console.log( amount );		// $199.98
```

As you can see, declaring a variable in JS is done with `var`, and there's no other *type* information in the declaration. We additionally assign a value using the single `=` operator.

The `amount` variable starts out holding the number `99.99`, and indeed holds the `number` result of `amount * 2`, which is `199.98`. The first `console.log(..)` command has to *implicitly coerce* that `number` value to a `string` to print it out. Then the statement `amount = "$" + amount` coerces the `199.98` value to a `string` and adds a `"$"` character to the beginning. At this point, `amount` now holds the `string` value `"$199.98"`, so the second `console.log(..)` statement doesn't need to do any coercion to print it out.

JavaScript developers will note the flexibility of using the `amount` variable for all the `99.99`, `199.98`, and the `"$199.98"` values. Static-typing enthusiasts would prefer a separate variable like `amountStr` to hold the final `"$199.98"` representation of the value.

Either way, you'll note that `amount` holds a running value that changes over the course of the program, illustrating the primary purpose of variables: managing program *state*.

Another common usage of variables is for centralizing value setting. This is more typically called "constants", when you declare a variable with a value and intend for that value to *not change* throughout the program. You declare these constants, often at the top of a program, so that it's convenient for you to have one place to go to alter a value if you need to. By convention, JavaScript variables as constants are usually capitalized, with `_` underscores between multiple words.

A silly example:

```js
var TAX_RATE = 0.08;	// 8% sales tax

var amount = 99.99;

amount = amount * 2;

amount = amount + (amount * TAX_RATE);

console.log( amount );				// 215.9784
console.log( amount.toFixed( 2 ) );	// 215.98
```

**Note:** As you can see, JavaScript `number`s aren't automatically formatted for dollars -- the engine doesn't know what your *intent* is and there's no *type* for currency. In this case, the provided `toFixed(..)` method lets us specify how many decimal places we'd like the `number` rounded to.

The `TAX_RATE` variable is only "constant" by convention -- there's nothing special in this program that prevents it from being changed. But if the city raises the sales tax rate to 9%, we can easily change our program by setting the `TAX_RATE` assigned value to `0.09` once, instead of finding many occurrences of `0.08` strewn throughout the program and updating all of them.

The newest version of JavaScript, called ES6, includes a new way to declare constants which accomplishes the same benefits we've just shown, but also prevents accidentally changing the `TAX_RATE` variable somewhere else after the initial setting:

```js
// as of ES6:
const TAX_RATE = 0.08;

var amount = 99.99;

// ..
```

If you tried to assign any different value to `TAX_RATE` after that first declaration, your program would fail with an error. That kind of "protection" against mistakes is similar to the static-typing type enforcement enthusiasm, so you can see why people like it in other languages!

One last thing to say explicitly about variables as we've seen them used so far: they can be used as *targets* for assignment as well as *sources* for value look-up. When we say `amount = 99.99`, `amount` is on the left-hand side of the `=` assignment operator, so it's a *target* where a value will be stored. When we say `= amount * 2`, `amount` here is on the right-hand side, and is thus a *source* where its current value will be looked up at that moment.

**Note:** For more information about how different values in variables can be used in your programs, see the *"Types & Grammar"* title of this book series.

## Conditionals

## Loops

## Functions

## Summary
