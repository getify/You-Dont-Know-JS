# You Don't Know JS: Types & Grammar
# Appendix A: Mixed Environment JavaScript

当你的JS代码在真实世界中运行时，除了我们在本书中完整探索过的核心语言机制以外，还有好几种不同的行为方式。如果JS纯粹地运行在一个引擎中，那么它就会按照语言规范非黑即白地动作，是完全可以预测的。但是JS很可能总是运行在一个宿主环境的上下文中，这将会给你的代码带来某种程度的不可预测性。

例如，当你的代码与源自于其他地方的代码并肩运行时，或者当你的代码在不同种类的JS引擎（不只是浏览器）中运行时，有些事情的行为就可能不同。

我们将简要地探索这些问题中的一些。

## Annex B (ECMAScript)

一个鲜为人知的事实是，这门语言的官方名称是ECMAScript（意指管理它的ECMA标准本体）。那么“JavaScript”是什么？JavaScript是这门语言常见的商业名称，当然，更恰当地说，JavaScript基本上是语言规范的浏览器实现。

官方的ECMAScript语言规范包含“Annex B”，它是为了浏览器中JS兼容性的目的，讨论那些与官方语言规范有偏差的特别部分。

考虑这些偏差部分的恰当方法是，它们仅在你的代码运行在浏览器中时才是确实会出现/合法的。如果你的代码总是运行在浏览器中，那你就不会看到明显的不同。如果不是（比如它可以运行在node.js、Rhino中，等等），或者你不确定，那么就要小心对待。

兼容性上的主要不同是：

* 八进制数字字面量是允许的，比如在非`strict mode`下的`123`（小数`83`）。
* `window.escape(..)`和`window.unescape(..)`允许你使用`%`分割的十六进制转义序列来转义或非转义字符串。
* `String.prototype.substr`与`String.prototype.substring`十分相似，除了第二个参数是`length`（包含的字符数），而非结束（不含）的索引。

### Web ECMAScript

Web ECMAScript语言规范涵盖了官方ECMAScript语言规范与当前浏览器中JavaScript实现之间的不同。

换言之，这些项目是浏览器的“必须品”（为了相互兼容），但是（在本书编写时）没有列在官方语言规范的“Annex B”部分：

* `<!--`和`-->`是合法的单行注释分割符。
* `String.prototype` 返回HTML格式化字符串的附加方法：`anchor(..)`, `big(..)`, `blink(..)`, `bold(..)`, `fixed(..)`, `fontcolor(..)`, `fontsize(..)`, `italics(..)`, `link(..)`, `small(..)`, `strike(..)`, 和`sub(..)`。**注意：** 它们在实际应用中非常罕见，而且一般来说不鼓励使用，而是用其他内建DOM API或用户定义的工具取代。
* `RegExp`扩展：`RegExp.$1` .. `RegExp.$9`（匹配组）和`RegExp.lastMatch`/`RegExp["$&"]`（最近的匹配）。
* `Function.prototype`附加功能：`Function.prototype.arguments`（内部`arguments`对象的别名）和`Function.caller`（内部`arguments.caller`的别名）。**注意：** `arguments`和 `arguments.caller`都被废弃了，所以你应当尽可能避免使用它们。这些别名更是这样 —— 不要使用它们！

**注意：** 其他的一些微小和罕见的偏差点没有包含在我们这里的列表中。有必要的话，更多详细信息参见外部的“Annex B”和“Web ECMAScript”文档。

一般来说，所有这些不同点都很少被使用，所以这些与语言规范有出入的地方不是什么重大问题。只是如果你依赖于其中任何一个的话，**要小心**。

## Host Objects

JS中变量的行为有一些例外 —— 当它们是被自动定义，或由持有你代码的环境（浏览器等）创建并提供给JS时 —— 也就是所谓的“宿主对象”（包括`object`和`function`两者）。

例如：

