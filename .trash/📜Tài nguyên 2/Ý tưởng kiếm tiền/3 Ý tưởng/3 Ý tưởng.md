---
share: true
created: 2023-11-24T16:59
updated: 2025-03-25T22:40
alias:
  - Kiếm tiền nhanh
  - Kiếm dự án thuê ngoài
  - Mở các buổi chia sẻ lớp học ngắn buổi huấn luyện
  - Làm nhân viên ăn lương
  - Đầu tư kinh doanh bán hàng
  - Tạo lợi nhuận
  - Một số ý tưởng kiếm tiền
  - Tạo sinh kế, thu nhập, dòng tiền
  - So sánh các yêu cầu đầu vào của các ý tưởng kiếm tiền
description: Các ý tưởng kiếm tiền và yêu cầu đầu vào của chúng
title: Một số ý tưởng kiếm tiền
---
[How to Pick a Career (That Actually Fits You) — Wait But Why](https://waitbutwhy.com/2018/04/picking-career.html)

> [!tip] Bạn cũng có thể thử [[Bao nuôi|dịch vụ bao nuôi]] này

## Công việc thời vụ

```dataview
Table yêu-cầu-đầu-vào as "Yêu cầu đầu vào"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Công việc thời vụ, cộng tác viên" 
WHERE file.name != this.file.name
WHERE !contains(file.folder, "ảo" )
```

## Các buổi chia sẻ, lớp học, khoá đào tạo, buổi huấn luyện
Nếu bạn kiếm được người sẵn sàng trả tiền để được hướng dẫn những cái này thì bạn sẽ được nhận toàn bộ số tiền họ trả.
```dataview
Table yêu-cầu-đầu-vào as "Yêu cầu đầu vào"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Các buổi chia sẻ, lớp học, khoá đào tạo, buổi huấn luyện" 
WHERE file.name != this.file.name
```

## Việc chính thức trong công ty
```dataview
Table yêu-cầu-đầu-vào as "Yêu cầu đầu vào"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Việc chính thức trong công ty" 
WHERE file.name != this.file.name
```

## Gia công giải pháp
Đây là các giải pháp đã được đặt hàng. Nếu bạn kiếm được người sẵn sàng trả tiền để được có những cái này thì chúng ta sẽ cùng thoả thuận số tiền mỗi người được nhận. 
```dataview
Table yêu-cầu-đầu-vào as "Yêu cầu đầu vào"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Gia công giải pháp" 
WHERE file.name != this.file.name
```

## Tự kinh doanh, đầu tư, bỏ vốn
```dataview
Table yêu-cầu-đầu-vào as "Yêu cầu đầu vào"
FROM "📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Tự kinh doanh, đầu tư" 
WHERE file.name != this.file.name
SORT yêu-cầu-đầu-vào desc
```


## Nơi thảo luận
Tất cả các chủ đề có nhãn "💸Tiền bạc":
[![](https://i.imgur.com/4rJvMNB.png)](https://discord.com/channels/898550123007709204/1219199843583524934)
