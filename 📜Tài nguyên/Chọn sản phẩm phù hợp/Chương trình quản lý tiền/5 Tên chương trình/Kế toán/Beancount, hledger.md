---
share: true
created: 2023-09-05T16:17
updated: 2025-09-17T09:51
---
Tính năng:: [[Nhập liệu được bằng file text]]
Tính năng:: [[Nhập được trên máy tính]]
Tính năng:: [[Phân loại bằng tay]]
Tính năng:: [[Tạo query phức tạp được]]
Tính năng:: [[Dùng được trên CLI]]
Tính năng:: [[Dễ dàng thiết lập việc tự động truyền dữ liệu sang các phần mềm khác]]
Tính năng:: [[Sao chép kết quả sang chương trình khác được]]
Tính năng:: [[Dữ liệu chương trình lưu dưới dạng tập tin]]
Tính năng:: [[Điều khiển dễ dàng bằng bàn phím]]
Tính năng:: [[Thêm được nhiều trường phân loại]]
Tính năng:: [[Là phần mềm tự do]]
Tính năng:: [[Miễn phí]]

Loại chương trình: `=filter(this.file.inlinks, (i)=>contains(i.file.folder, "Loại chương trình"))`

Demo: [Income Statement - Example Beancount file](https://fava.pythonanywhere.com/example-beancount-file/income_statement/)
https://beancount.github.io/docs/a_comparison_of_beancount_and_ledger_hledger.html

Vì phần chi tiêu cá nhân ko có tác dụng đối với mục đích kê khai thuế ở Mỹ, nên m nói mục đích của dev beancount có vẻ ko phải để theo dõi chi tiêu. b đọc các ví dụ minh họa cách sử dụng của beancount sẽ thấy đa phần là để theo dõi danh mục đầu tư cá nhân, ghi nhận lãi lỗ, nhằm mục đích kê khai thuế thu nhập cá nhân hàng năm của Mỹ. Không như Vietnam thì thuế thu nhập từ đầu tư cá nhân đã được thu hộ tại nguồn là các cty chứng khoán rồi Nhưng m thấy beancount vẫn làm tốt việc theo dõi chi tiêu ở mức tiểu khoản rất tốt. Nếu kiên nhẫn nhập đúng và đủ.

Beancount nhập liệu cứng nhắc hơn, chỉ được chọn 1 trong 5 loại tài khoản 

> Beancount transactions are required to balance, period. I make no compromise in this, there is no way out.  

> “If people don't want to use them [virtual accounts], that's fine. But Ledger is not an accounting tool; it's a tool that may be used to do accounting. As such, I believe virtual accounts serve a role that others with non-accounting problems may wish to fill.”
Our task in representing transactional information is the replication of operations that take place mostly in institutions. These operations always involve the rounding of numbers for units and currencies (banks do apply stochastic rounding), and the correct numbers to be used from the perspective of these institutions, and from the perspective of the government, are indeed the rounded numbers themselves.
