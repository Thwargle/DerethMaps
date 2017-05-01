function draw(scale, translatePos) {
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    var height = 2041;
    var width = 2041;


    var a = height / 203.9;
    var b = height - 101.9 * a;
    var d = width / 203.9;
    var e = width - 102 * d;

    base_image = new Image();
    base_image.src = 'highres.png';

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(translatePos.x, translatePos.y);
    context.scale(scale, scale);
    context.imageSmoothingEnabled = false;
    context.drawImage(base_image, 0, 0);

    context.fillStyle = "#0000ff";

    //Map Bounds:
    //Top Left: 102n, 101.9w
    //Bottom Right: 101.9s, 102e
    //Dereth is divided into a grid of 65,536 landblocks comprising a grid 256 blocks wide by 256 blocks high (values 0 to 255).

    ////top left
    drawPoints(context, -101.9, -102, a, b, d, e, 5);
    ////bottom left
    drawPoints(context, 102, -101.9, a, b, d, e, 5);
    ////top right
    drawPoints(context, -101.9, 102, a, b, d, e, 5);
    ////bottom right
    drawPoints(context, 102, 101.9, a, b, d, e, 5);

    ////Center
    drawPoints(context, 0, 0, a, b, d, e, 5);

    ////Yaraq
    drawPoints(context, 21.5, -1.8, a, b, d, e, 5);

    ////Caulcano
    drawPoints(context, 94.4, -94.6, a, b, d, e, 5);

    ////Qalaba'r
    drawPoints(context, 74.6, 19.6, a, b, d, e, 5);

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

                if (json[i].Type == "Town")
                {
                    document.getElementById("coordinates").innerHTML = document.getElementById("coordinates").innerHTML + " Town " + "Location: " + json[i].LocationName + ": " + x + ", " + y + '<br />';
                    //drawPoints(context, y, x, a, b, d, e, 5);
                    //console.log(context, y, x, a, b, d, e, 5);
                }
                if (json[i].Type == "Hunting")
                {
                    document.getElementById("coordinates").innerHTML = document.getElementById("coordinates").innerHTML + " Hunting " + "Location: " + json[i].LocationName + ": " + x + ", " + y + '<br />';
                }
                
            }
        }
    };
    xmlhttp.open("GET", "coords.json", true);
    xmlhttp.send();
}

function drawPoints(context, y, x, a, b, d, e, width) {
    var my = a * y + b;
    var mx = d * x + e;
    width = width * 100;
    context.beginPath();
    context.arc(mx, my, 3, 0, 2 * Math.PI);
    context.fillStyle = '#FF0000';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = '#FF0000'
    context.stroke();
    context.closePath();

}

window.onload = function(){
    var canvas = document.getElementById("myCanvas");

    var translatePos = {
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

    var scale = 0.4;
    var scaleMultiplier = 0.8;
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
        
        draw(scale, translatePos);
    }, false);

    document.getElementById("minus").addEventListener("click", function(){
        absoluteOffset.x = (translatePos.x - 400)/scale;
        absoluteOffset.y = (translatePos.y - 300)/scale;
                                                                        
        scale *= scaleMultiplier;

        translatePos.x = (scale * absoluteOffset.x) + 400;
        translatePos.y = (scale * absoluteOffset.y) + 300;

        draw(scale, translatePos);
    }, false);

    document.getElementById("log").addEventListener("click", function(){
                                                                    
        logLocation(canvas, scale, translatePos);
        
        draw(scale, translatePos);
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
            draw(scale, translatePos);
        }
    });

    myCanvas.addEventListener('dblclick', function(evt){ 
        absoluteOffset.x = (translatePos.x - 400)/scale;
        absoluteOffset.y = (translatePos.y - 300)/scale;
        
        scale /= scaleMultiplier;
        
        translatePos.x = (scale * absoluteOffset.x) + 400;
        translatePos.y = (scale * absoluteOffset.y) + 300;
        
        logLocation(canvas, scale, translatePos);
        
        draw(scale, translatePos);
        mouseDown = false;
    });

    setInterval(function () { draw(scale, translatePos); }, 100);
    getPoints();
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
