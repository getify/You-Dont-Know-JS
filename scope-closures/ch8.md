# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 8: The Module Pattern

| NOTE: |
| :--- |
| Work in progress |

We've examined every angle of lexical scope, from the breadth of the global scope down through nested block scopes, into the intricasies of the variable lifecycle. Then we leveraged lexical scope to understand the power of closure. Throughout all the discussion so far, the underlying thread has been that understanding and mastering scope and closure is central to properly structuring and organizing our code, especially where we store information in variables.

Take a moment to reflect on how far you've come in this journey so far; you've taken big steps in getting to know JS more deeply!

In this chapter, we wrap up the main text of the book by exploring one of the most important code organization patterns in all of programming: the module. As we'll see, modules are inherently built from what we've already covered. Modules are the payoff for your efforts in learning lexical scope and closure.

To whatever extent these topics may still feel a bit abstract or mostly academic, our goal here is to appreciate where modules elevate our thinking to concrete, practical impact on how we write programs.

## Encapsulation and POLE

Encapsulation is often cited as a principle of object-oriented (OO) programming, but it's more fundamental and broadly applicable than that. The goal of encapsulation is the bundling or co-location of information (data) and behavior (functions) that serve a common purpose.

Independent of any syntax or code mechanisms, the spirit of encapsulation can be realized in something as simple as organizing bits of the program with common purpose into separate files. If we bundle everything that powers a list of search results into a single file called "search-list.js", we're encapsulating that part of the program.

A modern trend in front-end programming to organize applications around Component architecture pushes encapsulation even further. It feels natural to consolidate everything that constitutes the search results list -- even beyond code, to include presentational markup and styling -- into a single unit of program logic, something tangible we can interact with. So we label that collection the "SearchList" component.

Another key goal is the control of visibility of certain aspects of the encapsulated data and functionality. Recall the POLE principle from Chapter 6, which seeks to defensively guard against various *dangers* of over-exposure; these apply not only to variables but also functions. In JS, we most often accomplish visibility control through the mechanics of lexical scope.

The idea is to group alike program bits together, and selectively limit programmatic access to certain parts which can reasonably be described as *private* details. What's not considered *private* is then by default *public*, accessible to the whole program.

The natural effect of this effort is better code organization. It's easier to build and maintain software when we know where things are, with clear and obvious boundaries and connection points. It's also easier to maintain quality if we avoid the pitfalls of over-exposed data and functionality.

These are some of the main benefits of organizing JS programs into modules.

## What is a Module?

A module is a collection of related data and functions (often referred to as methods in this context), characterized by a division between hidden *private* details and *public*, accessible details, usually called the "public API".

A modules should be stateful -- it needs to maintain some information -- otherwise, it's not really a module. If all you have is a collection of related functions, but no data, then you don't have encapsulation and thus you don't have a module.

The better term for a grouping of *stateless* functions is a namespace:

```js
// namespace, not module
var Utils = {
    cancelEvt(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
    },
    wait(ms) {
        return new Promise(function c(res){
            setTimeout(res,ms);
        });
    },
    isValidEmail(email) {
        return /[^@]+@[^@.]+\.[^@.]+/.test(email);
    }
};
```

`Utils` here is a useful collection of utilities, yet they're all state-independent functions. Gathering functionality together is generally good pratice, but that doesn't make this a module. Rather, we've defined a `Utils` namespace and organized the functions under it.

Further, even if you have data and stateful functions bundled together, if you're not limiting the visibility of any of it, then it's falling short of the POLE aspect of encapsulation and is probably not useful to label as a module.

Consider:

```js
var Student = {
    records: [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ],
    getName(studentID) {
        var student = this.records.find(
            student => student.id == studentID
        );
        return student.name;
    }
};

Student.getName(73);
// Suzy
```

Since `records` is publicly accessible data, not hidden behind a public API, `Student` here isn't really a module. What is it? `Student` does have the data-plus-functionality aspect of encapsulation, but not the visibility-control aspect; it's just an instance of a general data structure.

| NOTE: |
| :--- |
| A broader concern of the module pattern is fully embracing system modularization through loose-coupling and other program architecture concerns. That's a complex topic well beyond the bounds of our discussion, but is worth further study beyond this book. |

### Classic Modules

Let's turn `Student` into a module. We'll start with what's called the "classic module pattern", which also was referred to as the "revealing module pattern" when it first emerged in the early 2000's.

Consider:

```js
var Student = (function defineStudent(){
    var records = [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ];

    var publicAPI = {
        getName
    };

    return publicAPI;

    // ************************

    function getName(studentID) {
        var student = records.find(
            student => student.id == studentID
        );
        return student.name;
    }
})();

// later

Student.getName(73);
// Suzy
```

