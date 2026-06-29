# Báo Cáo Tổng Quan Dự Án: AyaBook 📚

Tài liệu này cung cấp cái nhìn toàn diện về cấu trúc thư mục, chức năng, kiến trúc dữ liệu và hướng dẫn vận hành dự án **AyaBook** (Bài tập lớn môn Công nghệ Web).

---

## 1. Tổng Quan Dự Án

**AyaBook** là một ứng dụng web bán sách trực tuyến hoàn chỉnh được phát triển bằng phương pháp truyền thống (Vanilla HTML/CSS/JS) kết hợp với **JSON-Server** đóng vai trò làm REST API Backend giả lập và Cơ sở dữ liệu lưu dưới dạng tệp tin JSON (`db.json`).

### Công nghệ sử dụng:
*   **Frontend:** HTML5, CSS3 (Custom Styling), JavaScript ES6 (DOM Manipulation, Fetch API).
*   **Backend & Database (Giả lập):** JSON-Server (REST API tại `http://localhost:3000`).
*   **Trạng thái lưu trữ (State Management):** 
    *   `sessionStorage`: Lưu thông tin đăng nhập hiện tại (`userLogin`) để duy trì phiên làm việc trên tab trình duyệt.
    *   `localStorage`: Lưu trữ giỏ hàng tạm thời (`cart`) để tránh mất thông tin khi tải lại trang.

---

## 2. Cấu Trúc Thư Mục Dự Án

Dưới đây là cấu trúc thư mục của dự án nằm tại thư mục gốc `BTL_CNWeb/`:

```text
BTL_CNWeb/
├── A45241_TT.docx                 # Tài liệu/Báo cáo tiến độ
├── Nhom7_báo cáo BTL.docx         # Báo cáo chi tiết Bài tập lớn nhóm 7
├── BTL_CNWeb/                     # Thư mục mã nguồn chính của Web App
│   ├── .vscode/                   # Cấu hình Visual Studio Code
│   ├── node_modules/              # Các gói thư viện Node.js phụ thuộc
│   ├── db.json                    # Cơ sở dữ liệu giả lập của hệ thống (JSON-Server)
│   │
│   ├── css/                       # Thư mục chứa toàn bộ file định dạng giao diện (CSS)
│   │   ├── admin.css
│   │   ├── chitietdonhang.css
│   │   ├── dangki.css
│   │   ├── dangnhap.css
│   │   └── mhc.css
│   │
│   ├── js/                        # Thư mục chứa toàn bộ logic xử lý (JavaScript)
│   │   ├── admin.js
│   │   ├── chitietdonhang.js
│   │   ├── dangki.js
│   │   ├── dangnhap.js
│   │   ├── main.js                # Tệp JS phụ trợ (Logic cũ vẽ grid tĩnh)
│   │   └── manhinhchinh.js
│   │
│   ├── img/                       # Thư mục lưu trữ hình ảnh sản phẩm & giao diện
│   │   ├── 113822295_p0 1.png
│   │   ├── image 5.png
│   │   └── ...
│   │
│   # Các trang giao diện chính (HTML)
│   ├── dangnhap.html              # Trang Đăng nhập
│   ├── dangki.html                # Trang Đăng ký
│   ├── manhinhchinh.html          # Trang chủ
│   ├── chitietdonhang.html        # Trang Giỏ hàng & Thanh toán
│   └── admin.html                 # Trang Quản trị của Admin
└── __MACOSX/                      # Thư mục hệ thống của macOS (nếu có)
```

---

## 3. Kiến Trúc Dữ Liệu (`db.json`)

Hệ thống sử dụng cơ sở dữ liệu dạng JSON với 4 thực thể chính: `users`, `categories`, `products`, `orders`.

