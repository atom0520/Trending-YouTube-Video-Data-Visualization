# Trending YouTube Video Data Visualization
### For MM802 Mini Project

Members: [ Atom(Shufan) Cai, Yohannes Woldemichael ]

<br/>

This web application is developed using JavaScript, jQuery, and D3.js. According to our test, the application can run properly on Apache v2.4.29 on Windows.

<br/>

## How to run the application 

 * Set up the Apache server.
 
 * Put all the project files in the Apache web root folder (Eg: "Apache24\htdocs\" on Windows) 
 
 * Start the Apache server

 * Open a web browser, and in the address bar enter the IP address bound to the Apache server (Eg: "localhost" in default). Then press Enter and the browser would navigate to the index page of the web application.

<br/>

## Explanations for files and folders

 * ### "css" folder:
    The folder contains the cascading style sheets used in the web application.
 * ### "data" folder:
    The folder contains the original trending YouTube video data files from Kaggle ("video_data_xx.csv" and "category_data_xx.json" see our project report for more detailed descriptions), some cached pre-processed data for boosting the web page loading speed ("video_data_dedup_xx.csv"), and the data required by the world map functionality in the application.
 * ### "fonts" folder:
    The folder contains the files of some special fonts and symbols used in the application.
 * ### "imgs" folder:
    The folder contains the images used on the web pages.
 * ### "scripts" folder:
    The folder contains the scripts used in the application, which include our self-written scripts, the jQuery library, the D3.js library, and the scripts from some open source projects like DataMaps.
 * ### "index.html":
    The HTML file for the index web page.
 * ### "CanadaData.html", "USAData.html", "BritainData.html", "FranceData.html", "GermanyData.html":
    The HTML files for the web pages that visualize the data of different countries.
 * ### "GlobalData.html":
    The HTML file for the web page that combines the data of all countries and visualizes the global data. 