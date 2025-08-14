---
share: true
created: 2024-10-17T14:50
updated: 2025-07-23T22:29
---
[KOTO - Know One Teach One](https://www.koto.com.au/vi)
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Vì người yếu thế" 
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
## Nơi thảo luận
![](https://i.imgur.com/IQ3jN7M.png)
