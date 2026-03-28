---
share: true
created: 2023-09-05T16:17
updated: 2026-03-28T17:18
---
```dataview
LIST rows.file.link
FROM "🛖Ngành nghề cụ thể/Tài chính/Tổ chức tín dụng/Vay nợ"
GROUP BY split(file.folder, "/")[5]
WHERE file.name != this.file.name
```
## Nơi thảo luận
![](https://i.imgur.com/OtW4epu.png)
