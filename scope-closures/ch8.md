# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# 8장: 모듈 패턴

이 장에서 우리는 모든 프로그래밍에서 가장 중요한 코드 구성 패턴의 하나인 모듈을 살펴봄으로써 책의 본문을 마무리한다. 알다시피 모듈은 앞에서 다룬 렉시컬 스코프<sub>lexical scope</sub>와 클로저<sub>closure</sub>를 학습한 노력에 대한 성과에 본질적으로 구축된다.

전역 스코프의 범위부터 중첩 블록 스코프를 거쳐 변수 생명 주기의 복잡성에 이르기 까지 렉시컬 스코프의 모든 것을 조사했다. 그리고 클로저의 모든 힘을 이해하기 위해 렉시컬 스코프를 활용했다.

잠시 시간을 내어 얼마나 멀리 이 여정까지 온 건지 되돌아 보자. JS를 더 깊이 알기 위해 큰 발걸음을 내딛었다.

이 책의 중심 테마는 스코프와 클로저를 이해하고 마스터 하는 것이, 특히 변수로 정보를 어디에 저장할지 결정하는 코드를 적절하게 구성하는 데 핵심이라는 것이었다.

이 마지막 장의 목표는 프로그램을 만드는 데 있어 추상적인 개념으로 부터 실용적인 개선으로 끌어올리면서, 모듈이 이러한 주제의 중요성을 구현하는 방법을 이해하는 것이다.

## 캡슐화 및 최소 노출 (POLE)

캡슐화는 객체지향 프로그래밍의 원칙으로 자주 인용된다. 그러나 그 보다 더 근본적이고 넓게 적용된다. 캡슐화의 목표는 공통의 목적을 함께 제공하는 정보(데이터)와 행위(함수)의 결합 또는 공동 배치<sub>co-location</sub>이다.

어떤 문법이나 코드 구조의 독립은, 캡슐화의 정신은 공통의 목적을 가진 전체 프로그램의 조각을 묶기 위해 별도의 파일을 사용하는 것으로 간단하게 실현될 수 있다. 만약 검색 결과 목록을 동작시키는 모든 것을 "search-list.js"라는 단일 파일로 묶는다면, 프로그램의 일부분을 캡슐화하고 있는 것이다.

어플리케이션을 구성하기 위한 현대 프론트엔드 프로그램의 최신 트렌드는 컴포넌트 아키텍처를 중심으로 캡슐화로 더욱 나아가고 있다. 대다수가 검색 결과 목록을 구성하는 모든 것(코드를 비롯한 보여지는 마크업과 스타일을 포함하여)을 상호작용할 수 있는 실재하는 어떤 하나의 프로그램 로직 단위로 통합하는 것이 자연스럽다고 느낀다. 그런 다음 그 모음을 "SearchList" 컴포넌트로 이름 붙인다.

또 다른 핵심 목표는 캡슐화된 데이터와 기능의 특정 측면에 대한 가시성을 제어하는 것이다. 6장에서 스코프 초과 노출의 여러 *위험*을 방어적으로 보호하기 위해 추가하는 *최소 노출<sub>least exposure</sub>* 원칙(POLE)을 상기하자. 변수와 함수 모두에 영향을 미친다. JS에서는 거의 대부분 렉시컬 스코프 기법으로 가시성 제어를 구현한다.

이 아이디어는 유사한 프로그램 조각을 함께 그룹화하고 *비공개* 세부 사항으로 고려되는 부분에 대한 프로그램의 접근을 선택적으로 제한한다. *비공개*로 고려되지 않는 것은 *공개*로 인식되며, 전체 프로그램에서 접근 가능하다.

이러한 노력의 자연적 효과는 더 나은 코드 구성이다. 깨끗하고 분명한 경계와 연결점을 가지고, 어디에 있는지 알 때 소프트웨어를 만들고 유지하는 것이 더 쉽다.

JS 프로그램을 모듈로 구성하는 것에는 몇 가지 주요 이점이 있다.

## 모듈은 무엇인가?

모듈은 연관된 데이터와 함수(이 문맥에서는 흔히 메서드로 언급)의 모음이며, 숨겨진 *비공개* 세부 사항과 *공개* 접근 가능한 세부 사항 사이의 구분이 특징이며, 보통 "공개 API"라고 부른다.

모듈은 또한 상태를 가진다. 시간이 지나도 어떤 정보를, 그 정보에 접근하고 수정하는 기능과 마찬가지로 유지한다.

