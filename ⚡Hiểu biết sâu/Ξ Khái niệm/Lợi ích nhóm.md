---
share: true
updated: 2026-07-17T15:10
created: 2026-07-07T12:05
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
