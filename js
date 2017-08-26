var totalRecords=null;
var pageSize=10;
var pageCurrent=1;
var selectCondition=null;
function $(e) {	return document.getElementById(e);}

function submitByAjaxXml(url) {
	var thisurl = url;
	var xmlHttp;
	var xmlHttpResponseXML = null; //用于存储从服务器端传回的XML文本对象
	function createXMLHttpRequest() {
		if(window.XMLHttpRequest)
			xmlHttp = new XMLHttpRequest();
		else if(window.ActionXObject) //判断浏览器的兼容性
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	function startRequest(thisurl) {
		var url = encodeURI(thisurl); //modify 5.2 传输编码
		//alert(url);
		createXMLHttpRequest();
		xmlHttp.open("GET", url, false); //false异步刷新
		xmlHttp.onreadystatechange = function() { //服务器状态发生变化时调用此函数。
			if(xmlHttp.readyState == 4 && xmlHttp.status == 200) { //判断异步交互是否成功
				xmlHttpResponseXML = xmlHttp.responseXML; //自动解析成DOM文档树结构模型
			}
		}
		xmlHttp.send(null);
	}
	startRequest(thisurl);
	//加一个返回值
	return xmlHttpResponseXML;
}
//取出currentPage页的数据 并将数据解析到HTML页面去
function getCurrentPageRecords(currentPage,selectCondition){
	//根据查询条件 以及要取出的记录向后台请求
	var emailOrTel = getCookie("username");
	var url = "getcurrentpageRecords.php?emailortel=" + emailOrTel;
		url+="&selectcondition="+selectCondition;
		url+="&currentpage="+pageCurrent;
	var xmlObj=submitByAjaxXml(url)//将请求的记录存放在xmlObj对象中
	//如果显示记录的table已经有记录了 则用删除table中原有的记录
	if($("datatable").children.length>1){
		for(var i=$("datatable").children.length-1;i>=1;i--)
			$("datatable").removeChild($("datatable").children[i]);
	}
	//创建可以被克隆的节点
	var trNode=document.createElement("tr");
	var tdNode1=document.createElement("td");
	var tdNode2=document.createElement("td");
	var tdNode3=document.createElement("td");
	var tdNode4=document.createElement("td");
	var tdNode5=document.createElement("td");
	var tdNode6=document.createElement("td");
	var inputNode=document.createElement("input");
		inputNode.setAttribute("type","button");
		inputNode.setAttribute("value","评论");
		inputNode.setAttribute("name","comment");
		tdNode6.appendChild(inputNode);
	trNode.appendChild(tdNode1);
	trNode.appendChild(tdNode2);
	trNode.appendChild(tdNode3);
	trNode.appendChild(tdNode4);
	trNode.appendChild(tdNode5);
	trNode.appendChild(tdNode6);
	//将xmlObj对象的数据解析到HTML文档中去
	var trArray=xmlObj.getElementsByTagName("tr");
	//将xml中的数据添加到已经克隆好的节点上
	for(var j=0;j<trArray.length;j++){
		var cloneTrNode=trNode.cloneNode(true);
		for(var k=0;k<5;k++){
			cloneTrNode.children[k].innerHTML=trArray[j].children[k].innerHTML;
		}
		//将克隆节点添加到html文档流中
		addEventHandler(cloneTrNode.children[5].firstChild,'click',clickToComment);
		document.getElementById("datatable").appendChild(cloneTrNode);	
	}
}

//取出在查询条件selectCOndition下的记录的总数 并向页面添加分页导航按钮 
function getBookCommentsTotalRecords() {
	var emailOrTel = getCookie("username");
	//alert(emailOrTel);
	var url = "getbooktotalcomments.php?emailortel=" + emailOrTel;
	 url+="&selectcondition="+selectCondition;
	//取出totalRecords全局变量 存放在totalRecords全局变量中
	totalRecords=parseInt(submitFormByAjax(url));
}
//分页函数 创建分页按钮
function page(totalRecords, pageSize, pageCurrent, selectCondition) {
	var totalPages = Math.ceil(totalRecords / pageSize);
	var pagePrevious = (pageCurrent <= 1) ? 1 : pageCurrent - 1;
	
	var pageNext = (pageCurrent >= totalPages) ? totalPages : pageCurrent + 1;
	pageNext = (pageNext == 0) ? 1 : pageNext;
	var pageStart = (pageCurrent - 5 > 0) ? pageCurrent - 5 : 0;
	var pageEnd = (pageStart + 10 < totalPages) ? pageStart + 10 : totalPages;
	pageStart = pageEnd - 10;
	if(pageStart < 0) pageStart = 0;
	//创建可以被克隆的input节点
	var inputNode=document.createElement("input");
		inputNode.setAttribute("type","button");
		inputNode.setAttribute("class","navbtn");
		
		//向html里增加分页导航条		
			//如果已经存在分页导航按钮 则先删除
			if($("navbar").children){
				for(var index=$("navbar").children.length-1;index>=0;index--){
					$("navbar").removeChild($("navbar").children[index]);
					//alert("再次绘制");
				}
			}
			//上一页节点
			var firstNode=inputNode.cloneNode(false);
				firstNode.setAttribute("value","上一页");
				firstNode.setAttribute("currentpage",pagePrevious);//自定义属性 存储当前按钮的页码
				firstNode.setAttribute("selectcondition",selectCondition);//自定义属性 存储 当前按钮的查询条件
				$("navbar").appendChild(firstNode);
				//页码节点
			for(var i = pageStart + 1; i < pageEnd + 1; i++){			
				var newNode=inputNode.cloneNode(false);
				newNode.setAttribute("value",i);
				newNode.setAttribute("currentpage",i);
				newNode.setAttribute("selectcondition",selectCondition);
				$("navbar").appendChild(newNode);						
			}
			//下一页节点
			var lastNode=inputNode.cloneNode(false);
				lastNode.setAttribute("value","下一页");
				lastNode.setAttribute("currentpage",pageNext);
				lastNode.setAttribute("selectcondition",selectCondition);
				$("navbar").appendChild(lastNode);
				//创建段落节点
			var pNode=document.createElement("p");		
				//创建文本节点
			var textNode=document.createTextNode("共有"+totalRecords+"条记录，共"+totalPages+"页，当前是第"+pageCurrent+"页");
				pNode.appendChild(textNode);
			$("navbar").appendChild(pNode);
}	
	//为每个按钮添加事件
function addEventToNavBtn(){
	var navBtn=document.getElementsByClassName("navbtn");
	for(var i=0;i<navBtn.length;i++){
		addEventHandler(navBtn[i],'click',clickToDisplayCurrentPageRecords);
	}	
}	
	//导航条上的按钮单击触发的事件 当单击该按钮时显示按钮页所在记录 重新绘制分页导航条
function clickToDisplayCurrentPageRecords(e){
	//取出存储在btn按钮中的currentpage,selectcondition;
	if(!e) var e=window.event;//浏览器空能检测 检测浏览器支持W3C标准还是微软
	var element=(e.target)?e.target:e.srcElement;
	//取出的数据类型要经过强制转换
	 pageCurrent= parseInt(element.getAttribute("currentpage"));
	 selectCondition=element.getAttribute("selectcondition");
	//显示页面记录
	getCurrentPageRecords(pageCurrent,selectCondition);
	//重新绘制分页导航条
	//alert("事件注册成功");                                       
	page(totalRecords, pageSize, pageCurrent, selectCondition);
	//添加按钮单击事件
	addEventToNavBtn();
}
//点击查询时 把查询条件的时间段赋值给selectCondition 并调用clickSearchBtnToReloadRecords()函数获取totalrecords
//调用
function clickSearchBtnToReloadRecords(){
	//alert("事件已注册");
	var startTime=$("starttime").value;
	var endTime=$("endtime").value;
	//拼接两个时间 方便传输编码
	selectCondition=startTime+'|'+endTime;
	//将pagecurrent初始化为1 防止从上次点击的curentpage开始
	//alert(selectCondition);
	pageCurrent=1;
	//totalRecords=112;
	//相当于窗口加载的初始化
	//取出在查询条件为selectCondition下的记录总数
	getBookCommentsTotalRecords();
	//显示页面的初始记录
	getCurrentPageRecords(pageCurrent,selectCondition);
	//添加分页导航条
	page(totalRecords, pageSize, pageCurrent, selectCondition);
	//为导航条上的按钮添加事件
	addEventToNavBtn();
}
function windowLoadFunction(){	
	//窗口初始化
	//取出在查询条件为selectCondition=null下的记录总数
	getBookCommentsTotalRecords();
	//显示页面的初始记录
	getCurrentPageRecords(pageCurrent,selectCondition);
	//添加分页导航条
	page(totalRecords, pageSize, pageCurrent, selectCondition);
	//为导航条上的按钮添加事件
	addEventToNavBtn();
	addEventHandler($("searchbtn"),'click',clickSearchBtnToReloadRecords);
}