| 비고: |
| :--- |
| 모듈 패턴의 광범위한 관심사는 느슨한 결합과 기타 프로그램 아키텍처 기술을 통한 시스템 수준 모듈화를 완전히 수용하는 것이다. 토론의 영역을 벗어나는 복잡한 주제이지만 책의 범위를 벗어나 더 공부할 가치가 있다. |

모듈이 무엇인지 더 잘 이해하기 위해서 일부 모듈 특징을 모듈이 아닌 쓸만한 코드 패턴과 비교해보자.

### 네임스페이스 (상태가 없는 그룹화)

데이터 없이 연관된 함수의 집합을 함께 모은다면 모듈이 암시하는 예상 캡슐화는 정말로 가질 수 없다. *상태가 없는* 함수의 그룹화에 더 적합한 용어는 네임스페이스이다.

```js
// 네임스페이스, 모듈이 아님
var Utils = {
    cancelEvt(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
    },
    wait(ms) {
        return new Promise(function c(res){
            setTimeout(res,ms);
        });
    },
    isValidEmail(email) {
        return /[^@]+@[^@.]+\.[^@.]+/.test(email);
    }
};
```

여기서 `Utils`는 유용한 유틸리티 모음이지만 모두 상태 독립적인 함수이다. 기능을 함께 모으는 것은 일반적으로 좋은 방법이지만 모듈이 되지 않는다. 대신 `Utils` 네임스페이스를 정의했고 그 아래에 함수를 구성했다.

### 자료 구조 (상태가 있는 그룹화)

데이터와 상태가 있는 함수를 함께 묶어도 이것의 가시성을 제한하고 있지 않는다면 캡슐화의 POLE 측면에는 미치지 못한다. 모듈로 이름 붙이기에는 그다지 도움이 되지 않는다.

아래를 보자.

```js
// 자료 구조, 모듈이 아님
var Student = {
    records: [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ],
    getName(studentID) {
        var student = this.records.find(
            student => student.id == studentID
        );
        return student.name;
    }
};

Student.getName(73);
// Suzy
```

`records`는 공개적으로 접근 가능한 데이터이고 공개 API 뒤로 숨겨져 있지 않기 때문에 `Student`는 실제로 모듈이 아니다.

`Student`는 캡슐화의 데이터 및 기능 측면을 가진다. 하지만 가시성 제어 측면은 가지고 있지 않다. 자료 구조의 인스턴스로 이름 붙이는 것이 최선이다.

### 모듈 (상태가 있는 접근 제어)

모듈 패턴의 완전한 정신을 구현하기 위해서는 그룹화 및 상태뿐만 아니라 가시성(비공개 vs 공개)을 통한 접근 제어가 필요하다.

이전 섹션의 `Student`를 모듈로 바꿔보자. 내가 "클래식 모듈"이라 부르는 형태부터 시작할 것이다. 2000년대 초에 처음 등장했을 때는 원래 "노출식<sub>revealing</sub> 모듈"로 불렸다. 아래를 보자.

```js
var Student = (function defineStudent(){
    var records = [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ];

    var publicAPI = {
        getName
    };

    return publicAPI;

    // ************************

    function getName(studentID) {
        var student = records.find(
            student => student.id == studentID
        );
        return student.name;
    }
})();

Student.getName(73);   // Suzy
```

`Student`는 지금 모듈의 인스턴스이다. 단일 메서드 `getName(..)`을 가진 공개 API가 특징이다. 이 메서드는 비공개로 숨겨진 `records` 데이터에 접근할 수 있다.

| 경고: |
| :--- |
| 이 모듈 정의에서 코드로 넣어진 명시적인 학생 데이터는 단지 우리의 예시 목적을 위한 것임을 지적하고 싶다. 당신의 프로그램에서 보통의 모듈은 이 데이터를 바깥의 출처에서 받을 것이다. 일반적으로 데이터베이스, JSON 데이터 파일, Ajax 호출 등이다. 그런 다음 데이터는 일반적으로 모듈의 공개 API로 된 메서드를 통하여 모듈 인스턴스에 주입된다.  |

클래식 모듈 형식은 어떻게 동작하는가?

모듈의 인스턴스는 실행되는 `defineStudent()` IIFE에 의해 생성된다는 것을 주목해라. 이 IIFE는 내부 `getName(..)` 함수를 참조하는 속성이 있는 객체(`publicAPI`)를 반환한다.

