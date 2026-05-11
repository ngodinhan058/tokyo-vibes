document.addEventListener("DOMContentLoaded", function () {
    // --------------------------------------------------
    // 1. SCROLL ANIMATION (Cuộn trang)
    // --------------------------------------------------
    const animatedElements = document.querySelectorAll('.scroll-animate');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    animatedElements.forEach(el => observer.observe(el));

    // --------------------------------------------------
    // 2. IMAGE POPUP, ZOOM & PAN HOÀN HẢO (CÓ GIỚI HẠN BIÊN)
    // --------------------------------------------------
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const images = document.querySelectorAll('.img-hover');

    // Tắt hoàn toàn hành vi kéo ảnh mặc định của trình duyệt
    modalImg.draggable = false;

    let currentZoom = 1;
    let isDragging = false;
    let isMoved = false;
    let startX, startY;
    let translateX = 0, translateY = 0;

    // Cập nhật transform
    function updateTransform() {
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
    }

    // Mở Popup
    images.forEach(img => {
        img.addEventListener('click', function (e) {
            modal.classList.remove('hidden');
            setTimeout(() => modal.classList.remove('opacity-0'), 10);

            modalImg.src = this.src;
            currentZoom = 1;
            translateX = 0;
            translateY = 0;

            modalImg.style.transition = 'transform 0.3s ease';
            updateTransform();
            modalImg.style.cursor = 'zoom-in';

            document.body.style.overflow = 'hidden';
        });
    });

    // Đóng Popup
    const hideModal = () => {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
    };

    // Bấm ra ngoài để đóng
    modal.addEventListener('click', function (e) {
        if (e.target !== modalImg) hideModal();
    });

    // ------------------------------------------
    // KÉO THẢ (CÓ GIỚI HẠN KHÔNG CHO BAY ẢNH)
    // ------------------------------------------
    modalImg.addEventListener('mousedown', function (e) {
        isMoved = false;
        if (currentZoom > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            this.style.cursor = 'grabbing';
            modalImg.style.transition = 'none'; // Tắt transition để kéo mượt
        }
    });

    window.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        isMoved = true;

        let newTx = e.clientX - startX;
        let newTy = e.clientY - startY;

        // TÍNH TOÁN GIỚI HẠN BIÊN (BOUNDARIES)
        // Lấy kích thước thật của ảnh so với màn hình để biết ảnh bị dư ra bao nhiêu
        const maxX = Math.max(0, (modalImg.clientWidth * currentZoom - window.innerWidth) / 2);
        const maxY = Math.max(0, (modalImg.clientHeight * currentZoom - window.innerHeight) / 2);

        // Chặn không cho kéo lố biên & Sửa lỗi "dính chuột" khi kéo ngược lại
        if (newTx > maxX) { newTx = maxX; startX = e.clientX - newTx; }
        if (newTx < -maxX) { newTx = -maxX; startX = e.clientX - newTx; }
        if (newTy > maxY) { newTy = maxY; startY = e.clientY - newTy; }
        if (newTy < -maxY) { newTy = -maxY; startY = e.clientY - newTy; }

        translateX = newTx;
        translateY = newTy;
        updateTransform();
    });

    window.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            modalImg.style.cursor = currentZoom > 1 ? 'grab' : 'zoom-in';
            modalImg.style.transition = 'transform 0.3s ease'; // Bật lại transition
        }
    });

    // ------------------------------------------
    // CLICK ĐỂ ZOOM
    // ------------------------------------------
    modalImg.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isMoved) return;

        modalImg.style.transition = 'transform 0.3s ease';

        if (currentZoom === 1) {
            currentZoom = 2;
            this.style.cursor = 'grab';
        } else {
            currentZoom = 1;
            translateX = 0;
            translateY = 0;
            this.style.cursor = 'zoom-in';
        }
        updateTransform();
    });

    // ------------------------------------------
    // LĂN CHUỘT (WHEEL) ĐỂ ZOOM
    // ------------------------------------------
    modalImg.addEventListener('wheel', function (e) {
        e.preventDefault();
        modalImg.style.transition = 'transform 0.3s ease';

        if (e.deltaY < 0) {
            currentZoom += 0.2;
        } else {
            currentZoom -= 0.2;
        }

        currentZoom = Math.min(Math.max(0.5, currentZoom), 5);

        if (currentZoom <= 1) {
            translateX = 0;
            translateY = 0;
            this.style.cursor = 'zoom-in';
        } else {
            // Khi thu nhỏ lại, cần kiểm tra xem ảnh có bị lọt ra ngoài giới hạn mới không
            const maxX = Math.max(0, (modalImg.clientWidth * currentZoom - window.innerWidth) / 2);
            const maxY = Math.max(0, (modalImg.clientHeight * currentZoom - window.innerHeight) / 2);
            translateX = Math.max(-maxX, Math.min(maxX, translateX));
            translateY = Math.max(-maxY, Math.min(maxY, translateY));

            this.style.cursor = 'grab';
        }

        updateTransform();
    });
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Theo dõi sự kiện cuộn trang
    window.addEventListener('scroll', () => {
        // Nếu cuộn xuống quá 300px thì hiện nút lên
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            scrollToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
        } else {
            // Ngược lại nếu ở gần đầu trang thì giấu nút đi
            scrollToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
            scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    // Xử lý khi click vào nút
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Cuộn lên từ từ mượt mà
        });
    });
});