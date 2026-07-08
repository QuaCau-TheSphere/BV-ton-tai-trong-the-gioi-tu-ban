---
share: true
updated: 2026-07-07T12:58
created: 2025-11-23T11:53
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
