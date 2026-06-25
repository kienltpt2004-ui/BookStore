document.addEventListener("DOMContentLoaded", function () {

    /* ================= KIỂM TRA ĐĂNG NHẬP ================= */
    const userStr = sessionStorage.getItem("userLogin");
    if (!userStr) {
        window.location.replace("dangnhap.html");
        return;
    }

    const user = JSON.parse(userStr);
    const emailEl = document.getElementById("userEmail");
    if (emailEl) emailEl.innerText = user.email;

    /* ================= KIỂM TRA ADMIN ================= */
    const isAdmin = user.email === "admin@gmail.com";
    const cartLink = document.getElementById("cartLink");

    if (isAdmin) {
        if (cartLink) cartLink.style.display = "none";
        const menu = document.querySelector(".menu");
        if (menu) {
            // Kiểm tra xem đã có link Admin chưa để tránh duplicate
            if (!menu.querySelector("a[href='admin.html']")) {
                const adminLink = document.createElement("a");
                adminLink.href = "admin.html";
                adminLink.innerText = "Quản lý";
                adminLink.style.color = "#ff6b6b";
                adminLink.style.fontWeight = "bold";
                menu.appendChild(adminLink);
            }
        }
    } else {
        if (cartLink) cartLink.style.display = "inline";
    }

    /* ================= LOGOUT ================= */
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            sessionStorage.removeItem("userLogin");
            localStorage.removeItem("cart"); // Clear cart on logout
            window.location.replace("dangnhap.html");
        };
    }

    /* ================= BIẾN DỮ LIỆU ================= */
    let allProducts = [];
    let allCategories = [];

    /* ================= BANNER SLIDER DỰNG ĐỘNG ================= */
    let featuredProducts = [];
    let currentSliderIndex = 0;
    let sliderInterval = null;

    function initBannerSlider(products) {
        if (sliderInterval) {
            clearInterval(sliderInterval);
        }
        // Lấy các sản phẩm có rating >= 4.6 hoặc lấy top 5
        featuredProducts = products.filter(p => (p.rating || 0) >= 4.6).slice(0, 5);
        if (featuredProducts.length === 0) {
            featuredProducts = products.slice(0, 5);
        }

        if (featuredProducts.length > 0) {
            renderBannerSlide(0);
            createSliderDots();
            startAutoSlider();
        }
    }

    function renderBannerSlide(index) {
        if (!featuredProducts[index]) return;
        currentSliderIndex = index;
        const book = featuredProducts[index];

        const imgEl = document.getElementById("bannerImg");
        const titleEl = document.getElementById("bannerTitle");
        const authorEl = document.getElementById("bannerAuthor");
        const descEl = document.getElementById("bannerDesc");
        const priceEl = document.getElementById("bannerPrice");
        const yearEl = document.getElementById("bannerYear");
        const ratingEl = document.getElementById("bannerRating");
        
        if (imgEl) imgEl.src = book.img;
        if (titleEl) titleEl.innerText = book.title;
        if (authorEl) authorEl.innerHTML = `<strong>Tác giả:</strong> ${book.author || "Đang cập nhật"}`;
        if (descEl) descEl.innerText = book.description || "Hãy đọc thử ngay hôm nay để trải nghiệm cuốn sách tuyệt vời này!";
        if (priceEl) priceEl.innerHTML = `<strong>Giá bán:</strong> ${book.price}`;
        if (yearEl) yearEl.innerHTML = `<strong>Năm xuất bản:</strong> ${book.year || "N/A"}`;
        
        if (ratingEl) {
            const fullStars = Math.floor(book.rating || 0);
            const hasHalfStar = (book.rating || 0) % 1 >= 0.5;
            let starsHTML = "";
            for (let i = 0; i < fullStars; i++) starsHTML += "⭐";
            if (hasHalfStar) starsHTML += "✨";
            ratingEl.innerHTML = `<strong>Đánh giá:</strong> ${starsHTML} (${book.rating || 0})`;
        }

        const actionsContainer = document.getElementById("bannerActions");
        if (actionsContainer) {
            actionsContainer.innerHTML = "";
            const stock = book.stock || 0;
            const isOutOfStock = stock === 0;

            if (isAdmin) {
                const editBtn = document.createElement("button");
                editBtn.className = "banner-btn btn-admin-edit";
                editBtn.innerHTML = "⚙️ Quản lý cuốn sách";
                editBtn.onclick = () => handleBookAdmin(book);
                actionsContainer.appendChild(editBtn);
            } else {
                const addBtn = document.createElement("button");
                addBtn.className = "banner-btn btn-add-cart";
                if (isOutOfStock) {
                    addBtn.innerText = "❌ Hết hàng";
                    addBtn.disabled = true;
                } else {
                    addBtn.innerText = "🛒 Mua ngay";
                    addBtn.onclick = () => addToCart(book);
                }
                actionsContainer.appendChild(addBtn);
            }
        }

        // Cập nhật dots active
        const dots = document.querySelectorAll(".banner-dot");
        dots.forEach((dot, idx) => {
            if (idx === index) dot.classList.add("active");
            else dot.classList.remove("active");
        });
    }

    function createSliderDots() {
        const dotsContainer = document.getElementById("bannerDots");
        if (!dotsContainer) return;
        dotsContainer.innerHTML = "";

        featuredProducts.forEach((_, idx) => {
            const dot = document.createElement("div");
            dot.className = "banner-dot";
            if (idx === 0) dot.classList.add("active");
            dot.onclick = () => {
                renderBannerSlide(idx);
                resetAutoSlider();
            };
            dotsContainer.appendChild(dot);
        });
    }

    function startAutoSlider() {
        sliderInterval = setInterval(() => {
            let nextIndex = (currentSliderIndex + 1) % featuredProducts.length;
            renderBannerSlide(nextIndex);
        }, 5000);
    }

    function resetAutoSlider() {
        clearInterval(sliderInterval);
        startAutoSlider();
    }

    /* ================= LOAD DỮ LIỆU ================= */
    function initData() {
        Promise.all([
            fetch("http://localhost:3000/categories").then(res => res.json()),
            fetch("http://localhost:3000/products").then(res => res.json())
        ]).then(([cats, prods]) => {
            allCategories = cats;
            allProducts = prods;
            renderAll();
            initBannerSlider(prods);
        }).catch(err => console.error("Lỗi load dữ liệu:", err));
    }

    /* ================= RENDER ================= */
    function renderAll() {
        // Duyệt qua từng danh mục để render sản phẩm tương ứng
        allCategories.forEach(cat => {
            // Tìm container tương ứng với ID danh mục (ví dụ: id="newBooks")
            const container = document.getElementById(cat.id);
            if (container) {
                // Cập nhật tiêu đề danh mục
                const h2 = container.parentElement.querySelector("h2");
                if (h2) h2.innerText = cat.name;

                // Lọc sản phẩm thuộc danh mục này
                const products = allProducts.filter(p => p.category === cat.id);
                renderBooks(products, cat.id);
            }
        });
    }

    function renderBooks(list, containerId) {
        const box = document.getElementById(containerId);
        if (!box) return;

        box.innerHTML = "";
        list.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.className = "book";

            // Kiểm tra tồn kho
            const stock = book.stock || 0;
            const isOutOfStock = stock === 0;
            const isLowStock = stock > 0 && stock <= 10;

            // Tạo rating stars
            const fullStars = Math.floor(book.rating || 0);
            const hasHalfStar = (book.rating || 0) % 1 >= 0.5;
            let starsHTML = "";
            for (let i = 0; i < fullStars; i++) {
                starsHTML += "⭐";
            }
            if (hasHalfStar) {
                starsHTML += "✨";
            }

            // Tạo badge số lượng
            let stockBadge = "";
            if (isOutOfStock) {
                stockBadge = '<div class="stock-badge out-of-stock">Hết hàng</div>';
            } else if (isLowStock) {
                stockBadge = `<div class="stock-badge low-stock">Chỉ còn ${stock} cuốn</div>`;
            } else {
                stockBadge = `<div class="stock-badge in-stock">Còn ${stock} cuốn</div>`;
            }

            bookCard.innerHTML = `
                ${stockBadge}
                <img src="${book.img}" alt="${book.title}">
                <h4>${book.title}</h4>
                <p class="book-author">📚 ${book.author || "Đang cập nhật"}</p>
                <p class="book-description">${book.description || ""}</p>
                <div class="book-info">
                    <span class="book-year">📅 ${book.year || "N/A"}</span>
                    <span class="book-pages">📖 ${book.pages || "N/A"} trang</span>
                </div>
                <div class="book-rating">${starsHTML} <span class="rating-number">${book.rating || "N/A"}</span></div>
                <p class="book-price">${book.price}</p>
            `;

            if (isAdmin) {
                // Admin click để sửa/xóa
                bookCard.style.cursor = "pointer";
                bookCard.onclick = () => handleBookAdmin(book);
            } else {
                // User click để thêm giỏ
                const addBtn = document.createElement("button");
                addBtn.className = "add-to-cart-btn";

                if (isOutOfStock) {
                    addBtn.innerText = "❌ Hết hàng";
                    addBtn.disabled = true;
                    addBtn.style.backgroundColor = "#999";
                    addBtn.style.cursor = "not-allowed";
                } else {
                    addBtn.innerText = "🛒 Thêm vào giỏ";
                    addBtn.onclick = (e) => {
                        e.stopPropagation();
                        addToCart(book);
                    };
                }

                bookCard.appendChild(addBtn);
            }

            box.appendChild(bookCard);
        });
    }

    /* ================= BIẾN ĐỂ THEO DÕI SẢN PHẨM ĐANG SỬA ================= */
    let editingBook = null;

    /* ================= DỰNG SỰ KIỆN CHO MODAL (CHỈ CẦN GẮN 1 LẦN) ================= */
    const bookModal = document.getElementById("bookModal");
    const saveBookBtn = document.getElementById("saveBook");
    const deleteBookBtn = document.getElementById("deleteBook");
    const closeModalBtn = document.getElementById("closeModal");
    const closeModalCrossBtn = document.getElementById("closeModalCross");

    if (bookModal) {
        if (closeModalBtn) {
            closeModalBtn.onclick = () => bookModal.classList.remove("active");
        }
        if (closeModalCrossBtn) {
            closeModalCrossBtn.onclick = () => bookModal.classList.remove("active");
        }
        // Đóng khi click ngoài modal-content
        bookModal.onclick = (e) => {
            if (e.target === bookModal) {
                bookModal.classList.remove("active");
            }
        };
    }

    if (saveBookBtn) {
        saveBookBtn.onclick = async () => {
            if (!editingBook) return;

            const title = document.getElementById("modalTitle").value.trim();
            const author = document.getElementById("modalAuthor").value.trim();
            const price = document.getElementById("modalPrice").value.trim();
            const stock = parseInt(document.getElementById("modalStock").value);
            const img = document.getElementById("modalImg").value.trim();

            if (!title || !author || !price || isNaN(stock) || !img) {
                alert("❌ Vui lòng nhập đầy đủ thông tin bắt buộc!");
                return;
            }

            if (stock < 0) {
                alert("❌ Số lượng tồn kho không được âm!");
                return;
            }

            const updatedData = { title, author, price, stock, img };

            try {
                const res = await fetch(`http://localhost:3000/products/${editingBook.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedData)
                });
                if (!res.ok) throw new Error("Lỗi khi cập nhật");

                alert("✅ Đã cập nhật sản phẩm thành công!");
                bookModal.classList.remove("active");
                initData();
            } catch (err) {
                alert("❌ Lỗi: " + err.message);
            }
        };
    }

    if (deleteBookBtn) {
        deleteBookBtn.onclick = async () => {
            if (!editingBook) return;

            if (confirm(`🗑️ Bạn có chắc chắn muốn xóa vĩnh viễn cuốn sách:\n"${editingBook.title}"?`)) {
                try {
                    const res = await fetch(`http://localhost:3000/products/${editingBook.id}`, {
                        method: "DELETE"
                    });
                    if (!res.ok) throw new Error("Lỗi khi xóa");

                    alert("✅ Đã xóa sản phẩm thành công!");
                    bookModal.classList.remove("active");
                    initData();
                } catch (err) {
                    alert("❌ Lỗi: " + err.message);
                }
            }
        };
    }

    /* ================= ADMIN: SỬA / XOÁ SÁCH NGAY TRÊN TRANG CHỦ ================= */
    function handleBookAdmin(book) {
        editingBook = book;

        const titleEl = document.getElementById("modalTitle");
        const authorEl = document.getElementById("modalAuthor");
        const priceEl = document.getElementById("modalPrice");
        const stockEl = document.getElementById("modalStock");
        const imgEl = document.getElementById("modalImg");

        if (titleEl) titleEl.value = book.title || "";
        if (authorEl) authorEl.value = book.author || "";
        if (priceEl) priceEl.value = book.price || "";
        if (stockEl) stockEl.value = book.stock || 0;
        if (imgEl) imgEl.value = book.img || "";

        if (bookModal) {
            bookModal.classList.add("active");
        }
    }

    /* ================= GIỎ HÀNG ================= */
    function addToCart(book) {
        // Kiểm tra tồn kho
        const stock = book.stock || 0;
        if (stock === 0) {
            alert("❌ Sản phẩm này hiện đã hết hàng!");
            return;
        }

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingIndex = cart.findIndex(item => item.id === book.id || item.title === book.title);

        if (existingIndex >= 0) {
            // Kiểm tra số lượng trong giỏ + 1 có vượt quá stock không
            const currentQty = cart[existingIndex].quantity;
            if (currentQty >= stock) {
                alert(`❌ Không thể thêm! Chỉ còn ${stock} cuốn trong kho.`);
                return;
            }
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                id: book.id,
                title: book.title,
                price: book.price,
                img: book.img,
                quantity: 1,
                maxStock: stock  // Lưu stock để kiểm tra sau
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`✅ Đã thêm "${book.title}" vào giỏ hàng!\n(Còn lại: ${stock - (existingIndex >= 0 ? cart[existingIndex].quantity : 1)} cuốn)`);
    }

    /* ================= THÊM SÁCH FORM (ẨN KHI KHÔNG PHẢI ADMIN) ================= */
    const addForm = document.getElementById("addBookForm");
    if (addForm) {
        if (!isAdmin) {
            addForm.parentElement.style.display = "none";
        }

        addForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!isAdmin) return;

            const title = document.getElementById("addTitle").value.trim();
            const price = document.getElementById("addPrice").value.trim();
            const img = document.getElementById("addImg").value.trim();
            const stock = parseInt(document.getElementById("addStock").value) || 0;

            if (!title || !price || !img) return alert("Thiếu thông tin!");
            if (stock < 0) return alert("Số lượng không hợp lệ!");

            // Mặc định thêm vào category Bán Chạy
            const newBook = {
                title,
                price,
                img,
                stock,
                category: "bestSellers",
                author: "Đang cập nhật",
                description: "",
                year: new Date().getFullYear(),
                pages: 0,
                rating: 0
            };

            fetch("http://localhost:3000/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBook)
            })
                .then(() => {
                    alert("✅ Thêm thành công!");
                    addForm.reset();
                    initData();
                });
        });
    }

    /* ================= TÌM KIẾM ================= */
    const searchInput = document.getElementById("searchBook");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const keyword = this.value.toLowerCase();

            // Lọc trên toàn bộ sản phẩm trước (bao gồm tên sách và tác giả)
            const matchedProducts = allProducts.filter(p => 
                p.title.toLowerCase().includes(keyword) || 
                (p.author && p.author.toLowerCase().includes(keyword))
            );

            // Sau đó render lại theo từng category, nhưng chỉ những item match
            allCategories.forEach(cat => {
                const filteredList = matchedProducts.filter(p => p.category === cat.id);
                renderBooks(filteredList, cat.id);
            });
        });
    }

    // Khởi chạy
    initData();
});
