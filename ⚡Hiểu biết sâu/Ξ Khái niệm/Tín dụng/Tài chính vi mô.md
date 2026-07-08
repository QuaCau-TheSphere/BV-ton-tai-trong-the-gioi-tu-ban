---
share: true
updated: 2026-07-07T12:59
created: 2025-04-13T21:37
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[2]
```

