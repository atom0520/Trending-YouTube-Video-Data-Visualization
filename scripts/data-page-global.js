var regionsName = ["Canada","USA","Britain","France","Germany"];

var videoDataFilenames = ["data/video_data_ca.csv",
                            "data/video_data_us.csv",
                            "data/video_data_gb.csv",
                            "data/video_data_fr.csv",
                            "data/video_data_de.csv"]

var videoDataDeduplicatedFilenames = ["video_data_dedup_ca.csv",
                                    "video_data_dedup_us.csv",
                                    "video_data_dedup_gb.csv",
                                    "video_data_dedup_fr.csv",
                                    "video_data_dedup_de.csv"]
var categoryDataFilenames = ["data/category_data_ca.json",
                        "data/category_data_us.json",
                        "data/category_data_gb.json",
                        "data/category_data_fr.json",
                        "data/category_data_de.json"]

var regionsVideoNum = null;
var regionsVideoData = null;
var regionsVideoDataDeduplicated = null; 
var regionsVideoDataDeduplicatedStartedLoading=false;
var regionsCategoryViews = null;
var regionsCategoryMap = null;

function loadVideoDataForSingleRegion(i,storingVar,callback){
    // console.log("loadVideoDataForSingleRegion");

    d3.csv(videoDataFilenames[i],
        function(d){
            d.views = +d.views;
            d.likes = +d.likes;
            d.dislikes = +d.dislikes;
            d.comment_count = +d.comment_count;
            return d;
        },
        function(error,d){

            regionsVideoData[i]=d;
            Array.prototype.push.apply(storingVar,d); 

            i+=1;
            if(i<videoDataFilenames.length){
                setTimeout(
                    function(){loadVideoDataForSingleRegion(i,storingVar,callback);},
                0);
                
            }else{
                videoData = storingVar;

                if(callback!=null){
                    callback();
                }
            }
        });
}

function loadVideoData(callback){
    // console.log("loadVideoData");

    var tempVideoData = []
    regionsVideoData = [];
    setTimeout(
        function(){
            loadVideoDataForSingleRegion(
                0,tempVideoData,
                callback
            )
        },
    0);
}

function getDeduplicatedVideoDataForSingleRegion(i,storingVar,callback){
    // console.log("getDeduplicatedVideoDataForSingleRegion");

    if(urlExists("data/"+videoDataDeduplicatedFilenames[i])==true){
        d3.csv("data/"+videoDataDeduplicatedFilenames[i],
            function(d){
                d.views = +d.views;
                d.likes = +d.likes;
                d.dislikes = +d.dislikes;
                d.comment_count = +d.comment_count;
                return d;
            },
            function(error,d){
                storingVar[i]=d;
                i+=1;
                if(i<videoDataDeduplicatedFilenames.length){
                    setTimeout(
                        function(){
                            getDeduplicatedVideoDataForSingleRegion(i,storingVar,callback);
                        },
                    0);
                }else{

                    regionsVideoDataDeduplicated=storingVar;
                    if(callback!=null){
                        callback();
                    }
                }                
        });
        return;
    }
    
    if(regionsVideoData[i]==null){
        loadVideoData(function(){
            getDeduplicatedVideoDataForSingleRegion(
                i,storingVar,callback);
        });
        return;
    }

    dataSorted = regionsVideoData[i].slice(0);
    dataSorted = dataSorted.reverse();

    videoIdSet = [];
    temp=[];

    deduplicateSortedData(dataSorted,0,videoIdSet,temp,null,
        function(){
            storingVar[i] = temp;

            var newCSVString = d3.csvFormat(storingVar[i]);
            alert("Please place the downloaded data file in the 'data' folder under the project directory.");

            saveDataToFile(newCSVString, videoDataDeduplicatedFilenames[i], 'text/plain');    

            i+=1;
            if(i<videoDataDeduplicatedFilenames.length){
                setTimeout(
                    function(){
                        getDeduplicatedVideoDataForSingleRegion(i,storingVar,callback);
                    },
                0);
            }else{

                regionsVideoDataDeduplicated=storingVar;
                if(callback!=null){
                    callback();
                }
            }  
        }
    );                
   
}

function getRegionsVideoDataDeduplicated(callback){
    if(regionsVideoDataDeduplicated!=null){
        if(callback!=null){
            callback();
        }
        return;
    }

    regionsVideoDataDeduplicatedStartedLoading=true;

    temp = [];
    setTimeout(
        function(){
            getDeduplicatedVideoDataForSingleRegion(
                0,temp,
                callback
            )
        },
    0);
   
}

