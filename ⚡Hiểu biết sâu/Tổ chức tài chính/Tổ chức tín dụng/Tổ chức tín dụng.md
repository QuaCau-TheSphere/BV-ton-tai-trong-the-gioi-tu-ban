---
share: true
created: 2023-09-05T16:17
updated: 2025-09-01T11:24
---
```dataview
LIST rows.file.link
FROM "⚡Hiểu biết sâu/Tổ chức tài chính/Tổ chức tín dụng"
GROUP BY split(file.folder, "/")[4]
WHERE file.name != this.file.name
```
## Nơi thảo luận
![](https://i.imgur.com/OtW4epu.png)
