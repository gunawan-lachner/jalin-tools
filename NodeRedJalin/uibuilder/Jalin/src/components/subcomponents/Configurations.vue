<template>
    <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;">
        <b-col cols="8">
            <b-card bg-variant="light">
                <b-form-group label-cols-lg="3" 
                              label="Konfigurasi" 
                              label-size="lg" 
                              label-class="font-weight-bold pt-0" 
                              class="mb-0">
                    <b-form-group label="Database:" 
                                  label-cols-sm="3"
                                  label-align-sm="right"
                                  class="mb-0">
                        <b-form-select v-model="selectedDatabase" 
                                       size="md"  
                                       :options="database">
                        </b-form-select>
                    </b-form-group>
                    <b-form-group label="Container:" 
                                  label-cols-sm="3"
                                  label-align-sm="right"
                                  class="mb-0">
                        <b-form-select v-model="selectedContainer" 
                                       size="md"  
                                       :options="containers"
                                       class="mb-3"
                                       value-field="id"
                                       text-field="name"
                            >
                        </b-form-select>
                    </b-form-group>
                      <!-- <b-button variant="info" style="float:right;" @click="setConfig">OK</b-button> -->
                      <input type="submit" class="btn btn-info eon-btn" @click="setConfig()">
                      <b-alert v-show="displayError" variant="danger" show class="error-Msg">
                            {{errormessage}}
                         </b-alert>
                </b-form-group>
            </b-card>
        </b-col>
        <!--b-navbar-nav class="ml-auto" v-show="configs.isConfig">
           <b-nav-item-dropdown right>
            <template #button-content>
                <em>
                  <b-avatar size="1.8rem"></b-avatar>&nbsp;{{configs.database}}
               </em>
             </template>
             <b-dropdown-item href="#" to="/configurations">Configurations</b-dropdown-item>
             <b-dropdown-item href="#" disabled>&nbsp;&nbsp;&nbsp;Database: &nbsp;{{configs}}</b-dropdown-item>
           </b-nav-item-dropdown>
         </b-navbar-nav-->
    </b-row>
</template>
<style scoped>

</style>
<script>
module.exports = {
    // props:['keys','configs'],
    props: {keys: Object, configs: Object},
    data: function () {
        return {
            selectedDatabase: this.configs.database,
            database:[
                'Lokal',
                'SIT',
                'UAT'
            ],
            selectedContainer: this.configs.container_id,
            containers: [''],
            configurations: { database:'', container:''},
            errormessage: '',
            picker: '/ecp/picker'
        };
    },
    computed:{
        dbSelected(){
            console.log('Configurations: ' + this.configs.database);
            return this.configs.database;
        },
        displayError(){
            if(this.errormessage!=''){ return true; }
            else { return false; }
        }
     },
    mounted(){
        console.log("Mounted::::::::::::::: " + this.configs.container_id);
        // this.selectedContainer = configs.container_id;
        this.getContainers();
    },
    methods: {
        getContainers(){
            axios.post(this.picker,{ jenis: 'Containers', parameter: '' })
            .then((resp) => { 
                this.containers = resp.data;
            })
            .catch(errors => { console.error(errors); });;
        },
        setConfig(){
            this.errormessage = '';
            this.configurations.database = this.selectedDatabase;
            this.configurations.container = this.selectedContainer;
            console.log("database: " + this.configurations.database);
            console.log("container: " + this.configurations.container);
            if(this.configurations.container != ''){
                this.configs.setConfig(this.configurations);
            }else{
                this.errormessage = 'Container harus diisi';
            }
        },
        //Shows a dialog notification
        showNotification() {
            var self = this;  //Assign this to a variable   
            this.boxTwo = ''
            this.$bvModal.msgBoxOk('Data was submitted successfully', {
            title: 'Confirmation',
            size: 'sm',
            buttonSize: 'sm',
            okVariant: 'success',
            headerClass: 'p-2 border-bottom-0',
            footerClass: 'p-2 border-top-0',
            centered: true
          })
          .then(value => { 
                self.cleanForm(); //clears form upon confirmation of user 
           })
          .catch(err => { })
      }
    }, 
}
</script>
