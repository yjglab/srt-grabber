"use strict";

const { BrowserWindow, app } = require("electron");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");

let mainWindow = null;
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("ready", () => {
  mainWindow = new BrowserWindow();
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.on("did-finish-load", () => {
    let code = `
        const launchButton = document.querySelector("#launch");
        launchButton.addEventListener("click",function(){alert("clicked!");});
    `;
    mainWindow.webContents.executeJavaScript(code);
  });
});

const route = {
  departure: "동탄",
  destination: "전주",
  date: "20231008",
  number: "2",
};
const userInfo = {
  name: "김기차",
  phone: ["010", "0000", "0000"],
  password: "12345",
  passwordConfirm: "12345",
};
const main = async () => {
  await pie.initialize(app);
  const [maxTime, minTime] = [13, 8];
  let intervalTime = 0;

  async function launch() {
    try {
      intervalTime = Math.floor(
        Math.random() * (maxTime - minTime + 1) + minTime
      );
      const browser = await pie.connect(app, puppeteer);

      const window = new BrowserWindow();
      const targetUrl =
        "https://etk.srail.kr/hpg/hra/01/selectScheduleList.do?pageId=TK0101010000";
      await window.loadURL(targetUrl);

      const page = await pie.getPage(browser, window);
      setTimeout(async () => {
        window.destroy();
      }, intervalTime * 1000 + 1000);

      await page.setViewport({
        width: 0,
        height: 0,
      });
      await page.goto(targetUrl, {
        waitUntil: "load",
        timeout: 0,
      });

      // Alert accept always
      await page.on("dialog", async (dialog) => {
        await dialog.accept();
      });
      // 출발
      const departInput = await page.$("#dptRsStnCdNm");
      await departInput.click({ clickCount: 2 });
      await page.keyboard.press("Backspace");
      await departInput.type(route.departure);
      // 도착
      const arriveInput = await page.$("#arvRsStnCdNm");
      await arriveInput.click({ clickCount: 2 });
      await page.keyboard.press("Backspace");
      await arriveInput.type(route.destination);

      // 날짜, 인원 및 조회
      await page.select("#dptDt", route.date);
      await page.select("select[name='psgInfoPerPrnb1']", route.number); // 인원정보
      await page.click("#trnGpCd300"); // 차종구분
      await page.click("input[value='조회하기']");
      // 일반실 예약
      const roomReserveButton = await page.waitForSelector(
        "table > tbody > tr:nth-child(1) > td:nth-child(7) > a",
        { timeout: 100000 }
      );
      await roomReserveButton.click();
      await page.waitForNavigation();

      const unLoginReserveButton = await page.waitForSelector(
        "#login-form > fieldset > .loginpage > .fl_r > a:nth-child(2)"
      );
      await unLoginReserveButton.click();
      await page.waitForNavigation();

      // 예약하기: 정보 입력
      await page.mouse.wheel({ deltaY: 5000 });
      await page.waitForTimeout(1000);

      const usernameInput = await page.$("#custNm");
      await usernameInput.click();
      await usernameInput.type(userInfo.name);

      const phoneInput = [
        [await page.$("#telNo1"), userInfo.phone[0]],
        [await page.$("#telNo2"), userInfo.phone[1]],
        [await page.$("#telNo3"), userInfo.phone[2]],
      ];
      for (let i = 0; i < 3; i += 1) {
        await phoneInput[i][0].click();
        await phoneInput[i][0].type(phoneInput[i][1]);
      }

      const passwordInput = await page.$("#custPw");
      await passwordInput.click();
      await passwordInput.type(userInfo.password);
      const passwordConfirmInput = await page.$("#reCustPw");
      await passwordConfirmInput.click();
      await passwordConfirmInput.type(userInfo.passwordConfirm);

      await page.click("#agreeY");
      // await page.click("input[value='확인']"); // 예약 완료 버튼
      console.log("완료");
    } catch (error) {
      console.error(error);
    }
  }

  launch();
  setInterval(() => {
    launch();
  }, intervalTime * 1000);
};

// main();
