---
share: true
created: 2025-03-27T17:13
updated: 2025-09-29T18:27
---

; journal created 2025-09-13 by hledger
decimal-mark .
commodity kđ
D 1. kđ

account Start                                               ; Loại:Tài sản, type:Equity
account Chi phí                                             ; type:X
account Tài sản                                             ; type:A
account Cộng đồng                                           ; type:A
account Không rõ nguồn gốc                                  ; type:A

alias ? = Không rõ nguồn gốc

account Start:Nhật
account Start:Thịnh
account Start:Trí
account Start:Lộc

# Chi phí       
account Chi phí:Đi lại:Xăng                                 
account Chi phí:Đi lại:Gửi xe                               
account Chi phí:Đi lại:Xe buýt:Vé lượt                      
account Chi phí:Đi lại:Xe buýt:Vé tập                       
account Chi phí:Đi lại:Metro                                
account Chi phí:Đi lại:Sửa xe                               
account Chi phí:Đi lại:Dịch vụ:Tada                         
account Chi phí:Đi lại:Dịch vụ:Grab                         
account Chi phí:Đi lại:Dịch vụ:Be                           
account Chi phí:Đi lại:Dịch vụ:Xanh SM                      

account Chi phí:Thực phẩm:Thịt:Sườn                         
account Chi phí:Thực phẩm:Tinh bột:Bánh mì                  
account Chi phí:Thực phẩm:Ăn trưa:Chả cá
account Chi phí:Chợ                                         
account Chi phí:Siêu thị                                    

account Chi phí:Y tế:Bảo hiểm y tế                          
account Chi phí:Y tế:Tạm ứng                                
account Chi phí:Y tế:Hoàn trả                               
account Chi phí:Y tế:Xét nghiệm                             
account Chi phí:Y tế:Thuốc                                  

account Chi phí:Giáo dục, văn hoá, giải trí:Hội thảo        
account Chi phí:Giáo dục, văn hoá, giải trí:Khoá học        
account Chi phí:Giáo dục, văn hoá, giải trí:Phim            
account Chi phí:Giáo dục, văn hoá, giải trí:Sách            

account Chi phí:Khác:Bảo hiểm xã hội                        
account Chi phí:Khác:Vệ sinh công cộng                      

alias xăng              = Chi phí:Đi lại:Xăng                        
alias gửi xe            = Chi phí:Đi lại:Gửi xe                      
alias xe buýt           = Chi phí:Đi lại:Xe buýt:Vé lượt             
alias vé tập xe buýt    = Chi phí:Đi lại:Xe buýt:Vé tập              
alias metro             = Chi phí:Đi lại:Metro                       
alias sửa xe            = Chi phí:Đi lại:Sửa xe                      
alias tada              = Chi phí:Đi lại:Dịch vụ:Tada                 
alias grab              = Chi phí:Đi lại:Dịch vụ:Grab
alias be                = Chi phí:Đi lại:Dịch vụ:Be
alias xanh              = Chi phí:Đi lại:Dịch vụ:Xanh SM

alias sườn              = Chi phí:Thực phẩm:Thịt:Sườn
alias bánh mì           = Chi phí:Thực phẩm:Tinh bột:Bánh mì
alias chợ               = Chi phí:Chợ
alias siêu thị          = Chi phí:Siêu thị
alias ăn sáng          = Chi phí:Thực phẩm:Ăn sáng
alias ăn trưa          = Chi phí:Thực phẩm:Ăn trưa
alias ăn tối          = Chi phí:Thực phẩm:Ăn tối
alias bhyt              = Chi phí:Chăm sóc cá nhân:Y tế:Bảo hiểm y tế
alias tạm ứng viện phí  = Chi phí:Chăm sóc cá nhân:Y tế:Tạm ứng      
alias hoàn trả viện phí = Chi phí:Chăm sóc cá nhân:Y tế:Hoàn trả     
alias xét nghiệm        = Chi phí:Chăm sóc cá nhân:Y tế:Xét nghiệm   
alias thuốc             = Chi phí:Chăm sóc cá nhân:Y tế:Thuốc        

alias hội thảo          = Chi phí:Giáo dục, văn hoá, giải trí:Hội thảo       
alias khoá học          = Chi phí:Giáo dục, văn hoá, giải trí:Khoá học       
alias phim              = Chi phí:Giáo dục, văn hoá, giải trí:Phim           
alias sách              = Chi phí:Giáo dục, văn hoá, giải trí:Sách           

