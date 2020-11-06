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

    if ( this._apiKey ) {
      headers[ 'woc-api-key' ] = this._apiKey
      throttleOpt[ 'threshold' ] = 0
    } else {
      //Up to 3 requests/sec.
      // https://developers.whatsonchain.com/#rate-limits
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
   * https://developers.whatsonchain.com/#get-api-status
   */
  status () {
    return this._get( 'woc' ).then( result => result === 'Whats On Chain' )
  }


  /**
   * Get blockhain info
   * This endpoint retrieves various state info of the chain for the selected network.
   * https://developers.whatsonchain.com/#chain-info
   */
  chainInfo () {
    return this._get( 'chain/info' )
  }


  /**
   * Get Circulating Supply
   * This endpoint provides circulating supply of BSV.
   * https://developers.whatsonchain.com/#get-circulating-supply
   */
  circulatingsupply () {
    return this._get( 'circulatingsupply' )
  }



  /**
   * Get by hash
   * This endpoint retrieves block details with given hash.
   * https://developers.whatsonchain.com/#get-by-hash
   * @param {string} hash The hash of the block to retrieve
   */
  blockHash ( hash ) {
    return this._get( `block/hash/${hash}` )
  }

  /**
   * Get by height
   * This endpoint retrieves block details with given block height.
   * https://developers.whatsonchain.com/#get-by-height
   * @param {number} height The height of the block to retrieve
   */
  blockHeight ( height ) {
    return this._get( `block/height/${height}` )
  }


  /**
   * Get block pages
   * If the block has more that 1000 transactions the page URIs will be provided in the pages element when getting a block by hash or height.
   * https://developers.whatsonchain.com/#get-block-pages
   * @param {string} hash The hash of the block to retrieve
   * @param {number} page Page number
   */
  blockHashByPage ( hash, page ) {
    return this._get( `block/hash/${hash}/page/${page}` )
  }

  /**
   * Get header by hash
   * This endpoint retrieves block header details with given hash.
   * https://developers.whatsonchain.com/#get-header-by-hash
   * @param {string} hash The hash of the block to retrieve
   */
  blockHeaderByHash ( hash ) {
    return this._get( `block/${hash}/header` )
  }

  /**
   * Get headers
   * This endpoint retrieves last 10 block headers.
   */
  blockHeaders () {
    return this._get( 'block/headers' )
  }


  /**
   * Get by tx hash
   * This endpoint retrieves transaction details with given transaction hash.
   * In the response body, if any output hex size, exceeds 100KB then data is truncated
   * NOTICE:A separate endpoint get raw transaction output data can be used to fetch full hex data
   * https://developers.whatsonchain.com/#get-by-tx-hash
   * @param {string} hash The hash/txId of the transaction to retrieve
   */
  txHash ( hash ) {
    return this._get( `tx/hash/${hash}` )
  }

  /**
   * Broadcast transaction
   * Broadcast transaction using this endpoint. Get txid in response or error msg from node with header content-type: text/plain.
   * https://developers.whatsonchain.com/#broadcast-transaction
   * @param {string} txhex Raw transaction data in hex
   */
  broadcast ( txhex ) {
    return this._post( 'tx/raw', {
      txhex
    } )
  }

  /**
   * Bulk Broadcast
   * https://developers.whatsonchain.com/#bulk-broadcast
   * - Size per transaction should be less than 100KB
   * - Overall payload per request should be less than 10MB
   * - Max 100 transactions per request
   * - Only available for mainnet
   * https://developers.whatsonchain.com/#bulk-broadcast
   * @param {Array} txhexArray 
   * @param {boolean} feedback 
   */
  bulkBroadcast ( txhexArray, feedback = false ) {
    return this._post( `tx/broadcast?feedback=${feedback}`, txhexArray )
  }


  /**
   * Bulk transaction details
   * Fetch details for multiple transactions in single request
   * - Max 20 transactions per request
   * https://developers.whatsonchain.com/#bulk-transaction-details
   * @param {Array} txidArray 
   */
  bulkTxDetails ( txidArray ) {
    return this._post( `txs`, {
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
   * Download receipt
   * Download transaction receipt (PDF)
   * https://developers.whatsonchain.com/#download-receipt
   * @param {string} hash The hash/txId of the transaction
   */
  receiptPDF ( hash ) {
    return this._get( `https://${this._network}.whatsonchain.com/receipt/${hash}` )
  }

  /**
   * Get raw transaction data
   * Get raw transaction data in hex
   * https://developers.whatsonchain.com/#get-raw-transaction-data
   * @param {string} hash The hash/txId of the transaction
   */
  getRawTxData ( hash ) {
    return this._get( `tx/${hash}/hex` )
  }


  /**
   * Get raw transaction output data
   * Get raw transaction vout data in hex
   * https://developers.whatsonchain.com/#get-raw-transaction-output-data
   * @param {string} hash The hash/txId of the transaction
   * @param {number} outputIndex Output index
   */
  getRawTxOutputData ( hash, outputIndex ) {
    return this._get( `tx/${hash}/out/${outputIndex}/hex` )
  }


  /**
   * Get merkle proof
   * This endpoint returns merkle branch to a confirmed transaction
   * https://developers.whatsonchain.com/#get-merkle-proof
   * @param {string} hash The hash/txId of the transaction
   */
  merkleProof ( hash ) {
    return this._get( `tx/${hash}/proof` )
  }


  /**
   * Get mempool info
   * This endpoint retrieves various info about the node's mempool for the selected network.
   * https://developers.whatsonchain.com/#get-mempool-info
   */
  mempoolInfo () {
    return this._get( `mempool/info` )
  }


  /**
   * Get mempool transactions
   * This endpoint retrieve list of transaction ids from the node's mempool for the selected network.
   * https://developers.whatsonchain.com/#get-mempool-transactions
   * 
   */
  mempoolTxs () {
    return this._get( `mempool/raw` )
  }


  /**
   * Get address info
   * This endpoint retrieves various address info.
   * @param {string} address 
   */
  addressInfo ( address ) {
    return this._get( `address/${address}/info` )
  }

  /**
   * Get balance
   * This endpoint retrieves confirmed and unconfirmed address balance.
   * @param {string} address 
   */
  balance ( address ) {
    return this._get( `address/${address}/balance` )
  }

  /**
   * Get history
   * This endpoint retrieves confirmed and unconfirmed address transactions.
   * https://developers.whatsonchain.com/#get-history
   * @param {string} address 
   */
  history ( address ) {
    return this._get( `address/${address}/history` )
  }

  /**
   * Get unspent transactions
   * This endpoint retrieves ordered list of UTXOs.
   * https://developers.whatsonchain.com/#get-unspent-transactions
   * @param {string} address 
   */
  utxos ( address ) {
    return this._get( `address/${address}/unspent` )
  }


  /**
   * Download statement
   * Download address statement (PDF)
   * https://developers.whatsonchain.com/#download-statement
   * @param {string} address 
   */
  statementPDF ( address ) {
    return this._get( `https://${this._network}.whatsonchain.com/statement/${address}` )
  }



  /**
   * Get script history
   * This endpoint retrieves confirmed and unconfirmed script transactions.
   * https://developers.whatsonchain.com/#script
   * @param {string} scriptHash Script hash: Sha256 hash of the binary bytes of the locking script (ScriptPubKey), expressed as a hexadecimal string.
   */
  historyByScriptHash ( scriptHash ) {
    return this._get( `script/${scriptHash}/history` )
  }

  /**
   * Get script unspent transactions
   * This endpoint retrieves ordered list of UTXOs.
   * https://developers.whatsonchain.com/#get-script-unspent-transactions
   * @param {string} scriptHash Script hash: Sha256 hash of the binary bytes of the locking script (ScriptPubKey), expressed as a hexadecimal string.
   */
  utxosByScriptHash ( scriptHash ) {
    return this._get( `script/${scriptHash}/unspent` )
  }

  /**
   * Get exchange rate
   * This endpoint provides exchange rate for BSV.
   * https://developers.whatsonchain.com/#exchange-rate
   */
  exchangeRate () {
    return this._get( `exchangerate` )
  }


  /**
   * Fee quotes
   * This endpoint provides fee quotes from multiple transaction processors. Each quote also contains transaction processor specific txSubmissionUrl and txStatusUrl. These unique URLs can be used to submit transactions to the selected transaction processor and check the status of the submitted transaction.
   * https://developers.whatsonchain.com/#merchant-api-beta
   */
  feeQuotes () {
    return this._get( `https://api.whatsonchain.com/v1/bsv/main/mapi/feeQuotes` )
  }

  /**
   * Submit transaction
   * Submit a transaction to a specific transaction processor using the txSubmissionUrl provided with each quote in the Fee quotes response.
   * https://developers.whatsonchain.com/#submit-transaction
   * @param {string} providerId Unique providerId from the Fee quotes response
   * @param {string} rawtx Raw transaction data in hex
   */
  submitTx ( providerId, rawtx ) {
    return this._post( `mapi/${providerId}/tx`, {
      rawtx
    } )
  }


  /**
   * Transaction status
   * Get a transaction's status from a specific transaction processor using the txStatusUrl provided with each quote in Fee quotes response.
   * @param {string} providerId Unique providerId from the Fee quotes response
   * @param {string} hash The hash/txId of the transaction
   */
  txStatus ( providerId, hash ) {
    return this._get( `mapi/${providerId}/tx/${hash}` )
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
}

module.exports = WhatsOnChain