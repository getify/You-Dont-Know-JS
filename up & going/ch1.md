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

## Conditionals

## Loops

## Functions

## Summary
