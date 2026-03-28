---
share: true
created: 2025-03-27T17:13
updated: 2026-03-28T14:56
---
Khái niệm:: 
I’m posting this from a library Wi-Fi on a burner laptop because I am technically under a massive NDA. I don’t care anymore. I put in my two weeks yesterday and honestly, I hope they sue me. I’ve been sitting on this for about eight months, just watching the code getting pushed to production, and I can’t sleep at night knowing I helped build this machine.

You guys always suspect the algorithms are rigged against you, but the reality is actually so much more depressing than the conspiracy theories. I’m a backend engineer. I sit in the weekly sprint planning meetings where Product Managers (PMs) discuss how to squeeze another 0.4% margin out of "human assets" (that’s literally what they call drivers in the database schemas). They talk about these people like they are resource nodes in a video game, not fathers and mothers trying to pay rent.

First off, the "Priority Delivery" is a total scam. It was pitched to us as a "psychological value add." Like I said in the title, when you pay that extra $2.99, it changes a boolean flag in the order JSON, but the dispatch logic literally ignores it. It does nothing to speed you up.

We actually ran an A/B test last year where we didn't speed up the priority orders, we just purposefully delayed non-priority orders by 5 to 10 minutes to make the Priority ones "feel" faster by comparison. Management loved the results. We generated millions in pure profit just by making the standard service worse, not by making the premium service better.

But the thing that actually makes me sick—and the main reason I’m quitting—is the "Desperation Score." We have a hidden metric for drivers that tracks how desperate they are for cash based on their acceptance behavior.

If a driver usually logs on at 10 PM and accepts every garbage $3 order instantly without hesitation, the algo tags them as "High Desperation." Once they are tagged, the system then deliberately stops showing them high-paying orders. The logic is: "Why pay this guy $15 for a run when we know he’s desperate enough to do it for $6?" We save the good tips for the "casual" drivers to hook them in and gamify their experience, while the full-timers get grinded into dust.

Then there is the "Benefit Fee." You’ve probably seen that $1.50 "Regulatory Response Fee" or "Driver Benefits Fee" that appeared on your bill after the recent labor laws passed. The wording is designed to make you feel like you're helping the worker.

In reality, that money goes straight to a corporate slush fund used to lobby against driver unions. We have a specific internal cost center for "Policy Defense," and that fee feeds directly into it. You are literally paying for the high-end lawyers that are fighting to keep your delivery guy homeless.

And regarding tips, we're essentially doing Tip Theft 2.0. We don't "steal" them legally anymore because we got sued for that. Instead, we use predictive modeling to dynamically lower the base pay.

If the algo predicts you are a "high tipper" and you’ll likely drop $10, it offers the driver a measly $2 base pay. If you tip $0, it offers them $8 base pay just to get the food moved. The result is that your generosity isn't rewarding the driver; it’s subsidizing us. You’re paying their wage so we don't have to.

I'm drunk and I'm angry. Ask me anything before this gets taken down.
Nguồn:: 
