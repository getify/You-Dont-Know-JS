# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# 챕터 7: 클로저 사용하기

지금까지, 렉시컬 스코프의 내부와 외부가 프로그램의 변수 구성과 사용에 어떤 영향을 미치는지에 초점을 맞추었다.

우리의 관심은 역사적으로 다소 어려운 주제인 클로저로 추상적으로 다시 확대된다. 걱정하지 마라! 이를 이해하기 위해 고급 컴퓨터 공학 학위가 필요하지는 않다. 이 책의 큰 목표는 단지 스코프를 이해하는 것이 아니라, 프로그램의 구조에 스코프를 더 효과적으로 사용하는 것이다; 클로저는 그 노력의 핵심이다.

챕터6의 결론을 상기해라: "*최소 노출* 원리<sub>Least Exposure</sub>"(POLE)는 변수의 스코프 노출을 제한하기 위해서 블록(혹은 함수)스코프 사용을 장려한다.이는 코드를 이해하고 유지보수하기 쉽게 도와주고 스코프 함정(i.e. 네이밍 충돌 등)을 피하는데 도움이 된다.

클로저는 이런 접근 방식을 기반으로 한다: 시간이 지나도 사용해야하는 변수의 경우, 더 큰 외부 스코프에 변수들을 위치시키는 대신, 함수 내부에서의 접근은 보존해서 (더 좁은 스코프로) 더 넓은 사용이 가능하게끔 캡슐화 할 수 있다. 함수들은 클로저를 통해 참조된 변수의 스코프를 *기억한다.*

이미 이전 챕터(챕터6의 `factorial(..)`)에서 이러한 종류의 클로저 예시를 본 적이 있고, 아마 프로그램에서 이미 사용해봤을 것이다. 스코프 외부에서 변수를 접근하는 콜백을 작성해본 경험이 있다면... 이게 뭘까!? 바로 클로저다.

클로저는 프로그래밍에서 발명된 가장 중요한 언어 특성 중 하나다. 클로저는 FP(함수형 프로그래밍<sub>Functional Programming</sub>), 모듈 및 클래스 지향 설계의 일부분을 포함한 주요 프로그래밍 패러다임의 기반이 된다. 클로저에 익숙해지는 것은 JS를 마스터하고 코드에서 많은 중요한 디자인 패턴을 효과적으로 활용하는 데 필요하다.

클로저의 모든 측면을 다루려면 이 장 전체에 걸쳐 토론과 코드의 험난한 여정이 필요하다. 다음 단계로 넘어가기 전에 시간을 갖고 각 부분들에 익숙해졌는지 확인해라.

## 클로저 살펴보기

클로저는 원래 수학적인 개념으로 람다 대수에서 유래했다. 그러나 수학적인 공식을 나열하거나 이를 정의하기 위해 많은 표기법이나 전문용어는 사용하지는 않을 것이다.

대신, 실용적인 관점으로 살펴볼 것이다. 클로저가 JS에 없다고 가정한 상황과 비교해서 프로그램의 다른 동작에서 관찰할 수 있는 관점에서 클로저를 정의하는 것으로 시작할 것이다. 그러나 이 장의 뒷부분 *대안적 관점*에서 클로저를 보는 관점을 뒤집을 것이다.

클로저는 함수의 동작이며 함수일 뿐이다. 함수를 다루지 않는다면 클로저가 적용되지 않는다. 객체에는 클로저가 있을 수 없으며 클래스에도 클로저가 없다(해당 함수/메서드가 있을 수 있음). 오직 함수에만 클로저가 있다.

클로저를 관찰하려면 함수가 반드시 실행되어야 하고, 원래 정의된 스코프 체인과 다른 분기의 스코프에서 실행되어야 한다. 정의된 동일한 스코프에서 실행되는 함수는 클로저가 가능한지 여부에 관계없이 관찰 가능한 다른 동작이 없다. 관찰적 관점과 정의에 따르면, 그것은 클로저가 아닙니다.

관련있는 스코프 버블색들이 주석으로 달린 코드를 보자(챕터2 참고):

```js
// 외부/글로벌 스코프: 빨강(1)

function lookupStudent(studentID) {
    // 함수 스코프: 파랑(2)

    var students = [
        { id: 14, name: "Kyle" },
        { id: 73, name: "Suzy" },
        { id: 112, name: "Frank" },
        { id: 6, name: "Sarah" }
    ];

    return function greetStudent(greeting){
        // 함수 스코프: 초록(3)

        var student = students.find(
            student => student.id == studentID
        );

        return `${ greeting }, ${ student.name }!`;
    };
}

var chosenStudents = [
    lookupStudent(6),
    lookupStudent(112)
];

// 함수명 접근:
chosenStudents[0].name;
// greetStudent

chosenStudents[0]("Hello");
// Hello, Sarah!

chosenStudents[1]("Howdy");
// Howdy, Frank!
```

이 코드에서 가장 먼저 주목해야 할 것은 `lookupStudent(..)` 외부 함수가 `greetStudent(..)`라는 내부 함수를 생성하고 반환한다는 것이다. `lookupStudent(..)`는 두 번 호출되어 내부 `greetStudent(..)` 함수의 두 개의 개별 인스턴스를 생성하며 둘 다 `chosenStudents` 배열에 저장된다.

`chosenStudents[0]`에 저장된 반환된 함수의 `.name` 속성을 확인하여 이 경우인지 확인하고, 실제로 이는 안에 있는 `greetStudent(..)`의 인스턴스이다.

`lookupStudent(..)`에 대한 각 호출이 완료된 후 모든 내부 변수가 삭제되고 GC 되는 (garbage collected) 것 처럼 보인다. 내부 함수가 반환되고 보존되는 유일한 것으로 보인다. 그러나 여기에서 우리가 관찰하기 시작할 수 있는 다른 동작이 나온다.

`greetStudent(..)`는 `greeting`이라는 매개변수로 하나의 인수를 받지만 이를 포함하는 `lookupStudent(..)` 스코프에서 오는 식별자인 `students`와 `studentID`를 모두 참조한다. 내부 함수에서 외부 스코프의 변수에 대한 각 참조를 *클로저*라고 한다. 학문적 용어로 쓰면, `greetStudent(..)`의 각 인스턴스는 외부 변수 `students`와 `studentID`를 *클로즈 오버*(closes over)한다고 한다.

그렇다면 이러한 클로저들에서 구체적이고 관찰 가능한 의미는 무엇일까?

