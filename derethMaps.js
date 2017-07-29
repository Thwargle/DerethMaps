var content;
var context;
var points = new Array();
var dPoints = new Array();
var highlightedPointName = "";
var landblockPointName = "";
var highlightedDynPoint = -1;
var landblockDynPoint = -1;
var gridCount = 256;
var displayMenu = true;
var copyCoords = "";

// dimensions of the map image we have
var imgWidth = 2041;
var imgHeight = 2041;

// dimensions of the world map in the game
var mapWidth = 203.9
var mapHeight = 203.9;

// landblock size in game dimensions
var landblockWidth = mapWidth / gridCount;
var landblockHeight = mapHeight / gridCount;

var scale = 0.9;
var scaleMultiplier = .9;
var translatePos;

var a = imgHeight / mapHeight;
var b = (imgHeight - 101.9 * a) - 1;
var d = imgWidth / mapWidth;
var e = imgWidth - 102 * d;

var xcenter = 0;
var ycenter = 0;

var locationArray = {};

var poiDict = {};

function fitToContainer(canvas) {
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function draw() {
    base_image = new Image();
    base_image.src = 'highres.png';

    var mobList = document.getElementById("mobList");
    var selectedMob = mobList.options[mobList.selectedIndex].value;


    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(translatePos.x, translatePos.y);
    context.scale(scale, scale);
    context.imageSmoothingEnabled = false;

    var mapAlpha = 1.0 - (document.getElementById("mapAlpha").value / 10.0);
    var oldAlpha = context.globalAlpha;
    context.globalAlpha = mapAlpha;
    context.drawImage(base_image, 0, 0);
    context.globalAlpha = oldAlpha;

    context.globalCompositeOperation = "lighter";

    imageOverlay = new Image();
    if (selectedMob != "None") {
        imageOverlay.src = 'http://mobtracker.yewsplugins.com/BigMaps/' + selectedMob + '.gif';
    }
    context.drawImage(imageOverlay, 0, 0);

    var dPointsArrayLength = dPoints.length;

    for (var poiName in poiDict) {
        var poitem = poiDict[poiName];
        var isHightlighted = (highlightedPointName == poitem.LocationName);
        var isLandblock = -1;
        drawPoint(context, poitem.x, poitem.y, 5, poitem.Type, poitem.Race, poitem.Special, isHightlighted, isLandblock);
    }
    for (i = 0; i < dPointsArrayLength; i++) {
        var isHightlighted = (highlightedDynPoint == i);
        var isLandblock = (landblockDynPoint == i);
        drawPoint(context, dPoints[i].x, dPoints[i].y, 5, dPoints[i].Type, dPoints[i].Race, dPoints[i].Special, isHightlighted, isLandblock);
    }
    if (document.getElementById("DisplayLandblockGrid").checked) {
        drawGrid();
    }
    if (document.getElementById("DisplayHighlightLandblocks").checked) {
        colorLandblocks(context);
    }
    context.restore();
}

function logLocation(canvas, scale, translatePos) {
    var ax = (translatePos.x - xcenter) / scale;
    var ay = (translatePos.y - ycenter) / scale;
    var w1 = canvas.width / scale;
    var h1 = canvas.height / scale;
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function includesSubstring(x, sub) {
    return x.indexOf(sub) >= 0;
}

function getMobList() {
    mobList = new Array();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            mobList = this.responseText.split(/\n/);
            for (var i = 0; i < mobList.length; i++) {
                var mobText = mobList[i].trimRight();
                var mobOption = new Option(mobText, mobText);
                $('#mobList').append(mobOption);
            }
            $.getScript("dropSearch/chosen.jquery.js", function (data, textStatus, jqxhr) {
                $.getScript("dropSearch/docsupport/prism.js", function (data, textStatus, jqxhr) {
                    $.getScript("dropSearch/docsupport/init.js", function (data, textStatus, jqxhr) {
                    });
                });
            });
        }
    };
    xmlhttp.open("GET", "mobList.txt", true);
    xmlhttp.send();
}

