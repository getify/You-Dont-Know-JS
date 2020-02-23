# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Appendix B: Practice

This appendix aims to give you a few interesting exercises to test and solidify your understanding of the main topics from this book. It's a good idea to try out the exercises yourself -- in an actual code editor! -- instead of skipping straight to the solutions at the end. No cheating!

These exercises don't have a specific right answer that you have to get exactly. Your approach may differ some (or a lot!) from the solution I present, and that's OK.

I'm not judging you on how you write your code. My only goal is that you come away from this book feeling confident that you can tackle these sorts of coding tasks built on a strong foundation of knowledge. That's the only objective, here. If you're happy with your code, I am, too!

## Buckets of Marbles

Remember Figure 2 from back in Chapter 2?

<figure>
    <img src="images/fig2.png" width="300" alt="Colored Scope Bubbles" align="center">
    <figcaption><em>Fig. 2 (repeat): Colored Scope Bubbles</em></figcaption>
    <br><br>
</figure>

This exercise asks you to write a program -- any program! -- that contains nested functions and block scopes, which satisifies these constraints:

* If you color all the scopes (including the global scope!) different colors, you need at least 6 colors. Make sure to add a code comment labeling each scope with its color.

    BONUS: identify any implied scopes your code may have.

* Each scope has at least 1 identifier.

* Contains at least two function scopes and at least two block scopes.

* At least one variable from an outer scope must be shadowed by a nested scope variable (see Chapter 3).

* At least one variable reference must resolve to a variable declaration at least two levels higher in the scope chain.

## Solutions

The "Buckets of Marbles" exercise could be solved with the following code:

```js
// RED(1)
const howMany = 100;

// Sieve of Eratosthenes
function findPrimes(howMany) {
    // BLUE(2)
    var sieve = Array(howMany).fill(true);
    var max = Math.sqrt(howMany);

    for (let i = 2; i < max; i++) {
        // GREEN(3)
        if (sieve[i]) {
            // ORANGE(4)
            let j = Math.pow(i,2);
            for (let k = j; k < howMany; k += i) {
                // PURPLE(5)
                sieve[k] = false;
            }
        }
    }

    return sieve
        .map(function getPrime(flag,prime){
            // PINK(6)
            if (flag) return prime;
            return flag;
        })
        .filter(function onlyPrimes(v){
            // YELLOW(7)
            return !!v;
        })
        .slice(1);
}

findPrimes(howMany);
// [
//    2, 3, 5, 7, 11, 13, 17,
//    19, 23, 29, 31, 37, 41,
//    43, 47, 53, 59, 61, 67,
//    71, 73, 79, 83, 89, 97
// ]
```
