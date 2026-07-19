---
share: true
updated: 2026-07-17T21:00
created: 2026-07-17T21:00
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
