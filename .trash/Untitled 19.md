---
share: true
created: 2025-03-27T17:13
updated: 2025-12-11T21:04
---
Khái niệm:: 

Nguồn:: 
Về vấn đề này thì mình nghĩ Quỹ tín dụng vi mô Quả Cầu. ## Ý tưởng
Khi một người cần vay gấp thì sẽ có 2 nguồn để vay:
- Mượn từ bạn bè, người thân
- Từ các dịch vụ [[vay tín chấp]], bất kể đó là vì lợi nhuận hay phi lợi nhuận

Nhưng mượn từ bạn bè, người thân thì [[Các khó khăn của người cần vay và lý do từ chối cho vay|khó mở lời]], mà nếu đã mở lời thì cũng có [[Các lý do cho việc giúp đỡ hoặc không giúp đỡ|vô số lý do để họ không cho mượn]]. Còn đi vay dịch vụ thì có thể không đủ điều kiện để vay được số tiền cần thiết, hoặc lãi quá cao. Và kể cả có vay được thì số tiền vay được cũng có thể không đủ để xử lý vấn đề. Nhưng gốc rễ của tất cả những chuyện này thường là vì họ cần vay rất nhiều tiền.

Góp gió thành bão; giải pháp cho chuyện này là nhiều người cùng tham gia hỗ trợ họ. Nó không khác gì mở tài khoản trên [Thiennguyen.app](https://thiennguyen.app/) hay [GoFundMe](https://www.gofundme.com/) rồi vận động mọi người tham gia, chia sẻ. Nhưng khả năng cao là những người tin họ thì không đủ tiền, nên cần huy động từ những người lạ. Mà những người này thì chưa đủ quan tâm cũng như sự tin tưởng đối với họ, dù họ có thể cũng đã quan tâm đến việc làm việc tốt một cách bền vững. Giải pháp cho tình trạng này là thành lập một quỹ cổ phiếu vi mô với mục đích cho những người này vay với lãi suất thấp, phục vụ cho nhu cầu giúp đỡ nhau hơn là kiếm tiền.

Ý tưởng này được thể hiện cụ thể hơn ở [[Quỹ giúp nhau giữ tài sản thế chấp]].

## Mô hình hoạt động
### Với người đóng góp
Người đóng góp sẽ cùng với các cổ đông thảo luận cách thức tham gia của mình, có thể dưới hình thức mua cổ phiếu hoặc trái phiếu. Đơn giản nhất là như việc gửi tiết kiệm trong ngân hàng. VD:

|                                     | Lãi suất | Thời gian trả                           |
| ----------------------------------- | -------- | --------------------------------------- |
| Cho mượn                            | 0        | ∞                                       |
| Tương tự gửi tiết kiệm không kỳ hạn | 1%/năm   | Bất kỳ lúc nào (thông báo trước 1 tuần) |
| Tương tự gửi tiết kiệm              | 10%/năm  | 1 tháng/3 tháng/6 tháng/1 năm           |
| Tương tự mở thẻ tín dụng            | 2%/tháng | Hàng tháng                              |

Các cổ đông sẽ ra quyết định sẽ theo hướng dẫn trong [Sổ tay Enspiral](https://handbook.enspiral.com/agreements/decisions.html).

### Với người vay
Sự tin tưởng là cái nền tảng quan trọng nhất để cho vay. Không có sự tin tưởng thì rủi ro cao, từ đó dẫn đến khó vay hoặc lãi cao. Việc trả lời [[bản câu hỏi cho người cần được hỗ trợ thoát nợ]] sẽ giúp họ có sự tin tưởng cao hơn.

Để đảm bảo việc khả năng trả nợ cũng như thúc đẩy việc xây dựng cộng đồng và nhân rộng mô hình, những người vay sẽ được khuyến khích [[Cho vay theo nhóm bền vững hơn, ít bị xù hơn. Cho vay cá nhân nhiều lợi nhuận hơn, dễ mở rộng phạm vi hoạt động hơn|vay theo nhóm hơn là vay cá nhân]]. (Người bảo lãnh cũng là cùng nhóm với người vay.) Nhóm được vay cơ bản là một quỹ con của quỹ, chờ đợi một ngày đạt được sự đa dạng nguồn thu để có thể tách ra độc lập. Trong công tác xã hội thì đây được gọi là các nhóm đồng đẳng.

Xem thêm:: [[Làm sao cho vay mà không bị xù]]

### Hệ thống thông tin
Quỹ hiện tại đang sử dụng [[Kinh nghiệm dùng hledger|hledger]], một [chương trình kế toán chữ trơn](https://plaintextaccounting.org/What-is-Plain-Text-Accounting) để quản lý dòng tiền, nhưng có thể sẽ cần xây dựng hệ thống riêng. Để đảm bảo tính toàn vẹn và minh bạch của thông tin, quỹ sử dụng [git](https://obsidian.quảcầu.cc/📜Tài%20nguyên/Giải%20pháp%20kỹ%20thuật/Học%20Git?utm_source=Vault+B+Tồn+tại+trong+thế+giới+tư+bản+(Dự+án)&utm_medium=Vault&utm_campaign=C1&utm_content=📐Dự+án%2FGiúp+nhau+thoát+nợ%2FQuỹ%2FNgân+hàng+mini+và+mạng+lưới+cho+vay+ngang+hàng.md&utm_term=), một chương trình quản lý phiên bản. Trong tương lai sẽ hướng đến việc sử dụng giao thức Các Tín dụng Chung ([Credit Commons protocol](https://creditcommons.net/)) cho việc kết nối, liên minh giữa các quỹ. Xa hơn nữa là sử dụng mô hình biểu diễn dữ liệu (ontology) [[Valueflows]] thay vì bút toán kép như hiện tại.

Xem thêm:: [[Danh mục tài khoản và ý nghĩa bảng cân đối của quỹ]]

### Pháp lý
Một điều chắc chắn là quỹ sẽ không đăng ký làm tổ chức tài chính vi mô, vì [[Tổ chức tài chính vi mô chính thức phải có chủ là tổ chức chính trị - xã hội được thành lập hợp pháp, và khách hàng phải được xác nhận là nghèo hoặc từng nghèo]].

## Dòng tiền hiện tại
### Tài sản
Tầm 41tr, trong đó gồm các khoản vay từ thẻ tín dụng, đến từ đóng góp của Nhật:

| Khoản vay                                                                                               | Hạn mức |
| ------------------------------------------------------------------------------------------------------- | ------- |
| [SeaBank GRB Elite](https://www.seabank.com.vn/ca-nhan/the/the-tin-dung-quoc-te/the-tin-dung-brg-elite) | 30tr    |
| [OCB Lifestyle](https://www.ocb.com.vn/vi/ca-nhan/the/the-tin-dung/ocb-mastercard-lifestyle)            | 6tr     |
| Vietcombank JCB                                                                                         | 5tr     |
| Momo ví trả sau                                                                                         | 3tr     |

### Nhu cầu từ những người cần vay
Mỗi tháng 15tr

## Công việc
- Hỗ trợ người cần vay hoàn thành [[Bản câu hỏi cho người cần được hỗ trợ thoát nợ]] để tăng sự minh bạch, giải trình. Hướng đến sự tự trị dữ liệu để người cần vay có thể chủ động xây dựng quỹ tín dụng của họ với các mối quan hệ của mình
- Đại diện giải đáp thắc mắc giữa các bên để giảm sự nhức đầu 
- Hỗ trợ [[thương lượng với chủ nợ]] để giảm lãi
- Xây dựng [[Danh mục tài khoản và ý nghĩa bảng cân đối của quỹ|Danh mục tài khoản và ý nghĩa bảng cân đối của quỹ]] một cách trực quan 
- [[Các cách thức nâng hạn mức thẻ tín dụng|Hỗ trợ nâng hạn mức, điểm tín dụng]]
- Hỗ trợ [[📜Tài nguyên/Ý tưởng kiếm tiền/Ý tưởng/Ý tưởng|tạo sinh kế, thu nhập, dòng tiền]] và [[Mở rộng mối quan hệ|mở rộng mối quan hệ]]
- Kết nối trực tiếp giữa người vay và người cho vay. Nếu người vay xù thì quỹ không phải trả cho người cho vay. Hình thức này không khác gì một sàn cho vay ngang hàng

## Nơi thảo luận
![](https://i.imgur.com/RNcEBe4.png)
![](https://imagizer.imageshack.com/a/img923/1273/jQAnX6.png)

Nếu sau này mình nghĩ ra được thêm điều gì mới thì sẽ cập nhật ghi chú tại https://doi-thoai.deno.dev/GC.f.1
