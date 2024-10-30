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
            <template #cell(actions)="row">
                <b-button size="sm" @click="duplicate(row, $event.target)" class="mr-1">
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
        <!-- cp modal -->
        <b-modal :id="containerPluginModal.id" :title="containerPluginModal.title" ok-only @hide="resetInfoModal">
            <pre>{{ containerPluginModal.content }}</pre>
        </b-modal>
        <!-- Info modal -->
        <b-modal :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetInfoModal">
            <pre>{{ infoModal.content }}</pre>
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
                                    required>
                                </b-form-input>
                                <!-- <span v-if="formUpdate.extId.length >= 4">The username must be at least 4 characters long.</span> -->
                            </b-col>
                        </b-row>
                        <b-row class="mb-1 text-right">
                            <b-col>Tipe Member</b-col>
                            <b-col>
                                <b-form-input type="text"
                                    v-model="formUpdate.participantType"
                                    placeholder="Masukan Tipe Member"
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
                id:'',
                extId:'',
                participantType:'',
                name:'',
                containerPluginName:'',
                networkType:'',
                active:'',
                displayOnUI:'',
                comments:''
                
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
            if(this.formUpdate.id.length > 0 && this.formUpdate.id > 0) {
                console.log('idState11111: ' + this.formUpdate.id);
                var ok = false;
                axios.post(this.picker,{ jenis: 'Participant', parameter: this.formUpdate.id })
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
        extIdState() {
            if(this.formUpdate.extId.length > 0 && this.formUpdate.extId.length > 3) {
                this.errormessage = "Ext ID tidak boleh lebih dari 3 karakter.";
                return false;
            } else {
                this.errormessage = "Ext ID tidak boleh kosong.";
                return true;
            }
        },
        participantTypeState() {
            if(this.formUpdate.participantType.length > 0 && this.formUpdate.extId.length > 10) {
                this.errormessage = "Jenis Member tidak boleh lebih dari 10 karakter.";
                return true;
            } else {
                this.errormessage = "Jenis Member tidak boleh kosong.";
                return false;
            }
        },
        nameState() {
            if(this.formUpdate.name.length > 0 && this.formUpdate.name.length > 45) {
                this.errormessage = "Nama Member tidak boleh lebih dari 45 karakter.";
                return true;
            } else {
                this.errormessage = "Nama Member tidak boleh kosong.";
                return false;
            }
        },
        containerPluginNameState() {
            if(this.formUpdate.containerPluginName.length > 0 && this.formUpdate.containerPluginName.length > 45) {
                this.errormessage = "Nama Container Plugin tidak boleh lebih dari 45 karakter.";
                return true;
            } else {
                this.errormessage = "Nama Container Plugin tidak boleh kosong.";
                return false;
            }
        },
        networkTypeState() {
            if(this.formUpdate.networkType.length > 0 && this.formUpdate.networkType.length > 32) {
                this.errormessage = "Network Type tidak boleh lebih dari 32 karakter.";
                return true;
            } else {
                this.errormessage = "Network Type tidak boleh kosong.";
                return false;
            }
        },
        commentsState() {
            if(this.formUpdate.comments.length > 0 && this.formUpdate.comments.length > 256) {
                this.errormessage = "Komentar tidak boleh lebih dari 256 karakter.";
                return true;
            } else {
                this.errormessage = "Komentar tidak boleh kosong.";
                return false;
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
            if(this.action=='Duplicate') {
                this.editFormModal.title = 'New Container Plugin';
            } 
            if(this.action=='Update') {
                this.editFormModal.title = 'Edit Container Plugin ID : ' + id;
            }
        },
        resetEditFormModal() {
            console.log('resetEditFormModal');
            this.formUpdate.id = '';
            this.formUpdate.extId = '';
            this.formUpdate.participantType = '';
            this.formUpdate.name = '';
            this.formUpdate.containerPluginName = '';
            this.formUpdate.networkType = '';
            this.formUpdate.active = '';
            this.formUpdate.displayOnUI = '';
            this.formUpdate.comments = '';
            this.errormessage = '';
        },
        duplicate(data, tombol) {
            // this.infoModal.title = `Row index: ${index}`
            // this.infoModal.content = JSON.stringify(item, null, 2)

            this.datas = data;
            // this.formUpdate.id = data.item.id;
            this.formUpdate.extId = data.item.ext_id;
            this.formUpdate.participantType = data.item.participant_type;
            this.formUpdate.name = data.item.name;
            this.formUpdate.containerPluginName = data.item.container_plugin_name;
            this.formUpdate.networkType = data.item.network_type;
            this.formUpdate.active = data.item.active;
            this.formUpdate.displayOnUI = data.item.display_on_ui;
            this.formUpdate.comments = data.item.comments;

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
            // const isId = this.checkAvailable(this.formUpdate.id);
            // console.log("isId: " + isId);
            if (!this.checkFormValidity()) {
                return
            } 
            if (!this.isValidId) {
                return
            } 
            else {
                this.audit();
                this.add();
            }
            // this.refresh();
            this.$nextTick(() => {
            this.$bvModal.hide(this.editFormModal.id)
            })
         },
         add() {
            var id = this.formUpdate.id;
            var extId = this.formUpdate.extId;
            var participantType = this.formUpdate.participantType;
            var name = this.formUpdate.name;
            var containerPluginName = this.formUpdate.containerPluginName;
            var networkType = this.formUpdate.networkType;
            var active = this.formUpdate.active;
            var displayOnUI = this.formUpdate.displayOnUI;
            var comments = this.formUpdate.comments;

            console.log("Add: " + id);
            var value = this.formUpdate.id + ", '" + 
                this.formUpdate.extId + "', '" + 
                this.formUpdate.participantType + "', '" + 
                this.formUpdate.name + "', '" +
                this.formUpdate.containerPluginName + "', '" + 
                this.formUpdate.networkType + "', '" + 
                this.formUpdate.active + "', '" + 
                this.formUpdate.displayOnUI + "', '" + 
                this.formUpdate.comments + "'";
            axios.post('/ecp/add', {jenis: "ParticipantAdd", value: value, database: this.selectedDatabase})
            .then(resp=>{ 
                self.showNotification(); //shows notification of successful add
            })
            .catch(e=>{ console.log(error); });
        },
         audit(){
            console.log('audit');
            var activity = "Duplicate Participant";
            var activities = "INSERT INTO participant VALUES (" + this.formUpdate.id + ", " + 
                this.formUpdate.extId + ", " + 
                this.formUpdate.participantType + ", " + 
                this.formUpdate.name + ", " +
                this.formUpdate.containerPluginName + ", " + 
                this.formUpdate.networkType + ", " + 
                this.formUpdate.active + ", " + 
                this.formUpdate.displayOnUI + ", " + 
                this.formUpdate.comments + ")";
            
            console.log('activities: ' + activities);
            this.addAudit(activity, activities);
        },
        addAudit(activity, activities){
            console.log('addAudit');
            var date = this.getCurrentDate();
            var time = this.getCurrentTime();
            var param = {                             //Create the JSon
                "fullName": this.fullName,
                "menu": "Participant",
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
         checkAvailable(id) {
            console.log("checkAvailable: " + id);
            // var isValidId = true;
            axios.post(this.picker,{ jenis: 'Participant', parameter: id })
                .then((resp) => {
                    if(resp.data.length>0) {
                        console.log("isValidId tidak valid");
                        this.isValidId = false;
                    } else{
                        console.log("isValidId valid");
                        this.isValidId = true;
                    }
                }).catch((error) => {
                    console.log(error);
                });
            console.log("checkAvailable isValidId " + this.isValidId);
            return this.isValidId;
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
        resetInfoModal() {
            this.containerPluginModal.title = ''
            this.containerPluginModal.content = ''
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        getContainerPlugin(namaContainerPlugin, tombol) {
            // console.log("info disini");
            this.containerPluginModal.title = namaContainerPlugin;
            axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: namaContainerPlugin})
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