`Student` is now an instance of a module. It features a public API with a single method: `getName(..)`. This method is able to access the private hidden `records` data.

| WARNING: |
| :--- |
| I should point out that the explicit student data being hard-coded into this module definition is just for our illustration purposes. A typical module in your program will receive this data from an outside source, typically loaded from databases, JSON data files, Ajax calls, etc. The data is then injected into the module instance typically through some method(s) of the module's public API. |

How does the classic module format work?

Notice that the instance of the module is created by the `defineStudent()` IIFE being executed. This IIFE returns the object (named `publicAPI`) which has a property on it referencing the inner `getName(..)` function.

The naming of the object as `publicAPI` is purely stylistic preference on my part. The object can be named whatever you like (JS doesn't care), or you can just return an object directly without assigning it to any internal named variable. I like to assign it to `publicAPI` because it nicely labels what the object is, and also is a handy reference to the module's public API from inside itself, if needed.

From the outside, `Student.getName(..)` invokes this exposed inner function, which maintains access to the inner `records` variable via closure.

You don't *have* to return an object with a function as one of its properties. You could just return a function directly, in place of the object. That still satisfies all the core bits of a classic module.

By virtue of how lexical scope works, defining variables and functions inside your outer module definition function makes everything *by default* private. Only properties added to the public API object returned from the function will be exported for external use.

The use of an IIFE implies that our module only ever needs a single central instance, which is commonly referred to as a "singleton". Indeed, this specific example is simple enough that there's no obvious reason we'd need anything more than just one instance of the `Student` module.

But if we did want to define a module that supported multiple instances in our program, we can slightly tweak the code:

```js
function defineStudent() {
    var records = [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ];

    var publicAPI = {
        getName
    };

    return publicAPI;

    // ************************

    function getName(studentID) {
        var student = records.find(
            student => student.id == studentID
        );
        return student.name;
    }
}

// later

var fullTime = defineStudent();
fullTime.getName(73);
// Suzy
```

Rather than specifying `defineStudent()` as an IIFE, we just define it as a normal standalone function, which is commonly referred to in this pattern as a "module factory" function.

We then call the module factory, producing an instance of the module that we name `fullTime`. `fullTime.getName(..)` can now invoke the method on that specific instance.

So to clarify what makes something a classic module:

* there must be an outer scope, typically from a module factory function running at least once.

* the module's inner scope must have at least one piece of hidden information that represents state for the module.

* the module must return on its public API a reference to at least one function that has closure over the hidden module state (so that this state is actually preserved).

You may run across other variations on this classic module approach, which we'll look at in more detail in Appendix A.

## Node CommonJS Modules

In Chapter 4, we introduced the CommonJS module format used by Node. Unlike the classic module format described earlier, where you could bundle the module factory or IIFE alongside any other code including other modules, CommonJS modules are file-based; one module per file.

Let's tweak our module example to adhere to that format:

```js
module.exports.getName = getName;

// ************************

var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}
```

The `records` and `getName` identifiers are in the top-level scope of this module, but that's not the global scope (as explained in Chapter 4). As such, everything here is *by default* private to the module.

To expose something on the public API of a CommonJS module, you add a property to the empty object provided by `module.exports`. In some older legacy code, you may run across references to just a bare `exports`, but for code clarity you should always fully qualify that reference with the `module.` prefix.

For style purposes, I like to put my "exports" at the top and my module implementation at the bottom. But these exports can be placed anywhere. I strongly recommend collecting them all together, either at the top or bottom of your file.

Some developers have the habit of replacing the default exports object, like this:

```js
module.exports = {
    // ..exports..
};
```

There are some quirks with this approach, including unexpected behavior if multiple such modules circularly depend on each other. As such, I recommend against replacing the object. If you want to assign multiple exports at once, using the object literal style, you can do this instead:

```js
Object.assign(module.exports,{
   // .. exports ..
});
```

What's happening here is defining the `{ .. }` object literal with your module's public API specified, and then `Object.assign(..)` is doing a shallow copy of all those properties onto the existing `module.exports` object. This is a nice balance of convenience and safer module behavior.

To include another module into your module/program, use Node's `require(..)` method. Assuming the above module is located at "/path/to/student.js", this is how we can access it:

```js
var Student = require("/path/to/student.js");

Student.getName(73);
// Suzy
```

`Student` now references the public API of our example module.

CommonJS modules behave as singleton instances, similar to the IIFE module definition style presented above. No matter how many times you `require(..)` the same module, you just get additional references to the single module instance.

`require(..)` is an all-or-nothing mechanism; it includes a reference of the entire exposed public API of the module. To effectively access only part of the API, the typical approach looks like this:

```js
var getName = require("/path/to/student.js").getName;
```

Similar to the classic module format, the publicly exported methods of a CommonJS module's API hold closures over the internal module details. That's how the module singleton state is maintained across the lifetime of your program.

| NOTE: |
| :--- |
| Typically, you'll see Node modules loaded like this: `require("student")`. Node has an algorithm for resolving such non-absolute paths specified in the string, which includes assuming a ".js" file extension and looking for the module inside the project's "node_modules" sub-directory. Consult Node's current documentation for more information. |

## Modern ES Modules (ESM)

The ESM format shares several similarities with the CommonJS format. ESM is file-based, and module instances are singletons. Additionally, everything specified inside an ESM file is *by default* private, unless explicitly exported.

One notable difference is that ESM files are assumed to be strict-mode, without needing a `"use strict"` pragma at the top. There's no way to define an ESM as non-strict-mode.

Instead of `module.exports` in CommonJS, ESM uses an `export` keyword to expose something on the public API of the module. Instead of Node's `require(..)`, you use the `import` keyword to import some or all of its API.

Let's tweak the code in the "students.js" file from the previous section to fit the ESM format:

```js
export getName;

// ************************

var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}
```

The only change here is the `export getName` statement. As before, `export` statements can appear anywhere throughout the file, though `export` must be at the top-level scope; it cannot be inside any other block or function.

ESM offers a fair bit of variation on how the `export` statements can be specified. For example:

```js
export function getName(studentID) {
    // ..
}
```

Even though `export` appears before the `function` keyword here, this form is a `function` declaration that also happens to be exported. That is, the `getName` identifier is *function hoisted* (see Chapter 5), so it's available throughout the whole scope of the module.

Another allowed variation:

```js
export default function getName(studentID) {
    // ..
}
```

This is a so-called "default export", which has different semantics from other exports. In essence, a "default export" is a short-hand for consumers of the module when they `import`, giving them a terser syntax when they only need this single default API member.

Non-`default` exports are referred to as "named exports".

The `import` keyword -- like `export`, must be used only at the top-level of an ESM outside of any blocks or functions -- also has a number of variations in syntax. The first is referred to as "named import":

```js
import { getName } from "/path/to/students.js";

getName(73);
// Suzy
```

As you can see, this form imports only the specifically named public API members from a module (skipping anything not named explicitly), and it adds those identifiers to the top-level scope of the current module. This type of import is a familiar style from package imports in languages like Java.

Multiple API members can be listed inside the `{ .. }` set, separated with commas. A named import can also be *renamed* with `as`:

```js
import { getName as getStudentName }
   from "/path/to/students.js";

getStudentName(73);
// Suzy
```

If `getName` is a "default export" of the module, we could instead import it like this:

```js
import getName from "/path/to/students.js";

getName(73);
// Suzy
```

The only difference here is dropping the `{ }` around the import binding. If you want to mix a default import with other named imports:

```js
import { default as getName, /* .. other names .. */ }
   from "/path/to/students.js";

getName(73);
// Suzy
```

By contrast, the other major variation on `import` is called "namespace import":

```js
import * as Student from "/path/to/students.js";

Student.getName(73);
// Suzy
```

As is likely obvious, the `*` imports everything exported to the API, default and named, and stores it all under the single namespace identifier as specified. This approach closely matches the classic form of modules for most of JS's history.

| NOTE: |
| :--- |
| As of the time of this writing, modern browsers have supported ESM for a few years now, but Node's support for ESM is fairly recent, and has been evolving for quite awhile. The evolution is likely to continue for another year or more, as the introduction of ESM to JS back in ES6 created a number of challenging compatibility concerns for Node's interop with CommonJS modules. Consult Node's ESM documentation for all the latest details: https://nodejs.org/api/esm.html |

## Exit Scope

Whether you use the classic module format (browser or Node), CommonJS format (in Node), or ESM format (browser or Node), one of the most effective ways to structure and organize your program's functionality and data is with the module pattern.

The module pattern is the conclusion of our journey in this book of learning how we can use the rules of lexical scope to place variables and functions in proper locations. POLE is the defensive *private by default* posture we take to making sure that we avoid over-exposure and interact only with the minimal public API surface area necessary.

And underlying modules, the *magic* of how all our module state is maintained is closures leveraging the lexical scope system.

That's it for the main text. Congratulations on quite a journey so far! As I've said numerous times throughout, it's time to pause, reflect, and practice what we've just discussed. When you're comfortable and ready, check out the appendices, which dig deeper into some of the corners of these topics, and also give some practice exercises to solidify what you've learned.
