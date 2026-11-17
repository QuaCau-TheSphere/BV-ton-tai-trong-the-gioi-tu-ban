---
share: true
updated: 2026-10-02T23:24
created: 2026-02-04T13:00
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
