const Logic = artifacts.require("Logic");
const fs = require('fs');
const tokenAddress = fs.readFileSync('../tokenAddress', 'utf8').replace(/\n|\r/g, "")

module.exports = function(deployer) {
    deployer.deploy(Logic, tokenAddress)
    .then(() => {
        if (Logic._json) {
            fs.writeFile('LogicABI', JSON.stringify(Logic._json.abi),
                (err) => {
                    if (err) throw err;
                    console.log("파일에 ABI 입력 성공");
                }
            )
            fs.writeFile('LogicAddress', Logic.address,
                (err) => {
                    if (err) throw err;
                    console.log("파일에 주소 입력 성공");
                }
            )
        }
    });
};
