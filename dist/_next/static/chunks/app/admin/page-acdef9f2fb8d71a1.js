(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[698],{1530:(e,t,a)=>{"use strict";a.r(t),a.d(t,{CheckmarkIcon:()=>X,ErrorIcon:()=>L,LoaderIcon:()=>R,ToastBar:()=>K,ToastIcon:()=>Z,Toaster:()=>ee,default:()=>et,resolveValue:()=>b,toast:()=>z,useToaster:()=>A,useToasterStore:()=>$});var s,r=a(2115);let o={data:""},i=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,d=(e,t)=>{let a="",s="",r="";for(let o in e){let i=e[o];"@"==o[0]?"i"==o[1]?a=o+" "+i+";":s+="f"==o[1]?d(i,o):o+"{"+d(i,"k"==o[1]?"":t)+"}":"object"==typeof i?s+=d(i,t?t.replace(/([^,])+/g,e=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):o):null!=i&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),r+=d.p?d.p(o,i):o+":"+i+";")}return a+(t&&r?t+"{"+r+"}":r)+s},c={},m=e=>{if("object"==typeof e){let t="";for(let a in e)t+=a+m(e[a]);return t}return e};function u(e){let t,a,s,r=this||{},u=e.call?e(r.p):e;return((e,t,a,s,r)=>{var o,u,p,x;let g=m(e),h=c[g]||(c[g]=(e=>{let t=0,a=11;for(;t<e.length;)a=101*a+e.charCodeAt(t++)>>>0;return"go"+a})(g));if(!c[h]){let t=g!==e?e:(e=>{let t,a,s=[{}];for(;t=i.exec(e.replace(n,""));)t[4]?s.shift():t[3]?(a=t[3].replace(l," ").trim(),s.unshift(s[0][a]=s[0][a]||{})):s[0][t[1]]=t[2].replace(l," ").trim();return s[0]})(e);c[h]=d(r?{["@keyframes "+h]:t}:t,a?"":"."+h)}let f=a&&c.g?c.g:null;return a&&(c.g=c[h]),o=c[h],u=t,p=s,(x=f)?u.data=u.data.replace(x,o):-1===u.data.indexOf(o)&&(u.data=p?o+u.data:u.data+o),h})(u.unshift?u.raw?(t=[].slice.call(arguments,1),a=r.p,u.reduce((e,s,r)=>{let o=t[r];if(o&&o.call){let e=o(a),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;o=t?"."+t:e&&"object"==typeof e?e.props?"":d(e,""):!1===e?"":e}return e+s+(null==o?"":o)},"")):u.reduce((e,t)=>Object.assign(e,t&&t.call?t(r.p):t),{}):u,(s=r.target,"object"==typeof window?((s?s.querySelector("#_goober"):window._goober)||Object.assign((s||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:s||o),r.g,r.o,r.k)}u.bind({g:1});let p,x,g,h=u.bind({k:1});function f(e,t){let a=this||{};return function(){let s=arguments;function r(o,i){let n=Object.assign({},o),l=n.className||r.className;a.p=Object.assign({theme:x&&x()},n),a.o=/ *go\d+/.test(l),n.className=u.apply(a,s)+(l?" "+l:""),t&&(n.ref=i);let d=e;return e[0]&&(d=n.as||e,delete n.as),g&&d[0]&&g(n),p(d,n)}return t?t(r):r}}var b=(e,t)=>"function"==typeof e?e(t):e,y=(()=>{let e=0;return()=>(++e).toString()})(),v=(()=>{let e;return()=>{if(void 0===e&&"u">typeof window){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),w="default",j=(e,t)=>{let{toastLimit:a}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return j(e,{type:+!!e.toasts.find(e=>e.id===s.id),toast:s});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map(e=>e.id===r||void 0===r?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},N=[],_={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},k={},C=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:w;k[t]=j(k[t]||_,e),N.forEach(e=>{let[a,s]=e;a===t&&s(k[t])})},D=e=>Object.keys(k).forEach(t=>C(e,t)),S=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:w;return t=>{C(t,e)}},E={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},$=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:w,[a,s]=(0,r.useState)(k[t]||_),o=(0,r.useRef)(k[t]);(0,r.useEffect)(()=>(o.current!==k[t]&&s(k[t]),N.push([t,s]),()=>{let e=N.findIndex(e=>{let[a]=e;return a===t});e>-1&&N.splice(e,1)}),[t]);let i=a.toasts.map(t=>{var a,s,r;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(a=e[t.type])?void 0:a.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(s=e[t.type])?void 0:s.duration)||(null==e?void 0:e.duration)||E[t.type],style:{...e.style,...null==(r=e[t.type])?void 0:r.style,...t.style}}});return{...a,toasts:i}},O=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"blank",a=arguments.length>2?arguments[2]:void 0;return{createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||y()}},I=e=>(t,a)=>{let s,r=O(t,e,a);return S(r.toasterId||(s=r.id,Object.keys(k).find(e=>k[e].toasts.some(e=>e.id===s))))({type:2,toast:r}),r.id},z=(e,t)=>I("blank")(e,t);z.error=I("error"),z.success=I("success"),z.loading=I("loading"),z.custom=I("custom"),z.dismiss=(e,t)=>{let a={type:3,toastId:e};t?S(t)(a):D(a)},z.dismissAll=e=>z.dismiss(void 0,e),z.remove=(e,t)=>{let a={type:4,toastId:e};t?S(t)(a):D(a)},z.removeAll=e=>z.remove(void 0,e),z.promise=(e,t,a)=>{let s=z.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let r=t.success?b(t.success,e):void 0;return r?z.success(r,{id:s,...a,...null==a?void 0:a.success}):z.dismiss(s),e}).catch(e=>{let r=t.error?b(t.error,e):void 0;r?z.error(r,{id:s,...a,...null==a?void 0:a.error}):z.dismiss(s)}),e};var A=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"default",{toasts:a,pausedAt:s}=$(e,t),o=(0,r.useRef)(new Map).current,i=(0,r.useCallback)(function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1e3;if(o.has(e))return;let a=setTimeout(()=>{o.delete(e),n({type:4,toastId:e})},t);o.set(e,a)},[]);(0,r.useEffect)(()=>{if(s)return;let e=Date.now(),r=a.map(a=>{if(a.duration===1/0)return;let s=(a.duration||0)+a.pauseDuration-(e-a.createdAt);if(s<0){a.visible&&z.dismiss(a.id);return}return setTimeout(()=>z.dismiss(a.id,t),s)});return()=>{r.forEach(e=>e&&clearTimeout(e))}},[a,s,t]);let n=(0,r.useCallback)(S(t),[t]),l=(0,r.useCallback)(()=>{n({type:5,time:Date.now()})},[n]),d=(0,r.useCallback)((e,t)=>{n({type:1,toast:{id:e,height:t}})},[n]),c=(0,r.useCallback)(()=>{s&&n({type:6,time:Date.now()})},[s,n]),m=(0,r.useCallback)((e,t)=>{let{reverseOrder:s=!1,gutter:r=8,defaultPosition:o}=t||{},i=a.filter(t=>(t.position||o)===(e.position||o)&&t.height),n=i.findIndex(t=>t.id===e.id),l=i.filter((e,t)=>t<n&&e.visible).length;return i.filter(e=>e.visible).slice(...s?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+r,0)},[a]);return(0,r.useEffect)(()=>{a.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=o.get(e.id);t&&(clearTimeout(t),o.delete(e.id))}})},[a,i]),{toasts:a,handlers:{updateHeight:d,startPause:l,endPause:c,calculateOffset:m}}},M=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,P=h`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,F=h`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,L=f("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${P} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${F} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,T=h`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,R=f("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${T} 1s linear infinite;
`,B=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,J=h`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,X=f("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${B} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${J} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,H=f("div")`
  position: absolute;
`,U=f("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,V=h`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,G=f("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${V} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Z=e=>{let{toast:t}=e,{icon:a,type:s,iconTheme:o}=t;return void 0!==a?"string"==typeof a?r.createElement(G,null,a):a:"blank"===s?null:r.createElement(U,null,r.createElement(R,{...o}),"loading"!==s&&r.createElement(H,null,"error"===s?r.createElement(L,{...o}):r.createElement(X,{...o})))},q=f("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Y=f("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,K=r.memo(e=>{let{toast:t,position:a,style:s,children:o}=e,i=t.height?((e,t)=>{let a=e.includes("top")?1:-1,[s,r]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*a}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*a}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${h(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${h(r)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(t.position||a||"top-center",t.visible):{opacity:0},n=r.createElement(Z,{toast:t}),l=r.createElement(Y,{...t.ariaProps},b(t.message,t));return r.createElement(q,{className:t.className,style:{...i,...s,...t.style}},"function"==typeof o?o({icon:n,message:l}):r.createElement(r.Fragment,null,n,l))});s=r.createElement,d.p=void 0,p=s,x=void 0,g=void 0;var Q=e=>{let{id:t,className:a,style:s,onHeightUpdate:o,children:i}=e,n=r.useCallback(e=>{if(e){let a=()=>{o(t,e.getBoundingClientRect().height)};a(),new MutationObserver(a).observe(e,{subtree:!0,childList:!0,characterData:!0})}},[t,o]);return r.createElement("div",{ref:n,className:a,style:s},i)},W=u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ee=e=>{let{reverseOrder:t,position:a="top-center",toastOptions:s,gutter:o,children:i,toasterId:n,containerStyle:l,containerClassName:d}=e,{toasts:c,handlers:m}=A(s,n);return r.createElement("div",{"data-rht-toaster":n||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...l},className:d,onMouseEnter:m.startPause,onMouseLeave:m.endPause},c.map(e=>{let s=e.position||a,n=((e,t)=>{let a=e.includes("top"),s=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:v()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(a?1:-1)}px)`,...a?{top:0}:{bottom:0},...s}})(s,m.calculateOffset(e,{reverseOrder:t,gutter:o,defaultPosition:a}));return r.createElement(Q,{id:e.id,key:e.id,onHeightUpdate:m.updateHeight,className:e.visible?W:"",style:n},"custom"===e.type?b(e.message,e):i?i(e):r.createElement(K,{toast:e,position:s}))}))},et=z},3515:(e,t,a)=>{Promise.resolve().then(a.bind(a,9919))},9919:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>d});var s=a(5155),r=a(2115),o=a(2099),i=a(9114),n=a(1530);function l(){let[e,t]=(0,r.useState)([]),[a,l]=(0,r.useState)(!0),[d,c]=(0,r.useState)("todas"),[m,u]=(0,r.useState)(""),{isConnected:p,fomoPercentage:x,refreshData:g}=(0,i.x)();(0,r.useEffect)(()=>{h()},[]);let h=async()=>{try{if(l(!0),p){let e=await (0,o.x$)();t(e||[]),n.default.success(`${e?.length||0} compras cargadas desde Supabase • ${x}% vendido`),await g()}else{console.warn("Supabase no disponible, usando localStorage como fallback");let e=JSON.parse(localStorage.getItem("compras-registradas")||"[]").map(e=>({id:e.id||Date.now().toString(),customer_id:"local",total_amount:e.precio_total||0,unit_price:e.precio_unitario||10,discount_applied:e.descuento_aplicado||0,payment_method:e.metodo_pago||"",payment_reference:e.referencia_pago||"",payment_proof_url:e.captura_comprobante_url||"",status:e.estado_compra||"pendiente",created_at:e.fecha_compra||new Date().toISOString(),customer:{id:"local",name:`${e.nombre||""} ${e.apellidos||""}`.trim(),email:e.email||"",phone:e.telefono||"",city:e.ciudad||"",state:e.estado||""},tickets:e.numeros_boletos?.map(e=>({id:`ticket-${e}`,number:e,status:"vendido",customer_id:"local"}))||[]}));t(e),(0,n.default)(`${e.length} compras cargadas desde localStorage (Supabase no disponible)`,{icon:"⚠️",style:{background:"#fbbf24",color:"#92400e"}})}}catch(e){console.error("Error al cargar compras:",e),n.default.error("Error al cargar las compras"),t([])}finally{l(!1)}},f=async(e,t)=>{try{if(p)await (0,o.t1)(e,t),n.default.success(`Estado actualizado a: ${t}`),await g();else{let a=JSON.parse(localStorage.getItem("compras-registradas")||"[]").map(a=>a.id===e?{...a,estado_compra:t}:a);localStorage.setItem("compras-registradas",JSON.stringify(a)),(0,n.default)(`Estado actualizado localmente a: ${t} (Supabase no disponible)`,{icon:"⚠️",style:{background:"#fbbf24",color:"#92400e"}})}h()}catch(e){console.error("Error al actualizar estado:",e),n.default.error("Error al actualizar el estado")}},b=e=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:0,maximumFractionDigits:0}).format(e),y=e.filter(e=>{let t="todas"===d||e.status===d,a=""===m||e.customer.name.toLowerCase().includes(m.toLowerCase())||e.customer.email.toLowerCase().includes(m.toLowerCase())||e.customer.phone.includes(m);return t&&a}),v={total:e.length,pendientes:e.filter(e=>"pendiente"===e.status).length,confirmadas:e.filter(e=>"confirmada"===e.status).length,canceladas:e.filter(e=>"cancelada"===e.status).length,ingresosTotales:e.reduce((e,t)=>e+t.total_amount,0),boletosVendidos:e.reduce((e,t)=>e+t.tickets.length,0)};return a?(0,s.jsx)("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center",children:(0,s.jsxs)("div",{className:"text-center",children:[(0,s.jsx)("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"}),(0,s.jsx)("p",{className:"text-gray-600",children:"Cargando panel de administraci\xf3n..."})]})}):(0,s.jsx)("div",{className:"min-h-screen bg-gray-50 p-4",children:(0,s.jsxs)("div",{className:"max-w-7xl mx-auto",children:[(0,s.jsx)("div",{className:"bg-white rounded-lg shadow-sm p-6 mb-6",children:(0,s.jsxs)("div",{className:"flex justify-between items-start",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("h1",{className:"text-3xl font-bold text-gray-900 mb-2",children:"\uD83C\uDFAF Panel de Administraci\xf3n - Rifa Silverado Z71"}),(0,s.jsx)("p",{className:"text-gray-600",children:"Gestiona todas las compras de boletos de la rifa"}),(0,s.jsxs)("div",{className:`text-sm mt-2 px-3 py-1 rounded-full inline-flex items-center gap-2 ${p?"bg-green-100 text-green-800":"bg-yellow-100 text-yellow-800"}`,children:[(0,s.jsx)("div",{className:`w-2 h-2 rounded-full ${p?"bg-green-500":"bg-yellow-500"}`}),p?`✅ Conectado a Supabase • ${x}% vendido (FOMO activo)`:"⚠️ Modo offline • Usando localStorage"]})]}),0===e.length&&(0,s.jsx)("button",{onClick:()=>{let e=[{id:"1",nombre:"Juan Carlos",apellidos:"P\xe9rez Garc\xeda",telefono:"+52 55 1234 5678",email:"juan.perez@email.com",estado:"CDMX",ciudad:"Ciudad de M\xe9xico",info_adicional:"Compra desde la p\xe1gina principal",cantidad_boletos:5,numeros_boletos:[1234,2567,3890,4123,5678],numeros_boletos_formateados:"1234, 2567, 3890, 4123, 5678",precio_unitario:200,precio_total:900,descuento_aplicado:10,metodo_pago:"Binance Pay",archivo_subido:!0,nombre_archivo:"comprobante_juan.jpg",fecha_compra:new Date(Date.now()-864e5).toISOString(),estado_compra:"confirmada",timestamp:Date.now()-864e5},{id:"2",nombre:"Mar\xeda Fernanda",apellidos:"L\xf3pez Rodr\xedguez",telefono:"+52 33 9876 5432",email:"maria.lopez@email.com",estado:"Jalisco",ciudad:"Guadalajara",info_adicional:"",cantidad_boletos:10,numeros_boletos:[123,456,789,1012,1345,1678,1901,2234,2567,2890],numeros_boletos_formateados:"0123, 0456, 0789, 1012, 1345, 1678, 1901, 2234, 2567, 2890",precio_unitario:200,precio_total:1600,descuento_aplicado:20,metodo_pago:"OXXO",archivo_subido:!1,nombre_archivo:"",fecha_compra:new Date(Date.now()-432e5).toISOString(),estado_compra:"pendiente",timestamp:Date.now()-432e5},{id:"3",nombre:"Carlos Eduardo",apellidos:"Mart\xednez S\xe1nchez",telefono:"+52 81 5555 1234",email:"carlos.martinez@email.com",estado:"Nuevo Le\xf3n",ciudad:"Monterrey",info_adicional:"Cliente frecuente",cantidad_boletos:25,numeros_boletos:[3001,3002,3003,3004,3005,3006,3007,3008,3009,3010,3011,3012,3013,3014,3015,3016,3017,3018,3019,3020,3021,3022,3023,3024,3025],numeros_boletos_formateados:"3001-3025 (25 boletos consecutivos)",precio_unitario:200,precio_total:3750,descuento_aplicado:25,metodo_pago:"Banco Azteca",archivo_subido:!0,nombre_archivo:"transferencia_carlos.png",fecha_compra:new Date().toISOString(),estado_compra:"pendiente",timestamp:Date.now()}];localStorage.setItem("compras-registradas",JSON.stringify(e)),n.default.success("Datos de prueba agregados exitosamente"),h()},className:"bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm",children:"\uD83D\uDCDD Agregar Datos de Prueba"})]})}),(0,s.jsxs)("div",{className:"grid grid-cols-2 md:grid-cols-6 gap-4 mb-6",children:[(0,s.jsxs)("div",{className:"bg-white p-4 rounded-lg shadow-sm text-center",children:[(0,s.jsx)("div",{className:"text-2xl font-bold text-blue-600",children:v.total}),(0,s.jsx)("div",{className:"text-sm text-gray-600",children:"Total Compras"})]}),(0,s.jsxs)("div",{className:"bg-white p-4 rounded-lg shadow-sm text-center",children:[(0,s.jsx)("div",{className:"text-2xl font-bold text-yellow-600",children:v.pendientes}),(0,s.jsx)("div",{className:"text-sm text-gray-600",children:"Pendientes"})]}),(0,s.jsxs)("div",{className:"bg-white p-4 rounded-lg shadow-sm text-center",children:[(0,s.jsx)("div",{className:"text-2xl font-bold text-green-600",children:v.confirmadas}),(0,s.jsx)("div",{className:"text-sm text-gray-600",children:"Confirmadas"})]}),(0,s.jsxs)("div",{className:"bg-white p-4 rounded-lg shadow-sm text-center",children:[(0,s.jsx)("div",{className:"text-2xl font-bold text-red-600",children:v.canceladas}),(0,s.jsx)("div",{className:"text-sm text-gray-600",children:"Canceladas"})]}),(0,s.jsxs)("div",{className:"bg-white p-4 rounded-lg shadow-sm text-center",children:[(0,s.jsx)("div",{className:"text-2xl font-bold text-purple-600",children:v.boletosVendidos}),(0,s.jsx)("div",{className:"text-sm text-gray-600",children:"Boletos Vendidos"})]}),(0,s.jsxs)("div",{className:"bg-white p-4 rounded-lg shadow-sm text-center",children:[(0,s.jsx)("div",{className:"text-2xl font-bold text-green-600",children:b(v.ingresosTotales)}),(0,s.jsx)("div",{className:"text-sm text-gray-600",children:"Ingresos"})]})]}),(0,s.jsx)("div",{className:"bg-white rounded-lg shadow-sm p-4 mb-6",children:(0,s.jsxs)("div",{className:"flex flex-col md:flex-row gap-4",children:[(0,s.jsx)("div",{className:"flex gap-2",children:["todas","pendiente","confirmada","cancelada"].map(e=>(0,s.jsx)("button",{onClick:()=>c(e),className:`px-3 py-1 rounded-full text-sm font-medium transition-colors ${d===e?"bg-blue-100 text-blue-800 border-2 border-blue-300":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`,children:e.charAt(0).toUpperCase()+e.slice(1)},e))}),(0,s.jsx)("div",{className:"flex-1",children:(0,s.jsx)("input",{type:"text",placeholder:"Buscar por nombre, email o tel\xe9fono...",value:m,onChange:e=>u(e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"})}),(0,s.jsx)("button",{onClick:h,className:"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",children:"\uD83D\uDD04 Actualizar"})]})}),(0,s.jsxs)("div",{className:"bg-white rounded-lg shadow-sm overflow-hidden",children:[(0,s.jsx)("div",{className:"overflow-x-auto",children:(0,s.jsxs)("table",{className:"min-w-full divide-y divide-gray-200",children:[(0,s.jsx)("thead",{className:"bg-gray-50",children:(0,s.jsxs)("tr",{children:[(0,s.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Cliente"}),(0,s.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Contacto"}),(0,s.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Compra"}),(0,s.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Boletos"}),(0,s.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Pago"}),(0,s.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Estado"}),(0,s.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Fecha"}),(0,s.jsx)("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",children:"Acciones"})]})}),(0,s.jsx)("tbody",{className:"bg-white divide-y divide-gray-200",children:y.map(e=>(0,s.jsxs)("tr",{className:"hover:bg-gray-50",children:[(0,s.jsx)("td",{className:"px-6 py-4 whitespace-nowrap",children:(0,s.jsxs)("div",{children:[(0,s.jsx)("div",{className:"text-sm font-medium text-gray-900",children:e.customer.name}),(0,s.jsxs)("div",{className:"text-sm text-gray-500",children:[e.customer.city,", ",e.customer.state]})]})}),(0,s.jsxs)("td",{className:"px-6 py-4 whitespace-nowrap",children:[(0,s.jsx)("div",{className:"text-sm text-gray-900",children:e.customer.email}),(0,s.jsx)("div",{className:"text-sm text-gray-500",children:e.customer.phone})]}),(0,s.jsxs)("td",{className:"px-6 py-4 whitespace-nowrap",children:[(0,s.jsxs)("div",{className:"text-sm text-gray-900",children:[e.tickets.length," boleto",1!==e.tickets.length?"s":""]}),(0,s.jsx)("div",{className:"text-sm font-medium text-green-600",children:b(e.total_amount)}),(0,s.jsxs)("div",{className:"text-xs text-gray-500",children:[b(e.unit_price),"/boleto"]}),e.discount_applied&&e.discount_applied>0&&(0,s.jsxs)("div",{className:"text-xs text-orange-600 font-medium",children:["\uD83C\uDFF7️ -",e.discount_applied,"% descuento"]})]}),(0,s.jsx)("td",{className:"px-6 py-4",children:e.tickets&&e.tickets.length>0?(0,s.jsxs)("div",{children:[(0,s.jsx)("div",{className:"text-sm text-gray-900 font-mono max-w-xs",children:e.tickets.length<=5?e.tickets.map(e=>String(e.number).padStart(4,"0")).join(", "):`${e.tickets.slice(0,3).map(e=>String(e.number).padStart(4,"0")).join(", ")}... (+${e.tickets.length-3} m\xe1s)`}),(0,s.jsxs)("div",{className:"text-xs text-green-600 mt-1",children:["✅ ",e.tickets.length," n\xfameros asignados"]})]}):"confirmada"===e.status?(0,s.jsx)("div",{className:"text-sm text-red-600",children:"❌ Error: Confirmada sin n\xfameros"}):(0,s.jsx)("div",{className:"text-sm text-orange-600",children:"⏳ Pendiente de asignaci\xf3n"})}),(0,s.jsxs)("td",{className:"px-6 py-4 whitespace-nowrap",children:[(0,s.jsx)("div",{className:"text-sm text-gray-900",children:e.payment_method}),e.payment_reference&&(0,s.jsx)("div",{className:"text-xs text-gray-500",children:e.payment_reference})]}),(0,s.jsx)("td",{className:"px-6 py-4 whitespace-nowrap",children:(0,s.jsx)("span",{className:`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${"confirmada"===e.status?"bg-green-100 text-green-800":"pendiente"===e.status?"bg-yellow-100 text-yellow-800":"bg-red-100 text-red-800"}`,children:e.status})}),(0,s.jsx)("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-gray-500",children:new Date(e.created_at||"").toLocaleString("es-MX",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}),(0,s.jsxs)("td",{className:"px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2",children:["pendiente"===e.status&&(0,s.jsx)("button",{onClick:()=>f(e.id,"confirmada"),className:"text-green-600 hover:text-green-900 font-medium",title:`Confirmar compra y asignar ${0===e.tickets.length?Math.round(e.total_amount/200):e.tickets.length} n\xfameros disponibles`,children:"✅ Confirmar & Asignar"}),"confirmada"===e.status&&0===e.tickets.length&&(0,s.jsx)("button",{onClick:()=>f(e.id,"confirmada"),className:"text-orange-600 hover:text-orange-900 font-medium",title:"Reintentar asignaci\xf3n de n\xfameros",children:"\uD83D\uDD04 Reasignar N\xfameros"}),"cancelada"!==e.status&&(0,s.jsx)("button",{onClick:()=>f(e.id,"cancelada"),className:"text-red-600 hover:text-red-900",title:e.tickets.length>0?`Cancelar y liberar ${e.tickets.length} n\xfameros`:"Cancelar compra",children:"❌ Cancelar"}),e.payment_proof_url&&(0,s.jsx)("button",{onClick:()=>{window.open(e.payment_proof_url,"_blank")},className:"text-blue-600 hover:text-blue-900",children:"\uD83D\uDCF7 Ver Captura"})]})]},e.id))})]})}),0===y.length&&(0,s.jsx)("div",{className:"text-center py-8",children:(0,s.jsx)("p",{className:"text-gray-500",children:"No se encontraron compras con los filtros seleccionados."})})]})]})})}function d(){let[e,t]=(0,r.useState)(!1),[a,o]=(0,r.useState)("");return e?(0,s.jsxs)("div",{className:"relative",children:[(0,s.jsx)("div",{className:"fixed top-4 right-4 z-50",children:(0,s.jsx)("button",{onClick:()=>t(!1),className:"px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg",children:"\uD83D\uDD13 Cerrar Sesi\xf3n"})}),(0,s.jsx)(l,{})]}):(0,s.jsx)("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center",children:(0,s.jsxs)("div",{className:"max-w-md w-full bg-white shadow-md rounded-lg p-6",children:[(0,s.jsxs)("div",{className:"text-center mb-6",children:[(0,s.jsx)("h1",{className:"text-2xl font-bold text-gray-900",children:"\uD83D\uDD10 Acceso Administrativo"}),(0,s.jsx)("p",{className:"text-sm text-gray-600 mt-2",children:"Panel de control para la Rifa Silverado Z71"}),(0,s.jsx)("p",{className:"text-xs text-gray-500 mt-1",children:"Usando localStorage (datos locales)"})]}),(0,s.jsxs)("form",{onSubmit:e=>{e.preventDefault(),"rifa2024admin"===a?t(!0):alert("Clave incorrecta")},className:"space-y-4",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Clave de administrador:"}),(0,s.jsx)("input",{type:"password",value:a,onChange:e=>o(e.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Ingresa la clave...",required:!0})]}),(0,s.jsx)("button",{type:"submit",className:"w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors",children:"Iniciar Sesi\xf3n"})]}),(0,s.jsx)("div",{className:"mt-4 p-3 bg-gray-100 rounded-lg",children:(0,s.jsxs)("p",{className:"text-xs text-gray-600 text-center",children:["\uD83D\uDCA1 Clave demo: ",(0,s.jsx)("code",{className:"font-mono",children:"rifa2024admin"})]})})]})})}}},e=>{e.O(0,[354,690,726,114,441,964,358],()=>e(e.s=3515)),_N_E=e.O()}]);