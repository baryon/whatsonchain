const axios = require( "axios" );
const { cacheAdapterEnhancer, throttleAdapterEnhancer } = require( 'axios-extensions' )

const API_ROOT = "https://api.whatsonchain.com/v1/bsv"

class WhatsOnChain {
  /**
   * WhatsOnChain API Wrapper
   * @param {string} network Selected network: main , test or stn
   * @param {object} opts timeout, userAgent, apiKey and enableCache
   */
  constructor ( network = 'main', opts = {} ) {
    this._network = ( network === 'main' || network === 'mainnet' || network === 'livenet' ) ? 'main' : ( network === 'test' || network === 'testnet' ) ? 'test' : 'stn'
    this._timeout = opts.timeout || 30000
    this._userAgent = opts.userAgent | opts._userAgent
    this._apiKey = opts.apiKey
    this._enableCache = ( opts.enableCache === undefined ) ? true : !!opts.enableCache

    this._init()
  }

  _init () {
    // enhance the original axios adapter with throttle and cache enhancer 
    const headers = {
      'Cache-Control': 'no-cache'
    }
    const throttleOpt = {}
    const cacheOpt = {
      enabledByDefault: this._enableCache
    }

    if ( this._userAgent ) {
      headers[ 'User-Agent' ] = this._userAgent
    }

    // https://docs.taal.com/core-products/whatsonchain#rate-limits
    if ( this._apiKey ) {
      headers[ 'Authorization' ] = `${this._network === 'main' ? 'mainnet' : this._network === 'test' ? 'testnet' : 'stn'}_${this._apiKey}`
      throttleOpt[ 'threshold' ] = 0
    } else {
      //Up to 3 requests/sec.
      throttleOpt[ 'threshold' ] = 334 //(1000/3)
    }

    this._httpClient = axios.create( {
      baseURL: `${API_ROOT}/${this._network}/`,
      timeout: this._timeout,
      headers,
      adapter: throttleAdapterEnhancer( cacheAdapterEnhancer( axios.defaults.adapter, cacheOpt ), throttleOpt )
    } )

    return this
  }

  _parseResponse ( response ) {
    return response.data
  }

  _parseError ( error ) {
    if ( error.response ) {
      // server return error
      // console.warn( error.response.data )
      // console.warn( error.response.status )
      // console.warn( error.response.headers )
      throw new Error( error.response.data )
    } else if ( error.request ) {
      // console.warn( error.message )
      throw new Error( error.message )
    } else {
      // console.warn( 'Error', error )
      throw error
    }
  }

  _get ( command, params ) {
    // Create query with given parameters, if applicable
    params = params || {}

    const options = {
      params
    }

    return this._httpClient.get( command, options )
      .then( this._parseResponse )
      .catch( this._parseError )
  }

  _post ( command, data ) {
    const options = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    return this._httpClient.post( command, data, options )
      .then( this._parseResponse )
      .catch( this._parseError )
  }

  /**
   * Get api status
   * Simple endpoint to show API server is up and running
   * https://docs.taal.com/core-products/whatsonchain/health#get-api-status
   */
  status () {
    return this._get( 'woc' ).then( result => result === 'Whats On Chain' )
  }


  /**
   * Get blockhain info
   * This endpoint retrieves various state info of the chain for the selected network.
   * https://docs.taal.com/core-products/whatsonchain/chain-info#get-blockchain-info
   */
  chainInfo () {
    return this._get( 'chain/info' )
  }


  /**
   * Get Chain Tips
   * This endpoint retrieves information about all known tips in the block tree.
   * https://docs.taal.com/core-products/whatsonchain/chain-info#get-chain-tips
   */
  chainTips () {
    return this._get( 'chain/tips' )
  }

  /**
 * Get Peer Info
 * This endpoint retrieves information on peers connected to the node.
 * https://docs.taal.com/core-products/whatsonchain/chain-info#get-chain-tips
 */
  peerInfo () {
    return this._get( 'peer/info' )
  }

  /**
   * Get Circulating Supply
   * This endpoint provides circulating supply of BSV.
   * https://docs.taal.com/core-products/whatsonchain/chain-info#get-circulating-supply
   */
  circulatingsupply () {
    return this._get( 'circulatingsupply' )
  }


  /**
   * Get by hash
   * This endpoint retrieves block details with given hash.
   * https://docs.taal.com/core-products/whatsonchain/block#get-by-hash
   * @param {string} hash The hash of the block to retrieve
   */
  blockHash ( hash ) {
    return this._get( `block/hash/${hash}` )
  }

  /**
   * Get by height
   * This endpoint retrieves block details with given block height.
   * https://docs.taal.com/core-products/whatsonchain/block#get-by-height
   * @param {number} height The height of the block to retrieve
   */
  blockHeight ( height ) {
    return this._get( `block/height/${height}` )
  }


