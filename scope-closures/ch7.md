# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 7: Using Closures

| NOTE: |
| :--- |
| Work in progress |

Up to this point, we've focused on the ins and outs of lexical scope, and how that affects the organization and usage of variables in our programs.

Our attention again shifts broader in abstraction, to the historically somewhat daunting topic of closure. Don't worry! You don't need an advanced Computer Science degree to make sense of it.

As a matter of fact, we already saw an example of closure in the previous chapter, and you've almost certainly already used it in your own programs. If you've ever written a callback that accesses variables outside its own scope... guess what!? That's closure.

Indeed, you may actually find this chapter's revelation of what closure is rather... anticlimactic.

Even still, closure is one of the most important language characteristics ever invented in programming -- it underlies major programming paradigms, including Functional Programming (FP), modules, and even a bit of class-oriented design. Getting comfortable with closure is required for mastering JS and effectively leveraging many important design patterns throughout your code.

## Big Picture

Addressing all aspects of closure presents a daunting mountain of discussion and code throughout this chapter. Make sure to take your time and ensure you're comfortable with each bit before moving onto the next.

Even still, it's helpful to start with a quick glance at *why* we're digging so deeply into this topic.

Recall Chapter 6's message: the *least exposure* (POLE) principle encourages us to use block (and function) scoping to limit the scope exposure of variables. This helps keep code be understandable and maintainable, and helps avoid many scoping pitfalls (i.e., name collision, etc).

Closure expands this approach: for variables we need to use over time, instead of placing them in larger outer scopes, we can encapsulate (more narrowly scope) them but still preserve access from inside functions, for broader use. Functions *remember* these referenced scoped variables via closure.

Our broad goal in this book is not merely to understand scope, but to more effectively use it in the structure of our programs. Closure is central to these efforts.

## See The Closure

Closure is originally a mathematical concept, from lambda calculus. But I'm not going to list out math formulas or use a bunch of notation and jargon to define it.

Instead, I'm going to use a practical perspective to illuminate closure. I want to define closure in terms of what we can observe in different behavior of our programs, as opposed to if closure was not present in JS.

First, closure is a behavioral characteristic of functions. If you aren't dealing with a function, closure does not apply. An object cannot have closure, nor does a class have closure (though its function methods might). Only functions.

For closure to be observed, a function must be invoked, and specifically it must be invoked from a different branch of the scope chain from where it was originally defined. A function executing in the same scope it was defined would not exhibit any observably different behavior with or without closure being possible, so by my observational perspective of the definition, that is not closure.

Let's look at some code:

```js
function lookupStudent(studentID) {
    var students = [
        { id: 14, name: "Kyle" },
        { id: 73, name: "Suzy" },
        { id: 112, name: "Frank" },
        { id: 6, name: "Sarah" }
    ];

    return function greetStudent(greeting){
        var studentName;

        for (let student of students) {
            if (student.id == studentID) {
                studentName = student.name;
                break;
            }
        }

        return `${ greeting }, ${ studentName }!`;
    };
}

var chosenStudents = [
    lookupStudent(6),
    lookupStudent(112)
];

// accessing the function's name:
chosenStudents[0].name;
// greetStudent

chosenStudents[0]("Hello");
// Hello, Sarah!

chosenStudents[1]("Howdy");
// Howdy, Frank!
```

The first thing to notice about this code is that the `lookupStudent(..)` outer function creates and returns an inner function called `greetStudent(..)`. The `lookupStudent(..)` function is called twice, producing two separate instances of its inner `greetStudent(..)` function, both of which are saved into the `chosenStudents` array.

We verify that's the case by checking the `.name` property of the returned function saved in `chosenStudents[0]`, and it's indeed an instance of the inner `greetStudent(..)`.

After each call to `lookupStudent(..)` finishes, it would seem like all its inner variables would be discarded and GC'd (garbage collected). The inner function is the only thing that seems to be returned and preserved. But here's where the behavior differs in ways we can start to observe.

