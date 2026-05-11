---
share: true
created: 2024-09-06T11:52
updated: 2026-04-15T20:54
---
[[Vay nóng]]
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