클로저를 사용하면 `greetStudent(..)`의 외부 스코프가 완료된 후에도 외부 변수에 계속 접근할 수 있다(`lookupStudent(..)`에 대한 각 호출이 완료될 때). `students` 와 `studentID`의 인스턴스가 GC되지 않고 메모리에 남아있다. 나중에 `greetStudent(..)` 함수의 인스턴스 중 하나가 호출될 때 해당 변수는 현재 값을 유지하면서 여전히 존재한다.

JS 함수에 클로저가 없다면 각 `lookupStudent(..)` 호출이 완료되면 해당 스코프가 즉시 해제되고 `students`와 `studentID` 변수가 GC된다. 나중에 `greetStudent(..)` 함수 중 하나를 호출하면 어떻게 될까?

`greetStudent(..)`가 파랑(2) 구슬이라고 생각한 것에 액세스하려고 시도하지만 그 구슬이 실제로 존재하지 않는다면(더 이상), 합리적인 가정은 `ReferenceError`가 발생하는 것이다, 맞지?

하지만 오류는 발생하지 않는다. `chosenStudents[0]("Hello")` 이 동작하고 "Hello, Sarah!" 메시지를 반환한다는 사실은 여전히 `students`와 `studentID` 변수에 액세스할 수 있음을 의미한다. 이것은 클로저의 직접적인 관찰이다!

### 클로저에 집중하기

사실 이전 논의에서 약간 세세한 부분들은 넘겼는데 아마 많은 분들이 놓쳤을 것이다!

`=>` 화살표 함수 문법의 간결성때문에 이 또한 스코프를 만든다는 것을 잊기 쉽다(챕터 3의 "화살표 함수" 부분에서 언급). `student => student.id == studentID` 화살표 함수는 `greetStudent(..)` 함수 스코프 안에 또 다른 스코프 버블을 생성한다.

챕터 2의 구슬과 양동이를 색칠하면서 비유했던 것에 기반하여 이 코드에 대한 색 다이어그램을 만들어본다면, 중첩 레벨의 가장 안쪽에 4번째 스코프가 있게 되고, 4번째 색이 필요하게 된다; 이 스코프를 위해 오렌지색(4)을 추가할 것이다.

```js
var student = students.find(
    student =>
        // 함수 스코프: 오렌지(4)
        student.id == studentID
);
```

파랑(2) `studentID`의 참조는 초록(3) 스코프 `greetStudent(..)`가 아닌 오렌지(4) 스코프 내부에 있다.; 또한, 화살표 함수의 `student` 인자는 오렌지(4)고, 초록(3) `student`를 섀도잉한다.

여기서 중요한 점은 `greetStudent(..)`가 이 클로저를 들고있다기보다는 배열의 `find(..)` 메소드 콜백으로 넘겨진 화살표 함수가 `studentID`를 클로즈 오버 해야한다는 것이다. 예상대로 잘 동작하니 큰 문제는 아니다. 그저 작은 화살표 함수도 클로저 모임에 참여할 수 있다는 사실을 모른체하지만 않으면 된다.

### 클로저 추가하기

클로저에 대해 자주 인용되는 표준 예 중 하나를 살펴보자.

```js
function adder(num1) {
    return function addTo(num2){
        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15);    // 25
add42To(9);     // 51
```

각 인스턴스의 내부 `addTo(..)` 함수는 각각의 `num1` 변수를 클로즈 오버 하고있다. 그래서 `num1`은 `adder(..)`가 종료되어도 사라지지 않는다. 이후 `add10To(15)` 호출같이 내부 `addTo(..)` 인스턴스들 중 하나를 실행시킬 때 클로즈 오버된 `num1` 변수는 아직 존재하고 아직 원래 값 `10`을 가지고 있다. 따라서 `10 + 15`를 수행하고 `25` 답을 반환할 수 있다.

중요한 세부 사항을 이전 단락에서 쉽게 지나쳤을 수 있으므로, 이를 보강해보자: 클로저는 함수의 단일 렉시컬 선언보다는 함수의 인스턴스와 관련이 있다. 앞의 내용에 따르면, `adder(..)` 내부에 오직 하나의 내부 함수 `addTo(..)`가 정의되어있는데, 이 때문에 단일 클로저가 적용되는 것 처럼 보일 것이다.

그러나 사실, 바깥 `adder(..)` 함수가 실행될 때마다, *새로운* 내부 `addTo(..)` 함수 인스턴스가 각각 새 인스턴스와 새 클로저로 생성된다. 그래서 각 내부 함수 인스턴스(우리 프로그램에서 `add10To(..)`와 `add42To(..)`로 라벨링된)는 `adder(..)` 실행으로부터 각각의 스코프 환경 인스턴스를 클로즈 오버한다.

비록 클로저가 컴파일 시 관리되는 렉시컬 스코프를 기반으로 하지만, 클로저는 함수 인스턴스들의 런타임 특성으로 관찰된다.

### 스냅샷이 아닌 실시간 연결

이전 섹션의 두 예시에서, **변수에서 값을 읽고** 이 값은 클로저에 저장되었다. 이는 클로저가 마치 어떤 순간의 값 스냅샷인 것 처럼 느껴질 수 있다. 사실 이는 흔한 오해다.

클로저는 사실 전체 변수 그 자체에 대한 접근을 보존하는 실시간 연결이다. 우리는 값을 읽는 것에만 국한되지 않고 클로즈 오버된 변수는 업데이트(재할당)될 수도 있다! 함수 내부의 변수를 클로즈 오버 함으로써, 이 함수의 주소가 프로그램에 존재하거나 우리가 원하는 어디서든 함수를 실행해 변수를 계속 사용(읽기와 쓰기)할 수 있다. 이게 클로저가 강력한 기술로써 프로그래밍의 많은 영역에 걸쳐서 사용되는 이유이다!

그림 4에서 함수 인스턴스들과 스코프 링크를 묘사한다.

<figure>
    <img src="images/fig4.png" width="400" alt="Function instances linked to scopes via closure" align="center">
    <figcaption><em>그림 4: 클로저 시각화</em></figcaption>
    <br><br>
</figure>

그림 4에서 보여지듯, 각 `adder(..)` 호출들은 `num1` 변수를 포함하는 새로운 파랑(2) 스코프를 생성한다. 새로운 파랑 스코프는 초록(3) 스코프인 `addTo(..)` 함수의 새로운 인스턴스이다. 함수 인스턴스들(`addTo10(..)`과 `addTo42(..)`)은 빨강(1) 스코프로부터 실행되고 존재하고 있는 부분을 명심해라.

