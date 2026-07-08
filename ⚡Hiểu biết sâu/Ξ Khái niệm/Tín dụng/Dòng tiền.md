---
share: true
created: 2024-09-30T12:08
updated: 2026-07-07T12:59
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```

GROUP BY file.folder
