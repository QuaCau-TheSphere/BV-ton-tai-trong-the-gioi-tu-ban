---
share: true
updated: 2026-07-27T14:41
created: 2026-07-27T14:40
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
