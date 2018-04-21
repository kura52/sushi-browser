export default `return {
  wait(time){
    return new Promise(r=>setTimeout(r,time))
  },
  async newPage(browser, url){
    const page = await browser.newPage()
    await page.goto(url)
    return page
  },
  async selectPage(browser, url){
    let page
    for(let i=0;i<300;i++){
      const pages = await browser.pages()
      page = pages.find(p => p.url() == url)
      if(page) break
      await wait(100)
    }
    await page.bringToFront()
    return page
  },
  async click(page, selector) {
    await page.waitForSelector(selector)
    return page.click(selector)
  },
  async dblclick(page, selector) {
    await page.waitForSelector(selector)
    return page.click(selector, {clickCount: 2})
  },
  async mouseDown(page, selector) {
    await page.waitForSelector(selector)
    await page.hover(selector)
    return  page.mouse.down()
  },
  async mouseUp(page, selector) {
    await page.waitForSelector(selector)
    await page.hover(selector)
    return  page.mouse.up()
  },
  async hover(page, selector) {
    await page.waitForSelector(selector)
    return  page.hover(selector)
  },
  async press(page, selector, key) {
    await page.waitForSelector(selector)
    await page.focus(selector)
    return page.keyboard.press(key)
  },
  async scroll(page, selector, x, y) {
    await page.waitForSelector(selector)
    return page.$eval(selector, (ele, x, y) => ele.scrollTo(x, y), x, y)
  },
  async submit(page, selector) {
    await page.waitForSelector(selector)
    return page.$eval(selector, (ele) => ele.submit())
  },
  async input(page, selector, value) {
    await page.waitForSelector(selector)
    return page.$eval(selector, (ele, value) => ele.value = value, value)
  },
  async check(page, selector, checked) {
    await page.waitForSelector(selector)
    return page.$eval(selector, (ele, checked) => ele.checked = checked, checked)
  },
  async select(page, selector, ...values) {
    await page.waitForSelector(selector)
    return page.select(selector, ...values)
  },
  async focus(page, selector) {
    await page.waitForSelector(selector)
    return page.focus(selector)
  },
  async blur(page, selector) {
    await page.waitForSelector(selector)
    return page.$eval(selector, (ele) => ele.blur())
  },
  async clearAndType(page, selector, value) {
    await page.waitForSelector(selector)
    await page.$eval(selector, (ele) => ele.value = null)
    return page.type(selector, value)
  },
  async selectAll(page) {
    await page.keyboard.down('Control')
    await page.keyboard.press('A')
    return  page.keyboard.up('Control')
  },
  async cut(page) {
    await page.keyboard.down('Control')
    await page.keyboard.press('X')
    return  page.keyboard.up('Control')
  },
  async copy(page) {
    await page.keyboard.down('Control')
    await page.keyboard.press('C')
    return  page.keyboard.up('Control')
  },
  async paste(page) {
    await page.keyboard.down('Control')
    await page.keyboard.press('V')
    return  page.keyboard.up('Control')
  },
  dialog(page,isOK){
    return new Promise((resolve,reject) => {
      console.log(page,434)
      page.once('dialog', async (dialog) => {
        console.log(7895947589,dialog)
        resolve(await dialog[isOK ? 'accept' : 'dismiss']())
      })
    })
  }
}`