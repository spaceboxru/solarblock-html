!function(e){function t(t){var n=t||window.event,i=[].slice.call(arguments,1),a=0,s=0,o=0;return t=e.event.fix(n),t.type="mousewheel",n.wheelDelta&&(a=n.wheelDelta/120),n.detail&&(a=-n.detail/3),o=a,void 0!==n.axis&&n.axis===n.HORIZONTAL_AXIS&&(o=0,s=-1*a),void 0!==n.wheelDeltaY&&(o=n.wheelDeltaY/120),void 0!==n.wheelDeltaX&&(s=-1*n.wheelDeltaX/120),i.unshift(t,a,s,o),(e.event.dispatch||e.event.handle).apply(this,i)}var n=["DOMMouseScroll","mousewheel"];if(e.event.fixHooks)for(var i=n.length;i;)e.event.fixHooks[n[--i]]=e.event.mouseHooks;e.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var e=n.length;e;)this.addEventListener(n[--e],t,!1);else this.onmousewheel=t},teardown:function(){if(this.removeEventListener)for(var e=n.length;e;)this.removeEventListener(n[--e],t,!1);else this.onmousewheel=null}},e.fn.extend({mousewheel:function(e){return e?this.bind("mousewheel",e):this.trigger("mousewheel")},unmousewheel:function(e){return this.unbind("mousewheel",e)}})}(jQuery),function(e,t,n){e.fn.jScrollPane=function(i){function a(i,a){function s(t){var a,r,c,d,p,f,v=!1,g=!1;if(X=t,F===n)p=i.scrollTop(),f=i.scrollLeft(),i.css({overflow:"hidden",padding:0}),N=i.innerWidth()+je,O=i.innerHeight(),i.width(N),F=e('<div class="jspPane" />').css("padding",be).append(i.children()),E=e('<div class="jspContainer" />').css({width:N+"px",height:O+"px"}).append(F).appendTo(i);else{if(i.css("width",""),v=X.stickToBottom&&B(),g=X.stickToRight&&I(),d=i.innerWidth()+je!=N||i.outerHeight()!=O,d&&(N=i.innerWidth()+je,O=i.innerHeight(),E.css({width:N+"px",height:O+"px"})),!d&&Ce==V&&F.outerHeight()==G)return void i.width(N);Ce=V,F.css("width",""),i.width(N),E.find(">.jspVerticalBar,>.jspHorizontalBar").remove().end()}F.css("overflow","auto"),V=t.contentWidth?t.contentWidth:F[0].scrollWidth,G=F[0].scrollHeight,F.css("overflow",""),Q=V/N,_=G/O,K=_>1,Z=Q>1,Z||K?(i.addClass("jspScrollable"),a=X.maintainPosition&&(ee||ie),a&&(r=T(),c=D()),o(),l(),u(),a&&(y(g?V-N:r,!1),x(v?G-O:c,!1)),P(),H(),R(),X.enableKeyboardNavigation&&M(),X.clickOnTrack&&h(),$(),X.hijackInternalLinks&&L()):(i.removeClass("jspScrollable"),F.css({top:0,width:E.width()-je}),q(),z(),W(),m()),X.autoReinitialise&&!ge?ge=setInterval(function(){s(X)},X.autoReinitialiseDelay):!X.autoReinitialise&&ge&&clearInterval(ge),p&&i.scrollTop(0)&&x(p,!1),f&&i.scrollLeft(0)&&y(f,!1),i.trigger("jsp-initialised",[Z||K])}function o(){K&&(E.append(e('<div class="jspVerticalBar" />').append(e('<div class="jspCap jspCapTop" />'),e('<div class="jspTrack" />').append(e('<div class="jspDrag" />').append(e('<div class="jspDragTop" />'),e('<div class="jspDragBottom" />'))),e('<div class="jspCap jspCapBottom" />'))),ae=E.find(">.jspVerticalBar"),se=ae.find(">.jspTrack"),U=se.find(">.jspDrag"),X.showArrows&&(ce=e('<a class="jspArrow jspArrowUp" />').bind("mousedown.jsp",p(0,-1)).bind("click.jsp",A),ue=e('<a class="jspArrow jspArrowDown" />').bind("mousedown.jsp",p(0,1)).bind("click.jsp",A),X.arrowScrollOnHover&&(ce.bind("mouseover.jsp",p(0,-1,ce)),ue.bind("mouseover.jsp",p(0,1,ue))),d(se,X.verticalArrowPositions,ce,ue)),re=O,E.find(">.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow").each(function(){re-=e(this).outerHeight()}),U.hover(function(){U.addClass("jspHover")},function(){U.removeClass("jspHover")}).bind("mousedown.jsp",function(t){e("html").bind("dragstart.jsp selectstart.jsp",A),U.addClass("jspActive");var n=t.pageY-U.position().top;return e("html").bind("mousemove.jsp",function(e){g(e.pageY-n,!1)}).bind("mouseup.jsp mouseleave.jsp",v),!1}),r())}function r(){se.height(re+"px"),ee=0,oe=X.verticalGutter+se.outerWidth(),F.width(N-oe-je);try{0===ae.position().left&&F.css("margin-left",oe+"px")}catch(e){}}function l(){Z&&(E.append(e('<div class="jspHorizontalBar" />').append(e('<div class="jspCap jspCapLeft" />'),e('<div class="jspTrack" />').append(e('<div class="jspDrag" />').append(e('<div class="jspDragLeft" />'),e('<div class="jspDragRight" />'))),e('<div class="jspCap jspCapRight" />'))),de=E.find(">.jspHorizontalBar"),pe=de.find(">.jspTrack"),te=pe.find(">.jspDrag"),X.showArrows&&(me=e('<a class="jspArrow jspArrowLeft" />').bind("mousedown.jsp",p(-1,0)).bind("click.jsp",A),ve=e('<a class="jspArrow jspArrowRight" />').bind("mousedown.jsp",p(1,0)).bind("click.jsp",A),X.arrowScrollOnHover&&(me.bind("mouseover.jsp",p(-1,0,me)),ve.bind("mouseover.jsp",p(1,0,ve))),d(pe,X.horizontalArrowPositions,me,ve)),te.hover(function(){te.addClass("jspHover")},function(){te.removeClass("jspHover")}).bind("mousedown.jsp",function(t){e("html").bind("dragstart.jsp selectstart.jsp",A),te.addClass("jspActive");var n=t.pageX-te.position().left;return e("html").bind("mousemove.jsp",function(e){j(e.pageX-n,!1)}).bind("mouseup.jsp mouseleave.jsp",v),!1}),fe=E.innerWidth(),c())}function c(){E.find(">.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow").each(function(){fe-=e(this).outerWidth()}),pe.width(fe+"px"),ie=0}function u(){if(Z&&K){var t=pe.outerHeight(),n=se.outerWidth();re-=t,e(de).find(">.jspCap:visible,>.jspArrow").each(function(){fe+=e(this).outerWidth()}),fe-=n,O-=n,N-=t,pe.parent().append(e('<div class="jspCorner" />').css("width",t+"px")),r(),c()}Z&&F.width(E.outerWidth()-je+"px"),G=F.outerHeight(),_=G/O,Z&&(he=Math.ceil(1/Q*fe),he>X.horizontalDragMaxWidth?he=X.horizontalDragMaxWidth:he<X.horizontalDragMinWidth&&(he=X.horizontalDragMinWidth),te.width(he+"px"),ne=fe-he,C(ie)),K&&(le=Math.ceil(1/_*re),le>X.verticalDragMaxHeight?le=X.verticalDragMaxHeight:le<X.verticalDragMinHeight&&(le=X.verticalDragMinHeight),U.height(le+"px"),J=re-le,b(ee))}function d(e,t,n,i){var a,s="before",o="after";"os"==t&&(t=/Mac/.test(navigator.platform)?"after":"split"),t==s?o=t:t==o&&(s=t,a=n,n=i,i=a),e[s](n)[o](i)}function p(e,t,n){return function(){return f(e,t,this,n),this.blur(),!1}}function f(t,n,i,a){i=e(i).addClass("jspActive");var s,o,r=!0,l=function(){0!==t&&we.scrollByX(t*X.arrowButtonSpeed),0!==n&&we.scrollByY(n*X.arrowButtonSpeed),o=setTimeout(l,r?X.initialDelay:X.arrowRepeatFreq),r=!1};l(),s=a?"mouseout.jsp":"mouseup.jsp",a=a||e("html"),a.bind(s,function(){i.removeClass("jspActive"),o&&clearTimeout(o),o=null,a.unbind(s)})}function h(){m(),K&&se.bind("mousedown.jsp",function(t){if(t.originalTarget===n||t.originalTarget==t.currentTarget){var i,a=e(this),s=a.offset(),o=t.pageY-s.top-ee,r=!0,l=function(){var e=a.offset(),n=t.pageY-e.top-le/2,s=O*X.scrollPagePercent,u=J*s/(G-O);if(0>o)ee-u>n?we.scrollByY(-s):g(n);else{if(!(o>0))return void c();n>ee+u?we.scrollByY(s):g(n)}i=setTimeout(l,r?X.initialDelay:X.trackClickRepeatFreq),r=!1},c=function(){i&&clearTimeout(i),i=null,e(document).unbind("mouseup.jsp",c)};return l(),e(document).bind("mouseup.jsp",c),!1}}),Z&&pe.bind("mousedown.jsp",function(t){if(t.originalTarget===n||t.originalTarget==t.currentTarget){var i,a=e(this),s=a.offset(),o=t.pageX-s.left-ie,r=!0,l=function(){var e=a.offset(),n=t.pageX-e.left-he/2,s=N*X.scrollPagePercent,u=ne*s/(V-N);if(0>o)ie-u>n?we.scrollByX(-s):j(n);else{if(!(o>0))return void c();n>ie+u?we.scrollByX(s):j(n)}i=setTimeout(l,r?X.initialDelay:X.trackClickRepeatFreq),r=!1},c=function(){i&&clearTimeout(i),i=null,e(document).unbind("mouseup.jsp",c)};return l(),e(document).bind("mouseup.jsp",c),!1}})}function m(){pe&&pe.unbind("mousedown.jsp"),se&&se.unbind("mousedown.jsp")}function v(){e("html").unbind("dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp"),U&&U.removeClass("jspActive"),te&&te.removeClass("jspActive")}function g(e,t){K&&(0>e?e=0:e>J&&(e=J),t===n&&(t=X.animateScroll),t?we.animate(U,"top",e,b):(U.css("top",e),b(e)))}function b(e){e===n&&(e=U.position().top),E.scrollTop(0),ee=e;var t=0===ee,a=ee==J,s=e/J,o=-s*(G-O);ke==t&&ye==a||(ke=t,ye=a,i.trigger("jsp-arrow-change",[ke,ye,xe,Se])),w(t,a),F.css("top",o),i.trigger("jsp-scroll-y",[-o,t,a]).trigger("scroll")}function j(e,t){Z&&(0>e?e=0:e>ne&&(e=ne),t===n&&(t=X.animateScroll),t?we.animate(te,"left",e,C):(te.css("left",e),C(e)))}function C(e){e===n&&(e=te.position().left),E.scrollTop(0),ie=e;var t=0===ie,a=ie==ne,s=e/ne,o=-s*(V-N);xe==t&&Se==a||(xe=t,Se=a,i.trigger("jsp-arrow-change",[ke,ye,xe,Se])),k(t,a),F.css("left",o),i.trigger("jsp-scroll-x",[-o,t,a]).trigger("scroll")}function w(e,t){X.showArrows&&(ce[e?"addClass":"removeClass"]("jspDisabled"),ue[t?"addClass":"removeClass"]("jspDisabled"))}function k(e,t){X.showArrows&&(me[e?"addClass":"removeClass"]("jspDisabled"),ve[t?"addClass":"removeClass"]("jspDisabled"))}function x(e,t){var n=e/(G-O);g(n*J,t)}function y(e,t){var n=e/(V-N);j(n*ne,t)}function S(t,n,i){var a,s,o,r,l,c,u,d,p,f=0,h=0;try{a=e(t)}catch(m){return}for(s=a.outerHeight(),o=a.outerWidth(),E.scrollTop(0),E.scrollLeft(0);!a.is(".jspPane");)if(f+=a.position().top,h+=a.position().left,a=a.offsetParent(),/^body|html$/i.test(a[0].nodeName))return;r=D(),c=r+O,r>f||n?d=f-X.verticalGutter:f+s>c&&(d=f-O+s+X.verticalGutter),d&&x(d,i),l=T(),u=l+N,l>h||n?p=h-X.horizontalGutter:h+o>u&&(p=h-N+o+X.horizontalGutter),p&&y(p,i)}function T(){return-F.position().left}function D(){return-F.position().top}function B(){var e=G-O;return e>20&&e-D()<10}function I(){var e=V-N;return e>20&&e-T()<10}function H(){E.unbind(De).bind(De,function(e,t,n,i){var a=ie,s=ee;return we.scrollBy(n*X.mouseWheelSpeed,-i*X.mouseWheelSpeed,!1),a==ie&&s==ee})}function q(){E.unbind(De)}function A(){return!1}function P(){F.find(":input,a").unbind("focus.jsp").bind("focus.jsp",function(e){S(e.target,!1)})}function z(){F.find(":input,a").unbind("focus.jsp")}function M(){function t(){var e=ie,t=ee;switch(n){case 40:we.scrollByY(X.keyboardSpeed,!1);break;case 38:we.scrollByY(-X.keyboardSpeed,!1);break;case 34:case 32:we.scrollByY(O*X.scrollPagePercent,!1);break;case 33:we.scrollByY(-O*X.scrollPagePercent,!1);break;case 39:we.scrollByX(X.keyboardSpeed,!1);break;case 37:we.scrollByX(-X.keyboardSpeed,!1)}return a=e!=ie||t!=ee}var n,a,s=[];Z&&s.push(de[0]),K&&s.push(ae[0]),F.focus(function(){i.focus()}),i.attr("tabindex",0).unbind("keydown.jsp keypress.jsp").bind("keydown.jsp",function(i){if(i.target===this||s.length&&e(i.target).closest(s).length){var o=ie,r=ee;switch(i.keyCode){case 40:case 38:case 34:case 32:case 33:case 39:case 37:n=i.keyCode,t();break;case 35:x(G-O),n=null;break;case 36:x(0),n=null}return a=i.keyCode==n&&o!=ie||r!=ee,!a}}).bind("keypress.jsp",function(e){return e.keyCode==n&&t(),!a}),X.hideFocus?(i.css("outline","none"),"hideFocus"in E[0]&&i.attr("hideFocus",!0)):(i.css("outline",""),"hideFocus"in E[0]&&i.attr("hideFocus",!1))}function W(){i.attr("tabindex","-1").removeAttr("tabindex").unbind("keydown.jsp keypress.jsp")}function $(){if(location.hash&&location.hash.length>1){var t,n,i=escape(location.hash.substr(1));try{t=e("#"+i+', a[name="'+i+'"]')}catch(a){return}t.length&&F.find(i)&&(0===E.scrollTop()?n=setInterval(function(){E.scrollTop()>0&&(S(t,!0),e(document).scrollTop(E.position().top),clearInterval(n))},50):(S(t,!0),e(document).scrollTop(E.position().top)))}}function L(){e(document.body).data("jspHijack")||(e(document.body).data("jspHijack",!0),e(document.body).delegate("a[href*=#]","click",function(n){var i,a,s,o,r,l,c=this.href.substr(0,this.href.indexOf("#")),u=location.href;if(-1!==location.href.indexOf("#")&&(u=location.href.substr(0,location.href.indexOf("#"))),c===u){i=escape(this.href.substr(this.href.indexOf("#")+1));try{a=e("#"+i+', a[name="'+i+'"]')}catch(d){return}a.length&&(s=a.closest(".jspScrollable"),o=s.data("jsp"),o.scrollToElement(a,!0),s[0].scrollIntoView&&(r=e(t).scrollTop(),l=a.offset().top,(r>l||l>r+e(t).height())&&s[0].scrollIntoView()),n.preventDefault())}}))}function R(){var e,t,n,i,a,s=!1;E.unbind("touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick").bind("touchstart.jsp",function(o){var r=o.originalEvent.touches[0];e=T(),t=D(),n=r.pageX,i=r.pageY,a=!1,s=!0}).bind("touchmove.jsp",function(o){if(s){var r=o.originalEvent.touches[0],l=ie,c=ee;return we.scrollTo(e+n-r.pageX,t+i-r.pageY),a=a||Math.abs(n-r.pageX)>5||Math.abs(i-r.pageY)>5,l==ie&&c==ee}}).bind("touchend.jsp",function(e){s=!1}).bind("click.jsp-touchclick",function(e){return a?(a=!1,!1):void 0})}function Y(){var e=D(),t=T();i.removeClass("jspScrollable").unbind(".jsp"),i.replaceWith(Te.append(F.children())),Te.scrollTop(e),Te.scrollLeft(t),ge&&clearInterval(ge)}var X,F,N,O,E,V,G,Q,_,K,Z,U,J,ee,te,ne,ie,ae,se,oe,re,le,ce,ue,de,pe,fe,he,me,ve,ge,be,je,Ce,we=this,ke=!0,xe=!0,ye=!1,Se=!1,Te=i.clone(!1,!1).empty(),De=e.fn.mwheelIntent?"mwheelIntent.jsp":"mousewheel.jsp";be=i.css("paddingTop")+" "+i.css("paddingRight")+" "+i.css("paddingBottom")+" "+i.css("paddingLeft"),je=(parseInt(i.css("paddingLeft"),10)||0)+(parseInt(i.css("paddingRight"),10)||0),e.extend(we,{reinitialise:function(t){t=e.extend({},X,t),s(t)},scrollToElement:function(e,t,n){S(e,t,n)},scrollTo:function(e,t,n){y(e,n),x(t,n)},scrollToX:function(e,t){y(e,t)},scrollToY:function(e,t){x(e,t)},scrollToPercentX:function(e,t){y(e*(V-N),t)},scrollToPercentY:function(e,t){x(e*(G-O),t)},scrollBy:function(e,t,n){we.scrollByX(e,n),we.scrollByY(t,n)},scrollByX:function(e,t){var n=T()+Math[0>e?"floor":"ceil"](e),i=n/(V-N);j(i*ne,t)},scrollByY:function(e,t){var n=D()+Math[0>e?"floor":"ceil"](e),i=n/(G-O);g(i*J,t)},positionDragX:function(e,t){j(e,t)},positionDragY:function(e,t){g(e,t)},animate:function(e,t,n,i){var a={};a[t]=n,e.animate(a,{duration:X.animateDuration,easing:X.animateEase,queue:!1,step:i})},getContentPositionX:function(){return T()},getContentPositionY:function(){return D()},getContentWidth:function(){return V},getContentHeight:function(){return G},getPercentScrolledX:function(){return T()/(V-N)},getPercentScrolledY:function(){return D()/(G-O)},getIsScrollableH:function(){return Z},getIsScrollableV:function(){return K},getContentPane:function(){return F},scrollToBottom:function(e){g(J,e)},hijackInternalLinks:e.noop,destroy:function(){Y()}}),s(a)}return i=e.extend({},e.fn.jScrollPane.defaults,i),e.each(["mouseWheelSpeed","arrowButtonSpeed","trackClickSpeed","keyboardSpeed"],function(){i[this]=i[this]||i.speed}),this.each(function(){var t=e(this),n=t.data("jsp");n?n.reinitialise(i):(e("script",t).filter('[type="text/javascript"],:not([type])').remove(),n=new a(t,i),t.data("jsp",n))})},e.fn.jScrollPane.defaults={showArrows:!1,maintainPosition:!0,stickToBottom:!1,stickToRight:!1,clickOnTrack:!0,autoReinitialise:!1,autoReinitialiseDelay:500,verticalDragMinHeight:0,verticalDragMaxHeight:99999,horizontalDragMinWidth:0,horizontalDragMaxWidth:99999,contentWidth:n,animateScroll:!1,animateDuration:300,animateEase:"linear",hijackInternalLinks:!1,verticalGutter:4,horizontalGutter:4,mouseWheelSpeed:0,arrowButtonSpeed:0,arrowRepeatFreq:50,arrowScrollOnHover:!1,trackClickSpeed:0,trackClickRepeatFreq:70,verticalArrowPositions:"split",horizontalArrowPositions:"split",enableKeyboardNavigation:!0,hideFocus:!1,keyboardSpeed:0,initialDelay:300,speed:30,scrollPagePercent:.8}}(jQuery,this),function(e){window.SelectBoxManager=function(t){var n=[],i=this;e(document).click(function(t){0===e(t.target).parents(".customSelect").size()&&i.close()}),this.add=function(e){n.push(e)},this.close=function(){e(n).each(function(){this.close()})}};var t=new SelectBoxManager;window.SelectBox=function(n){function i(){x=!!navigator.userAgent.match(/iPad|iPhone|Android|IEMobile|BlackBerry/i),x&&g.selectbox.addClass("use-default");var e="",n=g.selectbox.attr("class");"undefined"!=typeof g.selectbox.attr("id")&&(e='id="select-'+g.selectbox.attr("id")+'"'),g.selectbox.wrap('<div class="customSelect '+n+'" '+e+" />"),u=g.selectbox.parents(".customSelect"),m=g.selectbox.find("option");var i=['<div class="selectList"><div class="selectListOuterWrap"><div class="selectListInnerWrap"><div class="selectListTop"></div><dl>'];i.push(r()),i.push('</dl><div class="selectListBottom"></div></div></div></div>'),u.append('<div class="selectValueWrap"><div class="selectedValue">'+D+'</div> <span class="caret"></span> </div>'+i.join("")),h=u.find("dl"),d=u.find(".selectedValue"),p=u.find(".selectValueWrap"),f=u.find(".selectList"),u.width(g.width),h.width(g.width-2),a(),t.add(v)}function a(){p.click(function(){y?(g.selectbox.focus(),v.close()):S&&(x?g.selectbox.focus():v.open())}),h.click(function(t){var n=e(t.target);(n.is("dd")||n.parents("dd"))&&("dd"!=t.target.tagName.toLowerCase()&&(n=n.parents("dd")),!n.hasClass(w)&&n.get(0)&&(v.jumpToIndex(n.get(0).className.split(" ")[0].split("-")[1]),v.close(),x||g.selectbox.focus()))}),g.selectbox.focus(function(e){T=!0,u.addClass(b)}).blur(function(e){T=!1,u.removeClass(b)}),x&&g.selectbox.change(function(t){o(e(this).find("option:selected").html())}),g.selectbox.keyup(function(e){v.close(),m.each(function(e,t){return t.selected?(v.jumpToIndex(e),!1):void 0})}),s()}function s(){var t=e(".customSelect dd");t.off("mouseover"),t.off("mouseout"),t.on("mouseover",function(t){var n=e(t.target);"dd"!=t.target.tagName.toLowerCase()&&(n=n.parents("dd")),n.addClass(k)}),t.on("mouseout",function(t){var n=e(t.target);"dd"!=t.target.tagName.toLowerCase()&&(n=n.parents("dd")),n.removeClass(k)})}function o(e){d.html()!=e&&(d.html(c(e)),g.changeCallback(g.selectbox.val()),x||g.selectbox.trigger("change"))}function r(){var t=[];return m.each(function(n,i){var a=e(this),s=a.parents("optgroup"),o="",r="";s.length>0&&0===a.prev().length&&t.push("<dt>"+s.attr("label")+"</dt>"),""!==i.className&&e(i.className.split(" ")).each(function(){r+='<span class="'+this+'"></span>'}),i.selected&&!i.disabled&&(D=r+c(e(i).html()),o=" "+j),i.disabled&&(o+=" "+w),t.push('<dd class="itm-'+n+" "+o+'">'+r+i.innerHTML+"</dd>")}),d&&null!==d.get(0)&&d.html(D),t.join("")}function l(){h.css("height","auto"),g.height&&h.height()>g.height?(h.css("height",g.height),g.customScrollbar?v.scrollpane=h.jScrollPane(e.extend({contentWidth:200},g.scrollOptions)):h.addClass("defaultScrollbar")):h.css({overflow:"hidden"})}function c(e){var t=e.split("</span>"),n=t[t.length-1];t[t.length-1]="";var i=t.join("</SPAN>");return i+g.truncate(n)}var u,d,p,f,h,m,v=this,g=e.extend(!0,{manager:t,customScrollbar:!0,zIndex:100,changeCallback:function(e){},truncate:function(e){return e},scrollOptions:{}},n),b="focused",j="selected",C="select-open",w="disabled",k="hovered",x=!1,y=!1,S=!0,T=!1,D="";this.sync=function(){m=g.selectbox.find("option"),h.html(r()),s(),l()},this.disable=function(){S=!1,u.addClass(w),g.selectbox.attr("disabled","disabled")},this.enable=function(){S=!0,u.removeClass(w),g.selectbox.removeAttr("disabled")},this.close=function(){u.removeClass(C),u.css({"z-index":g.zIndex}),y=!1},this.open=function(){l(),g.manager&&g.manager.close(),u.addClass(C),v.scrollpane&&v.scrollpane.data("jsp").scrollToY(u.find(".selected").position().top),u.css({"z-index":g.zIndex+1}),y=!0},this.jumpToIndex=function(e){g.selectbox.get(0).selectedIndex=e,u.find(".selected").removeClass(j),u.find(".itm-"+e).addClass(j),o(u.find(".itm-"+e).html())},this.jumpToValue=function(e){var t=-1;return m.each(function(n){return this.innerHTML==e?(t=n,!1):void 0}),-1!=t&&v.jumpToIndex(t),t},i()}}(jQuery),!function(e){"function"==typeof define&&define.amd?define(["jquery"],e):e("object"==typeof exports?require("jquery"):jQuery)}(function(e){var t,n=navigator.userAgent,i=/iphone/i.test(n),a=/chrome/i.test(n),s=/android/i.test(n);e.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},autoclear:!0,dataName:"rawMaskFn",placeholder:"_"},e.fn.extend({caret:function(e,t){var n;return 0===this.length||this.is(":hidden")?void 0:"number"==typeof e?(t="number"==typeof t?t:e,this.each(function(){this.setSelectionRange?this.setSelectionRange(e,t):this.createTextRange&&(n=this.createTextRange(),n.collapse(!0),n.moveEnd("character",t),n.moveStart("character",e),n.select())})):(this[0].setSelectionRange?(e=this[0].selectionStart,t=this[0].selectionEnd):document.selection&&document.selection.createRange&&(n=document.selection.createRange(),e=0-n.duplicate().moveStart("character",-1e5),t=e+n.text.length),{begin:e,end:t})},unmask:function(){return this.trigger("unmask")},mask:function(n,o){var r,l,c,u,d,p,f,h;if(!n&&this.length>0){r=e(this[0]);var m=r.data(e.mask.dataName);return m?m():void 0}return o=e.extend({autoclear:e.mask.autoclear,placeholder:e.mask.placeholder,completed:null},o),l=e.mask.definitions,c=[],u=f=n.length,d=null,e.each(n.split(""),function(e,t){"?"==t?(f--,u=e):l[t]?(c.push(new RegExp(l[t])),null===d&&(d=c.length-1),u>e&&(p=c.length-1)):c.push(null)}),this.trigger("unmask").each(function(){function r(){if(o.completed){for(var e=d;p>=e;e++)if(c[e]&&B[e]===m(e))return;o.completed.call(D)}}function m(e){return o.placeholder.charAt(e<o.placeholder.length?e:0)}function v(e){for(;++e<f&&!c[e];);return e}function g(e){for(;--e>=0&&!c[e];);return e}function b(e,t){var n,i;if(!(0>e)){for(n=e,i=v(t);f>n;n++)if(c[n]){if(!(f>i&&c[n].test(B[i])))break;B[n]=B[i],B[i]=m(i),i=v(i)}S(),D.caret(Math.max(d,e))}}function j(e){var t,n,i,a;for(t=e,n=m(e);f>t;t++)if(c[t]){if(i=v(t),a=B[t],B[t]=n,!(f>i&&c[i].test(a)))break;n=a}}function C(){var e=D.val(),t=D.caret();if(h&&h.length&&h.length>e.length){for(T(!0);t.begin>0&&!c[t.begin-1];)t.begin--;if(0===t.begin)for(;t.begin<d&&!c[t.begin];)t.begin++;D.caret(t.begin,t.begin)}else{for(T(!0);t.begin<f&&!c[t.begin];)t.begin++;D.caret(t.begin,t.begin)}r()}function w(){T(),D.val()!=H&&D.change()}function k(e){if(!D.prop("readonly")){var t,n,a,s=e.which||e.keyCode;h=D.val(),8===s||46===s||i&&127===s?(t=D.caret(),n=t.begin,a=t.end,a-n===0&&(n=46!==s?g(n):a=v(n-1),a=46===s?v(a):a),y(n,a),b(n,a-1),e.preventDefault()):13===s?w.call(this,e):27===s&&(D.val(H),D.caret(0,T()),e.preventDefault())}}function x(t){if(!D.prop("readonly")){var n,i,a,o=t.which||t.keyCode,l=D.caret();if(!(t.ctrlKey||t.altKey||t.metaKey||32>o)&&o&&13!==o){if(l.end-l.begin!==0&&(y(l.begin,l.end),b(l.begin,l.end-1)),n=v(l.begin-1),f>n&&(i=String.fromCharCode(o),c[n].test(i))){if(j(n),B[n]=i,S(),a=v(n),s){var u=function(){e.proxy(e.fn.caret,D,a)()};setTimeout(u,0)}else D.caret(a);l.begin<=p&&r()}t.preventDefault()}}}function y(e,t){var n;for(n=e;t>n&&f>n;n++)c[n]&&(B[n]=m(n))}function S(){D.val(B.join(""))}function T(e){var t,n,i,a=D.val(),s=-1;for(t=0,i=0;f>t;t++)if(c[t]){for(B[t]=m(t);i++<a.length;)if(n=a.charAt(i-1),c[t].test(n)){B[t]=n,s=t;break}if(i>a.length){y(t+1,f);break}}else B[t]===a.charAt(i)&&i++,u>t&&(s=t);return e?S():u>s+1?o.autoclear||B.join("")===I?(D.val()&&D.val(""),y(0,f)):S():(S(),D.val(D.val().substring(0,s+1))),u?t:d}var D=e(this),B=e.map(n.split(""),function(e,t){return"?"!=e?l[e]?m(t):e:void 0}),I=B.join(""),H=D.val();D.data(e.mask.dataName,function(){return e.map(B,function(e,t){return c[t]&&e!=m(t)?e:null}).join("")}),D.one("unmask",function(){D.off(".mask").removeData(e.mask.dataName)}).on("focus.mask",function(){if(!D.prop("readonly")){clearTimeout(t);var e;H=D.val(),e=T(),t=setTimeout(function(){D.get(0)===document.activeElement&&(S(),e==n.replace("?","").length?D.caret(0,e):D.caret(e))},10)}}).on("blur.mask",w).on("keydown.mask",k).on("keypress.mask",x).on("input.mask paste.mask",function(){D.prop("readonly")||setTimeout(function(){var e=T(!0);D.caret(e),r()},0)}),a&&s&&D.off("input.mask").on("input.mask",C),T()})}})}),jQuery.fn.fsizeGallery=function(e){var t={delay:"quite long",showFullScreenBtn:!1,baseSliderClass:"fscreen",activeClass:"active",sliderClass:"-slider-inner",titleClass:"-slider-title",thumbsClass:"-thumbs",fullSizeClass:"fullscreen",animationDuration:500,fullSize:'<a href=""></a>',counterSlider:"<span></span>",prevBtnTpl:"<a></a>",nextBtnTpl:"<a></a>",onNextImage:function(){},onPrevImage:function(){}},n=$.extend({},t,e);return n.sliderClass=n.baseSliderClass+n.sliderClass,n.thumbsClass=n.baseSliderClass+n.thumbsClass,n.titleClass=n.baseSliderClass+n.titleClass,this.each(function(e){function t(e){e?d.eq(k).css({left:0}).animate({left:"100%"},n.animationDuration).end().eq(x).css({left:"-100%"}).animate({left:0},n.animationDuration):d.eq(k).css({left:0}).animate({left:"-100%"},n.animationDuration).end().eq(x).css({left:"100%"}).animate({left:0},n.animationDuration),p.eq(k).css({position:"absolute"}).animate({opacity:0},n.animationDuration,function(){$(this).removeClass(n.activeClass)}).end().eq(x).css({position:"relative"}).animate({opacity:1},n.animationDuration,function(){$(this).addClass(n.activeClass)}),p.eq(x).parent().delay(n.animationDuration/2).animate({height:p.eq(x).outerHeight(!0)},n.animationDuration),T.html(x+1+"<i></i>"+h)}function i(e){if(m.removeClass(n.activeClass),e.addClass(n.activeClass),x>k?t(x==h-1&&0==k?0:1):x!=k&&t(0==x&&k==h-1?1:0),h-j>0){var i=c.width()<1024?Math.floor(b/Math.abs(g.offset().left-m.eq(x).offset().left)):Math.floor(b/Math.abs(g.offset().top-m.eq(x).offset().top)),a=Math.abs(parseInt(g.find("ul").css("margin-top")));a=a>0?a:x,C=2>i?h-j>=a/v+1?C-v:C:C+v,C=x!=k&&x==h-1?-1*(h-j)*v:C,C=C>0||0==x?0:C,g.find("ul").delay(n.animationDuration/6).animate({"margin-top":C},n.animationDuration)}}function a(){var e=o();i(m.eq(x)),n.onPrevImage.call(e)}function s(){var e=r();i(m.eq(x)),n.onNextImage.call(e)}function o(){return k=x,x-1>=0?x-=1:x=h-1,x}function r(){return k=x,h>x+1?x+=1:x=0,x}var l=$(this),c=$(window),u=$("."+n.sliderClass,l),d=$("."+n.sliderClass+" li",l),p=$("."+n.titleClass+" li",l),f=0,h=d.size(),m=$("."+n.thumbsClass+" li",l),v=m.eq(0).outerHeight(!0),g=$("."+n.thumbsClass,l),b=g.height(),j=Math.floor(b/m.eq(0).outerHeight(!0)),C=0,w=m.size(),k=h-1,x=0,y=$(n.prevBtnTpl).addClass(n.baseSliderClass+"-prev-btn"),S=$(n.nextBtnTpl).addClass(n.baseSliderClass+"-next-btn"),T=$(n.counterSlider).addClass(n.baseSliderClass+"-counter"),D=$(n.fullSize).addClass(n.baseSliderClass+"-"+n.fullSizeClass);return h!=w||0>=h&&h==w?(console.log("Count slides not equal count thumbs: "+h+" != "+w),!0):(u.append(y,S,T),n.showFullScreenBtn&&u.append(D),l.on("click",function(e){e.preventDefault();var t=$(e.target);if(t.is(y))a();else if(t.is(S))s();else if(t.is(D))l.hasClass(n.fullSizeClass)?l.removeClass(n.fullSizeClass):l.addClass(n.fullSizeClass);else if(t.is(m)){var o=m.index(t);k=x,x=o,i(t)}}),void d.each(function(e){var t=$(this),i=t.find("a"),a=i.attr("href"),s=m.eq(e).find("a"),o=s.attr("href");f=t.width(),e>0?(t.css({left:"100%"}),p.eq(e).css({opacity:0})):(m.eq(e).addClass(n.activeClass),p.eq(e).addClass(n.activeClass).parent().css({height:p.eq(e).outerHeight(!0)})),i.css({"background-image":"url("+a+")"}).on("click",function(e){e.preventDefault()}),s.css({"background-image":"url("+o+")"}).on("click",function(e){e.preventDefault()}),T.html(x+1+"<i></i>"+h)}))})},$(document).foundation(),jQuery(function(e){e(".qtip-tip").each(function(){var t=e(this);e(this).qtip({content:{text:e(this).next(".qtip-titlebar"),button:"Закрыть"},hide:{event:!0,delay:200},show:{event:"click",delay:40,solo:!0},position:{my:t.data("qtip")||"bottom left",at:t.data("qtip")||"bottom left"}})}),e("select.custom").each(function(){new SelectBox({selectbox:e(this),height:150,width:200})}),e("#phone,.form-control-phone").mask("+7(999) 999-99-99"),e(".js-mobtop-menu__btn").on("click",function(t){e(this).toggleClass("open")}),function(){var t=e(".js-catalog__viewtype"),n=e(".js-catalog-view-type"),i=["catalog--table-view","catalog--list-view","catalog--list-view-sm"],a=e("a",t),s=e(".icons",a);a.on("click",function(t){t.preventDefault();var o=e(this),r=a.index(o);s.removeClass("active").eq(r).addClass("active"),n.removeClass(function(e,t){return(t.match(/(^|\s)catalog--[table|list]\S+/g)||[]).join(" ")}).addClass(i[r])})}(),function(){var t=e('input[name^="order-list-"');t.on("change",function(t){t.preventDefault();var n=e(this),i=n.nextAll("a");n.parents("div.row:eq(0)").addClass("loader"),e(this).is(":checked")?location.href=i.eq(0).attr("href"):location.href=i.eq(1).attr("href")})}(),e(".fscreen").fsizeGallery({showFullScreenBtn:!0,onPrevImage:function(e){},onNextImage:function(e){}}),function(){e("form.js-form-validate").each(function(){e(this).validate({errorPlacement:function(e,t){return!0}})})}(),function(){var t=e("#js-catalog-item-brand");$jsCatalogItem=e(".js-catalog-item-brand"),$jsCatalogItemForm=e(".js-catalog-item-order"),$checkboxes=$jsCatalogItemForm.find("input[id^='checkbox-']"),$submitBtns=$jsCatalogItemForm.find("input[type='submit'],button[type='submit']"),$jsCatalogItem.on("change",function(n){var i=e(this),a=i.data("val"),s=t.val();i.is(":checked")?t.val(s+a):t.val(s.replace(a,""))}),console.log($checkboxes),$submitBtns.on("mousedown mouseup",function(){var t=$submitBtns.index(e(this));$checkboxes.prop("checked",!1),$jsCatalogItemForm.valid()&&$checkboxes.eq(t).prop("checked",!0)}),$jsCatalogItemForm.on("submit",function(t){t.preventDefault();var n=e(this),i=n.find(".js-ajax-replacement");n.valid()&&(n.addClass("loader"),e.ajax({type:"POST",url:n.attr("action"),data:n.serialize(),success:function(t){var a=e(t).find(".js-ajax-replacement");i.replaceWith(a),n.removeClass("loader")}}))})}()});