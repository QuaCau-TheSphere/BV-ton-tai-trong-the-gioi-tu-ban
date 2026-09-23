---
created: 2023-05-26T14:51
updated: 2026-08-24T21:09
---
```dataview
List dateformat(file.mtime, "d MMM") 
FROM ""
SORT file.mtime DESC
LIMIT 10
```
## Tạo gần đây
```dataview
List dateformat(file.ctime, "d MMM") 
FROM ""
SORT file.ctime DESC
LIMIT 100
```
