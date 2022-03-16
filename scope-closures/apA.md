# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# 부록 A: 더 살펴보기

우리는 이제 이 책의 본문에서 다룬 많은 주제를 중심으로 여러 뉘앙스와 가장자리를 탐구할 것이다. 이 부록은 선택사항이고 참고자료이다.

어떤 사람들은 미묘한 구석 사례를 너무 깊이 들어간다는 것을 알아챈다. 다양한 의견은 소음과 산만함을 야기할 뿐이다. 개발자는 일반적으로 행해지는 길을 고수하면서 더 큰 이득을 얻는다. 나의 접근방식은 비실용적이고 비생산적이라는 비판을 받아왔다. 그것을 공유하지는 않더라도 그런 관점을 이해하고 감사하게 생각한다.

단지 추측과 호기심 부족으로 세부사항을 얼버무리는 것보다 일이 어떻게 돌아가는지에 대한 지식에 의해 힘을 얻는 것이 더 낫다고 믿는다. 궁극적으로 당신은 당신이 탐험하지 않은 조각에서 무언가가 거품을 내는 상황에 직면하게 될 것 이다. 다시 말해서 여러분은 모든 시간을 부드러운 *행복한 길*을 가는데 쓸 수 없을 것이다. 거친 길의 피할 수 없는 돌발에 대비하는 것이 낫지 않을까?

이러한 논의도 본문보다 나의 의견에 더 강하게 영향을 받을 것이다. 그러므로 이를 염두에 두고 내용을 고민해야 한다. 이 부록은 다양한 책 주제를 바탕으로 한 미니 블로그 글 모음집이다. 길고 깊은 잡초이기 때문에 천천히 하고 서두르지 마라.

## 암묵적 스코프<sub>scopes</sub>

스코프는 때때로 분명하지 않은 장소에 만들어진다. 실제로 이러한 암묵적 스코프는 프로그램 동작에 자주 영향을 미치지는 않지만, 실제로 발생한다는 것을 아는 것은 아주 도움이 된다. 깜짝 놀랄만한 스코프를 아래에서 살펴보자.

* 와 일치시키면, <sub>parameter</sub> 스코프
* 함수 이름 스코프

### 와 일치시키면,  스코프

2장에서의 대화 비유<sub>metaphor</sub>는 함수 와 일치시키면, 가 기본적으로 함수 스코프에 지역적으로 선언된 변수와 같다는 것을 암시한다. 하지만 항상 그렇지는 않다.

아래를 보자.

```js
// 외부/전역 스코프: 빨강(1)

function getStudentName(studentID) {
    // 함수 스코프: 파랑(2)

    // ..
}
```

여기서 `studentID`는 "단순" 와 일치시키면, 로 보인다. 그래서 그것은 파랑(2) 함수 스코프의 멤버로 행동한다. 그러나 만약 우리가 그것을 단순하지 않은 매개변수로 바꾼다면 엄밀히 더 이상 그렇지 않다. 단순하지 않은 매개변수 형식은 기본값이 있는 매개변수, (`...`를 사용하는) 나머지 매개변수<sub>rest parameters</sub> 그리고 구조 분해 할당된<sub>destructured</sub> 매개변수가 있다.

아래를 보자.

```js
// 외부/전역 스코프: 빨강(1)

function getStudentName(/*파랑(2)*/ studentID = 0) {
    // 함수 스코프: 초록(3)

    // ..
}
```

여기서 매개변수 목록은 본질적으로 자체 스코프가 되며 함수의 스코프는 *그* 스코프안으로 중첩된다.

왜? 어떤 차이가 그렇게 만들지? 단순하지 않은 매개변수 형식은 다양한 코너 케이스<sub>corner cases</sub>가 있기 때문에 매개변수 목록은 자체 스코프가 되어 그것들을 더 효과적으로 처리할 수 있다.

아래를 보자.

```js
function getStudentName(studentID = maxID, maxID) {
    // ..
}
```

왼쪽에서 오른쪽으로 수행되는 연산을 가정하면 `studentID` 매개변수의 기본값 `= maxID`는 `maxID`가 이미 존재하길(그리고 초기화도 된) 기대한다. 이 코드는 TDZ 에러(5장)를 발생시킨다. `maxID`가 매개변수 스코프에 선언되었지만 매개변수 순서상 아직 초기화되지 않았기 때문이다. 만약 매개변수 순서가 바뀐다면 TDZ 에러는 발생하지 않는다.

```js
function getStudentName(maxID,studentID = maxID) {
    // ..
}
```

기본 매개변수 자리에 함수 표현식을 도입하면 복잡성은 *어려운 환경속에서* 더욱 커진다. 그러면 암묵적 매개변수 스코프 범위에서 매개변수에 대한 자체 클로저(7장)을 생성할 수 있다.

```js
function whatsTheDealHere(id,defaultID = () => id) {
    id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 5
```

`defaultID()` 화살표 함수는 `id` 매개변수/변수를 클로즈 오버<sub>closes over</sub>하고, `5`로 재할당하기 때문에 이 코드는 말이 된다. 하지만 지금은 함수 스코프에서 `id`를 가리는 정의를 넣어보자.

```js
function whatsTheDealHere(id,defaultID = () => id) {
    var id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 3
```

워우! `var id = 5`는 `id` 매개변수를 가리고 있다. 그러나 `defaultID()` 함수의 클로저는 함수 본체의 가리고 있는 변수가 아닌 매개변수를 가진다. 이건 매개변수 목록을 둘러싼 스코프 버블이 있다는 것을 증명한다.

하지만 그것보다 더 미친짓을 보도록 하자!

```js
function whatsTheDealHere(id,defaultID = () => id) {
    var id;

    console.log(`local variable 'id': ${ id }`);
    console.log(
        `parameter 'id' (closure): ${ defaultID() }`
    );

    console.log("reassigning 'id' to 5");
    id = 5;

    console.log(`local variable 'id': ${ id }`);
    console.log(
        `parameter 'id' (closure): ${ defaultID() }`
    );
}

whatsTheDealHere(3);
// local variable 'id': 3   <--- Huh!? Weird!
// parameter 'id' (closure): 3
// reassigning 'id' to 5
// local variable 'id': 5
// parameter 'id' (closure): 3
```

