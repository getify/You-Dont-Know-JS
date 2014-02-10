# You Don't Know JS: *this* & Object Prototypes
# Chapter 4: Class Copies

This book does not intend to be exhaustive on the topic of "object oriented" programming with "classes" and "inheritance" and "(relative) polymorphism". These topics are vastly complicated and deserve their own books. However, we will briefly survey them, because a foundation of knowledge is important for the contrasts we will make when explaining JavaScript's (often mistakingly called "class") `[[Prototype]]` mechanism.

**Note:** If you are confident you're fully versed on class-oriented concepts, including relative polymorphism, feel free to skip to Chapter 5. If you instead thought briefly, "relative poly-whaaa?", read on.

## Class

In traditional class-oriented languages, a collection of definitions of functionality wrapped up in a tidy package is called a `class`.

For instance, in many languages, a "Stack" data structure would be implemented by a `Stack` class. This class would have an internal set of variables that stores the data, and it would have a set of publicly accessible functions ("methods") provided by the class, which gives your code the ability to interact with the data structure (adding & removing data, etc).

But in such languages, you don't often operate directly on a `Stack` (unless making a **Static** reference, which is outside the scope of our discussion). The `Stack` class is merely an abstract representation of what *a* "Stack" should do, but it's not itself *a* "Stack". You must **instantiate** the `Stack` class before you have a concrete data structure *thing* to operate against.

### Building

The traditional metaphor for "class" and "instance" based thinking comes from building construction.

An architect plans out all the characteristics of a building: how wide, how tall, how many windows and in what locations, even what type of material to use for the walls and roof. He doesn't particularly care, at this point, *where* the building will be built, nor does he care *how many* copies of that building will be built. Importantly, he doesn't care very much about the contents of the building -- the furniture, wall paper, ceiling fans, etc -- only what type of structure they will be contained by.

But the architectural blue-prints are only *plans* for a building. They don't actually constitute a building we can walk into and sit down. We need a builder for that task. A builder will take those plans and follow them, exactly, as he *builds* the building. In a very real sense, he is *copying* the characteristics from the plans to the physical building.

Once complete, the building is a physical instantiation of the blue-print plans, hopefully an essentially perfect *copy*. And then the builder can move to the open lot next door and do it all over again, creating yet another *copy*.

The relationship between building and blue-print is indirect. You can examine a blue-print to understand how the building was structured, for any parts where direct inspection of the building itself was insufficient.

Put simply, the blue-print has lines drawn on a page that *represent* where a door should be, but if you want to actually open a door, you need to go to the building itself.

A class is a blue-print. To actually *get* an object we can interact with, we must build (aka, "instantiate") something from the class. The end result of such "construction" is an object, typically called an "instance", which we can directly call methods on and access any public data properties from, as necessary. This object is a *copy* of all the characteristics described by the class.

What's important to note about this metaphor is **how closely it resembles** classes and instances.

Objects built from classes don't *obviously* maintain any sort of link or reference to their originating class, anymore than you'd expect to commonly walk into a building and see, framed on the wall, the blue-prints used to build it. At most, you'd find a plaque on the wall with the name of the architect.

**Instantiating a class is fundamentally a copy operation.**

<img src="fig1.png">

Visually, the arrows move from left to right, and from top to bottom.

### Constructor

Instances of classes are constructed by a special method of the class, usually of the same name as the class, called a *constructor*. This method's explicit job is to initialize any information the instance will need.

For example, some loose pseudo-code (invented syntax) for classes:

```js
class CoolGuy {
	specialTrick = nothing

	CoolGuy( trick ) {
		specialTrick = trick
	}

	showOff() {
		output( "Here's my trick: ", specialTrick )
	}
}
```

To *make* a `CoolGuy` instance, we would call the class constructor:

```js
Joe = new CoolGuy( "jumping rope" )

Joe.showOff() // Here's my trick: jumping rope
```

Notice that the `CoolGuy` class has a constructor `CoolGuy()`, which is actually what we call when we say `new CoolGuy(..)`. We get an object back (an instance of our class) from the constructor, and we can call the method `showOff()`, which prints out that particular `CoolGuy`s special trick.

*Obviously, jumping rope makes Joe a pretty cool guy.*

The constructor of a class *belongs* to the class, almost universally with the same name as the class. Also, constructors pretty much always need to be called with `new` to let the language engine know you want to construct a class instance.

