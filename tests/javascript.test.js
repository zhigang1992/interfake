/* globals describe, beforeEach, afterEach, it */
var assert = require('assert');
var request = require('request');
var Q = require('q');

request.defaults({
	json:true
});

var get = Q.denodeify(request.get);
var post = Q.denodeify(request.post);
var put = Q.denodeify(request.put);
var del = Q.denodeify(request.del);

// The thing we're testing
var Interfake = require('..');
var interfake;

describe('Interfake JavaScript API', function () {
	beforeEach(function () {
		interfake = new Interfake();
	});
	afterEach(function () {
		if (interfake) {
			interfake.stop();
		}
	});
	describe('#listen', function() {
		it('should should support a callback', function(done){
			interfake.listen(3000, done);
		});
	});
	describe('#createRoute()', function () {
		it('should create one GET endpoint', function (done) {
			interfake.createRoute({
				request: {
					url: '/test/it/out',
					method: 'get'
				},
				response: {
					code: 200,
					body: {
						hi: 'there'
					}
				}
			});
			interfake.listen(3000);

			request({ url : 'http://localhost:3000/test/it/out', json : true }, function (error, response, body) {
				assert.equal(response.statusCode, 200);
				assert.equal(body.hi, 'there');
				done();
			});
		});

		it('should create one GET endpoint which returns custom headers', function (done) {
			interfake.createRoute({
				request: {
					url: '/test',
					method: 'get'
				},
				response: {
					code: 200,
					body: {
						hi: 'there'
					},
					headers: {
						'X-Request-Type': 'test',
						'X-lol-TEST': 'bleep'
					}
				}
			});
			interfake.listen(3000);

			request({ url : 'http://localhost:3000/test', json : true }, function (error, response, body) {
				assert.equal(response.statusCode, 200);
				assert.equal(response.headers['x-request-type'], 'test');
				assert.equal(response.headers['x-lol-test'], 'bleep');
				assert.equal(response.headers['x-undef'], undefined);
				assert.equal(body.hi, 'there');
				done();
			});
		});

		it('should create a GET endpoint that accepts a query parameter', function (done) {
			// interfake = new Interfake();
			interfake.createRoute({
				request: {
					url: '/wantsQueryParameter',
					query: { query: '1234' },
					method: 'get'

				},
				response: {
					code: 200,
					body: {
						high: 'hoe'
					}
				}
			});
			interfake.listen(3000);

			request({ url : 'http://localhost:3000/wantsQueryParameter?query=1234', json : true }, function (error, response, body) {
				assert.equal(error, undefined);
				assert.equal(response.statusCode, 200);
				assert.equal(body.high, 'hoe');
				done();
			});
		});

		it('should create one GET endpoint accepting query parameters with different responses', function () {
			interfake.createRoute({
				request: {
					url: '/wantsQueryParameter',
					query: { query: '1234' },
					method: 'get'

				},
				response: {
					code: 200,
					body: {
						high: 'hoe'
					}
				}
			});
			interfake.createRoute({
				request: {
					url: '/wantsQueryParameter',
					query: { query: '5678', anotherQuery: '4321' },
					method: 'get'
				},
				response: {
					code: 200,
					body: {
						loan: 'shark'
					}
				}
			});
			interfake.listen(3000);

			return Q.all([get({url: 'http://localhost:3000/wantsQueryParameter?query=1234', json: true}),
					get({url: 'http://localhost:3000/wantsQueryParameter?anotherQuery=4321&query=5678', json: true}),
					get({url: 'http://localhost:3000/wantsQueryParameter', json: true})
			]).then(function (results) {
				assert.equal(results[0][0].statusCode, 200);
				assert.equal(results[0][1].high, 'hoe');
				assert.equal(results[1][0].statusCode, 200);
				assert.equal(results[1][1].loan, 'shark');
				assert.equal(results[2][0].statusCode, 404);
			});
		});

		it('should create one GET endpoint with a querystring in the url with different responses', function () {
			interfake.createRoute({
				request: {
					url: '/wantsQueryParameter?query=1234',
					method: 'get'
				},
				response: {
					code: 200,
					body: {
						high: 'hoe'
					}
				}
			});
			interfake.createRoute({
				request: {
					url: '/wantsQueryParameter?anotherQuery=5678',
					method: 'get'
				},
				response: {
					code: 200,
					body: {
						loan: 'shark'
					}
				}
			});
			interfake.listen(3000);

			return Q.all([get({url: 'http://localhost:3000/wantsQueryParameter?query=1234', json: true}),
					get({url: 'http://localhost:3000/wantsQueryParameter?anotherQuery=5678', json: true}),
					get({url: 'http://localhost:3000/wantsQueryParameter', json: true})
			]).then(function (results) {
				assert.equal(results[0][0].statusCode, 200);
				assert.equal(results[0][1].high, 'hoe');
				assert.equal(results[1][0].statusCode, 200);
				assert.equal(results[1][1].loan, 'shark');
				assert.equal(results[2][0].statusCode, 404);
			});
		});

		it('should create one GET endpoint accepting query parameters using the url and options', function () {
			interfake.createRoute({
				request: {
					url: '/wantsQueryParameter?query=1234',
					query: {
						page: 1
					},
					method: 'get'
				},
				response: {
					code: 200,
					body: {
						high: 'hoe'
					}
				}
			});
			interfake.createRoute({
				request: {
					url: '/wantsQueryParameter?query=1234',
					query: {
						page: 2
					},
					method: 'get'
				},
				response: {
					code: 200,
					body: {
						loan: 'shark'
					}
				}
			});
			interfake.listen(3000);

			return Q.all([get({url: 'http://localhost:3000/wantsQueryParameter?query=1234&page=1', json: true}),
					get({url: 'http://localhost:3000/wantsQueryParameter?query=1234&page=2', json: true}),
					get({url: 'http://localhost:3000/wantsQueryParameter', json: true})
			]).then(function (results) {
				assert.equal(results[0][0].statusCode, 200);
				assert.equal(results[0][1].high, 'hoe');
				assert.equal(results[1][0].statusCode, 200);
				assert.equal(results[1][1].loan, 'shark');
				assert.equal(results[2][0].statusCode, 404);
			});
		});

		it('should create three GET endpoints with different status codes', function (done) {
			interfake.createRoute({
				request: {
					url: '/test1',
					method: 'get'
				},
				response: {
					code: 200,
					body: {
						its: 'one'
					}
				}
			});
			interfake.createRoute({
				request: {
					url: '/test2',
					method: 'get'
				},
				response: {
					code: 300,
					body: {
						its: 'two'
					}
				}
			});
			interfake.createRoute({
				request: {
					url: '/test3',
					method: 'get'
				},
				response: {
					code: 500,
					body: {
						its: 'three'
					}
				}
			});
			interfake.listen(3000);

			Q.all([get({url:'http://localhost:3000/test1',json:true}), get({url:'http://localhost:3000/test2',json:true}), get({url:'http://localhost:3000/test3',json:true})])
				.then(function (results) {
					assert.equal(results[0][0].statusCode, 200);
					assert.equal(results[0][1].its, 'one');
					assert.equal(results[1][0].statusCode, 300);
					assert.equal(results[1][1].its, 'two');
					assert.equal(results[2][0].statusCode, 500);
					assert.equal(results[2][1].its, 'three');
					done();
				});
		});

		it('should create a dynamic endpoint', function (done) {
			interfake.createRoute({
				request: {
					url: '/dynamic',
					method: 'post'
				},
				response: {
					code: 201,
					body: {}
				},
				afterResponse: {
					endpoints: [
						{
							request: {
								url: '/dynamic/1',
								method: 'get'
							},
							response: {
								code:200,
								body: {}
							}
						}
					]
				}
			});
			interfake.listen(3000);

			get('http://localhost:3000/dynamic/1')
				.then(function (results) {
					assert.equal(results[0].statusCode, 404);
					return post('http://localhost:3000/dynamic');
				})
				.then(function (results) {
					assert.equal(results[0].statusCode, 201);
					return get('http://localhost:3000/dynamic/1');
				})
				.then(function (results) {
					assert.equal(results[0].statusCode, 200);
					done();
				})
				.done();
		});

		it('should create a dynamic endpoint within a dynamic endpoint', function (done) {
			interfake.createRoute({
				request: {
					url: '/dynamic',
					method: 'post'
				},
				response: {
					code: 201,
					body: {
						all:'done'
					}
				},
				afterResponse: {
					endpoints: [
						{
							request: {
								url: '/dynamic/1',
								method: 'get'
							},
							response: {
								code:200,
								body: {
									yes: 'indeedy'
								}
							}
						},
						{
							request: {
								url: '/dynamic/1',
								method: 'put'
							},
							response: {
								code:200,
								body: {}
							},
							afterResponse: {
								endpoints: [
									{
										request: {
											url: '/dynamic/1',
											method: 'get'
										},
										response: {
											code:200,
											body: {
												yes: 'indiddly'
											}
										}
									}
								]
							}
						}
					]
				}
			});
			interfake.listen(3000);

			get({url:'http://localhost:3000/dynamic/1', json:true})
				.then(function (results) {
					assert.equal(results[0].statusCode, 404);
					return post({url:'http://localhost:3000/dynamic', json:true});
				})
				.then(function (results) {
					assert.equal(results[0].statusCode, 201);
					assert.equal(results[1].all, 'done');
					return get({url:'http://localhost:3000/dynamic/1', json:true});
				})
				.then(function (results) {
					assert.equal(results[0].statusCode, 200);
					assert.equal(results[1].yes, 'indeedy');
					return put({url:'http://localhost:3000/dynamic/1', json:true});
				})
				.then(function (results) {
					assert.equal(results[0].statusCode, 200);
					return get({url:'http://localhost:3000/dynamic/1', json:true});
				})
				.then(function (results) {
					assert.equal(results[0].statusCode, 200);
					assert.equal(results[1].yes, 'indiddly');
					done();
				});
		});

		it('should return JSONP if requested', function (done) {
			interfake.createRoute({
				request: {
					url: '/stuff',
					method: 'get'
				},
				response: {
					code: 200,
					body: {
						stuff: 'hello'
					}
				}
			});
			interfake.listen(3000);

			get('http://localhost:3000/stuff?callback=yo')
				.then(function (results) {
					assert.equal('hello', 'yo(' + JSON.stringify({ stuff : 'hello' }) + ');');
					done();
				});

			request('http://localhost:3000/stuff?callback=yo', function (error, response, body) {
				assert.equal(body, 'yo(' + JSON.stringify({ stuff : 'hello' }) + ');');
				done();
			});
		});

		it('should create one GET endpoint with support for delaying the response', function (done) {
			var enoughTimeHasPassed = false;
			var _this = this;
			this.slow(500);
			interfake.createRoute({
				request: {
					url: '/test',
					method: 'get'
				},
				response: {
					code: 200,
					delay: 50,
					body: {
						hi: 'there'
					}
				}
			});
			interfake.listen(3000);
			setTimeout(function() {
				enoughTimeHasPassed = true;
			}, 50);
			request({ url : 'http://localhost:3000/test', json : true }, function (error, response, body) {
				assert.equal(response.statusCode, 200);
				assert.equal(body.hi, 'there');
				if(!enoughTimeHasPassed) {
					throw new Error('Response wasn\'t delay for long enough');
				}
				done();
			});
		});
		it('should create one GET endpoint with support for delaying the response with a delay range', function (done) {
			var enoughTimeHasPassed = false;
			var _this = this;
			var timeout;
			var tookTooLong = false;
			this.slow(500);
			interfake.createRoute({
				request: {
					url: '/test',
					method: 'get'
				},
				response: {
					code: 200,
					delay: '20..50',
					body: {
						hi: 'there'
					}
				}
			});
			interfake.listen(3000);
			setTimeout(function() {
				enoughTimeHasPassed = true;
			}, 20);
			timeout = setTimeout(function() {
				tookTooLong = true;
			}, 55);
			request({ url : 'http://localhost:3000/test', json : true }, function (error, response, body) {
				clearTimeout(timeout);
				if(!enoughTimeHasPassed) {
					throw new Error('Response wasn\'t delay for long enough');
				}
				if(tookTooLong) {
					throw new Error('Response was delayed for too long');
				}
				done();
			});
		});
	});
	
	// Testing the API root stuff
	describe('#Interfake({ path: [String] })', function () {
		it('should set the root path of the API', function (done) {
			interfake = new Interfake({path:'/api'});
			interfake.get('/endpoint').status(200).creates.get('/moar-endpoints');
			interfake.listen(3000);

			Q.all([get({url:'http://localhost:3000/api/endpoint',json:true}), get({url:'http://localhost:3000/endpoint',json:true})])
				.then(function (results) {
					assert.equal(results[0][0].statusCode, 200);
					assert.equal(results[1][0].statusCode, 404);
					return get('http://localhost:3000/api/endpoint');
				})
				.then(function (results) {
					assert.equal(results[0].statusCode, 200);
					return get('http://localhost:3000/api/moar-endpoints');
				})
				.then(function (results) {
					assert.equal(results[0].statusCode, 200);
					done();
				});
		});
	});
});
