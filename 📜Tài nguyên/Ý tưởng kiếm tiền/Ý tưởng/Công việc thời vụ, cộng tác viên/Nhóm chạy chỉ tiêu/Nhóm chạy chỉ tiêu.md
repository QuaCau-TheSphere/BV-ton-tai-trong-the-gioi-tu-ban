---
share: true
created: 2024-10-29T19:32
updated: 2025-10-08T10:05
aliases:
  - Công việc của nhóm giúp nhau kiếm tiền
  - kiếm tiền
  - chạy chỉ tiêu, thuê ngoài (outsource), các công việc thời vụ (freelancer), cộng tác viên
---
> [!NOTE] Đọc trước bài [[Giúp nhau kiếm tiền]] để biết thêm chi tiết

Nhóm có thể được gọi là "nhóm chạy chỉ tiêu (KPI)", "nhóm thuê ngoài (outsource)", "nhóm làm các công việc thời vụ (freelancer)", "nhóm cộng tác viên", "nhóm chơi chính sách", "nhóm bào tiền" đều được. Đây là những công việc nhóm có làm:

### Công việc trong [[sàn thương mại điện tử]]
```dataview
table số-tiền-kiếm-được as "Số tiền kiếm được", mô-tả-công-việc as "Mô tả công việc"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/Sàn thương mại điện tử"
WHERE file.name != this.file.name
WHERE !contains(file.name, "Sàn thương mại điện tử" )
```

### Công việc trong [[VNPAY|VNPAY]]
```dataview
table số-tiền-kiếm-được as "Số tiền kiếm được", mô-tả-công-việc as "Mô tả công việc"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/VNPAY"
WHERE file.name != this.file.name
WHERE !contains(file.name, "VNPAY" )
```

### Công việc [[Làm nhân sự ảo]] khác
- [[📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/Làm nhân sự ảo/Bảo hiểm/Bảo hiểm|Làm đại lý bảo hiểm ảo]]
- [[📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/Làm nhân sự ảo/FE Credit|Làm nhân viên ảo FE Credit]]

Xem thêm:: [[Công việc thời vụ, cộng tác viên]]

## Nơi thảo luận
Vào Discord Quả Cầu, kênh "Kiếm tiền nhanh" để thảo luận:
![](https://i.imgur.com/PffcLkI.png)