### 3.1. Người dùng (`users`)
Lưu thông tin đăng ký tài khoản của khách hàng và admin:
```json
{
  "id": "c6eb",
  "email": "vietanhtralinh04@gmail.com",
  "password": "123456",
  "name": "vanh",
  "verified": true,
  "token": "490300" // Mã OTP dùng để xác minh tài khoản
}
```
*Lưu ý:* Tài khoản `admin@gmail.com` (mật khẩu `123456`) được chỉ định cứng trong mã nguồn làm tài khoản Quản trị viên tối cao (Admin).

### 3.2. Danh mục sản phẩm (`categories`)
Phân loại các đầu sách hiển thị trên trang chủ:
```json
{
  "id": "newBooks", // Mã danh mục (dùng làm ID DOM và quan hệ dữ liệu)
  "name": "Sách Mới"
}
```
Các danh mục mặc định gồm: `newBooks` (Sách Mới), `bestSellers` (Bán Chạy), `manga` (Truyện Tranh), `life` (Kỹ Năng Sống).

### 3.3. Sách/Sản phẩm (`products`)
Chứa thông tin chi tiết về từng cuốn sách trong kho:
```json
{
  "id": "1",
  "title": "Nina ở thị trấn cao nguyên - Tập 1",
  "author": "Nguyễn Nhật Ánh",
  "price": "34,200đ",
  "img": "./img/image 5.png",
  "category": "newBooks",
  "description": "Câu câu chuyện về cô bé Nina...",
  "year": 2024,
  "pages": 180,
  "rating": 4.5,
  "stock": 30
}
```

### 3.4. Đơn hàng (`orders`)
Quản lý trạng thái mua hàng và thông tin vận chuyển:
```json
{
  "id": "8266",
  "userId": "c6eb",
  "userEmail": "vietanhtralinh04@gmail.com",
  "items": [ ... ], // Danh sách sản phẩm mua, số lượng, hình ảnh
  "shippingInfo": {
    "fullName": "Nguyễn Văn A",
    "phone": "0393022293",
    "email": "abc@gmail.com",
    "address": "Thanh Trì, Hà Nội",
    "note": "Giao giờ hành chính"
  },
  "subtotal": "112.500đ",
  "shippingFee": "30.000đ",
  "total": "142.500đ",
  "paymentMethod": "Chuyển khoản", // "Chuyển khoản" hoặc "Tiền mặt"
  "paymentStatus": "Chưa thanh toán", // "Đã thanh toán", "Chưa thanh toán", "Thanh toán khi nhận hàng"
  "status": "Đang xử lý", // "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"
  "date": "2025-12-23T08:42:30.033Z"
}
```

---

## 4. Chi Tiết Các Chức Năng Theo Trang Giao Diện

### 4.1. Phân Hệ Xác Thực Người Dùng

#### 🔑 Đăng Nhập (`dangnhap.html`, `dangnhap.js`)
*   **Chức năng:** Cho phép người dùng nhập Email và Mật khẩu. Gửi yêu cầu GET tới `/users` để đối chiếu thông tin.
*   **Kiểm soát truy cập:** 
    *   Nếu đúng thông tin đăng nhập, hệ thống sẽ xóa giỏ hàng cũ trong `localStorage` để tránh xung đột, sau đó lưu thông tin người dùng hiện tại vào `sessionStorage` dưới khóa `userLogin` và chuyển hướng tới `manhinhchinh.html`.
    *   Tự động phát hiện nếu đã có session hợp lệ thì chuyển thẳng đến trang chủ.
*   **Giao diện:** Thiết kế nền hình ảnh manga/anime, form nổi sang trọng ở chính giữa.

#### 📝 Đăng Ký Tài Khoản & OTP (`dangki.html`, `dangki.js`)
*   **Chức năng:** Thu thập Email, Mật khẩu, Họ tên và yêu cầu đồng ý điều khoản dịch vụ.
*   **Xác thực nâng cao (Mock-OTP):** 
    *   Kiểm tra định dạng email bằng regex và mật khẩu tối thiểu 6 ký tự.
    *   Gửi GET tới `/users` để đảm bảo email chưa bị trùng lặp.
    *   Sinh một mã số ngẫu nhiên 6 chữ số (`otpCode`).
    *   Gửi POST lưu thông tin người dùng mới với trạng thái `"verified": false` và token bằng mã OTP đó lên DB.
    *   Hiển thị thông báo Mock-OTP trực tiếp qua màn hình (giả lập gửi về email thật) và chuyển hướng tới trang xác minh (`xacminh.html?email=...`).

