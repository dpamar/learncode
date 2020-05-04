//Constants
var initialHTML = '<div style="background-color:#FF0000; width:500; height:500;" onmousedown="StartRecordStroke();" onmousemove="RecordStroke(event);" onmouseup="StopRecordStroke();">&nbsp;</div>';
var strokeDelay = 500;

var readMode = false;
var gestures = [];

var recordingGesture;
var recordingStroke;
var finalGesture;

function StartRecordGesture() {
    recordingGesture = new CGesture();
    setTimeout('StopReading(0)', strokeDelay);
    document.getElementById('drawingZone').innerHTML = initialHTML;
}

function StopRecordGesture() {
    finalGesture = recordingGesture;
    recordingGesture = null;
    NormalizeSize(finalGesture);
    NormalizeCenter(finalGesture);
    finalGesture.strokes = finalGesture.strokes.map(stroke => NormalizeSpacing(stroke));
    document.getElementById('drawingZone').innerHTML = initialHTML;
    if (readMode) Compare();
    else {
        gestures.push(finalGesture);
        if (gestures.length != 10) AskFor(gestures.length);
        else {
            document.getElementById('results').innerHTML = 'Now reading...<br/>';
            readMode = true;
        }
    }
}

function StopReading(strokeCount) {
    if (recordingGesture && recordingGesture.strokes.length != strokeCount) setTimeout(`StopReading(${recordingGesture.strokes.length})`, strokeDelay);
    else StopRecordGesture();
}

function StartRecordStroke() {
    if (!recordingGesture) StartRecordGesture();
    recordingStroke = new CStroke();
    recordingGesture.strokes.push(recordingStroke);
}

function RecordStroke(e) {
    if (recordingStroke) {
        if (e.pageX)
            RecordPoint(e.pageX, e.pageY);
        else
            RecordPoint(event.x + document.body.scrollLeft, event.y + document.body.scrollTop);
    }
}

function StopRecordStroke() {
    recordingStroke = null;;
}

function RecordPoint(xPos, yPos) {
    recordingStroke.points.push(new CPoint2D(xPos, yPos));
    document.getElementById('drawingZone').innerHTML += "<div style='position:absolute; top:" + yPos + "; left:" + xPos + "; width:10; height:10; background-color:white;' onmousedown='StartRecordStroke();' onmousemove='RecordStroke(event);' onmouseup='StopRecordStroke();'></div>";
}

function Compare() {
    document.getElementById('results').innerHTML += BestMatch(finalGesture, gestures);
}


function AskFor(digit) {
    document.getElementById('setup').innerHTML += `Now recording ${digit}...<br/>`;
}

