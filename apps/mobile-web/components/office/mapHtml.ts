/**
 * The office map is a small MapLibre + OpenFreeMap (OpenStreetMap data) page, shown in an iframe on the web and a WebView on
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
function css(h){var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l)}
css('https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.2/dist/maplibre-gl.css');
function send(m){try{(window.ReactNativeWebView||window.parent).postMessage(JSON.stringify(m),'*')}catch(e){}}
function offline(){document.getElementById('map').style.display='none';document.getElementById('off').style.display='flex'}
</script>
<script src="https://cdn.jsdelivr.net/npm/maplibre-gl@5.6.2/dist/maplibre-gl.js"></script>
<script>if(!window.maplibregl){css('https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.css');document.write('<script src="https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.js"><\\/script>')}</script>
<script>
function el(html,title){var w=document.createElement('div');w.innerHTML=html;if(title){w.title=title;w.setAttribute('aria-label',title);w.setAttribute('role','button')}return w}
if(!window.maplibregl){offline()}else{
  try{
    // OpenFreeMap: free OpenStreetMap-based map with no API key, no sign-up and no Referer rules.
    var map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[122,12.5],zoom:5,attributionControl:{compact:true},dragRotate:false,pitchWithRotate:false,touchPitch:false});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-left');
    map.touchZoomRotate.disableRotation();
    var fails=0,loaded=false;
    map.on('load',function(){loaded=true});
    map.on('error',function(){fails++;if(!loaded&&fails>6&&!window.__offline){window.__offline=1;offline()}});
    setTimeout(function(){if(!loaded&&!window.__offline){window.__offline=1;offline()}},20000);
    var pts=[];
    D.pins.forEach(function(p){
      var sel=p.slug===D.selected;
      var e=el('<div class="pin'+(sel?' sel':'')+'"><span>'+p.mono+'</span></div>',p.label);
      e.style.cursor='pointer';e.style.zIndex=sel?'2':'1';
      e.addEventListener('click',function(ev){ev.stopPropagation();send({type:'select',slug:p.slug})});
      new maplibregl.Marker({element:e,anchor:'bottom'}).setLngLat([p.lng,p.lat]).addTo(map);
      pts.push([p.lng,p.lat]);
    });
    if(D.me){new maplibregl.Marker({element:el('<div class="me"></div>')}).setLngLat([D.me.lng,D.me.lat]).addTo(map);pts.push([D.me.lng,D.me.lat]);}
    var sel=D.pins.find(function(p){return p.slug===D.selected});
    if(sel){map.jumpTo({center:[sel.lng,sel.lat],zoom:16})}
    else if(pts.length===1){map.jumpTo({center:pts[0],zoom:15})}
    else if(pts.length){var b=new maplibregl.LngLatBounds(pts[0],pts[0]);pts.forEach(function(q){b.extend(q)});map.fitBounds(b,{padding:40,maxZoom:15,duration:0})}
  }catch(e){offline()}
}
</script></body></html>`;
}
