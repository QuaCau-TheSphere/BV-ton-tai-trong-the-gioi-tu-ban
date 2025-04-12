---
share: true
created: 2025-01-13T09:53
updated: 2025-04-03T14:15
---
```dataview
LIST rows.file.link
FROM "📐Dự án"
group by split(file.folder, "/" )[1]
```