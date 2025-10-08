---
share: true
created: 2024-11-23T20:48
updated: 2025-10-08T11:09
aliases:
  - Làm online
title: Công việc làm qua mạng
---
[Cảnh báo lừa đảo việc làm online \| VTV24 - YouTube](https://youtu.be/5jeACyUQtVE?si=G6Z0MrLCxMQGAFxF)
[[Lừa đảo tuyển dụng, môi giới việc làm]]

## [[Công việc thời vụ, cộng tác viên]]
Các công việc này thường có thể kết hợp cùng với các công việc yêu cầu ngồi một chỗ và hay ngắt quãng sự tập trung, như bảo vệ, soát vé, lễ tân, hướng dẫn viên du lịch, trông cửa hàng, v.v.

### [[Tìm người|Công việc tìm người]]
```dataview
table mô-tả-công-việc as "Mô tả công việc", số-tiền-kiếm-được as "Số tiền kiếm được"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Công việc thời vụ, cộng tác viên/Tìm người"
WHERE contains(nơi-làm-việc, [[]])
```

### Công việc khác
```dataview
table mô-tả-công-việc as "Mô tả công việc", số-tiền-kiếm-được as "Số tiền kiếm được"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Công việc thời vụ, cộng tác viên"
WHERE !contains(file.folder, "Nhóm chạy chỉ tiêu")
WHERE !contains(file.folder, "Tìm người")
WHERE contains(nơi-làm-việc, [[]])
```

### Công việc cho [[Nhóm chạy chỉ tiêu|Nhóm chạy chỉ tiêu]]
> [!attention] Hiện tại các công việc ở mục này đang ngừng tuyển

```dataview
table mô-tả-công-việc as "Mô tả công việc", số-tiền-kiếm-được as "Số tiền kiếm được"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu"
WHERE contains(tính-chất-công-việc, [[]])
```

## Công việc tự do
Các công việc này thường đòi hỏi sự tập trung cao, khó mà kết hợp làm với một công việc khác được
- [[Kiếm tiền trực tuyến (MMO)]]
- [[Làm nhân viên của nhiều công ty cho làm việc từ xa cùng lúc]]
- [[Kinh doanh online]]
## Nơi thảo luận
Vào Discord Quả Cầu, kênh "Kiếm tiền nhanh" để thảo luận:
![](https://i.imgur.com/PffcLkI.png)