function getPoints() {
    poiDict = {};
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var totalItems = Object.keys(json).length;
            for (var i = 0; i < totalItems; i++) {
                var x = json[i].x;
                var y = json[i].y;
                var landblock = json[i].locationString;

                if ("undefined" === typeof json[i].locationString) {
                    if (includesSubstring(x, 'E')) {
                        x = x.substring(0, x.length - 1);
                        x = x * 1;
                    }
                    else {
                        xInt = x.substring(0, x.length - 1);
                        x = xInt * -1;
                    }


                    if (includesSubstring(y, 'S')) {
                        y = y.substring(0, y.length - 1);
                        y = y * 1;
                    }
                    else {
                        yInt = y.substring(0, y.length - 1);
                        y = yInt * -1;
                    }
                }
                else {
                    var locationString = json[i].locationString;

                    // Figure out landblock coordinates
                    var lbX = locationString.substring(0, 2);
                    var lbY = locationString.substring(2, 4);

                    var lbCoordX = parseInt(lbX, 16);
                    var lbCoordY = parseInt(lbY, 16);
                    // Convert landblock coordinates into map coordinates
                    var coords = coordsFromLandblock(lbCoordX, lbCoordY);

                    // Figure out the landcell coordinates
                    var tokens = locationString.split(' ');
                    var lcx = tokens[2];
                    var lcy = tokens[1];

                    // Convert landcell coordinates to map offsets
                    var offsetX = landblockWidth * ((lcx - 1) / 192);
                    var offsetY = landblockHeight * ((lcy - 1) / 192);

                    // Combine to get final map coordinates
                    var cx = coords.x + offsetX;
                    var cy = coords.y + offsetY;

                    x = cx;
                    y = cy;
                }

                var point = { Type: json[i].Type, Race: json[i].Race, Special: json[i].Special, LocationName: json[i].LocationName, x: x, y: y };
                //points.push(point);

                if (point.LocationName in poiDict == false) {
                    poiDict[point.LocationName] = point;
                } else {
                    console.log("Duplicate location name: " + point.LocationName);
                }
            }
            getWikiPoints();
        }
    };


    xmlhttp.open("GET", "coords.json?_=" + new Date().getTime().toString(), true);
    xmlhttp.send();
}

function getWikiPoints() {
    points = new Array();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var totalItems = Object.keys(json).length;
            for (var i = 0; i < totalItems; i++) {
                var wikiLocation = json[i].location; // format is "9.6N 36.9E" or "22.5N, 4.9E"
                wikiLocation = wikiLocation.replace(",", "");
                var sep = wikiLocation.indexOf(" ");
                // Note that y is first and x is second
                var y = wikiLocation.substring(0, sep);
                var x = wikiLocation.slice(sep - wikiLocation.length);
                var landblock = json[i].locationString;

                if (includesSubstring(x, 'E')) {
                    x = x.substring(0, x.length - 1);
                    x = x * 1;
                }
                else {
                    xInt = x.substring(0, x.length - 1);
                    x = xInt * -1;
                }


                if (includesSubstring(y, 'S')) {
                    y = y.substring(0, y.length - 1);
                    y = y * 1;
                }
                else {
                    yInt = y.substring(0, y.length - 1);
                    y = yInt * -1;
                }

                var point = { Type: "Housing", LocationName: json[i].name, x: x, y: y};
                point["HouseCount"] = json[i].houseCount;
                //point["ImgUrl"] = json["imgUrl-src"];

                if (point.LocationName in poiDict == false) {
                    poiDict[point.LocationName] = point;
                } else {
                    console.log("Duplicate location name: " + point.LocationName);
                }
            }
        }
    };


    xmlhttp.open("GET", "housing.json?_=" + new Date().getTime().toString(), true);
    xmlhttp.send();
}


