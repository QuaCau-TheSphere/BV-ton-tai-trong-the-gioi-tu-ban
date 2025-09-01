---
share: true
created: 2025-03-27T17:13
updated: 2025-08-27T17:57
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Chọn sản phẩm phù hợp"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```
