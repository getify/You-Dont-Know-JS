# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# 3장: 스코프 체인<sub>Scope Chain</sub>

챕터 1과 2에서는 렉시컬 스코프(와 구성하는 요소)에 대해 구체적인 정의를 내리고 그 개념적인 기초에 도움이 될만한 비유를 설명했다. 이 챕터를 진행하기 전에, 렉시컬 스코프가 무엇이고 왜 그것이 유용한지 당신이 직접 (글이나 말로)설명해줄 다른 사람을 찾아 보아라.

건너뛸 수도 있는 단계처럼 보이지만, 이런 생각을 시간을 들여 다른 사람들에게 설명할 수 있도록 재구성하는 것이 정말로 도움이 된다는 것을 알게 되었다. 이런 과정은 배운 내용을 뇌가 소화하도록 도와주기 때문이다.

이제 요점을 파헤칠 시간이다. 지금부터는 좀 더 자세한 내용을 살펴볼 것이다. 그래도 위 방법을 계속 사용해보라. 위와 같은(these) 토론은 우리가 아직 스코프<sub>scope</sub>에 대해 얼마나 모르는지를 확실히 알려줄 것이기 때문이다. 이 글(이 글이 어떤 내용인지 모르겠음)과 코드를 시간을 내서 읽어보아라.

실행중인 예제의 컨텍스트를 새로 고치기 위해 2장, 그림 2의 중첩 된 스코프 버블 그림을 다시 살펴보자.

<figure>
    <img src="images/fig2.png" width="500" alt="Colored Scope Bubbles" align="center">
    <figcaption><em>그림 2: 색깔있는 스코프 버블</em></figcaption>
    <br><br>
</figure>

또 다른 스코프의 내부로 중첩되어 있는 스코프 간의 연결을 스코프 체인이라고 하며, 이 연결을 통해서 변수에 접근할 수 있는 경로를 결정한다. 이 체인은 방향성이 있다. 바깥쪽으로만(upward/outward only) 룩업을 수행할 수 있기 때문이다.

## "룩업"은 (거의) 개념적이다.

그림 2에서, `for` 반복문에서 참조하는 `students` 변수의 색상에 주목하라. 우리는 어떻게 이 변수를 빨강(1) 구슬로 정확하게 결정할 수 있었을까?

2장에서 우리는 런타임에 변수에 접근하는 과정을 "룩업"이라고 설명했는데, 이 과정에서 *엔진*은 현재 스코프의 *스코프 매니저*에게 식별자/변수를 알고 있는지 물어보면서, 그 식별자/변수를 찾을 때까지 중첩된 스코프 체인을 통해 (전역 스코프를 향해) 바깥쪽(upward/outward)으로 진행해야한다. 스코프 양동이안에서 일치하는 첫 번째 선언을 찾아내면 즉시 룩업이 중단된다.

최종 글로벌 스코프에 도달하기 전까지 스코프 체인을 통과할 때 일치하는 변수 이름을 찾지 못해 '학생'이 '빨간색(1) 대리석'으로 판정됐다.
마지막 빨강(1) 전역 스코프에 도달할 때까지 스코프 체인을 따라가는 동안 알맞은 변수 이름을 찾아내지 못했기 때문에, 이 룩업 과정에서 `students`가 빨강(1) 구슬이라는 것을 알 수 있다.

비슷한 방법으로 `if`조건문에 있는 `studentID`를 파랑(2) 구슬로 확정할 수 있다.

런타임 룩업 과정에 대한 이 제안은 개념적인 이해에는 효과적이지만, 실제로 이렇게 동작하지는 않는다.

구슬의 양동이 색상(변수가 비롯된 범위에 대한 메타 정보)은 초기 컴파일 과정중에 *대부분 결정*된다. 렉시컬 스코프가 이 시점에서 거의 마무리되기 때문에 구슬의 색상은 이후 런타임 도중에 발생하는 작업에 의해서는 변경되지 않을 것이다.

구슬의 색상이 컴파일에 의해 알려진 다음 바뀌지 않으므로, 이 정보는 AST에 있는 각 변수의 입력과 함께 저장될 것이다.(적어도 접근할 수 있을 것이다.) 그리고 이 정보는 프로그램의 런타임을 구성하는 실행 지침에 따라 명시적으로 사용될 것이다.

다시 말해, (2장의) *엔진*은 변수가 유래한 스코프 양동이를 알아내기 위해 여러 스코프를 룩업하는 작업이 필요하지 않다. 그 정보는 이미 알려져 있다! 런타임 룩업이 필요한 상황을 피하는 것이 바로 렉시컬 스코프의 핵심적인 최적화 장점이다.

하지만 나는 조금 전에 컴파일중에 구슬의 색상을 알아내는 것과 관련하여 "대부분 결정"된다고 말한 바 있다. 그렇다면 어떤 경우에 컴파일하는 동안에도 알아내지 *못하는* 것일까?

