'use strict'

// import { config } from 'vue/types/umd.js';
import router from './router.js';

// eslint-disable-next-line no-unused-vars
const app1 = new Vue({
    el: '#app',
    components: {
        'mycomponent': httpVueLoader('./components/mycomponent.vue'),
        'myheader': httpVueLoader('./components/myheader.vue'),
        'mylogin':httpVueLoader('./components/login.vue'),
        'myconfig':httpVueLoader('./components/Configurations.vue'),
        'myrouting':httpVueLoader('./Routing.vue'),
    },
    data(){
        return {
            freshlogin: undefined,
            user:{
                islogged:false,
                avatar:'',
                user_id: undefined,
                isActive: undefined,
                username: undefined,
                fullname: undefined,
                database: undefined,
                container: undefined,
                loginSuccess: this.succesfulLogin,
                performLogout: this.logoutUser,
                setUser: this.setUser,
                setToken: this.setToken,
            },
            config:{
                isConfig:false,
                database: undefined,
                container: undefined,
                setConfig: this.setConfig,
            }
        };
    }, 
    computed:{
    },
    methods: {
        succesfulLogin(){
            console.log("succesfulLogin");
            this.user.islogged = true; 
        },
        logoutUser(){ 
            var id = localStorage.getItem('token');
            this.user.islogged = false; 
            if(id!=null){ uibuilder.send( {'topic':'Logout', 'token':id, 'payload':{}}); }
        },
        setUser(param){
            console.log("setUser");
            this.user.islogged = true;
            // this.config.isConfig = true;
            this.user.user_id = param.user_id;
            this.user.username = param.username;
            this.user.avatar = param.avatar;
            this.user.isActive = param.isActive;
            // this.user.database = param.database;
            // this.user.container_id = param.container_id;
         },
         setToken(userConfig){
            console.log("setToken Username: " + userConfig.username);
            console.log("setToken Database: " + userConfig.database);
            console.log("setToken container: " + userConfig.container_id);
 
             //Gets the unique session identifier
            //  var sessionID = userConfig.password;
            var today = new Date();
            var sessionID = today.getTime();
            console.log("sessionID by getTime:::" + sessionID);
            // console.log("getVarDate:::" + today.getTime);

             //Store session identifier to local browser 
             localStorage.setItem('token',sessionID) 
 
             //Notify index.js that a session is created
             uibuilder.send({
                 'topic': 'Login',
                 'token': sessionID,
                 'payload': {
                    'user':{
                       'user_id': userConfig.user_id,
                       'isActive': userConfig.isActive,
                       'username': userConfig.username,
                       'fullname': userConfig.fullname,
                       'avatar': userConfig.avatar
                    },
                    'session':{
                       'uniqueid': sessionID,
                       'user_id': userConfig.user_id,
                       'username': userConfig.username,
                       'fullname': userConfig.fullname,
                       'startTime': sessionID,
                    //    'database': userConfig.database,
                    //    'container_id': userConfig.container_id,
                    },
                    'config':{
                        'database': userConfig.database,
                        'container_id': userConfig.container_id,
                        'container_name': userConfig.container_name,
                     }

                 }
              });
         },
         setConfig(param){
            console.log("setConfig: " + param.database);
            this.config.isConfig = true;
            this.config.database = param.database;
            this.config.container_id = param.container_id;
            this.config.container_name = param.container_name;
            console.log("isConfig: " + this.config.isConfig);
         }
    }, 
    mounted: function(){
        //navigates to home page at mount
        this.$router.push('/home');
        
        uibuilder.start()
        var vueApp = this
        uibuilder.onChange('msg', function(newVal) {
            switch(msg.topic)
            {
                case 'Startup':             
                    console.log("Startup msg.session:::: " + msg.session);
                    // const token = localStorage.getItem('token');
                    const token = msg.token;
                    const d = new Date();
                    let today = d.getTime();
                    let timeout = today - today;
                    console.log("Startup today:::: " + today);
                    console.log("Startup msg.token:::: " + msg.token);
                    console.log("Startup timeout:::: " + timeout);
                    // console.log("Startup getItem:::: " + token);
                    
                    if(msg.session == undefined || timeout > 60000)
                    { 
                        localStorage.removeItem('token');
                        vueApp.user.islogged = false;
                        vueApp.config.isConfig = false;
                    }
                    else
                    { 
                        

                        // console.log("Startup database:::: " + msg.payload.database);
                        // console.log("Startup container_id:::: " + msg.payload.container_id);
                        console.log("Startup uniqueid:::: " + msg.session.uniqueid);
                        console.log("Startup start_Time:::: " + msg.session.start_Time);
                        vueApp.user.user_id = msg.payload.user_id;
                        vueApp.user.isActive = msg.payload.isActive;
                        vueApp.user.username = msg.payload.username;
                        vueApp.user.fullname = msg.payload.fullname;
                        vueApp.user.avatar = msg.payload.avatar;
                        vueApp.user.islogged = true;
                        vueApp.config.isConfig = true;
                        vueApp.config.database = msg.payload.database;
                        vueApp.config.container_id = msg.payload.container_id;
                        vueApp.config.container_name = msg.payload.container_name;
                    }
                    break;

                case 'Login':
                    console.log("Login Database:::: " + msg.payload.config.database);
                    console.log("Login container_id:::: " + msg.payload.config.container_id);
                    vueApp.user.user_id = msg.payload.user.user_id
                    vueApp.user.isActive = msg.payload.user.isActive
                    vueApp.user.username = msg.payload.user.username
                    vueApp.user.fullname = msg.payload.user.fullname
                    vueApp.user.avatar = msg.payload.user.avatar
                    vueApp.user.islogged = true;
                    vueApp.freshlogin = true;
                    vueApp.config.isConfig = true;
                    vueApp.config.database = msg.payload.config.database;
                    vueApp.config.container_id = msg.payload.config.container_id;
                    vueApp.config.container_name = msg.payload.config.container_name;
                    break;

                case 'Logout':
                    console.log("Logout :::: ");
                    vueApp.user.islogged = false;
                    vueApp.freshlogin = false;
                    localStorage.removeItem('token');
                    vueApp.config.isConfig = false;
                    break;    
            }
        });
    },
    router: new VueRouter(router),
})
