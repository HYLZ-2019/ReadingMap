```
│  contentscript.js
│  contentstyle.css
│  extension-router.js
│  manifest.json            #配置文件
│  page-background.png
│  pdfHandler-vcros.js
│  pdfHandler.html          #应用进程的后台运行环境
│  pdfHandler.js
│  preferences_schema.json
│  preserve-referer.js
│  restoretab.html
│  restoretab.js
│  suppress-update.js
│  upgradeOldData.js
│
├─content
│  ├─build                  #第三方库pdf.js
│  │      pdf.js
│  │      pdf.worker.js
│  │
│  └─web
│      │  debugger.js
│      │  memoryManagement.js   #内存管理
│      │  readingMap.css        #ReadingMap核心功能
│      │  readingMap.js
│      │  readingMapClasses.js
│      │  translate.js
│      │  viewer.css            #PDF浏览视图
│      │  viewer.html
│      │  viewer.js
│      │
│      ├─cmaps
│      │
│      ├─images
│      │
│      └─locale             #语言库
│ 
│
├─dataManager               #数据管理
│      browserData.html     #浏览器数据管理界面
│      browserData.js       #浏览器数据管理js
│      dataManager.css      #数据管理组件css
│      dataManager.js       #数据管理组件js
│      homepage.html        #主页界面
│      homepage.js          #主页js
│      localData.html       #本地数据管理界面
│      localData.js         #本地数据管理js
│      mergeFiles.html      #数据合并界面
│      mergeFiles.js        #数据合并js
│      readingSummary.js    #阅读报告js
│      section.css          #导航栏css
│      echarts.min.js       #第三方开源库echarts
│
├─doc
│      backlog.xlsx
│
├─options
│      migration.js
│      options.css
│      options.html
│      options.js
│      rmOptions.js
│
├─pageAction
│      background.js
│      popup.css
│      popup.html
│      popup.js
│
├─pics
│
├─readingSummary
│      echarts.min.js
│      readingSummary.html
│      readingSummary.js
│
└─rmImages
    │  add.png
    │  cycle_eye.png
    │  overwrite.png
    │  point.png
    │  point2.png
    │  progressMark - ori.png
    │  progressMark.png
    │
    └─markers
            defaultMarker.png
            Marker.png
```