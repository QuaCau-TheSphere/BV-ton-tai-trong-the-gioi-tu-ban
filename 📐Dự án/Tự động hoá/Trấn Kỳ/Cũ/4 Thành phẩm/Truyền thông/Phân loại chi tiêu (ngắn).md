---
share: true
created: 2023-09-05T16:17
updated: 2026-07-27T02:26
---

Bạn có cảm thấy chán nản, mất năng lượng vì phải tốn quá nhiều thời gian để phân loại chi tiêu cũng như các loại dữ liệu khác không? Nếu bạn là người cần phân loại tất cả các chi tiêu của mình một cách rõ ràng (việc nhắm hờ mỗi tháng chi chừng bao nhiêu tiền là không đủ với bạn), và bạn cần một chương trình:

- Tích hợp được vào hệ thống vận hành hiện tại của bạn: báo cáo ngân hàng, Google Keep, Google Sheet, Notion, Obsidian, Fibery, Odoo, v.v. 
- Cho phép bạn khai báo dữ liệu theo thói quen và cách phân loại của chính mình
- Tự động phân loại, gắn nhãn thông tin chứ không bắt bạn phải tự xử lý
- Không giam dữ liệu của bạn tại chương trình 
- Không có bất cứ quảng cáo mời mọc hoặc theo dõi dữ liệu nào
- Dùng được trên điện thoại khi không có mạng

Thì chương trình này dành cho bạn.

👉 Tìm hiểu thêm: [https://quacau.space/fn1a](https://quacau.space/fn1a)

---
F+G+%C2%BB+Project+Community

(Đây là một sản phẩm em làm để giúp đỡ một người bạn. Nay nó đã làm xong và em nghĩ nó sẽ giúp ích thêm cho mọi người. Chi tiết xem thêm ở bài: [Lời mời xây dựng một startup để làm những việc một người bạn sẽ làm](https://obsidian.quảcầu.cc/%F0%9F%93%90%20d%E1%BB%B1%20%C3%A1n/tr%E1%BA%A5n%20k%E1%BB%B3/9%20blog/l%E1%BB%9Di%20m%E1%BB%9Di%20x%C3%A2y%20d%E1%BB%B1ng%20m%E1%BB%99t%20startup%20%C4%91%E1%BB%83%20l%C3%A0m%20nh%E1%BB%AFng%20vi%E1%BB%87c%20m%E1%BB%99t%20ng%C6%B0%E1%BB%9Di%20b%E1%BA%A1n%20s%E1%BA%BD%20l%C3%A0m/?utm_source=F+G+%C2%BB+Project+Community+%C2%BB+Gi%E1%BB%9Bi+thi%E1%BB%87u+Tr%E1%BA%A5n+K%E1%BB%B3&utm_medium=social&utm_campaign=Tr%E1%BA%A5n+K%E1%BB%B3))

(Cái này thì chỉ là giới thiệu sản phẩm bình thường thôi, nhưng cái mô hình hoạt động đằng sau của nó dựa trên ý tưởng về khối dữ liệu (datacube), chiều và tensor. Thường mọi người chỉ nghe đến những khái niệm này khi làm máy học, nhưng mình nghĩ đỉnh cao nhất của nó là phải xét đến hình học xạ ảnh. Lý thuyết trường hấp dẫn (tên chính thức của thuyết tương đối) cũng dựa trên cái này. Khi nào rảnh mình sẽ viết bài về nó. Ai hứng thú thì có thể đọc trước về [Geometric Deep Learning](https://thegradient.pub/towards-geometric-deep-learning/ "Towards Geometric Deep Learning")) 
# [Phân loại thu chi bằng tiếng Việt tự nhiên](https://lậptrình.quảcầu.cc/%F0%9F%91%8Ftr%E1%BA%A5n%20k%E1%BB%B3/?utm_source=F+G+%C2%BB+Project+Community&utm_medium=social&utm_campaign=Tr%E1%BA%A5n+K%E1%BB%B3&utm_content=%C4%91%C4%83ng+l%E1%BA%A7n+1%2C+v%E1%BB%8B+tr%C3%AD+ti%C3%AAu+%C4%91%E1%BB%81%2C+%E1%BA%A3nh+keep2fibery) 
Thu chi chồng chất nhưng tốn quá nhiều thời gian để phân loại để có được một báo cáo đáng tin? Nay đã có Trấn Kỳ. Nếu bạn là người cần phân loại tất cả các chi tiêu của mình một cách rõ ràng (việc nhắm hờ mỗi tháng chi chừng bao nhiêu tiền là không đủ với bạn), và bạn cần một chương trình:

- Tích hợp được vào hệ thống vận hành hiện tại của bạn: báo cáo ngân hàng, Google Keep, Google Sheet, Notion, Obsidian, Fibery, Odoo, v.v. 
- Cho phép bạn khai báo dữ liệu theo thói quen và cách phân loại của chính mình
- Tự động phân loại, gắn nhãn thông tin chứ không bắt bạn phải tự xử lý
- Không giam dữ liệu của bạn tại chương trình 
- Không có bất cứ quảng cáo mời mọc hoặc theo dõi dữ liệu nào
- Dùng được trên điện thoại khi không có mạng

Ví dụ, với câu nhập đầu vào là:
```
thăn bò 30k lườn gà 20k (giảm giá) cho Parid ở coopmart vợ trả 
```

Chương trình sẽ tự động phân loại kết quả đầu ra cho bạn:
```
| Tên                         | Giá trị          |
| --------------------------- | ---------------- |
| Món đồ                      | thăn bò, lườn gà |
| Loại món đồ                 | Lương thực       |
| Phương thức thanh toán      | vợ trả           |
| Loại phương thức thanh toán | Tiền mặt         |
| Nơi mua                     | CoopMart         |
| Loại nơi mua                | Siêu thị         |
| Người thụ hưởng             | Parid            |
| Loại người thụ hưởng        | Gia đình         |
| Số tiền                     | 50000            |
| Ghi chú                     | giảm giá         |
```
👉 Đọc thêm giới thiệu và hướng dẫn sử dụng tại [Trấn Kỳ — Phân loại thu chi bằng tiếng Việt tự nhiên](https://lậptrình.quảcầu.cc/%F0%9F%91%8Ftr%E1%BA%A5n%20k%E1%BB%B3/?utm_source=F+G+%C2%BB+Project+Community&utm_medium=social&utm_campaign=Tr%E1%BA%A5n+K%E1%BB%B3&utm_content=%C4%91%C4%83ng+l%E1%BA%A7n+1%2C+v%E1%BB%8B+tr%C3%AD+cu%E1%BB%91i+b%C3%A0i%2C+%E1%BA%A3nh+keep2fibery) 

https://www.facebook.com/quacau.sphere/posts/pfbid072iAT8Y3zdAP5L7VGiHkmxjxQfPapaozK8fpr64nQ4uVyaKerhv2j4uqd8KMWipvl

![[Ξ Thiết lập/Ảnh/Trấn Kỳ/Keep to Fibery.png]]
[[29-10]] [[Launch]]
[[07-11]] [[Dự án xã hội, NPO, nghiên cứu khoa học, nghệ thuật, hội hoạ]] [Page not found | Facebook](https://www.facebook.com/groups/562933844569060/pending_posts/?search=&has_selection=false&is_notif_background=false&post_id=1388363565359413)
[[09-11]] [[Kingdom of Cubes]]
