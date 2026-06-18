---
share: true
created: 2025-04-29T10:55
updated: 2026-06-07T14:06
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
