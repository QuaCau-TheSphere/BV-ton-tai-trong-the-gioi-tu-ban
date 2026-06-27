---
share: true
created: 2025-03-27T17:13
updated: 2026-06-27T17:10
---
```dataview
LIST rows.file.link
FROM "🧑‍🌾Ngành nghề cụ thể" 
GROUP BY split(file.folder, "/")[1]
WHERE file.name != this.file.name
```