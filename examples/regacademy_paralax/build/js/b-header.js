$( function() {
    $('.b-header__menu-toggle').on( 'click', function() {
        $('.b-menu')
            .toggleClass('b-menu_status_visible')
            .removeClass('b-menu_submenu_opened')
            .removeClass('b-menu_transition_off');

        $('.b-page').removeClass('b-page_submenu_opened');

        return false;
    } );

    $( document ).on( 'click', function( e ){
        if ( !$( e.target ).closest('.b-menu__width-wrapper').length ) {
            $('.b-menu').removeClass('b-menu_status_visible');
        }
    } );

    $( '.b-menu__link' ).on( 'click', function( e ){
        if ( $( e.target ).closest('.b-menu__width-wrapper').length ) {
            $('.b-menu').removeClass('b-menu_status_visible');
        }
    } );
    
} );