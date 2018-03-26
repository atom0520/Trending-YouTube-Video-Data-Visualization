var headerText = "Canada Trending YouTube Video Data";
var videoDataFilename = "data/video_data_ca.csv";
var videoDataDeduplicatedFilename = "video_data_dedup_ca.csv";
var categoryDataFilename = "data/category_data_ca.json";

var videoData=null;

var videoDataDeduplicated = null;
var videoDataDeduplicatedStartedLoading = false;

var categoryMap = null;

var currPageName=null;
var selectedVideoIndex = 0; 

var mostViewed=null;
var mostLiked=null;
var mostDisliked = null;
var mostCommented = null;
var categoryVideoNum = null;
var categoryViews = null;
var categoryAverageViews = null;

function saveDataToFile(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function urlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();

    if(http.status!=404){
        console.log("'"+url+"' file exists!")
        return true;
    }else{
        console.log("'"+url+"' file doesn't exist!")
        return false;
    }
}

function loadCategoryData(callback){

    if(categoryMap!=null){
        if(callback!=null){
            callback();
        }
    }

    d3.json(categoryDataFilename, function(root) {

        var categoryItems = root.items;

        temp = {};
        for(var i=0;i<categoryItems.length;i+=1){
            var categoryId = categoryItems[i].id;
            var categoryTitle = categoryItems[i].snippet.title;
            temp[categoryId]={};
            temp[categoryId].title = categoryTitle;
            temp[categoryId].video_num = 0;
            temp[categoryId].views = 0;
        }

        categoryMap=temp;

        if(callback!=null){
            callback();
        }
    });
}



function includeOrNot(idSet,id){
    var included = false;
    
    for(var j=0;j<idSet.length;j+=1){
        if(idSet[j]==id){
            included=true;
            break;
        }
    }

    return included;
}

function deduplicateSortedData(data,i,videoIdSet,dataDeduplicated,topNum,callback){
    // console.log("deduplicateSortedData");
    // console.log(i);

    var videoId = data[i].video_id;
 
    if(includeOrNot(videoIdSet,videoId)==false){
        dataDeduplicated.push(data[i]);
        videoIdSet.push(videoId);
    }

    if((topNum==null&&i<data.length-1)||(topNum!=null&&dataDeduplicated.length<topNum)){
        i=i+1;
        setTimeout(
            function(){deduplicateSortedData(data,i,videoIdSet,dataDeduplicated,topNum,callback);},
            0);
    }else{
        delete videoIdSet;

        if(callback!=null){
            callback();
        }
    }
}

function getMostViewedVideos(callback){
    // console.log("getMostViewedVideos");

    if(mostViewed!=null){
        if(callback!=null){
            callback();
        }
  
        return;
    }

    if(videoData==null){
        loadVideoData(function(){
                getMostViewedVideos(callback);
            }
        );
        return;
    }

    dataSorted = videoData.slice(0)
    dataSorted.sort(
        function(a,b){
            return b.views-a.views;
        });

    videoIdSet = [];
    dataDeduplicated=[];

    deduplicateSortedData(dataSorted,0,videoIdSet,dataDeduplicated,10,
        function(){
            mostViewed = dataDeduplicated;
            if(callback!=null){
                callback();
            }
        }
    );
}

function getMostLikedVideos(callback){
    if(mostLiked!=null){
        if(callback!=null){
            callback();
        }   
        return;
    }

    if(videoData==null){
        loadVideoData(function(){
            getMostLikedVideos(callback);
        });
        return;
    }

    dataSorted = videoData.slice(0)
    dataSorted.sort(
        function(a,b){
            return b.likes-a.likes;
        });

    videoIdSet = [];
    dataDeduplicated=[];

    deduplicateSortedData(dataSorted,0,videoIdSet,dataDeduplicated,10,
    function(){
            mostLiked = dataDeduplicated;
            if(callback!=null){
                callback();
            }
        }
    );
}

