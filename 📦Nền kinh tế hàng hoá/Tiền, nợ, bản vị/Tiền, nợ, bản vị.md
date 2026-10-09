---
share: true
created: 2026-10-09T20:04
updated: 2026-10-09T20:05
---
Khái niệm:: 
Chuyện gì sẽ xảy ra nếu bạn có tất cả tiền trên thế giới? 
![What if you literally had all the money in the world? - YouTube](https://youtu.be/saj7b5C6TCM?si=JXfCIhLP3YaJxx4t)

```dataview
LIST rows.file.link
FROM "📦Nền kinh tế hàng hoá/Tiền, nợ, bản vị" 
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```