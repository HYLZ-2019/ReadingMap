
function readingSummary(legendData,rmHistorySet) {
    console.log(legendData)
    document.getElementById('summaryChart1').style.display='flex'
    document.getElementById('summaryChart2').style.display='flex'

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
    console.log(seriesData)

    var summaryChart = echarts.init(document.getElementById('summaryChart1'));
    summaryChart.setOption( {
        title: {
            text: navigator.language=="zh-CN" ? '每日阅读量': 'Pages read per day',
            left: 'center',
        },
        tooltip: {
            // trigger: 'axis'
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
            name:'页数',
            type: 'value'
        },
        series: seriesData
    },notMerge=true);

    // for (let i in seriesData){
    //     let item = seriesData[i]
    //     item.type='bar'
    //     item.stack= 'x'
    //     }
    summaryChart = echarts.init(document.getElementById('summaryChart2'));
    summaryChart.setOption( {
        title: {
            text: navigator.language=="zh-CN" ? '累计阅读量': 'Total pages read',
            left: 'center',
        },
        tooltip: {
            // trigger: 'axis'
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
            name:'页数',
            type: 'value'
        },
        series: sumSeriesData(seriesData)
    },notMerge=true);

    /*summaryChart = echarts.init(document.getElementById('summaryChart3'));
    summaryChart.setOption( {
        title: {
            text: navigator.language=="zh-CN" ? '阅读进度': 'Reading Percentage',
            left: 'center',
        },
        tooltip: {
            // trigger: 'axis'
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
            //   magicType: { show: true, type: ['stack','line', 'bar'] },
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
            name:'100%',
            type: 'value'
        },
        series: percentSeriesData(seriesData)
    },notMerge=true);*/
}

function sumSeriesData(seriesData)
{
    for (let i in seriesData){
        let item = seriesData[i]
        // item.type='bar'
        // item.stack= xAxisData[i]
        for (let j in item.data){
            if (j==0) continue
            item.data[j]+=item.data[j-1]
        }
    }
    return seriesData
}
function summaryChosenFromLocal()
{
    if (uploadedStorage == undefined) return
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
    // console.log(uploadedStorage)
    readingSummary(legendData,JSON.parse(uploadedStorage.rmHistorySet))

}
function summaryChosenFromBrowser()
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
    let rmHistorySet = localStorage.getItem('rmHistorySet')
    rmHistorySet = JSON.parse(rmHistorySet)
    readingSummary(legendData,rmHistorySet)

}
function readingToday()
{
    let rmBooksToday=JSON.parse(localStorage.getItem("rmBooksToday"));
    let history=rmBooksToday.history
    let seriesData=[]
    for (let i in history){
        seriesData.push({value:history[i].pages,name:history[i].title})
    }
    let pieChart = echarts.init(document.getElementById('pieChart'));
    pieChart.setOption( {
        title: {
          text: '今日阅读',
          subtext:new Date(),
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '今日页数',
            type: 'pie',
            radius: '50%',
            data: seriesData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      });
}
function summaryAll()
{
    // let table = document.getElementById("storageListTable");
    // table.style.display='none'
    let rmHistorySet = localStorage.getItem('rmHistorySet')
   
    rmHistorySet = JSON.parse(rmHistorySet)

    let legendData = []
    let temporaryDict={}
    for (let i in rmHistorySet) {
        let dateHistory = rmHistorySet[i].history
        for (let j in dateHistory) {
            let passage = dateHistory[j]
            if ((passage.title in temporaryDict)==false) {
                legendData.push(passage.title)
                temporaryDict[passage.title]=true
            }
        }
    }
    readingToday()
    readingSummary(legendData,rmHistorySet)
    
}
// readingSummary()