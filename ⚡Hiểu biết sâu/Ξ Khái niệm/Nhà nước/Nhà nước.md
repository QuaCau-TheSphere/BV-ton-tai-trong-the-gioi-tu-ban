---
share: true
created: 2025-05-06T14:11
updated: 2026-07-07T12:58
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
