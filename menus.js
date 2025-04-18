document.addEventListener("DOMContentLoaded", function () {
    const scrollContainer = document.querySelector(".menu_wrapper");
    const menuItems = document.querySelectorAll(".menu_card");
    const buttons = document.querySelectorAll("[btn-menu]");

    let isTouchScrolling = false;

    function easeOutCirc(t) {
        return Math.sqrt(1 - Math.pow(t - 1, 2));
    }

    function centerMenu(menuId) {
        const targetMenu = document.getElementById(menuId);
        if (!targetMenu) return;

        const containerCenter = scrollContainer.offsetWidth / 2;
        const targetRect = targetMenu.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();

        const targetCenter = targetRect.left - containerRect.left + targetMenu.offsetWidth / 2;
        const scrollLeft = scrollContainer.scrollLeft + targetCenter - containerCenter;

        let start = scrollContainer.scrollLeft;
        let change = scrollLeft - start;
        let duration = 250;
        let startTime = null;

        function animateScroll(currentTime) {
            if (!startTime) startTime = currentTime;
            let timeElapsed = currentTime - startTime;
            let progress = Math.min(timeElapsed / duration, 1);
            scrollContainer.scrollLeft = start + change * easeOutCirc(progress);

            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        }

        requestAnimationFrame(animateScroll);
    }

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const menuId = this.getAttribute("btn-menu");
            centerMenu(menuId);
        });
    });

    let startY, startX, isScrollingHorizontally;

    scrollContainer.addEventListener("touchstart", (e) => {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isScrollingHorizontally = false;
        isTouchScrolling = true;
    });

    scrollContainer.addEventListener("touchmove", (e) => {
        let deltaY = Math.abs(e.touches[0].clientY - startY);
        let deltaX = Math.abs(e.touches[0].clientX - startX);
        isScrollingHorizontally = deltaX > deltaY;
    });

    scrollContainer.addEventListener("touchend", () => {
        isTouchScrolling = false;
    });

    scrollContainer.style.scrollBehavior = "smooth";
    scrollContainer.addEventListener("wheel", function (event) {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            scrollContainer.scrollLeft += event.deltaX * 3;
            event.preventDefault();
        }
    }, { passive: false });

    let isDown = false;
    let startDragX;
    let scrollStartLeft;

    function startDragging(e) {
        if (isTouchScrolling) return;
        isDown = true;
        scrollContainer.classList.add("dragging");
        startDragX = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft;
        scrollStartLeft = scrollContainer.scrollLeft;
    }

    function stopDragging() {
        isDown = false;
        scrollContainer.classList.remove("dragging");
    }

    function dragMove(e) {
        if (!isDown || isTouchScrolling) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft;
        const walk = (x - startDragX) * 2;
        scrollContainer.scrollLeft = scrollStartLeft - walk;
    }

    scrollContainer.addEventListener("mousedown", startDragging);
    scrollContainer.addEventListener("mouseup", stopDragging);
    scrollContainer.addEventListener("mouseleave", stopDragging);
    scrollContainer.addEventListener("mousemove", dragMove);

    scrollContainer.addEventListener("touchstart", startDragging);
    scrollContainer.addEventListener("touchend", stopDragging);
    scrollContainer.addEventListener("touchmove", dragMove, { passive: false });

    let lastKnownScrollLeft = scrollContainer.scrollLeft;
    let ticking = false;

    function updateOpacity() {
        if (!ticking) {
            requestAnimationFrame(() => {
                let containerCenter = scrollContainer.offsetWidth / 2;
                const containerLeft = scrollContainer.getBoundingClientRect().left;

                menuItems.forEach(menu => {
                    let menuCenter = menu.getBoundingClientRect().left + menu.offsetWidth / 2;
                    let distance = Math.abs(menuCenter - (containerCenter + containerLeft));

                    let maxDistance = containerCenter;
                    let opacity = Math.max(0.1, 1 - (distance / maxDistance) * 0.9); // min opacity = 0.1
                    menu.style.opacity = opacity.toFixed(2);
                });

                ticking = false;
            });
            ticking = true;
        }
    }

    scrollContainer.addEventListener("scroll", updateOpacity);

    function centerOnLoad() {
        let middleIndex = Math.floor(menuItems.length / 2);
        let middleMenu = menuItems[middleIndex];
        if (middleMenu) {
            requestAnimationFrame(() => centerMenu(middleMenu.id));
        }
    }

    centerOnLoad();
    updateOpacity();
});
