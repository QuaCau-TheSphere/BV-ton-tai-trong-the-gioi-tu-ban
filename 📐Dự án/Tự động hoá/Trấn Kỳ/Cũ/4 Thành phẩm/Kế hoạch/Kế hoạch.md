---
share: true
created: 2023-11-05T21:09
updated: 2026-07-27T02:26
title: Kế hoạch
aliases:
  - Các bản kế hoạch
  - Kế hoạch tổng
---

```dataview
List rows.file.link
FROM "📐 Dự án/Trấn Kỳ/4 Thành phẩm/Kế hoạch" 
WHERE file.name!=this.file.name
group by split(file.folder,"/" )[4] 
```
