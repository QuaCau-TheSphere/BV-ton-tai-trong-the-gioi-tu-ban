---
share: true
created: 2024-10-30T15:07
updated: 2026-03-28T17:16
---
```dataview
LIST rows.file.link
FROM "🛖Ngành nghề cụ thể/Tài chính/Bảo hiểm/Chính sách công ty"
WHERE file.name != this.file.name
Group by split(file.folder, "/" )[4]
```
