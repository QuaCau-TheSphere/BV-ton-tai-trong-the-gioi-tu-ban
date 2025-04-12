---
share: true
created: 2024-12-24T21:45
updated: 2025-03-27T20:39
---
```dataview
LIST rows.file.link
FROM "⚡Hiểu biết sâu"
group by split(file.folder, "/" )[1]
```