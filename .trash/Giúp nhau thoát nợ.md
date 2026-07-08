---
share: true

updated: 2025-09-06T19:59
---

```dataview
LIST rows.file.link
FROM "📐Dự án/Giúp nhau thoát nợ"
GROUP BY split(file.folder, "/")[2]
```
