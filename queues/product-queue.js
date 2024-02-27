const Redis = require("ioredis");
const Bull = require("bull");
const puppeteerPrefs = require("puppeteer-extra-plugin-user-preferences");
const path = require("path");
const { setTimeout } = require("node:timers/promises");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const puppeteer = require("puppeteer-extra");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());
puppeteer.use(require("puppeteer-extra-plugin-anonymize-ua")());

const redisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USER_NAME,
  password: process.env.REDIS_PASSWORD,
};

const redis = new Redis(redisOptions);

redis.on("connect", () => {
  console.log("Connected to Redis database.");
});

redis.on("error", (err) => {
  console.error("Error connecting to Redis:", err);
});

const queue = new Bull("scraper-queue", {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
});

queue.process(async (job) => {
  const { category } = await job.data;

  await puppeteer.use(
    puppeteerPrefs({
      userPrefs: {
        devtools: {
          preferences: {
            currentDockState: '"bottom"',
          },
        },
      },
    })
  );
  const browser = await puppeteer.launch({
    headless: false,
    // devtools: true,
    // userDataDir: "/tmp/myChromeSession",
    args: [
      //   "--disable-features=Cookies",
      //   "--disable-web-security",
      //   "--disable-features=IsolateOrigins,site-per-process",
      //   "--disable-site-isolation-trials",
      "--start-maximized",
      //   "--incognito",
      //   `--proxy-server=${proxyUrl}`,
      //   "--disable-extensions",
      //   "--disable-plugins",
      //   "--disable-sync",
      //   "--disable-local-storage",
      //   "--disable-session-storage",
      //   "--no-remote-debugging",
      //   "--remote-debugging-port=0",
    ],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(9000);

  try {
    console.log("Opening daraz.....");
    await page.goto("https://www.daraz.com.bd/", {
      waitUntil: "networkidle0",
    });

    await page.type("#q", category, { delay: 20 });
    await setTimeout(200);

    await page.click(".search-box__button--1oH7");
    await setTimeout(3000);

    await page.click(
      ".sortbar--fRGHh > div > div.viewModeBtns--HbYpf > span:nth-child(2)"
    );

    await setTimeout(2000);
    await page.click(
      ".sortbar--fRGHh > div > div.sortSelect--jvN80 > div.ant-select-lg.select--Vohwf.ant-select.ant-select-enabled > div > div"
    );

    await setTimeout(3000);
    await page.click(".ant-select-dropdown-menu-root > :nth-child(2)");

    await setTimeout(3000);

    // await page.waitForTimeout(500);
    // await page.close();
    // await browser.close();
  } catch (error) {
    await page.close();
    await browser.close();
    console.error(`An error occurred for ${category}:`, error);
  }
});

queue.on("error", function (error) {
  console.log(" An error occured.", error);
});

queue.on("waiting", function (jobId) {
  //   console.log(
  //     " // A Job is waiting to be processed as soon as a worker is idling. ==========>",
  //     jobId
  //   );
});

queue.on("active", function (job, jobPromise) {
  // A job has started. You can use `jobPromise.cancel()`` to abort it
  console.log("A job has started.========>>>>", job.data);
});

queue.on("stalled", function (job) {
  // workers that crash or pause the event loop.
  console.log(
    " // A job has been marked as stalled. This is useful for debugging job",
    job.data
  );
});

queue.on("lock-extension-failed", function (job, err) {
  // A job failed to extend lock. This will be useful to debug redis
  // connection issues and jobs getting restarted because workers
  // are not able to extend locks.
  console.log("");
});

queue.on("progress", function (job, progress) {
  //
  console.log("A job's progress was updated! ==> ", job.data);
});

queue.on("completed", function (job, result) {
  console.log(
    " A job successfully completed with a `result`.=============>",
    job.data
  );
  //   await queue.obliterate();
});

queue.on("failed", function (job, err) {
  console.log(" A job failed with reason `err`!=============>", err, job.data);
});

queue.on("paused", function () {
  // The queue has been paused.
});

queue.on("resumed", function (job) {
  // The queue has been resumed.
});

queue.on("cleaned", function (jobs, type) {
  console.log(
    " Old jobs have been cleaned from the queue. `jobs` is an array of cleaned =============>"
  );
});

queue.on("drained", function () {
  // Emitted every time the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed)
});

queue.on("removed", function (job) {
  // A job successfully removed.
});

module.exports = queue;
