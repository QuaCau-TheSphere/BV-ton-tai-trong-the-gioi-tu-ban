---
share: true
created: 2023-09-05T16:17
updated: 2025-12-19T11:32
---
```dataview
LIST rows.file.link
FROM "⚡Hiểu biết sâu/Ngành nghề cụ thể/Tài chính/Vay nợ"
GROUP BY split(file.folder, "/")[4]
WHERE file.name != this.file.name
```
## Nơi thảo luận
![](https://i.imgur.com/OtW4epu.png)
