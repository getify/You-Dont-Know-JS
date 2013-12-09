# You Don't Know JS: *this* & Object Prototypes
# Chapter 3: Objects

In Chapters 1 and 2, we explained how the `this` binding points to various objects depending on the call-site of the function invocation. But what exactly are objects, and why do we need to point to them? We will explore objects in detail in this chapter.

## Syntax

Objects come in two forms: the declarative (literal) form, and the constructed form.

The literal syntax for an object looks like this:

```js
var myObj = {
	// ...
};
```

The constructed form looks like this:

```js
var myObj = new Object();
```

The constructed form and the literal form result in exactly the same sort of object. The only difference really is that you can add one or more key/value pairs to the literal declaration, whereas with constructed-form objects, you must add the properties one-by-one.

## Type

Objects are the general building block upon which a lot of the rest of JS is built. They are one of the 7 primary (primitive) types in JS:

* `string`
* `number`
* `boolean`
* `null`
* `undefined`
* `object`
* `function`

Note that the *simple primitives* (`string`, `boolean`, `number`, `null`, and `undefined`) are **not** themselves `objects`. `null` is sometimes referred to as an object type, but this misconception stems from a bug in the language which causes `typeof null` to return the string `"object"` incorrectly (and confusingly). In fact, `null` is its own primitive type.

**It's a common mis-statement that "everything in JavaScript is an object". This is clearly not true.**

By contrast, there *are* a few special object sub-types, which we can refer to as *complex primitives*.

`function` is a sub-type of objects (technically, a "callable object"). Functions in JS are said to be "first class" in that they are basically just normal objects (with callable behavior semantics bolted on), and so they can be handled like any other plain object.

Arrays are also a form of objects, with special-case behavior. The organization of contents in arrays is slightly more structured than in general objects.

### Built-in Objects

There are several other object sub-types, usually referred to as built-in objects. For some of them, their names seem to imply they are directly related to the simple primitives counter-parts, but in fact, their relationship is more complicated, which we'll explore shortly.

* `String`
* `Number`
* `Boolean`
* `Object`
* `Function`
* `Array`
* `Date`
* `RegExp`
* `Error`

These built-ins have the appearance of being actual types, even classes, if you rely on the similarity to other languages such as Java's `String` class.

But in JS, these are actually just built-in functions. Each of these functions can be used as a constructor (that is, a function call with the `new` operator), with the result being a newly *constructed* object of the object sub-type in question. For instance:

```js
var strPrimitive = "I am a string";
typeof strPrimitive; // "string"
strPrimitive instanceof String; // false

var strObject = new String( "I am a string" );
typeof strObject; // "object"
strObject instanceof String; // true

// inspect the object sub-type
Object.prototype.toString.call( strObject ); // [object String]
```

We'll see in detail in a later chapter exactly how the `Object.prototype.toString...` bit works, but briefly, we can inspect the internal sub-type (known in the language specification as ``[[Class]]``) by borrowing the base default `toString()` method, and you can see it reveals that `strObject` is an object that was in fact created by the `String` constructor.

The primitive value `"I am a string"` is not an object, it's a primitive literal and immutable value. To perform operations on it, such as checking its length, modifying its contents, etc, a `String` object is required.

Luckily, the language automatically coerces a `"string"` primitive to a `String` object when necessary, which means you almost never need to explicitly create the Object form. It is **strongly preferred** by the majority of the JS community to use the literal form for a value, where possible, rather than the constructed object form.

Consider:

```js
var strPrimitive = "I am a string";

console.log( strPrimitive.length ); // 13

console.log( strPrimitive.charAt( 3 ) ); // "m"
```

In both cases, we call a property or method on a string primitive, and the engine automatically coerces it to a `String` object, so that the property/method access works.

The same sort of coercion happens between the number literal primitive `42` and the `new Number(42)` object wrapper, when using methods like `42.359.toFixed(2)`. Likewise for `Boolean` objects from `"boolean"` primitives.

`null` and `undefined` have no object wrapper form, only their primitive values. By contrast, Date values can *only* be created with their constructed object form, as they have no literal form counter-part.

`Object`s, `Array`s, `Function`s, and `RegExp`s (regular expressions) are all objects regardless of whether the literal or constructed form is used. The constructed form does offer, in some cases, more options in creation than the literal form counterpart. Since objects are created either way, the simpler literal form is almost universally preferred. **Only use the constructed form if you need the extra options.**

`Error` objects are rarely created explicitly in code, but usually created automatically when exceptions are thrown. They can be created with the constructed form `new Error(..)`, but it's often unnecessary.

## Contents

As mentioned earlier, the contents of an object consist of values (any type) stored at specifically named *locations*, which we call properties.

