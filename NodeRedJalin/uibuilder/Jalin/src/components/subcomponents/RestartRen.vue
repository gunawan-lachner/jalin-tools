<template>
    <!-- <b-container fluid> -->
    <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;">
        <b-col cols="10" class="my-1">
            <b-card bg-variant="light">
                <b-form-group label-cols-lg="2" 
                            label="Restart REN" 
                            label-size="lg" 
                            label-class="font-weight-bold pt-0" 
                            class="mb-0">
                    <b-form-group label="Server:" 
                                label-cols-sm="2"
                                label-align-sm="right"
                                class="mb-0">
                        <b-form-select v-model="selectedEnvironment" 
                                    size="md"  
                                    label-align-sm="left"
                                    :options="environments"
                                    v-on:change="onChange()">
                        </b-form-select>
                    </b-form-group>
                    <b-form-group label="Aksi:" 
                                label-cols-sm="2"
                                label-align-sm="right"
                                class="mb-0">
                        <b-button variant="info" style="float:left;"  @click="commandRen('status')">Status</b-button>
                        <b-button variant="info" style="float:left;" @click="commandRen('restart')">Restart</b-button>
                        <b-button variant="info" style="float:left;" @click="commandRen('stop')">Stop</b-button>
                        <b-button variant="info" style="float:left;" @click="commandRen('start')">Start</b-button>
                    </b-form-group>
                    <b-form-group label="Log:" 
                                label-cols-lg="2" label-align-sm="right">
                        <b-form-textarea v-model="output"
                                        rows="3"
                                        disabled>
                        </b-form-textarea>
                    </b-form-group>
                      <b-alert v-show="displayError" variant="danger" show class="error-Msg">
                            {{errormessage}}
                         </b-alert>
                </b-form-group>
            </b-card>
        </b-col>
    </b-row>
    <!-- </b-container> -->
</template>
<style scoped>

</style>
<script>
module.exports = {
    props:['configs'],
    data() {
        return {
            selectedEnvironment:'Lokal',
            environments:[
                'Lokal',
                'SIT',
                'UAT'
            ],
            commandUrl:'/ecp/command',
            output: '',
            errormessage: ''
        };
    },
    computed:{
        displayError(){
            if(this.errormessage!=''){ return true; }
            else { return false; }
        },
     },
    mounted(){
        this.onChange();
    },
    methods: {
        onChange(){
            console.log("selectedEnvironment: " + this.selectedEnvironment);
            if(this.selectedEnvironment=='Lokal') this.commandUrl = '/ecp/command';
            if(this.selectedEnvironment=='SIT') this.commandUrl = '/ecp/commandSit';
            if(this.selectedEnvironment=='UAT') this.commandUrl = '/ecp/commandUat';
        },
        commandRen(parameter){
            // onChange();
            console.log("command: " + this.commandUrl);
            console.log("parameter: " + parameter);
            axios.post(this.commandUrl,{ parameter: parameter})
            .then((resp) => { 
                this.output = resp.data;
                console.log("output Vue: " + this.output);
            })
            .catch(errors => { console.error(errors); });
            console.log("output: " + this.output);
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
