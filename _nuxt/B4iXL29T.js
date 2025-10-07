import{s as b}from"./Dlgc9DXr.js";import{s as f}from"./ByRvq9lQ.js";import y from"./Bq2pbc1y.js";import{R as v}from"./BrZ4R6i-.js";import{s as B}from"./vmQW3Ir0.js";import{B as k,F as w,c as p,o as d,a as s,b as g,H as r,k as c,K as n,t as P,n as $,w as h,l as C,O as D,Q as A,a4 as S,T as K}from"#entry";import{f as T}from"./ZhWAdK_X.js";import"./B8EF_KF5.js";import"./78XFv97U.js";import"./BhIdB9yW.js";import"./BSONcgAy.js";import"./jc0MLXVe.js";var I=`
    .p-panel {
        display: block;
        border: 1px solid dt('panel.border.color');
        border-radius: dt('panel.border.radius');
        background: dt('panel.background');
        color: dt('panel.color');
    }

    .p-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: dt('panel.header.padding');
        background: dt('panel.header.background');
        color: dt('panel.header.color');
        border-style: solid;
        border-width: dt('panel.header.border.width');
        border-color: dt('panel.header.border.color');
        border-radius: dt('panel.header.border.radius');
    }

    .p-panel-toggleable .p-panel-header {
        padding: dt('panel.toggleable.header.padding');
    }

    .p-panel-title {
        line-height: 1;
        font-weight: dt('panel.title.font.weight');
    }

    .p-panel-content {
        padding: dt('panel.content.padding');
    }

    .p-panel-footer {
        padding: dt('panel.footer.padding');
    }
`,L={root:function(t){var u=t.props;return["p-panel p-component",{"p-panel-toggleable":u.toggleable}]},header:"p-panel-header",title:"p-panel-title",headerActions:"p-panel-header-actions",pcToggleButton:"p-panel-toggle-button",contentContainer:"p-panel-content-container",content:"p-panel-content",footer:"p-panel-footer"},E=k.extend({name:"panel",style:I,classes:L}),N={name:"BasePanel",extends:B,props:{header:String,toggleable:Boolean,collapsed:Boolean,toggleButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}}},style:E,provide:function(){return{$pcPanel:this,$parentInstance:this}}},V={name:"Panel",extends:N,inheritAttrs:!1,emits:["update:collapsed","toggle"],data:function(){return{d_collapsed:this.collapsed}},watch:{collapsed:function(t){this.d_collapsed=t}},methods:{toggle:function(t){this.d_collapsed=!this.d_collapsed,this.$emit("update:collapsed",this.d_collapsed),this.$emit("toggle",{originalEvent:t,value:this.d_collapsed})},onKeyDown:function(t){(t.code==="Enter"||t.code==="NumpadEnter"||t.code==="Space")&&(this.toggle(t),t.preventDefault())}},computed:{buttonAriaLabel:function(){return this.toggleButtonProps&&this.toggleButtonProps.ariaLabel?this.toggleButtonProps.ariaLabel:this.header},dataP:function(){return T({toggleable:this.toggleable})}},components:{PlusIcon:f,MinusIcon:b,Button:y},directives:{ripple:v}},j=["data-p"],M=["data-p"],O=["id"],R=["id","aria-labelledby"];function z(e,t,u,F,l,o){var m=w("Button");return d(),p("div",n({class:e.cx("root"),"data-p":o.dataP},e.ptmi("root")),[s("div",n({class:e.cx("header"),"data-p":o.dataP},e.ptm("header")),[r(e.$slots,"header",{id:e.$id+"_header",class:$(e.cx("title")),collapsed:l.d_collapsed},function(){return[e.header?(d(),p("span",n({key:0,id:e.$id+"_header",class:e.cx("title")},e.ptm("title")),P(e.header),17,O)):c("",!0)]}),s("div",n({class:e.cx("headerActions")},e.ptm("headerActions")),[r(e.$slots,"icons"),e.toggleable?r(e.$slots,"togglebutton",{key:0,collapsed:l.d_collapsed,toggleCallback:function(i){return o.toggle(i)},keydownCallback:function(i){return o.onKeyDown(i)}},function(){return[g(m,n({id:e.$id+"_header",class:e.cx("pcToggleButton"),"aria-label":o.buttonAriaLabel,"aria-controls":e.$id+"_content","aria-expanded":!l.d_collapsed,unstyled:e.unstyled,onClick:t[0]||(t[0]=function(a){return o.toggle(a)}),onKeydown:t[1]||(t[1]=function(a){return o.onKeyDown(a)})},e.toggleButtonProps,{pt:e.ptm("pcToggleButton")}),{icon:h(function(a){return[r(e.$slots,e.$slots.toggleicon?"toggleicon":"togglericon",{collapsed:l.d_collapsed},function(){return[(d(),C(D(l.d_collapsed?"PlusIcon":"MinusIcon"),n({class:a.class},e.ptm("pcToggleButton").icon),null,16,["class"]))]})]}),_:3},16,["id","class","aria-label","aria-controls","aria-expanded","unstyled","pt"])]}):c("",!0)],16)],16,M),g(K,n({name:"p-toggleable-content"},e.ptm("transition")),{default:h(function(){return[A(s("div",n({id:e.$id+"_content",class:e.cx("contentContainer"),role:"region","aria-labelledby":e.$id+"_header"},e.ptm("contentContainer")),[s("div",n({class:e.cx("content")},e.ptm("content")),[r(e.$slots,"default")],16),e.$slots.footer?(d(),p("div",n({key:0,class:e.cx("footer")},e.ptm("footer")),[r(e.$slots,"footer")],16)):c("",!0)],16,R),[[S,!l.d_collapsed]])]}),_:3},16)],16,j)}V.render=z;export{V as default};
