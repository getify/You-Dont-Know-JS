# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 2: Objects as Classes

| NOTE: |
| :--- |
| Work in progress |

The class-design pattern generally entails defining an abstract definition for a *type of thing* (class), including data (members) and behaviors (methods), and then creating one or more concrete *instances* of this class definition as actual objects that can perform tasks. Moreover, class-orientation allows declaring a relationship between two or more classes, through what's called "inheritance", to derive new and augmented "subclasses".

Prior to ES6 (2015), JS developers mimicked aspects of class-oriented (aka "object-oriented") design using plain functions and objects, along with the `[[Prototype]]` mechanism (as explained in the previous chapter) -- so called "prototypal classes".

But to many developers joy and relief, ES6 introduced dedicated syntax, including the `class` and `extends` keywords, to express class-oriented design more declaratively.

At the time of ES6's `class` being introduced, this new dedicated syntax was almost entirely *just syntactic sugar* to make class definitions more convenient and readable. However, in the many years since ES6, `class` has matured and grown into its own first class feature mechanism, accruing a significant amount of dedicated syntax and complex behaviors that far surpass the pre-ES6 "prototypal class" capabilities.

Even though `class` now bears almost no resemblance to older "prototypal class" code style, the JS engine is still *just* wiring up objects to each other through the existing `[[Prototype]]` mechanism. In other words, `class` is not its own separate pillar of the language (as `[[Prototype]]` is), but more like the fancy, decorative *Capital* that tops the pillar/column.

That said, since `class` style code has now replaced virtually all previous "prototypal class" coding style, the main text here focuses only on `class` and its various particulars. For historical purposes, we'll briefly cover the old "prototypal class" style in Appendix A.