While `greetStudent(..)` does receive a single argument as the parameter named `greeting`, it also makes reference to both `students` and `studentID`, identifiers which come from the enclosing scope of `lookupStudent(..)`. Each of those references from the inner function to the variable in an outer scope is called a *closure*. In academic terms, each instance of `greetStudent(..)` *closes over* the outer variables `students` and `studentID`.

So what do those closures do here, in a concrete, observable sense?

Closure allows `greetStudent(..)` to continue to access those outer variables even after the outer scope is finished (when each call to `lookupStudent(..)` completes). Instead of each instance of `students` and `studentID` being GC'd, they stay around in memory. At a later time when either instance of the `greetStudent(..)` function is invoked, those variables are still there, holding their current values.

If JS functions did not have closure, the completion of each `lookupStudent(..)` call would immediately tear down its scope and GC the `students` and `studentID` variables. When we later called one of the `greetStudent(..)` functions, what would then happen?

If `greetStudent(..)` tried to access what it thought was a BLUE(1) marble, but that marble did not actually exist (anymore), the reasonable assumption is we should get a `ReferenceError`, right?

But we don't get an error. The fact that `chosenStudents[0]("Hello")` is able to execute as expected, and give us the message "Hello, Sarah!", means it was still able to access the `students` and `studentID` variables. This is a direct observation of closure!

Let's examine one of the canonical examples often cited for closure:

```js
function adder(x) {
    return function addTo(y){
        return x + y;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15);    // 25
add42To(9);     // 51
```

Each instance of the inner `addTo(..)` function is closing over its own `x` variable (with values `10` and `42`, respectively), so those `x`'s don't go away just because `adder(..)` finishes. When we later invoke one of those inner `addTo(..)` instances, such as the `add10To(15)` call, its closed over `x` variable still exists and still holds the original `10` value. The operation is thus able to perform `10 + 15` and return the answer `25`.

An important detail might have been too easy to gloss over in that previous paragraph, so let's reinforce it: closure is associated with an instance of a function, rather than its static lexical definition. In the above snippet, there's just one inner `addTo(..)` function inside `adder(..)`, so it might seem like that would imply a single closure.

But actually, every time the outer `adder(..)` function runs, a *new* inner `addTo(..)` function instance is created, and for each new instance, a new closure. So each inner function instance (named `add10To(..)` and `add42To(..)`) has its own closure over its own instance of the scope environment for that execution of `adder(..)`.

Even though closure is based on lexical scope, which is handled at compile-time, it's more precisely a run-time characteristic of function instances.

### Live Link, Not a Snapshot

In the prior 2 examples from the previous sections, we **read the value from a variable** that was part of a closure. That can make it sort of feel like closure is a snapshot of a value at some given moment. Indeed, that's an extremely common misconception.

Closure is actually a live link, a preservation of the full variable itself. We're not limited to merely reading its value; the closed-over variable can be updated (reassigned) as well.

Consider:

```js
function makeCounter() {
    var count = 0;

    return getCurrent(){
        count = count + 1;
        return count;
    };
}

var hits = makeCounter();

// later

hits();     // 1

// later

hits();     // 2
hits();     // 3
```

The `count` variable is closed over by the inner `getCurrent()` function, which keeps it around instead of it being subjected to GC. The `hits()` function calls access *and* update this variable, returning an incrementing count each time.

It is not necessary for the outer scope to be a function, only that there be an inner function present inside the outer scope:

```js
var hits;

{   // an outer scope (but not a function)
    let count = 0;

    hits = function getCurrent(){
        count = count + 1;
        return count;
    };
}

hits();     // 1
hits();     // 2
hits();     // 3
```

| NOTE: |
| :--- |
| I deliberately did not define `getCurrent()` as a function declaration in this example, but rather as a function expression assignment. This has nothing to do with closure, but with the dangerous quirks of FiB as discussed in Chapter 6. |

Because closure is not a snapshot of a value, but rather a live link to a variable, developers sometimes get tripped up trying to use closure to preserve a desired value.

Consider:

