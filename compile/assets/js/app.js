/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);

/*!
 * jScrollPane - v2.0.0beta12 - 2012-09-27
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2010 Kelvin Luck
 * Dual licensed under the MIT or GPL licenses.
 */

// Script: jScrollPane - cross browser customisable scrollbars
//
// *Version: 2.0.0beta12, Last updated: 2012-09-27*
//
// Project Home - http://jscrollpane.kelvinluck.com/
// GitHub       - http://github.com/vitch/jScrollPane
// Source       - http://github.com/vitch/jScrollPane/raw/master/script/jquery.jscrollpane.js
// (Minified)   - http://github.com/vitch/jScrollPane/raw/master/script/jquery.jscrollpane.min.js
//
// About: License
//
// Copyright (c) 2012 Kelvin Luck
// Dual licensed under the MIT or GPL Version 2 licenses.
// http://jscrollpane.kelvinluck.com/MIT-LICENSE.txt
// http://jscrollpane.kelvinluck.com/GPL-LICENSE.txt
//
// About: Examples
//
// All examples and demos are available through the jScrollPane example site at:
// http://jscrollpane.kelvinluck.com/
//
// About: Support and Testing
//
// This plugin is tested on the browsers below and has been found to work reliably on them. If you run
// into a problem on one of the supported browsers then please visit the support section on the jScrollPane
// website (http://jscrollpane.kelvinluck.com/) for more information on getting support. You are also
// welcome to fork the project on GitHub if you can contribute a fix for a given issue. 
//
// jQuery Versions - tested in 1.4.2+ - reported to work in 1.3.x
// Browsers Tested - Firefox 3.6.8, Safari 5, Opera 10.6, Chrome 5.0, IE 6, 7, 8
//
// About: Release History
//
// 2.0.0beta12 - (2012-09-27) fix for jQuery 1.8+
// 2.0.0beta11 - (2012-05-14)
// 2.0.0beta10 - (2011-04-17) cleaner required size calculation, improved keyboard support, stickToBottom/Left, other small fixes
// 2.0.0beta9 - (2011-01-31) new API methods, bug fixes and correct keyboard support for FF/OSX
// 2.0.0beta8 - (2011-01-29) touchscreen support, improved keyboard support
// 2.0.0beta7 - (2011-01-23) scroll speed consistent (thanks Aivo Paas)
// 2.0.0beta6 - (2010-12-07) scrollToElement horizontal support
// 2.0.0beta5 - (2010-10-18) jQuery 1.4.3 support, various bug fixes
// 2.0.0beta4 - (2010-09-17) clickOnTrack support, bug fixes
// 2.0.0beta3 - (2010-08-27) Horizontal mousewheel, mwheelIntent, keyboard support, bug fixes
// 2.0.0beta2 - (2010-08-21) Bug fixes
// 2.0.0beta1 - (2010-08-17) Rewrite to follow modern best practices and enable horizontal scrolling, initially hidden
//							 elements and dynamically sized elements.
// 1.x - (2006-12-31 - 2010-07-31) Initial version, hosted at googlecode, deprecated

(function($,window,undefined){

	$.fn.jScrollPane = function(settings)
	{
		// JScrollPane "class" - public methods are available through $('selector').data('jsp')
		function JScrollPane(elem, s)
		{
			var settings, jsp = this, pane, paneWidth, paneHeight, container, contentWidth, contentHeight,
				percentInViewH, percentInViewV, isScrollableV, isScrollableH, verticalDrag, dragMaxY,
				verticalDragPosition, horizontalDrag, dragMaxX, horizontalDragPosition,
				verticalBar, verticalTrack, scrollbarWidth, verticalTrackHeight, verticalDragHeight, arrowUp, arrowDown,
				horizontalBar, horizontalTrack, horizontalTrackWidth, horizontalDragWidth, arrowLeft, arrowRight,
				reinitialiseInterval, originalPadding, originalPaddingTotalWidth, previousContentWidth,
				wasAtTop = true, wasAtLeft = true, wasAtBottom = false, wasAtRight = false,
				originalElement = elem.clone(false, false).empty(),
				mwEvent = $.fn.mwheelIntent ? 'mwheelIntent.jsp' : 'mousewheel.jsp';

			originalPadding = elem.css('paddingTop') + ' ' +
								elem.css('paddingRight') + ' ' +
								elem.css('paddingBottom') + ' ' +
								elem.css('paddingLeft');
			originalPaddingTotalWidth = (parseInt(elem.css('paddingLeft'), 10) || 0) +
										(parseInt(elem.css('paddingRight'), 10) || 0);

			function initialise(s)
			{

				var /*firstChild, lastChild, */isMaintainingPositon, lastContentX, lastContentY,
						hasContainingSpaceChanged, originalScrollTop, originalScrollLeft,
						maintainAtBottom = false, maintainAtRight = false;

				settings = s;

				if (pane === undefined) {
					originalScrollTop = elem.scrollTop();
					originalScrollLeft = elem.scrollLeft();

					elem.css(
						{
							overflow: 'hidden',
							padding: 0
						}
					);
					// TODO: Deal with where width/ height is 0 as it probably means the element is hidden and we should
					// come back to it later and check once it is unhidden...
					paneWidth = elem.innerWidth() + originalPaddingTotalWidth;
					paneHeight = elem.innerHeight();

					elem.width(paneWidth);
					
					pane = $('<div class="jspPane" />').css('padding', originalPadding).append(elem.children());
					container = $('<div class="jspContainer" />')
						.css({
							'width': paneWidth + 'px',
							'height': paneHeight + 'px'
						}
					).append(pane).appendTo(elem);

					/*
					// Move any margins from the first and last children up to the container so they can still
					// collapse with neighbouring elements as they would before jScrollPane 
					firstChild = pane.find(':first-child');
					lastChild = pane.find(':last-child');
					elem.css(
						{
							'margin-top': firstChild.css('margin-top'),
							'margin-bottom': lastChild.css('margin-bottom')
						}
					);
					firstChild.css('margin-top', 0);
					lastChild.css('margin-bottom', 0);
					*/
				} else {
					elem.css('width', '');

					maintainAtBottom = settings.stickToBottom && isCloseToBottom();
					maintainAtRight  = settings.stickToRight  && isCloseToRight();

					hasContainingSpaceChanged = elem.innerWidth() + originalPaddingTotalWidth != paneWidth || elem.outerHeight() != paneHeight;

					if (hasContainingSpaceChanged) {
						paneWidth = elem.innerWidth() + originalPaddingTotalWidth;
						paneHeight = elem.innerHeight();
						container.css({
							width: paneWidth + 'px',
							height: paneHeight + 'px'
						});
					}

					// If nothing changed since last check...
					if (!hasContainingSpaceChanged && previousContentWidth == contentWidth && pane.outerHeight() == contentHeight) {
						elem.width(paneWidth);
						return;
					}
					previousContentWidth = contentWidth;
					
					pane.css('width', '');
					elem.width(paneWidth);

					container.find('>.jspVerticalBar,>.jspHorizontalBar').remove().end();
				}

				pane.css('overflow', 'auto');
				if (s.contentWidth) {
					contentWidth = s.contentWidth;
				} else {
					contentWidth = pane[0].scrollWidth;
				}
				contentHeight = pane[0].scrollHeight;
				pane.css('overflow', '');

				percentInViewH = contentWidth / paneWidth;
				percentInViewV = contentHeight / paneHeight;
				isScrollableV = percentInViewV > 1;

				isScrollableH = percentInViewH > 1;

				//console.log(paneWidth, paneHeight, contentWidth, contentHeight, percentInViewH, percentInViewV, isScrollableH, isScrollableV);

				if (!(isScrollableH || isScrollableV)) {
					elem.removeClass('jspScrollable');
					pane.css({
						top: 0,
						width: container.width() - originalPaddingTotalWidth
					});
					removeMousewheel();
					removeFocusHandler();
					removeKeyboardNav();
					removeClickOnTrack();
				} else {
					elem.addClass('jspScrollable');

					isMaintainingPositon = settings.maintainPosition && (verticalDragPosition || horizontalDragPosition);
					if (isMaintainingPositon) {
						lastContentX = contentPositionX();
						lastContentY = contentPositionY();
					}

					initialiseVerticalScroll();
					initialiseHorizontalScroll();
					resizeScrollbars();

					if (isMaintainingPositon) {
						scrollToX(maintainAtRight  ? (contentWidth  - paneWidth ) : lastContentX, false);
						scrollToY(maintainAtBottom ? (contentHeight - paneHeight) : lastContentY, false);
					}

					initFocusHandler();
					initMousewheel();
					initTouch();
					
					if (settings.enableKeyboardNavigation) {
						initKeyboardNav();
					}
					if (settings.clickOnTrack) {
						initClickOnTrack();
					}
					
					observeHash();
					if (settings.hijackInternalLinks) {
						hijackInternalLinks();
					}
				}

				if (settings.autoReinitialise && !reinitialiseInterval) {
					reinitialiseInterval = setInterval(
						function()
						{
							initialise(settings);
						},
						settings.autoReinitialiseDelay
					);
				} else if (!settings.autoReinitialise && reinitialiseInterval) {
					clearInterval(reinitialiseInterval);
				}

				originalScrollTop && elem.scrollTop(0) && scrollToY(originalScrollTop, false);
				originalScrollLeft && elem.scrollLeft(0) && scrollToX(originalScrollLeft, false);

				elem.trigger('jsp-initialised', [isScrollableH || isScrollableV]);
			}

			function initialiseVerticalScroll()
			{
				if (isScrollableV) {

					container.append(
						$('<div class="jspVerticalBar" />').append(
							$('<div class="jspCap jspCapTop" />'),
							$('<div class="jspTrack" />').append(
								$('<div class="jspDrag" />').append(
									$('<div class="jspDragTop" />'),
									$('<div class="jspDragBottom" />')
								)
							),
							$('<div class="jspCap jspCapBottom" />')
						)
					);

					verticalBar = container.find('>.jspVerticalBar');
					verticalTrack = verticalBar.find('>.jspTrack');
					verticalDrag = verticalTrack.find('>.jspDrag');

					if (settings.showArrows) {
						arrowUp = $('<a class="jspArrow jspArrowUp" />').bind(
							'mousedown.jsp', getArrowScroll(0, -1)
						).bind('click.jsp', nil);
						arrowDown = $('<a class="jspArrow jspArrowDown" />').bind(
							'mousedown.jsp', getArrowScroll(0, 1)
						).bind('click.jsp', nil);
						if (settings.arrowScrollOnHover) {
							arrowUp.bind('mouseover.jsp', getArrowScroll(0, -1, arrowUp));
							arrowDown.bind('mouseover.jsp', getArrowScroll(0, 1, arrowDown));
						}

						appendArrows(verticalTrack, settings.verticalArrowPositions, arrowUp, arrowDown);
					}

					verticalTrackHeight = paneHeight;
					container.find('>.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow').each(
						function()
						{
							verticalTrackHeight -= $(this).outerHeight();
						}
					);


					verticalDrag.hover(
						function()
						{
							verticalDrag.addClass('jspHover');
						},
						function()
						{
							verticalDrag.removeClass('jspHover');
						}
					).bind(
						'mousedown.jsp',
						function(e)
						{
							// Stop IE from allowing text selection
							$('html').bind('dragstart.jsp selectstart.jsp', nil);

							verticalDrag.addClass('jspActive');

							var startY = e.pageY - verticalDrag.position().top;

							$('html').bind(
								'mousemove.jsp',
								function(e)
								{
									positionDragY(e.pageY - startY, false);
								}
							).bind('mouseup.jsp mouseleave.jsp', cancelDrag);
							return false;
						}
					);
					sizeVerticalScrollbar();
				}
			}

			function sizeVerticalScrollbar()
			{
				verticalTrack.height(verticalTrackHeight + 'px');
				verticalDragPosition = 0;
				scrollbarWidth = settings.verticalGutter + verticalTrack.outerWidth();

				// Make the pane thinner to allow for the vertical scrollbar
				pane.width(paneWidth - scrollbarWidth - originalPaddingTotalWidth);

				// Add margin to the left of the pane if scrollbars are on that side (to position
				// the scrollbar on the left or right set it's left or right property in CSS)
				try {
					if (verticalBar.position().left === 0) {
						pane.css('margin-left', scrollbarWidth + 'px');
					}
				} catch (err) {
				}
			}

			function initialiseHorizontalScroll()
			{
				if (isScrollableH) {

					container.append(
						$('<div class="jspHorizontalBar" />').append(
							$('<div class="jspCap jspCapLeft" />'),
							$('<div class="jspTrack" />').append(
								$('<div class="jspDrag" />').append(
									$('<div class="jspDragLeft" />'),
									$('<div class="jspDragRight" />')
								)
							),
							$('<div class="jspCap jspCapRight" />')
						)
					);

					horizontalBar = container.find('>.jspHorizontalBar');
					horizontalTrack = horizontalBar.find('>.jspTrack');
					horizontalDrag = horizontalTrack.find('>.jspDrag');

					if (settings.showArrows) {
						arrowLeft = $('<a class="jspArrow jspArrowLeft" />').bind(
							'mousedown.jsp', getArrowScroll(-1, 0)
						).bind('click.jsp', nil);
						arrowRight = $('<a class="jspArrow jspArrowRight" />').bind(
							'mousedown.jsp', getArrowScroll(1, 0)
						).bind('click.jsp', nil);
						if (settings.arrowScrollOnHover) {
							arrowLeft.bind('mouseover.jsp', getArrowScroll(-1, 0, arrowLeft));
							arrowRight.bind('mouseover.jsp', getArrowScroll(1, 0, arrowRight));
						}
						appendArrows(horizontalTrack, settings.horizontalArrowPositions, arrowLeft, arrowRight);
					}

					horizontalDrag.hover(
						function()
						{
							horizontalDrag.addClass('jspHover');
						},
						function()
						{
							horizontalDrag.removeClass('jspHover');
						}
					).bind(
						'mousedown.jsp',
						function(e)
						{
							// Stop IE from allowing text selection
							$('html').bind('dragstart.jsp selectstart.jsp', nil);

							horizontalDrag.addClass('jspActive');

							var startX = e.pageX - horizontalDrag.position().left;

							$('html').bind(
								'mousemove.jsp',
								function(e)
								{
									positionDragX(e.pageX - startX, false);
								}
							).bind('mouseup.jsp mouseleave.jsp', cancelDrag);
							return false;
						}
					);
					horizontalTrackWidth = container.innerWidth();
					sizeHorizontalScrollbar();
				}
			}

			function sizeHorizontalScrollbar()
			{
				container.find('>.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow').each(
					function()
					{
						horizontalTrackWidth -= $(this).outerWidth();
					}
				);

				horizontalTrack.width(horizontalTrackWidth + 'px');
				horizontalDragPosition = 0;
			}

			function resizeScrollbars()
			{
				if (isScrollableH && isScrollableV) {
					var horizontalTrackHeight = horizontalTrack.outerHeight(),
						verticalTrackWidth = verticalTrack.outerWidth();
					verticalTrackHeight -= horizontalTrackHeight;
					$(horizontalBar).find('>.jspCap:visible,>.jspArrow').each(
						function()
						{
							horizontalTrackWidth += $(this).outerWidth();
						}
					);
					horizontalTrackWidth -= verticalTrackWidth;
					paneHeight -= verticalTrackWidth;
					paneWidth -= horizontalTrackHeight;
					horizontalTrack.parent().append(
						$('<div class="jspCorner" />').css('width', horizontalTrackHeight + 'px')
					);
					sizeVerticalScrollbar();
					sizeHorizontalScrollbar();
				}
				// reflow content
				if (isScrollableH) {
					pane.width((container.outerWidth() - originalPaddingTotalWidth) + 'px');
				}
				contentHeight = pane.outerHeight();
				percentInViewV = contentHeight / paneHeight;

				if (isScrollableH) {
					horizontalDragWidth = Math.ceil(1 / percentInViewH * horizontalTrackWidth);
					if (horizontalDragWidth > settings.horizontalDragMaxWidth) {
						horizontalDragWidth = settings.horizontalDragMaxWidth;
					} else if (horizontalDragWidth < settings.horizontalDragMinWidth) {
						horizontalDragWidth = settings.horizontalDragMinWidth;
					}
					horizontalDrag.width(horizontalDragWidth + 'px');
					dragMaxX = horizontalTrackWidth - horizontalDragWidth;
					_positionDragX(horizontalDragPosition); // To update the state for the arrow buttons
				}
				if (isScrollableV) {
					verticalDragHeight = Math.ceil(1 / percentInViewV * verticalTrackHeight);
					if (verticalDragHeight > settings.verticalDragMaxHeight) {
						verticalDragHeight = settings.verticalDragMaxHeight;
					} else if (verticalDragHeight < settings.verticalDragMinHeight) {
						verticalDragHeight = settings.verticalDragMinHeight;
					}
					verticalDrag.height(verticalDragHeight + 'px');
					dragMaxY = verticalTrackHeight - verticalDragHeight;
					_positionDragY(verticalDragPosition); // To update the state for the arrow buttons
				}
			}

			function appendArrows(ele, p, a1, a2)
			{
				var p1 = "before", p2 = "after", aTemp;
				
				// Sniff for mac... Is there a better way to determine whether the arrows would naturally appear
				// at the top or the bottom of the bar?
				if (p == "os") {
					p = /Mac/.test(navigator.platform) ? "after" : "split";
				}
				if (p == p1) {
					p2 = p;
				} else if (p == p2) {
					p1 = p;
					aTemp = a1;
					a1 = a2;
					a2 = aTemp;
				}

				ele[p1](a1)[p2](a2);
			}

			function getArrowScroll(dirX, dirY, ele)
			{
				return function()
				{
					arrowScroll(dirX, dirY, this, ele);
					this.blur();
					return false;
				};
			}

			function arrowScroll(dirX, dirY, arrow, ele)
			{
				arrow = $(arrow).addClass('jspActive');

				var eve,
					scrollTimeout,
					isFirst = true,
					doScroll = function()
					{
						if (dirX !== 0) {
							jsp.scrollByX(dirX * settings.arrowButtonSpeed);
						}
						if (dirY !== 0) {
							jsp.scrollByY(dirY * settings.arrowButtonSpeed);
						}
						scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.arrowRepeatFreq);
						isFirst = false;
					};

				doScroll();

				eve = ele ? 'mouseout.jsp' : 'mouseup.jsp';
				ele = ele || $('html');
				ele.bind(
					eve,
					function()
					{
						arrow.removeClass('jspActive');
						scrollTimeout && clearTimeout(scrollTimeout);
						scrollTimeout = null;
						ele.unbind(eve);
					}
				);
			}

			function initClickOnTrack()
			{
				removeClickOnTrack();
				if (isScrollableV) {
					verticalTrack.bind(
						'mousedown.jsp',
						function(e)
						{
							if (e.originalTarget === undefined || e.originalTarget == e.currentTarget) {
								var clickedTrack = $(this),
									offset = clickedTrack.offset(),
									direction = e.pageY - offset.top - verticalDragPosition,
									scrollTimeout,
									isFirst = true,
									doScroll = function()
									{
										var offset = clickedTrack.offset(),
											pos = e.pageY - offset.top - verticalDragHeight / 2,
											contentDragY = paneHeight * settings.scrollPagePercent,
											dragY = dragMaxY * contentDragY / (contentHeight - paneHeight);
										if (direction < 0) {
											if (verticalDragPosition - dragY > pos) {
												jsp.scrollByY(-contentDragY);
											} else {
												positionDragY(pos);
											}
										} else if (direction > 0) {
											if (verticalDragPosition + dragY < pos) {
												jsp.scrollByY(contentDragY);
											} else {
												positionDragY(pos);
											}
										} else {
											cancelClick();
											return;
										}
										scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.trackClickRepeatFreq);
										isFirst = false;
									},
									cancelClick = function()
									{
										scrollTimeout && clearTimeout(scrollTimeout);
										scrollTimeout = null;
										$(document).unbind('mouseup.jsp', cancelClick);
									};
								doScroll();
								$(document).bind('mouseup.jsp', cancelClick);
								return false;
							}
						}
					);
				}
				
				if (isScrollableH) {
					horizontalTrack.bind(
						'mousedown.jsp',
						function(e)
						{
							if (e.originalTarget === undefined || e.originalTarget == e.currentTarget) {
								var clickedTrack = $(this),
									offset = clickedTrack.offset(),
									direction = e.pageX - offset.left - horizontalDragPosition,
									scrollTimeout,
									isFirst = true,
									doScroll = function()
									{
										var offset = clickedTrack.offset(),
											pos = e.pageX - offset.left - horizontalDragWidth / 2,
											contentDragX = paneWidth * settings.scrollPagePercent,
											dragX = dragMaxX * contentDragX / (contentWidth - paneWidth);
										if (direction < 0) {
											if (horizontalDragPosition - dragX > pos) {
												jsp.scrollByX(-contentDragX);
											} else {
												positionDragX(pos);
											}
										} else if (direction > 0) {
											if (horizontalDragPosition + dragX < pos) {
												jsp.scrollByX(contentDragX);
											} else {
												positionDragX(pos);
											}
										} else {
											cancelClick();
											return;
										}
										scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.trackClickRepeatFreq);
										isFirst = false;
									},
									cancelClick = function()
									{
										scrollTimeout && clearTimeout(scrollTimeout);
										scrollTimeout = null;
										$(document).unbind('mouseup.jsp', cancelClick);
									};
								doScroll();
								$(document).bind('mouseup.jsp', cancelClick);
								return false;
							}
						}
					);
				}
			}

			function removeClickOnTrack()
			{
				if (horizontalTrack) {
					horizontalTrack.unbind('mousedown.jsp');
				}
				if (verticalTrack) {
					verticalTrack.unbind('mousedown.jsp');
				}
			}

			function cancelDrag()
			{
				$('html').unbind('dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp');

				if (verticalDrag) {
					verticalDrag.removeClass('jspActive');
				}
				if (horizontalDrag) {
					horizontalDrag.removeClass('jspActive');
				}
			}

			function positionDragY(destY, animate)
			{
				if (!isScrollableV) {
					return;
				}
				if (destY < 0) {
					destY = 0;
				} else if (destY > dragMaxY) {
					destY = dragMaxY;
				}

				// can't just check if(animate) because false is a valid value that could be passed in...
				if (animate === undefined) {
					animate = settings.animateScroll;
				}
				if (animate) {
					jsp.animate(verticalDrag, 'top', destY,	_positionDragY);
				} else {
					verticalDrag.css('top', destY);
					_positionDragY(destY);
				}

			}

			function _positionDragY(destY)
			{
				if (destY === undefined) {
					destY = verticalDrag.position().top;
				}

				container.scrollTop(0);
				verticalDragPosition = destY;

				var isAtTop = verticalDragPosition === 0,
					isAtBottom = verticalDragPosition == dragMaxY,
					percentScrolled = destY/ dragMaxY,
					destTop = -percentScrolled * (contentHeight - paneHeight);

				if (wasAtTop != isAtTop || wasAtBottom != isAtBottom) {
					wasAtTop = isAtTop;
					wasAtBottom = isAtBottom;
					elem.trigger('jsp-arrow-change', [wasAtTop, wasAtBottom, wasAtLeft, wasAtRight]);
				}
				
				updateVerticalArrows(isAtTop, isAtBottom);
				pane.css('top', destTop);
				elem.trigger('jsp-scroll-y', [-destTop, isAtTop, isAtBottom]).trigger('scroll');
			}

			function positionDragX(destX, animate)
			{
				if (!isScrollableH) {
					return;
				}
				if (destX < 0) {
					destX = 0;
				} else if (destX > dragMaxX) {
					destX = dragMaxX;
				}

				if (animate === undefined) {
					animate = settings.animateScroll;
				}
				if (animate) {
					jsp.animate(horizontalDrag, 'left', destX,	_positionDragX);
				} else {
					horizontalDrag.css('left', destX);
					_positionDragX(destX);
				}
			}

			function _positionDragX(destX)
			{
				if (destX === undefined) {
					destX = horizontalDrag.position().left;
				}

				container.scrollTop(0);
				horizontalDragPosition = destX;

				var isAtLeft = horizontalDragPosition === 0,
					isAtRight = horizontalDragPosition == dragMaxX,
					percentScrolled = destX / dragMaxX,
					destLeft = -percentScrolled * (contentWidth - paneWidth);

				if (wasAtLeft != isAtLeft || wasAtRight != isAtRight) {
					wasAtLeft = isAtLeft;
					wasAtRight = isAtRight;
					elem.trigger('jsp-arrow-change', [wasAtTop, wasAtBottom, wasAtLeft, wasAtRight]);
				}
				
				updateHorizontalArrows(isAtLeft, isAtRight);
				pane.css('left', destLeft);
				elem.trigger('jsp-scroll-x', [-destLeft, isAtLeft, isAtRight]).trigger('scroll');
			}

			function updateVerticalArrows(isAtTop, isAtBottom)
			{
				if (settings.showArrows) {
					arrowUp[isAtTop ? 'addClass' : 'removeClass']('jspDisabled');
					arrowDown[isAtBottom ? 'addClass' : 'removeClass']('jspDisabled');
				}
			}

			function updateHorizontalArrows(isAtLeft, isAtRight)
			{
				if (settings.showArrows) {
					arrowLeft[isAtLeft ? 'addClass' : 'removeClass']('jspDisabled');
					arrowRight[isAtRight ? 'addClass' : 'removeClass']('jspDisabled');
				}
			}

			function scrollToY(destY, animate)
			{
				var percentScrolled = destY / (contentHeight - paneHeight);
				positionDragY(percentScrolled * dragMaxY, animate);
			}

			function scrollToX(destX, animate)
			{
				var percentScrolled = destX / (contentWidth - paneWidth);
				positionDragX(percentScrolled * dragMaxX, animate);
			}

			function scrollToElement(ele, stickToTop, animate)
			{
				var e, eleHeight, eleWidth, eleTop = 0, eleLeft = 0, viewportTop, viewportLeft, maxVisibleEleTop, maxVisibleEleLeft, destY, destX;

				// Legal hash values aren't necessarily legal jQuery selectors so we need to catch any
				// errors from the lookup...
				try {
					e = $(ele);
				} catch (err) {
					return;
				}
				eleHeight = e.outerHeight();
				eleWidth= e.outerWidth();

				container.scrollTop(0);
				container.scrollLeft(0);
				
				// loop through parents adding the offset top of any elements that are relatively positioned between
				// the focused element and the jspPane so we can get the true distance from the top
				// of the focused element to the top of the scrollpane...
				while (!e.is('.jspPane')) {
					eleTop += e.position().top;
					eleLeft += e.position().left;
					e = e.offsetParent();
					if (/^body|html$/i.test(e[0].nodeName)) {
						// we ended up too high in the document structure. Quit!
						return;
					}
				}

				viewportTop = contentPositionY();
				maxVisibleEleTop = viewportTop + paneHeight;
				if (eleTop < viewportTop || stickToTop) { // element is above viewport
					destY = eleTop - settings.verticalGutter;
				} else if (eleTop + eleHeight > maxVisibleEleTop) { // element is below viewport
					destY = eleTop - paneHeight + eleHeight + settings.verticalGutter;
				}
				if (destY) {
					scrollToY(destY, animate);
				}
				
				viewportLeft = contentPositionX();
	            maxVisibleEleLeft = viewportLeft + paneWidth;
	            if (eleLeft < viewportLeft || stickToTop) { // element is to the left of viewport
	                destX = eleLeft - settings.horizontalGutter;
	            } else if (eleLeft + eleWidth > maxVisibleEleLeft) { // element is to the right viewport
	                destX = eleLeft - paneWidth + eleWidth + settings.horizontalGutter;
	            }
	            if (destX) {
	                scrollToX(destX, animate);
	            }

			}

			function contentPositionX()
			{
				return -pane.position().left;
			}

			function contentPositionY()
			{
				return -pane.position().top;
			}

			function isCloseToBottom()
			{
				var scrollableHeight = contentHeight - paneHeight;
				return (scrollableHeight > 20) && (scrollableHeight - contentPositionY() < 10);
			}

			function isCloseToRight()
			{
				var scrollableWidth = contentWidth - paneWidth;
				return (scrollableWidth > 20) && (scrollableWidth - contentPositionX() < 10);
			}

			function initMousewheel()
			{
				container.unbind(mwEvent).bind(
					mwEvent,
					function (event, delta, deltaX, deltaY) {
						var dX = horizontalDragPosition, dY = verticalDragPosition;
						jsp.scrollBy(deltaX * settings.mouseWheelSpeed, -deltaY * settings.mouseWheelSpeed, false);
						// return true if there was no movement so rest of screen can scroll
						return dX == horizontalDragPosition && dY == verticalDragPosition;
					}
				);
			}

			function removeMousewheel()
			{
				container.unbind(mwEvent);
			}

			function nil()
			{
				return false;
			}

			function initFocusHandler()
			{
				pane.find(':input,a').unbind('focus.jsp').bind(
					'focus.jsp',
					function(e)
					{
						scrollToElement(e.target, false);
					}
				);
			}

			function removeFocusHandler()
			{
				pane.find(':input,a').unbind('focus.jsp');
			}
			
			function initKeyboardNav()
			{
				var keyDown, elementHasScrolled, validParents = [];
				isScrollableH && validParents.push(horizontalBar[0]);
				isScrollableV && validParents.push(verticalBar[0]);
				
				// IE also focuses elements that don't have tabindex set.
				pane.focus(
					function()
					{
						elem.focus();
					}
				);
				
				elem.attr('tabindex', 0)
					.unbind('keydown.jsp keypress.jsp')
					.bind(
						'keydown.jsp',
						function(e)
						{
							if (e.target !== this && !(validParents.length && $(e.target).closest(validParents).length)){
								return;
							}
							var dX = horizontalDragPosition, dY = verticalDragPosition;
							switch(e.keyCode) {
								case 40: // down
								case 38: // up
								case 34: // page down
								case 32: // space
								case 33: // page up
								case 39: // right
								case 37: // left
									keyDown = e.keyCode;
									keyDownHandler();
									break;
								case 35: // end
									scrollToY(contentHeight - paneHeight);
									keyDown = null;
									break;
								case 36: // home
									scrollToY(0);
									keyDown = null;
									break;
							}

							elementHasScrolled = e.keyCode == keyDown && dX != horizontalDragPosition || dY != verticalDragPosition;
							return !elementHasScrolled;
						}
					).bind(
						'keypress.jsp', // For FF/ OSX so that we can cancel the repeat key presses if the JSP scrolls...
						function(e)
						{
							if (e.keyCode == keyDown) {
								keyDownHandler();
							}
							return !elementHasScrolled;
						}
					);
				
				if (settings.hideFocus) {
					elem.css('outline', 'none');
					if ('hideFocus' in container[0]){
						elem.attr('hideFocus', true);
					}
				} else {
					elem.css('outline', '');
					if ('hideFocus' in container[0]){
						elem.attr('hideFocus', false);
					}
				}
				
				function keyDownHandler()
				{
					var dX = horizontalDragPosition, dY = verticalDragPosition;
					switch(keyDown) {
						case 40: // down
							jsp.scrollByY(settings.keyboardSpeed, false);
							break;
						case 38: // up
							jsp.scrollByY(-settings.keyboardSpeed, false);
							break;
						case 34: // page down
						case 32: // space
							jsp.scrollByY(paneHeight * settings.scrollPagePercent, false);
							break;
						case 33: // page up
							jsp.scrollByY(-paneHeight * settings.scrollPagePercent, false);
							break;
						case 39: // right
							jsp.scrollByX(settings.keyboardSpeed, false);
							break;
						case 37: // left
							jsp.scrollByX(-settings.keyboardSpeed, false);
							break;
					}

					elementHasScrolled = dX != horizontalDragPosition || dY != verticalDragPosition;
					return elementHasScrolled;
				}
			}
			
			function removeKeyboardNav()
			{
				elem.attr('tabindex', '-1')
					.removeAttr('tabindex')
					.unbind('keydown.jsp keypress.jsp');
			}

			function observeHash()
			{
				if (location.hash && location.hash.length > 1) {
					var e,
						retryInt,
						hash = escape(location.hash.substr(1)) // hash must be escaped to prevent XSS
						;
					try {
						e = $('#' + hash + ', a[name="' + hash + '"]');
					} catch (err) {
						return;
					}

					if (e.length && pane.find(hash)) {
						// nasty workaround but it appears to take a little while before the hash has done its thing
						// to the rendered page so we just wait until the container's scrollTop has been messed up.
						if (container.scrollTop() === 0) {
							retryInt = setInterval(
								function()
								{
									if (container.scrollTop() > 0) {
										scrollToElement(e, true);
										$(document).scrollTop(container.position().top);
										clearInterval(retryInt);
									}
								},
								50
							);
						} else {
							scrollToElement(e, true);
							$(document).scrollTop(container.position().top);
						}
					}
				}
			}

			function hijackInternalLinks()
			{
				// only register the link handler once
				if ($(document.body).data('jspHijack')) {
					return;
				}

				// remember that the handler was bound
				$(document.body).data('jspHijack', true);

				// use live handler to also capture newly created links
				$(document.body).delegate('a[href*=#]', 'click', function(event) {
					// does the link point to the same page?
					// this also takes care of cases with a <base>-Tag or Links not starting with the hash #
					// e.g. <a href="index.html#test"> when the current url already is index.html
					var href = this.href.substr(0, this.href.indexOf('#')),
						locationHref = location.href,
						hash,
						element,
						container,
						jsp,
						scrollTop,
						elementTop;
					if (location.href.indexOf('#') !== -1) {
						locationHref = location.href.substr(0, location.href.indexOf('#'));
					}
					if (href !== locationHref) {
						// the link points to another page
						return;
					}

					// check if jScrollPane should handle this click event
					hash = escape(this.href.substr(this.href.indexOf('#') + 1));

					// find the element on the page
					element;
					try {
						element = $('#' + hash + ', a[name="' + hash + '"]');
					} catch (e) {
						// hash is not a valid jQuery identifier
						return;
					}

					if (!element.length) {
						// this link does not point to an element on this page
						return;
					}

					container = element.closest('.jspScrollable');
					jsp = container.data('jsp');

					// jsp might be another jsp instance than the one, that bound this event
					// remember: this event is only bound once for all instances.
					jsp.scrollToElement(element, true);

					if (container[0].scrollIntoView) {
						// also scroll to the top of the container (if it is not visible)
						scrollTop = $(window).scrollTop();
						elementTop = element.offset().top;
						if (elementTop < scrollTop || elementTop > scrollTop + $(window).height()) {
							container[0].scrollIntoView();
						}
					}

					// jsp handled this event, prevent the browser default (scrolling :P)
					event.preventDefault();
				});
			}
			
			// Init touch on iPad, iPhone, iPod, Android
			function initTouch()
			{
				var startX,
					startY,
					touchStartX,
					touchStartY,
					moved,
					moving = false;
  
				container.unbind('touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick').bind(
					'touchstart.jsp',
					function(e)
					{
						var touch = e.originalEvent.touches[0];
						startX = contentPositionX();
						startY = contentPositionY();
						touchStartX = touch.pageX;
						touchStartY = touch.pageY;
						moved = false;
						moving = true;
					}
				).bind(
					'touchmove.jsp',
					function(ev)
					{
						if(!moving) {
							return;
						}
						
						var touchPos = ev.originalEvent.touches[0],
							dX = horizontalDragPosition, dY = verticalDragPosition;
						
						jsp.scrollTo(startX + touchStartX - touchPos.pageX, startY + touchStartY - touchPos.pageY);
						
						moved = moved || Math.abs(touchStartX - touchPos.pageX) > 5 || Math.abs(touchStartY - touchPos.pageY) > 5;
						
						// return true if there was no movement so rest of screen can scroll
						return dX == horizontalDragPosition && dY == verticalDragPosition;
					}
				).bind(
					'touchend.jsp',
					function(e)
					{
						moving = false;
						/*if(moved) {
							return false;
						}*/
					}
				).bind(
					'click.jsp-touchclick',
					function(e)
					{
						if(moved) {
							moved = false;
							return false;
						}
					}
				);
			}
			
			function destroy(){
				var currentY = contentPositionY(),
					currentX = contentPositionX();
				elem.removeClass('jspScrollable').unbind('.jsp');
				elem.replaceWith(originalElement.append(pane.children()));
				originalElement.scrollTop(currentY);
				originalElement.scrollLeft(currentX);

				// clear reinitialize timer if active
				if (reinitialiseInterval) {
					clearInterval(reinitialiseInterval);
				}
			}

			// Public API
			$.extend(
				jsp,
				{
					// Reinitialises the scroll pane (if it's internal dimensions have changed since the last time it
					// was initialised). The settings object which is passed in will override any settings from the
					// previous time it was initialised - if you don't pass any settings then the ones from the previous
					// initialisation will be used.
					reinitialise: function(s)
					{
						s = $.extend({}, settings, s);
						initialise(s);
					},
					// Scrolls the specified element (a jQuery object, DOM node or jQuery selector string) into view so
					// that it can be seen within the viewport. If stickToTop is true then the element will appear at
					// the top of the viewport, if it is false then the viewport will scroll as little as possible to
					// show the element. You can also specify if you want animation to occur. If you don't provide this
					// argument then the animateScroll value from the settings object is used instead.
					scrollToElement: function(ele, stickToTop, animate)
					{
						scrollToElement(ele, stickToTop, animate);
					},
					// Scrolls the pane so that the specified co-ordinates within the content are at the top left
					// of the viewport. animate is optional and if not passed then the value of animateScroll from
					// the settings object this jScrollPane was initialised with is used.
					scrollTo: function(destX, destY, animate)
					{
						scrollToX(destX, animate);
						scrollToY(destY, animate);
					},
					// Scrolls the pane so that the specified co-ordinate within the content is at the left of the
					// viewport. animate is optional and if not passed then the value of animateScroll from the settings
					// object this jScrollPane was initialised with is used.
					scrollToX: function(destX, animate)
					{
						scrollToX(destX, animate);
					},
					// Scrolls the pane so that the specified co-ordinate within the content is at the top of the
					// viewport. animate is optional and if not passed then the value of animateScroll from the settings
					// object this jScrollPane was initialised with is used.
					scrollToY: function(destY, animate)
					{
						scrollToY(destY, animate);
					},
					// Scrolls the pane to the specified percentage of its maximum horizontal scroll position. animate
					// is optional and if not passed then the value of animateScroll from the settings object this
					// jScrollPane was initialised with is used.
					scrollToPercentX: function(destPercentX, animate)
					{
						scrollToX(destPercentX * (contentWidth - paneWidth), animate);
					},
					// Scrolls the pane to the specified percentage of its maximum vertical scroll position. animate
					// is optional and if not passed then the value of animateScroll from the settings object this
					// jScrollPane was initialised with is used.
					scrollToPercentY: function(destPercentY, animate)
					{
						scrollToY(destPercentY * (contentHeight - paneHeight), animate);
					},
					// Scrolls the pane by the specified amount of pixels. animate is optional and if not passed then
					// the value of animateScroll from the settings object this jScrollPane was initialised with is used.
					scrollBy: function(deltaX, deltaY, animate)
					{
						jsp.scrollByX(deltaX, animate);
						jsp.scrollByY(deltaY, animate);
					},
					// Scrolls the pane by the specified amount of pixels. animate is optional and if not passed then
					// the value of animateScroll from the settings object this jScrollPane was initialised with is used.
					scrollByX: function(deltaX, animate)
					{
						var destX = contentPositionX() + Math[deltaX<0 ? 'floor' : 'ceil'](deltaX),
							percentScrolled = destX / (contentWidth - paneWidth);
						positionDragX(percentScrolled * dragMaxX, animate);
					},
					// Scrolls the pane by the specified amount of pixels. animate is optional and if not passed then
					// the value of animateScroll from the settings object this jScrollPane was initialised with is used.
					scrollByY: function(deltaY, animate)
					{
						var destY = contentPositionY() + Math[deltaY<0 ? 'floor' : 'ceil'](deltaY),
							percentScrolled = destY / (contentHeight - paneHeight);
						positionDragY(percentScrolled * dragMaxY, animate);
					},
					// Positions the horizontal drag at the specified x position (and updates the viewport to reflect
					// this). animate is optional and if not passed then the value of animateScroll from the settings
					// object this jScrollPane was initialised with is used.
					positionDragX: function(x, animate)
					{
						positionDragX(x, animate);
					},
					// Positions the vertical drag at the specified y position (and updates the viewport to reflect
					// this). animate is optional and if not passed then the value of animateScroll from the settings
					// object this jScrollPane was initialised with is used.
					positionDragY: function(y, animate)
					{
						positionDragY(y, animate);
					},
					// This method is called when jScrollPane is trying to animate to a new position. You can override
					// it if you want to provide advanced animation functionality. It is passed the following arguments:
					//  * ele          - the element whose position is being animated
					//  * prop         - the property that is being animated
					//  * value        - the value it's being animated to
					//  * stepCallback - a function that you must execute each time you update the value of the property
					// You can use the default implementation (below) as a starting point for your own implementation.
					animate: function(ele, prop, value, stepCallback)
					{
						var params = {};
						params[prop] = value;
						ele.animate(
							params,
							{
								'duration'	: settings.animateDuration,
								'easing'	: settings.animateEase,
								'queue'		: false,
								'step'		: stepCallback
							}
						);
					},
					// Returns the current x position of the viewport with regards to the content pane.
					getContentPositionX: function()
					{
						return contentPositionX();
					},
					// Returns the current y position of the viewport with regards to the content pane.
					getContentPositionY: function()
					{
						return contentPositionY();
					},
					// Returns the width of the content within the scroll pane.
					getContentWidth: function()
					{
						return contentWidth;
					},
					// Returns the height of the content within the scroll pane.
					getContentHeight: function()
					{
						return contentHeight;
					},
					// Returns the horizontal position of the viewport within the pane content.
					getPercentScrolledX: function()
					{
						return contentPositionX() / (contentWidth - paneWidth);
					},
					// Returns the vertical position of the viewport within the pane content.
					getPercentScrolledY: function()
					{
						return contentPositionY() / (contentHeight - paneHeight);
					},
					// Returns whether or not this scrollpane has a horizontal scrollbar.
					getIsScrollableH: function()
					{
						return isScrollableH;
					},
					// Returns whether or not this scrollpane has a vertical scrollbar.
					getIsScrollableV: function()
					{
						return isScrollableV;
					},
					// Gets a reference to the content pane. It is important that you use this method if you want to
					// edit the content of your jScrollPane as if you access the element directly then you may have some
					// problems (as your original element has had additional elements for the scrollbars etc added into
					// it).
					getContentPane: function()
					{
						return pane;
					},
					// Scrolls this jScrollPane down as far as it can currently scroll. If animate isn't passed then the
					// animateScroll value from settings is used instead.
					scrollToBottom: function(animate)
					{
						positionDragY(dragMaxY, animate);
					},
					// Hijacks the links on the page which link to content inside the scrollpane. If you have changed
					// the content of your page (e.g. via AJAX) and want to make sure any new anchor links to the
					// contents of your scroll pane will work then call this function.
					hijackInternalLinks: $.noop,
					// Removes the jScrollPane and returns the page to the state it was in before jScrollPane was
					// initialised.
					destroy: function()
					{
							destroy();
					}
				}
			);
			
			initialise(s);
		}

		// Pluginifying code...
		settings = $.extend({}, $.fn.jScrollPane.defaults, settings);
		
		// Apply default speed
		$.each(['mouseWheelSpeed', 'arrowButtonSpeed', 'trackClickSpeed', 'keyboardSpeed'], function() {
			settings[this] = settings[this] || settings.speed;
		});

		return this.each(
			function()
			{
				var elem = $(this), jspApi = elem.data('jsp');
				if (jspApi) {
					jspApi.reinitialise(settings);
				} else {
					$("script",elem).filter('[type="text/javascript"],:not([type])').remove();
					jspApi = new JScrollPane(elem, settings);
					elem.data('jsp', jspApi);
				}
			}
		);
	};

	$.fn.jScrollPane.defaults = {
		showArrows					: false,
		maintainPosition			: true,
		stickToBottom				: false,
		stickToRight				: false,
		clickOnTrack				: true,
		autoReinitialise			: false,
		autoReinitialiseDelay		: 500,
		verticalDragMinHeight		: 0,
		verticalDragMaxHeight		: 99999,
		horizontalDragMinWidth		: 0,
		horizontalDragMaxWidth		: 99999,
		contentWidth				: undefined,
		animateScroll				: false,
		animateDuration				: 300,
		animateEase					: 'linear',
		hijackInternalLinks			: false,
		verticalGutter				: 4,
		horizontalGutter			: 4,
		mouseWheelSpeed				: 0,
		arrowButtonSpeed			: 0,
		arrowRepeatFreq				: 50,
		arrowScrollOnHover			: false,
		trackClickSpeed				: 0,
		trackClickRepeatFreq		: 70,
		verticalArrowPositions		: 'split',
		horizontalArrowPositions	: 'split',
		enableKeyboardNavigation	: true,
		hideFocus					: false,
		keyboardSpeed				: 0,
		initialDelay                : 300,        // Delay before starting repeating
		speed						: 30,		// Default speed when others falsey
		scrollPagePercent			: .8		// Percent of visible area scrolled when pageUp/Down or track area pressed
	};

})(jQuery,this);


