---
share: true
created: 2025-01-14T18:24
updated: 2025-05-19T17:05
---

```dataview
LIST rows.file.link
FROM "📐Dự án/Giúp nhau thoát nợ"
GROUP BY split(file.folder, "/")[2]
```