여기서 이상한 점은 첫번째 콘솔 메세지이다. 이 순간에 가리고 있는 `id` 지역 변수는 그냥 선언된 `var id`이다. 5장의 논점은 보통 스코프의 상단에서 `undefined`로 자동 초기화된다는 것이다. 왜 `undefined`를 출력하지 않는가?

이런 특정한 코너 케이스에서(오래된 호환성을 이유로), JS는 `id`를 `undefined`로 자동 초기화하지 않지만 `id` 매개변수의 값(`3`)으로 대신한다.

이 순간에 2개의 `id`가 하나의 변수처럼 보일지라도, 실제로는 아직 분리(그리고 분리된 스코프로)되고 있다. `id = 5` 할당은 관찰할 수 있는 분기를 만드는데, `id` 매개변수는 `3`으로 유지하고 지역 변수는 `5`가 된다.

이런 이상한 뉘앙스에 물리는 걸 피하기 위한 내 충고는 아래와 같다.

* 지역 변수를 가진 매개변수를 가리지말라.

* 매개변수가 어떤 것이라도 클로즈 오버하는 기본 매개변수 함수를 사용하는 것을 피하라.

적어도 지금은 매개변수 목록이 매개변수가 어떤 것이라도 단순하지 않다면 자체 스코프라는 사실에 대해 깨닫고 조심할 수 있다.

### 함수 이름 스코프

3장의 "함수 이름 스코프" 섹션에서는 함수 표현식의 이름은 함수 자체 스코프에 추가된다고 주장했다. 상기해보자.

```js
var askQuestion = function ofTheTeacher(){
    // ..
};
```

`ofTheTeacher`는 둘러싸인 스코프(`askQuestion`이 선언된 곳)에 추가되지 않는다는 사실이다. 하지만 짐작할 수 있는 방식으로 함수의 스코프에 *그냥* 추가되는 것도 아니다. 암묵적 스코프의 또다른 이상한 코너 케이스이다.

함수 표현식의 이름 식별자는 둘러싸인 스코프와 안쪽의 함수 스코프 사이에 중첩된 자신의 암묵적 스코프 안에 있다.

만약 `ofTheTeacher`가 함수의 스코프안에 있었다면 아래와 같은 에러가 예상된다.

```js
var askQuestion = function ofTheTeacher(){
    // 왜 중복 선언 에러가 아니지?
    let ofTheTeacher = "Confused, yet?";
};
```

`let` 선언 형식은 재선언을 허락하지 않는다(5장 참고). 하지만 이건 완전히 유효한 가리기이고, 재선언이 아니다. 2개의 `ofTheTeacher` 식별자는 분리된 스코프에 있기 때문이다.

함수의 이름 식별자 스코프가 문제되는 경우는 거의 없을 것이다. 하지만 다시, 이런 메커니즘이 어떻게 동작하는지 아는 것은 좋다. 물리는 것을 피하기 위해서는 함수 이름 식별자를 가리지 말아라.

## Anonymous vs. Named Functions

As discussed in Chapter 3, functions can be expressed either in named or anonymous form. It's vastly more common to use the anonymous form, but is that a good idea?

As you contemplate naming your functions, consider:

* Name inference is incomplete
* Lexical names allow self-reference
* Names are useful descriptions
* Arrow functions have no lexical names
* IIFEs also need names

### Explicit or Inferred Names?

Every function in your program has a purpose. If it doesn't have a purpose, take it out, because you're just wasting space. If it *does* have a purpose, there *is* a name for that purpose.

So far many readers likely agree with me. But does that mean we should always put that name into the code? Here's where I'll raise more than a few eyebrows. I say, unequivocally, yes!

First of all, "anonymous" showing up in stack traces is just not all that helpful to debugging:

```js
btn.addEventListener("click",function(){
    setTimeout(function(){
        ["a",42].map(function(v){
            console.log(v.toUpperCase());
        });
    },100);
});
// Uncaught TypeError: v.toUpperCase is not a function
//     at myProgram.js:4
//     at Array.map (<anonymous>)
//     at myProgram.js:3
```

Ugh. Compare to what is reported if I give the functions names:

```js
btn.addEventListener("click",function onClick(){
    setTimeout(function waitAMoment(){
        ["a",42].map(function allUpper(v){
            console.log(v.toUpperCase());
        });
    },100);
});
// Uncaught TypeError: v.toUpperCase is not a function
//     at allUpper (myProgram.js:4)
//     at Array.map (<anonymous>)
//     at waitAMoment (myProgram.js:3)
```

See how `waitAMoment` and `allUpper` names appear and give the stack trace more useful information/context for debugging? The program is more debuggable if we use reasonable names for all our functions.

| NOTE: |
| :--- |
| The unfortunate "&lt;anonymous>" that still shows up refers to the fact that the implementation of `Array.map(..)` isn't present in our program, but is built into the JS engine. It's not from any confusion our program introduces with readability shortcuts. |

By the way, let's make sure we're on the same page about what a named function is:

```js
function thisIsNamed() {
    // ..
}

ajax("some.url",function thisIsAlsoNamed(){
   // ..
});

var notNamed = function(){
    // ..
};

makeRequest({
    data: 42,
    cb /* also not a name */: function(){
        // ..
    }
});

var stillNotNamed = function butThisIs(){
    // ..
};
```

"But wait!", you say. Some of those *are* named, right!?

```js
var notNamed = function(){
    // ..
};

var config = {
    cb: function(){
        // ..
    }
};

notNamed.name;
// notNamed

config.cb.name;
// cb
```

These are referred to as *inferred* names. Inferred names are fine, but they don't really address the full concern I'm discussing.

### Missing Names?

Yes, these inferred names might show up in stack traces, which is definitely better than "anonymous" showing up. But...

```js
function ajax(url,cb) {
    console.log(cb.name);
}

ajax("some.url",function(){
    // ..
});
// ""
```

Oops. Anonymous `function` expressions passed as callbacks are incapable of receiving an inferred name, so `cb.name` holds just the empty string `""`. The vast majority of all `function` expressions, especially anonymous ones, are used as callback arguments; none of these get a name. So relying on name inference is incomplete, at best.

And it's not just callbacks that fall short with inference:

```js
var config = {};

config.cb = function(){
    // ..
};

config.cb.name;
// ""

var [ noName ] = [ function(){} ];
noName.name
// ""
```

Any assignment of a `function` expression that's not a *simple assignment* will also fail name inferencing. So, in other words, unless you're careful and intentional about it, essentially almost all anonymous `function` expressions in your program will in fact have no name at all.

