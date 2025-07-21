---
share: true
created: 2024-10-29T19:32
updated: 2025-07-09T17:54
alias:
  - Công việc của nhóm giúp nhau kiếm tiền
  - kiếm tiền
  - chạy chỉ tiêu, thuê ngoài (outsource), các công việc thời vụ (freelancer), cộng tác viên
---
> [!NOTE] Đọc trước bài [[Giúp nhau kiếm tiền]] để biết thêm chi tiết

Nhóm có thể được gọi là "nhóm chạy chỉ tiêu (KPI)", "nhóm thuê ngoài (outsource)", "nhóm làm các công việc thời vụ (freelancer)", "nhóm cộng tác viên", "nhóm chơi chính sách" đều được. Đây là những công việc nhóm có làm:

### Công việc trong [[📜Tài nguyên/Ý tưởng kiếm tiền/3 Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/GM Mall/GM Mall|GM Mall]]
```dataview
table số-tiền-kiếm-được as "Số tiền kiếm được", mô-tả-công-việc as "Mô tả công việc"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/3 Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/GM Mall"
WHERE file.name != this.file.name
WHERE !contains(file.name, "GM Mall" )
```

### Công việc trong [[VNPAY|VNPAY]]
```dataview
table số-tiền-kiếm-được as "Số tiền kiếm được", mô-tả-công-việc as "Mô tả công việc"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/3 Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/VNPAY"
WHERE file.name != this.file.name
WHERE !contains(file.name, "VNPAY" )
```

### Công việc tìm người
```dataview
table số-tiền-kiếm-được as "Số tiền kiếm được", mô-tả-công-việc as "Mô tả công việc"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/3 Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/Tìm người"
WHERE file.name != this.file.name
WHERE !contains(file.name, "Tuyển dụng" )
```

### Công việc [[Làm nhân sự ảo]] khác
- [[📜Tài nguyên/Ý tưởng kiếm tiền/3 Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/Làm nhân sự ảo/Bảo hiểm/Bảo hiểm|Làm đại lý bảo hiểm ảo]]
- [[📜Tài nguyên/Ý tưởng kiếm tiền/3 Ý tưởng/Công việc thời vụ, cộng tác viên/Nhóm chạy chỉ tiêu/Làm nhân sự ảo/FE Credit|Làm nhân viên ảo FE Credit]]

Xem thêm:: [[Công việc thời vụ, cộng tác viên]]