`publicAPI` 객체로 이름 지은 것은 내가 선호하는 스타일이다. 이 객체는 당신이 좋아하는 어떤 이름이든 될 수 있다(JS는 신경쓰지 않는다). 또는 내부의 이름 있는 변수에 할당하지 않고 객체를 그냥 반환할 수 있다. 이 선택에 대한 자세한 내용은 부록 A에 있다.

외부에서 `Student.getName(..)`은 이 노출된 내부 함수를 호출하여, 클로저를 통해 내부 `records` 변수에 대한 접근을 유지한다.

속성 중 하나로 함수를 가지는 객체(역자 주: `publicAPI`)를 반환해서는 *안된다*. 그냥 객체 대신 함수(역자 주: `getName`)를 직접 반환할 수 있다. 클랙식 모듈의 핵심 부분을 여전히 만족한다.

렉시컬 스코프<sub>lexical scope</sub> 작동 방식에 따라 외부 모듈 정의 함수 안에서 변수와 함수를 정의하는 것은 모든 것을 *기본적으로* 비공개로 만든다. 오직 그 함수로 반환된 공개 API 객체에 추가된 속성만이 외부의 공개적인 사용을 위해 내보내진다.

IIFE의 사용은 프로그램이 보통 "싱글톤"이라 불리는 모듈의 단일 중앙 인스턴스를 필요로 한다는 것을 의미한다. 실제로, 이 구체적인 예제는 `Student` 모듈의 인스턴스 이상의 것이 필요할 이유가 없을 정도로 충분히 간단하다.

#### 모듈 팩토리 (여러개의 인스턴스)

하지만 프로그램에서 여러개의 인스턴스를 지원하는 모듈을 정의하려면 코드를 조금 수정할 수 있다.

```js
// 팩토리 함수, 싱글톤 IIFE가 아님
function defineStudent() {
    var records = [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ];

    var publicAPI = {
        getName
    };

    return publicAPI;

    // ************************

    function getName(studentID) {
        var student = records.find(
            student => student.id == studentID
        );
        return student.name;
    }
}

var fullTime = defineStudent();
fullTime.getName(73);            // Suzy
```

IIFE로 `defineStudent()`를 구현하지 않고 일반 독립실행형 함수로 정의하며, 일반적으로 "모듈 팩토리" 함수라고 한다.

그런 다음 모듈 팩토리를 호출하여 `fullTime`이라고 이름 붙인 모듈 인스턴스를 생성한다. 이 모듈 인스턴스는 안쪽 스코프의 새 인스턴스를 의미하므로 새로운 클로저 `getName(..)`은 `records`를 가지고 있다. `fullTime.getName(..)`은 이제 특정 인스턴스에서 메서드를 실행한다.

#### 클래식 모듈 정의

어떤 것이 클래식 모듈로 만드는지 명확히 하기 위해서 아래를 보자.

* 일반적으로 최소 한번 이상 실행하는 모듈 팩토리 함수로부터 바깥의 스코프가 되야 한다.

* 모듈의 안쪽 스코프는 모듈의 상태를 나타내는 정보가 적어도 하나는 있어야 한다.

* 모듈은 공개 API에서 적어도 하나의 함수에 대한 참조를 반환해야 하고 그 함수는 숨겨진 모듈 상태(실제로 보존되는)를 가진 클로저가 있다.

이 클래식 모듈 접근법에 대한 다른 변형을 살펴보고 싶다면 부록 A를 참고해라.

## Node CommonJS 모듈

4장에서 Node에서 사용하는 CommonJS 모듈 형식을 소개했다. 앞에서 설명한 클래식 모듈 형식과 달리 모듈 팩토리 또는 다른 모듈을 포함하는 어떤 다른 코드와 함께 IIFE로 묶을 수 있으며 CommonJS 모듈은 파일 기반이고 파일당 하나의 모듈이다.

그 형식에 딱 맞는 모듈 예제를 수정해보자.

```js
module.exports.getName = getName;

// ************************

var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}
```

`records`와 `getName` 식별자는 모듈의 최상위 스코프에 있다. 그러나 전역 스코프(4장에서 설명)는 아니다. 따라서 여기 있는 모든 것은 모듈에 *기본적으로* 비공개이다.

CommonJS 모듈의 공개 API에서 어떤 것을 노출하기 위해서 `module.exports`로 제공되는 비어있는 객체에 속성을 추가한다. 일부 오래된 레거시 코드에서는 그냥 텅 빈 `exports`에 참조를 전달해야 할지 모른다. 그러나 명확한 코드를 위해서 항상 `module.` 접두사를 가진 참조로 완전히 검증해야 한다.