Name inference is just... not enough.

And even if a `function` expression *does* get an inferred name, that still doesn't count as being a full named function.

### Who am I?

Without a lexical name identifier, the function has no internal way to refer to itself. Self-reference is important for things like recursion and event handling:

```js
// broken
runOperation(function(num){
    if (num <= 1) return 1;
    return num * oopsNoNameToCall(num - 1);
});

// also broken
btn.addEventListener("click",function(){
   console.log("should only respond to one click!");
   btn.removeEventListener("click",oopsNoNameHere);
});
```

Leaving off the lexical name from your callback makes it harder to reliably self-reference the function. You *could* declare a variable in an enclosing scope that references the function, but this variable is *controlled* by that enclosing scope—it could be re-assigned, etc.—so it's not as reliable as the function having its own internal self-reference.

### Names are Descriptors

Lastly, and I think most importantly of all, leaving off a name from a function makes it harder for the reader to tell what the function's purpose is, at a quick glance. They have to read more of the code, including the code inside the function, and the surrounding code outside the function, to figure it out.

Consider:

```js
[ 1, 2, 3, 4, 5 ].filter(function(v){
    return v % 2 == 1;
});
// [ 1, 3, 5 ]

[ 1, 2, 3, 4, 5 ].filter(function keepOnlyOdds(v){
    return v % 2 == 1;
});
// [ 1, 3, 5 ]
```

There's just no reasonable argument to be made that **omitting** the name `keepOnlyOdds` from the first callback more effectively communicates to the reader the purpose of this callback. You saved 13 characters, but lost important readability information. The name `keepOnlyOdds` very clearly tells the reader, at a quick first glance, what's happening.

The JS engine doesn't care about the name. But human readers of your code absolutely do.

Can the reader look at `v % 2 == 1` and figure out what it's doing? Sure. But they have to infer the purpose (and name) by mentally executing the code. Even a brief pause to do so slows down reading of the code. A good descriptive name makes this process almost effortless and instant.

Think of it this way: how many times does the author of this code need to figure out the purpose of a function before adding the name to the code? About once. Maybe two or three times if they need to adjust the name. But how many times will readers of this code have to figure out the name/purpose? Every single time this line is ever read. Hundreds of times? Thousands? More?

No matter the length or complexity of the function, my assertion is, the author should figure out a good descriptive name and add it to the code. Even the one-liner functions in `map(..)` and `then(..)` statements should be named:

```js
lookupTheRecords(someData)
.then(function extractSalesRecords(resp){
   return resp.allSales;
})
.then(storeRecords);
```

The name `extractSalesRecords` tells the reader the purpose of this `then(..)` handler *better* than just inferring that purpose from mentally executing `return resp.allSales`.

The only excuse for not including a name on a function is either laziness (don't want to type a few extra characters) or uncreativity (can't come up with a good name). If you can't figure out a good name, you likely don't understand the function and its purpose yet. The function is perhaps poorly designed, or it does too many things, and should be re-worked. Once you have a well-designed, single-purpose function, its proper name should become evident.

Here's a trick I use: while first writing a function, if I don't fully understand its purpose and can't think of a good name to use, I just use `TODO` as the name. That way, later when reviewing my code, I'm likely to find those name placeholders, and I'm more inclined (and more prepared!) to go back and figure out a better name, rather than just leave it as `TODO`.

All functions need names. Every single one. No exceptions. Any name you omit is making the program harder to read, harder to debug, harder to extend and maintain later.

### Arrow Functions

Arrow functions are **always** anonymous, even if (rarely) they're used in a way that gives them an inferred name. I just spent several pages explaining why anonymous functions are a bad idea, so you can probably guess what I think about arrow functions.

Don't use them as a general replacement for regular functions. They're more concise, yes, but that brevity comes at the cost of omitting key visual delimiters that help our brains quickly parse out what we're reading. And, to the point of this discussion, they're anonymous, which makes them worse for readability from that angle as well.

Arrow functions have a purpose, but that purpose is not to save keystrokes. Arrow functions have *lexical this* behavior, which is somewhat beyond the bounds of our discussion in this book.

Briefly: arrow functions don't define a `this` identifier keyword at all. If you use a `this` inside an arrow function, it behaves exactly as any other variable reference, which is that the scope chain is consulted to find a function scope (non-arrow function) where it *is* defined, and to use that one.

In other words, arrow functions treat `this` like any other lexical variable.

If you're used to hacks like `var self = this`, or if you prefer to call `.bind(this)` on inner `function` expressions, just to force them to inherit a `this` from an outer function like it was a lexical variable, then `=>` arrow functions are absolutely the better option. They're designed specifically to fix that problem.

So, in the rare cases you need *lexical this*, use an arrow function. It's the best tool for that job. But just be aware that in doing so, you're accepting the downsides of an anonymous function. You should expend additional effort to mitigate the readability *cost*, such as more descriptive variable names and code comments.

### IIFE Variations

All functions should have names. I said that a few times, right!? That includes IIFEs.

```js
(function(){
    // don't do this!
})();

(function doThisInstead(){
    // ..
})();
```

How do we come up with a name for an IIFE? Identify what the IIFE is there for. Why do you need a scope in that spot? Are you hiding a cache variable for student records?

```js
var getStudents = (function StoreStudentRecords(){
    var studentRecords = [];

    return function getStudents() {
        // ..
    }
})();
```

I named the IIFE `StoreStudentRecords` because that's what it's doing: storing student records. Every IIFE should have a name. No exceptions.

IIFEs are typically defined by placing `( .. )` around the `function` expression, as shown in those previous snippets. But that's not the only way to define an IIFE. Technically, the only reason we're using that first surrounding set of `( .. )` is just so the `function` keyword isn't in a position to qualify as a `function` declaration to the JS parser. But there are other syntactic ways to avoid being parsed as a declaration:

```js
!function thisIsAnIIFE(){
    // ..
}();

+function soIsThisOne(){
    // ..
}();

~function andThisOneToo(){
    // ..
}();
```

The `!`, `+`, `~`, and several other unary operators (operators with one operand) can all be placed in front of `function` to turn it into an expression. Then the final `()` call is valid, which makes it an IIFE.

I actually kind of like using the `void` unary operator when defining a standalone IIFE:

```js
void function yepItsAnIIFE() {
    // ..
}();
```

