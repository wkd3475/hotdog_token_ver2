const Client = artifacts.require("Client");
const fs = require('fs');
const proxyAddress = fs.readFileSync('../proxyAddress', 'utf8').replace(/\n|\r/g, "");

module.exports = function(deployer) {
    deployer.deploy(Client, proxyAddress)
    .then(() => {
        if (Client._json) {
            fs.writeFile('clientABI', JSON.stringify(Client._json.abi),
                (err) => {
                    if (err) throw err;
                    console.log("파일에 ABI 입력 성공");
                }
            )
            fs.writeFile('clientAddress', Client.address,
                (err) => {
                    if (err) throw err;
                    console.log("파일에 주소 입력 성공");
                }
            )
        }
    });
};
