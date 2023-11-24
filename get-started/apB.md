# 你并不了解 JavaScript：开始 - 第二版

# 附录 B: 温故而知新

在本附录中，我们将探讨一些练习和它们的参考答案。这些只是为了让你开始练习书中的概念。

## 相等性练习

让我们练习一下与值类型和比较的工作（第四章，重要组成 3），在这里需要涉及到强制类型转换。

`scheduleMeeting(..)` 应该接受一个开始时间（24 小时格式的字符串 "hh:mm"）和一个会议持续时间（分钟数）。如果会议完全在工作日内（根据 `dayStart` 和 `dayEnd` 中指定的时间），它应该返回 `true`；如果会议违反了工作日的作用域，则返回 `false`。

```js
const dayStart = "07:30";
const dayEnd = "17:45";

function scheduleMeeting(startTime, durationMinutes) {
    // ..TODO..
}

scheduleMeeting("7:00", 15); // false
scheduleMeeting("07:15", 30); // false
scheduleMeeting("7:30", 30); // true
scheduleMeeting("11:30", 60); // true
scheduleMeeting("17:00", 45); // true
scheduleMeeting("17:30", 30); // false
scheduleMeeting("18:00", 15); // false
```

首先尝试自己解决这个问题。考虑关系比较运算符的用法，以及强制类型转换如何影响这段代码。一旦你有了可行的代码，请将你的解决方案与本附录末尾「参考答案」中的代码进行比较。

## 闭包练习

现在我们来练习一下闭包（第四章，重要组成 1）。

`range(..)` 函数的第一个参数是一个数字，代表所需数字作用域内的第一个数字。第二个参数也是一个数字，代表所需作用域的终点（包括）。如果第二个参数被省略，那么应该返回另一个期望该参数的函数。

```js
function range(start, end) {
    // ..TODO..
}

range(3, 3); // [3]
range(3, 8); // [3,4,5,6,7,8]
range(3, 0); // []

var start3 = range(3);
var start4 = range(4);

start3(3); // [3]
start3(8); // [3,4,5,6,7,8]
start3(0); // []

start4(6); // [4,5,6]
```

首先尝试自己解决这个问题。

一旦你有了可以使用的代码，请将你的解决方案与本附录末尾「参考答案」中的代码进行比较。

## 原型练习

最后，让我们来研究 `this` 和对象的原型链（第 4 章，重要组成 2）。

定义一个有三个转轮的老虎机，可以单独旋转(`spin()`)，然后显示(`display()`)所有转轮的当前内容。

单个转盘的基本行为被定义在下面的 `reel` 对象中。但是老虎机需要单独的转盘 — 委托给 `reel` 的对象，并且每个对象都有一个 `position` 属性。

一个转盘只知道如何显示(`display()`)它当前的老虎机符号，但老虎机通常在每个转盘上显示三个符号：当前转盘 (`position`)，上一个转盘 (`position - 1`)，下一个转盘 (`position + 1`)。所以显示老虎机最终应该显示一个 3×3 的老虎机符号网格。

```js
function randMax(max) {
    return Math.trunc(1e9 * Math.random()) % max;
}

var reel = {
    symbols: ["♠", "♥", "♦", "♣", "☺", "★", "☾", "☀"],
    spin() {
        if (this.position == null) {
            this.position = randMax(this.symbols.length - 1);
        }
        this.position =
            (this.position + 100 + randMax(100)) % this.symbols.length;
    },
    display() {
        if (this.position == null) {
            this.position = randMax(this.symbols.length - 1);
        }
        return this.symbols[this.position];
    },
};

var slotMachine = {
    reels: [
        // 这台老虎机需要3个独立的转盘
        // 提示：Object.create(..)
    ],
    spin() {
        this.reels.forEach(function spinReel(reel) {
            reel.spin();
        });
    },
    display() {
        // TODO
    },
};

slotMachine.spin();
slotMachine.display();
// ☾ | ☀ | ★
// ☀ | ♠ | ☾
// ♠ | ♥ | ☀

slotMachine.spin();
slotMachine.display();
// ♦ | ♠ | ♣
// ♣ | ♥ | ☺
// ☺ | ♦ | ★
```

首先尝试自己解决这个问题。

提示：

-   使用 `%` 运算符来计算 `position`，因为你在 reel 上循环访问符号。
-   使用 `Object.create(..)` 来创建一个对象并将其原型链接到另一个对象。一旦链接，对象在方法调用过程中共享 `this` 上下文。
-   你可以使用另一个临时对象（再次使用 `Object.create(..)`），它有自己的 `position`，而不是直接修改 reel 对象来显示三个位置中的每一个。

