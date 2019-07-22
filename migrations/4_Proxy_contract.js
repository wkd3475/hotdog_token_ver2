const Proxy = artifacts.require("Proxy");
const fs = require('fs');
const logicAddress = fs.readFileSync('../logicAddress', 'utf8').replace(/\n|\r/g, "")

module.exports = function(deployer) {
    deployer.deploy(Proxy, logicAddress)
    .then(() => {
        if (Proxy._json) {
            fs.writeFile('proxyABI', JSON.stringify(Proxy._json.abi),
                (err) => {
                    if (err) throw err;
                    console.log("파일에 ABI 입력 성공");
                }
            )
            fs.writeFile('proxyAddress', Proxy.address,
                (err) => {
                    if (err) throw err;
                    console.log("파일에 주소 입력 성공");
                }
            )
        }
    });
};