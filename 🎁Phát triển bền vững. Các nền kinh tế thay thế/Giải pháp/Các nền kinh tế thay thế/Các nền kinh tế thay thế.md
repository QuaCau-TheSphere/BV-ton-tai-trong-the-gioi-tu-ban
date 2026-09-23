---
share: true
updated: 2026-07-27T16:24
created: 2025-08-26T17:19
---
```dataview
LIST rows.file.link
FROM "🎁Phát triển bền vững. Các nền kinh tế thay thế/Giải pháp/Các nền kinh tế thay thế" 
GROUP BY split(file.folder, "/")[3]
WHERE file.name != this.file.name
```