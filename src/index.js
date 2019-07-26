import Caver from "caver-js";
import {Spinner} from "spin.js";

const config = {
    rpcURL: 'https://api.baobab.klaytn.net:8651'
}
const UNIT = 10**18;
const cav = new Caver(config.rpcURL);
const tokenContract = new cav.klay.Contract(TOKEN_ABI, TOKEN_ADDRESS);
const logicContract = new cav.klay.Contract(LOGIC_ABI, LOGIC_ADDRESS);
const proxyStorageContract = new cav.klay.Contract(PROXY_STORAGE_ABI, PROXY_STORAGE_ADDRESS);
const proxyContract = new cav.klay.Contract(PROXY_ABI, PROXY_ADDRESS);

const App = {
    auth: {
        accessType: 'keystore',
        keystore: '',
        password: ''
    },

    start: async function () {
        const walletFromSession = sessionStorage.getItem('walletInstance');
        if (walletFromSession) {
            try {
                cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
                this.changeUI(JSON.parse(walletFromSession));
            } catch (e) {
                sessionStorage.removeItem('walletInstance');
            }
        }
        
        $('#token-total').text('total supply : ' + await this.totalSupply()/UNIT);
        $('#token-address').text('contract address : ' + TOKEN_ADDRESS);
        $('#account1-klay').text(await this.getKlayBalance("0x60fe885a3e79f27e9c5b40c0cda179b627cd9466") + " peb");
        $('#account2-klay').text(await this.getKlayBalance("0xf402f8d845e659b53858c9b0394a3224089aec26") + " peb");
        $('#account3-klay').text(await this.getKlayBalance("0xfa50c5c818d98af46af11b1f6518d70377fc6d27") + " peb");
    },

    getKlayBalance: function (walletAddress) {
        let balance = cav.klay.getBalance(walletAddress);
        return balance;
    },

    handleImport: async function () {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0]);
        fileReader.onload = (event) => {
            try {
                if (!this.checkValidKeystore(event.target.result)) {
                    $('#message').text('유효하지 않은 keystore 파일입니다.');
                    return;
                }
                this.auth.keystore = event.target.result;
                $('#message').text('keystore 통과. 비밀번호를 입력하세요.');
                document.querySelector('#input-password').focus();
            } catch (event) {
                $('#message').text('유효하지 않은 keystore 파일입니다.');
                return;
            }
        }
    },

    checkValidKeystore: function (keystore) {
        const parsedKeystore = JSON.parse(keystore);
        const isValidKeystore = parsedKeystore.version &&
            parsedKeystore.id &&
            parsedKeystore.address &&
            parsedKeystore.crypto;

        return isValidKeystore;
    },

    handlePassword: async function () {
        this.auth.password = event.target.value;
    },

    handleLogin: async function () {
        if (this.auth.accessType === 'keystore') {
            try {
                const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
                this.integrateWallet(privateKey);
            } catch (e) {
                $('#message').text('비밀번호가 일치하지 않습니다.');
            }
        }
    },

    handleLogout: async function () {
        this.removeWallet();
        location.reload();
    },

    getWallet: function () {
        if (cav.klay.accounts.wallet.length) {
            return cav.klay.accounts.wallet[0];
        }
    },

    removeWallet: function () {
        cav.klay.accounts.wallet.clear();
        sessionStorage.removeItem('walletInstance');
        this.reset();
    },

    integrateWallet: function (privateKey) {
        const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
        cav.klay.accounts.wallet.add(walletInstance);
        sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance)); 
        this.changeUI(walletInstance);
    },

    changeUI: async function (walletInstance) {
        var spinner = this.showSpinner();
        $('#loginModal').modal('hide');
        $('#login').hide();
        $('#logout').show();
        $('#make-wallet').hide();
        $('#address').append('<br>' + '<p>' + '지갑 주소 : ' + walletInstance.address + '</p>');
        $('#balance').append('<p>' + 'HotDog Token : ' + await this.balanceOf(walletInstance)/UNIT + '</p>');
        $('klay-amount').append('<p>' + 'klay : ' + '</p>');
        $('#send-button').show();
        $('#test-send-button').show();
        spinner.stop();
    },

    showSpinner: function () {
        var target = document.getElementById("spin");
        return new Spinner(opts).spin(target);
    },

    reset: function () {
        this.auth = {
            keystore: '',
            password: ''
        };
    },

    clipboard: function (element){
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val($(element).text()).select();
        document.execCommand("copy");
        $temp.remove();
    },

    showSendBox: async function () {
        if ($('#send-box').is(':visible')) {
            $('#send-box').hide();
        } else {
            $('#send-box').show()
        }
    },

    showTestSendBox: async function () {
        if ($('#test-send-box').is(':visible')) {
            $('#test-send-box').hide();
        } else {
            $('#test-send-box').show()
        }
    },

    transfer: async function () {
        const walletInstance = this.getWallet();
        if (walletInstance) {
            let amount = BigInt(parseFloat($('#amount').val()) * UNIT).toString(10);
            let recipient = $('#recipient').val().toString();
            if (amount && recipient) {
                var spinner = this.showSpinner();
                try {
                    await this.approve(walletInstance, PROXY_ADDRESS, amount);
                    await this.feeFreeSend(walletInstance, recipient, amount);
                } catch(e) {
                    console.log('Transfer error: ', e);
                }
                spinner.stop();
                location.reload();
            } else {
                alert("wrong input");
            }
        }
        $('#send-box').hide();
    },

    testTransfer: async function () {
        const walletInstance = this.getWallet();
        if (walletInstance) {
            let amount = BigInt(parseFloat($('#test-amount').val()) * UNIT).toString(10);
            let recipient = $('#test-recipient').val().toString();
            let num = await this.getNumGod();
            
            if (amount && recipient) {
                var spinner = this.showSpinner();
                try {
                    await this.approve(walletInstance, PROXY_ADDRESS, amount);
                    await this.feeSend(walletInstance, recipient, amount, num);
                } catch(e) {
                    console.log('testTransfer error: ', e);
                }
                spinner.stop();
                location.reload();
            } else {
                alert("wrong input");
            }
        }
        $('#test-send-box').hide();
    },

    addGodAddress: async function() {
        const walletInstance = this.getWallet();
        let god = $('#god-address').val().toString();
        var spinner = this.showSpinner();
        let existGod = await this.existGod(god);

        if(!existGod) {
            await this.addGod(walletInstance, god);
            let result = await this.getGods();
            alert(JSON.stringify(result));
            location.reload();
        } else {
            alert("already exist");
        }

        spinner.stop();
        location.reload();
    },

    resetGodAddress: async function () {
        const walletInstance = this.getWallet();
        var spinner = this.showSpinner();
        await this.deleteGods(walletInstance);
        spinner.stop();
        alert("reset");
        location.reload();
    },

    getGods: async function () {
        return await proxyStorageContract.methods.getGods().call();
    },

    deleteGods: async function (walletInstance) {
        await proxyStorageContract.methods.deleteGods().send({
            from: walletInstance.address,
            gas: 250000,
        });
    },

    getNumGod: async function () {
        return await proxyStorageContract.methods.getNumGod().call();
    },

    addGod: async function (walletInstance, god) {
        await proxyStorageContract.methods.addGod(god).send({
            from: walletInstance.address,
            gas: 250000,
        });
    },

    existGod: async function (god) {
        return await proxyStorageContract.methods.existGod(god).call();
    },

    totalSupply: async function () {
        return await tokenContract.methods.totalSupply().call();
    },

    balanceOf: async function (walletInstance) {
        return await tokenContract.methods.balanceOf(walletInstance.address).call();
    },

    approve: async function (walletInstance, target, amount) {
        await tokenContract.methods.approve(target, amount).send({
            from: walletInstance.address,
            gas: 250000,
        })
        .on('receipt', function(receipt) {
            alert(JSON.stringify(receipt));
        });
    },

    feeFreeSend: async function (walletInstance, recipient, amount) {
        await cav.klay.sendTransaction({
            from: walletInstance.address,
            to: PROXY_ADDRESS,
            gas: 250000,
            data: cav.klay.abi.encodeFunctionCall({
                name: 'feeFreeSend',
                type: 'function',
                inputs: [{
                    type: 'address',
                    name: 'recipient',
                }, {
                    type: 'uint256',
                    name: 'amount'
                }]
            }, [recipient, amount])
        });
    },

    feeSend: async function (walletInstance, recipient, amount, num) {
        let klay_amount = cav.utils.toPeb("0.1", "KLAY");
        await cav.klay.sendTransaction({
            from: walletInstance.address,
            to: PROXY_ADDRESS,
            gas: 250000,
            value: klay_amount * num,
            data: cav.klay.abi.encodeFunctionCall({
                name: 'feeSend',
                type: 'function',
                inputs: [{
                    type: 'address',
                    name: 'recipient',
                }, {
                    type: 'uint256',
                    name: 'amount'
                }]
            }, [recipient, amount])
        })
        .on('receipt', function(receipt) {
            alert(JSON.stringify(receipt));
        });

        alert("complete");
    },
};

window.App = App;

window.addEventListener("load", function() {
    App.start();
});

var opts = {
    lines: 10, // The number of lines to draw
    length: 30, // The length of each line
    width: 17, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#5bc0de', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    position: 'absolute' // Element positioning
};