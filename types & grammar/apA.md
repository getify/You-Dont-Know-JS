# You Don't Know JS: Types & Grammar
# Appendix A: Mixed Environment JavaScript

Beyond the core language mechanics we've fully explored in this book, there are several ways that your JS code can behave differently when it runs *in the real world*. If JS was executing purely inside an engine, it'd be entirely predictable based on nothing but the black-and-white of the spec. But JS pretty much always runs in the context of a hosting environment, which exposes your code to some degree of unpredictability.

For example, when your code runs alongside code from other sources, and when your code runs in different types of JS engines (not just browsers), there are some things which may behave differently.

We'll briefly explore some of these concerns.

## Multiple `<script>` Elements

## Host Objects

## DOM ID's As Global Variables

## Native Prototypes

## Annex B

## Summary

We know and can rely upon the fact that the JS language itself has one standard and is predictably implemented by all the modern browsers/engines. This is a very good thing!

But JavaScript rarely runs in isolation. It runs in an environment mixed in with code from third-party libraries, and sometimes it even runs in engines/environments that differ from browsers.

Paying close attention to these issues improves the reliability and robustness of your code!