alias bhxh              = Chi phí:Khác:Bảo hiểm xã hội   
alias nvs               = Chi phí:Khác:Vệ sinh công cộng             

# Tài sản
account Cá nhân:Nhật:Tiền mặt:Bóp                        ; type:A
account Cá nhân:Nhật:Tài khoản thanh toán:VCB            ; type:A
account Cá nhân:Nhật:Tài khoản thanh toán:MSB            ; type:A
account Cá nhân:Nhật:Tài khoản thanh toán:Momo           ; type:A
account Cá nhân:Nhật:Tài khoản thanh toán:Vietinbank     ; type:A
account Cá nhân:Nhật:Tài khoản thanh toán:SeABank        ; type:A
account Cá nhân:Nhật:Tài khoản thanh toán:VPBank         ; type:A

alias bóp        = Cá nhân:Nhật:Tiền mặt:Bóp                        
alias vcb        = Cá nhân:Nhật:Tài khoản thanh toán:VCB            
alias msb        = Cá nhân:Nhật:Tài khoản thanh toán:MSB            
alias momo       = Cá nhân:Nhật:Tài khoản thanh toán:Momo           
alias vietinbank = Cá nhân:Nhật:Tài khoản thanh toán:Vietinbank           
alias seabank = Cá nhân:Nhật:Tài khoản thanh toán:SeABank           
alias vpbank = Cá nhân:Nhật:Tài khoản thanh toán:VPBank

account Cá nhân:Nhật:Thẻ tín dụng:Vietinbank               ; type:L
account Cá nhân:Nhật:Thẻ tín dụng:SeABank                  ; type:L
account Cá nhân:Nhật:Thẻ tín dụng:VCB                      ; type:L
account Cá nhân:Nhật:Thẻ tín dụng:OCB                      ; type:L
account Cá nhân:Nhật:Ví trả sau:Momo                       ; type:L
account Cá nhân:Mẹ:Thẻ tín dụng:HSBC                       ; type:L

account Cá nhân:Mẹ:Tiền mặt                                ; type:E
account Cá nhân:Mẹ:Tài khoản thanh toán:BAOVIET Bank       ; type:E

account Cá nhân:Lộc:Tiền mặt                               ; type:A
account Cá nhân:Lộc:Tài khoản thanh toán:TPBank            ; type:A

account Cá nhân:Trí:Tài khoản thanh toán:VCB               ; type:A
account Cá nhân:Trí:Chi tiêu cuộc sống                     ; type:A

account Cá nhân:Thịnh:Tài khoản thanh toán:SeABank         ; type:A
account Cá nhân:Hương:Tài khoản thanh toán                 ; type:L
account Cá nhân:Trang:Tài khoản thanh toán                 ; type:L
account Cá nhân:Quân:Tài khoản thanh toán                  ; type:L
account Cá nhân:Linh:Tài khoản thanh toán                  ; type:L

account Quỹ:Quả Cầu                                        ; type:A
account Quỹ:VCIL                                           ; type:A

alias thẻ vietinbank = Cá nhân:Nhật:Thẻ tín dụng:Vietinbank
alias thẻ seabank    = Cá nhân:Nhật:Thẻ tín dụng:SeABank             
alias thẻ vcb        = Cá nhân:Nhật:Thẻ tín dụng:VCB
alias thẻ ocb        = Cá nhân:Nhật:Thẻ tín dụng:OCB
alias vts momo       = Cá nhân:Nhật:Ví trả sau:Momo                  
alias mẹ             = Cá nhân:Mẹ:Tiền mặt   
alias mẹ ck          = Cá nhân:Mẹ:Tài khoản thanh toán:BAOVIET Bank
alias thẻ hsbc       = Cá nhân:Mẹ:Thẻ tín dụng:HSBC
alias lộc            = Cá nhân:Lộc:Tiền mặt      
alias lộc tpbank     = Cá nhân:Lộc:Tài khoản thanh toán:TPBank        
alias trang          = Cá nhân:Trang:Tài khoản thanh toán
alias hương          = Cá nhân:Hương:Tài khoản thanh toán
alias quân           = Cá nhân:Quân:Tài khoản thanh toán 
alias linh           = Cá nhân:Linh:Tài khoản thanh toán 
alias thịnh          = Cá nhân:Thịnh:Tài khoản thanh toán:SeABank     
alias trí vcb        = Cá nhân:Trí:Tài khoản thanh toán:VCB           
alias trí chi tiêu   = Cá nhân:Trí:Tài khoản thanh toán:VCB           
alias qc             = Quỹ:Quả Cầu               
alias vcil           = Quỹ:VCIL                  

