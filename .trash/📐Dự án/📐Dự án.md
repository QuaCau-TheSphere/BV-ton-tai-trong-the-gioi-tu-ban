---
share: true
created: 2025-01-13T09:53
updated: 2025-01-22T17:05
---
```dataview
LIST rows.file.link
FROM "📐Dự án"
group by split(file.folder, "/" )[1]
```
