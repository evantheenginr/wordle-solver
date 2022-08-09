/**
 * wordle-solver - A wordle solver with inversion of control and tests
 *
 * Written in 2022 by Evan Edwards <er@sdraw.de>
 *
 * To the extent possible under law, the author(s) have dedicated all copyright
 * and related and neighboring rights to this software to the public domain 
 * worldwide. This software is distributed without any warranty.
 * 
 * You should have received a copy of the CC0 Public Domain Dedication along
 * with this software. 
 * If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

const util = require('node:util')
const puppeteer = require('puppeteer')

/** 
 * @class Puppeteer Automator for the released Wordle Web Application  
 */
module.exports = class WordleWebAutomator {

   /**
    * Constructor for the WordleWebAutomator class
    * @async
    * @param {Object} Config for the automator loaded from JSON including the selectors for the web elements
    */
    constructor(config, logger){
        this.config = config
        this.log = logger
    }

    /**
     * Open the browser, navigate to the Wordle Web Application, and close the welcome dialog
     * @async
     */
    async open(){
        this.browser = await puppeteer.launch({ headless: this.config.Headless });
        this.page = (await this.browser.pages())[0]
        await this.page.goto(this.config.URL, { waitUntil: this.config.PageWait });
        await this.page.click(this.config.CloseHowToPlay)
    }

    /**
     * Type the guess into the Wordle Web Application
     * @async
     * @param {string} guess - The guess to be typed
     */
    async typeWord(guess){
        await this.page.click(this.config.MainBoard)
        await this.page.keyboard.type(guess, {delay: 100});
        await this.page.keyboard.press('Enter') 
    }
    
    /**
     * Retrieve the results of the guess from each of the letter's tiles
     * @async
     * @param {number} tries - The try number
     * @returns {Promise<Array<string>>} The results of the guess
     */
    async getResults(tries){
        await this.page.waitForSelector(util.format(this.config.NthRowLastLetter, tries))
        return await this.page.$$eval(util.format(this.config.NthRowAllLetters, tries), (divs, attr) => divs.map(div => div.getAttribute(attr) ), this.config.LetterStateAttribute)  
    }

    /**
     * Cleanup once the game is finished including taking a screenshot and closing the browser
     * @async
     * @param {boolean} win - Whether the game was won or not
     * @param {string} guess - The final guess which could be the winning guess
     * @param {number} tries - The number of tries/attempts made
     * @param {number} time - The time elapsed in milliseconds for all attempts
     */
    async finished(win, guess, tries, time){
        const ts = new Date().getTime()
        const outcome = win?"win":"loss"
        const path = util.format(this.config.ScreenshotPath, ts, outcome, tries, guess, time)
        this.log.log(`saving screenshot to ${path}`)
        await this.page.screenshot({ path, fullPage: true });
        await this.browser.close()
    }
}
