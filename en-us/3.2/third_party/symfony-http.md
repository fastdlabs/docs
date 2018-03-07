# Symfony HTTP Foundation

Both github and packagist have a large number of HTTP components, and fastd has started supporting Symfony HTTP Foundation components since 3.2.

Friends using this component are now ready to use without conversion, including guzzlehttp for seamless integration.

`` `php
<? php

namespace Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
     public function sayHello (ServerRequest $ request)
     {
         return new \ Symfony \ Component \ HttpFoundation \ Response ('hello');
     }
}
`` `