"use strict";var xe=Object.create;var O=Object.defineProperty;var pe=Object.getOwnPropertyDescriptor;var ve=Object.getOwnPropertyNames;var Se=Object.getPrototypeOf,Me=Object.prototype.hasOwnProperty;var Ee=(i,r)=>{for(var e in r)O(i,e,{get:r[e],enumerable:!0})},Y=(i,r,e,t)=>{if(r&&typeof r=="object"||typeof r=="function")for(let s of ve(r))!Me.call(i,s)&&s!==e&&O(i,s,{get:()=>r[s],enumerable:!(t=pe(r,s))||t.enumerable});return i},m=(i,r,e)=>(Y(i,r,"default"),e&&Y(e,r,"default")),qe=(i,r,e)=>(e=i!=null?xe(Se(i)):{},Y(r||!i||!i.__esModule?O(e,"default",{value:i,enumerable:!0}):e,i)),be=i=>Y(O({},"__esModule",{value:!0}),i),x=(i,r,e,t)=>{for(var s=t>1?void 0:t?pe(r,e):r,n=i.length-1,o;n>=0;n--)(o=i[n])&&(s=(t?o(r,e,s):o(s))||s);return t&&s&&O(r,e,s),s};var de=(i,r,e)=>{if(!r.has(i))throw TypeError("Cannot "+e)};var h=(i,r,e)=>(de(i,r,"read from private field"),e?e.call(i):r.get(i)),S=(i,r,e)=>{if(r.has(i))throw TypeError("Cannot add the same private member more than once");r instanceof WeakSet?r.add(i):r.set(i,e)},M=(i,r,e,t)=>(de(i,r,"write to private field"),t?t.call(i,e):r.set(i,e),e);var f={};Ee(f,{App:()=>R,BrowserHistory:()=>C,DocumentMetaMiddleware:()=>te,History:()=>L,Middleware:()=>b,Page:()=>ne,Path:()=>E,Request:()=>q,Response:()=>v,Route:()=>P,Router:()=>A,Transition:()=>Le,cancelAnimationFrame:()=>Ce,fetch:()=>Ne,getApp:()=>oe,getRouter:()=>Te,isBrowser:()=>ke,isNode:()=>Ie,loadScript:()=>Fe,loadStyleSheet:()=>De,requestAnimationFrame:()=>$e,unloadStyleSheet:()=>Be});module.exports=be(f);m(f,require("@chialab/dna"),module.exports);function re(i){return i.replace(/^\/*/,"")}function Pe(i){return i.replace(/\/*$/,"")}function D(i){return re(Pe(i))}var H,E=class{constructor(r){S(this,H,void 0);M(this,H,new URL(`/${D(r)}`,"http://local"))}get pathname(){return h(this,H).pathname}get hash(){return h(this,H).hash}get search(){return h(this,H).search}get searchParams(){return new URLSearchParams(h(this,H).searchParams)}get href(){return`${this.pathname}${this.search}${this.hash}`}};H=new WeakMap;var q=class{constructor(r,e,t){this.params={};r=typeof r=="string"?new URL(r):r,this.url=r,this.path=e?.path??new E(`${r.pathname}${r.search}${r.hash}`),this.method=e?.method?.toLowerCase()||"get",this.data=e?.data,this.parent=t}get resolving(){return!this.response&&!this.error}get resolved(){return!!this.response||!!this.error}get childRequest(){return this._childRequest}get response(){return this._response}get matcher(){return this._matcher}get error(){return this._error}child(r,e){return this._childRequest=new q(r,e,this)}setMatcher(r){this._matcher=r}setParams(r){this.params=r}resolve(r){this._response=r}reject(r){this._error=r}isSubRouteRequest(r){let e=this.matcher;return!e||!e.router?!1:!!e.matches(r.url.pathname)}};var v=class{get childResponse(){return this._childResponse}get title(){return this._childResponse?.title??this._title}set title(r){this.setTitle(r)}get meta(){return this._childResponse?.meta??this._meta}set meta(r){this.setMeta(r)}constructor(r,e){this.request=r,e&&(this.parent=e,this.setData(e.getData()))}child(r){return this._childResponse=r}setView(r){this.view=r}getData(r=null){return this.data??r}setData(r){this.data=r}setTitle(r){this._title=r,this._childResponse&&this._childResponse.setTitle(r)}setMeta(r){this._meta=r,this._childResponse&&this._childResponse.setMeta(r)}render(){return this.view?.(this.request,this)}redirect(r,e){this.redirected=r,this.redirectInit=e}};var B=class{constructor(r){this.cache={};this.pattern=r.pattern||"*",this.priority=typeof r.priority<"u"?r.priority:20;let[e,t]=this.constructor.patternToRegex(this.pattern);this.regex=e,this.names=t}static patternToRegex(r){if(r==="*")return[/.*/,[]];let e=[],t=r.split("/").map(n=>{if(!n)return"";if(n==="*")return e.push("_"),"(\\/.*?)?";if(n.indexOf(":")!==0)return`\\/${n.replace(/([()[\]{}\\\-+.*?^$])/g,"\\$1")}`;let o=n.substr(1),d="\\/([^\\/]+?)";return o.endsWith("*")&&(o=o.substr(0,o.length-1),d="(\\/.*?)?"),e.push(o),d}).join("");return[new RegExp(`^${t||"\\/"}(#|$)`,"i"),e]}matches(r){if(r=r.split("?")[0],this.cache[r])return this.cache[r];let e=r.match(this.regex);if(!e)return this.cache[r]=!1,!1;let t={};return this.names.forEach((s,n)=>{t[s]=e[n+1]}),this.cache[r]=t,t}};var P=class extends B{constructor(e){super(e);this.handler=e.handler||(()=>{}),this.view=e.render,this.router=e.router}async exec(e,t,s,n){let o=await this.handler?.(e,t,s,n);if(o instanceof v){if(o!==t)return o}else if(o)return t.redirect(o),t;return this.router&&t.child(await this.router.navigate(e.params?._||"/",{method:e.method,data:e.data},{},!1,!1,e,t)),t}};var b=class extends B{constructor(e){super(e);this.before=e.before,this.after=e.after}hookBefore(e,t,s,n){return this.before?.(e,t,s,n)}hookAfter(e,t,s,n){return this.after?.(e,t,s,n)}};var N,U=class{constructor(){S(this,N,{})}on(r,e){(h(this,N)[r]=h(this,N)[r]||[]).push(e)}off(r,e){let t=h(this,N)[r];if(!t)return;let s=t.indexOf(e);s!==-1&&t.splice(s,1)}trigger(r,e){let t=h(this,N)[r];if(!!t)return t.reduce((s,n)=>n(e,s)??s,null)}};N=new WeakMap;function he(i){return i&&typeof i=="object"&&typeof i.historyId=="string"&&typeof i.index=="number"}var le=0,L=class extends U{constructor(){super();this._entries=[];this._map=new Map;this._index=-1;this._id=`${Date.now()}-${le++}`}get states(){return this._entries.map(e=>this._map.get(e))}get state(){return this.states[this._index]??void 0}get index(){return this._index}get length(){return this._entries.length}reset(){this._id=`${Date.now()}-${le++}`,this._entries.splice(0,this._entries.length),this._index=-1}async go(e){if(e===0)return;let t=this._index+e;if(t<0||t>=this._entries.length)return;let s=this.state;this._index=t,this.trigger("popstate",{state:this.state,previous:s})}async back(){return this.go(-1)}async forward(){return this.go(1)}async pushState(e){let t={historyId:this._id,url:e.url,path:e.path,title:e.title,data:e.data,index:this.index+1,type:"push"};this._map.set(t,e),this._entries=this._entries.slice(0,this._index+1),this._entries.push(t);let s=this.state;return this._index=t.index,this.trigger("pushstate",{state:this.state,previous:s}),t}async replaceState(e){let t={historyId:this._id,url:e.url,path:e.path,title:e.title,data:e.data,index:Math.max(this.index,0),type:"replace"},s=this.state;return this._index=t.index,this._map.set(t,e),this._entries[this._index]=t,this.trigger("replacestate",{state:this.state,previous:s}),t}compareStates(e,t){let s=this.states;return s.indexOf(t)<s.indexOf(e)?"back":"forward"}};var Q=require("@chialab/dna");var se=!1;function ce(i){return JSON.parse(JSON.stringify(i))}var $,_,C=class extends L{constructor(e=Q.window.history){super();S(this,$,void 0);S(this,_,void 0);this.onPopState=async e=>{if(!he(e.state))return;let t=this.state;e.state.historyId!==this._id?(this.reset(),this.trigger("popstate",{state:e.state,previous:t})):(this._index=e.state.index,this.trigger("popstate",{state:this.state,previous:t})),h(this,_)&&h(this,_).resolve(),M(this,_,void 0)};M(this,$,e),this.listen()}listen(){if(se)throw new Error('You cannot initialize more than one "BrowserHistory".');se=!0,Q.window.addEventListener("popstate",this.onPopState)}unlisten(){se=!1,Q.window.removeEventListener("popstate",this.onPopState)}async go(e){return h(this,_)&&h(this,_).reject(),new Promise((t,s)=>{M(this,_,{resolve:t,reject:s}),h(this,$).go(e)})}async pushState(e){let t=await super.pushState(e);return h(this,$).pushState(ce(t),t.title,t.url),t}async replaceState(e){let t=await super.replaceState(e);return h(this,$).replaceState(ce(t),t.title,t.url),t}};$=new WeakMap,_=new WeakMap;var T=require("@chialab/dna");var F=require("@chialab/dna/jsx-runtime");function _e(i){if(!!i.stack)return(0,F.jsx)("p",{children:i.stack.split(/^(.*)$/gm).map(r=>(0,F.jsx)("div",{children:r}))})}function ie(i,r){let e=new v(i);return e.setTitle(r.message),e.setView(()=>(0,F.jsx)("div",{children:(0,F.jsxs)("details",{children:[(0,F.jsx)("summary",{style:"color: red",children:r.message}),_e(r)]})})),e}var fe="http://local",j,V,z,G,A=class extends U{constructor(e={},t=[],s=[]){super();this.errorHandler=ie;this.connectedRoutes=[];this.connectedMiddlewares=[];S(this,j,void 0);S(this,V,void 0);S(this,z,T.window.location.origin!=="null"?T.window.location.origin:"http://local");S(this,G,"/");this.onPopState=({state:e,previous:t})=>{e?this.replace(e.path,void 0,e.data,!1).then(()=>{this.trigger("popstate",{state:this.state,previous:t})}):this.trigger("popstate",{state:e,previous:t})};e.origin&&this.setOrigin(e.origin),e.base&&this.setBase(e.base),e.errorHandler&&this.setErrorHandler(e.errorHandler),t&&t.forEach(n=>this.connect(n)),s&&s.forEach(n=>this.middleware(n))}get origin(){return h(this,z)}get base(){return h(this,G)}get started(){return!!this.history}get state(){if(!!this.history)return this.history.state}get current(){return this.state?.path}setOrigin(e){if(this.history)throw new Error("Cannot set origin after router is started.");M(this,z,D(e))}setBase(e){if(this.started)throw new Error("Cannot set base after router is started.");M(this,G,e.indexOf("#")!==-1?`/${D(e)}`:`/${D(e.split("?")[0])}`)}setErrorHandler(e){this.errorHandler=e??ie}async handle(e,t,s=null){let n=this.connectedRoutes,o=this.connectedMiddlewares,d=this.pathFromUrl(e.url.href),a=new v(e,t);a.setData(s);for(let u=o.length-1;u>=0;u--){let p=o[u],y=p.matches(d);if(!!y){try{a=await p.hookBefore(e,a,y,this)||a}catch(g){throw e.reject(g),g}if(a.redirected!=null)return e.resolve(a),a}}let c=n.reduceRight((u,p)=>async(y,g)=>{if(g.redirected!=null)return g;let K=p.matches(d);if(K===!1)return u(y,g,this);y.setMatcher(p),y.setParams(K);let w=await p.exec(y,g,u,this)??g;return w.redirected?w:(g=w,p.view&&g.setView(p.view),g)},()=>{throw new Error("Not found")});try{a=await c(e,a,this)??a}catch(u){throw e.reject(u),u}if(a.redirected!=null)return e.resolve(a),a;for(let u=o.length-1;u>=0;u--){let p=o[u],y=p.matches(d);if(!!y){try{a=await p.hookAfter(e,a,y,this)||a}catch(g){throw e.reject(g),g}if(a.redirected!=null)return e.resolve(a),a}}return e.resolve(a),a}async navigate(e,t,s=null,n=!0,o=!1,d,a){return this.setCurrentNavigation(async()=>{e=typeof e=="string"?new E(e):e,t={...t,path:e};let c=this.urlFromPath(e);if(!this.shouldNavigate(c)&&!o)return this.fragment(c.hash||""),null;let u=d?d.child(c,t):new q(c,t);this.setCurrentRequest(u);let p;try{p=await this.handle(u,a)}catch(g){p=this.handleError(u,g)}if(u!==h(this,V))throw new Error("Request aborted.");let y=p.title||T.window.document.title;return await this.pushState({url:p.redirected||c.href,path:e.href,title:y,request:u,response:p,data:p.getData()},n),p.redirected!=null?this.replace(p.redirected,p.redirectInit,s,n,d,a):p})}async replace(e,t,s=null,n=!0,o,d){return this.setCurrentNavigation(async()=>{e=typeof e=="string"?new E(e):e,t={...t,path:e};let a=this.urlFromPath(e),c=o?o.child(a,t):new q(a,t);this.setCurrentRequest(c);let u;try{u=await this.handle(c,d,s)}catch(y){u=this.handleError(c,y)}if(c!==h(this,V))throw new Error("Request aborted.");let p=u.title||T.window.document.title;return await this.replaceState({url:u.redirected||a.href,path:e.href,title:p,request:c,response:u,data:u.getData()},n),u.redirected!=null?this.replace(u.redirected,u.redirectInit,s,n):u})}refresh(e){return this.replace(e||this.current||"/")}fragment(e){this.history instanceof C&&T.window.location.hash!==e&&(T.window.location.hash=e)}middleware(e,t,s){let n;return e instanceof b?n=e:typeof e=="string"?n=new b({pattern:e,before:s,after:t}):n=new b(e),this.connectedMiddlewares.push(n),this.connectedMiddlewares.sort((o,d)=>d.priority-o.priority),n}connect(e,t){let s;if(e instanceof P)s=e;else if(typeof e=="string"){if(!t)throw new Error(`Missing handler for "${e}" route`);s=new P({pattern:e,handler:t})}else s=new P(e);return this.connectedRoutes.push(s),this.connectedRoutes.sort((n,o)=>o.priority-n.priority),s}disconnect(e){if(e instanceof P){let t=this.connectedRoutes.indexOf(e);if(t!==-1)return this.connectedRoutes.splice(t,1),!0}else if(e instanceof b){let t=this.connectedMiddlewares.indexOf(e);if(t!==-1)return this.connectedMiddlewares.splice(t,1),!0}return!1}async start(e,t){return this.history=e,this.history.reset(),e.on("popstate",this.onPopState),e instanceof C?this.replace(t||this.pathFromUrl(T.window.location.href)||"/"):this.replace(t||"/")}end(){this.history&&(this.history.off("popstate",this.onPopState),this.history=void 0)}resolve(e,t=!1){let s=this.urlFromPath(e);return t?s.href:`${s.pathname}${s.search}${s.hash}`}pathFromUrl(e){let t=typeof e=="string"?new URL(e,this.origin):e;if(t.origin!==this.origin)return null;let s=`/${re(t.pathname)}${t.search}${t.hash}`;if(s!==this.base&&s.indexOf(this.base)!==0)return null;let n=new E(s.replace(this.base,""));return`${n.pathname}${n.search}`}urlFromPath(e){return new URL(`/${[this.base,typeof e=="string"?e:e.href].map(t=>D(t)).filter(t=>!!t).join("/")}`,this.origin)}waitNavigation(){return h(this,j)}setCurrentNavigation(e){return M(this,j,e())}setCurrentRequest(e){return M(this,V,e)}handleError(e,t){e.reject(t);let s=this.errorHandler(e,t,this);if(!(s instanceof v)){let n=s;s=new v(e),s.setTitle(t.message),s.setView(n)}return s}async pushState(e,t=!0){let s=this.state;this.history&&await this.history.pushState(e),t&&await this.trigger("pushstate",{state:e,previous:s})}async replaceState(e,t=!0){let s=this.state;this.history&&await this.history.replaceState(e),t&&await this.trigger("replacestate",{previous:s,state:e})}shouldNavigate(e){return this.state?e instanceof E?this.state.path!==e.href:this.state.url!==e.href:!0}};j=new WeakMap,V=new WeakMap,z=new WeakMap,G=new WeakMap;var l=require("@chialab/dna");var ne=function({response:r}){return r?.render()};var me=require("@chialab/dna/jsx-runtime"),R=class extends l.Component{constructor(){super(...arguments);this.autostart=!1;this.navigationDirection="forward";this.history=new L;this.router=new A({origin:this.origin,base:this.base});this.routes=[];this.middlewares=[];this._onPopState=e=>{!e.state||(this.request=e.state.request,this.onPopState(e),this.response=e.state.response)}}get origin(){return this.getInnerPropertyValue("origin")?this.getInnerPropertyValue("origin"):l.window.location.origin&&l.window.location.origin!=="null"?l.window.location.origin:fe}set origin(e){this.setInnerPropertyValue("origin",e)}get base(){return this.getInnerPropertyValue("base")||"/"}set base(e){this.setInnerPropertyValue("base",e)}connectedCallback(){super.connectedCallback(),this.autostart&&this.start(typeof this.autostart=="string"?this.autostart:void 0)}render(){return this.response?(0,me.jsx)(ne,{response:this.response}):null}async start(e){let{router:t,history:s,routes:n,middlewares:o}=this;n.forEach(a=>{t.connect(a)}),o.forEach(a=>{t.middleware(a)}),t.middleware({pattern:"*",priority:-1/0,before:a=>{this.request=a}}),t.on("popstate",this._onPopState),t.on("pushstate",this._onPopState),t.on("replacestate",this._onPopState);let d=await t.start(s,e);if(d)return this.response=d,d}navigate(e,t){return this.router.navigate(e,t)}replace(e,t){return this.router.replace(e,t)}_handleLink(e,t){if(!!this.router.started)return this.handleLink(e,t)}_handleSubmit(e,t){if(!!this.router.started)return this.handleSubmit(e,t)}async handleLink(e,t){let s=t.getAttribute("href");if(!s||(t.getAttribute("target")||"_self")!=="_self")return;let o=this.router.pathFromUrl(s);!o||(e.preventDefault(),e.stopPropagation(),this.navigate(o))}async handleSubmit(e,t){let s=t.getAttribute("action");if(!s||(t.getAttribute("target")||"_self")!=="_self")return;let o=this.router.pathFromUrl(s);if(!o)return;let d=t.getAttribute("method")?.toLowerCase(),a=new l.window.FormData(t);if(e.preventDefault(),e.stopPropagation(),d==="get"){let c=new URLSearchParams(a);this.navigate(`${o.split("?")[0]}?${c}`)}else this.navigate(o,{method:d,data:a})}onPopState(e){let{state:t,previous:s}=e;t&&s?this.navigationDirection=this.history.compareStates(s,t):this.navigationDirection="forward"}_onRequestChanged(e,t){this.onRequest(e,t)}_onResponseChanged(e,t){this.onResponse(e,t)}_onOriginChanged(){this.router&&this.router.setOrigin(this.origin)}_onBaseChanged(){if(this.router){let e=this.base;e[0]==="#"&&(e=`${l.window.location.pathname}${l.window.location.search}${e}`),this.router.setBase(e)}}onRequest(e,t){}onResponse(e,t){}};x([(0,l.property)({type:String})],R.prototype,"origin",1),x([(0,l.property)({type:String})],R.prototype,"base",1),x([(0,l.property)({type:q})],R.prototype,"request",2),x([(0,l.property)({type:v})],R.prototype,"response",2),x([(0,l.property)({type:[Boolean,String]})],R.prototype,"autostart",2),x([(0,l.state)({type:String,attribute:":navigation",update:!1})],R.prototype,"navigationDirection",2),x([(0,l.listen)("click","a")],R.prototype,"_handleLink",1),x([(0,l.listen)("submit","form")],R.prototype,"_handleSubmit",1),x([(0,l.observe)("request")],R.prototype,"_onRequestChanged",1),x([(0,l.observe)("response")],R.prototype,"_onResponseChanged",1),x([(0,l.observe)("origin")],R.prototype,"_onOriginChanged",1),x([(0,l.observe)("base")],R.prototype,"_onBaseChanged",1),R=x([l.customElementPrototype],R);var X=require("@chialab/dna"),k=require("@chialab/dna/jsx-runtime"),He=function({children:r}){return r},Le=function({router:r,children:e,renderer:t=He},s){if(!r)throw new Error("Transition router is required");let{start:n,store:o,requestUpdate:d}=s;if(!n)return(0,k.jsx)(t,{children:e},r.state);let a=o.get("state"),c=n.parentElement,u=o.get("previousState"),p=o.get("previousChildren");if(a!==r.state){if(c){let y=function(w){if(w.target.parentNode!==c)return;let I=(o.get("counter")||0)+1;o.set("counter",I)},g=function(w){if(w.target.parentNode!==c)return;let I=(o.get("counter")||0)-1;o.set("counter",I),I===0&&K()},K=function(){c.removeEventListener("animationstart",y),c.removeEventListener("animationend",g),o.delete("previousState"),o.delete("previousChildren"),d?.()};c.addEventListener("animationstart",y),c.addEventListener("animationend",g),setTimeout(()=>{let w=s.start;for(;w&&w!==s.end;)if(w=w.nextSibling,w.nodeType===X.Node.ELEMENT_NODE){let I=X.window.getComputedStyle(w),ye=I.getPropertyValue("animation-name"),we=I.getPropertyValue("animation-duration");if(ye!=="none"&&we!=="0s")return}K()})}u=a,p=o.get("children"),o.set("previousState",u),o.set("previousChildren",p),o.set("counter",0),o.set("children",e),o.set("state",r.state)}return(0,k.jsxs)(k.Fragment,{children:[u&&(0,k.jsx)(t,{children:p},u),(0,k.jsx)(t,{children:e},r.state)]})};function oe(i){return i instanceof R?i:i.parentNode?oe(i.parentNode):null}function Te(i){return oe(i)?.router??null}var ae=require("@chialab/dna");function ke(){return typeof ae.window._jsdom>"u"}function Ie(){return typeof ae.window._jsdom<"u"}var ue=require("@chialab/dna");async function Ne(i,r){if(typeof ue.window.fetch=="function")return ue.window.fetch(i,r);try{let{default:e}=await import("node-fetch");return e(i,r)}catch{}throw new Error("Missing fetch implementation")}var J=require("@chialab/dna");function $e(i){return typeof J.window.requestAnimationFrame=="function"?J.window.requestAnimationFrame(i):setTimeout(()=>i(Date.now()),0)}function Ce(i){return typeof J.window.cancelAnimationFrame=="function"?J.window.cancelAnimationFrame(i):clearTimeout(i)}var Z=require("@chialab/dna"),Re=new Map;function Fe(i,r=!1){let e=typeof i=="string"?i:i.href,t=Re.get(e);if(!t||r){let s=Z.DOM.createElement("script");s.src=e,t=new Promise((n,o)=>{s.addEventListener("load",()=>n()),s.addEventListener("error",()=>o()),s.addEventListener("abort",()=>o()),Z.window.document.head.appendChild(s)}),Re.set(e,t)}return t}var W=require("@chialab/dna"),ee=new Map;function De(i,r=!1){let e=typeof i=="string"?i:i.href,t=ee.get(e),s;if(!t||r){let n=W.DOM.createElement("link");n.type="text/css",n.rel="stylesheet",n.href=e,s=new Promise((o,d)=>{n.addEventListener("load",()=>n.parentNode?o(n):d(n)),n.addEventListener("error",()=>d(n)),n.addEventListener("abort",()=>d(n)),W.window.document.head.appendChild(n)}),ee.set(e,[n,s])}else s=t[1];return s}function Be(i){let r=typeof i=="string"?i:i.href,e=ee.get(r);if(!e)return;let t=e[0];W.window.document.head.removeChild(t),ee.delete(r)}var ge=require("@chialab/dna");var te=class extends b{constructor(e=ge.document,t,s){super({});this.currentMeta={};this.document=e,this.titleBuilder=t||(n=>n||""),this.metaBuilder=s||(n=>n||{})}hookAfter(e,t){return this.setTitle(this.titleBuilder(t.title,t)),this.setMeta(this.metaBuilder(t.meta,t)),t}setTitle(e){this.document!==void 0&&(this.document.title=e)}setMeta(e){if(this.document===void 0)return;let t=this.document.head;Object.entries(e).forEach(([s,n])=>{let o=t.querySelector(`meta[name="${s}"]`);if(o!==null){o.setAttribute("content",n);return}o=t.ownerDocument.createElement("meta"),o.setAttribute("name",s),o.setAttribute("content",n),t.appendChild(o)}),Object.keys(this.currentMeta).filter(s=>!(s in e)).forEach(s=>{let n=t.querySelector(`meta[name="${s}"]`);n!==null&&n.remove()})}};0&&(module.exports={App,BrowserHistory,DocumentMetaMiddleware,History,Middleware,Page,Path,Request,Response,Route,Router,Transition,cancelAnimationFrame,fetch,getApp,getRouter,isBrowser,isNode,loadScript,loadStyleSheet,requestAnimationFrame,unloadStyleSheet});
//# sourceMappingURL=synapse.cjs.map
