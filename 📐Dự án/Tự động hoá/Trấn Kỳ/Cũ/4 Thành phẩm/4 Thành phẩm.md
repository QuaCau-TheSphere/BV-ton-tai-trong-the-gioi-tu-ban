---
share: true
created: 2023-11-08T14:54
updated: 2026-07-27T02:26
---

```dataview
LIST rows.file.link
FROM "📐 Dự án/Trấn Kỳ/4 Thành phẩm" 
WHERE file.name!=this.file.name
GROUP BY split(file.folder, "/")[3]
```