function getMostDislikedVideos(callback){
    if(mostDisliked!=null){
        if(callback!=null){
            callback();
        }
        return;
    }

    if(videoData==null){
        loadVideoData(function(){
            getMostDislikedVideos(callback);
        });
        return;
    }
    
    dataSorted = videoData.slice(0)
    dataSorted.sort(
        function(a,b){
            return b.dislikes-a.dislikes;
        });

    videoIdSet = [];
    dataDeduplicated=[];

    deduplicateSortedData(dataSorted,0,videoIdSet,dataDeduplicated,10,
    function(){
            mostDisliked = dataDeduplicated;
            if(callback!=null){
                callback();
            }
        }
    );
   
}

function getMostCommentedVideos(callback){
    if(mostCommented!=null){
        if(callback!=null){
            callback();
        }
        return;
    }

    if(videoData==null){
        loadVideoData(function(){
                getMostCommentedVideos(callback);
            }
        );
        return;
    }

    dataSorted = videoData.slice(0)
    dataSorted.sort(
        function(a,b){
            return b.comment_count-a.comment_count;
        });

    videoIdSet = [];
    dataDeduplicated=[];

    deduplicateSortedData(dataSorted,0,videoIdSet,dataDeduplicated,10,
    function(){
            mostCommented = dataDeduplicated;
            if(callback!=null){
                callback();
            }
        }
    );
}

function getCategoryVideoNum(callback){
    // console.log("getCategoryVideoNum");

    if(categoryVideoNum!=null){
        if(callback!=null){
            callback();
        }   
        return;
    }

    if(videoDataDeduplicated==null){

        if(videoDataDeduplicatedStartedLoading){
            return;
        }

        getDeduplicatedVideoData(
            function(){
                getCategoryVideoNum(callback);
            }
        );
        return;
    }
     
    if(categoryMap==null){
        loadCategoryData(
            function(){
                getCategoryVideoNum(callback);
            }
        );
        return;
    }
    
    for(var i=0; i<videoDataDeduplicated.length; i+=1){
        var videoId = videoDataDeduplicated[i].video_id;
        var categoryId = videoDataDeduplicated[i].category_id;

        if(categoryMap.hasOwnProperty(categoryId)){
            categoryMap[videoDataDeduplicated[i].category_id].video_num += 1;
        }else{
            console.log("missing category id key: "+categoryId);
        }
    }

    temp = [];
    for(var key in categoryMap){
        if(categoryMap.hasOwnProperty(key) && categoryMap[key].video_num!=0){
            temp.push({
                id:key,
                title:categoryMap[key].title,
                video_num:categoryMap[key].video_num,
                video_num_percent:Math.round( categoryMap[key].video_num/videoDataDeduplicated.length * 1000 ) / 10
                
            });
        }
    }

    temp.sort(
        function(a,b){
            return b.video_num - a.video_num;
        });

    categoryVideoNum=temp;
    
    if(callback!=null){
        callback();
    }
    
}

function getCategoryViews(callback){
    // console.log("getCategoryViews");
    if(categoryViews!=null){
        if(callback!=null){
            callback();
        }   
        return;
    }

    if(videoDataDeduplicated==null){

        if(videoDataDeduplicatedStartedLoading){
            return;
        }

        getDeduplicatedVideoData(
            function(){
                getCategoryViews(callback);
            }
        );
        return;
    }

    if(categoryMap==null){
        loadCategoryData(
            function(){
                getCategoryViews(callback);
            }
        );
        return;
    }

    for(var i=0; i<videoDataDeduplicated.length; i+=1){
        var categoryId = videoDataDeduplicated[i].category_id;
        if(categoryMap.hasOwnProperty(categoryId)){
            categoryMap[videoDataDeduplicated[i].category_id].views += videoDataDeduplicated[i].views;
        }else{
            console.log("missing category id key: "+categoryId);
        }
    }

    var temp = [];
    for(var key in categoryMap){
        if(categoryMap.hasOwnProperty(key) && categoryMap[key].views!=0){
            temp.push({
                id:key,
                title:categoryMap[key].title,
                views:categoryMap[key].views
            });
        }
    }

    temp.sort(
        function(a,b){
            return b.views - a.views;
        });

    categoryViews=temp;
    
    if(callback!=null){
        callback();
    }   
}

