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

var xcenter = 410;
var ycenter = 410;

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
        drawPoint(context, points[i].y, points[i].x, 5, points[i].type, points[i].race, points[i].special);
    }
    for (i = 0; i < dPointsArrayLength; i++) {
        drawPoint(context, dPoints[i].y, dPoints[i].x, 5, dPoints[i].type, dPoints[i].race, dPoints[i].special);
    }

    context.restore();
}

function logLocation(canvas, scale, translatePos) {
        var ax = (translatePos.x - xcenter)/scale;
        var ay = (translatePos.y - ycenter)/scale;
        var w1 = canvas.width / scale;
        var h1 = canvas.height / scale;
        console.log("canvas: " + scoords(w1, h1) + ", offset: " + scoords(canvas.offsetWidth, canvas.offsetHeight));
        console.log("canvasClient: " + scoords(canvas.clientWidth, canvas.clientHeight));
        console.log("ax/y=" + scoords(ax, ay));
        console.log("tx/y=" + scoords(translatePos.x, translatePos.y));
        console.log("scale=" + sdisp2(scale));
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
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

                var point = { type: json[i].Type, race: json[i].Race, special: json[i].Special, location: json[i].LocationName, x: x, y: y };
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

function scoords(x, y) {
    return sdisp2(x).toString() + ", " + sdisp2(y).toString();
}
function sdisp2(val) {
    return Math.round(val * 100) / 100;
}
function drawPoint(context, y, x, width, type, race, special) {
    // Convert map coordinates to canvas coordinates
    var my = a * y + b;
    var mx = d * x + e;
    circleRadius = 8 / Math.sqrt(scale);
    rectWidth = 10 / Math.sqrt(scale);

    if (type == "Town")
    {
        if (document.getElementById("Town").checked) {
            town_image = new Image();
            if (race == "Aluvian") {
                town_image.src = 'images/Map_Point_Aluv_Town.png';
            }
            else if (race == "Sho") {
                town_image.src = 'images/Map_Point_Sho_Town.png';
            }
            else if (race == "Gharu'ndim") {
                town_image.src = 'images/Map_Point_Gharu_Town.png';
            }
            else if (race == "Viamontian") {
                town_image.src = 'images/castleTower.png';
            }
            else {
                town_image.src = 'images/Map_Point_Town.png';
            }
            context.drawImage(town_image, mx, my-rectWidth/2, rectWidth, rectWidth);
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
            context.drawImage(player_image, mx - 10, my - 10, rectWidth, rectWidth);
        }
    }
}

function collides(points, x, y) {
    var isCollision = false;
    for (var i = 0; i < points.length; i++) {
        var left = points[i].x - (1 / Math.sqrt(scale)), right = points[i].x + (1 / Math.sqrt(scale));
        var top = points[i].y - (1 / Math.sqrt(scale)), bottom = points[i].y + (1 / Math.sqrt(scale));
        var type = points[i].Type;
        var race = points[i].Race;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = true;
            console.log(points[i].x, points[i].y);
            console.log("Clicked: " + type + " " + race);
        }
    }
}

window.onload = function () {
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");

    console.log("a,b=" + scoords(a, b) + ", d,e=" + scoords(d, e));
    console.log("canvas: " + scoords(canvas.clientWidth, canvas.clientHeight));

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
    document.getElementById("plus").addEventListener("click", function(){
        absoluteOffset.x = (translatePos.x - xcenter)/scale;
        absoluteOffset.y = (translatePos.y - ycenter)/scale;
        
        scale /= scaleMultiplier;
        
        translatePos.x = (scale * absoluteOffset.x) + xcenter;
        translatePos.y = (scale * absoluteOffset.y) + ycenter;
        
        logLocation(canvas, scale, translatePos);
        
        draw();
    }, false);

    document.getElementById("minus").addEventListener("click", function(){
        absoluteOffset.x = (translatePos.x - xcenter) / scale;
        absoluteOffset.y = (translatePos.y - ycenter) / scale;
                                                                        
        scale *= scaleMultiplier;

        translatePos.x = (scale * absoluteOffset.x) + xcenter;
        translatePos.y = (scale * absoluteOffset.y) + ycenter;

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

        console.log("mapxy: " + scoords(mapco.x, mapco.y));

        displayCoord(mapco.x, mapco.y);
        collides(points, mapco.x, mapco.y);

    });

    function displayCoord(x, y) {
        var multiplier = Math.pow(10, 1 || 0);
        var roundedX = Math.round(x * multiplier) / multiplier;
        var roundedY = Math.round(y * multiplier) / multiplier;
        var xWithCompass;
        var yWithCompass;
        if (roundedX > 0)
        {
            xWithCompass = Math.abs(roundedX).toString() + "E";
        }
        else if (roundedX < 0)
        {
            xWithCompass = Math.abs(roundedX).toString() + "W";
        }
        if (roundedY > 0) {
            yWithCompass = Math.abs(roundedY).toString() + "N";
        }
        else if (roundedY < 0) {
            yWithCompass = Math.abs(roundedY).toString() + "S";
        }


        document.getElementById("debug").innerHTML = "cx=" + xWithCompass + ", cy=" + yWithCompass;

    }
    canvas.addEventListener("mousewheel", function (evt) {
        console.log(evt.wheelDelta);
        if (Math.sign(evt.wheelDelta) >= 0)
        {
            absoluteOffset.x = (translatePos.x - xcenter) / scale;
            absoluteOffset.y = (translatePos.y - ycenter) / scale;

            scale /= scaleMultiplier;

            translatePos.x = (scale * absoluteOffset.x) + xcenter;
            translatePos.y = (scale * absoluteOffset.y) + ycenter;

            draw();
        }
        else
        {
            absoluteOffset.x = (translatePos.x - xcenter) / scale;
            absoluteOffset.y = (translatePos.y - ycenter) / scale;

            scale *= scaleMultiplier;

            translatePos.x = (scale * absoluteOffset.x) + xcenter;
            translatePos.y = (scale * absoluteOffset.y) + ycenter;

            draw();
        }
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
    getDynamicPoints();
    setInterval(function () { draw(); }, 1500);
    setInterval(function () { getDynamicPoints(); }, 1800);
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
