---
share: true
updated: 2026-11-05T18:46
created: 2025-05-27T16:44
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```

