---
share: true
updated: 2026-07-27T02:26
created: 2026-06-22T16:19
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
