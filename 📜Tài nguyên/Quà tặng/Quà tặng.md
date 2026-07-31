---
share: true
created: 2024-11-12T14:33
updated: 2026-07-27T02:48
---
[[Nền kinh tế quà tặng]]
[[Sống vừa đủ, bền vững, tiết kiệm]]

```dataview
LIST rows.file.link
FROM "📜Tài nguyên/Quà tặng"
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```