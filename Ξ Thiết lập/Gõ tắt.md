---
created: 2023-05-26T14:51
updated: 2025-08-16T22:05
---
Nhu cầu:: 		nc, dy, tl
Nhu cầu dẫn tới:: 		ncdt, ch, mt
Điểm mạnh:: 		đm, dm

Thành quả cần có:: 		tqcc
Thành quả hỗ trợ:: 		tqht
Thành phẩm:: 		tp, kn, xt
Giải pháp gợi ý:: 		gp

Thách thức:: 		tt, kk

Khái niệm:: 		kn
Lý do:: 		ld
Liên quan:: 		lq
Câu hỏi:: 		ch
Xem thêm:: 		xt
Mâu thuẫn với:: 		mtv

Nguồn:: 		ng
Trích từ:: 		tt
Hỏi thêm:: 		ht
Tham khảo:: 		tk

Nhu cầu người dùng:: 		nl
Phù hợp cho nhu cầu:: 		nl
Đáp ứng yêu cầu:: 		nl
Yêu cầu đầu vào:: 		yc
Loại chương trình:: 		lct
Tên chương trình:: 		tct
Đồng thời có thêm tính năng:: 		tn
Tính năng:: 		tn

Hình thức:: 		ht
# Code nhanh
## Bảng
| Thành quả mong muốn | Giả thiết | Công việc |\n| ------------------- | --------- | --------- |		tqmm
|Công việc| Thành quả mong muốn | Giả thiết |\n| ------------------- | --------- | --------- |		cv
| Giải pháp gợi ý | Hành vi cần đạt được | Giả thiết | Công việc |\n| --------------- | -------------------- | --------- | --------- |		gp

## Dataview
```dataview\nLIST\nFROM |\nWHERE\n```		dtv
```dataview\nLIST rows.file.link\nFROM |\nGROUP BY split(file.folder, "/")[3]\nWHERE file.name != this.file.name\n```		dtvv
Các note cũng nói về chủ đề này:\n```dataview \nList\nWhere contains(file.name,split(this.file.name," \(")[0]) and file.path!=this.file.path\n```		cungchude

(#đct-🔥🔥Phảilàmngay or #đct-🔥/muốnlàmngay or #đct-🔥/nênlàmngay)		PNM, dct1
#đct-🍃/sớmphảilàm or #đct-🍃/đợingườinhậnlàm		cc, dct2

## Mermaid
```mermaid\ngantt\ndateFormat  D/M H:m\naxisFormat  %d/%m\ntitle       Biểu đồ mẫu\n\nsection Phần A\nViệc 1                 : 5/5 4:30, 3d\nViệc 2                 : 5d \n\nsection Phần B\nMilestone            : milestone, 4/5 04:30\n```		mmgantt
```mermaid\nflowchart TB\nc1["This ❤ Unicode"]-->a2\nsubgraph one\na1-->a2\nend\n\nsubgraph two\nb1-->b2\nend\n\nsubgraph three\nc1-->c2\nend\n```	 		mmflowchart

[label="|"]		ll

> [!Tip] Phím tắt\n> <kbd>|</kbd>		pt

> [!Tip] Terminal\n> <kbd>|</kbd>		tm
