---
share: true
created: 2025-03-27T17:13
updated: 2025-09-06T19:59
---

```dataview
LIST rows.file.link
FROM "📐Dự án/Giúp nhau thoát nợ"
GROUP BY split(file.folder, "/")[2]
```