```js
var a = document.createElement( "div" );

typeof a;								// "object" -- as expected
Object.prototype.toString.call( a );	// "[object HTMLDivElement]"

a.tagName;								// "DIV"
```

`a`不仅是一个`object`，而且是一个特殊的宿主对象，因为它是一个DOM元素。它拥有一个不同的内部`[[Class]]`值（`"HTMLDivElement"`），而且带有预定义的（而且通常是不可更改的）属性。

另一个已经在第四章的“Falsy对象”一节中探讨过的同样的怪异之处是：存在这样一些对象，当被强制转换为`boolean`时，它们将（令人糊涂地）被转换为`false`而不是预期的`true`。

另一些需要小心的宿主对象行为包括：

* 不能访问像`toString()`这样的`object`内建方法
* 不可覆盖
* 拥有特定的预定义只读属性
* 拥有一些`this`不可被重载为其他对象的方法
* 和其他...

为了使我们的JS代码与它外围的环境一起工作，宿主对象至关重要。但在你与宿主对象交互时是要特别注意，并且小心地推测它的行为，因为它们经常与普通的JS`object`不符。

一个你可能经常与之交互的宿主对象的尽人皆知的例子，就是`console`对象和他的各种函数（`log(..)`、`error(..)`等等）。`console`对象是由 *宿主环境* 特别提供的，所以你的代码可以与之互动来进行各种开发相关的输出任务。

在浏览器中，`console`与开发者工具控制台的显示相勾连，因此在node.js和其他服务器端JS环境中，`console`一般连接着JavaScript环境系统进程的标准输出流（`stdout`）和标准错误流（`stderr`）。

## Global DOM Variables

你可能知道，在全局作用域中声明变量（用或者不用`var`）不仅会创建一个全局变量，还会创建它的镜像：在`global`对象（浏览器中的`window`）上的同名属性。

但少为人知的是，（由于浏览器的遗留行为）使用`id`属性创建DOM元素会创建同名的全局变量。例如：

```html
<div id="foo"></div>
```

和：

```js
if (typeof foo == "undefined") {
	foo = 42;		// will never run
}

console.log( foo );	// HTML element
```

You're perhaps used to managing global variable tests (using `typeof` or `.. in window` checks) under the assumption that only JS code creates such variables, but as you can see, the contents of your hosting HTML page can also create them, which can easily throw off your existence check logic if you're not careful.

This is yet one more reason why you should, if at all possible, avoid using global variables, and if you have to, use variables with unique names that won't likely collide. But you also need to make sure not to collide with the HTML content as well as any other code.

## Native Prototypes

One of the most widely known and classic pieces of JavaScript *best practice* wisdom is: **never extend native prototypes**.

Whatever method or property name you come up with to add to `Array.prototype` that doesn't (yet) exist, if it's a useful addition and well-designed, and properly named, there's a strong chance it *could* eventually end up being added to the spec -- in which case your extension is now in conflict.

Here's a real example that actually happened to me that illustrates this point well.

I was building an embeddable widget for other websites, and my widget relied on jQuery (though pretty much any framework would have suffered this gotcha). It worked on almost every site, but we ran across one where it was totally broken.

After almost a week of analysis/debugging, I found that the site in question had, buried deep in one of its legacy files, code that looked like this:

```js
// Netscape 4 doesn't have Array.push
Array.prototype.push = function(item) {
	this[this.length] = item;
};
```

Aside from the crazy comment (who cares about Netscape 4 anymore!?), this looks reasonable, right?

The problem is, `Array.prototype.push` was added to the spec sometime subsequent to this Netscape 4 era coding, but what was added is not compatible with this code. The standard `push(..)` allows multiple items to be pushed at once. This hacked one ignores the subsequent items.

Basically all JS frameworks have code that relies on `push(..)` with multiple elements. In my case, it was code around the CSS selector engine that was completely busted. But there could conceivably be dozens of other places susceptible.

