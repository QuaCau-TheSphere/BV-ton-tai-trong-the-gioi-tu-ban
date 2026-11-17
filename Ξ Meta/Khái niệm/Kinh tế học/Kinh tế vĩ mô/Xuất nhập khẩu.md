---
share: true
updated: 2026-10-02T23:24
created: 2026-10-02T23:23
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
