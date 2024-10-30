<template>
    <b-container fluid>
        <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;">
            <b-col cols="6" class="my-1">
                <b-form-group
                    label="Filter"
                    label-for="filter-input"
                    label-cols-sm="3"
                    label-align-sm="right"
                    label-size="sm"
                    class="mb-0"
                >
                    <b-input-group size="sm">
                        <b-form-input
                            id="filter-input"
                            v-model="filter"
                            type="search"
                            placeholder="Ketik untuk mencari"
                    ></b-form-input>
                            <b-input-group-append>
                                <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
                            </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col lg="6" class="my-1">
                <b-form-group
                    label="Filter On"
                    description="Leave all unchecked to filter on all data"
                    label-cols-sm="3"
                    label-align-sm="right"
                    label-size="sm"
                    class="mb-0"
                    v-slot="{ ariaDescribedby }"
                >
                    <b-form-checkbox-group
                        v-model="filterOn"
                        :aria-describedby="ariaDescribedby"
                        class="mt-1"
                    >
                        <b-form-checkbox value="name">Nama Container Plugin</b-form-checkbox>
                        <b-form-checkbox value="in_next_plugin">Plugin Masuk</b-form-checkbox>
                        <b-form-checkbox value="out_next_plugin">Plugin Keluar</b-form-checkbox>
                        <b-form-checkbox value="connectto_ipport">Ip Port</b-form-checkbox>
                    </b-form-checkbox-group>
                </b-form-group>
            </b-col>
            <b-col sm="5" md="6" class="my-1">
                <b-form-group
                    label="Per page"
                    label-for="per-page-select"
                    label-cols-sm="6"
                    label-cols-md="4"
                    label-cols-lg="3"
                    label-align-sm="right"
                    label-size="sm"
                    class="mb-0"
                    >
                    <b-form-select
                        id="per-page-select"
                        v-model="perPage"
                        :options="pageOptions"
                        size="sm"
                    >
                    </b-form-select>
                </b-form-group>
            </b-col>
            <b-col sm="7" md="6" class="my-1">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    align="fill"
                    size="sm"
                    class="my-0"
                    >
                </b-pagination>
            </b-col>
        </b-row>
        <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;">
            <b-col sm="5" md="6" class="my-1">
                <b-form-group label="Database:" 
                    label-cols-sm="3"
                    label-align-sm="right"
                    class="mb-0">
                    <b-form-select v-model="selectedDatabase" 
                        size="md"  
                        :options="database"
                        v-on:change="onChange()">
                    </b-form-select>
                </b-form-group>
            </b-col>
            <b-col sm="5" md="6" class="my-1">
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
                                       disabled-field="notEnabled"
                                       v-on:change="onChange()"
                            >
                        </b-form-select>
                </b-form-group>
            </b-col>
        </b-row>
        <!-- <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;"> -->
            <b-navbar toggleable="lg" type="light" variant="info">
                <span class="fs-4">Container Plugin Instansi ==> {{ totalRows }} Baris</span>
            </b-navbar>
        <!-- </b-row> -->
        <b-table striped hover 
            :items="items" 
            :fields="fields"
            :per-page="perPage"
            :current-page="currentPage"
            :filter="filter"
            :filter-included-fields="filterOn"
            stacked="md"
            show-empty
            small
            @filtered="onFiltered">
            <template #cell(in_next_plugin)="data">
                <b-button variant="link" @click="getContainer(data.value, $event.target)">{{ data.value }}</b-button>
            </template>
            <template #cell(out_next_plugin)="data">
                <b-button variant="link" @click="getContainer(data.value, $event.target)">{{ data.value }}</b-button>
            </template>
            <template #cell(connectto_ipport)="data">
                <b-button variant="link" @click="changeIpPort(data.value, $event.target)">{{ data.value }}</b-button>
                <!-- <b-button variant="link" @click="$bvModal.show('bv-modal-ipPortModal')">{{ data.value }}</b-button> -->
            </template>
        </b-table>
        <b-modal :id="containerPluginModal.id" :title="containerPluginModal.title" ok-only>
            <pre>{{ containerPluginModal.content }}</pre>
        </b-modal>
        <!-- <b-modal id="bv-modal-ipPortModal">
            <div class="d-block">Ip Port</div>
        </b-modal> -->
        <b-modal :id="ipPortModal.id" :title="ipPortModal.ipPortLama" 
                @show="resetModal" @hidden="resetModal" @ok="handleOk"
                ok-title="Rubah" cancel-title="Batal">
            <form ref="form" @submit.stop.prevent="handleSubmit">
                <b-form-group label="Ip Port Baru:"
                    label-cols-lg="3" 
                    label-align-sm="right"
                    style="margin-top:3%;"
                    invalid-feedback="Ip Port harus diisi"
                    :state="nameState">
                    <b-form-input type="text"
                        v-model="ipPortModal.ipPort"
                        placeholder="Masukan Ip dan Port"
                        :state="nameState"
                        required>
                    </b-form-input>
                </b-form-group>
            </form>
            
        </b-modal>
        
    </b-container>
