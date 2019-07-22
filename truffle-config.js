const PrivateKeyConnector = require('connect-privkey-to-provider');
const NETWORK_ID = '1001'
const GASLIMIT = '20000000'
const URL = 'https://api.baobab.klaytn.net:8651'
const PRIVATE_KEY = '0xa9aa9e7ae9acf32bd5598a524a4f7a15249348ee929c83e7d584baf9a7825393'

module.exports = {
  networks: {
    klaytn: {
      provider: new PrivateKeyConnector(PRIVATE_KEY, URL),
      network_id: NETWORK_ID,
      gas: GASLIMIT,
      gasPrice: null,
    }
  }
}
