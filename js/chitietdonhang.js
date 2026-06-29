
document.addEventListener("DOMContentLoaded", function () {
    // Kiểm tra đăng nhập
    const userStr = sessionStorage.getItem("userLogin");
    if (!userStr) {
        window.location.replace("dangnhap.html");
        return;
    }

    const user = JSON.parse(userStr);

    // NGĂN CHẶN ADMIN TRUY CẬP TRANG NÀY
    if (user.email === "admin@gmail.com") {
        alert("👨‍💼 Admin không thể thực hiện mua hàng!");
        window.location.replace("admin.html");
        return;
    }

    // Tự động điền email
    document.getElementById("email").value = user.email;

    // Logout
    document.getElementById("logout").onclick = () => {
        sessionStorage.removeItem("userLogin");
        localStorage.removeItem("cart"); // Clear cart on logout
        window.location.replace("dangnhap.html");
    };

    // Load giỏ hàng
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const SHIPPING_FEE = 30000; // Phí vận chuyển cố định

    function renderCart() {
        const cartContainer = document.getElementById("cartItems");

        if (cart.length === 0) {
            cartContainer.innerHTML = `
              <div class="empty-cart">
                <h3>🛒 Giỏ hàng trống</h3>
                <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <a href="manhinhchinh.html">Tiếp tục mua sắm</a>
              </div>
            `;
            updateTotal();
            return;
        }

        cartContainer.innerHTML = "";
        cart.forEach((item, index) => {
            const itemPrice = parsePrice(item.price);
            const itemTotal = itemPrice * item.quantity;

            const productDiv = document.createElement("div");
            productDiv.className = "product-item";
            productDiv.innerHTML = `
              <img src="${item.img}" alt="${item.title}" class="book-image" />
              
              <div class="product-info">
                <h3 class="book-title">${item.title}</h3>
                <p class="book-price">${item.price}</p>
                
                <div class="quantity">
                  <span>Số lượng</span>
                  <button onclick="changeQuantity(${index}, -1)">-</button>
                  <span class="number">${item.quantity}</span>
                  <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
                
                <p class="total">
                  Thành tiền: <span>${formatPrice(itemTotal)}</span>
                </p>
              </div>
              
              <span class="delete-icon" onclick="removeItem(${index})">🗑️</span>
            `;
            cartContainer.appendChild(productDiv);
        });

        updateTotal();
    }

    // Đổi số lượng
    window.changeQuantity = function (index, delta) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    };

    // Xóa sản phẩm
    window.removeItem = function (index) {
        if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
        }
    };

    // Cập nhật tổng tiền
    function updateTotal() {
        let subtotal = 0;
        cart.forEach(item => {
            const price = parsePrice(item.price);
            subtotal += price * item.quantity;
        });

        const total = cart.length > 0 ? subtotal + SHIPPING_FEE : 0;

        document.getElementById("subtotal").innerText = formatPrice(subtotal);
        document.getElementById("total").innerText = formatPrice(total);
    }

    // Parse giá từ string (VD: "27,000đ" -> 27000)
    function parsePrice(priceStr) {
        return parseInt(priceStr.replace(/[.,đ]/g, "")) || 0;
    }

    // Format giá thành string (VD: 27000 -> "27,000đ")
    function formatPrice(num) {
        return num.toLocaleString("vi-VN") + "đ";
    }

    // Validate form địa chỉ
    function validateShippingForm() {
        const fullName = document.getElementById("fullName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value;
        const district = document.getElementById("district").value.trim();

        if (!fullName) {
            alert("❌ Vui lòng nhập họ và tên!");
            document.getElementById("fullName").focus();
            return false;
        }

        if (!phone) {
            alert("❌ Vui lòng nhập số điện thoại!");
            document.getElementById("phone").focus();
            return false;
        }

        // Validate số điện thoại Việt Nam
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(phone)) {
            alert("❌ Số điện thoại không hợp lệ!");
            document.getElementById("phone").focus();
            return false;
        }

        if (!address) {
            alert("❌ Vui lòng nhập địa chỉ!");
            document.getElementById("address").focus();
            return false;
        }

        if (!city) {
            alert("❌ Vui lòng chọn tỉnh/thành phố!");
            document.getElementById("city").focus();
            return false;
        }

        if (!district) {
            alert("❌ Vui lòng nhập quận/huyện!");
            document.getElementById("district").focus();
            return false;
        }

        return true;
    }

    // Thanh toán
    document.getElementById("checkoutBtn").onclick = function () {
        if (cart.length === 0) {
            alert("Giỏ hàng trống!");
            return;
        }

        // Validate form địa chỉ
        if (!validateShippingForm()) {
            return;
        }

        const subtotal = cart.reduce((sum, item) => {
            return sum + parsePrice(item.price) * item.quantity;
        }, 0);

        const total = subtotal + SHIPPING_FEE;

        // Lấy phương thức thanh toán
        const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "Tiền mặt";

        // Xác định trạng thái thanh toán ban đầu
        // Chuyển khoản -> Chưa thanh toán (đợi admin xác nhận)
        // Tiền mặt -> Thanh toán khi nhận hàng
        const paymentStatus = paymentMethod === "Chuyển khoản" ? "Chưa thanh toán" : "Thanh toán khi nhận hàng";

        // Lấy thông tin địa chỉ
        const shippingInfo = {
            fullName: document.getElementById("fullName").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            address: document.getElementById("address").value.trim(),
            city: document.getElementById("city").value,
            district: document.getElementById("district").value.trim(),
            note: document.getElementById("note").value.trim()
        };

        const order = {
            userId: user.id,
            userEmail: user.email,
            items: cart,
            shippingInfo: shippingInfo,
            subtotal: formatPrice(subtotal),
            shippingFee: formatPrice(SHIPPING_FEE),
            total: formatPrice(total),
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            date: new Date().toISOString(),
            status: "Đang xử lý"
        };

        // Lưu đơn hàng lên server
        fetch("http://localhost:3000/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        })
            .then(res => res.json())
            .then(data => {
                alert(`✅ Đặt hàng thành công!\n\nĐơn hàng sẽ được giao đến:\n${shippingInfo.fullName}\n${shippingInfo.phone}\n${shippingInfo.address}, ${shippingInfo.district}, ${shippingInfo.city}\n\nCảm ơn bạn đã mua hàng!`);
                localStorage.removeItem("cart");
                window.location.href = "manhinhchinh.html";
            })
            .catch(err => {
                console.error("Lỗi thanh toán:", err);
                alert("❌ Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!");
            });
    };

    // Render ban đầu
    renderCart();
})