이제 클로즈 오버된 변수가 업데이트되는 예시를 살펴보자:

```js
function makeCounter() {
    var count = 0;

    return function getCurrent() {
        count = count + 1;
        return count;
    };
}

var hits = makeCounter();

// 잠시 후

hits();     // 1

// 잠시 후

hits();     // 2
hits();     // 3
```

`count` 변수는 내부 `getCurrent()` 함수에 의해 클로즈 오버되고, GC 대상이 되지 않고 유지된다. `hits()` 함수는 이 변수에 대한 접근과 업데이트를 하고, 증가된 숫자를 매번 반환한다.

클로저의 감싸는 스코프는 일반적으로 함수에서 있지만 필수사항은 아니다. 외부 스코프 내부에 내부 함수만 있으면 된다.

```js
var hits;
{   // 바깥 스코프 (함수는 아닌)
    let count = 0;
    hits = function getCurrent(){
        count = count + 1;
        return count;
    };
}
hits();     // 1
hits();     // 2
hits();     // 3
```

| 비고: |
| :--- |
| 여기서 의도적으로 `getCurrent()`를 `함수` 선언식 대신 `함수` 표현식으로 선언하였다. 이것은 클로저에 대한 것은 아니지만, FiB(Function Declarations in Block)의 위험한 단점이 있다(챕터 6) |

클로저를 변수 지향적이 아닌 값 지향적으로 착각하는 것이 매우 일반적이기 때문에 개발자는 때때로 클로저를 사용하여 특정 순간의 값을 스냅샷으로 보존하려고 시도하는 실수를 한다. 다음 코드를 살펴보자:

```js
var studentName = "Frank";

var greeting = function hello() {
    // `studentName`을 클로즈 오버,
    // "Frank"가 아닌
    console.log(
        `Hello, ${ studentName }!`
    );
}

// 잠시 후

studentName = "Suzy";

// 잠시 후

greeting();
// Hello, Suzy!
```

`greeting()` (`hello()`라고도 하는) 함수를 선언하면서 `studentName`은 `"Frank"`라는 값을 가지고 있는데(`"Suzy"`가 재할당되기 전에), 잘못된 가정은 클로저가 `"Frank"`를 저장한다는 것이다. 그러나 `greeting()`은 `studnetName` 변수를 클로즈 오버하지 값을 클로즈 오버하는건 아니다. 언제든지 `greeting()`이 실행되면, 현재의 변수(여기서는 `"Suzy"`)를 반영한다.

이 실수의 전형적인 예로는 반복문 안에 함수를 정의하는 것이다.

```js
var keeps = [];

for (var i = 0; i < 3; i++) {
    keeps[i] = function keepI(){
        // `i`가 클로즈 오버됨
        return i;
    };
}

keeps[0]();   // 3 -- 왜!?
keeps[1]();   // 3
keeps[2]();   // 3
```

| 비고: |
| :--- |
| 이러한 클로저 형식은 전형적으로 `setTimeout(..)`나 이벤트 핸들러같은 다른 콜백을 반복문 안에서 사용한다. 여기서는 함수 주소를 배열에 저장하는걸로 예시를 간소화해서 비동기 타이밍은 고려할 필요가 없었다. 클로저 원칙은 역시 동일하다. |

아마 `keeps[0]()` 실행 결과가 `0`을 반환하는 것을 기대했을 것이다. 함수가 반복문의 첫 반복 `i`가 0일때 생성되었기 때문이다. 하지만 이 가정은 클로저가 변수 지향적인게 아니라 값 지향적으로 생각한 것에서 생긴 생각이다.

`for` 반복문 구조에서 각 반복마다 새로운 `i` 변수를 가진다고 속일 수도 있다. 사실 이 프로그램에서는 `var`로 선언되었기 때문에 오직 하나의 `i`만 가진다.

각 저장된 함수들은 `3`을 반환하는데, 반복문 끝에서 이 하나의 `i` 변수는 `3`으로 할당되기 때문이다. `keeps` 배열의 각 세 함수들은 각각의 클로저를 가지고는 있지만, 이들 모두가 공유된 `i` 변수를 클로즈 오버하고 있다.

물론, 단일 변수는 특정 시간에 하나의 값만 가질 수 있다. 그래서 만약 여러 변수들을 저장하고 싶으면, 각각 다른 변수들이 필요하다.

반복문 구문에서 이를 어떻게 할 수 있을까? 각 반복마다 새로운 변수를 만들어보자.

```js
var keeps = [];

for (var i = 0; i < 3; i++) {
    // 새로운 `j`를 각 반복마다 생성하고,
    // 이 순간 `i`의 값을 복사해 저장한다.
    let j = i;

    // 여기서 `i`는 클로즈 오버되지 않아서,
    // 각 반복마다의 현재 값을
    // 즉시 사용해도 괜찮다
    keeps[i] = function keepEachJ(){
        // 클로즈 오버된 `j` 사용, `i`가 아님!
        return j;
    };
}
keeps[0]();   // 0
keeps[1]();   // 1
keeps[2]();   // 2
```

모든 변수들이 `j`로 네이밍 되어있음에도 불구하고, 이제 각 함수는 매 반복마다 각각의 (새로운) 변수를 클로즈 오버한다. 그리고 각 `j`는 반복문의 시점마다의 `i` 값을 복사한다; `j`는 전혀 재할당되지 않는다. 그래서 이제 세 함수들 모두 예상된 값을 반환한다: `0`, `1`, 그리고 `2`!

다시 강조한다. 이 프로그램에서 내부의 `keepEachJ()`가 `setTimeout(..)`이나 다른 이벤트 핸들러 구독같은 비동기한 방식으로 사용한다고 해도, 같은 방식의 클로저 동작을 관찰할 수 있다.

챕터 5의 "반복문" 섹션을 상기해보자. `for` 반복문에서 `let` 선언을 설명할 때 사실 반복문에 대해서 오직 한 변수만 생성하는게 아니라, *각 반복*마다 새로운 변수를 생성한다고 했다. 이러한 트릭이자 기이한 특징은 클로저 반복문에서 정확하게 필요한 것이다.

```js
var keeps = [];

for (let i = 0; i < 3; i++) {
    // `let i`는 새로운 `i`를 준다
    // 각 반복마다, 자동적으로!
    keeps[i] = function keepEachI(){
        return i;
    };
}
keeps[0]();   // 0
keeps[1]();   // 1
keeps[2]();   // 2
```

