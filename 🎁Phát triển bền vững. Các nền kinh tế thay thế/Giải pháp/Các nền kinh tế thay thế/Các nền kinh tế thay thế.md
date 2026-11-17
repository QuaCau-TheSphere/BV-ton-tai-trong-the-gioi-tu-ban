---
share: true
updated: 2026-10-24T22:04
created: 2026-10-24T20:58
---
[[Chi phí giao dịch quyết định cơ chế điều phối nào được lựa chọn]]

```dataview
LIST rows.file.link
FROM "🎁Phát triển bền vững. Các nền kinh tế thay thế/Giải pháp/Các nền kinh tế thay thế" 
GROUP BY split(file.folder, "/")[3]
WHERE file.name != this.file.name
```
