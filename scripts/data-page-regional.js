function loadVideoData(callback){
    // console.log("loadVideoData");
    d3.csv(videoDataFilename,
        function(d){
            d.views = +d.views;
            d.likes = +d.likes;
            d.dislikes = +d.dislikes;
            d.comment_count = +d.comment_count;
            return d;
        },
        function(error,d){
            videoData=d;
            if(callback!=null){
                callback();
            }
        });
}

function getDeduplicatedVideoData(callback){
    // console.log("getDeduplicatedVideoData");

    if(videoDataDeduplicated!=null){
        if(callback!=null){
            callback();
        }
        return;
    }    

    videoDataDeduplicatedStartedLoading = true;

    if(urlExists("data/"+videoDataDeduplicatedFilename)==true){
        d3.csv("data/"+videoDataDeduplicatedFilename,
            function(d){
                d.views = +d.views;
                d.likes = +d.likes;
                d.dislikes = +d.dislikes;
                d.comment_count = +d.comment_count;
                return d;
            },
            function(error,d){
                
                videoDataDeduplicated=d;

                if(callback!=null){
                    callback();
                }
        });
        return;
    }

    if(videoData==null){
        loadVideoData(function(){
            getDeduplicatedVideoData(callback);
        });
        return;
    }

    dataSorted = videoData.slice(0);
    dataSorted = dataSorted.reverse();

    videoIdSet = [];
    temp=[];

    deduplicateSortedData(dataSorted,0,videoIdSet,temp,null,
        function(){
            videoDataDeduplicated = temp;

            var newCSVString = d3.csvFormat(videoDataDeduplicated);
            alert("Please place the downloaded data file in the 'data' folder under the project directory.");

            saveDataToFile(newCSVString, videoDataDeduplicatedFilename, 'text/plain');    

            if(callback!=null){
                callback();
            }
        }
    );                
   
}