The developer who originally wrote that `push(..)` hack had the right instinct to call it `push`, but didn't foresee pushing multiple elements. They were certainly acting in good faith, but they created a landmine that didn't go off until almost 10 years later when I unwittingly came along.

There's multiple lessons to take away on all sides.

First, don't extend the natives unless you're absolutely sure your code is the only code that will ever run in that environment. If you can't say that 100%, then extending the natives is dangerous. You must weigh the risks.

Next, don't unconditionally define extensions (because you can overwrite natives accidentally). In this particular example, had the code said this:

```js
if (!Array.prototype.push) {
	// Netscape 4 doesn't have Array.push
	Array.prototype.push = function(item) {
		this[this.length] = item;
	};
}
```

The `if` statement guard would have only defined this hacked `push()` for JS environments where it didn't exist. In my case, that probably would have been OK. But even this approach is not without risk:

1. If the site's code (for some crazy reason!) was relying on a `push(..)` that ignored multiple items, that code would have been broken years ago when the standard `push(..)` was rolled out.
2. If any other library had come in and hacked in a `push(..)` ahead of this `if` guard, and it did so in an incompatible way, that would have broken the site at that time.

What that highlights is an interesting question that, frankly, doesn't get enough attention from JS developers: **Should you EVER rely on native built-in behavior** if your code is running in any environment where it's not the only code present?

The strict answer is **no**, but that's awfully impractical. Your code usually can't redefine its own private untouchable versions of all built-in behavior relied on. Even if you *could*, that's pretty wasteful.

So, should you feature-test for the built-in behavior as well as compliance-testing that it does what you expect? And what if that test fails -- should your code just refuse to run?

```js
// don't trust Array.prototype.push
(function(){
	if (Array.prototype.push) {
		var a = [];
		a.push(1,2);
		if (a[0] === 1 && a[1] === 2) {
			// tests passed, safe to use!
			return;
		}
	}

	throw Error(
		"Array#push() is missing/broken!"
	);
})();
```

In theory, that sounds plausible, but it's also pretty impractical to design tests for every single built-in method.

So, what should we do? Should we *trust but verify* (feature- and compliance-test) **everything**? Should we just assume existence is compliance and let breakage (caused by others) bubble up as it will?

There's no great answer. The only fact that can be observed is that extending native prototypes is the only way these things bite you.

If you don't do it, and no one else does in the code in your application, you're safe. Otherwise, you should build in at least a little bit of skepticism, pessimism, and expectation of possible breakage.

Having a full set of unit/regression tests of your code that runs in all known environments is one way to surface some of these issues earlier, but it doesn't do anything to actually protect you from these conflicts.

### Shims/Polyfills

It's usually said that the only safe place to extend a native is in an older (non-spec-compliant) environment, since that's unlikely to ever change -- new browsers with new spec features replace older browsers rather than amending them.

If you could see into the future, and know for sure what a future standard was going to be, like for `Array.prototype.foobar`, it'd be totally safe to make your own compatible version of it to use now, right?

```js
if (!Array.prototype.foobar) {
	// silly, silly
	Array.prototype.foobar = function() {
		this.push( "foo", "bar" );
	};
}
```

If there's already a spec for `Array.prototype.foobar`, and the specified behavior is equal to this logic, you're pretty safe in defining such a snippet, and in that case it's generally called a "polyfill" (or "shim").

Such code is **very** useful to include in your code base to "patch" older browser environments that aren't updated to the newest specs. Using polyfills is a great way to create predictable code across all your supported environments.