function getDynamicPlayers() {
    dPoints = new Array();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var totalItems = Object.keys(json).length;
            for (var i = 0; i < totalItems; i++) {
                var sx = json[i].x;
                var sy = json[i].y;

                var x = decodeMapString(sx);
                var y = decodeMapString(sy);

                var point = { Type: json[i].Type, Location: json[i].LocationName, Race: json[i].Race, x: x, y: y };
                dPoints.push(point);
            }
            reloadLocationArray(dPoints);
            draw();
        }
    };
    xmlhttp.open("GET", "dynamicPlayers.json?_=" + new Date().getTime().toString(), true);
    xmlhttp.send();
}
// Convert strings to numbers, eg, 10.0W => -10.0
function decodeMapString(mstr) {
    if (includesSubstring(mstr, 'E') || includesSubstring(mstr, 'S')) {
        val = mstr.substring(0, mstr.length - 1);
        val = val * 1;
    }
    else {
        val = mstr.substring(0, mstr.length - 1);
        val = val * -1;
    }
    return val;
}
function reloadLocationArray(dPoints) {
    locationArray = {};
    var dPointsArrayLength = dPoints.length;
    for (i = 0; i < dPointsArrayLength; i++) {
        var dpt = dPoints[i];
        var block = getLandblock(dpt.x, dpt.y);
        if (block.x in locationArray == false) {
            locationArray[block.x] = {};
        }
        if (block.y in locationArray[block.x] == false) {
            locationArray[block.x][block.y] = {};
        }
        if (dpt.Type == "Player") {
            locationArray[block.x][block.y].Players = 1;
        } else if (dpt.Type == "Landblock") {
            locationArray[block.x][block.y].Activated = 1;
        }
    }
}
function scoords(x, y) {
    return sdisp2(x).toString() + ", " + sdisp2(y).toString();
}
function sdisp2(val) {
    return Math.round(val * 100) / 100;
}
function drawPoint(context, x, y, width, Type, Race, Special, isHighlighted, isLandblock) {
    // Convert map coordinates to canvas coordinates
    var canx = d * x + e;
    var cany = a * y + b;
    circleRadius = 3 / Math.sqrt(scale);
    rectWidth = 10 / Math.sqrt(scale);

    if (Type == "Town") {
        if (document.getElementById("DisplayTown").checked) {
            town_image = new Image();
            if (Race == "Aluvian") {
                town_image.src = 'images/Map_Point_Aluv_Town.png';
            }
            else if (Race == "Sho") {
                town_image.src = 'images/Map_Point_Sho_Town.png';
            }
            else if (Race == "Gharu'ndim") {
                town_image.src = 'images/Map_Point_Gharu_Town.png';
            }
            else if (Race == "Viamontian") {
                town_image.src = 'images/castleTower.png';
            }
            else {
                town_image.src = 'images/Map_Point_Town.png';
            }
            context.drawImage(town_image, canx - rectWidth / 2, cany - rectWidth / 2, rectWidth, rectWidth);
        }
    }
    else if (Type == "Cottages" || Type == "Housing") {
        if (document.getElementById("DisplayHousing").checked) {
            context.beginPath();
            context.arc(canx, cany, circleRadius, 0, 2 * Math.PI);
            context.fillStyle = '#00FF00';
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = '#00FF00'
            context.stroke();
            context.closePath();
        }
    }
    else if (Type == "Player") {
        if (document.getElementById("DisplayPlayer").checked) {
            player_image = new Image();
            player_image.src = 'images/playerHead.png';
            context.drawImage(player_image, canx, cany - 10, 3, 3);
        }
    }

    if (isHighlighted) {
        var oldAlpha = context.globalAlpha;
        context.globalAlpha = 0.5;
        context.fillStyle = "red";
        context.fillRect(canx - rectWidth / 2, cany - rectWidth / 2, rectWidth, rectWidth);
        context.globalAlpha = oldAlpha;
    }
}
function clearSelection() {
    highlightedDynPoint = -1;
    highlightedPoint = -1;
    highlightedPointName = "";
    var coordinatesElement = document.getElementById("Coordinates");
    coordinatesElement.innerHTML = "";
    var collisionElement = document.getElementById("CollisionInfo");
    collisionElement.innerHTML = "";
    var landblockElement = document.getElementById("LandblockInfo");
    landblockElement.innerHTML = "";
    document.getElementsByClassName("chosen-single").innerHTML = "None";

    //var threeSixtyView = document.getElementById("360");
    //threeSixtyView.src = "";
}
function collides(x, y) {
    var isCollision = false;
    var isLandblock = false;
    //var threeSixtyView = document.getElementById("360");
    for (var poiName in poiDict) {
        var poitem = poiDict[poiName];
        var left = poitem.x - (1 / Math.sqrt(scale)), right = poitem.x + (1 / Math.sqrt(scale));
        var top = poitem.y - (1 / Math.sqrt(scale)), bottom = poitem.y + (1 / Math.sqrt(scale));
        var type = poitem.Type;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = true;
            isLandblock = true;

            if (type == "Landblock") {
                landblockDynPoint = true;
            }
            else if(type == "Town" && document.getElementById("DisplayTown").checked) {
                getPointDataHTML(poitem);
            }
            else if (type == "Housing" && document.getElementById("DisplayHousing").checked) {
                getPointDataHTML(poitem);
            }
            else
            {

            }
        }
    }
}

