---
share: true
created: 2026-10-22T22:16
updated: 2026-10-22T22:17
---
```dataview
LIST rows.file.link
FROM "📦Nền kinh tế hàng hoá/Kinh tế học tâm lý"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
