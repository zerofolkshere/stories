document.addEventListener("DOMContentLoaded", function () {
    /* ────────────────────────────
       Cache DOM references
    ──────────────────────────── */
    const scrollContainer = document.querySelector(".menu_wrapper");
    const menuItems       = document.querySelectorAll(".menu_card");
    const buttons         = document.querySelectorAll("[btn-menu]");

    /* ────────────────────────────
       Helpers
    ──────────────────────────── */
    function easeOutCirc(t) {
        return Math.sqrt(1 - Math.pow(t - 1, 2));
    }

    function centerMenu(menuId) {
        const targetMenu = document.getElementById(menuId);
        if (!targetMenu) return;

        const containerCenter = scrollContainer.offsetWidth / 2;
        const targetRect      = targetMenu.getBoundingClientRect();
        const containerRect   = scrollContainer.getBoundingClientRect();

        const targetCenter = targetRect.left - containerRect.left + targetMenu.offsetWidth / 2;
        const scrollLeft   = scrollContainer.scrollLeft + targetCenter - containerCenter;

        let start     = scrollContainer.scrollLeft;
        let change    = scrollLeft - start;
        let duration  = 250;
        let startTime = null;

        function animateScroll(currentTime) {
            if (!startTime) startTime = currentTime;
            let timeElapsed = currentTime - startTime;
            let progress    = Math.min(timeElapsed / duration, 1);

            scrollContainer.scrollLeft = start + change * easeOutCirc(progress);

            if (timeElapsed < duration) requestAnimationFrame(animateScroll);
        }

        requestAnimationFrame(animateScroll);
    }

    /* ────────────────────────────
       Button clicks → center menu
    ──────────────────────────── */
    buttons.forEach(btn => {
        btn.addEventListener("click", () =>
            centerMenu(btn.getAttribute("btn-menu"))
        );
    });

    /* ────────────────────────────
       Menu‑card clicks → center menu
       (ignore clicks that were part of a drag)
    ──────────────────────────── */
    let isDown     = false;  // dragging state
    let hasDragged = false;  // becomes true when pointer moves > 4 px

    menuItems.forEach(card => {
        card.addEventListener("click", () => {
            if (!hasDragged) centerMenu(card.id);
        });
    });

    /* ────────────────────────────
       Touch/scroll handling
    ──────────────────────────── */
    let isTouchScrolling = false;
    let startY, startX, isScrollingHorizontally;

    scrollContainer.addEventListener("touchstart", e => {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isScrollingHorizontally = false;
        isTouchScrolling = true;
    });

    scrollContainer.addEventListener("touchmove", e => {
        let deltaY = Math.abs(e.touches[0].clientY - startY);
        let deltaX = Math.abs(e.touches[0].clientX - startX);
        isScrollingHorizontally = deltaX > deltaY;
    });

    scrollContainer.addEventListener("touchend", () => {
        isTouchScrolling = false;
    });

    scrollContainer.style.scrollBehavior = "smooth";
    scrollContainer.addEventListener(
        "wheel",
        event => {
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                scrollContainer.scrollLeft += event.deltaX * 3;
                event.preventDefault();
            }
        },
        { passive: false }
    );

    /* ────────────────────────────
       Mouse & touch dragging support
    ──────────────────────────── */
    let startDragX, scrollStartLeft;

    function startDragging(e) {
        if (isTouchScrolling) return;
        isDown     = true;
        hasDragged = false;
        scrollContainer.classList.add("dragging");
        startDragX = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft;
        scrollStartLeft = scrollContainer.scrollLeft;
    }

    function stopDragging() {
        isDown = false;
        scrollContainer.classList.remove("dragging");

        /* reset hasDragged after the potential click event
           so cards know whether to honor it */
        setTimeout(() => (hasDragged = false), 0);
    }

    function dragMove(e) {
        if (!isDown || isTouchScrolling) return;
        e.preventDefault();
        const x    = (e.pageX || e.touches[0].pageX) - scrollContainer.offsetLeft;
        const walk = (x - startDragX) * 2;

        if (Math.abs(walk) > 4) hasDragged = true; // movement threshold
        scrollContainer.scrollLeft = scrollStartLeft - walk;
    }

    scrollContainer.addEventListener("mousedown",  startDragging);
    scrollContainer.addEventListener("mouseup",    stopDragging);
    scrollContainer.addEventListener("mouseleave", stopDragging);
    scrollContainer.addEventListener("mousemove",  dragMove);

    scrollContainer.addEventListener("touchstart", startDragging);
    scrollContainer.addEventListener("touchend",   stopDragging);
    scrollContainer.addEventListener("touchmove",  dragMove, { passive: false });

    /* ────────────────────────────
       Opacity fade based on distance
    ──────────────────────────── */
    function updateOpacity() {
        const containerCenter = scrollContainer.offsetWidth / 2;
        const containerLeft   = scrollContainer.getBoundingClientRect().left;

        menuItems.forEach(menu => {
            const menuCenter = menu.getBoundingClientRect().left + menu.offsetWidth / 2;
            const distance   = Math.abs(menuCenter - (containerCenter + containerLeft));
            const maxDistance = containerCenter;

            const opacity = Math.max(0.1, 1 - (distance / maxDistance) * 0.9); // min 0.1
            menu.style.opacity = opacity.toFixed(2);
        });
    }

    scrollContainer.addEventListener("scroll", updateOpacity);

    /* ────────────────────────────
       Center middle card on load
    ──────────────────────────── */
    function centerOnLoad() {
        const middleIndex = Math.floor(menuItems.length / 2);
        const middleMenu  = menuItems[middleIndex];
        if (middleMenu) requestAnimationFrame(() => centerMenu(middleMenu.id));
    }

    centerOnLoad();
    updateOpacity();
});
