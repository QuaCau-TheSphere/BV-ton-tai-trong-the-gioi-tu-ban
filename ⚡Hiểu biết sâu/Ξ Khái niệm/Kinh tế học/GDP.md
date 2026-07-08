---
share: true
updated: 2026-07-07T12:58
created: 2025-09-01T11:29
---
[[Tăng trưởng]]
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```
