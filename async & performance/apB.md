# You Don't Know JS: Async & Performance
# Appendix B: Advanced Async Patterns

Appendix A introduced the *asynquence* library for sequence oriented async flow control, primarily based on promises and generators.

Now we'll explore other advanced asynchronous patterns built on top of our existing understanding and functionality.

## Iteratable Sequences

We introduced *asynquence*'s iterable sequences in the previous appendix, but we want to revisit it in more detail.

Let's define a sequence of steps as an iterable sequence:

```js
var isq = ASQ.iterable();

isq
// step 1
.then( function(x){
	return x * 2;
} )
// step 2
.then( function(x){
	return x + 3;
} )
// step 3
.then( function(x){
	return x * 4;
} );

isq.next( 8 ).value;	// 16
isq.next( 16 ).value;	// 19
isq.next( 19 ).value;	// 76
```

As you can see, an iterable sequence is a standard-compliant *iterator* (see Chapter 4).

## Summary

Promises and generators provide the foundational building blocks upon which we can build much more sophisticated and capable asynchrony.
