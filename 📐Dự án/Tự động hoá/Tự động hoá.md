---
share: true
created: 2026-09-16T20:33
updated: 2026-09-16T20:34
---
```dataview
LIST rows.file.link
FROM "📐Dự án/Tự động hoá" 
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```