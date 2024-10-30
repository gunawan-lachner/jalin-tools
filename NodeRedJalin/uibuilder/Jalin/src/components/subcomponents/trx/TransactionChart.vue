<template>
    <b-row style="margin-top:5%;margin-left:5%;margin-right:5%;">
        <b-col cols="9">
            <canvas ref="mycanvas" width="850" height="450"></canvas>
        </b-col>
        <b-col cols="3">
            <canvas ref="mycanvas2"></canvas>
        </b-col>
    </b-row>
    
</template>
<style scoped>

</style>
<script>
module.exports = {
    data() {
        return {
            itemslist:[],  //Holds items retrieved from database
            menu: '/ecp/menu',
        };
    },
    mounted(){
        this.getItems();
    },
    methods: {

        //Gets items from database
        getItems(){
            
            //creates the get request 
            axios.post(this.menu,{ jenis: 'TransactionChart', limit: true })
            .then((resp) => { 
                
                var grandTotal = 0; //Total expenses of the year 2019
                
                var monthTotal = {  //Used for monthly total
                    '1':0,
                    '2':0,
                    '3':0,
                    '4':0,
                    '5':0,
                    '6':0,
                    '7':0,
                    '8':0,
                    '9':0,
                    '10':0,
                    '11':0,
                    '12':0
                };

                //Used to create the datasets
                var berhasil = {
                    items:[],
                    sum:0,
                    percent:0
                };
                
                var gagal = {
                    items:[],
                    sum:0,
                    percent:0

                };
                //Used to create the datasets


                this.itemslist = resp.data;
                
                //Loop on each row and compute sum
                this.itemslist.forEach(elem=>{
                    console.log('id: ' + elem.id);
                    console.log('result: ' + elem.result);
                    console.log('amount: ' + elem.amount);
                    switch(elem.result){
                        case '0':
                            berhasil.items.push(elem.amount);
                            berhasil.sum += elem.amount;
                            break;
                        case '999999999':
                            gagal.items.push(elem.amount);
                            gagal.sum += elem.amount;
                            break;     
                    }

                    //Sum per month
                    console.log('elem.dt: ' + elem.dt);
                    switch(elem.dt){
                        case '2021-03-30T23:50:24.000Z':
                            monthTotal['1'] += elem.amount;
                            console.log('2021-03-31 06:50:24.000');
                            break;
                        case 'Feb':
                            monthTotal['2'] += elem.amount;
                            break;
                        case 'Mar':
                            monthTotal['3'] += elem.amount;
                            break;
                        case 'Apr':
                            monthTotal['4'] += elem.amount;
                            break;
                        case 'May':
                            monthTotal['5'] += elem.amount;
                            break;
                        case 'Jun':
                            monthTotal['6'] += elem.amount;
                            break;
                        case 'Jul':
                            monthTotal['7'] += elem.amount;
                            break;
                        case 'Aug':
                            monthTotal['8'] += elem.amount;
                            break;
                        case 'Sep':
                            monthTotal['9'] += elem.amount;
                            break;
                        case 'Oct':
                            monthTotal['10'] += elem.amount;
                            break;
                        case 'Nov':
                            monthTotal['11'] += elem.amount;
                            break;
                        case 'Dec':
                            monthTotal['12'] += elem.amount;
                            break;                                
                    }    


                    //Grand total
                    grandTotal+= elem.amount;
                });
                
                //Format to 2 decimal places
                grandTotal = grandTotal.toFixed(2);  

                berhasil.sum = berhasil.sum.toFixed(2);
                gagal.sum = gagal.sum.toFixed(2);
                console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT: ' + berhasil.sum);

                berhasil.percent = ((berhasil.sum/grandTotal)*100).toFixed(2);
                gagal.percent = ((gagal.sum/grandTotal)*100).toFixed(2);
                console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAA: ' + gagal.percent);

                //Format to 2 decimal places

                //Format to more readable json
                var formatted = {
                    'berhasil':berhasil,
                    'gagal':gagal,
                    'monthly':monthTotal
                }

                //Call the method create chart inside axios
                this.createChart(formatted)

            }).catch(errors => { console.error(errors); });;
        },
        createChart(param){
                console.log('createChart');

                var monthly = [];

                //Loop each key inside the object
                Object.keys(param.monthly).forEach(key=>{ 
                    monthly.push(param.monthly[key]);
                });

                //Access canvas anc create chart line + bar chart
                //Displays monthly expense
                var context = this.$refs['mycanvas'].getContext("2d")
                new Chart(context, {
                type: 'bar',
                data: {
                labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                datasets: [
                        {
                            label: "Monthly",
                            type: 'line',
                            backgroundColor: "#FF0000",
                            borderColor:"#FF0000",
                            borderWidth:1,
                            data: monthly
                        },
                        {
                            label: "Berhasil",
                            type: 'bar',
                            backgroundColor: "#004c6d",
                            data: param.berhasil.items
                        },
                        {
                            label: "Gagal",
                            type: 'bar',
                            backgroundColor: "#004c6d",
                            data: param.gagal.items
                        }
                    ]
                },
                options: {
                     plugins: {
                        title: {
                            display: true,
                            text: 'Utility Bills 2019'
                        }
                    }
                }
            });

            //Access the 2nd canvas
            var context2 = this.$refs['mycanvas2'].getContext("2d")
            new Chart(context2, {
                type: 'pie',
                data: {
                labels: ["Berhasil", "Gagal"],
                datasets: [{
                    label: "Expenses 2019",
                    backgroundColor: ["#004c6d", "#346888","#5886a5"],
                    data: [param.berhasil.percent,param.gagal.percent]
                }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Utility Bills 2019'
                        },
                        tooltip: {
                            //Call back during display of tool tip
                            callbacks: {
                                label: function(data) {
                                    let label = `${data.label} ${data.raw} %`
                                    console.log(data);
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
    }, 
}
</script>
