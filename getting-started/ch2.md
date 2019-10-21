# You Don't Know JS Yet: Getting Started - 2nd Edition
# Chapter 2: Getting To Know JS

| NOTE: |
| :--- |
| Work in progress |

There's no substitute in learning JS other than to just start writing JS. To do that, you need to know how the language works. So, let's get more familiar with its syntax.

This chapter is not an exhaustive reference on every bit of syntax of the JS language. It's also not intended to be an "intro to JS" primer.

Instead, we're just going to survey some of the major topic-areas of the language. Our goal is to get a better *feel* for it, so that we can move forward writing our own programs.

## Files As Programs

Almost every website (web application) you use is comprised of many different JS files (typically with the .js file extension). It's tempting to think of the whole thing (the application) as one program. But JS sees it differently.

In JS, each standalone file is its own separate program.

The reason this matters is primarily around error handling. Since JS treats files as programs, one file may fail (during parse/compile or execution) and that will not necessarily prevent the next file from being processed. Obviously, if your application depends on five .js files, and one of them fails, the overall application will probably only partially operate, at best. It's important to ensure that each file works properly, and that to whatever extent possible, they handle failure in other files as gracefully as possible.

It may surprise you to consider separate .js files as separate JS programs. From the perspective of your usage of an application, it sure seems like one big program. That's because the execution of the application allows these individual *programs* to cooperate and act as one program.

The only way multiple standalone .js files act as a single program is by sharing their state (and access to their public functionality) via the "global scope". They mix together in this global scope namespace, so at runtime they act as as whole.

Since ES6, JS has also supported a module format in addition to the typical standalone JS program format. Modules are also file-based. If a file is loaded via module-loading mechanism such as an `import` statement or a `<script type=module>` tag, all its code is treated as a single module.

Though you wouldn't typically think about a module -- basically, a collection of state and publicly-exposed methods to operate on that state -- as a standalone program, JS does in fact still treat each module separately. Similiar to how "global scope" allows standalone files to mix together at runtime, importing a module into another allows runtime interoperation between them.

Regardless of which code organization pattern (and loading mechanism) is used for a file -- standalone or module -- you should still think of each file as its own (mini) program, which may then cooperate with other (mini) programs to perform the functions of your overall application.

## Values

The most fundamental unit of information in a program is a value. Values are data. They're how the program maintains state. Values come in two forms in JS: **primitive** and **object**.

Values are embedded in our programs using *literals*. For example:

```js
console.log("My name is Kyle.");
// My name is Kyle.
```

In this program, the value `"My name is Kyle."` is a primitive string literal; strings are ordered collections of characters, usually used to represent words and sentences.

I used the double-quote `"` character to *delimit* (surround, separate, define) the string value. But I could have used the single-quote `'` character as well. The choice of which quote character is entirely stylistic. The important thing, for code readability and maintainability sake, is to pick one and to use it consistently throughout the program.

Another option to delimit a string literal is to use the back-tick `` ` `` character. However, this choice is not merely stylistic; there's a behavioral difference as well. Consider:

```js
console.log("My name is ${firstName}.");
// My name is ${firstName}.

console.log('My name is ${firstName}.');
// My name is ${firstName}.

console.log(`My name is ${firstName}.`);
// My name is Kyle.
```

Assuming this program has already defined a variable `firstName` with the string value `"Kyle"`, the `` ` ``-delimited string then resolves the variable expression (indicated with `${ .. }`) to its current value. This is called **interpolation**.

The back-tick `` ` ``-delimited string can be used without including interpolated expressions, but that defeats the whole purpose of that additional syntax.

```js
console.log(`Am I confusing you by omitting interpolotion?`);
// Am I confusing you by omitting interpolation?
```

The better approach is to use `"` or `'` (again, pick one and stick to it!) for strings *unless you need* interpolation; reserve `` ` `` only for strings that will include interpolated expressions.

Other than strings, JS programs often contain other primitive literal values such as booleans and numbers.

```js
while (false) {
	console.log(3.141592);
}
```

`while` represents a loop type, a way to repeat operations *while* its condition is true.

In this case, the loop will never run (and nothing will be printed), because we used the `false` boolean value as the loop conditional. `true` would have resulted in a loop that keeps going forever, so be careful!

The number `3.141592` is, as you may know, an approximation of mathematical PI to the first six digits. Rather than embed such a value, however, you would typically use the predefined `Math.PI` value for that purpose. Another variation on numbers is the `bigint` (big-integer) primitive type, which is used for storing arbitrarily large numbers.

Numbers are most often used in programs for counting steps, such as loop iterations, and accessing information in numeric positions (ie, an array index). Object values represent a collection of any various values. Arrays are a special subset where the collection is ordered, thus the position of an element (index) is numeric.

For example, if there was an array called `names`, we could access the element in the second position like this:

```js
console.log(`My name is ${ names[1] }.`);
// My name is Kyle.
```

