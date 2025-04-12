---
share: true
created: 2023-09-05T16:17
updated: 2024-11-04T16:38
---
Yêu cầu đầu vào:: [[Biết lập trình]]
Hình thức:: [[Gia công giải pháp]]

## Mô tả chung
- **Nhu cầu:** người khuyết tật khi có nhu cầu di chuyển chi phí tốn kém
- **Giải pháp:** viết app kết nối họ và người sẵn sàng hỗ trợ, tương tự như Grab

![](https://upload.wikimedia.org/wikipedia/commons/0/0a/Le_Dai_Hanh_street%2C_ph%C6%B0%E1%BB%9Dng_15%2C_Qu%E1%BA%ADn_11%2C_TPHCM%2C_Vi%E1%BB%87t_Nam_-_panoramio.jpg)

### Câu hỏi
#### Câu hỏi về chiến lược
> [!question] Tại sao đối tượng thụ hưởng lại là nkt mà không phải cái khác? 
> Vì nhà đầu tư tiếp xúc với họ nhiều hơn 

> [!question] Tại sao lại là về hỗ trợ di chuyển cho họ mà không phải là cái khác?
>❓Vì đây là nhu cầu họ cần nhất?

> [!question] Tại sao không dành nguồn lực để vận động chính sách cho việc cải thiện dịch vụ công cho họ?
> Không đủ nguồn lực vận động chính sách

- Khả năng điều phối hiện nay là thế nào? Vì sao phải cần tới app mà không thuê một người để điều phối thủ công?
- Có những loại xe máy 3 bánh được thiết kế cho người khuyết tật, sao họ không mua về dùng?
- Viết xong rồi thì sẽ duy trì việc vận hành nó thế nào?

#### Câu hỏi về sản phẩm
- Có cần làm app cho đt ko hay làm web app là được?

> [!question] Có cần phải có bản đồ không hay có thể mặc định là người dùng chỉ cần đọc địa chỉ là đã biết là mình có thể đến được rồi?
> Cần có bản đồ, vì dành cho cả người ở trọ mới lên thành phố

#### Câu hỏi về hành vi người dùng
- Tài xế có lý do gì để mở app để đón khách?
- Nếu trên bản đồ có nhiều người cùng thể hiện sẵn sàng giúp đỡ thì họ có [[Hiện tượng khuếch tán trách nhiệm, người ngoài đứng nhìn]] không?

## Yêu cầu
### Yêu cầu chức năng
- Có bản đồ thể hiện vị trí các bên
- Cập nhật thời gian thực
- Có tài khoản cho người khuyết tật và tài khoản cho tài xế:
    - Tài khoản cho người khuyết tật:
        - Thông tin cá nhân
        - Loại phương tiện phù hợp cho loại khuyết tật của mình
        - Đặt chuyến:
            - Xác định điểm đi, điểm đến
            - Thời gian chờ trước khi huỷ
    - Tài khoản cho tài xế:
        - Thông tin cá nhân
        - Loại phương tiện mình có
        - Nhận chuyến:
            - Điểm đi, điểm đến của khách
            - Xác nhận chuyến
- Thông báo:
    - Với tài khoản người dùng:
        - Có tài xế nhận chở 
        - Tài xế huỷ chuyến
    - Với tài khoản tài xế:
        - Có người cần chở
        - Người dùng huỷ chuyến

### Yêu cầu phi chức năng
Thời gian khởi động dưới 5s

## Thời gian hoàn thành và giá
> [!Important] Định luật Hofstadter
> Mọi thứ sẽ luôn tốn thời gian hơn bạn nghĩ, kể cả khi bạn đã tính đến định luật Hofstadter

[Nếu bạn nghĩ rằng bạn có thể hoàn thành đúng kế hoạch, có thể bạn đang ngộ nhận](https://doi-thoai.deno.dev/Lp.53.1). Chính vì như vậy, nên thời gian hoàn thành dự kiến này chỉ có tác dụng xem xem mình đang ngộ nhận tới đâu, chứ không đảm bảo việc ước lượng thời gian được (giả sử ngày làm 10 tiếng): 
 - Cho toàn bộ dự án (top-down): 5 tuần
 - Cho từng chức năng (bottom-up): 1 tuần nếu chưa có sẵn kiến thức về chức năng đó, 2 ngày nếu đã có sẵn kiến thức
 
 Giá: 80k/h

## Nền tảng cần dùng
### Cơ sở dữ liệu
- Một graph database như Neo4j
- Một hệ thống bản đồ:

| Giải pháp gợi ý | Điểm mạnh                                                      | Giá                                        |
| --------------- | -------------------------------------------------------------- | ------------------------------------------ |
| Google Map      | Nhiều chức năng, dữ liệu phong phú và chính xác, cộng đồng lớn | Nếu dùng dưới $200/tháng thì được miễn phí |
| Open Street Map |                                                                | Miễn phí                                   |

### Ngôn ngữ, framework
Ngôn ngữ TypeScript với runtime Deno là thích hợp nhất cho những app còn nhỏ. Nếu viết app mobile thì có thể dùng framework Capacitor để có thể viết một lần mà có cả app Android và iOS, nhưng như vậy thì có thể sẽ phải đổi runtime sang Node. Nếu đổi sang ngôn ngữ khác thì sẽ đội chi phí lên (nếu muốn đặt bên mình). Nếu chỉ cần dùng bản web được thì sẽ tốt hơn.

### Máy chủ
Firebase/Deno Deploy

### Thiết bị
Nếu làm app cho iOS thì cần mở tài khoản Apple Development giá $99/năm.

## Thời hạn bảo hành phần mềm
Tuỳ vào loại vấn đề mà sẽ xem xét nó có phải là lỗi hay không. Nếu nó không phải là yêu cầu đã được thống nhất trước mà là tính năng mới thì tính phí theo giờ như bình thường.
- Nếu lúc còn ít người dùng thì app không có vấn đề gì mà đến lúc người dùng tăng cao thì có vấn đề và cần cải thiện thì sẽ xét là viết một tính năng mới.

[DRD TUYỂN DỤNG TƯ VẤN HỆ THỐNG QUẢN LÝ DỮ LIỆU VỀ NGƯỜI KHUYẾT TẬT VÀ ĐỐI TÁC](https://www.drdvietnam.org/vi/viec-lam-tin-hoat-dong/19270-drd-tuyen-dung-tu-van-he-thong-quan-ly-du-lieu-ve-nguoi-khuyet-tat-va-doi-tac.html)