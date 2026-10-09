(() => {
    "use strict";

    const gsap = window.gsap;

    if (!gsap) {
        console.error("GSAP failed to load.");
        return;
    }

    gsap.registerPlugin();

    const $ = (selector) => document.querySelector(selector);

    const intro = $("#intro");
    const hero = $("#hero");
    const heroImage = $("#heroImage");
    const fallback = $(".hero__fallback");
    const titleWrap = $("#titleWrap");
    const mainTitle = $(".title-layer--main");
    const shadowTitle = $(".title-layer--shadow");
    const skipButton = $("#skipIntro");
    const flash = $("#flash");
    const impact = $("#impact");
    const cursor = $("#cursor");
    const progressBar = $("#progressBar");
    const progressLabel = $("#progressLabel");
    const statusText = $("#statusText");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    let introTimeline;
    let completed = false;
    let pointerX = 0;
    let pointerY = 0;
    let pointerFrame = 0;

    /*
     * CUSTOM SPLIT TEXT
     * No premium SplitText plugin required.
     */

    function splitCharacters(element) {
        if (!element) return [];

        const text = element.textContent.trim();
        const fragment = document.createDocumentFragment();

        element.setAttribute("aria-hidden", "true");

        [...text].forEach((character) => {
            const span = document.createElement("span");

            span.className = "title-char";
            span.textContent = character === " " ? "\u00A0" : character;
            span.setAttribute("aria-hidden", "true");

            fragment.appendChild(span);
        });

        element.replaceChildren(fragment);

        return [...element.querySelectorAll(".title-char")];
    }

    const mainChars = splitCharacters(mainTitle);
    const shadowChars = splitCharacters(shadowTitle);

    // Prevent broken or missing hero assets from disrupting the intro.
    function useFallback() {
        if (heroImage) {
            heroImage.style.display = "none";
        }

        if (fallback) {
            fallback.style.opacity = "1";
        }
    }

    if (heroImage) {
        if (heroImage.complete && heroImage.naturalWidth === 0) {
            useFallback();
        }

        heroImage.addEventListener("error", useFallback);

        heroImage.addEventListener("load", () => {
            gsap.set(heroImage, { opacity: 0 });
        });
    }

    /*
     * INITIAL STATES
     */

    gsap.set(titleWrap, {
        yPercent: -50,
        autoAlpha: 1,
    });

    gsap.set(hero, {
        xPercent: -50,
        y: 100,
        rotation: -8,
        scale: 0.72,
        autoAlpha: 1,
    });

    gsap.set([mainChars, shadowChars], {
        yPercent: 120,
        rotationX: -75,
        transformOrigin: "50% 100%",
        autoAlpha: 0,
    });

    gsap.set(
        [
            ".title-stamp",
            ".title-subline",
            ".side-note--left",
            ".side-note--right",
        ],
        {
            autoAlpha: 0,
        },
    );

    gsap.set(".paint", {
        autoAlpha: 0,
        scale: 0.4,
    });

    gsap.set(".backdrop__glow", {
        scale: 0.5,
        autoAlpha: 0,
    });

    gsap.set(".hero__aura", {
        scale: 0.5,
        autoAlpha: 0,
    });

    gsap.set(flash, { autoAlpha: 0 });
    gsap.set(impact, { autoAlpha: 0 });
    gsap.set(cursor, { x: -100, y: -100, autoAlpha: 0 });

    /*
     * STATUS + PROGRESS
     */

    const statusMessages = [
        "INITIALIZING CHAOS",
        "RAIDER DETECTED",
        "FORGING METAL",
        "MAXIMUM MAYHEM",
        "WELCOME TO THE WASTELAND",
    ];

    function updateProgress() {
        if (!introTimeline) return;

        const progress = introTimeline.progress();
        const value = Math.round(progress * 100);

        progressBar.style.width = `${value}%`;
        progressLabel.textContent = String(value).padStart(2, "0");

        let index = 0;

        if (progress >= 0.9) index = 4;
        else if (progress >= 0.65) index = 3;
        else if (progress >= 0.4) index = 2;
        else if (progress >= 0.2) index = 1;

        statusText.textContent = statusMessages[index];
    }

    /*
     * INTRO TIMELINE
     */

    introTimeline = gsap.timeline({
        paused: true,
        defaults: {
            ease: "power3.out",
        },
        onUpdate: updateProgress,
        onComplete: () => {
            completed = true;
            statusText.textContent = "WELCOME TO THE WASTELAND";
            progressBar.style.width = "100%";
            progressLabel.textContent = "100";

            gsap.to(skipButton, {
                autoAlpha: 0.55,
                duration: 0.4,
            });
        },
    });

    // 01 — Dark screen ignition.
    introTimeline
        .to(
            ".backdrop__glow",
            {
                autoAlpha: 1,
                scale: 1,
                duration: 0.8,
            },
            0,
        )
        .to(
            ".paint--one",
            {
                autoAlpha: 0.8,
                scale: 1,
                duration: 0.65,
                ease: "back.out(1.7)",
            },
            0.25,
        )
        .to(
            ".paint--two",
            {
                autoAlpha: 0.9,
                scale: 1,
                duration: 0.45,
                ease: "power4.out",
            },
            0.48,
        )
        .to(
            ".paint--three",
            {
                autoAlpha: 0.8,
                scale: 1,
                duration: 0.55,
            },
            0.65,
        );

    // 02 — Character drops into the scene.
    introTimeline
        .to(
            hero,
            {
                y: 0,
                rotation: 0,
                scale: 1,
                duration: 1.15,
                ease: "back.out(1.25)",
            },
            0.5,
        )
        .to(
            heroImage,
            {
                autoAlpha: 1,
                duration: 0.45,
            },
            0.8,
        )
        .to(
            ".hero__aura",
            {
                autoAlpha: 0.4,
                scale: 1,
                duration: 0.85,
            },
            0.8,
        )
        .to(
            fallback,
            {
                autoAlpha: 0,
                duration: 0.3,
            },
            0.85,
        );

    // 03 — Small editorial details.
    introTimeline
        .to(
            ".title-stamp",
            {
                autoAlpha: 1,
                y: -5,
                duration: 0.45,
            },
            0.9,
        )
        .to(
            [".side-note--left", ".side-note--right"],
            {
                autoAlpha: 1,
                duration: 0.5,
                stagger: 0.1,
            },
            1.05,
        );

    // 04 — Heavy metallic letters rotate into view.
    introTimeline
        .to(
            shadowChars,
            {
                yPercent: 0,
                rotationX: 0,
                autoAlpha: 1,
                duration: 0.7,
                stagger: {
                    each: 0.035,
                    from: "start",
                },
                ease: "power4.out",
            },
            1.05,
        )
        .to(
            mainChars,
            {
                yPercent: 0,
                rotationX: 0,
                duration: 0.8,
                stagger: {
                    each: 0.035,
                    from: "start",
                },
                ease: "back.out(1.5)",
            },
            1.12,
        )
        .to(
            ".title-subline",
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.65,
            },
            1.75,
        );

    // 05 — Impact flash, paint burst and screen shake.
    introTimeline
        .to(
            flash,
            {
                autoAlpha: 0.8,
                duration: 0.06,
            },
            2.25,
        )
        .to(
            flash,
            {
                autoAlpha: 0,
                duration: 0.35,
                ease: "power2.out",
            },
            2.31,
        )
        .to(
            impact,
            {
                autoAlpha: 0.65,
                duration: 0.06,
            },
            2.27,
        )
        .to(
            impact,
            {
                autoAlpha: 0,
                duration: 0.4,
            },
            2.33,
        )
        .to(
            intro,
            {
                x: 8,
                duration: 0.045,
                repeat: 7,
                yoyo: true,
                ease: "none",
            },
            2.25,
        )
        .to(
            titleWrap,
            {
                scale: 1.025,
                duration: 0.12,
                ease: "power2.out",
            },
            2.25,
        )
        .to(
            titleWrap,
            {
                scale: 1,
                duration: 0.45,
                ease: "elastic.out(1, 0.5)",
            },
            2.37,
        )
        .to(
            ".paint",
            {
                autoAlpha: 1,
                duration: 0.08,
                stagger: 0.025,
            },
            2.25,
        )
        .to(
            ".paint",
            {
                autoAlpha: 0.75,
                duration: 0.45,
            },
            2.34,
        );

    // 06 — Finish with a confident, calm composition.
    introTimeline
        .to(
            ".hero__aura",
            {
                autoAlpha: 0.22,
                duration: 0.6,
            },
            2.8,
        )
        .to(
            ".hero__image",
            {
                scale: 1.025,
                duration: 1.2,
                ease: "sine.inOut",
            },
            2.8,
        )
        .to(
            ".title-stamp",
            {
                y: 0,
                duration: 0.3,
            },
            2.8,
        );

    /*
     * SKIP INTRO
     */

    function finishIntro() {
        if (completed) return;

        introTimeline.progress(1);
        introTimeline.pause();

        completed = true;

        gsap.set(progressBar, { width: "100%" });
        progressLabel.textContent = "100";
        statusText.textContent = "WELCOME TO THE WASTELAND";
    }

    skipButton.addEventListener("click", finishIntro);

    /*
     * POINTER PARALLAX
     */

    const canHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
    ).matches;

    if (canHover && !reducedMotion) {
        window.addEventListener("pointermove", (event) => {
            pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
            pointerY = (event.clientY / window.innerHeight - 0.5) * 2;

            if (pointerFrame) return;

            pointerFrame = requestAnimationFrame(() => {
                pointerFrame = 0;

                gsap.to(cursor, {
                    x: event.clientX,
                    y: event.clientY,
                    autoAlpha: 1,
                    duration: 0.2,
                    overwrite: "auto",
                });

                gsap.to(hero, {
                    x: pointerX * 12,
                    y: 0,
                    rotationY: pointerX * 4,
                    rotationX: -pointerY * 3,
                    duration: 0.8,
                    ease: "power2.out",
                    overwrite: "auto",
                });

                gsap.to(titleWrap, {
                    x: pointerX * -7,
                    rotation: pointerX * -0.4,
                    duration: 0.9,
                    ease: "power2.out",
                    overwrite: "auto",
                });

                gsap.to(".backdrop__symbol", {
                    x: pointerX * -18,
                    y: pointerY * -12,
                    duration: 1,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            });
        });

        window.addEventListener("pointerleave", () => {
            gsap.to(cursor, {
                autoAlpha: 0,
                duration: 0.25,
            });

            gsap.to(hero, {
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                duration: 0.8,
                ease: "power3.out",
            });

            gsap.to(titleWrap, {
                x: 0,
                rotation: 0,
                duration: 0.8,
                ease: "power3.out",
            });
        });
    }

    /*
     * ACCESSIBILITY + START
     */

    if (reducedMotion) {
        finishIntro();
    } else {
        introTimeline.play();
    }
})();