We used `1` for the element in the second position, instead of `2`, because like in most programming languages, JS array indices are 0-based (`0` is the first position).

By contrast, regular objects are unordered and keyed collections of values; in other words, you access the element by a string location name (aka "key" or "property") rather than by its numeric position (as with arrays). For example:

```js
console.log(`My name is ${ name.first }.`);
```

Here, `name` represents an object, and `first` represents the name of a location of information in that object (value collection). Another syntax option that accesses information in an object by its property/key uses the square-brackets `[ ]`, such as  `name["first"]`.

In addition to strings, numbers, and booleans, two other *primitive* values in JS programs are `null` and `undefined`. While there are differences between them (some historic and some contemporary), for the most part both values serve the purpose of indicating *emptiness* (or absence) of a value.

Many developers prefer to treat them both consistently in this fashion, which is to say that the values are assumed to be indistinguishable. If care is taken, this is often possible. However, it's safest and best to use only `undefined` as the single empty value, even though `null` seems attractive in that it's shorter to type!

```js
while (value != undefined) {
	console.log("Still got something!");
}
```

The final primitive value to be aware of is a symbol, which is a special-purpose value that behaves as a hidden unguessable value. Symbols are almost exclusively used as special keys on objects.

```js
hitchhikersGuide[ Symbol("meaning of life") ];
// 42
```

## Variables

To be explicit about something that may not have been obvious in the previous section: in JS programs, values can either appear as literal values (as many of the above examples illustrate), or they can be held in variables; think of variables as just containers for values.

Variables have to be declared (created) to be used. There are various syntax forms that declare variables (aka, "identifiers"), and each form has different implied behaviors.

For example, consider the `var` statement:

```js
var name = "Kyle";
var age;
```

The `var` keyword declares a variable to be used in that part of the program, and optionally allows an initial assignment of a value.

Another similar keyword is `let`:

```js
let name = "Kyle";
let age;
```

The `let` keyword has some differences to `var`, with the most obvious being that `let` allows a more limited access to the variable than `var`. This is called "block scoping" as opposed to regular or function scoping.

Consider:

```js
var adult = true;

if (adult) {
	var name = "Kyle";
	let age = 39;
	console.log("Shhh, this is a secret!");
}

console.log(name);
// Kyle

console.log(age);
// Error!
```

The attempt to access `age` outside of the `if` statement results in an error, because `age` was block-scoped to the `if`, whereas `name` was not.

Block-scoping is very useful for limiting how widespread variable declarations are in our programs, which helps prevent accidental overlap of their names.

But `var` is still useful in that it communicates "this variable will be seen by a wider scope". Both declaration forms can be appropriate in any given part of a program, depending on the circumstances.

| NOTE: |
| :--- |
| It's very common to suggest that `var` should be avoided in favor of `let` (or `const`!), generally because of perceived confusion over how the scoping behavior of `var` has worked since the beginning of JS. I believe this to be overly restrictive advice and ultimately unhelpful. It's assuming you are unable to learn and use a feature properly in combination with other features. I belive you *can* and *should* learn any features available, and use them where appropriate! |

A third declaration form is `const`. It's like `let` but has an additional limitation that it must be given a value at the moment it's declared, and cannot be re-assigned a different value later.

Consider:

```js
const myBirthday = true;
let age = 39;

if (myBirthday) {
	age = age + 1;	// OK!
	myBirthday = false;  // Error!
}
```

The `myBirthday` constant is not allowed to be re-assigned.

`const` declared variables are not "unchangeable", they just cannot be re-assigned. It's ill-advised to use `const` with object values, because those values can still be changed even though the variable can't be re-assigned. This leads to potential confusion down the line, so I think it's wise to avoid situations like:

```js
const actors = [ "Morgan Freeman", "Jennifer Anniston" ];

actors[2] = "Tom Cruise";   // OK :(

actors = [];				// Error!
```

The best semantic use of a `const` is when you have a simple primitive value that you want to give a useful name to, such as using `myBirthday` instead of `true`. This makes programs easier to read.

| TIP: |
| :--- |
| If you stick to using `const` only with primitive values, you never have the confusion of the difference between re-assignment (not allowed) and mutation (allowed)! That's the safest and best way to use `const`. |

Besides `var` / `let` / `const`, there are other syntactic forms that declare identifiers (variables) in various scopes. For example:

```js
function hello(name) {
	console.log(`Hello, ${name}.`);
}

hello("Kyle");
// Hello, Kyle.
```

Here, the identifier `hello` is created in the outer scope, and it's also automatically associated so that it references the function. But the named parameter `name` is created only inside the function, and thus is only accessible inside that function's scope.

Both `hello` and `name` act generally as if they were declared with `var`.

Another syntax that declares a variable is the `catch` clause of a `try..catch` statement:

```js
try {
	someError();
}
catch (err) {
	console.log(err);
}
```

The `err` is a block-scoped variable that exists only inside the `catch` clause, as if it had been declared with `let`.

## Functions

TODO