function getPointDataHTML(poitem) {
    var collisionElement = document.getElementById("CollisionInfo");
    collisionElement.innerHTML = "";
    var type = poitem.Type;
    var locationName = poitem.LocationName;
    highlightedPointName = locationName;
    landblockPointName = locationName;
    var race = poitem.Race;
    var special = poitem.Special;
    var houseCount = poitem.HouseCount;
    var html = "Type: " + type;

    if (locationName != undefined && locationName != "") {
        html += "<br />" + "Location Name: " + locationName;
    }
    if (race != undefined && race != "") {
        html += "<br />" + "Location Race: " + race;
    }
    if (special != undefined && special != "") {
        html += "<br />" + "Special: " + special;
    }

    if (houseCount != undefined && houseCount != "") {
        html += "<br />" + "Houses: " + houseCount;
    }

    collisionElement.innerHTML = html;

    var threeSixtySource = locationName.replace(/\s+/g, '') + ".html";

    if (threeSixtySource == "GlendenWood.html") {
        //threeSixtyView.src = threeSixtySource;
        //document.getElementById("iframeHolder").style.display = "block";
    }
    else {
        //threeSixtyView.src = "";
        //document.getElementById("iframeHolder").style.display = "none";
    }
}

function colorLandblocks(context) {
    var canvasBlockWidth = landblockWidth * d;
    var canvasBlockHeight = landblockHeight * a;
    for (bx in locationArray) {
        for (by in locationArray[bx]) {
            var block = locationArray[bx][by];
            var x = (bx - 128) * landblockWidth;
            var y = (126 - by) * landblockHeight;
            // Convert map coordinates to canvas coordinates
            var canx = d * x + e;
            var cany = a * y + b;

            var color = "red";
            if (block.Players > 0) {
                color = "green";
            }
            if (block.Activated) {
                color = "blue";
            }
            var oldAlpha = context.globalAlpha;
            context.globalAlpha = 0.8;
            context.fillStyle = color;
            context.fillRect(canx, cany, canvasBlockWidth, canvasBlockHeight);
            context.globalAlpha = oldAlpha;
        }
    }
}
function drawGrid() {
    var linewidth = 0.5;

    context.strokeStyle = "black";

    for (var xf = 0; xf <= 1.0; xf += 1 / 256.0) {
        mx = -102 + (xf * 203.9);
        var cantop = mapToCanvas(mx, -101.9);
        var canbtm = mapToCanvas(mx, +102);
        // Convert map coordinates to canvas coordinates
        context.beginPath();
        context.moveTo(linewidth + cantop.x, cantop.y);
        context.lineTo(linewidth + canbtm.x, canbtm.y);
        context.closePath();
        context.stroke();
    }

    for (var yf = 0; yf <= 1.0; yf += 1 / 256.0) {
        my = -101.9 + (yf * 203.9);
        var canleft = mapToCanvas(-102, my);
        var canrt = mapToCanvas(+101.9, my);
        // Convert map coordinates to canvas coordinates
        context.beginPath();
        context.moveTo(canleft.x, canrt.y - linewidth);
        context.lineTo(canrt.x, canrt.y - linewidth);
        context.stroke();
    }
}
function mapToCanvas(mx, my) {
    var canx = d * mx + e;
    var cany = a * my + b;
    return { x: canx, y: cany };
}
function getLandblock(mx, my) {
    var xfract = (mx - (-101.9)) / (102 - (-101.9));
    var yfract = 1 - (my - (-102)) / (101.9 - (-102));
    var block = {
        x: Math.floor(xfract * gridCount),
        y: Math.floor(yfract * gridCount)
    };
    return block;
}

