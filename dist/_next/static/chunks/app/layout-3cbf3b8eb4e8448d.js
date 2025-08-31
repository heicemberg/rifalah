(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[177],{179:(e,t,r)=>{"use strict";r.d(t,{AppProviders:()=>i});var a=r(5155),o=r(2115);class n extends o.Component{constructor(e){super(e),this.state={hasError:!1,error:null}}static getDerivedStateFromError(e){return{hasError:!0,error:e}}componentDidCatch(e,t){console.error("ErrorBoundary caught an error:",e,t),this.props.onError&&this.props.onError(e,t)}render(){return this.state.hasError?this.props.fallback?this.props.fallback:(0,a.jsx)("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center p-4",children:(0,a.jsxs)("div",{className:"max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center",children:[(0,a.jsx)("div",{className:"text-6xl mb-4",children:"⚠️"}),(0,a.jsx)("h2",{className:"text-2xl font-bold text-gray-800 mb-2",children:"Algo sali\xf3 mal"}),(0,a.jsx)("p",{className:"text-gray-600 mb-4",children:"Ha ocurrido un error inesperado. Por favor, recarga la p\xe1gina para continuar."}),(0,a.jsx)("button",{onClick:()=>window.location.reload(),className:"bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors",children:"Recargar P\xe1gina"})]})}):this.props.children}}let i=e=>{let{children:t}=e;return(0,a.jsx)(n,{children:t})}},347:()=>{},428:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,8245,23)),Promise.resolve().then(r.bind(r,1530)),Promise.resolve().then(r.t.bind(r,347,23)),Promise.resolve().then(r.bind(r,439)),Promise.resolve().then(r.bind(r,179))},439:(e,t,r)=>{"use strict";r.d(t,{default:()=>l});var a=r(5155),o=r(9243),n=r.n(o),i=r(2115),s=r(7358);function l(){return(0,i.useEffect)(()=>{try{let e=localStorage.getItem("theme");"dark"===e||!e&&window.matchMedia("(prefers-color-scheme: dark)").matches?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")}catch(e){console.warn("Theme initialization error:",e)}},[]),(0,a.jsxs)(a.Fragment,{children:[s.env.NEXT_PUBLIC_GA_ID&&(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n(),{src:`https://www.googletagmanager.com/gtag/js?id=${s.env.NEXT_PUBLIC_GA_ID}`,strategy:"afterInteractive"}),(0,a.jsx)(n(),{id:"google-analytics",strategy:"afterInteractive",children:`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', '${s.env.NEXT_PUBLIC_GA_ID}', {
                page_title: 'Rifa Silverado Z71 2024 - P\xe1gina Principal',
                page_location: window.location.href,
                custom_map: {
                  'custom_parameter_1': 'rifa_silverado'
                }
              });
            `})]}),(0,a.jsx)(n(),{id:"ecommerce-tracking",strategy:"afterInteractive",children:`
          window.raffleTracking = {
            ticketSelected: function(ticketNumber, totalSelected) {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'select_item', {
                  event_category: 'rifa_tickets',
                  event_label: 'ticket_' + ticketNumber,
                  value: totalSelected
                });
              }
            },
            purchaseStarted: function(ticketCount, totalValue) {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'begin_checkout', {
                  event_category: 'rifa_purchase',
                  event_label: 'checkout_started',
                  value: totalValue,
                  currency: 'MXN'
                });
              }
            }
          };
        `})]})}},1530:(e,t,r)=>{"use strict";r.r(t),r.d(t,{CheckmarkIcon:()=>B,ErrorIcon:()=>F,LoaderIcon:()=>z,ToastBar:()=>K,ToastIcon:()=>J,Toaster:()=>ee,default:()=>et,resolveValue:()=>b,toast:()=>L,useToaster:()=>A,useToasterStore:()=>S});var a,o=r(2115);let n={data:""},i=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,s=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let r="",a="",o="";for(let n in e){let i=e[n];"@"==n[0]?"i"==n[1]?r=n+" "+i+";":a+="f"==n[1]?c(i,n):n+"{"+c(i,"k"==n[1]?"":t)+"}":"object"==typeof i?a+=c(i,t?t.replace(/([^,])+/g,e=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):n):null!=i&&(n=/^--/.test(n)?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=c.p?c.p(n,i):n+":"+i+";")}return r+(t&&o?t+"{"+o+"}":o)+a},d={},u=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+u(e[r]);return t}return e};function f(e){let t,r,a,o=this||{},f=e.call?e(o.p):e;return((e,t,r,a,o)=>{var n,f,p,m;let g=u(e),h=d[g]||(d[g]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(g));if(!d[h]){let t=g!==e?e:(e=>{let t,r,a=[{}];for(;t=i.exec(e.replace(s,""));)t[4]?a.shift():t[3]?(r=t[3].replace(l," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(l," ").trim();return a[0]})(e);d[h]=c(o?{["@keyframes "+h]:t}:t,r?"":"."+h)}let y=r&&d.g?d.g:null;return r&&(d.g=d[h]),n=d[h],f=t,p=a,(m=y)?f.data=f.data.replace(m,n):-1===f.data.indexOf(n)&&(f.data=p?n+f.data:f.data+n),h})(f.unshift?f.raw?(t=[].slice.call(arguments,1),r=o.p,f.reduce((e,a,o)=>{let n=t[o];if(n&&n.call){let e=n(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;n=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+a+(null==n?"":n)},"")):f.reduce((e,t)=>Object.assign(e,t&&t.call?t(o.p):t),{}):f,(a=o.target,"object"==typeof window?((a?a.querySelector("#_goober"):window._goober)||Object.assign((a||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:a||n),o.g,o.o,o.k)}f.bind({g:1});let p,m,g,h=f.bind({k:1});function y(e,t){let r=this||{};return function(){let a=arguments;function o(n,i){let s=Object.assign({},n),l=s.className||o.className;r.p=Object.assign({theme:m&&m()},s),r.o=/ *go\d+/.test(l),s.className=f.apply(r,a)+(l?" "+l:""),t&&(s.ref=i);let c=e;return e[0]&&(c=s.as||e,delete s.as),g&&c[0]&&g(s),p(c,s)}return t?t(o):o}}var b=(e,t)=>"function"==typeof e?e(t):e,v=(()=>{let e=0;return()=>(++e).toString()})(),x=(()=>{let e;return()=>{if(void 0===e&&"u">typeof window){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),_="default",w=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return w(e,{type:+!!e.toasts.find(e=>e.id===a.id),toast:a});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let n=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+n}))}}},k=[],E={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},I={},j=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:_;I[t]=w(I[t]||E,e),k.forEach(e=>{let[r,a]=e;r===t&&a(I[t])})},C=e=>Object.keys(I).forEach(t=>j(e,t)),O=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:_;return t=>{j(t,e)}},P={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},S=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:_,[r,a]=(0,o.useState)(I[t]||E),n=(0,o.useRef)(I[t]);(0,o.useEffect)(()=>(n.current!==I[t]&&a(I[t]),k.push([t,a]),()=>{let e=k.findIndex(e=>{let[r]=e;return r===t});e>-1&&k.splice(e,1)}),[t]);let i=r.toasts.map(t=>{var r,a,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||P[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...r,toasts:i}},N=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"blank",r=arguments.length>2?arguments[2]:void 0;return{createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||v()}},M=e=>(t,r)=>{let a,o=N(t,e,r);return O(o.toasterId||(a=o.id,Object.keys(I).find(e=>I[e].toasts.some(e=>e.id===a))))({type:2,toast:o}),o.id},L=(e,t)=>M("blank")(e,t);L.error=M("error"),L.success=M("success"),L.loading=M("loading"),L.custom=M("custom"),L.dismiss=(e,t)=>{let r={type:3,toastId:e};t?O(t)(r):C(r)},L.dismissAll=e=>L.dismiss(void 0,e),L.remove=(e,t)=>{let r={type:4,toastId:e};t?O(t)(r):C(r)},L.removeAll=e=>L.remove(void 0,e),L.promise=(e,t,r)=>{let a=L.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?b(t.success,e):void 0;return o?L.success(o,{id:a,...r,...null==r?void 0:r.success}):L.dismiss(a),e}).catch(e=>{let o=t.error?b(t.error,e):void 0;o?L.error(o,{id:a,...r,...null==r?void 0:r.error}):L.dismiss(a)}),e};var A=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"default",{toasts:r,pausedAt:a}=S(e,t),n=(0,o.useRef)(new Map).current,i=(0,o.useCallback)(function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1e3;if(n.has(e))return;let r=setTimeout(()=>{n.delete(e),s({type:4,toastId:e})},t);n.set(e,r)},[]);(0,o.useEffect)(()=>{if(a)return;let e=Date.now(),o=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&L.dismiss(r.id);return}return setTimeout(()=>L.dismiss(r.id,t),a)});return()=>{o.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let s=(0,o.useCallback)(O(t),[t]),l=(0,o.useCallback)(()=>{s({type:5,time:Date.now()})},[s]),c=(0,o.useCallback)((e,t)=>{s({type:1,toast:{id:e,height:t}})},[s]),d=(0,o.useCallback)(()=>{a&&s({type:6,time:Date.now()})},[a,s]),u=(0,o.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:o=8,defaultPosition:n}=t||{},i=r.filter(t=>(t.position||n)===(e.position||n)&&t.height),s=i.findIndex(t=>t.id===e.id),l=i.filter((e,t)=>t<s&&e.visible).length;return i.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+o,0)},[r]);return(0,o.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=n.get(e.id);t&&(clearTimeout(t),n.delete(e.id))}})},[r,i]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:d,calculateOffset:u}}},T=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,D=h`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,$=h`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,F=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${T} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${D} 0.15s ease-out forwards;
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
    animation: ${$} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,H=h`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,z=y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${H} 1s linear infinite;