---

### 4.2. Trang Chủ & Catalog Sách (`manhinhchinh.html`, `manhinhchinh.js`)

Trang chủ là giao diện trung tâm hiển thị danh sách sách được chia theo từng phân khu danh mục sản phẩm với thiết kế cực kỳ hiện đại.

*   **Banner Sách Nổi Bật Động (Dynamic Slider):** 
    *   Hệ thống tự động lọc ra các cuốn sách có đánh giá cao (Rating $\ge 4.6$) để đưa lên banner.
    *   Cơ chế tự động chuyển slide (Auto-play Slider) mỗi 5 giây với hiệu ứng mượt mà và hỗ trợ thanh chấm tròn chọn slide trực tiếp.
    *   Banner hiển thị đầy đủ thông tin mô tả chi tiết, năm xuất bản, giá bán, tác giả, và tích hợp nút hành động tương ứng: Người dùng thường thấy nút "🛒 Mua ngay", Admin thấy nút "⚙️ Quản lý cuốn sách".
*   **Tải dữ liệu động:** Sử dụng `Promise.all` đồng bộ hóa dữ liệu danh mục (`/categories`) và sản phẩm (`/products`) để kết xuất (render) giao diện chính xác.
*   **Hiển thị trạng thái tồn kho (Stock Badges):**
    *   Hết hàng (`stock === 0`): Hiện nhãn "Hết hàng", nút "Thêm vào giỏ" sẽ bị khóa (`disabled`).
    *   Sắp hết hàng (`0 < stock <= 10`): Hiện nhãn "Chỉ còn X cuốn" màu cảnh báo.
    *   Còn hàng (`stock > 10`): Hiện số lượng sẵn có trong kho.
*   **Đánh giá (Rating Stars):** Tự động chuyển đổi điểm số đánh giá từ DB thành biểu tượng ngôi sao tương ứng (⭐ và ✨ cho nửa sao).
*   **Phân Quyền Giao Diện:**
    *   **Đối với Người mua hàng (Khách thông thường):** Có lối tắt truy cập "🛒 Giỏ hàng" trên thanh điều hướng đầu trang. Mỗi thẻ sách hiển thị nút "🛒 Thêm vào giỏ". Khi click thêm, hệ thống kiểm tra tồn kho tối đa của sản phẩm để ngăn khách mua vượt số lượng thực tế trong kho.
    *   **Đối với Admin (`admin@gmail.com`):** Ẩn lối tắt Giỏ hàng. Thêm nút đỏ "**Quản lý**" dẫn thẳng tới bảng điều khiển Admin. Ẩn nút "Thêm vào giỏ" ở từng thẻ sách, thay vào đó thay đổi con trỏ chuột thành dạng click chỉnh sửa. Khi click vào thẻ sách bất kỳ (hoặc nút quản lý trên banner), một **Hộp thoại Modal Quản Lý Sách** sẽ mở ra, hiển thị biểu mẫu chứa sẵn thông tin hiện có của cuốn sách. Admin có thể trực tiếp cập nhật các trường thông tin (Tên sách, Tác giả, Giá, Tồn kho, Link ảnh) rồi bấm "Lưu thay đổi", hoặc bấm "Xoá sách" một cách trực quan và dễ dàng mà không cần nhập các số lựa chọn như trước.
    *   **Đặc quyền Admin ngay trên Trang chủ:** Có một form nổi phía dưới banner cho phép Admin nhập nhanh thông tin để thêm sách mới trực tiếp.
