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
 * @class WordleAlgoInfoTheory - An algorithm for solving Wordle using information theory
 */
module.exports = class WordleAlgoInfoTheory {

    /**
     * Constructor for the WordleAlgoInfoTheory class
     * @param {Object} config - Config for the Algo
     * @returns {WordleAlgoInfoTheory} This instance of the WordleAlgoInfoTheory
     */
    constructor(config, logger) {
        this.config = config
        this.log = logger
        return this
    }

    /**
     * Calculate the entropy (information content) of a word given the current word list.
     * Entropy is a measure of the expected information gain from guessing this word.
     * Higher entropy means the guess is likely to be more informative.
     * 
     * @param {string} word - The word to calculate entropy for
     * @param {string[]} words - The current list of possible words
     * @returns {number} The calculated entropy
     */
    calculateLetterEntropy(word, words) {
        // Initialize an object to store letter frequencies at each position
        const letterFreq = {};
        for (let letter of 'abcdefghijklmnopqrstuvwxyz') {
            letterFreq[letter] = new Array(5).fill(0);
        }

        // Count the frequency of each letter at each position in the word list
        for (let w of words) {
            for (let i = 0; i < w.length; i++) {
                letterFreq[w[i]][i]++;
            }
        }

        // Calculate the entropy using the formula: -Σ(p * log2(p))
        let entropy = 0;
        for (let i = 0; i < word.length; i++) {
            // Calculate the probability of this letter at this position
            const p = letterFreq[word[i]][i] / words.length;
            // Add to entropy if probability is non-zero
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        }

        return entropy;
    }

    calculatePatternEntropy(word, words) {
        const patternFreq = {};
        for (let w of words) {
            const pattern = this.getPattern(word, w);
            patternFreq[pattern] = (patternFreq[pattern] || 0) + 1;
        }
        
        let entropy = 0;
        for (let count of Object.values(patternFreq)) {
            const p = count / words.length;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    }
    
    getPattern(guess, actual) {
        return guess.split('').map((letter, i) => 
            actual[i] === letter ? '2' : 
            actual.includes(letter) ? '1' : '0'
        ).join('');
    }

    findBestGuessWithLookAhead(words) {
        const calc = this.calculatePatternEntropy.bind(this)
        const size = this.calculateExpectedNextListSize.bind(this)
        return words.reduce((best, word) => {
            const entropy = calc(word, words);
            const expectedNextListSize = size(word, words);
            const score = entropy - Math.log2(expectedNextListSize);
            return score > best.score ? { word, score } : best;
        }, { word: '', score: -Infinity }).word;
    }
    
    calculateExpectedNextListSize(word, words) {
        const patternFreq = {};
        for (let w of words) {
            const pattern = this.getPattern(word, w);
            patternFreq[pattern] = (patternFreq[pattern] || 0) + 1;
        }
        return Object.values(patternFreq).reduce((sum, count) => sum + count * count, 0) / words.length;
    }

    findBestGuessWithPattern(words) {
        const calc = this.calculatePatternEntropy.bind(this)
        return words.reduce((best, word) => {
            const entropy = calc(word, words);
            return entropy > best.entropy ? { word, entropy } : best;
        }, { word: '', entropy: -Infinity }).word;
    }

    findBestGuess(words) {
        const calc = this.calculateLetterEntropy.bind(this)
        return words.reduce((best, word) => {
            const entropy = calc(word, words);
            return entropy > best.entropy ? { word, entropy } : best;
        }, { word: '', entropy: -Infinity }).word;
    }

    /**
     * Get the next word to guess.
     * @returns {string} The next word to guess
     */
    solve(words, positions){
        if(this.config.EntropyScope == "PATTERN_LOOKAHEAD"){
            //precompute the first word: raise
            if(positions.length === 0 && words.includes("slate")){
                return "slate"
            }
            return this.findBestGuessWithLookAhead(words)
        }else if(this.config.EntropyScope == "PATTERN"){
            //precompute: raise
            if(positions.length === 0 && words.includes("raise")){
                return "raise"
            }
            return this.findBestGuessWithPattern(words)
        }else{ //LETTER
            // precompute: slate
            if(positions.length === 0 && words.includes("slate")){
                return "slate"
            }
            return this.findBestGuess(words)
        }
    }
}