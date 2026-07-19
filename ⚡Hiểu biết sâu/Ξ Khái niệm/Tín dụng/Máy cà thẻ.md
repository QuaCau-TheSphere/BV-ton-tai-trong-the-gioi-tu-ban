---
share: true
updated: 2026-07-14T15:52
aliases:
  - POS
created: 2025-09-25T11:29
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
