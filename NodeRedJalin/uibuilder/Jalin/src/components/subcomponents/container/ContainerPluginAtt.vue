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
                        <b-form-checkbox value="namaContainerPlugin">Nama Container Plugin</b-form-checkbox>
                        <b-form-checkbox value="field">Atribut</b-form-checkbox>
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
        <!-- <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;"> -->
            <b-navbar toggleable="lg" type="light" variant="info">
                <span class="fs-4">Container Plugin Atribut ==> {{ totalRows }} Baris</span>
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
            <template #cell(namaContainerPlugin)="data">
                <b-button variant="link" @click="getContainer(data.value, $event.target)">{{ data.value }}</b-button>
            </template>
        </b-table>
        <b-modal :id="infoModal.id" :title="infoModal.title" ok-only>
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
            props: {keys: Object, configs: Object},
            perPage: 15,
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
                    key: 'container_plugin_id',
                    label: 'Container Plugin ID',
                    sortable: true
                },
                {
                    key: 'namaContainerPlugin',
                    label: 'Nama Container Plugin',
                    sortable: true
                },
                {
                    key: 'field',
                    label: 'Atribut',
                    sortable: true
                },
                {
                    key: 'content',
                    label: 'Nilai',
                    sortable: true
                },
            ],
            filter: null,
            filterOn: [],
            infoModal: {
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
            nameState: null,
        }
    },
    mounted(){
        console.log('mounted');
        this.database = [];
        this.checkMysql();
        this.retrieveData();
        // this.totalRows = this.filteredItems.length;
    },
    computed: {
        totalRows() {
            return this.items.length
        }
    },
    methods: {
        retrieveData(){
            console.log('retrieveData: ' + this.menu);
            console.log('container: ' + this.selectedContainer);
            axios.post(this.menu,{ jenis: 'ContainerPluginAtt', container_id: this.selectedContainer, limit: false })
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
            this.infoModal.title = namaContainerPlugin;
            axios.post(this.picker,{ jenis: 'ContainerPlugin', parameter: namaContainerPlugin})
            .then((resp) => { 
                this.infoModal.content = resp.data;
            })
            .catch(errors => { console.error(errors); });
            this.$root.$emit('bv::show::modal', this.infoModal.id, tombol);
        },
        resetContainerModal() {
            this.infoModal.title = ''
            this.infoModal.content = ''
        },
        onChange(){
            console.log('onChange');
            this.database = [];
            this.checkMysql();
            this.containers = [''];
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
