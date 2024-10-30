<template>
    <b-container fluid>
        <div>
            <p>Data will refresh in {{ formatCountdown(countdown) }}.</p>
        </div>
        <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;">
            <b-col cols="6" class="my-1">
                <b-form-group
                    label="Filter"
                    label-for="filter-input"
                    label-cols-sm="3"
                    label-align-sm="right"
                    label-size="sm"
                    class="mb-0">
                    <b-input-group size="sm">
                        <b-form-input
                            id="filter-input"
                            v-model="filter"
                            type="search"
                            placeholder="Ketik untuk mencari">
                        </b-form-input>
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
                    v-slot="{ ariaDescribedby }">
                    <b-form-checkbox-group
                        v-model="filterOn"
                        :aria-describedby="ariaDescribedby"
                        class="mt-1"
                    >
                        <b-form-checkbox value="id">ID</b-form-checkbox>
                        <b-form-checkbox value="namaAcq">Nama Acquirer</b-form-checkbox>
                        <b-form-checkbox value="rule">Rule</b-form-checkbox>
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
            <b-col sm="7" md="6" class="my-1">
                <b-form-group
                    label="Bin Part ID"
                    label-cols-lg="2"
                    label-align-sm="left"
                    label-size="sm"
                    class="mb-0"
                    >
                    <b-input-group size="sm">
                        <b-form-input type="text"
                            v-model="form.binPartId"
                            required
                            align="left"
                            v-on:change="cari()"
                            >
                        </b-form-input>
                        <b-input-group-append>
                            <b-button :disabled="!form.binPartId" @click="cari = ''">Cari</b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col sm="5" md="6" class="my-1">
                <b-form-group
                    label="Acquirer"
                    label-cols-sm="6"
                    label-cols-md="4"
                    label-cols-lg="3"
                    label-align-sm="right"
                    label-size="sm"
                    class="mb-0"
                    >
                    <b-input-group size="sm">
                        <b-form-select
                            v-model="selectedAcquirer"
                            :options="acquirers"
                            class="mb-3"
                            value-field="id"
                            text-field="concatName"
                            disabled-field="notEnabled"
                            required
                            v-on:change="onChange()">
                            <!--option v-for="project in acquirers" v-bind:value="project.id">
                            {{ project.id }} - {{ project.name }}
                            </option-->
                        </b-form-select>
                    </b-input-group>
                    <!-- <b-form-select v-model="selected" :options="options" size="sm" class="mt-3"></b-form-select> -->
                    <b-alert v-show="displayError" variant="danger" show class="error-Msg">
                            {{errormessage}}
                         </b-alert>
                    <!-- <div class="mt-3">Dipilih: <strong>{{ selectedAcquirer }}</strong></div> -->
                </b-form-group>
                <!--b-collapse id="nav-collapse" is-nav>
                    <b-nav-item-dropdown right v-show="keys">
                        <template #button-content>
                            <em>
                            <b-avatar size="1.8rem"></b-avatar>&nbsp;Gunawan
                        </em>
                        </template>
                        <b-dropdown-item href="#">Sign Out</b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-collapse-->
            </b-col>
            <b-col sm="7" md="6" class="my-1">
                <b-form-group
                    label="Bin Lower"
                    label-cols-lg="2"
                    label-align-sm="left"
                    label-size="sm"
                    class="mb-0"
                    >
                    <b-input-group size="sm">
                        <b-form-input type="text"
                            v-model="form.binLower"
                            required
                            align="left"
                            v-on:change="onChange()"
                            >
                        </b-form-input>
                    </b-input-group>
                </b-form-group>
            </b-col>
        </b-row>
        <b-navbar toggleable="lg" type="light" variant="info">
                <span class="fs-4">Routing ==> {{ totalRows }} Baris</span>
            </b-navbar>
        <b-table striped hover bordered responsive
            :items="items" 
            :fields="fields"
            :per-page="perPage"
            :current-page="currentPage"
            :filter="filter"
            :filter-included-fields="filterOn"
            stacked="md"
            show-empty
            small
            @filtered="onFiltered" >
            <template #cell(id)="data">
                <!-- `data.value` is the value after formatted by the Formatter -->
                <b-button variant="link" @click="getBinPart(data.value, $event.target)">{{ data.value }}</b-button>
            </template>
            <template #cell(namaContainerPlugin)="dataContainer">
                <!-- `data.value` is the value after formatted by the Formatter -->
                <b-button variant="link" @click="getContainer(dataContainer.value, $event.target)">{{ dataContainer.value }}</b-button>
            </template>
        </b-table>
        <b-modal :id="binPartModal.id" :title="binPartModal.title" ok-only @hide="resetBinPartModal">
            <pre>{{ binPartModal.content }}</pre>
        </b-modal>
        <b-modal :id="containerPluginModal.id" :title="containerPluginModal.title" ok-only @hide="resetContainerModal">
            <pre>{{ containerPluginModal.content }}</pre>
        </b-modal>
    </b-container>
</template>
<style scoped>

