document.addEventListener("DOMContentLoaded", function () {

    /* ================= KIỂM TRA QUYỀN ADMIN ================= */
    const userStr = sessionStorage.getItem("userLogin");
    if (!userStr) {
        alert("⚠️ Vui lòng đăng nhập để truy cập trang này!");
        window.location.replace("dangnhap.html");
        return;
    }

    const user = JSON.parse(userStr);

    // Chỉ admin mới được truy cập
    if (user.email !== "admin@gmail.com") {
        alert("⛔ Bạn không có quyền truy cập trang này!");
        window.location.replace("manhinhchinh.html");
        return;
    }

    // Hiển thị email admin
    const emailEl = document.getElementById("adminEmail");
    if (emailEl) emailEl.innerText = user.email;

    /* ================= LOGOUT ================= */
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            sessionStorage.removeItem("userLogin");
            window.location.replace("dangnhap.html");
        };
    }

    /* ================= BIẾN TOÀN CỤC ================= */
    let allProducts = [];
    let allCategories = [];
    let allOrders = []; // Thêm biến lưu đơn hàng
    let currentFilter = "all";
    let editingProductId = null; // ID sản phẩm đang sửa

    /* ================= LOAD DỮ LIỆU BAN ĐẦU ================= */
    function initData() {
        Promise.all([
            fetch("http://localhost:3000/categories").then(res => res.json()),
            fetch("http://localhost:3000/products").then(res => res.json())
        ]).then(([cats, prods]) => {
            allCategories = cats;
            allProducts = prods;
            renderCategoryTable();
            renderTable(); // Render bảng sản phẩm
            updateCategoryDropdowns();
        }).catch(err => console.error("Lỗi init data:", err));
    }

    /* ================= QUẢN LÝ SẢN PHẨM ================= */
    function renderTable() {
        const tbody = document.getElementById("productTableBody");
        if (!tbody) return;

        let filtered = allProducts;
        if (currentFilter !== "all") {
            filtered = allProducts.filter(p => p.category === currentFilter);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <h3>📦 Không có sản phẩm nào</h3>
                        <p>Thêm sản phẩm mới để bắt đầu</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = "";
        filtered.forEach(product => {
            const catName = getCategoryName(product.category);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${product.img}" alt="${product.title}"></td>
                <td><strong>${product.title}</strong></td>
                <td><span style="color: #dc3545; font-weight: bold;">${product.price}</span></td>
                <td><span class="category-badge">${catName}</span></td>
                <td>
                    <button class="btn-edit btn-edit-prod" data-id="${product.id}">✏️ Sửa</button>
                    <button class="btn-delete btn-delete-prod" data-id="${product.id}" data-name="${product.title}">🗑️ Xóa</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Gắn event listeners
        document.querySelectorAll(".btn-edit-prod").forEach(btn => {
            btn.onclick = () => editProduct(btn.dataset.id);
        });
        document.querySelectorAll(".btn-delete-prod").forEach(btn => {
            btn.onclick = () => deleteProduct(btn.dataset.id, btn.dataset.name);
        });
    }

    function getCategoryName(catId) {
        const cat = allCategories.find(c => c.id === catId);
        return cat ? cat.name : catId;
    }

    /* ================= FILTER ================= */
    const filterSelect = document.getElementById("categoryFilter");
    if (filterSelect) {
        filterSelect.addEventListener("change", function () {
            currentFilter = this.value;
            renderTable();
        });
    }

    /* ================= MODAL SẢN PHẨM ================= */
    const modal = document.getElementById("productModal");
    const modalTitle = document.getElementById("modalTitle");
    const btnAddProduct = document.getElementById("btnAddProduct");
    const btnCancelModal = document.getElementById("btnCancelModal");
    const productForm = document.getElementById("productForm");

    if (btnAddProduct) {
        btnAddProduct.onclick = () => {
            editingProductId = null;
            modalTitle.innerText = "Thêm Sản Phẩm Mới";
            productForm.reset();
            const categorySelect = document.getElementById("productCategory");
            if (categorySelect) categorySelect.value = "bestSellers";
            modal.style.display = "block";
        };
    }

    function hideModal() {
        modal.style.display = "none";
        productForm.reset();
        editingProductId = null;
    }

    if (btnCancelModal) btnCancelModal.onclick = hideModal;

    /* ================= THÊM / SỬA SẢN PHẨM ================= */
    if (productForm) {
        productForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const title = document.getElementById("productTitle").value.trim();
            const price = document.getElementById("productPrice").value.trim();
            const img = document.getElementById("productImg").value.trim();
            const category = document.getElementById("productCategory").value;

            if (!title || !price || !img || !category) {
                alert("❌ Vui lòng điền đủ thông tin!");
                return;
            }

            const data = { title, price, img, category };

            try {
                let url = "http://localhost:3000/products";
                let method = "POST";

                if (editingProductId) {
                    url = `http://localhost:3000/products/${editingProductId}`;
                    method = "PATCH"; // Dùng PATCH để chỉ cập nhật các trường thay đổi
                }

                const response = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                if (!response.ok) throw new Error("Không thể lưu dữ liệu lên server");

                alert(editingProductId ? "✅ Cập nhật sản phẩm thành công!" : "✅ Thêm sản phẩm thành công!");
                hideModal();
                initData(); // Tải lại dữ liệu mới nhất
            } catch (err) {
                console.error("Lỗi khi lưu sản phẩm:", err);
                alert("❌ Lỗi: " + err.message);
            }
        });
    }

    /* ================= SỬA SẢN PHẨM ================= */
    function editProduct(id) {
        // Tìm sản phẩm trong mảng local (đã tải từ initData)
        const product = allProducts.find(p => p.id == id);
        if (!product) {
            alert("❌ Không tìm thấy thông tin sản phẩm!");
            return;
        }

        editingProductId = id;
        document.getElementById("productTitle").value = product.title;
        document.getElementById("productPrice").value = product.price;
        document.getElementById("productImg").value = product.img;
        document.getElementById("productCategory").value = product.category;

        modalTitle.innerText = "Sửa Sản Phẩm (ID: " + id + ")";
        modal.style.display = "block";
    }

    /* ================= XÓA SẢN PHẨM ================= */
    async function deleteProduct(id, name) {
        if (!confirm(`🗑️ Bạn có chắc chắn muốn xóa vĩnh viễn cuốn sách:\n"${name}"?`)) return;

        try {
            const response = await fetch(`http://localhost:3000/products/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Server từ chối yêu cầu xóa");

            alert("✅ Đã xóa sản phẩm thành công!");
            initData(); // Cập nhật lại giao diện
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm:", err);
            alert("❌ Lỗi: " + err.message);
        }
    }


    /* ================= QUẢN LÝ DANH MỤC ================= */
    function renderCategoryTable() {
        const tbody = document.getElementById("categoryTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        allCategories.forEach(cat => {
            // Đếm số sản phẩm
            const count = allProducts.filter(p => p.category === cat.id).length;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${cat.id}</strong></td>
                <td>${cat.name}</td>
                <td><span class="category-badge">${count} sản phẩm</span></td>
                <td>
                    <button class="btn-edit btn-edit-cat" data-id="${cat.id}">✏️ Sửa</button>
                    <button class="btn-delete btn-delete-cat" data-id="${cat.id}">🗑️ Xóa</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.querySelectorAll(".btn-edit-cat").forEach(btn => {
            btn.onclick = () => editCategory(btn.dataset.id);
        });
        document.querySelectorAll(".btn-delete-cat").forEach(btn => {
            btn.onclick = () => deleteCategory(btn.dataset.id);
        });
    }

    function updateCategoryDropdowns() {
        // Product Modal Select
        const select = document.getElementById("productCategory");
        if (select) {
            select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
            allCategories.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat.id; // Lưu ID danh mục vào value
                opt.textContent = cat.name;
                select.appendChild(opt);
            });
        }

        // Filter Select
        const filter = document.getElementById("categoryFilter");
        if (filter) {
            const current = filter.value;
            filter.innerHTML = '<option value="all">Tất cả</option>';
            allCategories.forEach(cat => {
                const opt = document.createElement("option");
                opt.value = cat.id;
                opt.textContent = cat.name;
                filter.appendChild(opt);
            });
            filter.value = current;
        }
    }

    /* ================= MODAL DANH MỤC ================= */
    const catModal = document.getElementById("categoryModal");
    const catTitle = document.getElementById("categoryModalTitle");
    const btnAddCat = document.getElementById("btnAddCategory");
    const btnCancelCat = document.getElementById("btnCancelCategoryModal");
    const catForm = document.getElementById("categoryForm");
    let isEditingCat = false;
    let editingCatId = null;

    if (btnAddCat) {
        btnAddCat.onclick = () => {
            isEditingCat = false;
            catTitle.innerText = "Thêm Danh Mục Mới";
            catForm.reset();
            const codeInput = document.getElementById("categoryCode");
            codeInput.readOnly = false;
            codeInput.style.background = "white";
            catModal.style.display = "block";
        };
    }

    function hideCatModal() {
        catModal.style.display = "none";
        catForm.reset();
    }
    if (btnCancelCat) btnCancelCat.onclick = hideCatModal;

    function editCategory(id) {
        const cat = allCategories.find(c => c.id === id);
        if (!cat) return;

        isEditingCat = true;
        editingCatId = id;

        const codeInput = document.getElementById("categoryCode");
        codeInput.value = cat.id;
        codeInput.readOnly = true;
        codeInput.style.background = "#f5f5f5";

        document.getElementById("categoryName").value = cat.name;
        catTitle.innerText = "Sửa Danh Mục";
        catModal.style.display = "block";
    }

    if (catForm) {
        catForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const id = document.getElementById("categoryCode").value.trim();
            const name = document.getElementById("categoryName").value.trim();

            if (!id || !name) return alert("Thiếu thông tin!");

            if (!/^[a-zA-Z0-9_]+$/.test(id)) {
                return alert("Mã danh mục chỉ được chứa chữ, số và gạch dưới!");
            }

            if (isEditingCat) {
                // Sửa: PUT /categories/:id
                fetch(`http://localhost:3000/categories/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, name })
                }).then(() => {
                    alert("✅ Sửa danh mục thành công");
                    hideCatModal();
                    initData();
                });
            } else {
                // Thêm: POST /categories
                // Check tồn tại
                if (allCategories.find(c => c.id === id)) return alert("Mã danh mục đã tồn tại!");

                fetch("http://localhost:3000/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, name })
                }).then(() => {
                    alert("✅ Thêm danh mục thành công");
                    hideCatModal();
                    initData();
                });
            }
        });
    }

    function deleteCategory(id) {
        const count = allProducts.filter(p => p.category === id).length;
        if (count > 0) {
            // Cảnh báo + Xóa cascading
            if (!confirm(`⚠️ Danh mục này có ${count} sản phẩm.\nXóa danh mục sẽ XÓA LUÔN các sản phẩm đó.\nBạn có chắc không?`)) return;
        } else {
            if (!confirm("Bạn chắc muốn xóa danh mục này?")) return;
        }

        // Xóa tất cả sản phẩm thuộc danh mục này (nếu có)
        // JSON Server không hỗ trợ delete where, nên phải loop delete
        // Hoặc xóa category trước rồi xóa products
        const productsToDelete = allProducts.filter(p => p.category === id);
        const deletePromises = productsToDelete.map(p =>
            fetch(`http://localhost:3000/products/${p.id}`, { method: "DELETE" })
        );

        Promise.all(deletePromises)
            .then(() => {
                // Xóa category
                return fetch(`http://localhost:3000/categories/${id}`, { method: "DELETE" });
            })
            .then(() => {
                alert("✅ Đã xóa danh mục và sản phẩm liên quan");
                initData();
            })
            .catch(err => alert("Lỗi: " + err));
    }

    /* ================= QUẢN LÝ USERS ================= */
    let allUsers = [];
    let editingUserId = null;

    function loadUsers() {
        fetch("http://localhost:3000/users")
            .then(res => res.json())
            .then(users => {
                allUsers = users;
                renderUserTable();
            })
            .catch(err => console.error("Lỗi:", err));
    }

    function renderUserTable() {
        const tbody = document.getElementById("userTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";
        allUsers.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${user.id}</strong></td>
                <td>${user.email}</td>
                <td>${user.name || "N/A"}</td>
                <td>****</td>
                <td>
                    <button class="btn-edit btn-edit-user" data-id="${user.id}">Sửa</button>
                    <button class="btn-delete btn-delete-user" data-id="${user.id}" data-email="${user.email}">Xóa</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.querySelectorAll(".btn-edit-user").forEach(btn => btn.onclick = () => editUser(btn.dataset.id));
        document.querySelectorAll(".btn-delete-user").forEach(btn => btn.onclick = () => deleteUser(btn.dataset.id, btn.dataset.email));
    }

    // ... Logic user form giống trước, chỉ cần đảm bảo dùng allUsers chuẩn ...
    // Để cho gọn, tôi sẽ copy lại logic user modal nhưng adapt với biến cục bộ để tránh conflict

    // [PHẦN NÀY GIỮ NGUYÊN HOẶC CHỈNH NHẸ NHƯNG VẪN HOẠT ĐỘNG TỐT VỚI API /users]
    // Vì /users endpoint không đổi cấu trúc nên logic cũ vẫn chạy tốt. 
    // Tôi sẽ tích hợp lại logic loadUsers vào tab switching.

    /* ================= TAB SWITCHING ================= */
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.onclick = function () {
            const target = this.dataset.tab;
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
            document.getElementById(`tab-${target}`).classList.add("active");

            if (target === "dashboard") loadDashboardStats();
            if (target === "users") loadUsers();
            if (target === "orders") loadOrders(); // Thêm load đơn hàng
            // Category và Product đã load ở initData, nhưng nếu muốn refresh:
            if (target === "products" || target === "categories") initData();
        };
    });

    /* ================= QUẢN LÝ ĐƠN HÀNG (CORE LOGIC) ================= */
    async function loadOrders() {
        try {
            const res = await fetch("http://localhost:3000/orders");
            if (!res.ok) throw new Error("Không thể tải đơn hàng");
            allOrders = await res.json();
            renderOrderTable();
        } catch (err) {
            console.error("Lỗi:", err);
        }
    }

    function renderOrderTable() {
        const tbody = document.getElementById("orderTableBody");
        if (!tbody) return;

        if (allOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><h3>🛒 Chưa có đơn hàng nào</h3></td></tr>';
            return;
        }

        tbody.innerHTML = "";
        allOrders.forEach(order => {
            const date = new Date(order.date).toLocaleString('vi-VN');
            const status = order.status || "Đang xử lý";
            const paymentMethod = order.paymentMethod || "Tiền mặt";
            const paymentStatus = order.paymentStatus || (paymentMethod === "Chuyển khoản" ? "Chưa thanh toán" : "Thanh toán khi nhận hàng");

            // Tạo badge màu theo trạng thái đơn hàng
            let statusClass = "status-pending";
            if (status === "Đang giao") statusClass = "status-shipping";
            else if (status === "Đã giao") statusClass = "status-delivered";
            else if (status === "Đã hủy") statusClass = "status-cancelled";

            // Tạo màu cho trạng thái thanh toán
            let payStatusClass = "pay-unpaid";
            if (paymentStatus === "Đã thanh toán") payStatusClass = "pay-paid";
            else if (paymentStatus === "Thanh toán khi nhận hàng") payStatusClass = "pay-cod";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>#${order.id}</strong></td>
                <td>${order.userEmail}</td>
                <td><span style="color: #dc3545; font-weight: bold;">${order.total}</span></td>
                <td><span class="method-badge">${paymentMethod}</span></td>
                <td>
                    <select class="pay-status-select ${payStatusClass}" onchange="updatePaymentStatus('${order.id}', this.value)">
                        <option value="Chưa thanh toán" ${paymentStatus === "Chưa thanh toán" ? "selected" : ""}>❌ Chưa thanh toán</option>
                        <option value="Đã thanh toán" ${paymentStatus === "Đã thanh toán" ? "selected" : ""}>✅ Đã thanh toán</option>
                        <option value="Thanh toán khi nhận hàng" ${paymentStatus === "Thanh toán khi nhận hàng" ? "selected" : ""}>🚚 Khi nhận hàng</option>
                    </select>
                </td>
                <td>
                    <select class="status-select ${statusClass}" data-order-id="${order.id}" onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="Đang xử lý" ${status === "Đang xử lý" ? "selected" : ""}>⏳ Đang xử lý</option>
                        <option value="Đang giao" ${status === "Đang giao" ? "selected" : ""}>🚚 Đang giao</option>
                        <option value="Đã giao" ${status === "Đã giao" ? "selected" : ""}>✅ Đã giao</option>
                        <option value="Đã hủy" ${status === "Đã hủy" ? "selected" : ""}>❌ Đã hủy</option>
                    </select>
                </td>
                <td>${date}</td>
                <td>
                    <button class="btn-view" onclick="viewOrderDetails('${order.id}')">👁️ Xem chi tiết</button>
                </td>
                <td>
                    <button class="btn-delete" onclick="deleteOrder('${order.id}')">🗑️ Xóa</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    /* --- CHI TIẾT ĐƠN HÀNG --- */
    window.viewOrderDetails = function (orderId) {
        const order = allOrders.find(o => o.id === orderId);
        if (!order) return;

        const itemsBody = document.getElementById("orderItemsBody");
        const modalTotal = document.getElementById("modalOrderTotal");
        const modal = document.getElementById("orderDetailModal");
        const detailContent = document.getElementById("orderDetailContent");

        // Thêm thông tin đơn hàng và địa chỉ giao hàng
        let shippingInfo = "";
        if (order.shippingInfo) {
            const info = order.shippingInfo;
            shippingInfo = `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 10px; color: #333;">📦 Thông Tin Giao Hàng</h3>
                    <p><strong>Người nhận:</strong> ${info.fullName}</p>
                    <p><strong>Số điện thoại:</strong> ${info.phone}</p>
                    <p><strong>Email:</strong> ${info.email}</p>
                    <p><strong>Địa chỉ:</strong> ${info.address}, ${info.district}, ${info.city}</p>
                    ${info.note ? `<p><strong>Ghi chú:</strong> ${info.note}</p>` : ""}
                </div>
                <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p><strong>Ngày đặt:</strong> ${new Date(order.date).toLocaleString('vi-VN')}</p>
                    <p><strong>Trạng thái:</strong> <span style="font-weight: bold; color: #0366d6;">${order.status || "Đang xử lý"}</span></p>
                    <hr style="margin: 10px 0; border-top: 1px solid #cce5ff;">
                    <p><strong>Phương thức:</strong> ${order.paymentMethod || "Tiền mặt"}</p>
                    <p><strong>Thanh toán:</strong> <span style="font-weight: bold; color: #d63384;">${order.paymentStatus || "Chưa xác định"}</span></p>
                </div>
            `;
        }

        itemsBody.innerHTML = "";
        order.items.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${item.img}" alt="${item.title}"></td>
                <td>${item.title}</td>
                <td>${item.price}</td>
                <td>${item.quantity}</td>
                <td style="font-weight: bold;">${item.price}</td>
            `;
            itemsBody.appendChild(row);
        });

        // Xóa thông tin cũ nếu có
        const oldInfo = detailContent.querySelector(".shipping-info-display");
        if (oldInfo) oldInfo.remove();

        // Chèn shipping info vào đầu detail content
        const table = detailContent.querySelector("table");
        if (shippingInfo && table) {
            const tempDiv = document.createElement("div");
            tempDiv.className = "shipping-info-display";
            tempDiv.innerHTML = shippingInfo;
            detailContent.insertBefore(tempDiv, table);
        }

        modalTotal.innerText = order.total;
        modal.style.display = "block";
    };

    window.deleteOrder = async function (orderId) {
        if (!confirm(`Bạn có chắc muốn xóa đơn hàng #${orderId}?`)) return;

        try {
            const res = await fetch(`http://localhost:3000/orders/${orderId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Lỗi xóa đơn hàng");
            alert("✅ Đã xóa đơn hàng!");
            loadOrders();
        } catch (err) {
            alert("❌ Lỗi: " + err.message);
        }
    };

    /* --- CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG --- */
    window.updateOrderStatus = async function (orderId, newStatus) {
        try {
            const res = await fetch(`http://localhost:3000/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Không thể cập nhật trạng thái");

            // Cập nhật local array
            const order = allOrders.find(o => o.id === orderId);
            if (order) order.status = newStatus;

            // Cập nhật class cho select
            const select = document.querySelector(`select[data-order-id="${orderId}"]`);
            if (select) {
                select.className = "status-select";
                if (newStatus === "Đang giao") select.classList.add("status-shipping");
                else if (newStatus === "Đã giao") select.classList.add("status-delivered");
                else if (newStatus === "Đã hủy") select.classList.add("status-cancelled");
                else select.classList.add("status-pending");
            }

            // Hiển thị thông báo
            const statusMessages = {
                "Đang xử lý": "⏳ Đơn hàng đang được xử lý",
                "Đang giao": "🚚 Đơn hàng đang được giao",
                "Đã giao": "✅ Đơn hàng đã giao thành công",
                "Đã hủy": "❌ Đơn hàng đã bị hủy"
            };

            alert(statusMessages[newStatus] || "Đã cập nhật trạng thái");
        } catch (err) {
            alert("❌ Lỗi: " + err.message);
            loadOrders(); // Reload để reset về trạng thái cũ
        }
    };

    /* --- CẬP NHẬT TRẠNG THÁI THANH TOÁN --- */
    window.updatePaymentStatus = async function (orderId, newStatus) {
        try {
            const res = await fetch(`http://localhost:3000/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: newStatus })
            });

            if (!res.ok) throw new Error("Không thể cập nhật trạng thái thanh toán");

            // Cập nhật local array
            const order = allOrders.find(o => o.id === orderId);
            if (order) order.paymentStatus = newStatus;

            alert("✅ Đã cập nhật trạng thái thanh toán!");
            loadOrders(); // Reload để cập nhật màu sắc
        } catch (err) {
            alert("❌ Lỗi: " + err.message);
            loadOrders();
        }
    };

    // Modal Close cho đơn hàng
    const orderModal = document.getElementById("orderDetailModal");
    const btnCloseOrder = document.getElementById("btnCloseOrderDetail");
    if (btnCloseOrder) btnCloseOrder.onclick = () => orderModal.style.display = "none";

    // Modal Close logic chung
    window.onclick = (e) => {
        if (e.target.classList.contains("modal")) e.target.style.display = "none";
        // Also close buttons (x)
        if (e.target.classList.contains("close") || e.target.classList.contains("close-user") || e.target.classList.contains("close-category") || e.target.classList.contains("close-order-detail")) {
            const m = e.target.closest(".modal");
            if (m) m.style.display = "none";
        }
    };

    /* === LOGIC USER MODAL ĐẦY ĐỦ === */
    const userModal = document.getElementById("userModal");
    const btnAddUser = document.getElementById("btnAddUser");
    const userForm = document.getElementById("userForm");

    if (btnAddUser) {
        btnAddUser.onclick = () => {
            editingUserId = null;
            document.getElementById("userModalTitle").innerText = "Thêm User";
            userForm.reset();
            userModal.style.display = "block";
        }
    }

    if (userForm) {
        userForm.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById("userEmail").value.trim();
            const name = document.getElementById("userName").value.trim();
            const password = document.getElementById("userPassword").value.trim();

            if (editingUserId) {
                fetch(`http://localhost:3000/users/${editingUserId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, name, password })
                }).then(() => { alert("OK"); userModal.style.display = "none"; loadUsers(); });
            } else {
                if (allUsers.find(u => u.email === email)) return alert("Email tồn tại!");
                fetch(`http://localhost:3000/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, name, password })
                }).then(() => { alert("Thêm mới tài khoản thành công"); userModal.style.display = "none"; loadUsers(); });
            }
        }
    }

    function editUser(id) {
        const u = allUsers.find(x => x.id == id);
        if (!u) return;
        editingUserId = id;
        document.getElementById("userEmail").value = u.email;
        document.getElementById("userName").value = u.name || "";
        document.getElementById("userPassword").value = u.password;
        document.getElementById("userModalTitle").innerText = "Sửa User";
        userModal.style.display = "block";
    }

    function deleteUser(id, email) {
        if (email === "admin@gmail.com") return alert("Không được xóa Admin!");
        if (!confirm("Xóa user này?")) return;
        fetch(`http://localhost:3000/users/${id}`, { method: "DELETE" })
            .then(() => loadUsers());
    }

    /* ================= DASHBOARD / THỐNG KÊ ================= */
    async function loadDashboardStats() {
        try {
            // Load all data
            const [products, orders, users] = await Promise.all([
                fetch("http://localhost:3000/products").then(res => res.json()),
                fetch("http://localhost:3000/orders").then(res => res.json()),
                fetch("http://localhost:3000/users").then(res => res.json())
            ]);

            // Calculate statistics
            const totalProducts = products.length;
            const totalOrders = orders.length;
            const totalUsers = users.length;

            // Calculate total revenue
            let totalRevenue = 0;
            orders.forEach(order => {
                const price = parseInt(order.total.replace(/[.,đ]/g, "")) || 0;
                totalRevenue += price;
            });

            // Update stat cards
            document.getElementById("totalProducts").innerText = totalProducts;
            document.getElementById("totalOrders").innerText = totalOrders;
            document.getElementById("totalUsers").innerText = totalUsers;
            document.getElementById("totalRevenue").innerText = totalRevenue.toLocaleString("vi-VN") + "đ";

            // Order status statistics
            const statusCounts = {
                "Đang xử lý": 0,
                "Đang giao": 0,
                "Đã giao": 0,
                "Đã hủy": 0
            };

            orders.forEach(order => {
                const status = order.status || "Đang xử lý";
                if (statusCounts.hasOwnProperty(status)) {
                    statusCounts[status]++;
                }
            });

            const maxCount = Math.max(...Object.values(statusCounts), 1);

            // Update status bars
            document.getElementById("pendingCount").innerText = statusCounts["Đang xử lý"];
            document.getElementById("shippingCount").innerText = statusCounts["Đang giao"];
            document.getElementById("deliveredCount").innerText = statusCounts["Đã giao"];
            document.getElementById("cancelledCount").innerText = statusCounts["Đã hủy"];

            document.getElementById("pendingBar").style.width = (statusCounts["Đang xử lý"] / maxCount * 100) + "%";
            document.getElementById("shippingBar").style.width = (statusCounts["Đang giao"] / maxCount * 100) + "%";
            document.getElementById("deliveredBar").style.width = (statusCounts["Đã giao"] / maxCount * 100) + "%";
            document.getElementById("cancelledBar").style.width = (statusCounts["Đã hủy"] / maxCount * 100) + "%";

            // Calculate top selling products
            const productSales = {};
            orders.forEach(order => {
                order.items.forEach(item => {
                    if (!productSales[item.id]) {
                        productSales[item.id] = {
                            title: item.title,
                            quantity: 0,
                            img: item.img
                        };
                    }
                    productSales[item.id].quantity += item.quantity;
                });
            });

            // Convert to array and sort
            const topProducts = Object.entries(productSales)
                .map(([id, data]) => {
                    const product = products.find(p => p.id == id);
                    return {
                        id,
                        title: data.title,
                        quantity: data.quantity,
                        category: product ? product.category : "N/A",
                        stock: product ? product.stock : 0
                    };
                })
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

            // Render top products
            const topProductsBody = document.getElementById("topProductsBody");
            topProductsBody.innerHTML = "";
            topProducts.forEach((product, index) => {
                const catName = getCategoryName(product.category);
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><strong>#${index + 1}</strong></td>
                    <td>${product.title}</td>
                    <td><span class="category-badge">${catName}</span></td>
                    <td><strong style="color: #28a745;">${product.quantity}</strong></td>
                    <td>${product.stock}</td>
                `;
                topProductsBody.appendChild(row);
            });

            // Recent orders (last 5)
            const recentOrders = orders
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            const recentOrdersBody = document.getElementById("recentOrdersBody");
            recentOrdersBody.innerHTML = "";
            recentOrders.forEach(order => {
                const status = order.status || "Đang xử lý";
                let statusClass = "status-pending";
                if (status === "Đang giao") statusClass = "status-shipping";
                else if (status === "Đã giao") statusClass = "status-delivered";
                else if (status === "Đã hủy") statusClass = "status-cancelled";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><strong>#${order.id}</strong></td>
                    <td>${order.userEmail}</td>
                    <td><span style="color: #dc3545; font-weight: bold;">${order.total}</span></td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>${new Date(order.date).toLocaleString('vi-VN')}</td>
                `;
                recentOrdersBody.appendChild(row);
            });

        } catch (err) {
            console.error("Lỗi load dashboard:", err);
        }
    }

    // Refresh button
    const btnRefreshStats = document.getElementById("btnRefreshStats");
    if (btnRefreshStats) {
        btnRefreshStats.onclick = () => {
            loadDashboardStats();
            alert("✅ Đã làm mới thống kê!");
        };
    }

    // Khởi chạy
    initData();
    loadDashboardStats(); // Load dashboard stats on init

});