  /**
   * Get block pages
   * If the block has more that 1000 transactions the page URIs will be provided in the pages element when getting a block by hash or height.
   * https://docs.taal.com/core-products/whatsonchain/block#get-block-pages
   * @param {string} hash The hash of the block to retrieve
   * @param {number} page Page number
   */
  blockHashByPage ( hash, page ) {
    return this._get( `block/hash/${hash}/page/${page}` )
  }

  /**
   * Get header by hash
   * This endpoint retrieves block header details with given hash.
   * https://docs.taal.com/core-products/whatsonchain/block#get-header-by-hash
   * @param {string} hash The hash of the block to retrieve
   */
  blockHeaderByHash ( hash ) {
    return this._get( `block/${hash}/header` )
  }

  /**
   * Get headers
   * This endpoint retrieves last 10 block headers.
   * https://docs.taal.com/core-products/whatsonchain/block#get-headers
   */
  blockHeaders () {
    return this._get( 'block/headers' )
  }

  /**
   * Get Header Bytes File Links
   * This endpoint retrieves a list of block header binary file links 
   * and each file only contains 80-byte block headers. 
   * These contain 10,000 block headers per file up to height 760,000. 
   * https://docs.taal.com/core-products/whatsonchain/block#get-headers
   */
  blockHeadersResources () {
    return this._get( 'block/headers/resources' )
  }

  /**
  * Get Latest Header Bytes
  * This endpoint retrieves the latest specified number of block headers (up to 100) 
  * as a binary file. If "count" parameter is not provided, 
  * returns the latest header file, with up to 2000 block headers. 
  * https://docs.taal.com/core-products/whatsonchain/block#get-headers
  */
  blockHeadersLatestCount ( count ) {
    return this._get( 'block/headers/latest', { count } )
  }

  /**
   * Get by tx hash
   * This endpoint retrieves the transaction details for a given transaction hash.
   * In the response body, if any output's hex size (vout[x].scriptPubKey.hex) exceeds 100KB, 
   * then the data for vout[x].scriptPubKey.hex and vout[x].scriptPubKey.asm is truncated 
   * and a flag vout[x].scriptPubKey.isTruncated is set to true.
   * https://docs.taal.com/core-products/whatsonchain/transaction#get-by-tx-hash
   * @param {string} hash The hash/txId of the transaction to retrieve
   */
  txHash ( hash ) {
    return this._get( `tx/hash/${hash}` )
  }

  /**
 * Get Transaction Propagation Status
 * This endpoint returns the propagation status for a given transaction. 
 * It queries a random set of peers on the network and returns 
 * the number of peers that have the transaction in question.
 * https://docs.taal.com/core-products/whatsonchain/transaction#get-transaction-propagation-status
 * @param {string} hash The hash/txId of the transaction to retrieve
 */
  txHashByPropagation ( hash ) {
    return this._get( `tx/hash/${hash}/propagation` )
  }

  /**
   * Broadcast transaction
   * Broadcast transaction using this endpoint. Get txid in response or error msg from node with header content-type: text/plain.
   * https://docs.taal.com/core-products/whatsonchain/transaction#broadcast-transaction
   * @param {string} txhex Raw transaction data in hex
   */
  broadcast ( txhex ) {
    return this._post( 'tx/raw', {
      txhex
    } )
  }

  /**
   * Bulk transaction details
   * Fetch details for multiple transactions in single request
   * - Max 20 transactions per request
   * https://docs.taal.com/core-products/whatsonchain/transaction#bulk-transaction-details
   * @param {Array} txidArray 
   */
  bulkTxDetails ( txidArray ) {
    return this._post( `txs`, {
      txids: txidArray
    } )
  }

  /**
 * Bulk Transaction Status
 * You can get the status of multiple transactions in a single request.
 * - Max 20 transactions per request
 * https://docs.taal.com/core-products/whatsonchain/transaction#bulk-transaction-status
 * @param {Array} txidArray 
 */
  bulkTxStatus ( txidArray ) {
    return this._post( `txs/status`, {
      txids: txidArray
    } )
  }

  /**
   * Decode transaction
   * Decode raw transaction using this endpoint. Get json in response or error msg from node.
   * https://developers.whatsonchain.com/#decode-transaction
   * @param {string} txhex Raw transaction data in hex
   */
  decodeTx ( txhex ) {
    return this._post( 'tx/decode', {
      txhex
    } )
  }


  /**
   * Get raw transaction data
   * Get raw transaction data in hex
   * https://docs.taal.com/core-products/whatsonchain/transaction#get-raw-transaction-data
   * @param {string} hash The hash/txId of the transaction
   */
  getRawTxData ( hash ) {
    return this._get( `tx/${hash}/hex` )
  }

