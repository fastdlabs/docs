# 文件上传

框架中已经封装一个简单的文件上传对象，并且文件上传可以自由扩展，所以在操作上觉得不满足当前业务，可以自行对其进行扩展。

文件上传对象依赖 `FastD\Http\Request` 对象，因此在使用文件上传的时候，应该将对象注入到控制器、Services当中，在获取到对象之后，直接执行上传操作即可。

##### ＃上传 

```php
public function uploadAction(Request $request)
{
    $uploader = $request->getUploader();
    $files = [];
    if ($uploader->uploadTo($this->get('kernel')->getRootPath() . '/storage/files')) {
        $files = $uploader->getUploadedFiles();
    }

    return $this->render('system/files.twig', [
        'files' => $files
    ]);
}
```

文件上传成功后，通过 `getUploadedFile` 获取所有成功上传的文件，文件在上传的时候会生成一个唯一 `hash`，也就是说，如果已经上传过的文件，不会再重新上传多一张。

##### ＃扩展

