# You Don't Know JS: Async & Performance
# Appendix A: Advanced Async Patterns

Chapters 1 and 2 went into quite a bit of detail about typical asynchronous programming patterns and how they're commonly solved with callbacks. But we also saw why callbacks are fatally limited in capability, which led us to Chapters 3 and 4, with promises and generators offering a much more solid, trustable, and reason-able base to build your asynchrony on.

But generators (and promises!) also offer a path toward more sophisticated asynchronous patterns, which we want to take a look at briefly.

Also, many of these advanced asynchronous patterns are made much more palatable through libraries, so I will show each of them in the context of my asynchronous capability library: *asynquence* (http://github.com/getify/asynquence). That's not to say *asynquence* is your only option -- certainly there are many great libraries in this space.

But *asynquence* provides a unique perspective by combining the best of all these patterns into a single library, and a single basic abstraction: the sequence.

My premise is that sophisticated JS programs often need bits and pieces of various different asynchronous patterns woven together, and this is usually left entirely up to each developer to figure out. Instead of having to bring in two or more different async libraries that focus on different aspects of asynchrony, *asynquence* unifies them into variated sequence steps, with just one core library to learn and deploy.







