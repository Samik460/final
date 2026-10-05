/* =========================================================
   SCROLL REVEALS + COUNTERS
========================================================= */


/* =========================================================
   REVEAL ELEMENTS
========================================================= */

const revealElements =
    document.querySelectorAll(
        `
        .reveal-page,
        .section-heading,
        .about-photo,
        .about-content,
        .spotlight-card,
        .project,
        .timeline-item,
        .lab-card,
        .connections a,
        .contact-inner
        `
    );


revealElements.forEach(
    (element) => {

        element.classList.add(
            "reveal"
        );

    }
);


/* =========================================================
   REVEAL OBSERVER
========================================================= */

const revealObserver =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "is-visible"
                        );


                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },
        {
            threshold: .12,
            rootMargin:
                "0px 0px -40px 0px"
        }
    );


revealElements.forEach(
    (element) => {

        revealObserver.observe(
            element
        );

    }
);


/* =========================================================
   COUNTERS
========================================================= */

function animateCounter(
    element
) {

    if (
        element.dataset.animated ===
        "true"
    ) {
        return;
    }


    element.dataset.animated =
        "true";


    const target =
        Number(
            element.dataset.target
        );


    if (
        !Number.isFinite(target)
    ) {
        return;
    }


    const start =
        performance.now();


    const duration =
        850;


    function frame(now) {

        const progress =
            Math.min(
                1,
                (
                    now -
                    start
                ) /
                duration
            );


        const eased =
            1 -
            Math.pow(
                1 -
                progress,
                3
            );


        const value =
            Math.round(
                target *
                eased
            );


        element.textContent =
            String(value)
                .padStart(
                    2,
                    "0"
                );


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                frame
            );

        }

    }


    requestAnimationFrame(
        frame
    );

}


/* =========================================================
   COUNTER OBSERVER
========================================================= */

const counterObserver =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        animateCounter(
                            entry.target
                        );


                        counterObserver.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },
        {
            threshold: .6
        }
    );


document
    .querySelectorAll(
        ".count"
    )
    .forEach(
        (counter) => {

            counterObserver.observe(
                counter
            );

        }
    );