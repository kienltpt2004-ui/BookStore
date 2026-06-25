document.addEventListener("DOMContentLoaded", function () {

    /* ================= KIỂM TRA ĐÃ ĐĂNG NHẬP ================= */
    const existingUser = sessionStorage.getItem("userLogin");
    if (existingUser) {
        window.location.href = "manhinhchinh.html";
        return;
    }

    const form = document.querySelector(".login-box form");
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');

    if (!form || !emailInput || !passwordInput) {
        console.error("Không tìm thấy form hoặc input");
        return;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // chặn submit mặc định

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ email và mật khẩu");
            return;
        }

        fetch("http://localhost:3000/users")
            .then(res => res.json())
            .then(users => {
                const user = users.find(
                    u => u.email === email && u.password === password
                );

                if (user) {
                    // Xóa giỏ hàng cũ để tránh nhầm lẫn giữa các account
                    localStorage.removeItem("cart");

                    // LƯU LOGIN VÀO SESSION (CHỈ TRONG TAB NÀY)
                    sessionStorage.setItem("userLogin", JSON.stringify(user));

                    alert("Đăng nhập thành công");
                    window.location.href = "manhinhchinh.html";
                } else {
                    alert("Email hoặc mật khẩu không đúng");
                }
            })
            .catch(err => {
                console.error("Lỗi server:", err);
                alert("Không kết nối được server");
            });
    });

});
