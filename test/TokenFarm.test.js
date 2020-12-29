const { assert } = require("chai");
const { default: Web3 } = require("web3");

const TokenFarm = artifacts.require("TokenFarm");
const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");

require("chai")
  .use(require('chai-as-promised'))
  .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([ owner, investor]) => {
    let daiToken, dappToken, tokenFarm;
    before(async () => {
        daiToken = await DaiToken.new();
        dappToken = await DappToken.new();
        tokenFarm = await TokenFarm.new();

        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        await daiToken.transfer(investor, tokens('100'), { from : owner})
    })
    describe('Mock DAI deployment', async() => {
        it('has a name', async() => {
            let daiToken = await DaiToken.new();
            const name = await daiToken.name();
            assert.equal(name, 'Mock DAI token');
        })
    })
    describe('Dapp Token deployment', async() => {
        it('has a name', async() => {
            const name = await dappToken.name();
            assert.equal(name, 'Dapp token');
        })
    })
    describe('Token Farm deployment', async() => {
        it('has a name', async() => {
            const name = await tokenFarm.name();
            assert.equal(name, 'Dapp token');
        })
        it('contract has token', async() => {
        let balace = await dappToken.balaceOf(tokenFarm.address)
        assert.equal(balace.toString(), tokens('1000000'))
    })
    })
    
    describe('Farming tokens', async() => {
        it('rewards investors for staking mDai tokens', async() => {
            let result;
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'),'investor Mock DAi wallet balance correct before staking')

            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor })

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

            await tokenFarm.issueTokens({ from: owner })

            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Dapp Token wallet balance correct after issuance')

            await tokenFarm.issueTokens({ from: investor}).should.be.rejected;

            await tokenFarm.unstakeTokens({ from: investor})

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token Farm correct')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')
        })
    })

})