function getCategoryAverageViews(callback){
    // console.log("getCategoryAverageViews");

    if(categoryAverageViews!=null){
        if(callback!=null){
            callback();
        }   
        return;
    }

    if(categoryViews==null){
        getCategoryViews(
            function(){
                getCategoryAverageViews(callback);
            }
        );
        return;
    }

    if(categoryVideoNum==null){
        getCategoryVideoNum(
            function(){
                getCategoryAverageViews(callback);
            }
        );
        return;
    }

    var temp = [];
    for(var key in categoryMap){
        if(categoryMap.hasOwnProperty(key) && categoryMap[key].views!=0){
            temp.push({
                id:key,
                title:categoryMap[key].title,
                average_views:Math.round(categoryMap[key].views/categoryMap[key].video_num * 10) / 10
            });
        }
    }

    temp.sort(
        function(a,b){
            return b.average_views - a.average_views;
        });
    
    categoryAverageViews=temp;

    if(callback!=null){
        callback();
    }
}

function onClickVideoThumbnail(index){
    
    var topVideoData=getCurrPageData();

    var videoId = topVideoData[index].video_id;

    document.getElementById('vid_frame').src="http://youtube.com/embed/"+videoId+"?autoplay=1&rel=0&showinfo=0&autohide=1";
               
    var vidItems = document.getElementsByClassName("vid-item");
    vidItems = Array.prototype.slice.call(vidItems);
    
    vidItems[selectedVideoIndex].style.backgroundColor = "rgba(0, 0, 0, 0.8)";

    selectedVideoIndex = index;

    vidItems[selectedVideoIndex].style.backgroundColor = "rgba(80, 80, 80, 0.8)";

    document.getElementById('vid-title').innerHTML = topVideoData[index].title;
    document.getElementById('vid-rank').innerHTML = "No."+(index+1)+" ";
    if(index==0){
        document.getElementById('vid-medal').setAttribute("src","imgs/gold-medal.png");
    }else if(index==1){
        document.getElementById('vid-medal').setAttribute("src","imgs/silver-medal.png");
    }else if(index==2){
        document.getElementById('vid-medal').setAttribute("src","imgs/bronze-medal.png");
    }else{
        document.getElementById('vid-medal').setAttribute("src","");
    }
}

function getCurrPageData(){
    switch(currPageName){
        case "MostViewed":
            return mostViewed;
            break;
        case "MostLiked":
            return mostLiked;
            break;
        case "MostDisliked":
            return mostDisliked;
            break;
        case "MostCommented":
            return mostCommented;
            break;
        case "CategoryVideoNum":
            return categoryVideoNum;
        break;
        case "CategoryViews":
            return categoryViews;
        break;
        case "CategoryAverageViews":
            return categoryAverageViews;
        case "RegionsVideoNum":
            return regionsVideoNum;
        break;
    }
}

function loadVideoPlayer(){
    // console.log("loadVideoPlayer");
    
    var topVideoData=getCurrPageData();

    var vidItems = document.getElementsByClassName("vid-item");

    for(var i=0;i<vidItems.length;i+=1){
        var vidItem = vidItems[i];

        vidItem.setAttribute("onClick","onClickVideoThumbnail("+i+")");
        
        for (var j = 0; j < vidItem.childNodes.length; j++) {
            if (vidItem.childNodes[j].className == "thumb") {
                var node = vidItem.childNodes[j];
                
                node.childNodes[0].src=topVideoData[i].thumbnail_link;
                break;
            }        
        }
        
        for (var j = 0; j < vidItem.childNodes.length; j++) {
            if (vidItem.childNodes[j].className == "desc") {
                var node = vidItem.childNodes[j];
                node.innerHTML=topVideoData[i].title;
                break;
            }        
        }
        
        onClickVideoThumbnail(0);
    }
}

function cleanTable(){
    var tableElement = document.getElementById("table");
    while (tableElement.firstChild) {
        tableElement.removeChild(tableElement.firstChild);
    }
}

