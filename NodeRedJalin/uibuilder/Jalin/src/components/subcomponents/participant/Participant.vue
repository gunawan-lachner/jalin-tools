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
                            placeholder="Type to Search"
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
                        <b-form-checkbox value="id">ID</b-form-checkbox>
                        <b-form-checkbox value="name">Nama Member</b-form-checkbox>
                        <b-form-checkbox value="container_plugin_name">Nama Container Plugin</b-form-checkbox>
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
                <b-form-group label="Jenis Member:" 
                                  label-cols-sm="3"
                                  label-align-sm="right"
                                  class="mb-0">
                        <b-form-select v-model="selectedMember" 
                                       size="md"  
                                       :options="members"
                                       class="mb-3"
                                       disabled-field="notEnabled"
                                       v-on:change="onChange()"
                            >
                        </b-form-select>
                </b-form-group>
            </b-col>
        </b-row>
        <!-- <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;"> -->
            <b-navbar toggleable="lg" type="light" variant="info">
                <span class="fs-4">Participant ==> {{ totalRows }} Baris</span>
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
            <template #cell(container_plugin_name)="data">
                <b-button variant="link" @click="getContainerPlugin(data.value, $event.target)">{{ data.value }}</b-button>
            </template>
            <template #cell(id)="row">
                <b-button variant="link" @click="duplicate(false, row, $event.target)">{{ row.value }}</b-button>
            </template>
            <template #cell(actions)="row">
                <b-button size="sm" @click="duplicate(true, row, $event.target)" class="mr-1">
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
        <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;">
            <b-col sm="5" md="6" class="my-1">
                <ul>
                    <li v-for="(value, key) in containerPluginAttrDatas" :key="key">{{ key }}: {{ value }}</li>
                </ul>
            </b-col>
        </b-row>
        <!-- cp modal -->
        <b-modal :id="containerPluginModal.id" :title="containerPluginModal.title" ok-only @hide="resetInfoModal">
            <pre>{{ containerPluginModal.content }}</pre>
        </b-modal>
        <!-- Info modal -->
        <b-modal size="xl" scrollable :id="infoModal.id" :title="infoModal.title" 
            header-bg-variant="dark"
            header-text-variant="light"
            body-bg-variant="light"
            body-text-variant="dark"
            footer-bg-variant="blue"
            footer-text-variant="dark"
            ok-only @hide="resetInfoModal">
            <b-container fluid>
                <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;">
            <b-col class="my-1">Participant
                <ul>
                    <li v-for="(value, key) in participantAdded" :key="key">{{ key }}: {{ value }}</li>
                </ul>
            </b-col>
            <b-col class="my-1">Container Plugin
                <ul>
                    <li v-for="(value, key) in containerPluginAdded" :key="key">{{ key }}: {{ value }}</li>
                </ul>
            </b-col>
            <b-col class="my-1">Container Plugin Com
                <ul>
                    <li v-for="(value, key) in containerPluginComAdded" :key="key">{{ key }}: {{ value }}</li>
                </ul>
            </b-col>
            <b-col class="my-1">Container Plugin Attribut
                <ul>
                    <li v-for="(value, key) in containerPluginAttrAdded" :key="key">{{ key }}: {{ value }}</li>
                </ul>
            </b-col>
            <b-col class="my-1">Online Config
                <ul>
                    <li v-for="(value, key) in onlineConfigAdded" :key="key">{{ key }}: {{ value }}</li>
                </ul>
            </b-col>
        </b-row>
            </b-container>
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
                                    v-model="formUpdate.id"
                                    placeholder="Masukan ID"
                                    :state="idState"
                                    :disabled="isDisabled"
                                    required>
                                </b-form-input>
                            </b-col>
                            <!-- <b-col cols="3"></b-col> -->
                            <b-col>Ext ID</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.extId"
                                    placeholder="Masukan Ext ID"
                                    :formatter="formatUpperCase"
                                    :state="extIdState"
                                    :disabled="isDisabled"
                                    required>
                                </b-form-input>
                                <!-- <span v-if="formUpdate.extId.length >= 4">The username must be at least 4 characters long.</span> -->
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Jenis Member</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.participantType"
                                    placeholder="Masukan Jenis Member"
                                    :formatter="formatUpperCase"
                                    :state="participantTypeState"
                                    required>
                                </b-form-input>
                            </b-col>
                            <b-col>Nama Member</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.name"
                                    placeholder="Masukan Nama Member"
                                    :formatter="formatUpperCase"
                                    :state="nameState"
                                    required>
                                </b-form-input>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Nama Container Plugin</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.containerPluginName"
                                    placeholder="Masukan Nama Container Plugin"
                                    :formatter="formatUpperCase"
                                    :state="containerPluginNameState"
                                    :disabled="isDisabled"
                                    required>
                                </b-form-input>
                            </b-col>
                            <b-col>ID Container Plugin</b-col>
                            <b-col>
                                <b-form-input type="number"
                                    v-model="formUpdate.containerPluginId"
                                    placeholder="Masukan ID Container Plugin"
                                    :state="containerPluginIdState"
                                    :disabled="isDisabled"
                                    required>
                                </b-form-input>
                            </b-col>                            
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Nama Container Plugin In</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.containerPluginIn"
                                    placeholder="Masukan Nama Container Plugin In"
                                    :formatter="formatUpperCase"
                                    :disabled="true"
                                    required>
                                </b-form-input>
                            </b-col>
                            <b-col>Tipe Jaringan</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.networkType"
                                    placeholder="Masukan Tipe Jaringan"
                                    :formatter="formatUpperCase"
                                    :state="networkTypeState"
                                    required>
                                </b-form-input>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Nama Container Plugin Out</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.containerPluginOutName"
                                    placeholder="Masukan Nama Container Plugin Out"
                                    :formatter="formatUpperCase"
                                    :state="containerPluginOutNameState"
                                    :disabled="isDisabled"
                                    required>
                                </b-form-input>
                            </b-col>
                            <b-col>ID Container Plugin Out</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.containerPluginOutId"
                                    placeholder="Masukan ID Container Plugin Out"
                                    :formatter="formatUpperCase"
                                    :state="containerPluginOutIdState"
                                    :disabled="isDisabled"
                                    required>
                                </b-form-input>
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Status</b-col>
                            <b-col>
                                <b-form-select v-model="formUpdate.active" 
                                    size="md"  
                                    :options="activeOptions"
                                    class="mb-3"
                                    value-field="value"
                                    text-field="text"
                                    disabled-field="notEnabled">
                                </b-form-select>
                                <!-- <b-form-input type="text"
                                    v-model="formUpdate.active"
                                    placeholder="Masukan Activ 0/1"
                                    :formatter="formatUpperCase">
                                </b-form-input> -->
                            </b-col>
                            <b-col>Tampilkan Display</b-col>
                            <b-col>
                                <b-form-select v-model="formUpdate.displayOnUI" 
                                    size="md"  
                                    :options="displayOnUIOptions"
                                    class="mb-3"
                                    value-field="value"
                                    text-field="text"
                                    disabled-field="notEnabled">
                                </b-form-select>
                                <!-- <b-form-input type="text"
                                    v-model="formUpdate.displayOnUI"
                                    placeholder="Masukan Tanpilkan Display Y/N"
                                    :formatter="formatUpperCase">
                                </b-form-input> -->
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Keterangan</b-col>
                            <b-col cols="9">
                                <b-form-input type="text"
                                    v-model="formUpdate.comments"
                                    placeholder="Masukan Keterangan"
                                    :formatter="formatUpperCase"
                                    :state="commentsState">
                                </b-form-input>
                            </b-col>
                        </b-row>
                    </b-container>
                    <b-alert v-show="displayError" variant="danger" show class="error-Msg">
                        {{errormessage}}
                    </b-alert>
                </form>
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
                    key: 'id',
                    label: 'ID',
                    sortable: true
                },
                {
                    key: 'name',
                    label: 'Nama Member',
                    sortable: true
                },
                {
                    key: 'container_plugin_name',
                    label: 'Nama Container Plugin',
                    sortable: true
                },
                {
                    key: 'participant_type',
                    label: 'Jenis Member',
                    sortable: true
                },
                {
                    key: 'network_type',
                    label: 'Jaringan',
                    sortable: true
                },
                {
                    key: 'active',
                    label: 'Aktif',
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
                id: 'cp-modal',
                title: '',
                content: ''
            },
            selectedDatabase:'Lokal',
            database: [],
            selectedMember:'',
            members: [''],
            picker: '/ecp/picker',
            menu: '/ecp/menu',
            filteredItems: [],
            infoModal: {
                id: 'info-modal',
                title: '',
                content: ''
            },
            editFormModal:{
                id:'id-modal',
                title:'',
            },
            formUpdate:{
                isDuplicate: false,
                id:'',
                extId:'',
                participantType:'',
                OldName:'',
                name:'',
                containerPluginName:'',
                containerPluginId:'',
                networkType:'',
                active:'',
                displayOnUI:'',
                comments:'',
                containerPluginIn:'',
                containerPluginIdOri:'',
                containerPluginOutIdOri:'',
                containerPluginOutName:'',
                containerPluginOutId:'',
            },
            selectedActiveForm:'',
            activeOptions: [
                { value: '0', text: 'Tidak Aktif' },
                { value: '1', text: 'Aktif' }
            ],
            displayOnUIOptions: [
                { value: 'Y', text: 'Ya' },
                { value: 'N', text: 'Tidak' }
            ],
            errormessage: '',
            isValidId:false,
            datas: [],
            fullName: this.keys.fullname,
            isValidContainerPluginName: false,
            isValidContainerPluginId: false,
            isValidContainerPluginOutName: false,
            isValidContainerPluginOutId: false,
            containerPluginAttrDatas: [],
            onlineConfigDatas: [],
            containerPlugins: '',
            containerPluginsOut: '',
            activitiesParticipant:'',
            activityContainerPlugin:'',
            activitiesContainerPlugin:'',
            activityContainerPluginCom:'',
            activitiesContainerPluginCom:'',
            isDisabled: false,
            activitiesUpdateParticipant:'',
            participantAdded:'',
            containerPluginAdded:'',
            containerPluginComAdded:'',
            containerPluginAttrAdded:'',
            onlineConfigAdded:''
            // containerPluginAttrDatas: [{
            //     containerPluginId: '', field: '', content: ''
            // }],
        }
    },
    mounted(){
        console.log('mounted Participant');
        this.database = [];
        this.checkMysql();
        this.getMembers();
        this.retrieveData();
        // this.totalRows = filteredItems.length;
    },
    computed: {
        totalRows() {
            return this.items.length
        },
        idState() {
            console.log('idState: ' + this.formUpdate.id);
            console.log("isDuplicate: " + this.isDuplicate);
            if(this.isDuplicate) {
                if(this.formUpdate.id.length > 0 && this.formUpdate.id > 0) {
                    axios.post(this.picker,{ jenis: 'Participant', id: this.formUpdate.id })
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
                // this.isDuplicate = true;
            } else {
                this.isValidId = true;
                // this.isDuplicate = false;
                return true;
            }
        },
        extIdState() {
            console.log('extIdState: '+ this.formUpdate.extId);
            console.log("isDuplicate: " + this.isDuplicate);
            if(this.isDuplicate) {
                if(this.formUpdate.extId.length > 3) {
                    this.errormessage = "Ext ID tidak boleh lebih dari 3 karakter.";
                    return false;
                } else if(this.formUpdate.extId.length == 0) {
                    this.errormessage = "Ext ID tidak boleh kosong.";
                    return false;
                } else {
                    this.errormessage = "";
                    return true;
                }
            } else {
                return true;
            }
            
        },
        participantTypeState() {
            console.log("participantType: " + this.formUpdate.participantType);
            if(this.formUpdate.participantType.length > 10) {
                this.errormessage = "Jenis Member tidak boleh lebih dari 10 karakter.";
                return false;
            } else if(this.formUpdate.participantType.length == 0) {
                this.errormessage = "Jenis Member tidak boleh kosong.";
                return false;
            } else {
                this.errormessage = "";
                return true;
            }
        },
        nameState() {
            // console.log(this.formUpdate.name + " ::::::::::::::::: " + this.formUpdate.oldName);
            if(this.formUpdate.name.length > 45) {
                this.errormessage = "Nama Member tidak boleh lebih dari 45 karakter.";
                return false;
            // } else if(this.formUpdate.name == this.formUpdate.oldName) {
            //     this.errormessage = "Nama Member tidak boleh sama.";
            //     return false;
            } else if(this.formUpdate.name.length == 0 ) {
                this.errormessage = "Nama Member tidak boleh kosong.";
                return false;
            } else {
                this.errormessage = "";
                return true;
            }
        },
        containerPluginNameState() {
            console.log("containerPluginNameState");
            if(this.isDuplicate) {
                if(this.formUpdate.containerPluginName.length > 0 && this.formUpdate.containerPluginName.length <= 45) {
                    axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: this.formUpdate.containerPluginName, id: 0})
                    .then((resp) => { 
                        if(resp.data.length>0) {
                            console.log("isValidContainerPluginName tidak valid");
                            this.errormessage = "Nama Container Plugin sudah digunakan.";
                            this.isValidContainerPluginName = false;
                        } else{
                            console.log("isValidContainerPluginName valid");
                            this.errormessage = "";
                            this.isValidContainerPluginName = true;
                        }
                    })
                    .catch(errors => { console.error(errors); });
                    return this.isValidContainerPluginName;
                } else if(this.formUpdate.containerPluginName.length > 45) {
                    this.errormessage = "Nama Container Plugin tidak boleh lebih dari 45 karakter.";
                    return false;
                } else if(this.formUpdate.containerPluginName.length == 0 ) {
                    this.errormessage = "Nama Container Plugin tidak boleh kosong.";
                    return false;
                }
            } else {
                return true;
            }
        },
        containerPluginIdState() {
            console.log("containerPluginIdState: " + this.formUpdate.containerPluginId);
            if(this.isDuplicate) {
                if(this.formUpdate.containerPluginId.length > 0 && this.formUpdate.containerPluginId.length <= 10) {
                    axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: '', id: this.formUpdate.containerPluginId})
                    .then((resp) => { 
                        if(resp.data.length>0) {
                            console.log("id tidak valid");
                            this.errormessage = "ID Container Plugin sudah digunakan.";
                            this.isValidContainerPluginId = false;
                        } else{
                            console.log("isValidContainerPluginId valid");
                            this.errormessage = "";
                            this.isValidContainerPluginId = true;
                        }
                    })
                    .catch(errors => { console.error(errors); });
                    return this.isValidContainerPluginId;
                } else if(this.formUpdate.containerPluginId.length > 10 ) {
                    this.errormessage = "ID Container Plugin tidak boleh lebih dari 10 karakter.";
                    return false;
                } else if(this.formUpdate.containerPluginId.length == 0 ) {
                    this.errormessage = "ID Container Plugin tidak boleh kosong.";
                    return false;
                }
            } else {
                return true;
            }
            
        },
        containerPluginOutNameState() {
            console.log("containerPluginOutNameState");
            if(this.isDuplicate) {
                if(this.formUpdate.containerPluginOutName.length > 0 && this.formUpdate.containerPluginOutName.length <= 45) {
                    axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: this.formUpdate.containerPluginOutName, id: 0})
                    .then((resp) => { 
                        if(resp.data.length>0) {
                            console.log("isValidContainerPluginOutName tidak valid");
                            this.errormessage = "Nama Container Plugin Out sudah digunakan.";
                            this.isValidContainerPluginOutName = false;
                        } else{
                            console.log("isValidContainerPluginOutName valid");
                            this.errormessage = "";
                            this.isValidContainerPluginOutName = true;
                        }
                    })
                    .catch(errors => { console.error(errors); });
                    return this.isValidContainerPluginOutName;
                } else if(this.formUpdate.containerPluginOutName.length > 45) {
                    this.errormessage = "Nama Container Plugin Out tidak boleh lebih dari 45 karakter.";
                    return false;
                } else if(this.formUpdate.containerPluginOutName.length == 0 ) {
                    this.errormessage = "Nama Container Plugin Out tidak boleh kosong.";
                    return false;
                }
            } else {
                return true;
            }
        },
        containerPluginOutIdState() {
            console.log("containerPluginOutIdState: " + this.formUpdate.containerPluginOutId);
            if(this.isDuplicate) {
                if(this.formUpdate.containerPluginOutId.length > 0 && this.formUpdate.containerPluginOutId.length <= 10) {
                    axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: '', id: this.formUpdate.containerPluginOutId})
                    .then((resp) => { 
                        if(resp.data.length>0) {
                            console.log("isValidContainerPluginOutId tidak valid");
                            this.errormessage = "ID Container Plugin Out sudah digunakan.";
                            this.isValidContainerPluginOutId = false;
                        } else{
                            console.log("isValidContainerPluginOutId valid");
                            this.errormessage = "";
                            this.isValidContainerPluginOutId = true;
                        }
                    })
                    .catch(errors => { console.error(errors); });
                    return this.isValidContainerPluginOutId;
                } else if(this.formUpdate.containerPluginOutId.length > 10 ) {
                    this.errormessage = "ID Container Plugin Out tidak boleh lebih dari 10 karakter.";
                    return false;
                } else if(this.formUpdate.containerPluginOutId.length == 0 ) {
                    this.errormessage = "ID Container Plugin Out tidak boleh kosong.";
                    return false;
                }
            } else {
                return true;
            }
            
        },
        networkTypeState() {
            if(this.formUpdate.networkType.length > 32) {
                this.errormessage = "Network Type tidak boleh lebih dari 32 karakter.";
                return false;
            } else if(this.formUpdate.networkType.length == 0) {
                this.errormessage = "Network Type tidak boleh kosong.";
                return false;
            } else {
                this.errormessage = "";
                return true;
            }
        },
        commentsState() {
            if(this.isDuplicate) {
                if(this.formUpdate.comments.length > 256) {
                    this.errormessage = "Komentar tidak boleh lebih dari 256 karakter.";
                    return false;
                } else if(this.formUpdate.comments.length == 0) {
                    this.errormessage = "Network Type tidak boleh kosong.";
                    return false;
                } else {
                    this.errormessage = "";
                    return true;
                }
            } else {
                return true;
            }
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
        retreiveEditFormModal() {
            console.log("retreiveEditFormModal");
            console.log("action: " + this.action);
            // if(this.action=='Duplicate') {
            //     this.editFormModal.title = 'New Container Plugin';
            // } 
            // if(this.action=='Update') {
            //     this.editFormModal.title = 'Edit Container Plugin ID : ' + this.formUpdate.id;
            // }
        },
        resetEditFormModal() {
            console.log('resetEditFormModal');
            this.isDuplicate = false,
            this.formUpdate.id = '';
            this.formUpdate.extId = '';
            this.formUpdate.participantType = '';
            this.formUpdate.OldName = '';
            this.formUpdate.name = '';
            this.formUpdate.containerPluginName = '';
            this.formUpdate.containerPluginId = '';
            this.formUpdate.networkType = '';
            this.formUpdate.active = '';
            this.formUpdate.displayOnUI = '';
            this.formUpdate.comments = '';
            this.formUpdate.containerPluginOutName = '';
            this.formUpdate.containerPluginOutId = '';
            this.formUpdate.containerPluginId = '';
            this.errormessage = '';
            this.containerPluginAttrDatas = [];
            this.onlineConfigDatas = [];
            this.containerPlugins = '';
            this.containerPluginsOut = '';
        },
        duplicate(isDuplicate, data, tombol) {
            console.log('duplicate::::::::::::::::::::::::::');
            // this.infoModal.title = `Row index: ${index}`
            // this.infoModal.content = JSON.stringify(item, null, 2)

            this.datas = data;
            this.isDuplicate = isDuplicate;

            var id = data.item.id;
            this.formUpdate.extId = data.item.ext_id;
            this.formUpdate.participantType = data.item.participant_type;
            // this.formUpdate.OldName = data.item.name;
            this.formUpdate.name = data.item.name;
            this.formUpdate.containerPluginName = data.item.container_plugin_name;
            this.formUpdate.networkType = data.item.network_type;
            this.formUpdate.active = data.item.active;
            this.formUpdate.displayOnUI = data.item.display_on_ui;
            this.formUpdate.comments = data.item.comments;

            if(isDuplicate) {
                this.editFormModal.title = 'Duplicate dari Participant ID : ' + id;
                this.isDisabled = false;

                axios.post(this.picker,{ jenis: 'ContainerPluginDuplicate', parameter: this.formUpdate.containerPluginName})
                .then((resp) => { 
                    this.containerPlugins = resp.data;
                    this.formUpdate.containerPluginIn = resp.data[0].in_next_plugin;
                    this.formUpdate.containerPluginOutName = resp.data[0].out_next_plugin;
                    this.formUpdate.containerPluginIdOri = resp.data[0].id;
                    this.formUpdate.containerPluginOutIdOri = resp.data[0].outId;
                    console.log('ContainerPlugin length: ' + resp.data.length);
                    console.log('containerPluginIn: ' + this.formUpdate.containerPluginIn);
                    console.log('containerPluginOutName: ' + this.formUpdate.containerPluginOutName);
                    console.log('containerPluginIdOri: ' + this.formUpdate.containerPluginIdOri);
                    console.log('containerPluginOutIdOri: ' + this.formUpdate.containerPluginOutIdOri);
                    console.log('connectto: ' + this.containerPlugins[0].connectto_ipport);

                    axios.post(this.picker,{ jenis: 'ContainerPluginDuplicate', parameter: this.formUpdate.containerPluginOutName})
                        .then((resp) => {
                            this.containerPluginsOut = resp.data;
                            console.log('ContainerPluginOut length: ' + resp.data.length);
                        })
                        .catch(errors => { console.error(errors); });

                    axios.post(this.picker,{ jenis: 'ContainerPluginAttrDuplicate', parameter: this.formUpdate.containerPluginIdOri + ', ' + this.formUpdate.containerPluginOutIdOri})
                        .then((resp) => { 
                            console.log('ContainerPluginAttr length: ' + resp.data.length);
                            this.containerPluginAttrDatas = resp.data;
                        })
                        .catch(errors => { console.error(errors); });

                    
                    
                }).catch(errors => { console.error(errors); });
                var param = {  
                    "jenis": "OnlineConfigDuplicate",
                    "acqId": id,
                    "containerPluginName": "'"+this.formUpdate.containerPluginName+"'"
                    }
                axios.post(this.picker, param)
                    .then((resp) => { 
                        this.onlineConfigDatas = resp.data;
                        console.log('OnlineConfigDuplicate length: ' + resp.data.length);
                        // console.log('OnlineConfigId: ' + this.onlineConfigDatas[0].id);
                    })
                    .catch(errors => { console.error(errors); });

            } else {
                this.editFormModal.title = 'Edit Participant ID : ' + id;
                this.formUpdate.id = data.item.id;
                this.isDisabled = true;
            }

            this.$root.$emit('bv::show::modal', this.editFormModal.id, tombol);
        },
        handleOk(bvModalEvent){
            console.log('handleOk::::' + bvModalEvent);

            bvModalEvent.preventDefault()

            // Trigger submit handler
            this.handleSubmit()
        },
        handleSubmit() {
            console.log("handleSubmit: " + this.checkFormValidity());
            console.log("handleSubmit isValidId ::::::::::::::: " + this.isValidId);
            console.log('containerPluginId: ' + this.formUpdate.containerPluginId);
            console.log('containerPluginOutId: ' + this.formUpdate.containerPluginOutId);
            // this.notifBerhasil();
            
            if (!this.checkFormValidity()) {
                return
            } 
            if (!this.isValidId) {
                return
            }
            if(this.isDuplicate && this.formUpdate.containerPluginId == this.formUpdate.containerPluginOutId) {
                this.errormessage = "ID Container Plugin tidak boleh sama dengan ID Container Plugin Out";
                return
            }
            if(!this.isDuplicate) {
                this.auditUpdateParticipant();
                this.updateParticipant();
            }
            if(this.isDuplicate) {
                this.audit();
                this.addParticipant();
                if(this.containerPlugins.length > 0) this.addContainerPlugin(this.activitiesContainerPlugin);
                if(this.containerPluginsOut.length > 0) this.addContainerPlugin(this.activityContainerPluginCom);
                this.addContainerPluginAtt();
                this.addOnlineConfig();
            }
            this.notifBerhasil();
            this.onChange();
            this.$nextTick(() => {
            this.$bvModal.hide(this.editFormModal.id)
            })
         },
         addOnlineConfig(){
            console.log('addOnlineConfig');
            var participantId = this.formUpdate.id;
            var jumlah = this.onlineConfigDatas.length;
            var i = 0;
            while(jumlah > i) {
                var acqPartId = this.onlineConfigDatas[i].acq_participant_id;
                var issPartId = this.onlineConfigDatas[i].iss_participant_id;
                var pluginId = this.onlineConfigDatas[i].plugin_id;
                var containerPluginName = this.onlineConfigDatas[i].container_plugin_name;
                var keytype = this.onlineConfigDatas[i].key_type;
                var configKey = this.onlineConfigDatas[i].config_key;
                var configValue = this.onlineConfigDatas[i].config_value;
                containerPluginName = containerPluginName.replace(/\s+/g, '');
                if(containerPluginName.length > 0) {
                    containerPluginName = this.formUpdate.containerPluginName;
                } else {
                    acqPartId = this.formUpdate.id;
                }
                if(config_key.length > 0 && configKey == 'PARTICIPANT') issPartId = participantId;
                console.log('containerPluginName: ' + containerPluginName);
                console.log('acqPartId: ' + acqPartId);
                var activity = "Duplicate Online Config";
                var value = "INSERT INTO online_config VALUES (" + null + ", '"+acqPartId+"', '"+
                    issPartId+"', '"+pluginId+"', '"+containerPluginName+"', '" +keytype+"', '"+
                    configKey+"', '"+configValue+"') ;";
                console.log('value: ' + value);
                this.addAudit(activity, value);
                axios.post('/ecp/add', {jenis: "OnlineConfigAdd", value: value, database: this.selectedDatabase})
                    .then(resp=>{})
                    .catch(e=>{ console.log(error); });
                i++;
            }
         },
         addContainerPluginAtt(){
            var jumlah = this.containerPluginAttrDatas.length;
            var i = 0;
            while(jumlah > i) {
                var cpIdOri = this.formUpdate.containerPluginIdOri;
                var cpIdComOri = this.formUpdate.containerPluginOutIdOri;
                var participantId = this.formUpdate.id;

                var cpIdDuplicate = this.containerPluginAttrDatas[i].container_plugin_id;
                var fieldDuplicate = this.containerPluginAttrDatas[i].field;
                var contentDuplicate = this.containerPluginAttrDatas[i].content;
                
                var newCpId = '';

                if(cpIdDuplicate==cpIdOri){
                    newCpId = this.formUpdate.containerPluginId;
                } 
                if(cpIdDuplicate==cpIdComOri){
                    newCpId = this.formUpdate.containerPluginOutId;
                }
                if(fieldDuplicate=='PARTICIPANT') contentDuplicate = participantId;
                if(fieldDuplicate=='STAN') contentDuplicate = 0;
                if(fieldDuplicate=='TCP_PART_ACQ') contentDuplicate = participantId;
                
                console.log("replaced containerPluginId: " + newCpId);
                
                var activity = "Duplicate Container Plugin Attribut";
                var value = "INSERT INTO container_plugin_attr VALUES (" + null + ",'"+newCpId+"','" + fieldDuplicate+"','" +contentDuplicate+ "');";
                console.log("value: " + value);
                this.addAudit(activity, value);
                axios.post('/ecp/add', {jenis: "ContainerPluginAttrAdd", value: value, database: this.selectedDatabase})
                    .then(resp=>{})
                    .catch(e=>{ console.log(error); });
                i++;
            }
         },
         addParticipant() {
            var id = this.formUpdate.id;
            console.log("Add: " + id);
            var value = this.activitiesParticipant;
            axios.post('/ecp/add', {jenis: "ParticipantAdd", value: value, database: this.selectedDatabase})
                .then(resp=>{ })
                .catch(e=>{ console.log(error); });
        },
        notifBerhasil(){
            console.log('notifBerhasil: ' + this.formUpdate.id);
            axios.post(this.picker, {jenis: "Participant", id: this.formUpdate.id})
                .then(resp=>{ this.participantAdded = resp.data;})
                .catch(e=>{ console.log(error); });
            if(this.isDuplicate){
                this.infoModal.title = 'Participant berhasil di duplicate dengan detail sebagai berikut:';
                axios.post(this.picker, {jenis: "ContainerPlugin", id: this.formUpdate.containerPluginId, parameter:''})
                    .then(resp=>{ this.containerPluginAdded = resp.data;})
                    .catch(e=>{ console.log(error); });

                axios.post(this.picker, {jenis: "ContainerPlugin", id: this.formUpdate.containerPluginOutId, parameter:''})
                    .then(resp=>{ this.containerPluginComAdded = resp.data;})
                    .catch(e=>{ console.log(error); });

                    axios.post(this.picker, {jenis: "ContainerPluginAttrDuplicate", parameter: this.formUpdate.containerPluginId + ', ' + this.formUpdate.containerPluginOutId})
                    .then(resp=>{ this.containerPluginAttrAdded = resp.data;})
                    .catch(e=>{ console.log(error); });

                axios.post(this.picker, {jenis: "OnlineConfigDuplicate", acqId: this.formUpdate.id, containerPluginName: "'"+this.formUpdate.containerPluginName+"'"})
                    .then(resp=>{ this.onlineConfigAdded = resp.data;})
                    .catch(e=>{ console.log(error); });
            } else {
                this.infoModal.title = 'Participant berhasil di update';
            }
            
            this.$root.$emit('bv::show::modal', this.infoModal.id);
        },
        auditUpdateParticipant(){
            console.log('auditUpdateParticipant');
            var activity = "Update Participant";

            var activities = "UPDATE participant set name = '"+this.formUpdate.name+"', "+
                "participant_type = '"+this.formUpdate.participantType+"', "+
                "network_type = '"+this.formUpdate.networkType+"', " +
                "comments = '"+this.formUpdate.comments+"', "+
                "active = '"+this.formUpdate.active+"', "+
                "display_on_ui = '"+this.formUpdate.displayOnUI+"' "+
                "WHERE id = "+this.formUpdate.id+" ;";
            console.log("activities: " + activities);
            this.addAudit(activity, activities);
            this.activitiesUpdateParticipant = activities;
        },
        updateParticipant() {
            var id = this.formUpdate.id;
            console.log("updateParticipant: " + id);
            var value = this.activitiesUpdateParticipant;
            axios.post('/ecp/update', {jenis: "ParticipantUpdate", value: value, database: this.selectedDatabase})
            .then(resp=>{ 
                self.showNotification(); //shows notification of successful add
            })
            .catch(e=>{ console.log(error); });
        },
         audit(){
            console.log('audit');
            var activity = "Duplicate Participant";

            var activities = "INSERT INTO participant VALUES (" + this.formUpdate.id + ", '" + 
                this.formUpdate.extId + "', '" + 
                this.formUpdate.participantType + "', '" + 
                this.formUpdate.name + "', '" +
                this.formUpdate.containerPluginName + "', '" + 
                this.formUpdate.networkType + "', '" + 
                this.formUpdate.active + "', '" + 
                this.formUpdate.displayOnUI + "', '" + 
                this.formUpdate.comments + "');";

            this.activitiesParticipant = activities;
            
            console.log('activities: ' + activities);
            this.addAudit(activity, activities);
            if(this.containerPlugins.length > 0) this.addAuditContainerPlugin();
            if(this.containerPluginsOut.length > 0) this.addAuditContainerPluginCom();
        },
        addAuditContainerPlugin(){
            console.log('addAuditContainerPlugin');
            var activity = "Duplicate Container Plugin named: " + this.formUpdate.containerPluginName;
            var activities = "INSERT INTO container_plugin VALUES ('" +this.formUpdate.containerPluginId+"','" +
                this.containerPlugins[0].container_id+"','"+this.containerPlugins[0].plugin_id+"','"+
                this.formUpdate.containerPluginName+"','"+this.containerPlugins[0].state_startup+"','"+
                this.containerPlugins[0].port_listen+"','"+this.containerPlugins[0].cnt_instances+"','"+
                this.containerPlugins[0].in_next_plugin+"','"+this.formUpdate.containerPluginOutName+"','"+
                this.containerPlugins[0].connectto_ipport+"','"+this.containerPlugins[0].comments+"','"+
                this.containerPlugins[0].queue_threshold+"','"+
                this.containerPlugins[0].node_type+"','"+this.containerPlugins[0].startup_order+"','"+
                this.containerPlugins[0].flapping_ignore_time+"','"+this.containerPlugins[0].max_dynamic_instances+"','"+
                this.containerPlugins[0].dynamic_creation_mode+"','"+this.containerPlugins[0].response_timeout+"');";

            console.log('activity: ' + activity);
            console.log('activities: ' + activities);
            this.addAudit(activity, activities);
            console.log('     2nd activities: ' + activities);
            this.activityContainerPlugin = activity;
            this.activitiesContainerPlugin = activities;
        },
        addAuditContainerPluginCom(){
            console.log('addAuditContainerPluginCom');
            var activity = "Duplicate Container Plugin named: " + this.formUpdate.containerPluginOutName;
            var activities = "INSERT INTO container_plugin VALUES ('" +this.formUpdate.containerPluginOutId+"','"+
                this.containerPluginsOut[0].container_id+"','"+this.containerPluginsOut[0].plugin_id+"','"+
                this.formUpdate.containerPluginOutName+"','"+this.containerPluginsOut[0].state_startup+"','"+
                this.containerPluginsOut[0].port_listen+"','"+this.containerPluginsOut[0].cnt_instances+"','"+
                this.formUpdate.containerPluginName+"','','"+this.containerPluginsOut[0].connectto_ipport+"','"+
                this.containerPluginsOut[0].comments+"','"+this.containerPluginsOut[0].queue_threshold+"','"+
                this.containerPluginsOut[0].node_type+"','"+this.containerPluginsOut[0].startup_order+"','"+
                this.containerPluginsOut[0].flapping_ignore_time+"','"+this.containerPluginsOut[0].max_dynamic_instances+"','"+
                this.containerPluginsOut[0].dynamic_creation_mode+"','"+this.containerPluginsOut[0].response_timeout+"');";

            console.log('activity: ' + activity);
            console.log('activities: ' + activities);
            this.addAudit(activity, activities);
            console.log('     2nd activities: ' + activities);
            this.activityContainerPluginCom = activities;

        },
        addContainerPlugin(value){
            console.log('     addContainerPlugin: ' + value);
            var param = {  
                "jenis": "ContainerPluginAdd",
                "value": value,
                "database": this.selectedDatabase
            }
            axios.post('/ecp/add', param)
            .then(resp=>{ 
                self.showNotification(); //shows notification of successful add
            })
            .catch(e=>{ console.log(error); });
        },
        addAudit(activity, activities){
            console.log('     addAudit');
            var date = this.getCurrentDate();
            var time = this.getCurrentTime();
            console.log('                                        activities: ' + activities);
            var newActivities = activities.replace(/'/g,"");
            console.log('                                        newActivities: ' + newActivities);
            var param = {                             //Create the JSon
                "fullName": this.fullName,
                "menu": "Participant",
                "activityName": activity,
                "activities": newActivities,
                "datetime": date+" "+time,
                "database": this.selectedDatabase
            }
            axios.post('/ecp/audit', param)
            .then(resp=>{ 
                self.showNotification(); //shows notification of successful add
            })
            .catch(e=>{ console.log(error); });
        },
        getCurrentTime(){
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            return time;
        },
        getCurrentDate(){
            const date = new Date();
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let currentDate = `${year}-${month}-${day}`;
            return currentDate
        },
         checkFormValidity() {
            console.log("checkFormValidity");
            const valid = this.$refs.form.checkValidity();
            console.log("checkFormValidity valid: " + valid);
            if(!valid) {
                this.errormessage = "Mohon periksa field yang kosong.";
            }
            return valid
        },
        resetInfoModal() {
            this.infoModal.title = ''
            this.infoModal.content = ''
            this.participantAdded = ''
            this.containerPluginAdded = ''
            this.containerPluginComAdded = ''
            this.containerPluginAttAdded = ''
            this.onlineConfigAdded = ''
        },
        getMembers(){
            // let memberId = '';
            console.log('getMembers: ' + this.picker);
            axios.post(this.picker,{ jenis: 'Members', parameter: '' })
            .then((resp) => { 
                for(i=0;resp.data.length;i++) {
                    this.members.push(resp.data[i].memberId);
                }
                
            })
            .catch(errors => { 
                //console.error(errors); 
            });
        },
        retrieveData(){
            console.log('this.selectedDatabase::: ' + this.selectedDatabase);
            var member = this.selectedMember;
            axios.post(this.menu,{ jenis: 'Participant', member: member, limit: false})
            .then((resp) => { 
                this.items = resp.data;
                console.log("Size Items::::::::::: " + this.items.length);
            })
            .catch(errors => { console.error(errors); });;
        },
        // resetInfoModal() {
        //     this.containerPluginModal.title = ''
        //     this.containerPluginModal.content = ''
        // },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        getContainerPlugin(namaContainerPlugin, tombol) {
            console.log("info disini getContainerPlugin");
            this.containerPluginModal.title = namaContainerPlugin;
            axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: namaContainerPlugin, id: 0})
            .then((resp) => { 
                this.containerPluginModal.content = resp.data;
            })
            .catch(errors => { console.error(errors); });
            this.$root.$emit('bv::show::modal', this.containerPluginModal.id, tombol);
        },
        onChange(){
            console.log('onChange');
            this.database = [];
            this.checkMysql();
            this.retrieveData();
            
        },
        checkMysql(){
            // console.log("selectedDatabase: "  + this.selectedDatabase);
            var db = this.selectedDatabase;
            this.picker = '/ecp/picker';
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
        }
    }, 
}
</script>