It's important to note that while we say "contents" which implies that these values are *actually* stored inside the object, that's merely an appearance. The engine stores values in implementation-dependent ways, and may very well not store them *in* some object container. What *is* stored in the container are these property names, which act as pointers (technically, *references*) to where the values are stored.

Consider:

```js
var myObject = {
	a: 2
};

myObject.a; // 2

myObject["a"]; // 2
```

To access the value at the *location* `a` in `myObject`, we need to use either the `.` operator or the `[ ]` operator. The `.a` syntax is usually referred to as "property" access, whereas the `["a"]` syntax is usually referred to as "key" access. In reality, they both access the same *location*, and will pull out the same value, `2`, so the terms can be used interchangably. We will use the most common term, "property access" from here on.

The main difference between the two syntaxes is that the `.` operator requires an `Identifier` compatible property name after it, whereas the `[".."]` syntax can take basically any UTF-8/unicode compatible string as the name for the property. To reference a property of the name "Super-Fun!", for instance, you would have to use the `["Super-Fun!"]` access syntax, as `Super-Fun!` is not a valid `Identifier` property name.

Also, since the `[".."]` syntax uses a string's **value** to specify the location, this means the program can programmatically build up the value of the string, such as:

```js
var myObject = {
	a: 2
};

var idx;

if (wantA) {
	idx = "a";
}

// later

console.log( myObject[idx] ); // 2
```

In objects, property names are **always** strings. If you use any other value besides a `string` (primitive) as the property, it will first be converted to a string. This even includes numbers, which are commonly used as array indexes, so be careful not to confuse the use of numbers between objects and arrays.

```js
var myObject = { };

myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"]; // "foo"
myObject["3"]; // "bar"
myObject["[object Object]"]; // "baz"
```

### Property vs. Method

Some developers like to make a distinction when talking about a property access on an object, if the value being accessed happens to be a function. Because it's tempting to think of the function as *belonging* to the object, and in other languages, functions which belong to objects (aka, "classes") are referred to as "methods", it's not uncommon to hear, "method access" as opposed to "property access".

Technically, functions don't "belong" to objects, so saying that a function accessed on an object is actually a "method" is a bit of a stretch of wording.

It *is* true that some functions have `this` references in them, and that *sometimes* these `this` references refer to the object used to find a reference to the function for invocation. But this does not make that function any more a "method" than any other function, as `this` is dynamically bound at run-time, at the call-site, and thus its relationship to the object is indirect, at best.

Every time you access a property on an object, that is a *property access*, regardless of the type of value you receive. If you *happen* to get a function back from that property access, that does not mean that it's somehow a "method" at that point. There is nothing special (outside of possible `this` binding as explained earlier) about a function that comes from a property access.

For instance:

```js

function foo() {
	console.log( "foo" );
}

var someFoo = foo; // variable reference to `foo`

var myObject = {
	someFoo: foo
};

someFoo; // function foo()

myObject.someFoo; // function foo()
```

`someFoo` and `myObject.someFoo` are just separate references to the same function, and neither implies anything about the function being special or "owned" by any other object. If `foo()` above was defined to have a `this` reference inside it, that *implicit binding* would be the **only** observable difference between the two references.

### Arrays

Arrays also use the `[ ]` access form, but as mentioned above, they have slightly more structured organization for how and where values are stored (though still no restriction on what *type* of values are stored). Arrays assume *numeric indexing*, which means that values are stored in locations, usually called *indices*, at positive integers, such as `0` and `42`.

```js
var myArray = [ "foo", 42, "bar" ];

myArray.length; // 3

myArray[0]; // "foo"

myArray[2]; // "bar"
```

Arrays *are* objects, so even though each index is a positive integer, you can *also* add properties onto the array:

```js
var myArray = [ "foo", 42, "bar" ];

myArray.baz = "baz";

myArray.length; // 3

myArray.baz; // "baz"
```

Notice that adding named properties (regardless of `.` or `[ ]` operator syntax) does not change the reported `length` of the array.

You *could* use an array as a plain key/value object, and never add any numeric indices, but this is bad idea because arrays have behavior and optimizations specific to their intended use, and likewise with plain objects. Use objects to store key/value pairs, and arrays to store values at numeric indices.

**Be careful:** If you try to add a property to an array, but the property name *looks* like a number, it will end up instead as a numeric index (thus modifying the array contents):

```js
var myArray = [ "foo", 42, "bar" ];

myArray["3"] = "baz";

myArray.length; // 4

myArray[3]; // "baz"
```

### `[[Get]]`

There's a subtle, but important, detail about how property accesses are performed.

Consider:

```js
var myObject = {
	a: 2
};

myObject.a; // 2
```

The `myObject.a` is a property access, but it doesn't *just* look in `myObject` for a property of the name `a`, as it might seem.

