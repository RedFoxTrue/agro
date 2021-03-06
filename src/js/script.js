'use strict';
    var slideShow = (function () {
      return function (selector, config) {
        var
          _slider = document.querySelector(selector), // основный элемент блока
          _sliderContainer = _slider.querySelector('.slider__items'), // контейнер для .slider-item
          _sliderItems = _slider.querySelectorAll('.slider__item'), // коллекция .slider-item
          _sliderControls = _slider.querySelectorAll('.slider__control'), // элементы управления
          _currentPosition = 0, // позиция левого активного элемента
          _transformValue = 0, // значение транфсофрмации .slider_wrapper
          _transformStep = 100, // величина шага (для трансформации)
          _itemsArray = [], // массив элементов
          _timerId,
          _indicatorItems,
          _indicatorIndex = 0,
          _indicatorIndexMax = _sliderItems.length - 1,
          _stepTouch = 50,
          _config = {
            isAutoplay: false, // автоматическая смена слайдов
            directionAutoplay: 'next', // направление смены слайдов
            delayAutoplay: 5000, // интервал между автоматической сменой слайдов
            isPauseOnHover: true // устанавливать ли паузу при поднесении курсора к слайдеру
          };

        // настройка конфигурации слайдера в зависимости от полученных ключей
        for (var key in config) {
          if (key in _config) {
            _config[key] = config[key];
          }
        }

        // наполнение массива _itemsArray
        for (var i = 0, length = _sliderItems.length; i < length; i++) {
          _itemsArray.push({ item: _sliderItems[i], position: i, transform: 0 });
        }

        // переменная position содержит методы с помощью которой можно получить минимальный и максимальный индекс элемента, а также соответствующему этому индексу позицию
        var position = {
          getItemIndex: function (mode) {
            var index = 0;
            for (var i = 0, length = _itemsArray.length; i < length; i++) {
              if ((_itemsArray[i].position < _itemsArray[index].position && mode === 'min') || (_itemsArray[i].position > _itemsArray[index].position && mode === 'max')) {
                index = i;
              }
            }
            return index;
          },
          getItemPosition: function (mode) {
            return _itemsArray[position.getItemIndex(mode)].position;
          }
        };

        // функция, выполняющая смену слайда в указанном направлении
        var _move = function (direction) {
          var nextItem, currentIndicator = _indicatorIndex;;
          if (direction === 'next') {
            _currentPosition++;
            if (_currentPosition > position.getItemPosition('max')) {
              nextItem = position.getItemIndex('min');
              _itemsArray[nextItem].position = position.getItemPosition('max') + 1;
              _itemsArray[nextItem].transform += _itemsArray.length * 100;
              _itemsArray[nextItem].item.style.transform = 'translateX(' + _itemsArray[nextItem].transform + '%)';
            }
            _transformValue -= _transformStep;
            _indicatorIndex = _indicatorIndex + 1;
            if (_indicatorIndex > _indicatorIndexMax) {
              _indicatorIndex = 0;
            }
          } else {
            _currentPosition--;
            if (_currentPosition < position.getItemPosition('min')) {
              nextItem = position.getItemIndex('max');
              _itemsArray[nextItem].position = position.getItemPosition('min') - 1;
              _itemsArray[nextItem].transform -= _itemsArray.length * 100;
              _itemsArray[nextItem].item.style.transform = 'translateX(' + _itemsArray[nextItem].transform + '%)';
            }
            _transformValue += _transformStep;
            _indicatorIndex = _indicatorIndex - 1;
            if (_indicatorIndex < 0) {
              _indicatorIndex = _indicatorIndexMax;
            }
          }
          _sliderContainer.style.transform = 'translateX(' + _transformValue + '%)';
          _indicatorItems[currentIndicator].classList.remove('active');
          _indicatorItems[_indicatorIndex].classList.add('active');
        };

        // функция, осуществляющая переход к слайду по его порядковому номеру
        var _moveTo = function (index) {
          var i = 0, direction = (index > _indicatorIndex) ? 'next' : 'prev';
          while (index !== _indicatorIndex && i <= _indicatorIndexMax) {
            _move(direction);
            i++;
          }
        };

        // функция для запуска автоматической смены слайдов через промежутки времени
        var _startAutoplay = function () {
          if (!_config.isAutoplay) {
            return;
          }
          _stopAutoplay();
          _timerId = setInterval(function () {
            _move(_config.directionAutoplay);
          }, _config.delayAutoplay);
        };

        // функция, отключающая автоматическую смену слайдов
        var _stopAutoplay = function () {
          clearInterval(_timerId);
        };

        // функция, добавляющая индикаторы к слайдеру
        var _addIndicators = function () {
          var indicatorsContainer = document.createElement('ol');
          indicatorsContainer.classList.add('slider__indicators');
          for (var i = 0, length = _sliderItems.length; i < length; i++) {
            var sliderIndicatorsItem = document.createElement('li');
            if (i === 0) {
              sliderIndicatorsItem.classList.add('active');
            }
            sliderIndicatorsItem.setAttribute("data-slide-to", i);
            indicatorsContainer.appendChild(sliderIndicatorsItem);
          }
          _slider.appendChild(indicatorsContainer);
          _indicatorItems = _slider.querySelectorAll('.slider__indicators > li')
        };

        var _isTouchDevice = function () {
          return !!('ontouchstart' in window || navigator.maxTouchPoints);
        };

        // функция, осуществляющая установку обработчиков для событий 
        var _setUpListeners = function () {
          var _startX = 0;
          if (_isTouchDevice()) {
            _slider.addEventListener('touchstart', function (e) {
              _startX = e.changedTouches[0].clientX;
              _startAutoplay();
            });
            _slider.addEventListener('touchend', function (e) {
              var
                _endX = e.changedTouches[0].clientX,
                _deltaX = _endX - _startX;
              if (_deltaX > _stepTouch) {
                _move('prev');
              } else if (_deltaX < -_stepTouch) {
                _move('next');
              }
              _startAutoplay();
            });
          } else {
            for (var i = 0, length = _sliderControls.length; i < length; i++) {
              _sliderControls[i].classList.add('slider__control_show');
            }
          }
          _slider.addEventListener('click', function (e) {
            if (e.target.classList.contains('slider__control')) {
              e.preventDefault();
              _move(e.target.classList.contains('slider__control_next') ? 'next' : 'prev');
              _startAutoplay();
            } else if (e.target.getAttribute('data-slide-to')) {
              e.preventDefault();
              _moveTo(parseInt(e.target.getAttribute('data-slide-to')));
              _startAutoplay();
            }
          });
          document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === "hidden") {
              _stopAutoplay();
            } else {
              _startAutoplay();
            }
          }, false);
          if (_config.isPauseOnHover && _config.isAutoplay) {
            _slider.addEventListener('mouseenter', function () {
              _stopAutoplay();
            });
            _slider.addEventListener('mouseleave', function () {
              _startAutoplay();
            });
          }
        };

        // добавляем индикаторы к слайдеру
        _addIndicators();
        // установливаем обработчики для событий
        _setUpListeners();
        // запускаем автоматическую смену слайдов, если установлен соответствующий ключ
        _startAutoplay();

        return {
          // метод слайдера для перехода к следующему слайду
          next: function () {
            _move('next');
          },
          // метод слайдера для перехода к предыдущему слайду          
          left: function () {
            _move('prev');
          },
          // метод отключающий автоматическую смену слайдов
          stop: function () {
            _config.isAutoplay = false;
            _stopAutoplay();
          },
          // метод запускающий автоматическую смену слайдов
          cycle: function () {
            _config.isAutoplay = true;
            _startAutoplay();
          }
        }
      }
    }());

    slideShow('.slider', {
      isAutoplay: true
    });


    