스타일 목적을 위해서 상단에 "exports"를 넣고 하단에 모듈 구현을 넣는 것을 좋아한다. 하지만 이 내보내기<sub>exports</sub>는 어디에도 위치할 수 있다. 파일의 상단이나 하단에 모두 함께 모아두는 것을 강력히 권장한다.

어떤 개발자는 기본 내보내기 객체를 아래처럼 교체하는 습관이 있다.

```js
// API를 위해 새 객체를 정의
module.exports = {
    // ..exports..
};
```

이 접근법에는 만약 다수의 모듈이 서로 순환적으로 의존한다면 예상치 못한 동작을 포함하는 몇 가지 이상한 것이 있다. 이와 같이 객체를 교체하는 것을 권장하지 않는다. 만약 한번에 다수의 익스포트를 할당하길 원한다면, 객체 리터럴<sub>literal</sub> 스타일 정의를 사용하여 아래처럼 사용할 수 있다.

```js
Object.assign(module.exports,{
   // .. exports ..
});
```

여기서 일어나는 일은 `{ .. }` 모듈의 공개 API가 지정된 객체 리터럴을 정의하는 것이다. 그러면 `Object.assign(..)`이 존재하는 `module.exports` 객체로 교체하는 대신에 그 모든 속성의 얕은 복사를 수행한다. 편리하고 더 안전한 모듈 동작의 좋은 균형이다.

모듈/프로그램에 다른 모듈 인스턴스를 포함하기 위해서는 Node의 `require(..)` 메서드를 사용해라. 이 모듈이 "/path/to/student.js"에 위치한다고 가정하면 아래처럼 접근할 수 있다.

```js
var Student = require("/path/to/student.js");

Student.getName(73);
// Suzy
```

`Student`는 지금 예제 모듈의 공개 API를 참조한다.

CommonJS 모듈은 싱글톤 인스턴스로서 동작한다. 앞서 설명한 IIFE 모듈 정의 스타일과 비슷하다. 같은 모듈에서 `require(..)`를 많이 사용하더라도 단지 단일 공유 모듈 인스턴스에 대한 추가 참조만 얻는다.

`require(..)`는 양자택일 구조이다. 모듈의 공개 API로 노출된 전체 참조를 포함한다. API의 일부에만 효과적으로 접근하기 위한 일반적인 접근법은 아래와 같다.

```js
var getName = require("/path/to/student.js").getName;

// 대안:

var { getName } = require("/path/to/student.js");
```

클래식 모듈 형식과 비슷하게 CommonJS 모듈의 API로 공개적으로 노출된 메서드는 상세한 내부 모듈을 클로저로 잡고 있다. 프로그램의 수명 동안 모듈 싱글톤 상태가 유지되는 방법이다.

| 비고: |
| :--- |
| Node `require("student")` 구문에서 절대적이지 않은 경로(`"student"`)는 파일 확장자를 ".js"로 가정하고 "node_modules"를 검색한다. |

## 모던 ES 모듈 (ESM)

ESM 형식은 CommonJS 형식과 몇 가지 형식을 공유한다. ESM은 파일 기반이고 모듈 인스턴스는 *기본적으로* 모든 것이 비공개인 싱글톤이다. 한 가지 주목할 만한 차이점은 ESM 파일은 엄격모드<sub>strict-mode</sub>로 간주된다. 상단에 `"use strict"` 지시문<sub>pragma</sub>이 필요없다. ESM을 비엄격모드<sub>non-strict-mode</sub>로 정의할 방법은 없다.

CommonJS의 `module.exports` 대신에 ESM은 모듈의 공개 API로 어떤 것을 노출하기 위해서 `export` 키워드를 사용한다. `import` 키워드는 `require(..)` 구문을 교체한다. ESM 형식을 사용하도록 "students.js"를 수정해보자.

```js
export { getName };

// ************************

var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}
```

유일한 차이점은 `export { getName }` 구문이다. 이전과 마찬가지로 `export` 구문은 파일 어디에나 나타날 수 있지만 최상위 스코프에 있어야 한다. 다른 블록이나 함수 내부에 있을 수 없다.

ESM은 `export` 구문은 표현할 수 있는 방법을 적당히 다양하게 제공한다. 아래 예제를 보자.

```js
export function getName(studentID) {
    // ..
}
```

여기서 `function` 키워드 앞에 `export`가 있다고 해도 이 형식은 여전히 `function` 선언이고 외부에 노출할 수 있다. 즉, `getName` 식별자는 *함수 호이스팅<sub>function hoisted</sub>*(5장 참조)이고 모듈의 전체 스코프에서 사용 가능하다.

