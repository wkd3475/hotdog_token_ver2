import Caver from "caver-js";
import {Spinner} from "spin.js";

const config = {
    rpcURL: 'https://api.baobab.klaytn.net:8651'
}
const UNIT = 10**18;
const cav = new Caver(config.rpcURL);
const tokenContract = new cav.klay.Contract(TOKEN_ABI, TOKEN_ADDRESS);
const logicContract = new cav.klay.Contract(LOGIC_ABI, LOGIC_ADDRESS);
const proxyContract = new cav.klay.Contract(PROXY_ABI, PROXY_ADDRESS);
const clientContract = new cav.klay.Contract(CLIENT_ABI, CLIENT_ADDRESS);

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
        
        $("#connected-token-address").text(await logicContract.methods.getTokenAddress().call());
        $("#connected-logic-address").text(await proxyContract.methods.getLogicAddress().call());
        $("#connected-proxy-address").text(await clientContract.methods.getProxyAddress().call());
        $('#token-total').text('total supply : ' + await tokenContract.methods.totalSupply().call()/UNIT);
        $('#token-address').text('contract address : ' + TOKEN_ADDRESS);
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
        $('#balance').append('<p>' + 'HotDog Token : ' + await tokenContract.methods.balanceOf(walletInstance.address).call()/UNIT + '</p>');
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

    setToken: async function () {
        let spinner = this.showSpinner();
        let _address = $('#input-token-address').val().toString();
        const walletInstance = this.getWallet();
        await logicContract.methods.setTokenAddress(_address).send({
            from: walletInstance.address,
            gas: 250000,
        });
        $("#connected-token-address").text(await logicContract.methods.getTokenAddress().call());
        spinner.stop();

    },

    setLogic: async function () {
        let spinner = this.showSpinner();
        let _address = $('#input-logic-address').val().toString();
        const walletInstance = this.getWallet();
        await proxyContract.methods.setTokenAddress(_address).send({
            from: walletInstance.address,
            gas: 250000,
        });
        $("#connected-logic-address").text(await proxyContract.methods.getTokenAddress().call());
        spinner.stop();
    },

    transfer: async function () {
        try {
            const walletInstance = this.getWallet();
            if (walletInstance) {
                var amount = BigInt(parseFloat($('#amount').val()) * UNIT).toString(10);
                var recipient = $('#recipient').val().toString();
                if (amount && recipient) {
                    var spinner = this.showSpinner();
                    await tokenContract.methods.transfer(recipient, amount).send({
                        from: walletInstance.address,
                        gas: 250000,
                    });
                    spinner.stop();
                    location.reload();
                } else {
                    alert("wrong input");
                }
            }
        } catch(e) {
            console.log('transfer error: ', e);
            spinner.stop();
        }

        $('#send-box').hide();
    },

    testTransfer: async function () {
        const walletInstance = this.getWallet();
        if (walletInstance) {
            var amount = BigInt(parseFloat($('#test-amount').val()) * UNIT).toString(10);
            var recipient = $('#test-recipient').val().toString();
            if (amount && recipient) {
                var spinner = this.showSpinner();
                var result = await logicContract.methods.Send(walletInstance.address, recipient, amount).send({
                    from: walletInstance.address,
                    gas: 2500000,
                });
                alert(JSON.stringify(result));
                spinner.stop();
                //location.reload();
            } else {
                alert("wrong input");
            }
        }
        $('#test-send-box').hide();
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