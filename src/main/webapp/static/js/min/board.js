function setupStatus(){pending={};var a=$("#strokesPending"),b=$("#latency"),e=0,d={},f={};window.updateStrokesPending=function(d,f){0<d?pending[f]=Date.now():f in pending&&(e=Date.now()-pending[f],delete pending[f]);a.text(Object.keys(pending).length);b.text(e)};window.updateTracking=function(a,b,e){b&&(d[a]=b);if(e)f[a]=e;else if(a in d)d[a]();else console.log("No progress initializer function was issued for ",a)};window.stopTracking=function(a){if(a in f)f[a]();delete d[a];delete f[a]}}
function strokeCollected(a){if(0<a.length){a=a.split(" ").map(function(a){return parseFloat(a)});for(var b=Conversations.getCurrentSlideJid(),b={thickness:scaleScreenToWorld(Modes.draw.drawingAttributes.width),color:[Modes.draw.drawingAttributes.color,255],type:"ink",author:UserSettings.getUsername(),timestamp:Date.now(),target:"presentationSpace",privacy:Privacy.getCurrentPrivacy(),slide:b.toString(),isHighlighter:Modes.draw.drawingAttributes.isHighlighter},e=[],d,f,g=0;g<a.length;g+=3)d=a[g],f=
a[g+1],d=screenToWorld(d,f),e=e.concat([d.x,d.y,a[g+2]]);b.points=e;b.checksum=b.points.reduce(function(a,b){return a+b},0);b.startingSum=b.checksum;b.identity=b.checksum.toFixed(1);calculateInkBounds(b);b.isHighlighter?boardContent.highlighters[b.identity]=b:boardContent.inks[b.identity]=b;sendInk(b)}}
function batchTransform(){var a=Conversations.getCurrentSlideJid();return{type:"moveDelta",identity:Date.now().toString(),author:UserSettings.getUsername(),slide:a.toString(),target:"presentationSpace",privacy:Privacy.getCurrentPrivacy(),timestamp:Date.now(),inkIds:[],textIds:[],multiWordTextIds:[],imageIds:[],xOrigin:0,yOrigin:0,xTranslate:0,yTranslate:0,xScale:1,yScale:1,isDeleted:!1,newPrivacy:"not_set"}}
function sendDirtyInk(a){var b=Conversations.getCurrentSlideJid();sendStanza({type:"dirtyInk",identity:a.identity,author:UserSettings.getUsername(),timestamp:Date.now(),slide:b.toString(),target:"presentationSpace",privacy:a.privacy})}function sendInk(a){updateStrokesPending(1,a.identity);sendStanza(a)}
function hexToRgb(a){if("object"==typeof a&&a.alpha)return a;"string"==typeof a&&(a=[a,255]);var b=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a[0]);return{alpha:a[1],red:parseInt(b[1],16),green:parseInt(b[2],16),blue:parseInt(b[3],16)}}
function partToStanza(a){var b=carota.runs.defaultFormatting,e=hexToRgb(a.color||b.color);return{text:a.text,color:e,size:parseFloat(a.size)||parseFloat(b.size),font:a.font||b.font,justify:a.align||b.align,bold:!0===a.bold,underline:!0===a.underline,italic:!0===a.italic}}
function richTextEditorToStanza(a){var b=a.doc.calculateBounds(),e=a.doc.save();return{author:a.author,timestamp:-1,target:a.target,tag:"_",privacy:a.privacy,slide:a.slide,identity:a.identity,type:a.type,x:b[0],y:b[1],requestedWidth:b[2]-b[0],width:b[2]-b[0],height:b[3]-b[1],words:e.map(partToStanza)}}
function sendRichText(a){if(a.doc){Modes.text.echoesToDisregard[a.identity]=!0;var b=a.doc;a.doc.position={x:a.x,y:a.y};var e=richTextEditorToStanza(a);boardContent.multiWordTexts[a.identity]=e;boardContent.multiWordTexts[a.identity].doc=b;sendStanza(e)}}
var stanzaHandlers={ink:inkReceived,dirtyInk:dirtyInkReceived,move:moveReceived,moveDelta:transformReceived,image:imageReceived,text:textReceived,multiWordText:richTextReceived,command:commandReceived,submission:submissionReceived,attendance:attendanceReceived,file:fileReceived};function fileReceived(a){}function attendanceReceived(a){}function submissionReceived(a){Submissions.processSubmission(a)}
function commandReceived(a){if("/TEACHER_VIEW_MOVED"==a.command&&a.parameters[5]==Conversations.getCurrentSlideJid()){var b=a.parameters.map(parseFloat);_.some(b,isNaN)?console.log("Can't follow teacher to",a):b[4]!=DeviceConfiguration.getIdentity()&&Conversations.getIsSyncedToTeacher()&&(a=function(){zoomToPage();TweenController.zoomAndPanViewbox(b[0],b[1],b[2],b[3],function(){},!1,!0)},UserSettings.getIsInteractive()||a())}}
function richTextReceived(a){a.identity in Modes.text.echoesToDisregard||isUsable(a)&&WorkQueue.enqueue(function(){Modes.text.editorFor(a).doc.load(a.words);blit()})}function textReceived(a){try{isUsable(a)?(boardContent.texts[a.identity]=a,prerenderText(a),incorporateBoardBounds(a.bounds),WorkQueue.enqueue(function(){return isInClearSpace(a.bounds)?(drawText(a),!1):!0})):a.identity in boardContent.texts&&delete boardContent.texts[a.identity]}catch(b){console.log("textReceived exception:",b)}}
function receiveMeTLStanza(a){Progress.call("stanzaReceived",[a])}function actOnReceivedStanza(a){try{a.type in stanzaHandlers?(stanzaHandlers[a.type](a),Progress.call("onBoardContentChanged")):console.log(sprintf("Unknown stanza: %s %s",a.type,a))}catch(b){console.log("Exception in receiveMeTLStanza",b,a)}}
function transformReceived(a){var b="",e=function(){var a=[void 0,void 0,void 0,void 0],c=function(){return a},b=function(c,b){void 0==c||isNaN(c)||(a[b]=c)};return{minX:c[0],setMinX:function(a){b(a,0)},minY:c[1],setMinY:function(a){b(a,1)},maxX:c[2],setMaxX:function(a){b(a,2)},maxY:c[3],setMaxY:function(a){b(a,3)},incorporateBounds:function(c){var b=function(b){var e=a[b];void 0==e||isNaN(e)?a[b]=c[b]:a[b]=Math.max(e,c[b])},e=function(b){var e=a[b];void 0==e||isNaN(e)?a[b]=c[b]:a[b]=Math.min(e,c[b])};
e(0);e(1);b(2);b(3)},getBounds:c,incorporateBoardBounds:function(){void 0!=a[0]&&void 0!=a[1]&&void 0!=a[2]&&void 0!=a[3]&&incorporateBoardBounds(a)}}}();if("not_set"!=a.newPrivacy&&!a.isDeleted){var d=a.newPrivacy,b=b+("Became "+d);$.each(a.inkIds,function(a,c){var b=boardContent.inks[c];b&&(b.privacy=d);if(b=boardContent.highlighters[c])b.privacy=d});$.each(a.imageIds,function(a,c){boardContent.images[c].privacy=d});$.each(a.textIds,function(a,c){boardContent.texts[c].privacy=d});$.each(a.multiWordTextIds,
function(a,c){boardContent.multiWordTextIds[c].privacy=d})}a.isDeleted&&(b+="deleted",d=a.privacy,$.each(a.inkIds,function(a,c){deleteInk("highlighters",d,c);deleteInk("inks",d,c)}),$.each(a.imageIds,function(a,c){deleteImage(d,c)}),$.each(a.textIds,function(a,c){deleteText(d,c)}),$.each(a.multiWordTextIds,function(a,c){deleteMultiWordText(d,c)}));if(1!=a.xScale||1!=a.yScale){var b=b+sprintf("scale (%s,%s)",a.xScale,a.yScale),f=[],g=[],m=[],p=[];$.each(a.inkIds,function(a,c){f.push(boardContent.inks[c]);
f.push(boardContent.highlighters[c])});$.each(a.imageIds,function(a,c){p.push(boardContent.images[c])});$.each(a.textIds,function(a,c){g.push(boardContent.texts[c])});$.each(a.multiWordTextIds,function(a,c){m.push(boardContent.multiWordTexts[c])});var h=0,k=0;if("xOrigin"in a&&"yOrigin"in a)h=a.xOrigin,k=a.yOrigin;else{var r=!0,l=function(a){r?(h=a.x,k=a.y,r=!1):(a.x<h&&(h=a.x),a.y<k&&(k=a.y))};$.each(f,function(a,c){void 0!=c&&"bounds"in c&&1<_.size(c.bounds)&&l({x:c.bounds[0],y:c.bounds[1]})});
$.each(g,function(a,c){void 0!=c&&"x"in c&&"y"in c&&l({x:c.x,y:c.y})});$.each(m,function(a,c){void 0!=c&&"x"in c&&"y"in c&&l({x:c.x,y:c.y})});$.each(p,function(a,c){void 0!=c&&"x"in c&&"y"in c&&l({x:c.x,y:c.y})})}e.setMinX(h);e.setMinY(k);$.each(f,function(b,c){if(c&&void 0!=c){var q=c.points,d=c.bounds[0],f=c.bounds[1],g,m,l=d-h;g=f-k;for(var l=-(l-l*a.xScale),p=-(g-g*a.yScale),n=0;n<q.length;n+=3)g=q[n]-d,m=q[n+1]-f,q[n]=d+g*a.xScale+l,q[n+1]=f+m*a.yScale+p;calculateInkBounds(c);e.incorporateBounds(c.bounds)}});
$.each(p,function(b,c){if(void 0!=c){c.width*=a.xScale;c.height*=a.yScale;var d=c.x-h,f=c.y-k,f=-(f-f*a.yScale);c.x+=-(d-d*a.xScale);c.y+=f;calculateImageBounds(c);e.incorporateBounds(c.bounds)}});$.each(g,function(b,c){if(void 0!=c){c.width*=a.xScale;c.height*=a.yScale;var d=c.x-h,f=c.y-k,f=-(f-f*a.yScale);c.x+=-(d-d*a.xScale);c.y+=f;c.size*=a.yScale;c.font=sprintf("%spx %s",c.size,c.family);isUsable(c)?(prerenderText(c),calculateTextBounds(c)):c.identity in boardContent.texts&&delete boardContent.texts[c.identity];
e.incorporateBounds(c.bounds)}});$.each(m,function(b,c){if(void 0!=c){c.requestedWidth=(c.width||c.requestedWidth)*a.xScale;c.width=c.requestedWidth;c.doc.width(c.width);_.each(c.words,function(c){c.size*=a.xScale});var d=c.x-h,f=c.y-k,d=-(d-d*a.xScale),f=-(f-f*a.yScale);c.doc.position={x:c.x+d,y:c.y+f};console.log("Positioning box at",d,f);c.doc.load(c.words);c.bounds=c.doc.calculateBounds();e.incorporateBounds(c.bounds)}})}if(a.xTranslate||a.yTranslate){var t=a.xTranslate,u=a.yTranslate,b=b+sprintf("translate (%s,%s)",
t,u),v=function(a){if(a){for(var c=a.points,b=0;b<c.length;b+=3)c[b]+=t,c[b+1]+=u;calculateInkBounds(a);e.incorporateBounds(a.bounds)}};$.each(a.inkIds,function(a,b){v(boardContent.inks[b]);v(boardContent.highlighters[b])});$.each(a.imageIds,function(b,c){var d=boardContent.images[c];d.x+=a.xTranslate;d.y+=a.yTranslate;calculateImageBounds(d);e.incorporateBounds(d.bounds)});$.each(a.textIds,function(b,c){var d=boardContent.texts[c];d.x+=a.xTranslate;d.y+=a.yTranslate;calculateTextBounds(d);e.incorporateBounds(d.bounds)});
$.each(a.multiWordTextIds,function(b,c){var d=boardContent.multiWordTexts[c],f=d.doc;f.position.x+=a.xTranslate;f.position.y+=a.yTranslate;d.x=f.position.x;d.y=f.position.y;d.bounds=f.calculateBounds();e.incorporateBounds(d.bounds)})}e.incorporateBoardBounds();updateStatus(sprintf("%s %s %s %s %s",b,a.imageIds.length,a.textIds.length,a.multiWordTextIds.length,a.inkIds.length));blit()}
function moveReceived(a){updateStatus(sprintf("Moving %s, %s, %s",Object.keys(a.images).length,Object.keys(a.texts).length,Object.keys(a.inks).length));$.each(a.inks,function(a,e){boardContent.inks[a]=e});$.each(a.images,function(a,e){boardContent.images[a]=e});$.each(a.texts,function(a,e){boardContent.texts[a]=e});$.each(a.multiWordTexts,function(a,e){boardContent.multiWordTexts[a]=e});blit()}
function deleteInk(a,b,e){e in boardContent[a]&&boardContent[a][e].privacy.toUpperCase()==b.toUpperCase()&&delete boardContent[a][e]}function deleteImage(a,b){boardContent.images[b].privacy.toUpperCase()==a.toUpperCase()&&delete boardContent.images[b]}function deleteText(a,b){boardContent.texts[b].privacy.toUpperCase()==a.toUpperCase()&&delete boardContent.texts[b]}
function deleteMultiWordText(a,b){boardContent.multiWordTexts[b].privacy.toUpperCase()==a.toUpperCase()&&delete boardContent.multiWordTexts[b]}function dirtyInkReceived(a){var b=a.identity;a=a.privacy;deleteInk("highlighters",a,b);deleteInk("inks",a,b);updateStatus(sprintf("Deleted ink %s",b));blit()}function isInClearSpace(a){return!_.some(visibleBounds,function(b){return intersectRect(b,a)})}
function screenBounds(a){var b=worldToScreen(a[0],a[1]);a=worldToScreen(a[2],a[3]);return{screenPos:b,screenLimit:a,screenWidth:a.x-b.x,screenHeight:a.y-b.y}}function drawImage(a,b){var e=void 0==b?boardContext:b;try{if(void 0!=a.canvas){var d=screenBounds(a.bounds);visibleBounds.push(a.bounds);var f=.1*d.screenWidth,g=.1*d.screenHeight;e.drawImage(a.canvas,d.screenPos.x-f/2,d.screenPos.y-g/2,d.screenWidth+f,d.screenHeight+g)}}catch(m){console.log("drawImage exception",m)}}
function drawMultiwordText(a){Modes.text.draw(a)}function drawText(a,b){var e=void 0==b?boardContext:b;try{var d=screenBounds(a.bounds);visibleBounds.push(a.bounds);e.drawImage(a.canvas,d.screenPos.x,d.screenPos.y,d.screenWidth,d.screenHeight)}catch(f){console.log("drawText exception",f)}}function drawInk(a,b){var e=void 0==b?boardContext:b,d=screenBounds(a.bounds);visibleBounds.push(a.bounds);e.drawImage(a.canvas,d.screenPos.x,d.screenPos.y,d.screenWidth,d.screenHeight)}
function imageReceived(a){var b=new Image;a.imageData=b;b.onload=function(){0==a.width&&(a.width=b.naturalWidth);0==a.height&&(a.height=b.naturalHeight);a.bounds=[a.x,a.y,a.x+a.width,a.y+a.height];incorporateBoardBounds(a.bounds);boardContent.images[a.identity]=a;updateTracking(a.identity);prerenderImage(a);WorkQueue.enqueue(function(){if(isInClearSpace(a.bounds)){try{drawImage(a)}catch(b){console.log("drawImage exception",b)}return!1}console.log("Rerendering image in contested space");return!0})};
b.src=calculateImageSource(a)}function inkReceived(a){calculateInkBounds(a);updateStrokesPending(-1,a.identity);prerenderInk(a)&&(incorporateBoardBounds(a.bounds),a.isHighlighter?boardContent.highlighters[a.identity]=a:boardContent.inks[a.identity]=a,WorkQueue.enqueue(function(){return isInClearSpace(a.bounds)?(drawInk(a),!1):!0}))}function takeControlOfViewbox(){delete Progress.onBoardContentChanged.autoZooming;UserSettings.setUserPref("followingTeacherViewbox",!0)}
function zoomToFit(){Progress.onBoardContentChanged.autoZooming=zoomToFit;requestedViewboxWidth=boardContent.width;requestedViewboxHeight=boardContent.height;IncludeView.specific(boardContent.minX,boardContent.minY,boardContent.width,boardContent.height)}function zoomToOriginal(){takeControlOfViewbox();requestedViewboxWidth=boardWidth;requestedViewboxHeight=boardHeight;IncludeView.specific(0,0,boardWidth,boardHeight)}
function zoomToPage(){takeControlOfViewbox();var a=requestedViewboxHeight,b=requestedViewboxWidth;requestedViewboxWidth=boardWidth;requestedViewboxHeight=boardHeight;IncludeView.specific(viewboxX+(b-requestedViewboxWidth)/2,viewboxY+(a-requestedViewboxHeight)/2,boardWidth,boardHeight)}function receiveS2C(a,b){try{$(unescape(b)).addClass("s2cMessage").appendTo("body")}catch(e){console.log("receiveS2C exception:",e)}};