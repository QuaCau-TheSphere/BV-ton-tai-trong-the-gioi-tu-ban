---
share: true
updated: 2026-10-22T22:28
created: 2026-10-22T22:28
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
