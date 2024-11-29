/*
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

const WordleBoard = require('./WordleBoard')

/**
 * @class WordleSolver - The Wordle solver with inversion of control and tests
 */
module.exports = class WordleSolver {

    /**
     * Constructor for the WordleSolver class
     * @param {Object} config - Config for the WordleSolver loaded from JSON
     * @param {Object} automator - The automator to use for the WordleSolver typicall puppeteer web automation or a mock
     * @param {Object} logger - The logger to use for the WordleSolver
     * @returns {WordleSolver} - The WordleSolver instance
     */
    constructor(config, automator, logger) {
        this.config = config
        this.automator = automator
        this.log = logger
        this.reset()
        return this
    }

    /**
     * Resets the board to its initial state
     */
    reset(){
        this.board = new WordleBoard(this.config, this.log)
    }

    /**
     * Return the next best guess from the pre-calculated board
     * @returns {string} The next guess to be tried for the wordle
     */
    solve(){
        return this.board.solve()
    }

    /**
     * Check the results of the guess and update the board and word scores accordingly, pass through method for the board
     * @param {string} guess - The word/guess to check
     * @param {Array<string>} results The results of the guess
     */
    check(guess, results){
        return this.board.check(guess, results)
    }

    /**
     * Play the worldle
     * @async
     * @param {Object} result - The result object used to store the results of the wordle
     */
    async play(result){
        const ts = new Date().getTime()
        this.log.log("wordle-solver.play()")
        this.reset()
        await this.automator.open()
        for(let tries = 1; tries < 7; tries++) {
            //TODO: Handle scenario where there is no guess to be made (undefined)
            const guess = this.solve()
            this.log.debug(`next guess to be entered is: ${guess}`)
            await this.automator.typeWord(guess, tries) 
            const results = await this.automator.getResults(tries)
            this.check(guess, results)
            const win = results.every(result => result==='correct')
            if(win){
                this.log.log(`the wordle is "${guess}"`)
            }
            if(win || (tries >= 6)){
                this.log.log(`the wordle was ${win?"":"not "}solved`)
                const duration = new Date().getTime() - ts
                await this.automator.finished(win, guess, tries, Math.round(duration))
                result.push(guess, win, tries, duration)
                this.log.log(`total time: ${result.last().time}ms`)
                break
            }
        }
    }
}