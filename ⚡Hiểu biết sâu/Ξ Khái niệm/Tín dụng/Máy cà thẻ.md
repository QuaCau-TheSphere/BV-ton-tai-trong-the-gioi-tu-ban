---
share: true
created: 2025-03-27T17:13
updated: 2025-12-19T11:32
aliases:
  - POS
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
