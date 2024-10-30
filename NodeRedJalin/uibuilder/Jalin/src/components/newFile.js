/* __placeholder__ */
module.exports = {
props: ['keys', 'configs'],
data() {
return {
postBody: { username: '', password: '' },
errors: [],
errormessage: ''
};
},
computed: {
displayError() {
if (this.errormessage != '') { return true; }
else { return false; }
}
},
methods: {
login() {
var self = this;
var password = MD5(this.postBody.password).toString();
this.errormessage = '';
if (this.postBody.username != '' && this.postBody.password != '') {
axios.post('/ecp/login', { username: this.postBody.username, password: password })
.then(res => {
if (res.data.length > 0) {
if (res.data[0].user_id != '') {
this.postBody.username = '';
this.postBody.password = '';
this.keys.setToken(res.data[0]);
// console.log("token: " + this.keys.setToken);
// console.log("resData: " + res.data[0]);
this.keys.loginSuccess();
this.keys.user.setUser(res.data[0]);
this.configs.setConfig(res.data[0]);
} else { this.errormessage = 'Incorrect Usercode or Password.'; }
} { this.errormessage = 'Incorrect Password.'; }
}).catch(e => { });
}
}
}
};
