# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Appendix A: Exploring Further

| NOTE: |
| :--- |
| Work in progress |

This appendix explores nuances and edges around many of the topics covered in the main text of this book. This is optional, supporting material.

These discussions will be more heavily influenced by my opinions than the main text was, so keep that in mind as you consume and consider what is presented. In a way, this appendix is a bit like a collection of mini-blog posts that expound on the book topics.

## Implied Scopes

Scopes are sometimes created in non-obvious places. In practice, these implied scopes don't often impact your program behavior, but it's still useful to know they're happening.

### Parameter Scope

Chapter 2's conversation metaphor implies that function parameters are basically the same as locally declared variables in the function scope. But that's not always true.

Consider:

```js
// outer/global scope: RED(1)

function getStudentName(studentID) {
    // function scope: BLUE(2)

    // ..
}
```

Here, `studentID` is a considered a "simple" parameter, so it does behave essentially as if it's in the BLUE(2) function scope. But if we change it to be a non-simple parameter, that's no longer technically the case. Parameter forms considered non-simple include parameters with default values, rest parameters (using `...`), and destructured parameters.

Consider:

```js
// outer/global scope: RED(1)

function getStudentName(/* BLUE(2) */ studentID = 0) {
    // function scope: GREEN(3)

    // ..
}
```

Here, the parameter list essentially becomes its own scope, and the function's main scope is then nested inside *that* scope.

Why? And what difference does it make? The non-simple parameter forms introduce various corner cases, so the parameter list becomes its own scope to more effectively deal with them.

Consider:

```js
function getStudentName(studentID = maxID, maxID) {
    // ..
}
```

Assuming left-to-right operations, the default `= maxID` for the `studentID` parameter requires a `maxID` to already exist (and to have been initialized). This code produces a TDZ error (Chapter 5). The reason is, `maxID` is declared in the parameter scope, but it's not yet been initialized because of the order of parameters. If the parameter order is flipped, no TDZ error occurs:

```js
function getStudentName(maxID,studentID = maxID) {
    // ..
}
```

The complication gets even more *in the weeds* if we introduce a function expression into the default parameter position, which then can create its own closure (Chapter 7) over parameters in this implied parameter scope:

```js
function whatsTheDealHere(id,defaultID = () => id) {
    id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 5
```

That snippet probably makes sense, because the `defaultID()` arrow function closes over the `id` parameter/variable, which we then re-assign to `5`. But now let's introduce a shadowing definition of `id` in the function scope:

```js
function whatsTheDealHere(id,defaultID = () => id) {
    var id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 3
```

Uh oh! The `var id = 5` is shadowing the `id` parameter, and the closure of the `defaultID()` function is over the parameter, not the function variable. This proves that there's a scope bubble around the parameter list.

But it gets even crazier than that!

```js
function whatsTheDealHere(id,defaultID = () => id) {
    var id;

    console.log(`local variable 'id': ${ id }`);
    console.log(`parameter 'id' (via closure): ${ defaultID() }`);

    console.log("reassigning 'id' to 5");
    id = 5;

    console.log(`local variable 'id': ${ id }`);
    console.log(`parameter 'id' (via closure): ${ defaultID() }`);
}

whatsTheDealHere(3);
// local variable 'id': 3
// parameter 'id' (via closure): 3
// reassigning 'id' to 5
// local variable 'id': 5
// parameter 'id' (via closure): 3
```

The strange bit here is the first console message. Why doesn't that print `undefined`, since at that moment, the shadowing `id` local variable has just been `var id` declared, which Chapter 5 asserts is typically auto-initialized to `undefined` at the top of its scope.

In this specific corner case (for legacy compat reasons), JS doesn't auto-initialize `id` to `undefined`, but rather to the value of the `id` parameter (`3`)!

Though the two `id`s look at that moment like they're one variable, they're actually still separate (and in separate scopes). The `id = 5` causes the divergence to become observable, where the `id` parameter stays `3` and the local variable becomes `5`.

My advice to avoid getting bitten by these weird nuances:

* Never shadow parameters with local variables

* Avoid using a default parameter function that closes over any of the parameters

At least now you're aware and can be careful about the fact that the parameter list is its own scope if any of the parameters are non-simple.

### Function Name Scope

In Chapter 3's "Function Name Scope" section, I asserted that the name of a function expression is added to the function's own scope. Recall:

```js
var askQuestion = function ofTheTeacher(){
    // ..
};
```

It's true that `ofTheTeacher` is not added to the enclosing scope (where `askQuestion` is declared), but it's also not *just* added to the scope of the function, the way you're likely assuming. Another strange corner case of implied scope.

The name identifier of a function expression is in its own implied scope, nested between the outer enclosing scope and the main inner function scope.

If `ofTheTeacher` was in the function's scope, we'd expect an error here:

```js
var askQuestion = function ofTheTeacher(){
    // why is this not a duplicate declaration error?
    let ofTheTeacher = "Confused, yet?";
};
```

The `let` declaration form does not allow re-declaration (see Chapter 5). But this is perfectly legal shadowing, not re-declaration, because the two `ofTheTeacher`s are in separate scopes.

You'll rarely run into any case where the scope of a function's name identifier matters. But again, it's good to know how these mechanisms actually work. To avoid being bitten, just don't shadow function name identifiers.

## Anonymous vs. Named Functions

As discussed in Chapter 3, functions can be expressed either in named or anonymous form. It's vastly more common to use the anonymous form, but is that a good idea?

// TODO

### Arrow Functions

// TODO

### IIFE Variations

// TODO

## Hoisting: Functions and Variables

// TODO

## The Case for `var`

// TODO

## What's the Deal with TDZ?

// TODO

## Are Synchronous Callbacks Still Closures?

// TODO

## Classic Module Variations

// TODO
