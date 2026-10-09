---
share: true
updated: 2026-10-02T23:25
created: 2026-07-17T20:00
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
