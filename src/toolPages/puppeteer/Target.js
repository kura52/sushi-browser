class Target {
  constructor(page) {
    this._page = page
  }

  /**
   * @return {!Promise<?Page>}
   */
  async page() {
    return this._page
  }

  /**
   * @return {string}
   */
  url() {
    return this._page.url;
  }

  /**
   * @return {"page"|"service_worker"|"other"|"browser"}
   */
  type() {
    return 'page';
  }

}

module.exports = Target;