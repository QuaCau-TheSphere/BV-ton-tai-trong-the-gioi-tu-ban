---
share: true
created: 2023-10-28T22:41
updated: 2024-11-18T13:20
---
[[Trấn Kỳ (quang cảnh thị trường)|Tính năng của Trấn Kỳ]]: giúp tạo metadata, tự động hoá việc nhập liệu và phân loại, gắn nhãn, để biến dữ liệu phi cấu trúc thành dữ liệu có cấu trúc

```dataview
LIST rows.file.link
FROM "📐 Dự án/Trấn Kỳ" 
WHERE file.name!=this.file.name
WHERE !contains(file.folder, "Cũ" )
GROUP BY split(file.folder, "/")[2]
```

## Nơi thảo luận
![](https://i.imgur.com/TDK2yri.png)