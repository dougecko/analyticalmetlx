var Analytics=function(){Chart.defaults.global.defaultFontColor="#FFF";var k={},g=function(b,a){var c=$("#statusLog");a in k||(k[a]={element:$("<div />").prependTo(c),touches:0});k[a].touches+=1;c=sprintf("%s %s %s",_.repeat("..",k[a].touches),b,a);k[a].element.html($("<div />",{text:c}))},p=[],v=[],w=[],y=[],e={},z=[],n;$.get("/static/js/stable/dict/en_US.aff",function(b){g("Loading","spellcheck");$.get("/static/js/stable/dict/en_US.dic",function(a){g("Parsing","spellcheck");n=new Typo("en_US",b,
a);g("Initialized","spellcheck");_.each(z,m.incorporate)})});var m=function(){var b={};d3.scaleLinear().range([8,25]);var a={};return{counts:function(){return b},stop:function(a){var b=_.clone(a);_.each("a am an and are do did done is it the".split(" "),function(a){delete b[a]});return b},pairs:function(a){return _.map(a,function(a,b){return{key:b,value:a}})},typo:function(){return n},incorporate:function(c){c in a||(n.check(c)?(c in b||(b[c]=0),b[c]++):a[c]=!0)},cloud:function(){WordCloud(m.pairs(m.stop(m.counts())),
{w:$("#lang").width(),h:$("#lang").width()})}}}(),A=function(b){return moment(parseInt(b)).format("MMMM Do YYYY, h:mm:ss a")},D=function(b){_.forEach({authorsOverTime:{dataset:_.groupBy(_.map(b,function(a){return{timestamp:Math.floor(a.timestamp/6E4*6E4),author:a.author,location:a.location}}),"author"),title:"Authors",yLabel:"Pages visited"},locationOverTime:{dataset:_.groupBy(b,"location"),title:"Page attendance",yLabel:"Visits to page"}},function(a,b){var d=d3.scaleOrdinal(d3.schemeCategory10),
f=_.map(a.dataset,function(a,b){var f=_.groupBy(a,function(a){return Math.floor(a.timestamp/6E4)}),c=_.map(_.sortBy(_.keys(f)),function(a){return{x:6E4*a,y:f[a].length}});return{label:b,tension:.1,borderColor:d(b),data:c}});b in e?(e[b].data.datasets=f,e[b].update()):e[b]=new Chart($("<canvas />").attr({width:360,height:240}).appendTo($("#time"))[0].getContext("2d"),{type:"line",data:{datasets:f},options:{title:{display:!0,text:a.title},showLines:!1,scales:{yAxes:[{stacked:!0,scaleLabel:{display:!0,
labelString:a.yLabel}}],xAxes:[{type:"linear",scaleLabel:{display:!0,labelString:"Time"},position:"bottom",ticks:{callback:function(a){return moment(parseInt(a)).format("HH:mm MM/DD")}}}]}}})});_.forEach({distinctUsersOverSlides:{dataset:_.groupBy(b,"location"),title:"Furthest page reached",yLabel:"Users who reached this page",xLabel:"Page"}},function(a,b){var d=[{label:"Distinct users",tension:.1,borderColor:d3.scaleOrdinal(d3.schemeCategory10)(0),data:_.map(a.dataset,function(a,b){return{x:b,y:_.uniqBy(a,
"author").length}})}];b in e?(e[b].data.datasets=d,e[b].update()):e[b]=new Chart($("<canvas />").attr({width:360,height:240}).appendTo($("#page"))[0].getContext("2d"),{type:"line",data:{datasets:d},options:{title:{display:!0,text:a.title},showLines:!0,scales:{yAxes:[{stacked:!0,scaleLabel:{display:!0,labelString:a.yLabel}}],xAxes:[{type:"linear",scaleLabel:{display:!0,labelString:"Page"},position:"bottom"}]}}})})},B=function(b,a){var c=$(b);_.forEach(c.find("message"),function(a){a=$(a);var b=a.attr("timestamp"),
c=a.find("author").text(),d=a.find("slide").text();""==d&&(d=a.find("location").text());p.push(b);v.push(c);""!=d&&y.push({author:c,timestamp:parseInt(b),location:parseInt(d)});_.forEach(a.find("attendance"),function(a){w.push({author:c,timestamp:new Date(parseInt(b)),location:$(a).find("location").text()})})});var c=_.min(p),d=_.max(p);g(sprintf("Anchored %s",A(c)),"earliest event");g(sprintf("Anchored %s",A(d)),"latest event");g(p.length,"events scoped");g(_.uniq(v).length,"authors scoped")},C=
function(b){return _.map(b,function(a){a.timestamp=6E4*Math.floor(a.timestamp/6E4);return a})},E=function(b,a){$("#followLag").empty();var c=$(a).find("author:first").text(),d=[],f=[],x=_.find(b,function(a){return a.author==c});_.each(_.sortBy(b,"timestamp"),function(a){a.author==c?x=a:a.location==x.location?d.push({author:a.author,lag:a.timestamp-x.timestamp,location:a.location}):f.push(a)});g("Calculated","follow lag");var q=d3.scaleBand().range([0,325]).domain(_.map($(a).find("slide"),function(a){return $(a).find("id").text()}).reverse()),
h=d3.scaleLinear().range([0,240]).domain([_.max(_.map(d,"lag")),0]),l=d3.select("#followLag").append("svg").attr("width",420).attr("height",265),r=l.append("g").attr("transform","translate(70,0)"),e=_.toPairs(_.mapValues(_.groupBy(d,"location"),function(a,b){return{location:b,lag:_.mean(_.map(a,"lag"))}}));r.selectAll(".bar").data(e).enter().append("rect").attr("class","bar").attr("x",function(a,b){return q(a[0])}).attr("width",q.bandwidth()).attr("y",function(a){return h(a[1].lag)}).attr("height",
function(a){return 240-h(a[1].lag)});l.append("g").attr("transform","translate(0,240)").call(d3.axisBottom(q));l.append("g").attr("transform","translate(70,0)").call(d3.axisLeft(h))},G=function(b,a){$("#vis").empty();var c=$(a).find("author:first").text(),d=_.groupBy(b,function(a){return a.author==c}),f=d[!1],f=C(f),f=_.groupBy(f,"location"),f=_.mapValues(f,function(a){return _.groupBy(a,"timestamp")}),g=[];_.each(f,function(a,b){_.each(a,function(a,F){g.push({timestamp:F,location:b,attendances:a})})});
var q=d[!0],f=_.sortBy(_.uniq(_.map(b,function(a){return parseInt(a.location)}))),h=$("#vis").width()-35-25,l=d3.scaleTime().range([25,h-35]),r=d3.scaleTime().range([25,h-35]),e=d3.scaleLinear().range([10,275]),k=d3.scaleLinear().range([100,10]),m=d3.scaleLinear().range([5,25]);l.domain(d3.extent(b,function(a){return a.timestamp}));r.domain(d3.extent(b,function(a){return a.timestamp}));e.domain(d3.extent(b,function(a){return parseInt(a.location)}));d=_.groupBy(C(b),"timestamp");d=_.toPairs(d);k.domain(d3.extent(d,
function(a){return parseInt(a[1].length)}));m.domain(d3.extent(g,function(a){return a.attendances.length}));var p=d3.axisBottom(l).tickSize(-300,0),n=d3.axisLeft(e).ticks(f.length).tickSizeInner(-h),f=d3.axisBottom(r),w=d3.axisLeft(k),h=d3.select("#vis").append("svg").attr("width",h+35+25).attr("height",435);h.append("defs").append("filter").attr("id","teacherPath").attr("x","0").attr("y","0").append("feGaussianBlur").attr("in","SourceGraphic").attr("stdDeviation","10");var u=h.append("g").attr("class",
"context").attr("transform","translate(35,10)"),t=u.append("g"),v=d3.line().x(function(a){return l(a.timestamp)}).y(function(a){return e(a.location)}),h=d3.brushX().on("brush",function(){l.domain(d3.event.selection.map(r.invert,r));t.select(".teacherPath").attr("d",v(q));t.select(".x.axis").call(p);t.selectAll(".circ").attr("cx",function(a){return l(a.timestamp)}).attr("cy",function(a){return e(parseInt(a.location))})});q&&t.append("g").attr("transform","translate(35,10)").append("path").attr("class",
"teacherPath").style("filter","url(#teacherPath)").attr("d",v(q));t.append("g").attr("transform","translate(35,10)").selectAll(".circ").data(g).enter().append("circle").attr("class","circ").attr("cx",function(a){return l(a.timestamp)}).attr("cy",function(a){return e(parseInt(a.location))}).attr("r",function(a){return m(a.attendances.length)});t.append("g").attr("class","x axis").attr("transform","translate(35,295)").call(p);t.append("g").attr("class","y axis").attr("transform","translate(35,10)").call(n);
n=d3.area().x(function(a){return r(a[0])}).y0(90).y1(function(a){return k(a[1].length)-10});u=u.append("g").attr("transform","translate(35,300)");u.append("g").attr("transform","translate(0,100)").call(f);u.append("g").attr("transform","translate(0,10)").attr("class","masterArea").call(h).append("path").attr("d",n(d));u.append("g").call(w)};return{word:m,prime:function(b){g("Retrieving",b);$.get(sprintf("/details/%s",b),function(a){var c=function(){Analytics.word.cloud();g("Analysed","conversation");
G(_.sortBy(y,"timestamp"),a);E(w,a);D(w)};$.get(sprintf("/fullClientHistory?source=%s",b),function(c){g("Retrieved",b);B(c,a)});var d=$(a).find("slide"),f=0;console.log(f);_.forEach(d.find("id"),function(b){var e=$(b).text();g("Retrieving",e);$.get(sprintf("/fullClientHistory?source=%s",e),function(b){g("Retrieved",e);B(b,a);g(sprintf("Incorporated %s",d.length),"slide(s)")});g("Parsing",sprintf("usage %s",e));$.get(sprintf("/api/v1/analysis/words/%s",e),function(a){_.each($(a).find("theme"),function(a){_.each($(a).find("content").text().split(" "),
function(a){a=a.toLowerCase();n?m.incorporate(a):z.push(a)})});++f==d.length&&(c(),$(window).resize(c))})})})}}}();