</style>
<script>
module.exports = {
    data() {
        return {
            perPage: 5,
            currentPage: 1,
            pageOptions: [5, 10, 15, { value: 100, text: "Show a lot" }],
            items: [ ],
            fields: [{
                    key: 'id', 
                    label: 'Bin Part ID',
                    sortable: true,
                    filterByFormatted: true
                },{
                    key: 'namaAcq', 
                    label: 'Nama Acquirer',
                    sortable: true,
                    filterByFormatted: true
                },
                {
                    key: 'binLower',
                    sortable: true
                },
                {
                    key: 'NamaGateway',
                    sortable: true
                },
                {
                    key: 'prioritas',
                    label: 'prioritas',
                    sortable: true
                },
                {
                    key: 'namaIssuer',
                    sortable: true
                },
                {
                    key: 'namaContainerPlugin',
                    sortable: true
                },
                {
                    key: 'keterangan',
                    sortable: true
                },
                {
                    key: 'rule',
                    sortable: true,
                    width: 10,
                    
                }
            ],
            filteredItems: [],
            filter: null,
            filterOn: [],
            binPartModal: {
                id: 'prioritas-modal',
                title: '',
                content: ''
            },
            acquirers: [''],
            selectedAcquirer: '',
            form: {
                binLower:null,
                binPartId:null
            },
            containerPluginModal: {
                id: 'container-modal',
                title: '',
                content: ''
            },
            selectedDatabase:'Lokal',
            database: [],
            // database:[
            //     'Lokal',
            //     'SIT',
            //     'UAT'
            // ],
            errormessage: '',
            picker: '/ecp/picker',
            menu: '/ecp/menu',
            list: [], // Your data
            timer: null, // Interval timer
            countdown: 30, // Initial countdown (5 minutes)
        }
    },
    created() {
        this.fetchEventsList(); // Initial data fetch
        this.timer = setInterval(this.updateCountdown, 1000); // Update countdown every second
    },
    mounted(){
        // this.retrieveData('', '', true, this.selectedDatabase);
        // this.totalRows = filteredItems.length;
        console.log('mounted');
        this.database = [];
        this.checkMysql();
        this.getAcquirers();
        // this.fetchDataFromServer();
        // setInterval(this.fetchDataFromServer, 60000); // Fetch data every minute (adjust the interval as needed)
        // console.log('interval setted');
    },
    computed: {
        totalRows() {
            return this.items.length
        },
        displayError(){
            if(this.errormessage!=''){ return true; }
            else { return false; }
        }
    },
    methods: {
        fetchEventsList() {
            console.log("fetchEventsList");
            // Your data-fetching logic (e.g., using this.$http.get)
            // Update this.list with the fetched data
            this.onChange();

        },
        updateCountdown() {
            if (this.countdown > 0) {
                this.countdown--; // Decrease countdown
            } else {
                this.fetchEventsList(); // Fetch data when countdown reaches zero
                this.countdown = 30; // Reset countdown to 5 minutes
            }
        },
        formatCountdown(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes} min ${remainingSeconds} sec`;
        },
        cancelAutoUpdate() {
            clearInterval(this.timer); // Clear the interval when
        },
        beforeUnmount() {
            this.cancelAutoUpdate(); // Clean up before unmounting
        },
        onChange(){
            console.log('onChange');
            this.database = [];
            this.checkMysql();
            
            this.acquirers = [''];
            this.getAcquirers();
            
            var acq = this.selectedAcquirer;
            var bin = this.form.binLower;
            // console.log('acq:::: ' + acq);
            // console.log('bin:::: ' + bin);
            if(acq == '' || acq == null){
                this.errormessage = 'Acquirer harus diisi';
            }
            if(bin == '' || bin == null){
                this.errormessage = 'Bin Lower harus diisi';
                bin = '';
            }
            // console.log('acq after:::: ' + acq);
            // console.log('bin after:::: ' + bin);
            if(acq >0 && bin.length >0){
                // console.log('gasken::::');
                this.errormessage = '';
                this.retrieveData(acq,bin);
            }
            
        },
        retrieveData(acquirer, binLower){
            var db = this.selectedDatabase;
            console.log("database: "  + db);
            axios.post(this.menu,{ jenis: 'Routing', acquirer: acquirer, binLower: binLower, limit: false })
            .then((resp) => { 
                this.items = resp.data;
            })
            .catch(errors => { console.error(errors); });;
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        getBinPart(id, tombol) {
            console.log("getBinPart: "  + this.picker);
            this.binPartModal.title = id;
            axios.post(this.picker,{ jenis: 'BinPart', parameter: id})
            .then((resp) => { 
                this.binPartModal.content = resp.data;
            })
            .catch(errors => { console.error(errors); });
            this.$root.$emit('bv::show::modal', this.binPartModal.id, tombol);
        },
        resetBinPartModal() {
            
        },
        getAcquirers(){
            axios.post(this.picker,{ jenis: 'Acquirer', parameter: '' })
            .then((resp) => {
                if(resp.data.length>0){
                    this.acquirers = resp.data;
                    console.log('acquirer concatName:::: ' + resp.data[0].id);
                }else{
                    this.errormessage = 'Koneksi ke Database error';
                }
                
            })
            .catch(errors => { console.error(errors);});
        },
        getContainer(namaContainerPlugin, tombol) {
            // console.log("info disini: " + namaContainerPlugin);
            this.checkMysql();
            console.log("picker " + this.picker);
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
        // dbChange(){
        //     this.acquirers = [''];
        //     this.getAcquirers();
        // },
        checkMysql(){
            // console.log("selectedDatabase: "  + this.selectedDatabase);
            // console.log("checkMysql::: " + this.database);
            var db = this.selectedDatabase;
            // this.picker = '/ecp/picker';
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
            this.database = [];
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
        cari() {
            console.log("disini: " + this.selectedAcquirer);
            var db = this.selectedDatabase;
            console.log("database: "  + db);
            console.log("binPartId: "  + this.form.binPartId);
            axios.post(this.menu,{ jenis: 'Routing', binPartId: this.form.binPartId, limit: false })
            .then((resp) => { 
                this.items = resp.data;
            })
            .catch(errors => { console.error(errors); });;
        },
    },
    
}
</script>