  /**
 * Bulk Raw Transaction Data
 * You can get the raw data of multiple transactions in hex in a single request.
 * - Max 20 transactions per request
 * https://docs.taal.com/core-products/whatsonchain/transaction#bulk-raw-transaction-data
 * @param {Array} txidArray 
 */
  bulkTxData ( txidArray ) {
    return this._post( `txs/hex`, {
      txids: txidArray
    } )
  }

  /**
   * Get raw transaction output data
   * Get raw transaction vout data in hex
   * https://docs.taal.com/core-products/whatsonchain/transaction#get-raw-transaction-output-data
   * @param {string} hash The hash/txId of the transaction
   * @param {number} outputIndex Output index
   */
  getRawTxOutputData ( hash, outputIndex ) {
    return this._get( `tx/${hash}/out/${outputIndex}/hex` )
  }


  /**
   * Get merkle proof
   * This endpoint returns merkle branch to a confirmed transaction
   * https://docs.taal.com/core-products/whatsonchain/transaction#get-merkle-proof
   * @param {string} hash The hash/txId of the transaction
   */
  merkleProof ( hash ) {
    return this._get( `tx/${hash}/proof` )
  }


  /**
   * Get mempool info
   * This endpoint retrieves various info about the node's mempool for the selected network.
   * https://docs.taal.com/core-products/whatsonchain/mempool#get-mempool-info
   */
  mempoolInfo () {
    return this._get( `mempool/info` )
  }


  /**
   * Get mempool transactions
   * This endpoint retrieve list of transaction ids from the node's mempool for the selected network.
   * https://docs.taal.com/core-products/whatsonchain/mempool#get-mempool-transactions
   * 
   */
  mempoolTxs () {
    return this._get( `mempool/raw` )
  }


  /**
   * Get address info
   * This endpoint retrieves various address info.
   * https://docs.taal.com/core-products/whatsonchain/address#get-address-info
   * @param {string} address 
   */
  addressInfo ( address ) {
    return this._get( `address/${address}/info` )
  }

  /**
 * Get Address Usage Status
 * This endpoint serves as a usage status flag for a given address.
 * https://docs.taal.com/core-products/whatsonchain/address#get-address-usage-status
 * @param {string} address 
 */
  addressUsed ( address ) {
    return this._get( `address/${address}/used` )
  }

  /**
   * Get balance
   * This endpoint retrieves confirmed and unconfirmed address balance.
   * https://docs.taal.com/core-products/whatsonchain/address#get-balance
   * @param {string} address 
   */
  balance ( address ) {
    return this._get( `address/${address}/balance` )
  }

  /**
 * Bulk Balance
 * This endpoint retrieves both the confirmed and unconfirmed balance for 
 * multiple addresses in a single request.
 * Max 20 addresses per request.
 * https://docs.taal.com/core-products/whatsonchain/address#bulk-balance
 * @param {Array<string>} addressArray 
 */
  bulkBalance ( addressArray ) {
    return this._post( `address/balance`, {
      addresses: addressArray
    } )
  }

  /**
   * Get history
   * This endpoint retrieves confirmed and unconfirmed address transactions.
   * https://docs.taal.com/core-products/whatsonchain/address#get-history
   * @param {string} address 
   */
  history ( address ) {
    return this._get( `address/${address}/history` )
  }

  /**
   * Get unspent transactions
   * This endpoint retrieves an ordered list of UTXOs for a given address.
   * https://docs.taal.com/core-products/whatsonchain/address#get-unspent-transactions
   * @param {string} address 
   */
  utxos ( address ) {
    return this._get( `address/${address}/unspent` )
  }

  /**
 * Bulk Unspent Transactions
 * This endpoint retrieves a list of UTXOs for multiple addresses in a single request.
 * Max 20 addresses per request.
 * https://docs.taal.com/core-products/whatsonchain/address#bulk-unspent-transactions
 * @param {Array<string>} addressArray 
 */
  bulkUtxos ( addressArray ) {
    return this._post( `address/unspent`, {
      addresses: addressArray
    } )
  }

  /**
   * Download statement
   * Download address statement (PDF)
   * https://docs.taal.com/core-products/whatsonchain/address#download-statement
   * @param {string} address 
   */
  statementPDF ( address ) {
    return this._get( `https://${this._network}.whatsonchain.com/statement/${address}` )
  }


  /**
* Get Script Usage Status
* This endpoint serves as a usage status flag for a given script.
* https://docs.taal.com/core-products/whatsonchain/script#get-script-usage-status
* @param {string} address 
*/
  scriptUsed ( scriptHash ) {
    return this._get( `script/${scriptHash}/used` )
  }


