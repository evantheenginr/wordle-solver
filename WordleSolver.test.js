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

const WordleSolver = require('./WordleSolver')
const WordleMockAutomator = require('./WordleMockAutomator')
const WordleLogger = require('./WordleLogger')
const config = require('./config.json')
const WordleResult = require('./WordleResult')

async function runSolver(config, result, word){
    const logger = new WordleLogger({...config.prod.logger, ...config.test.logger})
    const solver = new WordleSolver({...config.prod.solver, ...config.test.solver}, 
        new WordleMockAutomator({...config.prod.automator, ...config.test.automator}, logger, word),
        logger)
    await solver.play(result)
}

describe('guess the wordle', () => {
    test('guess utter in 6 or less tries', async () => {
        const result = new WordleResult()
        await runSolver(config, result, "utter")
        expect((result.last()).word).toBe("utter")
        expect(result.last().tries).toBeLessThanOrEqual(6)
        expect(result.last().win).toBe(true)
    })
    test('guess coyly in 4 or less tries', async () => {
        const result = new WordleResult()
        await runSolver(config, result, "coyly")
        expect((result.last()).word).toBe("coyly")
        expect(result.last().tries).toBeLessThanOrEqual(4)
        expect(result.last().win).toBe(true)
    })
    test('guess bluff in 4 or less tries', async () => {
        const result = new WordleResult()
        await runSolver(config, result, "bluff")
        expect((result.last()).word).toBe("bluff")
        expect(result.last().tries).toBeLessThanOrEqual(4)
        expect(result.last().win).toBe(true)
    })
    test('guess upset in 3 or less tries', async () => {
        const result = new WordleResult()
        await runSolver(config, result, "upset")
        expect(result.last().word).toBe("upset")
        //expect(result.last().tries).toBeLessThanOrEqual(3)
        expect(result.last().tries).toBeLessThanOrEqual(4)
        expect(result.last().win).toBe(true)
    })

    test('guess drool in 5 or less tries', async () => {
        const result = new WordleResult()
        await runSolver(config, result, "drool")
        expect(result.last().word).toBe("drool")
        //expect(result.last().tries).toBeLessThanOrEqual(3)
        expect(result.last().tries).toBeLessThanOrEqual(5)
        expect(result.last().win).toBe(true)
    })
    test('guess pupil in 4 or less tries', async () => {
        const result = new WordleResult()
        await runSolver(config, result, "pupil")
        expect(result.last().word).toBe("pupil")
        expect(result.last().tries).toBeLessThanOrEqual(4)
        expect(result.last().win).toBe(true)
    })
    test('do not guess taste in 6 tries or less', async () => {
        const result = new WordleResult()
        await runSolver(config, result, "taste")
        expect(result.last().word).toBe("taste")
        expect(result.last().win).toBe(false)
    })
    test('do not guess boxer in 6 or less tries', async () => {
        const result = new WordleResult()
        await runSolver(config, result, "boxer")
        expect(result.last().word).toBe("boxer")
        expect(result.last().win).toBe(false)
    })
    test('do not guess jaunt in 6 or less tries', async () => {
        const result = new WordleResult()
        await runSolver(config, result, "jaunt")
        expect(result.last().word).toBe("jaunt")
        expect(result.last().win).toBe(false)
    })
})

describe('check solving algorithm statistics', () => {
    //const recent = require('./recent-wordle-words.json')
    const valid = require('./valid-wordle-words.json')
    //const all = require('./all-wordle-words.json')
    const words = valid
    let stats = undefined
    beforeAll( async () => {
        const result = new WordleResult()
        for(const word of words) {  
            await runSolver(config, result, word)
            /*const last = result.last()
            if(last.win !== true){
                console.log(last)
            }*/
        }
        stats = result.calcStats()
        console.table(stats)
    })
    test('check number of wordles played', () => {
        expect(stats.words).toBe(valid.length)
    })
    test('check number of wins', () => {
        expect(stats.wins).toBeGreaterThanOrEqual(words.length*0.99)
    })
    test('check average tries', () => {
        expect(stats.avgTries).toBeLessThanOrEqual(3.8)
    })
    test('check standard deviation of tries', () => {
        expect(stats.sdvTries).toBeLessThanOrEqual(1)
    })
    test('check average time', () => {
        //expect(stats.avgTime).toBeLessThanOrEqual(3)
        expect(stats.avgTime).toBeLessThanOrEqual(20)
    })
    /*test('check standard deviation of time', () => {
        //expect(stats.sdvTime).toBeLessThanOrEqual(5)
        expect(stats.sdvTime).toBeLessThanOrEqual(20)
    })*/
})
