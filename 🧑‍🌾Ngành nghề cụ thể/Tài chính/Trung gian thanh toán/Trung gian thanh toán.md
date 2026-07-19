---
share: true
updated: 2026-07-14T19:53
created: 2026-07-14T19:52
---
```dataview
LIST rows.file.link
FROM "🧑‍🌾Ngành nghề cụ thể/Tài chính/Trung gian thanh toán"
GROUP BY split(file.folder, "/")[4]
WHERE file.name != this.file.name
```