一旦你有了可以使用的代码，请将你的解决方案与本附录末尾「参考答案」中的代码进行比较。

## 参考答案

请记住，这些参考答案仅仅是：参考。有许多不同的方法来解决这些习题。将你的方法与你在这里看到的进行比较，并考虑每种方法的优点和缺点。

对相等性练习实践的参考答案：

```js
const dayStart = "07:30";
const dayEnd = "17:45";

function scheduleMeeting(startTime, durationMinutes) {
    var [, meetingStartHour, meetingStartMinutes] =
        startTime.match(/^(\d{1,2}):(\d{2})$/) || [];

    durationMinutes = Number(durationMinutes);

    if (
        typeof meetingStartHour == "string" &&
        typeof meetingStartMinutes == "string"
    ) {
        let durationHours = Math.floor(durationMinutes / 60);
        durationMinutes = durationMinutes - durationHours * 60;
        let meetingEndHour = Number(meetingStartHour) + durationHours;
        let meetingEndMinutes = Number(meetingStartMinutes) + durationMinutes;

        if (meetingEndMinutes >= 60) {
            meetingEndHour = meetingEndHour + 1;
            meetingEndMinutes = meetingEndMinutes - 60;
        }

        // 重新组合完全限定的时间字符串
        // （为了便于比较）
        let meetingStart = `${meetingStartHour.padStart(
            2,
            "0",
        )}:${meetingStartMinutes.padStart(2, "0")}`;
        let meetingEnd = `${String(meetingEndHour).padStart(2, "0")}:${String(
            meetingEndMinutes,
        ).padStart(2, "0")}`;

        // 注意：由于表达式都是字符串，
        // 这里的比较是按字母顺序进行的，但这么做是安全的，
        // 因为它们是完全限定的时间字符串(例如，"07:15" < "07:30")。
        return meetingStart >= dayStart && meetingEnd <= dayEnd;
    }

    return false;
}

scheduleMeeting("7:00", 15); // false
scheduleMeeting("07:15", 30); // false
scheduleMeeting("7:30", 30); // true
scheduleMeeting("11:30", 60); // true
scheduleMeeting("17:00", 45); // true
scheduleMeeting("17:30", 30); // false
scheduleMeeting("18:00", 15); // false
```

---

对闭包练习实践的参考答案：

```js
function range(start, end) {
    start = Number(start) || 0;

    if (end === undefined) {
        return function getEnd(end) {
            return getRange(start, end);
        };
    } else {
        end = Number(end) || 0;
        return getRange(start, end);
    }

    // **********************

    function getRange(start, end) {
        var ret = [];
        for (let i = start; i <= end; i++) {
            ret.push(i);
        }
        return ret;
    }
}

range(3, 3); // [3]
range(3, 8); // [3,4,5,6,7,8]
range(3, 0); // []

var start3 = range(3);
var start4 = range(4);

start3(3); // [3]
start3(8); // [3,4,5,6,7,8]
start3(0); // []

start4(6); // [4,5,6]
```

---

对原型练习实践的参考答案：

```js
function randMax(max) {
    return Math.trunc(1e9 * Math.random()) % max;
}

var reel = {
    symbols: ["♠", "♥", "♦", "♣", "☺", "★", "☾", "☀"],
    spin() {
        if (this.position == null) {
            this.position = randMax(this.symbols.length - 1);
        }
        this.position =
            (this.position + 100 + randMax(100)) % this.symbols.length;
    },
    display() {
        if (this.position == null) {
            this.position = randMax(this.symbols.length - 1);
        }
        return this.symbols[this.position];
    },
};

var slotMachine = {
    reels: [Object.create(reel), Object.create(reel), Object.create(reel)],
    spin() {
        this.reels.forEach(function spinReel(reel) {
            reel.spin();
        });
    },
    display() {
        var lines = [];

        // 在老虎机上显示所有行
        for (let linePos = -1; linePos <= 1; linePos++) {
            let line = this.reels.map(function getSlot(reel) {
                var slot = Object.create(reel);
                slot.position =
                    (reel.symbols.length + reel.position + linePos) %
                    reel.symbols.length;
                return slot.display();
            });
            lines.push(line.join(" | "));
        }

        return lines.join("\n");
    },
};

slotMachine.spin();
slotMachine.display();
// ☾ | ☀ | ★
// ☀ | ♠ | ☾
// ♠ | ♥ | ☀

slotMachine.spin();
slotMachine.display();
// ♦ | ♠ | ♣
// ♣ | ♥ | ☺
// ☺ | ♦ | ★
```

这本书的内容就到此为止。但现在是时候寻找真正的项目来实践这些想法了。继续编码吧，因为这是最好的学习方法！