  /**
   * Get script history
   * This endpoint retrieves confirmed and unconfirmed script transactions.
   * https://docs.taal.com/core-products/whatsonchain/script#get-script-history
   * @param {string} scriptHash Script hash: Sha256 hash of the binary bytes of the locking script (ScriptPubKey), expressed as a hexadecimal string.
   */
  historyByScriptHash ( scriptHash ) {
    return this._get( `script/${scriptHash}/history` )
  }

  /**
   * Get script unspent transactions
   * This endpoint retrieves ordered list of UTXOs.
   * https://docs.taal.com/core-products/whatsonchain/script#get-script-unspent-transactions
   * @param {string} scriptHash Script hash: Sha256 hash of the binary bytes of the locking script (ScriptPubKey), expressed as a hexadecimal string.
   */
  utxosByScriptHash ( scriptHash ) {
    return this._get( `script/${scriptHash}/unspent` )
  }

  /**
* Bulk Script Unspent Transactions
* This endpoint retrieves a list of UTXOs for multiple addresses in a single request.
* Max 20 addresses per request.
* https://docs.taal.com/core-products/whatsonchain/address#bulk-unspent-transactions
* @param {Array<string>} addressArray 
*/
  bulkUtxosByScriptHash ( scriptHashArray ) {
    return this._post( `scripts/unspent`, {
      scripts: scriptHashArray
    } )
  }

  /**
   * Get exchange rate
   * This endpoint provides exchange rate for BSV.
   * https://docs.taal.com/core-products/whatsonchain/exchange-rate#get-exchange-rate
   */
  exchangeRate () {
    return this._get( `exchangerate` )
  }

  /**
   * Get Historical Exchange Rate
   * This endpoint provides the historical exchange rate data for BSV. Exchange rate data goes back to 2018/11/19.
   * https://docs.taal.com/core-products/whatsonchain/exchange-rate#get-historical-exchange-rate
   * 
   * @param {*} [from] unixtimestamp
   * @param {*} [to] unixtimestamp
   * 
   */
  exchangeRate ( from, to ) {
    return this._get( `exchangerate/historical`, {
      from, to
    } )
  }

  /**
 * Get OP_RETURN Data by Tx Hash
 * This endpoint returns OP_RETURN data as hex for each output in the transaction.
 * https://docs.taal.com/core-products/whatsonchain/on-chain-data#get-op_return-data-by-tx-hash
 * 
 * @param {*} [hash] The desired TX hash.
 * 
 */
  GetOPReturnByTxHash ( hash ) {
    return this._get( `tx/${hash}/opreturn` )
  }

  /**
   * Get explorer links
   * This endpoint identifies whether the posted query text is a block hash, txid or address and responds with WoC links. Ideal for extending customized search in apps.
   * https://developers.whatsonchain.com/#search
   * @param {string} query 
   */
  search ( query ) {
    return this._post( `search/links`, {
      query
    } )
  }

  /**
* Get Block Stats by Height
* This endpoint retrieves the block stats for a given height. 
* Exchange rate information is not available for blocks processed before 2018/11/19.
* Unidentified block miners are tagged as an empty string.
* https://docs.taal.com/core-products/whatsonchain/stats#get-block-stats-by-height
* 
* @param {*} [height] The height of the block to retrieve.
* 
*/
  blockHeightStats ( height ) {
    return this._get( `block/height/${height}/stats` )
  }

  /**
* Get Block Stats by Hash
* This endpoint retrieves the block stats for a given hash.  
* Exchange rate information is not available for blocks processed before 2018/11/19.
* Unidentified block miners are tagged as an empty string.
* https://docs.taal.com/core-products/whatsonchain/stats#get-block-stats-by-hash
* 
* @param {*} [hash] The hash of the block to retrieve.
* 
*/
  blockHashStats ( hash ) {
    return this._get( `block/hash/${hash}/stats` )
  }

  /**
* Get Miner Block Stats
* This endpoint retrieves the miner block stats for specified days.   
* Unidentified block miners are tagged as an empty string.
* https://docs.taal.com/core-products/whatsonchain/stats#get-miner-block-stats
* 
* @param {*} [days] The number of days to retrieve the data for. Only 1 or 30 days can be selected.
* 
*/
  minerBlocksStats ( days ) {
    return this._get( `miner/blocks/stats`, { days } )
  }


  /**
* Get Miner Summary Stats
* This endpoint retrieves the miner summary stats for specified days over a 24 hour period.  
* Unidentified block miners are tagged as an empty string.
* https://docs.taal.com/core-products/whatsonchain/stats#get-miner-summary-stats
* 
* @param {*} [days] The number of days to retrieve the data for. Only 1 or 30 days can be selected.
* 
*/
  minerSummaryStats ( days ) {
    return this._get( `miner/summary/stats`, { days } )
  }
}

module.exports = WhatsOnChain