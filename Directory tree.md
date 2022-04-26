```
│  contentscript.js
│  contentstyle.css
│  extension-router.js
│  manifest.json            #配置文件
│  page-background.png      #磨砂质感的背景
│  pdfHandler-vcros.js
│  pdfHandler.html          #应用进程的后台运行环境
│  pdfHandler.js
│  preferences_schema.json  #PDF Viewer的设置选项信息
│  preserve-referer.js      #记录用户的请求头，让PDF Viewer可以访问到用户打开的网络pdf资源
│  restoretab.html  
│  restoretab.js            #PDF Viewer关于恢复页面过程的补丁
│  suppress-update.js       #让PDF Viewer等到所有已打开的pdf均已关闭之后再进行版本更新
│  upgradeOldData.js        #用于迁移旧版本ReadingMap产生的格式不同的数据
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
├─doc   # 开发文档
│      backlog.xlsx
│
├─options   # PDF Viewer的设置页面
│      migration.js
│      options.css
│      options.html
│      options.js
│      rmOptions.js
│
├─pageAction    # ReadingMap的控制坞
│      background.js
│      popup.css
│      popup.html
│      popup.js
│
├─pics  # 文档中的图片
│
├─readingSummary    # ReadingMap统计图表功能
│      echarts.min.js
│      readingSummary.html
│      readingSummary.js
│
└─rmImages  # 界面中的图片素材
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
