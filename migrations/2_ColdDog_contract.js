const ColdDogToken = artifacts.require("ColdDogToken");
const fs = require('fs');

module.exports = function(deployer) {
    deployer.deploy(ColdDogToken)
    .then(() => {
        if (HotDogToken._json) {
            fs.writeFile('ColdDogTokenABI', JSON.stringify(ColdDogToken._json.abi),
                (err) => {
                    if (err) throw err;
                    console.log("파일에 ABI 입력 성공");
                }
            )
            fs.writeFile('ColdDogTokenAddress', ColdDogToken.address,
                (err) => {
                    if (err) throw err;
                    console.log("파일에 주소 입력 성공");
                }
            )
        }
    })
};