/**
 * @classDescription	Custom selectbox with the option to use jScrollPane
 *						for a custom scrollbar. Hides the original selectbox off 
 *						screen so that it will still get picked up as a form element.
 *
 * @version				1.1.0
 *
 * @author				Rob LaPlaca - rob.laplaca@gmail.com
 * @date				04/05/2010
 * @lastUpdate			03/09/2014 
 * @dependency			jScrollPane.js			optional
 *						jquery.mousewheel.js	optional
 * 
 * @param {DOMElement}	options.selectbox			the selectbox that is being customized, REQUIRED (default undefined)
 * @param {Boolean}		options.customScrollbar		whether or not to use jScrollPane to restyle system scrollbar (default false)
 * @param {Number}		options.zIndex				The default z-index of the selectbox. (default 100)
 * @param {Function}	options.changeCallback		Function that gets executed on change of the selectbox (default empty function)
 * @param {Function}	options.manager				Optional reference to a class that manages all instances of the selectbox
 * @param {Object}		options.scrollOptions		jScrollPane options, refer to jscrollpane documentation for possible options
 *													http://www.kelvinluck.com/assets/jquery/jScrollPane/scripts/jScrollPane.js
 */
(function($){
	window.SelectBoxManager = function(options){
		var sbs = [],
			self = this;

		$(document).click(function(e) {
			if($(e.target).parents(".customSelect").size() === 0) {
				self.close();
			}
		});

		this.add = function(sb) {
			sbs.push(sb);
		};

		this.close = function() {
			$(sbs).each(function() {
				this.close();
			});
		};
	};

	var sb_manager = new SelectBoxManager();

	window.SelectBox = function(options){
		var self = this,
		cfg = $.extend(true, {
			manager: sb_manager,
			customScrollbar: true,
			zIndex: 100,
			changeCallback: function(val) { },
			truncate: function(str) {return str;},
			scrollOptions: {}
		}, options);

		var $customSelect, $selectedValue, $selectValueWrap, $selectList, $dl, $options,
			FOCUSED_CLASS = "focused",
			SELECTED_CLASS = "selected",
			SELECT_OPEN_CLASS = "select-open",
			DISABLED_CLASS = "disabled",
			HOVERED_CLASS = "hovered",
			_useDefaultBehavior = false,
			_isOpen = false,
			_isEnabled = true,
			_isFocused = false,
			_selectedValue = "";

		/**
		 * @constructor
		 */

		function init() {
			// TODO: don't use userAgent matching to detect defaulting to device specific behavior
			_useDefaultBehavior = navigator.userAgent.match(/iPad|iPhone|Android|IEMobile|BlackBerry/i) ? true : false;

			if( _useDefaultBehavior ) {
				cfg.selectbox.addClass("use-default");
			}

			var selectId = "",
				selectedClass = cfg.selectbox.attr("class");
				
			if(typeof cfg.selectbox.attr("id") !== "undefined") {
				selectId = 'id="select-'+cfg.selectbox.attr("id")+'"';
			}

			cfg.selectbox.wrap('<div class="customSelect '+selectedClass+'" '+selectId+' />');

			$customSelect = cfg.selectbox.parents(".customSelect");
			$options = cfg.selectbox.find("option");

			var selectListHTML = ['<div class="selectList"><div class="selectListOuterWrap"><div class="selectListInnerWrap"><div class="selectListTop"></div><dl>'];
			selectListHTML.push(_renderOptions());
			selectListHTML.push('</dl><div class="selectListBottom"></div></div></div></div>');

			$customSelect.append('<div class="selectValueWrap"><div class="selectedValue">'+_selectedValue+'</div> <span class="caret"></span> </div>' + selectListHTML.join(""));

			$dl = $customSelect.find("dl");
			$selectedValue = $customSelect.find(".selectedValue");
			$selectValueWrap = $customSelect.find(".selectValueWrap");
			$selectList = $customSelect.find(".selectList");

			$customSelect.width(cfg.width);
			$dl.width(cfg.width - 2);

			_bindEvents();

			sb_manager.add(self);
		}

		/**
		 * @private
		 */

		function _bindEvents() {
			$selectValueWrap.click(function() {
				if(_isOpen) {
					cfg.selectbox.focus();
					self.close();
				} else if(_isEnabled) {
					if( _useDefaultBehavior ) {
						cfg.selectbox.focus();
					} else {
						self.open();
					}
				}
			});

			// delegated events
			$dl.click(function(e) {
				var $target = $(e.target);

				if($target.is("dd") || $target.parents("dd")) {
					if(e.target.tagName.toLowerCase() != "dd") {
						$target = $target.parents("dd");
					}

					if(!$target.hasClass(DISABLED_CLASS) && $target.get(0)) {
						self.jumpToIndex($target.get(0).className.split(" ")[0].split("-")[1]);
						self.close();

						if( ! _useDefaultBehavior ) {
							cfg.selectbox.focus();
						}
					}
				}
			});

			cfg.selectbox.focus(function(e) {
				_isFocused = true;
				$customSelect.addClass(FOCUSED_CLASS);
			}).blur(function(e){
				_isFocused = false;
				$customSelect.removeClass(FOCUSED_CLASS);
			});

			if( _useDefaultBehavior ) {
				cfg.selectbox.change(function(e) {
					_updateValue( $(this).find("option:selected").html() );
					
				});
			}

			cfg.selectbox.keyup(function(e){
				self.close();
				$options.each(function(i, itm){		
					if(itm.selected) {
						self.jumpToIndex(i);
						return false;
					}
				});
			});

			_bindHover();
		}

		/**
		 * @private
		 */

		function _bindHover() {
			var $dds = $(".customSelect dd");
			$dds.off("mouseover");
			$dds.off("mouseout");

			$dds.on("mouseover", function(e) {
				var $target = $(e.target);
				if(e.target.tagName.toLowerCase() != "dd") {
					$target = $target.parents("dd");
				}
				$target.addClass(HOVERED_CLASS);
			});

			$dds.on("mouseout", function(e) {
				var $target = $(e.target);
				if(e.target.tagName.toLowerCase() != "dd") {
					$target = $target.parents("dd");
				}
				$target.removeClass(HOVERED_CLASS);
			});
		}

		/**
		 * @param {String} val
		 * @private
		 */

		function _updateValue(val) {
			if($selectedValue.html() != val) {
				$selectedValue.html(_truncate(val));
				cfg.changeCallback(cfg.selectbox.val());
				if( !_useDefaultBehavior ) {
					cfg.selectbox.trigger("change");
				}
			}
		}

		/** 
		 * @returns {String} HTML generated after processing options
		 * @private
		 */

		function _renderOptions() {
			var optionHTML = [];

			$options.each(function(i, itm) {
				var $this = $(this),
					optgroup = $this.parents('optgroup'),
					addlOptClasses = "",
					iconMarkup = "";

				// render optgroups if present in original select
				if (optgroup.length > 0 && $this.prev().length === 0){
					optionHTML.push('<dt>'+optgroup.attr('label')+'</dt>');
				}

				// if option has a classname add that to custom select as well
				if(itm.className !== "") {
					$(itm.className.split(" ")).each(function() {
						iconMarkup += '<span class="' + this + '"></span>';
					});
				}

				// add selected class to whatever option is currently active
				if(itm.selected && !itm.disabled) {
					_selectedValue = iconMarkup + _truncate($(itm).html());
					addlOptClasses = " " + SELECTED_CLASS;
				}

				// Check for disabled options
				if( itm.disabled ) {
					addlOptClasses += " " + DISABLED_CLASS;
				}

				optionHTML.push('<dd class="itm-'+i+' ' + addlOptClasses + '">' + iconMarkup + itm.innerHTML + '</dd>');
			});

			if($selectedValue && $selectedValue.get(0) !== null) {
				$selectedValue.html(_selectedValue);
			}

			return optionHTML.join("");
		}

		/**
		 * @private
		 */

		function _setupScrollbar() {
			$dl.css("height","auto");
			if(cfg.height && $dl.height() > cfg.height) {
				$dl.css("height", cfg.height);
				if(cfg.customScrollbar) {
					self.scrollpane = $dl.jScrollPane($.extend({
						contentWidth: 200
					}, cfg.scrollOptions));
				} else {
					$dl.addClass("defaultScrollbar");
				}
			} else {
				$dl.css({overflow: "hidden"});
			}
		}

		/**
		 * @param {String} str
		 * @returns truncated display string
		 * @private
		 */

		function _truncate(str) {
			var arr = str.split("</span>");
			var valToTrunc = arr[arr.length - 1];
			arr[arr.length - 1] = "";
			var spans = arr.join("</SPAN>");

			return spans + cfg.truncate(valToTrunc);
		}

		/**
		 * @public
		 */

		this.sync = function() {
			$options = cfg.selectbox.find("option");
			$dl.html(_renderOptions());
			_bindHover();
			_setupScrollbar();
		};

		/**
		 * @public
		 */

		this.disable = function() {
			_isEnabled = false;
			$customSelect.addClass(DISABLED_CLASS);
			cfg.selectbox.attr("disabled", "disabled");
		};

		/**
		 * @public
		 */

		this.enable = function() {
			_isEnabled = true;
			$customSelect.removeClass(DISABLED_CLASS);
			cfg.selectbox.removeAttr("disabled");
		};

		/**
		 * @public
		 */

		this.close = function() {
			$customSelect.removeClass(SELECT_OPEN_CLASS);
			$customSelect.css({"z-index": cfg.zIndex});
			_isOpen = false;
		};

		/**
		 * @public
		 */

		this.open = function() {
			_setupScrollbar();
			if(cfg.manager) {
				cfg.manager.close();
			}

			$customSelect.addClass(SELECT_OPEN_CLASS);

			if(self.scrollpane) {
				self.scrollpane.data('jsp').scrollToY($customSelect.find(".selected").position().top);
			}

			$customSelect.css({"z-index": cfg.zIndex + 1});
			_isOpen = true;
		};

		/**
		 * @param {Number} index
		 * @public
		 */

		this.jumpToIndex = function(index) {
			cfg.selectbox.get(0).selectedIndex = index;
			$customSelect.find(".selected").removeClass(SELECTED_CLASS);
			$customSelect.find(".itm-" + index).addClass(SELECTED_CLASS);
			_updateValue($customSelect.find(".itm-" + index).html());
		};

		/**
		 * @param {String} value
		 * @returns {Number} index of the value
		 * @public
		 */

		this.jumpToValue = function(value) {
			var index = -1;

			$options.each(function(i) {
				if (this.innerHTML==value){
					index = i;
					return false;
				}
			});

			if (index!=-1){
				self.jumpToIndex(index);
			}

			return index;
		};

		init();
	};
})(jQuery);

