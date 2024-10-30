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
        <!-- <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;"></b-row> -->
        <b-row class="mb-3">
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
        <b-navbar toggleable="lg" type="light" variant="info">
            <span class="fs-4">Container Plugin ==> {{ totalRows }} Baris</span>
        </b-navbar>
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
            <template #cell(idCP)="data">
                <b-button variant="link" @click="duplicate(false, data, $event.target)">{{ data.value }}</b-button>
            </template>
            <template #cell(in_next_plugin)="data">
                <b-button variant="link" @click="getContainerPlugin(data.value, $event.target)">{{ data.value }}</b-button>
            </template>
            <template #cell(out_next_plugin)="data">
                <b-button variant="link" @click="getContainerPlugin(data.value, $event.target)">{{ data.value }}</b-button>
            </template>
            <template #cell(connectto_ipport)="data">
                <b-button variant="link" @click="changeIpPortForm(data, $event.target)">{{ data.value }}</b-button>
                <!-- <b-button variant="link" @click="$bvModal.show('bv-modal-ipPortModal')">{{ data.value }}</b-button> -->
            </template>
            <template #cell(actions)="row">
                <b-button size="sm" @click="duplicate(true, row, $event.target)" class="mr-1">
                <!-- <b-button size="sm" @click="editForm(rowfv, $event.target)" class="mr-1"> -->
                Duplicate
                </b-button>
                <b-button size="sm" @click="row.toggleDetails">
                {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
                </b-button>
            </template>
            <template #row-details="row">
                <b-card>
                <ul>
                    <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value }}</li>
                </ul>
                </b-card>
            </template>
        </b-table>
        <b-modal :id="containerPluginModal.id" scrollable :title="containerPluginModal.title" ok-only>
            <pre>{{ containerPluginModal.content }}</pre>
        </b-modal>
        <!-- <b-modal id="bv-modal-ipPortModal">
            <div class="d-block">Ip Port</div>
        </b-modal> -->
        <b-modal :id="ipPortModal.id" :title="ipPortModal.ipPortLama" 
                @show="resetModal" @hidden="resetModal" @ok="handleIpPort"
                ok-title="Rubah" cancel-title="Batal">
            <form ref="form" @submit.stop.prevent="handleSubmitIpPort">
                <b-form-group label="Ip Port Baru:"
                    label-cols-lg="3" 
                    label-align-sm="right"
                    style="margin-top:3%;"
                    invalid-feedback="Ip Port harus diisi"
                    :state="ipPortBaru">
                    <b-form-input type="text"
                        v-model="ipPortModal.ipPort"
                        placeholder="Masukan Ip dan Port"
                        :state="ipPortBaru"
                        required>
                    </b-form-input>
                </b-form-group>
            </form>   
        </b-modal>
        <b-modal size="xl" :id="editFormModal.id" :title="editFormModal.title" 
                header-bg-variant="dark"
                header-text-variant="light"
                body-bg-variant="light"
                body-text-variant="dark"
                footer-bg-variant="warning"
                footer-text-variant="dark"
                @show="retreiveEditFormModal" @hidden="resetEditFormModal" @ok="handleOk"
                ok-title="Simpan" cancel-title="Batal" modal-title="Duplicate">
                <form ref="form" @submit.stop.prevent="handleSubmit">
                    <b-container fluid>
                        <b-row class="mb-1 text-right">
                            <b-col>ID</b-col>
                            <b-col>
                                <b-form-input type="number"
                                    v-model="formUpdate.idCP"
                                    placeholder="Masukan ID"
                                    :disabled="!formUpdate.isDuplicate"
                                    :state="idState"
                                    required>
                                </b-form-input>
                            </b-col>
                            <b-col>Startup Order</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.startupOrder"
                                    placeholder="Masukan Startup Order">
                                </b-form-input>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>State</b-col>
                            <b-col>
                                <b-form-select v-model="selectedPluginStateForm" 
                                    size="md"  
                                    :options="pluginStates"
                                    class="mb-3"
                                    value-field="state_type"
                                    text-field="concatName"
                                    disabled-field="notEnabled"
                                    :state="pluginState"
                                    >
                                </b-form-select>
                            </b-col>
                            <b-col>Jenis Node</b-col>
                            <b-col>
                                <b-form-select v-model="selectedNodeTypeForm" 
                                    size="md"  
                                    :options="nodeTypes"
                                    class="mb-3"
                                    value-field="id"
                                    text-field="concatName"
                                    disabled-field="notEnabled"
                                    :state="pluginState"
                                    >
                                </b-form-select>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Container</b-col>
                            <b-col>
                                <b-form-select v-model="selectedContainerForm" 
                                    size="md"  
                                    :options="containers"
                                    class="mb-3"
                                    value-field="id"
                                    text-field="name"
                                    disabled-field="notEnabled">
                                </b-form-select>
                            </b-col>
                            <b-col>Plugin</b-col>
                            <b-col>
                                <b-form-select v-model="selectedPluginForm" 
                                    size="md"  
                                    :options="plugins"
                                    class="mb-3"
                                    value-field="id"
                                    text-field="sharedobject"
                                    disabled-field="notEnabled">
                                </b-form-select>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Nama Container Plugin</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.containerPluginName"
                                    placeholder="Masukan Nama Container Plugin"
                                    :formatter="formatUpperCase"
                                    required>
                                </b-form-input>
                            </b-col>
                            <b-col>Antrian</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.queue"
                                    placeholder="Masukan Antrian">
                                </b-form-input>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Plugin Masuk</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.inNextPlugin"
                                    placeholder="Masukan Container Plugin Masuk">
                                </b-form-input>
                            </b-col>
                            <b-col>Plugin Keluar</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.outNextPlugin"
                                    placeholder="Masukan Container Plugin Keluar">
                                </b-form-input>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Port</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.listen"
                                    placeholder="Masukan Port Sebagai Server">
                                </b-form-input>
                            </b-col>
                            <b-col>Ip dan Port atau Http</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.connectTo"
                                    placeholder="Masukan Ip dan Port Klien">
                                </b-form-input>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Instances</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.instances"
                                    placeholder="Masukan Port">
                                </b-form-input>
                            </b-col>
                            <b-col>Maximal Instances</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.maxInstances"
                                    placeholder="Masukan Maximal Instances">
                                </b-form-input>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Flapping Ignore Time</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.flappingIgnoreTime"
                                    placeholder="Masukan Flapping Ignore Time">
                                </b-form-input>
                            </b-col>
                            <b-col>Response Time</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.responseTime"
                                    placeholder="Masukan Respnse Time">
                                </b-form-input>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Create Dinamically</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.createDinamically"
                                    placeholder="Masukan Create Dinamically">
                                </b-form-input>
                            </b-col>
                            <b-col>Keterangan</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.comments"
                                    placeholder="Masukan Keterangan">
                                </b-form-input>
                            </b-col>
                        </b-row>
                    </b-container>
                    <b-alert v-show="displayError" variant="danger" show class="error-Msg">
                        {{errormessage}}
                    </b-alert>
                </form>
        </b-modal>
        <b-modal :id="editFormModal.idd" :title="editFormModal.title" 
                header-bg-variant="dark"
                header-text-variant="light"
                body-bg-variant="light"
                body-text-variant="dark"
                footer-bg-variant="warning"
                footer-text-variant="dark"
                @show="resetEditFormModal" @hidden="resetEditFormModal" @ok="handleOk"
                ok-title="Rubah" cancel-title="Batal" modal-title="Duplicate">
            <form ref="form" @submit.stop.prevent="handleSubmit">
                <b-form-group label="Container Plugin:"
                    label-cols-lg="3" 
                    label-align-sm="right"
                    style="margin-top:3%;"
                    invalid-feedback="Nama Container Plugin harus diisi">
                    <b-form-input type="text"
                        v-model="formUpdate.containerPluginName"
                        placeholder="Masukan Nama Container Plugin"
                        disabled>
                    </b-form-input>
                </b-form-group>                
                <b-form-group label="Plugin Masuk:"
                    label-cols-lg="3" 
                    label-align-sm="right"
                    style="margin-top:3%;"
                    invalid-feedback="Plugin Masuk harus diisi">
                    <b-form-input type="text"
                        v-model="formUpdate.inNextPlugin"
                        placeholder="Masukan Plugin Masuk"
                        disabled>
                    </b-form-input>
                </b-form-group>
                <b-form-group label="Plugin State:" 
                                  label-cols-sm="3"
                                  label-align-sm="right"
                                  class="mb-0">
                        <b-form-select v-model="selectedPluginStateForm" 
                                       size="md"  
                                       :options="pluginStates"
                                       class="mb-3"
                                       value-field="state_type"
                                       text-field="concatName"
                                       disabled-field="notEnabled"
                                       :state="pluginState"
                            >
                        </b-form-select>
                </b-form-group>
                <b-form-group label="Port:"
                    label-cols-lg="3" 
                    label-align-sm="right"
                    style="margin-top:3%;"
                    invalid-feedback="Port harus diisi">
                    <b-form-input type="text"
                        v-model="formUpdate.listen"
                        placeholder="Masukan Port Listen">
                    </b-form-input>
                </b-form-group>
                <b-form-group label="Keterangan:"
                    label-cols-lg="3" 
                    label-align-sm="right"
                    style="margin-top:3%;">
                    <b-form-input type="text"
                        v-model="formUpdate.comments"
                        placeholder="Masukan Keterangan">
                    </b-form-input>
                </b-form-group>
            </form>
        </b-modal>
        <b-modal :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetEditFormModal">
            <pre>{{ infoModal.content }}</pre>
        </b-modal>
    </b-container>