The benefit of `void` is, it clearly communicates at the beginning of the function that this IIFE won't be returning any value.

However you define your IIFEs, show them some love by giving them names.

## Hoisting: Functions and Variables

Chapter 5 articulated both *function hoisting* and *variable hoisting*. Since hoisting is often cited as mistake in the design of JS, I wanted to briefly explore why both these forms of hoisting *can* be beneficial and should still be considered.

Give hoisting a deeper level of consideration by considering the merits of:

* Executable code first, function declarations last
* Semantic placement of variable declarations

### Function Hoisting

To review, this program works because of *function hoisting*:

```js
getStudents();

// ..

function getStudents() {
    // ..
}
```

The `function` declaration is hoisted during compilation, which means that `getStudents` is an identifier declared for the entire scope. Additionally, the `getStudents` identifier is auto-initialized with the function reference, again at the beginning of the scope.

Why is this useful? The reason I prefer to take advantage of *function hoisting* is that it puts the *executable* code in any scope at the top, and any further declarations (functions) below. This means it's easier to find the code that will run in any given area, rather than having to scroll and scroll, hoping to find a trailing `}` marking the end of a scope/function somewhere.

I take advantage of this inverse positioning in all levels of scope:

```js
getStudents();

// *************

function getStudents() {
    var whatever = doSomething();

    // other stuff

    return whatever;

    // *************

    function doSomething() {
        // ..
    }
}
```

When I first open a file like that, the very first line is executable code that kicks off its behavior. That's very easy to spot! Then, if I ever need to go find and inspect `getStudents()`, I like that its first line is also executable code. Only if I need to see the details of `doSomething()` do I go and find its definition down below.

In other words, I think *function hoisting* makes code more readable through a flowing, progressive reading order, from top to bottom.

### Variable Hoisting

What about *variable hoisting*?

Even though `let` and `const` hoist, you cannot use those variables in their TDZ (see Chapter 5). So, the following discussion only applies to `var` declarations. Before I continue, I'll admit: in almost all cases, I completely agree that *variable hoisting* is a bad idea:

```js
pleaseDontDoThis = "bad idea";

// much later
var pleaseDontDoThis;
```

While that kind of inverted ordering was helpful for *function hoisting*, here I think it usually makes code harder to reason about.

But there's one exception that I've found, somewhat rarely, in my own coding. It has to do with where I place my `var` declarations inside a CommonJS module definition.

Here's how I typically structure my module definitions in Node:

```js
// dependencies
var aModuleINeed = require("very-helpful");
var anotherModule = require("kinda-helpful");

// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    // ..
});

// ********************************
// private implementation

var cache = { };
var otherData = [ ];

function getStudents() {
    // ..
}

function addStudents() {
    // ..
}
```

Notice how the `cache` and `otherData` variables are in the "private" section of the module layout? That's because I don't plan to expose them publicly. So I organize the module so they're located alongside the other hidden implementation details of the module.

But I've had a few rare cases where I needed the assignments of those values to happen *above*, before I declare the exported public API of the module. For instance:

```js
// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    refreshData: refreshData.bind(null,cache)
});
```

I need the `cache` variable to have already been assigned a value, because that value is used in the initialization of the public API (the `.bind(..)` partial-application).

Should I just move the `var cache = { .. }` up to the top, above this public API initialization? Well, perhaps. But now it's less obvious that `var cache` is a *private* implementation detail. Here's the compromise I've (somewhat rarely) used:

```js
cache = {};   // used here, but declared below

// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    refreshData: refreshData.bind(null,cache)
});

// ********************************
// private implementation

var cache /* = {}*/;
```

See the *variable hoisting*? I've declared the `cache` down where it belongs, logically, but in this rare case I've used it earlier up above, in the area where its initialization is needed. I even left a hint at the value that's assigned to `cache` in a code comment.

That's literally the only case I've ever found for leveraging *variable hoisting* to assign a variable earlier in a scope than its declaration. But I think it's a reasonable exception to employ with caution.

## The Case for `var`

Speaking of *variable hoisting*, let's have some real talk for a bit about `var`, a favorite villain devs love to blame for many of the woes of JS development. In Chapter 5, we explored `let`/`const` and promised we'd revisit where `var` falls in the whole mix.

As I lay out the case, don't miss:

* `var` was never broken
* `let` is your friend
* `const` has limited utility
* The best of both worlds: `var` *and* `let`

### Don't Throw Out `var`

`var` is fine, and works just fine. It's been around for 25 years, and it'll be around and useful and functional for another 25 years or more. Claims that `var` is broken, deprecated, outdated, dangerous, or ill-designed are bogus bandwagoning.

Does that mean `var` is the right declarator for every single declaration in your program? Certainly not. But it still has its place in your programs. Refusing to use it because someone on the team chose an aggressive linter opinion that chokes on `var` is cutting off your nose to spite your face.

OK, now that I've got you really riled up, let me try to explain my position.

For the record, I'm a fan of `let`, for block-scoped declarations. I really dislike TDZ and I think that was a mistake. But `let` itself is great. I use it often. In fact, I probably use it as much or more than I use `var`.

### `const`-antly Confused

`const` on the other hand, I don't use as often. I'm not going to dig into all the reasons why, but it comes down to `const` not *carrying its own weight*. That is, while there's a tiny bit of benefit of `const` in some cases, that benefit is outweighed by the long history of troubles around `const` confusion in a variety of languages, long before it ever showed up in JS.

`const` pretends to create values that can't be mutated—a misconception that's extremely common in developer communities across many languages—whereas what it really does is prevent re-assignment.

```js
const studentIDs = [ 14, 73, 112 ];

// later

studentIDs.push(6);   // whoa, wait... what!?
```

Using a `const` with a mutable value (like an array or object) is asking for a future developer (or reader of your code) to fall into the trap you set, which was that they either didn't know, or sorta forgot, that *value immutability* isn't at all the same thing as *assignment immutability*.

I just don't think we should set those traps. The only time I ever use `const` is when I'm assigning an already-immutable value (like `42` or `"Hello, friends!"`), and when it's clearly a "constant" in the sense of being a named placeholder for a literal value, for semantic purposes. That's what `const` is best used for. That's pretty rare in my code, though.

If variable re-assignment were a big deal, then `const` would be more useful. But variable re-assignment just isn't that big of a deal in terms of causing bugs. There's a long list of things that lead to bugs in programs, but "accidental re-assignment" is way, way down that list.

