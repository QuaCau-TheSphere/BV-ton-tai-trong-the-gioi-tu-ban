---
share: true
created: 2023-09-05T16:17
updated: 2026-07-07T12:59
---
# Phân loại câu nhập bằng tiếng Việt tự nhiên
Bạn có cảm thấy chán nản, mất năng lượng vì phải tốn quá nhiều thời gian để phân loại chi tiêu cũng như các loại dữ liệu khác không? Nếu bạn là người cần phân loại tất cả các chi tiêu của mình một cách rõ ràng (việc nhắm hờ mỗi tháng chi chừng bao nhiêu tiền là không đủ với bạn), và bạn cần một chương trình:

* Là phần mềm tự do và mã nguồn mở
* Tích hợp được vào hệ thống vận hành hiện tại của bạn: báo cáo ngân hàng, Google Keep, Google Sheet, Notion, Obsidian, Fibery, Odoo, v.v.
* Cho phép bạn khai báo dữ liệu theo thói quen và cách phân loại của chính mình
* Tự động phân loại, gắn nhãn thông tin chứ không bắt bạn phải tự xử lý
* Không giam dữ liệu của bạn tại chương trình
* Không có bất cứ quảng cáo mời mọc hoặc theo dõi dữ liệu nào
* Dùng được trên điện thoại khi không có mạng

Thì Trấn Kỳ là chương trình dành cho bạn.

# Tính năng
## Phân loại thông tin
Ví dụ, với câu nhập đầu vào là:

```
thăn bò 30k lườn gà 20k (giảm giá) cho Parid ở coopmart vợ trả 
```

Kết quả đầu ra sẽ là:
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
Chương trình có thể tự động bắt được các giá trị trên nhờ vào cấu hình bạn đã thiết lập từ trước. Ở ví dụ này, bạn đã thiết lập như sau:
```
|Từ khoá từ câu nhập...|...thuộc nhãn phân loại...|...thuộc chiều dữ liệu|
| --- | --- | --- |
|thăn bò, lườn gà|Lương thực|Món đồ|
|vợ trả|Tiền mặt|Phương thức thanh toán|
|coopmart|Siêu thị|Nơi mua|
|Parid|Gia đình|Người thụ hưởng|
|20k, 30k|Không thiết lập|Số tiền|
|giảm giá|Không thiết lập|Ghi chú|
```
## Giá trị mặc định
Ví dụ, bạn có thể thiết lập để chương trình tự hiểu là nếu bạn không điền từ khoá gì trong chiều `Phương thức thanh toán` thì mặc định đó là `tiền mặt`.

## Tiếp nhận từ khoá chưa được khai báo một cách trực tiếp
Sẽ có những lúc bạn muốn một từ khoá nào đó chưa kịp khai báo trong cấu hình xuất ra ở kết quả. Bạn có thể thiết lập các ký tự để chương trình hiểu là dữ liệu đó nên được cho vào mục nào.

Ví dụ, bạn mới gặp `Iris` và muốn tặng `dưa hấu` cho bạn ấy. Bạn chưa kịp khai báo tên của `Iris` vào cấu hình. Bạn có thể thiết lập ký tự `@` dành cho chiều `Người thụ hưởng`. Khi đó, bạn có thể dùng câu nhập:

```
tặng dưa hấu cho @Iris 50k
```

Lúc này chương trình sẽ tự hiểu `Iris` là `Người thụ hưởng`.

Nếu sau đó không xuất hiện dấu `@` lần nữa thì từ khoá sẽ dừng khi gặp dấu cách đầu tiên. Nếu từ khoá chứa nhiều dấu cách thì bạn thêm một dấu `@` nữa ở ngay cuối. Ví dụ:

```
tặng dưa hấu cho @chị Iris@ 50k
```

Bạn có thể khai báo ký tự đứng trước khác với ký tự đứng sau. Thường gặp nhất là khi bạn cần có một ghi chú nào đó. Ví dụ:

```
tặng dưa hấu cho @chị Iris@ 50k (sau đó mới biết chị Iris dị ứng dưa hấu)
```

## Viết tắt
Ví dụ, bạn muốn viết tắt `as`, `st` cho nhanh, nhưng vẫn muốn kết quả hiện ra đầy đủ là `ăn sáng`, `siêu thị`. Bạn còn có thể dùng viết tắt cho những câu nhập phức tạp.

Ví dụ:

* `as` → `ăn sáng`
* `st` → `siêu thị`
* `xăng` → `xăng 50k`
* `trọ` → `tiền trọ 3tr chuyển khoản (vay qua nhóm Tình Thân)`

## Hiểu từ ghép
Ví dụ, nếu lúc thiết lập cấu hình bạn có khai báo ba từ khoá `bún`, `bò`, và `bún bò`, và trong câu nhập có chữ `bún bò` thì chương trình sẽ hiểu đây là một từ chứ không nhận diện nhầm là có hai từ `bún` và `bò`.

