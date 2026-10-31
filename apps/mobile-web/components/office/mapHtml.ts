/**
 * The office map is a small Leaflet + OpenStreetMap page, shown in an iframe on the web and a WebView on
 * Android. Tapping a pin sends the office slug back to the app. Without internet it says so instead of
 * showing a blank box.
 */
export interface MapPin {
  slug: string;
  lat: number;
  lng: number;
  label: string;
  mono: string;
}

export function mapHtml({
  pins,
  selected,
  me,
  offlineText,
}: {
  pins: MapPin[];
  selected?: string;
  me?: { lat: number; lng: number } | null;
  offlineText: string;
}): string {
  const data = JSON.stringify({ pins, selected: selected ?? null, me: me ?? null }).replace(
    /</g,
    '\\u003c',
  );
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" onerror="this.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'">
<style>
html,body,#map{height:100%;margin:0;background:#ECF0FF;font-family:Poppins,system-ui,sans-serif}
.pin{width:38px;height:38px;border-radius:12px 12px 12px 2px;transform:rotate(-45deg);background:#2042C4;border:3px solid #fff;box-shadow:0 4px 10px rgba(19,40,122,.35);display:flex;align-items:center;justify-content:center}
.pin span{transform:rotate(45deg);color:#fff;font:700 10px system-ui,sans-serif}
.pin.sel{background:#E0A800;width:44px;height:44px}
.me{width:16px;height:16px;border-radius:50%;background:#3D66F2;border:3px solid #fff;box-shadow:0 0 0 6px rgba(61,102,242,.25)}
#off{display:none;height:100%;align-items:center;justify-content:center;text-align:center;padding:16px;color:#13287A;font:500 14px system-ui,sans-serif}
</style></head><body><div id="map"></div><div id="off">${offlineText.replace(/</g, '&lt;')}</div>
<script>
var D=${data};
function send(m){try{(window.ReactNativeWebView||window.parent).postMessage(JSON.stringify(m),'*')}catch(e){}}
function offline(){document.getElementById('map').style.display='none';document.getElementById('off').style.display='flex'}
</script>
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
<script>if(!window.L){document.write('<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\\/script>')}</script>
<script>
if(!window.L){offline()}else{
  var map=L.map('map',{zoomControl:true,attributionControl:true});
  // CARTO Voyager tiles (built from OpenStreetMap data) work inside embedded frames and WebViews.
  var tiles=L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:20,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'}).addTo(map);
  var fails=0;tiles.on('tileerror',function(){fails++;if(fails>12&&!window.__offline){window.__offline=1;offline()}});
  var pts=[];
  D.pins.forEach(function(p){
    var sel=p.slug===D.selected;
    var icon=L.divIcon({className:'',html:'<div class="pin'+(sel?' sel':'')+'"><span>'+p.mono+'</span></div>',iconSize:[38,38],iconAnchor:[19,38]});
    var m=L.marker([p.lat,p.lng],{icon:icon,title:p.label,zIndexOffset:sel?1000:0}).addTo(map);
    m.bindTooltip(p.label,{direction:'top',offset:[0,-36]});
    m.on('click',function(){send({type:'select',slug:p.slug})});
    pts.push([p.lat,p.lng]);
  });
  if(D.me){L.marker([D.me.lat,D.me.lng],{icon:L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[16,16]})}).addTo(map);pts.push([D.me.lat,D.me.lng]);}
  var sel=D.pins.find(function(p){return p.slug===D.selected});
  if(sel){map.setView([sel.lat,sel.lng],16)}
  else if(pts.length===1){map.setView(pts[0],15)}
  else if(pts.length){map.fitBounds(pts,{padding:[36,36],maxZoom:15})}
  else{map.setView([12.5,122],5)}
}
</script></body></html>`;
}