Combine that with the fact that `const` (and `let`) are supposed to be used in blocks, and blocks are supposed to be short, and you have a really small area of your code where a `const` declaration is even applicable. A `const` on line 1 of your ten-line block only tells you something about the next nine lines. And the thing it tells you is already obvious by glancing down at those nine lines: the variable is never on the left-hand side of an `=`; it's not re-assigned.

That's it, that's all `const` really does. Other than that, it's not very useful. Stacked up against the significant confusion of value vs. assignment immutability, `const` loses a lot of its luster.

A `let` (or `var`!) that's never re-assigned is already behaviorally a "constant", even though it doesn't have the compiler guarantee. That's good enough in most cases.

### `var` *and* `let`

In my mind, `const` is pretty rarely useful, so this is only two-horse race between `let` and `var`. But it's not really a race either, because there doesn't have to be just one winner. They can both win... different races.

The fact is, you should be using both `var` and `let` in your programs. They are not interchangeable: you shouldn't use `var` where a `let` is called for, but you also shouldn't use `let` where a `var` is most appropriate.

So where should we still use `var`? Under what circumstances is it a better choice than `let`?

For one, I always use `var` in the top-level scope of any function, regardless of whether that's at the beginning, middle, or end of the function. I also use `var` in the global scope, though I try to minimize usage of the global scope.

Why use `var` for function scoping? Because that's exactly what `var` does. There literally is no better tool for the job of function scoping a declaration than a declarator that has, for 25 years, done exactly that.

You *could* use `let` in this top-level scope, but it's not the best tool for that job. I also find that if you use `let` everywhere, then it's less obvious which declarations are designed to be localized and which ones are intended to be used throughout the function.

By contrast, I rarely use a `var` inside a block. That's what `let` is for. Use the best tool for the job. If you see a `let`, it tells you that you're dealing with a localized declaration. If you see `var`, it tells you that you're dealing with a function-wide declaration. Simple as that.

```js
function getStudents(data) {
    var studentRecords = [];

    for (let record of data.records) {
        let id = `student-${ record.id }`;
        studentRecords.push({
            id,
            record.name
        });
    }

    return studentRecords;
}
```

The `studentRecords` variable is intended for use across the whole function. `var` is the best declarator to tell the reader that. By contrast, `record` and `id` are intended for use only in the narrower scope of the loop iteration, so `let` is the best tool for that job.

In addition to this *best tool* semantic argument, `var` has a few other characteristics that, in certain limited circumstances, make it more powerful.

One example is when a loop is exclusively using a variable, but its conditional clause cannot see block-scoped declarations inside the iteration:

```js
function commitAction() {
    do {
        let result = commit();
        var done = result && result.code == 1;
    } while (!done);
}
```

Here, `result` is clearly only used inside the block, so we use `let`. But `done` is a bit different. It's only useful for the loop, but the `while` clause cannot see `let` declarations that appear inside the loop. So we compromise and use `var`, so that `done` is hoisted to the outer scope where it can be seen.

The alternative—declaring `done` outside the loop—separates it from where it's first used, and either necessitates picking a default value to assign, or worse, leaving it unassigned and thus looking ambiguous to the reader. I think `var` inside the loop is preferable here.

Another helpful characteristic of `var` is seen with declarations inside unintended blocks. Unintended blocks are blocks that are created because the syntax requires a block, but where the intent of the developer is not really to create a localized scope. The best illustration of unintended scope is the `try..catch` statement:

```js
function getStudents() {
    try {
        // not really a block scope
        var records = fromCache("students");
    }
    catch (err) {
        // oops, fall back to a default
        var records = [];
    }
    // ..
}
```

There are other ways to structure this code, yes. But I think this is the *best* way, given various trade-offs.

I don't want to declare `records` (with `var` or `let`) outside of the `try` block, and then assign to it in one or both blocks. I prefer initial declarations to always be as close as possible (ideally, same line) to the first usage of the variable. In this simple example, that would only be a couple of lines distance, but in real code it can grow to many more lines. The bigger the gap, the harder it is to figure out what variable from what scope you're assigning to. `var` used at the actual assignment makes it less ambiguous.

Also notice I used `var` in both the `try` and `catch` blocks. That's because I want to signal to the reader that no matter which path is taken, `records` always gets declared. Technically, that works because `var` is hoisted once to the function scope. But it's still a nice semantic signal to remind the reader what either `var` ensures. If `var` were only used in one of the blocks, and you were only reading the other block, you wouldn't as easily discover where `records` was coming from.

This is, in my opinion, a little superpower of `var`. Not only can it escape the unintentional `try..catch` blocks, but it's allowed to appear multiple times in a function's scope. You can't do that with `let`. It's not bad, it's actually a little helpful feature. Think of `var` more like a declarative annotation that's reminding you, each usage, where the variable comes from. "Ah ha, right, it belongs to the whole function."

This repeated-annotation superpower is useful in other cases:

```js
function getStudents() {
    var data = [];

    // do something with data
    // .. 50 more lines of code ..

    // purely an annotation to remind us
    var data;

    // use data again
    // ..
}
```

The second `var data` is not re-declaring `data`, it's just annotating for the readers' benefit that `data` is a function-wide declaration. That way, the reader doesn't need to scroll up 50+ lines of code to find the initial declaration.

I'm perfectly fine with re-using variables for multiple purposes throughout a function scope. I'm also perfectly fine with having two usages of a variable be separated by quite a few lines of code. In both cases, the ability to safely "re-declare" (annotate) with `var` helps make sure I can tell where my `data` is coming from, no matter where I am in the function.

Again, sadly, `let` cannot do this.

There are other nuances and scenarios when `var` turns out to offer some assistance, but I'm not going to belabor the point any further. The takeaway is that `var` can be useful in our programs alongside `let` (and the occasional `const`). Are you willing to creatively use the tools the JS language provides to tell a richer story to your readers?

Don't just throw away a useful tool like `var` because someone shamed you into thinking it wasn't cool anymore. Don't avoid `var` because you got confused once years ago. Learn these tools and use them each for what they're best at.

## What's the Deal with TDZ?

The TDZ (temporal dead zone) was explained in Chapter 5. We illustrated how it occurs, but we skimmed over any explanation of *why* it was necessary to introduce in the first place. Let's look briefly at the motivations of TDZ.

