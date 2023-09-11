function app() {
  const puppeteer = require("puppeteer");
  const [maxTime, minTime] = [13, 8];
  let intervalTime = 0;

  async function launch() {
    try {
      intervalTime = Math.floor(
        Math.random() * (maxTime - minTime + 1) + minTime
      );
      const browser = await puppeteer.launch({
        headless: false,
        args: ["--start-maximized"],
      });
      setTimeout(async () => {
        await browser.close();
      }, intervalTime * 1000 + 1000);

      const page = await browser.newPage();
      const targetUrl =
        "https://etk.srail.kr/hpg/hra/01/selectScheduleList.do?pageId=TK0101010000";
      await page.setViewport({
        width: 0,
        height: 0,
      });
      await page.goto(targetUrl, {
        waitUntil: "load",
        timeout: 0,
      });

      const route = {
        departure: "동탄",
        destination: "전주",
        date: "20230927",
        number: "2",
      };
      // Alert accept always
      page.on("dialog", async (dialog: any) => {
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
      const userInfo = {
        name: "최석범",
        phone: ["010", "3353", "0217"],
        password: "12345",
        passwordConfirm: "12345",
      };

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
}

const button = document.querySelector("#launch");
button?.addEventListener("click", app);
