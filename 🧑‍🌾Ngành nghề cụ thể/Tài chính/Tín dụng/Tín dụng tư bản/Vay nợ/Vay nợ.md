---
share: true
created: 2023-09-05T16:17
updated: 2026-06-27T17:11
---
```dataview
LIST rows.file.link
FROM "🧑‍🌾Ngành nghề cụ thể/Tài chính/Tín dụng/Tín dụng tư bản/Vay nợ"
GROUP BY split(file.folder, "/")[6]
WHERE file.name != this.file.name
```
## Nơi thảo luận
![](https://i.imgur.com/OtW4epu.png)
