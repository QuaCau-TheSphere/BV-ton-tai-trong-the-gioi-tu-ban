---
share: true
created: 2024-10-30T15:07
updated: 2025-12-19T11:32
---
```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Tình hình ở Việt Nam/Lĩnh vực cụ thể/Tài chính/Bảo hiểm"
WHERE file.name != this.file.name
Group by split(file.folder, "/" )[5]
```
