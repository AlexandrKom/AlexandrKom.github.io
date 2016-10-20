// слайдер
(function($) {
    $(function() {
        $('nav.slider--nav').on('click', 'li:not(.active)', function() {
            $(this)
                .addClass('active').siblings().removeClass('active').closest('div.slider--content-box').find('section.slider--content').removeClass('active').eq($(this).index()).addClass('active');
        });
    });
})(jQuery);


