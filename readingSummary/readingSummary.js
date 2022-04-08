function readingSummary() {
    // let rmHistorySet=load('rmHistorySet')
    let rmHistorySet = localStorage.getItem('rmHistorySet')
    // console.log(rmHistorySet)
    rmHistorySet = JSON.parse(rmHistorySet)
    let xAxisData = []
    let seriesData = []
    let legendData = []
    // console.log(Date.parse('2022-03-26T13:42:05.012Z'))
    // console.log(Date.prototype.toar('2022-03-26T13:42:05.012Z'))

    for (let i in rmHistorySet) {
        let Date = rmHistorySet[i].date.split('T')[0]
        xAxisData.push(Date)
        let dateHistory = rmHistorySet[i].history

        for (let j in dateHistory) {
            let passage = dateHistory[j]
            if ((passage.title in legendData)==false) {
                let newData = {}
                newData.name = passage.title
                newData.type='line'
                newData.data = []
                seriesData.push(newData)
                legendData.push(passage.title)
            }
        }
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
            // console.log(temporaryDict[item.name])
            if (item.name in temporaryDict) {
                // console.log('yes')
                item.data.push(temporaryDict[item.name])
                // delete temporaryDict[item.name]
               
            } else{
                // console.log(item)
                item.data.push(0)
            }
                
        }

    }
    console.log(seriesData)

    var summaryChart = echarts.init(document.getElementById('summaryChart'));
    summaryChart.setOption( {
        title: {
            text: 'Reading Summary'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: legendData
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
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
}
readingSummary()