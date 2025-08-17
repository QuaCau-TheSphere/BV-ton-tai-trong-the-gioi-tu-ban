---
share: true
created: 2024-10-30T15:07
updated: 2025-08-17T16:41
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Tình hình ở Việt Nam/Lĩnh vực cụ thể/Bảo hiểm"
WHERE file.name != this.file.name
Group by split(file.folder, "/" )[4]
```