According to the spec, the code above actually performs a `[[Get]]` operation (kinda like a function call: `[[Get]]()`) on the `myObject`. The default built-in `[[Get]]` operation for an object *first* inspects the object for a property of the requested name, and if it finds it, it will return the value accordingly.

However, the `[[Get]]` algorithm defines other important behavior if it does *not* find a property of the requested name. We will examine in a subsequent chapter what happens *next* (traversal of the `[[Prototype]]` chain, if any).

But one important result of this `[[Get]]` operation is that if it cannot through any means come up with a value for the requested property, it instead returns the value `undefined`.

```js
var myObject = {
	a: 2
};

myObject.b; // undefined
```

This behavior is different from when you reference *variables* by their identifier names. If you reference a variable that cannot be resolved within the applicable lexical scope look-up, the result is not `undefined` as it is for object properties, but instead a `ReferenceError` is thrown.

```js
var myObject = {
	a: undefined
};

myObject.a; // undefined

myObject.b; // undefined
```

From a *value* perspective, there is no difference between these two references -- they both result in `undefined`. However, the `[[Get]]` operation underneath, though subtle at a glance, potentially performed quite a bit more "work" for `myObject.b` than for `myObject.a`.

Inspecting the value results, you cannot distinguish whether a property exists and holds the explicit value `undefined`, or whether ther property does *not* exist and `undefined` was the default return value after `[[Get]]` failed to return something explicitly. However, we will see in a moment how you *can* distinguish these two situations.

### Getters & Setters

The reason it's important to think of a property access in terms of a `[[Get]]` operation is because in a future version of JavaScript, it's likely that the default built-in `[[Get]]` operation for an object will actually be overridable. You could, for instance, specify that unfulfilled property accesses result in a `null` instead of an `undefined`, if you so chose.

**Note:** When we examine the `[[Prototype]]` chain traversal as part of the default object-level `[[Get]]` operation in the next chapter, it will become clear that overriding this operation allows you to actually redefine how `[[Prototype]]` look-ups work, or even not at all.

ES5 introduced a limited form of this future `[[Get]]` override capability with "getters", which are specified per-property, rather than across the entire object (which is likely coming in a future revision of the language).

Consider:

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return 2;
	}
};

Object.defineProperty(
	myObject,	// target
	"b",		// property name
	{			// descriptor
		// define a getter for `b`
		get: function(){ return this.a * 2 },

		// make sure `b` shows up as an object property
		enumerable: true
	}
);

myObject.a; // 2

myObject.b; // 4
```

Either through object-literal syntax with `get a() { .. }` or through explicit definition with `defineProperty(..)`, in both cases we created a property on the object that actually doesn't hold a value, but whose access automatically results in a kind of hidden function call to the getter function, with whatever value it returns being the result of the property access.

Since we only defined a getter for `a`, if we try to set the value of `a` later, the set operation (called `[[Put]]` in the spec) will occur without error, but our custom getter will effectively make that set moot, because the getter will still always return what we specified:

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return 2;
	}
};

myObject.a = 3;

myObject.a; // 2
```

To make this scenario more sensible, properties can also be defined with setters, which override the default `[[Put]]` operation (aka, assignment), per-property, just as you'd expect. You will almost certainly want to always declare both getter and setter, as having only one or the other often leads to unexpected/surprising behavior.

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return this._a_;
	},

	// define a setter for `a`
	set a(val) {
		this._a_ = val * 2;
	}
};

myObject.a = 2;

myObject.a; // 4
```

**Note:** In this example, we actually store the specified value `2` of the assigment (`[[Put]]` operation) into another variable `_a_`. The `_a_` name is purely by convention for this example and implies nothing special about its behavior -- it's a standard property like any other.

### Existence

We showed earlier that a property access like `myObject.a` may result in an `undefined` value if either the explicit `undefined` is stored there or the the `a` property doesn't exist at all. So, if the value is the same in both cases, how else do we distinguish them?

We can ask an object if it has a certain property *without* asking to get that property's value:

```js
var myObject = {
	a: 2
};

("a" in myObject); // true
("b" in myObject); // false

myObject.hasOwnProperty( "a" ); // true
myObject.hasOwnProperty( "b" ); // false
```

The `in` operator will check to see if the property is *in* the object, or if it exists at any higher level of the ``[[Prototype]]` chain object traversal. By contrast, `hasOwnProperty(..)` checks to see if *only* `myObject` has the property or not, and will *not* consult the `[[Prototype]]` chain. We'll come back to the important differences between these two operations in the next chapter when we explore `[[Prototype]]`s in detail.

**Note:** The `in` operator has the appearance that it will check for the existence of a *value* inside a container, but it actually checks for the existence of a property name. This difference is important to note with respect to arrays, as the temptation to try a check like `2 in [1, 2, 3]` is strong, but this will not behave as expected.

#### Enumeration