function loadTable(){
    
    if(categoryMap==null){
        loadCategoryData(loadTable);
        return;
    }

    var topVideoData = getCurrPageData();

    var table = $("#table")

    table.append($("<caption></caption>").html("Most Viewed Videos"))
    var thead = $("<thead></thead>");
    thead.append($("<th></th>").html("Rank"))
    thead.append($("<th></th>").html("Image"))
    thead.append($("<th></th>").html("Title"))
    thead.append($("<th></th>").html("Category"))

    switch(currPageName){
        case "MostViewed":
            thead.append($("<th></th>").html("#Views"))
            break;
        case "MostLiked":
            thead.append($("<th></th>").html("#Likes"))
            break;
        case "MostDisliked":
            thead.append($("<th></th>").html("#Dislikes"))
            break;
        case "MostCommented":
            thead.append($("<th></th>").html("#Comments"))
            break;
    }

    // thead.append($("<th></th>").html("Url"))

    table.append(thead);
    table.append($("<tbody></tbody>"))

    for(var i=0;i<topVideoData.length;i+=1){
        var tr = $("<tr></tr>");

        tr.append($("<td style='text-align: center;'></td>").html(i+1));

        var img = $('<img />').attr("src", topVideoData[i].thumbnail_link);
        tr.append($("<td></td>").append(img));
        
        tr.append($("<td style='font-size:14px;'></td>").html(topVideoData[i].title));

        tr.append($("<td></td>").html(categoryMap[topVideoData[i].category_id].title));

        switch(currPageName){
        case "MostViewed":
            tr.append($("<td></td>").html(topVideoData[i].views));
            break;
        case "MostLiked":
            tr.append($("<td></td>").html(topVideoData[i].likes));
            break;
        case "MostDisliked":
            tr.append($("<td></td>").html(topVideoData[i].dislikes));
            break;
        case "MostCommented":
            tr.append($("<td></td>").html(topVideoData[i].comment_count));
            break;
        }
        
        // var url = $("<a>").attr("href","https://www.youtube.com/watch?v="+topVideoData[i].video_id);
        // url.html("https://www.youtube.com/watch?v="+topVideoData[i].video_id);
        // tr.append($("<td style='font-size:14px;'></td>").append(url));


        $("tbody").append(tr);
    }

}

function cleanBarGraph(){
    var barGraphElement = document.getElementById("bar-graph");
        while (barGraphElement.firstChild) {
            barGraphElement.removeChild(barGraphElement.firstChild);
        }
}

