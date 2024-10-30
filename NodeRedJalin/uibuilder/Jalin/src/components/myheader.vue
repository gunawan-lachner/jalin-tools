<template :database="{{configs.database}}">
    <b-navbar toggleable="lg" type="dark" variant="info">
       <b-navbar-brand href="#">Jalin Pembayaran Nunsantara</b-navbar-brand>
   
       <b-navbar-toggle target="nav-collapse" v-show="keys.islogged"></b-navbar-toggle>
   
       <b-collapse id="nav-collapse" is-nav>
         <b-navbar-nav v-show="keys.islogged">
           <b-nav-item href="#" to="/home">Home</b-nav-item>
           <!--b-nav-item href="#" to="/form">Form</b-nav-item>
           <b-nav-item href="#" to="/table">Table</b-nav-item-->
           <b-nav-item-dropdown>
            <template #button-content>
                <em>
                  Transaction
               </em>
             </template>
             <b-dropdown-item href="#" to="/transaction">Transaksi</b-dropdown-item>
             <b-dropdown-item href="#" to="/transactionattr">Transaksi Atribut</b-dropdown-item>
           </b-nav-item-dropdown>
           <!-- <b-nav-item href="#" to="/chart">Chart</b-nav-item> -->
           <!-- <b-nav-item href="#" to="/iot">MQTT</b-nav-item> -->
           <!-- <b-nav-item-dropdown>
            <template #button-content>
                <em>
                  Chart
               </em>
             </template>
             <b-dropdown-item href="#" to="/transactionChart">Transaksi Chart</b-dropdown-item>
           </b-nav-item-dropdown> -->
           <b-nav-item-dropdown>
            <template #button-content>
                <em>
                  Config
               </em>
             </template>
             <b-dropdown-item href="#" to="/keytype">Key Type</b-dropdown-item>
             <b-dropdown-item href="#" to="/msgclass">Msg Class</b-dropdown-item>
             <b-dropdown-item href="#" to="/msgtype">Msg Type</b-dropdown-item>
             <b-dropdown-item href="#" to="/nodetype">Node Type</b-dropdown-item>
             <b-dropdown-item href="#" to="/panentry">PAN Entry</b-dropdown-item>
             <b-dropdown-item href="#" to="/pinentry">PIN Entry</b-dropdown-item>
             <b-dropdown-item href="#" to="/pluginstatus">Plugin Status</b-dropdown-item>
             <b-dropdown-item href="#" to="/statetype">State Type</b-dropdown-item>
             <b-dropdown-item href="#" to="/conversion">Conversion</b-dropdown-item>
             <b-dropdown-item href="#" to="/configurations">Configurations</b-dropdown-item>
           </b-nav-item-dropdown>
           <b-nav-item-dropdown>
            <template #button-content>
                <em>
                  Routing
               </em>
             </template>
             <b-dropdown-item href="#" to="/routing">Routing Prioritas</b-dropdown-item>
             <b-dropdown-item href="#" to="/onlineconfig">Online Config</b-dropdown-item>
             <b-dropdown-item href="#" to="/bingateway">Bin Gateway</b-dropdown-item>
           </b-nav-item-dropdown>
           <b-nav-item-dropdown>
            <template #button-content>
                <em>
                  Participant
               </em>
             </template>
            <b-dropdown-item href="#" to="/participant">Participant</b-dropdown-item>
            <b-dropdown-item href="#" to="/binparticipant">Bin Participant</b-dropdown-item>
           </b-nav-item-dropdown>
           <b-nav-item-dropdown>
            <template #button-content>
                <em>
                  Container
               </em>
             </template>
             <b-dropdown-item href="#" to="/containerPlugin">Container Plugin</b-dropdown-item>
             <b-dropdown-item href="#" to="/containerPluginAtt">Container Plugin Atribut</b-dropdown-item>
             <b-dropdown-item href="#" to="/containerPluginInstance">Container Plugin Instance</b-dropdown-item>
           </b-nav-item-dropdown>
           <b-nav-item-dropdown>
            <template #button-content>
                <em>
                  Command
               </em>
             </template>
             <b-dropdown-item href="#" to="/restartRen">Restart REN</b-dropdown-item>
           </b-nav-item-dropdown>           
         </b-navbar-nav>
         <b-navbar-nav class="ml-auto" v-show="keys.islogged">
           <b-nav-item-dropdown right v-show="keys.islogged">
            <template #button-content>
                <em>
                  <b-avatar :src="keys.avatar" size="1.8rem"></b-avatar>&nbsp;{{keys.fullname}}
               </em>
             </template>
             <b-dropdown-item href="#" to="/configurations">Configurations</b-dropdown-item>
             <b-dropdown-item href="#" disabled>&nbsp;&nbsp;&nbsp;Database: &nbsp;{{configs.database}}</b-dropdown-item>
             <b-dropdown-item href="#" disabled>&nbsp;&nbsp;&nbsp;Container: &nbsp;{{configs.container_name}}</b-dropdown-item>
             <b-dropdown-item href="#" @click="keys.performLogout()">Sign Out</b-dropdown-item>
           </b-nav-item-dropdown>
         </b-navbar-nav>
       </b-collapse>
     </b-navbar>
   </template>
   <style scoped>
   
   </style>
   <script>
   module.exports = {
    props:['keys','configs'],
    props: {
      keys: {
        type: Object,
        default: 'Default String',
      },
      configs: {
        type: Object,
        default: 'Default String',
      }
    },
    data(){
      return{
        confi: [this.configs],
        conf: {database: '', container_id: ''},
        key: {username:'', password:''}
      }
      
    },
    mounted(){
      console.log("mounted myheader::: " + this.keys.fullname);
      // this.config = configs;
      // console.log("configs::: " + confi);
      // console.log("mounted::: " + this.config.database);
      this.setConfig();
    },
    methods: {
      setConfig(){
        // console.log('setConfig in myheader: ');
        this.conf = this.configs;
        this.key = this.keys;
        // console.log('key in myheader: '+ this.keys.fullname);
        // console.log('configs in myheader: '+ this.configs);
        // console.log('database in myheader: '+ this.configs.isConfig);
      }
    },
   }
   </script>
   