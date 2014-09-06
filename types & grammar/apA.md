# You Don't Know JS: Types & Grammar
# Appendix A: Mixed Environment JavaScript

Beyond the core language mechanics we've fully explored in this book, there are several ways that your JS code can behave differently when it runs *in the real world*. If JS was executing purely inside an engine, it'd be entirely predictable based on nothing but the black-and-white of the spec. But JS pretty much always runs in the context of a hosting environment, which exposes your code to some degree of unpredictability.

For example, when your code runs alongside code from other sources, and when your code runs in different types of JS engines (not just browsers), there are some things which may behave differently.

We'll briefly explore some of these concerns.

## Multiple `<script>` Elements

Most web sites and web applications have more than one script file that comprises their code, and it's common for there two be a few or several `<script src=..>` elements in the page which load these files separately.

But do these separate files constitute separate programs or are they collectively one JS program?

The reality is they act more like indepdendent JS programs in most respects. The one thing they *share* is the single `global` object (`window` in the browser), which means multiple files can append their code to the shared namespace(s) and they can all interact.

If "script1.js" includes a global function `foo()` in it, when "script2.js" later runs, it can access and call `foo()` just as if "script2.js" had defined the function.

But if an error occurs in "script2.js", only "script2.js" as a separate standalone JS program will fail and stop, and any subsequent files/programs like "script3.js" will run (still with the shared `global`) unimpeded.

## Host Objects

## Global DOM Variables

## Native Prototypes

## Annex B

## Summary

We know and can rely upon the fact that the JS language itself has one standard and is predictably implemented by all the modern browsers/engines. This is a very good thing!

But JavaScript rarely runs in isolation. It runs in an environment mixed in with code from third-party libraries, and sometimes it even runs in engines/environments that differ from those found in browsers.

Paying close attention to these issues improves the reliability and robustness of your code!
