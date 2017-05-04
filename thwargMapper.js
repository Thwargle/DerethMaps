var content;
var context;
var points = new Array();
var dPoints = new Array();
var height = 2041;
var width = 2041;

var scale = 0.4;
var scaleMultiplier = 0.8;
var translatePos;

var a = height / 203.9;
var b = height - 101.9 * a;
var d = width / 203.9;
var e = width - 102 * d;

function draw() {
    base_image = new Image();
    base_image.src = 'highres.png';

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(translatePos.x, translatePos.y);
    context.scale(scale, scale);
    context.imageSmoothingEnabled = false;
    context.drawImage(base_image, 0, 0);

    var pointsArrayLength = points.length;
    var dPointsArrayLength = dPoints.length;

    for (i = 0; i < pointsArrayLength; i++)
    {
        drawPoint(context, points[i].y, points[i].x, 5, points[i].type);
    }
    for (i = 0; i < dPointsArrayLength; i++) {
        drawPoint(context, dPoints[i].y, dPoints[i].x, 5, dPoints[i].type);
    }

    context.restore();
}

function logLocation(canvas, scale, translatePos) {
        var ax = (translatePos.x - 400)/scale;
        var ay = (translatePos.y - 300)/scale;
        var w1 = canvas.width / scale;
        var h1 = canvas.height / scale;
        console.log("w1=" + Math.round(w1).toString() + ", h1=" + Math.round(h1).toString());
        console.log("ax=" + Math.round(ax).toString() + ", ay=" + Math.round(ay).toString());
        console.log("canvas.offsetWidth=" + Math.round(canvas.offsetWidth).toString() + ", canvas.offsetHeight=" + Math.round(canvas.offsetHeight).toString());
        console.log("tx1=" + Math.round(translatePos.x).toString() + ", ty1=" + Math.round(translatePos.y).toString());
        console.log("scale=" + scale.toString());
        console.log("canvas height: " + canvas.clientHeight + " canvas width: " + canvas.clientWidth);
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX,
        y: evt.clientY
    };
}

function getPoints() {
    points = new Array();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var totalItems = Object.keys(json).length;
            for (var i = 0; i < totalItems; i++)
            {
                var x = json[i].x;
                var y = json[i].y;

                if (x.includes('E'))
                {
                    x = x.substring(0, x.length - 1);
                    x = x * 1;
                }
                else
                {
                    xInt = x.substring(0, x.length - 1);
                    x = xInt * -1;
                }

                
                if(y.includes('S'))
                {
                    y = y.substring(0, y.length - 1);
                    y = y * 1;
                }
                else
                {
                    yInt = y.substring(0, y.length - 1);
                    y = yInt * -1;
                }

                var point = { type: json[i].Type, location: json[i].LocationName, x: x, y: y };
                points.push(point);
            }
            draw();
        }
    };
    xmlhttp.open("GET", "coords.json", true);
    xmlhttp.send();
}

function getDynamicPoints() {
    dPoints = new Array();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var totalItems = Object.keys(json).length;
            for (var i = 0; i < totalItems; i++) {
                var x = json[i].x;
                var y = json[i].y;

                if (x.includes('E')) {
                    x = x.substring(0, x.length - 1);
                    x = x * 1;
                }
                else {
                    xInt = x.substring(0, x.length - 1);
                    x = xInt * -1;
                }


                if (y.includes('S')) {
                    y = y.substring(0, y.length - 1);
                    y = y * 1;
                }
                else {
                    yInt = y.substring(0, y.length - 1);
                    y = yInt * -1;
                }

                var point = { type: json[i].Type, location: json[i].LocationName, x: x, y: y };
                dPoints.push(point);
            }
            draw();
        }
    };
    xmlhttp.open("GET", "dynamicCoords.json", true);
    xmlhttp.send();
}

function drawPoint(context, y, x, width, type) {
    var my = a * y + b;
    var mx = d * x + e;
    circleRadius = 8 / Math.sqrt(scale);
    rectWidth = 12 / Math.sqrt(scale);

    if (type == "Town")
    {
        if (document.getElementById("Town").checked) {
            town_image = new Image();
            town_image.src = 'images/townHouse.png';
            context.drawImage(town_image, mx - 10, my - 10);
        }
    }
    else if (type == "Hunting")
    {
        if (document.getElementById("Hunting").checked) {
            context.beginPath();
            context.arc(mx, my, circleRadius, 0, 2 * Math.PI);
            context.fillStyle = '#00FF00';
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = '#00FF00'
            context.stroke();
            context.closePath();
        }
    }
    else if (type == "Player")
    {
        if (document.getElementById("Player").checked) {
            player_image = new Image();
            player_image.src = 'images/playerHead.png';
            context.drawImage(player_image, mx - 10, my - 10);
        }
    }
}

window.onload = function () {
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");

    translatePos = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    var absoluteOffset = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    translatePos.x = 0;
    translatePos.y = 0;
    absoluteOffset.x = 0;
    absoluteOffset.y = 0;

    
    var startDragOffset = {};
    var mouseDown = false;

    // add button event listeners
    document.getElementById("plus").addEventListener("click", function(){
        absoluteOffset.x = (translatePos.x - 400)/scale;
        absoluteOffset.y = (translatePos.y - 300)/scale;
        
        scale /= scaleMultiplier;
        
        translatePos.x = (scale * absoluteOffset.x) + 400;
        translatePos.y = (scale * absoluteOffset.y) + 300;
        
        logLocation(canvas, scale, translatePos);
        
        draw();
    }, false);

    document.getElementById("minus").addEventListener("click", function(){
        absoluteOffset.x = (translatePos.x - 400)/scale;
        absoluteOffset.y = (translatePos.y - 300)/scale;
                                                                        
        scale *= scaleMultiplier;

        translatePos.x = (scale * absoluteOffset.x) + 400;
        translatePos.y = (scale * absoluteOffset.y) + 300;

        draw();
    }, false);

    document.getElementById("log").addEventListener("click", function(){
                                                                    
        logLocation(canvas, scale, translatePos);
        
        draw();
    }, false);

    document.getElementById("reset").addEventListener("click", function () {
        
    });

    // add event listeners to handle screen drag
    canvas.addEventListener("mousedown", function(evt){
        mouseDown = true;
        startDragOffset.x = evt.clientX - translatePos.x;
        startDragOffset.y = evt.clientY - translatePos.y;
    });

    canvas.addEventListener("mouseup", function(evt){
        mouseDown = false;
        absoluteOffset.x = (evt.clientX - 400)/scale;
        absoluteOffset.y = (evt.clientY - 300)/scale;
    });

    canvas.addEventListener("mouseover", function(evt){
        mouseDown = false;
    });

    canvas.addEventListener("mouseout", function(evt){
        mouseDown = false;
    });

    canvas.addEventListener("mousemove", function(evt){
        if (mouseDown) {
            translatePos.x = evt.clientX - startDragOffset.x;
            translatePos.y = evt.clientY - startDragOffset.y;
            draw();
        }
    });

    myCanvas.addEventListener('dblclick', function(evt){ 
        absoluteOffset.x = (translatePos.x - 400)/scale;
        absoluteOffset.y = (translatePos.y - 300)/scale;
        
        scale /= scaleMultiplier;
        
        translatePos.x = (scale * absoluteOffset.x) + 400;
        translatePos.y = (scale * absoluteOffset.y) + 300;
        
        logLocation(canvas, scale, translatePos);
        
        draw();
        mouseDown = false;
    });

    getPoints();
    getDynamicPoints();
    setInterval(function () { draw(); }, 100);
    setInterval(function () { getDynamicPoints(); }, 500);
};





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
