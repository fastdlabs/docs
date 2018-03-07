# Response processing

The FastD API returns responses to `json` because, primarily in the context of APIs, the business purpose can be achieved by customizing [Extensions] (zh-cn / 3.0 / 3-8-extend.md) if the features do not meet the business needs .

`` `php
namespace Http \ Controller;


use FastD \ Http \ ServerRequest;

class IndexController
{
     public function sayHello (ServerRequest $ request)
     {
         return json ([
             'foo' => 'bar'
         ]);
     }
}
`` `

json is a helper provided by the framework that can be accessed via `src / Support / helpers.php`.

Next section: [Authorization] (en-us / 3.0 / 2-4-authorization.md)