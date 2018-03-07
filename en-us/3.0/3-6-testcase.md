# unit test

Unit testing relies on [testing] (https://github.com/JanHuang/testing) the underlying package Http Server Request object, and add `Faker` function.

`` `php
use FastD \ Test \ TestCase;


class IndexControllerTest extends TestCase
{
     public function testSayHello ()
     {
         $ request = $ this-> request ('GET', '/');

         $ response = $ this-> app-> handleRequest ($ request);

         $ this-> response ($ response, ['foo' => 'bar']);
     }
}
`` `

Unit testing try to simulate the Http request, matching the response to the proof of results to achieve the desired way to test.

Next: [Accessibility] (en-us / 3.0 / 3-7-helpers.md)