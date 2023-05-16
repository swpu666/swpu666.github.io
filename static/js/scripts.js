/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b, c) {
    var $ = b.jQuery || b.Cowboy || (b.Cowboy = {}),
        a;
    $.throttle = a = function(e, f, j, i) {
        var h, d = 0;
        if (typeof f !== "boolean") {
            i = j;
            j = f;
            f = c
        }

        function g() {
            var o = this,
                m = +new Date() - d,
                n = arguments;

            function l() {
                d = +new Date();
                j.apply(o, n)
            }

            function k() { h = c }
            if (i && !h) { l() }
            h && clearTimeout(h);
            if (i === c && m > e) { l() } else { if (f !== true) { h = setTimeout(i ? k : l, i === c ? e - m : e) } }
        }
        if ($.guid) { g.guid = j.guid = j.guid || $.guid++ }
        return g
    };
    $.debounce = function(d, e, f) { return f === c ? a(d, e, false) : a(d, f, e !== false) }
})(this);


var LEONASSCRIPT = LEONASSCRIPT || {};

(function($) {

    // USE STRICT
    "use strict";

    var $window = $(window);
    var $document = $(document);
    var $goToTopEl = $('.js-go-top-el');
    var $overlayBg = $('.js-overlay-bg');
    $(".single-body").fitVids();

    function getCookie(cookieName) {
        var name = cookieName + '=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var cookies = decodedCookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return '';
    }

    function setCookie(cookieName, cookieValue, expireDays) {
        var date = new Date();
        date.setTime(date.getTime() + expireDays * 24 * 60 * 60 * 1000);
        var expires = 'expires=' + date.toGMTString();
        document.cookie = cookieName + '=' + cookieValue + ';' + expires + ';path=/';
    }

    /* ============================================================================
     * Detect if an element is in viewport
     * ==========================================================================*/
    function inViewport(element, dimension) {
        if (element.length) {
            var offsetLeft = element.offset().left,
                width = element.outerWidth(),
                viewportWidth = $(window).innerWidth();
            if (dimension === 'x') {
                return (offsetLeft > 0) && ((offsetLeft + width) <= viewportWidth);
            }
        }
    }
    LEONASSCRIPT.header = {

        init: function() {
            LEONASSCRIPT.header.pagiButton();
            LEONASSCRIPT.header.ajaxSearch();
            LEONASSCRIPT.header.ajaxMegamenu();
            LEONASSCRIPT.header.loginForm();
            LEONASSCRIPT.header.offCanvasMenu();
            LEONASSCRIPT.header.priorityNavInit();
            LEONASSCRIPT.header.carousel_1i_text_fade();
            LEONASSCRIPT.header.carousel_1i_dot_number_effect();
            LEONASSCRIPT.header.carousel_1i_dot_number_get_background();
            LEONASSCRIPT.header.smartAffix.init({
                fixedHeader: '.js-sticky-header',
                headerPlaceHolder: '.js-sticky-header-holder',
            });
        },

        /* ============================================================================
         * Fix sticky navbar padding when open modal
         * ==========================================================================*/
        stickyNavbarPadding: function() {
            var oldSSB = $.fn.modal.Constructor.prototype.setScrollbar;
            var $stickyHeader = $('.sticky-header .navigation-bar');

            $.fn.modal.Constructor.prototype.setScrollbar = function() {
                oldSSB.apply(this);
                if (this.bodyIsOverflowing && this.scrollbarWidth) {
                    $stickyHeader.css('padding-right', this.scrollbarWidth);
                }
            }

            var oldRSB = $.fn.modal.Constructor.prototype.resetScrollbar;
            $.fn.modal.Constructor.prototype.resetScrollbar = function() {
                oldRSB.apply(this);
                $stickyHeader.css('padding-right', '');
            }
        },
        atbsSearchButton: function() {
            var btnSearchOpen = $('.js-btn-search-open');
            var btnSearchClose = $('.js-btn-search-close');
            var formSearch = $('.atbs-search-form');
            btnSearchOpen.each(function() {
                $(this).on('click', function() {
                    $(formSearch).addClass('Open');
                    setTimeout(function() {
                        $(formSearch).addClass('Active-Animation');
                        $(btnSearchClose).focus()
                    }, 600);
                });
            });
            btnSearchClose.each(function() {
                $(this).on('click', function() {
                    $(formSearch).removeClass('Open');
                    $(formSearch).removeClass('Active-Animation');
                    $(btnSearchOpen).focus()
                });
            });
        },

        ajaxSearch: function() {
            var $results = '';
            var $ajaxSearch = $('.js-ajax-search');
            var ajaxStatus = '';
            var noResultText = '<span class="noresult-text">There are no results.</span>';
            var errorText = '<span class="error-text">There was some error.</span>';

            $ajaxSearch.each(function() {
                var $this = $(this);
                var $searchForm = $this.find('.search-form__input');
                var $resultsContainer = $this.find('.search-results');
                var $resultsContent = $this.find('.search-results__content:not(.default)');
                var searchTerm = '';
                var lastSearchTerm = '';

                $searchForm.on('input', $.debounce(800, function() {
                    searchTerm = $searchForm.val();

                    if (searchTerm.length > 0) {


                        if ((searchTerm != lastSearchTerm) || (ajaxStatus === 'failed')) {
                            $resultsContainer.removeClass('is-error').addClass('is-loading');
                            

                            // Hide current content while loading
                            if ($resultsContainer.hasClass('is-loading')) {
                                $resultsContent.css('opacity', 1).addClass('slide-out').on('animationend', function() {
                                    $(this).removeClass('slide-out').css('opacity', 0);
                                });
                            } else

                                lastSearchTerm = searchTerm;
                            ajaxLoad(searchTerm, $resultsContainer, $resultsContent);
                        }
                    } else {
                        $resultsContainer.removeClass('is-active');
                    }
                }));
            });

            function ajaxLoad(searchTerm, $resultsContainer, $resultsContent) {
                var atbsAjaxSecurity = ajax_buff['atbs_security']['atbs_security_code']['content'];
                var ajaxCall = $.ajax({
                    url: ajaxurl,
                    type: 'post',
                    dataType: 'html',
                    data: {
                        action: 'atbs_ajax_search',
                        searchTerm: searchTerm,
                        securityCheck: atbsAjaxSecurity,
                    },
                });

                ajaxCall.done(function(respond) {
                    $results = $.parseJSON(respond);
                    ajaxStatus = 'success';
                    if (!$results.length) {
                        $results = noResultText;
                    }
                    $resultsContent.html($results).css('opacity', 0)
                        .addClass('slide-in')
                        .on('animationend', function() {
                            $(this).removeClass('slide-in').css('opacity', '');
                        });
                });

                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                    $results = errorText;
                    $resultsContent.html($results).css('opacity', 0)
                        .addClass('slide-in')
                        .on('animationend', function() {
                            $(this).removeClass('slide-in').css('opacity', '');
                        });
                });

                ajaxCall.always(function() {
                });
            }
        },
        /* ============================================================================
         * Megamenu Ajax
         * ==========================================================================*/
        ajaxMegamenu: function() {
            var $results = '';
            var $subCatItem = $('.atbs-mega-menu ul.sub-categories > li');
            $subCatItem.on('click', function(e) {
                e.preventDefault();
                var $this = $(this);
                if ($(this).hasClass('active')) {
                    return;
                }
                $(this).parents('.sub-categories').find('li').removeClass('active');
                var $container = $this.parents('.atbs-mega-menu__inner').find('.posts-list');
                var $thisCatSplit = $this.attr('class').split('-');
                var thisCatID = $thisCatSplit[$thisCatSplit.length - 1];
                var megaMenuStyle = 0;
                $container.append('<div class="bk-preload-wrapper"></div>');
                $container.find('article').addClass('bk-preload-blur');

                if ($container.hasClass('atbs-megamenu-style-2')) {
                    megaMenuStyle = 2;
                } else if ($container.hasClass('atbs-megamenu-style-3')) {
                    megaMenuStyle = 3;
                } else {
                    megaMenuStyle = 0;
                }
                $this.addClass('active');
                var $htmlRestore = ajax_buff['megamenu'][thisCatID]['html'];
                ajaxLoad(thisCatID, megaMenuStyle, $container);
            });

            function ajaxLoad(thisCatID, megaMenuStyle, $container) {
                var atbsAjaxSecurity = ajax_buff['atbs_security']['atbs_security_code']['content'];
                var ajaxCall = {
                    action: 'atbs_ajax_megamenu',
                    thisCatID: thisCatID,
                    megaMenuStyle: megaMenuStyle,
                    securityCheck: atbsAjaxSecurity
                };
                $.post(ajaxurl, ajaxCall, function(response) {
                    $results = $.parseJSON(response);
                    //Save HTML
                    ajax_buff['megamenu'][thisCatID]['html'] = $results;
                    // Append Result
                    $container.html($results).css('opacity', 0).animate({ opacity: 1 }, 500);
                    LEONASSCRIPT.documentOnReady.carousel_4i30m();
                });
            }

            function ajaxRestore($container, thisCatID, $htmlRestore) {
                LEONASSCRIPT.documentOnReady.carousel_4i30m();
            }
        },

        /* ============================================================================
         * Ajax Button
         * ==========================================================================*/
        pagiButton: function() {
            var $dotNextTemplate = '<span class="atbs-pagination__item atbs-pagination__dots atbs-pagination__dots-next">&hellip;</span>';
            var $dotPrevTemplate = '<span class="atbs-pagination__item atbs-pagination__dots atbs-pagination__dots-prev">&hellip;</span>';
            var $buttonTemplate = '<a class="atbs-pagination__item" href="#">##PAGENUMBER##</a>';
            var $dotIndex_next;
            var $dotIndex_prev;
            var $pagiAction;
            var $results = '';

            $('body').on('click', '.atbs-module-pagination .atbs-pagination__links > a', function(e) {
                e.preventDefault();
                var $this = $(this);
                if (($this.hasClass('disable-click')) || $this.hasClass('atbs-pagination__item-current'))
                    return;

                var $pagiChildren = $this.parent().children();
                var $totalPageVal = parseInt($($pagiChildren[$pagiChildren.length - 2]).text());
                var $lastIndex = $this.parent().find('.atbs-pagination__item-current').index();
                var $lastPageVal = parseInt($($pagiChildren[$lastIndex]).text());

                var $nextButton = $this.parent().find('.atbs-pagination__item-next');
                var $prevButton = $this.parent().find('.atbs-pagination__item-prev');

                // Save the last active button
                var $lastActiveButton = $this.parent().find('.atbs-pagination__item-current');
                // Save the last page
                var $lastActivePage = $this.parent().find('.atbs-pagination__item-current');

                // Add/Remove current class
                $this.siblings().removeClass('atbs-pagination__item-current');
                if ($this.hasClass('atbs-pagination__item-prev')) {
                    $lastActivePage.prev().addClass('atbs-pagination__item-current');
                } else if ($this.hasClass('atbs-pagination__item-next')) {
                    $lastActivePage.next().addClass('atbs-pagination__item-current');
                } else {
                    $this.addClass('atbs-pagination__item-current');
                }

                var $currentActiveButton = $this.parent().find('.atbs-pagination__item-current');
                var $currentIndex = $this.parent().find('.atbs-pagination__item-current').index();
                var $currentPageVal = parseInt($($pagiChildren[$currentIndex]).text());

                if ($currentPageVal == 1) {
                    $($prevButton).addClass('disable-click');
                    $($nextButton).removeClass('disable-click');
                } else if ($currentPageVal == $totalPageVal) {
                    $($prevButton).removeClass('disable-click');
                    $($nextButton).addClass('disable-click');
                } else {
                    $($prevButton).removeClass('disable-click');
                    $($nextButton).removeClass('disable-click');
                }

                if ($totalPageVal > 5) {

                    if ($this.parent().find('.atbs-pagination__dots').hasClass('atbs-pagination__dots-next')) {
                        $dotIndex_next = $this.parent().find('.atbs-pagination__dots-next').index();
                    } else {
                        $dotIndex_next = -1;
                    }
                    if ($this.parent().find('.atbs-pagination__dots').hasClass('atbs-pagination__dots-prev')) {
                        $dotIndex_prev = $this.parent().find('.atbs-pagination__dots-prev').index();
                    } else {
                        $dotIndex_prev = -1;
                    }

                    if (isNaN($currentPageVal)) {
                        if ($this.hasClass('atbs-pagination__item-prev')) {
                            $currentPageVal = parseInt($($pagiChildren[$currentIndex + 1]).text()) - 1;
                        } else if ($this.hasClass('atbs-pagination__item-next')) {
                            $currentPageVal = parseInt($($pagiChildren[$currentIndex - 1]).text()) + 1;
                        } else {
                            return;
                        }

                    }

                    if ($currentPageVal > $lastPageVal) {
                        $pagiAction = 'up';
                    } else {
                        $pagiAction = 'down';
                    }

                    if (($pagiAction == 'up')) {
                        if (($currentIndex == ($dotIndex_next - 1)) || ($currentIndex == $dotIndex_next) || ($currentPageVal == $totalPageVal)) {

                            $this.parent().find('.atbs-pagination__dots').remove(); //Remove ALL Dot Signal

                            if ($currentIndex == $dotIndex_next) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal))).insertAfter($lastActiveButton);
                                $lastActiveButton.next().addClass('atbs-pagination__item-current');
                                $currentActiveButton = $this.parent().find('.atbs-pagination__item-current');
                            }

                            while (parseInt(($this.parent().find('a:nth-child(3)')).text()) != $currentPageVal) {
                                $this.parent().find('a:nth-child(3)').remove(); //Remove 1 button before
                            }

                            $($dotPrevTemplate).insertBefore($currentActiveButton); //Insert Dot Next

                            if (($currentPageVal < ($totalPageVal - 3))) {
                                $($dotNextTemplate).insertAfter($currentActiveButton); //Insert Dot Prev
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 2))).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 1))).insertAfter($currentActiveButton);
                            } else if (($currentPageVal < ($totalPageVal - 2))) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 2))).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 1))).insertAfter($currentActiveButton);
                            } else if (($currentPageVal < ($totalPageVal - 1))) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal + 1))).insertAfter($currentActiveButton);
                            }
                            if ($currentPageVal == $totalPageVal) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 3))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            } else if ($currentPageVal == ($totalPageVal - 1)) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            } else if ($currentPageVal == ($totalPageVal - 2)) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }
                        }
                    } else if ($pagiAction == 'down') {
                        if (($currentIndex == ($dotIndex_prev + 1)) || ($currentIndex == $dotIndex_prev) || (($currentPageVal == 1) && ($currentIndex < $dotIndex_prev))) {

                            $this.parent().find('.atbs-pagination__dots').remove(); //Remove ALL Dot Signal

                            if ($currentIndex == $dotIndex_prev) {
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal))).insertBefore($lastActiveButton);
                                $lastActiveButton.prev().addClass('atbs-pagination__item-current');
                                $currentActiveButton = $this.parent().find('.atbs-pagination__item-current');
                                while (parseInt($this.parent().find('a:nth-child(' + ($currentIndex + 2) + ')').text()) != $totalPageVal) {
                                    $this.parent().find('a:nth-child(' + ($currentIndex + 2) + ')').remove(); //Remove 1 button before
                                }
                            } else if (($currentPageVal == 1) && ($currentIndex < $dotIndex_prev)) {
                                while (parseInt($this.parent().find('a:nth-child(' + ($currentIndex + 2) + ')').text()) != $totalPageVal) {
                                    $this.parent().find('a:nth-child(' + ($currentIndex + 2) + ')').remove(); //Remove 1 button before
                                }
                            } else {
                                while (parseInt($this.parent().find('a:nth-child(' + ($currentIndex + 1) + ')').text()) != $totalPageVal) {
                                    $this.parent().find('a:nth-child(' + ($currentIndex + 1) + ')').remove(); //Remove 1 button before
                                }
                            }
                            $($dotNextTemplate).insertAfter($currentActiveButton); //Insert Dot After

                            if ($currentPageVal > 4) { // <- 1 ... 5 6 7 ... 10 ->
                                $($dotPrevTemplate).insertBefore($currentActiveButton); //Insert Dot Prev
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            } else if ($currentPageVal > 3) { // <- 1 ... 4 5 6 ... 10 ->
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 2))).insertBefore($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            } else if ($currentPageVal > 2) { // <- 1 ... 3 4 5 ... 10 ->
                                $($buttonTemplate.replace('##PAGENUMBER##', ($currentPageVal - 1))).insertBefore($currentActiveButton);
                            }
                            if ($currentPageVal == 1) {
                                $($buttonTemplate.replace('##PAGENUMBER##', 4)).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', 3)).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', 2)).insertAfter($currentActiveButton);
                            } else if ($currentPageVal == 2) {
                                $($buttonTemplate.replace('##PAGENUMBER##', 4)).insertAfter($currentActiveButton);
                                $($buttonTemplate.replace('##PAGENUMBER##', 3)).insertAfter($currentActiveButton);
                            } else if ($currentPageVal == 3) {
                                $($buttonTemplate.replace('##PAGENUMBER##', 4)).insertAfter($currentActiveButton);
                            }
                        }
                    }
                }
                if ($currentPageVal != 1) {
                    $this.siblings('.atbs-pagination__item-prev').css('display', 'inline-block');
                } else {
                    if ($this.hasClass('atbs-pagination__item-prev')) {
                        $this.css('display', 'none');
                    } else {
                        $this.siblings('.atbs-pagination__item-prev').css('display', 'none');
                    }
                }
                if ($currentPageVal == $totalPageVal) {
                    if ($this.hasClass('atbs-pagination__item-next')) {
                        $this.css('display', 'none');
                    } else {
                        $this.siblings('.atbs-pagination__item-next').css('display', 'none');
                    }
                } else {
                    $this.siblings('.atbs-pagination__item-next').css('display', 'inline-block');
                }
                ajaxListing($this, $currentPageVal);
            });

            function ajaxListing($this, $currentPageVal) {
                var $moduleID = $this.closest('.atbs-block').attr('id');
                var moduleName = $moduleID.split("-")[0];
                var args = ajax_buff['query'][$moduleID]['args'];
                if (moduleName == 'atbs_author_results') {
                    var postOffset = ($currentPageVal - 1) * args['number'] + parseInt(args['offset']);
                    var $container = $this.closest('.atbs-block').find('.authors-list');
                    var moduleInfo = '';
                } else {
                    var postOffset = ($currentPageVal - 1) * args['posts_per_page'] + parseInt(args['offset']);
                    var $container = $this.closest('.atbs-block').find('.posts-list');
                    var moduleInfo = ajax_buff['query'][$moduleID]['moduleInfo'];
                }
                var parameters = {
                    moduleName: moduleName,
                    args: args,
                    moduleInfo: moduleInfo,
                    postOffset: postOffset,
                };
                $container.css('height', $container.height() + 'px');
                $container.append('<div class="bk-preload-wrapper"></div>');
                $container.find('article').addClass('bk-preload-blur');

                loadAjax(parameters, $container);

                var $mainCol = $this.parents('.atbs-main-col');
                if ($mainCol.length > 0) {
                    var $subCol = $mainCol.siblings('.atbs-sub-col');
                    $subCol.css('min-height', '1px');
                }
                var $scrollTarget = $this.parents('.atbs-block');
                $('body,html').animate({
                    scrollTop: $scrollTarget.offset().top,
                }, 1100);
                setTimeout(function() { $container.css('height', 'auto'); }, 1100);
            }

            function loadAjax(parameters, $container) {

                var atbsAjaxSecurity = ajax_buff['atbs_security']['atbs_security_code']['content'];

                var ajaxCall = {
                    action: parameters.moduleName,
                    args: parameters.args,
                    moduleInfo: parameters.moduleInfo,
                    postOffset: parameters.postOffset,
                    securityCheck: atbsAjaxSecurity
                };
                $.post(ajaxurl, ajaxCall, function(response) {
                    $results = $.parseJSON(response);
                    //Save HTML
                    // Append Result
                    $container.html($results).css('opacity', 0).animate({ opacity: 1 }, 500);
                    $container.find('.bk-preload-wrapper').remove();
                    $container.find('article').removeClass('bk-preload-blur');
                });
            }

            function checkStickySidebar($this) {
                var $subCol = $this.parents('.atbs-main-col').siblings('.atbs-sub-col');
                if ($subCol.hasClass('js-sticky-sidebar')) {
                    return $subCol;
                } else {
                    return 0;
                }
            }
        },

        /* ============================================================================
         * Login Form tabs
         * ==========================================================================*/
        loginForm: function() {
            var $loginFormTabsLinks = $('.js-login-form-tabs').find('a');

            $loginFormTabsLinks.on('click', function(e) {
                e.preventDefault()
                $(this).tab('show');
            });
        },

        /* ============================================================================
         * carousel
         * ==========================================================================*/
        carousel_1i_text_fade: function() {
            var $carousels = $('.js-atbs-carousel-1i-text-fade');
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    loop: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    onTranslate: removeAnimation,
                    onTranslated: showAnimation,
                    onDrag: removeAnimation,
                    responsive: {
                        992: {
                            // mouseDrag: false,
                            // touchDrag: false,
                        },
                    },
                });

                function removeAnimation(event) {
                    var $this = event.target;
                    var item = $($this).find('.owl-item');
                    $(item).find('.post__text').removeClass("fadeInText");
                    $(item).find('.post__text').addClass("opacity-default");
                }

                function showAnimation(event) {
                    var $this = event.target;
                    var item = $($this).find('.active');
                    $(item).find('.post__text').addClass("fadeInText");
                    $(item).find('.post__text').removeClass("opacity-default");

                }
            })
        },
        carousel_1i_dot_number_effect: function() {
            var $carousels = $('.js-atbs-carousel-1i-dot-number-effect');
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    loop: true,
                    animateIn : 'fadeIn',
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 700,
                    onInitialized: counter,
                    onTranslate: counter,
                    responsive: {
                        0: {
                            items: 1,
                            margin: 30,
                        },

                        768: {
                            items: 1,
                            margin: 50,
                        },
                    },
                });
            });

            function counter(event) {
                var element = event.target;
                var itemCount = event.item.count;
                var itenIndex = event.item.index;
                var owlstageChildrens = $(element).find('.owl-stage').children().length;

                var theCloned = owlstageChildrens - itemCount;
                var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                if (itenIndex < parseInt(theCloned / 2)) {
                    currentIndex = owlstageChildrens - theCloned;
                } else if (currentIndex > itemCount) {
                    currentIndex = currentIndex - itemCount;
                }

                $(element).parent().find('.owl-number').html(currentIndex + ' <span class="slide-seperated">/</span> ' + itemCount);
            }

            function removeAnimation(event) {
            }

            function showAnimation(event) {
            }
        },
        carousel_1i_dot_number_get_background: function() {
            var $carousels = $('.js-atbs-carousel-1i-dot-number-get-background');
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    nav: false,
                    loop: true,
                    dots: true,
                    lazyLoad: true,
                    autoHeight: true,
                    smartSpeed: 100,
                    onInitialized: owl_onInitialized,
                    onTranslate: counter,
                    navText: ['<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17" fill="#fff" viewBox="0 0 32 17"><path id="slider-prev" data-name="Slider Prev" class="slider_arrow_path" d="M8.158,0.007L8.835,0.685,1.5,8.019H32V8.979H1.5l7.338,7.334-0.677.679L0,8.839V8.16Z"></path></svg>', '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="17"  fill="#fff" viewBox="0 0 32 17"><path id="slider-next" data-name="Slider Next" class="slider_arrow_path" d="M23.842,0.007l-0.677.678L30.5,8.019H0V8.979H30.5l-7.338,7.334,0.677,0.679L32,8.839V8.16Z"></path></svg>'],
                    responsive: {
                        0: {
                            items: 1,
                            margin: 30,
                        },

                        768: {
                            items: 1,

                        },
                    },
                });
                $(this).on('translate.owl.carousel', function(event) {
                    var element = event.target;
                    var thebackgroundIMG = '';
                    var currentImgSrcData = '';

                    var checkActiveItemLoaded = setInterval(function() {
                        if (!$(element).find('.owl-item.active').hasClass('owl-item-active-loaded')) {
                            $(element).find('.owl-item').removeClass('owl-item-active-loaded');
                            $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                            thebackgroundIMG = $(element).parents('.atbs-block__inner').find('.owl-background .owl-background-img');
                            currentImgSrcData = $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src');

                            thebackgroundIMG.each(function() {
                                if ($(this).hasClass('active')) {
                                    $(this).removeClass('active');
                                } else {
                                    $(this).removeAttr('src').attr('src', currentImgSrcData);
                                    $(this).addClass('active');
                                }
                            });
                            $(element).parents('.atbs-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));
                            $(element).parents('.atbs-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));
                            clearInterval(checkActiveItemLoaded);
                        }

                    }, 10); // check every 10ms
                });

                function owl_onInitialized(event) {
                    var element = event.target;
                    var itemCount = event.item.count;
                    var itenIndex = event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;

                    var theCloned = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if (itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    } else if (currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }

                    $(element).parent().find('.owl-number').html(currentIndex + ' <span class="slide-seperated">/</span> ' + itemCount);

                    $(element).parents('.atbs-block__inner').find('.owl-background .owl-background-img.active').closest('a').attr('href', $(element).find('.owl-item.active').find('.post__thumb > a').attr('href'));

                    $(element).parents('.atbs-block__inner').find('.owl-background .owl-background-img.active').attr('src', $(element).find('.owl-item.active').find('.post__thumb > a > img').attr('src'));

                    $(element).find('.owl-item.active').addClass('owl-item-active-loaded');
                };

                function counter(event) {
                    var element = event.target;
                    var itemCount = event.item.count;
                    var itenIndex = event.item.index;
                    var owlstageChildrens = $(element).find('.owl-stage').children().length;

                    var theCloned = owlstageChildrens - itemCount;
                    var currentIndex = itenIndex - parseInt(theCloned / 2) + 1;
                    if (itenIndex < parseInt(theCloned / 2)) {
                        currentIndex = owlstageChildrens - theCloned;
                    } else if (currentIndex > itemCount) {
                        currentIndex = currentIndex - itemCount;
                    }

                    $(element).parent().find('.owl-number').html(currentIndex + ' <span class="slide-seperated">/</span> ' + itemCount);
                }
            });
        },


        /* ============================================================================
         * Offcanvas Menu
         * ==========================================================================*/
        offCanvasMenu: function() {
            var $backdrop = $('<div class="atbs-offcanvas-backdrop"></div>');
            var $offCanvas = $('.js-atbs-offcanvas');
            var $offCanvasToggle = $('.js-atbs-offcanvas-toggle');
            var $offCanvasClose = $('.js-atbs-offcanvas-close');
            var $offCanvasMenuHasChildren = $('.navigation--offcanvas').find('li.menu-item-has-children > a');
            var menuExpander = ('<div class="submenu-toggle"><i class="mdicon mdicon-expand_more"></i></div>');
            var check_show_more = false;

            $backdrop.on('click', function() {
                var button_hide = $offCanvas.find('.btn-nav-show_full i');
                $(this).fadeOut(200, function() {
                    $(this).detach();
                });
                var check_show_full = $offCanvas;
                if ($(check_show_full).hasClass('show-full')) {
                    $(check_show_full).removeClass('animation');
                    setTimeout(function() {
                        $(check_show_full).removeClass('show-full');
                        $(check_show_full).removeClass('is-active');
                    }, 400);
                } else {
                    $(check_show_full).removeClass('show-full');
                    $(check_show_full).removeClass('is-active');
                }
                setTimeout(function() {
                    $(check_show_full).removeClass('animation');
                    $(check_show_full).removeClass('show-full');
                    $(check_show_full).removeClass('is-active');
                }, 400);
                check_show_more = false;
                button_hide.attr('class', 'mdicon mdicon-chevron-thin-right');
            });
            $offCanvasToggle.on('click', function(e) {
                var check_show_full = $offCanvas;
                e.preventDefault();
                var targetID = $(this).attr('href');
                var $target = $(targetID);
                $target.toggleClass('is-active');
                $backdrop.hide().appendTo(document.body).fadeIn(200);
            });
            $offCanvasClose.on('click', function(e) {
                e.preventDefault();
                var button_hide = $offCanvas.find('.btn-nav-show_full i');
                $backdrop.fadeOut(200, function() {
                    $(this).detach();
                });
                check_show_more = false;
                var check_show_full = $offCanvas;
                if ($(check_show_full).hasClass('show-full')) {
                    $(check_show_full).removeClass('animation');
                    setTimeout(function() {
                        $(check_show_full).removeClass('show-full');
                        $(check_show_full).removeClass('is-active');
                    }, 400);
                } else {
                    $(check_show_full).removeClass('show-full');
                    $(check_show_full).removeClass('is-active');
                }
                button_hide.attr('class', 'mdicon mdicon-chevron-thin-right');
            });
            $offCanvasMenuHasChildren.append(function() {
                return $(menuExpander).on('click', function(e) {
                    e.preventDefault();
                    var $subMenu = $(this).parent().siblings('.sub-menu');
                    $subMenu.slideToggle(200);
                });
            });
            $(window).on('resize', function(e) {
                var checkExist = setInterval(function() {
                    var elementPC = $('#atbs-offcanvas-primary');
                    var elementMB = $('#atbs-offcanvas-mobile');
                    if (elementPC.hasClass('is-active')) {
                        var checkDisplay = elementPC.css('display');
                        if (checkDisplay == 'none') {
                            $backdrop.css('display', 'none');
                            clearInterval(checkExist);
                        }
                    }
                    if (elementMB.hasClass('is-active')) {
                        var checkDisplay = elementMB.css('display');
                        if (checkDisplay == 'none') {
                            $backdrop.css('display', 'none');
                            clearInterval(checkExist);
                        }
                    }
                    if (elementPC.hasClass('is-active') && elementPC.css('display') != 'none' || elementMB.hasClass('is-active') && elementMB.css('display') != 'none') {
                        $backdrop.css('display', 'block');
                        clearInterval(checkExist);
                    }
                    clearInterval(checkExist);
                }, 100); // check every 100ms
            });
            var btn_show_more = $('.btn-nav-show_full');
            $(btn_show_more).click(function() {
                var $this = $(this).parents('.atbs-offcanvas');
                var button_hide = $(this).find('i');
                $(this).fadeOut(500);
                if (check_show_more == false) {
                    $($this).addClass('animation');
                    setTimeout(function() {
                        $($this).addClass("show-full");
                        button_hide.attr('class', 'mdicon mdicon-chevron-thin-left');
                        $(btn_show_more).fadeIn(50);
                    }, 600);
                    check_show_more = true;
                } else {
                    $($this).removeClass("show-full");
                    $(this).fadeOut(1000);
                    setTimeout(function() {
                        $($this).removeClass('animation');
                        $(btn_show_more).fadeIn(50);
                        button_hide.attr('class', 'mdicon mdicon-chevron-thin-right');
                    }, 200);
                    check_show_more = false;

                }
            });
        },
        /* ============================================================================
         * Prority+ menu init
         * ==========================================================================*/
        priorityNavInit: function() {
            var $menus = $('.js-priority-nav');
            $menus.each(function() {
                LEONASSCRIPT.priorityNav($(this));
            })
        },

        /* ============================================================================
         * Smart sticky header
         * ==========================================================================*/
        smartAffix: {
            //settings
            $headerPlaceHolder: '', //the affix menu (this element will get the mdAffixed)
            $fixedHeader: '', //the menu wrapper / placeholder
            isDestroyed: false,
            isDisabled: false,
            isFixed: false, //the current state of the menu, true if the menu is affix
            isShown: false,
            windowScrollTop: 0,
            lastWindowScrollTop: 0, //last scrollTop position, used to calculate the scroll direction
            offCheckpoint: 0, // distance from top where fixed header will be hidden
            onCheckpoint: 0, // distance from top where fixed header can show up
            breakpoint: 767, // media breakpoint in px that it will be disabled

            init: function init(options) {

                //read the settings
                this.$fixedHeader = $(options.fixedHeader);
                this.$headerPlaceHolder = $(options.headerPlaceHolder);

                // Check if selectors exist.
                if (!this.$fixedHeader.length || !this.$headerPlaceHolder.length) {
                    this.isDestroyed = true;
                } else if (!this.$fixedHeader.length || !this.$headerPlaceHolder.length || (LEONASSCRIPT.documentOnResize.windowWidth <= LEONASSCRIPT.header.smartAffix.breakpoint)) { // Check if device width is smaller than breakpoint.
                    this.isDisabled = true;
                }

            }, // end init

            compute: function compute() {
                if (LEONASSCRIPT.header.smartAffix.isDestroyed || LEONASSCRIPT.header.smartAffix.isDisabled) {
                    return;
                }

                // Set where from top fixed header starts showing up
                if (!this.$headerPlaceHolder.length) {
                    this.offCheckpoint = 400;
                } else {
                    this.offCheckpoint = $(this.$headerPlaceHolder).offset().top + 400;
                }

                this.onCheckpoint = this.offCheckpoint + 500;

                // Set menu top offset
                this.windowScrollTop = LEONASSCRIPT.documentOnScroll.windowScrollTop;
                if (this.offCheckpoint < this.windowScrollTop) {
                    this.isFixed = true;
                }
            },

            updateState: function updateState() {
                //update affixed state
                if (this.isFixed) {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.addClass('is-fixed');
                    }
                } else {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.removeClass('is-fixed');
                    }
                    $window.trigger('stickyHeaderHidden');
                }

                if (this.isShown) {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.addClass('is-shown');
                    }
                } else {
                    if(this.$fixedHeader.length) {
                        this.$fixedHeader.removeClass('is-shown');
                    }
                }
            },

            /**
             * called by events on scroll
             */
            eventScroll: function eventScroll(scrollTop) {

                var scrollDirection = '';
                var scrollDelta = 0;

                // check the direction
                if (scrollTop != this.lastWindowScrollTop) { //compute direction only if we have different last scroll top

                    // compute the direction of the scroll
                    if (scrollTop > this.lastWindowScrollTop) {
                        scrollDirection = 'down';
                    } else {
                        scrollDirection = 'up';
                    }

                    //calculate the scroll delta
                    scrollDelta = Math.abs(scrollTop - this.lastWindowScrollTop);
                    this.lastWindowScrollTop = scrollTop;

                    // update affix state
                    if (this.offCheckpoint < scrollTop) {
                        this.isFixed = true;
                    } else {
                        this.isFixed = false;
                    }

                    // check affix state
                    if (this.isFixed) {
                        // We're in affixed state, let's do some check
                        if ((scrollDirection === 'down') && (scrollDelta > 14)) {
                            if (this.isShown) {
                                this.isShown = false; // hide menu
                            }
                        } else {
                            if ((!this.isShown) && (scrollDelta > 14) && (this.onCheckpoint < scrollTop)) {
                                this.isShown = true; // show menu
                            }
                        }
                    } else {
                        this.isShown = false;
                    }

                    this.updateState(); // update state
                }
            }, // end eventScroll function

            /**
             * called by events on resize
             */
            eventResize: function eventResize(windowWidth) {
                // Check if device width is smaller than breakpoint.
                if (LEONASSCRIPT.documentOnResize.windowWidth < LEONASSCRIPT.header.smartAffix.breakpoint) {
                    this.isDisabled = true;
                } else {
                    this.isDisabled = false;
                    LEONASSCRIPT.header.smartAffix.compute();
                }
            }
        },
    };

    LEONASSCRIPT.documentOnScroll = {
        ticking: false,
        windowScrollTop: 0, //used to store the scrollTop

        init: function() {
            window.addEventListener('scroll', function(e) {
                if (!LEONASSCRIPT.documentOnScroll.ticking) {
                    window.requestAnimationFrame(function() {
                        LEONASSCRIPT.documentOnScroll.windowScrollTop = $window.scrollTop();

                        // Functions to call here
                        if (!LEONASSCRIPT.header.smartAffix.isDisabled && !LEONASSCRIPT.header.smartAffix.isDestroyed) {
                            LEONASSCRIPT.header.smartAffix.eventScroll(LEONASSCRIPT.documentOnScroll.windowScrollTop);
                        }

                        LEONASSCRIPT.documentOnScroll.goToTopScroll(LEONASSCRIPT.documentOnScroll.windowScrollTop);

                        LEONASSCRIPT.documentOnScroll.ticking = false;
                    });
                }
                LEONASSCRIPT.documentOnScroll.ticking = true;
            });
        },

        /* ============================================================================
         * Go to top scroll event
         * ==========================================================================*/
        goToTopScroll: function(windowScrollTop) {
            if ($goToTopEl.length) {
                if (windowScrollTop > 800) {
                    if (!$goToTopEl.hasClass('is-active')) $goToTopEl.addClass('is-active');
                } else {
                    $goToTopEl.removeClass('is-active');
                }
            }
        },
        /* ============================================================================
         * INFINITY AJAX load more posts
         * ==========================================================================*/
        infinityAjaxLoadPost: function() {

            var loadedPosts = '';
            var ajaxLoadPost = $('.infinity-ajax-load-post');
            var $this;

            function ajaxLoad(parameters, postContainer) {
                var atbsAjaxSecurity = ajax_buff['atbs_security']['atbs_security_code']['content'];
                var ajaxStatus = '',
                    ajaxCall = $.ajax({
                        url: ajaxurl,
                        type: 'post',
                        dataType: 'html',
                        data: {
                            action: parameters.action,
                            args: parameters.args,
                            postOffset: parameters.postOffset,
                            type: parameters.type,
                            moduleInfo: parameters.moduleInfo,
                            securityCheck: atbsAjaxSecurity
                                // other parameters
                        },
                    });
                ajaxCall.done(function(respond) {
                    loadedPosts = $.parseJSON(respond);
                    ajaxStatus = 'success';
                    if (loadedPosts == 'no-result') {
                        postContainer.closest('.infinity-ajax-load-post').addClass('disable-infinity-load');
                        postContainer.closest('.infinity-ajax-load-post').find('.js-ajax-load-post-trigger').addClass('hidden');
                        postContainer.closest('.infinity-ajax-load-post').find('.atbs-no-more-button').removeClass('hidden');
                        return;
                    }
                    if (loadedPosts) {
                        var elToLoad = $(loadedPosts).hide().fadeIn('1500');
                        postContainer.append(elToLoad);
                    }
                    $('html, body').animate({ scrollTop: $window.scrollTop() + 1 }, 0).animate({ scrollTop: $window.scrollTop() - 1 }, 0); // for recalculating of sticky sidebar
                    // do stuff like changing parameters
                });

                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                });

                ajaxCall.always(function() {
                    postContainer.closest('.infinity-ajax-load-post').removeClass('atbs_loading');
                    postContainer.closest('.infinity-ajax-load-post').removeClass('infinity-disable');
                });
            }

            function ajaxLoadInfinitiveScroll() {
                ajaxLoadPost.each(function(index) {
                    $this = $(this);

                    var triggerElement = $this.find('.js-ajax-load-post-trigger');
                    var top_of_element = triggerElement.offset().top;
                    var bottom_of_element = triggerElement.offset().top + triggerElement.outerHeight();
                    var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
                    var top_of_screen = $(window).scrollTop();


                    if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
                        if ($this.hasClass('infinity-disable') || $this.hasClass('disable-infinity-load'))
                            return;

                        $this.addClass('infinity-disable');

                        var $moduleID = $this.closest('.atbs-block').attr('id');
                        var moduleName = $moduleID.split("-")[0];
                        var args = ajax_buff['query'][$moduleID]['args'];

                        var postContainer = $this.find('.posts-list');
                        var moduleInfo = ajax_buff['query'][$moduleID]['moduleInfo'];

                        $this.addClass('atbs_loading');

                        var postOffset = parseInt(args['offset']) + $this.find('article').length;

                        if ($this.closest('.atbs-block').hasClass('atbs_latest_blog_posts')) {
                            var stickPostLength = args['post__not_in'].length;
                            postOffset = postOffset - stickPostLength;
                        }

                        var parameters = {
                            action: moduleName,
                            args: args,
                            postOffset: postOffset,
                            type: 'loadmore',
                            moduleInfo: moduleInfo,
                        };
                        ajaxLoad(parameters, postContainer);

                    }
                });
            }

            $(window).on('scroll', $.debounce(250, ajaxLoadInfinitiveScroll));
        },
        //single Scrolling
        /* ============================================================================
         * Single INFINITY AJAX Load More
         * ==========================================================================*/
        infinityAjaxLoadSinglePost: function() {
            var ajaxLoadPost = $('.single-infinity-scroll');
            var $this;

            function ajaxLoad(parameters, postContainer) {
                var atbsAjaxSecurity = ajax_buff['atbs_security']['atbs_security_code']['content'];
                var ajaxStatus = '',
                    ajaxCall = $.ajax({
                        url: parameters.postURLtoLoad,
                        type: "GET",
                        dataType: "html"
                    });
                ajaxCall.done(function(respond) {

                    if (respond) {
                        var elToLoad = $($(respond).find('.single-infinity-container').html()).hide().fadeIn('1500');
                        postContainer.append(elToLoad);
                        setTimeout(function() {
                            var $stickySidebar = $(postContainer).children().last().find('.js-sticky-sidebar');
                            var $stickyHeader = $('.js-sticky-header');

                            var marginTop = ($stickyHeader.length) ? ($stickyHeader.outerHeight() + 20) : 0; // check if there's sticky header

                            if ($(document.body).hasClass('admin-bar')) // check if admin bar is shown.
                                marginTop += 32;
                            if ($stickySidebar.length > 0) {
                                if ($.isFunction($.fn.theiaStickySidebar)) {
                                    $stickySidebar.theiaStickySidebar({
                                        additionalMarginTop: marginTop,
                                        additionalMarginBottom: 20,
                                    });
                                }
                            }
                            //React
                            var reactions = $(postContainer).children().last().find('.js-atbs-reaction');
                            LEONASSCRIPT.ATBS_reaction.atbs_reaction(reactions);

                        }, 250); // wait a bit for precise height;

                        // Run Photorama
                        setTimeout(function() {
                            var galleryPhotorama = $(postContainer).children().last().find('.fotorama');
                            if (galleryPhotorama.length > 0) {
                                $(galleryPhotorama).fotorama();
                            }
                        }, 250); // wait a bit for precise height;
                    }

                });
                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                });
                ajaxCall.always(function() {
                    $this.removeClass('infinity-disable');
                    var triggerElement = $this.find('.infinity-single-trigger');
                    if (!triggerElement.length) {
                        return;
                    }
                });
            }

            function ajaxLoadInfinitiveScroll() {

                $this = ajaxLoadPost;
                var triggerElement = $this.find('.infinity-single-trigger');
                if (!triggerElement.length) {
                    return;
                }

                var top_of_element = triggerElement.offset().top;
                var bottom_of_element = triggerElement.offset().top + triggerElement.outerHeight();
                var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
                var top_of_screen = $(window).scrollTop();

                if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
                    if ($this.hasClass('infinity-disable'))
                        return;

                    $this.addClass('infinity-disable');
                    var postURLtoLoad = $this.find('.single-infinity-inner').last().data('url-to-load');
                    var postContainer = $this.find('.single-infinity-container');

                    var parameters = {
                        postURLtoLoad: postURLtoLoad,
                    };
                    ajaxLoad(parameters, postContainer);

                }
            }

            $(window).on('scroll', $.debounce(250, ajaxLoadInfinitiveScroll));
        },
    };

    LEONASSCRIPT.documentOnResize = {
        ticking: false,
        windowWidth: $window.width(),

        init: function() {
            window.addEventListener('resize', function(e) {
                if (!LEONASSCRIPT.documentOnResize.ticking) {
                    window.requestAnimationFrame(function() {
                        LEONASSCRIPT.documentOnResize.windowWidth = $window.width();

                        // Functions to call here
                        if (!LEONASSCRIPT.header.smartAffix.isDestroyed) {
                            LEONASSCRIPT.header.smartAffix.eventResize(LEONASSCRIPT.documentOnResize.windowWidth);
                        }

                        LEONASSCRIPT.clippedBackground();

                        LEONASSCRIPT.documentOnResize.ticking = false;
                    });
                }
                LEONASSCRIPT.documentOnResize.ticking = true;
            });
        },
    };
    /* ============================================================================
     * Reaction
     * ==========================================================================*/
    LEONASSCRIPT.ATBS_reaction = {
        init: function() {
            var reactions = $('.js-atbs-reaction');
            LEONASSCRIPT.ATBS_reaction.atbs_reaction(reactions);
        },
        /**/
        atbs_reaction: function(reactions) {
            reactions.each(function() {
                var reaction_col = $(this).find('.atbs-reactions-col');

                function react(reactionItem) {
                    var reactionType = reactionItem.data('reaction-type');
                    var reaction_content = reactionItem.find('.atbs-reactions-content');
                    var reactionStatus = '';
                    if (reactionItem.find('.atbs-reactions-image').hasClass("active")) {
                        reactionStatus = 'active';
                    } else {
                        reactionStatus = 'non-active';
                    }
                    if (reactionItem.find('.atbs-reactions-image').hasClass("active")) {
                        reactionItem.find('.atbs-reactions-image').removeClass("active");
                        reactionItem.find('.atbs-reactions-image').removeClass("scale-icon");

                    } else {
                        reactionItem.find('.atbs-reactions-image').addClass("active");
                        reactionItem.find('.atbs-reactions-image').addClass("scale-icon");
                    }
                    if (reaction_content.hasClass("active")) {
                        reaction_content.removeClass("active");
                        reaction_content.removeClass("scale-count");
                    } else {
                        reaction_content.addClass("active");
                        reaction_content.addClass("scale-count");
                    }
                    LEONASSCRIPT.ATBS_reaction.ajaxLoad(reactionItem, reactionType, reactionStatus);
                }
                // On Click
                reaction_col.on('click', function() {
                    react($(this));
                });
                // Keyboard Accessibility
                reaction_col.keypress(function(e) {
                    e.preventDefault(); // Prevent scrolling when press 'Space'
                    var key = e.which;
                    if ((key == 13) || (key == 32)) { // 13: Enter, 32: Space (key code)
                        react($(this));
                        return;
                    }
                });
            });
        },
        ajaxLoad: function(reaction, reactionType, reactionStatus) {
            var $this = reaction;
            var reaction_content = $this.find('.atbs-reactions-content');
            var atbsAjaxSecurity = ajax_buff['atbs_security']['atbs_security_code']['content'];
            var postID = reaction.closest('.js-atbs-reaction').data('article-id');
            var ajaxCall = $.ajax({
                url: ajaxurl,
                type: 'post',
                dataType: 'html',
                data: {
                    action: 'atbs_ajax_reaction',
                    postID: postID,
                    reactionType: reactionType,
                    reactionStatus: reactionStatus,
                    securityCheck: atbsAjaxSecurity,
                },
            });
            ajaxCall.done(function(respond) {
                var results = $.parseJSON(respond);
                $this.find('.atbs-reaction-count').html(results);
            });
            ajaxCall.fail(function() {
            });
            ajaxCall.always(function() {
                if ($this.find('.atbs-reactions-image').hasClass("active")) {
                    $this.find('.atbs-reactions-image').removeClass("scale-icon");
                }
                if (reaction_content.hasClass("active")) {
                    reaction_content.removeClass("scale-count");
                }
            });
        },
    }
    LEONASSCRIPT.documentOnReady = {

        init: function() {
            LEONASSCRIPT.header.init();
            LEONASSCRIPT.header.smartAffix.compute();
            LEONASSCRIPT.documentOnScroll.init();
            LEONASSCRIPT.documentOnReady.ajaxLoadPost();
            LEONASSCRIPT.documentOnReady.optimizeAnimation();
            LEONASSCRIPT.documentOnReady.themeSwitch();
            LEONASSCRIPT.documentOnScroll.infinityAjaxLoadPost();
            LEONASSCRIPT.documentOnScroll.infinityAjaxLoadSinglePost();
            LEONASSCRIPT.documentOnReady.scrollSingleCountPercent();
            LEONASSCRIPT.documentOnReady.carousel_1i();
            LEONASSCRIPT.documentOnReady.atbs_slider_wArrowImg();
            LEONASSCRIPT.documentOnReady.carousel_1i30m();
            LEONASSCRIPT.documentOnReady.carousel_2i4m();
            LEONASSCRIPT.documentOnReady.carousel_3i();
            LEONASSCRIPT.documentOnReady.carousel_3i4m();
            LEONASSCRIPT.documentOnReady.carousel_3i4m_small();
            LEONASSCRIPT.documentOnReady.carousel_headingAside_3i();
            LEONASSCRIPT.documentOnReady.carousel_4i();
            LEONASSCRIPT.documentOnReady.carousel_4i20m();
            LEONASSCRIPT.documentOnReady.carousel_4i30m();
            LEONASSCRIPT.documentOnReady.carousel_overlap();
            LEONASSCRIPT.documentOnReady.customCarouselNav();
            LEONASSCRIPT.documentOnReady.carousel_center();
            LEONASSCRIPT.documentOnReady.carousel_3i15m();
            LEONASSCRIPT.documentOnReady.carousel_3i40m();
            LEONASSCRIPT.documentOnReady.countdown();
            LEONASSCRIPT.documentOnReady.goToTop();
            LEONASSCRIPT.documentOnReady.lightBox();
            LEONASSCRIPT.documentOnReady.perfectScrollbarInit();
            LEONASSCRIPT.documentOnReady.tooltipInit();
            LEONASSCRIPT.ATBS_reaction.init();
            LEONASSCRIPT.documentOnReady.setSubMenuPosition();
            LEONASSCRIPT.documentOnReady.searchToggle();
        },

        /* ============================================================================
         * Dark Mode & Light Mode
         * ==========================================================================*/
        themeSwitch: function() {
            const darkModeEnabled = Number(dark_mode_buff['dark_mode_enabled']);
            if (!darkModeEnabled) {
                return;
            }

            const siteWrapper = $('.site-wrapper'),
                theme_switch = $('.atbs-theme-switch'),
                darkModeDefault = Number(dark_mode_buff['dark_mode_default']),
                darkModeCookieName = dark_mode_buff['dark_mode_cookie_name'];

            function toggleDarkMode(status) {
                if (status == 'on') {
                    theme_switch.addClass('active');
                    siteWrapper.addClass('atbs-dark-mode');
                    setCookie(darkModeCookieName, 1, 30); // Save data
                } else {
                    theme_switch.removeClass('active');
                    siteWrapper.removeClass('atbs-dark-mode');
                    setCookie(darkModeCookieName, 0, 30); // Save data
                }
            }

            function updateDarkMode() {
                var darkMode = getCookie(darkModeCookieName);

                // Optimize animation

                if (darkMode == 1) {
                    toggleDarkMode('off');
                } else {
                    toggleDarkMode('on');
                }
            }

            function init() {
                var darkMode = getCookie(darkModeCookieName);
                // Turn on Dark Mode by default if is set in Theme Option
                if (darkModeDefault && (darkMode == '')) {
                    toggleDarkMode('on');
                }

                theme_switch.each(function() {
                    $(this).on('click', updateDarkMode);
                });
            }

            init(); // initialize
        },

        /* ============================================================================
         * Optimize Animation using will-change
         * ==========================================================================*/
        optimizeAnimation: function() {
            // Mega Menu
            $('.atbs-mega-menu').each(function() {
                var _this = $(this),
                    menuItem = _this.parent('.menu-item');
                menuItem.on('mouseenter', function() {
                    _this.css('will-change', 'transform, opacity, visibility');
                });
                menuItem.on('mouseleave', function() {
                    _this.css('will-change', 'auto');
                });
            });
        },

        setSubMenuPosition: function() {
            // Clear all old settings
            $('.menu-item-has-left-sub-menu').removeClass('menu-item-has-left-sub-menu');

            var subMenus = [
                $('.site-header .navigation--main .sub-menu .menu-item-has-children'),
                $('.sticky-header .navigation--main .sub-menu .menu-item-has-children'),
                $('.top-bar__nav .sub-menu .menu-item-has-children'),
            ];
            // For each navigation menu
            $.each(subMenus, function() {
                var directionRight = true;
                // For each menu item
                $(this).each(function() {
                    var _this = $(this),
                        inMegaMenu = _this.parents('.atbs-mega-menu').length,
                        subMenu = _this.children('.sub-menu:first');

                    if (!inMegaMenu) {
                        if (!inViewport(subMenu, 'x') || !directionRight) {
                            _this.addClass('menu-item-has-left-sub-menu');
                            directionRight = false;
                        }

                        // Double check to make sure sub menu is in viewport
                        if (!inViewport(subMenu, 'x') && !directionRight) {
                            _this.removeClass('menu-item-has-left-sub-menu');
                            directionRight = true;
                        }
                    }
                });
            });
        },
        /* ============================================================================
         * Single scroll percent
         * ==========================================================================*/
        scrollSingleCountPercent: function() {
            var lastWindowScrollTop = 0;
            var scrollDirection = '';
            var elemnt_scroll = $('.element-scroll-percent');
            if (elemnt_scroll.length > 0) {
                var ofsetTop_element_scroll;
                var ofsetBottom_element_scroll;
                var progressValue = $('.progress__value');
                var progressValueMobile = $('.scroll-count-percent-mobile .percent-number');
                var percentNumberText = $('.percent-number').find('.percent-number-text');
                var RADIUS = 54;
                var CIRCUMFERENCE = 2 * Math.PI * RADIUS;
                var docHeight = 0;
                $(progressValue).css({ 'stroke-dasharray': CIRCUMFERENCE });
                var reading_indicator = $('.scroll-count-percent');
                progress(0);
                $(percentNumberText).html(0);
                $(progressValueMobile).css({ 'width': '0px' });
                $(window).scroll(function(e) {
                    elemnt_scroll = $('.element-scroll-percent');

                    if (elemnt_scroll.hasClass('post-content-100-percent')) {
                        var theContentPercent = elemnt_scroll.find('.single-body--content');
                        theContentPercent.each(function() {
                            var theJourney = $(window).scrollTop() - $(this).offset().top;
                            if ((theJourney > 0) && (theJourney <= $(this).height())) {
                                ofsetTop_element_scroll = $(this).offset().top;
                                ofsetBottom_element_scroll = ofsetTop_element_scroll + $(this).height();
                                docHeight = $(this).height();
                            }
                        });
                    } else {
                        elemnt_scroll.each(function() {
                            var theJourney = $(window).scrollTop() - $(this).offset().top;
                            if ((theJourney > 0) && (theJourney <= $(this).height())) {
                                ofsetTop_element_scroll = $(this).offset().top;
                                ofsetBottom_element_scroll = ofsetTop_element_scroll + $(this).height();
                                docHeight = $(this).height();
                            }
                        });
                    }

                    if (docHeight == 0) {
                        return false;
                    }

                    if (($(window).scrollTop() >= ofsetTop_element_scroll)) {
                        $('.scroll-count-percent').addClass('active');
                    } else {
                        $('.scroll-count-percent').removeClass('active');
                    }
                    var windowScrollTop = $(window).scrollTop();
                    var scrollPercent = (windowScrollTop - ofsetTop_element_scroll) / (docHeight);
                    var scrollPercentRounded = Math.round(scrollPercent * 100);
                    if (scrollPercentRounded <= 0) {
                        scrollPercentRounded = 0;
                    } else if (scrollPercentRounded >= 100) {
                        scrollPercentRounded = 100;
                        $('.scroll-count-percent').removeClass('active');
                    }
                    progress(scrollPercentRounded);
                    $(percentNumberText).html(scrollPercentRounded);
                    $(progressValueMobile).css({ 'width': scrollPercentRounded + '%' });
                    lastWindowScrollTop = $(window).scrollTop();
                });
            }

            function progress(value) {
                var progress = value / 100;
                var dashoffset = CIRCUMFERENCE * (1 - progress);
                $(progressValue).css({ 'stroke-dashoffset': dashoffset });
            }
        },

        /* ============================================================================
         * Header dropdown search
         * ==========================================================================*/
        searchToggle: function() {

            var $searchDropdownToggle = $('.js-search-toggle');
            var panel = $('.atbs-leonas-search-full-style-2');
            var closeBtn = $('#atbs-leonas-search-close');
            $searchDropdownToggle.on('click', function() {
                panel.addClass('is-open');
            });
            closeBtn.on('click', function() {
                if (panel.hasClass('is-open')) {
                    panel.removeClass('is-open');
                }
            });

        },

        /* ============================================================================
         * AJAX load more posts
         * ==========================================================================*/
        ajaxLoadPost: function() {
            var loadedPosts = '';
            var $ajaxLoadPost = $('.js-ajax-load-post');
            var $this;

            function ajaxLoad(parameters, $postContainer) {
                var atbsAjaxSecurity = ajax_buff['atbs_security']['atbs_security_code']['content'];
                var ajaxStatus = '',
                    ajaxCall = $.ajax({
                        url: ajaxurl,
                        type: 'post',
                        dataType: 'html',
                        data: {
                            action: parameters.action,
                            args: parameters.args,
                            postOffset: parameters.postOffset,
                            type: parameters.type,
                            moduleInfo: parameters.moduleInfo,
                            the__lastPost: parameters.the__lastPost,
                            securityCheck: atbsAjaxSecurity
                                // other parameters
                        },
                    });
                ajaxCall.done(function(respond) {
                    loadedPosts = $.parseJSON(respond);
                    ajaxStatus = 'success';
                    if (loadedPosts == 'no-result') {
                        $postContainer.closest('.js-ajax-load-post').addClass('disable-click');
                        $postContainer.closest('.js-ajax-load-post').find('.js-ajax-load-post-trigger').addClass('hidden');
                        $postContainer.closest('.js-ajax-load-post').find('.atbs-no-more-button').removeClass('hidden');
                        return;
                    }
                    if (loadedPosts) {
                        var elToLoad = $(loadedPosts).hide().fadeIn('1500');
                        $postContainer.append(elToLoad);
                    }
                    $('html, body').animate({ scrollTop: $window.scrollTop() + 1 }, 0).animate({ scrollTop: $window.scrollTop() - 1 }, 0); // for recalculating of sticky sidebar
                    // do stuff like changing parameters
                });

                ajaxCall.fail(function() {
                    ajaxStatus = 'failed';
                });

                ajaxCall.always(function() {
                    $postContainer.closest('.js-ajax-load-post').removeClass('atbs_loading');
                });
            }

            $ajaxLoadPost.each(function() {
                $this = $(this);
                var $moduleID = $this.closest('.atbs-block').attr('id');

                var moduleName = $moduleID.split("-")[0];
                var $triggerBtn = $this.find('.js-ajax-load-post-trigger');
                var args = ajax_buff['query'][$moduleID]['args'];

                var $postContainer = $this.find('.posts-list');
                var moduleInfo = ajax_buff['query'][$moduleID]['moduleInfo'];

                $triggerBtn.on('click', function() {
                    $this = $(this).closest('.js-ajax-load-post');
                    if ($this.hasClass('disable-click'))
                        return;
                    $this.addClass('atbs_loading');
                    var postOffset = parseInt(args['offset']) + $this.find('article').length;

                    if ($this.closest('.atbs-block').hasClass('atbs_latest_blog_posts')) {
                        var stickPostLength = args['post__not_in'].length;
                        postOffset = postOffset - stickPostLength;
                    }
                    var the__lastPost = $this.find('article').length;

                    var parameters = {
                        action: moduleName,
                        args: args,
                        postOffset: postOffset,
                        type: 'loadmore',
                        moduleInfo: moduleInfo,
                        the__lastPost: the__lastPost,
                    };
                    ajaxLoad(parameters, $postContainer);
                });
            });
        },
        /* ============================================================================
         * Carousel funtions Custom
         * ==========================================================================*/
        carousel_1i: function() {
            var $carousels = $('.js-carousel-1i');
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                });
            })
        },
        atbs_slider_wArrowImg: function() {
            var atbsArrows = ajax_buff['atbsArrows']['sliderArrows']['content'];
            var $carousels = $('.js-atbs-wArrowImg');
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 0,
                    nav: true,
                    loop: true,
                    dots: false,
                    lazyLoad: true,
                    autoHeight: true,
                    navText: ['<img src="' + atbsArrows['light-prev'] + '" alt="left" class="left-arrow ">', '<img src="' + atbsArrows['light-next'] + '" alt="left" class="left-arrow ">'],
                    smartSpeed: 500,
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 1,
                        },
                    },
                });
            })
        },
        carousel_center: function() {
            var $carousels = $('.js-carousel-center');
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 2,
                    margin: 4,
                    loop: true,
                    nav: true,
                    center: true,
                    dots: false,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },
                    },
                });
            })
        },

        carousel_1i30m: function() {
            var $carousels = $('.js-carousel-1i30m');
            $carousels.each(function() {
                $(this).owlCarousel({
                    items: 1,
                    margin: 30,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoHeight: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    smartSpeed: 500,
                });
            })
        },

        carousel_overlap: function() {
            var $carousels = $('.js-atbs-carousel-overlap');
            $carousels.each(function() {
                var $carousel = $(this);
                $carousel.flickity({
                    wrapAround: true,
                });

                $carousel.on('staticClick.flickity', function(event, pointer, cellElement, cellIndex) {
                    if ((typeof cellIndex === 'number') && ($carousel.data('flickity').selectedIndex != cellIndex)) {
                        $carousel.flickity('selectCell', cellIndex);
                    }
                });
            })
        },

        carousel_2i4m: function() {
            var $carousels = $('.js-carousel-2i4m');
            $carousels.each(function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 2,
                    margin: 4,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },
                    },
                });
            })
        },

        carousel_3i: function() {
            var $carousels = $('.js-carousel-3i');
            $carousels.each(function() {
                $(this).owlCarousel({
                    loop: true,
                    nav: true,
                    dots: false,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            })
        },

        carousel_3i4m: function() {
            var $carousels = $('.js-carousel-3i4m');
            $carousels.each(function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    margin: 4,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            })
        },

        carousel_3i4m_small: function() {
            var $carousels = $('.js-carousel-3i4m-small');
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 4,
                    loop: false,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    autoHeight: true,
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        1200: {
                            items: 3,
                        },
                    },
                });
            })
        },

        carousel_headingAside_3i: function() {
            var $carousels = $('.js-atbs-carousel-heading-aside-3i');
            $carousels.each(function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    margin: 20,
                    nav: false,
                    dots: false,
                    loop: carousel_loop,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0: {
                            items: 1,
                            margin: 10,
                            stagePadding: 40,
                            loop: false,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },
                    },
                });
            })
        },

        customCarouselNav: function() {
            if ($.isFunction($.fn.owlCarousel)) {
                var $carouselNexts = $('.js-carousel-next');
                $carouselNexts.each(function() {
                    var carouselNext = $(this);
                    var carouselID = carouselNext.parent('.atbs-carousel-nav-custom-holder').attr('data-carouselID');
                    var $carousel = $('#' + carouselID);

                    carouselNext.on('click', function() {
                        $carousel.trigger('next.owl.carousel');
                    });
                });

                var $carouselPrevs = $('.js-carousel-prev');
                $carouselPrevs.each(function() {
                    var carouselPrev = $(this);
                    var carouselID = carouselPrev.parent('.atbs-carousel-nav-custom-holder').attr('data-carouselID');
                    var $carousel = $('#' + carouselID);

                    carouselPrev.on('click', function() {
                        $carousel.trigger('prev.owl.carousel');
                    });
                });
            }
        },

        carousel_4i: function() {
            var $carousels = $('.js-carousel-4i');

            $carousels.each(function() {
                $(this).owlCarousel({
                    loop: true,
                    nav: true,
                    dots: false,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 4,
                        },
                    },
                });
            })
        },

        carousel_4i20m: function() {
            var $carousels = $('.js-carousel-4i20m');

            $carousels.each(function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 4,
                    margin: 20,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },

                        992: {
                            items: 3,
                        },

                        1199: {
                            items: 4,
                        },
                    },
                });
            })
        },
        carousel_4i30m: function() {
            var $carousels = $('.js-carousel-4i30m');
            $carousels.each(function() {
                var carousel_loop = $(this).data('carousel-loop');
                $(this).owlCarousel({
                    items: 4,
                    margin: 30,
                    loop: carousel_loop,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                        },
                        992: {
                            items: 3,
                        },
                        1199: {
                            items: 4,
                        },
                    },
                });
            })
        },
        carousel_3i40m: function() {
            var $carousels = $('.js-carousel-3i40m');
            $carousels.each(function() {
                $(this).owlCarousel({
                    margin: 40,
                    loop: true,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        481: {
                            margin: 30,
                            items: 2,
                        },

                        991: {
                            margin: 30,
                            items: 3,
                        },

                        1024: {
                            items: 2,
                        },

                        1199: {
                            items: 2,
                        },

                        1200: {
                            items: 3,
                        }
                    },
                });
            })
        },
        carousel_3i15m: function() {
            var $carousels = $('.js-carousel-3i15m');
            $carousels.each(function() {
                $(this).owlCarousel({
                    autoHeight: true,
                    loop: true,
                    nav: true,
                    dots: true,
                    navText: ['<i class="mdicon mdicon-navigate_before"></i>', '<i class="mdicon mdicon-navigate_next"></i>'],
                    responsive: {
                        0: {
                            items: 1,
                        },

                        768: {
                            items: 2,
                            margin: 30,
                        },
                        992: {
                            margin: 30,
                        },
                        1199: {
                            items: 2,
                            margin: 30,
                        },

                        1200: {
                            items: 3,
                            margin: 30,
                        }
                    },
                });
            })
        },

        /* ============================================================================
         * Countdown timer
         * ==========================================================================*/
        countdown: function() {
            if ($.isFunction($.fn.countdown)) {
                var $countdown = $('.js-countdown');

                $countdown.each(function() {
                    var $this = $(this);
                    var finalDate = $this.data('countdown');

                    $this.countdown(finalDate, function(event) {
                        $(this).html(event.strftime('' +
                            '<div class="countdown__section"><span class="countdown__digit">%-D</span><span class="countdown__text meta-font">day%!D</span></div>' +
                            '<div class="countdown__section"><span class="countdown__digit">%H</span><span class="countdown__text meta-font">hr</span></div>' +
                            '<div class="countdown__section"><span class="countdown__digit">%M</span><span class="countdown__text meta-font">min</span></div>' +
                            '<div class="countdown__section"><span class="countdown__digit">%S</span><span class="countdown__text meta-font">sec</span></div>'));
                    });
                });
            };
        },

        /* ============================================================================
         * Scroll top
         * ==========================================================================*/
        goToTop: function() {
            if ($goToTopEl.length) {
                $goToTopEl.on('click', function() {
                    $('html,body').stop(true).animate({ scrollTop: 0 }, 400);
                    return false;
                });
            }
        },

        /* ============================================================================
         * Lightbox
         * ==========================================================================*/
        lightBox: function() {
            if ($.isFunction($.fn.magnificPopup)) {
                var $imageLightbox = $('.js-atbs-lightbox-image');
                var $galleryLightbox = $('.js-atbs-lightbox-gallery');

                $imageLightbox.magnificPopup({
                    type: 'image',
                    mainClass: 'mfp-zoom-in',
                    removalDelay: 80,
                });

                $galleryLightbox.each(function() {
                    $(this).magnificPopup({
                        delegate: '.gallery-icon > a',
                        type: 'image',
                        gallery: {
                            enabled: true,
                        },
                        mainClass: 'mfp-zoom-in',
                        removalDelay: 80,
                    });
                });
            }
        },

        /* ============================================================================
         * Custom scrollbar
         * ==========================================================================*/
        perfectScrollbarInit: function() {
            if ($.isFunction($.fn.perfectScrollbar)) {
                var $area = $('.js-perfect-scrollbar');

                $area.perfectScrollbar({
                    wheelPropagation: true,
                    swipeEasing: true,
                });
            }
        },

        /* ============================================================================
         * Sticky sidebar
         * ==========================================================================*/
        stickySidebar: function() {
            setTimeout(function() {
                var $stickySidebar = $('.js-sticky-sidebar');
                var $stickyHeader = $('.js-sticky-header');

                var marginTop = ($stickyHeader.length) ? ($stickyHeader.outerHeight() + 20) : 0; // check if there's sticky header

                if ($(document.body).hasClass('admin-bar')) // check if admin bar is shown.
                    marginTop += 32;

                if ($.isFunction($.fn.theiaStickySidebar)) {
                    $stickySidebar.theiaStickySidebar({
                        additionalMarginTop: marginTop,
                        additionalMarginBottom: 20,
                    });
                }
            }, 250); // wait a bit for precise height;
            var $stickySidebarMobileFixed = $('.js-sticky-sidebar.atbs-sub-col--mobile-fixed');
            $stickySidebarMobileFixed.each(function() {
                var $this = $(this);
                var $drop_sub_col = $($this).find('.drop-sub-col');
                var $open_sub_col = $($this).find('.open-sub-col');
                setTimeout(function() {
                    $($this).append('<div class="drop-sub-col"></div>');
                    $($this).append('<div class="open-sub-col">What news <i class="mdicon mdicon-arrow_forward"></i></div>');

                    var checkExist = setInterval(function() {
                        if ($drop_sub_col && $open_sub_col) {
                            $drop_sub_col = $($this).find('.drop-sub-col');
                            $open_sub_col = $($this).find('.open-sub-col');
                            $drop_sub_col.on('click', function() {
                                $($this).removeClass('active');
                            });
                            $open_sub_col.on('click', function() {
                                $($this).addClass('active');
                            });
                            clearInterval(checkExist);
                        }
                    }, 100); // check every 100ms

                }, 250);
            });
        },

        /* ============================================================================
         * Bootstrap tooltip
         * ==========================================================================*/
        tooltipInit: function() {
            var $element = $('[data-toggle="tooltip"]');

            $element.tooltip();
        },
    };

    LEONASSCRIPT.documentOnLoad = {

        init: function() {
            LEONASSCRIPT.clippedBackground();
            LEONASSCRIPT.header.smartAffix.compute(); //recompute when all the page + logos are loaded
            LEONASSCRIPT.header.smartAffix.updateState(); // update state
            LEONASSCRIPT.header.stickyNavbarPadding(); // fix bootstrap modal backdrop causes sticky navbar to shift
            LEONASSCRIPT.documentOnReady.stickySidebar();
        }

    };

    /* ============================================================================
     * Blur background mask
     * ==========================================================================*/
    LEONASSCRIPT.clippedBackground = function() {

        if ($overlayBg.length) {

            $overlayBg.each(function() {

                var $mainArea = $(this).find('.js-overlay-bg-main-area');
                if (!$mainArea.length) {
                    $mainArea = $(this);
                }

                var $subArea = $(this).find('.js-overlay-bg-sub-area');
                var $subBg = $(this).find('.js-overlay-bg-sub');
                if (!$subArea.length) {
                    return;
                }
                if (!$subBg.length) {
                    return;
                }
                var leftOffset = $mainArea.offset().left - $subArea.offset().left;
                var topOffset = $mainArea.offset().top - $subArea.offset().top;

                $subBg.css('display', 'block');
                $subBg.css('position', 'absolute');
                $subBg.css('width', $mainArea.outerWidth() + 'px');
                $subBg.css('height', $mainArea.outerHeight() + 'px');
                $subBg.css('left', leftOffset + 'px');
                $subBg.css('top', topOffset + 'px');
            });
        };
    }

    /* ============================================================================
     * Priority+ menu
     * ==========================================================================*/
    LEONASSCRIPT.priorityNav = function($menu) {
        var $btn = $menu.find('button');
        var $menuWrap = $menu.find('.navigation');
        var $menuItem = $menuWrap.children('li');
        var hasMore = false;
        var onLoadTry = 1;

        if (!$menuWrap.length) {
            return;
        }

        function calcWidth() {
            if ($menuWrap[0].getBoundingClientRect().width === 0)
                return;

            var navWidth = 0;

            $menuItem = $menuWrap.children('li');
            $menuItem.each(function() {
                navWidth += $(this)[0].getBoundingClientRect().width;
            });

            if (hasMore) {
                var $more = $menu.find('.priority-nav__more');
                var moreWidth = $more[0].getBoundingClientRect().width;
                var availableSpace = $menu[0].getBoundingClientRect().width;

                //Remove the padding width (assumming padding are px values)
                availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
                //Remove the border width
                availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

                if (navWidth > availableSpace) {
                    var $menuItems = $menuWrap.children('li:not(.priority-nav__more)');
                    var itemsToHideCount = 1;

                    $($menuItems.get().reverse()).each(function(index) {
                        navWidth -= $(this)[0].getBoundingClientRect().width;
                        if (navWidth > availableSpace) {
                            itemsToHideCount++;
                        } else {
                            return false;
                        }
                    });

                    var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

                    $itemsToHide.each(function(index) {
                        $(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
                    });

                    $itemsToHide.prependTo($more.children('ul'));
                } else {
                    var $moreItems = $more.children('ul').children('li');
                    var itemsToShowCount = 0;

                    if ($moreItems.length === 1) { // if there's only 1 item in "More" dropdown
                        if (availableSpace >= (navWidth - moreWidth + $moreItems.first().data('width'))) {
                            itemsToShowCount = 1;
                        }
                    } else {
                        $moreItems.each(function(index) {
                            navWidth += $(this).data('width');
                            if (navWidth <= availableSpace) {
                                itemsToShowCount++;
                            } else {
                                return false;
                            }
                        });
                    }

                    if (itemsToShowCount > 0) {
                        var $itemsToShow = $moreItems.slice(0, itemsToShowCount);

                        $itemsToShow.insertBefore($menuWrap.children('.priority-nav__more'));
                        $moreItems = $more.children('ul').children('li');

                        if ($moreItems.length <= 0) {
                            $more.remove();
                            hasMore = false;
                        }
                    }
                }
            } else {
                var $more = $('<li class="priority-nav__more"><a href="#"><span>More</span><i class="mdicon mdicon-more_vert"></i></a><ul class="sub-menu"></ul></li>');
                var availableSpace = $menu[0].getBoundingClientRect().width;

                //Remove the padding width (assumming padding are px values)
                availableSpace -= (parseInt($menu.css("padding-left"), 10) + parseInt($menu.css("padding-right"), 10));
                //Remove the border width
                availableSpace -= ($menu.outerWidth(false) - $menu.innerWidth());

                if (navWidth > availableSpace) {
                    var $menuItems = $menuWrap.children('li');
                    var itemsToHideCount = 1;

                    $($menuItems.get().reverse()).each(function(index) {
                        navWidth -= $(this)[0].getBoundingClientRect().width;
                        if (navWidth > availableSpace) {
                            itemsToHideCount++;
                        } else {
                            return false;
                        }
                    });

                    var $itemsToHide = $menuWrap.children('li:not(.priority-nav__more)').slice(-itemsToHideCount);

                    $itemsToHide.each(function(index) {
                        $(this).attr('data-width', $(this)[0].getBoundingClientRect().width);
                    });

                    $itemsToHide.prependTo($more.children('ul'));
                    $more.appendTo($menuWrap);
                    hasMore = true;
                    if (onLoadTry) {
                        calcWidth();
                        onLoadTry--;
                    }
                }
            }
        }

        $window.on('load webfontLoaded', calcWidth);
        $window.on('resize', $.throttle(50, calcWidth));
    }

    $document.ready(LEONASSCRIPT.documentOnReady.init);
    $window.on('load', LEONASSCRIPT.documentOnLoad.init);
    $window.on('resize', LEONASSCRIPT.documentOnResize.init);

})(jQuery);