Some breadcrumbs in the TDZ origin story:

* `const`s should never change
* It's all about time
* Should `let` behave more like `const` or `var`?

### Where It All Started

TDZ comes from `const`, actually.

During early ES6 development work, TC39 had to decide whether `const` (and `let`) were going to hoist to the top of their blocks. They decided these declarations would hoist, similar to how `var` does. Had that not been the case, I think some of the fear was confusion with mid-scope shadowing, such as:

```js
let greeting = "Hi!";

{
    // what should print here?
    console.log(greeting);

    // .. a bunch of lines of code ..

    // now shadowing the `greeting` variable
    let greeting = "Hello, friends!";

    // ..
}
```

What should we do with that `console.log(..)` statement? Would it make any sense to JS devs for it to print "Hi!"? Seems like that could be a gotcha, to have shadowing kick in only for the second half of the block, but not the first half. That's not very intuitive, JS-like behavior. So `let` and `const` have to hoist to the top of the block, visible throughout.

But if `let` and `const` hoist to the top of the block (like `var` hoists to the top of a function), why don't `let` and `const` auto-initialize (to `undefined`) the way `var` does? Here was the main concern:

```js
{
    // what should print here?
    console.log(studentName);

    // later

    const studentName = "Frank";

    // ..
}
```

Let's imagine that `studentName` not only hoisted to the top of this block, but was also auto-initialized to `undefined`. For the first half of the block, `studentName` could be observed to have the `undefined` value, such as with our `console.log(..)` statement. Once the `const studentName = ..` statement is reached, now `studentName` is assigned `"Frank"`. From that point forward, `studentName` can't ever be re-assigned.

But, is it strange or surprising that a constant observably has two different values, first `undefined`, then `"Frank"`? That does seem to go against what we think a `const`ant means; it should only ever be observable with one value.

So... now we have a problem. We can't auto-initialize `studentName` to `undefined` (or any other value for that matter). But the variable has to exist throughout the whole scope. What do we do with the period of time from when it first exists (beginning of scope) and when it's assigned its value?

We call this period of time the "dead zone," as in the "temporal dead zone" (TDZ). To prevent confusion, it was determined that any sort of access of a variable while in its TDZ is illegal and must result in the TDZ error.

OK, that line of reasoning does make some sense, I must admit.

### Who `let` the TDZ Out?

But that's just `const`. What about `let`?

Well, TC39 made the decision: since we need a TDZ for `const`, we might as well have a TDZ for `let` as well. *In fact, if we make let have a TDZ, then we discourage all that ugly variable hoisting people do.* So there was a consistency perspective and, perhaps, a bit of social engineering to shift developers' behavior.

My counter-argument would be: if you're favoring consistency, be consistent with `var` instead of `const`; `let` is definitely more like `var` than `const`. That's especially true since they had already chosen consistency with `var` for the whole hoisting-to-the-top-of-the-scope thing. Let `const` be its own unique deal with a TDZ, and let the answer to TDZ purely be: just avoid the TDZ by always declaring your constants at the top of the scope. I think this would have been more reasonable.

But alas, that's not how it landed. `let` has a TDZ because `const` needs a TDZ, because `let` and `const` mimic `var` in their hoisting to the top of the (block) scope. There ya go. Too circular? Read it again a few times.

## 동기식 콜백은 여전히 클로저일까?

7장에서 클로저를 해결하기 위해 2가지 다른 모델을 제시했다.

* 클로저는 함수가 전달되어 바깥 스코프에서 **호출해도** 외부 변수를 기억하는 함수 인스턴스다.

* 클로저는 함수 인스턴스와 해당 스코프 환경이 제자리에 유지되는 동안 이에 대한 참조가 전달되고 다른 스코프에서 **호출**된다.

이러한 모델들은 매우 다양하지는 않지만 다른 관점에서 접근한다. 그리고 이 다른 관점들은 우리가 클로저를 식별하는 것을 바꾼다.

클로저와 콜백에 대한 여담을 잘 따라와보길 바란다.

* 무엇을(또는 어디에서) 다시 호출할까?
* "동기식 콜백"이 최고의 명명이 아닐 수도 있다.
* ***IIF*** 함수는 이동하지 않는다. 왜 클로저가 필요한가?
* 시간이 지남에 따라 지연시키는 것이 클로저의 열쇠다.

### 콜백이란 무엇인가?

클로저를 다시 살펴보기 전에 "콜백"이라는 단어에 대해 잠시 살펴보자. "콜백"이 *비동기 콜백* 및 *동기 콜백*과 동의어라는 것은 일반적으로 받아들여지는 규범이다. 나는 이것이 좋은 생각은 아닌 것 같다. 그래서 그 이유를 설명하고 다른 용어로 바꿀 것을 제안한다.

먼저 *나중* 시점에 호출될 함수 참조인 *비동기 콜백*을 살펴보자. 이 경우 "콜백"은 무엇을 의미할까?

이는 현재 코드가 완료되었거나 일시 중지되었으며 자체적으로 일시 중단되었고 해당 함수가 나중에 호출될 때 실행이 일시 중단된 프로그램으로 돌아가 다시 시작한다는 것을 의미한다. 구체적으로 재진입 지점은 함수 참조에 래핑된 코드다.

```js
setTimeout(function waitForASecond(){
    // 타이머가 경과했을 때
    // js가 프로그램을 다시 호출해야하는 곳
},1000);

// 현재 프로그램이 종료되는 곳
// 혹은 정지되는 곳
```

이러한 맥락에서 "콜백"은 많은 의미가 있다. JS 엔진은 특정 위치에서 *호출*하여 일시 중단된 프로그램을 다시 시작한다. 그렇다. 콜백은 비동기식이다.

### 동기식 콜백이란?

하지만 *동기식 콜백*은 어떨까? 다음 코드를 살펴보자:

```js
function getLabels(studentIDs) {
    return studentIDs.map(
        function formatIDLabel(id){
            return `Student ID: ${
               String(id).padStart(6)
            }`;
        }
    );
}

getLabels([ 14, 73, 112, 6 ]);
// [
//    "Student ID: 000014",
//    "Student ID: 000073",
//    "Student ID: 000112",
//    "Student ID: 000006"
// ]
```

콜백으로 `formatIDLabel(..)`을 참조해야 할까? `map(..)` 유틸리티가 실제로 우리가 제공한 함수를 호출하여 우리 프로그램으로 *콜백*할까?

