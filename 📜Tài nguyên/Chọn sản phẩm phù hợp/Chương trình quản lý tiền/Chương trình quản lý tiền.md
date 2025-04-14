---
share: true
created: 2023-09-05T16:17
updated: 2025-04-14T12:51
description: Điểm giống và khác nhau giữa các chương trình quản lý tiền. Quang cảnh và sơ đồ giữa chúng.
alias:
  - Điểm giống và khác nhau giữa các chương trình quản lý tiền
  - Quang cảnh giữa các chương trình quản lý tiền
  - Sơ đồ giữa các chương trình quản lý tiền
  - Mối quan hệ giữa các khái niệm
cssClass: wide-table
---
## Mối quan hệ giữa các khái niệm
- Nhu cầu người dùng sẽ đòi hỏi tính năng
- Tính năng sẽ đòi hỏi yêu cầu đầu vào 
- Yêu cầu đầu vào đòi hỏi nhu cầu người dùng
<br>
- Tính năng sẽ quyết định loại chương trình
- Chương trình đáp ứng một tổ hợp các nhu cầu của người dùng bằng một tổ hợp các tính năng 

```mermaid
flowchart LR
	subgraph Người dùng
		1["1 Nhu cầu người dùng"]
		2["2 Yêu cầu đầu vào"]
	end
	subgraph Sản phẩm
		3["3 Tính năng"]
		4["4 Loại chương trình"]
		5["5 Tên chương trình"]
	end

1-->3
4-->5
5-->3

3-->2-- Phù hợp cho nhu cầu -->1
1-- Phù hợp cho nhu cầu -->1
2-- Đáp ứng yêu cầu --> 2
3-- Đồng thời có thêm tính năng --> 3

3~~~4
style 1 fill:lightgreen
style 3 fill:lightgreen
```

## Danh mục
```dataview
list rows.file.link
from "📜Tài nguyên/Chương trình quản lý tiền"   
group by split(file.folder, "/" )[3] 
```

- Có những chương trình không biết nên phân loại thế nào. Tốt nhất là liệt kê tính năng của nó
- Khi một "nhu cầu" của người dùng thực ra là do không có nhu cầu thì nó nên là gì?
- Khi một "tính năng" của chương trình thực ra là do không có tính năng thì nó nên là gì?

https://www.gamehoa.org/p/gamification-trong-nganh-tai-chinh?utm_source=post-email-title&publication_id=174112&post_id=158754486&utm_campaign=email-post-title&isFreemail=true&token=eyJ1c2VyX2lkIjo0MDM4MzA5NiwicG9zdF9pZCI6MTU4NzU0NDg2LCJpYXQiOjE3NDM0MjYwOTAsImV4cCI6MTc0NjAxODA5MCwiaXNzIjoicHViLTE3NDExMiIsInN1YiI6InBvc3QtcmVhY3Rpb24ifQ.bVSVfF__iLc-Zp1LdVJMY0zDJbwsJFcMEGlnCywujjo&r=o1jso&triedRedirect=true&utm_medium=email