2025-09-17 | Bắt đầu Nhật
  bóp                                                            783
  msb                                                            1123
  thẻ vietinbank                                                 333.338
  Start:Nhật
  thẻ hsbc                                                       -57000  ; Giúp:Lộc, chôm tiền mẹ
2025-09-17 | Bắt đầu Thịnh
  hương                                                          -4000
  quân                                                           -2040
  linh                                                           -500
  Start:Thịnh
  
2025-09-17 | Bắt đầu Trí
  trang                                                          -1000
  thẻ vcb                                                        -4206.862
  Start:Trí                                                    

2025-09-18 chợ |     
  bóp                                                            -100
  sườn                                                           +100

2025-09-18 lò bánh |  ; Giúp:Mẹ
  bóp                                                            -4
  bánh mì                                                        4

2025-09-19 Trang | Trả nợ  ; Giúp:Trí
  msb                                                            -1000
  trang                                                          1000

2025-09-19 vietinbank | 
  msb                                                            -123
  vietinbank                                                     123

2025-09-19 xe 52 |  ; Giúp:Mẹ
  bóp                                                            -6
  xe buýt                                                        6

2025-09-19 bến xe |   
  bóp                                                            -158
  vé tập xe buýt                                                 158

2025-09-19 Thịnh | Thịnh trả nợ  ; Giúp:Thịnh
  thịnh                                                          -6540
  seabank                                                        6540

2025-09-19 Hương | Trả nợ Hương  ; Giúp:Thịnh
  seabank                                                        -4000
  hương                                                          4000

2025-09-19 Quân | Trả nợ Quân ; Giúp:Thịnh
  seabank                                                        -2040
  quân                                                           2040

2025-09-19 anh Linh | Trả nợ anh Linh ; Giúp:Thịnh
  seabank                                                        -500
  linh                                                           500

2025-09-19 tada | Từ nhà lên nhà dì Minh  ; Giúp:Mẹ
  bóp                                                            -10
  mẹ                                                             -30
  tada

2025-09-20 Nhà vệ sinh |  ; Kiến-thức,-giao-lưu:Truyện tranh kế toán
  bóp                                                            -5
  nvs                                                            5

2025-09-20 Nhã Nam | Ruột ơi là ruột  ; Kiến-thức,-giao-lưu:Truyện tranh kế toán
  thẻ hsbc                                                       -101.150
  sách                                                           101.150

2025-09-20 hội chợ nông sản |  ; Giúp:Mẹ
  bóp                                                            -389
  chợ                                                            389

2025-09-20 Coopmart |       ; Giúp:Mẹ
  thẻ hsbc                                                       -717.257
  siêu thị                                                       717.257

2025-09-23 Vietinbank | Trả tiền dư thẻ tín dụng để đóng  ; Giúp:Lộc
  thẻ vietinbank                           -333.338
  vietinbank                        333.338


2025-09-24 | Nhận tiền giùm  ; Giúp:Lộc
    vietinbank         291.691
    ?                 -291.691
    vietinbank            -298
    lộc tpbank             298

2025-09-25 | Trả lại TK tiền gửi
    Cá nhân:Nhật:Tài khoản thanh toán:Vietinbank          19.984
    Không rõ nguồn gốc                              -19.984

2025-09-25 | Từ nhà lên nhà dì Minh     ; Giúp:Mẹ
    Cá nhân:Mẹ:Tiền mặt             -47
    be                               47

2025-09-26 | hoàn tiền    ; Giúp:Lộc
    Cá nhân:Nhật:Tài khoản thanh toán:Vietinbank          59.953
    Không rõ nguồn gốc                                   -59.953

2025-09-26 tada | Đi xe với mẹ về nhà  ; Giúp:Mẹ
    tada              61
    bóp              -61

2025-09-26 Quán gần nhà | Ăn trưa
    mẹ                    -500
    cơm quán:Chả cá              30
    bóp                    470

2025-09-26 Hàng rong | Ăn xế
    bóp                  -20
    Bánh quy              20

2025-09-28 lò bánh mì
    Cá nhân:Nhật:Tiền mặt:Bóp                          -29
    Chi phí:Thực phẩm:Tinh bột:Bánh mì                  14  ;  Giúp:Mẹ
    Chi phí:Thực phẩm:Ăn xế:Bánh hoàng kim              15
