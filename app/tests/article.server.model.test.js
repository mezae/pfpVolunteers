// 'use strict';

// /**
//  * Module dependencies.
//  */
// var should = require('should'),
//     mongoose = require('mongoose'),
//     User = mongoose.model('User'),
//     Event = mongoose.model('Event');

// /**
//  * Globals
//  */
// var user, article;

// /**
//  * Unit tests
//  */
// describe('Event Model Unit Tests:', function() {
//     beforeEach(function(done) {
//         user = new User({
//             email: 'test@test.com',
//             username: 'ABC',
//             password: 'password',
//             children: 0,
//             teens: 0,
//             seniors: 0,
//             agency: 'A Better Chance',
//             contact: 'Howard Ratero'
//         });

//         user.save(function() {
//             article = new Event({
//                 track: 'ABCC001',
//                 name: 'Elmer Meza',
//                 age: 6,
//                 gender: 'M',
//                 gift: 'a patchwork elephant'
//             });

//             done();
//         });
//     });

//     describe('Method Save', function() {
//         it('should be able to save without problems', function(done) {
//             return article.save(function(err) {
//                 should.not.exist(err);
//                 done();
//             });
//         });

//         // it('should be able to show an error when try to save without title', function(done) {
//         //   article.title = '';

//         //   return article.save(function(err) {
//         //       should.exist(err);
//         //       done();
//         //   });
//         // });
//     });

//     afterEach(function(done) {
//         Event.remove().exec();
//         User.remove().exec();
//         done();
//     });
// });