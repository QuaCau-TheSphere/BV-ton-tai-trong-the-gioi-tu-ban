---
share: true
updated: 2026-07-07T12:59
created: 2026-04-02T23:20
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
