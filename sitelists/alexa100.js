'use strict';

// See samplesites.js for annotation of what each property does
module.exports = {
  concurrentRequests: 200, // More than number of sites being requested
  allSites: {
    requestHeaders: {
      "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0"
    }
  },
  sites: [
    {
      name: '101 Sites',
      expectedStatus: 200,
      requestUrl: [
        // Apart from the first site listed (linksilk.com), the other 100 sites were the top 100
        // sites by traffic listed by alexa.com on 21 September 2014
        // The troublesome sites have been pulled out into their own elements of the sites array
        // and been marked with the appropriate status. For example t.co will always return 404
        // and craigslist.org will redirect you based on your geo location which is based on
        // your IP address.
        'linksilk.com',
        'https://www.google.com',
        'https://www.facebook.com',
        'https://www.youtube.com',
        'https://www.yahoo.com',
        'http://www.baidu.com',
        'https://www.wikipedia.org',
        'https://twitter.com',
        'http://www.amazon.com',
        'https://www.linkedin.com',
        'http://www.qq.com',
        'https://taobao.com',
        'https://www.google.co.in',
        'https://live.com',
        'https://hao123.com',
        'https://sina.com.cn',
        'https://weibo.com',
        'https://yahoo.co.jp',
        'https://tmall.com',
        'http://www.yandex.ru',
        'http://www.sohu.com',
        'https://www.bing.com',
        'https://www.pinterest.com',
        'https://www.google.de',
        'https://wordpress.com',
        'https://vk.com',
        'http://www.ebay.com',
        'https://www.google.co.jp',
        'http://instagram.com',
        'https://www.google.co.uk',
        'https://www.google.fr',
        'https://www.360.cn',
        'https://www.apple.com',
        'http://www.msn.com',
        'https://www.google.com.br',
        'http://www.ask.com',
        'https://www.paypal.com/home',
        'https://www.soso.com',
        'https://www.tumblr.com',
        'https://www.xvideos.com',
        'https://mail.ru',
        'https://www.microsoft.com',
        'https://www.google.ru',
        'https://imgur.com',
        'https://www.google.it',
        'https://www.reddit.com',
        'https://www.google.es',
        'http://www.163.com',
        'https://www.imdb.com',
        'http://stackoverflow.com',
        'https://www.aliexpress.com',
        'https://www.go.com',
        'https://www.amazon.co.jp',
        'https://www.google.com.mx',
        'https://www.adcash.com/en/index.php',
        'https://www.alibaba.com',
        'https://xhamster.com',
        'https://www.fc2.com',
        'https://www.google.ca',
        'http://www.bbc.co.uk',
        'https://www.cnn.com',
        'https://wordpress.org',
        'https://www.people.com.cn',
        'https://www.adobe.com',
        'https://www.gmw.cn',
        'https://www.google.co.id',
        'http://www.espn.go.com',
        'http://www.huffingtonpost.com',
        'https://www.google.com.tr',
        'http://www.pornhub.com',
        'https://www.amazon.de',
        'https://kickass.to',
        'https://www.xinhuanet.com',
        'https://www.google.com.au',
        'https://www.godaddy.com',
        'https://www.google.pl',
        'https://www.ebay.de',
        'https://www.xnxx.com',
        'http://www.odnoklassniki.ru',
        'https://www.chinadaily.com.cn',
        'http://www.onclickads.net',
        'http://www.flipkart.com',
        'https://www.akamaihd.net',
        'http://themeforest.net',
        'https://www.dailymotion.com/us',
        'https://www.rakuten.co.jp',
        'https://www.uol.com.br',
        'https://thepiratebay.se',
        'https://www.about.com',
        'http://www.indiatimes.com',
        'https://www.google.com.hk',
        'https://vimeo.com',
        'https://www.tudou.com',
        'http://www.blogspot.in'
      ]
    },
    {
      name: 't.co',
      expectedStatus: 404,
      requestUrl: 'http://t.co'
    },
    {
      name: 'craigslist.org',
      expectedStatus: 301,
      requestUrl: 'http://www.craigslist.org'
    },
    {
      name: 'blogspot.com',
      expectedStatus: 302,
      requestUrl: 'http://www.blogspot.com'
    },
    {
      name: 'googleusercontent.com',
      expectedStatus: 404,
      requestUrl: 'https://www.googleusercontent.com',
    },
    {
      name: 'blogger.com',
      expectedStatus: 302,
      requestUrl: 'https://www.blogger.com'
    },
    {
      name: 'dailymail.co.uk',
      expectedStatus: 301,
      requestUrl: 'http://www.dailymail.co.uk'
    },
    {
      name: 'netflix.com',
      expectedStatus: 302,
      requestUrl: 'https://www.netflix.com'
    }
  ]
};
