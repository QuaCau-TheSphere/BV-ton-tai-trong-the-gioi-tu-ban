---
share: true
created: 2024-09-06T11:52
updated: 2026-03-28T16:05
---
[[App vay nóng, app đen]]
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
