---
share: true
created: 2024-10-05T16:11
updated: 2025-08-23T23:29
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Niềm tin, diễn ngôn"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