function coordsFromLandblock(lbX, lbY) {
    var xfract = lbX / gridCount;
    var yfract = (lbY + 1) / gridCount;
    var mx = -101.9 + (102 - (-101.9)) * xfract;
    var my = -102 + (101.9 - (-102)) * (1 - yfract);
    var coord = { x: mx, y: my };
    return coord;
}

function showMenu() {
    if (displayMenu) {
        displayMenu = false;
        document.getElementById("derethMenu").innerText = "Show Menu";
        document.getElementById("menuItems").style.display = 'none';
        //document.getElementById("iframeHolder").style.display = 'none';
    }
    else {
        displayMenu = true;
        document.getElementById("derethMenu").innerText = "Hide Menu";
        document.getElementById("menuItems").style.display = 'block';
        //document.getElementById("iframeHolder").style.display = 'block';
    }
}

function showLandblockClicked() {
    if (document.getElementById("DisplayLandblockGrid").checked) {
        document.getElementById("mapAlpha").value = 5;
    }
    else {
        document.getElementById("mapAlpha").value = 0;
    }
}

function displayResize() {
    fitToContainer(document.getElementById("myCanvas"));
}

function copyToClipboard() {
    var text = copyCoords;
    window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

(function ($) {
    $.fn.disableSelection = function () {
        return this.each(function () {
            if (typeof this.onselectstart != 'undefined') {
                this.onselectstart = function () { return false; };
            } else if (typeof this.style.MozUserSelect != 'undefined') {
                this.style.MozUserSelect = 'none';
            } else {
                this.onmousedown = function () { return false; };
            }
        });
    };
})(jQuery);

window.onload = function () {
    xcenter = document.getElementById("myCanvas").offsetWidth;
    ycenter = document.getElementById("myCanvas").offsetHeight;
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
    fitToContainer(canvas);
    getMobList();

    console.log("a,b=" + scoords(a, b) + ", d,e=" + scoords(d, e));
    console.log("canvas: " + scoords(canvas.clientWidth, canvas.clientHeight));

    var coordinates = coordsFromLandblock(00, 00);

    translatePos = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    var absoluteOffset = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    // Viewport offset in relative (screen) numbers
    translatePos.x = 0;
    translatePos.y = 0;

    // Viewport offset in absolute (canvas) numbers
    absoluteOffset.x = 0;
    absoluteOffset.y = 0;


    var startDragOffset = {};
    var mouseDown = false;

    // add button event listeners
    document.getElementById("plus").addEventListener("click", function () {
        absoluteOffset.x = (translatePos.x - xcenter) / scale;
        absoluteOffset.y = (translatePos.y - ycenter) / scale;

        scale /= scaleMultiplier;

        translatePos.x = (scale * absoluteOffset.x) + xcenter;
        translatePos.y = (scale * absoluteOffset.y) + ycenter;

        logLocation(canvas, scale, translatePos);

        draw();
    }, false);

    document.getElementById("minus").addEventListener("click", function () {
        absoluteOffset.x = (translatePos.x - xcenter) / scale;
        absoluteOffset.y = (translatePos.y - ycenter) / scale;

        scale *= scaleMultiplier;

        translatePos.x = (scale * absoluteOffset.x) + xcenter;
        translatePos.y = (scale * absoluteOffset.y) + ycenter;

        draw();
    }, false);

    document.getElementById("log").addEventListener("click", function () {

        logLocation(canvas, scale, translatePos);

        draw();
    }, false);

    document.getElementById("reset").addEventListener("click", function () {
        var coordinates = coordsFromLandblock(00, 00);

        translatePos = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        var absoluteOffset = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        // Viewport offset in relative (screen) numbers
        translatePos.x = 0;
        translatePos.y = 0;

        // Viewport offset in absolute (canvas) numbers
        absoluteOffset.x = 0;
        absoluteOffset.y = 0;

        var startDragOffset = {};
        var mouseDown = false;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(translatePos.x, translatePos.y);
        scale = .9;
    });

    // add event listeners to handle screen drag
    canvas.addEventListener("mousedown", function (evt) {
        mouseDown = true;
        $('*').disableSelection();
        startDragOffset.x = evt.clientX - translatePos.x;
        startDragOffset.y = evt.clientY - translatePos.y;
    });

    canvas.addEventListener("mouseup", function (evt) {
        mouseDown = false;

        // Get mouse position inside canvas screen (removes client side offsets)
        var mpos = getMousePos(canvas, evt)

        // Convert to canvas coordinates
        var canco = {
            x: (mpos.x - translatePos.x) / scale,
            y: (mpos.y - translatePos.y) / scale
        };

        // Convert to map coordinates (invert the ax+b, dx+e formula)
        var mapco = {
            x: (canco.x - b) / a,
            y: (canco.y - e) / d
        };

        clearSelection();
        displayCoord(mapco.x, mapco.y);
        collides(mapco.x, mapco.y);
        displayLandblock(mapco.x, mapco.y);

    });

    function displayLandblock(mx, my) {
        block = getLandblock(mx, my);
        document.getElementById("LandblockInfo").innerHTML = "Landblock: " + block.x + " (0x" + block.x.toString(16) + ") " + block.y + " (0x" + block.y.toString(16) + ")";
    }
    function displayCoord(x, y) {
        var multiplier = Math.pow(10, 1 || 0);
        var roundedX = Math.round(x * multiplier) / multiplier;
        var roundedY = Math.round(y * multiplier) / multiplier;
        var xWithCompass;
        var yWithCompass;
        if (roundedX > 0) {
            xWithCompass = Math.abs(roundedX).toString() + "E";
        }
        else if (roundedX < 0) {
            xWithCompass = Math.abs(roundedX).toString() + "W";
        }
        if (roundedY > 0) {
            yWithCompass = Math.abs(roundedY).toString() + "S";
        }
        else if (roundedY < 0) {
            yWithCompass = Math.abs(roundedY).toString() + "N";
        }

        document.getElementById("Coordinates").innerHTML = "Coordinates: " + yWithCompass + ", " + xWithCompass;
        copyCoords = yWithCompass + ", " + xWithCompass;

    }
    canvas.addEventListener("mousewheel", function (evt) {
        if ((evt.wheelDelta / Math.abs(evt.wheelDelta)) >= 0) {
            absoluteOffset.x = (translatePos.x - evt.clientX) / scale;
            absoluteOffset.y = (translatePos.y - evt.clientY) / scale;

            scale /= scaleMultiplier;

            translatePos.x = (scale * absoluteOffset.x) + evt.clientX;
            translatePos.y = (scale * absoluteOffset.y) + evt.clientY;

            draw();
        }
        else {
            absoluteOffset.x = (translatePos.x - evt.clientX) / scale;
            absoluteOffset.y = (translatePos.y - evt.clientY) / scale;

            scale *= scaleMultiplier;

            translatePos.x = (scale * absoluteOffset.x) + evt.clientX;
            translatePos.y = (scale * absoluteOffset.y) + evt.clientY;

            draw();
        }
    });
    canvas.addEventListener("DOMMouseScroll", function (evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta : -evt.detail;
        console.log(evt);
        if (delta >= 0) {
            absoluteOffset.x = (translatePos.x - evt.clientX) / scale;
            absoluteOffset.y = (translatePos.y - evt.clientY) / scale;

            scale /= scaleMultiplier;

            translatePos.x = (scale * absoluteOffset.x) + evt.clientX;
            translatePos.y = (scale * absoluteOffset.y) + evt.clientY;

            draw();
        }
        else {
            absoluteOffset.x = (translatePos.x - evt.clientX) / scale;
            absoluteOffset.y = (translatePos.y - evt.clientY) / scale;

            scale *= scaleMultiplier;

            translatePos.x = (scale * absoluteOffset.x) + evt.clientX;
            translatePos.y = (scale * absoluteOffset.y) + evt.clientY;

            draw();
        }
    });
    canvas.addEventListener("mouseover", function (evt) {
        mouseDown = false;
    });

    canvas.addEventListener("mouseout", function (evt) {
        mouseDown = false;
    });

    canvas.addEventListener("mousemove", function (evt) {
        if (mouseDown) {
            translatePos.x = evt.clientX - startDragOffset.x;
            translatePos.y = evt.clientY - startDragOffset.y;
            draw();
        }
    });

    myCanvas.addEventListener('dblclick', function (evt) {
        absoluteOffset.x = (translatePos.x - xcenter) / scale;
        absoluteOffset.y = (translatePos.y - ycenter) / scale;

        scale /= scaleMultiplier;

        translatePos.x = (scale * absoluteOffset.x) + xcenter;
        translatePos.y = (scale * absoluteOffset.y) + ycenter;

        logLocation(canvas, scale, translatePos);

        draw();
        mouseDown = false;
    });

    getPoints();
    getDynamicPlayers();
    setInterval(function () { draw(); }, 1500);
    setInterval(function () { getDynamicPlayers(); }, 1800);
};




// http://acpedia.org/wiki/Template:Map_Point_Plus
// Look here for a list of map icons
//
//Map Bounds:
//Top Left: 102n, 101.9w
//Bottom Right: 101.9s, 102e
//Dereth is divided into a grid of 65,536 landblocks comprising a grid 256 blocks wide by 256 blocks high (values 0 to 255).

////top left
//drawPoints(context, -101.9, -102, a, b, d, e, 5);
////bottom left
//drawPoints(context, 102, -101.9, a, b, d, e, 5);
////top right
//drawPoints(context, -101.9, 102, a, b, d, e, 5);
////bottom right
//drawPoints(context, 102, 101.9, a, b, d, e, 5);

////Center
//drawPoints(context, 0, 0, a, b, d, e, 5);

////Yaraq
////drawPoints(context, 21.5, -1.8, a, b, d, e, 5);

////Caulcano
//drawPoints(context, 94.4, -94.6, a, b, d, e, 5);

////Qalaba'r
//drawPoints(context, 74.6, 19.6, a, b, d, e, 5);
//

///Yaraq
/// 21.5s, 1.8w
/// 7D64000D 31.90 105.93 11.84 0.58 0.00 0.00 -0.82




///FROM PEA:
/// this is the coordinate math to get an in-game coordinate from a landcell.
//void PrintCoords(DWORD landcell)
//{
//    int landcell_x_offset = (((landcell >> 24) & 0xFF) << 3) | (((landcell - 1) >> 3) & 7);
//int landcell_y_offset = (((landcell >> 16) & 0xFF) << 3) | (((landcell - 1) >> 0) & 7);

//double coord_x = ((double)(landcell_x_offset - 1024) * 0.1 + 0.5);
//double coord_y = ((double)(landcell_y_offset - 1024) * 0.1 + 0.5);

//printf("Coords for landcell %08X are %.1f %.1f (west and south are negative, east and north are positive)\n", landcell, coord_x, coord_y);
//}