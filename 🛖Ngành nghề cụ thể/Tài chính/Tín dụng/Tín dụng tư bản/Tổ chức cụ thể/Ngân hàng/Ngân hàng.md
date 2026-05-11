---
share: true
created: 2025-03-27T17:13
updated: 2026-04-23T17:16
---
[DIỄN ĐÀN NGÂN HÀNG](https://www.facebook.com/groups/gocnhinnganhang/)
[Banking Law in Vietnam](https://www.facebook.com/vnbankinglaw)

```dataview
LIST rows.file.link
FROM "🛖Ngành nghề cụ thể/Tài chính/Tín dụng/Tín dụng tư bản/Tổ chức cụ thể/Ngân hàng"
GROUP BY split(file.folder, "/")[6]
WHERE file.name != this.file.name
```