function loadBarGraph(barType,data){
    // console.log("loadBarGraph");
    
    var graphData;
    if(data!=null){
        graphData=data;
    }else{
        graphData=getCurrPageData();
    }
     
    var indexName;
    var valueName;
    var titleName;
    var yAxisText;
  
    var width = 1280;
    var height = 720;

    var xAxisFontSize = 12;
    var yAxisFontSize = 12;

    var yAxisFormatFunc=function(d) { return Math.round(d); };
        
    switch(currPageName){
        case "MostViewed":
        case "MostLiked":
        case "MostDisliked":
        case "MostCommented":
            indexName='video_id';
            titleName="title";
        break;
        case "CategoryVideoNum":
        case "CategoryViews":
        case "CategoryAverageViews":
            indexName='title';
            titleName="title";
        break;      
        case "RegionsVideoNum":
            indexName='name';
            titleName="name";
        break;      
    }

    switch(currPageName){        

        case "MostViewed":
            valueName='views';
            yAxisText = "Number of Views";
            break;
        case "MostLiked":
            valueName='likes';
            yAxisText = "Number of Likes";

            break;
        case "MostDisliked":
            valueName='dislikes';
            yAxisText = "Number of Dislikes";

            break;
        case "MostCommented":
            valueName='comment_count';
            yAxisText = "Number of Comments";
            
            break;
        case "CategoryVideoNum":
            valueName='video_num';
            yAxisText = "Trending Video Number";

            break;
        case "CategoryViews":
            valueName='views';
            yAxisText = "Total Number of Views";
            yAxisFormatFunc = function(d) { return Math.round(d/1000)+'k'; };
            break;
        case "CategoryAverageViews":
            valueName='average_views';
            yAxisText = "Average Number of Views";
            
            break;  
        case "RegionsVideoNum":
            valueName='video_num';
            yAxisText = "Trending Video Number";
            width = 1280;
            height = 600;
            xAxisFontSize=18;
            yAxisFontSize=18;
            break;      
     
    } 

    if(barType){

        margin = {top: 40, right: 120, bottom: 25, left: 120};
        width = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

        var x = d3.scaleBand()
                .rangeRound([20, height])
                .padding(0.1);

        var y = d3.scaleLinear()
            .range([0, width]);

        var xAxis = d3.axisLeft(x);
        var yAxis = d3.axisTop(y).tickFormat(yAxisFormatFunc);

        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<span style='color:white'>" + d[titleName]+ "</span>"+"<br><br>"+
            "<strong>#"+valueName+": </strong> <span style='color:yellow'>" + d[valueName] + "</span>";
        })

        var svg = d3.select("#bar-graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(tip);

        x.domain(graphData.map(function(d){
            return d[indexName];}
        ));

        y.domain([0, d3.max(graphData, function(d){
            return d[valueName];}
        )]);

        svg.append("g")
            .attr("class", "x axis")
            // .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.select(".x.axis")
            .selectAll("text")
            // .attr("transform"," translate(0,15) rotate(-30)")
            .style("font-size","12px");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
        
        svg.append("text")
            .attr("x", width)
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yAxisText);

        svg.selectAll(".bar")
            .data(graphData)
        .enter().append("rect")
            .attr("class", "bar")
            .attr("y", function(d) { 
                return x(d[indexName]); 
            })
            .attr("height", x.bandwidth())

            .attr("x", 0)
            .attr("width", function(d) { 
                if(y(d[valueName])<1){
                    return 1;
                }
                return y(d[valueName]); 
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            return;
    }

    margin = {top: 40, right: 120, bottom: 25, left: 120};
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    var x = d3.scaleBand()
            .rangeRound([20, width])
            .padding(0.1);
            
    var y = d3.scaleLinear()
        .range([height, 0]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y).tickFormat(yAxisFormatFunc);

    var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<span style='color:white'>" + d[titleName]+ "</span>"+"<br><br>"+
        "<strong>#"+valueName+": </strong> <span style='color:yellow'>" + d[valueName] + "</span>";
    });

    var svg = d3.select("#bar-graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

    x.domain(graphData.map(function(d){
            return d[indexName];
        }
    ));

    y.domain([0, d3.max(graphData, function(d){   
            return d[valueName];}
    )]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.select(".x.axis")
        .selectAll("text")
        // .attr("transform"," translate(0,15) rotate(-30)")
        .style("font-size",xAxisFontSize+"px");

    svg.append("g")
        .attr("class", "y axis")
        .style("font-size",yAxisFontSize+"px")
        .call(yAxis)

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yAxisText);

    svg.selectAll(".bar")
        .data(graphData)
    .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d[indexName]); })
        .attr("width", x.bandwidth())

        .attr("y", function(d) { 
                return y(d[valueName]);

            }
        )
        .attr("height", function(d) { 
            return height - y(d[valueName]); 
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
}

function cleanPieGraph(){
    
    var pieGraphElement = document.getElementById("pie-graph");
        while (pieGraphElement.firstChild) {
            pieGraphElement.removeChild(pieGraphElement.firstChild);
    }
}

function loadPieGraph(title,data,indexName,valueName,percentName){
    // console.log("loadPieGraph");

    var graphData;
    if(data!=null){
        graphData=data;
    }else{
        graphData=getCurrPageData();
    }

    var titleOffsetY = 0;
    if(title!=null){
        titleOffsetY = 120;
    }
    
    var width = 900;
    var height = 480+titleOffsetY;

    var outerRadius = height / 2-titleOffsetY/2;
  
    var innerRadius = 0;
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var labelArc = d3.arc()
        .outerRadius(outerRadius-64)
        .innerRadius(outerRadius-64)

    var pie = d3.pie()
        .value(function(d) {
            return d[valueName];
        })
        .padAngle(.01);;

    var color = d3.scaleOrdinal(d3.schemeCategory20);;

    var svg = d3.select("#pie-graph").append('svg')
        .attr("width", width)
        .attr("height", height)
        .style("margin","80 0 20 0");
        // .attr("transform", "translate(" + 128 + "," + 0 + ")");

    if(title!=null){
        svg.append("text")
        .attr("x", width/2-128)
        .attr("y", 48)
        .style("font-size", 32)
        .attr("height",64)
        .attr("width",256)
        .style("fill", 'black')
        .text(title);
    }
       
    // Set up groups
    var mousOverCallback = function (d) {
        d3.select("#tooltip")
            .style("left", d3.event.pageX-96+'px')
            .style("top", d3.event.pageY-96+'px')
            .style("opacity", 1);

        d3.select("#pie-graph-tip-title")
            .text(d.data[indexName]);

        d3.select("#pie-graph-tip-value")
            .text('#'+valueName+': '+d.data[valueName]);

        if(percentName!=null){
            d3.select("#pie-graph-tip-percent")
            .text('Percent: '+d.data[percentName]+"%");
        }else{
            d3.select("#pie-graph-tip-percent")
            .text("");
        }
    }
     
    var arcs = svg.selectAll("g.arc")
        .data(pie(graphData))
        .enter()
        .append("g")
        .attr("class", "arc")
    
        .attr("transform", "translate(" + (outerRadius+48)+ "," + (outerRadius+titleOffsetY)+ ")")
    
        .on("mouseover", mousOverCallback)
        .on("mousemove", function (d) {

            d3.select("#tooltip")
            .style("left", d3.event.pageX-96+'px')
            .style("top", d3.event.pageY-96+'px')
                .style("opacity", 1);
        })
        
        .on("mouseout", function () {
            d3.select("#tooltip")
                .style("opacity", 0);
        });

    
    arcs.append("path")
        .attr("fill", function (d, i) {             
                return color(i);
            })
        .attr("d", arc);

    // arcs.append("text")
    //     .style("font-weight", "bold")
    //     .style("color", "white")
    //     .attr("transform", function (d) {
    //         return "translate(" + labelArc.centroid(d) + ")";
    //     })
    //     .attr("text-anchor", "middle")
    //     .text(function (d) {
    //         return d.data.id;
    //     });  

    // add legend   
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("x", width - 96)
        .attr("y", 25)
        .attr("height", 100)
        .attr("width", 100);

    legend.selectAll('g').data(graphData)
        .enter()
        .append('g')
        .each(function(d, i) {

            var g = d3.select(this);
            g.append("rect")
            .attr("x", width - 288)
            .attr("y", i*25+32+titleOffsetY)
            .attr("width", 16)
            .attr("height", 16)
            .style("fill", color(i));

            g.append("text")
            .attr("x", width - 256)
            .attr("y", i * 25 + 46+titleOffsetY)
            .style("font-size", 16)
            .attr("height",30)
            .attr("width",100)
            .style("fill", 'black')
            .text(d[indexName]);

        });
}

function openPageBase(pageName,pageTitle,element,color) {
    currPageName = pageName;

    var tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }

    element.style.backgroundColor = color;

    document.getElementById("loading").style.display = "block";
    document.getElementById("video-heading").style.display = "none";
    document.getElementById("video-player").style.display = "none";
    document.getElementById("table").style.display = "none";
    
    document.getElementById("bar-graph").style.display = "none";
    document.getElementById("pie-graph").style.display = "none";

    var tabtitle = document.getElementById("tabtitle");
    tabtitle.innerHTML=pageTitle;
    
    document.getElementById('vid_frame').src="";
    switch(pageName){
        case "MostViewed":           

            cleanTable();
            cleanBarGraph();
            getMostViewedVideos(
                function(){
                    if(currPageName != pageName){
                        return;
                    }

                    loadVideoPlayer();
                    loadTable();
                    loadBarGraph();
                    
                    document.getElementById("video-heading").style.display = "block";
                    document.getElementById("video-player").style.display = "block";
                    document.getElementById("table").style.display = "table";
                    document.getElementById("bar-graph").style.display = "inline";
                    document.getElementById("loading").style.display = "none";
                }
            );
            break;
        case "MostLiked":

            cleanTable();
            cleanBarGraph();
            getMostLikedVideos(
                function(){
                    if(currPageName != pageName){
                        return;
                    }

                    loadVideoPlayer();
                    loadTable();
                    loadBarGraph();

                    document.getElementById("video-heading").style.display = "block";
                    document.getElementById("video-player").style.display = "block";
                    document.getElementById("table").style.display = "table";
                    document.getElementById("bar-graph").style.display = "inline";
                    document.getElementById("loading").style.display = "none";
                }
            );
            break;
        case "MostDisliked":

            cleanTable();
            cleanBarGraph();
            getMostDislikedVideos(
                function(){
                    if(currPageName != pageName){
                        return;
                    }

                    loadVideoPlayer();
                    loadTable();
                    loadBarGraph();

                    document.getElementById("video-heading").style.display = "block";
                    document.getElementById("video-player").style.display = "block";
                    document.getElementById("table").style.display = "table";
                    document.getElementById("bar-graph").style.display = "inline";
                    document.getElementById("loading").style.display = "none";
                }
            );
            break;
        case "MostCommented":

            cleanTable();
            cleanBarGraph();
            getMostCommentedVideos(
                function(){
                    if(currPageName != pageName){
                        return;
                    }

                    loadVideoPlayer();
                    loadTable();
                    loadBarGraph();

                    document.getElementById("video-heading").style.display = "block";
                    document.getElementById("video-player").style.display = "block";
                    document.getElementById("table").style.display = "table";
                    document.getElementById("bar-graph").style.display = "inline";
                    document.getElementById("loading").style.display = "none";
                }
            )
            break;
        case "CategoryVideoNum":

            cleanBarGraph();
            cleanPieGraph();
            getCategoryVideoNum(
                function(){
                    if(currPageName != pageName){
                        return;
                    }

                    loadBarGraph(1);
                    loadPieGraph(null,categoryVideoNum,'title','video_num','video_num_percent');

                    document.getElementById("bar-graph").style.display = "inline";
                    document.getElementById("pie-graph").style.display = "inline";
                    document.getElementById("loading").style.display = "none";
                }
            );
            break;
        case "CategoryViews":
           
            cleanBarGraph();
            cleanPieGraph();
            getCategoryViews(
                function(){
                    if(currPageName != pageName){
                        return;
                    }

                    loadBarGraph(1);
                    // loadPieGraph(null,categoryAverageViews,'title','average_views',null);

                    document.getElementById("bar-graph").style.display = "inline";
                    // document.getElementById("pie-graph").style.display = "inline";
                    document.getElementById("loading").style.display = "none";
                }
            );
            break;
        case "CategoryAverageViews":
           
            cleanBarGraph();
            cleanPieGraph();
            getCategoryAverageViews(
                function(){
                    if(currPageName != pageName){
                        return;
                    }

                    loadBarGraph(1);
                    // loadPieGraph(null,categoryAverageViews,'title','average_views',null);

                    document.getElementById("bar-graph").style.display = "inline";
                    // document.getElementById("pie-graph").style.display = "inline";
                    document.getElementById("loading").style.display = "none";
                }
            );
            break;
    }
}

$(".arrow-right").bind("click", function (event) {
    event.preventDefault();

    // var vidItems = document.getElementsByClassName("vid-item");
    // if(selectedVideoIndex<vidItems.length-1){
    //     onClickVideoThumbnail(selectedVideoIndex+1);
    // }

    $(".vid-list-container").stop().animate({
        scrollLeft: "+=336"
    }, 750);
});
$(".arrow-left").bind("click", function (event) {
    event.preventDefault();

    // var vidItems = document.getElementsByClassName("vid-item");
    // if(selectedVideoIndex>0){
    //     onClickVideoThumbnail(selectedVideoIndex-1);
    // }
    $(".vid-list-container").stop().animate({
        scrollLeft: "-=336"
    }, 750);
});