`let`을 사용함으로써, 각 반복마다 하나씩 총 3개의 `i`가 생성되고, 그래서 세 클로저들은 예상했던대로 *그냥 동작한다.*

### 일반적인 클로저: Ajax와 이벤트

클로저는 콜백에서 가장 일반적으로 발생한다.

```js
function lookupStudentRecord(studentID) {
    ajax(
        `https://some.api/student/${ studentID }`,
        function onRecord(record) {
            console.log(
                `${ record.name } (${ studentID })`
            );
        }
    );
}

lookupStudentRecord(114);
// Frank (114)
```

`onRecord(..)` 콜백은 Ajax 호출로부터 응답이 온 이후의 미래 시점에 실행될 것이다. 이 실행은 `ajax(..)` 유틸리티 내부에서 발생할 것이다. 더구나, 실행되는 시점은 `lookupStudentRecord(..)` 호출이 완료된지 오래된 시점이다.

그렇다면 왜 `studentID`의 주변에 아직 있고 콜백으로 접근할 수 있는걸까? 클로저다.

이벤트 핸들러는 클로저의 또 다른 일반적인 사용법이다.

```js
function listenForClicks(btn,label) {
    btn.addEventListener("click",function onClick(){
        console.log(
            `The ${ label } button was clicked!`
        );
    });
}

var submitBtn = document.getElementById("submit-btn");

listenForClicks(submitBtn,"Checkout");
```

`label` 파라미터는 `onClick(..)` 이벤트 핸들러 콜백에 의해 클로즈 오버된다. 버튼이 클릭될 때, 사용될 `label`은 여전히 존재한다. 이것이 클로저다.

### 이걸 볼 수 없다면?

다음과 같은 속담을 들어봤을거다:

> 숲속에서 나무가 쓰러져도 이 소리를 들을 사람이 없다면, 이건 소리를 낸걸까?

이건 약간 철학적인 문제다. 물론 과학적인 관점에서 보면, 음파가 생성된다. 하지만 진짜 요점은: 소리가 나도 *그것이 중요한가?*

기억해라. 클로저에 대한 우리의 정의에서 강조점은 관찰 가능하다는 것이다. 클로저가 존재(기술적, 구현적, 학문적인 관점에서)하지만 우리 프로그램에서 관찰될 수 없다면, *그것이 중요한가?* 아니다.

이 점을 강조하기 위해서 클로저를 기반하지 *않은* 몇 가지 예시를 살펴볼 것이다.

예시로 렉시컬 스코프 참조를 사용하는 함수를 실행하는 것:

```js
function say(myName) {
    var greeting = "Hello";
    output();

    function output() {
        console.log(
            `${ greeting }, ${ myName }!`
        );
    }
}

say("Kyle");
// Hello, Kyle!
```

내부 함수 `output()`에서 이를 감싸는 스코프의 변수 `greeting`과 `myName`에 접근한다. 그러나 `output()`의 실행이 같은 스코프에서 발생하고, `greeting`과 `myName`은 당연하게 아직 접근이 가능하다; 이는 그냥 렉시컬 스코프고 클로저가 아니다.

클로저를 지원하지 않는 렉시컬 스코프 언어 어떤 것도 이와 동일한 방식으로 동작할 것이다.

사실 전역 스코프 변수는 본질적으로(관찰적으로) 클로즈 오버될 수 없다. 왜냐하면 이들은 어디에서든 항상 접근이 가능하기 때문이다. 전역 스코프의 자손이 아닌 스코프 체인에서 실행될 수 있는 함수는 없다.

다음 코드를 살펴보자:

```js
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getFirstStudent() {
    return function firstStudent(){
        return students[0].name;
    };
}

var student = getFirstStudent();

student();
// Kyle
```

`firstStudent()` 내부 함수는 스코프 바깥의 변수 `students`를 참조한다. 그러나 `students`는 전역 스코프로부터 발생했으므로, 함수가 프로그램 어디에서 실행되는지와 상관없고, `students`에 대한 접근은 일반 렉시컬 스코프와 다를게 없다.

언어에서 클로저가 지원하든 안하든 모든 함수 실행은 전역 변수에 접근할 수 있다. 전역 변수는 클로즈 오버될 필요가 없다.

변수가 단지 존재만 하고 접근되지 않는다면 클로저가 사용되지 않는다.

```js
function lookupStudent(studentID) {
    return function nobody(){
        var msg = "Nobody's here yet.";
        console.log(msg);
    };
}

var student = lookupStudent(112);

student();
// Nobody's here yet.
```

내부 함수 `nobody()`는 바깥 변수를 클로즈 오버하지 않는다. 오직 자신의 변수 `msg`만 사용한다. `studentID`가 둘러싸는 스코프에 존재한다고 할지라도, `studentID`는 `nobody()`에서 참조되지 않았다. JS 엔진은 `lookupStudent(..)` 실행을 마친 후에는 `studentID`를 주변에 놔둘 필요가 없고, 그래서 GC는 메모리에서 정리하려고 시도한다!

JS 함수가 클로저를 지원하든 안하든, 프로그램은 동일하게 동작한다. 그러므로, 여기서 클로저는 관찰되지 않는다.

함수 호출이 없다면, 클로저는 관찰되지 않는다:

```js
function greetStudent(studentName) {
    return function greeting(){
        console.log(
            `Hello, ${ studentName }!`
        );
    };
}

greetStudent("Kyle");