Previously, we demonstrated the use of `Object.defineProperty(..)` utility to create property definitions imperatively rather than the literal/declarative form. The example set an `enumerable` descriptor, but did not explain what that actually does, so we will now examine *enumerability*.

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// make `a` enumerable, as normal
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// make `b` non-enumerable
	{ enumerable: false, value: 3 }
);

myObject.b; // 3

("b" in myObject); // true

myObject.hasOwnProperty( "b" ); // true

// .......

for (var k in myObject) {
	console.log( k, myObject[k] );
}
// "a" 2
```

You'll notice that `myObject.b` in fact **exists** and has an accessible value, but it doesn't show up in a `for-in` loop (though, surprisingly, it **is** revealed by the `in` operator existence check). That's because "enumerable" basically means "will be included if the object's properties are iterated through".

**Note:** `for-in` loops applied to arrays can give somewhat unexpected results, in that the enumeration of an array will include not only all the numeric indices, but also any enumerable properties. It's a good idea to use `for-in` loops *only* on objects, and traditional `for` loops with numeric iteration for the values stored in arrays.

Another way that enumerable and non-enumerable properties can be distinguished:

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// make `a` enumerable, as normal
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// make `b` non-enumerable
	{ enumerable: false, value: 3 }
);

Object.keys( myObject ); // ["a"]

Object.getOwnPropertyNames( myObject ); // ["a", "b"]
```

`Object.keys(..)` returns an array of all enumerable properties, whereas `Object.getOwnPropertyNames(..)` returns an array of *all* properties, enumerable or not.

**Note:** Whereas `in` vs. `Object.hasOwnProperty(..)` differ in whether they consult the `[[Prototype]]` chain or not, respectively, `Object.keys(..)` and `Object.getOwnPropertyNames(..)` both inspect *only* the direct object specified. There's no built-in way to get a list of all properties which the `in` operator would find (traversing all properties on the entire `[[Prototype]]` chain, as explained in the next chapter).

#### Iteration

As we just explained, the `for-in` loop iterates over the list of enumerable properties on an object (including its `[[Prototype]]` chain). But what if you instead want to iterate over the values?

For arrays, iterating over the values is typically done with a standard for-loop, like:

```js
var myArray = [1, 2, 3];

for (var i = 0; i < myArray.length; i++) {
	console.log( myArray[i] );
}
// 1 2 3
```

Technically, this isn't iterating over the values, but iterating over the indices, where you then use the index to reference the value with `myArray[i]`.

In the same way, if you iterate on an object with a `for-in` loop, you're getting at the values indirectly, because it's actually iterating only over the enumerable properties of the object, leaving you to access the properties manually to get the values.

Helpfully, ES6 adds a `for-of` loop syntax for iterating over arrays and objects:

```js
var myObject = {
	a: 2,
	b: 3
};

for (var v of myObject) {
	console.log( v );
}
// 2 3
```

Technically, the `for-of` loop asks for an iterator (a default internal function known as `@@iterator` in spec-speak) of the array or object, and the loop iterates over the successive return values from calling that iterator's `next()` method, once for each loop iteration.

Here's an example that sort-of fakes how the built-in for-of value-iteration mechanism works:

```js
var myObject = {
	a: 2,
	b: 3
};

var myObjectIterator = (function(){
	var i = 0,
		keys = Object.getOwnPropertyNames( myObject )
	;

	return {
		next: function(){
			if (i >= keys.length) throw "Error!";

			var ret = {
				value: myObject[ keys[ i++ ] ],
				done: (i >= keys.length)
			};

			return ret;
		}
	}
})();

// for (var v of myObject) {
//    console.log( v );
// }

for (var n, v;
	!(n && n.done) &&
	(n = myObjectIterator.next(), v = n.value, 1);
) {
	console.log( "value: " + v );
}
// 2 3
```

## Review (TL;DR)

Objects in JS have both a literal form (such as `var a = { .. }`) and a constructed form (such as `var a = new Array(..)`). The literal form is almost always preferred, but the constructed form offers, in some cases, more creation options.

Many people mistakingly claim "everything in JavaScript is an object", but this is incorrect. Objects are one of the 6 (or 7, depending on your perspective) primitive types. Objects have sub-types, including `function`, and also can be behavior-specialized, like `[object Array]` as the internal `[[Class]]` representing the array object-type.

Objects are collections of key/value pairs. The values can be accessed as properties, via `.propName` or `["propName"]` syntax. Whenever a property is accessed, the engine actually invokes the internal default `[[Get]]` operation, which not only looks for the property directly on the object, but which will traverse the `[[Prototype]]` chain if not found.

Properties don't have to contain values -- they can be getters/setters instead. They can also be either *enumerable* or not, which controls if they show up in `for-in` loop iterations, for instance.
