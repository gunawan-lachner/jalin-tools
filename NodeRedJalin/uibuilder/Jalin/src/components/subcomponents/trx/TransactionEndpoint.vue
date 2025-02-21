<template>
    <b-container fluid>
        <b-row>
            <b-col>
                <p>Data will refresh in {{ formatCountdown(countdown) }}.</p>
            </b-col>
            <b-col></b-col>
        </b-row>
        <b-row>
            <b-col class="my-1">
                <b-form-select v-model="selectedTime" 
                        size="sm"  
                        :options="refreshTime"
                        v-on:change="onChange()">
                    </b-form-select>
            </b-col>
            <b-col>
                <b-input-group-append>
                    <b-button @click="onChange()">Refresh</b-button>
                    <b-button size="sm" @click="refresh(stop)">
                        {{ stop ? 'Resume' : 'Stop' }}
                    </b-button>
                </b-input-group-append>
                <b-input-group-append>
                    
                </b-input-group-append>
            </b-col>
            <b-col></b-col>
            <b-col></b-col>
            <b-col></b-col>
        </b-row>
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
                        <b-form-checkbox value="participant">Participant</b-form-checkbox>
                        <b-form-checkbox value="uuid">UUID</b-form-checkbox>
                        <b-form-checkbox value="message">Message</b-form-checkbox>
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
        </b-row>
        <b-row>
            <b-col class="my-1">Tanggal</b-col>
            <!-- <b-col class="my-1">UUID</b-col> -->
            <b-col></b-col>
        </b-row>
        <b-row>
            <b-col class="my-1">
                <b-form-datepicker v-model="date" @input="onChange()"></b-form-datepicker>
            </b-col>
            <b-col class="my-1">
                    <b-form-input type="text"
                        v-model="uuid"
                        required
                        align="left"
                        v-on:change="onChange()"
                        >
                    </b-form-input>
            </b-col>
            <b-col>
                <!-- <b-input-group-append>
                    <b-button :disabled="!rrn" @click="onChange = ''">Cari</b-button>
                </b-input-group-append> -->
            </b-col>
        </b-row>
        <!-- <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;"> -->
            <b-navbar toggleable="lg" type="light" variant="info">
                <span class="fs-4">Transaksi Endpoint ==> {{ totalRows }} Baris</span>
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
        </b-table>
        <!-- Info modal -->
        <b-modal :id="infoModal.id" scrollable :title="infoModal.title" ok-only @hide="resetInfoModal">
            <pre>{{ infoModal.content }}</pre>
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
            // currentPage: this.$route.query.offset !== 0 ? (this.$route.query.offset / 18) + 1 : 1,
            // totalRows: 0,
            pageOptions: [5, 10, 15, { value: 100, text: "Show a lot" }],
            items: [ ],
            fields: [
                {
                    key: 'id', 
                    label: 'ID',
                    sortable: true,
                    filterByFormatted: true, 
                    editable: true
                },
                {
                    key: 'uuid', 
                    label: 'UUID',
                    sortable: true,
                    filterByFormatted: true, 
                    editable: true
                },
                {
                    key: 'dt', 
                    label: 'Tanggal',
                    sortable: true,
                    filterByFormatted: true, 
                    editable: true
                },
                {
                    key: 'msg_direction', 
                    label: 'Msg Direction',
                    sortable: true,
                    filterByFormatted: true, 
                    editable: true
                },
                {
                    key: 'request_response', 
                    label: 'Jenis Msg',
                    sortable: true,
                    filterByFormatted: true, 
                    editable: true
                },
                {
                    key: 'participant', 
                    label: 'Participant',
                    sortable: true,
                    filterByFormatted: true, 
                    editable: true
                },
                {
                    key: 'message', 
                    label: 'Message',
                    sortable: true,
                    filterByFormatted: true, 
                    editable: true
                },
                {
                    key: 'state', 
                    label: 'State',
                    sortable: true,
                    filterByFormatted: true, 
                    editable: true
                },
                {
                    key: 'worker_id', 
                    label: 'worker_id',
                    sortable: true,
                    filterByFormatted: true, 
                    editable: true
                }
            ],
            filter: null,
            filterOn: [],
            infoModal: {
                id: 'info-modal',
                title: '',
                content: '',
                iia: '',
            },
            selectedDatabase:'SIT',
            database: ['SIT', 'UAT', 'PROD'],
            picker: '/ecp/picker',
            menu: '/ecp/menu',
            filteredItems: [],
            date: '',
            uuid: '',
            kolom: [],
            countdown: 30, // Initial countdown (5 minutes)
            selectedTime:'30',
            refreshTime: ['30','60','90'],
            isHidden: false,
            stop: false,
        }
    },
    created() {
        this.fetchEventsList(); // Initial data fetch
        this.timer = setInterval(this.updateCountdown, 1000); // Update countdown every second
    },
    mounted(){
        console.log('mounted Transaction Endpoint');
        this.date =  this.getCurrentDate();
        // this.database = [''];
        // this.checkMysql();
        this.retrieveData();
        // this.totalRows = filteredItems.length;
    },
    computed: {
        totalRows() {
            return this.items.length;
        },
        editableFields() {
            return this.infoRouting.fields.filter(field => { return field.editable === true })
        }
    },
    methods: {
        doEdit() {
            console.log('doEdit');
        },
        refresh(isStop){
            console.log('refresh: ' + isStop);
            if(!isStop) {
                this.stop = true;
                this.stopTimer();
            }else{
                this.stop = false;
                this.resumeTimer();
            }
            return this.stop;
        },
        stopTimer(){
            clearInterval(this.timer);
        },
        resumeTimer(){
            this.timer = setInterval(this.updateCountdown, 1000);
        },
        formatCountdown(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes} min ${remainingSeconds} sec`;
        },
        updateCountdown() {
            if (this.countdown > 0) {
                this.countdown--; // Decrease countdown
            // } if (this.countdown == 'Stop') {
            //     clearInterval(this.timer); 
            } else {
                this.fetchEventsList(); // Fetch data when countdown reaches zero
            }
        },
        fetchEventsList() {
            console.log("fetchEventsList");
            // Your data-fetching logic (e.g., using this.$http.get)
            // Update this.list with the fetched data
            this.onChange();

        },
        getTrx(Trx_ID, tombol) {
            // console.log("info disini");
            this.infoModal.title = 'ID Transksi: ' + Trx_ID;
            // let containerplugin =
                axios.post(this.picker,{ jenis: 'Transaction', parameter: Trx_ID})
                .then((resp) => { 
                    this.infoModal.content = resp.data;
                })
                .catch(errors => { console.error(errors); });
            // this.infoModal.content = aturan;
            this.$root.$emit('bv::show::modal', this.infoModal.id, tombol);
        },
        getTrxEndpoint(uuid, tombol) {
            console.log("getTrxEndpoint");
            this.infoModal.title = 'UUID: ' + uuid;
                axios.post(this.picker,{ jenis: 'TrxEndpoint', parameter: uuid})
                .then((resp) => { 
                    this.infoTrxEndpoint.content = resp.data;
                })
                .catch(errors => { console.error(errors); });
            this.$root.$emit('bv::show::modal', this.infoTrxEndpoint.id, tombol);
        },
        getCurrentDate(){
            const date = new Date();
            let day = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
            let month = ((date.getMonth() + 1) > 9 ? '' : '0') + (date.getMonth() + 1);
            let year = date.getFullYear();
            let currentDate = `${year}-${month}-${day}`;
            console.log("info currentDate: " + currentDate);
            // let currentDate = "" + date.getFullYear() + ((date.getMonth() + 1) > 9 ? '' : '0') + (date.getMonth() + 1) + (date.getDate() > 9 ? '' : '0') + date.getDate();
            return currentDate
        },
        retrieveData(){
            var vDate = this.date;
            var vUuid = this.uuid;
            axios.post(this.menu,{ jenis: 'TransactionEndpoint', limit: true, date: vDate, uuid: vUuid })
            .then((resp) => { 
                this.items = resp.data;
            })
            .catch(errors => { console.error(errors); });;
        },
        resetInfoModal() {
            this.infoModal.title = ''
            this.infoModal.content = ''
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            this.totalRows = filteredItems.length
            this.currentPage = 1
        },
        info(namaContainerPlugin, tombol) {
            // console.log("info disini");
            this.infoModal.title = namaContainerPlugin;
            axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: namaContainerPlugin})
            .then((resp) => { 
                this.infoModal.content = resp.data;
            })
            .catch(errors => { console.error(errors); });
            this.$root.$emit('bv::show::modal', this.infoModal.id, tombol);
        },
        onChange(){
            console.log('onChange::::::::::::: ' + this.date);
            
            this.checkMysql();
            // this.date = this.getCurrentDate();
            this.countdown = this.selectedTime; // Reset countdown
            this.retrieveData();
            
        },
        checkMysql(){
            console.log("selectedDatabase: "  + this.selectedDatabase);
            // this.database = null;
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
            }
            if(db=='UAT'){
                this.picker = '/ecp/pickerUat';
                this.menu = '/ecp/menuUat';
                console.log("database: UAT");
            }
            if(db=='WLA'){
                this.picker = '/ecp/pickerWla';
                this.menu = '/ecp/menuWla';
                console.log("database: WLA");
            }
            if(db=='STG'){
                this.picker = '/ecp/pickerStg';
                this.menu = '/ecp/menuStg';
                console.log("database: STG");
            }
            if(db=='PROD'){
                this.picker = '/ecp/pickerProd';
                this.menu = '/ecp/menuProd';
                console.log("database: PROD");
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
                    stg = resp.data[0].stg;
                    prod = resp.data[0].prod;
                    // console.log('Lokal:::: ' + lokal);
                    // console.log('SIT:::::: ' + sit);
                    // console.log('UAT:::::: '+ uat);
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
                    if(stg){
                        this.database.push('STG');
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