// 다른 일은 일어나지 않는다.
```

이것은 까다롭다. 바깥 함수는 분명히 실행되었기 때문이다. 그러나 내부 함수는 클로저를 가질 *수도* 있었던 것이고, 아직 전혀 실행되지 않았다; 여기서 반환된 함수는 그냥 버려진다. 그래서 기술적으로 JS 엔진은 잠깐동안 클로저를 생성하지만, 프로그램에서 의미있는 방향으로는 관찰되지 않는다.

나무는 쓰러졌을 것이다... 하지만 우리는 이를 듣지 못했으므로 상관쓰지 않는다.

### 관찰 가능한 정의

우리는 이제 클로저를 정의할 준비가 되었다:

> 클로저는 함수가 변수(들)에 접근할 수 없는 스코프에서 실행되는 동안에도 바깥 스코프(들)의 변수(들)을 사용할 때 관찰된다.

이 정의에서 중요한 부분은 다음이다:

* 함수가 반드시 실행되어야 한다.

* 적어도 한 개의 바깥 스코프의 변수를 참조해야한다.

* 변수(들)과 다른 분기의 스코프 체인에서 호출되어야 한다.

이러한 관찰 지향적인 정의는 간접적인, 학술적인 상식으로 클로저를 치부해서는 안된다는 것을 의미한다. 대신, 클로저가 우리 프로그램 동작에 미치는 직접적이고 구체적인 영향을 살펴보고 계획해야한다.

## 클로저 생명주기와 가비지 컬렉션(GC)

클로저가 본질적으로 함수 인스턴스와 연결되어있기 때문에, 변수에 대한 클로저는 함수에 대한 참조가 있는 동안에는 지속된다.

만약 10개의 함수가 모두 같은 변수를 클로즈 오버하고, 시간이 지남에 따라서 9개의 함수 참조가 폐기된다면, 유일하게 남은 함수 참조가 여전히 변수를 보존한다. 최종 함수의 참조가 폐기되면 변수에 대한 마지막 클로저가 사라지고 변수 자체가 GC된다.

이는 효율적이고 성능 좋은 프로그램을 구축하는데 중요한 영향을 미친다. 클로저는 예상치 못한 다른 방법으로 만들어진 변수의 GC를 막을 수 있는데 이는 시간이 지남에 따라서 메모리 사용량 폭주를 야기한다. 이 때문에 함수 참조(및 그에 따른 클로저)가 더 이상 필요없을 때 폐기되는 것이 중요하다.

다음 코드를 살펴보자:

```js
function manageBtnClickEvents(btn) {
    var clickHandlers = [];

    return function listener(cb){
        if (cb) {
            let clickHandler =
                function onClick(evt){
                    console.log("clicked!");
                    cb(evt);
                };
            clickHandlers.push(clickHandler);
            btn.addEventListener(
                "click",
                clickHandler
            );
        }
        else {
            // 콜백을 전달하지 않으면
            // 모든 클릭 핸들러들 구독취소한다
            for (let handler of clickHandlers) {
                btn.removeEventListener(
                    "click",
                    handler
                );
            }

            clickHandlers = [];
        }
    };
}

// var mySubmitBtn = ..
var onSubmit = manageBtnClickEvents(mySubmitBtn);

onSubmit(function checkout(evt){
    // checkout을 핸들링한다
});

onSubmit(function trackAction(evt){
    // 분석을 위해 로그를 출력한다
});

// 나중에 모든 핸들러들을 구독취소한다:
onSubmit();
```

프로그램에서 내부 `onClick(..)` 함수는 전달된 `cb`(제공된 이벤트 콜백)에 대한 클로저를 갖는다. 이는 `checkout()`과 `trackAction()` 함수 표현식 참조는 이러한 이벤트 핸들러가 구독되는 동안 클로저를 통해 유지된다(그리고 GC될 수 없다).

마지막 라인에서 입력값 없이 `onSubmit()`을 호출할 때, 모든 이벤트 핸들러들은 구독 취소되고, `clickHandlers` 배열은 비어진다. 모든 클릭 핸들러 함수 참조들이 폐기되면, `checkout()`과 `trackAction()`을 참조하는 `cb` 클로저가 폐기된다.

프로그램의 전반적인 상태와 효율성을 고려할 때, 이벤트 핸들러가 더 이상 필요하지 않을 때 구독 취소하는 것이 초기 구독보다 더 중요할 수 있다!

### 변수마다 혹은 스코프마다?

우리가 해결해야 할 또 다른 질문: 클로저를 참조된 외부 변수에만 적용되는 것으로 생각해야 할까, 아니면 모든 변수와 함께 전체 스코프 체인을 보존해야 할까?

즉, 이전 이벤트 구독에 대한 짧은 코드에서, 내부 `onClick(..)` 함수는 오직 `cb`만 클로즈 오버 하고있을까, 아니면 `clickHandler`, `clickHandlers`, 및 `btn`도 클로즈 오버 하고있을까?

개념적으로는, 클로저는 **스코프마다**라기보다는 **변수마다**이다. Ajax 콜백, 이벤트 핸들러 및 기타 모든 형태의 함수 클로저는 일반적으로 명시적으로 참조하는 것만 클로즈 오버하는 것으로 가정한다.

그러나 실제로는 이보다 더 복잡하다.

다른 프로그램을 고려해보자:

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    return addGrade;

    // ************************

    function getGrade(record){
        return record.grade;
    }

    function sortAndTrimGradesList() {
        // 등급 순으로 내림차순 정렬
        grades.sort(function desc(g1,g2){
            return g2 - g1;
        });

        // 상위 10개 등급만 저장
        grades = grades.slice(0,10);
    }

    function addGrade(newGrade) {
        grades.push(newGrade);
        sortAndTrimGradesList();
        return grades;
    }
}

var addNextGrade = manageStudentGrades([
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    // ..많은 다른 기록들..
    { id: 6, name: "Sarah", grade: 91 }
]);

// 나중에

addNextGrade(81);
addNextGrade(68);
// [ .., .., ... ]
```

외부 함수 `manageStudentGrades(..)`는 학생 기록 목록을 입력받고, 외부적으로 `addNextGrade(..)`라고 라벨링된 `addGrade(..)` 함수 참조를 반환한다. 새 등급으로 `addNextGrade(..)`를 호출할 때마다, 숫자 내림차순으로 정렬된 상위 10개 등급의 현재 목록을 다시 가져온다(`sortAndTrimGradesList()` 참조).

기존 `manageStudentGrades(..)` 호출의 끝이면서 여러 `addNextGrade(..)` 호출 사이에서 `grades` 변수는 클로저를 통해 `addGrade(..)` 내부에 보존된다; 이것이 상위 등급 목록이 유지되는 방식이다. 이것은 변수 `grades`에 대한 클로즈 오버이지, 그것이 가지고있는 배열(`studentRecords`)이 아니라는 점을 기억해라. 

그러나 이것이 유일하게 존재하는 클로저는 아니다. 클로즈 오버되는 다른 변수를 찾을 수 있나?

`addGrade(..)`가 `sortAndTrimGradesList`를 참조하는 부분을 발견했나? 이는 `sortAndTrimGradesList()` 함수 참조를 보유한 이 식별자 또한 클로즈 오버한다는 것을 의미한다. 이 두 번째 내부 함수는 `addGrade(..)`가 이를 호출할 수 있도록 주변에 두어야하고, 이는 또한 *그것* -> *그것(`addGrade`)*이 클로즈 오버하는 모든 변수가 주변에 고정되어있음을 의미한다. 하지만 이 케이스에서는, 추가로 여기(`addGrade`)에 클로즈 오버되는 것이 없다.

