---
share: true
updated: 2026-07-27T02:26
created: 2026-04-15T21:04
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
