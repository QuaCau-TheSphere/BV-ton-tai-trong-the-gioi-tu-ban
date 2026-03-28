---
share: true
created: 2024-10-05T16:11
updated: 2026-03-28T17:22
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Niềm tin, diễn ngôn"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
