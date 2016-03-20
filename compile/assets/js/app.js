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
		        event: false
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



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5tb3VzZXdoZWVsLmpzIiwialNjcm9sbFBhbmUuanMiLCJTZWxlY3RCb3guanMiLCJqcXVlcnkubWFzay5qcyIsImdhbGxlcnkuanMiLCJhcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNTVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9ZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgQ29weXJpZ2h0IChjKSAyMDExIEJyYW5kb24gQWFyb24gKGh0dHA6Ly9icmFuZG9uYWFyb24ubmV0KVxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChMSUNFTlNFLnR4dCkuXG4gKlxuICogVGhhbmtzIHRvOiBodHRwOi8vYWRvbWFzLm9yZy9qYXZhc2NyaXB0LW1vdXNlLXdoZWVsLyBmb3Igc29tZSBwb2ludGVycy5cbiAqIFRoYW5rcyB0bzogTWF0aGlhcyBCYW5rKGh0dHA6Ly93d3cubWF0aGlhcy1iYW5rLmRlKSBmb3IgYSBzY29wZSBidWcgZml4LlxuICogVGhhbmtzIHRvOiBTZWFtdXMgTGVhaHkgZm9yIGFkZGluZyBkZWx0YVggYW5kIGRlbHRhWVxuICpcbiAqIFZlcnNpb246IDMuMC42XG4gKiBcbiAqIFJlcXVpcmVzOiAxLjIuMitcbiAqL1xuXG4oZnVuY3Rpb24oJCkge1xuXG52YXIgdHlwZXMgPSBbJ0RPTU1vdXNlU2Nyb2xsJywgJ21vdXNld2hlZWwnXTtcblxuaWYgKCQuZXZlbnQuZml4SG9va3MpIHtcbiAgICBmb3IgKCB2YXIgaT10eXBlcy5sZW5ndGg7IGk7ICkge1xuICAgICAgICAkLmV2ZW50LmZpeEhvb2tzWyB0eXBlc1stLWldIF0gPSAkLmV2ZW50Lm1vdXNlSG9va3M7XG4gICAgfVxufVxuXG4kLmV2ZW50LnNwZWNpYWwubW91c2V3aGVlbCA9IHtcbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICggdGhpcy5hZGRFdmVudExpc3RlbmVyICkge1xuICAgICAgICAgICAgZm9yICggdmFyIGk9dHlwZXMubGVuZ3RoOyBpOyApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoIHR5cGVzWy0taV0sIGhhbmRsZXIsIGZhbHNlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9ubW91c2V3aGVlbCA9IGhhbmRsZXI7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIHRlYXJkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIgKSB7XG4gICAgICAgICAgICBmb3IgKCB2YXIgaT10eXBlcy5sZW5ndGg7IGk7ICkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHlwZXNbLS1pXSwgaGFuZGxlciwgZmFsc2UgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25tb3VzZXdoZWVsID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbiQuZm4uZXh0ZW5kKHtcbiAgICBtb3VzZXdoZWVsOiBmdW5jdGlvbihmbikge1xuICAgICAgICByZXR1cm4gZm4gPyB0aGlzLmJpbmQoXCJtb3VzZXdoZWVsXCIsIGZuKSA6IHRoaXMudHJpZ2dlcihcIm1vdXNld2hlZWxcIik7XG4gICAgfSxcbiAgICBcbiAgICB1bm1vdXNld2hlZWw6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuYmluZChcIm1vdXNld2hlZWxcIiwgZm4pO1xuICAgIH1cbn0pO1xuXG5cbmZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICB2YXIgb3JnRXZlbnQgPSBldmVudCB8fCB3aW5kb3cuZXZlbnQsIGFyZ3MgPSBbXS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKSwgZGVsdGEgPSAwLCByZXR1cm5WYWx1ZSA9IHRydWUsIGRlbHRhWCA9IDAsIGRlbHRhWSA9IDA7XG4gICAgZXZlbnQgPSAkLmV2ZW50LmZpeChvcmdFdmVudCk7XG4gICAgZXZlbnQudHlwZSA9IFwibW91c2V3aGVlbFwiO1xuICAgIFxuICAgIC8vIE9sZCBzY2hvb2wgc2Nyb2xsd2hlZWwgZGVsdGFcbiAgICBpZiAoIG9yZ0V2ZW50LndoZWVsRGVsdGEgKSB7IGRlbHRhID0gb3JnRXZlbnQud2hlZWxEZWx0YS8xMjA7IH1cbiAgICBpZiAoIG9yZ0V2ZW50LmRldGFpbCAgICAgKSB7IGRlbHRhID0gLW9yZ0V2ZW50LmRldGFpbC8zOyB9XG4gICAgXG4gICAgLy8gTmV3IHNjaG9vbCBtdWx0aWRpbWVuc2lvbmFsIHNjcm9sbCAodG91Y2hwYWRzKSBkZWx0YXNcbiAgICBkZWx0YVkgPSBkZWx0YTtcbiAgICBcbiAgICAvLyBHZWNrb1xuICAgIGlmICggb3JnRXZlbnQuYXhpcyAhPT0gdW5kZWZpbmVkICYmIG9yZ0V2ZW50LmF4aXMgPT09IG9yZ0V2ZW50LkhPUklaT05UQUxfQVhJUyApIHtcbiAgICAgICAgZGVsdGFZID0gMDtcbiAgICAgICAgZGVsdGFYID0gLTEqZGVsdGE7XG4gICAgfVxuICAgIFxuICAgIC8vIFdlYmtpdFxuICAgIGlmICggb3JnRXZlbnQud2hlZWxEZWx0YVkgIT09IHVuZGVmaW5lZCApIHsgZGVsdGFZID0gb3JnRXZlbnQud2hlZWxEZWx0YVkvMTIwOyB9XG4gICAgaWYgKCBvcmdFdmVudC53aGVlbERlbHRhWCAhPT0gdW5kZWZpbmVkICkgeyBkZWx0YVggPSAtMSpvcmdFdmVudC53aGVlbERlbHRhWC8xMjA7IH1cbiAgICBcbiAgICAvLyBBZGQgZXZlbnQgYW5kIGRlbHRhIHRvIHRoZSBmcm9udCBvZiB0aGUgYXJndW1lbnRzXG4gICAgYXJncy51bnNoaWZ0KGV2ZW50LCBkZWx0YSwgZGVsdGFYLCBkZWx0YVkpO1xuICAgIFxuICAgIHJldHVybiAoJC5ldmVudC5kaXNwYXRjaCB8fCAkLmV2ZW50LmhhbmRsZSkuYXBwbHkodGhpcywgYXJncyk7XG59XG5cbn0pKGpRdWVyeSk7XG4iLCIvKiFcbiAqIGpTY3JvbGxQYW5lIC0gdjIuMC4wYmV0YTEyIC0gMjAxMi0wOS0yN1xuICogaHR0cDovL2pzY3JvbGxwYW5lLmtlbHZpbmx1Y2suY29tL1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMCBLZWx2aW4gTHVja1xuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBsaWNlbnNlcy5cbiAqL1xuXG4vLyBTY3JpcHQ6IGpTY3JvbGxQYW5lIC0gY3Jvc3MgYnJvd3NlciBjdXN0b21pc2FibGUgc2Nyb2xsYmFyc1xuLy9cbi8vICpWZXJzaW9uOiAyLjAuMGJldGExMiwgTGFzdCB1cGRhdGVkOiAyMDEyLTA5LTI3KlxuLy9cbi8vIFByb2plY3QgSG9tZSAtIGh0dHA6Ly9qc2Nyb2xscGFuZS5rZWx2aW5sdWNrLmNvbS9cbi8vIEdpdEh1YiAgICAgICAtIGh0dHA6Ly9naXRodWIuY29tL3ZpdGNoL2pTY3JvbGxQYW5lXG4vLyBTb3VyY2UgICAgICAgLSBodHRwOi8vZ2l0aHViLmNvbS92aXRjaC9qU2Nyb2xsUGFuZS9yYXcvbWFzdGVyL3NjcmlwdC9qcXVlcnkuanNjcm9sbHBhbmUuanNcbi8vIChNaW5pZmllZCkgICAtIGh0dHA6Ly9naXRodWIuY29tL3ZpdGNoL2pTY3JvbGxQYW5lL3Jhdy9tYXN0ZXIvc2NyaXB0L2pxdWVyeS5qc2Nyb2xscGFuZS5taW4uanNcbi8vXG4vLyBBYm91dDogTGljZW5zZVxuLy9cbi8vIENvcHlyaWdodCAoYykgMjAxMiBLZWx2aW4gTHVja1xuLy8gRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBWZXJzaW9uIDIgbGljZW5zZXMuXG4vLyBodHRwOi8vanNjcm9sbHBhbmUua2VsdmlubHVjay5jb20vTUlULUxJQ0VOU0UudHh0XG4vLyBodHRwOi8vanNjcm9sbHBhbmUua2VsdmlubHVjay5jb20vR1BMLUxJQ0VOU0UudHh0XG4vL1xuLy8gQWJvdXQ6IEV4YW1wbGVzXG4vL1xuLy8gQWxsIGV4YW1wbGVzIGFuZCBkZW1vcyBhcmUgYXZhaWxhYmxlIHRocm91Z2ggdGhlIGpTY3JvbGxQYW5lIGV4YW1wbGUgc2l0ZSBhdDpcbi8vIGh0dHA6Ly9qc2Nyb2xscGFuZS5rZWx2aW5sdWNrLmNvbS9cbi8vXG4vLyBBYm91dDogU3VwcG9ydCBhbmQgVGVzdGluZ1xuLy9cbi8vIFRoaXMgcGx1Z2luIGlzIHRlc3RlZCBvbiB0aGUgYnJvd3NlcnMgYmVsb3cgYW5kIGhhcyBiZWVuIGZvdW5kIHRvIHdvcmsgcmVsaWFibHkgb24gdGhlbS4gSWYgeW91IHJ1blxuLy8gaW50byBhIHByb2JsZW0gb24gb25lIG9mIHRoZSBzdXBwb3J0ZWQgYnJvd3NlcnMgdGhlbiBwbGVhc2UgdmlzaXQgdGhlIHN1cHBvcnQgc2VjdGlvbiBvbiB0aGUgalNjcm9sbFBhbmVcbi8vIHdlYnNpdGUgKGh0dHA6Ly9qc2Nyb2xscGFuZS5rZWx2aW5sdWNrLmNvbS8pIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGdldHRpbmcgc3VwcG9ydC4gWW91IGFyZSBhbHNvXG4vLyB3ZWxjb21lIHRvIGZvcmsgdGhlIHByb2plY3Qgb24gR2l0SHViIGlmIHlvdSBjYW4gY29udHJpYnV0ZSBhIGZpeCBmb3IgYSBnaXZlbiBpc3N1ZS4gXG4vL1xuLy8galF1ZXJ5IFZlcnNpb25zIC0gdGVzdGVkIGluIDEuNC4yKyAtIHJlcG9ydGVkIHRvIHdvcmsgaW4gMS4zLnhcbi8vIEJyb3dzZXJzIFRlc3RlZCAtIEZpcmVmb3ggMy42LjgsIFNhZmFyaSA1LCBPcGVyYSAxMC42LCBDaHJvbWUgNS4wLCBJRSA2LCA3LCA4XG4vL1xuLy8gQWJvdXQ6IFJlbGVhc2UgSGlzdG9yeVxuLy9cbi8vIDIuMC4wYmV0YTEyIC0gKDIwMTItMDktMjcpIGZpeCBmb3IgalF1ZXJ5IDEuOCtcbi8vIDIuMC4wYmV0YTExIC0gKDIwMTItMDUtMTQpXG4vLyAyLjAuMGJldGExMCAtICgyMDExLTA0LTE3KSBjbGVhbmVyIHJlcXVpcmVkIHNpemUgY2FsY3VsYXRpb24sIGltcHJvdmVkIGtleWJvYXJkIHN1cHBvcnQsIHN0aWNrVG9Cb3R0b20vTGVmdCwgb3RoZXIgc21hbGwgZml4ZXNcbi8vIDIuMC4wYmV0YTkgLSAoMjAxMS0wMS0zMSkgbmV3IEFQSSBtZXRob2RzLCBidWcgZml4ZXMgYW5kIGNvcnJlY3Qga2V5Ym9hcmQgc3VwcG9ydCBmb3IgRkYvT1NYXG4vLyAyLjAuMGJldGE4IC0gKDIwMTEtMDEtMjkpIHRvdWNoc2NyZWVuIHN1cHBvcnQsIGltcHJvdmVkIGtleWJvYXJkIHN1cHBvcnRcbi8vIDIuMC4wYmV0YTcgLSAoMjAxMS0wMS0yMykgc2Nyb2xsIHNwZWVkIGNvbnNpc3RlbnQgKHRoYW5rcyBBaXZvIFBhYXMpXG4vLyAyLjAuMGJldGE2IC0gKDIwMTAtMTItMDcpIHNjcm9sbFRvRWxlbWVudCBob3Jpem9udGFsIHN1cHBvcnRcbi8vIDIuMC4wYmV0YTUgLSAoMjAxMC0xMC0xOCkgalF1ZXJ5IDEuNC4zIHN1cHBvcnQsIHZhcmlvdXMgYnVnIGZpeGVzXG4vLyAyLjAuMGJldGE0IC0gKDIwMTAtMDktMTcpIGNsaWNrT25UcmFjayBzdXBwb3J0LCBidWcgZml4ZXNcbi8vIDIuMC4wYmV0YTMgLSAoMjAxMC0wOC0yNykgSG9yaXpvbnRhbCBtb3VzZXdoZWVsLCBtd2hlZWxJbnRlbnQsIGtleWJvYXJkIHN1cHBvcnQsIGJ1ZyBmaXhlc1xuLy8gMi4wLjBiZXRhMiAtICgyMDEwLTA4LTIxKSBCdWcgZml4ZXNcbi8vIDIuMC4wYmV0YTEgLSAoMjAxMC0wOC0xNykgUmV3cml0ZSB0byBmb2xsb3cgbW9kZXJuIGJlc3QgcHJhY3RpY2VzIGFuZCBlbmFibGUgaG9yaXpvbnRhbCBzY3JvbGxpbmcsIGluaXRpYWxseSBoaWRkZW5cbi8vXHRcdFx0XHRcdFx0XHQgZWxlbWVudHMgYW5kIGR5bmFtaWNhbGx5IHNpemVkIGVsZW1lbnRzLlxuLy8gMS54IC0gKDIwMDYtMTItMzEgLSAyMDEwLTA3LTMxKSBJbml0aWFsIHZlcnNpb24sIGhvc3RlZCBhdCBnb29nbGVjb2RlLCBkZXByZWNhdGVkXG5cbihmdW5jdGlvbigkLHdpbmRvdyx1bmRlZmluZWQpe1xuXG5cdCQuZm4ualNjcm9sbFBhbmUgPSBmdW5jdGlvbihzZXR0aW5ncylcblx0e1xuXHRcdC8vIEpTY3JvbGxQYW5lIFwiY2xhc3NcIiAtIHB1YmxpYyBtZXRob2RzIGFyZSBhdmFpbGFibGUgdGhyb3VnaCAkKCdzZWxlY3RvcicpLmRhdGEoJ2pzcCcpXG5cdFx0ZnVuY3Rpb24gSlNjcm9sbFBhbmUoZWxlbSwgcylcblx0XHR7XG5cdFx0XHR2YXIgc2V0dGluZ3MsIGpzcCA9IHRoaXMsIHBhbmUsIHBhbmVXaWR0aCwgcGFuZUhlaWdodCwgY29udGFpbmVyLCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQsXG5cdFx0XHRcdHBlcmNlbnRJblZpZXdILCBwZXJjZW50SW5WaWV3ViwgaXNTY3JvbGxhYmxlViwgaXNTY3JvbGxhYmxlSCwgdmVydGljYWxEcmFnLCBkcmFnTWF4WSxcblx0XHRcdFx0dmVydGljYWxEcmFnUG9zaXRpb24sIGhvcml6b250YWxEcmFnLCBkcmFnTWF4WCwgaG9yaXpvbnRhbERyYWdQb3NpdGlvbixcblx0XHRcdFx0dmVydGljYWxCYXIsIHZlcnRpY2FsVHJhY2ssIHNjcm9sbGJhcldpZHRoLCB2ZXJ0aWNhbFRyYWNrSGVpZ2h0LCB2ZXJ0aWNhbERyYWdIZWlnaHQsIGFycm93VXAsIGFycm93RG93bixcblx0XHRcdFx0aG9yaXpvbnRhbEJhciwgaG9yaXpvbnRhbFRyYWNrLCBob3Jpem9udGFsVHJhY2tXaWR0aCwgaG9yaXpvbnRhbERyYWdXaWR0aCwgYXJyb3dMZWZ0LCBhcnJvd1JpZ2h0LFxuXHRcdFx0XHRyZWluaXRpYWxpc2VJbnRlcnZhbCwgb3JpZ2luYWxQYWRkaW5nLCBvcmlnaW5hbFBhZGRpbmdUb3RhbFdpZHRoLCBwcmV2aW91c0NvbnRlbnRXaWR0aCxcblx0XHRcdFx0d2FzQXRUb3AgPSB0cnVlLCB3YXNBdExlZnQgPSB0cnVlLCB3YXNBdEJvdHRvbSA9IGZhbHNlLCB3YXNBdFJpZ2h0ID0gZmFsc2UsXG5cdFx0XHRcdG9yaWdpbmFsRWxlbWVudCA9IGVsZW0uY2xvbmUoZmFsc2UsIGZhbHNlKS5lbXB0eSgpLFxuXHRcdFx0XHRtd0V2ZW50ID0gJC5mbi5td2hlZWxJbnRlbnQgPyAnbXdoZWVsSW50ZW50LmpzcCcgOiAnbW91c2V3aGVlbC5qc3AnO1xuXG5cdFx0XHRvcmlnaW5hbFBhZGRpbmcgPSBlbGVtLmNzcygncGFkZGluZ1RvcCcpICsgJyAnICtcblx0XHRcdFx0XHRcdFx0XHRlbGVtLmNzcygncGFkZGluZ1JpZ2h0JykgKyAnICcgK1xuXHRcdFx0XHRcdFx0XHRcdGVsZW0uY3NzKCdwYWRkaW5nQm90dG9tJykgKyAnICcgK1xuXHRcdFx0XHRcdFx0XHRcdGVsZW0uY3NzKCdwYWRkaW5nTGVmdCcpO1xuXHRcdFx0b3JpZ2luYWxQYWRkaW5nVG90YWxXaWR0aCA9IChwYXJzZUludChlbGVtLmNzcygncGFkZGluZ0xlZnQnKSwgMTApIHx8IDApICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0KHBhcnNlSW50KGVsZW0uY3NzKCdwYWRkaW5nUmlnaHQnKSwgMTApIHx8IDApO1xuXG5cdFx0XHRmdW5jdGlvbiBpbml0aWFsaXNlKHMpXG5cdFx0XHR7XG5cblx0XHRcdFx0dmFyIC8qZmlyc3RDaGlsZCwgbGFzdENoaWxkLCAqL2lzTWFpbnRhaW5pbmdQb3NpdG9uLCBsYXN0Q29udGVudFgsIGxhc3RDb250ZW50WSxcblx0XHRcdFx0XHRcdGhhc0NvbnRhaW5pbmdTcGFjZUNoYW5nZWQsIG9yaWdpbmFsU2Nyb2xsVG9wLCBvcmlnaW5hbFNjcm9sbExlZnQsXG5cdFx0XHRcdFx0XHRtYWludGFpbkF0Qm90dG9tID0gZmFsc2UsIG1haW50YWluQXRSaWdodCA9IGZhbHNlO1xuXG5cdFx0XHRcdHNldHRpbmdzID0gcztcblxuXHRcdFx0XHRpZiAocGFuZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0b3JpZ2luYWxTY3JvbGxUb3AgPSBlbGVtLnNjcm9sbFRvcCgpO1xuXHRcdFx0XHRcdG9yaWdpbmFsU2Nyb2xsTGVmdCA9IGVsZW0uc2Nyb2xsTGVmdCgpO1xuXG5cdFx0XHRcdFx0ZWxlbS5jc3MoXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdG92ZXJmbG93OiAnaGlkZGVuJyxcblx0XHRcdFx0XHRcdFx0cGFkZGluZzogMFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Ly8gVE9ETzogRGVhbCB3aXRoIHdoZXJlIHdpZHRoLyBoZWlnaHQgaXMgMCBhcyBpdCBwcm9iYWJseSBtZWFucyB0aGUgZWxlbWVudCBpcyBoaWRkZW4gYW5kIHdlIHNob3VsZFxuXHRcdFx0XHRcdC8vIGNvbWUgYmFjayB0byBpdCBsYXRlciBhbmQgY2hlY2sgb25jZSBpdCBpcyB1bmhpZGRlbi4uLlxuXHRcdFx0XHRcdHBhbmVXaWR0aCA9IGVsZW0uaW5uZXJXaWR0aCgpICsgb3JpZ2luYWxQYWRkaW5nVG90YWxXaWR0aDtcblx0XHRcdFx0XHRwYW5lSGVpZ2h0ID0gZWxlbS5pbm5lckhlaWdodCgpO1xuXG5cdFx0XHRcdFx0ZWxlbS53aWR0aChwYW5lV2lkdGgpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHBhbmUgPSAkKCc8ZGl2IGNsYXNzPVwianNwUGFuZVwiIC8+JykuY3NzKCdwYWRkaW5nJywgb3JpZ2luYWxQYWRkaW5nKS5hcHBlbmQoZWxlbS5jaGlsZHJlbigpKTtcblx0XHRcdFx0XHRjb250YWluZXIgPSAkKCc8ZGl2IGNsYXNzPVwianNwQ29udGFpbmVyXCIgLz4nKVxuXHRcdFx0XHRcdFx0LmNzcyh7XG5cdFx0XHRcdFx0XHRcdCd3aWR0aCc6IHBhbmVXaWR0aCArICdweCcsXG5cdFx0XHRcdFx0XHRcdCdoZWlnaHQnOiBwYW5lSGVpZ2h0ICsgJ3B4J1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCkuYXBwZW5kKHBhbmUpLmFwcGVuZFRvKGVsZW0pO1xuXG5cdFx0XHRcdFx0Lypcblx0XHRcdFx0XHQvLyBNb3ZlIGFueSBtYXJnaW5zIGZyb20gdGhlIGZpcnN0IGFuZCBsYXN0IGNoaWxkcmVuIHVwIHRvIHRoZSBjb250YWluZXIgc28gdGhleSBjYW4gc3RpbGxcblx0XHRcdFx0XHQvLyBjb2xsYXBzZSB3aXRoIG5laWdoYm91cmluZyBlbGVtZW50cyBhcyB0aGV5IHdvdWxkIGJlZm9yZSBqU2Nyb2xsUGFuZSBcblx0XHRcdFx0XHRmaXJzdENoaWxkID0gcGFuZS5maW5kKCc6Zmlyc3QtY2hpbGQnKTtcblx0XHRcdFx0XHRsYXN0Q2hpbGQgPSBwYW5lLmZpbmQoJzpsYXN0LWNoaWxkJyk7XG5cdFx0XHRcdFx0ZWxlbS5jc3MoXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdCdtYXJnaW4tdG9wJzogZmlyc3RDaGlsZC5jc3MoJ21hcmdpbi10b3AnKSxcblx0XHRcdFx0XHRcdFx0J21hcmdpbi1ib3R0b20nOiBsYXN0Q2hpbGQuY3NzKCdtYXJnaW4tYm90dG9tJylcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGZpcnN0Q2hpbGQuY3NzKCdtYXJnaW4tdG9wJywgMCk7XG5cdFx0XHRcdFx0bGFzdENoaWxkLmNzcygnbWFyZ2luLWJvdHRvbScsIDApO1xuXHRcdFx0XHRcdCovXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZWxlbS5jc3MoJ3dpZHRoJywgJycpO1xuXG5cdFx0XHRcdFx0bWFpbnRhaW5BdEJvdHRvbSA9IHNldHRpbmdzLnN0aWNrVG9Cb3R0b20gJiYgaXNDbG9zZVRvQm90dG9tKCk7XG5cdFx0XHRcdFx0bWFpbnRhaW5BdFJpZ2h0ICA9IHNldHRpbmdzLnN0aWNrVG9SaWdodCAgJiYgaXNDbG9zZVRvUmlnaHQoKTtcblxuXHRcdFx0XHRcdGhhc0NvbnRhaW5pbmdTcGFjZUNoYW5nZWQgPSBlbGVtLmlubmVyV2lkdGgoKSArIG9yaWdpbmFsUGFkZGluZ1RvdGFsV2lkdGggIT0gcGFuZVdpZHRoIHx8IGVsZW0ub3V0ZXJIZWlnaHQoKSAhPSBwYW5lSGVpZ2h0O1xuXG5cdFx0XHRcdFx0aWYgKGhhc0NvbnRhaW5pbmdTcGFjZUNoYW5nZWQpIHtcblx0XHRcdFx0XHRcdHBhbmVXaWR0aCA9IGVsZW0uaW5uZXJXaWR0aCgpICsgb3JpZ2luYWxQYWRkaW5nVG90YWxXaWR0aDtcblx0XHRcdFx0XHRcdHBhbmVIZWlnaHQgPSBlbGVtLmlubmVySGVpZ2h0KCk7XG5cdFx0XHRcdFx0XHRjb250YWluZXIuY3NzKHtcblx0XHRcdFx0XHRcdFx0d2lkdGg6IHBhbmVXaWR0aCArICdweCcsXG5cdFx0XHRcdFx0XHRcdGhlaWdodDogcGFuZUhlaWdodCArICdweCdcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIElmIG5vdGhpbmcgY2hhbmdlZCBzaW5jZSBsYXN0IGNoZWNrLi4uXG5cdFx0XHRcdFx0aWYgKCFoYXNDb250YWluaW5nU3BhY2VDaGFuZ2VkICYmIHByZXZpb3VzQ29udGVudFdpZHRoID09IGNvbnRlbnRXaWR0aCAmJiBwYW5lLm91dGVySGVpZ2h0KCkgPT0gY29udGVudEhlaWdodCkge1xuXHRcdFx0XHRcdFx0ZWxlbS53aWR0aChwYW5lV2lkdGgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRwcmV2aW91c0NvbnRlbnRXaWR0aCA9IGNvbnRlbnRXaWR0aDtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRwYW5lLmNzcygnd2lkdGgnLCAnJyk7XG5cdFx0XHRcdFx0ZWxlbS53aWR0aChwYW5lV2lkdGgpO1xuXG5cdFx0XHRcdFx0Y29udGFpbmVyLmZpbmQoJz4uanNwVmVydGljYWxCYXIsPi5qc3BIb3Jpem9udGFsQmFyJykucmVtb3ZlKCkuZW5kKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwYW5lLmNzcygnb3ZlcmZsb3cnLCAnYXV0bycpO1xuXHRcdFx0XHRpZiAocy5jb250ZW50V2lkdGgpIHtcblx0XHRcdFx0XHRjb250ZW50V2lkdGggPSBzLmNvbnRlbnRXaWR0aDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb250ZW50V2lkdGggPSBwYW5lWzBdLnNjcm9sbFdpZHRoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnRlbnRIZWlnaHQgPSBwYW5lWzBdLnNjcm9sbEhlaWdodDtcblx0XHRcdFx0cGFuZS5jc3MoJ292ZXJmbG93JywgJycpO1xuXG5cdFx0XHRcdHBlcmNlbnRJblZpZXdIID0gY29udGVudFdpZHRoIC8gcGFuZVdpZHRoO1xuXHRcdFx0XHRwZXJjZW50SW5WaWV3ViA9IGNvbnRlbnRIZWlnaHQgLyBwYW5lSGVpZ2h0O1xuXHRcdFx0XHRpc1Njcm9sbGFibGVWID0gcGVyY2VudEluVmlld1YgPiAxO1xuXG5cdFx0XHRcdGlzU2Nyb2xsYWJsZUggPSBwZXJjZW50SW5WaWV3SCA+IDE7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhwYW5lV2lkdGgsIHBhbmVIZWlnaHQsIGNvbnRlbnRXaWR0aCwgY29udGVudEhlaWdodCwgcGVyY2VudEluVmlld0gsIHBlcmNlbnRJblZpZXdWLCBpc1Njcm9sbGFibGVILCBpc1Njcm9sbGFibGVWKTtcblxuXHRcdFx0XHRpZiAoIShpc1Njcm9sbGFibGVIIHx8IGlzU2Nyb2xsYWJsZVYpKSB7XG5cdFx0XHRcdFx0ZWxlbS5yZW1vdmVDbGFzcygnanNwU2Nyb2xsYWJsZScpO1xuXHRcdFx0XHRcdHBhbmUuY3NzKHtcblx0XHRcdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0XHRcdHdpZHRoOiBjb250YWluZXIud2lkdGgoKSAtIG9yaWdpbmFsUGFkZGluZ1RvdGFsV2lkdGhcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRyZW1vdmVNb3VzZXdoZWVsKCk7XG5cdFx0XHRcdFx0cmVtb3ZlRm9jdXNIYW5kbGVyKCk7XG5cdFx0XHRcdFx0cmVtb3ZlS2V5Ym9hcmROYXYoKTtcblx0XHRcdFx0XHRyZW1vdmVDbGlja09uVHJhY2soKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlbGVtLmFkZENsYXNzKCdqc3BTY3JvbGxhYmxlJyk7XG5cblx0XHRcdFx0XHRpc01haW50YWluaW5nUG9zaXRvbiA9IHNldHRpbmdzLm1haW50YWluUG9zaXRpb24gJiYgKHZlcnRpY2FsRHJhZ1Bvc2l0aW9uIHx8IGhvcml6b250YWxEcmFnUG9zaXRpb24pO1xuXHRcdFx0XHRcdGlmIChpc01haW50YWluaW5nUG9zaXRvbikge1xuXHRcdFx0XHRcdFx0bGFzdENvbnRlbnRYID0gY29udGVudFBvc2l0aW9uWCgpO1xuXHRcdFx0XHRcdFx0bGFzdENvbnRlbnRZID0gY29udGVudFBvc2l0aW9uWSgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGluaXRpYWxpc2VWZXJ0aWNhbFNjcm9sbCgpO1xuXHRcdFx0XHRcdGluaXRpYWxpc2VIb3Jpem9udGFsU2Nyb2xsKCk7XG5cdFx0XHRcdFx0cmVzaXplU2Nyb2xsYmFycygpO1xuXG5cdFx0XHRcdFx0aWYgKGlzTWFpbnRhaW5pbmdQb3NpdG9uKSB7XG5cdFx0XHRcdFx0XHRzY3JvbGxUb1gobWFpbnRhaW5BdFJpZ2h0ICA/IChjb250ZW50V2lkdGggIC0gcGFuZVdpZHRoICkgOiBsYXN0Q29udGVudFgsIGZhbHNlKTtcblx0XHRcdFx0XHRcdHNjcm9sbFRvWShtYWludGFpbkF0Qm90dG9tID8gKGNvbnRlbnRIZWlnaHQgLSBwYW5lSGVpZ2h0KSA6IGxhc3RDb250ZW50WSwgZmFsc2UpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGluaXRGb2N1c0hhbmRsZXIoKTtcblx0XHRcdFx0XHRpbml0TW91c2V3aGVlbCgpO1xuXHRcdFx0XHRcdGluaXRUb3VjaCgpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmIChzZXR0aW5ncy5lbmFibGVLZXlib2FyZE5hdmlnYXRpb24pIHtcblx0XHRcdFx0XHRcdGluaXRLZXlib2FyZE5hdigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoc2V0dGluZ3MuY2xpY2tPblRyYWNrKSB7XG5cdFx0XHRcdFx0XHRpbml0Q2xpY2tPblRyYWNrKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdG9ic2VydmVIYXNoKCk7XG5cdFx0XHRcdFx0aWYgKHNldHRpbmdzLmhpamFja0ludGVybmFsTGlua3MpIHtcblx0XHRcdFx0XHRcdGhpamFja0ludGVybmFsTGlua3MoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoc2V0dGluZ3MuYXV0b1JlaW5pdGlhbGlzZSAmJiAhcmVpbml0aWFsaXNlSW50ZXJ2YWwpIHtcblx0XHRcdFx0XHRyZWluaXRpYWxpc2VJbnRlcnZhbCA9IHNldEludGVydmFsKFxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24oKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRpbml0aWFsaXNlKHNldHRpbmdzKTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRzZXR0aW5ncy5hdXRvUmVpbml0aWFsaXNlRGVsYXlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCFzZXR0aW5ncy5hdXRvUmVpbml0aWFsaXNlICYmIHJlaW5pdGlhbGlzZUludGVydmFsKSB7XG5cdFx0XHRcdFx0Y2xlYXJJbnRlcnZhbChyZWluaXRpYWxpc2VJbnRlcnZhbCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvcmlnaW5hbFNjcm9sbFRvcCAmJiBlbGVtLnNjcm9sbFRvcCgwKSAmJiBzY3JvbGxUb1kob3JpZ2luYWxTY3JvbGxUb3AsIGZhbHNlKTtcblx0XHRcdFx0b3JpZ2luYWxTY3JvbGxMZWZ0ICYmIGVsZW0uc2Nyb2xsTGVmdCgwKSAmJiBzY3JvbGxUb1gob3JpZ2luYWxTY3JvbGxMZWZ0LCBmYWxzZSk7XG5cblx0XHRcdFx0ZWxlbS50cmlnZ2VyKCdqc3AtaW5pdGlhbGlzZWQnLCBbaXNTY3JvbGxhYmxlSCB8fCBpc1Njcm9sbGFibGVWXSk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGluaXRpYWxpc2VWZXJ0aWNhbFNjcm9sbCgpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChpc1Njcm9sbGFibGVWKSB7XG5cblx0XHRcdFx0XHRjb250YWluZXIuYXBwZW5kKFxuXHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcFZlcnRpY2FsQmFyXCIgLz4nKS5hcHBlbmQoXG5cdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BDYXAganNwQ2FwVG9wXCIgLz4nKSxcblx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcFRyYWNrXCIgLz4nKS5hcHBlbmQoXG5cdFx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcERyYWdcIiAvPicpLmFwcGVuZChcblx0XHRcdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BEcmFnVG9wXCIgLz4nKSxcblx0XHRcdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BEcmFnQm90dG9tXCIgLz4nKVxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcENhcCBqc3BDYXBCb3R0b21cIiAvPicpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdHZlcnRpY2FsQmFyID0gY29udGFpbmVyLmZpbmQoJz4uanNwVmVydGljYWxCYXInKTtcblx0XHRcdFx0XHR2ZXJ0aWNhbFRyYWNrID0gdmVydGljYWxCYXIuZmluZCgnPi5qc3BUcmFjaycpO1xuXHRcdFx0XHRcdHZlcnRpY2FsRHJhZyA9IHZlcnRpY2FsVHJhY2suZmluZCgnPi5qc3BEcmFnJyk7XG5cblx0XHRcdFx0XHRpZiAoc2V0dGluZ3Muc2hvd0Fycm93cykge1xuXHRcdFx0XHRcdFx0YXJyb3dVcCA9ICQoJzxhIGNsYXNzPVwianNwQXJyb3cganNwQXJyb3dVcFwiIC8+JykuYmluZChcblx0XHRcdFx0XHRcdFx0J21vdXNlZG93bi5qc3AnLCBnZXRBcnJvd1Njcm9sbCgwLCAtMSlcblx0XHRcdFx0XHRcdCkuYmluZCgnY2xpY2suanNwJywgbmlsKTtcblx0XHRcdFx0XHRcdGFycm93RG93biA9ICQoJzxhIGNsYXNzPVwianNwQXJyb3cganNwQXJyb3dEb3duXCIgLz4nKS5iaW5kKFxuXHRcdFx0XHRcdFx0XHQnbW91c2Vkb3duLmpzcCcsIGdldEFycm93U2Nyb2xsKDAsIDEpXG5cdFx0XHRcdFx0XHQpLmJpbmQoJ2NsaWNrLmpzcCcsIG5pbCk7XG5cdFx0XHRcdFx0XHRpZiAoc2V0dGluZ3MuYXJyb3dTY3JvbGxPbkhvdmVyKSB7XG5cdFx0XHRcdFx0XHRcdGFycm93VXAuYmluZCgnbW91c2VvdmVyLmpzcCcsIGdldEFycm93U2Nyb2xsKDAsIC0xLCBhcnJvd1VwKSk7XG5cdFx0XHRcdFx0XHRcdGFycm93RG93bi5iaW5kKCdtb3VzZW92ZXIuanNwJywgZ2V0QXJyb3dTY3JvbGwoMCwgMSwgYXJyb3dEb3duKSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGFwcGVuZEFycm93cyh2ZXJ0aWNhbFRyYWNrLCBzZXR0aW5ncy52ZXJ0aWNhbEFycm93UG9zaXRpb25zLCBhcnJvd1VwLCBhcnJvd0Rvd24pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZlcnRpY2FsVHJhY2tIZWlnaHQgPSBwYW5lSGVpZ2h0O1xuXHRcdFx0XHRcdGNvbnRhaW5lci5maW5kKCc+LmpzcFZlcnRpY2FsQmFyPi5qc3BDYXA6dmlzaWJsZSw+LmpzcFZlcnRpY2FsQmFyPi5qc3BBcnJvdycpLmVhY2goXG5cdFx0XHRcdFx0XHRmdW5jdGlvbigpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHZlcnRpY2FsVHJhY2tIZWlnaHQgLT0gJCh0aGlzKS5vdXRlckhlaWdodCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCk7XG5cblxuXHRcdFx0XHRcdHZlcnRpY2FsRHJhZy5ob3Zlcihcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dmVydGljYWxEcmFnLmFkZENsYXNzKCdqc3BIb3ZlcicpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dmVydGljYWxEcmFnLnJlbW92ZUNsYXNzKCdqc3BIb3ZlcicpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCkuYmluZChcblx0XHRcdFx0XHRcdCdtb3VzZWRvd24uanNwJyxcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKGUpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vIFN0b3AgSUUgZnJvbSBhbGxvd2luZyB0ZXh0IHNlbGVjdGlvblxuXHRcdFx0XHRcdFx0XHQkKCdodG1sJykuYmluZCgnZHJhZ3N0YXJ0LmpzcCBzZWxlY3RzdGFydC5qc3AnLCBuaWwpO1xuXG5cdFx0XHRcdFx0XHRcdHZlcnRpY2FsRHJhZy5hZGRDbGFzcygnanNwQWN0aXZlJyk7XG5cblx0XHRcdFx0XHRcdFx0dmFyIHN0YXJ0WSA9IGUucGFnZVkgLSB2ZXJ0aWNhbERyYWcucG9zaXRpb24oKS50b3A7XG5cblx0XHRcdFx0XHRcdFx0JCgnaHRtbCcpLmJpbmQoXG5cdFx0XHRcdFx0XHRcdFx0J21vdXNlbW92ZS5qc3AnLFxuXHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uKGUpXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0cG9zaXRpb25EcmFnWShlLnBhZ2VZIC0gc3RhcnRZLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQpLmJpbmQoJ21vdXNldXAuanNwIG1vdXNlbGVhdmUuanNwJywgY2FuY2VsRHJhZyk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHNpemVWZXJ0aWNhbFNjcm9sbGJhcigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHNpemVWZXJ0aWNhbFNjcm9sbGJhcigpXG5cdFx0XHR7XG5cdFx0XHRcdHZlcnRpY2FsVHJhY2suaGVpZ2h0KHZlcnRpY2FsVHJhY2tIZWlnaHQgKyAncHgnKTtcblx0XHRcdFx0dmVydGljYWxEcmFnUG9zaXRpb24gPSAwO1xuXHRcdFx0XHRzY3JvbGxiYXJXaWR0aCA9IHNldHRpbmdzLnZlcnRpY2FsR3V0dGVyICsgdmVydGljYWxUcmFjay5vdXRlcldpZHRoKCk7XG5cblx0XHRcdFx0Ly8gTWFrZSB0aGUgcGFuZSB0aGlubmVyIHRvIGFsbG93IGZvciB0aGUgdmVydGljYWwgc2Nyb2xsYmFyXG5cdFx0XHRcdHBhbmUud2lkdGgocGFuZVdpZHRoIC0gc2Nyb2xsYmFyV2lkdGggLSBvcmlnaW5hbFBhZGRpbmdUb3RhbFdpZHRoKTtcblxuXHRcdFx0XHQvLyBBZGQgbWFyZ2luIHRvIHRoZSBsZWZ0IG9mIHRoZSBwYW5lIGlmIHNjcm9sbGJhcnMgYXJlIG9uIHRoYXQgc2lkZSAodG8gcG9zaXRpb25cblx0XHRcdFx0Ly8gdGhlIHNjcm9sbGJhciBvbiB0aGUgbGVmdCBvciByaWdodCBzZXQgaXQncyBsZWZ0IG9yIHJpZ2h0IHByb3BlcnR5IGluIENTUylcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRpZiAodmVydGljYWxCYXIucG9zaXRpb24oKS5sZWZ0ID09PSAwKSB7XG5cdFx0XHRcdFx0XHRwYW5lLmNzcygnbWFyZ2luLWxlZnQnLCBzY3JvbGxiYXJXaWR0aCArICdweCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaW5pdGlhbGlzZUhvcml6b250YWxTY3JvbGwoKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaXNTY3JvbGxhYmxlSCkge1xuXG5cdFx0XHRcdFx0Y29udGFpbmVyLmFwcGVuZChcblx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BIb3Jpem9udGFsQmFyXCIgLz4nKS5hcHBlbmQoXG5cdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BDYXAganNwQ2FwTGVmdFwiIC8+JyksXG5cdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BUcmFja1wiIC8+JykuYXBwZW5kKFxuXHRcdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BEcmFnXCIgLz4nKS5hcHBlbmQoXG5cdFx0XHRcdFx0XHRcdFx0XHQkKCc8ZGl2IGNsYXNzPVwianNwRHJhZ0xlZnRcIiAvPicpLFxuXHRcdFx0XHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcERyYWdSaWdodFwiIC8+Jylcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdCQoJzxkaXYgY2xhc3M9XCJqc3BDYXAganNwQ2FwUmlnaHRcIiAvPicpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdGhvcml6b250YWxCYXIgPSBjb250YWluZXIuZmluZCgnPi5qc3BIb3Jpem9udGFsQmFyJyk7XG5cdFx0XHRcdFx0aG9yaXpvbnRhbFRyYWNrID0gaG9yaXpvbnRhbEJhci5maW5kKCc+LmpzcFRyYWNrJyk7XG5cdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcgPSBob3Jpem9udGFsVHJhY2suZmluZCgnPi5qc3BEcmFnJyk7XG5cblx0XHRcdFx0XHRpZiAoc2V0dGluZ3Muc2hvd0Fycm93cykge1xuXHRcdFx0XHRcdFx0YXJyb3dMZWZ0ID0gJCgnPGEgY2xhc3M9XCJqc3BBcnJvdyBqc3BBcnJvd0xlZnRcIiAvPicpLmJpbmQoXG5cdFx0XHRcdFx0XHRcdCdtb3VzZWRvd24uanNwJywgZ2V0QXJyb3dTY3JvbGwoLTEsIDApXG5cdFx0XHRcdFx0XHQpLmJpbmQoJ2NsaWNrLmpzcCcsIG5pbCk7XG5cdFx0XHRcdFx0XHRhcnJvd1JpZ2h0ID0gJCgnPGEgY2xhc3M9XCJqc3BBcnJvdyBqc3BBcnJvd1JpZ2h0XCIgLz4nKS5iaW5kKFxuXHRcdFx0XHRcdFx0XHQnbW91c2Vkb3duLmpzcCcsIGdldEFycm93U2Nyb2xsKDEsIDApXG5cdFx0XHRcdFx0XHQpLmJpbmQoJ2NsaWNrLmpzcCcsIG5pbCk7XG5cdFx0XHRcdFx0XHRpZiAoc2V0dGluZ3MuYXJyb3dTY3JvbGxPbkhvdmVyKSB7XG5cdFx0XHRcdFx0XHRcdGFycm93TGVmdC5iaW5kKCdtb3VzZW92ZXIuanNwJywgZ2V0QXJyb3dTY3JvbGwoLTEsIDAsIGFycm93TGVmdCkpO1xuXHRcdFx0XHRcdFx0XHRhcnJvd1JpZ2h0LmJpbmQoJ21vdXNlb3Zlci5qc3AnLCBnZXRBcnJvd1Njcm9sbCgxLCAwLCBhcnJvd1JpZ2h0KSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRhcHBlbmRBcnJvd3MoaG9yaXpvbnRhbFRyYWNrLCBzZXR0aW5ncy5ob3Jpem9udGFsQXJyb3dQb3NpdGlvbnMsIGFycm93TGVmdCwgYXJyb3dSaWdodCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcuaG92ZXIoXG5cdFx0XHRcdFx0XHRmdW5jdGlvbigpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGhvcml6b250YWxEcmFnLmFkZENsYXNzKCdqc3BIb3ZlcicpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcucmVtb3ZlQ2xhc3MoJ2pzcEhvdmVyJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0KS5iaW5kKFxuXHRcdFx0XHRcdFx0J21vdXNlZG93bi5qc3AnLFxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24oZSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gU3RvcCBJRSBmcm9tIGFsbG93aW5nIHRleHQgc2VsZWN0aW9uXG5cdFx0XHRcdFx0XHRcdCQoJ2h0bWwnKS5iaW5kKCdkcmFnc3RhcnQuanNwIHNlbGVjdHN0YXJ0LmpzcCcsIG5pbCk7XG5cblx0XHRcdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcuYWRkQ2xhc3MoJ2pzcEFjdGl2ZScpO1xuXG5cdFx0XHRcdFx0XHRcdHZhciBzdGFydFggPSBlLnBhZ2VYIC0gaG9yaXpvbnRhbERyYWcucG9zaXRpb24oKS5sZWZ0O1xuXG5cdFx0XHRcdFx0XHRcdCQoJ2h0bWwnKS5iaW5kKFxuXHRcdFx0XHRcdFx0XHRcdCdtb3VzZW1vdmUuanNwJyxcblx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbihlKVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHBvc2l0aW9uRHJhZ1goZS5wYWdlWCAtIHN0YXJ0WCwgZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0KS5iaW5kKCdtb3VzZXVwLmpzcCBtb3VzZWxlYXZlLmpzcCcsIGNhbmNlbERyYWcpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRob3Jpem9udGFsVHJhY2tXaWR0aCA9IGNvbnRhaW5lci5pbm5lcldpZHRoKCk7XG5cdFx0XHRcdFx0c2l6ZUhvcml6b250YWxTY3JvbGxiYXIoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBzaXplSG9yaXpvbnRhbFNjcm9sbGJhcigpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnRhaW5lci5maW5kKCc+LmpzcEhvcml6b250YWxCYXI+LmpzcENhcDp2aXNpYmxlLD4uanNwSG9yaXpvbnRhbEJhcj4uanNwQXJyb3cnKS5lYWNoKFxuXHRcdFx0XHRcdGZ1bmN0aW9uKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRob3Jpem9udGFsVHJhY2tXaWR0aCAtPSAkKHRoaXMpLm91dGVyV2lkdGgoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0aG9yaXpvbnRhbFRyYWNrLndpZHRoKGhvcml6b250YWxUcmFja1dpZHRoICsgJ3B4Jyk7XG5cdFx0XHRcdGhvcml6b250YWxEcmFnUG9zaXRpb24gPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiByZXNpemVTY3JvbGxiYXJzKClcblx0XHRcdHtcblx0XHRcdFx0aWYgKGlzU2Nyb2xsYWJsZUggJiYgaXNTY3JvbGxhYmxlVikge1xuXHRcdFx0XHRcdHZhciBob3Jpem9udGFsVHJhY2tIZWlnaHQgPSBob3Jpem9udGFsVHJhY2sub3V0ZXJIZWlnaHQoKSxcblx0XHRcdFx0XHRcdHZlcnRpY2FsVHJhY2tXaWR0aCA9IHZlcnRpY2FsVHJhY2sub3V0ZXJXaWR0aCgpO1xuXHRcdFx0XHRcdHZlcnRpY2FsVHJhY2tIZWlnaHQgLT0gaG9yaXpvbnRhbFRyYWNrSGVpZ2h0O1xuXHRcdFx0XHRcdCQoaG9yaXpvbnRhbEJhcikuZmluZCgnPi5qc3BDYXA6dmlzaWJsZSw+LmpzcEFycm93JykuZWFjaChcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aG9yaXpvbnRhbFRyYWNrV2lkdGggKz0gJCh0aGlzKS5vdXRlcldpZHRoKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRob3Jpem9udGFsVHJhY2tXaWR0aCAtPSB2ZXJ0aWNhbFRyYWNrV2lkdGg7XG5cdFx0XHRcdFx0cGFuZUhlaWdodCAtPSB2ZXJ0aWNhbFRyYWNrV2lkdGg7XG5cdFx0XHRcdFx0cGFuZVdpZHRoIC09IGhvcml6b250YWxUcmFja0hlaWdodDtcblx0XHRcdFx0XHRob3Jpem9udGFsVHJhY2sucGFyZW50KCkuYXBwZW5kKFxuXHRcdFx0XHRcdFx0JCgnPGRpdiBjbGFzcz1cImpzcENvcm5lclwiIC8+JykuY3NzKCd3aWR0aCcsIGhvcml6b250YWxUcmFja0hlaWdodCArICdweCcpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRzaXplVmVydGljYWxTY3JvbGxiYXIoKTtcblx0XHRcdFx0XHRzaXplSG9yaXpvbnRhbFNjcm9sbGJhcigpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHJlZmxvdyBjb250ZW50XG5cdFx0XHRcdGlmIChpc1Njcm9sbGFibGVIKSB7XG5cdFx0XHRcdFx0cGFuZS53aWR0aCgoY29udGFpbmVyLm91dGVyV2lkdGgoKSAtIG9yaWdpbmFsUGFkZGluZ1RvdGFsV2lkdGgpICsgJ3B4Jyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29udGVudEhlaWdodCA9IHBhbmUub3V0ZXJIZWlnaHQoKTtcblx0XHRcdFx0cGVyY2VudEluVmlld1YgPSBjb250ZW50SGVpZ2h0IC8gcGFuZUhlaWdodDtcblxuXHRcdFx0XHRpZiAoaXNTY3JvbGxhYmxlSCkge1xuXHRcdFx0XHRcdGhvcml6b250YWxEcmFnV2lkdGggPSBNYXRoLmNlaWwoMSAvIHBlcmNlbnRJblZpZXdIICogaG9yaXpvbnRhbFRyYWNrV2lkdGgpO1xuXHRcdFx0XHRcdGlmIChob3Jpem9udGFsRHJhZ1dpZHRoID4gc2V0dGluZ3MuaG9yaXpvbnRhbERyYWdNYXhXaWR0aCkge1xuXHRcdFx0XHRcdFx0aG9yaXpvbnRhbERyYWdXaWR0aCA9IHNldHRpbmdzLmhvcml6b250YWxEcmFnTWF4V2lkdGg7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChob3Jpem9udGFsRHJhZ1dpZHRoIDwgc2V0dGluZ3MuaG9yaXpvbnRhbERyYWdNaW5XaWR0aCkge1xuXHRcdFx0XHRcdFx0aG9yaXpvbnRhbERyYWdXaWR0aCA9IHNldHRpbmdzLmhvcml6b250YWxEcmFnTWluV2lkdGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGhvcml6b250YWxEcmFnLndpZHRoKGhvcml6b250YWxEcmFnV2lkdGggKyAncHgnKTtcblx0XHRcdFx0XHRkcmFnTWF4WCA9IGhvcml6b250YWxUcmFja1dpZHRoIC0gaG9yaXpvbnRhbERyYWdXaWR0aDtcblx0XHRcdFx0XHRfcG9zaXRpb25EcmFnWChob3Jpem9udGFsRHJhZ1Bvc2l0aW9uKTsgLy8gVG8gdXBkYXRlIHRoZSBzdGF0ZSBmb3IgdGhlIGFycm93IGJ1dHRvbnNcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaXNTY3JvbGxhYmxlVikge1xuXHRcdFx0XHRcdHZlcnRpY2FsRHJhZ0hlaWdodCA9IE1hdGguY2VpbCgxIC8gcGVyY2VudEluVmlld1YgKiB2ZXJ0aWNhbFRyYWNrSGVpZ2h0KTtcblx0XHRcdFx0XHRpZiAodmVydGljYWxEcmFnSGVpZ2h0ID4gc2V0dGluZ3MudmVydGljYWxEcmFnTWF4SGVpZ2h0KSB7XG5cdFx0XHRcdFx0XHR2ZXJ0aWNhbERyYWdIZWlnaHQgPSBzZXR0aW5ncy52ZXJ0aWNhbERyYWdNYXhIZWlnaHQ7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh2ZXJ0aWNhbERyYWdIZWlnaHQgPCBzZXR0aW5ncy52ZXJ0aWNhbERyYWdNaW5IZWlnaHQpIHtcblx0XHRcdFx0XHRcdHZlcnRpY2FsRHJhZ0hlaWdodCA9IHNldHRpbmdzLnZlcnRpY2FsRHJhZ01pbkhlaWdodDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dmVydGljYWxEcmFnLmhlaWdodCh2ZXJ0aWNhbERyYWdIZWlnaHQgKyAncHgnKTtcblx0XHRcdFx0XHRkcmFnTWF4WSA9IHZlcnRpY2FsVHJhY2tIZWlnaHQgLSB2ZXJ0aWNhbERyYWdIZWlnaHQ7XG5cdFx0XHRcdFx0X3Bvc2l0aW9uRHJhZ1kodmVydGljYWxEcmFnUG9zaXRpb24pOyAvLyBUbyB1cGRhdGUgdGhlIHN0YXRlIGZvciB0aGUgYXJyb3cgYnV0dG9uc1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGFwcGVuZEFycm93cyhlbGUsIHAsIGExLCBhMilcblx0XHRcdHtcblx0XHRcdFx0dmFyIHAxID0gXCJiZWZvcmVcIiwgcDIgPSBcImFmdGVyXCIsIGFUZW1wO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gU25pZmYgZm9yIG1hYy4uLiBJcyB0aGVyZSBhIGJldHRlciB3YXkgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGFycm93cyB3b3VsZCBuYXR1cmFsbHkgYXBwZWFyXG5cdFx0XHRcdC8vIGF0IHRoZSB0b3Agb3IgdGhlIGJvdHRvbSBvZiB0aGUgYmFyP1xuXHRcdFx0XHRpZiAocCA9PSBcIm9zXCIpIHtcblx0XHRcdFx0XHRwID0gL01hYy8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pID8gXCJhZnRlclwiIDogXCJzcGxpdFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChwID09IHAxKSB7XG5cdFx0XHRcdFx0cDIgPSBwO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHAgPT0gcDIpIHtcblx0XHRcdFx0XHRwMSA9IHA7XG5cdFx0XHRcdFx0YVRlbXAgPSBhMTtcblx0XHRcdFx0XHRhMSA9IGEyO1xuXHRcdFx0XHRcdGEyID0gYVRlbXA7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRlbGVbcDFdKGExKVtwMl0oYTIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBnZXRBcnJvd1Njcm9sbChkaXJYLCBkaXJZLCBlbGUpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbigpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhcnJvd1Njcm9sbChkaXJYLCBkaXJZLCB0aGlzLCBlbGUpO1xuXHRcdFx0XHRcdHRoaXMuYmx1cigpO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gYXJyb3dTY3JvbGwoZGlyWCwgZGlyWSwgYXJyb3csIGVsZSlcblx0XHRcdHtcblx0XHRcdFx0YXJyb3cgPSAkKGFycm93KS5hZGRDbGFzcygnanNwQWN0aXZlJyk7XG5cblx0XHRcdFx0dmFyIGV2ZSxcblx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0LFxuXHRcdFx0XHRcdGlzRmlyc3QgPSB0cnVlLFxuXHRcdFx0XHRcdGRvU2Nyb2xsID0gZnVuY3Rpb24oKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChkaXJYICE9PSAwKSB7XG5cdFx0XHRcdFx0XHRcdGpzcC5zY3JvbGxCeVgoZGlyWCAqIHNldHRpbmdzLmFycm93QnV0dG9uU3BlZWQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKGRpclkgIT09IDApIHtcblx0XHRcdFx0XHRcdFx0anNwLnNjcm9sbEJ5WShkaXJZICogc2V0dGluZ3MuYXJyb3dCdXR0b25TcGVlZCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0ID0gc2V0VGltZW91dChkb1Njcm9sbCwgaXNGaXJzdCA/IHNldHRpbmdzLmluaXRpYWxEZWxheSA6IHNldHRpbmdzLmFycm93UmVwZWF0RnJlcSk7XG5cdFx0XHRcdFx0XHRpc0ZpcnN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRkb1Njcm9sbCgpO1xuXG5cdFx0XHRcdGV2ZSA9IGVsZSA/ICdtb3VzZW91dC5qc3AnIDogJ21vdXNldXAuanNwJztcblx0XHRcdFx0ZWxlID0gZWxlIHx8ICQoJ2h0bWwnKTtcblx0XHRcdFx0ZWxlLmJpbmQoXG5cdFx0XHRcdFx0ZXZlLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhcnJvdy5yZW1vdmVDbGFzcygnanNwQWN0aXZlJyk7XG5cdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0ICYmIGNsZWFyVGltZW91dChzY3JvbGxUaW1lb3V0KTtcblx0XHRcdFx0XHRcdHNjcm9sbFRpbWVvdXQgPSBudWxsO1xuXHRcdFx0XHRcdFx0ZWxlLnVuYmluZChldmUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaW5pdENsaWNrT25UcmFjaygpXG5cdFx0XHR7XG5cdFx0XHRcdHJlbW92ZUNsaWNrT25UcmFjaygpO1xuXHRcdFx0XHRpZiAoaXNTY3JvbGxhYmxlVikge1xuXHRcdFx0XHRcdHZlcnRpY2FsVHJhY2suYmluZChcblx0XHRcdFx0XHRcdCdtb3VzZWRvd24uanNwJyxcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKGUpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChlLm9yaWdpbmFsVGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgZS5vcmlnaW5hbFRhcmdldCA9PSBlLmN1cnJlbnRUYXJnZXQpIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgY2xpY2tlZFRyYWNrID0gJCh0aGlzKSxcblx0XHRcdFx0XHRcdFx0XHRcdG9mZnNldCA9IGNsaWNrZWRUcmFjay5vZmZzZXQoKSxcblx0XHRcdFx0XHRcdFx0XHRcdGRpcmVjdGlvbiA9IGUucGFnZVkgLSBvZmZzZXQudG9wIC0gdmVydGljYWxEcmFnUG9zaXRpb24sXG5cdFx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0LFxuXHRcdFx0XHRcdFx0XHRcdFx0aXNGaXJzdCA9IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRkb1Njcm9sbCA9IGZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIG9mZnNldCA9IGNsaWNrZWRUcmFjay5vZmZzZXQoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3MgPSBlLnBhZ2VZIC0gb2Zmc2V0LnRvcCAtIHZlcnRpY2FsRHJhZ0hlaWdodCAvIDIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGVudERyYWdZID0gcGFuZUhlaWdodCAqIHNldHRpbmdzLnNjcm9sbFBhZ2VQZXJjZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRyYWdZID0gZHJhZ01heFkgKiBjb250ZW50RHJhZ1kgLyAoY29udGVudEhlaWdodCAtIHBhbmVIZWlnaHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoZGlyZWN0aW9uIDwgMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh2ZXJ0aWNhbERyYWdQb3NpdGlvbiAtIGRyYWdZID4gcG9zKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlZKC1jb250ZW50RHJhZ1kpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdZKHBvcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGRpcmVjdGlvbiA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodmVydGljYWxEcmFnUG9zaXRpb24gKyBkcmFnWSA8IHBvcykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0anNwLnNjcm9sbEJ5WShjb250ZW50RHJhZ1kpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdZKHBvcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhbmNlbENsaWNrKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0KGRvU2Nyb2xsLCBpc0ZpcnN0ID8gc2V0dGluZ3MuaW5pdGlhbERlbGF5IDogc2V0dGluZ3MudHJhY2tDbGlja1JlcGVhdEZyZXEpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpc0ZpcnN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2FuY2VsQ2xpY2sgPSBmdW5jdGlvbigpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNjcm9sbFRpbWVvdXQgJiYgY2xlYXJUaW1lb3V0KHNjcm9sbFRpbWVvdXQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUaW1lb3V0ID0gbnVsbDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0JChkb2N1bWVudCkudW5iaW5kKCdtb3VzZXVwLmpzcCcsIGNhbmNlbENsaWNrKTtcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0ZG9TY3JvbGwoKTtcblx0XHRcdFx0XHRcdFx0XHQkKGRvY3VtZW50KS5iaW5kKCdtb3VzZXVwLmpzcCcsIGNhbmNlbENsaWNrKTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoaXNTY3JvbGxhYmxlSCkge1xuXHRcdFx0XHRcdGhvcml6b250YWxUcmFjay5iaW5kKFxuXHRcdFx0XHRcdFx0J21vdXNlZG93bi5qc3AnLFxuXHRcdFx0XHRcdFx0ZnVuY3Rpb24oZSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0aWYgKGUub3JpZ2luYWxUYXJnZXQgPT09IHVuZGVmaW5lZCB8fCBlLm9yaWdpbmFsVGFyZ2V0ID09IGUuY3VycmVudFRhcmdldCkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBjbGlja2VkVHJhY2sgPSAkKHRoaXMpLFxuXHRcdFx0XHRcdFx0XHRcdFx0b2Zmc2V0ID0gY2xpY2tlZFRyYWNrLm9mZnNldCgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGlyZWN0aW9uID0gZS5wYWdlWCAtIG9mZnNldC5sZWZ0IC0gaG9yaXpvbnRhbERyYWdQb3NpdGlvbixcblx0XHRcdFx0XHRcdFx0XHRcdHNjcm9sbFRpbWVvdXQsXG5cdFx0XHRcdFx0XHRcdFx0XHRpc0ZpcnN0ID0gdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRcdGRvU2Nyb2xsID0gZnVuY3Rpb24oKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgb2Zmc2V0ID0gY2xpY2tlZFRyYWNrLm9mZnNldCgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBvcyA9IGUucGFnZVggLSBvZmZzZXQubGVmdCAtIGhvcml6b250YWxEcmFnV2lkdGggLyAyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRlbnREcmFnWCA9IHBhbmVXaWR0aCAqIHNldHRpbmdzLnNjcm9sbFBhZ2VQZXJjZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRyYWdYID0gZHJhZ01heFggKiBjb250ZW50RHJhZ1ggLyAoY29udGVudFdpZHRoIC0gcGFuZVdpZHRoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGRpcmVjdGlvbiA8IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoaG9yaXpvbnRhbERyYWdQb3NpdGlvbiAtIGRyYWdYID4gcG9zKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlYKC1jb250ZW50RHJhZ1gpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdYKHBvcyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGRpcmVjdGlvbiA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoaG9yaXpvbnRhbERyYWdQb3NpdGlvbiArIGRyYWdYIDwgcG9zKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlYKGNvbnRlbnREcmFnWCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBvc2l0aW9uRHJhZ1gocG9zKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FuY2VsQ2xpY2soKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0c2Nyb2xsVGltZW91dCA9IHNldFRpbWVvdXQoZG9TY3JvbGwsIGlzRmlyc3QgPyBzZXR0aW5ncy5pbml0aWFsRGVsYXkgOiBzZXR0aW5ncy50cmFja0NsaWNrUmVwZWF0RnJlcSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlzRmlyc3QgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRjYW5jZWxDbGljayA9IGZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c2Nyb2xsVGltZW91dCAmJiBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZW91dCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNjcm9sbFRpbWVvdXQgPSBudWxsO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQkKGRvY3VtZW50KS51bmJpbmQoJ21vdXNldXAuanNwJywgY2FuY2VsQ2xpY2spO1xuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRkb1Njcm9sbCgpO1xuXHRcdFx0XHRcdFx0XHRcdCQoZG9jdW1lbnQpLmJpbmQoJ21vdXNldXAuanNwJywgY2FuY2VsQ2xpY2spO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcmVtb3ZlQ2xpY2tPblRyYWNrKClcblx0XHRcdHtcblx0XHRcdFx0aWYgKGhvcml6b250YWxUcmFjaykge1xuXHRcdFx0XHRcdGhvcml6b250YWxUcmFjay51bmJpbmQoJ21vdXNlZG93bi5qc3AnKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodmVydGljYWxUcmFjaykge1xuXHRcdFx0XHRcdHZlcnRpY2FsVHJhY2sudW5iaW5kKCdtb3VzZWRvd24uanNwJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2FuY2VsRHJhZygpXG5cdFx0XHR7XG5cdFx0XHRcdCQoJ2h0bWwnKS51bmJpbmQoJ2RyYWdzdGFydC5qc3Agc2VsZWN0c3RhcnQuanNwIG1vdXNlbW92ZS5qc3AgbW91c2V1cC5qc3AgbW91c2VsZWF2ZS5qc3AnKTtcblxuXHRcdFx0XHRpZiAodmVydGljYWxEcmFnKSB7XG5cdFx0XHRcdFx0dmVydGljYWxEcmFnLnJlbW92ZUNsYXNzKCdqc3BBY3RpdmUnKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoaG9yaXpvbnRhbERyYWcpIHtcblx0XHRcdFx0XHRob3Jpem9udGFsRHJhZy5yZW1vdmVDbGFzcygnanNwQWN0aXZlJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcG9zaXRpb25EcmFnWShkZXN0WSwgYW5pbWF0ZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFpc1Njcm9sbGFibGVWKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkZXN0WSA8IDApIHtcblx0XHRcdFx0XHRkZXN0WSA9IDA7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGVzdFkgPiBkcmFnTWF4WSkge1xuXHRcdFx0XHRcdGRlc3RZID0gZHJhZ01heFk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBjYW4ndCBqdXN0IGNoZWNrIGlmKGFuaW1hdGUpIGJlY2F1c2UgZmFsc2UgaXMgYSB2YWxpZCB2YWx1ZSB0aGF0IGNvdWxkIGJlIHBhc3NlZCBpbi4uLlxuXHRcdFx0XHRpZiAoYW5pbWF0ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YW5pbWF0ZSA9IHNldHRpbmdzLmFuaW1hdGVTY3JvbGw7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFuaW1hdGUpIHtcblx0XHRcdFx0XHRqc3AuYW5pbWF0ZSh2ZXJ0aWNhbERyYWcsICd0b3AnLCBkZXN0WSxcdF9wb3NpdGlvbkRyYWdZKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2ZXJ0aWNhbERyYWcuY3NzKCd0b3AnLCBkZXN0WSk7XG5cdFx0XHRcdFx0X3Bvc2l0aW9uRHJhZ1koZGVzdFkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gX3Bvc2l0aW9uRHJhZ1koZGVzdFkpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChkZXN0WSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0ZGVzdFkgPSB2ZXJ0aWNhbERyYWcucG9zaXRpb24oKS50b3A7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb250YWluZXIuc2Nyb2xsVG9wKDApO1xuXHRcdFx0XHR2ZXJ0aWNhbERyYWdQb3NpdGlvbiA9IGRlc3RZO1xuXG5cdFx0XHRcdHZhciBpc0F0VG9wID0gdmVydGljYWxEcmFnUG9zaXRpb24gPT09IDAsXG5cdFx0XHRcdFx0aXNBdEJvdHRvbSA9IHZlcnRpY2FsRHJhZ1Bvc2l0aW9uID09IGRyYWdNYXhZLFxuXHRcdFx0XHRcdHBlcmNlbnRTY3JvbGxlZCA9IGRlc3RZLyBkcmFnTWF4WSxcblx0XHRcdFx0XHRkZXN0VG9wID0gLXBlcmNlbnRTY3JvbGxlZCAqIChjb250ZW50SGVpZ2h0IC0gcGFuZUhlaWdodCk7XG5cblx0XHRcdFx0aWYgKHdhc0F0VG9wICE9IGlzQXRUb3AgfHwgd2FzQXRCb3R0b20gIT0gaXNBdEJvdHRvbSkge1xuXHRcdFx0XHRcdHdhc0F0VG9wID0gaXNBdFRvcDtcblx0XHRcdFx0XHR3YXNBdEJvdHRvbSA9IGlzQXRCb3R0b207XG5cdFx0XHRcdFx0ZWxlbS50cmlnZ2VyKCdqc3AtYXJyb3ctY2hhbmdlJywgW3dhc0F0VG9wLCB3YXNBdEJvdHRvbSwgd2FzQXRMZWZ0LCB3YXNBdFJpZ2h0XSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHVwZGF0ZVZlcnRpY2FsQXJyb3dzKGlzQXRUb3AsIGlzQXRCb3R0b20pO1xuXHRcdFx0XHRwYW5lLmNzcygndG9wJywgZGVzdFRvcCk7XG5cdFx0XHRcdGVsZW0udHJpZ2dlcignanNwLXNjcm9sbC15JywgWy1kZXN0VG9wLCBpc0F0VG9wLCBpc0F0Qm90dG9tXSkudHJpZ2dlcignc2Nyb2xsJyk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHBvc2l0aW9uRHJhZ1goZGVzdFgsIGFuaW1hdGUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICghaXNTY3JvbGxhYmxlSCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZGVzdFggPCAwKSB7XG5cdFx0XHRcdFx0ZGVzdFggPSAwO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRlc3RYID4gZHJhZ01heFgpIHtcblx0XHRcdFx0XHRkZXN0WCA9IGRyYWdNYXhYO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFuaW1hdGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFuaW1hdGUgPSBzZXR0aW5ncy5hbmltYXRlU2Nyb2xsO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhbmltYXRlKSB7XG5cdFx0XHRcdFx0anNwLmFuaW1hdGUoaG9yaXpvbnRhbERyYWcsICdsZWZ0JywgZGVzdFgsXHRfcG9zaXRpb25EcmFnWCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aG9yaXpvbnRhbERyYWcuY3NzKCdsZWZ0JywgZGVzdFgpO1xuXHRcdFx0XHRcdF9wb3NpdGlvbkRyYWdYKGRlc3RYKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBfcG9zaXRpb25EcmFnWChkZXN0WClcblx0XHRcdHtcblx0XHRcdFx0aWYgKGRlc3RYID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRkZXN0WCA9IGhvcml6b250YWxEcmFnLnBvc2l0aW9uKCkubGVmdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XG5cdFx0XHRcdGhvcml6b250YWxEcmFnUG9zaXRpb24gPSBkZXN0WDtcblxuXHRcdFx0XHR2YXIgaXNBdExlZnQgPSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uID09PSAwLFxuXHRcdFx0XHRcdGlzQXRSaWdodCA9IGhvcml6b250YWxEcmFnUG9zaXRpb24gPT0gZHJhZ01heFgsXG5cdFx0XHRcdFx0cGVyY2VudFNjcm9sbGVkID0gZGVzdFggLyBkcmFnTWF4WCxcblx0XHRcdFx0XHRkZXN0TGVmdCA9IC1wZXJjZW50U2Nyb2xsZWQgKiAoY29udGVudFdpZHRoIC0gcGFuZVdpZHRoKTtcblxuXHRcdFx0XHRpZiAod2FzQXRMZWZ0ICE9IGlzQXRMZWZ0IHx8IHdhc0F0UmlnaHQgIT0gaXNBdFJpZ2h0KSB7XG5cdFx0XHRcdFx0d2FzQXRMZWZ0ID0gaXNBdExlZnQ7XG5cdFx0XHRcdFx0d2FzQXRSaWdodCA9IGlzQXRSaWdodDtcblx0XHRcdFx0XHRlbGVtLnRyaWdnZXIoJ2pzcC1hcnJvdy1jaGFuZ2UnLCBbd2FzQXRUb3AsIHdhc0F0Qm90dG9tLCB3YXNBdExlZnQsIHdhc0F0UmlnaHRdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0dXBkYXRlSG9yaXpvbnRhbEFycm93cyhpc0F0TGVmdCwgaXNBdFJpZ2h0KTtcblx0XHRcdFx0cGFuZS5jc3MoJ2xlZnQnLCBkZXN0TGVmdCk7XG5cdFx0XHRcdGVsZW0udHJpZ2dlcignanNwLXNjcm9sbC14JywgWy1kZXN0TGVmdCwgaXNBdExlZnQsIGlzQXRSaWdodF0pLnRyaWdnZXIoJ3Njcm9sbCcpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiB1cGRhdGVWZXJ0aWNhbEFycm93cyhpc0F0VG9wLCBpc0F0Qm90dG9tKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoc2V0dGluZ3Muc2hvd0Fycm93cykge1xuXHRcdFx0XHRcdGFycm93VXBbaXNBdFRvcCA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXSgnanNwRGlzYWJsZWQnKTtcblx0XHRcdFx0XHRhcnJvd0Rvd25baXNBdEJvdHRvbSA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXSgnanNwRGlzYWJsZWQnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiB1cGRhdGVIb3Jpem9udGFsQXJyb3dzKGlzQXRMZWZ0LCBpc0F0UmlnaHQpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChzZXR0aW5ncy5zaG93QXJyb3dzKSB7XG5cdFx0XHRcdFx0YXJyb3dMZWZ0W2lzQXRMZWZ0ID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKCdqc3BEaXNhYmxlZCcpO1xuXHRcdFx0XHRcdGFycm93UmlnaHRbaXNBdFJpZ2h0ID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKCdqc3BEaXNhYmxlZCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHNjcm9sbFRvWShkZXN0WSwgYW5pbWF0ZSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIHBlcmNlbnRTY3JvbGxlZCA9IGRlc3RZIC8gKGNvbnRlbnRIZWlnaHQgLSBwYW5lSGVpZ2h0KTtcblx0XHRcdFx0cG9zaXRpb25EcmFnWShwZXJjZW50U2Nyb2xsZWQgKiBkcmFnTWF4WSwgYW5pbWF0ZSk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHNjcm9sbFRvWChkZXN0WCwgYW5pbWF0ZSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIHBlcmNlbnRTY3JvbGxlZCA9IGRlc3RYIC8gKGNvbnRlbnRXaWR0aCAtIHBhbmVXaWR0aCk7XG5cdFx0XHRcdHBvc2l0aW9uRHJhZ1gocGVyY2VudFNjcm9sbGVkICogZHJhZ01heFgsIGFuaW1hdGUpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBzY3JvbGxUb0VsZW1lbnQoZWxlLCBzdGlja1RvVG9wLCBhbmltYXRlKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgZSwgZWxlSGVpZ2h0LCBlbGVXaWR0aCwgZWxlVG9wID0gMCwgZWxlTGVmdCA9IDAsIHZpZXdwb3J0VG9wLCB2aWV3cG9ydExlZnQsIG1heFZpc2libGVFbGVUb3AsIG1heFZpc2libGVFbGVMZWZ0LCBkZXN0WSwgZGVzdFg7XG5cblx0XHRcdFx0Ly8gTGVnYWwgaGFzaCB2YWx1ZXMgYXJlbid0IG5lY2Vzc2FyaWx5IGxlZ2FsIGpRdWVyeSBzZWxlY3RvcnMgc28gd2UgbmVlZCB0byBjYXRjaCBhbnlcblx0XHRcdFx0Ly8gZXJyb3JzIGZyb20gdGhlIGxvb2t1cC4uLlxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGUgPSAkKGVsZSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbGVIZWlnaHQgPSBlLm91dGVySGVpZ2h0KCk7XG5cdFx0XHRcdGVsZVdpZHRoPSBlLm91dGVyV2lkdGgoKTtcblxuXHRcdFx0XHRjb250YWluZXIuc2Nyb2xsVG9wKDApO1xuXHRcdFx0XHRjb250YWluZXIuc2Nyb2xsTGVmdCgwKTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIGxvb3AgdGhyb3VnaCBwYXJlbnRzIGFkZGluZyB0aGUgb2Zmc2V0IHRvcCBvZiBhbnkgZWxlbWVudHMgdGhhdCBhcmUgcmVsYXRpdmVseSBwb3NpdGlvbmVkIGJldHdlZW5cblx0XHRcdFx0Ly8gdGhlIGZvY3VzZWQgZWxlbWVudCBhbmQgdGhlIGpzcFBhbmUgc28gd2UgY2FuIGdldCB0aGUgdHJ1ZSBkaXN0YW5jZSBmcm9tIHRoZSB0b3Bcblx0XHRcdFx0Ly8gb2YgdGhlIGZvY3VzZWQgZWxlbWVudCB0byB0aGUgdG9wIG9mIHRoZSBzY3JvbGxwYW5lLi4uXG5cdFx0XHRcdHdoaWxlICghZS5pcygnLmpzcFBhbmUnKSkge1xuXHRcdFx0XHRcdGVsZVRvcCArPSBlLnBvc2l0aW9uKCkudG9wO1xuXHRcdFx0XHRcdGVsZUxlZnQgKz0gZS5wb3NpdGlvbigpLmxlZnQ7XG5cdFx0XHRcdFx0ZSA9IGUub2Zmc2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0aWYgKC9eYm9keXxodG1sJC9pLnRlc3QoZVswXS5ub2RlTmFtZSkpIHtcblx0XHRcdFx0XHRcdC8vIHdlIGVuZGVkIHVwIHRvbyBoaWdoIGluIHRoZSBkb2N1bWVudCBzdHJ1Y3R1cmUuIFF1aXQhXG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmlld3BvcnRUb3AgPSBjb250ZW50UG9zaXRpb25ZKCk7XG5cdFx0XHRcdG1heFZpc2libGVFbGVUb3AgPSB2aWV3cG9ydFRvcCArIHBhbmVIZWlnaHQ7XG5cdFx0XHRcdGlmIChlbGVUb3AgPCB2aWV3cG9ydFRvcCB8fCBzdGlja1RvVG9wKSB7IC8vIGVsZW1lbnQgaXMgYWJvdmUgdmlld3BvcnRcblx0XHRcdFx0XHRkZXN0WSA9IGVsZVRvcCAtIHNldHRpbmdzLnZlcnRpY2FsR3V0dGVyO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGVsZVRvcCArIGVsZUhlaWdodCA+IG1heFZpc2libGVFbGVUb3ApIHsgLy8gZWxlbWVudCBpcyBiZWxvdyB2aWV3cG9ydFxuXHRcdFx0XHRcdGRlc3RZID0gZWxlVG9wIC0gcGFuZUhlaWdodCArIGVsZUhlaWdodCArIHNldHRpbmdzLnZlcnRpY2FsR3V0dGVyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkZXN0WSkge1xuXHRcdFx0XHRcdHNjcm9sbFRvWShkZXN0WSwgYW5pbWF0ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHZpZXdwb3J0TGVmdCA9IGNvbnRlbnRQb3NpdGlvblgoKTtcblx0ICAgICAgICAgICAgbWF4VmlzaWJsZUVsZUxlZnQgPSB2aWV3cG9ydExlZnQgKyBwYW5lV2lkdGg7XG5cdCAgICAgICAgICAgIGlmIChlbGVMZWZ0IDwgdmlld3BvcnRMZWZ0IHx8IHN0aWNrVG9Ub3ApIHsgLy8gZWxlbWVudCBpcyB0byB0aGUgbGVmdCBvZiB2aWV3cG9ydFxuXHQgICAgICAgICAgICAgICAgZGVzdFggPSBlbGVMZWZ0IC0gc2V0dGluZ3MuaG9yaXpvbnRhbEd1dHRlcjtcblx0ICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVMZWZ0ICsgZWxlV2lkdGggPiBtYXhWaXNpYmxlRWxlTGVmdCkgeyAvLyBlbGVtZW50IGlzIHRvIHRoZSByaWdodCB2aWV3cG9ydFxuXHQgICAgICAgICAgICAgICAgZGVzdFggPSBlbGVMZWZ0IC0gcGFuZVdpZHRoICsgZWxlV2lkdGggKyBzZXR0aW5ncy5ob3Jpem9udGFsR3V0dGVyO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIGlmIChkZXN0WCkge1xuXHQgICAgICAgICAgICAgICAgc2Nyb2xsVG9YKGRlc3RYLCBhbmltYXRlKTtcblx0ICAgICAgICAgICAgfVxuXG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGNvbnRlbnRQb3NpdGlvblgoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gLXBhbmUucG9zaXRpb24oKS5sZWZ0O1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBjb250ZW50UG9zaXRpb25ZKClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIC1wYW5lLnBvc2l0aW9uKCkudG9wO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBpc0Nsb3NlVG9Cb3R0b20oKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgc2Nyb2xsYWJsZUhlaWdodCA9IGNvbnRlbnRIZWlnaHQgLSBwYW5lSGVpZ2h0O1xuXHRcdFx0XHRyZXR1cm4gKHNjcm9sbGFibGVIZWlnaHQgPiAyMCkgJiYgKHNjcm9sbGFibGVIZWlnaHQgLSBjb250ZW50UG9zaXRpb25ZKCkgPCAxMCk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGlzQ2xvc2VUb1JpZ2h0KClcblx0XHRcdHtcblx0XHRcdFx0dmFyIHNjcm9sbGFibGVXaWR0aCA9IGNvbnRlbnRXaWR0aCAtIHBhbmVXaWR0aDtcblx0XHRcdFx0cmV0dXJuIChzY3JvbGxhYmxlV2lkdGggPiAyMCkgJiYgKHNjcm9sbGFibGVXaWR0aCAtIGNvbnRlbnRQb3NpdGlvblgoKSA8IDEwKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaW5pdE1vdXNld2hlZWwoKVxuXHRcdFx0e1xuXHRcdFx0XHRjb250YWluZXIudW5iaW5kKG13RXZlbnQpLmJpbmQoXG5cdFx0XHRcdFx0bXdFdmVudCxcblx0XHRcdFx0XHRmdW5jdGlvbiAoZXZlbnQsIGRlbHRhLCBkZWx0YVgsIGRlbHRhWSkge1xuXHRcdFx0XHRcdFx0dmFyIGRYID0gaG9yaXpvbnRhbERyYWdQb3NpdGlvbiwgZFkgPSB2ZXJ0aWNhbERyYWdQb3NpdGlvbjtcblx0XHRcdFx0XHRcdGpzcC5zY3JvbGxCeShkZWx0YVggKiBzZXR0aW5ncy5tb3VzZVdoZWVsU3BlZWQsIC1kZWx0YVkgKiBzZXR0aW5ncy5tb3VzZVdoZWVsU3BlZWQsIGZhbHNlKTtcblx0XHRcdFx0XHRcdC8vIHJldHVybiB0cnVlIGlmIHRoZXJlIHdhcyBubyBtb3ZlbWVudCBzbyByZXN0IG9mIHNjcmVlbiBjYW4gc2Nyb2xsXG5cdFx0XHRcdFx0XHRyZXR1cm4gZFggPT0gaG9yaXpvbnRhbERyYWdQb3NpdGlvbiAmJiBkWSA9PSB2ZXJ0aWNhbERyYWdQb3NpdGlvbjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHJlbW92ZU1vdXNld2hlZWwoKVxuXHRcdFx0e1xuXHRcdFx0XHRjb250YWluZXIudW5iaW5kKG13RXZlbnQpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBuaWwoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGluaXRGb2N1c0hhbmRsZXIoKVxuXHRcdFx0e1xuXHRcdFx0XHRwYW5lLmZpbmQoJzppbnB1dCxhJykudW5iaW5kKCdmb2N1cy5qc3AnKS5iaW5kKFxuXHRcdFx0XHRcdCdmb2N1cy5qc3AnLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2Nyb2xsVG9FbGVtZW50KGUudGFyZ2V0LCBmYWxzZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiByZW1vdmVGb2N1c0hhbmRsZXIoKVxuXHRcdFx0e1xuXHRcdFx0XHRwYW5lLmZpbmQoJzppbnB1dCxhJykudW5iaW5kKCdmb2N1cy5qc3AnKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0ZnVuY3Rpb24gaW5pdEtleWJvYXJkTmF2KClcblx0XHRcdHtcblx0XHRcdFx0dmFyIGtleURvd24sIGVsZW1lbnRIYXNTY3JvbGxlZCwgdmFsaWRQYXJlbnRzID0gW107XG5cdFx0XHRcdGlzU2Nyb2xsYWJsZUggJiYgdmFsaWRQYXJlbnRzLnB1c2goaG9yaXpvbnRhbEJhclswXSk7XG5cdFx0XHRcdGlzU2Nyb2xsYWJsZVYgJiYgdmFsaWRQYXJlbnRzLnB1c2godmVydGljYWxCYXJbMF0pO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gSUUgYWxzbyBmb2N1c2VzIGVsZW1lbnRzIHRoYXQgZG9uJ3QgaGF2ZSB0YWJpbmRleCBzZXQuXG5cdFx0XHRcdHBhbmUuZm9jdXMoXG5cdFx0XHRcdFx0ZnVuY3Rpb24oKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGVsZW0uZm9jdXMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRlbGVtLmF0dHIoJ3RhYmluZGV4JywgMClcblx0XHRcdFx0XHQudW5iaW5kKCdrZXlkb3duLmpzcCBrZXlwcmVzcy5qc3AnKVxuXHRcdFx0XHRcdC5iaW5kKFxuXHRcdFx0XHRcdFx0J2tleWRvd24uanNwJyxcblx0XHRcdFx0XHRcdGZ1bmN0aW9uKGUpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChlLnRhcmdldCAhPT0gdGhpcyAmJiAhKHZhbGlkUGFyZW50cy5sZW5ndGggJiYgJChlLnRhcmdldCkuY2xvc2VzdCh2YWxpZFBhcmVudHMpLmxlbmd0aCkpe1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR2YXIgZFggPSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uLCBkWSA9IHZlcnRpY2FsRHJhZ1Bvc2l0aW9uO1xuXHRcdFx0XHRcdFx0XHRzd2l0Y2goZS5rZXlDb2RlKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSA0MDogLy8gZG93blxuXHRcdFx0XHRcdFx0XHRcdGNhc2UgMzg6IC8vIHVwXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSAzNDogLy8gcGFnZSBkb3duXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSAzMjogLy8gc3BhY2Vcblx0XHRcdFx0XHRcdFx0XHRjYXNlIDMzOiAvLyBwYWdlIHVwXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSAzOTogLy8gcmlnaHRcblx0XHRcdFx0XHRcdFx0XHRjYXNlIDM3OiAvLyBsZWZ0XG5cdFx0XHRcdFx0XHRcdFx0XHRrZXlEb3duID0gZS5rZXlDb2RlO1xuXHRcdFx0XHRcdFx0XHRcdFx0a2V5RG93bkhhbmRsZXIoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgMzU6IC8vIGVuZFxuXHRcdFx0XHRcdFx0XHRcdFx0c2Nyb2xsVG9ZKGNvbnRlbnRIZWlnaHQgLSBwYW5lSGVpZ2h0KTtcblx0XHRcdFx0XHRcdFx0XHRcdGtleURvd24gPSBudWxsO1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSAzNjogLy8gaG9tZVxuXHRcdFx0XHRcdFx0XHRcdFx0c2Nyb2xsVG9ZKDApO1xuXHRcdFx0XHRcdFx0XHRcdFx0a2V5RG93biA9IG51bGw7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGVsZW1lbnRIYXNTY3JvbGxlZCA9IGUua2V5Q29kZSA9PSBrZXlEb3duICYmIGRYICE9IGhvcml6b250YWxEcmFnUG9zaXRpb24gfHwgZFkgIT0gdmVydGljYWxEcmFnUG9zaXRpb247XG5cdFx0XHRcdFx0XHRcdHJldHVybiAhZWxlbWVudEhhc1Njcm9sbGVkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCkuYmluZChcblx0XHRcdFx0XHRcdCdrZXlwcmVzcy5qc3AnLCAvLyBGb3IgRkYvIE9TWCBzbyB0aGF0IHdlIGNhbiBjYW5jZWwgdGhlIHJlcGVhdCBrZXkgcHJlc3NlcyBpZiB0aGUgSlNQIHNjcm9sbHMuLi5cblx0XHRcdFx0XHRcdGZ1bmN0aW9uKGUpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlmIChlLmtleUNvZGUgPT0ga2V5RG93bikge1xuXHRcdFx0XHRcdFx0XHRcdGtleURvd25IYW5kbGVyKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuICFlbGVtZW50SGFzU2Nyb2xsZWQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChzZXR0aW5ncy5oaWRlRm9jdXMpIHtcblx0XHRcdFx0XHRlbGVtLmNzcygnb3V0bGluZScsICdub25lJyk7XG5cdFx0XHRcdFx0aWYgKCdoaWRlRm9jdXMnIGluIGNvbnRhaW5lclswXSl7XG5cdFx0XHRcdFx0XHRlbGVtLmF0dHIoJ2hpZGVGb2N1cycsIHRydWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlbGVtLmNzcygnb3V0bGluZScsICcnKTtcblx0XHRcdFx0XHRpZiAoJ2hpZGVGb2N1cycgaW4gY29udGFpbmVyWzBdKXtcblx0XHRcdFx0XHRcdGVsZW0uYXR0cignaGlkZUZvY3VzJywgZmFsc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0ZnVuY3Rpb24ga2V5RG93bkhhbmRsZXIoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGRYID0gaG9yaXpvbnRhbERyYWdQb3NpdGlvbiwgZFkgPSB2ZXJ0aWNhbERyYWdQb3NpdGlvbjtcblx0XHRcdFx0XHRzd2l0Y2goa2V5RG93bikge1xuXHRcdFx0XHRcdFx0Y2FzZSA0MDogLy8gZG93blxuXHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlZKHNldHRpbmdzLmtleWJvYXJkU3BlZWQsIGZhbHNlKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIDM4OiAvLyB1cFxuXHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlZKC1zZXR0aW5ncy5rZXlib2FyZFNwZWVkLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAzNDogLy8gcGFnZSBkb3duXG5cdFx0XHRcdFx0XHRjYXNlIDMyOiAvLyBzcGFjZVxuXHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlZKHBhbmVIZWlnaHQgKiBzZXR0aW5ncy5zY3JvbGxQYWdlUGVyY2VudCwgZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgMzM6IC8vIHBhZ2UgdXBcblx0XHRcdFx0XHRcdFx0anNwLnNjcm9sbEJ5WSgtcGFuZUhlaWdodCAqIHNldHRpbmdzLnNjcm9sbFBhZ2VQZXJjZW50LCBmYWxzZSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAzOTogLy8gcmlnaHRcblx0XHRcdFx0XHRcdFx0anNwLnNjcm9sbEJ5WChzZXR0aW5ncy5rZXlib2FyZFNwZWVkLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSAzNzogLy8gbGVmdFxuXHRcdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlYKC1zZXR0aW5ncy5rZXlib2FyZFNwZWVkLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGVsZW1lbnRIYXNTY3JvbGxlZCA9IGRYICE9IGhvcml6b250YWxEcmFnUG9zaXRpb24gfHwgZFkgIT0gdmVydGljYWxEcmFnUG9zaXRpb247XG5cdFx0XHRcdFx0cmV0dXJuIGVsZW1lbnRIYXNTY3JvbGxlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRmdW5jdGlvbiByZW1vdmVLZXlib2FyZE5hdigpXG5cdFx0XHR7XG5cdFx0XHRcdGVsZW0uYXR0cigndGFiaW5kZXgnLCAnLTEnKVxuXHRcdFx0XHRcdC5yZW1vdmVBdHRyKCd0YWJpbmRleCcpXG5cdFx0XHRcdFx0LnVuYmluZCgna2V5ZG93bi5qc3Aga2V5cHJlc3MuanNwJyk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIG9ic2VydmVIYXNoKClcblx0XHRcdHtcblx0XHRcdFx0aWYgKGxvY2F0aW9uLmhhc2ggJiYgbG9jYXRpb24uaGFzaC5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0dmFyIGUsXG5cdFx0XHRcdFx0XHRyZXRyeUludCxcblx0XHRcdFx0XHRcdGhhc2ggPSBlc2NhcGUobG9jYXRpb24uaGFzaC5zdWJzdHIoMSkpIC8vIGhhc2ggbXVzdCBiZSBlc2NhcGVkIHRvIHByZXZlbnQgWFNTXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGUgPSAkKCcjJyArIGhhc2ggKyAnLCBhW25hbWU9XCInICsgaGFzaCArICdcIl0nKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoZS5sZW5ndGggJiYgcGFuZS5maW5kKGhhc2gpKSB7XG5cdFx0XHRcdFx0XHQvLyBuYXN0eSB3b3JrYXJvdW5kIGJ1dCBpdCBhcHBlYXJzIHRvIHRha2UgYSBsaXR0bGUgd2hpbGUgYmVmb3JlIHRoZSBoYXNoIGhhcyBkb25lIGl0cyB0aGluZ1xuXHRcdFx0XHRcdFx0Ly8gdG8gdGhlIHJlbmRlcmVkIHBhZ2Ugc28gd2UganVzdCB3YWl0IHVudGlsIHRoZSBjb250YWluZXIncyBzY3JvbGxUb3AgaGFzIGJlZW4gbWVzc2VkIHVwLlxuXHRcdFx0XHRcdFx0aWYgKGNvbnRhaW5lci5zY3JvbGxUb3AoKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRyZXRyeUludCA9IHNldEludGVydmFsKFxuXHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoY29udGFpbmVyLnNjcm9sbFRvcCgpID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRzY3JvbGxUb0VsZW1lbnQoZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCQoZG9jdW1lbnQpLnNjcm9sbFRvcChjb250YWluZXIucG9zaXRpb24oKS50b3ApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjbGVhckludGVydmFsKHJldHJ5SW50KTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdDUwXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRzY3JvbGxUb0VsZW1lbnQoZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdCQoZG9jdW1lbnQpLnNjcm9sbFRvcChjb250YWluZXIucG9zaXRpb24oKS50b3ApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBoaWphY2tJbnRlcm5hbExpbmtzKClcblx0XHRcdHtcblx0XHRcdFx0Ly8gb25seSByZWdpc3RlciB0aGUgbGluayBoYW5kbGVyIG9uY2Vcblx0XHRcdFx0aWYgKCQoZG9jdW1lbnQuYm9keSkuZGF0YSgnanNwSGlqYWNrJykpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyByZW1lbWJlciB0aGF0IHRoZSBoYW5kbGVyIHdhcyBib3VuZFxuXHRcdFx0XHQkKGRvY3VtZW50LmJvZHkpLmRhdGEoJ2pzcEhpamFjaycsIHRydWUpO1xuXG5cdFx0XHRcdC8vIHVzZSBsaXZlIGhhbmRsZXIgdG8gYWxzbyBjYXB0dXJlIG5ld2x5IGNyZWF0ZWQgbGlua3Ncblx0XHRcdFx0JChkb2N1bWVudC5ib2R5KS5kZWxlZ2F0ZSgnYVtocmVmKj0jXScsICdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0Ly8gZG9lcyB0aGUgbGluayBwb2ludCB0byB0aGUgc2FtZSBwYWdlP1xuXHRcdFx0XHRcdC8vIHRoaXMgYWxzbyB0YWtlcyBjYXJlIG9mIGNhc2VzIHdpdGggYSA8YmFzZT4tVGFnIG9yIExpbmtzIG5vdCBzdGFydGluZyB3aXRoIHRoZSBoYXNoICNcblx0XHRcdFx0XHQvLyBlLmcuIDxhIGhyZWY9XCJpbmRleC5odG1sI3Rlc3RcIj4gd2hlbiB0aGUgY3VycmVudCB1cmwgYWxyZWFkeSBpcyBpbmRleC5odG1sXG5cdFx0XHRcdFx0dmFyIGhyZWYgPSB0aGlzLmhyZWYuc3Vic3RyKDAsIHRoaXMuaHJlZi5pbmRleE9mKCcjJykpLFxuXHRcdFx0XHRcdFx0bG9jYXRpb25IcmVmID0gbG9jYXRpb24uaHJlZixcblx0XHRcdFx0XHRcdGhhc2gsXG5cdFx0XHRcdFx0XHRlbGVtZW50LFxuXHRcdFx0XHRcdFx0Y29udGFpbmVyLFxuXHRcdFx0XHRcdFx0anNwLFxuXHRcdFx0XHRcdFx0c2Nyb2xsVG9wLFxuXHRcdFx0XHRcdFx0ZWxlbWVudFRvcDtcblx0XHRcdFx0XHRpZiAobG9jYXRpb24uaHJlZi5pbmRleE9mKCcjJykgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRsb2NhdGlvbkhyZWYgPSBsb2NhdGlvbi5ocmVmLnN1YnN0cigwLCBsb2NhdGlvbi5ocmVmLmluZGV4T2YoJyMnKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChocmVmICE9PSBsb2NhdGlvbkhyZWYpIHtcblx0XHRcdFx0XHRcdC8vIHRoZSBsaW5rIHBvaW50cyB0byBhbm90aGVyIHBhZ2Vcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBjaGVjayBpZiBqU2Nyb2xsUGFuZSBzaG91bGQgaGFuZGxlIHRoaXMgY2xpY2sgZXZlbnRcblx0XHRcdFx0XHRoYXNoID0gZXNjYXBlKHRoaXMuaHJlZi5zdWJzdHIodGhpcy5ocmVmLmluZGV4T2YoJyMnKSArIDEpKTtcblxuXHRcdFx0XHRcdC8vIGZpbmQgdGhlIGVsZW1lbnQgb24gdGhlIHBhZ2Vcblx0XHRcdFx0XHRlbGVtZW50O1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRlbGVtZW50ID0gJCgnIycgKyBoYXNoICsgJywgYVtuYW1lPVwiJyArIGhhc2ggKyAnXCJdJyk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0Ly8gaGFzaCBpcyBub3QgYSB2YWxpZCBqUXVlcnkgaWRlbnRpZmllclxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghZWxlbWVudC5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIHRoaXMgbGluayBkb2VzIG5vdCBwb2ludCB0byBhbiBlbGVtZW50IG9uIHRoaXMgcGFnZVxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnRhaW5lciA9IGVsZW1lbnQuY2xvc2VzdCgnLmpzcFNjcm9sbGFibGUnKTtcblx0XHRcdFx0XHRqc3AgPSBjb250YWluZXIuZGF0YSgnanNwJyk7XG5cblx0XHRcdFx0XHQvLyBqc3AgbWlnaHQgYmUgYW5vdGhlciBqc3AgaW5zdGFuY2UgdGhhbiB0aGUgb25lLCB0aGF0IGJvdW5kIHRoaXMgZXZlbnRcblx0XHRcdFx0XHQvLyByZW1lbWJlcjogdGhpcyBldmVudCBpcyBvbmx5IGJvdW5kIG9uY2UgZm9yIGFsbCBpbnN0YW5jZXMuXG5cdFx0XHRcdFx0anNwLnNjcm9sbFRvRWxlbWVudChlbGVtZW50LCB0cnVlKTtcblxuXHRcdFx0XHRcdGlmIChjb250YWluZXJbMF0uc2Nyb2xsSW50b1ZpZXcpIHtcblx0XHRcdFx0XHRcdC8vIGFsc28gc2Nyb2xsIHRvIHRoZSB0b3Agb2YgdGhlIGNvbnRhaW5lciAoaWYgaXQgaXMgbm90IHZpc2libGUpXG5cdFx0XHRcdFx0XHRzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cdFx0XHRcdFx0XHRlbGVtZW50VG9wID0gZWxlbWVudC5vZmZzZXQoKS50b3A7XG5cdFx0XHRcdFx0XHRpZiAoZWxlbWVudFRvcCA8IHNjcm9sbFRvcCB8fCBlbGVtZW50VG9wID4gc2Nyb2xsVG9wICsgJCh3aW5kb3cpLmhlaWdodCgpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRhaW5lclswXS5zY3JvbGxJbnRvVmlldygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIGpzcCBoYW5kbGVkIHRoaXMgZXZlbnQsIHByZXZlbnQgdGhlIGJyb3dzZXIgZGVmYXVsdCAoc2Nyb2xsaW5nIDpQKVxuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBJbml0IHRvdWNoIG9uIGlQYWQsIGlQaG9uZSwgaVBvZCwgQW5kcm9pZFxuXHRcdFx0ZnVuY3Rpb24gaW5pdFRvdWNoKClcblx0XHRcdHtcblx0XHRcdFx0dmFyIHN0YXJ0WCxcblx0XHRcdFx0XHRzdGFydFksXG5cdFx0XHRcdFx0dG91Y2hTdGFydFgsXG5cdFx0XHRcdFx0dG91Y2hTdGFydFksXG5cdFx0XHRcdFx0bW92ZWQsXG5cdFx0XHRcdFx0bW92aW5nID0gZmFsc2U7XG4gIFxuXHRcdFx0XHRjb250YWluZXIudW5iaW5kKCd0b3VjaHN0YXJ0LmpzcCB0b3VjaG1vdmUuanNwIHRvdWNoZW5kLmpzcCBjbGljay5qc3AtdG91Y2hjbGljaycpLmJpbmQoXG5cdFx0XHRcdFx0J3RvdWNoc3RhcnQuanNwJyxcblx0XHRcdFx0XHRmdW5jdGlvbihlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhciB0b3VjaCA9IGUub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdO1xuXHRcdFx0XHRcdFx0c3RhcnRYID0gY29udGVudFBvc2l0aW9uWCgpO1xuXHRcdFx0XHRcdFx0c3RhcnRZID0gY29udGVudFBvc2l0aW9uWSgpO1xuXHRcdFx0XHRcdFx0dG91Y2hTdGFydFggPSB0b3VjaC5wYWdlWDtcblx0XHRcdFx0XHRcdHRvdWNoU3RhcnRZID0gdG91Y2gucGFnZVk7XG5cdFx0XHRcdFx0XHRtb3ZlZCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0bW92aW5nID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdCkuYmluZChcblx0XHRcdFx0XHQndG91Y2htb3ZlLmpzcCcsXG5cdFx0XHRcdFx0ZnVuY3Rpb24oZXYpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYoIW1vdmluZykge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdHZhciB0b3VjaFBvcyA9IGV2Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSxcblx0XHRcdFx0XHRcdFx0ZFggPSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uLCBkWSA9IHZlcnRpY2FsRHJhZ1Bvc2l0aW9uO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRqc3Auc2Nyb2xsVG8oc3RhcnRYICsgdG91Y2hTdGFydFggLSB0b3VjaFBvcy5wYWdlWCwgc3RhcnRZICsgdG91Y2hTdGFydFkgLSB0b3VjaFBvcy5wYWdlWSk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdG1vdmVkID0gbW92ZWQgfHwgTWF0aC5hYnModG91Y2hTdGFydFggLSB0b3VjaFBvcy5wYWdlWCkgPiA1IHx8IE1hdGguYWJzKHRvdWNoU3RhcnRZIC0gdG91Y2hQb3MucGFnZVkpID4gNTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Ly8gcmV0dXJuIHRydWUgaWYgdGhlcmUgd2FzIG5vIG1vdmVtZW50IHNvIHJlc3Qgb2Ygc2NyZWVuIGNhbiBzY3JvbGxcblx0XHRcdFx0XHRcdHJldHVybiBkWCA9PSBob3Jpem9udGFsRHJhZ1Bvc2l0aW9uICYmIGRZID09IHZlcnRpY2FsRHJhZ1Bvc2l0aW9uO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KS5iaW5kKFxuXHRcdFx0XHRcdCd0b3VjaGVuZC5qc3AnLFxuXHRcdFx0XHRcdGZ1bmN0aW9uKGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bW92aW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQvKmlmKG1vdmVkKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdH0qL1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KS5iaW5kKFxuXHRcdFx0XHRcdCdjbGljay5qc3AtdG91Y2hjbGljaycsXG5cdFx0XHRcdFx0ZnVuY3Rpb24oZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZihtb3ZlZCkge1xuXHRcdFx0XHRcdFx0XHRtb3ZlZCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRmdW5jdGlvbiBkZXN0cm95KCl7XG5cdFx0XHRcdHZhciBjdXJyZW50WSA9IGNvbnRlbnRQb3NpdGlvblkoKSxcblx0XHRcdFx0XHRjdXJyZW50WCA9IGNvbnRlbnRQb3NpdGlvblgoKTtcblx0XHRcdFx0ZWxlbS5yZW1vdmVDbGFzcygnanNwU2Nyb2xsYWJsZScpLnVuYmluZCgnLmpzcCcpO1xuXHRcdFx0XHRlbGVtLnJlcGxhY2VXaXRoKG9yaWdpbmFsRWxlbWVudC5hcHBlbmQocGFuZS5jaGlsZHJlbigpKSk7XG5cdFx0XHRcdG9yaWdpbmFsRWxlbWVudC5zY3JvbGxUb3AoY3VycmVudFkpO1xuXHRcdFx0XHRvcmlnaW5hbEVsZW1lbnQuc2Nyb2xsTGVmdChjdXJyZW50WCk7XG5cblx0XHRcdFx0Ly8gY2xlYXIgcmVpbml0aWFsaXplIHRpbWVyIGlmIGFjdGl2ZVxuXHRcdFx0XHRpZiAocmVpbml0aWFsaXNlSW50ZXJ2YWwpIHtcblx0XHRcdFx0XHRjbGVhckludGVydmFsKHJlaW5pdGlhbGlzZUludGVydmFsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBQdWJsaWMgQVBJXG5cdFx0XHQkLmV4dGVuZChcblx0XHRcdFx0anNwLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gUmVpbml0aWFsaXNlcyB0aGUgc2Nyb2xsIHBhbmUgKGlmIGl0J3MgaW50ZXJuYWwgZGltZW5zaW9ucyBoYXZlIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgdGltZSBpdFxuXHRcdFx0XHRcdC8vIHdhcyBpbml0aWFsaXNlZCkuIFRoZSBzZXR0aW5ncyBvYmplY3Qgd2hpY2ggaXMgcGFzc2VkIGluIHdpbGwgb3ZlcnJpZGUgYW55IHNldHRpbmdzIGZyb20gdGhlXG5cdFx0XHRcdFx0Ly8gcHJldmlvdXMgdGltZSBpdCB3YXMgaW5pdGlhbGlzZWQgLSBpZiB5b3UgZG9uJ3QgcGFzcyBhbnkgc2V0dGluZ3MgdGhlbiB0aGUgb25lcyBmcm9tIHRoZSBwcmV2aW91c1xuXHRcdFx0XHRcdC8vIGluaXRpYWxpc2F0aW9uIHdpbGwgYmUgdXNlZC5cblx0XHRcdFx0XHRyZWluaXRpYWxpc2U6IGZ1bmN0aW9uKHMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cyA9ICQuZXh0ZW5kKHt9LCBzZXR0aW5ncywgcyk7XG5cdFx0XHRcdFx0XHRpbml0aWFsaXNlKHMpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gU2Nyb2xscyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgKGEgalF1ZXJ5IG9iamVjdCwgRE9NIG5vZGUgb3IgalF1ZXJ5IHNlbGVjdG9yIHN0cmluZykgaW50byB2aWV3IHNvXG5cdFx0XHRcdFx0Ly8gdGhhdCBpdCBjYW4gYmUgc2VlbiB3aXRoaW4gdGhlIHZpZXdwb3J0LiBJZiBzdGlja1RvVG9wIGlzIHRydWUgdGhlbiB0aGUgZWxlbWVudCB3aWxsIGFwcGVhciBhdFxuXHRcdFx0XHRcdC8vIHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0LCBpZiBpdCBpcyBmYWxzZSB0aGVuIHRoZSB2aWV3cG9ydCB3aWxsIHNjcm9sbCBhcyBsaXR0bGUgYXMgcG9zc2libGUgdG9cblx0XHRcdFx0XHQvLyBzaG93IHRoZSBlbGVtZW50LiBZb3UgY2FuIGFsc28gc3BlY2lmeSBpZiB5b3Ugd2FudCBhbmltYXRpb24gdG8gb2NjdXIuIElmIHlvdSBkb24ndCBwcm92aWRlIHRoaXNcblx0XHRcdFx0XHQvLyBhcmd1bWVudCB0aGVuIHRoZSBhbmltYXRlU2Nyb2xsIHZhbHVlIGZyb20gdGhlIHNldHRpbmdzIG9iamVjdCBpcyB1c2VkIGluc3RlYWQuXG5cdFx0XHRcdFx0c2Nyb2xsVG9FbGVtZW50OiBmdW5jdGlvbihlbGUsIHN0aWNrVG9Ub3AsIGFuaW1hdGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2Nyb2xsVG9FbGVtZW50KGVsZSwgc3RpY2tUb1RvcCwgYW5pbWF0ZSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvLyBTY3JvbGxzIHRoZSBwYW5lIHNvIHRoYXQgdGhlIHNwZWNpZmllZCBjby1vcmRpbmF0ZXMgd2l0aGluIHRoZSBjb250ZW50IGFyZSBhdCB0aGUgdG9wIGxlZnRcblx0XHRcdFx0XHQvLyBvZiB0aGUgdmlld3BvcnQuIGFuaW1hdGUgaXMgb3B0aW9uYWwgYW5kIGlmIG5vdCBwYXNzZWQgdGhlbiB0aGUgdmFsdWUgb2YgYW5pbWF0ZVNjcm9sbCBmcm9tXG5cdFx0XHRcdFx0Ly8gdGhlIHNldHRpbmdzIG9iamVjdCB0aGlzIGpTY3JvbGxQYW5lIHdhcyBpbml0aWFsaXNlZCB3aXRoIGlzIHVzZWQuXG5cdFx0XHRcdFx0c2Nyb2xsVG86IGZ1bmN0aW9uKGRlc3RYLCBkZXN0WSwgYW5pbWF0ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzY3JvbGxUb1goZGVzdFgsIGFuaW1hdGUpO1xuXHRcdFx0XHRcdFx0c2Nyb2xsVG9ZKGRlc3RZLCBhbmltYXRlKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdC8vIFNjcm9sbHMgdGhlIHBhbmUgc28gdGhhdCB0aGUgc3BlY2lmaWVkIGNvLW9yZGluYXRlIHdpdGhpbiB0aGUgY29udGVudCBpcyBhdCB0aGUgbGVmdCBvZiB0aGVcblx0XHRcdFx0XHQvLyB2aWV3cG9ydC4gYW5pbWF0ZSBpcyBvcHRpb25hbCBhbmQgaWYgbm90IHBhc3NlZCB0aGVuIHRoZSB2YWx1ZSBvZiBhbmltYXRlU2Nyb2xsIGZyb20gdGhlIHNldHRpbmdzXG5cdFx0XHRcdFx0Ly8gb2JqZWN0IHRoaXMgalNjcm9sbFBhbmUgd2FzIGluaXRpYWxpc2VkIHdpdGggaXMgdXNlZC5cblx0XHRcdFx0XHRzY3JvbGxUb1g6IGZ1bmN0aW9uKGRlc3RYLCBhbmltYXRlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNjcm9sbFRvWChkZXN0WCwgYW5pbWF0ZSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvLyBTY3JvbGxzIHRoZSBwYW5lIHNvIHRoYXQgdGhlIHNwZWNpZmllZCBjby1vcmRpbmF0ZSB3aXRoaW4gdGhlIGNvbnRlbnQgaXMgYXQgdGhlIHRvcCBvZiB0aGVcblx0XHRcdFx0XHQvLyB2aWV3cG9ydC4gYW5pbWF0ZSBpcyBvcHRpb25hbCBhbmQgaWYgbm90IHBhc3NlZCB0aGVuIHRoZSB2YWx1ZSBvZiBhbmltYXRlU2Nyb2xsIGZyb20gdGhlIHNldHRpbmdzXG5cdFx0XHRcdFx0Ly8gb2JqZWN0IHRoaXMgalNjcm9sbFBhbmUgd2FzIGluaXRpYWxpc2VkIHdpdGggaXMgdXNlZC5cblx0XHRcdFx0XHRzY3JvbGxUb1k6IGZ1bmN0aW9uKGRlc3RZLCBhbmltYXRlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNjcm9sbFRvWShkZXN0WSwgYW5pbWF0ZSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvLyBTY3JvbGxzIHRoZSBwYW5lIHRvIHRoZSBzcGVjaWZpZWQgcGVyY2VudGFnZSBvZiBpdHMgbWF4aW11bSBob3Jpem9udGFsIHNjcm9sbCBwb3NpdGlvbi4gYW5pbWF0ZVxuXHRcdFx0XHRcdC8vIGlzIG9wdGlvbmFsIGFuZCBpZiBub3QgcGFzc2VkIHRoZW4gdGhlIHZhbHVlIG9mIGFuaW1hdGVTY3JvbGwgZnJvbSB0aGUgc2V0dGluZ3Mgb2JqZWN0IHRoaXNcblx0XHRcdFx0XHQvLyBqU2Nyb2xsUGFuZSB3YXMgaW5pdGlhbGlzZWQgd2l0aCBpcyB1c2VkLlxuXHRcdFx0XHRcdHNjcm9sbFRvUGVyY2VudFg6IGZ1bmN0aW9uKGRlc3RQZXJjZW50WCwgYW5pbWF0ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzY3JvbGxUb1goZGVzdFBlcmNlbnRYICogKGNvbnRlbnRXaWR0aCAtIHBhbmVXaWR0aCksIGFuaW1hdGUpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gU2Nyb2xscyB0aGUgcGFuZSB0byB0aGUgc3BlY2lmaWVkIHBlcmNlbnRhZ2Ugb2YgaXRzIG1heGltdW0gdmVydGljYWwgc2Nyb2xsIHBvc2l0aW9uLiBhbmltYXRlXG5cdFx0XHRcdFx0Ly8gaXMgb3B0aW9uYWwgYW5kIGlmIG5vdCBwYXNzZWQgdGhlbiB0aGUgdmFsdWUgb2YgYW5pbWF0ZVNjcm9sbCBmcm9tIHRoZSBzZXR0aW5ncyBvYmplY3QgdGhpc1xuXHRcdFx0XHRcdC8vIGpTY3JvbGxQYW5lIHdhcyBpbml0aWFsaXNlZCB3aXRoIGlzIHVzZWQuXG5cdFx0XHRcdFx0c2Nyb2xsVG9QZXJjZW50WTogZnVuY3Rpb24oZGVzdFBlcmNlbnRZLCBhbmltYXRlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNjcm9sbFRvWShkZXN0UGVyY2VudFkgKiAoY29udGVudEhlaWdodCAtIHBhbmVIZWlnaHQpLCBhbmltYXRlKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdC8vIFNjcm9sbHMgdGhlIHBhbmUgYnkgdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgcGl4ZWxzLiBhbmltYXRlIGlzIG9wdGlvbmFsIGFuZCBpZiBub3QgcGFzc2VkIHRoZW5cblx0XHRcdFx0XHQvLyB0aGUgdmFsdWUgb2YgYW5pbWF0ZVNjcm9sbCBmcm9tIHRoZSBzZXR0aW5ncyBvYmplY3QgdGhpcyBqU2Nyb2xsUGFuZSB3YXMgaW5pdGlhbGlzZWQgd2l0aCBpcyB1c2VkLlxuXHRcdFx0XHRcdHNjcm9sbEJ5OiBmdW5jdGlvbihkZWx0YVgsIGRlbHRhWSwgYW5pbWF0ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlYKGRlbHRhWCwgYW5pbWF0ZSk7XG5cdFx0XHRcdFx0XHRqc3Auc2Nyb2xsQnlZKGRlbHRhWSwgYW5pbWF0ZSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvLyBTY3JvbGxzIHRoZSBwYW5lIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50IG9mIHBpeGVscy4gYW5pbWF0ZSBpcyBvcHRpb25hbCBhbmQgaWYgbm90IHBhc3NlZCB0aGVuXG5cdFx0XHRcdFx0Ly8gdGhlIHZhbHVlIG9mIGFuaW1hdGVTY3JvbGwgZnJvbSB0aGUgc2V0dGluZ3Mgb2JqZWN0IHRoaXMgalNjcm9sbFBhbmUgd2FzIGluaXRpYWxpc2VkIHdpdGggaXMgdXNlZC5cblx0XHRcdFx0XHRzY3JvbGxCeVg6IGZ1bmN0aW9uKGRlbHRhWCwgYW5pbWF0ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR2YXIgZGVzdFggPSBjb250ZW50UG9zaXRpb25YKCkgKyBNYXRoW2RlbHRhWDwwID8gJ2Zsb29yJyA6ICdjZWlsJ10oZGVsdGFYKSxcblx0XHRcdFx0XHRcdFx0cGVyY2VudFNjcm9sbGVkID0gZGVzdFggLyAoY29udGVudFdpZHRoIC0gcGFuZVdpZHRoKTtcblx0XHRcdFx0XHRcdHBvc2l0aW9uRHJhZ1gocGVyY2VudFNjcm9sbGVkICogZHJhZ01heFgsIGFuaW1hdGUpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gU2Nyb2xscyB0aGUgcGFuZSBieSB0aGUgc3BlY2lmaWVkIGFtb3VudCBvZiBwaXhlbHMuIGFuaW1hdGUgaXMgb3B0aW9uYWwgYW5kIGlmIG5vdCBwYXNzZWQgdGhlblxuXHRcdFx0XHRcdC8vIHRoZSB2YWx1ZSBvZiBhbmltYXRlU2Nyb2xsIGZyb20gdGhlIHNldHRpbmdzIG9iamVjdCB0aGlzIGpTY3JvbGxQYW5lIHdhcyBpbml0aWFsaXNlZCB3aXRoIGlzIHVzZWQuXG5cdFx0XHRcdFx0c2Nyb2xsQnlZOiBmdW5jdGlvbihkZWx0YVksIGFuaW1hdGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dmFyIGRlc3RZID0gY29udGVudFBvc2l0aW9uWSgpICsgTWF0aFtkZWx0YVk8MCA/ICdmbG9vcicgOiAnY2VpbCddKGRlbHRhWSksXG5cdFx0XHRcdFx0XHRcdHBlcmNlbnRTY3JvbGxlZCA9IGRlc3RZIC8gKGNvbnRlbnRIZWlnaHQgLSBwYW5lSGVpZ2h0KTtcblx0XHRcdFx0XHRcdHBvc2l0aW9uRHJhZ1kocGVyY2VudFNjcm9sbGVkICogZHJhZ01heFksIGFuaW1hdGUpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gUG9zaXRpb25zIHRoZSBob3Jpem9udGFsIGRyYWcgYXQgdGhlIHNwZWNpZmllZCB4IHBvc2l0aW9uIChhbmQgdXBkYXRlcyB0aGUgdmlld3BvcnQgdG8gcmVmbGVjdFxuXHRcdFx0XHRcdC8vIHRoaXMpLiBhbmltYXRlIGlzIG9wdGlvbmFsIGFuZCBpZiBub3QgcGFzc2VkIHRoZW4gdGhlIHZhbHVlIG9mIGFuaW1hdGVTY3JvbGwgZnJvbSB0aGUgc2V0dGluZ3Ncblx0XHRcdFx0XHQvLyBvYmplY3QgdGhpcyBqU2Nyb2xsUGFuZSB3YXMgaW5pdGlhbGlzZWQgd2l0aCBpcyB1c2VkLlxuXHRcdFx0XHRcdHBvc2l0aW9uRHJhZ1g6IGZ1bmN0aW9uKHgsIGFuaW1hdGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cG9zaXRpb25EcmFnWCh4LCBhbmltYXRlKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdC8vIFBvc2l0aW9ucyB0aGUgdmVydGljYWwgZHJhZyBhdCB0aGUgc3BlY2lmaWVkIHkgcG9zaXRpb24gKGFuZCB1cGRhdGVzIHRoZSB2aWV3cG9ydCB0byByZWZsZWN0XG5cdFx0XHRcdFx0Ly8gdGhpcykuIGFuaW1hdGUgaXMgb3B0aW9uYWwgYW5kIGlmIG5vdCBwYXNzZWQgdGhlbiB0aGUgdmFsdWUgb2YgYW5pbWF0ZVNjcm9sbCBmcm9tIHRoZSBzZXR0aW5nc1xuXHRcdFx0XHRcdC8vIG9iamVjdCB0aGlzIGpTY3JvbGxQYW5lIHdhcyBpbml0aWFsaXNlZCB3aXRoIGlzIHVzZWQuXG5cdFx0XHRcdFx0cG9zaXRpb25EcmFnWTogZnVuY3Rpb24oeSwgYW5pbWF0ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwb3NpdGlvbkRyYWdZKHksIGFuaW1hdGUpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4galNjcm9sbFBhbmUgaXMgdHJ5aW5nIHRvIGFuaW1hdGUgdG8gYSBuZXcgcG9zaXRpb24uIFlvdSBjYW4gb3ZlcnJpZGVcblx0XHRcdFx0XHQvLyBpdCBpZiB5b3Ugd2FudCB0byBwcm92aWRlIGFkdmFuY2VkIGFuaW1hdGlvbiBmdW5jdGlvbmFsaXR5LiBJdCBpcyBwYXNzZWQgdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XG5cdFx0XHRcdFx0Ly8gICogZWxlICAgICAgICAgIC0gdGhlIGVsZW1lbnQgd2hvc2UgcG9zaXRpb24gaXMgYmVpbmcgYW5pbWF0ZWRcblx0XHRcdFx0XHQvLyAgKiBwcm9wICAgICAgICAgLSB0aGUgcHJvcGVydHkgdGhhdCBpcyBiZWluZyBhbmltYXRlZFxuXHRcdFx0XHRcdC8vICAqIHZhbHVlICAgICAgICAtIHRoZSB2YWx1ZSBpdCdzIGJlaW5nIGFuaW1hdGVkIHRvXG5cdFx0XHRcdFx0Ly8gICogc3RlcENhbGxiYWNrIC0gYSBmdW5jdGlvbiB0aGF0IHlvdSBtdXN0IGV4ZWN1dGUgZWFjaCB0aW1lIHlvdSB1cGRhdGUgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxuXHRcdFx0XHRcdC8vIFlvdSBjYW4gdXNlIHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIChiZWxvdykgYXMgYSBzdGFydGluZyBwb2ludCBmb3IgeW91ciBvd24gaW1wbGVtZW50YXRpb24uXG5cdFx0XHRcdFx0YW5pbWF0ZTogZnVuY3Rpb24oZWxlLCBwcm9wLCB2YWx1ZSwgc3RlcENhbGxiYWNrKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhciBwYXJhbXMgPSB7fTtcblx0XHRcdFx0XHRcdHBhcmFtc1twcm9wXSA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0ZWxlLmFuaW1hdGUoXG5cdFx0XHRcdFx0XHRcdHBhcmFtcyxcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdCdkdXJhdGlvbidcdDogc2V0dGluZ3MuYW5pbWF0ZUR1cmF0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdCdlYXNpbmcnXHQ6IHNldHRpbmdzLmFuaW1hdGVFYXNlLFxuXHRcdFx0XHRcdFx0XHRcdCdxdWV1ZSdcdFx0OiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHQnc3RlcCdcdFx0OiBzdGVwQ2FsbGJhY2tcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdC8vIFJldHVybnMgdGhlIGN1cnJlbnQgeCBwb3NpdGlvbiBvZiB0aGUgdmlld3BvcnQgd2l0aCByZWdhcmRzIHRvIHRoZSBjb250ZW50IHBhbmUuXG5cdFx0XHRcdFx0Z2V0Q29udGVudFBvc2l0aW9uWDogZnVuY3Rpb24oKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBjb250ZW50UG9zaXRpb25YKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvLyBSZXR1cm5zIHRoZSBjdXJyZW50IHkgcG9zaXRpb24gb2YgdGhlIHZpZXdwb3J0IHdpdGggcmVnYXJkcyB0byB0aGUgY29udGVudCBwYW5lLlxuXHRcdFx0XHRcdGdldENvbnRlbnRQb3NpdGlvblk6IGZ1bmN0aW9uKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29udGVudFBvc2l0aW9uWSgpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIGNvbnRlbnQgd2l0aGluIHRoZSBzY3JvbGwgcGFuZS5cblx0XHRcdFx0XHRnZXRDb250ZW50V2lkdGg6IGZ1bmN0aW9uKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29udGVudFdpZHRoO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSBjb250ZW50IHdpdGhpbiB0aGUgc2Nyb2xsIHBhbmUuXG5cdFx0XHRcdFx0Z2V0Q29udGVudEhlaWdodDogZnVuY3Rpb24oKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBjb250ZW50SGVpZ2h0O1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gUmV0dXJucyB0aGUgaG9yaXpvbnRhbCBwb3NpdGlvbiBvZiB0aGUgdmlld3BvcnQgd2l0aGluIHRoZSBwYW5lIGNvbnRlbnQuXG5cdFx0XHRcdFx0Z2V0UGVyY2VudFNjcm9sbGVkWDogZnVuY3Rpb24oKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBjb250ZW50UG9zaXRpb25YKCkgLyAoY29udGVudFdpZHRoIC0gcGFuZVdpZHRoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdC8vIFJldHVybnMgdGhlIHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRoZSB2aWV3cG9ydCB3aXRoaW4gdGhlIHBhbmUgY29udGVudC5cblx0XHRcdFx0XHRnZXRQZXJjZW50U2Nyb2xsZWRZOiBmdW5jdGlvbigpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRlbnRQb3NpdGlvblkoKSAvIChjb250ZW50SGVpZ2h0IC0gcGFuZUhlaWdodCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvLyBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoaXMgc2Nyb2xscGFuZSBoYXMgYSBob3Jpem9udGFsIHNjcm9sbGJhci5cblx0XHRcdFx0XHRnZXRJc1Njcm9sbGFibGVIOiBmdW5jdGlvbigpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGlzU2Nyb2xsYWJsZUg7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvLyBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoaXMgc2Nyb2xscGFuZSBoYXMgYSB2ZXJ0aWNhbCBzY3JvbGxiYXIuXG5cdFx0XHRcdFx0Z2V0SXNTY3JvbGxhYmxlVjogZnVuY3Rpb24oKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBpc1Njcm9sbGFibGVWO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUgY29udGVudCBwYW5lLiBJdCBpcyBpbXBvcnRhbnQgdGhhdCB5b3UgdXNlIHRoaXMgbWV0aG9kIGlmIHlvdSB3YW50IHRvXG5cdFx0XHRcdFx0Ly8gZWRpdCB0aGUgY29udGVudCBvZiB5b3VyIGpTY3JvbGxQYW5lIGFzIGlmIHlvdSBhY2Nlc3MgdGhlIGVsZW1lbnQgZGlyZWN0bHkgdGhlbiB5b3UgbWF5IGhhdmUgc29tZVxuXHRcdFx0XHRcdC8vIHByb2JsZW1zIChhcyB5b3VyIG9yaWdpbmFsIGVsZW1lbnQgaGFzIGhhZCBhZGRpdGlvbmFsIGVsZW1lbnRzIGZvciB0aGUgc2Nyb2xsYmFycyBldGMgYWRkZWQgaW50b1xuXHRcdFx0XHRcdC8vIGl0KS5cblx0XHRcdFx0XHRnZXRDb250ZW50UGFuZTogZnVuY3Rpb24oKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBwYW5lO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Ly8gU2Nyb2xscyB0aGlzIGpTY3JvbGxQYW5lIGRvd24gYXMgZmFyIGFzIGl0IGNhbiBjdXJyZW50bHkgc2Nyb2xsLiBJZiBhbmltYXRlIGlzbid0IHBhc3NlZCB0aGVuIHRoZVxuXHRcdFx0XHRcdC8vIGFuaW1hdGVTY3JvbGwgdmFsdWUgZnJvbSBzZXR0aW5ncyBpcyB1c2VkIGluc3RlYWQuXG5cdFx0XHRcdFx0c2Nyb2xsVG9Cb3R0b206IGZ1bmN0aW9uKGFuaW1hdGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cG9zaXRpb25EcmFnWShkcmFnTWF4WSwgYW5pbWF0ZSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvLyBIaWphY2tzIHRoZSBsaW5rcyBvbiB0aGUgcGFnZSB3aGljaCBsaW5rIHRvIGNvbnRlbnQgaW5zaWRlIHRoZSBzY3JvbGxwYW5lLiBJZiB5b3UgaGF2ZSBjaGFuZ2VkXG5cdFx0XHRcdFx0Ly8gdGhlIGNvbnRlbnQgb2YgeW91ciBwYWdlIChlLmcuIHZpYSBBSkFYKSBhbmQgd2FudCB0byBtYWtlIHN1cmUgYW55IG5ldyBhbmNob3IgbGlua3MgdG8gdGhlXG5cdFx0XHRcdFx0Ly8gY29udGVudHMgb2YgeW91ciBzY3JvbGwgcGFuZSB3aWxsIHdvcmsgdGhlbiBjYWxsIHRoaXMgZnVuY3Rpb24uXG5cdFx0XHRcdFx0aGlqYWNrSW50ZXJuYWxMaW5rczogJC5ub29wLFxuXHRcdFx0XHRcdC8vIFJlbW92ZXMgdGhlIGpTY3JvbGxQYW5lIGFuZCByZXR1cm5zIHRoZSBwYWdlIHRvIHRoZSBzdGF0ZSBpdCB3YXMgaW4gYmVmb3JlIGpTY3JvbGxQYW5lIHdhc1xuXHRcdFx0XHRcdC8vIGluaXRpYWxpc2VkLlxuXHRcdFx0XHRcdGRlc3Ryb3k6IGZ1bmN0aW9uKClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRlc3Ryb3koKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0XHRcblx0XHRcdGluaXRpYWxpc2Uocyk7XG5cdFx0fVxuXG5cdFx0Ly8gUGx1Z2luaWZ5aW5nIGNvZGUuLi5cblx0XHRzZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCAkLmZuLmpTY3JvbGxQYW5lLmRlZmF1bHRzLCBzZXR0aW5ncyk7XG5cdFx0XG5cdFx0Ly8gQXBwbHkgZGVmYXVsdCBzcGVlZFxuXHRcdCQuZWFjaChbJ21vdXNlV2hlZWxTcGVlZCcsICdhcnJvd0J1dHRvblNwZWVkJywgJ3RyYWNrQ2xpY2tTcGVlZCcsICdrZXlib2FyZFNwZWVkJ10sIGZ1bmN0aW9uKCkge1xuXHRcdFx0c2V0dGluZ3NbdGhpc10gPSBzZXR0aW5nc1t0aGlzXSB8fCBzZXR0aW5ncy5zcGVlZDtcblx0XHR9KTtcblxuXHRcdHJldHVybiB0aGlzLmVhY2goXG5cdFx0XHRmdW5jdGlvbigpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBlbGVtID0gJCh0aGlzKSwganNwQXBpID0gZWxlbS5kYXRhKCdqc3AnKTtcblx0XHRcdFx0aWYgKGpzcEFwaSkge1xuXHRcdFx0XHRcdGpzcEFwaS5yZWluaXRpYWxpc2Uoc2V0dGluZ3MpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoXCJzY3JpcHRcIixlbGVtKS5maWx0ZXIoJ1t0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCJdLDpub3QoW3R5cGVdKScpLnJlbW92ZSgpO1xuXHRcdFx0XHRcdGpzcEFwaSA9IG5ldyBKU2Nyb2xsUGFuZShlbGVtLCBzZXR0aW5ncyk7XG5cdFx0XHRcdFx0ZWxlbS5kYXRhKCdqc3AnLCBqc3BBcGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0KTtcblx0fTtcblxuXHQkLmZuLmpTY3JvbGxQYW5lLmRlZmF1bHRzID0ge1xuXHRcdHNob3dBcnJvd3NcdFx0XHRcdFx0OiBmYWxzZSxcblx0XHRtYWludGFpblBvc2l0aW9uXHRcdFx0OiB0cnVlLFxuXHRcdHN0aWNrVG9Cb3R0b21cdFx0XHRcdDogZmFsc2UsXG5cdFx0c3RpY2tUb1JpZ2h0XHRcdFx0XHQ6IGZhbHNlLFxuXHRcdGNsaWNrT25UcmFja1x0XHRcdFx0OiB0cnVlLFxuXHRcdGF1dG9SZWluaXRpYWxpc2VcdFx0XHQ6IGZhbHNlLFxuXHRcdGF1dG9SZWluaXRpYWxpc2VEZWxheVx0XHQ6IDUwMCxcblx0XHR2ZXJ0aWNhbERyYWdNaW5IZWlnaHRcdFx0OiAwLFxuXHRcdHZlcnRpY2FsRHJhZ01heEhlaWdodFx0XHQ6IDk5OTk5LFxuXHRcdGhvcml6b250YWxEcmFnTWluV2lkdGhcdFx0OiAwLFxuXHRcdGhvcml6b250YWxEcmFnTWF4V2lkdGhcdFx0OiA5OTk5OSxcblx0XHRjb250ZW50V2lkdGhcdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdGFuaW1hdGVTY3JvbGxcdFx0XHRcdDogZmFsc2UsXG5cdFx0YW5pbWF0ZUR1cmF0aW9uXHRcdFx0XHQ6IDMwMCxcblx0XHRhbmltYXRlRWFzZVx0XHRcdFx0XHQ6ICdsaW5lYXInLFxuXHRcdGhpamFja0ludGVybmFsTGlua3NcdFx0XHQ6IGZhbHNlLFxuXHRcdHZlcnRpY2FsR3V0dGVyXHRcdFx0XHQ6IDQsXG5cdFx0aG9yaXpvbnRhbEd1dHRlclx0XHRcdDogNCxcblx0XHRtb3VzZVdoZWVsU3BlZWRcdFx0XHRcdDogMCxcblx0XHRhcnJvd0J1dHRvblNwZWVkXHRcdFx0OiAwLFxuXHRcdGFycm93UmVwZWF0RnJlcVx0XHRcdFx0OiA1MCxcblx0XHRhcnJvd1Njcm9sbE9uSG92ZXJcdFx0XHQ6IGZhbHNlLFxuXHRcdHRyYWNrQ2xpY2tTcGVlZFx0XHRcdFx0OiAwLFxuXHRcdHRyYWNrQ2xpY2tSZXBlYXRGcmVxXHRcdDogNzAsXG5cdFx0dmVydGljYWxBcnJvd1Bvc2l0aW9uc1x0XHQ6ICdzcGxpdCcsXG5cdFx0aG9yaXpvbnRhbEFycm93UG9zaXRpb25zXHQ6ICdzcGxpdCcsXG5cdFx0ZW5hYmxlS2V5Ym9hcmROYXZpZ2F0aW9uXHQ6IHRydWUsXG5cdFx0aGlkZUZvY3VzXHRcdFx0XHRcdDogZmFsc2UsXG5cdFx0a2V5Ym9hcmRTcGVlZFx0XHRcdFx0OiAwLFxuXHRcdGluaXRpYWxEZWxheSAgICAgICAgICAgICAgICA6IDMwMCwgICAgICAgIC8vIERlbGF5IGJlZm9yZSBzdGFydGluZyByZXBlYXRpbmdcblx0XHRzcGVlZFx0XHRcdFx0XHRcdDogMzAsXHRcdC8vIERlZmF1bHQgc3BlZWQgd2hlbiBvdGhlcnMgZmFsc2V5XG5cdFx0c2Nyb2xsUGFnZVBlcmNlbnRcdFx0XHQ6IC44XHRcdC8vIFBlcmNlbnQgb2YgdmlzaWJsZSBhcmVhIHNjcm9sbGVkIHdoZW4gcGFnZVVwL0Rvd24gb3IgdHJhY2sgYXJlYSBwcmVzc2VkXG5cdH07XG5cbn0pKGpRdWVyeSx0aGlzKTtcblxuIiwiLyoqXG4gKiBAY2xhc3NEZXNjcmlwdGlvblx0Q3VzdG9tIHNlbGVjdGJveCB3aXRoIHRoZSBvcHRpb24gdG8gdXNlIGpTY3JvbGxQYW5lXG4gKlx0XHRcdFx0XHRcdGZvciBhIGN1c3RvbSBzY3JvbGxiYXIuIEhpZGVzIHRoZSBvcmlnaW5hbCBzZWxlY3Rib3ggb2ZmIFxuICpcdFx0XHRcdFx0XHRzY3JlZW4gc28gdGhhdCBpdCB3aWxsIHN0aWxsIGdldCBwaWNrZWQgdXAgYXMgYSBmb3JtIGVsZW1lbnQuXG4gKlxuICogQHZlcnNpb25cdFx0XHRcdDEuMS4wXG4gKlxuICogQGF1dGhvclx0XHRcdFx0Um9iIExhUGxhY2EgLSByb2IubGFwbGFjYUBnbWFpbC5jb21cbiAqIEBkYXRlXHRcdFx0XHQwNC8wNS8yMDEwXG4gKiBAbGFzdFVwZGF0ZVx0XHRcdDAzLzA5LzIwMTQgXG4gKiBAZGVwZW5kZW5jeVx0XHRcdGpTY3JvbGxQYW5lLmpzXHRcdFx0b3B0aW9uYWxcbiAqXHRcdFx0XHRcdFx0anF1ZXJ5Lm1vdXNld2hlZWwuanNcdG9wdGlvbmFsXG4gKiBcbiAqIEBwYXJhbSB7RE9NRWxlbWVudH1cdG9wdGlvbnMuc2VsZWN0Ym94XHRcdFx0dGhlIHNlbGVjdGJveCB0aGF0IGlzIGJlaW5nIGN1c3RvbWl6ZWQsIFJFUVVJUkVEIChkZWZhdWx0IHVuZGVmaW5lZClcbiAqIEBwYXJhbSB7Qm9vbGVhbn1cdFx0b3B0aW9ucy5jdXN0b21TY3JvbGxiYXJcdFx0d2hldGhlciBvciBub3QgdG8gdXNlIGpTY3JvbGxQYW5lIHRvIHJlc3R5bGUgc3lzdGVtIHNjcm9sbGJhciAoZGVmYXVsdCBmYWxzZSlcbiAqIEBwYXJhbSB7TnVtYmVyfVx0XHRvcHRpb25zLnpJbmRleFx0XHRcdFx0VGhlIGRlZmF1bHQgei1pbmRleCBvZiB0aGUgc2VsZWN0Ym94LiAoZGVmYXVsdCAxMDApXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVx0b3B0aW9ucy5jaGFuZ2VDYWxsYmFja1x0XHRGdW5jdGlvbiB0aGF0IGdldHMgZXhlY3V0ZWQgb24gY2hhbmdlIG9mIHRoZSBzZWxlY3Rib3ggKGRlZmF1bHQgZW1wdHkgZnVuY3Rpb24pXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVx0b3B0aW9ucy5tYW5hZ2VyXHRcdFx0XHRPcHRpb25hbCByZWZlcmVuY2UgdG8gYSBjbGFzcyB0aGF0IG1hbmFnZXMgYWxsIGluc3RhbmNlcyBvZiB0aGUgc2VsZWN0Ym94XG4gKiBAcGFyYW0ge09iamVjdH1cdFx0b3B0aW9ucy5zY3JvbGxPcHRpb25zXHRcdGpTY3JvbGxQYW5lIG9wdGlvbnMsIHJlZmVyIHRvIGpzY3JvbGxwYW5lIGRvY3VtZW50YXRpb24gZm9yIHBvc3NpYmxlIG9wdGlvbnNcbiAqXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRodHRwOi8vd3d3LmtlbHZpbmx1Y2suY29tL2Fzc2V0cy9qcXVlcnkvalNjcm9sbFBhbmUvc2NyaXB0cy9qU2Nyb2xsUGFuZS5qc1xuICovXG4oZnVuY3Rpb24oJCl7XG5cdHdpbmRvdy5TZWxlY3RCb3hNYW5hZ2VyID0gZnVuY3Rpb24ob3B0aW9ucyl7XG5cdFx0dmFyIHNicyA9IFtdLFxuXHRcdFx0c2VsZiA9IHRoaXM7XG5cblx0XHQkKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbihlKSB7XG5cdFx0XHRpZigkKGUudGFyZ2V0KS5wYXJlbnRzKFwiLmN1c3RvbVNlbGVjdFwiKS5zaXplKCkgPT09IDApIHtcblx0XHRcdFx0c2VsZi5jbG9zZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hZGQgPSBmdW5jdGlvbihzYikge1xuXHRcdFx0c2JzLnB1c2goc2IpO1xuXHRcdH07XG5cblx0XHR0aGlzLmNsb3NlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkKHNicykuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0fTtcblxuXHR2YXIgc2JfbWFuYWdlciA9IG5ldyBTZWxlY3RCb3hNYW5hZ2VyKCk7XG5cblx0d2luZG93LlNlbGVjdEJveCA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuXHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRjZmcgPSAkLmV4dGVuZCh0cnVlLCB7XG5cdFx0XHRtYW5hZ2VyOiBzYl9tYW5hZ2VyLFxuXHRcdFx0Y3VzdG9tU2Nyb2xsYmFyOiB0cnVlLFxuXHRcdFx0ekluZGV4OiAxMDAsXG5cdFx0XHRjaGFuZ2VDYWxsYmFjazogZnVuY3Rpb24odmFsKSB7IH0sXG5cdFx0XHR0cnVuY2F0ZTogZnVuY3Rpb24oc3RyKSB7cmV0dXJuIHN0cjt9LFxuXHRcdFx0c2Nyb2xsT3B0aW9uczoge31cblx0XHR9LCBvcHRpb25zKTtcblxuXHRcdHZhciAkY3VzdG9tU2VsZWN0LCAkc2VsZWN0ZWRWYWx1ZSwgJHNlbGVjdFZhbHVlV3JhcCwgJHNlbGVjdExpc3QsICRkbCwgJG9wdGlvbnMsXG5cdFx0XHRGT0NVU0VEX0NMQVNTID0gXCJmb2N1c2VkXCIsXG5cdFx0XHRTRUxFQ1RFRF9DTEFTUyA9IFwic2VsZWN0ZWRcIixcblx0XHRcdFNFTEVDVF9PUEVOX0NMQVNTID0gXCJzZWxlY3Qtb3BlblwiLFxuXHRcdFx0RElTQUJMRURfQ0xBU1MgPSBcImRpc2FibGVkXCIsXG5cdFx0XHRIT1ZFUkVEX0NMQVNTID0gXCJob3ZlcmVkXCIsXG5cdFx0XHRfdXNlRGVmYXVsdEJlaGF2aW9yID0gZmFsc2UsXG5cdFx0XHRfaXNPcGVuID0gZmFsc2UsXG5cdFx0XHRfaXNFbmFibGVkID0gdHJ1ZSxcblx0XHRcdF9pc0ZvY3VzZWQgPSBmYWxzZSxcblx0XHRcdF9zZWxlY3RlZFZhbHVlID0gXCJcIjtcblxuXHRcdC8qKlxuXHRcdCAqIEBjb25zdHJ1Y3RvclxuXHRcdCAqL1xuXG5cdFx0ZnVuY3Rpb24gaW5pdCgpIHtcblx0XHRcdC8vIFRPRE86IGRvbid0IHVzZSB1c2VyQWdlbnQgbWF0Y2hpbmcgdG8gZGV0ZWN0IGRlZmF1bHRpbmcgdG8gZGV2aWNlIHNwZWNpZmljIGJlaGF2aW9yXG5cdFx0XHRfdXNlRGVmYXVsdEJlaGF2aW9yID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVBhZHxpUGhvbmV8QW5kcm9pZHxJRU1vYmlsZXxCbGFja0JlcnJ5L2kpID8gdHJ1ZSA6IGZhbHNlO1xuXG5cdFx0XHRpZiggX3VzZURlZmF1bHRCZWhhdmlvciApIHtcblx0XHRcdFx0Y2ZnLnNlbGVjdGJveC5hZGRDbGFzcyhcInVzZS1kZWZhdWx0XCIpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc2VsZWN0SWQgPSBcIlwiLFxuXHRcdFx0XHRzZWxlY3RlZENsYXNzID0gY2ZnLnNlbGVjdGJveC5hdHRyKFwiY2xhc3NcIik7XG5cdFx0XHRcdFxuXHRcdFx0aWYodHlwZW9mIGNmZy5zZWxlY3Rib3guYXR0cihcImlkXCIpICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdHNlbGVjdElkID0gJ2lkPVwic2VsZWN0LScrY2ZnLnNlbGVjdGJveC5hdHRyKFwiaWRcIikrJ1wiJztcblx0XHRcdH1cblxuXHRcdFx0Y2ZnLnNlbGVjdGJveC53cmFwKCc8ZGl2IGNsYXNzPVwiY3VzdG9tU2VsZWN0ICcrc2VsZWN0ZWRDbGFzcysnXCIgJytzZWxlY3RJZCsnIC8+Jyk7XG5cblx0XHRcdCRjdXN0b21TZWxlY3QgPSBjZmcuc2VsZWN0Ym94LnBhcmVudHMoXCIuY3VzdG9tU2VsZWN0XCIpO1xuXHRcdFx0JG9wdGlvbnMgPSBjZmcuc2VsZWN0Ym94LmZpbmQoXCJvcHRpb25cIik7XG5cblx0XHRcdHZhciBzZWxlY3RMaXN0SFRNTCA9IFsnPGRpdiBjbGFzcz1cInNlbGVjdExpc3RcIj48ZGl2IGNsYXNzPVwic2VsZWN0TGlzdE91dGVyV3JhcFwiPjxkaXYgY2xhc3M9XCJzZWxlY3RMaXN0SW5uZXJXcmFwXCI+PGRpdiBjbGFzcz1cInNlbGVjdExpc3RUb3BcIj48L2Rpdj48ZGw+J107XG5cdFx0XHRzZWxlY3RMaXN0SFRNTC5wdXNoKF9yZW5kZXJPcHRpb25zKCkpO1xuXHRcdFx0c2VsZWN0TGlzdEhUTUwucHVzaCgnPC9kbD48ZGl2IGNsYXNzPVwic2VsZWN0TGlzdEJvdHRvbVwiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PicpO1xuXG5cdFx0XHQkY3VzdG9tU2VsZWN0LmFwcGVuZCgnPGRpdiBjbGFzcz1cInNlbGVjdFZhbHVlV3JhcFwiPjxkaXYgY2xhc3M9XCJzZWxlY3RlZFZhbHVlXCI+Jytfc2VsZWN0ZWRWYWx1ZSsnPC9kaXY+IDxzcGFuIGNsYXNzPVwiY2FyZXRcIj48L3NwYW4+IDwvZGl2PicgKyBzZWxlY3RMaXN0SFRNTC5qb2luKFwiXCIpKTtcblxuXHRcdFx0JGRsID0gJGN1c3RvbVNlbGVjdC5maW5kKFwiZGxcIik7XG5cdFx0XHQkc2VsZWN0ZWRWYWx1ZSA9ICRjdXN0b21TZWxlY3QuZmluZChcIi5zZWxlY3RlZFZhbHVlXCIpO1xuXHRcdFx0JHNlbGVjdFZhbHVlV3JhcCA9ICRjdXN0b21TZWxlY3QuZmluZChcIi5zZWxlY3RWYWx1ZVdyYXBcIik7XG5cdFx0XHQkc2VsZWN0TGlzdCA9ICRjdXN0b21TZWxlY3QuZmluZChcIi5zZWxlY3RMaXN0XCIpO1xuXG5cdFx0XHQkY3VzdG9tU2VsZWN0LndpZHRoKGNmZy53aWR0aCk7XG5cdFx0XHQkZGwud2lkdGgoY2ZnLndpZHRoIC0gMik7XG5cblx0XHRcdF9iaW5kRXZlbnRzKCk7XG5cblx0XHRcdHNiX21hbmFnZXIuYWRkKHNlbGYpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cblx0XHRmdW5jdGlvbiBfYmluZEV2ZW50cygpIHtcblx0XHRcdCRzZWxlY3RWYWx1ZVdyYXAuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmKF9pc09wZW4pIHtcblx0XHRcdFx0XHRjZmcuc2VsZWN0Ym94LmZvY3VzKCk7XG5cdFx0XHRcdFx0c2VsZi5jbG9zZSgpO1xuXHRcdFx0XHR9IGVsc2UgaWYoX2lzRW5hYmxlZCkge1xuXHRcdFx0XHRcdGlmKCBfdXNlRGVmYXVsdEJlaGF2aW9yICkge1xuXHRcdFx0XHRcdFx0Y2ZnLnNlbGVjdGJveC5mb2N1cygpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzZWxmLm9wZW4oKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBkZWxlZ2F0ZWQgZXZlbnRzXG5cdFx0XHQkZGwuY2xpY2soZnVuY3Rpb24oZSkge1xuXHRcdFx0XHR2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xuXG5cdFx0XHRcdGlmKCR0YXJnZXQuaXMoXCJkZFwiKSB8fCAkdGFyZ2V0LnBhcmVudHMoXCJkZFwiKSkge1xuXHRcdFx0XHRcdGlmKGUudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPSBcImRkXCIpIHtcblx0XHRcdFx0XHRcdCR0YXJnZXQgPSAkdGFyZ2V0LnBhcmVudHMoXCJkZFwiKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZighJHRhcmdldC5oYXNDbGFzcyhESVNBQkxFRF9DTEFTUykgJiYgJHRhcmdldC5nZXQoMCkpIHtcblx0XHRcdFx0XHRcdHNlbGYuanVtcFRvSW5kZXgoJHRhcmdldC5nZXQoMCkuY2xhc3NOYW1lLnNwbGl0KFwiIFwiKVswXS5zcGxpdChcIi1cIilbMV0pO1xuXHRcdFx0XHRcdFx0c2VsZi5jbG9zZSgpO1xuXG5cdFx0XHRcdFx0XHRpZiggISBfdXNlRGVmYXVsdEJlaGF2aW9yICkge1xuXHRcdFx0XHRcdFx0XHRjZmcuc2VsZWN0Ym94LmZvY3VzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Y2ZnLnNlbGVjdGJveC5mb2N1cyhmdW5jdGlvbihlKSB7XG5cdFx0XHRcdF9pc0ZvY3VzZWQgPSB0cnVlO1xuXHRcdFx0XHQkY3VzdG9tU2VsZWN0LmFkZENsYXNzKEZPQ1VTRURfQ0xBU1MpO1xuXHRcdFx0fSkuYmx1cihmdW5jdGlvbihlKXtcblx0XHRcdFx0X2lzRm9jdXNlZCA9IGZhbHNlO1xuXHRcdFx0XHQkY3VzdG9tU2VsZWN0LnJlbW92ZUNsYXNzKEZPQ1VTRURfQ0xBU1MpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmKCBfdXNlRGVmYXVsdEJlaGF2aW9yICkge1xuXHRcdFx0XHRjZmcuc2VsZWN0Ym94LmNoYW5nZShmdW5jdGlvbihlKSB7XG5cdFx0XHRcdFx0X3VwZGF0ZVZhbHVlKCAkKHRoaXMpLmZpbmQoXCJvcHRpb246c2VsZWN0ZWRcIikuaHRtbCgpICk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRjZmcuc2VsZWN0Ym94LmtleXVwKGZ1bmN0aW9uKGUpe1xuXHRcdFx0XHRzZWxmLmNsb3NlKCk7XG5cdFx0XHRcdCRvcHRpb25zLmVhY2goZnVuY3Rpb24oaSwgaXRtKXtcdFx0XG5cdFx0XHRcdFx0aWYoaXRtLnNlbGVjdGVkKSB7XG5cdFx0XHRcdFx0XHRzZWxmLmp1bXBUb0luZGV4KGkpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0X2JpbmRIb3ZlcigpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cblx0XHRmdW5jdGlvbiBfYmluZEhvdmVyKCkge1xuXHRcdFx0dmFyICRkZHMgPSAkKFwiLmN1c3RvbVNlbGVjdCBkZFwiKTtcblx0XHRcdCRkZHMub2ZmKFwibW91c2VvdmVyXCIpO1xuXHRcdFx0JGRkcy5vZmYoXCJtb3VzZW91dFwiKTtcblxuXHRcdFx0JGRkcy5vbihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XG5cdFx0XHRcdGlmKGUudGFyZ2V0LnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPSBcImRkXCIpIHtcblx0XHRcdFx0XHQkdGFyZ2V0ID0gJHRhcmdldC5wYXJlbnRzKFwiZGRcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0JHRhcmdldC5hZGRDbGFzcyhIT1ZFUkVEX0NMQVNTKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkZGRzLm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHR2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xuXHRcdFx0XHRpZihlLnRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT0gXCJkZFwiKSB7XG5cdFx0XHRcdFx0JHRhcmdldCA9ICR0YXJnZXQucGFyZW50cyhcImRkXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCR0YXJnZXQucmVtb3ZlQ2xhc3MoSE9WRVJFRF9DTEFTUyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdmFsXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblxuXHRcdGZ1bmN0aW9uIF91cGRhdGVWYWx1ZSh2YWwpIHtcblx0XHRcdGlmKCRzZWxlY3RlZFZhbHVlLmh0bWwoKSAhPSB2YWwpIHtcblx0XHRcdFx0JHNlbGVjdGVkVmFsdWUuaHRtbChfdHJ1bmNhdGUodmFsKSk7XG5cdFx0XHRcdGNmZy5jaGFuZ2VDYWxsYmFjayhjZmcuc2VsZWN0Ym94LnZhbCgpKTtcblx0XHRcdFx0aWYoICFfdXNlRGVmYXVsdEJlaGF2aW9yICkge1xuXHRcdFx0XHRcdGNmZy5zZWxlY3Rib3gudHJpZ2dlcihcImNoYW5nZVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKiBcblx0XHQgKiBAcmV0dXJucyB7U3RyaW5nfSBIVE1MIGdlbmVyYXRlZCBhZnRlciBwcm9jZXNzaW5nIG9wdGlvbnNcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXG5cdFx0ZnVuY3Rpb24gX3JlbmRlck9wdGlvbnMoKSB7XG5cdFx0XHR2YXIgb3B0aW9uSFRNTCA9IFtdO1xuXG5cdFx0XHQkb3B0aW9ucy5lYWNoKGZ1bmN0aW9uKGksIGl0bSkge1xuXHRcdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHRcdFx0XHRcdG9wdGdyb3VwID0gJHRoaXMucGFyZW50cygnb3B0Z3JvdXAnKSxcblx0XHRcdFx0XHRhZGRsT3B0Q2xhc3NlcyA9IFwiXCIsXG5cdFx0XHRcdFx0aWNvbk1hcmt1cCA9IFwiXCI7XG5cblx0XHRcdFx0Ly8gcmVuZGVyIG9wdGdyb3VwcyBpZiBwcmVzZW50IGluIG9yaWdpbmFsIHNlbGVjdFxuXHRcdFx0XHRpZiAob3B0Z3JvdXAubGVuZ3RoID4gMCAmJiAkdGhpcy5wcmV2KCkubGVuZ3RoID09PSAwKXtcblx0XHRcdFx0XHRvcHRpb25IVE1MLnB1c2goJzxkdD4nK29wdGdyb3VwLmF0dHIoJ2xhYmVsJykrJzwvZHQ+Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBpZiBvcHRpb24gaGFzIGEgY2xhc3NuYW1lIGFkZCB0aGF0IHRvIGN1c3RvbSBzZWxlY3QgYXMgd2VsbFxuXHRcdFx0XHRpZihpdG0uY2xhc3NOYW1lICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0JChpdG0uY2xhc3NOYW1lLnNwbGl0KFwiIFwiKSkuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGljb25NYXJrdXAgKz0gJzxzcGFuIGNsYXNzPVwiJyArIHRoaXMgKyAnXCI+PC9zcGFuPic7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBhZGQgc2VsZWN0ZWQgY2xhc3MgdG8gd2hhdGV2ZXIgb3B0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmVcblx0XHRcdFx0aWYoaXRtLnNlbGVjdGVkICYmICFpdG0uZGlzYWJsZWQpIHtcblx0XHRcdFx0XHRfc2VsZWN0ZWRWYWx1ZSA9IGljb25NYXJrdXAgKyBfdHJ1bmNhdGUoJChpdG0pLmh0bWwoKSk7XG5cdFx0XHRcdFx0YWRkbE9wdENsYXNzZXMgPSBcIiBcIiArIFNFTEVDVEVEX0NMQVNTO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ2hlY2sgZm9yIGRpc2FibGVkIG9wdGlvbnNcblx0XHRcdFx0aWYoIGl0bS5kaXNhYmxlZCApIHtcblx0XHRcdFx0XHRhZGRsT3B0Q2xhc3NlcyArPSBcIiBcIiArIERJU0FCTEVEX0NMQVNTO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0b3B0aW9uSFRNTC5wdXNoKCc8ZGQgY2xhc3M9XCJpdG0tJytpKycgJyArIGFkZGxPcHRDbGFzc2VzICsgJ1wiPicgKyBpY29uTWFya3VwICsgaXRtLmlubmVySFRNTCArICc8L2RkPicpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmKCRzZWxlY3RlZFZhbHVlICYmICRzZWxlY3RlZFZhbHVlLmdldCgwKSAhPT0gbnVsbCkge1xuXHRcdFx0XHQkc2VsZWN0ZWRWYWx1ZS5odG1sKF9zZWxlY3RlZFZhbHVlKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG9wdGlvbkhUTUwuam9pbihcIlwiKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXG5cdFx0ZnVuY3Rpb24gX3NldHVwU2Nyb2xsYmFyKCkge1xuXHRcdFx0JGRsLmNzcyhcImhlaWdodFwiLFwiYXV0b1wiKTtcblx0XHRcdGlmKGNmZy5oZWlnaHQgJiYgJGRsLmhlaWdodCgpID4gY2ZnLmhlaWdodCkge1xuXHRcdFx0XHQkZGwuY3NzKFwiaGVpZ2h0XCIsIGNmZy5oZWlnaHQpO1xuXHRcdFx0XHRpZihjZmcuY3VzdG9tU2Nyb2xsYmFyKSB7XG5cdFx0XHRcdFx0c2VsZi5zY3JvbGxwYW5lID0gJGRsLmpTY3JvbGxQYW5lKCQuZXh0ZW5kKHtcblx0XHRcdFx0XHRcdGNvbnRlbnRXaWR0aDogMjAwXG5cdFx0XHRcdFx0fSwgY2ZnLnNjcm9sbE9wdGlvbnMpKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkZGwuYWRkQ2xhc3MoXCJkZWZhdWx0U2Nyb2xsYmFyXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkZGwuY3NzKHtvdmVyZmxvdzogXCJoaWRkZW5cIn0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcblx0XHQgKiBAcmV0dXJucyB0cnVuY2F0ZWQgZGlzcGxheSBzdHJpbmdcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXG5cdFx0ZnVuY3Rpb24gX3RydW5jYXRlKHN0cikge1xuXHRcdFx0dmFyIGFyciA9IHN0ci5zcGxpdChcIjwvc3Bhbj5cIik7XG5cdFx0XHR2YXIgdmFsVG9UcnVuYyA9IGFyclthcnIubGVuZ3RoIC0gMV07XG5cdFx0XHRhcnJbYXJyLmxlbmd0aCAtIDFdID0gXCJcIjtcblx0XHRcdHZhciBzcGFucyA9IGFyci5qb2luKFwiPC9TUEFOPlwiKTtcblxuXHRcdFx0cmV0dXJuIHNwYW5zICsgY2ZnLnRydW5jYXRlKHZhbFRvVHJ1bmMpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBwdWJsaWNcblx0XHQgKi9cblxuXHRcdHRoaXMuc3luYyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JG9wdGlvbnMgPSBjZmcuc2VsZWN0Ym94LmZpbmQoXCJvcHRpb25cIik7XG5cdFx0XHQkZGwuaHRtbChfcmVuZGVyT3B0aW9ucygpKTtcblx0XHRcdF9iaW5kSG92ZXIoKTtcblx0XHRcdF9zZXR1cFNjcm9sbGJhcigpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBAcHVibGljXG5cdFx0ICovXG5cblx0XHR0aGlzLmRpc2FibGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdF9pc0VuYWJsZWQgPSBmYWxzZTtcblx0XHRcdCRjdXN0b21TZWxlY3QuYWRkQ2xhc3MoRElTQUJMRURfQ0xBU1MpO1xuXHRcdFx0Y2ZnLnNlbGVjdGJveC5hdHRyKFwiZGlzYWJsZWRcIiwgXCJkaXNhYmxlZFwiKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQHB1YmxpY1xuXHRcdCAqL1xuXG5cdFx0dGhpcy5lbmFibGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdF9pc0VuYWJsZWQgPSB0cnVlO1xuXHRcdFx0JGN1c3RvbVNlbGVjdC5yZW1vdmVDbGFzcyhESVNBQkxFRF9DTEFTUyk7XG5cdFx0XHRjZmcuc2VsZWN0Ym94LnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQHB1YmxpY1xuXHRcdCAqL1xuXG5cdFx0dGhpcy5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JGN1c3RvbVNlbGVjdC5yZW1vdmVDbGFzcyhTRUxFQ1RfT1BFTl9DTEFTUyk7XG5cdFx0XHQkY3VzdG9tU2VsZWN0LmNzcyh7XCJ6LWluZGV4XCI6IGNmZy56SW5kZXh9KTtcblx0XHRcdF9pc09wZW4gPSBmYWxzZTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQHB1YmxpY1xuXHRcdCAqL1xuXG5cdFx0dGhpcy5vcGVuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRfc2V0dXBTY3JvbGxiYXIoKTtcblx0XHRcdGlmKGNmZy5tYW5hZ2VyKSB7XG5cdFx0XHRcdGNmZy5tYW5hZ2VyLmNsb3NlKCk7XG5cdFx0XHR9XG5cblx0XHRcdCRjdXN0b21TZWxlY3QuYWRkQ2xhc3MoU0VMRUNUX09QRU5fQ0xBU1MpO1xuXG5cdFx0XHRpZihzZWxmLnNjcm9sbHBhbmUpIHtcblx0XHRcdFx0c2VsZi5zY3JvbGxwYW5lLmRhdGEoJ2pzcCcpLnNjcm9sbFRvWSgkY3VzdG9tU2VsZWN0LmZpbmQoXCIuc2VsZWN0ZWRcIikucG9zaXRpb24oKS50b3ApO1xuXHRcdFx0fVxuXG5cdFx0XHQkY3VzdG9tU2VsZWN0LmNzcyh7XCJ6LWluZGV4XCI6IGNmZy56SW5kZXggKyAxfSk7XG5cdFx0XHRfaXNPcGVuID0gdHJ1ZTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG5cdFx0ICogQHB1YmxpY1xuXHRcdCAqL1xuXG5cdFx0dGhpcy5qdW1wVG9JbmRleCA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0XHRjZmcuc2VsZWN0Ym94LmdldCgwKS5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG5cdFx0XHQkY3VzdG9tU2VsZWN0LmZpbmQoXCIuc2VsZWN0ZWRcIikucmVtb3ZlQ2xhc3MoU0VMRUNURURfQ0xBU1MpO1xuXHRcdFx0JGN1c3RvbVNlbGVjdC5maW5kKFwiLml0bS1cIiArIGluZGV4KS5hZGRDbGFzcyhTRUxFQ1RFRF9DTEFTUyk7XG5cdFx0XHRfdXBkYXRlVmFsdWUoJGN1c3RvbVNlbGVjdC5maW5kKFwiLml0bS1cIiArIGluZGV4KS5odG1sKCkpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcblx0XHQgKiBAcmV0dXJucyB7TnVtYmVyfSBpbmRleCBvZiB0aGUgdmFsdWVcblx0XHQgKiBAcHVibGljXG5cdFx0ICovXG5cblx0XHR0aGlzLmp1bXBUb1ZhbHVlID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHZhciBpbmRleCA9IC0xO1xuXG5cdFx0XHQkb3B0aW9ucy5lYWNoKGZ1bmN0aW9uKGkpIHtcblx0XHRcdFx0aWYgKHRoaXMuaW5uZXJIVE1MPT12YWx1ZSl7XG5cdFx0XHRcdFx0aW5kZXggPSBpO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChpbmRleCE9LTEpe1xuXHRcdFx0XHRzZWxmLmp1bXBUb0luZGV4KGluZGV4KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGluZGV4O1xuXHRcdH07XG5cblx0XHRpbml0KCk7XG5cdH07XG59KShqUXVlcnkpO1xuIiwiLypcbiAgICBqUXVlcnkgTWFza2VkIElucHV0IFBsdWdpblxuICAgIENvcHlyaWdodCAoYykgMjAwNyAtIDIwMTUgSm9zaCBCdXNoIChkaWdpdGFsYnVzaC5jb20pXG4gICAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIChodHRwOi8vZGlnaXRhbGJ1c2guY29tL3Byb2plY3RzL21hc2tlZC1pbnB1dC1wbHVnaW4vI2xpY2Vuc2UpXG4gICAgVmVyc2lvbjogMS40LjFcbiovXG4hZnVuY3Rpb24oZmFjdG9yeSkge1xuICAgIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWyBcImpxdWVyeVwiIF0sIGZhY3RvcnkpIDogZmFjdG9yeShcIm9iamVjdFwiID09IHR5cGVvZiBleHBvcnRzID8gcmVxdWlyZShcImpxdWVyeVwiKSA6IGpRdWVyeSk7XG59KGZ1bmN0aW9uKCQpIHtcbiAgICB2YXIgY2FyZXRUaW1lb3V0SWQsIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCwgaVBob25lID0gL2lwaG9uZS9pLnRlc3QodWEpLCBjaHJvbWUgPSAvY2hyb21lL2kudGVzdCh1YSksIGFuZHJvaWQgPSAvYW5kcm9pZC9pLnRlc3QodWEpO1xuICAgICQubWFzayA9IHtcbiAgICAgICAgZGVmaW5pdGlvbnM6IHtcbiAgICAgICAgICAgIFwiOVwiOiBcIlswLTldXCIsXG4gICAgICAgICAgICBhOiBcIltBLVphLXpdXCIsXG4gICAgICAgICAgICBcIipcIjogXCJbQS1aYS16MC05XVwiXG4gICAgICAgIH0sXG4gICAgICAgIGF1dG9jbGVhcjogITAsXG4gICAgICAgIGRhdGFOYW1lOiBcInJhd01hc2tGblwiLFxuICAgICAgICBwbGFjZWhvbGRlcjogXCJfXCJcbiAgICB9LCAkLmZuLmV4dGVuZCh7XG4gICAgICAgIGNhcmV0OiBmdW5jdGlvbihiZWdpbiwgZW5kKSB7XG4gICAgICAgICAgICB2YXIgcmFuZ2U7XG4gICAgICAgICAgICBpZiAoMCAhPT0gdGhpcy5sZW5ndGggJiYgIXRoaXMuaXMoXCI6aGlkZGVuXCIpKSByZXR1cm4gXCJudW1iZXJcIiA9PSB0eXBlb2YgYmVnaW4gPyAoZW5kID0gXCJudW1iZXJcIiA9PSB0eXBlb2YgZW5kID8gZW5kIDogYmVnaW4sIFxuICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U2VsZWN0aW9uUmFuZ2UgPyB0aGlzLnNldFNlbGVjdGlvblJhbmdlKGJlZ2luLCBlbmQpIDogdGhpcy5jcmVhdGVUZXh0UmFuZ2UgJiYgKHJhbmdlID0gdGhpcy5jcmVhdGVUZXh0UmFuZ2UoKSwgXG4gICAgICAgICAgICAgICAgcmFuZ2UuY29sbGFwc2UoITApLCByYW5nZS5tb3ZlRW5kKFwiY2hhcmFjdGVyXCIsIGVuZCksIHJhbmdlLm1vdmVTdGFydChcImNoYXJhY3RlclwiLCBiZWdpbiksIFxuICAgICAgICAgICAgICAgIHJhbmdlLnNlbGVjdCgpKTtcbiAgICAgICAgICAgIH0pKSA6ICh0aGlzWzBdLnNldFNlbGVjdGlvblJhbmdlID8gKGJlZ2luID0gdGhpc1swXS5zZWxlY3Rpb25TdGFydCwgZW5kID0gdGhpc1swXS5zZWxlY3Rpb25FbmQpIDogZG9jdW1lbnQuc2VsZWN0aW9uICYmIGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSAmJiAocmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKSwgXG4gICAgICAgICAgICBiZWdpbiA9IDAgLSByYW5nZS5kdXBsaWNhdGUoKS5tb3ZlU3RhcnQoXCJjaGFyYWN0ZXJcIiwgLTFlNSksIGVuZCA9IGJlZ2luICsgcmFuZ2UudGV4dC5sZW5ndGgpLCBcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBiZWdpbjogYmVnaW4sXG4gICAgICAgICAgICAgICAgZW5kOiBlbmRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICB1bm1hc2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJpZ2dlcihcInVubWFza1wiKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWFzazogZnVuY3Rpb24obWFzaywgc2V0dGluZ3MpIHtcbiAgICAgICAgICAgIHZhciBpbnB1dCwgZGVmcywgdGVzdHMsIHBhcnRpYWxQb3NpdGlvbiwgZmlyc3ROb25NYXNrUG9zLCBsYXN0UmVxdWlyZWROb25NYXNrUG9zLCBsZW4sIG9sZFZhbDtcbiAgICAgICAgICAgIGlmICghbWFzayAmJiB0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9ICQodGhpc1swXSk7XG4gICAgICAgICAgICAgICAgdmFyIGZuID0gaW5wdXQuZGF0YSgkLm1hc2suZGF0YU5hbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmbiA/IGZuKCkgOiB2b2lkIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2V0dGluZ3MgPSAkLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgYXV0b2NsZWFyOiAkLm1hc2suYXV0b2NsZWFyLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAkLm1hc2sucGxhY2Vob2xkZXIsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkOiBudWxsXG4gICAgICAgICAgICB9LCBzZXR0aW5ncyksIGRlZnMgPSAkLm1hc2suZGVmaW5pdGlvbnMsIHRlc3RzID0gW10sIHBhcnRpYWxQb3NpdGlvbiA9IGxlbiA9IG1hc2subGVuZ3RoLCBcbiAgICAgICAgICAgIGZpcnN0Tm9uTWFza1BvcyA9IG51bGwsICQuZWFjaChtYXNrLnNwbGl0KFwiXCIpLCBmdW5jdGlvbihpLCBjKSB7XG4gICAgICAgICAgICAgICAgXCI/XCIgPT0gYyA/IChsZW4tLSwgcGFydGlhbFBvc2l0aW9uID0gaSkgOiBkZWZzW2NdID8gKHRlc3RzLnB1c2gobmV3IFJlZ0V4cChkZWZzW2NdKSksIFxuICAgICAgICAgICAgICAgIG51bGwgPT09IGZpcnN0Tm9uTWFza1BvcyAmJiAoZmlyc3ROb25NYXNrUG9zID0gdGVzdHMubGVuZ3RoIC0gMSksIHBhcnRpYWxQb3NpdGlvbiA+IGkgJiYgKGxhc3RSZXF1aXJlZE5vbk1hc2tQb3MgPSB0ZXN0cy5sZW5ndGggLSAxKSkgOiB0ZXN0cy5wdXNoKG51bGwpO1xuICAgICAgICAgICAgfSksIHRoaXMudHJpZ2dlcihcInVubWFza1wiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHRyeUZpcmVDb21wbGV0ZWQoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jb21wbGV0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBmaXJzdE5vbk1hc2tQb3M7IGxhc3RSZXF1aXJlZE5vbk1hc2tQb3MgPj0gaTsgaSsrKSBpZiAodGVzdHNbaV0gJiYgYnVmZmVyW2ldID09PSBnZXRQbGFjZWhvbGRlcihpKSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuY29tcGxldGVkLmNhbGwoaW5wdXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGdldFBsYWNlaG9sZGVyKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldHRpbmdzLnBsYWNlaG9sZGVyLmNoYXJBdChpIDwgc2V0dGluZ3MucGxhY2Vob2xkZXIubGVuZ3RoID8gaSA6IDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZWVrTmV4dChwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7Kytwb3MgPCBsZW4gJiYgIXRlc3RzW3Bvc107ICkgO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzZWVrUHJldihwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7LS1wb3MgPj0gMCAmJiAhdGVzdHNbcG9zXTsgKSA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwb3M7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNoaWZ0TChiZWdpbiwgZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpLCBqO1xuICAgICAgICAgICAgICAgICAgICBpZiAoISgwID4gYmVnaW4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSBiZWdpbiwgaiA9IHNlZWtOZXh0KGVuZCk7IGxlbiA+IGk7IGkrKykgaWYgKHRlc3RzW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEobGVuID4gaiAmJiB0ZXN0c1tpXS50ZXN0KGJ1ZmZlcltqXSkpKSBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXJbaV0gPSBidWZmZXJbal0sIGJ1ZmZlcltqXSA9IGdldFBsYWNlaG9sZGVyKGopLCBqID0gc2Vla05leHQoaik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3cml0ZUJ1ZmZlcigpLCBpbnB1dC5jYXJldChNYXRoLm1heChmaXJzdE5vbk1hc2tQb3MsIGJlZ2luKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gc2hpZnRSKHBvcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaSwgYywgaiwgdDtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gcG9zLCBjID0gZ2V0UGxhY2Vob2xkZXIocG9zKTsgbGVuID4gaTsgaSsrKSBpZiAodGVzdHNbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqID0gc2Vla05leHQoaSksIHQgPSBidWZmZXJbaV0sIGJ1ZmZlcltpXSA9IGMsICEobGVuID4gaiAmJiB0ZXN0c1tqXS50ZXN0KHQpKSkgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBhbmRyb2lkSW5wdXRFdmVudCgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1clZhbCA9IGlucHV0LnZhbCgpLCBwb3MgPSBpbnB1dC5jYXJldCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2xkVmFsICYmIG9sZFZhbC5sZW5ndGggJiYgb2xkVmFsLmxlbmd0aCA+IGN1clZhbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY2hlY2tWYWwoITApOyBwb3MuYmVnaW4gPiAwICYmICF0ZXN0c1twb3MuYmVnaW4gLSAxXTsgKSBwb3MuYmVnaW4tLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgwID09PSBwb3MuYmVnaW4pIGZvciAoO3Bvcy5iZWdpbiA8IGZpcnN0Tm9uTWFza1BvcyAmJiAhdGVzdHNbcG9zLmJlZ2luXTsgKSBwb3MuYmVnaW4rKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LmNhcmV0KHBvcy5iZWdpbiwgcG9zLmJlZ2luKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY2hlY2tWYWwoITApOyBwb3MuYmVnaW4gPCBsZW4gJiYgIXRlc3RzW3Bvcy5iZWdpbl07ICkgcG9zLmJlZ2luKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5jYXJldChwb3MuYmVnaW4sIHBvcy5iZWdpbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJ5RmlyZUNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBibHVyRXZlbnQoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrVmFsKCksIGlucHV0LnZhbCgpICE9IGZvY3VzVGV4dCAmJiBpbnB1dC5jaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24ga2V5ZG93bkV2ZW50KGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbnB1dC5wcm9wKFwicmVhZG9ubHlcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3MsIGJlZ2luLCBlbmQsIGsgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZFZhbCA9IGlucHV0LnZhbCgpLCA4ID09PSBrIHx8IDQ2ID09PSBrIHx8IGlQaG9uZSAmJiAxMjcgPT09IGsgPyAocG9zID0gaW5wdXQuY2FyZXQoKSwgXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbiA9IHBvcy5iZWdpbiwgZW5kID0gcG9zLmVuZCwgZW5kIC0gYmVnaW4gPT09IDAgJiYgKGJlZ2luID0gNDYgIT09IGsgPyBzZWVrUHJldihiZWdpbikgOiBlbmQgPSBzZWVrTmV4dChiZWdpbiAtIDEpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IDQ2ID09PSBrID8gc2Vla05leHQoZW5kKSA6IGVuZCksIGNsZWFyQnVmZmVyKGJlZ2luLCBlbmQpLCBzaGlmdEwoYmVnaW4sIGVuZCAtIDEpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKSkgOiAxMyA9PT0gayA/IGJsdXJFdmVudC5jYWxsKHRoaXMsIGUpIDogMjcgPT09IGsgJiYgKGlucHV0LnZhbChmb2N1c1RleHQpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LmNhcmV0KDAsIGNoZWNrVmFsKCkpLCBlLnByZXZlbnREZWZhdWx0KCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGtleXByZXNzRXZlbnQoZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlucHV0LnByb3AoXCJyZWFkb25seVwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHAsIGMsIG5leHQsIGsgPSBlLndoaWNoIHx8IGUua2V5Q29kZSwgcG9zID0gaW5wdXQuY2FyZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGUuY3RybEtleSB8fCBlLmFsdEtleSB8fCBlLm1ldGFLZXkgfHwgMzIgPiBrKSAmJiBrICYmIDEzICE9PSBrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvcy5lbmQgLSBwb3MuYmVnaW4gIT09IDAgJiYgKGNsZWFyQnVmZmVyKHBvcy5iZWdpbiwgcG9zLmVuZCksIHNoaWZ0TChwb3MuYmVnaW4sIHBvcy5lbmQgLSAxKSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAgPSBzZWVrTmV4dChwb3MuYmVnaW4gLSAxKSwgbGVuID4gcCAmJiAoYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoayksIHRlc3RzW3BdLnRlc3QoYykpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaGlmdFIocCksIGJ1ZmZlcltwXSA9IGMsIHdyaXRlQnVmZmVyKCksIG5leHQgPSBzZWVrTmV4dChwKSwgYW5kcm9pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb3h5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5wcm94eSgkLmZuLmNhcmV0LCBpbnB1dCwgbmV4dCkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHByb3h5LCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlucHV0LmNhcmV0KG5leHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3MuYmVnaW4gPD0gbGFzdFJlcXVpcmVkTm9uTWFza1BvcyAmJiB0cnlGaXJlQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjbGVhckJ1ZmZlcihzdGFydCwgZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSBzdGFydDsgZW5kID4gaSAmJiBsZW4gPiBpOyBpKyspIHRlc3RzW2ldICYmIChidWZmZXJbaV0gPSBnZXRQbGFjZWhvbGRlcihpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHdyaXRlQnVmZmVyKCkge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWwoYnVmZmVyLmpvaW4oXCJcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjaGVja1ZhbChhbGxvdykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaSwgYywgcG9zLCB0ZXN0ID0gaW5wdXQudmFsKCksIGxhc3RNYXRjaCA9IC0xO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBwb3MgPSAwOyBsZW4gPiBpOyBpKyspIGlmICh0ZXN0c1tpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChidWZmZXJbaV0gPSBnZXRQbGFjZWhvbGRlcihpKTsgcG9zKysgPCB0ZXN0Lmxlbmd0aDsgKSBpZiAoYyA9IHRlc3QuY2hhckF0KHBvcyAtIDEpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RzW2ldLnRlc3QoYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXJbaV0gPSBjLCBsYXN0TWF0Y2ggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvcyA+IHRlc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJCdWZmZXIoaSArIDEsIGxlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBidWZmZXJbaV0gPT09IHRlc3QuY2hhckF0KHBvcykgJiYgcG9zKyssIHBhcnRpYWxQb3NpdGlvbiA+IGkgJiYgKGxhc3RNYXRjaCA9IGkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWxsb3cgPyB3cml0ZUJ1ZmZlcigpIDogcGFydGlhbFBvc2l0aW9uID4gbGFzdE1hdGNoICsgMSA/IHNldHRpbmdzLmF1dG9jbGVhciB8fCBidWZmZXIuam9pbihcIlwiKSA9PT0gZGVmYXVsdEJ1ZmZlciA/IChpbnB1dC52YWwoKSAmJiBpbnB1dC52YWwoXCJcIiksIFxuICAgICAgICAgICAgICAgICAgICBjbGVhckJ1ZmZlcigwLCBsZW4pKSA6IHdyaXRlQnVmZmVyKCkgOiAod3JpdGVCdWZmZXIoKSwgaW5wdXQudmFsKGlucHV0LnZhbCgpLnN1YnN0cmluZygwLCBsYXN0TWF0Y2ggKyAxKSkpLCBcbiAgICAgICAgICAgICAgICAgICAgcGFydGlhbFBvc2l0aW9uID8gaSA6IGZpcnN0Tm9uTWFza1BvcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGlucHV0ID0gJCh0aGlzKSwgYnVmZmVyID0gJC5tYXAobWFzay5zcGxpdChcIlwiKSwgZnVuY3Rpb24oYywgaSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCI/XCIgIT0gYyA/IGRlZnNbY10gPyBnZXRQbGFjZWhvbGRlcihpKSA6IGMgOiB2b2lkIDA7XG4gICAgICAgICAgICAgICAgfSksIGRlZmF1bHRCdWZmZXIgPSBidWZmZXIuam9pbihcIlwiKSwgZm9jdXNUZXh0ID0gaW5wdXQudmFsKCk7XG4gICAgICAgICAgICAgICAgaW5wdXQuZGF0YSgkLm1hc2suZGF0YU5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJC5tYXAoYnVmZmVyLCBmdW5jdGlvbihjLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdHNbaV0gJiYgYyAhPSBnZXRQbGFjZWhvbGRlcihpKSA/IGMgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9KS5qb2luKFwiXCIpO1xuICAgICAgICAgICAgICAgIH0pLCBpbnB1dC5vbmUoXCJ1bm1hc2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0Lm9mZihcIi5tYXNrXCIpLnJlbW92ZURhdGEoJC5tYXNrLmRhdGFOYW1lKTtcbiAgICAgICAgICAgICAgICB9KS5vbihcImZvY3VzLm1hc2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5wdXQucHJvcChcInJlYWRvbmx5XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoY2FyZXRUaW1lb3V0SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBvcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzVGV4dCA9IGlucHV0LnZhbCgpLCBwb3MgPSBjaGVja1ZhbCgpLCBjYXJldFRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQuZ2V0KDApID09PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmICh3cml0ZUJ1ZmZlcigpLCBwb3MgPT0gbWFzay5yZXBsYWNlKFwiP1wiLCBcIlwiKS5sZW5ndGggPyBpbnB1dC5jYXJldCgwLCBwb3MpIDogaW5wdXQuY2FyZXQocG9zKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5vbihcImJsdXIubWFza1wiLCBibHVyRXZlbnQpLm9uKFwia2V5ZG93bi5tYXNrXCIsIGtleWRvd25FdmVudCkub24oXCJrZXlwcmVzcy5tYXNrXCIsIGtleXByZXNzRXZlbnQpLm9uKFwiaW5wdXQubWFzayBwYXN0ZS5tYXNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dC5wcm9wKFwicmVhZG9ubHlcIikgfHwgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb3MgPSBjaGVja1ZhbCghMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5jYXJldChwb3MpLCB0cnlGaXJlQ29tcGxldGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIH0pLCBjaHJvbWUgJiYgYW5kcm9pZCAmJiBpbnB1dC5vZmYoXCJpbnB1dC5tYXNrXCIpLm9uKFwiaW5wdXQubWFza1wiLCBhbmRyb2lkSW5wdXRFdmVudCksIFxuICAgICAgICAgICAgICAgIGNoZWNrVmFsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7IiwiXG5qUXVlcnkuZm4uZnNpemVHYWxsZXJ5ID0gZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG4gXG4gICAgLy8gRGVmYXVsdCBzZXR0aW5nczpcbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgIGRlbGF5OiAncXVpdGUgbG9uZycsXG5cdFx0c2hvd0Z1bGxTY3JlZW5CdG46IGZhbHNlLFxuXHRcdGJhc2VTbGlkZXJDbGFzczogJ2ZzY3JlZW4nLFxuXHRcdGFjdGl2ZUNsYXNzOiAnYWN0aXZlJyxcblx0XHRzbGlkZXJDbGFzczogJy1zbGlkZXItaW5uZXInLFxuXHRcdHRpdGxlQ2xhc3M6ICctc2xpZGVyLXRpdGxlJyxcblx0XHR0aHVtYnNDbGFzczogJy10aHVtYnMnLFxuXHRcdGZ1bGxTaXplQ2xhc3M6ICdmdWxsc2NyZWVuJyxcbiAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246IDUwMCxcblx0XHRmdWxsU2l6ZTogJzxhIGhyZWY9XCJcIj48L2E+Jyxcblx0XHRjb3VudGVyU2xpZGVyOiAnPHNwYW4+PC9zcGFuPicsXG5cdFx0cHJldkJ0blRwbDogJzxhPjwvYT4nLFxuXHRcdG5leHRCdG5UcGw6ICc8YT48L2E+Jyxcblx0XHRvbk5leHRJbWFnZTogZnVuY3Rpb24oKSB7fSxcblx0XHRvblByZXZJbWFnZTogZnVuY3Rpb24oKSB7fVxuICAgIH07XG4gXG4gICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgb3B0aW9ucyApO1xuXHRzZXR0aW5ncy5zbGlkZXJDbGFzcyA9IHNldHRpbmdzLmJhc2VTbGlkZXJDbGFzcyArIHNldHRpbmdzLnNsaWRlckNsYXNzO1xuXHRzZXR0aW5ncy50aHVtYnNDbGFzcyA9IHNldHRpbmdzLmJhc2VTbGlkZXJDbGFzcyArIHNldHRpbmdzLnRodW1ic0NsYXNzO1xuXHRzZXR0aW5ncy50aXRsZUNsYXNzID0gc2V0dGluZ3MuYmFzZVNsaWRlckNsYXNzICsgc2V0dGluZ3MudGl0bGVDbGFzcztcblx0XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpbmRleCkge1xuXHRcdFxuICAgICAgICAvLyBQbHVnaW4gY29kZSB3b3VsZCBnbyBoZXJlLi4uXG5cdFx0dmFyICR0aGlzID0gJCh0aGlzKSxcblx0XHRcdCR3aW4gPSAkKHdpbmRvdyksXG5cdFx0XHQkc2xpZGVyID0gJCgnLicgKyBzZXR0aW5ncy5zbGlkZXJDbGFzcywgJHRoaXMpLFxuXHRcdFx0JHNsaWRlcyA9ICQoJy4nICsgc2V0dGluZ3Muc2xpZGVyQ2xhc3MgKyAnIGxpJywgJHRoaXMpLFxuXHRcdFx0JHRpdGxlcyA9ICQoJy4nICsgc2V0dGluZ3MudGl0bGVDbGFzcyArICcgbGknLCAkdGhpcyksXG5cdFx0XHRzbGlkZXNXID0gMCxcblx0XHRcdHNsaWRlc0xlbiA9ICRzbGlkZXMuc2l6ZSgpLFxuXHRcdFx0JHRodW1icyA9ICQoJy4nICsgc2V0dGluZ3MudGh1bWJzQ2xhc3MgKyAnIGxpJywgJHRoaXMpLFxuXHRcdFx0dGh1bWJzSCA9ICR0aHVtYnMuZXEoMCkub3V0ZXJIZWlnaHQodHJ1ZSksXG5cdFx0XHQkdGh1bWJzUGFuZSA9ICQoJy4nICsgc2V0dGluZ3MudGh1bWJzQ2xhc3MsICR0aGlzKSxcblx0XHRcdCR0aHVtYnNQYW5lSCA9ICR0aHVtYnNQYW5lLmhlaWdodCgpLFxuXHRcdFx0bWF4RWxlbWVudFZpZXdzID0gTWF0aC5mbG9vciggJHRodW1ic1BhbmVIIC8gJHRodW1icy5lcSgwKS5vdXRlckhlaWdodCh0cnVlKSApLFxuXHRcdFx0dGh1bWJzVG9wID0gMCxcblx0XHRcdHRodW1ic0xlbiA9ICR0aHVtYnMuc2l6ZSgpLFxuXHRcdFx0cHJldiA9IHNsaWRlc0xlbiAtIDEsXG5cdFx0XHRuZXh0ID0gMDtcblx0XHRcblx0XHR2YXIgJHByZXZCdG4gPSAkKHNldHRpbmdzLnByZXZCdG5UcGwpLmFkZENsYXNzKHNldHRpbmdzLmJhc2VTbGlkZXJDbGFzcyArICctcHJldi1idG4nKSxcblx0XHRcdCRuZXh0QnRuID0gJChzZXR0aW5ncy5uZXh0QnRuVHBsKS5hZGRDbGFzcyhzZXR0aW5ncy5iYXNlU2xpZGVyQ2xhc3MgKyAnLW5leHQtYnRuJyksXG5cdFx0XHQkY291bnRlclNsaWRlciA9ICQoc2V0dGluZ3MuY291bnRlclNsaWRlcikuYWRkQ2xhc3Moc2V0dGluZ3MuYmFzZVNsaWRlckNsYXNzICsgJy1jb3VudGVyJyksXG5cdFx0XHQkZnVsbFNpemUgPSAkKHNldHRpbmdzLmZ1bGxTaXplKS5hZGRDbGFzcyhzZXR0aW5ncy5iYXNlU2xpZGVyQ2xhc3MgKyAnLScgKyBzZXR0aW5ncy5mdWxsU2l6ZUNsYXNzKTtcblxuXHRcdC8vIEVycm9yIGlzIG5vdCBlcXVhbCBjb3VudCBzbGlkZXMgYW5kIHRodW1ic1xuXHRcdGlmKHNsaWRlc0xlbiAhPSB0aHVtYnNMZW4gfHwgc2xpZGVzTGVuIDw9IDAgJiYgc2xpZGVzTGVuID09IHRodW1ic0xlbikge1xuXHRcdFx0Y29uc29sZS5sb2coXCJDb3VudCBzbGlkZXMgbm90IGVxdWFsIGNvdW50IHRodW1iczogXCIgKyBzbGlkZXNMZW4gKyBcIiAhPSBcIiArIHRodW1ic0xlbik7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0Ly8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIC8vXG5cdFx0XG5cdFx0Ly8gUHJldiwgTmV4dCBidG5zLCBDb3VudGVyIHNsaWRlciwgRnVsbCBTY3JlZW4gYnRuXG5cdFx0JHNsaWRlci5hcHBlbmQoJHByZXZCdG4sICRuZXh0QnRuLCAkY291bnRlclNsaWRlcik7XG5cdFx0aWYoc2V0dGluZ3Muc2hvd0Z1bGxTY3JlZW5CdG4pIHtcblx0XHRcdCRzbGlkZXIuYXBwZW5kKCRmdWxsU2l6ZSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIFNldCB0aGUgRXZlbnRzXG5cdFx0JHRoaXMub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcblx0XHRcdGlmKCR0YXJnZXQuaXMoJHByZXZCdG4pKSB7XG5cdFx0XHRcdHNob3dQcmV2SW1hZ2UoKTtcblx0XHRcdH0gZWxzZSBpZigkdGFyZ2V0LmlzKCRuZXh0QnRuKSkge1xuXHRcdFx0XHRzaG93TmV4dEltYWdlKCk7XG5cdFx0XHR9IGVsc2UgaWYoJHRhcmdldC5pcygkZnVsbFNpemUpKSB7XG5cdFx0XHRcdGlmKCR0aGlzLmhhc0NsYXNzKHNldHRpbmdzLmZ1bGxTaXplQ2xhc3MpKSB7XG5cdFx0XHRcdFx0JHRoaXMucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuZnVsbFNpemVDbGFzcyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JHRoaXMuYWRkQ2xhc3Moc2V0dGluZ3MuZnVsbFNpemVDbGFzcyk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZigkdGFyZ2V0LmlzKCR0aHVtYnMpKSB7XG5cdFx0XHRcdHZhciBpZHggPSAkdGh1bWJzLmluZGV4KCR0YXJnZXQpO1xuXHRcdFx0XHRwcmV2ID0gbmV4dDtcblx0XHRcdFx0bmV4dCA9IGlkeDtcblx0XHRcdFx0dGh1bWJzRGlyZWN0KCR0YXJnZXQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdFxuXHRcdC8vIFNldCBkZWZhdWx0cyBWYWx1ZXNcblx0XHQkc2xpZGVzLmVhY2goZnVuY3Rpb24oaWR4KSB7XG5cdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHRcdFx0XHQkdGhpc0EgPSAkdGhpcy5maW5kKCdhJyksXG5cdFx0XHRcdHRoaXNIcmVmID0gJHRoaXNBLmF0dHIoJ2hyZWYnKSxcblx0XHRcdFx0JHRodW1ic0EgPSAkdGh1bWJzLmVxKGlkeCkuZmluZCgnYScpLFxuXHRcdFx0XHR0aHVtYnNIcmVmID0gJHRodW1ic0EuYXR0cignaHJlZicpO1xuXHRcdFx0c2xpZGVzVyA9ICR0aGlzLndpZHRoKCk7XG5cdFx0XHRpZihpZHggPiAwKSB7XG5cdFx0XHRcdCR0aGlzLmNzcyh7XG5cdFx0XHRcdFx0J2xlZnQnOiBcIjEwMCVcIlxuXHRcdFx0XHR9KTtcblx0XHRcdFx0JHRpdGxlc1xuXHRcdFx0XHRcdC5lcShpZHgpXG5cdFx0XHRcdFx0LmNzcyh7XG5cdFx0XHRcdFx0XHQnb3BhY2l0eSc6IDAuMCBcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCR0aHVtYnNcblx0XHRcdFx0XHQuZXEoaWR4KVxuXHRcdFx0XHRcdFx0LmFkZENsYXNzKHNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0XHRcdFx0JHRpdGxlc1xuXHRcdFx0XHRcdC5lcShpZHgpXG5cdFx0XHRcdFx0XHQuYWRkQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpXG5cdFx0XHRcdFx0LnBhcmVudCgpXG5cdFx0XHRcdFx0XHQuY3NzKHtcblx0XHRcdFx0XHRcdFx0J2hlaWdodCc6ICR0aXRsZXMuZXEoaWR4KS5vdXRlckhlaWdodCh0cnVlKVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQkdGhpc0EuY3NzKHtcblx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyB0aGlzSHJlZiArICcpJ1xuXHRcdFx0fSkub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH0pO1xuXHRcdFx0JHRodW1ic0EuY3NzKHtcblx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyB0aHVtYnNIcmVmICsgJyknXG5cdFx0XHR9KS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fSk7XG5cdFx0XHQkY291bnRlclNsaWRlclxuXHRcdFx0XHQuaHRtbCgobmV4dCArIDEpICsgJzxpPjwvaT4nICsgc2xpZGVzTGVuKTtcblx0XHR9KTtcblx0XHRcblx0XHQvLyBTbGlkZSBBbmltYXRlXG5cdFx0ZnVuY3Rpb24gYW5pbWF0ZUltYWdlKGRpcmVjdCkge1xuXHRcdFx0aWYoZGlyZWN0KSB7XG5cdFx0XHRcdCRzbGlkZXNcblx0XHRcdFx0XHQuZXEocHJldilcblx0XHRcdFx0XHRcdC5jc3Moe1xuXHRcdFx0XHRcdFx0XHQnbGVmdCc6IDBcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRcdCdsZWZ0JzogXCIxMDAlXCJcblx0XHRcdFx0XHRcdH0sIHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uKVxuXHRcdFx0XHRcdC5lbmQoKVxuXHRcdFx0XHRcdC5lcShuZXh0KVxuXHRcdFx0XHRcdFx0LmNzcyh7XG5cdFx0XHRcdFx0XHRcdCdsZWZ0JzogXCItMTAwJVwiXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0XHQnbGVmdCc6IDBcblx0XHRcdFx0XHRcdH0sIHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCRzbGlkZXNcblx0XHRcdFx0XHQuZXEocHJldilcblx0XHRcdFx0XHRcdC5jc3Moe1xuXHRcdFx0XHRcdFx0XHQnbGVmdCc6IDBcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHRcdCdsZWZ0JzogXCItMTAwJVwiXG5cdFx0XHRcdFx0XHR9LCBzZXR0aW5ncy5hbmltYXRpb25EdXJhdGlvbilcblx0XHRcdFx0XHQuZW5kKClcblx0XHRcdFx0XHQuZXEobmV4dClcblx0XHRcdFx0XHRcdC5jc3Moe1xuXHRcdFx0XHRcdFx0XHQnbGVmdCc6IFwiMTAwJVwiXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0XHQnbGVmdCc6IDBcblx0XHRcdFx0XHRcdH0sIHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uKTtcblx0XHRcdH1cblx0XHRcdCR0aXRsZXNcblx0XHRcdFx0LmVxKHByZXYpXG5cdFx0XHRcdFx0LmNzcyh7XG5cdFx0XHRcdFx0XHQncG9zaXRpb24nOiAnYWJzb2x1dGUnXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHQnb3BhY2l0eSc6IDAuMCBcblx0XHRcdFx0XHR9LCBzZXR0aW5ncy5hbmltYXRpb25EdXJhdGlvbiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQkKHRoaXMpLnJlbW92ZUNsYXNzKHNldHRpbmdzLmFjdGl2ZUNsYXNzKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQuZW5kKClcblx0XHRcdFx0LmVxKG5leHQpXG5cdFx0XHRcdFx0LmNzcyh7XG5cdFx0XHRcdFx0XHQncG9zaXRpb24nOiAncmVsYXRpdmUnXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHQnb3BhY2l0eSc6IDEuMCBcblx0XHRcdFx0XHR9LCBzZXR0aW5ncy5hbmltYXRpb25EdXJhdGlvbiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQkKHRoaXMpXG5cdFx0XHRcdFx0XHRcdC5hZGRDbGFzcyhzZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHQkdGl0bGVzXG5cdFx0XHRcdC5lcShuZXh0KVxuXHRcdFx0XHRcdC5wYXJlbnQoKVxuXHRcdFx0XHRcdC5kZWxheShzZXR0aW5ncy5hbmltYXRpb25EdXJhdGlvbiAvIDIpXG5cdFx0XHRcdFx0LmFuaW1hdGUoe1xuXHRcdFx0XHRcdFx0J2hlaWdodCc6ICR0aXRsZXMuZXEobmV4dCkub3V0ZXJIZWlnaHQodHJ1ZSlcblx0XHRcdFx0XHR9LCBzZXR0aW5ncy5hbmltYXRpb25EdXJhdGlvbik7XG5cdFx0XHQkY291bnRlclNsaWRlclxuXHRcdFx0XHQuaHRtbCgobmV4dCArIDEpICsgJzxpPjwvaT4nICsgc2xpZGVzTGVuKTtcblx0XHRcdFx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHQvLyBUaHVtYnMgRGlyZWN0XG5cdFx0ZnVuY3Rpb24gdGh1bWJzRGlyZWN0KCR0YXJnZXQpIHtcblx0XHRcdCR0aHVtYnMucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuYWN0aXZlQ2xhc3MpO1xuXHRcdFx0JHRhcmdldC5hZGRDbGFzcyhzZXR0aW5ncy5hY3RpdmVDbGFzcyk7XG5cdFx0XHRpZihuZXh0ID4gcHJldikge1xuXHRcdFx0XHRpZihuZXh0ID09IChzbGlkZXNMZW4gLSAxKSAmJiBwcmV2ID09IDApIHtcblx0XHRcdFx0XHRhbmltYXRlSW1hZ2UoMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YW5pbWF0ZUltYWdlKDEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYobmV4dCAhPSBwcmV2KSB7XG5cdFx0XHRcdGlmKG5leHQgPT0gMCAmJiBwcmV2ID09IChzbGlkZXNMZW4gLSAxKSkge1xuXHRcdFx0XHRcdGFuaW1hdGVJbWFnZSgxKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhbmltYXRlSW1hZ2UoMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmKChzbGlkZXNMZW4gLSBtYXhFbGVtZW50Vmlld3MpID4gMCkge1xuXHRcdFx0XHR2YXIgZGVsdGEgPSAoJHdpbi53aWR0aCgpIDwgMTAyNCkgPyBNYXRoLmZsb29yKCR0aHVtYnNQYW5lSCAvIE1hdGguYWJzKCR0aHVtYnNQYW5lLm9mZnNldCgpLmxlZnQgLSAkdGh1bWJzLmVxKG5leHQpLm9mZnNldCgpLmxlZnQpKSA6IE1hdGguZmxvb3IoJHRodW1ic1BhbmVIIC8gTWF0aC5hYnMoJHRodW1ic1BhbmUub2Zmc2V0KCkudG9wIC0gJHRodW1icy5lcShuZXh0KS5vZmZzZXQoKS50b3ApKSxcblx0XHRcdFx0XHRtYXJnaW5Ub3AgPSBNYXRoLmFicyhwYXJzZUludCgkdGh1bWJzUGFuZS5maW5kKCd1bCcpLmNzcygnbWFyZ2luLXRvcCcpKSk7XG5cdFx0XHRcdG1hcmdpblRvcCA9IG1hcmdpblRvcCA+IDA/IG1hcmdpblRvcCA6IG5leHQgO1xuXHRcdFx0XHR0aHVtYnNUb3AgPSAoZGVsdGEgPCAyKT8gKCAoKG1hcmdpblRvcCAvIHRodW1ic0ggKyAxKSAgPD0gKHNsaWRlc0xlbiAtIG1heEVsZW1lbnRWaWV3cykpID8gdGh1bWJzVG9wIC0gdGh1bWJzSCA6IHRodW1ic1RvcCkgOiB0aHVtYnNUb3AgKyB0aHVtYnNIIDtcblx0XHRcdFx0dGh1bWJzVG9wID0gKHRodW1ic1RvcCA+IDApPyAwOiB0aHVtYnNUb3AgO1xuXHRcdFx0XHQkdGh1bWJzUGFuZVxuXHRcdFx0XHRcdC5maW5kKCd1bCcpXG5cdFx0XHRcdFx0LmRlbGF5KHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uIC8gNilcblx0XHRcdFx0XHQuYW5pbWF0ZSh7XG5cdFx0XHRcdFx0XHQnbWFyZ2luLXRvcCc6IHRodW1ic1RvcFxuXHRcdFx0XHRcdH0sIHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gU2xpZGUgUHJldiBpbWFnZVxuXHRcdGZ1bmN0aW9uIHNob3dQcmV2SW1hZ2UoKSB7XG5cdFx0XHR2YXIgaW1nID0gZ2V0UHJldkltYWdlKCk7XG5cdFx0XHQvL2FuaW1hdGVJbWFnZSgxKTtcblx0XHRcdHRodW1ic0RpcmVjdCgkdGh1bWJzLmVxKG5leHQpKTtcblx0XHRcdHNldHRpbmdzLm9uUHJldkltYWdlLmNhbGwoaW1nKTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gU2xpZGUgTmV4dCBpbWFnZVxuXHRcdGZ1bmN0aW9uIHNob3dOZXh0SW1hZ2UoKSB7XG5cdFx0XHR2YXIgaW1nID0gZ2V0TmV4dEltYWdlKCk7XG5cdFx0XHQvL2FuaW1hdGVJbWFnZSgwKTtcblx0XHRcdHRodW1ic0RpcmVjdCgkdGh1bWJzLmVxKG5leHQpKTtcblx0XHRcdHNldHRpbmdzLm9uTmV4dEltYWdlLmNhbGwoaW1nKTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gUmV0dXJuIFByZXYgaW1hZ2UgaW5kZXhcblx0XHRmdW5jdGlvbiBnZXRQcmV2SW1hZ2UoKSB7XG5cdFx0XHRwcmV2ID0gbmV4dDtcblx0XHRcdGlmKChuZXh0IC0gMSkgPj0gMCkge1xuXHRcdFx0XHRuZXh0ID0gbmV4dCAtIDE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRuZXh0ID0gc2xpZGVzTGVuIC0gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXh0O1xuXHRcdH1cblx0XHRcblx0XHQvLyBSZXR1cm4gTmV4dCBpbWFnZSBpbmRleFxuXHRcdGZ1bmN0aW9uIGdldE5leHRJbWFnZSgpIHtcblx0XHRcdHByZXYgPSBuZXh0O1xuXHRcdFx0aWYoKG5leHQgKyAxKSA8IHNsaWRlc0xlbikge1xuXHRcdFx0XHRuZXh0ID0gbmV4dCArIDE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRuZXh0ID0gMDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXh0O1xuXHRcdH1cblxuICAgIH0pO1xuIFxufTsiLCJcbiQoZG9jdW1lbnQpLmZvdW5kYXRpb24oKTtcblxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcblxuXHQvLyBHcmFiIGFsbCBlbGVtZW50cyB3aXRoIHRoZSBjbGFzcyBcImhhc1Rvb2x0aXBcIlxuXHQkKCcucXRpcC10aXAnKS5lYWNoKGZ1bmN0aW9uKCkgeyAvLyBOb3RpY2UgdGhlIC5lYWNoKCkgbG9vcCwgZGlzY3Vzc2VkIGJlbG93XG5cdFx0dmFyICR0aGlzID0gJCh0aGlzKTtcblx0XHQkKHRoaXMpLnF0aXAoe1xuXHRcdFx0Y29udGVudDoge1xuXHRcdFx0XHR0ZXh0OiAkKHRoaXMpLm5leHQoJy5xdGlwLXRpdGxlYmFyJyksIC8vIFVzZSB0aGUgXCJkaXZcIiBlbGVtZW50IG5leHQgdG8gdGhpcyBmb3IgdGhlIGNvbnRlbnRcblx0XHRcdFx0YnV0dG9uOiAn0JfQsNC60YDRi9GC0YwnXG5cdFx0XHR9LFxuXHRcdCAgICBoaWRlOiB7XG5cdFx0ICAgICAgICBldmVudDogZmFsc2Vcblx0XHQgICAgfSxcblx0XHQgICAgcG9zaXRpb246IHtcblx0XHQgICAgICAgIG15OiAkdGhpcy5kYXRhKCdxdGlwJykgfHwgJ2JvdHRvbSBsZWZ0Jyxcblx0XHQgICAgICAgIGF0OiAkdGhpcy5kYXRhKCdxdGlwJykgfHwgJ2JvdHRvbSBsZWZ0J1xuXHRcdCAgICB9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdC8qKlxuXHQqIEN1c3RvbSBTZWxlY3Rcblx0Ki9cblx0JChcInNlbGVjdC5jdXN0b21cIikuZWFjaChmdW5jdGlvbigpIHtcdFx0XHRcdFx0XG5cdFx0dmFyIHNiID0gbmV3IFNlbGVjdEJveCh7XG5cdFx0XHRzZWxlY3Rib3g6ICQodGhpcyksXG5cdFx0XHRoZWlnaHQ6IDE1MCxcblx0XHRcdHdpZHRoOiAyMDBcblx0XHR9KTtcblx0fSk7XG5cblx0LyoqXG5cdCogTWFza2VkIFBsdWdpblxuXHQqL1xuXHQkKFwiI3Bob25lXCIpLm1hc2soXCIrNyg5OTkpIDk5OS05OS05OVwiKTtcblxuXHQvKipcblx0KiBNb2J0b3AgTWVudSBCdG5cblx0Ki9cblx0JCgnLmpzLW1vYnRvcC1tZW51X19idG4nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0JCh0aGlzKS50b2dnbGVDbGFzcygnb3BlbicpO1xuXHR9KTtcblxuXHQvKipcblx0KiBTZXQgQ2F0YWxvZyBsaXN0IHZpZXctdHlwZVxuXHQqL1xuXHQoZnVuY3Rpb24oKXtcblx0XHR2YXIgJHZ0ID0gJCgnLmpzLWNhdGFsb2dfX3ZpZXd0eXBlJyksXG5cdFx0XHQkdHlwZSA9ICQoJy5qcy1jYXRhbG9nLXZpZXctdHlwZScpLFxuXHRcdFx0dHlwZXMgPSBbJ2NhdGFsb2ctLXRhYmxlLXZpZXcnLCdjYXRhbG9nLS1saXN0LXZpZXcnLCdjYXRhbG9nLS1saXN0LXZpZXctc20nXSxcblx0XHRcdCR2dEEgPSAkKCdhJywgJHZ0KSxcblx0XHRcdCR2dEkgPSAkKCcuaWNvbnMnLCAkdnRBKTtcblx0XHRcblx0XHQkdnRBLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKSxcblx0XHRcdFx0aW5keCA9ICR2dEEuaW5kZXgoJHRoaXMpO1xuXHRcdFx0XG5cdFx0XHQkdnRJLnJlbW92ZUNsYXNzKCdhY3RpdmUnKS5lcShpbmR4KS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblx0XHRcdCR0eXBlXG5cdFx0XHRcdC5yZW1vdmVDbGFzcyhmdW5jdGlvbiAoaW5kZXgsIGNzcykge1xuXHRcdFx0XHQgICAgcmV0dXJuICggY3NzLm1hdGNoICgvKF58XFxzKWNhdGFsb2ctLVt0YWJsZXxsaXN0XVxcUysvZykgfHwgW10gKS5qb2luKCcgJyk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5hZGRDbGFzcyh0eXBlc1tpbmR4XSk7XG5cdFx0fSk7XG5cblx0fSgpKTtcblx0XG5cdC8qKlxuXHQqIFxuXHQqL1xuXHQoZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRvcmRlckxpc3QgPSAkKCdpbnB1dFtuYW1lXj1cIm9yZGVyLWxpc3QtXCInKTsgXG5cdFx0XG5cdFx0JG9yZGVyTGlzdC5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dmFyICR0aGlzID0gJCh0aGlzKSxcblx0XHRcdFx0JG5leHRBID0gJHRoaXMubmV4dEFsbCgnYScpO1xuXHRcdFx0JHRoaXMucGFyZW50cygnZGl2LnJvdzplcSgwKScpLmFkZENsYXNzKCdsb2FkZXInKTtcblx0XHRcdGlmKCQodGhpcykuaXMoJzpjaGVja2VkJykpIHtcblx0XHRcdFx0bG9jYXRpb24uaHJlZiA9ICRuZXh0QS5lcSgwKS5hdHRyKCdocmVmJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsb2NhdGlvbi5ocmVmID0gJG5leHRBLmVxKDEpLmF0dHIoJ2hyZWYnKTtcblx0XHRcdH1cblx0XHRcblx0XHR9KTtcblx0XHRcblx0fSgpKTtcblx0XG5cdC8vIENhdGFsb2cgSXRlbSBHYWxsZXJ5IGFjdGl2YXRlXG5cdCQoJy5mc2NyZWVuJykuZnNpemVHYWxsZXJ5KHtcblx0XHRzaG93RnVsbFNjcmVlbkJ0bjogdHJ1ZSxcblx0XHRvblByZXZJbWFnZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdC8vIGFsZXJ0KFwicHJldiBpbWFnZSBzaG93XCIpO1xuXHRcdH0sXG5cdFx0b25OZXh0SW1hZ2U6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0XHQvLyBhbGVydChcIm5leHQgaW1hZ2Ugc2hvd1wiKTtcblx0XHR9XG5cdH0pO1xuXG59KTtcblxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