**Tip:** ES5-Shim (https://github.com/es-shims/es5-shim) is a comprehensive collection of shims/polyfills for bringing a project up to ES5 baseline, and similarly, ES6-Shim (https://github.com/es-shims/es6-shim) provides shims for new APIs added as of ES6. While APIs can be shimmed/polyfilled, new syntax generally cannot. To bridge the syntactic divide, you'll want to also use an ES6-to-ES5 transpiler like Traceur (https://github.com/google/traceur-compiler/wiki/GettingStarted).

If there's likely a coming standard, and most discussions agree what it's going to be called and how it will operate, creating the ahead-of-time polyfill for future-facing standards compliance is called "prollyfill" (probably-fill).

The real catch is if some new standard behavior can't be (fully) polyfilled/prollyfilled.

There's debate in the community if a partial-polyfill for the common cases is acceptable (documenting the parts that cannot be polyfilled), or if a polyfill should be avoided if it purely can't be 100% compliant to the spec.

Many developers at least accept some common partial polyfills (like for instance `Object.create(..)`), because the parts that aren't covered are not parts they intend to use anyway.

Some developers believe that the `if` guard around a polyfill/shim should include some form of conformance test, replacing the existing method either if it's absent or fails the tests. This extra layer of compliance testing is sometimes used to distinguish "shim" (compliance tested) from "polyfill" (existence checked).

The only absolute take-away is that there is no absolute *right* answer here. Extending natives, even when done "safely" in older environments, is not 100% safe. The same goes for relying upon (possibly extended) natives in the presence of others' code.

Either should always be done with caution, defensive code, and lots of obvious documentation about the risks.

## `<script>`s

Most browser-viewed websites/applications have more than one file that contains their code, and it's common to have a few or several `<script src=..></script>` elements in the page that load these files separately, and even a few inline-code `<script> .. </script>` elements as well.

But do these separate files/code snippets constitute separate programs or are they collectively one JS program?

The (perhaps surprising) reality is they act more like independent JS programs in most, but not all, respects.

The one thing they *share* is the single `global` object (`window` in the browser), which means multiple files can append their code to that shared namespace and they can all interact.

So, if one `script` element defines a global function `foo()`, when a second `script` later runs, it can access and call `foo()` just as if it had defined the function itself.

But global variable scope *hoisting* (see the *Scope & Closures* title of this series) does not occur across these boundaries, so the following code would not work (because `foo()`'s declaration isn't yet declared), regardless of if they are (as shown) inline `<script> .. </script>` elements or externally loaded `<script src=..></script>` files:

```html
<script>foo();</script>

<script>
  function foo() { .. }
</script>
```

But either of these *would* work instead:

```html
<script>
  foo();
  function foo() { .. }
</script>
```

Or:

```html
<script>
  function foo() { .. }
</script>

<script>foo();</script>
```

Also, if an error occurs in a `script` element (inline or external), as a separate standalone JS program it will fail and stop, but any subsequent `script`s will run (still with the shared `global`) unimpeded.

You can create `script` elements dynamically from your code, and inject them into the DOM of the page, and the code in them will behave basically as if loaded normally in a separate file:

```js
var greeting = "Hello World";

var el = document.createElement( "script" );

el.text = "function foo(){ alert( greeting );\
 } setTimeout( foo, 1000 );";

document.body.appendChild( el );
```

**Note:** Of course, if you tried the above snippet but set `el.src` to some file URL instead of setting `el.text` to the code contents, you'd be dynamically creating an externally loaded `<script src=..></script>` element.

One difference between code in an inline code block and that same code in an external file is that in the inline code block, the sequence of characters `</script>` cannot appear together, as (regardless of where it appears) it would be interpreted as the end of the code block. So, beware of code like:

```html
<script>
  var code = "<script>alert( 'Hello World' )</script>";
</script>
```

It looks harmless, but the `</script>` appearing inside the `string` literal will terminate the script block abnormally, causing an error. The most common workaround is:

```js
"</sc" + "ript>";
```

Also, beware that code inside an external file will be interpreted in the character set (UTF-8, ISO-8859-8, etc.) the file is served with (or the default), but that same code in an inline `script` element in your HTML page will be interpreted by the character set of the page (or its default).

**Warning:** The `charset` attribute will not work on inline script elements.

Another deprecated practice with inline `script` elements is including HTML-style or X(HT)ML-style comments around inline code, like:

```html
<script>
<!--
alert( "Hello" );
//-->
</script>

<script>
<!--//--><![CDATA[//><!--
alert( "World" );
//--><!]]>
</script>
```

Both of these are totally unnecessary now, so if you're still doing that, stop it!

**Note:** Both `<!--` and `-->` (HTML-style comments) are actually specified as valid single-line comment delimiters (`var x = 2; <!-- valid comment` and `--> another valid line comment`) in JavaScript (see the "Web ECMAScript" section earlier), purely because of this old technique. But never use them.

## Reserved Words

The ES5 spec defines a set of "reserved words" in Section 7.6.1 that cannot be used as standalone variable names. Technically, there are four categories: "keywords", "future reserved words", the `null` literal, and the `true` / `false` boolean literals.

Keywords are the obvious ones like `function` and `switch`. Future reserved words include things like `enum`, though many of the rest of them (`class`, `extends`, etc.) are all now actually used by ES6; there are other strict-mode only reserved words like `interface`.

StackOverflow user "art4theSould" creatively worked all these reserved words into a fun little poem (http://stackoverflow.com/questions/26255/reserved-keywords-in-javascript/12114140#12114140):

> Let this long package float,
> Goto private class if short.
> While protected with debugger case,
> Continue volatile interface.
> Instanceof super synchronized throw,
> Extends final export throws.
>
> Try import double enum?
> - False, boolean, abstract function,
> Implements typeof transient break!
> Void static, default do,
> Switch int native new.
> Else, delete null public var
> In return for const, true, char
> …Finally catch byte.

**Note:** This poem includes words that were reserved in ES3 (`byte`, `long`, etc.) that are no longer reserved as of ES5.

Prior to ES5, the reserved words also could not be property names or keys in object literals, but that restriction no longer exists.

So, this is not allowed:

```js
var import = "42";
```

But this is allowed:

```js
var obj = { import: "42" };
console.log( obj.import );
```

You should be aware though that some older browser versions (mainly older IE) weren't completely consistent on applying these rules, so there are places where using reserved words in object property name locations can still cause issues. Carefully test all supported browser environments.

## Implementation Limits

The JavaScript spec does not place arbitrary limits on things such as the number of arguments to a function or the length of a string literal, but these limits exist nonetheless, because of implementation details in different engines.

For example:

```js
function addAll() {
	var sum = 0;
	for (var i=0; i < arguments.length; i++) {
		sum += arguments[i];
	}
	return sum;
}

var nums = [];
for (var i=1; i < 100000; i++) {
	nums.push(i);
}

addAll( 2, 4, 6 );				// 12
addAll.apply( null, nums );		// should be: 499950000
```

In some JS engines, you'll get the correct `499950000` answer, but in others (like Safari 6.x), you'll get the error: "RangeError: Maximum call stack size exceeded."

Examples of other limits known to exist:

* maximum number of characters allowed in a string literal (not just a string value)
* size (bytes) of data that can be sent in arguments to a function call (aka stack size)
* number of parameters in a function declaration
* maximum depth of non-optimized call stack (i.e., with recursion): how long a chain of function calls from one to the other can be
* number of seconds a JS program can run continuously blocking the browser
* maximum length allowed for a variable name
* ...

It's not very common at all to run into these limits, but you should be aware that limits can and do exist, and importantly that they vary between engines.

## Review

We know and can rely upon the fact that the JS language itself has one standard and is predictably implemented by all the modern browsers/engines. This is a very good thing!

But JavaScript rarely runs in isolation. It runs in an environment mixed in with code from third-party libraries, and sometimes it even runs in engines/environments that differ from those found in browsers.

Paying close attention to these issues improves the reliability and robustness of your code.