*   **Tìm kiếm thời gian thực mở rộng (Real-time Search):** Lắng nghe sự kiện `input` trên thanh tìm kiếm. Lọc danh sách theo **tiêu đề sách hoặc tác giả** một cách mượt mà không cần tải lại trang.
*   **Ngôn ngữ thiết kế mới:** Sử dụng bộ font Poppins và Inter sang trọng, thanh header hiệu ứng kính mờ (glassmorphic sticky header) bám dính khi cuộn trang, thanh tìm kiếm hero nổi bật và hiệu ứng thẻ sách phóng to mượt mà khi hover.

---

### 4.3. Giỏ Hàng & Tiến Trình Đặt Hàng (`chitietdonhang.html`, `chitietdonhang.js`)

Dành riêng cho khách hàng thực hiện giao dịch mua sách.

*   **Quản lý giỏ hàng:** Đọc danh sách sản phẩm từ `localStorage` khóa `cart`. Người dùng có thể:
    *   Tăng/giảm số lượng của từng cuốn sách ngay tại giỏ hàng.
    *   Xóa bỏ cuốn sách ra khỏi giỏ hàng.
*   **Tính toán tiền tự động:** Hiển thị chi tiết tiền hàng (Tạm tính), phí giao hàng cố định (`30,000đ`), giảm giá và tổng cộng "Thành tiền".
*   **Thu thập thông tin giao hàng:** Form yêu cầu nhập Họ tên, Số điện thoại (tự động kiểm tra định dạng SDT Việt Nam bằng regex), Địa chỉ chi tiết, Tỉnh/Thành phố (lọc qua dropdown select), Quận/huyện và ghi chú vận chuyển. Email được điền tự động dựa trên tài khoản đang đăng nhập và để ở chế độ chỉ đọc (`readonly`).
*   **Phương thức thanh toán & Đặt hàng:**
    *   Hỗ trợ 2 phương thức: **Tiền mặt (COD)** và **Chuyển khoản**.
    *   Khi thanh toán bằng Chuyển khoản, đơn hàng được tạo sẽ lưu trạng thái thanh toán ban đầu là `"Chưa thanh toán"`. Khi chọn COD, trạng thái sẽ là `"Thanh toán khi nhận hàng"`.
    *   Gửi yêu cầu POST lưu toàn bộ dữ liệu đơn hàng vào `/orders`, xóa sạch giỏ hàng trong `localStorage` và chuyển hướng người dùng quay lại trang chủ kèm thông báo thành công.

---

### 4.4. Trang Quản Trị Hệ Thống (`admin.html`, `admin.js`)

Đây là trung tâm điều khiển chỉ dành riêng cho tài khoản quản trị viên (`admin@gmail.com`). Nếu người dùng thường cố tình truy cập vào `admin.html`, JavaScript sẽ phát hiện và đẩy ngược lại trang chủ kèm cảnh báo.

**Giao diện & Bố cục mới:** Trang quản trị sử dụng thiết kế Sidebar dọc (Vertical Sidebar) hiện đại ở bên trái.
*   **Sidebar bên trái:** Chứa Logo tiêu đề, menu dọc chuyển đổi nhanh giữa các phân hệ (Thống Kê, Sản Phẩm, Tài Khoản, Danh Mục, Đơn Hàng), liên kết quay lại trang chủ mua sắm của người dùng và khu vực thông tin đăng nhập kèm nút Đăng xuất. Trên màn hình di động, thanh sidebar này tự động chuyển đổi thành thanh điều hướng cuộn ngang tối giản để tối ưu không gian hiển thị.
*   **Khu vực nội dung chính bên phải:** Chứa chi tiết bảng điều khiển tương ứng với phân hệ đang hoạt động, chia thành 5 phân hệ chức năng:

#### 1. 📊 Dashboard (Thống kê tổng quan)
*   **Các số liệu quan trọng:** Hiển thị 4 thẻ thông tin động gồm *Tổng số sản phẩm có trên hệ thống*, *Tổng số đơn hàng*, *Tổng doanh thu tích lũy* (tự động parse chuỗi tiền tệ trong DB và cộng dồn), *Tổng số tài khoản người dùng đăng ký*.
*   **Biểu đồ thanh trạng thái đơn hàng:** Trực quan hóa số lượng đơn hàng theo 4 trạng thái: *Đang xử lý*, *Đang giao*, *Đã giao*, *Đã hủy* thông qua độ dài thanh tỷ lệ phần trăm tự động.
*   **Bảng xếp hạng Top 5:** Hiển thị 5 sản phẩm bán chạy nhất (tính bằng cách duyệt qua toàn bộ lịch sử đơn hàng, gom nhóm ID sản phẩm và cộng dồn số lượng bán ra, sau đó sắp xếp giảm dần).
*   **Danh sách Đơn hàng gần đây:** Bảng hiển thị nhanh 5 đơn hàng mới đặt gần đây nhất dựa trên sắp xếp thời gian giảm dần.
*   **Nút Làm mới:** Nút làm mới dữ liệu thống kê trực tiếp mà không cần tải lại toàn bộ trang web.

#### 2. 📦 Quản lý sản phẩm (Products Tab)
*   Hiển thị danh sách tất cả sản phẩm dưới dạng bảng.
*   Hỗ trợ **Lọc nhanh sản phẩm** theo danh mục thông qua menu dropdown.
*   **Thêm sản phẩm mới:** Mở hộp thoại Modal, nhập Tên sách, Giá bán, Đường dẫn hình ảnh, Danh mục để gửi yêu cầu POST.
*   **Chỉnh sửa sản phẩm:** Điền ngược thông tin của sản phẩm vào form Modal, thực hiện PATCH lưu lại thay đổi lên API.
*   **Xóa sản phẩm:** Hiển thị hộp thoại cảnh báo trước khi thực hiện xóa vĩnh viễn sản phẩm khỏi cơ sở dữ liệu qua yêu cầu HTTP DELETE.

#### 3. 👤 Quản lý tài khoản (Users Tab)
*   Hiển thị thông tin danh sách tài khoản khách hàng dưới dạng bảng (Mật khẩu được che đi thành dạng `****` để bảo mật).
*   **Thêm mới người dùng:** Mở Modal điền Email, Họ tên, Mật khẩu. Kiểm tra trùng lặp email trước khi gửi POST tạo tài khoản.
*   **Sửa đổi thông tin:** Hỗ trợ cập nhật email, tên hiển thị và mật khẩu của bất kỳ user nào.
*   **Xóa tài khoản:** Xóa tài khoản khách hàng khỏi hệ thống qua DELETE API. *Đặc biệt:* Hệ thống ngăn chặn tuyệt đối hành vi xóa tài khoản Admin (`admin@gmail.com`).

#### 4. 📚 Quản lý danh mục (Categories Tab)
*   Hiển thị danh sách mã danh mục, tên hiển thị và số lượng sản phẩm đang thuộc danh mục đó.
*   **Thêm danh mục mới:** Nhập mã danh mục (bắt buộc dạng camelCase, không chứa dấu cách hay ký tự đặc biệt bằng regex kiểm duyệt) và tên hiển thị.
*   **Sửa tên danh mục:** Cho phép cập nhật tên hiển thị của danh mục. Mã danh mục sẽ bị khóa không cho sửa để tránh mất liên kết khóa ngoại dữ liệu.
*   **Xóa danh mục (Cascading Delete):** Khi Admin muốn xóa một danh mục, hệ thống tự động kiểm tra số sách đang liên kết. Nếu có sản phẩm liên kết, hệ thống sẽ hiển thị cảnh báo: *"Xóa danh mục này sẽ xóa luôn các sản phẩm thuộc danh mục đó"*. Nếu Admin đồng ý, JS sẽ duyệt qua và gửi DELETE hàng loạt các sản phẩm liên quan trước khi xóa danh mục gốc.

