---
share: true
created: 2024-10-05T16:11
updated: 2025-07-09T17:32
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Niềm tin, diễn ngôn"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