## Inheritance

In class-oriented languages, not only can you define a class which can be instantiated itself, but you can define another class that **inherits** from the first class.

The second class is often said to be a "child class" whereas the first is the "parent class". These terms obviously come from the metaphor of parents and children, though the metaphors here are a bit stretched, as you'll see shortly.

When a parent has a biological child, the genetic characteristics of the parent are copied into the child. Obviously, in most biological reproduction systems, there are two parents who co-equally contribute genes to the mix. But for the purposes of the metaphor, we'll assume just one parent.

Once the child exists, he or she is separate from the parent. The child was heavily influenced by the inheritance from his or her parent, but is unique and distinct. If a child ends up with red hair, that doesn't mean the parent's hair *was* or automatically *becomes* red.

In a similar way, once a child class is defined, it's separate and distinct from the parent class. The child class contains an initial copy of the behavior from the parent, but can then override any inherited behavior and even define new behavior.

It's important to remember that we're talking about parent and child **classes**, which aren't physical things. This is where the metaphor of parent and child gets a little confusing, because we actually should say that a parent class is like a parent's DNA and a child class is like a child's DNA. We have to make (aka "instantiate") a person out of each set of DNA to actually have a physical person to have a conversation with.

Let's set aside biological parents and children, and look at inheritance through a slightly different lens: different types of vehicles. That's one of the most canonical (and often groan-worthy) metaphors to understand inheritance.

Consider some more loose pseudo-code (invented syntax) for inherited classes:

```js
class Vehicle {
	engines = 1

	ignition() {
		output( "Turning on my engine." );
	}

	drive() {
		ignition();
		output( "Steering and moving forward!" )
	}
}

class Car inherits Vehicle {
	wheels = 4

	drive() {
		inherited:drive()
		output( "Rolling on all ", wheels, " wheels!" )
	}
}

class SpeedBoat inherits Vehicle {
	engines = 2

	ignition() {
		output( "Turning on my ", engines, " engines." )
	}

	pilot() {
		inherited:drive()
		output( "Speeding through the water with ease!" )
	}
}
```

**Note:** For clarity and brevity, constructors for these classes have been omitted.

We define the `Vehicle` class to assume an engine, a way to turn on the ignition, and a way to drive around. But you wouldn't ever manufacture just a generic "vehicle", so it's really just an abstract concept at this point.

So then we define two specific kinds of vehicle: `Car` and `SpeedBoat`. They each inherit the general characteristics of `Vehicle`, but then they specialize the characteristics appropriately for each kind. A car needs 4 wheels, and a speed boat needs 2 engines, which means it needs extra attention to turn on the ignition of both engines.

### Polymorphism

`Car` defines its own `drive()` method, which overrides the method of the same name it inherited from `Vehicle`. But then, `Car`s `drive()` method calls `inherited:drive()`, which indicates that `Car` can reference the original pre-overriden `drive()` it inherited. `SpeedBoat`s `pilot()` method also makes a reference to its inherited copy of `drive()`.

This technique is called "polymorphism", or "virtual polymorphism". More specifically to our current point, we'll call it "relative polymorphism".

Polymorphism is a much broader topic than we will exhaust here, but our current "relative" semantics refers to one particular aspect: the idea that any method can reference another method (of the same or different name) at a higher level of the inheritance heirarchy. We say "relative" because we don't absolutely define which inheritance level (aka, class) we want to access, but rather relatively reference it by essentially saying "one level up".

In many languages, the keyword `super` is used, in place of this example's `inherited:`, which leans on the idea that a "super class" is the parent/ancestor of the current class.

Another aspect of polymorphism is that a method name can have multiple definitions at different levels of the inheritance chain, and these definitions are automatically selected as appropriate.

We see two occurrences of that behavior in our example above: `drive()` is defined in both `Vehicle` and `Car`, and `ignition()` is defined in both `Vehicle` and `SpeedBoat`.

An interesting implication of polymorphism can be seen specifically with `ignition()`. Inside `pilot()`, a relative-polymorphic reference is made to (the inherited) `Vehicle`s version of `drive()`. But that `drive()` references an `ignition()` method just by name (no relative reference).

Which version of `ignition()` will the language engine use, the one from `Vehicle` or the one from `SpeedBoat`? **It uses the `SpeedBoat` version of `ignition()`.** Moreover, if you *were* to instantiate `Vehicle` class itself, and then call its `drive()`, the language engine would instead just use `Vehicle`s `ignition()` method definition.

