---
share: true
updated: 2026-07-27T02:26
created: 2026-06-21T16:06
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