## Một từ khoá có thể thuộc về nhiều nhãn phân loại
Ví dụ, từ khoá `ăn trưa với` vừa có thể thuộc nhãn `Mối quan hệ`, vừa có thể thuộc nhãn `Thực phẩm`

## Một số ví dụ về việc tích hợp Trấn Kỳ vào hệ thống
### Nhập liệu từ Google Keep
Google Keep là một phần mềm ghi chú rất phổ biến với mọi người. Nó:
- Có trên iOS, Android và web
- Mở rất nhanh và có thể mở trong tình trạng không có mạng
- Đồng bộ nhanh chóng trên tất cả các thiết bị
- Hoàn toàn miễn phí
- Cho phép nhiều người cùng chỉnh sửa một ghi chú
- Sử dụng giọng nói
- Nhập số lượng lớn

Việc có thể nhập liệu từ Google Keep sẽ giúp cho bạn có thể nhập nhanh những khoảng chi tiêu chung với khối lượng lớn vào lúc bạn không có đầu óc để phân loại, phù hợp cho gia đình, nhóm bạn, công ty những lúc chợ búa, du lịch, tổ chức sự kiện, v.v.

Hiện tại đã có sẵn plugin nhập dữ liệu từ Google Keep và tạo bảng phân loại trên Fibery. 

### Nhập liệu từ Discord, Slack
Discord và Slack là những phần mềm nhắn tin phổ biến cho cộng đồng hoặc tổ chức. Một server sẽ có nhiều kênh (channel) để việc thảo luận được tập trung, không bị lạc chủ đề quá nhiều. Thông thường, các bộ phận trong tổ chức sẽ có một kênh riêng.

Trong quá trình thảo luận, thỉnh thoảng sẽ có những thông tin cần được phân loại và lưu vào hệ thống quản lý riêng, như quỹ hoặc công việc. Bạn có thể tạo bot để tự động gom các thông tin này ngay tại nơi thảo luận. Ví dụ:
- `$ họp 70k` → Ghi vào trong sổ quỹ rằng 70000 VND đã được chi cho việc họp
- `! sửa bug` → Ghi vào trong bảng tổng hợp công việc rằng cần sửa bug

Những thông tin như người nhập, kênh nhập cũng sẽ được ghi lại. Ví dụ, ghi `$ họp 70k` trong kênh Trấn Kỳ thì sẽ hiểu là lý do chi là để họp về Trấn Kỳ. Nhưng cũng với câu nhập đó trong kênh Cảo Thần thì sẽ hiểu là lý do chi là để họp về Cảo Thần.

# Không chỉ mỗi phân loại thu chi
Thật ra, chương trình này không hẳn nên được đặt tên là "Phân loại thu chi", vì bạn còn có thể dùng nó để phân loại nhiều thứ khác. Ví dụ:

* **Ý tưởng** : `Kĩ thuật viết văn %topic_Writing @tác_giả_a`
* **Mối quan hệ** : `Gặp @ông_A bàn về việc X, có đi ăn ở !nhà_hàng_Y 200k ck vcb`
* **Công việc** : `Công việc A cần giao cho @bạn_B liên hệ với @@đối_tác_C tại !quán_D với chi phí dự kiến 300k ck vcb và nhận output &&item_X`
* **Cảm xúc** : `xem phim:Inception thấy chấn động`
* **Sức khoẻ:**  `chạy bộ 100m, hít đất 30 cái`

# 👉 Link: tranky.deno.dev/cdddss

https://www.facebook.com/quacau.sphere/posts/pfbid072iAT8Y3zdAP5L7VGiHkmxjxQfPapaozK8fpr64nQ4uVyaKerhv2j4uqd8KMWipvl

![Máy phân loại tiền](https://daynhauhoc.s3.dualstack.ap-southeast-1.amazonaws.com/optimized/3X/3/0/3051a1b98cab382e9bcd3e5bccf81d2e973f3f17_2_1035x690.jpeg) 
![Google Keep to Fibery](https://daynhauhoc.s3.dualstack.ap-southeast-1.amazonaws.com/optimized/3X/9/9/99e14fce9d0bcda573db5aae334ad4e71bd2035f_2_1035x514.jpeg) 
![Giao diện khởi động](https://i.imgur.com/rBe2iQ9.png)

---
[[10-11]] Đăng trên [[Dạy Nhau Học]] 
[[10-11]] Đăng trên [[Tự học Data]] 
[[13-11]] chờ duyệt [Cộng đồng FOSS Việt Nam](https://www.facebook.com/groups/fossvietnam)
[[03-02]] chờ duyệt [[J2TEAM]] 
[[04-02]] [[📐 Dự án/Ξ Kết quả truyền thông/Nơi đăng/Nhóm Facebook/Dữ liệu/Khoa học dữ liệu]] 