현재 파일(*Get Started* 1장 참조. JS 컴파일 관점에서 각 파일은 자체적으로 개별적인 프로그램임을 확실히 하고있다.)에서 어휘적으로 사용 가능한 스코프 어디에도 선언되지 않은 변수에 대한 참조를 생각해보라. 선언을 찾지 못했더라도 *반드시* 에러인 것은 아니다. 런타임 상태인 다른 파일(프로그램)이 공유하는 전역변수에 대신 선언했을지도 모른다.

그래서 그 변수가 접근 가능한 양동이에 적절하게 선언되었는지에 대한 여부의 최종 결정은 런타임까지 연기해야 할 수도 있다.

초기에 *선언되지 않은* 변수에 대한 참조는 컴파일되는 동안 색이 없는 구슬로 남게 된다. 이 구슬의 색상은 관련된 다른 파일이 컴파일되고 그 프로그램의 런타임 상태가 시작될때까지 정해질 수 없다. 이렇게 미뤄진 룩업은 결국 변수가 발견된 스코프(아마도 전역 스코프)의 색상으로 결정할 것이다.

하지만, 이 룩업은 변수당 최대 한 번만 필요하다. 런타임중에 벌어지는 어떤 상황도 뒤늦게 구슬의 색상을 바꿀 수는 없기 때문이다.


2장의 "룩업 실패" 섹션은 참조가 실행되는 순간까지도 여전히 구슬에 색이 없는 경우에 어떤 일이 일어나는지를 다루고 있다.

## Shadowing

"Shadowing" might sound mysterious and a little bit sketchy. But don't worry, it's completely legit!

Our running example for these chapters uses different variable names across the scope boundaries. Since they all have unique names, in a way it wouldn't matter if all of them were just stored in one bucket (like RED(1)).

Where having different lexical scope buckets starts to matter more is when you have two or more variables, each in different scopes, with the same lexical names. A single scope cannot have two or more variables with the same name; such multiple references would be assumed as just one variable.

So if you need to maintain two or more variables of the same name, you must use separate (often nested) scopes. And in that case, it's very relevant how the different scope buckets are laid out.

Consider:

```js
var studentName = "Suzy";

function printStudent(studentName) {
    studentName = studentName.toUpperCase();
    console.log(studentName);
}

printStudent("Frank");
// FRANK

printStudent(studentName);
// SUZY

console.log(studentName);
// Suzy
```

| TIP: |
| :--- |
| Before you move on, take some time to analyze this code using the various techniques/metaphors we've covered in the book. In particular, make sure to identify the marble/bubble colors in this snippet. It's good practice! |

The `studentName` variable on line 1 (the `var studentName = ..` statement) creates a RED(1) marble. The same named variable is declared as a BLUE(2) marble on line 3, the parameter in the `printStudent(..)` function definition.

What color marble will `studentName` be in the `studentName = studentName.toUpperCase()` assignment statement and the `console.log(studentName)` statement? All three `studentName` references will be BLUE(2).

With the conceptual notion of the "lookup," we asserted that it starts with the current scope and works its way outward/upward, stopping as soon as a matching variable is found. The BLUE(2) `studentName` is found right away. The RED(1) `studentName` is never even considered.

This is a key aspect of lexical scope behavior, called *shadowing*. The BLUE(2) `studentName` variable (parameter) shadows the RED(1) `studentName`. So, the parameter is shadowing the (shadowed) global variable. Repeat that sentence to yourself a few times to make sure you have the terminology straight!

That's why the re-assignment of `studentName` affects only the inner (parameter) variable: the BLUE(2) `studentName`, not the global RED(1) `studentName`.

When you choose to shadow a variable from an outer scope, one direct impact is that from that scope inward/downward (through any nested scopes) it's now impossible for any marble to be colored as the shadowed variable—(RED(1), in this case). In other words, any `studentName` identifier reference will correspond to that parameter variable, never the global `studentName` variable. It's lexically impossible to reference the global `studentName` anywhere inside of the `printStudent(..)` function (or from any nested scopes).

### Global Unshadowing Trick

Please beware: leveraging the technique I'm about to describe is not very good practice, as it's limited in utility, confusing for readers of your code, and likely to invite bugs to your program. I'm covering it only because you may run across this behavior in existing programs, and understanding what's happening is critical to not getting tripped up.

It *is* possible to access a global variable from a scope where that variable has been shadowed, but not through a typical lexical identifier reference.

In the global scope (RED(1)), `var` declarations and `function` declarations also expose themselves as properties (of the same name as the identifier) on the *global object*—essentially an object representation of the global scope. If you've written JS for a browser environment, you probably recognize the global object as `window`. That's not *entirely* accurate, but it's good enough for our discussion. In the next chapter, we'll explore the global scope/object topic more.