```js
var studentName = "Frank";

var greeting = function hello() {
    // we are closing over `studentName`,
    // not "Frank"
    console.log(
        `Hello, ${ studentName }!`
    );
}

// later

studentName = "Suzy";

// later

greeting();
// Hello, Suzy!
```

A mistake often made when defining a function at a certain point in the program is to assume that closure captures the current value of whatever variable(s) it references. The assumption would thus be that `greeting()` should return "Hello, Frank!".

But `greeting()` (or `hello()`, if you like) is closed over `studentName`, not its value. When `greeting()` is invoked, the updated (current) value of the variable (`"Suzy"`) is always reflected.

The classic canonical illustration of this mistake is using closure inside a loop:

```js
var fns = [];

for (var i = 0; i < 3; i++) {
    fns[i] = function fn(){
        // closure over `i`
        return i;
    };
}

fns[0]();   // 3 -- WHY!?
fns[1]();   // 3
fns[2]();   // 3
```

| NOTE: |
| :--- |
| This cited example typically uses a `setTimeout(..)` or some other sort of callback call, like an event handler, inside the loop. I've simplified the example to storing function callbacks in an array, so that we don't need to consider asynchronous timing in our analysis. The principle is the same, regardless. |

You might have expected the `fns[0]()` invocation to return `0`, since that function was created when `i` was `0` (the first iteration of the loop). But that incorrect thinking stems from the belief that closure captures values instead of linking variables.

In the loop snippet above, something about the syntax of the `for`-loop tricks us into thinking that each iteration gets a new `i` variable, but in fact, there's just one `i`, since it was declared with `var`.

So each saved function returns `3`, because by the end of the loop, the single `i` variable in the program has been assigned `3`. Each of the 3 functions in the `fns` array have individual closures, but they're all closed over that same `i` variable.

A single variable can obviously only ever hold one value at a time. So if you want to preserve/capture multiple values, you need a different variable to hold each.

How could we do that? Let's create a new variable for each iteration:

```js
var fns = [];

for (var i = 0; i < 3; i++) {
    // new variable `j` created each iteration,
    // which gets a copy of the value of `i` at
    // this moment.
    let j = i;

    fns[i] = function fn(){
        return j;   // close over `j` not `i`
    };
}

fns[0]();   // 0
fns[1]();   // 1
fns[2]();   // 2
```

Now, each function is closed over a separate (new) variable from each iteration (even though all of them are named `j`!). And each `j` got a copy of the value of `i` at that point in the iteration, and `j` then never gets re-assigned. So all 3 functions maintain their respective and expected values: `0`, `1`, and `2`.

Again remember, even if we were using asynchrony in this program, such as passing these `fn()` functions into `setTimeout(..)` or some event handler subscription, the same principle of closure would apply.

There's another little quirk or trick that JS gives us with block-declared variables in `for`-loop headers. Recall "Loops" in Chapter 7, which illustrated how a `let` declaration in a `for` loop actually creates not just one variable for the loop, but creates a new variable for *each iteration* of the loop. That's exactly what we need for our closures!

Consider:

```js
var fns = [];

for (let i = 0; i < 3; i++) {
    // the `let i` gives us a new `i`
    // for each iteration automatically!

    fns[i] = function fn(){
        return i;
    };
}

fns[0]();   // 0
fns[1]();   // 1
fns[2]();   // 2
```

Since we're using `let`, 3 `i`'s are created, one for each loop, so the closure *just works* as expected.

### Common Closures

Closure is most commonly encountered with asynchronous callbacks:

```js
function lookupStudentRecord(studentID) {
    ajax(
        `https://some.api/student/${ studentID }`,
        function onRecord(record) {
            console.log(
                `${ record.name } (${ studentID })`
            );
        }
    );
}