다른 변형은 아래와 같다.

```js
export default function getName(studentID) {
    // ..
}
```

다른 내보내기와는 다른 의미를 가지는 "default export"로 부른다. 본질적으로 "default export"는 모듈의 사용자들이 `import`할 때를 위한 축약이고, 하나의 기본 API 멤버만 필요할 때 간결한 문법을 제공한다.

`default`가 아닌 내보내기는 "named exports"라 부른다.

`import`는 `export`처럼 ESM의 어떤 블록이나 함수의 바깥인 최상위에서만 사용되어야 하고, 문법상으로는 몇 가지 변형이 있다. 첫번째 것은 "named import"로 부른다.

```js
import { getName } from "/path/to/students.js";

getName(73);   // Suzy
```

보다시피 이 형식은 모듈로 부터 오직 특정한 이름이 있는 공개 API 멤버만 가져오고(명시적으로 이름이 없는 것은 생략) 현재 모듈의 최상위 스코프에 식별자를 추가한다. 가져오기의 이러한 유형은 Java같은 언어에서 패키지를 가져오는데 사용하는 것과 비슷한 스타일이다.

여러개의 API 멤버는 `{ .. }` 묶은 안에서 콤마로 분리하여 나열할 수 있다. 이름 있는 가져오기는 또한 `as` 키워드와 함께 *이름을 변경*할 수 있다.

```js
import { getName as getStudentName }
   from "/path/to/students.js";

getStudentName(73);
// Suzy
```

만약 `getName`이 모듈의 "default export"라면 아래처럼 가져올 수 있다.

```js
import getName from "/path/to/students.js";

getName(73);   // Suzy
```

가져오기 바인딩<sub>binding</sub> 주변에 `{ }`를 없애는 것이 유일한 차이점이다. 기본 가져오기와 다른 이름있는 가져오기를 섞어서 사용하길 원한다면 아래를 보자.

```js
import { default as getName, /* .. 다른 것 .. */ }
   from "/path/to/students.js";

getName(73);   // Suzy
```

이와 대조적으로 `import`의 다른 중요한 변형은 "namespace import"라 부른다.

```js
import * as Student from "/path/to/students.js";

Student.getName(73);   // Suzy
```

당연한 것처럼 `*`는 API에 내보내진 모든 것과 기본 그리고 이름 있는 것을 가져온다. 그리고 그것을 특정된 네임스페이스 식별자 아래에 저장한다. 이 접근법은 JS의 역사 대부분에서 클래식 모듈의 형태와 가장 밀접하게 일치한다.

| 비고: |
| :--- |
| 이 책을 쓰는 시점에, 모던 브라우저는 몇 년 전부터 ESM를 지원하고 있다. 그러나 ESM에 대한 Node의 안정적인 지원은 상당히 최근이며 꽤 오랫동안 발전되고 있다. 이 발전은 수 년 동안 계속될 것 같다. ES6에서 JS에 ESM을 도입함에 따라 Node의 CommonJS 모듈과의 연동을 위한 까다로운 호환성 문제가 야기되었다. 최신 내용에 대해서는 Node의 ESM 문서를 참고해라. https://nodejs.org/api/esm.html |

## 스코프 나가기

클래식 모듈 형식(브라우저 또는 Node)을 사용하는지에 관계없이 CommonJS 형식(Node) 또는 ESM 형식(브라우저 또는 Node) 모듈은 프로그램의 기능과 데이터를 구조화하고 구성하는 가장 효율적인 방법 중 하나이다.

모듈 패턴은 적절한 위치에 변수와 함수를 배치하도록 렉시컬<sub>lexical</sub> 스코프 규칙을 어떻게 사용할 수 있는지 배우는 이 책에서 우리 여정의 결론이다. POLE는 항상 취할 수 있는 방어적인 *기본적으로 비공개* 태도이고 과잉 노출을 방어하며 필요한 최소한의 공개 API 겉에서만 상호작용하도록 만든다.

그리고 모듈 아래에서 모든 모듈 상태가 유지되는 *마법*은 렉시컬 스코프 시스템을 활용하는 클로저이다.

본론은 여기까지이다. 지금까지의 멋진 여정을 축하한다. 여러번 말했듯이 논의한 것들을 멈추고 성찰하고 실천하는 것은 좋은 생각이다.

편안하고 준비가 되었을 때, 이러한 주제들의 일부 구석을 파고드는 부록을 확인해라. 그리고 또한 배운 것을 굳히기 위해 실습과 함께 도전해라.
