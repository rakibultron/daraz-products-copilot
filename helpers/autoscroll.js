exports.autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var targetElement = document.querySelector(".footer-first");
      var scrollOptions = {
        behavior: "smooth",
        block: "start",
      };
      var observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              clearInterval(timer);
              observer.disconnect();
              resolve();
            }
          });
        },
        { threshold: 1 }
      );
      observer.observe(targetElement);
      var timer = setInterval(() => {
        window.scrollBy(0, window.innerHeight);
      }, 200);
    });
  });
};
