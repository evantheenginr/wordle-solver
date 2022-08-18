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

/**
 * @class Generator that produces a string to share your wordle results
 * Under normal circumstances, this class would not be needed as the online
 * application produces the sharing text, but Puppeteer was not able to headlessly
 * access the clipboard.
 */
module.exports = class WordleShare {

    /**
     * Constructor for the WordleShare class
     */
    constructor(){
        this.results = []
    }

    /**
     * Save each guess result translated into colored boxes for sharing
     * @param {Array<string>} result 
     */
    save(result){
        this.results.push(result.map(position => this.translate(position)).join(""))
    }

    /**
     * Map each string result to a specific colored box
     * @param {string} result - The result of a single letter of the 
     * guess in string form to be converted to a colored box for sharing 
     * @returns {string} - The colored box for sharing
     */
    translate(result){
        if(result == "absent"){
            return "⬜"
        }else if(result == "present"){
            return "🟨"
        }else if(result == "correct"){
            return "🟩"
        }
    }

    /**
     * Return the results as a string to share
     * @param {boolean} win - Outcome of the game
     * @param {number} tries - Number of tries made to guess the word
     * @param {number} time - Time in total to play the game
     * @returns 
     */
    share(win, tries, time){
        const days = Math.floor((new Date() - new Date("2021-06-19")) / (1000 * 60 * 60 * 24))
        const seconds = Math.round(time/1000)
        return "Wordle " + days + " " + (win?tries:"X") + "/6\n\n" +
            this.results.join("\n") + "\n\n" +
            seconds + " seconds\n"
    }
}