lookupStudentRecord(114);
// Frank (114)
```

The `onRecord(..)` callback is going to be invoked at some point in the future, after the response from the Ajax call comes back. This invocation will happen from the internals of the `ajax(..)` utility, wherever that is defined. Furthermore, when that happens, the `lookupStudentRecord(..)` call will long since have completed.

Why then is `studentID` still around and accessible to the callback? Closure.

Event handlers are another common example of closure:

```js
function listenForClicks(btn,label) {
    btn.addEventListener("click",function onClick(){
        console.log(
            `The ${ label } button was clicked!`
        );
    });
}

var submitBtn = document.getElementById("submit-btn");

listenForClicks(submitBtn,"Checkout");
```

The `label` parameter variable is closed over by the `onClick(..)` event handler callback. If and when the button is ever clicked, `label` is still preserved. This is closure.

### What If I Can't See It?

You've probably heard this common addage:

> If a tree falls in the forest but nobody is around to hear it, does it make a sound?

It's a silly bit of philosophical gymnastics. Of course from a scientific perspective, sound waves are made. But the point is, *does it matter* if the sound happens?

Remember, the emphasis in our definition of closure is observability. If a closure exists (in a technical, implementation, or academic sense) but it cannot be observed in our programs, *does it matter?* No.

To reinforce this point, let's look at some examples that are *not* observably based on closure:

```js
function say(myName) {
    var greeting = "Hello";
    output();

    function output() {
        console.log(
            `${ greeting }, ${ myName }!`
        );
    }
}

say("Kyle");
// Hello, Kyle!
```

There's an inner function and it accesses the variables `greeting` and `myName` from an enclosing scope. But the invocation of `output()` happens in that same scope, where of course `greeting` and `myName` are still available; that's just lexical scope.

Any lexically-scoped language whose functions didn't support closure would still behave this same way. This example does not demonstrate observable closure.

In fact, global scope variables essentially cannot be (observably) closed over, because they're always accessible from everywhere. No function can ever be invoked in any part of the scope chain that is not descended from the global scope.

Consider:

```js
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getFirstStudent() {
    return function firstStudent(){
        return students[0].name;
    };
}

var student = getFirstStudent();

student();
// Kyle
```

The inner `firstStudent()` function does reference `students` which is a variable outside its own scope. But since `students` happens to be from the global scope, no matter where that function is invoked in the program, its ability to access `students` is nothing more special than normal lexical scope.

All function invocations can always access variables from the global scope, regardless of whether closure is supported by the language or not. Global variables cannot be closed over in any meaningful (observable) sense. Or put another way: global variables are always available throughout the whole program, so they don't need to be closed over. No observation of closure here.

Variables that are merely present but never accessed are not closed over:

```js
function lookupStudent(studentID) {
    return function nobody(){
        var msg = "Nobody's here yet.";
        console.log(msg);
    };
}

var student = lookupStudent(112);

student();
// Nobody's here yet.
```

The inner function `nobody()` doesn't close over any outer variables -- it only uses its own variable `msg`. But `studentID` is present in the enclosing scope. Since `studentID` is not referred to by `nobody()`, the JS engine doesn't need to keep `studentID` around after `lookupStudent(..)` has finished running; the GC wants to clean up that memory!

Whether JS functions supported closure or not, this program would behave the same. Therefore, there's no closure here.

If there's no function invocation, there's no closure:

```js
function greetStudent(studentName) {
    return function greeting(){
        console.log(
            `Hello, ${ studentName }!`
        );
    };
}

greetStudent("Kyle");

