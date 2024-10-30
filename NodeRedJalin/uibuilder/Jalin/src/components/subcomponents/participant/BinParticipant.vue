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
                        <b-form-checkbox value="acqName">Acquirer</b-form-checkbox>
                        <b-form-checkbox value="isName ">Issuer</b-form-checkbox>
                        <b-form-checkbox value="gwName">Nama Gateway</b-form-checkbox>
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
            
        </b-row>
        <b-row>
            <b-col class="my-1">ID</b-col>
            <b-col class="my-1">Keterangan</b-col>
            <b-col></b-col>
        </b-row>
        <b-row>
            <b-col class="my-1">
                <b-form-input type="text"
                    v-model="form.id"
                    required
                    align="left"
                    v-on:change="retrieveData(false)"
                    >
                </b-form-input>
            </b-col>
            <b-col class="my-1">
                    <b-form-input type="text"
                        v-model="form.keterangan"
                        required
                        align="left"
                        v-on:change="retrieveData(false)"
                        >
                    </b-form-input>
            </b-col>
            <b-col>
                <b-input-group-append>
                    <b-button :disabled="!form.id || form.keterangan" @click="onChange = ''">Cari</b-button>
                </b-input-group-append>
            </b-col>
        </b-row>
        <b-navbar toggleable="lg" type="light" variant="info">
                <span class="fs-4">Bin Participant ==> {{ totalRows }} Baris</span>
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
            <template #cell(rule)="data">
                <!-- `data.value` is the value after formatted by the Formatter -->
                <b-button variant="link" @click="info(data.index, data.value, $event.target)">{{ data.value }}</b-button>
                <!-- <a :href="'#${info()}'">{{ data.value }}</a> -->
            </template>
        </b-table>
        <!-- Info modal -->
        <b-modal :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetInfoModal">
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
            pageOptions: [5, 10, 15, { value: 100, text: "Show a lot" }],
            items: [ ],
            fields: [
                {
                    key: 'id',
                    label: 'ID',
                    sortable: true
                },{
                    key: 'acqName',
                    label: 'Acquirer',
                    sortable: true
                },
                {
                    key: 'gwName',
                    label: 'Nama Gateway',
                    sortable: true
                },
                {
                    key: 'priority',
                    label: 'Priotitas',
                    sortable: true
                },
                {
                    key: 'isName',
                    label: 'Issuer',
                    sortable: true
                },
                {
                    key: 'ip.container_plugin_name',
                    label: 'Nama Container',
                    sortable: true
                },
                {
                    key: 'rule',
                    sortable: true
                },
                {
                    key: 'description',
                    label: 'Keterangan',
                    sortable: true,
                    filterByFormatted: true
                }
            ],
            filter: null,
            filterOn: [],
            filteredItems: 0,
            infoModal: {
                id: 'info-modal',
                title: '',
                content: ''
            },
            selectedDatabase:'Lokal',
            database: [],
            picker: '/ecp/picker',
            menu: '/ecp/menu',
            form: {
                id:'',
                description:'',
            },
        }
    },
    mounted(){
        console.log('mounted');
        this.database = [];
        this.checkMysql();
        this.retrieveData(true);
        // this.totalRows = filteredItems.length;
    },
    computed: {
      totalRows() {
        return this.items.length
      }
    },
    methods: {
        onChange(){
            console.log('onChange');
            this.database = [];
            this.checkMysql();
            this.retrieveData(false);            
        },
        retrieveData(limit){
            var binPartId = this.form.id;
            var keterangan = this.form.keterangan;
            axios.post(this.menu,{ jenis: 'BinParticipant', binPartId: binPartId, limit: limit, keterangan: keterangan })
            .then((resp) => { 
                this.items = resp.data;
            })
            .catch(errors => { console.error(errors); });;
        },
        info(index, rule, button) {
            // judul = 'Rule Nomor: ${index+1} ' + '\n'
            // judul += '\n' + rule
            this.infoModal.title = rule
            let aturan = ''
            if(rule.match('IN.ACQUIRER_ID')) {
                aturan += 'ACQ ID'
            }
            if(rule.match('IN.MT == 22')) {
                aturan += 'Transfer Inquiry\n'
            }
            if(rule.match('IN.LEG_NR < 2')) {
                aturan += 'Leg kurang dari 2\n'
            }
            if(rule.match('IN.TRANSFER_INDICATOR==2')){
                aturan += ''
            }
            if(rule.match('IN.BID')){
                aturan += ''
            }
            this.infoModal.content = aturan
            this.$root.$emit('bv::show::modal', this.infoModal.id, button)
        },
        resetInfoModal() {
            this.infoModal.title = ''
            this.infoModal.content = ''
        },
        onFiltered(filteredItems) {
            // Trigger pagination to update the number of buttons/pages due to filtering
            console.log('filteredItems.length: ' + filteredItems.length);
            this.totalRows = filteredItems.length;
            this.currentPage = 1;
        },
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
