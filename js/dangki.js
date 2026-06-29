
const form = document.querySelector(".register form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("name");
const agreeCheckbox = document.getElementById("agree");

if (!form || !emailInput || !passwordInput || !nameInput || !agreeCheckbox) {
    console.error("Không tìm thấy input đăng ký");
    // return;
} else {

    form.addEventListener("submit", function (e) {
        e.preventDefault(); //  chặn reload

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const name = nameInput.value.trim();
        const agree = agreeCheckbox.checked;

        // Kiểm tra trống
        if (!email || !password || !name) {
            showToast("Vui lòng nhập đầy đủ thông tin", "warning");
            return;
        }

        // Kiểm tra định dạng email
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            alert("❌ Email không đúng định dạng!\nVí dụ: user@gmail.com");
            emailInput.focus();
            return;
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 6) {
            alert("❌ Mật khẩu phải có ít nhất 6 ký tự!");
            passwordInput.focus();
            return;
        }

        // Kiểm tra đồng ý điều khoản
        if (!agree) {
            alert("Bạn cần đồng ý với các điều khoản");
            return;
        }

        // Kiểm tra email đã tồn tại chưa
        fetch("http://localhost:3000/users")
            .then(res => res.json())
            .then(users => {
                const existed = users.find(u => u.email === email);

                if (existed) {
                    alert("Email đã được đăng ký");
                    return;
                }

                // Tạo mã OTP ngẫu nhiên 6 số
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

                // Thêm user mới với trạng thái chưa xác minh
                return fetch("http://localhost:3000/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        name,
                        verified: false, // Phải xác minh mới được login
                        token: otpCode  // Lưu mã để so khớp
                    })
                }).then(res => {
                    if (!res || !res.ok) throw new Error("Lỗi khi đăng ký");

                    // Hiển thị mã (Mock email)
                    alert(`Đăng ký thành công! Mã xác minh của bạn là: ${otpCode}\n(Trong thực tế, mã này sẽ gửi về email của bạn)`);

                    // Chuyển hướng sang trang xác minh
                    window.location.href = `xacminh.html?email=${encodeURIComponent(email)}`;
                });
            })
            .catch(err => {
                console.error(err);
                alert("Không thể đăng ký: " + err.message);
            });
    });

}

// Bắt sự kiện click vào button "Đăng nhập ngay"
const loginBtn = document.getElementById("goLogin");
if (loginBtn) {
    loginBtn.addEventListener("click", function (e) {
        e.preventDefault(); // Ngăn submit form
        window.location.href = "dangnhap.html";
    });
}
