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

const Container = require('plus.container');
const WordleSolver = require('./WordleSolver')
const WordleWebAutomator = require('./WordleWebAutomator')
const WordleLogger = require('./WordleLogger')
const WordleResult = require('./WordleResult')
const WordleConfig = require('./config.json')

const WordleMockAutomator = require('./WordleMockAutomator')

class Wordle {
    constructor(){
        this.ioc = new Container()
        this.ioc.register('config', WordleConfig)
        this.ioc.register('WordleLogger', WordleLogger, ['config/prod/logger'])
        this.ioc.register('WordleWebAutomator', WordleWebAutomator, ['config/prod/automator', WordleLogger.name])
        this.ioc.register('WordleSolver', WordleSolver, ['config/prod/solver', WordleWebAutomator.name, WordleLogger.name])
        this.ioc.register('WordleResult', WordleResult, [])
    }

    async play(){
        this.ioc.WordleSolver.play(this.ioc.WordleResult)
    }
}

module.exports = { Wordle, WordleSolver, WordleWebAutomator, WordleLogger, WordleResult, WordleMockAutomator, WordleConfig }
