---
share: true
created: 2025-04-24T15:03
updated: 2026-02-26T13:10
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