/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2015 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.1
*/
!function(factory) {
    "function" == typeof define && define.amd ? define([ "jquery" ], factory) : factory("object" == typeof exports ? require("jquery") : jQuery);
}(function($) {
    var caretTimeoutId, ua = navigator.userAgent, iPhone = /iphone/i.test(ua), chrome = /chrome/i.test(ua), android = /android/i.test(ua);
    $.mask = {
        definitions: {
            "9": "[0-9]",
            a: "[A-Za-z]",
            "*": "[A-Za-z0-9]"
        },
        autoclear: !0,
        dataName: "rawMaskFn",
        placeholder: "_"
    }, $.fn.extend({
        caret: function(begin, end) {
            var range;
            if (0 !== this.length && !this.is(":hidden")) return "number" == typeof begin ? (end = "number" == typeof end ? end : begin, 
            this.each(function() {
                this.setSelectionRange ? this.setSelectionRange(begin, end) : this.createTextRange && (range = this.createTextRange(), 
                range.collapse(!0), range.moveEnd("character", end), range.moveStart("character", begin), 
                range.select());
            })) : (this[0].setSelectionRange ? (begin = this[0].selectionStart, end = this[0].selectionEnd) : document.selection && document.selection.createRange && (range = document.selection.createRange(), 
            begin = 0 - range.duplicate().moveStart("character", -1e5), end = begin + range.text.length), 
            {
                begin: begin,
                end: end
            });
        },
        unmask: function() {
            return this.trigger("unmask");
        },
        mask: function(mask, settings) {
            var input, defs, tests, partialPosition, firstNonMaskPos, lastRequiredNonMaskPos, len, oldVal;
            if (!mask && this.length > 0) {
                input = $(this[0]);
                var fn = input.data($.mask.dataName);
                return fn ? fn() : void 0;
            }
            return settings = $.extend({
                autoclear: $.mask.autoclear,
                placeholder: $.mask.placeholder,
                completed: null
            }, settings), defs = $.mask.definitions, tests = [], partialPosition = len = mask.length, 
            firstNonMaskPos = null, $.each(mask.split(""), function(i, c) {
                "?" == c ? (len--, partialPosition = i) : defs[c] ? (tests.push(new RegExp(defs[c])), 
                null === firstNonMaskPos && (firstNonMaskPos = tests.length - 1), partialPosition > i && (lastRequiredNonMaskPos = tests.length - 1)) : tests.push(null);
            }), this.trigger("unmask").each(function() {
                function tryFireCompleted() {
                    if (settings.completed) {
                        for (var i = firstNonMaskPos; lastRequiredNonMaskPos >= i; i++) if (tests[i] && buffer[i] === getPlaceholder(i)) return;
                        settings.completed.call(input);
                    }
                }
                function getPlaceholder(i) {
                    return settings.placeholder.charAt(i < settings.placeholder.length ? i : 0);
                }
                function seekNext(pos) {
                    for (;++pos < len && !tests[pos]; ) ;
                    return pos;
                }
                function seekPrev(pos) {
                    for (;--pos >= 0 && !tests[pos]; ) ;
                    return pos;
                }
                function shiftL(begin, end) {
                    var i, j;
                    if (!(0 > begin)) {
                        for (i = begin, j = seekNext(end); len > i; i++) if (tests[i]) {
                            if (!(len > j && tests[i].test(buffer[j]))) break;
                            buffer[i] = buffer[j], buffer[j] = getPlaceholder(j), j = seekNext(j);
                        }
                        writeBuffer(), input.caret(Math.max(firstNonMaskPos, begin));
                    }
                }
                function shiftR(pos) {
                    var i, c, j, t;
                    for (i = pos, c = getPlaceholder(pos); len > i; i++) if (tests[i]) {
                        if (j = seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && tests[j].test(t))) break;
                        c = t;
                    }
                }
                function androidInputEvent() {
                    var curVal = input.val(), pos = input.caret();
                    if (oldVal && oldVal.length && oldVal.length > curVal.length) {
                        for (checkVal(!0); pos.begin > 0 && !tests[pos.begin - 1]; ) pos.begin--;
                        if (0 === pos.begin) for (;pos.begin < firstNonMaskPos && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    } else {
                        for (checkVal(!0); pos.begin < len && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    }
                    tryFireCompleted();
                }
                function blurEvent() {
                    checkVal(), input.val() != focusText && input.change();
                }
                function keydownEvent(e) {
                    if (!input.prop("readonly")) {
                        var pos, begin, end, k = e.which || e.keyCode;
                        oldVal = input.val(), 8 === k || 46 === k || iPhone && 127 === k ? (pos = input.caret(), 
                        begin = pos.begin, end = pos.end, end - begin === 0 && (begin = 46 !== k ? seekPrev(begin) : end = seekNext(begin - 1), 
                        end = 46 === k ? seekNext(end) : end), clearBuffer(begin, end), shiftL(begin, end - 1), 
                        e.preventDefault()) : 13 === k ? blurEvent.call(this, e) : 27 === k && (input.val(focusText), 
                        input.caret(0, checkVal()), e.preventDefault());
                    }
                }
                function keypressEvent(e) {
                    if (!input.prop("readonly")) {
                        var p, c, next, k = e.which || e.keyCode, pos = input.caret();
                        if (!(e.ctrlKey || e.altKey || e.metaKey || 32 > k) && k && 13 !== k) {
                            if (pos.end - pos.begin !== 0 && (clearBuffer(pos.begin, pos.end), shiftL(pos.begin, pos.end - 1)), 
                            p = seekNext(pos.begin - 1), len > p && (c = String.fromCharCode(k), tests[p].test(c))) {
                                if (shiftR(p), buffer[p] = c, writeBuffer(), next = seekNext(p), android) {
                                    var proxy = function() {
                                        $.proxy($.fn.caret, input, next)();
                                    };
                                    setTimeout(proxy, 0);
                                } else input.caret(next);
                                pos.begin <= lastRequiredNonMaskPos && tryFireCompleted();
                            }
                            e.preventDefault();
                        }
                    }
                }
                function clearBuffer(start, end) {
                    var i;
                    for (i = start; end > i && len > i; i++) tests[i] && (buffer[i] = getPlaceholder(i));
                }
                function writeBuffer() {
                    input.val(buffer.join(""));
                }
                function checkVal(allow) {
                    var i, c, pos, test = input.val(), lastMatch = -1;
                    for (i = 0, pos = 0; len > i; i++) if (tests[i]) {
                        for (buffer[i] = getPlaceholder(i); pos++ < test.length; ) if (c = test.charAt(pos - 1), 
                        tests[i].test(c)) {
                            buffer[i] = c, lastMatch = i;
                            break;
                        }
                        if (pos > test.length) {
                            clearBuffer(i + 1, len);
                            break;
                        }
                    } else buffer[i] === test.charAt(pos) && pos++, partialPosition > i && (lastMatch = i);
                    return allow ? writeBuffer() : partialPosition > lastMatch + 1 ? settings.autoclear || buffer.join("") === defaultBuffer ? (input.val() && input.val(""), 
                    clearBuffer(0, len)) : writeBuffer() : (writeBuffer(), input.val(input.val().substring(0, lastMatch + 1))), 
                    partialPosition ? i : firstNonMaskPos;
                }
                var input = $(this), buffer = $.map(mask.split(""), function(c, i) {
                    return "?" != c ? defs[c] ? getPlaceholder(i) : c : void 0;
                }), defaultBuffer = buffer.join(""), focusText = input.val();
                input.data($.mask.dataName, function() {
                    return $.map(buffer, function(c, i) {
                        return tests[i] && c != getPlaceholder(i) ? c : null;
                    }).join("");
                }), input.one("unmask", function() {
                    input.off(".mask").removeData($.mask.dataName);
                }).on("focus.mask", function() {
                    if (!input.prop("readonly")) {
                        clearTimeout(caretTimeoutId);
                        var pos;
                        focusText = input.val(), pos = checkVal(), caretTimeoutId = setTimeout(function() {
                            input.get(0) === document.activeElement && (writeBuffer(), pos == mask.replace("?", "").length ? input.caret(0, pos) : input.caret(pos));
                        }, 10);
                    }
                }).on("blur.mask", blurEvent).on("keydown.mask", keydownEvent).on("keypress.mask", keypressEvent).on("input.mask paste.mask", function() {
                    input.prop("readonly") || setTimeout(function() {
                        var pos = checkVal(!0);
                        input.caret(pos), tryFireCompleted();
                    }, 0);
                }), chrome && android && input.off("input.mask").on("input.mask", androidInputEvent), 
                checkVal();
            });
        }
    });
});

jQuery.fn.fsizeGallery = function( options ) {
 
    // Default settings:
    var defaults = {
        delay: 'quite long',
		showFullScreenBtn: false,
		baseSliderClass: 'fscreen',
		activeClass: 'active',
		sliderClass: '-slider-inner',
		titleClass: '-slider-title',
		thumbsClass: '-thumbs',
		fullSizeClass: 'fullscreen',
        animationDuration: 500,
		fullSize: '<a href=""></a>',
		counterSlider: '<span></span>',
		prevBtnTpl: '<a></a>',
		nextBtnTpl: '<a></a>',
		onNextImage: function() {},
		onPrevImage: function() {}
    };
 
    var settings = $.extend( {}, defaults, options );
	settings.sliderClass = settings.baseSliderClass + settings.sliderClass;
	settings.thumbsClass = settings.baseSliderClass + settings.thumbsClass;
	settings.titleClass = settings.baseSliderClass + settings.titleClass;
	
    return this.each(function(index) {
		
        // Plugin code would go here...
		var $this = $(this),
			$win = $(window),
			$slider = $('.' + settings.sliderClass, $this),
			$slides = $('.' + settings.sliderClass + ' li', $this),
			$titles = $('.' + settings.titleClass + ' li', $this),
			slidesW = 0,
			slidesLen = $slides.size(),
			$thumbs = $('.' + settings.thumbsClass + ' li', $this),
			thumbsH = $thumbs.eq(0).outerHeight(true),
			$thumbsPane = $('.' + settings.thumbsClass, $this),
			$thumbsPaneH = $thumbsPane.height(),
			maxElementViews = Math.floor( $thumbsPaneH / $thumbs.eq(0).outerHeight(true) ),
			thumbsTop = 0,
			thumbsLen = $thumbs.size(),
			prev = slidesLen - 1,
			next = 0;
		
		var $prevBtn = $(settings.prevBtnTpl).addClass(settings.baseSliderClass + '-prev-btn'),
			$nextBtn = $(settings.nextBtnTpl).addClass(settings.baseSliderClass + '-next-btn'),
			$counterSlider = $(settings.counterSlider).addClass(settings.baseSliderClass + '-counter'),
			$fullSize = $(settings.fullSize).addClass(settings.baseSliderClass + '-' + settings.fullSizeClass);

		// Error is not equal count slides and thumbs
		if(slidesLen != thumbsLen || slidesLen <= 0 && slidesLen == thumbsLen) {
			console.log("Count slides not equal count thumbs: " + slidesLen + " != " + thumbsLen);
			return true;
		}
		// ************************************************************ //
		
		// Prev, Next btns, Counter slider, Full Screen btn
		$slider.append($prevBtn, $nextBtn, $counterSlider);
		if(settings.showFullScreenBtn) {
			$slider.append($fullSize);
		}
		
		// Set the Events
		$this.on('click', function(e) {
			e.preventDefault();
			var $target = $(e.target);
			if($target.is($prevBtn)) {
				showPrevImage();
			} else if($target.is($nextBtn)) {
				showNextImage();
			} else if($target.is($fullSize)) {
				if($this.hasClass(settings.fullSizeClass)) {
					$this.removeClass(settings.fullSizeClass);
				} else {
					$this.addClass(settings.fullSizeClass);
				}
			} else if($target.is($thumbs)) {
				var idx = $thumbs.index($target);
				prev = next;
				next = idx;
				thumbsDirect($target);
			}
		});
		
		// Set defaults Values
		$slides.each(function(idx) {
			var $this = $(this),
				$thisA = $this.find('a'),
				thisHref = $thisA.attr('href'),
				$thumbsA = $thumbs.eq(idx).find('a'),
				thumbsHref = $thumbsA.attr('href');
			slidesW = $this.width();
			if(idx > 0) {
				$this.css({
					'left': "100%"
				});
				$titles
					.eq(idx)
					.css({
						'opacity': 0.0 
					});
			} else {
				$thumbs
					.eq(idx)
						.addClass(settings.activeClass);
				$titles
					.eq(idx)
						.addClass(settings.activeClass)
					.parent()
						.css({
							'height': $titles.eq(idx).outerHeight(true)
						});
			}
			$thisA.css({
				'background-image': 'url(' + thisHref + ')'
			}).on('click', function(e){
				e.preventDefault();
			});
			$thumbsA.css({
				'background-image': 'url(' + thumbsHref + ')'
			}).on('click', function(e){
				e.preventDefault();
			});
			$counterSlider
				.html((next + 1) + '<i></i>' + slidesLen);
		});
		
		// Slide Animate
		function animateImage(direct) {
			if(direct) {
				$slides
					.eq(prev)
						.css({
							'left': 0
						})
						.animate({
							'left': "100%"
						}, settings.animationDuration)
					.end()
					.eq(next)
						.css({
							'left': "-100%"
						})
						.animate({
							'left': 0
						}, settings.animationDuration);
			} else {
				$slides
					.eq(prev)
						.css({
							'left': 0
						})
						.animate({
							'left': "-100%"
						}, settings.animationDuration)
					.end()
					.eq(next)
						.css({
							'left': "100%"
						})
						.animate({
							'left': 0
						}, settings.animationDuration);
			}
			$titles
				.eq(prev)
					.css({
						'position': 'absolute'
					})
					.animate({
						'opacity': 0.0 
					}, settings.animationDuration, function() {
						$(this).removeClass(settings.activeClass);
					})
				.end()
				.eq(next)
					.css({
						'position': 'relative'
					})
					.animate({
						'opacity': 1.0 
					}, settings.animationDuration, function() {
						$(this)
							.addClass(settings.activeClass);
					});
			$titles
				.eq(next)
					.parent()
					.delay(settings.animationDuration / 2)
					.animate({
						'height': $titles.eq(next).outerHeight(true)
					}, settings.animationDuration);
			$counterSlider
				.html((next + 1) + '<i></i>' + slidesLen);
						
		}
		
		// Thumbs Direct
		function thumbsDirect($target) {
			$thumbs.removeClass(settings.activeClass);
			$target.addClass(settings.activeClass);
			if(next > prev) {
				if(next == (slidesLen - 1) && prev == 0) {
					animateImage(0);
				} else {
					animateImage(1);
				}
			} else if(next != prev) {
				if(next == 0 && prev == (slidesLen - 1)) {
					animateImage(1);
				} else {
					animateImage(0);
				}
			}
			if((slidesLen - maxElementViews) > 0) {
				var delta = ($win.width() < 1024) ? Math.floor($thumbsPaneH / Math.abs($thumbsPane.offset().left - $thumbs.eq(next).offset().left)) : Math.floor($thumbsPaneH / Math.abs($thumbsPane.offset().top - $thumbs.eq(next).offset().top)),
					marginTop = Math.abs(parseInt($thumbsPane.find('ul').css('margin-top')));
				marginTop = marginTop > 0? marginTop : next ;
				thumbsTop = (delta < 2)? ( ((marginTop / thumbsH + 1)  <= (slidesLen - maxElementViews)) ? thumbsTop - thumbsH : thumbsTop) : thumbsTop + thumbsH ;
				thumbsTop = (thumbsTop > 0)? 0: thumbsTop ;
				$thumbsPane
					.find('ul')
					.delay(settings.animationDuration / 6)
					.animate({
						'margin-top': thumbsTop
					}, settings.animationDuration);
			}
		}
		
		// Slide Prev image
		function showPrevImage() {
			var img = getPrevImage();
			//animateImage(1);
			thumbsDirect($thumbs.eq(next));
			settings.onPrevImage.call(img);
		}
		
		// Slide Next image
		function showNextImage() {
			var img = getNextImage();
			//animateImage(0);
			thumbsDirect($thumbs.eq(next));
			settings.onNextImage.call(img);
		}
		
		// Return Prev image index
		function getPrevImage() {
			prev = next;
			if((next - 1) >= 0) {
				next = next - 1;
			} else {
				next = slidesLen - 1;
			}
			return next;
		}
		
		// Return Next image index
		function getNextImage() {
			prev = next;
			if((next + 1) < slidesLen) {
				next = next + 1;
			} else {
				next = 0;
			}
			return next;
		}

    });
 
};

$(document).foundation();

jQuery(function($) {

	// Grab all elements with the class "hasTooltip"
	$('.qtip-tip').each(function() { // Notice the .each() loop, discussed below
		var $this = $(this);
		$(this).qtip({
			content: {
				text: $(this).next('.qtip-titlebar'), // Use the "div" element next to this for the content
				button: 'Закрыть'
			},
		    hide: {
		        event: true,
				delay: 200
		    },
            show: {
                event: 'click',
                delay: 40,
                solo: true
            },
		    position: {
		        my: $this.data('qtip') || 'bottom left',
		        at: $this.data('qtip') || 'bottom left'
		    }
		});
	});

	/**
	* Custom Select
	*/
	$("select.custom").each(function() {					
		var sb = new SelectBox({
			selectbox: $(this),
			height: 150,
			width: 200
		});
	});

	/**
	* Masked Plugin
	*/
	$("#phone").mask("+7(999) 999-99-99");

	/**
	* Mobtop Menu Btn
	*/
	$('.js-mobtop-menu__btn').on('click', function(e) {
		$(this).toggleClass('open');
	});

	/**
	* Set Catalog list view-type
	*/
	(function(){
		var $vt = $('.js-catalog__viewtype'),
			$type = $('.js-catalog-view-type'),
			types = ['catalog--table-view','catalog--list-view','catalog--list-view-sm'],
			$vtA = $('a', $vt),
			$vtI = $('.icons', $vtA);
		
		$vtA.on('click', function(e) {
			e.preventDefault();

			var $this = $(this),
				indx = $vtA.index($this);
			
			$vtI.removeClass('active').eq(indx).addClass('active');

			$type
				.removeClass(function (index, css) {
				    return ( css.match (/(^|\s)catalog--[table|list]\S+/g) || [] ).join(' ');
				})
				.addClass(types[indx]);
		});

	}());
	
	/**
	* 
	*/
	(function() {
		var $orderList = $('input[name^="order-list-"'); 
		
		$orderList.on('change', function(e) {
			e.preventDefault();
			var $this = $(this),
				$nextA = $this.nextAll('a');
			$this.parents('div.row:eq(0)').addClass('loader');
			if($(this).is(':checked')) {
				location.href = $nextA.eq(0).attr('href');
			} else {
				location.href = $nextA.eq(1).attr('href');
			}
		
		});
		
	}());
	
	// Catalog Item Gallery activate
	$('.fscreen').fsizeGallery({
		showFullScreenBtn: true,
		onPrevImage: function(index) {
			// alert("prev image show");
		},
		onNextImage: function(index) {
			// alert("next image show");
		}
	});

});



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5tb3VzZXdoZWVsLmpzIiwialNjcm9sbFBhbmUuanMiLCJTZWxlY3RCb3guanMiLCJqcXVlcnkubWFzay5qcyIsImdhbGxlcnkuanMiLCJhcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNTVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9ZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgQ29weXJpZ2h0IChjKSAyMDExIEJyYW5kb24gQWFyb24gKGh0dHA6Ly9icmFuZG9uYWFyb24ubmV0KVxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKExJQ0VOU0UudHh0KS5cclxuICpcclxuICogVGhhbmtzIHRvOiBodHRwOi8vYWRvbWFzLm9yZy9qYXZhc2NyaXB0LW1vdXNlLXdoZWVsLyBmb3Igc29tZSBwb2ludGVycy5cclxuICogVGhhbmtzIHRvOiBNYXRoaWFzIEJhbmsoaHR0cDovL3d3dy5tYXRoaWFzLWJhbmsuZGUpIGZvciBhIHNjb3BlIGJ1ZyBmaXguXHJcbiAqIFRoYW5rcyB0bzogU2VhbXVzIExlYWh5IGZvciBhZGRpbmcgZGVsdGFYIGFuZCBkZWx0YVlcclxuICpcclxuICogVmVyc2lvbjogMy4wLjZcclxuICogXHJcbiAqIFJlcXVpcmVzOiAxLjIuMitcclxuICovXHJcblxyXG4oZnVuY3Rpb24oJCkge1xyXG5cclxudmFyIHR5cGVzID0gWydET01Nb3VzZVNjcm9sbCcsICdtb3VzZXdoZWVsJ107XHJcblxyXG5pZiAoJC5ldmVudC5maXhIb29rcykge1xyXG4gICAgZm9yICggdmFyIGk9dHlwZXMubGVuZ3RoOyBpOyApIHtcclxuICAgICAgICAkLmV2ZW50LmZpeEhvb2tzWyB0eXBlc1stLWldIF0gPSAkLmV2ZW50Lm1vdXNlSG9va3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbiQuZXZlbnQuc3BlY2lhbC5tb3VzZXdoZWVsID0ge1xyXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICggdGhpcy5hZGRFdmVudExpc3RlbmVyICkge1xyXG4gICAgICAgICAgICBmb3IgKCB2YXIgaT10eXBlcy5sZW5ndGg7IGk7ICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCB0eXBlc1stLWldLCBoYW5kbGVyLCBmYWxzZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5vbm1vdXNld2hlZWwgPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIHRlYXJkb3duOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciApIHtcclxuICAgICAgICAgICAgZm9yICggdmFyIGk9dHlwZXMubGVuZ3RoOyBpOyApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHlwZXNbLS1pXSwgaGFuZGxlciwgZmFsc2UgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMub25tb3VzZXdoZWVsID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG4kLmZuLmV4dGVuZCh7XHJcbiAgICBtb3VzZXdoZWVsOiBmdW5jdGlvbihmbikge1xyXG4gICAgICAgIHJldHVybiBmbiA/IHRoaXMuYmluZChcIm1vdXNld2hlZWxcIiwgZm4pIDogdGhpcy50cmlnZ2VyKFwibW91c2V3aGVlbFwiKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIHVubW91c2V3aGVlbDogZnVuY3Rpb24oZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51bmJpbmQoXCJtb3VzZXdoZWVsXCIsIGZuKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5cclxuZnVuY3Rpb24gaGFuZGxlcihldmVudCkge1xyXG4gICAgdmFyIG9yZ0V2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50LCBhcmdzID0gW10uc2xpY2UuY2FsbCggYXJndW1lbnRzLCAxICksIGRlbHRhID0gMCwgcmV0dXJuVmFsdWUgPSB0cnVlLCBkZWx0YVggPSAwLCBkZWx0YVkgPSAwO1xyXG4gICAgZXZlbnQgPSAkLmV2ZW50LmZpeChvcmdFdmVudCk7XHJcbiAgICBldmVudC50eXBlID0gXCJtb3VzZXdoZWVsXCI7XHJcbiAgICBcclxuICAgIC8vIE9sZCBzY2hvb2wgc2Nyb2xsd2hlZWwgZGVsdGFcclxuICAgIGlmICggb3JnRXZlbnQud2hlZWxEZWx0YSApIHsgZGVsdGEgPSBvcmdFdmVudC53aGVlbERlbHRhLzEyMDsgfVxyXG4gICAgaWYgKCBvcmdFdmVudC5kZXRhaWwgICAgICkgeyBkZWx0YSA9IC1vcmdFdmVudC5kZXRhaWwvMzsgfVxyXG4gICAgXHJcbiAgICAvLyBOZXcgc2Nob29sIG11bHRpZGltZW5zaW9uYWwgc2Nyb2xsICh0b3VjaHBhZHMpIGRlbHRhc1xyXG4gICAgZGVsdGFZID0gZGVsdGE7XHJcbiAgICBcclxuICAgIC8vIEdlY2tvXHJcbiAgICBpZiAoIG9yZ0V2ZW50LmF4aXMgIT09IHVuZGVmaW5lZCAmJiBvcmdFdmVudC5heGlzID09PSBvcmdFdmVudC5IT1JJWk9OVEFMX0FYSVMgKSB7XHJcbiAgICAgICAgZGVsdGFZID0gMDtcclxuICAgICAgICBkZWx0YVggPSAtMSpkZWx0YTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gV2Via2l0XHJcbiAgICBpZiAoIG9yZ0V2ZW50LndoZWVsRGVsdGFZICE9PSB1bmRlZmluZWQgKSB7IGRlbHRhWSA9IG9yZ0V2ZW50LndoZWVsRGVsdGFZLzEyMDsgfVxyXG4gICAgaWYgKCBvcmdFdmVudC53aGVlbERlbHRhWCAhPT0gdW5kZWZpbmVkICkgeyBkZWx0YVggPSAtMSpvcmdFdmVudC53aGVlbERlbHRhWC8xMjA7IH1cclxuICAgIFxyXG4gICAgLy8gQWRkIGV2ZW50IGFuZCBkZWx0YSB0byB0aGUgZnJvbnQgb2YgdGhlIGFyZ3VtZW50c1xyXG4gICAgYXJncy51bnNoaWZ0KGV2ZW50LCBkZWx0YSwgZGVsdGFYLCBkZWx0YVkpO1xyXG4gICAgXHJcbiAgICByZXR1cm4gKCQuZXZlbnQuZGlzcGF0Y2ggfHwgJC5ldmVudC5oYW5kbGUpLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG59XHJcblxyXG59KShqUXVlcnkpO1xyXG4iLCIvKiFcclxuICogalNjcm9sbFBhbmUgLSB2Mi4wLjBiZXRhMTIgLSAyMDEyLTA5LTI3XHJcbiAqIGh0dHA6Ly9qc2Nyb2xscGFuZS5rZWx2aW5sdWNrLmNvbS9cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDEwIEtlbHZpbiBMdWNrXHJcbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgbGljZW5zZXMuXHJcbiAqL1xyXG5cclxuLy8gU2NyaXB0OiBqU2Nyb2xsUGFuZSAtIGNyb3NzIGJyb3dzZXIgY3VzdG9taXNhYmxlIHNjcm9sbGJhcnNcclxuLy9cclxuLy8gKlZlcnNpb246IDIuMC4wYmV0YTEyLCBMYXN0IHVwZGF0ZWQ6IDIwMTItMDktMjcqXHJcbi8vXHJcbi8vIFByb2plY3QgSG9tZSAtIGh0dHA6Ly9qc2Nyb2xscGFuZS5rZWx2aW5sdWNrLmNvbS9cclxuLy8gR2l0SHViICAgICAgIC0gaHR0cDovL2dpdGh1Yi5jb20vdml0Y2gvalNjcm9sbFBhbmVcclxuLy8gU291cmNlICAgICAgIC0gaHR0cDovL2dpdGh1Yi5jb20vdml0Y2gvalNjcm9sbFBhbmUvcmF3L21hc3Rlci9zY3JpcHQvanF1ZXJ5LmpzY3JvbGxwYW5lLmpzXHJcbi8vIChNaW5pZmllZCkgICAtIGh0dHA6Ly9naXRodWIuY29tL3ZpdGNoL2pTY3JvbGxQYW5lL3Jhdy9tYXN0ZXIvc2NyaXB0L2pxdWVyeS5qc2Nyb2xscGFuZS5taW4uanNcclxuLy9cclxuLy8gQWJvdXQ6IExpY2Vuc2VcclxuLy9cclxuLy8gQ29weXJpZ2h0IChjKSAyMDEyIEtlbHZpbiBMdWNrXHJcbi8vIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgVmVyc2lvbiAyIGxpY2Vuc2VzLlxyXG4vLyBodHRwOi8vanNjcm9sbHBhbmUua2VsdmlubHVjay5jb20vTUlULUxJQ0VOU0UudHh0XHJcbi8vIGh0dHA6Ly9qc2Nyb2xscGFuZS5rZWx2aW5sdWNrLmNvbS9HUEwtTElDRU5TRS50eHRcclxuLy9cclxuLy8gQWJvdXQ6IEV4YW1wbGVzXHJcbi8vXHJcbi8vIEFsbCBleGFtcGxlcyBhbmQgZGVtb3MgYXJlIGF2YWlsYWJsZSB0aHJvdWdoIHRoZSBqU2Nyb2xsUGFuZSBleGFtcGxlIHNpdGUgYXQ6XHJcbi8vIGh0dHA6Ly9qc2Nyb2xscGFuZS5rZWx2aW5sdWNrLmNvbS9cclxuLy9cclxuLy8gQWJvdXQ6IFN1cHBvcnQgYW5kIFRlc3RpbmdcclxuLy9cclxuLy8gVGhpcyBwbHVnaW4gaXMgdGVzdGVkIG9uIHRoZSBicm93c2VycyBiZWxvdyBhbmQgaGFzIGJlZW4gZm91bmQgdG8gd29yayByZWxpYWJseSBvbiB0aGVtLiBJZiB5b3UgcnVuXHJcbi8vIGludG8gYSBwcm9ibGVtIG9uIG9uZSBvZiB0aGUgc3VwcG9ydGVkIGJyb3dzZXJzIHRoZW4gcGxlYXNlIHZpc2l0IHRoZSBzdXBwb3J0IHNlY3Rpb24gb24gdGhlIGpTY3JvbGxQYW5lXHJcbi8vIHdlYnNpdGUgKGh0dHA6Ly9qc2Nyb2xscGFuZS5rZWx2aW5sdWNrLmNvbS8pIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGdldHRpbmcgc3VwcG9ydC4gWW91IGFyZSBhbHNvXHJcbi8vIHdlbGNvbWUgdG8gZm9yayB0aGUgcHJvamVjdCBvbiBHaXRIdWIgaWYgeW91IGNhbiBjb250cmlidXRlIGEgZml4IGZvciBhIGdpdmVuIGlzc3VlLiBcclxuLy9cclxuLy8galF1ZXJ5IFZlcnNpb25zIC0gdGVzdGVkIGluIDEuNC4yKyAtIHJlcG9ydGVkIHRvIHdvcmsgaW4gMS4zLnhcclxuLy8gQnJvd3NlcnMgVGVzdGVkIC0gRmlyZWZveCAzLjYuOCwgU2FmYXJpIDUsIE9wZXJhIDEwLjYsIENocm9tZSA1LjAsIElFIDYsIDcsIDhcclxuLy9cclxuLy8gQWJvdXQ6IFJlbGVhc2UgSGlzdG9yeVxyXG4vL1xyXG4vLyAyLjAuMGJldGExMiAtICgyMDEyLTA5LTI3KSBmaXggZm9yIGpRdWVyeSAxLjgrXHJcbi8vIDIuMC4wYmV0YTExIC0gKDIwMTItMDUtMTQpXHJcbi8vIDIuMC4wYmV0YTEwIC0gKDIwMTEtMDQtMTcpIGNsZWFuZXIgcmVxdWlyZWQgc2l6ZSBjYWxjdWxhdGlvbiwgaW1wcm92ZWQga2V5Ym9hcmQgc3VwcG9ydCwgc3RpY2tUb0JvdHRvbS9MZWZ0LCBvdGhlciBzbWFsbCBmaXhlc1xyXG4vLyAyLjAuMGJldGE5IC0gKDIwMTEtMDEtMzEpIG5ldyBBUEkgbWV0aG9kcywgYnVnIGZpeGVzIGFuZCBjb3JyZWN0IGtleWJvYXJkIHN1cHBvcnQgZm9yIEZGL09TWFxyXG4vLyAyLjAuMGJldGE4IC0gKDIwMTEtMDEtMjkpIHRvdWNoc2NyZWVuIHN1cHBvcnQsIGltcHJvdmVkIGtleWJvYXJkIHN1cHBvcnRcclxuLy8gMi4wLjBiZXRhNyAtICgyMDExLTAxLTIzKSBzY3JvbGwgc3BlZWQgY29uc2lzdGVudCAodGhhbmtzIEFpdm8gUGFhcylcclxuLy8gMi4wLjBiZXRhNiAtICgyMDEwLTEyLTA3KSBzY3JvbGxUb0VsZW1lbnQgaG9yaXpvbnRhbCBzdXBwb3J0XHJcbi8vIDIuMC4wYmV0YTUgLSAoMjAxMC0xMC0xOCkgalF1ZXJ5IDEuNC4zIHN1cHBvcnQsIHZhcmlvdXMgYnVnIGZpeGVzXHJcbi8vIDIuMC4wYmV0YTQgLSAoMjAxMC0wOS0xNykgY2xpY2tPblRyYWNrIHN1cHBvcnQsIGJ1ZyBmaXhlc1xyXG4vLyAyLjAuMGJldGEzIC0gKDIwMTAtMDgtMjcpIEhvcml6b250YWwgbW91c2V3aGVlbCwgbXdoZWVsSW50ZW50LCBrZXlib2FyZCBzdXBwb3J0LCBidWcgZml4ZXNcclxuLy8gMi4wLjBiZXRhMiAtICgyMDEwLTA4LTIxKSBCdWcgZml4ZXNcclxuLy8gMi4wLjBiZXRhMSAtICgyMDEwLTA4LTE3KSBSZXdyaXRlIHRvIGZvbGxvdyBtb2Rlcm4gYmVzdCBwcmFjdGljZXMgYW5kIGVuYWJsZSBob3Jpem9udGFsIHNjcm9sbGluZywgaW5pdGlhbGx5IGhpZGRlblxyXG4vL1x0XHRcdFx0XHRcdFx0IGVsZW1lbnRzIGFuZCBkeW5hbWljYWxseSBzaXplZCBlbGVtZW50cy5cclxuLy8gMS54IC0gKDIwMDYtMTItMzEgLSAyMDEwLTA3LTMxKSBJbml0aWFsIHZlcnNpb24sIGhvc3RlZCBhdCBnb29nbGVjb2RlLCBkZXByZWNhdGVkXHJcblxyXG4oZnVuY3Rpb24oJCx3aW5kb3csdW5kZWZpbmVkKXtcclxuXHJcblx0JC5mbi5qU2Nyb2xsUGFuZSA9IGZ1bmN0aW9uKHNldHRpbmdzKVxyXG5cdHtcclxuXHRcdC8vIEpTY3JvbGxQYW5lIFwiY2xhc3NcIiAtIHB1YmxpYyBtZXRob2RzIGFyZSBhdmFpbGFibGUgdGhyb3VnaCAkKCdzZWxlY3RvcicpLmRhdGEoJ2pzcCcpXHJcblx0XHRmdW5jdGlvbiBKU2Nyb2xsUGFuZShlbGVtLCBzKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgc2V0dGluZ3MsIGpzcCA9IHRoaXMsIHBhbmUsIHBhbmVXaWR0aCwgcGFuZUhlaWdodCwgY29udGFpbmVyLCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQsXHJcblx0XHRcdFx0cGVyY2VudEluVmlld0gsIHBlcmNlbnRJblZpZXdWLCBpc1Njcm9sbGFibGVWLCBpc1Njcm9sbGFibGVILCB2ZXJ0aWNhbERyYWcsIGRyYWdNYXhZLFxyXG5cdFx0XHRcdHZlcnRpY2FsRHJhZ1Bvc2l0aW9uLCBob3Jpem9udGFsRHJhZywgZHJhZ01heFgsIGhvcml6b250YWxEcmFnUG9zaXRpb24sXHJcblx0XHRcdFx0dmVydGljYWxCYXIsIHZlcnRpY2FsVHJhY2ssIHNjcm9sbGJhcldpZHRoLCB2ZXJ0aWNhbFRyYWNrSGVpZ2h0LCB2ZXJ0aWNhbERyYWdIZWlnaHQsIGFycm93VXAsIGFycm93RG93bixcclxuXHRcdFx0XHRob3Jpem9udGFsQmFyLCBob3Jpem9udGFsVHJhY2ssIGhvcml6b250YWxUcmFja1dpZHRoLCBob3Jpem9udGFsRHJhZ1dpZHRoLCBhcnJvd0xlZnQsIGFycm93UmlnaHQsXHJcblx0XHRcdFx0cmVpbml0aWFsaXNlSW50ZXJ2YWwsIG9yaWdpbmFsUGFkZGluZywgb3JpZ2luYWxQYWRkaW5nVG90YWxXaWR0aCwgcHJldmlvdXNDb250ZW50V2lkdGgsXHJcblx0XHRcdFx0d2FzQXRUb3AgPSB0cnVlLCB3YXNBdExlZnQgPSB0cnVlLCB3YXNBdEJvdHRvbSA9IGZhbHNlLCB3YXNBdFJpZ2h0ID0gZmFsc2UsXHJcblx0XHRcdFx0b3JpZ2luYWxFbGVtZW50ID0gZWxlbS5jbG9uZShmYWxzZSwgZmFsc2UpLmVtcHR5KCksXHJcblx0XHRcdFx0bXdFdmVudCA9ICQuZm4ubXdoZWVsSW50ZW50ID8gJ213aGVlbEludGVudC5qc3AnIDogJ21vdXNld2hlZWwuanNwJztcclxuXHJcblx0XHRcdG9yaWdpbmFsUGFkZGluZyA9IGVsZW0uY3NzKCdwYWRkaW5nVG9wJykgKyAnICcgK1xyXG5cdFx0XHRcdFx0XHRcdFx0ZWxlbS5jc3MoJ3BhZGRpbmdSaWdodCcpICsgJyAnICtcclxuXHRcdFx0XHRcdFx0XHRcdGVsZW0uY3NzKCdwYWRkaW5nQm90dG9tJykgKyAnICcgK1xyXG5cdFx0XHRcdFx0XHRcdFx0ZWxlbS5jc3MoJ3BhZGRpbmdMZWZ0Jyk7XHJcblx0XHRcdG9yaWdpbmFsUGFkZGluZ1RvdGFsV2lkdGggPSAocGFyc2VJbnQoZWxlbS5jc3MoJ3BhZGRpbmdMZWZ0JyksIDEwKSB8fCAwKSArXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0KHBhcnNlSW50KGVsZW0uY3NzKCdwYWRkaW5nUmlnaHQnKSwgMTApIHx8IDApO1xyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaW5pdGlhbGlzZShzKVxyXG5cdFx0XHR7XHJcblxyXG5cdFx0XHRcdHZhciAvKmZpcnN0Q2hpbGQsIGxhc3RDaGlsZCwgKi9pc01haW50YWluaW5nUG9zaXRvbiwgbGFzdENvbnRlbnRYLCBsYXN0Q29udGVudFksXHJcblx0XHRcdFx0XHRcdGhhc0NvbnRhaW5pbmdTcGFjZUNoYW5nZWQsIG9yaWdpbmFsU2Nyb2xsVG9wLCBvcmlnaW5hbFNjcm9sbExlZnQsXHJcblx0XHRcdFx0XHRcdG1haW50YWluQXRCb3R0b20gPSBmYWxzZSwgbWFpbnRhaW5BdFJpZ2h0ID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdHNldHRpbmdzID0gcztcclxuXHJcblx0XHRcdFx0aWYgKHBhbmUgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0b3JpZ2luYWxTY3JvbGxUb3AgPSBlbGVtLnNjcm9sbFRvcCgpO1xyXG5cdFx0XHRcdFx0b3JpZ2luYWxTY3JvbGxMZWZ0ID0gZWxlbS5zY3JvbGxMZWZ0KCk7XHJcblxyXG5cdFx0XHRcdFx0ZWxlbS5jc3MoXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRvdmVyZmxvdzogJ2hpZGRlbicsXHJcblx0XHRcdFx0XHRcdFx0cGFkZGluZzogMFxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0Ly8gVE9ETzogRGVhbCB3aXRoIHdoZXJlIHdpZHRoLyBoZWlnaHQgaXMgMCBhcyBpdCBwcm9iYWJseSBtZWFucyB0aGUgZWxlbWVudCBpcyBoaWRkZW4gYW5kIHdlIHNob3VsZFxyXG5cdFx0XHRcdFx0Ly8gY29tZSBiYWNrIHRvIGl0IGxhdGVyIGFuZCBjaGVjayBvbmNlIGl0IGlzIHVuaGlkZGVuLi4uXHJcblx0XHRcdFx0XHRwYW5lV2lkdGggPSBlbGVtLmlubmVyV2lkdGgoKSArIG9yaWdpbmFsUGFkZGluZ1RvdGFsV2lkdGg7XHJcblx0XHRcdFx0XHRwYW5lSGVpZ2h0ID0gZWxlbS5pbm5lckhlaWdodCgpO1xyXG5cclxuXHRcdFx0XHRcdGVsZW0ud2lkdGgocGFuZVdpZHRoKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cGFuZSA9ICQoJzxkaXYgY2xhc3M9XCJqc3BQYW5lXCIgLz4nKS5jc3MoJ3BhZGRpbmcnLCBvcmlnaW5hbFBhZGRpbmcpLmFwcGVuZChlbGVtLmNoaWxkcmVuKCkpO1xyXG5cdFx0XHRcdFx0Y29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImpzcENvbnRhaW5lclwiIC8+JylcclxuXHRcdFx0XHRcdFx0LmNzcyh7XHJcblx0XHRcdFx0XHRcdFx0J3dpZHRoJzogcGFuZVdpZHRoICsgJ3B4JyxcclxuXHRcdFx0XHRcdFx0XHQnaGVpZ2h0JzogcGFuZUhlaWdodCArICdweCdcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0KS5hcHBlbmQocGFuZSkuYXBwZW5kVG8oZWxlbSk7XHJcblxyXG5cdFx0XHRcdFx0LypcclxuXHRcdFx0XHRcdC8vIE1vdmUgYW55IG1hcmdpbnMgZnJvbSB0aGUgZmlyc3QgYW5kIGxhc3QgY2hpbGRyZW4gdXAgdG8gdGhlIGNvbnRhaW5lciBzbyB0aGV5IGNhbiBzdGlsbFxyXG5cdFx0XHRcdFx0Ly8gY29sbGFwc2Ugd2l0aCBuZWlnaGJvdXJpbmcgZWxlbWVudHMgYXMgdGhleSB3b3VsZCBiZWZvcmUgalNjcm9sbFBhbmUgXHJcblx0XHRcdFx0XHRmaXJzdENoaWxkID0gcGFuZS5maW5kKCc6Zmlyc3QtY2hpbGQnKTtcclxuXHRcdFx0XHRcdGxhc3RDaGlsZCA9IHBhbmUuZmluZCgnOmxhc3QtY2hpbGQnKTtcclxuXHRcdFx0XHRcdGVsZW0uY3NzKFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0J21hcmdpbi10b3AnOiBmaXJzdENoaWxkLmNzcygnbWFyZ2luLXRvcCcpLFxyXG5cdFx0XHRcdFx0XHRcdCdtYXJnaW4tYm90dG9tJzogbGFzdENoaWxkLmNzcygnbWFyZ2luLWJvdHRvbScpXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRmaXJzdENoaWxkLmNzcygnbWFyZ2luLXRvcCcsIDApO1xyXG5cdFx0XHRcdFx0bGFzdENoaWxkLmNzcygnbWFyZ2luLWJvdHRvbScsIDApO1xyXG5cdFx0XHRcdFx0Ki9cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0ZWxlbS5jc3MoJ3dpZHRoJywgJycpO1xyXG5cclxuXHRcdFx0XHRcdG1haW50YWluQXRCb3R0b20gPSBzZXR0aW5ncy5zdGlja1RvQm90dG9tICYmIGlzQ2xvc2VUb0JvdHRvbSgpO1xyXG5cdFx0XHRcdFx0bWFpbnRhaW5BdFJpZ2h0ICA9IHNldHRpbmdzLnN0aWNrVG9SaWdodCAgJiYgaXNDbG9zZVRvUmlnaHQoKTtcclxuXHJcblx0XHRcdFx0XHRoYXNDb250YWluaW5nU3BhY2VDaGFuZ2VkID0gZWxlbS5pbm5lcldpZHRoKCkgKyBvcmlnaW5hbFBhZGRpbmdUb3RhbFdpZHRoICE9IHBhbmVXaWR0aCB8fCBlbGVtLm91dGVySGVpZ2h0KCkgIT0gcGFuZUhlaWdodDtcclxuXHJcblx0XHRcdFx0XHRpZiAoaGFzQ29udGFpbmluZ1NwYWNlQ2hhbmdlZCkge1xyXG5cdFx0XHRcdFx0XHRwYW5lV2lkdGggPSBlbGVtLmlubmVyV2lkdGgoKSArIG9yaWdpbmFsUGFkZGluZ1RvdGFsV2lkdGg7XHJcblx0XHRcdFx0XHRcdHBhbmVIZWlnaHQgPSBlbGVtLmlubmVySGVpZ2h0KCk7XHJcblx0XHRcdFx0XHRcdGNvbnRhaW5lci5jc3Moe1xyXG5cdFx0XHRcdFx0XHRcdHdpZHRoOiBwYW5lV2lkdGggKyAncHgnLFxyXG5cdFx0XHRcdFx0XHRcdGhlaWdodDogcGFuZUhlaWdodCArICdweCdcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0Ly8gSWYgbm90aGluZyBjaGFuZ2VkIHNpbmNlIGxhc3QgY2hlY2suLi5cclxuXHRcdFx0XHRcdGlmICghaGFzQ29udGFpbmluZ1NwYWNlQ2hhbmdlZCAmJiBwcmV2aW91c0NvbnRlbnRXaWR0aCA9PSBjb250ZW50V2lkdGggJiYgcGFuZS5vdXRlckhlaWdodCgpID09IGNvbnRlbnRIZWlnaHQpIHtcclxuXHRcdFx0XHRcdFx0ZWxlbS53aWR0aChwYW5lV2lkdGgpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRwcmV2aW91c0NvbnRlbnRXaWR0aCA9IGNvbnRlbnRXaWR0aDtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cGFuZS5jc3MoJ3dpZHRoJywgJycpO1xyXG5cdFx0XHRcdFx0ZWxlbS53aWR0aChwYW5lV2lkdGgpO1xyXG5cclxuXHRcdFx0XHRcdGNvbnRhaW5lci5maW5kKCc+LmpzcFZlcnRpY2FsQmFyLD4uanNwSG9yaXpvbnRhbEJhcicpLnJlbW92ZSgpLmVuZCgpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cGFuZS5jc3MoJ292ZXJmbG93JywgJ2F1dG8nKTtcclxuXHRcdFx0XHRpZiAocy5jb250ZW50V2lkdGgpIHtcclxuXHRcdFx0XHRcdGNvbnRlbnRXaWR0aCA9IHMuY29udGVudFdpZHRoO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRjb250ZW50V2lkdGggPSBwYW5lWzBdLnNjcm9sbFdpZHRoO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjb250ZW50SGVpZ2h0ID0gcGFuZVswXS5zY3JvbGxIZWlnaHQ7XHJcblx0XHRcdFx0cGFuZS5jc3MoJ292ZXJmbG93JywgJycpO1xyXG5cclxuXHRcdFx0XHRwZXJjZW50SW5WaWV3SCA9IGNvbnRlbnRXaWR0aCAvIHBhbmVXaWR0aDtcclxuXHRcdFx0XHRwZXJjZW50SW5WaWV3ViA9IGNvbnRlbnRIZWlnaHQgLyBwYW5lSGVpZ2h0O1xyXG5cdFx0XHRcdGlzU2Nyb2xsYWJsZVYgPSBwZXJjZW50SW5WaWV3ViA+IDE7XHJcblxyXG5cdFx0XHRcdGlzU2Nyb2xsYWJsZUggPSBwZXJjZW50SW5WaWV3SCA+IDE7XHJcblxyXG5cdFx0XHRcdC8vY29uc29sZS5sb2cocGFuZVdpZHRoLCBwYW5lSGVpZ2h0LCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQsIHBlcmNlbnRJblZpZXdILCBwZXJjZW50SW5WaWV3ViwgaXNTY3JvbGxhYmxlSCwgaXNTY3JvbGxhYmxlVik7XHJcblxyXG5cdFx0XHRcdGlmICghKGlzU2Nyb2xsYWJsZUggfHwgaXNTY3JvbGxhYmxlVikpIHtcclxuXHRcdFx0XHRcdGVsZW0ucmVtb3ZlQ2xhc3MoJ2pzcFNjcm9sbGFibGUnKTtcclxuXHRcdFx0XHRcdHBhbmUuY3NzKHtcclxuXHRcdFx0XHRcdFx0dG9wOiAwLFxyXG5cdFx0XHRcdFx0XHR3aWR0aDogY29udGFpbmVyLndpZHRoKCkgLSBvcmlnaW5hbFBhZGRpbmdUb3RhbFdpZHRoXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdHJlbW92ZU1vdXNld2hlZWwoKTtcclxuXHRcdFx0XHRcdHJlbW92ZUZvY3VzSGFuZGxlcigpO1xyXG5cdFx0XHRcdFx0cmVtb3ZlS2V5Ym9hcmROYXYoKTtcclxuXHRcdFx0XHRcdHJlbW92ZUNsaWNrT25UcmFjaygpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRlbGVtLmFkZENsYXNzKCdqc3BTY3JvbGxhYmxlJyk7XHJcblxyXG5cdFx0XHRcdFx0aXNNYWludGFpbmluZ1Bvc2l0b24gPSBzZXR0aW5ncy5tYWludGFpblBvc2l0aW9uICYmICh2ZXJ0aWNhbERyYWdQb3NpdGlvbiB8fCBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uKTtcclxuXHRcdFx0XHRcdGlmIChpc01haW50YWluaW5nUG9zaXRvbikge1xyXG5cdFx0XHRcdFx0XHRsYXN0Q29udGVudFggPSBjb250ZW50UG9zaXRpb25YKCk7XHJcblx0XHRcdFx0XHRcdGxhc3RDb250ZW50WSA9IGNvbnRlbnRQb3NpdGlvblkoKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpbml0aWFsaXNlVmVydGljYWxTY3JvbGwoKTtcclxuXHRcdFx0XHRcdGluaXRpYWxpc2VIb3Jpem9udGFsU2Nyb2xsKCk7XHJcblx0XHRcdFx0XHRyZXNpemVTY3JvbGxiYXJzKCk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGlzTWFpbnRhaW5pbmdQb3NpdG9uKSB7XHJcblx0XHRcdFx0XHRcdHNjcm9sbFRvWChtYWludGFpbkF0UmlnaHQgID8gKGNvbnRlbnRXaWR0aCAgLSBwYW5lV2lkdGggKSA6IGxhc3RDb250ZW50WCwgZmFsc2UpO1xyXG5cdFx0XHRcdFx0XHRzY3JvbGxUb1kobWFpbnRhaW5BdEJvdHRvbSA/IChjb250ZW50SGVpZ2h0IC0gcGFuZUhlaWdodCkgOiBsYXN0Q29udGVudFksIGZhbHNlKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpbml0Rm9jdXNIYW5kbGVyKCk7XHJcblx0XHRcdFx0XHRpbml0TW91c2V3aGVlbCgpO1xyXG5cdFx0XHRcdFx0aW5pdFRvdWNoKCk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmIChzZXR0aW5ncy5lbmFibGVLZXlib2FyZE5hdmlnYXRpb24pIHtcclxuXHRcdFx0XHRcdFx0aW5pdEtleWJvYXJkTmF2KCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAoc2V0dGluZ3MuY2xpY2tPblRyYWNrKSB7XHJcblx0XHRcdFx0XHRcdGluaXRDbGlja09uVHJhY2soKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0b2JzZXJ2ZUhhc2goKTtcclxuXHRcdFx0XHRcdGlmIChzZXR0aW5ncy5oaWphY2tJbnRlcm5hbExpbmtzKSB7XHJcblx0XHRcdFx0XHRcdGhpamFja0ludGVybmFsTGlua3MoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChzZXR0aW5ncy5hdXRvUmVpbml0aWFsaXNlICYmICFyZWluaXRpYWxpc2VJbnRlcnZhbCkge1xyXG5cdFx0XHRcdFx0cmVpbml0aWFsaXNlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChcclxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24oKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aW5pdGlhbGlzZShzZXR0aW5ncyk7XHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHNldHRpbmdzLmF1dG9SZWluaXRpYWxpc2VEZWxheVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKCFzZXR0aW5ncy5hdXRvUmVpbml0aWFsaXNlICYmIHJlaW5pdGlhbGlzZUludGVydmFsKSB7XHJcblx0XHRcdFx0XHRjbGVhckludGVydmFsKHJlaW5pdGlhbGlzZUludGVydmFsKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG9yaWdpbmFsU2Nyb2xsVG9wICYmIGVsZW0uc2Nyb2xsVG9wKDApICYmIHNjcm9sbFRvWShvcmlnaW5hbFNjcm9sbFRvcCwgZmFsc2UpO1xyXG5cdFx0XHRcdG9yaWdpbmFsU2Nyb2xsTGVmdCAmJiBlbGVtLnNjcm9sbExlZnQoMCkgJiYgc2Nyb2xsVG9YKG9yaWdpbmFsU2Nyb2xsTGVmdCwgZmFsc2UpO1xyXG5cclxuXHRcdFx0XHRlbGVtLnRyaWdnZXIoJ2pzcC1pbml0aWFsaXNlZCcsIFtpc1Njcm9sbGFibGVIIHx8IGlzU2Nyb2xsYWJsZVZdKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaW5pdGlhbGlzZVZlcnRpY2FsU2Nyb2xsKClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmIChpc1Njcm9sbGFibGVWKSB7XHJcblxyXG5cdFx0XHRcdFx0Y29udGFpbmVyLmFwcGVuZChcclxuXHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcFZlcnRpY2FsQmFyXCIgLz4nKS5hcHBlbmQoXHJcblx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcENhcCBqc3BDYXBUb3BcIiAvPicpLFxyXG5cdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BUcmFja1wiIC8+JykuYXBwZW5kKFxyXG5cdFx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcERyYWdcIiAvPicpLmFwcGVuZChcclxuXHRcdFx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcERyYWdUb3BcIiAvPicpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQkKCc8ZGl2IGNsYXNzPVwianNwRHJhZ0JvdHRvbVwiIC8+JylcclxuXHRcdFx0XHRcdFx0XHRcdClcclxuXHRcdFx0XHRcdFx0XHQpLFxyXG5cdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BDYXAganNwQ2FwQm90dG9tXCIgLz4nKVxyXG5cdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdHZlcnRpY2FsQmFyID0gY29udGFpbmVyLmZpbmQoJz4uanNwVmVydGljYWxCYXInKTtcclxuXHRcdFx0XHRcdHZlcnRpY2FsVHJhY2sgPSB2ZXJ0aWNhbEJhci5maW5kKCc+LmpzcFRyYWNrJyk7XHJcblx0XHRcdFx0XHR2ZXJ0aWNhbERyYWcgPSB2ZXJ0aWNhbFRyYWNrLmZpbmQoJz4uanNwRHJhZycpO1xyXG5cclxuXHRcdFx0XHRcdGlmIChzZXR0aW5ncy5zaG93QXJyb3dzKSB7XHJcblx0XHRcdFx0XHRcdGFycm93VXAgPSAkKCc8YSBjbGFzcz1cImpzcEFycm93IGpzcEFycm93VXBcIiAvPicpLmJpbmQoXHJcblx0XHRcdFx0XHRcdFx0J21vdXNlZG93bi5qc3AnLCBnZXRBcnJvd1Njcm9sbCgwLCAtMSlcclxuXHRcdFx0XHRcdFx0KS5iaW5kKCdjbGljay5qc3AnLCBuaWwpO1xyXG5cdFx0XHRcdFx0XHRhcnJvd0Rvd24gPSAkKCc8YSBjbGFzcz1cImpzcEFycm93IGpzcEFycm93RG93blwiIC8+JykuYmluZChcclxuXHRcdFx0XHRcdFx0XHQnbW91c2Vkb3duLmpzcCcsIGdldEFycm93U2Nyb2xsKDAsIDEpXHJcblx0XHRcdFx0XHRcdCkuYmluZCgnY2xpY2suanNwJywgbmlsKTtcclxuXHRcdFx0XHRcdFx0aWYgKHNldHRpbmdzLmFycm93U2Nyb2xsT25Ib3Zlcikge1xyXG5cdFx0XHRcdFx0XHRcdGFycm93VXAuYmluZCgnbW91c2VvdmVyLmpzcCcsIGdldEFycm93U2Nyb2xsKDAsIC0xLCBhcnJvd1VwKSk7XHJcblx0XHRcdFx0XHRcdFx0YXJyb3dEb3duLmJpbmQoJ21vdXNlb3Zlci5qc3AnLCBnZXRBcnJvd1Njcm9sbCgwLCAxLCBhcnJvd0Rvd24pKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0YXBwZW5kQXJyb3dzKHZlcnRpY2FsVHJhY2ssIHNldHRpbmdzLnZlcnRpY2FsQXJyb3dQb3NpdGlvbnMsIGFycm93VXAsIGFycm93RG93bik7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0dmVydGljYWxUcmFja0hlaWdodCA9IHBhbmVIZWlnaHQ7XHJcblx0XHRcdFx0XHRjb250YWluZXIuZmluZCgnPi5qc3BWZXJ0aWNhbEJhcj4uanNwQ2FwOnZpc2libGUsPi5qc3BWZXJ0aWNhbEJhcj4uanNwQXJyb3cnKS5lYWNoKFxyXG5cdFx0XHRcdFx0XHRmdW5jdGlvbigpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHR2ZXJ0aWNhbFRyYWNrSGVpZ2h0IC09ICQodGhpcykub3V0ZXJIZWlnaHQoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0KTtcclxuXHJcblxyXG5cdFx0XHRcdFx0dmVydGljYWxEcmFnLmhvdmVyKFxyXG5cdFx0XHRcdFx0XHRmdW5jdGlvbigpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHR2ZXJ0aWNhbERyYWcuYWRkQ2xhc3MoJ2pzcEhvdmVyJyk7XHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdHZlcnRpY2FsRHJhZy5yZW1vdmVDbGFzcygnanNwSG92ZXInKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0KS5iaW5kKFxyXG5cdFx0XHRcdFx0XHQnbW91c2Vkb3duLmpzcCcsXHJcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKGUpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHQvLyBTdG9wIElFIGZyb20gYWxsb3dpbmcgdGV4dCBzZWxlY3Rpb25cclxuXHRcdFx0XHRcdFx0XHQkKCdodG1sJykuYmluZCgnZHJhZ3N0YXJ0LmpzcCBzZWxlY3RzdGFydC5qc3AnLCBuaWwpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2ZXJ0aWNhbERyYWcuYWRkQ2xhc3MoJ2pzcEFjdGl2ZScpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgc3RhcnRZID0gZS5wYWdlWSAtIHZlcnRpY2FsRHJhZy5wb3NpdGlvbigpLnRvcDtcclxuXHJcblx0XHRcdFx0XHRcdFx0JCgnaHRtbCcpLmJpbmQoXHJcblx0XHRcdFx0XHRcdFx0XHQnbW91c2Vtb3ZlLmpzcCcsXHJcblx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbihlKVxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdZKGUucGFnZVkgLSBzdGFydFksIGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHQpLmJpbmQoJ21vdXNldXAuanNwIG1vdXNlbGVhdmUuanNwJywgY2FuY2VsRHJhZyk7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0c2l6ZVZlcnRpY2FsU2Nyb2xsYmFyKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBzaXplVmVydGljYWxTY3JvbGxiYXIoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmVydGljYWxUcmFjay5oZWlnaHQodmVydGljYWxUcmFja0hlaWdodCArICdweCcpO1xyXG5cdFx0XHRcdHZlcnRpY2FsRHJhZ1Bvc2l0aW9uID0gMDtcclxuXHRcdFx0XHRzY3JvbGxiYXJXaWR0aCA9IHNldHRpbmdzLnZlcnRpY2FsR3V0dGVyICsgdmVydGljYWxUcmFjay5vdXRlcldpZHRoKCk7XHJcblxyXG5cdFx0XHRcdC8vIE1ha2UgdGhlIHBhbmUgdGhpbm5lciB0byBhbGxvdyBmb3IgdGhlIHZlcnRpY2FsIHNjcm9sbGJhclxyXG5cdFx0XHRcdHBhbmUud2lkdGgocGFuZVdpZHRoIC0gc2Nyb2xsYmFyV2lkdGggLSBvcmlnaW5hbFBhZGRpbmdUb3RhbFdpZHRoKTtcclxuXHJcblx0XHRcdFx0Ly8gQWRkIG1hcmdpbiB0byB0aGUgbGVmdCBvZiB0aGUgcGFuZSBpZiBzY3JvbGxiYXJzIGFyZSBvbiB0aGF0IHNpZGUgKHRvIHBvc2l0aW9uXHJcblx0XHRcdFx0Ly8gdGhlIHNjcm9sbGJhciBvbiB0aGUgbGVmdCBvciByaWdodCBzZXQgaXQncyBsZWZ0IG9yIHJpZ2h0IHByb3BlcnR5IGluIENTUylcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0aWYgKHZlcnRpY2FsQmFyLnBvc2l0aW9uKCkubGVmdCA9PT0gMCkge1xyXG5cdFx0XHRcdFx0XHRwYW5lLmNzcygnbWFyZ2luLWxlZnQnLCBzY3JvbGxiYXJXaWR0aCArICdweCcpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaW5pdGlhbGlzZUhvcml6b250YWxTY3JvbGwoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYgKGlzU2Nyb2xsYWJsZUgpIHtcclxuXHJcblx0XHRcdFx0XHRjb250YWluZXIuYXBwZW5kKFxyXG5cdFx0XHRcdFx0XHQkKCc8ZGl2IGNsYXNzPVwianNwSG9yaXpvbnRhbEJhclwiIC8+JykuYXBwZW5kKFxyXG5cdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BDYXAganNwQ2FwTGVmdFwiIC8+JyksXHJcblx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcFRyYWNrXCIgLz4nKS5hcHBlbmQoXHJcblx0XHRcdFx0XHRcdFx0XHQkKCc8ZGl2IGNsYXNzPVwianNwRHJhZ1wiIC8+JykuYXBwZW5kKFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQkKCc8ZGl2IGNsYXNzPVwianNwRHJhZ0xlZnRcIiAvPicpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQkKCc8ZGl2IGNsYXNzPVwianNwRHJhZ1JpZ2h0XCIgLz4nKVxyXG5cdFx0XHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0XHRcdCksXHJcblx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcENhcCBqc3BDYXBSaWdodFwiIC8+JylcclxuXHRcdFx0XHRcdFx0KVxyXG5cdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRob3Jpem9udGFsQmFyID0gY29udGFpbmVyLmZpbmQoJz4uanNwSG9yaXpvbnRhbEJhcicpO1xyXG5cdFx0XHRcdFx0aG9yaXpvbnRhbFRyYWNrID0gaG9yaXpvbnRhbEJhci5maW5kKCc+LmpzcFRyYWNrJyk7XHJcblx0XHRcdFx0XHRob3Jpem9udGFsRHJhZyA9IGhvcml6b250YWxUcmFjay5maW5kKCc+LmpzcERyYWcnKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoc2V0dGluZ3Muc2hvd0Fycm93cykge1xyXG5cdFx0XHRcdFx0XHRhcnJvd0xlZnQgPSAkKCc8YSBjbGFzcz1cImpzcEFycm93IGpzcEFycm93TGVmdFwiIC8+JykuYmluZChcclxuXHRcdFx0XHRcdFx0XHQnbW91c2Vkb3duLmpzcCcsIGdldEFycm93U2Nyb2xsKC0xLCAwKVxyXG5cdFx0XHRcdFx0XHQpLmJpbmQoJ2NsaWNrLmpzcCcsIG5pbCk7XHJcblx0XHRcdFx0XHRcdGFycm93UmlnaHQgPSAkKCc8YSBjbGFzcz1cImpzcEFycm93IGpzcEFycm93UmlnaHRcIiAvPicpLmJpbmQoXHJcblx0XHRcdFx0XHRcdFx0J21vdXNlZG93bi5qc3AnLCBnZXRBcnJvd1Njcm9sbCgxLCAwKVxyXG5cdFx0XHRcdFx0XHQpLmJpbmQoJ2NsaWNrLmpzcCcsIG5pbCk7XHJcblx0XHRcdFx0XHRcdGlmIChzZXR0aW5ncy5hcnJvd1Njcm9sbE9uSG92ZXIpIHtcclxuXHRcdFx0XHRcdFx0XHRhcnJvd0xlZnQuYmluZCgnbW91c2VvdmVyLmpzcCcsIGdldEFycm93U2Nyb2xsKC0xLCAwLCBhcnJvd0xlZnQpKTtcclxuXHRcdFx0XHRcdFx0XHRhcnJvd1JpZ2h0LmJpbmQoJ21vdXNlb3Zlci5qc3AnLCBnZXRBcnJvd1Njcm9sbCgxLCAwLCBhcnJvd1JpZ2h0KSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0YXBwZW5kQXJyb3dzKGhvcml6b250YWxUcmFjaywgc2V0dGluZ3MuaG9yaXpvbnRhbEFycm93UG9zaXRpb25zLCBhcnJvd0xlZnQsIGFycm93UmlnaHQpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGhvcml6b250YWxEcmFnLmhvdmVyKFxyXG5cdFx0XHRcdFx0XHRmdW5jdGlvbigpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRob3Jpem9udGFsRHJhZy5hZGRDbGFzcygnanNwSG92ZXInKTtcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24oKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcucmVtb3ZlQ2xhc3MoJ2pzcEhvdmVyJyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdCkuYmluZChcclxuXHRcdFx0XHRcdFx0J21vdXNlZG93bi5qc3AnLFxyXG5cdFx0XHRcdFx0XHRmdW5jdGlvbihlKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0Ly8gU3RvcCBJRSBmcm9tIGFsbG93aW5nIHRleHQgc2VsZWN0aW9uXHJcblx0XHRcdFx0XHRcdFx0JCgnaHRtbCcpLmJpbmQoJ2RyYWdzdGFydC5qc3Agc2VsZWN0c3RhcnQuanNwJywgbmlsKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcuYWRkQ2xhc3MoJ2pzcEFjdGl2ZScpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHR2YXIgc3RhcnRYID0gZS5wYWdlWCAtIGhvcml6b250YWxEcmFnLnBvc2l0aW9uKCkubGVmdDtcclxuXHJcblx0XHRcdFx0XHRcdFx0JCgnaHRtbCcpLmJpbmQoXHJcblx0XHRcdFx0XHRcdFx0XHQnbW91c2Vtb3ZlLmpzcCcsXHJcblx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbihlKVxyXG5cdFx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdYKGUucGFnZVggLSBzdGFydFgsIGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHQpLmJpbmQoJ21vdXNldXAuanNwIG1vdXNlbGVhdmUuanNwJywgY2FuY2VsRHJhZyk7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0aG9yaXpvbnRhbFRyYWNrV2lkdGggPSBjb250YWluZXIuaW5uZXJXaWR0aCgpO1xyXG5cdFx0XHRcdFx0c2l6ZUhvcml6b250YWxTY3JvbGxiYXIoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNpemVIb3Jpem9udGFsU2Nyb2xsYmFyKClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNvbnRhaW5lci5maW5kKCc+LmpzcEhvcml6b250YWxCYXI+LmpzcENhcDp2aXNpYmxlLD4uanNwSG9yaXpvbnRhbEJhcj4uanNwQXJyb3cnKS5lYWNoKFxyXG5cdFx0XHRcdFx0ZnVuY3Rpb24oKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRob3Jpem9udGFsVHJhY2tXaWR0aCAtPSAkKHRoaXMpLm91dGVyV2lkdGgoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRob3Jpem9udGFsVHJhY2sud2lkdGgoaG9yaXpvbnRhbFRyYWNrV2lkdGggKyAncHgnKTtcclxuXHRcdFx0XHRob3Jpem9udGFsRHJhZ1Bvc2l0aW9uID0gMDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcmVzaXplU2Nyb2xsYmFycygpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAoaXNTY3JvbGxhYmxlSCAmJiBpc1Njcm9sbGFibGVWKSB7XHJcblx0XHRcdFx0XHR2YXIgaG9yaXpvbnRhbFRyYWNrSGVpZ2h0ID0gaG9yaXpvbnRhbFRyYWNrLm91dGVySGVpZ2h0KCksXHJcblx0XHRcdFx0XHRcdHZlcnRpY2FsVHJhY2tXaWR0aCA9IHZlcnRpY2FsVHJhY2sub3V0ZXJXaWR0aCgpO1xyXG5cdFx0XHRcdFx0dmVydGljYWxUcmFja0hlaWdodCAtPSBob3Jpem9udGFsVHJhY2tIZWlnaHQ7XHJcblx0XHRcdFx0XHQkKGhvcml6b250YWxCYXIpLmZpbmQoJz4uanNwQ2FwOnZpc2libGUsPi5qc3BBcnJvdycpLmVhY2goXHJcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKClcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhvcml6b250YWxUcmFja1dpZHRoICs9ICQodGhpcykub3V0ZXJXaWR0aCgpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0aG9yaXpvbnRhbFRyYWNrV2lkdGggLT0gdmVydGljYWxUcmFja1dpZHRoO1xyXG5cdFx0XHRcdFx0cGFuZUhlaWdodCAtPSB2ZXJ0aWNhbFRyYWNrV2lkdGg7XHJcblx0XHRcdFx0XHRwYW5lV2lkdGggLT0gaG9yaXpvbnRhbFRyYWNrSGVpZ2h0O1xyXG5cdFx0XHRcdFx0aG9yaXpvbnRhbFRyYWNrLnBhcmVudCgpLmFwcGVuZChcclxuXHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcENvcm5lclwiIC8+JykuY3NzKCd3aWR0aCcsIGhvcml6b250YWxUcmFja0hlaWdodCArICdweCcpXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0c2l6ZVZlcnRpY2FsU2Nyb2xsYmFyKCk7XHJcblx0XHRcdFx0XHRzaXplSG9yaXpvbnRhbFNjcm9sbGJhcigpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQvLyByZWZsb3cgY29udGVudFxyXG5cdFx0XHRcdGlmIChpc1Njcm9sbGFibGVIKSB7XHJcblx0XHRcdFx0XHRwYW5lLndpZHRoKChjb250YWluZXIub3V0ZXJXaWR0aCgpIC0gb3JpZ2luYWxQYWRkaW5nVG90YWxXaWR0aCkgKyAncHgnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y29udGVudEhlaWdodCA9IHBhbmUub3V0ZXJIZWlnaHQoKTtcclxuXHRcdFx0XHRwZXJjZW50SW5WaWV3ViA9IGNvbnRlbnRIZWlnaHQgLyBwYW5lSGVpZ2h0O1xyXG5cclxuXHRcdFx0XHRpZiAoaXNTY3JvbGxhYmxlSCkge1xyXG5cdFx0XHRcdFx0aG9yaXpvbnRhbERyYWdXaWR0aCA9IE1hdGguY2VpbCgxIC8gcGVyY2VudEluVmlld0ggKiBob3Jpem9udGFsVHJhY2tXaWR0aCk7XHJcblx0XHRcdFx0XHRpZiAoaG9yaXpvbnRhbERyYWdXaWR0aCA+IHNldHRpbmdzLmhvcml6b250YWxEcmFnTWF4V2lkdGgpIHtcclxuXHRcdFx0XHRcdFx0aG9yaXpvbnRhbERyYWdXaWR0aCA9IHNldHRpbmdzLmhvcml6b250YWxEcmFnTWF4V2lkdGg7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGhvcml6b250YWxEcmFnV2lkdGggPCBzZXR0aW5ncy5ob3Jpem9udGFsRHJhZ01pbldpZHRoKSB7XHJcblx0XHRcdFx0XHRcdGhvcml6b250YWxEcmFnV2lkdGggPSBzZXR0aW5ncy5ob3Jpem9udGFsRHJhZ01pbldpZHRoO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcud2lkdGgoaG9yaXpvbnRhbERyYWdXaWR0aCArICdweCcpO1xyXG5cdFx0XHRcdFx0ZHJhZ01heFggPSBob3Jpem9udGFsVHJhY2tXaWR0aCAtIGhvcml6b250YWxEcmFnV2lkdGg7XHJcblx0XHRcdFx0XHRfcG9zaXRpb25EcmFnWChob3Jpem9udGFsRHJhZ1Bvc2l0aW9uKTsgLy8gVG8gdXBkYXRlIHRoZSBzdGF0ZSBmb3IgdGhlIGFycm93IGJ1dHRvbnNcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGlzU2Nyb2xsYWJsZVYpIHtcclxuXHRcdFx0XHRcdHZlcnRpY2FsRHJhZ0hlaWdodCA9IE1hdGguY2VpbCgxIC8gcGVyY2VudEluVmlld1YgKiB2ZXJ0aWNhbFRyYWNrSGVpZ2h0KTtcclxuXHRcdFx0XHRcdGlmICh2ZXJ0aWNhbERyYWdIZWlnaHQgPiBzZXR0aW5ncy52ZXJ0aWNhbERyYWdNYXhIZWlnaHQpIHtcclxuXHRcdFx0XHRcdFx0dmVydGljYWxEcmFnSGVpZ2h0ID0gc2V0dGluZ3MudmVydGljYWxEcmFnTWF4SGVpZ2h0O1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh2ZXJ0aWNhbERyYWdIZWlnaHQgPCBzZXR0aW5ncy52ZXJ0aWNhbERyYWdNaW5IZWlnaHQpIHtcclxuXHRcdFx0XHRcdFx0dmVydGljYWxEcmFnSGVpZ2h0ID0gc2V0dGluZ3MudmVydGljYWxEcmFnTWluSGVpZ2h0O1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dmVydGljYWxEcmFnLmhlaWdodCh2ZXJ0aWNhbERyYWdIZWlnaHQgKyAncHgnKTtcclxuXHRcdFx0XHRcdGRyYWdNYXhZID0gdmVydGljYWxUcmFja0hlaWdodCAtIHZlcnRpY2FsRHJhZ0hlaWdodDtcclxuXHRcdFx0XHRcdF9wb3NpdGlvbkRyYWdZKHZlcnRpY2FsRHJhZ1Bvc2l0aW9uKTsgLy8gVG8gdXBkYXRlIHRoZSBzdGF0ZSBmb3IgdGhlIGFycm93IGJ1dHRvbnNcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGFwcGVuZEFycm93cyhlbGUsIHAsIGExLCBhMilcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBwMSA9IFwiYmVmb3JlXCIsIHAyID0gXCJhZnRlclwiLCBhVGVtcDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBTbmlmZiBmb3IgbWFjLi4uIElzIHRoZXJlIGEgYmV0dGVyIHdheSB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgYXJyb3dzIHdvdWxkIG5hdHVyYWxseSBhcHBlYXJcclxuXHRcdFx0XHQvLyBhdCB0aGUgdG9wIG9yIHRoZSBib3R0b20gb2YgdGhlIGJhcj9cclxuXHRcdFx0XHRpZiAocCA9PSBcIm9zXCIpIHtcclxuXHRcdFx0XHRcdHAgPSAvTWFjLy50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSkgPyBcImFmdGVyXCIgOiBcInNwbGl0XCI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChwID09IHAxKSB7XHJcblx0XHRcdFx0XHRwMiA9IHA7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChwID09IHAyKSB7XHJcblx0XHRcdFx0XHRwMSA9IHA7XHJcblx0XHRcdFx0XHRhVGVtcCA9IGExO1xyXG5cdFx0XHRcdFx0YTEgPSBhMjtcclxuXHRcdFx0XHRcdGEyID0gYVRlbXA7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRlbGVbcDFdKGExKVtwMl0oYTIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBnZXRBcnJvd1Njcm9sbChkaXJYLCBkaXJZLCBlbGUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24oKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGFycm93U2Nyb2xsKGRpclgsIGRpclksIHRoaXMsIGVsZSk7XHJcblx0XHRcdFx0XHR0aGlzLmJsdXIoKTtcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBhcnJvd1Njcm9sbChkaXJYLCBkaXJZLCBhcnJvdywgZWxlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0YXJyb3cgPSAkKGFycm93KS5hZGRDbGFzcygnanNwQWN0aXZlJyk7XHJcblxyXG5cdFx0XHRcdHZhciBldmUsXHJcblx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0LFxyXG5cdFx0XHRcdFx0aXNGaXJzdCA9IHRydWUsXHJcblx0XHRcdFx0XHRkb1Njcm9sbCA9IGZ1bmN0aW9uKClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0aWYgKGRpclggIT09IDApIHtcclxuXHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlYKGRpclggKiBzZXR0aW5ncy5hcnJvd0J1dHRvblNwZWVkKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpZiAoZGlyWSAhPT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdGpzcC5zY3JvbGxCeVkoZGlyWSAqIHNldHRpbmdzLmFycm93QnV0dG9uU3BlZWQpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdHNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0KGRvU2Nyb2xsLCBpc0ZpcnN0ID8gc2V0dGluZ3MuaW5pdGlhbERlbGF5IDogc2V0dGluZ3MuYXJyb3dSZXBlYXRGcmVxKTtcclxuXHRcdFx0XHRcdFx0aXNGaXJzdCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0fTtcclxuXHJcblx0XHRcdFx0ZG9TY3JvbGwoKTtcclxuXHJcblx0XHRcdFx0ZXZlID0gZWxlID8gJ21vdXNlb3V0LmpzcCcgOiAnbW91c2V1cC5qc3AnO1xyXG5cdFx0XHRcdGVsZSA9IGVsZSB8fCAkKCdodG1sJyk7XHJcblx0XHRcdFx0ZWxlLmJpbmQoXHJcblx0XHRcdFx0XHRldmUsXHJcblx0XHRcdFx0XHRmdW5jdGlvbigpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGFycm93LnJlbW92ZUNsYXNzKCdqc3BBY3RpdmUnKTtcclxuXHRcdFx0XHRcdFx0c2Nyb2xsVGltZW91dCAmJiBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZW91dCk7XHJcblx0XHRcdFx0XHRcdHNjcm9sbFRpbWVvdXQgPSBudWxsO1xyXG5cdFx0XHRcdFx0XHRlbGUudW5iaW5kKGV2ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaW5pdENsaWNrT25UcmFjaygpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZW1vdmVDbGlja09uVHJhY2soKTtcclxuXHRcdFx0XHRpZiAoaXNTY3JvbGxhYmxlVikge1xyXG5cdFx0XHRcdFx0dmVydGljYWxUcmFjay5iaW5kKFxyXG5cdFx0XHRcdFx0XHQnbW91c2Vkb3duLmpzcCcsXHJcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKGUpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoZS5vcmlnaW5hbFRhcmdldCA9PT0gdW5kZWZpbmVkIHx8IGUub3JpZ2luYWxUYXJnZXQgPT0gZS5jdXJyZW50VGFyZ2V0KSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgY2xpY2tlZFRyYWNrID0gJCh0aGlzKSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0b2Zmc2V0ID0gY2xpY2tlZFRyYWNrLm9mZnNldCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRkaXJlY3Rpb24gPSBlLnBhZ2VZIC0gb2Zmc2V0LnRvcCAtIHZlcnRpY2FsRHJhZ1Bvc2l0aW9uLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0LFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpc0ZpcnN0ID0gdHJ1ZSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZG9TY3JvbGwgPSBmdW5jdGlvbigpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgb2Zmc2V0ID0gY2xpY2tlZFRyYWNrLm9mZnNldCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cG9zID0gZS5wYWdlWSAtIG9mZnNldC50b3AgLSB2ZXJ0aWNhbERyYWdIZWlnaHQgLyAyLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGVudERyYWdZID0gcGFuZUhlaWdodCAqIHNldHRpbmdzLnNjcm9sbFBhZ2VQZXJjZW50LFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZHJhZ1kgPSBkcmFnTWF4WSAqIGNvbnRlbnREcmFnWSAvIChjb250ZW50SGVpZ2h0IC0gcGFuZUhlaWdodCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGRpcmVjdGlvbiA8IDApIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh2ZXJ0aWNhbERyYWdQb3NpdGlvbiAtIGRyYWdZID4gcG9zKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGpzcC5zY3JvbGxCeVkoLWNvbnRlbnREcmFnWSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdZKHBvcyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChkaXJlY3Rpb24gPiAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodmVydGljYWxEcmFnUG9zaXRpb24gKyBkcmFnWSA8IHBvcykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlZKGNvbnRlbnREcmFnWSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdZKHBvcyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhbmNlbENsaWNrKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0KGRvU2Nyb2xsLCBpc0ZpcnN0ID8gc2V0dGluZ3MuaW5pdGlhbERlbGF5IDogc2V0dGluZ3MudHJhY2tDbGlja1JlcGVhdEZyZXEpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlzRmlyc3QgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2FuY2VsQ2xpY2sgPSBmdW5jdGlvbigpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0ICYmIGNsZWFyVGltZW91dChzY3JvbGxUaW1lb3V0KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0ID0gbnVsbDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQkKGRvY3VtZW50KS51bmJpbmQoJ21vdXNldXAuanNwJywgY2FuY2VsQ2xpY2spO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHRcdFx0ZG9TY3JvbGwoKTtcclxuXHRcdFx0XHRcdFx0XHRcdCQoZG9jdW1lbnQpLmJpbmQoJ21vdXNldXAuanNwJywgY2FuY2VsQ2xpY2spO1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKGlzU2Nyb2xsYWJsZUgpIHtcclxuXHRcdFx0XHRcdGhvcml6b250YWxUcmFjay5iaW5kKFxyXG5cdFx0XHRcdFx0XHQnbW91c2Vkb3duLmpzcCcsXHJcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKGUpXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRpZiAoZS5vcmlnaW5hbFRhcmdldCA9PT0gdW5kZWZpbmVkIHx8IGUub3JpZ2luYWxUYXJnZXQgPT0gZS5jdXJyZW50VGFyZ2V0KSB7XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgY2xpY2tlZFRyYWNrID0gJCh0aGlzKSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0b2Zmc2V0ID0gY2xpY2tlZFRyYWNrLm9mZnNldCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRkaXJlY3Rpb24gPSBlLnBhZ2VYIC0gb2Zmc2V0LmxlZnQgLSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0LFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpc0ZpcnN0ID0gdHJ1ZSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZG9TY3JvbGwgPSBmdW5jdGlvbigpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgb2Zmc2V0ID0gY2xpY2tlZFRyYWNrLm9mZnNldCgpLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cG9zID0gZS5wYWdlWCAtIG9mZnNldC5sZWZ0IC0gaG9yaXpvbnRhbERyYWdXaWR0aCAvIDIsXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb250ZW50RHJhZ1ggPSBwYW5lV2lkdGggKiBzZXR0aW5ncy5zY3JvbGxQYWdlUGVyY2VudCxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRyYWdYID0gZHJhZ01heFggKiBjb250ZW50RHJhZ1ggLyAoY29udGVudFdpZHRoIC0gcGFuZVdpZHRoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoZGlyZWN0aW9uIDwgMCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGhvcml6b250YWxEcmFnUG9zaXRpb24gLSBkcmFnWCA+IHBvcykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlYKC1jb250ZW50RHJhZ1gpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cG9zaXRpb25EcmFnWChwb3MpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZGlyZWN0aW9uID4gMCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGhvcml6b250YWxEcmFnUG9zaXRpb24gKyBkcmFnWCA8IHBvcykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlYKGNvbnRlbnREcmFnWCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdYKHBvcyk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhbmNlbENsaWNrKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0KGRvU2Nyb2xsLCBpc0ZpcnN0ID8gc2V0dGluZ3MuaW5pdGlhbERlbGF5IDogc2V0dGluZ3MudHJhY2tDbGlja1JlcGVhdEZyZXEpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlzRmlyc3QgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0Y2FuY2VsQ2xpY2sgPSBmdW5jdGlvbigpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0ICYmIGNsZWFyVGltZW91dChzY3JvbGxUaW1lb3V0KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0ID0gbnVsbDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHQkKGRvY3VtZW50KS51bmJpbmQoJ21vdXNldXAuanNwJywgY2FuY2VsQ2xpY2spO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0XHRcdFx0ZG9TY3JvbGwoKTtcclxuXHRcdFx0XHRcdFx0XHRcdCQoZG9jdW1lbnQpLmJpbmQoJ21vdXNldXAuanNwJywgY2FuY2VsQ2xpY2spO1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHJlbW92ZUNsaWNrT25UcmFjaygpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAoaG9yaXpvbnRhbFRyYWNrKSB7XHJcblx0XHRcdFx0XHRob3Jpem9udGFsVHJhY2sudW5iaW5kKCdtb3VzZWRvd24uanNwJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmICh2ZXJ0aWNhbFRyYWNrKSB7XHJcblx0XHRcdFx0XHR2ZXJ0aWNhbFRyYWNrLnVuYmluZCgnbW91c2Vkb3duLmpzcCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gY2FuY2VsRHJhZygpXHJcblx0XHRcdHtcclxuXHRcdFx0XHQkKCdodG1sJykudW5iaW5kKCdkcmFnc3RhcnQuanNwIHNlbGVjdHN0YXJ0LmpzcCBtb3VzZW1vdmUuanNwIG1vdXNldXAuanNwIG1vdXNlbGVhdmUuanNwJyk7XHJcblxyXG5cdFx0XHRcdGlmICh2ZXJ0aWNhbERyYWcpIHtcclxuXHRcdFx0XHRcdHZlcnRpY2FsRHJhZy5yZW1vdmVDbGFzcygnanNwQWN0aXZlJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChob3Jpem9udGFsRHJhZykge1xyXG5cdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcucmVtb3ZlQ2xhc3MoJ2pzcEFjdGl2ZScpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcG9zaXRpb25EcmFnWShkZXN0WSwgYW5pbWF0ZSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmICghaXNTY3JvbGxhYmxlVikge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGVzdFkgPCAwKSB7XHJcblx0XHRcdFx0XHRkZXN0WSA9IDA7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChkZXN0WSA+IGRyYWdNYXhZKSB7XHJcblx0XHRcdFx0XHRkZXN0WSA9IGRyYWdNYXhZO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gY2FuJ3QganVzdCBjaGVjayBpZihhbmltYXRlKSBiZWNhdXNlIGZhbHNlIGlzIGEgdmFsaWQgdmFsdWUgdGhhdCBjb3VsZCBiZSBwYXNzZWQgaW4uLi5cclxuXHRcdFx0XHRpZiAoYW5pbWF0ZSA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRhbmltYXRlID0gc2V0dGluZ3MuYW5pbWF0ZVNjcm9sbDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGFuaW1hdGUpIHtcclxuXHRcdFx0XHRcdGpzcC5hbmltYXRlKHZlcnRpY2FsRHJhZywgJ3RvcCcsIGRlc3RZLFx0X3Bvc2l0aW9uRHJhZ1kpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR2ZXJ0aWNhbERyYWcuY3NzKCd0b3AnLCBkZXN0WSk7XHJcblx0XHRcdFx0XHRfcG9zaXRpb25EcmFnWShkZXN0WSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gX3Bvc2l0aW9uRHJhZ1koZGVzdFkpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAoZGVzdFkgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0ZGVzdFkgPSB2ZXJ0aWNhbERyYWcucG9zaXRpb24oKS50b3A7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRjb250YWluZXIuc2Nyb2xsVG9wKDApO1xyXG5cdFx0XHRcdHZlcnRpY2FsRHJhZ1Bvc2l0aW9uID0gZGVzdFk7XHJcblxyXG5cdFx0XHRcdHZhciBpc0F0VG9wID0gdmVydGljYWxEcmFnUG9zaXRpb24gPT09IDAsXHJcblx0XHRcdFx0XHRpc0F0Qm90dG9tID0gdmVydGljYWxEcmFnUG9zaXRpb24gPT0gZHJhZ01heFksXHJcblx0XHRcdFx0XHRwZXJjZW50U2Nyb2xsZWQgPSBkZXN0WS8gZHJhZ01heFksXHJcblx0XHRcdFx0XHRkZXN0VG9wID0gLXBlcmNlbnRTY3JvbGxlZCAqIChjb250ZW50SGVpZ2h0IC0gcGFuZUhlaWdodCk7XHJcblxyXG5cdFx0XHRcdGlmICh3YXNBdFRvcCAhPSBpc0F0VG9wIHx8IHdhc0F0Qm90dG9tICE9IGlzQXRCb3R0b20pIHtcclxuXHRcdFx0XHRcdHdhc0F0VG9wID0gaXNBdFRvcDtcclxuXHRcdFx0XHRcdHdhc0F0Qm90dG9tID0gaXNBdEJvdHRvbTtcclxuXHRcdFx0XHRcdGVsZW0udHJpZ2dlcignanNwLWFycm93LWNoYW5nZScsIFt3YXNBdFRvcCwgd2FzQXRCb3R0b20sIHdhc0F0TGVmdCwgd2FzQXRSaWdodF0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR1cGRhdGVWZXJ0aWNhbEFycm93cyhpc0F0VG9wLCBpc0F0Qm90dG9tKTtcclxuXHRcdFx0XHRwYW5lLmNzcygndG9wJywgZGVzdFRvcCk7XHJcblx0XHRcdFx0ZWxlbS50cmlnZ2VyKCdqc3Atc2Nyb2xsLXknLCBbLWRlc3RUb3AsIGlzQXRUb3AsIGlzQXRCb3R0b21dKS50cmlnZ2VyKCdzY3JvbGwnKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcG9zaXRpb25EcmFnWChkZXN0WCwgYW5pbWF0ZSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmICghaXNTY3JvbGxhYmxlSCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGVzdFggPCAwKSB7XHJcblx0XHRcdFx0XHRkZXN0WCA9IDA7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChkZXN0WCA+IGRyYWdNYXhYKSB7XHJcblx0XHRcdFx0XHRkZXN0WCA9IGRyYWdNYXhYO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGFuaW1hdGUgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0YW5pbWF0ZSA9IHNldHRpbmdzLmFuaW1hdGVTY3JvbGw7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChhbmltYXRlKSB7XHJcblx0XHRcdFx0XHRqc3AuYW5pbWF0ZShob3Jpem9udGFsRHJhZywgJ2xlZnQnLCBkZXN0WCxcdF9wb3NpdGlvbkRyYWdYKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcuY3NzKCdsZWZ0JywgZGVzdFgpO1xyXG5cdFx0XHRcdFx0X3Bvc2l0aW9uRHJhZ1goZGVzdFgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gX3Bvc2l0aW9uRHJhZ1goZGVzdFgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAoZGVzdFggPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0ZGVzdFggPSBob3Jpem9udGFsRHJhZy5wb3NpdGlvbigpLmxlZnQ7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRjb250YWluZXIuc2Nyb2xsVG9wKDApO1xyXG5cdFx0XHRcdGhvcml6b250YWxEcmFnUG9zaXRpb24gPSBkZXN0WDtcclxuXHJcblx0XHRcdFx0dmFyIGlzQXRMZWZ0ID0gaG9yaXpvbnRhbERyYWdQb3NpdGlvbiA9PT0gMCxcclxuXHRcdFx0XHRcdGlzQXRSaWdodCA9IGhvcml6b250YWxEcmFnUG9zaXRpb24gPT0gZHJhZ01heFgsXHJcblx0XHRcdFx0XHRwZXJjZW50U2Nyb2xsZWQgPSBkZXN0WCAvIGRyYWdNYXhYLFxyXG5cdFx0XHRcdFx0ZGVzdExlZnQgPSAtcGVyY2VudFNjcm9sbGVkICogKGNvbnRlbnRXaWR0aCAtIHBhbmVXaWR0aCk7XHJcblxyXG5cdFx0XHRcdGlmICh3YXNBdExlZnQgIT0gaXNBdExlZnQgfHwgd2FzQXRSaWdodCAhPSBpc0F0UmlnaHQpIHtcclxuXHRcdFx0XHRcdHdhc0F0TGVmdCA9IGlzQXRMZWZ0O1xyXG5cdFx0XHRcdFx0d2FzQXRSaWdodCA9IGlzQXRSaWdodDtcclxuXHRcdFx0XHRcdGVsZW0udHJpZ2dlcignanNwLWFycm93LWNoYW5nZScsIFt3YXNBdFRvcCwgd2FzQXRCb3R0b20sIHdhc0F0TGVmdCwgd2FzQXRSaWdodF0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR1cGRhdGVIb3Jpem9udGFsQXJyb3dzKGlzQXRMZWZ0LCBpc0F0UmlnaHQpO1xyXG5cdFx0XHRcdHBhbmUuY3NzKCdsZWZ0JywgZGVzdExlZnQpO1xyXG5cdFx0XHRcdGVsZW0udHJpZ2dlcignanNwLXNjcm9sbC14JywgWy1kZXN0TGVmdCwgaXNBdExlZnQsIGlzQXRSaWdodF0pLnRyaWdnZXIoJ3Njcm9sbCcpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiB1cGRhdGVWZXJ0aWNhbEFycm93cyhpc0F0VG9wLCBpc0F0Qm90dG9tKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYgKHNldHRpbmdzLnNob3dBcnJvd3MpIHtcclxuXHRcdFx0XHRcdGFycm93VXBbaXNBdFRvcCA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXSgnanNwRGlzYWJsZWQnKTtcclxuXHRcdFx0XHRcdGFycm93RG93bltpc0F0Qm90dG9tID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKCdqc3BEaXNhYmxlZCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gdXBkYXRlSG9yaXpvbnRhbEFycm93cyhpc0F0TGVmdCwgaXNBdFJpZ2h0KVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYgKHNldHRpbmdzLnNob3dBcnJvd3MpIHtcclxuXHRcdFx0XHRcdGFycm93TGVmdFtpc0F0TGVmdCA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXSgnanNwRGlzYWJsZWQnKTtcclxuXHRcdFx0XHRcdGFycm93UmlnaHRbaXNBdFJpZ2h0ID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKCdqc3BEaXNhYmxlZCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gc2Nyb2xsVG9ZKGRlc3RZLCBhbmltYXRlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHBlcmNlbnRTY3JvbGxlZCA9IGRlc3RZIC8gKGNvbnRlbnRIZWlnaHQgLSBwYW5lSGVpZ2h0KTtcclxuXHRcdFx0XHRwb3NpdGlvbkRyYWdZKHBlcmNlbnRTY3JvbGxlZCAqIGRyYWdNYXhZLCBhbmltYXRlKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gc2Nyb2xsVG9YKGRlc3RYLCBhbmltYXRlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHBlcmNlbnRTY3JvbGxlZCA9IGRlc3RYIC8gKGNvbnRlbnRXaWR0aCAtIHBhbmVXaWR0aCk7XHJcblx0XHRcdFx0cG9zaXRpb25EcmFnWChwZXJjZW50U2Nyb2xsZWQgKiBkcmFnTWF4WCwgYW5pbWF0ZSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHNjcm9sbFRvRWxlbWVudChlbGUsIHN0aWNrVG9Ub3AsIGFuaW1hdGUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgZSwgZWxlSGVpZ2h0LCBlbGVXaWR0aCwgZWxlVG9wID0gMCwgZWxlTGVmdCA9IDAsIHZpZXdwb3J0VG9wLCB2aWV3cG9ydExlZnQsIG1heFZpc2libGVFbGVUb3AsIG1heFZpc2libGVFbGVMZWZ0LCBkZXN0WSwgZGVzdFg7XHJcblxyXG5cdFx0XHRcdC8vIExlZ2FsIGhhc2ggdmFsdWVzIGFyZW4ndCBuZWNlc3NhcmlseSBsZWdhbCBqUXVlcnkgc2VsZWN0b3JzIHNvIHdlIG5lZWQgdG8gY2F0Y2ggYW55XHJcblx0XHRcdFx0Ly8gZXJyb3JzIGZyb20gdGhlIGxvb2t1cC4uLlxyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRlID0gJChlbGUpO1xyXG5cdFx0XHRcdH0gY2F0Y2ggKGVycikge1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbGVIZWlnaHQgPSBlLm91dGVySGVpZ2h0KCk7XHJcblx0XHRcdFx0ZWxlV2lkdGg9IGUub3V0ZXJXaWR0aCgpO1xyXG5cclxuXHRcdFx0XHRjb250YWluZXIuc2Nyb2xsVG9wKDApO1xyXG5cdFx0XHRcdGNvbnRhaW5lci5zY3JvbGxMZWZ0KDApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdC8vIGxvb3AgdGhyb3VnaCBwYXJlbnRzIGFkZGluZyB0aGUgb2Zmc2V0IHRvcCBvZiBhbnkgZWxlbWVudHMgdGhhdCBhcmUgcmVsYXRpdmVseSBwb3NpdGlvbmVkIGJldHdlZW5cclxuXHRcdFx0XHQvLyB0aGUgZm9jdXNlZCBlbGVtZW50IGFuZCB0aGUganNwUGFuZSBzbyB3ZSBjYW4gZ2V0IHRoZSB0cnVlIGRpc3RhbmNlIGZyb20gdGhlIHRvcFxyXG5cdFx0XHRcdC8vIG9mIHRoZSBmb2N1c2VkIGVsZW1lbnQgdG8gdGhlIHRvcCBvZiB0aGUgc2Nyb2xscGFuZS4uLlxyXG5cdFx0XHRcdHdoaWxlICghZS5pcygnLmpzcFBhbmUnKSkge1xyXG5cdFx0XHRcdFx0ZWxlVG9wICs9IGUucG9zaXRpb24oKS50b3A7XHJcblx0XHRcdFx0XHRlbGVMZWZ0ICs9IGUucG9zaXRpb24oKS5sZWZ0O1xyXG5cdFx0XHRcdFx0ZSA9IGUub2Zmc2V0UGFyZW50KCk7XHJcblx0XHRcdFx0XHRpZiAoL15ib2R5fGh0bWwkL2kudGVzdChlWzBdLm5vZGVOYW1lKSkge1xyXG5cdFx0XHRcdFx0XHQvLyB3ZSBlbmRlZCB1cCB0b28gaGlnaCBpbiB0aGUgZG9jdW1lbnQgc3RydWN0dXJlLiBRdWl0IVxyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR2aWV3cG9ydFRvcCA9IGNvbnRlbnRQb3NpdGlvblkoKTtcclxuXHRcdFx0XHRtYXhWaXNpYmxlRWxlVG9wID0gdmlld3BvcnRUb3AgKyBwYW5lSGVpZ2h0O1xyXG5cdFx0XHRcdGlmIChlbGVUb3AgPCB2aWV3cG9ydFRvcCB8fCBzdGlja1RvVG9wKSB7IC8vIGVsZW1lbnQgaXMgYWJvdmUgdmlld3BvcnRcclxuXHRcdFx0XHRcdGRlc3RZID0gZWxlVG9wIC0gc2V0dGluZ3MudmVydGljYWxHdXR0ZXI7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChlbGVUb3AgKyBlbGVIZWlnaHQgPiBtYXhWaXNpYmxlRWxlVG9wKSB7IC8vIGVsZW1lbnQgaXMgYmVsb3cgdmlld3BvcnRcclxuXHRcdFx0XHRcdGRlc3RZID0gZWxlVG9wIC0gcGFuZUhlaWdodCArIGVsZUhlaWdodCArIHNldHRpbmdzLnZlcnRpY2FsR3V0dGVyO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZGVzdFkpIHtcclxuXHRcdFx0XHRcdHNjcm9sbFRvWShkZXN0WSwgYW5pbWF0ZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZpZXdwb3J0TGVmdCA9IGNvbnRlbnRQb3NpdGlvblgoKTtcclxuXHQgICAgICAgICAgICBtYXhWaXNpYmxlRWxlTGVmdCA9IHZpZXdwb3J0TGVmdCArIHBhbmVXaWR0aDtcclxuXHQgICAgICAgICAgICBpZiAoZWxlTGVmdCA8IHZpZXdwb3J0TGVmdCB8fCBzdGlja1RvVG9wKSB7IC8vIGVsZW1lbnQgaXMgdG8gdGhlIGxlZnQgb2Ygdmlld3BvcnRcclxuXHQgICAgICAgICAgICAgICAgZGVzdFggPSBlbGVMZWZ0IC0gc2V0dGluZ3MuaG9yaXpvbnRhbEd1dHRlcjtcclxuXHQgICAgICAgICAgICB9IGVsc2UgaWYgKGVsZUxlZnQgKyBlbGVXaWR0aCA+IG1heFZpc2libGVFbGVMZWZ0KSB7IC8vIGVsZW1lbnQgaXMgdG8gdGhlIHJpZ2h0IHZpZXdwb3J0XHJcblx0ICAgICAgICAgICAgICAgIGRlc3RYID0gZWxlTGVmdCAtIHBhbmVXaWR0aCArIGVsZVdpZHRoICsgc2V0dGluZ3MuaG9yaXpvbnRhbEd1dHRlcjtcclxuXHQgICAgICAgICAgICB9XHJcblx0ICAgICAgICAgICAgaWYgKGRlc3RYKSB7XHJcblx0ICAgICAgICAgICAgICAgIHNjcm9sbFRvWChkZXN0WCwgYW5pbWF0ZSk7XHJcblx0ICAgICAgICAgICAgfVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gY29udGVudFBvc2l0aW9uWCgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXR1cm4gLXBhbmUucG9zaXRpb24oKS5sZWZ0O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBjb250ZW50UG9zaXRpb25ZKClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldHVybiAtcGFuZS5wb3NpdGlvbigpLnRvcDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaXNDbG9zZVRvQm90dG9tKClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBzY3JvbGxhYmxlSGVpZ2h0ID0gY29udGVudEhlaWdodCAtIHBhbmVIZWlnaHQ7XHJcblx0XHRcdFx0cmV0dXJuIChzY3JvbGxhYmxlSGVpZ2h0ID4gMjApICYmIChzY3JvbGxhYmxlSGVpZ2h0IC0gY29udGVudFBvc2l0aW9uWSgpIDwgMTApO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBpc0Nsb3NlVG9SaWdodCgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgc2Nyb2xsYWJsZVdpZHRoID0gY29udGVudFdpZHRoIC0gcGFuZVdpZHRoO1xyXG5cdFx0XHRcdHJldHVybiAoc2Nyb2xsYWJsZVdpZHRoID4gMjApICYmIChzY3JvbGxhYmxlV2lkdGggLSBjb250ZW50UG9zaXRpb25YKCkgPCAxMCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGluaXRNb3VzZXdoZWVsKClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNvbnRhaW5lci51bmJpbmQobXdFdmVudCkuYmluZChcclxuXHRcdFx0XHRcdG13RXZlbnQsXHJcblx0XHRcdFx0XHRmdW5jdGlvbiAoZXZlbnQsIGRlbHRhLCBkZWx0YVgsIGRlbHRhWSkge1xyXG5cdFx0XHRcdFx0XHR2YXIgZFggPSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uLCBkWSA9IHZlcnRpY2FsRHJhZ1Bvc2l0aW9uO1xyXG5cdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnkoZGVsdGFYICogc2V0dGluZ3MubW91c2VXaGVlbFNwZWVkLCAtZGVsdGFZICogc2V0dGluZ3MubW91c2VXaGVlbFNwZWVkLCBmYWxzZSk7XHJcblx0XHRcdFx0XHRcdC8vIHJldHVybiB0cnVlIGlmIHRoZXJlIHdhcyBubyBtb3ZlbWVudCBzbyByZXN0IG9mIHNjcmVlbiBjYW4gc2Nyb2xsXHJcblx0XHRcdFx0XHRcdHJldHVybiBkWCA9PSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uICYmIGRZID09IHZlcnRpY2FsRHJhZ1Bvc2l0aW9uO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHJlbW92ZU1vdXNld2hlZWwoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y29udGFpbmVyLnVuYmluZChtd0V2ZW50KTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gbmlsKClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaW5pdEZvY3VzSGFuZGxlcigpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRwYW5lLmZpbmQoJzppbnB1dCxhJykudW5iaW5kKCdmb2N1cy5qc3AnKS5iaW5kKFxyXG5cdFx0XHRcdFx0J2ZvY3VzLmpzcCcsXHJcblx0XHRcdFx0XHRmdW5jdGlvbihlKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRzY3JvbGxUb0VsZW1lbnQoZS50YXJnZXQsIGZhbHNlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiByZW1vdmVGb2N1c0hhbmRsZXIoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cGFuZS5maW5kKCc6aW5wdXQsYScpLnVuYmluZCgnZm9jdXMuanNwJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZ1bmN0aW9uIGluaXRLZXlib2FyZE5hdigpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIga2V5RG93biwgZWxlbWVudEhhc1Njcm9sbGVkLCB2YWxpZFBhcmVudHMgPSBbXTtcclxuXHRcdFx0XHRpc1Njcm9sbGFibGVIICYmIHZhbGlkUGFyZW50cy5wdXNoKGhvcml6b250YWxCYXJbMF0pO1xyXG5cdFx0XHRcdGlzU2Nyb2xsYWJsZVYgJiYgdmFsaWRQYXJlbnRzLnB1c2godmVydGljYWxCYXJbMF0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdC8vIElFIGFsc28gZm9jdXNlcyBlbGVtZW50cyB0aGF0IGRvbid0IGhhdmUgdGFiaW5kZXggc2V0LlxyXG5cdFx0XHRcdHBhbmUuZm9jdXMoXHJcblx0XHRcdFx0XHRmdW5jdGlvbigpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGVsZW0uZm9jdXMoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHQpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGVsZW0uYXR0cigndGFiaW5kZXgnLCAwKVxyXG5cdFx0XHRcdFx0LnVuYmluZCgna2V5ZG93bi5qc3Aga2V5cHJlc3MuanNwJylcclxuXHRcdFx0XHRcdC5iaW5kKFxyXG5cdFx0XHRcdFx0XHQna2V5ZG93bi5qc3AnLFxyXG5cdFx0XHRcdFx0XHRmdW5jdGlvbihlKVxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGUudGFyZ2V0ICE9PSB0aGlzICYmICEodmFsaWRQYXJlbnRzLmxlbmd0aCAmJiAkKGUudGFyZ2V0KS5jbG9zZXN0KHZhbGlkUGFyZW50cykubGVuZ3RoKSl7XHJcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdHZhciBkWCA9IGhvcml6b250YWxEcmFnUG9zaXRpb24sIGRZID0gdmVydGljYWxEcmFnUG9zaXRpb247XHJcblx0XHRcdFx0XHRcdFx0c3dpdGNoKGUua2V5Q29kZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSA0MDogLy8gZG93blxyXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSAzODogLy8gdXBcclxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgMzQ6IC8vIHBhZ2UgZG93blxyXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSAzMjogLy8gc3BhY2VcclxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgMzM6IC8vIHBhZ2UgdXBcclxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgMzk6IC8vIHJpZ2h0XHJcblx0XHRcdFx0XHRcdFx0XHRjYXNlIDM3OiAvLyBsZWZ0XHJcblx0XHRcdFx0XHRcdFx0XHRcdGtleURvd24gPSBlLmtleUNvZGU7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGtleURvd25IYW5kbGVyKCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSAzNTogLy8gZW5kXHJcblx0XHRcdFx0XHRcdFx0XHRcdHNjcm9sbFRvWShjb250ZW50SGVpZ2h0IC0gcGFuZUhlaWdodCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGtleURvd24gPSBudWxsO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgMzY6IC8vIGhvbWVcclxuXHRcdFx0XHRcdFx0XHRcdFx0c2Nyb2xsVG9ZKDApO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRrZXlEb3duID0gbnVsbDtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRlbGVtZW50SGFzU2Nyb2xsZWQgPSBlLmtleUNvZGUgPT0ga2V5RG93biAmJiBkWCAhPSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uIHx8IGRZICE9IHZlcnRpY2FsRHJhZ1Bvc2l0aW9uO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiAhZWxlbWVudEhhc1Njcm9sbGVkO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQpLmJpbmQoXHJcblx0XHRcdFx0XHRcdCdrZXlwcmVzcy5qc3AnLCAvLyBGb3IgRkYvIE9TWCBzbyB0aGF0IHdlIGNhbiBjYW5jZWwgdGhlIHJlcGVhdCBrZXkgcHJlc3NlcyBpZiB0aGUgSlNQIHNjcm9sbHMuLi5cclxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24oZSlcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGlmIChlLmtleUNvZGUgPT0ga2V5RG93bikge1xyXG5cdFx0XHRcdFx0XHRcdFx0a2V5RG93bkhhbmRsZXIoKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuICFlbGVtZW50SGFzU2Nyb2xsZWQ7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYgKHNldHRpbmdzLmhpZGVGb2N1cykge1xyXG5cdFx0XHRcdFx0ZWxlbS5jc3MoJ291dGxpbmUnLCAnbm9uZScpO1xyXG5cdFx0XHRcdFx0aWYgKCdoaWRlRm9jdXMnIGluIGNvbnRhaW5lclswXSl7XHJcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignaGlkZUZvY3VzJywgdHJ1ZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGVsZW0uY3NzKCdvdXRsaW5lJywgJycpO1xyXG5cdFx0XHRcdFx0aWYgKCdoaWRlRm9jdXMnIGluIGNvbnRhaW5lclswXSl7XHJcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignaGlkZUZvY3VzJywgZmFsc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmdW5jdGlvbiBrZXlEb3duSGFuZGxlcigpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dmFyIGRYID0gaG9yaXpvbnRhbERyYWdQb3NpdGlvbiwgZFkgPSB2ZXJ0aWNhbERyYWdQb3NpdGlvbjtcclxuXHRcdFx0XHRcdHN3aXRjaChrZXlEb3duKSB7XHJcblx0XHRcdFx0XHRcdGNhc2UgNDA6IC8vIGRvd25cclxuXHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlZKHNldHRpbmdzLmtleWJvYXJkU3BlZWQsIGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0Y2FzZSAzODogLy8gdXBcclxuXHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlZKC1zZXR0aW5ncy5rZXlib2FyZFNwZWVkLCBmYWxzZSk7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdGNhc2UgMzQ6IC8vIHBhZ2UgZG93blxyXG5cdFx0XHRcdFx0XHRjYXNlIDMyOiAvLyBzcGFjZVxyXG5cdFx0XHRcdFx0XHRcdGpzcC5zY3JvbGxCeVkocGFuZUhlaWdodCAqIHNldHRpbmdzLnNjcm9sbFBhZ2VQZXJjZW50LCBmYWxzZSk7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdGNhc2UgMzM6IC8vIHBhZ2UgdXBcclxuXHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlZKC1wYW5lSGVpZ2h0ICogc2V0dGluZ3Muc2Nyb2xsUGFnZVBlcmNlbnQsIGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0Y2FzZSAzOTogLy8gcmlnaHRcclxuXHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlYKHNldHRpbmdzLmtleWJvYXJkU3BlZWQsIGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0Y2FzZSAzNzogLy8gbGVmdFxyXG5cdFx0XHRcdFx0XHRcdGpzcC5zY3JvbGxCeVgoLXNldHRpbmdzLmtleWJvYXJkU3BlZWQsIGZhbHNlKTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRlbGVtZW50SGFzU2Nyb2xsZWQgPSBkWCAhPSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uIHx8IGRZICE9IHZlcnRpY2FsRHJhZ1Bvc2l0aW9uO1xyXG5cdFx0XHRcdFx0cmV0dXJuIGVsZW1lbnRIYXNTY3JvbGxlZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZ1bmN0aW9uIHJlbW92ZUtleWJvYXJkTmF2KClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGVsZW0uYXR0cigndGFiaW5kZXgnLCAnLTEnKVxyXG5cdFx0XHRcdFx0LnJlbW92ZUF0dHIoJ3RhYmluZGV4JylcclxuXHRcdFx0XHRcdC51bmJpbmQoJ2tleWRvd24uanNwIGtleXByZXNzLmpzcCcpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBvYnNlcnZlSGFzaCgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZiAobG9jYXRpb24uaGFzaCAmJiBsb2NhdGlvbi5oYXNoLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0XHRcdHZhciBlLFxyXG5cdFx0XHRcdFx0XHRyZXRyeUludCxcclxuXHRcdFx0XHRcdFx0aGFzaCA9IGVzY2FwZShsb2NhdGlvbi5oYXNoLnN1YnN0cigxKSkgLy8gaGFzaCBtdXN0IGJlIGVzY2FwZWQgdG8gcHJldmVudCBYU1NcclxuXHRcdFx0XHRcdFx0O1xyXG5cdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0ZSA9ICQoJyMnICsgaGFzaCArICcsIGFbbmFtZT1cIicgKyBoYXNoICsgJ1wiXScpO1xyXG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZiAoZS5sZW5ndGggJiYgcGFuZS5maW5kKGhhc2gpKSB7XHJcblx0XHRcdFx0XHRcdC8vIG5hc3R5IHdvcmthcm91bmQgYnV0IGl0IGFwcGVhcnMgdG8gdGFrZSBhIGxpdHRsZSB3aGlsZSBiZWZvcmUgdGhlIGhhc2ggaGFzIGRvbmUgaXRzIHRoaW5nXHJcblx0XHRcdFx0XHRcdC8vIHRvIHRoZSByZW5kZXJlZCBwYWdlIHNvIHdlIGp1c3Qgd2FpdCB1bnRpbCB0aGUgY29udGFpbmVyJ3Mgc2Nyb2xsVG9wIGhhcyBiZWVuIG1lc3NlZCB1cC5cclxuXHRcdFx0XHRcdFx0aWYgKGNvbnRhaW5lci5zY3JvbGxUb3AoKSA9PT0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdHJldHJ5SW50ID0gc2V0SW50ZXJ2YWwoXHJcblx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbigpXHJcblx0XHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChjb250YWluZXIuc2Nyb2xsVG9wKCkgPiAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0c2Nyb2xsVG9FbGVtZW50KGUsIHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCQoZG9jdW1lbnQpLnNjcm9sbFRvcChjb250YWluZXIucG9zaXRpb24oKS50b3ApO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNsZWFySW50ZXJ2YWwocmV0cnlJbnQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRcdFx0NTBcclxuXHRcdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHNjcm9sbFRvRWxlbWVudChlLCB0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHQkKGRvY3VtZW50KS5zY3JvbGxUb3AoY29udGFpbmVyLnBvc2l0aW9uKCkudG9wKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaGlqYWNrSW50ZXJuYWxMaW5rcygpXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvLyBvbmx5IHJlZ2lzdGVyIHRoZSBsaW5rIGhhbmRsZXIgb25jZVxyXG5cdFx0XHRcdGlmICgkKGRvY3VtZW50LmJvZHkpLmRhdGEoJ2pzcEhpamFjaycpKSB7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyByZW1lbWJlciB0aGF0IHRoZSBoYW5kbGVyIHdhcyBib3VuZFxyXG5cdFx0XHRcdCQoZG9jdW1lbnQuYm9keSkuZGF0YSgnanNwSGlqYWNrJywgdHJ1ZSk7XHJcblxyXG5cdFx0XHRcdC8vIHVzZSBsaXZlIGhhbmRsZXIgdG8gYWxzbyBjYXB0dXJlIG5ld2x5IGNyZWF0ZWQgbGlua3NcclxuXHRcdFx0XHQkKGRvY3VtZW50LmJvZHkpLmRlbGVnYXRlKCdhW2hyZWYqPSNdJywgJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHRcdC8vIGRvZXMgdGhlIGxpbmsgcG9pbnQgdG8gdGhlIHNhbWUgcGFnZT9cclxuXHRcdFx0XHRcdC8vIHRoaXMgYWxzbyB0YWtlcyBjYXJlIG9mIGNhc2VzIHdpdGggYSA8YmFzZT4tVGFnIG9yIExpbmtzIG5vdCBzdGFydGluZyB3aXRoIHRoZSBoYXNoICNcclxuXHRcdFx0XHRcdC8vIGUuZy4gPGEgaHJlZj1cImluZGV4Lmh0bWwjdGVzdFwiPiB3aGVuIHRoZSBjdXJyZW50IHVybCBhbHJlYWR5IGlzIGluZGV4Lmh0bWxcclxuXHRcdFx0XHRcdHZhciBocmVmID0gdGhpcy5ocmVmLnN1YnN0cigwLCB0aGlzLmhyZWYuaW5kZXhPZignIycpKSxcclxuXHRcdFx0XHRcdFx0bG9jYXRpb25IcmVmID0gbG9jYXRpb24uaHJlZixcclxuXHRcdFx0XHRcdFx0aGFzaCxcclxuXHRcdFx0XHRcdFx0ZWxlbWVudCxcclxuXHRcdFx0XHRcdFx0Y29udGFpbmVyLFxyXG5cdFx0XHRcdFx0XHRqc3AsXHJcblx0XHRcdFx0XHRcdHNjcm9sbFRvcCxcclxuXHRcdFx0XHRcdFx0ZWxlbWVudFRvcDtcclxuXHRcdFx0XHRcdGlmIChsb2NhdGlvbi5ocmVmLmluZGV4T2YoJyMnKSAhPT0gLTEpIHtcclxuXHRcdFx0XHRcdFx0bG9jYXRpb25IcmVmID0gbG9jYXRpb24uaHJlZi5zdWJzdHIoMCwgbG9jYXRpb24uaHJlZi5pbmRleE9mKCcjJykpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0aWYgKGhyZWYgIT09IGxvY2F0aW9uSHJlZikge1xyXG5cdFx0XHRcdFx0XHQvLyB0aGUgbGluayBwb2ludHMgdG8gYW5vdGhlciBwYWdlXHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHQvLyBjaGVjayBpZiBqU2Nyb2xsUGFuZSBzaG91bGQgaGFuZGxlIHRoaXMgY2xpY2sgZXZlbnRcclxuXHRcdFx0XHRcdGhhc2ggPSBlc2NhcGUodGhpcy5ocmVmLnN1YnN0cih0aGlzLmhyZWYuaW5kZXhPZignIycpICsgMSkpO1xyXG5cclxuXHRcdFx0XHRcdC8vIGZpbmQgdGhlIGVsZW1lbnQgb24gdGhlIHBhZ2VcclxuXHRcdFx0XHRcdGVsZW1lbnQ7XHJcblx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRlbGVtZW50ID0gJCgnIycgKyBoYXNoICsgJywgYVtuYW1lPVwiJyArIGhhc2ggKyAnXCJdJyk7XHJcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRcdC8vIGhhc2ggaXMgbm90IGEgdmFsaWQgalF1ZXJ5IGlkZW50aWZpZXJcclxuXHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmICghZWxlbWVudC5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0Ly8gdGhpcyBsaW5rIGRvZXMgbm90IHBvaW50IHRvIGFuIGVsZW1lbnQgb24gdGhpcyBwYWdlXHJcblx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRjb250YWluZXIgPSBlbGVtZW50LmNsb3Nlc3QoJy5qc3BTY3JvbGxhYmxlJyk7XHJcblx0XHRcdFx0XHRqc3AgPSBjb250YWluZXIuZGF0YSgnanNwJyk7XHJcblxyXG5cdFx0XHRcdFx0Ly8ganNwIG1pZ2h0IGJlIGFub3RoZXIganNwIGluc3RhbmNlIHRoYW4gdGhlIG9uZSwgdGhhdCBib3VuZCB0aGlzIGV2ZW50XHJcblx0XHRcdFx0XHQvLyByZW1lbWJlcjogdGhpcyBldmVudCBpcyBvbmx5IGJvdW5kIG9uY2UgZm9yIGFsbCBpbnN0YW5jZXMuXHJcblx0XHRcdFx0XHRqc3Auc2Nyb2xsVG9FbGVtZW50KGVsZW1lbnQsIHRydWUpO1xyXG5cclxuXHRcdFx0XHRcdGlmIChjb250YWluZXJbMF0uc2Nyb2xsSW50b1ZpZXcpIHtcclxuXHRcdFx0XHRcdFx0Ly8gYWxzbyBzY3JvbGwgdG8gdGhlIHRvcCBvZiB0aGUgY29udGFpbmVyIChpZiBpdCBpcyBub3QgdmlzaWJsZSlcclxuXHRcdFx0XHRcdFx0c2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xyXG5cdFx0XHRcdFx0XHRlbGVtZW50VG9wID0gZWxlbWVudC5vZmZzZXQoKS50b3A7XHJcblx0XHRcdFx0XHRcdGlmIChlbGVtZW50VG9wIDwgc2Nyb2xsVG9wIHx8IGVsZW1lbnRUb3AgPiBzY3JvbGxUb3AgKyAkKHdpbmRvdykuaGVpZ2h0KCkpIHtcclxuXHRcdFx0XHRcdFx0XHRjb250YWluZXJbMF0uc2Nyb2xsSW50b1ZpZXcoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdC8vIGpzcCBoYW5kbGVkIHRoaXMgZXZlbnQsIHByZXZlbnQgdGhlIGJyb3dzZXIgZGVmYXVsdCAoc2Nyb2xsaW5nIDpQKVxyXG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gSW5pdCB0b3VjaCBvbiBpUGFkLCBpUGhvbmUsIGlQb2QsIEFuZHJvaWRcclxuXHRcdFx0ZnVuY3Rpb24gaW5pdFRvdWNoKClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBzdGFydFgsXHJcblx0XHRcdFx0XHRzdGFydFksXHJcblx0XHRcdFx0XHR0b3VjaFN0YXJ0WCxcclxuXHRcdFx0XHRcdHRvdWNoU3RhcnRZLFxyXG5cdFx0XHRcdFx0bW92ZWQsXHJcblx0XHRcdFx0XHRtb3ZpbmcgPSBmYWxzZTtcclxuICBcclxuXHRcdFx0XHRjb250YWluZXIudW5iaW5kKCd0b3VjaHN0YXJ0LmpzcCB0b3VjaG1vdmUuanNwIHRvdWNoZW5kLmpzcCBjbGljay5qc3AtdG91Y2hjbGljaycpLmJpbmQoXHJcblx0XHRcdFx0XHQndG91Y2hzdGFydC5qc3AnLFxyXG5cdFx0XHRcdFx0ZnVuY3Rpb24oZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dmFyIHRvdWNoID0gZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF07XHJcblx0XHRcdFx0XHRcdHN0YXJ0WCA9IGNvbnRlbnRQb3NpdGlvblgoKTtcclxuXHRcdFx0XHRcdFx0c3RhcnRZID0gY29udGVudFBvc2l0aW9uWSgpO1xyXG5cdFx0XHRcdFx0XHR0b3VjaFN0YXJ0WCA9IHRvdWNoLnBhZ2VYO1xyXG5cdFx0XHRcdFx0XHR0b3VjaFN0YXJ0WSA9IHRvdWNoLnBhZ2VZO1xyXG5cdFx0XHRcdFx0XHRtb3ZlZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRtb3ZpbmcgPSB0cnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdCkuYmluZChcclxuXHRcdFx0XHRcdCd0b3VjaG1vdmUuanNwJyxcclxuXHRcdFx0XHRcdGZ1bmN0aW9uKGV2KVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRpZighbW92aW5nKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR2YXIgdG91Y2hQb3MgPSBldi5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0sXHJcblx0XHRcdFx0XHRcdFx0ZFggPSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uLCBkWSA9IHZlcnRpY2FsRHJhZ1Bvc2l0aW9uO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0anNwLnNjcm9sbFRvKHN0YXJ0WCArIHRvdWNoU3RhcnRYIC0gdG91Y2hQb3MucGFnZVgsIHN0YXJ0WSArIHRvdWNoU3RhcnRZIC0gdG91Y2hQb3MucGFnZVkpO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0bW92ZWQgPSBtb3ZlZCB8fCBNYXRoLmFicyh0b3VjaFN0YXJ0WCAtIHRvdWNoUG9zLnBhZ2VYKSA+IDUgfHwgTWF0aC5hYnModG91Y2hTdGFydFkgLSB0b3VjaFBvcy5wYWdlWSkgPiA1O1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Ly8gcmV0dXJuIHRydWUgaWYgdGhlcmUgd2FzIG5vIG1vdmVtZW50IHNvIHJlc3Qgb2Ygc2NyZWVuIGNhbiBzY3JvbGxcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGRYID09IGhvcml6b250YWxEcmFnUG9zaXRpb24gJiYgZFkgPT0gdmVydGljYWxEcmFnUG9zaXRpb247XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0KS5iaW5kKFxyXG5cdFx0XHRcdFx0J3RvdWNoZW5kLmpzcCcsXHJcblx0XHRcdFx0XHRmdW5jdGlvbihlKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRtb3ZpbmcgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0LyppZihtb3ZlZCkge1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcdFx0fSovXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0KS5iaW5kKFxyXG5cdFx0XHRcdFx0J2NsaWNrLmpzcC10b3VjaGNsaWNrJyxcclxuXHRcdFx0XHRcdGZ1bmN0aW9uKGUpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGlmKG1vdmVkKSB7XHJcblx0XHRcdFx0XHRcdFx0bW92ZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRmdW5jdGlvbiBkZXN0cm95KCl7XHJcblx0XHRcdFx0dmFyIGN1cnJlbnRZID0gY29udGVudFBvc2l0aW9uWSgpLFxyXG5cdFx0XHRcdFx0Y3VycmVudFggPSBjb250ZW50UG9zaXRpb25YKCk7XHJcblx0XHRcdFx0ZWxlbS5yZW1vdmVDbGFzcygnanNwU2Nyb2xsYWJsZScpLnVuYmluZCgnLmpzcCcpO1xyXG5cdFx0XHRcdGVsZW0ucmVwbGFjZVdpdGgob3JpZ2luYWxFbGVtZW50LmFwcGVuZChwYW5lLmNoaWxkcmVuKCkpKTtcclxuXHRcdFx0XHRvcmlnaW5hbEVsZW1lbnQuc2Nyb2xsVG9wKGN1cnJlbnRZKTtcclxuXHRcdFx0XHRvcmlnaW5hbEVsZW1lbnQuc2Nyb2xsTGVmdChjdXJyZW50WCk7XHJcblxyXG5cdFx0XHRcdC8vIGNsZWFyIHJlaW5pdGlhbGl6ZSB0aW1lciBpZiBhY3RpdmVcclxuXHRcdFx0XHRpZiAocmVpbml0aWFsaXNlSW50ZXJ2YWwpIHtcclxuXHRcdFx0XHRcdGNsZWFySW50ZXJ2YWwocmVpbml0aWFsaXNlSW50ZXJ2YWwpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gUHVibGljIEFQSVxyXG5cdFx0XHQkLmV4dGVuZChcclxuXHRcdFx0XHRqc3AsXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Ly8gUmVpbml0aWFsaXNlcyB0aGUgc2Nyb2xsIHBhbmUgKGlmIGl0J3MgaW50ZXJuYWwgZGltZW5zaW9ucyBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgdGltZSBpdFxyXG5cdFx0XHRcdFx0Ly8gd2FzIGluaXRpYWxpc2VkKS4gVGhlIHNldHRpbmdzIG9iamVjdCB3aGljaCBpcyBwYXNzZWQgaW4gd2lsbCBvdmVycmlkZSBhbnkgc2V0dGluZ3MgZnJvbSB0aGVcclxuXHRcdFx0XHRcdC8vIHByZXZpb3VzIHRpbWUgaXQgd2FzIGluaXRpYWxpc2VkIC0gaWYgeW91IGRvbid0IHBhc3MgYW55IHNldHRpbmdzIHRoZW4gdGhlIG9uZXMgZnJvbSB0aGUgcHJldmlvdXNcclxuXHRcdFx0XHRcdC8vIGluaXRpYWxpc2F0aW9uIHdpbGwgYmUgdXNlZC5cclxuXHRcdFx0XHRcdHJlaW5pdGlhbGlzZTogZnVuY3Rpb24ocylcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0cyA9ICQuZXh0ZW5kKHt9LCBzZXR0aW5ncywgcyk7XHJcblx0XHRcdFx0XHRcdGluaXRpYWxpc2Uocyk7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0Ly8gU2Nyb2xscyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgKGEgalF1ZXJ5IG9iamVjdCwgRE9NIG5vZGUgb3IgalF1ZXJ5IHNlbGVjdG9yIHN0cmluZykgaW50byB2aWV3IHNvXHJcblx0XHRcdFx0XHQvLyB0aGF0IGl0IGNhbiBiZSBzZWVuIHdpdGhpbiB0aGUgdmlld3BvcnQuIElmIHN0aWNrVG9Ub3AgaXMgdHJ1ZSB0aGVuIHRoZSBlbGVtZW50IHdpbGwgYXBwZWFyIGF0XHJcblx0XHRcdFx0XHQvLyB0aGUgdG9wIG9mIHRoZSB2aWV3cG9ydCwgaWYgaXQgaXMgZmFsc2UgdGhlbiB0aGUgdmlld3BvcnQgd2lsbCBzY3JvbGwgYXMgbGl0dGxlIGFzIHBvc3NpYmxlIHRvXHJcblx0XHRcdFx0XHQvLyBzaG93IHRoZSBlbGVtZW50LiBZb3UgY2FuIGFsc28gc3BlY2lmeSBpZiB5b3Ugd2FudCBhbmltYXRpb24gdG8gb2NjdXIuIElmIHlvdSBkb24ndCBwcm92aWRlIHRoaXNcclxuXHRcdFx0XHRcdC8vIGFyZ3VtZW50IHRoZW4gdGhlIGFuaW1hdGVTY3JvbGwgdmFsdWUgZnJvbSB0aGUgc2V0dGluZ3Mgb2JqZWN0IGlzIHVzZWQgaW5zdGVhZC5cclxuXHRcdFx0XHRcdHNjcm9sbFRvRWxlbWVudDogZnVuY3Rpb24oZWxlLCBzdGlja1RvVG9wLCBhbmltYXRlKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRzY3JvbGxUb0VsZW1lbnQoZWxlLCBzdGlja1RvVG9wLCBhbmltYXRlKTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQvLyBTY3JvbGxzIHRoZSBwYW5lIHNvIHRoYXQgdGhlIHNwZWNpZmllZCBjby1vcmRpbmF0ZXMgd2l0aGluIHRoZSBjb250ZW50IGFyZSBhdCB0aGUgdG9wIGxlZnRcclxuXHRcdFx0XHRcdC8vIG9mIHRoZSB2aWV3cG9ydC4gYW5pbWF0ZSBpcyBvcHRpb25hbCBhbmQgaWYgbm90IHBhc3NlZCB0aGVuIHRoZSB2YWx1ZSBvZiBhbmltYXRlU2Nyb2xsIGZyb21cclxuXHRcdFx0XHRcdC8vIHRoZSBzZXR0aW5ncyBvYmplY3QgdGhpcyBqU2Nyb2xsUGFuZSB3YXMgaW5pdGlhbGlzZWQgd2l0aCBpcyB1c2VkLlxyXG5cdFx0XHRcdFx0c2Nyb2xsVG86IGZ1bmN0aW9uKGRlc3RYLCBkZXN0WSwgYW5pbWF0ZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0c2Nyb2xsVG9YKGRlc3RYLCBhbmltYXRlKTtcclxuXHRcdFx0XHRcdFx0c2Nyb2xsVG9ZKGRlc3RZLCBhbmltYXRlKTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQvLyBTY3JvbGxzIHRoZSBwYW5lIHNvIHRoYXQgdGhlIHNwZWNpZmllZCBjby1vcmRpbmF0ZSB3aXRoaW4gdGhlIGNvbnRlbnQgaXMgYXQgdGhlIGxlZnQgb2YgdGhlXHJcblx0XHRcdFx0XHQvLyB2aWV3cG9ydC4gYW5pbWF0ZSBpcyBvcHRpb25hbCBhbmQgaWYgbm90IHBhc3NlZCB0aGVuIHRoZSB2YWx1ZSBvZiBhbmltYXRlU2Nyb2xsIGZyb20gdGhlIHNldHRpbmdzXHJcblx0XHRcdFx0XHQvLyBvYmplY3QgdGhpcyBqU2Nyb2xsUGFuZSB3YXMgaW5pdGlhbGlzZWQgd2l0aCBpcyB1c2VkLlxyXG5cdFx0XHRcdFx0c2Nyb2xsVG9YOiBmdW5jdGlvbihkZXN0WCwgYW5pbWF0ZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0c2Nyb2xsVG9YKGRlc3RYLCBhbmltYXRlKTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQvLyBTY3JvbGxzIHRoZSBwYW5lIHNvIHRoYXQgdGhlIHNwZWNpZmllZCBjby1vcmRpbmF0ZSB3aXRoaW4gdGhlIGNvbnRlbnQgaXMgYXQgdGhlIHRvcCBvZiB0aGVcclxuXHRcdFx0XHRcdC8vIHZpZXdwb3J0LiBhbmltYXRlIGlzIG9wdGlvbmFsIGFuZCBpZiBub3QgcGFzc2VkIHRoZW4gdGhlIHZhbHVlIG9mIGFuaW1hdGVTY3JvbGwgZnJvbSB0aGUgc2V0dGluZ3NcclxuXHRcdFx0XHRcdC8vIG9iamVjdCB0aGlzIGpTY3JvbGxQYW5lIHdhcyBpbml0aWFsaXNlZCB3aXRoIGlzIHVzZWQuXHJcblx0XHRcdFx0XHRzY3JvbGxUb1k6IGZ1bmN0aW9uKGRlc3RZLCBhbmltYXRlKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRzY3JvbGxUb1koZGVzdFksIGFuaW1hdGUpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIFNjcm9sbHMgdGhlIHBhbmUgdG8gdGhlIHNwZWNpZmllZCBwZXJjZW50YWdlIG9mIGl0cyBtYXhpbXVtIGhvcml6b250YWwgc2Nyb2xsIHBvc2l0aW9uLiBhbmltYXRlXHJcblx0XHRcdFx0XHQvLyBpcyBvcHRpb25hbCBhbmQgaWYgbm90IHBhc3NlZCB0aGVuIHRoZSB2YWx1ZSBvZiBhbmltYXRlU2Nyb2xsIGZyb20gdGhlIHNldHRpbmdzIG9iamVjdCB0aGlzXHJcblx0XHRcdFx0XHQvLyBqU2Nyb2xsUGFuZSB3YXMgaW5pdGlhbGlzZWQgd2l0aCBpcyB1c2VkLlxyXG5cdFx0XHRcdFx0c2Nyb2xsVG9QZXJjZW50WDogZnVuY3Rpb24oZGVzdFBlcmNlbnRYLCBhbmltYXRlKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRzY3JvbGxUb1goZGVzdFBlcmNlbnRYICogKGNvbnRlbnRXaWR0aCAtIHBhbmVXaWR0aCksIGFuaW1hdGUpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIFNjcm9sbHMgdGhlIHBhbmUgdG8gdGhlIHNwZWNpZmllZCBwZXJjZW50YWdlIG9mIGl0cyBtYXhpbXVtIHZlcnRpY2FsIHNjcm9sbCBwb3NpdGlvbi4gYW5pbWF0ZVxyXG5cdFx0XHRcdFx0Ly8gaXMgb3B0aW9uYWwgYW5kIGlmIG5vdCBwYXNzZWQgdGhlbiB0aGUgdmFsdWUgb2YgYW5pbWF0ZVNjcm9sbCBmcm9tIHRoZSBzZXR0aW5ncyBvYmplY3QgdGhpc1xyXG5cdFx0XHRcdFx0Ly8galNjcm9sbFBhbmUgd2FzIGluaXRpYWxpc2VkIHdpdGggaXMgdXNlZC5cclxuXHRcdFx0XHRcdHNjcm9sbFRvUGVyY2VudFk6IGZ1bmN0aW9uKGRlc3RQZXJjZW50WSwgYW5pbWF0ZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0c2Nyb2xsVG9ZKGRlc3RQZXJjZW50WSAqIChjb250ZW50SGVpZ2h0IC0gcGFuZUhlaWdodCksIGFuaW1hdGUpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIFNjcm9sbHMgdGhlIHBhbmUgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgcGl4ZWxzLiBhbmltYXRlIGlzIG9wdGlvbmFsIGFuZCBpZiBub3QgcGFzc2VkIHRoZW5cclxuXHRcdFx0XHRcdC8vIHRoZSB2YWx1ZSBvZiBhbmltYXRlU2Nyb2xsIGZyb20gdGhlIHNldHRpbmdzIG9iamVjdCB0aGlzIGpTY3JvbGxQYW5lIHdhcyBpbml0aWFsaXNlZCB3aXRoIGlzIHVzZWQuXHJcblx0XHRcdFx0XHRzY3JvbGxCeTogZnVuY3Rpb24oZGVsdGFYLCBkZWx0YVksIGFuaW1hdGUpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGpzcC5zY3JvbGxCeVgoZGVsdGFYLCBhbmltYXRlKTtcclxuXHRcdFx0XHRcdFx0anNwLnNjcm9sbEJ5WShkZWx0YVksIGFuaW1hdGUpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIFNjcm9sbHMgdGhlIHBhbmUgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgcGl4ZWxzLiBhbmltYXRlIGlzIG9wdGlvbmFsIGFuZCBpZiBub3QgcGFzc2VkIHRoZW5cclxuXHRcdFx0XHRcdC8vIHRoZSB2YWx1ZSBvZiBhbmltYXRlU2Nyb2xsIGZyb20gdGhlIHNldHRpbmdzIG9iamVjdCB0aGlzIGpTY3JvbGxQYW5lIHdhcyBpbml0aWFsaXNlZCB3aXRoIGlzIHVzZWQuXHJcblx0XHRcdFx0XHRzY3JvbGxCeVg6IGZ1bmN0aW9uKGRlbHRhWCwgYW5pbWF0ZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dmFyIGRlc3RYID0gY29udGVudFBvc2l0aW9uWCgpICsgTWF0aFtkZWx0YVg8MCA/ICdmbG9vcicgOiAnY2VpbCddKGRlbHRhWCksXHJcblx0XHRcdFx0XHRcdFx0cGVyY2VudFNjcm9sbGVkID0gZGVzdFggLyAoY29udGVudFdpZHRoIC0gcGFuZVdpZHRoKTtcclxuXHRcdFx0XHRcdFx0cG9zaXRpb25EcmFnWChwZXJjZW50U2Nyb2xsZWQgKiBkcmFnTWF4WCwgYW5pbWF0ZSk7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0Ly8gU2Nyb2xscyB0aGUgcGFuZSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudCBvZiBwaXhlbHMuIGFuaW1hdGUgaXMgb3B0aW9uYWwgYW5kIGlmIG5vdCBwYXNzZWQgdGhlblxyXG5cdFx0XHRcdFx0Ly8gdGhlIHZhbHVlIG9mIGFuaW1hdGVTY3JvbGwgZnJvbSB0aGUgc2V0dGluZ3Mgb2JqZWN0IHRoaXMgalNjcm9sbFBhbmUgd2FzIGluaXRpYWxpc2VkIHdpdGggaXMgdXNlZC5cclxuXHRcdFx0XHRcdHNjcm9sbEJ5WTogZnVuY3Rpb24oZGVsdGFZLCBhbmltYXRlKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHR2YXIgZGVzdFkgPSBjb250ZW50UG9zaXRpb25ZKCkgKyBNYXRoW2RlbHRhWTwwID8gJ2Zsb29yJyA6ICdjZWlsJ10oZGVsdGFZKSxcclxuXHRcdFx0XHRcdFx0XHRwZXJjZW50U2Nyb2xsZWQgPSBkZXN0WSAvIChjb250ZW50SGVpZ2h0IC0gcGFuZUhlaWdodCk7XHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uRHJhZ1kocGVyY2VudFNjcm9sbGVkICogZHJhZ01heFksIGFuaW1hdGUpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIFBvc2l0aW9ucyB0aGUgaG9yaXpvbnRhbCBkcmFnIGF0IHRoZSBzcGVjaWZpZWQgeCBwb3NpdGlvbiAoYW5kIHVwZGF0ZXMgdGhlIHZpZXdwb3J0IHRvIHJlZmxlY3RcclxuXHRcdFx0XHRcdC8vIHRoaXMpLiBhbmltYXRlIGlzIG9wdGlvbmFsIGFuZCBpZiBub3QgcGFzc2VkIHRoZW4gdGhlIHZhbHVlIG9mIGFuaW1hdGVTY3JvbGwgZnJvbSB0aGUgc2V0dGluZ3NcclxuXHRcdFx0XHRcdC8vIG9iamVjdCB0aGlzIGpTY3JvbGxQYW5lIHdhcyBpbml0aWFsaXNlZCB3aXRoIGlzIHVzZWQuXHJcblx0XHRcdFx0XHRwb3NpdGlvbkRyYWdYOiBmdW5jdGlvbih4LCBhbmltYXRlKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdYKHgsIGFuaW1hdGUpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIFBvc2l0aW9ucyB0aGUgdmVydGljYWwgZHJhZyBhdCB0aGUgc3BlY2lmaWVkIHkgcG9zaXRpb24gKGFuZCB1cGRhdGVzIHRoZSB2aWV3cG9ydCB0byByZWZsZWN0XHJcblx0XHRcdFx0XHQvLyB0aGlzKS4gYW5pbWF0ZSBpcyBvcHRpb25hbCBhbmQgaWYgbm90IHBhc3NlZCB0aGVuIHRoZSB2YWx1ZSBvZiBhbmltYXRlU2Nyb2xsIGZyb20gdGhlIHNldHRpbmdzXHJcblx0XHRcdFx0XHQvLyBvYmplY3QgdGhpcyBqU2Nyb2xsUGFuZSB3YXMgaW5pdGlhbGlzZWQgd2l0aCBpcyB1c2VkLlxyXG5cdFx0XHRcdFx0cG9zaXRpb25EcmFnWTogZnVuY3Rpb24oeSwgYW5pbWF0ZSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0cG9zaXRpb25EcmFnWSh5LCBhbmltYXRlKTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQvLyBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiBqU2Nyb2xsUGFuZSBpcyB0cnlpbmcgdG8gYW5pbWF0ZSB0byBhIG5ldyBwb3NpdGlvbi4gWW91IGNhbiBvdmVycmlkZVxyXG5cdFx0XHRcdFx0Ly8gaXQgaWYgeW91IHdhbnQgdG8gcHJvdmlkZSBhZHZhbmNlZCBhbmltYXRpb24gZnVuY3Rpb25hbGl0eS4gSXQgaXMgcGFzc2VkIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxyXG5cdFx0XHRcdFx0Ly8gICogZWxlICAgICAgICAgIC0gdGhlIGVsZW1lbnQgd2hvc2UgcG9zaXRpb24gaXMgYmVpbmcgYW5pbWF0ZWRcclxuXHRcdFx0XHRcdC8vICAqIHByb3AgICAgICAgICAtIHRoZSBwcm9wZXJ0eSB0aGF0IGlzIGJlaW5nIGFuaW1hdGVkXHJcblx0XHRcdFx0XHQvLyAgKiB2YWx1ZSAgICAgICAgLSB0aGUgdmFsdWUgaXQncyBiZWluZyBhbmltYXRlZCB0b1xyXG5cdFx0XHRcdFx0Ly8gICogc3RlcENhbGxiYWNrIC0gYSBmdW5jdGlvbiB0aGF0IHlvdSBtdXN0IGV4ZWN1dGUgZWFjaCB0aW1lIHlvdSB1cGRhdGUgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG5cdFx0XHRcdFx0Ly8gWW91IGNhbiB1c2UgdGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gKGJlbG93KSBhcyBhIHN0YXJ0aW5nIHBvaW50IGZvciB5b3VyIG93biBpbXBsZW1lbnRhdGlvbi5cclxuXHRcdFx0XHRcdGFuaW1hdGU6IGZ1bmN0aW9uKGVsZSwgcHJvcCwgdmFsdWUsIHN0ZXBDYWxsYmFjaylcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dmFyIHBhcmFtcyA9IHt9O1xyXG5cdFx0XHRcdFx0XHRwYXJhbXNbcHJvcF0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0ZWxlLmFuaW1hdGUoXHJcblx0XHRcdFx0XHRcdFx0cGFyYW1zLFxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdCdkdXJhdGlvbidcdDogc2V0dGluZ3MuYW5pbWF0ZUR1cmF0aW9uLFxyXG5cdFx0XHRcdFx0XHRcdFx0J2Vhc2luZydcdDogc2V0dGluZ3MuYW5pbWF0ZUVhc2UsXHJcblx0XHRcdFx0XHRcdFx0XHQncXVldWUnXHRcdDogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0XHQnc3RlcCdcdFx0OiBzdGVwQ2FsbGJhY2tcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0Ly8gUmV0dXJucyB0aGUgY3VycmVudCB4IHBvc2l0aW9uIG9mIHRoZSB2aWV3cG9ydCB3aXRoIHJlZ2FyZHMgdG8gdGhlIGNvbnRlbnQgcGFuZS5cclxuXHRcdFx0XHRcdGdldENvbnRlbnRQb3NpdGlvblg6IGZ1bmN0aW9uKClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRlbnRQb3NpdGlvblgoKTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQvLyBSZXR1cm5zIHRoZSBjdXJyZW50IHkgcG9zaXRpb24gb2YgdGhlIHZpZXdwb3J0IHdpdGggcmVnYXJkcyB0byB0aGUgY29udGVudCBwYW5lLlxyXG5cdFx0XHRcdFx0Z2V0Q29udGVudFBvc2l0aW9uWTogZnVuY3Rpb24oKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gY29udGVudFBvc2l0aW9uWSgpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSBjb250ZW50IHdpdGhpbiB0aGUgc2Nyb2xsIHBhbmUuXHJcblx0XHRcdFx0XHRnZXRDb250ZW50V2lkdGg6IGZ1bmN0aW9uKClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRlbnRXaWR0aDtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQvLyBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIGNvbnRlbnQgd2l0aGluIHRoZSBzY3JvbGwgcGFuZS5cclxuXHRcdFx0XHRcdGdldENvbnRlbnRIZWlnaHQ6IGZ1bmN0aW9uKClcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRlbnRIZWlnaHQ7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0Ly8gUmV0dXJucyB0aGUgaG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0aGUgdmlld3BvcnQgd2l0aGluIHRoZSBwYW5lIGNvbnRlbnQuXHJcblx0XHRcdFx0XHRnZXRQZXJjZW50U2Nyb2xsZWRYOiBmdW5jdGlvbigpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHJldHVybiBjb250ZW50UG9zaXRpb25YKCkgLyAoY29udGVudFdpZHRoIC0gcGFuZVdpZHRoKTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQvLyBSZXR1cm5zIHRoZSB2ZXJ0aWNhbCBwb3NpdGlvbiBvZiB0aGUgdmlld3BvcnQgd2l0aGluIHRoZSBwYW5lIGNvbnRlbnQuXHJcblx0XHRcdFx0XHRnZXRQZXJjZW50U2Nyb2xsZWRZOiBmdW5jdGlvbigpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHJldHVybiBjb250ZW50UG9zaXRpb25ZKCkgLyAoY29udGVudEhlaWdodCAtIHBhbmVIZWlnaHQpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIFJldHVybnMgd2hldGhlciBvciBub3QgdGhpcyBzY3JvbGxwYW5lIGhhcyBhIGhvcml6b250YWwgc2Nyb2xsYmFyLlxyXG5cdFx0XHRcdFx0Z2V0SXNTY3JvbGxhYmxlSDogZnVuY3Rpb24oKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gaXNTY3JvbGxhYmxlSDtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQvLyBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoaXMgc2Nyb2xscGFuZSBoYXMgYSB2ZXJ0aWNhbCBzY3JvbGxiYXIuXHJcblx0XHRcdFx0XHRnZXRJc1Njcm9sbGFibGVWOiBmdW5jdGlvbigpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHJldHVybiBpc1Njcm9sbGFibGVWO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIEdldHMgYSByZWZlcmVuY2UgdG8gdGhlIGNvbnRlbnQgcGFuZS4gSXQgaXMgaW1wb3J0YW50IHRoYXQgeW91IHVzZSB0aGlzIG1ldGhvZCBpZiB5b3Ugd2FudCB0b1xyXG5cdFx0XHRcdFx0Ly8gZWRpdCB0aGUgY29udGVudCBvZiB5b3VyIGpTY3JvbGxQYW5lIGFzIGlmIHlvdSBhY2Nlc3MgdGhlIGVsZW1lbnQgZGlyZWN0bHkgdGhlbiB5b3UgbWF5IGhhdmUgc29tZVxyXG5cdFx0XHRcdFx0Ly8gcHJvYmxlbXMgKGFzIHlvdXIgb3JpZ2luYWwgZWxlbWVudCBoYXMgaGFkIGFkZGl0aW9uYWwgZWxlbWVudHMgZm9yIHRoZSBzY3JvbGxiYXJzIGV0YyBhZGRlZCBpbnRvXHJcblx0XHRcdFx0XHQvLyBpdCkuXHJcblx0XHRcdFx0XHRnZXRDb250ZW50UGFuZTogZnVuY3Rpb24oKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFuZTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQvLyBTY3JvbGxzIHRoaXMgalNjcm9sbFBhbmUgZG93biBhcyBmYXIgYXMgaXQgY2FuIGN1cnJlbnRseSBzY3JvbGwuIElmIGFuaW1hdGUgaXNuJ3QgcGFzc2VkIHRoZW4gdGhlXHJcblx0XHRcdFx0XHQvLyBhbmltYXRlU2Nyb2xsIHZhbHVlIGZyb20gc2V0dGluZ3MgaXMgdXNlZCBpbnN0ZWFkLlxyXG5cdFx0XHRcdFx0c2Nyb2xsVG9Cb3R0b206IGZ1bmN0aW9uKGFuaW1hdGUpXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHBvc2l0aW9uRHJhZ1koZHJhZ01heFksIGFuaW1hdGUpO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdC8vIEhpamFja3MgdGhlIGxpbmtzIG9uIHRoZSBwYWdlIHdoaWNoIGxpbmsgdG8gY29udGVudCBpbnNpZGUgdGhlIHNjcm9sbHBhbmUuIElmIHlvdSBoYXZlIGNoYW5nZWRcclxuXHRcdFx0XHRcdC8vIHRoZSBjb250ZW50IG9mIHlvdXIgcGFnZSAoZS5nLiB2aWEgQUpBWCkgYW5kIHdhbnQgdG8gbWFrZSBzdXJlIGFueSBuZXcgYW5jaG9yIGxpbmtzIHRvIHRoZVxyXG5cdFx0XHRcdFx0Ly8gY29udGVudHMgb2YgeW91ciBzY3JvbGwgcGFuZSB3aWxsIHdvcmsgdGhlbiBjYWxsIHRoaXMgZnVuY3Rpb24uXHJcblx0XHRcdFx0XHRoaWphY2tJbnRlcm5hbExpbmtzOiAkLm5vb3AsXHJcblx0XHRcdFx0XHQvLyBSZW1vdmVzIHRoZSBqU2Nyb2xsUGFuZSBhbmQgcmV0dXJucyB0aGUgcGFnZSB0byB0aGUgc3RhdGUgaXQgd2FzIGluIGJlZm9yZSBqU2Nyb2xsUGFuZSB3YXNcclxuXHRcdFx0XHRcdC8vIGluaXRpYWxpc2VkLlxyXG5cdFx0XHRcdFx0ZGVzdHJveTogZnVuY3Rpb24oKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGRlc3Ryb3koKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpbml0aWFsaXNlKHMpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFBsdWdpbmlmeWluZyBjb2RlLi4uXHJcblx0XHRzZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCAkLmZuLmpTY3JvbGxQYW5lLmRlZmF1bHRzLCBzZXR0aW5ncyk7XHJcblx0XHRcclxuXHRcdC8vIEFwcGx5IGRlZmF1bHQgc3BlZWRcclxuXHRcdCQuZWFjaChbJ21vdXNlV2hlZWxTcGVlZCcsICdhcnJvd0J1dHRvblNwZWVkJywgJ3RyYWNrQ2xpY2tTcGVlZCcsICdrZXlib2FyZFNwZWVkJ10sIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZXR0aW5nc1t0aGlzXSA9IHNldHRpbmdzW3RoaXNdIHx8IHNldHRpbmdzLnNwZWVkO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuZWFjaChcclxuXHRcdFx0ZnVuY3Rpb24oKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIGVsZW0gPSAkKHRoaXMpLCBqc3BBcGkgPSBlbGVtLmRhdGEoJ2pzcCcpO1xyXG5cdFx0XHRcdGlmIChqc3BBcGkpIHtcclxuXHRcdFx0XHRcdGpzcEFwaS5yZWluaXRpYWxpc2Uoc2V0dGluZ3MpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkKFwic2NyaXB0XCIsZWxlbSkuZmlsdGVyKCdbdHlwZT1cInRleHQvamF2YXNjcmlwdFwiXSw6bm90KFt0eXBlXSknKS5yZW1vdmUoKTtcclxuXHRcdFx0XHRcdGpzcEFwaSA9IG5ldyBKU2Nyb2xsUGFuZShlbGVtLCBzZXR0aW5ncyk7XHJcblx0XHRcdFx0XHRlbGVtLmRhdGEoJ2pzcCcsIGpzcEFwaSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQpO1xyXG5cdH07XHJcblxyXG5cdCQuZm4ualNjcm9sbFBhbmUuZGVmYXVsdHMgPSB7XHJcblx0XHRzaG93QXJyb3dzXHRcdFx0XHRcdDogZmFsc2UsXHJcblx0XHRtYWludGFpblBvc2l0aW9uXHRcdFx0OiB0cnVlLFxyXG5cdFx0c3RpY2tUb0JvdHRvbVx0XHRcdFx0OiBmYWxzZSxcclxuXHRcdHN0aWNrVG9SaWdodFx0XHRcdFx0OiBmYWxzZSxcclxuXHRcdGNsaWNrT25UcmFja1x0XHRcdFx0OiB0cnVlLFxyXG5cdFx0YXV0b1JlaW5pdGlhbGlzZVx0XHRcdDogZmFsc2UsXHJcblx0XHRhdXRvUmVpbml0aWFsaXNlRGVsYXlcdFx0OiA1MDAsXHJcblx0XHR2ZXJ0aWNhbERyYWdNaW5IZWlnaHRcdFx0OiAwLFxyXG5cdFx0dmVydGljYWxEcmFnTWF4SGVpZ2h0XHRcdDogOTk5OTksXHJcblx0XHRob3Jpem9udGFsRHJhZ01pbldpZHRoXHRcdDogMCxcclxuXHRcdGhvcml6b250YWxEcmFnTWF4V2lkdGhcdFx0OiA5OTk5OSxcclxuXHRcdGNvbnRlbnRXaWR0aFx0XHRcdFx0OiB1bmRlZmluZWQsXHJcblx0XHRhbmltYXRlU2Nyb2xsXHRcdFx0XHQ6IGZhbHNlLFxyXG5cdFx0YW5pbWF0ZUR1cmF0aW9uXHRcdFx0XHQ6IDMwMCxcclxuXHRcdGFuaW1hdGVFYXNlXHRcdFx0XHRcdDogJ2xpbmVhcicsXHJcblx0XHRoaWphY2tJbnRlcm5hbExpbmtzXHRcdFx0OiBmYWxzZSxcclxuXHRcdHZlcnRpY2FsR3V0dGVyXHRcdFx0XHQ6IDQsXHJcblx0XHRob3Jpem9udGFsR3V0dGVyXHRcdFx0OiA0LFxyXG5cdFx0bW91c2VXaGVlbFNwZWVkXHRcdFx0XHQ6IDAsXHJcblx0XHRhcnJvd0J1dHRvblNwZWVkXHRcdFx0OiAwLFxyXG5cdFx0YXJyb3dSZXBlYXRGcmVxXHRcdFx0XHQ6IDUwLFxyXG5cdFx0YXJyb3dTY3JvbGxPbkhvdmVyXHRcdFx0OiBmYWxzZSxcclxuXHRcdHRyYWNrQ2xpY2tTcGVlZFx0XHRcdFx0OiAwLFxyXG5cdFx0dHJhY2tDbGlja1JlcGVhdEZyZXFcdFx0OiA3MCxcclxuXHRcdHZlcnRpY2FsQXJyb3dQb3NpdGlvbnNcdFx0OiAnc3BsaXQnLFxyXG5cdFx0aG9yaXpvbnRhbEFycm93UG9zaXRpb25zXHQ6ICdzcGxpdCcsXHJcblx0XHRlbmFibGVLZXlib2FyZE5hdmlnYXRpb25cdDogdHJ1ZSxcclxuXHRcdGhpZGVGb2N1c1x0XHRcdFx0XHQ6IGZhbHNlLFxyXG5cdFx0a2V5Ym9hcmRTcGVlZFx0XHRcdFx0OiAwLFxyXG5cdFx0aW5pdGlhbERlbGF5ICAgICAgICAgICAgICAgIDogMzAwLCAgICAgICAgLy8gRGVsYXkgYmVmb3JlIHN0YXJ0aW5nIHJlcGVhdGluZ1xyXG5cdFx0c3BlZWRcdFx0XHRcdFx0XHQ6IDMwLFx0XHQvLyBEZWZhdWx0IHNwZWVkIHdoZW4gb3RoZXJzIGZhbHNleVxyXG5cdFx0c2Nyb2xsUGFnZVBlcmNlbnRcdFx0XHQ6IC44XHRcdC8vIFBlcmNlbnQgb2YgdmlzaWJsZSBhcmVhIHNjcm9sbGVkIHdoZW4gcGFnZVVwL0Rvd24gb3IgdHJhY2sgYXJlYSBwcmVzc2VkXHJcblx0fTtcclxuXHJcbn0pKGpRdWVyeSx0aGlzKTtcclxuXHJcbiIsIi8qKlxyXG4gKiBAY2xhc3NEZXNjcmlwdGlvblx0Q3VzdG9tIHNlbGVjdGJveCB3aXRoIHRoZSBvcHRpb24gdG8gdXNlIGpTY3JvbGxQYW5lXHJcbiAqXHRcdFx0XHRcdFx0Zm9yIGEgY3VzdG9tIHNjcm9sbGJhci4gSGlkZXMgdGhlIG9yaWdpbmFsIHNlbGVjdGJveCBvZmYgXHJcbiAqXHRcdFx0XHRcdFx0c2NyZWVuIHNvIHRoYXQgaXQgd2lsbCBzdGlsbCBnZXQgcGlja2VkIHVwIGFzIGEgZm9ybSBlbGVtZW50LlxyXG4gKlxyXG4gKiBAdmVyc2lvblx0XHRcdFx0MS4xLjBcclxuICpcclxuICogQGF1dGhvclx0XHRcdFx0Um9iIExhUGxhY2EgLSByb2IubGFwbGFjYUBnbWFpbC5jb21cclxuICogQGRhdGVcdFx0XHRcdDA0LzA1LzIwMTBcclxuICogQGxhc3RVcGRhdGVcdFx0XHQwMy8wOS8yMDE0IFxyXG4gKiBAZGVwZW5kZW5jeVx0XHRcdGpTY3JvbGxQYW5lLmpzXHRcdFx0b3B0aW9uYWxcclxuICpcdFx0XHRcdFx0XHRqcXVlcnkubW91c2V3aGVlbC5qc1x0b3B0aW9uYWxcclxuICogXHJcbiAqIEBwYXJhbSB7RE9NRWxlbWVudH1cdG9wdGlvbnMuc2VsZWN0Ym94XHRcdFx0dGhlIHNlbGVjdGJveCB0aGF0IGlzIGJlaW5nIGN1c3RvbWl6ZWQsIFJFUVVJUkVEIChkZWZhdWx0IHVuZGVmaW5lZClcclxuICogQHBhcmFtIHtCb29sZWFufVx0XHRvcHRpb25zLmN1c3RvbVNjcm9sbGJhclx0XHR3aGV0aGVyIG9yIG5vdCB0byB1c2UgalNjcm9sbFBhbmUgdG8gcmVzdHlsZSBzeXN0ZW0gc2Nyb2xsYmFyIChkZWZhdWx0IGZhbHNlKVxyXG4gKiBAcGFyYW0ge051bWJlcn1cdFx0b3B0aW9ucy56SW5kZXhcdFx0XHRcdFRoZSBkZWZhdWx0IHotaW5kZXggb2YgdGhlIHNlbGVjdGJveC4gKGRlZmF1bHQgMTAwKVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVx0b3B0aW9ucy5jaGFuZ2VDYWxsYmFja1x0XHRGdW5jdGlvbiB0aGF0IGdldHMgZXhlY3V0ZWQgb24gY2hhbmdlIG9mIHRoZSBzZWxlY3Rib3ggKGRlZmF1bHQgZW1wdHkgZnVuY3Rpb24pXHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259XHRvcHRpb25zLm1hbmFnZXJcdFx0XHRcdE9wdGlvbmFsIHJlZmVyZW5jZSB0byBhIGNsYXNzIHRoYXQgbWFuYWdlcyBhbGwgaW5zdGFuY2VzIG9mIHRoZSBzZWxlY3Rib3hcclxuICogQHBhcmFtIHtPYmplY3R9XHRcdG9wdGlvbnMuc2Nyb2xsT3B0aW9uc1x0XHRqU2Nyb2xsUGFuZSBvcHRpb25zLCByZWZlciB0byBqc2Nyb2xscGFuZSBkb2N1bWVudGF0aW9uIGZvciBwb3NzaWJsZSBvcHRpb25zXHJcbiAqXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRodHRwOi8vd3d3LmtlbHZpbmx1Y2suY29tL2Fzc2V0cy9qcXVlcnkvalNjcm9sbFBhbmUvc2NyaXB0cy9qU2Nyb2xsUGFuZS5qc1xyXG4gKi9cclxuKGZ1bmN0aW9uKCQpe1xyXG5cdHdpbmRvdy5TZWxlY3RCb3hNYW5hZ2VyID0gZnVuY3Rpb24ob3B0aW9ucyl7XHJcblx0XHR2YXIgc2JzID0gW10sXHJcblx0XHRcdHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdCQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0aWYoJChlLnRhcmdldCkucGFyZW50cyhcIi5jdXN0b21TZWxlY3RcIikuc2l6ZSgpID09PSAwKSB7XHJcblx0XHRcdFx0c2VsZi5jbG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLmFkZCA9IGZ1bmN0aW9uKHNiKSB7XHJcblx0XHRcdHNicy5wdXNoKHNiKTtcclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHQkKHNicykuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR0aGlzLmNsb3NlKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHR2YXIgc2JfbWFuYWdlciA9IG5ldyBTZWxlY3RCb3hNYW5hZ2VyKCk7XHJcblxyXG5cdHdpbmRvdy5TZWxlY3RCb3ggPSBmdW5jdGlvbihvcHRpb25zKXtcclxuXHRcdHZhciBzZWxmID0gdGhpcyxcclxuXHRcdGNmZyA9ICQuZXh0ZW5kKHRydWUsIHtcclxuXHRcdFx0bWFuYWdlcjogc2JfbWFuYWdlcixcclxuXHRcdFx0Y3VzdG9tU2Nyb2xsYmFyOiB0cnVlLFxyXG5cdFx0XHR6SW5kZXg6IDEwMCxcclxuXHRcdFx0Y2hhbmdlQ2FsbGJhY2s6IGZ1bmN0aW9uKHZhbCkgeyB9LFxyXG5cdFx0XHR0cnVuY2F0ZTogZnVuY3Rpb24oc3RyKSB7cmV0dXJuIHN0cjt9LFxyXG5cdFx0XHRzY3JvbGxPcHRpb25zOiB7fVxyXG5cdFx0fSwgb3B0aW9ucyk7XHJcblxyXG5cdFx0dmFyICRjdXN0b21TZWxlY3QsICRzZWxlY3RlZFZhbHVlLCAkc2VsZWN0VmFsdWVXcmFwLCAkc2VsZWN0TGlzdCwgJGRsLCAkb3B0aW9ucyxcclxuXHRcdFx0Rk9DVVNFRF9DTEFTUyA9IFwiZm9jdXNlZFwiLFxyXG5cdFx0XHRTRUxFQ1RFRF9DTEFTUyA9IFwic2VsZWN0ZWRcIixcclxuXHRcdFx0U0VMRUNUX09QRU5fQ0xBU1MgPSBcInNlbGVjdC1vcGVuXCIsXHJcblx0XHRcdERJU0FCTEVEX0NMQVNTID0gXCJkaXNhYmxlZFwiLFxyXG5cdFx0XHRIT1ZFUkVEX0NMQVNTID0gXCJob3ZlcmVkXCIsXHJcblx0XHRcdF91c2VEZWZhdWx0QmVoYXZpb3IgPSBmYWxzZSxcclxuXHRcdFx0X2lzT3BlbiA9IGZhbHNlLFxyXG5cdFx0XHRfaXNFbmFibGVkID0gdHJ1ZSxcclxuXHRcdFx0X2lzRm9jdXNlZCA9IGZhbHNlLFxyXG5cdFx0XHRfc2VsZWN0ZWRWYWx1ZSA9IFwiXCI7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY29uc3RydWN0b3JcclxuXHRcdCAqL1xyXG5cclxuXHRcdGZ1bmN0aW9uIGluaXQoKSB7XHJcblx0XHRcdC8vIFRPRE86IGRvbid0IHVzZSB1c2VyQWdlbnQgbWF0Y2hpbmcgdG8gZGV0ZWN0IGRlZmF1bHRpbmcgdG8gZGV2aWNlIHNwZWNpZmljIGJlaGF2aW9yXHJcblx0XHRcdF91c2VEZWZhdWx0QmVoYXZpb3IgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUGFkfGlQaG9uZXxBbmRyb2lkfElFTW9iaWxlfEJsYWNrQmVycnkvaSkgPyB0cnVlIDogZmFsc2U7XHJcblxyXG5cdFx0XHRpZiggX3VzZURlZmF1bHRCZWhhdmlvciApIHtcclxuXHRcdFx0XHRjZmcuc2VsZWN0Ym94LmFkZENsYXNzKFwidXNlLWRlZmF1bHRcIik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBzZWxlY3RJZCA9IFwiXCIsXHJcblx0XHRcdFx0c2VsZWN0ZWRDbGFzcyA9IGNmZy5zZWxlY3Rib3guYXR0cihcImNsYXNzXCIpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRpZih0eXBlb2YgY2ZnLnNlbGVjdGJveC5hdHRyKFwiaWRcIikgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdFx0XHRzZWxlY3RJZCA9ICdpZD1cInNlbGVjdC0nK2NmZy5zZWxlY3Rib3guYXR0cihcImlkXCIpKydcIic7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNmZy5zZWxlY3Rib3gud3JhcCgnPGRpdiBjbGFzcz1cImN1c3RvbVNlbGVjdCAnK3NlbGVjdGVkQ2xhc3MrJ1wiICcrc2VsZWN0SWQrJyAvPicpO1xyXG5cclxuXHRcdFx0JGN1c3RvbVNlbGVjdCA9IGNmZy5zZWxlY3Rib3gucGFyZW50cyhcIi5jdXN0b21TZWxlY3RcIik7XHJcblx0XHRcdCRvcHRpb25zID0gY2ZnLnNlbGVjdGJveC5maW5kKFwib3B0aW9uXCIpO1xyXG5cclxuXHRcdFx0dmFyIHNlbGVjdExpc3RIVE1MID0gWyc8ZGl2IGNsYXNzPVwic2VsZWN0TGlzdFwiPjxkaXYgY2xhc3M9XCJzZWxlY3RMaXN0T3V0ZXJXcmFwXCI+PGRpdiBjbGFzcz1cInNlbGVjdExpc3RJbm5lcldyYXBcIj48ZGl2IGNsYXNzPVwic2VsZWN0TGlzdFRvcFwiPjwvZGl2PjxkbD4nXTtcclxuXHRcdFx0c2VsZWN0TGlzdEhUTUwucHVzaChfcmVuZGVyT3B0aW9ucygpKTtcclxuXHRcdFx0c2VsZWN0TGlzdEhUTUwucHVzaCgnPC9kbD48ZGl2IGNsYXNzPVwic2VsZWN0TGlzdEJvdHRvbVwiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PicpO1xyXG5cclxuXHRcdFx0JGN1c3RvbVNlbGVjdC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJzZWxlY3RWYWx1ZVdyYXBcIj48ZGl2IGNsYXNzPVwic2VsZWN0ZWRWYWx1ZVwiPicrX3NlbGVjdGVkVmFsdWUrJzwvZGl2PiA8c3BhbiBjbGFzcz1cImNhcmV0XCI+PC9zcGFuPiA8L2Rpdj4nICsgc2VsZWN0TGlzdEhUTUwuam9pbihcIlwiKSk7XHJcblxyXG5cdFx0XHQkZGwgPSAkY3VzdG9tU2VsZWN0LmZpbmQoXCJkbFwiKTtcclxuXHRcdFx0JHNlbGVjdGVkVmFsdWUgPSAkY3VzdG9tU2VsZWN0LmZpbmQoXCIuc2VsZWN0ZWRWYWx1ZVwiKTtcclxuXHRcdFx0JHNlbGVjdFZhbHVlV3JhcCA9ICRjdXN0b21TZWxlY3QuZmluZChcIi5zZWxlY3RWYWx1ZVdyYXBcIik7XHJcblx0XHRcdCRzZWxlY3RMaXN0ID0gJGN1c3RvbVNlbGVjdC5maW5kKFwiLnNlbGVjdExpc3RcIik7XHJcblxyXG5cdFx0XHQkY3VzdG9tU2VsZWN0LndpZHRoKGNmZy53aWR0aCk7XHJcblx0XHRcdCRkbC53aWR0aChjZmcud2lkdGggLSAyKTtcclxuXHJcblx0XHRcdF9iaW5kRXZlbnRzKCk7XHJcblxyXG5cdFx0XHRzYl9tYW5hZ2VyLmFkZChzZWxmKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHJcblx0XHRmdW5jdGlvbiBfYmluZEV2ZW50cygpIHtcclxuXHRcdFx0JHNlbGVjdFZhbHVlV3JhcC5jbGljayhmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZihfaXNPcGVuKSB7XHJcblx0XHRcdFx0XHRjZmcuc2VsZWN0Ym94LmZvY3VzKCk7XHJcblx0XHRcdFx0XHRzZWxmLmNsb3NlKCk7XHJcblx0XHRcdFx0fSBlbHNlIGlmKF9pc0VuYWJsZWQpIHtcclxuXHRcdFx0XHRcdGlmKCBfdXNlRGVmYXVsdEJlaGF2aW9yICkge1xyXG5cdFx0XHRcdFx0XHRjZmcuc2VsZWN0Ym94LmZvY3VzKCk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRzZWxmLm9wZW4oKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly8gZGVsZWdhdGVkIGV2ZW50c1xyXG5cdFx0XHQkZGwuY2xpY2soZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcblxyXG5cdFx0XHRcdGlmKCR0YXJnZXQuaXMoXCJkZFwiKSB8fCAkdGFyZ2V0LnBhcmVudHMoXCJkZFwiKSkge1xyXG5cdFx0XHRcdFx0aWYoZS50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9IFwiZGRcIikge1xyXG5cdFx0XHRcdFx0XHQkdGFyZ2V0ID0gJHRhcmdldC5wYXJlbnRzKFwiZGRcIik7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYoISR0YXJnZXQuaGFzQ2xhc3MoRElTQUJMRURfQ0xBU1MpICYmICR0YXJnZXQuZ2V0KDApKSB7XHJcblx0XHRcdFx0XHRcdHNlbGYuanVtcFRvSW5kZXgoJHRhcmdldC5nZXQoMCkuY2xhc3NOYW1lLnNwbGl0KFwiIFwiKVswXS5zcGxpdChcIi1cIilbMV0pO1xyXG5cdFx0XHRcdFx0XHRzZWxmLmNsb3NlKCk7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiggISBfdXNlRGVmYXVsdEJlaGF2aW9yICkge1xyXG5cdFx0XHRcdFx0XHRcdGNmZy5zZWxlY3Rib3guZm9jdXMoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRjZmcuc2VsZWN0Ym94LmZvY3VzKGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRfaXNGb2N1c2VkID0gdHJ1ZTtcclxuXHRcdFx0XHQkY3VzdG9tU2VsZWN0LmFkZENsYXNzKEZPQ1VTRURfQ0xBU1MpO1xyXG5cdFx0XHR9KS5ibHVyKGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdF9pc0ZvY3VzZWQgPSBmYWxzZTtcclxuXHRcdFx0XHQkY3VzdG9tU2VsZWN0LnJlbW92ZUNsYXNzKEZPQ1VTRURfQ0xBU1MpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGlmKCBfdXNlRGVmYXVsdEJlaGF2aW9yICkge1xyXG5cdFx0XHRcdGNmZy5zZWxlY3Rib3guY2hhbmdlKGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRcdF91cGRhdGVWYWx1ZSggJCh0aGlzKS5maW5kKFwib3B0aW9uOnNlbGVjdGVkXCIpLmh0bWwoKSApO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNmZy5zZWxlY3Rib3gua2V5dXAoZnVuY3Rpb24oZSl7XHJcblx0XHRcdFx0c2VsZi5jbG9zZSgpO1xyXG5cdFx0XHRcdCRvcHRpb25zLmVhY2goZnVuY3Rpb24oaSwgaXRtKXtcdFx0XHJcblx0XHRcdFx0XHRpZihpdG0uc2VsZWN0ZWQpIHtcclxuXHRcdFx0XHRcdFx0c2VsZi5qdW1wVG9JbmRleChpKTtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdF9iaW5kSG92ZXIoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHJcblx0XHRmdW5jdGlvbiBfYmluZEhvdmVyKCkge1xyXG5cdFx0XHR2YXIgJGRkcyA9ICQoXCIuY3VzdG9tU2VsZWN0IGRkXCIpO1xyXG5cdFx0XHQkZGRzLm9mZihcIm1vdXNlb3ZlclwiKTtcclxuXHRcdFx0JGRkcy5vZmYoXCJtb3VzZW91dFwiKTtcclxuXHJcblx0XHRcdCRkZHMub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRcdHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcblx0XHRcdFx0aWYoZS50YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9IFwiZGRcIikge1xyXG5cdFx0XHRcdFx0JHRhcmdldCA9ICR0YXJnZXQucGFyZW50cyhcImRkXCIpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQkdGFyZ2V0LmFkZENsYXNzKEhPVkVSRURfQ0xBU1MpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdCRkZHMub24oXCJtb3VzZW91dFwiLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0dmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuXHRcdFx0XHRpZihlLnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT0gXCJkZFwiKSB7XHJcblx0XHRcdFx0XHQkdGFyZ2V0ID0gJHRhcmdldC5wYXJlbnRzKFwiZGRcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdCR0YXJnZXQucmVtb3ZlQ2xhc3MoSE9WRVJFRF9DTEFTUyk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHZhbFxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cclxuXHRcdGZ1bmN0aW9uIF91cGRhdGVWYWx1ZSh2YWwpIHtcclxuXHRcdFx0aWYoJHNlbGVjdGVkVmFsdWUuaHRtbCgpICE9IHZhbCkge1xyXG5cdFx0XHRcdCRzZWxlY3RlZFZhbHVlLmh0bWwoX3RydW5jYXRlKHZhbCkpO1xyXG5cdFx0XHRcdGNmZy5jaGFuZ2VDYWxsYmFjayhjZmcuc2VsZWN0Ym94LnZhbCgpKTtcclxuXHRcdFx0XHRpZiggIV91c2VEZWZhdWx0QmVoYXZpb3IgKSB7XHJcblx0XHRcdFx0XHRjZmcuc2VsZWN0Ym94LnRyaWdnZXIoXCJjaGFuZ2VcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqIFxyXG5cdFx0ICogQHJldHVybnMge1N0cmluZ30gSFRNTCBnZW5lcmF0ZWQgYWZ0ZXIgcHJvY2Vzc2luZyBvcHRpb25zXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblxyXG5cdFx0ZnVuY3Rpb24gX3JlbmRlck9wdGlvbnMoKSB7XHJcblx0XHRcdHZhciBvcHRpb25IVE1MID0gW107XHJcblxyXG5cdFx0XHQkb3B0aW9ucy5lYWNoKGZ1bmN0aW9uKGksIGl0bSkge1xyXG5cdFx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyksXHJcblx0XHRcdFx0XHRvcHRncm91cCA9ICR0aGlzLnBhcmVudHMoJ29wdGdyb3VwJyksXHJcblx0XHRcdFx0XHRhZGRsT3B0Q2xhc3NlcyA9IFwiXCIsXHJcblx0XHRcdFx0XHRpY29uTWFya3VwID0gXCJcIjtcclxuXHJcblx0XHRcdFx0Ly8gcmVuZGVyIG9wdGdyb3VwcyBpZiBwcmVzZW50IGluIG9yaWdpbmFsIHNlbGVjdFxyXG5cdFx0XHRcdGlmIChvcHRncm91cC5sZW5ndGggPiAwICYmICR0aGlzLnByZXYoKS5sZW5ndGggPT09IDApe1xyXG5cdFx0XHRcdFx0b3B0aW9uSFRNTC5wdXNoKCc8ZHQ+JytvcHRncm91cC5hdHRyKCdsYWJlbCcpKyc8L2R0PicpO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gaWYgb3B0aW9uIGhhcyBhIGNsYXNzbmFtZSBhZGQgdGhhdCB0byBjdXN0b20gc2VsZWN0IGFzIHdlbGxcclxuXHRcdFx0XHRpZihpdG0uY2xhc3NOYW1lICE9PSBcIlwiKSB7XHJcblx0XHRcdFx0XHQkKGl0bS5jbGFzc05hbWUuc3BsaXQoXCIgXCIpKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRpY29uTWFya3VwICs9ICc8c3BhbiBjbGFzcz1cIicgKyB0aGlzICsgJ1wiPjwvc3Bhbj4nO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBhZGQgc2VsZWN0ZWQgY2xhc3MgdG8gd2hhdGV2ZXIgb3B0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmVcclxuXHRcdFx0XHRpZihpdG0uc2VsZWN0ZWQgJiYgIWl0bS5kaXNhYmxlZCkge1xyXG5cdFx0XHRcdFx0X3NlbGVjdGVkVmFsdWUgPSBpY29uTWFya3VwICsgX3RydW5jYXRlKCQoaXRtKS5odG1sKCkpO1xyXG5cdFx0XHRcdFx0YWRkbE9wdENsYXNzZXMgPSBcIiBcIiArIFNFTEVDVEVEX0NMQVNTO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly8gQ2hlY2sgZm9yIGRpc2FibGVkIG9wdGlvbnNcclxuXHRcdFx0XHRpZiggaXRtLmRpc2FibGVkICkge1xyXG5cdFx0XHRcdFx0YWRkbE9wdENsYXNzZXMgKz0gXCIgXCIgKyBESVNBQkxFRF9DTEFTUztcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG9wdGlvbkhUTUwucHVzaCgnPGRkIGNsYXNzPVwiaXRtLScraSsnICcgKyBhZGRsT3B0Q2xhc3NlcyArICdcIj4nICsgaWNvbk1hcmt1cCArIGl0bS5pbm5lckhUTUwgKyAnPC9kZD4nKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRpZigkc2VsZWN0ZWRWYWx1ZSAmJiAkc2VsZWN0ZWRWYWx1ZS5nZXQoMCkgIT09IG51bGwpIHtcclxuXHRcdFx0XHQkc2VsZWN0ZWRWYWx1ZS5odG1sKF9zZWxlY3RlZFZhbHVlKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG9wdGlvbkhUTUwuam9pbihcIlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHJcblx0XHRmdW5jdGlvbiBfc2V0dXBTY3JvbGxiYXIoKSB7XHJcblx0XHRcdCRkbC5jc3MoXCJoZWlnaHRcIixcImF1dG9cIik7XHJcblx0XHRcdGlmKGNmZy5oZWlnaHQgJiYgJGRsLmhlaWdodCgpID4gY2ZnLmhlaWdodCkge1xyXG5cdFx0XHRcdCRkbC5jc3MoXCJoZWlnaHRcIiwgY2ZnLmhlaWdodCk7XHJcblx0XHRcdFx0aWYoY2ZnLmN1c3RvbVNjcm9sbGJhcikge1xyXG5cdFx0XHRcdFx0c2VsZi5zY3JvbGxwYW5lID0gJGRsLmpTY3JvbGxQYW5lKCQuZXh0ZW5kKHtcclxuXHRcdFx0XHRcdFx0Y29udGVudFdpZHRoOiAyMDBcclxuXHRcdFx0XHRcdH0sIGNmZy5zY3JvbGxPcHRpb25zKSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCRkbC5hZGRDbGFzcyhcImRlZmF1bHRTY3JvbGxiYXJcIik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCRkbC5jc3Moe292ZXJmbG93OiBcImhpZGRlblwifSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcclxuXHRcdCAqIEByZXR1cm5zIHRydW5jYXRlZCBkaXNwbGF5IHN0cmluZ1xyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cclxuXHRcdGZ1bmN0aW9uIF90cnVuY2F0ZShzdHIpIHtcclxuXHRcdFx0dmFyIGFyciA9IHN0ci5zcGxpdChcIjwvc3Bhbj5cIik7XHJcblx0XHRcdHZhciB2YWxUb1RydW5jID0gYXJyW2Fyci5sZW5ndGggLSAxXTtcclxuXHRcdFx0YXJyW2Fyci5sZW5ndGggLSAxXSA9IFwiXCI7XHJcblx0XHRcdHZhciBzcGFucyA9IGFyci5qb2luKFwiPC9TUEFOPlwiKTtcclxuXHJcblx0XHRcdHJldHVybiBzcGFucyArIGNmZy50cnVuY2F0ZSh2YWxUb1RydW5jKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwdWJsaWNcclxuXHRcdCAqL1xyXG5cclxuXHRcdHRoaXMuc3luYyA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHQkb3B0aW9ucyA9IGNmZy5zZWxlY3Rib3guZmluZChcIm9wdGlvblwiKTtcclxuXHRcdFx0JGRsLmh0bWwoX3JlbmRlck9wdGlvbnMoKSk7XHJcblx0XHRcdF9iaW5kSG92ZXIoKTtcclxuXHRcdFx0X3NldHVwU2Nyb2xsYmFyKCk7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHB1YmxpY1xyXG5cdFx0ICovXHJcblxyXG5cdFx0dGhpcy5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdF9pc0VuYWJsZWQgPSBmYWxzZTtcclxuXHRcdFx0JGN1c3RvbVNlbGVjdC5hZGRDbGFzcyhESVNBQkxFRF9DTEFTUyk7XHJcblx0XHRcdGNmZy5zZWxlY3Rib3guYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHB1YmxpY1xyXG5cdFx0ICovXHJcblxyXG5cdFx0dGhpcy5lbmFibGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0X2lzRW5hYmxlZCA9IHRydWU7XHJcblx0XHRcdCRjdXN0b21TZWxlY3QucmVtb3ZlQ2xhc3MoRElTQUJMRURfQ0xBU1MpO1xyXG5cdFx0XHRjZmcuc2VsZWN0Ym94LnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiKTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAcHVibGljXHJcblx0XHQgKi9cclxuXHJcblx0XHR0aGlzLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdCRjdXN0b21TZWxlY3QucmVtb3ZlQ2xhc3MoU0VMRUNUX09QRU5fQ0xBU1MpO1xyXG5cdFx0XHQkY3VzdG9tU2VsZWN0LmNzcyh7XCJ6LWluZGV4XCI6IGNmZy56SW5kZXh9KTtcclxuXHRcdFx0X2lzT3BlbiA9IGZhbHNlO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwdWJsaWNcclxuXHRcdCAqL1xyXG5cclxuXHRcdHRoaXMub3BlbiA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRfc2V0dXBTY3JvbGxiYXIoKTtcclxuXHRcdFx0aWYoY2ZnLm1hbmFnZXIpIHtcclxuXHRcdFx0XHRjZmcubWFuYWdlci5jbG9zZSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQkY3VzdG9tU2VsZWN0LmFkZENsYXNzKFNFTEVDVF9PUEVOX0NMQVNTKTtcclxuXHJcblx0XHRcdGlmKHNlbGYuc2Nyb2xscGFuZSkge1xyXG5cdFx0XHRcdHNlbGYuc2Nyb2xscGFuZS5kYXRhKCdqc3AnKS5zY3JvbGxUb1koJGN1c3RvbVNlbGVjdC5maW5kKFwiLnNlbGVjdGVkXCIpLnBvc2l0aW9uKCkudG9wKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0JGN1c3RvbVNlbGVjdC5jc3Moe1wiei1pbmRleFwiOiBjZmcuekluZGV4ICsgMX0pO1xyXG5cdFx0XHRfaXNPcGVuID0gdHJ1ZTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcclxuXHRcdCAqIEBwdWJsaWNcclxuXHRcdCAqL1xyXG5cclxuXHRcdHRoaXMuanVtcFRvSW5kZXggPSBmdW5jdGlvbihpbmRleCkge1xyXG5cdFx0XHRjZmcuc2VsZWN0Ym94LmdldCgwKS5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XHJcblx0XHRcdCRjdXN0b21TZWxlY3QuZmluZChcIi5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhTRUxFQ1RFRF9DTEFTUyk7XHJcblx0XHRcdCRjdXN0b21TZWxlY3QuZmluZChcIi5pdG0tXCIgKyBpbmRleCkuYWRkQ2xhc3MoU0VMRUNURURfQ0xBU1MpO1xyXG5cdFx0XHRfdXBkYXRlVmFsdWUoJGN1c3RvbVNlbGVjdC5maW5kKFwiLml0bS1cIiArIGluZGV4KS5odG1sKCkpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxyXG5cdFx0ICogQHJldHVybnMge051bWJlcn0gaW5kZXggb2YgdGhlIHZhbHVlXHJcblx0XHQgKiBAcHVibGljXHJcblx0XHQgKi9cclxuXHJcblx0XHR0aGlzLmp1bXBUb1ZhbHVlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0dmFyIGluZGV4ID0gLTE7XHJcblxyXG5cdFx0XHQkb3B0aW9ucy5lYWNoKGZ1bmN0aW9uKGkpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pbm5lckhUTUw9PXZhbHVlKXtcclxuXHRcdFx0XHRcdGluZGV4ID0gaTtcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0aWYgKGluZGV4IT0tMSl7XHJcblx0XHRcdFx0c2VsZi5qdW1wVG9JbmRleChpbmRleCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBpbmRleDtcclxuXHRcdH07XHJcblxyXG5cdFx0aW5pdCgpO1xyXG5cdH07XHJcbn0pKGpRdWVyeSk7XHJcbiIsIi8qXHJcbiAgICBqUXVlcnkgTWFza2VkIElucHV0IFBsdWdpblxyXG4gICAgQ29weXJpZ2h0IChjKSAyMDA3IC0gMjAxNSBKb3NoIEJ1c2ggKGRpZ2l0YWxidXNoLmNvbSlcclxuICAgIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSAoaHR0cDovL2RpZ2l0YWxidXNoLmNvbS9wcm9qZWN0cy9tYXNrZWQtaW5wdXQtcGx1Z2luLyNsaWNlbnNlKVxyXG4gICAgVmVyc2lvbjogMS40LjFcclxuKi9cclxuIWZ1bmN0aW9uKGZhY3RvcnkpIHtcclxuICAgIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWyBcImpxdWVyeVwiIF0sIGZhY3RvcnkpIDogZmFjdG9yeShcIm9iamVjdFwiID09IHR5cGVvZiBleHBvcnRzID8gcmVxdWlyZShcImpxdWVyeVwiKSA6IGpRdWVyeSk7XHJcbn0oZnVuY3Rpb24oJCkge1xyXG4gICAgdmFyIGNhcmV0VGltZW91dElkLCB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQsIGlQaG9uZSA9IC9pcGhvbmUvaS50ZXN0KHVhKSwgY2hyb21lID0gL2Nocm9tZS9pLnRlc3QodWEpLCBhbmRyb2lkID0gL2FuZHJvaWQvaS50ZXN0KHVhKTtcclxuICAgICQubWFzayA9IHtcclxuICAgICAgICBkZWZpbml0aW9uczoge1xyXG4gICAgICAgICAgICBcIjlcIjogXCJbMC05XVwiLFxyXG4gICAgICAgICAgICBhOiBcIltBLVphLXpdXCIsXHJcbiAgICAgICAgICAgIFwiKlwiOiBcIltBLVphLXowLTldXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIGF1dG9jbGVhcjogITAsXHJcbiAgICAgICAgZGF0YU5hbWU6IFwicmF3TWFza0ZuXCIsXHJcbiAgICAgICAgcGxhY2Vob2xkZXI6IFwiX1wiXHJcbiAgICB9LCAkLmZuLmV4dGVuZCh7XHJcbiAgICAgICAgY2FyZXQ6IGZ1bmN0aW9uKGJlZ2luLCBlbmQpIHtcclxuICAgICAgICAgICAgdmFyIHJhbmdlO1xyXG4gICAgICAgICAgICBpZiAoMCAhPT0gdGhpcy5sZW5ndGggJiYgIXRoaXMuaXMoXCI6aGlkZGVuXCIpKSByZXR1cm4gXCJudW1iZXJcIiA9PSB0eXBlb2YgYmVnaW4gPyAoZW5kID0gXCJudW1iZXJcIiA9PSB0eXBlb2YgZW5kID8gZW5kIDogYmVnaW4sIFxyXG4gICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFNlbGVjdGlvblJhbmdlID8gdGhpcy5zZXRTZWxlY3Rpb25SYW5nZShiZWdpbiwgZW5kKSA6IHRoaXMuY3JlYXRlVGV4dFJhbmdlICYmIChyYW5nZSA9IHRoaXMuY3JlYXRlVGV4dFJhbmdlKCksIFxyXG4gICAgICAgICAgICAgICAgcmFuZ2UuY29sbGFwc2UoITApLCByYW5nZS5tb3ZlRW5kKFwiY2hhcmFjdGVyXCIsIGVuZCksIHJhbmdlLm1vdmVTdGFydChcImNoYXJhY3RlclwiLCBiZWdpbiksIFxyXG4gICAgICAgICAgICAgICAgcmFuZ2Uuc2VsZWN0KCkpO1xyXG4gICAgICAgICAgICB9KSkgOiAodGhpc1swXS5zZXRTZWxlY3Rpb25SYW5nZSA/IChiZWdpbiA9IHRoaXNbMF0uc2VsZWN0aW9uU3RhcnQsIGVuZCA9IHRoaXNbMF0uc2VsZWN0aW9uRW5kKSA6IGRvY3VtZW50LnNlbGVjdGlvbiAmJiBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UgJiYgKHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCksIFxyXG4gICAgICAgICAgICBiZWdpbiA9IDAgLSByYW5nZS5kdXBsaWNhdGUoKS5tb3ZlU3RhcnQoXCJjaGFyYWN0ZXJcIiwgLTFlNSksIGVuZCA9IGJlZ2luICsgcmFuZ2UudGV4dC5sZW5ndGgpLCBcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYmVnaW46IGJlZ2luLFxyXG4gICAgICAgICAgICAgICAgZW5kOiBlbmRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bm1hc2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmlnZ2VyKFwidW5tYXNrXCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWFzazogZnVuY3Rpb24obWFzaywgc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0LCBkZWZzLCB0ZXN0cywgcGFydGlhbFBvc2l0aW9uLCBmaXJzdE5vbk1hc2tQb3MsIGxhc3RSZXF1aXJlZE5vbk1hc2tQb3MsIGxlbiwgb2xkVmFsO1xyXG4gICAgICAgICAgICBpZiAoIW1hc2sgJiYgdGhpcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpbnB1dCA9ICQodGhpc1swXSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZm4gPSBpbnB1dC5kYXRhKCQubWFzay5kYXRhTmFtZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4gPyBmbigpIDogdm9pZCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXR0aW5ncyA9ICQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgIGF1dG9jbGVhcjogJC5tYXNrLmF1dG9jbGVhcixcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAkLm1hc2sucGxhY2Vob2xkZXIsXHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWQ6IG51bGxcclxuICAgICAgICAgICAgfSwgc2V0dGluZ3MpLCBkZWZzID0gJC5tYXNrLmRlZmluaXRpb25zLCB0ZXN0cyA9IFtdLCBwYXJ0aWFsUG9zaXRpb24gPSBsZW4gPSBtYXNrLmxlbmd0aCwgXHJcbiAgICAgICAgICAgIGZpcnN0Tm9uTWFza1BvcyA9IG51bGwsICQuZWFjaChtYXNrLnNwbGl0KFwiXCIpLCBmdW5jdGlvbihpLCBjKSB7XHJcbiAgICAgICAgICAgICAgICBcIj9cIiA9PSBjID8gKGxlbi0tLCBwYXJ0aWFsUG9zaXRpb24gPSBpKSA6IGRlZnNbY10gPyAodGVzdHMucHVzaChuZXcgUmVnRXhwKGRlZnNbY10pKSwgXHJcbiAgICAgICAgICAgICAgICBudWxsID09PSBmaXJzdE5vbk1hc2tQb3MgJiYgKGZpcnN0Tm9uTWFza1BvcyA9IHRlc3RzLmxlbmd0aCAtIDEpLCBwYXJ0aWFsUG9zaXRpb24gPiBpICYmIChsYXN0UmVxdWlyZWROb25NYXNrUG9zID0gdGVzdHMubGVuZ3RoIC0gMSkpIDogdGVzdHMucHVzaChudWxsKTtcclxuICAgICAgICAgICAgfSksIHRoaXMudHJpZ2dlcihcInVubWFza1wiKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gdHJ5RmlyZUNvbXBsZXRlZCgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MuY29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBmaXJzdE5vbk1hc2tQb3M7IGxhc3RSZXF1aXJlZE5vbk1hc2tQb3MgPj0gaTsgaSsrKSBpZiAodGVzdHNbaV0gJiYgYnVmZmVyW2ldID09PSBnZXRQbGFjZWhvbGRlcihpKSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5jb21wbGV0ZWQuY2FsbChpbnB1dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0UGxhY2Vob2xkZXIoaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXR0aW5ncy5wbGFjZWhvbGRlci5jaGFyQXQoaSA8IHNldHRpbmdzLnBsYWNlaG9sZGVyLmxlbmd0aCA/IGkgOiAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNlZWtOZXh0KHBvcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoOysrcG9zIDwgbGVuICYmICF0ZXN0c1twb3NdOyApIDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcG9zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2Vla1ByZXYocG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7LS1wb3MgPj0gMCAmJiAhdGVzdHNbcG9zXTsgKSA7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNoaWZ0TChiZWdpbiwgZW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGksIGo7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoMCA+IGJlZ2luKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSBiZWdpbiwgaiA9IHNlZWtOZXh0KGVuZCk7IGxlbiA+IGk7IGkrKykgaWYgKHRlc3RzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShsZW4gPiBqICYmIHRlc3RzW2ldLnRlc3QoYnVmZmVyW2pdKSkpIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyW2ldID0gYnVmZmVyW2pdLCBidWZmZXJbal0gPSBnZXRQbGFjZWhvbGRlcihqKSwgaiA9IHNlZWtOZXh0KGopO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlQnVmZmVyKCksIGlucHV0LmNhcmV0KE1hdGgubWF4KGZpcnN0Tm9uTWFza1BvcywgYmVnaW4pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzaGlmdFIocG9zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGksIGMsIGosIHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gcG9zLCBjID0gZ2V0UGxhY2Vob2xkZXIocG9zKTsgbGVuID4gaTsgaSsrKSBpZiAodGVzdHNbaV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGogPSBzZWVrTmV4dChpKSwgdCA9IGJ1ZmZlcltpXSwgYnVmZmVyW2ldID0gYywgIShsZW4gPiBqICYmIHRlc3RzW2pdLnRlc3QodCkpKSBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYW5kcm9pZElucHV0RXZlbnQoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clZhbCA9IGlucHV0LnZhbCgpLCBwb3MgPSBpbnB1dC5jYXJldCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvbGRWYWwgJiYgb2xkVmFsLmxlbmd0aCAmJiBvbGRWYWwubGVuZ3RoID4gY3VyVmFsLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNoZWNrVmFsKCEwKTsgcG9zLmJlZ2luID4gMCAmJiAhdGVzdHNbcG9zLmJlZ2luIC0gMV07ICkgcG9zLmJlZ2luLS07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgwID09PSBwb3MuYmVnaW4pIGZvciAoO3Bvcy5iZWdpbiA8IGZpcnN0Tm9uTWFza1BvcyAmJiAhdGVzdHNbcG9zLmJlZ2luXTsgKSBwb3MuYmVnaW4rKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQuY2FyZXQocG9zLmJlZ2luLCBwb3MuYmVnaW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY2hlY2tWYWwoITApOyBwb3MuYmVnaW4gPCBsZW4gJiYgIXRlc3RzW3Bvcy5iZWdpbl07ICkgcG9zLmJlZ2luKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LmNhcmV0KHBvcy5iZWdpbiwgcG9zLmJlZ2luKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5RmlyZUNvbXBsZXRlZCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gYmx1ckV2ZW50KCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrVmFsKCksIGlucHV0LnZhbCgpICE9IGZvY3VzVGV4dCAmJiBpbnB1dC5jaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGtleWRvd25FdmVudChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5wcm9wKFwicmVhZG9ubHlcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvcywgYmVnaW4sIGVuZCwgayA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbGRWYWwgPSBpbnB1dC52YWwoKSwgOCA9PT0gayB8fCA0NiA9PT0gayB8fCBpUGhvbmUgJiYgMTI3ID09PSBrID8gKHBvcyA9IGlucHV0LmNhcmV0KCksIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbiA9IHBvcy5iZWdpbiwgZW5kID0gcG9zLmVuZCwgZW5kIC0gYmVnaW4gPT09IDAgJiYgKGJlZ2luID0gNDYgIT09IGsgPyBzZWVrUHJldihiZWdpbikgOiBlbmQgPSBzZWVrTmV4dChiZWdpbiAtIDEpLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gNDYgPT09IGsgPyBzZWVrTmV4dChlbmQpIDogZW5kKSwgY2xlYXJCdWZmZXIoYmVnaW4sIGVuZCksIHNoaWZ0TChiZWdpbiwgZW5kIC0gMSksIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCkpIDogMTMgPT09IGsgPyBibHVyRXZlbnQuY2FsbCh0aGlzLCBlKSA6IDI3ID09PSBrICYmIChpbnB1dC52YWwoZm9jdXNUZXh0KSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LmNhcmV0KDAsIGNoZWNrVmFsKCkpLCBlLnByZXZlbnREZWZhdWx0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGtleXByZXNzRXZlbnQoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5wdXQucHJvcChcInJlYWRvbmx5XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwLCBjLCBuZXh0LCBrID0gZS53aGljaCB8fCBlLmtleUNvZGUsIHBvcyA9IGlucHV0LmNhcmV0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGUuY3RybEtleSB8fCBlLmFsdEtleSB8fCBlLm1ldGFLZXkgfHwgMzIgPiBrKSAmJiBrICYmIDEzICE9PSBrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9zLmVuZCAtIHBvcy5iZWdpbiAhPT0gMCAmJiAoY2xlYXJCdWZmZXIocG9zLmJlZ2luLCBwb3MuZW5kKSwgc2hpZnRMKHBvcy5iZWdpbiwgcG9zLmVuZCAtIDEpKSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwID0gc2Vla05leHQocG9zLmJlZ2luIC0gMSksIGxlbiA+IHAgJiYgKGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGspLCB0ZXN0c1twXS50ZXN0KGMpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaGlmdFIocCksIGJ1ZmZlcltwXSA9IGMsIHdyaXRlQnVmZmVyKCksIG5leHQgPSBzZWVrTmV4dChwKSwgYW5kcm9pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHJveHkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQucHJveHkoJC5mbi5jYXJldCwgaW5wdXQsIG5leHQpKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocHJveHksIDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpbnB1dC5jYXJldChuZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3MuYmVnaW4gPD0gbGFzdFJlcXVpcmVkTm9uTWFza1BvcyAmJiB0cnlGaXJlQ29tcGxldGVkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjbGVhckJ1ZmZlcihzdGFydCwgZW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gc3RhcnQ7IGVuZCA+IGkgJiYgbGVuID4gaTsgaSsrKSB0ZXN0c1tpXSAmJiAoYnVmZmVyW2ldID0gZ2V0UGxhY2Vob2xkZXIoaSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gd3JpdGVCdWZmZXIoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQudmFsKGJ1ZmZlci5qb2luKFwiXCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNoZWNrVmFsKGFsbG93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGksIGMsIHBvcywgdGVzdCA9IGlucHV0LnZhbCgpLCBsYXN0TWF0Y2ggPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBwb3MgPSAwOyBsZW4gPiBpOyBpKyspIGlmICh0ZXN0c1tpXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGJ1ZmZlcltpXSA9IGdldFBsYWNlaG9sZGVyKGkpOyBwb3MrKyA8IHRlc3QubGVuZ3RoOyApIGlmIChjID0gdGVzdC5jaGFyQXQocG9zIC0gMSksIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0c1tpXS50ZXN0KGMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXJbaV0gPSBjLCBsYXN0TWF0Y2ggPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvcyA+IHRlc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckJ1ZmZlcihpICsgMSwgbGVuKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGJ1ZmZlcltpXSA9PT0gdGVzdC5jaGFyQXQocG9zKSAmJiBwb3MrKywgcGFydGlhbFBvc2l0aW9uID4gaSAmJiAobGFzdE1hdGNoID0gaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93ID8gd3JpdGVCdWZmZXIoKSA6IHBhcnRpYWxQb3NpdGlvbiA+IGxhc3RNYXRjaCArIDEgPyBzZXR0aW5ncy5hdXRvY2xlYXIgfHwgYnVmZmVyLmpvaW4oXCJcIikgPT09IGRlZmF1bHRCdWZmZXIgPyAoaW5wdXQudmFsKCkgJiYgaW5wdXQudmFsKFwiXCIpLCBcclxuICAgICAgICAgICAgICAgICAgICBjbGVhckJ1ZmZlcigwLCBsZW4pKSA6IHdyaXRlQnVmZmVyKCkgOiAod3JpdGVCdWZmZXIoKSwgaW5wdXQudmFsKGlucHV0LnZhbCgpLnN1YnN0cmluZygwLCBsYXN0TWF0Y2ggKyAxKSkpLCBcclxuICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsUG9zaXRpb24gPyBpIDogZmlyc3ROb25NYXNrUG9zO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIGlucHV0ID0gJCh0aGlzKSwgYnVmZmVyID0gJC5tYXAobWFzay5zcGxpdChcIlwiKSwgZnVuY3Rpb24oYywgaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIj9cIiAhPSBjID8gZGVmc1tjXSA/IGdldFBsYWNlaG9sZGVyKGkpIDogYyA6IHZvaWQgMDtcclxuICAgICAgICAgICAgICAgIH0pLCBkZWZhdWx0QnVmZmVyID0gYnVmZmVyLmpvaW4oXCJcIiksIGZvY3VzVGV4dCA9IGlucHV0LnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSgkLm1hc2suZGF0YU5hbWUsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChidWZmZXIsIGZ1bmN0aW9uKGMsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlc3RzW2ldICYmIGMgIT0gZ2V0UGxhY2Vob2xkZXIoaSkgPyBjIDogbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9KS5qb2luKFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgfSksIGlucHV0Lm9uZShcInVubWFza1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC5vZmYoXCIubWFza1wiKS5yZW1vdmVEYXRhKCQubWFzay5kYXRhTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9KS5vbihcImZvY3VzLm1hc2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5wcm9wKFwicmVhZG9ubHlcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGNhcmV0VGltZW91dElkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNUZXh0ID0gaW5wdXQudmFsKCksIHBvcyA9IGNoZWNrVmFsKCksIGNhcmV0VGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LmdldCgwKSA9PT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiAod3JpdGVCdWZmZXIoKSwgcG9zID09IG1hc2sucmVwbGFjZShcIj9cIiwgXCJcIikubGVuZ3RoID8gaW5wdXQuY2FyZXQoMCwgcG9zKSA6IGlucHV0LmNhcmV0KHBvcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkub24oXCJibHVyLm1hc2tcIiwgYmx1ckV2ZW50KS5vbihcImtleWRvd24ubWFza1wiLCBrZXlkb3duRXZlbnQpLm9uKFwia2V5cHJlc3MubWFza1wiLCBrZXlwcmVzc0V2ZW50KS5vbihcImlucHV0Lm1hc2sgcGFzdGUubWFza1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dC5wcm9wKFwicmVhZG9ubHlcIikgfHwgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvcyA9IGNoZWNrVmFsKCEwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQuY2FyZXQocG9zKSwgdHJ5RmlyZUNvbXBsZXRlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgICAgICAgICAgfSksIGNocm9tZSAmJiBhbmRyb2lkICYmIGlucHV0Lm9mZihcImlucHV0Lm1hc2tcIikub24oXCJpbnB1dC5tYXNrXCIsIGFuZHJvaWRJbnB1dEV2ZW50KSwgXHJcbiAgICAgICAgICAgICAgICBjaGVja1ZhbCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufSk7IiwiXHJcbmpRdWVyeS5mbi5mc2l6ZUdhbGxlcnkgPSBmdW5jdGlvbiggb3B0aW9ucyApIHtcclxuIFxyXG4gICAgLy8gRGVmYXVsdCBzZXR0aW5nczpcclxuICAgIHZhciBkZWZhdWx0cyA9IHtcclxuICAgICAgICBkZWxheTogJ3F1aXRlIGxvbmcnLFxyXG5cdFx0c2hvd0Z1bGxTY3JlZW5CdG46IGZhbHNlLFxyXG5cdFx0YmFzZVNsaWRlckNsYXNzOiAnZnNjcmVlbicsXHJcblx0XHRhY3RpdmVDbGFzczogJ2FjdGl2ZScsXHJcblx0XHRzbGlkZXJDbGFzczogJy1zbGlkZXItaW5uZXInLFxyXG5cdFx0dGl0bGVDbGFzczogJy1zbGlkZXItdGl0bGUnLFxyXG5cdFx0dGh1bWJzQ2xhc3M6ICctdGh1bWJzJyxcclxuXHRcdGZ1bGxTaXplQ2xhc3M6ICdmdWxsc2NyZWVuJyxcclxuICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogNTAwLFxyXG5cdFx0ZnVsbFNpemU6ICc8YSBocmVmPVwiXCI+PC9hPicsXHJcblx0XHRjb3VudGVyU2xpZGVyOiAnPHNwYW4+PC9zcGFuPicsXHJcblx0XHRwcmV2QnRuVHBsOiAnPGE+PC9hPicsXHJcblx0XHRuZXh0QnRuVHBsOiAnPGE+PC9hPicsXHJcblx0XHRvbk5leHRJbWFnZTogZnVuY3Rpb24oKSB7fSxcclxuXHRcdG9uUHJldkltYWdlOiBmdW5jdGlvbigpIHt9XHJcbiAgICB9O1xyXG4gXHJcbiAgICB2YXIgc2V0dGluZ3MgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCBvcHRpb25zICk7XHJcblx0c2V0dGluZ3Muc2xpZGVyQ2xhc3MgPSBzZXR0aW5ncy5iYXNlU2xpZGVyQ2xhc3MgKyBzZXR0aW5ncy5zbGlkZXJDbGFzcztcclxuXHRzZXR0aW5ncy50aHVtYnNDbGFzcyA9IHNldHRpbmdzLmJhc2VTbGlkZXJDbGFzcyArIHNldHRpbmdzLnRodW1ic0NsYXNzO1xyXG5cdHNldHRpbmdzLnRpdGxlQ2xhc3MgPSBzZXR0aW5ncy5iYXNlU2xpZGVyQ2xhc3MgKyBzZXR0aW5ncy50aXRsZUNsYXNzO1xyXG5cdFxyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpbmRleCkge1xyXG5cdFx0XHJcbiAgICAgICAgLy8gUGx1Z2luIGNvZGUgd291bGQgZ28gaGVyZS4uLlxyXG5cdFx0dmFyICR0aGlzID0gJCh0aGlzKSxcclxuXHRcdFx0JHdpbiA9ICQod2luZG93KSxcclxuXHRcdFx0JHNsaWRlciA9ICQoJy4nICsgc2V0dGluZ3Muc2xpZGVyQ2xhc3MsICR0aGlzKSxcclxuXHRcdFx0JHNsaWRlcyA9ICQoJy4nICsgc2V0dGluZ3Muc2xpZGVyQ2xhc3MgKyAnIGxpJywgJHRoaXMpLFxyXG5cdFx0XHQkdGl0bGVzID0gJCgnLicgKyBzZXR0aW5ncy50aXRsZUNsYXNzICsgJyBsaScsICR0aGlzKSxcclxuXHRcdFx0c2xpZGVzVyA9IDAsXHJcblx0XHRcdHNsaWRlc0xlbiA9ICRzbGlkZXMuc2l6ZSgpLFxyXG5cdFx0XHQkdGh1bWJzID0gJCgnLicgKyBzZXR0aW5ncy50aHVtYnNDbGFzcyArICcgbGknLCAkdGhpcyksXHJcblx0XHRcdHRodW1ic0ggPSAkdGh1bWJzLmVxKDApLm91dGVySGVpZ2h0KHRydWUpLFxyXG5cdFx0XHQkdGh1bWJzUGFuZSA9ICQoJy4nICsgc2V0dGluZ3MudGh1bWJzQ2xhc3MsICR0aGlzKSxcclxuXHRcdFx0JHRodW1ic1BhbmVIID0gJHRodW1ic1BhbmUuaGVpZ2h0KCksXHJcblx0XHRcdG1heEVsZW1lbnRWaWV3cyA9IE1hdGguZmxvb3IoICR0aHVtYnNQYW5lSCAvICR0aHVtYnMuZXEoMCkub3V0ZXJIZWlnaHQodHJ1ZSkgKSxcclxuXHRcdFx0dGh1bWJzVG9wID0gMCxcclxuXHRcdFx0dGh1bWJzTGVuID0gJHRodW1icy5zaXplKCksXHJcblx0XHRcdHByZXYgPSBzbGlkZXNMZW4gLSAxLFxyXG5cdFx0XHRuZXh0ID0gMDtcclxuXHRcdFxyXG5cdFx0dmFyICRwcmV2QnRuID0gJChzZXR0aW5ncy5wcmV2QnRuVHBsKS5hZGRDbGFzcyhzZXR0aW5ncy5iYXNlU2xpZGVyQ2xhc3MgKyAnLXByZXYtYnRuJyksXHJcblx0XHRcdCRuZXh0QnRuID0gJChzZXR0aW5ncy5uZXh0QnRuVHBsKS5hZGRDbGFzcyhzZXR0aW5ncy5iYXNlU2xpZGVyQ2xhc3MgKyAnLW5leHQtYnRuJyksXHJcblx0XHRcdCRjb3VudGVyU2xpZGVyID0gJChzZXR0aW5ncy5jb3VudGVyU2xpZGVyKS5hZGRDbGFzcyhzZXR0aW5ncy5iYXNlU2xpZGVyQ2xhc3MgKyAnLWNvdW50ZXInKSxcclxuXHRcdFx0JGZ1bGxTaXplID0gJChzZXR0aW5ncy5mdWxsU2l6ZSkuYWRkQ2xhc3Moc2V0dGluZ3MuYmFzZVNsaWRlckNsYXNzICsgJy0nICsgc2V0dGluZ3MuZnVsbFNpemVDbGFzcyk7XHJcblxyXG5cdFx0Ly8gRXJyb3IgaXMgbm90IGVxdWFsIGNvdW50IHNsaWRlcyBhbmQgdGh1bWJzXHJcblx0XHRpZihzbGlkZXNMZW4gIT0gdGh1bWJzTGVuIHx8IHNsaWRlc0xlbiA8PSAwICYmIHNsaWRlc0xlbiA9PSB0aHVtYnNMZW4pIHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJDb3VudCBzbGlkZXMgbm90IGVxdWFsIGNvdW50IHRodW1iczogXCIgKyBzbGlkZXNMZW4gKyBcIiAhPSBcIiArIHRodW1ic0xlbik7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0Ly8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC8vXHJcblx0XHRcclxuXHRcdC8vIFByZXYsIE5leHQgYnRucywgQ291bnRlciBzbGlkZXIsIEZ1bGwgU2NyZWVuIGJ0blxyXG5cdFx0JHNsaWRlci5hcHBlbmQoJHByZXZCdG4sICRuZXh0QnRuLCAkY291bnRlclNsaWRlcik7XHJcblx0XHRpZihzZXR0aW5ncy5zaG93RnVsbFNjcmVlbkJ0bikge1xyXG5cdFx0XHQkc2xpZGVyLmFwcGVuZCgkZnVsbFNpemUpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBTZXQgdGhlIEV2ZW50c1xyXG5cdFx0JHRoaXMub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcblx0XHRcdGlmKCR0YXJnZXQuaXMoJHByZXZCdG4pKSB7XHJcblx0XHRcdFx0c2hvd1ByZXZJbWFnZSgpO1xyXG5cdFx0XHR9IGVsc2UgaWYoJHRhcmdldC5pcygkbmV4dEJ0bikpIHtcclxuXHRcdFx0XHRzaG93TmV4dEltYWdlKCk7XHJcblx0XHRcdH0gZWxzZSBpZigkdGFyZ2V0LmlzKCRmdWxsU2l6ZSkpIHtcclxuXHRcdFx0XHRpZigkdGhpcy5oYXNDbGFzcyhzZXR0aW5ncy5mdWxsU2l6ZUNsYXNzKSkge1xyXG5cdFx0XHRcdFx0JHRoaXMucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuZnVsbFNpemVDbGFzcyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCR0aGlzLmFkZENsYXNzKHNldHRpbmdzLmZ1bGxTaXplQ2xhc3MpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIGlmKCR0YXJnZXQuaXMoJHRodW1icykpIHtcclxuXHRcdFx0XHR2YXIgaWR4ID0gJHRodW1icy5pbmRleCgkdGFyZ2V0KTtcclxuXHRcdFx0XHRwcmV2ID0gbmV4dDtcclxuXHRcdFx0XHRuZXh0ID0gaWR4O1xyXG5cdFx0XHRcdHRodW1ic0RpcmVjdCgkdGFyZ2V0KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIFNldCBkZWZhdWx0cyBWYWx1ZXNcclxuXHRcdCRzbGlkZXMuZWFjaChmdW5jdGlvbihpZHgpIHtcclxuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKSxcclxuXHRcdFx0XHQkdGhpc0EgPSAkdGhpcy5maW5kKCdhJyksXHJcblx0XHRcdFx0dGhpc0hyZWYgPSAkdGhpc0EuYXR0cignaHJlZicpLFxyXG5cdFx0XHRcdCR0aHVtYnNBID0gJHRodW1icy5lcShpZHgpLmZpbmQoJ2EnKSxcclxuXHRcdFx0XHR0aHVtYnNIcmVmID0gJHRodW1ic0EuYXR0cignaHJlZicpO1xyXG5cdFx0XHRzbGlkZXNXID0gJHRoaXMud2lkdGgoKTtcclxuXHRcdFx0aWYoaWR4ID4gMCkge1xyXG5cdFx0XHRcdCR0aGlzLmNzcyh7XHJcblx0XHRcdFx0XHQnbGVmdCc6IFwiMTAwJVwiXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0JHRpdGxlc1xyXG5cdFx0XHRcdFx0LmVxKGlkeClcclxuXHRcdFx0XHRcdC5jc3Moe1xyXG5cdFx0XHRcdFx0XHQnb3BhY2l0eSc6IDAuMCBcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCR0aHVtYnNcclxuXHRcdFx0XHRcdC5lcShpZHgpXHJcblx0XHRcdFx0XHRcdC5hZGRDbGFzcyhzZXR0aW5ncy5hY3RpdmVDbGFzcyk7XHJcblx0XHRcdFx0JHRpdGxlc1xyXG5cdFx0XHRcdFx0LmVxKGlkeClcclxuXHRcdFx0XHRcdFx0LmFkZENsYXNzKHNldHRpbmdzLmFjdGl2ZUNsYXNzKVxyXG5cdFx0XHRcdFx0LnBhcmVudCgpXHJcblx0XHRcdFx0XHRcdC5jc3Moe1xyXG5cdFx0XHRcdFx0XHRcdCdoZWlnaHQnOiAkdGl0bGVzLmVxKGlkeCkub3V0ZXJIZWlnaHQodHJ1ZSlcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdFx0JHRoaXNBLmNzcyh7XHJcblx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyB0aGlzSHJlZiArICcpJ1xyXG5cdFx0XHR9KS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHQkdGh1bWJzQS5jc3Moe1xyXG5cdFx0XHRcdCdiYWNrZ3JvdW5kLWltYWdlJzogJ3VybCgnICsgdGh1bWJzSHJlZiArICcpJ1xyXG5cdFx0XHR9KS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHQkY291bnRlclNsaWRlclxyXG5cdFx0XHRcdC5odG1sKChuZXh0ICsgMSkgKyAnPGk+PC9pPicgKyBzbGlkZXNMZW4pO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIFNsaWRlIEFuaW1hdGVcclxuXHRcdGZ1bmN0aW9uIGFuaW1hdGVJbWFnZShkaXJlY3QpIHtcclxuXHRcdFx0aWYoZGlyZWN0KSB7XHJcblx0XHRcdFx0JHNsaWRlc1xyXG5cdFx0XHRcdFx0LmVxKHByZXYpXHJcblx0XHRcdFx0XHRcdC5jc3Moe1xyXG5cdFx0XHRcdFx0XHRcdCdsZWZ0JzogMFxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHQuYW5pbWF0ZSh7XHJcblx0XHRcdFx0XHRcdFx0J2xlZnQnOiBcIjEwMCVcIlxyXG5cdFx0XHRcdFx0XHR9LCBzZXR0aW5ncy5hbmltYXRpb25EdXJhdGlvbilcclxuXHRcdFx0XHRcdC5lbmQoKVxyXG5cdFx0XHRcdFx0LmVxKG5leHQpXHJcblx0XHRcdFx0XHRcdC5jc3Moe1xyXG5cdFx0XHRcdFx0XHRcdCdsZWZ0JzogXCItMTAwJVwiXHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHRcdC5hbmltYXRlKHtcclxuXHRcdFx0XHRcdFx0XHQnbGVmdCc6IDBcclxuXHRcdFx0XHRcdFx0fSwgc2V0dGluZ3MuYW5pbWF0aW9uRHVyYXRpb24pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCRzbGlkZXNcclxuXHRcdFx0XHRcdC5lcShwcmV2KVxyXG5cdFx0XHRcdFx0XHQuY3NzKHtcclxuXHRcdFx0XHRcdFx0XHQnbGVmdCc6IDBcclxuXHRcdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdFx0LmFuaW1hdGUoe1xyXG5cdFx0XHRcdFx0XHRcdCdsZWZ0JzogXCItMTAwJVwiXHJcblx0XHRcdFx0XHRcdH0sIHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uKVxyXG5cdFx0XHRcdFx0LmVuZCgpXHJcblx0XHRcdFx0XHQuZXEobmV4dClcclxuXHRcdFx0XHRcdFx0LmNzcyh7XHJcblx0XHRcdFx0XHRcdFx0J2xlZnQnOiBcIjEwMCVcIlxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0XHQuYW5pbWF0ZSh7XHJcblx0XHRcdFx0XHRcdFx0J2xlZnQnOiAwXHJcblx0XHRcdFx0XHRcdH0sIHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQkdGl0bGVzXHJcblx0XHRcdFx0LmVxKHByZXYpXHJcblx0XHRcdFx0XHQuY3NzKHtcclxuXHRcdFx0XHRcdFx0J3Bvc2l0aW9uJzogJ2Fic29sdXRlJ1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5hbmltYXRlKHtcclxuXHRcdFx0XHRcdFx0J29wYWNpdHknOiAwLjAgXHJcblx0XHRcdFx0XHR9LCBzZXR0aW5ncy5hbmltYXRpb25EdXJhdGlvbiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRcdCQodGhpcykucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHQuZW5kKClcclxuXHRcdFx0XHQuZXEobmV4dClcclxuXHRcdFx0XHRcdC5jc3Moe1xyXG5cdFx0XHRcdFx0XHQncG9zaXRpb24nOiAncmVsYXRpdmUnXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LmFuaW1hdGUoe1xyXG5cdFx0XHRcdFx0XHQnb3BhY2l0eSc6IDEuMCBcclxuXHRcdFx0XHRcdH0sIHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0JCh0aGlzKVxyXG5cdFx0XHRcdFx0XHRcdC5hZGRDbGFzcyhzZXR0aW5ncy5hY3RpdmVDbGFzcyk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0JHRpdGxlc1xyXG5cdFx0XHRcdC5lcShuZXh0KVxyXG5cdFx0XHRcdFx0LnBhcmVudCgpXHJcblx0XHRcdFx0XHQuZGVsYXkoc2V0dGluZ3MuYW5pbWF0aW9uRHVyYXRpb24gLyAyKVxyXG5cdFx0XHRcdFx0LmFuaW1hdGUoe1xyXG5cdFx0XHRcdFx0XHQnaGVpZ2h0JzogJHRpdGxlcy5lcShuZXh0KS5vdXRlckhlaWdodCh0cnVlKVxyXG5cdFx0XHRcdFx0fSwgc2V0dGluZ3MuYW5pbWF0aW9uRHVyYXRpb24pO1xyXG5cdFx0XHQkY291bnRlclNsaWRlclxyXG5cdFx0XHRcdC5odG1sKChuZXh0ICsgMSkgKyAnPGk+PC9pPicgKyBzbGlkZXNMZW4pO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gVGh1bWJzIERpcmVjdFxyXG5cdFx0ZnVuY3Rpb24gdGh1bWJzRGlyZWN0KCR0YXJnZXQpIHtcclxuXHRcdFx0JHRodW1icy5yZW1vdmVDbGFzcyhzZXR0aW5ncy5hY3RpdmVDbGFzcyk7XHJcblx0XHRcdCR0YXJnZXQuYWRkQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xyXG5cdFx0XHRpZihuZXh0ID4gcHJldikge1xyXG5cdFx0XHRcdGlmKG5leHQgPT0gKHNsaWRlc0xlbiAtIDEpICYmIHByZXYgPT0gMCkge1xyXG5cdFx0XHRcdFx0YW5pbWF0ZUltYWdlKDApO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRhbmltYXRlSW1hZ2UoMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2UgaWYobmV4dCAhPSBwcmV2KSB7XHJcblx0XHRcdFx0aWYobmV4dCA9PSAwICYmIHByZXYgPT0gKHNsaWRlc0xlbiAtIDEpKSB7XHJcblx0XHRcdFx0XHRhbmltYXRlSW1hZ2UoMSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGFuaW1hdGVJbWFnZSgwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoKHNsaWRlc0xlbiAtIG1heEVsZW1lbnRWaWV3cykgPiAwKSB7XHJcblx0XHRcdFx0dmFyIGRlbHRhID0gKCR3aW4ud2lkdGgoKSA8IDEwMjQpID8gTWF0aC5mbG9vcigkdGh1bWJzUGFuZUggLyBNYXRoLmFicygkdGh1bWJzUGFuZS5vZmZzZXQoKS5sZWZ0IC0gJHRodW1icy5lcShuZXh0KS5vZmZzZXQoKS5sZWZ0KSkgOiBNYXRoLmZsb29yKCR0aHVtYnNQYW5lSCAvIE1hdGguYWJzKCR0aHVtYnNQYW5lLm9mZnNldCgpLnRvcCAtICR0aHVtYnMuZXEobmV4dCkub2Zmc2V0KCkudG9wKSksXHJcblx0XHRcdFx0XHRtYXJnaW5Ub3AgPSBNYXRoLmFicyhwYXJzZUludCgkdGh1bWJzUGFuZS5maW5kKCd1bCcpLmNzcygnbWFyZ2luLXRvcCcpKSk7XHJcblx0XHRcdFx0bWFyZ2luVG9wID0gbWFyZ2luVG9wID4gMD8gbWFyZ2luVG9wIDogbmV4dCA7XHJcblx0XHRcdFx0dGh1bWJzVG9wID0gKGRlbHRhIDwgMik/ICggKChtYXJnaW5Ub3AgLyB0aHVtYnNIICsgMSkgIDw9IChzbGlkZXNMZW4gLSBtYXhFbGVtZW50Vmlld3MpKSA/IHRodW1ic1RvcCAtIHRodW1ic0ggOiB0aHVtYnNUb3ApIDogdGh1bWJzVG9wICsgdGh1bWJzSCA7XHJcblx0XHRcdFx0dGh1bWJzVG9wID0gKHRodW1ic1RvcCA+IDApPyAwOiB0aHVtYnNUb3AgO1xyXG5cdFx0XHRcdCR0aHVtYnNQYW5lXHJcblx0XHRcdFx0XHQuZmluZCgndWwnKVxyXG5cdFx0XHRcdFx0LmRlbGF5KHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uIC8gNilcclxuXHRcdFx0XHRcdC5hbmltYXRlKHtcclxuXHRcdFx0XHRcdFx0J21hcmdpbi10b3AnOiB0aHVtYnNUb3BcclxuXHRcdFx0XHRcdH0sIHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBTbGlkZSBQcmV2IGltYWdlXHJcblx0XHRmdW5jdGlvbiBzaG93UHJldkltYWdlKCkge1xyXG5cdFx0XHR2YXIgaW1nID0gZ2V0UHJldkltYWdlKCk7XHJcblx0XHRcdC8vYW5pbWF0ZUltYWdlKDEpO1xyXG5cdFx0XHR0aHVtYnNEaXJlY3QoJHRodW1icy5lcShuZXh0KSk7XHJcblx0XHRcdHNldHRpbmdzLm9uUHJldkltYWdlLmNhbGwoaW1nKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gU2xpZGUgTmV4dCBpbWFnZVxyXG5cdFx0ZnVuY3Rpb24gc2hvd05leHRJbWFnZSgpIHtcclxuXHRcdFx0dmFyIGltZyA9IGdldE5leHRJbWFnZSgpO1xyXG5cdFx0XHQvL2FuaW1hdGVJbWFnZSgwKTtcclxuXHRcdFx0dGh1bWJzRGlyZWN0KCR0aHVtYnMuZXEobmV4dCkpO1xyXG5cdFx0XHRzZXR0aW5ncy5vbk5leHRJbWFnZS5jYWxsKGltZyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFJldHVybiBQcmV2IGltYWdlIGluZGV4XHJcblx0XHRmdW5jdGlvbiBnZXRQcmV2SW1hZ2UoKSB7XHJcblx0XHRcdHByZXYgPSBuZXh0O1xyXG5cdFx0XHRpZigobmV4dCAtIDEpID49IDApIHtcclxuXHRcdFx0XHRuZXh0ID0gbmV4dCAtIDE7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bmV4dCA9IHNsaWRlc0xlbiAtIDE7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG5leHQ7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFJldHVybiBOZXh0IGltYWdlIGluZGV4XHJcblx0XHRmdW5jdGlvbiBnZXROZXh0SW1hZ2UoKSB7XHJcblx0XHRcdHByZXYgPSBuZXh0O1xyXG5cdFx0XHRpZigobmV4dCArIDEpIDwgc2xpZGVzTGVuKSB7XHJcblx0XHRcdFx0bmV4dCA9IG5leHQgKyAxO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG5leHQgPSAwO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBuZXh0O1xyXG5cdFx0fVxyXG5cclxuICAgIH0pO1xyXG4gXHJcbn07IiwiXHJcbiQoZG9jdW1lbnQpLmZvdW5kYXRpb24oKTtcclxuXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblxyXG5cdC8vIEdyYWIgYWxsIGVsZW1lbnRzIHdpdGggdGhlIGNsYXNzIFwiaGFzVG9vbHRpcFwiXHJcblx0JCgnLnF0aXAtdGlwJykuZWFjaChmdW5jdGlvbigpIHsgLy8gTm90aWNlIHRoZSAuZWFjaCgpIGxvb3AsIGRpc2N1c3NlZCBiZWxvd1xyXG5cdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcclxuXHRcdCQodGhpcykucXRpcCh7XHJcblx0XHRcdGNvbnRlbnQ6IHtcclxuXHRcdFx0XHR0ZXh0OiAkKHRoaXMpLm5leHQoJy5xdGlwLXRpdGxlYmFyJyksIC8vIFVzZSB0aGUgXCJkaXZcIiBlbGVtZW50IG5leHQgdG8gdGhpcyBmb3IgdGhlIGNvbnRlbnRcclxuXHRcdFx0XHRidXR0b246ICfQl9Cw0LrRgNGL0YLRjCdcclxuXHRcdFx0fSxcclxuXHRcdCAgICBoaWRlOiB7XHJcblx0XHQgICAgICAgIGV2ZW50OiB0cnVlLFxyXG5cdFx0XHRcdGRlbGF5OiAyMDBcclxuXHRcdCAgICB9LFxyXG4gICAgICAgICAgICBzaG93OiB7XHJcbiAgICAgICAgICAgICAgICBldmVudDogJ2NsaWNrJyxcclxuICAgICAgICAgICAgICAgIGRlbGF5OiA0MCxcclxuICAgICAgICAgICAgICAgIHNvbG86IHRydWVcclxuICAgICAgICAgICAgfSxcclxuXHRcdCAgICBwb3NpdGlvbjoge1xyXG5cdFx0ICAgICAgICBteTogJHRoaXMuZGF0YSgncXRpcCcpIHx8ICdib3R0b20gbGVmdCcsXHJcblx0XHQgICAgICAgIGF0OiAkdGhpcy5kYXRhKCdxdGlwJykgfHwgJ2JvdHRvbSBsZWZ0J1xyXG5cdFx0ICAgIH1cclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cclxuXHQvKipcclxuXHQqIEN1c3RvbSBTZWxlY3RcclxuXHQqL1xyXG5cdCQoXCJzZWxlY3QuY3VzdG9tXCIpLmVhY2goZnVuY3Rpb24oKSB7XHRcdFx0XHRcdFxyXG5cdFx0dmFyIHNiID0gbmV3IFNlbGVjdEJveCh7XHJcblx0XHRcdHNlbGVjdGJveDogJCh0aGlzKSxcclxuXHRcdFx0aGVpZ2h0OiAxNTAsXHJcblx0XHRcdHdpZHRoOiAyMDBcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG5cclxuXHQvKipcclxuXHQqIE1hc2tlZCBQbHVnaW5cclxuXHQqL1xyXG5cdCQoXCIjcGhvbmVcIikubWFzayhcIis3KDk5OSkgOTk5LTk5LTk5XCIpO1xyXG5cclxuXHQvKipcclxuXHQqIE1vYnRvcCBNZW51IEJ0blxyXG5cdCovXHJcblx0JCgnLmpzLW1vYnRvcC1tZW51X19idG4nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcblx0XHQkKHRoaXMpLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XHJcblx0fSk7XHJcblxyXG5cdC8qKlxyXG5cdCogU2V0IENhdGFsb2cgbGlzdCB2aWV3LXR5cGVcclxuXHQqL1xyXG5cdChmdW5jdGlvbigpe1xyXG5cdFx0dmFyICR2dCA9ICQoJy5qcy1jYXRhbG9nX192aWV3dHlwZScpLFxyXG5cdFx0XHQkdHlwZSA9ICQoJy5qcy1jYXRhbG9nLXZpZXctdHlwZScpLFxyXG5cdFx0XHR0eXBlcyA9IFsnY2F0YWxvZy0tdGFibGUtdmlldycsJ2NhdGFsb2ctLWxpc3QtdmlldycsJ2NhdGFsb2ctLWxpc3Qtdmlldy1zbSddLFxyXG5cdFx0XHQkdnRBID0gJCgnYScsICR2dCksXHJcblx0XHRcdCR2dEkgPSAkKCcuaWNvbnMnLCAkdnRBKTtcclxuXHRcdFxyXG5cdFx0JHZ0QS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyksXHJcblx0XHRcdFx0aW5keCA9ICR2dEEuaW5kZXgoJHRoaXMpO1xyXG5cdFx0XHRcclxuXHRcdFx0JHZ0SS5yZW1vdmVDbGFzcygnYWN0aXZlJykuZXEoaW5keCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuXHRcdFx0JHR5cGVcclxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoZnVuY3Rpb24gKGluZGV4LCBjc3MpIHtcclxuXHRcdFx0XHQgICAgcmV0dXJuICggY3NzLm1hdGNoICgvKF58XFxzKWNhdGFsb2ctLVt0YWJsZXxsaXN0XVxcUysvZykgfHwgW10gKS5qb2luKCcgJyk7XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XHQuYWRkQ2xhc3ModHlwZXNbaW5keF0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdH0oKSk7XHJcblx0XHJcblx0LyoqXHJcblx0KiBcclxuXHQqL1xyXG5cdChmdW5jdGlvbigpIHtcclxuXHRcdHZhciAkb3JkZXJMaXN0ID0gJCgnaW5wdXRbbmFtZV49XCJvcmRlci1saXN0LVwiJyk7IFxyXG5cdFx0XHJcblx0XHQkb3JkZXJMaXN0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKSxcclxuXHRcdFx0XHQkbmV4dEEgPSAkdGhpcy5uZXh0QWxsKCdhJyk7XHJcblx0XHRcdCR0aGlzLnBhcmVudHMoJ2Rpdi5yb3c6ZXEoMCknKS5hZGRDbGFzcygnbG9hZGVyJyk7XHJcblx0XHRcdGlmKCQodGhpcykuaXMoJzpjaGVja2VkJykpIHtcclxuXHRcdFx0XHRsb2NhdGlvbi5ocmVmID0gJG5leHRBLmVxKDApLmF0dHIoJ2hyZWYnKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRsb2NhdGlvbi5ocmVmID0gJG5leHRBLmVxKDEpLmF0dHIoJ2hyZWYnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdH0oKSk7XHJcblx0XHJcblx0Ly8gQ2F0YWxvZyBJdGVtIEdhbGxlcnkgYWN0aXZhdGVcclxuXHQkKCcuZnNjcmVlbicpLmZzaXplR2FsbGVyeSh7XHJcblx0XHRzaG93RnVsbFNjcmVlbkJ0bjogdHJ1ZSxcclxuXHRcdG9uUHJldkltYWdlOiBmdW5jdGlvbihpbmRleCkge1xyXG5cdFx0XHQvLyBhbGVydChcInByZXYgaW1hZ2Ugc2hvd1wiKTtcclxuXHRcdH0sXHJcblx0XHRvbk5leHRJbWFnZTogZnVuY3Rpb24oaW5kZXgpIHtcclxuXHRcdFx0Ly8gYWxlcnQoXCJuZXh0IGltYWdlIHNob3dcIik7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG59KTtcclxuXHJcblxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
