'use strict';

require('dotenv').config();
var Crawler = require("crawler");
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const userAgent = [
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:51.0) Gecko/20100101 Firefox/51.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ServiceUI 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393'
];

var crawlerOptions = function (url) {
    return {
        url: url,
        rotateUA: true,
        userAgent: userAgent
    };
};

var trails = [];

var homepageCrawler = new Crawler({
    maxConnections: 10,
    rateLimit: 5000,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;

            $('.tablo1 a').each(function () {
                trails[$(this).text()] = {
                    name: $(this).text()
                };
                trailCrawler.queue(crawlerOptions($(this).attr('href')));
            });
        }

        done();
    }
});

var trailCrawler = new Crawler({
    maxConnections: 10,
    rateLimit: 5000,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            trails[$('#bloc-event-fiche').text()].city = $('#bloc-ville-valeur').text();
        }

        insertTrail(trails[$('#bloc-event-fiche').text()]);
        done();
    }
});

var insertTrail = function (trail) {
    connection.query('INSERT INTO trail SET ?', trail, function (error, results, fields) {
        if (error) throw error;
        console.log(trail);
    });
}

connection.query('TRUNCATE trail', function (error, results, fields) {
    if (error) throw error;
});

homepageCrawler.queue(crawlerOptions('http://www.jogging-plus.com/calendrier/trails/france/'));
