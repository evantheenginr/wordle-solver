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
 * @class WordleResult - Storage for one or many Wordle results
 */
module.exports = class WordleResult {

    /**
     * Constructor for the WordleResult class
     * @param {Object} config - Config for the Results loaded from JSON
     */
    constructor(config) {
        this.config = config
        this.results = []
    }

    /**
     * Store a Wordle result
     * @param {string} word - The word that was found
     * @param {boolean} win - Was the word was found
     * @param {number} tries - Number of tries to find the wordle
     * @param {number} time - Time to find the wordle
     */
    push(word, win, tries, time){
        this.results.push({word, win, tries, time})
    }

    /**
     * Retrieve the most recent result
     * @returns {Object} The most recent result
     */
    last(){
        return this.results[this.results.length-1]
    }

    /**
     * Calculate the avg/sdv/etc for the results
     * @returns {Object} Stats for the results, most useful with multiple results
     */
    calcStats(){
        const avgTries = this.results.reduce((acc, cur) => acc + cur.tries, 0) / this.results.length
        const avgTime = this.results.reduce((acc, cur) => acc + cur.time, 0) / this.results.length
        const wins = this.results.filter(result => result.win).length
        const stats = {
            words: this.results.length,
            wins: wins,
            winRate: Math.round(wins / this.results.length*100000)/1000,
            avgTries: Math.round(avgTries*1000)/1000,
            medTries: this.results.sort((a, b) => a.tries - b.tries)[Math.floor(this.results.length/2)].tries,
            avgTime: Math.round(avgTime*10000)/10000,
            sdvTime: Math.round(Math.sqrt(this.results.reduce((acc, cur) => acc + Math.pow(cur.time - avgTime, 2), 0) / this.results.length)*10000)/10000,
            sdvTries: Math.round(Math.sqrt(this.results.reduce((acc, cur) => acc + Math.pow(cur.tries - avgTries, 2), 0) / this.results.length)*10000)/10000
        }
        return stats
    }
}