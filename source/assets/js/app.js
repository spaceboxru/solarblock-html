
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