Consider this program, specifically executed as a standalone .js file in a browser environment:

```js
var studentName = "Suzy";

function printStudent(studentName) {
    console.log(studentName);
    console.log(window.studentName);
}

printStudent("Frank");
// "Frank"
// "Suzy"
```

Notice the `window.studentName` reference? This expression is accessing the global variable `studentName` as a property on `window` (which we're pretending for now is synonymous with the global object). That's the only way to access a shadowed variable from inside a scope where the shadowing variable is present.

The `window.studentName` is a mirror of the global `studentName` variable, not a separate snapshot copy. Changes to one are still seen from the other, in either direction. You can think of `window.studentName` as a getter/setter that accesses the actual `studentName` variable. As a matter of fact, you can even *add* a variable to the global scope by creating/setting a property on the global object.

| WARNING: |
| :--- |
| Remember: just because you *can* doesn't mean you *should*. Don't shadow a global variable that you need to access, and conversely, avoid using this trick to access a global variable that you've shadowed. And definitely don't confuse readers of your code by creating global variables as `window` properties instead of with formal declarations! |

This little "trick" only works for accessing a global scope variable (not a shadowed variable from a nested scope), and even then, only one that was declared with `var` or `function`.

Other forms of global scope declarations do not create mirrored global object properties:

```js
var one = 1;
let notOne = 2;
const notTwo = 3;
class notThree {}

console.log(window.one);       // 1
console.log(window.notOne);    // undefined
console.log(window.notTwo);    // undefined
console.log(window.notThree);  // undefined
```

Variables (no matter how they're declared!) that exist in any other scope than the global scope are completely inaccessible from a scope where they've been shadowed:

```js
var special = 42;

function lookingFor(special) {
    // The identifier `special` (parameter) in this
    // scope is shadowed inside keepLooking(), and
    // is thus inaccessible from that scope.

    function keepLooking() {
        var special = 3.141592;
        console.log(special);
        console.log(window.special);
    }

    keepLooking();
}

lookingFor(112358132134);
// 3.141592
// 42
```

The global RED(1) `special` is shadowed by the BLUE(2) `special` (parameter), and the BLUE(2) `special` is itself shadowed by the GREEN(3) `special` inside `keepLooking()`. We can still access the RED(1) `special` using the indirect reference `window.special`. But there's no way for `keepLooking()` to access the BLUE(2) `special` that holds the number `112358132134`.

### Copying Is Not Accessing

I've been asked the following "But what about...?" question dozens of times. Consider:

```js
var special = 42;

function lookingFor(special) {
    var another = {
        special: special
    };

    function keepLooking() {
        var special = 3.141592;
        console.log(special);
        console.log(another.special);  // Ooo, tricky!
        console.log(window.special);
    }

    keepLooking();
}

lookingFor(112358132134);
// 3.141592
// 112358132134
// 42
```

Oh! So does this `another` object technique disprove my claim that the `special` parameter is "completely inaccessible" from inside `keepLooking()`? No, the claim is still correct.

`special: special` is copying the value of the `special` parameter variable into another container (a property of the same name). Of course, if you put a value in another container, shadowing no longer applies (unless `another` was shadowed, too!). But that doesn't mean we're accessing the parameter `special`; it means we're accessing the copy of the value it had at that moment, by way of *another* container (object property). We cannot reassign the BLUE(2) `special` parameter to a different value from inside `keepLooking()`.

Another "But...!?" you may be about to raise: what if I'd used objects or arrays as the values instead of the numbers (`112358132134`, etc.)? Would us having references to objects instead of copies of primitive values "fix" the inaccessibility?

No. Mutating the contents of the object value via a reference copy is **not** the same thing as lexically accessing the variable itself. We still can't reassign the BLUE(2) `special` parameter.

### Illegal Shadowing

Not all combinations of declaration shadowing are allowed. `let` can shadow `var`, but `var` cannot shadow `let`:

```js
function something() {
    var special = "JavaScript";

    {
        let special = 42;   // totally fine shadowing

        // ..
    }
}

function another() {
    // ..

    {
        let special = "JavaScript";

        {
            var special = "JavaScript";
            // ^^^ Syntax Error

            // ..
        }
    }
}
```

Notice in the `another()` function, the inner `var special` declaration is attempting to declare a function-wide `special`, which in and of itself is fine (as shown by the `something()` function).

The syntax error description in this case indicates that `special` has already been defined, but that error message is a little misleading—again, no such error happens in `something()`, as shadowing is generally allowed just fine.

The real reason it's raised as a `SyntaxError` is because the `var` is basically trying to "cross the boundary" of (or hop over) the `let` declaration of the same name, which is not allowed.

That boundary-crossing prohibition effectively stops at each function boundary, so this variant raises no exception:

```js
function another() {
    // ..

    {
        let special = "JavaScript";

        ajax("https://some.url",function callback(){
            // totally fine shadowing
            var special = "JavaScript";

            // ..
        });
    }
}
```

Summary: `let` (in an inner scope) can always shadow an outer scope's `var`. `var` (in an inner scope) can only shadow an outer scope's `let` if there is a function boundary in between.

## Function Name Scope

As you've seen by now, a `function` declaration looks like this:

```js
function askQuestion() {
    // ..
}
```

And as discussed in Chapters 1 and 2, such a `function` declaration will create an identifier in the enclosing scope (in this case, the global scope) named `askQuestion`.

What about this program?

```js
var askQuestion = function(){
    // ..
};
```

The same is true for the variable `askQuestion` being created. But since it's a `function` expression—a function definition used as value instead of a standalone declaration—the function itself will not "hoist" (see Chapter 5).

One major difference between `function` declarations and `function` expressions is what happens to the name identifier of the function. Consider a named `function` expression:

```js
var askQuestion = function ofTheTeacher(){
    // ..
};
```

We know `askQuestion` ends up in the outer scope. But what about the `ofTheTeacher` identifier? For formal `function` declarations, the name identifier ends up in the outer/enclosing scope, so it may be reasonable to assume that's the case here. But `ofTheTeacher` is declared as an identifier **inside the function itself**:

```js
var askQuestion = function ofTheTeacher() {
    console.log(ofTheTeacher);
};

askQuestion();
// function ofTheTeacher()...

console.log(ofTheTeacher);
// ReferenceError: ofTheTeacher is not defined
```

| NOTE: |
| :--- |
| Actually, `ofTheTeacher` is not exactly *in the scope of the function*. Appendix A, "Implied Scopes" will explain further. |

Not only is `ofTheTeacher` declared inside the function rather than outside, but it's also defined as read-only:

```js
var askQuestion = function ofTheTeacher() {
    "use strict";
    ofTheTeacher = 42;   // TypeError

    //..
};

askQuestion();
// TypeError
```

Because we used strict-mode, the assignment failure is reported as a `TypeError`; in non-strict-mode, such an assignment fails silently with no exception.

What about when a `function` expression has no name identifier?

```js
var askQuestion = function(){
   // ..
};
```

A `function` expression with a name identifier is referred to as a "named function expression," but one without a name identifier is referred to as an "anonymous function expression." Anonymous function expressions clearly have no name identifier that affects either scope.

| NOTE: |
| :--- |
| We'll discuss named vs. anonymous `function` expressions in much more detail, including what factors affect the decision to use one or the other, in Appendix A. |

## Arrow Functions

ES6 added an additional `function` expression form to the language, called "arrow functions":

```js
var askQuestion = () => {
    // ..
};
```

The `=>` arrow function doesn't require the word `function` to define it. Also, the `( .. )` around the parameter list is optional in some simple cases. Likewise, the `{ .. }` around the function body is optional in some cases. And when the `{ .. }` are omitted, a return value is sent out without using a `return` keyword.

| NOTE: |
| :--- |
| The attractiveness of `=>` arrow functions is often sold as "shorter syntax," and that's claimed to equate to objectively more readable code. This claim is dubious at best, and I believe outright misguided. We'll dig into the "readability" of various function forms in Appendix A. |

Arrow functions are lexically anonymous, meaning they have no directly related identifier that references the function. The assignment to `askQuestion` creates an inferred name of "askQuestion", but that's **not the same thing as being non-anonymous**:

```js
var askQuestion = () => {
    // ..
};

askQuestion.name;   // askQuestion
```

Arrow functions achieve their syntactic brevity at the expense of having to mentally juggle a bunch of variations for different forms/conditions. Just a few, for example:

```js
() => 42;

id => id.toUpperCase();

(id,name) => ({ id, name });

(...args) => {
    return args[args.length - 1];
};
```

The real reason I bring up arrow functions is because of the common but incorrect claim that arrow functions somehow behave differently with respect to lexical scope from standard `function` functions.

This is incorrect.

Other than being anonymous (and having no declarative form), `=>` arrow functions have the same lexical scope rules as `function` functions do. An arrow function, with or without `{ .. }` around its body, still creates a separate, inner nested bucket of scope. Variable declarations inside this nested scope bucket behave the same as in a `function` scope.

## Backing Out

When a function (declaration or expression) is defined, a new scope is created. The positioning of scopes nested inside one another creates a natural scope hierarchy throughout the program, called the scope chain. The scope chain controls variable access, directionally oriented upward and outward.

Each new scope offers a clean slate, a space to hold its own set of variables. When a variable name is repeated at different levels of the scope chain, shadowing occurs, which prevents access to the outer variable from that point inward.

As we step back out from these finer details, the next chapter shifts focus to the primary scope all JS programs include: the global scope.
