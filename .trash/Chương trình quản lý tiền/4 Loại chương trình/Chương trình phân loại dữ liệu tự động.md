---
share: true
created: 2023-09-05T16:17
updated: 2024-08-27T14:15
cssClass: wide-table
---
Tên chương trình:: [[Chương trình quản lý chi tiêu cá nhân từ Trấn Kỳ]], [[Momo]], [[Misa]], [[Trấn Kỳ (quang cảnh thị trường)]]

```dataview
table 
	filter(tính-năng, (i)=>contains(i.file.folder, "Cách nhập liệu")) as "Cách nhập liệu",
	filter(tính-năng, (i)=>contains(i.file.folder, "Cách phân loại")) as "Cách phân loại",
	filter(tính-năng, (i)=>contains(i.file.folder, "Chính sách giá")) as "Chính sách giá",
	filter(tính-năng, (i)=>contains(i.file.folder, "Giao diện")) as "Giao diện",
	filter(tính-năng, (i)=>contains(i.file.folder, "Khả năng tích hợp")) as "Khả năng tích hợp",
	filter(tính-năng, (i)=>contains(i.file.folder, "Số lượng trường phân loại")) as "Số lượng trường phân loại",
	filter(tính-năng, (i)=>contains(i.file.folder, "Khác")) as "Khác"
from outgoing([[]])
```

Tính năng:
```dataview
list
from "📜Tài nguyên/Chương trình quản lý tiền" 
where contains(file.outlinks,[[]])
where file.name != "Chương trình quản lý tiền" 
```

Quán nhỏ thì họ cứ giấy viết sổ sách thôi, họ làm ngày nào xào ngày ấy nên chả quan tâm report hay nhãn dữ liệu là cái gì đâu. Quán lớn hoặc chủ hoặc người quản lý có tư duy vận hành tự động hay số hoá dữ liệu thì họ sẽ tiếp cận vs các đơn vị đang có sẵn giải pháp này trên thị trường rồi. Bạn đặt ra ngữ cảnh là đi chợ, và đây là trường hợp tệ nhất, nó chỉ xảy ra đối với quán nhỏ mình nói đầu tiên kia thôi. Đối với những quán có quy mô hơn thì bên cạnh việc sử dụng giải pháp vận hành công nghệ có sẵn từ các đơn vị khác thì đầu còn lại các supplier của họ cũng có sẵn việc phân loại, thống kê, structure dữ liệu đặt hàng, giao dịch cho quán luôn rồi. Nói chung giải pháp của bạn không mới mẻ cũng không giải quyết vấn đề gì có thật nếu trong ngữ cảnh quán nhỏ xíu đi chợ mua hàng mỗi ngày. Bạn phải để ý, riêng cái hành vi đi chợ mỗi ngày đã là sai trong việc thiết lập quy trình vận hành rồi chứ ko phải lổ hổng của quản lý dữ liệu. Một quán nếu chọn phương án nhập đầu vào thông qua cách đó thì dù có đưa công nghệ vào để xử lý dữ liệu như bạn đang nêu ra thì cũng chẳng triệt để được, nhân viên hoặc người mua vẫn có thể bị rơi vào trường hợp gian lận hoặc thiếu sót dữ liệu thống kê thôi. Góp ý đến bạn nhé ! Thân 👻
[Cộng Đồng Chủ Quán - Khởi Nghiệp Và Kinh Doanh FNB | # Khi nào thì các quán ăn cần tới việc nhập liệu và gắn nhãn dữ liệu | Facebook](https://www.facebook.com/groups/chuquankinhdoanhfnb/posts/1732944450524967/)

[Làm sao để đưa VNPAY vào luồng hoạt động của cửa hàng?](https://slide.quảcầu.cc/Đáp%20ứng%20nhu%20cầu%20doanh%20nghiệp/VNPAY.html?utm_source=Vault+B+Tồn+tại+trong+thế+giới+tư+bản+(Tài+nguyên)&utm_medium=Vault&utm_campaign=&utm_content=Tài+nguyên+hỗ+trợ%2FQuang+cảnh+thị+trường%2FChương+trình+quản+lý+tiền%2F4+Loại+chương+trình%2FChương+trình+phân+loại+dữ+liệu+tự+động.md&utm_term=) 
