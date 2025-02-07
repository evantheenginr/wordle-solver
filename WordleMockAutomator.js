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

/**
 * @class WordleMockAutomator - A mock automator for the Wordle Web Application
 */
module.exports = class WordleMockAutomator {

    /**
     * Constructor for the WordleMockAutomator class
     * @param {Object} config - Config for the Mock loaded from JSON
     * @param {Object} logger - The logger to use
     * @param {string} answer - The answer to the wordle that is being simulated
     */
    constructor(config, logger, answer){
        this.log = logger
        this.config = config
        this.answer = answer.toLowerCase()
    }

    /**
     * Hook at the start of the automation
     * @async
     */
    async open(){}

    /**
     * Mock for typing the guess
     * @async
     * @param {string} guess 
     */
    async typeWord(guess, tries){
        this.guess = guess.toLowerCase()
    }

    /**
     * Simulate the results for a single letter in the guess
     * @param {char} letter - The letter to simulate
     * @param {number} i - The index of the letter in the guess
     * @param {string} guess - The entire guess
     * @returns {string} absent|present|correct
     */
    simulate(letter, i, guess){
        if(letter === this.answer[i]){
            return 'correct'
        //Only 'present' if letter is not correct and is in the answer at least once in a position that has not yet been discovered
        //specifically a second occurance that's not corret is absent
        }else if(this.answer.includes(letter) && [...(this.answer)].some((char, j) => letter===char?char != guess[j]:false) && guess.indexOf(letter) == i){
            return 'present'
        }else{
            return 'absent'
        }
    }

    /**
     * Simulate the results for the entire guessed word
     * @async
     * @param {number} tries 
     * @returns {Promise<Array<string>>} The results of the guess
     */
    async getResults(tries){
        const ret = [...(this.guess)].map((letter, i, guess) => this.simulate(letter, i, guess) )
        this.log.debug(ret)
        return ret
    }

    /**
     * Hook at the end of the automation
     * @async
     * @param {boolean} win  - Was the word was found
     * @param {string} guess - The final guess which could be the winning guess
     * @param {number} tries - The number of tries/attempts made
     * @param {number} time - The time elapsed in milliseconds for all attempts
     */
    async finished(win, guess, tries, time){}
}