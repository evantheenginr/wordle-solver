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

const WordleAlgoFreqAnalysis = require('./WordleAlgoFreqAnalysis')
const WordleAlgoInfoTheory = require('./WordleAlgoInfoTheory')

/** 
 * @class WordleBoard - The Wordle board and the internals of its solver
 */
module.exports = class WordleBoard {

    /**
     * Constructor for the WordleBoard class
     * @param {Object} config - Config for the Board loaded from JSON including the WordList and solver Algorithm
     * @returns {WordleBoard} This instance of the Board
     */
    constructor(config, logger) {
        this.config = config
        this.log = logger
        switch(this.config.SolverAlgorithm){
            case "INFORMATION_THEORY":
                this.algo = new WordleAlgoInfoTheory(config, logger)
                break
            case "FREQUENCY_ANALYSIS":
            default:
                this.log.log("Using default solver algorithm")
                this.algo = new WordleAlgoFreqAnalysis(config, logger)
        }
        this.reset()
        return this
    }

    /**
     * Resets the board to its initial state
     */
    reset(){
        this.words = require(this.config.WordList).map(word => word.toLowerCase())
        this.word = [false,false,false,false,false]
        this.positions = []
    }
    
    /**
     * Array filter function for removing words from the word list that don't match board constraints
     * @param {string} word - The word to check
     * @returns {boolean} True if the word matches the board constraints, false otherwise
     */
    guessWord(word){
        return this.word.every((letter, i) => letter?letter === word[i]:true) && 
               this.positions.every((position) => (position.not.length<5?word.includes(position.letter):true) && position.not.every((not) => word[not] != position.letter))
    }

    /**
     * Check the results of the guess and update the board and word scores accordingly
     * @param {string} guess - The word/guess to check
     * @param {Array<string>} results The results of the guess
     */
    check(guess, results){
        //Need to check "correct" first so that absent dupplicates work correctly
        for(let i = 0; i < 5; i++){
            const letter = this.positions.find(l => l.letter === guess[i])
            if(results[i] === "correct"){
                this.word[i] = guess[i]
            }
        }
        for(let i = 0; i < 5; i++){
            const letter = this.positions.find(l => l.letter === guess[i])
            //Handles "present" and a dupplicate letter where the additional occurance is absent
            if(results[i] === "present" || (results[i] === "absent" && this.word.includes(guess[i]))){
                if(letter){
                  letter.not.push(i)
                }else{
                  this.positions.push({letter: guess[i], not: [i]})
                }
            }else if(results[i] === "absent"){
                this.positions.push({letter: guess[i], not: [0,1,2,3,4]})
            }
        }
        this.words = this.words.filter((word) => this.guessWord(word))
        if(this.words.length === 0){
            this.log.debug("no words left to try")
        }else{
            this.log.debug(this.words)
        }
    }

    /**
     * Get the next word to guess.
     * @returns {string} The next word to guess
     */
    solve(){
        return this.algo.solve(this.words, this.positions)
    }
}