#### 5. 🛒 Quản lý đơn hàng (Orders Tab)
*   Bảng hiển thị toàn bộ đơn hàng của cửa hàng với mã đơn, email khách hàng, tổng tiền, hình thức thanh toán, trạng thái thanh toán, trạng thái đơn hàng và ngày đặt.
*   **Cập nhật trực tiếp trạng thái thanh toán:** Thay đổi trực tiếp qua dropdown select. Dropdown tự động đổi màu sắc hiển thị (Màu đỏ cho Chưa thanh toán, Màu xanh lá cho Đã thanh toán, Màu xanh dương cho Thanh toán khi nhận hàng). Gửi yêu cầu PATCH cập nhật dữ liệu.
*   **Cập nhật trực tiếp trạng thái đơn hàng:** Thay đổi trạng thái thông qua dropdown select tương ứng (Đang xử lý, Đang giao, Đã giao, Đã hủy). Tự động đổi màu nền của badge theo trạng thái tương ứng.
*   **Xem chi tiết đơn hàng:** Mở hộp thoại Modal rộng hiển thị thông tin người nhận (Họ tên, SĐT, Địa chỉ chi tiết, Ghi chú), thông tin phương thức thanh toán, cùng bảng kê chi tiết toàn bộ các cuốn sách khách hàng đã mua (Ảnh, tên sách, đơn giá, số lượng, thành tiền).
*   **Xóa đơn hàng:** Cho phép loại bỏ đơn hàng cũ ra khỏi cơ sở dữ liệu thông qua DELETE API.

---

## 5. Hướng Dẫn Vận Hành Dự Án

Để chạy được dự án này trên máy tính của bạn, hãy thực hiện theo các bước dưới đây:

### Bước 1: Chuẩn bị môi trường
1.  Đảm bảo máy tính đã cài đặt **Node.js** (để sử dụng trình quản lý gói `npm`).
2.  Tải mã nguồn dự án về máy và mở thư mục `BTL_CNWeb` bằng công cụ soạn thảo mã nguồn (khuyên dùng Visual Studio Code).

### Bước 2: Cài đặt JSON-Server
Nếu thư mục dự án chưa có `json-server` hoặc bạn muốn chạy toàn cục (globally), hãy mở Terminal tại thư mục `BTL_CNWeb/BTL_CNWeb/` và chạy lệnh sau để cài đặt:
```bash
npm install json-server
```
*(Hoặc cài đặt toàn cục bằng lệnh: `npm install -g json-server`)*

### Bước 3: Khởi động Mock REST API Server
Tại thư mục chứa tệp tin `db.json` (thư mục `BTL_CNWeb/BTL_CNWeb/`), khởi động máy chủ API giả lập bằng lệnh:
```bash
json-server --watch db.json --port 3000
```
Sau khi khởi chạy thành công, terminal sẽ thông báo máy chủ đang hoạt động tại địa chỉ:
*   Tài nguyên sản phẩm: `http://localhost:3000/products`
*   Tài nguyên người dùng: `http://localhost:3000/users`
*   Tài nguyên danh mục: `http://localhost:3000/categories`
*   Tài nguyên đơn hàng: `http://localhost:3000/orders`

> [!IMPORTANT]
> Máy chủ API **phải luôn hoạt động** ở cổng `3000` trong suốt quá trình chạy ứng dụng để các tính năng đăng nhập, đăng ký, hiển thị sách, giỏ hàng và admin hoạt động.

### Bước 4: Mở ứng dụng web
*   Mở tệp tin `dangnhap.html` bằng trình duyệt web của bạn (Double click trực tiếp hoặc nhấn chuột phải chọn Open with Chrome/Edge/Firefox).
*   Hoặc sử dụng tiện ích mở rộng **Live Server** trong VS Code để khởi chạy dự án dưới dạng máy chủ cục bộ (local host) để giao diện hiển thị mượt mà hơn.
*   **Đăng nhập tài khoản Test:**
    *   **Khách hàng:** `vietanhtralinh04@gmail.com` / Mật khẩu: `123456`
    *   **Quản trị viên (Admin):** `admin@gmail.com` / Mật khẩu: `123456`
