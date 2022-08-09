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
 * @class WordleLogger - Provides logging to the wordle-solver
 */
module.exports = class WordleLogger {

    /**
     * Constructor for the WordleLogger class
     * @param {Object} config - Config for the Logger loaded from JSON
     */
    constructor(config){
        this.level = config.level
    }
    
    /**
     * Log a typical standard log message
     * @param {string} msg - The message to log
     */
    log(msg){
        if(this.level > 0) console.log(msg)
    }

    /**
     * Log a typical standard log message in tubular format
     * @param {Object} msg - The message to log
     */
    logTable(msg){
        if(this.level > 0) console.table(msg)
    }

    /**
     * Log a debug log message that's typically not seen
     * @param {string} msg - The message to log
     */
    debug(msg){
        if(this.level > 1) console.log(msg)
    }

    /**
     * Log a debug log message that's typically not seen in tubular format
     * @param {Object} msg - The message to log
     */
    debugTable(msg){
        if(this.level > 1) console.table(msg)
    }
}