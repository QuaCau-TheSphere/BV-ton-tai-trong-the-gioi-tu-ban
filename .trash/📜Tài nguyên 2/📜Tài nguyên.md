---
share: true
created: 2024-12-24T21:48
updated: 2025-03-27T16:44
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên"
group by split(file.folder, "/" )[1]
```