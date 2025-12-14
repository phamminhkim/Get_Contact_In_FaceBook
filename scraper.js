const puppeteer = require("puppeteer");

(async () => {
    const links = [
        "https://m.facebook.com/profile.php?id=61574769866824",
        "https://m.facebook.com/XuanSacBeautySpa",
        "https://m.facebook.com/thanhxuanspa140",
        "https://m.facebook.com/maihopham6868",
        "https://m.facebook.com/profile.php?id=61552718960041",
        "https://m.facebook.com/profile.php?id=61560364537279",
        "https://m.facebook.com/chethithanhthuy1990"
    ];

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (let fbUrl of links) {
        try {
            await page.goto(fbUrl + "/about", { waitUntil: "networkidle2" });
            // await page.waitForTimeout(2000); // đợi load trang

            const pageInfo = await page.evaluate(() => {
                const h1 = document.querySelector('h1')?.innerText?.trim() || "";

                const texts = [...document.querySelectorAll("div, span")]
                    .map(el => el.innerText?.trim())
                    .filter(t => t && t.length > 0);

                // Follower
                let follower = "";
                const fText = texts.find(t => t.match(/[\d,.]+[KM]?\s*followers/i));
                if (fText) {
                    let match = fText.match(/([\d,.]+)([KM])?\s*followers/i);
                    if (match) {
                        let num = parseFloat(match[1].replace(/,/g, ''));
                        const unit = match[2];
                        if (unit === 'K') num *= 1000;
                        else if (unit === 'M') num *= 1000000;
                        follower = Math.round(num); // lấy số nguyên
                    }
                }
                // Phone
                let phone = "";
                const phoneText = texts.find(t => t.match(/0\d{8,10}/));
                if (phoneText) phone = phoneText.match(/0\d{8,10}/)[0];

                // Address
                let address = "";
                const addrIdx = texts.findIndex(t => t.includes("Address") || t.includes("Service area"));
                let demo = "";
                let demo_phone = "";

                if (addrIdx !== -1) {
                    address = texts.slice(addrIdx + 1, addrIdx + 5).join(" | ");
                    const lines = address.split("\n").map(l => l.trim()).filter(l => l);
                    const firstHcmLine = lines.find(l => l.includes("Ho Chi Minh City"));
                    if (firstHcmLine) demo = firstHcmLine;

                    const mobileIdx = lines.findIndex(t => t.includes("Mobile"));
                    if (mobileIdx > 0) demo_phone = lines[mobileIdx - 1].trim();
                }

                return { name: h1, follower, demo, demo_phone };
            });

            console.log("URL:", fbUrl);
            console.log("Thông tin fanpage:", pageInfo);
            console.log("--------------------------------------------------");
        } catch (err) {
            console.log("Lỗi với URL:", fbUrl, err.message);
        }
    }

    await browser.close();
})();
