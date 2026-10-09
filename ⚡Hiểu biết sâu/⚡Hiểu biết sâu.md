---
share: true
created: 2024-12-24T21:45
updated: 2026-10-09T20:03
---

```dataview
LIST rows.file.link
FROM "⚡Hiểu biết sâu"
group by split(file.folder, "/" )[1]
```
