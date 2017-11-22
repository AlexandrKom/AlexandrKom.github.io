
var map,
    objectManager,
    layerName = "user#layer";


ymaps.ready(onReady);

function onReady () {
    setupLayer();
    setupMap();
    inf();
    chetX();
    chetY();
    perechetXY();
}

function setupLayer () {
    var Layer = function () {
        var layer = new ymaps.Layer("./%z/%x-%y.jpg", {
          // tileTransparent: true,
            notFoundTile: "./err/err.jpeg"
        });
        layer.getZoomRange = function () {
            return ymaps.vow.resolve([4, 6]);
        };
        layer.getCopyrights = function () {
            return ymaps.vow.resolve("lif-mmo.ru!");
        };
        return layer;
    };
    ymaps.layer.storage.add(layerName, Layer);
    var mapType = new ymaps.MapType(layerName, [layerName]);
    ymaps.mapType.storage.add(layerName, mapType);
}

function setupMap () {
    map = new ymaps.Map('map', {
        center: [0, 0],
        zoom: 4,
        controls: [],
        type: layerName
    },
        {
        suppressMapOpenBlock: true,
        balloonMaxWidth: 600,
        searchControlProvider: 'yandex#search',
        projection: new ymaps.projection.Cartesian([[-100,-100], [100,100]], [false, false]),
        restrictMapArea:[[-110,-110],[110,110]]
        }
    );

   map.behaviors.disable("dblClickZoom");
 //  map.options.set('scrollZoomSpeed', 5);
 //   inf(map);
    /*
     var button = new ymaps.control.Button({
         data: {
             // Зададим иконку для кнопки
             image: 'images/house.png',
             // Текст на кнопке.
             content: 'Сохранить',
             // Текст всплывающей подсказки.
             title: 'Нажмите для сохранения маршрута'
         }
     }

    // {
         // Зададим опции для кнопки.
    //     selectOnClick: true
   //  }
     );
     button.events.add(['select'], function () {
         console.log("Кнопка нажата");
     });
     button.events.add(['deselect'], function () {
         console.log("Кнопка отжата");
     });

     map.controls.add(button, {top: 5, right: 5});
 */

    $.getJSON("php/vivodpointsmap.php",
        function(json){

           for (i = 0; i < json.markers.length; i++) {
               var lat=json.markers[i].lat;
               var lon=json.markers[i].lon;
               /*
               var myCollect = new ymaps.GeoObjectCollection({});
               myCollect.add(new ymaps.Placemark([json.markers[i].lat,json.markers[i].lon], {
                   // Свойства
                   iconContent: json.markers[i].icontext,
                   hintContent: json.markers[i].id,
                   balloonContentBody: json.markers[i].balloontext
               }, {
                   // Опции
                   draggable: true,
                   preset: json.markers[i].styleplacemark
               })
               );
               */

               var myPlacemark = new ymaps.Placemark([json.markers[i].lat,json.markers[i].lon], {
                    // Свойства
                    iconContent: json.markers[i].icontext,
                    hintContent: json.markers[i].hinttext,
                    balloonContentBody: json.markers[i].balloontext
                 }
                , {
                    // Опции
                       draggable: true,
                       iconLayout: 'default#image',
                       iconImageHref: json.markers[i].icon,
                       iconImageSize: [30, 30],
            //           iconImageOffset: [-5, -38],

           //
                   // Своё изображение иконки метки.
         //          iconImageHref: 'images/myIcon.gif',
                   // Размеры метки.
          //         iconImageSize: [30, 42],
                   // Смещение левого верхнего угла иконки относительно
                   // её "ножки" (точки привязки).
           //        iconImageOffset: [-5, -38],
                  preset: json.markers[i].icon
                });

               // Добавляем метку на карту

                   map.geoObjects.add(myPlacemark);

            }


        });

        map.geoObjects.events.add('dragstart', function (e) {
            $('#menu').remove();
            $('#menu2').remove();
      //  alert('Дошло до коллекции объектов карты');
        // Получение ссылки на дочерний объект, на котором произошло событие.
        var object = e.get('target');
       // var f = object.geometry.getCoordinates();
       //Placemark {geometry: PointGeometry, properties: DataManager, state: DataManager, options: Object, events: EventManager…}
         var z = object.geometry.getCoordinates();
            object.events.add('dragend', function () {
                var t = object.geometry.getCoordinates();
                console.log([t[0], t[1]]);
                $("#res").load("php/changemetk.php", {lat: z[0], lon: z[1], lat2: t[0], lon2: t[1]});
            });

   //      var data = object.properties.get("hintContent");
        console.log([z[0], z[1]]);
   //         console.log(data);
    });





    map.geoObjects.events.add('contextmenu', function (e) {
        var myPlacemark = e.get('target');
        var del = myPlacemark.geometry.getCoordinates();
        $('#menu').remove();

        if ($('#menu2').css('display') == 'block') {
            $('#menu2').remove();
        } else {
            // HTML-содержимое контекстного меню.
            var menuContent =
                '<div id="menu2">\
                <div align="center"><input type="submit" class="btn btn-danger" value="Удалить" /></div>\
                </div>';

            // Размещаем контекстное меню на странице
            $('body').append(menuContent);
            // Задаем позицию меню.
            $('#menu2').css({
                left: e.get('pagePixels')[0],
                top: e.get('pagePixels')[1]
            });

            $('#menu2 input[type="submit"]').click(function () {
                console.log("нажал");
                console.log("удаление метки", [del[0], del[1]]);
                $.ajax({
                    type: 'POST',
                    url:'php/delmetki.php',
                    data:{'lat': del[0], 'lon': del[1]}
                });
                map.geoObjects.remove(myPlacemark);
                $('#menu2').remove();
            });
        }


            //   var result = confirm('Действительно удалить из базы?');
            //    if (result) {

      //  map.myCollect.remove(myPlacemark);

     //   map.geoObjects.myCollect.remove(myPlacemark);

    });




   map.events.add('contextmenu', function (e) {
        $('#menu').remove();
      //  $('#menu2').remove();
    });
    map.events.add('wheel', function (e) {
        $('#menu').remove();
        $('#menu2').remove();
    });

    map.events.add('click', function (e) {
        $('#menu').remove();
        $('#menu2').remove();
        var inCooords  = e.get('coords');
        //     var inX = inCooords[1];
        //    var inY = inCooords[0];
    //    console.log(inX);
    //    console.log(inY);
    //    var zloX = chetX(inX);
    //    var zloY = chetY(inY);
       var zloXY = perechetXY(inCooords);
    //    console.log(zloX);
    //    console.log(zloY);
    //    console.log(inCooords);
          console.log(zloXY);
     //   console.log(document.cookie);
    //    var Center = this.map.getCenter();
    //    console.log(Center);

    });
    $( function() {
        $('#minimap').css('display');
        var mini =
            '<div id="minimap" class="ui-widget-content">\
            </div>';
        $('body').append(mini);
        // Задаем позицию меню.
        $('#minimap').css({
            left: 10,
            top: 10
        });
        $(function () {
           /*
            $('#minimap').resizable({
                maxHeight: 200,
                maxWidth: 200,
                minHeight: 200,
                minWidth: 200
            });
     */
            $('#minimap').draggable({containment: "#map", scroll: false});
        });

        $("#minimap").dblclick(function (e) {
            var offset = $(this).offset();
            var minimapX = (e.pageX - offset.left);
            var minimapY = (e.pageY - offset.top);
            var mapX = ((((minimapX + 150) / 1.5) * (-1)) + 200) * (-1);
            var mapY = (((minimapY + 150) / 1.5) * (-1)) + 200;
            console.log("miniX: " + minimapX + "  miniY: " + minimapY);
            console.log("maxX: " + mapX + "  maxY: " + mapY);
            map.setCenter([mapY, mapX]);
        });
      //  <button id="but">Миникарта</button>
    });


   map.events.add('actiontick', function (e) {
       $('#menu').remove();
      $('#menu2').remove();
    });

         //Отслеживаем событие клик левой кнопкой мыши на карте
    map.events.add('dblclick', function (e) {

        $('#menu2').remove();
        var coords = e.get('coords');
      //  map.setCenter(coords);
       var c;
       var d;
   //   var inf = e.get('pagePixels');
       var shir = $(window).width(); //Определяет ширину браузера, но только при наличии jQuery.
       var visot = $(window).height();
       var a = e.get('pagePixels')[0];
       var b = e.get('pagePixels')[1];
   //     console.log(inf);
   //     console.log(shir, visot);
        if (a > shir-200) {
            c = a-200
        } else {
            c = a
        }
        if (b > visot-300) {
            d = b-300
        } else {
            d = b
        }
     //   console.log(c, d);


        if ($('#menu').css('display') == 'block') {
            $('#menu').remove();
        } else {
            // HTML-содержимое контекстного меню.
            var menuContent =
                '<div align="center" id="menu">\
                    <ul id="menu_list">\
                    <div align="center">\
		 <select name="image" id="image" class="span2">\
         <option data-path="images/Flag_Blue.png" value="images/Flag_Blue.png">Синий</option>\
         <option data-path="images/Flag_Green.png" value="images/Flag_Green.png">Зеленый</option>\
         <option data-path="images/Flag_Red.png" value="images/Flag_Red.png">Красный</option>\
         <option data-path="images/rt.png" value="images/rt.png">Всадник</option>\
         <option data-path="images/house.png" value="images/house.png">Дом</option>\
         <option data-path="images/taverna.png" value="images/taverna.png">Деревня</option>\
         <option data-path="images/zam.png" value="images/zam.png">Замок</option>\
         <option data-path="images/mel.png" value="images/mel.png">Мельница</option>\
         <option data-path="images/shahta.png" value="images/shahta.png">Шахта</option>\
         <option data-path="images/shahta-zol.png" value="images/shahta-zol.png">Шахта Зол.</option>\
         <option data-path="images/tree.png" value="images/tree.png">Дерево</option>\
         <option data-path="images/horse.png" value="images/horse.png">Лошадь</option>\
         <option data-path="images/question.png" value="images/question.png">Вопрос</option>\
         </select></ul>\
         <span class="add-on"><img src="images/Flag_Blue.png" style="height: 40px"></span>\
                <ul id="menu_list">\
                        <li><input type="text" name="icon_text" placeholder="Название"></li>\
                        <li><input type="text" name="hint_text" placeholder="Подсказка"></li>\
                        <li><input type="text" name="balloon_text" placeholder="Описание"></li></ul>\
                <div align="center"><input type="submit" class="btn btn-success btn-xs" value="Сохранить" /></div>\
                </div>';
            $('body').append(menuContent);

            $('#image').change(function(){
                $('.add-on').find('img:first').attr('src', $('#image option:selected').attr('data-path'));
            });

            // Задаем позицию меню.
            $('#menu').css({
               left: c,
               top: d
           });


            // Заполняем поля контекстного меню текущими значениями свойств метки.
            //         $('#menu input[name="icon_text"]').val(myPlacemark.properties.get('iconContent'));
            //         $('#menu input[name="hint_text"]').val(myPlacemark.properties.get('hintContent'));
            //         $('#menu input[name="balloon_text"]').val(myPlacemark.properties.get('balloonContent'));

            // При нажатии на кнопку "Сохранить" изменяем свойства метки
            // значениями, введенными в форме контекстного меню.
            //<button type="button" class="btn btn-primary btn-xs">XSmall</button>
            $('#menu input[type="submit"]').click(function () {
         //       console.log("нажал-создал");

                var iconText = $('input[name="icon_text"]').val(),
                    hintText = $('input[name="hint_text"]').val(),
                    balloonText = $('input[name="balloon_text"]').val(),
                    image = $('select[name="image"] option:selected').val();
               //     image = $('input[name="image"]').val();
              //  image = $('select[@name=image] option:selected').text();

                var myPlacemark = new ymaps.Placemark(coords, {
                    iconContent: iconText,
                    hintContent: hintText,
                    balloonContent: balloonText
                },
                    {
                        draggable: true,
                        iconLayout: 'default#image',
                        iconImageHref: image,
                        iconImageSize: [30, 30]

                    });
            //   myPlacemark.properties.set({});




                $('#menu').remove();
                $("#res").load("php/addmetki.php", {icontext: iconText, hinttext : hintText, balloontext : balloonText, icon : image, lat : coords[0], lon : coords[1]});
                map.geoObjects.add(myPlacemark);
                // Удаляем контекстное меню.

            });
/*
            $("#menu").click(function(e) {
                var offset = $(this).offset();
                var relativeX = (e.pageX - offset.left);
                var relativeY = (e.pageY - offset.top);

                console.log("X: " + relativeX + "  Y: " + relativeY);
            });
*/
        }





   /*     var myPlacemark = new ymaps.Placemark(coords,
            {hintContent: "Метка"},
            {draggable: true,
                // Необходимо указать данный тип макета.
                iconLayout: 'default#image',
                // Своё изображение иконки метки.
                iconImageHref: 'images/myIcon.gif',
                // Размеры метки.
                iconImageSize: [30, 42],
                // Смещение левого верхнего угла иконки относительно
                // её "ножки" (точки привязки).
                iconImageOffset: [-5, -38]
            });
    */
       // var t = myPlacemark.geometry.getCoordinates();
/*
       myPlacemark.events.add('dragstart', function () {
            var z = myPlacemark.geometry.getCoordinates();

           myPlacemark.events.add('dragend', function () {
               var t = myPlacemark.geometry.getCoordinates();
               console.log([t[0], t[1]]);
               $("#res").load("changemetk.php", {lat: z[0], lon: z[1], lat2: t[0], lon2: t[1]});
            });
            console.log([z[0], z[1]]);
         });
       */


    //    Del(myPlacemark);
        });

    /*
    map.events.add('click', function (e) {
        var coords = e.get('coords');
        var myPlacemark = new ymaps.Placemark(coords, {
                // Свойства
                iconContent: "название",
                hintContent: "хинт",
                balloonContentBody: "балун"
            }
            , {
                // Опции
                draggable: true
            });
        map.geoObjects.add(myPlacemark);
    });
*/

/*
    map.events.add('contextmenu', function (e) {
        if (!map.balloon.isOpen()) {
            var coords = e.get('coords');
            map.balloon.open(coords, {
                contentBody: '<div id="menu">\
                             <div id="menu_list">\
                                <label>Название:</label> <input type="text" class="input-medium" name="icon_text" /><br />\
                                 <label>Подсказка:</label> <input type="text" class="input-medium" name="hint_text" /><br />\
                                 <label>Балун:</label> <input type="text" class="input-medium" name="balloon_text" /><br />\
								 <div class="control-group"><label>Значок метки:</label>\
								 <div class="input-prepend"><span class="add-on"><img src="images/myIcon.gif" style="height: 20px" /></span>\
								 <select name="image" id="image" class="span2" >\
<option data-path="images/myIcon.gif" value="twirl#blueIcon">twirl#blueIcon</option>\
</select></div>\
                             </div></div>\
                             <input type="submit" value="Сохранить" /></div>\
                         </div>'});
      //  <button type="submit" class="btn btn-success">Сохранить</button>\


            var myPlacemark = new ymaps.Placemark(coords);

            //Добавляем картинку при выборе опции select
            $('#image').change(function(){
                $('.add-on').find('img:first').attr('src', $('#image option:selected').attr('data-path'));
            });


            //Сохраняем данные из формы
        //    $('#menu button[type="submit"]').click(function () {
            $('#menu input[type="submit"]').click(function () {
                alert('кнопка нажата3');
                var iconText = $('input[name="icon_text"]').val(),
                    hintText = $('input[name="hint_text"]').val(),
                    balloonText = $('input[name="balloon_text"]').val();
                 //   stylePlacemark = $('select[@name=image] option:selected').text();

                //Передаем параметры метки скрипту addmetki.php для записи в базу данных
           //     $("#res").load("addmetki.php", {icontext: iconText, hinttext : hintText, balloontext : balloonText, styleplacemark : stylePlacemark, lat : coords[0].toPrecision(6), lon : coords[1].toPrecision(6)});
                console.log("кнопка нажата");
                //Добавляем метку на карту
          //      myMap.geoObjects.add(myPlacemark);

                //Изменяем свойства метки и балуна
                myPlacemark.properties.set({
                    iconContent: iconText,
                    hintContent: hintText,
                    balloonContent: balloonText
                });

                //Устанавливаем стиль значка метки
                myPlacemark.options.set({
                    preset: stylePlacemark
                });
                $('#menu').remove();
                //Закрываем балун
                map.balloon.close();
            });


        } else {
            console.log("кнопка нажата2");
            map.balloon.close();
        }
    });

*/

/*
    map.events.add('contextmenu', function (e) {
        // Если меню метки уже отображено, то убираем его.
        if ($('#menu').css('display') == 'block') {
            $('#menu').remove();
        } else {
            // HTML-содержимое контекстного меню.
            var menuContent =
                '<div id="menu">\
                    <ul id="menu_list">\
                        <li>Название: <br /> <input type="text" name="icon_text" /></li>\
                        <li>Подсказка: <br /> <input type="text" name="hint_text" /></li>\
                        <li>Балун: <br /> <input type="text" name="balloon_text" /></li>\
         <div class="control-group"><label>Значок метки:</label>\
		 <div class="input-prepend"><span class="add-on"><img src="images/myIcon.gif" style="height: 20px" /></span>\
		 <select name="image" id="image" class="span2" >\
         <option data-path="images/myIcon.gif" value="twirl#myIcon">Шахта "железо"</option>\
         <option data-path="images/house.png" value="twirl#houseIcon">Дом</option>\
         </select>\
                    </ul>\
                <div align="center"><input type="submit" value="Сохранить" /></div>\
                </div>';

            // Размещаем контекстное меню на странице
            $('body').append(menuContent);

            $('#image').change(function(){
                $('.add-on').find('img:first').attr('src', $('#image option:selected').attr('data-path'));
            });

            // Задаем позицию меню.
            $('#menu').css({
                left: e.get('pagePixels')[0],
                top: e.get('pagePixels')[1]
            });

            // Заполняем поля контекстного меню текущими значениями свойств метки.
   //         $('#menu input[name="icon_text"]').val(myPlacemark.properties.get('iconContent'));
   //         $('#menu input[name="hint_text"]').val(myPlacemark.properties.get('hintContent'));
   //         $('#menu input[name="balloon_text"]').val(myPlacemark.properties.get('balloonContent'));

            // При нажатии на кнопку "Сохранить" изменяем свойства метки
            // значениями, введенными в форме контекстного меню.
            $('#menu input[type="submit"]').click(function () {
                console.log("нажал");
   //             myPlacemark.properties.set({
   //                 iconContent: $('input[name="icon_text"]').val(),
  //                  hintContent: $('input[name="hint_text"]').val(),
  //                  balloonContent: $('input[name="balloon_text"]').val()
  //              });
                // Удаляем контекстное меню.
                $('#menu').remove();
            });
        }
    });

*/







   }















 /*
   function Del (myPlacemark) {
 myPlacemark.events.add('contextmenu', function () {
 var del = myPlacemark.geometry.getCoordinates();
 console.log("удаление метки", [del[0], del[1]]);
 //   var result = confirm('Действительно удалить из базы?');
 //    if (result) {

 $.ajax({
 type: 'POST',
 url:'delmetki.php',
 data:{'lat': del[0], 'lon': del[1]}
 });
 map.geoObjects.remove(myPlacemark);

 });
}
*/

