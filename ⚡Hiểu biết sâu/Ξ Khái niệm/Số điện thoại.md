---
share: true
updated: 2026-07-29T21:31
created: 2026-04-02T23:20
aliases:
  - SĐT
  - SIM
  - Thuê bao
  - Nhà mạng
---
```dataview
LIST rows.file.link
WHERE contains(khái-niệm, [[]])
GROUP BY split(file.folder, "/")[0]
```