</template>
<style scoped>

</style>
<script>
module.exports = {
    data() {
        return {
            props: {keys: Object, configs: Object},
            perPage: 5,
            currentPage: 1, 
            // totalRows: 0,
            pageOptions: [5, 10, 15, { value: 100, text: "Show a lot" }],
            items: [ ],
            fields: [
                {
                    key: 'id',
                    label: 'ID',
                    sortable: true
                },
                {
                    key: 'container_id',
                    label: 'Container',
                    sortable: true
                },
                {
                    key: 'namaContainerPlugin',
                    label: 'Nama Container Plugin',
                    sortable: true
                },
                {
                    key: 'state',
                    label: 'State',
                    sortable: true
                },
                {
                    key: 'fullname',
                    label: 'Fullname',
                    sortable: true
                },
                {
                    key: 'instance',
                    label: 'Instansi',
                    sortable: true
                },
                {
                    key: 'dt_update',
                    label: 'Tgl Update',
                    sortable: true
                },
                {
                    key: 'state_desired',
                    label: 'State Ketentuan',
                    sortable: true
                },
                {
                    key: 'flapping_ignore_time',
                    label: 'Ip Port',
                    sortable: true
                },
                {
                    key: 'additional_data',
                    label: 'Keterangan',
                    sortable: true
                }
            ],
            filter: null,
            filterOn: [],
            containerPluginModal: {
                id: 'container-modal',
                title: '',
                content: ''
            },
            filteredItems: '',
            selectedContainer:'',
            containers: [''],
            selectedDatabase:'Lokal',
            database: [],
            picker: '/ecp/picker',
            menu: '/ecp/menu',
            ipPortModal:{
                id: 'ip-modal',
                ipPortLama:'',
                ipPort:''
            },
            nameState: null,
        }
    },
    mounted(){
        console.log('mounted');
        this.database = [];
        this.checkMysql();
        this.getContainers();
        this.retrieveData();
        // this.totalRows = this.filteredItems.length;
    },
    computed: {
        totalRows() {
            return this.items.length
        }
    },
    methods: {
        getContainers(){
            console.log('getContainers: ' + this.picker);
            axios.post(this.picker,{ jenis: 'Containers', parameter: '' })
            .then((resp) => { 
                this.containers = resp.data;
            })
            .catch(errors => { console.error(errors); });;
        },
        retrieveData(){
            console.log('retrieveData: ' + this.menu);
            console.log('container: ' + this.selectedContainer);
            axios.post(this.menu,{ jenis: 'ContainerPluginInstance', containerId: this.selectedContainer, limit: false })
            .then((resp) => { 
                this.items = resp.data;
            })
            .catch(errors => { console.error(errors); });;
        },
        onFiltered() {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = this.filteredItems.length
            this.currentPage = 1
        },
        getContainer(namaContainerPlugin, tombol) {
            this.containerPluginModal.title = namaContainerPlugin;
            axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: namaContainerPlugin})
            .then((resp) => { 
                this.containerPluginModal.content = resp.data;
            })
            .catch(errors => { console.error(errors); });
            this.$root.$emit('bv::show::modal', this.containerPluginModal.id, tombol);
        },
        resetContainerModal() {
            this.containerPluginModal.title = ''
            this.containerPluginModal.content = ''
        },
        onChange(){
            console.log('onChange');
            this.database = [];
            this.checkMysql();
            this.containers = [''];
            this.getContainers();
            this.retrieveData();
        },
        checkMysql(){
            // console.log("database: "  + this.selectedDatabase);
            var db = this.selectedDatabase;
            // var picker = '/ecp/picker';
            if(db=='Lokal') {
                this.picker = '/ecp/picker';
                this.menu = '/ecp/menu';
                console.log("database: Lokal");
            }
            if(db=='SIT'){
                this.picker = '/ecp/pickerSit';
                this.menu = '/ecp/menuSit';
                console.log("database: SIT");
            }if(db=='UAT'){
                this.picker = '/ecp/pickerUat';
                this.menu = '/ecp/menuUat';
                console.log("database: UAT");
            }
            console.log("checkMysql::::::::::: "  + db);

            axios.post('/ecp/checkMysql',{})
            .then((resp) => {
                if(resp.data.length>0){
                    lokal = resp.data[0].lokal;
                    sit = resp.data[0].sit;
                    uat = resp.data[0].uat;
                    wla = resp.data[0].wla;
                    prod = resp.data[0].prod;
                    if(lokal){
                        this.database.push('Lokal');
                    }
                    if(sit){
                        this.database.push('SIT');
                    }
                    if(uat){
                        this.database.push('UAT');
                    }
                    if(wla){
                        this.database.push('WLA');
                    }
                    if(prod){
                        this.database.push('PROD');
                    }
                }else{
                    this.errormessage = 'Koneksi ke Database error';
                }
                
            })
            .catch(errors => { console.error(errors);});
        },
        changeIpPort(ip, tombol) {
            this.ipPortModal.ipPortLama = ip;
            this.ipPortModal.ipPort = '';
            // const ipBaru = this.ipPortModal.ipPort;
            // axios.post('/ecp/picker',{ jenis: 'ContainerPlugin', parameter: namaContainerPlugin})
            // .then((resp) => { 
            //     this.containerPluginModal.content = resp.data;
            // })
            // .catch(errors => { console.error(errors); });
            this.$root.$emit('bv::show::modal', this.ipPortModal.id, tombol);
        },
        // submitIpPort(){
        //     const ipLama = this.ipPortModal.ipPortLama;
        //     const ipBaru = this.ipPortModal.ipPort;
        //     console.log('submitIpPort port lama: ' + ipLama);
        //     console.log('submitIpPort port baru: ' + ipBaru);
        // },
        resetModal() {
            console.log('resetModal');
            this.ipPortModal.ipBaru = '';
            this.nameState = null;
        },
        handleOk(bvModalEvent) {
            console.log('handleOk');
            // Prevent modal from closing
            bvModalEvent.preventDefault()
            // Trigger submit handler
            this.handleSubmit()
         },
         handleSubmit() {
            // Exit when the form isn't valid
            if (!this.checkFormValidity()) {
                return
            }
            // Push the name to submitted names
            // this.submittedNames.push(this.name)
            // Hide the modal manually
            const ipLama = this.ipPortModal.ipPortLama;
            const ipBaru = this.ipPortModal.ipPort;
            console.log('submitIpPort port lama: ' + ipLama);
            console.log('submitIpPort port baru: ' + ipBaru);

            this.$nextTick(() => {
            this.$bvModal.hide(this.ipPortModal.id)
            })
        },
        checkFormValidity() {
            const valid = this.$refs.form.checkValidity()
            this.nameState = valid
            return valid
        },
    },
}
</script>