프로그램이 일시 중지되거나 종료되지 않았기 때문에 그 자체로 *다시 돌아가 호출*할 것이 없다. 프로그램의 한 부분에서 프로그램의 다른 부분으로 함수(참조)를 전달하면 즉시 호출된다.

우리가 하고있는 일과 일치하는 다른 정해진 용어가 있다. 프로그램의 다른 부분이 우리를 대신하여 호출할 수 있도록 함수(참조)를 전달하는 것, 이것은 *의존성 주입<sub>Dependency Injection</sub>*(DI) 또는 *제어 역전<sub>Inversion of Control</sub>*(IoC)이라고 생각할 수 있다.

DI는 기능의 필요한 부분을 프로그램의 다른 부분으로 전달하여 작업을 완료하기 위해 호출할 수 있는 것으로 요약할 수 있다. 위의 `map(..)` 호출에 대한 적절한 설명이다. 그렇지 않나? `map(..)` 유틸리티는 목록의 값을 반복하는 것은 알고 있지만 해당 값으로 *무엇을 해야 하는지는* 알지 못한다. 이것이 `formatIDLabel(..)` 함수를 전달하는 이유다. 의존성을 전달한다.

IoC는 매우 유사하고 연관있는 개념이다. 제어 역전이란 무슨 일이 일어나고 있는지 제어하는 프로그램의 현재 영역 대신 프로그램의 다른 부분에 제어를 넘겨주는 것을 의미한다. 함수 `formatIDLabel(..)`에서 레이블 문자열을 계산하기 위한 논리를 래핑한 다음 호출 제어를 `map(..)` 유틸리티에 넘겼다.

특히 Martin Fowler는 프레임워크와 라이브러리의 차이점으로 IoC를 인용한다. 라이브러리에서는 당신이 함수를 호출한다. 프레임워크는 너의 함수를 호출한다. [^fowlerIOC]

논의의 맥락에서 DI 또는 IoC는 *동기식 콜백*에 대한 다른 이름이 될 수 있다.

하지만 다른 제안이 있다. *동기식 콜백*을 *교차 실행 함수<sub>inter-invoked functions</sub>*(IIFs)라고 부르자. 그렇다, 정확히는 IIFE를 이야기하고 있다. 이러한 종류의 함수는 *교차 실행*된다. 즉, 자체적으로 즉시 호출하는 IIFE와 달리 다른 엔티티가 호출한다.

*비동기 콜백*과 교차 실행 함수 사이의 관계는 무엇일까? *비동기 콜백*은 동기 대신 비동기적으로 호출되는 교차 실행 함수다.

### 동기식 클로저란?

이제 *동기식 콜백*에 교차 실행 함수라는 이름을 다시 지정했으므로 주요 질문으로 돌아갈 수 있다. 교차 실행 함수가 클로저의 예인가? 분명히 교차 실행 함수는 클로저가 되려면 외부 스코프의 변수를 참조해야 한다. 이전의 `formatIDLabel(..)` 교차 실행 함수는 자체 스코프 밖의 변수를 참조하지 않으므로 확실히 클로저가 아니다.

외부 참조가 있는 교차 실행 함수는 클로저인가?

```js
function printLabels(labels) {
    var list = document.getElementByID("labelsList");

    labels.forEach(
        function renderLabel(label){
            var li = document.createELement("li");
            li.innerText = label;
            list.appendChild(li);
        }
    );
}
```

내부 `renderLabel(..)` 교차 실행 함수는 둘러싸는 스코프의 `list`를 참조하므로 클로저가 *있을 수 있는* 교차 실행 함수다. 그러나 클로저를 위해 선택한 정의/모델은 다음과 같다.

* `renderLabel(..)`이 **다른 곳에서 전달되는 함수**이고 그 함수가 호출되면, 물론 `renderLabel(..)`는 원래 스코프 체인에 대한 접근을 보존하기 위해 클로저를 실행하고 있는 것이다.

* 그러나 7장의 대안 모델에서와 같이 `renderLabel(..)`이 제자리에 있고 이에 대한 참조만 `forEach(..)`로 전달되면 `renderLabel(..)`의 스코프 체인이 자체 스코프 안에서 동기적으로 실행되는 동안 클로저가 필요할까?

아니다. 이는 그냥 일반적인 렉시컬 스코프다.

이유를 이해하려면 `printLabels(..)`의 대안 형태를 봐보자:

```js
function printLabels(labels) {
    var list = document.getElementByID("labelsList");

    for (let label of labels) {
        // 자체 스코프에서 정상적으로 함수 호출이 되고있다. 맞나?
        // 이는 실제로 클로저가 아니다!
        renderLabel(label);
    }

    // **************

    function renderLabel(label) {
        var li = document.createELement("li");
        li.innerText = label;
        list.appendChild(li);
    }
}
```

이 두 버전의 `printLabels(..)`은 본질적으로 동일하다.

후자는 적어도 유용하거나 관찰 가능한 의미에서 클로저의 예가 아니다. 그것은 단지 렉시컬 스코프다. 함수 참조를 호출하는 `forEach(..)`가 있는 이전 버전은 본질적으로 동일하다. 이 또한 클로저가 아니라 그냥 평범한 렉시컬 스코프 함수 호출이다.

### 클로저로 지연시키기

그건 그렇고, 7장에서 부분 적용<sub>partial application</sub>과 커링<sub>currying</sub>에 대해서 간략하게 언급했다(이것도 클로저에 의존한다!). 이것은 정석적으로 커링이 사용되는 흥미로운 시나리오다.

```js
function printLabels(labels) {
    var list = document.getElementByID("labelsList");
    var renderLabel = renderTo(list);

    // 이번엔 완벽히 클로저다!
    labels.forEach( renderLabel );

    // **************

    function renderTo(list) {
        return function createLabel(label){
            var li = document.createELement("li");
            li.innerText = label;
            list.appendChild(li);
        };
    }
}
```

우리가 `renderLabel`에 할당한 내부 함수 `createLabel(..)`은 `list` 에 대해 클로즈 오버 되어있으므로 클로저는 확실히 활용되고 있다.