또 무엇이 클로즈 오버되나?

`getGrade` 변수(그리고 그것의 함수)를 고려해보자; 이것은 클로즈 오버되어있나? 이는 `.map(getGrade)` 호출의 바깥 스코프의 `manageStudentGrades(..)`에서 참조된다. 그러나 `addGrade(..)`나 `sortAndTrimGradesList()`에서 참조되지는 않는다.

`studentRecords`로 넘기는 (잠재적으로)많은 학생 기록 목록은 어떨까? 이 변수는 클로즈 오버 되어있나? 만약 그렇다면, 학생 기록들 배열은 절대로 GC되지 않고, 이는 우리가 예상하는 것 보다 더 많은 메모리 양을 보유하게 된다. 그러나 자세히 봐보면, 어떤 내부 함수에서도 `studentRecords`를 참조하지 않고 있다.

클로저의 *각 변수마다* 정의되는 것에 따르고, `getGrade`와 `studentRecords`는 내부 함수에 의해 참조되지 *않으므로* 이들은 클로즈 오버되지 않는다. 이들은 `manageStudentGrades(..)` 호출이 완료된 직후 GC에서 자유롭게 사용할 수 있어야 한다.

실제로 Chrome의 v8과 같은 최신 JS 엔진에서 이 코드를 디버깅하여 `addGrade(..)` 함수 내부에 중단점을 배치한다. 인스펙터<sub>inspector</sub>는 `studentRecords` 변수를 나열하지 **않는다**. 어쨌든 디버깅 측면에서 엔진이 클로저를 통해 `studentRecords`를 유지하지 않는다는 증거다. 휴!

그러나 이 관찰이 증거로서 얼마나 믿을 수 있을까? 이 (상당히 부자연스러운!) 프로그램을 보자:

```js
function storeStudentInfo(id,name,grade) {
    return function getInfo(whichValue){
        // 주의:
        //   `eval(..)`을 사용하는 것은 나쁜 생각이다!
        var val = eval(whichValue);
        return val;
    };
}

var info = storeStudentInfo(73,"Suzy",87);

info("name");
// Suzy

info("grade");
// 87
```

내부 함수 `getInfo(..)`는 `id`, `name` 또는 `grade` 변수에 대해 명시적으로 클로즈 오버되어있지 않은 점을 유의해라. 그럼에도 불구하고, `info(..)` 호출은 아직 변수에 접근할 수 있는 것으로 보이고, 비록 `eval(..)` 사용을 통한 렉시컬 스코프 속임수일지라도(챕터 1 참고) 말이다.

따라서 내부 함수에서 명시적으로 참조하지 않음에도 불구하고, 모든 변수는 클로저를 통해 확실히 보존되었다. 그렇다면 이게 *변수마다*에 반증되고 *스코프마다*라는 주장에 찬성하는 것일까? 아직 결정되지 않았다.

많은 최신 JS 엔진은 클로저 스코프에서 명시적으로 참조되지 않는 변수를 제거하는 *최적화*를 적용힌다. 그러나 `eval(..)`에서 볼 수 있듯이 이러한 최적화를 적용할 수 없는 상황이 있고 클로저 스코프에 원래 변수가 모두 포함되어 있다. 다시 말해서, 클로저는 구현적 관점으로는 *스코프마다*여야 하며, 그런 다음 선택적 최적화가 스코프를 클로즈 오버된 것(*변수마다* 클로저와 유사한 결과)으로만 축소한다.

몇 년 전만 해도, 많은 JS 엔진이 이러한 최적화를 적용하지 않았다. 너의 웹사이트도 아직 그러한 브라우저나, 특히 저사양의 오래된 장치에서 실행될 수 있다. 이는 이벤트 핸들러같이 오랫동안 유지되는 클로저들이 우리가 생각한 것 보다 더 오래 메모리에 유지될 수 있다는 것이다.

그리고 사실 이는 필수적인 명세가 아닌 선택적인 최적화인데 이는 우리가 무심코 적용 가능성을 과대평가해서는 안된다는 것을 의미한다.

변수에 큰 값(객체나 배열같은)을 저장하고 이 변수가 스코프 클로저에 존재하는 경우, 이 변수가 더 이상 필요하지 않고, 메모리에 저장되지 않기를 원한다면, 수동으로 값을 버리는 것이 클로저의 최적화나 GC에 의존하는 것 보다 (메모리 사용 측면에서)안전하다.

이전의 `manageStudentGrades(..)` 예제에서 `studentRecords`에 있는 잠재적으로 큰 배열이 불필요하게 클로저 스코프에 걸리지 않도록 *수정*해보자:

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    // 클로저에서 원치 않는 메모리 보유를 방지하기 위해서
    // `studentRecords` 를 설정 해제하자
    studentRecords = null;

    return addGrade;
    // ..
}
```

`studentRecords`를 클로저 스코프로부터 없애지는 않는다; 우리가 조작할 수 없는 영역이다. `studentRecords`가 클로저 스코프에 남아있더라도 이 변수는 더이상 잠재적으로 큰 배열의 데이터를 참조하지 않게끔은 할 수 있다; 배열은 GC될 수 있다.

다시 말하지만, 많은 경우 JS가 자동적으로 프로그램을 동일한 효과로 최적화할 것이다. 그러나 많은 양의 장치 메모리가 필요 이상으로 묶여있지 않도록 주의하고 명시적으로 확인하는 것은 여전히 좋은 습관이다.

사실 `.map(getGrade)` 호출이 완료된 이후에는 기술적으로 더이상 `getGrade()` 함수는 필요하지 않다. 만약 어플리케이션을 프로파일링 결과가 메모리 사용의 치명적인 부분임이 보여지면, 아마 해당 참조값이 묶여 있지 않도록 참조를 해제하여 약간의 메모리를 확보할 수 있을 것이다. 이 임시 예시에서는 불필요할 수 있겠지만, 일반 어플리케이션에서 메모리 사용을 최적화한다면 염두해두어야하는 일반적인 기술이다.

요약: 프로그램에서 어디에 클로저가 나타나는지를 알고 어떤 변수들이 포함되는지 아는 것이 중요하다. 이 클로저들을 메모리에서 낭비 없이 최소한으로 필요한 부분만 가지고 있게끔 조심히 관리해야 한다.

## 대안적 관점

클로저의 동작 정의를 검토하면, 함수는 "일급 객체"로 프로그램에서 다른 값들처럼 전달될 수 있다는 주장이다. 클로저는 함수가 어디로 가던지 해당 함수를 바깥의 스코프/변수와 연결하는 링크 연결이다.

이 장의 앞부분에서 스코프 버블 색상이 주석으로 표시된 코드 예제를 다시 살펴보자.

```js
// 외부/전역 스코프: 빨강(1)