// nothing else happens
```

This one's tricky, because the outer function definitely does get invoked. But the inner function is the one that *could* have had closure, and yet it's never invoked; the returned function here is just thrown away. So even if technically closure might have occured inside the JS engine for a brief moment, it was not observed in any meaningful way in this program.

A tree may have fallen, but we didn't hear it, so we don't care.

### Observable Definition

We're now ready for a clear and concise definition of closure:

> Closure is observed when a function uses variable(s) from outer scope(s) even while running in a scope where those variable(s) aren't accessible.

The key parts of this definition are:

* must be a function involved

* must reference at least one variable from an outer scope

* must be invoked in a different branch of the scope chain from the variable(s)

This observation-oriented definition reminds us that we shouldn't dismiss closure as some indirect, academic trivia. Instead, we need to look and plan for the direct, concrete effects closure has on our program behavior.

## The Closure Lifecycle

Since closure is inherently tied to a function instance, its closure over a variable lasts as long as there is still a reference to that function.

If 10 functions all close over the same variable, and over time 9 of these function references are discarded, the remaining function reference still preserves that variable. Once that final function reference is discarded, the last closure over that variable is gone, and the variable itself is GC'd.

This has an important impact on building efficient and performant programs, because closure can unexpectedly prevent the GC of a variable that you're otherwise done with, which can lead to run-away memory usage over time. That's why it's important to discard function references (and thus their closures) when they're not needed anymore.

Consider:

```js
function manageBtnClickEvents(btn) {
    var clickHandlers = [];

    return function listener(cb){
        if (cb) {
            let clickHandler =
                function onClick(evt){
                    console.log("clicked!");
                    cb(evt);
                };
            clickHandlers.push(clickHandler);
            btn.addEventListener(
                "click",
                clickHandler
            );
        }
        else {
            // passing no callback unsubscribes
            // all click handlers
            for (let handler of clickHandlers) {
                btn.removeEventListener(
                    "click",
                    handler
                );
            }

            clickHandlers = [];
        }
    };
}

// var mySubmitBtn = ..
var onSubmit = manageBtnClickEvents(mySubmitBtn);

onSubmit(function checkout(evt){
    // handle checkout
});

onSubmit(function trackAction(evt){
    // log action to analytics
});

// later, unsubscribe all handlers:
onSubmit();
```

In this program, the inner `onClick(..)` function holds a closure over the passed in `cb` (the provided event callback). That means that `checkout()` and `trackAction()` function references are held via closure (and cannot be GC'd) for as long as these event handlers are subscribed.

When we call `onSubmit()` with no input, all event handlers are unsubscribed, and the `clickHandlers` array is reset. Once all click handler function references are discarded, all closures and their  `cb` references to `checkout()` and `trackAction()` are discarded.

The call to unsubscribe an event handler when it's no longer needed can be even more important the subscription -- again, considering the overall health and efficiency of the program.

### Per Variable or Per Scope?

Another question we need to tackle: should we think of closure as applied to just the referenced outer variable(s) present in an inner function, or does closure preserve the entire scope chain with all its variables?

In other words, in the previous event subscription snippet, is the inner `onClick(..)` function closed over only `cb`, or is it also closed over `clickHandler`, `clickHandlers`, and `btn`?

Conceptually, closure is **per variable** rather than *per scope*. But the answer is more complicated than that.

Another program to consider:

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    return addGrade;

    // ************************

    function getGrade(record){
        return record.grade;
    }

    function sortAndTrimGradesList() {
        // sort by grades, descending
        grades.sort(function desc(g1,g2){
            return g2 - g1;
        });

        // only keep the top 10 grades
        grades = grades.slice(0,10);
    }

    function addGrade(newGrade) {
        grades.push(newGrade);
        sortAndTrimGradesList();
        return grades;
    }
}

var addNextGrade = manageStudentGrades([
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    // ..many more records..
    { id: 6, name: "Sarah", grade: 91 }
]);

// later

addNextGrade(81);
addNextGrade(68);
// [ .., .., ... ]
```

The outer function `manageStudentGrades(..)` takes a list of student records, and returns a function reference (`addGrade(..)`), which we externally label `addNextGrade(..)`. Each time we call `addNextGrade(..)` with a grade, we get back a current list of the top 10 grades, sorted descending (see `sortAndTrimGradesList()`).

From the end of the original `manageStudentGrades(..)` call, and between the multiple `addNextGrade(..)` calls, the `grades` variable is closed over (inside `addGrade(..)`); that's how the running list of top grades is maintained. Remember, it's a closure over the variable `grades`, not its value (the array it holds).

That's not the only closure involved, however. Can you spot other variables being closed over?