`,R=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,q=h`
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
}`,B=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${R} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${q} 0.2s ease-out forwards;
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
`,U=y("div")`
  position: absolute;
`,X=y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,G=h`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,V=y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${G} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,J=e=>{let{toast:t}=e,{icon:r,type:a,iconTheme:n}=t;return void 0!==r?"string"==typeof r?o.createElement(V,null,r):r:"blank"===a?null:o.createElement(X,null,o.createElement(z,{...n}),"loading"!==a&&o.createElement(U,null,"error"===a?o.createElement(F,{...n}):o.createElement(B,{...n})))},Z=y("div")`
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
`,Y=y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,K=o.memo(e=>{let{toast:t,position:r,style:a,children:n}=e,i=t.height?((e,t)=>{let r=e.includes("top")?1:-1,[a,o]=x()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*r}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*r}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${h(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${h(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(t.position||r||"top-center",t.visible):{opacity:0},s=o.createElement(J,{toast:t}),l=o.createElement(Y,{...t.ariaProps},b(t.message,t));return o.createElement(Z,{className:t.className,style:{...i,...a,...t.style}},"function"==typeof n?n({icon:s,message:l}):o.createElement(o.Fragment,null,s,l))});a=o.createElement,c.p=void 0,p=a,m=void 0,g=void 0;var Q=e=>{let{id:t,className:r,style:a,onHeightUpdate:n,children:i}=e,s=o.useCallback(e=>{if(e){let r=()=>{n(t,e.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(e,{subtree:!0,childList:!0,characterData:!0})}},[t,n]);return o.createElement("div",{ref:s,className:r,style:a},i)},W=f`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ee=e=>{let{reverseOrder:t,position:r="top-center",toastOptions:a,gutter:n,children:i,toasterId:s,containerStyle:l,containerClassName:c}=e,{toasts:d,handlers:u}=A(a,s);return o.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...l},className:c,onMouseEnter:u.startPause,onMouseLeave:u.endPause},d.map(e=>{let a=e.position||r,s=((e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:x()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}})(a,u.calculateOffset(e,{reverseOrder:t,gutter:n,defaultPosition:r}));return o.createElement(Q,{id:e.id,key:e.id,onHeightUpdate:u.updateHeight,className:e.visible?W:"",style:s},"custom"===e.type?b(e.message,e):i?i(e):o.createElement(K,{toast:e,position:a}))}))},et=L},2374:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),!function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{cancelIdleCallback:function(){return a},requestIdleCallback:function(){return r}});let r="undefined"!=typeof self&&self.requestIdleCallback&&self.requestIdleCallback.bind(window)||function(e){let t=Date.now();return self.setTimeout(function(){e({didTimeout:!1,timeRemaining:function(){return Math.max(0,50-(Date.now()-t))}})},1)},a="undefined"!=typeof self&&self.cancelIdleCallback&&self.cancelIdleCallback.bind(window)||function(e){return clearTimeout(e)};("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},2714:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"setAttributesFromProps",{enumerable:!0,get:function(){return n}});let r={acceptCharset:"accept-charset",className:"class",htmlFor:"for",httpEquiv:"http-equiv",noModule:"noModule"},a=["onLoad","onReady","dangerouslySetInnerHTML","children","onError","strategy","stylesheets"];function o(e){return["async","defer","noModule"].includes(e)}function n(e,t){for(let[n,i]of Object.entries(t)){if(!t.hasOwnProperty(n)||a.includes(n)||void 0===i)continue;let s=r[n]||n.toLowerCase();"SCRIPT"===e.tagName&&o(s)?e[s]=!!i:e.setAttribute(s,String(i)),(!1===i||"SCRIPT"===e.tagName&&o(s)&&(!i||"false"===i))&&(e.setAttribute(s,""),e.removeAttribute(s))}}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},8245:e=>{e.exports={style:{fontFamily:"'Inter', 'Inter Fallback', system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",fontStyle:"normal"},className:"__className_f8d785",variable:"__variable_f8d785"}},9243:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),!function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{default:function(){return y},handleClientScriptLoad:function(){return m},initScriptLoader:function(){return g}});let a=r(8229),o=r(6966),n=r(5155),i=a._(r(7650)),s=o._(r(2115)),l=r(2830),c=r(2714),d=r(2374),u=new Map,f=new Set,p=e=>{let{src:t,id:r,onLoad:a=()=>{},onReady:o=null,dangerouslySetInnerHTML:n,children:s="",strategy:l="afterInteractive",onError:d,stylesheets:p}=e,m=r||t;if(m&&f.has(m))return;if(u.has(t)){f.add(m),u.get(t).then(a,d);return}let g=()=>{o&&o(),f.add(m)},h=document.createElement("script"),y=new Promise((e,t)=>{h.addEventListener("load",function(t){e(),a&&a.call(this,t),g()}),h.addEventListener("error",function(e){t(e)})}).catch(function(e){d&&d(e)});n?(h.innerHTML=n.__html||"",g()):s?(h.textContent="string"==typeof s?s:Array.isArray(s)?s.join(""):"",g()):t&&(h.src=t,u.set(t,y)),(0,c.setAttributesFromProps)(h,e),"worker"===l&&h.setAttribute("type","text/partytown"),h.setAttribute("data-nscript",l),p&&(e=>{if(i.default.preinit)return e.forEach(e=>{i.default.preinit(e,{as:"style"})});{let t=document.head;e.forEach(e=>{let r=document.createElement("link");r.type="text/css",r.rel="stylesheet",r.href=e,t.appendChild(r)})}})(p),document.body.appendChild(h)};function m(e){let{strategy:t="afterInteractive"}=e;"lazyOnload"===t?window.addEventListener("load",()=>{(0,d.requestIdleCallback)(()=>p(e))}):p(e)}function g(e){e.forEach(m),[...document.querySelectorAll('[data-nscript="beforeInteractive"]'),...document.querySelectorAll('[data-nscript="beforePageRender"]')].forEach(e=>{let t=e.id||e.getAttribute("src");f.add(t)})}function h(e){let{id:t,src:r="",onLoad:a=()=>{},onReady:o=null,strategy:c="afterInteractive",onError:u,stylesheets:m,...g}=e,{updateScripts:h,scripts:y,getIsSsr:b,appDir:v,nonce:x}=(0,s.useContext)(l.HeadManagerContext);x=g.nonce||x;let _=(0,s.useRef)(!1);(0,s.useEffect)(()=>{let e=t||r;_.current||(o&&e&&f.has(e)&&o(),_.current=!0)},[o,t,r]);let w=(0,s.useRef)(!1);if((0,s.useEffect)(()=>{if(!w.current){if("afterInteractive"===c)p(e);else"lazyOnload"===c&&("complete"===document.readyState?(0,d.requestIdleCallback)(()=>p(e)):window.addEventListener("load",()=>{(0,d.requestIdleCallback)(()=>p(e))}));w.current=!0}},[e,c]),("beforeInteractive"===c||"worker"===c)&&(h?(y[c]=(y[c]||[]).concat([{id:t,src:r,onLoad:a,onReady:o,onError:u,...g,nonce:x}]),h(y)):b&&b()?f.add(t||r):b&&!b()&&p({...e,nonce:x})),v){if(m&&m.forEach(e=>{i.default.preinit(e,{as:"style"})}),"beforeInteractive"===c)if(!r)return g.dangerouslySetInnerHTML&&(g.children=g.dangerouslySetInnerHTML.__html,delete g.dangerouslySetInnerHTML),(0,n.jsx)("script",{nonce:x,dangerouslySetInnerHTML:{__html:"(self.__next_s=self.__next_s||[]).push("+JSON.stringify([0,{...g,id:t}])+")"}});else return i.default.preload(r,g.integrity?{as:"script",integrity:g.integrity,nonce:x,crossOrigin:g.crossOrigin}:{as:"script",nonce:x,crossOrigin:g.crossOrigin}),(0,n.jsx)("script",{nonce:x,dangerouslySetInnerHTML:{__html:"(self.__next_s=self.__next_s||[]).push("+JSON.stringify([r,{...g,id:t}])+")"}});"afterInteractive"===c&&r&&i.default.preload(r,g.integrity?{as:"script",integrity:g.integrity,nonce:x,crossOrigin:g.crossOrigin}:{as:"script",nonce:x,crossOrigin:g.crossOrigin})}return null}Object.defineProperty(h,"__nextScript",{value:!0});let y=h;("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)}},e=>{e.O(0,[584,309,441,964,358],()=>e(e.s=428)),_N_E=e.O()}]);