---
share: true
created: 2024-10-17T14:50
updated: 2026-06-05T14:35
---

```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Hỗ trợ người yếu thế" 
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
[CLB Công tác Xã hội Chuyên nghiệp TPHCM](https://www.facebook.com/clbctxhtphcm)
## Nơi thảo luận
![](https://i.imgur.com/IQ3jN7M.png)
