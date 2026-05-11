---
share: true
created: 2025-03-27T17:13
updated: 2026-03-28T21:02
---
```dataview
LIST rows.file.link
FROM "🛖Ngành nghề cụ thể" 
GROUP BY split(file.folder, "/")[1]
WHERE file.name != this.file.name
```