Put another way, the definition for the method `ignition()` *polymorphs* (changes) depending on which class (level of inheritance) you are referencing an instance of.

This may seem like overly deep academic detail. But understanding these details is necessary to properly contrast similar (but different) behaviors in JavaScript's `[[Prototype]]` mechanism.

The key take-away from this discussion is that with classes, there is a copy behavior when a class is instantiated, and a copy behavior when a class is inherited. When classes are inherited, there is a way **for the classes themselves** to *relatively* reference the class inherited from, and this relative reference is usually called `super`.

Remember this figure from earlier:

<img src="fig1.png">

Notice how for both instantiation (`a1`, `a2`, `b1`, and `b2`) *and* inheritance (`Bar`), the arrows indicate a copy operation.

The only **link** that really is observable between `Bar` and `Foo` is that instances of `Bar` can relatively reference inherited (original, pre-override) behavior copied in from `Foo`, using a relative polymorphic reference (usually `super`).

**Classes imply copies.**

### Multiple Inheritance

Recall our earlier discussion of parent(s) and children and DNA? We said that the metaphor was a bit weird because biologically most offspring come from two parents. Let's revisit.

Some class-oriented languages allow you to specify more than one "parent" class to "inherit" from. Conceptually, the *copy* that occurs from parent to class just happens from each parent to the common child.

On the surface, this seems like a powerful addition to class-orientation. However, there are certainly some complicating questions that arise. If both parent classes provide a method called `drive()`, which version would a `drive()` reference resolve to?

There's another variation, the so called "Diamond Problem", which refers to the scenario where a child class "D" inherits from two parent classes ("B" and "C"), and each of those in turn inherits from a common "A" parent. If "A" provides a method `drive()`, and both "B" and "C" override (polymorph) that method, when `D` references `drive()`, which version should it use (`B:drive()` or `C:drive()`)?

These complications go even much deeper than this quick glance. We address them here so we can contrast to how JavaScript's mechanisms work.

JavaScript is simpler: it does not provide a native mechanism for "multiple inheritance". Many see this is a good thing, because the complexity savings more than make up for the lesser functionality. But this doesn't stop developers from trying to fake it in various ways, as we'll see shortly.

## Mixins

JavaScript's object mechanism does not perform copy behavior when you "inherit" or "instantiate". Plainly, there's no "classes" in JavaScript to instantiate, only objects. In fact, shortly, we'll see why all these class-oriented terms are not even appropriate to JavaScript, and instead just create a mess of confusion.

But before we go *there*, let's examine how developers **fake** the copy behavior of classes in JavaScript: mixins. There's two types of "mixin": explicit and implicit.

### Explicit Mixins

Let's revisit our `Vehicle` and `Car` example from before. Since JavaScript will not automatically copy behavior from `Vehicle` to `Car`, we can instead create a utility that manually copies. Such a utility is often called `extend` by many libraries/frameworks, but we will call it `mixin()` here for semantic purposes.

```js
// vastly simplified `mixin()` example:
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		// only copy if not already present
		if (!(key in sourceObj)) {
			targetObj[key] = sourceObj[key];
		}
	}

	return targetObj;
}

var Vehicle = {
	engines: 1,

	ignition: function() {
		console.log( "Turning on my engine." );
	},

	drive: function() {
		this.ignition();
		console.log( "Steering and moving forward!" );
	}
};

var Car = mixin( Vehicle, {
	wheels: 4,

	drive: function() {
		Vehicle.drive.call( this );
		console.log( "Rolling on all ", this.wheels, " wheels!" );
	}
} );
```

**Note:** Subtly but importantly, we're not dealing with classes anymore, because there are no classes in JavaScript. `Vehicle` and `Car` are just objects that we're going to make copies from and to, respectively.

#### "Polymorphism" Revisited

First, let's examine this statement: `Vehicle.drive.call( this )`. This is what we'll call "explicit polymorphism". Recall in our previous pseudo-code this line was `inherited:drive()`, which we called "relative polymorphism".

JavaScript does not have (prior to ES6; see Appendix A) a facility for relative polymorphism. So, we must make an absolute (not relative) reference. We explicitly specify the `Vehicle` object by name, and call the `drive()` method on it.

