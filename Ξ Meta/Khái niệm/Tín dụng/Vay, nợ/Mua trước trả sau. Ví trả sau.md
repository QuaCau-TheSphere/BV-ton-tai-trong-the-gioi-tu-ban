---
share: true
updated: 2026-11-05T16:39
created: 2026-11-05T16:38
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[5]
```

