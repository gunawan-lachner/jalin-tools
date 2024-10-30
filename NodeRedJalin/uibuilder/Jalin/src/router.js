const Home = httpVueLoader('./components/subcomponents/home.vue');
const Form = httpVueLoader('./components/subcomponents/form.vue');
const Table = httpVueLoader('./components/subcomponents/table.vue');
const Chart = httpVueLoader('./components/subcomponents/chart.vue');
const IoT = httpVueLoader('./components/subcomponents/Monitoring.vue');

const Configurations = httpVueLoader('./components/subcomponents/Configurations.vue');
const RestartRen = httpVueLoader('./components/subcomponents/RestartRen.vue');

// trx
const Transaction = httpVueLoader('./components/subcomponents/trx/Transaction.vue');
const TransactionAttr = httpVueLoader('./components/subcomponents/trx/TransactionAttr.vue');
const TransactionChart = httpVueLoader('./components/subcomponents/trx/TransactionChart.vue');

// conf
const KeyType = httpVueLoader('./components/subcomponents/conf/KeyType.vue');
const MsgClass = httpVueLoader('./components/subcomponents/conf/MsgClass.vue');
const MsgType = httpVueLoader('./components/subcomponents/conf/MsgType.vue');
const NodeType = httpVueLoader('./components/subcomponents/conf/NodeType.vue');
const PanEntry = httpVueLoader('./components/subcomponents/conf/PanEntry.vue');
const PinEntry = httpVueLoader('./components/subcomponents/conf/PinEntry.vue');
const PluginStatus = httpVueLoader('./components/subcomponents/conf/PluginStatus.vue');
const StateType = httpVueLoader('./components/subcomponents/conf/StateType.vue');
const Conversion = httpVueLoader('./components/subcomponents/conf/Conversion.vue');

// routing
const Routing = httpVueLoader('./components/subcomponents/routing/Routing.vue');
const OnlineConfig = httpVueLoader('./components/subcomponents/routing/OnlineConfig.vue');
const BinGateway = httpVueLoader('./components/subcomponents/routing/BinGateway.vue');

// participant
const Participant = httpVueLoader('./components/subcomponents/participant/Participant.vue');
const BinParticipant = httpVueLoader('./components/subcomponents/participant/BinParticipant.vue');

// Container
const ContainerPlugin = httpVueLoader('./components/subcomponents/container/ContainerPlugin.vue');
const ContainerPluginAtt = httpVueLoader('./components/subcomponents/container/ContainerPluginAtt.vue');
const ContainerPluginInstance = httpVueLoader('./components/subcomponents/container/ContainerPluginInstance.vue');

export default {

    routes: [
        {
            path: '/',
            name: 'Home',
            components: Home
        },
        {
            path: '/iot',
            name: 'IoT',
            component: IoT
        },
        {
            path:'/home',
            name:'Home',
            component: Home
        },
        {
            path:'/form',
            name:'Form',
            component: Form
        },
        {
            path:'/table',
            name:'Table',
            component: Table
        },
        {
            path:'/chart',
            name:'Chart',
            component: Chart
        },
        {
            path:'/routing',
            name:'Routing',
            component: Routing
        },
        {
            path:'/binparticipant',
            name:'BinParticipant',
            component: BinParticipant
        },
        {
            path:'/participant',
            name:'Participant',
            component: Participant
        },
        {
            path:'/onlineconfig',
            name:'OnlineConfig',
            component: OnlineConfig
        },
        {
            path:'/containerPlugin',
            name:'ContainerPlugin',
            component: ContainerPlugin
        },
        {
            path:'/containerPluginAtt',
            name:'ContainerPluginAtt',
            component: ContainerPluginAtt
        },
        {
            path:'/containerPluginInstance',
            name:'ContainerPluginInstance',
            component: ContainerPluginInstance
        },
        {
            path:'/configurations',
            name:'Configurations',
            component: Configurations
        },
        {
            path:'/restartRen',
            name:'RestartRen',
            component: RestartRen
        },
        {
            path:'/transaction',
            name:'Transaction',
            component: Transaction
        },
        {
            path:'/transactionattr',
            name:'TransactionAttr',
            component: TransactionAttr
        },
        {
            path:'/transactionChart',
            name:'TransactionChart',
            component: TransactionChart
        },
        {
            path:'/keytype',
            name:'KeyType',
            component: KeyType
        },
        {
            path:'/msgclass',
            name:'MsgClass',
            component: MsgClass
        },
        {
            path:'/msgtype',
            name:'MsgType',
            component: MsgType
        },
        {
            path:'/nodetype',
            name:'NodeType',
            component: NodeType
        },
        {
            path:'/panentry',
            name:'PanEntry',
            component: PanEntry
        },
        {
            path:'/pinentry',
            name:'PinEntry',
            component: PinEntry
        },
        {
            path:'/pluginstatus',
            name:'PluginStatus',
            component: PluginStatus
        },
        {
            path:'/statetype',
            name:'StateType',
            component: StateType
        },
        {
            path:'/conversion',
            name:'Conversion',
            component: Conversion
        },
        {
            path:'/bingateway',
            name:'BinGateway',
            component: BinGateway
        },
    ],
};