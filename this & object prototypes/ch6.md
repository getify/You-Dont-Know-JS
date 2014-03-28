# You Don't Know JS: *this* & Object Prototypes
# Chapter 6: Behavior Delegation

In Chapters 4 and 5, we addressed the `[[Prototype]]` mechanism  in detail, and *why* it's confusing and inappropriate (despite countless attempts for nearly two decades) to describe it as "class" or "inheritance". We trudged through not only the fairly verbose syntax (`.prototype` littering the code), but the various gotchas (like surprising `.constructor` resolution or ugly pseudo-polymorphic syntax). We explored variations of the "mixin" approach, which many people use to attempt to smoothe over such rough areas.

It's a common reaction at this point to wonder why it has to be so complex to do something seemingly so simple. Now that we've pulled back the curtain and seen just how dirty it all gets, it's not a surprise that most JS developers never dive this deep, and instead relegate such mess to a "class" library to handle it for them.

I hope by now you're not content to just gloss over and leave such details to a "black box" library. Let's now dig into how we *could and should be* thinking about the object `[[Prototype]]` mechanism in JS, in a **much simpler and more straightforward way** than the confusion of classes.

## Objects: Linked

As a brief review of our conclusions from Chapter 5, the `[[Prototype]]` mechanism is an internal link that exists on one object which references another object.

This linkage is exercised when a property/method reference is made against the first object, and no such property/method exists. In that case, the `[[Prototype]]` linkage tells the engine to look for the property/method on the linked-to object. In turn, if that object cannot fulfill the look-up, its `[[Prototype]]` is followed, and so on. This series of links between objects forms what is called the "prototype chain".

In other words, the actual mechanism, the essense of what's important to the functionality we can leverage in JavaScript, is all about

## Delegation Oriented Design

To properly focus our thoughts on how to use `[[Prototype]]` in the most straightforward way, we must recognize that it represents a fundamentally different design pattern from classes (see Chapter 4).

That is **not** to say that every principle from class oriented design is moot and inappropriate. For example, *encapsulation* is a very important design principle, and is compatible (if not as common) with delegation.

We need to change our thinking from the class/inheritance design pattern to the behavior delegation design pattern. If you have done most or all of your programming in your career thinking in classes, this may be uncomfortable or feel unnatural. You may need to try this mental exercise quite a few times to get the hang of this very different way of thinking. I'm going to walk you though a theoretical exercise first, then we'll look side-by-side at a concrete example.

Let's say we have several similar tasks ("XYZ", "ABC", etc) that we need to model in our software.

With classes, the way you design the scenario is: define a general parent (base) class like `Task`, defining shared behavior for all the "alike" tasks. Then, you define child classes `XYZ` and `ABC`, both of which inherit from `Task`, and each of which adds specialized behavior to handle their respective tasks.

**Importantly,** the class design pattern will encourage you that to get the most out of inheritance, you will want to employ method overriding (and polymorpism), where you override the definition of some general `Task` method in your `XYZ` task, perhaps even making use of `super` to call to the base version of that method while adding more behavior to it. **You'll likely find quite a few places** where you can "abstract" out general behavior to the parent class and specialize (override) it in your child classes.

Here's some loose pseudo-code for that scenario:

```js
class Task {
	id;

	// constructor `Task()`
	Task(ID) { id = ID; }
	outputTask() { output( id ); }
}

class XYZ inherits Task {
	label;

	// constructor `XYZ()`
	XYZ(ID,Label) { super(ID); label = Label; }
	outputTask() { super(); output( label ); }
}

class ABC inherits Task {
	// ...
}
```

Now, you can instantiate one or more **copies** of the `XYZ` child class, and use those instance(s) to perform task "XYZ". These instances have **copies both** of the general `Task` defined behavior as well as the specific `XYZ` defined behavior. Likewise, instances of the `ABC` class would have copies of the `Task` behavior and the specific `ABC` behavior. After construction, you will generally only interact with these instances (and not the classes), as the instances each have copies of all the behavior you need to do the intended task.

But now let's try to think in *behavior delegation*.

