# You Don't Know JS: *this* & Object Prototypes
# Chapter 6: Behavior Delegation

In Chapters 4 and 5, we addressed the `[[Prototype]]` mechanism  in detail, and *why* it's confusing and inappropriate (despite countless attempts for nearly two decades) to label it "class" or "inheritance". We trudged through not only the fairly verbose syntax (`.prototype` littering the code), but the various gotchas (like surprising `.constructor` resolution or ugly pseudo-polymorphic syntax). We explored variations of the "mixin" approach, which many people use to attempt to smoothe over such rough areas.

It's a common reaction at this point to wonder why it has to be so complex to do something seemingly so simple. Now that we've pulled back the curtain and seen just how dirty it all gets, it's not a surprise that most JS developers never dive this deep, and instead relegate such mess to a "class" library to handle it for them.

I hope if you're reading these *"You Don't Know JS"* books, you're not content to just gloss over and leave such details to a "black box" library. From here on out, I will assume if you've made it this far, you're ready and eager to understand how we *could and should be* thinking about the object `[[Prototype]]` mechanism in JS, in a **much simpler and more straightforward way**.

## Objects: Linked

As a brief review of our conclusions from Chapter 5, the `[[Prototype]]` mechanism is an internal link that exists on one object which references another object.

This linkage is exercised when a property/method reference is made against the first object, and no such property/method exists. In that case, the `[[Prototype]]` linkage tells the engine to look for the property/method on the linked-to object. In turn, if that object cannot fulfill the look-up, its `[[Prototype]]` is followed, and so on. This series of links between objects forms what is called the "prototype chain".

### Fallbacks?

It may be tempting to think that these links provide a sort of fallback for "missing" properties or methods. While that may be an observed outcome, I don't think it represents the right way of thinking about `[[Prototype]]`.

Consider:

```js
var myObject = {
	cool: function() {
		console.log( "cool!" );
	}
};

var yourObject = Object.create( myObject );

yourObject.cool(); // "cool!"
```

That code will work by virtue of `[[Prototype]]`, but if you wrote it that way so that `myObject` was acting as a fallback in case `yourObject` couldn't handle some property/method, odds are that your software design is going to create harder to understand and maintain code.

That's not to say there aren't cases where fallbacks are an appropriate design pattern, but it's not very common or idiomatic in JS, so if you find yourself doing so, you might want to take a step back and reconsider if that's really appropriate and sensible design.

**Note:** In ES6, an advanced functionality called `Proxy` is introduced which can provide something of a "method not found" type of behavior. `Proxy` is well beyond the scope of this book, but will be covered in detail in a later book in the *"You Don't Know JS"* series.

To understand how we *should* think about `[[Prototype]]`, we're going to have to revisit how we apply "design patterns" to our code.

## Class Oriented

"Class/Inheritance" describes a certain form of code organization and architecture. It suggests a certain way of modeling real world problem domains in our software.

Class Oriented (usually called "Object Oriented (OO)") programming stresses that data intrinsically has associated behavior (of course, different depending on the type and nature of the data!) that operates on it, so proper design is to package up (aka, encapsulate) the data and the behavior together. This is sometimes called "data structures" in formal computer science.

For example, a series of characters that represents a word or phrase is usually called a "string". The characters are the data. But you almost never just care about the data, you usually want to *do things* with the data, so the behaviors that can apply *to* that data (calculating its length, appending data, searching, etc) are all designed as methods of a `String` class.

Any given string is just an instance of this class, which means that it's a neatly collected packaging of both the character data and the functionality we can perform on it.

Classes also imply a way of *classifying* a certain data structure. The way we do this is to think about any given structure as a specific variation of a more general base definition.

For example, revisting our `Car` from Chapter 4, we observed that a car can actually be thought of as a specific form of a more general "class" of thing, called `Vehicle`.

The definition of `Vehicle` might include things like propulsion (engines, etc), the ability to carry people, etc. What we define in `Vehicle` is all the stuff that is common to all (or most of) the different types of vehicles (the "planes, trains, and automobiles").

It might not make sense in our software to re-define the basic essence of "ability to carry people" over and over again for each different type of vehicle. Instead, we define it once in `Vehicle`, and then when we define a `Car`, we simply say that it "inherits" a base definition from `Vehicle`. The definition of `Car` is said to specialize the general `Vehicle` definition.

And thus, we get classes and inheritance. We could go even further to see how the class orientation yields polymorphism and other advanced functionalities. But I think you get the picture.

### "Class" Design Pattern

You may never have thought about classes as a "design pattern", since it's much more common to read about "OO Design Patterns", like "Iterator", "Observer", "Factory", "Singleton", etc. When presented this way, it's almost an assumption that OO classes are the lower-level mechanics by which we implement (higher level) design patterns, as if OO is a given foundation for all (proper) code.

Depending on your level of formal education in programming, you may have heard of "procedural programming" as a way of describing code which only consists of procedures (aka, functions) calling other functions, without any higher abstractions. It may even have been presented to you that classes were the proper way to transform "spaghetti code" (procedural style) into well-formed code.

Of course, if you have been exposed to "functional programming" (like Monads and such), you know very well that classes are just one of many design patterns. But for many of you, this may be the first time you've asked yourself if classes really are a fundamental foundation for code, or if they are an optional abstraction on top of code.

Of course, some languages (like Java) don't give you the choice, so it's not very *optional* at all -- everything's a class. Other languages like C/C++ or PHP give you a both procedural and class-oriented syntaxes, and it's left more to the developer's choice which style or mixture of styles is appropriate.

#### JavaScript "Classes"

Where does JavaScript fall in this regard? JS has had *a few* class-like syntactic elements (like `instanceof`) for quite awhile, and more recently in ES6, several additions, like the `class` keyword (see Appendix A).

But does that mean JavaScript actually *has* classes? Plain and simple: **No.**

Since classes are a design pattern, you *can* (with quite a bit of effort) implement approximations for much of classical class functionality (see Chapters 4 and 5).

But it's as if JavaScript is fighting against you using the class design pattern, because behind the curtain, the mechanisms (like `[[Prototype]]`) that you build on are operating quite differently.

What this boils down to is that classes are an optional design pattern, and you have the choice to use them in JavaScript, or not. But if you're going to set aside classes, what design pattern will guide you to proper usage of `[[Prototype]]`? **Delegation.**

## Delegation Oriented

To properly focus our thoughts on how to use `[[Prototype]]` in the most straightforward way, we're going to need to recognize that it represents a fundamentally different design pattern from classes.

That is **not** to say that every principle from class oriented design is moot and inappropriate. For example, *encapsulation* is a very important design principle, and is quite compatible with delegation.

