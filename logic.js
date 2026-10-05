/* =========================================================
   SAMIK KHANAL — PORTFOLIO LOGIC
   Cinematic intro + locked Tony → Samik story
   + original portfolio interactions
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const intro = document.querySelector("#introExperience");

    const introVideo =
        document.querySelector("#introVideo") ||
        document.querySelector("#intro video");

    const story =
        document.querySelector("#storyExperience");

    const storySlides =
        story
            ? Array.from(
                story.querySelectorAll(".story-slide")
            )
            : [];

    const storyExit =
        document.querySelector("#storyExit");

    const backgroundVideo =
        document.querySelector("#backgroundVideo");

    const site =
        document.querySelector("#mainSite");

    const cursor =
        document.querySelector(".cursor-ring");

    const menuButton =
        document.querySelector("#menuButton");

    const menuOverlay =
        document.querySelector("#menuOverlay");

    const menuLinks =
        document.querySelectorAll("[data-menu]");

    const commandPanel =
        document.querySelector("#commandPanel");

    const commandClose =
        document.querySelector("#commandClose");

    const heroVideo =
        document.querySelector("#heroVideo");


    /* =====================================================
       SETTINGS
    ===================================================== */

    const INTRO_LIMIT = 10;
    const INTRO_SPEED = 1.3;

    const STORY_COOLDOWN = 900;
    const STORY_TRANSITION_TIME = 800;

    const EXIT_TIME = 1500;


    /* =====================================================
       STATE
    ===================================================== */

    let introFinished = false;
    let introFallbackTimer = null;

    let storyStarted = false;
    let storyFinished = false;

    let currentStory =
        0;

    let storyLocked =
        false;

    let lastStoryAction =
        0;

    let touchStartY =
        null;


    /* =====================================================
       GSAP SAFETY
    ===================================================== */

    const hasGSAP =
        typeof window.gsap !== "undefined";


    /* =====================================================
       MAIN SITE VISIBILITY
    ===================================================== */

    function showMainSite() {

        if (!site) {
            return;
        }

        site.classList.add("site-visible");

        site.style.opacity =
            "1";

        site.style.visibility =
            "visible";

    }


    /* =====================================================
       MAIN BACKGROUND VIDEO
    ===================================================== */

    function startBackgroundVideo() {

        if (!backgroundVideo) {
            return;
        }

        backgroundVideo.muted =
            true;

        backgroundVideo.loop =
            true;

        backgroundVideo.playbackRate =
            1;

        try {

            backgroundVideo.currentTime =
                0;

        } catch (error) {

            /* Browser may not allow seeking yet. */

        }

        const play =
            backgroundVideo.play();

        if (
            play &&
            typeof play.catch === "function"
        ) {

            play.catch(() => {});

        }

    }


    /* =====================================================
       INTRO VIDEO
       - autoplay
       - 1.3x
       - only first 10 seconds
       ===================================================== */

    function setupIntro() {

        if (!introVideo) {

            finishIntro();

            return;

        }

        introFallbackTimer =
            window.setTimeout(
                finishIntro,
                15000
            );


        introVideo.muted =
            true;

        introVideo.playsInline =
            true;

        introVideo.playbackRate =
            INTRO_SPEED;


        function playIntro() {

            introVideo.playbackRate =
                INTRO_SPEED;

            const promise =
                introVideo.play();

            if (
                promise &&
                typeof promise.catch === "function"
            ) {

                promise.catch(() => {});

            }

        }


        introVideo.addEventListener(
            "loadedmetadata",
            () => {

                introVideo.playbackRate =
                    INTRO_SPEED;

            }
        );


        introVideo.addEventListener(
            "canplay",
            playIntro,
            {
                once: true
            }
        );


        introVideo.addEventListener(
            "timeupdate",
            () => {

                if (
                    introVideo.currentTime >=
                    INTRO_LIMIT
                ) {

                    introVideo.currentTime =
                        INTRO_LIMIT;

                    finishIntro();

                }

            }
        );


        introVideo.addEventListener(
            "ended",
            () => {

                finishIntro();

            },
            {
                once: true
            }
        );


        introVideo.addEventListener(
            "error",
            () => {

                /*
                 * Never let a video failure
                 * trap the website.
                 */

                finishIntro();

            },
            {
                once: true
            }
        );


        /*
         * Start immediately.
         */

        playIntro();

    }


    /* =====================================================
       FINISH INTRO
       ===================================================== */

    function finishIntro() {

        if (introFinished) {
            return;
        }

        introFinished =
            true;

        window.clearTimeout(
            introFallbackTimer
        );


        if (introVideo) {

            introVideo.pause();

            try {

                introVideo.currentTime =
                    Math.min(
                        introVideo.currentTime,
                        INTRO_LIMIT
                    );

            } catch (error) {}

        }


        /*
         * Remove intro lock immediately.
         */

        document.body.classList.remove(
            "intro-lock"
        );


        /*
         * Hide intro using the
         * cinematic exit animation.
         */

        if (intro) {

            intro.classList.add(
                "is-finished"
            );

        }


        /*
         * Give the intro its fade/scale
         * moment, then start story.
         */

        setTimeout(
            startStory,
            750
        );

    }


    /* =====================================================
       STORY START
       ===================================================== */

    function startStory() {

        if (
            storyStarted ||
            storyFinished
        ) {

            return;

        }


        storyStarted =
            true;

        storyLocked =
            true;


        document.body.classList.add(
            "story-lock"
        );


        if (story) {

            story.classList.add(
                "is-active"
            );

            story.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        /*
         * Reset slides.
         */

        storySlides.forEach(
            (slide, index) => {

                slide.classList.remove(
                    "active",
                    "enter",
                    "leave-up",
                    "leave-down"
                );

                if (
                    index ===
                    currentStory
                ) {

                    slide.classList.add(
                        "active"
                    );

                }

            }
        );


        if (
            storySlides.length === 0
        ) {

            finishStory();

        }

    }


    /* =====================================================
       STORY FLASH
       ===================================================== */

    function storyFlash() {

        if (!story) {
            return;
        }


        story.classList.remove(
            "flash"
        );


        /*
         * Force reflow so the
         * animation can restart.
         */

        void story.offsetWidth;


        story.classList.add(
            "flash"
        );

    }


    /* =====================================================
       GO TO NEXT / PREVIOUS STORY
       ===================================================== */

    function changeStory(
        direction
    ) {

        if (
            !storyStarted ||
            storyFinished ||
            !storyLocked
        ) {

            return;

        }


        const now =
            Date.now();


        if (
            now -
            lastStoryAction <
            STORY_COOLDOWN
        ) {

            return;

        }


        /*
         * Prevent multiple gestures
         * during the current transition.
         */

        lastStoryAction =
            now;


        const nextStory =
            currentStory +
            direction;


        /*
         * Trying to go above first slide.
         */

        if (
            nextStory < 0
        ) {

            return;

        }


        /*
         * Moving beyond the last slide
         * finishes the story.
         */

        if (
            nextStory >=
            storySlides.length
        ) {

            if (
                direction > 0
            ) {

                finishStory();

            }

            return;

        }


        const currentSlide =
            storySlides[currentStory];

        const nextSlide =
            storySlides[nextStory];


        if (
            !currentSlide ||
            !nextSlide
        ) {

            return;

        }


        const leavingClass =
            direction > 0
                ? "leave-up"
                : "leave-down";


        /*
         * Current slide leaves.
         */

        currentSlide.classList.remove(
            "active"
        );

        currentSlide.classList.add(
            leavingClass
        );


        /*
         * Prepare next slide.
         */

        nextSlide.classList.remove(
            "active",
            "leave-up",
            "leave-down",
            "enter"
        );


        nextSlide.classList.add(
            direction > 0
                ? "enter-down"
                : "enter-up"
        );


        /*
         * Force layout.
         */

        void nextSlide.offsetWidth;


        /*
         * Activate next slide.
         */

        nextSlide.classList.remove(
            "enter-down",
            "enter-up"
        );

        nextSlide.classList.add(
            "active"
        );


        currentStory =
            nextStory;


        storyFlash();


        /*
         * Clean up old slide.
         */

        setTimeout(
            () => {

                currentSlide.classList.remove(
                    "leave-up",
                    "leave-down"
                );

            },
            STORY_TRANSITION_TIME
        );

    }


    /* =====================================================
       FINAL STORY TRANSITION
       ===================================================== */

    function finishStory() {

        if (storyFinished) {
            return;
        }


        storyFinished =
            true;

        storyLocked =
            false;


        document.body.classList.remove(
            "story-lock"
        );


        /*
         * Final cinematic animation.
         */

        if (storyExit) {

            storyExit.classList.add(
                "is-active"
            );

        }


        /*
         * Fade out story.
         */

        if (story) {

            story.classList.remove(
                "is-active"
            );

            story.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        /*
         * Reveal original main portfolio.
         */

        showMainSite();


        /*
         * Start Iron Man background
         * from 0 at normal speed.
         */

        startBackgroundVideo();


        /*
         * Finish exit overlay.
         */

        setTimeout(
            () => {

                if (storyExit) {

                    storyExit.classList.remove(
                        "is-active"
                    );

                    storyExit.style.pointerEvents =
                        "none";

                }

            },
            EXIT_TIME
        );

    }


    /* =====================================================
       STORY WHEEL CONTROL
       ===================================================== */

    function storyWheel(
        event
    ) {

        if (!introFinished) {

            if (Math.abs(event.deltaY) > 5) {

                event.preventDefault();
                finishIntro();

            }

            return;

        }

        if (
            !storyLocked
        ) {

            return;

        }


        /*
         * CRITICAL:
         * prevent normal page scrolling.
         */

        event.preventDefault();


        if (
            Math.abs(
                event.deltaY
            ) < 5
        ) {

            return;

        }


        const direction =
            event.deltaY > 0
                ? 1
                : -1;


        changeStory(
            direction
        );

    }


    window.addEventListener(
        "wheel",
        storyWheel,
        {
            passive: false
        }
    );


    /* =====================================================
       TOUCH SUPPORT
       ===================================================== */

    window.addEventListener(
        "touchstart",
        (event) => {

            if (
                (introFinished && !storyLocked) ||
                !event.touches.length
            ) {

                return;

            }


            touchStartY =
                event.touches[0].clientY;

        },
        {
            passive: true
        }
    );


    window.addEventListener(
        "touchend",
        (event) => {

            if (
                !introFinished &&
                touchStartY !== null &&
                event.changedTouches.length
            ) {

                const introEndY =
                    event.changedTouches[0].clientY;

                const introDifference =
                    touchStartY - introEndY;

                touchStartY = null;

                if (Math.abs(introDifference) >= 35) {
                    finishIntro();
                }

                return;

            }

            if (
                !storyLocked ||
                touchStartY === null ||
                !event.changedTouches.length
            ) {

                return;

            }


            const endY =
                event.changedTouches[0].clientY;


            const difference =
                touchStartY -
                endY;


            touchStartY =
                null;


            if (
                Math.abs(
                    difference
                ) < 35
            ) {

                return;

            }


            changeStory(
                difference > 0
                    ? 1
                    : -1
            );

        },
        {
            passive: true
        }
    );


    /* =====================================================
       KEYBOARD STORY CONTROL
       ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                !introFinished &&
                (
                    event.key === "ArrowDown" ||
                    event.key === "PageDown" ||
                    event.key === " "
                )
            ) {

                event.preventDefault();
                finishIntro();
                return;

            }

            if (
                !storyLocked
            ) {

                return;

            }


            if (
                event.key === "ArrowDown" ||
                event.key === "PageDown" ||
                event.key === " "
            ) {

                event.preventDefault();

                changeStory(
                    1
                );

            }


            if (
                event.key === "ArrowUp" ||
                event.key === "PageUp"
            ) {

                event.preventDefault();

                changeStory(
                    -1
                );

            }

        }
    );


    /* =====================================================
       ORIGINAL HERO VIDEO
       Keep original portfolio functionality.
       ===================================================== */

    if (heroVideo) {

        heroVideo.muted =
            true;


        const playHeroVideo =
            () => {

                const promise =
                    heroVideo.play();

                if (
                    promise &&
                    typeof promise.catch === "function"
                ) {

                    promise.catch(
                        () => {}
                    );

                }

            };


        playHeroVideo();


        heroVideo.addEventListener(
            "canplay",
            playHeroVideo
        );


        heroVideo.addEventListener(
            "error",
            () => {

                heroVideo.style.display =
                    "none";

                const background =
                    document.querySelector(
                        ".hero-background"
                    );

                if (background) {

                    background.style.background =
                        "radial-gradient(circle at 70% 40%, #220707, #050505 55%)";

                }

            }
        );

    }


    /* =====================================================
       CUSTOM CURSOR
       Original portfolio behavior.
       ===================================================== */

    if (
        cursor &&
        window.matchMedia(
            "(pointer:fine)"
        ).matches
    ) {

        let mouseX = 0;
        let mouseY = 0;

        let cursorX = 0;
        let cursorY = 0;


        window.addEventListener(
            "mousemove",
            (event) => {

                mouseX =
                    event.clientX;

                mouseY =
                    event.clientY;

            },
            {
                passive: true
            }
        );


        function updateCursor() {

            cursorX +=
                (
                    mouseX -
                    cursorX
                ) * 0.18;


            cursorY +=
                (
                    mouseY -
                    cursorY
                ) * 0.18;


            cursor.style.left =
                `${cursorX}px`;


            cursor.style.top =
                `${cursorY}px`;


            requestAnimationFrame(
                updateCursor
            );

        }


        updateCursor();


        const interactiveElements =
            document.querySelectorAll(
                "a, button, .project, .visual, .skill-card, .card"
            );


        interactiveElements.forEach(
            (element) => {

                element.addEventListener(
                    "mouseenter",
                    () => {

                        cursor.classList.add(
                            "active"
                        );

                    }
                );


                element.addEventListener(
                    "mouseleave",
                    () => {

                        cursor.classList.remove(
                            "active"
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       MENU
       Original portfolio behavior.
       ===================================================== */

    let menuOpen =
        false;


    function openMenu() {

        if (
            menuOpen ||
            !menuOverlay
        ) {

            return;

        }


        menuOpen =
            true;


        document.body.classList.add(
            "menu-open"
        );


        if (hasGSAP) {

            gsap.set(
                menuOverlay,
                {
                    visibility:
                        "visible"
                }
            );


            gsap.to(
                menuOverlay,
                {
                    opacity: 1,
                    duration: .5,
                    ease: "power2.out"
                }
            );


            gsap.fromTo(
                ".menu-links a",
                {
                    y: 80,
                    opacity: 0
                },
                {
                    y: 0,
                    opacity: 1,
                    duration: .8,
                    stagger: .08,
                    ease: "power4.out"
                }
            );


            gsap.fromTo(
                ".menu-small, .menu-footer",
                {
                    opacity: 0
                },
                {
                    opacity: 1,
                    duration: .6,
                    delay: .25
                }
            );

        } else {

            menuOverlay.style.visibility =
                "visible";

            menuOverlay.style.opacity =
                "1";

        }

    }


    function closeMenu() {

        if (
            !menuOpen ||
            !menuOverlay
        ) {

            return;

        }


        menuOpen =
            false;


        document.body.classList.remove(
            "menu-open"
        );


        if (hasGSAP) {

            gsap.to(
                menuOverlay,
                {
                    opacity: 0,
                    duration: .45,
                    ease: "power2.in",

                    onComplete: () => {

                        gsap.set(
                            menuOverlay,
                            {
                                visibility:
                                    "hidden"
                            }
                        );

                    }

                }
            );

        } else {

            menuOverlay.style.opacity =
                "0";

            menuOverlay.style.visibility =
                "hidden";

        }

    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                if (menuOpen) {

                    closeMenu();

                } else {

                    openMenu();

                }

            }
        );

    }


    menuLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    closeMenu();

                }
            );

        }
    );


    /* =====================================================
       ESCAPE
       ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                if (menuOpen) {
                    closeMenu();
                }

                closeCommand();

            }

        }
    );


    /* =====================================================
       COMMAND PANEL
       ===================================================== */

    function openCommand() {

        if (
            !commandPanel
        ) {

            return;

        }


        if (hasGSAP) {

            gsap.set(
                commandPanel,
                {
                    visibility:
                        "visible"
                }
            );


            gsap.to(
                commandPanel,
                {
                    opacity: 1,
                    duration: .35
                }
            );


            gsap.fromTo(
                ".command-box",
                {
                    y: 30,
                    scale: .96
                },
                {
                    y: 0,
                    scale: 1,
                    duration: .5,
                    ease: "power3.out"
                }
            );

        } else {

            commandPanel.style.visibility =
                "visible";

            commandPanel.style.opacity =
                "1";

        }

    }


    function closeCommand() {

        if (
            !commandPanel
        ) {

            return;

        }


        if (hasGSAP) {

            gsap.to(
                commandPanel,
                {
                    opacity: 0,
                    duration: .25,

                    onComplete: () => {

                        gsap.set(
                            commandPanel,
                            {
                                visibility:
                                    "hidden"
                            }
                        );

                    }

                }
            );

        } else {

            commandPanel.style.opacity =
                "0";

            commandPanel.style.visibility =
                "hidden";

        }

    }


    if (commandClose) {

        commandClose.addEventListener(
            "click",
            closeCommand
        );

    }


    if (commandPanel) {

        commandPanel.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    commandPanel
                ) {

                    closeCommand();

                }

            }
        );

    }


    /* =====================================================
       "/" COMMAND KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "/" &&
                document.activeElement &&
                document.activeElement.tagName !== "INPUT" &&
                document.activeElement.tagName !== "TEXTAREA"
            ) {

                event.preventDefault();

                openCommand();

            }

        }
    );


    /* =====================================================
       SMOOTH ANCHOR NAVIGATION
       ===================================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    /*
                     * Do not override our
                     * story controls.
                     */

                    if (
                        storyLocked
                    ) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView(
                        {
                            behavior:
                                "smooth",

                            block:
                                "start"
                        }
                    );

                }
            );

        }
    );


    /* =====================================================
       ACTIVE SECTION DETECTION
       ===================================================== */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    if (
        "IntersectionObserver"
        in window
    ) {

        const sectionObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                !entry.isIntersecting
                            ) {

                                return;

                            }


                            const id =
                                entry.target.id;


                            document
                                .querySelectorAll(
                                    ".menu-links a"
                                )
                                .forEach(
                                    (link) => {

                                        link.classList.remove(
                                            "active"
                                        );

                                    }
                                );


                            const activeLink =
                                document.querySelector(
                                    `.menu-links a[href="#${id}"]`
                                );


                            if (
                                activeLink
                            ) {

                                activeLink.classList.add(
                                    "active"
                                );

                            }

                        }
                    );

                },
                {
                    threshold:
                        .4
                }
            );


        sections.forEach(
            (section) => {

                sectionObserver.observe(
                    section
                );

            }
        );

    }


    /* =====================================================
       VIDEO SAFETY
       ===================================================== */

    if (heroVideo) {

        heroVideo.controls =
            false;


        heroVideo.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();

            }
        );

    }


    if (backgroundVideo) {

        backgroundVideo.controls =
            false;


        backgroundVideo.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();

            }
        );

    }


    if (introVideo) {

        introVideo.controls =
            false;


        introVideo.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();

            }
        );

    }


    /* =====================================================
       PAGE VISIBILITY
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden
            ) {

                if (
                    backgroundVideo
                ) {

                    backgroundVideo.pause();

                }


                if (
                    heroVideo
                ) {

                    heroVideo.pause();

                }

            } else {

                if (
                    !storyLocked
                ) {

                    startBackgroundVideo();

                }


                if (
                    heroVideo
                ) {

                    const promise =
                        heroVideo.play();

                    if (
                        promise &&
                        typeof promise.catch ===
                        "function"
                    ) {

                        promise.catch(
                            () => {}
                        );

                    }

                }

            }

        }
    );


    /* =====================================================
       MOBILE OPTIMIZATION
       ===================================================== */

    /*
     * IMPORTANT:
     * Do NOT slow down the cinematic intro.
     * It remains 1.3x on mobile too.
     */


    if (
        backgroundVideo
    ) {

        backgroundVideo.playbackRate =
            1;

    }


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    /*
     * Main page remains behind the intro.
     * We do NOT hide or redesign it.
     */

    if (site) {

        site.style.visibility =
            "visible";

    }


    /*
     * Lock page during intro.
     */

    document.body.classList.add(
        "intro-lock"
    );


    /*
     * Start background video
     * quietly underneath everything.
     */

    if (backgroundVideo) {

        backgroundVideo.muted =
            true;

        backgroundVideo.loop =
            true;

        backgroundVideo.playbackRate =
            1;

        const promise =
            backgroundVideo.play();

        if (
            promise &&
            typeof promise.catch ===
            "function"
        ) {

            promise.catch(
                () => {}
            );

        }

    }


    /* =====================================================
       START INTRO
       ===================================================== */

    setupIntro();

});