클로저는 `renderTo(..)` 호출에서 `createLabel(..)` 교차 실행 함수의 후속 `forEach(..)` 호출로 실제 레이블 생성 논리 실행을 지연시키는 동안 `list`를 나중을 위해 기억할 수 있게 해준다. 여기에서는 짧은 순간일 수 있지만 클로저가 호출에서 호출로 연결되기 때문에 많은 시간이 지나갈 수도 있다.

## 클래식 모듈 변형

8장에서 설명한 클래식 모듈 패턴은 아래와 같다.

```js
var StudentList = (function defineModule(Student){
    var elems = [];

    var publicAPI = {
        renderList() {
            // ..
        }
    };

    return publicAPI;

})(Student);
```

의존성으로서 `Student`(다른 모듈 인스턴스)를 전달하고 있는 것을 주목하라. 그러나 당신이 마주칠만한 이 모듈 형태에는 많은 쓸만한 변형이 있다. 이러한 변형을 알아채기 위한 몇 가지 힌트는 아래와 같다.

* 모듈이 자신의 API를 알고 있는가?
* 복잡한 모듈 로더를 사용하더라도 단지 클래식 모듈일 뿐이다.
* 어떤 모듈은 전체적으로 작동할 필요가 있다.

### 내 API는 어디에?

먼저 대부분의 클래식 모듈은 아래 코드에서 보여지는 방법처럼 `publicAPI`를 정의하지 않고 사용한다. 보통 아래와 같다.

```js
var StudentList = (function defineModule(Student){
    var elems = [];

    return {
        renderList() {
            // ..
        }
    };

})(Student);
```

여기서 유일한 차이점은 모듈을 위한 공개 API로서 제공하는 객체를 직접적으로 반환하고 있다. 내부의 `publicAPI` 변수에 먼저 저장하는 것과 반대이다. 이것이 단연코 대부분의 클래식 모듈이 정의되는 방법이다.

그러나 나는 이전 `publicAPI` 형태를 강하게 선호하고 항상 사용한다. 두 가지 이유가 있다.

* `publicAPI`는 객체의 목적을 명확하게 함으로써 가독성에 초점을 맞춘 의미적인 서술어이다.

* 반환되는 외부의 공개 API 객체를 참조하는 내부의 `publicAPI` 변수를 저장하는 것은, 만약 모듈의 생명주기 동안 API에 접근하거나 수정할 필요가 있다면 유용할 수 있다.

    예를 들어, 모듈 안에서 공개적으로 노출된 함수 중의 하나를 호출 할 수 있다. 또는 특정한 조건에 의존적인 메서드를 추가하거나 삭제하길 원하거나, 노출된 속성의 값을 수정하길 원할 수도 있다.

    무슨 경우이던지 간에, 자신의 API에 접근하기 위한 참조를 유지하지 *않을* 것이라는 것은 다소 바보 같은 생각이다. 그렇지?

### 비동기 모듈 정의 (AMD)

클래식 모듈 형식의 다른 변형은 AMD 스타일 모듈이고(지난 몇 년간 인기있던), RequireJS 유틸리티에 의해 아래처럼 지원되었다.

```js
define([ "./Student" ],function StudentList(Student){
    var elems = [];

    return {
        renderList() {
            // ..
        }
    };
});
```

`StudentList(..)`를 자세히 보면, 클래식 모듈 팩토리 함수이다. (RequireJS가 제공하는) `define(..)` 장치 안에서 실행되고, 의존성으로 선언된 다른 모듈 인스턴스를 전달한다. 반환값은 모듈의 공개 API를 나타내는 객체이다.

이것은 우리가 클래식 모듈로 탐구했던 것과 정확하게 (클로저가 동작하는 방식을 포함하여) 같은 원리에 기반한다.

### 유니버설 모듈 (UMD)

마지막으로 살펴볼 변형은 UMD이다. UMD는 구체적이고, 정확한 형식이 아니라 매우 비슷한 형태의 모음이다. 브라우저, AMD 스타일 로더, Node에서 로드할 수 있는 모듈을 위한 더 나은 (어떤 빌드툴 변환 없이) 상호운용성을 만들기 위해 설계되었다. 나는 개인적으로 여전히 UMD 형식을 사용하여 대부분의 내 유틸리티 라이브러리를 배포한다.

UMD의 일반적인 구조는 아래와 같다.

```js
(function UMD(name,context,definition){
    // AMD 스타일 로더에 의해 로드되었는가?
    if (
        typeof define === "function" &&
        define.amd
    ) {
        define(definition);
    }
    // Node에서?
    else if (
        typeof module !== "undefined" &&
        module.exports
    ) {
        module.exports = definition(name,context);
    }
    // 독립적인 브라우저 스크립트로 가정
    else {
        context[name] = definition(name,context);
    }
})("StudentList",this,function DEF(name,context){

    var elems = [];

    return {
        renderList() {
            // ..
        }
    };

});
```

조금 특이해 보일지라도, UMD는 정말로 IIFE일 뿐이다.

다른 점은 IIFE의 (상단에 있는) 메인 `function` 표현식 부분이 모듈이 로드되는 세 가지 지원 환경을 알아내기 위해 `if..else if` 구문 시리즈를 가지고 있다는 점이 차이점이다.

보통 때는 IIFE를 실행하는 마지막 `()`는 세 가지 인수 `"StudentsList"`, `this`와 다른 `function` 표현식을 전달하게 된다. 이러한 인수를 매개변수와 일치시키면, `name`, `context`와 `definition`을 볼 것이다. `"StudentList"` (`name`)는 모듈을 위한 이름 라벨이다. 주로 전역 변수로 정의된 경우이다. `this` (`context`)는 일반적으로 이름으로 모듈을 정의하기 위한 `window`(전역 객체, 4장 참고)이다.

`definition(..)`은 모듈의 정의를 실제로 조회하기 위해 실행된다. 그러면 충분히 알아차릴 것이다. 클래식 모듈 형식일 뿐이다!

ESM(ES 모듈)이 빠르게 대중화되고 퍼지고 있다는 것은 이 글을 쓰는 현재 의심의 여지가 없다. 그러나 지난 20년 넘게 작성된 수백만개의 모듈이 모두 클래식 모듈의 이전 ESM 변형을 사용하고 있다. 이것들을 접했을 때 읽고 이해할 수 있는 것은 여전히 매우 중요하다.

[^fowlerIOC]: *Inversion of Control*, Martin Fowler, https://martinfowler.com/bliki/InversionOfControl.html, 2005년 6월 26일.
