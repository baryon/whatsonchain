import _ from 'lodash'
const sleep = ( ms ) => new Promise( ( resolve, _ ) => setTimeout( () => resolve(), ms ) )
import WhatsOnChain from '../index'

require( 'mocha' )
const assert = require( 'chai' ).assert

describe( 'WhatsOnChain', async () => {
  beforeEach( async () => {

  } )
  it( 'status', async () => {
    const woc = new WhatsOnChain( 'testnet' )
    const result = await woc.status()
    assert.isTrue( result );
  } ).timeout( 300000 )

  it( 'chainInfo', async () => {
    const woc = new WhatsOnChain( 'testnet' )
    const result = await woc.chainInfo()
    console.log( result )
    assert.isObject( result );
  } ).timeout( 300000 )


  it( 'circulatingsupply', async () => {
    const woc = new WhatsOnChain( 'testnet' )
    const result = await woc.circulatingsupply()
    console.log( result )
    assert.isNumber( result );
  } ).timeout( 300000 )


  it( 'blockHash', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.blockHash( '000000000000000004a288072ebb35e37233f419918f9783d499979cb6ac33eb' )
    console.log( result )
    assert.isObject( result );
  } ).timeout( 300000 )


  it( 'blockHeight', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.blockHeight( 575191 )
    console.log( result )
    assert.isObject( result );
  } ).timeout( 300000 )


  it( 'blockHashByPage', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.blockHashByPage( '000000000000000000885a4d8e9912f085b42288adc58b3ee5830a7da9f4fef4', 1 )
    console.log( result )
    assert.isArray( result );
  } ).timeout( 300000 )


  it( 'blockHeaderByHash', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.blockHeaderByHash( '000000000000000004a288072ebb35e37233f419918f9783d499979cb6ac33eb' )
    console.log( result )
    assert.isObject( result );
  } ).timeout( 300000 )


  it( 'blockHeaders', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.blockHeaders()
    console.log( result )
    assert.isArray( result );
  } ).timeout( 300000 )

  it( 'txHash', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.txHash( 'c1d32f28baa27a376ba977f6a8de6ce0a87041157cef0274b20bfda2b0d8df96' )
    console.log( result )
    assert.isObject( result );
  } ).timeout( 300000 )

  it( 'broadcast', async () => {
    const woc = new WhatsOnChain( 'main' )
    const rawHex = require( './upload.json' ).rawHex
    try {
      const result = await woc.broadcast( rawHex )
      console.log( result )

    } catch ( e ) {
      console.log( e )
    }
  } ).timeout( 300000 )

  it( 'bulkTxDetails', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.bulkTxDetails( [ "294cd1ebd5689fdee03509f92c32184c0f52f037d4046af250229b97e0c8f1aa", "91f68c2c598bc73812dd32d60ab67005eac498bef5f0c45b822b3c9468ba3258" ] )

    console.log( result )
    assert.isArray( result );

  } ).timeout( 300000 )


  it( 'decodeTx', async () => {
    const woc = new WhatsOnChain( 'main' )
    const rawHex = require( './upload.json' ).rawHex

    const result = await woc.decodeTx( rawHex )
    console.log( result )
    assert.isObject( result );

  } ).timeout( 300000 )

 
  it( 'getRawTxData', async () => {
    const woc = new WhatsOnChain( 'main' )

    const result = await woc.getRawTxData( 'c1d32f28baa27a376ba977f6a8de6ce0a87041157cef0274b20bfda2b0d8df96' )

    console.log( result )

    assert.equal( result, '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff1c03d7c6082f7376706f6f6c2e636f6d2f3edff034600055b8467f0040ffffffff01247e814a000000001976a914492558fb8ca71a3591316d095afc0f20ef7d42f788ac00000000' );

  } ).timeout( 300000 )

  it( 'getRawTxOutputData', async () => {
    const woc = new WhatsOnChain( 'main' )

    const result = await woc.getRawTxOutputData( 'c1d32f28baa27a376ba977f6a8de6ce0a87041157cef0274b20bfda2b0d8df96', 0 )

    console.log( result )

    assert.equal( result, '76a914492558fb8ca71a3591316d095afc0f20ef7d42f788ac' );

  } ).timeout( 300000 )



  it( 'merkleProof', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.merkleProof( 'c1d32f28baa27a376ba977f6a8de6ce0a87041157cef0274b20bfda2b0d8df96' )

    console.log( result, result[ 0 ].branches )
    assert.isArray( result );
    assert.equal( result[ 0 ].merkleRoot, '95a920b1002bed05379a0d2650bb13eb216138f28ee80172f4cf21048528dc60' );

  } ).timeout( 300000 )


  it( 'mempoolInfo', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.mempoolInfo()

    console.log( result )
    assert.isObject( result );

  } ).timeout( 300000 )

  it( 'mempoolTxs', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.mempoolTxs()

    console.log( result )
    assert.isArray( result );

  } ).timeout( 300000 )


  it( 'addressInfo', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.addressInfo( '16ZqP5Tb22KJuvSAbjNkoiZs13mmRmexZA' )

    console.log( result )
    assert.equal( result.scriptPubKey, '76a9143d0e5368bdadddca108a0fe44739919274c726c788ac' );

  } ).timeout( 300000 )

  it( 'balance', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.balance( '1MDz4AdwGB7EkhoKrBKU6pwMRaAeGueqiy' )

    console.log( result )
    assert.isObject( result );

  } ).timeout( 300000 )


  it( 'history', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.history( '1GJ3x5bcEnKMnzNFPPELDfXUCwKEaLHM5H' )

    console.log( result )
    assert.isArray( result );

  } ).timeout( 300000 )


  it( 'utxos', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.utxos( '1MDz4AdwGB7EkhoKrBKU6pwMRaAeGueqiy' )

    console.log( result )
    assert.isArray( result );

  } ).timeout( 300000 )


  it( 'historyByScriptHash', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.historyByScriptHash( '995ea8d0f752f41cdd99bb9d54cb004709e04c7dc4088bcbbbb9ea5c390a43c3' )

    console.log( result )
    assert.isArray( result );

  } ).timeout( 300000 )


  it( 'utxosByScriptHash', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.utxosByScriptHash( '995ea8d0f752f41cdd99bb9d54cb004709e04c7dc4088bcbbbb9ea5c390a43c3' )

    console.log( result )
    assert.isArray( result );

  } ).timeout( 300000 )


  it( 'exchangeRate', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.exchangeRate()

    console.log( result )
    assert.isArray( result );

  } ).timeout( 300000 )


  it( 'minerBlocksStats', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.minerBlocksStats(30)

    console.log( result )
    assert.isArray( result );

  } ).timeout( 300000 )


  it( 'GetOPReturnByTxHash', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.GetOPReturnByTxHash( '7426d28358988dec6d470e3ef6b5b18ad7979014097cf119e245f98ec80edbc7' )

    console.log( result )
    assert.isArray( result );

  } ).timeout( 300000 )


  it( 'search address', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.search( '16ZqP5Tb22KJuvSAbjNkoiZs13mmRmexZA' )

    console.log( result )
    assert.isObject( result );

  } ).timeout( 300000 )

  it( 'search tx', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.search( '294cd1ebd5689fdee03509f92c32184c0f52f037d4046af250229b97e0c8f1aa' )

    console.log( result )
    assert.isObject( result );

  } ).timeout( 300000 )

  it( 'search text', async () => {
    const woc = new WhatsOnChain( 'main' )
    const result = await woc.search( 'love' )

    console.log( result )
    assert.isObject( result );

  } ).timeout( 300000 )

  it( 'Rate Limits 3r/s', async () => {
    const woc = new WhatsOnChain( 'testnet' )
    console.time( 'rate-limited' );
    for ( let i = 0; i < 20; i++ ) {
      const result = await woc.blockHeight( i + 10000 )
      assert.isObject( result );
    }
    console.timeEnd( 'rate-limited' ); //12389.494ms
  } ).timeout( 300000 )

  it( 'ApiKey', async () => {
    const woc = new WhatsOnChain( 'mainnet', { apiKey: 'Your API Key' } )
    console.time( 'apikey' );
    for ( let i = 0; i < 20; i++ ) {
      const result = await woc.blockHeight( i + 10000 )
      assert.isObject( result );
    }
    console.timeEnd( 'apikey' );//10545.773ms

  } ).timeout( 300000 )

} )
