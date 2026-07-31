---
share: true
updated: 2026-07-27T15:26
created: 2025-10-01T20:47
---
Em cũng bưng toàn bộ desktop lên đám mây, như vậy chả cần xách lap đi đâu cả, vẫn truy cập đc dữ liệu của mình, miễn là có internet với key nằm trong điện thoại hoặc usb.

Thì khác gì Google drive đâu. Anh thấy cái chính vẫn là thao tác đt thì bất tiện
Hmm, khác chứ anh.. nhưng em xài trên đt thì bất tiện thật, ý em là máy tính bảng.
để đảm bảo an toàn thì bật 2fa trên virtual desktop ấy, với key là điện thoại hoặc YubiKey chẳng hạn.

Thì dùng vps thì điều khiển trên terminal dễ hơn, với tài nguyên máy cũng mạnh hơn. Còn gì nữa ko?
Bảo mật.
có thể hạn chế tối thiểu những gì lưu trên máy tính của mình.

Drive thì cũng 2fa đc mà nhỉ?

Ở đây là nói dịch vụ lưu trữ thôi, ko nói cụ thể về drive
hmm, nhưng em ko nghĩ với nhu cầu dùng thông thường, mỗi lần anh mở máy là lại nhập 2fa để decrypt dữ liệu :d
hoặc là full disk encryption cũng đc.

Thì là khác ở nhu cầu bảo mật thôi. Giờ vps anh cũng ko cài thì cũng đc vậy?
Bên cạnh là mạng VPS hầu như đều là Gbps
Cũng xem như là một loại VPN thay vì truy cập trực tiếp từ IP của mình.

À đúng là cái này hơn thật

Rpd anh cũng chưa tìm hiểu là gì luôn :))
thực ra bọn nó viết sai.
phải là RDP, tức là remote desktop protocol, giao thức truy cập từ xa sử dụng mặc định trên Windows.

À thì ra là vậy
bọn nó đang viết về cái phương tiện (giao thức này), thay vì mục đích (truy cập từ xa) 😁
Nhưng mà về khoản vps thì em xài docker vì dễ triển khai, chi phí lưu trữ thấp.
chứ xài cả vps thì mỗi lần bung ra khá nặng (10 - 15 GB), docker của e chỉ khoảng 2.5 - 4 GB là nhiều.
bù lại thì không mã hóa toàn bộ đc, nên phải xài kèm cryptomator để mã hóa dữ liệu nhạy cảm.

Cũng thắc mắc docker khác với máy ảo chỗ nào. Với với việc deploy chương trình server thì cũng chưa biết nó khác thế nào
Khác ở tính module hóa và sử dụng tài nguyên hệ thống. Ảo hóa tức là mô phỏng một máy vật lý thật trên nền một hệ thống có sẵn, còn docker nó sử dụng cgroups - tính năng của Linux kernel để gom tiến trình thành các miền riêng biệt - vì nó chạy sử dụng kernel của Host nên hiệu quả sử dụng tài nguyên cao hơn, nhưng cũng cô lập về sử dụng đĩa, RAM với Host, tựa như VM.
Deploy chương trình server thì chỉ cần chạy một container khác là ổn đó anh 😃
Với docker thì mình chỉ cần lưu trữ tối thiểu dữ liệu của ứng dụng, thay vì lưu toàn bộ mọi thứ gồm cả ứng dụng, dữ liệu, kiểu như máy ảo.
Ảo hóa ko gom tiến trình thành các miền riêng biệt à?

Anh thấy docker tiện hơn ở chỗ mình có thể thao tác pull push như git, nên đi đâu muốn deploy cũng tiện. Còn lại thì dockerfile cũng giống như bash script thôi?
Hmm, ảo hóa sử dụng triển khai cấp thấp của CPU, như Intel với VT-x, AMD thì có AMD-V. Dưới góc nhìn của host thì các tiến trình bên trong máy ảo như hộp đóng.
Còn với cgroups thì Host có thể biết có những tiến trình nào chạy dưới cây hệ thống của nó.
Docker file là để tạo container mà anh :d
Docker cho phép linh động về ứng dụng, có thể upgrade hoặc downgrage, triển khai và hủy dễ dàng.
Nhưng mà e thì hiện tại dùng nó như máy ảo để làm môi trường làm việc vậy, đặt lịch snapshot định kỳ để backup.
Thì cần load lại, mọi thứ khôi phục như cũ.
Tức là không phụ thuộc vào host, miễn là Linux và có đủ tài nguyên thì có thể khôi phục môi trường làm việc của mình dưới 30 phút.

