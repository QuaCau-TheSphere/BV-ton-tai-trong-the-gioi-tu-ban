---
share: true
created: 2023-09-05T16:17
updated: 2025-09-16T20:02
---
Đề bài:
> Ngành hàng nào dùng loa sẽ ra được 500 giao dịch/tháng?
---

Câu hỏi đó nằm trong một câu hỏi lớn hơn:
> Làm sao để đưa VNPAY vào luồng hoạt động của cửa hàng?

---
VNPAY cung cấp giải pháp về trung gian thanh toán. Nhưng một cửa hàng không mở ra chỉ để thanh toán. <span class="fragment red">Thanh toán chỉ là một khâu trong vận hành.</span>

---

Cho nên, câu hỏi cần được trả lời là:
> Làm sao để VNPAY đem lại giá trị cho chủ cửa hàng, không chỉ lúc ở khâu giao dịch mà còn ở những khâu khác? Không chỉ ở cửa hàng mà còn là lúc không ở cửa hàng?
---

Điều đó dẫn đến câu hỏi:
> Trước và sau giao dịch, chủ cửa hàng cần gì?
---

# Trước và sau giao dịch, chủ cửa hàng cần gì?
----
## Trước giao dịch 
(Làm gì để có tiền?) <!-- .element: class="fragment" -->
- Lên kế hoạch, tạo sản phẩm:<!-- .element: class="fragment" -->
    - Thu thập dữ liệu, tự động hoá việc xử lý dữ liệu, xây dựng kho dữ liệu<!-- .element: class="fragment" -->
    - Hệ thống quản lý tài nguyên, kiến thức, dự án<!-- .element: class="fragment" -->
- Thu hút khách hàng: tạo web, theo dõi lưu lượng người truy cập<!-- .element: class="fragment" -->

----
## Sau giao dịch
(Có tiền rồi thì làm gì?) <!-- .element: class="fragment" -->
- Tạo hạch toán kế toán, quản lý công nợ <!-- .element: class="fragment" -->
- Lên kế hoạch, tạo sản phẩm: <!-- .element: class="fragment" -->
    - Thu thập dữ liệu, tự động hoá việc xử lý dữ liệu, xây dựng kho dữ liệu <!-- .element: class="fragment" -->
    - Hệ thống quản lý tài nguyên, kiến thức, dự án <!-- .element: class="fragment" -->
- Quản lý chi tiêu của bản thân, gia đình. Lên kế hoạch tài chính <!-- .element: class="fragment" -->

---
# Các SME nói gì về hạch toán kế toán?
----
```quote
quote: Đa phần chủ doanh nghiệp chỉ nghĩ là họ cần bán hàng, chứ không nghĩ là mình cần quản lý tiền. Kế toán chỉ giải quyết vấn đề thuế, hoá đơn, chứ không cho biết dòng tiền hiện nay thế nào.
author:
  name: Trần Nam
  title: Trưởng phòng Thông tin và Phụ huynh
  org: Trường Phổ Thông Liên Cấp Song Ngữ Maya
  image: Ảnh/Trần Nam.jpg
```
----
```quote
quote: Khi nhập hàng, phát sinh chi phí thì chủ cửa hàng chỉ ghi chú trong tin nhắn. Chi phí họ không ghi nhận lại luôn. Họ chỉ canh số tiền họ thu được, kiểu nhìn lướt được khoảng khoảng 5tr là đủ. Đối với họ việc quản lý dòng tiền không còn là điểm đau nữa. Nhưng sau một thời gian nhìn lại thì không có lời.
author:
  name: Mai Đức Quang
  title: Giám đốc Tài chính
  org: Thương hiệu Trà sữa A Lỳ
  image: Ảnh/Mai Đức Quang.jpg
```
----
```quote
quote: Ngành kế toán của chị trước giờ làm thủ công. Doanh nghiệp hiện tại của chị dùng Misa đưa cho kế toán cũng mất khá nhiều thời gian. Các giao dịch thường lặp đi lặp lại hàng tháng, cần tới 3, 4 bạn kế toán để ghi chép lại. Bộ máy cồng kềnh mà mức độ chính xác không cao.
author:
  name: Trần Thuý Hoà
  title: Giám đốc Tài chính
  org: Chuỗi cửa hàng Révi Coffee & Tea
  image: Ảnh/Trần Thuý Hoà.jpg
```
---
Điều đó dẫn đến câu hỏi:
> Tại sao VNPAY không giúp các cửa hàng, doanh nghiệp quản lý được dòng tiền hiệu quả hơn?

