
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
				
				thumbsTop = (next != prev && next == (slidesLen - 1))? -1 * (slidesLen - maxElementViews) * thumbsH : thumbsTop ;
				
				thumbsTop = (thumbsTop > 0 || next == 0)? 0: thumbsTop ;
				
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