function adder(num1) {
    // 함수 스코프: 파랑(2)

    return function addTo(num2){
        // 함수 스코프: 초록(3)

        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15);    // 25
add42To(9);     // 51
```

우리의 현재 관점은 어디서든지 함수가 전달되고 실행되면 클로저는 클로즈 오버된 변수에 대한 접근을 유용하게 하기 위해 기존 스코프에 대한 숨겨진 연결을 보존한다고 제안한다. 편의를 위해서 또 나왔는데 그림 4는 이 개념을 보여준다.

<figure>
    <img src="images/fig4.png" width="400" alt="Function instances linked to scopes via closure" align="center">
    <figcaption><em>그림 4 (반복): 클로저 시각화</em></figcaption>
    <br><br>
</figure>

그러나 클로저에 대해 생각하는 또 다른 방법이 있다. 더 정확하게 함수의 *전달되는* 특성 차이를 보면 멘탈 모델을 심화하는 데 도움이 될 수 있다.

이 대안 모델은 "일급 객체로써의 함수"를 강조하지 않고 대신 JS에서 함수(모든 비원시 값과 마찬가지로)가 참조로 유지되고 참조 복사에 의해 할당/전달되는 방식을 수용한다. 자세한 내용은 *Get Started*책의 부록 A를 참고해라.

`return` 이나 할당을 통해 외부의 빨강(1) 스코프로 이동하는 `addTo(..)`의 내부 함수 인스턴스에 대해 생각하는 대신, 함수 인스턴스가 실제로 자신의 스코프 환경 제자리에 유지되는 것을 상상할 수 있다. 물론 스코프 체인이 손상되지 않은 상태에서다.

빨강(1) 스코프로 *보내지는* 것은 함수 인스턴스 자체가 아니라 내부 함수 인스턴스에 대한 **오직 참조**다. 그림 5는 빨강(1) `addTo10` 와 `addTo42` 참조 각각이 가리키는 내부 함수 인스턴스가 제자리에 남아 있음을 보여준다.

<figure>
    <img src="images/fig5.png" width="400" alt="Function instances inside scopes via closure, linked to by references" align="center">
    <figcaption><em>그림 5: 클로저 시각화(대안)</em></figcaption>
    <br><br>
</figure>

그림 5에서 보여지듯, `adder(..)`에 대한 각 호출은 여전히 `num1` 변수를 포함하는 새로운 파랑(2) 스코프를 생성하고, 초록(3) `addTo(..)` 스코프의 인스턴스도 생성한다. 그러나 그림 4와의 차이점은, 초록(3) 인스턴스들이 파랑(2) 스코프 인스턴스 내부에 자연스럽게 중첩되어 내부에 남아있다는 점이다. `addTo10`와 `addTo42` 함수 인스턴스 자체가 아닌 참조가 빨강(1) 외부 스코프로 옮겨진다.

`addTo10(15)`가 호출될 때, `addTo(..)` 함수 인스턴스(기존 파랑(2) 스코프 환경 내부에 아직 존재하는)가 실행된다. 함수 인스턴스 자체는 전혀 움직이지 않았으므로, 당연하게 여전히 스코프 체인으로 자연스럽게 접근할 수 있다. `addTo42(9)` 호출과 동일하다. 여기서 렉시컬 스코프를 넘어서는 특별한 것은 없다.

그렇다면 함수가 다른 스코프로 이동하더라도 기존 스코프 체인의 연결을 유지하는것은 *마법*이 아니여도 *클로저인가*? 이 대안 모델에서 함수는 원래 위치에 있으면서 항상 그랬듯 기존 스코프 체인을 접근한다.

대신 클로저는 프로그램의 다른 부분에서 해당 함수 인스턴스에 대한 참조가 하나 이상 있는 한 전체 스코프 환경과 체인에서 **함수 인스턴스를 유지**하는 *마법*을 설명한다.

이 클로저에 대한 정의는 전통적인 학문적 관점과 비교하면 덜 친숙하게 들린다. 그러나 제자리에 있는 함수 인스턴스와 참조의 직접적인 조합에 대한 클로저 설명을 단순화한다는 장점이 있기 때문에 그럼에도 불구하고 여전히 유용하다.

이전 모델(그림 4)가 JS에서 클로저를 설명할 때 *틀리지는* 않았다. 클로저에 대한 학문적인 관점의 개념으로 영감을 받은 것이다. 대조적으로, 대안 모델(그림 5)는 JS가 실제로 동작하는 방식에 초점을 맞춘 구현으로 설명될 수 있다.

두 관점/모델 모두 클로저를 이해하는데 유용하지만 독자는 어느 하나가 더 이해하기 쉬울 수도 있다. 어느것을 선택했든지 우리 프로그램에서 관찰 가능한 결과는 동일하다.

| 비고: |
| :--- |
| 클로저를 위한 이 대안 모델은 동기 콜백을 클로저의 예시로 분류할지 여부에 영향을 미친다. 이 뉘앙스에 대한 자세한 내용은 부록 A를 참고해라. |

## 왜 클로저인가?

이제 클로저가 무엇이며 어떻게 동작하는지에 대한 전반적인 이해를 하였으므로, 예제 프로그램 코드 구조와 구성을 개선할 수 있는 몇 가지 방법을 살펴보자.

클릭하면 Ajax 요청을 통해 일부 데이터를 검색하고 보내야하는 버튼이 페이지에 있다고 상상해보자. 클로저를 사용하지 않고:

```js
var APIendpoints = {
    studentIDs:
        "https://some.api/register-students",
    // ..
};

var data = {
    studentIDs: [ 14, 73, 112, 6 ],
    // ..
};

function makeRequest(evt) {
    var btn = evt.target;
    var recordKind = btn.dataset.kind;
    ajax(
        APIendpoints[recordKind],
        data[recordKind]
    );
}

// <button data-kind="studentIDs">
//    Register Students
// </button>
btn.addEventListener("click",makeRequest);
```

`makeRequest(..)` 유틸리티는 클릭 이벤트에서 `evt` 객체만 받는다. 거기에서 대상 버튼 요소에서 `data-kind` 속성을 검색해야한다. 그리고 해당 값을 사용하여 API 엔드포인트에 대한 URL과 Ajax 요청에 포함되어야하는 데이터를 모두 조회해야 한다.

이것은 정상적으로 동작한다. 하지만 이벤트 핸들러가 실행될 때마다 DOM 속성을 읽어야 하는 것은 불행하다(비효율적이고 혼란스럽다). 이벤트 핸들러가 왜 이 값을 *기억*하지 못할까? 코드를 개선하기 위해 클로저를 사용해보자:

```js
var APIendpoints = {
    studentIDs:
        "https://some.api/register-students",
    // ..
};

var data = {
    studentIDs: [ 14, 73, 112, 6 ],
    // ..
};

function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;

    btn.addEventListener(
        "click",
        function makeRequest(evt){
            ajax(
                APIendpoints[recordKind],
                data[recordKind]
            );
        }
    );
}

