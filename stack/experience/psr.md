
# PSR

PSR 是 PHP Standard Recommendations 的简写，由 PHP FIG 组织制定的 PHP 规范，是 PHP 开发的实践标准。

PHP FIG，FIG 是 Framework Interoperability Group（框架可互用性小组）的缩写，由几位开源框架的开发者成立于 2009 年，从那开始也选取了很多其他成员进来（包括但不限于 Laravel, Joomla, Drupal, Composer, Phalcon, Slim, Symfony, Zend Framework 等），虽然不是「官方」组织，但也代表了大部分的 PHP 社区。

项目的目的在于：通过框架作者或者框架的代表之间讨论，以最低程度的限制，制定一个协作标准，各个框架遵循统一的编码规范，避免各家自行发展的风格阻碍了 PHP 的发展，解决这个程序设计师由来已久的困扰。

目前已表决通过了 6 套标准，已经得到大部分 PHP 框架的支持和认可。

本项目的主要面向对象是所有参与的各个成员（也就是各自框架的社区），这里是完整的 成员列表，当然，同时也欢迎其它 PHP 社区采用本规范。

此中文翻译由 @Summer 维护，主要针对「已通过」的 PSR 进行翻译，排版遵照 中文文案排版指北，更多讨论请前往 PHPHub。

## PSR 列表
<table>
  <thead>
    <tr>
      <th>Status</th>
      <th style="text-align: center">Num</th>
      <th>Title</th>
      <th>Editor(s)</th>
      <th>Coordinator</th>
      <th>Sponsor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>X</td>
      <td style="text-align: center">0</td>
      <td><a href="/psr/psr-0/">Autoloading Standard</a></td>
      <td>Matthew Weier O’Phinney</td>
      <td><em>N/A</em></td>
      <td><em>N/A</em></td>
    </tr>
    <tr>
      <td>A</td>
      <td style="text-align: center">1</td>
      <td><a href="/psr/psr-1/">Basic Coding Standard</a></td>
      <td>Paul M. Jones</td>
      <td><em>N/A</em></td>
      <td><em>N/A</em></td>
    </tr>
    <tr>
      <td>A</td>
      <td style="text-align: center">2</td>
      <td><a href="/psr/psr-2/">Coding Style Guide</a></td>
      <td>Paul M. Jones</td>
      <td><em>N/A</em></td>
      <td><em>N/A</em></td>
    </tr>
    <tr>
      <td>A</td>
      <td style="text-align: center">3</td>
      <td><a href="/psr/psr-3/">Logger Interface</a></td>
      <td>Jordi Boggiano</td>
      <td><em>N/A</em></td>
      <td><em>N/A</em></td>
    </tr>
    <tr>
      <td>A</td>
      <td style="text-align: center">4</td>
      <td><a href="/psr/psr-4/">Autoloading Standard</a></td>
      <td>Paul M. Jones</td>
      <td>Phil Sturgeon</td>
      <td>Larry Garfield</td>
    </tr>
    <tr>
      <td>D</td>
      <td style="text-align: center">5</td>
      <td><a href="https://github.com/phpDocumentor/fig-standards/tree/master/proposed">PHPDoc Standard</a></td>
      <td>Mike van Riel</td>
      <td>Vacant</td>
      <td>Vacant</td>
    </tr>
    <tr>
      <td>A</td>
      <td style="text-align: center">6</td>
      <td><a href="/psr/psr-6/">Caching Interface</a></td>
      <td>Larry Garfield</td>
      <td>Paul Dragoonis</td>
      <td>Robert Hafner</td>
    </tr>
    <tr>
      <td>A</td>
      <td style="text-align: center">7</td>
      <td><a href="/psr/psr-7/">HTTP Message Interface</a></td>
      <td>Matthew Weier O’Phinney</td>
      <td>Beau Simensen</td>
      <td>Paul M. Jones</td>
    </tr>
    <tr>
      <td>D</td>
      <td style="text-align: center">8</td>
      <td><a href="https://github.com/php-fig/fig-standards/blob/master/proposed/psr-8-hug">Huggable Interface</a></td>
      <td>Larry Garfield</td>
      <td>Vacant</td>
      <td>Vacant</td>
    </tr>
    <tr>
      <td>D</td>
      <td style="text-align: center">9</td>
      <td><a href="https://github.com/php-fig/fig-standards/blob/master/proposed/security-disclosure-publication.md">Security Advisories</a></td>
      <td>Michael Hess</td>
      <td>Korvin Szanto</td>
      <td>Larry Garfield</td>
    </tr>
    <tr>
      <td>D</td>
      <td style="text-align: center">10</td>
      <td><a href="https://github.com/php-fig/fig-standards/blob/master/proposed/security-reporting-process.md">Security Reporting Process</a></td>
      <td>Michael Hess</td>
      <td>Larry Garfield</td>
      <td>Korvin Szanto</td>
    </tr>
    <tr>
      <td>A</td>
      <td style="text-align: center">11</td>
      <td><a href="/psr/psr-11/">Container Interface</a></td>
      <td>Matthieu Napoli, David Négrier</td>
      <td>Matthew Weier O’Phinney</td>
      <td>Korvin Szanto</td>
    </tr>
    <tr>
      <td>D</td>
      <td style="text-align: center">12</td>
      <td><a href="https://github.com/php-fig/fig-standards/blob/master/proposed/extended-coding-style-guide.md">Extended Coding Style Guide</a></td>
      <td>Korvin Szanto</td>
      <td>Alexander Makarov</td>
      <td>Robert Deutz</td>
    </tr>
    <tr>
      <td>A</td>
      <td style="text-align: center">13</td>
      <td><a href="/psr/psr-13/">Hypermedia Links</a></td>
      <td>Larry Garfield</td>
      <td>Matthew Weier O’Phinney</td>
      <td>Marc Alexander</td>
    </tr>
    <tr>
      <td>D</td>
      <td style="text-align: center">14</td>
      <td><a href="https://github.com/php-fig/fig-standards/blob/master/proposed/event-manager.md">Event Manager</a></td>
      <td>Chuck Reeves</td>
      <td>Brian Retterer</td>
      <td>Roman Tsiupa</td>
    </tr>
    <tr>
      <td>D</td>
      <td style="text-align: center">15</td>
      <td><a href="https://github.com/php-fig/fig-standards/blob/master/proposed/http-middleware">HTTP Middlewares</a></td>
      <td>Woody Gilk</td>
      <td>Paul M Jones</td>
      <td>Jason Coward</td>
    </tr>
    <tr>
      <td>A</td>
      <td style="text-align: center">16</td>
      <td><a href="/psr/psr-16/">Simple Cache</a></td>
      <td>Paul Dragoonis</td>
      <td>Jordi Boggiano</td>
      <td>Fabien Potencier</td>
    </tr>
    <tr>
      <td>D</td>
      <td style="text-align: center">17</td>
      <td><a href="https://github.com/php-fig/fig-standards/tree/master/proposed/http-factory">HTTP Factories</a></td>
      <td>Woody Gilk</td>
      <td>Roman Tsiupa</td>
      <td>Paul M Jones</td>
    </tr>
  </tbody>
</table>

### 已实现PSR的组件

#### PSR3

* [monolog](https://github.com/Seldaek/monolog)

#### PSR4

* [Psr4Autoload](https://github.com/keradus/Psr4Autoloader)