<small class='fragment'>(Nhìn xem đối thủ đang làm gì: Momo đang cho trả tiền cho khách hàng [phân loại các giao dịch chưa phân loại](https://www.momo.vn/tin-tuc/khuyen-mai/lam-nhiem-vu-phan-loai-giao-dich-100-co-qua-0d-6156))</small>

----
## Hành vi mới
<span class="fragment">Chủ cửa hàng mỗi khi đi mua nguyên vật liệu (tức là khi họ là khách hàng của một cửa hàng khác) </span><span class="fragment">chỉ cần quét mã và nhập liệu nội dung hạch toán ngay trên app</span> <span class="fragment">với viết tắt theo thói quen và sắp xếp của riêng họ,</span> <span class="fragment">là sẽ có bản hạch toán hoàn chỉnh trên Merchant View.</span>

----
## Hệ quả
Họ sẽ có thêm động lực để chỉ quẹt mã VNPAY, và mong muốn cửa hàng đầu mối của mình có mã VNPAY. <!-- .element: class="fragment" -->

<span class="fragment">Đây chính là <span class="red">phương thức hữu hiệu nhất</span> để các chủ cửa hàng này tiếp nhận VNPAY và trở thành phương thức thanh toán chính của chủ cửa hàng.</span> 

---

### Các hình thức chăm sóc, thu hút sự quan tâm 
Với cửa hàng chưa có nhiều quan tâm tới việc kiểm soát dòng tiền: <!-- .element: class="fragment" -->
  - Giới thiệu công cụ giúp quản lý dòng tiền (sử dụng cấu hình có sẵn) <!-- .element: class="fragment" -->
  - Tổ chức các buổi thảo luận để kết nối, giới thiệu giải pháp cho các nhu cầu khác <!-- .element: class="fragment" -->

Với doanh nghiệp có nhu cầu tuỳ chỉnh theo đặc thù cửa hàng: <!-- .element: class="fragment" -->
  - Cử người đến hướng dẫn thiết lập cấu hình <!-- .element: class="fragment" -->

---

```quote
quote: Để có thể thiết kế một giải pháp một cách nhanh chóng và tự tin, ta cần được thử nghiệm ý tưởng mới và kiểm tra giả thiết ngay khi chúng vừa được nghĩ ra
author:
  name: Bret Victor
  title: Nhà nghiên cứu về công cụ nghĩ
  org: Dynamic Land
  image: https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F9a295812-c966-4ad9-87a0-49519264ada0_1120x600.webp
```

---
# Công nghệ để tạo hạch toán kế toán tự động
----
Hiện tại trên thị trường, có vẻ như chỉ có duy nhất Trấn Kỳ là có công nghệ lõi có thể tự động tạo hạch toán kế toán bằng tiếng Việt, rẻ và chính xác. 
![Keep to Fibery](Ảnh/Keep%20to%20Fibery.png)

---
# Thử dùng Trấn Kỳ
Bạn có thể thử dùng Trấn Kỳ ngay ở slide sau. Để thoát demo và đọc tiếp slide:
- Trên máy tính: bấm vào nút qua trang tiếp theo ở góc phải phía dưới, hoặc bấm <kbd>Esc</kbd>
- Trên điện thoại: kéo hết trang 
---
<section data-background-iframe="https://tranky.deno.dev"
          data-background-interactive>
</section>

---
## Tài liệu
- [Demo Trấn Kỳ](https://tranky.deno.dev/?utm_source=VNPAY+(Tài+liệu+tham+khảo)&utm_medium=Tập+tin&utm_campaign=&utm_content=&utm_term=) 
- [Lý do viết Trấn Kỳ](https://obsidian.quảcầu.cc/📐%20Dự%20án/Trấn%20Kỳ/9%20Blog/Lý%20do%20viết%20Trấn%20Kỳ?utm_source=VNPAY+(Tài+liệu+tham+khảo)&utm_medium=Tập+tin&utm_campaign=C1+Trấn+Kỳ&utm_content=&utm_term=) 
- [App ghi chép chi tiêu cho người dùng cuối với lõi là Trấn Kỳ](https://www.figma.com/proto/9M7qILhSJRZKvKvJf9pYpG/Slide?node-id=1-2&t=f48VKem02ha5ZTjz-1&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A2&share=1) 

---

## Liên hệ
- Lý Minh Nhật: lyminhnhat911@gmail.com
- Quả Cầu: quacau.thesphere@gmail.com
- [Mã nguồn slide](https://doi-thoai.deno.dev/fI.3Y.1) 
- Discord của nhóm phát triển Trấn Kỳ: [https://discord.com/invite/jWTk4EHFK2](https://doi-thoai.deno.dev/discordQC.1g.1) 

---
# Phụ lục
Ý kiến từ chị Trần Thuý Hoà
----
## View người dùng
### Điểm mạnh
1. Giúp đối soát tiền thu với các hóa đơn bán hàng nhanh hơn do qua 1 hệ thống trung gian thanh toán có thể map số bill với tiền về
2. Đẩy mạnh cashless – cái này nhiều doanh nghiệp cũng phát triển
3. Ở giai đoạn đầu VNPAY và các cổng thanh toán burn tiền thì có nhiều khuyến mại
----
### Điểm yếu
1. Đúng như em nói, thanh toán chỉ là 1 khâu trong vận hành và người dùng sẽ mong muốn 1 giải pháp tổng thể hơn (nhập hàng – thanh toán cho nhà cung cấp – bán hàng – thu tiền) – và với VNPAY thì chỉ giải quyết được khâu thu tiền 
2. Tiền về chậm, tiền không nổi ngay về tài khoản khách hàng (trước đây là T+2, chị không rõ là bây giờ có nhanh hơn không)
3. Chi phí giao dịch phải trả cho VNPAY 
----
## View của VNPAY
1. Tại sao họ lại chỉ làm thanh toán: họ cần xây dựng mạng lưới merchant để triển khai các dịch vụ khác (ví điện tử, ….) và end game có thể là cho vay (thông thường sẽ là giải pháp này thì mới kiếm được tiền)
Các cty giải pháp thanh toán thực tế là đang burn tiền để xây dựng 1 văn hóa thanh toán mới trên thị trường, nhưng thực tế thì VIETQR của NAPAS lại đang chiếm vị thế hơn cả vì không mất phí giao dịch, tiền về luôn và quan trọng hơn là NAPAS có hậu thuẫn từ nhà nước. 
----
2. Góc nhìn vv cung cấp giải pháp tổng thể ERP: thường thì các công ty làm dịch vụ thanh toán họ sẽ ko nghĩ đến tự build giải pháp ERP, mà xu hướng là tìm partnership ở mảng đó để kết nối. (Ví dụ Momo kết nối với Cukcuk của Misa để liên thông hệ thống thanh toán). Tuy nhiên, việc kết nối hiện tại rất phân mảnh, tùy vào relationship của các bên và còn có yếu tố thượng tầng bên trên liên quan đến lợi ích của nhà đầu tư.
----
## View của nhà điều hành doanh nghiệp
1. Hiện tại không có giải pháp nào tối ưu về toàn bộ khâu từ đầu vào đến đầu ra  Các doanh nghiệp có xu hướng test & learn, đấu nối các giải pháp với nhau để cho hiệu quả tối ưu nhất. Và yếu tố quan trọng nhất là các giải pháp có khả năng Integrate với nhau (cái này đang là rào cản lớn nhất) 
----
2. Về giải pháp thanh toán: lựa chọn bên cung cấp với chi phí thấp, tiền về nhanh và có khả năng đối chiếu tự động giữa hóa đơn bán hàng và tiền thu về, tỷ lệ drop các giao dịch thấp để không ảnh hưởng đến trải nghiệm khách hàng, có khả năng tích hợp nhiều hình thức thanh toán (ví điện tử, ngân hàng, thẻ)
----
## GIẢI PHÁP CỦA TRẤN KỲ vv phân loại dòng tiền với doanh nghiệp và cá nhân
- Với doanh nghiệp: Có tiềm năng chạy song song với các hệ thống quản trị hiện tại nếu có thể kết nối được (Ví dụ: từ bảng ghi chép của Trấn Kỳ generate ra bảng thu-chi tiền  Đẩy được vào hệ thống quản lý cửa hàng  đẩy tự động vào hệ thống kế toán)
----
- Với cá nhân: có thể triển khai trước như 1 App quản lý tài chính cá nhân 
 - Tạo bảng ghi chép tự động các khoản chi tiêu
 - AI phân tích chi tiêu hàng tháng  đưa ra các advise về trend chi tiêu, suggestion cho kỳ sau