// <button data-kind="studentIDs">
//    Register Students
// </button>

setupButtonHandler(btn);
```

`setupButtonHandler(..)` 접근 방식을 사용하면 `data-kind` 속성이 한 번 검색되고 초기 설정에서 `recordKind` 변수에 할당된다. 그런 다음 `recordKind`는 내부 `makeRequest(..)` 클릭 핸들러에 의해 클로즈 오버되고 해당 값은 전송되어야하는 URL과 데이터 조회를 위해 각 이벤트가 실행될 때 사용된다.

| 비고: |
| :--- |
| `evt`는 여전히 `makeRequest(..)`에 전달되지만 이 경우에는 더 이상 사용하지 않는다. 이전 스니펫과의 일관성을 위해서 쓴 것이다. |

`setupButtonHandler(..)` 내부에 `recordKind`를 배치하여 해당 변수의 스코프 노출을 프로그램의 보다 적절한 하위 집합으로 제한한다. 전역적으로 저장하면 코드 구성과 가독성이 나빠진다. 클로저는 내부 `makeRequest()` 함수 인스턴스가 이 변수를 *기억하고* 필요할 때마다 액세스할 수 있도록 한다.

이 패턴을 기반으로 설정 시 URL과 데이터를 한 번에 조회할 수 있다.

```js
function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;
    var requestURL = APIendpoints[recordKind];
    var requestData = data[recordKind];

    btn.addEventListener(
        "click",
        function makeRequest(evt){
            ajax(requestURL,requestData);
        }
    );
}
```

이제 `makeRequest(..)`는 `requestURL`와 `requestData`에 대해 클로즈 오버 되어있다. 이는 이해하기에 더 명확하고 성능도 조금 향상되었다.

클로저에 의존하는 함수형 프로그래밍(FP) 패러다임의 두 가지 유사한 기술은 부분 적용<sub>partial application</sub>과 커링<sub>currying</sub>이다. 간단히 말해서, 이러한 기술을 사용해 여러 입력이 필요한 함수의 *모양*을 변경해 일부 입력은 미리 제공하고 다른 입력은 나중에 제공한다. 초기 입력은 클로저를 통해서 기억된다. 모든 입력이 제공되면 기본 동작이 수행된다.

내부에 일부 정보를 캡슐화해 함수 인스턴스를 생성하면(클로저를 통해서) 나중에 입력을 다시 제공할 필요 없이 저장된 정보가 있는 함수를 직접 사용할 수 있다. 이것은 코드의 해당 부분을 더 깔끔하게 만들고, 부분적으로 적용된 함수들에 더 나은 의미의 이름을 붙일 수 있는 기회를 제공한다.

부분 적용을 적용하면 앞의 코드를 더 개선할 수 있다.

```js
function defineHandler(requestURL,requestData) {
    return function makeRequest(evt){
        ajax(requestURL,requestData);
    };
}

function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;
    var handler = defineHandler(
        APIendpoints[recordKind],
        data[recordKind]
    );
    btn.addEventListener("click",handler);
}
```

`requestURL`과 `requestData` 입력이 미리 제공되어 `makeRequest(..)`가 부분적으로 적용된 함수가 되며 로컬에서 `handler`라는 레이블이 지정된다. 이벤트가 발생하면 최종 입력(`evt`, 비록 무시될지라도)이 `handler()`로 전달되고, 입력을 완료하고 기본 Ajax 요청을 발생시킨다.

동작 면에서 이 프로그램은 동일한 유형의 클로저를 사용해 이전 프로그램과 매우 유사하다. 그러나 별도의 유틸리티(`defineHandler(..)`)에서 `makeRequest(..)`의 생성을 분리하여, 프로그램 전체에서 해당 정의를 재사용할 수 있도록 한다. 또한 클로저 스코프를 필요한 두 개의 변수로만 명시적으로 제한한다.

## 클로저로 더 가까이

빽뺵한 챕터를 마치면서, 휴식을 좀 취하면서 모든게 충분히 이해되도록 해라. 진심으로, 이는 누구에게나 습득하기에 많은 정보다!

우리는 까다로운 클로저의 개념을 정리하기 위해 두 가지 모델을 탐색했다.

* 관찰: 클로저는 해당 함수가 다른 스코프로 전달되고 **호출**되더라도 외부 변수를 기억하는 함수 인스턴스이다.

* 구현: 클로저는 함수 인스턴스와 해당 스코프 환경이 제자리에 유지되는 동안 이에 대한 참조가 전달되고 다른 스코프에서 **호출**된다.

프로그램이 얻는 이점 요약: 

* 클로저는 함수 인스턴스가 매번 계산하지 않고 이전에 결정된 정보를 기억하도록 하여 효율성을 향상시킬 수 있다.

* 클로저는 코드 가독성을 향상시키고 함수 인스턴스 내부에 변수를 캡슐화해 스코프 노출을 제한하는 동시에 해당 변수의 정보가 이후 사용됨을 위해 액세스할 수 있도록 보증한다. 보존된 정보는 모든 호출에서 전달될 필요가 없기 때문에 결과적으로 더 집중적이고 전문화된 함수 인스턴스와 깔끔하게 상호작용할 수 있다.

계속 진행하기 전에 시간을 내어 이 요약을 *자신의 말로* 다시 설명하고 클로저가 무엇이며 프로그램에서 왜 도움이 되는지 설명해봐라. 책은 모듈 패턴으로 클로저 위에 구축되는 마지막 챕터로 끝난다.