You will first define an **object** (not a class, nor a `function` as most JS'rs would lead you to believe) called `Task`, and it will have concrete behavior on it that includes utility methods that various tasks can use (read: *delegate to*!). Then, for each task ("XYZ", "ABC"), you define an **object** to hold that task-specific data/behavior. You **link** your task-specific object(s) to the `Task` utility object, allowing them to delegate to it when they need to.

Basically, you think about performing task "XYZ" as needing behaviors from two sibling/peer objects (`XYZ` and `Task`) to accomplish it. But rather than needing to compose them together, via class copies, we can keep them in their separate objects, and we can allow `XYZ` object to **delegate to** `Task` when needed.

Here's some simple code to suggest how you accomplish that:

```js
Task = {
	setID: function(ID) { this.id = ID; },
	outputID: function() { console.log( this.id ); }
};

// make `XYZ` delegate to `Task`
XYZ = Object.create( Task );

XYZ.prepareTask = function(ID,Label) {
	this.setID( ID );
	this.label = Label;
};

XYZ.outputTaskDetails = function() {
	this.outputID();
	console.log( this.label );
};

// ABC = Object.create( Task );
// ABC ... = ...
```

In this code, `Task` and `XYZ` are not classes (or functions), they're **just objects**. `XYZ` is set up via `Object.create(..)` to `[[Prototype]]` delegate to the `Task` object (see Chapter 5).

Some other differences to note:

1. Both `id` and `label` data members from the previous class example are data properties directly on `XYZ` (neither is on `Task`). In general, with `[[Prototype]]` delegation involved, **you want state to be on the delegators** (`XYZ`, `ABC`), not on the delegate (`Task`).
2. With the class design pattern, we intentionally named `outputTask` the same on both parent (`Task`) and child (`XYZ`), so that we could take advantage of overriding (polymorphism). In behavior delegation, we do the opposite: **we avoid if at all possible naming things the same** at different links in the `[[Prototype]]` chain (called shadowing -- see Chapter 4), because having those name collisions creates awkward/brittle syntax to disambiguate references (see Chapter 4), and we want to avoid that if we can.

   This design pattern calls for less of general method names which are prone to overriding and instead more of descriptive method names, *specific* to the type of behavior each object is doing. **This can actually create easier to understand/maintain code**, because the names of methods (not only at definition location but strewn throughout other code) are more obvious (self documenting).
3. `this.setID(ID);` inside of a method on the `XYZ` object first looks on `XYZ` for `setID(..)`, but since it doesn't find a method of that name on `XYZ`, `[[Prototype]]` *delegation* means it can follow the link to `Task` to look for `setID(..)`, which it of course finds. Moreover, because of implicit call-site `this` binding rules (see Chapter 2), when `setID(..)` runs, even though the method was found on `Task`, the `this` binding for that function call is `XYZ` exactly as we'd expect and want. We see the same thing with `this.outputID()` later in the code listing.

   In other words, the general utility methods that exist on `Task` are available to us while interacting with `XYZ`, because `XYZ` can delegate to `Task`.

**Behavior Delegation** means: let some object (`XYZ`) provide a delegation (to `Task`) for property or method references if not found on the object (`XYZ`).

This is an *extremely powerful* design pattern, very distinct from the idea of parent and child classes, inheritance, polymorphism, etc. Rather than orienting your mental model vertically, with Parents flowing down to Children, think of a mental model of objects side-by-side, as peers, with any direction of delegation links as the relationships make sense.

### Mutual Delegation (Disallowed)

You cannot create a *cycle* where two are more objects are mutually delegated (bi-directionally) to each other. If you make `B` linked to `A`, and then try to link `A` to `B`, you will get an error.

It's a shame (not terribly surprising, but mildly annoying) that this is disallowed. If you made a reference to a property/method which didn't exist in either place, you'd have a statically guarantee'able infinite recursion on the `[[Prototype]]` loop. But if all references were strictly present, then `B` could delegate to `A`, and vice versa, and it *could* work. This would mean you could use either object to delegate to the other, for various tasks. There are a few niche use-cases where this might be helpful.

But it's disallowed because engine implementors have observed that it's more performant to check for (and reject!) the infinite circular reference once at set-time rather than needing to have the performance hit of that guard check every time you look-up a property on an object.

## OO vs. OLOO (Objects Linked to Other Objects)

We've just seen a sort of theoretical exploration of behavior delegation. Let's now look at some code that's slightly more realistic. The scenario is setting up two controller objects, one for handling the login form of a web page, and one for actually handling the authentication communication with the server.

Here's a utility helper that our following program examples will use. It makes Ajax requests and returns a simple promise-like answer (the `then:...` stuff) so that it's easy to specify a completion task after the async Ajax request completes. We're glossing over the implementation details as they are not relevant to our comparison of design patterns.

```js
function ajax(url,data) {
	// .. do the ajax request

	// return a promise
	return { then: function(){/*..*/} /*..*/ };
}
```

function LoginController() {
	// constructor stuff, if necessary
}

LoginController.prototype.getUser = function getUser() {
	return document.getElementById( "login_username" );
};

LoginController.prototype.getPassword = function getPassword() {
	return document.getElementById( "login_password" );
};

LoginController.prototype.validateEntry = function validateEntry(user,pw) {
	user = user || this.getUser();
	pw = pw || this.getPassword();

	if (!(user && pw)) {
		return this.showError( "Please enter a username & password!" );
	}
	else if (user.length < 5) {
		return this.showError( "Password must be 5+ characters!" );
	}

	// got here? validated!
	return true;
};

LoginController.prototype.showSuccess = function showSuccess(msg) {
	// display success message to user in dialog
};

LoginController.prototype.showError = function showError(msg) {
	// display error message to user in dialog
};


function AuthController() {
	// constructor stuff, if necessary
}

AuthController.prototype = Object.create( LoginController.prototype );

AuthController.prototype.checkAuth = function checkAuth() {
	var user = this.getUser();
	var pw = this.getPassword();

	if (this.validateEntry( user, pw )) {
		ajax( "/check-auth",{
			user: user,
			pw: pw
		} )
		.then(
			this.success.bind( this ),
			this.failure.bind( this )
		);
	}
};

AuthController.prototype.success = function success() {
	this.showSuccess( "Authenticated!" )
};

AuthController.prototype.failure = function failure(err) {
	this.showError( "Error: " + err );
};
```

We specified a `LoginController` class and an `AuthController` class which inherits from it. Now, to perform the authentication task, we need to instantiate the `AuthController`, like this:

```js
var auth = new AuthController();
auth.checkAuth();
```


