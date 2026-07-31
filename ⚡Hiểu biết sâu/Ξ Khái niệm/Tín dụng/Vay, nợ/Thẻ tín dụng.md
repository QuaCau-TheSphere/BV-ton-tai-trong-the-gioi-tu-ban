---
share: true
created: 2024-09-06T13:34
updated: 2026-07-30T16:34
---
[[Máy cà thẻ]]
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[5]
```
