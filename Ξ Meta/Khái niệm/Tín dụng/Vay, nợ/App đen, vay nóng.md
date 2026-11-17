---
share: true
created: 2024-09-06T11:52
updated: 2026-07-27T02:26
---
[[Vay nóng]]
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[3]
```
