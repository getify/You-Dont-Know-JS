# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 1: TODO

| NOTE: |
| :--- |
| Work in progress |

> Everything in JS is an object.

This is one of the most pervasive, but most incorrect, "facts" that perpetually circulates about JS. Let the myth busting commence.

JS definitely has objects, but that doesn't mean that all values are objects. Nevertheless, objects are arguably the most important (and varied!) value type in the language, so mastering them is critical to your JS journey.

The object mechanism is certainly the most flexible and powerful container type -- something you put other values into; every JS program you write will use them in one way or another. But that's not why objects deserve top billing for this book. Objects are the the foundation for the second of JS's three pillars: the prototype.

Why are prototypes so core to JS as to be one of its three pillars? Among other things, prototypes are how JS's object system can express the class design pattern, one of the most widely relied on design patterns in all of programming.

So our journey here will start with objects, build up a compelete understanding of prototypes, de-mystify the `this` keyword, and explore the `class` system.

## About This Book

Welcome to book 3 in the *You Don't Know JS Yet* series! If you already finished *Get Started* (the first book) and *Scope & Closures* (the second book), you're in the right spot! If not, before you proceed I encourage you to read those two as foundations before diving into this book.

The first edition of this book is titled, "this & Object Prototypes". In that book, our focus started with the `this` keyword, as it's arguably one of the most confused topics in all of JS. The book then spent the majority of its time focused on expositing the prototype system and advocating for embrace of the lesser-known "delegation" pattern instead of class designs. At the time of that book's writing (2014), ES6 would still be almost 2 years to its completion, so I felt the early sketches of the `class` keyword only merited a brief addendum of coverage.

It's quite an understatement to say a lot has changed in the JS landscape in the almost 8 years since that book. ES6 is old news now; at the time of *this* book's writing, JS has seen 6 (soon to be 7!) yearly updates **after ES6** (ES2016 through ES2021, soon ES2022).

Now, we still need to talk about how `this` works, and how that relates to methods invoked against various objects. And `class` actually operates (mostly!) via the prototype chain deep under the covers. But JS developers in 2022 are almost never writing code to explicitly wire up prototypal inheritance anymore. And as much as I personally wish differently, class design patterns -- not "behavior delegation" -- are how the majority of data and behavior organization (data structures) in JS are expressed.

This book reflects JS's current reality; thus the new sub-title, new focus and organization of topics, and complete re-write of the previous edition's text.



// SUMMARY TODO:

Prototypes are internal linkages between objects that allow property or method access against one object -- if the property/method requested is absent -- to be handled by "delegating" that access to another object. When the delegation involves a method, the context for the method to run in is shared from the initial object to the target object via the `this` keyword.

Prior to ES6, the prototype system was how developers expressed (i.e., emulated) the class design pattern in JS -- so-called "prototypal inheritance". ES6 introduced the `class` keyword as a syntactic affordance to embrace and centralize the prevalence of varied class design approaches. Ostensibly, `class` was introduced as "sugar" built on top of manual/explicit prototypal class
