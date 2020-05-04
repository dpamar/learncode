//Constants
var FLT_MAX = 10000.0;
var kPointsPerStroke = 32;

//Ctor for the CPoint2D metadata
function CPoint2D(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

//Ctor for the CStroke metadata
function CStroke() {
    this.points = [];
}

//Ctor for the CGesture metadata
function CGesture() {
    this.strokes = [];
}

//Scale a gesture to 1 unit
function NormalizeSize(gesture) {
    //Scaling initialization
    if (!gesture) return;
    var minX = FLT_MAX;
    var maxX = -FLT_MAX;
    var minY = FLT_MAX;
    var maxY = -FLT_MAX;

    //Find the scale value
    for (var i = 0; i < gesture.strokes.length; i++) {
        var stroke = gesture.strokes[i];
        for (var j = 0; j < stroke.points.length; j++) {
            var pt = stroke.points[j];
            if (minX > pt.x) minX = pt.x;
            if (minY > pt.y) minY = pt.y;
            if (maxX < pt.x) maxX = pt.x;
            if (maxY < pt.y) maxY = pt.y;
        }
    }
    var width = maxX - minX;
    var height = maxX - minX;
    var scale = (width > height) ? width : height;
    if (scale <= 0.0) return;
    scale = 1 / scale;

    //Performs the scaling
    for (var i = 0; i < gesture.strokes.length; i++) {
        var stroke = gesture.strokes[i];
        for (var j = 0; j < stroke.points.length; j++) {
            var pt = stroke.points[j];
            pt.x = pt.x * scale;
            pt.y = pt.y * scale;
        }
    }
}

//Gets the length of given stroke
function GetStrokeLength(stroke) {
    //Initialization
    if (!stroke) return 0;
    if (stroke.points.length <= 1) return 0;
    var length = 0.0;

    //Points iteration
    var initPt = stroke.points[0];
    for (var i = 1; i < stroke.points.length; i++) {
        var finalPt = stroke.points[i];
        var dx = finalPt.x - initPt.x;
        var dy = finalPt.y - initPt.y;
        length += Math.sqrt(dx * dx + dy * dy);
        initPt = finalPt;
    }
    return length;
}

function NormalizeSpacing(stroke) {
    if (!stroke) return;
    var result = new CStroke();
    var length = GetStrokeLength(stroke);
    if (length <= 0) return result;
    length = length / (kPointsPerStroke - 1);
    var currentPointIndex = 0;
    var currentOldPointIndex = 0;

    result.points[currentPointIndex++] = stroke.points[currentOldPointIndex];
    var startPt = stroke.points[currentOldPointIndex];
    var endPt = stroke.points[currentOldPointIndex];
    currentOldPointIndex++;

    var endOldDist = 0.0;
    var startOldDist = 0.0;
    var newDist = 0.0;
    var currSegmentLen = 0.0;

    while (true) {
        var excess = endOldDist - newDist;
        if (excess >= length) {
            newDist += length;
            var ratio = (newDist - startOldDist) / currSegmentLen;
            var newPt = new CPoint2D((endPt.x - startPt.x) * ratio + startPt.x, (endPt.y - startPt.y) * ratio + startPt.y);
            result.points[currentPointIndex++] = newPt;
        } else {
            if (currentOldPointIndex == stroke.points.length) break;
            startPt = endPt;
            endPt = stroke.points[currentOldPointIndex++];
            var dx = endPt.x - startPt.x;
            var dy = endPt.y - startPt.y;
            startOldDist = endOldDist;
            currSegmentLen = Math.sqrt(dx * dx + dy * dy);
            endOldDist += currSegmentLen;
        }
    }
    if (result.points.length < kPointsPerStroke) {
        result.points[currentPointIndex++] = endPt;
    }
    return result;
}

function NormalizeCenter(gesture) {
    if (!gesture) return;
    var centerX = 0.0;
    var centerY = 0.0;
    var pointCount = 0;

    for (var i = 0; i < gesture.strokes.length; i++) {
        var stroke = gesture.strokes[i];
        pointCount += stroke.points.length;
        for (var j = 0; j < stroke.points.length; j++) {
            var pt = stroke.points[j];
            centerX += pt.x;
            centerY += pt.y;
        }
    }
    if (pointCount <= 0) return;
    centerX = centerX / pointCount;
    centerY = centerY / pointCount;

    for (var i = 0; i < gesture.strokes.length; i++) {
        var stroke = gesture.strokes[i];
        for (var j = 0; j < stroke.points.length; j++) {
            var pt = stroke.points[j];
            pt.x -= centerX;
            pt.y -= centerY;
        }
    }
}

function GestureDotProduct(gesture1, gesture2) {
    if (!gesture1 || !gesture2 || gesture1.strokes.length != gesture2.strokes.length) return -1;
    var dotProduct = 0.0;

    for (var i = 0; i < gesture1.strokes.length; i++) {
        var stroke1 = gesture1.strokes[i];
        var stroke2 = gesture2.strokes[i];
        if (stroke1.points.length != stroke2.points.length) return -1;

        for (var j = 0; j < stroke1.points.length; j++) {
            var pt1 = stroke1.points[j];
            var pt2 = stroke2.points[j];
            dotProduct += pt1.x * pt2.x + pt1.y * pt2.y;
        }
    }
    return dotProduct;
}

function Match(gesture1, gesture2) {
    var score = GestureDotProduct(gesture1, gesture2);
    if (score <= 0.0) return 0;

    score = score / Math.sqrt(GestureDotProduct(gesture1, gesture1) * GestureDotProduct(gesture2, gesture2));
    return score;
}

function BestMatch(gesture, list) {
    var value = -1;
    var score = -1;
    for (var i = 0; i < gestures.length; i++) {
        var tmpscore = Match(gesture, list[i]);
        if (tmpscore > score) {
            score = tmpscore;
            value = i;
        }
    }
    return value;
}
