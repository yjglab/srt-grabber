"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function app() {
    console.log("ff");
    const puppeteer = require("puppeteer");
    const [maxTime, minTime] = [13, 8];
    let intervalTime = 0;
    function launch() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                intervalTime = Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
                const browser = yield puppeteer.launch({
                    headless: false,
                    args: ["--start-maximized"],
                });
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    yield browser.close();
                }), intervalTime * 1000 + 1000);
                const page = yield browser.newPage();
                const targetUrl = "https://etk.srail.kr/hpg/hra/01/selectScheduleList.do?pageId=TK0101010000";
                yield page.setViewport({
                    width: 0,
                    height: 0,
                });
                yield page.goto(targetUrl, {
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
                page.on("dialog", (dialog) => __awaiter(this, void 0, void 0, function* () {
                    yield dialog.accept();
                }));
                // 출발
                const departInput = yield page.$("#dptRsStnCdNm");
                yield departInput.click({ clickCount: 2 });
                yield page.keyboard.press("Backspace");
                yield departInput.type(route.departure);
                // 도착
                const arriveInput = yield page.$("#arvRsStnCdNm");
                yield arriveInput.click({ clickCount: 2 });
                yield page.keyboard.press("Backspace");
                yield arriveInput.type(route.destination);
                // 날짜, 인원 및 조회
                yield page.select("#dptDt", route.date);
                yield page.select("select[name='psgInfoPerPrnb1']", route.number); // 인원정보
                yield page.click("#trnGpCd300"); // 차종구분
                yield page.click("input[value='조회하기']");
                // 일반실 예약
                const roomReserveButton = yield page.waitForSelector("table > tbody > tr:nth-child(1) > td:nth-child(7) > a", { timeout: 100000 });
                yield roomReserveButton.click();
                yield page.waitForNavigation();
                const unLoginReserveButton = yield page.waitForSelector("#login-form > fieldset > .loginpage > .fl_r > a:nth-child(2)");
                yield unLoginReserveButton.click();
                yield page.waitForNavigation();
                // 예약하기: 정보 입력
                const userInfo = {
                    name: "최석범",
                    phone: ["010", "3353", "0217"],
                    password: "12345",
                    passwordConfirm: "12345",
                };
                yield page.mouse.wheel({ deltaY: 5000 });
                yield page.waitForTimeout(1000);
                const usernameInput = yield page.$("#custNm");
                yield usernameInput.click();
                yield usernameInput.type(userInfo.name);
                const phoneInput = [
                    [yield page.$("#telNo1"), userInfo.phone[0]],
                    [yield page.$("#telNo2"), userInfo.phone[1]],
                    [yield page.$("#telNo3"), userInfo.phone[2]],
                ];
                for (let i = 0; i < 3; i += 1) {
                    yield phoneInput[i][0].click();
                    yield phoneInput[i][0].type(phoneInput[i][1]);
                }
                const passwordInput = yield page.$("#custPw");
                yield passwordInput.click();
                yield passwordInput.type(userInfo.password);
                const passwordConfirmInput = yield page.$("#reCustPw");
                yield passwordConfirmInput.click();
                yield passwordConfirmInput.type(userInfo.passwordConfirm);
                yield page.click("#agreeY");
                // await page.click("input[value='확인']"); // 예약 완료 버튼
                console.log("완료");
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    launch();
    setInterval(() => {
        launch();
    }, intervalTime * 1000);
}
if (typeof document !== "undefined") {
    const button = document.querySelector("#launch");
    button === null || button === void 0 ? void 0 : button.addEventListener("click", app);
}
