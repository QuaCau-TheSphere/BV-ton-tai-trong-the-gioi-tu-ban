---
share: true
created: 2024-12-24T21:48
updated: 2026-03-17T21:54
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên"
group by split(file.folder, "/" )[1]
```
