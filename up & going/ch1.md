# You Don't Know JS: Up & Going
# Chapter 1: Into Programming

Welcome to the *"You Don't Know JS"* (YDKJS) book series.

*"Up & Going"* is an introduction to several basic concepts of programming -- of course we lean toward JavaScript (often abbreviated JS) specifically -- and how to approach and understand the rest of the titles in this series. Especially if you're just getting into programming and/or JavaScript, this book will briefly explore what you need to get *up and going*.

This first chapter explains the basic principles of programming at a very high level. It's mostly intended if you are starting YDKJS with little to no prior programming experience, and are looking to these books to help get you started along a path to understanding programming through the lens of JavaScript.

Chapter 1 should be approached as a quick overview of the things you'll want to learn more about and practice to get *into programming*. There are also many other fantastic programming introduction resources which can help you dig into these topics further, and I encourage you to learn from them in addition to this chapter.

Once you feel comfortable with general programming basics, Chapter 2 will help guide you to a familiarity with JavaScript's flavor of programming. Chapter 2 introduces what JavaScript is about, but it's not a comprehensive guide -- that's what the rest of the YDKJS books are for!

If you're already somewhat comfortable with JavaScript and are ready to get started with the rest of the series, check out Chapter 3 as a brief glimpse of what to expect from YDKJS.

## Code

Let's start from the beginning.

A program, often referred to as *code* or *source code*, is a set of special instructions to tell the computer what tasks to perform. Usually code is saved in a text file, although with JavaScript you can type code directly into a developer console in a browser, which we'll cover shortly.

The rules for valid format and combinations of instructions is called a *computer language*, sometimes referred to as its *syntax*, much the same as English tells you how to spell words and how to create valid sentences using words and punctuation.

In a computer language, a group of words, numbers, and operators is a statement. In JavaScript, a statement might look like this:

```js
a = b * 2;
```

The characters `a` and `b` are called variables (see "Variables" later in this chapter), which are like cardboard boxes you can store your stuff in -- in programs, variables hold values (like the number `42`) to be used by the program. Think of them as symbolic replacements for values.

By contrast, the `2` is just a value itself, called a *literal value*, because it stands alone without being stored in a variable.

The `=` and `*` characters are operators (see "Operators" later in this chapter) -- they perform actions with the values and variables such as assignment and mathematic multiplication. Most statments in JavaScript end with a `;` semicolon on the end.

The statement `a = b * 2` tells the computer, roughly, to get the current value stored in the variable `b`, multiply that value by `2`, then store the result back into another variable we call `a`.

Programs are just collections of many such statements, which grouped together describe all the steps that it takes to perform a set of tasks.

### Executing a Program

How do those collections of programming statements tell the computer what to do? The program needs to be *executed*, also referred to as *running the program*.

Statements like `a = b * 2` are more for intended for developers to read and write, but are not actually in a form the computer can directly understand. So a special utility on the computer is used to translate the code you write into commands a computer can understand.

For some computer languages, this translation of commands is typically done from top to bottom, line by line, every time the program is run, which is usually called *interpreting* the code.

For other languages, the translation is done ahead of time, called *compiling* the code, so when the program *runs* later, what's running is actually the already compiled computer instructions ready to go.

It's typically asserted that JavaScript is *interpreted*, because your JavaScript source code is processed each time it's run. But that's not entirely accurate. The JavaScript engine actually *compiles* the program on-the-fly and then immediately runs the compiled code.

**Note:** For more information on JavaScript compiling, see the first two chapters of the *"Scope & Closures"* title of this book series.

## Try It Yourself

This chapter is going to introduce each programming concept with simple snippets of code, all written in JavaScript (obviously!).

It cannot be emphasized enough, that while you go through this chapter -- and you may need to spend the time to go over it several times -- that you should practice each of these concepts by typing the code yourself. The easiest way to do that is to open up the developer tools console in your nearest browser (Firefox, Chrome, IE, etc).

