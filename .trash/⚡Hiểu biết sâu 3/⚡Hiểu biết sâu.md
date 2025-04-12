---
share: true
created: 2024-12-24T21:45
updated: 2025-01-11T14:36
---
```dataview
LIST rows.file.link
FROM "⚡Hiểu biết sâu"
group by split(file.folder, "/" )[1]
```