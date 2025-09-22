---
share: true
created: 2025-03-27T17:13
updated: 2025-09-19T10:47
---
Khái niệm:: 
Debits and credits is the only way to give your team a common, consistent "language" for dealing with money, and being able to speak this language as a dev gives you superpowers.

Accounting was invented before negative numbers. Because of this, instead of counting money as positive or negative amounts, it uses the debits and credits. Instead of subtracting funds from one account and adding them to another, we talk about crediting one account and debiting another.

But it’s the 21st century and we have negative numbers now - why not just use positive and negative numbers? Using positive and negative numbers gets ambiguous.

If your app lets Alice sends Bob $5, we remove $5 from Alice’s account and add $5 to Bob’s account. So it seems fair to say that if both user accounts started at $0, Alice’s balance is -$5, and Bob’s balance is $5. Let's represent it that way in your DB.

Your CFO would disagree. From your company’s perspective, what these balances mean is that Alice owes you $5, and the company owes Bob $5. In other words, if the company went out of business tomorrow, you'd have to go out to collect $5 from Alice so that you could give Bob the $5 he rightfully thinks he’s holding inside of your app. Wouldn’t it be more logical to show Alice’s balance as $5 and Bob’s balance as -$5?

It gets even more confusing if your software deals with financial instruments like loans, investments, or invoices. Dealing with every balance in your application as a simple positive or negative number gets really confusing, and will cause both ledgering issues and communication breakdowns between your eng and financial teams.

Nguồn:: [Accounting For Developers, Part I \| Hacker News](https://news.ycombinator.com/item?id=32495724)