If we said `Vehicle.drive()`, the `this` would be `Vehicle` (see Chapter 2), which is not what we want. So, instead we use `.call( this )` (Chapter 2) to ensure that `drive()` is executed in the context of the `Car` object.

The **negative side-effects** of *explicit polymorphism* should *not* be overlooked.

In class-oriented languages, which have relative polymorphism, the linkage between `Car` and `Vehicle` is established once, at the top of the class definition, which makes for only one place to maintain such linkage. Because of JavaScript's peculiarities, explicit polymorphism creates brittle manual/explicit linkage **in every single function you make such a reference**, which can significantly increase the maintenance cost.

The result is usually more complex, harder-to-read *and* harder-to-maintain code. **Explicit polymorphism should be avoided wherever possible.**

Using explicit polymorphism, you could approximate the effects of "multiple inheritance", but this only multiplies the complexity and problems, and is *usually* asking for frustrations.

#### Mixing Copies

Now, let's examine how `mixin(..)` works. It iterates over the properties of `sourceObj` (`Vehicle` in our example) and if there's no matching property of that name in `targetObj` (`Car` in our example), it makes a copy. Since we're making the copy after the initial object exists, we are careful to not copy over a target property.

If we made the copies first, before specifying the `Car` specific contents, we could omit this check against `targetObj`, but that's a little more clunky and less efficient, so it's generally less preferred:

```js
// vastly simplified `mixin()` example:
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		targetObj[key] = sourceObj[key];
	}

	return targetObj;
}

var Vehicle = {
	// ...
};

// first, create an empty object with Vehicle's stuff copied
var Car = mixin( Vehicle, { } );

// now copy the intended contents into Car
mixin( {
	wheels: 4,

	drive: function() {
		// ...
	}
}, Car );
```

Either way, we have explicitly copied the contents of `Vehicle` into `Car`. The label "mixins" comes from this alternate way of stating it: `Car` has `Vehicle`s contents mixed-in.

As a result of the copy operation, `Car` will operate somewhat separately from `Vehicle`. If you add a property onto `Car`, it will not affect `Vehicle`, and vice versa.

**Note:** A few minor details have been skimmed over here. There are still some subtle ways the two objects can "affect" each other, such as if they both share a reference to a common object (such as an array). They also share references to the functions (which are objects!), so if you modifed a **function object** by adding properties on top of it, both `Vehicle` and `Car` would be "affected".

Explicit mixins are a fine mechanism in JavaScript. But they appear more powerful than they really are. Not much benefit is *actually* derived from copying a property from one object to another, **as opposed to just defining the properties twice**, once on each object.

If you explicitly mix-in two or more objects into your target object, you can emulate the behavior of "multiple inheritance", but there's no direct way to handle collisions if the same method or property is being copied from more than one source. Some have constructed "late binding" techniques and other exotic work-arounds, but fundamentally these "tricks" are *usually* more effort than the pay-off.

Take care only to use explicit mixins where it actually helps make more readable code, and avoid the pattern if you find it making code that's harder to trace, or if you find it creates unnecessary or unweildy dependencies between objects. **If it starts to get *harder* to properly use mixins than before you used them, you should probably stop using mixins.**

### Implicit Mixins

Implicit mixins are closely related to *explicit polymorphism* as explained previously. As such, they come with the same caveats and warnings.

Consider this code:

```js
var Something = {
	cool: function() {
		this.greeting = "Hello World";
		this.count = this.count ? this.count + 1 : 1;
	}
};

Something.cool();
Something.greeting; // "Hello World"
Something.count; // 1

var Another = {
	cool: function() {
		Something.cool.call( this );
	}
};

Another.cool();
Another.greeting; // "Hello World"
Another.count; // 1 (not shared state with `Something`)
```

With `Something.cool.call( this )`, we essentially "borrow" the function `Something.cool()` and call it in the context of `Another` (via its `this` binding; see Chapter 2) instead of `Something`. The end result is that the assignments that `Something.cool()` makes are applied against the `Another` object rather than the `Something` object.

So, it is said that we "mixed in" `Something`s behavior with (or into) `Another`s state.

While this sort of technique seems to take useful advantage of `this` rebinding functionality, it is the brittle `Something.cool.call( this )` call, which cannot be made into a relative (and thus more flexible) reference, which you should **heed with caution**. Generally, **avoid such constructs where possible** to keep cleaner and more maintainable code.

## Review (TL;DR)

Classes are awesome. Classes suck.

(TODO: write some better review, maybe)