**Tip:** Typically, you can launch the developer console with a keyboard shortcut or from a menu item. For more detailed information about launching and using the console in your favorite browser, see "Mastering The Developer Tools Console" (http://blog.teamtreehouse.com/mastering-developer-tools-console).

Let's get familiar with the process of running code in the console. First, I suggest opening up an empty tab in your browser. I prefer to do this by typing `about:blank` into the address bar. Then, make sure your developer console is open, as we just mentioned.

Now, type this code and see how it runs:

```js
var a = 21;

var b = a * 2;

console.log( b );
```

**Tip:** To type multiple lines into the console at once, use `<shift> + <enter>` to move to the next new line. Once you hit `<enter>` by itself, the console will run everything you've just typed.

Typing that code into the console in Chrome should look something like this:

<img src="fig1.png" width="500">

Go on, try it. The best way to learn programming is to start coding!

### Output

In the previous code snippet, we used `console.log(..)`. Briefly, let's look at what the line of code is all about.

You may have guessed, but that's exactly how we print text (aka *output*) in the developer console. There are two characteristics of that statement that we should explain.

First, the `log( b )` part is referred to as a function call (see "Functions" later in this chapter). What's happening is we're handing the `b` variable to that function, which asks it to take the value in `b` and print it to the console.

Second, the `console.` part is an object reference where the `log(..)` function is located. We cover objects and their properties in more detail in Chapter 2.

Another way of creating output that you can see is to run an `alert(..)` statement, like:

```js
alert( b );
```

If you run that, you'll notice that instead of printing the output to the console, it pops up an "OK" box with the contents of the `b` variable (`42` in this case). However, using `console.log(..)` is generally going to make learning about coding and running your programs easier than using `alert(..)`, since you can output many values at once without interrupting the browser interface.

For this book, we'll use `console.log(..)` for output.

### Input

While we're discussing output, you may also wonder about *input* -- that is, receiving information from the user.

The most common way that happens is for the HTML page to show form elements (like text boxes) to a user that they can type into, and then using JS to read those values into your program's variables.

But there's an easier way to get *input* for simple learning and demonstration purposes such as what you'll be doing throughout this book. Use the `prompt(..)` function:

```js
var age = prompt( "Please tell me your age:" );

console.log( age );
```

This should look similar to the following:

<img src="fig2.png" width="500">

And then once you submit the *input* text, you'll see that it's put into the `age` variable that we then *output* with `console.log(..)`:

<img src="fig3.png" width="500">

To keep things simple while we're learning basic programming concepts, the examples in this book will not require on input. But now that you've seen how to use `prompt(..)`, if you want to challenge yourself you can try to include input in your attempts with the examples.

## Operators

Operators are how we perform actions on variables and values.

## Values & Types

If you ask an employee at a phone store how much a certain phone costs, and they tell you "99.99", they're giving you an actual dollar figure that (plus taxes and fees) represents what you'll need to pay. If you wanted to buy two of those phones, you could easily do the mental math to double that value to get "199.98" for your base cost.

If that same employee picks up another similar phone but says it's "free" (and perhaps uses air quotes), they're not giving you a number, but instead they're giving you another kind of representation of your expected cost -- the word "free". And if you later ask if the phone includes a charger, and the employee says "yes", they've provided an answer to a question that can only have one of two values, "yes" or "no" (in computer terms "true" and "false", respectively).

In very similar ways, when you express values in a programs, you choose different representations for those values based on what you plan to do with the values. If you need to do math, you represent a value as a `number`. If you need to print a value to read on the screen, you need a `string` (one or more characters, words, sentences). And if you need to decide if something is a fact or not, you need a `boolean` (`true` or `false`).

These different representations for values are called "types" in programming terminology. JavaScript has built-in types for each of these so called "primitive" values.

Examples:

```js
"I am a string";
'I am also a string';

42;

true;
false;
```

**Note:** For more information on "types" in JavaScript, see the first three chapters of the *"Types & Grammar"* title of this book series.

### Converting Between Types

If you have a `number` but need to print it on the screen, you need to convert the value to a `string`, and in JavaScript this conversion is called "coercion". Similarly, if someone enters a series of numeric characters into a form on a ecommerce page, that's a `string`, but if you need to then use that value to do math operations, you need to *coerce* it to a `number`.

In JavaScript, a controversial topic is what happens when you try to compare two values to see if they're "equal", and those values are not already of the same type. For example, if you try to compare the string `"99.99"` to the number `99.99`, they *seem* to be equivalent, if not equal.

To help you out in these common situations (like comparison), JavaScript will sometimes kick in and automatically (aka implicitly) coerce a value to a matching type. So if you make the comparison `"99.99" == 99.99`, JavaScript will convert the left-hand side, the `"99.99"` to its `number` equivalent `99.99`, so the comparison then becomes `99.99 == 99.99`, which is of course `true`.

While designed to help, *implicit* coercion can create lots of confusion if you haven't taken the time to learn the rules that govern its behavior. Most JS developers never have, so the common feeling is that *implicit* coercion is confusing and makes programs have unexpected bugs, and should thus be avoided. It's even sometimes called a "flaw" in the design of the language.

However, *implicit* coercion is something that **can be learned**, and moreover **should be learned** by anyone wishing to take JavaScript programming seriously. Not only is it not confusing once you learn the rules, it can actually make your programs better! The effort is well worth it.

**Note:** For more information on coercion, see Chapter 4 of the *"Types & Grammar"* title of this book series.

## Code Comments

One of the most important lessons you can learn about writing code is that it's not just for the computer. Code is every bit as much, if not more, for the developer as it is for the compiler.

Your computer only cares about machine code, binary 0's and 1's. There's a nearly infinite number of different programs you could write that could produce the same final series of 0's and 1's. So the way you write your program matters. It matters not only to you, but to your other team members and even to your future self.

For that reason, you should strive to write not just programs that work, but programs that make sense when read. You can go a long way in that effort by choosing good names for your variables (see the next section) and functions (see later in the chapter).

But another important part is code comments. These are bits of text in your program which are inserted purely to explain things to a human. The compiler will always ignore these comments.

There's lots of opinions on what makes well commented code or not. We can't exactly define absolute rules. But some observations and guidelines are useful:

* No comments is bad.
* Too many comments (like one per line) is probably a sign of poorly written code.
* Comments should explain WHY, not WHAT. They can optionally explain HOW if that's particularly confusing.

In JavaScript, there are two types of comments possible: a single-line comment, and a multi-line comment.

Consider:

```js
// This is a single line comment

// This is another single line comment

/* But this is
       a multi-line
             comment.
                      */
```

The `//` single-line comment is appropriate if you're going to put a comment right above a single statement, or even at the end of a line. Everything on the line after the `//` is treated as the comment (and thus ignored by the compiler), all the way to the end of the line. There's no restriction to what can appear inside a comment.

The `/* .. */` multi-line comment is appropriate if you have several sentences worth of explanation to make in your comment. It can appear anywhere on a line, even in the middle of a line, since the `*/` ends it. The only thing that cannot appear inside a multi-line comment is a `*/`, since that would be taken to end the comment.

You will definitely want to begin your learning of programming by starting the habit of commenting code. Throughout the rest of this chapter, you'll see I use comments to explain things, so do the same in your own practice. Trust me, everyone who reads your code will thank you!

## Variables

Most useful programs need to track a value as it changes over the course of the program, undergoing different operations as called for by your program's intended tasks.

The easiest way to go about that in your program is to assign a value to a symbolic container, called a "variable" -- so called because the value in this container can *vary* over time as needed.

In some programming languages, you declare a variable (container) to hold a specific *type* of value, such as `number` or `string`. This type of functionality is often called "static typing", and is typically cited as a benefit for program correctness by allowing the compiler to verify that a variable only ever has one *type* representation of the value and doesn't accidentally get converted in a way that can produce unexpected outcomes. Another way of explaining this behavior is "type enforcement".

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
console.log( amount.toFixed( 2 ) );	// "215.98"
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

"Do you want to add on the extra screen protectors to your purchase, for 9.99?" The helpful phone store employee has asked you to make a decision. And you may need to first consult the current *state* of your wallet or bank account to answer that question.

There are quite a few ways we can express conditionals (aka decisions) in our programs.

The most common one is the `if` statement. Essentially, you're saying "IF this condition is true, do the following". You can even provide an alternate if the condition isn't true, called an `else`.

Consider this program:

```js
var amount = 99.99;
const BANK_BALANCE = 302.13;
const ACCESSORY_PRICE = 9.99;

amount = amount * 2;

// can we afford the extra purchase?
if ( amount < BANK_BALANCE ) {
	console.log( "Sure!" );
	amount = amount + ACCESSORY_PRICE;
}
else {
	console.log( "No, thanks." );
}
```

The `if` statement requires an expression in between the `( )` parentheses that can be treated as either `true` or `false`. In this program, we provided the expression `amount < BANK_ACCOUNT_BALANCE`, which indeed will either evaluate to `true` or `false` depending on the amount in our bank account. If `true`, we'll print out `"Sure!"` and add the `9.99` to our `amount` variable. Otherwise, the `else` clause says we'll just politely respond with `"No, thanks."`.

As we mentioned earlier, values which aren't already of an expected type are often coerced to that type. The `if` statement expects a `boolean`, but if you pass it something that's not already `boolean`, coercion will occur.

Certain values in JavaScript are considered "falsy" if when asked to coerce to a `boolean`, they become `false` -- they include values like `0` and `""`. Other values are called "truthy" because when asked to coerce to a `boolean`, they become `true` -- they include values like `99.99` and `"free"`.

Conditionals exist in other forms, too. For example, the `switch` statement is like a short-hand for a series of `if..else` statements. Loops (covered in the next section) use a conditional to determine if the loop should keep going or stop.

**Note:** For more information about the coercions that can occur implicitly in conditionals' test expressions, see Chapter 4 of the *"Types & Grammar"* title of this book series.

## Loops

Extending our running scenario of the phone store employee: during busy times, there's a waiting list for customers waiting to speak to the employee. While there's still people on that list, the employee just needs to keep serving the next customer.

Repeating a set of actions until a certain condition is met is the job of programming loops; loops can take different forms, but they all satisfy this basic behavior.

For example, the `while` loop and the `do..while` (some languages call it "until" instead of "while") loop forms are direct expressions of that idea:

```js
while (numOfCustomers > 0) {
	console.log( "How may I help you?" );
	// ..
}

// versus
do {
	console.log( "How may I help you?" );
	// ..
} while (numOfCustomers > 0);
```

The only practical difference between these loops is whether the conditional is tested before the first iteration (`while`) or after the first iteration (`do..while`). In either form, if the conditional tests as `false`, the next iteration will not run. That means if the condition is initially `false`, a `while` loop will never run, but a `do..while` loop will run just the first time.

Sometimes you are looping for the intended purpose of counting a certain set of numbers, like from `0` to `9` (ten numbers). You can do that by setting a loop iteration variable like `i` at value `0` and incrementing it by `1` each iteration.

The conditional is tested on each iteration, much as if there had been an implied `if` statement inside the loop. As an illlustration of this concept, we can see the use of JavaScript's `break` statement to stop a loop. We can also see that it's (too) easy to create a loop that would otherwise run forever.

Consider:

```js
var i = 0;

// a `while..true` loop would run forever, right?
while (true) {
	// keep the loop going?
	if (i <= 9) {
		console.log( i );
		i++;
	}
	// time to stop the loop!
	else {
		break;
	}
}
// 0 1 2 3 4 5 6 7 8 9
```

**Note:** `i++` in the above snippet is a short-hand operator notation for `i = i + 1`: simple incrementing by `1`.

While a `while` (or `do..while`) can accomplish the task manually, there's another syntactic form called a `for` loop for just that purpose:

```js
for (var i=0; i <= 9; i++) {
	console.log( i );
}
// 0 1 2 3 4 5 6 7 8 9
```

As you can see, in both cases the conditional `i <= 9` is `true` for the first ten iterations (`i` of values `0` through `9`) of either loop form, but becomes `false` once `i` is value `10`.

The `for` loop has three clauses: the declaration clause (`var i=0`), the conditional test clause (`i <= 9`), and the loop increment clause (`i++`). So if you're going to do counting on your loop iterations, `for` is often a shorter, easier form to understand and write.

There are other specialized loop forms that are intended to iterate over specific values, such as the properties of an object (see Chapter 2) where the implied conditional test is whether all the properties have been processed. As you can see, the "loop until a condition fails" concept holds no matter what the form of the loop.

## Functions

The phone store employee probably doesn't carry around a calculator to figure out the taxes and final purchase amount for your phones. That's a task he needs to define once and reuse over and over again. Odds are, the company has a checkout register with those "functions" built-in.

Similarly, your program will almost certainly want to break up the code's tasks into reusable pieces. The way to do this is to define a `function`.

A function is generally a named section of code which can be "called" by name, and the code inside it will be run each time. Functions can optionally take arguments (aka parameters) -- values you pass in. And they can also optionally return a value back.

Functions are often used for code that you plan to call multiple times, but they can also be useful just to organize related bits of code into named collections, even if you only plan to call them once. Typically, that practice would be combined with passing in arguments and/or returning a value.

Consider:

```js
const TAX_RATE = 0.08;

function calculateFinalPurchaseAmount(amt) {
	// calculate the new amount with the tax
	amt = amt + (amt * TAX_RATE);

	// return the new amount
	return amt;
}

var amount = 99.99;

amount = calculateFinalPurchaseAmount( amount );

console.log( amount.toFixed( 2 ) );		// "107.99"
```

As you can see, we defined a function called `calculateFinalPurchaseAmount(..)`. This function takes a single argument, which we named internally `amt`. It also has a `return` statement, which means it returns a value back.

We later call this function, passing in the current purchase amount (`99.99`), and we get back the new purchase amount with tax added (`107.9892`), which we format as a `string`, rounded to two digits (`"107.99"`).

### Scope

Functions introduce us to this idea of "scope" (technically called "lexical scope") -- each function gets its own scope. Scope is basically a collection of variables as well as the rules for how variables are accessed by name.

For example, a variable name has to be unique within the same scope -- there can't be two different `a` variables sitting right next to each other. But the same variable name `a` could appear in different scopes.

```js
function one() {
	// this `a` only belongs to the `one()` function
	var a = 1;
	console.log( a );
}

function two() {
	// this `a` only belongs to the `two()` function
	var a = 2;
	console.log( a );
}

one();		// 1
two();		// 2
```

Also, a scope can be nested inside another scope, just like if a clown at a birthday party blows up one balloon inside another balloon. If one scope is nested inside another, code inside the innermost scope can access variables from either scope.

Consider:

```js
function outer() {
	var a = 1;

	function inner() {
		var b = 2;

		// we can access both `a` and `b` here
		console.log( a + b );	// 3
	}

	// we can only access `a` here
	console.log( a );			// 1
}

outer();
```

Lexical scope rules say that code in one scope can access variables of either that scope or any scope outside of it.

So, code inside the `inner()` function has access to both variables `a` and `b`, but code only in `outer()` has access only to `a` -- it cannot access `b` since that variable is only inside `inner()`.

Recall this code snippet from earlier:

```js
const TAX_RATE = 0.08;

function calculateFinalPurchaseAmount(amt) {
	// calculate the new amount with the tax
	amt = amt + (amt * TAX_RATE);

	// return the new amount
	return amt;
}
```

The `TAX_RATE` constant (variable) is accessible from inside the `calculateFinalPurchaseAmount(..)` function, even though we didn't pass it in, because of lexical scope.

**Note:** For more information about lexical scope, see the first three chapters of the *"Scope & Closures"* title of this book series.

### Closure

As we just saw, functions can be defined inside other functions (creating scopes inside other scopes).

But functions can also be passed around as values themselves. That may sound like a strange concept at first, so take a moment to ponder it. Not only can a function be passed a value (argument), but **a function itself can be a value** that's assigned to variables, passed to other functions, or returned from a function.

An extremely important feature of functions and lexical scope in languages like JavaScript is the idea of "closure", which is the ability of a function to remember and maintain access to variables, even after that function has finished running!

```js
function makeAdd(x) {

	// inner function `add()` has closure
	// over parameter variable `x`
	function add(y) {
		return x + y;
	};

	return add;
}

// `plusOne(..)` is the inner `add(..)` function with closure
var plusOne = makeAdd( 1 );

// `plusTen(..)` is the inner `add(..)` function with closure
var plusTen = makeAdd( 10 );

plusOne( 3 );		// 4  <-- 1 + 3
plusOne( 41 );		// 42 <-- 1 + 41

plusTen( 13 );		// 23 <-- 10 + 13
```

We won't get into all the nitty gritty of how this closure is working. But in a simple sense, the inner `add(..)` function that gets returned is able to remember whatever `x` value was passed to its outer `makeAdd(..)` function call.

Some observations:

1. When we call `makeAdd(1)`, we get a new function back, the inner `add(..)`, that we call `plusOne(..)`, which will remember `x` as `1`.
2. When we call `makeAdd(10)`, we get yet another new function (again, the inner `add(..)`) back that we call `plusTen(..)`, which will remember `x` as `10`.
3. When we call `plusOne(3)`, it adds `3` (assigned to the inner `y`) to the `1` (remembered in `x`), and we get `4`.
4. When we call `plusTen(13)`, it adds `13` (the inner `y`) to the remembered `10` in `x`, and we get `23`.

Don't worry if this seems strange and confusing -- it is! It'll take lots of practice to get it fully. But trust me, once you do, it's one of the most powerful and useful techniques in all of programming. It's definitely worth the effort to let your brain simmer on closures for a bit.

**Note:** For more information about closures, see the *"Scope & Closures"* title of this book series, especially Chapter 5.

## Practice

There is absolutely no substitute for practice in learning programming. No amount of articulate writing on my part is alone going to make you a programmer.

With that in mind, let's try practicing some of the concepts we learned here in this chapter. I'll give the "requirements", and you try it first. Then consult the code listing below to see how I approached it.

* Write a program to calculate the total price of your phone purchase. You will keep purchasing phones (hint: loop!) until you run out of money in your bank account. You'll also buy accessories for each phone as long as your purchase amount is below your mental spending threshold.
* After you've calculated your purchase amount, add in the tax, then print out the calculated purchase amount, properly formatted.
* Finally, check the amount against your bank account balance to see if you can afford it or not.
* You should set up some constants for the "tax rate", "phone price", and "accessory price", as well as your current "bank balance" and your "spending threshold".
* You should define functions for calculating the tax and for formatting the price with a "$" and rounding to two decimal places.

OK, go ahead. Try it. Don't peek at my code listing until you've given a shot yourself!

Now, I'm obviously going to solve the practice exercise in JavaScript, since this is a JavaScript book. But you can do it in another language if you feel more comfortable.

```js
const BANK_BALANCE = 303.91;
const SPENDING_THRESHOLD = 200;

const TAX_RATE = 0.08;
const PHONE_PRICE = 99.99;
const ACCESSORY_PRICE = 9.99;


function calculateTax(amount) {
	return amount * TAX_RATE;
}

function formatAmount(amount) {
	return "$" + amount.toFixed(2);
}

var amount = 0;

// keep buying phones while you still have money
while (amount < BANK_BALANCE) {
	// buy a new phone!
	amount = amount + PHONE_PRICE;

	// can we afford the accessory?
	if (amount < SPENDING_THRESHOLD) {
		amount = amount + ACCESSORY_PRICE;
	}
}

// don't forget to pay the government, too
amount = amount + calculateTax( amount );

console.log(
	"Your purchase: " + formatAmount( amount )
);
// Your purchase: $334.76

// can you actually afford this purchase?
if (amount > BANK_BALANCE) {
	console.log(
		"You can't afford this purchase. :("
	);
}
// You can't afford this purchase. :(
```

**Note:** The simplest way to run this JavaScript program is to type it into the developer console of your nearest browser.

How did you do? It wouldn't hurt to try it again now that you've seen my code. And play around with changing some of the constants to see how the program runs with different values.

## Review

Learning programming doesn't have to be a complex and involved process. There are just a few basic concepts you need to wrap your head around. These act like building blocks. To build a tall tower, you start first by putting block on top of block on top of block. The same goes with programming.

* You need values and types to differentiate different tasks, like performing math on numbers or output with strings.
* You need variables to store data (aka "state") throughout your program's running.
* You need conditionals like `if` statements to make decisions.
* You need loops to repeat tasks until a condition stops being true.
* You need functions to organize your code into logical and reusable chunks.

Code comments are one effective way to write more readable code, which makes your program easier to understand, maintain, and fix later if there are problems.

Finally, don't neglect the power of practice. The best way to learn how to write code is to write code.

I'm excited you're well on your way to learning how to code, now! Keep it up. The next chapter will talk a lot more specifically about JavaScript, and introduce you to topics that will be covered in detail throughout the rest of the series.