</template>
<style scoped>

</style>
<script>
module.exports = {
    props: {keys: Object, configs: Object},
    data() {
        return {            
            perPage: 5,
            currentPage: 1, 
            // totalRows: 0,
            pageOptions: [5, 10, 15, { value: 100, text: "Show a lot" }],
            items: [ ],
            fields: [
                {
                    key: 'idCP',
                    label: 'ID',
                    sortable: true
                },
                {
                    key: 'sharedobject',
                    label: 'Nama Plugin',
                    sortable: true
                },
                {
                    key: 'name',
                    label: 'Nama Container Plugin',
                    sortable: true
                },
                {
                    key: 'state_startup',
                    label: 'State',
                    sortable: true
                },
                {
                    key: 'port_listen',
                    label: 'Port',
                    sortable: true
                },
                {
                    key: 'in_next_plugin',
                    label: 'Plugin Masuk',
                    sortable: true
                },
                {
                    key: 'out_next_plugin',
                    label: 'Plugin Keluar',
                    sortable: true
                },
                {
                    key: 'connectto_ipport',
                    label: 'Ip Port',
                    sortable: true
                },
                {
                    key: 'listen_port',
                    label: 'Port Server',
                    sortable: true
                },
                {
                    key: 'comments',
                    label: 'Keterangan',
                    sortable: true
                },
                { key: 'actions', label: 'Actions' }
            ],
            filter: null,
            filterOn: [],
            containerPluginModal: {
                id: 'container-modal',
                title: '',
                content: ''
            },
            filteredItems: '',
            selectedContainer:this.configs.container_id,
            containers: [''],
            selectedPluginStateForm: '',
            pluginStates: [''],
            selectedDatabase:this.configs.database,
            database: ['SIT'],
            selectedNodeTypeForm:'',
            nodeTypes: [''],
            fullName: this.keys.fullname,
            picker: '/ecp/picker',
            menu: '/ecp/menu',
            ipPortModal:{
                id: 'ip-modal',
                ipPortLama:'',
                ipPort:''
            },
            ipPortBaru: null,
            formUpdate:{
                isDuplicate:false,
                idCP:'',
                containerId:'',
                pluginId:'',
                containerPluginName:'',
                state:'',
                listen:'',
                instances:'',
                inNextPlugin:'',
                outNextPlugin:'',
                connectTo:'',
                comments:'',
                queue:'',
                nodeType:'',
                startupOrder:'',
                flappingIgnoreTime:'',
                maxInstances:'',
                createDinamically:'',
                responseTime:'',
                
            },
            containerPluginName:null,
            editFormModal:{
                id:'id-modal',
                title:'',
                state_startup:''
            },
            pluginState: null,
            datas: [],
            infoModal: {
                id: 'info-modal',
                title: '',
                content: ''
            },
            selectedContainerForm:'',
            plugins:[''],
            selectedPluginForm:'',
            action:'Updated',
            isValidId:false,
            lastData:[],
            dataLama:'',
            values:'',
            // activities:'',
            // selectedInPluginForm:'',
            // selectedOutPluginForm:'',
            // containerPlugins:[''],
        }
    },
    watch: {
        selected(newValue, oldValue) {
            console.log('watch');
            if (newValue.length === 0) {
                this.disabled = true;
            }
        }
    },
    mounted(){
        console.log('mounted');
        this.refresh();
        // this.totalRows = this.filteredItems.length;
    },
    computed: {
        totalRows() {
            return this.items.length
        },
        idState() {
            console.log('idState: ' + this.formUpdate.idCP);
            // console.log('id length: ' + this.formUpdate.idCP.length);
            if(this.formUpdate.idCP > 0) {
                console.log('idState11111: ' + this.formUpdate.idCP);
                var ok = false;
                axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: this.formUpdate.idCP })
                .then((resp) => {
                    if(resp.data.length>0) {
                        console.log("isValidId tidak valid");
                        this.errormessage = "ID sudah digunakan.";
                        this.isValidId = false;
                    } else{
                        console.log("isValidId valid");
                        this.errormessage = "";
                        this.isValidId = true;
                    }
                }).catch((error) => {console.log(error);});
                return this.isValidId;
            } else {
                this.errormessage = "ID tidak boleh kosong atau -.";
                return false;
            }
            // return this.formUpdate.id.length > 0 ? true : false
        },
        displayError(){
            if(this.errormessage!=''){ return true; }
            else { return false; }
        }
    },
    methods: {
        formatUpperCase(value) {
            if (!value) return ''
            value = value.toString()
            return value.toUpperCase()
        },
        refresh(){
            console.log('refresh');
            this.database = [];
            this.checkMysql();
            this.getContainers();
            this.getPluginStates();
            this.getPlugins();
            this.getNodeTypes();
            this.retrieveData();
        },
        getNodeTypes(){
            console.log('getNodeTypes: ' + this.picker);
            axios.post(this.picker,{ jenis: 'NodeType', parameter: '' })
            .then((resp) => { 
                this.nodeTypes = resp.data;
            })
            .catch(errors => { console.error(errors); });
        },
        getContainers(){
            console.log('getContainers: ' + this.picker);
            axios.post(this.picker,{ jenis: 'Containers', parameter: '' })
            .then((resp) => { 
                this.containers = resp.data;
            })
            .catch(errors => { console.error(errors); });
        },
        getPlugins(){
            console.log('getPlugins: ' + this.picker);
            axios.post(this.picker,{ jenis: 'Plugins', parameter: '' })
            .then((resp) => { 
                this.plugins = resp.data;
            })
            .catch(errors => { console.error(errors); });
        },
        getPluginStates(){
            console.log('getPluginStates: ' + this.picker);
            axios.post(this.picker,{ jenis: 'StateType', parameter: '' })
            .then((resp) => { 
                this.pluginStates = resp.data;
            })
            .catch(errors => { console.error(errors); });
        },
        retrieveData(){
            console.log('retrieveData: ' + this.menu);
            // console.log('container: ' + this.selectedContainer);
            var param = {                             //Create the JSon
                "jenis": "ContainerPlugin",
                "containerId": this.selectedContainer,
                "limit": false
            }
            axios.post(this.menu, param )
            // axios.post(this.menu, { jenis: "ContainerPlugin", containerId: this.selectedContainer, limit: false})
            .then((resp) => { 
                this.items = resp.data;
            })
            .catch(errors => { console.error(errors); });
        },
        onFiltered() {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = this.filteredItems.length
            this.currentPage = 1
        },
        getContainerPlugin(namaContainerPlugin, tombol) {
            this.containerPluginModal.title = namaContainerPlugin;
            var param = {                             //Create the JSon
                "jenis": "ContainerPlugin",
                "parameter": namaContainerPlugin
            }
            axios.post(this.picker, param )
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
            this.pluginStates = [''];
            this.getPluginStates();
            this.retrieveData();
        },
        retreiveEditFormModal() {
            console.log("retreiveEditFormModal");
            console.log("action: " + this.action);
            if(this.action=='Duplicate') {
                this.editFormModal.title = 'New Container Plugin';
            } 
            if(this.action=='Update') {
                this.editFormModal.title = 'Edit Container Plugin ID : ' + id;
            }
        },
        duplicate(isDuplicate, data, tombol) {
            // console.log("editForm: :::: " + data.item.idCP);
            // console.log("pluginStates: :::: " + this.pluginStates);
            // console.log("tombol: :::: " + tombol);
            // this.editFormModal.title = 'Duplicate dari Container Plugin ID : ' + id;
            this.datas = data;

            if(isDuplicate) {
                this.editFormModal.title = 'Duplicate dari Container Plugin ID : ' + this.datas.item.idCP;
            } else {
                this.editFormModal.title = 'Edit Container Plugin ID : ' + this.datas.item.idCP;
            }
            
            console.log("Datas: :::: " + this.datas);
            // console.log("Datas item: :::: " + this.datas.item);

            var state = data.item.state_startup;
            var nodeType = data.item.node_type;
            var containerId = data.item.container_id;
            var pluginId = data.item.plugin_id;

            this.selectedPluginStateForm = state;
            this.selectedNodeTypeForm = nodeType;
            this.selectedContainerForm = containerId;
            this.selectedPluginForm = pluginId;

            var id = data.item.idCP;
            var startupOrder = data.item.startup_order;
            var containerPluginName = data.item.name;
            var queue = data.item.queue_threshold;
            var inNextPlugin = data.item.in_next_plugin;
            var outNextPlugin = data.item.out_next_plugin;
            var listen = data.item.port_listen;
            var connectTo = data.item.connectto_ipport;
            var instances = data.item.cnt_instances;
            var maxInstances = data.item.max_instances;
            var flappingIgnoreTime = data.item.flapping_ignore_time;
            var responseTime = data.item.response_timeout;
            var createDinamically = data.item.create_dynamically;
            var comments = data.item.comments;


            this.formUpdate.isDuplicate = isDuplicate;
            this.formUpdate.idCP = id;
            this.formUpdate.startupOrder = startupOrder;
            this.formUpdate.containerPluginName = containerPluginName;
            this.formUpdate.queue = queue;
            this.formUpdate.inNextPlugin = inNextPlugin;
            this.formUpdate.outNextPlugin = outNextPlugin;
            this.formUpdate.listen = listen;
            this.formUpdate.connectTo = connectTo;
            this.formUpdate.instances = instances;
            this.formUpdate.maxInstances = maxInstances;
            this.formUpdate.flappingIgnoreTime = flappingIgnoreTime;
            this.formUpdate.responseTime = responseTime;
            this.formUpdate.createDinamically = createDinamically;
            this.formUpdate.comments = comments;

            this.dataLama = 'id: ' + id + ', startup_order: ' + startupOrder + ', state_startup: ' + state + 
                ', node_type: ' + nodeType + ', container_id: ' + containerId + ', plugin_id: ' + pluginId +
                ', container_plugin_name: ' + containerPluginName + ', queue: ' + queue + 
                ', in_next_plugin: ' + inNextPlugin + ', out_next_plugin: ' + outNextPlugin + 
                ', listen: ' + listen + ', connectto_ipport: ' + connectTo + ', cnt_instances: ' + instances + 
                ', max_instances: ' + maxInstances + ', flapping_ignore_time: ' + flappingIgnoreTime + 
                ', response_timeout: ' + responseTime + ', create_dynamically: ' + createDinamically + ', comments: ' + comments;

            // this.formUpdate.state = data.item.state_startup;
            
            // this.infoModal.title = `Row index: ${index}`
            // this.infoModal.content = JSON.stringify(item, null, 2)
            this.$root.$emit('bv::show::modal', this.editFormModal.id, tombol)
        },
        handleSubmit() {
            console.log("handleSubmit: " + this.checkFormValidity());
            // Exit when the form isn't valid
            if (!this.checkFormValidity() || !this.isValidId) {
                return
            } else {
                this.prepareAudit();
                if(this.formUpdate.isDuplicate){
                    // this.create();
                } else {
                    // this.update();
                }
                // this.audit();
                // this.update();
            }
            this.refresh();
            this.$nextTick(() => {
            this.$bvModal.hide(this.editFormModal.id)
            })
         },
        prepareAudit(){
            console.log('prepareAudit');
            var activity = "Edit Container Plugin";
            if(this.formUpdate.isDuplicate){
                console.log('isDuplicate: True');
                activity = "Duplicate Container Plugin";
                var activities = '';
                this.values = "VALUES(" + this.formUpdate.idCP + ", " + this.selectedContainerForm + ", " + 
                    this.selectedPluginForm + ", " + this.formUpdate.containerPluginName + ", " + 
                    this.selectedPluginStateForm + ", " + this.formUpdate.listen + ", " + 
                    this.formUpdate.instances + ", " + this.formUpdate.inNextPlugin + ", " + 
                    this.formUpdate.outNextPlugin + ", " + this.formUpdate.connectTo + ", " + 
                    this.formUpdate.comments + ", " + this.formUpdate.queue + ", " +
                    this.selectedNodeTypeForm + ", " + this.formUpdate.startupOrder + ", " +
                    this.formUpdate.flappingIgnoreTime + ", " + this.formUpdate.maxInstances + ", " + 
                    this.formUpdate.createDinamically + ", " + this.formUpdate.responseTime + ")";
                activities = this.values;
                console.log('activities: ' + activities);
            } else {
                console.log('isDuplicate: False  --> ID ' + this.formUpdate.idCP);
                activity = "Update Container Plugin";
                activities = "Data Lama: " + this.dataLama;
                console.log('activities: ' + activities);
            }
            console.log('activities: ' + activities);
            this.addAudit(activity, activities);
        },
        checkFormValidity() {
            console.log("checkFormValidity");
            const valid = this.$refs.form.checkValidity()
            // this.pluginState = valid

            return valid
        },
        resetEditFormModal() {
            console.log('resetEditFormModal');
            // this.action = 'Update';
            this.selectedPluginStateForm = '';
            this.selectedNodeTypeForm = '';
            this.selectedContainerForm = '';
            this.selectedPluginForm = '';
            this.isDuplicate = false;
            this.formUpdate.idCP = '';
            this.formUpdate.startupOrder = '';
            this.formUpdate.containerPluginName = '';
            this.formUpdate.queue = '';
            this.formUpdate.inNextPlugin = '';
            this.formUpdate.outNextPlugin = '';
            this.formUpdate.listen = '';
            this.formUpdate.connectTo = '';
            this.formUpdate.instances = '';
            this.formUpdate.maxInstances = '';
            this.formUpdate.flappingIgnoreTime = '';
            this.formUpdate.responseTime = '';
            this.formUpdate.createDinamically = '';
            this.formUpdate.comments = '';
        },
        editForm(data, tombol) {
            console.log("editForm: :::: " + data.item.idCP);
            console.log("containerId: :::: " + data.item.state_startup);
            console.log("tombol: :::: " + tombol);
            var id = data.item.idCP;
            // this.editFormModal.id = data.value;
            this.editFormModal.title = 'Edit Container Plugin ID : ' + id;
            this.datas = data;
            // this.editFormModal.state_startup = 'Gunawan';
            this.selectedContainerForm = data.item.container_id;
            this.selectedPluginForm = data.item.plugin_id;
            // this.selectedInPluginForm = data.item.in_next_plugin;
            // this.selectedOutPluginForm = data.item.out_next_plugin;
            this.formUpdate.idCP = data.item.idCP;
            this.formUpdate.containerId = data.item.container_id;
            this.formUpdate.containerPluginName = data.item.name;
            this.formUpdate.state = data.item.state_startup;
            this.formUpdate.listen = data.item.port_listen;
            this.formUpdate.instances = data.item.cnt_instances,
            this.formUpdate.inNextPlugin = data.item.in_next_plugin,
            this.formUpdate.outNextPlugin = data.item.out_next_plugin,
            this.formUpdate.connectTo = data.item.connectto_ipport,
            this.formUpdate.comments = data.item.comments
            this.selectedPluginStateForm = data.item.state_startup;
                
            this.$root.$emit('bv::show::modal', this.editFormModal.id, tombol);
        },
        changeIpPortForm(data, tombol) {
            console.log("data: :::: " + data.item.idCP);
            this.ipPortModal.ipPortLama = data.value;
            this.ipPortModal.ipPort = data.value;
            this.formUpdate.idCP = data.item.idCP;

            this.$root.$emit('bv::show::modal', this.ipPortModal.id, tombol);
        },
        resetModal() {
            console.log('resetModal');
            this.ipPortModal.ipBaru = '';
            this.ipPortBaru = null;
        },
        handleOk(bvModalEvent){
            console.log('handleOk::::' + bvModalEvent);

            bvModalEvent.preventDefault()

            // Trigger submit handler
            this.handleSubmit()
        },
        handleIpPort(bvModalEvent) {
            console.log('handleIpPort::::' + bvModalEvent);
            // Prevent modal from closing
            bvModalEvent.preventDefault()

            // Trigger submit handler
            this.handleSubmitIpPort()            
         },
        handleSubmitIpPort() {
            console.log("handleSubmitIpPort: " + this.checkIpPortFormValidity());
            // Exit when the form isn't valid
            if (!this.checkIpPortFormValidity()) {
                return
            } else {
                this.auditIpPort();
                this.updateIpPort();
            }
            this.refresh();
            this.$nextTick(() => {
            this.$bvModal.hide(this.ipPortModal.id)
            })
         },
         checkIpPortFormValidity() {
            console.log("checkIpPortFormValidity");
            const valid = this.$refs.form.checkValidity()
            this.ipPortBaru = valid
            this.containerPluginName = valid
            
            return valid
        },
         //Gets current time in HH:mm:ss format
        getCurrentTime(){
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            return time;
        },
        //Gets current datetime in yyyy-MM-dd format
        getCurrentDate(){
            const date = new Date();
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let currentDate = `${year}-${month}-${day}`;
            return currentDate
        },
        audit(){
            console.log('audit');
            var activity = "Update Container Plugin";
            var activities = "";
            var stateLama = this.datas.item.state_startup;
            var portLama = this.datas.item.port_listen;
            var descLama = this.datas.item.comments;

            var stateBaru = this.selectedPluginStateForm;
            var portBaru = this.formUpdate.listen;
            var descBaru = this.formUpdate.comments;

            if(stateLama != stateBaru) {
                activities += "State: " + stateLama + " --> " + stateBaru;
            }
            if(portLama != portBaru) {
                activities += ", Port: " + portLama + " --> " + portBaru;
            }
            if(descLama != descBaru) {
                activities += ", Desc: " + descLama + " --> " + descBaru;
            }
            console.log('activities: ' + activities);
            this.addAudit(activity, activities);
        },
        auditIpPort() {
            console.log('auditIpPort');
            var self = this;                          //Assign this to a variable
            var activity = "Ganti Ip Port";
            var activities = "Port Lama: "+ this.ipPortModal.ipPortLama + " :: Port Baru: " + this.ipPortModal.ipPort;
            
            console.log('activity: ' + activity);
            console.log('activities: ' + activities);
            this.addAudit(activity, activities);
        },
        addAudit(activity, activities){
            console.log('addAudit');
            var date = this.getCurrentDate();
            var time = this.getCurrentTime();
            var param = {                             //Create the JSon
                "fullName": this.fullName,
                "menu": "Container Plugin",
                "activityName": activity,
                "activities": activities,
                "datetime": date+" "+time,
                "database": this.selectedDatabase
            }
            axios.post('/ecp/audit', param)
            .then(resp=>{ 
                self.showNotification(); //shows notification of successful add
            })
            .catch(e=>{ console.log(error); });
        },
        update() {
            var idCP = this.datas.item.idCP;
            var stateBaru = this.selectedPluginStateForm;
            var portBaru = this.formUpdate.listen;
            var descBaru = this.formUpdate.comments;

            console.log("Update: " + idCP);
            // var param = {                             //Create the JSon
            //     "jenis": "ContainerPluginUpdate",
            //     "idCP": idCP,
            //     "stateBaru":stateBaru,
            //     "portBaru":portBaru,
            //     "descBaru":descBaru,
            //     "database": this.selectedDatabase
            // }
            var set = "state_startup = '"+stateBaru+"', port_listen = '"+portBaru+"', comments = '"+descBaru+"' WHERE id = '"+idCP+"'";
            axios.post('/ecp/update', {jenis: 'ContainerPlugin',setValue: set, database: this.selectedDatabase})
            .then(resp=>{ 
                self.showNotification(); //shows notification of successful add
            })
            .catch(e=>{ console.log(error); });
        },
        updateIpPort(){
            var idCP = this.formUpdate.idCP;
            var ipBaru = this.ipPortModal.ipPort;
            console.log("updateIpPort: " + idCP);
            console.log("ipBaru: " + ipBaru);
            /*
            var param = {                             //Create the JSon
                "jenis": "ContainerPlugin",
                "idCP": idCP,
                "ipBaru":ipBaru,
                "database": this.selectedDatabase
            }
                */
            var set = "connectto_ipport = '" + ipBaru + "' WHERE id = " + idCP;
            axios.post('/ecp/update', {jenis:"ContainerPlugin", setValue:set, database:this.selectedDatabase})
            .then(resp=>{ 
                self.showNotification(); //shows notification of successful add
            })
            .catch(e=>{ console.log(error); });
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
    },
}
</script>
