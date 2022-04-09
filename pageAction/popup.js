/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

console.log("popup");
/*
var url = location.search.match(/[&?]file=([^&]+)/i);
if (url) {
  url = decodeURIComponent(url[1]);
  document.body.textContent = url;
  // Set cursor to end of the content-editable section.
  window.getSelection().selectAllChildren(document.body);
  window.getSelection().collapseToEnd();

  // TODO: 在这里（popup.html+popup.js）里加一个按钮，用来“手动开始记录这个pdf的阅读进度”。
}*/

window.addEventListener("load", popupOnLoad);

function popupOnLoad(){
  document.getElementById("optionsButton").addEventListener("click", turnToOptions);
  document.getElementById("manageDataButton").addEventListener("click", turnToDataManager);
  showTodayReport();
}


function turnToOptions(){
  chrome.tabs.create({url: "chrome://extensions/?options="+chrome.runtime.id});
}
function turnToDataManager(){
  chrome.tabs.create({url: "chrome-extension://"+chrome.runtime.id+"/dataManager/homepage.html"})
}

function showTodayReport() {
  let box = document.getElementById("todayBookList");
  let today = load("rmBooksToday");
  let total = 0;
  for (let i in today.history){
    let book = today.history[i];
    let div = document.createElement("div");
    div.setAttribute("class", "bookToday");
    div.innerText = book.title + " : " + book.pages + "p";
    box.appendChild(div);
    total += book.pages;
  }
  let totalbox = document.getElementById("todayReportTotal");
  if (navigator.language == "zh-CN"){
    totalbox.innerText = "共：" + total + " 页";
  }
  else{
    totalbox.innerText = "Total : " + total + "p";
  }
}