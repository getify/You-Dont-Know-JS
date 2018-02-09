# 你不懂JS：作用域与闭包
# 附录C：词法this

这本书通篇没有讲解 `this` 机制的任何细节，有一个 ES6 的话题以一种重要的方式将 `this` 与词法作用域联系了起来，我们将快速检视它一下。

ES6 为函数声明增加了一种特殊的语法形式，称为“箭头函数”。它看起来像这样：

```js
var foo = a => {
	console.log( a );
};

foo( 2 ); // 2
```

这个所谓的“大箭头”经常被称为是 *乏味烦冗的*（讽刺）`function` 关键字的缩写。

但是在箭头函数上发生的一些事情要重要得多，而且这与在你的声明中少敲几下键盘无关。

简单地说，这段代码有一个问题：

```js

var obj = {
	id: "awesome",
	cool: function coolFn() {
		console.log( this.id );
	}
};

var id = "not awesome";

obj.cool(); // awesome

setTimeout( obj.cool, 100 ); // not awesome
```

这个问题就是在 `cool()` 函数上丢失了 `this` 绑定。有各种方法可以解决这个问题，但一个经常被重复的解决方案是 `var self = this;`。

它可能看起来像：

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		var self = this;

		if (self.count < 1) {
			setTimeout( function timer(){
				self.count++;
				console.log( "awesome?" );
			}, 100 );
		}
	}
};

obj.cool(); // awesome?
```

用不过于深入细节的方式讲，`var self = this` 的“解决方案”免除了理解和正确使用 `this` 绑定的整个问题，而是退回到我们也许感到更舒服的东西上面：词法作用域。`self` 变成了一个可以通过词法作用域和闭包解析的标识符，而且一直不关心 `this` 绑定发生了什么。

人们不喜欢写繁冗的东西，特别是当他们一次又一次重复它的时候。于是，ES6 的一个动机是帮助缓和这些场景，将常见的惯用法问题 *固定* 下来，就像这一个。

ES6 的解决方案，箭头函数，引入了一种称为“词法 this”的行为。

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		if (this.count < 1) {
			setTimeout( () => { // 箭头函数能好用？
				this.count++;
				console.log( "awesome?" );
			}, 100 );
		}
	}
};

obj.cool(); // awesome?
```

简单的解释是，当箭头函数遇到它们的 `this` 绑定时，它们的行为与一般的函数根本不同。它们摒弃了 `this` 绑定的所有一般规则，而是采用它们的直接外围词法作用域的 `this` 的值，无论它是什么。

于是，在这个代码段中，箭头函数不会以不可预知的方式丢掉 `this` 绑定，它只是“继承” `cool()` 函数的 `this` 绑定（如果像我们展示的那样调用它就是正确的！）。

虽然这使代码更短，但在我看来，箭头函数只不过是将一个开发者们常犯的错误固化成了语言的语法，这混淆了“this 绑定”规则与“词法作用域”规则。

换一种说法：为什么要使用 `this` 风格的编码形式来招惹麻烦和繁冗？只要通过将它与词法作用域混合把它剔除掉就好。对于给定的一段代码只采纳一种方式或另一种看起来才是自然的，而不是在同一段代码中将它们混在一起。

**注意：** 源自箭头函数的另一个非议是，它们是匿名的，不是命名的。参见第三章来了解为什么匿名函数不如命名函数理想的原因。

在我看来，这个“问题”的更恰当的解决方式是，正确地使用并接受`this`机制。

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		if (this.count < 1) {
			setTimeout( function timer(){
				this.count++; // `this` 因为 `bind(..)` 所以安全
				console.log( "more awesome" );
			}.bind( this ), 100 ); // 看，`bind()`!
		}
	}
};

obj.cool(); // more awesome
```

不管你是偏好箭头函数的新的词法 this 行为，还是偏好经得起考验的 `bind()`，重要的是要注意箭头函数 **不** 仅仅是关于可以少打一些“function”。

它们拥有一种我们应当学习并理解的，*有意的行为上的不同*，而且如果我们这样选择，就可以利用它们。

现在我们完全理解了词法作用域（和闭包！），理解词法 this 应该是小菜一碟！
