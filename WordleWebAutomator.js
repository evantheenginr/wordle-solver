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
const fs = require('node:fs/promises')
const puppeteer = require('puppeteer')

/** 
 * @class Puppeteer Automator for the released Wordle Web Application  
 */
module.exports = class WordleWebAutomator {

   /**
    * Constructor for the WordleWebAutomator class
    * @param {Object} Config for the automator loaded from JSON including the selectors for the web elements
    */
    constructor(config, share, logger){
        this.config = config
        this.share = share
        this.log = logger
    }

    /**
     * Open the browser, navigate to the Wordle Web Application, and close the welcome dialog
     * @async
     */
    async open(){
        this.browser = await puppeteer.launch(this.config.LaunchOptions);
        this.page = (await this.browser.pages())[0]
        await Promise.all([
            this.page.waitForNavigation(),
            await this.page.goto(this.config.URL, this.config.GotoOptions)
        ])
        //await this.page.click(this.config.PlayButton, this.config.InteractionOptions)
        await this.page.focus(this.config.PlayButton, this.config.InteractionOptions)
        await this.page.keyboard.press('Enter', this.config.InteractionOptions)
        await Promise.all([
            await this.page.waitForSelector(this.config.MainBoard),
            await this.page.click(this.config.CloseDialog, this.config.InteractionOptions)
        ])
    }

    /**
     * Type the guess into the Wordle Web Application
     * @async
     * @param {string} guess - The guess to be typed
     * @param {number} tries - The try number
     */
    async typeWord(guess, tries){
        for(let i = 0; guess && i < guess.length; i++){
            await this.typeLetter(guess[i], tries, i+1)
        }
        await this.page.keyboard.press('Enter', this.config.InteractionOptions) 
    }

    /**
     * Type each letter of the guess into the Wordle Web Application and validate the state of the letter
     * @async
     * @param {string} guess - The guess to be typed
     * @param {number} tries - The try number
     * @param {number} position - The position of the letter in the guess
     */
    async typeLetter(letter, tries, position){
        await this.page.waitForSelector(util.format(this.config.NthRowNthLetterState, tries, position, 'empty')),
        await this.page.click(this.config.MainBoard, this.config.InteractionOptions)
        await this.page.keyboard.type(letter, this.config.InteractionOptions)
        /*await Promise.all([
            await this.page.waitForSelector(util.format(this.config.NthRowNthLetterState, tries, position, 'tbd')),
            await this.page.click(util.format(this.config.KeyboardButton, letter), this.config.InteractionOptions),
        ])*/
        await this.page.waitForSelector(util.format(this.config.NthRowNthLetterState, tries, position, 'tbd'))
    }
    
    /**
     * Retrieve the results of the guess from each of the letter's tiles
     * @async
     * @param {number} tries - The try number
     * @returns {Promise<Array<string>>} The results of the guess
     */
    async getResults(tries){
        await this.page.waitForSelector(util.format(this.config.NthRowLastLetter, tries))
        const result = await this.page.$$eval(util.format(this.config.NthRowAllLetters, tries), (divs, attr) => divs.map(div => div.getAttribute(attr) ), this.config.LetterStateAttribute)  
        this.share.save(result)
        return result

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
        const path = util.format(this.config.OutputPath, ts, outcome, tries, guess, time)
        this.log.log(`saving output to ${path}`)
        fs.writeFile(path.concat(".txt"), this.share.share(win, tries, time))
        await this.page.screenshot({ path: path.concat(".png"), fullPage: true });
        await this.browser.close()
    }
}