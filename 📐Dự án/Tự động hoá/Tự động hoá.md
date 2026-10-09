---
share: true
created: 2026-10-07T11:11
updated: 2026-10-07T11:13
---
| Phương diện | Với khách hàng  | Với doanh nghiệp  |
| ----------- | --------------- | ----------------- |
| Tốc độ      | Đáp ứng tức thì |                   |
| Quy mô      |                 |                   |
| Cá nhân hóa | Phù hợp hơn     | Tương tác tốt hơn |

```dataview
LIST rows.file.link
FROM "📐Dự án/Tự động hoá" 
GROUP BY split(file.folder, "/")[2]
WHERE file.name != this.file.name
```

