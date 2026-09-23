---
share: true
updated: 2026-09-23T13:14
created: 2026-07-19T09:59
---
```dataview
LIST rows.file.link
FROM "💸Hình thức kiếm tiền/Thiếu liêm chính. Phạm pháp/Động cơ thực hiện. Điều bị phá vỡ"
GROUP BY split(file.folder, "/")[3]
WHERE file.name != this.file.name
```