function inf () {

    map.events.add('boundschange', function (e) {
        var boundschange = map.getZoom();
        console.log(boundschange);


        //   map.events.fire('sizeboundschange', {
        //       oldBounds: e.get('oldBounds'),
        //       newBounds: e.get('newBounds')

    });
}

function chetX (x) {
 return (x+100)/2
    }
function chetY (y) {
    return (((y+100)/2)*(-1))+100
}

function perechetXY (crd) {
    var x = crd[1];
    var y = crd[0];
    var zlX = (x+100)/2;
    var zlY = (((y+100)/2)*(-1))+100;
    return [zlX, zlY]
}

/*
$("#menu").click(function(e) {
    var offset = $(this).offset();
    var relativeX = (e.pageX - offset.left);
    var relativeY = (e.pageY - offset.top);

    console.log("X: " + relativeX + "  Y: " + relativeY);
});
*/

/*
$(document).ready(function(){
    $('.div_hover').click(function(e){
        // положение элемента
        var pos = $(this).offset();
        var elem_left = pos.left;
        var elem_top = pos.top;
        // положение курсора внутри элемента
        var Xinner = e.pageX - elem_left;
        var Yinner = e.pageY - elem_top;
        console.log("X: " + Xinner + " Y: " + Yinner); // вывод результата в консоль
    });
});
*/
/*
$(document).click(function(e){
    var X = e.pageX; // положения по оси X
    var Y = e.pageY; // положения по оси Y
    console.log("X: " + X + " Y: " + Y); // вывод результата в консоль
});
    */

/*
$( function() {
    $( "#resizable" ).resizable({
        maxHeight: 250,
        maxWidth: 350,
        minHeight: 150,
        minWidth: 200
    });
} );
    */