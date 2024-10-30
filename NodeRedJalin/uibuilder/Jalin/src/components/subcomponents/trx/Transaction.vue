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
                        <b-form-checkbox value="Iss Name">Issuer</b-form-checkbox>
                        <b-form-checkbox value="Result">RC</b-form-checkbox>
                        <b-form-checkbox value="Term Id">Terminal ID</b-form-checkbox>
                        <b-form-checkbox value="UUID">UUID</b-form-checkbox>
                        <b-form-checkbox value="RRN">RRN</b-form-checkbox>
                        <b-form-checkbox value="Msg Type">MT</b-form-checkbox>
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
            <b-col class="my-1">RRN</b-col>
            <b-col></b-col>
        </b-row>
        <b-row>
            <b-col class="my-1">
                <b-form-datepicker v-model="date" @input="onChange()"></b-form-datepicker>
            </b-col>
            <b-col class="my-1">
                    <b-form-input type="text"
                        v-model="rrn"
                        required
                        align="left"
                        v-on:change="onChange()"
                        >
                    </b-form-input>
            </b-col>
            <b-col>
                <b-input-group-append>
                    <b-button :disabled="!rrn" @click="onChange = ''">Cari</b-button>
                </b-input-group-append>
            </b-col>
        </b-row>
        <!-- <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;"> -->
            <b-navbar toggleable="lg" type="light" variant="info">
                <span class="fs-4">Transaksi ==> {{ totalRows }} Baris</span>
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
            <template #cell(Trx_ID)="data">
                <b-button variant="link" @click="getTrx(data.value, $event.target)">{{ data.value }}</b-button>
            </template>
            <template #cell(TrxID)="data">
                <b-button variant="link" @click="getTrxAttByTrxId(data.value, $event.target)">{{ data.value }}</b-button>
            </template>
            <template #cell(actions)="data">
                <b-button size="sm" @click="cekRouting(data.item, $event.target)" class="mr-1">
                Cek Routingan
                </b-button>
            </template>
        </b-table>
        <!-- Info modal -->
        <b-modal :id="infoModal.id" scrollable :title="infoModal.title" ok-only @hide="resetInfoModal">
            <pre>{{ infoModal.content }}</pre>
        </b-modal>
        <b-modal size="xl" :id="infoRouting.id" scrollable :title="infoModal.title" ok-only @hide="resetInfoModal">
            <!-- <b-row>
                <b-col><pre>{{ infoModal.iia }}</pre></b-col>
            </b-row> -->
            <b-table striped hover 
                :items="infoRouting.content" 
                :fields="infoRouting.fields"
                :filter="filter"
                :filter-included-fields="filterOn"
                stacked="md"
                show-empty
                small
                @filtered="onFiltered">
            </b-table>
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
                    key: 'Trx_ID',
                    label: 'ID',
                    sortable: true
                },
                {
                    key: 'Acq Name',
                    label: 'Acquirer',
                    sortable: true
                },
                // {
                //     key: 'Principal Code',
                //     label: 'Kode Principal',
                //     sortable: true
                // },
                {
                    key: 'Iss Name',
                    label: 'Routing Participant',
                    sortable: true
                },
                // {
                //     key: 'Msg Class',
                //      label: 'Msg Class',
                //      sortable: true
                //  },
                {
                    key: 'Class Desc',
                    label: 'Ket Class',
                    sortable: true
                },
                {
                    key: 'Msg_Type',
                    label: 'MT',
                    sortable: true
                },
                // {
                //     key: 'Type Desc',
                //     label: 'Type Desc',
                //     sortable: true
                // },
                {
                    key: 'Result',
                    label: 'RC',
                    sortable: true
                },
                {
                    key: 'RRN',
                    label: 'RRN',
                    sortable: true
                },
                {
                    key: 'Amount',
                    label: 'Nominal',
                    sortable: true
                },
                // {
                //     key: 'Product',
                //     label: 'Produk',
                //     sortable: true
                // },
                // {
                //     key: 'Sub Product',
                //     label: 'Sub Produk',
                //     sortable: true
                // },
                {
                    key: 'Category',
                    label: 'Kategori',
                    sortable: true
                },
                {
                    key: 'DATE',
                    label: 'Tanggal',
                    sortable: true
                },
                {
                    key: 'Term Id',
                    label: 'TID',
                    sortable: true
                },
                {
                    key: 'UUID',
                    label: 'UUID',
                    sortable: true
                },
                // {
                //     key: 'Reff UUID',
                //     label: 'Reff UUID',
                //     sortable: true
                // },
                {
                    key: 'TrxID',
                    label: 'Trx Atribut',
                    sortable: true
                },
                { key: 'actions', label: 'Actions' }
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
            database: [],
            picker: '/ecp/picker',
            menu: '/ecp/menu',
            filteredItems: [],
            date: '',
            rrn: '',
            kolom: [],
            countdown: 30, // Initial countdown (5 minutes)
            selectedTime:'30',
            refreshTime: ['30','60','90'],
            isHidden: false,
            infoRouting: {
                id: 'info-routing',
                title: '',
                content: [],
                iia: '',
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
            },
            stop: false,
        }
    },
    created() {
        this.fetchEventsList(); // Initial data fetch
        this.timer = setInterval(this.updateCountdown, 1000); // Update countdown every second
    },
    mounted(){
        console.log('mounted Transaction');
        this.date =  this.getCurrentDate();
        // this.database = [''];
        // this.checkMysql();
        this.retrieveData();
        // this.totalRows = filteredItems.length;
    },
    computed: {
        totalRows() {
            return this.items.length;
        }
    },
    methods: {
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
        cekRouting(item, tombol) {
            var trxId = item.Trx_ID;
            var mt = item.Msg_Type;
            var prefix = "";
            var acqId = "";
            var acqName = '';
            var issId = '';
            var issBid = '';
            var acqBid = '';
            var bid = '';
            var iia = '';
            console.log("cekRouting");
            console.log("item: " + trxId);
            
            axios.post(this.picker,{ jenis: 'TrxAttr', parameter: trxId})
                .then((resp) => { 
                    // this.infoModal.content = resp.data;
                    resp.data.forEach(element => {
                        let field = element.field;
                        // console.log('element content: ' + field);
                        if(field == undefined) {
                            console.log('undefined content: ' + field);
                        } else {
                            // console.log('field: ' + field);
                            // console.log('content: ' + element.content);
                            if(field == 'IN.PAN_PREFIX') {
                                if(element.content != '') {
                                    prefix = element.content;
                                }
                            }
                            if(field == 'IN.PARTACQ') {
                                if(element.content != '') {
                                    acqId = element.content;
                                    if(acqId == '1702') {
                                        acqName = 'BNI';
                                    }
                                    if(acqId == '1703') {
                                        acqName = 'BTN';
                                    }
                                    if(acqId == '1704') {
                                        acqName = 'MANDIRI';
                                    }
                                    if(acqId == '1705') {
                                        acqName = 'BRI';
                                    }
                                }
                            }
                            if(field == 'IN.PARTISS') {
                                issId = element.content;
                            }
                            if(field == 'IN.ISSBID') {
                                issBid = ', Issuer Bid: ' + element.content;
                            }
                            if(field == 'IN.ACQBID') {
                                acqBid = ', Acquirer Bid: ' + element.content;
                            }
                            if(field == 'IN.BID') {
                                bid = ', Bid: ' + element.content;
                            }
                            if(field == 'IN.IIA') {
                                if(element.content == '1') {
                                    iia = 'Issuer Approach';
                                } else {
                                    iia = 'Acquirer Approach';
                                }
                            }
                        }

                    });
                    // console.log("prefix: " + prefix);
                    console.log("iia: " + iia);
                    var db = this.selectedDatabase;
                    console.log("database: "  + db);
                    this.infoModal.title = 'ID Transaksi: ' + trxId + ', MT: ' + mt + ', Acquirer: ' + acqId + ' (' + acqName + '), Issuer: ' + 
                        issId + ', Prefix: ' + prefix + issBid + acqBid + bid + ', Type: ' + iia;
                    // this.infoModal.iia = iia;
                    axios.post(this.picker,{ jenis: 'Routing', acquirer: acqId, binLower: prefix, limit: false })
                    .then((resp) => { 
                        // this.items = resp.data;
                        this.infoRouting.content = resp.data;
                        console.log("DATA: " + this.infoRouting.content);
                        this.infoRouting.content.forEach(element => {
                            var rule = element.rule;
                            // console.log('rule: ' + rule);
                        });
                    })
                    .catch(errors => { console.error(errors); });                    
                })
                .catch(errors => { console.error(errors); });

            // console.log("prefix:::::::::::::::::::::::: " + prefix);
            // console.log("acqId:::::::::::::::::::::::: " + acqId);
            this.$root.$emit('bv::show::modal', this.infoRouting.id, tombol);
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
        getTrxAttByTrxId(TrxID, tombol) {
            // console.log("info disini");
            this.infoModal.title = 'Transaksi Atribut dengan TrxID: ' + TrxID;
            this.infoModal.content = '';
            this.kolom = [];
            // let containerplugin =
                axios.post(this.picker,{ jenis: 'TrxAttr', parameter: TrxID})
                .then((resp) => { 
                    this.infoModal.content = resp.data;
                    this.infoModal.content.forEach(element => {
                        var kol = element.Kolom;
                        console.log('element Kolom: ' + kol);
                        if(kol == undefined) {
                            console.log('undefined Kolom: ' + kol);
                        }
                        // if(kol.length > 0 || kol != null) {
                            this.kolom.push(element.Kolom);
                            // console.log('element Kolom: ' + element.Kolom);
                        // }
                    });
                    this.infoModal.content = this.kolom;
                })
                .catch(errors => { console.error(errors); });;
            // this.infoModal.content = aturan;
            this.$root.$emit('bv::show::modal', this.infoModal.id, tombol);
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
            var vRrn = this.rrn;
            axios.post(this.menu,{ jenis: 'Transaction', limit: false, date: vDate, rrn: vRrn })
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
            // console.log("selectedDatabase: "  + this.selectedDatabase);
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