// MOДАЛЬНЫЕ ОКНА:
$('[data-modal=consultation]').on('click', function () {
   $('.overlay, #consultation').fadeIn();
});
$('.modal__close').on('click', function () {
      $('.overlay, #consultation, #thanks, #order').fadeOut()
});
$('[data-modal=thanks]').on('click', function () {
   $('#thanks').fadeIn();
});
$(".overlay").on('click', function (e) {
   if (e.target == this) $(".modal, .overlay").fadeOut('fast');
})
$('[data-modal=price]').on('click', function () {
   $('.overlay, #order').fadeIn();
});



//    СЛАЙДЕР PRODUCT 
$(document).ready(function(){
   $('.product__slider').slick({
   infinite: true,
   slidesToShow: 3,
   slidesToScroll: 3,
      prevArrow: '<button type="button" class="slick-prev"><img src="img/icons/prev_product.png" alt="prev"></button>',
      nextArrow: '<button type="button" class="slick-next"><img src="img/icons/next_product.png" alt="next"></button>',
      responsive: [
         {
            breakpoint: 1024,
            settings: {
            slidesToShow: 3,
            slidesToScroll: 2,
            infinite: true,
            }
         },
         {
            breakpoint: 600,
            settings: {
            slidesToShow: 2,
            slidesToScroll: 2
            }
         },
         {
            breakpoint: 480,
            settings: {
            slidesToShow: 1,
            slidesToScroll: 1
            }
         }
         // You can unslick at a given breakpoint now by adding:
         // settings: "unslick"
         // instead of a settings object
      ]
   });
//    СЛАЙДЕР НОВОСТЕЙ
   $('.leaf__slider').slick({
   dots: false,
   infinite: true,
   speed: 500,
   fade: true,
   cssEase: 'linear',
   prevArrow: '<button type="button" class="slick-prev"><img src="img/icons/prev_product.png" alt="prev"></button>',
   nextArrow: '<button type="button" class="slick-next"><img src="img/icons/next_product.png" alt="next"></button>'
   });
});





//    ПЛАВНАЯ ПРОКРУТКА И КНОПКА ВВЕРХ

$(window).scroll(function () {
   if ($(this).scrollTop() > 1000) {
      $('.pageup').fadeIn();
   } else {
      $('.pageup').fadeOut();
   }
});

//    ГАМБУРГЕР 

window.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.menu'),
    menuItem = document.querySelectorAll('.menu_item'),
    hamburger = document.querySelector('.hamburger');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('hamburger_active');
        menu.classList.toggle('menu_active');
    });

    menuItem.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.toggle('hamburger_active');
            menu.classList.toggle('menu_active');
        })
    })
})

//    ВАЛИДАЦИЯ ФОРМ

function validateForms(form) {
   $(form).validate({
   rules: {
      name: "required",
      phone: {
         required: true,
         minlength: 10
      },
      comment: {
         required: false
      }
   },
     messages: {
    name: "Будь-ласка, введiть своє iм’я",
    phone: {
      required: "Будь-ласка, введiть свiй номер телефона",
       phone: "Неправильно введенний номер телефона",
      minlength: jQuery.validator.format("Введите не меньше  {0} цифр")
    }
      }
});
};
validateForms('.feed-form');
validateForms('#order form');



