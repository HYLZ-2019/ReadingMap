function readingSummary(legendData) {
    document.getElementById('summaryChart1').style.display='flex'
    document.getElementById('summaryChart2').style.display='flex'
    // let rmHistorySet=load('rmHistorySet')
    let rmHistorySet = localStorage.getItem('rmHistorySet')
    // console.log(rmHistorySet)
    rmHistorySet = JSON.parse(rmHistorySet)
    let xAxisData = []
    let seriesData = []

    for (let i in legendData){
        let newData = {}
        newData.name = legendData[i]
        newData.type='line'
        newData.data = []
        seriesData.push(newData)
    }
    for (let i in rmHistorySet) {
        let Date = rmHistorySet[i].date.split('T')[0]
        xAxisData.push(Date)
    }
   
    for (let i in rmHistorySet) {

        let dateHistory = rmHistorySet[i].history
        let temporaryDict = {}
        for (let j in dateHistory) {
            let passage = dateHistory[j]
            temporaryDict[passage.title] = passage.pages
        }
        
        for (let i in seriesData) {
            let item=seriesData[i]

            if (item.name in temporaryDict) {

                item.data.push(temporaryDict[item.name])

               
            } else{
 
                item.data.push(0)
            }
                 
        }

    }
    // console.log(seriesData)

    var summaryChart = echarts.init(document.getElementById('summaryChart1'));
    summaryChart.setOption( {
        title: {
            text: '每日阅读量',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis'
        },
        // legend: {
        //     data: legendData,
        //     // show:hidden
        // },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            show: true,
            feature: {
              mark: { show: true },
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['stack','line', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data:xAxisData
        },
        yAxis: {
            type: 'value'
        },
        series: seriesData
    });

    
    summaryChart = echarts.init(document.getElementById('summaryChart2'));
    summaryChart.setOption( {
        title: {
            text: '累计阅读量',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis'
        },
        // legend: {
        //     data: legendData,
        //     // show:hidden
        // },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            show: true,
            feature: {
              mark: { show: true },
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['stack','line', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data:xAxisData
        },
        yAxis: {
            type: 'value'
        },
        series: sumSeriesData(seriesData)
    });

    
}
function sumSeriesData(seriesData)
{
    for (let i in seriesData){
        let item = seriesData[i]
        for (let j in item.data){
            if (j==0) continue
            item.data[j]+=item.data[j-1]
        }
    }
    return seriesData
}
function summaryChosen()
{
    let table = document.getElementById("storageListTable");
    // table.style.display='none'
    let rows = table.getElementsByTagName("tr");
    let legendData = []
    for (i=0; i<rows.length; i++){
        let row = rows[i];
        let cb = row.getElementsByClassName("checkboxCol")[0].getElementsByClassName("chooseCheckbox")[0];
        if (cb != undefined && cb.checked){
            let title = row.getElementsByClassName("titleCol")[0].innerText;
            legendData.push(title);
        }
    }
    readingSummary(legendData)

}
function summaryAll()
{
    // let table = document.getElementById("storageListTable");
    // table.style.display='none'
    let rmHistorySet = localStorage.getItem('rmHistorySet')
   
    rmHistorySet = JSON.parse(rmHistorySet)

    let legendData = []
    for (let i in rmHistorySet) {
        let dateHistory = rmHistorySet[i].history
        for (let j in dateHistory) {
            let passage = dateHistory[j]
            if ((passage.title in legendData)==false) {
                legendData.push(passage.title)
            }
        }
    }
    readingSummary(legendData)
    
}
// readingSummary()