Did you spot that `addGrade(..)` references `sortAndTrimGradesList`? That means it's also closed over that variable, which happens to hold a reference to the `sortAndTrimGradesList()` function. That second inner function has to stay around so that `addGrade(..)` can keep calling it, which also means any variables *it* closes over stick around -- in this case, nothing extra is closed over.

What else is closed over?

Examine the `getGrade` variable (and its function); is it closed over? It's referenced in the outer scope of `manageStudentGrades(..)`, used in the initial `.map(getGrade)` call. But it's not referenced inside of `addGrade(..)` or `sortAndTrimGradesList()`.

What about the (potentially) large list of student records we pass in as `studentRecords`, is that variable closed over? If it is, the array of student records is never getting GC'd, which leads to this program holding onto a larger amount of memory than we might assume. But if we look closely again, none of the inner functions that are preserved via closure are referencing `studentRecords`.

According to the *per variable* definition of closure, since `getGrade` and `studentRecords` are *not* referenced in the inner functions, they're not closed over, and are therefore freely available for GC right after the initial `manageStudentGrades(..)` completes.

Indeed, try debugging the above code in a recent JS engine, like v8 in Chrome, placing a breakpoint inside the `addGrade(..)` function. You may notice that the inspector **does not** list the `studentRecords` variable. That's proof, debugging wise anyway, that the engine does not maintain `studentRecords` via closure.

But how reliable is this observation as proof? Consider this (rather contrived!) program:

```js
function storeStudentInfo(id,name,grade) {
    return function getInfo(whichValue){
        // warning:
        //   using `eval(..)` is a bad idea!
        var val = eval(whichValue);
        return val;
    };
}

var info = storeStudentInfo(73,"Suzy",87);

info("name");
// Suzy

info("grade");
// 87
```

Notice that the inner function `getInfo(..)` is not explicitly closed over any of `id`, `name`, or `grade` variables. And yet, calls to `info(..)` seem to still be able to access the variables, albeit through use of the `eval(..)` lexical scope cheat (see Chapter 1).

So all the variables were definitely preserved via closure, despite not being explicitly listed in the inner function. Does that disprove the *per variable* notion and prove *per scope* instead? Not exactly, either.

Many modern JS engines do apply an *optimization* that removes any variables from a closure scope that aren't explicitly referenced. However, as we see with `eval(..)`, there are situations where such an optimization cannot be applied, and thus the closure scope continues to contain all its original variables.

Even as recent as a few years ago, many JS engines did not apply this optimization to most programs, so it's possible your websites may still run in such browsers, especially on older or lower end devices. And the fact that it's an optional optimization in the first place, rather than a design guarantee from the specification, means that we shouldn't casually over-assume its applicability.

In cases where a variable holds a large value (like an object or array) and that variable is present in a closure scope, if you don't want that variable and value to be preserved, it's safer (from a memory usage perspective) to manually discard the value rather than relying on the closure optimization and GC.

Let's apply a *fix* to the earlier `manageStudentGrades(..)` example to ensure the potentially large array held in `studentRecords` is not caught up in a closure scope unnecessarily:

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    // unset `studentRecords` to prevent unwanted
    // memory retention in the closure
    studentRecords = null;

    return addGrade;

    // ..
}
```

We're not removing `studentRecords` from the closure scope; that we cannot control. We're simply ensuring that even if `studentRecords` remains in the closure scope, it's not holding onto memory unnecessarily with referencing the potentially large array of data.

We also technically don't need the function `getGrade()` anymore after the `.map(getGrade)` call completes, so we could even possibly eek out a tiny bit more memory by freeing up that reference so its value isn't tied up either. That's likely unnecessary in this example, but broadly this is a technique to be aware of if you're profiling the memory performance of a critical part of your application and find too much being retained.

The takeaway: it's important to know where closures appear our programs, and what variables are (or may be) included. We need to manage these closures so we're only holding onto what's needed and not wasting memory.

## Why Closure?

Now that we have a better sense of what closure is and how it works, let's explore the motivations behind leveraging closure.

// TODO
