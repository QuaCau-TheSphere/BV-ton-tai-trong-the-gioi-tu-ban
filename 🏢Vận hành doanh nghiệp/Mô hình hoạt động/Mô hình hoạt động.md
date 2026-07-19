---
share: true
updated: 2026-07-17T19:30
created: 2026-06-05T19:07
---

```dataview
LIST rows.file.link
FROM "🏢Vận hành doanh nghiệp/Mô hình hoạt động"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```

## Nơi thảo luận
Vào [Discord Quả Cầu](https://discord.com/channels/898550123007709204/1249553476745298010), kênh "Tạo dòng tiền, đầu tư, tạo thu nhập thụ động, kinh doanh" để thảo luận:
[![](https://i.vgy.me/BjXA75.png)](https://discord.com/channels/898550123007709204/1249553476745298010)
