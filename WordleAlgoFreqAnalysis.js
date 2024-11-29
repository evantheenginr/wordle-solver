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
 * @class WordleAlgoFreqAnalysis - An algorithm for solving Wordle based on frequency analysis
 */
module.exports = class WordleAlgoFreqAnalysis {

    /**
     * Constructor for the WordleAlgoFreqAnalysis class
     * @param {Object} config - Config for the Algo
     * @returns {WordleAlgoFreqAnalysis} This instance of the Board
     */
    constructor(config, logger) {
        this.config = config
        this.log = logger
        this.reset()
        return this
    }

    /**
     * Resets the board to its initial state
     */
    reset(){
        this.scores = undefined
        this.positions = []
        //this.calcLetterScores()
    }

    /**
     * Array sorting function to sort the words by their score
     * @param {string} a - The first word to compare
     * @param {string} b - The second word to compare
     * @returns {number} The result of the comparison sorting words descending by score
     */
    rankWord(a, b){
        return -1 * (this.calcWord(a) - 
                     this.calcWord(b))
    }
  
    /**
     * Calcualtes the word score for a given word factoring out dupplicate letters and letters already discovered
     * @param {string} word - The word to calculate the score for
     * @returns {number} The score of the word
     */
    calcWord(word){
        const letters = [...(word)].filter(this.uniqueLetters)
                                   .filter((letter) => this.usedLetters(letter))
        if(letters.length > 0){
            return letters.reduce( (score, letter) => this.calcLetter(score, letter))
        }else{
            return 0
        }                 
    }

    /**
     * Array reducer function for calculating the score for all letters in word
     * @param {number} score 
     * @param {string} letter 
     * @returns Accumulated score for the word
     */
    calcLetter(score, letter){
        if(!isNaN(score)){
            return score + this.scores.get(letter)
        }else{
            return this.scores.get(letter) + this.scores.get(score)
        }
    }

    /**
     * Calculates the letter scores used to calculate the word scores based on the chosen algorithm
     */
    calcLetterScores(words){
        const alphabet = [..."abcdefghijklmnopqrstuvwxyz"]
        switch(this.config.LetterScoreAlgorithm){
            //Reference: <https://www.wordcheats.com/blog/most-used-letters-in-english>
            case "STATIC_PROPORTINAL_FULL_LANGUAGE":
                this.scores = new Map([["e",11.1607],["a",8.4966],["r",7.5809],["i",7.5448],["o",7.1635],["t",6.9509],["n",6.6544],["s",5.7351],["l",5.4893],["c",4.5388],["u",3.6308],["d",3.3844],["p",3.1671],["m",3.0129],["h",3.0034],["g",2.4705],["b",2.0720],["f",1.8121],["y",1.7779],["w",1.2899],["k",1.1016],["v",1.0074],["x",0.2902],["z",0.2722],["j",0.1965],["q",0.1962]])
                break
            case "STATIC_PROPORTINAL_SCALED_FULL_LANGUAGE":
                this.scores = new Map([["e",11.1607*50],["a",8.4966*50],["r",7.5809*50],["i",7.5448*50],["o",7.1635*50],["t",6.9509*50],["n",6.6544*50],["s",5.7351*50],["l",5.4893*50],["c",4.5388*50],["u",3.6308*50],["d",3.3844*50],["p",3.1671*50],["m",3.0129*50],["h",3.0034*50],["g",2.4705*50],["b",2.0720*50],["f",1.8121*50],["y",1.7779*50],["w",1.2899*50],["k",1.1016*50],["v",1.0074*50],["x",0.2902*50],["z",0.2722*50],["j",0.1965*50],["q",0.1962*50]])
                break
            case "STATIC_LINEAR_FULL_LANGUAGE":
                this.scores = new Map([["e",26],["a",25],["r",24],["i",23],["o",22],["t",21],["n",20],["s",19],["l",18],["c",17],["u",16],["d",15],["p",14],["m",13],["h",12],["g",11],["b",10],["f",9],["y",8],["w",7],["k",6],["v",5],["x",4],["z",3],["j",2],["q",1]])
                break
            case "STATIC_LINEAR_WORDLE_LIST":
                this.scores = new Map([["e",26],["a",25],["r",24],["o",23],["t",22],["i",21],["l",20],["s",19],["n",18],["u",17],["c",16],["y",15],["h",14],["d",13],["p",12],["g",11],["m",10],["b",9],["f",8],["k",7],["w",6],["v",5],["x",4],["z",3],["q",2],["j",1]])
                break
            case "STATIC_PROPORTINAL_WORDLE_LIST":
                this.scores = new Map([["e",456],["a",392],["r",362],["o",291],["t",288],["i",279],["l",279],["s",267],["n",238],["u",197],["c",194],["y",180],["h",164],["d",160],["p",149],["g",130],["m",129],["b",115],["f",89],["k",87],["w",84],["v",64],["x",16],["z",15],["q",13],["j",12]])
                break
            case "STATIC_PROPORTINAL_SCALED_WORDLE_LIST":
                this.scores = new Map([["e",23],["a",20],["r",18],["i",14],["o",14],["l",14],["t",14],["s",13],["n",12],["c",10],["u",10],["y",9],["d",8],["h",8],["p",7],["b",6],["g",6],["m",6],["f",4],["k",4],["w",4],["v",3],["j",1],["q",1],["x",1],["z",1]])
                break
            case "DYNAMIC_PROPORTINAL_WORDLE_LIST":
                this.scores = new Map(alphabet.map(letter => [letter, Math.round(words.filter(word => word.includes(letter)).length / words.length ) ] ))
                break
            default:
                throw new Error("Unknown algorithm")
        }
        this.log.debugTable(this.scores)
    }

    /**
     * Array filter function for removing duplicate letters from word prior to scoring
     * @param {string} value 
     * @param {number} index 
     * @param {Array<string>} self 
     * @returns {boolean} True if the letter is unique, false if it is not
     * @see <https://stackoverflow.com/questions/1960473/unique-values-in-an-array-of-objects-by-a-property-or-just-a-string>
     */
    uniqueLetters(value, index, self) {
        return self.indexOf(value) === index;
    }

    /**
     * Array filter function for removing letters don't need from the word prior to scoring
     * @param {string} letter 
     * @returns {boolean} True if the letter has not already been discovered on the board, false otherwise
     */
    usedLetters(letter, isDone){
        return !(this.positions.some((position) => position.letter === letter))
    }

    /**
     * Get the next word to guess.
     * @returns {string} The next word to guess
     */
    solve(words, positions){
        if(positions.length === 0 && words.includes("irate")){
            return "irate"
        }
        this.positions = positions
        this.calcLetterScores(words)
        words.sort((a,b) => this.rankWord(a,b))
        return words[0]
    }
}