requirejs.config({
  'baseUrl' : 'src',
  // uncomment the following commented-out block to test the contatenated, 
  // minified PV version. Grunt needs to be run before for this to work.
  
  paths : {
    pv : '/js/bio-pv.min'
  }
  
});

// on purpose outside of the require block, so we can inspect the viewer object 
// from the JavaScript console.
var viewer;

var pv;
require(['pv'], function(PV) {

pv = PV;
var io = pv.io;
var viewpoint = pv.viewpoint;
var color = pv.color;
var structure;
var structure2;


var _coord = {}
// $.getJSON('pdbs/data.json', function(data) {    
// });

function getDataJson(){
    return $.getJSON('pdbs/data.json');
  }
  
function points() {
  viewer.clear();
  var go = viewer.points('structure', structure, {
                         color: color.byResidueProp('num'),
                         showRelated : '1' });
}

function lines() {
  viewer.clear();
  var go = viewer.lines('structure', structure, {
              color: color.byResidueProp('num'),
              showRelated : '1' });
  go.setSelection(go.select({rnumRange : [15,20]}));
  go.setOpacity(0.5, go.select({rnumRange : [25,30]}));
}

function cartoon() {
  viewer.clear();
  var go = viewer.cartoon('structure', structure, {
      color : color.ssSuccession(), showRelated : '1',
  });
  var rotation = viewpoint.principalAxes(go, 5);
  viewer.setRotation(rotation)
}

function lineTrace() {
  viewer.clear();
  var go = viewer.lineTrace('structure', structure, { showRelated : '1' });
}

function spheres() {
  viewer.clear();
  var go = viewer.spheres('structure', structure, { showRelated : '1' });
}

function sline() {
  viewer.clear();
  var go = viewer.sline('structure', structure,
          { color : color.uniform('red'), showRelated : '1'});
}

function tube() {
  viewer.clear();
  var go = viewer.tube('structure', structure);
  viewer.lines('structure.ca', structure.select({aname :'CA'}),
            { color: color.uniform('blue'), lineWidth : 1,
              showRelated : '1' });
}

function trace() {
  viewer.clear();
  var go = viewer.trace('structure', structure, { showRelated : '1' });

}
function ballsAndSticks() {
  viewer.clear();
  var go = viewer.ballsAndSticks('structure', structure, { showRelated : '1' });
}

function preset() {
  viewer.clear();
  // var ligand = structure.select({'rnames' : ['RVP', 'SAH', 'CRO']});
  var go = viewer.ballsAndSticks('structure', structure, { showRelated : '1' });
  
  if(structure2!=null){
  var go = viewer.lines('structure2', structure2, {
              // color: color.byResidueProp('num'),
              showRelated : '1' });
  go.setSelection(go.select({rnumRange : [15,20]}));
  go.setOpacity(0.5, go.select({rnumRange : [25,30]}));
  }
  // viewer.ballsAndSticks('structure.ligand', ligand);
  

  getDataJson().done(function(json) {
  	$.each(json, function(index, element) {
        _coord[index] = element
    });
      viewer.on('viewerReady', function() {
    var hydro_bonds = viewer.customMesh('custom');
    for( var i = 0; i < _coord.x.length; i++){
      hydro_bonds.addSphere([_coord.x[i], _coord.y[i], _coord.z[i]], 0.1, { color : [255, 237, 0]}); 
    }
    
  });
  })
  .fail(function(){
  	console.log('Failed to get data.json')
  });




  viewer.cartoon('structure.protein', structure, { boundingSpheres: false });
}

function load(pdb_id) {
  $.ajax({ url : 'pdbs/'+pdb_id+'.pdb', success : function(data) {  
	structure = io.pdb(data);
	}});
  $.ajax({ url : 'pdbs/'+'mod'+'.pdb', success : function(data) {  
    structure2 = io.pdb(data);
    preset();
    viewer.spheres('helices', structure2.select({rnames : ['RVP', 'SAH']}), { color : color.uniform('red'), radiusMultiplier : 0.3, showRelated : '1' });
    viewer.autoZoom();
  },
  error: function(data) {
  	preset();
    // viewer.spheres('helices', structure2.select({rnames : ['RVP', 'SAH']}), { color : color.uniform('red'), radiusMultiplier : 0.3, showRelated : '1' });
    viewer.autoZoom();
  }
	});
}

function transferase() {
  load('47');
}

function ssSuccession() {
  viewer.forEach(function(go) {
    go.colorBy(color.ssSuccession());
  });
  viewer.requestRedraw();
}

function uniform() {
  viewer.forEach(function(go) {
    go.colorBy(color.uniform([0,1,0]));
  });
  viewer.requestRedraw();
}
function byElement() {
  viewer.forEach(function(go) {
    go.colorBy(color.byElement());
  });
  viewer.requestRedraw();
}

function ss() {
  viewer.forEach(function(go) {
    go.colorBy(color.bySS());
  });
  viewer.requestRedraw();
}

function proInRed() {
  viewer.forEach(function(go) {
    go.colorBy(color.uniform('red'), go.select({rname : 'PRO'}));
  });
  viewer.requestRedraw();
}
function rainbow() {
  viewer.forEach(function(go) {
    go.colorBy(color.rainbow());
  });
  viewer.requestRedraw();
}

function byChain() {
  viewer.forEach(function(go) {
    go.colorBy(color.byChain());
  });
  viewer.requestRedraw();
}

function phong() {
  viewer.options('style', 'phong');
  viewer.requestRedraw();
}

function hemilight() {
  viewer.options('style', 'hemilight');
  viewer.requestRedraw();
}

function moveCam(){
  function getArray(){
    return $.getJSON('pdbs/camPos.json');
  }
  
  getArray().done(function(json) {
    // now you can use json
    viewer.setRotation(json._camView, 500);
    viewer.setZoom(json._zoom);
    viewer.setCenter(json._center);
  })
  .fail(function(){
  mtr = [1,0,0,0,1,0,0,0,1];
  viewer.setRotation(mtr, 500);
  });

  var img = document.createElement("IMG");
  img.src = "pdbs/image.png";
  img.id = "image"
  document.getElementById('viewer').appendChild(img);
  img.onclick = function(){
  	$("#image").remove();
  }
}

$(document).foundation();
$('#move-coordinate').click(moveCam);
$('#style-preset').click(preset);
$('#style-cartoon').click(cartoon);
$('#style-tube').click(tube);
$('#style-line-trace').click(lineTrace);
$('#style-sline').click(sline);
$('#style-trace').click(trace);
$('#style-lines').click(lines);
$('#style-balls-and-sticks').click(ballsAndSticks);
$('#style-points').click(points);
$('#style-spheres').click(spheres);
$('#color-uniform').click(uniform);
$('#color-element').click(byElement);
$('#color-chain').click(byChain);
$('#color-ss-succ').click(ssSuccession);
$('#color-ss').click(ss);
$('#phong').click(phong);
$('#hemilight').click(hemilight);
$('#color-rainbow').click(rainbow);
$('#load-from-pdb').change(function() {
  var pdbId = this.value;
  this.value = '';
  this.blur();
  load(pdbId)
});

viewer = pv.Viewer(document.getElementById('viewer'), { 
    width : 'auto', height: 'auto', antialias : true, fog : true,
    outline : true, quality : 'high', style : 'phong',
    selectionColor : 'white', transparency : 'screendoor', 
    background : '#ccc', animateTime: 500, doubleClick : null
});
load(47)

viewer.on('doubleClick', function(picked) {
  if (picked === null) {
    viewer.fitTo(structure);
    return;
  }
  viewer.setCenter(picked.pos(), 500);
});

window.addEventListener('resize', function() {
      viewer.fitParent();
});

});