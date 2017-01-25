# 你不懂JS: 异步与性能

## 目录

* 序
* 前言
* 第一章: 异步:现在与稍后
	* 块儿（Chunks）中的程序
	* 事件轮询（Event Loop）
	* 并行线程
	* 并发
	* Jobs
	* 语句排序
* 第二章: 回调
	* 延续
	* 顺序的大脑
	* 信任问题
	* 尝试拯救回调
* 第三章: Promise
	* 什么是 Promise？
	* Thenable 鸭子类型（Duck Typing）
	* Promise的信任
	* 链式流程
	* 错误处理
	* Promise 模式
	* Promise API概览
	* Promise 的限制
* 第四章: Generator
	* 打破运行至完成
	* 生成值
	* 异步地迭代 Generator
	* Generators + Promises
	* Generator 委托
	* Generator 并发
	* Thunks
	* 前ES6时代的 Generator
* 第五章: 程序性能
	* Web Workers
	* SIMD
	* asm.js
* 第六章: 基准分析与调优
	* 基准分析（Benchmarking）
	* 上下文为王
	* jsPerf.com
	* 编写好的测试
	* 微观性能
	* 尾部调用优化 (TCO)
* 附录A：库：asynquence
* 附录B：高级异步模式
* 附录C：鸣谢
