# You Don't Know JS: Types & Grammar
# Appendix A: Mixed Environment JavaScript

Beyond the core language mechanics we've fully explored in this book, there are several ways that your JS code can behave differently when it runs *in the real world*. If JS was executing purely inside an engine, it'd be entirely predictable based on nothing but the black-and-white of the spec. But JS pretty much always runs in the context of a hosting environment, which exposes your code to some degree of unpredictability.

For example, when your code runs alongside code from other sources, or when your code runs in different types of JS engines (not just browsers), there are some things which may behave differently.

We'll briefly explore some of these concerns.

## Annex B (ECMASCript)

It's a little known fact that the official name of the language is ECMAScript (referring to the ECMA standards body that manages it). What then is "JavaScript"? JavaScript is the common tradename of the language, of course, but more appropriately, JavaScript is basically the browser implementation of the spec.

The official ECMAScript specification includes "Annex B" which discusses specific deviations from the official spec for the purposes of JS compatibility in browsers.

The proper way to consider these deviations is that they are only reliably present/valid if your code is running in a browser. If your code always runs in browsers, you won't see any observable difference. If not (like if it can run in node.js, Rhino, etc), or you're not sure, *tread carefully*.

The main compatibility differences:

* Octal number literals are allowed, such as `0123` (decimal `83`) in non-`strict mode`.
* `window.escape(..)` and `window.unescape(..)` allow you to escape or unescape strings with `%`-delimited hexadecimal escape sequences. For example: `window.escape( "?foo=97%&bar=3%" )` produces `"%3Ffoo%3D97%25%26bar%3D3%25"`.
* `String.prototype.substr` is quite similar to `String.prototype.substring`, except that instead of the second parameter being the ending index (non-inclusive), the second parameter is the `length` (number of characters to include).

### Web ECMAScript

The Web ECMAScript specification (http://javascript.spec.whatwg.org/) covers the differences between the official ECMAScript specification and the current JavaScript implementations in browsers.

In other words, these items are "required" of browsers (to be compatible with each other) but are not (as of time of writing) listed in the "Annex B" of the official spec:

* `<!--` and `-->` are valid single-line comment delimiters
* `String.prototype` additions for returning HTML-formatted strings: `anchor(..)`, `big(..)`, `blink(..)`, `bold(..)`, `fixed(..)`, `fontcolor(..)`, `fontsize(..)`, `italics(..)`, `link(..)`, `small(..)`, `strike(..)`, and `sub(..)`. **Note:** These are very rarely used in practice, and are generally discouraged in favor of other built-in DOM APIs or user-defined utilities.
* `RegExp` extensions: `RegExp.$1` .. `RegExp.$9` (match-groups) and `RegExp.lastMatch` / `RegExp["$&"]` (most recent match).
* `Function.prototype` additions: `Function.prototype.arguments` (aliases internal `arguments` object), `Function.caller` (aliases internal `arguments.caller`). **Note:** `arguments` and thus `arguments.caller` are deprecated, so you should avoid using them if possible. That goes doubly so for these aliases; don't use them!

**Note:** Some other minor and rarely used deviations are not included in our list here. See "Annex B" and "Web ECMAScript" for more detailed information as needed.

Generally speaking, all these differences are rarely used, so the deviations from the specification are not significant concerns. **Just be careful** if you rely on any of them.

## Host Objects

## Global DOM Variables

## Native Prototypes

## `<script>`s

Most browser-viewed web sites/applications have more than one file that contains their code, and it's common to have a few or several `<script src=..></script>` elements in the page which load these files separately, and even a few inline-code `<script> .. </script>` elements as well.

But do these separate files/code snippets constitute separate programs or are they collectively one JS program?

The (perhaps surprising) reality is they act more like independent JS programs in most, but not all, respects.

The one thing they *share* is the single `global` object (`window` in the browser), which means multiple files can append their code to that shared namespace and they can all interact.

So, if one `script` element defines a global function `foo()`, when a second `script` later runs, it can access and call `foo()` just as if it had defined the function itself.

But global variable scope *hoisting* (see the *"Scope & Closures"* title of this series) does not occur across these boundaries, so the following code would not work (because `foo()`'s declaration isn't yet declared), regardless of if they are (as shown) inline `<script> .. </script>` elements or externally-loaded `<script src=..></script>` files:

```html
<script>foo();</script>

<script>
  function foo() { .. }
</script>
```

But, either of these *would* work instead:

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

**Note:** Of course, if you tried the above snippet but set `el.src` to some file URL instead of setting `el.text` to the code contents, you'd be dynamically creating an externally-loaded `<script src=..></script>` element.

One difference between code in an inline code block and that same code in an external file is that in the inline code block, the sequence of characters `</script>` cannot appear together, as (regardless of where it appears) it would be interpreted as the end of the code block. So, beware of code like:

```html
<script>
  var code = "<script>alert( 'Hello World' )</script>";
</script>
```

It looks harmless, but the `</script>` appearing inside the script will terminate the script block abnormally, causing an error. The most common workaround is:

```js
"</sc" + "ript>";
```

Also, beware that code inside an external file will be interpreted in the character-set (UTF-8, ISO-8859-8, etc) the file is served with (or the default), but that same code in an inline `script` element in your HTML page will be interpreted by the character-set of the page (or its default). **Note:** The `charset` attribute will not work on inline script elements.

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

**Note:** Both `<!--` and `-->` (HTML-style comments) are actually specified as valid single-line comment delimiters (`var x = 2; <!-- valid comment` and `--> another valid line comment`) in JavaScript (see Web ECMAScript earlier), purely because of this old technique. But, never use them.

## Summary

We know and can rely upon the fact that the JS language itself has one standard and is predictably implemented by all the modern browsers/engines. This is a very good thing!

But JavaScript rarely runs in isolation. It runs in an environment mixed in with code from third-party libraries, and sometimes it even runs in engines/environments that differ from those found in browsers.

Paying close attention to these issues improves the reliability and robustness of your code!
