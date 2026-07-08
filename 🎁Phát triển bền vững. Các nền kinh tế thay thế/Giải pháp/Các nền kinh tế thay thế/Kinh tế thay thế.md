---
share: true
updated: 2026-07-07T12:59
created: 2025-08-26T17:19
---
```dataview
LIST rows.file.link
FROM "🎁Phát triển bền vững. Các nền kinh tế thay thế/Kinh tế thay thế" 
GROUP BY split(file.folder, "/")[3]
WHERE file.name != this.file.name
```