function loadCategoryMapForSingleRegion(i,storingVar,callback){
    d3.json(categoryDataFilenames[i], function(root) {

        var categoryItems = root.items;

        var categoryMap={};
        for(var j=0;j<categoryItems.length;j+=1){
            var categoryId = categoryItems[j].id;
            var categoryTitle = categoryItems[j].snippet.title;
            categoryMap[categoryId]={};
            categoryMap[categoryId].title = categoryTitle;
            categoryMap[categoryId].video_num = 0;
            categoryMap[categoryId].views = 0;
        }
        
        storingVar.push(categoryMap);

        i+=1;
        if(i<categoryDataFilenames.length){
            setTimeout(
                function(){loadCategoryMapForSingleRegion(i,storingVar,callback);},
            0);
            
        }else{
            regionsCategoryMap = storingVar;

            if(callback!=null){
                callback();
            }
        }
    });
   
}

function loadRegionsCategoryMap(callback){
    // console.log("loadRegionsCategoryMap");

    var tempRegionsCategoryMap = []
    setTimeout(
        function(){
            loadCategoryMapForSingleRegion(
                0,tempRegionsCategoryMap,
                callback
            )
        },
    0);
}

function getRegionsVideoNum(callback){
    // console.log("getCategoryVideoNum");

    if(regionsVideoNum!=null){
        if(callback!=null){
            callback();
        }   
        return;
    }

    if(regionsVideoDataDeduplicated==null){

        if(regionsVideoDataDeduplicatedStartedLoading){
            return;
        }

        getRegionsVideoDataDeduplicated(
            function(){
                getRegionsVideoNum(callback);
            }
        );
        return;
    }

    temp = [];
    for(var i=0;i<regionsName.length;i++){
        temp.push({
            name:regionsName[i],
            video_num:regionsVideoDataDeduplicated[i].length
        });
    }

    temp.sort(
        function(a,b){
            return b.video_num - a.video_num;
        });

    regionsVideoNum=temp;
    
    if(callback!=null){
        callback();
    }
    
}

function getRegionsCategoryViews(callback){
    // console.log("getRegionsCategoryViews");

    if(regionsCategoryViews!=null){
        if(callback!=null){
            callback();
        }   
        return;
    }

    if(regionsVideoDataDeduplicated==null){

        //Here may be a problem
        if(regionsVideoDataDeduplicatedStartedLoading){
            return;
        }

        getRegionsVideoDataDeduplicated(
            function(){
                getRegionsCategoryViews(callback);
            }
        );
        return;
    }
    


    if(regionsCategoryMap==null){
        loadRegionsCategoryMap(
            function(){
                getRegionsCategoryViews(callback);
            }
        );
        return;
    }
    

    var tempRegionsCategoryViews=[];
    for(var j=0;j<regionsName.length;j+=1){
        var tempCategoryViews={};

        var videoDataDeduplicated = regionsVideoDataDeduplicated[j];
        for(var i=0; i<videoDataDeduplicated.length; i+=1){
            var categoryId = videoDataDeduplicated[i].category_id;
            if(regionsCategoryMap[j].hasOwnProperty(categoryId)){
                regionsCategoryMap[j][videoDataDeduplicated[i].category_id].views += videoDataDeduplicated[i].views;
            }else{
                console.log("missing category id key: "+categoryId);
            }
        }
    
        var tempCategoryViews = [];
        for(var key in regionsCategoryMap[j]){
            if(regionsCategoryMap[j].hasOwnProperty(key) && regionsCategoryMap[j][key].views!=0){
                tempCategoryViews.push({
                    id:key,
                    title:regionsCategoryMap[j][key].title,
                    views:regionsCategoryMap[j][key].views
                });
            }
        }
    
        tempCategoryViews.sort(
            function(a,b){
                return b.views - a.views;
            });
        
        tempRegionsCategoryViews.push(
            {
                name:regionsName[j],
                categoryViews:tempCategoryViews
            });
    }

    regionsCategoryViews = tempRegionsCategoryViews;

    if(callback!=null){
        callback();
    }   
}

function openPageGlobal(pageName,pageTitle,element,color) {
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
     
        case "RegionsVideoNum":
           
            cleanBarGraph();
            cleanPieGraph();
            getRegionsVideoNum(
                function(){
                    if(currPageName != pageName){
                        return;
                    }

                    loadBarGraph();
                    // loadPieGraph();

                    document.getElementById("bar-graph").style.display = "inline";
                    document.getElementById("pie-graph").style.display = "inline";
                    document.getElementById("loading").style.display = "none";
                }
            );
            break;
        case "RegionsCategoryViews":
           
            cleanBarGraph();
            cleanPieGraph();
            getRegionsCategoryViews(
                function(){
                    if(currPageName != pageName){
                        return;
                    }

                    // loadBarGraph();
                    
                    for(var i=0; i<regionsCategoryViews.length;i+=1){
                        loadPieGraph(
                            regionsCategoryViews[i].name,
                            regionsCategoryViews[i].categoryViews,
                        'title',
                        'views',
                        null);
                    }

                    // document.getElementById("bar-graph").style.display = "inline";
                    document.getElementById("pie-graph").style.display = "inline";
                    document.getElementById("loading").style.display = "none";
                }
            );
            break;
    }
}