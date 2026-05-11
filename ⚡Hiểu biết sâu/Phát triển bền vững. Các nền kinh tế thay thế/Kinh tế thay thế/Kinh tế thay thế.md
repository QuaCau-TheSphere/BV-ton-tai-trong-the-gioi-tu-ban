---
share: true
created: 2025-03-27T17:13
updated: 2026-04-12T11:40
---
```dataview
LIST rows.file.link
FROM "⚡Hiểu biết sâu/Phát triển bền vững. Các nền kinh tế thay thế/Kinh tế thay thế" 
GROUP BY split(file.folder, "/")[3]
WHERE file.name != this.file.name
```
