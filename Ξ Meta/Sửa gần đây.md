---
created: 2023-05-26T14:51
updated: 2026-11-17T15:31
share: true
---
## 10 ghi chú sửa gần đây
```dataview
List dateformat(file.mtime, "d MMM") 
FROM ""
SORT file.mtime DESC
LIMIT 10
```

## 10 ghi chú tạo gần đây
```dataview
List dateformat(file.ctime, "d MMM") 
FROM ""
SORT file.ctime DESC
LIMIT 100
```