Hmm, môi trường làm việc của em chủ yếu là terminal thôi hay cần cả GUI nữa?
08:53
tất nhiên là gui chứ anh :v
em dùng gui mà
Docker anh xài desktop như thường.. chắc anh nghĩ docker phải là terminal thì ko đúng rồi.
https://kasmweb.com/
Kasm Workspaces | The Container Streaming Platform
Cái trên bản web họ dùng apache guacamole.
Một số giải pháp như https://github.com/m1k1o/neko cũng ổn.
GitHub - m1k1o/neko: A self hosted virtual browser that runs in docker and uses WebRTC.
cho phép truy cập vào workspace từ browser
Nhưng e dùng nomachine vì nó cho phép truy cập phần cứng, xài mic, camera y như trên máy thật của mình.

Hay nhỉ

Này thay vps tốt vậy chắc hữu ích cho mấy đứa mmo
đúng rồi, mmo thì tụi nó xài vps để chạy kịch bản hoặc để che dấu danh tính.
nhưng e để môi trường làm việc cũng rất tiện.

Docker tự nó sinh ip ngẫu nhiên đúng ko?
mình có thể lựa chọn dùng NAT hoặc bridge trực tiếp và dùng IP/card của host.
để e gửi cho anh Dockerfile e đang dùng.
https://github.com/pqnhan/Toolset/tree/main/Dockerfiles/ubuntu/nomachine_ubuntu
github.com
thay vì thuê vps thì anh chạy trên google cloud shell cũng ổn.
về giải pháp kết nối vào thì có thể xài ngrok, hoặc anh có gcloud/ssh thì kết nối qua đó cũng được.

Chắc cũng cho nhu cầu cá nhân thôi, chứ chạy nuôi acc chắc nó cắn tiền ghê lắm?
chạy nuôi acc thì tụi nó mua vps giá rẻ..
như trước e chia sẻ thì 2 vultr bare metal trong một tháng mất khoảng 100-150k tùy thời điểm.
cấu hình 32GB RAM, 16 lõi CPU, 200-250G SSD mỗi con.. rất rẻ.

Thế nếu rẻ vậy thì người ta dùng cloud làm gì?
Rẻ là rẻ xài chùa đó anh :d
bọn nó kiếm nguồn mastercard đâu đó về lập và xài chương trình promotion của các nhà cung cấp.. họ cho 200-300$ credit trong tháng đầu tiên, từng ấy đủ để thuê server cấu hình như thế.
cloud thì bảo mật hơn? với cloud cung cấp giải pháp lưu lịch sử phiên bản tệp, truy cập mọi nơi, khôi phục lại cũng dễ dàng hơn?
còn nếu mạng mạnh hay có vps ổn định thì tự host cũng rất ổn.

Nếu giá tiền ko phải do loại hình dịch vụ mà chỉ là khuyến mãi, thì chắc cloud cũng có thể có những khuyến mãi tương tự như vậy chứ nhỉ?
tuy có nhưng với điều kiện mua số lượng lớn, như với doanh nghiệp chẳng hạn.
còn mình mua lẻ số lượng ít thì cái đó ko đáng kể.

Tức là vps là cho doanh nghiệp, cá nhân nhỏ, còn cloud thì cho doanh nghiệp lớn hả?
Hmm, hình như có chút nhầm lẫn ở đây :d
VPS là một/một số server đơn lẻ được thuê.
cloud bao gồm cả vps? nhưung nghĩa rộng hơn bao gồm cả dịch vụ bảo mật, theo dõi, điện toán, hệ thống CDN, vv..
