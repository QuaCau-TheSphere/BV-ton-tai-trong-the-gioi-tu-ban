---
share: true
updated: 2026-07-08T20:39
created: 2026-07-08T20:39
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
