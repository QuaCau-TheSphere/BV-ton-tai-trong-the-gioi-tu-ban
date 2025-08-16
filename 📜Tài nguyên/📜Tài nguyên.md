---
share: true
created: 2024-12-24T21:48
updated: 2025-08-16T22:05
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên"
group by split(file.folder, "/" )[1]
```
