# You Don't Know JS Yet: Getting Started - 2nd Edition
# Chapter 1: Getting To Know JavaScript

| NOTE: |
| :--- |
| Work in progress |

You don't know JS, yet. Neither do I, not fully anyway. None of us do. That's the whole point of this book series!

But here's where you start that journey of getting to know the language a little better. We'll start with a few housekeeping details, then move into talking about the code part of the language in a bit.

## Name

The name JavaScript is probably the most misunderstood programming language name ever.

Is this language related to Java? Is it only the script form for Java? Is it only for writing scripts and not real programs?

The truth is, the name JavaScript is an artifact of marketing shenanigans. When Brendan Eich first conceived of the language, he code named it Mocha. Internally at Netscape, the brand LiveScript was used. But when it came time to publicly name the language, "JavaScript" won the vote.

Why? Because this language was originally designed to appeal to an audience of mostly Java programmers, and because the word "script" was popular at the time to refer to lightweight programs. These lightweight "scripts" would be the first ones to embed inside of pages on this new thing called the web!

In other words, JavaScript was a marketing ploy to try to position this language as a palatable alternative to writing the heavier and more well-known Java of the day. It could just as easily have been called "WebJava", for that matter.

There are some superficial resemblances between JavaScript's code and Java code. But those are actually mostly from a common root: C (and to an extent, C++).

For example, we use the `{` to begin a block of code and the `}` to end that block of code, just like C/C++ and Java. We also use the `;` to punctuate the end of a statment.

In fact, the relationships run even deeper than the superficial. Sun, the company that still owns and runs Java, also owns the official trademark for the name "JavaScript". This trademark is almost never enforced, and likely couldn't be at this point.

Some have suggested we use JS instead of JavaScript. That's a very common shorthand, if not a good candidate for an official language name itself.

To distance JS from Sun and the trademark, the official name of the language that is specified by TC39 and formalized by ECMA standards body is: ECMAScript. And indeed, since 2016, the official language name has also included the most recent revision year; as of this writing, that's ECMAScript 2019, or otherwise abbreviated ES2019.

In other words, JavaScript (in your browser, or in Node.js) is *an* implementation of the ES2019 standard!

| NOTE: |
| :--- |
| Don't use terms like "JS6" or "ES8". Some do that, and those terms only serve to perpetuate confusion. "JS" or "ES20xx" is what you should stick to. |

Whether you call it JavaScript, JS, ECMAScript, or ES2019, it's most definitely not a variant of the Java language!

> "Java is to JavaScript as ham is to hamster." --Jeremey Keith, 2009

## Specification

I mentioned a moment ago that TC39 -- the technical steering committee that manages JS -- votes on changes to submit to ECMA, the standards body.

The set of syntax and behavior that *is* JavaScript is the ES specification.

As of this writing, ES2019 is the most recent revision of this specification, the most recent version of the JavaScript language. This happens to be the 10th numbered revision since JavaScript's inception, so that's why you'll see that the specification's official URL as hosted by ECMA includes "10.0":

https://www.ecma-international.org/ecma-262/10.0/

The TC39 committee is comprised of anywhere from 50 to a little over 100 different people from a broad section of web-invested companies, such as browser makers (Mozilla, Google, Apple) and device makers (Samsung, etc). All members of the committee are volunteers, though many of them are employees of these companies and so some of them receive compensation in part for their duties on the committee.

TC39 meets generally about every other month, usually for about 3 days, to review work done by members since the last meeting, discuss issues, and vote on proposals. Meeting locations rotate among member companies willing to host.

All TC39 proposals progress through a five stage process -- of course, since we're programmers, it's 0-based -- Stage 0 through Stage 4. You can read more about the Stage process here: https://tc39.es/process-document/

Stage 0 means roughly, someone on TC39 thinks it's a worthy idea and plans to champion and work on it. That means lots of ideas that non-TC39 members "propose", through informal means such as social media or blog posts, are really "pre-stage 0". You have to get a TC39 member to champion a proposal for it to be considered "Stage 0" officially.

Once a proposal reaches "Stage 4" status, it is eligible to be included in the next yearly revision of the language.

All proposals are managed in the open, on TC39's Github repository: https://github.com/tc39/proposals

Anyone, whether on TC39 or not, is welcome to participate in these discussions and the processes for working on the proposals. However, only TC39 members can attend meetings and vote on these proposals. So in effect, the voice of a member of TC39 carries a lot of weight.

Contrary to some established and frustratingly perpetuated myth, there are *not* multiple versions of JavaScript. There's just **one JS**, the official standard as maintained by TC39 and ECMA.

Back in the early 2000's, when Microsoft maintained a forked and reverse-engineered (and not entirely compatible) version of JS called "JScript", there were legitimately "multiple versions" of JS. But those days are long gone. It's outdated and inaccurate to make such claims about JS today.

All major browsers and device makers have committed to keeping their JS implementations compliant with this one central specification. Of course, engines implement features at different times. But it should never be the case that the v8 engine (Chrome's JS engine) implements a specified feature differently than the SpiderMonkey engine (Mozilla's JS engine).

That means you can learn **one JS**, and rely on that same JS everywhere.

## Backwards and Forwards

TODO
