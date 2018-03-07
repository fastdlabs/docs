# API documentation

The [swagger] (https://github.com/zircote/swagger-php) documentation has been integrated into the FastD framework by default, and documents can be generated using just the following commands, or integrated into one central repository.

`` `php
php bin / console doc
`` `

The command will generate data according to the application name configured by app.php. Open the html file to access the document.

The way the document is processed by annotation is defined in the controller. For more details, go to [swagger getting started] (https://github.com/zircote/swagger-php/blob/master/docs/Getting-started. md)

### Note example:

##### Controller

`` `php
<? php
/ **
 * @author jan huang <bboyjanhuang@gmail.com>
 * @copyright 2016
 *
 * @link https://www.github.com/janhuang
 * @link http://www.fast-d.cn/
 * /

namespace Http \ Controller;

use FastD \ Http \ JsonResponse;
use FastD \ Http \ Response;
use FastD \ Http \ ServerRequest;

/ **
 *
 * @SWG \ Info (title = "Demo API", version = "0.1")
 *
 * Class IndexController
 * @package Http \ Controller
 * /
class IndexController
{
    / **
     * @SWG \ Get (
     * path = "/ foo / {name}",
     * summary = "Demo API Examples",
     * tags = {"demo"},
     * description = "sample description"
     * consumes = {"application / json", "application / xml"},
     * produces = {"application / json", "application / xml"},
     * @SWG \ Parameter (
     * name = "id",
     * in = "query",
     * description = "demo id",
     * required = false,
     * type = "integer",
     * @SWG \ Items (type = "integer", format = "int32"),
     * collectionFormat = "csv"
     *),
     * @SWG \ Parameter (
     * name = "status",
     * in = "query",
     * description = "demo status",
     * required = false,
     * type = "integer",
     * enum = {"available", "pending", "sold"}
     *),
     * @SWG \ Response (
     * response = 200,
     * description = "OK",
     * examples = {
     * "application / json": {
     * "id" = "1",
     * "status" = "1"
     *}
     *},
     * @SWG \ Schema (
     * type = "integer"
     *),
     * @SWG \ Schema (
     * type = "object",
     * @SWG \ Property (property = "error_code", type = "integer", format = "int32"),
     * @SWG \ Property (property = "error_message", type = "string")
     *)
     *),
     * @SWG \ Response (response = 400, description = "Bad Request", @SWG \ Schema (ref = "# / definitions / User"))
     * @SWG \ Response (response = 500, description = "Internal Server Error")
     *)
     *
     * @param $ request
     * @return Response
     * /
    public function welcome (ServerRequest $ request)
    {
        return json ([
            'foo' => 'bar'
        ]);
    }

    / **
     * @param ServerRequest $ request
     * @return JsonResponse
     * /
    public function sayHello (ServerRequest $ request)
    {
        return json ([
            'foo' => $ request-> getAttribute ('name'),
        ]);
    }

    / **
     * @param ServerRequest $ serverRequest
     * @return JsonResponse
     * /
    public function middleware (ServerRequest $ serverRequest)
    {
        return json ([
            'foo' => 'bar'
        ]);
    }

    / **
     * @return JsonResponse
     * /
    public function db ()
    {
        return json (
            database () -> info ()
        );
    }

    public function model ()
    {
        $ model = model ('demo');

        return json ([
            'model' => get_class ($ model),
            'db' => $ model-> getDatabase () -> info ()
        ]);
    }

    public function auth ()
    {
        return json ([
            'foo' => 'bar'
        ]);
    }
}
`` `

### model

`` `php
<? php
/ **
 * @author jan huang <bboyjanhuang@gmail.com>
 * @copyright 2016
 *
 * @link https://www.github.com/janhuang
 * @link http://www.fast-d.cn/
 * /

namespace Document


/ **
 * @SWG \ Definition (type = "object", @SWG \ Xml (name = "User"))
 * /
class User
{
    / **
     * @SWG \ Property (format = "int64")
     * @var int
     * /
    public $ id;

    / **
     * @SWG \ Property ()
     * @var string
     * /
    public $ username;

    / **
     * @SWG \ Property
     * @var string
     * /
    public $ firstName;

    / **
     * @SWG \ Property ()
     * @var string
     * /
    public $ lastName;

    / **
     * @var string
     * @SWG \ Property ()
     * /
    public $ email;

    / **
     * @var string
     * @SWG \ Property ()
     * /
    public $ password;

    / **
     * @var string
     * @SWG \ Property ()
     * /
    public $ phone;

    / **
     * User Status
     * @var int
     * @SWG \ Property (format = "int32")
     * /
    public $ userStatus;
}
`` `

It is worth noting that the ref in the Schema needs to be mapped into a data model, and this data model is recommended to be stored in the Document directory. For the wording, refer to the above code.

Effect:

[! [Effect] (en-us / 3.0 / doc.png)]

Next Section: [Application Configuration] (en-us / 3.0 / 3-1-configuration.md)