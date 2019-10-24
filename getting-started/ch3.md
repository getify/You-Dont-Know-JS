# You Don't Know JS Yet: Getting Started - 2nd Edition
# Chapter 3: Exploring Deeper

| NOTE: |
| :--- |
| Work in progress |

If you've read Chapters 1 and 2, and taken the time to digest and percolate, you're hopefully starting to *get* JS a little more. If you skipped them (especially Chapter 2), I recommend you re-consider and spend some time with that material.

In Chapter 2, our focus was on syntax, patterns, and behaviors. Here, our attention shifts to some of the lower-level characteristics of JS that underpin virtually every line of code we write.

It should be noted that this material is still not an exhaustive exposition of JS; that's what the rest of the book series is for! Here, our goal is still just to *get started*, and more comfortable with, the *feel* of JS, how it ebbs and flows.

This chapter should begin to answer some of the "Why?" questions that are likely cropping up as you explore JS.

## Closure

What is Closure?

> Closure is the ability of a function to remember and continue to access variables defined outside its scope, even when that function is executed in a different scope.

Perhaps without realizing it, almost every JS developer has made use of closure. It's important to be able to recognize where it's in use in your programs, as the presence or lack of closure is sometimes the cause of bugs (or even performance impairments).

From the definition above, we see two parts that are critical. First, closure is a characteristic of a function. Objects don't get closures, functions do. Second, to observe a closure, you must execute a function in a different scope than where that function was originally defined.

Consider:

```js
function greeting(msg) {
    return function who(name) {
        console.log(`${msg}, ${name}!`);
    };
}

var hello = greeting("Hello");
var howdy = greeting("Howdy");

hello("Kyle");
// Hello, Kyle!

hello("Sarah");
// Hello, Sarah!

howdy("Grant");
// Howdy, Grant!
```

First, the `greeting(..)` outer function is executed, creating an instance of the inner function `who(..)`; that function closes over the variable `msg`, the parameter from the outer scope of `greeting(..)`. We return that inner function, and assign its reference to the `hello` variable. Then we call `greeting(..)` a second time, creating a new inner function instance, with a new closure over a new `msg`, and return that reference to be assigned to `howdy`.

When the `greeting(..)` function finishes running, normally we would expect all of its variables to be garbage collected (removed from memory). We'd expect each `msg` to go away, but they don't. The reason is closure. Since the inner function instances are still alive (assigned to `hello` and `howdy`, respectively), their closures are still preserving the `msg` variables.

These closures are not a snapshot of the `msg` variable's value; they are a direct link and preservation of the variable itself. That means closure can actually observe (or make!) updates to these variables over time.

```js
function counter(step = 1) {
    var count = 0;
    return function increaseCount(){
        count = count + step;
        return count;
    };
}

var incBy1 = counter(1);
var incBy3 = counter(3);

incBy1();       // 1
incBy1();       // 2

incBy3();       // 3
incBy3();       // 6
incBy3();       // 9
```

Each instance of the inner `increaseCount()` function is closed over both the `count` and `step` variables from its outer `counter(..)` function's scope. `step` remains the same over time, but `count` is updated on each invocation of that inner function. Since closure is over the variables and not just snapshots of the values, these updates are preserved.

Closure is most common when working with asynchronous code, such as with callbacks. Consider:

```js
function getSomeData(url) {
    ajax(url,function onResponse(resp){
        console.log(`Response (from ${url}): ${resp}`);
    });
}

getSomeData("https://some.url/wherever");
// Response (from https://some.url/wherever): ..whatever..
```

The inner function `onResponse(..)` is closed over `url`, and thus preserves and remembers it until the Ajax call returns and executes `onResponse(..)`. Even though `getSomeData(..)` finishes right away, the `url` parameter variable is kept alive in the closure for as long as needed.

It's not necessary that the outer scope be a function -- it usually is, but not always -- just that there be at least one variable in an outer scope than an inner function accesses, and thus closes over.

```js
for (let [idx,btn] of buttons.entries()) {
    btn.addEventListener("click",function onClick(evt){
       console.log(`Clicked on button (${idx})!`);
    });
}
```

Because this loop is using `let` declarations, each iteration gets new block-scoped (aka, local) `idx` and `btn` variables;  the loop also creates a new inner `onClick(..)` function each time. That inner function closes over `idx`, preserving it for as long as the click handler is set on the `btn`. So when each button is clicked, its handler can print its associated index value, because the handler remembers its respective `idx` variable.

Rememeber: this closure is not over the value (like `1` or `3`), but over the variable `idx` itself.

Closure is one of the most prevalent and important programming patterns in any language. But that's especially true of JS; it's hard to imagine doing anything useful without leveraging closure in one way or another.

## `this` Keyword

TODO

## Prototypes

TODO

## Iteration

TODO
